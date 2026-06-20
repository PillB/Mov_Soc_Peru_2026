# OSINT Plataformas — YouTube · Reddit · 4chan
## Perú segunda vuelta / manifestaciones · Ventana 17–20 junio 2026

**Corte:** 20-jun-2026 ~02:10 PET  
**Contexto:** ONPE ~99,63% actas · Fujimori 50,23% vs Sánchez 49,77% (+41.565) · Marcha JP **ejecutada** 19-jun · JNE proclamó solo legislativos (no presidencia).  
**Metodología magnitud:** Proxy 1–5 según `research/methodology/magnitude_estimation.md` dimensión C (señal social); **no sustituye** conteo en terreno.

---

## Resumen ejecutivo

| Plataforma | `data_availability` | Magnitud proxy (1–5) | Rol OSINT en ventana 17–20 |
|------------|---------------------|----------------------|----------------------------|
| **YouTube** | **Alta** (RPP verificable; ONPE oficial ausente) | **4** | Principal señal audiovisual de marcha 19-jun, restricciones MML y escrutinio |
| **Reddit** | **Media** (r/peru accesible vía old.reddit; r/Lima irrelevante) | **3** | Discurso electoral intenso; **poca** cobertura logística de protestas |
| **4chan** | **Muy baja** (archivo /pol/ 3 días sin hits Perú) | **1** | **Nulo/bajo** — sin hilos verificables sobre Perú en ventana |

---

## 1. YouTube

### 1.1 Disponibilidad de datos (`data_availability`)

