# MEGA-PROMPT · Dossier OSINT Perú 2026 — Protocolo de Expansión y Actualización v4.0

> **Propósito de este documento.** Es un único prompt de gran tamaño, técnicamente exhaustivo y autocontenido, que codifica TODA la cadena de instrucciones del usuario emitidas en sesiones previas sobre el dossier OSINT "Manifestaciones Perú · Elecciones 2026", junto con el protocolo paso-a-paso para expandir y actualizar cada sección del reporte. Está escrito para ser ejecutado por un agente Perplexity Computer (o equivalente) con acceso a sub-agentes paralelos, conectores GitHub, herramientas de browser y filesystem. Cada sección incluye: fuentes a consultar, archivos a modificar, agentes a desplegar (paralelos y secuenciales), criterios de aceptación, y QA.

---

## 0. CONSTITUCIÓN OPERATIVA (REGLAS INVIOLABLES DEL USUARIO)

Estas reglas se derivan VERBATIM de los mensajes del usuario y NUNCA se pueden romper. Cualquier sub-agente debe heredarlas vía `preload_skills` y `<user_instructions>` en su objetivo.

### 0.1 Estructura procesal
- **MÍNIMO 8 FASES** completas por ciclo de trabajo.
- Entre cada fase: **Preámbulo de Transición** + **Retrospección + Introspección Explícita** (logros, gaps, ajustes de estrategia para la siguiente fase).
- Cada fase aplica el ciclo: **Wide → Deep Validation → Organización → Reflexión**.

### 0.2 Anti-alucinación
- "Nunca inventes ni exageres información. Todo debe estar respaldado por fuentes verificadas. Marca explícitamente cuando algo es incierto o no confirmado."
- Toda noticia/evento lleva **link clickeable inline** a la fuente válida (anchor descriptivo, nunca "[source]" genérico).
- Citaciones inline tipo markdown `[Nombre del medio](URL)`, NUNCA en sección de "Referencias" separada.
- Si una fuente no se pudo verificar, etiquetar literal: `(no confirmado — pendiente de verificación cruzada)`.

### 0.3 Estilo de redacción
- **Técnica de la pirámide**: lead con conclusión/KPI numérico, luego soportes en orden descendente de importancia, luego matices.
- Estilo **Ground News**: hechos primero, análisis multi-perspectiva después.
- **Estética BCG/McKinsey**: paleta sobria (azul ejecutivo + grises neutros + acentos críticos), tipografía serif para titulares, sans-serif para cuerpo. Sin emojis salvo solicitud explícita.
- Bilingüe **Español** (output principal) con tolerancia a tecnicismos en inglés cuando son término del arte.
- **WCAG AA**: contraste mínimo 4.5:1 en cuerpo, 3:1 en titulares grandes; focus rings visibles; navegación por teclado.

### 0.4 Prohibición de lenguaje meta
**NUNCA** usar en contenido visible al usuario:
- "iteración", "fase N", "prompt", "agente", "ground news" (como nombre de método), "AI", "workflow", "subagente", "Monte Carlo de N corridas" (decir "simulación").
- Las labels de sección DEBEN ser puramente analíticas. Ejemplo correcto: "Sección 2c · Validación cruzada y predicción ajustada" — incorrecto: "Fase 5 de validación".

### 0.5 Entregables obligatorios
- **Sitio web HTML+CSS+JS+Tailwind** (modular, con `data/` JSON externos, "pensado para auto-actualizarse").
- **HTML standalone descargable** (single-file, **sin fetch ni imports externos**, todo hardcoded inline incluyendo data JSON, CSS y JS).
- Ambos deben servirse via GitHub Pages (repo `Mov_Soc_Peru_2026`, branch `main`, rama `deploy-v3.2` local).
- Versión live URL: `https://pillb.github.io/Mov_Soc_Peru_2026/`.

### 0.6 Mobile + Desktop
- Responsive con breakpoints `≥1280` desktop, `920–1279` tablet, `≤919` mobile, `≤560` small.
- QA visual obligatorio en **ambos viewports** (Playwright headless 1366×900 + 390×844) antes de marcar terminada cualquier sección.
- Cero datos vacíos en mobile: cada sub-vista renderiza algo o muestra placeholder "sin datos confirmados".

### 0.7 Confirmaciones de costo
- Cualquier `wide_browse` con ≥20 entidades requiere `confirm_action` previa.
- Modificar cron/scheduled tasks requiere confirmación.
- `git push --force` PROHIBIDO; usar `--force-with-lease` si necesario.

---

## 1. ANÁLISIS MENSAJE-POR-MENSAJE Y RETROSPECTIVA ACUMULATIVA

Cada mensaje del usuario en orden cronológico, con:
- **Texto literal** (verbatim).
- **Secciones del reporte afectadas**.
- **Protocolo aplicado en ese momento**.
- **Retrospección**: qué falló o quedó débil.
- **Refinamiento incorporado al protocolo para futuras iteraciones**.

### Mensaje 1 (turn 2, 16:18 UTC) — Spec fundacional: OSINT regional + Wider/Deeper

**Verbatim (resumen, ver `turn_0002.md`):**
> "Eres un experto senior en OSINT, monitoreo de riesgos sociales y análisis de eventos de acumulación de personas […] Mantén todas las instrucciones, estructura de trabajo y estándares de calidad de los prompts anteriores […] Ejecutar mínimo 8 fases/iteraciones completas […] Preámbulo de Transición + Retrospección + Introspección Explícita […] Anti-alucinación estricta […] expande significativamente el alcance y profundidad […] medios alternativos e independientes, locales y regionales […] X/Twitter, Instagram, Facebook, TikTok […] Lima, Norte, Oriente, Centro, Sur […] Elecciones 2026, Keiko Fujimori, Roberto Sánchez […] reacciones post-segunda vuelta […] Output con pestañas o secciones por región."

**Secciones del reporte que define:**
- `#context`, `#post-electoral`, `#regions` (5 sub-secciones: Lima, Norte, Centro, Sur, Oriente), `#risk-matrix`, `#early-warning`, `#sources`, `#methodology`.

