const { cpSync, existsSync, mkdirSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const standaloneRoot = join(root, ".next", "standalone");

if (!existsSync(join(standaloneRoot, "server.js"))) {
  console.error("Standalone build not found. Run `npm run build` first.");
  process.exit(1);
}

function syncDirectory(source, destination) {
  if (!existsSync(source)) return;
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

syncDirectory(join(root, ".next", "static"), join(standaloneRoot, ".next", "static"));
syncDirectory(join(root, "public"), join(standaloneRoot, "public"));
