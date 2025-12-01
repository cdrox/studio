'use client';

import { useState } from 'react';
import type { DataPoint } from '@/lib/types';
import Dashboard from '@/components/Dashboard';
import DataUpload from '@/components/DataUpload';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { healthcareData } from '@/lib/data/healthcare-data';
import { insuranceData } from '@/lib/data/insurance-data';
import { bfsiData } from '@/lib/data/bfsi-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Industry = 'healthcare' | 'insurance' | 'bfsi';
type SelectionMode = 'upload' | 'sample';

const industryData: Record<Industry, { data: DataPoint[], description: string }> = {
  healthcare: { 
    data: healthcareData, 
    description: "Patient satisfaction and operational efficiency metrics from a healthcare provider's contact center." 
  },
  insurance: { 
    data: insuranceData, 
    description: "Policyholder service metrics for an insurance company, focusing on claim processing and support." 
  },
  bfsi: { 
    data: bfsiData, 
    description: "Customer service data from a banking institution, tracking key performance indicators for retail banking support."
  },
};

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DataPoint[] | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode | null>(null);
  const [selectedSample, setSelectedSample] = useState<Industry | null>(null);


  const handleDataLoaded = (data: DataPoint[], industryName: string = 'custom') => {
    setDashboardData(data);
    setIndustry(industryName as Industry);
  };
  
  const handleShowDashboard = () => {
    if (selectedSample) {
      setDashboardData(industryData[selectedSample].data);
      setIndustry(selectedSample);
    }
  }

  const handleReset = () => {
    setDashboardData(null);
    setIndustry(null);
    setSelectionMode(null);
    setSelectedSample(null);
  };
  
  const renderSamplePreview = () => {
    if (!selectedSample) return null;
    
    const { data, description } = industryData[selectedSample];
    const previewData = data.slice(0, 3);

    return (
      <Card className="w-full max-w-2xl mt-6 shadow-lg animate-in fade-in-50">
        <CardHeader>
          <CardTitle>Dataset Preview: {selectedSample.charAt(0).toUpperCase() + selectedSample.slice(1)}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">AHT</TableHead>
                  <TableHead className="text-right">CSAT</TableHead>
                  <TableHead className="text-right">FCR</TableHead>
                  <TableHead className="text-right">Escalations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="text-right">{row.AHT}</TableCell>
                    <TableCell className="text-right">{row.CSAT}</TableCell>
                    <TableCell className="text-right">{row.FCR}</TableCell>
                    <TableCell className="text-right">{row.Escalations}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleShowDashboard} className="w-full mt-6">
            Show Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderInitialSelection = () => (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
          <CardDescription>Choose a sample dataset or upload your own data to begin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sample" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sample">Use Sample</TabsTrigger>
              <TabsTrigger value="upload">Upload Data</TabsTrigger>
            </TabsList>
            <TabsContent value="sample" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">Select an industry to see a preview of the sample data.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button variant={selectedSample === 'healthcare' ? 'default' : 'outline'} onClick={() => setSelectedSample('healthcare')}>Healthcare</Button>
                    <Button variant={selectedSample === 'insurance' ? 'default' : 'outline'} onClick={() => setSelectedSample('insurance')}>Insurance</Button>
                    <Button variant={selectedSample === 'bfsi' ? 'default' : 'outline'} onClick={() => setSelectedSample('bfsi')}>BFSI</Button>
                </div>
                {selectedSample && renderSamplePreview()}
              </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <DataUpload onDataLoaded={handleDataLoaded} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={dashboardData ? handleReset : undefined} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!dashboardData || !industry ? (
          renderInitialSelection()
        ) : (
          <Dashboard data={dashboardData} industry={industry} />
        )}
      </main>
    </div>
  );
}
