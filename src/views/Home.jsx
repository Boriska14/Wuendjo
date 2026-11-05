import React, { useState, useEffect } from 'react';
import { useApp, useForm, cur, F, STATUS_MAP } from '../ctx.js';
import { TYPES } from '../data.js';
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
  Sparkles,
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

    setFeedbackMsg(`🎉 Félicitations ${yesName.trim()} ! Votre participation a bien été enregistrée. L’organisateur a été prévenu.`);
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

    setFeedbackMsg(`🙏 Merci ${noName.trim()} d'avoir prévenu l'organisateur ! Ce sera avec grand plaisir pour le prochain voyage.`);
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
          1. CARTE D'INVITATION & PETIT DESCRIPTIF DU VOYAGE
          (Association Couleur Principale avec le Blanc Pur)
          ======================================================== */}
      <div className="card-invite-banner">
        {/* Barre d'en-tête de l'invitation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="pill white-accent">
              <Sparkles size={13} /> INVITATION AU VOYAGE
            </span>
            <span className="pill outline-white">
              <User size={12} /> {isSolo ? 'Carnet Solo' : 'Organisé sur Wuendjo'}
            </span>
            <span className="pill outline-white" style={{ fontSize: '11px' }}>
              {statusInfo.label}
            </span>
          </div>

          {/* Boutons d'action de partage */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={shareTrip}
              style={{
                background: '#FFFFFF',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '13px',
                padding: '7px 14px',
                minHeight: '36px',
                border: '1px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
              }}
              title="Copier le lien pour inviter des amis"
            >
              <Share2 size={14} /> Partager à des amis
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
              title="Partager directement sur WhatsApp"
            >
              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '7px 12px',
                  minHeight: '36px',
                  border: '1px solid rgba(255, 255, 255, 0.35)'
                }}
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
            </a>
          </div>
        </div>

        {/* Grand Titre du Voyage en Blanc Éclatant */}
        <h1 style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: 800, margin: '0 0 14px', lineHeight: '1.2' }}>
          {t.name}
        </h1>

        {/* Capsules Métadonnées Blanches & Contraste Élevé */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '18px' }}>
          <div className="white-chip">
            <MapPin size={17} color="var(--gold)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Destination</div>
              <b>{t.dest}</b>
            </div>
          </div>

          <div className="white-chip">
            <Calendar size={17} color="var(--gold)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Dates du séjour</div>
              <b>{t.dates}</b>
            </div>
          </div>

          <div className="white-chip">
            <Sparkles size={17} color="var(--gold)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {isSolo ? 'Budget alloué' : 'Budget estimé / pers.'}
              </div>
              <b style={{ color: '#FFFFFF' }}>{F(t.pp)}</b>
            </div>
          </div>

          {!isSolo && (
            <div className="white-chip">
              <Users size={17} color="var(--gold)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Places & Équipe</div>
                <b>{n} / {t.cap} confirmés</b> {t.cap - n > 0 && <span style={{ color: 'var(--gold)', fontSize: '12px' }}>({t.cap - n} libre{t.cap - n > 1 ? 's' : ''})</span>}
              </div>
            </div>
          )}
        </div>

        {/* Le Petit Descriptif du Voyage Rédigé */}
        <div style={{
          background: 'rgba(17, 7, 3, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Compass size={18} color="var(--gold)" />
            <h3 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF' }}>Descriptif de l'Aventure</h3>
          </div>
          <p style={{ margin: 0, fontSize: '14.5px', color: '#F4EBE2', lineHeight: '1.65' }}>
            {t.description || (isSolo
              ? `Une escapade en toute autonomie pour découvrir les merveilles de ${t.dest} à votre propre rythme, avec carnet de route, sélection de bonnes adresses et ressourcement garanti.`
              : `Une aventure collective inoubliable rythmée par la découverte de ${t.dest}, le partage de moments forts, la dégustation des mets traditionnels et des quêtes conviviales en groupe !`)}
          </p>

          {/* 3 piliers phares du voyage */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#FFFFFF' }}>
              <span style={{ fontSize: '16px' }}>🌿</span>
              <span>Immersion & Nature</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#FFFFFF' }}>
              <span style={{ fontSize: '16px' }}>🍲</span>
              <span>Terroir & Gastronomie</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#FFFFFF' }}>
              <span style={{ fontSize: '16px' }}>🤝</span>
              <span>Transparence & Amitié</span>
            </div>
          </div>
        </div>

        {/* Feedback message suite à soumission */}
        {feedbackMsg && (
          <div style={{
            background: '#FFFFFF',
            color: 'var(--accent)',
            border: '2px solid var(--gold)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '16px',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)'
          }}>
            <span>{feedbackMsg}</span>
            <button
              onClick={() => setFeedbackMsg('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', padding: '2px 6px', fontSize: '16px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================
            BLOC INTERACTIF : PROPOSER DE PARTICIPER OU NON (RSVP)
            ======================================================== */}
        {!isSolo && (
          <div className="rsvp-choice-card">
            {/* Cas 1 : L'utilisateur a déjà répondu OUI */}
            {isEnrolled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={20} color="var(--accent)" strokeWidth={3} />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '15px' }}>
                      Vous participez à ce voyage !
                    </div>
                    <div style={{ color: '#F4EBE2', fontSize: '12.5px' }}>
                      Votre place est enregistrée auprès de l’organisateur ({me ? me.name : myRsvpStatus?.name}).
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="sm"
                    onClick={resetMyRsvp}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      fontSize: '12px',
                      padding: '5px 12px'
                    }}
                  >
                    Modifier ma réponse
                  </button>
                  <button
                    className="sm accent"
                    onClick={() => go('chat')}
                    style={{ background: '#FFFFFF', color: 'var(--accent)', fontWeight: 700 }}
                  >
                    Ouvrir la discussion
                  </button>
                </div>
              </div>
            )}

            {/* Cas 2 : L'utilisateur a déjà répondu NON */}
            {!isEnrolled && hasDeclined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>
                    ✉️ Vous avez décliné cette invitation
                  </div>
                  <div style={{ color: '#F4EBE2', fontSize: '12.5px' }}>
                    Motif : « {myRsvpStatus?.why || 'Non disponible'} ». Merci d'avoir prévenu l'organisateur !
                  </div>
                </div>

                <button
                  onClick={() => { setMyRsvpStatus(null); setRsvpMode('yes'); }}
                  style={{
                    background: '#FFFFFF',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '8px 16px',
                    border: '1px solid #FFFFFF'
                  }}
                >
                  J'ai changé d'avis : Je participe ! 🎉
                </button>
              </div>
            )}

            {/* Cas 3 : L'utilisateur n'a pas encore répondu -> PROPOSITION DE PARTICIPER OU NON */}
            {!isEnrolled && !hasDeclined && rsvpMode === null && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '17px', color: '#FFFFFF', fontWeight: 800 }}>
                      Serez-vous des nôtres pour cette aventure à {t.dest} ?
                    </h3>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#F4EBE2' }}>
                      Répondez en un clic pour aider l’organisateur à finaliser les réservations et le programme.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Bouton OUI : Blanc pur et couleur principale */}
                    <button
                      onClick={() => setRsvpMode('yes')}
                      style={{
                        background: '#FFFFFF',
                        color: 'var(--accent)',
                        fontWeight: 800,
                        fontSize: '14px',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      <Check size={16} strokeWidth={2.5} /> Oui, je participe ! 🎉
                    </button>

                    {/* Bouton NON : Décliner poliment */}
                    <button
                      onClick={() => setRsvpMode('no')}
                      style={{
                        background: 'transparent',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '13.5px',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid rgba(255, 255, 255, 0.45)',
                        boxShadow: 'none'
                      }}
                    >
                      <X size={15} /> Je ne pourrai pas cette fois
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VOLET DÉPLIÉ 1 : FORMULAIRE "OUI, JE PARTICIPE" */}
            {rsvpMode === 'yes' && (
              <form onSubmit={submitYesParticipation} style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '8px' }}>
                  <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="var(--gold)" /> Confirmer ma participation au voyage
                  </div>
                  <button
                    type="button"
                    onClick={() => setRsvpMode(null)}
                    style={{ background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer', padding: '4px' }}
                  >
                    ✕ Annuler
                  </button>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ color: '#FFFFFF' }}>Votre nom complet *</label>
                    <input
                      required
                      value={yesName}
                      onChange={e => setYesName(e.target.value)}
                      placeholder="Ex: Paul Mbarga"
                      style={{ background: '#170904', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#FFFFFF' }}>N° Téléphone ou WhatsApp *</label>
                    <input
                      value={yesPhone}
                      onChange={e => setYesPhone(e.target.value)}
                      placeholder="+237 6XX XX XX XX"
                      style={{ background: '#170904', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ color: '#FFFFFF' }}>Votre profil voyageur</label>
                    <select
                      value={yesType}
                      onChange={e => setYesType(e.target.value)}
                      style={{ background: '#170904', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }}
                    >
                      {TYPES.map(ty => <option key={ty} value={ty}>{ty}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ color: '#FFFFFF' }}>Régime alimentaire ou préférences</label>
                    <input
                      value={yesDiet}
                      onChange={e => setYesDiet(e.target.value)}
                      placeholder="Ex: Sans arachides, végétarien, aucun..."
                      style={{ background: '#170904', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }}
                    />
                  </div>
                </div>

                <label style={{ color: '#FFFFFF' }}>Un petit mot pour le groupe ou vos attentes</label>
                <textarea
                  rows={2}
                  value={yesWhy}
                  onChange={e => setYesWhy(e.target.value)}
                  placeholder="Ex: Trop hâte de découvrir les cascades et de partager ces moments avec vous !"
                  style={{ background: '#170904', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setRsvpMode(null)}
                    style={{ background: 'transparent', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: '#FFFFFF',
                      color: 'var(--accent)',
                      fontWeight: 800,
                      padding: '10px 22px',
                      border: '2px solid #FFFFFF',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <Check size={16} /> Valider ma participation
                  </button>
                </div>
              </form>
            )}

            {/* VOLET DÉPLIÉ 2 : FORMULAIRE "JE NE POURRAI PAS" */}
            {rsvpMode === 'no' && (
              <form onSubmit={submitNoDecline} style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '8px' }}>
                  <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <X size={18} color="#FFB399" /> Transmettre une réponse négative
                  </div>
                  <button
                    type="button"
                    onClick={() => setRsvpMode(null)}
                    style={{ background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer', padding: '4px' }}
                  >
                    ✕ Annuler
                  </button>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ color: '#FFFFFF' }}>Votre nom ou prénom *</label>
                    <input
                      required
                      value={noName}
                      onChange={e => setNoName(e.target.value)}
                      placeholder="Ex: Christian"
                      style={{ background: '#170904', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#FFFFFF' }}>Motif ou petit mot pour l'organisateur</label>
                    <input
                      value={noWhy}
                      onChange={e => setNoWhy(e.target.value)}
                      placeholder="Ex: Déplacement professionnel sur cette date, profitez bien !"
                      style={{ background: '#170904', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setRsvpMode(null)}
                    style={{ background: 'transparent', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      padding: '10px 20px',
                      border: '1.5px solid rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    <Send size={15} /> Enregistrer ma réponse
                  </button>
                </div>
              </form>
            )}

            {/* Vue récapitulative pour l'organisateur */}
            {org && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '13px' }}>
                <div style={{ color: '#F4EBE2' }}>
                  👑 <b>Vue Organisateur :</b> {n} participant{n > 1 ? 's' : ''} confirmé{n > 1 ? 's' : ''} · {declinedList.length} déclinaison{declinedList.length > 1 ? 's' : ''}
                </div>
                <button
                  className="sm"
                  onClick={() => go('gerer')}
                  style={{
                    background: '#FFFFFF',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    padding: '4px 12px',
                    fontSize: '12px',
                    border: '1px solid #FFFFFF'
                  }}
                >
                  Gérer les inscriptions & RSVPs →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Toast de partage */}
      {copiedToast && (
        <div className="toast-feedback">
          <Check size={18} color="var(--accent)" strokeWidth={3} />
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
              <button className="subtle sm" onClick={() => setShowAddItin(!showAddItin)}>
                <Plus size={14} /> Ajouter une étape
              </button>
            </div>

            {showAddItin && (
              <div style={{ background: 'var(--card-alt)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 8px', color: '#FFFFFF' }}>Nouvelle étape de voyage</h3>
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
                        <b style={{ color: '#FFFFFF' }}>{step.title}</b>
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
                <button className="subtle sm" onClick={() => setShowAddItin(true)}>
                  <Plus size={14} /> Planifier la première étape
                </button>
              </div>
            )}
          </div>

          {/* TEASER GRAPHIQUE BUDGET RECHARTS */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--card) 60%, var(--card-alt) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2>Suivi Financier & Répartition</h2>
                <p className="mut" style={{ margin: 0 }}>
                  Consultez le graphique Recharts pour visualiser la répartition entre Transport, Logement, Repas et Activités.
                </p>
              </div>
              <button className="accent" onClick={() => go('budget')}>
                Voir le Budget Recharts <ArrowRight size={15} />
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
                      <b style={{ color: '#FFFFFF' }}>{p.name}</b>
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
