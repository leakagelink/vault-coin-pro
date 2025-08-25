
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, AdminDepositRequest, AdminWithdrawalRequest } from "@/services/adminService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { CircleCheck, CircleX, Banknote, HandCoins, Users, ListOrdered } from "lucide-react";

const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-2">
    {icon}
    <span className="text-lg font-semibold">{title}</span>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const color =
    status === "approved"
      ? "bg-green-500/15 text-green-600"
      : status === "rejected"
      ? "bg-red-500/15 text-red-600"
      : "bg-yellow-500/15 text-yellow-600";
  return <Badge className={color} variant="secondary">{status}</Badge>;
};

const NotesInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder ?? "Optional notes"}
    className="h-9"
  />
);

const DepositsTab: React.FC = () => {
  const qc = useQueryClient();
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "deposit_requests"],
    queryFn: adminApi.fetchDepositRequests,
  });

  const approve = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => adminApi.approveDeposit(id, notes),
    meta: { onError: (err: any) => console.error(err) },
    onSettled: async () => {
      toast({ title: "Deposit processed" });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin", "deposit_requests"] }),
        qc.invalidateQueries({ queryKey: ["admin", "wallets"] }),
        qc.invalidateQueries({ queryKey: ["admin", "transactions"] }),
      ]);
    },
  });

  const reject = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => adminApi.rejectRequest(id, "deposit", notes),
    meta: { onError: (err: any) => console.error(err) },
    onSettled: async () => {
      toast({ title: "Deposit rejected" });
      await qc.invalidateQueries({ queryKey: ["admin", "deposit_requests"] });
    },
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle><SectionHeader title="Deposit Requests" icon={<Banknote className="h-5 w-5 text-primary" />} /></CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((r: AdminDepositRequest) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{r.user_id}</TableCell>
                    <TableCell className="font-medium">{Number(r.amount).toLocaleString()}</TableCell>
                    <TableCell>{r.payment_method}</TableCell>
                    <TableCell className="text-xs">{r.transaction_reference ?? "-"}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="min-w-[180px]">
                      <NotesInput
                        value={notesMap[r.id] ?? ""}
                        onChange={(v) => setNotesMap((m) => ({ ...m, [r.id]: v }))}
                        placeholder="Notes (optional)"
                      />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        disabled={r.status !== "pending" || approve.isPending}
                        onClick={() => approve.mutate({ id: r.id, notes: notesMap[r.id] })}
                      >
                        <CircleCheck className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={r.status !== "pending" || reject.isPending}
                        onClick={() => reject.mutate({ id: r.id, notes: notesMap[r.id] })}
                      >
                        <CircleX className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data || data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      No deposit requests found.
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

const WithdrawalsTab: React.FC = () => {
  const qc = useQueryClient();
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "withdrawal_requests"],
    queryFn: adminApi.fetchWithdrawalRequests,
  });

  const approve = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => adminApi.approveWithdrawal(id, notes),
    meta: { onError: (err: any) => console.error(err) },
    onSettled: async () => {
      toast({ title: "Withdrawal processed" });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin", "withdrawal_requests"] }),
        qc.invalidateQueries({ queryKey: ["admin", "wallets"] }),
        qc.invalidateQueries({ queryKey: ["admin", "transactions"] }),
      ]);
    },
  });

  const reject = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => adminApi.rejectRequest(id, "withdrawal", notes),
    meta: { onError: (err: any) => console.error(err) },
    onSettled: async () => {
      toast({ title: "Withdrawal rejected" });
      await qc.invalidateQueries({ queryKey: ["admin", "withdrawal_requests"] });
    },
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle><SectionHeader title="Withdrawal Requests" icon={<HandCoins className="h-5 w-5 text-primary" />} /></CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((r: AdminWithdrawalRequest) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{r.user_id}</TableCell>
                    <TableCell className="font-medium">{Number(r.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{r.bank_account_id ?? "-"}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="min-w-[180px]">
                      <NotesInput
                        value={notesMap[r.id] ?? ""}
                        onChange={(v) => setNotesMap((m) => ({ ...m, [r.id]: v }))}
                        placeholder="Notes (optional)"
                      />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        disabled={r.status !== "pending" || approve.isPending}
                        onClick={() => approve.mutate({ id: r.id, notes: notesMap[r.id] })}
                      >
                        <CircleCheck className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={r.status !== "pending" || reject.isPending}
                        onClick={() => reject.mutate({ id: r.id, notes: notesMap[r.id] })}
                      >
                        <CircleX className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data || data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      No withdrawal requests found.
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

const UsersTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.fetchUsers,
  });
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle><SectionHeader title="Users" icon={<Users className="h-5 w-5 text-primary" />} /></CardTitle>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-xs text-muted-foreground">{u.id}</TableCell>
                    <TableCell>{u.email ?? "-"}</TableCell>
                    <TableCell>{u.display_name ?? "-"}</TableCell>
                    <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                    <TableCell className="text-sm">{u.created_at ? new Date(u.created_at).toLocaleString() : "-"}</TableCell>
                  </TableRow>
                ))}
                {(!data || data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
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

const PositionsTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "positions"],
    queryFn: adminApi.fetchPositions,
  });
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle><SectionHeader title="Trading Positions" icon={<ListOrdered className="h-5 w-5 text-primary" />} /></CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Buy Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs text-muted-foreground">{p.user_id}</TableCell>
                    <TableCell className="font-medium">{p.symbol}</TableCell>
                    <TableCell>{p.position_type}</TableCell>
                    <TableCell><StatusBadge status={p.status ?? "open"} /></TableCell>
                    <TableCell>{Number(p.amount)}</TableCell>
                    <TableCell>{Number(p.buy_price)}</TableCell>
                    <TableCell>{p.current_price != null ? Number(p.current_price) : "-"}</TableCell>
                    <TableCell className="text-sm">{p.created_at ? new Date(p.created_at).toLocaleString() : "-"}</TableCell>
                  </TableRow>
                ))}
                {(!data || data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                      No positions found.
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

const TransactionsTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: adminApi.fetchTransactions,
  });
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle><SectionHeader title="Transactions" icon={<ListOrdered className="h-5 w-5 text-primary" />} /></CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs text-muted-foreground">{t.user_id}</TableCell>
                    <TableCell className="font-medium">{t.transaction_type}</TableCell>
                    <TableCell>{t.symbol ?? "-"}</TableCell>
                    <TableCell>{t.amount != null ? Number(t.amount) : "-"}</TableCell>
                    <TableCell>{Number(t.total_value)}</TableCell>
                    <TableCell><StatusBadge status={t.status ?? "completed"} /></TableCell>
                    <TableCell className="text-sm">{t.created_at ? new Date(t.created_at).toLocaleString() : "-"}</TableCell>
                  </TableRow>
                ))}
                {(!data || data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      No transactions found.
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

const AdminPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4">
          <DepositsTab />
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <WithdrawalsTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersTab />
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <PositionsTab />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
