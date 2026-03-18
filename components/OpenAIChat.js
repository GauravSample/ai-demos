'use client';

import { useState } from 'react';
import styles from './OpenAIChat.module.css';

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, temperature: 1.0 }),
      });
      const completion = await res.json();
      if (completion.error) throw new Error(completion.error);

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
      <h1 className={styles.heading}>Conversational AI</h1>
      <p className={styles.sub}>Multi-turn chat using <code>gpt-4o-mini</code> with manual context window management — the conversation history is tracked in state and trimmed when it approaches the token limit, mimicking how production chatbots handle long sessions.</p>

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
