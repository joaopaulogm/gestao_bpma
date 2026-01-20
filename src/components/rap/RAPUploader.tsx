import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  Image, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Trash2,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExtractedAnimal {
  nome_popular: string;
  nome_cientifico?: string;
  classe_taxonomica?: string;
  quantidade_adulto: number;
  quantidade_filhote?: number;
  estado_saude?: string;
  atropelamento?: boolean;
}

interface ExtractedData {
  form_type: 'resgate_fauna' | 'crime_ambiental';
  data?: string;
  hora?: string;
  regiao_administrativa?: string;
  endereco?: string;
  latitude?: string;
  longitude?: string;
  origem?: string;
  tipo_area?: string;
  animais?: ExtractedAnimal[];
  desfecho?: string;
  destinacao?: string;
  tipo_crime?: string;
  enquadramento?: string;
  ocorreu_apreensao?: boolean;
  bens_apreendidos?: Array<{ item: string; quantidade: number }>;
  qtd_detidos_maior?: number;
  qtd_detidos_menor?: number;
  equipe?: Array<{ nome: string; matricula?: string; posto_graduacao?: string }>;
  observacoes?: string;
  confidence_score: number;
}

interface RAPUploaderProps {
  onDataExtracted?: (data: ExtractedData) => void;
  onNavigateToForm?: (formType: 'resgate_fauna' | 'crime_ambiental', data: ExtractedData) => void;
}

