import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";

export function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => { await signOut(); toast.success("Çıkış yapıldı"); navigate("/"); };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto h-full px-4">
        <div className="flex items-center justify-between h-full">
          <Link to="/" className="flex items-center"><h1 className="text-2xl font-bold text-primary">Ömrüm Kuaför</h1></Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/book" className="text-foreground hover:text-primary transition-colors font-medium">Randevu Al</Link>
            {user && !isAdmin && <Link to="/my-appointments" className="text-foreground hover:text-primary transition-colors font-medium">Randevularım</Link>}
            {user && isAdmin && <Link to="/admin/appointments" className="text-foreground hover:text-primary transition-colors font-medium">Admin Panel</Link>}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {user ? <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2"><LogOut className="h-4 w-4" /><span>Çıkış</span></Button> : <><Link to="/auth"><Button variant="ghost" size="sm">Giriş</Button></Link><Link to="/auth"><Button size="sm">Kayıt Ol</Button></Link></>}
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden"><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-8">
                  <Link to="/book" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Randevu Al</Link>
                  {user && !isAdmin && <Link to="/my-appointments" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Randevularım</Link>}
                  {user && isAdmin && <Link to="/admin/appointments" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Admin Panel</Link>}
                  <div className="border-t pt-6">{user ? <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setIsOpen(false); }}><LogOut className="h-4 w-4 mr-2" />Çıkış</Button> : <div className="flex flex-col gap-2"><Link to="/auth" onClick={() => setIsOpen(false)}><Button variant="outline" className="w-full">Giriş</Button></Link><Link to="/auth" onClick={() => setIsOpen(false)}><Button className="w-full">Kayıt Ol</Button></Link></div>}</div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}