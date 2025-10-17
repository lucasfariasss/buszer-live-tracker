import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Bus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BusData {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  atualizado_em: string;
}

interface BusCarouselProps {
  buses: BusData[];
  selectedBusId: number;
  onSelectBus: (id: number) => void;
}

const BusCarousel = ({ buses, selectedBusId, onSelectBus }: BusCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    
    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    
    updateScrollState();
    api.on('reInit', updateScrollState);
    api.on('select', updateScrollState);
    api.on('resize', updateScrollState);
    
    return () => {
      api.off('reInit', updateScrollState);
      api.off('select', updateScrollState);
      api.off('resize', updateScrollState);
    };
  }, [api]);

  // Auto-scroll para o card selecionado
  useEffect(() => {
    if (!api) return;
    const index = buses.findIndex(b => b.id === selectedBusId);
    if (index !== -1) {
      api.scrollTo(index);
    }
  }, [selectedBusId, api, buses]);

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: ptBR 
      });
    } catch {
      return 'Agora';
    }
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[1000] flex justify-center px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
      <div className="w-full max-w-[1600px] relative">
        <Carousel
          opts={{
            align: "center",
            loop: false,
            dragFree: true,
            containScroll: "trimSnaps",
            skipSnaps: false,
          }}
          setApi={setApi}
          className="w-full"
        >
          {/* Indicador de scroll esquerdo */}
          {canScrollPrev && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background/80 to-transparent pointer-events-none md:hidden z-10" />
          )}
          
          {/* Indicador de scroll direito */}
          {canScrollNext && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background/80 to-transparent pointer-events-none md:hidden z-10" />
          )}

          <CarouselContent className="py-2 -ml-2 md:justify-center">
            {buses.map((bus) => {
              const isSelected = bus.id === selectedBusId;
              return (
                <CarouselItem 
                  key={bus.id} 
                  className="basis-[85%] min-[480px]:basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-[14.28%] 2xl:basis-[12.5%] pl-2"
                >
                  <Card
                    onClick={() => onSelectBus(bus.id)}
                    className={`
                      cursor-pointer transition-all duration-300
                      ${isSelected 
                        ? 'border-primary border-2 shadow-xl scale-105' 
                        : 'border-primary/20 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                      }
                      bg-card
                    `}
                  >
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bus className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-semibold text-sm truncate">{bus.nome}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(bus.atualizado_em)}</span>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Botões de navegação para desktop */}
          <CarouselPrevious className="hidden md:flex -left-12 lg:-left-14" />
          <CarouselNext className="hidden md:flex -right-12 lg:-right-14" />
        </Carousel>
      </div>
    </div>
  );
};

export default BusCarousel;
