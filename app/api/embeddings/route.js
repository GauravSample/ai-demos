import OpenAI from 'openai';
import getConfig from 'next/config';

const MAX_INPUTS = 20;
const MAX_INPUT_LENGTH = 8000;

export async function POST(request) {
  try {
    const body = await request.json();
    const { input } = body;

    const inputs = Array.isArray(input) ? input : [input];

    if (inputs.length === 0) {
      return Response.json({ error: 'input must be a non-empty string or array' }, { status: 400 });
    }
    if (inputs.length > MAX_INPUTS) {
      return Response.json({ error: `Too many inputs (max ${MAX_INPUTS})` }, { status: 400 });
    }
    for (const text of inputs) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        return Response.json({ error: 'Each input must be a non-empty string' }, { status: 400 });
      }
      if (text.length > MAX_INPUT_LENGTH) {
        return Response.json({ error: `Input too long (max ${MAX_INPUT_LENGTH} chars)` }, { status: 400 });
      }
    }

    const { serverRuntimeConfig } = getConfig();
    const apiKey = serverRuntimeConfig?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const openai = new OpenAI({ apiKey });
    const result = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input,
    });

    return Response.json(result);
  } catch (err) {
    console.error('[/api/embeddings] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
