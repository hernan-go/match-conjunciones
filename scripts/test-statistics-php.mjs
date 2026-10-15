// Prueba de integración aislada: nunca usa el almacenamiento ni la URL de producción.
import { spawn, spawnSync } from "node:child_process";
import {
  mkdir,
  copyFile,
  mkdtemp,
  readFile,
  writeFile,
} from "node:fs/promises";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";

const php = process.env.PHP_BINARY || "php";
if (spawnSync(php, ["--version"]).status !== 0) {
  console.error(
    "PHP no disponible. Integración PHP NO ejecutada; pendiente en entorno con PHP 7.4+.",
  );
  process.exit(1);
}
assert.equal(
  spawnSync(php, ["-l", "server/stats.php"], { stdio: "inherit" }).status,
  0,
);
await mkdir("artifacts", { recursive: true });
const folder = await mkdtemp(resolve("artifacts/php-statistics-"));
const root = join(folder, "public_html");
await mkdir(join(root, "evento"), { recursive: true });
await copyFile("server/stats.php", join(root, "evento/stats.php"));
const child = spawn(php, ["-S", "127.0.0.1:4189", "-t", root], {
  stdio: "ignore",
});
const url = "http://127.0.0.1:4189/evento/stats.php";
const post = (event) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(url)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(ready, "Servidor PHP no disponible");
  assert.deepEqual(await (await fetch(url)).json(), {
    visitors: 0,
    matchComplete: 0,
  });
  const visit = { type: "visit", id: randomUUID() };
  assert.equal((await post({ type: "invalid", id: randomUUID() })).status, 400);
  assert.equal((await post({ ...visit, answers: [] })).status, 400);
  assert.equal((await post({ type: "visit", id: 12 })).status, 400);
  assert.equal((await fetch(url, { method: "POST", body: "{}" })).status, 415);
  assert.equal((await fetch(url, { method: "DELETE" })).status, 405);
  assert.equal(
    (await fetch(url, { headers: { Origin: "https://other.example" } })).status,
    403,
  );
  const responses = await Promise.all(
    Array.from({ length: 20 }, () => post(visit)),
  );
  assert.ok(responses.every((r) => r.ok));
  const complete = { type: "complete", id: randomUUID() };
  await Promise.all(Array.from({ length: 20 }, () => post(complete)));
  const unique = await Promise.all(
    Array.from({ length: 40 }, () =>
      post({ type: "complete", id: randomUUID() }),
    ),
  );
  assert.ok(unique.every((r) => r.ok));
  assert.deepEqual(await (await fetch(url)).json(), {
    visitors: 1,
    matchComplete: 41,
  });
  // Reemplazar endpoint simula otro ZIP: datos privados persisten.
  await copyFile("server/stats.php", join(root, "evento/stats.php"));
  const result = await fetch(url);
  assert.match(result.headers.get("cache-control"), /no-store/);
  assert.deepEqual(await result.json(), { visitors: 1, matchComplete: 41 });
  const privateFile = join(folder, "match-noveduc-private/statistics.json");
  const state = JSON.parse(await readFile(privateFile, "utf8"));
  assert.equal(Object.keys(state.seen).length, 42);
  assert.ok(Object.keys(state.seen).every((key) => /^[a-f0-9]{64}$/.test(key)));
  assert.equal(
    (await fetch("http://127.0.0.1:4189/match-noveduc-private/statistics.json"))
      .status,
    404,
  );
  await writeFile(privateFile, "corrupt");
  assert.equal((await post(visit)).status, 503);
  assert.equal(await readFile(privateFile, "utf8"), "corrupt");
  console.log(
    "PHP aprobado: validación, deduplicación, 80 solicitudes concurrentes, persistencia, privacidad, corrupción y no-store.",
  );
} finally {
  child.kill();
}
