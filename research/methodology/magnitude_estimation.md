# Metodología de estimación de magnitud — manifestaciones OSINT

**Corte:** 19-jun-2026 · Aplicable a convocatorias y eventos ejecutados

## Marco teórico (fuentes académicas / mejores prácticas)

1. **Crowd counting multi-fuente** (Stillwell & Estill, protest monitoring): combinar estimaciones independientes (medios, autoridades, organizadores, satélite/aéreo) y reportar rango [min, central, max] — nunca cifra única sin fuente.

2. **Social media as proxy (no sustituto)** — González-Bailón et al. (2014), *Science*: correlación débil entre volumen online y asistencia física; útil para **probabilidad de convocatoria** y **alcance narrativo**, no para conteo directo.

3. **Índice compuesto OSINT (propuesto v3.9):**

| Dimensión | Peso | Métricas |
|-----------|------|----------|
| **A. Confirmación terreno** | 35% | Foto/video geolocalizado, reporte SUTRAN/PNP, cobertura ≥2 medios independientes |
| **B. Prevalencia mediática** | 25% | # artículos 48h (nacional + regional), presencia TV en vivo |
| **C. Señal social** | 20% | Posts con hashtag (estimado), shares/RT de cuenta convocante, views lives |
| **D. Capacidad movilizadora** | 20% | Historial eventos previos, tamaño base (sindicato/colectivo), estado de bloqueo activo |

4. **Escala de magnitud estandarizada:**

| Código | Rango personas | Descriptor |
|--------|----------------|------------|
| XS | <100 | núcleo / plantón |
| S | 100–500 | concentración |
| M | 500–3.000 | marcha significativa |
| L | 3.000–10.000 | movilización masiva |
| XL | >10.000 | paro/marcha nacional (raro) |

5. **Probabilidad de realización (P):** Bayes informal — prior histórica del convocante × señal confirmación (0=no, 0.5=anuncio solo, 1=ejecutado) × factor institucional (decreto emergencia, restricción MML).

6. **Regla anti-alucinación:** Si solo organizador cifra y medios dicen "cientos/miles" sin número → usar rango S–M, marcar `magnitud_confianza: baja`.

## Campos JSON recomendados

```json
{
  "participantes_est": 800,
  "participantes_rango": [300, 1500],
  "magnitud_codigo": "S",
  "magnitud_confianza": "media",
  "magnitud_fuentes": ["RPP", "LR EN VIVO"],
  "probabilidad_realizacion": 1.0,
  "senal_social": {"hashtag_volumen_est": "medio", "live_views_est": null},
  "senal_medios": {"articulos_48h": 12, "tv_en_vivo": true}
}
```