'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletContextProvider } from '@/lib/wallet-context';
import WalletStatus from '@/components/studio/WalletStatus';

function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/studio', label: 'Coins', icon: '◆' },
  ];

  // Extract mint from path if present
  const mintMatch = pathname.match(/^\/studio\/([^/]+)/);
  const mint = mintMatch?.[1];

  if (mint) {
    links.push(
      { href: `/studio/${mint}`, label: 'Dashboard', icon: '▣' },
      { href: `/studio/${mint}/campaigns`, label: 'Campaigns', icon: '⬡' },
    );
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border-subtle bg-surface h-screen sticky top-0 flex flex-col">
      <div className="p-4 border-b border-border-subtle">
        <Link href="/">
          <img src="/logo.png" alt="BagsStudio" className="h-8 w-auto" />
        </Link>
      </div>
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
    </aside>
  );
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <WalletContextProvider>
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-black/80 backdrop-blur-sm">
            <div />
            <WalletStatus />
          </header>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </WalletContextProvider>
  );
}
