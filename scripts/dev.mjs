import { spawn } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await import("./prepare-site.mjs");

const astro = spawn(
  process.execPath,
  [path.join(root, "node_modules", "astro", "bin", "astro.mjs"), "dev"],
  {
    cwd: root,
    stdio: "inherit",
  },
);

let debounceTimer;
let prepareProcess;
let queuedPreparation = false;

function prepareAfterChange() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (prepareProcess) {
      queuedPreparation = true;
      return;
    }

    prepareProcess = spawn(
      process.execPath,
      [path.join(root, "scripts", "prepare-site.mjs")],
      { cwd: root, stdio: "inherit" },
    );
    prepareProcess.on("exit", (code) => {
      prepareProcess = undefined;
      if (code !== 0) console.error(`Site preparation failed with exit code ${code}`);
      if (queuedPreparation) {
        queuedPreparation = false;
        prepareAfterChange();
      }
    });
  }, 250);
}

const watchers = ["_posts", "src", "css"].map((directory) =>
  watch(path.join(root, directory), { recursive: true }, prepareAfterChange),
);
watchers.push(watch(path.join(root, "_headers"), prepareAfterChange));

astro.on("exit", (code) => {
  clearTimeout(debounceTimer);
  for (const watcher of watchers) watcher.close();
  process.exitCode = code ?? 0;
});

process.on("SIGINT", () => astro.kill("SIGINT"));
