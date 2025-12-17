import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Trash2, Image as ImageIcon, Loader2, Upload, ZoomIn, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

const MAX_IMAGE_SIZE = 1920;
const COMPRESSION_QUALITY = 0.8;

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Resize if larger than max size
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_IMAGE_SIZE;
            width = MAX_IMAGE_SIZE;
          } else {
            width = (width / height) * MAX_IMAGE_SIZE;
            height = MAX_IMAGE_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          COMPRESSION_QUALITY
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const processAndUploadImages = async (files: File[]) => {
    setIsCompressing(true);
    try {
      const compressedFiles = await Promise.all(files.map(compressImage));
      await onAddImages(compressedFiles);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const availableSlots = maxImages - images.length;
      const filesToUpload = imageFiles.slice(0, availableSlots);
      await processAndUploadImages(filesToUpload);
      
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
    if (!disabled && !isUploading && !isCompressing && images.length < maxImages) {
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

    if (disabled || isUploading || isCompressing || images.length >= maxImages) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const availableSlots = maxImages - images.length;
      const filesToUpload = imageFiles.slice(0, availableSlots);
      await processAndUploadImages(filesToUpload);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handleCloseZoom = () => {
    setSelectedImageIndex(null);
  };

  const isProcessing = isUploading || isCompressing;

  return (
    <>
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
                className="relative group aspect-square rounded-lg overflow-hidden border border-secondary/20 bg-muted cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={getImageUrl(filename)}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(index);
                    }}
                    disabled={isProcessing}
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
                disabled={isProcessing}
                className={`aspect-square rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDragging 
                    ? 'border-primary bg-primary/10 text-primary scale-105' 
                    : 'border-secondary/30 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-xs">{isCompressing ? 'Comprimindo...' : 'Enviando...'}</span>
                  </>
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

      {/* Zoom Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={handleCloseZoom}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {selectedImageIndex !== null && (
              <>
                <img
                  src={getImageUrl(images[selectedImageIndex])}
                  alt={`Foto ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Navigation buttons */}
                {selectedImageIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                )}
                
                {selectedImageIndex < images.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                )}

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-10 w-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handleCloseZoom}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SpeciesImageSection;
