import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Gauge, PieChart, Activity } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ClassificationResult {
  label: string;
  score: number;
}

interface EvaluationMetricsProps {
  results: ClassificationResult[];
  processingTime?: number;
}

const EvaluationMetrics = ({ results, processingTime }: EvaluationMetricsProps) => {
  if (!results.length) return null;

  const topScore = results[0].score;
  const top3Scores = results.slice(0, 3);
  const top5Scores = results.slice(0, 5);

  // Derived metrics
  const topKAccuracy = (k: number) => {
    const topK = results.slice(0, k);
    const maxInK = Math.max(...topK.map(r => r.score));
    return Math.round(maxInK * 100);
  };

  const confidenceMargin = results.length >= 2
    ? Math.round((results[0].score - results[1].score) * 100)
    : 100;

  const entropy = -results.reduce((sum, r) => {
    if (r.score > 0) sum += r.score * Math.log2(r.score);
    return sum;
  }, 0);
  const maxEntropy = Math.log2(results.length);
  const normalizedEntropy = maxEntropy > 0 ? Math.round((1 - entropy / maxEntropy) * 100) : 100;

  const avgConfidence = Math.round(
    (results.reduce((s, r) => s + r.score, 0) / results.length) * 100
  );

  // Chart data
  const barData = top5Scores.map((r, i) => ({
    name: r.label.length > 12 ? r.label.slice(0, 12) + '…' : r.label,
    confidence: Math.round(r.score * 100),
    fill: i === 0 ? 'hsl(var(--primary))' : i < 3 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
  }));

  const gaugeData = [{ value: Math.round(topScore * 100), fill: 'hsl(var(--primary))' }];

  const chartConfig = {
    confidence: { label: 'Confidence %', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="space-y-6">
      {/* Accuracy Gauge */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Prediction Confidence</h3>
        </div>
        <div className="flex items-center justify-center">
          <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={gaugeData}
              startAngle={180}
              endAngle={0}
              barSize={14}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: 'hsl(var(--muted))' }}
              />
            </RadialBarChart>
          </ChartContainer>
        </div>
        <div className="text-center -mt-8">
          <span className="text-3xl font-bold">{Math.round(topScore * 100)}%</span>
          <p className="text-sm text-muted-foreground mt-1">Top-1 Confidence</p>
        </div>
      </Card>

      {/* Confidence Distribution */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Confidence Distribution</h3>
        </div>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="confidence" radius={[0, 4, 4, 0]} barSize={20}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </Card>

      {/* Top-K Accuracy */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Top-K Accuracy</h3>
        </div>
        <div className="space-y-4">
          {[1, 3, 5].map(k => {
            const acc = topKAccuracy(k);
            return (
              <div key={k} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Top-{k}</span>
                  <Badge variant={acc >= 80 ? 'default' : 'secondary'} className="font-mono">{acc}%</Badge>
                </div>
                <Progress value={acc} className="h-2" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary Metrics Grid */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Evaluation Summary</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MetricTile label="Confidence Margin" value={`${confidenceMargin}%`} desc="Gap between #1 and #2" />
          <MetricTile label="Decision Certainty" value={`${normalizedEntropy}%`} desc="Inverse normalized entropy" />
          <MetricTile label="Avg Confidence" value={`${avgConfidence}%`} desc="Across all classes" />
          <MetricTile
            label="Latency"
            value={processingTime ? `${processingTime}ms` : '—'}
            desc="Inference time"
          />
        </div>
      </Card>
    </div>
  );
};

const MetricTile = ({ label, value, desc }: { label: string; value: string; desc: string }) => (
  <div className="text-center p-4 bg-muted/30 rounded-lg border border-border/50">
    <div className="text-xl font-bold text-primary">{value}</div>
    <p className="text-sm font-medium mt-1">{label}</p>
    <p className="text-xs text-muted-foreground">{desc}</p>
  </div>
);

export default EvaluationMetrics;
