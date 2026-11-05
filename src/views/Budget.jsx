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
  ArrowRightLeft,
  Coins,
  Globe,
  Calculator,
  Check,
  CheckCircle2,
  Lock,
  ClipboardList
} from 'lucide-react';
import { DeleteBtn } from '../ui.jsx';

const CATEGORY_META = {
  'Transport': { label: 'Transport', color: '#4F6F7E', icon: Plane, bg: '#E4ECEF' },
  'Hébergement': { label: 'Hébergement', color: '#B04F26', icon: Home, bg: '#F5E3D6' },
  'Nourriture': { label: 'Nourriture', color: '#C9983E', icon: Utensils, bg: '#F4EAD0' },
  'Activités': { label: 'Activités', color: '#5B7A4E', icon: Sparkles, bg: '#E2EADB' },
  'Autre': { label: 'Autres', color: '#8A7F6E', icon: MoreHorizontal, bg: '#EEE9E0' }
};

// Grille de devises internationales courantes pour les voyages en Afrique et dans le monde
// Taux de référence exprimés en FCFA (XAF / XOF)
const INITIAL_RATES = {
  XAF: { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (CEMAC/UEMOA)', rateToFcfa: 1 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (Zone Euro)', rateToFcfa: 655.957 },
  USD: { code: 'USD', symbol: '$', name: 'Dollar américain (USA)', rateToFcfa: 605.5 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Shilling kényan (Kenya)', rateToFcfa: 4.70 },
  MAD: { code: 'MAD', symbol: 'DH', name: 'Dirham marocain (Maroc)', rateToFcfa: 60.5 },
  GBP: { code: 'GBP', symbol: '£', name: 'Livre sterling (UK)', rateToFcfa: 780.0 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Dollar canadien (Canada)', rateToFcfa: 442.0 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Naira (Nigéria)', rateToFcfa: 0.42 },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Cedi (Ghana)', rateToFcfa: 39.5 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'Rand (Afrique du Sud)', rateToFcfa: 34.2 }
};

export default function Budget() {
  const { t, me, org, upd } = useApp();

  // États pour les dépenses
  const [expenseLabel, setExpenseLabel] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCat, setExpenseCat] = useState('Transport');
  const [chartType, setChartType] = useState('pie'); // 'pie' ou 'bar'

  // États pour le convertisseur de devises intégré
  const [convAmount, setConvAmount] = useState('100');
  const [fromCurr, setFromCurr] = useState('EUR');
  const [toCurr, setToCurr] = useState('XAF');
  const [customRates, setCustomRates] = useState(INITIAL_RATES);
  const [showRateEditor, setShowRateEditor] = useState(false);
  const [lastConvertedExpense, setLastConvertedExpense] = useState(null);

  // Budget prévisionnel : édité par l'organisateur, visible des seuls participants validés
  const [fcLabel, setFcLabel] = useState('');
  const [fcAmount, setFcAmount] = useState('');
  const [fcCat, setFcCat] = useState('Transport');
  const forecast = t.forecast || [];
  const forecastTotal = forecast.reduce((a, x) => a + (Number(x.a) || 0), 0);
  const canSeeForecast = org || me?.st === 'ok';
  const nbValidated = Math.max(1, (t.people || []).filter(p => p.st === 'ok').length);
  const editForecast = (id, patch) => upd(s => {
    const x = (cur(s).forecast || []).find(r => r.id === id);
    if (x) Object.assign(x, patch);
  });
  const addForecast = () => {
    const a = Number(fcAmount);
    if (!fcLabel.trim() || !(a >= 0) || fcAmount === '') return;
    upd(s => {
      const trip = cur(s);
      if (!trip.forecast) trip.forecast = [];
      trip.forecast.push({ id: 'f' + Date.now(), cat: fcCat, l: fcLabel.trim(), a });
    });
    setFcLabel(''); setFcAmount('');
  };
  const removeForecast = id => upd(s => {
    const trip = cur(s);
    trip.forecast = (trip.forecast || []).filter(r => r.id !== id);
  });

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

  // Ventilation des dépenses pour les 4 catégories demandées
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

  // Données pour le graphique Recharts
  const pieData = [
    { name: 'Transport', value: catTotals['Transport'], color: CATEGORY_META['Transport'].color },
    { name: 'Hébergement', value: catTotals['Hébergement'], color: CATEGORY_META['Hébergement'].color },
    { name: 'Nourriture', value: catTotals['Nourriture'], color: CATEGORY_META['Nourriture'].color },
    { name: 'Activités', value: catTotals['Activités'], color: CATEGORY_META['Activités'].color },
    ...(catTotals['Autre'] > 0 ? [{ name: 'Autres', value: catTotals['Autre'], color: CATEGORY_META['Autre'].color }] : [])
  ].filter(d => d.value > 0);

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

  // Gestion de l'ajout d'une nouvelle dépense manuelle
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

  // LOGIQUE DU CONVERTISSEUR DE DEVISES
  const numAmount = parseFloat(convAmount) || 0;
  const rateFrom = customRates[fromCurr]?.rateToFcfa || 1;
  const rateTo = customRates[toCurr]?.rateToFcfa || 1;

  // Montant converti : d'abord vers le pivot FCFA, puis vers la devise cible
  const amountInFcfa = numAmount * rateFrom;
  const convertedResult = rateTo > 0 ? amountInFcfa / rateTo : 0;
  const directExchangeRate = rateTo > 0 ? rateFrom / rateTo : 1;

  // Inverser les deux devises
  const handleSwapCurrencies = () => {
    const prevFrom = fromCurr;
    const prevTo = toCurr;
    setFromCurr(prevTo);
    setToCurr(prevFrom);
    if (convertedResult > 0) {
      setConvAmount(Math.round(convertedResult * 100) / 100);
    }
  };

  // Transférer la conversion vers le formulaire de dépense ou l'enregistrer directement
  const transferToExpenseForm = (directSave = false) => {
    const fcfaValue = Math.round(amountInFcfa);
    const currSymbol = customRates[fromCurr]?.symbol || fromCurr;
    const desc = `[${numAmount.toLocaleString('fr-FR')} ${currSymbol}] Dépense internationale (${fromCurr})`;

    if (directSave) {
      upd(s => {
        const trip = cur(s);
        if (!trip.ledger) trip.ledger = [];
        trip.ledger.unshift({
          l: desc,
          s: -fcfaValue,
          cat: expenseCat,
          date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        });
      });
      setLastConvertedExpense(`Dépense de ${F(fcfaValue)} ajoutée au grand livre !`);
      setTimeout(() => setLastConvertedExpense(null), 4000);
    } else {
      setExpenseAmount(fcfaValue);
      setExpenseLabel(desc);
      setLastConvertedExpense(`Montant de ${F(fcfaValue)} copié dans le formulaire de dépense !`);
      setTimeout(() => setLastConvertedExpense(null), 4000);
      // Faire défiler doucement vers le formulaire
      document.getElementById('expense-form-card')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Paliers de conversion rapide (Cheat Sheet pour voyageurs)
  const getCheatSheetSteps = () => {
    if (fromCurr === 'KES') return [500, 1000, 2000, 5000, 10000];
    if (fromCurr === 'MAD') return [50, 100, 200, 500, 1000];
    if (fromCurr === 'EUR' || fromCurr === 'USD' || fromCurr === 'GBP' || fromCurr === 'CAD') return [10, 25, 50, 100, 200];
    if (fromCurr === 'NGN') return [1000, 5000, 10000, 25000, 50000];
    return [1000, 5000, 10000, 25000, 50000];
  };

  // Custom tooltip épuré pour Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = data.value;
      const pct = totalOut > 0 ? Math.round((val / totalOut) * 100) : 0;
      return (
        <div style={{
          background: '#fff',
          border: '1px solid var(--border-strong)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: data.payload.color || data.color || 'var(--gold)', marginBottom: '4px' }}>
            {data.name || data.dataKey}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
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
            <PiggyBank size={16} color="var(--olive-text)" />
            <span className="mut" style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
              Solde Disponible
            </span>
          </div>
          <div className="big" style={{ fontSize: '23px', marginTop: '2px', color: balance >= 0 ? 'var(--olive-text)' : 'var(--bad)' }}>
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

      {/* BUDGET PRÉVISIONNEL : réservé à l'organisateur et aux participants validés */}
      {!isSolo && !canSeeForecast && (
        <div className="card" style={{ padding: '22px', marginBottom: '22px', textAlign: 'center' }}>
          <h2 style={{ justifyContent: 'center', margin: '0 0 6px', fontSize: '18px' }}>
            <Lock size={16} /> Budget prévisionnel
          </h2>
          <p className="mut" style={{ margin: 0, fontSize: '13.5px' }}>
            Il sera visible dès que l’organisateur aura validé votre inscription.
          </p>
        </div>
      )}

      {canSeeForecast && (org || forecast.length > 0) && (
        <div className="card" style={{ padding: '24px', marginBottom: '22px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px' }}>
            <ClipboardList size={18} color="var(--gold)" /> Budget prévisionnel
          </h2>
          <p className="mut" style={{ margin: '0 0 14px', fontSize: '13px' }}>
            {org
              ? 'Planifiez les dépenses à venir. Seuls vous et les participants validés le voient.'
              : 'Estimation des dépenses prévues pour le séjour.'}
          </p>

          {forecast.length === 0 && <p className="mut">Aucune ligne prévisionnelle pour l’instant.</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {forecast.map(r => (
              org ? (
                <div key={r.id} className="fc-row" style={{ display: 'grid', gridTemplateColumns: '130px 1fr 130px auto', gap: '8px', alignItems: 'center' }}>
                  <select value={r.cat} onChange={e => editForecast(r.id, { cat: e.target.value })} style={{ margin: 0 }}>
                    {Object.keys(CATEGORY_META).map(c => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
                  </select>
                  <input value={r.l} onChange={e => editForecast(r.id, { l: e.target.value })} style={{ margin: 0 }} />
                  <input type="number" min="0" value={r.a} onChange={e => editForecast(r.id, { a: Math.max(0, +e.target.value || 0) })} style={{ margin: 0 }} />
                  <DeleteBtn onConfirm={() => removeForecast(r.id)} label="Supprimer la ligne" />
                </div>
              ) : (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', background: 'var(--card-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span><span className="pill outline" style={{ fontSize: '11px', marginRight: '8px' }}>{CATEGORY_META[r.cat]?.label || r.cat}</span>{r.l}</span>
                  <strong style={{ whiteSpace: 'nowrap' }}>{F(r.a)}</strong>
                </div>
              )
            ))}
          </div>

          {org && (
            <div className="fc-row" style={{ display: 'grid', gridTemplateColumns: '130px 1fr 130px auto', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
              <select value={fcCat} onChange={e => setFcCat(e.target.value)} style={{ margin: 0 }}>
                {Object.keys(CATEGORY_META).map(c => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
              </select>
              <input value={fcLabel} onChange={e => setFcLabel(e.target.value)} placeholder="Ligne prévue (ex : Sono pour la veillée)" style={{ margin: 0 }} />
              <input type="number" min="0" value={fcAmount} onChange={e => setFcAmount(e.target.value)} placeholder="Montant" style={{ margin: 0 }} />
              <button className="accent sm" onClick={addForecast}><Plus size={14} /> Ajouter</button>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', justifyContent: 'space-between', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
            <div><div className="mut" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Total prévu</div><div className="big" style={{ fontSize: '20px' }}>{F(forecastTotal)}</div></div>
            {!isSolo && <div><div className="mut" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Par participant validé ({nbValidated})</div><div className="big" style={{ fontSize: '20px' }}>{F(forecastTotal / nbValidated)}</div></div>}
            <div><div className="mut" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Déjà dépensé</div><div className="big" style={{ fontSize: '20px' }}>{F(totalOut)}</div></div>
            <div><div className="mut" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Reste à prévoir</div><div className="big" style={{ fontSize: '20px', color: forecastTotal - totalOut >= 0 ? 'var(--olive-text)' : 'var(--bad)' }}>{F(forecastTotal - totalOut)}</div></div>
          </div>
        </div>
      )}

      {/* SECTION GRAPHIQUE RECHARTS : RÉPARTITION PAR CATÉGORIES */}
      <div className="card" style={{ padding: '26px', marginBottom: '22px' }}>
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
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                ) : (
                  <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${v / 1000}k`} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Réel" fill="#B04F26" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Prévu" fill="#DDBFA5" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: 'var(--text-secondary)' }} />
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

      {/* ========================================================
          OUTIL DE CONVERSION DE DEVISES INTÉGRÉ
          ======================================================== */}
      <div className="card" style={{ padding: '24px', marginBottom: '22px', background: 'var(--card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Coins size={20} color="var(--gold)" />
              <span className="pill primary" style={{ fontSize: '11px' }}>Outil Voyage International</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Convertisseur de Devises Intégré</h2>
            <p className="mut" style={{ margin: '4px 0 0' }}>
              Convertissez instantanément vos dépenses locales (EUR, USD, KES, MAD, etc.) en Franc CFA pour les intégrer directement à votre budget.
            </p>
          </div>

          <button
            type="button"
            className="subtle sm"
            onClick={() => setShowRateEditor(!showRateEditor)}
            style={{ fontSize: '12.5px' }}
          >
            <Globe size={13} /> {showRateEditor ? 'Masquer les taux' : 'Consulter / Ajuster les taux'}
          </button>
        </div>

        {/* Panneau d'ajustement des taux si activé */}
        {showRateEditor && (
          <div style={{ background: 'var(--card-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', marginBottom: '10px' }}>
              Taux de change appliqués (1 unité = X Franc CFA)
            </div>
            <div className="grid-3" style={{ gap: '10px' }}>
              {Object.keys(customRates).filter(k => k !== 'XAF').map(code => (
                <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>1 {code} =</span>
                  <input
                    type="number"
                    step="0.01"
                    value={customRates[code].rateToFcfa}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setCustomRates(prev => ({
                        ...prev,
                        [code]: { ...prev[code], rateToFcfa: val }
                      }));
                    }}
                    style={{
                      width: '90px',
                      margin: 0,
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'right',
                      minHeight: 'auto'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>FCFA</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bloc interactif de conversion */}
        <div style={{
          background: 'var(--card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div className="grid-1-2" style={{ alignItems: 'center', gap: '20px' }}>
            {/* Colonne gauche : Saisie et Devises */}
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)' }}>
                  Montant à convertir
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={convAmount}
                    onChange={e => setConvAmount(e.target.value)}
                    placeholder="100"
                    style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}
                  />
                  <select
                    value={fromCurr}
                    onChange={e => setFromCurr(e.target.value)}
                    style={{ margin: 0, width: '130px', fontWeight: 700 }}
                  >
                    {Object.keys(customRates).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                <button
                  type="button"
                  className="subtle sm"
                  onClick={handleSwapCurrencies}
                  title="Inverser les devises"
                  style={{ borderRadius: '99px', padding: '6px 14px', fontSize: '12px' }}
                >
                  <ArrowRightLeft size={13} /> Inverser les devises
                </button>
              </div>

              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)' }}>
                  Devise de destination
                </label>
                <select
                  value={toCurr}
                  onChange={e => setToCurr(e.target.value)}
                  style={{ margin: 0, fontWeight: 700 }}
                >
                  {Object.keys(customRates).map(c => (
                    <option key={c} value={c}>{customRates[c].name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Colonne droite : Résultat direct & Actions d'insertion au budget */}
            <div style={{
              background: 'var(--card-alt)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Valeur équivalente convertie :
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  margin: '4px 0'
                }}>
                  {convertedResult.toLocaleString('fr-FR', { maximumFractionDigits: toCurr === 'XAF' ? 0 : 2 })} {customRates[toCurr]?.symbol}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Taux direct : <b>1 {fromCurr} = {directExchangeRate.toLocaleString('fr-FR', { maximumFractionDigits: 4 })} {toCurr}</b>
                </div>
              </div>

              {/* Actions d'intégration directe au budget */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="accent sm"
                  onClick={() => transferToExpenseForm(true)}
                  title="Ajouter directement comme dépense dans le grand livre"
                  style={{ flex: 1, minHeight: '36px' }}
                >
                  <Plus size={14} /> Enregistrer comme dépense ({F(Math.round(amountInFcfa))})
                </button>
                <button
                  type="button"
                  className="subtle sm"
                  onClick={() => transferToExpenseForm(false)}
                  title="Pré-remplir le formulaire de saisie manuelle ci-dessous"
                  style={{ minHeight: '36px' }}
                >
                  Pré-remplir le formulaire
                </button>
              </div>

              {lastConvertedExpense && (
                <div style={{
                  marginTop: '10px',
                  padding: '6px 10px',
                  background: 'var(--olive-light)',
                  color: 'var(--olive-text)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={14} /> {lastConvertedExpense}
                </div>
              )}
            </div>
          </div>

          {/* Répères rapides (Cheat Sheet voyageur pour la devise active) */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
              Repères rapides pour {customRates[fromCurr]?.name} vers le Franc CFA :
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {getCheatSheetSteps().map(val => {
                const converted = Math.round(val * rateFrom);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setConvAmount(String(val))}
                    className="subtle sm"
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      minHeight: 'auto',
                      background: convAmount === String(val) ? 'var(--accent-light)' : 'var(--card)',
                      color: convAmount === String(val) ? 'var(--accent)' : 'var(--text)',
                      borderColor: convAmount === String(val) ? 'var(--accent)' : 'var(--border-strong)'
                    }}
                  >
                    <b>{val.toLocaleString('fr-FR')} {customRates[fromCurr]?.symbol}</b> = {converted.toLocaleString('fr-FR')} F
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FORMULAIRE D'AJOUT RAPIDE & GRAND LIVRE */}
      <div className="grid-2">
        {/* COLONNE GAUCHE : SAISIE D'UNE DÉPENSE */}
        <div id="expense-form-card" className="card">
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
                        color: isExpense ? meta.color : 'var(--olive-text)',
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
                        color: isExpense ? 'var(--accent)' : 'var(--olive-text)',
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
