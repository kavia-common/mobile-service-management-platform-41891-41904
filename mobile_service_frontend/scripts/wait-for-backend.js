#!/usr/bin/env node

/**
 * Poll the backend health endpoint before starting the frontend dev server.
 *
 * This prevents "infinite loading" when the UI boots before the backend is ready.
 */

const { URL } = require('url');

// PUBLIC_INTERFACE
async function waitForBackendHealth() {
  /** Wait for backend /health to return HTTP 200, or timeout with a warning. */
  const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
  const healthUrl = new URL('/health', base).toString();

  const timeoutMs = Number(process.env.WAIT_FOR_BACKEND_TIMEOUT_MS || 60000);
  const intervalMs = Number(process.env.WAIT_FOR_BACKEND_INTERVAL_MS || 2000);
  const startedAt = Date.now();

  // Node 18+ has global fetch; CRA tooling typically runs on Node 18+ in CI.
  if (typeof fetch !== 'function') {
    console.warn('[wait-for-backend] Global fetch is not available; skipping health wait.');
    return true;
  }

  let attempt = 0;
  while (Date.now() - startedAt < timeoutMs) {
    attempt += 1;
    try {
      const res = await fetch(healthUrl, { method: 'GET' });
      if (res.ok) {
        console.log(`[wait-for-backend] Backend is healthy (${healthUrl})`);
        return true;
      }
      console.log(`[wait-for-backend] Attempt ${attempt}: backend not ready (HTTP ${res.status}). Retrying...`);
    } catch (err) {
      console.log(`[wait-for-backend] Attempt ${attempt}: backend not reachable yet. Retrying...`);
    }
    // Fixed-interval retries (simple + reliable)
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  console.warn(
    `[wait-for-backend] Timed out after ${timeoutMs}ms waiting for backend health at ${healthUrl}. ` +
      'Starting frontend anyway; API calls may fail until backend is ready.'
  );
  return false;
}

if (require.main === module) {
  waitForBackendHealth()
    .then(() => process.exit(0))
    .catch(() => process.exit(0)); // never hard-fail startup
}

module.exports = { waitForBackendHealth };
