import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  copyFile,
  stat,
} from "node:fs/promises";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
import { zipSync, unzipSync } from "fflate";
import sharp from "sharp";
import { catalog } from "../src/data/index";
import { createPwa } from "./pwa-build";

await mkdir("dist/covers", { recursive: true });
for (const file of new Set([
  "n_portada.svg",
  ...catalog.books.map((b) => b.cover.file),
])) {
  const source = `assets-private/covers/${file}`;
  await sharp(await readFile(source)).metadata();
  await copyFile(source, `dist/covers/${file}`);
}
await mkdir("dist/ui", { recursive: true });
for (const file of ["book1.svg", "book2.svg"]) {
  const bytes = await readFile(`assets-private/ui/${file}`);
  await sharp(bytes).metadata();
  await copyFile(`assets-private/ui/${file}`, `dist/ui/${file}`);
}
await createPwa();
const contents: Record<string, Uint8Array> = {};
async function walk(path: string) {
  for (const entry of await readdir(path)) {
    const file = join(path, entry);
    if ((await stat(file)).isDirectory()) await walk(file);
    else
      contents[relative("dist", file).replaceAll("\\", "/")] = new Uint8Array(
        await readFile(file),
      );
  }
}
await walk("dist");
if (!contents["index.html"]) throw new Error("Build sin index.html en raíz");
const zip = zipSync(contents, { level: 6 });
const unpacked = unzipSync(zip);
if (Object.keys(contents).length !== Object.keys(unpacked).length)
  throw new Error("ZIP incompleto");
for (const [name, bytes] of Object.entries(contents))
  if (!Buffer.from(bytes).equals(Buffer.from(unpacked[name])))
    throw new Error(`ZIP distinto: ${name}`);
await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/match-conjunciones-siteground.zip", zip);
const report = {
  books: catalog.books.length,
  topics: catalog.topics.filter((t) => t.enabled).length,
  coverKinds: Object.fromEntries(
    ["original", "otra_edicion", "institucional"].map((kind) => [
      kind,
      catalog.books.filter((b) => b.cover.kind === kind).length,
    ]),
  ),
  files: Object.entries(contents).map(([path, bytes]) => ({
    path,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  })),
  zipBytes: zip.length,
  verifiedZip: true,
};
await writeFile("artifacts/build-report.json", JSON.stringify(report, null, 2));
console.log(
  `ZIP verificado: ${Object.keys(contents).length} archivos, ${(zip.length / 1024).toFixed(0)} KiB; index.html en raíz.`,
);