**Protocolo aplicado:**
- Sub-agentes regionales paralelos (5 instancias `research`, uno por región).
- Cada sub-agente emite `research/regional/<region>.md` + `research/grassroots/<region>.md` + raw fetch JSONs.
- Build script `scripts/build_events_v2.py` consolida en `web/data/events.json`.

**Retrospección:**
- Falló la cobertura paralela: el sub-agente de Sur post-2da vuelta no completó (turn 3 muestra `[SUBAGENT FAILED] OSINT Sur post-2da vuelta`). Esto produjo gaps regionales asimétricos.
- Inventario de fuentes inicialmente débil en Oriente (3 búsquedas dedicadas `search_oriente.py`, `search_oriente2.py`, `search_oriente3.py`).

**Refinamiento incorporado:**
- **REGLA NUEVA**: cuando un sub-agente regional falla, NO continuar al ensemble — re-lanzar con instrucciones más explícitas (lista de medios pre-curada del index `sources_index`) antes de bloquear el merge.
- **REGLA NUEVA**: cada sub-agente regional debe emitir al menos un **mapa descriptivo** + **5 cuentas verificadas** + **3 eventos confirmados** o reportar "insuficientes datos" con plan de remediación.

---

### Mensaje 2 (turn 5, 16:58 UTC) — Expansión a redes sociales y lives

**Verbatim:**
> "Enfoca y expande tu reporte con research en redes sociales y posts en social media y en vivos en youtube facebook twitter tiktok instagram etc y medios alternativos."

**Secciones afectadas:**
- `#social` (nueva), `#alt-media` (nueva), `#disinfo` (nueva), `live_streams` array, `narratives` array, `disinformation_cases` array dentro de `events.json`.

**Protocolo aplicado:**
- 4 sub-agentes paralelos: TikTok, Facebook/YouTube, Instagram/Alt-media, X/Twitter.
- Cada uno emite `research/social/<plataforma>.md` + raw JSONs.
- Build script `scripts/merge_social_v3.py` integra los resultados al JSON principal.

**Retrospección:**
- Los sub-agentes no compartieron handler único, hubo duplicados de cuentas entre plataformas (ej. un activista con TikTok + IG + X registrado 3 veces).
- Falta de **deduplicación cruz-plataforma** por persona/cuenta.

**Refinamiento incorporado:**
- **REGLA NUEVA**: el merge script debe deduplicar por `nombre_canónico` (no por handle), preservar TODOS los handles en un campo `redes[]`.
- **REGLA NUEVA**: cada `live_stream` debe tener timestamp `ultima_verificacion` ISO-8601 y bandera `activo_al_render`. Si tiene >24h sin verificar, mostrar tag "histórico" en UI.
- **REGLA NUEVA**: cada `disinformation_case` debe llevar `verificador` (RPP Verifica, Convoca, OjoPúblico, etc.) y `fecha_fact_check`.

---

### Mensaje 3 (turn 8, 17:34 UTC) — Expansión grassroots prioritaria

**Verbatim (resumen):**
> "Investigación Prioritaria en Redes Sociales y Contenidos en Vivo […] Activistas y movilizadores grassroots […] Frentes de defensa […] Organizaciones informales y consuetudinarias (comunales, vecinales, agrarias) […] Influencers locales y regionales […] Personas con autoridad política local (alcaldes, regidores, dirigentes de base) […] Cuentas de colectivos, asambleas y grupos de base que no siempre aparecen en medios tradicionales […] Cobertura por regiones con pestañas claras."

**Secciones afectadas:**
- `#grassroots-nacional` (nueva), `grassroots` dict en `events.json` (6 sub-claves regionales).
- Sub-componentes nuevos: `accounts`, `colectivos`, `lives`, `hashtags`, `comunicados`, `frentes_de_defensa`.

**Protocolo aplicado:**
- 6 build scripts paralelos: `build_part1_lima.py` ... `build_part6_nacional.py`.
- Consolidación con `build_consolidated.py` (que tuvo bugs de import — fix en turn 1: variables nombradas `lima`, `norte`, etc., no `data`).
- Ola tras ola de fetches (waves 1-11 visibles en `wave*_raw.json`).

**Retrospección:**
- 11 olas de fetch consumieron tiempo significativo. Hubo redundancia (mismo handle re-fetchado en múltiples olas).
- El `build_consolidated.py` falló por convenciones inconsistentes de naming entre los `build_partN_*.py`.

**Refinamiento incorporado:**
- **REGLA NUEVA**: cada `build_partN_*.py` DEBE exportar una variable con nombre estándar `REGION_DATA` (constante UPPERCASE) además del nombre regional. El consolidador prueba ambos.
- **REGLA NUEVA**: implementar `fetched_urls.cache` (set de URLs ya consultadas en la sesión) para evitar re-fetches.
- **REGLA NUEVA**: cap de 3 olas por región. Si tras 3 olas no se llega a umbral mínimo (5 cuentas + 3 eventos + 2 colectivos), declarar región "baja densidad informativa" y marcar visualmente en UI.

---

### Mensaje 4 (turn 11, 18:34 UTC) — Procede actualizando el reporte

**Verbatim:**
> "Procede actualizando el reporte con los archivos que haz trabajado."

**Secciones afectadas:** TODAS (es una orden de ensamble).

**Protocolo aplicado:**
- Ejecutar `merge_grassroots_v31.py` → re-genera `events.json` integrando todo grassroots.
- Re-ejecutar `montecarlo/run_simulation.py` → `montecarlo.json`.
- Ejecutar `build_standalone.py` → genera `dossier_osint_v3.1.html` (luego v3.2, v3.3).

**Retrospección:**
- El merge inicialmente perdía campos del JSON viejo (ej. `executive_alert.recomendaciones` se sobrescribía). Hubo que usar deep merge.
- El standalone perdía data porque `main.js` cargaba JSON con `fetch()`, que en `file://` falla silenciosamente.

