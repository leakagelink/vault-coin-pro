
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const AuthScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('कृपया सभी फ़ील्ड भरें');
      return;
    }

    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success('सफलतापूर्वक लॉगिन हो गए!');
    } catch (error: any) {
      toast.error('लॉगिन में त्रुटि: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.email || !signupData.password || !signupData.displayName) {
      toast.error('कृपया सभी फ़ील्ड भरें');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('पासवर्ड मेल नहीं खा रहे');
      return;
    }

    setLoading(true);
    try {
      await signup(signupData.email, signupData.password, signupData.displayName);
      toast.success('अकाउंट बन गया! स्वागत है!');
    } catch (error: any) {
      toast.error('साइनअप में त्रुटि: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold crypto-gradient bg-clip-text text-transparent">
            CryptoVault Pro
          </h1>
          <p className="text-muted-foreground mt-2">
            भारत का सबसे भरोसेमंद क्रिप्टो ऐप
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>शुरुआत करें</CardTitle>
            <CardDescription>
              अपने क्रिप्टो जर्नी की शुरुआत करें
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="ईमेल एड्रेस"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="पासवर्ड"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      className="bg-secondary/50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full crypto-button" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login करें
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="पूरा नाम"
                      value={signupData.displayName}
                      onChange={(e) => setSignupData(prev => ({
                        ...prev,
                        displayName: e.target.value
                      }))}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="ईमेल एड्रेस"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="पासवर्ड"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="पासवर्ड कन्फर्म करें"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className="bg-secondary/50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full crypto-button" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    अकाउंट बनाएं
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthScreen;
