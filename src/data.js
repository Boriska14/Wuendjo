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

// Équipes et jeux par défaut (modifiables par l'organisateur). Aucune solution ici : l'espace participant les affiche.
export const DEFAULT_TEAMS = [
  { id: 'A', name: 'Les Aigles Bamiléké', size: 4 },
  { id: 'B', name: 'Les Lions de la Lobé', size: 4 }
];

export const DEFAULT_GAMES = [
  { id: 'g1', day: 'Jour 1', title: 'Naissance des clans', dur: '25-30 min', pts: 20, desc: 'Chaque équipe choisit un nom, un cri de ralliement et un symbole, répartit les rôles et se présente en 60 secondes.' },
  { id: 'g2', day: 'Jour 1', title: 'La publicité de l’objet impossible', dur: '30 min + 2 min', pts: 30, desc: 'Transformer un objet banal en invention extraordinaire : nom, trois fonctions, slogan et démonstration de 90 à 120 secondes.' },
  { id: 'g3', day: 'Jour 1', title: 'Le musée vivant', dur: '20 min', pts: 15, desc: 'Une statue humaine immobile à faire deviner à l’équipe adverse : lieu, invention ou scène.' },
  { id: 'g4', day: 'Jour 1-2', title: 'Bana insolite : défi photo', dur: '25-40 min', pts: 30, desc: 'Raconter une mini-histoire en trois photos, dans une zone autorisée et dans le respect des personnes.' },
  { id: 'g5', day: 'Jour 2', title: 'L’enquête des sept indices', dur: '25-35 min', pts: 20, desc: 'Identifier l’objet mystère en croisant sept indices et en justifiant son raisonnement.' },
  { id: 'g6', day: 'Jour 2', title: 'Le quiz inversé', dur: '20-25 min', pts: 15, desc: 'Inventer des questions dont les réponses sont imposées, puis répondre à celles de l’autre équipe.' },
  { id: 'g7', day: 'Jour 2', title: 'Le tribunal des idées absurdes', dur: '25 min', pts: 25, desc: 'Défendre avec humour une idée improbable en construisant un argumentaire.' },
  { id: 'g8', day: 'Jour 3', title: 'Reporter express', dur: '20-30 min', pts: 25, desc: 'Réaliser un mini-reportage sur une découverte, un paysage ou un moment du séjour.' },
  { id: 'g9', day: 'Jour 3', title: 'Relais des talents', dur: '20-30 min', pts: 20, desc: 'Faire découvrir un talent ou une compétence de chaque membre de l’équipe.' },
  { id: 'g10', day: 'Jour 3', title: 'Sculpture éphémère', dur: '20 min + 3 min', pts: 20, desc: 'Créer une œuvre collective avec des éléments naturels déjà tombés, sans dégrader le site.' },
  { id: 'g11', day: 'Jour 4', title: 'La mission secrète d’entraide', dur: '½ journée', pts: 15, desc: 'Une action utile et discrète par personne au bénéfice du groupe.' },
  { id: 'g12', day: 'Jour 4', title: 'Puzzle des quatre clés et coffre final', dur: '30-40 min', pts: 30, desc: 'Assembler les quatre clés et résoudre le message final, qui exige la coopération des deux équipes.' }
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

export const mk = (name, dest, mode = 'group', status = 'active', isExample = false) => ({
  id: 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
  name,
  dest,
  mode, // 'solo' ou 'group'
  status, // 'active', 'upcoming', 'completed', 'draft'
  isExample, // true si voyage de démonstration/gabarit, false si voyage réel de l'utilisateur
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
  declined: mode === 'solo' ? [] : [
    { id: 'd1', name: 'Kévin M.', date: '04 Août', why: 'Déplacement professionnel à ces dates, amusez-vous bien !' }
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
  teams: DEFAULT_TEAMS.map(x => ({ ...x })),
  games: DEFAULT_GAMES.map(x => ({ ...x })),
  forecast: [
    { id: 'f1', cat: 'Transport', l: 'Minibus + carburant', a: 130000 },
    { id: 'f2', cat: 'Hébergement', l: 'Chalets bord de mer', a: 260000 },
    { id: 'f3', cat: 'Nourriture', l: 'Repas et vivres du séjour', a: 150000 },
    { id: 'f4', cat: 'Activités', l: 'Pirogue, guides, entrées', a: 120000 },
    { id: 'f5', cat: 'Autre', l: 'Imprévus (≈10 %)', a: 60000 }
  ],
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
    ...mk('Kribi & Chutes de la Lobé', 'Kribi, Océan Atlantique (Cameroun)', 'group', 'active', true),
    dates: '12 au 18 Août 2027',
    pp: 180000,
    cap: 8,
    isExample: true
  },
  {
    ...mk('Retraite Solitaire des Hauts Plateaux', 'Bana & Bafoussam (Cameroun)', 'solo', 'upcoming', true),
    dates: '24 au 30 Octobre 2027',
    pp: 280000,
    cap: 1,
    isExample: true,
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
    ...mk('Safari Mythique du Maasai Mara', 'Maasai Mara & Nairobi (Kenya)', 'group', 'completed', true),
    dates: '05 au 12 Janvier 2026',
    pp: 650000,
    cap: 6,
    isExample: true,
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
