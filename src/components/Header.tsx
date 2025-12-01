import { Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ onReset }: { onReset?: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Presentation className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Metrics Maestro</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {onReset && <Button variant="ghost" onClick={onReset}>Upload New File</Button>}
        </div>
      </div>
    </header>
  );
}
