import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Especie {
  id: string;
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  ordem_taxonomica: string;
  estado_de_conservacao: string;
  tipo_de_fauna: string;
}

const IdentificarEspecie: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [filteredEspecies, setFilteredEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEspecies = async () => {
      try {
        const { data, error } = await supabase
          .from('dim_especies_fauna')
          .select('*')
          .order('nome_popular');

        if (error) throw error;
        setEspecies(data || []);
      } catch (error) {
        console.error('Erro ao buscar espécies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEspecies();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEspecies([]);
    } else {
      const filtered = especies.filter(
        (e) =>
          e.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEspecies(filtered.slice(0, 20));
    }
  }, [searchTerm, especies]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/material-apoio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Search className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Identificar Espécie</h1>
        </div>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-border/50 mb-6">
        <CardHeader>
          <CardTitle>Buscar Espécie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome popular ou científico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : searchTerm && filteredEspecies.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma espécie encontrada para "{searchTerm}"
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEspecies.map((especie) => (
            <Card key={especie.id} className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {especie.nome_popular}
                </h3>
                <p className="text-sm text-muted-foreground italic mb-3">
                  {especie.nome_cientifico}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Classe: </span>
                    <span className="text-foreground">{especie.classe_taxonomica}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ordem: </span>
                    <span className="text-foreground">{especie.ordem_taxonomica}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo: </span>
                    <span className="text-foreground">{especie.tipo_de_fauna}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conservação: </span>
                    <span className="text-foreground">{especie.estado_de_conservacao}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdentificarEspecie;
