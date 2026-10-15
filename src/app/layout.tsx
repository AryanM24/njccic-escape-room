import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Protocol: Nightjar | AP Cybersecurity classroom activity',
  description:
    'A classroom activity for AP Cybersecurity students (Units 1 to 3). Teams investigate a fictional power utility incident in a simulated terminal and file five findings. Nothing in it connects to a real system.',
  applicationName: 'Protocol: Nightjar',
  category: 'education',
  openGraph: {
    type: 'website',
    title: 'Protocol: Nightjar | AP Cybersecurity classroom activity',
    description:
      'A classroom activity for AP Cybersecurity students. Fictional scenario, simulated terminal, no accounts or personal data.',
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#050505',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
