import { mkdir, readFile, writeFile } from "node:fs/promises";
import { load } from "cheerio";

// Investigación acotada y secuencial. Se persisten solo campos editoriales, no HTML comercial.
const slugs = [
  "practicas-en-salud-mental",
  "existe-el-autismo-en-la-ninez",
  "educar-con-coraje",
  "violencia-social-violencia-escolar",
  "ley-nacional-de-salud-mental-una-brujula-para-la-crisis",
  "el-fin-del-manicomio",
  "abordajes-del-sufrimiento-psicosocial-en-las-infancias-y-adolescencias",
  "cuando-la-clinica-desborda-el-consultorio",
  "trabajar-en-instituciones",
  "en-la-infancia-los-diagnosticos-se-escriben-con-lapiz",
  "la-rebeldia-de-la-infancia",
  "el-desarrollo-del-cachorro-humano",
  "autismo-y-acompanamiento-terapeutico",
  "la-amistad-en-las-infancias",
  "plasticidad-simbolica",
  "gestionar-desde-las-oportunidades",
  "puentes-de-la-gestion-educativa-los",
  "construccion-de-liderazgos-en-la-gestion-educativa",
  "directivos-y-la-organizacion-de-la-vida-cotidiana-los",
  "subjetividad-y-aprendizaje",
  "crueldades-sexuales-contra-infancias-y-adolescencias",
  "las-fronteras-inciertas-de-la-agresividad",
  "parejas-abiertas",
  "psicoterapia-de-parejas-jovenes",
  "terapia-vincular-familiar",
  "autolesiones-y-situaciones-de-suicidio-en-adolescentes",
  "suicidio-en-el-campo-de-las-infancias-y-adolescencias",
  "evaluacion-del-riesgo-suicida-y-fortalecimiento-psiquico",
  "urgencias-subjetivas-y-psicoanalisis",
  "mundos-adolescentes-y-vertigo-civilizatorio",
  "disparadores-emocionales-para-la-clinica",
  "caja-de-herramientas-para-la-educacion-emocional",
  "supervision-en-la-clinica-con-ninas-y-ninos",
  "ninas-ninos-y-adolescentes-en-tiempos-de-desamparo-colectivo",
  "escuchar-las-infancias",
  "autolesiones-y-situaciones-de-suicidioen-adolescentes",
  "crueldades-sexuales-contra-infancias-y-adolescencias1",
  "amistad-en-las-infancias-la",
];
await mkdir("assets-private/research", { recursive: true });
const errors = [];
for (const slug of slugs) {
  const file = `assets-private/research/${slug}.json`;
  try {
    await readFile(file);
    continue;
  } catch {}
  const url = `https://www.noveduc.com/productos/${slug}/`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const $ = load(await response.text());
    const fields = {};
    $("li").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      const match = text.match(
        /^(Título|Subtítulo|Autor\/es|Colección|Materias|Editorial|ISBN):\s*(.+)$/,
      );
      if (match) fields[match[1]] = match[2];
    });
    if (!fields["Título"] || !fields["Autor/es"])
      throw new Error("Ficha técnica incompleta");
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
    const alternatives = [
      ...new Set(
        $("img")
          .map((_, el) => $(el).attr("data-src") || $(el).attr("src"))
          .get()
          .filter((x) => x?.includes("/products/"))
          .map((x) =>
            x.replace(/^http:/, "https:").replace(/^\/\//, "https://"),
          ),
      ),
    ];
    const item = {
      slug,
      url: response.url,
      verifiedAt: "2026-10-11",
      fields,
      description: sections["Descripción"] || "",
      contents: sections["Contenido"] || "",
      cover,
      alternatives,
    };
    await writeFile(file, JSON.stringify(item, null, 2));
    console.log(
      slug,
      fields["Título"],
      "|",
      fields["Autor/es"],
      "|",
      fields["Colección"] || "?",
    );
  } catch (error) {
    errors.push({ slug, error: String(error) });
    console.log("PENDIENTE", slug, String(error));
  }
  await new Promise((resolve) => setTimeout(resolve, 550));
}
await writeFile(
  "assets-private/research/errors.json",
  JSON.stringify(errors, null, 2),
);
