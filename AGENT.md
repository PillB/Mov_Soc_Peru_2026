# AGENT.md — Dossier OSINT Perú 2026

> Documento de mantenimiento para futuras sesiones. Lee esto **antes** de modificar el dossier.
> Última actualización: v3.7.0 (deep research round 1+2 — escrutinio realtime, +62 manifestaciones, ML forecast actualizado margen central +18.485 votos P(F)=98,5 %, +4 risk-matrix, +4 early-warning, bloque `escrutinio_realtime` + `prediccion_7dias`, 11 tests nuevos N40-N45 → 216/216, fixes formato es-PE en reversion/actas/paises/validacion + BLUF/forecast pct con coma decimal + espaciado %). Resumen v3.6.1 (Playwright QA pass — fixes header overlap banner mobile, brand v3.5→v3.6, ML KPI layout block-display, es-PE thousands separator manual, nav DOM-ordered, 7 new tests N39 → 205/205). Resumen v3.6.0: — 4 investigaciones paralelas (Lima/regiones/ML/narrativas→eventos) sumaron 56 manifestaciones nuevas a `convocatorias_futuras` (+20 Lima, +10 Norte, +9 Centro, +10 Sur, +7 Oriente), 8 nuevos actores Lima, 4 hashtags emergentes, 7 narrativas. Nuevo bloque `forecast_ml`: proyección margen final +1.886 votos Fuj (50,0052 %), IC95 [-10.419, +14.192], P(F)=57,3 %, P(S)=39,5 %, P(empate)=3,2 %, 5 escenarios, 5 drivers cuantificados, 10 assumptions, 11 fuentes. Nuevo bloque `bluf` arriba del fold: 6 KPIs + 6 manifestaciones críticas top + 3 things-to-watch con cross-ref a cuentas/hashtags. UX: secciones key (reversion, validación, alt-media, disinfo, risk-matrix, early-warning, fml-detail) ahora **cerradas por defecto** (pirámide BCG — resumen punchy visible, click para desplegar). Toggle 'Ocultar eventos pasados' en header — activado por defecto, persiste en `localStorage`, oculta 21+ entradas históricas en marchas/routes/matrix vía `body.hide-past [data-es-pasado="true"] { display:none }`. Tests 198/198 (N35 BLUF, N36 ForecastML, N37 hide-past, N38 foldables-closed, N21 bump 3.6.0).)

---

## 1. Arquitectura

```
dossier_osint/
├── web/                       ← fuente del sitio (GitHub Pages)
│   ├── index.html             estructura, slots <section> por bloque
│   ├── css/styles.css         ~2860 líneas, tokens + componentes
│   ├── js/
│   │   ├── main.js            ~2820 líneas, render orquestador
│   │   └── gazetteer.js       diccionario offline de coords PE + CORRIDORS (polylines de avenidas/carreteras)
│   ├── vendor/
│   │   ├── leaflet.min.js     1.9.4 (vendored, sin CDN)
│   │   └── leaflet.min.css
│   └── data/
│       ├── events.json        ÚNICA fuente de datos
│       └── montecarlo.json    distribución Monte Carlo (precomputada)
│
├── _deploy_gh/                clone del repo público (GitHub Pages)
├── build_standalone.py        inline-er → dossier_osint_v3.2.html
├── dossier_osint_v3.2.html    artefacto standalone (~1.4 MB)
├── tests/run_tests.js         smoke tests Playwright/Node
└── AGENT.md                   este archivo
```

**Pipeline**:
```
events.json (verdad)
   ↓
web/js/main.js (render)         ←→  web/css/styles.css
   ↓
build_standalone.py             (inlina vendor + js + css + data)
   ↓
dossier_osint_v3.2.html         (artefacto único, offline)
   ↓
_deploy_gh/ (rsync)             →  GitHub Pages
```

---

## 2. Shape de datos por región (heterogeneidad histórica)

`events.json` mezcla dos generaciones de esquemas. **Cada función render debe puentear ambos.**

### 2.1 Actores
| Región         | Campos                                                                   |
|----------------|--------------------------------------------------------------------------|
| lima, norte    | `{nombre, rol, posicion (token: oficialismo/oposicion/...), redes[], fuente}` |
| centro, sur, oriente | `{id, nombre, cargo, posicion (texto largo descriptivo), region, fuente}` |

**Heurística**: si `posicion` tiene espacios o >40 chars → es texto largo, no bando.

