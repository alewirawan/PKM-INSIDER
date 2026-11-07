/**
 * Shared HTTP client for backend-backed CMS repositories.
 * Requests include the HttpOnly admin session cookie when the browser has one.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function hasBackendApi() {
  return Boolean(API_BASE_URL);
}

export async function requestApi<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  if (!API_BASE_URL)
    throw new ApiError(0, "NEXT_PUBLIC_API_BASE_URL belum dikonfigurasi.");
  const requestBase = typeof window === "undefined"
    ? process.env.API_BASE_URL?.replace(/\/$/, "") || API_BASE_URL
    : API_BASE_URL;
  const { timeoutMs = 12_000, ...requestInit } = init;
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers(requestInit.headers);
  headers.set("Accept", "application/json");
  if (
    requestInit.body &&
    !(requestInit.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(
      `${requestBase}${path.startsWith("/") ? path : `/${path}`}`,
      {
        ...requestInit,
        headers,
        signal: requestInit.signal ?? controller.signal,
        credentials: "include",
      },
    );
    const requestId = response.headers.get("x-request-id") ?? undefined;
    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      const body = contentType.includes("application/json")
        ? ((await response.json().catch(() => null)) as {
            message?: string;
          } | null)
        : null;
      throw new ApiError(
        response.status,
        body?.message ?? `Backend merespons ${response.status}.`,
        requestId,
      );
    }
    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new ApiError(
        response.status,
        "Backend tidak mengembalikan JSON yang valid.",
        requestId,
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(0, "Permintaan ke backend melewati batas waktu.");
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
