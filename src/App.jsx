import React, { useEffect, useState } from 'react';
import { Ctx, cur } from './ctx.js';
import { seed } from './data.js';
import { hasSession, closeSession } from './auth.js';
import Gate from './Gate.jsx';
import { Toast, ExampleBadge } from './ui.jsx';

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
  X,
  User,
  Check,
  MoreHorizontal
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

// Le convive a accès libre au voyage, à l'itinéraire, au budget, aux idées, jeux et visas sans mur bloquant
const PARTICIPANT_TABS = ['home', 'program', 'budget', 'idees', 'jeux', 'chat', 'visa'];
const ORG_TABS = ['dash', 'people', 'program', 'budget', 'idees', 'jeux', 'chat', 'visa', 'history', 'guide', 'settings'];

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

  // Liens partagés (?t=0&invite=1 ou ?id=...)
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

// Accès direct sans mur de verrouillage :
// Si une session organisateur existe -> 'o' ; sinon l'utilisateur accède directement au voyage ('p') !
const initialMode = () => {
  if (hasSession()) return 'o';
  return 'p';
};

// Identité du participant : réponse « oui » ou pseudo mémorisé en session locale
const participantFor = (S, t, guestName) => {
  try {
    const raw = localStorage.getItem(`wuendjo_rsvp_${t.id || S.t}`);
    const r = raw ? JSON.parse(raw) : null;
    const searchName = (r && r.decision === 'yes' && r.name) ? r.name : guestName;
    if (searchName) {
      return (t.people || []).find(p => (p.name || '').toLowerCase() === searchName.toLowerCase());
    }
  } catch {}
  return undefined;
};

