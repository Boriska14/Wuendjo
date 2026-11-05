import React, { useState } from 'react';
import { useApp, useForm, cur } from '../ctx.js';
import { BookOpen, Send, Plus, Trash2 } from 'lucide-react';

export default function Chat() {
  const { t, me, org, upd } = useApp();
  const [f, b, reset] = useForm();
  const [noteText, setNoteText] = useState('');

  const isSolo = t.mode === 'solo';
  const who = org ? 'Organisateur' : (me?.name || 'Moi');

  // Envoi d'un message dans le chat de groupe
  const sendMessage = () => {
    if (!f.x?.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    upd(s => {
      const trip = cur(s);
      if (!trip.msgs) trip.msgs = [];
      trip.msgs.push({
        w: who,
        x: f.x.trim(),
        t: timeStr
      });
    });
    reset();
  };

  // Ajout d'une note dans le journal de bord solo
  const addJournalNote = () => {
    if (!noteText.trim()) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    upd(s => {
      const trip = cur(s);
      if (!trip.notes) trip.notes = [];
      trip.notes.unshift({
        id: 'n-' + Date.now(),
        date: dateStr,
        text: noteText.trim()
      });
    });
    setNoteText('');
  };

  // Supprimer une note
  const deleteNote = (id) => {
    upd(s => {
      const trip = cur(s);
      if (trip.notes) trip.notes = trip.notes.filter(n => n.id !== id);
    });
  };

  if (isSolo) {
    const notes = t.notes || [];
    return (
      <div>
        <div className="card card-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <BookOpen size={20} color="var(--gold)" />
            <span className="pill primary">Carnet de Route & Pensées</span>
          </div>
          <h1 className="big" style={{ margin: '0 0 6px', fontSize: '26px' }}>
            Journal de Bord Personnel
          </h1>
          <p className="mut" style={{ margin: 0, fontSize: '14px' }}>
            Consignez vos impressions, adresses croisées au hasard, souvenirs et réflexions au cours de votre voyage en solo à {t.dest}.
          </p>
        </div>

        <div className="grid-2-1">
          <div>
            <div className="card">
              <h2>Rédiger une nouvelle page de journal</h2>
              <textarea
                rows={3}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Racontez votre journée, une rencontre insolite, une émotion..."
              />
              <button className="accent" onClick={addJournalNote}>
                <Plus size={15} /> Enregistrer dans mon carnet
              </button>
            </div>

            <div className="card">
              <h2>Mes entrées de carnet ({notes.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {notes.map(note => (
                  <div key={note.id} style={{ background: 'var(--card-alt)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="pill primary" style={{ fontSize: '11px' }}>{note.date}</span>
                      <button className="subtle sm" onClick={() => deleteNote(note.id)} style={{ padding: '3px 6px', border: 'none', background: 'transparent' }} title="Supprimer">
                        <Trash2 size={13} color="var(--accent-beaver)" />
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {note.text}
                    </p>
                  </div>
                ))}

                {!notes.length && (
                  <div className="empty-box">
                    <p>Aucune note encore rédigée. Commencez à écrire dès aujourd'hui !</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ background: 'var(--card-alt)' }}>
              <h3>💡 Idées pour votre carnet solo</h3>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7', margin: '8px 0 0' }}>
                <li>Une phrase marquante entendue dans la journée</li>
                <li>Le meilleur plat dégusté et son odeur</li>
                <li>Ce qui vous a le plus surpris en arrivant</li>
                <li>Un conseil à donner à votre futur vous</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si voyage en groupe : Discussion en direct
  const msgs = t.msgs || [];
  return (
    <div>
      <div className="card card-hero">
        <h1 className="big" style={{ margin: '0 0 6px', fontSize: '26px' }}>
          Discussion du Groupe Wuendjo
        </h1>
        <p className="mut" style={{ margin: 0, fontSize: '14px' }}>
          Échangez sur l’organisation, le covoiturage, les affaires à emporter et les rendez-vous.
        </p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '280px', maxHeight: '420px', overflowY: 'auto', marginBottom: '16px', paddingRight: '6px' }}>
          {msgs.map((m, i) => {
            const isMe = m.w === who || m.w === 'Boris (Moi)' || m.w === 'Moi';
            return (
              <div key={i} className={`msg ${isMe ? 'me' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '12px' }}>
                  <b>{m.w}</b>
                  <span className="mut" style={{ fontSize: '11px' }}>{m.t}</span>
                </div>
                <div style={{ fontSize: '14px' }}>{m.x}</div>
              </div>
            );
          })}

          {!msgs.length && (
            <div className="empty-box">
              <p>Aucun message encore échangé. Lancez la conversation !</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            {...b('x')}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            placeholder={`Écrire un message en tant que ${who}...`}
            style={{ margin: 0 }}
          />
          <button className="accent" onClick={sendMessage} style={{ flexShrink: 0, padding: '0 18px' }}>
            <Send size={15} /> Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
