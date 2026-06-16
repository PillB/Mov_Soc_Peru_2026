#!/usr/bin/env python3
"""Build offline standalone HTML with embedded JSON, CSS and JS."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "dossier_osint_v3.2.html"


def read_text(path):
    return path.read_text(encoding="utf-8")


def js_literal(obj):
    return json.dumps(obj, ensure_ascii=False)


def main():
    index = read_text(ROOT / "index.html")
    css = read_text(ROOT / "css" / "styles.css")
    leaflet_css = read_text(ROOT / "vendor" / "leaflet.min.css")
    leaflet_js = read_text(ROOT / "vendor" / "leaflet.min.js")
    gazetteer = read_text(ROOT / "js" / "gazetteer.js")
    main_js = read_text(ROOT / "js" / "main.js")
    ui_enh = read_text(ROOT / "js" / "ui-enhancements.js") if (ROOT / "js" / "ui-enhancements.js").exists() else ""
    events = json.loads(read_text(ROOT / "data" / "events.json"))
    mc_path = ROOT / "data" / "montecarlo.json"
    montecarlo = json.loads(read_text(mc_path)) if mc_path.exists() else {}

    # Patch main.js load to prefer embedded data
    main_js = main_js.replace(
        "  Promise.all([\n    fetch('data/events.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('No se pudo cargar events.json (HTTP ' + r.status + ')'); return r.json(); }),\n    fetch('data/montecarlo.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).catch(() => null)\n  ])",
        "  const loadEvents = window.__EMBEDDED_EVENTS__\n    ? Promise.resolve(window.__EMBEDDED_EVENTS__)\n    : fetch('data/events.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('No se pudo cargar events.json (HTTP ' + r.status + ')'); return r.json(); });\n  const loadMc = window.__EMBEDDED_MC__\n    ? Promise.resolve(window.__EMBEDDED_MC__)\n    : fetch('data/montecarlo.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).catch(() => null);\n  Promise.all([loadEvents, loadMc])",
    )

    embed_script = (
        "<script>\n"
        f"window.__EMBEDDED_EVENTS__ = {js_literal(events)};\n"
        f"window.__EMBEDDED_MC__ = {js_literal(montecarlo)};\n"
        "</script>\n"
    )

    # Remove external font links for offline
    index = re.sub(r"\s*<link[^>]*fonts\.googleapis\.com[^>]*>\n?", "", index)
    index = re.sub(r"\s*<link[^>]*fonts\.gstatic\.com[^>]*>\n?", "", index)
    index = re.sub(r'\s*<link rel="stylesheet" href="css/styles\.css" />\n?', "", index)
    index = re.sub(r'\s*<link rel="stylesheet" href="vendor/leaflet\.min\.css" />\n?', "", index)
    index = re.sub(
        r"</head>",
        f"<style>\n{leaflet_css}\n{css}\n</style>\n{embed_script}</head>",
        index,
        count=1,
    )

    # Remove external script tags at bottom
    index = re.sub(r'\s*<script src="vendor/leaflet\.min\.js"></script>\n?', "", index)
    index = re.sub(r'\s*<script src="js/gazetteer\.js"></script>\n?', "", index)
    index = re.sub(r'\s*<script src="js/main\.js"></script>\n?', "", index)
    index = re.sub(r'\s*<script src="js/ui-enhancements\.js"></script>\n?', "", index)

    scripts = f"<script>\n{leaflet_js}\n</script>\n<script>\n{gazetteer}\n</script>\n"
    if ui_enh:
        scripts += f"<script>\n{ui_enh}\n</script>\n"
    scripts += f"<script>\n{main_js}\n</script>\n"

    index = index.replace("</body>", scripts + "</body>")
    index = index.replace(
        "<title>Dossier OSINT — Manifestaciones Perú · v3.6 BLUF + ML forecast</title>",
        "<title>[Standalone] Dossier OSINT — Manifestaciones Perú · v3.8 BLUF + ML forecast</title>",
    )

    OUT.write_text(index, encoding="utf-8")
    print(f"Built {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()