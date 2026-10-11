# Plan aprobado y dependencias

1. Preparar herramientas, documentación, exclusiones, Git y GitHub.
2. Verificar piloto de fichas, cuatro autores y recuperación de imágenes; integrar SVG institucional privado.
3. Ampliar catálogo y seis áreas; preguntas con etiquetas verificadas y cobertura por opción.
4. Motor puro: afinidad normalizada, Conjunciones entre scores comparables, diversidad, empates estables y selección balanceada; tests.
5. Estado con respuestas reemplazables y navegación protegida; UI mobile-first informativa.
6. Validación editorial/estructural, tests funcionales, responsive, imágenes y enlaces; resolver defectos.
7. Build, verificación raíz/subcarpeta y ZIP íntegro. Instrucciones SiteGround; publicación externa pendiente.
8. Documentar evidencia, commits y sincronización; informar pendientes reales.

## Arquitectura
src/data: contenido tipado/JSON. src/domain: tipos, validación, selección y ranking sin React. src/state: reducer de partida. src/components y App: UI sin catálogo hardcoded. scripts: extracción editorial acotada, imágenes, validación y empaquetado. assets-private: caché de fuentes y recursos ignorados. dist y artifacts ignorados.

## Garantía
Pesos no negativos; cada opción de cada pregunta habilitada debe alcanzar tres obras distintas dentro del filtro. Ranking nunca elimina coincidencias positivas necesarias para el mínimo. Comprobar relevancia y cambios de resultados con perfiles editoriales; no confundir positividad con afinidad intensa. Preferencia Conjunciones máxima propuesta 0.05 puntos en escala 0–1 y solo dentro de banda comparable. No sumar bonos a scores nulos.

## Imágenes reproducibles
Manifiesto versionado con URLs públicas, tipo, evidencia y nombre. Caché original privada, transformaciones fijadas por lockfile, copia a dist/covers. SVG privado aportado por usuario, ruta configurable para reconstrucción. Todas las imágenes decodificables y presentes; conteo por tipo y hashes de publicación. Sin descargas durante juego. Recursos privados no se publican en GitHub.
