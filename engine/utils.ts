const RETRYABLE_STATUSES = new Set([429, 503]);

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 5000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;

      const status = (err as { status?: number })?.status;
      if (!status || !RETRYABLE_STATUSES.has(status)) throw err;
      if (attempt === maxRetries) break;

      const delay = baseDelayMs * Math.pow(2, attempt);
      console.warn(`  [retry ${attempt + 1}/${maxRetries}] status ${status} — waiting ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