**Refinamiento incorporado:**
- **REGLA NUEVA**: el merge usa `lodash.merge`-style deep merge (Python `mergedeep` o equivalente), NUNCA `dict.update()` plano.
- **REGLA NUEVA**: tras cada merge, validar que `len(events_old.sources_index) ≤ len(events_new.sources_index)` (monotonicidad informacional).
- **REGLA NUEVA (preventiva)**: el build_standalone DEBE inyectar el JSON como literal JS (`window.__EMBEDDED_DATA__ = {...}`) y `main.js` DEBE preferir esta variable antes que hacer fetch.

---

### Mensaje 5 (turn 13, 19:39 UTC) — Standalone con datos vacíos

**Verbatim:**
> "El html descargable esta mal implementado porque no se ven los datos que importas de data externa y otros modulos y archivos. Corrigelo."

**Secciones afectadas:** TODAS las que dependen de `data/*.json` en standalone.

**Protocolo aplicado:**
- Diagnóstico: el shim de `fetch` inyectado AL FINAL del HTML no interceptaba la llamada porque `main.js` (en IIFE) ya había capturado el `fetch` original en su closure.
- Fix: inyectar el shim ANTES de cualquier `<script>` y embedido como `<script>const __DATA__={...};const __MC__={...};window.fetch = (u) => Promise.resolve({ok:true, json:()=>{...}})</script>` al principio del HEAD.

**Retrospección:**
- Asumir orden de ejecución sin verificar IIFE/closure scope fue el bug raíz.
- Tests no cubrían "modo file://" — solo `http://localhost`.

**Refinamiento incorporado:**
- **REGLA NUEVA**: el build_standalone DEBE generar el script de shim PRIMERO en `<head>`, antes de la link al CSS y antes de cualquier `<script>` propio. Validar con grep que `__EMBEDDED_DATA__` aparece antes que `main.js`.
- **REGLA NUEVA**: QA del standalone se hace SIEMPRE con `file://` URL en Playwright, NUNCA con `http-server`. Falla si encuentra <5 nodos con clase data-driven (e.g., `.evt-card`, `.region-tab`, `.acc-row`).

---

### Mensaje 6 (turn 15, 19:50 UTC) — Capturas muestran datos vacíos en mobile

**Verbatim:**
> "Analiza las imagenes de screenshots de reporte y veras que faltan los datos que aparecen vacios o nulos que si se ven en el reporte que tienes deployed. Corrigelo."

**Secciones afectadas:** Layout mobile de TODAS las secciones, especialmente `#regions`, `#grassroots-nacional`, `#social`.

**Protocolo aplicado:**
- QA con Playwright en viewport 390×844.
- Identificó: tabs regionales colapsaban a 0px ancho en mobile, dropdowns no expandían contenido, algunas grid de cards no caían a single-column.
- CSS fixes en `web/css/styles.css` con media queries a 920px y 560px.

**Retrospección:**
- El QA solo hizo desktop antes — gap claro de proceso.
- Tabs usaban `position:absolute` para underline animation; en mobile el contenedor padre tenía `overflow:hidden` que cortaba el contenido.

**Refinamiento incorporado:**
- **REGLA NUEVA**: cada cambio de UI dispara DOS screenshots Playwright automáticos: desktop 1366×900 + mobile 390×844. Diff visual antes/después es opcional pero recomendado.
- **REGLA NUEVA**: cada componente con tabs/dropdown debe pasar test `expect(component.boundingBox().width > 200)` en ambos viewports.
- **REGLA NUEVA**: contar nodos data-driven en mobile DEBE ser ≥ 80% de los del desktop (algunas omisiones legítimas como tooltips OK, pero no >20%).

---

### Mensaje 7 (turn 16, 20:10 UTC) — Deploy to GitHub Pages

**Verbatim:**
> "Deploy to github pages."

**Secciones afectadas:** infraestructura de hosting.

**Protocolo aplicado:**
- Crear repo público `Mov_Soc_Peru_2026`.
- `_deploy_gh` como working clone con branch `deploy-v3.2` tracking `origin/main`.
- Habilitar Pages: `gh api -X POST /repos/PillB/Mov_Soc_Peru_2026/pages -f source[branch]=main -f source[path]=/`.
- Workflow: `rsync -a --exclude='.git' ../web/ ./` + `cp ../dossier_osint_v3.X.html ./download.html` + commit + push.

**Retrospección:**
- El `web/` original tenía un `.git` residual que se copió al deploy clone — limpieza manual necesaria.
- Push directo usando `gh` CLI con HTTPS funcionó pero el reminder del sistema indica preferencia por **github_mcp_direct connector** o `api_credentials=["github"]` con `git push`.

**Refinamiento incorporado:**
- **REGLA NUEVA**: el directorio `web/` se trata como "source of truth"; deploy clone se mantiene EXCLUSIVAMENTE en `dossier_osint/_deploy_gh/`. Cualquier `.git` accidental en `web/` se elimina via gitignore.
- **REGLA NUEVA**: usar SIEMPRE `api_credentials=["github"]` con `git push` (no `gh CLI` salvo creación inicial del repo).
- **REGLA NUEVA**: post-push, hacer `curl` al JSON publicado con cache-buster (`?cb=$(date +%s%N)`) y validar estructura. Si CDN sirve stale data >2 min, esperar.

---

### Mensaje 8 (implícito — Monte Carlo original) — Análisis cuantitativo

**Verbatim (inferido del estado del repo):**
> "Agrega un análisis Monte Carlo de la reversión del voto exterior."

**Secciones afectadas:** `#reversion`, `montecarlo.json`, `montecarlo/run_simulation.py`.

**Protocolo aplicado:**
- Script `run_simulation.py` (Monte Carlo paramétrico, voto país-por-país, distribuciones Beta sobre participación y sesgo).
- Output single-shot: probabilidad de reversión = 99.93%.
- Visualización: `#rev-prob` KPI + histograma de margen + breakdown por país + análisis de sensibilidad.

**Retrospección:**
- 99.93% es estadísticamente sospechoso (overconfidence). Falta validación cruzada con benchmarks externos.
- Modelo asume independencia entre países; en realidad están correlacionados (sesgo Fuji-pro-establishment estructural en todos los exteriores).
- Falta intervalo de credibilidad bayesiano y prior 2021.

