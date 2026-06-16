#!/usr/bin/env python3
"""Consolidate OSINT research round 2 — v3.8.1 (corte 16-jun 10:50 PET)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

NORTE_CONV = {
    "id": "NORTE-PARO-023",
    "fecha": "2026-06-23T08:00:00-05:00",
    "titulo": "Movilización arrocera Piura-Sechura — Conveagro",
    "descripcion": "Productores arroceros convocan movilización; evalúan retomar paro si Gobierno no cumple lineamientos DU 005-2026.",
    "ubicacion": "Piura (Sechura, Medio y Bajo Piura; posible El Trébol/Catacaos)",
    "tipo": "marcha",
    "fuente": "https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/",
    "probabilidad_realizacion": 0.65,
    "magnitud_estimada": "alta",
    "es_pasado": False,
}

LIMA_ROUTE_NOTE = (
    "Concentración 16:00 Campo de Marte. Ruta post-16:00 NO oficializada por JP/MML/PNP al 16-jun. "
    "Ruta probable (precedente 13-jun): Campo de Marte → av. Arequipa → Inca Garcilaso de la Vega → "
    "av. Nicolás de Piérola → JNE (jr. Nazca). MML: alerta máxima Centro Histórico; zona intangible."
)

NEW_LIVES = [
    {
        "titulo": "Simpatizantes JP acampan frente al JNE (~80 carpas)",
        "url": "https://rpp.pe/peru/actualidad/simpatizantes-de-juntos-por-el-peru-dicen-que-seguiran-acampando-frente-al-jne-noticia-1693265",
        "plataforma": "RPP / web",
        "bando": "pro_sanchez",
        "ultima_verificacion": "2026-06-16T10:01:00-05:00",
        "activo": True,
        "ubicacion": "JNE, jr. Nazca, Jesús María, Lima",
    },
    {
        "titulo": "Plantón JP frente sede JNE — Facebook Live RPP",
        "url": "https://www.facebook.com/rppnoticias/videos/-simpatizantes-de-juntos-por-el-per%C3%BA-jp-realizan-un-plant%C3%B3n-frente-a-la-sede-del/956593144090896/",
        "plataforma": "Facebook",
        "bando": "pro_sanchez",
        "ultima_verificacion": "2026-06-16T10:00:00-05:00",
        "activo": True,
        "ubicacion": "JNE, Jesús María, Lima",
    },
]


def patch_convocatoria_lima_19(data):
    for c in data["regions"]["lima"].get("convocatorias_futuras", []):
        if "Campo de Marte" in (c.get("nombre") or ""):
            c["notas"] = LIMA_ROUTE_NOTE
            c["ruta_probable"] = (
                "Campo de Marte → av. Arequipa → Inca Garcilaso → av. Nicolás de Piérola → JNE (jr. Nazca)"
            )
            c["fuente_ruta"] = "https://rpp.pe/politica/elecciones/marcha-en-lima-simpatizantes-de-juntos-por-el-peru-y-colectivos-sociales-exigen-respeto-a-la-voluntad-popular-y-transparencia-electoral-noticia-1692948"


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    data["meta"]["version"] = "3.8.1"
    data["meta"]["generated_at"] = "2026-06-16T10:50:00-05:00"
    data["meta"]["last_update"] = "2026-06-16T10:50:00-05:00"
    data["meta"]["fecha_corte"] = "2026-06-16T10:50:00-05:00"
    data["meta"]["last_refresh_summary"] = (
        "Refresh v3.8.1 — round 2 loose threads: ONPE 99,07%/+34.967; Ilave y km 556 NO verificados activos 16-jun; "
        "amparo PJ presentado sin resolución; ruta probable Campo de Marte→JNE documentada; Piura movilización 23-jun; "
        "lives RPP acampamento JNE; @JuntosPorElPer sin post X — convocatoria vía comunicado partidario."
    )

    ea = data["executive_alert"]
    ea["headline"] = (
        "Fujimori +34.967 votos al 99,07% actas; JP vigilias 17-jun y marcha Campo de Marte 19-jun; "
        "Ilave y km 556 sin bloqueo verificado; amparo PJ pendiente"
    )
    ea["key_finding"] = (
        "Margen +34.967 votos al 99,07% (El Comercio 10:50 PET, 16-jun). "
        "Hilos cerrados round 2: Puente Ilave y Panamericana km 556 **sin bloqueo activo verificado** al 16-jun "
        "(convocatoria Ilave desde 11-jun sin confirmación SUTRAN). Amparo JP voto exterior **presentado**, sin admisión/rechazo PJ. "
        "Marcha 19-jun: solo Campo de Marte 16:00 confirmado; ruta probable vía Arequipa→JNE (precedente 13-jun). "
        "Piura: paro NO reactivado; movilización arrocera **23-jun** confirmada. Acampamento ~80 carpas frente JNE (RPP 16-jun)."
    )

    # escrutinio
    er = data.setdefault("escrutinio_realtime", {})
    er["fecha_corte"] = "2026-06-16T10:50:00-05:00"
    er["cifras_actuales"] = {
        "pct_actas": "99.07%",
        "votos_F": 9128178,
        "votos_S": 9093193,
        "margen_actual": 34967,
        "favorece": "F",
        "fuente_primaria": "https://elcomercio.pe/politica/elecciones/cual-es-la-cantidad-de-votos-que-separa-a-keiko-fujimori-y-roberto-sanchez-segun-ultimos-resultados-onpe-de-la-segunda-vuelta-elecciones-peru-2026-noticia/",
        "hora_corte": "16-jun 10:50 PET",
        "notas": "878 actas en JEE. Amparo JP pendiente. Sin corte 17-jun en esta actualización.",
    }
    osc = er.get("oscilacion_intra_periodo", [])
    if not any(o.get("margen") == 34967 for o in osc):
        osc.append({
            "hora_PET": "2026-06-16 10:50",
            "margen": 34967,
            "favorece": "F",
            "actas_pct": "99,07%",
            "fuente": "https://elcomercio.pe/politica/elecciones/cual-es-la-cantidad-de-votos-que-separa-a-keiko-fujimori-y-roberto-sanchez-segun-ultimos-resultados-onpe-de-la-segunda-vuelta-elecciones-peru-2026-noticia/",
        })
    er["oscilacion_intra_periodo"] = osc

    # bluf
    bluf = data["bluf"]
    bluf["kpis"][0] = {"label": "Margen actual", "value": "+34.967 votos", "sub": "99,07 % actas · pro-Fujimori", "tone": "red"}
    bluf["kpis"][1] = {"label": "Margen proyectado", "value": "+41.200", "sub": "IC95 [+32.800; +49.600]", "tone": "red"}
    for crit in bluf.get("manifestaciones_criticas_top", []):
        if "Ilave" in (crit.get("nombre") or ""):
            crit["nombre"] = "Puente Ilave — bloqueo NO verificado activo (16-jun)"
            crit["estado"] = "incierto"
            crit["riesgo"] = "medio"
            crit["nota"] = "Convocado 11-jun; sin alerta SUTRAN ni reporte 16-jun de cierre sostenido"

    bluf["three_things_to_watch"][0]["detalle"] = (
        "Walter Ayala presentó demanda 15-jun noche; anuncio público 16-jun. "
        "Sin admisión, inadmisión ni rechazo verificado al 16-jun 10:50 PET."
    )

    # forecast_ml
    fml = data["forecast_ml"]
    fml["punto_central"]["margen_final_votos"] = 41200
    fml["intervalos_confianza"]["ic_95"] = [32800, 49600]
    fml["subtitulo"] = "Modelo ensemble · corte 16-jun 10:50 PET · 99,07% actas"

    # prediccion_7dias
    p7 = data["prediccion_7dias"]
    p7["norte"]["prob_bloqueo_panamericana_norte"] = 0.20
    p7["norte"]["justificacion"] = "Km 556 sin bloqueo verificado 16-jun; Piura movilización 23-jun (P=0,65)."
    p7["sur"]["prob_bloqueo_ilave_activo"] = 0.35
    p7["sur"]["justificacion"] = "Ilave: anuncio CNUL 11-jun sin verificación terreno 16-jun. FP no apela Puno."
    p7.setdefault("escenario_global_semana", {})["indicadores_de_escalada_a_monitorear"] = [
        "Resolución PJ sobre amparo voto exterior",
        "Asistencia marcha Campo de Marte 19-jun >10.000",
        "Movilización arrocera Piura 23-jun",
        "Reactivación bloqueo Ilave post-proclamación",
    ]

    # regions
    patch_convocatoria_lima_19(data)
    norte = data["regions"]["norte"]
    cf = norte.get("convocatorias_futuras", [])
    if not any(x.get("id") == NORTE_CONV["id"] for x in cf):
        cf.append(NORTE_CONV)
    norte["convocatorias_futuras"] = cf

    # early_warning EW-20
    for ew in data.get("early_warning_indicators", []):
        if ew.get("id") == "EW-20":
            ew["value"] = "0 bloqueos confirmados · 2 inciertos"
            ew["rationale"] = (
                "Ilave y km 556 sin bloqueo verificado 16-jun. Federico Basadre levantado según PCM. "
                "La Oroya: solo congestión obras km 90."
            )
        if ew.get("id") == "EW-23":
            ew["value"] = "Presentado 15-16/jun · sin resolución PJ"
            ew["rationale"] = "Amparo interpuesto; sin admisión/rechazo verificado al 16-jun 10:50."

    # lives
    lives = data.get("live_streams", [])
    urls = {l.get("url") for l in lives}
    for lv in NEW_LIVES:
        if lv["url"] not in urls:
            lives.append(lv)
    data["live_streams"] = lives

    # rutas recurrentes — Campo de Marte
    rutas = data.get("rutas_recurrentes_v370", [])
    if not any("Campo de Marte" in (r.get("descripcion") or "") for r in rutas):
        rutas.insert(0, {
            "descripcion": "Campo de Marte → av. Arequipa → Inca Garcilaso → av. Nicolás de Piérola → JNE Jesús María",
            "frecuencia_en_dossier": 1,
            "distritos": ["Jesús María", "Lince", "Cercado de Lima"],
            "bando_predominante": "pro-S / antifujimorista",
            "patron_historico": "Ruta probable marcha JP 19-jun 2026. NO oficializada; precedente 13-jun Plaza San Martín→JNE.",
            "probabilidad_uso": 0.75,
            "fuente": "https://rpp.pe/politica/elecciones/marcha-en-lima-simpatizantes-de-juntos-por-el-peru-y-colectivos-sociales-exigen-respeto-a-la-voluntad-popular-y-transparencia-electoral-noticia-1692948",
        })
    data["rutas_recurrentes_v370"] = rutas

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("v3.8.1 written")


if __name__ == "__main__":
    main()