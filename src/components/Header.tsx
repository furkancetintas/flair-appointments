import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function Header() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const sidebar = useSidebar();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Çıkış yapıldı");
      navigate("/auth");
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 gap-4">
        <div className="flex items-center gap-4">
          {sidebar && <SidebarTrigger />}
          <h1 className="text-xl font-bold text-primary">Berber Dükkanım</h1>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Çıkış Yap</span>
        </Button>
      </div>
    </header>
  );
}
