#!/usr/bin/env python3
"""v3.9.1 — platform matrix for magnitude methodology + research consolidation."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

PLATFORMS = [
    {"id": "x", "nombre": "X / Twitter", "data_availability": "alto", "proxy_magnitud": 4,
     "metricas": ["likes", "reposts", "quotes", "views", "replies"],
     "rol": "Convocatoria y narrativa electoral; vector @RobertoSanchP",
     "fuente": "research/social/platforms_x_threads_bluesky_jun20.md"},
    {"id": "facebook", "nombre": "Facebook", "data_availability": "alto", "proxy_magnitud": 4,
     "metricas": ["live_views", "reactions", "shares"],
     "rol": "Confirmación AV terreno; lives RPP acampamento JNE",
     "fuente": "research/social/platforms_fb_ig_tiktok_jun20.md"},
    {"id": "youtube", "nombre": "YouTube", "data_availability": "alto", "proxy_magnitud": 4,
     "metricas": ["viewCount", "live_vod"],
     "rol": "Marcha 19-jun verificada; RPP principal",
     "fuente": "research/social/platforms_yt_reddit_4chan_jun20.md"},
    {"id": "instagram", "nombre": "Instagram", "data_availability": "medio", "proxy_magnitud": 3,
     "metricas": ["reel_likes", "stories"],
     "rol": "Amplificación mediática; validar geolocalización",
     "fuente": "research/social/platforms_fb_ig_tiktok_jun20.md"},
    {"id": "reddit", "nombre": "Reddit", "data_availability": "medio", "proxy_magnitud": 3,
     "metricas": ["upvotes", "comments"],
     "rol": "Clima electoral r/peru; poca logística protesta",
     "fuente": "research/social/platforms_yt_reddit_4chan_jun20.md"},
    {"id": "tiktok", "nombre": "TikTok", "data_availability": "bajo-medio", "proxy_magnitud": 2,
     "metricas": ["views", "shares"],
     "rol": "Vigilancia disinfo; no conteo físico",
     "fuente": "research/social/platforms_fb_ig_tiktok_jun20.md"},
    {"id": "threads", "nombre": "Threads", "data_availability": "bajo", "proxy_magnitud": 2,
     "metricas": ["likes", "reposts"],
     "rol": "Eco Meta; sin hashtags electorales Perú indexados",
     "fuente": "research/social/platforms_x_threads_bluesky_jun20.md"},
    {"id": "bluesky", "nombre": "Bluesky", "data_availability": "nulo-bajo", "proxy_magnitud": 1,
     "metricas": ["reposts", "replies"],
     "rol": "Base usuarios Perú insignificante",
     "fuente": "research/social/platforms_x_threads_bluesky_jun20.md"},
    {"id": "4chan", "nombre": "4chan", "data_availability": "muy_bajo", "proxy_magnitud": 1,
     "metricas": [],
     "rol": "Sin hilos Perú verificados 17-20 jun; no operativo",
     "fuente": "research/social/platforms_yt_reddit_4chan_jun20.md"},
]


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    data["meta"]["version"] = "3.9.1"
    data["meta"]["last_update"] = "2026-06-20T12:00:00-05:00"
    data["meta"]["last_refresh_summary"] = (
        "v3.9.1 — magnitude_methodology v1.1: matriz 9 plataformas (X/FB/YT tier-1 proxy 4); "
        "research platforms jun20 consolidado en magnitude_methodology.plataformas."
    )

    mm = data.setdefault("magnitude_methodology", {})
    mm["version"] = "1.1"
    mm["report_html"] = "methodology/magnitude_methodology.html"
    mm["corte"] = "2026-06-20T12:00:00-05:00"
    mm["plataformas"] = PLATFORMS
    mm["formula_social"] = "C = sum(w_p * score_p) / sum(w_p); w_p = proxy_magnitud 1-5"
    mm["tier_1"] = ["x", "facebook", "youtube"]
    mm["tier_2"] = ["instagram", "reddit", "tiktok"]
    mm["tier_3"] = ["threads", "bluesky", "4chan"]

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("v3.9.1 written")


if __name__ == "__main__":
    main()