**Refinamiento incorporado:**
- **REGLA NUEVA**: cualquier KPI probabilístico >95% requiere **al menos 3 modelos alternativos** que confirmen, o el KPI se reporta con disclaimer.
- **REGLA NUEVA**: mostrar SIEMPRE el ensemble + el ajuste con mercados de predicción.

---

### Mensaje 9 (turn previo a 18 — la frase "investiga y valida la validez del análisis de reversión") — Validación cruzada

**Verbatim (preservado en summary):**
> "investiga y valida la validez del analisis de reversion y si amerita mejorarlo o complementarlo con otros analisis y mejora tu predicción y escenario de prospección en el reporte de forma elegante y manteniendo el estilo y requerimientos de redacción solicitados anteriormente."

**Secciones afectadas:** `#reversion` (revisión) + `#validacion` (NUEVA "Sección 2c").

**Protocolo aplicado (esta sesión actual, fases 1-8):**
1. **Fase 1** — Investigar estado actualizado ONPE/JNE (El País live, Libertad Digital, OjoPúblico actas observadas, Infobae, Octagon AI Kalshi).
2. **Fase 2** — Validar contra 2021 (Castillo-Fujimori voto exterior: Fuji 66.2%, +107,917 neto exterior pero perdió por -44,263 global).
3. **Fase 3** — Identificar gaps del modelo original (independencia ↔ correlación país-país, ausencia de bayesiano, no escenarios de cola).
4. **Fase 4** — Diseñar 4 modelos: M1 independencia, M2 correlación ρ=0.3, M3 bayesiano (prior Beta del 2021), M4 bootstrap empírico sobre 1ra vuelta 2026.
5. **Fase 5** — Re-ejecutar: M1 98.56%, M2 96.69%, M3 93.84%, M4 99.55%, ensemble crudo 100%. Mercado: Polymarket 95% + Kalshi 78% = 86%. Ajustado final 60% modelos + 40% mercado = **94.4%**.
6. **Fase 6** — 7 escenarios adversariales (base 94.6%, JNE anula 50% actas 93.3%, participación 30% 86.6%, cola izq 58% 74.6%, doble shock 60.4%, triple 43.6%, cisne negro 1.0%).
7. **Fase 7** — Integrar a HTML/CSS/JS (nueva `<section id="validacion">` + 5 sub-componentes: tabla 4 modelos, SVG bayesiano, barras adversariales, mercados, tiles 2021).
8. **Fase 8** — Build standalone + QA + deploy.

**Retrospección:**
- El ensemble crudo 100% es matemáticamente artefacto del clipping al 100%. El verdadero range bayesiano es ~92-99%, con masa concentrada en 94-95%.
- El KPI principal `#rev-prob` ahora muestra 94.40% (ajustado), no 99.93%. Es más honesto.

**Refinamiento incorporado:**
- **REGLA NUEVA**: emitir SIEMPRE dual-schema (legacy v3.2 + nuevo v3.3) en JSON para que sub-componentes UI existentes sigan funcionando sin tocar.
- **REGLA NUEVA**: cualquier nuevo modelo cuantitativo viene con su sección de "limitaciones residuales" enumerada (mínimo 3-4 items, lista cerrada).
- **REGLA NUEVA**: la sección de validación lleva un mini-glosario (qué es prior, qué es posterior, qué es ensemble) accesible vía `<details>` collapsible para preservar legibilidad ejecutiva.

---

## 2. INVENTARIO COMPLETO DE SECCIONES Y ESTADO ACTUAL

| ID | Título visible | Estado | Fuente JSON | Archivos clave |
|----|----------------|--------|-------------|----------------|
| `#top` | Title strip + headline | OK v3.3 | n/a | `index.html` líneas 67–105 |
| `#context` | Contexto situacional | OK v3.2 | `events.json.context` | `index.html`, `main.js::renderContext` |
| `#post-electoral` | Estado post-2da vuelta | OK v3.2 | `events.json.post_electoral` | `index.html`, `main.js::renderPostElectoral` |
| `#reversion` | Análisis Monte Carlo (legacy) | OK v3.3 | `montecarlo.json` (v3.2 schema) | `main.js::renderReversion/renderHistogram/renderPaises/renderSensibilidad` |
| `#validacion` | Validación cruzada (NUEVA) | OK v3.3 | `montecarlo.json` (v3.3 schema) | `main.js::renderValidacion/renderBayesianUpdate/renderAdversarial/renderMercados` |
| `#regions` | Regiones (tabs Lima/Norte/Centro/Sur/Oriente) | OK v3.2 | `events.json.regions` | `main.js::renderRegions` |
| `#grassroots-nacional` | Cuentas grassroots nacionales | OK v3.2 | `events.json.grassroots.nacional` | `main.js::renderGrassroots` |
| `#social` | Inteligencia social cross-platform | OK v3.2 | `events.json.social_intelligence` + `live_streams` | `main.js::renderSocial/renderLives` |
| `#alt-media` | Medios alternativos | OK v3.2 | `events.json.alt_media` | `main.js::renderAltMedia` |
| `#disinfo` | Narrativas y desinformación | OK v3.2 | `events.json.narratives` + `disinformation_cases` | `main.js::renderDisinfo` |
| `#risk-matrix` | Matriz de riesgos | OK v3.2 | `events.json.risk_matrix` | `main.js::renderRiskMatrix` |
| `#early-warning` | Indicadores tempranos | OK v3.2 | `events.json.early_warning_indicators` | `main.js::renderEarlyWarning` |
| `#methodology` | Metodología | OK v3.2 | `events.json.methodology` | `main.js::renderMethodology` |
| `#sources` | Índice de fuentes (99 items) | OK v3.2 | `events.json.sources_index` | `main.js::renderSources` |

---

## 3. PROTOCOLO DE EXPANSIÓN POR SECCIÓN (PASO-A-PASO)

