import { Card } from "@/components/ui/card";
import { Bus, MapPin } from "lucide-react";

interface BusLocationCardProps {
  latitude: number;
  longitude: number;
  busName: string;
  lastUpdate?: string;
}

const BusLocationCard = ({ latitude, longitude, busName, lastUpdate }: BusLocationCardProps) => {
  return (
    <Card className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md bg-gradient-to-b from-card to-card/95 backdrop-blur-sm border-primary/20 shadow-[var(--shadow-card)]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-[var(--shadow-bus)]">
            <Bus className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Localização do Ônibus</h1>
            <p className="text-sm text-muted-foreground">{busName}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-muted-foreground">Latitude</span>
                <span className="text-lg font-semibold text-foreground font-mono">{latitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-muted-foreground">Longitude</span>
                <span className="text-lg font-semibold text-foreground font-mono">{longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Atualizado em {new Date(lastUpdate).toLocaleTimeString('pt-BR')}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BusLocationCard;
