'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import OpenAIChat from '../components/OpenAIChat';
import PromptComparator from '../components/PromptComparator';
import EmbeddingsExplorer from '../components/EmbeddingsExplorer';
import RAGDemo from '../components/RAGDemo';
import ErrorBoundary from '../components/ErrorBoundary';

const PAGES = {
  day1: <OpenAIChat />,
  day2: <PromptComparator />,
  day3: <EmbeddingsExplorer />,
  day45: <RAGDemo />,
};

export default function Home() {
  const [activePage, setActivePage] = useState('day1');

  return (
    <div className="app">
      <Navbar active={activePage} onSelect={setActivePage} />
      <main className="main">
        <ErrorBoundary key={activePage}>
          {PAGES[activePage]}
        </ErrorBoundary>
      </main>
    </div>
  );
}
