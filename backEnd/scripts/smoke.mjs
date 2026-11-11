import fs from "node:fs";
import { pathToFileURL } from "node:url";

const RETRIABLE_STATUSES = new Set([502, 503, 504]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function checkWithRetry(url, expected, options = {}) {
  const {
    fetchImpl = fetch,
    retries = 4,
    delayMs = 10000,
    timeoutMs = 90000,
    onRetry,
  } = options;

  let lastError;
  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });

      if (!response.ok) {
        const err = new Error(`${url} returned HTTP ${response.status}`);
        if (RETRIABLE_STATUSES.has(response.status) && attempt <= retries) {
          lastError = err;
          onRetry?.(attempt, err.message);
          await sleep(delayMs);
          continue;
        }
        throw err;
      }

      const body = await response.text();
      if (!body.includes(expected)) {
        throw new Error(`${url} did not contain the expected response`);
      }

      console.log(`OK ${url}`);
      return body;
    } catch (error) {
      const isRetriable = attempt <= retries && (
        error?.name === "TimeoutError" ||
        error?.name === "AbortError" ||
        error?.name === "TypeError" ||
        RETRIABLE_STATUSES.has(Number(/\bHTTP (502|503|504)\b/.exec(error?.message || "")?.[1]))
      );
      if (isRetriable) {
        lastError = error;
        onRetry?.(attempt, error.message);
        await sleep(delayMs);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

export async function runSmoke(env = process.env, options = {}) {
  const api = (env.BACKEND_URL || "https://innovest-awuh.onrender.com").replace(/\/+$/, "");
  const site = (env.FRONTEND_URL || "https://innovest-site.vercel.app").replace(/\/+$/, "");

  const logRetry = (url) => (attempt, reason) => {
    console.log(`Retrying ${url} after cold-start check #${attempt}: ${reason}`);
  };

  await checkWithRetry(`${api}/health`, '"status":"ok"', { ...options, onRetry: logRetry(`${api}/health`) });
  await checkWithRetry(`${api}/ready`, '"status":"ready"', { ...options, onRetry: logRetry(`${api}/ready`) });
  await checkWithRetry(`${site}/`, "Innovest", { ...options, onRetry: logRetry(`${site}/`) });
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
}

if (isMainModule()) {
  await runSmoke();
}
