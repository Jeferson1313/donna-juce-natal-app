-- Add availability_type column to products table
-- 'immediate' = disponível agora (comprar agora)
-- 'reservation' = só para reserva
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS availability_type text NOT NULL DEFAULT 'reservation';

-- Add a comment for clarity
COMMENT ON COLUMN public.products.availability_type IS 'Type of availability: immediate (buy now) or reservation (reserve only)';