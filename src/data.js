export const TYPES = [
  'Explorateur serein',
  'Aventurier actif',
  'Gourmet & Terroir',
  'Photographe & Créatif',
  'Amateur de culture & patrimoine'
];

export const DAYS = [
  {
    day: 'Jour 1',
    title: 'Clé 1 : Immersion & Racines',
    desc: 'Rencontre avec les gardiens de la tradition et énigme d’ouverture.',
    clue: 'Au pied du baobab centenaire se cache la première boussole.'
  },
  {
    day: 'Jour 2',
    title: 'Clé 2 : Terroir & Partage',
    desc: 'Épreuve culinaire locale et collecte d’ingrédients secrets.',
    clue: 'Le goût de l’épice jaune vous mènera au marché des artisans.'
  },
  {
    day: 'Jour 3',
    title: 'Clé 3 : Nature & Dépassement',
    desc: 'Randonnée des crêtes ou expédition vers les cascades sacrées.',
    clue: 'Là où l’eau frappe la roche rouge, le troisième symbole attend.'
  },
  {
    day: 'Jour 4',
    title: 'Clé 4 : Célébration & Unité',
    desc: 'Grande veillée autour du feu et révélation du totem Wuendjo.',
    clue: 'Assemblez les 4 fragments pour ouvrir le coffre d’amitié.'
  }
];

export const SUGGESTIONS = [
  {
    id: 'sug-kribi-chutes',
    title: 'Chutes de la Lobé & Balade en pirogue',
    category: 'activite',
    suitability: ['solo', 'group'],
    location: 'Kribi',
    country: 'Cameroun',
    rating: 4.9,
    cost: '5 000 - 15 000 FCFA',
    description: 'Une merveille naturelle mondiale où le fleuve Lobé se jette directement dans l’Océan Atlantique en cascades spectaculaires.',
    highlight: 'Dégustation de crevettes braisées au bord de l’eau'
  },
  {
    id: 'sug-kribi-crevettes',
    title: 'Restaurant Débarcadère de la Lobé',
    category: 'restaurant',
    suitability: ['solo', 'group'],
    location: 'Plage de la Lobé',
    country: 'Cameroun',
    rating: 4.8,
    cost: '6 000 - 12 000 FCFA',
    description: 'Les fameuses crevettes géantes (« Kribi ») pêchées du matin, grillées au feu de bois avec bâtons de manioc et piment doux.',
    highlight: 'Cadre les pieds dans le sable chaud face aux rouleaux'
  },
  {
    id: 'sug-bana-chefferie',
    title: 'Royaume & Chefferie Supérieure de Bana',
    category: 'destination',
    suitability: ['solo', 'group'],
    location: 'Hauts Plateaux de l’Ouest',
    country: 'Cameroun',
    rating: 4.9,
    cost: '3 000 - 10 000 FCFA',
    description: 'Immersion au cœur de l’art bamiléké : piliers sculptés ancestraux, forêt sacrée, musée du patrimoine royal et vue panoramique.',
    highlight: 'Architecture traditionnelle en bambou et raphia'
  },
  {
    id: 'sug-bana-rando',
    title: 'Trek des Collines de la Vallée de Bana',
    category: 'activite',
    suitability: ['solo', 'group'],
    location: 'Bana / Bandja',
    country: 'Cameroun',
    rating: 4.7,
    cost: 'Gratuit / Guide 10 000 FCFA',
    description: 'Randonnée vivifiante à travers les plantations de café arabica, cascades cachées et crêtes brumeuses des monts de l’Ouest.',
    highlight: 'Air frais d’altitude et panoramas à couper le souffle'
  },
  {
    id: 'sug-mara-safari',
    title: 'Grande Traversée du Maasai Mara',
    category: 'destination',
    suitability: ['solo', 'group'],
    location: 'Maasai Mara',
    country: 'Kenya',
    rating: 5.0,
    cost: '35 000 - 75 000 KES / jour',
    description: 'Le sanctuaire animalier le plus célèbre d’Afrique de l’Est : lions, éléphants, guépards et le spectacle des troupeaux en liberté.',
    highlight: 'Lever de soleil inoubliable sur la savane dorée'
  },
  {
    id: 'sug-mara-diner',
    title: 'Boma Barbecue sous les Étoiles du Mara',
    category: 'restaurant',
    suitability: ['group', 'solo'],
    location: 'Mara River',
    country: 'Kenya',
    rating: 4.9,
    cost: '15 000 - 30 000 FCFA équiv.',
    description: 'Dîner traditionnel autour d’un grand feu de camp avec viandes grillées (Nyama Choma), ugali et chants masaï au crépuscule.',
    highlight: 'Ambiance chaleureuse et ciel étoilé immaculé'
  },
  {
    id: 'sug-dakar-almadies',
    title: 'Cabanon des Almadies & Thieboudienne',
    category: 'restaurant',
    suitability: ['solo', 'group'],
    location: 'Pointe des Almadies, Dakar',
    country: 'Sénégal',
    rating: 4.8,
    cost: '5 000 - 12 000 FCFA',
    description: 'Poisson frais du jour, riz rouge aux légumes marinés et jus de bissap glacé devant le coucher du soleil le plus occidental d’Afrique.',
    highlight: 'Le goût authentique de la Teranga sénégalaise'
  },
  {
    id: 'sug-dakar-goree',
    title: 'Maison des Esclaves & Ruelles de Gorée',
    category: 'destination',
    suitability: ['solo', 'group'],
    location: 'Île de Gorée',
    country: 'Sénégal',
    rating: 4.9,
    cost: '5 000 FCFA (Chaloupe + musée)',
    description: 'Une île piétonne chargée d’histoire, avec ses façades coloniales aux teintes pastel et bougainvilliers éclatants.',
    highlight: 'Visite guidée émouvante et artisans peintres sur sable'
  }
];

