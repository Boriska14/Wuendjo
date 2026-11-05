import React, { useState } from 'react';
import { useApp, cur, F } from '../ctx.js';
import Workflow from '../Workflow.jsx';
import { Users, Clock, Wallet, CalendarDays, Copy, Check, Eye } from 'lucide-react';

export default function OrgDashboard() {
  const { S, t, upd, go, previewAsParticipant } = useApp();
  const [copied, setCopied] = useState(false);
  const isSolo = t.mode === 'solo';

  const people = t.people || [];
  const confirmed = people.filter(p => p.st === 'ok').length;
  const pending = people.filter(p => p.st === 'wait').length;
  const itin = (t.itinerary || []).length;
  const ideas = (t.ideas || []).length;
  const spent = (t.ledger || []).filter(x => x.s < 0).reduce((a, x) => a - x.s, 0);

  const link = `${window.location.origin}${window.location.pathname}?t=${S.t}&invite=1`;
  const copyLink = () => {
    const done = () => {
      upd(s => { cur(s).invited = true; });
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(link).then(done).catch(done);
    else done();
  };

  const configured = Boolean(t.name && t.dest && t.dates && Number(t.pp) > 0);

  const steps = [
    {
      key: 'config',
      title: 'Configurer le voyage',
      desc: 'Nom, destination, dates et budget par personne.',
      done: configured,
      cta: 'Paramètres',
      onClick: () => go('settings')
    },
    !isSolo && {
      key: 'invite',
      title: 'Inviter les participants',
      desc: 'Copiez le lien et envoyez-le par WhatsApp ou message.',
      done: Boolean(t.invited) || people.length > 1,
      cta: copied ? 'Lien copié' : 'Copier le lien',
      onClick: copyLink
    },
    !isSolo && {
      key: 'validate',
      title: 'Valider les inscriptions',
      desc: pending > 0 ? `${pending} inscription${pending > 1 ? 's' : ''} en attente de votre réponse.` : 'Acceptez ou refusez chaque demande reçue.',
      done: people.length > 0 && pending === 0,
      cta: 'Participants',
      onClick: () => go('people')
    },
    {
      key: 'plan',
      title: 'Construire le programme',
      desc: 'Ajoutez les étapes jour par jour et retenez des activités.',
      done: itin > 0 && ideas > 0,
      cta: 'Programme',
      onClick: () => go('program')
    },
    {
      key: 'budget',
      title: 'Suivre le budget',
      desc: 'Enregistrez chaque dépense et gardez un œil sur le solde.',
      done: spent > 0,
      cta: 'Budget',
      onClick: () => go('budget')
    }
  ].filter(Boolean);

  return (
    <div>
      <div className="card card-hero dark-scope">
        <span className="pill primary" style={{ marginBottom: '10px' }}>Tableau de bord</span>
        <h1 className="big" style={{ margin: '0 0 6px', fontSize: '28px' }}>{t.name}</h1>
        <p className="mut" style={{ margin: 0, fontSize: '14px' }}>
          {t.dest} · {t.dates}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {!isSolo && (
            <button className="subtle sm" onClick={copyLink}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Lien copié' : 'Copier le lien d’invitation'}
            </button>
          )}
          {!isSolo && (
            <button className="subtle sm" onClick={previewAsParticipant}>
              <Eye size={14} /> Voir comme un participant
            </button>
          )}
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '20px' }}>
        {!isSolo && (
          <div className="card stat">
            <div className="meta-label"><Users size={14} /> Participants validés</div>
            <div className="big">{confirmed} / {t.cap}</div>
          </div>
        )}
        {!isSolo && (
          <div className="card stat">
            <div className="meta-label"><Clock size={14} /> En attente</div>
            <div className={`big ${pending ? 'accent' : ''}`}>{pending}</div>
          </div>
        )}
        <div className="card stat">
          <div className="meta-label"><CalendarDays size={14} /> Étapes au programme</div>
          <div className="big">{itin}</div>
        </div>
        <div className="card stat">
          <div className="meta-label"><Wallet size={14} /> Dépensé</div>
          <div className="big" style={{ fontSize: '20px' }}>{F(spent)}</div>
        </div>
      </div>

      <Workflow
        title="Prise en main en 5 étapes"
        subtitle="Suivez ces étapes dans l’ordre : la prochaine à faire est mise en avant."
        steps={steps}
      />
    </div>
  );
}