### 2.2 Eventos (eventos / convocatorias_futuras)
| Región         | Campos                                                                   |
|----------------|--------------------------------------------------------------------------|
| lima, norte    | `{fecha, ubicacion, tipo, bando, participantes_est, fuente_url, fuente_nombre}` (sin `titulo`) |
| centro, sur, oriente | `{id, fecha, titulo, descripcion, ubicacion, tipo, fuente, fuente_secundaria}` |

**Construir título cuando solo hay `tipo`**: `"{titleCase(tipo)} · {primer fragmento de ubicacion antes de coma/slash}"`.

**Campos de fecha (v3.5.7+)**:
- `fecha`        → string ISO (`YYYY-MM-DD` o `YYYY-MM-DDThh:mm:ss±HH:MM`). Puede estar vacío.
- `fecha_fin`    → opcional, mismo formato. Indica rango.
- `fecha_nota`   → opcional, qualifier humano (`"probable"`, `"Permanente / desde 08:00"`, `"Sin fecha confirmada"`).

**NUNCA generar strings tipo `2026-06-12TPermanente:00-05:00`** — el formato debe ser ISO estricto o vacío. El qualifier va a `fecha_nota`.

**Campo interno generado**: `__evtid` (asignado en `buildRegionContent` → `tagEvents()`). Formato: `ev_{id}` si el evento trae `id`, sino `{regionId}_{e|f}_{index}`. **No persistas `__evtid` en disco.**

### 2.3 Zonas
| Región         | Campos                                                                   |
|----------------|--------------------------------------------------------------------------|
| lima, norte    | `{nombre, ubicacion, tipo_riesgo (alto/medio), justificacion, puntos_calientes}` |
| centro, sur, oriente | `{id, nombre, tipo (bloqueo_vial/...), nivel (MEDIO-ALTO), descripcion, antecedente, fuente}` |

### 2.4 Rutas (v3.5.5+, normalizadas)
`{descripcion, distritos[], puntos_clave[], patron_historico, bando?, fuente, origen_v355?}`

### 2.5 Otros bloques heterogéneos
- **Hashtags URL keys**: `fuente_url`, `fuente`, `fuente_secundaria`, `fuente2`, `ejemplo_url`, `evidence_url`, `source_url`
- **cuentas_emergentes URL keys**: `url`, `fuente_url`, `perfil_url`, `url_contenido`
- **cuentas_emergentes side keys**: `posicion`, `bando`, `side`, `bando_aparente`
- **Disinfo labels**: `bulo`, `engano`/`engaño`, `manipulado`, `fuera_contexto`
- **Alt-media labels**: `centro`, `izq`, `anti`, `der`, `pro_fp`, `pro_sanchez`

---

## 3. Interdependencias críticas — "actualizar juntos"

| Si cambias…                                    | También revisa / actualiza                                                   |
|------------------------------------------------|------------------------------------------------------------------------------|
| `events.json` (cualquier región)               | `meta.version` (bump), `meta.fecha_corte`, regenerar `montecarlo.json` si cambia # escenarios |
| Un evento en `eventos[]`/`convocatorias_futuras[]` | `risk_matrix[]` (¿hay riesgo nuevo a registrar?), `early_warning_indicators[]` (¿señal cambió?), `executive_alert` |
| Una ruta / `rutas[]`                           | `corredores[]` (¿impacto logístico?), `zonas[].puntos_calientes` (¿se solapa?) |
| Un actor o bando                               | `narrativas_locales[]`, `social_intelligence`, `disinformation_cases[]`     |
| Coordenadas / topónimo nuevo                   | `web/js/gazetteer.js` — añadir entrada con bbox correcto **y verificar regiones donde resuelve** (anti-Plazuela-Merino) |
| Nueva avenida/corredor con geometría real     | `web/js/gazetteer.js` — añadir polyline a `CORRIDORS` (waypoints OSM-aligned) + entrada en `CORRIDOR_PATTERNS` (regex specific→general); `resolveCorridor()` filtra por bbox de región |
| `formatDate()` / parseo de fechas              | `formatEventDate()`, popups del mapa, `meta.fecha_corte` display            |
| Esquema de un campo (renombrar)                | Buscar `main.js` con todos los aliases (`cleanStr(raw.X) \|\| cleanStr(raw.Y)`) |
| Agregar un nuevo bloque en `index.html`        | `render()` en `main.js` lo invoca, agregar test en `tests/run_tests.js`     |
| `buildRegionMap`                               | CSS `.region-map-*`, `build_standalone.py` (inline order)                    |
| Versión `meta.version`                         | Tag en commit, descripción `download.html`, smoke tests si chequean versión |

