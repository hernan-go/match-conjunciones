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

## Intervención visual autorizada — 11/10/2026

1. Extraer rojo del SVG oficial y conservar tipografías y contenido existentes.
2. Centralizar paleta clara y estados en CSS; sustituir N tipográfica por el SVG original y construir señalador con pseudo-elemento y clip-path, manteniendo texto accesible.
3. Verificar selección, navegación, seis tamaños, orientación, texto 200%, imágenes y contraste; añadir comprobación de modo claro con sistema oscuro. Contrastar SVG fuente/build byte por byte.
4. Revisar capturas, actualizar documentación, regenerar y verificar ZIP; commit y push al repositorio existente.
5. Mostrar preview local. Publicación SiteGround pendiente de aprobación visual y datos externos. Sin cambios en datos, dominio, estado o recursos editoriales.

## Fase 2

1. Respaldar ZIP v1 e investigar sistemáticamente fichas de Conjunciones y catálogo general, persistiendo solo datos editoriales.
2. Curar nuevas obras, autorías, colecciones, etiquetas y resúmenes; revisar imágenes y evitar duplicados de obra/edición.
3. Auditar cobertura y libros alcanzables con perfiles reales de preguntas; ajustar únicamente donde exista necesidad y evidencia.
4. Compactar header, inicio, selector y quiz; punto/shuffle, footer mínimo y definición de portadas.
5. Validaciones editoriales, unitarias y Playwright con tamaños y accesibilidad; medir espacio y revisar capturas.
6. Build/ZIP íntegro con nuevas portadas y rutas relativas, documentación, commits separados y push. Preview local para aprobación; mantener SiteGround actual.

## Fase 3 autorizada — 12/10/2026

1. Inspeccionar estado real y autorización definitiva; preservar ZIP de Fase 2. Corrección «Sin respuestas incorrectas» ya terminada: conservarla.
2. Actualizar identidad pública y header ROSARIO; retirar enlaces de tarjetas compartidas, conservar fuentes internas. No modificar datos editoriales, preguntas, ranking ni reducer.
3. Añadir módulo puro exploreBooks (filtro, unicidad, orden español y búsqueda normalizada), menú dinámico y componente de exploración. Estado de navegación independiente de partida; foco y scroll al regresar. Sin buscador en categorías/menú.
4. Generar manifest, íconos desde SVG privado y service worker durante empaquetado. Hash de todos los recursos, caché por ámbito, instalación completa antes de activar, limpieza de versiones anteriores y actualización explícita diferida durante quiz. Hook de instalación y aviso de actualización separado del estado del juego. No agregar dependencias ni infraestructura.
5. Ejecutar validación, unitarias y suite Chromium existente más menú/catálogo/búsqueda/conservación/accesibilidad y PWA. Verificar offline y actualización con dos revisiones servidas localmente, criterios de instalación, íconos y rutas relativas; revisar capturas. Documentar límites de emulación y dispositivos no disponibles.
6. Regenerar ZIP con todas las portadas, manifest, íconos y worker; contrastar byte a byte. Actualizar REQUIREMENTS/PLAN/STATUS/README, commits descriptivos y push al repositorio existente. Entregar preview de Fase 3. Sin subir a SiteGround.

## Ajustes finales de interfaz — 12/10/2026

1. Inspeccionar componentes/estilos y SVG suministrados; preservar build Fase 3 y copiar originales a caché privada de UI, sin alterarlos ni versionar recursos restringidos.
2. Sustituir solo iconos/flechas en JSX mediante imágenes SVG y Chevron presentacional compartido; beige, tarjetas blancas, esquinas redondeadas, 30 px de separación y texto descriptivo centrado en CSS.
3. Copiar dos SVG al dist/ui durante empaquetado antes del precache existente, sin modificar estrategia PWA. Documentar importación reproducible.
4. Build/tipos/validación/unitarias y E2E de ergonomía más regresión completa; revisar capturas y probar gap durante diez preguntas por viewport. Documentar emulación y pendientes físicos.
5. Actualizar STATUS y entrega, commit/push al repo existente, ZIP y preview actualizado. Sin publicación en SiteGround.
