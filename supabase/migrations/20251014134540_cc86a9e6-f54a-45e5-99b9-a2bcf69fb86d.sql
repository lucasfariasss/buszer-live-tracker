-- Inserir os 3 ônibus caso não existam (usando INSERT ON CONFLICT para evitar duplicatas)
INSERT INTO public.onibus (id, nome, latitude, longitude, atualizado_em)
VALUES 
  (1, 'Ônibus Principal', -7.1195, -34.8450, now()),
  (2, 'Circular B', -7.1150, -34.8400, now()),
  (3, 'Circular Mangabeira', -7.1250, -34.8500, now())
ON CONFLICT (id) 
DO UPDATE SET 
  nome = EXCLUDED.nome,
  atualizado_em = now();
