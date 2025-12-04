-- Add address field to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS address text;