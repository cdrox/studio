'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, FileCheck2 } from 'lucide-react';
import type { DataPoint } from '@/lib/types';

interface DataUploadProps {
  onDataUploaded: (data: DataPoint[], industry: string) => void;
}

export default function DataUpload({ onDataUploaded }: DataUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [industry, setIndustry] = useState('healthcare');
  const [previewData, setPreviewData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a CSV file.',
        });
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const processFile = useCallback(async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file must have a header and at least one row of data.');
      }
      const header = lines[0].split(',').map(h => h.trim());
      const lowercasedHeader = header.map(h => h.toLowerCase());
      
      const requiredMetrics = ['aht', 'csat', 'fcr', 'escalations'];
      const dateColumnIndex = lowercasedHeader.findIndex(h => h === 'date' || h === 'timestamp');

      if (dateColumnIndex === -1) {
        throw new Error("Missing 'date' or 'timestamp' column.");
      }

      const originalRequiredMetrics = ['AHT', 'CSAT', 'FCR', 'Escalations'];
      for (const metric of requiredMetrics) {
        if (!lowercasedHeader.includes(metric)) {
          const originalMetric = originalRequiredMetrics[requiredMetrics.indexOf(metric)];
          throw new Error(`Missing required column: ${originalMetric}`);
        }
      }

      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        const row: any = {};
        
        header.forEach((originalHeader, i) => {
            const value = values[i]?.trim();
            const lowerHeader = originalHeader.toLowerCase();

            if (requiredMetrics.includes(lowerHeader)) {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    throw new Error(`Invalid number format in row ${index + 2}, column '${originalHeader}'.`);
                }
                // Use original casing for keys in the final object if needed, or normalize
                const originalMetricName = originalRequiredMetrics.find(m => m.toLowerCase() === lowerHeader) || originalHeader;
                row[originalMetricName] = num;
            } else if (i === dateColumnIndex) {
                let date;
                // Handle numeric timestamps (Unix seconds or milliseconds)
                if (!isNaN(Number(value)) && String(new Date(value)).includes('Invalid')) {
                    const numValue = Number(value);
                    date = new Date(numValue < 10000000000 ? numValue * 1000 : numValue);
                } else { // Handle date strings
                    date = new Date(value);
                }

                if (isNaN(date.getTime())) {
                    throw new Error(`Invalid date/timestamp format in row ${index + 2}, column '${originalHeader}': "${value}"`);
                }
                row['date'] = date.toISOString().split('T')[0];
            } else {
                row[originalHeader] = value;
            }
        });
        return row as DataPoint;
      });
      
      setPreviewData(data.slice(0, 5));
      onDataUploaded(data, industry);

    } catch (e: any) {
      setError(e.message);
      toast({
        variant: 'destructive',
        title: 'Error Processing File',
        description: e.message,
      });
      setPreviewData([]);
    } finally {
      setIsLoading(false);
    }
  }, [file, industry, onDataUploaded, toast]);

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Your Data</CardTitle>
          <CardDescription>Upload a CSV file with your CX metrics to get started. The file should contain 'date' or 'timestamp' and metric columns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="industry">Select Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="bfsi">BFSI (Banking, Financial Services and Insurance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload CSV File</Label>
            <div className="flex items-center space-x-2">
              <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="flex-grow" />
            </div>
            {file && <p className="text-sm text-muted-foreground flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-green-500" /> {file.name}</p>}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          
          <Button onClick={processFile} disabled={!file || isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {isLoading ? 'Processing...' : 'Analyze Data'}
          </Button>

          {previewData.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Data Preview</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(previewData[0]).map(key => <TableHead key={key}>{key}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, i) => (
                      <TableRow key={i}>
                        {Object.entries(row).map(([key, val]) => <TableCell key={key}>{String(val)}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
