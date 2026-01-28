import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IdentificationResult {
  identificado: boolean;
  nome_popular?: string;
  nome_cientifico?: string;
  confianca?: number;
  classe_taxonomica?: string;
  ordem?: string;
  familia?: string;
  caracteristicas?: string[];
  observacoes?: string;
  estado_conservacao?: string;
  madeira_lei?: boolean;
  imune_corte?: boolean;
  encontrado_no_banco?: boolean;
  especie_id?: string;
  aviso?: string;
}

interface AISpeciesIdentifierProps {
  tipo: 'fauna' | 'flora';
  onIdentified?: (result: IdentificationResult) => void;
}

export const AISpeciesIdentifier: React.FC<AISpeciesIdentifierProps> = ({ tipo, onIdentified }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setImagePreview(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  const handleOpen = useCallback(() => {
    resetState();
    setIsOpen(true);
  }, [resetState]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resetState();
  }, [resetState]);

  const processImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
    e.target.value = '';
  }, [processImage]);

  const identifySpecies = useCallback(async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('identify-species', {
        body: { imageBase64: imagePreview, tipo }
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data);
      
      if (data.identificado && onIdentified) {
        onIdentified(data);
      }

      if (data.identificado) {
        toast.success(`Espécie identificada: ${data.nome_popular || data.nome_cientifico}`);
      }
    } catch (err) {
      console.error('Error identifying species:', err);
      setError('Erro ao identificar espécie. Tente novamente.');
      toast.error('Erro ao identificar espécie');
    } finally {
      setIsAnalyzing(false);
    }
  }, [imagePreview, tipo, onIdentified]);

  const getConfiancaColor = (confianca: number) => {
    if (confianca >= 80) return 'text-green-500';
    if (confianca >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConfiancaLabel = (confianca: number) => {
    if (confianca >= 80) return 'Alta';
    if (confianca >= 60) return 'Média';
    return 'Baixa';
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={handleOpen}
        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
        size="lg"
      >
        <Camera className="h-5 w-5" />
        <span className="hidden sm:inline">Identificar por Foto</span>
        <span className="sm:hidden">ID por Foto</span>
        <Sparkles className="h-4 w-4" />
      </Button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Identificar {tipo === 'fauna' ? 'Animal' : 'Planta'} com IA
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Capture Area */}
            {!imagePreview ? (
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center bg-muted/20">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Camera className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground mb-1">
                      Tire uma foto ou selecione uma imagem
                    </p>
                    <p className="text-sm text-muted-foreground">
                      A IA irá identificar a espécie automaticamente
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                    {/* Camera Button - Mobile optimized */}
                    <Button
                      onClick={() => cameraInputRef.current?.click()}
                      variant="default"
                      className="flex-1 gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Câmera
                    </Button>
                    
                    {/* Upload Button */}
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Galeria
                    </Button>
                  </div>
                </div>

                {/* Hidden inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative rounded-xl overflow-hidden bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={resetState}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Analyze Button */}
                {!result && !isAnalyzing && !error && (
                  <Button
                    onClick={identifySpecies}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5" />
                    Identificar Espécie
                  </Button>
                )}

                {/* Loading State */}
                {isAnalyzing && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Analisando imagem...</p>
                          <p className="text-sm text-muted-foreground">
                            A IA está identificando características da espécie
                          </p>
                        </div>
                      </div>
                      <Progress value={66} className="mt-3" />
                    </CardContent>
                  </Card>
                )}

                {/* Error State */}
                {error && (
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-destructive">Erro na identificação</p>
                          <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                      </div>
                      <Button
                        onClick={identifySpecies}
                        variant="outline"
                        className="w-full mt-3 gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Tentar Novamente
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Result */}
                {result && (
                  <Card className={
                    result.identificado 
                      ? (result.encontrado_no_banco ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5')
                      : 'border-red-500/30 bg-red-500/5'
                  }>
                    <CardContent className="p-4 space-y-4">
                      {result.identificado ? (
                        <>
                          {/* Aviso se não encontrado no banco */}
                          {!result.encontrado_no_banco && result.aviso && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                    ⚠️ Espécie não cadastrada no banco
                                  </p>
                                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    {result.aviso}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Badge de confirmação se encontrado no banco */}
                          {result.encontrado_no_banco && (
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-medium text-green-900 dark:text-green-100">
                                  ✓ Espécie encontrada no banco de dados do BPMA
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className={`h-6 w-6 mt-0.5 ${result.encontrado_no_banco ? 'text-green-500' : 'text-yellow-500'}`} />
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-foreground">
                                {result.nome_popular || 'Espécie Identificada'}
                              </h3>
                              {result.nome_cientifico && (
                                <p className="text-sm italic text-muted-foreground">
                                  {result.nome_cientifico}
                                </p>
                              )}
                            </div>
                            {result.confianca && (
                              <div className="text-right">
                                <p className={`text-2xl font-bold ${getConfiancaColor(result.confianca)}`}>
                                  {result.confianca}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Confiança {getConfiancaLabel(result.confianca)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {result.classe_taxonomica && (
                              <Badge variant="secondary">{result.classe_taxonomica}</Badge>
                            )}
                            {result.ordem && (
                              <Badge variant="outline">{result.ordem}</Badge>
                            )}
                            {result.familia && (
                              <Badge variant="outline">{result.familia}</Badge>
                            )}
                            {result.estado_conservacao && (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                                {result.estado_conservacao}
                              </Badge>
                            )}
                            {result.madeira_lei && (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                                Madeira de Lei
                              </Badge>
                            )}
                            {result.imune_corte && (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                                Imune ao Corte
                              </Badge>
                            )}
                          </div>

                          {/* Characteristics */}
                          {result.caracteristicas && result.caracteristicas.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Características:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {result.caracteristicas.map((c, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Observations */}
                          {result.observacoes && (
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-sm text-muted-foreground">{result.observacoes}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-6 w-6 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Não foi possível identificar</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {result.observacoes || 'Tente com outra foto da espécie com melhor iluminação ou ângulo.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={resetState}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Nova Foto
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={handleClose}
                        >
                          Fechar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AISpeciesIdentifier;
