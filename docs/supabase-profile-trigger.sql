-- Creates a profile automatically whenever a Supabase Auth user is created.
-- Also backfills profiles for users that already exist.

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, department)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case
      when new.raw_user_meta_data ->> 'department' = 'Sayısal' then 'Sayisal'
      when new.raw_user_meta_data ->> 'department' = 'Eşit Ağırlık' then 'Esit Agirlik'
      when new.raw_user_meta_data ->> 'department' in ('Edebiyat', 'Dil') then new.raw_user_meta_data ->> 'department'
      else 'Sayisal'
    end
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    department = excluded.department;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

insert into public.profiles (id, full_name, department)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', split_part(users.email, '@', 1)),
  case
    when users.raw_user_meta_data ->> 'department' = 'Sayısal' then 'Sayisal'
    when users.raw_user_meta_data ->> 'department' = 'Eşit Ağırlık' then 'Esit Agirlik'
    when users.raw_user_meta_data ->> 'department' in ('Edebiyat', 'Dil') then users.raw_user_meta_data ->> 'department'
    else 'Sayisal'
  end
from auth.users
on conflict (id) do update
set
  full_name = excluded.full_name,
  department = excluded.department;
