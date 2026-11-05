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
      <div className="gate-brand">
        <div className="brand-logo-mark">W</div>
        <div>
          <h1 className="brand-text-title">Wuendjo</h1>
          <span className="brand-tagline">Voyager seul ou en groupe</span>
        </div>
      </div>

      <div className="gate-grid">
        <section className="gate-card gate-org">
          <div className="gate-icon"><ShieldCheck size={22} /></div>
          <h2>Espace organisateur</h2>
          <p className="mut">
            {exists
              ? 'Entrez votre code pour gérer les voyages, les participants et le budget.'
              : 'Première utilisation : créez un code personnel pour protéger l’espace de gestion.'}
          </p>

          <form onSubmit={submit}>
            <label htmlFor="org-code">{exists ? 'Code organisateur' : 'Choisissez un code'}</label>
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
            <button type="submit" className="accent" style={{ width: '100%' }} disabled={busy || !code}>
              {exists ? <><Lock size={15} /> Entrer</> : <><KeyRound size={15} /> Créer mon espace</>}
            </button>
          </form>

          {exists && (
            <div className="gate-foot">
              {!showReset ? (
                <button type="button" className="link-btn" onClick={() => setShowReset(true)}>Code oublié ?</button>
              ) : (
                <div className="gate-reset">
                  <p className="mut">
                    Cela supprime le code de cet appareil pour en créer un nouveau. Vos voyages sont conservés.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="bad sm" onClick={doReset}>Réinitialiser le code</button>
                    <button type="button" className="subtle sm" onClick={() => setShowReset(false)}>Annuler</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="gate-card">
          <div className="gate-icon alt"><Users size={22} /></div>
          <h2>Je suis invité(e)</h2>
          <p className="mut">
            Découvrez le voyage, répondez à l’invitation, votez pour les idées et suivez le programme. Aucun code n’est nécessaire.
          </p>
          <button type="button" className="subtle" style={{ width: '100%' }} onClick={onParticipant}>
            Accéder au voyage <ArrowRight size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}
