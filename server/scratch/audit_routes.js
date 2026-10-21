import express from "express";
import app from "../index.js";
import fs from "fs";
import path from "path";

function printRoutes() {
  const routes = [];

  function processMiddleware(middleware, basePath = "") {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).map((m) => m.toUpperCase());
      routes.push({
        methods,
        path: (basePath + middleware.route.path).replace(/\/+/g, "/"),
      });
    } else if (middleware.name === "router" && middleware.handle && middleware.handle.stack) {
      let routerPath = "";
      if (middleware.regexp) {
        const source = middleware.regexp.source;
        // Clean regex source to path
        routerPath = source
          .replace("^\\/", "/")
          .replace("\\/?(?=\\/|$)", "")
          .replace("\\/?$", "")
          .replace("(?=\\/|$)", "")
          .replace(/\\\//g, "/")
          .replace(/\^/g, "")
          .replace(/\\\?/g, "");
      }
      middleware.handle.stack.forEach((subLayer) => {
        processMiddleware(subLayer, basePath + routerPath);
      });
    }
  }

  app._router.stack.forEach((layer) => {
    processMiddleware(layer);
  });

  return routes;
}

const allRoutes = printRoutes();
// Deduplicate
const uniqueMap = new Map();
allRoutes.forEach((r) => {
  const key = `${r.methods.join(",")}:${r.path}`;
  uniqueMap.set(key, r);
});

const deduped = Array.from(uniqueMap.values()).sort((a, b) => a.path.localeCompare(b.path));

console.log(`Discovered ${deduped.length} unique backend endpoints.`);
fs.writeFileSync(
  path.resolve("server/scratch/backend_routes.json"),
  JSON.stringify(deduped, null, 2)
);
console.log("Saved to server/scratch/backend_routes.json");
process.exit(0);
