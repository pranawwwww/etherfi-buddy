import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Balances {
  ETH: number;
  eETH: number;
  weETH: number;
  LiquidUSD: number;
}

interface Assumptions {
  apyStake: number;
  apyLiquidUsd: number;
  borrowRate: number;
  ltvWeeth: number;
}

interface DemoState {
  balances: Balances;
  assumptions: Assumptions;
}

interface DemoContextType {
  demoState: DemoState;
  updateBalances: (balances: Partial<Balances>) => void;
  resetToDemo: () => void;
}

const defaultDemoState: DemoState = {
  balances: {
    ETH: 0.2,
    eETH: 0.0,
    weETH: 5.0,
    LiquidUSD: 1200.0,
  },
  assumptions: {
    apyStake: 0.04,
    apyLiquidUsd: 0.10,
    borrowRate: 0.05,
    ltvWeeth: 0.50,
  },
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [demoState, setDemoState] = useState<DemoState>(defaultDemoState);

  const updateBalances = (balances: Partial<Balances>) => {
    setDemoState((prev) => ({
      ...prev,
      balances: { ...prev.balances, ...balances },
    }));
  };

  const resetToDemo = () => {
    setDemoState(defaultDemoState);
  };

  return (
    <DemoContext.Provider value={{ demoState, updateBalances, resetToDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoState = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoState must be used within DemoProvider');
  }
  return context;
};
