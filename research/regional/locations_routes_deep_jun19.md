# OSINT — 6 Ubicaciones Críticas: Rutas, Concentración y Magnitud
**Corte:** 2026-06-19T21:00:00-05:00 (PET)  
**Agente:** L5 Geoespacial · Mov_Soc_Peru_2026 v3.9.0  
**Metodología:** `research/methodology/magnitude_estimation.md` — conteo multi-fuente [min, central, max]; escala XS/S/M/L/XL  
**Referencias cruzadas:** `lima_jun19.md`, `sur_jun19.md`, `norte_centro_oriente_jun19.md`, `events.json` v3.8.1

---

## BLUF — Tabla ejecutiva (6 ubicaciones)

| # | Ubicación | Status 19-jun | Ruta (síntesis) | Magnitud [min–max] | Código | P(reactivación bloqueo) |
|---|-----------|---------------|-----------------|-------------------|--------|-------------------------|
| 1 | JNE / Parque Bausate y Meza | **activo** | Estática (plantón) | 80–200 | **S** | N/A (ya es punto fijo) |
| 2 | Centro Histórico — marcha JP | **ejecutado** | Paseo Colón → Bolognesi → Alfonso Ugarte → Piérola/Garcilaso → retorno Paseo Colón | 200–800 | **S** | 0,25 (nueva marcha Lima) |
| 3 | Campo de Marte | **inactivo** (convocado, no usado) | Convocado: CdM → Arequipa → JNE · **Real: sin concentración** | <50 en sitio | **XS** | 0,15 |
| 4 | Puente Internacional Ilave | **inactivo** | Estática en puente (convocado) · **No materializado** | 0 (bloqueo) | **XS** | **0,40** |
| 5 | GORE Junín / Pariahuanca–Huancayo | **ejecutado** → desescalado | Convocado: Parque Grau (Pariahuanca) → Huancayo · **Real: estacionario GORE** | 200–600 | **S** | **0,45** |
| 6 | Piura–Sechura / El Trébol (23-jun) | **incierto** (futuro) | Sechura / Bajo Piura → posible Óvalo El Trébol km 1058 | 500–5.000 (proy.) | **M** (proy.) | **0,65** |

---

## Metodología de conteo aplicada

Para cada evento **ejecutado** se reconciliaron estimaciones de:
- **Medios nacionales** (RPP, La República EN VIVO, Infobae, El Búho)
- **Medios regionales** (HYTimes, Norte Sostenible)
- **Organizadores** (JP, CNUL, Conveagro — marcados como sesgo alto)
- **Autoridades** (PNP despliegue como proxy indirecto, no conteo)

**Regla:** Si solo organizador cifra y medios dicen "cientos" sin número → rango S, `confianza: media`.

---

## 1. JNE — Jr. Nazca / Parque Bausate y Meza, Jesús María (acampamento)

### Status 19-jun: **ACTIVO** (probable continuidad verificada)

| Campo | Valor |
|-------|-------|
| Tipo | Plantón / acampamento estático |
| Inicio | 9-jun (vigilia electoral continua) |
| Último conteo directo | **~80 carpas** (16-jun 10:01 PET) |
| 19-jun | PNP desplegada en inmediaciones; **sin desmantelamiento** ni reconteo reportado |

### Ruta / polilínea

```
TIPO: ESTÁTICA — sin desplazamiento
PUNTO ÚNICO: Parque Bausate y Meza, frente sede JNE
  → Av. Nazca / Jr. Nazca (acceso principal JNE)
  → Perímetro: ~200 m lineal frente al parque
COORDENADAS APROX:
  - Parque Bausate y Meza: -12.0640, -77.0202
  - Sede JNE (Jr. Cusco 653 / Av. Nazca 584): -12.0689, -77.0451
```

### concentration_points

| nombre | lat_approx | lng_approx | riesgo |
|--------|------------|------------|--------|
| Parque Bausate y Meza (carpas) | -12.0640 | -77.0202 | **alto** — acumulación continua, incidente cisterna 11-jun |
| Acceso Av. Nazca frente JNE | -12.0689 | -77.0451 | **alto** — PNP permanente 19-jun |
| Jr. Lampa (rama posible hacia Centro) | -12.0670 | -77.0380 | **medio** — corredor histórico marchas→JNE |

