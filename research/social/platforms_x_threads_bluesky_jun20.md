# OSINT Social — X / Threads / Bluesky
## Perú post-elección · manifestaciones y movilizaciones

**Corte:** 20 de junio de 2026, ~12:00 PET  
**Ventana:** 17–20 junio 2026  
**Contexto:** ONPE 99,63% actas · Fujimori 50,23% vs Sánchez 49,77% · margen **+41.565** · presidencia **no proclamada** · marcha JP Lima **19-jun ejecutada** · Piura arrocera **23-jun confirmada**

**Metodología:** Dimensión C (señal social) = 20% del índice compuesto ([magnitude_estimation.md](../methodology/magnitude_estimation.md)). Correlación online–asistencia: débil (González-Bailón et al., 2014). Sin API nativa en ninguna de las tres plataformas en este corte; estimaciones = proxy por muestreo web + cruce con `social_jun19.md`, `hashtags_deep_jun19.md`, `accounts_deep_jun19.md`.

---

## Tabla resumen ejecutiva (3 plataformas)

| Plataforma | data_availability | key_metrics_available | top_signals_jun17_20 (estimado) | mobilization_correlation (1–5) | Limitación principal Perú OSINT |
|---|---|---|---|:---:|---|
| **X / Twitter** | **alto** | likes, reposts/RT, quotes, views, replies, bookmarks (parcial), perfil seguidores | Marcha 19-jun: ~800–2.500 posts hashtag; @RobertoSanchP pico ~882♥ · ~736 RT · ~205K views; convocatoria Piura 23-jun: señal **baja** en X | **4/5** | Muro login oculta timelines; bots/disinfo; convocatorias JP vía WhatsApp/comunicados, no cuenta oficial |
| **Threads (Meta)** | **bajo** | likes, replies, reposts, views (limitado sin login); sin API pública OSINT | Sin hashtags electorales verificables indexados; posible eco de narrativas IG/FB (RPP reels, medios) | **2/5** | Adopción política peruana marginal; búsqueda no indexable; duplicado Meta sin señal incremental |
| **Bluesky** | **nulo–bajo** | likes, reposts, replies (AT Protocol, API restringida en entorno OSINT) | Sin posts Perú elecciones/marcha verificables en búsqueda pública; posible nicho periodistas internacionales | **1/5** | Base usuarios Perú minúscula; sin cobertura regional Piura; API 403 sin credenciales |

---

## 1. X / Twitter

### data_availability: **alto**

X concentra la mayor señal digital verificable del ecosistema protesta electoral peruano en la ventana 17–20 jun. Perfiles políticos, medios y periodistas mantienen actividad indexable; posts de convocatoria y rechazo institucional son capturables sin API (muestreo web).

### key_metrics_available

| Métrica | Disponibilidad | Utilidad OSINT |
|---------|----------------|----------------|
| Likes (♥) | Alta (público) | Amplificación narrativa |
| Reposts / RT | Alta | Difusión convocatoria |
| Quotes | Alta | Marco interpretativo / polarización |
| Views | Alta (cuentas grandes) | Alcance, no magnitud física |
| Replies | Media (muro parcial) | Sentimiento, desinformación |
| Bookmarks | Baja (oculto sin login) | Limitada |
| Seguidores / verificación | Alta | Peso de cuenta convocante |
| Trending / volumen hashtag | Baja (sin API) | Solo proxy por artículos + muestreo |

### top_signals_jun17_20

