import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Protocol: Nightjar',
  description:
    'A cybersecurity escape room for AP Cybersecurity students. Eight locks, one terminal, one insider.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0b0906',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
