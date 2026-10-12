# Match Noveduc

Aplicación web interactiva para descubrir libros de Editorial Noveduc mediante un cuestionario de afinidades e intereses.

Aplicación estática mobile-first. Requisitos: docs/REQUIREMENTS.md; implementación: docs/PLAN.md; evidencia y pendientes: docs/STATUS.md.

## Desarrollo y validación

Node 24 y npm 11 utilizados; Node >=22.12 recomendado. Node se necesita localmente, no en SiteGround.

```powershell
npm ci
npm run dev
npm run check
npm run validate
npm test
```

El catálogo de Fase 2 tiene 80 obras con fichas verificadas, seis temáticas y 84 preguntas (60 originales y 24 adicionales). Los JSON/datos de src/data se editan separados de la UI. Validar después de cambiar contenido. Estado y evidencia: docs/STATUS.md.

## Recursos privados y build reproducible

Los recursos editoriales y el SVG institucional no se redistribuyen en este repositorio. El ZIP de publicación sí incluye todos los recursos, para el uso autorizado en el stand.

1. Colocar el SVG suministrado por el equipo en `assets-private/n_portada.svg`. También puede indicarse su ruta mediante `MATCH_INSTITUTIONAL_SVG`.
   Para los íconos de modalidades, colocar también los originales suministrados `book1.svg` y `book2.svg` en `assets-private/ui/`, sin modificar sus trazados ni proporciones. El empaquetador los copia íntegros a `dist/ui/` antes de generar el precache; no forman parte del repositorio público. El build informa error si faltan.
2. Ejecutar `npm run covers` con conexión: recupera las fuentes oficiales registradas en `src/data/catalog.json`, guarda originales privados y genera WebP de hasta 400 px, calidad 82, sin ampliar. Las siguientes ejecuciones usan caché local.
3. Ejecutar `npm run build`. Valida tipos y contenido, prepara imágenes, compila, copia recursos, comprueba la integridad del ZIP y escribe el informe.

No sustituir automáticamente una URL caída por una imagen distinta: investigar la ficha, comprobar otra edición y actualizar el manifiesto después de revisión. Para el recurso institucional registrar `kind: institucional`, `file: n_portada.svg`, `sourceUrl: null` y los intentos agotados en `cover.attempts`. Para otra edición registrar `editionNote` y su fuente; la interfaz muestra la aclaración.

Reemplazar imágenes mediante los datos y la caché privada, sin tocar componentes o algoritmo. Eliminar únicamente el original concreto de caché cuando cambie su fuente y volver a preparar. `scripts/research-catalog.mjs` permite renovar investigación editorial acotada; `scripts/create-editorial-data.mjs` es la curaduría inicial, no un paso de build (regenera campos de revisión pendientes). No publicar las carpetas privadas.

Salidas:

- `dist/`: aplicación estática completa.
- `artifacts/match-conjunciones-siteground.zip`: index.html en raíz, sin carpeta dist adicional.
- `artifacts/build-report.json`: archivos, tamaños, hashes y conteo de portadas.

