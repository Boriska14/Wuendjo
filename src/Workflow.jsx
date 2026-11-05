import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

// steps : [{ key, title, desc, done?: boolean, cta?: string, onClick?: fn }]
// done === undefined : étape informative (non suivie).
export default function Workflow({ title, subtitle, steps }) {
  const tracked = steps.filter(s => typeof s.done === 'boolean');
  const doneCount = tracked.filter(s => s.done).length;
  const currentIdx = steps.findIndex(s => s.done === false);
  const pct = tracked.length ? Math.round((doneCount / tracked.length) * 100) : 0;

  return (
    <section className="card workflow">
      <div className="workflow-head">
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          {subtitle && <p className="mut" style={{ margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
        {tracked.length > 0 && <span className="pill ok">{doneCount}/{tracked.length} terminées</span>}
      </div>

      {tracked.length > 0 && <div className="bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>}

      <ol className="wf-list">
        {steps.map((s, i) => {
          const state = s.done === true ? 'done' : i === currentIdx ? 'current' : 'todo';
          return (
            <li key={s.key} className={`wf-step ${state}`}>
              <span className="wf-num" aria-hidden="true">{s.done === true ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
              <div className="wf-body">
                <div className="wf-title">{s.title}</div>
                <div className="mut wf-desc">{s.desc}</div>
              </div>
              {s.onClick && (
                <button
                  type="button"
                  className={state === 'current' ? 'accent sm' : 'subtle sm'}
                  onClick={s.onClick}
                >
                  {s.cta || 'Ouvrir'} <ArrowRight size={13} />
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
