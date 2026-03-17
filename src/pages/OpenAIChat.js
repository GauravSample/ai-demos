import { useState } from 'react';
import OpenAI from 'openai';
import { getApiKey } from '../getApiKey';
import styles from './OpenAIChat.module.css';

const client = new OpenAI({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true,
});

const SYSTEM_MESSAGE = { role: 'system', content: 'You are a very very helpful assistant.' };
const TOKEN_LIMIT = 100;

export default function Day1Chat() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [context, setContext] = useState([SYSTEM_MESSAGE]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const messages = [...context, { role: 'user', content: prompt }];
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 1.0,
        messages,
      });

      const usedTokens = completion.usage.total_tokens;
      setTotalTokens(usedTokens);
      setResponse(completion.choices[0].message.content);

      if (usedTokens >= TOKEN_LIMIT) {
        setContext([SYSTEM_MESSAGE]);
      } else {
        setContext([
          ...messages,
          { role: 'assistant', content: completion.choices[0].message.content },
        ]);
      }
    } catch (err) {
      setResponse('Error: ' + err.message);
    } finally {
      setLoading(false);
      setPrompt('');
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>OpenAI Chat</h1>
      <p className={styles.sub}>Conversational chat with token-limit context management using <code>gpt-4o-mini</code></p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className={styles.textarea}
          placeholder="Ask something..."
        />
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Loading...' : 'Send ↗'}
        </button>
      </form>

      <div className={styles.tokenBar}>
        <div
          className={styles.tokenFill}
          style={{ width: `${Math.min((totalTokens / TOKEN_LIMIT) * 100, 100)}%` }}
        />
      </div>
      <p className={styles.tokenLabel}>Tokens used: {totalTokens} / {TOKEN_LIMIT}</p>

      {response && (
        <div className={styles.response}>
          <div className={styles.responseLabel}>Response</div>
          <p className={styles.responseText}>{response}</p>
        </div>
      )}
    </div>
  );
}
