import { mkdir, writeFile, readFile } from "node:fs/promises";
import { load } from "cheerio";
// Solo persistir ficha, descripción e índice editorial; excluir campos comerciales.
await mkdir("assets-private/research", { recursive: true });
const urls = new Set();
for (let page = 1; page <= 7; page++) {
  const url = `https://www.noveduc.com/colecciones/conjunciones/?page=${page}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`Colección HTTP ${r.status}`);
  const $ = load(await r.text());
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href?.includes("/productos/"))
      urls.add(new URL(href, url).href.split("?")[0]);
  });
  console.log("Página", page, "fichas descubiertas", urls.size);
}
await writeFile(
  "assets-private/research/phase2-discovery.json",
  JSON.stringify([...urls], null, 2),
);
for (const url of urls) {
  const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1);
  const file = `assets-private/research/${slug}.json`;
  try {
    await readFile(file);
    continue;
  } catch {}
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const $ = load(await r.text());
    const fields = {};
    $("li").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      const m = text.match(
        /^(Título|Subtítulo|Autor\/es|Colección|Materias|Editorial|ISBN):\s*(.+)$/,
      );
      if (m) fields[m[1]] = m[2];
    });
    if (!fields["Título"] || !fields["Autor/es"])
      throw new Error("Ficha incompleta");
    const sections = {};
    $(".tab").each((_, el) => {
      const title = $(el).find(".tab-label").text().trim();
      if (/^(Descripción|Contenido)$/.test(title))
        sections[title] = $(el)
          .find(".tab-content")
          .text()
          .replace(/\s+/g, " ")
          .trim();
    });
    const cover = (
      $('meta[property="og:image:secure_url"]').attr("content") ||
      $('meta[property="og:image"]').attr("content") ||
      ""
    ).replace(/^http:/, "https:");
    await writeFile(
      file,
      JSON.stringify(
        {
          slug,
          url: r.url,
          verifiedAt: "2026-10-11",
          fields,
          description: sections.Descripción || "",
          contents: sections.Contenido || "",
          cover,
        },
        null,
        2,
      ),
    );
    console.log("Verificada", fields["Título"]);
  } catch (e) {
    console.log("PENDIENTE", slug, String(e));
  }
  await new Promise((r) => setTimeout(r, 350));
}
