'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateAINarrative } from '@/ai/flows/generate-ai-narrative';
import { refineNarrativeWithIndustryTone } from '@/ai/flows/refine-narrative-with-industry-tone';
import { Wand2, Copy, Loader2, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AINarrativeProps {
  metricsSummary: string;
  anomaliesSummary: string;
  rootCausesSummary: string;
  industry: string;
}

export default function AINarrative({ metricsSummary, anomaliesSummary, rootCausesSummary, industry }: AINarrativeProps) {
  const [narrative, setNarrative] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateAINarrative({
        metricsSummary,
        anomaliesSummary,
        rootCausesSummary,
        industry,
      });
      setNarrative(result.narrative);
    } catch (error) {
      console.error('Error generating narrative:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate AI narrative.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefine = async (tone: string) => {
    if (!narrative) {
        toast({ title: "Please generate a narrative first.", variant: "destructive" });
        return;
    }
    setIsRefining(true);
    try {
      const result = await refineNarrativeWithIndustryTone({
        narrative,
        industry: tone as 'healthcare' | 'insurance' | 'bfsi',
      });
      setNarrative(result.refinedNarrative);
    } catch (error) {
      console.error('Error refining narrative:', error);
      toast({
        variant: 'destructive',
        title: 'Refinement Failed',
        description: 'Could not refine AI narrative.',
      });
    } finally {
        setIsRefining(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(narrative);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generate Narrative
      </Button>
      
      {narrative && (
        <div className="space-y-2">
          <Textarea
            value={narrative}
            readOnly
            className="h-48 bg-muted/30"
            placeholder="AI Narrative will appear here..."
          />
          <div className="flex items-center gap-2">
            <Select onValueChange={handleRefine} disabled={isRefining}>
              <SelectTrigger className="flex-grow">
                <SelectValue placeholder="Refine Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthcare">Healthcare Tone</SelectItem>
                <SelectItem value="insurance">Insurance Tone</SelectItem>
                <SelectItem value="bfsi">BFSI Tone</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleCopy} disabled={!narrative}>
                <Copy className="h-4 w-4" />
            </Button>
            {isRefining && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
      )}
    </div>
  );
}
