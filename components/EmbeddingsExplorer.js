'use client';

import { useState } from 'react';
import styles from './EmbeddingsExplorer.module.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

function simLabel(score) {
  if (score > 0.85) return 'nearly identical';
  if (score > 0.65) return 'very similar';
  if (score > 0.45) return 'somewhat related';
  return 'unrelated';
}

function simColor(score) {
  if (score > 0.65) return '#16a34a';
  if (score > 0.45) return '#d97706';
  return '#dc2626';
}

async function embedTexts(input) {
  const res = await fetch('/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });
  const result = await res.json();
  if (result.error) throw new Error(result.error);
  return result;
}

// ── Section 1: Single Embedding ───────────────────────────────────────────────

function SingleEmbed() {
  const [text, setText] = useState('JavaScript is a programming language');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await embedTexts(text);
      const vector = res.data[0].embedding;
      setResult({ dims: vector.length, preview: vector.slice(0, 8), tokens: res.usage.total_tokens });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNum}>1</span>
        <div>
          <div className={styles.sectionTitle}>Basic Embedding</div>
          <div className={styles.sectionSub}>Turn text into a vector of numbers</div>
        </div>
      </div>

      <div className={styles.row}>
        <input
          className={styles.input}
          value={text}
          onChange={(e) => { setText(e.target.value); setResult(null); }}
          placeholder="Type any text…"
        />
        <button className={styles.btn} onClick={run} disabled={loading || !text.trim()}>
          {loading ? 'Embedding…' : 'Embed ↗'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.card}>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statVal}>{result.dims.toLocaleString()}</div>
              <div className={styles.statLabel}>dimensions</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{result.tokens}</div>
              <div className={styles.statLabel}>tokens used</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>~$0.000{result.tokens}</div>
              <div className={styles.statLabel}>approx cost</div>
            </div>
          </div>

          <div className={styles.previewLabel}>First 8 of {result.dims} dimensions</div>
          <div className={styles.barRow}>
            {result.preview.map((val, i) => (
              <div key={i} className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ height: `${Math.abs(val) * 100}%`, background: val >= 0 ? '#5856d6' : '#ef4444' }}
                  />
                </div>
                <div className={styles.barVal}>{val.toFixed(3)}</div>
                <div className={styles.barIdx}>d{i}</div>
              </div>
            ))}
          </div>

          <div className={styles.note}>
            Each dimension is a float roughly between -1 and 1. The model produces {result.dims} of them — that's your vector.
          </div>
        </div>
      )}
    </section>
  );
}

// ── Section 2: Batch Embedding ────────────────────────────────────────────────

const DEFAULT_BATCH = [
  'JavaScript is a programming language',
  'Python is used for data science',
  'I love eating pizza',
];

const COLORS = ['#5856d6', '#16a34a', '#d97706'];

function BatchEmbed() {
  const [texts, setTexts] = useState(DEFAULT_BATCH);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateText = (i, val) => {
    const next = [...texts];
    next[i] = val;
    setTexts(next);
    setResult(null);
  };

  const run = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await embedTexts(texts);
      setResult({
        items: res.data.map((d, i) => ({
          text: texts[i],
          dims: d.embedding.length,
          preview: d.embedding.slice(0, 3),
        })),
        tokens: res.usage.total_tokens,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNum}>2</span>
        <div>
          <div className={styles.sectionTitle}>Batch Embedding</div>
          <div className={styles.sectionSub}>Embed multiple texts in a single API call — efficient &amp; cheap</div>
        </div>
      </div>

      <div className={styles.batchInputs}>
        {texts.map((t, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.badge} style={{ background: COLORS[i] + '22', color: COLORS[i] }}>T{i + 1}</span>
            <input className={styles.input} value={t} onChange={(e) => updateText(i, e.target.value)} placeholder={`Text ${i + 1}`} />
          </div>
        ))}
      </div>

      <button className={styles.btn} onClick={run} disabled={loading}>
        {loading ? 'Embedding…' : `Embed all ${texts.length} at once ↗`}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.card}>
          <div className={styles.statsRow}>
            <div className={styles.stat}><div className={styles.statVal}>1</div><div className={styles.statLabel}>API call</div></div>
            <div className={styles.stat}><div className={styles.statVal}>{result.tokens}</div><div className={styles.statLabel}>total tokens</div></div>
          </div>
          <div className={styles.batchResults}>
            {result.items.map((item, i) => (
              <div key={i} className={styles.batchRow}>
                <span className={styles.badge} style={{ background: COLORS[i] + '22', color: COLORS[i] }}>T{i + 1}</span>
                <div className={styles.batchText}>{item.text}</div>
                <div className={styles.batchDims}>{item.dims}D</div>
                <div className={styles.batchPreview}>[{item.preview.map((v) => v.toFixed(3)).join(', ')}, …]</div>
              </div>
            ))}
          </div>
          <div className={styles.note}>One call returned {result.items.length} independent vectors. Batching avoids per-request overhead.</div>
        </div>
      )}
    </section>
  );
}

