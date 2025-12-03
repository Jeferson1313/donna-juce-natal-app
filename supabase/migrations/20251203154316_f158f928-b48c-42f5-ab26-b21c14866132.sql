-- Add reservation date fields to products table
ALTER TABLE products
ADD COLUMN reservation_type text NOT NULL DEFAULT 'any_day',
ADD COLUMN reservation_date date;

-- Add check constraint to ensure reservation_date is set when type is specific_day
ALTER TABLE products
ADD CONSTRAINT check_reservation_date 
CHECK (
  (reservation_type = 'any_day' AND reservation_date IS NULL) OR
  (reservation_type = 'specific_day' AND reservation_date IS NOT NULL) OR
  (reservation_type = 'any_day' AND reservation_date IS NOT NULL)
);