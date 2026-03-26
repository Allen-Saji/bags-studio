'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletContextProvider } from '@/lib/wallet-context';
import { ThemeProvider } from '@/lib/theme-context';
import WalletStatus from '@/components/studio/WalletStatus';
import AuthStatus from '@/components/studio/AuthStatus';
import ThemeToggle from '@/components/studio/ThemeToggle';

function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    { href: '/studio', label: 'Coins', icon: '◆' },
  ];

  const mintMatch = pathname.match(/^\/studio\/([^/]+)/);
  const mint = mintMatch?.[1];

  if (mint && mint !== 'launch') {
    links.push(
      { href: `/studio/${mint}`, label: 'Dashboard', icon: '▣' },
      { href: `/studio/${mint}/community`, label: 'Community', icon: '💬' },
      { href: `/studio/${mint}/trade`, label: 'Trade', icon: '⇄' },
      { href: `/studio/${mint}/quests`, label: 'Quests', icon: '★' },
      { href: `/studio/${mint}/rewards`, label: 'Rewards', icon: '◎' },
      // { href: `/studio/${mint}/apps`, label: 'Apps', icon: '⊞' }, // removed — placeholder
    );
  }

  // Hide sidebar entirely on studio home
  const isStudioHome = pathname === '/studio';
  if (isStudioHome) return null;

  const navContent = (
    <>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-green/10 text-green'
                  : 'text-gray-400 hover:text-white hover:bg-surface-2'
              }`}
            >
              <span className="text-xs">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border-subtle">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-surface-2 border border-border-subtle text-gray-400 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
        )}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile slide-out sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-border-subtle flex flex-col
        transition-transform duration-300 ease-in-out
        md:hidden
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-border-subtle">
          <Link href="/">
            <img src="/logo.png" alt="BagsStudio" className="h-8 w-auto" />
          </Link>
        </div>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-border-subtle bg-surface h-screen sticky top-0 flex-col">
        <div className="p-4 border-b border-border-subtle">
          <Link href="/">
            <img src="/logo.png" alt="BagsStudio" className="h-8 w-auto" />
          </Link>
        </div>
        {navContent}
      </aside>
    </>
  );
}

function Header() {
  const pathname = usePathname();
  const isStudioHome = pathname === '/studio';
  // Sidebar is hidden on studio home, so show logo in header there
  // On subpages, sidebar has its own logo — only show header logo on mobile (where sidebar is collapsed)

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-border-subtle backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--t-black) 80%, transparent)' }}>
      {isStudioHome ? (
        <Link href="/">
          <img src="/logo.png" alt="BagsStudio" className="h-7 md:h-8 w-auto" />
        </Link>
      ) : (
        <Link href="/" className="ml-10 md:ml-0">
          <img src="/logo.png" alt="BagsStudio" className="h-7 w-auto md:hidden" />
          <div className="hidden md:block" />
        </Link>
      )}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <AuthStatus />
      </div>
    </header>
  );
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
    <WalletContextProvider>
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </WalletContextProvider>
    </ThemeProvider>
  );
}
