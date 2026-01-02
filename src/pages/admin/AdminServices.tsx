import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchShopSettings, updateShopSettings } from "@/store/slices/shopSettingsSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Wrench, Banknote } from "lucide-react";
import { toast } from "sonner";

interface Service {
  name: string;
  price: number;
}

export default function AdminServices() {
  const dispatch = useAppDispatch();
  const { settings, updateLoading } = useAppSelector((state) => state.shopSettings);
  const [services, setServices] = useState<Service[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  useEffect(() => { dispatch(fetchShopSettings()); }, [dispatch]);
  
  useEffect(() => { 
    if (settings?.services) {
      // Handle both old string array format and new object format
      const servicesData = settings.services as any;
      if (Array.isArray(servicesData)) {
        if (servicesData.length > 0 && typeof servicesData[0] === 'string') {
          // Old format: string array
          setServices(servicesData.map((s: string) => ({ name: s, price: 100 })));
        } else {
          // New format: object array
          setServices(servicesData);
        }
      }
    }
  }, [settings]);

  const handleAddService = () => { 
    const name = newServiceName.trim();
    const price = parseInt(newServicePrice) || 100;
    
    if (name && !services.some(s => s.name === name)) { 
      setServices([...services, { name, price }]); 
      setNewServiceName(""); 
      setNewServicePrice("");
    } else if (!name) {
      toast.error("Hizmet adı boş olamaz");
    } else {
      toast.error("Bu hizmet zaten mevcut");
    }
  };
  
  const handleRemoveService = (name: string) => setServices(services.filter(s => s.name !== name));
  
  const handleUpdatePrice = (name: string, newPrice: number) => {
    setServices(services.map(s => s.name === name ? { ...s, price: newPrice } : s));
  };
  
  const handleSave = async () => { 
    await dispatch(updateShopSettings({ services: services as any })); 
  };

  const defaults: Service[] = [
    { name: "Saç Kesimi", price: 100 },
    { name: "Sakal Tıraşı", price: 80 },
    { name: "Saç + Sakal", price: 150 },
    { name: "Yıkama", price: 30 },
    { name: "Şekillendirme", price: 50 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Hizmetler</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Sunduğunuz hizmetleri ve fiyatlarını yönetin</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Wrench className="h-5 w-5" />
              Mevcut Hizmetler
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{services.length} adet hizmet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">Henüz hizmet eklenmemiş</p>
            ) : (
              <div className="space-y-3">
                {services.map((service, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-secondary/50 rounded-lg">
                    <span className="flex-1 font-medium text-sm sm:text-base">{service.name}</span>
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={service.price}
                        onChange={(e) => handleUpdatePrice(service.name, parseInt(e.target.value) || 0)}
                        className="w-24 h-8"
                        min={0}
                      />
                      <span className="text-sm text-muted-foreground">₺</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive" 
                      onClick={() => handleRemoveService(service.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {services.length > 0 && (
              <Button onClick={handleSave} disabled={updateLoading} className="w-full mt-4">
                {updateLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Yeni Hizmet Ekle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Hizmet Adı</Label>
                <Input 
                  value={newServiceName} 
                  onChange={(e) => setNewServiceName(e.target.value)} 
                  placeholder="Örn: Saç Boyama" 
                />
              </div>
              <div className="space-y-2">
                <Label>Fiyat (₺)</Label>
                <Input 
                  type="number"
                  value={newServicePrice} 
                  onChange={(e) => setNewServicePrice(e.target.value)} 
                  placeholder="100"
                  min={0}
                />
              </div>
              <Button onClick={handleAddService} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Hizmet Ekle
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">Önerilen hizmetler:</p>
              <div className="flex flex-wrap gap-2">
                {defaults.filter(d => !services.some(s => s.name === d.name)).map(d => (
                  <Button 
                    key={d.name} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setServices([...services, d])}
                  >
                    + {d.name} ({d.price}₺)
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}