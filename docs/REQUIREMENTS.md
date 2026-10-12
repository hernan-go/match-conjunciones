# Requisitos definitivos

Fuente: autorizaciones definitivas del usuario, 11 y 12/10/2026. Fase 3 prevalece en identidad, enlaces, catálogo e instalación. Raíz C:\dev\personal\noveduc.

## Producto

Match literario de Noveduc, público general, español de Argentina, sin registro, diagnóstico ni datos personales. Vite + React + TypeScript, datos locales, sin backend ni APIs durante partidas. Arquitectura modular simple: datos, lógica, estado, UI, imágenes y validación separados. Contenido ampliable sin reescribir algoritmo ni componentes.

## Catálogo

Todo Noveduc permitido; Conjunciones preferida solo entre afinidades comparables. Objetivo 60+ obras, tamaño inicial flexible. Ficha oficial, título y autoría verificados; distinguir roles. Sin packs ni ediciones duplicadas. Una obra elegible mínima de Alicia Stolkiner, Esteban Levin, Ruth Harf y Silvia Bleichmar; perfiles pertinentes deben permitir recomendarlas sin cuotas.

## Cobertura

Mínimo seis temáticas habilitadas con tres obras elegibles y diez preguntas pertinentes cada una. Datos pueden habilitar/deshabilitar áreas, pero no reducir el mínimo sin autorización. Cada opción necesita afinidad positiva verificada con tres obras del universo aplicable. Complementar garantía estructural de pesos no negativos con pruebas editoriales diferenciadas. No inventar etiquetas para completar cobertura.

## Partida

Temática estricta o Sorprendeme equilibrado. Exactamente diez preguntas, cuatro a seis opciones únicas por pregunta. Preguntas y orden fijos al comenzar. Una respuesta vigente reemplazable; selección visual y señal adicional al color. Anterior/Continuar con iconos circulares y objetivos táctiles de 48 px. Anterior deshabilitado al comenzar; Continuar hasta responder. Última: Ver mis resultados. Retroceso conserva respuestas; puntuación recalculada desde selecciones vigentes. Proteger avances dobles. Hacer otro match limpia íntegramente la partida y vuelve al inicio.

## Imágenes

Jerarquía original > otra edición auténtica > n_portada.svg suministrado. Registrar original/otra_edicion/institucional; no crear sustitutos nuevos. Registrar evidencia y edición; identificar otra edición cuando corresponda. No mostrar avisos de portada ausente, imágenes rotas o vacías. Institucional descrita como recurso institucional, sin atribuirla a una tapa auténtica. Imágenes fuera de Git público salvo permiso específico. Todas incluidas en dist. Importación reproducible, validación y conteo por tipo; institucional válida no bloquea build.

## Resultados

Tres a cinco obras diferentes, tarjetas horizontales: imagen izquierda compacta, título completo, autoría verificada, temática, resumen original y justificación real. Sin enlaces externos visibles ni acciones en portada/título; conservar productUrl y fuentes internamente. Sin precios, descuentos, promociones, stock, carrito, compra ni porcentajes psicológicos. No recopilar valores comerciales.

## Responsive y aceptación

Mobile-first desde 320 px; probar 320/375/390/768/1024/1440, ambas orientaciones y texto 200%. Sin desbordamiento horizontal, superposición o truncamiento. Teclado, foco, contraste, controles 48 px, sin hover necesario. iOS Safari/Android Chrome reales si disponibles: si no, pendientes con instrucciones. Tests automáticos: integridad, seis áreas, autores, cobertura, selección de diez únicas, conservación/cambio de respuestas, recálculo, filtro, 3–5 únicas, relevancia, enlaces, imágenes, reinicio y dobles toques.

## Entrega

Documentación AGENTS, REQUIREMENTS, PLAN, STATUS y README. Git público match-conjunciones con descripción autorizada; exclusiones antes de commit, commits por etapas y push final. No secretos ni recursos restringidos. Build dist y artifacts/match-conjunciones-siteground.zip con index.html en raíz y todas las imágenes. Probar raíz/subcarpeta. Publicación manual SiteGround pendiente de URL, HTTPS y comprobación externa. No esperar URL para desarrollar.

## Identidad visual inicial — 11/10/2026 (historial; Fase 3 prevalece)

Intervención exclusivamente visual: mantener catálogo, preguntas, pesos, algoritmo, navegación, reinicio, enlaces y recursos de portada. Fondo blanco #FFFFFF y apariencia siempre clara con color-scheme: light. Texto principal #303030, secundarios grises con contraste, superficies neutras y tarjetas blancas. Rojo institucional #E63A2E extraído de n_portada.svg y centralizado en CSS. N oficial en encabezado como imagen, sin alterar archivo, geometría ni colores; mismo SVG para fallback institucional.

Conservar Arial/Helvetica/sans-serif y Georgia/Times New Roman/serif, incluida cursiva editorial. Resultados con «Tu match literario.» como texto real: gris oscuro y «literario.» blanco dentro de señalador CSS rojo con punta derecha, adaptable a dos líneas en teléfonos. Sin sombras fuertes, gradientes o animaciones añadidas. Selección con rojo e indicador ✓; foco y controles de 48 px. Blanco/rojo (4,19:1) reservado a texto grande; acciones blancas en negrita de 1,2 rem y texto pequeño en gris oscuro.

