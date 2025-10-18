import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import BusMap from "@/components/BusMap";

import BusDrawer from "@/components/BusDrawer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Shield, Bus } from "lucide-react";

interface BusData {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  atualizado_em: string;
}

const Index = () => {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const { data, error } = await supabase
          .from('onibus')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          toast.error('Erro ao carregar dados dos ônibus');
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          setBuses(data);
          setSelectedBusId(data[0].id);
        } else {
          toast.error('Nenhum ônibus encontrado. Aguardando dados do rastreador...');
        }
      } catch (err) {
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchBusData();

    // Configurar realtime para receber atualizações
    const channel = supabase
      .channel('onibus-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'onibus'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedBus = payload.new as BusData;
            setBuses(prev => {
              const index = prev.findIndex(b => b.id === updatedBus.id);
              if (index >= 0) {
                const newBuses = [...prev];
                newBuses[index] = updatedBus;
                return newBuses;
              }
              return [...prev, updatedBus];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Carregando rastreador...</p>
        </div>
      </div>
    );
  }

  if (buses.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Nenhum ônibus encontrado</h1>
          <p className="text-muted-foreground">Não foi possível carregar os dados dos ônibus.</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-[1000] flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Buszer</h1>
        </div>
        
        <Link to="/auth">
          <Button variant="ghost" size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Button>
        </Link>
      </header>
      
      {/* Main Content */}
      <div className="md:ml-80 h-full pt-16">
        <BusMap 
          buses={buses}
          selectedBusId={selectedBusId}
          onSelectBus={setSelectedBusId}
        />
      </div>

      {/* Bus Selection Drawer/Sidebar */}
      <BusDrawer 
        buses={buses}
        selectedBusId={selectedBusId}
        onSelectBus={setSelectedBusId}
      />
    </div>
  );
};

export default Index;
