import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { buscarIdPorNome } from '@/services/dimensionService';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { parse, isValid, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CSVRecord {
  data: string;
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  ordem_taxonomica: string;
  estado_de_conservacao: string;
  tipo_de_fauna: string;
  resgates: number;
  solturas: number;
  obitos: number;
  feridos: number;
  filhotes: number;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

const ImportarDados: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<CSVRecord[]>([]);

  const parseCSV = (text: string): CSVRecord[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const records: CSVRecord[] = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(';');
      
      if (parts.length >= 15) {
        records.push({
          data: parts[2]?.trim() || '',
          nome_popular: parts[4]?.trim() || '',
          nome_cientifico: parts[5]?.trim() || '',
          classe_taxonomica: parts[6]?.trim() || '',
          ordem_taxonomica: parts[7]?.trim() || '',
          estado_de_conservacao: parts[8]?.trim() || '',
          tipo_de_fauna: parts[9]?.trim() || '',
          resgates: parseInt(parts[10]) || 0,
          solturas: parseInt(parts[11]) || 0,
          obitos: parseInt(parts[12]) || 0,
          feridos: parseInt(parts[13]) || 0,
          filhotes: parseInt(parts[14]) || 0,
        });
      }
    }
    
    return records;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setResult(null);
    
    // Preview first 10 records
    const text = await selectedFile.text();
    const records = parseCSV(text);
    setPreviewData(records.slice(0, 10));
  };

  const findOrCreateEspecie = async (record: CSVRecord): Promise<string | null> => {
    // First try to find existing species by scientific name
    const { data: existingEspecie } = await supabase
      .from('dim_especies_fauna')
      .select('id')
      .eq('nome_cientifico', record.nome_cientifico)
      .single();
    
    if (existingEspecie) {
      return existingEspecie.id;
    }
    
    // Create new species if not found
    const { data: newEspecie, error } = await supabase
      .from('dim_especies_fauna')
      .insert({
        nome_popular: record.nome_popular,
        nome_cientifico: record.nome_cientifico,
        classe_taxonomica: record.classe_taxonomica,
        ordem_taxonomica: record.ordem_taxonomica,
        estado_de_conservacao: record.estado_de_conservacao,
        tipo_de_fauna: record.tipo_de_fauna,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating species:', error);
      return null;
    }
    
    return newEspecie?.id || null;
  };

  const processImport = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const importResult: ImportResult = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
    };
    
    try {
      const text = await file.text();
      const records = parseCSV(text);
      importResult.total = records.length;
      
      // Cache dimension IDs using the existing service
      const origemId = await buscarIdPorNome('dim_origem', 'Resgate de Fauna');
      const estadoSaudeNormalId = await buscarIdPorNome('dim_estado_saude', 'Normal');
      const estadoSaudeFeriidoId = await buscarIdPorNome('dim_estado_saude', 'Ferido');
      const estagioAdultoId = await buscarIdPorNome('dim_estagio_vida', 'Adulto');
      const estagioFilhoteId = await buscarIdPorNome('dim_estagio_vida', 'Filhote');
      const destinacaoSolturaId = await buscarIdPorNome('dim_destinacao', 'Soltura');
      const desfechoObitoId = await buscarIdPorNome('dim_desfecho', 'Óbito');
      const desfechoSolturaId = await buscarIdPorNome('dim_desfecho', 'Soltura no Local');
      
      // Species cache to avoid repeated queries
      const speciesCache = new Map<string, string>();
      
      // Process in batches
      const batchSize = 50;
      
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, Math.min(i + batchSize, records.length));
        
        for (const record of batch) {
          try {
            // Parse date from DD/MM/YYYY format
            let dataFormatada: string;
            const parsedDate = parse(record.data, 'dd/MM/yyyy', new Date(), { locale: ptBR });
            
            if (isValid(parsedDate)) {
              dataFormatada = format(parsedDate, 'yyyy-MM-dd');
            } else {
              throw new Error(`Data inválida: ${record.data}`);
            }
            
            // Get or create species
            let especieId = speciesCache.get(record.nome_cientifico);
            if (!especieId) {
              const foundId = await findOrCreateEspecie(record);
              if (foundId) {
                especieId = foundId;
                speciesCache.set(record.nome_cientifico, especieId);
              }
            }
            
            if (!especieId) {
              throw new Error(`Não foi possível encontrar/criar espécie: ${record.nome_cientifico}`);
            }
            
            // Determine quantities and status based on CSV data
            const quantidadeAdulto = Math.max(0, record.resgates - record.filhotes);
            const quantidadeFilhote = record.filhotes;
            
            // Determine health status based on feridos column
            const estadoSaudeId = record.feridos > 0 ? estadoSaudeFeriidoId : estadoSaudeNormalId;
            
            // Determine desfecho based on obitos and solturas
            let desfechoId: string | null = null;
            if (record.obitos > 0) {
              desfechoId = desfechoObitoId;
            } else if (record.solturas > 0) {
              desfechoId = desfechoSolturaId;
            }
            
            // Create record in fat_registros_de_resgate
            const { error } = await supabase.from('fat_registros_de_resgate').insert({
              data: dataFormatada,
              especie_id: especieId,
              origem_id: origemId,
              estado_saude_id: estadoSaudeId,
              estagio_vida_id: quantidadeFilhote > 0 ? estagioFilhoteId : estagioAdultoId,
              destinacao_id: record.solturas > 0 ? destinacaoSolturaId : null,
              desfecho_id: desfechoId,
              atropelamento: 'Não',
              latitude_origem: '-15.7801',
              longitude_origem: '-47.9292',
              quantidade: record.resgates,
              quantidade_adulto: quantidadeAdulto,
              quantidade_filhote: quantidadeFilhote,
            });
            
            if (error) {
              throw new Error(error.message);
            }
            
            importResult.success++;
          } catch (err) {
            importResult.failed++;
            if (importResult.errors.length < 20) {
              importResult.errors.push(
                `Linha ${i + batch.indexOf(record) + 2}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
              );
            }
          }
        }
        
        setProgress(Math.round(((i + batch.length) / records.length) * 100));
      }
      
      setResult(importResult);
      
      if (importResult.success > 0) {
        toast.success(`${importResult.success} registros importados com sucesso!`);
      }
      
      if (importResult.failed > 0) {
        toast.error(`${importResult.failed} registros falharam`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao processar arquivo');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
        <Card className="backdrop-blur-md bg-white/70 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <FileSpreadsheet className="h-6 w-6" />
              Importar Dados Históricos
            </CardTitle>
            <CardDescription>
              Importe registros de resgate de fauna a partir de arquivo CSV (formato DD/MM/AAAA)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-secondary/30 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="h-12 w-12 text-secondary/50" />
                <span className="text-secondary/70">
                  {file ? file.name : 'Clique para selecionar arquivo CSV'}
                </span>
              </label>
            </div>
            
            {/* Preview */}
            {previewData.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-secondary">Prévia dos dados ({previewData.length} primeiros registros)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-secondary/10">
                        <th className="p-2 text-left border border-secondary/20">Data</th>
                        <th className="p-2 text-left border border-secondary/20">Espécie</th>
                        <th className="p-2 text-left border border-secondary/20">Classe</th>
                        <th className="p-2 text-center border border-secondary/20">Resgates</th>
                        <th className="p-2 text-center border border-secondary/20">Filhotes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-secondary/5">
                          <td className="p-2 border border-secondary/20">{row.data}</td>
                          <td className="p-2 border border-secondary/20">{row.nome_popular}</td>
                          <td className="p-2 border border-secondary/20">{row.classe_taxonomica}</td>
                          <td className="p-2 text-center border border-secondary/20">{row.resgates}</td>
                          <td className="p-2 text-center border border-secondary/20">{row.filhotes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                  <span className="text-secondary">Importando registros...</span>
                </div>
                <Progress value={progress} className="h-2" />
                <span className="text-sm text-secondary/70">{progress}% concluído</span>
              </div>
            )}
            
            {/* Results */}
            {result && (
              <div className="space-y-3 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                <h3 className="font-semibold text-secondary">Resultado da Importação</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-secondary">{result.total}</p>
                    <p className="text-sm text-secondary/70">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{result.success}</p>
                    <p className="text-sm text-secondary/70">Sucesso</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{result.failed}</p>
                    <p className="text-sm text-secondary/70">Falhas</p>
                  </div>
                </div>
                
                {result.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-destructive mb-2">Erros encontrados:</p>
                    <ul className="text-xs text-destructive/80 space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((err, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={processImport}
                disabled={!file || isProcessing}
                className="bg-secondary hover:bg-secondary/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Iniciar Importação
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/registros')}
                disabled={isProcessing}
              >
                Ver Registros
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default ImportarDados;
