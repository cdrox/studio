import type { DataPoint } from '@/lib/types';

export const insuranceData: DataPoint[] = [
  { date: '2024-02-01', AHT: 450, CSAT: 78, FCR: 65, Escalations: 10 },
  { date: '2024-02-02', AHT: 440, CSAT: 80, FCR: 68, Escalations: 8 },
  { date: '2024-02-03', AHT: 460, CSAT: 77, FCR: 64, Escalations: 12 },
  { date: '2024-02-04', AHT: 430, CSAT: 82, FCR: 70, Escalations: 7 },
  { date: '2024-02-05', AHT: 475, CSAT: 75, FCR: 60, Escalations: 15 }, // Anomaly
  { date: '2024-02-06', AHT: 445, CSAT: 79, FCR: 66, Escalations: 9 },
  { date: '2024-02-07', AHT: 455, CSAT: 78, FCR: 65, Escalations: 11 },
  { date: '2024-02-08', AHT: 420, CSAT: 85, FCR: 72, Escalations: 5 },
  { date: '2024-02-09', AHT: 448, CSAT: 80, FCR: 67, Escalations: 9 },
  { date: '2024-02-10', AHT: 465, CSAT: 76, FCR: 63, Escalations: 13 },
  { date: '2024-02-11', AHT: 435, CSAT: 81, FCR: 69, Escalations: 7 },
  { date: '2024-02-12', AHT: 442, CSAT: 79, FCR: 66, Escalations: 10 },
  { date: '2024-02-13', AHT: 458, CSAT: 77, FCR: 64, Escalations: 12 },
  { date: '2024-02-14', AHT: 490, CSAT: 72, FCR: 58, Escalations: 18 }, // Anomaly
  { date: '2024-02-15', AHT: 452, CSAT: 78, FCR: 65, Escalations: 10 },
];