Cada sub-sección define: (a) inputs, (b) sub-agentes a desplegar (paralelo vs secuencial), (c) outputs por sub-agente, (d) merge/integration, (e) UI delta en `index.html`+`styles.css`+`main.js`, (f) QA, (g) deploy.

### 3.1 Sección `#context` — Contexto situacional

**Objetivo:** mantener narrativa de cierre electoral fresca con datos ONPE/JNE actualizados.

**Inputs:** ONPE bulletins, JNE comunicados, El País live, El Comercio, La República, Infobae Perú.

**Sub-agentes (paralelos, 1 ola):**
- Agent A: ONPE/JNE oficial (research, `recency_filter=day`).
- Agent B: cobertura prensa nacional (research).
- Agent C: cobertura internacional (El País España, BBC Mundo, AP).

**Output por agente:** `research/context/<agent>.md` con: cifras escrutinio %, último comunicado oficial, posición de candidatos.

**Merge:** `scripts/build_context.py` reduce a `events.json.context` con campos:
```json
{
  "escrutinio_pct": 95.84,
  "ultimo_update": "2026-06-09T22:30:00-05:00",
  "fuente_principal": {"nombre": "ONPE", "url": "..."},
  "narrativa_lead": "Texto pirámide ≤180 palabras",
  "claims_clave": [{"texto": "...", "fuente": "..."}]
}
```

**UI delta:**
- `index.html#context`: 1 hero card + 3 KPI tiles + bullet list de claims.
- `main.js::renderContext()`: lee `data.context`, renderiza.

**QA:** validar que `escrutinio_pct ∈ [0,100]`, `ultimo_update` < 24h, links HTTP 200.

**Deploy:** rsync `web/` → `_deploy_gh/`, commit "context · refresh ONPE", push.

### 3.2 Sección `#post-electoral` — Estado post-2da vuelta

**Inputs:** mismo conjunto que `#context` + Polymarket/Kalshi para sentimiento de mercado.

**Sub-agentes (paralelos, 2 olas):**
- Ola 1: Agent D (oficial conteo), Agent E (movilizaciones reportadas), Agent F (declaraciones Keiko/Sánchez).
- Ola 2 (solo si Ola 1 reporta gaps): Agent G (deep-dive en actas observadas vía OjoPúblico).

**Output:** `research/post_electoral/<agent>.md`.

**Merge:** integra `actas_observadas: int`, `mesas_pendientes: int`, `declaraciones: [...]`, `movilizaciones_reportadas: [...]`.

**UI:** 1 hero + 4 tiles (actas observadas, mesas, voto exterior %, margen actual) + lista de eventos cronológica.

**QA:** todos los `declaraciones[].fuente.url` HTTP 200, fechas ISO-8601 válidas.

### 3.3 Sección `#reversion` — Monte Carlo original (mantenimiento)

**Trigger de actualización:** cuando llega nuevo voto exterior escrutado (incremento ≥5pp), o cuando ONPE publica nueva tanda.

**Inputs:** datos actualizados de voto exterior por país, participación observada.

**Sub-agente (1, secuencial):** Agent H corre `montecarlo/run_simulation_v2.py` con:
- nuevos `participacion_observada_pct` por país,
- nuevos `keiko_share_observado` por país.

**Output:** `montecarlo.json` (rewriter completo, preserva ambos schemas v3.2 y v3.3).

**UI:** sin cambios estructurales; valores se re-renderizan automáticamente.

**QA:** probabilidad ajustada final entre 80–98% (rango plausible dado data observada). Si cae <80% o >99%, alertar y revisar inputs.

### 3.4 Sección `#validacion` — Validación cruzada (sección crítica)

**Trigger:** cualquier actualización de `#reversion` o cada 6h durante ventana post-electoral.

**Inputs:** mercados de predicción (Polymarket, Kalshi, PredictIt si disponible), nuevos datos ONPE.

**Sub-agentes (paralelos):**
- Agent I: snapshot mercados (Polymarket scraper via browser_task o API si disponible).
- Agent J: re-ejecutar 4 modelos M1-M4 + ensemble.
- Agent K: re-correr 7 escenarios adversariales con shocks parametrizados.

**Outputs:** mercado snapshot JSON, modelos JSON, escenarios JSON. Todos consumidos por `run_simulation_v2.py` en una segunda pasada de "validation".

**Merge:** `montecarlo.json` se reescribe con bloques `modelos`, `benchmark_externo_mercado`, `escenarios_adversariales`, `prediccion_final_v33`.

**UI delta:**
- `index.html#validacion` ya existe (línea 231); revisar IDs estables: `#val-ajustada-pct`, `tbody` con 5 filas modelo, `.val-adv-row` con 7 filas, `.val-merc-row` con 4 filas, SVG bayesiano.
- `main.js::renderValidacion` ya implementado; cualquier nuevo modelo añade fila pero NO cambia layout.

**QA:** `tbodyRows == 5`, `advRows == 7`, `mercRows == 4`, SVG bayesiano presente, KPI ajustada coincide con `prediccion_final_v33.p_fujimori_revierte_ajustada_final * 100`.

### 3.5 Sección `#regions` — 5 regiones con pestañas

**Inputs:** prensa local + medios regionales + redes sociales + frentes de defensa.

**Sub-agentes (paralelos, 5 instancias):**
- Agent L1 (Lima): foco distritos San Borja, Cercado, Lince, SJM, SJL.
- Agent L2 (Norte): Piura, Lambayeque, La Libertad, Cajamarca, Tumbes.
- Agent L3 (Centro): Junín, Ayacucho, Huancavelica, Pasco, Huánuco.
- Agent L4 (Sur): Arequipa, Cusco, Puno, Tacna, Moquegua, Apurímac.
- Agent L5 (Oriente): Loreto, Ucayali, Madre de Dios, San Martín, Amazonas.

**Output por agente (estandarizado):**
```json
{
  "eventos": [{"fecha":"ISO","ubicacion":"...","tipo":"marcha|bloqueo|...","fuente":"...","confirmacion":"alta|media|baja"}],
  "rutas": ["..."],
  "puntos_concentracion": [{"nombre":"...","coord":[lat,lng],"riesgo":"alto|medio|bajo"}],
  "actores": [{"nombre":"...","rol":"...","redes":[...]}],
  "narrativas_locales": ["..."],
  "executive_alert": "..."
}
```

