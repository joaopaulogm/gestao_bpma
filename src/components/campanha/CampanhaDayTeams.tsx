import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Users, Building2 } from 'lucide-react';
import { TeamForDay, TeamType, UnitType, AdminSectionType, STATUS_COLORS } from '@/hooks/useCampanhaCalendar';
import { TeamMemberCard } from './TeamMemberCard';

const teamColors: Record<TeamType, string> = {
  'Alfa': 'bg-red-500/20 text-red-600 border-red-500/30',
  'Bravo': 'bg-primary/20 text-primary border-primary/30',
  'Charlie': 'bg-green-500/20 text-green-600 border-green-500/30',
  'Delta': 'bg-purple-500/20 text-purple-600 border-purple-500/30',
};

interface CampanhaDayTeamsProps {
  teams: TeamForDay[];
  onEditTeam?: (unidade: UnitType) => void;
  editMode?: boolean;
  adminSections?: AdminSectionType[];
  getMembrosForAdminSection?: (section: AdminSectionType) => any[];
  administrativoTrabalha?: boolean;
  isFeriado?: boolean;
}

export const CampanhaDayTeams: React.FC<CampanhaDayTeamsProps> = ({
  teams,
  onEditTeam,
  editMode = false,
  adminSections = [],
  getMembrosForAdminSection,
  administrativoTrabalha = true,
  isFeriado = false,
}) => {
  // Separar unidades operacionais e GTA
  const unidadesOperacionais = teams.filter(t => t.unidade !== 'GTA');
  const gta = teams.find(t => t.unidade === 'GTA');

  const TeamCard: React.FC<{ team: TeamForDay }> = ({ team }) => {
    const totalMembros = team.membros.length;
    const aptos = team.counts.apto;
    const impedidos = team.counts.impedido + team.counts.atestado + team.counts.restricao;

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">{team.unidade}</CardTitle>
              {team.equipe && (
                <Badge variant="outline" className={teamColors[team.equipe]}>
                  {team.equipe}
                </Badge>
              )}
            </div>
            {editMode && onEditTeam && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEditTeam(team.unidade)}
                aria-label={`Editar equipe ${team.unidade}`}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{totalMembros} membros</span>
            <span className="text-green-600">({aptos} aptos)</span>
            {impedidos > 0 && (
              <span className="text-red-600">({impedidos} impedidos)</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
          {team.membros.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sem membros escalados</p>
          ) : (
            team.membros.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                compact
              />
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Resumo de Status */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(STATUS_COLORS).map(([status, colors]) => {
              const total = teams.reduce((sum, t) => sum + (t.counts[status as keyof typeof t.counts] || 0), 0);
              if (total === 0) return null;
              return (
                <Badge key={status} variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}: {total}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grid de Unidades Operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {unidadesOperacionais.map(team => (
          <TeamCard key={team.unidade} team={team} />
        ))}
      </div>

      {/* GTA (escala diferente) */}
      {gta && (
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            GTA (Escala 12x60)
          </h3>
          <div className="max-w-md">
            <TeamCard team={gta} />
          </div>
        </div>
      )}

      {/* Seções Administrativas */}
      {adminSections.length > 0 && getMembrosForAdminSection && (
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Seções Administrativas
            {!administrativoTrabalha && (
              <Badge variant="outline" className="bg-slate-100 text-slate-600">
                {isFeriado ? 'Feriado' : 'Fim de Semana'}
              </Badge>
            )}
          </h3>
          
          {administrativoTrabalha ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminSections.map(section => {
                const membros = getMembrosForAdminSection(section);
                return (
                  <Card key={section} className="bg-slate-50">
                    <CardHeader className="pb-1 pt-3">
                      <CardTitle className="text-xs font-medium text-slate-700">
                        {section}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      {membros.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Sem membros</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {membros.slice(0, 5).map((m: any) => (
                            <Badge key={m.id} variant="secondary" className="text-[10px]">
                              {m.efetivo?.nome_guerra || m.efetivo?.nome || '—'}
                            </Badge>
                          ))}
                          {membros.length > 5 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{membros.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Expediente não opera neste dia
            </p>
          )}
        </div>
      )}
    </div>
  );
};
