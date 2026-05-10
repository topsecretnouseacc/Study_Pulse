-- Fix public YKS catalog access and seed subjects/topics.
-- Run this in Supabase SQL Editor if the app cannot load the Log Study subject list.
-- Safe to run more than once.

alter table public.subjects enable row level security;
alter table public.topics enable row level security;

drop policy if exists "Anyone can read subjects" on public.subjects;
drop policy if exists "Anyone can read topics" on public.topics;

create policy "Anyone can read subjects"
on public.subjects for select
to anon, authenticated
using (true);

create policy "Anyone can read topics"
on public.topics for select
to anon, authenticated
using (true);

insert into public.subjects (name, exam_type)
values
  ('Turk Dili ve Edebiyati', 'BOTH'),
  ('Matematik', 'BOTH'),
  ('Tarih', 'BOTH'),
  ('Cografya', 'BOTH'),
  ('Felsefe', 'TYT'),
  ('Din Kulturu', 'TYT'),
  ('Fizik', 'BOTH'),
  ('Kimya', 'BOTH'),
  ('Biyoloji', 'BOTH'),
  ('Yabanci Dil', 'AYT')
on conflict (name) do nothing;

insert into public.topics (subject_id, name)
select subjects.id, seed.topic_name
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
