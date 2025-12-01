'use client';

import { useState } from 'react';
import type { DataPoint } from '@/lib/types';
import DataUpload from '@/components/DataUpload';
import Dashboard from '@/components/Dashboard';
import { Header } from '@/components/Header';

export default function Home() {
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [industry, setIndustry] = useState<string>('healthcare');

  const handleDataUploaded = (processedData: DataPoint[], selectedIndustry: string) => {
    setData(processedData);
    setIndustry(selectedIndustry);
  };

  const handleReset = () => {
    setData(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={data ? handleReset : undefined} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!data ? (
          <DataUpload onDataUploaded={handleDataUploaded} />
        ) : (
          <Dashboard data={data} industry={industry} />
        )}
      </main>
    </div>
  );
}
