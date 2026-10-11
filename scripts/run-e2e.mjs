import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
const args = process.argv.slice(2);
// Chromium ejecutable localmente. WebKit permanece configurable, sin ocultar su bloqueo de Windows.
if (!args.some((arg) => arg.startsWith("--project")))
  args.push("--project=chromium");
const result = spawnSync(
  process.execPath,
  ["node_modules/@playwright/test/cli.js", "test", ...args],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PLAYWRIGHT_BROWSERS_PATH: resolve(".cache/ms-playwright"),
    },
  },
);
process.exit(result.status ?? 1);
