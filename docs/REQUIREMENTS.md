# Requisitos definitivos

Fuente: autorización definitiva del usuario, 11/10/2026. Prevalece sobre plan, handoff y capturas. Raíz C:\dev\personal\noveduc.

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

Tres a cinco obras diferentes, tarjetas horizontales: imagen izquierda compacta, título completo, autor opcional verificado, temática, resumen original y justificación real, enlace LINK discreto pero táctil. Sin precios, descuentos, promociones, stock, carrito, compra ni porcentajes psicológicos. No recopilar valores comerciales.

## Responsive y aceptación

Mobile-first desde 320 px; probar 320/375/390/768/1024/1440, ambas orientaciones y texto 200%. Sin desbordamiento horizontal, superposición o truncamiento. Teclado, foco, contraste, controles 48 px, sin hover necesario. iOS Safari/Android Chrome reales si disponibles: si no, pendientes con instrucciones. Tests automáticos: integridad, seis áreas, autores, cobertura, selección de diez únicas, conservación/cambio de respuestas, recálculo, filtro, 3–5 únicas, relevancia, enlaces, imágenes, reinicio y dobles toques.

## Entrega

Documentación AGENTS, REQUIREMENTS, PLAN, STATUS y README. Git público match-conjunciones con descripción autorizada; exclusiones antes de commit, commits por etapas y push final. No secretos ni recursos restringidos. Build dist y artifacts/match-conjunciones-siteground.zip con index.html en raíz y todas las imágenes. Probar raíz/subcarpeta. Publicación manual SiteGround pendiente de URL, HTTPS y comprobación externa. No esperar URL para desarrollar.
