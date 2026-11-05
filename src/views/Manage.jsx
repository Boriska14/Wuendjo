import React from 'react';
import { useApp, useForm, cur, F } from '../ctx.js';
import { Settings, Users, Check, X, Shield } from 'lucide-react';

export default function Manage() {
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

  const isSolo = t.mode === 'solo';

  if (!isSolo && !org) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Shield size={40} color="var(--gold)" style={{ margin: '0 auto 12px' }} />
        <h2>Espace réservé à l’Organisateur</h2>
        <p className="mut" style={{ maxWidth: '500px', margin: '0 auto 16px' }}>
          La gestion des inscriptions, des paiements et des réglages du séjour est réservée au créateur du voyage.
        </p>
      </div>
    );
  }

  const pendingPays = (t.pays || []).map((p, i) => ({ ...p, i })).filter(p => !p.ok);
  const people = t.people || [];

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
  };

  return (
    <div>
      <div className="card card-hero dark-scope">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Settings size={20} color="var(--gold)" />
          <span className="pill primary">Tableau de bord de Gestion</span>
        </div>
        <h1 className="big" style={{ margin: '0 0 6px', fontSize: '26px' }}>
          Gérer {t.name}
        </h1>
        <p className="mut" style={{ margin: 0, fontSize: '14px' }}>
          Configurez les paramètres du séjour, validez les participants et confirmez les paiements reçus.
        </p>
      </div>

      <div className="grid-2">
        <div>
          {!isSolo && (
            <>
              {/* Inscriptions */}
              <div className="card">
                <h2>
                  <Users size={18} color="var(--gold)" />
                  Gestion des Inscriptions ({people.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {people.map(p => (
                    <div key={p.id} className="row">
                      <div>
                        <b>{p.name}</b> {p.age && <span className="mut">({p.age} ans)</span>}
                        <div className="mut" style={{ fontSize: '12px' }}>
                          {p.job} · {p.type} {p.phone && `· ${p.phone}`}
                        </div>
                        {p.why && <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '2px', color: 'var(--text-muted)' }}>« {p.why} »</div>}
                      </div>

                      <div>
                        {p.st === 'ok' ? (
                          <span className="pill ok">Validé</span>
                        ) : p.st === 'no' ? (
                          <span className="pill">Refusé</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="olive sm"
                              onClick={() => upd(s => {
                                const found = cur(s).people.find(x => x.id === p.id);
                                if (found) found.st = 'ok';
                              })}
                            >
                              <Check size={12} /> Valider
                            </button>
                            <button
                              className="bad sm"
                              onClick={() => upd(s => {
                                const found = cur(s).people.find(x => x.id === p.id);
                                if (found) found.st = 'no';
                              })}
                            >
                              <X size={12} /> Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {!people.length && (
                    <div className="empty-box">
                      <p>Aucun participant inscrit pour l'instant.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Invitations déclinées */}
              <div className="card">
                <h2>
                  <X size={18} color="var(--accent)" />
                  Invitations Déclinées ({(t.declined || []).length})
                </h2>
                <p className="mut">Les amis ayant indiqué ne pas pouvoir participer s'affichent ici avec leur mot amical.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {(t.declined || []).map((d, idx) => (
                    <div key={d.id || idx} className="row">
                      <div>
                        <b>{d.name}</b>
                        {d.date && <span className="mut" style={{ fontSize: '11px', marginLeft: '6px' }}>({d.date})</span>}
                        {d.why && (
                          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                            « {d.why} »
                          </div>
                        )}
                      </div>
                      <span className="pill" style={{ fontSize: '11px' }}>Indisponible</span>
                    </div>
                  ))}

                  {!(t.declined && t.declined.length) && (
                    <div className="empty-box" style={{ padding: '20px' }}>
                      <p>Aucune déclinaison reçue pour le moment.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Paiements */}
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

                  {!pendingPays.length && (
                    <div className="empty-box">
                      <p>Aucun paiement en attente de validation.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div>
          {/* Paramètres du voyage */}
          <div className="card">
            <h2>Paramètres & Logistique du voyage</h2>

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

            <label>Lien Album photo BeReal / Google Photos</label>
            <input {...b('sb')} placeholder="https://..." />

            <button className="accent" onClick={saveSettings} style={{ width: '100%', marginTop: '6px' }}>
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
