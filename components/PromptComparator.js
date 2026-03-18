'use client';

import { useState } from 'react';
import { DEFAULT_PROMPTS } from '../data/prompts';
import styles from './PromptComparator.module.css';

async function callLLM(systemPrompt, userMessage) {
  const start = Date.now();
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });
  const completion = await res.json();
  if (completion.error) throw new Error(completion.error);
  return {
    text: completion.choices[0].message.content,
    inputTokens: completion.usage.prompt_tokens,
    outputTokens: completion.usage.completion_tokens,
    ms: Date.now() - start,
  };
}

export default function Day2Comparator() {
  const [userMsg, setUserMsg] = useState('Explain the difference between async/await and Promises in JavaScript.');
  const [prompts, setPrompts] = useState(
    DEFAULT_PROMPTS.map((p) => ({
      ...p,
      result: null,
      inputTokens: null,
      outputTokens: null,
      ms: null,
      loading: false,
      error: null,
    }))
  );
  const [running, setRunning] = useState(false);

  const update = (i, field, value) =>
    setPrompts((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));

  const runAll = async () => {
    if (!userMsg.trim()) return;
    setRunning(true);
    setPrompts((prev) => prev.map((p) => ({ ...p, loading: true, result: null, error: null })));

    await Promise.all(
      prompts.map(async (p, i) => {
        try {
          const { text, inputTokens, outputTokens, ms } = await callLLM(p.sys, userMsg);
          update(i, 'result', text);
          update(i, 'inputTokens', inputTokens);
          update(i, 'outputTokens', outputTokens);
          update(i, 'ms', ms);
        } catch (err) {
          update(i, 'error', 'Error: ' + err.message);
        } finally {
          update(i, 'loading', false);
        }
      })
    );
    setRunning(false);
  };

  const hasResults = prompts.some((p) => p.result);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Prompt Engineering</h1>
      <p className={styles.sub}>
        The same question sent to 4 different system prompts in parallel — zero-shot, role + chain-of-thought, few-shot, and structured output. Demonstrates how prompt design directly affects output quality, cost, and latency.
      </p>

      <div className={styles.inputRow}>
        <textarea
          className={styles.textarea}
          value={userMsg}
          onChange={(e) => setUserMsg(e.target.value)}
          placeholder="Type your question here — sent to all 4 prompts simultaneously"
          rows={3}
        />
        <button className={styles.runBtn} onClick={runAll} disabled={running || !userMsg.trim()}>
          {running ? 'Running…' : 'Run all 4 ↗'}
        </button>
      </div>

      <div className={styles.grid}>
        {prompts.map((p, i) => (
          <div key={i} className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={`${styles.badge} ${styles[`badge${i}`]}`}>P{i + 1}</span>
              <input
                className={styles.nameInput}
                value={p.name}
                onChange={(e) => update(i, 'name', e.target.value)}
              />
            </div>

            <textarea
              className={styles.sysTextarea}
              value={p.sys}
              onChange={(e) => update(i, 'sys', e.target.value)}
            />

            <div className={styles.resultArea}>
              {p.loading ? (
                <span className={styles.placeholder}>Waiting…</span>
              ) : p.error ? (
                <span style={{ color: '#c00', fontSize: 13 }}>{p.error}</span>
              ) : p.result ? (
                <p className={styles.resultText}>{p.result}</p>
              ) : (
                <span className={styles.placeholder}>Response appears here after running</span>
              )}
            </div>

            {p.outputTokens && (
              <div className={styles.footer}>
                in: {p.inputTokens} · out: {p.outputTokens} tokens · {p.ms}ms
              </div>
            )}
          </div>
        ))}
      </div>

      {hasResults && (
        <div className={styles.diffSection}>
          <div className={styles.diffLabel}>COMPARISON</div>
          <div className={styles.diffGrid}>
            <div className={styles.diffCard}>
              <div className={styles.diffCardLabel}>Output tokens (cost)</div>
              {prompts.filter((p) => p.outputTokens).map((p, i) => (
                <div key={i} className={styles.diffRow}>
                  <span style={{ color: '#666' }}>{p.name}</span>
                  <strong>{p.outputTokens}</strong>
                </div>
              ))}
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffCardLabel}>Response time (ms)</div>
              {prompts.filter((p) => p.ms).map((p, i) => (
                <div key={i} className={styles.diffRow}>
                  <span style={{ color: '#666' }}>{p.name}</span>
                  <strong>{p.ms}</strong>
                </div>
              ))}
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffCardLabel}>Response length (chars)</div>
              {prompts.filter((p) => p.result).map((p, i) => (
                <div key={i} className={styles.diffRow}>
                  <span style={{ color: '#666' }}>{p.name}</span>
                  <strong>{p.result.length}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
