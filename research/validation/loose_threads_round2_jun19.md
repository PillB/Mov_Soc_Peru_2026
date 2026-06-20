# OSINT Validation — Loose Threads Round 2
## Corte: 2026-06-19T21:00:00-05:00 (PET)

**Agente:** OSINT validation sweep · Mov_Soc_Peru_2026  
**Fuentes base:** `research/context/escrutinio_jun19.md` · `research/regional/*.md` · `research/social/social_jun19.md` · `data/events.json` v3.8.1  
**Metodología:** Re-fetch primarias (LR, RPP, Infobae, El Búho, Norte Sostenible, JNE portal) + reconciliación cruzada. Inciertos etiquetados explícitamente.

---

## BLUF

De 10 hilos abiertos del round 1, **2 quedan RESUELTOS** (marcha 19-jun ejecutada con magnitud acotada; La Oroya sin bloqueo), **5 PARCIAL** (asistencia sin cifra oficial; acampamento activo sin reconteo; CGTP 17-jun desmentida; corredores oriente latentes; disinfo sin métricas), **3 ABIERTO** (JNE 2.408 actas; PJ amparo; autoconvocatoria 22-jun). **Nueva convocatoria confirmada:** Piura arrocera **23-jun**.

---

## Tabla resumen (10 hilos)

| # | Hilo | Status | Magnitud / estimación | Patch JSON recomendado |
|---|------|--------|----------------------|------------------------|
| 1 | Asistencia exacta marcha 19-jun Lima | **PARCIAL** | **350–900** (cientos; no miles) | `events.json` marcha JP → `estado: realizada`, `participantes_est: 350-900` |
| 2 | JNE resolución 2.408 actas nulidad (19-jun) | **ABIERTO** | Audiencia sustentada; resolución **no publicada** al 19-jun ~21:00 | `escrutinio` → `jne_nulidad_2408_estado: pendiente` |
| 3 | PJ amparo voto exterior — admisión | **ABIERTO** | Presentado 16-jun; **sin admisión/rechazo** indexado 17–19 | `early_warning` EW amparo → `estado: presentado_sin_resolucion` |
| 4 | Acampamento JNE headcount 19-jun | **PARCIAL** | **~80 carpas** (último conteo 16-jun); **50–150** personas est. | `acampamento_jne` → `carpas: 80`, `reconteo_19jun: no_confirmado` |
| 5 | CGTP convocatoria 17-jun | **PARCIAL** | **NO ejecutada** como paro CGTP; vigilia JP sí (continuidad plantón) | Corregir BLUF/EW-19; `CGTP 17-jun: no_verificada` |
| 6 | Autoconvocatoria Instagram 22-jun Plaza San Martín | **ABIERTO** | Reel `DZQNoG-pSIU` vigente; **sin respaldo JP**; P=0,40 | `lima_NEW_18` → `fecha: 2026-06-22`, `prob: 0.40` |
| 7 | Carretera Central La Oroya status | **RESUELTO** | **Transitable**; sin bloqueo protesta 17–19 | `EW-20` La Oroya → `bloqueo_activo: false` |
| 8 | Federico Basadre / FB Terry reactivación | **PARCIAL** | **Sin bloqueo activo**; riesgo latente arrocero (P≈0,35–0,55) | `prob_bloqueo_federico_basadre: 0.35` mantener |
| 9 | Falsa proclamación disinfo — métricas | **PARCIAL** | Veredicto FALSO reconfirmado; **métricas cuantitativas no disponibles** | Nuevo registro `DIS-JUN19-01` con `spread_metrics: null` |
| 10 | Nuevas convocatorias 20–23 jun | **PARCIAL** | **Piura 23-jun confirmada**; 22-jun autoconvocada latente; sin JP formal 20–21 | Patch `NORTE-PARO-023` vigente; añadir `SUR-C19-04` Samillán jul |

---

## 1. Asistencia exacta marcha 19-jun Lima

**Status:** `PARCIAL`

