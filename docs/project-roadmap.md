# StudyPulse YKS Roadmap

## Product Direction

StudyPulse YKS is a mobile study tracking and performance analytics app for YKS students. The original proposal described React Native, Supabase, PostgreSQL, Supabase Storage, and OpenAI API. We keep that architecture, but the build order is adjusted to reduce risk:

1. Build the mobile experience with mock data.
2. Add local state and validation for core flows.
3. Connect Supabase Auth and database tables.
4. Add charts and stronger analytics.
5. Add AI question solving through a secure backend function.

## Scope Changes From Proposal

- The AI module will not call OpenAI directly from the mobile app. It will use a backend or Supabase Edge Function so API keys stay private.
- The first release focuses on performance tracking before AI. This keeps the core product working even if AI cost, quota, or response quality needs tuning.
- Analytics will include practical student signals such as weak topics, best mock exam net, weekly effort, and accuracy trend.
- UI/UX will use a modern dashboard style instead of a generic task manager layout.
- Study entries will use subject and topic selection instead of free text input. This prevents spelling differences from breaking analytics.
- The home screen is redesigned around a daily goal model inspired by modern habit and nutrition tracking apps. Calories are replaced with solved questions, remaining goal, review load, subject distribution, streak, and day-by-day study continuity.
- The UI should keep the usability pattern of the reference app but not copy it directly. StudyPulse uses its own focus-track card, AI-credit gem economy, study calendar, and YKS-specific subject distribution.
- During registration, students will choose one of four Turkish high school tracks: Edebiyat, Esit Agirlik, Sayisal, or Dil. The selected track changes the main subject distribution shown on the dashboard.
- Gems are earned when the student completes the daily question goal. Each AI question solution spends one gem, making AI use motivational and controlled.
- Streak, gem balance, and daily question goal are stored in the user's profile and updated from real study log activity.
- The subject catalog follows the common Turkish high school and YKS preparation structure: Mathematics, Turkish Language and Literature, Physics, Chemistry, Biology, History, Geography, Philosophy, Religious Culture, and Foreign Language. Dashboard focus subjects are selected according to the student's track.

## Data Model Decision

We will not create a separate table for every subject such as `history`, `math`, or `physics`. Instead, all subjects live in `subjects`, all topics live in `topics`, and every solved-question entry lives in `study_logs`.

This gives us the same analysis power with less duplication:

- `subjects.id` identifies the lesson, for example Mathematics or History.
- `topics.subject_id` connects each topic to its lesson.
- `study_logs.subject_id` and `study_logs.topic_id` connect every daily record to the selected subject and topic.
- Total correct, wrong, and accuracy values are calculated from `study_logs` with SQL queries or views.

This design is easier to maintain because adding a new subject only inserts new rows. It does not require creating new tables or changing app code.

## MVP Screens

- Dashboard: overall progress, accuracy, weak topic, recent activity.
- Auth: login and registration flow with full name, email, password, and high school track selection.
- Study Calendar: day-by-day solved question count and goal completion status.
- Study Log: subject, topic, solved questions, correct answers.
- Mock Exams: TYT and AYT net tracking.
- Analytics: topic-level accuracy and weak area discovery.
- AI Solver: image upload and step-by-step solution flow placeholder.

## Next Implementation Steps

1. Replace single-file prototype with a scalable folder structure.
2. Add Expo Router navigation.
3. Add Supabase client and environment configuration.
4. Create database tables with row-level security.
5. Add authentication screens. Done for the mock-to-Supabase transition; next step is deeper persistence.
6. Persist study logs and mock exams in Supabase.
7. Add chart components.
8. Implement secure AI solver flow.
