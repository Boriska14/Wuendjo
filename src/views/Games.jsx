import {useApp,useForm,cur} from '../ctx.js';import {DAYS} from '../data.js';
export default function Games(){
  const{t,org,upd}=useApp();const[f,b,reset]=useForm({tm:'A'});
  const tot=k=>t.scores.filter(s=>s.team===k).reduce((a,s)=>a+s.pts,0);
  const toggle=key=>upd(s=>{const d=cur(s).done,i=d.indexOf(key);i<0?d.push(key):d.splice(i,1)});
  return <>
    <div className="card two"><div><div className="mut">Équipe A</div><div className="big">{tot('A')}</div></div><div><div className="mut">Équipe B</div><div className="big">{tot('B')}</div></div></div>
    {DAYS().map(([d,k,l])=><div className="card" key={d}><h2>{d} · clé {k} {l.every((_,j)=>t.done.includes(d+j))&&<span className="pill ok">gagnée</span>}</h2>
      {l.map((x,j)=><div className="row" key={j}><span>{x}</span>{org?<input type="checkbox" style={{width:'auto'}} checked={t.done.includes(d+j)} onChange={()=>toggle(d+j)}/>:t.done.includes(d+j)&&<span className="pill ok">fait</span>}</div>)}</div>)}
    <div className="card"><h2>Chasse au trésor : indices</h2>
      {t.clues.map((c,j)=><div className="msg" key={j}>Indice {j+1} : {c}</div>)}
      {!t.clues.length&&<p className="mut">Aucun indice débloqué pour l’instant.</p>}
      {org&&<><input {...b('cl')} placeholder="Nouvel indice à révéler"/><button onClick={()=>{if(f.cl){upd(s=>{cur(s).clues.push(f.cl)});reset()}}}>Révéler l’indice</button></>}</div>
    {org&&<div className="card"><h2>Ajouter des points</h2><div className="two"><select {...b('tm')}><option>A</option><option>B</option></select><input type="number" {...b('pt')} placeholder="Points"/></div><input {...b('ws')} placeholder="Épreuve ou raison"/>
      <button onClick={()=>{if(f.pt){upd(s=>{cur(s).scores.push({team:f.tm,pts:+f.pt,why:f.ws})});reset()}}}>Enregistrer</button></div>}
  </>;
}
