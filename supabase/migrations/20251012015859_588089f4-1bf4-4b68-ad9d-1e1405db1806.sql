-- Criar tabela ônibus para rastreamento em tempo real
CREATE TABLE IF NOT EXISTS public.onibus (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL DEFAULT 'Ônibus Principal',
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.onibus ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública (qualquer pessoa pode ver a localização do ônibus)
CREATE POLICY "Permitir leitura pública da localização do ônibus"
ON public.onibus
FOR SELECT
USING (true);

-- Criar política para permitir inserção pública (para demo/testes)
CREATE POLICY "Permitir inserção pública de ônibus"
ON public.onibus
FOR INSERT
WITH CHECK (true);

-- Criar política para permitir atualização pública (para demo/testes)
CREATE POLICY "Permitir atualização pública de ônibus"
ON public.onibus
FOR UPDATE
USING (true);

-- Criar função para atualizar automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION public.atualizar_timestamp_onibus()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar timestamp automaticamente
CREATE TRIGGER trigger_atualizar_timestamp_onibus
BEFORE UPDATE ON public.onibus
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_timestamp_onibus();

-- Inserir registro inicial com localização em São Paulo, Brasil
INSERT INTO public.onibus (nome, latitude, longitude)
VALUES ('Ônibus Principal', -23.5505, -46.6333);

-- Habilitar realtime para a tabela
ALTER TABLE public.onibus REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.onibus;