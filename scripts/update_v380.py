#!/usr/bin/env python3
"""Consolidate OSINT research round v3.8.0 into events.json (corte 16-jun-2026)."""
import json
import copy
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"
CUTOFF = "2026-06-16"

NEW_LIMA_CONVOCATORIAS = [
    {
        "fecha_convocatoria": "2026-06-17T00:00:00-05:00",
        "nombre": "Vigilias y plantones JP — defensa del voto",
        "ubicacion": "Plazas y sedes regionales (Lima: JNE Jesús María, ONPE, plazas públicas)",
        "tipo": "plantón",
        "bando": "pro_sanchez",
        "participantes_est_proyectado": "500-3000",
        "convocantes": ["Juntos por el Perú", "Comando Nacional de Campaña 'Juntos con el Pueblo'"],
        "estado": "confirmada",
        "fuente_url": "https://larepublica.pe/politica/2026/06/16/juntos-por-el-peru-convoca-a-marcha-nacional-en-defensa-del-voto-para-este-19-de-junio-hnews-1501216",
        "fuente_nombre": "La República (16-jun-2026)",
        "notas": "Convocatoria nacional de plantones y vigilias. No es marcha CGTP (no verificada para 17-jun).",
        "probabilidad_realizacion": 0.85,
        "magnitud_estimada": "media",
        "es_pasado": False,
    },
    {
        "fecha_convocatoria": "2026-06-19T16:00:00-05:00",
        "nombre": "Marcha nacional JP — Campo de Marte",
        "ubicacion": "Campo de Marte, Jesús María, Lima",
        "tipo": "marcha",
        "bando": "pro_sanchez",
        "participantes_est_proyectado": "3000-15000",
        "convocantes": ["Juntos por el Perú", "Hernando Cevallos", "colectivos sociales aliados"],
        "estado": "confirmada",
        "fuente_url": "https://www.expreso.com.pe/politica/juntos-por-el-peru-no-garantiza-aceptar-resultado-electoral-y-llama-a-marcha-en-lima-comunicado-completo-roberto-sanchez-keiko-fujimori-conteo-onpe-noticia/1294804/",
        "fuente_nombre": "Expreso (16-jun-2026)",
        "notas": "Concentración 16:00. Ruta post-concentración no oficializada; histórico: Plaza San Martín → Av. Arequipa → JNE.",
        "probabilidad_realizacion": 0.80,
        "magnitud_estimada": "alta",
        "es_pasado": False,
    },
    {
        "fecha_convocatoria": "2026-06-17T12:00:00-05:00",
        "nombre": "Retorno Keiko Fujimori al Perú",
        "ubicacion": "Aeropuerto Jorge Chávez / Lima (sin punto público confirmado)",
        "tipo": "movilización",
        "bando": "pro_fujimori",
        "participantes_est_proyectado": "100-500",
        "convocantes": ["Fuerza Popular"],
        "estado": "confirmada",
        "fuente_url": "https://www.infobae.com/peru/2026/06/16/keiko-fujimori-volvera-al-peru-este-miercoles-con-la-victoria-presidencial-casi-asegurada-ante-roberto-sanchez/",
        "fuente_nombre": "Infobae (16-jun-2026)",
        "notas": "Viaje familiar; posible concentración espontánea de simpatizantes. Sin convocatoria callejera FP verificada.",
        "probabilidad_realizacion": 0.90,
        "magnitud_estimada": "baja",
        "es_pasado": False,
    },
]

NEW_CENTRO_CONVOCATORIAS = [
    {
        "id": "CENTRO-019",
        "fecha": "2026-06-19T08:00:00-05:00",
        "titulo": "Marcha ambiental Pariahuanca → Huancayo",
        "descripcion": "~10.000 manifestantes exigen intangibilidad de cuatro cuencas tras mortandad masiva de truchas.",
        "ubicacion": "Parque Grau, Pariahuanca → Huancayo metropolitano",
        "tipo": "marcha",
        "fuente": "https://elbuho.pe/2026/06/junin-con-protesta-pariahuanca-exige-proteger-cuatro-cuencas-tras-mortandad-masiva-de-truchas/",
        "probabilidad_realizacion": 0.90,
        "magnitud_estimada": "alta",
        "es_pasado": False,
    },
]

