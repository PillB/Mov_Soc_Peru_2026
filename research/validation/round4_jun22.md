# Round 4 — Validación pre-22-jun AM 2026

**Corte dossier:** 2026-06-19T23:30:00-05:00 (PET)  
**Ventana verificada:** 19-jun (tarde) · **Monitoreo obligatorio:** 22-jun 08:00 PET (pre-Piura 23-jun)

## BLUF

Escrutinio ONPE en meseta al **99,63 %** / **+41.565** (sin delta indexado 17–19 jun). Catalizadores inmediatos: **MML restricción Centro Histórico hasta 22-jun 00:00** (oficial [El Peruano](https://elperuano.pe/noticia/298272-centro-historico-de-lima-estas-son-las-restricciones-vehiculares-del-19-al-22-de-junio)), **Piura arrocera 23-jun** vigente ([Norte Sostenible](https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/) + [Piura Plus TV](https://www.facebook.com/piuraplustv/videos/pptv-productores-anuncian-nueva-movilizaci%C3%B3n-para-el-23-de-junio-y-advierten-con/1007529818309319/)), **JNE nulidad 2.408 actas dejada al voto** sin resolución publicada.

## Hallazgos verificados (Round 4 prep)

| Eje | Hallazgo | Confianza | Fuente |
|-----|----------|-----------|--------|
| MML | Restricción vehicular Centro Histórico **19-jun 00:00 → 22-jun 00:00**; Res. Subgerencia D002556-2026-MML-GMU-SER | Alta | [El Peruano 19-jun](https://elperuano.pe/noticia/298272-centro-historico-de-lima-estas-son-las-restricciones-vehiculares-del-19-al-22-de-junio) |
| ONPE | Meseta 99,63 % / +41.565 / 346 actas JEE — sin actualización indexada 17–19 jun tarde | Alta | [El Comercio 19-jun 20:43](https://elcomercio.pe/politica/elecciones/resultados-onpe-en-vivo-entre-keiko-fujimori-y-roberto-sanchez-por-la-presidencia-del-peru-segunda-vuelta-lbposting-noticia/) |
| JNE nulidad | Pleno **dejó al voto** 19-jun; JP sin prueba material; resolución **no publicada** | Alta | [Infobae 19-jun](https://www.infobae.com/peru/2026/06/19/juntos-por-el-peru-admite-ante-el-jne-que-cree-que-hubo-fraude-en-2398-mesas-pero-no-tiene-prueba-de-ello/) |
| Piura 23-jun | Convocatoria vigente; video regional reitera 23-jun; **sin cancelación** 17–19 jun | Media-alta | Norte Sostenible + Piura Plus TV |
| Autoconv. 22-jun | Reel IG activo; sin respaldo JP; zona intangible post-MML lift | Media | [Instagram reel](https://www.instagram.com/reel/DZQNoG-pSIU/) |
| Corredores | 0 bloqueos activos 19-jun (Ilave, La Oroya, El Trébol libres) | Alta | prediccion_7dias + SUTRAN indirecto |
| Amparo PJ | Presentado 16-jun; admisión **no confirmada** 17–19 jun | Baja | [La República 16-jun](https://larepublica.pe/politica/2026/06/16/juntos-por-el-peru-presenta-demanda-de-amparo-ante-el-pj-para-anular-votos-del-extranjero-hay-una-norma-que-no-debio-existir-hnews-174096) |

## Brechas — monitoreo 22-jun AM (`verification_gaps_r4`)

| ID | Ítem | Prioridad | Agente / fuente |
|----|------|-----------|-----------------|
| VG-R4-01 | Reconfirmación Conveagro Piura (comunicado, FB, terreno) | P0 | Walac + Norte Sostenible + SUTRAN |
| VG-R4-02 | Resolución JNE nulidad 2.408 actas en portal | P0 | jne.gob.pe / RPP |
| VG-R4-03 | Levantamiento MML 22-jun 00:00 — tránsito efectivo Centro Histórico | P0 | MML + PNP terreno |
| VG-R4-04 | Autoconvocatoria 22-jun Plaza San Martín — ¿ejecutada? | P1 | IG reel métricas + medios Lima |
| VG-R4-05 | Conteo carpas acampamento JNE (vs ~80 del 16-jun) | P1 | RPP / terreno |
| VG-R4-06 | Expediente PJ amparo voto exterior — admisión/rechazo | P1 | PJCE consulta expediente |
| VG-R4-07 | Corredores SUTRAN 20–22 jun (El Trébol, FB Terry, La Oroya) | P1 | SUTRAN Twitter / comunicados |
| VG-R4-08 | ONPE delta actas JEE (346 → ?) | P2 | segundavuelta.onpe.gob.pe |

## Acciones post-22-jun (v3.9.5 target)

1. Marcar `LIMA-AUTO-22JUN` realizada / cancelada según terreno.
2. Actualizar `NORTE-PARO-023` con reconfirmación o downgrade P.
3. Publicar resolución JNE en `escrutinio_realtime.jne_nulidad_2408`.
4. Refrescar `RM-01`–`RM-15` con `estado: historico` donde aplique.
5. Re-run `montecarlo/run_simulation` solo si ONPE delta ≥0,05 pp.

*Clasificación: USO OPERATIVO — SENSIBLE*