import {useApp} from '../ctx.js';import {GUIDE} from '../data.js';
export default function Guide(){
  const{org}=useApp();
  if(!org)return <div className="card"><h2>Accès réservé</h2><p className="mut">Ce guide est réservé à l’organisateur.</p></div>;
  return <div className="card"><h2>Guide du maître du jeu</h2><p className="mut">Confidentiel : visible uniquement par l’organisateur.</p>
    {GUIDE.map(([a,b])=><details key={a}><summary>{a}</summary><p>{b}</p></details>)}</div>;
}
