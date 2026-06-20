# Validación profunda de hashtags — Perú post-elección 2026
## Corte: 19 de junio de 2026, ~21:00 PET

**Ventana:** 17–19 junio 2026  
**Metodología:** [magnitude_estimation.md](../methodology/magnitude_estimation.md) — dimensión C (señal social) = **20%** del índice compuesto; nunca evidencia única.  
**Contexto electoral:** ONPE 99,63% actas · Fujimori 9.183.602 (50,23%) vs Sánchez 9.142.185 (49,77%) · margen **+41.565** ([El Comercio](https://elcomercio.pe/politica/elecciones/cual-es-la-cantidad-de-votos-que-separa-a-keiko-fujimori-y-roberto-sanchez-segun-ultimos-resultados-onpe-de-la-segunda-vuelta-elecciones-peru-2026-noticia/)).

---

## Metodología de validación (2 rondas)

| Ronda | Alcance | Fuentes |
|-------|---------|---------|
| **R1 — Wide** | Prevalencia X, TikTok, Facebook, Instagram, noticias 17–19 jun | RPP, El Comercio, HYTimes, El Búho, `events.json`, `social_jun19.md` |
| **R2 — Deep** | Cruce narrativas ↔ eventos físicos ↔ riesgo desinformación | Medios ≥2 independientes + confirmación terreno donde exista |

**Limitaciones:** Sin API nativa de plataformas; estimaciones de volumen son **proxy** (artículos 48h + replicación en FB/X/WhatsApp + cobertura TV). Correlación débil online–asistencia (González-Bailón et al.).

---

## Tabla resumen ejecutiva

| # | Hashtag | Bando | Volumen | Pico (PET) | Eventos vinculados |
|---|---------|-------|---------|------------|-------------------|
| 1 | `#MarchaEnDefensaDeLaDemocracia` | pro-Sánchez / JP | **alto** | 2026-06-19T17:00:00-05:00 | Marcha centro histórico 19-jun; vigilias 17-jun |
| 2 | `#LaTomaDeLima` | pro-Sánchez / JP | **medio** | 2026-06-19T16:00:00-05:00 | Marcha JP 19-jun; marcha 13-jun (precursor) |
| 3 | `#DefensaDelVoto` | pro-Sánchez / JP | **alto** | 2026-06-19T12:00:00-05:00 | Vigilias 17-jun; audiencia JNE 19-jun AM; marcha 19-jun |
| 4 | `#583PatronesAnomalos` | pro-Sánchez / JP | **medio** | 2026-06-19T12:00:00-05:00 | Sustentación nulidad 2.408 actas (Roy Mendoza) |
| 5 | `#AcampamentoJNE` | pro-Sánchez / autoconvocados | **medio** | 2026-06-16T10:00:00-05:00 | ~80 carpas Jr. Nazca / JNE Jesús María (continuo) |
| 6 | `#FujimoriPresidenta` | pro-Fujimori / FP | **alto** | 2026-06-19T17:28:00-05:00 | Keiko San Cosme 19-jun; JNE proclama legislativos |
| 7 | `#CriminalizaciónDeLaProtesta` | pro-Sánchez / JP | **medio** | 2026-06-19T17:55:00-05:00 | Denuncia Procuraduría 19-jun; marcha 19-jun PM |
| 8 | `#AguaSiMinaNo` | ambiental-gremial | **bajo** (nacional) | 2026-06-19T19:49:00-05:00 | Protesta Pariahuanca / GORE Junín 18–19 jun |

---

## Fichas por hashtag

### 1. `#MarchaEnDefensaDeLaDemocracia`

| Campo | Valor |
|-------|-------|
| **bando** | pro-Sánchez / Juntos por el Perú |
| **volumen_estimado** | **alto** — Denominación oficial de la movilización del 19-jun en medios ([RPP](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850)); cobertura RPP TV en vivo; estimado **800–2.500 posts** 17–19 (X/FB/WhatsApp); **≥12 artículos** nacionales en 48h |
| **pico_observado** | `2026-06-19T17:00:00-05:00` (salida Paseo Colón, Sánchez encabeza) |
| **linked_events** | Marcha «defensa de la democracia» centro histórico (19-jun); vigilias/plantones JP convocados 17-jun; reunión Sánchez–PNP garantías (18-jun) |
| **linked_accounts** | @RobertoSanchP, @JuntosPorElPer, @RPPNoticias, @WaykaPeru |
| **narrative_summary** | Hashtag alineado al nombre institucional de la marcha del 19-jun: exigir transparencia electoral y respeto al voto en el tramo final del escrutinio. RPP corroboró ejecución con Sánchez, Ana Li Márquez y Brígida Curo pese a que Mininter desestimó garantías. |
| **disinfo_risk** | **bajo** — Narrativa anclada a evento físico verificado; riesgo marginal de inflar asistencia sin cifra independiente |
| **R1 plataformas** | **X:** @RobertoSanchP activo 19-jun · **FB:** lives RPP Noticias · **TikTok:** clips RPP @rppnoticias · **IG:** cobertura @rppnoticias · **News:** saturación RPP/EC/Infobae |
| **R2 validación** | ✅ Evento físico confirmado (RPP 1693850, TV en vivo) · ⚠️ Magnitud asistentes sin cifra PNP/organizador |
| **senal_social (20%)** | `hashtag_volumen_est: alto` · `live_views_est: alto` (RPP TV) |
| **fuentes** | [RPP — Marcha Sánchez 19-jun](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850) · [RPP — Sánchez anuncia marcha 18-jun](https://rpp.pe/politica/elecciones/roberto-sanchez-anuncio-que-se-sumara-a-movilizaciones-de-este-viernes-para-exigir-transparencia-en-el-proceso-electoral-noticia-1693610) |

---

### 2. `#LaTomaDeLima`

| Campo | Valor |
|-------|-------|
| **bando** | pro-Sánchez / JP |
| **volumen_estimado** | **medio** — Hashtag histórico JP reactivado en capa social (`events.json`); titular RPP usa «Toma de Lima» pero cuerpo prefiere «marcha en defensa de la democracia»; estimado **300–1.200 posts**; menor prevalencia mediática explícita que #MarchaEnDefensaDeLaDemocracia |
| **pico_observado** | `2026-06-19T16:00:00-05:00` (convocatoria original Campo de Marte; ruta ejecutada Paseo Colón → centro histórico) |
| **linked_events** | Marcha nacional JP 19-jun; marcha 13-jun Plaza San Martín (precursor); restricciones MML centro histórico (19-jun) |
| **linked_accounts** | @JuntosPorElPer, Ernesto Zunini (vía medios), @RobertoSanchP |
| **narrative_summary** | Etiqueta de movilización calle JP reutilizada desde ciclos previos post-2da vuelta; en 17–19 jun funciona como paraguas de vigilias + marcha del viernes. La ruta no alcanzó Campo de Marte por cordón PNP según cruce Infobae/terreno. |
| **disinfo_risk** | **medio** — Riesgo de lectura como «toma violenta» o golpismo; Galarreta advirtió sobre no reconocimiento de resultados (18-jun) |
| **R1 plataformas** | **X:** uso en convocatorias JP (comunicado, no perfil oficial activo) · **FB/WhatsApp:** difusión grassroots · **News:** RPP titular «Toma de Lima» |
| **R2 validación** | ✅ Marcha ejecutada · ⚠️ Hashtag más social que mediático; magnitud no verificada |
| **senal_social (20%)** | `hashtag_volumen_est: medio` |
| **fuentes** | [RPP — Roberto Sánchez en Toma de Lima](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850) · [RPP — Marcha 13-jun](https://rpp.pe/politica/elecciones/marcha-en-lima-simpatizantes-de-juntos-por-el-peru-y-colectivos-sociales-exigen-respeto-a-la-voluntad-popular-y-transparencia-electoral-noticia-1692948) |

---

### 3. `#DefensaDelVoto`

| Campo | Valor |
|-------|-------|
| **bando** | pro-Sánchez / JP |
| **volumen_estimado** | **alto** — Cross-ref convocatorias JP en `events.json` y marcha 13-jun («en defensa del voto popular»); reforzado por Roy Mendoza 19-jun AM; estimado **600–2.000 posts**; paralelo a escalada de margen ONPE |
| **pico_observado** | `2026-06-19T12:00:00-05:00` (sustentación Mendoza) + `2026-06-19T17:00:00-05:00` (marcha) |
| **linked_events** | Vigilias y plantones JP 17-jun (nacional); audiencia JNE apelaciones 2.400+ actas 19-jun; marcha centro histórico 19-jun; amparo voto exterior Walter Ayala (17-jun) |
| **linked_accounts** | @JuntosPorElPer, @RobertoSanchP, Roy Mendoza (vía RPP), Ernesto Zunini |
| **narrative_summary** | Marco retórico central de JP: el escrutinio final debe respetar la voluntad popular, con foco en actas Lima y voto en el exterior. Convive con impugnaciones legales (2.408 actas) sin equivaler a dictamen de fraude institucional. |
| **disinfo_risk** | **medio** — Confusión entre impugnación legal y «voto robado»; riesgo de claims no verificados sobre cadena de custodia exterior |
| **R1 plataformas** | **X:** bajo volumen cuenta oficial JP · **FB:** alto (RPP shares) · **News:** RPP, El Comercio, Cancillería 19-jun |
| **R2 validación** | ✅ Narrativa ↔ impugnaciones JNE verificadas · ⚠️ Voto exterior disputado sin resolución PJ |
| **senal_social (20%)** | `hashtag_volumen_est: alto` |
| **fuentes** | [RPP — 583 patrones / Mendoza](https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777) · [RPP — JNE revisará apelaciones 19-jun](https://rpp.pe/politica/elecciones/jne-revisara-este-viernes-las-apelaciones-de-juntos-por-el-peru-sobre-nulidad-de-mas-de-2000-mesas-tras-la-segunda-vuelta-noticia-1693602) |

---

### 4. `#583PatronesAnomalos`

| Campo | Valor |
|-------|-------|
| **bando** | pro-Sánchez / JP (argumento legal) |
| **volumen_estimado** | **medio** — Pico 19-jun mañana tras aparición de Roy Mendoza en *Ampliación de Noticias* (RPP 12:00); replicación FB RPP + potencial TikTok; estimado **200–800 posts**; **5–8 artículos** dedicados |
| **pico_observado** | `2026-06-19T12:00:00-05:00` (publicación RPP 1693777) |
| **linked_events** | Sustentación pedido nulidad 2.408 actas ante JNE (19-jun AM); foco 1.751 mesas Lima + 647 actas exterior |
| **linked_accounts** | Roy Mendoza (abogado JP, vía medios), @RPPNoticias, [RPP Facebook post](https://www.facebook.com/rppnoticias/posts/-el-abogado-de-juntos-por-el-per%C3%BA-roy-mendoza-sustent%C3%B3-el-pedido-de-nulidad-de-m/1084629227226470/) |
| **narrative_summary** | Mendoza describe 583 «patrones anómalos» (mesas correlativas con mismo resultado FP) como base de impugnación en Lima. Es **alegato jurídico**, no dictamen ONPE/JNE; ONPE mantiene conteo oficial sin validar «fraude sistemático». |
| **disinfo_risk** | **alto** — DIS-JUN19-04: viralización como «prueba definitiva» de fraude; omisión de contexto jurídico |
| **R1 plataformas** | **X:** citas de clip Mendoza · **FB:** post RPP oficial · **TikTok:** riesgo recorte sin contexto · **News:** RPP principal vector |
| **R2 validación** | ✅ Claim existe y fue sustentado · ❌ NO verificado por ONPE/JNE · ⚠️ Alto riesgo descontextualización |
| **senal_social (20%)** | `hashtag_volumen_est: medio` · confianza narrativa: baja para «fraude comprobado» |
| **fuentes** | [RPP — 583 patrones anómalos](https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777) · [RPP Facebook — Mendoza](https://www.facebook.com/rppnoticias/posts/-el-abogado-de-juntos-por-el-per%C3%BA-roy-mendoza-sustent%C3%B3-el-pedido-de-nulidad-de-m/1084629227226470/) |

---

### 5. `#AcampamentoJNE`

| Campo | Valor |
|-------|-------|
| **bando** | pro-Sánchez / JP + autoconvocados (ronderos) |
| **volumen_estimado** | **medio** — Ancla física fuerte (~80 carpas, parque Bausate y Meza) con señal social menor que hashtags electorales de pico; estimado **150–500 posts** 17–19; cobertura RPP 16-jun sostenida |
| **pico_observado** | `2026-06-16T10:00:00-05:00` (reporte RPP ~80 carpas); continuidad verificada 17–19 jun |
| **linked_events** | Acampamento frente JNE Jr. Nazca, Jesús María (desde ~9-jun); vigilias 17-jun; PNP desplegada en punto |
| **linked_accounts** | Víctor Vallejo (CNRC, vía RPP), @JuntosPorElPer, simpatizantes autoconvocados |
| **narrative_summary** | Plantón indefinido frente al JNE con ~80 carpas y llegada de ronderos «autoconvocados»; continúa pese a que JP dejó de recibir donaciones para nulidades (15-jun). Señal de persistencia más que de pico viral. |
| **disinfo_risk** | **bajo** — Evento geolocalizado y filmado; negación de financiamiento partidario por dirigente Vallejo |
| **R1 plataformas** | **X/FB:** difusión local Lima · **News:** RPP 16-jun · **TV:** RPP TV acampamento |
| **R2 validación** | ✅ Terreno confirmado (foto/video RPP) · magnitud ~80 carpas, no miles |
| **senal_social (20%)** | `hashtag_volumen_est: medio` · confirmación terreno: alta |
| **fuentes** | [RPP — Acampamento JNE](https://rpp.pe/peru/actualidad/simpatizantes-de-juntos-por-el-peru-dicen-que-seguiran-acampando-frente-al-jne-noticia-1693265) · [RPP — JP deja donaciones nulidades](https://rpp.pe/politica/elecciones/juntos-por-el-peru-dejara-de-recibir-donaciones-para-costear-nulidades-de-actas-afirma-tesorera-noticia-1693167) |

---

### 6. `#FujimoriPresidenta`

| Campo | Valor |
|-------|-------|
| **bando** | pro-Fujimori / Fuerza Popular |
| **volumen_estimado** | **alto** — Impulsado por crecimiento de margen (+41.565 al 19-jun) y declaraciones Keiko; estimado **500–3.000 posts**; riesgo de confusión post-proclamación **legislativa** JNE 19-jun (~17:28) |
| **pico_observado** | `2026-06-19T14:05:00-05:00` (Keiko: «diferencia ha crecido») + `2026-06-19T17:28:00-05:00` (JNE proclama senadores/diputados) |
| **linked_events** | Keiko visita cerro San Cosme 19-jun tarde; JNE proclama legislativos 19-jun (**no** presidencia); escrutinio ONPE 99,63% |
| **linked_accounts** | @KeikoFujimori, @FuerzaPopular__, @rlopezaliaga1, @RPPNoticias |
| **narrative_summary** | Hashtag de expectativa pro-FP ante ampliación de ventaja en ONPE; Keiko pide «calma y prudencia» sin proclamarse ganadora. Vector disinfo DIS-JUN19-01: usuarios confunden proclamación congresal con presidencial (proclamación presidencial: mediados jul). |
| **disinfo_risk** | **alto** — Falsas actas/portadas de proclamación presidencial; mezcla legislativo vs presidencial |
| **R1 plataformas** | **X:** @KeikoFujimori actividad mediática · **FB/WhatsApp:** imágenes apócrifas (DIS-JUN19-01) · **News:** RPP, El Comercio |
| **R2 validación** | ✅ Margen ONPE real · ❌ Presidencia NO proclamada · ⚠️ Disinfo activa |
| **senal_social (20%)** | `hashtag_volumen_est: alto` · disinfo_risk compuesto: alto |
| **fuentes** | [RPP — Keiko margen votos](https://rpp.pe/politica/elecciones/keiko-fujimori-la-diferencia-de-votos-ha-crecido-y-esto-nos-genera-muy-buena-expectativa-noticia-1693813) · [RPP — JNE proclama legislativos](https://rpp.pe/politica/elecciones/jne-proclama-los-resultados-de-los-senadores-diputados-y-parlamentarios-andinos-noticia-1693837) |

---

### 7. `#CriminalizaciónDeLaProtesta`

| Campo | Valor |
|-------|-------|
| **bando** | pro-Sánchez / JP (contra-narrativa); marco institucional anti-«azuzamiento» |
| **volumen_estimado** | **medio** — Pico 19-jun tarde tras denuncia Procuraduría (~17:55) y respuesta @RobertoSanchP; estimado **300–1.000 posts**; engagement alto en post Sánchez (RPP cita rechazo explícito) |
| **pico_observado** | `2026-06-19T17:55:00-05:00` (denuncia Procuraduría publicada) |
| **linked_events** | Denuncia penal 9 personas (Cevallos, Antauro Humala, Cisneros, etc.) 19-jun; marcha centro histórico 19-jun PM; informes Divincri/MML adjuntos |
| **linked_accounts** | @RobertoSanchP, @HCevallosFlores, Antauro Humala, Claudia Cisneros |
| **narrative_summary** | Procuraduría denuncia por presunta perturbación de la tranquilidad pública vinculada a convocatorias de movilización; JP enmarca la medida como criminalización de protesta pacífica. Sánchez rechazó la denuncia en X el mismo día de la marcha. |
| **disinfo_risk** | **medio** — Polos opuestos: «terrorismo de Estado» (redes JP) vs «azuzamiento digital» (Procuraduría/Divincri); hecho de denuncia es verificable |
| **R1 plataformas** | **X:** @RobertoSanchP post 19-jun (status 2068075544395321358) · **FB:** Antauro Humala citado en RPP · **News:** RPP judiciales |
| **R2 validación** | ✅ Denuncia presentada · ✅ Respuesta Sánchez · ⚠️ Sin resolución fiscalía aún |
| **senal_social (20%)** | `hashtag_volumen_est: medio` |
| **fuentes** | [RPP — Procuraduría denuncia](https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848) · [RPP — Marcha + rechazo Sánchez](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850) |

---

### 8. `#AguaSiMinaNo`

| Campo | Valor |
|-------|-------|
| **bando** | ambiental-gremial / Frente Defensa Junín |
| **volumen_estimado** | **bajo** (nacional) · **medio** (Junín regional) — Consigna física en protesta Pariahuanca; baja prevalencia en capa electoral Lima; estimado **<200 posts** nacionales, mayor densidad en FB/WhatsApp regional; **4–6 artículos** regionales 17–19 |
| **pico_observado** | `2026-06-19T19:49:00-05:00` (firma acta compromisos GORE Junín) |
| **linked_events** | Protesta Pariahuanca frente GORE Huancayo 18–19 jun (~30 h); gases lacrimógenos PNP 18-jun; mortandad truchas río Yuracyacu (antecedente abril); reunión aplazada Zósimo Cárdenas 25-jun |
| **linked_accounts** | Frente Defensa Junín, Rogelio López Humán (dirigente, vía El Búho), HYTimes regional |
| **narrative_summary** | Hashtag/slogan de defensa de cuencas (Yuracyacu, Shullcas, Tulumayo, Achamayo) frente a expansión minera tras desastre ambiental de truchas. Protesta estacionaria en GORE (cientos, no ~10.000 marcha); GORE cedió a ordenanza de intangibilidad de cabeceras. |
| **disinfo_risk** | **bajo** — Demandas verificables en acta firmada; riesgo de inflar convocatoria original ~10.000 |
| **R1 plataformas** | **FB:** HYTimes, El Búho · **X:** bajo · **News:** RPP Junín, HYTimes, El Búho · **TikTok:** clips dispersión 18-jun |
| **R2 validación** | ✅ Protesta realizada · ✅ Acuerdo 19-jun noche · ❌ Marcha 10.000 no materializada |
| **senal_social (20%)** | `hashtag_volumen_est: bajo` (nacional) · confirmación terreno: media-alta (Junín) |
| **fuentes** | [HYTimes — Acuerdo GORE 19-jun](https://hytimes.pe/2026/06/19/gobierno-regional-cede-y-emitira-ordenanza-para-proteger-el-huaytapallana-y-cabeceras-de-cuenca/) · [RPP — Dispersión GORE 18-jun](https://rpp.pe/peru/actualidad/junin-policias-dispersan-pobladores-que-intentaban-ingresar-al-gobierno-regional-para-exigir-proteccion-de-cuencas-noticia-1693682) |

---

## Matriz narrativa ↔ físico (Ronda 2)

| Hashtag | Evento físico | Estado | Confianza |
|---------|---------------|--------|-----------|
| #MarchaEnDefensaDeLaDemocracia | Marcha Paseo Colón → centro histórico | **EJECUTADO** 19-jun | Alta |
| #LaTomaDeLima | Misma marcha 19-jun (ruta alternativa) | **EJECUTADO** (parcial vs Campo de Marte) | Media |
| #DefensaDelVoto | Vigilias 17-jun + audiencia JNE 19-jun | **EJECUTADO / EN CURSO** | Alta |
| #583PatronesAnomalos | Sustentación oral Mendoza | **EJECUTADO** 19-jun AM | Alta (hecho); baja (fraude) |
| #AcampamentoJNE | ~80 carpas JNE Jesús María | **CONTINUO** 16–19 jun | Alta |
| #FujimoriPresidenta | Keiko San Cosme; sin proclamación presidencial | **PARCIAL** (expectativa, no hecho) | Media |
| #CriminalizaciónDeLaProtesta | Denuncia + marcha simultánea | **EJECUTADO** 19-jun | Alta |
| #AguaSiMinaNo | Plantón GORE Huancayo → acta | **EJECUTADO** → acuerdo | Alta |

---

## Riesgo desinformación consolidado

| ID | Hashtag relacionado | Riesgo | Veredicto |
|----|---------------------|--------|-----------|
| DIS-JUN19-01 | #FujimoriPresidenta | Alto | Falsa proclamación presidencial |
| DIS-JUN19-04 | #583PatronesAnomalos | Alto | Alegato legal ≠ fraude comprobado |
| DIS-JUN19-05 | #CriminalizaciónDeLaProtesta | Medio | Marcos legales opuestos, hecho verificable |
| — | #LaTomaDeLima | Medio | Connotación golpista en contra-narrativa FP |

---

## Gaps / incertidumbres

- Conteo exacto de posts por hashtag: **no disponible** sin API X/TikTok/IG.
- Magnitud marcha 19-jun Lima: ejecutada, **sin cifra asistentes** en fuentes consultadas.
- @JuntosPorElPer, @HCevallosFlores: inactivos en X público; actividad real puede estar tras login.
- #AguaSiMinaNo: prevalencia social nacional probablemente subestimada en WhatsApp regional.

---

## JSON compuesto (muestra — hashtag #MarchaEnDefensaDeLaDemocracia)

```json
{
  "hashtag": "#MarchaEnDefensaDeLaDemocracia",
  "senal_social": {
    "hashtag_volumen_est": "alto",
    "posts_est_rango": [800, 2500],
    "live_views_est": "alto"
  },
  "senal_medios": {
    "articulos_48h": 12,
    "tv_en_vivo": true
  },
  "confirmacion_terreno": {
    "ejecutado": true,
    "fuentes": ["RPP 1693850", "RPP TV"]
  },
  "magnitud_confianza": "media",
  "disinfo_risk": "bajo"
}
```

---

*Generado: 2026-06-19T21:00:00-05:00 · Clasificación: USO OPERATIVO — SENSIBLE · Metodología v3.9*