---

## 4. QA checklist por sección

### 4.1 Bloque hero / executive alert
- [ ] `meta.version` actualizado
- [ ] `meta.fecha_corte` legible (humanizado, no ISO crudo)
- [ ] `executive_alert` cita fuentes con `[texto](url)`
- [ ] No usa palabras meta: iteración / fase / prompt / agente / AI / workflow / subagente

### 4.2 Regiones (lima, norte, centro, sur, oriente)
- [ ] `risk_level` o `executive_alert` presente (la pill de riesgo se infiere)
- [ ] Eventos sin `titulo` muestran "`{tipo}` · `{ubicación corta}`"
- [ ] **Fechas**: ninguna tarjeta dice "Invalid Date". Strings ambiguas → `fecha_nota`, `fecha` queda en ISO válido o vacío
- [ ] Mapa renderiza (`.leaflet-container`) salvo que la región no tenga elementos georeferenciables
- [ ] Polylines de rutas tienen color según bando; zonas tienen color según `nivel`
- [ ] Click en tarjeta → mapa hace flyTo + popup; click en marker → tarjeta hace scroll + flash
- [ ] Topónimos ambiguos (Plazuela Merino, San Juan, etc.) resuelven a la región correcta o se descartan (`gazetteer.resolve` con bbox check)
- [ ] Leyenda muestra: capas (rutas/zonas/eventos) + bandos presentes + niveles de riesgo (si hay zonas) + "sin geolocalizar" count

### 4.3 Social intelligence / grassroots
- [ ] URLs de cuentas validados (no 404 si es viable)
- [ ] Bandos clasificados; cuentas sin clasificar marcadas neutral
- [ ] Hashtags con métricas si las trae el dato

### 4.4 Risk matrix
- [ ] Cada fila tiene `probabilidad × impacto × confianza`
- [ ] Mitigaciones citadas
- [ ] RM-IDs únicos

### 4.5 Monte Carlo / reversión
- [ ] `montecarlo.json` consistente con escenarios actuales
- [ ] Gráfico no recorta etiquetas

### 4.6 Tests
- [ ] `node tests/run_tests.js` pasa **todos** los tests (139+ en v3.5.6, 143+ en v3.5.7)
- [ ] Solo agregar tests, no aflojar existentes

---

## 5. Errores comunes (lecciones aprendidas)

| Síntoma                                       | Causa raíz                                                                  | Fix                                                  |
|-----------------------------------------------|-----------------------------------------------------------------------------|------------------------------------------------------|
| "Invalid Date" en tarjeta                     | `fecha` no es ISO parseable                                                | `formatEventDate(raw)` retorna "Por confirmar"; mover qualifier a `fecha_nota` |
| `2026-06-12TPermanente:00-05:00` en datos     | `merge_v3.5.5.py` prefijó+sufijó indistintamente                           | Re-run `/tmp/clean_dates.py` o ya está limpiado en v3.5.7 |
| Marker fuera de la región                     | Topónimo ambiguo (e.g. "Plazuela Merino" existe en Piura y se referencia en Lima) | `gazetteer.resolve(name, regionId)` con bbox 0.5° pad → retorna null si fuera |
| Mapa vacío al cargar otra pestaña             | Leaflet midió en `display:none`                                            | `MutationObserver` en `.tab-panel` invoca `invalidateSize() + fitAll()` |
| ISO TZ leak en el UI (`...T15:00:00-05:00`)   | `formatDate` no detectó el formato y devolvió el string crudo              | Regex chequea `T\d{2}:\d{2}` antes de pasar a `Date` |
| Polyline incompleta                           | `puntos_clave[]` con topónimos que no resuelven                            | `resolveRouteCoords` cae a distritos, luego tokens de descripción |
| Push rechazado / historial divergente         | Alguien usó `git push --force`                                             | **Prohibido**. Usar `--force-with-lease` si necesario. |
| Standalone HTML no funciona offline           | `build_standalone.py` no inlineó algún recurso                             | Verificar orden: leaflet.css → leaflet.js → gazetteer.js → main.js → data |
| Tests pasan localmente pero fallan en CI      | Selectores dependen de timing (mapa async)                                 | Esperar `.leaflet-container` con timeout antes de assertions |
| User-data field renombrado en un solo lugar   | Renombrar en JSON pero olvidar el alias en main.js                         | Buscar todos los `cleanStr(raw.X)` y agregar fallback |

