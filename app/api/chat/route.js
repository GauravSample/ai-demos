import OpenAI from 'openai';

export async function POST(request) {
  try {
    const { messages, temperature = 0.7, max_tokens } = await request.json();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
