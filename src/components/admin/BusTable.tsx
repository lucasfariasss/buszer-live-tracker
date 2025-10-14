import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Bus = Database["public"]["Tables"]["onibus"]["Row"];

interface BusTableProps {
  buses: Bus[];
  isLoading: boolean;
  onEdit: (bus: Bus) => void;
}

export function BusTable({ buses, isLoading, onEdit }: BusTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (buses.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">Nenhum ônibus cadastrado</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Latitude</TableHead>
            <TableHead>Longitude</TableHead>
            <TableHead>Atualizado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buses.map((bus) => (
            <TableRow key={bus.id}>
              <TableCell className="font-medium">{bus.id}</TableCell>
              <TableCell>{bus.nome}</TableCell>
              <TableCell>{Number(bus.latitude).toFixed(4)}</TableCell>
              <TableCell>{Number(bus.longitude).toFixed(4)}</TableCell>
              <TableCell>
                {bus.atualizado_em 
                  ? new Date(bus.atualizado_em).toLocaleString('pt-BR')
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(bus)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
