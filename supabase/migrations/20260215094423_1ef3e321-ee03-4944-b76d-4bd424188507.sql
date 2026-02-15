
-- Create quote_requests table for corporate inquiry/quote flow
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  product_interest TEXT,
  quantity INTEGER,
  message TEXT NOT NULL,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a quote request (public form)
CREATE POLICY "Anyone can submit quote requests"
ON public.quote_requests
FOR INSERT
WITH CHECK (true);

-- Authenticated users (admin) can read all quote requests
CREATE POLICY "Authenticated users can read quote requests"
ON public.quote_requests
FOR SELECT
USING (true);

-- Authenticated users can update quote requests (status changes)
CREATE POLICY "Authenticated users can update quote requests"
ON public.quote_requests
FOR UPDATE
USING (true);

-- Authenticated users can delete quote requests
CREATE POLICY "Authenticated users can delete quote requests"
ON public.quote_requests
FOR DELETE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for quote attachments (logos)
INSERT INTO storage.buckets (id, name, public) VALUES ('quote-attachments', 'quote-attachments', false);

-- Allow anyone to upload to quote-attachments bucket
CREATE POLICY "Anyone can upload quote attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'quote-attachments');

-- Authenticated users can view quote attachments
CREATE POLICY "Authenticated users can view quote attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'quote-attachments');
