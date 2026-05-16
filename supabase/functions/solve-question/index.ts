import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.4';

type AiQuestionRow = {
  id: number;
  user_id: string;
  image_path: string;
  prompt: string | null;
  solution: string | null;
  status: 'pending' | 'solved' | 'failed';
  subjects: { name: string } | null;
  topics: { name: string } | null;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4.1-mini';

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !openAiKey) {
      throw new Error('Missing required function secrets.');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header.' }, 401);
    }

    const { questionId } = await req.json();
    if (!questionId || typeof questionId !== 'number') {
      return json({ error: 'questionId is required.' }, 400);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) {
      return json({ error: 'Unauthorized.' }, 401);
    }

    const { data: question, error: questionError } = await adminClient
      .from('ai_questions')
      .select('id, user_id, image_path, prompt, solution, status, subjects(name), topics(name)')
      .eq('id', questionId)
      .single<AiQuestionRow>();

    if (questionError || !question) {
      return json({ error: 'Question not found.' }, 404);
    }

    if (question.user_id !== authData.user.id) {
      return json({ error: 'Forbidden.' }, 403);
    }

    if (question.status === 'solved' && question.solution) {
      return json({ solution: question.solution, status: question.status });
    }

    const content: Array<
      | { type: 'input_text'; text: string }
      | { type: 'input_image'; image_url: string }
    > = [
      {
        type: 'input_text',
        text: [
          `Ders: ${question.subjects?.name ?? 'Belirtilmedi'}`,
          `Konu: ${question.topics?.name ?? 'Belirtilmedi'}`,
          `Soru/not: ${question.prompt ?? 'Görseldeki soruyu çöz.'}`,
        ].join('\n'),
      },
    ];

    if (question.image_path && !question.image_path.startsWith('manual-entry/')) {
      const { data: imageData, error: imageError } = await adminClient.storage
        .from('ai-question-images')
        .download(question.image_path);

      if (imageError || !imageData) {
        throw new Error(imageError?.message ?? 'Question image could not be loaded.');
      }

      const bytes = new Uint8Array(await imageData.arrayBuffer());
      if (bytes.length === 0) {
        throw new Error('Question image is empty. Please upload the photo again.');
      }

      content.push({
        type: 'input_image',
        image_url: `data:${getMimeType(question.image_path)};base64,${base64FromBytes(bytes)}`,
      });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        instructions:
          'Sen Türkiye YKS öğrencilerine yardım eden uzman bir öğretmensin. Cevabı Türkçe ver. Önce kısa yöntem, sonra adım adım çözüm, en sonda final cevap yaz. Görseldeki metni okuyamıyorsan bunu açıkça belirt.',
        input: [
          {
            role: 'user',
            content,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      await adminClient.from('ai_questions').update({ status: 'failed', solution: errorText.slice(0, 1000) }).eq('id', question.id);
      return json({ error: 'OpenAI request failed.', detail: errorText }, 502);
    }

    const result = await response.json();
    const solution = extractOutputText(result);

    const { error: updateError } = await adminClient
      .from('ai_questions')
      .update({ status: 'solved', solution })
      .eq('id', question.id);

    if (updateError) {
      throw updateError;
    }

    return json({ solution, status: 'solved' });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500);
  }
});

function extractOutputText(result: { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }) {
  if (result.output_text) return result.output_text;

  const text = result.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join('\n\n');

  return text || 'Çözüm üretilemedi.';
}

function getMimeType(path: string) {
  const normalized = path.toLowerCase();
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function base64FromBytes(bytes: Uint8Array) {
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
