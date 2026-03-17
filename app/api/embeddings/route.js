import OpenAI from 'openai';
import getConfig from 'next/config';

export async function POST(request) {
  try {
    const { serverRuntimeConfig } = getConfig();
    const apiKey = serverRuntimeConfig?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const { input } = await request.json();
    const openai = new OpenAI({ apiKey });
    const result = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input,
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
