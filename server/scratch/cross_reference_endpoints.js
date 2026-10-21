import fs from "fs";
import path from "path";

const backendRoutes = JSON.parse(
  fs.readFileSync(path.resolve("server/scratch/backend_routes.json"), "utf-8")
);
const frontendCalls = JSON.parse(
  fs.readFileSync(path.resolve("server/scratch/frontend_calls.json"), "utf-8")
);

// Normalize express route pattern to regex
// Exclude wildcard routes from API matching
const apiBackendRoutes = backendRoutes.filter(
  (r) => r.path !== "*" && r.path !== "/*" && !r.path.includes("(.*)")
);

function routeToRegex(routePath) {
  // Replace :param with ([^/]+)
  let regexStr = routePath
    .replace(/:[a-zA-Z0-9_]+/g, "([^/]+)")
    .replace(/\//g, "\\/");
  return new RegExp(`^${regexStr}$`, "i");
}

const compiledBackend = apiBackendRoutes.map((r) => ({
  ...r,
  regex: routeToRegex(r.path),
}));

// Group frontend calls by normalized template
function normalizeFrontendEndpoint(ep) {
  // Replace ${...} with :param placeholder
  let cleaned = ep
    .replace(/\$\{([^}]+)\}/g, ":param")
    .replace(/\?.*$/, ""); // strip query params
  return cleaned;
}

const frontendMatched = [];
const frontendUnmatched = [];

frontendCalls.forEach((call) => {
  const norm = normalizeFrontendEndpoint(call.endpoint);
  // Test against backend regexes
  const matching = compiledBackend.filter((b) => {
    // If exact match or regex matches
    if (b.path === norm || b.path === call.endpoint.replace(/\?.*$/, "")) return true;
    const testPath = call.endpoint.replace(/\?.*$/, "").replace(/\$\{([^}]+)\}/g, "testval");
    return b.regex.test(testPath);
  });

  if (matching.length > 0) {
    frontendMatched.push({
      call,
      normalized: norm,
      matchedRoutes: matching.map((m) => `${m.methods.join(",")} ${m.path}`),
    });
  } else {
    frontendUnmatched.push({
      call,
      normalized: norm,
    });
  }
});

// Now check backend routes that are NEVER called from frontend
const calledBackendPaths = new Set();
frontendMatched.forEach((fm) => {
  fm.matchedRoutes.forEach((mr) => calledBackendPaths.add(mr));
});

const backendUncalled = backendRoutes.filter((br) => {
  const key1 = `${br.methods.join(",")} ${br.path}`;
  return !calledBackendPaths.has(key1);
});

console.log("=== AUDIT RESULTS ===");
console.log(`Frontend calls matched to backend: ${frontendMatched.length}`);
console.log(`Frontend calls UNMATCHED (potential broken endpoints): ${frontendUnmatched.length}`);
console.log(`Backend routes UNCALLED from frontend: ${backendUncalled.length}`);

fs.writeFileSync(
  path.resolve("server/scratch/frontend_unmatched.json"),
  JSON.stringify(frontendUnmatched, null, 2)
);
fs.writeFileSync(
  path.resolve("server/scratch/backend_uncalled.json"),
  JSON.stringify(backendUncalled, null, 2)
);
fs.writeFileSync(
  path.resolve("server/scratch/frontend_matched.json"),
  JSON.stringify(frontendMatched, null, 2)
);