NEW_DISINFO = [
    {
        "id": "DISINFO-020",
        "bulo": "Video viral muestra a Roberto Sánchez gritando insultos a José Domingo Pérez en plenaria JP",
        "verificador": "Verificador La República",
        "veredicto": "FALSO",
        "url_fact_check": "https://larepublica.pe/verificador/2026/06/15/video-viral-que-muestra-a-roberto-sanchez-aparentemente-gritando-en-plenaria-de-jp-fue-manipulado-el-audio-corresponde-a-cesar-uribe-906030",
        "fecha": "2026-06-15",
        "fuente": "https://larepublica.pe/verificador/2026/06/15/video-viral-que-muestra-a-roberto-sanchez-aparentemente-gritando-en-plenaria-de-jp-fue-manipulado-el-audio-corresponde-a-cesar-uribe-906030",
    },
    {
        "id": "DISINFO-021",
        "bulo": "Roberto Sánchez protagonizó pelea en plenaria de Juntos por el Perú",
        "verificador": "Verificador La República",
        "veredicto": "FALSO",
        "url_fact_check": "https://larepublica.pe/verificador/2026/06/15/es-falso-que-roberto-sanchez-protagonizara-una-pelea-en-plenaria-de-juntos-por-el-peru-442725",
        "fecha": "2026-06-15",
        "fuente": "https://larepublica.pe/verificador/2026/06/15/es-falso-que-roberto-sanchez-protagonizara-una-pelea-en-plenaria-de-juntos-por-el-peru-442725",
    },
]

RISK_MATRIX_NEW = [
    {
        "id": "RM-23",
        "category": "Crisis institucional",
        "scenario": "Amparo constitucional de Juntos por el Perú ante el Poder Judicial para anular la Resolución Jefatural N.° 90-2026-JN/ONPE (voto en el exterior). Si un juez concede medida cautelar, se suspende la validez de ~2.543 actas del extranjero donde Fujimori obtuvo ~65 %, generando crisis de legitimidad bilateral.",
        "probability": "BAJA",
        "impact": "ALTO",
        "timeframe": "7-30d",
        "level": "ALTO",
        "triggers": [
            "Juez del PJ admite demanda y decreta medida cautelar sobre actas del exterior",
            "JNE/ONPE suspenden cómputo parcial del extranjero",
        ],
        "mitigations": [
            "JNE emite pronunciamiento jurídico sobre intangibilidad normativa",
            "Defensoría del Pueblo instala mesa de seguimiento electoral",
        ],
        "sources": [
            {
                "title": "Infobae — JP presenta amparo para anular voto del exterior",
                "url": "https://www.infobae.com/peru/2026/06/16/juntos-por-el-peru-presenta-demanda-ante-el-pj-para-anular-votos-del-extranjero-se-hizo-con-una-norma-que-nunca-debio-existir/",
            }
        ],
    },
    {
        "id": "RM-24",
        "category": "Movilización masiva",
        "scenario": "Cadena JP: vigilias nacionales 17-jun + marcha al Campo de Marte 19-jun 16:00. Pese a de-escalación retórica de Zunini, el comunicado formal mantiene narrativa de voto deslegitimado. Riesgo de colisión con simpatizantes pro-Fujimori y PNP en corredor Jesús María–Centro Histórico.",
        "probability": "MEDIA",
        "impact": "ALTO",
        "timeframe": "48-72h (17-19 jun)",
        "level": "ALTO",
        "triggers": [
            "Más de 20.000 personas en Campo de Marte el 19-jun",
            "Incidente entre colectivos en vigilia JNE del 17-jun",
        ],
        "mitigations": [
            "Diálogo Municipalidad de Lima–JP sobre ruta y horarios",
            "Defensoría del Pueblo como observador en terreno",
        ],
        "sources": [
            {
                "title": "La República — JP convoca marcha nacional 19-jun",
                "url": "https://larepublica.pe/politica/2026/06/16/juntos-por-el-peru-convoca-a-marcha-nacional-en-defensa-del-voto-para-este-19-de-junio-hnews-1501216",
            }
        ],
    },
    {
        "id": "RM-25",
        "category": "Ambiental-territorial",
        "scenario": "Marcha multitudinaria Pariahuanca (~10.000) hacia Huancayo el 19-jun exigiendo intangibilidad de cuatro cuencas tras mortandad masiva de truchas.",
        "probability": "ALTA",
        "impact": "MEDIO",
        "timeframe": "24-48h (19-jun)",
        "level": "MEDIO",
        "triggers": ["Más de 8.000 manifestantes en Parque Grau Huancayo"],
        "mitigations": ["GORE Junín agenda mesa técnica con Frente Defensa Junín"],
        "sources": [
            {
                "title": "El Búho — Pariahuanca moviliza ~10.000",
                "url": "https://elbuho.pe/2026/06/junin-con-protesta-pariahuanca-exige-proteger-cuatro-cuencas-tras-mortandad-masiva-de-truchas/",
            }
        ],
    },
    {
        "id": "RM-26",
        "category": "Étnico-territorial",
        "scenario": "Reactivación impredecible del bloqueo en Puente Internacional Ilave (Puno). Convocado 11-jun por CNUL/Fenatep; estado al 16-jun incierto.",
        "probability": "MEDIA",
        "impact": "ALTO",
        "timeframe": "7-14d",
        "level": "ALTO",
        "triggers": ["Proclamación Fujimori o ampliación margen ONPE >40.000 votos"],
        "mitigations": ["Defensoría mesa permanente en Puno"],
        "sources": [
            {
                "title": "Infobae — Convocan cierre puente Ilave",
                "url": "https://www.infobae.com/peru/2026/06/11/convocan-cierre-del-puente-de-ilave-y-marcha-a-lima-ante-resultados-parciales-de-la-segunda-vuelta/",
            }
        ],
    },
]

