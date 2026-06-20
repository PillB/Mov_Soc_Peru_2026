#!/usr/bin/env python3
"""v3.10.1 — Backlog: JNE pleno monitor + FP grassroots amplifiers + Karamba P2 refresh (sin montecarlo)."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from update_v3910 import (  # noqa: E402
    CANONICAL_HANDLES,
    dedup_cuentas,
    dedup_grassroots_accounts,
)

EVENTS_PATH = ROOT / "data" / "events.json"
CORTE = "2026-06-24T12:00:00-05:00"

JNE_RPP = (
    "https://rpp.pe/politica/elecciones/jne-declaro-infundadas-las-apelaciones-de-juntos-por-el-peru-"
    "que-solicitaban-nulidad-masiva-de-mesas-de-votacion-lima-y-america-noticia-1693871"
)
KARAMBA_REFRESH = "research/disinfo/karamba_refresh_jun24.md"

CANONICAL_HANDLES.update({
    "@jovenesfp": "Jóvenes Fuerza Popular",
    "@JovenesFP_": "Jóvenes Fuerza Popular",
    "@DefensoresDelPeru": "Defensores del Perú",
})

NEW_ACCOUNTS_FP_R6 = [
    {
        "nombre": "Jóvenes Fuerza Popular",
        "plataforma": "Instagram",
        "handle": "@jovenesfp",
        "url": "https://www.instagram.com/jovenesfp/",
        "descripcion": (
            "Organización juvenil FP. Reel colaborativo con @fuerzapopular_ sobre campaña "
            "Defensores del Perú (1-jun-2026). Amplifica reclutamiento de personeros y narrativa pro-Keiko."
        ),
        "posicion": "pro_fp",
        "bando": "pro_fp",
        "region": "nacional",
        "contenido_tipico": "Reels campaña Defensores del Perú; movilización juvenil FP",
        "growth_72h": "no cuantificado",
        "fuente_url": "https://www.instagram.com/reel/DZDGSDFRwwl/",
        "mobilization_role": "amplificador",
        "engagement_tier": "medio",
        "validacion_ronda": 6,
        "nombre_canónico": "Jóvenes Fuerza Popular",
    },
    {
        "nombre": "Jóvenes Fuerza Popular",
        "plataforma": "X",
        "handle": "@JovenesFP_",
        "url": "https://x.com/JovenesFP_",
        "descripcion": "Cuenta X de la organización juvenil FP. Par de @jovenesfp (IG).",
        "posicion": "pro_fp",
        "bando": "pro_fp",
        "region": "nacional",
        "contenido_tipico": "Difusión juvenil FP; personeros; defensa de actas",
        "growth_72h": "no cuantificado",
        "fuente_url": "https://x.com/JovenesFP_/status/2060425991890116740",
        "mobilization_role": "amplificador",
        "engagement_tier": "medio",
        "validacion_ronda": 6,
        "nombre_canónico": "Jóvenes Fuerza Popular",
    },
    {
        "nombre": "Jóvenes Fuerza Popular",
        "plataforma": "Facebook",
        "handle": "facebook.com/JovenesFuerzaPopular",
        "url": "https://www.facebook.com/JovenesFuerzaPopular",
        "descripcion": "Página FB de la organización juvenil FP («Jóvenes Fuerza Popular Keiko»).",
        "posicion": "pro_fp",
        "bando": "pro_fp",
        "region": "nacional",
        "contenido_tipico": "Movilización juvenil FP; campañas personeros",
        "growth_72h": "no cuantificado",
        "fuente_url": "https://www.facebook.com/JovenesFuerzaPopular",
        "mobilization_role": "amplificador",
        "engagement_tier": "medio",
        "validacion_ronda": 6,
        "nombre_canónico": "Jóvenes Fuerza Popular",
    },
    {
        "nombre": "Defensores del Perú",
        "plataforma": "X",
        "handle": "@DefensoresDelPeru",
        "url": "https://x.com/DefensoresDelPeru",
        "descripcion": (
            "Red voluntaria FP — meta 100.000 personeros. Programa documentado Infobae/RPP; "
            "handle verificado HTTP 200."
        ),
        "posicion": "pro_fp",
        "bando": "pro_fp",
        "region": "nacional",
        "contenido_tipico": "Reclutamiento personeros; defensa de actas post-7-jun",
        "growth_72h": "no cuantificado",
        "fuente_url": (
            "https://www.infobae.com/peru/2026/05/19/elecciones-2026-fuerza-popular-inicia-el-registro-de-"
            "100-mil-personeros-voluntarios-para-la-segunda-vuelta/"
        ),
        "mobilization_role": "amplificador",
        "engagement_tier": "medio",
        "validacion_ronda": 6,
        "notas_r6": "Evidencia indirecta: programa documentado; handle coincide con campaña",
        "nombre_canónico": "Defensores del Perú",
    },
]

NEW_GRASSROOTS_FP_R6 = [
    {
        "name": "Jóvenes Fuerza Popular (IG)",
        "handle": "@jovenesfp",
        "role": "amplificador",
        "platform": "Instagram",
        "url": "https://www.instagram.com/jovenesfp/",
        "notes": "Reel Defensores del Perú 1-jun-2026 co-autor @fuerzapopular_.",
        "verification": "fp_grassroots_jun24",
    },
    {
        "name": "Jóvenes Fuerza Popular (X)",
        "handle": "@JovenesFP_",
        "role": "amplificador",
        "platform": "X",
        "url": "https://x.com/JovenesFP_",
        "notes": "Par X de organización juvenil FP.",
        "verification": "fp_grassroots_jun24",
    },
    {
        "name": "Jóvenes Fuerza Popular (FB)",
        "handle": "facebook.com/JovenesFuerzaPopular",
        "role": "amplificador",
        "platform": "Facebook",
        "url": "https://www.facebook.com/JovenesFuerzaPopular",
        "notes": "Página juvenil FP verificada.",
        "verification": "fp_grassroots_jun24",
    },
    {
        "name": "Defensores del Perú",
        "handle": "@DefensoresDelPeru",
        "role": "amplificador",
        "platform": "X",
        "url": "https://x.com/DefensoresDelPeru",
        "notes": "Programa 100k personeros; evidencia indirecta handle.",
        "verification": "fp_grassroots_jun24",
    },
]

KARAMBA_YT_STATUS = {
    "@EnfocatePeruYT": {"estado_yt": "eliminado", "verificado": "2026-06-19"},
    "@RadarPeruanoYT": {"estado_yt": "eliminado", "verificado": "2026-06-19"},
    "@SanchochauYT": {"estado_yt": "eliminado", "verificado": "2026-06-19"},
    "@CheverePeYT": {
        "estado_yt": "shell_vacio",
        "verificado": "2026-06-19",
        "channel_id": "UCKwK_8nXcUzBTLr537MtgzA",
    },
    "@SoyIndependienteYT": {
        "estado_yt": "colision_handle",
        "verificado": "2026-06-19",
        "nota_yt": "URL resuelve canal español 2008, no fantasma Karamba",
    },
    "@ElMachetePeruYT": {
        "estado_yt": "residual_dormant",
        "verificado": "2026-06-19",
        "ultimo_upload": "2026-05-14",
    },
}


def patch_jne_nulidad(data):
    er = data.setdefault("escrutinio_realtime", {})
    jne = er.setdefault("jne_nulidad_2408", {})
    jne.update({
        "resolucion_19jun": "sentido_voto_infundadas_escrita_pendiente",
        "estado_19jun": "sentido_voto_emitido",
        "resolucion_publicada": False,
        "pleno_resolucion_24jun": "no_publicada",
        "nota_24jun": (
            "Sentido del voto 19-jun: apelaciones JP Lima+EE.UU. infundadas (RPP/Infobae/LR). "
            "Resolución escrita sin publicar en portal al 24-jun 12:00."
        ),
        "sentido_voto_19jun": {
            "lima_1751": "infundada",
            "eeuu_647": "infundada",
            "otras_actas_observadas_27": "infundadas",
            "europa_1": "fundada_en_parte",
            "expedientes_totales": 32,
            "fecha_audiencia": "2026-06-19",
            "fuente_primaria_medios": JNE_RPP,
        },
        "fuente_monitor": "research/validation/jne_pleno_monitor_jun24.md",
    })


def patch_karamba(data):
    dives = data.setdefault("entity_deep_dives", {})
    for ent in dives.get("entidades", []):
        if ent.get("id") == "ENT-KARAMBA":
            ent["nota"] = (
                "Verificado 19-jun: 3 canales 404 (@EnfocatePeru, @RadarPeruano, @Sancochau); "
                "@CheverePe shell vacío (0 videos RSS); @SoyIndependiente = colisión handle; "
                "@ElMachetePeru residual sin pauta post-5-jun. Operación dormant."
            )
            ent["verificado"] = "2026-06-19T12:00:00-05:00"
            ent["fuente_refresh"] = KARAMBA_REFRESH
            break

    for ew in data.get("early_warning_indicators", []):
        if ew.get("id") == "EW-17":
            ew["note"] = (
                "Karamba dormant 19-jun: 3/6 handles 404; 3 shells sin reactivación pauta. "
                "Réplicas WhatsApp/TikTok residuales (DIS-JUN19-02)."
            )
            ew["next_check"] = "2026-06-26T09:00:00-05:00"
            ew["trend"] = "→ estable"
            break

    cuentas = data.get("social_intelligence", {}).get("cuentas_emergentes", [])
    for acc in cuentas:
        h = acc.get("handle")
        if h in KARAMBA_YT_STATUS:
            acc.update(KARAMBA_YT_STATUS[h])


def patch_fp_accounts(data):
    si = data.setdefault("social_intelligence", {})
    cuentas = si.setdefault("cuentas_emergentes", [])
    handles = {c.get("handle") for c in cuentas}
    for entry in NEW_ACCOUNTS_FP_R6:
        if entry["handle"] not in handles:
            cuentas.append(entry)
            handles.add(entry["handle"])

    grass = data.setdefault("grassroots", {})
    nac = grass.setdefault("nacional", {})
    accs = nac.setdefault("accounts", [])
    ghandles = {a.get("handle") for a in accs}
    for entry in NEW_GRASSROOTS_FP_R6:
        if entry["handle"] not in ghandles:
            accs.append(entry)
            ghandles.add(entry["handle"])


def patch_meta(data):
    data["meta"]["version"] = "3.10.1"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.10.1 backlog: JNE pleno monitor (sentido voto 19-jun, escrita pendiente); "
        "4 FP grassroots amplifiers; Karamba P2 refresh; montecarlo omitido."
    )

    p7 = data.setdefault("prediccion_7dias", {})
    p7["nota_metodologica"] = (
        "v3.10.1 24-jun: JNE sentido voto 19-jun infundadas (escrita pendiente); "
        "FP grassroots @jovenesfp/@DefensoresDelPeru indexados; Karamba dormant verificado; "
        "ONPE meseta; montecarlo omitido."
    )

    dives = data.setdefault("entity_deep_dives", {})
    dives["corte"] = CORTE
    pend = dives.setdefault("pendientes_resueltos", [])
    for item in ("FP grassroots amplifiers R6", "JNE pleno monitor 24-jun", "Karamba P2 refresh"):
        if item not in pend:
            pend.append(item)
    dives["fuente_backlog_r6"] = [
        "research/validation/jne_pleno_monitor_jun24.md",
        "research/entities/fp_grassroots_amplifiers_jun24.md",
        KARAMBA_REFRESH,
    ]

    si = data.setdefault("social_intelligence", {})
    si["fecha_corte"] = CORTE
    si["contexto"] = (
        "24-jun R6 backlog: JNE sentido voto infundadas; FP grassroots 4 cuentas; "
        "Karamba dormant granular; montecarlo omitido."
    )


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    mc_before = json.dumps(data.get("montecarlo", {}), sort_keys=True)

    patch_jne_nulidad(data)
    patch_karamba(data)
    patch_fp_accounts(data)
    patch_meta(data)

    si = data["social_intelligence"]
    before_cu = len(si["cuentas_emergentes"])
    si["cuentas_emergentes"] = dedup_cuentas(si["cuentas_emergentes"])
    si["dedup_removed_r6"] = before_cu - len(si["cuentas_emergentes"])

    grass = data.setdefault("grassroots", {})
    nac = grass.setdefault("nacional", {})
    before_gr = len(nac.get("accounts", []))
    nac["accounts"] = dedup_grassroots_accounts(nac["accounts"])
    after_gr = len(nac["accounts"])
    grass.setdefault("meta", {})["version"] = "3.10.1"
    grass["meta"]["backlog_r6"] = (
        f"v3.10.1: +{after_gr - before_gr} FP grassroots; dedup cuentas r6 −{si.get('dedup_removed_r6', 0)}"
    )

    mc_after = json.dumps(data.get("montecarlo", {}), sort_keys=True)
    if mc_before != mc_after:
        raise SystemExit("montecarlo mutated — abort")

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    fp_count = sum(1 for c in si["cuentas_emergentes"] if c.get("validacion_ronda") == 6)
    print(
        f"v3.10.1 — jne_nulidad patched, FP accounts +{fp_count}, "
        f"grassroots nacional={after_gr}, montecarlo=unchanged"
    )


if __name__ == "__main__":
    main()