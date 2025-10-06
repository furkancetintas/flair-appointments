import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Çıkış yapıldı");
      navigate("/");
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto h-full px-4">
        <div className="flex items-center justify-between h-full">
          {/* Sol - Logo/Başlık */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">Berber Dükkanım</h1>
          </Link>

          {/* Orta - Navigasyon */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/barbers" className="text-foreground hover:text-primary transition-colors font-medium">
              Berberler
            </Link>
            {user && (
              <Link to="/my-appointments" className="text-foreground hover:text-primary transition-colors font-medium">
                Randevularım
              </Link>
            )}
          </nav>

          {/* Sağ - Auth Butonları */}
          <div className="flex items-center gap-3">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </Button>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Giriş Yap
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
