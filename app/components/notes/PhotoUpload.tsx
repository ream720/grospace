import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { X, Upload, Image } from 'lucide-react';

interface PhotoUploadProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export function PhotoUpload({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5,
  disabled = false 
}: PhotoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        return false;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    const newPhotos = [...photos, ...validFiles].slice(0, maxPhotos);
    onPhotosChange(newPhotos);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {canAddMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Add Photos ({photos.length}/{maxPhotos})
          </Button>
        </div>
      )}

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <PhotoPreview
              key={`${photo.name}-${index}`}
              photo={photo}
              onRemove={() => removePhoto(index)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate">{fileName}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-sm text-muted-foreground">
        Upload up to {maxPhotos} photos. Max 5MB per photo. Supported formats: JPG, PNG, GIF, WebP.
      </p>
    </div>
  );
}

interface PhotoPreviewProps {
  photo: File;
  onRemove: () => void;
  disabled?: boolean;
}

function PhotoPreview({ photo, onRemove, disabled }: PhotoPreviewProps) {
  const [preview, setPreview] = useState<string>('');

  React.useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(photo);

    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [photo]);

  return (
    <div className="relative group">
      <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
        {preview ? (
          <img
            src={preview}
            alt={photo.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {/* Remove Button */}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
        disabled={disabled}
      >
        <X className="w-3 h-3" />
      </Button>
      
      {/* File Name */}
      <p className="mt-1 text-xs text-muted-foreground truncate">
        {photo.name}
      </p>
    </div>
  );
}