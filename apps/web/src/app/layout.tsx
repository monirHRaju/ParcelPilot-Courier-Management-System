import type { Metadata } from 'next';
import './globals.css';
import { NotificationBell } from './NotificationBell';

export const metadata: Metadata = {
  title: 'ParcelPilot - Courier & Logistics Platform',
  description: 'Enterprise courier and logistics management platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen flex flex-col bg-base-300 text-base-content antialiased">
        {/* Placeholder Header */}
        <header className="navbar bg-base-100 shadow-md px-4 sm:px-8 border-b border-base-200">
          <div className="flex-1 items-center gap-2">
            <a href="/" className="text-xl font-black tracking-tight text-primary flex items-center gap-2">
              <span className="badge badge-primary badge-sm font-bold">PP</span>
              ParcelPilot
            </a>
            <div className="hidden md:flex ml-6 gap-4 text-sm font-medium">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <a href="/track" className="hover:text-primary transition-colors">Track</a>
              <a href="/pricing" className="hover:text-primary transition-colors">Pricing</a>
            </div>
          </div>
          <div className="flex-none gap-3 items-center">
            <a href="/login" className="btn btn-sm btn-ghost">Login</a>
            {/* Notification bell — only rendered client-side when user is logged in */}
            <NotificationBell />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow">{children}</main>

        {/* Placeholder Footer */}
        <footer className="footer footer-center p-6 bg-base-100 text-base-content border-t border-base-200">
          <aside>
            <p className="text-xs text-base-content/70">
              ParcelPilot Courier &amp; Logistics Platform © 2026 — Monorepo Architecture
            </p>
          </aside>
        </footer>
      </body>
    </html>
  );
}
