import OpenAI from 'openai';
import getConfig from 'next/config';

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, temperature = 0.7, max_tokens } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'messages must be a non-empty array' }, { status: 400 });
    }
    if (messages.length > MAX_MESSAGES) {
      return Response.json({ error: `Too many messages (max ${MAX_MESSAGES})` }, { status: 400 });
    }
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        return Response.json({ error: 'Each message must have role and content' }, { status: 400 });
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return Response.json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }, { status: 400 });
      }
    }

    const { serverRuntimeConfig } = getConfig();
    const apiKey = serverRuntimeConfig?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature,
      messages,
      ...(max_tokens && { max_tokens }),
    });

    return Response.json(completion);
  } catch (err) {
    console.error('[/api/chat] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
