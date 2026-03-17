/**
 * Frontend API Client — Drop-in replacement for Supabase client
 * 
 * MIGRATION GUIDE:
 * After cloning to VPS, replace all `supabase` imports with this module.
 * 
 * Before: import { supabase } from '@/integrations/supabase/client';
 *         const { data } = await supabase.from('products').select('*');
 * 
 * After:  import { api } from '@/lib/apiClient';
 *         const data = await api.from('products').select();
 * 
 * This file provides a Supabase-like query builder that translates
 * to REST API calls against the Express backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// ── Token management ────────────────────────────────────────
let authToken: string | null = localStorage.getItem('auth_token');
let currentUser: { id: string; email: string } | null = null;
const authListeners: Set<(user: typeof currentUser) => void> = new Set();

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) h['Authorization'] = `Bearer ${authToken}`;
  return h;
}

// ── Table name mapping (kebab-case for URLs) ────────────────
const TABLE_URL_MAP: Record<string, string> = {
  about_page: 'about-page',
  client_logos: 'client-logos',
  contact_messages: 'contact-messages',
  hero_slides: 'hero-slides',
  product_images: 'product-images',
  product_variants: 'product-variants',
  product_variant_images: 'product-variant-images',
  quote_requests: 'quote-requests',
  seo_meta: 'seo-meta',
  site_settings: 'site-settings',
};

function tableUrl(table: string): string {
  return `${API_BASE}/${TABLE_URL_MAP[table] || table}`;
}

// ── Query Builder (mimics Supabase .from().select/insert/etc) ─
class QueryBuilder {
  private table: string;
  private _filters: Array<{ column: string; op: string; value: any }> = [];
  private _orderCol?: string;
  private _orderAsc = true;
  private _limitVal?: number;
  private _single = false;

  constructor(table: string) {
    this.table = table;
  }

  eq(column: string, value: any) {
    this._filters.push({ column, op: 'eq', value });
    return this;
  }

  neq(column: string, value: any) {
    this._filters.push({ column, op: 'neq', value });
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this._orderCol = column;
    this._orderAsc = opts?.ascending !== false;
    return this;
  }

  limit(n: number) {
    this._limitVal = n;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  private buildParams(): URLSearchParams {
    const p = new URLSearchParams();
    this._filters.forEach(f => p.append(`filter_${f.column}`, `${f.op}:${f.value}`));
    if (this._orderCol) p.set('order', `${this._orderCol}:${this._orderAsc ? 'asc' : 'desc'}`);
    if (this._limitVal) p.set('limit', String(this._limitVal));
    return p;
  }

  async select(columns?: string): Promise<{ data: any; error: any }> {
    try {
      const params = this.buildParams();
      if (columns) params.set('select', columns);
      const url = `${tableUrl(this.table)}?${params}`;
      const resp = await fetch(url, { headers: getHeaders() });
      if (!resp.ok) throw new Error(await resp.text());
      let data = await resp.json();

      // Client-side filtering (backend returns all, we filter here for compatibility)
      if (this._filters.length > 0) {
        data = data.filter((row: any) =>
          this._filters.every(f => {
            if (f.op === 'eq') return row[f.column] === f.value || String(row[f.column]) === String(f.value);
            if (f.op === 'neq') return row[f.column] !== f.value;
            return true;
          })
        );
      }

      // Client-side ordering
      if (this._orderCol) {
        const col = this._orderCol;
        const asc = this._orderAsc;
        data.sort((a: any, b: any) => {
          if (a[col] < b[col]) return asc ? -1 : 1;
          if (a[col] > b[col]) return asc ? 1 : -1;
          return 0;
        });
      }

      if (this._limitVal) data = data.slice(0, this._limitVal);
      if (this._single) return { data: data[0] || null, error: null };
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async insert(payload: any): Promise<{ data: any; error: any }> {
    try {
      // Handle public insert endpoints
      let url = tableUrl(this.table);
      const isPublicTable = ['contact_messages', 'quote_requests'].includes(this.table);
      if (isPublicTable && !authToken) {
        url = `${tableUrl(this.table)}/public`;
      }

      const resp = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async update(payload: any): Promise<{ data: any; error: any }> {
    try {
      const idFilter = this._filters.find(f => f.column === 'id');
      if (!idFilter) throw new Error('update() requires .eq("id", value)');
      const resp = await fetch(`${tableUrl(this.table)}/${idFilter.value}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async delete(): Promise<{ data: any; error: any }> {
    try {
      const idFilter = this._filters.find(f => f.column === 'id');
      if (!idFilter) throw new Error('delete() requires .eq("id", value)');
      const resp = await fetch(`${tableUrl(this.table)}/${idFilter.value}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!resp.ok) throw new Error(await resp.text());
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async upsert(payload: any): Promise<{ data: any; error: any }> {
    // For site_settings, use the POST endpoint which does upsert
    if (this.table === 'site_settings') {
      return this.insert(payload);
    }
    // Generic: try update, if not found, insert
    const idFilter = this._filters.find(f => f.column === 'id');
    if (idFilter) return this.update(payload);
    return this.insert(payload);
  }
}

// ── Storage adapter ─────────────────────────────────────────
function createStorageBucket(bucket: string) {
  return {
    async upload(filePath: string, file: File | Blob) {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch(`${API_BASE}/upload/${bucket}?path=${encodeURIComponent(filePath)}`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: formData,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Upload failed' }));
        return { data: null, error: { message: err.error || 'Upload failed' } };
      }
      const data = await resp.json();
      return { data, error: null };
    },
    getPublicUrl(filePath: string) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
      return { data: { publicUrl: `${baseUrl}/uploads/${bucket}/${filePath}` } };
    },
  };
}

// ── Auth adapter ────────────────────────────────────────────
const auth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        return { data: null, error: { message: err.error } };
      }
      const data = await resp.json();
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      authListeners.forEach(fn => fn(currentUser));
      return { data: { user: data.user, session: { access_token: data.token } }, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async signOut() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    authListeners.forEach(fn => fn(null));
  },

  async getSession() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    if (token && user) {
      authToken = token;
      currentUser = JSON.parse(user);
      // Validate token
      try {
        const resp = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) throw new Error('Token expired');
        return { data: { session: { access_token: token, user: currentUser } }, error: null };
      } catch {
        await auth.signOut();
      }
    }
    return { data: { session: null }, error: null };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const listener = (user: typeof currentUser) => {
      callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user, access_token: authToken } : null);
    };
    authListeners.add(listener);
    // Fire immediately with current state
    const user = localStorage.getItem('auth_user');
    if (user) listener(JSON.parse(user));
    else listener(null);

    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(listener),
        },
      },
    };
  },
};

// ── Main API object (drop-in replacement for supabase) ──────
export const api = {
  from: (table: string) => new QueryBuilder(table),
  storage: { from: (bucket: string) => createStorageBucket(bucket) },
  auth,
  // Realtime stub — not needed for self-hosted, no-op
  channel: (_name: string) => ({
    on: () => ({ subscribe: () => ({}) }),
  }),
  removeChannel: () => {},
};

// For backward compatibility — alias
export const supabase = api;
