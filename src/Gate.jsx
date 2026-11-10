import React, { useState } from 'react';
import { ShieldCheck, Users, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { hasOrgCode, createOrgCode, verifyOrgCode, openSession, resetOrgCode, MIN_CODE } from './auth.js';

let fails = 0;
let lockedUntil = 0;

export default function Gate({ onOrganizer, onParticipant }) {
  const [exists, setExists] = useState(hasOrgCode());
  const [code, setCode] = useState('');
  const [code2, setCode2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr('');

    if (!exists) {
      if (code.length < MIN_CODE) return setErr(`Le code doit contenir au moins ${MIN_CODE} caractères.`);
      if (code !== code2) return setErr('Les deux codes ne sont pas identiques.');
      setBusy(true);
      await createOrgCode(code);
      openSession();
      setBusy(false);
      onOrganizer();
      return;
    }

    const wait = Math.ceil((lockedUntil - Date.now()) / 1000);
    if (wait > 0) return setErr(`Trop d’essais. Réessayez dans ${wait} s.`);

    setBusy(true);
    const ok = await verifyOrgCode(code);
    setBusy(false);
    if (ok) {
      fails = 0;
      openSession();
      onOrganizer();
    } else {
      fails += 1;
      if (fails >= 3) {
        lockedUntil = Date.now() + 15000;
        fails = 0;
        setErr('Code incorrect. Trop d’essais, patientez 15 secondes.');
      } else {
        setErr('Code incorrect.');
      }
      setCode('');
    }
  };

  const doReset = () => {
    resetOrgCode();
    setExists(false);
    setShowReset(false);
    setCode('');
    setCode2('');
    setErr('');
  };

  return (
    <div className="gate">
      <div className="gate-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', maxWidth: '880px', margin: '0 auto 28px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-logo-mark">W</div>
          <div>
            <h1 className="brand-text-title">Wuendjo</h1>
            <span className="brand-tagline">Organisation de voyages en groupe & solo</span>
          </div>
        </div>
        <button
          type="button"
          className="subtle"
          onClick={onParticipant}
          style={{ minHeight: '44px', padding: '8px 16px', borderColor: 'rgba(255,255,255,0.3)', color: '#FBF3E6' }}
        >
          <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} /> Revenir au voyage (Invité)
        </button>
      </div>

      <div className="gate-grid">
        <section className="gate-card gate-org">
          <div className="gate-icon"><ShieldCheck size={22} /></div>
          <h2>Espace Organisateur</h2>
          <p className="mut" style={{ fontSize: '13.5px', lineHeight: '1.5' }}>
            {exists
              ? 'Verrouillage local sur cet appareil : entrez votre code pour administrer le voyage, valider les inscriptions et gérer le budget.'
              : 'Première utilisation : définissez un code personnel pour cet appareil pour protéger les réglages d’administration.'}
          </p>
          <div style={{ background: 'var(--card-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '12.5px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
            💡 <b>Vous êtes invité(e) ?</b> Vous n'avez pas besoin de code. Cliquez sur « Accéder au voyage » à droite.
          </div>

          <form onSubmit={submit}>
            <label htmlFor="org-code">{exists ? 'Code organisateur' : 'Choisissez un code (au moins 4 caractères)'}</label>
            <input
              id="org-code"
              type="password"
              autoComplete={exists ? 'current-password' : 'new-password'}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={exists ? 'Votre code' : `Au moins ${MIN_CODE} caractères`}
            />
            {!exists && (
              <>
                <label htmlFor="org-code2">Confirmez le code</label>
                <input
                  id="org-code2"
                  type="password"
                  autoComplete="new-password"
                  value={code2}
                  onChange={e => setCode2(e.target.value)}
                  placeholder="Répétez le code"
                />
              </>
            )}
            {err && <div className="form-err" role="alert">{err}</div>}
            <button type="submit" className="accent" style={{ width: '100%', minHeight: '46px' }} disabled={busy || !code}>
              {exists ? <><Lock size={15} /> Entrer dans l’espace gestion</> : <><KeyRound size={15} /> Activer mon espace organisateur</>}
            </button>
          </form>

          {exists && (
            <div className="gate-foot">
              {!showReset ? (
                <button type="button" className="link-btn" onClick={() => setShowReset(true)} style={{ minHeight: '40px' }}>Code oublié ?</button>
              ) : (
                <div className="gate-reset">
                  <p className="mut">
                    Cela supprime le code de cet appareil pour en créer un nouveau. Vos voyages sont conservés.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="bad sm" onClick={doReset} style={{ minHeight: '44px' }}>Réinitialiser le code</button>
                    <button type="button" className="subtle sm" onClick={() => setShowReset(false)} style={{ minHeight: '44px' }}>Annuler</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="gate-card">
          <div className="gate-icon alt"><Users size={22} /></div>
          <h2>Je suis invité(e) / Convive</h2>
          <p className="mut" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>
            Consultez le descriptif du voyage, répondez à l’invitation en 1 clic, découvrez l’itinéraire jour par jour et votez pour les activités.
          </p>
          <div style={{ background: 'var(--card-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px', margin: '14px 0 20px', color: 'var(--text-secondary)' }}>
            ✨ <b>Zéro friction :</b> Aucun compte obligatoire, aucun mot de passe requis.
          </div>
          <button type="button" className="accent" style={{ width: '100%', minHeight: '48px', fontSize: '15px' }} onClick={onParticipant}>
            Accéder directement au voyage <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </div>
  );
}
