import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCarouselSlides, useCreateSlide, useUpdateSlide, useDeleteSlide } from "@/hooks/useCarouselSlides";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, LogOut, Image, ArrowLeft, Images, Package, ClipboardList, ShoppingBag, Bell, Percent } from "lucide-react";
import logo from "@/assets/logo.png";
import { CarouselSlide } from "@/types/carousel";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { ReservationManagement } from "@/components/admin/ReservationManagement";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { NotificationManager } from "@/components/admin/NotificationManager";
import { PromotionManagement } from "@/components/admin/PromotionManagement";

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: slides, isLoading: slidesLoading } = useCarouselSlides();
  const createSlide = useCreateSlide();
  const updateSlide = useUpdateSlide();
  const deleteSlide = useDeleteSlide();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    button_text: "",
    image_url: "",
    is_active: true,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("carousel-images")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Erro no upload",
        description: uploadError.message,
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("carousel-images")
      .getPublicUrl(fileName);

    setFormData({ ...formData, image_url: publicUrl.publicUrl });
    setUploading(false);
    toast({
      title: "Imagem enviada!",
      description: "A imagem foi carregada com sucesso.",
    });
  };

  const openEditDialog = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || "",
      button_text: slide.button_text || "",
      image_url: slide.image_url,
      is_active: slide.is_active,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSlide(null);
    setFormData({
      title: "",
      subtitle: "",
      button_text: "",
      image_url: "",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image_url) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e envie uma imagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSlide) {
        await updateSlide.mutateAsync({
          id: editingSlide.id,
          title: formData.title,
          subtitle: formData.subtitle || null,
          button_text: formData.button_text || null,
          image_url: formData.image_url,
          is_active: formData.is_active,
        });
        toast({ title: "Slide atualizado!" });
      } else {
        const maxOrder = slides?.reduce((max, s) => Math.max(max, s.order), -1) ?? -1;
        await createSlide.mutateAsync({
          title: formData.title,
          subtitle: formData.subtitle || null,
          button_text: formData.button_text || null,
          image_url: formData.image_url,
          is_active: formData.is_active,
          order: maxOrder + 1,
        });
        toast({ title: "Slide criado!" });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este slide?")) return;

    try {
      await deleteSlide.mutateAsync(id);
      toast({ title: "Slide excluído!" });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || slidesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30 shadow-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
            <span className="font-display text-lg font-semibold text-card-foreground">
              Painel Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ver Site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="carousel" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="carousel" className="flex items-center gap-2">
              <Images className="h-4 w-4" />
              <span className="hidden md:inline">Carrossel</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden md:inline">Reservas</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden md:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              <span className="hidden md:inline">Promoções</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="carousel">
            {/* Carousel Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Slides do Carrossel
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Slide
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSlide ? "Editar Slide" : "Novo Slide"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ex: Catálogo de Natal 2025"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtítulo</Label>
                        <Input
                          id="subtitle"
                          value={formData.subtitle}
                          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                          placeholder="Ex: As melhores carnes para sua ceia"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="button_text">Texto do Botão</Label>
                        <Input
                          id="button_text"
                          value={formData.button_text}
                          onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                          placeholder="Ex: Ver Produtos"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Imagem *</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </div>
                        {formData.image_url && (
                          <img
                            src={formData.image_url}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-lg mt-2"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label>Slide ativo</Label>
                      </div>
                      <Button type="submit" className="w-full" disabled={uploading}>
                        {editingSlide ? "Salvar Alterações" : "Criar Slide"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {slides?.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhum slide cadastrado. Clique em "Novo Slide" para adicionar.
                    </CardContent>
                  </Card>
                )}
                {slides?.map((slide) => (
                  <Card key={slide.id} className={!slide.is_active ? "opacity-50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {slide.image_url ? (
                            <img
                              src={slide.image_url}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {slide.title}
                          </h3>
                          {slide.subtitle && (
                            <p className="text-sm text-muted-foreground truncate">
                              {slide.subtitle}
                            </p>
                          )}
                          <span className={`text-xs ${slide.is_active ? "text-green-600" : "text-muted-foreground"}`}>
                            {slide.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(slide)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(slide.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="reservations">
            <ReservationManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationManager />
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
