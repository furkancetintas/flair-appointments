import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchShopSettings, updateShopSettings } from "@/store/slices/shopSettingsSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Wrench } from "lucide-react";
import { toast } from "sonner";

export default function AdminServices() {
  const dispatch = useAppDispatch();
  const { settings, updateLoading } = useAppSelector((state) => state.shopSettings);
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");

  useEffect(() => { dispatch(fetchShopSettings()); }, [dispatch]);
  useEffect(() => { if (settings?.services) setServices(settings.services); }, [settings]);

  const handleAddService = () => { if (newService.trim() && !services.includes(newService.trim())) { setServices([...services, newService.trim()]); setNewService(""); } };
  const handleRemoveService = (s: string) => setServices(services.filter(x => x !== s));
  const handleSave = async () => { await dispatch(updateShopSettings({ services })); };

  const defaults = ["Saç Kesimi", "Sakal Tıraşı", "Saç + Sakal", "Yıkama", "Şekillendirme"];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold mb-2">Hizmetler</h2><p className="text-muted-foreground">Sunduğunuz hizmetleri yönetin</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Mevcut Hizmetler</CardTitle><CardDescription>{services.length} adet</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {services.length === 0 ? <p className="text-muted-foreground text-center py-8">Henüz hizmet eklenmemiş</p> : (
              <div className="flex flex-wrap gap-2">
                {services.map((s, i) => <Badge key={i} variant="secondary" className="flex items-center gap-2">{s}<Button size="sm" variant="ghost" className="h-4 w-4 p-0" onClick={() => handleRemoveService(s)}><X className="h-3 w-3" /></Button></Badge>)}
              </div>
            )}
            {services.length > 0 && <Button onClick={handleSave} disabled={updateLoading} className="w-full mt-4">{updateLoading ? "Kaydediliyor..." : "Kaydet"}</Button>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Yeni Hizmet</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2"><Input value={newService} onChange={(e) => setNewService(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddService()} placeholder="Hizmet adı" /><Button onClick={handleAddService}><Plus className="h-4 w-4" /></Button></div>
            <div className="flex flex-wrap gap-2">{defaults.filter(s => !services.includes(s)).map(s => <Button key={s} variant="outline" size="sm" onClick={() => setServices([...services, s])}>+ {s}</Button>)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
