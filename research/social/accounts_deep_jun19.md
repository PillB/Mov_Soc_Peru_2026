# Validación exhaustiva — 10 cuentas críticas X/Twitter
## Corte: 19 de junio de 2026, ~21:00 PET

**Ventana:** 17–19 junio 2026  
**Contexto:** ONPE 99,63% actas · Fujimori 50,23% vs Sánchez 49,77% · margen +41.565 · presidencia sin proclamar  
**Metodología engagement_tier (señal social, 20% peso magnitud):**
- **alto:** post movilización con ≥1K likes, ≥5K RT o ≥50K quotes; o cobertura institucional masiva verificada
- **medio:** actividad verificada con engagement 100–1K o amplificación moderada
- **bajo:** inactivo en ventana, sin posts visibles, o engagement <100 en temas movilización

**Roles movilización:** `convocador` | `amplificador` | `institucional` | `crítico`

---

## Tabla resumen (10 cuentas)

| Handle | Seguidores | Existe | mobilization_role | engagement_tier | key_post_engagement | linked_events |
|---|---:|---|---|---|---|---|
| **@RobertoSanchP** | 21,6K | ✅ | convocador | **alto** | Post 19-jun denuncia: ~718♥ · ~869 RT · ~203K quotes | marcha 19-jun · acampamento JNE (narrativa) |
| **@JuntosPorElPer** | 806 | ✅ | convocador | **bajo** | Sin posts X en ventana | vigilias 17-jun · marcha 19-jun (comunicado) · acampamento JNE |
| **@HCevallosFlores** | 38,3K | ✅ | convocador | **bajo** | Sin posts X 17–19; objeto denuncia Procuraduría | vigilias 17-jun · acampamento JNE · marcha 19-jun (indirecto) |
| **@KeikoFujimori** | 1,2M | ✅ | amplificador | **medio** | Sin post X 17–19; actividad vía medios (RPP) | paralelo 19-jun San Cosme (no marcha JP) |
| **@FuerzaPopular__** | 61,1K | ✅ | amplificador | **bajo** | Último post visible: oct-2025 (vacancia Dina) | sin vínculo directo verificado 17–19 |
| **@rlopezaliaga1** | 338,2K | ✅ | amplificador | **bajo** | Sin post X 17–19; desistimiento senador vía prensa | sin convocatoria callejera verificada |
| **@WaykaPeru** | 228,2K | ✅ | crítico | **medio** | Post fijado 17-jun (#Especial): ~50♥ · ~26 RT · ~1,5K quotes | editorial/contexto; no cobertura campo marcha 19 |
| **@cgt_peru** | 11,7K | ✅ | — (dormant) | **bajo** | Perfil sin timeline pública | sin convocatoria CGTP 17-jun verificada |
| **@rmapalacios** | 3,4M | ✅ | crítico | **bajo** | Sin posts X 17–19 visibles sin login | sin post electoral visible; rol histórico opinión |
| **@RPPNoticias** | 3,5M | ✅ | institucional | **alto** | Cobertura en vivo marcha/acampamento (YT/TV/FB); X activo vía redacción | vigilias 17-jun · acampamento JNE · marcha 19-jun |

---

## Correcciones de handles (dossier → verificado)

| ❌ Variante errónea | ✅ Handle correcto | Nota |
|---|---|---|
| @Roberto_Sanchez_ | **@RobertoSanchP** | Cuenta oficial candidato JP |
| @JuntosXelPeru | **@JuntosPorElPer** | 806 seguidores; X inactivo |
| @HCevallosB | **@HCevallosFlores** | Denunciado 19-jun Procuraduría |
| @FuerzaPopular | **@FuerzaPopular__** | 2 guiones bajos finales |
| @FuerzaPopular____ | **@FuerzaPopular__** | 4 guiones = error inventario `events.json` |
| @RLopezAliaga | **@rlopezaliaga1** | Renovación Popular |
| @wayka_pe | **@WaykaPeru** | Medio alternativo |
| @CGTPOficial | **@cgt_peru** | CGTP Perú |
| @RosaMariaP | **@rmapalacios** | Periodista |

---

## Ficha por cuenta (2 rondas de validación)

### 1. @RobertoSanchP — Roberto Sánchez Palomino (JP)

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 21,6K seguidores · activo | Verificado x.com 19-jun ~21:00 |
| **Posts 17–19** | 1 post visible en ventana | Post 19-jun ~16:00 PET (pinned): rechazo denuncia Procuraduría |
| **Engagement clave** | Alto | **~718 likes · ~869 RT · ~203K quotes** ([status/2068075544395321358](https://x.com/RobertoSanchP/status/2068075544395321358)) |
| **Rol** | convocador | Encabezó marcha física + amplificó #CriminalizaciónDeLaProtesta |
| **Eventos físicos** | marcha 19-jun | Salida Paseo Colón (Av. 9 de Diciembre) → centro histórico ([RPP 1693850](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850)) |
| **engagement_tier** | alto | Pico viral por quotes; único actor JP con señal X masiva en ventana |

**Últimos 5 posts visibles (ventana + contexto):**
1. **19-jun** — Rechazo denuncia penal Procuraduría (~203K quotes) ← movilización
2. *(sin más posts 17–19 en timeline pública)*
3. — Timeline pública salta a posts 2022–2023

---

### 2. @JuntosPorElPer — Juntos por el Perú (oficial)

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 806 seguidores | X muestra "@JuntosPorElPer hasn't posted" |
| **Posts 17–19** | Ninguno | **Inactivo en X**; 130 posts históricos no visibles |
| **Engagement** | N/D | Convocatoria offline: comunicado 16-jun ([La República](https://larepublica.pe/politica/2026/06/16/juntos-por-el-peru-convoca-a-marcha-nacional-en-defensa-del-voto-para-este-19-de-junio-hnews-1501216)) |
| **Rol** | convocador | Convoca vigilias 17-jun + marcha 19-jun vía **comunicado partidario**, no X |
| **Eventos** | vigilias · marcha · acampamento | Campo de Marte 19-jun 16:00; plantones 17-jun regiones; acampamento continuo JNE |
| **engagement_tier** | bajo | Canal digital partidario ausente; señal en WhatsApp/comunicados |

---

### 3. @HCevallosFlores — Hernando Cevallos (JP)

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 38,3K seguidores | Activo pero sin posts recientes en vista pública |
| **Posts 17–19** | Ninguno visible | Timeline pública: últimos posts 2022–2023 |
| **Engagement** | N/D | Mencionado en denuncia Procuraduría 19-jun ([RPP 1693848](https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848)) |
| **Rol** | convocador | Convocante histórico "La Toma de Lima"; denunciado por azuzamiento |
| **Eventos** | vigilias · acampamento · marcha | Co-convocante cadena JP; sin post X verificando 17/19-jun |
| **engagement_tier** | bajo | Impacto vía mención judicial, no engagement orgánico X |

---

### 4. @KeikoFujimori — Keiko Fujimori (FP)

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 1,2M seguidores | Último post X visible: ene-2025 (Venezuela) |
| **Posts 17–19** | Ninguno en X | Actividad **mediática** 19-jun: margen votos, indultos, San Cosme |
| **Engagement** | Medio (vía medios) | RPP amplifica declaraciones; sin métricas X propias en ventana |
| **Rol** | amplificador | Contra-narrativa institucional; no convoca marcha callejera |
| **Eventos** | paralelo 19-jun | Visita cerro San Cosme, La Victoria 19-jun tarde ([RPP 1693860](https://rpp.pe/politica/elecciones/keiko-fujimori-visito-el-cerro-san-cosme-en-la-victoria-vamos-a-esperar-con-prudencia-el-conteo-de-las-ultimas-actas-noticia-1693860)) |
| **engagement_tier** | medio | Base 1,2M pero dormancia X; señal en prensa tradicional |

**Actividad mediática 19-jun (no X):**
- "La diferencia de votos ha crecido" ([RPP 1693813](https://rpp.pe/politica/elecciones/keiko-fujimori-la-diferencia-de-votos-ha-crecido-y-esto-nos-genera-muy-buena-expectativa-noticia-1693813))
- Indultos: "ni persecución ni privilegios" ([RPP 1693849](https://rpp.pe/politica/judiciales/keiko-fujimori-sobre-eventuales-pedidos-de-indulto-a-expresidentes-en-nuestro-pais-no-va-a-haber-ni-persecucion-ni-privilegios-noticia-1693849))
- San Cosme 19-jun tarde

---

### 5. @FuerzaPopular__ — Fuerza Popular (oficial)

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 61,1K seguidores | Keiko perfil enlaza @FuerzaPopular__ (2 guiones) |
| **Posts 17–19** | Ninguno electoral | Último visible: 9-oct-2025 vacancia Dina (~1,2K♥ · 348K quotes) |
| **Engagement** | Bajo (ventana) | Sin posts movilización jun-2026 |
| **Rol** | amplificador | Cuenta partidaria dormante; narrativa FP vía Keiko/medios |
| **Eventos** | — | Sin convocatoria FP verificada vigilias/marcha 17–19 |
| **engagement_tier** | bajo | Inactivo en ventana electoral |

---

### 6. @rlopezaliaga1 — Rafael López Aliaga (Renovación Popular)

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 338,2K seguidores | Pin: post ago-2023 (~7,5K♥ · 1,3M quotes) |
| **Posts 17–19** | Ninguno | Sin actividad X electoral en ventana |
| **Engagement** | Bajo (ventana) | Desistimiento senador 19-jun vía carta notarial ([RPP 1693804](https://rpp.pe/politica/elecciones/rafael-lopez-aliaga-presento-su-desistimiento-irrevocable-al-cargo-de-senador-noticia-1693804)) |
| **Rol** | amplificador | Aliado FP; foco institucional/legal, no calle |
| **Eventos** | — | Sin convocatoria marcha Lima verificada |
| **engagement_tier** | bajo | Alto histórico; silencio X en crisis electoral |

---

### 7. @WaykaPeru — Wayka (medio alternativo)

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 228,2K seguidores | Activo |
| **Posts 17–19** | 1 post fijado 17-jun | #Especial cuidadoras (no electoral directo) |
| **Engagement** | Medio | Post 17-jun: ~22 replies · ~26 RT · ~50♥ · ~1,5K quotes |
| **Rol** | crítico | Periodismo alternativo; editorial sur/validación voto ([wayka.pe](https://wayka.pe/elecciones-2026-buscan-invalidar-el-voto-de-las-regiones-del-sur-como-si-no-tuviera-el-mismo-valor/)) |
| **Eventos** | indirecto | Contexto movilizaciones/disputa electoral; sin clip campo marcha 19 verificado en X |
| **engagement_tier** | medio | Activo pero sin pico movilización en ventana |

---

### 8. @cgt_peru — CGTP Perú

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 11,7K seguidores | Timeline vacía: "hasn't posted" |
| **Posts 17–19** | Ninguno | Sin actividad verificable |
| **Engagement** | N/D | — |
| **Rol** | — | **Sin convocatoria CGTP verificada para 17-jun** |
| **Eventos** | — | No vinculado a vigilias/marcha/acampamento en ventana |
| **engagement_tier** | bajo | Sindicato ausente del debate digital movilización |

---

### 9. @rmapalacios — Rosa María Palacios

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 3,4M seguidores | 155K posts acumulados |
| **Posts 17–19** | Ninguno visible | Timeline pública: posts 2020–2021 (muro/login) |
| **Engagement** | Bajo (ventana) | Histórico alto (20K+♥ en posts 2020) |
| **Rol** | crítico | Anti-fujimorista / opinión; sin post electoral visible público |
| **Eventos** | — | Sin vínculo directo marcha/acampamento en X ventana |
| **engagement_tier** | bajo (ventana) | Potencial alto por base; inactiva en crisis 17–19 |

---

### 10. @RPPNoticias — RPP Noticias

| Campo | Round 1 | Round 2 (deep) |
|---|---|---|
| **Perfil** | Existe · 3,5M seguidores | 745,5K posts |
| **Posts 17–19** | Activos vía redacción | Timeline pública sin login: posts antiguos; cobertura real en rpp.pe/YT/TV |
| **Engagement** | Alto | Cobertura en vivo marcha Sánchez, Keiko, acampamento JNE, escrutinio |
| **Rol** | institucional | Neutral; principal fuente audiovisual verificada |
| **Eventos** | los 3 | Acampamento ~80 carpas JNE ([RPP 1693265](https://rpp.pe/peru/actualidad/simpatizantes-de-juntos-por-el-peru-dicen-que-seguiran-acampando-frente-al-jne-noticia-1693265)); marcha 19-jun; vigilias 17-jun |
| **engagement_tier** | alto | Alcance masivo multiplataforma |

**Cobertura movilización 17–19 (inferida vía RPP, no métricas X individuales):**
- Acampamento JNE: ~80 carpas Jr. Cusco 653 / parque Bausate y Meza
- Marcha 19-jun: "marcha en defensa de la democracia" centro histórico
- Keiko San Cosme + Sánchez marcha: cobertura paralela 19-jun tarde

---

## Matriz online → físico (10 cuentas)

| Evento físico | Fecha | Cuentas vinculadas | Estado |
|---|---|---|---|
| **Vigilias/plantones JP** | 17-jun | @JuntosPorElPer (comunicado), @HCevallosFlores (convocante histórico) | EJECUTADO — sin cobertura numérica independiente |
| **Acampamento JNE** | 16–19 jun | @RPPNoticias (cobertura), simpatizantes JP (sin handle único) | EJECUTADO — ~80 carpas continúan |
| **Marcha "defensa democracia"** | 19-jun | @RobertoSanchP (encabeza), @JuntosPorElPer (convoca offline), @RPPNoticias (cubre) | EJECUTADO — Sánchez + Ana Li Márquez + Brígida Curo |
| **Visita Keiko San Cosme** | 19-jun tarde | @KeikoFujimori (medios), @RPPNoticias | EJECUTADO — paralelo, no contra-marcha |
| **Denuncia Procuraduría** | 19-jun | @RobertoSanchP (rechaza X), @HCevallosFlores (denunciado) | EJECUTADO — 9 personas |

---

## Hallazgos operativos

### Asimetría convocatoria JP
- **Cadena física:** comunicado partidario (16-jun) → vigilias 17-jun → marcha 19-jun → acampamento continuo JNE
- **Cadena digital:** solo **@RobertoSanchP** genera señal X viral en ventana; cuenta oficial @JuntosPorElPer **inactiva**
- Implicación: monitoreo movilización JP debe cruzar WhatsApp/comunicados, no solo X partidario

### Bloque FP/pro-Keiko
- **@KeikoFujimori**, **@FuerzaPopular__**, **@rlopezaliaga1**: sin posts X movilización 17–19
- Estrategia: prensa tradicional + visitas territoriales (San Cosme), no convocatoria callejera

### Medios y crítica
- **@RPPNoticias**: hub institucional de verificación física
- **@WaykaPeru**: activo editorialmente, engagement medio, rol crítico FP/disputa voto sur
- **@rmapalacios**: base masiva pero silencio X en ventana

### Sindicato ausente
- **@cgt_peru**: sin presencia; no amplifica ni convoca en ventana crítica

### Pico engagement único
- Post @RobertoSanchP 19-jun (**~203K quotes**) = principal vector #CriminalizaciónDeLaProtesta
- Supera por órdenes de magnitud cualquier otra cuenta de la lista en ventana

---

## Incertidumbres / gaps

1. **Métricas X @RPPNoticias, @rmapalacios, @HCevallosFlores:** muro de autenticación oculta posts recientes; actividad inferida vía rpp.pe
2. **Magnitud marcha 19-jun:** ejecución confirmada; **cifra asistentes no reportada** en fuentes consultadas
3. **Vigilias 17-jun:** convocadas pero sin cobertura numérica independiente
4. **@WaykaPeru:** cobertura alternativa en YT/FB posible; no verificada stream 19-jun en esta ronda
5. **Handles erróneos en `events.json`:** persisten @FuerzaPopular____ (4 guiones) y @rlopezaliaga1R — requieren corrección en próximo refresh

---

## Fuentes primarias

1. Perfiles X verificados: x.com/{RobertoSanchP,JuntosPorElPer,HCevallosFlores,KeikoFujimori,FuerzaPopular__,rlopezaliaga1,WaykaPeru,cgt_peru,rmapalacios,RPPNoticias}
2. [RPP — Marcha Sánchez 19-jun](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850)
3. [RPP — Procuraduría denuncia](https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848)
4. [RPP — Acampamento JNE](https://rpp.pe/peru/actualidad/simpatizantes-de-juntos-por-el-peru-dicen-que-seguiran-acampando-frente-al-jne-noticia-1693265)
5. [La República — Convocatoria JP 16-jun](https://larepublica.pe/politica/2026/06/16/juntos-por-el-peru-convoca-a-marcha-nacional-en-defensa-del-voto-para-este-19-de-junio-hnews-1501216)
6. [Wayka — Voto regiones sur](https://wayka.pe/elecciones-2026-buscan-invalidar-el-voto-de-las-regiones-del-sur-como-si-no-tuviera-el-mismo-valor/)
7. Cross-ref: `research/social/social_jun19.md`, `data/events.json` v3.8.1

---

*Generado: 2026-06-19T21:00:00-05:00 · Rondas validación: 2 · Clasificación: USO OPERATIVO — SENSIBLE*