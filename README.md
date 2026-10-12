# Match Conjunciones

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
4. Subir el ZIP y extraerlo dentro de la carpeta elegida. Deben quedar `index.html`, `assets/` y `covers/` directamente allí.
5. Comprobar el certificado y HTTPS en la URL asignada; su configuración depende del sitio temporal creado.
6. Abrir la URL (con `/` final si es subcarpeta), recargar y completar ambos modos. No debe haber recursos 404 ni contenido mixto.
7. Probar Anterior, cambio de selección, resultados, LINK y Hacer otro match desde un teléfono. Probar seis temáticas y varias partidas consecutivas.

El build usa `base: './'` y navegación en memoria, por lo que no necesita reglas de router ni Node en producción. Reemplazar por un nuevo build para actualizar. Sitio actual: https://mnicabeatrizp6.sg-host.com. Su raíz y recursos fueron comprobados por lectura HTTPS; esta fase no reemplaza archivos publicados. Requiere aprobación visual posterior.

## Pruebas reales pendientes

En Safari/iPhone y Chrome/Android: completar ambos modos; tocar opciones sucesivas; volver y modificar respuestas; dar toques rápidos en navegación; girar vertical/horizontal; ampliar texto a 200%; revisar títulos largos y portadas; abrir LINK y regresar; reiniciar y completar otra partida. Confirmar ausencia de recortes, superposición y desplazamiento horizontal. Repetir en tablet.

No se recopilan respuestas en un servidor, no hay analítica ni persistencia de datos personales. Recargar el navegador inicia una nueva partida; girar el dispositivo conserva el estado.

## Auditoría de Fase 2

Consultar docs/PHASE2_REPORT.md para las 52 incorporaciones, fuentes, distribución y evidencia. `npx tsx scripts/audit-reachability.ts` genera perfiles reproducibles y detecta obras sin alcance en la muestra de pruebas. `npm run verify:sources` comprueba título, autorías listadas, colección e ISBN contra cada ficha oficial; la interpretación de roles necesita revisión editorial. No ejecutar create-editorial-data.mjs para actualizar Fase 2: reconstruye la curaduría piloto y reemplaza el catálogo. La ampliación curada está en src/data/phase2-curation.json; research-phase2.mjs e import-phase2.mjs son herramientas de investigación/importación, no pasos de build. Los registros nuevos requieren revisión visual antes de habilitarse.

Copia v1: artifacts/match-conjunciones-v1-66f2304.zip (privada). Puede subirse de nuevo para revertir al build local anterior; conservar además copia del public_html actual antes de cualquier actualización. Build/ZIP, investigación y portadas continúan fuera de Git. El fixture de medidas móviles preserva procedencia y hash del ZIP v1; no exige ese archivo para ejecutar tests en otro equipo.
