import { readFile, writeFile } from "node:fs/promises";
const catalog = JSON.parse(await readFile("src/data/catalog.json", "utf8"));
const rows = JSON.parse(
  await readFile("src/data/phase2-curation.json", "utf8"),
);
for (const [id, label] of Object.entries({
  consumos: "consumos problemáticos",
  adopciones: "adopciones",
  lenguaje: "lenguaje en las infancias",
  desarrollo: "primeros tiempos del desarrollo",
  digital: "experiencias digitales",
  cuidados: "cuidado de quienes cuidan",
  envejecimiento: "envejecimiento",
  lectura: "lectura y producción de sentidos",
  genero: "perspectivas de género",
}))
  if (!catalog.tags.some((t) => t.id === id)) catalog.tags.push({ id, label });
const authorId = (name) => {
  let a = catalog.authors.find((a) => a.name === name);
  if (!a) {
    a = { id: `a${catalog.authors.length + 1}`, name };
    catalog.authors.push(a);
  }
  return a.id;
};
// Roles explícitos contrastados en índice y portada; no inferidos por orden.
const notes = {
  "acompanamiento-terapeutico": {
    "Brian Banszczyk": "autoría y coordinación",
    "Graciela Bustos": "autoría y coordinación",
    "María Laura Frank": "autoría y coordinación",
    "Karina González": "autoría y coordinación",
  },
  "clinica-de-las-adicciones-mitos-y-prejuicios-acerca-del-consumo-de-sustancias":
    {
      "Laura Gersberg": "autoría y coordinación",
      "Alberto Trimboli": "prólogo",
    },
  "clinica-psicopedagogica-y-alteridad1": {
    "Luisa Wettengel": "autoría y coordinación",
    "Gerardo Prol": "autoría y coordinación",
  },
  "cuidado-de-cuidadores-sindrome-de-burnout": {
    "Eva Giberti": "prólogo",
  },
  "diagnosticos-y-clasificaciones-en-la-infancia": {
    "Gisela Untoiglich": "autoría y coordinación",
    "Juan Vasen": "autoría y coordinación",
    "Silvia Morici": "autoría y coordinación",
  },
  "fragilidad-en-el-envejecimiento": {
    "Graciela Zarebski": "autoría y coordinación",
  },
  "intervenciones-en-primera-infancia": {
    "Marcela Pereira": "autoría y coordinación",
  },
  "juego-historia-de-chicos-el": {
    "Alicia Rozental": "autoría y coordinación",
  },
  "practicas-en-salud-mental-infantojuvenil": {
    "Alejandro Michalewicz": "autoría y coordinación",
  },
  "promesas-incumplidas-de-la-inclusion-las": {
    "Gisela Untoiglich": "autoría y coordinación",
    "Graciela Szyber": "autoría y coordinación",
  },
  "que-hace-un-psicoanalista-en-un-hospital": {
    "Mecedes S. Minnicelli": "prólogo",
  },
  "subjetividad-y-aprendizaje-problematicas-educativas-y-psicoanalisis": {
    "Nora Elichiry": "prólogo",
  },
  "tratamiento-de-los-problemas-en-el-aprendizaje": {
    "Luisa Wettengel": "autoría y coordinación",
    "Gerardo Prol": "autoría y coordinación",
  },
  "fin-del-manicomio-el": {
    "Alberto Trimboli": "autoría y coordinación",
  },
  "ninez-adolescencia-y-genero": {
    "Débora Tajer": "autoría y coordinación",
  },
};
for (const [id, topicIds, weights, summary] of rows) {
  if (catalog.books.some((b) => b.id === id)) continue;
  const source = JSON.parse(
    await readFile(`assets-private/research/${id}.json`, "utf8"),
  );
  if (
    catalog.books.some(
      (b) =>
        b.isbn === source.fields.ISBN || b.title === source.fields["Título"],
    )
  )
    throw new Error(`Obra duplicada ${id}`);
  const contributors = [...new Set(source.fields["Autor/es"].split(" - "))].map(
    (name) => ({
      authorId: authorId(name),
      role: notes[id]?.[name] || "autoría según ficha",
    }),
  );
  let collection = catalog.collections.find(
    (c) => c.name === source.fields.Colección,
  );
  if (!collection && source.fields.Colección) {
    collection = {
      id: `c${catalog.collections.length + 1}`,
      name: source.fields.Colección,
    };
    catalog.collections.push(collection);
  }
  catalog.books.push({
    id,
    workId: id,
    title: source.fields["Título"],
    authorIds: contributors
      .filter((c) => c.role !== "prólogo")
      .map((c) => c.authorId),
    contributors,
    collectionId: collection?.id || null,
    isbn: source.fields.ISBN || null,
    topicIds,
    weights: { ...Object.fromEntries(topicIds.map((t) => [t, 1])), ...weights },
    summary,
    productUrl: source.url,
    verified: true,
    verifiedAt: source.verifiedAt,
    evidence: `Curaduría basada en descripción e índice de la ficha oficial: ${summary} Materias editoriales: ${source.fields.Materias || "no informadas"}.`,
    cover: {
      kind: "original",
      file: `${id}.webp`,
      sourceUrl: source.cover,
      editionNote: null,
      reviewed: false,
      attempts: [
        "Portada recuperada de metadatos de la ficha oficial; revisión visual pendiente.",
      ],
    },
  });
}
await writeFile(
  "src/data/catalog.json",
  JSON.stringify(catalog, null, 2) + "\n",
);
console.log(
  "Catálogo",
  catalog.books.length,
  "obras; imágenes nuevas pendientes de revisión.",
);
