# Estado — 11/10/2026

## Actual

Fases 1–6 y 8 completadas con las pruebas ejecutables disponibles; documentación y código sincronizados con GitHub. Fase 7: dist y ZIP entregables preparados, publicación externa pendiente. HEAD local y rama main remota contrastados. No afirmar aceptación final en dispositivos reales o SiteGround hasta completar las comprobaciones externas.

## Verificado

Node 24.21.0, npm 11.19.0 y Git disponibles. gh portable en .tools/gh/bin/gh.exe, autenticado por el usuario. Repositorio público https://github.com/hernan-go/match-conjunciones creado y origin configurado.

28 obras con título, autoría y fuente oficial; 6 áreas y 60 preguntas. Roles de prólogo, ilustración y compilación distinguidos cuando la fuente los explicita. Colección no informada conservada como null. Portadas oficiales recuperadas y contrastadas visualmente con título/autoría en assets-private/cover-review.png: 28 originales, 0 otra edición, 0 institucional. SVG suministrado seguro como imagen y conservado sin modificar, incluido en build y fallback probado.

Validación estructural aprobada por cada opción. 13 tests unitarios aprobados (incluyen 700 partidas, perfiles contrastantes en cada área, cuatro autores recomendables y banda Conjunciones). 28 fichas verificadas nuevamente por HTTP con títulos coincidentes; reporte artifacts/source-verification.json.

Chromium: suite completa 13/13 aprobada después de corregir desbordamiento de palabras largas con texto 200%. Incluye 60 preguntas de seis áreas a 320 px/200%, seis anchos normales, navegación, ráfagas, reinicio, teclado, tacto emulado, imágenes y raíz/subcarpeta. Tras mejorar el equilibrio de enfoques en Sorprendeme, pruebas afectadas y auditoría Axe AA adicional 3/3 aprobadas: 14 casos de navegador distintos comprobados. Axe WCAG 2 A/AA y 2.1 A/AA sin violaciones detectadas en inicio, selector, pregunta seleccionada y resultados; no sustituye revisión humana ni dispositivos reales.

Build final: 32 archivos, aproximadamente 657 KiB de ZIP, index.html en raíz, 28 portadas originales y SVG institucional. ZIP descomprimido en memoria y comparado byte por byte con dist; hashes en artifacts/build-report.json. Recursos privados excluidos de Git. Capturas revisadas en artifacts/chromium-quiz-390.png y chromium-results-1440.png, entre otras.

Perfiles editoriales revisados en artifacts/editorial-report.json: educación diferencia didáctica (Educar con coraje), gestión (Directivos...), aprendizaje (Diagnósticos con lápiz) y equipos (Construcción de liderazgos). Vínculos diferencia violencia (Crueldades...), convivencia (Amistad...), pareja (Parejas abiertas) y familia (Terapia Vincular-Familiar). Emociones diferencia expresión (Disparadores), subjetividad (Parejas abiertas), clínica (Psicoterapia de parejas jóvenes) y escucha (Caja de herramientas). Es pertinencia de lectura, no evaluación clínica. Afinidades amplias pueden compartir resultados; no se exige novedad artificial.

Cobertura por área (las obras pueden pertenecer a varias): Salud mental 8, Infancias 10, Educación 8, Vínculos 7, Prevención 5, Emociones 13. Diez preguntas distintas por área, cuatro opciones cada una. El modo libre balancea áreas y enfoques.

## Pendientes

- WebKit instalado pero Windows Control de aplicaciones bloquea sus bibliotecas; no se elude esa protección. Pruebas WebKit pendientes, ejecutables con npm run test:e2e -- --project=webkit en equipo compatible.
- URL SiteGround aún no creada: publicación y comprobación HTTPS pendientes del usuario.
- Dispositivos reales iOS/Android/tablet no disponibles; procedimiento manual en README. Emulación no equivale a pruebas reales.
- Ampliación a 60+ títulos posterior; no es bloqueo del MVP autorizado.

## Rediseño visual definitivo

Intervención visual completada: src/styles.css y src/App.tsx. Paleta siempre clara (#FFFFFF, texto #303030), rojo #E63A2E extraído del SVG; familias Arial/Helvetica y Georgia/Times New Roman conservadas. Encabezado con SVG oficial íntegro y proporciones conservadas. Señalador de resultados mediante pseudo-elemento CSS y clip-path; texto real blanco en cursiva, adaptable a móvil. Selección roja con ✓ y foco visible. Datos, dominio, estado, textos editoriales, enlaces y recursos sin cambios.

Evidencia final: TypeScript y validación aprobados; 13/13 tests unitarios; suite completa Chromium 15/15, más 2/2 repeticiones para capturas de selección y texto ampliado. Incluye seis anchos, orientación, 320 px/200%, navegación y ráfagas, tacto emulado, raíz/subcarpeta, fallback, modo claro con sistema oscuro y Axe WCAG AA sin violaciones detectadas en cuatro pantallas. Capturas de inicio, cuestionario y resultados revisadas; artifacts/results-320-text-200.png y quiz-selected-light.png además de las capturas por ancho. No sustituye pruebas reales ni revisión humana.

SVG fuente/build coincidentes byte por byte. ZIP regenerado: 32 archivos, aproximadamente 657 KiB, index.html en raíz, todas las 28 portadas y SVG; comprobación byte por byte y hashes en build-report.json. REQUIREMENTS y PLAN actualizados con alcance y aceptación visual. Sin dependencias nuevas ni cambios de hosting.

## Próximo paso

Usuario: revisar y aprobar visualmente la vista previa local http://127.0.0.1:4173/. No publicar todavía en SiteGround. Tras aprobación y datos de hosting, seguir README para subir el ZIP y comprobar HTTPS y dispositivos reales.
