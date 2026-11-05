import { createContext, useContext, useState } from 'react';

export const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const cur = S => (S.trips && S.trips[S.t]) || (S.trips && S.trips[0]) || {};

// Formatage monétaire en Franc CFA
export const F = n => {
  const num = Math.round(Number(n) || 0);
  return num.toLocaleString('fr-FR') + ' FCFA';
};

export const STATUS_MAP = {
  active: { label: 'En cours', color: 'accent' },
  upcoming: { label: 'À venir', color: 'primary' },
  completed: { label: 'Terminé', color: 'ok' },
  draft: { label: 'Brouillon', color: 'subtle' }
};

export const MODE_MAP = {
  solo: { label: 'Solo', desc: 'Voyage en autonomie' },
  group: { label: 'Groupe', desc: 'Voyage collaboratif avec quêtes' }
};

export const BUDGET_CATEGORIES = [
  { id: 'transport', label: 'Transport', color: '#0D3B4E', icon: 'Plane' },
  { id: 'hebergement', label: 'Hébergement', color: '#C85A3E', icon: 'Home' },
  { id: 'nourriture', label: 'Nourriture & Restaurants', color: '#D49439', icon: 'Utensils' },
  { id: 'activites', label: 'Activités & Visites', color: '#5A6B44', icon: 'Sparkles' },
  { id: 'autre', label: 'Autres / Imprévus', color: '#7E8B92', icon: 'MoreHorizontal' }
];

export const useForm = (init = {}) => {
  const [f, setF] = useState(init);
  const b = k => ({
    value: f[k] ?? '',
    onChange: e => setF(p => ({ ...p, [k]: e.target.value }))
  });
  const reset = () => setF(init);
  return [f, b, reset, setF];
};
