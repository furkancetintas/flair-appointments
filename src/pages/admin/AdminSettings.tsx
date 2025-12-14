import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchShopSettings, updateShopSettings } from "@/store/slices/shopSettingsSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const dispatch = useAppDispatch();
  const { settings, updateLoading } = useAppSelector((state) => state.shopSettings);
  const [form, setForm] = useState({ shop_name: '', address: '', description: '', phone: '', price_range: '' });

  useEffect(() => { dispatch(fetchShopSettings()); }, [dispatch]);
  useEffect(() => { if (settings) setForm({ shop_name: settings.shop_name || '', address: settings.address || '', description: settings.description || '', phone: settings.phone || '', price_range: settings.price_range || '' }); }, [settings]);

  const handleSave = async () => { await dispatch(updateShopSettings(form)); };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /><h2 className="text-2xl font-semibold">Dükkan Ayarları</h2></div>
      <Card>
        <CardHeader><CardTitle>Genel Bilgiler</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Dükkan Adı</Label><Input value={form.shop_name} onChange={(e) => setForm(p => ({ ...p, shop_name: e.target.value }))} /></div>
          <div><Label>Adres</Label><Input value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          <div><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          <div><Label>Fiyat Aralığı</Label><Input value={form.price_range} onChange={(e) => setForm(p => ({ ...p, price_range: e.target.value }))} placeholder="50-150" /></div>
          <div><Label>Açıklama</Label><Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
          <Button onClick={handleSave} disabled={updateLoading} className="w-full">{updateLoading ? "Kaydediliyor..." : "Kaydet"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