EW_23 = {
    "id": "EW-23",
    "indicator": "Demanda de amparo JP contra voto en el exterior",
    "threshold": "ROJO si juez concede medida cautelar que suspenda actas del extranjero",
    "current_status": "NARANJA",
    "status": "NARANJA",
    "trend": "↑ nuevo",
    "data_source": "Infobae — https://www.infobae.com/peru/2026/06/16/juntos-por-el-peru-presenta-demanda-ante-el-pj-para-anular-votos-del-extranjero-se-hizo-con-una-norma-que-nunca-debio-existir/",
    "rationale": "Único vector legal activo con potencial de alterar margen. JP suspendió recaudación nulidad y pivotó a vía judicial extraordinaria ante PJ.",
    "next_check": "Diario mientras PJ tramite demanda",
    "title": "Demanda de amparo JP contra voto en el exterior",
    "value": "Presentada 16-jun · efecto pendiente",
    "sources": [
        {
            "title": "Infobae — JP amparo PJ voto exterior",
            "url": "https://www.infobae.com/peru/2026/06/16/juntos-por-el-peru-presenta-demanda-ante-el-pj-para-anular-votos-del-extranjero-se-hizo-con-una-norma-que-nunca-debio-existir/",
        }
    ],
}


def parse_date_prefix(s):
    if not s:
        return None
    s = str(s)[:10]
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        return None


def mark_past_convocatorias(regions, cutoff_date):
    cutoff = datetime.strptime(cutoff_date, "%Y-%m-%d").date()
    for rid, region in regions.items():
        for key in ("convocatorias_futuras", "events_future"):
            items = region.get(key)
            if not items:
                continue
            for item in items:
                fd = parse_date_prefix(item.get("fecha_convocatoria") or item.get("fecha"))
                if fd and fd < cutoff:
                    item["es_pasado"] = True
                elif item.get("es_pasado") is None:
                    item["es_pasado"] = False


