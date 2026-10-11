import { catalog, questions } from "../src/data/index";
import { validateCatalog } from "../src/domain/validate";
const errors = validateCatalog(catalog, questions);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Catálogo válido: ${catalog.books.length} obras, ${catalog.topics.filter((t) => t.enabled).length} temáticas, ${questions.length} preguntas; cobertura comprobada por opción.`,
);
