import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap } from 'lucide-react';

interface ClassificationResult {
  label: string;
  score: number;
}

interface ClassificationResultsProps {
  results: ClassificationResult[];
  processingTime?: number;
}

const ConfidenceBar = ({ label, score }: { label: string; score: number }) => {
  const percentage = Math.round(score * 100);
  const confidenceLevel = 
    percentage >= 80 ? 'high' : 
    percentage >= 50 ? 'medium' : 'low';
    
  const colorClass = 
    confidenceLevel === 'high' ? 'bg-ai-success' :
    confidenceLevel === 'medium' ? 'bg-ai-warning' : 'bg-ai-accent';

  return (
    <div className="space-y-2 p-4 rounded-lg bg-gradient-secondary border border-border/50">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-foreground/90 capitalize">
          {label.toLowerCase()}
        </span>
        <Badge variant={confidenceLevel === 'high' ? 'default' : 'secondary'} className="font-mono">
          {percentage}%
        </Badge>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 bg-muted/30`}
      />
    </div>
  );
};

const ClassificationResults = ({ results, processingTime }: ClassificationResultsProps) => {
  if (!results.length) return null;

  const topResult = results[0];
  const accuracy = Math.round(topResult.score * 100);
  
  return (
    <div className="space-y-6">
      {/* Top Result Highlight */}
      <Card className="p-6 bg-gradient-primary shadow-glow border-ai-primary/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              Top Prediction
            </h3>
            <p className="text-lg text-white/90 capitalize">
              {topResult.label.toLowerCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {accuracy}%
            </div>
            <p className="text-sm text-white/80">Confidence</p>
          </div>
        </div>
      </Card>

      {/* Detailed Results */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-ai-primary" />
          <h3 className="text-lg font-semibold">Classification Results</h3>
        </div>
        
        <div className="grid gap-3">
          {results.slice(0, 5).map((result, index) => (
            <ConfidenceBar
              key={index}
              label={result.label}
              score={result.score}
            />
          ))}
        </div>
      </Card>

      {/* Performance Metrics */}
      {processingTime && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-ai-accent" />
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-secondary rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-ai-accent">
                {processingTime}ms
              </div>
              <p className="text-sm text-muted-foreground">Processing Time</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-secondary rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-ai-success">
                {accuracy}%
              </div>
              <p className="text-sm text-muted-foreground">Top Accuracy</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClassificationResults;