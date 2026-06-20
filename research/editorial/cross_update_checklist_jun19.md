# Cross-Update Checklist — Post v3.9.0 base
**Corte:** 2026-06-19T21:00:00-05:00 (PET)  
**Agente:** Dossier editor  
**Base:** `scripts/update_v390.py` (orquestador) actualiza meta, BLUF global, escrutinio, convocatorias Lima/Pariahuanca, EW-19/20/23 parcial, hashtags/disinfo.  
**Fuentes research:** `research/context/escrutinio_jun19.md` · `research/validation/loose_threads_round2_jun19.md` · `research/regional/*.md` · `research/social/*.md` · `research/entities/entities_deep_jun19.md`

---

## Resumen ejecutivo

| Área | Ítems stale | Críticos (P0) |
|------|-------------|---------------|
| `risk_matrix` | 8 | 3 |
| `early_warning_indicators` | 10 | 3 |
| `regions[].executive_alert` | 6 | 2 |
| `index.html` (estático) | 6 | 2 |
| `js/main.js` (fallbacks/hardcodes) | 14 | 4 |
| **TOTAL** | **44** | **14** |

> **Nota:** Tras ejecutar `update_v390.py`, `data/events.json` queda en v3.9.0 para capa global; las secciones abajo **no** son parcheadas por ese script y siguen arrastrando copy del 16-jun / v3.8.1.

---

## 1. `risk_matrix` — parches pendientes

### 1.1 Actualizar entradas existentes (evento ya ocurrió o estado cambió)

| ID | Campo | Texto/valor stale | Patch exacto |
|----|-------|-------------------|--------------|
| **RM-24** | `scenario`, `probability`, `timeframe`, `level` | "marcha al Campo de Marte 19-jun 16:00" · prob MEDIA · ventana 48-72h | `"estado": "realizada"`, `"probability": "BAJA"`, `"timeframe": "cerrado 19-jun"`, `"level": "BAJO"`, reescribir `scenario`: *"Marcha JP 19-jun ejecutada desde Paseo Colón/Centro Histórico (~350-900, pacífica). Campo de Marte no fue epicentro. Riesgo residual: autoconvocatoria 22-jun (P=0,40)."* |
| **RM-25** | `scenario`, `probability`, `level` | "~10.000 hacia Huancayo" · prob ALTA | `"estado": "desescalado"`, `"probability": "BAJA"`, `"level": "BAJO"`, `scenario`: *"Protesta estacionaria GORE Junín 18-19-jun (cientos); acta compromisos 19-jun 19:49. Marcha 10.000 NO materializada."* |
| **RM-26** | `scenario`, `rationale` | "estado al 16-jun incierto" | `scenario`: *"Ilave inactivo 19-jun (sin SUTRAN/PNP). Riesgo reactivación post-proclamación P≈0,40."* · `probability`: `"MEDIA"` (solo reactivación) |
| **RM-20** | `probability`, `evidence` | P(Ilave)=0,90 · 4 corredores bloqueados | `"probability": "MEDIA"`, `evidence`: *"0 bloqueos confirmados 19-jun. Ilave inactivo; La Oroya transitable; Federico Basadre/FB Terry levantados; km 556 sin bloqueo."* |
| **RM-16** | `scenario`, `probability` | "Paro activo desde 9-jun" en Ucayali/San Martín | `"probability": "MEDIA"`, `scenario`: *"Corredores transitables 19-jun; riesgo latente reactivación arrocera P≈0,35–0,50 (tregua vencida, sin comunicado nuevo)."* |

### 1.2 Nuevas entradas RM recomendadas

#### RM-27 · JNE nulidad 2.408 actas (NUEVO)
```json
{
  "id": "RM-27",
  "category": "Crisis institucional",
  "title": "Resolución JNE nulidad 2.408 actas Lima + EE.UU.",
  "scenario": "JP sustentó ante JNE el 19-jun pedido de nulidad de 2.408 actas (1.751 Lima + 647 EE.UU.); claim 583 patrones anómalos. Si JNE declara fundada nulidad Lima, ~43.577 votos netos en juego superan margen actual +41.565. Resolución no publicada al corte 20:43.",
  "probability": "MEDIA",
  "impact": "CRÍTICO",
  "timeframe": "23-27 jun (estimado Roy Mendoza)",
  "level": "CRÍTICO",
  "triggers": [
    "JNE admite/fundamenta nulidad parcial Lima",
    "Resolución publicada en portal JNE",
    "Sánchez convoca movilización post-fallo"
  ],
  "sources": [
    {
      "title": "RPP — JP sustenta 2.408 actas",
      "url": "https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777"
    },
    {
      "title": "La República — 43.577 votos en juego",
      "url": "https://larepublica.pe/politica/2026/06/18/jne-decidira-manana-si-acepta-pedido-de-nulidad-de-mesas-en-lima-mas-de-43-mil-votos-en-juego-hnews-1139454"
    }
  ]
}
```

#### RM-28 · Procuraduría denuncia convocantes (NUEVO)
```json
{
  "id": "RM-28",
  "category": "Violencia política / institucional",
  "title": "Denuncia penal Procuraduría vs. 9 convocantes de marchas",
  "scenario": "Procuraduría presentó denuncia 19-jun noche (DEN-ENT-202602038) contra Antauro Humala, Hernando Cevallos, Lucio Ccallo y 6 más por art. 315-A CP. Roberto Sánchez excluido y rechazó denuncia. Riesgo: disuasión de convocatorias + polarización #CriminalizaciónDeLaProtesta.",
  "probability": "ALTA",
  "impact": "ALTO",
  "timeframe": "72h-14d (investigación fiscal)",
  "level": "ALTO",
  "triggers": [
    "Fiscalía admite a trámite y ordena medidas cautelares",
    "Nueva convocatoria JP con Cevallos/Ccallo en primera línea",
    "FP amplifica narrativa de azuzamiento"
  ],
  "sources": [
    {
      "title": "El Comercio — Denuncia Procuraduría",
      "url": "https://elcomercio.pe/lima/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-hernando-cevallos-y-otros-siete-dirigentes-por-grave-perturbacion-de-la-tranquilidad-publica-ultimas-noticia/"
    },
    {
      "title": "La República — Sánchez rechaza denuncia",
      "url": "https://larepublica.pe/politica/2026/06/19/roberto-sanchez-rechaza-denuncia-de-la-procuraduria-contra-dirigentes-de-jp-y-otros-ciudadanos-por-convocar-a-marcha-hnews-542070"
    }
  ]
}
```

#### RM-29 · Piura movilización arrocera 23-jun (NUEVO o elevar RM-11)
```json
{
  "id": "RM-29",
  "category": "Económico-logístico",
  "title": "Movilización arrocera Piura-Sechura 23-jun → escalada El Trébol",
  "scenario": "Conveagro confirma movilización 23-jun ~08:00 (Sechura, Medio/Bajo Piura). Precedente mayo-2026: bloqueo Catacaos–Piura y El Trébol. Paro NO reactivado al 19-jun; este evento es escalón previo a posible bloqueo si DU 005-2026 sigue incumplido.",
  "probability": "ALTA",
  "impact": "ALTO",
  "timeframe": "22-24 jun",
  "level": "ALTO",
  "triggers": [
    "Reconfirmación Conveagro 22-jun AM",
    "Bloqueo preventivo El Trébol km 1058",
    "Escalada tras resolución JNE nulidad"
  ],
  "sources": [
    {
      "title": "Norte Sostenible — Piura 23-jun",
      "url": "https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/"
    }
  ]
}
```

**Acción script sugerida:** añadir bloque `patch_risk_matrix()` en `update_v390.py` o script editorial `patch_cross_sections_v390.py`.

---

## 2. `early_warning_indicators` — parches pendientes

`update_v390.py` solo toca EW-19, EW-20, EW-23. Resto sigue en corte 12–16-jun.

| ID | Status stale | Patch exacto |
|----|--------------|--------------|
| **EW-02** | 878 actas / narrativa 12-jun | `"value": "346 actas en JEE (↓ desde 878)"`, `"current_status": "AMARILLO"`, `"rationale": "346 actas en tránsito JEE al 19-jun 20:43. JP nulidad 2.408 actas en evaluación JNE."`, `"next_check": "Diario 18:00 PET"` |
| **EW-18** | next_check 13-jun | `"value": "Recuentos físicos en curso (calendario JNE)"`, `"next_check": "2026-06-22 09:00 PET"` |
| **EW-21** | P(F)=98%, IC95 viejo | `"value": "P(F)=99,4% · IC95 [+38.200; +51.400]"`, `"status": "VERDE"` |
| **EW-22** | ventana proclamación 16-21 jun | `"value": "Legislativos proclamados 19-jun; presidencia mediados-jul"`, `"status": "VERDE"`, `"note": "JNE proclamó senadores/diputados 19-jun (RPP 1693837). Presidencia pendiente."` |
| **EW-19** | P=0,28 + nota proclamación 16-18 | Completar patch v390: `"value": "Marcha 19-jun realizada pacífica · CGTP 17-jun NO verificada · P(paro)=0,22"`, `"rationale": "Sin paro CGTP. Marcha JP ejecutada sin incidentes graves."` |
| **EW-20** | v390 parcial OK | Verificar coherencia: `"status": "VERDE"` (no solo rationale) |
| **EW-23** | rationale 16-jun | `"rationale": "Presentado 16-jun; sin admisión/rechazo PJ indexado 17–19-jun"`, `"value": "Presentado · admisión no confirmada"` |

### Nuevos EW recomendados

#### EW-27 · JNE nulidad 2.408 actas
```json
{
  "id": "EW-27",
  "indicator": "Resolución JNE nulidad 2.408 actas (Lima + EE.UU.)",
  "threshold": "ROJO si JNE declara fundada nulidad Lima (>43.577 votos netos en juego)",
  "status": "AMARILLO",
  "value": "Audiencia sustentada 19-jun · resolución no publicada",
  "trend": "→ pendiente",
  "rationale": "Roy Mendoza sustentó 2.408 actas; plazo magistrados hasta 3 días hábiles. Margen +41.565 vs ~43.577 votos en juego si fundada.",
  "next_check": "2026-06-22 09:00 PET (portal JNE)",
  "data_source": "https://portal.jne.gob.pe/portal/"
}
```

#### EW-28 · Procuraduría denuncia penal
```json
{
  "id": "EW-28",
  "indicator": "Denuncia penal Procuraduría contra convocantes de marchas",
  "threshold": "ROJO si fiscalía ordena detención o medida cautelar contra líderes JP activos",
  "status": "AMARILLO",
  "value": "Denuncia presentada 19-jun · 9 personas (excluye Sánchez)",
  "trend": "↑ nuevo",
  "rationale": "DEN-ENT-202602038 art. 315-A CP. Catalizador #CriminalizaciónDeLaProtesta.",
  "next_check": "2026-06-21 12:00 PET",
  "data_source": "https://elcomercio.pe/lima/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-hernando-cevallos-y-otros-siete-dirigentes-por-grave-perturbacion-de-la-tranquilidad-publica-ultimas-noticia/"
}
```

#### EW-29 · Piura 23-jun
```json
{
  "id": "EW-29",
  "indicator": "Movilización arrocera Piura-Sechura 23-jun",
  "threshold": "ROJO si bloqueo El Trébol o Catacaos–Piura >4h",
  "status": "AMARILLO",
  "value": "Convocatoria confirmada · sin cancelación 17–19-jun",
  "trend": "→ vigente",
  "rationale": "NORTE-PARO-023 vigente. Reconfirmar 22-jun AM (Norte Sostenible, Walac, SUTRAN).",
  "next_check": "2026-06-22 08:00 PET",
  "data_source": "https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/"
}
```

#### EW-30 · Autoconvocatoria Lima 22-jun (opcional)
```json
{
  "id": "EW-30",
  "indicator": "Autoconvocatoria Instagram Plaza San Martín 22-jun",
  "threshold": "NARANJA si reel reamplificado por handles JP",
  "status": "AMARILLO",
  "value": "P=0,40 · sin respaldo JP oficial",
  "rationale": "Reel DZQNoG-pSIU vigente. MML restricción Centro Histórico hasta 22-jun 00:00.",
  "next_check": "2026-06-21 18:00 PET"
}
```

---

## 3. `regions[].executive_alert` — textos stale y reemplazos exactos

### 3.1 Sur — **P0 CRÍTICO** (`regions.sur.executive_alert`)

**Stale (contiene):** `Ilave **bloqueado activo**` · marcha Lima 15-jun · eventos 12–13-jun

**Reemplazo exacto:**
```
ALERTA MEDIA — SUR. Puente Internacional Ilave **sin bloqueo activo verificado** al 19-jun (convocado 11-jun por CNUL/Fenatep; round 2 y cobertura 17–19 sin confirmación SUTRAN). Delegaciones de **Puno y Cusco** participaron en marcha JP Lima 19-jun — corredor sur–Lima presumiblemente transitable ([El Búho](https://elbuho.pe/2026/06/mas-de-7-mil-policias-restriccion-vehicular-amenazas-del-alcalde-de-lima-para-marcha-de-jp-en-defensa-del-voto/)). Lucio Ccallo **denunciado penalmente** 19-jun por Procuraduría ([El Comercio](https://elcomercio.pe/lima/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-hernando-cevallos-y-otros-siete-dirigentes-por-grave-perturbacion-de-la-tranquilidad-publica-ultimas-noticia/)). Raúl Samillán anunció movilización Puno→Lima **15–28-jul** ([Evidencia.pe](https://evidencia.pe/raul-samillan-keiko-fujimori-posiblemente-este-gobernando-y-dios-nos-salve/)). FP no apela nulidades Puno (14-jun). Arequipa/Cusco sin marchas masivas nuevas 17–19-jun. **Riesgo reactivación Ilave P=0,40** post-proclamación JNE.
```

### 3.2 Lima — **P0** (`regions.lima.executive_alert`)

**Stale:** Toma de Lima 13-jun convocada · alerta máxima 13-jun · sin marcha 19-jun

**Reemplazo exacto:**
```
ALERTA MEDIA — LIMA. Marcha JP 19-jun **ejecutada** desde Paseo Colón/Centro Histórico (~350-900, pacífica; Campo de Marte no fue epicentro) ([RPP](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850)). Acampamento ~80 carpas frente JNE continúa (conteo 16-jun; PNP desplegada 19-jun). MML: restricción Centro Histórico hasta **22-jun 00:00**. Procuraduría denunció a 9 convocantes 19-jun — **Sánchez excluido** ([RPP](https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848)). Autoconvocatoria Instagram Plaza San Martín **22-jun** sin respaldo JP (P=0,40). ONPE 99,63 % · margen +41.565 pro-Fujimori.
```

### 3.3 Norte (`regions.norte.executive_alert`)

**Stale:** Toma de Lima 13-jun · sin Piura 23-jun destacado · corte pre-19-jun

**Reemplazo exacto:**
```
ALERTA MEDIA — NORTE. Sin bloqueos viales activos verificados al 19-jun (El Trébol, Catacaos–Piura, km 556 libres). **Movilización arrocera Piura-Sechura confirmada 23-jun ~08:00** — riesgo escalada El Trébol P=0,65 ([Norte Sostenible](https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/)). Ronderas cajamarquinas inactivas con capacidad latente (CUDRCU/CUNARC). Plantón JEE Trujillo continuo desde 9-jun. Sin manifestaciones electorales verificadas Norte 17–19-jun. JNE evalúa nulidad 2.408 actas (catalizador narrativo regional).
```

