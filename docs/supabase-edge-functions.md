# Supabase Edge Function Setup

The AI solver uses the `solve-question` Edge Function. The mobile app never stores the OpenAI API key.

## 1. Login

```powershell
npx supabase login
```

## 2. Link Project

Use the project ref from the Supabase URL:

```powershell
npx supabase link --project-ref vdhapzspbhqukhaatxdn
```

## 3. Add Secrets

Do not paste the API key into source code.

```powershell
npx supabase secrets set OPENAI_API_KEY=your_openai_key
```

Optional model override:

```powershell
npx supabase secrets set OPENAI_MODEL=gpt-4.1-mini
```

## 4. Deploy Function

```powershell
npx supabase functions deploy solve-question
```

## 5. Database Policies and Storage

Run this in Supabase SQL Editor if not already applied:

```text
docs/supabase-ai-flow.sql
docs/supabase-ai-storage.sql
```
