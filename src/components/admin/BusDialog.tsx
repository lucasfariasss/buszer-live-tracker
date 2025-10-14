import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Database } from "@/integrations/supabase/types";

type Bus = Database["public"]["Tables"]["onibus"]["Row"];

const busSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

type BusFormData = z.infer<typeof busSchema>;

interface BusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bus: Bus | null;
  onSuccess: () => void;
}

export function BusDialog({ open, onOpenChange, bus, onSuccess }: BusDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      nome: bus?.nome || "",
    },
  });

  useEffect(() => {
    if (bus) {
      reset({ nome: bus.nome });
    } else {
      reset({ nome: "" });
    }
  }, [bus, reset]);

  const onSubmit = async (data: BusFormData) => {
    setIsLoading(true);

    if (bus) {
      // Update existing bus
      const { error } = await supabase
        .from("onibus")
        .update({ nome: data.nome })
        .eq("id", bus.id);

      if (error) {
        toast({
          title: "Erro ao atualizar ônibus",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ônibus atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
        onSuccess();
      }
    } else {
      // Create new bus
      const { error } = await supabase
        .from("onibus")
        .insert({
          nome: data.nome,
          latitude: -23.5505,
          longitude: -46.6333,
        });

      if (error) {
        toast({
          title: "Erro ao criar ônibus",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ônibus criado!",
          description: "O novo ônibus foi adicionado com sucesso.",
        });
        onSuccess();
      }
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {bus ? "Editar Ônibus" : "Adicionar Ônibus"}
          </DialogTitle>
          <DialogDescription>
            {bus
              ? "Altere o nome do ônibus. Coordenadas não podem ser editadas aqui."
              : "Preencha as informações do novo ônibus."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Ônibus</Label>
            <Input
              id="nome"
              placeholder="Ex: Ônibus Principal"
              {...register("nome")}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          {bus && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Informações Somente Leitura</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Latitude:</span>
                  <p className="font-mono">{Number(bus.latitude).toFixed(4)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>
                  <p className="font-mono">{Number(bus.longitude).toFixed(4)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
