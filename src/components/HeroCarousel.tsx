import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCarouselSlides } from "@/hooks/useCarouselSlides";
import heroBanner1 from "@/assets/hero-banner.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";

const defaultSlides = [
  { id: "1", title: "Donna Juce Açougue", subtitle: "As melhores carnes para sua mesa", image_url: heroBanner1 },
  { id: "2", title: "Faça seu Pedido!", subtitle: "Compre online e receba em casa", image_url: heroBanner2 },
];

export function HeroCarousel() {
  const { data: dbSlides, isLoading } = useCarouselSlides();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = dbSlides && dbSlides.length > 0 ? dbSlides : defaultSlides;

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-2xl animate-pulse" />
    );
  }

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl shadow-elevated">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image_url}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card text-foreground rounded-full"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card text-foreground rounded-full"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-accent w-6"
                  : "bg-card/60 hover:bg-card"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
      {/* Overlay Content */}
      <div className="absolute bottom-8 left-8 right-8 text-center md:text-left">
        <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-card drop-shadow-lg">
          {slides[currentIndex]?.title || "Donna Juce Açougue"}
        </h2>
        <p className="text-card/90 mt-2 text-sm md:text-base max-w-xl drop-shadow">
          {slides[currentIndex]?.subtitle || "As melhores carnes para sua mesa"}
        </p>
      </div>
    </div>
  );
}
