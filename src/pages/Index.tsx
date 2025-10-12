import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BusMap from "@/components/BusMap";
import BusLocationCard from "@/components/BusLocationCard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BusData {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  atualizado_em: string;
}

const Index = () => {
  const [busData, setBusData] = useState<BusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const { data, error } = await supabase
          .from('onibus')
          .select('*')
          .eq('nome', 'Ônibus Principal')
          .single();

        if (error) {
          console.error('Erro ao buscar dados do ônibus:', error);
          toast.error('Erro ao carregar dados do ônibus');
          return;
        }

        if (data) {
          setBusData(data);
        }
      } catch (err) {
        console.error('Erro:', err);
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
          table: 'onibus',
          filter: 'nome=eq.Ônibus Principal'
        },
        (payload) => {
          console.log('Atualização recebida:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setBusData(payload.new as BusData);
            toast.success('Localização atualizada!', {
              description: 'A posição do ônibus foi atualizada em tempo real.',
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

  if (!busData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Nenhum ônibus encontrado</h1>
          <p className="text-muted-foreground">Não foi possível carregar os dados do ônibus.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <BusMap 
        latitude={busData.latitude} 
        longitude={busData.longitude}
      />
      <BusLocationCard
        latitude={busData.latitude}
        longitude={busData.longitude}
        busName={busData.nome}
        lastUpdate={busData.atualizado_em}
      />
    </div>
  );
};

export default Index;
