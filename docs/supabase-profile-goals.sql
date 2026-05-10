-- Adds user settings and streak fields to profiles.

alter table public.profiles
add column if not exists daily_question_goal integer not null default 180 check (daily_question_goal > 0),
add column if not exists streak_count integer not null default 0 check (streak_count >= 0),
add column if not exists last_goal_completed_date date;

alter table public.profiles
add column if not exists daily_goal_set boolean;

update public.profiles
set daily_goal_set = true
where daily_goal_set is null;

alter table public.profiles
alter column daily_goal_set set default false,
alter column daily_goal_set set not null;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, department, daily_question_goal, streak_count, gem_balance, daily_goal_set)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case
      when new.raw_user_meta_data ->> 'department' = 'Sayısal' then 'Sayisal'
      when new.raw_user_meta_data ->> 'department' = 'Eşit Ağırlık' then 'Esit Agirlik'
      when new.raw_user_meta_data ->> 'department' in ('Edebiyat', 'Dil') then new.raw_user_meta_data ->> 'department'
      else 'Sayisal'
    end,
    180,
    0,
    0,
    false
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    department = excluded.department;

  return new;
end;
$$;
