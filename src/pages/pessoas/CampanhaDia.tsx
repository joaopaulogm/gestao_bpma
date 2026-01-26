import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Loader2, Calendar, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCampanhaCalendar, UnitType, TeamType } from '@/hooks/useCampanhaCalendar';
import { CampanhaDayTeams } from '@/components/campanha/CampanhaDayTeams';
import { EditTeamDialog } from '@/components/campanha/EditTeamDialog';

const CampanhaDia: React.FC = () => {
  const { data: dataParam } = useParams<{ data: string }>();
  const navigate = useNavigate();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState<UnitType>('Guarda');
  const [editMode, setEditMode] = useState(false);

  // Parse date from URL parameter
  const selectedDate = useMemo(() => {
    if (!dataParam) return new Date();
    try {
      return parseISO(dataParam);
    } catch {
      return new Date();
    }
  }, [dataParam]);

  const year = getYear(selectedDate);
  const month = getMonth(selectedDate);

  const {
    loading,
    isFeriado,
    getTeamsForDay,
    getTeamForDate,
    saveAlteracao,
    removeAlteracao,
    hasAlteracao,
    administrativoTrabalha,
    ADMIN_SECTIONS,
    getMembrosForAdminSection,
  } = useCampanhaCalendar(year, month);

  const teams = useMemo(() => getTeamsForDay(selectedDate), [getTeamsForDay, selectedDate]);
  const isHoliday = isFeriado(selectedDate);
  const admWorks = administrativoTrabalha(selectedDate);

  const handleEditTeam = (unidade: UnitType) => {
    setEditingUnidade(unidade);
    setEditDialogOpen(true);
  };

  const handleSaveAlteration = async (team: TeamType, motivo?: string) => {
    return saveAlteracao(selectedDate, editingUnidade, team, motivo);
  };

  const handleRemoveAlteration = async () => {
    return removeAlteracao(selectedDate, editingUnidade);
  };

  const handleVoltar = () => {
    // Voltar para o calendário mantendo o mês/ano
    navigate(`/secao-pessoas/campanha?ano=${year}&mes=${month + 1}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Carregando dados do dia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container py-4 md:py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleVoltar}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Campanha
              </h1>
              <p className="text-sm text-muted-foreground capitalize">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                {isHoliday && (
                  <span className="ml-2 text-red-600 font-medium">(Feriado)</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={editMode ? 'default' : 'outline'} 
              onClick={() => setEditMode(!editMode)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {editMode ? 'Finalizar Edição' : 'Editar Escalas'}
            </Button>
          </div>
        </div>

        {/* Aviso de modo edição */}
        {editMode && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Edit2 className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium">Modo de Edição Ativo</p>
                <p className="text-sm text-muted-foreground">
                  Clique no botão de edição em cada unidade para alterar a equipe de serviço.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de Equipes */}
        <CampanhaDayTeams
          teams={teams}
          onEditTeam={handleEditTeam}
          editMode={editMode}
          adminSections={ADMIN_SECTIONS}
          getMembrosForAdminSection={getMembrosForAdminSection}
          administrativoTrabalha={admWorks}
          isFeriado={isHoliday}
        />

        {/* Dialog de Edição */}
        <EditTeamDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          date={selectedDate}
          unidade={editingUnidade}
          currentTeam={getTeamForDate(selectedDate, editingUnidade)}
          hasExistingAlteration={hasAlteracao(selectedDate, editingUnidade)}
          onSave={handleSaveAlteration}
          onRemove={handleRemoveAlteration}
        />
      </div>
    </div>
  );
};

export default CampanhaDia;
