-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create carousel_slides table for editable carousel
CREATE TABLE public.carousel_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Public read access for active slides
CREATE POLICY "Anyone can view active carousel slides" 
ON public.carousel_slides 
FOR SELECT 
USING (is_active = true);

-- Admin table to control who can edit
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;

-- Only admins can see admin list
CREATE POLICY "Admins can view admin users"
ON public.admin_users
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admin policies for carousel_slides
CREATE POLICY "Admins can insert carousel slides"
ON public.carousel_slides
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update carousel slides"
ON public.carousel_slides
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete carousel slides"
ON public.carousel_slides
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Admins can view all slides (including inactive)
CREATE POLICY "Admins can view all carousel slides"
ON public.carousel_slides
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at on carousel_slides
CREATE TRIGGER update_carousel_slides_updated_at
BEFORE UPDATE ON public.carousel_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for carousel images
INSERT INTO storage.buckets (id, name, public) VALUES ('carousel-images', 'carousel-images', true);

-- Storage policies for carousel images
CREATE POLICY "Anyone can view carousel images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'carousel-images');

CREATE POLICY "Admins can upload carousel images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'carousel-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update carousel images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'carousel-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete carousel images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'carousel-images' AND public.is_admin(auth.uid()));

-- Insert default slides
INSERT INTO public.carousel_slides (title, subtitle, image_url, button_text, "order") VALUES
('Catálogo de Natal 2024', 'As melhores carnes para sua ceia de Natal', '/placeholder.svg', 'Ver Produtos', 0),
('Reserve Já!', 'Garanta seus produtos para o Natal', '/placeholder.svg', 'Fazer Reserva', 1);