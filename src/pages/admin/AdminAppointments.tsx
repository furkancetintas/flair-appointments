import { useEffect, useState, useMemo } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchBarberAppointments, updateAppointmentStatus } from "@/store/slices/appointmentsSlice";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminAppointments() {
  const dispatch = useAppDispatch();
  const { profile } = useAuth();
  const { barberAppointments, loading } = useAppSelector((state) => state.appointments);
  const { currentBarber } = useAppSelector((state) => state.barbers);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (currentBarber?.id) {
      dispatch(fetchBarberAppointments(currentBarber.id));
    }
  }, [dispatch, currentBarber?.id]);

  // Filter appointments by selected date
  const filteredAppointments = useMemo(() => {
    console.log('Filtering appointments:', { 
      totalAppointments: barberAppointments.length,
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      appointments: barberAppointments.map(a => ({
        id: a.id,
        date: a.appointment_date,
        customer: a.customer?.full_name
      }))
    });
    
    return barberAppointments.filter(appointment => {
      // Direct string comparison since appointment_date is already in 'YYYY-MM-DD' format
      const selected = format(selectedDate, 'yyyy-MM-dd');
      const matches = appointment.appointment_date === selected;
      
      console.log('Date comparison:', {
        appointmentDate: appointment.appointment_date,
        selectedDate: selected,
        matches
      });
      
      return matches;
    });
  }, [barberAppointments, selectedDate]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await dispatch(updateAppointmentStatus({ appointmentId, status: newStatus }));
      toast.success(`Randevu ${newStatus === 'confirmed' ? 'onaylandı' : 'iptal edildi'}`);
    } catch (error) {
      toast.error("İşlem sırasında bir hata oluştu");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Bekliyor", variant: "secondary" as const },
      confirmed: { label: "Onaylandı", variant: "default" as const },
      cancelled: { label: "İptal Edildi", variant: "destructive" as const },
      completed: { label: "Tamamlandı", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Randevular</h2>
        <p className="text-muted-foreground">
          Müşteri randevularını yönetin ve durumlarını güncelleyin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Randevular</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredAppointments.filter(app => app.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredAppointments.filter(app => app.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İptal Edilen</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredAppointments.filter(app => app.status === 'cancelled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Randevu Listesi</CardTitle>
              <CardDescription>
                Seçili tarihteki randevuları görüntüleyin ve yönetin
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'dd MMMM yyyy', { locale: tr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={tr}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Saat</TableHead>
                  <TableHead>Hizmet</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Notlar</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {format(selectedDate, 'dd MMMM yyyy', { locale: tr })} tarihinde randevu bulunmamaktadır
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{appointment.customer?.full_name || 'İsimsiz Müşteri'}</p>
                            <p className="text-sm text-muted-foreground">{appointment.customer?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(appointment.appointment_date), 'dd MMMM yyyy', { locale: tr })}
                      </TableCell>
                      <TableCell>
                        {appointment.appointment_time}
                      </TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{appointment.notes || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {appointment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                                className="text-xs"
                              >
                                Onayla
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                className="text-xs"
                              >
                                İptal Et
                              </Button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                              className="text-xs"
                            >
                              Tamamla
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}