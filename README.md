# Dossier OSINT — Manifestaciones Perú · v3.1

Reporte OSINT de manifestaciones y movilizaciones sociales en Perú (ventana 9–19 jun 2026, post-2da vuelta).

## Contenido

- **Capa terreno**: 5 macroregiones (Lima, Norte, Centro, Sur, Oriente), zonas calientes, rutas, corredores económicos
- **Capa grassroots**: 89 cuentas individuales, 67 colectivos/frentes, 87 lives, 60 hashtags, 55 rutas, 17 comunicados
- **Inteligencia social**: 44 handles · 20 lives programados · 25 medios alternativos · 17 casos de desinformación · 99 fuentes verificadas
- Matriz de riesgo por escenario y región
- Sistema de alerta temprana

## Ver online

- **Web app interactiva** → [index.html](./index.html)
- **Versión descargable single-file (100% offline)** → [download.html](./download.html)

## Metodología

Pirámide invertida · OSINT verificado · Toda afirmación con fuente clickeable inline. Diseño accesible WCAG AA con tipografías del sistema (cero dependencias externas en la versión descargable).

## Estructura

```
index.html          → Sitio principal (carga data/events.json)
download.html       → Single-file HTML (CSS/JS/JSON inline, funciona offline)
css/styles.css      → Estilos (1500+ líneas)
js/main.js          → Renderizado (~1300 líneas)
data/events.json    → Dataset estructurado v3.1 (352 KB)
```