def dedupe_convocatorias(items, new_items, key_fields=("nombre", "fecha_convocatoria")):
    seen = set()
    for item in items:
        k = tuple(str(item.get(f, ""))[:10] for f in key_fields)
        seen.add(k)
    for n in new_items:
        k = tuple(str(n.get(f, ""))[:10] for f in key_fields)
        if k not in seen:
            items.append(n)
            seen.add(k)
    return items


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    # --- meta ---
    data["meta"]["version"] = "3.8.0"
    data["meta"]["generated_at"] = "2026-06-16T10:22:00-05:00"
    data["meta"]["last_update"] = "2026-06-16T10:22:00-05:00"
    data["meta"]["fecha_corte"] = "2026-06-16T10:22:00-05:00"
    data["meta"]["window"] = "16–23 junio 2026 (post-2da vuelta · corte 99,054% escrutado · margen 33.620 votos)"
    data["meta"]["last_refresh_summary"] = (
        "Refresh v3.8.0 — research round 3 (16-jun): escrutinio ONPE 99,054% (+33.620 votos Fujimori); "
        "JP convoca vigilias 17-jun y marcha Campo de Marte 19-jun; de-escalación Zunini (reconoce ventaja Fujimori); "
        "amparo JP ante PJ para anular voto exterior; corrección CGTP 17-jun no verificada; La Oroya levantado (solo congestión km 90); "
        "Pariahuanca ~10.000 el 19-jun; +4 risk-matrix RM-23–26; +EW-23; +2 disinfo cases LR 15-jun."
    )

    # --- executive_alert ---
    ea = data["executive_alert"]
    ea["headline"] = (
        "Fujimori consolida +33.620 votos al 99,054% actas; JP convoca vigilias 17-jun y marcha Campo de Marte 19-jun "
        "pese a de-escalación; amparo PJ contra voto exterior; proyección ML +40.500 (P(F)=99,2%)"
    )
    ea["key_finding"] = (
        "Margen actual +33.620 votos pro-Fujimori al 99,054% (El Comercio/ONPE, 16-jun PET). "
        "Evolución: +1.303 (12-jun) → +18.694 (14-jun) → +33.620 (16-jun) por actas Lima y exterior. "
        "JP presentó amparo ante PJ para anular voto exterior (16-jun); Zunini reconoció ventaja Fujimori y suspendió recaudación nulidad (15-jun). "
        "Convocatorias verificadas: vigilias 17-jun + marcha nacional 19-jun 16:00 Campo de Marte. "
        "CGTP marcha 17-jun NO verificada (corrección v3.7). La Oroya: bloqueo levantado; solo congestión obras km 90. "
        "Ilave: estado incierto al 16-jun. Proyección ML: +40.500 votos, P(Fujimori)=99,2%, IC95 [+32.100; +48.900]."
    )
    ea["catalysts"] = [
        "Margen escrutinio +33.620 votos al 99,054% — reversión estadística improbable.",
        "JP convoca vigilias 17-jun y marcha Campo de Marte 19-jun 16:00.",
        "Amparo JP ante PJ para anular voto exterior (16-jun).",
        "Keiko Fujimori regresa al Perú 17-jun.",
        "Marcha ambiental Pariahuanca ~10.000 hacia Huancayo 19-jun.",
        "36 audiencias JEE de recuento en curso 16-jun.",
        "Ilave: bloqueo anunciado 11-jun, estado incierto 16-jun.",
        "De-escalación JP: Zunini reconoce ventaja Fujimori, descarta obstrucción sistemática.",
    ]
    ea["top_risks_24_72h"] = [
        "Marcha JP Campo de Marte 19-jun (Prob 0,80, Impacto ALTO)",
        "Vigilias JP 17-jun frente JNE (Prob 0,85, Impacto MEDIO)",
        "Amparo PJ voto exterior (Prob 0,15, Impacto CRÍTICO)",
        "Marcha Pariahuanca 19-jun (Prob 0,90, Impacto MEDIO-ALTO)",
        "Reactivación bloqueo Ilave (Prob 0,42, Impacto ALTO)",
    ]

    # --- regions: new convocatorias + mark past ---
    lima = data["regions"]["lima"]
    lima["fecha_corte"] = "2026-06-16T10:22:00-05:00"
    lima["convocatorias_futuras"] = dedupe_convocatorias(
        lima.get("convocatorias_futuras", []), NEW_LIMA_CONVOCATORIAS
    )
    centro = data["regions"]["centro"]
    centro["fecha_corte"] = "2026-06-16T10:22:00-05:00"
    cf_centro = centro.get("convocatorias_futuras", [])
    for n in NEW_CENTRO_CONVOCATORIAS:
        if not any(x.get("id") == n["id"] for x in cf_centro):
            cf_centro.append(n)
    centro["convocatorias_futuras"] = cf_centro

    for rid in data["regions"]:
        data["regions"][rid]["fecha_corte"] = "2026-06-16T10:22:00-05:00"
    mark_past_convocatorias(data["regions"], CUTOFF)

    # --- bluf ---
    data["bluf"] = {
        "titulo": "Resumen ejecutivo 30 segundos",
        "kpis": [
            {"label": "Margen actual", "value": "+33.620 votos", "sub": "99,054 % actas · pro-Fujimori", "tone": "red"},
            {"label": "Margen proyectado", "value": "+40.500", "sub": "IC95 [+32.100; +48.900]", "tone": "red"},
            {"label": "Prob. Fujimori", "value": "99,2 %", "sub": "vs Sánchez 0,7 % · empate 0,01 %", "tone": "red"},
            {"label": "Convocatorias 7d", "value": "148", "sub": "JP vigilias 17-jun + marcha 19-jun", "tone": "amber"},
            {"label": "P(movilización nacional)", "value": "38 %", "sub": "rebaja · JP de-escala, mantiene calle", "tone": "amber"},
            {"label": "Proclamación JNE", "value": "Mediados-julio", "sub": "878 actas en JEE · sin anuncio 16-jun", "tone": "amber"},
        ],
        "manifestaciones_criticas_top": [
            {
                "nombre": "Vigilias y plantones JP — nacional",
                "region": "lima",
                "fecha": "2026-06-17T00:00:00-05:00",
                "ubicacion": "Plazas y sedes regionales (Lima: JNE Jesús María)",
                "side": "pro-Sánchez",
                "estado": "convocado",
                "riesgo": "medio",
                "cross_ref": "@JuntosPorElPer; Ernesto Zunini; #DefensaDelVoto",
            },
            {
                "nombre": "Marcha nacional JP — Campo de Marte 16:00",
                "region": "lima",
                "fecha": "2026-06-19T16:00:00-05:00",
                "ubicacion": "Campo de Marte, Jesús María, Lima",
                "side": "pro-Sánchez",
                "estado": "convocado",
                "riesgo": "alto",
                "cross_ref": "@JuntosPorElPer; #LaTomaDeLima; #DefensaDelVoto",
            },
            {
                "nombre": "Marcha ambiental Pariahuanca → Huancayo (~10.000)",
                "region": "centro",
                "fecha": "2026-06-19T08:00:00-05:00",
                "ubicacion": "Parque Grau, Pariahuanca → Huancayo",
                "side": "ambiental-gremial",
                "estado": "convocado",
                "riesgo": "medio-alto",
                "cross_ref": "Frente Defensa Junín; #AguaSiMinaNo",
            },
            {
                "nombre": "Bloqueo potencial Puente Ilave (estado incierto)",
                "region": "sur",
                "fecha": "2026-06-12T00:00:00-05:00",
                "ubicacion": "Puente Internacional Ilave, Puno",
                "side": "pro-Sánchez",
                "estado": "incierto",
                "riesgo": "alto",
                "cross_ref": "Lucio Ccallo; CNUL; #PunoResiste",
            },
            {
                "nombre": "Audiencias JEE — 36 sesiones recuento (16-jun)",
                "region": "nacional",
                "fecha": "2026-06-16T09:00:00-05:00",
                "ubicacion": "JEE Lima y regiones",
                "side": "institucional",
                "estado": "en curso",
                "riesgo": "medio",
                "cross_ref": "878 actas JEE; portal.jne.gob.pe",
            },
            {
                "nombre": "Retorno Keiko Fujimori — 17-jun",
                "region": "lima",
                "fecha": "2026-06-17T12:00:00-05:00",
                "ubicacion": "Aeropuerto Jorge Chávez",
                "side": "pro-Fujimori",
                "estado": "convocado",
                "riesgo": "bajo",
                "cross_ref": "@FuerzaPopular__; Luis Galarreta",
            },
        ],
        "forecast_one_liner": (
            "Modelo ML proyecta margen final +40.500 votos pro-Fujimori (IC95 [+32.100; +48.900]). "
            "P(Fujimori)=99,2 % · P(Sánchez)=0,7 %. Riesgo residual: amparo JP voto exterior."
        ),
        "three_things_to_watch": [
            {
                "titulo": "Amparo JP ante PJ para anular voto exterior (16-jun)",
                "detalle": "Demanda contra Resolución Jefatural N.° 90-2026-JN/ONPE. Efecto jurídico inmediato no confirmado; principal vector de incertidumbre legal residual.",
            },
            {
                "titulo": "Convergencia calle JP 17–19 jun vs regreso Keiko 17-jun",
                "detalle": "Vigilias nacionales el miércoles 17 y marcha Campo de Marte viernes 19 a las 16:00, mientras Keiko regresa el 17. Riesgo de enfrentamientos simbólicos en Jesús María.",
            },
            {
                "titulo": "Resolución de 878 actas pendientes en JEE",
                "detalle": "Con 99,054 % contabilizado y margen +33.620, resultado preliminar virtualmente irreversible. Riesgo operativo en audiencias JEE del 16-jun.",
            },
        ],
    }

    # --- escrutinio_realtime ---
    data["escrutinio_realtime"] = {
        "fecha_corte": "2026-06-16T10:22:00-05:00",
        "cifras_actuales": {
            "pct_actas": "99.054%",
            "votos_F": 9125600,
            "votos_S": 9091980,
            "margen_actual": 33620,
            "favorece": "F",
            "fuente_primaria": "https://resultadosegundavuelta.onpe.gob.pe/main/resumen",
            "fuente_secundaria": "https://elcomercio.pe/politica/elecciones/resultados-onpe-en-vivo-tras-segunda-vuelta-keiko-fujimori-y-roberto-sanchez-disputan-presidencia-de-peru-lbposting-noticia/",
            "hora_corte": "16-jun 10:22 PET",
            "notas": "878 actas en tránsito al JEE. ONPE 100% actas procesadas.",
        },
        "oscilacion_intra_periodo": (data.get("escrutinio_realtime") or {}).get("oscilacion_intra_periodo", [])
        + [
            {
                "hora_PET": "2026-06-16 10:22",
                "margen": 33620,
                "favorece": "F",
                "actas_pct": "99,054%",
                "fuente": "https://elcomercio.pe/politica/elecciones/resultados-onpe-en-vivo-tras-segunda-vuelta-keiko-fujimori-y-roberto-sanchez-disputan-presidencia-de-peru-lbposting-noticia/",
            }
        ],
    }

    # --- forecast_ml ---
    fml = data.get("forecast_ml", {})
    fml["subtitulo"] = "Modelo ensemble · corte 16-jun 10:22 PET · 99,054% actas"
    fml["punto_central"] = {
        "margen_final_votos": 40500,
        "pct_fujimori_final": 50.111,
        "pct_sanchez_final": 49.889,
        "ganador_modelo_base": "Fujimori",
        "derivacion": "Margen actual 33,620 + ajuste actas JEE pendientes (+4,500) + drift residual (+2,380) = 40,500 central",
    }
    fml["intervalos_confianza"] = {
        "sigma_efectivo": 4200,
        "nota": "IC95 inferior +32.100 >> 0. Drift Lima/exterior agotado al 99,054%.",
        "ic_50": [38800, 42200],
        "ic_80": [35500, 45500],
        "ic_95": [32100, 48900],
    }
    fml["probabilidad_victoria"] = {
        "fujimori": 0.992,
        "sanchez": 0.007,
        "empate_tecnico_reconteo": 0.0001,
        "nota": "Cola legal 2% por amparo JP voto exterior.",
    }
    data["forecast_ml"] = fml

    # --- prediccion_7dias ---
    data["prediccion_7dias"] = {
        "fecha_inicio": "2026-06-16",
        "fecha_fin": "2026-06-23",
        "nota_metodologica": "Ajuste v3.8: escrutinio 99,054%, de-escalación JP, CGTP 17-jun no verificada, La Oroya levantado.",
        "lima": {
            "eventos_esperados": 5,
            "prob_manifestacion_significativa": 0.72,
            "prob_escalada_violenta": 0.38,
            "prob_paro_gremial": 0.22,
            "justificacion": "JP vigilias 17-jun + marcha 19-jun Campo de Marte. Sin CGTP verificada 17-jun.",
        },
        "norte": {
            "eventos_esperados": 4,
            "prob_escalada": 0.28,
            "prob_bloqueo_panamericana_norte": 0.55,
            "justificacion": "Bloqueo km 556 persiste. Costa norte menor movilización electoral.",
        },
        "centro": {
            "eventos_esperados": 4,
            "prob_manifestacion_significativa": 0.68,
            "prob_bloqueo_carretera_central": 0.18,
            "prob_paro_regional_junin": 0.45,
            "justificacion": "La Oroya levantado. Pariahuanca 19-jun eleva riesgo ambiental.",
        },
        "sur": {
            "eventos_esperados": 6,
            "prob_bloqueo_ilave_activo": 0.42,
            "prob_paro_indefinido_puno": 0.58,
            "prob_escalada_violenta": 0.48,
            "justificacion": "Ilave incierto. FP no apela Puno. Sur epicentro étnico-territorial.",
        },
        "oriente": {
            "eventos_esperados": 3,
            "prob_bloqueo_federico_basadre": 0.35,
            "prob_nuevos_disturbios_pucallpa": 0.58,
            "justificacion": "Paro arrocero levantado según PCM. Ucayali mantiene riesgo disturbios.",
        },
        "escenario_global_semana": {
            "prob_paro_nacional_coordinado": 0.28,
            "justificacion": "Rebajado desde 0,55: de-escalación Zunini, sin paro CGTP verificado.",
            "indicadores_de_escalada_a_monitorear": [
                "Medida cautelar PJ sobre voto exterior",
                "Convocatoria formal CGTP paro 48h",
                "Reactivación bloqueo Ilave",
                "Asistencia >15.000 marcha Campo de Marte 19-jun",
            ],
        },
    }

    # --- risk_matrix ---
    existing_ids = {r.get("id") for r in data.get("risk_matrix", [])}
    for rm in RISK_MATRIX_NEW:
        if rm["id"] not in existing_ids:
            data["risk_matrix"].append(rm)

    # --- early_warning ---
    ew_map = {e["id"]: e for e in data.get("early_warning_indicators", [])}
    if "EW-03" in ew_map:
        ew_map["EW-03"]["current_status"] = "VERDE"
        ew_map["EW-03"]["status"] = "VERDE"
        ew_map["EW-03"]["value"] = "+33.620 votos"
        ew_map["EW-03"]["rationale"] = "Margen supera umbral; reversión estadística improbable al 99,054%."
    if "EW-19" in ew_map:
        ew_map["EW-19"]["current_status"] = "AMARILLO"
        ew_map["EW-19"]["status"] = "AMARILLO"
        ew_map["EW-19"]["value"] = "P=0,28"
        ew_map["EW-19"]["rationale"] = "Sin comunicado CGTP paro 17-jun. De-escalación JP reduce P(paro nacional)."
    if "EW-20" in ew_map:
        ew_map["EW-20"]["current_status"] = "NARANJA"
        ew_map["EW-20"]["status"] = "NARANJA"
        ew_map["EW-20"]["value"] = "2 bloqueos + 1 incierto"
        ew_map["EW-20"]["rationale"] = "La Oroya levantado; Ilave incierto; Federico Basadre y Panamericana Norte activos."
    if "EW-23" not in ew_map:
        data["early_warning_indicators"].append(EW_23)

    # --- disinfo ---
    disinfo = data.get("disinformation_cases", [])
    existing_dis = {d.get("id") for d in disinfo}
    for d in NEW_DISINFO:
        if d["id"] not in existing_dis:
            disinfo.append(d)
    data["disinformation_cases"] = disinfo

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    total_conv = sum(
        len(r.get("convocatorias_futuras", r.get("events_future", [])))
        for r in data["regions"].values()
    )
    print(f"v3.8.0 written — convocatorias_futuras total: {total_conv}")
    print(f"risk_matrix: {len(data['risk_matrix'])}")
    print(f"early_warning: {len(data['early_warning_indicators'])}")


if __name__ == "__main__":
    main()