import type { Metadata } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}
