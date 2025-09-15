import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, Star, Search, Scissors } from 'lucide-react';

interface Barber {
  id: string;
  shop_name: string;
  address: string | null;
  description: string | null;
  services: string[];
  working_hours: any;
  price_range: string | null;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

const Barbers = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBarbers(barbers);
    } else {
      const filtered = barbers.filter(barber => 
        barber.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barber.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barber.services.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredBarbers(filtered);
    }
  }, [searchTerm, barbers]);

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profile:profiles!profile_id(full_name, email, phone)
        `)
        .order('shop_name');

      if (error) {
        console.error('Error fetching barbers:', error);
        return;
      }

      setBarbers(data || []);
      setFilteredBarbers(data || []);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Çalışma saatleri belirtilmemiş';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    const openDays = days
      .map((day, index) => {
        const dayInfo = workingHours[day];
        if (dayInfo && !dayInfo.closed) {
          return `${dayNames[index]}: ${dayInfo.start}-${dayInfo.end}`;
        }
        return null;
      })
      .filter(Boolean);
    
    return openDays.length > 0 ? openDays.slice(0, 2).join(', ') : 'Kapalı';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Berberler</h1>
          <p className="text-muted-foreground">
            Size en yakın berberleri keşfedin ve randevu alın
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Berber, hizmet veya konum ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Link to="/dashboard">
            <Button variant="outline">
              ← Dashboard'a Dön
            </Button>
          </Link>
        </div>

        {/* Barbers Grid */}
        {filteredBarbers.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {searchTerm ? 'Arama kriterlerinize uygun berber bulunamadı.' : 'Henüz kayıtlı berber yok.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBarbers.map((barber) => (
              <Card key={barber.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Scissors className="h-5 w-5 text-primary" />
                        {barber.shop_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {barber.profile.full_name}
                      </CardDescription>
                    </div>
                    {barber.price_range && (
                      <Badge variant="secondary">
                        {barber.price_range} ₺
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {barber.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {barber.address}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {formatWorkingHours(barber.working_hours)}
                      </span>
                    </div>

                    {barber.description && (
                      <p className="text-sm text-muted-foreground">
                        {barber.description}
                      </p>
                    )}

                    {barber.services.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {barber.services.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {barber.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{barber.services.length - 3} daha
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="pt-4">
                      <Link to={`/barber/${barber.id}`}>
                        <Button className="w-full">
                          Profili Görüntüle
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Barbers;