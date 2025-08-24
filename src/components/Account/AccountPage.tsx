
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  CreditCard, 
  Wallet, 
  FileText, 
  Phone, 
  Lock,
  LogOut,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AccountPage: React.FC = () => {
  const { currentUser, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const accountOptions = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'View and edit profile',
      icon: User,
      action: () => toast.info('Profile editing coming soon!')
    },
    {
      id: 'bank',
      title: 'Add Bank',
      description: 'Link your bank account',
      icon: CreditCard,
      action: () => toast.info('Bank linking coming soon!')
    },
    {
      id: 'deposit',
      title: 'Fund Deposit',
      description: 'Add money to wallet',
      icon: Wallet,
      action: () => toast.info('Redirecting to deposit...')
    },
    {
      id: 'orders',
      title: 'All Orders',
      description: 'View order history',
      icon: FileText,
      action: () => toast.info('Order history coming soon!')
    },
    {
      id: 'contact',
      title: 'Contact Us',
      description: 'Get help and support',
      icon: Phone,
      action: () => toast.info('Contact support coming soon!')
    },
    {
      id: 'password',
      title: 'Password Change',
      description: 'Update your password',
      icon: Lock,
      action: () => toast.info('Password change coming soon!')
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <div className="bg-card/50 backdrop-blur-sm p-6 rounded-b-xl">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-16 w-16 bg-primary/10">
            <AvatarFallback className="text-primary text-xl font-semibold">
              {userData?.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{userData?.displayName || 'User'}</h1>
            <p className="text-muted-foreground">{currentUser?.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Member since {currentUser?.metadata.creationTime ? 
                new Date(currentUser.metadata.creationTime).toLocaleDateString() : 
                'Recently'
              }
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">₹{userData?.wallet?.balance?.toLocaleString() || '0'}</p>
              <p className="text-xs text-muted-foreground">Wallet</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">5</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">2</p>
              <p className="text-xs text-muted-foreground">Holdings</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account Options */}
      <div className="px-4 space-y-3">
        <h2 className="text-lg font-semibold mb-3">Account Settings</h2>
        
        {accountOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.id} className="glass-card hover:bg-card/80 transition-colors">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4"
                  onClick={option.action}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium">{option.title}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security & Support */}
      <div className="px-4 space-y-3">
        <h2 className="text-lg font-semibold">Security & Support</h2>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Account Verified</span>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-sm">2FA Setup</span>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  Enable
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout Button */}
      <div className="px-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AccountPage;
