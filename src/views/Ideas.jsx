import React, { useState } from 'react';
import { useApp, useForm, cur } from '../ctx.js';
import { SUGGESTIONS } from '../data.js';
import { DeleteBtn } from '../ui.jsx';
import { Compass, Utensils, Sparkles, MapPin, Star, Plus, Check, ThumbsUp, Camera, ExternalLink } from 'lucide-react';

export default function Ideas() {
  const { t, upd, org } = useApp();
  const [f, b, reset] = useForm({ k: 'Restaurant' });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [addedIds, setAddedIds] = useState([]);

  const filteredSuggestions = SUGGESTIONS.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (modeFilter !== 'all' && !item.suitability.includes(modeFilter)) return false;
    return true;
  });

  const addSuggestionToTrip = (sug) => {
    upd(s => {
      const trip = cur(s);
      if (!trip.ideas) trip.ideas = [];
      const kindLabel = sug.category === 'restaurant' ? 'Restaurant' : sug.category === 'activite' ? 'Activité' : 'Destination';
      trip.ideas.push({
        k: kindLabel,
        n: sug.title,
        z: `${sug.location} · ${sug.cost} · ${sug.description.slice(0, 80)}...`,
        v: 1
      });
    });
    setAddedIds(prev => [...prev, sug.id]);
  };

  const submitCustomIdea = () => {
    if (!f.n) return;
    upd(s => {
      const trip = cur(s);
      if (!trip.ideas) trip.ideas = [];
      trip.ideas.push({
        k: f.k,
        n: f.n,
        z: f.z || '',
        v: 1
      });
    });
    reset();
  };

  return (
    <div>
      <div className="card card-hero dark-scope">
        <h1 className="big" style={{ margin: '0 0 6px', fontSize: '26px' }}>
          Idées, Suggestions & Bonnes Adresses
        </h1>
        <p className="mut" style={{ margin: 0, fontSize: '14px', maxWidth: '800px' }}>
          Explorez les recommandations sélectionnées pour <b>{t.dest}</b> et les alentours, ou proposez vos propres trouvailles et votez ensemble.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', marginRight: '6px' }}>Catégorie :</span>
        <button
          className={categoryFilter === 'all' ? 'accent sm' : 'subtle sm'}
          onClick={() => setCategoryFilter('all')}
        >
          Toutes ({SUGGESTIONS.length})
        </button>
        <button
          className={categoryFilter === 'destination' ? 'accent sm' : 'subtle sm'}
          onClick={() => setCategoryFilter('destination')}
        >
          <Compass size={13} /> Destinations
        </button>
        <button
          className={categoryFilter === 'activite' ? 'accent sm' : 'subtle sm'}
          onClick={() => setCategoryFilter('activite')}
        >
          <Sparkles size={13} /> Activités & Découvertes
        </button>
        <button
          className={categoryFilter === 'restaurant' ? 'accent sm' : 'subtle sm'}
          onClick={() => setCategoryFilter('restaurant')}
        >
          <Utensils size={13} /> Restaurants & Terroirs
        </button>

        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', marginLeft: '12px', marginRight: '6px' }}>Mode :</span>
        <button
          className={modeFilter === 'all' ? 'primary sm' : 'subtle sm'}
          onClick={() => setModeFilter('all')}
        >
          Tous
        </button>
        <button
          className={modeFilter === 'solo' ? 'primary sm' : 'subtle sm'}
          onClick={() => setModeFilter('solo')}
        >
          Solo
        </button>
        <button
          className={modeFilter === 'group' ? 'primary sm' : 'subtle sm'}
          onClick={() => setModeFilter('group')}
        >
          Groupe
        </button>
      </div>

      {/* Grille des suggestions */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        {filteredSuggestions.map(item => {
          const isAdded = addedIds.includes(item.id);
          const isRest = item.category === 'restaurant';
          const isAct = item.category === 'activite';

          return (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className={`pill ${isRest ? 'accent' : isAct ? 'ok' : 'primary'}`}>
                    {isRest ? <Utensils size={12} /> : isAct ? <Sparkles size={12} /> : <Compass size={12} />}
                    {isRest ? 'Restaurant' : isAct ? 'Activité' : 'Destination'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>
                    <Star size={13} fill="currentColor" /> {item.rating}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', lineHeight: '1.3', marginBottom: '6px', color: 'var(--text)' }}>
                  {item.title}
                </h3>

                <div className="mut" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', marginBottom: '10px' }}>
                  <MapPin size={13} color="var(--gold)" />
                  <b>{item.location}</b> <span style={{ opacity: 0.7 }}>({item.country})</span>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: '0 0 12px' }}>
                  {item.description}
                </p>

                {item.highlight && (
                  <div style={{ background: 'var(--card-alt)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text)', marginBottom: '12px', border: '1px solid var(--border)' }}>
                    <b>Atout :</b> {item.highlight}
                  </div>
                )}

                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', marginBottom: '12px' }}>
                  {item.cost}
                </div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                {isAdded ? (
                  <button className="subtle sm" style={{ width: '100%', color: 'var(--olive-text)', borderColor: 'var(--olive-text)', fontWeight: 700 }} disabled>
                    <Check size={14} /> Retenu pour le voyage
                  </button>
                ) : (
                  <button className="accent sm" style={{ width: '100%' }} onClick={() => addSuggestionToTrip(item)}>
                    <Plus size={14} /> Retenir pour le voyage
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Proposer une idée & Album */}
      <div className="grid-2">
        <div className="card">
          <h2>
            <ThumbsUp size={18} color="var(--gold)" />
            Propositions retenues pour le voyage ({(t.ideas || []).length})
          </h2>
          <p className="mut">Votez pour orienter le programme du séjour.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {(t.ideas || []).map((x, j) => (
              <div key={j} className="row" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <b>{x.n}</b>
                    <span className="pill primary" style={{ fontSize: '10px', padding: '1px 6px' }}>{x.k}</span>
                  </div>
                  {x.z && <div className="mut" style={{ fontSize: '13px', marginTop: '2px' }}>{x.z}</div>}
                </div>
                <div className="row-actions">
                  <button
                    className="alt sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                    onClick={() => upd(s => { cur(s).ideas[j].v++; })}
                  >
                    <ThumbsUp size={12} />
                    <b>+1</b> · {x.v}
                  </button>
                  {org && (
                    <DeleteBtn
                      label={`Supprimer ${x.n}`}
                      onConfirm={() => upd(s => { cur(s).ideas.splice(j, 1); })}
                    />
                  )}
                </div>
              </div>
            ))}

            {(!t.ideas || !t.ideas.length) && (
              <div className="empty-box">
                <p>Aucune proposition personnalisée pour l’instant.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h2>Proposer une nouvelle adresse ou activité</h2>
            <p className="mut">Une pépite locale ou un spot secret à partager ?</p>

            <label>Type de proposition</label>
            <select {...b('k')}>
              <option value="Restaurant">Restaurant / Pause gourmande</option>
              <option value="Activité">Activité / Randonnée / Défi</option>
              <option value="Visite">Visite culturelle / Monument</option>
              <option value="Sortie">Soirée / Bar / Détente</option>
            </select>

            <label>Nom ou lieu *</label>
            <input {...b('n')} placeholder="Ex: Restaurant Le Wouri ou Cascade de Bana" />

            <label>Pourquoi recommandons-nous cet endroit ?</label>
            <textarea rows={2} {...b('z')} placeholder="Ex: Les poissons y sont braisés au feu de bois avec vue magnifique..." />

            <button className="accent" onClick={submitCustomIdea} style={{ width: '100%' }}>
              <Plus size={15} /> Proposer cette idée au groupe
            </button>
          </div>

          <div className="card">
            <h2>
              <Camera size={18} color="var(--gold)" />
              Souvenirs & Album photo
            </h2>
            {t.bereal ? (
              <div>
                <p className="mut">L’album photo partagé officiel du voyage est accessible ci-dessous :</p>
                <a href={t.bereal} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="olive" style={{ width: '100%' }}>
                    <ExternalLink size={15} /> Ouvrir l’album photos partagé
                  </button>
                </a>
              </div>
            ) : (
              <p className="mut">Aucun lien d'album n'a encore été configuré.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
