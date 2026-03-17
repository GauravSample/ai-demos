import './globals.css';

export const metadata = {
  title: 'AI Capability',
  description: 'AI learning demos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
