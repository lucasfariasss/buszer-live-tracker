import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BusTable } from "@/components/admin/BusTable";
import { BusDialog } from "@/components/admin/BusDialog";
import { Plus, LogOut } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Bus = Database["public"]["Tables"]["onibus"]["Row"];

export default function Admin() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchBuses();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Verificar se o usuário tem role de admin
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (error || !roles) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar o painel administrativo.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate("/");
    }
  };

  const fetchBuses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("onibus")
      .select("*")
      .order("nome");

    if (error) {
      toast({
        title: "Erro ao carregar ônibus",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBuses(data || []);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleEdit = (bus: Bus) => {
    setEditingBus(bus);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingBus(null);
    setDialogOpen(true);
  };

  const handleSaveSuccess = () => {
    fetchBuses();
    setDialogOpen(false);
    setEditingBus(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Gerenciamento de Frota</h2>
            <p className="text-muted-foreground">
              Gerencie os ônibus cadastrados no sistema
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Ônibus
          </Button>
        </div>

        <BusTable
          buses={buses}
          isLoading={isLoading}
          onEdit={handleEdit}
        />

        <BusDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          bus={editingBus}
          onSuccess={handleSaveSuccess}
        />
      </main>
    </div>
  );
}
