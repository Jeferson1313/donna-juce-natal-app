import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCard, Product } from "@/components/ProductCard";
import { ReservationModal } from "@/components/ReservationModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { useProducts } from "@/hooks/useProducts";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { toProductDisplay } from "@/types/product";
import { Gift, Snowflake, ShoppingCart, Calendar } from "lucide-react";
import logo from "@/assets/logo-extended.png";

const Catalog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  const { data: dbProducts, isLoading } = useProducts();
  const { isAuthenticated } = useCustomerAuth();

  // Use only database products
  const products = dbProducts ? dbProducts.map(toProductDisplay) : [];

  // Get categories from products
  const categories = dbProducts && dbProducts.length > 0
    ? ["Todos", ...new Set(dbProducts.map(p => p.category))]
    : ["Todos"];

  // Filter by category first
  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  // Separate by availability type
  const immediateProducts = filteredProducts.filter((p) => p.availability_type === "immediate");
  const reservationProducts = filteredProducts.filter((p) => p.availability_type !== "immediate");

  const handleReserve = (product: Product) => {
    if (!isAuthenticated) {
      setPendingProduct(product);
      setIsAuthModalOpen(true);
    } else {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingProduct) {
      setSelectedProduct(pendingProduct);
      setIsModalOpen(true);
      setPendingProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-festive">
      {/* Header with Sidebar */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
        <div className="container py-4 flex items-center justify-between">
          <CatalogSidebar onOpenAuth={() => setIsAuthModalOpen(true)} />
          <img src={logo} alt="Donna Juce Açougue" className="h-12 w-auto" />
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container py-6 space-y-8">
        {/* Hero Carousel */}
        <section className="animate-fade-in">
          <HeroCarousel />
        </section>

        {/* Welcome Section */}
        <section className="text-center space-y-4 py-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-center gap-2 text-secondary">
            <Snowflake className="h-5 w-5 animate-float" />
            <Gift className="h-6 w-6" />
            <Snowflake className="h-5 w-5 animate-float" style={{ animationDelay: "0.5s" }} />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Reserve Seu Pedido de Natal
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Garanta as melhores carnes para sua ceia. Faça sua reserva agora e retire no dia escolhido!
          </p>
        </section>

        {/* Category Filter */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card text-card-foreground border border-border hover:border-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section className="space-y-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-8 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Disponíveis Agora Section */}
              {immediateProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-green-700" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      Disponíveis Agora
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Produtos prontos para compra imediata
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {immediateProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${0.1 * index}s` }}
                      >
                        <ProductCard product={product} onReserve={handleReserve} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Para Reserva Section */}
              {reservationProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-700" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      Para Reserva
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Reserve agora e retire na data escolhida
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reservationProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${0.1 * index}s` }}
                      >
                        <ProductCard product={product} onReserve={handleReserve} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {immediateProducts.length === 0 && reservationProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum produto encontrado nesta categoria.
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Footer Info */}
        <section className="text-center py-8 border-t border-border mt-12">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              📍 Entre em contato para mais informações
            </p>
            <p className="font-display text-lg font-semibold text-foreground">
              DONNA JUCE AÇOUGUE
            </p>
            <p className="text-muted-foreground text-xs">
              © 2025 - Todos os direitos reservados
            </p>
          </div>
        </section>
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber="5575982794712" />

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingProduct(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* Reservation Modal */}
      <ReservationModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default Catalog;
