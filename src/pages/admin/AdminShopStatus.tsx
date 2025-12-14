import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchShopSettings, updateShopSettings } from "@/store/slices/shopSettingsSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Store, AlertCircle } from "lucide-react";

export default function AdminShopStatus() {
  const dispatch = useAppDispatch();
  const { settings, updateLoading } = useAppSelector((state) => state.shopSettings);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => { dispatch(fetchShopSettings()); }, [dispatch]);
  useEffect(() => { if (settings) setIsOpen(settings.shop_status === 'open'); }, [settings]);

  const handleChange = async (open: boolean) => {
    setIsOpen(open);
    await dispatch(updateShopSettings({ shop_status: open ? 'open' : 'closed' }));
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold mb-2">Dükkan Durumu</h2><p className="text-muted-foreground">Açık/kapalı durumunu yönetin</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />Mevcut Durum</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              <div><p className="font-medium">Dükkan {isOpen ? 'Açık' : 'Kapalı'}</p><p className="text-sm text-muted-foreground">{isOpen ? 'Randevu alınabilir' : 'Randevu alınamaz'}</p></div>
            </div>
            <div className="flex items-center gap-3"><Switch checked={isOpen} onCheckedChange={handleChange} disabled={updateLoading} /><Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Açık" : "Kapalı"}</Badge></div>
          </div>
          {!isOpen && <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2"><AlertCircle className="h-4 w-4 text-orange-600" /><p className="text-sm text-orange-800">Müşteriler şu anda randevu alamaz.</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
