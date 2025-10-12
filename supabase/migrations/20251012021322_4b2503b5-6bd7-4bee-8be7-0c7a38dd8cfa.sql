-- Adicionar constraint única na coluna nome (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'onibus_nome_key'
  ) THEN
    ALTER TABLE public.onibus ADD CONSTRAINT onibus_nome_key UNIQUE (nome);
  END IF;
END $$;

-- Inserir ou atualizar o registro do Ônibus Principal com coordenadas de João Pessoa
INSERT INTO public.onibus (nome, latitude, longitude)
VALUES ('Ônibus Principal', -7.1197, -34.8659)
ON CONFLICT (nome) 
DO UPDATE SET 
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  atualizado_em = now();