import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Bus, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

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
    api.on('select', updateScrollState);
    api.on('reInit', updateScrollState);
    
    return () => {
      api.off('select', updateScrollState);
      api.off('reInit', updateScrollState);
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
    <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-gradient-to-t from-background/95 to-background/0 pb-4 pt-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="relative">
          {/* Botão Anterior - Desktop */}
          {canScrollPrev && (
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-10 w-10 rounded-full bg-background/95 backdrop-blur shadow-lg border-2"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          <Carousel
            opts={{
              align: "start",
              loop: false,
              dragFree: true,
            }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {buses.map((bus) => {
                const isSelected = bus.id === selectedBusId;
                return (
                  <CarouselItem 
                    key={bus.id} 
                    className="pl-2 md:pl-4 basis-[85%] xs:basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <Card
                      onClick={() => onSelectBus(bus.id)}
                      className={`
                        cursor-pointer transition-all duration-300 h-full
                        ${isSelected 
                          ? 'border-primary border-2 shadow-lg scale-[1.02]' 
                          : 'border-border hover:border-primary/50 shadow-md hover:shadow-lg'
                        }
                        bg-card backdrop-blur-sm
                      `}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`
                            p-2 rounded-lg transition-colors
                            ${isSelected ? 'bg-primary/10' : 'bg-muted'}
                          `}>
                            <Bus className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <span className="font-semibold text-sm truncate flex-1">{bus.nome}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{getTimeAgo(bus.atualizado_em)}</span>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>

          {/* Botão Próximo - Desktop */}
          {canScrollNext && (
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-10 w-10 rounded-full bg-background/95 backdrop-blur shadow-lg border-2"
              onClick={() => api?.scrollNext()}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Indicadores de scroll - Mobile */}
        <div className="flex md:hidden justify-center gap-2 mt-3">
          {canScrollPrev && (
            <div className="h-1 w-8 bg-primary/30 rounded-full" />
          )}
          <div className="h-1 w-8 bg-primary rounded-full" />
          {canScrollNext && (
            <div className="h-1 w-8 bg-primary/30 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default BusCarousel;
