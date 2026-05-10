-- StudyPulse YKS initial Supabase schema.
-- Run this in the Supabase SQL editor after creating the project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  department text check (department in ('Edebiyat', 'Esit Agirlik', 'Sayisal', 'Dil')),
  target_department text,
  target_score numeric(6, 2),
  gem_balance integer not null default 0 check (gem_balance >= 0),
  daily_question_goal integer not null default 180 check (daily_question_goal > 0),
  streak_count integer not null default 0 check (streak_count >= 0),
  last_goal_completed_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id bigint generated always as identity primary key,
  name text not null unique,
  exam_type text not null check (exam_type in ('TYT', 'AYT', 'BOTH'))
);

create table if not exists public.topics (
  id bigint generated always as identity primary key,
  subject_id bigint not null references public.subjects(id) on delete cascade,
  name text not null,
  unique (subject_id, name),
  unique (id, subject_id)
);

create table if not exists public.study_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id bigint not null references public.subjects(id),
  topic_id bigint not null,
  solved_count integer not null check (solved_count >= 0),
  correct_count integer not null check (correct_count >= 0 and correct_count <= solved_count),
  wrong_count integer generated always as (greatest(solved_count - correct_count, 0)) stored,
  studied_at date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  foreign key (topic_id, subject_id) references public.topics(id, subject_id)
);

create or replace view public.subject_performance
with (security_invoker = true) as
select
  study_logs.user_id,
  subjects.id as subject_id,
  subjects.name as subject_name,
  sum(study_logs.solved_count)::integer as solved_count,
  sum(study_logs.correct_count)::integer as correct_count,
  sum(study_logs.wrong_count)::integer as wrong_count,
  round((sum(study_logs.correct_count)::numeric / nullif(sum(study_logs.solved_count), 0)) * 100, 2) as accuracy_rate
from public.study_logs
join public.subjects on subjects.id = study_logs.subject_id
group by study_logs.user_id, subjects.id, subjects.name;

create or replace view public.topic_performance
with (security_invoker = true) as
select
  study_logs.user_id,
  subjects.id as subject_id,
  subjects.name as subject_name,
  topics.id as topic_id,
  topics.name as topic_name,
  sum(study_logs.solved_count)::integer as solved_count,
  sum(study_logs.correct_count)::integer as correct_count,
  sum(study_logs.wrong_count)::integer as wrong_count,
  round((sum(study_logs.correct_count)::numeric / nullif(sum(study_logs.solved_count), 0)) * 100, 2) as accuracy_rate
from public.study_logs
join public.subjects on subjects.id = study_logs.subject_id
join public.topics on topics.id = study_logs.topic_id
group by study_logs.user_id, subjects.id, subjects.name, topics.id, topics.name;

create table if not exists public.mock_exams (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  exam_date date not null default current_date,
  tyt_net numeric(5, 2) not null default 0,
  ayt_net numeric(5, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_questions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null,
  subject_id bigint references public.subjects(id),
  topic_id bigint references public.topics(id),
  prompt text,
  solution text,
  status text not null default 'pending' check (status in ('pending', 'solved', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.gem_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null check (reason in ('daily_goal_completed', 'ai_question_spent', 'manual_adjustment')),
  related_ai_question_id bigint references public.ai_questions(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.study_logs enable row level security;
alter table public.mock_exams enable row level security;
alter table public.ai_questions enable row level security;
alter table public.gem_transactions enable row level security;

create policy "Users can manage own profile"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can manage own study logs"
on public.study_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own mock exams"
on public.mock_exams for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own AI questions"
on public.ai_questions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can view own gem transactions"
on public.gem_transactions for select
using (auth.uid() = user_id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, department, daily_question_goal, streak_count, gem_balance)
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
    0
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

insert into public.subjects (name, exam_type)
values
  ('Turk Dili ve Edebiyati', 'BOTH'),
  ('Matematik', 'BOTH'),
  ('Fizik', 'BOTH'),
  ('Kimya', 'BOTH'),
  ('Biyoloji', 'BOTH'),
  ('Tarih', 'BOTH'),
  ('Cografya', 'BOTH'),
  ('Felsefe', 'TYT'),
  ('Din Kulturu', 'TYT'),
  ('Yabanci Dil', 'AYT')
on conflict (name) do nothing;

insert into public.topics (subject_id, name)
select subjects.id, topic_name
from public.subjects
join (
  values
    ('Matematik', 'Problemler'),
    ('Matematik', 'Fonksiyonlar'),
    ('Matematik', 'Turev'),
    ('Matematik', 'Integral'),
    ('Turk Dili ve Edebiyati', 'Paragraf'),
    ('Turk Dili ve Edebiyati', 'Dil Bilgisi'),
    ('Turk Dili ve Edebiyati', 'Siir Bilgisi'),
    ('Turk Dili ve Edebiyati', 'Roman ve Hikaye'),
    ('Turk Dili ve Edebiyati', 'Edebi Akimlar'),
    ('Tarih', 'Ilk Turk Devletleri'),
    ('Tarih', 'Osmanli Kurulus'),
    ('Tarih', 'Kurtulus Savasi'),
    ('Fizik', 'Kuvvet ve Hareket'),
    ('Fizik', 'Elektrik'),
    ('Fizik', 'Dalgalar'),
    ('Kimya', 'Atom ve Periyodik Sistem'),
    ('Kimya', 'Kimyasal Tepkimeler'),
    ('Kimya', 'Organik Kimya'),
    ('Biyoloji', 'Canlilarin Temel Bilesenleri'),
    ('Biyoloji', 'Hucre'),
    ('Biyoloji', 'Kalitim'),
    ('Biyoloji', 'Ekoloji'),
    ('Cografya', 'Dogal Sistemler'),
    ('Cografya', 'Beseri Sistemler'),
    ('Cografya', 'Turkiye Cografyasi'),
    ('Felsefe', 'Bilgi Felsefesi'),
    ('Felsefe', 'Ahlak Felsefesi'),
    ('Felsefe', 'Mantik'),
    ('Din Kulturu', 'Inanc'),
    ('Din Kulturu', 'Ibadet'),
    ('Din Kulturu', 'Ahlak ve Degerler'),
    ('Yabanci Dil', 'Vocabulary'),
    ('Yabanci Dil', 'Grammar'),
    ('Yabanci Dil', 'Reading'),
    ('Yabanci Dil', 'Translation')
) as seed(subject_name, topic_name) on seed.subject_name = subjects.name
on conflict (subject_id, name) do nothing;
