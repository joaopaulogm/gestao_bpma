import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFaunaImage, deleteFaunaImage, getFaunaImageUrl, atualizarImagensEspecie } from '@/services/especieService';

interface FaunaImageUploaderProps {
  especieId: string;
  nomePopular: string;
  imagensPaths: string[];
  onImagesChange: (newImages: string[]) => void;
}

export function FaunaImageUploader({ 
  especieId, 
  nomePopular, 
  imagensPaths, 
  onImagesChange 
}: FaunaImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPaths: string[] = [...imagensPaths];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} excede o tamanho máximo de 5MB`);
          continue;
        }

        const filename = await uploadFaunaImage(especieId, nomePopular, file);
        if (filename) {
          newPaths.push(filename);
        } else {
          toast.error(`Erro ao enviar ${file.name}`);
        }
      }

      // Update database with new paths
      const success = await atualizarImagensEspecie(especieId, newPaths);
      if (success) {
        onImagesChange(newPaths);
        toast.success('Imagens adicionadas com sucesso');
      } else {
        toast.error('Erro ao salvar imagens no banco');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (index: number) => {
    const filename = imagensPaths[index];
    setDeletingIndex(index);

    try {
      const deleted = await deleteFaunaImage(filename);
      if (deleted) {
        const newPaths = imagensPaths.filter((_, i) => i !== index);
        const success = await atualizarImagensEspecie(especieId, newPaths);
        if (success) {
          onImagesChange(newPaths);
          toast.success('Imagem removida');
        }
      } else {
        toast.error('Erro ao remover imagem');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao remover imagem');
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      {imagensPaths.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {imagensPaths.map((path, index) => (
            <div key={path} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={getFaunaImageUrl(path)}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(index)}
                disabled={deletingIndex === index}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {deletingIndex === index ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4 mr-2" />
              Adicionar Fotos
            </>
          )}
        </Button>
      </div>

      {imagensPaths.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Nenhuma foto cadastrada. Clique para adicionar.
        </p>
      )}
    </div>
  );
}
