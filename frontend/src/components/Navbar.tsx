'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { homeFor, useAuth } from '@/lib/auth';

const LINKS = [['/', 'Home'], ['/about', 'About'], ['/how-it-works', 'How it works'], ['/departments', 'Departments'], ['/faq', 'FAQ'], ['/contact', 'Contact']];

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-brand-800">CM Grievance Portal <span className="muted">(prototype)</span></Link>
        <button className="btn-outline md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">Menu</button>
        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 top-full w-full flex-col gap-3 border-b bg-white p-4 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:p-0`}>
          {LINKS.map(([href, text]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="text-sm text-gray-700 hover:text-brand-700">{text}</Link>)}
          <Link href="/track" className="text-sm font-medium text-brand-700">Track grievance</Link>
          {user ? (
            <>
              <Link href={homeFor(user.role)} className="btn-outline">Dashboard</Link>
              <button className="btn-primary" onClick={() => { logout(); router.push('/'); }}>Logout</button>
            </>
          ) : (
            <><Link href="/login" className="btn-outline">Login</Link><Link href="/register" className="btn-primary">Register</Link></>
          )}
        </nav>
      </div>
    </header>
  );
}

export function PrototypeBanner() {
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
      Recruitment prototype built for a WhiteMatrix assessment. Not affiliated with or endorsed by the Government of Kerala or the Chief Minister&apos;s Office. Fictional data only.
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-brand-900 py-8 text-sm text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
        <div><div className="font-semibold text-white">CM Grievance Portal</div><p className="mt-1">A demonstration of a grievance redressal workflow. Do not submit real complaints.</p></div>
        <div className="space-y-1"><Link href="/about" className="block hover:underline">About</Link><Link href="/faq" className="block hover:underline">FAQ</Link><Link href="/contact" className="block hover:underline">Contact</Link></div>
        <p>Recruitment prototype. Not an official government website.</p>
      </div>
    </footer>
  );
}
