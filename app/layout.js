import './globals.css';

const APP_URL = 'https://main.d30kst47gtj7uu.amplifyapp.com';

export const metadata = {
  title: 'AI Demos — Gaurav Saxena',
  description: 'Interactive AI demos built from scratch by Gaurav Saxena — covering conversational AI, prompt engineering, embeddings, and a RAG pipeline without any AI framework.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: 'AI Demos — Gaurav Saxena',
    description: 'Interactive AI demos built from scratch — conversational AI, prompt engineering, embeddings, and RAG pipeline.',
    url: APP_URL,
    siteName: 'AI Demos',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1440, height: 640, alt: 'AI Demos by Gaurav Saxena' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Demos — Gaurav Saxena',
    description: 'Interactive AI demos built from scratch — conversational AI, prompt engineering, embeddings, and RAG pipeline.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
