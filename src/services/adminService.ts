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

export interface AdminWallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentSettings {
  upi_id: string | null;
  qr_code_url: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  account_holder: string | null;
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

  async fetchWallets(): Promise<AdminWallet[]> {
    console.log("[Admin] Fetching wallets");
    const { data, error } = await (supabase as any)
      .from("wallets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as AdminWallet[];
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

  async addFundsToUser(userId: string, amount: number, notes: string = ""): Promise<void> {
    console.log("[Admin] Adding funds to user", userId, amount);
    const { data: session } = await supabase.auth.getSession();
    const admin_id = session.session?.user?.id;
    if (!admin_id) throw new Error("Not authenticated");
    
    const { error } = await (supabase as any).rpc("admin_add_funds", {
      target_user_id: userId,
      fund_amount: amount,
      admin_id,
      admin_notes: notes,
    });
    if (error) throw error;
  },

  // Payment settings functions
  async fetchPaymentSettings(): Promise<PaymentSettings> {
    console.log("[Admin] Fetching payment settings");
    const { data, error } = await (supabase as any)
      .from("payment_settings")
      .select("*")
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    
    return data || {
      upi_id: null,
      qr_code_url: null,
      bank_name: null,
      account_number: null,
      ifsc_code: null,
      account_holder: null,
    };
  },

  async updatePaymentSettings(settings: PaymentSettings): Promise<void> {
    console.log("[Admin] Updating payment settings");
    const { data: session } = await supabase.auth.getSession();
    const admin_id = session.session?.user?.id;
    if (!admin_id) throw new Error("Not authenticated");
    
    const { error } = await (supabase as any)
      .from("payment_settings")
      .upsert({
        id: 'default', // Single row for global settings
        ...settings,
        updated_by: admin_id,
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  },
};
