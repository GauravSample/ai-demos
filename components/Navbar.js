'use client';

import styles from './Navbar.module.css';

const TABS = [
  { id: 'day1', label: 'Conversational AI', sub: 'Context & token management' },
  { id: 'day2', label: 'Prompt Engineering', sub: 'Zero-shot to structured output' },
  { id: 'day3', label: 'Embeddings', sub: 'Vectors & semantic similarity' },
  { id: 'day45', label: 'RAG Pipeline', sub: 'Retrieval-augmented generation' },
];

export default function Navbar({ active, onSelect }) {
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
            className={`${styles.tab} ${active === tab.id ? styles.tabActive : ''}`}
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
