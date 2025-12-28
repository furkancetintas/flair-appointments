import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchShopSettings, updateShopSettings } from "@/store/slices/shopSettingsSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar } from "lucide-react";

interface DayHours { start: string; end: string; closed: boolean; }

export default function AdminWorkingHours() {
  const dispatch = useAppDispatch();
  const { settings, updateLoading } = useAppSelector((state) => state.shopSettings);
  const [workingHours, setWorkingHours] = useState<Record<string, DayHours>>({ monday: { start: "09:00", end: "18:00", closed: false }, tuesday: { start: "09:00", end: "18:00", closed: false }, wednesday: { start: "09:00", end: "18:00", closed: false }, thursday: { start: "09:00", end: "18:00", closed: false }, friday: { start: "09:00", end: "18:00", closed: false }, saturday: { start: "09:00", end: "18:00", closed: false }, sunday: { start: "09:00", end: "18:00", closed: true } });
  const [duration, setDuration] = useState(30);

  useEffect(() => { dispatch(fetchShopSettings()); }, [dispatch]);
  useEffect(() => { if (settings?.working_hours) setWorkingHours(settings.working_hours); if (settings?.appointment_duration) setDuration(settings.appointment_duration); }, [settings]);

  const days = { monday: "Pazartesi", tuesday: "Salı", wednesday: "Çarşamba", thursday: "Perşembe", friday: "Cuma", saturday: "Cumartesi", sunday: "Pazar" };
  const times = Array.from({ length: 36 }, (_, i) => { const h = Math.floor(i / 2) + 6; const m = (i % 2) * 30; return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`; });

  const handleSave = () => dispatch(updateShopSettings({ working_hours: workingHours, appointment_duration: duration }));

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl sm:text-2xl font-bold mb-2">Çalışma Saatleri</h2><p className="text-sm sm:text-base text-muted-foreground">Haftalık programınızı ayarlayın</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Calendar className="h-5 w-5" />Program</CardTitle></CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {Object.entries(days).map(([key, name]) => (
            <div key={key} className="p-3 sm:p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Label className="min-w-[70px] sm:min-w-[100px] text-sm sm:text-base">{name}</Label>
                  <Switch checked={!workingHours[key]?.closed} onCheckedChange={(c) => setWorkingHours(p => ({ ...p, [key]: { ...p[key], closed: !c } }))} />
                  <span className="text-xs sm:text-sm text-muted-foreground">{workingHours[key]?.closed ? "Kapalı" : "Açık"}</span>
                </div>
              </div>
              {!workingHours[key]?.closed && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Açılış</Label>
                    <select value={workingHours[key]?.start} onChange={(e) => setWorkingHours(p => ({ ...p, [key]: { ...p[key], start: e.target.value } }))} className="w-full p-2 text-sm border rounded-md bg-background">{times.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Kapanış</Label>
                    <select value={workingHours[key]?.end} onChange={(e) => setWorkingHours(p => ({ ...p, [key]: { ...p[key], end: e.target.value } }))} className="w-full p-2 text-sm border rounded-md bg-background">{times.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Button onClick={handleSave} disabled={updateLoading} className="w-full">{updateLoading ? "Kaydediliyor..." : "Kaydet"}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Clock className="h-5 w-5" />Randevu Süresi</CardTitle></CardHeader>
        <CardContent><select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full p-2 text-sm border rounded-md bg-background"><option value={15}>15 dk</option><option value={30}>30 dk</option><option value={45}>45 dk</option><option value={60}>60 dk</option></select></CardContent>
      </Card>
    </div>
  );
}
