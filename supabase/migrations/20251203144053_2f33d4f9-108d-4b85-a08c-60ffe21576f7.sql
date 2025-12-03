
-- Create customers table for client registration
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers can view their own data
CREATE POLICY "Customers can view own data"
ON public.customers
FOR SELECT
USING (auth.uid() = user_id);

-- Customers can insert their own data
CREATE POLICY "Customers can insert own data"
ON public.customers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all customers
CREATE POLICY "Admins can view all customers"
ON public.customers
FOR SELECT
USING (is_admin(auth.uid()));

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  pickup_date DATE,
  pickup_time TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Customers can view their own reservations
CREATE POLICY "Customers can view own reservations"
ON public.reservations
FOR SELECT
USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- Customers can create reservations
CREATE POLICY "Customers can create reservations"
ON public.reservations
FOR INSERT
WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- Admins can view all reservations
CREATE POLICY "Admins can view all reservations"
ON public.reservations
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update reservations
CREATE POLICY "Admins can update reservations"
ON public.reservations
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create reservation items table
CREATE TABLE public.reservation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'kg',
  price_at_time NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservation_items ENABLE ROW LEVEL SECURITY;

-- Customers can view their own reservation items
CREATE POLICY "Customers can view own reservation items"
ON public.reservation_items
FOR SELECT
USING (reservation_id IN (
  SELECT r.id FROM public.reservations r
  JOIN public.customers c ON r.customer_id = c.id
  WHERE c.user_id = auth.uid()
));

-- Customers can create reservation items
CREATE POLICY "Customers can insert own reservation items"
ON public.reservation_items
FOR INSERT
WITH CHECK (reservation_id IN (
  SELECT r.id FROM public.reservations r
  JOIN public.customers c ON r.customer_id = c.id
  WHERE c.user_id = auth.uid()
));

-- Admins can view all reservation items
CREATE POLICY "Admins can view all reservation items"
ON public.reservation_items
FOR SELECT
USING (is_admin(auth.uid()));

-- Add trigger for updated_at on reservations
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert admin user (you'll need to sign up first, then I'll add to admin_users)
