import React, { useState } from 'react';
import { useApp, useForm, cur, F } from '../ctx.js';
import { DeleteBtn } from '../ui.jsx';
import { changeOrgCode, MIN_CODE } from '../auth.js';
import { TYPES } from '../data.js';
import { Settings, Users, Check, X, Shield, UserPlus, KeyRound } from 'lucide-react';

// part : 'people' (participants, refus, paiements) ou 'settings' (réglages + sécurité)
export default function Manage({ part = 'people' }) {
  const { t, org, upd } = useApp();
  const [f, b] = useForm({
    sn: t.name,
    sd: t.dest,
    sm: t.mode || 'group',
    sdt: t.dates,
    sp: t.pp,
    sc: t.cap,
    sw: t.wa,
    sb: t.bereal
  });
  const [saved, setSaved] = useState(false);
  const [np, setNp] = useState({ name: '', phone: '', type: TYPES[0] });
  const [pw, setPw] = useState({ old: '', next: '', next2: '' });
  const [pwMsg, setPwMsg] = useState(null);

  const isSolo = t.mode === 'solo';

  if (!org) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Shield size={40} color="var(--gold)" style={{ margin: '0 auto 12px' }} />
        <h2 style={{ justifyContent: 'center' }}>Espace réservé à l’organisateur</h2>
        <p className="mut" style={{ maxWidth: '500px', margin: '0 auto 16px' }}>
          La gestion des inscriptions, des paiements et des réglages du séjour est réservée au créateur du voyage.
        </p>
      </div>
    );
  }

  const pendingPays = (t.pays || []).map((p, i) => ({ ...p, i })).filter(p => !p.ok);
  const people = t.people || [];

  const setStatus = (id, st) => upd(s => {
    const found = cur(s).people.find(x => x.id === id);
    if (found) found.st = st;
  });

  const addPerson = e => {
    e.preventDefault();
    if (!np.name.trim()) return;
    upd(s => {
      const trip = cur(s);
      if (!trip.people) trip.people = [];
      trip.people.push({
        id: 'p-' + Date.now(),
        name: np.name.trim(),
        phone: np.phone.trim(),
        type: np.type,
        job: 'Participant',
        st: 'ok'
      });
    });
    setNp({ name: '', phone: '', type: TYPES[0] });
  };

  const saveSettings = () => {
    upd(s => {
      const trip = cur(s);
      trip.name = f.sn || trip.name;
      trip.dest = f.sd || trip.dest;
      trip.mode = f.sm || trip.mode;
      trip.dates = f.sdt || trip.dates;
      trip.pp = Number(f.sp) || trip.pp;
      trip.cap = Number(f.sc) || trip.cap;
      trip.wa = f.sw || trip.wa;
      trip.bereal = f.sb || trip.bereal;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const submitPw = async e => {
    e.preventDefault();
    if (pw.next.length < MIN_CODE) return setPwMsg({ ok: false, t: `Le nouveau code doit contenir au moins ${MIN_CODE} caractères.` });
    if (pw.next !== pw.next2) return setPwMsg({ ok: false, t: 'Les deux nouveaux codes ne sont pas identiques.' });
    const ok = await changeOrgCode(pw.old, pw.next);
    if (!ok) return setPwMsg({ ok: false, t: 'Le code actuel est incorrect.' });
    setPw({ old: '', next: '', next2: '' });
    setPwMsg({ ok: true, t: 'Code organisateur modifié.' });
  };

  return (
    <div>
      <div className="card card-hero dark-scope">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {part === 'people' ? <Users size={20} /> : <Settings size={20} />}
          <span className="pill primary">{part === 'people' ? 'Participants' : 'Paramètres'}</span>
        </div>
        <h1 className="big" style={{ margin: '0 0 6px', fontSize: '26px' }}>
          {part === 'people' ? 'Participants & inscriptions' : `Paramètres de ${t.name}`}
        </h1>
        <p className="mut" style={{ margin: 0, fontSize: '14px' }}>
          {part === 'people'
            ? 'Validez, refusez ou supprimez les personnes ajoutées, et confirmez les paiements reçus.'
            : 'Informations du séjour, liens partagés et sécurité de votre espace.'}
        </p>
      </div>

      {part === 'people' && !isSolo && (
        <div className="grid-2">
          <div>
            <div className="card">
              <h2><Users size={18} /> Inscriptions ({people.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {people.map(p => (
                  <div key={p.id} className="row">
                    <div style={{ minWidth: 0 }}>
                      <b>{p.name}</b> {p.age && <span className="mut">({p.age} ans)</span>}
                      <div className="mut" style={{ fontSize: '12px' }}>
                        {[p.job, p.type, p.phone].filter(Boolean).join(' · ')}
                      </div>
                      {p.why && <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '2px', color: 'var(--text-muted)' }}>« {p.why} »</div>}
                    </div>

                    <div className="row-actions">
                      {p.st === 'ok' ? (
                        <span className="pill ok">Validé</span>
                      ) : p.st === 'no' ? (
                        <span className="pill">Refusé</span>
                      ) : (
                        <>
                          <button className="olive sm" onClick={() => setStatus(p.id, 'ok')}><Check size={12} /> Valider</button>
                          <button className="subtle sm" onClick={() => setStatus(p.id, 'no')}><X size={12} /> Refuser</button>
                        </>
                      )}
                      <DeleteBtn
                        label={`Supprimer ${p.name}`}
                        disabled={p.id === 'me'}
                        title={p.id === 'me' ? 'Vous êtes l’organisateur' : undefined}
                        onConfirm={() => upd(s => {
                          const trip = cur(s);
                          trip.people = trip.people.filter(x => x.id !== p.id);
                        })}
                      />
                    </div>
                  </div>
                ))}

                {!people.length && <div className="empty-box"><p>Aucun participant inscrit pour l'instant.</p></div>}
              </div>

              <form onSubmit={addPerson} className="add-form">
                <h3><UserPlus size={16} style={{ verticalAlign: '-3px', marginRight: '6px' }} />Ajouter un participant</h3>
                <div className="grid-2">
                  <div>
                    <label>Nom *</label>
                    <input value={np.name} onChange={e => setNp({ ...np, name: e.target.value })} placeholder="Ex: Paul Mbarga" />
                  </div>
                  <div>
                    <label>Téléphone</label>
                    <input value={np.phone} onChange={e => setNp({ ...np, phone: e.target.value })} placeholder="+237 6XX XX XX XX" />
                  </div>
                </div>
                <label>Profil</label>
                <select value={np.type} onChange={e => setNp({ ...np, type: e.target.value })}>
                  {TYPES.map(ty => <option key={ty}>{ty}</option>)}
                </select>
                <button type="submit" className="accent" disabled={!np.name.trim()}><UserPlus size={15} /> Ajouter (validé)</button>
              </form>
            </div>
          </div>

          <div>
            <div className="card">
              <h2><X size={18} /> Invitations déclinées ({(t.declined || []).length})</h2>
              <p className="mut">Les personnes ayant indiqué ne pas pouvoir participer.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {(t.declined || []).map((d, idx) => (
                  <div key={d.id || idx} className="row">
                    <div style={{ minWidth: 0 }}>
                      <b>{d.name}</b>
                      {d.date && <span className="mut" style={{ fontSize: '11px', marginLeft: '6px' }}>({d.date})</span>}
                      {d.why && (
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>« {d.why} »</div>
                      )}
                    </div>
                    <DeleteBtn
                      label={`Supprimer la réponse de ${d.name}`}
                      onConfirm={() => upd(s => { cur(s).declined.splice(idx, 1); })}
                    />
                  </div>
                ))}
                {!(t.declined && t.declined.length) && (
                  <div className="empty-box" style={{ padding: '20px' }}><p>Aucune déclinaison reçue.</p></div>
                )}
              </div>
            </div>

            <div className="card">
              <h2>Paiements à confirmer ({pendingPays.length})</h2>
              <p className="mut">Les participants ayant déclaré un versement s’affichent ici.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {pendingPays.map(p => (
                  <div key={p.i} className="row">
                    <div>
                      <b>{p.name}</b>
                      <div className="mut" style={{ fontSize: '12px' }}>{p.l} · <b>{F(p.a)}</b></div>
                    </div>
                    <button
                      className="olive sm"
                      onClick={() => upd(s => {
                        const trip = cur(s);
                        const pay = trip.pays[p.i];
                        if (pay) {
                          pay.ok = true;
                          if (!trip.ledger) trip.ledger = [];
                          trip.ledger.unshift({
                            l: `Versement de ${pay.name} · ${pay.l}`,
                            s: pay.a,
                            cat: 'Entrées',
                            date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                          });
                        }
                      })}
                    >
                      <Check size={13} /> Confirmer la réception
                    </button>
                  </div>
                ))}
                {!pendingPays.length && <div className="empty-box"><p>Aucun paiement en attente.</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {part === 'people' && isSolo && (
        <div className="card empty-box">
          <p>Ce voyage est en mode solo : il n’y a pas de participants à gérer.</p>
        </div>
      )}

      {part === 'settings' && (
        <div className="grid-2">
          <div className="card">
            <h2>Informations du voyage</h2>

            <label>Mode de voyage</label>
            <select {...b('sm')}>
              <option value="group">Groupe (Défis, cotisations et clans)</option>
              <option value="solo">Solo (Autonomie, carnet et budget perso)</option>
            </select>

            <label>Intitulé du séjour</label>
            <input {...b('sn')} placeholder="Nom du voyage" />

            <label>Destination & Région</label>
            <input {...b('sd')} placeholder="Destination" />

            <label>Dates</label>
            <input {...b('sdt')} placeholder="Ex: 12 au 18 Août 2027" />

            <div className="grid-2">
              <div>
                <label>{f.sm === 'solo' ? 'Budget personnel (FCFA)' : 'Budget / personne (FCFA)'}</label>
                <input type="number" {...b('sp')} />
              </div>
              {f.sm !== 'solo' && (
                <div>
                  <label>Capacité maximale</label>
                  <input type="number" {...b('sc')} />
                </div>
              )}
            </div>

            <label>Lien Groupe WhatsApp</label>
            <input {...b('sw')} placeholder="https://chat.whatsapp.com/..." />

            <label>Lien Album photo</label>
            <input {...b('sb')} placeholder="https://..." />

            <button className="accent" onClick={saveSettings} style={{ width: '100%', marginTop: '6px' }}>
              {saved ? <><Check size={15} /> Enregistré</> : 'Enregistrer les modifications'}
            </button>
          </div>

          <div className="card">
            <h2><KeyRound size={18} /> Sécurité de l’espace organisateur</h2>
            <p className="mut">Changez le code utilisé pour entrer dans l’espace organisateur sur cet appareil.</p>
            <form onSubmit={submitPw}>
              <label>Code actuel</label>
              <input type="password" autoComplete="current-password" value={pw.old} onChange={e => setPw({ ...pw, old: e.target.value })} />
              <label>Nouveau code</label>
              <input type="password" autoComplete="new-password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} />
              <label>Confirmer le nouveau code</label>
              <input type="password" autoComplete="new-password" value={pw.next2} onChange={e => setPw({ ...pw, next2: e.target.value })} />
              {pwMsg && <div className={pwMsg.ok ? 'form-ok' : 'form-err'} role="status">{pwMsg.t}</div>}
              <button type="submit" className="accent" disabled={!pw.old || !pw.next}>Modifier le code</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
