import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { CitizenProvider, GovProvider } from '@/lib/session';
import { GuideProvider } from '@/lib/guide';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'प्रgati — Skill Portal, Government of Maharashtra',
    template: '%s | प्रgati',
  },
  description:
    'Government of Maharashtra skill portal. Find training that leads to real jobs, get certified for work you already do, and hire trained people.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b2d5c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-fontscale="md" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased bg-[var(--surface)] text-[var(--ink)] min-h-screen flex flex-col">
        <CitizenProvider>
          <GovProvider>
            <GuideProvider>{children}</GuideProvider>
          </GovProvider>
        </CitizenProvider>
      </body>
    </html>
  );
}