### 3.4 Centro (`regions.centro.executive_alert`)

**Stale:** Plantón 12-jun · Toma de Lima 13-jun · riesgo Carretera Central sin desescalada Pariahuanca

**Reemplazo exacto:**
```
ALERTA MEDIA — CENTRO. Carretera Central km 90–180 **transitable** (La Oroya sin bloqueo protesta). Protesta Pariahuanca frente GORE Junín 18–19-jun **desescalada** — acta compromisos firmada 19-jun 19:49 ([HYTimes](https://hytimes.pe/2026/06/19/gobierno-regional-cede-y-emitira-ordenanza-para-proteger-el-huaytapallana-y-cabeceras-de-cuenca/)); magnitud cientos, no ~10.000. Reunión Zósimo Cárdenas ↔ Pariahuanca reprogramada **25-jun**. Bastión pro-Sánchez: Huancavelica 81,4 %, Apurímac 81,2 %. Riesgo latente bloqueo Carretera Central P=0,40 si resolución JNE nulidad Lima escala narrativa electoral.
```

### 3.5 Oriente (`regions.oriente.executive_alert`)

**Stale:** Federico Basadre "en riesgo de reanudación" · eventos 12-jun UNAP/Loreto

**Reemplazo exacto:**
```
ALERTA AMARILLA — ORIENTE. Federico Basadre (Ucayali) y Fernando Belaúnde Terry (San Martín) **sin bloqueo activo** al 19-jun — paro arrocero levantado pre-2da vuelta; riesgo reactivación latente P≈0,35–0,50. Sin toma UNAP Pucallpa ni movilización Loreto 12-jun materializada en ventana 17–19. AIDESEP en observación poselectoral. Referencia cruzada: movilización arrocera **Piura 23-jun** (norte) puede reactivar narrativa agro regional.
```

### 3.6 Norte nested — `regions.norte.social_v35.executive_alert` (duplicado stale)

**Stale:** corte 11-jun-2026 · Toma de Lima 13-jun

**Reemplazo exacto:** usar el mismo texto que `regions.norte.executive_alert` (§3.3) o eliminar duplicado si el renderer no lo consume.

---

## 4. `index.html` — texto estático no data-driven

| Línea aprox. | Stale | Patch exacto |
|--------------|-------|--------------|
| 6 `<title>` | `v3.8.1` | `Dossier OSINT — Manifestaciones Perú · v3.9.0 BLUF + ML forecast` |
| 7 `meta description` | `v3.8.1` · `16-jun` | `Dossier OSINT v3.9.0 — BLUF + ML forecast. Convocatorias activas en 5 macroregiones. Margen ONPE y proyección ML actualizados al corte 19-jun.` *(o dejar placeholders mínimos; `renderEditorialCopy` sobreescribe en runtime)* |
| 11 `og:title` | `v3.8.1` | `Dossier OSINT — Manifestaciones Perú · v3.9.0 BLUF + ML` |
| 12 `og:description` | `v3.8.1` | Alinear con meta description v3.9.0 / 19-jun |
| 43 `.brand-title` | `v3.8.1` | `Dossier OSINT · v3.9.0` *(fallback SSR; JS actualiza si meta.version presente)* |
| 307 supuestos Monte Carlo | `878 actas` · `+34.967` · `99,07 %` · `16-jun` | `346 actas pendientes en JEE al corte 19-jun; margen observado +41.565 votos pro-Fujimori al 99,63 %.` |

**Nota:** `#footer-about`, `#meta-version`, `.brand-sub` son data-driven vía `renderEditorialCopy()` — no requieren patch HTML si JSON v3.9.0 está cargado.

---

## 5. `js/main.js` — `renderEditorialCopy` y hardcodes v3.8.1 / 99,07%

### 5.1 Fallbacks en `renderEditorialCopy()` (l.254–293)

