import {useApp,useForm,cur} from '../ctx.js';import {TYPES} from '../data.js';
export default function Home(){
  const{t,me,org,ok,upd}=useApp();const[f,b]=useForm();const n=t.people.filter(p=>p.st==='ok').length;
  const send=()=>{if(!f.n||!f.ty)return;upd(s=>{cur(s).people.push({id:'me',name:f.n,age:f.a,job:f.j,phone:f.ph,type:f.ty,diet:f.d,why:f.w,st:'wait'})})};
  return <>
    <div className="card"><div className="big">{t.name}</div><div className="mut">{t.dest} · {t.dates}</div><p className="mut">{n}/{t.cap} participants validés</p><div className="bar"><i style={{width:n/t.cap*100+'%'}}/></div></div>
    {!org&&!me&&<div className="card"><h2>Inscription au voyage</h2>
      <input {...b('n')} placeholder="Nom complet"/>
      <div className="two"><input type="number" {...b('a')} placeholder="Âge"/><input {...b('ph')} placeholder="WhatsApp"/></div>
      <input {...b('j')} placeholder="Profession"/>
      <select {...b('ty')}><option value="">Quel type de voyageur es-tu ?</option>{TYPES.map(x=><option key={x}>{x}</option>)}</select>
      <input {...b('d')} placeholder="Allergies ou régime alimentaire"/>
      <textarea rows="2" {...b('w')} placeholder="Pourquoi veux-tu venir ?"/>
      <button onClick={send}>Envoyer ma demande</button></div>}
    {!org&&me?.st==='wait'&&<div className="card"><h2>Demande envoyée</h2><p className="mut">Vous êtes en attente de validation par l’organisateur.</p></div>}
    {!org&&me?.st==='no'&&<div className="card"><h2>Inscription non retenue</h2><p className="mut">Contactez l’organisateur pour en savoir plus.</p></div>}
    {ok&&<a href={`https://wa.me/${t.wa}?text=${encodeURIComponent('Bonjour, une question sur '+t.name)}`} target="_blank" rel="noopener noreferrer"><button style={{width:'100%'}}>Écrire à l’organisateur sur WhatsApp</button></a>}
  </>;
}
