import {useApp,useForm,cur} from '../ctx.js';
export default function Chat(){
  const{t,me,org,upd}=useApp();const[f,b,reset]=useForm();const who=org?'Organisateur':me.name;
  return <div className="card">
    {t.msgs.map((m,i)=><div key={i} className={'msg '+(m.w===who?'me':'')}><b>{m.w}</b><br/>{m.x}</div>)}
    {!t.msgs.length&&<p className="mut">Lancez la discussion du groupe.</p>}
    <input {...b('x')} placeholder="Votre message"/>
    <button onClick={()=>{if(f.x){upd(s=>{cur(s).msgs.push({w:who,x:f.x})});reset()}}}>Envoyer</button></div>;
}
