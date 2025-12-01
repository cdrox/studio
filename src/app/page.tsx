'use client';

import { useState } from 'react';
import type { DataPoint } from '@/lib/types';
import Dashboard from '@/components/Dashboard';
import { Header } from '@/components/Header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { healthcareData } from '@/lib/data/healthcare-data';
import { insuranceData } from '@/lib/data/insurance-data';
import { bfsiData } from '@/lib/data/bfsi-data';
import { Button } from '@/components/ui/button';

type Industry = 'healthcare' | 'insurance' | 'bfsi';

const industryData: Record<Industry, DataPoint[]> = {
  healthcare: healthcareData,
  insurance: insuranceData,
  bfsi: bfsiData,
};

export default function Home() {
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);

  const handleShowDashboard = (selectedIndustry: Industry) => {
    setData(industryData[selectedIndustry]);
    setIndustry(selectedIndustry);
  };

  const handleReset = () => {
    setData(null);
    setIndustry(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={data ? handleReset : undefined} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!data || !industry ? (
          <div className="flex justify-center items-center py-12">
            <Card className="w-full max-w-lg shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Select an Industry</CardTitle>
                <CardDescription>Choose a sample dataset to view the dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select onValueChange={(value) => setIndustry(value as Industry)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="bfsi">BFSI</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => industry && handleShowDashboard(industry)} disabled={!industry} className="w-full">
                  Show Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Dashboard data={data} industry={industry} />
        )}
      </main>
    </div>
  );
}
