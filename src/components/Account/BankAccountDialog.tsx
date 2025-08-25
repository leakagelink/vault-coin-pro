import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, Trash2 } from 'lucide-react';

interface BankAccount {
  id: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  account_type: string;
  is_primary: boolean;
  created_at: string;
}

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BankAccountDialog: React.FC<BankAccountDialogProps> = ({ open, onOpenChange }) => {
  const { currentUser } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountType: 'savings'
  });

  const fetchBankAccounts = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('bank_accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && currentUser) {
      fetchBankAccounts();
    }
  }, [open, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('bank_accounts')
        .insert({
          user_id: currentUser.id,
          account_holder_name: formData.accountHolderName.trim(),
          account_number: formData.accountNumber.trim(),
          ifsc_code: formData.ifscCode.trim().toUpperCase(),
          bank_name: formData.bankName.trim(),
          account_type: formData.accountType,
          is_primary: bankAccounts.length === 0
        });

      if (error) throw error;

      toast.success('Bank account added successfully');
      setFormData({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        accountType: 'savings'
      });
      await fetchBankAccounts();
    } catch (error: any) {
      console.error('Error adding bank account:', error);
      toast.error('Failed to add bank account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('bank_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser?.id);

      if (error) throw error;

      toast.success('Bank account removed');
      await fetchBankAccounts();
    } catch (error: any) {
      console.error('Error deleting bank account:', error);
      toast.error('Failed to remove bank account');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Bank Accounts</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Bank Accounts */}
          {bankAccounts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Your Bank Accounts</h3>
              {bankAccounts.map((account) => (
                <div key={account.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{account.bank_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.account_holder_name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Account: ****{account.account_number.slice(-4)}</p>
                    <p>IFSC: {account.ifsc_code}</p>
                    <p className="capitalize">{account.account_type} Account</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Bank Account Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-medium">Add New Bank Account</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData(prev => ({...prev, accountHolderName: e.target.value}))}
                  placeholder="Full name as per bank"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({...prev, bankName: e.target.value}))}
                  placeholder="e.g., State Bank of India"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({...prev, accountNumber: e.target.value}))}
                  placeholder="Account number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData(prev => ({...prev, ifscCode: e.target.value}))}
                  placeholder="e.g., SBIN0001234"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select value={formData.accountType} onValueChange={(value) => setFormData(prev => ({...prev, accountType: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="current">Current Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Close
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Account'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountDialog;
