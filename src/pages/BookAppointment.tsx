import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchShopSettings } from '@/store/slices/shopSettingsSlice';
import { createAppointment, fetchAppointmentsForDate } from '@/store/slices/appointmentsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scissors, Calendar as CalendarIcon, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, addDays, isAfter, isBefore, startOfToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

const BookAppointment = () => {
  const { profile } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { settings, loading: shopLoading } = useAppSelector((state) => state.shopSettings);
  const { bookingLoading } = useAppSelector((state) => state.appointments);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchShopSettings());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDate) {
      loadBookedTimes(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const loadBookedTimes = async (date: string) => {
    const result = await dispatch(fetchAppointmentsForDate(date));
    if (result.meta.requestStatus === 'fulfilled') {
      const times = (result.payload as any[]).map((apt: any) => apt.appointment_time);
      setBookedTimes(times);
    }
  };

  const generateTimeSlots = () => {
    if (!settings?.working_hours || !selectedDate) return [];

    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    const dayHours = settings.working_hours[dayOfWeek];

    if (!dayHours || dayHours.closed) return [];

    const slots: string[] = [];
    const [startHour, startMin] = dayHours.start.split(':').map(Number);
    const [endHour, endMin] = dayHours.end.split(':').map(Number);
    const interval = settings.appointment_duration || 30;

    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (current < end) {
      const hour = Math.floor(current / 60);
      const minute = current % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      if (!bookedTimes.includes(timeString)) {
        slots.push(timeString);
      }
      
      current += interval;
    }

    return slots;
  };

  const handleBooking = async () => {
    if (!profile || !selectedDate || !selectedTime || !selectedService) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const result = await dispatch(createAppointment({
      customer_id: profile.id,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: selectedTime,
      service: selectedService,
      price: 100, // Default price
      notes: notes || undefined,
    }));

    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/my-appointments');
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfToday();
    const maxDate = addDays(today, 30);
    
    if (isBefore(date, today) || isAfter(date, maxDate)) {
      return true;
    }

    if (!settings?.working_hours) return false;

    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const dayHours = settings.working_hours[dayOfWeek];
    
    return dayHours?.closed === true;
  };

  if (shopLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (settings.shop_status === 'closed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-medium text-center mb-2">Dükkan Şu An Kapalı</p>
              <p className="text-muted-foreground text-center">
                Şu anda randevu alınamamaktadır. Lütfen daha sonra tekrar deneyin.
              </p>
              <Link to="/" className="mt-4">
                <Button variant="outline">Ana Sayfaya Dön</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/my-appointments" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              Randevularıma Dön
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{settings.shop_name}</h1>
            <p className="text-muted-foreground">Randevu almak için tarih, saat ve hizmet seçin</p>
          </div>

          {/* Shop Info */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Scissors className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{settings.shop_name}</p>
                    <p className="text-sm text-muted-foreground">Berber Dükkanı</p>
                  </div>
                </div>
                {settings.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm">{settings.address}</p>
                  </div>
                )}
                {settings.phone && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm">{settings.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Tarih Seçin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime('');
                  }}
                  disabled={isDateDisabled}
                  locale={tr}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time and Service Selection */}
            <div className="space-y-6">
              {/* Service Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5" />
                    Hizmet Seçin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hizmet seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.services?.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Time Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Saat Seçin
                  </CardTitle>
                  <CardDescription>
                    {selectedDate 
                      ? `${format(selectedDate, 'dd MMMM yyyy', { locale: tr })} için müsait saatler`
                      : 'Önce tarih seçin'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Bu tarihte müsait saat bulunmuyor
                      </p>
                    )
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Lütfen önce bir tarih seçin
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Not (Opsiyonel)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Eklemek istediğiniz notlar..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Book Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || !selectedService || bookingLoading}
              >
                {bookingLoading ? 'Randevu Alınıyor...' : 'Randevu Al'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