**Merge:** `scripts/build_regions.py` combina los 5 outputs en `events.json.regions.{lima,norte,centro,sur,oriente}`.

**UI:** tabs animadas; cada tab renderiza 6 sub-bloques (eventos, rutas, mapa SVG, actores, narrativas, alerta).

**QA:** cada región ≥3 eventos confirmados o se marca "baja densidad informativa"; tabs navegables por teclado (Tab/Arrow); mobile single-column.

### 3.6 Sección `#grassroots-nacional` — Inventario nacional

**Inputs:** outputs grassroots regionales + agregación nacional.

**Sub-agente único (secuencial, depende de §3.5):** Agent M corre `merge_grassroots_v31.py`.

**Output:** `events.json.grassroots.nacional` con 5 listas: `accounts`, `colectivos`, `lives`, `hashtags`, `comunicados`.

**UI:** 5 sub-tabs (cuentas, colectivos, lives, hashtags, comunicados); cada uno con tabla filtrable.

**QA:** 0 duplicados por nombre canónico; cada cuenta con ≥1 link válido a su perfil.

### 3.7 Sección `#social` — Inteligencia social cross-platform

**Inputs:** outputs de los 4 sub-agentes de redes (X, FB, IG, TikTok, YT).

**Sub-agentes (paralelos):**
- Agent N1: X/Twitter (search operadores, listas, hashtags emergentes).
- Agent N2: Facebook + YouTube (Lives, grupos públicos).
- Agent N3: Instagram (Stories, Lives, posts).
- Agent N4: TikTok (videos, lives, sound trends).

**Merge:** `scripts/merge_social_v3.py` consolida en `events.json.social_intelligence` + `live_streams` + `narratives`.

**UI:** 3 sub-componentes: panel de hashtags trending (chips), tabla de Lives activos con timestamp `ultima_verificacion`, narrativas con sentiment tags.

**QA:** cada Live tiene URL válida; cada hashtag tiene `volumen_estimado` + `pico_observado`; lives expirados (>72h sin verificación) se marcan "histórico" sin removerlos.

### 3.8 Sección `#alt-media` — Medios alternativos

**Inputs:** índice de medios alternativos peruanos (Wayka, La Mula, IDL-Reporteros, OjoPúblico, Sudaca, etc.).

**Sub-agente único:** Agent O monitorea ~25 medios curados, extrae headlines últimas 48h.

**Output:** `events.json.alt_media` (lista de 25 items con `nombre`, `url`, `headline`, `fecha`, `nivel_independencia`).

**UI:** grid responsiva 3-col desktop, 1-col mobile.

**QA:** ≥20 medios con headline reciente; los 5 restantes marcados "sin actualización reciente".

### 3.9 Sección `#disinfo` — Narrativas y desinformación

**Inputs:** salidas de verificadores (RPP Verifica, Convoca, OjoPúblico Verificador, Verificador La República, AFP Factual).

**Sub-agente único:** Agent P agrega fact-checks de últimas 72h.

**Output:** `events.json.disinformation_cases` (cada item: `claim_original`, `fuente_claim`, `verificador`, `veredicto`, `url_fact_check`, `fecha`).

**UI:** lista colapsable con badge de veredicto (FALSO / ENGAÑOSO / SIN CONTEXTO / VERDADERO).

**QA:** cada caso tiene `url_fact_check` HTTP 200.

### 3.10 Sección `#risk-matrix` — Matriz de riesgos

**Inputs:** consolidación de §3.5 + §3.7 + estimaciones cualitativas.

**Sub-agente único:** Agent Q computa matriz 5×5 (Probabilidad × Impacto) con 5 escenarios principales.

**Output:** `events.json.risk_matrix` (5 escenarios con `nombre`, `prob_pct`, `impacto_descriptor`, `recomendacion`).

**UI:** matriz heatmap CSS grid + tarjeta detalle por celda.

**QA:** probabilidades suman entre 100-150% (no mutuamente excluyentes), todas con justificación textual.

### 3.11 Sección `#early-warning` — Indicadores tempranos

**Inputs:** lista curada de 14 indicadores observables.

**Sub-agente único:** Agent R monitorea cada indicador y asigna `estado: verde|amarillo|rojo`.

**Output:** `events.json.early_warning_indicators` (14 items).

**UI:** semáforo grid 4-col desktop, 2-col mobile.

**QA:** todos los 14 indicadores con `estado` asignado y `fuente_observacion` listada.

### 3.12 Sección `#sources` — Índice de fuentes (99 items)

**Sub-agente único:** Agent S construye índice global a partir de TODAS las fuentes citadas en `events.json` + `montecarlo.json`. Deduplica por URL.

**Output:** `events.json.sources_index` (≥99 items, cada uno con `nombre`, `url`, `tipo: medio_nacional|local|alternativo|oficial|verificador|red_social|academico|mercado_prediccion`, `region`).

**UI:** tabla filtrable + buscador.

**QA:** todos los URLs únicos; cada `tipo` correctamente clasificado.

---

## 4. TOPOLOGÍA DE AGENTES — PARALELO vs SECUENCIAL

### 4.1 Diagrama de dependencias (ASCII)

