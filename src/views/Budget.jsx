import React, { useState } from 'react';
import { useApp, cur, F } from '../ctx.js';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Plus,
  Plane,
  Home,
  Utensils,
  Sparkles,
  MoreHorizontal,
  Trash2,
  PieChart as PieIcon,
  BarChart2,
  CheckCircle,
  Clock
} from 'lucide-react';

const CATEGORY_META = {
  'Transport': { label: 'Transport', color: '#0D3B4E', icon: Plane, bg: 'rgba(13, 59, 78, 0.08)' },
  'Hébergement': { label: 'Hébergement', color: '#C85A3E', icon: Home, bg: 'rgba(200, 90, 62, 0.1)' },
  'Nourriture': { label: 'Nourriture', color: '#D49439', icon: Utensils, bg: 'rgba(212, 148, 57, 0.12)' },
  'Activités': { label: 'Activités', color: '#5A6B44', icon: Sparkles, bg: 'rgba(90, 107, 68, 0.12)' },
  'Autre': { label: 'Autres', color: '#7E8B92', icon: MoreHorizontal, bg: 'rgba(126, 139, 146, 0.1)' }
};

export default function Budget() {
  const { t, me, org, upd } = useApp();
  const [expenseLabel, setExpenseLabel] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCat, setExpenseCat] = useState('Transport');
  const [chartType, setChartType] = useState('pie'); // 'pie' ou 'bar'

  const isSolo = t.mode === 'solo';
  const ledger = t.ledger || [];

  // Totaux financiers
  const totalIn = ledger.filter(l => l.s > 0).reduce((a, l) => a + l.s, 0);
  const totalOut = -ledger.filter(l => l.s < 0).reduce((a, l) => a + l.s, 0);
  const balance = totalIn - totalOut;

  // Calcul du budget de référence
  const baseBudget = t.pp * (isSolo ? 1 : Math.max(1, (t.people || []).filter(p => p.st === 'ok').length));
  const effectiveBudget = totalIn > 0 ? totalIn : baseBudget;
  const pctConsumed = effectiveBudget > 0 ? Math.min(100, Math.round((totalOut / effectiveBudget) * 100)) : 0;

  // Ventilation des dépenses pour les 4 catégories demandées : Transport, Hébergement, Nourriture, Activités
  const expensesOnly = ledger.filter(l => l.s < 0);
  const catTotals = {
    'Transport': 0,
    'Hébergement': 0,
    'Nourriture': 0,
    'Activités': 0,
    'Autre': 0
  };

  expensesOnly.forEach(item => {
    const rawCat = (item.cat || '').toLowerCase().trim();
    if (rawCat.includes('transp') || rawCat.includes('vol') || rawCat.includes('billet') || rawCat.includes('train')) {
      catTotals['Transport'] += Math.abs(item.s);
    } else if (rawCat.includes('heberg') || rawCat.includes('hôtel') || rawCat.includes('lodge') || rawCat.includes('chalet') || rawCat.includes('logement')) {
      catTotals['Hébergement'] += Math.abs(item.s);
    } else if (rawCat.includes('nourrit') || rawCat.includes('resto') || rawCat.includes('repas') || rawCat.includes('manger') || rawCat.includes('dîner') || rawCat.includes('boisson')) {
      catTotals['Nourriture'] += Math.abs(item.s);
    } else if (rawCat.includes('activ') || rawCat.includes('visite') || rawCat.includes('parc') || rawCat.includes('rando') || rawCat.includes('guide') || rawCat.includes('jeu')) {
      catTotals['Activités'] += Math.abs(item.s);
    } else {
      catTotals['Autre'] += Math.abs(item.s);
    }
  });

  // Données prêtes pour le graphique Recharts
  const pieData = [
    { name: 'Transport', value: catTotals['Transport'], color: CATEGORY_META['Transport'].color },
    { name: 'Hébergement', value: catTotals['Hébergement'], color: CATEGORY_META['Hébergement'].color },
    { name: 'Nourriture', value: catTotals['Nourriture'], color: CATEGORY_META['Nourriture'].color },
    { name: 'Activités', value: catTotals['Activités'], color: CATEGORY_META['Activités'].color },
    ...(catTotals['Autre'] > 0 ? [{ name: 'Autres', value: catTotals['Autre'], color: CATEGORY_META['Autre'].color }] : [])
  ].filter(d => d.value > 0);

  // Données comparatives prévisionnel vs réel
  const plan = t.budgetPlan || {
    transport: Math.round(effectiveBudget * 0.30),
    hebergement: Math.round(effectiveBudget * 0.35),
    nourriture: Math.round(effectiveBudget * 0.20),
    activites: Math.round(effectiveBudget * 0.15)
  };

  const barData = [
    { name: 'Transport', Réel: catTotals['Transport'], Prévu: plan.transport || 0 },
    { name: 'Hébergement', Réel: catTotals['Hébergement'], Prévu: plan.hebergement || 0 },
    { name: 'Nourriture', Réel: catTotals['Nourriture'], Prévu: plan.nourriture || 0 },
    { name: 'Activités', Réel: catTotals['Activités'], Prévu: plan.activites || 0 }
  ];

  // Gestion de l'ajout d'une nouvelle dépense
  const handleAddExpense = (e) => {
    e?.preventDefault();
    if (!expenseAmount || isNaN(expenseAmount)) return;
    const amount = Math.abs(Number(expenseAmount));
    const label = expenseLabel.trim() || `${expenseCat} - Frais de séjour`;

    upd(s => {
      const trip = cur(s);
      if (!trip.ledger) trip.ledger = [];
      trip.ledger.unshift({
        l: label,
        s: -amount,
        cat: expenseCat,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      });
    });

    setExpenseLabel('');
    setExpenseAmount('');
  };

  // Suppression d'une dépense
  const handleDeleteExpense = (idx) => {
    upd(s => {
      const trip = cur(s);
      if (trip.ledger) {
        trip.ledger.splice(idx, 1);
      }
    });
  };

  // Custom tooltip épuré pour Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = data.value;
      const pct = totalOut > 0 ? Math.round((val / totalOut) * 100) : 0;
      return (
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid var(--border)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 4px 14px rgba(13, 59, 78, 0.1)'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: data.payload.color || data.color || 'var(--primary)', marginBottom: '4px' }}>
            {data.name || data.dataKey}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
            {F(val)}
          </div>
          {totalOut > 0 && (
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {pct}% du total dépensé
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* 4 KPI STRIP ÉPURÉ */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px 20px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Wallet size={16} color="var(--primary)" />
            <span className="mut" style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
              {isSolo ? 'Budget Alloué' : 'Budget Total'}
            </span>
          </div>
          <div className="big" style={{ fontSize: '23px', marginTop: '2px' }}>
            {F(effectiveBudget)}
          </div>
          <div className="mut" style={{ fontSize: '12px' }}>
            {isSolo ? 'Enveloppe globale estimée' : `Base de ${F(t.pp)} / personne`}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <TrendingDown size={16} color="var(--accent)" />
            <span className="mut" style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
              Dépenses Réalisées
            </span>
          </div>
          <div className="big accent" style={{ fontSize: '23px', marginTop: '2px' }}>
            {F(totalOut)}
          </div>
          <div className="mut" style={{ fontSize: '12px' }}>
            {expensesOnly.length} opération(s) enregistrée(s)
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <PiggyBank size={16} color="var(--olive)" />
            <span className="mut" style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
              Solde Disponible
            </span>
          </div>
          <div className="big" style={{ fontSize: '23px', marginTop: '2px', color: balance >= 0 ? 'var(--olive)' : 'var(--bad)' }}>
            {F(balance)}
          </div>
          <div className="mut" style={{ fontSize: '12px' }}>
            {balance >= 0 ? 'Trésorerie restante positive' : 'Dépassement de budget'}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="mut" style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
              Consommation
            </span>
            <span className="pill ok" style={{ fontSize: '11px', padding: '2px 8px' }}>
              {pctConsumed}%
            </span>
          </div>
          <div className="bar" style={{ margin: '8px 0 6px' }}>
            <i style={{ width: `${pctConsumed}%` }} />
          </div>
          <div className="mut" style={{ fontSize: '12px' }}>
            {effectiveBudget - totalOut >= 0 ? `${F(effectiveBudget - totalOut)} de marge` : 'Budget dépassé'}
          </div>
        </div>
      </div>

      {/* SECTION GRAPHIQUE RECHARTS : RÉPARTITION PAR CATÉGORIES */}
      <div className="card" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px' }}>
              Répartition des Dépenses par Poste
            </h2>
            <p className="mut" style={{ margin: 0 }}>
              Visualisation analytique entre le <b>Transport</b>, l’<b>Hébergement</b>, la <b>Nourriture</b> et les <b>Activités</b>.
            </p>
          </div>

          {/* Toggle Type de Graphique */}
          <div style={{ display: 'flex', background: 'var(--sand-light)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <button
              className="sm"
              style={{
                background: chartType === 'pie' ? 'var(--card)' : 'transparent',
                color: chartType === 'pie' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: chartType === 'pie' ? 'var(--shadow-sm)' : 'none',
                minHeight: '32px'
              }}
              onClick={() => setChartType('pie')}
            >
              <PieIcon size={14} /> Vue Circulaire
            </button>
            <button
              className="sm"
              style={{
                background: chartType === 'bar' ? 'var(--card)' : 'transparent',
                color: chartType === 'bar' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: chartType === 'bar' ? 'var(--shadow-sm)' : 'none',
                minHeight: '32px'
              }}
              onClick={() => setChartType('bar')}
            >
              <BarChart2 size={14} /> Réel vs Prévu
            </button>
          </div>
        </div>

        {totalOut > 0 ? (
          <div className="grid-2-1" style={{ alignItems: 'center', gap: '30px' }}>
            {/* Zone du graphique Recharts */}
            <div style={{ height: '280px', width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                ) : (
                  <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${v / 1000}k`} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Réel" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Prévu" fill="var(--sand-dark)" radius={[6, 6, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  </BarChart>
                )}
              </ResponsiveContainer>

              {/* Étiquette centrale élégante pour le Donut */}
              {chartType === 'pie' && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Total Réel
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', fontFamily: '"Bricolage Grotesque", sans-serif' }}>
                    {F(totalOut)}
                  </div>
                </div>
              )}
            </div>

            {/* Légende détaillée et statistiques par poste */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Transport', 'Hébergement', 'Nourriture', 'Activités'].map(cat => {
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                const amount = catTotals[cat] || 0;
                const pct = totalOut > 0 ? Math.round((amount / totalOut) * 100) : 0;

                return (
                  <div
                    key={cat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      background: 'var(--card-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: meta.bg,
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>
                          {cat}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {pct}% du budget engagé
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '14.5px', color: meta.color }}>
                        {F(amount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-box" style={{ padding: '36px 16px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '15px' }}>Aucune dépense enregistrée pour le moment.</p>
            <span className="mut">Ajoutez votre première dépense ci-dessous pour voir le graphique s'animer.</span>
          </div>
        )}
      </div>

      {/* FORMULAIRE D'AJOUT RAPIDE & GRAND LIVRE */}
      <div className="grid-2">
        {/* COLONNE GAUCHE : SAISIE D'UNE DÉPENSE */}
        <div className="card">
          <h2>
            <Plus size={18} color="var(--accent)" />
            Ajouter une dépense au séjour
          </h2>
          <p className="mut" style={{ margin: '0 0 14px' }}>
            Sélectionnez le poste de dépense pour alimenter automatiquement le graphique Recharts.
          </p>

          <form onSubmit={handleAddExpense}>
            <label>Poste budgétaire</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {[
                { id: 'Transport', label: 'Transport', icon: Plane },
                { id: 'Hébergement', label: 'Hébergement', icon: Home },
                { id: 'Nourriture', label: 'Nourriture', icon: Utensils },
                { id: 'Activités', label: 'Activités', icon: Sparkles }
              ].map(item => {
                const isSelected = expenseCat === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExpenseCat(item.id)}
                    style={{
                      background: isSelected ? CATEGORY_META[item.id].color : 'var(--card-subtle)',
                      color: isSelected ? '#FFFFFF' : 'var(--text)',
                      border: isSelected ? `1.5px solid ${CATEGORY_META[item.id].color}` : '1px solid var(--border)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <label>Montant en FCFA *</label>
            <input
              type="number"
              value={expenseAmount}
              onChange={e => setExpenseAmount(e.target.value)}
              placeholder="Ex: 45000"
              required
            />

            <label>Description / Fournisseur</label>
            <input
              value={expenseLabel}
              onChange={e => setExpenseLabel(e.target.value)}
              placeholder="Ex: Billet de train Douala-Yaoundé ou Hôtel de la plage"
            />

            <button type="submit" className="accent" style={{ width: '100%', marginTop: '6px' }}>
              <Plus size={16} /> Enregistrer la dépense
            </button>
          </form>

          {/* Rentrée de trésorerie en solo */}
          {isSolo && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <span className="mut" style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                Ajuster ou ajouter des fonds personnels :
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="subtle sm"
                  onClick={() => {
                    upd(s => {
                      const trip = cur(s);
                      if (!trip.ledger) trip.ledger = [];
                      trip.ledger.unshift({
                        l: 'Apport de trésorerie personnel',
                        s: 50000,
                        cat: 'Entrées',
                        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                      });
                    });
                  }}
                >
                  +50 000 FCFA
                </button>
                <button
                  type="button"
                  className="subtle sm"
                  onClick={() => {
                    upd(s => {
                      const trip = cur(s);
                      if (!trip.ledger) trip.ledger = [];
                      trip.ledger.unshift({
                        l: 'Apport de trésorerie personnel',
                        s: 100000,
                        cat: 'Entrées',
                        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                      });
                    });
                  }}
                >
                  +100 000 FCFA
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : HISTORIQUE DÉTAILLÉ DU GRAND LIVRE */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2>Journal des Écritures ({ledger.length})</h2>
            <span className="mut" style={{ fontSize: '12px' }}>Dernières opérations</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
            {ledger.map((item, idx) => {
              const isExpense = item.s < 0;
              const meta = CATEGORY_META[item.cat] || CATEGORY_META['Autre'];

              return (
                <div
                  key={idx}
                  className="row"
                  style={{
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--card-subtle)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      className="pill"
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        background: isExpense ? meta.bg : 'var(--olive-light)',
                        color: isExpense ? meta.color : 'var(--olive)',
                        borderColor: 'transparent',
                        fontWeight: 700
                      }}
                    >
                      {item.cat || (isExpense ? 'Dépense' : 'Entrée')}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text)' }}>
                        {item.l}
                      </div>
                      <div className="mut" style={{ fontSize: '11.5px' }}>
                        {item.date || 'Récemment'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '14px',
                        color: isExpense ? 'var(--accent)' : 'var(--olive)',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {isExpense ? `-${F(Math.abs(item.s))}` : `+${F(item.s)}`}
                    </span>
                    <button
                      className="subtle sm"
                      onClick={() => handleDeleteExpense(idx)}
                      title="Supprimer cette ligne"
                      style={{ padding: '4px 6px', minHeight: 'auto', border: 'none', background: 'transparent' }}
                    >
                      <Trash2 size={13} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>
              );
            })}

            {!ledger.length && (
              <div className="empty-box">
                <p>Aucune écriture comptable enregistrée.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
