import React, { useEffect, useState } from 'react';
import { tv, arr, lab, idf, Show } from '../travora.jsx';
import { Search, Globe, MapPin, Calendar, CreditCard } from 'lucide-react';

export default function Visa() {
  const [deps, setDeps] = useState([]);
  const [dep, setDep] = useState('cm');
  const [q, setQ] = useState('');
  const [res, setRes] = useState([]);
  const [det, setDet] = useState(null);
  const [detn, setDetn] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (f) => {
    setBusy(true);
    setErr('');
    try {
      await f();
    } catch (e) {
      console.warn('Erreur lors de la requête :', e.message);
      setErr(`Information : ${e.message}`);
    }
    setBusy(false);
  };

  useEffect(() => {
    run(async () => {
      const data = await tv('list_departures', { locale: 'fr' });
      const rawList = arr(data);
      const formatted = rawList.map(x => ({
        v: typeof x === 'string' ? x : (x.iso2 || x.code || x.id || 'cm'),
        n: lab(x) || 'Pays'
      }));
      setDeps(formatted.length ? formatted : [{ v: 'cm', n: 'Cameroun' }, { v: 'ci', n: 'Côte d’Ivoire' }, { v: 'sn', n: 'Sénégal' }, { v: 'fr', n: 'France' }]);
    });
  }, []);

  const search = () => run(async () => {
    const d = await tv('search_destinations', { keyword: q, departure: dep, locale: 'fr' });
    const raw = arr(d);
    const r = raw.map(x => {
      const s = x.visa_status || x.visa || (typeof x === 'object' ? Object.values(x).find(v => typeof v === 'string') : '');
      return {
        id: idf(x) || 'dest',
        n: lab(x) || 'Destination',
        s: typeof s === 'string' ? s : '',
        currency: x.currency || '',
        best_season: x.best_season || ''
      };
    });
    setRes(r);
    setDet(null);
    if (!r.length) setErr('Aucun résultat trouvé pour cette recherche.');
  });

  const openDetail = (id) => run(async () => {
    const d = await tv('get_destination', { destination: id, departure: dep, locale: 'fr' });
    setDet(d);
    const found = res.find(x => x.id === id);
    setDetn(found ? found.n : id);
  });

  const quickSearch = (countryName) => {
    setQ(countryName);
    run(async () => {
      const d = await tv('search_destinations', { keyword: countryName, departure: dep, locale: 'fr' });
      const raw = arr(d);
      const r = raw.map(x => {
        const s = x.visa_status || x.visa;
        return {
          id: idf(x),
          n: lab(x),
          s: typeof s === 'string' ? s : '',
          currency: x.currency || '',
          best_season: x.best_season || ''
        };
      });
      setRes(r);
      setDet(null);
    });
  };

  return (
    <div>
      <div className="card card-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Globe size={20} color="var(--primary)" />
          <span className="pill primary">Formalités, Visas & Découverte Internationale</span>
        </div>
        <h1 className="big" style={{ margin: '0 0 6px', fontSize: '26px' }}>
          Guide des Visas & Conseils Voyageurs
        </h1>
        <p className="mut" style={{ margin: 0, fontSize: '14px', maxWidth: '800px' }}>
          Consultez les conditions d’entrée, eVisas, monnaies et recommandations selon votre pays de départ.
        </p>
      </div>

      <div className="grid-2-1">
        <div>
          <div className="card">
            <h2>
              <Search size={18} color="var(--accent)" />
              Rechercher une destination
            </h2>

            <div className="grid-2">
              <div>
                <label>Votre pays de départ / passeport</label>
                <select value={dep} onChange={e => { setDep(e.target.value); setRes([]); setDet(null); }}>
                  {deps.length ? deps.map(x => (
                    <option key={x.v} value={x.v}>{x.n}</option>
                  )) : (
                    <option value="cm">Cameroun</option>
                  )}
                </select>
              </div>

              <div>
                <label>Destination souhaitée</label>
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') search(); }}
                  placeholder="Ex: Kenya, Bénin, Côte d’Ivoire..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="mut" style={{ fontSize: '12px' }}>Populaires :</span>
                {['Kenya', 'Cameroun', 'Sénégal', 'Côte d’Ivoire', 'Maroc'].map(c => (
                  <button key={c} type="button" className="subtle sm" onClick={() => quickSearch(c)} style={{ padding: '3px 8px', fontSize: '11px' }}>
                    {c}
                  </button>
                ))}
              </div>

              <button className="accent" onClick={search} disabled={busy}>
                {busy ? 'Recherche...' : 'Consulter les visas'}
              </button>
            </div>

            {err && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                {err}
              </div>
            )}
          </div>

          {/* Liste des résultats */}
          {res.length > 0 && (
            <div className="card">
              <h2>Résultats pour votre voyage ({res.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {res.map(x => (
                  <div
                    key={x.id}
                    onClick={() => openDetail(x.id)}
                    className="row"
                    style={{
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: detn === x.n ? 'var(--sand-light)' : 'var(--card-subtle)',
                      border: detn === x.n ? '1.5px solid var(--accent)' : '1px solid var(--border-light)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>
                        <MapPin size={14} color="var(--accent)" /> {x.n}
                      </div>
                      <div className="mut" style={{ fontSize: '13px', marginTop: '4px' }}>
                        {x.s || 'Consulter la fiche détaillée pour les exigences complètes.'}
                      </div>
                      {(x.currency || x.best_season) && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {x.currency && <span>💰 {x.currency}</span>}
                          {x.best_season && <span>☀️ {x.best_season}</span>}
                        </div>
                      )}
                    </div>
                    <button className="subtle sm" style={{ flexShrink: 0, padding: '4px 8px', fontSize: '12px' }}>
                      Détails →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Détail de la fiche destination */}
        <div>
          {det ? (
            <div className="card" style={{ position: 'sticky', top: '130px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2>Fiche détaillée : {detn}</h2>
                <button className="subtle sm" onClick={() => setDet(null)}>✕ Fermer</button>
              </div>
              <Show data={det} />
            </div>
          ) : (
            <div className="card" style={{ background: 'var(--card-alt)' }}>
              <h3>🛂 Formalités simplifiées</h3>
              <p className="mut" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>
                Dans l’espace CEMAC et CEDEAO, les citoyens membres bénéficient généralement de la libre circulation sur présentation d’une carte d’identité ou d’un passeport valide.
              </p>
              <p className="mut" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>
                Pour le Kenya, l'eTA se demande entièrement en ligne sur la plateforme officielle <b>etakenya.go.ke</b>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
