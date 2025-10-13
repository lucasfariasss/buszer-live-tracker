-- Drop existing public write policies
DROP POLICY IF EXISTS "Permitir inserção pública de ônibus" ON public.onibus;
DROP POLICY IF EXISTS "Permitir atualização pública de ônibus" ON public.onibus;

-- Create restricted INSERT policy (requires authentication)
CREATE POLICY "Require authentication for bus inserts"
ON public.onibus
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Create restricted UPDATE policy (requires authentication)
CREATE POLICY "Require authentication for bus updates"
ON public.onibus
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Explicitly deny DELETE operations
CREATE POLICY "Deny all deletes on bus records"
ON public.onibus
FOR DELETE
TO public
USING (false);