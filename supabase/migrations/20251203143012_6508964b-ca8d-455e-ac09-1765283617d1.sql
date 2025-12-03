-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  image_url TEXT,
  category TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access for available products
CREATE POLICY "Anyone can view available products" 
ON public.products 
FOR SELECT 
USING (is_available = true);

-- Admin policies for products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));