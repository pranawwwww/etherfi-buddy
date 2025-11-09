import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getUserProfile, type UserProfile } from '@/lib/userProfiles';

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
  currentUser: UserProfile | null;
}

interface DemoContextType {
  demoState: DemoState;
  updateBalances: (balances: Partial<Balances>) => void;
  resetToDemo: () => void;
  switchUser: (userId: string) => void;
  currentUser: UserProfile | null;
}

// Default to beginner user
const beginnerProfile = getUserProfile('beginner');

const defaultDemoState: DemoState = {
  balances: beginnerProfile.balances,
  assumptions: beginnerProfile.assumptions,
  currentUser: beginnerProfile,
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
    // Reset to current user's default balances
    if (demoState.currentUser) {
      setDemoState({
        balances: demoState.currentUser.balances,
        assumptions: demoState.currentUser.assumptions,
        currentUser: demoState.currentUser,
      });
    } else {
      setDemoState(defaultDemoState);
    }
  };

  const switchUser = (userId: string) => {
    const profile = getUserProfile(userId);
    setDemoState({
      balances: profile.balances,
      assumptions: profile.assumptions,
      currentUser: profile,
    });
  };

  return (
    <DemoContext.Provider
      value={{
        demoState,
        updateBalances,
        resetToDemo,
        switchUser,
        currentUser: demoState.currentUser,
      }}
    >
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
