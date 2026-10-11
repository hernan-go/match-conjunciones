import { readFile, writeFile, mkdir } from "node:fs/promises";
// Curaduría original basada en descripción, índice y ficha de cada URL. No inferir colecciones.
const entries = [
  [
    "practicas-en-salud-mental",
    ["salud", "emociones"],
    {
      derechos: 3,
      comunidad: 2,
      interdisciplina: 3,
      instituciones: 2,
      subjetividad: 2,
    },
    "Un recorrido por la salud mental, la interdisciplina y las prácticas desde una perspectiva social y de derechos.",
    "La ficha organiza el contenido en campo de salud mental, interdisciplina y gestión e investigación.",
  ],
  [
    "ley-nacional-de-salud-mental-una-brujula-para-la-crisis",
    ["salud"],
    { derechos: 3, comunidad: 3, instituciones: 3, interdisciplina: 2 },
    "Una lectura de la Ley Nacional de Salud Mental y de las experiencias que buscan llevar sus principios a la práctica.",
    "Descripción: derechos, atención en comunidad, abordajes interdisciplinarios y experiencias de implementación.",
  ],
  [
    "abordajes-del-sufrimiento-psicosocial-en-las-infancias-y-adolescencias",
    ["salud", "infancias"],
    {
      derechos: 3,
      comunidad: 3,
      interdisciplina: 3,
      instituciones: 2,
      diversidad: 1,
    },
    "Experiencias y conceptos para pensar el cuidado de infancias y adolescencias desde la integralidad y los derechos.",
    "Índice: protección integral, reforma de atención, salud mental comunitaria y transición a la vida autónoma.",
  ],
  [
    "cuando-la-clinica-desborda-el-consultorio",
    ["salud", "infancias", "emociones"],
    {
      comunidad: 3,
      instituciones: 2,
      interdisciplina: 2,
      juego: 2,
      clinica: 3,
      expresion: 2,
    },
    "Experiencias de atención primaria que conectan el trabajo clínico con escuelas, familias y espacios del barrio.",
    "Índice: redes en APS, juegoteca, talleres de narración y expresión y vínculo afectivo.",
  ],
  [
    "existe-el-autismo-en-la-ninez",
    ["infancias"],
    { diversidad: 3, diagnosticos: 3, juego: 2, cuerpo: 2 },
    "Una mirada de Esteban Levin sobre las experiencias infantiles, el juego y las preguntas que abren los diagnósticos.",
    "Descripción e índice abordan diagnósticos, autismo, imagen del cuerpo y experiencias de juego.",
  ],
  [
    "plasticidad-simbolica",
    ["infancias"],
    { cuerpo: 3, juego: 3, diagnosticos: 2, diversidad: 2 },
    "Explora la relación entre experiencia infantil, cuerpo, representación, escritura y plasticidad simbólica.",
    "Índice: sensibilidad, plasticidad simbólica, representación, diagnóstico y pronóstico.",
  ],
  [
    "autismo-y-acompanamiento-terapeutico",
    ["infancias", "salud"],
    { diversidad: 3, cuerpo: 3, juego: 2, comunidad: 2, derechos: 1 },
    "Una propuesta de acompañamiento que pone atención en la experiencia sensorial, el juego y las redes de sostén.",
    "Índice: experiencia sensorial, juego, familia y comunidad; descripción: ética y derecho.",
  ],
  [
    "en-la-infancia-los-diagnosticos-se-escriben-con-lapiz",
    ["infancias", "educacion"],
    { diagnosticos: 3, diversidad: 3, aprendizaje: 2, didactica: 1 },
    "Reflexiones interdisciplinarias sobre diagnósticos infantiles y posibilidades de inclusión en la clínica y la escuela.",
    "Índice: patologización, diagnósticos e inclusión educativa; descripción: abordaje educacional.",
  ],
  [
    "supervision-en-la-clinica-con-ninas-y-ninos",
    ["infancias", "emociones"],
    { clinica: 3, juego: 3, cuerpo: 2, diversidad: 2, escucha: 2 },
    "Levin y Chávez recorren escenas de supervisión para pensar intervenciones con niñas, niños y sus entornos.",
    "Ficha: dos autores; índice: supervisión de experiencias infantiles, cuerpo, juego y autismo.",
  ],
  [
    "ninas-ninos-y-adolescentes-en-tiempos-de-desamparo-colectivo",
    ["infancias", "salud", "emociones"],
    {
      comunidad: 2,
      instituciones: 2,
      derechos: 2,
      clinica: 2,
      subjetividad: 3,
      escucha: 2,
    },
    "Una reflexión sobre las infancias y adolescencias, el desamparo colectivo y los modos de acompañar su sufrimiento.",
    "Título, descripción e índice: desamparo colectivo, subjetividad y trabajo clínico con infancias.",
  ],
  [
    "amistad-en-las-infancias-la",
    ["infancias", "vinculos"],
    {
      juego: 2,
      cuerpo: 2,
      diversidad: 2,
      familias: 1,
      convivencia: 3,
      escucha: 2,
    },
    "Una exploración de la amistad como experiencia que transforma el juego, el cuerpo y el encuentro con otros.",
    "Descripción: comunidad, amistad, confianza y diferencia; recorrido clínico e interdisciplinario.",
  ],
  [
    "educar-con-coraje",
    ["educacion"],
    { gestion: 3, didactica: 3, aprendizaje: 2, equipos: 2, juego: 1 },
    "Ruth Harf reúne reflexiones sobre la gestión educativa, la didáctica y el lugar del juego en la enseñanza.",
    "Subtítulo y contenido: gestión, didáctica, juego y equipos institucionales.",
  ],
  [
    "gestionar-desde-las-oportunidades",
    ["educacion"],
    { gestion: 3, equipos: 3, aprendizaje: 2, didactica: 1 },
    "Una propuesta para revisar desafíos y oportunidades de mejora en las instituciones educativas.",
    "Ficha: gestión educativa; descripción e índice: mejora institucional y trabajo compartido.",
  ],
  [
    "puentes-de-la-gestion-educativa-los",
    ["educacion"],
    { gestion: 3, equipos: 3, aprendizaje: 2, convivencia: 2 },
    "Comunicación, alianzas y autoevaluación para fortalecer la gestión y la colaboración en las escuelas.",
    "Subtítulo e índice: alianzas, comunicación, autoevaluación y aprendizaje del directivo.",
  ],
  [
    "construccion-de-liderazgos-en-la-gestion-educativa",
    ["educacion"],
    { gestion: 3, equipos: 3, aprendizaje: 2 },
    "Herramientas y reflexiones para el diálogo entre directivos y supervisores y el aprendizaje institucional.",
    "Índice y descripción: supervisión, gestión, equipos y aprendizaje de las instituciones.",
  ],
  [
    "directivos-y-la-organizacion-de-la-vida-cotidiana-los",
    ["educacion"],
    { gestion: 3, equipos: 2, aprendizaje: 2, convivencia: 2 },
    "Una revisión de las rutinas, la autoridad y la cultura institucional para renovar la vida cotidiana de la escuela.",
    "Índice: aprendizaje organizacional, autoridad, situaciones disruptivas, cultura institucional.",
  ],
  [
    "caja-de-herramientas-para-la-educacion-emocional",
    ["educacion", "emociones"],
    {
      didactica: 2,
      aprendizaje: 2,
      equipos: 2,
      expresion: 3,
      escucha: 3,
      subjetividad: 2,
    },
    "Proyectos y experiencias grupales para explorar emociones, empatía y participación en ámbitos educativos.",
    "Índice: emocionalidad y aprendizaje, comunicación con empatía, proyectos y redes sostenedoras.",
  ],
  [
    "violencia-social-violencia-escolar",
    ["vinculos", "educacion", "emociones"],
    {
      violencias: 3,
      convivencia: 3,
      derechos: 2,
      subjetividad: 2,
      instituciones: 1,
    },
    "Silvia Bleichmar vincula violencia social y escolar con la construcción de legalidades, justicia y protección.",
    "Índice: construcción de legalidades, principio educativo, pacto intersubjetivo y subjetividad.",
  ],
  [
    "crueldades-sexuales-contra-infancias-y-adolescencias1",
    ["vinculos", "infancias"],
    { violencias: 3, derechos: 3, escucha: 2, familias: 1 },
    "Recursos y experiencias para pensar el acompañamiento de infancias y adolescencias frente a las violencias sexuales.",
    "Descripción: acompañamiento de víctimas y posiciones éticas; ficha: abuso sexual y ESI.",
  ],
  [
    "parejas-abiertas",
    ["vinculos", "emociones"],
    { parejas: 3, convivencia: 2, subjetividad: 3, expresion: 1 },
    "Una mirada sobre los acuerdos, tensiones y transformaciones de los vínculos sexoafectivos contemporáneos.",
    "Descripción e índice: acuerdos, celos, cambios sociales, subjetividad y configuraciones de pareja.",
  ],
  [
    "psicoterapia-de-parejas-jovenes",
    ["vinculos", "emociones"],
    { parejas: 3, convivencia: 2, clinica: 3, subjetividad: 2, escucha: 1 },
    "Un recorrido clínico por la comunicación, el deseo y las transformaciones de las parejas jóvenes.",
    "Índice: netrelaciones, vínculos en formación, construcción y revisión; intervención clínica.",
  ],
  [
    "terapia-vincular-familiar",
    ["vinculos", "emociones"],
    { familias: 3, convivencia: 3, clinica: 3, expresion: 2, escucha: 2 },
    "Un abordaje de los vínculos familiares que explora emociones, historias de crianza y herramientas terapéuticas.",
    "Índice: empatía, respeto, emociones, trabajo grupal y transgeneracional; descripción de casos.",
  ],
  [
    "autolesiones-y-situaciones-de-suicidioen-adolescentes",
    ["prevencion", "salud"],
    {
      adolescencias: 3,
      redes: 3,
      intervencion: 3,
      instituciones: 3,
      escucha: 2,
    },
    "Una perspectiva clínica ampliada para comprender autolesiones y situaciones de suicidio y trabajar desde las instituciones.",
    "Descripción: intervención institucional antes, durante y después de situaciones; autores Korinfeld y Levy.",
  ],
  [
    "suicidio-en-el-campo-de-las-infancias-y-adolescencias",
    ["prevencion", "emociones"],
    {
      adolescencias: 3,
      intervencion: 3,
      escucha: 2,
      clinica: 3,
      subjetividad: 2,
      redes: 1,
    },
    "Aportes psicoanalíticos e interdisciplinarios para estudiar el sufrimiento y las situaciones de suicidio en las nuevas generaciones.",
    "Índice: apego, valoración vincular, psicodrama y transferencia en clínica adolescente.",
  ],
  [
    "evaluacion-del-riesgo-suicida-y-fortalecimiento-psiquico",
    ["prevencion", "salud"],
    {
      intervencion: 3,
      redes: 3,
      adolescencias: 2,
      instituciones: 2,
      interdisciplina: 2,
    },
    "Presenta el modelo RPI y sus aportes para pensar recursos de cuidado en ámbitos clínicos, educativos y comunitarios.",
    "Subtítulo e índice: RPI, fortalecimiento, pensar en equipo y práctica educativa.",
  ],
  [
    "urgencias-subjetivas-y-psicoanalisis",
    ["prevencion", "emociones"],
    { intervencion: 3, clinica: 3, subjetividad: 3, escucha: 2, redes: 1 },
    "Una reflexión clínica sobre urgencias subjetivas, autolesiones y posibilidades de sostener un porvenir.",
    "Subtítulo: suicidios y autolesiones; índice: tiempo, lazo, mediación y orientación clínica.",
  ],
  [
    "mundos-adolescentes-y-vertigo-civilizatorio",
    ["prevencion", "vinculos", "emociones"],
    {
      adolescencias: 3,
      violencias: 2,
      convivencia: 1,
      subjetividad: 3,
      escucha: 1,
    },
    "Una mirada sobre adolescencias, transformaciones culturales, exclusión y construcción de proyectos de vida.",
    "Índice: adolescencias, conductas de riesgo, violencia, ciudadanía y subjetividad.",
  ],
  [
    "disparadores-emocionales-para-la-clinica",
    ["emociones"],
    { expresion: 3, clinica: 2, subjetividad: 2, escucha: 1 },
    "Relatos, metáforas y actividades que abren preguntas sobre emociones, comunicación y situaciones de cambio.",
    "Índice: relatos y propuestas de actividades; Pavlovsky figura como prologuista, no como autor principal.",
  ],
];
const topicRows = [
  [
    "salud",
    "Salud mental, derechos y comunidad",
    "Salud mental",
    "Instituciones, prácticas y redes para pensar el cuidado colectivo.",
    ["derechos", "comunidad", "interdisciplina", "instituciones"],
  ],
  [
    "infancias",
    "Infancias, juego y diversidad",
    "Infancias",
    "Juego, cuerpo, desarrollo y miradas sobre las diferencias.",
    ["juego", "cuerpo", "diversidad", "diagnosticos"],
  ],
  [
    "educacion",
    "Educación, pedagogía y gestión institucional",
    "Educación",
    "Enseñanza, aprendizaje, didáctica y trabajo en las instituciones.",
    ["didactica", "gestion", "aprendizaje", "equipos"],
  ],
  [
    "vinculos",
    "Violencias, vínculos y convivencia",
    "Vínculos",
    "Relaciones, familias, convivencia y prevención de violencias.",
    ["violencias", "convivencia", "parejas", "familias"],
  ],
  [
    "prevencion",
    "Prevención, autolesiones y adolescencias",
    "Prevención",
    "Lecturas sobre prevención del suicidio, acompañamiento y redes.",
    ["adolescencias", "redes", "intervencion", "escucha"],
  ],
  [
    "emociones",
    "Emociones, subjetividad y herramientas clínicas",
    "Emociones",
    "La expresión, la escucha y los modos de comprender la subjetividad.",
    ["expresion", "subjetividad", "clinica", "escucha"],
  ],
];
const labels = {
  derechos: "salud mental y derechos",
  comunidad: "cuidado comunitario",
  interdisciplina: "trabajo interdisciplinario",
  instituciones: "prácticas institucionales",
  juego: "juego en las infancias",
  cuerpo: "cuerpo y experiencia",
  diversidad: "diversidad en las infancias",
  diagnosticos: "miradas sobre los diagnósticos",
  didactica: "didáctica y enseñanza",
  gestion: "gestión educativa",
  aprendizaje: "aprendizaje",
  equipos: "equipos educativos",
  violencias: "violencias y protección",
  convivencia: "convivencia y lazos",
  parejas: "vínculos de pareja",
  familias: "vínculos familiares",
  adolescencias: "adolescencias",
  redes: "redes de acompañamiento",
  intervencion: "abordajes preventivos",
  escucha: "escucha y acompañamiento",
  expresion: "expresión de emociones",
  subjetividad: "subjetividad",
  clinica: "perspectivas clínicas",
};
const authors = [],
  collections = [];
