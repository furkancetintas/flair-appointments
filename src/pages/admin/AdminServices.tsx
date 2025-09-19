import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchBarberByProfileId, createOrUpdateBarberProfile } from "@/store/slices/barbersSlice";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Wrench, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminServices() {
  const dispatch = useAppDispatch();
  const { profile } = useAuth();
  const { currentBarber, updateLoading } = useAppSelector((state) => state.barbers);
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchBarberByProfileId(profile.id));
    }
  }, [dispatch, profile?.id]);

  useEffect(() => {
    if (currentBarber?.services) {
      setServices(currentBarber.services);
    }
  }, [currentBarber]);

  const handleAddService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter(service => service !== serviceToRemove));
  };

  const handleSaveServices = async () => {
    if (!profile?.id || !currentBarber) return;

    try {
      await dispatch(createOrUpdateBarberProfile({
        profileId: profile.id,
        barberData: {
          shop_name: currentBarber.shop_name,
          address: currentBarber.address || '',
          description: currentBarber.description || '',
          services: services,
          working_hours: currentBarber.working_hours,
          price_range: currentBarber.price_range || '50-150',
          shop_status: (currentBarber.shop_status as 'open' | 'closed') || 'closed',
        }
      }));
      toast.success("Hizmetler başarıyla güncellendi!");
    } catch (error) {
      toast.error("Hizmetler güncellenirken bir hata oluştu");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddService();
    }
  };

  const defaultServices = [
    "Saç Kesimi",
    "Sakal Tıraşı",
    "Saç + Sakal",
    "Yıkama",
    "Şekillendirme",
    "Kaş Aldırma",
    "Maske",
    "Masaj"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Hizmetler</h2>
        <p className="text-muted-foreground">
          Berber dükkanınızın sunduğu hizmetleri yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Mevcut Hizmetler
            </CardTitle>
            <CardDescription>
              Şu anda sunduğunuz hizmetler ({services.length} adet)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz hizmet eklenmemiş</p>
                <p className="text-sm text-muted-foreground">Aşağıdan yeni hizmet ekleyebilirsiniz</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {services.map((service, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    {service}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveService(service)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {services.length > 0 && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSaveServices}
                  disabled={updateLoading}
                  className="w-full"
                >
                  {updateLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Yeni Hizmet Ekle
            </CardTitle>
            <CardDescription>
              Yeni bir hizmet eklemek için aşağıdaki alana yazın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-service">Hizmet Adı</Label>
              <div className="flex gap-2">
                <Input
                  id="new-service"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Örn: Saç Kesimi"
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddService}
                  disabled={!newService.trim() || services.includes(newService.trim())}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Add Options */}
            <div className="space-y-2">
              <Label>Hızlı Ekle</Label>
              <div className="flex flex-wrap gap-2">
                {defaultServices
                  .filter(service => !services.includes(service))
                  .map((service) => (
                    <Button
                      key={service}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setServices([...services, service]);
                        toast.success(`${service} eklendi`);
                      }}
                      className="text-xs"
                    >
                      + {service}
                    </Button>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Management Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 İpuçları</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Hizmetlerinizi açık ve anlaşılır şekilde adlandırın</li>
            <li>• Müşterilerinizin kolayca anlayabileceği terimler kullanın</li>
            <li>• Fiyat bilgilerini dükkan ayarlarından ayrıca güncelleyebilirsiniz</li>
            <li>• Popüler hizmetleri listede üstte tutmaya özen gösterin</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}