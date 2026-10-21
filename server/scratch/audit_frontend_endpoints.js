import fs from "fs";
import path from "path";

const srcDir = path.resolve("src");
const calls = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Regexes for apiClient, axios, fetch, BASE_URL
  const patterns = [
    // apiClient.get('/api/...')
    /(?:apiClient|axios)\s*\.\s*(get|post|put|patch|delete)\s*\(\s*[`"']([^`"']+)`?['"]/gi,
    // fetch(`${BASE_URL}/api/...`) or fetch('/api/...')
    /fetch\s*\(\s*(?:`\$\{BASE_URL\})?([/`"'][^,`"'\)\s]+)/gi,
    // axios.get(`${BASE_URL}/api/...`)
    /(?:apiClient|axios)\s*\.\s*(get|post|put|patch|delete)\s*\(\s*`\$\{BASE_URL\}([^`]+)`/gi,
  ];

  lines.forEach((line, idx) => {
    // Check line for endpoints
    const lineNum = idx + 1;
    const relPath = path.relative(process.cwd(), filePath);

    // Look for string patterns like /api/..., /auth/..., /upload/...
    const endpointMatches = line.matchAll(/(\/(?:api|auth|upload)[a-zA-Z0-9_\-\/${}:]*)/g);
    for (const m of endpointMatches) {
      let ep = m[1];
      // Clean trailing punctuation or template literals
      ep = ep.replace(/[`"'\\)\];,]+$/, "");
      if (ep.length > 4 && !ep.endsWith("/...")) {
        calls.push({
          endpoint: ep,
          file: relPath,
          line: lineNum,
          rawLine: line.trim(),
        });
      }
    }
  });
}

scanDir(srcDir);

// Deduplicate calls by endpoint and file
const uniqueCalls = [];
const seen = new Set();
for (const c of calls) {
  const key = `${c.endpoint}@@${c.file}@@${c.line}`;
  if (!seen.has(key)) {
    seen.add(key);
    uniqueCalls.push(c);
  }
}

console.log(`Found ${uniqueCalls.length} API endpoint references in frontend.`);
fs.writeFileSync(
  path.resolve("server/scratch/frontend_calls.json"),
  JSON.stringify(uniqueCalls, null, 2)
);

// Group by endpoint pattern
const byEndpoint = {};
uniqueCalls.forEach((c) => {
  byEndpoint[c.endpoint] = byEndpoint[c.endpoint] || [];
  byEndpoint[c.endpoint].push(`${c.file}:${c.line}`);
});

fs.writeFileSync(
  path.resolve("server/scratch/frontend_endpoints_summary.json"),
  JSON.stringify(byEndpoint, null, 2)
);
console.log(`Found ${Object.keys(byEndpoint).length} distinct endpoint strings.`);
