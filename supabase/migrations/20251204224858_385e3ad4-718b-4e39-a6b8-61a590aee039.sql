-- Allow customers to update their own data (for address)
CREATE POLICY "Customers can update own data" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);