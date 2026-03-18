'use client';

import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DEFAULT_PROMPTS } from '../data/prompts';
import styles from './PromptComparator.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BORDER_COLORS = ['#5b21b6', '#065f46', '#92400e', '#9d174d'];
const BG_COLORS = ['#ede9fe', '#d1fae5', '#fef3c7', '#fce7f3'];

function ComparisonCharts({ prompts }) {
  const done = prompts.filter((p) => p.result);
  const labels = done.map((p) => p.name);
  const colors = done.map((_, i) => BORDER_COLORS[i]);
  const bgColors = done.map((_, i) => BG_COLORS[i]);

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } } },
    borderRadius: 6,
  };

  const tokenChart = {
    labels,
    datasets: [{ label: 'Output Tokens', data: done.map((p) => p.outputTokens), backgroundColor: bgColors, borderColor: colors, borderWidth: 1.5 }],
  };

  const timeChart = {
    labels,
    datasets: [{ label: 'Response Time (ms)', data: done.map((p) => p.ms), backgroundColor: bgColors, borderColor: colors, borderWidth: 1.5 }],
  };

  const lengthChart = {
    labels,
    datasets: [{ label: 'Response Length (chars)', data: done.map((p) => p.result.length), backgroundColor: bgColors, borderColor: colors, borderWidth: 1.5 }],
  };

  return (
    <div className={styles.chartsRow}>
      <div className={styles.chartCard}>
        <div className={styles.diffCardLabel}>Output Tokens (cost)</div>
        <Bar data={tokenChart} options={chartOptions} />
      </div>
      <div className={styles.chartCard}>
        <div className={styles.diffCardLabel}>Response Time (ms)</div>
        <Bar data={timeChart} options={chartOptions} />
      </div>
      <div className={styles.chartCard}>
        <div className={styles.diffCardLabel}>Response Length (chars)</div>
        <Bar data={lengthChart} options={chartOptions} />
      </div>
    </div>
  );
}

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

export default function Day2Comparator({ onResultsReady }) {
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
    if (onResultsReady) onResultsReady();
  };

  const hasResults = prompts.some((p) => p.result);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Prompt Engineering</h1>
      <p className={styles.sub}>
        The same question sent to 4 different system prompts in parallel — zero-shot, role + chain-of-thought, few-shot, and structured output. Results are compared side by side with bar charts showing token cost, response time, and output length across all 4 strategies.
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
          <div className={styles.diffLabel}>PERFORMANCE COMPARISON ACROSS PROMPT STRATEGIES</div>
          <ComparisonCharts prompts={prompts} />
        </div>
      )}
    </div>
  );
}
