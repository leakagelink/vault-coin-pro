
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthScreen from '@/components/Auth/AuthScreen';
import Header from '@/components/Layout/Header';
import BottomNavigation from '@/components/Layout/BottomNavigation';
import HomePage from '@/components/Dashboard/HomePage';
import PortfolioPage from '@/components/Portfolio/PortfolioPage';
import WatchlistPage from '@/components/Watchlist/WatchlistPage';
import WalletPage from '@/components/Wallet/WalletPage';
import AccountPage from '@/components/Account/AccountPage';
import LiveTicker from '@/components/Market/LiveTicker';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (!currentUser) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'watchlist':
        return <WatchlistPage />;
      case 'wallet':
        return <WalletPage />;
      case 'account':
        return <AccountPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="min-h-screen pt-16">
        <LiveTicker />
        {renderContent()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default Index;
