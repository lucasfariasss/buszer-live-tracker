-- ============================================
-- CORREÇÕES DE SEGURANÇA COMPLETAS
-- ============================================

-- 1. Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Criar tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Habilitar RLS na tabela de roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Permitir que usuários vejam suas próprias roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Criar função SECURITY DEFINER para verificar roles (evita recursão infinita)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Remover políticas antigas do onibus
DROP POLICY IF EXISTS "Require authentication for bus inserts" ON public.onibus;
DROP POLICY IF EXISTS "Require authentication for bus updates" ON public.onibus;

-- 7. Criar novas políticas que exigem role de admin
CREATE POLICY "Only admins can insert buses"
ON public.onibus
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update buses"
ON public.onibus
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Corrigir política de INSERT do profiles (permite cadastro de novos usuários)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);