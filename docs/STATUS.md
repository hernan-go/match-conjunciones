# Estado — Fase 3, 12/10/2026

## Ajustes finales de interfaz — entrega actual

Implementados los ajustes visuales y de ergonomía autorizados, sobre Fase 3 sin cambiar datos, motor, estado, menú, catálogo/búsqueda o estrategia PWA. Preview http://127.0.0.1:4175/?revision=ergonomia (puerto separado para evitar la caché de la versión previa durante aprobación). Publicación SiteGround no realizada.

App.tsx sustituye solo iconos/flechas por los SVG originales y Chevron.tsx presentacional. CSS: panel #E8DDC3 con radio 10 px, tarjetas blancas, SVG de 29×36 px con object-fit contain, chevron negro #111111 en cuadro 36 px/radio 8, navegación roja #E63A2E de 48 px/radio 10 y chevrons blancos. Separación de navegación 30 px, texto descriptivo centrado; textos y familias tipográficas conservados, footer intacto. Sin botones anidados ni recortes. En 320×568 se permite scroll natural; 375/390 conservan header 61 px y modalidades terminan a 505,875 px.

book1.svg y book2.svg copiados intactos a assets-private/ui y dist/ui por package-build.ts; SVG privados no versionados. Integración reproducible documentada en README. SHA256 fuente/caché/build idénticos: book1 46E8938D2B6CA6A0D76800028AA30577CD8FF459A26F473AAF1DEA9DA6D928F2; book2 C9B98272D14CDA6403E1776B851846160E6BA613B709FEC3C6DE1BE9CCC0FEB3. Sin paquetes nuevos ni redibujar archivos.

TypeScript/build/validación aprobados; 17/17 unitarias y suite Chromium completa 29/29. Cuatro pruebas nuevas comprueban inicio 320/375/390/768, quiz 320×568/375×667/390×844/768×1024, gap mínimo 30 px durante diez preguntas por viewport, targets, colores, proporciones y bytes de SVG, centrado, overflow y Axe. Regresión de menú/catálogo/conservación/PWA aprobada. Capturas artifacts/ergonomics-home-320/375/390/768.png y ergonomics-quiz-320/375/390/768.png; revisadas visualmente inicio 320/390 y quiz 320/375. Pruebas de texto 200%, tacto/foco/contraste y navegación existentes aprobadas. Continúan pendientes las pruebas en dispositivos físicos y WebKit bloqueado, como se detalla abajo.

Build/ZIP actual: 91 archivos, aproximadamente 1550 KiB, 80 portadas, N oficial, dos SVG de modalidades, íconos/manifest/worker. ZIP descomprimido y comparado byte por byte. Precache automático existente incluye 90 recursos, revisión 8a6420c32df73e9e952f. Backup privado anterior artifacts/match-conjunciones-fase3-f903ef3.zip; código f903ef3. Información siguiente conserva evidencia de entrega Fase 3 previa.

## Actual

Fase 3 implementada y verificada localmente. Vista previa para aprobación visual: http://127.0.0.1:4173/?fase=3. SiteGround https://mnicabeatrizp6.sg-host.com no modificado. Repositorio existente https://github.com/hernan-go/match-conjunciones; no se renombra proyecto ni repositorio. Próximo paso: revisión del usuario; publicación únicamente tras aprobación posterior.

## Implementado

- Match Noveduc en nombre público, HTML, metadatos y accesibilidad. Header NOVEDUC / ROSARIO, N oficial intacta, fondo blanco, #E63A2E y Arial/Georgia. Header móvil sigue midiendo 61 px y modalidades terminan a 505,875 px en 375/390: conserva densidad Fase 2.
- Texto ya corregido conservado: «Sin registro. Sin respuestas incorrectas. Solo tus intereses y nuevas lecturas.».
- Tarjetas compartidas informativas sin LINK, anchors ni acciones en título/portada. ProductUrl, fuentes, catálogo y autorías conservados internamente.
- Menú modal con seis categorías dinámicas en orden actual y Lista completa separada; cierre visible/Escape, foco devuelto después de cerrar, controles mínimos 48 px. Referencia aplicada solo a composición.
- Categorías: todos los libros pertinentes únicos, título, cantidad y A–Z español (ignora signos de interrogación para ordenar), sin buscador. Lista completa: 80 títulos actuales, contador dinámico, búsqueda inmediata por título/todos los autores/ISBN, tildes y mayúsculas normalizadas, parcial, ISBN sin guiones, limpiar y mensaje vacío. Sin catálogo duplicado ni límite de 80.
- Estado del explorador independiente del reducer: entrar, cambiar lista, cerrar y volver conserva modalidad, temática, orden, pregunta, selecciones y resultados. Retorno con foco/desplazamiento. No modificar match, selección de preguntas ni reducer.
- PWA estática: Noveduc Rosario / Noveduc, display standalone, manifest relativo, PNG oficiales 192/512 y Apple 180 sobre blanco, generados desde SVG privado. Instalación ofrecida en navegadores compatibles, instrucciones Safari en README. Worker precachea aplicación y todas las portadas después de primera carga conectada completa; caché por revisión de contenido y ámbito. Actualización en espera y botón explícito fuera del quiz; no recarga automática de partidas. No agregar dependencias.

