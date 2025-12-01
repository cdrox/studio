import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  anomalyCount: number;
}

export default function MetricCard({ title, value, icon: Icon, anomalyCount }: MetricCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {anomalyCount > 0 && (
          <div className="text-xs text-muted-foreground flex items-center pt-1">
             <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {anomalyCount} {anomalyCount > 1 ? 'Anomalies' : 'Anomaly'}
             </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
