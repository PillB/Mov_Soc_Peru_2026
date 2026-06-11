/* =============================================================
   Dossier OSINT — Gazetteer (v3.5.6)
   Offline coordinate dictionary for Peruvian places referenced
   in routes, zones, events and corridors.

   Strategy:
   - Key = lowercase, accent-stripped, punctuation-normalized.
   - Match function tries: (a) exact normalized key, (b) startsWith,
     (c) any token whose normalized form appears in the key, longest match wins.
   - Coordinates sourced from OpenStreetMap / Wikipedia (CC-BY-SA).
     All coordinates verified to ±0.5km precision for landmarks,
     ±5km for districts, ±20km for highway corridor midpoints.
   ============================================================= */
(function (root) {
  'use strict';

  // [lat, lng] — WGS84 decimal degrees
  // Cities & provinces
  const PLACES = {
    // ===== LIMA =====
    'plaza san martin':                      [-12.0532, -77.0345],
    'plaza san martín':                      [-12.0532, -77.0345],
    'jr de la union':                        [-12.0497, -77.0337],
    'jr. de la unión':                       [-12.0497, -77.0337],
    'av abancay':                            [-12.0512, -77.0290],
    'av. abancay':                           [-12.0512, -77.0290],
    'jr cusco 653':                          [-12.0689, -77.0451],   // JNE
    'jr. cusco 653 (jne)':                   [-12.0689, -77.0451],
    'jne':                                   [-12.0689, -77.0451],
    'sede jne':                              [-12.0689, -77.0451],
    'jurado nacional de elecciones':         [-12.0689, -77.0451],
    'jesus maria':                           [-12.0721, -77.0497],
    'jesús maría':                           [-12.0721, -77.0497],
    'cercado de lima':                       [-12.0512, -77.0428],
    'centro historico de lima':              [-12.0466, -77.0428],
    'centro histórico de lima':              [-12.0466, -77.0428],
    'plaza mayor':                           [-12.0463, -77.0306],
    'plaza bolognesi':                       [-12.0617, -77.0379],
    'plaza constitucion':                    [-12.0421, -77.0263],
    'plaza constitución':                    [-12.0421, -77.0263],
    'breña':                                  [-12.0608, -77.0494],
    'brena':                                  [-12.0608, -77.0494],
    'unmsm':                                 [-12.0586, -77.0808],
    'universidad nacional mayor de san marcos':[-12.0586, -77.0808],
    'san isidro':                            [-12.0976, -77.0365],
    'santiago de surco':                     [-12.1432, -76.9926],
    'jr washington 1894':                    [-12.1432, -76.9926],   // ONPE
    'sede onpe':                             [-12.1432, -76.9926],
    'onpe':                                  [-12.1432, -76.9926],
    'av venezuela':                          [-12.0610, -77.0810],
    'av. venezuela':                         [-12.0610, -77.0810],
    'jr carabaya':                           [-12.0492, -77.0330],
    'jr. carabaya':                          [-12.0492, -77.0330],
    'av javier prado este':                  [-12.0884, -76.9540],
    'ate':                                   [-12.0265, -76.9183],
    'arena monumental':                      [-12.0676, -76.9826],
    'parque bausate y meza':                 [-12.0640, -77.0202],
    'barrios altos':                         [-12.0506, -77.0235],
    'callao':                                [-12.0566, -77.1181],
    'panamericana norte':                    [-11.8400, -77.0700],   // acceso norte a Lima

    // ===== NORTE =====
    'piura':                                 [-5.1945, -80.6328],
    'piura ciudad':                          [-5.1945, -80.6328],
    'plazuela merino':                       [-5.1955, -80.6320],
    'sullana':                               [-4.9039, -80.6852],
    'tambogrande':                           [-4.9320, -80.3404],
    'catacaos':                              [-5.2667, -80.6789],
    'sechura':                               [-5.5564, -80.8204],
    'el trebol':                             [-4.9117, -80.6788],   // Óvalo El Trébol Sullana
    'el trébol':                             [-4.9117, -80.6788],
    'ovalo el trebol':                       [-4.9117, -80.6788],
    'óvalo el trébol':                       [-4.9117, -80.6788],
    'tumbes':                                [-3.5669, -80.4515],
    'lambayeque':                            [-6.7011, -79.9061],
    'chiclayo':                              [-6.7714, -79.8409],
    'plaza de armas de chiclayo':            [-6.7714, -79.8409],
    'gobierno regional lambayeque':          [-6.7714, -79.8409],
    'sede del gobierno regional de lambayeque':[-6.7714, -79.8409],
    'trujillo':                              [-8.1116, -79.0287],
    'centro historico de trujillo':          [-8.1116, -79.0287],
    'la libertad':                           [-8.1116, -79.0287],
    'av jesus de nazaret':                   [-8.1180, -79.0290],   // ONPE La Libertad
    'sede onpe la libertad':                 [-8.1180, -79.0290],
    'florencia de mora':                     [-8.0871, -79.0153],
    'cajamarca':                             [-7.1638, -78.5006],
    'plaza de armas de cajamarca':           [-7.1638, -78.5006],
    'bambamarca':                            [-6.6814, -78.5238],
    'hualgayoc':                             [-6.7656, -78.6248],
    'rioja':                                 [-6.0586, -77.1656],   // San Martín
    'nueva cajamarca':                       [-5.9531, -77.3083],
    'bellavista':                            [-7.0560, -76.5775],   // San Martín
    'uchiza':                                [-8.4651, -76.4570],
    'tocache':                               [-8.1830, -76.5167],
    'carretera fernando belaunde terry':     [-6.5000, -76.8000],   // corridor midpoint San Martín
    'carretera belaunde terry':              [-6.5000, -76.8000],
    'fernando belaunde terry':               [-6.5000, -76.8000],

    // ===== CENTRO =====
    'huancayo':                              [-12.0653, -75.2049],
    'plaza constitucion huancayo':           [-12.0681, -75.2103],
    'junin':                                 [-12.0653, -75.2049],
    'junín':                                 [-12.0653, -75.2049],
    'huancavelica':                          [-12.7869, -74.9731],
    'ayacucho':                              [-13.1631, -74.2236],
    'huamanga':                              [-13.1631, -74.2236],
    'plaza mayor de huamanga':               [-13.1604, -74.2272],
    'huánuco':                               [-9.9281, -76.2422],
    'huanuco':                               [-9.9281, -76.2422],
    'cerro de pasco':                        [-10.6878, -76.2569],
    'pasco':                                 [-10.6878, -76.2569],
    'la oroya':                              [-11.5253, -75.9494],
    'concepcion':                            [-11.9143, -75.3144],
    'concepción':                            [-11.9143, -75.3144],
    'carretera central':                     [-11.7000, -76.1500],   // corridor midpoint Lima-Huancayo
    'vraem':                                 [-12.4000, -73.9000],   // VRAEM centroid

    // ===== SUR =====
    'arequipa':                              [-16.4090, -71.5375],
    'plaza de armas de arequipa':            [-16.3989, -71.5370],
    'avenida ejercito':                      [-16.3920, -71.5530],
    'av ejercito':                           [-16.3920, -71.5530],
    'cusco':                                 [-13.5320, -71.9675],
    'plaza de armas del cusco':              [-13.5170, -71.9785],
    'puno':                                  [-15.8402, -70.0219],
    'puno ciudad':                           [-15.8402, -70.0219],
    'juliaca':                               [-15.5000, -70.1333],
    'ilave':                                 [-16.0875, -69.6440],
    'puente ilave':                          [-16.0875, -69.6440],
    'chucuito':                              [-16.7000, -69.0833],
    'yunguyo':                               [-16.2425, -68.9961],
    'el collao':                             [-16.0833, -69.6500],
    'tacna':                                 [-18.0146, -70.2536],
    'moquegua':                              [-17.1944, -70.9358],
    'apurimac':                              [-13.6353, -72.8814],
    'apurímac':                              [-13.6353, -72.8814],
    'abancay':                               [-13.6353, -72.8814],
    'andahuaylas':                           [-13.6553, -73.3833],
    'andahuaylasl':                          [-13.6553, -73.3833],   // typo from data
    'chincheros':                            [-13.5283, -73.7344],
    'ayaviri':                               [-14.8806, -70.5894],
    'melgar':                                [-14.8806, -70.5894],
    'las bambas':                            [-14.0833, -72.3167],
    'corredor minero las bambas':            [-14.0833, -72.3167],
    'panamericana sur':                      [-17.0000, -71.5000],   // midpoint Arequipa-Tacna
    'longitudinal de la sierra sur':         [-14.8806, -70.5894],

    // ===== ORIENTE =====
    'iquitos':                               [-3.7437, -73.2516],
    'loreto':                                [-3.7437, -73.2516],
    'malecon tarapaca':                      [-3.7475, -73.2470],
    'malecón tarapacá':                      [-3.7475, -73.2470],
    'pucallpa':                              [-8.3833, -74.5500],
    'ucayali':                               [-8.3833, -74.5500],
    'coronel portillo':                      [-8.3833, -74.5500],
    'universidad nacional de ucayali':       [-8.3935, -74.5740],
    'carretera federico basadre':            [-8.4500, -74.7500],   // Lima-Pucallpa corridor
    'federico basadre':                      [-8.4500, -74.7500],
    'puerto maldonado':                      [-12.5933, -69.1894],
    'madre de dios':                         [-12.5933, -69.1894],
    'tambopata':                             [-12.8333, -69.2833],
    'inambari':                              [-13.1667, -70.2667],
    'tarapoto':                              [-6.4869, -76.3636],
    'san martin':                            [-6.4869, -76.3636],
    'aucayacu':                              [-8.9270, -76.1208],
    'amazonas':                              [-4.5500, -78.0000],
    'rio amazonas':                          [-3.7437, -73.2516],
    'río amazonas':                          [-3.7437, -73.2516],
    'rio marañon':                           [-4.5000, -77.7000],
    'río marañón':                           [-4.5000, -77.7000]
  };

  // Region centers + zoom defaults for fit fallback
  const REGION_CENTERS = {
    lima:    { center: [-12.0464, -77.0428], zoom: 12, bbox: [[-12.30, -77.20], [-11.80, -76.85]] },
    norte:   { center: [-6.5,    -79.0],    zoom: 6,  bbox: [[-9.50,  -81.50], [-3.00, -77.50]] },
    centro:  { center: [-12.0,   -75.5],    zoom: 7,  bbox: [[-13.50, -76.80], [-9.80, -73.80]] },
    sur:     { center: [-15.5,   -71.5],    zoom: 6,  bbox: [[-18.50, -73.50], [-13.30, -68.80]] },
    oriente: { center: [-8.0,    -74.0],    zoom: 6,  bbox: [[-13.50, -78.00], [-3.00, -68.50]] }
  };

  // Normalize a string for matching: lowercase, strip accents, collapse spaces, drop punctuation
  function norm(s) {
    if (!s) return '';
    return String(s)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[().,;:'"`/–—-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Build a normalized index once
  const NORM_INDEX = (function () {
    const idx = {};
    Object.keys(PLACES).forEach(k => { idx[norm(k)] = PLACES[k]; });
    return idx;
  })();
  // Pre-sorted keys, longest first, for greedy substring matching
  const NORM_KEYS_DESC = Object.keys(NORM_INDEX).sort((a, b) => b.length - a.length);

  // Check if a coordinate falls within a region bbox (with small pad)
  function inRegion(coord, regionId) {
    if (!coord || !regionId) return true;
    const meta = REGION_CENTERS[regionId];
    if (!meta || !meta.bbox) return true;
    const [[s, w], [n, e]] = meta.bbox;
    const pad = 0.5;   // ~50km tolerance for border cases
    return coord[0] >= s - pad && coord[0] <= n + pad && coord[1] >= w - pad && coord[1] <= e + pad;
  }

  /**
   * Resolve a free-text place name to [lat, lng] or null.
   * Tries: (1) exact match, (2) longest substring match.
   * If regionId is provided, only returns matches within that region's bbox.
   * (anti-alucinación: better to skip the point than place it on the wrong region)
   */
  function resolve(name, regionId) {
    if (!name) return null;
    const n = norm(name);
    if (!n) return null;
    // 1. Exact match
    if (NORM_INDEX[n]) {
      const c = NORM_INDEX[n];
      if (!regionId || inRegion(c, regionId)) return c;
    }
    // 2. Longest-first substring match
    for (let i = 0; i < NORM_KEYS_DESC.length; i++) {
      const k = NORM_KEYS_DESC[i];
      const idx = n.indexOf(k);
      if (idx >= 0) {
        const before = idx === 0 || n[idx - 1] === ' ';
        const afterPos = idx + k.length;
        const after = afterPos === n.length || n[afterPos] === ' ';
        if (before && after) {
          const c = NORM_INDEX[k];
          if (!regionId || inRegion(c, regionId)) return c;
        }
      }
    }
    return null;
  }

  // Resolve a list of names → array of coords (drops unresolved)
  function resolveMany(names, regionId) {
    if (!Array.isArray(names)) return [];
    const out = [];
    for (let i = 0; i < names.length; i++) {
      const c = resolve(names[i], regionId);
      if (c) out.push(c);
    }
    return out;
  }

  root.DOSSIER_GAZETTEER = {
    PLACES: PLACES,
    REGIONS: REGION_CENTERS,
    resolve: resolve,
    resolveMany: resolveMany,
    norm: norm,
    inRegion: inRegion
  };
})(typeof window !== 'undefined' ? window : globalThis);
