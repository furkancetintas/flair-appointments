import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchBarberByProfileId, createOrUpdateBarberProfile } from "@/store/slices/barbersSlice";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

interface DayHours {
  start: string;
  end: string;
  closed: boolean;
}

interface WorkingHours {
  [key: string]: DayHours;
}

export default function AdminWorkingHours() {
  const dispatch = useAppDispatch();
  const { profile } = useAuth();
  const { currentBarber, updateLoading } = useAppSelector((state) => state.barbers);
  
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { start: "09:00", end: "18:00", closed: false },
    tuesday: { start: "09:00", end: "18:00", closed: false },
    wednesday: { start: "09:00", end: "18:00", closed: false },
    thursday: { start: "09:00", end: "18:00", closed: false },
    friday: { start: "09:00", end: "18:00", closed: false },
    saturday: { start: "09:00", end: "18:00", closed: false },
    sunday: { start: "09:00", end: "18:00", closed: true },
  });

  const [appointmentInterval, setAppointmentInterval] = useState(30);

  useEffect(() => {
    if (currentBarber?.appointment_duration) {
      setAppointmentInterval(currentBarber.appointment_duration);
    }
  }, [currentBarber?.appointment_duration]);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchBarberByProfileId(profile.id));
    }
  }, [dispatch, profile?.id]);

  useEffect(() => {
    if (currentBarber?.working_hours) {
      setWorkingHours(currentBarber.working_hours);
    }
  }, [currentBarber]);

  const dayNames = {
    monday: "Pazartesi",
    tuesday: "Salı", 
    wednesday: "Çarşamba",
    thursday: "Perşembe",
    friday: "Cuma",
    saturday: "Cumartesi",
    sunday: "Pazar"
  };

  const handleDayToggle = (day: string, closed: boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed
      }
    }));
  };

  const handleTimeChange = (day: string, type: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSaveWorkingHours = async () => {
    if (!profile?.id || !currentBarber) return;

    try {
      const result = await dispatch(createOrUpdateBarberProfile({
        profileId: profile.id,
        barberData: {
          shop_name: currentBarber.shop_name,
          address: currentBarber.address || '',
          description: currentBarber.description || '',
          services: currentBarber.services,
          working_hours: workingHours,
          price_range: currentBarber.price_range || '50-150',
          shop_status: (currentBarber.shop_status as 'open' | 'closed') || 'closed',
          appointment_duration: appointmentInterval,
        }
      }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success("Çalışma saatleri başarıyla güncellendi!");
      } else {
        toast.error("Çalışma saatleri güncellenirken bir hata oluştu");
      }
    } catch (error) {
      toast.error("Çalışma saatleri güncellenirken bir hata oluştu");
    }
  };

  const handleSaveAppointmentSettings = async () => {
    if (!profile?.id || !currentBarber) return;

    try {
      const result = await dispatch(createOrUpdateBarberProfile({
        profileId: profile.id,
        barberData: {
          shop_name: currentBarber.shop_name,
          address: currentBarber.address || '',
          description: currentBarber.description || '',
          services: currentBarber.services,
          working_hours: currentBarber.working_hours,
          price_range: currentBarber.price_range || '50-150',
          shop_status: (currentBarber.shop_status as 'open' | 'closed') || 'closed',
          appointment_duration: appointmentInterval,
        }
      }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success("Randevu ayarları başarıyla güncellendi!");
      } else {
        toast.error("Randevu ayarları güncellenirken bir hata oluştu");
      }
    } catch (error) {
      toast.error("Randevu ayarları güncellenirken bir hata oluştu");
    }
  };

  const copyToAllDays = (sourceDay: string) => {
    const sourceHours = workingHours[sourceDay];
    const newWorkingHours = { ...workingHours };
    
    Object.keys(newWorkingHours).forEach(day => {
      if (day !== sourceDay) {
        newWorkingHours[day] = {
          start: sourceHours.start,
          end: sourceHours.end,
          closed: sourceHours.closed
        };
      }
    });
    
    setWorkingHours(newWorkingHours);
    toast.success("Çalışma saatleri tüm günlere kopyalandı");
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Çalışma Saatleri</h2>
        <p className="text-muted-foreground">
          Haftalık çalışma saatlerinizi ve randevu aralıklarını ayarlayın
        </p>
      </div>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Haftalık Çalışma Programı
          </CardTitle>
          <CardDescription>
            Her gün için çalışma saatlerinizi belirleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(dayNames).map(([dayKey, dayName]) => {
            const dayHours = workingHours[dayKey];
            return (
              <div key={dayKey} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label className="text-base font-medium min-w-[100px]">{dayName}</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!dayHours.closed}
                        onCheckedChange={(checked) => handleDayToggle(dayKey, !checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {dayHours.closed ? "Kapalı" : "Açık"}
                      </span>
                    </div>
                  </div>
                  {!dayHours.closed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToAllDays(dayKey)}
                      className="text-xs"
                    >
                      Tümüne Kopyala
                    </Button>
                  )}
                </div>

                {!dayHours.closed && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Açılış Saati</Label>
                      <select
                        value={dayHours.start}
                        onChange={(e) => handleTimeChange(dayKey, 'start', e.target.value)}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Kapanış Saati</Label>
                      <select
                        value={dayHours.end}
                        onChange={(e) => handleTimeChange(dayKey, 'end', e.target.value)}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 border-t">
            <Button 
              onClick={handleSaveWorkingHours}
              disabled={updateLoading}
              className="w-full"
            >
              {updateLoading ? "Kaydediliyor..." : "Çalışma Saatlerini Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Randevu Ayarları
          </CardTitle>
          <CardDescription>
            Randevu sistemi için zaman aralıklarını belirleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Randevu Süresi (Dakika)</Label>
              <select
                value={appointmentInterval}
                onChange={(e) => setAppointmentInterval(Number(e.target.value))}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value={15}>15 Dakika</option>
                <option value={30}>30 Dakika</option>
                <option value={45}>45 Dakika</option>
                <option value={60}>60 Dakika</option>
              </select>
            </div>
          </div>

          <Button 
            onClick={handleSaveAppointmentSettings}
            disabled={updateLoading}
            className="w-full mb-4"
          >
            {updateLoading ? "Kaydediliyor..." : "Randevu Ayarlarını Kaydet"}
          </Button>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">💡 Randevu Sistemi Bilgileri</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Seçtiğiniz süre, her randevu için ayrılan zaman olacaktır</li>
              <li>• Müşteriler sadece çalışma saatleri içinde randevu alabilir</li>
              <li>• Kapalı günlerde randevu alınamaz</li>
              <li>• Randevu saatleri otomatik olarak hesaplanır</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}