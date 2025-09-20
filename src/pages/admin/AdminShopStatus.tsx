import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchBarberByProfileId, createOrUpdateBarberProfile } from "@/store/slices/barbersSlice";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Store, AlertCircle, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminShopStatus() {
  const dispatch = useAppDispatch();
  const { profile } = useAuth();
  const { currentBarber, updateLoading } = useAppSelector((state) => state.barbers);
  
  const [isOpen, setIsOpen] = useState(true);
  const [closureReason, setClosureReason] = useState("");
  const [closureStartDate, setClosureStartDate] = useState("");
  const [closureEndDate, setClosureEndDate] = useState("");
  const [hasScheduledClosure, setHasScheduledClosure] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchBarberByProfileId(profile.id));
    }
  }, [dispatch, profile?.id]);

  useEffect(() => {
    if (currentBarber) {
      setIsOpen(currentBarber.shop_status === 'open');
    }
  }, [currentBarber]);

  const handleStatusChange = async (newStatus: boolean) => {
    if (!profile?.id || !currentBarber) return;

    try {
      await dispatch(createOrUpdateBarberProfile({
        profileId: profile.id,
        barberData: {
          shop_name: currentBarber.shop_name,
          address: currentBarber.address || '',
          description: currentBarber.description || '',
          services: currentBarber.services,
          working_hours: currentBarber.working_hours,
          price_range: currentBarber.price_range || '50-150',
          shop_status: newStatus ? 'open' : 'closed',
          appointment_duration: currentBarber.appointment_duration || 30,
        }
      }));
      
      setIsOpen(newStatus);
      toast.success(newStatus ? "Dükkan açık olarak işaretlendi" : "Dükkan kapalı olarak işaretlendi");
    } catch (error) {
      toast.error("Durum güncellenirken bir hata oluştu");
    }
  };

  const handleScheduleClosure = () => {
    if (!closureStartDate || !closureEndDate || !closureReason.trim()) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    const startDate = new Date(closureStartDate);
    const endDate = new Date(closureEndDate);
    
    if (endDate <= startDate) {
      toast.error("Bitiş tarihi başlangıç tarihinden sonra olmalıdır");
      return;
    }

    setHasScheduledClosure(true);
    toast.success("Planlı kapanış başarıyla ayarlandı");
  };

  const clearScheduledClosure = () => {
    setHasScheduledClosure(false);
    setClosureStartDate("");
    setClosureEndDate("");
    setClosureReason("");
    toast.success("Planlı kapanış iptal edildi");
  };

  const quickReasons = [
    "Resmi Tatil",
    "Cenaze",
    "Hastalık",
    "Kişisel Sebep",
    "Bakım ve Onarım",
    "Tatil"
  ];

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dükkan Durum</h2>
        <p className="text-muted-foreground">
          Dükkanınızın açık/kapalı durumunu yönetin ve planlı kapanışları ayarlayın
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Mevcut Durum
          </CardTitle>
          <CardDescription>
            Dükkanınızın şu anki durumunu kontrol edin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium">
                  Dükkan {isOpen ? 'Açık' : 'Kapalı'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isOpen ? 'Müşteriler randevu alabilir' : 'Randevu alımı durduruldu'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isOpen}
                onCheckedChange={handleStatusChange}
                disabled={updateLoading}
              />
              <Badge variant={isOpen ? "default" : "secondary"}>
                {isOpen ? "Açık" : "Kapalı"}
              </Badge>
            </div>
          </div>

          {!isOpen && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <p className="text-sm font-medium text-orange-800">Dükkan Kapalı</p>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Müşteriler şu anda randevu alamazlar. Dükkanı açmak için yukarıdaki anahtarı kullanın.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Closure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planlı Kapanış
          </CardTitle>
          <CardDescription>
            Belirli bir tarih aralığı için dükkanı kapatmayı planlayın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasScheduledClosure ? (
            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Planlı Kapanış Aktif</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearScheduledClosure}
                >
                  İptal Et
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Başlangıç:</strong> {format(new Date(closureStartDate), 'dd MMMM yyyy', { locale: tr })}</p>
                <p><strong>Bitiş:</strong> {format(new Date(closureEndDate), 'dd MMMM yyyy', { locale: tr })}</p>
                <p><strong>Sebep:</strong> {closureReason}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Başlangıç Tarihi</Label>
                  <Input
                    type="date"
                    value={closureStartDate}
                    onChange={(e) => setClosureStartDate(e.target.value)}
                    min={today}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bitiş Tarihi</Label>
                  <Input
                    type="date"
                    value={closureEndDate}
                    onChange={(e) => setClosureEndDate(e.target.value)}
                    min={closureStartDate || tomorrow}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kapanış Sebebi</Label>
                <Textarea
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  placeholder="Kapanış sebebini yazın..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Hızlı Seçenekler</Label>
                <div className="flex flex-wrap gap-2">
                  {quickReasons.map((reason) => (
                    <Button
                      key={reason}
                      variant="outline"
                      size="sm"
                      onClick={() => setClosureReason(reason)}
                      className="text-xs"
                    >
                      {reason}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleScheduleClosure}
                className="w-full"
                disabled={!closureStartDate || !closureEndDate || !closureReason.trim()}
              >
                Planlı Kapanışı Ayarla
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 İpuçları</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Dükkan kapalıyken müşteriler yeni randevu alamazlar</li>
            <li>• Mevcut randevular otomatik olarak iptal olmaz</li>
            <li>• Planlı kapanışları önceden ayarlayarak müşterilerinizi bilgilendirebilirsiniz</li>
            <li>• Acil durumlar için hızlı kapanış seçeneklerini kullanabilirsiniz</li>
            <li>• Kapanış sebebi müşteriler tarafından görülebilir</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}