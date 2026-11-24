/**
 * Helper to determine the WebSocket / Socket.IO server URL.
 * Works seamlessly across local development, custom subdomains, or behind an Nginx reverse proxy.
 */
export function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    // If NEXT_PUBLIC_API_URL is e.g. "https://courier.amaarapp.com/api", remove trailing "/api"
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://127.0.0.1:4008';
}
