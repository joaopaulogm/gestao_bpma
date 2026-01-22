import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'cookie-consent';

interface CookieConsentBannerProps {
  className?: string;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      essential: true,
      functional: true,
      performance: true,
      timestamp: new Date().toISOString()
    }));
    closeBanner();
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      essential: true,
      functional: false,
      performance: false,
      timestamp: new Date().toISOString()
    }));
    closeBanner();
  };

  const closeBanner = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 transition-all duration-300",
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
        className
      )}
    >
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Este site utiliza cookies
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento do sistema e cookies opcionais 
                para melhorar sua experiência. Você pode aceitar todos ou apenas os essenciais.
                {' '}
                <Link 
                  to="/politica-cookies" 
                  className="text-primary hover:underline font-medium"
                >
                  Saiba mais
                </Link>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={handleAccept}
                  className="gap-2"
                  size="sm"
                >
                  <Check className="h-4 w-4" />
                  Aceitar Todos
                </Button>
                <Button 
                  onClick={handleRejectNonEssential}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  Apenas Essenciais
                </Button>
                <Link to="/politica-cookies">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Personalizar
                  </Button>
                </Link>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRejectNonEssential}
              className="shrink-0 h-8 w-8"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar decoration */}
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      </div>
    </div>
  );
};

export default CookieConsentBanner;
