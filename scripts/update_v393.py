#!/usr/bin/env python3
"""v3.9.3 — Round 3 per-entity validation + pre-22-jun corte (Piura 23-jun prep)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-19T21:00:00-05:00"

NEW_HASHTAGS = [
    {
        "hashtag": "#AguaSiMinaNo",
        "plataforma": "Facebook / WhatsApp regional",
        "volumen_estimado": "bajo (nacional) · medio (Junín)",
        "pico_observado": "2026-06-19T19:49:00-05:00",
        "bando": "ambiental-gremial",
        "fuente_url": "https://hytimes.pe/2026/06/19/gobierno-regional-cede-y-emitira-ordenanza-para-proteger-el-huaytapallana-y-cabeceras-de-cuenca/",
        "nota": "Slogan físico Pariahuanca; acta GORE 19-jun. validacion_ronda=3.",
        "validacion_ronda": 3,
        "magnitud_social_score": 3,
    },
    {
        "hashtag": "#PunoDefiendeSuVoto",
        "plataforma": "X / medios regionales",
        "volumen_estimado": "bajo",
        "bando": "pro-Sánchez / autoconvocados sur",
        "fuente_url": "https://evidencia.pe/raul-samillan-keiko-fujimori-posiblemente-este-gobernando-y-dios-nos-salve/",
        "nota": "Narrativa Samillán 'no reconocer'; #NoReconocemosResultado no indexado 17-20 jun.",
        "validacion_ronda": 3,
        "magnitud_social_score": 2,
    },
]

NEW_CUENTAS = [
    {
        "nombre": "Conveagro Norte – Productores Agrarios Piura-Sechura",
        "plataforma": "Facebook / comunicados",
        "handle": None,
        "url": "https://www.facebook.com/61570815782234",
        "descripcion": "Gremio convocante movilización arrocera 23-jun. Sin handle X verificado.",
        "posicion": "gremial",
        "fuente_url": "https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/",
        "validacion_ronda": 3,
        "engagement_tier": "bajo",
    },
    {
        "nombre": "Walac Noticias Piura",
        "plataforma": "Facebook / walac.pe",
        "handle": "@WalacNoticias",
        "url": "https://www.facebook.com/WalacNoticias",
        "descripcion": "Medio regional Piura. Monitoreo prioritario 22-jun AM pre-Piura 23-jun.",
        "posicion": "neutral-regional",
        "fuente_url": "https://walac.pe/seccion/actualidad/",
        "validacion_ronda": 3,
        "engagement_tier": "bajo",
    },
    {
        "nombre": "Pachamama Radio",
        "plataforma": "X / Instagram",
        "handle": "@PachamamaRadio_",
        "url": "https://x.com/PachamamaRadio_",
        "descripcion": "X inactivo 17-19; reel IG convocatoria autoconvocatoria 22-jun Plaza San Martín.",
        "posicion": "alternativo / pro-Sánchez",
        "fuente_url": "https://www.instagram.com/reel/DZQNoG-pSIU/",
        "validacion_ronda": 3,
        "engagement_tier": "bajo",
    },
    {
        "nombre": "UNAP Iquitos",
        "plataforma": "X",
        "handle": "@unapiquitos",
        "url": "https://x.com/unapiquitos",
        "descripcion": "Cuenta institucional dormante en ventana 17-19. Vínculo indirecto delegaciones oriente marcha Lima 19-jun.",
        "posicion": "institucional",
        "fuente_url": "https://elbuho.pe/2026/06/mas-de-7-mil-policias-restriccion-vehicular-amenazas-del-alcalde-de-lima-para-marcha-de-jp-en-defensa-del-voto/",
        "validacion_ronda": 3,
        "engagement_tier": "bajo",
    },
]

PIURA_ROUTE = {
    "descripcion": "Piura arrocera: Sechura → Piura ciudad → Óvalo El Trébol km 1058 (proyectado 23-jun)",
    "frecuencia_en_dossier": 1,
    "distritos": ["Sechura", "Piura", "Sullana"],
    "bando_predominante": "gremial / arrocero",
    "patron_historico": "Convocatoria Conveagro 23-jun; precedente bloqueo violento El Trébol mayo-2026 (~3.000).",
    "probabilidad_uso": 0.85,
    "magnitud_proyectada": "M",
    "fuente": "https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/",
    "puntos_clave": ["Sechura", "Piura ciudad", "Óvalo El Trébol km 1058"],
}


def find_by_id(items, rid):
    for x in items:
        if x.get("id") == rid:
            return x
    return None


def patch_hashtag(data, tag, fields):
    si = data.setdefault("social_intelligence", {})
    tags = si.setdefault("hashtags", [])
    for h in tags:
        if h.get("hashtag") == tag:
            h.update(fields)
            return
    tags.append({"hashtag": tag, **fields})


def append_if_new(items, key, entry):
    if any(x.get(key) == entry.get(key) for x in items if entry.get(key)):
        return
    items.append(entry)


def patch_convocatorias(data):
    norte = data["regions"]["norte"]
    for c in norte.get("convocatorias_futuras", []):
        if c.get("id") == "NORTE-PARO-023":
            c["probabilidad_realizacion"] = 0.85
            c["probabilidad_escalada_bloqueo_trebol"] = 0.65
            c["magnitud_codigo"] = "M"
            c["participantes_rango"] = [500, 5000]
            c["participantes_est_central"] = 2000
            c["magnitud_confianza"] = "baja"
            c["status_corredor_19jun"] = "latente"
            c["next_check"] = "2026-06-22T08:00:00-05:00"
            c["concentration_points"] = [
                {"nombre": "Sechura", "lat": -5.5564, "lng": -80.8204, "riesgo": "alto"},
                {"nombre": "Piura ciudad", "lat": -5.1945, "lng": -80.6328, "riesgo": "medio-alto"},
                {"nombre": "Óvalo El Trébol km 1058", "lat": -4.9117, "lng": -80.6788, "riesgo": "muy_alto"},
            ]
            c["notas"] = (
                "Sin cancelación 17-19 jun; sin reconfirmación Conveagro reciente. "
                "Monitoreo 22-jun AM (Walac, Norte Sostenible, SUTRAN)."
            )
            break

    lima = data["regions"]["lima"]
    for c in lima.get("convocatorias_futuras", []):
        if c.get("id") == "LIMA-AUTO-22JUN":
            c["notas"] = (
                "Reel IG vigente; sin respaldo JP oficial. MML restricción Centro Histórico hasta 22-jun 00:00. "
                "Post-levantamiento: P(marcha JP formal)=0,25."
            )
            c["prob_nueva_marcha_jp_post_mml"] = 0.25
            c["status_mml"] = "restriccion_hasta_22jun_00:00"
            break


def patch_risk_early(data):
    rm = data.get("risk_matrix", [])
    r27 = find_by_id(rm, "RM-27")
    if r27:
        r27["scenario"] = (
            "JP sustentó 19-jun ante JNE nulidad de 2.408 actas (1.751 Lima + 647 EE.UU.); "
            "pleno dejó al voto; JP admitió sin prueba material de fraude (solo análisis 583 patrones). "
            "Si JNE declara fundada nulidad Lima, ~43.577 votos netos en juego superan margen +41.565. "
            "Resolución estimada 23-27 jun; no publicada al corte 19-jun 21:00."
        )
        r27["timeframe"] = "23-27 jun (estimado Roy Mendoza)"

    ew = data.get("early_warning_indicators", [])
    for eid, fields in {
        "EW-27": {
            "value": "Dejó al voto 19-jun · JP sin prueba material · resolución pendiente",
            "rationale": (
                "Audiencia sustentada; pleno dejó al voto recursos Lima+EE.UU. "
                "JP admitió creer en fraude sin prueba documentada (Infobae 19-jun)."
            ),
        },
        "EW-20": {
            "value": "0 bloqueos confirmados 19-jun · Piura 23-jun AMARILLO",
            "rationale": (
                "Ilave inactivo; La Oroya transitable; Federico Basadre/FB Terry levantados; "
                "El Trébol libre con riesgo escalada P=0,65."
            ),
            "next_check": "2026-06-22T08:00:00-05:00",
        },
        "EW-23": {
            "value": "Presentado 16-jun · admisión PJ no confirmada 17-20 jun",
            "rationale": "Amparo Walter Ayala; sin admisión/rechazo indexado; voto exterior ya al 100%.",
        },
        "EW-29": {
            "value": "Convocatoria vigente · sin cancelación 17-19 jun · sin reconfirmación reciente",
            "rationale": "NORTE-PARO-023 vigente. Reconfirmar 22-jun AM (Norte Sostenible, Walac, SUTRAN).",
        },
    }.items():
        e = find_by_id(ew, eid)
        if e:
            e.update(fields)


def patch_prediccion(data):
    p7 = data.setdefault("prediccion_7dias", {})
    p7["nota_metodologica"] = (
        "v3.9.3 Round 3: 0 bloqueos activos 19-jun; Piura 23-jun P(escalada El Trébol)=0,65; "
        "Lima post-MML 22-jun P(marcha JP)=0,25; JNE nulidad al voto sin resolución."
    )
    lima = p7.setdefault("lima", {})
    lima["prob_nueva_marcha_jp_post_22jun"] = 0.25
    lima["prob_autoconvocatoria_22jun"] = 0.40
    lima["justificacion"] = (
        "Marcha 19-jun realizada pacífica. MML levanta restricción 22-jun 00:00. "
        "Autoconvocatoria IG sin JP (P=0,40). Sin convocatoria JP formal 20-23 jun."
    )
    norte = p7.setdefault("norte", {})
    norte["prob_bloqueo_panamericana_norte"] = 0.65
    norte["justificacion"] = "Movilización Piura 23-jun confirmada sin cancelar; precedente violento El Trébol mayo."
    sur = p7.setdefault("sur", {})
    sur["prob_bloqueo_ilave_activo"] = 0.15
    sur["prob_reactivacion_ilave"] = 0.40
    sur["justificacion"] = "Ilave inactivo 19-jun; delegaciones puneñas en Lima; riesgo reactivación post-proclamación."
    oriente = p7.setdefault("oriente", {})
    oriente["prob_bloqueo_fb_terry"] = 0.50
    global_s = p7.setdefault("escenario_global_semana", {})
    global_s["indicadores_de_escalada_a_monitorear"] = [
        "Resolución JNE nulidad 2.408 actas (dejó al voto 19-jun)",
        "Reconfirmación Conveagro Piura 22-jun AM",
        "Autoconvocatoria Instagram Plaza San Martín 22-jun",
        "Levantamiento restricción MML Centro Histórico 22-jun 00:00",
        "Resolución PJ amparo voto exterior",
    ]


def patch_executive_alert(data):
    ea = data.setdefault("executive_alert", {})
    ea["catalysts"] = [
        "JNE dejó al voto nulidad 2.408 actas; JP admitió sin prueba material (19-jun).",
        "Movilización arrocera Piura-Sechura 23-jun vigente sin cancelación.",
        "MML restricción Centro Histórico hasta 22-jun 00:00; autoconvocatoria IG 22-jun (P=0,40).",
        "0 bloqueos viales activos verificados 19-jun (Ilave, La Oroya, El Trébol libres).",
        "Amparo JP voto exterior presentado; admisión PJ no confirmada.",
        "Acampamento ~80 carpas JNE activo (conteo 16-jun; sin update 19-20).",
    ]
    bluf_watch = data.get("bluf", {}).get("three_things_to_watch", [])
    for w in bluf_watch:
        if "nulidad" in (w.get("titulo") or "").lower():
            w["detalle"] = (
                "Pleno dejó al voto 19-jun; JP sin prueba material. "
                "~43.577 votos en juego vs margen +41.565. Resolución estimada 23-27 jun."
            )


def patch_escrutinio(data):
    er = data.setdefault("escrutinio_realtime", {})
    ca = er.setdefault("cifras_actuales", {})
    ca["notas"] = (
        "346 actas en JEE. JNE nulidad 2.408: dejó al voto 19-jun; JP sin prueba material; "
        "resolución pendiente 23-27 jun. Amparo PJ sin admisión confirmada."
    )


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    data["meta"]["version"] = "3.9.3"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.9.3 Round 3: per-entity hashtags/cuentas; prediccion_7dias pre-22-jun; "
        "Piura 23-jun P=0,85/escalada 0,65; JNE nulidad dejó al voto; 0 bloqueos activos 19-jun."
    )

    patch_convocatorias(data)
    patch_risk_early(data)
    patch_prediccion(data)
    patch_executive_alert(data)
    patch_escrutinio(data)

    si = data.setdefault("social_intelligence", {})
    si["fecha_corte"] = CORTE
    si["contexto"] = (
        "Al 99,63% actas (19-jun 20:43 PET), Fujimori +41.565 votos. "
        "Marcha JP 19-jun ejecutada. JNE nulidad al voto. Piura 23-jun vigente. "
        "0 bloqueos viales activos verificados."
    )

    patch_hashtag(
        data,
        "#FujimoriPresidenta",
        {
            "volumen_estimado": "alto (500-3.000 posts proxy 17-19 jun)",
            "pico_observado": "2026-06-19T17:28:00-05:00",
            "nota": "JNE proclamó solo legislativos 19-jun; presidencia pendiente. disinfo DIS-JUN19-01.",
            "validacion_ronda": 3,
            "fuente_url": "https://rpp.pe/politica/elecciones/jne-proclama-los-resultados-de-los-senadores-diputados-y-parlamentarios-andinos-noticia-1693837",
        },
    )
    patch_hashtag(
        data,
        "#ParoAgrario",
        {
            "volumen_estimado": "bajo (X) · medio (FB regional)",
            "nota": "Paro nacional NO reactivado 17-19. Movilización 23-jun confirmada. validacion_ronda=3.",
            "validacion_ronda": 3,
            "fuente_url": "https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/",
        },
    )

    for h in NEW_HASHTAGS:
        append_if_new(si.setdefault("hashtags", []), "hashtag", h)

    for c in NEW_CUENTAS:
        append_if_new(si.setdefault("cuentas_emergentes", []), "handle", c)

    rutas = data.setdefault("rutas_recurrentes_v370", [])
    if not any("El Trébol" in (r.get("descripcion") or "") for r in rutas):
        rutas.append(PIURA_ROUTE)

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("v3.9.3 written")


if __name__ == "__main__":
    main()