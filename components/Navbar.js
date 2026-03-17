'use client';

import styles from './Navbar.module.css';

const TABS = [
  { id: 'day1', label: 'Day 1', sub: 'OpenAI Chat' },
  { id: 'day2', label: 'Day 2', sub: 'Prompt Comparator' },
  { id: 'day3', label: 'Day 3', sub: 'Embeddings Explorer' },
  { id: 'day45', label: 'Day 4–5', sub: 'RAG Demo' },
];

export default function Navbar({ active, onSelect }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>AI</span>
        <span className={styles.brandText}>AI Capability</span>
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
