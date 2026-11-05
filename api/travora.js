// Proxy sécurisé pour l'API Travora avec fallbacks locaux
const TRAVORA_BASE = 'https://travora.guide/api/mcp';

const FALLBACK_DEPARTURES = [
  { iso2: 'cm', code: 'cm', id: 'cm', name: 'Cameroun' },
  { iso2: 'ci', code: 'ci', id: 'ci', name: 'Côte d’Ivoire' },
  { iso2: 'sn', code: 'sn', id: 'sn', name: 'Sénégal' },
  { iso2: 'bj', code: 'bj', id: 'bj', name: 'Bénin' },
  { iso2: 'tg', code: 'tg', id: 'tg', name: 'Togo' },
  { iso2: 'ga', code: 'ga', id: 'ga', name: 'Gabon' },
  { iso2: 'cd', code: 'cd', id: 'cd', name: 'RDC (Congo-Kinshasa)' },
  { iso2: 'ma', code: 'ma', id: 'ma', name: 'Maroc' },
  { iso2: 'fr', code: 'fr', id: 'fr', name: 'France' },
  { iso2: 'ke', code: 'ke', id: 'ke', name: 'Kenya' }
];

const FALLBACK_DESTINATIONS = [
  {
    id: 'kenya',
    slug: 'kenya',
    name: 'Kenya (Nairobi, Maasai Mara & Diani)',
    visa_status: 'Autorisation eTA en ligne obligatoire (~34 USD)',
    visa: 'Demande en ligne sur www.etakenya.go.ke au moins 3 jours avant le départ.',
    currency: 'Shilling kényan (KES)',
    best_season: 'Juillet à Octobre, Janvier à Mars',
    summary: 'Safaris mythiques au cœur du Maasai Mara, faune sauvage africaine, savane et plages de sable blanc à Diani.',
    security: 'Zones touristiques sécurisées avec guides certifiés.',
    daily_budget: '40 000 - 80 000 FCFA'
  },
  {
    id: 'cameroun-bana',
    slug: 'cameroun-bana',
    name: 'Vallée de Bana & Hauts Plateaux (Cameroun)',
    visa_status: 'National : CNI · Internationaux : eVisa Cameroun',
    visa: 'eVisa officiel sur evisacam.cm pour les non-résidents.',
    currency: 'Franc CFA (XAF)',
    best_season: 'Novembre à Mars (saison sèche fraîche)',
    summary: 'Paysages vallonnés féeriques, chefferies bamiléké grandioses, randonnées vivifiantes et hospitalité chaleureuse.',
    security: 'Région très calme et propice à l’écotourisme.',
    daily_budget: '25 000 - 50 000 FCFA'
  },
  {
    id: 'cameroun-kribi',
    slug: 'cameroun-kribi',
    name: 'Kribi & Chutes de la Lobé (Cameroun)',
    visa_status: 'National : CNI · Internationaux : eVisa Cameroun',
    visa: 'Passeport valide + eVisa pour les visiteurs étrangers.',
    currency: 'Franc CFA (XAF)',
    best_season: 'Décembre à Mai',
    summary: 'Plages infinies de sable doré, crevettes braisées au bord de l’eau et cascade unique tombant directement dans l’océan.',
    security: 'Station balnéaire paisible et accueillante.',
    daily_budget: '30 000 - 60 000 FCFA'
  },
  {
    id: 'senegal',
    slug: 'senegal',
    name: 'Sénégal (Dakar, Gorée & Sine Saloum)',
    visa_status: 'Exemption de visa pour CEDEAO & Union Européenne',
    visa: 'Passeport en cours de validité (plus de 6 mois).',
    currency: 'Franc CFA (XOF)',
    best_season: 'Novembre à Mai',
    summary: 'La Teranga authentique, l’île mémoire de Gorée, balades en pirogue dans le delta du Saloum et hospitalité légendaire.',
    security: 'Pays stable et chaleureux.',
    daily_budget: '30 000 - 65 000 FCFA'
  },
  {
    id: 'cote-ivoire',
    slug: 'cote-ivoire',
    name: 'Côte d’Ivoire (Assinie & Grand-Bassam)',
    visa_status: 'Exemption CEDEAO · eVisa préalable pour les autres pays',
    visa: 'eVisa biométrique sur snedai.com pour les non-ressortissants CEDEAO.',
    currency: 'Franc CFA (XOF)',
    best_season: 'Novembre à Avril',
    summary: 'Lagunes paradisiaques, gastronomie ivoirienne (Attiéké-poisson braisé, Alloco), culture et vie nocturne vibrante.',
    security: 'Bonnes infrastructures touristiques.',
    daily_budget: '35 000 - 75 000 FCFA'
  },
  {
    id: 'maroc',
    slug: 'maroc',
    name: 'Maroc (Marrakech, Taghazout & Atlas)',
    visa_status: 'Sans visa pour nombreux pays · eVisa pour ressortissants camerounais',
    visa: 'Vérifiez sur acces-maroc.ma selon votre nationalité.',
    currency: 'Dirham marocain (MAD)',
    best_season: 'Mars à Mai, Octobre à Décembre',
    summary: 'Médinas impériales, randonnées dans les montagnes du Toubkal, surf atlantique et délices culinaires.',
    security: 'Excellente sécurité touristique.',
    daily_budget: '30 000 - 70 000 FCFA'
  }
];

export async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const { tool, args } = req.query;
  if (!tool) {
    return res.status(400).json({ error: 'Paramètre tool manquant', data: null });
  }

  let parsedArgs = {};
  if (args) {
    try {
      parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
    } catch {
      parsedArgs = {};
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const upstream = await fetch(TRAVORA_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Wuendjo-Travel-App/2.0'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: tool,
          arguments: parsedArgs
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const rawText = await upstream.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.warn(`[Travora Upstream] Réponse non-JSON reçue pour ${tool}, utilisation du fallback.`);
      return res.status(200).json({
        data: getFallbackData(tool, parsedArgs),
        source: 'local_fallback',
        notice: 'Upstream non-JSON'
      });
    }

    if (!upstream.ok || data.error) {
      return res.status(200).json({
        data: getFallbackData(tool, parsedArgs),
        source: 'local_fallback',
        notice: data.error?.message || 'Upstream error'
      });
    }

    const toolResult = data.result?.content?.[0]?.text || data.result;
    return res.status(200).json({
      data: toolResult || getFallbackData(tool, parsedArgs),
      source: 'upstream'
    });
  } catch (err) {
    console.warn(`[Travora Upstream] Échec réseau (${err.message}) pour ${tool}, utilisation du secours.`);
    return res.status(200).json({
      data: getFallbackData(tool, parsedArgs),
      source: 'local_fallback',
      notice: err.message
    });
  }
}

function getFallbackData(tool, args = {}) {
  if (tool === 'list_departures') {
    return FALLBACK_DEPARTURES;
  }
  if (tool === 'search_destinations') {
    const q = String(args.keyword || args.query || '').toLowerCase().trim();
    if (!q) return FALLBACK_DESTINATIONS;
    return FALLBACK_DESTINATIONS.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.summary.toLowerCase().includes(q)
    );
  }
  if (tool === 'get_destination') {
    const id = String(args.destination || args.id || '').toLowerCase().trim();
    return FALLBACK_DESTINATIONS.find(d =>
      d.id === id ||
      d.name.toLowerCase().includes(id)
    ) || FALLBACK_DESTINATIONS[0];
  }
  return FALLBACK_DESTINATIONS;
}
