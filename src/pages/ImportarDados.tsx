import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { buscarIdPorNome } from '@/services/dimensionService';

// Type-safe wrapper para queries em tabelas não tipadas
const supabaseAny = supabase as any;
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { parse, isValid, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CSVRecord {
  data: string;
  regiao_administrativa: string;
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

const COORDENADAS_REGIOES: Record<string, { lat: string; lng: string }> = {
  'Plano Piloto': { lat: '-15.7942', lng: '-47.8822' },
  'Gama': { lat: '-16.0103', lng: '-48.0615' },
  'Taguatinga': { lat: '-15.8365', lng: '-48.0536' },
  'Brazlândia': { lat: '-15.6806', lng: '-48.1969' },
  'Sobradinho': { lat: '-15.6517', lng: '-47.7897' },
  'Planaltina': { lat: '-15.6214', lng: '-47.6486' },
  'Paranoá': { lat: '-15.7744', lng: '-47.7803' },
  'Núcleo Bandeirante': { lat: '-15.8711', lng: '-47.9683' },
  'Ceilândia': { lat: '-15.8206', lng: '-48.1117' },
  'Guará': { lat: '-15.8350', lng: '-47.9817' },
  'Cruzeiro': { lat: '-15.7922', lng: '-47.9328' },
  'Samambaia': { lat: '-15.8789', lng: '-48.0828' },
  'Santa Maria': { lat: '-16.0197', lng: '-48.0117' },
  'São Sebastião': { lat: '-15.9028', lng: '-47.7669' },
  'Recanto das Emas': { lat: '-15.9147', lng: '-48.0608' },
  'Lago Sul': { lat: '-15.8350', lng: '-47.8294' },
  'Riacho Fundo': { lat: '-15.8761', lng: '-48.0200' },
  'Lago Norte': { lat: '-15.7350', lng: '-47.8364' },
  'Candangolândia': { lat: '-15.8528', lng: '-47.9511' },
  'Águas Claras': { lat: '-15.8394', lng: '-48.0275' },
  'Riacho Fundo II': { lat: '-15.8917', lng: '-48.0472' },
  'Sudoeste/Octogonal': { lat: '-15.8014', lng: '-47.9286' },
  'Varjão': { lat: '-15.7111', lng: '-47.8692' },
  'Park Way': { lat: '-15.8989', lng: '-47.9586' },
  'SCIA/Estrutural': { lat: '-15.7844', lng: '-47.9969' },
  'Sobradinho II': { lat: '-15.6442', lng: '-47.8239' },
  'Jardim Botânico': { lat: '-15.8697', lng: '-47.8036' },
  'Itapoã': { lat: '-15.7567', lng: '-47.7711' },
  'SIA': { lat: '-15.8083', lng: '-47.9550' },
  'Vicente Pires': { lat: '-15.8017', lng: '-48.0258' },
  'Fercal': { lat: '-15.6019', lng: '-47.8867' },
  'Sol Nascente/Pôr do Sol': { lat: '-15.8108', lng: '-48.1189' },
  'Arniqueira': { lat: '-15.8367', lng: '-48.0061' },
};

const COORD_PADRAO = { lat: '-15.7942', lng: '-47.8822' };

function obterCoordenadas(ra: string): { lat: string; lng: string } {
  if (COORDENADAS_REGIOES[ra]) return COORDENADAS_REGIOES[ra];
  
  const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const raNorm = normalizar(ra);
  
  for (const [regiao, coords] of Object.entries(COORDENADAS_REGIOES)) {
    if (normalizar(regiao).includes(raNorm) || raNorm.includes(normalizar(regiao))) {
      return coords;
    }
  }
  
  return COORD_PADRAO;
}

const ImportarDados = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<CSVRecord[]>([]);

  const parseCSV = (text: string): CSVRecord[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const records: CSVRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(';');
      if (parts.length >= 15) {
        records.push({
          data: parts[2]?.trim() || '',
          regiao_administrativa: parts[3]?.trim() || 'Plano Piloto',
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
    const text = await selectedFile.text();
    setPreviewData(parseCSV(text).slice(0, 10));
  };

  const findOrCreateEspecie = async (record: CSVRecord): Promise<string | null> => {
    const { data: existing } = await supabase
      .from('dim_especies_fauna')
      .select('id')
      .eq('nome_cientifico', record.nome_cientifico)
      .maybeSingle();
    
    if (existing) return existing.id;
    
    const newId = crypto.randomUUID();
    
    const { data: created, error } = await supabase
      .from('dim_especies_fauna')
      .insert({
        id: newId,
        nome_popular: record.nome_popular,
        nome_cientifico: record.nome_cientifico,
        classe_taxonomica: record.classe_taxonomica,
        ordem_taxonomica: record.ordem_taxonomica,
        estado_de_conservacao: record.estado_de_conservacao,
        tipo_de_fauna: record.tipo_de_fauna,
      })
      .select('id')
      .single();
    
    if (error) return null;
    return created?.id || null;
  };

  const processImport = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    
    const importResult: ImportResult = { total: 0, success: 0, failed: 0, errors: [] };
    
    try {
      const text = await file.text();
      const records = parseCSV(text);
      importResult.total = records.length;
      
      const origemId = await buscarIdPorNome('dim_origem', 'Resgate de Fauna');
      const estadoNormalId = await buscarIdPorNome('dim_estado_saude', 'Normal');
      const estadoFeridoId = await buscarIdPorNome('dim_estado_saude', 'Ferido');
      const estagioAdultoId = await buscarIdPorNome('dim_estagio_vida', 'Adulto');
      const estagioFilhoteId = await buscarIdPorNome('dim_estagio_vida', 'Filhote');
      const destinacaoSolturaId = await buscarIdPorNome('dim_destinacao', 'Soltura');
      const desfechoObitoId = await buscarIdPorNome('dim_desfecho_resgates', 'Óbito');
      const desfechoSolturaId = await buscarIdPorNome('dim_desfecho_resgates', 'Soltura no Local');
      
      const speciesCache = new Map<string, string>();
      
      for (let i = 0; i < records.length; i += 50) {
        const batch = records.slice(i, Math.min(i + 50, records.length));
        
        for (const record of batch) {
          try {
            const parsedDate = parse(record.data, 'dd/MM/yyyy', new Date(), { locale: ptBR });
            if (!isValid(parsedDate)) throw new Error(`Data inválida: ${record.data}`);
            const dataFormatada = format(parsedDate, 'yyyy-MM-dd');
            
            let especieId = speciesCache.get(record.nome_cientifico);
            if (!especieId) {
              const foundId = await findOrCreateEspecie(record);
              if (foundId) {
                especieId = foundId;
                speciesCache.set(record.nome_cientifico, especieId);
              }
            }
            
            if (!especieId) throw new Error(`Espécie não encontrada: ${record.nome_cientifico}`);
            
            const regiaoId = await buscarIdPorNome('dim_regiao_administrativa', record.regiao_administrativa);
            const coords = obterCoordenadas(record.regiao_administrativa);
            
            const { error } = await supabaseAny.from('fat_resgates_diarios_2025').insert({
              data: dataFormatada,
              especie_id: especieId,
              origem_id: origemId,
              estado_saude_id: record.feridos > 0 ? estadoFeridoId : estadoNormalId,
              estagio_vida_id: record.filhotes > 0 ? estagioFilhoteId : estagioAdultoId,
              destinacao_id: record.solturas > 0 ? destinacaoSolturaId : null,
              desfecho_id: record.obitos > 0 ? desfechoObitoId : (record.solturas > 0 ? desfechoSolturaId : null),
              regiao_administrativa_id: regiaoId,
              atropelamento: 'Não',
              latitude_origem: coords.lat,
              longitude_origem: coords.lng,
              quantidade: record.resgates,
              quantidade_adulto: Math.max(0, record.resgates - record.filhotes),
              quantidade_filhote: record.filhotes,
            });
            
            if (error) throw new Error(error.message);
            importResult.success++;
          } catch (err) {
            importResult.failed++;
            if (importResult.errors.length < 20) {
              importResult.errors.push(`Linha ${i + batch.indexOf(record) + 2}: ${err instanceof Error ? err.message : 'Erro'}`);
            }
          }
        }
        setProgress(Math.round(((i + batch.length) / records.length) * 100));
      }
      
      setResult(importResult);
      if (importResult.success > 0) toast.success(`${importResult.success} registros importados!`);
      if (importResult.failed > 0) toast.error(`${importResult.failed} registros falharam`);
    } catch (error) {
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
            Importe registros de resgate de fauna a partir de arquivo CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-secondary/30 rounded-lg p-8 text-center">
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-upload" disabled={isProcessing} />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <Upload className="h-12 w-12 text-secondary/50" />
              <span className="text-secondary/70">{file ? file.name : 'Clique para selecionar arquivo CSV'}</span>
            </label>
          </div>
          
          {previewData.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-secondary">Prévia ({previewData.length} registros)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-secondary/10">
                      <th className="p-2 text-left border border-secondary/20">Data</th>
                      <th className="p-2 text-left border border-secondary/20">RA</th>
                      <th className="p-2 text-left border border-secondary/20">Espécie</th>
                      <th className="p-2 text-center border border-secondary/20">Resgates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-secondary/5">
                        <td className="p-2 border border-secondary/20">{row.data}</td>
                        <td className="p-2 border border-secondary/20">{row.regiao_administrativa}</td>
                        <td className="p-2 border border-secondary/20">{row.nome_popular}</td>
                        <td className="p-2 text-center border border-secondary/20">{row.resgates}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                <span className="text-secondary">Importando...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <span className="text-sm text-secondary/70">{progress}%</span>
            </div>
          )}
          
          {result && (
            <div className="space-y-3 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <h3 className="font-semibold text-secondary">Resultado</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold text-secondary">{result.total}</p><p className="text-sm text-secondary/70">Total</p></div>
                <div><p className="text-2xl font-bold text-green-600">{result.success}</p><p className="text-sm text-secondary/70">Sucesso</p></div>
                <div><p className="text-2xl font-bold text-destructive">{result.failed}</p><p className="text-sm text-secondary/70">Falhas</p></div>
              </div>
              {result.errors.length > 0 && (
                <ul className="text-xs text-destructive/80 space-y-1 max-h-40 overflow-y-auto mt-4">
                  {result.errors.map((err, idx) => (
                    <li key={idx} className="flex items-start gap-1"><AlertCircle className="h-3 w-3 mt-0.5" />{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            <Button onClick={processImport} disabled={!file || isProcessing} className="bg-secondary hover:bg-secondary/90">
              {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importando...</> : <><CheckCircle className="h-4 w-4 mr-2" />Iniciar Importação</>}
            </Button>
            <Button variant="outline" onClick={() => navigate('/registros')} disabled={isProcessing}>Ver Registros</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportarDados;
