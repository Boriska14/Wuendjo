import React, { useState } from 'react';
import { useApp, cur } from '../ctx.js';
import { DeleteBtn } from '../ui.jsx';
import { Calendar, Plus, Sparkles, ListChecks } from 'lucide-react';

export default function Program() {
  const { t, upd, go } = useApp();
  const [day, setDay] = useState('');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [desc, setDesc] = useState('');
  const [task, setTask] = useState('');

  const itinerary = t.itinerary || [];
  const ideas = t.ideas || [];
  const checklist = t.checklist || [];

  const addStep = e => {
    e.preventDefault();
    if (!title.trim()) return;
    upd(s => {
      const trip = cur(s);
      if (!trip.itinerary) trip.itinerary = [];
      trip.itinerary.push({
        id: 'it-' + Date.now(),
        day: day.trim() || `Étape ${trip.itinerary.length + 1}`,
        title: title.trim(),
        time: time.trim(),
        desc: desc.trim()
      });
    });
    setDay(''); setTitle(''); setTime(''); setDesc('');
  };

  const addTask = e => {
    e.preventDefault();
    if (!task.trim()) return;
    upd(s => {
      const trip = cur(s);
      if (!trip.checklist) trip.checklist = [];
      trip.checklist.push({ id: 'c-' + Date.now(), text: task.trim(), done: false, category: 'Personnel' });
    });
    setTask('');
  };

  return (
    <div>
      <div className="card card-hero dark-scope">
        <h1 className="big" style={{ margin: '0 0 6px', fontSize: '26px' }}>Programme</h1>
        <p className="mut" style={{ margin: 0, fontSize: '14px' }}>
          Étapes du séjour, activités retenues et préparatifs. Vous pouvez tout ajouter ou supprimer.
        </p>
      </div>

      <div className="grid-2-1">
        <div>
          <div className="card">
            <h2><Calendar size={18} /> Itinéraire ({itinerary.length})</h2>

            {itinerary.map((step, idx) => (
              <div key={step.id || idx} className="row" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', minWidth: 0 }}>
                  <span className="pill primary" style={{ height: 'fit-content', whiteSpace: 'nowrap' }}>{step.day}</span>
                  <div style={{ minWidth: 0 }}>
                    <b>{step.title}</b>
                    {step.desc && <div className="mut">{step.desc}</div>}
                    {step.time && <div className="mut" style={{ fontSize: '12px' }}>{step.time}</div>}
                  </div>
                </div>
                <DeleteBtn
                  label={`Supprimer l’étape ${step.title}`}
                  onConfirm={() => upd(s => { cur(s).itinerary.splice(idx, 1); })}
                />
              </div>
            ))}

            {!itinerary.length && (
              <div className="empty-box"><p>Aucune étape pour l’instant. Ajoutez la première ci-dessous.</p></div>
            )}

            <form onSubmit={addStep} className="add-form">
              <h3>Ajouter une étape</h3>
              <div className="grid-2">
                <div>
                  <label>Jour</label>
                  <input value={day} onChange={e => setDay(e.target.value)} placeholder="Ex: Jour 2" />
                </div>
                <div>
                  <label>Heure</label>
                  <input value={time} onChange={e => setTime(e.target.value)} placeholder="Ex: 09:00" />
                </div>
              </div>
              <label>Titre *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Randonnée aux cascades" />
              <label>Détails</label>
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Facultatif" />
              <button type="submit" className="accent" disabled={!title.trim()}><Plus size={15} /> Ajouter l’étape</button>
            </form>
          </div>

          <div className="card">
            <h2><Sparkles size={18} /> Activités retenues ({ideas.length})</h2>
            <p className="mut">Les idées proposées ou retenues par le groupe. Supprimez celles qui ne sont plus d’actualité.</p>

            {ideas.map((x, j) => (
              <div key={x.id || j} className="row" style={{ alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <b>{x.n}</b>
                    <span className="pill primary" style={{ fontSize: '10px', padding: '1px 8px' }}>{x.k}</span>
                    <span className="pill" style={{ fontSize: '10px', padding: '1px 8px' }}>{x.v} vote{x.v > 1 ? 's' : ''}</span>
                  </div>
                  {x.z && <div className="mut">{x.z}</div>}
                </div>
                <DeleteBtn
                  label={`Supprimer ${x.n}`}
                  onConfirm={() => upd(s => { cur(s).ideas.splice(j, 1); })}
                />
              </div>
            ))}

            {!ideas.length && (
              <div className="empty-box">
                <p>Aucune activité retenue.</p>
                <button className="subtle sm" onClick={() => go('idees')}>Parcourir les idées</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h2><ListChecks size={18} /> Préparatifs ({checklist.filter(c => c.done).length}/{checklist.length})</h2>
            {checklist.map(item => (
              <div key={item.id} className="row" style={{ padding: '8px 0' }}>
                <label className="check-line">
                  <input
                    type="checkbox"
                    checked={Boolean(item.done)}
                    onChange={() => upd(s => {
                      const c = cur(s).checklist.find(x => x.id === item.id);
                      if (c) c.done = !c.done;
                    })}
                  />
                  <span style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.6 : 1 }}>{item.text}</span>
                </label>
                <DeleteBtn
                  label={`Supprimer ${item.text}`}
                  onConfirm={() => upd(s => { cur(s).checklist = cur(s).checklist.filter(x => x.id !== item.id); })}
                />
              </div>
            ))}
            {!checklist.length && <div className="empty-box"><p>Aucune tâche.</p></div>}

            <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder="Ajouter une tâche"
                style={{ margin: 0 }}
              />
              <button type="submit" className="subtle" aria-label="Ajouter la tâche" disabled={!task.trim()}><Plus size={16} /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
