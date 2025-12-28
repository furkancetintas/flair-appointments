import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchShopSettings } from "@/store/slices/shopSettingsSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays, startOfDay, endOfDay } from "date-fns";
import { tr } from "date-fns/locale";

interface EarningsData { today: number; thisWeek: number; thisMonth: number; daily: { date: string; amount: number }[]; weekly: { week: string; amount: number }[]; monthly: { month: string; amount: number }[]; }

export default function AdminEarnings() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("daily");
  const [earningsData, setEarningsData] = useState<EarningsData>({ today: 0, thisWeek: 0, thisMonth: 0, daily: [], weekly: [], monthly: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { dispatch(fetchShopSettings()); fetchEarningsData(); }, [dispatch]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      
      const { data: todayE } = await (supabase as any).from('earnings').select('amount').gte('earned_date', format(startOfDay(today), 'yyyy-MM-dd')).lte('earned_date', format(endOfDay(today), 'yyyy-MM-dd'));
      const { data: weekE } = await (supabase as any).from('earnings').select('amount').gte('earned_date', format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')).lte('earned_date', format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
      const { data: monthE } = await (supabase as any).from('earnings').select('amount').gte('earned_date', format(startOfMonth(today), 'yyyy-MM-dd')).lte('earned_date', format(endOfMonth(today), 'yyyy-MM-dd'));

      const daily = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const { data } = await (supabase as any).from('earnings').select('amount').eq('earned_date', format(date, 'yyyy-MM-dd'));
        daily.push({ date: format(date, 'eee', { locale: tr }).substring(0, 3), amount: data?.reduce((s: number, e: any) => s + Number(e.amount), 0) || 0 });
      }

      setEarningsData({
        today: todayE?.reduce((s: number, e: any) => s + Number(e.amount), 0) || 0,
        thisWeek: weekE?.reduce((s: number, e: any) => s + Number(e.amount), 0) || 0,
        thisMonth: monthE?.reduce((s: number, e: any) => s + Number(e.amount), 0) || 0,
        daily, weekly: [], monthly: []
      });
    } finally { setLoading(false); }
  };

  if (loading) return <div className="space-y-6"><h2 className="text-2xl font-bold">Kazançlar</h2><p>Yükleniyor...</p></div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl sm:text-2xl font-bold mb-2">Kazançlar</h2><p className="text-sm sm:text-base text-muted-foreground">Günlük, haftalık ve aylık kazançlarınızı takip edin</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Bugün</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">₺{earningsData.today}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Bu Hafta</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">₺{earningsData.thisWeek}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Bu Ay</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-xl sm:text-2xl font-bold">₺{earningsData.thisMonth}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><BarChart3 className="h-5 w-5" />Kazanç Analizi</CardTitle></CardHeader>
        <CardContent>
          <div className="flex justify-center gap-1 sm:gap-2 p-4 sm:p-6 overflow-x-auto">
            {earningsData.daily.map((d, i) => (
              <div key={i} className="flex flex-col items-center min-w-[40px] sm:min-w-[50px]">
                <div className="bg-primary rounded-t-md w-8 sm:w-12" style={{ height: `${Math.max(4, (d.amount / Math.max(...earningsData.daily.map(x => x.amount), 1)) * 100)}px` }}></div>
                <span className="text-[10px] sm:text-xs mt-1">{d.date}</span>
                <span className="text-[10px] sm:text-xs font-medium">₺{d.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