### Evidencia
| Fuente | Dato clave | URL |
|--------|-----------|-----|
| La República EN VIVO (19:01) | **"Cientos de ciudadanos"**; cierre cobertura sin cifra PNP/MML | [LR 526014](https://larepublica.pe/politica/2026/06/19/marchas-en-lima-en-vivo-simpatizantes-de-juntos-por-el-peru-protestan-por-resultados-de-la-segunda-vuelta-entre-roberto-sanchez-y-keiko-fujimori-hnews-526014) |
| Infobae (21:18) | **"Cientos de simpatizantes"**; ruta real Paseo Colón → Centro Histórico | [Infobae marcha](https://www.infobae.com/peru/2026/06/19/marcha-justicia-electoral-en-vivo-hoy-19-de-junio-cierres-desvios-y-a-que-hora-sera-la-movilizacion-convocada-por-roberto-sanchez-y-juntos-por-el-peru/) |
| RPP | Sánchez salió de **av. 9 de Diciembre (Paseo Colón)**, no Campo de Marte | [RPP 1693850](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850) |
| El Búho | Delegaciones Cusco/Puno/Loreto; movilización ~17:30 Centro Cívico | [El Búho 19-jun](https://elbuho.pe/2026/06/mas-de-7-mil-policias-restriccion-vehicular-amenazas-del-alcalde-de-lima-para-marcha-de-jp-en-defensa-del-voto/) |

### Magnitud estimada (OSINT)
| Indicador | Valor |
|-----------|-------|
| Rango conservador | **200–600** |
| Rango central | **350–900** |
| Techo plausible (pico simultáneo + balcones Paseo Colón) | **~1.200** |
| Proyección previa JP (`events.json`) | 3.000–15.000 → **no materializada** |
| Confianza | Media (convergencia textual "cientos"; sin foto aérea ni dato PNP) |

**Hechos adicionales resueltos:** Marcha **ejecutada**, pacífica, sin incidentes graves. Ruta real ≠ Campo de Marte (cordon PNP). PNP: +7.000 efectivos Lima.

### Patch JSON recomendado
```json
{
  "path": "data/events.json → convocatorias Lima marcha 19-jun",
  "patch": {
    "estado": "realizada",
    "fecha_ejecucion": "2026-06-19",
    "ubicacion_real": "Paseo Colón / Centro Histórico (no Campo de Marte)",
    "participantes_est": "350-900",
    "participantes_est_metodo": "triangulación medios (cientos) + comparación marcha 13-jun (miles)",
    "magnitud_estimada": "baja-media",
    "es_pasado": true,
    "probabilidad_realizacion": 1.0
  }
}
```

---

## 2. JNE resolución 2.408 actas nulidad — ¿decisión 19-jun?

**Status:** `ABIERTO` (no confirmado)

### Evidencia
| Fecha | Hecho | Fuente |
|-------|-------|--------|
| 19-jun AM | Roy Mendoza sustentó **2.408 actas** (1.751 Lima + 647 EE.UU.); claim **583 patrones anómalos** | [RPP 1693777](https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777) |
| 18-jun | JNE programó evaluación 19-jun; magistrados **hasta 3 días hábiles** | [LR 1139454](https://larepublica.pe/politica/2026/06/18/jne-decidira-manana-si-acepta-pedido-de-nulidad-de-mesas-en-lima-mas-de-43-mil-votos-en-juego-hnews-1139454) |
| 19-jun ~21:00 | **Sin resolución publicada** en portal JNE ni cobertura de fallo | [portal.jne.gob.pe](https://portal.jne.gob.pe/portal/) · `escrutinio_jun19.md` §2 |
| 19-jun | Mendoza: resolución **"a más tardar la próxima semana"** | RPP 1693777 |

**Impacto potencial (si fundada nulidad Lima):** ~43.577 votos netos en juego vs margen +41.565 (ONPE 19-jun).

### Patch JSON recomendado
```json
{
  "path": "research/context/escrutinio_jun19.md → JSON-ready + data/events.json meta",
  "patch": {
    "jne_nulidad_2408": {
      "audiencia_19jun": "sustentada",
      "resolucion_19jun": "no_confirmada",
      "plazo_estimado": "semana 23-27-jun",
      "actas_disputa": 2408,
      "mesas_lima": 1751,
      "mesas_eeuu": 647
    }
  }
}
```

---

## 3. PJ amparo voto exterior — admisión

**Status:** `ABIERTO` (no confirmado)

### Evidencia
| Fecha | Hecho | Fuente |
|-------|-------|--------|
| 16-jun | Walter Ayala presentó amparo vs. Resolución Jefatural N.° 90-2026-JN/ONPE | [LR 174096](https://larepublica.pe/politica/2026/06/16/juntos-por-el-peru-presenta-demanda-de-amparo-ante-el-pj-para-anular-votos-del-extranjero-hay-una-norma-que-no-debio-existir-hnews-174096) |
| 17–19-jun | Búsqueda en medios verificados: **sin noticia de admisión, rechazo ni medida cautelar** | `escrutinio_jun19.md` §3 |
| 19-jun | Cancillería rechazó "interferencia" y garantizó custodia material exterior | [RPP 1693786](https://rpp.pe/politica/elecciones/segunda-vuelta-2026-cancilleria-rechaza-interferencia-y-garantiza-custodia-de-material-electoral-del-exterior-noticia-1693786) |

**Nota:** La admisión en amparo puede no generar cobertura mediática inmediata; requiere consulta `consultaexpediente.pj.gob.pe` (no verificada en este sweep).

### Patch JSON recomendado
```json
{
  "path": "data/events.json → early_warning_indicators[amparo]",
  "patch": {
    "estado": "presentado",
    "admision_pj": "no_confirmada",
    "fecha_presentacion": "2026-06-16",
    "prob_impacto": 0.15,
    "impacto": "CRITICO"
  }
}
```

---

## 4. Acampamento JNE headcount 19-jun

**Status:** `PARCIAL`

### Evidencia
| Indicador | 16-jun | 19-jun |
|-----------|--------|--------|
| Carpeta contadas | **~80** en Parque Bausate y Meza, jr. Nazca | **Sin reconteo** |
| PNP en inmediaciones | Sí (16-jun) | **Sí** — LR EN VIVO 15:40, 16:34 |
| Desmantelamiento | — | **No reportado** |
| Vallejo (ronderos) | Convocatoria nacional refuerzo | Sin declaración nueva 17–19 indexada |

Fuente carpas: [RPP 1693265](https://rpp.pe/peru/actualidad/simpatizantes-de-juntos-por-el-peru-dicen-que-seguiran-acampando-frente-al-jne-noticia-1693265) (16-jun 10:01).

### Magnitud estimada
| Métrica | Estimación |
|---------|------------|
| Carpeta | **~80** (referencia 16-jun, probablemente vigente) |
| Personas en plantón | **50–150** (1–2 por carpa promedio; rotación por marcha 19-jun) |
| Confianza carpas | Media-alta (continuidad sin evidencia de retiro) |
| Confianza personas | Baja (sin conteo terreno 19-jun) |

### Patch JSON recomendado
```json
{
  "path": "data/events.json → plantón JNE",
  "patch": {
    "carpas_ultimo_conteo": 80,
    "fecha_conteo_carpas": "2026-06-16",
    "activo_19jun": "probable",
    "personas_est": "50-150",
    "pnp_19jun": true,
    "fuente": "RPP 1693265 + LR 526014"
  }
}
```

---

## 5. CGTP convocatoria 17-jun — ¿ocurrió?

**Status:** `PARCIAL` (corrección: **NO como CGTP**)

### Evidencia
| Actor | 17-jun | Veredicto |
|-------|--------|-----------|
| **CGTP** (`@cgt_peru`) | Sin comunicado formal de paro/marcha 17-jun indexado | **NO VERIFICADA** |
| **JP** | Convocó plantones/vigilias nacionales 17-jun | Convocatoria formal [LR 1501216](https://larepublica.pe/politica/2026/06/16/juntos-por-el-peru-convoca-a-marcha-nacional-en-defensa-del-voto-para-este-19-de-junio-hnews-1501216) |
| Plantón JNE | Continuo desde 9-jun (~80 carpas) | **Continuidad verificada** (16-jun); pico específico 17-jun **sin cobertura numérica** |
| Vigilias regionales 17-jun | Sin reporte independiente de magnitud/incidentes | **no confirmado** |

**Conclusión operativa:** El 17-jun **no hubo paro CGTP verificable**. Lo que ocurrió (con alta probabilidad) fue **continuidad del acampamento JNE** + vigilias JP convocadas sin pico mediático documentado.

### Patch JSON recomendado
```json
{
  "path": "data/events.json → BLUF + EW-19",
  "patch": {
    "cgtp_17jun": "no_verificada",
    "jp_vigilias_17jun": "parcialmente_verificada_continuidad_planton",
    "correccion": "Eliminar referencias a paro CGTP 17-jun en headline si persisten"
  }
}
```

---

## 6. Autoconvocatoria Instagram 22-jun Plaza San Martín

**Status:** `ABIERTO`

### Evidencia
| Campo | Detalle |
|-------|---------|
| Origen | Reel Instagram `DZQNoG-pSIU` — detectado en `events.json` (`lima_NEW_18`) |
| Convocante | Colectivos / Pachamama Radio Lima (`@PachamamaRadio_`) — **sin respaldo JP oficial** |
| Ruta propuesta | Plaza San Martín → Garcilaso → Nazca → JNE |
| Contexto 19-jun | MML restricciones Centro Histórico hasta **22-jun 00:00** ([LR tráfico](https://larepublica.pe/sociedad/2026/06/19/congestion-por-el-cierre-del-centro-historico-hoy-en-vivo-minuto-a-minuto-del-trafico-en-tiempo-real-por-las-restricciones-de-la-municipalidad-de-lima-1725675)) |
| Post-marcha 19-jun | **Sin reamplificación verificada** del reel en medios ni handles JP |

### Magnitud proyectada (si materializa)
| Escenario | Rango | Prob. |
|-----------|-------|-------|
| Plantón reducido | 500–1.500 | 0,40 |
| Marcha media | 1.500–3.000 | 0,25 |
| No materialización | — | 0,35 |

### Patch JSON recomendado
```json
{
  "path": "data/events.json → lima_NEW_18",
  "patch": {
    "fecha": "2026-06-22T10:00:00-05:00",
    "titulo": "Marcha autoconvocada Plaza San Martín — 22 jun",
    "estado": "no_verificada",
    "prob_materializacion": 0.40,
    "participantes_proyectados": { "min": 500, "max": 3000, "central": 1200 },
    "verificacion_pendiente": true
  }
}
```

---

## 7. Carretera Central La Oroya status

**Status:** `RESUELTO` — **transitable, sin bloqueo protesta**

### Evidencia
| Corredor | Estado 17–19 jun | Fuente |
|----------|------------------|--------|
| Carretera Central km 90–180 (La Oroya–Tarma) | **NO bloqueo**; posible congestión obras km ~90 | `norte_centro_oriente_jun19.md` · EW-20 |
| Protesta Pariahuanca | **Huancayo/GORE** (ambiental); acuerdo 19-jun noche | [HYTimes 19-jun](https://hytimes.pe/2026/06/19/gobierno-regional-cede-y-emitira-ordenanza-para-proteger-el-huaytapallana-y-cabeceras-de-cuenca/) |
| RPP Junín 17–19 | Sin nota de corte vial La Oroya | Ausencia + cobertura regional |

**Distinción:** Pariahuanca (~**cientos**, no 10.000) fue protesta **estacionaria** frente al GORE, no bloqueo de Carretera Central.

### Patch JSON recomendado
```json
{
  "path": "data/events.json → early_warning EW-20 + risk_matrix centro",
  "patch": {
    "la_oroya_bloqueo_activo": false,
    "la_oroya_nota": "Solo congestión obras km ~90; levantado desde mayo-2026",
    "prob_bloqueo_carretera_central": 0.40
  }
}
```

---

## 8. Federico Basadre / FB Terry — señales de reactivación

**Status:** `PARCIAL` — sin bloqueo activo; riesgo latente

### Evidencia
| Corredor | Último bloqueo | Estado 17–19 jun | Señal reactivación |
|----------|----------------|------------------|-------------------|
| **Federico Basadre** km 80–150 (Ucayali) | 29-may ([RPP 1690744](https://rpp.pe/peru/ucayali/ucayali-acceso-a-pucallpa-permanece-bloqueado-por-paro-de-agricultores-arroceros-noticia-1690744)) | **Levantado**; RPP Ucayali 17–19: sismo, rescates — **sin paro** | Gobernador 28-may: arroceros "firmes"; tregua pre-2.ª vuelta vencida |
| **FB Terry** km 400–742 (San Martín) | Paro suspendido pre-7-jun | **Sin bloqueo** indexado 17–19 | Convocatoria latente arrocera (Infobae mayo) |

**Evaluación:** Corredores **transitables** al 19-jun. Probabilidad reactivación **24–72 h:** Federico Basadre P≈**0,35–0,55**; FB Terry P≈**0,50** (tregua agro vencida, sin materialización aún).

### Patch JSON recomendado
```json
{
  "path": "data/events.json → risk_matrix.oriente",
  "patch": {
    "federico_basadre_activo": false,
    "federico_basadre_ultimo_bloqueo": "2026-05-29",
    "fb_terry_activo": false,
    "prob_bloqueo_federico_basadre": 0.35,
    "prob_bloqueo_fb_terry": 0.50,
    "senal_reactivacion": "latente_sin_comunicado_nuevo_17-19"
  }
}
```

---

## 9. Falsa proclamación disinfo — métricas de difusión

**Status:** `PARCIAL` — veredicto reconfirmado; métricas cuantitativas **no disponibles**

### Evidencia
| Campo | Detalle |
|-------|---------|
| Claim (DIS-JUN19-01) | Keiko ya proclamada presidenta electa | 
| Veredicto | **FALSO** — JNE proclamó solo legislativos 19-jun | [RPP 1693837](https://rpp.pe/politica/elecciones/jne-proclama-los-resultados-de-los-senadores-diputados-y-parlamentarios-andinos-noticia-1693837) |
| Verificadores | EFE Verifica, AFP Factual (round 1) |
| Plataformas | Facebook, WhatsApp, X (qualitativo) |
| Catalizador 19-jun | Proclamación **congresal** mismo día → riesgo confusión legislativo/presidencial |
| Métricas | **No indexadas** (shares, reach, CrowdTangle, etc.) en fuentes consultadas |

### Estimación cualitativa de amplificación
| Vector | Intensidad estimada | Confianza |
|--------|---------------------|-----------|
| WhatsApp cadenas | Media (recirculación post-JNE legislativo) | Baja |
| X/TikTok | Baja–media | Baja |
| Pico #FujimoriPresidenta | Observado en `social_jun19.md` | Media |
| Interacción @RobertoSanchP post denuncia | ~203K quotes (X, 19-jun) — **contra-narrativa**, no disinfo FP |

### Patch JSON recomendado
```json
{
  "path": "data/events.json → disinformation o nueva sección social_intel",
  "patch": {
    "id": "DIS-JUN19-01",
    "veredicto": "FALSO",
    "spread_metrics": {
      "reach_est": null,
      "shares_est": null,
      "platforms": ["Facebook", "WhatsApp", "X"],
      "amplificacion_19jun": "media_cualitativa_post_proclamacion_legislativa",
      "metricas_cuantitativas": "no_confirmado"
    }
  }
}
```

---

## 10. Nuevas convocatorias 20–23 jun (descubrimiento)

**Status:** `PARCIAL` — inventario actualizado

### Confirmadas / vigentes
| ID | Fecha | Evento | Región | Prob. | Fuente |
|----|-------|--------|--------|-------|--------|
| **NORTE-PARO-023** | **23-jun ~08:00** | Movilización arrocera Piura-Sechura | Piura | **0,85** | [Norte Sostenible](https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/) |
| **INST-MML-001** | 20–22-jun | Cierre vehicular Centro Histórico Lima | Lima | **1,0** | LR tráfico 19-jun |
| **SUR-C19-03** | 25-jun | Reunión Zósimo Cárdenas ↔ Pariahuanca | Junín | **0,80** | HYTimes 19-jun |

### Latentes / no verificadas
| ID | Fecha | Evento | Prob. | Notas |
|----|-------|--------|-------|-------|
| **lima_NEW_18** | 22-jun | Autoconvocatoria Plaza San Martín | 0,40 | Reel Instagram; sin JP |
| **SUR-C19-04** | 15–28-jul | Marcha Raúl Samillán (Puno→Lima) | 0,70 | [Evidencia.pe 19-jun](https://evidencia.pe/raul-samillan-keiko-fujimori-posiblemente-este-gobernando-y-dios-nos-salve/) |
| **SUR-C19-05** | TBD | CNUL/Fenatep Puno→Lima | 0,15–0,25 | Convocatoria 11-jun sin ejecutar |

### No encontradas
- **Nueva marcha formal JP** en Lima 20–23 jun (tras 19-jun).
- **Paro CGTP** reactivado 20–23 jun.
- **Bloqueo Ilave** 20–23 jun (riesgo latente P≈0,35).

### Patch JSON recomendado
```json
{
  "path": "data/events.json → convocatorias activas ventana 20-23",
  "patch": {
    "nuevas_confirmadas": ["NORTE-PARO-023", "INST-MML-001"],
    "nuevas_latentes": ["lima_NEW_18", "SUR-C19-04"],
    "jp_marcha_post_19jun": false,
    "monitoreo_prioritario": "2026-06-22 Piura pre-23-jun"
  }
}
```

---

## Matriz de confianza del sweep

| Nivel | Hilos |
|-------|-------|
| Alta | Marcha ocurrió; La Oroya libre; Piura 23-jun vigente; CGTP 17-jun no verificada |
| Media | Magnitud marcha; acampamento activo; corredores oriente latentes |
| Baja | Métricas disinfo; headcount exacto carpas 19-jun; admisión PJ (sin consulta expediente) |

---

## Brechas remanentes (round 3 sugerido)

1. Consulta expediente PJ amparo Walter Ayala (`consultaexpediente.pj.gob.pe`).
2. Portal JNE resoluciones pleno — nulidad Lima/EE.UU. (ventana 20–24 jun).
3. Reconteo terreno acampamento JNE + Instagram reel 22-jun (48 h pre-evento).
4. CrowdTangle / WhatsApp monitor DIS-JUN19-01 post-proclamación legislativa.
5. SUTRAN estados corredores Federico Basadre y FB Terry (22-jun AM).

---

## Fuentes primarias consultadas (round 2)

| Medio | URL | Uso |
|-------|-----|-----|
| La República — Marcha EN VIVO | https://larepublica.pe/politica/2026/06/19/marchas-en-lima-en-vivo-simpatizantes-de-juntos-por-el-peru-protestan-por-resultados-de-la-segunda-vuelta-entre-roberto-sanchez-y-keiko-fujimori-hnews-526014 | Asistencia "cientos" |
| La República — Balance marcha | https://larepublica.pe/politica/2026/06/19/marcha-por-el-voto-en-lima-sanchez-lidero-movilizacion-marcada-por-presencia-policial-hnews-652517 | Desarrollo 19-jun |
| Infobae — Marcha Justicia Electoral | https://www.infobae.com/peru/2026/06/19/marcha-justicia-electoral-en-vivo-hoy-19-de-junio-cierres-desvios-y-a-que-hora-sera-la-movilizacion-convocada-por-roberto-sanchez-y-juntos-por-el-peru/ | Cientos; ruta real |
| RPP — Nulidad 2.408 actas | https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777 | Audiencia JNE |
| RPP — Acampamento ~80 carpas | https://rpp.pe/peru/actualidad/simpatizantes-de-juntos-por-el-peru-dicen-que-seguiran-acampando-frente-al-jne-noticia-1693265 | Headcount carpas |
| El Búho — Marcha JP + delegaciones | https://elbuho.pe/2026/06/mas-de-7-mil-policias-restriccion-vehicular-amenazas-del-alcalde-de-lima-para-marcha-de-jp-en-defensa-del-voto/ | Sur/oriente en Lima |
| Norte Sostenible — Piura 23-jun | https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/ | Convocatoria nueva |
| La República — Amparo PJ | https://larepublica.pe/politica/2026/06/16/juntos-por-el-peru-presenta-demanda-de-amparo-ante-el-pj-para-anular-votos-del-extranjero-hay-una-norma-que-no-debio-existir-hnews-174096 | Amparo presentado |

---

*Generado: 2026-06-19T21:00:00-05:00 · Clasificación: USO OPERATIVO — SENSIBLE · Próximo corte: 2026-06-22 AM (pre-Piura 23-jun)*