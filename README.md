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

No se recopilan respuestas ni datos personales en un servidor. Solo se acumulan los dos contadores anónimos descritos abajo. Recargar el navegador inicia una nueva partida; girar el dispositivo conserva el estado.

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

## Contadores temporales — actualización preparada, sin publicar

VISITORS cuenta aproximadamente un navegador: UUID aleatorio en localStorage y marca de visita confirmada. Recargas, menú y nuevas partidas no suman otra visita. Otro navegador, modo privado o limpieza de almacenamiento pueden sumar nuevamente. MATCH COMPLETE se registra después de renderizar recomendaciones de las diez respuestas; cada inicio genera otro UUID. El cliente solo envía tipo e ID; no envía respuestas ni libros. PHP conserva huellas SHA256 y totales; reenvíos del mismo evento no incrementan dos veces. No son personas identificadas ni una medición invulnerable a manipulación manual.

Pendientes en localStorage durante siete días, con cinco intentos por evento/carga, timeout de cinco segundos y reintentos cada 15 segundos o al recuperar conexión. Si no se confirma, queda para la próxima apertura dentro del plazo. Si localStorage está bloqueado no se garantiza medición. El cuestionario continúa aunque fallen red o almacenamiento. GET solo al montar el inicio; POST confirmado refresca cifras visibles. Sin polling. Preview estático no ejecuta PHP: es normal ver guiones; `npm run dev` tampoco ofrece estadísticas reales.

Archivos: `src/services/statistics.ts` (cola/IDs/red), `src/components/Statistics.tsx` (dos columnas de 11 px), `src/App.tsx` (integración), `src/styles.css`, `server/stats.php`, scripts de empaquetado/PWA/servidor de pruebas y pruebas de estadísticas. Catálogo, preguntas, motor y reducer intactos. `stats.php` se incluye en el ZIP, queda fuera del precache y el worker no intercepta GET/POST PHP. Tanto fetch como PHP usan no-store.

### Publicar después de la autorización del usuario

1. Respaldar el `public_html` vigente y, si ya existe, `match-noveduc-private/statistics.json`. No reemplazar todavía el sitio: esta entrega solo prepara el ZIP.
2. En Site Tools → Site → File Manager identificar la ruta real de `public_html`. El endpoint busca ese nombre entre sus directorios ascendientes, también desde una subcarpeta. El almacenamiento queda en **el directorio hermano** `match-noveduc-private/statistics.json` (por ejemplo, `<directorio-del-sitio>/match-noveduc-private/statistics.json`). No está en el ZIP. La ruta absoluta y permisos reales siguen pendientes de comprobación en el hosting; no se accedió a Site Tools.
3. Confirmar PHP 7.4+ activo. El usuario PHP debe poder crear/escribir esa carpeta hermana. Si no puede crearla, crearla manualmente con propietario del sitio y permisos 700; archivos privados 600. No usar 777 ni mover el JSON a public_html. Si la raíz real no se llama public_html, ajustar la resolución en `server/stats.php` a una ruta privada verificada antes de publicar.
4. Subir y extraer `artifacts/match-conjunciones-siteground.zip` dentro del public_html real (o subcarpeta de la app). Actualizar los recursos antes de `sw.js`; conservar assets anteriores durante transición. No tocar la carpeta privada en futuras publicaciones. El endpoint crea el JSON al primer evento válido, bajo `flock` y reemplazo atómico; un JSON inválido produce 503, nunca reinicio silencioso de cifras.
5. Excluir `stats.php` de cualquier caché de SiteGround/CDN; comprobar `Cache-Control: no-store` y que se ejecuta como PHP. Abrir `https://mnicabeatrizp6.sg-host.com/stats.php`: debe responder solo `visitors` y `matchComplete` numéricos, sin rutas ni IDs. Si devuelve 503, revisar ruta/permisos; si entrega código PHP, corregir PHP antes de habilitar el endpoint.
6. Abrir la app conectada: ver ambos totales bajo el footer. Recargar: VISITORS permanece. Completar diez respuestas y pulsar Ver mis resultados; Hacer otro match devuelve al inicio con MATCH COMPLETE incrementado. Repetir partida: otro incremento; abrir desde otro navegador: otra visita. No borrar localStorage ni desregistrar el worker para actualizar. Las instalaciones previas reciben la versión cuando aceptan la actualización normal de PWA.
7. Verificar en el hosting dos eventos idénticos sin doble incremento y concurrencia con un entorno de prueba aislado. La prueba PHP local preparada se ejecuta con `node scripts/test-statistics-php.mjs` (opcional `PHP_BINARY` para indicar el ejecutable): crea un public_html aislado dentro de artifacts, valida duplicados, solicitudes simultáneas, privacidad, corrupción y persistencia al reemplazar PHP. En Windows el servidor PHP integrado serializa solicitudes; para comprobar contención real entre procesos, repetir en un entorno PHP con varios workers. No usar los contadores públicos para pruebas de carga.

No se ejecutó PHP aquí: intérprete ausente. Quedan pendientes la prueba de integración PHP, contención real de flock, ruta/permisos efectivos, cabeceras/caché y actualización PWA en SiteGround. No se modificó la aplicación pública.
