import {useApp,useForm,cur,F} from '../ctx.js';import {mk} from '../data.js';
export default function Manage(){
  const{t,org,upd}=useApp();const[f,b,reset]=useForm({sw:t.wa,sb:t.bereal,sd:t.dates});
  if(!org)return null;
  const wait=t.pays.map((p,i)=>({...p,i})).filter(p=>!p.ok);
  return <>
    <div className="card"><h2>Inscriptions</h2>{t.people.map(p=><div className="row" key={p.id}><span><b>{p.name}</b>, {p.age} ans<br/><span className="mut">{p.job} · {p.type}</span></span>
      {p.st==='ok'?<span className="pill ok">validé</span>:p.st==='no'?<span className="pill">refusé</span>:<span><button onClick={()=>upd(s=>{cur(s).people.find(x=>x.id===p.id).st='ok'})}>Valider</button> <button className="bad" onClick={()=>upd(s=>{cur(s).people.find(x=>x.id===p.id).st='no'})}>Refuser</button></span>}</div>)}</div>
    <div className="card"><h2>Paiements à confirmer</h2>{wait.map(p=><div className="row" key={p.i}><span>{p.name} · {p.l}<br/><span className="mut">{F(p.a)}</span></span>
      <button onClick={()=>upd(s=>{const c=cur(s),q=c.pays[p.i];q.ok=true;c.ledger.push({l:'Versement de '+q.name+' · '+q.l,s:q.a})})}>Confirmer</button></div>)}{!wait.length&&<p className="mut">Rien en attente.</p>}</div>
    <div className="card"><h2>Ajouter une dépense</h2><input {...b('el')} placeholder="Libellé (ex. Bungalows)"/><input type="number" {...b('ea')} placeholder="Montant FCFA"/>
      <button onClick={()=>{if(f.ea){upd(s=>{cur(s).ledger.push({l:f.el||'Dépense',s:-Math.abs(+f.ea)})});reset()}}}>Enregistrer la dépense</button></div>
    <div className="card"><h2>Réglages du voyage</h2><input {...b('sw')} placeholder="N° WhatsApp (ex. 2376…)"/><input {...b('sb')} placeholder="Lien BeReal"/><input {...b('sd')} placeholder="Dates"/>
      <button onClick={()=>upd(s=>{const c=cur(s);c.wa=f.sw;c.bereal=f.sb;c.dates=f.sd})}>Enregistrer</button></div>
    <div className="card"><h2>Nouveau voyage</h2><input {...b('vn')} placeholder="Nom du voyage"/><input {...b('vd')} placeholder="Destination"/>
      <button className="alt" onClick={()=>{if(f.vn){upd(s=>{s.trips.push(mk(f.vn,f.vd||''));s.t=s.trips.length-1;s.tab='home'});reset()}}}>Créer le voyage</button></div>
  </>;
}
