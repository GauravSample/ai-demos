import OpenAI from 'openai';
import getConfig from 'next/config';

export async function POST(request) {
  try {
    const { serverRuntimeConfig } = getConfig();
    const apiKey = serverRuntimeConfig?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const { messages, temperature = 0.7, max_tokens } = await request.json();
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature,
      messages,
      ...(max_tokens && { max_tokens }),
    });
    return Response.json(completion);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
