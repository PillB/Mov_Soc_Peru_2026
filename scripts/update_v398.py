#!/usr/bin/env python3
"""v3.9.8 — RM-01–15 historico/vigente + grassroots nacional merge (sin montecarlo)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-23T20:00:00-05:00"

RPP_MARCHA = (
    "https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-"
    "marcha-convocada-por-juntos-por-el-peru-noticia-1693850"
)
MIDAGRI_PIURA = (
    "https://nortesostenible.com/midagri-aprueba-lineamientos-para-compra-de-arroz-pero-productores-de-"
    "piura-mantienen-protesta/"
)
CANALN_JEE = (
    "https://canaln.pe/actualidad/jne-improcedente-nulidad-juntos-peru-mesas-extranjero-n492715"
)

RM_HISTORICO = {
    "RM-01": "Toma 13-jun y marcha JP 19-jun concluidas; MML levantada 22-jun 00:00.",
    "RM-04": "Escenario Monte Carlo extremo; concentración pro-F 14-jun Av. Javier Prado no materializada.",
    "RM-05": "Corredor Las Bambas sin reactivación verificada 17–23 jun.",
    "RM-10": "Ventana 13-jun cerrada sin ataques graves a periodistas indexados.",
    "RM-13": "Marcha 13-jun y 19-jun sin víctimas graves; efecto dominó no activado.",
}

RM_VIGENTE = {
    "RM-02": "Puno aymara / Ilave latente; riesgo post-proclamación.",
    "RM-03": "Nulidad 2.408 actas: JEE improcedente parcial; pleno sin resolución 23-jun.",
    "RM-06": "Riesgo deepfake pre-proclamación (patrón DIS-009/010).",
    "RM-07": "Carretera Central / VRAEM latente; La Oroya transitable al corte.",
    "RM-08": "Sánchez condiciona reconocimiento a transparencia escrutinio.",
    "RM-09": "Brecha Lima–sur andino estructural; gobernabilidad post-electoral.",
    "RM-11": "Piura arrocera: MIDAGRI lineamientos insuficientes; gremio mantiene protesta 23-jun.",
    "RM-12": "Narrativa fraude (Plan Morrocoy, actas 900K) reactivable pre-proclamación.",
    "RM-14": "Madre de Dios post-operativo Tambopata 10-jun; represalia mineros latente.",
    "RM-15": "Escalada aymara Puno si proclamación Fujimori.",
}

GRASS_HANDLE_FIX = {
    "@HCevallos": "@HCevallosFlores",
    "@lopezaliaga": "@rlopezaliaga1",
}

NEW_NATIONAL_EVENTS = [
    {
        "id": "MARCHA-JP-19JUN",
        "date": "2026-06-19",
        "title": "Marcha en defensa de la democracia — JP centro histórico Lima",
        "organizers": [
            "Roberto Sánchez",
            "Juntos por el Perú",
            "Hernando Cevallos",
            "Colectivos autoconvocados",
        ],
        "regions_involved": ["lima", "sur", "centro", "norte", "oriente"],
        "estimated_attendance": "Cientos (RPP, LR, Infobae); sin cifra PNP/organizador",
        "risk_level": "MEDIO",
        "narrative": (
            "Marcha ejecutada 19-jun desde Paseo Colón hacia centro histórico; Sánchez encabezó. "
            "No alcanzó Campo de Marte (cordon PNP). Sin incidentes graves indexados. "
            "Procuraduría denunció 9 convocantes esa noche."
        ),
        "sources": [{"title": "RPP — Marcha Sánchez 19-jun", "url": RPP_MARCHA}],
        "estado": "realizada",
    },
    {
        "id": "PIURA-ARROCERA-23JUN",
        "date": "2026-06-23",
        "title": "Movilización arrocera Piura-Sechura — terreno no confirmado al corte PM",
        "organizers": ["Conveagro", "Productores arroceros Piura-Sechura"],
        "regions_involved": ["norte"],
        "estimated_attendance": "No confirmado en terreno indexado (Walac/SUTRAN)",
        "risk_level": "MEDIO",
        "narrative": (
            "MIDAGRI aprobó lineamientos compra arroz; gremio mantiene protesta. "
            "El Trébol sin bloqueo indexado 23-jun. Monitoreo 24-jun AM."
        ),
        "sources": [{"title": "Norte Sostenible — MIDAGRI + protesta", "url": MIDAGRI_PIURA}],
        "estado": "vigente_sin_confirmacion_terreno",
    },
]

NEW_GRASS_ACCOUNTS = [
    {
        "name": "Roberto Sánchez Palomino",
        "handle": "@RobertoSanchP",
        "role": "convocador",
        "platform": "X",
        "url": "https://x.com/RobertoSanchP",
        "followers": "21,6K",
        "notes": "Encabezó marcha 19-jun; post viral rechazo denuncia Procuraduría.",
        "verification": "accounts_deep_jun19 R4",
    },
    {
        "name": "RPP Noticias",
        "handle": "@RPPNoticias",
        "role": "institucional",
        "platform": "X / TV",
        "url": "https://x.com/RPPNoticias",
        "followers": "3,5M",
        "notes": "Cobertura en vivo marcha 19-jun y acampamento JNE.",
        "verification": "accounts_deep_jun19 R4",
    },
]

REGION_OUTLOOK = {
    "lima": (
        "Post-MML 22-jun: P(marcha JP formal)=0,25. Acampamento ~80 carpas JNE continuo. "
        "Autoconv 22-jun no materializada. JNE nulidad pleno pendiente. ONPE meseta +41.565."
    ),
    "norte": (
        "Piura 23-jun: terreno no confirmado PM; tensión gremial activa post-MIDAGRI. "
        "El Trébol transitable al corte. Ronderas cajamarquinas latentes."
    ),
    "centro": (
        "Pariahuanca desescalada (acta GORE 19-jun). Carretera Central transitable. "
        "Riesgo latente si resolución JNE nulidad Lima escala narrativa."
    ),
    "sur": (
        "Ilave sin bloqueo activo verificado. FP no apela Puno. Samillán anunció movilización "
        "jul 15–28. Riesgo post-proclamación RM-15."
    ),
    "oriente": (
        "FB Terry / corredores oriente transitables. AIDESEP monitoreo postelectoral activo. "
        "Minería ilegal Madre de Dios latente (RM-14)."
    ),
}


def find_rm(matrix, rid):
    for r in matrix:
        if r.get("id") == rid:
            return r
    return None


def patch_risk_matrix(data):
    rm = data.get("risk_matrix", [])
    for rid, nota in RM_HISTORICO.items():
        r = find_rm(rm, rid)
        if r:
            r["estado"] = "historico"
            r["estado_nota"] = nota
            r["estado_corte"] = CORTE
    for rid, nota in RM_VIGENTE.items():
        r = find_rm(rm, rid)
        if r:
            r["estado"] = "vigente"
            r["estado_nota"] = nota
            r["estado_corte"] = CORTE
    r11 = find_rm(rm, "RM-11")
    if r11:
        r11["scenario"] = (
            "Reactivación paro agrario: productores Piura mantienen protesta pese a lineamientos "
            "MIDAGRI (23-jun). Precedente bloqueo violento El Trébol mayo-2026. "
            "Riesgo escalada Panamericana Norte P=0,55 al corte."
        )
    r03 = find_rm(rm, "RM-03")
    if r03:
        r03["scenario"] = (
            "Nulidad 2.408 actas: JEE improcedente 647 EE.UU. + 1.751 Lima (falta tasa/prueba). "
            "Pleno sin resolución publicada 23-jun. ~43.577 votos en juego vs +41.565."
        )


def patch_grassroots(data):
    g = data.setdefault("grassroots", {})
    meta = g.setdefault("meta", {})
    meta["generated_at"] = CORTE
    meta["version"] = "3.9.8"
    meta["merge_corte"] = CORTE
    meta["sources_used"] = list(meta.get("sources_used", [])) + [
        "research/validation/rm_historico_jun23.md",
        "research/social/social_round4_jun23.md",
        "research/validation/piura_jun23_results.md",
    ]

    g["summary"] = (
        "Al 23-jun PM (ONPE meseta 99,63 % / Fujimori +41.565), el eje grassroots combina: "
        "(1) marcha JP 19-jun ejecutada pacífica; (2) acampamento JNE ~80 carpas; "
        "(3) tensión arrocera Piura post-MIDAGRI sin confirmación terreno; "
        "(4) riesgo latente sur andino pre-proclamación. Montecarlo no recalculado — sin delta ONPE."
    )

    events = g.setdefault("national_events", [])
    existing_ids = {e.get("id") for e in events}
    for ev in NEW_NATIONAL_EVENTS:
        if ev["id"] not in existing_ids:
            events.insert(0, ev)

    nac = g.setdefault("nacional", {})
    accounts = nac.setdefault("accounts", [])
    for acc in accounts:
        h = acc.get("handle")
        if h in GRASS_HANDLE_FIX:
            acc["handle"] = GRASS_HANDLE_FIX[h]
            acc["url"] = f"https://x.com/{GRASS_HANDLE_FIX[h].lstrip('@')}"
            acc["handle_corregido"] = h
    existing_handles = {a.get("handle") for a in accounts}
    for acc in NEW_GRASS_ACCOUNTS:
        if acc["handle"] not in existing_handles:
            accounts.insert(0, acc)

    by_region = g.get("by_region", {})
    for rid, outlook in REGION_OUTLOOK.items():
        if rid in by_region:
            by_region[rid]["next_72h_outlook"] = outlook
            by_region[rid]["outlook_corte"] = CORTE


def patch_executive(data):
    ea = data.setdefault("executive_alert", {})
    catalysts = ea.get("catalysts", [])
    if catalysts and not any("RM-01–15" in c or "histórico" in c.lower() for c in catalysts):
        catalysts.append(
            "Matriz RM-01–15 reclasificada 23-jun: 5 históricos / 10 vigentes; montecarlo sin recálculo."
        )
        ea["catalysts"] = catalysts[:6]


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    mc_before = json.dumps(data.get("montecarlo", {}), sort_keys=True)

    data["meta"]["version"] = "3.9.8"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.9.8 RM-01–15 historico/vigente (5+10); grassroots nacional merge; montecarlo omitido."
    )

    patch_risk_matrix(data)
    patch_grassroots(data)
    patch_executive(data)

    mc_after = json.dumps(data.get("montecarlo", {}), sort_keys=True)
    if mc_before != mc_after:
        raise SystemExit("montecarlo mutated — abort")

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    rm = data["risk_matrix"]
    hist = sum(1 for r in rm if r["id"].startswith("RM-") and int(r["id"].split("-")[1]) <= 15 and r.get("estado") == "historico")
    vig = sum(1 for r in rm if r["id"].startswith("RM-") and int(r["id"].split("-")[1]) <= 15 and r.get("estado") == "vigente")
    print(f"v3.9.8 written — RM historico={hist} vigente={vig} montecarlo=unchanged")


if __name__ == "__main__":
    main()