| Fuente | Estado 20-jun | Calidad métrica |
|--------|---------------|-----------------|
| [RPP TV en vivo](https://rpp.pe/tv-vivo) | **ACTIVO** — programación 19-jun visible (Las Noticias, Prueba de Fuego) | Live concurrent viewers: **no expuesto** en página pública |
| [@RPPNoticias](https://www.youtube.com/@RPPNoticias) | **ACTIVO** — VOD + clips marcha/Keiko | `viewCount` verificable vía scrape HTML |
| [@WaykaPeru](https://www.youtube.com/@WaykaPeru) | Perfil existe; **sin videos electorales** en primera página parseada 20-jun | Cobertura alternativa **no cuantificada** en este corte |
| ONPE oficial | **Sin canal/live oficial** verificado en YT para escrutinio | — |
| Trackers ciudadanos / terceros | Presentes (ej. recuento minuto a minuto) | Views bajos–medios vs RPP |

### 1.2 Lives y videos clave (17–20 jun)

#### RPP Noticias — marcha y coyuntura electoral

| Video ID | Título (abrev.) | Views (20-jun) | Fecha / nota |
|----------|-----------------|----------------|--------------|
| [mZ1CYpLnTq8](https://www.youtube.com/watch?v=mZ1CYpLnTq8) | 🔴 EN VIVO \| Cierre Av. Abancay y calles por manifestaciones \| 19/06/2026 | **7.264** | Transmitido en vivo ~15 h antes del corte |
| [Ma50-6xv04U](https://www.youtube.com/watch?v=Ma50-6xv04U) | Roberto Sánchez se suma a marcha por transparencia electoral | **6.781** | 19-jun-2026 |
| [Hyq_EDBSJk0](https://www.youtube.com/watch?v=Hyq_EDBSJk0) | Keiko Fujimori se pronuncia sobre marchas convocadas por JP | **28.905** | 19-jun-2026 |
| [tN8Ajd0nKOg](https://www.youtube.com/watch?v=tN8Ajd0nKOg) | Roberto Sánchez anuncia marcha en defensa del voto (#EncendidosRPP) | **16.567** | Pre-19-jun |
| [IyZQPpFAn00](https://www.youtube.com/watch?v=IyZQPpFAn00) | Marcha JP en Lima: cuestionan actas | **4.238** | 19-jun ventana |
| [JWLLgBoam7M](https://www.youtube.com/watch?v=JWLLgBoam7M) | Concentración "Defensa del voto popular" | **3.207** | 19-jun ventana |
| [trKj7qLH4mg](https://www.youtube.com/watch?v=trKj7qLH4mg) | Restricción vehicular Centro de Lima ante marcha JP | **5.836** | 18–19 jun |
| [eRCU_VlW-do](https://www.youtube.com/watch?v=eRCU_VlW-do) | Mininter niega autorización a marcha JP (#RPPDespacho) | **4.237** | 19-jun |
| [CLW9Y6hx12Y](https://www.youtube.com/watch?v=CLW9Y6hx12Y) | Sánchez liderará marcha; tensión por cierre electoral | **4.551** | Pre-19-jun |
| [B5dDX6xzY-Y](https://www.youtube.com/watch?v=B5dDX6xzY-Y) | Marcha Lima simpatizantes JP (#ShortRPP) | **68.837** | 13-jun (precedente ruta/magnitud) |

**RPP.pe TV (no-YT):** clips embebidos 19-jun — marcha Sánchez (02:30), Keiko San Cosme (02:14) en [rpp.pe/tv-vivo](https://rpp.pe/tv-vivo).

#### Escrutinio / recuento (no ONPE oficial)

| Video ID | Canal | Título | Views |
|----------|-------|--------|-------|
| [5BVL1tTSXoM](https://www.youtube.com/watch?v=5BVL1tTSXoM) | El Comercio | 🔴 EN VIVO: RECUENTO JEE \| segunda vuelta \| 18-jun | **30.016** |
| [gui8sFmjj10](https://www.youtube.com/watch?v=gui8sFmjj10) | Ciudadano | Roberto Sánchez y Keiko — resultados minuto a minuto | **5.593** |
| [1vgm3vjLQZI](https://www.youtube.com/watch?v=1vgm3vjLQZI) | Tercero | Audiencias recuento votos JEE | **6.218** |

#### Wayka Perú

- Handle verificado: [@WaykaPeru](https://www.youtube.com/@WaykaPeru) (228K seguidores en X según `social_jun19.md`).
- **Gap 20-jun:** scrape de `/videos` y `/search?query=elecciones` **no devolvió** títulos electorales indexables (posible lazy-load / categorización no electoral en portada).
- **Señal indirecta:** actividad en X (microdocumental 17-jun) y referencia operativa en inventario base; **views de lives Wayka no verificados** en este corte.

#### Ruido / desinformación en YT (ventana)

| Video ID | Views | Nota OSINT |
|----------|-------|------------|
| [0DHll_vzdyE](https://www.youtube.com/watch?v=0DHll_vzdyE) | 62.140 | Título sensacionalista "KEIKO PRESIDENTA" / fraude — **no fuente institucional** |
| [_8K_O9KjkRA](https://www.youtube.com/watch?v=_8K_O9KjkRA) | 55.236 | Geopolítica / clickbait electoral |

### 1.3 Señales detectadas

| Señal | Evidencia | Bando / tono |
|-------|-----------|--------------|
| **Marcha 19-jun ejecutada** | RPP YT + RPP TV: Sánchez desde Paseo Colón, cierres Abancay | Neutral-institucional |
| **Pre-convocatoria y restricciones** | trKj7qLH4mg, eRCU_VlW-do | Institucional / JP |
| **Contra-narrativa FP** | Hyq_EDBSJk0 (Keiko sobre marchas) | pro-Fujimori |
| **Escrutinio paralelo** | El Comercio EN VIVO 18-jun | Neutral |
| **Acampamento JNE** | Cobertura RPP TV histórica 16–19 jun (ref. `social_jun19.md`) | pro-Sánchez / JP |

### 1.4 Métricas agregadas (estimadas)

```json
{
  "senal_social_yt": {
    "lives_confirmados": ["RPP TV web", "RPP YT mZ1CYpLnTq8"],
    "clips_marcha_19jun_views_suma_verificada": 80200,
    "clip_top_marcha": {"id": "B5dDX6xzY-Y", "views": 68837, "nota": "13-jun precedente"},
    "live_views_peak": null,
    "canales_institucionales_onpe": false
  }
}
```

*Suma ≈ Ma50 + Hyq + tN8A + IyZQP + JWLLg + trKj + eRCU + mZ1CY (videos directamente ligados a marcha 17–20).*

### 1.5 Magnitud proxy: **4 / 5**

**Justificación:** TV en vivo nacional + múltiples VOD RPP con timestamps 19-jun; views decenas de miles en clips de coyuntura; correlación fuerte con evento físico confirmado (marcha centro Lima). No alcanza 5 por ausencia de peak concurrent viewers y cobertura Wayka/ONPE no cuantificada.

### 1.6 Limitaciones

- YouTube no expone viewers concurrentes históricos sin API autenticada.
- Búsqueda global YT mezcla **clickbait** peruano e internacional; requiere filtro por canal.
- **ONPE sin live oficial** en YT → escrutinio vía medios/terceros.
- Wayka: **métricas no obtenidas** en scrape 20-jun (incertidumbre media).

---

## 2. Reddit

### 2.1 Disponibilidad de datos (`data_availability`)

| Subreddit | Relevancia Perú Lima | Acceso 20-jun | Hilos electorales 17–20 |
|-----------|----------------------|---------------|-------------------------|
| **r/peru** (r/PERU) | **Alta** | old.reddit.com **funcional** | **Sí** — múltiples posts política/humor |
| **r/Lima** | **Nula** | Accesible | **No** — subreddit de **Lima, Ohio** (EE.UU.) |
| **r/worldnews** | Baja (Perú minor topic) | Búsqueda `peru election` semana | **0 resultados** |

### 2.2 Hilos relevantes r/peru (17–20 jun)

| Hilo | Score | Comentarios | Señal |
|------|-------|-------------|-------|
| [Cusco le dice no a las movilizaciones de Sánchez](https://old.reddit.com/r/PERU/comments/1u9p985/) | 33 | 11 | **Único hilo directo manifestaciones** en búsqueda `marcha`/`manifestaciones` — FDTC Cusco rechaza movilizaciones |
| [El verdadero enemigo del país es el fanático...](https://old.reddit.com/r/PERU/comments/1u7wnw1/) | 387 | 120 | Meta-política post-escrutinio; anti-fanatismo Keiko/JP |
| [La realidad](https://old.reddit.com/r/PERU/comments/1u72d1p/) | 299 | 11 | Meme electoral margen ONPE |
| [Resumen de la segunda vuelta](https://old.reddit.com/r/PERU/comments/1u6uo2f/) | 127 | 16 | Humor — mapa votos rural/urbano/exterior |
| [Y con ustedes, la autodenominada izquierda](https://old.reddit.com/r/PERU/comments/1u4iabh/) | 249 | 81 | Narrativa fraude JP vs FP |
| [Vas a migrar si gana la Keiko?](https://old.reddit.com/r/PERU/comments/1u9crb3/) | 0 | 19 | Ansiedad post-resultado |
| [Me estás diciendo que Keiko no lo controlaba todo](https://old.reddit.com/r/PERU/comments/1u6t5lu/) | 56 | 22 | Escrutinio / ironía |

**Top semana r/peru:** dominado por memes y opinión (`Elecciones latinoamericanas típicas` 549 pts); **ningún top post** es cobertura en vivo de marcha 19-jun.

### 2.3 Señales narrativas

| Narrativa | Intensidad Reddit | Correlación física |
|-----------|-------------------|-------------------|
| Fanatismo bilateral (Keiko vs JP) | **Alta** | Débil |
| Fraude / "pitando fraude" JP | **Media** | Audiencia JNE (Roy Mendoza) |
| Migración si gana Keiko | **Baja–media** | Ninguna |
| Rechazo movilizaciones regionales (Cusco) | **Baja** (1 hilo) | Posible divergencia JP centro vs sur |
| Logística marcha Lima (rutas, magnitud) | **Muy baja** | Marcha ejecutada sin hilo dedicado |

### 2.4 Métricas agregadas (estimadas)

```json
{
  "senal_social_reddit": {
    "sub_principal": "r/peru",
    "hilos_electorales_semana_top25": 8,
    "hilos_manifestacion_directa": 1,
    "score_max_politica": 387,
    "comentarios_max_politica": 193,
    "busqueda_onpe_semana": 0,
    "r_lima_peru": false
  }
}
```

### 2.5 Magnitud proxy: **3 / 5**

**Justificación:** Comunidad activa con picos >500 pts en temas electorales, pero **Reddit no convoca ni documenta** la marcha 19-jun con la intensidad de X/FB/YT. Señal útil para **sentimiento** y memes, no para magnitud calle.

### 2.6 Limitaciones

- Reddit Perú es **minoritario** vs X/TikTok/FB en Perú.
- new.reddit / JSON API bloqueados sin auth en varios entornos.
- **r/Lima ≠ Lima Perú** — error común en OSINT.
- Sin acceso a conteos exactos de usuarios activos o reach.

---

## 3. 4chan

### 3.1 Disponibilidad de datos (`data_availability`)

| Board | Ventana archive | Método | Resultado Perú |
|-------|-----------------|--------|----------------|
| **/pol/** | 3.000 hilos / 3 días (hasta ~20-jun UTC) | WebFetch archive + grep `peru\|fujimori\|keiko\|lima` en excerpts | **0 coincidencias** |
| **/int/** | 1.648 hilos / 3 días | Archive fetch | **0 excerpts** Perú electoral |
| **/bant/** | 3 días | grep excerpts | **0 coincidencias** |
| **/his/** | 3 días | grep excerpts | **0 coincidencias** |

**Temas dominantes /pol/ 17–20 jun (muestra):** Trump/Irán/Israel, World Cup 2026, UE, inmigración EE.UU. — **sin Latinoamérica electoral**.

### 3.2 Señales Perú

| Tipo | Conteo verificado | Veredicto |
|------|-------------------|-----------|
| Hilos dedicados Perú segunda vuelta | **0** | **Nulo** |
| Menciones Fujimori / Keiko / Sánchez | **0** en excerpts archive | **Nulo** |
| Manifestaciones Lima | **0** | **Nulo** |
| Planificación / convocatorias | **0** | **Nulo** |

> **Evaluación honesta:** Para la ventana 17–20 jun 2026, **4chan no es una fuente operativa** para OSINT de protestas peruanas. Cualquier claim de influencia 4chan en la movilización JP **no está respaldado** por archive público consultado.

### 3.3 Magnitud proxy: **1 / 5**

**Justificación:** Ausencia de hilos identificables; board orientado a política anglosajona y Medio Oriente. Escala 1 = señal negligible (no confundir con "riesgo cero" en otros canales).

### 3.4 Limitaciones

- Archive 4chan solo muestra **excerpts**; menciones en cuerpo de hilo podrían escapar si título no contiene keywords (riesgo residual **bajo** dado volumen 0 en grep).
- Acceso programático a boards devuelve **403** en algunos entornos; análisis basado en fetch HTML exitoso de archive.
- 4chan no es representativo del ecosistema hispanohablante peruano.

---

## 4. Matriz comparativa OSINT

| Dimensión | YouTube | Reddit | 4chan |
|-----------|---------|--------|-------|
| Cobertura marcha 19-jun | ✅ Fuerte (RPP) | ⚠️ Marginal (1 hilo Cusco) | ❌ Ninguna |
| Escrutinio ONPE/JNE | ⚠️ Vía terceros | ⚠️ Memes/opinión | ❌ |
| Métricas cuantitativas | Views VOD sí; live peak no | Upvotes/comments sí | No aplicable |
| Desinformación | Alta (canales clickbait) | Media (memes) | N/A |
| Utilidad convocatoria | Baja (reactivo) | Baja | **Nula** |
| Utilidad confirmación ejecutada | **Alta** | Baja | Nula |

---

## 5. Recomendaciones operativas

1. **Priorizar YouTube RPP + RPP TV** para correlación físico-digital de protestas Lima (dimensión C del índice compuesto).
2. **Reddit r/peru** solo como termómetro narrativo; no inferir magnitud calle desde upvotes.
3. **Excluir 4chan** del pipeline Perú salvo re-aparición de keywords en monitor semanal.
4. **Verificar Wayka** con fetch manual o API en próximo corte (gap actual).
5. **Filtrar YT** por canal allowlist (RPP, LR, EC, Wayka, Exitosa) para separar señal de ruido Karamba/clickbait.

---

## 6. Fuentes consultadas

1. https://rpp.pe/tv-vivo (19-jun programación y clips)
2. https://www.youtube.com/@RPPNoticias/search?query=marcha
3. https://www.youtube.com/@WaykaPeru/videos
4. https://old.reddit.com/r/peru/search/ (segunda vuelta, marcha, Keiko, ONPE, fraude, manifestaciones)
5. https://old.reddit.com/r/peru/top/?t=week
6. https://old.reddit.com/r/Lima/search/?q=elecciones
7. https://old.reddit.com/r/worldnews/search/?q=peru+election
8. https://boards.4chan.org/pol/archive
9. https://boards.4chan.org/int/archive
10. Cruzado con `research/social/social_jun19.md` (corte 19-jun)

---

*Generado: 2026-06-20T02:10:00-05:00 · Clasificación: USO OPERATIVO — SENSIBLE*