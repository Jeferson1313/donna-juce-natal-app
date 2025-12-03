import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCard, Product } from "@/components/ProductCard";
import { ReservationModal } from "@/components/ReservationModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { sampleProducts, categories } from "@/data/products";
import { Gift, Snowflake } from "lucide-react";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = selectedCategory === "Todos"
    ? sampleProducts
    : sampleProducts.filter((p) => p.category === selectedCategory);

  const handleReserve = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background gradient-festive">
      <Header />

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
        <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <ProductCard product={product} onReserve={handleReserve} />
              </div>
            ))}
          </div>
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
              © 2024 - Todos os direitos reservados
            </p>
          </div>
        </section>
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber="5500000000000" />

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

export default Index;
