import React, { useEffect, useState } from 'react';
import { Ctx, cur } from './ctx.js';
import { seed } from './data.js';
import { hasSession, closeSession } from './auth.js';
import Gate from './Gate.jsx';

import Home from './views/Home.jsx';
import Games from './views/Games.jsx';
import Chat from './views/Chat.jsx';
import Ideas from './views/Ideas.jsx';
import Budget from './views/Budget.jsx';
import Visa from './views/Visa.jsx';
import Guide from './views/Guide.jsx';
import Manage from './views/Manage.jsx';
import History from './views/History.jsx';
import OrgDashboard from './views/OrgDashboard.jsx';
import Program from './views/Program.jsx';

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
  LayoutDashboard,
  Users,
  CalendarDays,
  Eye,
  LogOut,
  Lock,
  Plus,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';

const V = {
  home: Home,
  dash: OrgDashboard,
  people: () => <Manage part="people" />,
  settings: () => <Manage part="settings" />,
  program: Program,
  idees: Ideas,
  budget: Budget,
  jeux: Games,
  chat: Chat,
  visa: Visa,
  history: History,
  guide: Guide
};

const PARTICIPANT_TABS = ['home', 'budget', 'idees', 'jeux', 'chat', 'visa'];
const ORG_TABS = ['dash', 'people', 'program', 'budget', 'idees', 'jeux', 'chat', 'visa', 'history', 'guide', 'settings'];

const hasInviteParam = () => {
  try {
    return new URLSearchParams(window.location.search).get('invite') === '1';
  } catch {
    return false;
  }
};

const load = () => {
  let state = null;
  try {
    const x = localStorage.getItem('wuendjo_v2');
    if (x) {
      const parsed = JSON.parse(x);
      if (parsed && Array.isArray(parsed.trips) && parsed.trips.length > 0) {
        state = parsed;
      }
    }
  } catch {}

  if (!state) {
    state = { tab: 'home', t: 0, trips: seed() };
  }
  delete state.role;

  // Liens partagés (?t=0&invite=1)
  try {
    const params = new URLSearchParams(window.location.search);
    const tripParam = params.get('trip') || params.get('t');
    const idParam = params.get('id');
    const byId = idParam ? state.trips.findIndex(x => x.id === idParam) : -1;
    if (byId >= 0) {
      state.t = byId;
      state.tab = 'home';
    } else if (tripParam !== null && !isNaN(Number(tripParam))) {
      const idx = parseInt(tripParam, 10);
      if (idx >= 0 && idx < state.trips.length) {
        state.t = idx;
        state.tab = 'home';
      }
    }
  } catch {}

  return state;
};

const initialMode = () => {
  if (hasInviteParam()) return 'p';
  if (hasSession()) return 'o';
  return 'gate';
};

// Identité du participant : réponse « oui » mémorisée sur cet appareil, rapprochée de la liste des inscrits.
const participantFor = (S, t) => {
  try {
    const raw = localStorage.getItem(`wuendjo_rsvp_${t.id || S.t}`);
    const r = raw ? JSON.parse(raw) : null;
    if (r && r.decision === 'yes' && r.name) {
      return (t.people || []).find(p => (p.name || '').toLowerCase() === r.name.toLowerCase());
    }
  } catch {}
  return undefined;
};