## Verificación ejecutada

- npm run build aprobado: TypeScript, validación estructural/editorial, preparación de 80 originales, compilación, generación PWA y ZIP descomprimido/comparado byte por byte.
- npm test: 17/17 unitarias, incluidas búsqueda, unicidad, categorías y crecimiento a 81 sin límite fijo; siguen pasando integridad/cobertura/ranking/reducer/testigos originales.
- npm run test:e2e: suite Chromium final completa 25/25. Seis tamaños 320/375/390/768/1024/1440, orientación, 200%, tacto emulado, foco, selección, retroceso, ráfagas, reinicio, ausencia de enlaces e imágenes/fallback. Axe A/AA sin violaciones detectadas en vistas originales, menú y explorador.
- Menú/categorías completos probados a 320/390/768/1440; 80 títulos A–Z sin duplicados; consultas por título/autor/ISBN, case/tildes, limpiar y vacío; vuelta al mismo cuestionario y respuestas previas verificada.
- PWA en raíz y /evento/: manifiesto/íconos/nombre/scope, criterios de instalación Chromium sin errores (CDP), reload offline, 80 portadas cargadas, búsqueda y diez preguntas offline. Nueva revisión de worker servida en servidor local aislado: espera durante partida, conserva respuesta y actualiza al terminar solo tras acción explícita; limpia caché anterior.
- Corregidos durante validación: servidor E2E reutilizaba preview y no reproducía subcarpeta; ahora puerto exclusivo 4174 sin reutilización, preview permanece en 4173. Foco al cerrar modal se restaura una vez retirado; orden ignora puntuación inicial de títulos. Suite final refleja todas las correcciones.
- Capturas revisadas: artifacts/fase3-menu-390.png, fase3-category-390.png, fase3-all-390.png, chromium-home-390.png y resultados responsive. Ícono 192 revisado visualmente. SVG fuente/caché/build conserva SHA256 AC6A421CF0849B877D3E068DDEFFB3585AF9DEF080D0A80E22CFEEC72952C7BC.
- Git diff confirma cero cambios a src/data, domain/match.ts, domain/select.ts y state/game.ts. No se repitió investigación editorial ni auditoría de alcance de Fase 2.

## Entrega Fase 3 previa y recursos

ZIP artifacts/match-conjunciones-siteground.zip: 89 archivos, aproximadamente 1547 KiB, index.html en raíz, 80 portadas originales, SVG, tres PNG, manifest y worker. 88 recursos precacheados. Informe/hash por archivo: artifacts/build-report.json. Revisión PWA e6b0e436246f08633089. Builds e imágenes privadas continúan excluidos de Git.

Backup privado Fase 2 con texto corregido: artifacts/match-conjunciones-fase2-e78a29a.zip; código e78a29a. Backup v1: artifacts/match-conjunciones-v1-66f2304.zip; código 66f2304. Conservar además public_html real antes de cualquier futura publicación. Instrucciones de build, instalación, actualización y publicación en README.

## Editorial preservado y antecedentes

80 obras (52 añadidas en Fase 2 y 28 originales), 84 preguntas (60 originales + 24 de Fase 2), diez por partida y 3–5 resultados. 70 Conjunciones, 2 Perfiles, 4 Noveduc Gestión, 1 Ensayos y Experiencias, 3 sin colección informada. Cuatro autores obligatorios representados. Cobertura con solapamientos: Salud mental 25, Infancias 41, Educación 22, Vínculos 19, Prevención 16, Emociones 29.

Verificación editorial de Fase 2: fichas oficiales, títulos, autorías, colección e ISBN 80/80 contrastados el 11/10; 80 portadas originales revisadas visualmente. Auditoría 158.000 partidas, testigos 80/80 en tests/fixtures/recommendation-witnesses.json. Evidencia/limitaciones en docs/PHASE2_REPORT.md; no confundir curaduría original ni perfiles simulados con conducta real de visitantes.

## Pendientes reales

- Aprobación visual de Fase 3 antes de modificar SiteGround. No hay despliegue externo en esta intervención.
- Instalación efectiva y ventana standalone en iPhone/Android/tablets físicos no comprobadas: no disponibles. Se comprobaron requisitos de instalación y comportamiento offline en Chromium, y standalone está configurado en manifest. Seguir lista de pruebas reales de README.
- WebKit instalado pero Windows Control de aplicaciones bloquea bibliotecas; no se elude. Probar Safari en equipo compatible.
- Verificación PWA en HTTPS publicado, cabeceras/caché de SiteGround y actualización de una instalación real después de futura publicación aprobada.