Repetir TypeScript, tests unitarios y E2E, seis anchos, orientación, texto 200%, contraste, carga de imágenes, señalador sin recortes y sistema oscuro conservando modo claro. Regenerar build y ZIP, documentar evidencia y sincronizar repositorio existente. Mostrar vista previa local para aprobación visual antes de publicar en SiteGround. Sin nuevas dependencias, PWA ni ampliación editorial.

## Fase 2 autorizada

Ampliar a mínimo 60 obras verificadas, procurar 80, priorizando Conjunciones sin excluir catálogo general. Conservar autores obligatorios y seis áreas, preguntas existentes salvo necesidad editorial demostrada, motor determinista, filtro estricto, diez preguntas y 3–5 obras. Verificar pertinencia, alcance efectivo de nuevos títulos y diversidad; documentar límites sin inventar datos. Recursos de imagen privados incluidos en build.

Compactar mobile sin ocultar contenido ni fijar alturas: header orientativo 56–72 px, título inicial Georgia bold y vos. rojo/cursiva, modalidades visibles en teléfono habitual, selector compacto, progreso próximo al header, respuestas y navegación cercanas, footer mínimo centrado no fijo. Sustituir estrellas por punto rojo y shuffle SVG; conservar icono de lista. Sombra neutra suave en contenedor de portadas, tarjetas horizontales completas. Probar 320×568, 375×667, 390×844, 768×1024, 1024×768 y ancho 1440, texto 200%, tacto 48 px y áreas seguras. Scroll natural si necesario.

Usuario informa publicación operativa en https://mnicabeatrizp6.sg-host.com. Preparar actualización local y ZIP, conservar versión anterior recuperable; no reemplazar sitio sin aprobación visual posterior.

## Fase 3 definitiva — 12/10/2026

- Nombre público Match Noveduc; header compacto NOVEDUC / ROSARIO con N oficial intacta, blanco, #E63A2E y tipografías actuales. PWA Noveduc Rosario, nombre corto Noveduc, íconos N oficial sobre blanco. No renombrar repositorio ni raíz ni colección Conjunciones.
- Conservar «Tu próxima lectura empieza con vos.», «Tu match literario.» y «Sin registro. Sin respuestas incorrectas. Solo tus intereses y nuevas lecturas.».
- Menú hamburguesa modal accesible: seis áreas habilitadas obtenidas del catálogo en su orden actual; Lista completa al final, separada visualmente. Referencia solo de composición; no fondo negro ni símbolo ilustrativo. Cerrar/Escape devuelve foco al control.
- Categorías: nombre, cantidad dinámica, obras únicas A–Z, tarjetas horizontales informativas y volver al match. Sin buscador. Lista completa: todo el catálogo (80 actuales, sin límite fijo), búsqueda inmediata solo aquí por título, todos los autores e ISBN; parcial, sin distinguir mayúsculas/tildes, admite ISBN sin guiones. Limpiar y mensaje sin resultados. Sin backend ni catálogo duplicado.
- Navegación de catálogo separada del reducer: preservar modalidad, temática, preguntas, orden, índice, respuestas y resultados. Volver restaura foco y desplazamiento. Solo acciones explícitas reinician; recargar sigue iniciando partida nueva.
- PWA estática: manifest relativo para raíz/subcarpeta, display standalone, íconos generados reproduciblemente desde SVG privado, caché versionada por contenido y ámbito, recursos completos offline tras primera carga exitosa. Actualización espera; no recarga automática ni control de actualizar durante partida. Usuario activa «Actualizar y volver al inicio» al terminar o desde inicio. Instalar mediante oferta del navegador compatible o función del sistema.
- Conservar sin cambios las 80 obras, 84 preguntas, pesos, algoritmo de match y reducer. No modificar SiteGround; entregar preview y ZIP completo.
- Aceptación adicional: orden y seis opciones + Lista completa, categorías sin búsqueda, listado único A–Z, filtros título/autor/ISBN/tildes/parcial, limpiar/vacío, ausencia de links en tarjetas, conservación y regreso, targets 48 px, texto 200% y accesibilidad. PWA: manifiesto/íconos, criterios de instalación Chromium, offline raíz/subcarpeta y nueva versión sin perder partida hasta actualización explícita. Instalación/standalone en teléfonos reales pendiente si no disponibles.

## Ajustes finales de interfaz autorizados — 12/10/2026

Contenedor completo de modalidades beige exacto #E8DDC3, bordes redondeados y padding compacto; tarjetas interiores blancas. SVG suministrados book1.svg (temática) y book2.svg (Sorprendeme), archivos intactos a la izquierda, proporciones originales y altura orientativa 36 px. Chevron derecho blanco grueso sobre cuadrado #111111 de 36–40 px con esquinas redondeadas en ambas tarjetas; forma parte del único botón, sin acción separada. Navegación con chevrons izquierda/derecha blancos sobre rojo #E63A2E, esquinas redondeadas, targets mínimos 48 px, mismos labels, habilitación y transiciones. Reemplaza requisito histórico de círculos/flechas solo en presentación.

Separación mínima 30 px desde última respuesta hasta navegación. Preservar contenido, controles y scroll natural cuando no alcance alto; no ocultar ni truncar. Centrar ambas líneas del texto descriptivo sin cambiar texto, tipografía ni aumentar altura. Footer institucional intacto. Solo JSX/presentación y incorporación de dos SVG al build; sin cambiar estado, catálogo, preguntas, motor, menú, búsqueda o estrategia PWA. Pruebas de inicio 320/375/390/768, quiz 320×568/375×667/390×844, proporciones/carga de SVG, colores, separación, foco, contraste y regresión. Build/ZIP, documentación, commit/push y preview; no SiteGround.
