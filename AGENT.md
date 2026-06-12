# AGENT.md — Dossier OSINT Perú 2026

> Documento de mantenimiento para futuras sesiones. Lee esto **antes** de modificar el dossier.
> Última actualización: v3.5.13 (refresh integral corte 12-jun 09:00 PET: ONPE 98,258 % escrutado, margen +1.303 votos pro-Fujimori, 4 recursos de nulidad JP por 2.400 mesas, marcha Toma de Lima 13-jun confirmada, Operación Karamba documentada con 214 anuncios IA).

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
| 3.5.13  | (este)    | **refresh integral corte 12-jun 09:00 PET** vía 4 investigaciones paralelas (escrutinio ONPE/JNE, convocatorias 12-19 jun, grassroots 5 macroregiones, social intelligence + disinformación). Cifras: ONPE 98,258 % actas (91.150/92.766), Fujimori 9.036.046 (50,004 %) vs Sánchez 9.034.743 (49,996 %) → margen +1.303 votos. JEE atendió 71 % de 1.611 actas observadas; 138 actas en recuento físico (9 audiencias hechas, 126 pendientes); JP presenta **4 recursos de nulidad por ~2.400 mesas** (1.751 nacionales + 649 EE.UU.); Defensoría declara "no hubo fraude". **Convocatorias confirmadas**: Toma de Lima / Cuatro Suyos 13-jun 15:00 Plaza San Martín, marcha Arequipa Fujimori Nunca Más / Gen Z 13-jun 16:00, concentración pro-Fujimori 14-jun 11:00 Av. Javier Prado, bloqueo activo Puente Internacional Ilave Puno (CNUL/Fenatep, Lucio Ccallo). Risk matrix +RM-17 (nulidad JEE) y +RM-18 (Karamba); EW-17 Karamba + EW-18 audiencias; EW-01 → VERDE (exterior 100 %), EW-03 → ROJO (margen 1.303). Social: 56 hashtags, 34 narrativas, 92 cuentas emergentes, 63 lives, 18 disinfo cases (incluye **Operación Karamba** Ecuador, 214 anuncios YouTube, 105 con IA generativa, 6 canales fantasma desaparecidos post-OjoPúblico). **Fixes técnicos**: `top_risks_24_72h` convertido dict→string (prevenía render de Executive Alert con appendChild TypeError); JS hashtag srcUrl ahora reconoce `example_url`/`source_metricas`. Tests 182/182 |
