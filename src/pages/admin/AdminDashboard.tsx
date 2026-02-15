import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderOpen, Image, Users, Mail } from 'lucide-react';

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [products, categories, gallery, clients, messages] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('gallery').select('id', { count: 'exact', head: true }),
        supabase.from('client_logos').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
      ]);

      setStats([
        { label: 'Products', value: products.count ?? 0, icon: Package, color: 'text-blue-500' },
        { label: 'Categories', value: categories.count ?? 0, icon: FolderOpen, color: 'text-green-500' },
        { label: 'Gallery Items', value: gallery.count ?? 0, icon: Image, color: 'text-purple-500' },
        { label: 'Clients', value: clients.count ?? 0, icon: Users, color: 'text-orange-500' },
        { label: 'Unread Messages', value: messages.count ?? 0, icon: Mail, color: 'text-sm-red' },
      ]);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>Welcome to Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Use the sidebar to manage your website content. You can add products, manage categories,
            upload gallery images, update client logos, read contact messages, and edit site settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