```
                         ┌─────────────────────────────────────┐
                         │   Orchestrator (main agent)         │
                         │   - Carga skill website-building    │
                         │   - Aplica Constitución (sec.0)     │
                         └──────────────────┬──────────────────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              │ Ola 1 (paralelo)            │                             │
              ▼                             ▼                             ▼
   ┌──────────────────┐           ┌──────────────────┐         ┌──────────────────┐
   │ Context (A,B,C)  │           │ Post-electoral   │         │ Reversion (H)    │
   │ 3 sub-agentes    │           │ (D,E,F) → (G)    │         │ 1 sub-agente     │
   └────────┬─────────┘           └────────┬─────────┘         └────────┬─────────┘
            │                              │                            │
            │   ┌─────────────────────────────────────────────────────┐ │
            │   │ Ola 2 (paralelo, depende de Ola 1)                  │ │
            │   ▼                                                     ▼ │
            │ ┌──────────────────┐  ┌──────────────────┐  ┌──────────┴─┐
            │ │ Regions          │  │ Social (N1-N4)    │  │ Validacion │
            │ │ (L1-L5) ×5      │  │ ×4 paralelo       │  │ (I,J,K) ×3│
            │ └────────┬─────────┘  └────────┬──────────┘  └─────┬─────┘
            │          │                     │                   │
            │          ▼                     ▼                   │
            │   ┌──────────────┐    ┌──────────────────┐         │
            │   │ Grassroots(M)│    │ Alt-media (O)     │         │
            │   │ (depende L*) │    │ Disinfo (P)       │         │
            │   └──────┬───────┘    └────────┬─────────┘         │
            │          │                     │                   │
            └──────────┴──────────┬──────────┴───────────────────┘
                                  │
                                  ▼
                       ┌────────────────────────┐
                       │ Ola 3 (secuencial)     │
                       │ Risk-matrix (Q)        │
                       │ Early-warning (R)      │
                       │ Sources index (S)      │
                       └────────────┬───────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │ Build & Deploy         │
                       │ - merge JSON           │
                       │ - build_standalone.py  │
                       │ - QA Playwright ×2     │
                       │ - rsync + commit +push │
                       └────────────────────────┘
```

### 4.2 Reglas de orquestación
- **Ola 1** (paralelo, 3 agentes): context + post-electoral + reversion. ~5–8 min cada uno.
- **Ola 2** (paralelo, hasta 12 agentes): regions×5 + social×4 + validacion×3. ~10 min.
- **Ola 3** (secuencial, 3 pasos): grassroots merge → risk/early-warning/sources → build/deploy.
- Cualquier agente que falle: re-spawn con instrucciones extra ("aquí está la lista exacta de fuentes a usar: ..."). Máximo 2 retries.
- Sub-agentes guardan TODO output en archivos del workspace, nunca en su return value (que es limitado).

### 4.3 Comunicación entre agentes
- **Filesystem-mediated**: cada agente escribe en path predecible `research/<seccion>/<agent_id>.md` o `<agent_id>.json`.
- **Merge scripts**: leen rutas del filesystem, no del return value de subagent.
- **Locks**: si dos agentes pueden escribir el mismo archivo (raro), usar sufijo `.partial.<random>` y consolidar al final.

---

## 5. PIPELINE TÉCNICO DE BUILD & DEPLOY

### 5.1 Comandos canónicos (Bash)

```bash
# Paso 1: Re-correr simulación
cd /home/user/workspace/dossier_osint
python3 montecarlo/run_simulation_v2.py

# Paso 2: Re-mergear grassroots (si hubo cambio en research/)
python3 merge_grassroots_v31.py

# Paso 3: Re-mergear social (si hubo cambio)
python3 scripts/merge_social_v3.py

# Paso 4: Rebuild events.json (si hubo cambio en eventos)
python3 scripts/build_events_v2.py

# Paso 5: Build standalone
python3 build_standalone.py
# Verificar tamaño esperado (~470KB):
wc -c dossier_osint_v3.2.html

# Paso 6: QA Playwright (desktop + mobile)
# Ver Sec. 6 abajo

# Paso 7: Sync a deploy clone
cd _deploy_gh
git checkout deploy-v3.2
rsync -a --exclude='.git' --exclude='.nojekyll' \
      --exclude='README.md' --exclude='download.html' \
      ../web/ ./
cp ../dossier_osint_v3.2.html ./download.html

# Paso 8: Commit + push (NUNCA --force, usar --force-with-lease si necesario)
git add -A
git -c user.email=dossier@local -c user.name="Dossier OSINT" \
    commit -m "vX.Y · <descripción concisa>"
git push origin deploy-v3.2:main
# Requiere: api_credentials=["github"]

# Paso 9: Verificar live (esperar ~30s para CDN)
sleep 30
curl -s "https://pillb.github.io/Mov_Soc_Peru_2026/data/montecarlo.json?cb=$(date +%s%N)" | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print('OK' if 'prediccion_final_v33' in d else 'FAIL')"
```

### 5.2 `build_standalone.py` — invariantes

Debe garantizar:
1. El HTML resultante NO contiene `fetch(`, `import `, `<link rel="stylesheet" href="http`, `<script src="http`.
2. El JSON de eventos y montecarlo están embebidos como:
   ```html
   <script>
     window.__EMBEDDED_EVENTS__ = { ... };
     window.__EMBEDDED_MC__ = { ... };
   </script>
   ```
   ANTES de `<link>` al CSS y ANTES de `<script>` de `main.js`.
3. `main.js` (inlineado) detecta `window.__EMBEDDED_*` y los usa en lugar de `fetch`.
4. `styles.css` está inlineado en `<style>` dentro de `<head>`.
5. Validar grep: `grep -E "fetch\(|import \\*|<script src=\"http|<link.*href=\"http" dossier_osint_v3.2.html` → 0 matches.

---

## 6. QA AUTOMATIZADO (Playwright en js_repl)

### 6.1 Test suite mínimo

