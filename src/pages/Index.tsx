import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChatBubble } from '@/components/ChatBubble';
import { MockWalletModal } from '@/components/MockWalletModal';
import { PortfolioTab } from '@/components/tabs/PortfolioTab';
import { ForecastTab } from '@/components/tabs/ForecastTab';
import { DemoProvider } from '@/contexts/DemoContext';

const Index = () => {
  const [showMockWallet, setShowMockWallet] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <DemoProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header onMockConnect={() => setShowMockWallet(true)} />

        <main className="flex-1 container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="animate-fade-in">
              <PortfolioTab />
            </TabsContent>

            <TabsContent value="forecast" className="animate-fade-in">
              <ForecastTab />
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
        <ChatBubble />
        <MockWalletModal open={showMockWallet} onOpenChange={setShowMockWallet} />
      </div>
    </DemoProvider>
  );
};

export default Index;
