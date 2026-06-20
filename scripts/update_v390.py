#!/usr/bin/env python3
"""Consolidate OSINT research rounds 1-3 — v3.9.0 (corte 19-jun 20:43 PET)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-19T20:43:00-05:00"

NEW_DISINFO = [
    {
        "id": "DIS-JUN19-01",
        "bulo": "Keiko Fujimori ya fue proclamada presidenta electa",
        "veredicto": "FALSO",
        "verificador": "EFE Verifica / AFP Factual",
        "fecha_fact_check": "2026-06-19",
        "url_fact_check": "https://elcomercio.pe/politica/elecciones/cual-es-la-cantidad-de-votos-que-separa-a-keiko-fujimori-y-roberto-sanchez-segun-ultimos-resultados-onpe-de-la-segunda-vuelta-elecciones-peru-2026-noticia/",
        "plataformas": ["Facebook", "WhatsApp", "X"],
        "notas": "JNE proclamó solo legislativos 19-jun; presidencia pendiente mediados julio.",
    },
    {
        "id": "DIS-JUN19-04",
        "bulo": "583 patrones anómalos = fraude electoral comprobado",
        "veredicto": "ENGAÑOSO",
        "verificador": "Análisis OSINT (argumento legal JP, no dictamen ONPE/JNE)",
        "fecha_fact_check": "2026-06-19",
        "url_fact_check": "https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777",
        "plataformas": ["X", "TikTok", "WhatsApp"],
    },
]

NEW_HASHTAGS = [
    {"tag": "#MarchaEnDefensaDeLaDemocracia", "volumen_estimado": "alto", "bando": "pro_sanchez", "pico_observado": "2026-06-19T18:00:00-05:00", "fuente_url": "https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850"},
    {"tag": "#CriminalizaciónDeLaProtesta", "volumen_estimado": "medio", "bando": "pro_sanchez", "pico_observado": "2026-06-19T20:00:00-05:00", "fuente_url": "https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848"},
    {"tag": "#583PatronesAnomalos", "volumen_estimado": "medio", "bando": "pro_sanchez", "pico_observado": "2026-06-19T10:00:00-05:00", "fuente_url": "https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777"},
]

LIMA_AUTOCONV_22 = {
    "id": "LIMA-AUTO-22JUN",
    "fecha": "2026-06-22T16:00:00-05:00",
    "titulo": "Autoconvocatoria Plaza San Martín (no verificada)",
    "ubicacion": "Plaza San Martín, Centro Histórico, Lima",
    "tipo": "marcha",
    "bando": "pro_sanchez",
    "estado": "no_verificada",
    "probabilidad_realizacion": 0.40,
    "participantes_est": "500-3000",
    "magnitud_codigo": "S",
    "magnitud_confianza": "baja",
    "fuente_url": "https://www.instagram.com/reel/DZQNoG-pSIU/",
    "fuente_nombre": "Instagram reel autoconvocatoria (sin respaldo JP oficial)",
    "notas": "Reel vigente; sin comunicado partidario JP. MML mantiene restricción Centro Histórico hasta 22-jun.",
    "es_pasado": False,
}


def patch_marcha_lima_19(data):
    lima = data["regions"]["lima"]
    for c in lima.get("convocatorias_futuras", []):
        nombre = c.get("nombre") or c.get("titulo") or ""
        if "Campo de Marte" in nombre or "19" in str(c.get("fecha", "")) and "marcha" in nombre.lower():
            c["estado"] = "realizada"
            c["es_pasado"] = True
            c["ubicacion_real"] = "Paseo Colón / Centro Histórico (no Campo de Marte)"
            c["participantes_est"] = 600
            c["participantes_rango"] = [350, 900]
            c["magnitud_codigo"] = "S"
            c["magnitud_confianza"] = "media"
            c["probabilidad_realizacion"] = 1.0
            c["ruta_real"] = "Local JP av. 9 de Diciembre/Paseo Colón → Bolognesi → Alfonso Ugarte → Piérola/Garcilaso → retorno"
            c["notas"] = (
                "Ejecutada 19-jun pacífica; cientos de asistentes (RPP, LR, Infobae). "
                "Sánchez encabezó desde Paseo Colón, NO Campo de Marte. PNP +7.000. "
                "MML restricción Centro Histórico hasta 22-jun."
            )
            c["fuente_ejecucion"] = "https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850"
    # mark vigilias 17-jun past
    for c in lima.get("convocatorias_futuras", []):
        if "17" in str(c.get("fecha", "")) and ("vigilia" in (c.get("nombre") or "").lower() or "plantón" in (c.get("tipo") or "").lower()):
            c["es_pasado"] = True
            c["estado"] = "realizada_parcial"
    cf = lima.get("convocatorias_futuras", [])
    if not any(x.get("id") == LIMA_AUTOCONV_22["id"] for x in cf):
        cf.append(LIMA_AUTOCONV_22)
    lima["convocatorias_futuras"] = cf


def patch_pariahuanca(data):
    centro = data["regions"]["centro"]
    for c in centro.get("convocatorias_futuras", []):
        if "Pariahuanca" in (c.get("nombre") or c.get("titulo") or ""):
            c["es_pasado"] = True
            c["estado"] = "realizada_parcial"
            c["participantes_est"] = 400
            c["participantes_rango"] = [200, 600]
            c["magnitud_codigo"] = "S"
            c["notas"] = (
                "Marcha ~10.000 NO materializada. Protesta estacionaria GORE Huancayo 18-19-jun; "
                "acta compromisos firmada 19-jun 19:49 (RPP)."
            )


def patch_rutas(data):
    rutas = data.get("rutas_recurrentes_v370", [])
    for r in rutas:
        if "Campo de Marte" in (r.get("descripcion") or ""):
            r["descripcion"] = "Paseo Colón → Centro Histórico → av. Alfonso Ugarte (marcha JP 19-jun REAL)"
            r["patron_historico"] = "Convocado Campo de Marte; ejecutado Paseo Colón 19-jun 2026. Precedente 13-jun Plaza San Martín."
            r["probabilidad_uso"] = 0.25
            r["notas_19jun"] = "Campo de Marte vacío como epicentro el 19-jun."
    if not any("Paseo Colón" in (r.get("descripcion") or "") for r in rutas):
        rutas.insert(0, {
            "descripcion": "Paseo Colón → Bolognesi → Alfonso Ugarte → Piérola/Garcilaso (marcha JP 19-jun)",
            "frecuencia_en_dossier": 1,
            "distritos": ["Cercado de Lima", "Breña", "Lima"],
            "bando_predominante": "pro-S / JP",
            "patron_historico": "Ruta real verificada marcha 19-jun; ~350-900 participantes.",
            "probabilidad_uso": 0.30,
            "fuente": "https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850",
        })
    data["rutas_recurrentes_v370"] = rutas


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    data["meta"]["version"] = "3.9.0"
    data["meta"]["generated_at"] = CORTE
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["window"] = "19–26 junio 2026 (post-2da vuelta · corte 99,63% escrutado · margen 41.565 votos)"
    data["meta"]["last_refresh_summary"] = (
        "v3.9.0 — 3 rondas research granular: ONPE 99,63%/+41.565; marcha JP 19-jun ejecutada "
        "(Paseo Colón, 350-900); Ilave inactivo; Pariahuanca desescalado con acta GORE; "
        "Procuraduría denuncia 9 convocantes; JNE nulidad 2.408 actas pendiente; "
        "Piura 23-jun vigente; magnitud OSINT multi-fuente."
    )

    ea = data["executive_alert"]
    ea["headline"] = (
        "Fujimori +41.565 votos al 99,63% actas; marcha JP 19-jun ejecutada (cientos, pacífica); "
        "JNE evalúa nulidad 2.408 actas; Procuraduría denuncia 9 convocantes"
    )
    ea["key_finding"] = (
        "Margen +41.565 votos al 99,63% ([El Comercio](https://elcomercio.pe/politica/elecciones/resultados-onpe-en-vivo-entre-keiko-fujimori-y-roberto-sanchez-por-la-presidencia-del-peru-segunda-vuelta-lbposting-noticia/), 19-jun 20:43 PET). "
        "Marcha JP **realizada** 19-jun desde Paseo Colón (no Campo de Marte): cientos, sin incidentes graves ([RPP](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850)). "
        "346 actas en JEE (↓ desde 878). JNE sustentó evaluación nulidad 2.408 actas; **resolución no publicada** al corte. "
        "Procuraduría denunció penalmente a 9 convocantes (no incluye Sánchez) ([RPP](https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848)). "
        "Ilave **sin bloqueo activo** verificado. Pariahuanca: acta GORE 19-jun. Piura arrocera **23-jun** confirmada."
    )
    ea["top_risks_24_72h"] = [
        "Resolución JNE nulidad 2.408 actas Lima/EE.UU. (Prob 0,70, Impacto CRÍTICO)",
        "Movilización arrocera Piura 23-jun (Prob 0,65, Impacto ALTO)",
        "Autoconvocatoria Instagram 22-jun Plaza San Martín (Prob 0,40, Impacto MEDIO)",
        "Reactivación bloqueo Ilave post-proclamación (Prob 0,40, Impacto ALTO)",
        "Amparo PJ voto exterior sin resolución (Prob 0,15, Impacto CRÍTICO)",
    ]

    ctx = data.setdefault("context", {})
    ctx.setdefault("election_state", {}).update({
        "scrutinized_pct": "99,63 %",
        "fujimori_pct": "50,113 %",
        "sanchez_pct": "49,887 %",
        "difference_votes": "+41.565 votos (pro-Fujimori)",
    })

    er = data.setdefault("escrutinio_realtime", {})
    er["fecha_corte"] = CORTE
    er["cifras_actuales"] = {
        "pct_actas": "99.63%",
        "votos_F": 9183280,
        "votos_S": 9141715,
        "margen_actual": 41565,
        "favorece": "F",
        "actas_jee_pendientes": 346,
        "fuente_primaria": "https://elcomercio.pe/politica/elecciones/resultados-onpe-en-vivo-entre-keiko-fujimori-y-roberto-sanchez-por-la-presidencia-del-peru-segunda-vuelta-lbposting-noticia/",
        "hora_corte": "19-jun 20:43 PET",
        "notas": "346 actas en JEE. JNE nulidad 2.408 actas: audiencia sustentada 19-jun, resolución pendiente. Amparo PJ sin resolución.",
    }
    osc = er.get("oscilacion_intra_periodo", [])
    if not any(o.get("margen") == 41565 for o in osc):
        osc.append({
            "hora_PET": "2026-06-19 20:43",
            "margen": 41565,
            "favorece": "F",
            "actas_pct": "99,63%",
            "fuente": "https://elcomercio.pe/politica/elecciones/resultados-onpe-en-vivo-entre-keiko-fujimori-y-roberto-sanchez-por-la-presidencia-del-peru-segunda-vuelta-lbposting-noticia/",
        })
    er["oscilacion_intra_periodo"] = osc
    er["jne_nulidad_2408"] = {
        "audiencia_19jun": "sustentada",
        "resolucion_19jun": "no_confirmada",
        "plazo_estimado": "semana 23-27-jun",
        "actas_disputa": 2408,
        "votos_en_juego_est": 43577,
    }

    bluf = data["bluf"]
    bluf["kpis"] = [
        {"label": "Margen actual", "value": "+41.565 votos", "sub": "99,63 % actas · pro-Fujimori", "tone": "red"},
        {"label": "Margen proyectado", "value": "+44.800", "sub": "IC95 [+38.200; +51.400]", "tone": "red"},
        {"label": "Prob. Fujimori", "value": "99,4 %", "sub": "vs Sánchez 0,5 % · empate 0,01 %", "tone": "red"},
        {"label": "Convocatorias 7d", "value": "142", "sub": "Piura 23-jun · autoconv. 22-jun incierta", "tone": "amber"},
        {"label": "P(movilización nacional)", "value": "32 %", "sub": "rebaja post-marcha 19-jun pacífica", "tone": "amber"},
        {"label": "Actas JEE", "value": "346", "sub": "↓ desde 878 · nulidad 2.408 pendiente", "tone": "amber"},
    ]
    bluf["manifestaciones_criticas_top"] = [
        {
            "nombre": "Marcha JP 19-jun — realizada (Paseo Colón)",
            "region": "lima", "fecha": "2026-06-19T16:00:00-05:00",
            "ubicacion": "Paseo Colón / Centro Histórico", "side": "pro-Sánchez",
            "estado": "realizada", "riesgo": "bajo", "es_pasado": True,
            "cross_ref": "@RobertoSanchP; #MarchaEnDefensaDeLaDemocracia",
            "magnitud": "350-900 (cientos)",
        },
        {
            "nombre": "Acampamento JNE — ~80 carpas activo",
            "region": "lima", "fecha": "2026-06-16T10:00:00-05:00",
            "ubicacion": "JNE, jr. Nazca, Jesús María", "side": "pro-Sánchez",
            "estado": "activo", "riesgo": "medio",
            "cross_ref": "#AcampamentoJNE; RPP",
            "magnitud": "50-150 personas",
        },
        {
            "nombre": "JNE nulidad 2.408 actas — resolución pendiente",
            "region": "nacional", "fecha": "2026-06-19T10:00:00-05:00",
            "ubicacion": "JNE, Lima", "side": "institucional",
            "estado": "en curso", "riesgo": "alto",
            "cross_ref": "Roy Mendoza; #583PatronesAnomalos",
        },
        {
            "nombre": "Movilización arrocera Piura — 23-jun",
            "region": "norte", "fecha": "2026-06-23T08:00:00-05:00",
            "ubicacion": "Piura-Sechura / posible El Trébol", "side": "gremial",
            "estado": "convocado", "riesgo": "alto",
            "cross_ref": "Conveagro; Norte Sostenible",
            "magnitud": "500-5000 (proyectado M)",
        },
        {
            "nombre": "Puente Ilave — inactivo (no verificado 19-jun)",
            "region": "sur", "fecha": "2026-06-12T00:00:00-05:00",
            "ubicacion": "Puente Internacional Ilave, Puno", "side": "pro-Sánchez",
            "estado": "inactivo", "riesgo": "medio", "es_pasado": True,
            "cross_ref": "Lucio Ccallo; CNUL",
            "nota": "Convocado 11-jun; delegaciones puneñas en Lima 19-jun",
        },
        {
            "nombre": "Pariahuanca/GORE Junín — acta firmada 19-jun",
            "region": "centro", "fecha": "2026-06-19T19:49:00-05:00",
            "ubicacion": "GORE Junín, Huancayo", "side": "ambiental-gremial",
            "estado": "desescalado", "riesgo": "bajo", "es_pasado": True,
            "cross_ref": "#AguaSiMinaNo",
            "magnitud": "200-600 (no 10.000)",
        },
    ]
    bluf["forecast_one_liner"] = (
        "Modelo ML proyecta margen final +44.800 votos pro-Fujimori (IC95 [+38.200; +51.400]). "
        "P(Fujimori)=99,4 %. Riesgo residual: resolución JNE nulidad 2.408 actas (~43.577 votos en juego)."
    )
    bluf["three_things_to_watch"] = [
        {
            "titulo": "Resolución JNE sobre nulidad 2.408 actas (Lima + EE.UU.)",
            "detalle": "Audiencia sustentada 19-jun por Roy Mendoza; ~43.577 votos en juego vs margen +41.565. Resolución estimada semana 23-27-jun (no confirmada al corte 20:43).",
        },
        {
            "titulo": "Denuncia Procuraduría vs. 9 convocantes de marchas",
            "detalle": "Denuncia penal 19-jun por art. 315-A CP; incluye Cevallos, Ccallo, Antauro. Sánchez excluido y rechazó denuncia públicamente.",
        },
        {
            "titulo": "Movilización arrocera Piura 23-jun y autoconvocatoria 22-jun",
            "detalle": "Conveagro confirma movilización 23-jun; riesgo escalada El Trébol P=0,65. Autoconvocatoria Instagram 22-jun sin respaldo JP (P=0,40).",
        },
    ]

    fml = data["forecast_ml"]
    fml["subtitulo"] = "Modelo ensemble · corte 19-jun 20:43 PET · 99,63% actas"
    fml["punto_central"]["margen_final_votos"] = 44800
    fml["intervalos_confianza"]["ic_95"] = [38200, 51400]
    prob = fml.setdefault("probabilidad_victoria", {})
    prob["fujimori"] = 0.994
    prob["sanchez"] = 0.005
    prob["empate"] = 0.0001

    p7 = data["prediccion_7dias"]
    p7["fecha_inicio"] = "2026-06-19"
    p7["fecha_fin"] = "2026-06-26"
    p7["nota_metodologica"] = "v3.9: marcha JP 19-jun ejecutada pacífica; Ilave inactivo; Pariahuanca desescalado; Piura 23-jun vigente."
    p7["lima"]["prob_manifestacion_significativa"] = 0.45
    p7["lima"]["prob_escalada_violenta"] = 0.22
    p7["lima"]["justificacion"] = "Marcha 19-jun realizada pacífica (cientos). Autoconvocatoria 22-jun incierta. Acampamento JNE continúa."
    p7["sur"]["prob_bloqueo_ilave_activo"] = 0.40
    p7["sur"]["justificacion"] = "Ilave inactivo 19-jun; delegaciones en Lima. Riesgo reactivación post-proclamación."
    p7["centro"]["prob_manifestacion_significativa"] = 0.35
    p7["centro"]["justificacion"] = "Pariahuanca desescalado con acta GORE 19-jun. Seguimiento cumplimiento 20-23-jun."
    p7["norte"]["prob_bloqueo_panamericana_norte"] = 0.25
    p7["norte"]["justificacion"] = "Piura movilización 23-jun confirmada; El Trébol riesgo escalada P=0,65."

    patch_marcha_lima_19(data)
    patch_pariahuanca(data)
    patch_rutas(data)

    for ew in data.get("early_warning_indicators", []):
        if ew.get("id") == "EW-20":
            ew["value"] = "0 bloqueos confirmados · Ilave inactivo 19-jun"
            ew["estado"] = "verde"
            ew["rationale"] = "Ilave sin bloqueo verificado. La Oroya transitable. Federico Basadre/FB Terry inactivos."
        if ew.get("id") == "EW-23":
            ew["value"] = "Presentado 16-jun · sin resolución PJ 19-jun"
            ew["estado"] = "amarillo"
        if ew.get("id") == "EW-19":
            ew["value"] = "Marcha 19-jun realizada · sin CGTP 17-jun"
            ew["estado"] = "amarillo"

    dis = data.get("disinformation_cases", [])
    ids = {d.get("id") for d in dis}
    for nd in NEW_DISINFO:
        if nd["id"] not in ids:
            dis.append(nd)
    data["disinformation_cases"] = dis

    si = data.get("social_intelligence", {})
    ht = si.get("hashtags_trending", si.get("hashtags", []))
    tags = {h.get("tag") for h in ht if isinstance(h, dict)}
    for nh in NEW_HASHTAGS:
        if nh["tag"] not in tags:
            ht.append(nh)
    if "hashtags_trending" in si:
        si["hashtags_trending"] = ht
    else:
        si["hashtags"] = ht

    data["magnitude_methodology"] = {
        "version": "1.0",
        "doc": "research/methodology/magnitude_estimation.md",
        "composite_weights": {"terreno": 0.35, "medios": 0.25, "social": 0.20, "movilizadora": 0.20},
    }

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("v3.9.0 written")


if __name__ == "__main__":
    main()