## Pruebas de navegador

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD\.cache\ms-playwright"
npx playwright install chromium webkit
npm run test:e2e
```

Las pruebas usan el build, no el servidor de desarrollo. El comando predeterminado ejecuta Chromium: seis anchos, navegación, texto 200%, orientación, tacto emulado, reinicio, fallback institucional y recursos desde `/evento/`. Para WebKit: `npm run test:e2e -- --project=webkit`. En este equipo Windows bloquea bibliotecas descargadas de WebKit mediante Control de aplicaciones; sus pruebas quedan pendientes y no se desactiva ese control. WebKit de escritorio y emulación no equivalen a pruebas en dispositivos reales.

Incluye auditoría Axe de accesibilidad y contraste WCAG A/AA en las tres pantallas y el selector. `npx tsx scripts/editorial-report.ts` genera perfiles de lectura contrastantes para revisar pertinencia; `artifacts/editorial-report.json` es un informe interno sin exposición de puntajes al visitante.

`npm run verify:sources` comprueba por red los enlaces y títulos oficiales y guarda el informe privado en artifacts. Las fuentes pueden cambiar; revisar discrepancias antes de actualizar el catálogo.

## Publicación manual en SiteGround

1. Crear/seleccionar el sitio temporal en SiteGround y abrir Site Tools.
2. En Site → File Manager, identificar el `public_html` del sitio. Para publicar en una carpeta, crearla dentro de ese directorio.
3. Si ya existe una versión, conservar una copia antes de reemplazar sus archivos.
4. Subir el ZIP y extraerlo dentro de la carpeta elegida. Deben quedar `index.html`, `assets/`, `covers/`, `icons/`, `manifest.webmanifest` y `sw.js` directamente allí. No subir solamente index.html.
5. Comprobar el certificado y HTTPS en la URL asignada; su configuración depende del sitio temporal creado.
6. Abrir la URL (con `/` final si es subcarpeta), recargar y completar ambos modos. No debe haber recursos 404 ni contenido mixto.
7. Probar Anterior, cambio de selección, resultados informativos sin links y Hacer otro match desde un teléfono. Probar seis temáticas, menú, categorías, Lista completa y búsqueda; volver al cuestionario conserva respuestas.

El build usa `base: './'` y navegación en memoria, por lo que no necesita reglas de router ni Node en producción. Reemplazar por un nuevo build para actualizar. Sitio actual: https://mnicabeatrizp6.sg-host.com. Su raíz y recursos fueron comprobados por lectura HTTPS; esta fase no reemplaza archivos publicados. Requiere aprobación visual posterior.

## Pruebas reales pendientes

En Safari/iPhone y Chrome/Android: completar ambos modos; tocar opciones sucesivas; volver y modificar respuestas; dar toques rápidos en navegación; girar vertical/horizontal; ampliar texto a 200%; revisar títulos largos y portadas; explorar catálogo y regresar; reiniciar y completar otra partida. Confirmar ausencia de recortes, superposición y desplazamiento horizontal. Instalar y abrir desde ícono; confirmar Noveduc Rosario, N oficial, ventana standalone y carga offline después de precache completo. Repetir en tablet.

No se recopilan respuestas en un servidor, no hay analítica ni persistencia de datos personales. Recargar el navegador inicia una nueva partida; girar el dispositivo conserva el estado.

## Auditoría de Fase 2

Consultar docs/PHASE2_REPORT.md para las 52 incorporaciones, fuentes, distribución y evidencia. `npx tsx scripts/audit-reachability.ts` genera perfiles reproducibles y detecta obras sin alcance en la muestra de pruebas. `npm run verify:sources` comprueba título, autorías listadas, colección e ISBN contra cada ficha oficial; la interpretación de roles necesita revisión editorial. No ejecutar create-editorial-data.mjs para actualizar Fase 2: reconstruye la curaduría piloto y reemplaza el catálogo. La ampliación curada está en src/data/phase2-curation.json; research-phase2.mjs e import-phase2.mjs son herramientas de investigación/importación, no pasos de build. Los registros nuevos requieren revisión visual antes de habilitarse.

Copia v1: artifacts/match-conjunciones-v1-66f2304.zip (privada). Puede subirse de nuevo para revertir al build local anterior; conservar además copia del public_html actual antes de cualquier actualización. Build/ZIP, investigación y portadas continúan fuera de Git. El fixture de medidas móviles preserva procedencia y hash del ZIP v1; no exige ese archivo para ejecutar tests en otro equipo.

## Fase 3: catálogo y PWA

Identidad pública Match Noveduc / NOVEDUC ROSARIO. Repo y carpeta técnica conservan sus nombres. `src/domain/explore.ts` usa el catálogo único; las categorías no tienen búsqueda y Lista completa busca por título, todos los autores e ISBN. No muestra fichas externas; las fuentes permanecen en los datos. `CatalogMenu` y `CatalogExplorer` no modifican el reducer ni el motor. Abrir/cerrar catálogo conserva la partida en memoria; recargar o reiniciar explícitamente empieza otra.

`npm run build` genera automáticamente íconos PNG 192/512 y Apple 180 desde la N oficial privada sobre blanco, manifest relativo y worker con hash de recursos. No versionar imágenes ni PNG generados. El ZIP contiene todos los recursos; tras una primera carga conectada completa, juego y catálogo funcionan offline. Caché separada por raíz/subcarpeta; sin APIs externas durante uso.

En Chrome/Edge compatibles, usar «Instalar aplicación» cuando el navegador ofrezca la instalación o el control de instalar de su menú. En Safari/iOS, Compartir → Agregar a inicio (o Añadir a pantalla de inicio). Nombre instalado Noveduc Rosario, corto Noveduc. Instalación necesita HTTPS en publicación; localhost sirve para comprobación técnica. La disponibilidad del aviso y los nombres de controles dependen del navegador. [Criterios de instalación](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

Cada build cambia la revisión si cambia algún recurso. Una nueva versión se descarga completa y espera; «Actualizar y volver al inicio» se ofrece fuera de la partida y recarga solo tras esa acción. No actualizar durante un cuestionario; si se cierra toda la aplicación, el navegador puede activar la versión en espera en la próxima apertura. También se vuelve a comprobar al recuperar conexión. [Ciclo de actualización](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

Para una futura publicación aprobada: respaldar public_html; subir todos los archivos y `sw.js` al final, una vez disponibles los recursos referenciados; conservar assets con hash anteriores durante la transición de pestañas abiertas. Evitar caché prolongada/immutable para index.html, sw.js y manifest.webmanifest; comprobar que las herramientas de caché de SiteGround permiten revalidarlos. No borrar almacenamiento de visitantes ni desregistrar workers para forzar actualizaciones. Validar HTTPS, manifest, instalación y actualización en la URL real tras publicación. No se ha modificado el hosting en esta fase.

Pruebas nuevas: catálogo A–Z, filtros y escalabilidad; menú dinámico, seis listas sin búsqueda, tacto/foco/200%/Axe, conservación; PWA Chromium con criterios de instalación, íconos blancos, offline (80 portadas y partida) raíz/subcarpeta, y reemplazo real de worker en servidor local aislado. En las pruebas UI convencionales se bloquean workers para aislar fallbacks de red; las pruebas PWA los habilitan explícitamente. No equivalen a instalación/standalone comprobada en teléfonos físicos.

Backup privado de Fase 2 con texto corregido: `artifacts/match-conjunciones-fase2-e78a29a.zip` y commit e78a29a. Vista previa: `npm run preview -- --port 4173`, http://127.0.0.1:4173/?fase=3. El servidor dev no ofrece PWA; verificar con build/preview.
