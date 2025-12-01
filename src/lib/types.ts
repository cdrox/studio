export type Metric = 'AHT' | 'CSAT' | 'FCR' | 'Escalations';

export interface DataPoint {
  date: string;
  AHT: number;
  CSAT: number;
  FCR: number;
  Escalations: number;
  [key: string]: any;
}

export interface Anomaly extends DataPoint {
  metric: Metric;
  deviation: number;
}

export interface RootCause {
  anomaly: Anomaly;
  correlation: string;
}