| Señal | Fecha (PET) | Estimación engagement | Evento vinculado | Cuentas |
|-------|-------------|----------------------|------------------|---------|
| Convocatoria marcha nacional JP | 16-jun ~04:22 | ~944♥ · ~326 RT · **~90,7K views** | Marcha 19-jun Campo de Marte (ruta ejecutada Paseo Colón) | [@RodrigoCT_94](https://x.com/RodrigoCT_94/status/2066738223598936220) |
| #MarchaEnDefensaDeLaDemocracia / #JusticiaElectoral | 19-jun 12:00–22:00 | **800–2.500 posts** (proxy 48h) | Marcha centro histórico Lima | @RobertoSanchP, @RPPNoticias |
| Post rechazo denuncia Procuraduría | 19-jun ~20:56 | **~882♥ · ~736 RT · ~32 quotes · ~205K views** | Denuncia 9 convocantes + marcha PM | [@RobertoSanchP](https://x.com/RobertoSanchP/status/2068075544395321358) |
| #DefensaDelVoto / #LaTomaDeLima | 17–19 jun | 600–2.000 posts (proxy) | Vigilias 17-jun + marcha 19-jun | JP comunicados (offline), grassroots |
| #583PatronesAnomalos | 19-jun ~12:00 | 200–800 posts (proxy) | Sustentación nulidad 2.408 actas JNE | Roy Mendoza vía @RPPNoticias |
| #CriminalizaciónDeLaProtesta | 19-jun ~17:55 | 300–1.000 posts (proxy) | Denuncia Procuraduría | @RobertoSanchP, @HCevallosFlores (mención) |
| #FujimoriPresidenta | 17–19 jun | 500–3.000 posts (proxy) | Expectativa FP; **disinfo** proclamación presidencial | @KeikoFujimori (medios, no X directo) |
| Cobertura institucional marcha | 19-jun tarde | Multiplataforma; X redacción activa | Marcha ejecutada pacífica; cientos (RPP/Infobae) | @RPPNoticias (~3,5M seg.) |
| **Piura 23-jun arrocera** | 11–19 jun (convocatoria) | **<50 posts X** (proxy) | Movilización Conveagro confirmada; sin pico electoral | Medios regionales (Walac FB), no X |
| Acampamento JNE | 16–20 jun | 150–500 posts (proxy) | ~80 carpas continúan | Simpatizantes JP, @RPPNoticias |

**Cuentas clave (movilización):**

| Handle | Rol | engagement_tier 17–20 | Nota |
|--------|-----|----------------------|------|
| @RobertoSanchP | convocador | **alto** | Único actor JP con señal X viral; encabezó marcha física |
| @JuntosPorElPer | convocador | **bajo** | 806 seg.; **inactivo en X**; convoca offline |
| @HCevallosFlores | convocador | **bajo** | Denunciado 19-jun; sin posts visibles |
| @RPPNoticias | institucional | **alto** | Hub verificación terreno |
| @KeikoFujimori | amplificador FP | **medio** | 1,2M seg.; sin post X 17–20; actividad vía prensa |
| @FuerzaPopular__ | amplificador FP | **bajo** | Dormante en ventana electoral |
| @WaykaPeru | crítico | **medio** | Editorial; sin pico marcha 19 en X |
| @cgt_peru | sindical | **bajo** | Sin convocatoria CGTP verificada 17-jun |

### mobilization_correlation: **4/5**

**Justificación:** X es el canal donde convocantes políticos peruanos (Sánchez) y medios (RPP) generan señal temporalmente alineada con eventos físicos verificados (marcha 19-jun, denuncia Procuraduría). Permite detectar **picos narrativos**, **cuentas amplificadoras** y **ventanas de convocatoria** con horas de antelación (post Rodrigo Chillitupa 16-jun → marcha 19-jun). **No** sustituye conteo de asistentes: marcha ejecutada con "cientos" (Infobae/RPP) vs engagement viral en un solo post. Correlación útil como **proxy de probabilidad de convocatoria** y **intensidad narrativa**, no magnitud S–M–L directa. Penalización: cuenta oficial JP ausente; Piura 23-jun casi invisible en X.

### limitations for Peru OSINT

1. **Sin API X:** volumen hashtag = estimación proxy, no conteo exacto.
2. **Muro de autenticación:** @RPPNoticias, @rmapalacios, @HCevallosFlores ocultan posts recientes sin login.
3. **Asimetría convocatoria:** JP convoca por comunicado/WhatsApp; X subrepresenta base movilizadora.
4. **Disinfo activa:** #FujimoriPresidenta, videos manipulados Sánchez (DIS-JUN19-01/03).
5. **Regional blind spot:** Piura, Cajamarca, Junín — señal en FB/WhatsApp > X.
6. **Procuraduría cita "publicaciones digitales"** en denuncia 19-jun — fuente primaria probablemente FB/X; no desagregado por plataforma ([Infobae 20-jun](https://www.infobae.com/peru/2026/06/20/procuraduria-denuncia-a-antauro-humala-claudia-cisneros-y-hernando-cevallos-por-presunta-perturbacion-de-la-tranquilidad-publica/)).

### sources

- [Roberto Sánchez — rechazo denuncia (X)](https://x.com/RobertoSanchP/status/2068075544395321358)
- [Rodrigo Chillitupa — convocatoria 19-jun (X)](https://x.com/RodrigoCT_94/status/2066738223598936220)
- [RPP — Marcha Sánchez 19-jun](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850)
- [Infobae — Marcha Justicia Electoral 19-jun](https://www.infobae.com/peru/2026/06/19/marcha-justicia-electoral-en-vivo-hoy-19-de-junio-cierres-desvios-y-a-que-hora-sera-la-movilizacion-convocada-por-roberto-sanchez-y-juntos-por-el-peru/)
- [Infobae — Procuraduría denuncia 19-jun](https://www.infobae.com/peru/2026/06/20/procuraduria-denuncia-a-antauro-humala-claudia-cisneros-y-hernando-cevallos-por-presunta-perturbacion-de-la-tranquilidad-publica/)
- [Norte Sostenible — Piura 23-jun](https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/)
- Cross-ref interno: `research/social/social_jun19.md`, `hashtags_deep_jun19.md`, `accounts_deep_jun19.md`

---

## 2. Threads (Meta)

### data_availability: **bajo**

Threads (Meta, vinculado a Instagram) no presenta señal indexable verificable sobre manifestaciones electorales peruanas 17–20 jun. Búsqueda pública `peru elecciones` en threads.com no devuelve resultados capturables sin sesión autenticada. No hay hashtags de movilización (#MarchaEnDefensaDeLaDemocracia, #LaTomaDeLima, Piura 23-jun) confirmados en fuentes abiertas.

### key_metrics_available

| Métrica | Disponibilidad | Nota |
|---------|----------------|------|
| Likes | Media (con login) | Métrica principal visible en app |
| Replies | Media | Hilos cortos; poca profundidad política |
| Reposts | Media | Cross-post desde IG posible |
| Views | Baja | No siempre expuesto en web |
| Hashtag search | **Muy baja** | Sin indexación web robusta |
| API OSINT | **Nula** | Sin API pública comparable a Meta Graph para Threads |
| Geolocalización / trending Perú | **Nula** | Sin trends Perú verificables |

### top_signals_jun17_20

| Señal | Estimación | Estado | Nota |
|-------|------------|--------|------|
| Contenido elecciones Perú 2026 | **<20 posts verificables** | No confirmado | Búsqueda web sin resultados indexados |
| Marcha 19-jun Lima | **nulo** | Sin cobertura Threads detectada | Cobertura real en IG Reels RPP, FB Live |
| Piura 23-jun | **nulo** | Sin señal | Convocatoria documentada en prensa regional (Walac, Norte Sostenible), no Threads |
| Narrativa criminalización protesta | **bajo** (inferido) | Posible eco IG→Threads | Sin post específico verificable |
| Medios peruanos en Threads | **bajo** | RPP/EC/Infobae priorizan IG/FB/X | Threads no es canal primario de breaking news Perú |

**Hipótesis operativa (no verificada):** Usuarios IG que consumen reels de marcha 19-jun ([RPP Reel acampamento JNE](https://www.instagram.com/reel/DZZAvEbMZkp/)) pueden republicar en Threads, pero el volumen es **residual** frente a FB/WhatsApp. Meta Perú: FB + IG dominan; Threads = capa secundaria sin convocatoria grassroots.

### mobilization_correlation: **2/5**

**Justificación:** Threads comparte base de usuarios con Instagram pero con **penetración política mucho menor** en Perú. No hay evidencia de convocatorias callejeras originadas o amplificadas en Threads para marcha 19-jun ni Piura 23-jun. Útil solo como **canal redundante** de contenido ya viral en IG (reels de medios). Correlación con magnitud física **muy débil**: ausencia de convocantes clave (Sánchez, JP, Conveagro) en Threads. Valor OSINT: monitoreo pasivo si aparece cross-post de convocatoria; no priorizar para alertas tempranas.

### limitations for Peru OSINT

1. **Sin indexación web:** imposible scraping sistemático sin login Meta.
2. **Sin API pública OSINT** para volumen, hashtags o geografía.
3. **Duplicado Meta:** señal ya capturada en IG/FB del mismo ecosistema.
4. **Ceguera regional:** gremios arroceros Piura usan FB/WhatsApp, no Threads.
5. **Adopción política tardía:** actores peruanos no migraron conversación electoral post-2da vuelta a Threads.
6. **Imposible separar bot/farm** sin herramientas Meta internas.

### sources

- [Threads Search — peru elecciones](https://www.threads.com/search?q=peru+elecciones) (sin resultados indexables, corte 20-jun)
- [RPP — Reel acampamento JNE (IG, proxy Meta)](https://www.instagram.com/reel/DZZAvEbMZkp/)
- [Norte Sostenible — Piura 23-jun](https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/)
- [Infobae — Marcha 19-jun](https://www.infobae.com/peru/2026/06/19/marcha-justicia-electoral-en-vivo-hoy-19-de-junio-cierres-desvios-y-a-que-hora-sera-la-movilizacion-convocada-por-roberto-sanchez-y-juntos-por-el-peru/)

---

## 3. Bluesky

### data_availability: **nulo–bajo**

Bluesky no exhibe señal verificable de manifestaciones electorales peruanas en la ventana 17–20 jun. Búsquedas públicas (`Peru elecciones`, `Peru protesta`, `Fujimori Peru`) en bsky.app no retornan contenido indexable sin sesión. API pública AT Protocol (`app.bsky.feed.searchPosts`) devuelve **403 Forbidden** en entorno OSINT sin credenciales.

### key_metrics_available

| Métrica | Disponibilidad | Nota |
|---------|----------------|------|
| Likes | Alta (con acceso API/cuenta) | Estándar AT Protocol |
| Reposts | Alta | Métrica principal de difusión |
| Replies | Alta | Conversaciones de nicho |
| Views | Variable | Menor transparencia que X |
| Hashtag search | Media (API) | Requiere autenticación/app password |
| Usuarios Perú verificados | **Muy baja** | Sin lista curada de convocantes peruanos |
| Firehose / streaming | Restringido | No accesible en este corte |

### top_signals_jun17_20

| Señal | Estimación | Estado | Nota |
|-------|------------|--------|------|
| #Peru #Elecciones2026 | **<10 posts** (inferido) | No verificado | Sin resultados en búsqueda web pública |
| Marcha Lima 19-jun | **nulo** | Sin cobertura detectada | Cobertura en X, RPP TV, Reuters |
| Piura 23-jun | **nulo** | Sin señal | Evento gremial regional invisible en Bluesky |
| Discurso Fujimori/Sánchez | **bajo** (nicho) | Posible en cuentas académicas/LatAm diaspora | Sin handles peruanos de convocatoria verificados |
| Periodismo internacional | **bajo** | AFP/Reuters/DW publican en X/web primero | Bluesky no es canal primario LatAm 2026 |

**Observación:** Bluesky en América Latina concentra usuarios tech, periodistas independientes y diaspora — no la base movilizadora peruana (JP, Conveagro, ronderos). Para OSINT Perú protestas, Bluesky es **canal de vigilancia secundaria**, no primaria.

### mobilization_correlation: **1/5**

**Justificación:** Ausencia casi total de convocantes, hashtags y cobertura en tiempo real de marcha 19-jun o Piura 23-jun. La plataforma no refleja dinámicas de movilización peruana (WhatsApp/FB/X). Correlación con magnitud física **insignificante** en este contexto. Valor residual: detección de narrativas internacionales o académicas sobre crisis electoral peruana; no alerta temprana de bloqueos o marchas.

### limitations for Peru OSINT

1. **Base usuarios Perú minúscula** vs X/FB/WhatsApp.
2. **API restringida:** búsqueda sistemática requiere credenciales Bluesky.
3. **Sin convocantes locales:** ningún actor de `events.json` (JP, Conveagro, CGTP) verificado en Bluesky.
4. **Ceguera regional total:** Piura, sur andino, oriente invisible.
5. **Latencia:** contenido LatAm en Bluesky suele ser replicado desde X con días de retraso.
6. **Falso negativo:** ausencia de señal ≠ ausencia de protesta (confirmado: marcha 19-jun ejecutada sin eco Bluesky).

### sources

- [Bluesky Search — Peru elecciones](https://bsky.app/search?q=Peru%20elecciones)
- [Bluesky Search — Peru protesta](https://bsky.app/search?q=Peru%20protesta)
- [Bluesky AT Protocol — searchPosts (403 sin credenciales)](https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=Peru&limit=5)
- [Reuters — Protesta Lima 19-jun (referencia terreno, no Bluesky)](https://www.infobae.com/resizer/v2/AUTOL37VLJG6BKN7IM4YCBCO7U.JPG) vía [Infobae marcha](https://www.infobae.com/peru/2026/06/19/marcha-justicia-electoral-en-vivo-hoy-19-de-junio-cierres-desvios-y-a-que-hora-sera-la-movilizacion-convocada-por-roberto-sanchez-y-juntos-por-el-peru/)

---

## Matriz cruzada: señal social → evento físico (17–20 jun)

| Evento físico | X | Threads | Bluesky | Mejor fuente OSINT |
|---------------|:---:|:-------:|:-------:|-------------------|
| Marcha JP Lima 19-jun | ✅ alto | ❌ nulo | ❌ nulo | X + RPP TV/FB |
| Acampamento JNE (~80 carpas) | ⚠️ medio | ❌ nulo | ❌ nulo | RPP + FB |
| Vigilias JP 17-jun | ⚠️ bajo | ❌ nulo | ❌ nulo | Comunicados offline |
| Denuncia Procuraduría 19-jun | ✅ alto | ❌ nulo | ❌ nulo | X @RobertoSanchP |
| Piura arrocera **23-jun** (futuro) | ⚠️ bajo | ❌ nulo | ❌ nulo | Walac FB + Norte Sostenible |
| Protesta Pariahuanca Junín 18–19 | ⚠️ bajo | ❌ nulo | ❌ nulo | HYTimes/El Búho FB |

---

## Recomendaciones operativas (corte 20-jun)

1. **Prioridad P1:** X — monitoreo @RobertoSanchP, @RPPNoticias, hashtags #DefensaDelVoto, #CriminalizaciónDeLaProtesta; pre-Piura 23-jun buscar @WalacNoticias y términos "Conveagro" / "arroceros".
2. **Prioridad P2:** Meta FB/IG (fuera de este informe) — convocatorias JP y gremiales no están en Threads.
3. **Prioridad P3:** Threads — polling pasivo semanal; elevar solo si aparece convocatoria con >100 interacciones.
4. **Prioridad P4:** Bluesky — omitir para magnitud; revisar solo narrativa internacional post-proclamación JNE (jul).
5. **Próximo corte recomendado:** 22-jun AM (48h pre-Piura 23-jun) — reforzar X regional + FB Walac/Norte Sostenible.

---

## Gaps / incertidumbres

- Conteo exacto posts por hashtag en X: **no disponible** sin API.
- Threads: imposible confirmar ausencia total vs. baja indexación — clasificado **bajo** por precaución metodológica.
- Bluesky: API bloqueada; clasificación **nulo–bajo**; podría existir nicho no indexado web.
- Magnitud marcha 19-jun: ejecutada, **sin cifra oficial** de asistentes (proxy social no sustituye).
- Métricas @RobertoSanchP actualizadas 20-jun: views pueden incrementar post-corte.

---

*Generado: 2026-06-20T12:00:00-05:00 · Clasificación: USO OPERATIVO — SENSIBLE · Metodología v3.9*