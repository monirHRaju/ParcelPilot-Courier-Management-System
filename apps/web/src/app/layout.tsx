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
            <span className="badge badge-outline badge-sm hidden sm:inline-flex">
              Courier Platform
            </span>
          </div>
          <div className="flex-none gap-3 items-center">
            <div className="badge badge-neutral text-xs">Module 6: Notifications</div>
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