function authorId(name) {
  let a = authors.find((a) => a.name === name);
  if (!a) {
    a = { id: "a" + (authors.length + 1), name };
    authors.push(a);
  }
  return a.id;
}
const books = [];
for (const [id, topicIds, weights, summary, evidence] of entries) {
  const source = JSON.parse(
    await readFile(`assets-private/research/${id}.json`, "utf8"),
  );
  const names = [...new Set(source.fields["Autor/es"].split(" - "))];
  const contributors = names.map((name) => ({
    authorId: authorId(name),
    role: "autoría según ficha",
  }));
  if (id === "disparadores-emocionales-para-la-clinica")
    contributors.find(
      (c) =>
        authors.find((a) => a.id === c.authorId).name === "Eduardo Pavlovsky",
    ).role = "prólogo";
  if (id === "amistad-en-las-infancias-la")
    contributors.find(
      (c) => authors.find((a) => a.id === c.authorId).name === "Laura T. Jaite",
    ).role = "ilustración";
  if (id === "crueldades-sexuales-contra-infancias-y-adolescencias1")
    for (const c of contributors)
      if (
        ["Octavio Bassó", "Romina De Lorenzo"].includes(
          authors.find((a) => a.id === c.authorId).name,
        )
      )
        c.role = "autoría y coordinación";
  if (id === "suicidio-en-el-campo-de-las-infancias-y-adolescencias")
    contributors.find(
      (c) =>
        authors.find((a) => a.id === c.authorId).name ===
        "Liliana Verónica Moneta",
    ).role = "autoría y compilación";
  if (
    id ===
    "abordajes-del-sufrimiento-psicosocial-en-las-infancias-y-adolescencias"
  )
    contributors.find(
      (c) =>
        authors.find((a) => a.id === c.authorId).name ===
        "Alejandro Michalewicz",
    ).role = "autoría y compilación";
  const authorIds = contributors
    .filter((c) => !["prólogo", "ilustración"].includes(c.role))
    .map((c) => c.authorId);
  const collection = source.fields["Colección"];
  let collectionId = null;
  if (collection) {
    let c = collections.find((c) => c.name === collection);
    if (!c) {
      c = { id: "c" + (collections.length + 1), name: collection };
      collections.push(c);
    }
    collectionId = c.id;
  }
  books.push({
    id,
    workId: id,
    title: source.fields["Título"],
    authorIds,
    contributors,
    collectionId,
    isbn: source.fields.ISBN || null,
    topicIds,
    weights: { ...Object.fromEntries(topicIds.map((t) => [t, 1])), ...weights },
    summary,
    productUrl: source.url,
    verified: true,
    verifiedAt: source.verifiedAt,
    evidence,
    cover: {
      kind: "original",
      file: `${id}.webp`,
      sourceUrl: source.cover,
      editionNote: null,
      reviewed: false,
      attempts: [],
    },
  });
}
const topics = topicRows.map(
  ([id, label, shortLabel, description, facets]) => ({
    id,
    label,
    shortLabel,
    description,
    facets,
    tag: id,
    enabled: true,
  }),
);
const tags = [
  ...topics.map((t) => ({ id: t.id, label: t.shortLabel.toLowerCase() })),
  ...Object.entries(labels).map(([id, label]) => ({ id, label })),
];
const requiredAuthorIds = [
  "Alicia Stolkiner",
  "Esteban Levin",
  "Ruth Harf",
  "Silvia Bleichmar",
].map(authorId);
await mkdir("src/data", { recursive: true });
await writeFile(
  "src/data/catalog.json",
  JSON.stringify(
    { books, topics, tags, authors, collections, requiredAuthorIds },
    null,
    2,
  ) + "\n",
);
console.log(
  `Preparadas ${books.length} obras con fuentes; portadas pendientes de revisión visual.`,
);
