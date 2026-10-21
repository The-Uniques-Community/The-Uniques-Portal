const fs = require('fs');
const path = require('path');

const backendRoutes = require('./backend_routes.json');
const frontendCalls = require('./frontend_calls.json');

const realFrontendCalls = frontendCalls.filter(c => {
  if (!c || !c.endpoint) return false;
  if (c.rawLine.startsWith('import ') || c.rawLine.startsWith('export ')) return false;
  if (c.endpoint.includes('/uploads/') || c.endpoint.includes('portraits')) return false;
  if (!c.endpoint.startsWith('/api') && !c.endpoint.startsWith('/auth') && !c.endpoint.startsWith('/upload')) return false;
  return true;
});

const byEndpoint = {};
realFrontendCalls.forEach(c => {
  let normalized = c.endpoint.replace(/\$\{[^}]+\}/g, ':param');
  normalized = normalized.split('?')[0].replace(/['"`]/g, '').trim();
  if (!byEndpoint[normalized]) {
    byEndpoint[normalized] = [];
  }
  byEndpoint[normalized].push(c);
});

const unmatched = [];
const matched = [];

Object.entries(byEndpoint).forEach(([ep, calls]) => {
  const matchingRoutes = backendRoutes.filter(br => {
    let p = br.path;
    if (p.includes('*')) p = p.replace(/\*/g, '.*');
    const brPattern = p.replace(/:[a-zA-Z0-9_]+/g, '[^/]+');
    try {
      const regex = new RegExp('^' + brPattern + '$');
      const testEp = ep.replace(/:param/g, '65e9d9b4b0a1d4001c8e1234');
      return regex.test(testEp);
    } catch (e) {
      return false;
    }
  });

  if (matchingRoutes.length > 0) {
    matched.push({ pattern: ep, count: calls.length, methods: matchingRoutes.map(r => r.method) });
  } else {
    unmatched.push({ pattern: ep, count: calls.length, sample: calls[0] });
  }
});

console.log('Total real calls:', realFrontendCalls.length);
console.log('Distinct patterns:', Object.keys(byEndpoint).length);
console.log('Matched patterns:', matched.length);
console.log('Unmatched patterns:', unmatched.length);

console.log('\n--- UNMATCHED PATTERNS ---');
unmatched.forEach(u => {
  console.log(`[${u.count} calls] Pattern: ${u.pattern}`);
  console.log(`   Sample: ${u.sample.file}:${u.sample.line} -> ${u.sample.rawLine.trim()}`);
});

fs.writeFileSync(
  path.join(__dirname, 'exact_unmatched.json'),
  JSON.stringify(unmatched, null, 2)
);
fs.writeFileSync(
  path.join(__dirname, 'exact_matched.json'),
  JSON.stringify(matched, null, 2)
);
