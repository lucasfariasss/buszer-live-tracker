import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
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
    <div className="fixed bottom-0 left-0 right-0 z-[1000] px-4 pb-6 pt-8 bg-gradient-to-t from-background/95 via-background/80 to-transparent">
      <Carousel
        opts={{
          align: "center",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {buses.map((bus) => {
            const isSelected = bus.id === selectedBusId;
            return (
              <CarouselItem 
                key={bus.id} 
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3"
              >
                <Card
                  onClick={() => onSelectBus(bus.id)}
                  className={`
                    cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? 'border-primary border-2 scale-105 bg-card/95 shadow-xl' 
                      : 'border-primary/20 bg-card/60 hover:bg-card/75 shadow-lg'
                    }
                    backdrop-blur-md
                  `}
                >
                  <div className="p-4">
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
  );
};

export default BusCarousel;
