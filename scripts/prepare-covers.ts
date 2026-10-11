import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { catalog } from "../src/data/index";

const sha = (buffer: Buffer) =>
  createHash("sha256").update(buffer).digest("hex");
await mkdir("assets-private/originals", { recursive: true });
await mkdir("assets-private/covers", { recursive: true });
const supplied =
  process.env.MATCH_INSTITUTIONAL_SVG || "assets-private/n_portada.svg";
const svg = await readFile(supplied);
if (
  /<script|<foreignObject|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|data:|\/\/)/i.test(
    svg.toString(),
  )
)
  throw new Error("SVG con contenido activo o referencias externas");
await sharp(svg).metadata();
await copyFile(supplied, "assets-private/covers/n_portada.svg");
const report: {
  id: string;
  kind: string;
  file: string;
  sha256: string;
  width?: number;
  height?: number;
}[] = [];
for (const book of catalog.books.filter((b) => b.verified)) {
  if (book.cover.kind === "institucional") {
    if (book.cover.file !== "n_portada.svg" || !book.cover.attempts.length)
      throw new Error(`Alternativas no documentadas: ${book.id}`);
    report.push({
      id: book.id,
      kind: book.cover.kind,
      file: book.cover.file,
      sha256: sha(svg),
    });
    continue;
  }
  if (!book.cover.sourceUrl)
    throw new Error(`Sin fuente auténtica: ${book.id}`);
  const original = `assets-private/originals/${book.id}.img`;
  let buffer: Buffer;
  try {
    buffer = await readFile(original);
  } catch {
    const response = await fetch(book.cover.sourceUrl, {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw new Error(
        `Portada ${book.id}: HTTP ${response.status}; revisar otra edición antes de autorizar institucional`,
      );
    buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer).metadata();
    await writeFile(original, buffer);
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  const image = sharp(buffer);
  const metadata = await image.metadata();
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 100 ||
    metadata.height < 100
  )
    throw new Error(`Imagen inválida: ${book.id}`);
  const output = await image
    .rotate()
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(`assets-private/covers/${book.cover.file}`, output);
  report.push({
    id: book.id,
    kind: book.cover.kind,
    file: book.cover.file,
    sha256: sha(output),
    width: metadata.width,
    height: metadata.height,
  });
  console.log("Imagen preparada:", book.title);
}
await writeFile(
  "assets-private/covers/manifest.json",
  JSON.stringify(report, null, 2),
);
console.log(
  "Recursos:",
  Object.fromEntries(
    ["original", "otra_edicion", "institucional"].map((kind) => [
      kind,
      report.filter((x) => x.kind === kind).length,
    ]),
  ),
);
