#!/usr/bin/env python3
"""v3.9.9 — JNE status 24-jun, Piura AM, cuentas dedup, entidades R4 (sin montecarlo)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS_PATH = ROOT / "data" / "events.json"

CORTE = "2026-06-24T10:00:00-05:00"

CANALN_EEUU = (
    "https://canaln.pe/actualidad/jne-improcedente-nulidad-juntos-peru-mesas-extranjero-n492715"
)
CANALN_LIMA = (
    "https://canaln.pe/actualidad/jee-lima-centro-1-declara-improcedente-pedido-juntos-peru-anular-mas-1751-mesas-lima-n492711"
)
MIDAGRI_PIURA = (
    "https://nortesostenible.com/midagri-aprueba-lineamientos-para-compra-de-arroz-pero-productores-de-"
    "piura-mantienen-protesta/"
)

CANONICAL_NAMES = {
    "@WaykaPeru": "Wayka Perú",
    "@HCevallosFlores": "Hernando Cevallos",
    "@rlopezaliaga1": "Rafael López Aliaga",
    "@RobertoSanchP": "Roberto Sánchez Palomino",
    "@RPPNoticias": "RPP Noticias",
    "@WalacNoticias": "Walac Noticias Piura",
    "@PachamamaRadio_": "Pachamama Radio",
}

ACTORES_R4 = {
    "Roberto Burneo Bermejo": {
        "declaracion_reciente": (
            "Pleno dejó al voto apelación nulidad 2.408 actas (19-jun); resolución pleno "
            "no publicada al 24-jun. JEE previo improcedente Lima+EE.UU."
        ),
        "fecha_declaracion": "2026-06-24",
        "validacion_ronda": 4,
        "fuente_url": CANALN_EEUU,
    },
    "Bernardo Pachas": {
        "declaracion_reciente": "ONPE meseta 99,63 % / +41.565 al 24-jun; sin delta indexado.",
        "fecha_declaracion": "2026-06-24",
        "validacion_ronda": 4,
    },
    "José María Balcázar": {
        "declaracion_reciente": (
            "Contexto post-denuncia Procuraduría 19-jun; Sánchez rechazó criminalización convocantes."
        ),
        "fecha_declaracion": "2026-06-19",
        "validacion_ronda": 4,
        "fuente_url": (
            "https://rpp.pe/politica/judiciales/procuraduria-denuncia-penalmente-a-antauro-humala-y-otras-ocho-"
            "personas-por-presunta-perturbacion-de-la-tranquilidad-publica-noticia-1693848"
        ),
    },
}

NEW_ACTORES = [
    {
        "nombre": "Roy Mendoza",
        "cargo": "Abogado de Juntos por el Perú",
        "org": "JP",
        "declaracion_reciente": (
            "Sustentó 19-jun nulidad 2.408 actas; claim 583 patrones anómalos (argumento legal, no ONPE)."
        ),
        "fecha_declaracion": "2026-06-19",
        "side": "pro-Sánchez",
        "fuente": "RPP",
        "fuente_url": (
            "https://rpp.pe/politica/elecciones/juntos-por-el-peru-sustenta-pedido-de-nulidad-de-mas-de-2-400-"
            "actas-y-dice-que-encontraron-583-patrones-anomalos-noticia-1693777"
        ),
        "validacion_ronda": 4,
        "verificado_osint": True,
    },
    {
        "nombre": "Máximo Valdiviezo",
        "cargo": "Presidente Conveagro / vocero arrocero Piura",
        "org": "Conveagro",
        "declaracion_reciente": (
            "23-jun: mantiene protesta pese a lineamientos MIDAGRI; movilización terreno no confirmada al corte."
        ),
        "fecha_declaracion": "2026-06-23",
        "side": "gremial",
        "fuente": "Norte Sostenible",
        "fuente_url": MIDAGRI_PIURA,
        "validacion_ronda": 4,
        "verificado_osint": True,
    },
]


def score_account(acc):
    s = 0
    for k in ("descripcion", "contenido_reciente", "notas", "notas_r4", "fuente_url", "url"):
        if acc.get(k):
            s += len(str(acc[k]))
    s += (acc.get("validacion_ronda") or 0) * 100
    if acc.get("engagement_tier") == "alto":
        s += 50
    return s


def dedup_cuentas(cuentas):
    by_handle = {}
    no_handle = []
    for acc in cuentas:
        h = acc.get("handle")
        if not h or h in ("N/D", "no identificado", ""):
            no_handle.append(acc)
            continue
        h = h.strip()
        acc["nombre_canónico"] = CANONICAL_NAMES.get(h) or acc.get("nombre") or acc.get("nombre_canónico")
        prev = by_handle.get(h)
        if not prev or score_account(acc) > score_account(prev):
            if prev:
                acc["_merged_from"] = prev.get("nombre") or prev.get("handle")
            by_handle[h] = acc
        else:
            prev.setdefault("_merged_duplicates", []).append(acc.get("nombre") or h)
    return list(by_handle.values()) + no_handle


def find_by_id(items, rid):
    for x in items:
        if x.get("id") == rid:
            return x
    return None


def patch_jne(data):
    jne = data.setdefault("escrutinio_realtime", {}).setdefault("jne_nulidad_2408", {})
    jne["pleno_resolucion_24jun"] = "no_publicada"
    jne["jee_resoluciones"] = {
        "eeuu_647": {
            "resolucion": "09494-2026-JEE-LIC2/JNE",
            "fecha": "2026-06-11",
            "resultado": "improcedente",
            "motivo": "falta_tasa_y_prueba_material",
            "fuente": CANALN_EEUU,
        },
        "lima_1751": {
            "resultado": "improcedente",
            "motivo": "falta_tasa_y_prueba_material",
            "fuente": CANALN_LIMA,
        },
    }
    jne["nota_24jun"] = (
        "JEE improcedente documentado; apelación pleno sin resolución publicada al 24-jun 10:00."
    )


def patch_piura(data):
    norte = data["regions"]["norte"]
    for c in norte.get("convocatorias_futuras", []):
        if c.get("id") == "NORTE-PARO-023":
            c["verificacion_terreno_24jun"] = "no_confirmado"
            c["next_check"] = "2026-06-25T08:00:00-05:00"
            c["notas"] = (
                "24-jun AM: sin cobertura terreno adicional indexada. MIDAGRI lineamientos; "
                "gremio mantiene protesta. El Trébol libre al corte 23-jun."
            )
            break
    vg = data.get("verification_gaps_r4", {})
    for g in vg.get("gaps", []):
        if g.get("id") == "VG-R4-01":
            g["resultado"] = (
                "24-jun AM: sin confirmación terreno adicional. Tensión gremial activa; El Trébol libre."
            )
            g["verificado"] = CORTE
        elif g.get("id") == "VG-R4-02":
            g["resultado"] = (
                "JEE improcedente 647 EE.UU. + 1.751 Lima documentado. "
                "Pleno apelación sin resolución al 24-jun 10:00."
            )
            g["estado"] = "pendiente_pleno"
            g["verificado"] = CORTE


def patch_actores(data):
    actores = data.setdefault("actores_nacionales", [])
    by_name = {a.get("nombre"): a for a in actores}
    for nombre, fields in ACTORES_R4.items():
        if nombre in by_name:
            by_name[nombre].update(fields)
    for na in NEW_ACTORES:
        if not any(a.get("nombre") == na["nombre"] for a in actores):
            actores.append(na)


def patch_prediccion(data):
    p7 = data.setdefault("prediccion_7dias", {})
    p7["nota_metodologica"] = (
        "v3.9.9 24-jun: JNE pleno nulidad pendiente; Piura terreno no confirmado; "
        "ONPE meseta; montecarlo omitido."
    )


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    mc_before = json.dumps(data.get("montecarlo", {}), sort_keys=True)

    data["meta"]["version"] = "3.9.9"
    data["meta"]["last_update"] = CORTE
    data["meta"]["fecha_corte"] = CORTE
    data["meta"]["last_refresh_summary"] = (
        "v3.9.9 JNE JEE documentado + pleno pendiente 24-jun; Piura AM; cuentas dedup; "
        "+2 actores R4; montecarlo omitido."
    )

    si = data.setdefault("social_intelligence", {})
    si["fecha_corte"] = CORTE
    si["contexto"] = (
        "24-jun AM: JNE pleno sin resolución; JEE improcedente documentado. "
        "Piura sin terreno adicional. Cuentas deduplicadas. ONPE meseta +41.565."
    )
    si["dedup_corte"] = CORTE
    before = len(si.get("cuentas_emergentes", []))
    si["cuentas_emergentes"] = dedup_cuentas(si.get("cuentas_emergentes", []))
    si["dedup_removed"] = before - len(si["cuentas_emergentes"])

    patch_jne(data)
    patch_piura(data)
    patch_actores(data)
    patch_prediccion(data)

    g = data.setdefault("grassroots", {}).setdefault("meta", {})
    g["version"] = "3.9.9"
    g["dedup_notas"] = f"v3.9.9 cuentas sociales dedup {si['dedup_removed']} entradas"

    mc_after = json.dumps(data.get("montecarlo", {}), sort_keys=True)
    if mc_before != mc_after:
        raise SystemExit("montecarlo mutated — abort")

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    dup = sum(1 for c in si["cuentas_emergentes"] if (c.get("handle") or "") in CANONICAL_NAMES)
    print(f"v3.9.9 written — dedup -{si['dedup_removed']}, actores R4 ok, montecarlo=unchanged")


if __name__ == "__main__":
    main()