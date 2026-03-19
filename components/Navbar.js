'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';

const TABS = [
  { id: 'day1', label: 'Conversational AI', sub: 'Context & token management' },
  { id: 'day2', label: 'Prompt Engineering', sub: 'Zero-shot to structured output' },
  { id: 'day3', label: 'Embeddings', sub: 'Vectors & semantic similarity' },
  { id: 'day45', label: 'RAG Pipeline', sub: 'Retrieval-augmented generation' },
];

export default function Navbar({ active, onSelect }) {
  const [wiggle, setWiggle] = useState(false);
  const tabRefs = useRef({});

  useEffect(() => {
    const interval = setInterval(() => {
      setWiggle(true);
      setTimeout(() => setWiggle(false), 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    tabRefs.current[active]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }, [active]);

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>AI</span>
        <span className={styles.brandText}>AI Demos</span>
      </div>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            className={`${styles.tab} ${active === tab.id ? styles.tabActive : ''} ${wiggle && active !== tab.id ? styles.tabWiggle : ''}`}
            onClick={() => onSelect(tab.id)}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.tabSub}>{tab.sub}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
