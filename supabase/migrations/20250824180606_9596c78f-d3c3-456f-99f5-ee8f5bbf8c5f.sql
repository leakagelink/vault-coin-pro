
-- PROFILES: basic user info we can safely query from the client
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can only see/modify their own profile
create policy if not exists "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy if not exists "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);



-- WALLETS: one per user
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  balance numeric(20,8) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists wallets_user_id_idx on public.wallets(user_id);

alter table public.wallets enable row level security;

create policy if not exists "wallets_select_own"
  on public.wallets for select
  using (auth.uid() = user_id);

create policy if not exists "wallets_update_own"
  on public.wallets for update
  using (auth.uid() = user_id);

create policy if not exists "wallets_insert_own"
  on public.wallets for insert
  with check (auth.uid() = user_id);



-- TRANSACTIONS: deposits/withdrawals/trades
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('deposit','withdrawal','trade')),
  amount numeric(20,8) not null,
  currency text not null,
  status text not null default 'pending' check (status in ('pending','completed','failed')),
  method text check (method in ('upi','bank','usdt')),
  description text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions(user_id);

alter table public.transactions enable row level security;

create policy if not exists "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy if not exists "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);



-- WATCHLIST: track user’s saved coins
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  crypto_id text not null,
  crypto_symbol text not null,
  crypto_name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, crypto_id)
);

create index if not exists watchlist_user_id_idx on public.watchlist(user_id);

alter table public.watchlist enable row level security;

create policy if not exists "watchlist_select_own"
  on public.watchlist for select
  using (auth.uid() = user_id);

create policy if not exists "watchlist_insert_own"
  on public.watchlist for insert
  with check (auth.uid() = user_id);

create policy if not exists "watchlist_update_own"
  on public.watchlist for update
  using (auth.uid() = user_id);

create policy if not exists "watchlist_delete_own"
  on public.watchlist for delete
  using (auth.uid() = user_id);



-- PORTFOLIO: user positions/holdings
create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  crypto_id text not null,
  crypto_symbol text not null,
  crypto_name text not null,
  quantity numeric(20,8) not null,
  average_price numeric(20,8) not null,
  type text not null check (type in ('position','holding')),
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_user_id_idx on public.portfolio(user_id);

alter table public.portfolio enable row level security;

create policy if not exists "portfolio_select_own"
  on public.portfolio for select
  using (auth.uid() = user_id);

create policy if not exists "portfolio_insert_own"
  on public.portfolio for insert
  with check (auth.uid() = user_id);

create policy if not exists "portfolio_update_own"
  on public.portfolio for update
  using (auth.uid() = user_id);

create policy if not exists "portfolio_delete_own"
  on public.portfolio for delete
  using (auth.uid() = user_id);



-- Helper: auto-create profile + wallet when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.email)
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
