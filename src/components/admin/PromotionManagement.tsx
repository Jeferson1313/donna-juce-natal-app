import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useAdminPromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  usePromotionItems,
  useAddPromotionItem,
  useRemovePromotionItem,
} from "@/hooks/usePromotions";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function PromotionManagement() {
  const { data: promotions, isLoading } = useAdminPromotions();
  const { data: products } = useProducts();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();
  const addItem = useAddPromotionItem();
  const removeItem = useRemovePromotionItem();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [itemsDialogPromo, setItemsDialogPromo] = useState<any>(null);
  const { data: promoItems } = usePromotionItems(itemsDialogPromo?.id);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [promoPrice, setPromoPrice] = useState("");

  const openCreate = () => {
    setEditingPromo(null);
    setFormData({ name: "", description: "", start_date: "", end_date: "", is_active: true });
    setIsDialogOpen(true);
  };

  const openEdit = (promo: any) => {
    setEditingPromo(promo);
    setFormData({
      name: promo.name,
      description: promo.description || "",
      start_date: promo.start_date.slice(0, 16),
      end_date: promo.end_date.slice(0, 16),
      is_active: promo.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    try {
      if (editingPromo) {
        await updatePromotion.mutateAsync({
          id: editingPromo.id,
          name: formData.name,
          description: formData.description || null,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
          is_active: formData.is_active,
        });
        toast({ title: "Promoção atualizada!" });
      } else {
        const newPromo = await createPromotion.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
          is_active: formData.is_active,
        });

        // Notify all customers when promotion starts now
        if (formData.is_active && new Date(formData.start_date) <= new Date()) {
          notifyAllCustomers(formData.name);
        }

        toast({ title: "Promoção criada!" });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const notifyAllCustomers = async (promoName: string) => {
    try {
      const { data: customers } = await supabase.from("customers").select("id");
      if (!customers) return;

      for (const c of customers) {
        await supabase.from("notifications").insert({
          customer_id: c.id,
          title: "🔥 Nova Promoção!",
          body: `A promoção "${promoName}" começou! Confira os preços especiais.`,
          link: "/",
        });
      }

      await supabase.functions.invoke("send-push", {
        body: {
          title: "🔥 Nova Promoção!",
          body: `A promoção "${promoName}" começou! Confira os preços especiais.`,
          link: "/",
        },
      });
    } catch (e) {
      console.warn("Failed to notify about promotion:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta promoção?")) return;
    try {
      await deletePromotion.mutateAsync(id);
      toast({ title: "Promoção excluída!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleAddItem = async () => {
    if (!selectedProduct || !promoPrice || !itemsDialogPromo) return;
    try {
      await addItem.mutateAsync({
        promotion_id: itemsDialogPromo.id,
        product_id: selectedProduct,
        promotional_price: parseFloat(promoPrice),
      });
      setSelectedProduct("");
      setPromoPrice("");
      toast({ title: "Produto adicionado à promoção!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem.mutateAsync(itemId);
      toast({ title: "Produto removido da promoção!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const isPromoActive = (promo: any) => {
    const now = new Date();
    return promo.is_active && new Date(promo.start_date) <= now && new Date(promo.end_date) >= now;
  };

  if (isLoading) return <div>Carregando promoções...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Promoções</CardTitle>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Promoção
          </Button>
        </CardHeader>
        <CardContent>
          {promotions?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma promoção cadastrada.</p>
          ) : (
            <div className="space-y-4">
              {promotions?.map((promo) => (
                <Card key={promo.id} className={!promo.is_active ? "opacity-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{promo.name}</h3>
                          {isPromoActive(promo) ? (
                            <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                          ) : (
                            <Badge variant="outline">Inativa</Badge>
                          )}
                        </div>
                        {promo.description && (
                          <p className="text-sm text-muted-foreground">{promo.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(promo.start_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          {" → "}
                          {format(new Date(promo.end_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setItemsDialogPromo(promo)}>
                          <Package className="h-4 w-4 mr-1" />
                          Produtos
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => openEdit(promo)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(promo.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPromo ? "Editar Promoção" : "Nova Promoção"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início *</Label>
                <Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fim *</Label>
                <Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
              <Label>Ativa</Label>
            </div>
            <Button type="submit" className="w-full">
              {editingPromo ? "Salvar" : "Criar Promoção"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Dialog */}
      <Dialog open={!!itemsDialogPromo} onOpenChange={() => setItemsDialogPromo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Produtos da Promoção: {itemsDialogPromo?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add product */}
            <div className="flex gap-2">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecionar produto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (R$ {Number(p.price).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                placeholder="Preço promo"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                className="w-28"
              />
              <Button onClick={handleAddItem} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* List items */}
            <div className="space-y-2">
              {promoItems?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <span className="font-medium text-sm">{item.product?.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      R$ {Number(item.product?.price).toFixed(2)} → R$ {Number(item.promotional_price).toFixed(2)}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveItem(item.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {promoItems?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto adicionado.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
