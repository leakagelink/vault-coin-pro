
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Plus, 
  Minus, 
  History, 
  CreditCard, 
  Smartphone,
  TrendingUp,
  TrendingDown,
  Calendar,
  Coins
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const WalletPage: React.FC = () => {
  const { userData } = useAuth();

  // Mock transaction data
  const transactions = [
    {
      id: '1',
      type: 'deposit',
      amount: 5000,
      method: 'UPI',
      status: 'completed',
      timestamp: new Date('2024-01-20 14:30'),
      description: 'Deposit via UPI'
    },
    {
      id: '2',
      type: 'withdraw',
      amount: 2000,
      method: 'Bank Account',
      status: 'pending',
      timestamp: new Date('2024-01-19 10:15'),
      description: 'Withdrawal to Bank Account'
    },
    {
      id: '3',
      type: 'buy',
      amount: 1500,
      method: 'Wallet',
      status: 'completed',
      timestamp: new Date('2024-01-18 16:45'),
      description: 'Bought 0.001 BTC'
    },
  ];

  const paymentMethods = [
    { id: 'upi', name: 'UPI Payment', icon: Smartphone, available: true },
    { id: 'bank', name: 'Bank Account', icon: CreditCard, available: true },
    { id: 'usdt', name: 'USDT (Tether)', icon: Coins, available: true },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <Plus className="h-4 w-4 text-success" />;
      case 'withdraw': return <Minus className="h-4 w-4 text-destructive" />;
      case 'buy': return <TrendingUp className="h-4 w-4 text-primary" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Header */}
      <div className="bg-card/50 backdrop-blur-sm p-6 rounded-b-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Wallet</h1>
              <p className="text-muted-foreground">Manage your funds</p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="glass-card crypto-gradient text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-white/80 mb-2">Total Balance</p>
              <p className="text-4xl font-bold mb-4">
                ${userData?.wallet?.balance?.toLocaleString() || '0.00'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 pb-20">
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">History</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Transaction History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{transaction.timestamp.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{transaction.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'deposit' ? 'text-success' : 
                        transaction.type === 'withdraw' ? 'text-destructive' : 
                        'text-foreground'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(transaction.status)}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposit" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Add Money to Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-muted-foreground">Select payment method</p>
                </div>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <Button
                        key={method.id}
                        variant="outline"
                        className="w-full justify-start h-auto p-4"
                        disabled={!method.available}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.available ? 'Available' : 'Coming Soon'}
                          </p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Withdraw Money</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-muted-foreground">Choose withdrawal method</p>
                </div>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <Button
                        key={method.id}
                        variant="outline"
                        className="w-full justify-start h-auto p-4"
                        disabled={!method.available}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.available ? 'Available' : 'Coming Soon'}
                          </p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletPage;
