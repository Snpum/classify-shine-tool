import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImagePreviewProps {
  file: File | null;
  onRemove: () => void;
}

const ImagePreview = ({ file, onRemove }: ImagePreviewProps) => {
  if (!file) return null;

  const imageUrl = URL.createObjectURL(file);

  return (
    <Card className="relative overflow-hidden border-ai-primary/20 shadow-soft">
      <div className="relative group">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-sm font-medium truncate bg-black/30 px-2 py-1 rounded">
            {file.name}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ImagePreview;