export default function App() {
  const [S, setS] = useState(load);
  const [mode, setMode] = useState(initialMode); // 'gate' | 'p' | 'o'
  const [menu, setMenu] = useState(false); // tiroir organisateur
  const [bottomDrawer, setBottomDrawer] = useState(false); // tiroir mobile fonctions secondaires
  const [showGuestModal, setShowGuestModal] = useState(false); // modal saisie pseudo convive
  const [toast, setToast] = useState(null); // toast universel non bloquant

  // Pseudo convive en session
  const [guestName, setGuestNameState] = useState(() => {
    try {
      const urlName = new URLSearchParams(window.location.search).get('guest') || new URLSearchParams(window.location.search).get('name');
      if (urlName) {
        sessionStorage.setItem('wuendjo_guest_name', urlName.trim());
        return urlName.trim();
      }
      return sessionStorage.getItem('wuendjo_guest_name') || '';
    } catch {
      return '';
    }
  });

  const [tempGuestInput, setTempGuestInput] = useState(guestName);

  const saveGuestName = (val) => {
    const trimmed = (val || '').trim();
    setGuestNameState(trimmed);
    try {
      if (trimmed) sessionStorage.setItem('wuendjo_guest_name', trimmed);
      else sessionStorage.removeItem('wuendjo_guest_name');
    } catch {}
    setShowGuestModal(false);
    if (trimmed) showToast(`Bienvenue ${trimmed} ! Vous naviguez en tant que convive.`);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem('wuendjo_v2', JSON.stringify(S));
    } catch {}
  }, [S]);

  // Un onglet ouvert sans session ne peut pas rester dans l'espace organisateur
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
  const me = org ? (t.people || []).find(p => p.id === 'me') : participantFor(S, t, guestName);
  const ok = org || me?.st === 'ok' || Boolean(guestName);

  const allowed = org ? ORG_TABS : PARTICIPANT_TABS;
  const defaultTab = org ? 'dash' : 'home';
  const tab = allowed.includes(S.tab) ? S.tab : defaultTab;

  const go = k => {
    let key = k;
    if (org && k === 'home') key = 'dash';
    if (k === 'gerer') key = org ? 'people' : 'home';
    setMenu(false);
    setBottomDrawer(false);
    upd(s => { s.tab = key; });
  };

  const enterOrganizer = () => { setMode('o'); upd(s => { s.tab = 'dash'; }); };
  const enterParticipant = () => { setMode('p'); upd(s => { s.tab = 'home'; }); };
  const logout = () => { closeSession(); setMode('p'); showToast('Déconnexion effectuée.'); };
  const previewAsParticipant = () => { setMode('p'); upd(s => { s.tab = 'home'; }); };
  const backToOrg = () => { if (hasSession()) enterOrganizer(); else setMode('gate'); };

  const ctx = {
    S,
    t,
    me,
    org,
    ok,
    upd,
    go,
    mode,
    previewAsParticipant,
    backToOrg,
    logout,
    guestName,
    setGuestName: saveGuestName,
    showToast
  };

  if (mode === 'gate') {
    return <Gate onOrganizer={enterOrganizer} onParticipant={enterParticipant} />;
  }

  const View = V[tab] || Home;
  const trips = S.trips || [];
  const pendingCount = (t.people || []).filter(p => p.st === 'wait').length;

  // Accès ouvert pour toutes les sections clés
  const content = <View />;

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
            <button
              className="org-menu-btn"
              onClick={() => setMenu(m => !m)}
              aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menu}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="org-topbar-title">
              <strong>{(nav.find(n => n[0] === tab) || nav[0])[1]}</strong>
              <span>{t.name} {t.isExample && '· Exemple'}</span>
            </div>
            {pendingCount > 0 && !isSolo && <span className="org-badge">{pendingCount}</span>}
          </header>

          {menu && <div className="org-backdrop" onClick={() => setMenu(false)} />}
          <aside className={`org-side ${menu ? 'open' : ''}`} aria-label="Menu latéral de gestion">
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
                  <option key={i} value={i}>{x.name} {x.isExample ? '(Exemple)' : ''} ({x.mode === 'solo' ? 'Solo' : 'Groupe'})</option>
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
                <LogOut size={14} /> Quitter la gestion
              </button>
            </div>
          </aside>

          <main className="org-main">{content}</main>

          {/* Navigation basse mobile Organisateur pour contrôle au pouce */}
          <nav className="mobile-bottom-nav" aria-label="Navigation mobile organisateur">
            <button className={`mobile-nav-btn ${tab === 'dash' ? 'active' : ''}`} onClick={() => go('dash')}>
              <LayoutDashboard size={18} />
              <span>Tableau</span>
            </button>
            {!isSolo && (
              <button className={`mobile-nav-btn ${tab === 'people' ? 'active' : ''}`} onClick={() => go('people')}>
                <Users size={18} />
                <span>Participants</span>
              </button>
            )}
            <button className={`mobile-nav-btn ${tab === 'program' ? 'active' : ''}`} onClick={() => go('program')}>
              <CalendarDays size={18} />
              <span>Programme</span>
            </button>
            <button className={`mobile-nav-btn ${tab === 'budget' ? 'active' : ''}`} onClick={() => go('budget')}>
              <Wallet size={18} />
              <span>Budget</span>
            </button>
            <button className="mobile-nav-btn" onClick={() => setMenu(true)}>
              <Menu size={18} />
              <span>Menu</span>
            </button>
          </nav>

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
      </Ctx.Provider>
    );
  }

  /* ============================================================
     INTERFACE PARTICIPANT / CONVIVE : mobile-first, zéro friction
     ============================================================ */
  const pNav = [
    ['home', 'Le voyage', HomeIcon],
    ['program', 'Programme', CalendarDays],
    ['budget', 'Budget', Wallet],
    ['idees', 'Idées & Votes', Sparkles],
    ['jeux', isSolo ? 'Quêtes' : 'Défis & clans', Trophy],
    ['chat', isSolo ? 'Journal' : 'Discussion', isSolo ? BookOpen : MessageCircle],
    ['visa', 'Visas', Globe]
  ];

  return (
    <Ctx.Provider value={ctx}>
      <div id="app">
        {previewing && (
          <div className="preview-bar" role="status">
            <span><Eye size={14} /> Aperçu invité : vous voyez exactement ce qu'un convive voit.</span>
            <button className="subtle sm" onClick={backToOrg}><ArrowLeft size={14} /> Retour gestion organisateur</button>
          </div>
        )}

        <header className="site-header">
          <div className="site-header-inner">
            <div className="brand-wrap" onClick={() => go('home')}>
              <div className="brand-logo-mark">W</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 className="brand-text-title">Wuendjo</h1>
                  {t.isExample && <ExampleBadge label="Exemple" />}
                </div>
                <span className="brand-tagline">{t.name}</span>
              </div>
            </div>

            <div className="header-controls">
              {guestName ? (
                <button
                  type="button"
                  className="subtle sm"
                  onClick={() => { setTempGuestInput(guestName); setShowGuestModal(true); }}
                  title="Modifier mon prénom"
                  style={{ minHeight: '44px' }}
                >
                  <User size={14} /> {guestName}
                </button>
              ) : (
                <button
                  type="button"
                  className="accent sm"
                  onClick={() => { setTempGuestInput(''); setShowGuestModal(true); }}
                  style={{ minHeight: '44px' }}
                >
                  <User size={14} /> Mon prénom
                </button>
              )}

              {!previewing && (
                <button
                  className="subtle sm"
                  onClick={() => setMode('gate')}
                  title="Accès réservé au créateur du voyage"
                  style={{ minHeight: '44px' }}
                >
                  <Lock size={14} /> Espace organisateur
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Bandeau d'identité convive */}
        <div className="guest-identity-bar" role="status">
          <span>
            {guestName ? (
              <>👋 Vous participez en tant que <strong>{guestName}</strong></>
            ) : (
              <>👤 Vous consultez ce voyage en invité. Ajoutez votre prénom pour faciliter vos réponses et votes.</>
            )}
          </span>
          <button
            type="button"
            className="subtle sm"
            onClick={() => { setTempGuestInput(guestName); setShowGuestModal(true); }}
            style={{ minHeight: '36px', padding: '4px 10px', fontSize: '12px' }}
          >
            {guestName ? 'Modifier mon pseudo' : 'Définir mon prénom (5s)'}
          </button>
        </div>

        {/* Navigation Desktop / Tablette haute */}
        <nav className="site-nav-wrap" aria-label="Navigation principale participant">
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

        {/* Navigation Mobile Basse (Thumb-zone à une main) */}
        <nav className="mobile-bottom-nav" aria-label="Navigation mobile principale">
          <button
            className={`mobile-nav-btn ${tab === 'home' ? 'active' : ''}`}
            onClick={() => go('home')}
            aria-label="Accueil du voyage"
          >
            <HomeIcon size={20} />
            <span>Voyage</span>
          </button>

          <button
            className={`mobile-nav-btn ${tab === 'program' ? 'active' : ''}`}
            onClick={() => go('program')}
            aria-label="Itinéraire et programme"
          >
            <CalendarDays size={20} />
            <span>Programme</span>
          </button>

          <button
            className={`mobile-nav-btn ${tab === 'budget' ? 'active' : ''}`}
            onClick={() => go('budget')}
            aria-label="Budget et dépenses"
          >
            <Wallet size={20} />
            <span>Budget</span>
          </button>

          <button
            className={`mobile-nav-btn ${tab === 'jeux' ? 'active' : ''}`}
            onClick={() => go('jeux')}
            aria-label={isSolo ? 'Quêtes solo' : 'Défis'}
          >
            <Trophy size={20} />
            <span>{isSolo ? 'Quêtes' : 'Défis'}</span>
          </button>

          <button
            className={`mobile-nav-btn ${bottomDrawer ? 'active' : ''}`}
            onClick={() => setBottomDrawer(b => !b)}
            aria-label="Plus d'options et rubriques"
            aria-expanded={bottomDrawer}
          >
            <MoreHorizontal size={20} />
            <span>Plus</span>
          </button>
        </nav>

        {/* Tiroir mobile (Bottom Sheet) pour les fonctions secondaires */}
        {bottomDrawer && (
          <>
            <div className="drawer-backdrop" onClick={() => setBottomDrawer(false)} />
            <div className="bottom-drawer" role="dialog" aria-modal="true" aria-label="Rubriques complémentaires">
              <div className="drawer-handle" aria-hidden="true" />
              <div className="drawer-header">
                <h3 style={{ margin: 0, fontSize: '17px' }}>Rubriques du voyage</h3>
                <button
                  type="button"
                  className="subtle sm"
                  onClick={() => setBottomDrawer(false)}
                  aria-label="Fermer le tiroir"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="drawer-grid">
                <button
                  type="button"
                  className={`drawer-item ${tab === 'idees' ? 'active' : ''}`}
                  onClick={() => go('idees')}
                >
                  <Sparkles size={18} color="var(--accent)" />
                  <div>
                    <div>Idées & adresses</div>
                    <span className="mut" style={{ fontSize: '11px' }}>Recommandations & votes</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`drawer-item ${tab === 'chat' ? 'active' : ''}`}
                  onClick={() => go('chat')}
                >
                  {isSolo ? <BookOpen size={18} color="var(--accent)" /> : <MessageCircle size={18} color="var(--accent)" />}
                  <div>
                    <div>{isSolo ? 'Journal de bord' : 'Discussion'}</div>
                    <span className="mut" style={{ fontSize: '11px' }}>{isSolo ? 'Notes personnelles' : 'Messages du groupe'}</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`drawer-item ${tab === 'visa' ? 'active' : ''}`}
                  onClick={() => go('visa')}
                >
                  <Globe size={18} color="var(--accent)" />
                  <div>
                    <div>Visas & conseils</div>
                    <span className="mut" style={{ fontSize: '11px' }}>Formalités consulaires</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="drawer-item"
                  onClick={() => { setBottomDrawer(false); setShowGuestModal(true); }}
                >
                  <User size={18} color="var(--accent)" />
                  <div>
                    <div>Mon pseudo</div>
                    <span className="mut" style={{ fontSize: '11px' }}>{guestName || 'Non défini'}</span>
                  </div>
                </button>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="subtle"
                  onClick={() => { setBottomDrawer(false); setMode('gate'); }}
                  style={{ width: '100%', minHeight: '46px', justifyContent: 'center' }}
                >
                  <Lock size={15} /> Accéder à l'espace organisateur
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal saisie rapide du prénom convive */}
        {showGuestModal && (
          <div className="modal-overlay" onClick={() => setShowGuestModal(false)}>
            <div
              className="modal-content"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="guest-modal-title"
              style={{ maxWidth: '420px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 id="guest-modal-title" style={{ margin: 0, fontSize: '18px' }}>
                  Votre prénom ou pseudo
                </h3>
                <button
                  type="button"
                  className="subtle sm"
                  onClick={() => setShowGuestModal(false)}
                  aria-label="Fermer"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <X size={16} />
                </button>
              </div>
              <p className="mut" style={{ marginTop: 0, fontSize: '13.5px' }}>
                Ce prénom sera utilisé pour pré-remplir vos réponses aux sondages, vos votes et vos messages.
              </p>
              <form onSubmit={e => { e.preventDefault(); saveGuestName(tempGuestInput); }}>
                <label htmlFor="guest-name-field">Votre prénom ou nom court *</label>
                <input
                  id="guest-name-field"
                  autoFocus
                  required
                  value={tempGuestInput}
                  onChange={e => setTempGuestInput(e.target.value)}
                  placeholder="Ex : Sarah ou Boris"
                  style={{ fontSize: '16px', minHeight: '46px' }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" className="subtle" onClick={() => setShowGuestModal(false)} style={{ minHeight: '44px' }}>
                    Annuler
                  </button>
                  <button type="submit" className="accent" style={{ minHeight: '44px' }}>
                    <Check size={16} /> Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toasts accessibles non-bloquants */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </Ctx.Provider>
  );
}

