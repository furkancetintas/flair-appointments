import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchBarberByProfileId } from "@/store/slices/barbersSlice";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays, startOfDay, endOfDay } from "date-fns";
import { tr } from "date-fns/locale";

interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  daily: { date: string; amount: number }[];
  weekly: { week: string; amount: number }[];
  monthly: { month: string; amount: number }[];
}

export default function AdminEarnings() {
  const dispatch = useAppDispatch();
  const { profile } = useAuth();
  const { currentBarber } = useAppSelector((state) => state.barbers);
  const [activeTab, setActiveTab] = useState("daily");
  const [earningsData, setEarningsData] = useState<EarningsData>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    daily: [],
    weekly: [],
    monthly: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchBarberByProfileId(profile.id));
    }
  }, [dispatch, profile?.id]);

  useEffect(() => {
    if (currentBarber?.id) {
      fetchEarningsData();
    }
  }, [currentBarber?.id]);

  const fetchEarningsData = async () => {
    if (!currentBarber?.id) return;

    try {
      setLoading(true);
      
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
      const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
      const startOfThisMonth = startOfMonth(today);
      const endOfThisMonth = endOfMonth(today);

      // Fetch today's earnings
      const { data: todayEarnings } = await supabase
        .from('earnings')
        .select('amount')
        .eq('barber_id', currentBarber.id)
        .gte('earned_date', format(startOfToday, 'yyyy-MM-dd'))
        .lte('earned_date', format(endOfToday, 'yyyy-MM-dd'));

      // Fetch this week's earnings
      const { data: weekEarnings } = await supabase
        .from('earnings')
        .select('amount')
        .eq('barber_id', currentBarber.id)
        .gte('earned_date', format(startOfThisWeek, 'yyyy-MM-dd'))
        .lte('earned_date', format(endOfThisWeek, 'yyyy-MM-dd'));

      // Fetch this month's earnings
      const { data: monthEarnings } = await supabase
        .from('earnings')
        .select('amount')
        .eq('barber_id', currentBarber.id)
        .gte('earned_date', format(startOfThisMonth, 'yyyy-MM-dd'))
        .lte('earned_date', format(endOfThisMonth, 'yyyy-MM-dd'));

      // Fetch daily earnings for the past 7 days
      const dailyEarnings = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const { data: dayData } = await supabase
          .from('earnings')
          .select('amount')
          .eq('barber_id', currentBarber.id)
          .eq('earned_date', format(date, 'yyyy-MM-dd'));
        
        dailyEarnings.push({
          date: format(date, 'eee', { locale: tr }).substring(0, 3),
          amount: dayData?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0
        });
      }

      // Fetch weekly earnings for the past 4 weeks
      const weeklyEarnings = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subDays(today, i * 7), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(subDays(today, i * 7), { weekStartsOn: 1 });
        const { data: weekData } = await supabase
          .from('earnings')
          .select('amount')
          .eq('barber_id', currentBarber.id)
          .gte('earned_date', format(weekStart, 'yyyy-MM-dd'))
          .lte('earned_date', format(weekEnd, 'yyyy-MM-dd'));
        
        weeklyEarnings.push({
          week: `${4 - i}. Hafta`,
          amount: weekData?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0
        });
      }

      // Fetch monthly earnings for the past 3 months
      const monthlyEarnings = [];
      for (let i = 2; i >= 0; i--) {
        const monthStart = startOfMonth(subDays(today, i * 30));
        const monthEnd = endOfMonth(subDays(today, i * 30));
        const { data: monthData } = await supabase
          .from('earnings')
          .select('amount')
          .eq('barber_id', currentBarber.id)
          .gte('earned_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('earned_date', format(monthEnd, 'yyyy-MM-dd'));
        
        monthlyEarnings.push({
          month: format(subDays(today, i * 30), 'MMMM', { locale: tr }),
          amount: monthData?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0
        });
      }

      setEarningsData({
        today: todayEarnings?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0,
        thisWeek: weekEarnings?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0,
        thisMonth: monthEarnings?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0,
        daily: dailyEarnings,
        weekly: weeklyEarnings,
        monthly: monthlyEarnings,
      });
    } catch (error) {
      console.error('Kazanç verileri alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const ChartBar = ({ label, amount, maxAmount }: { label: string; amount: number; maxAmount: number }) => {
    const percentage = (amount / maxAmount) * 100;
    
    return (
      <div className="flex items-end gap-0.5 h-32">
        <div className="flex flex-col justify-end h-full w-6 lg:w-16">
          <div 
            className="bg-primary rounded-t-md transition-all duration-300 min-h-[4px] flex items-end justify-center pb-2"
            style={{ height: `${percentage}%` }}
          >
            <span className="text-xs font-medium text-primary-foreground">₺{amount}</span>
          </div>
          <div className="text-center text-sm mt-2 font-medium">{label}</div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    const data = earningsData[activeTab as keyof typeof earningsData];
    if (!Array.isArray(data)) return null;

    const maxAmount = Math.max(...data.map(item => item.amount));

    return (
      <div className="flex justify-center gap-0.5 p-6">
        {data.map((item, index) => (
          <ChartBar
            key={index}
            label={item.date || item.week || item.month}
            amount={item.amount}
            maxAmount={maxAmount}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Kazançlar</h2>
          <p className="text-muted-foreground">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Kazançlar</h2>
        <p className="text-muted-foreground">
          Günlük, haftalık ve aylık kazançlarınızı takip edin
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünün Kazançları</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{earningsData.today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Son 24 saat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Haftanın Kazançları</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{earningsData.thisWeek.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Bu hafta toplam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ayın Kazançları</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{earningsData.thisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay toplam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Kazanç Analizi
          </CardTitle>
          <CardDescription>
            Farklı zaman aralıklarındaki kazançlarınızı görselleştirin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Günlük</TabsTrigger>
              <TabsTrigger value="weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly">Aylık</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="mt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Bu Haftanın Günlük Kazançları</h3>
                <p className="text-sm text-muted-foreground">Son 7 günün detaylı analizi</p>
              </div>
              {renderChart()}
            </TabsContent>
            
            <TabsContent value="weekly" className="mt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Bu Ayın Haftalık Kazançları</h3>
                <p className="text-sm text-muted-foreground">Son 4 haftanın detaylı analizi</p>
              </div>
              {renderChart()}
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Son 3 Ayın Kazançları</h3>
                <p className="text-sm text-muted-foreground">Aylık kazanç trendi</p>
              </div>
              {renderChart()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}