### Magnitud (multi-fuente)

| Fuente | Estimación | Sesgo |
|--------|------------|-------|
| RPP 16-jun | ~80 carpas; decenas–cientos en rotación | neutral |
| Víctor Vallejo (CUNARC) | Convocatoria nacional refuerzo ronderos | organizador |
| LR EN VIVO 19-jun 15:40 | PNP en JNE; acampamento no disuelto | neutral |
| events.json | 50–200 en carpas (forecast) | interno |

```json
{
  "participantes_rango": [80, 200],
  "participantes_est_central": 120,
  "magnitud_codigo": "S",
  "magnitud_confianza": "media",
  "magnitud_fuentes": ["RPP 16-jun", "LR EN VIVO 19-jun", "events.json"],
  "probabilidad_continuidad_20_23jun": 0.85
}
```

### Fuentes (≥3)

1. [RPP — ~80 carpas, seguirán acampando](https://rpp.pe/peru/actualidad/simpatizantes-de-juntos-por-el-peru-dicen-que-seguiran-acampando-frente-al-jne-noticia-1693265) (16-jun)
2. [LR EN VIVO — PNP JNE 15:40](https://larepublica.pe/politica/2026/06/19/marchas-en-lima-en-vivo-simpatizantes-de-juntos-por-el-peru-protestan-por-resultados-de-la-segunda-vuelta-entre-roberto-sanchez-y-keiko-fujimori-hnews-526014) (19-jun)
3. [Caretas — incidente cisterna 11-jun](https://caretas.pe/sociedad/cisterna-municipal-moja-carpas-de-simpatizantes-de-roberto-sanchez-que-aguardaban-el-conteo-de-votos-frente-al-jne/) (contexto)
4. `research/regional/lima_jun19.md` §3

### P(reactivación) bloqueos

- **N/A** como bloqueo vial; riesgo de **escalada local** (incidentes municipio RP): **0,20**
- Riesgo de **refuerzo masivo** post-proclamación JNE: **0,35**

### Hilos sueltos

- Reconteo carpas **post-marcha 19-jun** — sin dato
- Llegada efectiva de ronderos "convocados nacionalmente" — sin cifra
- Resolución JNE nulidad 1.751 mesas Lima — catalizador narrativo

---

## 2. Centro Histórico Lima — Marcha JP 19-jun (RUTA REAL)

### Status 19-jun: **EJECUTADO**

**Corrección crítica:** La ruta real fue **Paseo Colón / Av. 9 de Diciembre**, NO Campo de Marte.

### Ruta convocada vs. ruta observada

| Elemento | Convocado | Ejecutado 19-jun |
|----------|-----------|------------------|
| Hora inicio | 16:00 | ~17:30 (primer desplazamiento reportado) |
| Punto salida | Campo de Marte (oficial JP 16-jun) | **Local JP, Av. 9 de Diciembre / Paseo Colón** |
| Destino | Campo de Marte / JNE (incierto) | Loop Centro Histórico → **retorno Paseo Colón** |
| Llegada Plaza San Martín | Probable | **BLOQUEADA** — cordón PNP |

### Polilínea detallada (ruta REAL verificada)

Cronología Infobae EN VIVO + El Búho + RPP, 19-jun ~17:30–00:30 PET:

```
WP0  LOCAL JP — Av. 9 de Diciembre cuadra 4 / Paseo Colón, Cercado de Lima
     (-12.0460, -77.0350) · Hora ~17:30-22:58
     ↓
WP1  Plaza Bolognesi
     (-12.0617, -77.0379)
     ↓
WP2  Av. Alfonso Ugarte (ascenso norte)
     (-12.0550, -77.0400) · MML cámaras confirman flujo
     ↓
WP3  Plaza 2 de Mayo
     (-12.0520, -77.0320)
     ↓
WP4  Av. Nicolás de Piérola (hacia Plaza San Martín)
     (-12.0500, -77.0340) · CORDÓN PNP — sin acceso Plaza San Martín
     ↓ [desvío forzado]
WP5  Av. Tacna → Av. Garcilaso de la Vega (ex Wilson)
     (-12.0480, -77.0360)
     ↓
WP6  Cruce Av. Garcilaso / Av. Bolivia
     (-12.0470, -77.0380)
     ↓ [variante El Búho: también 28 de Julio, Guzmán Blanco]
WP7  Cruce Abancay × Nicolás de Piérola (congestión, un carril)
     (-12.0512, -77.0290)
     ↓
WP8  RETORNO → Local JP Paseo Colón
     (-12.0460, -77.0350) · ~00:09 PET — fin marcha
     ↓
WP9  Balconera Sánchez / cierre — Jr. Tarma (local campaña)
```

**Calles secundarias observadas (MML monitoreo):** Jr. de la Unión, Jr. Conde Superunda, Av. Grau.

**NO confirmado:** Av. Arequipa, Campo de Marte, Av. Brasil→Nazca→JNE (ruta 13-jun).

### concentration_points

| nombre | lat_approx | lng_approx | riesgo |
|--------|------------|------------|--------|
| Local JP Paseo Colón (salida/retorno) | -12.0460 | -77.0350 | **alto** — epicentro real |
| Plaza Bolognesi | -12.0617 | -77.0379 | **medio** |
| Av. Alfonso Ugarte (tramo marcha) | -12.0550 | -77.0400 | **medio** |
| Plaza San Martín (cordonada) | -12.0532 | -77.0345 | **alto** — choque potencial; bloqueada |
| Abancay × Piérola | -12.0512 | -77.0290 | **medio** — embotellamiento |
| Centro Cívico (pre-marcha ~15:53) | -12.0580 | -77.0360 | **medio** — LR EN VIVO |

### Magnitud (multi-fuente)

| Fuente | Estimación | Notas |
|--------|------------|-------|
| LR EN VIVO 19:01 | **Cientos** | Cobertura minuto a minuto |
| Infobae 19-jun | **Cientos** | Reuters/Angela Ponce foto |
| RPP 19-jun | Sin cifra; video multitud local Paseo Colón | neutral |
| El Búho 19-jun | Delegaciones Sur/Oriente llegaron; marcha "cerca Centro Cívico" | regional |
| JP convocatoria 16-jun | 3.000–15.000 proyectado | organizador — **no alcanzado** |
| PNP | +7.000 desplegados (contexto, no conteo) | autoridad |

```json
{
  "participantes_rango": [200, 800],
  "participantes_est_central": 450,
  "magnitud_codigo": "S",
  "magnitud_confianza": "media-alta",
  "magnitud_fuentes": ["LR EN VIVO", "Infobae", "RPP", "El Búho", "Reuters"],
  "senal_medios": {"articulos_48h": 15, "tv_en_vivo": true},
  "probabilidad_realizacion": 1.0
}
```

**Índice compuesto OSINT v3.9:** A=35% (foto/video geolocalizado ✅) · B=25% (≥4 medios ✅) · C=20% (#MarchaEnDefensaDeLaDemocracia) · D=20% (JP histórico 13-jun mayor)

### Fuentes (≥3 independientes — ejecutado)

1. [RPP — Sánchez sale de Paseo Colón](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850)
2. [Infobae EN VIVO — ruta Garcilaso, cordón Plaza San Martín](https://www.infobae.com/peru/2026/06/19/marcha-justicia-electoral-en-vivo-hoy-19-de-junio-cierres-desvios-y-a-que-hora-sera-la-movilizacion-convocada-por-roberto-sanchez-y-juntos-por-el-peru/)
3. [La República — balance pacífico, cientos](https://larepublica.pe/politica/2026/06/19/marcha-por-el-voto-en-lima-sanchez-lidero-movilizacion-marcada-por-presencia-policial-hnews-652517)
4. [El Búho — Alfonso Ugarte → Piérola → Wilson → retorno Paseo Colón](https://elbuho.pe/2026/06/mas-de-7-mil-policias-restriccion-vehicular-amenazas-del-alcalde-de-lima-para-marcha-de-jp-en-defensa-del-voto/)
5. [LR EN VIVO minuto a minuto](https://larepublica.pe/politica/2026/06/19/marchas-en-lima-en-vivo-simpatizantes-de-juntos-por-el-peru-protestan-por-resultados-de-la-segunda-vuelta-entre-roberto-sanchez-y-keiko-fujimori-hnews-526014)

### P(reactivación) bloqueos

- Nueva marcha JP Centro→JNE si MML levanta cierre 22-jun: **0,25**
- Autoconvocatoria 22-jun Plaza San Martín: **0,40**

### Hilos sueltos

- ¿Contingente regional dentro de "cientos"? — delegaciones Cusco/Puno/Loreto confirmadas en tránsito, magnitud no separada
- Presencia grupo "La Resistencia" (El Búho) — infiltración no cuantificada
- Resolución Mininter "sin garantías" — efecto disuasorio futuro

---

## 3. Campo de Marte, Jesús María (convocado 19-jun — verificación uso)

### Status 19-jun: **INACTIVO** como punto de concentración

| Veredicto | Evidencia |
|-----------|-----------|
| Convocado oficialmente | JP comunicado 16-jun, 16:00 ([Expreso](https://www.expreso.com.pe/politica/juntos-por-el-peru-no-garantiza-aceptar-resultado-electoral-y-llama-a-marcha-en-lima-comunicado-completo-roberto-sanchez-keiko-fujimori-conteo-onpe-noticia/1294804/)) |
| **NO usado 19-jun** | Infobae 23:37: "recorrido difiere del trazado original, que fijaba Campo de Marte como punto de encuentro final" |
| Sánchez no concentró allí | RPP: salió de Paseo Colón |
| PNP en Plaza San Martín/JNE | LR EN VIVO 15:40 — desvío operativo |

### Ruta convocada (NO ejecutada)

```
CONVOGADA (NO REALIZADA 19-jun):
  Campo de Marte, Jesús María (-12.0700, -77.0480)
    → Av. Arequipa
    → Av. Garcilaso de la Vega / Inca Garcilaso
    → Av. Nicolás de Piérola
    → JNE (Jr. Nazca / Av. Nazca 584)
Fuente ruta probable: precedente 13-jun [RPP](https://rpp.pe/politica/elecciones/marcha-en-lima-simpatizantes-de-juntos-por-el-peru-y-colectivos-sociales-exigen-respeto-a-la-voluntad-popular-y-transparencia-electoral-noticia-1692948)
```

### concentration_points

| nombre | lat_approx | lng_approx | riesgo |
|--------|------------|------------|--------|
| Campo de Marte (césped central) | -12.0700 | -77.0480 | **medio** — histórico RP/López Aliaga; vacío 19-jun |
| Av. Arequipa (ramal hacia Centro) | -12.0750 | -77.0420 | **bajo** 19-jun |
| Entorno JNE (alternativa si hubieran marchado) | -12.0689 | -77.0451 | **alto** — PNP 19-jun |

### Magnitud 19-jun

```json
{
  "participantes_rango": [0, 50],
  "participantes_est_central": 15,
  "magnitud_codigo": "XS",
  "magnitud_confianza": "baja",
  "nota": "Sin cobertura directa del espacio; inferido por ausencia en todas las crónicas de ruta"
}
```

### Fuentes (≥3 — verificación NO uso)

1. [Infobae — marcha no alcanzó Campo de Marte](https://www.infobae.com/peru/2026/06/19/marcha-justicia-electoral-en-vivo-hoy-19-de-junio-cierres-desvios-y-a-que-hora-sera-la-movilizacion-convocada-por-roberto-sanchez-y-juntos-por-el-peru/) (23:37 PET)
2. [RPP — salida Paseo Colón, no Campo de Marte](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850)
3. [El Búho — prensa aún citaba Campo de Marte 16:00, hecho real fue Centro Cívico/Paseo Colón](https://elbuho.pe/2026/06/mas-de-7-mil-policias-restriccion-vehicular-amenazas-del-alcalde-de-lima-para-marcha-de-jp-en-defensa-del-voto/)
4. `research/regional/lima_jun19.md` §2

### P(reactivación)

- Uso futuro Campo de Marte como concentración JP: **0,15** (patrón 19-jun = desvío a Paseo Colón)
- Colisión bandos Campo de Marte ↔ JNE: **0,15**

### Hilos sueltos

- ¿Hubo grupos aislados esperando en Campo de Marte? — **sin evidencia fotográfica**
- Cordon PNP específico en Campo de Marte — no documentado; probable cierre preventivo

---

## 4. Puente Internacional Ilave, Puno (El Collao)

### Status 19-jun: **INACTIVO** (bloqueo no verificado)

| Campo | Detalle |
|-------|---------|
| Convocatoria | 11-jun 00:00 — cierre indefinido + huelga ([Infobae](https://www.infobae.com/peru/2026/06/11/convocan-cierre-del-puente-de-ilave-y-marcha-a-lima-ante-resultados-parciales-de-la-segunda-vuelta/)) |
| Convocante | Lucio Ccallo Ccallata (CNUL / Fenatep) |
| Verificación 16–19-jun | **Sin confirmación SUTRAN/PNP/Radio Onda Azul** |
| Evidencia indirecta 19-jun | Delegaciones puneñas en marcha Lima ([El Búho](https://elbuho.pe/2026/06/mas-de-7-mil-policias-restriccion-vehicular-amenazas-del-alcalde-de-lima-para-marcha-de-jp-en-defensa-del-voto/)) → corredor aparentemente transitable |
| Raúl Samillán 19-jun | Rechazo Fujimori; **no menciona bloqueo activo** ([Evidencia.pe](https://evidencia.pe/raul-samillan-keiko-fujimori-posiblemente-este-gobernando-y-dios-nos-salve/)) |

### Ruta convocada (no ejecutada como bloqueo)

```
ESTÁTICA (convocada):
  Puente Internacional Ilave (-16.0875, -69.6440)
    ↔ Frontera Perú–Bolivia (Desaguadero-Ilave corridor)
  
MARCHA ASOCIADA (no materializada):
  Ilave → Juliaca → Puno ciudad → Carretera Interoceánica Sur
    → Arequipa → Nasca → Ica → Lima (1.300 km)
  Destino Lima: sin punto exacto confirmado
```

### concentration_points

| nombre | lat_approx | lng_approx | riesgo |
|--------|------------|------------|--------|
| Puente Internacional Ilave | -16.0875 | -69.6440 | **alto** — eje Bolivia–Puno; convocatoria vigente sin ejecutar |
| Desaguadero (cascada secundaria) | -16.7000 | -69.0833 | **medio** — P(reactivación) 0,25 |
| Peaje/control acceso Puno–Lima | -16.5000 | -70.5000 | **medio** — delegaciones pasaron |

### Magnitud

```json
{
  "participantes_rango": [0, 0],
  "magnitud_codigo": "XS",
  "magnitud_confianza": "media",
  "nota_bloqueo": "Convocado desde 12-jun; estado activo NO verificado 16-19 jun",
  "antecedente": "SUTEP El Collao bloqueó parcialmente 28-may (paro magisterial 48h) — evento distinto"
}
```

### Fuentes (≥3)

1. [Infobae — convocatoria cierre 11-jun](https://www.infobae.com/peru/2026/06/11/convocan-cierre-del-puente-de-ilave-y-marcha-a-lima-ante-resultados-parciales-de-la-segunda-vuelta/)
2. [Evidencia.pe — bloqueo magisterial mayo (antecedente)](https://evidencia.pe/docentes-bloquean-puente-internacional-de-ilave-durante-paro-regional-de-48-horas/)
3. [Infobae — FP no apela Puno, contexto tensión](https://www.infobae.com/peru/2026/06/14/fuerza-popular-anuncia-que-no-apelara-la-decision-del-jne-sobre-solicitud-de-anulacion-de-actas-en-puno/)
4. `research/regional/sur_jun19.md` §1.1
5. `data/events.json` — round 2: NO verificado activo 16-jun

### P(reactivación) bloqueo: **0,40**

| Disparador | Prob. condicionada |
|------------|-------------------|
| Proclamación JNE / percepción fraude | 0,55 |
| Sin catalizador (status quo 20-23 jun) | 0,25 |
| Cascada Desaguadero/Juli | 0,25 |

### Hilos sueltos

- **GAP crítico:** Cero reportaje Ilave 17–19-jun — requiere verificación terreno / prefectura Puno
- Paradero Lucio Ccallo — desconocido
- FP no apela Puno (14-jun) — reduce litigio pero no elimina presión callejera

---

## 5. GORE Junín / Corredor Pariahuanca–Huancayo

### Status 19-jun: **EJECUTADO** → **desescalado** (acta 19:49 PET)

| Fase | Fecha | Evento |
|------|-------|--------|
| Convocatoria marcha ~10.000 | 15-jun / prevista 19-jun 08:00 | Parque Grau (Pariahuanca) → Huancayo |
| Protesta estacionaria GORE | 18-jun | Cientos bloquean accesos; gases lacrimógenos ~17:00 |
| Acuerdo | 19-jun 19:49 | Acta compromisos — ordenanza cuencas |

### Ruta convocada vs. real

```
CONVOGADA (NO MATERIALIZADA como marcha masiva):
  Parque Grau, Pariahuanca (~-12.183, -75.517)
    → Carretera Pariahuanca–Huancayo (PE-3S / vía interandina)
    → Ingreso Huancayo norte
    → Gobierno Regional Junín
  Distancia: ~45 km · Organizador: ~10.000 [El Búho 15-jun]

REAL (18-19 jun):
  Llegada directa contingente Pariahuanca a Huancayo (sin corte de vía verificado)
    → Sede GORE Junín — Jirón Loreto / Plaza Huamanmarca
    → BLOQUEO ESTACIONARIO accesos edificio (~30 h)
  Coordenadas GORE Huancayo: -12.0680, -75.2100 (centro)
```

### Polilínea corredor (referencia logística)

```
Pariahuanca (distrito) 
  → [-12.183, -75.517]
  → vía a Huancayo (no bloqueada 19-jun)
  → Plaza Constitución Huancayo [-12.0681, -75.2103]
  → Jirón Loreto / GORE [-12.0680, -75.2100]
```

### concentration_points

| nombre | lat_approx | lng_approx | riesgo |
|--------|------------|------------|--------|
| Sede GORE Junín (Jirón Loreto) | -12.0680 | -75.2100 | **alto** — epicentro 18-19 jun |
| Plaza Huamanmarca | -12.0675 | -75.2095 | **alto** |
| Parque Grau, Pariahuanca (origen convocado) | -12.1830 | -75.5170 | **medio** — base comunidades |
| Carretera Central km 90-180 | -11.7000 | -76.1500 | **medio** — bloqueo latente NO activado |

### Magnitud (multi-fuente)

| Fuente | Estimación |
|--------|------------|
| El Búho 15-jun (convocatoria) | ~10.000 |
| RPP 18-jun | Cientos frente GORE |
| HYTimes 19-jun | Cientos; comunidades San Balvín, Antarpa, Rosario |
| HYTimes 19:49 | Acta firmada tras ~30 h protesta |

```json
{
  "participantes_rango": [200, 600],
  "participantes_est_central": 350,
  "magnitud_codigo": "S",
  "magnitud_confianza": "media-alta",
  "magnitud_fuentes": ["RPP 18-jun", "HYTimes 18-19 jun", "El Búho"],
  "marcha_10k_materializada": false,
  "probabilidad_realizacion": 1.0,
  "estado_post_acuerdo": "desescalado"
}
```

### Fuentes (≥3 — ejecutado)

1. [RPP — gases lacrimógenos GORE 18-jun](https://rpp.pe/peru/actualidad/junin-policias-dispersan-pobladores-que-intentaban-ingresar-al-gobierno-regional-para-exigir-proteccion-de-cuencas-noticia-1693682)
2. [HYTimes — acta compromisos 19:49](https://hytimes.pe/2026/06/19/gobierno-regional-cede-y-emitira-ordenanza-para-proteger-el-huaytapallana-y-cabeceras-de-cuenca/)
3. [El Búho — represión y convocatoria 10k](https://elbuho.pe/2026/06/bombas-lacrimogenas-no-frenan-protesta-de-pariahuanca-frente-al-gobierno-regional-de-junin/)
4. [El Búho — convocatoria original Parque Grau](https://elbuho.pe/2026/06/junin-con-protesta-pariahuanca-exige-proteger-cuatro-cuencas-tras-mortandad-masiva-de-truchas/)
5. [HYTimes — Cárdenas aplaza reunión 25-jun](https://hytimes.pe/2026/06/19/zosimo-cardenas-aplaza-encuentro-personal-con-pobladores-de-pariahuanca-hasta-el-25-de-junio/)

### P(reactivación) bloqueo: **0,45**

| Escenario | Prob. |
|-----------|-------|
| Incumplimiento ordenanza cuencas (20-23 jun) | 0,55 |
| Reunión Zósimo Cárdenas 25-jun fallida | 0,70 |
| Escalada ambiental → Carretera Central km 90-180 | 0,45 |
| Post-acuerdo 19-jun (status quo) | 0,20 |

### Hilos sueltos

- Reunión presencial Cárdenas ↔ Pariahuanca **25-jun** — fecha crítica
- Eliminación REINFO/concesiones — quedó en gestiones futuras, no en acta inmediata
- 3 mujeres heridas 18-jun — seguimiento médico/legal

---

## 6. Piura–Sechura / El Trébol — Movilización 23-jun

### Status 19-jun: **INCIERTO** (convocatoria futura confirmada, no ejecutada)

| Campo | Valor |
|-------|-------|
| Fecha convocada | **23-jun ~08:00 PET** |
| Convocantes | Conveagro / Asoc. Productores Agrarios Piura |
| Demandas | DU 005-2026; precio arroz; posible escalada a paro |
| Paro activo 19-jun | **NO** — tregua precaria desde levantamiento mayo |
| Último bloqueo El Trébol | 26-may (Conveagro; ~3.000, violento) |

### Ruta proyectada (23-jun)

```
ESCENARIO BASE — Movilización (sin bloqueo):
  Puntos de concentración:
    - Sechura plaza principal (-5.5564, -80.8204)
    - Medio/Bajo Piura (valle)
    - Posible Piura ciudad — Plazuela Merino (-5.1955, -80.6320)
  Ruta probable:
    Sechura / Bajo Piura
      → Carretera Piura–Sechura
      → Piura ciudad
      → [OPCIONAL] Panamericana Norte
      → Óvalo El Trébol km 1058 (-4.9117, -80.6788) — Sullana

ESCENARIO ESCALADA — Bloqueo (P=0,65 post-movilización):
  Óvalo El Trébol km 1058
    → Bloqueo total Panamericana Norte (eje Piura–Sullana–Lambayeque)
  Corredores secundarios en riesgo:
    - Catacaos–Piura km 8-15
    - Carretera Piura–Tambogrande
```

### concentration_points

| nombre | lat_approx | lng_approx | riesgo |
|--------|------------|------------|--------|
| Óvalo El Trébol (km 1058 Panamericana Norte) | -4.9117 | -80.6788 | **muy alto** — precedente bloqueo violento mayo |
| Sechura (capital provincial) | -5.5564 | -80.8204 | **alto** — convocatoria explícita |
| Piura ciudad / GORE Piura | -5.1945 | -80.6328 | **medio-alto** |
| Catacaos acceso | -5.2667 | -80.6789 | **medio** — histórico bloqueo mayo |

### Magnitud proyectada (multi-fuente)

| Fuente | Estimación |
|--------|------------|
| Norte Sostenible 11-jun | Movilización confirmada; evalúan nuevo paro |
| Walac Noticias Piura 11-jun | Agricultores Sechura confirman |
| Infobae 26-may (antecedente El Trébol) | ~3.000 en bloqueo |
| events.json NORTE-PARO-023 | Regional; sin cifra 23-jun |

```json
{
  "participantes_rango": [500, 5000],
  "participantes_est_central": 2000,
  "magnitud_codigo": "M",
  "magnitud_confianza": "baja",
  "nota": "Evento futuro; rango basado en precedente mayo-2026 y convocatoria regional",
  "probabilidad_realizacion_movilizacion": 0.85,
  "probabilidad_escalada_bloqueo_trebol": 0.65
}
```

### Fuentes (≥3 — convocatoria)

1. [Norte Sostenible — movilización 23-jun](https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/)
2. [Walac Noticias Piura](https://walac.pe/seccion/actualidad/) (11-jun)
3. [Infobae — paro agrario El Trébol mayo](https://www.infobae.com/peru/2026/05/26/fotos-y-videos-del-paro-agrario-en-peru-vias-bloqueadas-pasajeros-barados-protestas-y-pedidos-de-los-gremios-en-el-norte-del-pais/)
4. [El País — rebelión del agro / DU 005-2026](https://elpais.com/america/2026/06/04/la-rebelion-del-agro-el-campo-lanza-una-advertencia-a-quien-gane-la-segunda-vuelta-en-peru.html)
5. `research/regional/norte_centro_oriente_jun19.md` §NORTE

### P(reactivación) bloqueo El Trébol: **0,65**

| Factor | Efecto |
|--------|--------|
| Incumplimiento DU 005-2026 | ↑↑ |
| Proclamación Fujimori mediados jul | ↑ |
| Sin reconfirmación 17–19 jun | incertidumbre mantenida |
| Precedente violento mayo | ↑ |

### Hilos sueltos

- **Sin reconfirmación pública 17–19 jun** — monitorear 22-jun AM
- Ruta exacta y puntos de concentración hora 08:00 — no publicados
- Coordinación con paro arrocero Ucayali/San Martín (tregua vencida) — posible sincronización

---

## Matriz comparativa de rutas

| Ubicación | Tipo ruta 19-jun | Longitud est. | Corredor estratégico afectado |
|-----------|------------------|---------------|-------------------------------|
| JNE acampamento | Estática | 0 km | Local Jesús María |
| Centro Histórico marcha | Loop urbano | ~3-5 km | Centro Histórico (cierre MML 19-22) |
| Campo de Marte | No ejecutada | 0 km | — |
| Ilave | No ejecutada | 0 km | Eje Bolivia–Puno (libre) |
| GORE Junín | Estacionaria | 0 km (convocado 45 km) | Local Huancayo |
| El Trébol (23-jun) | Por confirmar | TBD | **Panamericana Norte** (crítico) |

---

## Síntesis de magnitudes — multi-source reconciliation

| Ubicación | Organizador | Medios | Rango final | Código | Confianza |
|-----------|-------------|--------|-------------|--------|-----------|
| JNE acampamento | "convocatoria nacional" | ~80 carpas | 80–200 | S | media |
| Marcha Centro | 3.000–15.000 | cientos (×4 medios) | 200–800 | S | media-alta |
| Campo de Marte | 3.000–15.000 | ausente | 0–50 | XS | baja |
| Ilave | cierre indefinido | no verificado | 0 | XS | media |
| GORE Pariahuanca | ~10.000 | cientos | 200–600 | S | media-alta |
| Piura 23-jun | TBD | precedente 3.000 | 500–5.000 | M* | baja |

*\*Proyectado — evento futuro*

---

## Plan de monitoreo 20–23 jun

| Prioridad | Ubicación | Trigger | Acción |
|-----------|-----------|---------|--------|
| **P1** | El Trébol / Piura 23-jun | Reconfirmación Conveagro 22-jun | Walac, Norte Sostenible, SUTRAN |
| **P2** | Ilave | Cualquier reporte Radio Onda Azul / Evidencia.pe | Verificación terreno |
| **P3** | GORE Junín | Incumplimiento acta / reunión 25-jun | HYTimes, RPP Junín |
| **P4** | JNE acampamento | Reconteo carpas post-19-jun | RPP TV, LR |
| **P5** | Lima | Levantamiento cierre MML 22-jun | Nueva marcha P=0,25 |

---

## Fuentes maestras

| Documento | Ruta |
|-----------|------|
| Lima metro | `research/regional/lima_jun19.md` |
| Sur | `research/regional/sur_jun19.md` |
| Norte/Centro/Oriente | `research/regional/norte_centro_oriente_jun19.md` |
| Metodología magnitud | `research/methodology/magnitude_estimation.md` |
| Coordenadas | `js/gazetteer.js` |
| Eventos baseline | `data/events.json` v3.8.1 |

---

*Generado: 2026-06-19 ~21:00 PET · Próximo corte recomendado: 2026-06-22 AM (pre-Piura 23-jun) · Anti-alucinación: inciertos etiquetados; Campo de Marte e Ilave como NO verificados activos salvo evidencia en contrario*