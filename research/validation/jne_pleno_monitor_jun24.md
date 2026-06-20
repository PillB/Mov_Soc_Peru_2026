# Monitor JNE pleno — nulidad 2.408 actas (JP/FP)

**Corte de búsqueda:** 2026-06-24T10:00:00-05:00 PET  
**Agente:** OSINT validation subagent  
**Objetivo:** Verificar si el JNE publicó resolución de pleno sobre recursos de nulidad que afectan ~2.408 actas (1.751 Lima + 647 EE.UU.).

---

## Resumen ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| ¿Resolución escrita publicada en portal JNE? | **NO** — al 24-jun 10:00 |
| ¿Pleno votó sentido del voto? | **SÍ** — audiencia 19-jun ~22:00 |
| ¿Impacto en 2.398 mesas JP? | Apelaciones declaradas **infundadas** (sentido del voto); actas mantienen validez |

---

## Estado en `events.json` (pre-monitor)

```json
"escrutinio_realtime.jne_nulidad_2408": {
  "pleno_resolucion_23jun": "no_publicada",
  "pleno_resolucion_24jun": "no_publicada",
  "resolucion_publicada": false,
  "nota_24jun": "JEE improcedente documentado; apelación pleno sin resolución publicada al 24-jun 10:00."
}
```

`executive_alert` (línea 46–50): headline y catalysts indican **resolución no publicada**; riesgo CRÍTICO en ventana 24–72 h.

---

## Metodología de búsqueda

1. Portal institucional: `portal.jne.gob.pe` (notas 20357, 20359, Elecciones 2026, API audiencias).
2. Cobertura verificada: RPP, La República, Infobae, Canal N.
3. Transmisión oficial: Facebook JNE (`/JNE.Peru/videos/...improcedentes-apelaciones...`).
4. Cruce con `research/validation/pipeline_jun24.md` y bloque `jne_nulidad_2408` en `data/events.json`.

---

## Hallazgos

### 1. Resolución escrita del pleno — NO PUBLICADA

