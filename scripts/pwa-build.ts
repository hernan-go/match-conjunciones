import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

export async function createPwa() {
  await mkdir("dist/icons", { recursive: true });
  const svg = await readFile("dist/covers/n_portada.svg");
  for (const [name, size] of [
    ["icon-192", 192],
    ["icon-512", 512],
    ["apple-touch-icon", 180],
  ] as const) {
    const logo = await sharp(svg)
      .resize(Math.round(size * 0.65), Math.round(size * 0.65), {
        fit: "inside",
      })
      .png()
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: "#ffffff" },
    })
      .composite([{ input: logo, gravity: "centre" }])
      .png()
      .toFile(`dist/icons/${name}.png`);
  }
  const manifest = {
    id: "./",
    name: "Noveduc Rosario",
    short_name: "Noveduc",
    description: "Match Noveduc: descubrí tu próxima lectura.",
    lang: "es-AR",
    start_url: "./",
    scope: "./",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    icons: [192, 512].map((size) => ({
      src: `icons/icon-${size}.png`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any",
    })),
  };
  await writeFile(
    "dist/manifest.webmanifest",
    JSON.stringify(manifest, null, 2),
  );
  const files: string[] = [];
  async function walk(folder = "") {
    for (const entry of await readdir(`dist/${folder}`, {
      withFileTypes: true,
    })) {
      const path = folder + entry.name;
      if (entry.isDirectory()) await walk(path + "/");
      else if (path !== "sw.js") files.push(path);
    }
  }
  await walk();
  files.sort();
  const hash = createHash("sha256").update("match-noveduc-pwa-v1");
  for (const file of files)
    hash.update(file).update(await readFile(`dist/${file}`));
  const revision = hash.digest("hex").slice(0, 20);
  await writeFile(
    "dist/sw.js",
    `/* Generado desde recursos verificados. No editar en hosting. */
const REVISION = ${JSON.stringify(revision)};
const PREFIX = "match-noveduc-" + encodeURIComponent(new URL(self.registration.scope).pathname) + "-";
const CACHE = PREFIX + REVISION;
const FILES = ${JSON.stringify(files)};
const url = (file) => new URL(file, self.registration.scope).href;
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES.map((file) => new Request(url(file), { cache: "reload" })))));
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.registration.scope)) return;
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    if (event.request.mode === "navigate") return (await cache.match(url("index.html"))) || fetch(event.request);
    return (await cache.match(event.request)) || fetch(event.request);
  }));
});
`,
  );
  console.log(
    `PWA: manifiesto, tres íconos oficiales y ${files.length} recursos offline; revisión ${revision}.`,
  );
}
