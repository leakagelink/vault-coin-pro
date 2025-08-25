
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/services/adminService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Wallet } from "lucide-react";

const AddFundsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const addFunds = useMutation({
    mutationFn: ({ userId, amount, notes }: { userId: string; amount: number; notes: string }) =>
      adminApi.addFundsToUser(userId, amount, notes),
    onSuccess: () => {
      toast({ title: "Funds added successfully" });
      setOpen(false);
      setUserId("");
      setAmount("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "wallets"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount) return;
    addFunds.mutate({ userId, amount: Number(amount), notes });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds to User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              required
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for adding funds"
            />
          </div>
          <Button type="submit" disabled={addFunds.isPending} className="w-full">
            {addFunds.isPending ? "Adding..." : "Add Funds"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AdminFundsTab: React.FC = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.fetchUsers,
  });

  const { data: wallets } = useQuery({
    queryKey: ["admin", "wallets"],
    queryFn: adminApi.fetchWallets,
  });

  // Merge users with their wallet data
  const usersWithWallets = users?.map(user => {
    const wallet = wallets?.find(w => w.user_id === user.id);
    return { ...user, balance: wallet?.balance || 0 };
  }) || [];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span>User Funds Management</span>
          </div>
          <AddFundsDialog />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Balance (₹)</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersWithWallets.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-xs text-muted-foreground">{user.id}</TableCell>
                    <TableCell>{user.email ?? "-"}</TableCell>
                    <TableCell>{user.display_name ?? "-"}</TableCell>
                    <TableCell className="font-medium">₹{Number(user.balance).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {usersWithWallets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminFundsTab;
