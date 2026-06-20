#!/usr/bin/env python3
"""v3.10.0 — Round 5 entity deep dives + grassroots dedup + regional media (sin montecarlo)."""
import json
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-24T10:00:00-05:00"

RPP_ZUNINI = (
    "https://rpp.pe/politica/elecciones/zunini-insiste-con-reconteo-de-votos-en-eeuu-y-argentina-y-"
    "exhorta-a-autoridades-de-lima-a-respetar-el-derecho-a-la-protesta-noticia-1692928"
)
RPP_PROCURADURIA = (
    "https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-"
    "personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848"
)
SAMILLAN = "https://evidencia.pe/raul-samillan-keiko-fujimori-posiblemente-este-gobernando-y-dios-nos-salve/"
GUTIERREZ = (
    "https://www.infobae.com/peru/2026/06/11/no-hubo-fraude-ni-siquiera-se-puede-mencionar-defensor-del-"
    "pueblo-confirma-que-segunda-vuelta-fue-legitima/"
)
RPP_CAJAMARCA = (
    "https://rpp.pe/peru/cajamarca/cajamarca-por-que-las-rondas-campesinas-evaluan-retomar-su-paro-"
    "regional-indefinido-noticia-1659202"
)
CANAL_B = (
    "https://www.canalb.pe/noticias/actualidad/rondas-campesinas-acatarian-paro-total-en-el-norte-"
    "para-el-19-de-julio"
)
YARAVI = (
    "https://radioyaravi.org.pe/noticia/regional/colectivo-fujimori-nunca-mas-y-generacion-z-convocan-a-"
    "una-movilizacion-en-defensa-del-voto-popular/"
)
WALAC_FB = (
    "https://www.facebook.com/WalacNoticias/posts/segunda-vueltasimpatizantes-de-juntos-por-el-peru-se-"
    "reunen-en-la-plazuela-merin/1445477584292587/"
)
MIDAGRI_PIURA = (
    "https://nortesostenible.com/midagri-aprueba-lineamientos-para-compra-de-arroz-pero-productores-de-"
    "piura-mantienen-protesta/"
)
PACHAMAMA_REEL = "https://www.instagram.com/reel/DZQNoG-pSIU/"
KARAMBA = (
    "https://ojo-publico.com/6338/empresa-ecuatoriana-pago-por-anuncios-youtube-favor-fujimori"
)

CANONICAL_HANDLES = {
    "@WaykaPeru": "Wayka Perú",
    "@HCevallosFlores": "Hernando Cevallos",
    "@rlopezaliaga1": "Rafael López Aliaga",
    "@RobertoSanchP": "Roberto Sánchez Palomino",
    "@RPPNoticias": "RPP Noticias",
    "@WalacNoticias": "Walac Noticias Piura",
    "@PachamamaRadio_": "Pachamama Radio",
    "@EZunini": "Ernesto Zunini",
    "@cgt_peru": "CGTP Perú",
    "@hildebrandtperu": "César Hildebrandt",
    "@hildebrandtensustreceOficial": "César Hildebrandt",
}

NAME_TO_HANDLE = {
    "ernesto zunini": "@EZunini",
    "walac noticias (cuenta oficial)": "@WalacNoticias",
    "walac noticias piura": "@WalacNoticias",
    "cesar hildebrandt": "@hildebrandtperu",
    "cesar hildebrandt (hildebrandt en sus trece)": "@hildebrandtensustreceOficial",
}

INVALID_HANDLES = {"", "N/D", "no identificado", "no verificado en esta consulta"}

HANDLE_ALIASES = {
    "@HCevallos": "@HCevallosFlores",
    "@lopezaliaga": "@rlopezaliaga1",
}


