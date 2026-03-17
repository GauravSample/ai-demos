'use client';

import { useState } from 'react';
import styles from './RAGDemo.module.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

function chunkText(text, chunkSize = 200, overlap = 40) {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize && current) {
      chunks.push(current.trim());
      current = current.slice(-overlap) + ' ' + sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function buildVectorStore(text) {
  const chunks = chunkText(text);
  const res = await fetch('/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: chunks }),
  });
  const result = await res.json();
  if (result.error) throw new Error(result.error);
  return chunks.map((t, i) => ({ text: t, embedding: result.data[i].embedding }));
}

async function retrieve(query, store, topK = 3, threshold = 0.3) {
  const res = await fetch('/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: [query] }),
  });
  const result = await res.json();
  if (result.error) throw new Error(result.error);
  const queryVec = result.data[0].embedding;
  return store
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryVec, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((c) => c.score > threshold);
}

async function ragAnswer(query, store) {
  const relevantChunks = await retrieve(query, store);
  if (relevantChunks.length === 0) {
    return { answer: "I don't have enough information to answer that.", sources: [] };
  }
  const context = relevantChunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n');
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: `Answer the question using ONLY the context below.\nIf the answer isn't in the context, say "I don't know".\nDo not make up information.\n\nContext:\n${context}`,
        },
        { role: 'user', content: query },
      ],
    }),
  });
  const completion = await res.json();
  if (completion.error) throw new Error(completion.error);
  return {
    answer: completion.choices[0].message.content,
    sources: relevantChunks.map((c) => ({ score: c.score.toFixed(3), text: c.text.slice(0, 200) })),
  };
}

// ── Default document ──────────────────────────────────────────────────────────

const DEFAULT_DOCUMENT = `
React is a JavaScript library for building user interfaces.
It uses a component-based architecture where UIs are built
from small, reusable pieces called components.

React introduced the Virtual DOM — a lightweight copy of the
real DOM. When state changes, React diffs the virtual DOM
and only updates what actually changed in the real DOM.

Hooks like useState and useEffect let you use state and
lifecycle features in functional components. useState returns
a value and a setter. useEffect runs side effects after render.

React's one-way data flow means data flows down through props.
For sharing state between components, you lift state up to a
common parent or use a state manager like Redux or Zustand.
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Day45RAG() {
  const [document, setDocument] = useState(DEFAULT_DOCUMENT);
  const [vectorStore, setVectorStore] = useState([]);
  const [chunksCount, setChunksCount] = useState(0);
  const [query, setQuery] = useState('How does the Virtual DOM work?');
  const [result, setResult] = useState(null);
  const [building, setBuilding] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [buildError, setBuildError] = useState(null);

  const handleBuild = async () => {
    setBuilding(true);
    setBuildError(null);
    try {
      const store = await buildVectorStore(document);
      setVectorStore(store);
      setChunksCount(store.length);
      setResult(null);
    } catch (e) {
      setBuildError(e.message);
    } finally {
      setBuilding(false);
    }
  };

  const handleQuery = async () => {
    if (!vectorStore.length) return;
    setQuerying(true);
    setResult(null);
    try {
      const res = await ragAnswer(query, vectorStore);
      setResult(res);
    } catch (e) {
      setResult({ answer: `Error: ${e.message}`, sources: [] });
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>RAG Demo</h1>
      <p className={styles.sub}>Build a simple RAG pipeline using OpenAI embeddings and chat completions.</p>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>1</span>
          <div>
            <div className={styles.sectionTitle}>Document</div>
            <div className={styles.sectionSub}>Edit the document that will be chunked and indexed</div>
          </div>
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          <textarea
            className={`${styles.input} ${styles.docArea}`}
            rows={8}
            value={document}
            onChange={(e) => { setDocument(e.target.value); setVectorStore([]); setChunksCount(0); }}
          />
        </div>

        {buildError && <div className={styles.error}>{buildError}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className={styles.btn} onClick={handleBuild} disabled={building}>
            {building ? 'Building…' : 'Build Vector Store'}
          </button>
          {chunksCount > 0 && (
            <span className={styles.chunkBadge}>{chunksCount} chunks indexed ✓</span>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>2</span>
          <div>
            <div className={styles.sectionTitle}>Query</div>
            <div className={styles.sectionSub}>Ask a question — retrieved context will be shown</div>
          </div>
        </div>

        <div className={styles.row}>
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about the document…"
          />
          <button
            className={styles.btn}
            onClick={handleQuery}
            disabled={querying || !vectorStore.length || !query.trim()}
            style={{ margin: '14px 20px 16px', flexShrink: 0 }}
          >
            {querying ? 'Thinking…' : vectorStore.length ? 'Ask ↗' : 'Build first'}
          </button>
        </div>

        {result && (
          <div className={styles.card}>
            <div className={styles.sectionTitle} style={{ marginBottom: 8 }}>Answer</div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7 }}>{result.answer}</div>

            {result.sources.length > 0 && (
              <>
                <div className={styles.sourcesLabel}>Sources</div>
                {result.sources.map((s, i) => (
                  <div key={i} className={styles.sourceRow}>
                    <span className={styles.sourceScore}>{s.score}</span>
                    <span className={styles.sourceText}>{s.text}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