export default function App() {
  const [S, setS] = useState(load);
  const [mode, setMode] = useState(initialMode); // 'gate' | 'p' | 'o'
  const [menu, setMenu] = useState(false); // tiroir de navigation (mobile)

  useEffect(() => {
    try {
      localStorage.setItem('wuendjo_v2', JSON.stringify(S));
    } catch {}
  }, [S]);

  // Un onglet ouvert sans session ne peut pas rester dans l'espace organisateur.
  useEffect(() => {
    if (mode === 'o' && !hasSession()) setMode('gate');
  }, [mode]);

  const upd = f => setS(s => {
    const n = structuredClone(s);
    f(n);
    return n;
  });

  const t = cur(S);
  const org = mode === 'o';
  const previewing = mode === 'p' && hasSession();
  const isSolo = t.mode === 'solo';
  const me = org ? (t.people || []).find(p => p.id === 'me') : participantFor(S, t);
  const ok = org || me?.st === 'ok';

  const allowed = org ? ORG_TABS : PARTICIPANT_TABS;
  const defaultTab = org ? 'dash' : 'home';
  const tab = allowed.includes(S.tab) ? S.tab : defaultTab;

  const go = k => {
    let key = k;
    if (org && k === 'home') key = 'dash';
    if (k === 'gerer') key = org ? 'people' : 'home';
    setMenu(false);
    upd(s => { s.tab = key; });
  };

  const enterOrganizer = () => { setMode('o'); upd(s => { s.tab = 'dash'; }); };
  const enterParticipant = () => { setMode('p'); upd(s => { s.tab = 'home'; }); };
  const logout = () => { closeSession(); setMode('gate'); };
  const previewAsParticipant = () => { setMode('p'); upd(s => { s.tab = 'home'; }); };
  const backToOrg = () => { if (hasSession()) enterOrganizer(); else setMode('gate'); };

  const ctx = { S, t, me, org, ok, upd, go, mode, previewAsParticipant, backToOrg, logout };

  if (mode === 'gate') {
    return <Gate onOrganizer={enterOrganizer} onParticipant={enterParticipant} />;
  }

  const View = V[tab] || Home;
  const trips = S.trips || [];
  const pendingCount = (t.people || []).filter(p => p.st === 'wait').length;

  const content = org || tab === 'home' || tab === 'budget' || tab === 'visa' || tab === 'idees' || ok ? (
    <View />
  ) : (
    <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h2 style={{ justifyContent: 'center' }}>Accès réservé</h2>
      <p className="mut" style={{ maxWidth: '450px', margin: '0 auto 16px' }}>
        Cette section s’ouvrira dès que l’organisateur aura validé votre inscription au voyage.
      </p>
      <button className="accent" onClick={() => go('home')}>
        Voir le statut de mon inscription
      </button>
    </div>
  );

  /* ============================================================
     INTERFACE ORGANISATEUR : barre latérale + zone de travail
     ============================================================ */
  if (org) {
    const nav = [
      ['dash', 'Tableau de bord', LayoutDashboard],
      !isSolo && ['people', 'Participants', Users, pendingCount],
      ['program', 'Programme', CalendarDays],
      ['budget', 'Budget', Wallet],
      ['idees', 'Idées & adresses', Sparkles],
      ['jeux', isSolo ? 'Quêtes solo' : 'Défis & clans', Trophy],
      ['chat', isSolo ? 'Journal de bord' : 'Discussion', isSolo ? BookOpen : MessageCircle],
      ['visa', 'Visas & conseils', Globe],
      ['history', 'Mes voyages', HistoryIcon],
      !isSolo && ['guide', 'Guide maître du jeu', Compass],
      ['settings', 'Paramètres', Settings]
    ].filter(Boolean);

    return (
      <Ctx.Provider value={ctx}>
        <div className="org-shell">
          <header className="org-topbar">
            <button className="org-menu-btn" onClick={() => setMenu(m => !m)} aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menu}>
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="org-topbar-title">
              <strong>{(nav.find(n => n[0] === tab) || nav[0])[1]}</strong>
              <span>{t.name}</span>
            </div>
            {pendingCount > 0 && !isSolo && <span className="org-badge">{pendingCount}</span>}
          </header>
          {menu && <div className="org-backdrop" onClick={() => setMenu(false)} />}
          <aside className={`org-side ${menu ? 'open' : ''}`}>
            <div className="brand-wrap" onClick={() => go('dash')}>
              <div className="brand-logo-mark">W</div>
              <div>
                <h1 className="brand-text-title">Wuendjo</h1>
                <span className="org-tag"><Lock size={10} /> Espace organisateur</span>
              </div>
            </div>

            <div className="org-trip">
              <label htmlFor="org-trip-select">Voyage actif</label>
              <select
                id="org-trip-select"
                value={S.t}
                onChange={e => { setMenu(false); upd(s => { s.t = +e.target.value; s.tab = 'dash'; }); }}
              >
                {trips.map((x, i) => (
                  <option key={i} value={i}>{x.name} ({x.mode === 'solo' ? 'Solo' : 'Groupe'})</option>
                ))}
              </select>
              <button className="accent sm" onClick={() => go('history')}>
                <Plus size={14} /> Nouveau voyage
              </button>
            </div>

            <nav className="org-nav" aria-label="Navigation organisateur">
              {nav.map(([key, label, Icon, badge]) => (
                <button
                  key={key}
                  className={`org-nav-item ${tab === key ? 'active' : ''}`}
                  onClick={() => go(key)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {badge > 0 && <span className="org-badge">{badge}</span>}
                </button>
              ))}
            </nav>

            <div className="org-side-foot">
              {!isSolo && (
                <button className="subtle sm" onClick={previewAsParticipant}>
                  <Eye size={14} /> Aperçu participant
                </button>
              )}
              <button className="subtle sm" onClick={logout}>
                <LogOut size={14} /> Se déconnecter
              </button>
            </div>
          </aside>

          <main className="org-main">{content}</main>
        </div>
      </Ctx.Provider>
    );
  }

  /* ============================================================
     INTERFACE PARTICIPANT : navigation horizontale, lecture et réponses
     ============================================================ */
  const pNav = [
    ['home', 'Le voyage', HomeIcon],
    ['budget', 'Budget', Wallet],
    ['idees', 'Idées', Sparkles],
    ['jeux', isSolo ? 'Quêtes' : 'Défis & clans', Trophy],
    ['chat', isSolo ? 'Journal' : 'Discussion', isSolo ? BookOpen : MessageCircle],
    ['visa', 'Visas', Globe]
  ];

  return (
    <Ctx.Provider value={ctx}>
      <div id="app">
        {previewing && (
          <div className="preview-bar">
            <span><Eye size={14} /> Aperçu : vous voyez le voyage comme un participant.</span>
            <button className="subtle sm" onClick={backToOrg}><ArrowLeft size={14} /> Retour à l’espace organisateur</button>
          </div>
        )}

        <header className="site-header">
          <div className="site-header-inner">
            <div className="brand-wrap" onClick={() => go('home')}>
              <div className="brand-logo-mark">W</div>
              <div>
                <h1 className="brand-text-title">Wuendjo</h1>
                <span className="brand-tagline">{t.name}</span>
              </div>
            </div>

            <div className="header-controls">
              {!previewing && (
                <button className="subtle sm" onClick={() => setMode('gate')} title="Accès réservé à l’organisateur">
                  <Lock size={14} /> Espace organisateur
                </button>
              )}
            </div>
          </div>
        </header>

        <nav className="site-nav-wrap">
          <div className="site-nav">
            {pNav.map(([key, label, Icon]) => (
              <button
                key={key}
                className={`nav-item-btn ${tab === key ? 'active' : ''}`}
                onClick={() => go(key)}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        <main className="site-main">{content}</main>
      </div>
    </Ctx.Provider>
  );
}
