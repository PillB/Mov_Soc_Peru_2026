#!/usr/bin/env python3
"""v3.9.7 — Round 4 social refresh: hashtags bulk, cuentas, alt_media."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-23T20:00:00-05:00"

RPP_MARCHA = (
    "https://rpp.pe/politica/elecciones/roberto-sanchez-salio-de-su-local-de-campana-en-el-inicio-de-"
    "marcha-convocada-por-juntos-por-el-peru-noticia-1693850"
)
RPP_PROCURADURIA = (
    "https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-"
    "personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848"
)
RPP_MENDOZA = (
    "https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-"
    "actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777"
)
RPP_ACAMPAMENTO = (
    "https://rpp.pe/peru/actualidad/simpatizantes-de-juntos-por-el-peru-dicen-que-seguiran-acampando-"
    "frente-al-jne-noticia-1693265"
)
MIDAGRI_PIURA = (
    "https://nortesostenible.com/midagri-aprueba-lineamientos-para-compra-de-arroz-pero-productores-de-"
    "piura-mantienen-protesta/"
)
CANALN_JEE = (
    "https://canaln.pe/actualidad/jne-improcedente-nulidad-juntos-peru-mesas-extranjero-n492715"
)

STALE_HASHTAG_REFRESH = {
    "#TomaDeLima": {
        "volumen_estimado": "medio (300–1.200 posts proxy 17–22 jun; decay desde pico 11-jun)",
        "pico_observado": "2026-06-19T17:00:00-05:00",
        "estado_volumen": "decay",
        "pico_historico": "2026-06-11T02:00:00-05:00 (~85k proxy 48h)",
        "nota": "Marcha JP 19-jun ejecutada; volumen 11-jun obsoleto. validacion_ronda=4.",
        "validacion_ronda": 4,
        "fuente_url": RPP_MARCHA,
    },
    "#LosCuatroSuyos": {
        "volumen_estimado": "medio-bajo (post-19-jun)",
        "pico_observado": "2026-06-19T16:00:00-05:00",
        "estado_volumen": "decay",
        "pico_historico": "2026-06-11T03:30:00-05:00 (~60k proxy 48h)",
        "nota": "Lema histórico JP; marcha 19-jun usó #MarchaEnDefensaDeLaDemocracia en medios.",
        "validacion_ronda": 4,
        "fuente_url": RPP_MARCHA,
    },
    "#JNEResuelve": {
        "volumen_estimado": "bajo (meseta ONPE 23-jun; pleno nulidad pendiente)",
        "pico_observado": "2026-06-19T12:00:00-05:00",
        "estado_volumen": "decay",
        "pico_historico": "2026-06-11T09:00:00-05:00",
        "nota": "JEE improcedente 647 EE.UU. + 1.751 Lima; resolución pleno no publicada.",
        "validacion_ronda": 4,
        "fuente_url": CANALN_JEE,
    },
    "#LimaResiste": {
        "volumen_estimado": "medio (acampamento JNE 16–23 jun)",
        "pico_observado": "2026-06-16T10:00:00-05:00",
        "estado_volumen": "sostenido",
        "pico_historico": "2026-06-11T00:30:00-05:00 (~25k proxy)",
        "nota": "~80 carpas baseline 16-jun; continuidad reportada RPP.",
        "validacion_ronda": 4,
        "fuente_url": RPP_ACAMPAMENTO,
    },
    "#FraudeJamás": {
        "volumen_estimado": "medio-bajo (post-meseta; sin pico 17–23 jun)",
        "estado_volumen": "decay",
        "pico_historico": "2026-06-10T22:00:00-05:00",
        "validacion_ronda": 4,
        "nota": "Volumen 11-jun proxy obsoleto; narrativa activa en vigilias sin trending nuevo.",
    },
    "#ActasObservadas": {
        "volumen_estimado": "medio (346 JEE al 23-jun)",
        "pico_observado": "2026-06-19T12:00:00-05:00",
        "estado_volumen": "sostenido",
        "validacion_ronda": 4,
        "nota": "1.635 baseline; 346 pendientes JEE. Meseta ONPE sin delta.",
        "fuente_url": CANALN_JEE,
    },
    "#SánchezPresidente": {
        "volumen_estimado": "bajo (decay post-9-jun)",
        "estado_volumen": "historico",
        "pico_historico": "2026-06-09T20:00:00-05:00",
        "validacion_ronda": 4,
        "nota": "Pico 9-jun cuando Sánchez lideraba; sin resurgencia 17–23 jun.",
    },
    "#ParoAgrario": {
        "volumen_estimado": "medio (FB regional Piura/Lambayeque)",
        "pico_observado": "2026-06-23T12:00:00-05:00",
        "nota": (
            "23-jun: MIDAGRI lineamientos aprobados; gremio mantiene protesta. "
            "Terreno no confirmado al corte PM."
        ),
        "validacion_ronda": 4,
        "fuente_url": MIDAGRI_PIURA,
    },
}

NEW_ROUND4_HASHTAGS = [
    {
        "hashtag": "#MarchaEnDefensaDeLaDemocracia",
        "plataforma": "X / Facebook / RPP TV",
        "volumen_estimado": "alto (800–2.500 posts proxy 17–19 jun)",
        "pico_observado": "2026-06-19T17:00:00-05:00",
        "bando": "pro-Sánchez / JP",
        "fuente_url": RPP_MARCHA,
        "nota": "Denominación oficial marcha 19-jun. Evento físico verificado RPP TV.",
        "validacion_ronda": 4,
        "magnitud_social_score": 4,
    },
    {
        "hashtag": "#DefensaDelVoto",
        "plataforma": "X / Facebook",
        "volumen_estimado": "alto (600–2.000 posts proxy)",
        "pico_observado": "2026-06-19T12:00:00-05:00",
        "bando": "pro-Sánchez / JP",
        "fuente_url": RPP_MENDOZA,
        "nota": "Marco retórico JP: vigilias 17-jun + sustentación nulidad 19-jun.",
        "validacion_ronda": 4,
        "magnitud_social_score": 4,
    },
    {
        "hashtag": "#LaTomaDeLima",
        "plataforma": "X / Facebook",
        "volumen_estimado": "medio (300–1.200 posts proxy)",
        "pico_observado": "2026-06-19T16:00:00-05:00",
        "bando": "pro-Sánchez / JP",
        "fuente_url": RPP_MARCHA,
        "nota": "Variante titular RPP; menor prevalencia que #MarchaEnDefensaDeLaDemocracia.",
        "validacion_ronda": 4,
        "magnitud_social_score": 3,
    },
    {
        "hashtag": "#CriminalizaciónDeLaProtesta",
        "plataforma": "X / Facebook",
        "volumen_estimado": "medio (200–800 posts proxy 19–20 jun)",
        "pico_observado": "2026-06-19T20:00:00-05:00",
        "bando": "pro-Sánchez / oposición institucional",
        "fuente_url": RPP_PROCURADURIA,
        "nota": "Respuesta a denuncia Procuraduría DEN-ENT-202602038 (9 convocantes).",
        "validacion_ronda": 4,
        "magnitud_social_score": 3,
    },
    {
        "hashtag": "#583PatronesAnomalos",
        "plataforma": "X / Facebook",
        "volumen_estimado": "medio (200–800 posts proxy 19-jun AM)",
        "pico_observado": "2026-06-19T12:00:00-05:00",
        "bando": "pro-Sánchez / JP (argumento legal)",
        "fuente_url": RPP_MENDOZA,
        "nota": "Claim JP impugnación; no dictamen ONPE/JNE. DIS-JUN19-04 engaño potencial.",
        "validacion_ronda": 4,
        "magnitud_social_score": 3,
    },
    {
        "hashtag": "#AcampamentoJNE",
        "plataforma": "X / Facebook",
        "volumen_estimado": "medio (150–500 posts proxy 16–23 jun)",
        "pico_observado": "2026-06-16T10:00:00-05:00",
        "bando": "pro-Sánchez / autoconvocados",
        "fuente_url": RPP_ACAMPAMENTO,
        "nota": "~80 carpas Jr. Nazca / JNE Jesús María; continuidad sin update oficial 23-jun.",
        "validacion_ronda": 4,
        "magnitud_social_score": 3,
    },
]

HANDLE_CORRECTIONS = {
    "@HCevallosF": "@HCevallosFlores",
    "@HCevallos": "@HCevallosFlores",
    "@waykaperu / @wayka.pe": "@WaykaPeru",
    "@lopezaliaga": "@rlopezaliaga1",
    "@rlopezaliaga1R": "@rlopezaliaga1",
    "@RLopezAliaga": "@rlopezaliaga1",
    "@JuntosXelPeru": "@JuntosPorElPer",
    "@FuerzaPopular": "@FuerzaPopular__",
    "@wayka_pe": "@WaykaPeru",
}

ACCOUNT_R4_UPDATES = {
    "@RobertoSanchP": {
        "nombre": "Roberto Sánchez Palomino",
        "plataforma": "X",
        "handle": "@RobertoSanchP",
        "url": "https://x.com/RobertoSanchP",
        "descripcion": (
            "Candidato JP. Post 19-jun rechazo denuncia Procuraduría (~203K quotes). "
            "Encabezó marcha centro histórico."
        ),
        "posicion": "pro-Sánchez / JP",
        "engagement_tier": "alto",
        "mobilization_role": "convocador",
        "validacion_ronda": 4,
        "fuente_url": "https://x.com/RobertoSanchP/status/2068075544395321358",
    },
    "@RPPNoticias": {
        "nombre": "RPP Noticias",
        "plataforma": "X / YouTube / TV",
        "handle": "@RPPNoticias",
        "url": "https://x.com/RPPNoticias",
        "descripcion": "Cobertura institucional en vivo marcha 19-jun y acampamento JNE.",
        "posicion": "neutral / institucional",
        "engagement_tier": "alto",
        "mobilization_role": "institucional",
        "validacion_ronda": 4,
        "fuente_url": RPP_MARCHA,
    },
    "@JuntosPorElPer": {
        "nombre": "Juntos por el Perú (oficial)",
        "plataforma": "X",
        "handle": "@JuntosPorElPer",
        "url": "https://x.com/JuntosPorElPer",
        "descripcion": "X inactivo 17–23 jun; convocatorias vía comunicado partidario.",
        "posicion": "pro-Sánchez / JP",
        "engagement_tier": "bajo",
        "mobilization_role": "convocador",
        "validacion_ronda": 4,
        "fuente_url": RPP_MARCHA,
    },
    "@WalacNoticias": {
        "notas_r4": "23-jun PM: sin cobertura terreno Piura indexada; monitoreo 24-jun AM.",
        "validacion_ronda": 4,
        "fuente_url": MIDAGRI_PIURA,
    },
    "@PachamamaRadio_": {
        "notas_r4": "Autoconvocatoria IG 22-jun no materializada (v3.9.5). X dormante.",
        "validacion_ronda": 4,
    },
    "@WaykaPeru": {
        "handle": "@WaykaPeru",
        "engagement_tier": "medio",
        "validacion_ronda": 4,
        "fuente_url": "https://wayka.pe",
    },
    "@HCevallosFlores": {
        "handle": "@HCevallosFlores",
        "notas_r4": "Objeto denuncia Procuraduría 19-jun; sin posts X 17–23 jun.",
        "engagement_tier": "bajo",
        "validacion_ronda": 4,
        "fuente_url": RPP_PROCURADURIA,
    },
}

ALT_MEDIA_REFRESH = {
    "Wayka": {
        "focus": (
            "Cobertura marcha 19-jun y defensa del voto popular; denuncia criminalización de la protesta "
            "(Procuraduría 19-jun). Línea pro-democracia; crítica narrativas fraude FP."
        ),
        "recent_url": "https://wayka.pe",
        "position_post_electoral": "alta",
        "validacion_ronda": 4,
    },
    "La Encerrona": {
        "focus": (
            "Análisis escrutinio meseta ONPE (+41.565 al 99,63%). Seguimiento nulidad 2.408 actas "
            "y tensión post-marcha 19-jun. Crítica equidistante a narrativas sin sustento."
        ),
        "recent_url": "https://laencerrona.pe",
        "position_post_electoral": "alta",
        "validacion_ronda": 4,
    },
    "Sudaca": {
        "focus": (
            "Reportajes post-19-jun: actas observadas (346 JEE) y movilizaciones civiles. "
            "Equilibrio editorial; cobertura proceso sin proclamar ganador."
        ),
        "recent_url": "https://sudaca.pe",
        "validacion_ronda": 4,
    },
    "Willax Television": {
        "focus": (
            "Meseta ONPE 99,63% / Fujimori +41.565. Proyección victoria Keiko con actas pendientes. "
            "Amplifica irregularidades atribuidas a JP; cobertura #EligeBien2026."
        ),
        "recent_url": "https://willax.pe",
        "validacion_ronda": 4,
    },
    "EpicentroTV": {
        "focus": (
            "Cobertura Toma de Lima / defensa voto 19-jun. Declaraciones comunidades Puno. "
            "Línea pro-democracia y derechos humanos."
        ),
        "recent_url": RPP_MARCHA,
        "validacion_ronda": 4,
    },
    "Hildebrandt en sus Trece": {
        "focus": (
            "Análisis criminalización de la protesta post-Procuraduría 19-jun. "
            "Crisis institucional y escrutinio sin proclamación presidencial."
        ),
        "recent_url": "https://www.hildebrandtensustrece.com",
        "validacion_ronda": 4,
    },
    "IDL-Reporteros": {
        "focus": (
            "Editorial 'El dilema peruano' (6-jun); seguimiento JNE bajo presión y nulidad pendiente. "
            "Ángulo jurídico-institucional sin amplificar fraude."
        ),
        "recent_url": "https://www.idl-reporteros.pe/el-dilema-peruano/",
        "validacion_ronda": 4,
    },
    "Ojo Publico": {
        "focus": (
            "Seguimiento Karamba (5-jun) y escrutinio meseta. Fact-checking electoral activo; "
            "346 actas JEE al 23-jun."
        ),
        "recent_url": "https://ojo-publico.com/6338/empresa-ecuatoriana-pago-por-anuncios-youtube-favor-fujimori",
        "validacion_ronda": 4,
    },
    "La Mula": {
        "focus": (
            "Cobertura movilizaciones 19-jun y disputa por actas observadas. "
            "Agrega voces diversas del espectro político."
        ),
        "recent_url": "https://www.youtube.com/watch?v=P-2l69TQDsE",
        "validacion_ronda": 4,
    },
    "PeruCheck (Consejo de la Prensa Peruana)": {
        "focus": (
            "Verificación desinformación electoral JP/FP post-marcha. "
            "Desmintió actas serie 900K y encuestas falsas."
        ),
        "recent_url": (
            "https://perucheck.pe/articles/verificadas/juntos-por-el-peru/2026/05/21/"
            "roberto-sanchez-y-juntos-por-el-peru-toda-la-desinformacion-electoral-desmentida-por-perucheck-1337553"
        ),
        "validacion_ronda": 4,
    },
    "Convoca": {
        "focus": (
            "IA y desinformación en campaña; batalla legal JEE post-19-jun. "
            "46 casos penales Fiscalía primera vuelta."
        ),
        "recent_url": (
            "https://www.facebook.com/Convoca/posts/segundavuelta-la-inteligencia-artificial-y-la-desinformaci%C3%B3n-marca-la-campa%C3%B1a-el/"
            "1548352213312865/"
        ),
        "validacion_ronda": 4,
    },
    "Lima Gris": {
        "focus": (
            "Sensacionalismo post-19-jun: irregularidades, denuncia penal convocantes, "
            "tensión JNE sin línea pro-candidato clara."
        ),
        "recent_url": "https://www.limagris.com",
        "validacion_ronda": 4,
    },
}

MEDIO_LINEA_REFRESH = {
    "Wayka.pe": {
        "declaracion_reciente": (
            "Post-19-jun: cobertura marcha defensa democracia y criminalización protesta. "
            "Análisis discriminación voto sur (abril-jun 2026)."
        ),
        "url": "https://wayka.pe",
        "fuente": f"{RPP_MARCHA} (cruce 19-jun)",
    },
    "Willax Televisión": {
        "declaracion_reciente": (
            "23-jun: meseta ONPE 99,63% / Fujimori +41.565. Marco editorial pro-FP; "
            "proyección victoria con actas pendientes."
        ),
        "url": "https://willax.pe",
        "fuente": "ONPE meseta 23-jun (cruce dossier escrutinio_realtime)",
    },
    "OjoPúblico": {
        "declaracion_reciente": (
            "Karamba (5-jun) seguimiento; fact-checking activo escrutinio meseta. "
            "Red Ama Llulla en jornada electoral."
        ),
        "fuente": "https://ojo-publico.com/6338/empresa-ecuatoriana-pago-por-anuncios-youtube-favor-fujimori (2026-06-05)",
    },
    "Convoca.pe": {
        "declaracion_reciente": (
            "IA desinformación campaña; 46 casos penales Fiscalía. "
            "Batalla legal JEE post-19-jun (346 actas)."
        ),
        "url": (
            "https://www.facebook.com/Convoca/posts/segundavuelta-la-inteligencia-artificial-y-la-desinformaci%C3%B3n-marca-la-campa%C3%B1a-el/"
            "1548352213312865/"
        ),
        "fuente": "convoca.pe + Canal N JEE 23-jun",
    },
}

NEW_ALT_TRENDS = [
    {
        "trend": "#CriminalizaciónDeLaProtesta / denuncia Procuraduría 19-jun",
        "description": (
            "Procuraduría DEN-ENT-202602038 contra 9 convocantes (Antauro Humala, Hernando Cevallos, "
            "Lucio Ccallo y 6 más) por art. 315-A CP. Roberto Sánchez excluido. "
            "Amplificado por medios izq (Wayka, Epicentro); debate institucional en Willax/PeruCheck."
        ),
        "outlets_pushing": ["Wayka", "EpicentroTV", "RPP Noticias", "Willax Television", "PeruCheck"],
        "url": RPP_PROCURADURIA,
        "validacion_ronda": 4,
    },
    {
        "trend": "JNE nulidad 2.408 actas — pleno pendiente",
        "description": (
            "JEE declaró improcedente 647 EE.UU. + 1.751 Lima (falta tasa/prueba). "
            "Resolución pleno no publicada al 23-jun 20:00. ~43.577 votos en juego vs +41.565."
        ),
        "outlets_pushing": ["La Encerrona", "IDL-Reporteros", "Sudaca", "RPP Noticias"],
        "url": CANALN_JEE,
        "validacion_ronda": 4,
    },
    {
        "trend": "Piura arrocera post-lineamientos MIDAGRI",
        "description": (
            "MIDAGRI aprobó lineamientos compra arroz; productores mantienen protesta. "
            "Terreno 23-jun no confirmado; tensión gremial activa sin bloqueo El Trébol indexado."
        ),
        "outlets_pushing": ["Norte Sostenible (cruce)", "Walac Noticias (monitoreo)"],
        "url": MIDAGRI_PIURA,
        "validacion_ronda": 4,
    },
]


def find_hashtag(tags, tag):
    for h in tags:
        if h.get("hashtag") == tag or h.get("tag") == tag:
            return h
    return None


def find_account(cuentas, handle):
    if not handle:
        return None
    for c in cuentas:
        if c.get("handle") == handle:
            return c
    return None


def patch_hashtags(data):
    si = data.setdefault("social_intelligence", {})
    tags = si.setdefault("hashtags", [])
    for tag, fields in STALE_HASHTAG_REFRESH.items():
        h = find_hashtag(tags, tag)
        if h:
            h.update(fields)
        else:
            tags.append({"hashtag": tag, "bando": "mixto", **fields})
    for entry in NEW_ROUND4_HASHTAGS:
        h = find_hashtag(tags, entry["hashtag"])
        if h:
            h.update(entry)
        else:
            tags.append(entry)


def patch_accounts(data):
    si = data.setdefault("social_intelligence", {})
    cuentas = si.setdefault("cuentas_emergentes", [])
    for c in cuentas:
        h = c.get("handle")
        if h in HANDLE_CORRECTIONS:
            c["handle"] = HANDLE_CORRECTIONS[h]
            c["handle_corregido_desde"] = h
    for handle, fields in ACCOUNT_R4_UPDATES.items():
        acc = find_account(cuentas, handle)
        if acc:
            acc.update(fields)
        else:
            cuentas.append(fields)


def patch_alt_media(data):
    for outlet in data.get("alt_media", []):
        name = outlet.get("name") or outlet.get("medio")
        if name in ALT_MEDIA_REFRESH:
            outlet.update(ALT_MEDIA_REFRESH[name])
        elif name and name.replace(".pe", ".pe") in MEDIO_LINEA_REFRESH:
            pass
        medio_key = outlet.get("medio")
        if medio_key and medio_key in MEDIO_LINEA_REFRESH:
            outlet.update(MEDIO_LINEA_REFRESH[medio_key])
        name_map = {"Wayka.pe": "Wayka", "OjoPúblico": "Ojo Publico"}
        mapped = name_map.get(medio_key or "")
        if mapped and mapped in ALT_MEDIA_REFRESH:
            for k, v in ALT_MEDIA_REFRESH[mapped].items():
                if k not in outlet or outlet.get(k) in (None, "", outlet.get("url")):
                    outlet[k] = v


def patch_alt_trends(data):
    trends = data.setdefault("alt_media_trends", [])
    existing = {t.get("trend", "")[:40] for t in trends}
    for t in NEW_ALT_TRENDS:
        key = t["trend"][:40]
        if key not in existing:
            trends.insert(0, t)


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    data["meta"]["version"] = "3.9.7"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.9.7 Round 4 social: bulk hashtags refresh (decay #TomaDeLima), +6 hashtags R4, "
        "cuentas handles corregidos + R4, alt_media 12 outlets + 3 trends."
    )

    si = data.setdefault("social_intelligence", {})
    si["fecha_corte"] = CORTE
    si["contexto"] = (
        "23-jun PM: Round 4 social refresh. Marcha JP 19-jun verificada; #TomaDeLima decay. "
        "Criminalización protesta activa. Piura terreno no confirmado. ONPE meseta +41.565."
    )
    si["refresh_ronda"] = 4
    si["refresh_notas"] = (
        "Bulk refresh P0: 8 hashtags stale + 6 nuevos R4. Handles corregidos (@HCevallosFlores, "
        "@WaykaPeru, @rlopezaliaga1). Fuentes: RPP, Canal N, Norte Sostenible."
    )

    patch_hashtags(data)
    patch_accounts(data)
    patch_alt_media(data)
    patch_alt_trends(data)

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    tags = data["social_intelligence"]["hashtags"]
    r4 = sum(1 for h in tags if h.get("validacion_ronda") == 4)
    stale = sum(1 for h in tags if "~85" in str(h.get("volumen_estimado", "")))
    print(f"v3.9.7 written — hashtags R4={r4}, stale_85k={stale}")


if __name__ == "__main__":
    main()