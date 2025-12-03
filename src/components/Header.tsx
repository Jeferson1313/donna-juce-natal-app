import { Beef } from "lucide-react";

interface HeaderProps {
  storeName?: string;
}

export function Header({ storeName = "DONNA JUCE AÇOUGUE" }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-card">
      <div className="container py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-primary rounded-xl">
            <Beef className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-xl md:text-2xl font-bold text-card-foreground tracking-wide">
              {storeName}
            </h1>
            <p className="text-xs text-muted-foreground">Catálogo de Natal 2024</p>
          </div>
        </div>
      </div>
    </header>
  );
}
