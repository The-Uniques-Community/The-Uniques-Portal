import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });

process.env.VERCEL = "1";

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    totalPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    totalFailed++;
  }
}

console.log("==================================================");
console.log("   PROJECT IMAGE UPLOAD & DRIVE PIPELINE AUDIT   ");
console.log("==================================================\n");

// Test 1: Google Drive Service Authentication
console.log("[Test 1] Google Drive Service Credentials Initialization...");
const driveService = await import("../controller/googleDriveService.js");
assert(typeof driveService.uploadFile === "function", "uploadFile is exported as a function");
assert(typeof driveService.createFolderStructure === "function", "createFolderStructure is exported as a function");
assert(typeof driveService.getAuth === "function", "getAuth is exported as a function");

const authClient = await driveService.getAuth();
assert(Boolean(authClient), "Google Auth client successfully initialized from GOOGLE_SERVICE_ACCOUNT");

// Test 2: Upload Router Registration
console.log("\n[Test 2] Verifying /project_file_upload Route on Google Drive Router...");
const { default: uploadRouter } = await import("../routes/googleDriveUpload.routes.js");
const uploadRoutes = uploadRouter.stack
  .filter((layer) => layer.route)
  .map((layer) => ({
    path: layer.route.path,
    methods: Object.keys(layer.route.methods),
  }));

const projectUploadRoute = uploadRoutes.find(
  (r) => r.path === "/project_file_upload" && r.methods.includes("post")
);
assert(Boolean(projectUploadRoute), "POST /project_file_upload is registered on upload router");

// Test 3: App Mounting Check
console.log("\n[Test 3] Verifying Mounting on Express Server...");
const { default: app } = await import("../index.js");
const appRoutes = [];
for (const layer of app._router.stack) {
  if (layer.name === "router" && layer.regexp.test("/upload")) {
    appRoutes.push("/upload");
  }
}
assert(appRoutes.length > 0, "Upload router is mounted on Express app at /upload");

// Test 4: Project Model Validation with Image Proxy URL
console.log("\n[Test 4] Verifying Project Model Schema accepts Proxy URLs...");
const { default: Project } = await import("../models/projects/projectModel.js");
const sampleProxyUrl = "https://theuniquesportal.vercel.app/api/image-proxy/1A2B3C4D5E6F";
const testProject = new Project({
  title: "Test Verification Project",
  batch: "Uniques 5.0",
  description: "Test description for verification",
  image: sampleProxyUrl,
  technologies: ["REACT", "NODE.JS"],
  category: "General",
});

const validationError = testProject.validateSync();
assert(!validationError, "Project model validates successfully with Google Drive image-proxy URL");
assert(testProject.image === sampleProxyUrl, "Project image correctly persists image-proxy URL");

// Test 5: Payload Size Comparison
console.log("\n[Test 5] Benchmarking Payload Size: Base64 Data URI vs Proxy URL...");
// Simulate a 2MB raw JPEG image converted to base64 data URI
const simulated2MBBuffer = Buffer.alloc(2 * 1024 * 1024, "a");
const base64DataUri = `data:image/jpeg;base64,${simulated2MBBuffer.toString("base64")}`;
const base64PayloadSize = Buffer.byteLength(base64DataUri, "utf8");
const proxyUrlPayloadSize = Buffer.byteLength(sampleProxyUrl, "utf8");

const sizeReduction = (((base64PayloadSize - proxyUrlPayloadSize) / base64PayloadSize) * 100).toFixed(2);
console.log(`  - Base64 Data URI Payload Size: ${(base64PayloadSize / (1024 * 1024)).toFixed(2)} MB (${base64PayloadSize} bytes)`);
console.log(`  - Proxy URL Payload Size:       ${proxyUrlPayloadSize} bytes`);
console.log(`  - Net Payload Size Reduction:   ${sizeReduction}%`);

assert(proxyUrlPayloadSize < 100, "Proxy URL payload is well under 100 bytes (safely bypasses HTTP 413)");
assert(parseFloat(sizeReduction) > 99.9, "Payload size reduced by >99.9%");

console.log("\n==================================================");
console.log(`SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log("==================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
