-- Cancelar o cron job antigo de 30 segundos
SELECT cron.unschedule('mover-onibus-automaticamente');

-- Atualizar função para movimento maior e mais perceptível
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
  -- Raio de movimento aumentado para ser bem perceptível (0.02 = ~2km)
  movimento NUMERIC := 0.02;
BEGIN
  -- Atualiza a localização do ônibus com movimento aleatório maior
  UPDATE public.onibus
  SET 
    latitude = base_lat + (random() * movimento * 2 - movimento),
    longitude = base_lng + (random() * movimento * 2 - movimento),
    atualizado_em = now()
  WHERE nome = 'Ônibus Principal';
END;
$$;

-- Criar novo cron job para executar a cada 1 segundo
SELECT cron.schedule(
  'mover-onibus-automaticamente',
  '* * * * * *', -- A cada 1 segundo
  $$SELECT public.mover_onibus_automaticamente();$$
);