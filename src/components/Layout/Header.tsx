
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { userData } = useAuth();

  return (
    <Card className="glass-card rounded-none border-0 border-b border-border/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">CryptoTrader</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {userData?.displayName || 'Trader'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Header;
