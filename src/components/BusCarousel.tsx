import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
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
  const [canDrag, setCanDrag] = useState(true);

  useEffect(() => {
    if (!api) return;
    
    const updateDragState = () => {
      const shouldDrag = api.canScrollPrev() || api.canScrollNext();
      setCanDrag(shouldDrag);
    };
    
    updateDragState();
    api.on('reInit', updateDragState);
    api.on('select', updateDragState);
    api.on('resize', updateDragState);
    
    return () => {
      api.off('reInit', updateDragState);
      api.off('select', updateDragState);
      api.off('resize', updateDragState);
    };
  }, [api]);

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
    <div className="fixed bottom-6 left-0 right-0 z-[1000] flex justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-screen-sm lg:max-w-screen-md">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            watchDrag: canDrag,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="py-2 lg:justify-center">
            {buses.map((bus) => {
              const isSelected = bus.id === selectedBusId;
              return (
                <CarouselItem 
                  key={bus.id} 
                  className="pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4"
                >
                  <Card
                    onClick={() => onSelectBus(bus.id)}
                    className={`
                      cursor-pointer transition-all duration-300
                      ${isSelected 
                        ? 'border-primary border-2 shadow-xl' 
                        : 'border-primary/20 shadow-lg hover:shadow-xl'
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
        </Carousel>
      </div>
    </div>
  );
};

export default BusCarousel;
