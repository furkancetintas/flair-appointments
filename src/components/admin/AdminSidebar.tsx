import { NavLink, useLocation } from "react-router-dom";
import { 
  TrendingUp, 
  Calendar, 
  Wrench, 
  Clock, 
  Store,
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const adminMenuItems = [
  { title: "Kazançlar", url: "/admin/earnings", icon: TrendingUp },
  { title: "Randevular", url: "/admin/appointments", icon: Calendar },
  { title: "Hizmetler", url: "/admin/services", icon: Wrench },
  { title: "Çalışma Saatleri", url: "/admin/working-hours", icon: Clock },
  { title: "Dükkan Durum", url: "/admin/shop-status", icon: Store },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <h2 className="font-semibold text-lg">Admin Panel</h2>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Yönetim</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <User className="h-4 w-4" />
              <div className="text-sm">
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-muted-foreground text-xs">{profile?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        )}
        {collapsed && (
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}