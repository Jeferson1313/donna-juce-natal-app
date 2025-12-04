import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Settings } from "lucide-react";
import logo from "@/assets/logo-extended.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background gradient-festive flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <img src={logo} alt="Donna Juce Açougue" className="h-32 w-auto mx-auto" />
          <p className="text-muted-foreground">
            Catálogo de Natal 2025 - Reserve suas carnes para a ceia!
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-4">
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
            onClick={() => navigate("/catalogo")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                Fazer Reserva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Veja nosso catálogo de produtos e faça sua reserva para o Natal
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:border-secondary"
            onClick={() => navigate("/admin/login")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Settings className="h-6 w-6 text-secondary" />
                </div>
                Área Administrativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acesso restrito para gerenciamento do catálogo
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs">
          © 2025 Donna Juce Açougue - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
