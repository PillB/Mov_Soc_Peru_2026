# Regression tests — Dossier OSINT

Catches the bug classes that broke v3.5:

1. **Empty region meta** — renderer reading English keys against Spanish data
2. **Literal "N/D" leaking into DOM** — data placeholders rendered as content
3. **Raw `[label](url)` markdown** — links not parsed into `<a>` elements
4. **Empty `grass-card` / `live-card`** — cards with only a `—` name
5. **Risk matrix dashes** — wrong column mapping vs data shape
6. **Data-shape contract** — every region must keep `eventos`, `actores`, `puntos_riesgo`

## How to run

```bash
cd /home/user/workspace/dossier_osint
node tests/run_tests.js
```

Tests run against `dossier_osint_v3.2.html` (standalone build) using headless Playwright + a static `file://` load. They are zero-network and fast (~5 s).

Always run before `git push`. CI can wire this as a pre-deploy gate.
