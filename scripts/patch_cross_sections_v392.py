#!/usr/bin/env python3
"""v3.9.2 — cross-update risk_matrix, early_warning, regional executive_alerts (editorial checklist jun19)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-19T21:00:00-05:00"

EXECUTIVE_ALERTS = {
    "sur": (
        "ALERTA MEDIA — SUR. Puente Internacional Ilave **sin bloqueo activo verificado** al 19-jun "
        "(convocado 11-jun por CNUL/Fenatep; round 2 y cobertura 17–19 sin confirmación SUTRAN). "
        "Delegaciones de **Puno y Cusco** participaron en marcha JP Lima 19-jun — corredor sur–Lima "
        "presumiblemente transitable ([El Búho](https://elbuho.pe/2026/06/mas-de-7-mil-policias-restriccion-vehicular-amenazas-del-alcalde-de-lima-para-marcha-de-jp-en-defensa-del-voto/)). "
        "Lucio Ccallo **denunciado penalmente** 19-jun por Procuraduría ([El Comercio](https://elcomercio.pe/lima/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-hernando-cevallos-y-otros-siete-dirigentes-por-grave-perturbacion-de-la-tranquilidad-publica-ultimas-noticia/)). "
        "Raúl Samillán anunció movilización Puno→Lima **15–28-jul** ([Evidencia.pe](https://evidencia.pe/raul-samillan-keiko-fujimori-posiblemente-este-gobernando-y-dios-nos-salve/)). "
        "FP no apela nulidades Puno (14-jun). Arequipa/Cusco sin marchas masivas nuevas 17–19-jun. "
        "**Riesgo reactivación Ilave P=0,40** post-proclamación JNE."
    ),
    "lima": (
        "ALERTA MEDIA — LIMA. Marcha JP 19-jun **ejecutada** desde Paseo Colón/Centro Histórico "
        "(~350-900, pacífica; Campo de Marte no fue epicentro) ([RPP](https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-marcha-convocada-por-juntos-por-el-peru-noticia-1693850)). "
        "Acampamento ~80 carpas frente JNE continúa (conteo 16-jun; PNP desplegada 19-jun). "
        "MML: restricción Centro Histórico hasta **22-jun 00:00**. "
        "Procuraduría denunció a 9 convocantes 19-jun — **Sánchez excluido** ([RPP](https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848)). "
        "Autoconvocatoria Instagram Plaza San Martín **22-jun** sin respaldo JP (P=0,40). "
        "ONPE 99,63 % · margen +41.565 pro-Fujimori."
    ),
    "norte": (
        "ALERTA MEDIA — NORTE. Sin bloqueos viales activos verificados al 19-jun (El Trébol, Catacaos–Piura, km 556 libres). "
        "**Movilización arrocera Piura-Sechura confirmada 23-jun ~08:00** — riesgo escalada El Trébol P=0,65 "
        "([Norte Sostenible](https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/)). "
        "Ronderas cajamarquinas inactivas con capacidad latente (CUDRCU/CUNARC). "
        "Plantón JEE Trujillo continuo desde 9-jun. Sin manifestaciones electorales verificadas Norte 17–19-jun. "
        "JNE evalúa nulidad 2.408 actas (catalizador narrativo regional)."
    ),
    "centro": (
        "ALERTA MEDIA — CENTRO. Carretera Central km 90–180 **transitable** (La Oroya sin bloqueo protesta). "
        "Protesta Pariahuanca frente GORE Junín 18–19-jun **desescalada** — acta compromisos firmada 19-jun 19:49 "
        "([HYTimes](https://hytimes.pe/2026/06/19/gobierno-regional-cede-y-emitira-ordenanza-para-proteger-el-huaytapallana-y-cabeceras-de-cuenca/)); "
        "magnitud cientos, no ~10.000. Reunión Zósimo Cárdenas ↔ Pariahuanca reprogramada **25-jun**. "
        "Bastión pro-Sánchez: Huancavelica 81,4 %, Apurímac 81,2 %. "
        "Riesgo latente bloqueo Carretera Central P=0,40 si resolución JNE nulidad Lima escala narrativa electoral."
    ),
    "oriente": (
        "ALERTA AMARILLA — ORIENTE. Federico Basadre (Ucayali) y Fernando Belaúnde Terry (San Martín) "
        "**sin bloqueo activo** al 19-jun — paro arrocero levantado pre-2da vuelta; riesgo reactivación latente P≈0,35–0,50. "
        "Sin toma UNAP Pucallpa ni movilización Loreto 12-jun materializada en ventana 17–19. "
        "AIDESEP en observación poselectoral. "
        "Referencia cruzada: movilización arrocera **Piura 23-jun** (norte) puede reactivar narrativa agro regional."
    ),
}

RM_PATCHES = {
    "RM-16": {
        "probability": "MEDIA",
        "scenario": (
            "Corredores transitables 19-jun; riesgo latente reactivación arrocera P≈0,35–0,50 "
            "(tregua vencida, sin comunicado nuevo)."
        ),
    },
    "RM-20": {
        "probability": "MEDIA",
        "evidence": (
            "0 bloqueos confirmados 19-jun. Ilave inactivo; La Oroya transitable; "
            "Federico Basadre/FB Terry levantados; km 556 sin bloqueo."
        ),
    },
    "RM-24": {
        "estado": "realizada",
        "probability": "BAJA",
        "timeframe": "cerrado 19-jun",
        "level": "BAJO",
        "scenario": (
            "Marcha JP 19-jun ejecutada desde Paseo Colón/Centro Histórico (~350-900, pacífica). "
            "Campo de Marte no fue epicentro. Riesgo residual: autoconvocatoria 22-jun (P=0,40)."
        ),
    },
    "RM-25": {
        "estado": "desescalado",
        "probability": "BAJA",
        "level": "BAJO",
        "scenario": (
            "Protesta estacionaria GORE Junín 18-19-jun (cientos); acta compromisos 19-jun 19:49. "
            "Marcha 10.000 NO materializada."
        ),
    },
    "RM-26": {
        "scenario": (
            "Ilave inactivo 19-jun (sin SUTRAN/PNP). Riesgo reactivación post-proclamación P≈0,40."
        ),
        "probability": "MEDIA",
    },
}

NEW_RM = [
    {
        "id": "RM-27",
        "category": "Crisis institucional",
        "title": "Resolución JNE nulidad 2.408 actas Lima + EE.UU.",
        "scenario": (
            "JP sustentó ante JNE el 19-jun pedido de nulidad de 2.408 actas (1.751 Lima + 647 EE.UU.); "
            "claim 583 patrones anómalos. Si JNE declara fundada nulidad Lima, ~43.577 votos netos en juego "
            "superan margen actual +41.565. Resolución no publicada al corte 20:43."
        ),
        "probability": "MEDIA",
        "impact": "CRÍTICO",
        "timeframe": "23-27 jun (estimado Roy Mendoza)",
        "level": "CRÍTICO",
        "triggers": [
            "JNE admite/fundamenta nulidad parcial Lima",
            "Resolución publicada en portal JNE",
            "Sánchez convoca movilización post-fallo",
        ],
        "sources": [
            {
                "title": "RPP — JP sustenta 2.408 actas",
                "url": "https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777",
            },
            {
                "title": "La República — 43.577 votos en juego",
                "url": "https://larepublica.pe/politica/2026/06/18/jne-decidira-manana-si-acepta-pedido-de-nulidad-de-mesas-en-lima-mas-de-43-mil-votos-en-juego-hnews-1139454",
            },
        ],
    },
    {
        "id": "RM-28",
        "category": "Violencia política / institucional",
        "title": "Denuncia penal Procuraduría vs. 9 convocantes de marchas",
        "scenario": (
            "Procuraduría presentó denuncia 19-jun noche (DEN-ENT-202602038) contra Antauro Humala, "
            "Hernando Cevallos, Lucio Ccallo y 6 más por art. 315-A CP. Roberto Sánchez excluido y rechazó denuncia. "
            "Riesgo: disuasión de convocatorias + polarización #CriminalizaciónDeLaProtesta."
        ),
        "probability": "ALTA",
        "impact": "ALTO",
        "timeframe": "72h-14d (investigación fiscal)",
        "level": "ALTO",
        "triggers": [
            "Fiscalía admite a trámite y ordena medidas cautelares",
            "Nueva convocatoria JP con Cevallos/Ccallo en primera línea",
            "FP amplifica narrativa de azuzamiento",
        ],
        "sources": [
            {
                "title": "El Comercio — Denuncia Procuraduría",
                "url": "https://elcomercio.pe/lima/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-hernando-cevallos-y-otros-siete-dirigentes-por-grave-perturbacion-de-la-tranquilidad-publica-ultimas-noticia/",
            },
            {
                "title": "La República — Sánchez rechaza denuncia",
                "url": "https://larepublica.pe/politica/2026/06/19/roberto-sanchez-rechaza-denuncia-de-la-procuraduria-contra-dirigentes-de-jp-y-otros-ciudadanos-por-convocar-a-marcha-hnews-542070",
            },
        ],
    },
    {
        "id": "RM-29",
        "category": "Económico-logístico",
        "title": "Movilización arrocera Piura-Sechura 23-jun → escalada El Trébol",
        "scenario": (
            "Conveagro confirma movilización 23-jun ~08:00 (Sechura, Medio/Bajo Piura). "
            "Precedente mayo-2026: bloqueo Catacaos–Piura y El Trébol. Paro NO reactivado al 19-jun; "
            "este evento es escalón previo a posible bloqueo si DU 005-2026 sigue incumplido."
        ),
        "probability": "ALTA",
        "impact": "ALTO",
        "timeframe": "22-24 jun",
        "level": "ALTO",
        "triggers": [
            "Reconfirmación Conveagro 22-jun AM",
            "Bloqueo preventivo El Trébol km 1058",
            "Escalada tras resolución JNE nulidad",
        ],
        "sources": [
            {
                "title": "Norte Sostenible — Piura 23-jun",
                "url": "https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/",
            },
        ],
    },
]

EW_PATCHES = {
    "EW-02": {
        "value": "346 actas en JEE (↓ desde 878)",
        "current_status": "AMARILLO",
        "rationale": "346 actas en tránsito JEE al 19-jun 20:43. JP nulidad 2.408 actas en evaluación JNE.",
        "next_check": "Diario 18:00 PET",
    },
    "EW-18": {
        "value": "Recuentos físicos en curso (calendario JNE)",
        "next_check": "2026-06-22 09:00 PET",
    },
    "EW-19": {
        "value": "Marcha 19-jun realizada pacífica · CGTP 17-jun NO verificada · P(paro)=0,22",
        "rationale": "Sin paro CGTP. Marcha JP ejecutada sin incidentes graves.",
    },
    "EW-20": {
        "status": "VERDE",
        "current_status": "VERDE",
        "estado": "verde",
    },
    "EW-21": {
        "value": "P(F)=99,4% · IC95 [+38.200; +51.400]",
        "status": "VERDE",
    },
    "EW-22": {
        "value": "Legislativos proclamados 19-jun; presidencia mediados-jul",
        "status": "VERDE",
        "note": "JNE proclamó senadores/diputados 19-jun (RPP 1693837). Presidencia pendiente.",
    },
    "EW-23": {
        "rationale": "Presentado 16-jun; sin admisión/rechazo PJ indexado 17–19-jun",
        "value": "Presentado · admisión no confirmada",
    },
}

NEW_EW = [
    {
        "id": "EW-27",
        "indicator": "Resolución JNE nulidad 2.408 actas (Lima + EE.UU.)",
        "threshold": "ROJO si JNE declara fundada nulidad Lima (>43.577 votos netos en juego)",
        "status": "AMARILLO",
        "value": "Audiencia sustentada 19-jun · resolución no publicada",
        "trend": "→ pendiente",
        "rationale": (
            "Roy Mendoza sustentó 2.408 actas; plazo magistrados hasta 3 días hábiles. "
            "Margen +41.565 vs ~43.577 votos en juego si fundada."
        ),
        "next_check": "2026-06-22 09:00 PET (portal JNE)",
        "data_source": "https://portal.jne.gob.pe/portal/",
    },
    {
        "id": "EW-28",
        "indicator": "Denuncia penal Procuraduría contra convocantes de marchas",
        "threshold": "ROJO si fiscalía ordena detención o medida cautelar contra líderes JP activos",
        "status": "AMARILLO",
        "value": "Denuncia presentada 19-jun · 9 personas (excluye Sánchez)",
        "trend": "↑ nuevo",
        "rationale": "DEN-ENT-202602038 art. 315-A CP. Catalizador #CriminalizaciónDeLaProtesta.",
        "next_check": "2026-06-21 12:00 PET",
        "data_source": (
            "https://elcomercio.pe/lima/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-"
            "hernando-cevallos-y-otros-siete-dirigentes-por-grave-perturbacion-de-la-tranquilidad-publica-ultimas-noticia/"
        ),
    },
    {
        "id": "EW-29",
        "indicator": "Movilización arrocera Piura-Sechura 23-jun",
        "threshold": "ROJO si bloqueo El Trébol o Catacaos–Piura >4h",
        "status": "AMARILLO",
        "value": "Convocatoria confirmada · sin cancelación 17–19-jun",
        "trend": "→ vigente",
        "rationale": "NORTE-PARO-023 vigente. Reconfirmar 22-jun AM (Norte Sostenible, Walac, SUTRAN).",
        "next_check": "2026-06-22 08:00 PET",
        "data_source": (
            "https://nortesostenible.com/arroceros-de-piura-anuncian-movilizacion-para-el-23-de-junio-"
            "y-evaluan-nuevo-paro-por-incumplimiento-de-demandas/"
        ),
    },
    {
        "id": "EW-30",
        "indicator": "Autoconvocatoria Instagram Plaza San Martín 22-jun",
        "threshold": "NARANJA si reel reamplificado por handles JP",
        "status": "AMARILLO",
        "value": "P=0,40 · sin respaldo JP oficial",
        "rationale": "Reel DZQNoG-pSIU vigente. MML restricción Centro Histórico hasta 22-jun 00:00.",
        "next_check": "2026-06-21 18:00 PET",
    },
]


def patch_by_id(items, patches):
    by_id = {x["id"]: x for x in items}
    for rid, fields in patches.items():
        if rid in by_id:
            by_id[rid].update(fields)


def patch_executive_alerts(data):
    regions = data.get("regions", {})
    for rid, text in EXECUTIVE_ALERTS.items():
        if rid in regions:
            regions[rid]["executive_alert"] = text
        if rid == "norte":
            sv = regions.get("norte", {}).get("social_v35")
            if isinstance(sv, dict):
                sv["executive_alert"] = text


def patch_risk_matrix(data):
    rm = data.get("risk_matrix", [])
    patch_by_id(rm, RM_PATCHES)
    existing_ids = {x["id"] for x in rm}
    for entry in NEW_RM:
        if entry["id"] not in existing_ids:
            rm.append(entry)
    data["risk_matrix"] = rm


def patch_early_warning(data):
    ew = data.get("early_warning_indicators", [])
    patch_by_id(ew, EW_PATCHES)
    existing_ids = {x["id"] for x in ew}
    for entry in NEW_EW:
        if entry["id"] not in existing_ids:
            ew.append(entry)
    data["early_warning_indicators"] = ew


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    data["meta"]["version"] = "3.9.2"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.9.2 — cross-update editorial: risk_matrix RM-16/20/24-26 + RM-27/28/29; "
        "early_warning EW-02/18-23 + EW-27/28/29/30; executive_alerts 5 regiones alineadas 19-jun."
    )

    patch_executive_alerts(data)
    patch_risk_matrix(data)
    patch_early_warning(data)

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    rm_len = len(data["risk_matrix"])
    ew_len = len(data["early_warning_indicators"])
    print(f"v3.9.2 written — risk_matrix={rm_len}, early_warning={ew_len}")


if __name__ == "__main__":
    main()