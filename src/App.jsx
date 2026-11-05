import React, { useEffect, useState } from 'react';
import { Ctx, cur } from './ctx.js';
import { seed } from './data.js';

import Home from './views/Home.jsx';
import Games from './views/Games.jsx';
import Chat from './views/Chat.jsx';
import Ideas from './views/Ideas.jsx';
import Budget from './views/Budget.jsx';
import Visa from './views/Visa.jsx';
import Guide from './views/Guide.jsx';
import Manage from './views/Manage.jsx';
import History from './views/History.jsx';

import {
  Compass,
  Home as HomeIcon,
  Sparkles,
  Wallet,
  Trophy,
  MessageCircle,
  BookOpen,
  Globe,
  Settings,
  History as HistoryIcon,
  Plus
} from 'lucide-react';

const V = {
  home: Home,
  idees: Ideas,
  budget: Budget,
  jeux: Games,
  chat: Chat,
  visa: Visa,
  history: History,
  guide: Guide,
  gerer: Manage
};

const load = () => {
  try {
    const x = localStorage.getItem('wuendjo_v2');
    if (x) {
      const parsed = JSON.parse(x);
      if (parsed && Array.isArray(parsed.trips) && parsed.trips.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return {
    role: 'o',
    tab: 'home',
    t: 0,
    trips: seed()
  };
};

export default function App() {
  const [S, setS] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem('wuendjo_v2', JSON.stringify(S));
    } catch {}
  }, [S]);

  const upd = f => setS(s => {
    const n = structuredClone(s);
    f(n);
    return n;
  });

  const t = cur(S);
  const isSolo = t.mode === 'solo';
  const org = isSolo || S.role === 'o';
  const me = (t.people || []).find(p => p.id === 'me');
  const ok = isSolo || org || me?.st === 'ok';

  const tab = (!org && (S.tab === 'gerer' || S.tab === 'guide')) ? 'home' : S.tab;
  const go = k => upd(s => { s.tab = k; });
  const View = V[tab] || Home;

  const baseNav = [
    ['home', 'Accueil & Itinéraire', <HomeIcon size={16} key="home" />],
    ['budget', 'Budget & Répartition', <Wallet size={16} key="budget" />],
    ['idees', 'Idées & Suggestions', <Sparkles size={16} key="idees" />],
    ['jeux', isSolo ? 'Quêtes Solo' : 'Défis & Clans', <Trophy size={16} key="jeux" />],
    ['chat', isSolo ? 'Journal de bord' : 'Discussion', isSolo ? <BookOpen size={16} key="chat" /> : <MessageCircle size={16} key="chat" />],
    ['visa', 'Visas & Conseils', <Globe size={16} key="visa" />],
    ['history', 'Historique & Voyages', <HistoryIcon size={16} key="history" />]
  ];

  if (org) {
    if (!isSolo) {
      baseNav.push(['guide', 'Guide Maître du Jeu', <Compass size={16} key="guide" />]);
    }
    baseNav.push(['gerer', 'Gérer le voyage', <Settings size={16} key="gerer" />]);
  }

  return (
    <Ctx.Provider value={{ S, t, me, org, ok, upd, go }}>
      <div id="app">
        {/* HEADER PRINCIPAL DU SITE */}
        <header className="site-header">
          <div className="site-header-inner">
            {/* Zone Marque */}
            <div className="brand-wrap" onClick={() => go('home')}>
              <div className="brand-logo-mark">W</div>
              <div>
                <h1 className="brand-text-title">Wuendjo</h1>
                <span className="brand-tagline">Voyager seul ou en groupe</span>
              </div>
            </div>

            {/* Contrôles du voyage actif & Rôle */}
            <div className="header-controls">
              {/* Sélecteur de voyage */}
              <div className="trip-select-box">
                <Compass size={16} color="var(--accent)" style={{ marginLeft: '4px' }} />
                <select
                  value={S.t}
                  onChange={e => upd(s => { s.t = +e.target.value; s.tab = 'home'; })}
                  aria-label="Sélectionner un voyage"
                  style={{
                    margin: 0,
                    padding: '7px 10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    maxWidth: '220px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    minHeight: 'auto',
                    boxShadow: 'none'
                  }}
                >
                  {(S.trips || []).map((x, i) => (
                    <option key={i} value={i}>
                      {x.name} ({x.mode === 'solo' ? 'Solo' : 'Groupe'})
                    </option>
                  ))}
                </select>

                <button
                  className="subtle sm"
                  onClick={() => go('history')}
                  title="Historique de tous les voyages"
                  style={{ padding: '6px 9px', minHeight: '32px' }}
                >
                  <HistoryIcon size={14} />
                  <span className="pill accent" style={{ padding: '1px 6px', fontSize: '11px', minHeight: 'auto' }}>
                    {(S.trips || []).length}
                  </span>
                </button>
              </div>

              {/* Rôle utilisateur (en mode groupe) */}
              {!isSolo && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <select
                    value={S.role}
                    onChange={e => upd(s => { s.role = e.target.value; })}
                    aria-label="Changer de rôle"
                    style={{
                      margin: 0,
                      padding: '7px 10px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      minHeight: '38px',
                      width: 'auto'
                    }}
                  >
                    <option value="o">👑 Organisateur</option>
                    <option value="p">👤 Participant</option>
                  </select>
                </div>
              )}

              {/* Bouton rapide d'ajout de voyage */}
              <button
                className="accent sm"
                onClick={() => go('history')}
                style={{ padding: '8px 14px', minHeight: '38px' }}
              >
                <Plus size={15} /> Nouveau voyage
              </button>
            </div>
          </div>
        </header>

        {/* BARRE DE NAVIGATION PRINCIPALE RESPONSIVE */}
        <nav className="site-nav-wrap">
          <div className="site-nav">
            {baseNav.map(([key, label, icon]) => (
              <button
                key={key}
                className={`nav-item-btn ${tab === key ? 'active' : ''}`}
                onClick={() => go(key)}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* CONTENU PRINCIPAL */}
        <main className="site-main">
          {tab === 'home' || tab === 'budget' || tab === 'history' || tab === 'visa' || tab === 'idees' || ok ? (
            <View />
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h2>Accès réservé</h2>
              <p className="mut" style={{ maxWidth: '450px', margin: '0 auto 16px' }}>
                Cette section s’ouvrira dès que l’organisateur aura validé votre inscription au voyage.
              </p>
              <button className="accent" onClick={() => go('home')}>
                Voir le statut de mon inscription
              </button>
            </div>
          )}
        </main>
      </div>
    </Ctx.Provider>
  );
}