---

## 6. Workflow de build & deploy

```bash
cd /home/user/workspace/dossier_osint

# 1. Editar datos / código
# 2. Build standalone
python3 build_standalone.py

# 3. Tests
node tests/run_tests.js          # debe pasar 100%

# 4. Copiar al deploy folder
cp dossier_osint_v3.2.html _deploy_gh/download.html
cp dossier_osint_v3.2.html _deploy_gh/dossier_osint_v3.5.html
rsync -a web/ _deploy_gh/ \
  --exclude='download.html' --exclude='dossier_osint_v3.5.html' \
  --exclude='dossier_osint_v3.4.html' --exclude='.git' \
  --exclude='.nojekyll' --exclude='README.md'
cp -r tests _deploy_gh/

# 5. Commit + push (NUNCA --force)
cd _deploy_gh
git add -A
git -c user.email="bot@local" -c user.name="dossier-bot" commit -m "<mensaje>"
git push origin deploy-v3.2:main         # con api_credentials=["github"]

# 6. Verificar live: https://pillb.github.io/Mov_Soc_Peru_2026/
```

**share_file** (constitución):
```python
share_file(
  file_path="/home/user/workspace/dossier_osint/dossier_osint_v3.2.html",
  name="dossier_osint_html",     # mismo name → versioning
  should_validate=False
)
```

---

## 7. Reglas inviolables (Constitución del proyecto)

1. **Anti-alucinación estricta**: solo datos respaldados con fuente. Sin fuente → "no verificado" / "probable" explícito.
2. **Español únicamente** en contenido visible.
3. **Ground News style**: hechos balanceados primero, análisis después.
4. **Estética BCG / McKinsey**, no presentación tropical ni emoji-decorativo.
5. **WCAG AA**: contraste mínimo, focus visible, navegación por teclado.
6. **Standalone HTML offline**: cero fetch en runtime. Todo embebido.
7. **GitHub Pages target** → todas las URL relativas; vendor en `web/vendor/`.
8. **Prohibido `git push --force`**. Usar `--force-with-lease` cuando justificado.
9. **No palabras meta** en contenido visible: iteración, fase, prompt, agente, AI, workflow, subagente.
10. **Foco grassroots > medios mainstream**, cobertura por las 5 regiones.
11. **Próximos 7 días**: convocatorias_futuras debe estar fresca. Eventos >7 días pasados → mover a `eventos[]` (antecedente).

---

## 8. Roadmap conocido (no implementado aún)

- [ ] Deep-link a evento por ID: `#evt-{regionId}-{idx}` que abra región + flyTo
- [ ] Minimapa de regiones (overview) clickable en el header
- [ ] Atajos de teclado: `m` toggle mapa fullscreen, `/` focus search, `←/→` navegar regiones
- [ ] Breadcrumb sticky (región actual)
- [ ] Filtrado de eventos por bando / tipo dentro de la región
- [ ] Heatmap opcional de densidad de eventos
- [ ] Histórico de versiones del dossier (changelog UI)

---

## 9. Versiones (changelog resumido)

