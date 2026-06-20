#!/usr/bin/env python3
"""v3.9.4 — Round 4 prep corte: MML oficial, Piura reconfirmación parcial, verification_gaps_r4."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-19T23:30:00-05:00"

MML_FUENTE = "https://elperuano.pe/noticia/298272-centro-historico-de-lima-estas-son-las-restricciones-vehiculares-del-19-al-22-de-junio"
PIURA_PLUS_FUENTE = (
    "https://www.facebook.com/piuraplustv/videos/pptv-productores-anuncian-nueva-movilizaci%C3%B3n-"
    "para-el-23-de-junio-y-advierten-con/1007529818309319/"
)

VERIFICATION_GAPS = [
    {
        "id": "VG-R4-01",
        "item": "Reconfirmación Conveagro Piura (comunicado, FB, terreno)",
        "prioridad": "P0",
        "estado": "pendiente",
        "next_check": "2026-06-22T08:00:00-05:00",
        "fuentes": ["Walac Noticias", "Norte Sostenible", "SUTRAN"],
    },
    {
        "id": "VG-R4-02",
        "item": "Resolución JNE nulidad 2.408 actas en portal oficial",
        "prioridad": "P0",
        "estado": "pendiente",
        "next_check": "2026-06-22T08:00:00-05:00",
        "fuentes": ["jne.gob.pe", "RPP"],
    },
    {
        "id": "VG-R4-03",
        "item": "Levantamiento MML 22-jun 00:00 — tránsito efectivo Centro Histórico",
        "prioridad": "P0",
        "estado": "pendiente",
        "next_check": "2026-06-22T08:00:00-05:00",
        "fuentes": ["MML", "PNP terreno"],
    },
    {
        "id": "VG-R4-04",
        "item": "Autoconvocatoria 22-jun Plaza San Martín — ejecución en terreno",
        "prioridad": "P1",
        "estado": "pendiente",
        "next_check": "2026-06-22T18:00:00-05:00",
        "fuentes": ["Instagram reel métricas", "medios Lima"],
    },
    {
        "id": "VG-R4-05",
        "item": "Conteo carpas acampamento JNE (baseline ~80 del 16-jun)",
        "prioridad": "P1",
        "estado": "pendiente",
        "next_check": "2026-06-22T08:00:00-05:00",
        "fuentes": ["RPP", "terreno"],
    },
    {
        "id": "VG-R4-06",
        "item": "Expediente PJ amparo voto exterior — admisión o rechazo",
        "prioridad": "P1",
        "estado": "pendiente",
        "next_check": "2026-06-22T08:00:00-05:00",
        "fuentes": ["PJCE consulta expediente"],
    },
    {
        "id": "VG-R4-07",
        "item": "Corredores SUTRAN 20–22 jun (El Trébol, FB Terry, La Oroya)",
        "prioridad": "P1",
        "estado": "pendiente",
        "next_check": "2026-06-22T08:00:00-05:00",
        "fuentes": ["SUTRAN"],
    },
    {
        "id": "VG-R4-08",
        "item": "ONPE delta actas JEE (baseline 346)",
        "prioridad": "P2",
        "estado": "pendiente",
        "next_check": "2026-06-22T08:00:00-05:00",
        "fuentes": ["segundavuelta.onpe.gob.pe"],
    },
]

RM_HISTORICAL = {
    "RM-01": {
        "estado": "realizada",
        "probability": "BAJA",
        "level": "BAJO",
        "timeframe": "cerrado 13-jun",
        "scenario_suffix": " Evento del 13-jun concluido; riesgo residual autoconvocatorias post-MML.",
    },
    "RM-03": {
        "estado": "historico",
        "probability": "BAJA",
        "level": "BAJO",
        "timeframe": "cerrado 13-jun",
        "scenario_suffix": " Convocatoria 13-jun ya ejecutada.",
    },
    "RM-04": {
        "estado": "historico",
        "probability": "BAJA",
        "level": "BAJO",
        "timeframe": "cerrado 14-jun",
        "scenario_suffix": " Concentración pro-F 14-jun no materializada en Av. Javier Prado.",
    },
}


def find_by_id(items, rid):
    for x in items:
        if x.get("id") == rid:
            return x
    return None


def patch_rm_historical(data):
    rm = data.get("risk_matrix", [])
    for rid, fields in RM_HISTORICAL.items():
        r = find_by_id(rm, rid)
        if not r:
            continue
        suffix = fields.pop("scenario_suffix", "")
        r.update({k: v for k, v in fields.items() if k != "scenario_suffix"})
        if suffix and suffix.strip() not in (r.get("scenario") or ""):
            r["scenario"] = (r.get("scenario") or "").rstrip() + suffix


def patch_convocatorias(data):
    lima = data["regions"]["lima"]
    for c in lima.get("convocatorias_futuras", []):
        if c.get("id") == "LIMA-AUTO-22JUN":
            c["status_mml"] = "restriccion_oficial_19-22jun"
            c["mml_resolucion"] = "D002556-2026-MML-GMU-SER"
            c["mml_fuente_url"] = MML_FUENTE
            c["notas"] = (
                "MML: restricción oficial 19-jun 00:00 → 22-jun 00:00 (El Peruano 19-jun). "
                "Reel IG vigente; sin respaldo JP. Post-levantamiento: P(marcha JP formal)=0,25."
            )
            break

    norte = data["regions"]["norte"]
    for c in norte.get("convocatorias_futuras", []):
        if c.get("id") == "NORTE-PARO-023":
            c["fuente_secundaria"] = PIURA_PLUS_FUENTE
            c["fuente_secundaria_nombre"] = "Piura Plus TV (Facebook, 19-jun)"
            c["reconfirmacion_parcial_19jun"] = True
            c["notas"] = (
                "Vigente sin cancelación 17-19 jun. Reconfirmación parcial Piura Plus TV 19-jun. "
                "Monitoreo obligatorio 22-jun AM (Walac, Norte Sostenible, SUTRAN)."
            )
            break


def patch_prediccion(data):
    p7 = data.setdefault("prediccion_7dias", {})
    p7["nota_metodologica"] = (
        "v3.9.4 Round 4 prep: MML restricción oficial hasta 22-jun 00:00; Piura 23-jun vigente "
        "(reconfirmación parcial 19-jun); JNE nulidad al voto sin resolución; 8 brechas VG-R4."
    )
    lima = p7.setdefault("lima", {})
    lima["status_mml_oficial"] = "restriccion_19-22jun_D002556"
    lima["mml_fuente"] = MML_FUENTE


def patch_executive_alert(data):
    ea = data.setdefault("executive_alert", {})
    catalysts = ea.get("catalysts", [])
    mml_line = (
        "MML restricción oficial Centro Histórico 19-jun→22-jun 00:00 "
        "(Res. D002556-2026, [El Peruano](https://elperuano.pe/noticia/298272-centro-historico-de-lima-estas-son-las-restricciones-vehiculares-del-19-al-22-de-junio))."
    )
    replaced = False
    for i, c in enumerate(catalysts):
        if "MML restricción" in c:
            catalysts[i] = mml_line
            replaced = True
            break
    if not replaced:
        catalysts.insert(2, mml_line)
    ea["catalysts"] = catalysts

    bluf = data.setdefault("bluf", {})
    for w in bluf.get("three_things_to_watch", []):
        tit = (w.get("titulo") or "").lower()
        if "piura" in tit or "23-jun" in tit:
            w["detalle"] = (
                "Convocatoria vigente; Piura Plus TV reitera 23-jun (19-jun). "
                "Reconfirmación Conveagro pendiente 22-jun AM (VG-R4-01)."
            )
        if "mml" in tit or "22-jun" in tit:
            w["detalle"] = (
                "Restricción oficial hasta 22-jun 00:00 (El Peruano). "
                "Verificar levantamiento efectivo VG-R4-03."
            )


def patch_escrutinio(data):
    er = data.setdefault("escrutinio_realtime", {})
    er["onpe_plateau"] = {
        "desde": "2026-06-19T20:43:00-05:00",
        "pct_actas": "99.63%",
        "margen": 41565,
        "actas_jee": 346,
        "nota": "Sin delta indexado 17-19 jun tarde; monitoreo VG-R4-08.",
    }
    jne = er.setdefault("jne_nulidad_2408", {})
    jne["estado_19jun"] = "dejado_al_voto"
    jne["resolucion_publicada"] = False


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    data["meta"]["version"] = "3.9.4"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.9.4 Round 4 prep: MML oficial El Peruano; Piura Plus TV reconfirmación parcial; "
        "verification_gaps_r4 (8 ítems); RM-01/03/04 histórico; ONPE meseta documentada."
    )

    data["verification_gaps_r4"] = {
        "fecha_corte": CORTE,
        "next_monitoreo": "2026-06-22T08:00:00-05:00",
        "nota": "Brechas explícitas para monitoreo 22-jun AM pre-Piura 23-jun.",
        "gaps": VERIFICATION_GAPS,
    }

    patch_convocatorias(data)
    patch_rm_historical(data)
    patch_prediccion(data)
    patch_executive_alert(data)
    patch_escrutinio(data)

    si = data.setdefault("social_intelligence", {})
    si["fecha_corte"] = CORTE
    si["contexto"] = (
        "Al 99,63% actas (meseta 19-jun), Fujimori +41.565 votos. "
        "MML restricción oficial Centro Histórico hasta 22-jun 00:00. "
        "Piura 23-jun vigente (reconfirmación parcial). JNE nulidad al voto sin resolución."
    )

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("v3.9.4 written")


if __name__ == "__main__":
    main()