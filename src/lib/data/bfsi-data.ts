import type { DataPoint } from '@/lib/types';

export const bfsiData: DataPoint[] = [
  { date: '2024-03-01', AHT: 500, CSAT: 90, FCR: 80, Escalations: 3 },
  { date: '2024-03-02', AHT: 490, CSAT: 91, FCR: 82, Escalations: 2 },
  { date: '2024-03-03', AHT: 510, CSAT: 89, FCR: 78, Escalations: 4 },
  { date: '2024-03-04', AHT: 480, CSAT: 92, FCR: 85, Escalations: 1 },
  { date: '2024-03-05', AHT: 530, CSAT: 87, FCR: 75, Escalations: 6 }, // Anomaly
  { date: '2024-03-06', AHT: 495, CSAT: 90, FCR: 81, Escalations: 3 },
  { date: '2024-03-07', AHT: 505, CSAT: 91, FCR: 83, Escalations: 2 },
  { date: '2024-03-08', AHT: 470, CSAT: 94, FCR: 88, Escalations: 0 },
  { date: '2024-03-09', AHT: 498, CSAT: 90, FCR: 81, Escalations: 3 },
  { date: '2024-03-10', AHT: 515, CSAT: 88, FCR: 79, Escalations: 5 },
  { date: '2024-03-11', AHT: 485, CSAT: 92, FCR: 86, Escalations: 1 },
  { date: '2024-03-12', AHT: 502, CSAT: 91, FCR: 82, Escalations: 2 },
  { date: '2024-03-13', AHT: 520, CSAT: 89, FCR: 78, Escalations: 4 },
  { date: '2024-03-14', AHT: 550, CSAT: 85, FCR: 72, Escalations: 8 }, // Anomaly
  { date: '2024-03-15', AHT: 500, CSAT: 90, FCR: 80, Escalations: 3 },
];
