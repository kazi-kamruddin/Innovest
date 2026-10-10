const api = (process.env.BACKEND_URL || "https://innovest-awuh.onrender.com").replace(/\/+$/, "");
const site = (process.env.FRONTEND_URL || "https://innovest-site.vercel.app").replace(/\/+$/, "");

async function check(url, expected) {
  const response = await fetch(url, { signal: AbortSignal.timeout(90000), cache: "no-store" });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const body = await response.text();
  if (!body.includes(expected)) throw new Error(`${url} did not contain the expected response`);
  console.log(`OK ${url}`);
}

await check(`${api}/health`, '"status":"ok"');
await check(`${api}/ready`, '"status":"ready"');
await check(`${site}/`, "Innovest");
