import { mkdir, writeFile } from "node:fs/promises";
import { load } from "cheerio";
import { catalog } from "../src/data/index";
const result = [];
for (const book of catalog.books) {
  const response = await fetch(book.productUrl, {
    signal: AbortSignal.timeout(30000),
  });
  const $ = load(await response.text());
  const fields: Record<string, string> = {};
  $("li").each((_, el) => {
    const match = $(el)
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .match(/^(Título|Autor\/es|Colección|ISBN):\s*(.+)$/);
    if (match) fields[match[1]] = match[2];
  });
  const title = $("li")
    .map((_, e) => $(e).text().replace(/\s+/g, " ").trim())
    .get()
    .find((t) => t.startsWith("Título:"))
    ?.slice(7)
    .trim();
  if (!response.ok || title !== book.title)
    throw new Error(
      `Ficha no coincide ${book.id}: ${response.status}/${title}`,
    );
  const names = new Set((fields["Autor/es"] || "").split(" - "));
  const expected = book.contributors.map(
    (c) => catalog.authors.find((a) => a.id === c.authorId)!.name,
  );
  if (
    !expected.every((name) => names.has(name)) ||
    expected.length !== names.size
  )
    throw new Error(`Autoría no coincide ${book.id}`);
  const collection = catalog.collections.find(
    (c) => c.id === book.collectionId,
  )?.name;
  if (
    (fields.Colección || null) !== (collection || null) ||
    (fields.ISBN || null) !== book.isbn
  )
    throw new Error(`Colección/ISBN no coincide ${book.id}`);
  result.push({
    id: book.id,
    url: book.productUrl,
    status: response.status,
    titleVerified: true,
    authorsVerified: true,
    collectionVerified: true,
    isbnVerified: true,
  });
  await new Promise((resolve) => setTimeout(resolve, 400));
}
await mkdir("artifacts", { recursive: true });
await writeFile(
  "artifacts/source-verification.json",
  JSON.stringify(result, null, 2),
);
console.log(`Verificadas ${result.length} fichas oficiales.`);
