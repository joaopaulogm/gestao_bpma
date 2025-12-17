import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Image as ImageIcon, Loader2, Upload } from 'lucide-react';

interface SpeciesImageSectionProps {
  images: string[];
  onAddImages: (files: File[]) => Promise<void>;
  onRemoveImage: (index: number) => Promise<void>;
  getImageUrl: (filename: string) => string;
  isUploading: boolean;
  maxImages?: number;
  disabled?: boolean;
  title?: string;
}

const SpeciesImageSection: React.FC<SpeciesImageSectionProps> = ({
  images,
  onAddImages,
  onRemoveImage,
  getImageUrl,
  isUploading,
  maxImages = 6,
  disabled = false,
  title = "Fotos da Espécie"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const availableSlots = maxImages - images.length;
      const filesToUpload = imageFiles.slice(0, availableSlots);
      await onAddImages(filesToUpload);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading && images.length < maxImages) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading || images.length >= maxImages) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const availableSlots = maxImages - images.length;
      const filesToUpload = imageFiles.slice(0, availableSlots);
      await onAddImages(filesToUpload);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-md border border-secondary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-secondary">
          <ImageIcon className="h-5 w-5" />
          {title}
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
              className="relative group aspect-square rounded-lg overflow-hidden border border-secondary/20 bg-muted"
            >
              <img
                src={getImageUrl(filename)}
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
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              disabled={isUploading}
              className={`aspect-square rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDragging 
                  ? 'border-primary bg-primary/10 text-primary scale-105' 
                  : 'border-secondary/30 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary'
              }`}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isDragging ? (
                <>
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">Soltar aqui</span>
                </>
              ) : (
                <>
                  <Plus className="h-8 w-8" />
                  <span className="text-sm">Adicionar</span>
                  <span className="text-xs opacity-70">ou arraste</span>
                </>
              )}
            </button>
          )}
        </div>

        {images.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma foto cadastrada. Clique em "Adicionar" ou arraste fotos para incluir.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default SpeciesImageSection;
