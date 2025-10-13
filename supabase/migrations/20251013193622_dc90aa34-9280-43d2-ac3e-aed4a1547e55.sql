-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Criar função para mover ônibus automaticamente
-- SECURITY DEFINER permite que a função contorne as políticas RLS
CREATE OR REPLACE FUNCTION public.mover_onibus_automaticamente()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Coordenadas base (região central de exemplo)
  base_lat NUMERIC := -23.5505;
  base_lng NUMERIC := -46.6333;
  -- Raio de movimento (aproximadamente 0.01 = ~1km)
  movimento NUMERIC := 0.005;
BEGIN
  -- Atualiza a localização do ônibus com movimento aleatório
  UPDATE public.onibus
  SET 
    latitude = base_lat + (random() * movimento * 2 - movimento),
    longitude = base_lng + (random() * movimento * 2 - movimento),
    atualizado_em = now()
  WHERE nome = 'Ônibus Principal';
END;
$$;

-- Agendar execução da função a cada 30 segundos
SELECT cron.schedule(
  'mover-onibus-automaticamente',
  '*/30 * * * * *', -- A cada 30 segundos (formato: segundo minuto hora dia mês dia-da-semana)
  $$SELECT public.mover_onibus_automaticamente();$$
);