| Versión | Commit    | Hito                                                                  |
|---------|-----------|-----------------------------------------------------------------------|
| 3.5.2   | 8cb4991   | baseline limpio                                                       |
| 3.5.3   | d338315 + e9c22c6 | fixes generales + ISO follow-up                              |
| 3.5.4   | 8cf2dcb   | fallback título de evento                                             |
| 3.5.5   | 894207b   | rutas normalizadas + investigación expandida                          |
| 3.5.6   | a63c705   | mapas Leaflet por región, gazetteer offline, 139 tests                |
| 3.5.7   | e250f5d   | validación de fechas (`fecha_nota`/`fecha_fin`), interactividad mapa↔lista, AGENT.md |
| 3.5.8   | 9e2f833   | rutas siguen avenidas reales: `CORRIDORS` (17 polylines OSM-aligned) + `resolveCorridor()` con bbox filter; traza corredor (sólida) vs estimada (dashed) |
| 3.5.9   | d1f9b71   | **geometría real de calles**: `CORRIDORS_REAL` precomputado vía OSRM demo (17 corredores → 113k vertices → Douglas-Peucker → 6.5k vertices, 136 KB); **fix tarjetas .route** que mostraban solo "—" (nuevo buildRoutes lee `descripcion`/`distritos`/`puntos_clave`/`patron_historico`/`fuente`) |
| 3.5.10  | bd1db7c   | **popups de ruta enriquecidos**: título derivado (cascada), patrón histórico en callout, lista de eventos relacionados clickables (`findRelatedEvents()` por overlap de tokens distritos∩ubicacion + puntos_clave∩ubicacion → `focusEvent(evtid)`), link a fuente externa; eliminado "Ruta · —" vacío en mp-tag (también en popup de zona y evento); `__regionMaps[id].map` ahora expuesto para QA |
| 3.5.11  | ac8f995   | **sección elecciones rehecha**: reemplaza "Top 6 países" por dos tablas (`actas pendientes por origen` — 836 extranjero + 130 Loreto + 41 Junín + 70 otras, total 1.077; `actas observadas en JEE` por región con chip de líder — Lima Metro 800, Lima Prov 30, otras 580, Callao 85, Piura 55, extranjero 85, total 1.635), motivos JEE, card de impacto con votos en juego (~522k), ratio margen/votos, escenarios pro-F y pro-S, factor crítico, recuentos físicos (4 de 55 programados), fecha oficial 15-jul, 6 fuentes linkeadas. Nuevo bloque `actas_status` en montecarlo.json. Tests N31-N33 |
| 3.5.12  | 94a93a9   | **desglose por país clickable**: row Extranjero ahora es foldable (click → sub-tabla con 77 países agrupados por continente, datos directos del portal ONPE `resultadosegundavuelta.onpe.gob.pe` extraídos vía subagente browser). Columnas por país: ISO chip, total actas, contab., obs. JEE, % avance, líder (chip), % líder, votos F, votos S. Encabezado por continente con total agregado. Actualizado margen real 756 votos (↑ desde 561), avance 98,243 %, voto exterior cerrado al 100 % mesas (94,5 % actas) con Fuj 184.435 vs Sán 106.338. Tests N34 (6 checks) |
| 3.5.13  | eb36871   | **refresh integral corte 12-jun 09:00 PET** vía 4 investigaciones paralelas (escrutinio ONPE/JNE, convocatorias 12-19 jun, grassroots 5 macroregiones, social intelligence + disinformación). Cifras: ONPE 98,258 % actas (91.150/92.766), Fujimori 9.036.046 (50,004 %) vs Sánchez 9.034.743 (49,996 %) → margen +1.303 votos. JEE atendió 71 % de 1.611 actas observadas; 138 actas en recuento físico (9 audiencias hechas, 126 pendientes); JP presenta **4 recursos de nulidad por ~2.400 mesas** (1.751 nacionales + 649 EE.UU.); Defensoría declara "no hubo fraude". **Convocatorias confirmadas**: Toma de Lima / Cuatro Suyos 13-jun 15:00 Plaza San Martín, marcha Arequipa Fujimori Nunca Más / Gen Z 13-jun 16:00, concentración pro-Fujimori 14-jun 11:00 Av. Javier Prado, bloqueo activo Puente Internacional Ilave Puno (CNUL/Fenatep, Lucio Ccallo). Risk matrix +RM-17 (nulidad JEE) y +RM-18 (Karamba); EW-17 Karamba + EW-18 audiencias; EW-01 → VERDE (exterior 100 %), EW-03 → ROJO (margen 1.303). Social: 56 hashtags, 34 narrativas, 92 cuentas emergentes, 63 lives, 18 disinfo cases (incluye **Operación Karamba** Ecuador, 214 anuncios YouTube, 105 con IA generativa, 6 canales fantasma desaparecidos post-OjoPúblico). **Fixes técnicos**: `top_risks_24_72h` convertido dict→string (prevenía render de Executive Alert con appendChild TypeError); JS hashtag srcUrl ahora reconoce `example_url`/`source_metricas`. Tests 182/182 |
| 3.5.14  | (este)    | **OSINT reliability pass** — 4 validaciones cruzadas independientes (cifras ONPE/JNE, convocatorias 13-19 jun, social intelligence, actores 12-jun) detectaron y corrigieron: (1) **margen oscilante 859-1.303 votos intra-día** (EFE 12:00 GMT: 1.207); (2) **2 recursos de nulidad** confirmados públicamente (no 4) por 1.751 mesas nac. + 647 EE.UU. = 2.398 (~2.400); (3) **1.579 actas observadas recibidas JNE** vs 1.611 enviadas por ONPE; (4) **fecha proclamación** = 'mediados de julio' (Grecia Rentería JNE) — 15-jul es inferencia no documentada; (5) **Defensor Josué Gutiérrez** confirmó frase exacta 'No hubo fraude, ni siquiera se puede mencionar' el 11-jun 18:57 ([Infobae](https://www.infobae.com/peru/2026/06/11/no-hubo-fraude-ni-siquiera-se-puede-mencionar-defensor-del-pueblo-confirma-que-segunda-vuelta-fue-legitima/)); (6) **concentración pro-Fujimori 14-jun Av. Javier Prado** marcada **DUDOSA** — sin confirmación independiente, FP priorizo defensa legal en BTH (7-jun) y Estadio Monumental (4-jun), sede oficial es Av. 9 de Diciembre 422; (7) **marcha Arequipa Gen Z** parte de **Plaza España** (no calle Ayacucho), vocero David Calisaya ([Radio Yaraví](https://radioyaravi.org.pe/noticia/regional/colectivo-fujimori-nunca-mas-y-generacion-z-convocan-a-una-movilizacion-en-defensa-del-voto-popular/)). **CORRECCIONES INSTITUCIONALES**: Dina Boluarte fue destituida en 2025; presidente interino actual = **José María Balcázar** (desde feb 2026). Salas Arenas dejó JNE en nov 2024; presidente actual = **Roberto Burneo Bermejo**. **NUEVOS ACTORES** verificados y agregados: Balcázar (presidente interino), Óscar Arriola (PNP, anunció 'uso gradual de la fuerza' 11-jun), Oswaldo Calle (Ejército desde dic-2025), Jorge Zapata Ríos (CONFIEP, descartó fuga capitales 9-jun), Carlos Adeval Zafra (personero JP), Luis Dyer (personeros FP), Bernardo Pachas (ONPE, renuncia 3-jul), Grecia Rentería (vocera JNE). **CERRÓN** aclarado: PRÓFUGO con orden de captura desde 2023, publica con VPN; PL no apoya formalmente a Sánchez (29-may). **KARAMBA**: 6 canales fantasma (@EnfocatePeru, @RadarPeruano, @CheverePe, @SoyIndependiente, @Sancochau, @ElMachetePeru) ELIMINADOS de YouTube post-OjoPúblico; sin acción judicial confirmada. **SUTEP** se declaró neutral públicamente (refutación). Agregadas audiencias de recuento confirmadas: Lambayeque 12-jun (3 actas), Chanchamayo 13-jun, Tambopata 15-jun. JNE desmintió falsa proclamación viral del 11-jun. Tests 182/182 |
| 3.6.0   | (este)    | **v3.6.0 — BLUF pyramid + ML forecast + foldable UX + hide-past toggle**. (a) **Investigación paralela exhaustiva** (4 subagentes): Lima (20 manifestaciones nuevas con cross-ref accounts/hashtags), regiones Norte/Centro/Sur/Oriente (36 eventos), proyección ML del resultado final ONPE, narrativas→eventos físicos (30 narrativas mapeadas a marchas). Resultado: `convocatorias_futuras` consolidado lima 11→31 (+20), norte 5→15 (+10), centro 5→14 (+9), sur 12→22 (+10), oriente 5→12 (+7) — **56 marchas/concentraciones/bloqueos** nuevas; +8 actores Lima, +4 hashtags emergentes, +7 narrativas. (b) **Nuevo bloque `forecast_ml`** (ensemble bayesian-ish sobre actas observadas/EE.UU./recuentos físicos): margen proyectado **+1.886 votos Fuj** (50,0052 %), IC50/IC80/IC95 (último: [-10.419, +14.192]), **P(Fujimori)=57,3 %, P(Sánchez)=39,5 %, P(empate técnico)=3,2 %**, 5 escenarios (proyección central / pro-F top / pro-S top / impugnación nulidad masiva / empate técnico forzando recuento), 5 drivers cuantificados (443 actas observadas JEE σ±6.213, recuentos físicos σ±2.700, voto EE.UU. cerrado σ±450, anulación selectiva σ±5.100, drift por subsanación σ±900), 10 assumptions explícitas, 11 fuentes (ONPE/JNE/EFE/Reuters/Infobae/IDL-Reporteros). (c) **Nueva sección `bluf`** (Bottom Line Up Front) renderizada arriba del fold: 6 KPIs (margen, actas observadas pendientes, P(F)/P(S), próxima marcha, EW activos), 6 manifestaciones críticas top (cards con chip side pro-F/pro-S/neutral + accounts + hashtags cross-ref), 3 things-to-watch, forecast one-liner. (d) **UX pyramid BCG/McKinsey**: secciones detalle (`reversion-detail`, `validacion-detail`, `alt-media`, `disinfo`, `risk-matrix`, `early-warning`, `fml-detail`) ahora **cerradas por defecto** — KPIs/resumen punchy visibles, detalle al click. (e) **Toggle 'Ocultar eventos pasados'** en header (checkbox `hidePastToggle`, activado por defecto, persiste `localStorage:'dossier_hidePast_v360'`): aplica `body.hide-past` que oculta `[data-es-pasado="true"]` en marchas, routes, risk-matrix, BLUF crit cards. Flag `es_pasado` aplicado a 21 entradas históricas vía `_update_v360_consolidate.py`; helper JS `isPastDate(iso)` para casos sin flag. (f) **Tests 198/198** (+16 nuevos): N21 bump a 3.6.0, N35 BLUF (≥6 KPIs, ≥3 críticas, 3 watch), N36 ForecastML (≥4 KPIs, IC bars, ≥5 escenarios, ≥5 drivers), N37 hide-past (toggle checked, body.hide-past, ≥5 past flagged, invisibilidad real), N38 foldables (7 cerrados por defecto). Build OK (1.772.853 bytes). |
| 3.7.0   | (este)    | **v3.7.0 — research round 1+2 + escrutinio realtime + ML forecast revisado**. (a) **Round 1 paralelo** (5 subagentes): escrutinio/legal (47 fuentes, recursos JP improcedentes por falta tasa, FP no apela Puno), Lima (20 manifestaciones nuevas, 10 actores, 10 hashtags), regiones interior (norte+centro+sur+oriente = 42 manifestaciones, 7 bloqueos, 13 actores), social intelligence + disinfo (16 hashtags nuevos, 20 cuentas emergentes, 11 narrativas, 14 disinfo cases, 6 canales Karamba), ML forecast actualizado. (b) **Round 2 (deeper+wider)**: cross-validación de handles/URLs/entidades (11 correcciones globales: @HCevallosB→@HCevallosFlores, @CGTPOficial→@cgt_peru, @JuntosXelPeru→@JuntosPorElPer, @FuerzaPopular→@FuerzaPopular__, @RLopezAliaga→@rlopezaliaga1, @wayka_pe→@WaykaPeru, @UNAP_Iquitos→@unapiquitos, @pachamamaradio→@PachamamaRadio_, @Roberto_Sanchez_→@RobertoSanchP, @RosaMariaP→@rmapalacios, Wener→Werner Salcedo); 7 hechos nuevos 14-jun tarde; rutas+magnitud enriquecidas (62 eventos con polylines, 5 rutas recurrentes, 10 zonas calientes). (c) **Hallazgo crítico**: margen creció ×14 en 48h (+1.303 12-jun 09:00 → +4.310 12-jun 18:56 → +18.488 13-jun → +18.694 14-jun al 98,591 % actas, Gestión.pe/EFE). 3 recursos nulidad JP TODOS IMPROCEDENTES por falta tasa; 7 recursos FP Puno por 7.014 votos, FP anunció no apelar. (d) **forecast_ml v3.7.0** revisado: margen central **+18.485 votos** (vs +1.886 v3.6.0), IC95 **[+13.662; +23.308]** (ya **no cruza cero**), **P(Fujimori)=98,5 %** (vs 57,3 %), P(S)=1,5 %, P(empate)=0,01 %; σ_eff=2.461 (σ_stat=1.434 + σ_sys=2.000); mezcla t(df=5) 97 % + cola sistémica 3 %. (e) **Nuevo bloque `escrutinio_realtime`**: cifras_actuales (98,591 % actas, votos F/S, margen, fuente_primaria), oscilacion_intra_periodo, cifras_evolucion (4 cortes), actas_observadas_jee. (f) **Nuevo bloque `prediccion_7dias`** (5 regiones lima/norte/centro/sur/oriente): P(paro nacional coordinado)=0,55 (sube >0,80 si proclamación 16-18 jun); P(Ilave continuado)=0,90; P(Carretera Central indefinido)=0,72; P(Pucallpa disturbios)=0,65; bloqueos activos: Puente Ilave (CNUL/Ccallo), La Oroya, Federico Basadre, Panamericana Norte km 556. (g) **Convocatorias_futuras consolidado**: lima 51, sur 34, norte 25, centro 24, oriente 22 — **156 totales próximos 7 días**. **+21 actores**, **+86 hashtags**, **+89 cuentas emergentes**, **+19 disinfo cases**. (h) **Risk matrix +4** (RM-19/20/21/22) y **Early warning +4** (EW-19/20/21/22). (i) **BLUF + matriz + early-warning + rutas** cross-actualizados con nuevos datos. (j) **Fixes formato**: `fmt()` de Reversión/Actas/Países/Validación migrados de `toLocaleString('es-PE')` (devolvía comas en Chromium) a regex manual `String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, '.')` para garantizar separador de miles correcto en todos los runtimes (consistente con `formatSignedInt`); BLUF KPIs porcentajes ahora con coma decimal y espacio antes de % (es-PE/RAE); forecast `pct_fujimori_final` reducido toFixed(4)→toFixed(3). (k) **11 tests nuevos** (N40-N45): margen central ≥18.000, P(F)≥0,95, IC95 lower bound >0, bloque escrutinio_realtime, prediccion_7dias 5 regiones, ≥150 convocatorias_futuras, risk_matrix/early_warning ampliados. **Tests 216/216** (+11 desde v3.6.1). QA visual confirmado en desktop 1440px, tablet 768px, mobile 375px: 0 errores JS, 0 NaN/undefined/[object Object], 0 overflow, formato es-PE correcto en todos los KPIs. Build OK (1.942.778 bytes). |
| 3.6.1   | (este)    | **v3.6.1 — Playwright QA pass + fixes**. (a) **Brand bump v3.5→v3.6**: `<title>`, meta description, `.brand-title`, `.brand-sub` actualizados (v3.5 era stale). (b) **Fix header overlap mobile**: el banner standalone ("Versión descargable v3.2—funciona offline") es position:fixed top:0 y en mobile wrap a 3 líneas — el body padding-top:30px era insuficiente y el banner clípaba el header. Aplicado padding-top responsive: 60px (≤880px), 84px (≤480px); banner oculto en print. (c) **Fix ML KPI layout broken**: `.fml-kpi-label/-value/-sub` eran `<span>` con display inline por defecto — valores y labels colapsaban en una sola línea ("MARGEN FINAL PROYECTADO+1,886 votosFujimori"). Añadido `display: block` y margenes verticales. (d) **Fix formato números es-PE**: `formatSignedInt()` usaba `toLocaleString('es-PE')` que en runtimes headless/Chromium minimal no tiene locale data y caer en en-US ("+1,886" en lugar de "+1.886"). Reemplazado con regex manual `String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, '.')` para garantizar separador de miles correcto en todos los runtimes. Aplicado a margenes BLUF/forecast/IC bounds/escenarios. (e) **Nav reordenado DOM-aligned**: orden previo BLUF→Forecast→Post-electoral→Reversión no seguía DOM (forecast está después de reversion); reordenado a BLUF→Post-electoral→Reversión→Forecast→Regiones→Social→Matriz→Fuentes para scroll-spy correcto. (f) **CSS responsive header**: `.header-inner flex-wrap: nowrap`, `.brand min-width:0 flex:0 1 auto`, brand-title `white-space:nowrap`, brand-sub `text-overflow:ellipsis`. Mobile <600px: brand-sub oculto, brand-title max-width:38vw con ellipsis. <380px: logo 28px. Toggle: background cream `rgba(184,118,31,0.08)` en lugar de navy (mejor contraste en header light). En mobile el label "Ocultar eventos pasados" se acorta a "Pasados". (g) **scroll-margin-top: 80px** en `section[id], h2[id], h3[id]` para compensar sticky header en anchor jumps. (h) **7 tests nuevos (N39)**: brand title v3.6, document.title v3.6, fml-kpi-value display=block, formato es-PE con punto en miles, IC bounds con punto, nav order BLUF primero, Forecast después de Reversión. Tests **205/205** (+7 desde v3.6.0). QA visual confirmado en desktop 1440px, tablet 768px, mobile 375px. 0 errores JS en consola. |