// ── Section 3: Cosine Similarity ──────────────────────────────────────────────

const DEFAULT_SENTENCES = [
  'How do I reverse a string in JavaScript?',
  'What is the best way to flip a string in JS?',
  'What should I eat for dinner tonight?',
];

const BADGE_COLORS = ['#5856d6', '#16a34a', '#d97706'];

function CosineSim() {
  const [sentences, setSentences] = useState(DEFAULT_SENTENCES);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateSentence = (i, val) => {
    const next = [...sentences];
    next[i] = val;
    setSentences(next);
    setResult(null);
  };

  const run = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await embedTexts(sentences);
      const vectors = res.data.map((d) => d.embedding);
      const pairs = [];
      for (let i = 0; i < vectors.length; i++) {
        for (let j = i + 1; j < vectors.length; j++) {
          pairs.push({ a: i, b: j, score: cosineSimilarity(vectors[i], vectors[j]) });
        }
      }
      setResult({ pairs, tokens: res.usage.total_tokens });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNum}>3</span>
        <div>
          <div className={styles.sectionTitle}>Cosine Similarity</div>
          <div className={styles.sectionSub}>Measure semantic "closeness" between sentences — no library needed</div>
        </div>
      </div>

      <div className={styles.batchInputs}>
        {sentences.map((s, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.badge} style={{ background: BADGE_COLORS[i] + '22', color: BADGE_COLORS[i] }}>S{i + 1}</span>
            <input className={styles.input} value={s} onChange={(e) => updateSentence(i, e.target.value)} placeholder={`Sentence ${i + 1}`} />
          </div>
        ))}
      </div>

      <button className={styles.btn} onClick={run} disabled={loading}>
        {loading ? 'Comparing…' : 'Compare all pairs ↗'}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.card}>
          <div className={styles.note} style={{ marginBottom: 14 }}>
            Tokens used: {result.tokens} · Score range: −1 (opposite) → 0 (unrelated) → 1 (identical)
          </div>
          {result.pairs.map(({ a, b, score }) => (
            <div key={`${a}-${b}`} className={styles.simRow}>
              <div className={styles.simPair}>
                <span className={styles.badge} style={{ background: BADGE_COLORS[a] + '22', color: BADGE_COLORS[a] }}>S{a + 1}</span>
                <span className={styles.simVs}>vs</span>
                <span className={styles.badge} style={{ background: BADGE_COLORS[b] + '22', color: BADGE_COLORS[b] }}>S{b + 1}</span>
              </div>
              <div className={styles.simTrack}>
                <div className={styles.simFill} style={{ width: `${score * 100}%`, background: simColor(score) }} />
              </div>
              <div className={styles.simScore} style={{ color: simColor(score) }}>{score.toFixed(3)}</div>
              <div className={styles.simLabel}>{simLabel(score)}</div>
            </div>
          ))}
          <div className={styles.note} style={{ marginTop: 14 }}>
            Formula: <code>dot(A, B) / (|A| × |B|)</code> — pure JS, no library.
          </div>
        </div>
      )}
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Day3Embeddings() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Embeddings Explorer</h1>
      <p className={styles.sub}>
        Learn how text embeddings work — step by step — using <code>text-embedding-3-small</code>
      </p>
      <SingleEmbed />
      <BatchEmbed />
      <CosineSim />
    </div>
  );
}
