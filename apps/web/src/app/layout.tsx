import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ParcelPilot Courier Platform',
  description: 'Next.js frontend powered by shared TypeScript monorepo packages.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
