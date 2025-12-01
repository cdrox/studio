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
      const requiredMetrics = ['AHT', 'CSAT', 'FCR', 'Escalations'];
      const dateColumn = header.find(h => h === 'date' || h === 'timestamp');

      if (!dateColumn) {
        throw new Error("Missing 'date' or 'timestamp' column.");
      }

      for (const col of requiredMetrics) {
        if (!header.includes(col)) {
          throw new Error(`Missing required column: ${col}`);
        }
      }

      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        const row: any = {};
        header.forEach((h, i) => {
          const value = values[i]?.trim();
          if (requiredMetrics.includes(h)) { // numeric columns
            const num = parseFloat(value);
            if (isNaN(num)) {
              throw new Error(`Invalid number format in row ${index + 2}, column '${h}'.`);
            }
            row[h] = num;
          } else if (h === dateColumn) {
            const date = new Date(value);
             if (isNaN(date.getTime())) {
                // If the value is a number (like a Unix timestamp), multiply by 1000 for milliseconds
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    const d = new Date(numValue * 1000);
                     if (isNaN(d.getTime())) {
                        throw new Error(`Invalid date/timestamp format in row ${index + 2}, column '${h}'.`);
                     }
                     row['date'] = d.toISOString().split('T')[0];
                } else {
                    throw new Error(`Invalid date/timestamp format in row ${index + 2}, column '${h}'.`);
                }
            } else {
                row['date'] = date.toISOString().split('T')[0];
            }
          } else {
            row[h] = value;
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
