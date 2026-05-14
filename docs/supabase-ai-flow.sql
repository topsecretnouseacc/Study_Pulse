-- Enables client-side AI request queue writes and gem transaction history.
-- Safe to run more than once.

alter table public.ai_questions enable row level security;
alter table public.gem_transactions enable row level security;

drop policy if exists "Users can manage own AI questions" on public.ai_questions;
drop policy if exists "Users can view own gem transactions" on public.gem_transactions;
drop policy if exists "Users can insert own gem transactions" on public.gem_transactions;

create policy "Users can manage own AI questions"
on public.ai_questions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can view own gem transactions"
on public.gem_transactions for select
using (auth.uid() = user_id);

create policy "Users can insert own gem transactions"
on public.gem_transactions for insert
with check (auth.uid() = user_id);
