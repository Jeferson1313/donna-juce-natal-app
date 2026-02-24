import { useState } from "react";
import { useCreateNotification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

export function NotificationManager() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [targetType, setTargetType] = useState<"all" | "single">("all");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  
  const createNotification = useCreateNotification();
  const { toast } = useToast();

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("id, name, phone");
      return data || [];
    },
  });

  const handleSend = async () => {
    if (!title || !body) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e mensagem",
        variant: "destructive",
      });
      return;
    }

    if (targetType === "single" && !selectedCustomer) {
      toast({
        title: "Selecione um cliente",
        description: "Escolha um cliente para enviar a notificação",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (targetType === "all") {
        const { data: allCustomers } = await supabase.from("customers").select("id");
        if (allCustomers) {
          await Promise.all(
            allCustomers.map((c) =>
              createNotification.mutateAsync({
                customerId: c.id,
                title,
                body,
                link,
              })
            )
          );
        }
      } else {
        await createNotification.mutateAsync({
          customerId: selectedCustomer,
          title,
          body,
          link,
        });
      }

      toast({ title: "Notificações enviadas com sucesso!" });
      setTitle("");
      setBody("");
      setLink("");
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Notificações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Destinatário</Label>
          <Select value={targetType} onValueChange={(v) => setTargetType(v as "all" | "single")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              <SelectItem value="single">Cliente específico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {targetType === "single" && (
          <div className="space-y-2">
            <Label>Selecione o Cliente</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Buscar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Promoção de Picanha!"
          />
        </div>

        <div className="space-y-2">
          <Label>Mensagem</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Digite a mensagem da notificação..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Link (opcional)</Label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Ex: /catalogo"
          />
        </div>

        <Button onClick={handleSend} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Enviar Notificação
        </Button>
      </CardContent>
    </Card>
  );
}
