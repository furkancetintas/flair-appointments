import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Scissors, Calendar, Users, Star, ArrowRight, Search, MapPin, Clock, User, Phone, ExternalLink, Loader2, Hash } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchAppointmentById } from '@/store/slices/appointmentsSlice';
import { fetchShopSettings } from '@/store/slices/shopSettingsSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';

const Index = () => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.shopSettings);
  const [appointmentId, setAppointmentId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchShopSettings());
  }, [dispatch]);

  const handleSearchAppointment = async () => {
    if (!appointmentId.trim()) { toast.error('Lütfen bir randevu ID girin'); return; }
    setLoading(true);
    try {
      const result = await dispatch(fetchAppointmentById(appointmentId.trim()));
      if (result.meta.requestStatus === 'fulfilled' && result.payload) {
        setAppointmentData(result.payload);
        
        // Fetch customer data
        const { data: customer } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', (result.payload as any).customer_id)
          .maybeSingle();
        
        setCustomerData(customer);
        setIsModalOpen(true);
      } else { 
        toast.error('Randevu bulunamadı'); 
      }
    } catch { 
      toast.error('Randevu bulunamadı'); 
    } finally { 
      setLoading(false); 
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': 
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', dot: 'bg-emerald-500', label: 'Onaylandı' };
      case 'pending': 
        return { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', dot: 'bg-amber-500', label: 'Bekliyor' };
      case 'cancelled': 
        return { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20', dot: 'bg-rose-500', label: 'İptal' };
      case 'completed': 
        return { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/20', dot: 'bg-sky-500', label: 'Tamamlandı' };
      default: 
        return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', dot: 'bg-muted-foreground', label: status };
    }
  };

  const getGoogleMapsUrl = () => {
    if (!settings?.address) return '';
    const encoded = encodeURIComponent(settings.shop_name + ' ' + settings.address);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  };

  const getGoogleMapsEmbedUrl = () => {
    if (!settings?.address) return '';
    const encoded = encodeURIComponent(settings.shop_name + ' ' + settings.address);
    return `https://www.google.com/maps?q=${encoded}&output=embed`;
  };

  return (
    <>
      <SEO 
        title="Ana Sayfa"
        description="Ömrüm Erkek Kuaför'de online randevu alın, beklemeden traş olun. Profesyonel erkek kuaförü hizmetleri."
        canonical="/"
      />
      <main className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground">Ömrüm Erkek Kuaförü</h1>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            Profesyonel berber hizmetleri ile <span className="text-primary">bir tık uzağınızda</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Hızlı ve kolay randevu sistemi ile zaman kaybetmeden randevunuzu alın.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full flex items-center justify-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                Hemen Başla<ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/book" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                <Scissors className="h-5 w-5" />Randevu Al
              </Button>
            </Link>
          </div>
          
          {/* Search Section */}
          <div className="mt-10 sm:mt-12 max-w-lg mx-auto px-2">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">Randevunuzu Sorgulayın</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  placeholder="Randevu ID'nizi girin" 
                  value={appointmentId} 
                  onChange={(e) => setAppointmentId(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAppointment()}
                  className="flex-1"
                />
                <Button onClick={handleSearchAppointment} disabled={loading} className="w-full sm:w-auto">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span className="ml-2 sm:hidden">Sorgula</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              Randevu Detayları
            </DialogTitle>
          </DialogHeader>
          
          {appointmentData && (
            <div className="space-y-6">
              {/* Appointment ID & Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Randevu ID:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">{appointmentData.id}</code>
                </div>
                <Badge className={`${getStatusConfig(appointmentData.status).bg} ${getStatusConfig(appointmentData.status).text} ${getStatusConfig(appointmentData.status).border} border shrink-0`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusConfig(appointmentData.status).dot} mr-2`}></span>
                  {getStatusConfig(appointmentData.status).label}
                </Badge>
              </div>

              {/* Customer Info */}
              {customerData && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Müşteri Bilgileri
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-card border border-border rounded-xl">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Ad Soyad</p>
                      <p className="font-medium text-foreground">{customerData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">E-posta</p>
                      <p className="font-medium text-foreground text-sm break-all">{customerData.email}</p>
                    </div>
                    {customerData.phone && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Telefon</p>
                        <p className="font-medium text-foreground">{customerData.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Appointment Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-primary" />
                  Randevu Bilgileri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-card border border-border rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Hizmet</p>
                    <p className="font-medium text-foreground">{appointmentData.service}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Ücret</p>
                    <p className="font-medium text-foreground">{appointmentData.price}₺</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Tarih</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(appointmentData.appointment_date), 'dd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Saat</p>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appointmentData.appointment_time}
                    </p>
                  </div>
                  {appointmentData.notes && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Notlar</p>
                      <p className="text-foreground">{appointmentData.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shop Location */}
              {settings && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Dükkan Konumu
                  </h4>
                  <div className="p-4 bg-card border border-border rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{settings.shop_name}</p>
                        {settings.address && (
                          <p className="text-sm text-muted-foreground">{settings.address}</p>
                        )}
                        {settings.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {settings.phone}
                          </p>
                        )}
                      </div>
                      {settings.address && (
                        <a 
                          href={getGoogleMapsUrl()} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            <span className="hidden sm:inline">Google Maps'te Aç</span>
                            <span className="sm:hidden">Haritada Aç</span>
                          </Button>
                        </a>
                      )}
                    </div>
                    
                    {/* Embedded Google Maps */}
                    {settings.address && (
                      <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border border-border">
                        <iframe
                          src={getGoogleMapsEmbedUrl()}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Dükkan Konumu"
                          className="absolute inset-0"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <article className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Kolay Randevu</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Birkaç tıkla randevu alın</p>
          </article>
          <article className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Kolay Yönetim</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Randevularınızı takip edin</p>
          </article>
          <article className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Kaliteli Hizmet</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Profesyonel berberlik</p>
          </article>
        </div>
      </section>
      </main>
    </>
  );
};

export default Index;