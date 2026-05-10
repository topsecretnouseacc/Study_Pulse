# Supabase Setup

## Environment

Create `.env.local` in the project root:

```text
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Use the base project URL. Do not include `/rest/v1/`.

## Database

Run `docs/supabase-schema.sql` in the Supabase SQL Editor before testing database-backed features.

If the Study screen keeps saying the subject list is loading, run `docs/supabase-seed-subjects.sql`. That file fills the `subjects` and `topics` tables and is safe to run more than once.

## Auth

The app now uses Supabase Auth for sign up, sign in, and persisted sessions. Registration stores the student's selected track in user metadata and attempts to upsert the `profiles` table.

If email confirmation is enabled in Supabase, newly registered users may need to confirm their email before a real session is available.

## Connected Features

- Subjects and topics are loaded from Supabase.
- New study logs are inserted into `study_logs`.
- Study logs are read back with subject and topic names.
- Mock exam results are inserted into and loaded from `mock_exams`.
- Profiles store daily question goal, streak count, gem balance, and the last date the daily goal was completed.
- Profiles also store `daily_goal_set`, which controls the one-time daily goal popup for new accounts.
- Study calendar data is calculated from `study_logs`; there is no separate `study_calendar` table.
- When the daily question goal is reached for the first time in a day, streak and gem balance are updated.
- AI questions are still a local/prototype flow for now.

## Migrations After Initial Schema

If your project was created before streak/settings were added, run:

- `docs/supabase-profile-goals.sql`

Run the same file again if `daily_goal_set` is missing from `profiles`.
