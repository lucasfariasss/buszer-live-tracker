import { useState } from "react";
import { Bus, MapPin, Clock, Search } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BusData {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  atualizado_em: string;
}

interface BusDrawerProps {
  buses: BusData[];
  selectedBusId: number;
  onSelectBus: (id: number) => void;
}

export default function BusDrawer({ buses, selectedBusId, onSelectBus }: BusDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [snapPoint, setSnapPoint] = useState<number | string | null>(0.15);

  const selectedBus = buses.find(b => b.id === selectedBusId);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes === 1) return '1 min atrás';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hora atrás';
    return `${diffInHours} horas atrás`;
  };

  const filteredBuses = buses.filter(bus =>
    bus.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isRecentlyUpdated = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    return diffInMinutes < 2;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-80 bg-background border-r z-[900] overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Ônibus Disponíveis</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ônibus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {filteredBuses.map((bus) => {
                const isSelected = bus.id === selectedBusId;
                return (
                  <Card
                    key={bus.id}
                    onClick={() => onSelectBus(bus.id)}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                        : "hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Bus className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <h3 className={cn(
                            "font-semibold truncate",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {bus.nome}
                          </h3>
                        </div>
                        
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {bus.latitude.toFixed(6)}, {bus.longitude.toFixed(6)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>{getTimeAgo(bus.atualizado_em)}</span>
                          </div>
                        </div>
                      </div>

                      {isRecentlyUpdated(bus.atualizado_em) && (
                        <Badge variant="outline" className="text-[10px] border-green-500 text-green-600 animate-pulse">
                          Ao vivo
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        snapPoints={[0.15, 0.7]}
        activeSnapPoint={snapPoint}
        setActiveSnapPoint={setSnapPoint}
        dismissible={false}
      >
        <DrawerContent className="md:hidden">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-base">
              {snapPoint === 0.15 && selectedBus ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{selectedBus.nome}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(selectedBus.atualizado_em)}
                  </span>
                </div>
              ) : (
                "Selecione um Ônibus"
              )}
            </DrawerTitle>
          </DrawerHeader>

          {snapPoint !== 0.15 && (
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ônibus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          )}

          <ScrollArea className="h-[calc(70vh-120px)] px-3 pb-4">
            <div className="space-y-2">
              {filteredBuses.map((bus) => {
                const isSelected = bus.id === selectedBusId;
                return (
                  <Card
                    key={bus.id}
                    onClick={() => {
                      onSelectBus(bus.id);
                      setSnapPoint(0.15);
                    }}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "hover:border-primary/50 active:scale-[0.98]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Bus className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <h3 className={cn(
                            "font-semibold truncate",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {bus.nome}
                          </h3>
                        </div>
                        
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {bus.latitude.toFixed(6)}, {bus.longitude.toFixed(6)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>{getTimeAgo(bus.atualizado_em)}</span>
                          </div>
                        </div>
                      </div>

                      {isRecentlyUpdated(bus.atualizado_em) && (
                        <Badge variant="outline" className="text-[10px] border-green-500 text-green-600 animate-pulse">
                          Ao vivo
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  );
}
