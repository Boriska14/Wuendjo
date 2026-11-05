import React from 'react';
import { useApp, useForm, cur } from '../ctx.js';
import { DAYS } from '../data.js';
import { Trophy, Key, Plus, Check, Shield, Compass } from 'lucide-react';

export default function Games() {
  const { t, org, upd, go } = useApp();
  const [f, b, reset] = useForm({ tm: 'A' });

  const isSolo = t.mode === 'solo';

  if (isSolo) {
    const soloQuests = [
      { title: 'Défi Découverte Culinaire', desc: 'Goûtez un plat ou fruit local que vous n’avez jamais mangé auparavant.', pts: 20 },
      { title: 'Défi Rencontre & Échange', desc: 'Prenez le temps de discuter avec un artisan ou habitant local de son métier.', pts: 25 },
      { title: 'Défi Panorama de l’Aube', desc: 'Photographiez les premières lueurs du soleil depuis le plus haut point accessible.', pts: 30 },
      { title: 'Défi Déconnexion Numérique', desc: 'Passez une demi-journée complète sans smartphone ni réseaux sociaux.', pts: 25 }
    ];

    return (
      <div>
        <div className="card card-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Compass size={20} color="var(--accent)" />
            <span className="pill accent">Quêtes & Défis Personnels</span>
          </div>
          <h1 className="big" style={{ margin: '0 0 8px', fontSize: '26px' }}>
            Défis de l’Explorateur Solo
          </h1>
          <p className="mut" style={{ margin: 0, fontSize: '14px' }}>
            En voyage solo, les défis de clans font place à des missions personnelles d’immersion, d’introspection et de découverte.
          </p>
        </div>

        <div className="grid-2">
          {soloQuests.map((quest, idx) => {
            const isDone = (t.done || []).includes('solo-' + idx);
            return (
              <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '22px' }}>
                <div>
                  <h3 style={{ fontSize: '16.5px', color: 'var(--primary)', marginBottom: '6px' }}>
                    {quest.title}
                  </h3>
                  <p className="mut" style={{ margin: '0 0 10px', fontSize: '13.5px' }}>
                    {quest.desc}
                  </p>
                  <span className="pill ok" style={{ fontSize: '11px' }}>
                    +{quest.pts} points d’exploration
                  </span>
                </div>

                <button
                  className={isDone ? 'olive sm' : 'subtle sm'}
                  onClick={() => upd(s => {
                    const trip = cur(s);
                    if (!trip.done) trip.done = [];
                    const key = 'solo-' + idx;
                    const i = trip.done.indexOf(key);
                    i < 0 ? trip.done.push(key) : trip.done.splice(i, 1);
                  })}
                >
                  {isDone ? <><Check size={14} /> Défi Relevé !</> : 'Marquer comme fait'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ marginTop: '16px', textAlign: 'center', padding: '26px' }}>
          <h3>Envie de jouer en équipe ?</h3>
          <p className="mut" style={{ maxWidth: '600px', margin: '0 auto 14px' }}>
            Pour vivre la grande aventure avec les 4 clés, les énigmes et les scores d’équipes, organisez un voyage en groupe ou basculez le mode du séjour.
          </p>
          <button className="alt sm" onClick={() => go('gerer')}>
            Modifier les réglages du voyage
          </button>
        </div>
      </div>
    );
  }

  // Si voyage en groupe : Le Grand Jeu des 4 Clés
  const scoreTeamA = (t.scores || []).filter(s => s.team === 'A').reduce((a, s) => a + s.pts, 0);
  const scoreTeamB = (t.scores || []).filter(s => s.team === 'B').reduce((a, s) => a + s.pts, 0);

  const toggleChallenge = (key) => {
    upd(s => {
      const d = cur(s).done || (cur(s).done = []);
      const i = d.indexOf(key);
      i < 0 ? d.push(key) : d.splice(i, 1);
    });
  };

  const addScore = () => {
    if (!f.pt) return;
    upd(s => {
      const trip = cur(s);
      if (!trip.scores) trip.scores = [];
      trip.scores.push({
        team: f.tm || 'A',
        pts: +f.pt,
        why: f.ws || 'Épreuve validée'
      });
    });
    reset();
  };

  const addClue = () => {
    if (!f.cl) return;
    upd(s => {
      const trip = cur(s);
      if (!trip.clues) trip.clues = [];
      trip.clues.push(f.cl);
    });
    reset();
  };

  return (
    <div>
      <div className="card card-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Trophy size={20} color="var(--accent)" />
          <span className="pill accent">Animation & Esprit d’Équipe</span>
        </div>
        <h1 className="big" style={{ margin: '0 0 6px', fontSize: '26px' }}>
          Le Grand Jeu des 4 Clés Wuendjo
        </h1>
        <p className="mut" style={{ margin: 0, fontSize: '14px', maxWidth: '800px' }}>
          Résolvez les énigmes quotidiennes, débloquez les 4 clés du sanctuaire et faites triompher votre clan dans le respect et la convivialité.
        </p>
      </div>

      {/* Tableau des scores des équipes */}
      <div className="grid-2" style={{ marginBottom: '22px' }}>
        <div className="card" style={{ border: '1.5px solid var(--border-gold)', background: 'var(--card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="mut" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clan A</div>
              <h2 style={{ margin: '2px 0 0', color: 'var(--gold)' }}>Les Aigles Bamiléké</h2>
            </div>
            <div className="big" style={{ fontSize: '32px', color: 'var(--gold)' }}>{scoreTeamA} pts</div>
          </div>
        </div>

        <div className="card" style={{ border: '1.5px solid rgba(148, 60, 26, 0.5)', background: 'var(--card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="mut" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clan B</div>
              <h2 style={{ margin: '2px 0 0', color: '#FF9E80' }}>Les Lions de la Lobé</h2>
            </div>
            <div className="big accent" style={{ fontSize: '32px' }}>{scoreTeamB} pts</div>
          </div>
        </div>
      </div>

      {/* Les 4 étapes / 4 Clés */}
      <div className="grid-2">
        <div>
          <div className="card">
            <h2>
              <Key size={18} color="var(--gold)" />
              Progression des 4 Clés
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              {DAYS.map((d, i) => {
                const keyId = `k-${i}`;
                const isUnlocked = (t.done || []).includes(keyId);
                return (
                  <div
                    key={i}
                    onClick={() => toggleChallenge(keyId)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: isUnlocked ? 'var(--forest)' : 'var(--card-subtle)',
                      border: isUnlocked ? '1.5px solid rgba(71, 78, 48, 0.7)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className={`pill ${isUnlocked ? 'ok' : 'primary'}`} style={{ fontSize: '11px' }}>
                        {d.day}
                      </span>
                      {isUnlocked && <span className="mut" style={{ color: 'var(--olive-text)', fontWeight: 700, fontSize: '12px' }}>✓ Clé Débloquée</span>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: isUnlocked ? 'var(--olive-text)' : '#FFF6EE' }}>
                      {d.title}
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {d.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          {/* Indices & Énigmes */}
          <div className="card">
            <h2>Indices & Carnet d’Énigmes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {(t.clues || []).map((c, i) => (
                <div key={i} style={{ background: 'var(--card-alt)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                  📜 <i>« {c} »</i>
                </div>
              ))}
            </div>

            {org && (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                <label>Ajouter un nouvel indice (Organisateur)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    {...b('cl')}
                    placeholder="Ex: Le code est gravé sous la pirogue bleue"
                    style={{ margin: 0 }}
                  />
                  <button className="accent sm" onClick={addClue} style={{ flexShrink: 0 }}>
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Attribution des points */}
          {org && (
            <div className="card">
              <h2>Attribuer des Points aux Clans</h2>
              <div className="grid-2">
                <div>
                  <label>Équipe</label>
                  <select {...b('tm')}>
                    <option value="A">Clan A (Aigles)</option>
                    <option value="B">Clan B (Lions)</option>
                  </select>
                </div>
                <div>
                  <label>Points</label>
                  <input type="number" {...b('pt')} placeholder="Ex: 20" />
                </div>
              </div>
              <label>Motif de la récompense</label>
              <input {...b('ws')} placeholder="Ex: Première équipe à localiser la cascade" />
              <button className="accent" onClick={addScore} style={{ width: '100%', marginTop: '6px' }}>
                Valider les points
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
