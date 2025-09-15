import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scissors, Calendar, Users, Star, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="bg-primary rounded-full p-4">
              <Scissors className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">BarberBook</h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Berber randevularınızı
            <span className="text-primary block md:inline"> kolayca yönetin</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Müşteriler berberleri keşfedip randevu alabilir, berberler de randevularını kolayca yönetebilir. 
            Modern ve kullanıcı dostu arayüzümüzle berber sektörünü dijitalleştiriyoruz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="flex items-center gap-2 text-lg px-8 py-6">
                Hemen Başla
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/barbers">
              <Button variant="outline" size="lg" className="flex items-center gap-2 text-lg px-8 py-6">
                <Scissors className="h-5 w-5" />
                Berberleri Keşfet
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Neden BarberBook?</h3>
          <p className="text-muted-foreground text-lg">
            Hem müşteriler hem de berberler için tasarlanmış özellikler
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-3">Kolay Randevu</h4>
            <p className="text-muted-foreground">
              Sevdiğiniz berberden sadece birkaç tıkla randevu alın. Müsait saatleri görün ve anında rezervasyon yapın.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-3">Müşteri Yönetimi</h4>
            <p className="text-muted-foreground">
              Berberler randevularını kolayca yönetebilir, müşteri bilgilerini görüntüleyebilir ve randevuları onaylayabilir.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-3">Kaliteli Hizmet</h4>
            <p className="text-muted-foreground">
              Berber profillerini inceleyin, hizmetleri ve fiyatları karşılaştırın. Size en uygun berberi bulun.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
          <h3 className="text-3xl font-bold mb-4">Hemen Başlayın</h3>
          <p className="text-xl mb-8 opacity-90">
            Müşteri misiniz yoksa berber mi? Her iki rol için de mükemmel çözümlerimiz var.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                Müşteri Kaydı
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Berber Kaydı
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
