#!/usr/bin/env node

/**
 * Poll the backend health endpoint before starting the frontend dev server.
 *
 * This prevents "infinite loading" when the UI boots before the backend is ready.
 *
 * Env controls:
 * - REACT_APP_DISABLE_WAIT (default false): bypass waiting entirely
 * - REACT_APP_WAIT_MAX_SECONDS (default 60): total wait time
 * - REACT_APP_WAIT_INTERVAL_MS (default 1500): poll interval
 * - BACKEND_HEALTHCHECK_DISABLED=true: legacy/shared bypass (still respected)
 */

const { URL } = require('url');

function _truthy(value) {
  return (
    String(value || 'false').trim().toLowerCase() === 'true' ||
    String(value || 'false').trim() === '1' ||
    String(value || 'false').trim().toLowerCase() === 'yes'
  );
}

function _healthcheckDisabled() {
  /**
   * Return true if backend health checks are disabled.
   *
   * Supports both the shared backend toggle and CRA-prefixed variants that may be injected by preview env.
   */
  return (
    _truthy(process.env.BACKEND_HEALTHCHECK_DISABLED) ||
    _truthy(process.env.REACT_APP_BACKEND_HEALTHCHECK_DISABLED) ||
    _truthy(process.env.REACT_APP_HEALTHCHECK_DISABLED)
  );
}

function _getNumberEnv(name, defaultValue) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === '') return defaultValue;
  const n = Number(raw);
  return Number.isFinite(n) ? n : defaultValue;
}

// PUBLIC_INTERFACE
async function waitForBackendHealth() {
  /** Wait for backend /health to return HTTP 200, or proceed after timeout (never hard-fails startup). */
  if (_healthcheckDisabled()) {
    console.log('[wait-for-backend] BACKEND_HEALTHCHECK_DISABLED=true; skipping backend health polling.');
    return true;
  }

  if (_truthy(process.env.REACT_APP_DISABLE_WAIT)) {
    console.log('[wait-for-backend] REACT_APP_DISABLE_WAIT=true; skipping backend health polling.');
    return true;
  }

  const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
  // Requirement: fetch `${REACT_APP_API_BASE_URL}/health`
  const healthUrl = new URL('/health', base).toString();

  const maxSeconds = _getNumberEnv('REACT_APP_WAIT_MAX_SECONDS', 60);
  const timeoutMs = Math.max(0, Math.floor(maxSeconds * 1000));
  const intervalMs = Math.max(200, Math.floor(_getNumberEnv('REACT_APP_WAIT_INTERVAL_MS', 1500)));
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

      // Requirement: treat any 200 response as healthy.
      if (res.status === 200) {
        console.log(`[wait-for-backend] Backend is healthy (${healthUrl})`);
        return true;
      }

      console.log(
        `[wait-for-backend] Attempt ${attempt}: backend not ready (HTTP ${res.status}). Retrying in ${intervalMs}ms...`
      );
    } catch (err) {
      console.log(`[wait-for-backend] Attempt ${attempt}: backend not reachable yet. Retrying in ${intervalMs}ms...`);
    }

    // Fixed-interval retries (simple + reliable)
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  // Requirement: proceed to start dev server after timeout (do not exit with non-zero).
  console.warn(
    `[wait-for-backend] WARNING: Timed out after ${timeoutMs}ms (REACT_APP_WAIT_MAX_SECONDS=${maxSeconds}) waiting for backend health at ${healthUrl}. ` +
      'Proceeding to start the frontend anyway; API calls may fail until backend is ready.'
  );
  return false;
}

if (require.main === module) {
  waitForBackendHealth()
    .then(() => process.exit(0))
    .catch(() => process.exit(0)); // never hard-fail startup
}

module.exports = { waitForBackendHealth };