export const mk = (name, dest, mode = 'group', status = 'active') => ({
  id: 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
  name,
  dest,
  mode, // 'solo' ou 'group'
  status, // 'active', 'upcoming', 'completed', 'draft'
  dates: '12 au 18 Août 2027',
  pp: mode === 'solo' ? 320000 : 180000,
  cap: mode === 'solo' ? 1 : 8,
  wa: 'https://chat.whatsapp.com/demo-wuendjo',
  bereal: 'https://bere.al/demo-wuendjo',
  description: mode === 'solo'
    ? 'Voyage d’exploration en autonomie : découverte des trésors locaux, ressourcement et carnet de route.'
    : 'Aventure collective conviviale : défis des 4 clés, découverte locale et souvenirs partagés.',
  people: [
    { id: 'me', name: 'Boris (Moi)', age: 28, job: 'Architecte digital', phone: '+237 690 00 00', type: 'Aventurier actif', diet: 'Sans arachides', why: 'Découvrir les trésors cachés de la région', st: 'ok', plan: '3' },
    ...(mode === 'solo' ? [] : [
      { id: 'p2', name: 'Nadine', age: 26, job: 'Designer textile', phone: '+237 671 11 11', type: 'Photographe & Créatif', diet: 'Végétarienne', why: 'Créer un carnet de motifs locaux', st: 'ok', plan: 'full' },
      { id: 'p3', name: 'Cédric', age: 31, job: 'Ingénieur agronome', phone: '+237 694 22 22', type: 'Gourmet & Terroir', diet: 'Tout', why: 'Goûter la cuisine du terroir', st: 'ok', plan: '3' },
      { id: 'p4', name: 'Aminata', age: 27, job: 'Médecin', phone: '+221 77 33 33', type: 'Explorateur serein', diet: 'Halal', why: 'Me ressourcer en pleine nature', st: 'wait', plan: '' }
    ])
  ],
  itinerary: [
    { day: 'Jour 1', time: '09:00', title: 'Départ & Arrivée sur site', desc: 'Installation dans les hébergements et accueil traditionnel.' },
    { day: 'Jour 2', time: '10:30', title: 'Randonnée & Clé de la Découverte', desc: 'Exploration guidée des sentiers et initiation artisanale.' },
    { day: 'Jour 3', time: '12:30', title: 'Grand Festin du Terroir', desc: 'Dégustation des spécialités culinaires avec les chefs locaux.' },
    { day: 'Jour 4', time: '18:00', title: 'Veillée & Bilan du séjour', desc: 'Partage des récits de voyage et remise des distinctions Wuendjo.' }
  ],
  checklist: [
    { id: 'c1', text: 'Pièce d’identité / Passeport en cours de validité', done: true, category: 'Administratif' },
    { id: 'c2', text: 'Trousse de premiers secours et anti-moustique', done: true, category: 'Santé' },
    { id: 'c3', text: 'Chaussures de marche adaptées aux sentiers', done: false, category: 'Équipement' },
    { id: 'c4', text: 'Lampe frontale et batterie de secours solaire', done: true, category: 'Équipement' },
    { id: 'c5', text: 'Espèces locales (FCFA) pour marchés de village', done: false, category: 'Budget' }
  ],
  // Grand livre de dépenses avec catégories précises pour le graphique Recharts
  ledger: [
    { l: 'Frais de transport & carburant minibus', s: -125000, cat: 'Transport', date: '02 Août' },
    { l: 'Réservation écolodge & chalets bord de mer', s: -240000, cat: 'Hébergement', date: '04 Août' },
    { l: 'Approvisionnement vivres frais & dîner d’arrivée', s: -85000, cat: 'Nourriture', date: '05 Août' },
    { l: 'Pass d’accès parc naturel & guides écotourisme', s: -65000, cat: 'Activités', date: '07 Août' },
    { l: 'Dégustation crevettes braisées au débarcadère', s: -45000, cat: 'Nourriture', date: '08 Août' },
    { l: 'Navette 4x4 vers les hauts plateaux', s: -55000, cat: 'Transport', date: '10 Août' },
    { l: 'Location pirogues & matériel d’expédition', s: -35000, cat: 'Activités', date: '11 Août' },
    { l: 'Apport initial / Cotisations confirmées', s: 800000, cat: 'Entrées', date: '01 Août' }
  ],
  // Catégories du budget planifié
  budgetPlan: {
    transport: 220000,
    hebergement: 280000,
    nourriture: 160000,
    activites: 140000
  },
  scores: [
    { team: 'A', pts: 45, why: 'Énigme de la chefferie résolue' },
    { team: 'B', pts: 40, why: 'Épreuve des épices réussie' },
    { team: 'A', pts: 20, why: 'Photo du plus beau coucher de soleil' }
  ],
  done: ['c1-k1', 'c2-k2'],
  clues: [
    'Le vieux fromager regarde vers l’étoile du Sud.',
    'Là où les vagues murmurent, le coffre repose sous trois galets noirs.'
  ],
  ideas: [
    { k: 'Restaurant', n: 'Débarcadère de la Lobé', z: 'Crevettes braisées et vue sur l’océan', v: 4 },
    { k: 'Activité', n: 'Descente du fleuve en pirogue traditionnelle', z: 'Avec les pêcheurs locaux au petit matin', v: 3 },
    { k: 'Visite', n: 'Case patrimoniale des chefs bâtisseurs', z: 'Artisanat et masques rituels', v: 2 }
  ],
  notes: [
    { id: 'n1', date: '10 Août · 18:30', text: 'Arrivée magique au village. L’accueil chaleureux et les odeurs de bois brûlé donnent le ton du séjour.' },
    { id: 'n2', date: '11 Août · 12:15', text: 'La vue depuis la crête est splendide. On aperçoit toute la canopée sous une brume légère.' }
  ],
  msgs: [
    { w: 'Organisateur', x: 'Bienvenue sur Wuendjo ! Préparez vos sacs légers et vos bonnes baskets.', t: '10:00' },
    { w: 'Nadine', x: 'Trop hâte ! Mon appareil photo est déjà chargé.', t: '10:14' },
    { w: 'Cédric', x: 'J’ai repéré les meilleures adresses pour le poisson braisé.', t: '10:30' }
  ],
  pays: [
    { name: 'Nadine', l: 'Paiement unique (100 %)', a: 180000, ok: true },
    { name: 'Cédric', l: '1er versement (50 %)', a: 90000, ok: true },
    { name: 'Boris (Moi)', l: '1er versement (50 %)', a: 90000, ok: true }
  ]
});

