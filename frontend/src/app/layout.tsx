import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Footer, Navbar, PrototypeBanner } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'CM Grievance Portal (Recruitment Prototype)',
  description: 'Prototype of a Chief Minister\'s public grievance redressal portal. Not affiliated with the Government of Kerala.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PrototypeBanner />
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