| Línea | Stale | Patch exacto |
|-------|-------|--------------|
| 254 | comentario `v3.8.1` | `// ---------- v3.9.0: Editorial copy — static HTML slots from live data ----------` |
| 263 | `'99,07 %'` | `'99,63 %'` |
| 264 | `'+34.967'` | `'+41.565'` |
| 265 | `'+41.200'` | `'+44.800'` |
| 266–267 | IC `[+32.800, +49.600]` | `[+38.200, +51.400]` |
| 268 | `'99,2'` | `'99,4'` |
| 270, 272, 281 | `'3.8.1'` (×3) | `'3.9.0'` |
| 280 | `'16 jun 2026'` | `'19 jun 2026'` |
| 285 | `~878 actas JEE` hardcoded | Leer `er.cifras_actuales.actas_jee_pendientes` con fallback `346` |
| 291 | `corte 16-jun` en mercDesc | `corte ${meta.fecha_corte \|\| '19-jun'}` dinámico |

### 5.2 Otros hardcodes fuera de `renderEditorialCopy`

| Función | Línea | Stale | Patch |
|---------|-------|-------|-------|
| `renderForecastML` | 371, 376 | `'99,07 %'` · `~878` actas | fallback `99,63 %`; actas desde `ca.actas_jee_pendientes \|\| 346` |
| `renderPostElectoral` | 724–726 | `99,07 %` · `+34.967` · `~878` | fallbacks `99,63 %`, `+41.565`, `346` |
| `renderValidacion` | 2917 | `'99,07%'` fallback | `'99,63%'` |
| `renderValidacion` | 2921 | **texto fijo** `+34.967 votos al 16-jun` | Data-driven: `` `...margen observado (${m} votos al ${pct}).` `` |

---

## 6. Dependencias cruzadas (orden de aplicación)

```
1. data/events.json v3.9.0 (update_v390.py)     ← base
2. risk_matrix + early_warning (§1–2)           ← matriz/alertas alineadas a research
3. regions[].executive_alert (§3)               ← pills de riesgo regional
4. js/main.js fallbacks (§5)                    ← coherencia sin JSON / SSR
5. index.html estático (§4)                     ← SEO/SSR fallback
6. tests/run_tests.js N49–N53                   ← actualizar expectativas v3.9.0 (fuera de scope editor)
```

---

## 7. Verificación post-patch

- [ ] `grep -r "bloqueado activo" data/events.json` → **0** en `executive_alert`
- [ ] `grep -r "Campo de Marte 19-jun" data/events.json` → solo histórico/realizada, no futuro
- [ ] `grep -r "99,07" index.html js/main.js` → **0** (salvo histórico intencional)
- [ ] `grep -r "3.8.1" index.html` → **0**
- [ ] `risk_matrix.length >= 29` (26 + 3 nuevos)
- [ ] `early_warning_indicators.length >= 30` (23 + 4 nuevos mínimo)
- [ ] Playwright N53 multi-viewport pasa con v3.9.0

---

## 8. Top 5 fixes críticos (P0)

1. **`regions.sur.executive_alert`** — eliminar `Ilave bloqueado activo` (contradice round 2/3 research; desinforma operadores).
2. **`regions.lima.executive_alert`** — reemplazar alerta Toma de Lima 13-jun por marcha 19-jun realizada + Procuraduría + 22-jun.
3. **Nuevos RM-27 + EW-27** — JNE nulidad 2.408 actas (~43.577 votos en juego vs margen +41.565).
4. **`js/main.js` l.2921 `#val-bayes-desc`** — hardcode `+34.967 / 16-jun` visible aunque JSON esté actualizado.
5. **RM-29 + EW-29 + `regions.norte.executive_alert`** — Piura 23-jun como catalizador 24–72h (monitoreo 22-jun AM).

---

*Generado: 2026-06-19T21:00:00-05:00 · Clasificación: USO OPERATIVO — SENSIBLE · Próximo corte sugerido: 2026-06-22 AM (pre-Piura 23-jun)*