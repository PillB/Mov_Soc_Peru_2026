# FP grassroots amplifiers — investigación 24-jun-2026

**Gap matrix:** P2 — amplificadores grassroots FP no indexados  
**Corte:** 2026-06-24  
**Alcance:** cuentas X / Facebook / Instagram de movilización voluntaria FP (no prensa oficial `@FuerzaPopular__`, no candidata `@KeikoFujimori`, no medios/influencers ya indexados)

## Resumen

| Métrica | Valor |
|---------|-------|
| Cuentas nuevas verificadas (recomendadas para patch) | **4** |
| Cuentas omitidas (ya indexadas o sin evidencia) | **14** |
| Barra de inclusión | URL HTTP 200 + evidencia externa de movilización grassroots + cita del handle o post verificable |

## Cuentas nuevas — tabla de verificación

| Handle | Plataforma | Región | Evidencia URL | Por qué es amplificador grassroots |
|--------|------------|--------|---------------|-----------------------------------|
| `@jovenesfp` | Instagram | nacional / Lima | [Reel colaborativo 1-jun-2026](https://www.instagram.com/reel/DZDGSDFRwwl/) (co-autor con `@fuerzapopular_`) | Organización juvenil FP; reel campaña **Defensores del Perú** y reclutamiento personeros; no es cuenta oficial del partido |
| `@JovenesFP_` | X | nacional / Lima | [Post verificable](https://x.com/JovenesFP_/status/2060425991890116740) + HTTP 200 en perfil | Par X de la organización juvenil; amplifica narrativa pro-Keiko y movilización post-segunda vuelta |
| `facebook.com/JovenesFuerzaPopular` | Facebook | nacional / Lima | [Página FB](https://www.facebook.com/JovenesFuerzaPopular) HTTP 200; título «Jóvenes Fuerza Popular Keiko» | Red juvenil FP en FB; eje de difusión grassroots paralelo a IG/X |
| `@DefensoresDelPeru` | X | nacional | [Infobae 19-may-2026](https://www.infobae.com/peru/2026/05/19/elecciones-2026-fuerza-popular-inicia-el-registro-de-100-mil-personeros-voluntarios-para-la-segunda-vuelta/) + [RPP 19-may-2026](https://rpp.pe/politica/elecciones/keiko-fujimori-presenta-a-luis-dyer-como-jefe-del-equipo-de-personeros-de-fuerza-popular-noticia-1689129) + HTTP 200 | Cuenta del programa voluntario **Defensores del Perú** (meta 100k personeros, rol «personero digital»); distinta de `@FuerzaPopular__`. *Nota:* prensa cita programa y `defensoresdelperu.pe`, no el handle X explícitamente — evidencia indirecta por nombre + URL activa |

## Cuentas omitidas

| Handle | Motivo |
|--------|--------|
| `@FuerzaPopular__` | Ya indexado (`actores` lima + `cuentas_emergentes`) — prensa oficial FP |
| `@KeikoFujimori` | Ya en `cuentas_emergentes` — candidata oficial |
| `@rlopezaliaga1` | Ya en `cuentas_emergentes` + `grassroots.nacional.accounts` |
| `@fuerzapopular_` (IG) | Prensa oficial FP; reel 18–19-jun es comunicación institucional |
| `@FuerzaPopularPe` (FB) | Prensa oficial FP |
| `@WillaxTV`, `@PepeClimper`, `@PatriciaJuarezE`, `@NormaYarrow`, `@betoortizperu`, `@PhilipButters` | Ya en `cuentas_emergentes` — medios/influencers, no gap grassroots |
| `@KeikoNova` | HTTP 404 en X; «no verificado independientemente» en actores |
| `@MarchaDemocracia` | Solo `cross_ref` interno en convocatoria 15-jun; sin artículo externo que cite el handle (hashtag `#MarchaPorLaDemocracia` en Willax ≠ handle) |
| `@FuerzaPopularLima`, `@FuerzaPopularPiura`, `@FuerzaPopularTrujillo` | HTTP 200 pero sin fuente externa que cite el handle |
| `@Arde_Troya` | Medio/influencer (Infobae cita canal YouTube), no grassroots |
| `@JuanCarbajal` / `@JuanCarbajalData` | Analista de datos citado en prensa, no movilizador grassroots |
| `DiegoBazanRP` | HTTP 404; solo cobertura Diario Correo sin handle verificado |

## Observación operativa (17–24 jun)

Bloque FP en X mayormente **dormante** en ventana post-escrutinio (coherente con `research/social/accounts_deep_jun19.md`): actividad grassroots concentrada en **personeros / jóvenes / Defensores** y prensa oficial IG, no en nuevas convocatorias masivas indexables.

## Fuentes consultadas

- [Infobae — 100 mil personeros voluntarios](https://www.infobae.com/peru/2026/05/19/elecciones-2026-fuerza-popular-inicia-el-registro-de-100-mil-personeros-voluntarios-para-la-segunda-vuelta/)
- [Perú21 — campaña Defensores del Perú](https://peru21.pe/politica/fuerza-popular-busca-100-mil-personeros-con-nueva-campana-nacional/)
- [RPP — Luis Dyer jefe personeros](https://rpp.pe/politica/elecciones/keiko-fujimori-presenta-a-luis-dyer-como-jefe-del-equipo-de-personeros-de-fuerza-popular-noticia-1689129)
- [FB FuerzaPopularPe — frutinovela Defensores](https://www.facebook.com/FuerzaPopularPe/videos/sabes-qu%C3%A9-son-los-defensores-del-per%C3%BA-te-lo-contamos-en-esta-frutinovela-descubr/1346478634062314/)
- [IG reel `@jovenesfp` + `@fuerzapopular_`](https://www.instagram.com/reel/DZDGSDFRwwl/)
- Verificación HTTP: `curl -sL -o /dev/null -w "%{http_code}"` sobre URLs candidatas (24-jun-2026)

## Rutas de patch recomendadas

1. **Primario:** `social_intelligence.cuentas_emergentes[]` — añadir 4 entradas con `validacion_ronda: 6`, `posicion: "pro_fp"`, `mobilization_role: "amplificador"`
2. **Espejo opcional:** `grassroots.nacional.accounts[]` — entradas compactas con `verification: "fp_grassroots_jun24"`, `role: "amplificador"`
3. **Script:** extender `scripts/update_v3910.py` con bloque `NEW_ACCOUNTS_FP_GRASSROOTS_R6` siguiendo patrón `NEW_ACCOUNTS_R5` + `dedup_cuentas()`