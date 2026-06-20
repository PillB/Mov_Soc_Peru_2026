#!/usr/bin/env python3
"""v3.9.5 — Round 4 live verification (22-jun corte): VG-R4 results + convocatorias."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-22T20:00:00-05:00"

GAP_RESULTS = {
    "VG-R4-01": {
        "estado": "parcial",
        "resultado": (
            "Convocatoria Piura 23-jun vigente en Norte Sostenible; sin comunicado Conveagro nuevo 20–22 jun."
        ),
        "fuente_url": "https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/",
        "verificado": "2026-06-22T12:00:00-05:00",
    },
    "VG-R4-02": {
        "estado": "pendiente",
        "resultado": "Resolución JNE nulidad 2.408 actas no publicada en portal al corte 22-jun 20:00.",
        "verificado": "2026-06-22T12:00:00-05:00",
    },
    "VG-R4-03": {
        "estado": "cerrado_programatico",
        "resultado": (
            "Restricción MML expiró 22-jun 00:00 según Res. D002556-2026; tránsito terreno no auditado."
        ),
        "fuente_url": "https://elperuano.pe/noticia/298272-centro-historico-de-lima-estas-son-las-restricciones-vehiculares-del-19-al-22-de-junio",
        "verificado": "2026-06-22T08:00:00-05:00",
    },
    "VG-R4-04": {
        "estado": "no_materializada",
        "resultado": "Autoconvocatoria IG Plaza San Martín 22-jun sin cobertura mediática indexada.",
        "verificado": "2026-06-22T20:00:00-05:00",
    },
    "VG-R4-05": {
        "estado": "sin_update",
        "resultado": "Baseline ~80 carpas RPP 16-jun; sin conteo terreno nuevo 20–22 jun.",
        "fuente_url": "https://rpp.pe/peru/actualidad/simpatizantes-de-juntos-por-el-peru-dicen-que-seguiran-acampando-frente-al-jne-noticia-1693265",
        "verificado": "2026-06-22T12:00:00-05:00",
    },
    "VG-R4-06": {
        "estado": "pendiente",
        "resultado": "Amparo JP voto exterior: admisión/rechazo PJ no indexado 20–22 jun.",
        "verificado": "2026-06-22T12:00:00-05:00",
    },
    "VG-R4-07": {
        "estado": "transitable",
        "resultado": "0 bloqueos SUTRAN indexados 20–22 jun (El Trébol, FB Terry, La Oroya libres).",
        "verificado": "2026-06-22T12:00:00-05:00",
    },
    "VG-R4-08": {
        "estado": "meseta",
        "resultado": "ONPE sin delta: 99,63 % / +41.565 / 346 actas JEE (heredado 19-jun).",
        "verificado": "2026-06-22T12:00:00-05:00",
    },
}

RM_HISTORICAL_EXTRA = {
    "RM-05": {"estado": "historico", "probability": "BAJA", "level": "BAJO", "timeframe": "cerrado 14-jun"},
    "RM-10": {"estado": "historico", "probability": "BAJA", "level": "BAJO", "timeframe": "cerrado 13-jun"},
    "RM-11": {"estado": "historico", "probability": "BAJA", "level": "BAJO", "timeframe": "cerrado 13-jun"},
    "RM-12": {"estado": "historico", "probability": "BAJA", "level": "BAJO", "timeframe": "cerrado 12-jun"},
}


def find_by_id(items, rid):
    for x in items:
        if x.get("id") == rid:
            return x
    return None


def patch_gaps(data):
    vg = data.get("verification_gaps_r4", {})
    vg["fecha_corte"] = CORTE
    vg["next_monitoreo"] = "2026-06-23T08:00:00-05:00"
    vg["nota"] = "Round 4 live 22-jun: 5/8 ítems cerrados o parciales; Piura 23-jun próximo P0."
    for g in vg.get("gaps", []):
        rid = g.get("id")
        if rid in GAP_RESULTS:
            g.update(GAP_RESULTS[rid])
    data["verification_gaps_r4"] = vg


def patch_convocatorias(data):
    lima = data["regions"]["lima"]
    for c in lima.get("convocatorias_futuras", []):
        if c.get("id") == "LIMA-AUTO-22JUN":
            c["estado"] = "no_realizada"
            c["probabilidad_realizacion"] = 0.1
            c["status_mml"] = "levantada_programatica_22jun_00h"
            c["es_pasado"] = True
            c["verificacion_22jun"] = "no_materializada"
            c["notas"] = (
                "22-jun: sin cobertura mediática de ejecución. MML restricción expiró 00:00 (Res. D002556). "
                "Reel IG sin respaldo JP; zona intangible persiste."
            )
            break

    norte = data["regions"]["norte"]
    for c in norte.get("convocatorias_futuras", []):
        if c.get("id") == "NORTE-PARO-023":
            c["next_check"] = "2026-06-23T08:00:00-05:00"
            c["status_corredor_22jun"] = "latente"
            c["notas"] = (
                "Vigente 22-jun (Norte Sostenible). Sin comunicado Conveagro nuevo. "
                "Monitoreo terreno obligatorio 23-jun AM pre-escalada El Trébol."
            )
            break


def patch_prediccion(data):
    p7 = data.setdefault("prediccion_7dias", {})
    p7["nota_metodologica"] = (
        "v3.9.5 Round 4 live: MML levantada 22-jun 00:00; autoconv 22-jun no materializada; "
        "Piura 23-jun vigente; JNE nulidad sin resolución; 0 bloqueos 20–22 jun."
    )
    lima = p7.setdefault("lima", {})
    lima["prob_autoconvocatoria_22jun"] = 0.1
    lima["status_mml"] = "levantada_programatica_22jun"
    norte = p7.setdefault("norte", {})
    norte["prob_bloqueo_panamericana_norte"] = 0.7
    norte["justificacion"] = "Piura 23-jun vigente 22-jun; precedente El Trébol; monitoreo AM 23-jun."


def patch_executive_alert(data):
    ea = data.setdefault("executive_alert", {})
    ea["catalysts"] = [
        "Movilización arrocera Piura-Sechura **23-jun** vigente (monitoreo terreno AM).",
        "JNE nulidad 2.408 actas: dejó al voto 19-jun; **resolución no publicada** al 22-jun.",
        "MML restricción Centro Histórico **expiró 22-jun 00:00** (Res. D002556); zona intangible persiste.",
        "Autoconvocatoria IG 22-jun **no materializada** (sin cobertura indexada).",
        "0 bloqueos viales activos 20–22 jun verificados (corredores transitables).",
        "Acampamento JNE activo (~80 carpas baseline 16-jun; sin conteo nuevo).",
    ]
    risks = ea.get("top_risks_24_72h", [])
    for i, r in enumerate(risks):
        if "Autoconvocatoria Instagram 22-jun" in r:
            risks[i] = "Movilización Piura 23-jun escalada El Trébol (Prob 0,70, Impacto ALTO)"
            break
    ea["top_risks_24_72h"] = risks


def patch_ew(data):
    updates = {
        "EW-20": {
            "value": "0 bloqueos 20–22 jun · Piura 23-jun ROJO",
            "rationale": "Corredores transitables; Piura arrocera mañana 23-jun P(escalada El Trébol)=0,65.",
            "next_check": "2026-06-23T08:00:00-05:00",
        },
        "EW-29": {
            "value": "Vigente 22-jun · monitoreo terreno 23-jun AM",
            "rationale": "NORTE-PARO-023 sin cancelación; Conveagro sin comunicado nuevo.",
        },
    }
    for eid, fields in updates.items():
        e = find_by_id(data.get("early_warning_indicators", []), eid)
        if e:
            e.update(fields)


def patch_rm(data):
    for rid, fields in RM_HISTORICAL_EXTRA.items():
        r = find_by_id(data.get("risk_matrix", []), rid)
        if r:
            r.update(fields)


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    data["meta"]["version"] = "3.9.5"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.9.5 Round 4 live: VG-R4 cerrados/parciales; MML expiró 22-jun; autoconv no materializada; "
        "Piura 23-jun vigente; JNE sin resolución; ONPE meseta."
    )

    patch_gaps(data)
    patch_convocatorias(data)
    patch_prediccion(data)
    patch_executive_alert(data)
    patch_ew(data)
    patch_rm(data)

    si = data.setdefault("social_intelligence", {})
    si["fecha_corte"] = CORTE
    si["contexto"] = (
        "Al 22-jun 20:00 PET: ONPE meseta 99,63 %/+41.565. MML levantada programática. "
        "Piura 23-jun vigente. Autoconv 22-jun no materializada. JNE nulidad sin resolución."
    )

    bluf = data.setdefault("bluf", {})
    for w in bluf.get("three_things_to_watch", []):
        tit = (w.get("titulo") or "").lower()
        if "piura" in tit or "23-jun" in tit:
            w["detalle"] = (
                "Vigente 22-jun. Monitoreo terreno 23-jun AM (Walac, SUTRAN, Norte Sostenible). "
                "P(escalada El Trébol)=0,65."
            )
        if "nulidad" in tit:
            w["detalle"] = (
                "Resolución JNE no publicada al 22-jun 20:00. ~43.577 votos en juego vs +41.565."
            )

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("v3.9.5 written")


if __name__ == "__main__":
    main()