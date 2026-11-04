import {useApp,cur,F} from '../ctx.js';
export default function Budget(){
  const{t,me,upd}=useApp();
  const inn=t.ledger.filter(l=>l.s>0).reduce((a,l)=>a+l.s,0),out=-t.ledger.filter(l=>l.s<0).reduce((a,l)=>a+l.s,0);
  const a=Math.round(t.pp*.5),c=Math.round(t.pp*.3);
  const sched=!me?.plan?[]:me.plan==='full'?[['Paiement unique',t.pp]]:[['1er versement (50 %)',a],['2e versement (30 %)',c],['Solde (20 %)',t.pp-a-c]];
  return <>
    <div className="card two"><div><div className="mut">Reçu</div><div className="big">{F(inn)}</div></div><div><div className="mut">Dépensé</div><div className="big">{F(out)}</div></div><div className="mut" style={{gridColumn:'span 2'}}>Solde : {F(inn-out)}</div></div>
    {me&&<div className="card"><h2>Ma participation : {F(t.pp)}</h2>
      <select value={me.plan||''} onChange={e=>upd(s=>{cur(s).people.find(p=>p.id==='me').plan=e.target.value})}><option value="">Choisir : une fois ou en tranches</option><option value="full">En une fois</option><option value="3">En 3 tranches (50/30/20 %)</option></select>
      {sched.map(([l,m])=>{const p=t.pays.find(p=>p.who==='me'&&p.l===l);return <div className="row" key={l}><span>{l}<br/><span className="mut">{F(m)}</span></span>
        {p?<span className={'pill '+(p.ok?'ok':'')}>{p.ok?'reçu':'à confirmer'}</span>:<button onClick={()=>upd(s=>{cur(s).pays.push({who:'me',name:me.name,l,a:m,ok:false})})}>J’ai payé</button>}</div>})}</div>}
    <div className="card"><h2>Mouvements</h2>
      {t.ledger.map((l,i)=><div className="row" key={i}><span>{l.l}</span><b style={{color:l.s<0?'var(--bad)':'var(--g)'}}>{l.s>0?'+':''}{F(l.s)}</b></div>)}
      {!t.ledger.length&&<p className="mut">Aucun mouvement.</p>}</div>
  </>;
}
