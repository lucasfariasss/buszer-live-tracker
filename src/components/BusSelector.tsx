import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bus } from "lucide-react";

interface BusData {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
}

interface BusSelectorProps {
  buses: BusData[];
  selectedBusId: number;
  onSelectBus: (id: number) => void;
}

const BusSelector = ({ buses, selectedBusId, onSelectBus }: BusSelectorProps) => {
  return (
    <div className="absolute top-4 sm:top-6 right-4 sm:right-6 left-4 sm:left-auto z-[1000] px-2 sm:px-0">
      <Select value={selectedBusId.toString()} onValueChange={(value) => onSelectBus(Number(value))}>
        <SelectTrigger className="w-full max-w-[240px] sm:w-[240px] bg-card backdrop-blur-sm border-primary/20 shadow-lg">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-primary" />
            <SelectValue placeholder="Selecione um ônibus" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-popover border-primary/20 z-[9999]">
          {buses.map((bus) => (
            <SelectItem key={bus.id} value={bus.id.toString()}>
              {bus.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BusSelector;
