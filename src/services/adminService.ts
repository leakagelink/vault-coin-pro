
import { supabase } from "@/integrations/supabase/client";

export interface AdminDepositRequest {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  transaction_reference: string | null;
  status: string;
  admin_notes: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminWithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  bank_account_id: string | null;
  status: string;
  admin_notes: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminTransaction {
  id: string;
  user_id: string | null;
  transaction_type: string;
  amount: number | null;
  total_value: number;
  symbol: string | null;
  price: number | null;
  status: string | null;
  created_at: string | null;
}

export interface AdminPosition {
  id: string;
  user_id: string | null;
  symbol: string;
  coin_name: string;
  amount: number;
  buy_price: number;
  current_price: number | null;
  status: string | null;
  position_type: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const adminApi = {
  // Requests
  async fetchDepositRequests(): Promise<AdminDepositRequest[]> {
    console.log("[Admin] Fetching deposit requests");
    const { data, error } = await (supabase as any)
      .from("deposit_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as AdminDepositRequest[];
  },

  async fetchWithdrawalRequests(): Promise<AdminWithdrawalRequest[]> {
    console.log("[Admin] Fetching withdrawal requests");
    const { data, error } = await (supabase as any)
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as AdminWithdrawalRequest[];
  },

  // Actions
  async approveDeposit(requestId: string, notes?: string) {
    console.log("[Admin] Approving deposit", requestId);
    const { data: session } = await supabase.auth.getSession();
    const admin_id = session.session?.user?.id;
    if (!admin_id) throw new Error("Not authenticated");
    const { data, error } = await (supabase as any).rpc("approve_deposit_request", {
      request_id: requestId,
      admin_id,
      notes: notes ?? null,
    });
    if (error) throw error;
    return data;
  },

  async approveWithdrawal(requestId: string, notes?: string) {
    console.log("[Admin] Approving withdrawal", requestId);
    const { data: session } = await supabase.auth.getSession();
    const admin_id = session.session?.user?.id;
    if (!admin_id) throw new Error("Not authenticated");
    const { data, error } = await (supabase as any).rpc("approve_withdrawal_request", {
      request_id: requestId,
      admin_id,
      notes: notes ?? null,
    });
    if (error) throw error;
    return data;
  },

  async rejectRequest(requestId: string, type: "deposit" | "withdrawal", notes?: string) {
    console.log("[Admin] Rejecting", type, requestId);
    const { data: session } = await supabase.auth.getSession();
    const admin_id = session.session?.user?.id;
    if (!admin_id) throw new Error("Not authenticated");
    const { data, error } = await (supabase as any).rpc("reject_request", {
      request_id: requestId,
      request_type: type,
      admin_id,
      notes: notes ?? null,
    });
    if (error) throw error;
    return data;
  },

  // Reference data
  async fetchUsers(): Promise<AdminProfile[]> {
    console.log("[Admin] Fetching users");
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as AdminProfile[];
  },

  async fetchPositions(): Promise<AdminPosition[]> {
    console.log("[Admin] Fetching positions");
    const { data, error } = await (supabase as any)
      .from("portfolio_positions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as AdminPosition[];
  },

  async fetchTransactions(): Promise<AdminTransaction[]> {
    console.log("[Admin] Fetching transactions");
    const { data, error } = await (supabase as any)
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as AdminTransaction[];
  },
};
