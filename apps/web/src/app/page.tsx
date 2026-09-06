'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import { Parcel, ParcelSchema, createPlaceholderParcel } from '@courier/shared';

interface HealthData {
  status: string;
  timestamp: string;
  environment: string;
  services: {
    database: {
      status: string;
      healthCheckCount: number;
    };
    redis: {
      status: string;
    };
  };
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testErrorResponse, setTestErrorResponse] = useState<string | null>(null);

  const [sampleParcel] = useState<Parcel>(() => createPlaceholderParcel());
  const schemaValidation = ParcelSchema.safeParse(sampleParcel);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<HealthData>('health');
      setHealth(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null
            ? JSON.stringify(err)
            : 'Failed to connect to API backend'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerTestError = async () => {
    setTestErrorResponse(null);
    try {
      await apiClient('health/test-error');
    } catch (err) {
      setTestErrorResponse(JSON.stringify(err, null, 2));
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="badge badge-primary badge-outline gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider">
          Next.js App Router + Tailwind CSS + DaisyUI
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Courier Platform <span className="text-primary">Frontend</span>
        </h1>
        <p className="text-base-content/70 max-w-xl mx-auto text-sm sm:text-base">
          Connecting Next.js (<code className="text-primary">apps/web</code>) to Express (
          <code className="text-secondary">apps/api</code>) with shared types from{' '}
          <code className="text-accent">@courier/shared</code>.
        </p>
      </div>

      {/* Main Grid: Health & Shared Package */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend API Health Status Card (DaisyUI Card) */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-lg flex items-center gap-2">
                Backend Connection
              </h2>
              {loading ? (
                <span className="loading loading-spinner loading-sm text-primary"></span>
              ) : health?.status === 'ok' ? (
                <span className="badge badge-success gap-1 font-semibold">
                  <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  status: ok
                </span>
              ) : (
                <span className="badge badge-error gap-1 font-semibold">
                  status: {health?.status || 'disconnected'}
                </span>
              )}
            </div>

            <p className="text-xs text-base-content/60">
              Live status fetched via <code className="text-primary">lib/api-client.ts</code> from{' '}
              <code className="bg-base-200 px-1 py-0.5 rounded">GET /health</code>
            </p>

            {error && (
              <div className="alert alert-error text-xs py-2 mt-2">
                <span>{error}</span>
              </div>
            )}

            {health && (
              <div className="mt-4 space-y-3">
                <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-200/50 w-full text-xs">
                  <div className="stat py-2 px-3">
                    <div className="stat-title text-xs">Postgres DB</div>
                    <div className="stat-value text-sm text-success capitalize">
                      {health.services.database.status}
                    </div>
                    <div className="stat-desc text-[10px]">
                      Records: {health.services.database.healthCheckCount}
                    </div>
                  </div>

                  <div className="stat py-2 px-3">
                    <div className="stat-title text-xs">Redis Cache</div>
                    <div className="stat-value text-sm text-success capitalize">
                      {health.services.redis.status}
                    </div>
                    <div className="stat-desc text-[10px]">PONG verified</div>
                  </div>

                  <div className="stat py-2 px-3">
                    <div className="stat-title text-xs">Environment</div>
                    <div className="stat-value text-sm text-primary capitalize">
                      {health.environment}
                    </div>
                    <div className="stat-desc text-[10px]">
                      {new Date(health.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card-actions justify-end mt-4 pt-2 border-t border-base-200">
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="btn btn-primary btn-sm"
              >
                {loading ? 'Refreshing...' : 'Refresh Health Check'}
              </button>
            </div>
          </div>
        </div>

        {/* Shared Package Integration Card (DaisyUI Card) */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-lg">Shared Package</h2>
              <span className="badge badge-accent badge-outline font-semibold">
                @courier/shared
              </span>
            </div>

            <p className="text-xs text-base-content/60">
              Cross-workspace type sharing and Zod schema runtime validation
            </p>

            <div className="mt-2 space-y-2 bg-base-200/50 p-3 rounded-lg text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-base-content/60">Tracking ID:</span>
                <span className="text-primary font-bold">{sampleParcel.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Recipient:</span>
                <span>{sampleParcel.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Status:</span>
                <span className="badge badge-info badge-sm">{sampleParcel.status}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-base-200">
                <span className="text-base-content/60">Zod Validation:</span>
                <span className="badge badge-success badge-sm font-semibold">
                  {schemaValidation.success ? '✓ Validated' : '✗ Invalid'}
                </span>
              </div>
            </div>

            <div className="card-actions justify-end mt-4 pt-2 border-t border-base-200">
              <button
                onClick={triggerTestError}
                className="btn btn-outline btn-secondary btn-sm"
              >
                Test API Error Handling
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Test Output Alert */}
      {testErrorResponse && (
        <div className="card bg-base-100 shadow-lg border border-secondary/30">
          <div className="card-body py-4">
            <h3 className="card-title text-sm text-secondary">
              Backend AppError Response (Unified Error Format):
            </h3>
            <pre className="bg-base-300 p-3 rounded text-xs font-mono overflow-x-auto text-error">
              {testErrorResponse}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
