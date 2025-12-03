import logo from "@/assets/logo.png";

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-card">
      <div className="container py-4">
        <div className="flex items-center justify-center">
          <img 
            src={logo} 
            alt="Donna Juce Açougue" 
            className="h-16 md:h-20 w-auto"
          />
        </div>
      </div>
    </header>
  );
}
