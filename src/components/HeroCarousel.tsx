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
  <div className="relative w-screen left-1/2 -translate-x-1/2 h-[65vh] md:h-[75vh] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
    ))}

    {slides.length > 1 && (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full"
          onClick={goToNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </>
    )}

    {slides.length > 1 && (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-10"
                : "bg-white/50 hover:bg-white w-3"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    )}

    <div className="absolute bottom-12 left-6 md:left-16 text-left">
      <h2 className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-xl">
        {slides[currentIndex]?.title}
      </h2>
      <p className="text-white/90 mt-3 text-base md:text-lg max-w-xl drop-shadow">
        {slides[currentIndex]?.subtitle}
      </p>
    </div>
  </div>
);
