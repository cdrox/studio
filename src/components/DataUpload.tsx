'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import type { DataPoint } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataUploadProps {
  onDataLoaded: (data: DataPoint[], industry: string) => void;
}

const REQUIRED_COLUMNS = ['AHT', 'CSAT', 'FCR', 'Escalations'];
const TIMESTAMP_COLUMNS = ['timestamp', 'date'];

export default function DataUpload({ onDataLoaded }: DataUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<DataPoint[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleFilePreview(selectedFile);
    }
  };

  const findHeader = (headers: string[], possibleNames: string[]): string | undefined => {
    for (const name of possibleNames) {
      const found = headers.find(h => h.toLowerCase() === name.toLowerCase());
      if (found) return found;
    }
    return undefined;
  }

  const handleFilePreview = (fileToParse: File) => {
    setUploading(true);
    Papa.parse(fileToParse, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        try {
          const headers = results.meta.fields;
          if (!headers) throw new Error("Could not parse CSV headers.");

          const normalizedHeaders = headers.map(h => h.toLowerCase());
          const timestampHeader = findHeader(headers, TIMESTAMP_COLUMNS);
          
          if (!timestampHeader) {
            throw new Error(`CSV must contain a date column (either 'timestamp' or 'date').`);
          }

          const missingColumns = REQUIRED_COLUMNS.filter(col => !normalizedHeaders.includes(col.toLowerCase()));
          if (missingColumns.length > 0) {
            throw new Error(`The following required columns are missing: ${missingColumns.join(', ')}.`);
          }

          const parsedData = (results.data as any[]).map(row => {
            const dateValue = row[timestampHeader];
            let formattedDate: string;

            if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
                // Already in 'YYYY-MM-DD' format or similar
                formattedDate = dateValue.split('T')[0];
            } else if (!isNaN(Number(dateValue))) {
                // Assume numeric value is a Unix timestamp (in seconds or milliseconds)
                const timestamp = Number(dateValue) * (String(dateValue).length === 10 ? 1000 : 1);
                formattedDate = new Date(timestamp).toISOString().split('T')[0];
            } else {
                // Try parsing other date formats
                const parsedDate = new Date(dateValue);
                if (isNaN(parsedDate.getTime())) {
                    throw new Error(`Could not parse date: ${dateValue}`);
                }
                formattedDate = parsedDate.toISOString().split('T')[0];
            }

            const dataPoint: DataPoint = { date: formattedDate } as DataPoint;
            for (const col of REQUIRED_COLUMNS) {
                const header = findHeader(headers, [col])!;
                const value = parseFloat(row[header]);
                if (isNaN(value)) throw new Error(`Invalid numeric value for ${col} in row: ${JSON.stringify(row)}`);
                (dataPoint as any)[col] = value;
            }
            return dataPoint;
          });
          setPreview(parsedData);
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'File Error',
            description: error.message || 'Could not parse the file. Please check the format.',
          });
          setFile(null);
          setPreview([]);
        } finally {
          setUploading(false);
        }
      },
      error: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message || 'An unexpected error occurred during parsing.',
        });
        setUploading(false);
      }
    });
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
           const headers = results.meta.fields;
          if (!headers) throw new Error("Could not parse CSV headers.");
          const timestampHeader = findHeader(headers, TIMESTAMP_COLUMNS);
           if (!timestampHeader) {
            throw new Error(`CSV must contain a date column (either 'timestamp' or 'date').`);
          }

          const parsedData = (results.data as any[]).map(row => {
            const dateValue = row[timestampHeader];
            let formattedDate: string;

            if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
                formattedDate = dateValue.split('T')[0];
            } else if (!isNaN(Number(dateValue))) {
                const timestamp = Number(dateValue) * (String(dateValue).length === 10 ? 1000 : 1);
                formattedDate = new Date(timestamp).toISOString().split('T')[0];
            } else {
                const parsedDate = new Date(dateValue);
                 if (isNaN(parsedDate.getTime())) {
                    throw new Error(`Could not parse date: ${dateValue}`);
                }
                formattedDate = parsedDate.toISOString().split('T')[0];
            }

            const dataPoint: DataPoint = { date: formattedDate } as DataPoint;
            for (const col of REQUIRED_COLUMNS) {
                const header = findHeader(headers, [col])!;
                const value = parseFloat(row[header]);
                if (isNaN(value)) throw new Error(`Invalid numeric value for ${col} in row: ${JSON.stringify(row)}`);
                (dataPoint as any)[col] = value;
            }
            return dataPoint;
          });
          
          toast({
            title: 'Upload Successful',
            description: 'Your data has been loaded into the dashboard.',
          });
          onDataLoaded(parsedData, file.name.replace('.csv',''));
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Processing Error',
            description: error.message || 'Failed to process the CSV data.',
          });
        } finally {
          setUploading(false);
        }
      },
      error: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message || 'An unexpected error occurred.',
        });
        setUploading(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="csv-upload" className="text-sm font-medium">Upload CSV File</label>
        <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} />
        <p className="text-xs text-muted-foreground">
          Must contain 'timestamp' or 'date', and columns for AHT, CSAT, FCR, and Escalations.
        </p>
      </div>

      {preview.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Data Preview</CardTitle>
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
                    {preview.map((row, index) => (
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
            </CardContent>
        </Card>
      )}

      <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? 'Processing...' : 'Load Data into Dashboard'}
      </Button>
    </div>
  );
}
