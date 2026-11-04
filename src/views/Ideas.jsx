import {useApp,useForm,cur} from '../ctx.js';
export default function Ideas(){
  const{t,upd}=useApp();const[f,b,reset]=useForm({k:'Restaurant'});
  return <>
    <div className="card"><h2>Proposer une idée</h2><select {...b('k')}><option>Restaurant</option><option>Activité</option></select><input {...b('n')} placeholder="Nom ou lien"/><input {...b('z')} placeholder="Pourquoi ?"/>
      <button onClick={()=>{if(f.n){upd(s=>{cur(s).ideas.push({k:f.k,n:f.n,z:f.z||'',v:0})});reset()}}}>Proposer</button></div>
    <div className="card"><h2>Propositions</h2>
      {t.ideas.map((x,j)=><div className="row" key={j}><span><b>{x.n}</b> <span className="pill">{x.k}</span><br/><span className="mut">{x.z}</span></span><button className="alt" onClick={()=>upd(s=>{cur(s).ideas[j].v++})}>+1 · {x.v}</button></div>)}
      {!t.ideas.length&&<p className="mut">Aucune proposition.</p>}</div>
    <div className="card"><h2>Photos du séjour</h2>{t.bereal?<a href={t.bereal} target="_blank" rel="noopener noreferrer"><button>Ouvrir le BeReal du groupe</button></a>:<p className="mut">L’organisateur n’a pas encore ajouté le lien.</p>}</div>
  </>;
}