export const RAPUploader: React.FC<RAPUploaderProps> = ({ onDataExtracted, onNavigateToForm }) => {
  const [inputType, setInputType] = useState<'text' | 'image'>('text');
  const [rapText, setRapText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImages(prev => [...prev, base64]);
        setImageFiles(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processRAP = async () => {
    if (!rapText && images.length === 0) {
      toast.error('Insira o texto do RAP ou faça upload de imagens');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setExtractedData(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('parse-rap', {
        body: {
          rap_text: rapText || undefined,
          rap_images: images.length > 0 ? images : undefined
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao processar RAP');
      }

      setExtractedData(data.data);
      onDataExtracted?.(data.data);
      toast.success(data.message || 'Dados extraídos com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar documento';
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNavigateToForm = () => {
    if (extractedData) {
      onNavigateToForm?.(extractedData.form_type, extractedData);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'Alta';
    if (score >= 0.6) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processar RAP
          </CardTitle>
          <CardDescription>
            Cole o texto do RAP ou faça upload de imagens para extrair automaticamente os dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={inputType} onValueChange={(v) => setInputType(v as 'text' | 'image')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Texto
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Imagens
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="rap-text">Conteúdo do RAP</Label>
                <Textarea
                  id="rap-text"
                  value={rapText}
                  onChange={(e) => setRapText(e.target.value)}
                  placeholder="Cole aqui o texto completo do Relatório de Atividade Policial..."
                  className="min-h-[200px] mt-2 font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div>
                <Label htmlFor="rap-images">Imagens do RAP</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Input
                    id="rap-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="rap-images" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar ou arraste imagens aqui
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG até 10MB cada
                    </p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`RAP página ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={processRAP} 
            disabled={isProcessing || (!rapText && images.length === 0)}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando com IA...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Extrair Dados do RAP
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {extractedData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Dados Extraídos
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Confiança:</span>
                <Badge className={getConfidenceColor(extractedData.confidence_score)}>
                  {getConfidenceLabel(extractedData.confidence_score)} ({Math.round(extractedData.confidence_score * 100)}%)
                </Badge>
              </div>
            </div>
            <CardDescription>
              Tipo detectado: {' '}
              <Badge variant="outline">
                {extractedData.form_type === 'resgate_fauna' ? 'Resgate de Fauna' : 'Crime Ambiental'}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Informações Gerais */}
                <div>
                  <h4 className="font-semibold mb-2">Informações Gerais</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {extractedData.data && (
                      <div><span className="text-muted-foreground">Data:</span> {extractedData.data}</div>
                    )}
                    {extractedData.hora && (
                      <div><span className="text-muted-foreground">Hora:</span> {extractedData.hora}</div>
                    )}
                    {extractedData.regiao_administrativa && (
                      <div><span className="text-muted-foreground">RA:</span> {extractedData.regiao_administrativa}</div>
                    )}
                    {extractedData.origem && (
                      <div><span className="text-muted-foreground">Origem:</span> {extractedData.origem}</div>
                    )}
                    {extractedData.latitude && extractedData.longitude && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Coordenadas:</span> {extractedData.latitude}, {extractedData.longitude}
                      </div>
                    )}
                    {extractedData.endereco && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Endereço:</span> {extractedData.endereco}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Animais (para resgate) */}
                {extractedData.animais && extractedData.animais.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Animais ({extractedData.animais.length})</h4>
                      <div className="space-y-2">
                        {extractedData.animais.map((animal, idx) => (
                          <div key={idx} className="p-2 bg-muted rounded-lg text-sm">
                            <div className="font-medium">{animal.nome_popular}</div>
                            {animal.nome_cientifico && (
                              <div className="text-xs text-muted-foreground italic">{animal.nome_cientifico}</div>
                            )}
                            <div className="flex gap-4 mt-1 text-xs">
                              {animal.classe_taxonomica && <span>Classe: {animal.classe_taxonomica}</span>}
                              <span>Adultos: {animal.quantidade_adulto}</span>
                              {animal.quantidade_filhote !== undefined && <span>Filhotes: {animal.quantidade_filhote}</span>}
                              {animal.estado_saude && <span>Saúde: {animal.estado_saude}</span>}
                              {animal.atropelamento && <Badge variant="destructive" className="text-xs">Atropelamento</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Desfecho e Destinação */}
                {(extractedData.desfecho || extractedData.destinacao) && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Desfecho</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {extractedData.desfecho && (
                          <div><span className="text-muted-foreground">Desfecho:</span> {extractedData.desfecho}</div>
                        )}
                        {extractedData.destinacao && (
                          <div><span className="text-muted-foreground">Destinação:</span> {extractedData.destinacao}</div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Crime Ambiental específico */}
                {extractedData.form_type === 'crime_ambiental' && (
                  <>
                    {extractedData.tipo_crime && (
                      <div>
                        <h4 className="font-semibold mb-2">Classificação do Crime</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Tipo:</span> {extractedData.tipo_crime}</div>
                          {extractedData.enquadramento && (
                            <div><span className="text-muted-foreground">Enquadramento:</span> {extractedData.enquadramento}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {extractedData.bens_apreendidos && extractedData.bens_apreendidos.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Bens Apreendidos</h4>
                        <div className="space-y-1">
                          {extractedData.bens_apreendidos.map((bem, idx) => (
                            <div key={idx} className="text-sm">
                              • {bem.quantidade}x {bem.item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(extractedData.qtd_detidos_maior || extractedData.qtd_detidos_menor) && (
                      <div>
                        <h4 className="font-semibold mb-2">Detidos</h4>
                        <div className="flex gap-4 text-sm">
                          {extractedData.qtd_detidos_maior !== undefined && (
                            <span>Maiores: {extractedData.qtd_detidos_maior}</span>
                          )}
                          {extractedData.qtd_detidos_menor !== undefined && (
                            <span>Menores: {extractedData.qtd_detidos_menor}</span>
                          )}
                        </div>
                      </div>
                    )}
                    <Separator />
                  </>
                )}

                {/* Equipe */}
                {extractedData.equipe && extractedData.equipe.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Equipe ({extractedData.equipe.length})</h4>
                      <div className="space-y-1 text-sm">
                        {extractedData.equipe.map((membro, idx) => (
                          <div key={idx}>
                            {membro.posto_graduacao && `${membro.posto_graduacao} `}
                            {membro.nome}
                            {membro.matricula && ` (${membro.matricula})`}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Observações */}
                {extractedData.observacoes && (
                  <div>
                    <h4 className="font-semibold mb-2">Observações</h4>
                    <p className="text-sm text-muted-foreground">{extractedData.observacoes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="mt-4 flex gap-2">
              <Button onClick={handleNavigateToForm} className="flex-1">
                <ArrowRight className="h-4 w-4 mr-2" />
                Preencher Formulário de {extractedData.form_type === 'resgate_fauna' ? 'Resgate' : 'Crime Ambiental'}
              </Button>
              <Button variant="outline" onClick={() => setExtractedData(null)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RAPUploader;
