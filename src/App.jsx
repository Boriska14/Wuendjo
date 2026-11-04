import {useEffect,useState} from 'react';
import {Ctx} from './ctx.js';
import {seed} from './data.js';
import Home from './views/Home.jsx';import Games from './views/Games.jsx';import Chat from './views/Chat.jsx';
import Ideas from './views/Ideas.jsx';import Budget from './views/Budget.jsx';import Visa from './views/Visa.jsx';
import Guide from './views/Guide.jsx';import Manage from './views/Manage.jsx';
const V={home:Home,jeux:Games,chat:Chat,idees:Ideas,budget:Budget,visa:Visa,guide:Guide,gerer:Manage};
const TABS=[['home','Accueil'],['jeux','Jeux'],['chat','Chat'],['idees','Idées'],['budget','Budget'],['visa','Visa']];
const load=()=>{try{const x=localStorage.getItem('wuendjo');if(x)return JSON.parse(x)}catch{}return{role:'p',tab:'home',t:0,trips:[seed()]}};
export default function App(){
  const[S,setS]=useState(load);
  useEffect(()=>{try{localStorage.setItem('wuendjo',JSON.stringify(S))}catch{}},[S]);
  const upd=f=>setS(s=>{const n=structuredClone(s);f(n);return n});
  const t=S.trips[S.t],org=S.role==='o',me=t.people.find(p=>p.id==='me'),ok=org||me?.st==='ok';
  const tab=!org&&(S.tab==='gerer'||S.tab==='guide')?'home':S.tab;
  const go=k=>upd(s=>{s.tab=k});
  const View=V[tab];
  const nav=[...TABS,...(org?[['guide','Guide'],['gerer','Gérer']]:[])];
  return <Ctx.Provider value={{S,t,me,org,ok,upd,go}}>
    <div id="app">
      <header><h1>Wuendjo</h1>
        <select style={{width:'auto',margin:0}} value={S.t} onChange={e=>upd(s=>{s.t=+e.target.value;s.tab='home'})}>{S.trips.map((x,i)=><option key={i} value={i}>{x.name}</option>)}</select>
        <select style={{width:'auto',margin:0}} value={S.role} onChange={e=>upd(s=>{s.role=e.target.value})}><option value="p">Participant</option><option value="o">Organisateur</option></select>
      </header>
      <main>{tab==='home'||ok?<View/>:<div className="card"><h2>Accès réservé</h2><p className="mut">Cette section s’ouvre quand l’organisateur a validé votre inscription.</p><button onClick={()=>go('home')}>Voir mon inscription</button></div>}</main>
      <nav>{nav.map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>go(k)}>{l}</button>)}</nav>
    </div>
  </Ctx.Provider>;
}
