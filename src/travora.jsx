import React from 'react';

// Données locales de secours complètes
const LOCAL_BACKUP = {
  departures: [
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
  ],
  destinations: [
    {
      id: 'kenya',
      slug: 'kenya',
      name: 'Kenya (Nairobi, Maasai Mara & Diani)',
      visa_status: 'Autorisation eTA en ligne obligatoire (~34 USD)',
      visa: 'Demande en ligne sur www.etakenya.go.ke au moins 3 jours avant.',
      currency: 'Shilling kényan (KES)',
      best_season: 'Juillet à Octobre, Janvier à Mars',
      summary: 'Safaris mythiques au cœur du Maasai Mara, faune abondante, et plages de sable blanc à Diani.',
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
      summary: 'Plages infinies de sable doré, crevettes braisées au bord de l’eau et cascade unique tombant dans l’océan.',
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
      summary: 'La Teranga authentique, l’île mémoire de Gorée, balades en pirogue et hospitalité légendaire.',
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
  ]
};

// Fonction sécurisée d'appel à l'API Travora
export const tv = async (tool, args = {}) => {
  try {
    const url = `/api/travora?tool=${encodeURIComponent(tool)}&args=${encodeURIComponent(JSON.stringify(args))}`;
    const response = await fetch(url);
    const text = await response.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.warn(`[Travora Client] Réponse non-JSON reçue pour ${tool}, passage sur les données locales.`);
      return getLocalFallback(tool, args);
    }

    if (!response.ok || !json.data) {
      console.warn(`[Travora Client] Erreur ${response.status} de l'API, utilisation du secours local.`);
      return getLocalFallback(tool, args);
    }

    return json.data;
  } catch (err) {
    console.warn(`[Travora Client] Exception réseau (${err.message}), utilisation du secours local.`);
    return getLocalFallback(tool, args);
  }
};

function getLocalFallback(tool, args = {}) {
  if (tool === 'list_departures') {
    return LOCAL_BACKUP.departures;
  }
  if (tool === 'search_destinations') {
    const q = String(args.keyword || args.query || '').toLowerCase().trim();
    if (!q) return LOCAL_BACKUP.destinations;
    return LOCAL_BACKUP.destinations.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.summary.toLowerCase().includes(q)
    );
  }
  if (tool === 'get_destination') {
    const id = String(args.destination || args.id || '').toLowerCase().trim();
    return LOCAL_BACKUP.destinations.find(d =>
      d.id === id ||
      d.name.toLowerCase().includes(id)
    ) || LOCAL_BACKUP.destinations[0];
  }
  return LOCAL_BACKUP.destinations;
}

export const arr = o => {
  if (!o) return [];
  if (Array.isArray(o)) return o;
  if (typeof o === 'string') {
    const lines = o.split('\n').filter(l => l.trim().startsWith('-'));
    if (lines.length > 0) {
      return lines.map(line => {
        const clean = line.replace(/^-\s*/, '');
        const match = clean.match(/^([^(]+)\s*\(([^)]+)\)/);
        if (match) {
          return { name: match[1].trim(), iso2: match[2].trim(), id: match[2].trim() };
        }
        return { name: clean.trim(), id: clean.toLowerCase().replace(/\s+/g, '-') };
      });
    }
    return [{ name: o, id: 'item' }];
  }
  return [o];
};

export const lab = x => {
  if (!x) return '';
  if (typeof x === 'string') return x;
  return x.name || x.label || x.title || x.id || '';
};

export const idf = x => {
  if (!x) return '';
  if (typeof x === 'string') return x;
  return x.slug || x.id || x.code || x.iso2 || x.name || '';
};

export const Show = ({ data }) => {
  if (!data) return null;
  if (typeof data === 'string') {
    return (
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '14px', color: 'var(--text)' }}>
        {data}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="row">
          <span style={{ fontWeight: 600, color: 'var(--primary)', textTransform: 'capitalize' }}>
            {k.replace(/_/g, ' ')}
          </span>
          <span style={{ textAlign: 'right', color: 'var(--text)', maxWidth: '65%' }}>
            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
          </span>
        </div>
      ))}
    </div>
  );
};
