'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createTemplateFromPrompt } from '@/ai/flows/create-template-from-prompt';
import { Loader2, Download } from 'lucide-react';

interface GenerateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GenerateTemplateDialog({ open, onOpenChange }: GenerateTemplateDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Prompt is required',
        description: 'Please describe the data you want in the template.',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedTemplate(null);
    try {
      const result = await createTemplateFromPrompt(prompt);
      setGeneratedTemplate(result.template);
    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        variant: 'destructive',
        title: 'Template Generation Failed',
        description: 'Could not generate the template. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedTemplate) return;
    const blob = new Blob([generatedTemplate], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Template downloaded!' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate CSV Template</DialogTitle>
          <DialogDescription>
            Describe the kind of data you want to analyze, and we'll generate a CSV template for you.
            e.g., "A CSV for healthcare call center data with 10 rows."
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prompt" className="text-right">
              Prompt
            </Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Insurance claims data"
            />
          </div>
        </div>
        {generatedTemplate && (
            <div className='p-2 border rounded-md bg-muted/50 max-h-40 overflow-y-auto'>
                <pre className='text-xs whitespace-pre-wrap'>{generatedTemplate}</pre>
            </div>
        )}
        <DialogFooter>
          {generatedTemplate ? (
            <Button onClick={handleDownload}><Download className="mr-2" /> Download</Button>
          ) : (
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
              Generate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
