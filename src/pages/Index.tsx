import { useState, useCallback, useRef } from 'react';
import { Brain, Sparkles, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ImageUploader from '@/components/ImageUploader';
import ImagePreview from '@/components/ImagePreview';
import ClassificationResults from '@/components/ClassificationResults';
import EvaluationMetrics from '@/components/EvaluationMetrics';

interface ClassificationResult {
  label: string;
  score: number;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const pipelineRef = useRef<any>(null);
  const { toast } = useToast();

  const loadModel = useCallback(async () => {
    try {
      // Dynamically import the transformers library
      const { pipeline } = await import('@huggingface/transformers');
      
      // Initialize the image classification pipeline with WebGPU for better performance
      pipelineRef.current = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
        { device: 'webgpu' }
      );
      
      toast({
        title: "Model loaded successfully!",
        description: "Ready for image classification with WebGPU acceleration.",
      });
    } catch (error) {
      console.error('Error loading model:', error);
      
      // Fallback to CPU if WebGPU fails
      try {
        const { pipeline } = await import('@huggingface/transformers');
        pipelineRef.current = await pipeline(
          'image-classification',
          'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k'
        );
        
        toast({
          title: "Model loaded (CPU mode)",
          description: "WebGPU unavailable, using CPU for processing.",
        });
      } catch (cpuError) {
        toast({
          title: "Failed to load model",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleImageUpload = useCallback(async (file: File) => {
    setSelectedFile(file);
    
    if (!pipelineRef.current) {
      setIsLoading(true);
      await loadModel();
      setIsLoading(false);
    }
    
    if (pipelineRef.current) {
      await classifyImage(file);
    }
  }, [loadModel]);

  const classifyImage = useCallback(async (file: File) => {
    if (!pipelineRef.current) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const imageUrl = URL.createObjectURL(file);
      const predictions = await pipelineRef.current(imageUrl);
      const endTime = Date.now();
      
      setResults(predictions);
      setProcessingTime(endTime - startTime);
      
      URL.revokeObjectURL(imageUrl);
      
      toast({
        title: "Classification complete!",
        description: `Processed in ${endTime - startTime}ms`,
      });
    } catch (error) {
      console.error('Classification error:', error);
      toast({
        title: "Classification failed",
        description: "Please try again with a different image.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleRemoveImage = useCallback(() => {
    setSelectedFile(null);
    setResults([]);
    setProcessingTime(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-secondary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Image Classifier</h1>
                <p className="text-muted-foreground">
                  Powered by Hugging Face Transformers & WebGPU
                </p>
              </div>
            </div>
            
            <Button variant="outline" className="border-ai-primary/50 hover:bg-ai-primary/10">
              <Github className="w-4 h-4 mr-2" />
              View Code
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white font-medium">Real-time AI Classification</span>
            </div>
            
            <h2 className="text-4xl font-bold">
              Upload, Analyze, Discover
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience cutting-edge image classification with real-time accuracy metrics 
              and confidence scoring powered by state-of-the-art ML models.
            </p>
          </div>

      {/* Upload Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              {!selectedFile ? (
                <ImageUploader 
                  onImageUpload={handleImageUpload}
                  isLoading={isLoading}
                />
              ) : (
                <ImagePreview 
                  file={selectedFile}
                  onRemove={handleRemoveImage}
                />
              )}
              
              {selectedFile && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Ready to classify another image?
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="border-ai-primary/50 hover:bg-ai-primary/10"
                    >
                      Upload New Image
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {results.length > 0 ? (
                <ClassificationResults 
                  results={results}
                  processingTime={processingTime || undefined}
                />
              ) : (
                <Card className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-secondary rounded-full flex items-center justify-center">
                      <Brain className="w-8 h-8 text-ai-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Ready for Analysis
                      </h3>
                      <p className="text-muted-foreground">
                        Upload an image to see real-time classification results 
                        with confidence scores and accuracy metrics.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Evaluation Metrics Section */}
          {results.length > 0 && (
            <EvaluationMetrics
              results={results}
              processingTime={processingTime || undefined}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
