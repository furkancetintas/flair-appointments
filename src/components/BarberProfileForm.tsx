import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, MapPin, Phone, Store, Scissors, X, Plus } from 'lucide-react';

interface WorkingDay {
  start: string;
  end: string;
  closed?: boolean;
}

interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

interface BarberProfile {
  id?: string;
  shop_name: string;
  address: string;
  description: string;
  services: string[];
  working_hours: WorkingHours;
  shop_status: 'open' | 'closed';
  price_range: string;
}

interface BarberProfileFormProps {
  profileId: string;
}

const defaultWorkingHours: WorkingHours = {
  monday: { start: '09:00', end: '18:00' },
  tuesday: { start: '09:00', end: '18:00' },
  wednesday: { start: '09:00', end: '18:00' },
  thursday: { start: '09:00', end: '18:00' },
  friday: { start: '09:00', end: '18:00' },
  saturday: { start: '09:00', end: '18:00' },
  sunday: { closed: true, start: '09:00', end: '18:00' }
};

const dayNames = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar'
};

const BarberProfileForm = ({ profileId }: BarberProfileFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [barberProfile, setBarberProfile] = useState<BarberProfile | null>(null);
  const [newService, setNewService] = useState('');
  const { register, handleSubmit, setValue, watch, reset } = useForm<BarberProfile>();

  const watchedServices = watch('services') || [];
  const watchedWorkingHours = watch('working_hours') || defaultWorkingHours;

  useEffect(() => {
    fetchBarberProfile();
  }, [profileId]);

  const fetchBarberProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return;
      }

      if (data) {
        const barberData: BarberProfile = {
          id: data.id,
          shop_name: data.shop_name,
          address: data.address || '',
          description: data.description || '',
          services: data.services || [],
          working_hours: (data.working_hours as any) || defaultWorkingHours,
          shop_status: (data.shop_status as 'open' | 'closed') || 'closed',
          price_range: data.price_range || '100'
        };
        setBarberProfile(barberData);
        reset(barberData);
      } else {
        // Set default values for new profile
        reset({
          shop_name: '',
          address: '',
          description: '',
          services: [],
          working_hours: defaultWorkingHours,
          shop_status: 'closed',
          price_range: '100'
        });
      }
    } catch (error) {
      // Error is handled silently
    }
  };

  const onSubmit = async (data: BarberProfile) => {
    setLoading(true);
    try {
      const profileData = {
        profile_id: profileId,
        shop_name: data.shop_name,
        address: data.address,
        description: data.description,
        services: data.services,
        working_hours: data.working_hours as any,
        shop_status: data.shop_status,
        price_range: data.price_range
      };

      if (barberProfile?.id) {
        // Update existing profile
        const { error } = await supabase
          .from('barbers')
          .update(profileData)
          .eq('id', barberProfile.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('barbers')
          .insert(profileData);

        if (error) throw error;
      }

      toast({
        title: 'Profil Kaydedildi',
        description: 'Berber profiliniz başarıyla güncellendi.'
      });

      fetchBarberProfile();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Profil kaydedilirken bir hata oluştu.'
      });
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    if (newService.trim()) {
      const currentServices = watchedServices || [];
      setValue('services', [...currentServices, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    const currentServices = watchedServices || [];
    setValue('services', currentServices.filter((_, i) => i !== index));
  };

  const updateWorkingHours = (day: keyof typeof dayNames, field: 'start' | 'end' | 'closed', value: string | boolean) => {
    const current = watchedWorkingHours;
    setValue('working_hours', {
      ...current,
      [day]: {
        ...current[day],
        [field]: value
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            İşletme Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shop_name">İşletme Adı *</Label>
            <Input
              id="shop_name"
              {...register('shop_name', { required: true })}
              placeholder="Örn: Usta Berber"
            />
          </div>

          <div>
            <Label htmlFor="address">İşletme Adresi</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Tam adres bilgisi"
            />
          </div>

          <div>
            <Label htmlFor="price_range">Fiyat Aralığı (TL)</Label>
            <Input
              id="price_range"
              {...register('price_range')}
              placeholder="Örn: 50-150"
            />
          </div>

          <div>
            <Label htmlFor="description">İşletme Hakkında</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="İşletmenizi tanıtın..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Hizmetler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Hizmet adı (örn: Saç Kesimi)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
            />
            <Button type="button" onClick={addService} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {watchedServices.map((service, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {service}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => removeService(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Çalışma Saatleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(dayNames).map(([day, dayName]) => {
            const dayHours = watchedWorkingHours[day as keyof WorkingHours];
            const isClosed = dayHours?.closed || false;
            return (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24 font-medium">{dayName}</div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!isClosed}
                    onCheckedChange={(checked) => 
                      updateWorkingHours(day as keyof WorkingHours, 'closed', !checked)
                    }
                  />
                  {!isClosed ? (
                    <>
                      <Input
                        type="time"
                        value={dayHours?.start || '09:00'}
                        onChange={(e) => 
                          updateWorkingHours(day as keyof WorkingHours, 'start', e.target.value)
                        }
                        className="w-32"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={dayHours?.end || '18:00'}
                        onChange={(e) => 
                          updateWorkingHours(day as keyof WorkingHours, 'end', e.target.value)
                        }
                        className="w-32"
                      />
                    </>
                  ) : (
                    <span className="text-muted-foreground">Kapalı</span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Shop Status */}
      <Card>
        <CardHeader>
          <CardTitle>Dükkan Durumu (Bugün)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Switch
              checked={watch('shop_status') === 'open'}
              onCheckedChange={(checked) => 
                setValue('shop_status', checked ? 'open' : 'closed')
              }
            />
            <span className="font-medium">
              {watch('shop_status') === 'open' ? 'Açık' : 'Kapalı'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Kaydediliyor...' : 'Profili Kaydet'}
      </Button>
    </form>
  );
};

export default BarberProfileForm;