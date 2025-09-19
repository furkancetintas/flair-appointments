import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";

export default function AdminEarnings() {
  const [activeTab, setActiveTab] = useState("daily");

  // Dummy data - in real app, fetch from API
  const earningsData = {
    today: 1250,
    thisWeek: 8750,
    thisMonth: 32500,
    daily: [
      { date: "Pzt", amount: 850 },
      { date: "Sal", amount: 1200 },
      { date: "Çar", amount: 950 },
      { date: "Per", amount: 1400 },
      { date: "Cum", amount: 1600 },
      { date: "Cmt", amount: 1100 },
      { date: "Paz", amount: 800 },
    ],
    weekly: [
      { week: "1. Hafta", amount: 6500 },
      { week: "2. Hafta", amount: 7200 },
      { week: "3. Hafta", amount: 8100 },
      { week: "4. Hafta", amount: 8750 },
    ],
    monthly: [
      { month: "Ocak", amount: 28500 },
      { month: "Şubat", amount: 31200 },
      { month: "Mart", amount: 32500 },
    ],
  };

  const ChartBar = ({ label, amount, maxAmount }: { label: string; amount: number; maxAmount: number }) => {
    const percentage = (amount / maxAmount) * 100;
    
    return (
      <div className="flex items-end gap-2 h-32">
        <div className="flex flex-col justify-end h-full w-16">
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
      <div className="flex justify-center gap-4 p-6">
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