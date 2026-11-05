import React, { useState, useEffect } from 'react';
import { useApp, useForm, cur, F, STATUS_MAP } from '../ctx.js';
import { TYPES } from '../data.js';
import Workflow from '../Workflow.jsx';
import {
  MapPin,
  Calendar,
  Users,
  User,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Share2,
  Check,
  X,
  Send,
  Wallet,
  Copy,
  MessageCircle,
  HelpCircle,
  Compass,
  Utensils,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Home() {
  const { S, t, me, org, ok, upd, go } = useApp();
  const [f, b, reset] = useForm();
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newItinDay, setNewItinDay] = useState('');
  const [newItinTitle, setNewItinTitle] = useState('');
  const [showAddItin, setShowAddItin] = useState(false);

  // États RSVP (Participer ou Non)
  const [rsvpMode, setRsvpMode] = useState(null); // 'yes' | 'no' | null
  const [copiedToast, setCopiedToast] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Formulaire RSVP "Oui, je participe"
  const [yesName, setYesName] = useState('');
  const [yesPhone, setYesPhone] = useState('');
  const [yesAge, setYesAge] = useState('');
  const [yesJob, setYesJob] = useState('');
  const [yesType, setYesType] = useState('Aventurier actif');
  const [yesDiet, setYesDiet] = useState('');
  const [yesWhy, setYesWhy] = useState('');

  // Formulaire RSVP "Je ne pourrai pas"
  const [noName, setNoName] = useState('');
  const [noWhy, setNoWhy] = useState('');

  // Réponse mémorisée localement pour cet utilisateur
  const [myRsvpStatus, setMyRsvpStatus] = useState(() => {
    try {
      const stored = localStorage.getItem(`wuendjo_rsvp_${t.id || S.t}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`wuendjo_rsvp_${t.id || S.t}`);
      setMyRsvpStatus(stored ? JSON.parse(stored) : null);
    } catch {}
  }, [t.id, S.t]);

  const isSolo = t.mode === 'solo';
  const confirmedPeople = (t.people || []).filter(p => p.st === 'ok');
  const n = confirmedPeople.length;
  const statusInfo = STATUS_MAP[t.status || 'active'] || STATUS_MAP.active;
  const declinedList = t.declined || [];

  // Vérifier si l'utilisateur est déjà inscrit dans le voyage
  const isEnrolled = Boolean(me || (myRsvpStatus && myRsvpStatus.decision === 'yes'));
  const hasDeclined = Boolean(myRsvpStatus && myRsvpStatus.decision === 'no');

  // Copier le lien d'invitation à partager aux amis
  const shareTrip = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const shareUrl = `${origin}${pathname}?t=${S.t}&invite=1`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3500);
      }).catch(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3500);
      });
    } else {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3500);
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Salut ! Je t'invite à découvrir notre voyage Wuendjo : "${t.name}" à ${t.dest} (${t.dates}).\nDécouvre le descriptif complet et dis-moi si tu participes ici : ${window.location.origin}${window.location.pathname}?t=${S.t}&invite=1`
  )}`;

  // Validation RSVP "Oui, je participe"
  const submitYesParticipation = (e) => {
    if (e) e.preventDefault();
    if (!yesName.trim()) {
      alert('Veuillez renseigner votre nom pour valider votre participation.');
      return;
    }

    const newPerson = {
      id: 'p-' + Date.now(),
      name: yesName.trim(),
      age: Number(yesAge) || 26,
      job: yesJob.trim() || 'Aventurier',
      phone: yesPhone.trim(),
      type: yesType || 'Aventurier actif',
      diet: yesDiet.trim(),
      why: yesWhy.trim() || 'Ravi de rejoindre ce voyage !',
      st: 'wait' // En attente ou validé selon l'organisateur
    };

    upd(s => {
      const trip = cur(s);
      if (!trip.people) trip.people = [];
      trip.people.push(newPerson);
      // Retirer des déclinaisons s'il y était
      if (trip.declined) {
        trip.declined = trip.declined.filter(d => d.name.toLowerCase() !== yesName.trim().toLowerCase());
      }
    });

    const rsvpData = { decision: 'yes', name: yesName.trim(), phone: yesPhone.trim(), date: new Date().toLocaleDateString('fr-FR') };
    localStorage.setItem(`wuendjo_rsvp_${t.id || S.t}`, JSON.stringify(rsvpData));
    setMyRsvpStatus(rsvpData);

    setFeedbackMsg(`Félicitations ${yesName.trim()} ! Votre participation a bien été enregistrée. L’organisateur a été prévenu.`);
    setRsvpMode(null);
  };

  // Validation RSVP "Non, je ne peux pas"
  const submitNoDecline = (e) => {
    if (e) e.preventDefault();
    if (!noName.trim()) {
      alert('Veuillez renseigner votre nom.');
      return;
    }

    const nowStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const declineEntry = {
      id: 'd-' + Date.now(),
      name: noName.trim(),
      date: nowStr,
      why: noWhy.trim() || 'Indisponible à ces dates'
    };

    upd(s => {
      const trip = cur(s);
      if (!trip.declined) trip.declined = [];
      trip.declined.unshift(declineEntry);
      // Retirer des participants s'il s'était inscrit avant
      if (trip.people) {
        trip.people = trip.people.filter(p => p.name.toLowerCase() !== noName.trim().toLowerCase());
      }
    });

    const rsvpData = { decision: 'no', name: noName.trim(), why: noWhy.trim(), date: nowStr };
    localStorage.setItem(`wuendjo_rsvp_${t.id || S.t}`, JSON.stringify(rsvpData));
    setMyRsvpStatus(rsvpData);

    setFeedbackMsg(`Merci ${noName.trim()} d'avoir prévenu l'organisateur ! Ce sera avec grand plaisir pour le prochain voyage.`);
    setRsvpMode(null);
  };

  // Annuler sa réponse pour changer d'avis
  const resetMyRsvp = () => {
    try {
      localStorage.removeItem(`wuendjo_rsvp_${t.id || S.t}`);
    } catch {}
    setMyRsvpStatus(null);
    setFeedbackMsg('');
    setRsvpMode(null);
  };

  // Basculer un item de la checklist
  const toggleChecklist = (id) => {
    upd(s => {
      const trip = cur(s);
      if (!trip.checklist) trip.checklist = [];
      const item = trip.checklist.find(c => c.id === id);
      if (item) item.done = !item.done;
    });
  };

  // Ajouter un élément à la checklist
  const addChecklistItem = () => {
    if (!newCheckItem.trim()) return;
    upd(s => {
      const trip = cur(s);
      if (!trip.checklist) trip.checklist = [];
      trip.checklist.push({
        id: 'c-' + Date.now(),
        text: newCheckItem.trim(),
        done: false,
        category: 'Personnel'
      });
    });
    setNewCheckItem('');
  };

  // Ajouter une étape à l'itinéraire
  const addItinItem = () => {
    if (!newItinTitle.trim()) return;
    upd(s => {
      const trip = cur(s);
      if (!trip.itinerary) trip.itinerary = [];
      trip.itinerary.push({
        day: newItinDay.trim() || `Étape ${trip.itinerary.length + 1}`,
        title: newItinTitle.trim(),
        time: '10:00',
        desc: 'Activité planifiée au programme'
      });
    });
    setNewItinTitle('');
    setNewItinDay('');
    setShowAddItin(false);
  };

  const checklistCount = (t.checklist || []).filter(c => c.done).length;
  const checklistTotal = (t.checklist || []).length;

  return (
    <div>
      {/* ========================================================
          1. INVITATION & DESCRIPTIF DU VOYAGE
          ======================================================== */}
      <section className="invite">
        <div className="invite-top">
          <div className="invite-tags">
            <span className="pill accent">Invitation au voyage</span>
            <span className="pill outline">{isSolo ? 'Carnet solo' : 'Organisé sur Wuendjo'}</span>
            <span className="pill outline">{statusInfo.label}</span>
          </div>

          <div className="invite-actions">
            <button className="subtle sm" onClick={shareTrip} title="Copier le lien pour inviter des amis">
              <Share2 size={14} /> Partager
            </button>
            <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer" title="Partager sur WhatsApp">
              <button className="subtle sm">
                <MessageCircle size={14} /> WhatsApp
              </button>
            </a>
          </div>
        </div>

        <h1 className="invite-title">{t.name}</h1>

        <div className="meta-grid">
          <div className="meta-item">
            <div className="meta-label"><MapPin size={14} /> Destination</div>
            <div className="meta-value">{t.dest}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label"><Calendar size={14} /> Dates</div>
            <div className="meta-value">{t.dates}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label"><Wallet size={14} /> {isSolo ? 'Budget alloué' : 'Budget par personne'}</div>
            <div className="meta-value">{F(t.pp)}</div>
          </div>
          {!isSolo && (
            <div className="meta-item">
              <div className="meta-label"><Users size={14} /> Équipe</div>
              <div className="meta-value">
                {n} / {t.cap} confirmés
                {t.cap - n > 0 && <span className="mut" style={{ fontWeight: 400 }}> · {t.cap - n} libre{t.cap - n > 1 ? 's' : ''}</span>}
              </div>
            </div>
          )}
        </div>

        <div className="invite-desc">
          <h3>À propos</h3>
          <p>
            {t.description || (isSolo
              ? `Une escapade en toute autonomie pour découvrir ${t.dest} à votre rythme, avec carnet de route, bonnes adresses et temps pour soi.`
              : `Une aventure collective rythmée par la découverte de ${t.dest}, les repas partagés, les mets traditionnels et des défis conviviaux en groupe.`)}
          </p>
          <div className="pillars">
            <span>Immersion & nature</span>
            <span>Terroir & gastronomie</span>
            <span>Transparence & amitié</span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="notice" style={{ marginTop: '24px' }}>
            <span>{feedbackMsg}</span>
            <button className="subtle sm" onClick={() => setFeedbackMsg('')} aria-label="Fermer" style={{ padding: '4px 8px' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* ---------- RSVP ---------- */}
        {!isSolo && (
          <div className="rsvp light-scope">
            {isEnrolled && (
              <div className="rsvp-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="check-badge"><Check size={18} strokeWidth={2.5} /></div>
                  <div>
                    <h3>{me && me.st === 'ok' ? 'Vous participez à ce voyage' : me && me.st === 'no' ? 'Inscription refusée' : 'Inscription envoyée'}</h3>
                    <p className="mut">
                      {me && me.st === 'ok'
                        ? `Votre place est confirmée (${me.name}).`
                        : me && me.st === 'no'
                          ? 'L’organisateur n’a pas pu retenir votre inscription.'
                          : `Merci ${me ? me.name : myRsvpStatus?.name} : l’organisateur doit valider votre place.`}
                    </p>
                  </div>
                </div>
                <div className="rsvp-actions">
                  <button className="subtle sm" onClick={resetMyRsvp}>Modifier ma réponse</button>
                  {me && me.st === 'ok' && <button className="accent sm" onClick={() => go('chat')}>Ouvrir la discussion</button>}
                </div>
              </div>
            )}

            {!isEnrolled && hasDeclined && (
              <div className="rsvp-head">
                <div>
                  <h3>Vous avez décliné cette invitation</h3>
                  <p className="mut">Motif : « {myRsvpStatus?.why || 'Non disponible'} ». Merci d'avoir prévenu l'organisateur.</p>
                </div>
                <button className="accent sm" onClick={() => { setMyRsvpStatus(null); setRsvpMode('yes'); }}>
                  J'ai changé d'avis, je participe
                </button>
              </div>
            )}

            {!isEnrolled && !hasDeclined && rsvpMode === null && (
              <div className="rsvp-head">
                <div>
                  <h3>Serez-vous des nôtres à {t.dest} ?</h3>
                  <p className="mut">Répondez en un clic pour aider l’organisateur à finaliser les réservations et le programme.</p>
                </div>
                <div className="rsvp-actions">
                  <button className="accent" onClick={() => setRsvpMode('yes')}>
                    <Check size={16} /> Oui, je participe
                  </button>
                  <button className="subtle" onClick={() => setRsvpMode('no')}>
                    Je ne pourrai pas
                  </button>
                </div>
              </div>
            )}

            {rsvpMode === 'yes' && (
              <form onSubmit={submitYesParticipation}>
                <div className="rsvp-form-head">
                  <span>Confirmer ma participation</span>
                  <button type="button" className="subtle sm" onClick={() => setRsvpMode(null)}>
                    <X size={14} /> Annuler
                  </button>
                </div>

                <div className="grid-2">
                  <div>
                    <label>Votre nom complet *</label>
                    <input required value={yesName} onChange={e => setYesName(e.target.value)} placeholder="Ex: Paul Mbarga" />
                  </div>
                  <div>
                    <label>N° de téléphone ou WhatsApp *</label>
                    <input value={yesPhone} onChange={e => setYesPhone(e.target.value)} placeholder="+237 6XX XX XX XX" />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label>Votre profil voyageur</label>
                    <select value={yesType} onChange={e => setYesType(e.target.value)}>
                      {TYPES.map(ty => <option key={ty} value={ty}>{ty}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Régime alimentaire ou préférences</label>
                    <input value={yesDiet} onChange={e => setYesDiet(e.target.value)} placeholder="Ex: Sans arachides, végétarien, aucun..." />
                  </div>
                </div>

                <label>Un petit mot pour le groupe ou vos attentes</label>
                <textarea
                  rows={2}
                  value={yesWhy}
                  onChange={e => setYesWhy(e.target.value)}
                  placeholder="Ex: Trop hâte de découvrir les cascades et de partager ces moments avec vous !"
                />

                <div className="rsvp-form-actions">
                  <button type="button" className="subtle" onClick={() => setRsvpMode(null)}>Retour</button>
                  <button type="submit" className="accent"><Check size={16} /> Valider ma participation</button>
                </div>
              </form>
            )}

            {rsvpMode === 'no' && (
              <form onSubmit={submitNoDecline}>
                <div className="rsvp-form-head">
                  <span>Transmettre une réponse négative</span>
                  <button type="button" className="subtle sm" onClick={() => setRsvpMode(null)}>
                    <X size={14} /> Annuler
                  </button>
                </div>

                <div className="grid-2">
                  <div>
                    <label>Votre nom ou prénom *</label>
                    <input required value={noName} onChange={e => setNoName(e.target.value)} placeholder="Ex: Christian" />
                  </div>
                  <div>
                    <label>Motif ou petit mot pour l'organisateur</label>
                    <input value={noWhy} onChange={e => setNoWhy(e.target.value)} placeholder="Ex: Déplacement professionnel sur cette date, profitez bien !" />
                  </div>
                </div>

                <div className="rsvp-form-actions">
                  <button type="button" className="subtle" onClick={() => setRsvpMode(null)}>Retour</button>
                  <button type="submit" className="accent"><Send size={15} /> Enregistrer ma réponse</button>
                </div>
              </form>
            )}

            {org && (
              <div className="rsvp-org">
                <div>
                  <b>Vue organisateur</b> · {n} participant{n > 1 ? 's' : ''} confirmé{n > 1 ? 's' : ''} · {declinedList.length} déclinaison{declinedList.length > 1 ? 's' : ''}
                </div>
                <button className="subtle sm" onClick={() => go('gerer')}>
                  Gérer les inscriptions <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {!isSolo && (
        <Workflow
          title="Comment ça marche"
          subtitle="Quatre gestes simples pour profiter du voyage."
          steps={[
            { key: 'a', title: 'Répondre à l’invitation', desc: 'Dites si vous participez, en un clic.', done: Boolean(isEnrolled || hasDeclined) },
            { key: 'b', title: 'Attendre la validation', desc: 'L’organisateur confirme votre place.', done: Boolean(me && me.st === 'ok') },
            { key: 'c', title: 'Voter pour les idées', desc: 'Choisissez les activités et adresses du séjour.', onClick: () => go('idees'), cta: 'Idées' },
            { key: 'd', title: 'Suivre le budget et discuter', desc: 'Retrouvez les dépenses et échangez avec le groupe.', onClick: () => go('budget'), cta: 'Budget' }
          ]}
        />
      )}

      {/* Notification Toast de partage */}
      {copiedToast && (
        <div className="toast-feedback">
          <Check size={18} color="#fff" strokeWidth={3} />
          <span>Lien d’invitation copié ! Partagez-le avec vos amis.</span>
        </div>
      )}

      {/* ========================================================
          2. GRILLE PRINCIPALE DU PROGRAMME & ITINÉRAIRE
          ======================================================== */}
      <div className="grid-2-1">
        <div>
          {/* SECTION ITINÉRAIRE JOUR PAR JOUR */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2>
                <Calendar size={18} color="var(--gold)" />
                Programme & Itinéraire du Séjour
              </h2>
              {org && (
                <button className="subtle sm" onClick={() => setShowAddItin(!showAddItin)}>
                  <Plus size={14} /> Ajouter une étape
                </button>
              )}
            </div>

            {org && showAddItin && (
              <div style={{ background: 'var(--card-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 8px' }}>Nouvelle étape de voyage</h3>
                <div className="grid-2">
                  <input
                    value={newItinDay}
                    onChange={e => setNewItinDay(e.target.value)}
                    placeholder="Ex: Jour 1 ou Samedi matin"
                  />
                  <input
                    value={newItinTitle}
                    onChange={e => setNewItinTitle(e.target.value)}
                    placeholder="Ex: Randonnée aux cascades sacrées"
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button className="subtle sm" onClick={() => setShowAddItin(false)}>Annuler</button>
                  <button className="accent sm" onClick={addItinItem}>Enregistrer</button>
                </div>
              </div>
            )}

            {(t.itinerary && t.itinerary.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {t.itinerary.map((step, idx) => (
                  <div key={idx} className="row" style={{ alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span className="pill primary" style={{ height: 'fit-content', whiteSpace: 'nowrap' }}>
                        {step.day}
                      </span>
                      <div>
                        <b>{step.title}</b>
                        {step.desc && <div className="mut" style={{ marginTop: '2px' }}>{step.desc}</div>}
                      </div>
                    </div>
                    {step.time && <span className="mut" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{step.time}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <p>Aucune étape planifiée pour le moment.</p>
                {org && (
                  <button className="subtle sm" onClick={() => setShowAddItin(true)}>
                    <Plus size={14} /> Planifier la première étape
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TEASER GRAPHIQUE BUDGET RECHARTS */}
          <div className="card" >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2>Suivi financier</h2>
                <p className="mut" style={{ margin: 0 }}>
                  Visualisez la répartition entre transport, logement, repas et activités.
                </p>
              </div>
              <button className="accent" onClick={() => go('budget')}>
                Ouvrir le budget <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE LATÉRALE : CHECKLIST & ACTIONS */}
        <div>
          {/* Checklist avant départ */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2>
                <CheckCircle2 size={18} color="var(--olive-text)" />
                Préparatifs & Checklist
              </h2>
              <span className="pill ok" style={{ fontSize: '11px' }}>
                {checklistCount}/{checklistTotal}
              </span>
            </div>
            <p className="mut" style={{ margin: '0 0 14px' }}>
              {isSolo ? 'Vos formalités et affaires essentielles' : 'Préparatifs essentiels pour le groupe'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(t.checklist || []).map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`check-item ${item.done ? 'done' : ''}`}
                >
                  {item.done ? (
                    <CheckCircle2 size={18} color="var(--olive-text)" style={{ flexShrink: 0 }} />
                  ) : (
                    <Circle size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontSize: '13.5px',
                    fontWeight: item.done ? 500 : 600,
                    color: item.done ? 'var(--olive-text)' : 'var(--text)'
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {org && (
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
              <input
                value={newCheckItem}
                onChange={e => setNewCheckItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addChecklistItem(); }}
                placeholder="Ajouter une tâche (ex: Sac étanche)"
                style={{ margin: 0, padding: '9px 12px', fontSize: '13.5px', minHeight: '38px' }}
              />
              <button className="subtle sm" onClick={addChecklistItem} style={{ flexShrink: 0, minHeight: '38px', padding: '0 12px' }}>
                <Plus size={15} />
              </button>
            </div>
            )}
          </div>

          {/* Participants confirmés */}
          {!isSolo && (
            <div className="card">
              <h2>
                <Users size={18} color="var(--gold)" />
                Voyageurs confirmés ({confirmedPeople.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {confirmedPeople.map(p => (
                  <div key={p.id} className="row" style={{ padding: '8px 0' }}>
                    <div>
                      <b>{p.name}</b>
                      <div className="mut" style={{ fontSize: '12px' }}>{p.job} · {p.type}</div>
                    </div>
                    <span className="pill ok" style={{ fontSize: '10.5px' }}>Inscrit</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
