import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChatBubble } from '@/components/ChatBubble';
import { MockWalletModal } from '@/components/MockWalletModal';
import { PortfolioTab } from '@/components/tabs/PortfolioTab';
import { FlowTab } from '@/components/tabs/FlowTab';
import { StrategyTab } from '@/components/tabs/StrategyTab';
import { ForecastTab } from '@/components/tabs/ForecastTab';
import { AskClaudeTab } from '@/components/tabs/AskClaudeTab';
import { StartHereTab } from '@/components/tabs/StartHereTab';
import { DemoProvider } from '@/contexts/DemoContext';

const Index = () => {
  const [showMockWallet, setShowMockWallet] = useState(false);
  const [activeTab, setActiveTab] = useState('start');

  return (
    <DemoProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header onMockConnect={() => setShowMockWallet(true)} />

        <main className="flex-1 container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-8">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="flow">Flow</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="ask">Ask Claude</TabsTrigger>
              <TabsTrigger value="start">Start Here</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="animate-fade-in">
              <PortfolioTab />
            </TabsContent>

            <TabsContent value="flow" className="animate-fade-in">
              <FlowTab />
            </TabsContent>

            <TabsContent value="strategy" className="animate-fade-in">
              <StrategyTab />
            </TabsContent>

            <TabsContent value="forecast" className="animate-fade-in">
              <ForecastTab />
            </TabsContent>

            <TabsContent value="ask" className="animate-fade-in">
              <AskClaudeTab />
            </TabsContent>

            <TabsContent value="start" className="animate-fade-in">
              <StartHereTab onNavigate={setActiveTab} />
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
