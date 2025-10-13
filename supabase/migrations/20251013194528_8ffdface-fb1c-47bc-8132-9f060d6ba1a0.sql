-- Cancelar o cron job de atualização automática
SELECT cron.unschedule('mover-onibus-automaticamente');

-- Atualizar a localização do ônibus para João Pessoa, Paraíba
UPDATE public.onibus
SET 
  latitude = -7.1195,
  longitude = -34.8450,
  atualizado_em = now()
WHERE nome = 'Ônibus Principal';