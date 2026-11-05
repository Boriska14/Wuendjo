import React, { useState } from 'react';
import { useApp, useForm, cur, F, STATUS_MAP } from '../ctx.js';
import { TYPES } from '../data.js';
import { MapPin, Calendar, Users, User, CheckCircle2, Circle, Plus, ArrowRight } from 'lucide-react';

export default function Home() {
  const { t, me, org, ok, upd, go } = useApp();
  const [f, b, reset] = useForm();
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newItinDay, setNewItinDay] = useState('');
  const [newItinTitle, setNewItinTitle] = useState('');
  const [showAddItin, setShowAddItin] = useState(false);

  const isSolo = t.mode === 'solo';
  const confirmedPeople = (t.people || []).filter(p => p.st === 'ok');
  const n = confirmedPeople.length;
  const statusInfo = STATUS_MAP[t.status || 'active'] || STATUS_MAP.active;

  // Inscription pour voyage de groupe
  const sendRegistration = () => {
    if (!f.n || !f.ty) return;
    upd(s => {
      const trip = cur(s);
      trip.people.push({
        id: 'me',
        name: f.n,
        age: f.a || 25,
        job: f.j || 'Voyageur',
        phone: f.ph || '',
        type: f.ty,
        diet: f.d || '',
        why: f.w || '',
        st: 'wait'
      });
    });
    reset();
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
      {/* Hero Card du Voyage Actif */}
      <div className="card card-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className={`mode-badge ${isSolo ? 'solo' : 'group'}`}>
                {isSolo ? <User size={13} /> : <Users size={13} />}
                {isSolo ? 'Voyage en Solo' : 'Voyage en Groupe'}
              </span>
              <span className="pill" style={{ fontSize: '11px' }}>
                {statusInfo.label}
              </span>
            </div>
            <h1 className="big" style={{ margin: '0 0 6px', fontSize: '28px' }}>{t.name}</h1>
            <div className="mut" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={15} color="var(--accent)" />
                <b>{t.dest}</b>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={15} color="var(--primary)" />
                {t.dates}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="mut" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isSolo ? 'Budget alloué' : 'Budget / personne'}
            </div>
            <div className="big accent" style={{ fontSize: '24px' }}>{F(t.pp)}</div>
            {!isSolo && (
              <div className="mut" style={{ fontSize: '13px' }}>
                Capacité : {n}/{t.cap} validés
              </div>
            )}
          </div>
        </div>

        <p style={{ margin: '14px 0 10px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {t.description || (isSolo
            ? 'Aventure personnelle en toute autonomie : découverte des trésors locaux, ressourcement et immersion.'
            : 'Aventure collective conviviale : défis des 4 clés, découverte locale et souvenirs partagés.')}
        </p>

        {!isSolo && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Validation du groupe : {n} participant{n > 1 ? 's' : ''} sur {t.cap}</span>
              <span>{Math.round((n / (t.cap || 1)) * 100)} %</span>
            </div>
            <div className="bar">
              <i style={{ width: `${Math.min(100, (n / (t.cap || 1)) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Grille principale adaptée selon Solo ou Groupe */}
      <div className="grid-2-1">
        <div>
          {/* SECTION ITINÉRAIRE JOUR PAR JOUR */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2>
                <Calendar size={18} color="var(--primary)" />
                Programme & Itinéraire
              </h2>
              <button className="subtle sm" onClick={() => setShowAddItin(!showAddItin)}>
                <Plus size={14} /> Ajouter une étape
              </button>
            </div>

            {showAddItin && (
              <div style={{ background: 'var(--sand-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '13px', margin: '0 0 8px' }}>Nouvelle étape de voyage</h3>
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
                <button className="subtle sm" onClick={() => setShowAddItin(true)}>
                  <Plus size={14} /> Planifier la première étape
                </button>
              </div>
            )}
          </div>

          {/* TEASER GRAPHIQUE BUDGET RECHARTS */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--card) 70%, var(--sand-light) 100%)' }}>
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
                <CheckCircle2 size={18} color="var(--olive)" />
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
                    <CheckCircle2 size={18} color="var(--olive)" style={{ flexShrink: 0 }} />
                  ) : (
                    <Circle size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontSize: '13.5px',
                    fontWeight: item.done ? 500 : 600,
                    color: item.done ? 'var(--olive)' : 'var(--text)'
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
                placeholder="Ajouter une tâche (ex: Sacoche étanche)"
                style={{ margin: 0, padding: '9px 12px', fontSize: '13.5px', minHeight: '38px' }}
              />
              <button className="subtle sm" onClick={addChecklistItem} style={{ flexShrink: 0, minHeight: '38px', padding: '0 12px' }}>
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Formulaire d'inscription si participant non inscrit */}
          {!isSolo && !org && !me && (
            <div className="card">
              <h2>Rejoindre l’aventure du groupe</h2>
              <p className="mut">Remplissez ce formulaire pour soumettre votre candidature à l’organisateur.</p>
              <input {...b('n')} placeholder="Nom complet *" />
              <div className="grid-2">
                <input type="number" {...b('a')} placeholder="Âge" />
                <input {...b('ph')} placeholder="N° WhatsApp" />
              </div>
              <input {...b('j')} placeholder="Profession / Activité" />
              <select {...b('ty')}>
                <option value="">Sélectionnez votre profil voyageur *</option>
                {TYPES.map(ty => <option key={ty} value={ty}>{ty}</option>)}
              </select>
              <textarea rows={2} {...b('w')} placeholder="Pourquoi souhaitez-vous participer à ce voyage ?" />
              <button className="accent" onClick={sendRegistration} style={{ width: '100%' }}>
                Envoyer ma demande
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
