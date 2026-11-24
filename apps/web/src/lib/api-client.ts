const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    // In browser, default to relative '/api' which works seamlessly with Nginx reverse proxy
    return '/api';
  }
  return process.env.INTERNAL_API_URL || 'http://127.0.0.1:4008';
};

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  let url = `${baseUrl}/${cleanEndpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      url += `?${qs}`;
    }
  }

  const { headers, ...restOptions } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Automatically attach auth token from localStorage if available in browser
  if (typeof window !== 'undefined' && !(headers as Record<string, string>)?.Authorization) {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: response.statusText };
    }
    throw new ApiError(
      `API request failed with status ${response.status}`,
      response.status,
      errorBody
    );
  }

  return response.json();
}
