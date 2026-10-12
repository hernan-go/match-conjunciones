# Estado — Fase 2, 11/10/2026

Corrección puntual del 12/10/2026: inicio dice «Sin registro. Sin respuestas incorrectas. Solo tus intereses y nuevas lecturas.». Solo cambió esa palabra; estilos y funcionalidades intactos. Build de producción, TypeScript, validación editorial y ZIP verificado aprobados. Sin publicación en SiteGround.

## Actual

Fase 2 implementada y verificada localmente. Revisión visual del usuario pendiente antes de actualizar SiteGround. Repositorio existente: https://github.com/hernan-go/match-conjunciones. No hay cambios externos de hosting. Resumen y lista de títulos nuevos: docs/PHASE2_REPORT.md.

## Editorial verificado

80 obras, 52 nuevas y 28 registros originales intactos. 70 Conjunciones, 2 Perfiles, 4 Noveduc Gestión, 1 Ensayos y Experiencias y 3 sin colección informada. Fichas oficiales contrastadas: títulos, autorías listadas, colección e ISBN (80/80); roles explícitos revisados en índice/portada. Etiquetas y resúmenes son curaduría original basada en fuentes, no coincidencias inventadas. Imágenes: 80 originales revisadas visualmente, 0 otra edición, 0 institucional. SVG oficial íntegro en header y fallback; archivos privados excluidos de Git.

Cobertura (con solapamientos): Salud mental 25, Infancias 41, Educación 22, Vínculos 19, Prevención 16, Emociones 29. Alicia Stolkiner, Esteban Levin, Ruth Harf y Silvia Bleichmar conservan representación y perfiles recomendables. 84 preguntas: 60 originales sin cambios y 24 nuevas, cuatro opciones por pregunta y diez por partida. Sin cambios al motor, reducer ni selección de preguntas.

Auditoría: 158.000 partidas temáticas con opciones reales, 80/80 obras alcanzables. Testigos versionados en tests/fixtures/recommendation-witnesses.json. Frecuencias y perfiles privados en artifacts/reachability.json; no estiman comportamiento real de participantes. Cobertura por opción y filtro estricto validados.

## Interfaz y evidencia

Header móvil 61 px frente a 101; modalidades terminan a 506 px frente a 759, medidas a 390 px desde ZIP v1 preservado. Ambas visibles en 375×667 con reserva de 48 px para barras móviles. Georgia bold, Arial/Georgia conservadas, #E63A2E y N oficial intactos, fondo blanco, señalador CSS accesible. Punto y shuffle sustituyen estrellas. Selector de una columna a 320 y dos desde 375 con nombres breves y nombres completos accesibles. Quiz compacto sin footer, contador redundante solo para lector de pantalla, navegación natural sin overlay sticky. Portadas con sombra suave en contenedor. Sin alturas fijas ni scroll oculto.

TypeScript y validación aprobados, 14/14 tests unitarios, suite Chromium completa 16/16; después del ajuste final del selector, 4/4 afectados aprobados. Fixture de métricas/390/Axe aprobado 3/3. Seis tamaños concretos, orientación, texto 200%, tacto emulado, raíz/subcarpeta, imágenes/fallback, foco, selección, retroceso, ráfagas y reinicio. Axe WCAG A/AA sin violaciones detectadas en inicio, selector, selección y resultados. Capturas revisadas, incluidas home/quiz/results 390 y selector-390.png; medidas en artifacts/mobile-density.json. Emulación y auditorías no sustituyen pruebas reales.

Build/ZIP: 84 archivos, aproximadamente 1528 KiB, index.html en raíz, 80 portadas y SVG; descompresión y comparación byte por byte con dist, hashes en artifacts/build-report.json. Comandos de build sin cambios. Copia recuperable: artifacts/match-conjunciones-v1-66f2304.zip y código Git 66f2304.

Sitio actual https://mnicabeatrizp6.sg-host.com/ comprobado por lectura HTTPS y recursos de raíz válidos; artifacts/published-check.json. Ninguna subida ni reemplazo. El backup local corresponde a v1 local; conservar además public_html real antes de actualizar por si contiene diferencias externas.

## Pendientes y limitaciones

- Aprobación visual local por el usuario antes de publicación.
- WebKit instalado pero Windows Control de aplicaciones bloquea sus bibliotecas; no eludir protección. Ejecutar pruebas en equipo compatible.
- No hay iOS/Android/tablets reales disponibles en esta sesión. Usuario informa funcionamiento móvil del sitio anterior; queda prueba de nueva versión, barras reales y áreas seguras en dispositivos.
- Capturas reales mencionadas por usuario no adjuntas en este turno; se revisaron capturas automatizadas.
- No ampliar catálogo o activar PWA fuera del alcance actual sin nuevo pedido.

## Continuación

Abrir http://127.0.0.1:4173/?fase=2 y revisar ambos modos. Tras aprobación, respaldar public_html y seguir README para subir nuevo ZIP. Antes de cualquier cambio editorial, consultar REQUIREMENTS y reporte pertinente; mantener testigos de alcance y documentación. No repetir investigación ya cacheada.
