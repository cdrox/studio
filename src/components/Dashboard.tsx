'use client';

import { useState, useMemo } from 'react';
import type { DataPoint, Metric, Anomaly, RootCause } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from '@/components/MetricCard';
import { Clock, Smile, CheckCircle2, ShieldAlert, AlertTriangle, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  data: DataPoint[];
  industry: string;
}

const METRICS: Metric[] = ['AHT', 'CSAT', 'FCR', 'Escalations'];
const METRIC_DETAILS: Record<Metric, { name: string; icon: React.ElementType; unit: string }> = {
  'AHT': { name: 'Avg. Handle Time', icon: Clock, unit: 's' },
  'CSAT': { name: 'Customer Satisfaction', icon: Smile, unit: '' },
  'FCR': { name: 'First Call Resolution', icon: CheckCircle2, unit: '%' },
  'Escalations': { name: 'Escalation Rate', icon: ShieldAlert, unit: '%' },
};

// Simple anomaly detection (z-score)
const detectAnomalies = (data: DataPoint[], metric: Metric, threshold = 2): Anomaly[] => {
  const values = data.map(d => d[metric]);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / values.length);
  
  if (stdDev === 0) return [];

  const anomalies: Anomaly[] = [];
  data.forEach(d => {
    const zScore = (d[metric] - mean) / stdDev;
    if (Math.abs(zScore) > threshold) {
      anomalies.push({ ...d, metric, deviation: zScore });
    }
  });
  return anomalies;
};

// Simple root cause analysis (correlation)
const findRootCauses = (anomalies: Anomaly[], data: DataPoint[]): RootCause[] => {
  const causes: RootCause[] = [];
  anomalies.forEach(anomaly => {
    const anomalyDataPoint = data.find(d => d.date === anomaly.date);
    if (!anomalyDataPoint) return;

    METRICS.forEach(otherMetric => {
      if (otherMetric === anomaly.metric) return;
      
      const otherMetricAnomalies = detectAnomalies(data, otherMetric, 1.5);
      const correlatedAnomaly = otherMetricAnomalies.find(a => a.date === anomaly.date);
      
      if (correlatedAnomaly) {
        causes.push({
          anomaly,
          correlation: `A ${anomaly.deviation > 0 ? 'spike' : 'drop'} in ${anomaly.metric} correlates with a ${correlatedAnomaly.deviation > 0 ? 'spike' : 'drop'} in ${otherMetric}.`
        });
      }
    });
  });
  return causes.filter((v,i,a)=>a.findIndex(t=>(t.anomaly.date === v.anomaly.date && t.anomaly.metric === v.anomaly.metric))===i); // Unique
};

export default function Dashboard({ data, industry }: DashboardProps) {
  const [selectedChartMetric, setSelectedChartMetric] = useState<Metric>('CSAT');

  const { metrics, anomalies, rootCauses, chartData } = useMemo(() => {
    const calculatedMetrics = METRICS.reduce((acc, metric) => {
      const values = data.map(d => d[metric]);
      acc[metric] = values.reduce((a, b) => a + b, 0) / values.length;
      return acc;
    }, {} as Record<Metric, number>);

    const allAnomalies = METRICS.flatMap(metric => detectAnomalies(data, metric));
    const uniqueAnomalies = allAnomalies.filter((v,i,a)=>a.findIndex(t=>(t.date === v.date && t.metric === v.metric))===i);

    const calculatedRootCauses = findRootCauses(uniqueAnomalies, data);

    const processedChartData = data.map(d => {
      const pointAnomalies = uniqueAnomalies.filter(a => a.date === d.date && a.metric === selectedChartMetric);
      return {
        ...d,
        isAnomaly: pointAnomalies.length > 0
      };
    });

    return { metrics: calculatedMetrics, anomalies: uniqueAnomalies, rootCauses: calculatedRootCauses, chartData: processedChartData };
  }, [data, selectedChartMetric]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <ChartTooltipContent
          className="bg-background"
          label={label}
          payload={payload.map((p: any) => ({ ...p, value: `${p.value.toFixed(2)}${METRIC_DETAILS[selectedChartMetric].unit}`}))}
        />
      );
    }
    return null;
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {METRICS.map(metric => (
          <MetricCard
            key={metric}
            title={METRIC_DETAILS[metric].name}
            value={`${metrics[metric].toFixed(2)}${METRIC_DETAILS[metric].unit}`}
            icon={METRIC_DETAILS[metric].icon}
            anomalyCount={anomalies.filter(a => a.metric === metric).length}
          />
        ))}
      </div>
      
      <div className="lg:col-span-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Metric Trends</CardTitle>
            <Select value={selectedChartMetric} onValueChange={(val) => setSelectedChartMetric(val as Metric)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Metric" />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map(m => <SelectItem key={m} value={m}>{METRIC_DETAILS[m].name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[350px] w-full">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={selectedChartMetric}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (payload.isAnomaly) {
                        return <circle cx={cx} cy={cy} r={6} fill="hsl(var(--destructive))" stroke="hsl(var(--background))" strokeWidth={2} />;
                      }
                      return <circle cx={cx} cy={cy} r={3} fill="hsl(var(--primary))" />;
                    }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-4">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Insights Panel</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="anomalies">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="anomalies"><AlertTriangle className="w-4 h-4 mr-1"/>Anomalies</TabsTrigger>
                        <TabsTrigger value="rca"><Search className="w-4 h-4 mr-1"/>Root Causes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="anomalies" className="mt-4 max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                          {anomalies.length > 0 ? anomalies.map((anomaly, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <p className="text-sm">
                                    {anomaly.deviation > 0 ? 'High' : 'Low'} value for <span className="font-semibold">{anomaly.metric}</span> on {anomaly.date}
                                </p>
                                <Badge variant={anomaly.deviation > 0 ? "destructive" : "default"}>{anomaly[anomaly.metric].toFixed(2)}</Badge>
                            </div>
                          )) : <p className="text-sm text-muted-foreground text-center py-4">No anomalies detected.</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="rca" className="mt-4 max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                           {rootCauses.length > 0 ? rootCauses.map((cause, index) => (
                            <div key={index} className="p-2 rounded-md bg-muted/50">
                                <p className="text-sm">{cause.correlation}</p>
                            </div>
                          )) : <p className="text-sm text-muted-foreground text-center py-4">No clear root causes found.</p>}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
