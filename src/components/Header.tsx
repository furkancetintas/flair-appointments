import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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

          {/* Orta - Navigasyon (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/barbers" className="text-foreground hover:text-primary transition-colors font-medium">
              Berberler
            </Link>
            {user && profile?.role === 'customer' && (
              <Link to="/my-appointments" className="text-foreground hover:text-primary transition-colors font-medium">
                Randevularım
              </Link>
            )}
          </nav>

          {/* Sağ - Auth Butonları & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış Yap</span>
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

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-8">
                  <Link 
                    to="/barbers" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Berberler
                  </Link>
                  {user && profile?.role === 'customer' && (
                    <Link 
                      to="/my-appointments" 
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Randevularım
                    </Link>
                  )}
                  <div className="border-t pt-6 mt-auto">
                    {user ? (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Çıkış Yap
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Giriş Yap
                          </Button>
                        </Link>
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">
                            Kayıt Ol
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
