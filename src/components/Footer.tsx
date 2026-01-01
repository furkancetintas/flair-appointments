import { Link } from "react-router-dom";
import { Scissors, MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Ömrüm Kuaför</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Profesyonel erkek kuaförü hizmetleri ile stilinizi yansıtın. 
              Online randevu sistemi ile beklemeden hizmet alın.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Hızlı Bağlantılar</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Ana Sayfa
              </Link>
              <Link to="/book" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Randevu Al
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Giriş Yap
              </Link>
              <Link to="/my-appointments" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Randevularım
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Hizmetlerimiz</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>Saç Kesimi</li>
              <li>Sakal Tıraşı</li>
              <li>Saç Yıkama</li>
              <li>Cilt Bakımı</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">İletişim</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Bademlik, Bademlik Yolu Cd. No:184, 06300 Keçiören/Ankara
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:+905323223109" className="text-muted-foreground hover:text-primary transition-colors">
                  +90 532 322 31 09
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-muted-foreground">
                  <p>Pzt - Cmt: 09:00 - 21:00</p>
                  <p>Pazar: Kapalı</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Ömrüm Erkek Kuaförü. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">
                Gizlilik Politikası
              </Link>
              <Link to="/" className="hover:text-primary transition-colors">
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
