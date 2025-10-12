-- Corrigir o search_path da função atualizar_timestamp_onibus usando CASCADE
DROP FUNCTION IF EXISTS public.atualizar_timestamp_onibus() CASCADE;

CREATE OR REPLACE FUNCTION public.atualizar_timestamp_onibus()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER trigger_atualizar_timestamp_onibus
BEFORE UPDATE ON public.onibus
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_timestamp_onibus();