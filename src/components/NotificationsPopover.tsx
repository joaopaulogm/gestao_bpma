import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, Check, Calendar, Users, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  categoria: string | null;
  lida: boolean;
  data_leitura: string | null;
  dados_extras: Record<string, unknown>;
  created_at: string;
}

const NotificationsPopover = () => {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  useEffect(() => {
    if (user?.id) {
      fetchNotificacoes();
    }
  }, [user?.id]);

  const fetchNotificacoes = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await (supabase as { rpc: (name: string, params: object) => Promise<{ data: Notificacao[] | null; error: unknown }> }).rpc('buscar_notificacoes_usuario', {
        p_user_id: user.id,
        p_apenas_nao_lidas: false
      });

      if (error) throw error;
      setNotificacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (notificacaoId: string) => {
    try {
      await (supabase as { rpc: (name: string, params: object) => Promise<{ error: unknown }> }).rpc('marcar_notificacao_lida', {
        p_notificacao_id: notificacaoId
      });

      setNotificacoes(prev =>
        prev.map(n =>
          n.id === notificacaoId ? { ...n, lida: true } : n
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    const naoLidas = notificacoes.filter(n => !n.lida);
    for (const n of naoLidas) {
      await marcarComoLida(n.id);
    }
  };

  const getIcon = (tipo: string, categoria: string | null) => {
    if (categoria === 'ferias') return <Calendar className="h-4 w-4 text-blue-500" />;
    if (categoria === 'escala') return <Users className="h-4 w-4 text-purple-500" />;
    if (categoria === 'afastamento') return <AlertCircle className="h-4 w-4 text-orange-500" />;
    
    switch (tipo) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasComoLidas}
              className="text-xs h-7"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notificacao.lida ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => !notificacao.lida && marcarComoLida(notificacao.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notificacao.tipo, notificacao.categoria)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {notificacao.titulo}
                        </p>
                        {!notificacao.lida && (
                          <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notificacao.mensagem}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(notificacao.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
