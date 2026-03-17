'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import OpenAIChat from '../components/OpenAIChat';
import PromptComparator from '../components/PromptComparator';
import EmbeddingsExplorer from '../components/EmbeddingsExplorer';
import RAGDemo from '../components/RAGDemo';

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
        {PAGES[activePage]}
      </main>
    </div>
  );
}
