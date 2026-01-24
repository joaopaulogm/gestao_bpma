import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Target,
  Users,
  Anchor,
  Plane,
  Calendar as CalendarIcon,
  Building2,
  Edit2,
} from 'lucide-react';
import { TeamForDay, UnitType, AdminSectionType, STATUS_COLORS } from '@/hooks/useCampanhaCalendar';
import { MemberStatusRow } from './MemberStatusRow';

const unitIcons: Record<UnitType, React.ReactNode> = {
  'Guarda': <Shield className="h-5 w-5" />,
  'Armeiro': <Target className="h-5 w-5" />,
  'RP Ambiental': <CalendarIcon className="h-5 w-5" />,
  'GOC': <Users className="h-5 w-5" />,
  'Lacustre': <Anchor className="h-5 w-5" />,
  'GTA': <Plane className="h-5 w-5" />,
};

const teamColors: Record<string, string> = {
  'Alfa': 'bg-red-500/20 text-red-700 border-red-500/30',
  'Bravo': 'bg-primary/20 text-primary border-primary/30',
  'Charlie': 'bg-green-500/20 text-green-700 border-green-500/30',
  'Delta': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
};

interface CampanhaDayViewProps {
  currentDate: Date;
  teams: TeamForDay[];
  isFeriado: (date: Date) => boolean;
  hasAlteracao: (date: Date, unidade: UnitType) => boolean;
  editMode: boolean;
  onEditUnit: (date: Date, unidade: UnitType) => void;
  ADMIN_SECTIONS: AdminSectionType[];
  getMembrosForAdminSection: (section: AdminSectionType) => { id: string; efetivo?: { nome_guerra?: string; posto_graduacao?: string } }[];
  administrativoTrabalha: (date: Date) => boolean;
}

export const CampanhaDayView: React.FC<CampanhaDayViewProps> = ({
  currentDate,
  teams,
  isFeriado,
  hasAlteracao,
  editMode,
  onEditUnit,
  ADMIN_SECTIONS,
  getMembrosForAdminSection,
  administrativoTrabalha,
}) => {
  const isHoliday = isFeriado(currentDate);
  const admTrabalha = administrativoTrabalha(currentDate);

  return (
    <div className="space-y-6">
      {isHoliday && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4 text-center">
            <p className="text-red-600 font-medium">Feriado Nacional</p>
          </CardContent>
        </Card>
      )}

      {/* Unidades Operacionais */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Unidades Operacionais
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.unidade} className="flex flex-col overflow-hidden">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0 text-muted-foreground">
                      {unitIcons[team.unidade]}
                    </span>
                    <span className="truncate font-semibold">{team.unidade}</span>
                    {team.equipe && (
                      <Badge variant="outline" className={`text-xs shrink-0 ${teamColors[team.equipe]}`}>
                        {team.equipe}
                      </Badge>
                    )}
                    {hasAlteracao(currentDate, team.unidade) && (
                      <Badge variant="outline" className="text-xs shrink-0 bg-amber-500/10 text-amber-700 border-amber-500/30">
                        <Edit2 className="h-3 w-3 mr-0.5" />
                        Alteração
                      </Badge>
                    )}
                  </div>
                  {editMode && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-8"
                      onClick={() => onEditUnit(currentDate, team.unidade)}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  )}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-1">
                  {team.counts.apto > 0 && (
                    <span className={`text-xs ${STATUS_COLORS.apto.text}`}>● {team.counts.apto} aptos</span>
                  )}
                  {team.counts.impedido > 0 && (
                    <span className={`text-xs ${STATUS_COLORS.impedido.text}`}>● {team.counts.impedido} impedidos</span>
                  )}
                  {team.counts.restricao > 0 && (
                    <span className={`text-xs ${STATUS_COLORS.restricao.text}`}>● {team.counts.restricao}</span>
                  )}
                  {team.counts.atestado > 0 && (
                    <span className={`text-xs ${STATUS_COLORS.atestado.text}`}>● {team.counts.atestado} atestado</span>
                  )}
                  {team.counts.voluntario > 0 && (
                    <span className={`text-xs ${STATUS_COLORS.voluntario.text}`}>● {team.counts.voluntario} vol.</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3 flex-1 min-h-0">
                <div className="space-y-1.5">
                  {team.membros.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">Nenhum membro</p>
                  ) : (
                    team.membros.map((m) => (
                      <MemberStatusRow key={m.id} member={m} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Seções Administrativas — apenas quando administrativo trabalha (Seg–Sex, exceto feriado) */}
      {admTrabalha && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Seções Administrativas
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ADMIN_SECTIONS.map((section) => {
              const membros = getMembrosForAdminSection(section);
              if (membros.length === 0) return null;
              return (
                <Card key={section}>
                  <CardHeader className="py-2 px-3">
                    <span className="text-sm font-medium">{section}</span>
                  </CardHeader>
                  <CardContent className="py-1 px-3 pb-2">
                    <ul className="space-y-1">
                      {membros.map((m) => (
                        <li key={m.id} className="text-xs flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {m.efetivo?.posto_graduacao || '-'}
                          </Badge>
                          <span className="truncate">{m.efetivo?.nome_guerra || '—'}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
