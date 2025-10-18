import { useState } from "react";
import { Bus, MapPin, Clock, Search, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

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
      <div className="hidden md:block fixed left-0 top-16 bottom-0 w-80 bg-background border-r z-[900] overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar ônibus ou rota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-base"
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
                      "p-4 cursor-pointer transition-all duration-200 hover:shadow-lg group",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20" 
                        : "hover:border-primary/30 hover:bg-accent/50"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Bus className={cn(
                              "h-5 w-5 flex-shrink-0",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )} />
                            <h3 className={cn(
                              "font-semibold text-base truncate",
                              isSelected ? "text-primary" : "text-foreground"
                            )}>
                              {bus.nome}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              isRecentlyUpdated(bus.atualizado_em) 
                                ? "bg-green-500 animate-pulse" 
                                : "bg-gray-400"
                            )} />
                            <span className={cn(
                              "text-xs font-medium",
                              isRecentlyUpdated(bus.atualizado_em) 
                                ? "text-green-600" 
                                : "text-muted-foreground"
                            )}>
                              {isRecentlyUpdated(bus.atualizado_em) ? 'Ao Vivo' : 'Offline'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>Há {getTimeAgo(bus.atualizado_em)}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBus(bus.id);
                          }}
                          className={cn(
                            "p-2 rounded-full transition-colors",
                            isSelected 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                          )}
                          aria-label="Centralizar no mapa"
                        >
                          <MapPin className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 left-6 z-[1000] bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:scale-110 active:scale-95 transition-transform animate-pulse"
        aria-label="Abrir menu de ônibus"
      >
        <Bus className="h-6 w-6" />
        <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-destructive text-destructive-foreground">
          {buses.length}
        </Badge>
      </button>

      {/* Mobile Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="md:hidden h-[75vh]">
          <DrawerHeader className="pb-2 relative">
            <DrawerTitle className="text-lg font-semibold">
              Ônibus Disponíveis
            </DrawerTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </DrawerHeader>

          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar ônibus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-2"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 pb-4">
            <div className="space-y-2">
              {filteredBuses.map((bus) => {
                const isSelected = bus.id === selectedBusId;
                return (
                  <Card
                    key={bus.id}
                    onClick={() => {
                      onSelectBus(bus.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 active:scale-[0.98] group",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20" 
                        : "hover:border-primary/30 hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Bus className={cn(
                            "h-5 w-5 flex-shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <h3 className={cn(
                            "font-semibold text-base truncate",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {bus.nome}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            isRecentlyUpdated(bus.atualizado_em) 
                              ? "bg-green-500 animate-pulse" 
                              : "bg-gray-400"
                          )} />
                          <span className={cn(
                            "text-xs font-medium",
                            isRecentlyUpdated(bus.atualizado_em) 
                              ? "text-green-600" 
                              : "text-muted-foreground"
                          )}>
                            {isRecentlyUpdated(bus.atualizado_em) ? 'Ao Vivo' : 'Offline'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>Há {getTimeAgo(bus.atualizado_em)}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBus(bus.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                        )}
                        aria-label="Centralizar no mapa"
                      >
                        <MapPin className="h-4 w-4" />
                      </button>
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
