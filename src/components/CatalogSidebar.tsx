import { useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, Home, ShoppingBag, ClipboardList, LogIn, LogOut, User } from "lucide-react";
import logo from "@/assets/logo-extended.png";

interface CatalogSidebarProps {
  onOpenAuth: () => void;
}

export function CatalogSidebar({ onOpenAuth }: CatalogSidebarProps) {
  const navigate = useNavigate();
  const { isAuthenticated, customer, signOut } = useCustomerAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <img src={logo} alt="Donna Juce Açougue" className="h-16 w-auto" />
        </SheetHeader>

        {/* User Info */}
        {isAuthenticated && customer && (
          <>
            <div className="px-6 py-4 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5" />
            Página Inicial
          </Button>

          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate("/meus-pedidos")}
              >
                <ShoppingBag className="h-5 w-5" />
                Meus Pedidos
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate("/minhas-reservas")}
              >
                <ClipboardList className="h-5 w-5" />
                Minhas Reservas
              </Button>

              <Separator className="my-2" />

              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Separator className="my-2" />

              <Button
                variant="default"
                className="w-full justify-start gap-3 h-12"
                onClick={onOpenAuth}
              >
                <LogIn className="h-5 w-5" />
                Entrar / Cadastrar
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