export const seed = () => [
  {
    ...mk('Kribi & Chutes de la Lobé', 'Kribi, Océan Atlantique (Cameroun)', 'group', 'active'),
    dates: '12 au 18 Août 2027',
    pp: 180000,
    cap: 8
  },
  {
    ...mk('Retraite Solitaire des Hauts Plateaux', 'Bana & Bafoussam (Cameroun)', 'solo', 'upcoming'),
    dates: '24 au 30 Octobre 2027',
    pp: 280000,
    cap: 1,
    budgetPlan: {
      transport: 75000,
      hebergement: 120000,
      nourriture: 55000,
      activites: 30000
    },
    ledger: [
      { l: 'Billet de train & navette Ouest', s: -45000, cat: 'Transport', date: '01 Oct' },
      { l: 'Chambre d’hôtes sur les collines', s: -70000, cat: 'Hébergement', date: '03 Oct' },
      { l: 'Fonds alloués au voyage solo', s: 280000, cat: 'Entrées', date: '01 Oct' }
    ]
  },
  {
    ...mk('Safari Mythique du Maasai Mara', 'Maasai Mara & Nairobi (Kenya)', 'group', 'completed'),
    dates: '05 au 12 Janvier 2026',
    pp: 650000,
    cap: 6,
    budgetPlan: {
      transport: 280000,
      hebergement: 210000,
      nourriture: 90000,
      activites: 70000
    },
    ledger: [
      { l: 'Véhicules 4x4 Safari avec chauffeur', s: -260000, cat: 'Transport', date: '05 Jan' },
      { l: 'Tented Camp au bord de la rivière', s: -200000, cat: 'Hébergement', date: '06 Jan' },
      { l: 'Restauration complète safari', s: -85000, cat: 'Nourriture', date: '07 Jan' },
      { l: 'Droits d’entrée réserve nationale', s: -68000, cat: 'Activités', date: '08 Jan' },
      { l: 'Cotisations totales du groupe', s: 650000, cat: 'Entrées', date: '01 Jan' }
    ]
  }
];
