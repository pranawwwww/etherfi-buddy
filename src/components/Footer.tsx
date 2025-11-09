import { AlertCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-8">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          <span>Educational use only • Demo mode • Not financial advice • Not affiliated with EtherFi</span>
        </div>
      </div>
    </footer>
  );
};
