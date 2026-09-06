'use client';

import { useState } from 'react';
import { Parcel, ParcelSchema, createPlaceholderParcel } from '@courier/shared';

export default function Home() {
  const [parcel] = useState<Parcel>(() => createPlaceholderParcel());
  const validation = ParcelSchema.safeParse(parcel);

  return (
    <main className="container">
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
          npm Workspaces Monorepo
        </span>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          <span className="gradient-text">ParcelPilot</span> Courier Platform
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Next.js Frontend (<code style={{ color: '#00f2fe' }}>apps/web</code>) importing shared Zod schemas & types from{' '}
          <code style={{ color: '#e100ff' }}>@courier/shared</code>
        </p>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Monorepo Status Card */}
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Package Link Status</h2>
            <span className="badge badge-success">
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></span>
              Connected
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shared Package:</span>
              <strong>@courier/shared</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Zod Schema Validated:</span>
              <span style={{ color: validation.success ? '#34d399' : '#f87171', fontWeight: 600 }}>
                {validation.success ? '✓ Validated' : '✗ Failed'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Workspace Resolution:</span>
              <span style={{ color: '#38bdf8' }}>Native Workspace Link</span>
            </div>
          </div>
        </section>

        {/* Parcel Data Card */}
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Shared Type Preview</h2>
            <span className="badge badge-cyan">{parcel.status}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>TRACKING NUMBER</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-cyan)' }}>
                {parcel.trackingNumber}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>RECIPIENT</div>
              <div style={{ fontWeight: 600 }}>{parcel.recipient}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>DESTINATION</div>
              <div>{parcel.destinationAddress}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>WEIGHT</div>
              <div>{parcel.weightKg} kg</div>
            </div>
          </div>
        </section>
      </div>

      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Courier Platform Monorepo Architecture • Express + Next.js + TypeScript Workspace
      </footer>
    </main>
  );
}
