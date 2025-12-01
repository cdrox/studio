import type { DataPoint } from '@/lib/types';

export const healthcareData: DataPoint[] = [
  { date: '2024-01-01', AHT: 320, CSAT: 85, FCR: 75, Escalations: 5 },
  { date: '2024-01-02', AHT: 315, CSAT: 86, FCR: 76, Escalations: 4 },
  { date: '2024-01-03', AHT: 330, CSAT: 84, FCR: 74, Escalations: 6 },
  { date: '2024-01-04', AHT: 310, CSAT: 87, FCR: 78, Escalations: 3 },
  { date: '2024-01-05', AHT: 340, CSAT: 82, FCR: 72, Escalations: 8 }, // Anomaly
  { date: '2024-01-06', AHT: 318, CSAT: 85, FCR: 75, Escalations: 5 },
  { date: '2024-01-07', AHT: 325, CSAT: 86, FCR: 77, Escalations: 4 },
  { date: '2024-01-08', AHT: 305, CSAT: 88, FCR: 80, Escalations: 2 },
  { date: '2024-01-09', AHT: 322, CSAT: 85, FCR: 76, Escalations: 5 },
  { date: '2024-01-10', AHT: 335, CSAT: 83, FCR: 73, Escalations: 7 },
  { date: '2024-01-11', AHT: 312, CSAT: 87, FCR: 79, Escalations: 3 },
  { date: '2024-01-12', AHT: 319, CSAT: 86, FCR: 77, Escalations: 4 },
  { date: '2024-01-13', AHT: 328, CSAT: 84, FCR: 75, Escalations: 6 },
  { date: '2024-01-14', AHT: 350, CSAT: 80, FCR: 70, Escalations: 10 }, // Anomaly
  { date: '2024-01-15', AHT: 321, CSAT: 85, FCR: 76, Escalations: 5 },
];
