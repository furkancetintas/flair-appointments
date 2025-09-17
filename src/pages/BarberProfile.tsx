import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { MapPin, Clock, Phone, Mail, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Barber {
  id: string;
  shop_name: string;
  address: string | null;
  description: string | null;
  services: string[];
  working_hours: any;
  price_range: string | null;
  shop_status: string;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
}

const BarberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBarber();
      fetchExistingAppointments();
    }
  }, [id]);

  useEffect(() => {
    if (selectedDate && id) {
      fetchAppointmentsForDate();
    }
  }, [selectedDate, id]);

  const fetchBarber = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profile:profiles!profile_id(full_name, email, phone)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching barber:', error);
        return;
      }

      setBarber(data);
    } catch (error) {
      console.error('Error fetching barber:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time')
        .eq('barber_id', id);

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      setExistingAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchAppointmentsForDate = async () => {
    if (!selectedDate) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('barber_id', id)
        .eq('appointment_date', dateStr);

      if (error) {
        console.error('Error fetching appointments for date:', error);
        return;
      }

      // This will be used to filter out booked times
    } catch (error) {
      console.error('Error fetching appointments for date:', error);
    }
  };

  const generateTimeSlots = () => {
    if (!barber || !selectedDate) return [];

    const dayName = format(selectedDate, 'EEEE', { locale: tr }).toLowerCase();
    const englishDayMap: { [key: string]: string } = {
      'pazartesi': 'monday',
      'salı': 'tuesday', 
      'çarşamba': 'wednesday',
      'perşembe': 'thursday',
      'cuma': 'friday',
      'cumartesi': 'saturday',
      'pazar': 'sunday'
    };

    const englishDay = englishDayMap[dayName];
    const daySchedule = barber.working_hours?.[englishDay];

    if (!daySchedule || daySchedule.closed) {
      return [];
    }

    const slots = [];
    const startTime = daySchedule.start;
    const endTime = daySchedule.end;
    
    // Generate 30-minute slots
    let currentHour = parseInt(startTime.split(':')[0]);
    let currentMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check if this time slot is already booked
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const isBooked = existingAppointments.some(
        apt => apt.appointment_date === dateStr && apt.appointment_time === timeString
      );

      if (!isBooked) {
        slots.push(timeString);
      }

      // Add 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Çalışma saatleri belirtilmemiş';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    return days
      .map((day, index) => {
        const dayInfo = workingHours[day];
        if (dayInfo && !dayInfo.closed) {
          return `${dayNames[index]}: ${dayInfo.start}-${dayInfo.end}`;
        }
        return `${dayNames[index]}: Kapalı`;
      })
      .join('\n');
  };

  const handleBookAppointment = async () => {
    if (!profile || !selectedDate || !selectedTime || !selectedService) {
      toast.error('Lütfen tüm alanları doldurunuz');
      return;
    }

    setBookingLoading(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          customer_id: profile.id,
          barber_id: id,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          service: selectedService,
          notes: notes.trim() || null,
          status: 'pending'
        });

      if (error) {
        console.error('Error booking appointment:', error);
        toast.error('Randevu alınırken bir hata oluştu');
        return;
      }

      toast.success('Randevunuz başarıyla alındı!');
      
      // Reset form
      setSelectedTime('');
      setSelectedService('');
      setNotes('');
      
      // Refresh appointments
      fetchExistingAppointments();
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Randevu alınırken bir hata oluştu');
    } finally {
      setBookingLoading(false);
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Bugün';
    if (isTomorrow(date)) return 'Yarın';
    return format(date, 'dd MMMM yyyy', { locale: tr });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              Berber bulunamadı.
            </p>
            <Link to="/barbers" className="mt-4">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Berberlere Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/barbers">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Berberlere Dön
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Barber Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{barber.shop_name}</CardTitle>
                <CardDescription className="text-lg">
                  {barber.profile.full_name}
                </CardDescription>
                <div className="flex gap-2">
                  <Badge variant={barber.shop_status === 'open' ? 'default' : 'secondary'}>
                    {barber.shop_status === 'open' ? 'Açık' : 'Kapalı'}
                  </Badge>
                  {barber.price_range && (
                    <Badge variant="outline">
                      {barber.price_range} ₺
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {barber.description && (
                  <p className="text-muted-foreground">{barber.description}</p>
                )}

                {barber.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <span>{barber.address}</span>
                  </div>
                )}

                {barber.profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{barber.profile.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{barber.profile.email}</span>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <pre className="text-sm whitespace-pre-line">
                    {formatWorkingHours(barber.working_hours)}
                  </pre>
                </div>

                {barber.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Hizmetler</h3>
                    <div className="flex flex-wrap gap-2">
                      {barber.services.map((service, index) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Appointment Booking */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Randevu Al
                </CardTitle>
                <CardDescription>
                  Müsait bir tarih ve saat seçerek randevu alabilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label className="text-base font-semibold">Tarih Seçin</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                    className="rounded-md border mt-2"
                    locale={tr}
                  />
                  {selectedDate && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Seçili tarih: {getDateLabel(selectedDate)}
                    </p>
                  )}
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <Label className="text-base font-semibold">Saat Seçin</Label>
                    {timeSlots.length > 0 ? (
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Müsait saatlerden seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2 p-4 bg-muted rounded-md">
                        Bu tarih için müsait saat bulunmamaktadır.
                      </p>
                    )}
                  </div>
                )}

                {/* Service Selection */}
                {selectedTime && (
                  <div>
                    <Label className="text-base font-semibold">Hizmet Seçin</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Hizmet seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {barber.services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Notes */}
                {selectedService && (
                  <div>
                    <Label htmlFor="notes" className="text-base font-semibold">
                      Notlar (Opsiyonel)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Book Button */}
                {selectedDate && selectedTime && selectedService && (
                  <Button 
                    onClick={handleBookAppointment}
                    disabled={bookingLoading}
                    className="w-full"
                    size="lg"
                  >
                    {bookingLoading ? 'Randevu Alınıyor...' : 'Randevu Al'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberProfile;