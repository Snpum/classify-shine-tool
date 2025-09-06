import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
}

const ImageUploader = ({ onImageUpload, isLoading }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  }, [onImageUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  }, [onImageUpload]);

  return (
    <Card className={`
      relative p-8 border-2 border-dashed transition-all duration-300
      ${dragActive ? 'border-ai-primary bg-ai-primary/5 shadow-glow' : 'border-border hover:border-ai-primary/50'}
      ${isLoading ? 'pointer-events-none opacity-50' : ''}
    `}>
      <div
        className="flex flex-col items-center justify-center space-y-4 text-center"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-4 bg-gradient-primary rounded-full shadow-glow">
          {isLoading ? (
            <div className="w-8 h-8 animate-spin border-2 border-white/20 border-t-white rounded-full" />
          ) : (
            <Upload className="w-8 h-8 text-white" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {isLoading ? 'Processing...' : 'Upload Image for Classification'}
          </h3>
          <p className="text-muted-foreground">
            Drag and drop an image here, or click to browse
          </p>
        </div>

        <Button
          variant="outline"
          className="relative overflow-hidden border-ai-primary/50 hover:bg-ai-primary/10"
          disabled={isLoading}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Choose Image
        </Button>

        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </Card>
  );
};

export default ImageUploader;