- **Sin resolución indexada** en portal JNE al corte 24-jun 10:00 (coherente con `pipeline_jun24.md` y `pleno_resolucion_24jun: no_publicada`).
- RPP (19-jun 23:20): *"las resoluciones detalladas, que contienen los fundamentos jurídicos de cada decisión, **serán publicadas próximamente** en su portal institucional"* — [RPP 1693871](https://rpp.pe/politica/elecciones/jne-declaro-infundadas-las-apelaciones-de-juntos-por-el-peru-que-solicitaban-nulidad-masiva-de-mesas-de-votacion-lima-y-america-noticia-1693871).
- Infobae (19-jun 22:45): *"las resoluciones con los fundamentos de cada decisión serán publicadas en los **próximos días**"* — [Infobae 20-jun](https://www.infobae.com/peru/2026/06/20/derrota-para-roberto-sanchez-jne-rechaza-pedido-de-juntos-por-el-peru-para-anular-actas-en-lima-y-el-extranjero/).
- **No se inventa** número de resolución ni texto oficial; no hay PDF/Res. N.° verificable en fuente primaria indexada.

### 2. Sentido del voto — SÍ DECIDIDO (19-jun, no = resolución publicada)

Audiencia pública virtual del pleno JNE, viernes **19-jun-2026** (~10:30 inicio; resultados ~22:00).

| Expediente / bloque | Mesas / actas | Sentido del voto | Fuente |
|---------------------|---------------|------------------|--------|
| Apelación JP — Lima Metropolitana | 1.751 mesas | **Infundada** | [RPP](https://rpp.pe/politica/elecciones/jne-declaro-infundadas-las-apelaciones-de-juntos-por-el-peru-que-solicitaban-nulidad-masiva-de-mesas-de-votacion-lima-y-america-noticia-1693871), [Infobae](https://www.infobae.com/peru/2026/06/20/derrota-para-roberto-sanchez-jne-rechaza-pedido-de-juntos-por-el-peru-para-anular-actas-en-lima-y-el-extranjero/) |
| Apelación JP — EE.UU. (América) | 647 mesas | **Infundada** | [RPP](https://rpp.pe/politica/elecciones/jne-declaro-infundadas-las-apelaciones-de-juntos-por-el-peru-que-solicitaban-nulidad-masiva-de-mesas-de-votacion-lima-y-america-noticia-1693871), [La República](https://larepublica.pe/politica/2026/06/19/jne-declara-improcedente-apelaciones-de-juntos-por-el-peru-para-anular-mesas-en-lima-y-eeuu-hnews-945706) |
| Otras 27 apelaciones (actas observadas) | varias | **Infundadas** | [Infobae](https://www.infobae.com/peru/2026/06/20/derrota-para-roberto-sanchez-jne-rechaza-pedido-de-juntos-por-el-peru-para-anular-actas-en-lima-y-el-extranjero/) |
| 1 acta observada Europa | 1 | **Fundada en parte** | [RPP](https://rpp.pe/politica/elecciones/jne-declaro-infundadas-las-apelaciones-de-juntos-por-el-peru-que-solicitaban-nulidad-masiva-de-mesas-de-votacion-lima-y-america-noticia-1693871) |
| 1 expediente Europa | — | Pendiente de votación | [Infobae](https://www.infobae.com/peru/2026/06/20/derrota-para-roberto-sanchez-jne-rechaza-pedido-de-juntos-por-el-peru-para-anular-actas-en-lima-y-el-extranjero/) |
| 1 expediente | — | Sin efecto (retirado) | [Infobae](https://www.infobae.com/peru/2026/06/20/derrota-para-roberto-sanchez-jne-rechaza-pedido-de-juntos-por-el-peru-para-anular-actas-en-lima-y-el-extranjero/) |

**Total revisado:** 32 expedientes de apelación (Infobae/RPP).

**Nota terminológica:** medios usan *infundadas* (RPP, Infobae) e *improcedentes* (La República) para el mismo bloque Lima+EE.UU.; en audiencia JP admitió fraude como hipótesis **sin prueba documental** ([Infobae 19-jun](https://www.infobae.com/peru/2026/06/19/juntos-por-el-peru-admite-ante-el-jne-que-cree-que-hubo-fraude-en-2398-mesas-pero-no-tiene-prueba-de-ello/)).

**Impacto en actas disputadas (~2.408):** con sentido del voto infundado, se **ratifica validez** de las 1.751 + 647 mesas; ~43.577 votos en juego (estimación dossier) **no se anulan** por esta vía. Última instancia electoral; sin nueva apelación (Infobae/La República).

### 3. Antecedente JEE (primera instancia) — ya documentado

| Jurisdicción | Resolución JEE | Fecha | Resultado | Motivo |
|--------------|----------------|-------|-----------|--------|
| Lima Centro 2 (647 EE.UU.) | 09494-2026-JEE-LIC2/JNE | 11-jun | Improcedente | Falta tasa + prueba material |
| Lima Centro 1 (1.751 Lima) | — | 11-jun | Improcedente | Falta tasa + prueba material |

Fuentes: [Canal N EE.UU.](https://canaln.pe/actualidad/jne-improcedente-nulidad-juntos-peru-mesas-extranjero-n492715), [Canal N Lima](https://canaln.pe/actualidad/jee-lima-centro-1-declara-improcedente-pedido-juntos-peru-anular-mas-1751-mesas-lima-n492711).

### 4. Contexto FP Puno (fuera del bloque 2.408, referencia)

- 7 recursos FP en Puno; FP anunció **no apelar** (14-jun) — [Infobae FP Puno](https://www.infobae.com/peru/2026/06/14/fuerza-popular-anuncia-que-no-apelara-la-decision-del-jne-sobre-solicitud-de-anulacion-de-actas-en-puno/).

### 5. Cronograma esperado vs. real

| Fecha | Evento esperado | Observado |
|-------|-----------------|-----------|
| 17-jun | Previsión audiencia pleno (Infobae) | Citación expediente SEPEG.2026002127 |
| 19-jun | Audiencia + votación | **Realizada**; sentido del voto difundido |
| 23–27-jun | Publicación resolución escrita (`plazo_estimado` dossier) | **Pendiente** al 24-jun 10:00 |
| 24-jun 10:00 | Corte monitor | `no_publicada` confirmado |

---

## Conclusión monitor 24-jun

**Estado `pleno_resolucion_24jun: no_publicada` — CONFIRMADO.**

Distinción crítica anti-alucinación:
- ✅ **Verificado:** pleno votó; apelaciones JP Lima+EE.UU. = infundadas; 32 expedientes resueltos en sesión 19-jun.
- ❌ **No verificado / no publicado:** resolución escrita con número, fundamentos y URL en portal JNE.

---

## Parches JSON recomendados

Solo parches con evidencia verificada. **No** marcar `resolucion_publicada: true` sin documento oficial indexado.

### Parches accionables (sentido del voto 19-jun)

```json
{
  "escrutinio_realtime.jne_nulidad_2408.resolucion_19jun": "sentido_voto_infundadas_escrita_pendiente",
  "escrutinio_realtime.jne_nulidad_2408.sentido_voto_19jun": {
    "lima_1751": "infundada",
    "eeuu_647": "infundada",
    "otras_actas_observadas_27": "infundadas",
    "europa_1": "fundada_en_parte",
    "expedientes_totales": 32,
    "fecha_audiencia": "2026-06-19",
    "fuente_primaria_medios": "https://rpp.pe/politica/elecciones/jne-declaro-infundadas-las-apelaciones-de-juntos-por-el-peru-que-solicitaban-nulidad-masiva-de-mesas-de-votacion-lima-y-america-noticia-1693871"
  },
  "escrutinio_realtime.jne_nulidad_2408.estado_19jun": "sentido_voto_emitido",
  "escrutinio_realtime.jne_nulidad_2408.nota_24jun": "Sentido del voto 19-jun: apelaciones JP Lima+EE.UU. infundadas (RPP/Infobae/LR). Resolución escrita sin publicar en portal al 24-jun 10:00."
}
```

### Sin cambio (mantener hasta PDF/Res. oficial)

```json
{
  "escrutinio_realtime.jne_nulidad_2408.resolucion_publicada": false,
  "escrutinio_realtime.jne_nulidad_2408.pleno_resolucion_24jun": "no_publicada"
}
```

### Parche opcional `executive_alert` (refinar narrativa)

```json
{
  "executive_alert.catalysts[1]": "JNE pleno: sentido del voto 19-jun infundó apelaciones JP 2.398 mesas; **resolución escrita no publicada** (JEE previo improcedente por tasa/prueba)."
}
```

---

## Próximo check

1. Portal JNE → resoluciones pleno / notas de prensa post-19-jun (buscar Res. N.° con fundamentos).
2. `portal.jne.gob.pe/portal_documentos/` — PDF nulidad SEPEG.2026002127.
3. Actualizar `pleno_resolucion_25jun` / `pleno_resolucion_26jun` si sigue sin publicación en ventana 23–27-jun.

---

## Fuentes citadas

| Medio | URL | Fecha |
|-------|-----|-------|
| RPP | https://rpp.pe/politica/elecciones/jne-declaro-infundadas-las-apelaciones-de-juntos-por-el-peru-que-solicitaban-nulidad-masiva-de-mesas-de-votacion-lima-y-america-noticia-1693871 | 19-jun-2026 |
| Infobae | https://www.infobae.com/peru/2026/06/20/derrota-para-roberto-sanchez-jne-rechaza-pedido-de-juntos-por-el-peru-para-anular-actas-en-lima-y-el-extranjero/ | 19-jun-2026 |
| La República | https://larepublica.pe/politica/2026/06/19/jne-declara-improcedente-apelaciones-de-juntos-por-el-peru-para-anular-mesas-en-lima-y-eeuu-hnews-945706 | 19-jun-2026 |
| Infobae (audiencia) | https://www.infobae.com/peru/2026/06/19/juntos-por-el-peru-admite-ante-el-jne-que-cree-que-hubo-fraude-en-2398-mesas-pero-no-tiene-prueba-de-ello/ | 19-jun-2026 |
| Canal N (JEE) | https://canaln.pe/actualidad/jne-improcedente-nulidad-juntos-peru-mesas-extranjero-n492715 | 11-jun-2026 |
| JNE Facebook (live) | https://www.facebook.com/JNE.Peru/videos/envivo-pleno-del-jne-declara-improcedentes-apelaciones-presentadas-por-jp/1001781519260084/ | 19-jun-2026 |