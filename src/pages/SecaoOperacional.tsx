import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ExternalLink, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSectionCardItems, getSectionByPath } from '@/config/nav';

const SecaoOperacional: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const publicDashboardUrl = 'https://gestao-bpma.lovable.app/dashboard-publico';
  const section = getSectionByPath('/secao-operacional');
  const menuItems = getSectionCardItems('/secao-operacional');
  const SectionIcon = section?.icon ?? Briefcase;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicDashboardUrl);
      setCopied(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar link');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 h-full overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <SectionIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Seção Operacional</h1>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={publicDashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard Público</span>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copiar Link</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <Card className="h-full bg-primary border-primary/50 hover:shadow-[0_0_25px_rgba(255,204,0,0.5)] transition-all duration-300 cursor-pointer group active:scale-95">
                <CardContent className="p-3 sm:p-4 md:p-6 flex flex-col items-center text-center">
                  <div className="p-2 sm:p-3 md:p-4 rounded-full bg-accent/10 mb-2 sm:mb-3 md:mb-4 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-accent" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-foreground mb-1 sm:mb-2 line-clamp-2 hyphens-auto">{item.label}</h3>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SecaoOperacional;
