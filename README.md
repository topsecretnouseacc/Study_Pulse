# StudyPulse YKS

StudyPulse YKS is a mobile study tracking and performance analytics application for students preparing for the Turkish university entrance exam, YKS.

The app helps students track solved questions, correct and wrong answers, daily goals, streaks, subject focus, mock exam results, and future AI-assisted question solving.

## Features

- Supabase Auth login and registration
- High school track selection: Sayisal, Esit Agirlik, Edebiyat, Dil
- Dashboard with daily question goal, remaining questions, review count, streak, and gem balance
- Study calendar showing daily solved-question progress
- Subject and topic selection from Supabase data
- Study log creation backed by Supabase `study_logs`
- Profile-based daily question goal
- Streak and gem balance updates when the daily goal is completed
- Mock exam tracking backed by Supabase
- Analytics prototype for topic accuracy and weak topics
- AI Solver placeholder for future image-based question solving

## Tech Stack

- React Native
- Expo
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security

## Project Structure

```text
App.tsx
src/
  components/
    ui.tsx
  data/
    catalog.ts
  lib/
    supabase.ts
  screens/
    AiScreen.tsx
    AnalyticsScreen.tsx
    AuthScreen.tsx
    ExamScreen.tsx
    HomeScreen.tsx
    SettingsScreen.tsx
    StudyScreen.tsx
  utils/
    study.ts
  styles.ts
  types.ts
docs/
  project-roadmap.md
  supabase-schema.sql
  supabase-profile-trigger.sql
  supabase-profile-goals.sql
  supabase-setup.md
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```text
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Do not include `/rest/v1/` in the URL.

Start the Expo app:

```bash
npm start
```

If Metro cache causes issues:

```bash
npx expo start -c
```

## Supabase Setup

Run the SQL files in Supabase SQL Editor:

1. `docs/supabase-schema.sql`
2. `docs/supabase-profile-trigger.sql`
3. `docs/supabase-profile-goals.sql`

These create the required tables, policies, seed subjects/topics, profile automation, streak fields, and daily goal fields.

Main tables:

- `profiles`
- `subjects`
- `topics`
- `study_logs`
- `mock_exams`
- `ai_questions`
- `gem_transactions`

## Current Status

Implemented:

- Modern mobile UI prototype
- Supabase authentication
- Profile creation and profile settings
- Subject/topic loading from Supabase
- Study log insertion into Supabase
- Daily goal, streak, and gem logic
- Database schema and setup documentation

Still planned:

- Add chart components for stronger analytics
- Add secure AI question solving through backend or Supabase Edge Functions
- Improve calendar with real historical data
- Add sign out and notification settings

## Security Notes

- `.env.local` is ignored by Git.
- Only the Supabase anon public key should be used in the mobile app.
- Never put the Supabase `service_role` key in the app or repository.

## Project Context

This project started as a capstone project proposal for an AI-assisted YKS preparation and performance tracking mobile application. Some scope and UI decisions were adjusted during development to improve usability, data consistency, security, and implementation reliability.
