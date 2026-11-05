import React, { useState } from 'react';
import { useApp, F, STATUS_MAP } from '../ctx.js';
import { mk } from '../data.js';
import { Users, User, Calendar, MapPin, Plus, CheckCircle2, ArrowRight, History as HistoryIcon } from 'lucide-react';

export default function History() {
  const { S, upd, go } = useApp();
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '',
    dest: '',
    mode: 'group',
    dates: '',
    budget: 180000,
    cap: 8
  });

  const trips = S.trips || [];
  const currentIdx = S.t || 0;

  const totalTrips = trips.length;
  const soloTrips = trips.filter(t => t.mode === 'solo').length;
  const groupTrips = trips.filter(t => t.mode !== 'solo').length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const totalBudgetManaged = trips.reduce((acc, t) => acc + (t.pp || 0) * (t.mode === 'solo' ? 1 : (t.people?.length || 1)), 0);

  const filteredTrips = trips.map((trip, idx) => ({ ...trip, originalIdx: idx })).filter(trip => {
    if (filter === 'all') return true;
    if (filter === 'solo') return trip.mode === 'solo';
    if (filter === 'group') return trip.mode !== 'solo';
    return trip.status === filter;
  });

  const selectTrip = (idx) => {
    upd(s => {
      s.t = idx;
      s.tab = 'home';
    });
  };

  const handleCreate = () => {
    if (!newTrip.name.trim()) return;
    const created = mk(newTrip.name.trim(), newTrip.dest.trim() || 'Destination à définir', newTrip.mode, 'draft');
    created.dates = newTrip.dates.trim() || 'Dates à définir';
    created.pp = Number(newTrip.budget) || 180000;
    created.cap = newTrip.mode === 'solo' ? 1 : (Number(newTrip.cap) || 8);

    upd(s => {
      s.trips.push(created);
      s.t = s.trips.length - 1;
      s.tab = 'home';
    });

    setShowCreateModal(false);
    setNewTrip({ name: '', dest: '', mode: 'group', dates: '', budget: 180000, cap: 8 });
  };

  const markCompleted = (originalIdx) => {
    upd(s => {
      if (s.trips[originalIdx]) {
        s.trips[originalIdx].status = s.trips[originalIdx].status === 'completed' ? 'active' : 'completed';
      }
    });
  };

  return (
    <div>
      <div className="card card-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HistoryIcon size={20} color="var(--gold)" />
              <span className="pill primary">Historique des Carnets de Voyage</span>
            </div>
            <h1 className="big" style={{ margin: '0 0 8px', fontSize: '28px' }}>
              Tous mes Voyages Wuendjo
            </h1>
            <p className="mut" style={{ margin: 0, fontSize: '14px', maxWidth: '750px' }}>
              Retrouvez l’ensemble de vos aventures passées, en cours et à venir. Basculez facilement entre vos voyages en solo ou en groupe.
            </p>
          </div>

          <button className="accent" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Créer un nouveau voyage
          </button>
        </div>

        {/* Statistiques clés */}
        <div className="grid-3" style={{ marginTop: '20px' }}>
          <div style={{ background: 'var(--card-alt)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div className="mut" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Total Voyages</div>
            <div className="big" style={{ fontSize: '24px', marginTop: '2px' }}>{totalTrips}</div>
            <div className="mut" style={{ fontSize: '12px' }}>{groupTrips} en groupe · {soloTrips} en solo</div>
          </div>

          <div style={{ background: 'var(--card-alt)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div className="mut" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Aventures Terminées</div>
            <div className="big olive" style={{ fontSize: '24px', marginTop: '2px' }}>{completedTrips}</div>
            <div className="mut" style={{ fontSize: '12px' }}>Bilan et souvenirs sauvegardés</div>
          </div>

          <div style={{ background: 'var(--card-alt)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div className="mut" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Volume Budget Géré</div>
            <div className="big accent" style={{ fontSize: '24px', marginTop: '2px' }}>{F(totalBudgetManaged)}</div>
            <div className="mut" style={{ fontSize: '12px' }}>Sur l’ensemble des éditions</div>
          </div>
        </div>
      </div>

      {/* Barre de filtrage */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', marginRight: '6px' }}>Filtrer :</span>
        <button
          className={filter === 'all' ? 'accent sm' : 'subtle sm'}
          onClick={() => setFilter('all')}
        >
          Tous ({trips.length})
        </button>
        <button
          className={filter === 'active' ? 'accent sm' : 'subtle sm'}
          onClick={() => setFilter('active')}
        >
          En cours
        </button>
        <button
          className={filter === 'upcoming' ? 'accent sm' : 'subtle sm'}
          onClick={() => setFilter('upcoming')}
        >
          À venir
        </button>
        <button
          className={filter === 'completed' ? 'accent sm' : 'subtle sm'}
          onClick={() => setFilter('completed')}
        >
          Terminés
        </button>
        <button
          className={filter === 'solo' ? 'primary sm' : 'subtle sm'}
          onClick={() => setFilter('solo')}
        >
          <User size={13} /> En Solo
        </button>
        <button
          className={filter === 'group' ? 'primary sm' : 'subtle sm'}
          onClick={() => setFilter('group')}
        >
          <Users size={13} /> En Groupe
        </button>
      </div>

      {/* Cartes des voyages */}
      <div className="grid-2">
        {filteredTrips.map(trip => {
          const isCurrent = trip.originalIdx === currentIdx;
          const isSolo = trip.mode === 'solo';
          const status = STATUS_MAP[trip.status || 'active'] || STATUS_MAP.active;
          const peopleCount = (trip.people || []).filter(p => p.st === 'ok').length;
          const spent = Math.abs((trip.ledger || []).filter(l => l.s < 0).reduce((acc, l) => acc + l.s, 0));
          const totalBudget = (trip.pp || 0) * (isSolo ? 1 : Math.max(1, peopleCount));

          return (
            <div
              key={trip.id || trip.originalIdx}
              className="card"
              style={{
                border: isCurrent ? '2px solid var(--gold)' : '1px solid var(--border)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                boxShadow: isCurrent ? '0 4px 20px rgba(187, 129, 48, 0.22)' : 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`mode-badge ${isSolo ? 'solo' : 'group'}`}>
                      {isSolo ? <User size={12} /> : <Users size={12} />}
                      {isSolo ? 'Solo' : 'Groupe'}
                    </span>
                    <span className="pill" style={{ fontSize: '11px' }}>
                      {status.label}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="pill primary" style={{ fontSize: '11px' }}>
                      ★ Voyage Actuel
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '18px', margin: '0 0 6px', color: '#FFF6EE' }}>
                  {trip.name}
                </h3>

                <div className="mut" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '13px', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="var(--gold)" />
                    <b>{trip.dest}</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="var(--accent-beaver)" />
                    {trip.dates}
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: '1.5' }}>
                  {trip.description || (isSolo ? 'Voyage d’exploration en autonomie.' : 'Voyage collaboratif avec quêtes et découvertes.')}
                </p>

                <div style={{ background: 'var(--card-alt)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span className="mut">Budget {isSolo ? 'personnel' : 'du groupe'} :</span>
                    <b style={{ color: '#FFF6EE' }}>{F(totalBudget)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span className="mut">Dépenses engagées :</span>
                    <b style={{ color: spent > 0 ? 'var(--gold)' : '#FFF6EE' }}>{F(spent)}</b>
                  </div>
                  {!isSolo && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginTop: '4px' }}>
                      <span className="mut">Participants validés :</span>
                      <b style={{ color: '#FFF6EE' }}>{peopleCount} / {trip.cap} pers.</b>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  className="subtle sm"
                  onClick={() => markCompleted(trip.originalIdx)}
                  title="Basculer le statut terminé / en cours"
                >
                  <CheckCircle2 size={13} color={trip.status === 'completed' ? 'var(--olive)' : 'var(--text-muted)'} />
                  {trip.status === 'completed' ? 'Marqué terminé' : 'Terminer'}
                </button>

                {isCurrent ? (
                  <button className="accent sm" onClick={() => go('home')}>
                    Ouvrir le carnet <ArrowRight size={13} />
                  </button>
                ) : (
                  <button className="alt sm" onClick={() => selectTrip(trip.originalIdx)}>
                    Basculer sur ce voyage
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Créer un nouveau voyage</h2>
              <button className="subtle sm" onClick={() => setShowCreateModal(false)} style={{ border: 'none' }}>✕</button>
            </div>

            <p className="mut" style={{ marginTop: 0 }}>
              Préparez une nouvelle aventure avec Wuendjo : en toute autonomie ou avec votre groupe d’amis.
            </p>

            <label>Type d’organisation *</label>
            <div className="grid-2" style={{ marginBottom: '14px' }}>
              <div
                onClick={() => setNewTrip(t => ({ ...t, mode: 'group' }))}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: newTrip.mode === 'group' ? '2px solid var(--gold)' : '1px solid var(--border)',
                  background: newTrip.mode === 'group' ? 'var(--card-alt)' : 'var(--card-subtle)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#FFF6EE' }}>
                  <Users size={16} color="var(--gold)" /> Voyage en Groupe
                </div>
                <div className="mut" style={{ fontSize: '12px', marginTop: '4px' }}>
                  Jeux d'équipes, validation des participants, budget collectif et trésorerie partagée.
                </div>
              </div>

              <div
                onClick={() => setNewTrip(t => ({ ...t, mode: 'solo' }))}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: newTrip.mode === 'solo' ? '2px solid var(--gold)' : '1px solid var(--border)',
                  background: newTrip.mode === 'solo' ? 'var(--card-alt)' : 'var(--card-subtle)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#FFF6EE' }}>
                  <User size={16} color="var(--gold)" /> Voyage en Solo
                </div>
                <div className="mut" style={{ fontSize: '12px', marginTop: '4px' }}>
                  Itinéraire individuel, checklist de route, budget personnel et journal de bord.
                </div>
              </div>
            </div>

            <label>Nom du voyage *</label>
            <input
              value={newTrip.name}
              onChange={e => setNewTrip({ ...newTrip, name: e.target.value })}
              placeholder="Ex: Escapade Safari Maasai Mara ou Retraite Kribi"
            />

            <label>Destination & Région *</label>
            <input
              value={newTrip.dest}
              onChange={e => setNewTrip({ ...newTrip, dest: e.target.value })}
              placeholder="Ex: Kribi & Océan Atlantique, Cameroun"
            />

            <div className="grid-2">
              <div>
                <label>Dates prévues</label>
                <input
                  value={newTrip.dates}
                  onChange={e => setNewTrip({ ...newTrip, dates: e.target.value })}
                  placeholder="Ex: 15 au 20 Mars 2027"
                />
              </div>

              <div>
                <label>{newTrip.mode === 'solo' ? 'Budget personnel estimé (FCFA)' : 'Budget / participant (FCFA)'}</label>
                <input
                  type="number"
                  value={newTrip.budget}
                  onChange={e => setNewTrip({ ...newTrip, budget: e.target.value })}
                  placeholder="180000"
                />
              </div>
            </div>

            {newTrip.mode === 'group' && (
              <div>
                <label>Capacité maximale de participants</label>
                <input
                  type="number"
                  value={newTrip.cap}
                  onChange={e => setNewTrip({ ...newTrip, cap: e.target.value })}
                  placeholder="8"
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="subtle" onClick={() => setShowCreateModal(false)}>Annuler</button>
              <button className="accent" onClick={handleCreate}>Créer et ouvrir ce voyage</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
