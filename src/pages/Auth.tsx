import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const authSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100, "Senha muito longa"),
});

const resetEmailSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const onLogin = async (data: AuthFormData) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos"
          : error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // Função de signup removida - novos admins devem ser criados manualmente
  // via Supabase Dashboard para evitar cadastros públicos não autorizados
  /*
  const onSignup = async (data: AuthFormData) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message === "User already registered"
          ? "Este email já está registrado"
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada!",
        description: "Verifique seu email para confirmar o cadastro.",
      });
    }
    setIsLoading(false);
  };
  */

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "Email necessário",
        description: "Por favor, insira seu email",
        variant: "destructive",
      });
      return;
    }

    // Validação de formato de email
    const validationResult = resetEmailSchema.safeParse({ email: resetEmail });
    if (!validationResult.success) {
      toast({
        title: "Email inválido",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/admin`,
    });

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });
      setShowReset(false);
      setResetEmail("");
    }
    setIsLoading(false);
  };

  if (showReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu email para receber o link de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handlePasswordReset}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Enviando..." : "Enviar Link"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReset(false)}
                disabled={isLoading}
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Title Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Buszer</h1>
          <p className="text-muted-foreground">Painel Administrativo</p>
        </div>

        {/* Card with improved styling */}
        <Card className="shadow-xl border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Acesso Admin</CardTitle>
            <CardDescription>
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@buszer.com"
                  {...register("email")}
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="h-11"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium" 
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar no Painel"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowReset(true)}
              >
                Esqueci minha senha
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to home link */}
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => window.location.href = '/'}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Voltar para a página inicial
          </Button>
        </div>
      </div>
    </div>
  );
}
