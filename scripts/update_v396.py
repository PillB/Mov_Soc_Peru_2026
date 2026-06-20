#!/usr/bin/env python3
"""v3.9.6 — Piura 23-jun terreno pass: VG-R4-01 refresh, NORTE-PARO-023, JNE context."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-23T18:00:00-05:00"

MIDAGRI_FUENTE = (
    "https://nortesostenible.com/midagri-aprueba-lineamientos-para-compra-de-arroz-"
    "pero-productores-de-piura-mantienen-protesta/"
)
JNE_JEE_FUENTE = "https://canaln.pe/actualidad/jne-improcedente-nulidad-juntos-peru-mesas-extranjero-n492715"


def find_by_id(items, rid):
    for x in items:
        if x.get("id") == rid:
            return x
    return None


def patch_gaps(data):
    vg = data.get("verification_gaps_r4", {})
    vg["fecha_corte"] = CORTE
    vg["next_monitoreo"] = "2026-06-24T08:00:00-05:00"
    vg["nota"] = "v3.9.6 Piura 23-jun: terreno no confirmado; tensión gremial activa; JNE pleno pendiente."
    for g in vg.get("gaps", []):
        if g.get("id") == "VG-R4-01":
            g.update({
                "estado": "no_confirmado_terreno",
                "resultado": (
                    "23-jun PM: sin cobertura terreno indexada (Walac/SUTRAN). "
                    "MIDAGRI lineamientos aprobados; gremio mantiene protesta. El Trébol sin bloqueo indexado."
                ),
                "fuente_url": MIDAGRI_FUENTE,
                "verificado": CORTE,
            })
        elif g.get("id") == "VG-R4-02":
            g.update({
                "resultado": (
                    "Pleno JNE: resolución apelación 2.408 actas no publicada al 23-jun 18:00. "
                    "JEE previo: improcedente 647 EE.UU. + 1.751 Lima (falta tasa/prueba)."
                ),
                "fuente_url": JNE_JEE_FUENTE,
                "estado": "pendiente_pleno",
                "verificado": CORTE,
            })
        elif g.get("id") == "VG-R4-07":
            g.update({
                "resultado": "El Trébol y Panamericana Norte Piura sin bloqueo indexado 23-jun.",
                "estado": "transitable",
                "verificado": CORTE,
            })
    data["verification_gaps_r4"] = vg


def patch_convocatorias(data):
    norte = data["regions"]["norte"]
    for c in norte.get("convocatorias_futuras", []):
        if c.get("id") == "NORTE-PARO-023":
            c["verificacion_terreno_23jun"] = "no_confirmado"
            c["estado_convocatoria"] = "vigente_sin_confirmacion_terreno"
            c["status_corredor_23jun"] = "transitable"
            c["bloqueo_trebol_23jun"] = False
            c["probabilidad_escalada_bloqueo_trebol"] = 0.55
            c["magnitud_realizada"] = None
            c["magnitud_confianza"] = "muy_baja"
            c["fuente_contexto_23jun"] = MIDAGRI_FUENTE
            c["notas"] = (
                "23-jun PM: sin confirmación terreno indexada. MIDAGRI lineamientos aprobados; "
                "productores mantienen protesta (Norte Sostenible). El Trébol libre al corte. "
                "Monitoreo 24-jun AM."
            )
            c["next_check"] = "2026-06-24T08:00:00-05:00"
            break


def patch_norte_alert(data):
    norte = data["regions"]["norte"]
    norte["executive_alert"] = (
        "Piura arrocera 23-jun: **sin confirmación terreno** al corte PM; tensión gremial activa "
        "([Norte Sostenible](https://nortesostenible.com/midagri-aprueba-lineamientos-para-compra-de-arroz-"
        "pero-productores-de-piura-mantienen-protesta/)). El Trébol **sin bloqueo indexado**. "
        "Margen ONPE meseta +41.565. JNE pleno nulidad pendiente."
    )
    norte["fecha_corte"] = CORTE


def patch_prediccion(data):
    p7 = data.setdefault("prediccion_7dias", {})
    p7["nota_metodologica"] = (
        "v3.9.6 Piura 23-jun: terreno no confirmado; tensión gremial activa post-lineamientos MIDAGRI; "
        "El Trébol libre; JNE pleno nulidad pendiente; ONPE meseta."
    )
    norte = p7.setdefault("norte", {})
    norte["prob_bloqueo_panamericana_norte"] = 0.55
    norte["prob_escalada_post_23jun"] = 0.45
    norte["justificacion"] = (
        "Movilización 23-jun no confirmada en terreno; gremio mantiene protesta; riesgo latente El Trébol."
    )


def patch_executive_alert(data):
    ea = data.setdefault("executive_alert", {})
    ea["catalysts"] = [
        "Piura arrocera 23-jun: terreno **no confirmado**; gremio mantiene protesta post-lineamientos MIDAGRI.",
        "JNE pleno nulidad 2.408 actas: resolución **no publicada** (JEE previo improcedente por tasa/prueba).",
        "El Trébol y corredores norte **transitables** al 23-jun (sin bloqueo indexado).",
        "ONPE meseta 99,63 % / +41.565 / 346 actas JEE.",
        "Acampamento JNE activo (~80 carpas baseline 16-jun).",
        "Procuraduría denuncia 9 convocantes; Sánchez rechazó criminalización ([Infobae 20-jun](https://www.infobae.com/peru/2026/06/20/procuraduria-denuncia-a-antauro-humala-claudia-cisneros-y-hernando-cevallos-por-presunta-perturbacion-de-la-tranquilidad-publica/)).",
    ]
    ea["headline"] = (
        "Piura 23-jun sin confirmación terreno; tensión arrocera activa; JNE nulidad pleno pendiente; "
        "Fujimori +41.565 al 99,63%"
    )


def patch_escrutinio(data):
    jne = data.setdefault("escrutinio_realtime", {}).setdefault("jne_nulidad_2408", {})
    jne["jee_improcedente_previo"] = {
        "lima_1751": True,
        "eeuu_647": True,
        "motivo": "falta_tasa_y_prueba_material",
        "fuente": JNE_JEE_FUENTE,
    }
    jne["pleno_resolucion_23jun"] = "no_publicada"


def patch_rm(data):
    r = find_by_id(data.get("risk_matrix", []), "RM-27")
    if r:
        r["scenario"] = (
            "Pleno dejó al voto 19-jun apelación nulidad 2.408 actas; JP sin prueba material. "
            "JEE previo declaró improcedente 647 EE.UU. + 1.751 Lima (falta tasa/prueba). "
            "Resolución pleno no publicada al 23-jun 18:00. ~43.577 votos en juego vs +41.565."
        )


def patch_ew(data):
    for eid, fields in {
        "EW-20": {
            "value": "Piura 23-jun terreno no confirmado · El Trébol libre · tensión gremial AMARILLO",
            "rationale": "Sin bloqueo indexado 23-jun; MIDAGRI lineamientos insuficientes para gremio.",
            "next_check": "2026-06-24T08:00:00-05:00",
        },
        "EW-29": {
            "value": "NORTE-PARO-023 sin confirmación terreno 23-jun",
            "rationale": "Convocatoria vigente pre-evento; resultado terreno no indexado al corte PM.",
        },
    }.items():
        e = find_by_id(data.get("early_warning_indicators", []), eid)
        if e:
            e.update(fields)


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    data["meta"]["version"] = "3.9.6"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.9.6 Piura 23-jun: terreno no confirmado; MIDAGRI lineamientos + protesta activa; "
        "El Trébol libre; JNE pleno pendiente; JEE improcedente documentado."
    )

    patch_gaps(data)
    patch_convocatorias(data)
    patch_norte_alert(data)
    patch_prediccion(data)
    patch_executive_alert(data)
    patch_escrutinio(data)
    patch_rm(data)
    patch_ew(data)

    si = data.setdefault("social_intelligence", {})
    si["fecha_corte"] = CORTE
    si["contexto"] = (
        "23-jun PM: Piura arrocera sin confirmación terreno; tensión gremial activa. "
        "JNE pleno nulidad pendiente. ONPE meseta +41.565."
    )

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("v3.9.6 written")


if __name__ == "__main__":
    main()