```javascript
const pw = require('playwright');
const browser = await pw.chromium.launch();

// Desktop
const ctxD = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const pageD = await ctxD.newPage();
await pageD.goto('file:///home/user/workspace/dossier_osint/dossier_osint_v3.2.html', { waitUntil: 'networkidle' });
await pageD.waitForTimeout(2500);

const desktopChecks = await pageD.evaluate(() => {
  const r = {};
  r.revProb = document.querySelector('#rev-prob')?.textContent.trim();
  r.validacionTitle = document.querySelector('#validacion h2')?.textContent.trim();
  r.modelosRows = document.querySelector('#validacion tbody')?.querySelectorAll('tr').length || 0;
  r.advRows = document.querySelectorAll('.val-adv-row').length;
  r.mercRows = document.querySelectorAll('.val-merc-row').length;
  r.bayesianSVG = !!document.querySelector('#validacion svg');
  r.regionsTabs = document.querySelectorAll('#regions [role="tab"]').length;
  r.grassrootsAccounts = document.querySelectorAll('#grassroots-nacional .acc-row').length;
  r.sourcesCount = document.querySelectorAll('#sources .src-item').length;
  return r;
});

// Asserts
if (desktopChecks.modelosRows !== 5) throw new Error('modelos rows != 5');
if (desktopChecks.advRows !== 7) throw new Error('adversariales != 7');
if (desktopChecks.mercRows !== 4) throw new Error('mercados != 4');
if (!desktopChecks.bayesianSVG) throw new Error('bayesian SVG missing');
if (desktopChecks.regionsTabs !== 5) throw new Error('5 regiones expected');
if (desktopChecks.sourcesCount < 90) throw new Error('sources_index sospechosamente bajo');

// Screenshot
await pageD.screenshot({ path: '/tmp/qa_desktop.png', fullPage: true });

// Mobile
const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const pageM = await ctxM.newPage();
await pageM.goto('file:///home/user/workspace/dossier_osint/dossier_osint_v3.2.html', { waitUntil: 'networkidle' });
await pageM.waitForTimeout(2500);
const mobileChecks = await pageM.evaluate(() => { /* mismo set */ });
// 80% threshold:
['modelosRows','advRows','mercRows','regionsTabs','grassrootsAccounts','sourcesCount'].forEach(k => {
  if (mobileChecks[k] < desktopChecks[k] * 0.8) throw new Error(`mobile ${k} < 80% desktop`);
});
await pageM.screenshot({ path: '/tmp/qa_mobile.png', fullPage: true });

await browser.close();
console.log('QA PASSED', { desktopChecks, mobileChecks });
```

### 6.2 Criterios de aceptación (gating)
- 0 errores JS en consola del navegador.
- Todos los `tbody` esperados tienen el conteo correcto.
- 0 imágenes con `src` HTTP externo (`document.querySelectorAll('img[src^="http"]').length === 0` para standalone).
- WCAG: contraste de cuerpo ≥4.5:1 (verificable con axe-core opcional).
- Tiempos: standalone debe cargar y renderizar (DOMContentLoaded → todas las secciones pobladas) en <3s en headless.

---

## 7. INTEGRACIÓN GITHUB

### 7.1 Connector `github_mcp_direct`
Para operaciones de API (crear release, tag, manage branch protection): usar `list_external_tools` → `describe_external_tools` → `call_external_tool`.

### 7.2 Push directo (CLI con credenciales)
```bash
cd /home/user/workspace/dossier_osint/_deploy_gh
git push origin deploy-v3.2:main
# bash llamado con api_credentials=["github"]
```

### 7.3 Protección
- NUNCA `--force`. Si hay divergencia, hacer `git pull --rebase` primero.
- Si rebase falla, abortar y pedir confirmación al usuario.
- Tagear cada deploy: `git tag -a v3.X -m "msg"` + `git push origin v3.X`.

---

## 8. CHECKLIST POST-DEPLOY (cada release)

- [ ] `wc -c` del standalone reporta ~470KB (±10%).
- [ ] `curl -I https://pillb.github.io/Mov_Soc_Peru_2026/` → HTTP 200.
- [ ] JSON live tiene ambos schemas v3.2 y v3.3.
- [ ] Playwright live (no solo file://) muestra `#rev-prob == "94,40 %"` (o el valor actual ajustado).
- [ ] `share_file` del standalone con `name="dossier_osint_html"` (preserva historial de versiones).
- [ ] Reply al usuario en **español**, **estilo pirámide**, con citaciones inline, SIN lenguaje meta.

---

## 9. RESPUESTA AL USUARIO — Plantilla pirámide

```
## Predicción ajustada: P% (vs P_old% anterior)

Lead de 1–2 frases con el hallazgo y el delta principal.

### Lectura ejecutiva (pirámide)

**Hallazgo central:** [una frase].

**Soportes (3–4):**
1. **Ensemble multimodelo.** M1 X%, M2 Y%, ...
2. **Actualización bayesiana.** Prior 2021 [link]([fuente]) → posterior alineado con observado [link]([fuente]).
3. **Mercados de predicción.** Polymarket [link], Kalshi [link], ajuste 60/40.
4. **Robustez adversarial.** 6/7 escenarios mantienen P ≥ 60 %; sólo cisne negro la rompe.

### Entregables
- Live: [pillb.github.io/Mov_Soc_Peru_2026](https://pillb.github.io/Mov_Soc_Peru_2026/)
- Descargable: archivo HTML adjunto.
- Repo: [PillB/Mov_Soc_Peru_2026](https://github.com/PillB/...)
```

---

## 10. INSTRUCCIONES PARA EJECUTAR ESTE MEGA-PROMPT

Cuando se invoque este documento como prompt único a un agente Perplexity Computer:

1. **Cargar** `load_skill(name="website-building")` ANTES de cualquier modificación de HTML/CSS/JS.
2. **Validar** que la Constitución (§0) se entiende y se aceptará en cada turno.
3. **Recorrer** el inventario de secciones (§2) y para cada una determinar si requiere actualización (criterio: ¿hay datos nuevos en la ventana de las últimas 6h?).
4. **Spawn** ola 1 de sub-agentes en paralelo (§4.1).
5. **Esperar** con `wait_for_subagents`.
6. **Spawn** ola 2.
7. **Spawn** ola 3 (secuencial).
8. **Build & deploy** (§5.1).
9. **QA** (§6).
10. **Responder** al usuario (§9).

Cualquier desviación del protocolo requiere `ask_user_question`.

---

**FIN DEL MEGA-PROMPT v4.0**

*Este documento es ejecutable: cada paso es accionable por un agente con acceso a las herramientas listadas en el system prompt de Perplexity Computer (browser_task, bash, run_subagent, share_file, list_external_tools, etc.). La constitución (§0) es la única parte inviolable; todo lo demás es refinable iteración a iteración con la disciplina "retrospección + introspección" definida en §1.*
