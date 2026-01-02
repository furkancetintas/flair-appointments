import { useEffect, useState, useMemo } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchAdminAppointments, updateAppointmentStatus } from "@/store/slices/appointmentsSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Clock, User, CheckCircle, XCircle, Phone } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminAppointments() {
  const dispatch = useAppDispatch();
  const { adminAppointments, loading } = useAppSelector((state) => state.appointments);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    dispatch(fetchAdminAppointments());
  }, [dispatch]);

  const filteredAppointments = useMemo(() => {
    return adminAppointments.filter(appointment => {
      const selected = format(selectedDate, 'yyyy-MM-dd');
      return appointment.appointment_date === selected;
    });
  }, [adminAppointments, selectedDate]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    await dispatch(updateAppointmentStatus({ appointmentId, status: newStatus }));
  };

  const getStatusBadge = (status: string) => {
    const config = { pending: { label: "Bekliyor", variant: "secondary" as const }, confirmed: { label: "Onaylandı", variant: "default" as const }, cancelled: { label: "İptal", variant: "destructive" as const }, completed: { label: "Tamamlandı", variant: "outline" as const } };
    const c = config[status as keyof typeof config] || config.pending;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-semibold mb-2">Randevular</h2><p className="text-sm sm:text-base text-muted-foreground">Müşteri randevularını yönetin</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Bugünkü</CardTitle><Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">{filteredAppointments.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Bekleyen</CardTitle><Clock className="h-4 w-4 text-muted-foreground hidden sm:block" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">{filteredAppointments.filter(a => a.status === 'pending').length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Onaylanan</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground hidden sm:block" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">{filteredAppointments.filter(a => a.status === 'confirmed').length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium">İptal</CardTitle><XCircle className="h-4 w-4 text-muted-foreground hidden sm:block" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">{filteredAppointments.filter(a => a.status === 'cancelled').length}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div><CardTitle className="text-base sm:text-lg">Randevu Listesi</CardTitle><CardDescription className="text-xs sm:text-sm">Seçili tarihteki randevular</CardDescription></div>
            <Popover><PopoverTrigger asChild><Button variant="outline" size="sm" className={cn("justify-start text-left font-normal text-xs sm:text-sm")}><Calendar className="mr-2 h-4 w-4" />{format(selectedDate, 'dd MMM yyyy', { locale: tr })}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="end"><CalendarComponent mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} locale={tr} /></PopoverContent></Popover>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {/* Mobile View */}
          <div className="block md:hidden space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Bu tarihte randevu yok</p>
              </div>
            ) : filteredAppointments.map((apt) => (
              <div key={apt.id} className="p-3 border rounded-lg space-y-2 bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{apt.customer?.full_name || 'İsimsiz'}</p>
                    {apt.customer?.phone && (
                      <a href={`tel:${apt.customer.phone}`} className="text-xs text-primary flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />{apt.customer.phone}
                      </a>
                    )}
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.appointment_time}</span>
                  <span>{apt.service}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  {apt.status === 'pending' && (<><Button size="sm" className="flex-1 text-xs h-8" onClick={() => handleStatusUpdate(apt.id, 'confirmed')}>Onayla</Button><Button size="sm" variant="destructive" className="flex-1 text-xs h-8" onClick={() => handleStatusUpdate(apt.id, 'cancelled')}>İptal</Button></>)}
                  {apt.status === 'confirmed' && <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => handleStatusUpdate(apt.id, 'completed')}>Tamamla</Button>}
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Müşteri</TableHead><TableHead>Telefon</TableHead><TableHead>Saat</TableHead><TableHead>Hizmet</TableHead><TableHead>Durum</TableHead><TableHead>İşlemler</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground">Bu tarihte randevu yok</p></TableCell></TableRow>
                ) : filteredAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell><div className="flex items-center gap-2"><User className="h-4 w-4" /><div><p className="font-medium">{apt.customer?.full_name || 'İsimsiz'}</p></div></div></TableCell>
                    <TableCell>{apt.customer?.phone ? <a href={`tel:${apt.customer.phone}`} className="text-primary hover:underline flex items-center gap-1"><Phone className="h-3 w-3" />{apt.customer.phone}</a> : <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{apt.appointment_time}</TableCell>
                    <TableCell>{apt.service}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (<><Button size="sm" onClick={() => handleStatusUpdate(apt.id, 'confirmed')}>Onayla</Button><Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(apt.id, 'cancelled')}>İptal</Button></>)}
                        {apt.status === 'confirmed' && <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(apt.id, 'completed')}>Tamamla</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
