# MEGA_PROMPT v4 — Matriz de brechas vs dossier v3.9.3

**Corte:** 2026-06-19T23:30 PET · **Base:** `MEGA_PROMPT_dossier_osint_v4.md` §2–§3 vs `data/events.json` v3.9.3

## Leyenda

| Estado | Significado |
|--------|-------------|
| ✅ | Alineado con MEGA_PROMPT |
| ⚠️ | Parcial / stale |
| ❌ | Ausente o no ejecutado |
| 🆕 | Añadido post-MEGA_PROMPT (v3.6–v3.9) |

---

## §2 Inventario de secciones

| Sección MEGA_PROMPT | ID DOM | Estado | Campo / brecha stale | P | Agente / script recomendado |
|---------------------|--------|--------|----------------------|---|----------------------------|
| Contexto electoral | `#context` | ⚠️ | `context.election_state` OK; `social_intelligence.contexto` duplica margen 12-jun en nested regiones | P1 | `scripts/refresh_context.py` + Agent escrutinio |
| Post-electoral | `#post-electoral` | ⚠️ | `executive_alert` v3.9.3 OK; `top_risks_24_72h` probs no recalibradas post-99,63% | P2 | patch_cross_sections |
| Reversión | `#reversion` | ⚠️ | `montecarlo.json` no re-run tras meseta ONPE | P2 | `montecarlo/run_simulation_v2.py` |
| Validación | `#validacion` | ⚠️ | Mercados/adversariales anclados 16-jun | P2 | Agent I/J/K (MEGA §3.4) |
| Regiones ×5 | `#regions` | ⚠️ | `fecha_corte` regional 16-jun; muchos `eventos[]` pre-19-jun sin `es_pasado` | P1 | 5× Agent L1–L5 + `build_regions.py` |
| Grassroots nacional | `#grassroots-nacional` | ❌ | Sin merge dedicado Round 3; dedup `nombre_canónico` no corrido | P1 | `merge_grassroots_v31.py` |
| Social | `#social` | ⚠️ | Top-10 R2 + 4 cuentas R3; bulk `hashtags[]` volúmenes 11-jun (~85k) | P0 | `merge_social_v3.py` + platforms_*_jun20 |
| Alt-media | `#alt-media` | ❌ | Sin `research/alt_media/` desde build inicial | P1 | Agent O |
| Disinfo | `#disinfo` | ⚠️ | DIS-JUN19 OK; Karamba métricas jun-12 | P2 | Agent P |
| Risk matrix | `#risk-matrix` | ⚠️ | RM-27–29 v3.9.2; **RM-01–15** escenarios 13-jun sin `estado` | P0 | `patch_rm_historical_v394.py` |
| Early warning | `#early-warning` | ⚠️ | EW-27–30 v3.9.3; EW-01–17 rationales 12–16 jun | P1 | patch_cross_sections |
| Sources | `#sources` | ⚠️ | Monotonicity `sources_index` no auditada recientemente | P2 | QA script count ≥99 |
| Methodology | `#methodology` | ✅ | Magnitude subsite v1.1 enlazado | — | — |
| BLUF | `#bluf` | 🆕 | OK v3.9.0+; no en MEGA_PROMPT | — | Actualizar MEGA §2 |
| Forecast ML | `#forecast-ml` | 🆕 | OK v3.7+; montecarlo alineado 41.565 | P2 | re-run si ONPE delta |
| Escrutinio realtime | `#escrutinio_realtime` | 🆕 | OK 19-jun; plateau documentado | P1 | Round 4 ONPE check |
| Predicción 7 días | `#prediccion_7dias` | 🆕 | OK v3.9.3; gaps en `verification_gaps_r4` v3.9.4 | P0 | update_v394.py |
| Magnitude methodology | subsite | 🆕 | ✅ v3.9.1 | — | — |

---

## Entidades — deep-dive pendiente

| Entidad | Rol | Ronda | P | Agente |
|---------|-----|-------|---|--------|
| Roberto Burneo / JNE | Presidente JNE | — | P0 | Agent escrutinio/legal |
| Bernardo Pachas / ONPE | ONPE | — | P1 | Agent escrutinio |
| José María Balcázar | Presidente interino | — | P2 | Agent institucional |
| Óscar Arriola / PNP | Uso gradual fuerza | — | P2 | Agent Lima |
| Josué Gutiérrez / Defensoría | Fraude | — | P2 | Agent institucional |
| Raúl Samillán | Puno autoconvocado | R2 parcial | P1 | Agent sur |
| Antauro Humala | Convocante denunciado | — | P1 | Agent Lima |
| Máximo Valdiviezo / Conveagro | Piura 23-jun | R3 parcial | P0 | Agent norte + VG-R4-01 |
| Fernando Chuquilín | Rondas Cajamarca | — | P1 | Agent norte |
| Rafael López Aliaga | FP Lima | R2 | P2 | Agent Lima |
| CGTP `@cgt_peru` | Paro 17-jun no verificado | — | P1 | Agent social N1 |
| AIDESEP liderazgo | Oriente | — | P2 | Agent L5 |

**Completados R2/R3 (8+4):** Sánchez, Zunini, Cevallos, Roy Mendoza, Keiko, Ccallo, Ayala, Procuraduría + Conveagro, Walac, Pachamama, UNAP.

---

## Cuentas — deep-dive pendiente

| Handle | Gap | P |
|--------|-----|---|
| @EZunini | Sin ficha R2/R3 | P1 |
| @cgt_peru | Paro 17-jun dormante | P1 |
| Canales Karamba fantasma | Métricas post-eliminación | P2 |
| Canal B Cajamarca / Radio Yaraví | Regional norte | P2 |
| FP grassroots amplifiers | No indexados | P2 |
| Autor reel IG 22-jun | Sin handle verificado | P1 |

---

## Hashtags — deep-dive pendiente

| Hashtag | Gap | P |
|---------|-----|---|
| `#NoReconocemosResultado` | No indexado; usar `#PunoDefiendeSuVoto` | P1 |
| `#ParoAgrarioNacional` | No indexado | P1 |
| `#IlaveResiste` | No indexado | P2 |
| `#CNULEnLucha` | Stale | P2 |
| `#TomaDeLima` | Volumen ~85k (11-jun) sin refresh | P0 |
| Bulk `hashtags[]` | 60 tags, mayoría pre-13-jun | P0 |

---

## Research files — ausentes vs MEGA §3

| Ruta esperada | Estado | Acción |
|---------------|--------|--------|
| `research/post_electoral/` | ❌ | Crear Agent post-electoral |
| `research/alt_media/` | ❌ | Agent O refresh |
| `research/context/` | ⚠️ | Solo jun16+jun19; +jun22 en Round 4 |
| `research/grassroots/` | ❌ | Embebido en regional; falta nacional |
| `research/validation/round4_jun22.md` | ✅ v3.9.4 | — |
| `platforms_*_jun20.md` | ⚠️ | No mergeados a `hashtags[]` volúmenes |

---

## Pipeline v3.9.4 → v3.9.5

| Paso | Entregable | Estado |
|------|------------|--------|
| Round 4 prep corte | `update_v394.py` + `verification_gaps_r4` | En curso |
| Tests N58 | 8 checks Round 4 | En curso |
| 22-jun AM live | VG-R4-01–08 | Pendiente calendario |
| v3.9.5 post-Piura | Resultado 23-jun + JNE fallo | Pendiente 23-jun |

*Clasificación: USO OPERATIVO — SENSIBLE*