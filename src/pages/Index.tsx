import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import BusMap from "@/components/BusMap";
import BusLocationCard from "@/components/BusLocationCard";
import BusCarousel from "@/components/BusCarousel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

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
            toast.success('Localização atualizada!', {
              description: `${updatedBus.nome} foi atualizado em tempo real.`,
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

  const selectedBus = buses.find(b => b.id === selectedBusId);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Link to="/auth" className="absolute top-4 right-4 z-[1000]">
        <Button variant="secondary" size="sm">
          <Shield className="mr-2 h-4 w-4" />
          Admin
        </Button>
      </Link>
      
      <BusMap 
        buses={buses}
        selectedBusId={selectedBusId}
      />
      {selectedBus && (
        <BusLocationCard
          latitude={selectedBus.latitude}
          longitude={selectedBus.longitude}
          busName={selectedBus.nome}
          lastUpdate={selectedBus.atualizado_em}
        />
      )}
      <BusCarousel 
        buses={buses}
        selectedBusId={selectedBusId}
        onSelectBus={setSelectedBusId}
      />
    </div>
  );
};

export default Index;