def normalize_name(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.lower().strip()


def score_account(acc):
    s = 0
    for k in (
        "descripcion", "contenido_reciente", "notas", "notas_r4", "notas_r5",
        "fuente_url", "url", "deep_dive_r5",
    ):
        if acc.get(k):
            s += len(str(acc[k]))
    s += (acc.get("validacion_ronda") or 0) * 100
    s += (acc.get("deep_dive_ronda") or 0) * 50
    if acc.get("engagement_tier") == "alto":
        s += 50
    if (acc.get("handle") or "").startswith("@"):
        s += 30
    return s


def dedup_cuentas(cuentas):
    by_handle = {}
    by_canon = {}
    no_handle = []
    for acc in cuentas:
        h = (acc.get("handle") or "").strip()
        if h in CANONICAL_HANDLES:
            acc["nombre_canónico"] = CANONICAL_HANDLES[h]
        elif acc.get("nombre"):
            nk = normalize_name(acc.get("nombre"))
            if nk in NAME_TO_HANDLE:
                acc["handle"] = NAME_TO_HANDLE[nk]
                acc["nombre_canónico"] = CANONICAL_HANDLES.get(NAME_TO_HANDLE[nk], acc["nombre"])
        if not h or h in INVALID_HANDLES:
            nk = normalize_name(acc.get("nombre") or acc.get("nombre_canónico") or "")
            mapped = NAME_TO_HANDLE.get(nk)
            if mapped:
                acc["handle"] = mapped
                h = mapped
            else:
                canon = acc.get("nombre_canónico") or acc.get("nombre")
                if canon:
                    ck = normalize_name(canon)
                    prev = by_canon.get(ck)
                    if not prev or score_account(acc) > score_account(prev):
                        if prev:
                            acc.setdefault("_merged_from", prev.get("nombre"))
                        by_canon[ck] = acc
                    continue
                no_handle.append(acc)
                continue
        prev = by_handle.get(h)
        if not prev or score_account(acc) > score_account(prev):
            if prev:
                acc.setdefault("_merged_from", prev.get("nombre") or prev.get("handle"))
            by_handle[h] = acc
        else:
            prev.setdefault("_merged_duplicates", []).append(acc.get("nombre") or h)
    return list(by_handle.values()) + list(by_canon.values()) + no_handle


def grass_score(acc):
    s = 0
    h = acc.get("handle") or ""
    if h.startswith("@"):
        s += 200
    for k in ("notes", "url", "verification", "role", "platform"):
        v = acc.get(k) or ""
        if v and v not in INVALID_HANDLES:
            s += len(str(v)) * 2
    if acc.get("deep_dive_ronda"):
        s += 100
    return s


def dedup_grassroots_accounts(accounts):
    by_key = {}
    rest = []
    for acc in accounts:
        h = (acc.get("handle") or "").strip()
        if h in HANDLE_ALIASES:
            acc["handle_corregido_desde"] = h
            h = acc["handle"] = HANDLE_ALIASES[h]
        if h in INVALID_HANDLES:
            nk = normalize_name(acc.get("name") or "")
            h = NAME_TO_HANDLE.get(nk) or ""
            if h:
                acc["handle"] = h
                acc["handle_corregido_desde"] = "N/D"
        if not h or h in INVALID_HANDLES:
            nk = normalize_name(acc.get("name") or "")
            if nk in NAME_TO_HANDLE:
                acc["handle"] = NAME_TO_HANDLE[nk]
                h = NAME_TO_HANDLE[nk]
            else:
                rest.append(acc)
                continue
        canon = CANONICAL_HANDLES.get(h) or acc.get("name")
        acc["nombre_canónico"] = canon
        prev = by_key.get(h)
        if not prev or grass_score(acc) > grass_score(prev):
            if prev:
                acc["_merged_from"] = prev.get("name")
            by_key[h] = acc
        else:
            prev.setdefault("_merged_duplicates", []).append(acc.get("name"))
    return list(by_key.values()) + rest


ACCOUNT_R5 = {
    "@EZunini": {
        "nombre": "Ernesto Zunini",
        "plataforma": "X",
        "handle": "@EZunini",
        "url": "https://x.com/EZunini",
        "descripcion": (
            "Secretario General Juntos por el Perú. Última cita directa 13-jun (reconteo EE.UU./Argentina; "
            "exhortó respeto a protesta pacífica). Sin aparición pública indexada 17–24 jun."
        ),
        "posicion": "pro-Sánchez / JP institucional",
        "seguidores_aprox": "no verificado sin login X",
        "engagement_tier": "bajo",
        "mobilization_role": "moderada/desescalatoria — rol convocatoria desplazado a Sánchez",
        "posts_17_24jun": "ninguno verificable (muro X)",
        "deep_dive_ronda": 5,
        "validacion_ronda": 5,
        "fuente_url": RPP_ZUNINI,
        "nombre_canónico": "Ernesto Zunini",
        "eventos_vinculados": ["MARCHA-JP-19JUN"],
        "notas_r5": "Silencio estratégico o ausencia operativa; co-convocante histórico sin nueva convocatoria.",
    },
    "@cgt_peru": {
        "nombre": "CGTP Perú",
        "plataforma": "X",
        "handle": "@cgt_peru",
        "url": "https://x.com/cgt_peru",
        "descripcion": (
            "Confederación General de Trabajadores del Perú (~11,7K seguidores R2). Timeline vacía 17–24 jun. "
            "Sin comunicado formal de paro/marcha 17-jun verificado."
        ),
        "posicion": "sindical / mixto",
        "engagement_tier": "bajo",
        "mobilization_role": "ausente — vigilias JP ≠ paro CGTP",
        "posts_17_24jun": "ninguno",
        "deep_dive_ronda": 5,
        "validacion_ronda": 5,
        "cgtp_17jun": "no_verificada",
        "nombre_canónico": "CGTP Perú",
        "notas_r5": "Corrige @CGTPOficial. Sindicato ausente del debate digital movilización post-19-jun.",
    },
    "@WalacNoticias": {
        "nombre": "Walac Noticias Piura",
        "descripcion": (
            "Medio regional Piura (FB/YouTube/walac.pe). Cobertura Plazuela Merino 10-jun; arrocera 11-jun. "
            "24-jun AM: sin terreno adicional indexado; monitoreo Piura activo."
        ),
        "region": "norte",
        "engagement_tier": "medio-regional",
        "mobilization_role": "cobertura terreno / verificación física norte",
        "deep_dive_ronda": 5,
        "validacion_ronda": 5,
        "notas_r5": "Prioridad monitoreo NORTE-PARO-023 y El Trébol.",
        "fuente_url": MIDAGRI_PIURA,
    },
    "@PachamamaRadio_": {
        "notas_r5": (
            "Autoconvocatoria IG reel DZQNoG-pSIU 22-jun Plaza San Martín — no materializada (VG-R4-04). "
            "Sin handle autor reel verificado."
        ),
        "deep_dive_ronda": 5,
        "validacion_ronda": 5,
        "fuente_url": PACHAMAMA_REEL,
        "mobilization_role": "autoconvocatoria latente",
    },
}

NEW_ACCOUNTS_R5 = [
    {
        "nombre": "Radio Yaraví Arequipa",
        "plataforma": "Web / radio",
        "handle": "@RadioYaravi",
        "url": "https://radioyaravi.org.pe",
        "descripcion": (
            "Medio regional Arequipa. Documentó convocatoria Gen Z / Fujimori Nunca Más 13-jun 16:00 "
            "Plaza España (vocero David Calisaya). Sin nueva convocatoria 17–24 jun."
        ),
        "posicion": "neutral-regional",
        "region": "sur",
        "engagement_tier": "bajo-regional",
        "mobilization_role": "cobertura sur andino",
        "deep_dive_ronda": 5,
        "validacion_ronda": 5,
        "fuente_url": YARAVI,
        "nombre_canónico": "Radio Yaraví Arequipa",
    },
    {
        "nombre": "Canal B Cajamarca",
        "plataforma": "Web / TV regional",
        "handle": None,
        "url": "https://www.canalb.pe",
        "descripcion": (
            "Medio regional Cajamarca. Referencia rondas campesinas y paro total norte 19-jul. "
            "Cruce con RPP Cajamarca (Fernando Chuquilín / Aladino Fernández)."
        ),
        "posicion": "neutral-regional",
        "region": "norte",
        "engagement_tier": "bajo-regional",
        "mobilization_role": "cobertura rondero / alerta post-proclamación",
        "deep_dive_ronda": 5,
        "validacion_ronda": 5,
        "fuente_url": CANAL_B,
        "nombre_canónico": "Canal B Cajamarca",
    },
]

NEW_HASHTAGS_R5 = [
    {
        "hashtag": "#NoReconocemosResultado",
        "plataforma": "X / FB regional sur",
        "volumen_estimado": "bajo (proxy narrativo, no trending 17–24 jun)",
        "bando": "pro-Sánchez / autoconvocados Puno",
        "nota": "Alias narrativo Samillán; usar cruce con #PunoDefiendeSuVoto.",
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "fuente_url": SAMILLAN,
    },
    {
        "hashtag": "#ParoAgrarioNacional",
        "plataforma": "Facebook regional",
        "volumen_estimado": "medio (Piura/Lambayeque post-MIDAGRI 23-jun)",
        "pico_observado": "2026-06-23T12:00:00-05:00",
        "bando": "gremial",
        "nota": "Conveagro mantiene protesta; terreno 24-jun no confirmado.",
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "fuente_url": MIDAGRI_PIURA,
    },
]

HASHTAG_REFRESH_R5 = {
    "#IlaveResiste": {
        "volumen_estimado": "bajo-latente (sin bloqueo Ilave activo verificado 17–24 jun)",
        "estado_volumen": "latente",
        "nota": "CNUL/Ccallo denunciado 19-jun; sin reactivación convocatoria indexada.",
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "fuente_url": RPP_PROCURADURIA,
    },
    "#CNULEnLucha": {
        "volumen_estimado": "bajo-latente post-denuncia",
        "estado_volumen": "latente",
        "nota": "Stale refresh R5; delegaciones puneñas marcha Lima 19-jun sin columna propia Ilave.",
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
    },
}

ACTORES_R5 = [
    {
        "nombre": "Ernesto Zunini",
        "cargo": "Secretario General Juntos por el Perú",
        "org": "JP",
        "handle": "@EZunini",
        "declaracion_reciente": (
            "Sin aparición pública indexada 17–24 jun. Última cita 13-jun: reconteo EE.UU./Argentina; "
            "postura moderada/desescalatoria."
        ),
        "fecha_declaracion": "2026-06-13",
        "side": "pro-Sánchez",
        "fuente": "RPP",
        "fuente_url": RPP_ZUNINI,
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "verificado_osint": True,
        "mobilization_role": "institucional JP — sin convocatoria nueva atribuida",
    },
    {
        "nombre": "Antauro Humala Tasso",
        "cargo": "Dirigente político",
        "org": "Antauro Humala",
        "declaracion_reciente": (
            "Denunciado penalmente 19-jun Procuraduría (art. 315-A) por convocatorias previas; "
            "sin nueva aparición indexada 17–24 jun."
        ),
        "fecha_declaracion": "2026-06-19",
        "side": "convocante",
        "fuente": "RPP",
        "fuente_url": RPP_PROCURADURIA,
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "verificado_osint": True,
        "estado_legal": "investigación preliminar — DEN-ENT-202602038",
    },
    {
        "nombre": "Raúl Samillán",
        "cargo": "Asociación de Mártires 9 de enero / vocero aymara Puno",
        "org": "Asoc. Mártires Juliaca",
        "declaracion_reciente": (
            "19-jun: rechaza eventual gobierno Fujimori; anuncia marcha Puno→Lima 15–28 jul. "
            "Sin bloqueo Ilave activo verificado al 24-jun."
        ),
        "fecha_declaracion": "2026-06-19",
        "side": "pro-Sánchez / autoconvocado",
        "fuente": "Evidencia.pe",
        "fuente_url": SAMILLAN,
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "verificado_osint": True,
        "eventos_vinculados": ["SUR-C19-04"],
    },
    {
        "nombre": "Fernando Chuquilín",
        "cargo": "Presidente Central Única Distrital Rondas Campesinas Cajamarca",
        "org": "Rondas Campesinas Cajamarca",
        "declaracion_reciente": (
            "Rondas en alerta: 73% voto cajamarquino pro-Sánchez; evalúan paro regional si resultado pro-F. "
            "Patrón paro norte 19-jul documentado Canal B/RPP."
        ),
        "fecha_declaracion": "2026-06-11",
        "side": "pro-Sánchez / rondero",
        "fuente": "RPP Cajamarca",
        "fuente_url": RPP_CAJAMARCA,
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "verificado_osint": True,
    },
    {
        "nombre": "Josué Gutiérrez",
        "cargo": "Defensor del Pueblo",
        "org": "Defensoría del Pueblo",
        "declaracion_reciente": (
            "11-jun: «No hubo fraude, ni siquiera se puede mencionar» — segunda vuelta legítima. "
            "Sin nueva declaración indexada 17–24 jun."
        ),
        "fecha_declaracion": "2026-06-11",
        "side": "institucional",
        "fuente": "Infobae",
        "fuente_url": GUTIERREZ,
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "verificado_osint": True,
    },
    {
        "nombre": "Liderazgo AIDESEP",
        "cargo": "Asociación Interétnica de Desarrollo de la Selva Peruana",
        "org": "AIDESEP",
        "declaracion_reciente": (
            "Monitoreo postelectoral amazónico activo; agenda territorial/hidrocarburos. "
            "Sin concentración masiva indexada 17–24 jun."
        ),
        "fecha_declaracion": "2026-06-11",
        "side": "indígena / agenda propia",
        "fuente": "AIDESEP",
        "fuente_url": "https://aidesep.org.pe/noticias/movilizacion-nacional-indigena-en-la-amazonia-hasta-lograr-el-adelanto-de-elecciones-generales/",
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "verificado_osint": True,
        "eventos_vinculados": ["AIDESEP-AGENDA-AMAZONIA"],
    },
]

ENTITY_DEEP_DIVES = [
    {"id": "ENT-EZUNINI", "handle": "@EZunini", "tipo": "cuenta", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-CGTP", "handle": "@cgt_peru", "tipo": "cuenta", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-WALAC", "handle": "@WalacNoticias", "tipo": "medio", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-YARAVI", "handle": "@RadioYaravi", "tipo": "medio", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-CANALB", "nombre": "Canal B Cajamarca", "tipo": "medio", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-ANTAURO", "nombre": "Antauro Humala Tasso", "tipo": "actor", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-SAMILLAN", "nombre": "Raúl Samillán", "tipo": "actor", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-CHUQUILIN", "nombre": "Fernando Chuquilín", "tipo": "actor", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-GUTIERREZ", "nombre": "Josué Gutiérrez", "tipo": "actor", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-AIDESEP", "nombre": "Liderazgo AIDESEP", "tipo": "actor", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-PACHAMAMA-IG", "handle": "@PachamamaRadio_", "tipo": "autoconv", "deep_dive_ronda": 5, "completo": True},
    {"id": "ENT-KARAMBA", "nombre": "Canales Karamba fantasma", "tipo": "disinfo", "deep_dive_ronda": 5, "completo": True,
     "nota": "6 canales eliminados post-OjoPúblico 5-jun; dormant 17–24 jun."},
]

NEW_ALT_MEDIA = [
    {
        "name": "Walac Noticias Piura",
        "medio": "Walac Noticias Piura",
        "url": "https://walac.pe",
        "type": "centro",
        "region": "norte",
        "focus": (
            "Cobertura Piura-Sechura: plantones JP Plazuela Merino, arrocera 23-jun, monitoreo El Trébol. "
            "24-jun sin terreno adicional indexado."
        ),
        "position_post_electoral": "alta-regional",
        "recent_url": WALAC_FB,
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
        "social_links": [
            {"platform": "facebook", "url": "https://www.facebook.com/WalacNoticias"},
            {"platform": "web", "url": "https://walac.pe"},
        ],
    },
    {
        "name": "Radio Yaraví",
        "medio": "Radio Yaraví Arequipa",
        "url": "https://radioyaravi.org.pe",
        "type": "centro",
        "region": "sur",
        "focus": (
            "Convocatoria Gen Z / Fujimori Nunca Más 13-jun Plaza España Arequipa (David Calisaya). "
            "Cobertura sur andino post-electoral."
        ),
        "position_post_electoral": "media-regional",
        "recent_url": YARAVI,
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
    },
    {
        "name": "Canal B Cajamarca",
        "medio": "Canal B Cajamarca",
        "url": "https://www.canalb.pe",
        "type": "centro",
        "region": "norte",
        "focus": (
            "Rondas campesinas Cajamarca: paro total norte 19-jul (patrón). Alerta post-proclamación "
            "si resultado pro-Fujimori."
        ),
        "position_post_electoral": "media-regional",
        "recent_url": CANAL_B,
        "validacion_ronda": 5,
        "deep_dive_ronda": 5,
    },
]


def find_account(cuentas, handle):
    for c in cuentas:
        if c.get("handle") == handle:
            return c
    return None


def find_hashtag(tags, tag):
    for h in tags:
        if h.get("hashtag") == tag or h.get("tag") == tag:
            return h
    return None


def find_alt(alt, name):
    for a in alt:
        if a.get("name") == name or a.get("medio") == name:
            return a
    return None


def patch_accounts(data):
    si = data.setdefault("social_intelligence", {})
    cuentas = si.setdefault("cuentas_emergentes", [])
    for handle, fields in ACCOUNT_R5.items():
        acc = find_account(cuentas, handle)
        if acc:
            acc.update(fields)
        else:
            cuentas.append(fields)
    for entry in NEW_ACCOUNTS_R5:
        h = entry.get("handle")
        if h and find_account(cuentas, h):
            find_account(cuentas, h).update(entry)
        elif not h or not find_account(cuentas, h):
            if not any(
                normalize_name(c.get("nombre") or "") == normalize_name(entry.get("nombre") or "")
                for c in cuentas
            ):
                cuentas.append(entry)


def patch_hashtags(data):
    si = data.setdefault("social_intelligence", {})
    tags = si.setdefault("hashtags", [])
    for entry in NEW_HASHTAGS_R5:
        h = find_hashtag(tags, entry["hashtag"])
        if h:
            h.update(entry)
        else:
            tags.append(entry)
    for tag, fields in HASHTAG_REFRESH_R5.items():
        h = find_hashtag(tags, tag)
        if h:
            h.update(fields)
        else:
            tags.append({"hashtag": tag, "bando": "mixto", **fields})


def patch_actores(data):
    actores = data.setdefault("actores_nacionales", [])
    by_name = {a.get("nombre"): a for a in actores}
    for na in ACTORES_R5:
        if na["nombre"] in by_name:
            by_name[na["nombre"]].update(na)
        else:
            actores.append(na)
    arriola = by_name.get("Óscar Arriola")
    if arriola:
        arriola["validacion_ronda"] = 5
        arriola["deep_dive_ronda"] = 5


def patch_alt_media(data):
    alt = data.setdefault("alt_media", [])
    for entry in NEW_ALT_MEDIA:
        existing = find_alt(alt, entry["name"]) or find_alt(alt, entry.get("medio", ""))
        if existing:
            existing.update(entry)
        else:
            alt.append(entry)


def patch_entity_deep_dives(data):
    dives = data.setdefault("entity_deep_dives", {})
    dives["corte"] = CORTE
    dives["ronda"] = 5
    dives["entidades"] = ENTITY_DEEP_DIVES
    dives["pendientes_resueltos"] = [
        "@EZunini", "@cgt_peru", "grassroots dedup", "Walac", "Radio Yaraví", "Canal B",
        "Antauro Humala", "Raúl Samillán", "Fernando Chuquilín", "Josué Gutiérrez", "AIDESEP",
        "#NoReconocemosResultado", "#ParoAgrarioNacional", "Karamba dormant",
    ]
    dives["fuente_research"] = "research/entities/deep_dives_round5_jun24.md"


def patch_prediccion(data):
    p7 = data.setdefault("prediccion_7dias", {})
    p7["nota_metodologica"] = (
        "v3.10.0 24-jun: Round 5 deep dives completos; JNE pleno nulidad pendiente; "
        "Piura terreno no confirmado; ONPE meseta; montecarlo omitido."
    )


def patch_social_meta(data):
    si = data.setdefault("social_intelligence", {})
    si["fecha_corte"] = CORTE
    si["deep_dive_ronda"] = 5
    si["contexto"] = (
        "24-jun R5: fichas @EZunini + @cgt_peru completas; medios regionales Walac/Yaraví/Canal B; "
        "6 actores P1; hashtags #NoReconocemosResultado/#ParoAgrarioNacional; grassroots dedup."
    )


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    mc_before = json.dumps(data.get("montecarlo", {}), sort_keys=True)

    data["meta"]["version"] = "3.10.0"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.10.0 Round 5 deep dives: @EZunini, @cgt_peru, regional media, 6 actores, hashtags P1, "
        "grassroots dedup; montecarlo omitido."
    )

    patch_accounts(data)
    patch_hashtags(data)
    patch_actores(data)
    patch_alt_media(data)
    patch_entity_deep_dives(data)
    patch_prediccion(data)
    patch_social_meta(data)

    si = data["social_intelligence"]
    before_cu = len(si["cuentas_emergentes"])
    si["cuentas_emergentes"] = dedup_cuentas(si["cuentas_emergentes"])
    si["dedup_removed_r5"] = before_cu - len(si["cuentas_emergentes"])
    si["dedup_removed"] = (si.get("dedup_removed") or 0) + max(0, si["dedup_removed_r5"])

    grass = data.setdefault("grassroots", {})
    before_gr = 0
    after_gr = 0

    def patch_grass_list(accs):
        nonlocal before_gr, after_gr
        before_gr += len(accs)
        out = dedup_grassroots_accounts(accs)
        after_gr += len(out)
        return out

    nac = grass.setdefault("nacional", {})
    nac["accounts"] = patch_grass_list(nac.setdefault("accounts", []))
    nacional_handles = {
        a.get("handle")
        for a in nac["accounts"]
        if (a.get("handle") or "").startswith("@")
    }
    region_ids = ["lima", "norte", "centro", "sur", "oriente"]
    for rid in region_ids:
        reg = grass.get(rid)
        if isinstance(reg, dict) and "accounts" in reg:
            before_reg = len(reg["accounts"])
            patched = patch_grass_list(reg["accounts"])
            filtered = [
                a for a in patched
                if (a.get("handle") or "") not in nacional_handles
            ]
            after_gr -= len(patched) - len(filtered)
            reg["accounts"] = filtered

    grass.setdefault("meta", {})["version"] = "3.10.0"
    grass["meta"]["dedup_notas"] = (
        f"v3.10.0 grassroots dedup −{before_gr - after_gr} (nacional+by_region); "
        f"cuentas sociales dedup acum −{si.get('dedup_removed', 0)}"
    )
    grass["meta"]["deep_dive_ronda"] = 5

    mc_after = json.dumps(data.get("montecarlo", {}), sort_keys=True)
    if mc_before != mc_after:
        raise SystemExit("montecarlo mutated — abort")

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    n_ent = len(data["entity_deep_dives"]["entidades"])
    print(
        f"v3.10.0 — entity_deep_dives={n_ent}, cuentas dedup r5 −{si.get('dedup_removed_r5', 0)}, "
        f"grassroots −{before_gr - after_gr}, montecarlo=unchanged"
    )


if __name__ == "__main__":
    main()