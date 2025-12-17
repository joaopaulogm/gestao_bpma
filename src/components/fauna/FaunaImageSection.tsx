import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getFaunaImageUrl } from '@/services/especieService';

interface FaunaImageSectionProps {
  images: string[];
  onAddImage: (file: File) => Promise<void>;
  onRemoveImage: (index: number) => Promise<void>;
  isUploading: boolean;
  maxImages?: number;
  disabled?: boolean;
}

const FaunaImageSection: React.FC<FaunaImageSectionProps> = ({
  images,
  onAddImage,
  onRemoveImage,
  isUploading,
  maxImages = 6,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAddImage(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-fauna-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-fauna-blue" />
          Fotos da Espécie
          <span className="text-sm font-normal text-muted-foreground">
            ({images.length}/{maxImages})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((filename, index) => (
            <div 
              key={filename} 
              className="relative group aspect-square rounded-lg overflow-hidden border border-fauna-border bg-muted"
            >
              <img
                src={getFaunaImageUrl(filename)}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => onRemoveImage(index)}
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {images.length < maxImages && !disabled && (
            <button
              type="button"
              onClick={handleAddClick}
              disabled={isUploading}
              className="aspect-square rounded-lg border-2 border-dashed border-fauna-border hover:border-fauna-blue hover:bg-fauna-blue/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-fauna-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <Plus className="h-8 w-8" />
                  <span className="text-sm">Adicionar</span>
                </>
              )}
            </button>
          )}
        </div>

        {images.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma foto cadastrada. Clique em "Adicionar" para incluir fotos.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default FaunaImageSection;
