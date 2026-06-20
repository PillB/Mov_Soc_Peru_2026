# Karamba phantom YouTube channels — P2 refresh (post-OjoPúblico)

**Corte:** 2026-06-19 (verificación en vivo)  
**Ronda:** P2 refresh (gap matrix: métricas post-eliminación)  
**Estado global:** **dormant** — operación Karamba sin reactivación; contenido residual archivado en WhatsApp/TikTok (DIS-JUN19-02)  
**Clasificación refresh:** `partial_update` (granularidad de estado por canal verificada; sin métricas nuevas ni follow-up periodístico post-24-jun)

---

## 1. Baseline dossier (pre-refresh)

| Fuente | Dato clave |
|--------|------------|
| OjoPúblico 5-jun-2026 | Karamba Comunicación Digital S.A. (Ecuador) financió **214 anuncios** YouTube (nov-2025 – may-2026); **105 con IA generativa**; promedio **493.000** vistas/anuncio (~32 M impresiones); **6 canales fantasma**; favoreció FP / atacó Sánchez |
| Post-publicación | Canales “desaparecieron” horas después del reportaje |
| `events.json` v3.10.0 | RM-18, EW-17 (VERDE), ENT-KARAMBA `dormant/eliminado`; `cuentas_emergentes` marca 6 canales “dados de baja” |
| `deep_dives_round5_jun24.md` | Sin métricas nuevas 17–24 jun; sin reactivación indexada |

**Canales objetivo (handles canónicos OjoPúblico):**

`@EnfocatePeru` · `@RadarPeruano` · `@CheverePe` · `@SoyIndependiente` · `@Sancochau` · `@ElMachetePeru`

---

## 2. Búsquedas realizadas (19-jun-2026)

| Consulta | Resultado |
|----------|-----------|
| OjoPúblico `?s=Karamba` | Solo artículo original 5-jun; **sin seguimiento** posterior indexado |
| IDL-Reporteros `?s=Karamba` | Sin resultados |
| DuckDuckGo: Karamba + Perú + YouTube + jun 2026 | Republicación Lupa.ec, PDF Derechos Digitales, clips IG 7-jun; **ninguna pieza nueva post-14-jun** |
| Acción judicial Ecuador | **No indexada** en fuentes consultadas |
| El Foco 19-jun-2026 (red internacional trolls pro-FP) | Investigación **adyacente** (Meta/X, 5 empresas, S/615k); **no vincula** explícitamente a los 6 canales Karamba YouTube |
| AFP Factual Perú | Access Denied (sin nuevas verificaciones Karamba) |

---

## 3. Verificación en vivo — 6 canales (HTTP + RSS YouTube)

**Método:** `curl -sI` + feed RSS `channel_id` (19-jun-2026 ~PET).

| Canal | HTTP | Channel ID | Creado (RSS) | Estado Karamba | Evidencia |
|-------|------|------------|--------------|----------------|-----------|
| **@EnfocatePeru** | **404** | — | — | **eliminado** | Página inexistente |
| **@RadarPeruano** | **404** | — | — | **eliminado** | Página inexistente |
| **@Sancochau** / @Sanchochau | **404** | — | — | **eliminado** | Ambas grafías 404 |
| **@CheverePe** | 200 | `UCKwK_8nXcUzBTLr537MtgzA` | 2025-04-01 | **vacío / dormant** | RSS **0 videos**; shell sin contenido Karamba |
| **@SoyIndependiente** | 200 | `UCQmkOpe8u7dIRciMGt1cyfA` | **2008-05-13** | **colisión de handle** | Canal español legacy (“Aznar es independiente”, 2008); **no es** el fantasma Karamba (4 subs / pauta 2026) |
| **@ElMachetePeru** | 200 | `UCUhPrvUFCoxPKmcenamFK6w` | 2023-05-17 | **residual / dormant** | Shorts genéricos `#noticias`; último upload **2026-05-14** (pre-OjoPúblico); **sin** videos IA pro-FP ni pauta post-5-jun |

### Interpretación

- **Operación Karamba en YouTube:** efectivamente **neutralizada** — 3 terminations (404), 3 shells sin reactivación de red Karamba.
- OjoPúblico “eliminados” = retiro de **anuncios/videos de campaña**; YouTube no siempre borra el **handle** (CheverePe, ElMachetePeru).
- **@SoyIndependiente** en URL actual resuelve a un canal **distinto** al documentado por OjoPúblico → riesgo de falso positivo si se monitorea solo por handle.
- **No hay reactivación Karamba** verificada en ninguno de los 6.

---

## 4. Métricas post-eliminación

| Métrica | 5-jun (OjoPúblico) | 19-jun (refresh) | Δ |
|---------|-------------------|------------------|---|
| Anuncios activos | 214 (histórico) | 0 verificados | — |
| Canales con pauta Karamba activa | 6 | 0 | — |
| Vistas nuevas atribuibles Karamba | — | 0 indexadas | — |
| Réplicas WhatsApp/TikTok | DIS-JUN19-02 | Sin conteo nuevo | residual no cuantificado |
| Acción judicial Ecuador | — | No indexada | — |

**Conclusión métrica:** sin actualización numérica justificada; mantener cifras OjoPúblico como baseline histórico.

---

## 5. Disinfo cases / EW — recomendación

| ID | Acción |
|----|--------|
| DIS-JUN19-02 | Mantener; añadir nota “verificación handles 19-jun” (opcional) |
| EW-17 | Mantener **VERDE**; actualizar `next_check` y nota granular 3+3 canales |
| ENT-KARAMBA | Refresh `nota` + `verificado` 19-jun |
| Nuevo DIS case | **No** — El Foco 19-jun es red paralela, no verificada como extensión Karamba YT |

---

## 6. Fuentes citadas

1. [OjoPúblico — Granja de videos Karamba](https://ojo-publico.com/6338/empresa-ecuatoriana-pago-por-anuncios-youtube-favor-fujimori) (5-jun-2026)
2. [Lupa.ec — Empresa ecuatoriana elecciones Perú](https://lupa.com.ec/explicativos/empresa-ecuatoriana-elecciones-peru/)
3. Verificación técnica: `https://www.youtube.com/@{handle}` + RSS feeds (19-jun-2026)
4. `research/social/social_jun19.md` — DIS-JUN19-02 réplicas post-eliminación
5. `research/entities/deep_dives_round5_jun24.md` — baseline dormant 17–24 jun

---

## 7. Return to parent

**Status:** `partial_update` (verificación canal-a-canal; operación sigue **dormant**)

**JSON patches sugeridos:** ver bloque devuelto al agente padre.

**Próximo check sugerido:** 26-jun-2026 — re-scan HTTP 6 handles + búsqueda judicial Ecuador / ONPE gastos FP.