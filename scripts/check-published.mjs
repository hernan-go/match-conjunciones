import { writeFile } from "node:fs/promises";
import { load } from "cheerio";
const url = "https://mnicabeatrizp6.sg-host.com/";
const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
if (!r.ok) throw new Error(`Sitio publicado HTTP ${r.status}`);
const $ = load(await r.text());
const resources = [];
for (const path of $('script[src],link[rel="stylesheet"][href]')
  .map((_, el) => $(el).attr("src") || $(el).attr("href"))
  .get()) {
  const target = new URL(path, url);
  const res = await fetch(target, { signal: AbortSignal.timeout(30000) });
  resources.push({ url: target.href, status: res.status });
  if (!res.ok) throw new Error(`Recurso publicado HTTP ${res.status}`);
}
await writeFile(
  "artifacts/published-check.json",
  JSON.stringify(
    {
      url,
      status: r.status,
      title: $("title").text(),
      resources,
      modified: false,
    },
    null,
    2,
  ),
);
console.log(
  "Sitio HTTPS accesible; recursos de raíz disponibles. Sin modificación externa.",
);
