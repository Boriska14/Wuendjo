import {useEffect,useState} from 'react';import {tv,arr,lab,idf,Show} from '../travora.jsx';
export default function Visa(){
  const[deps,setDeps]=useState([]),[dep,setDep]=useState('cm'),[q,setQ]=useState(''),[res,setRes]=useState([]),[det,setDet]=useState(null),[detn,setDetn]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const run=async f=>{setBusy(true);setErr('');try{await f()}catch(e){setErr('Travora indisponible : '+e.message)}setBusy(false)};
  useEffect(()=>{run(async()=>setDeps(arr(await tv('list_departures',{locale:'fr'})).map(x=>({v:typeof x==='string'?x:(x.iso2||x.code||x.id),n:lab(x)}))))},[]);
  const search=()=>run(async()=>{const d=await tv('search_destinations',{keyword:q,departure:dep,locale:'fr'});
    const r=arr(d).map(x=>{const s=x.visa_status||x.visa;return{id:idf(x),n:lab(x),s:typeof s==='string'?s:''}});setRes(r);setDet(null);if(!r.length)setErr('Aucun résultat.')});
  const open=id=>run(async()=>{setDet(await tv('get_destination',{destination:id,departure:dep,locale:'fr'}));setDetn((res.find(x=>x.id===id)||{}).n||id)});
  return <>
    <div className="card"><h2>Visa et infos destination</h2><p className="mut">Pour les voyages à l’étranger. Données Travora (travora.guide), indicatives : à reconfirmer aux sources officielles avant de réserver.</p>
      <select value={dep} onChange={e=>{setDep(e.target.value);setRes([]);setDet(null)}}>{deps.length?deps.map(x=><option key={x.v} value={x.v}>{x.n}</option>):<option value="cm">Cameroun</option>}</select>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Destination ou mot-clé (ex. Kenya)"/><button onClick={search}>Rechercher</button></div>
    {err&&<div className="card">{err}</div>}{busy&&<p className="mut">Chargement…</p>}
    {res.length>0&&<div className="card">{res.map(x=><div className="row" key={x.id}><span>{x.n}<br/><span className="mut">{x.s}</span></span><button className="alt" onClick={()=>open(x.id)}>Voir</button></div>)}</div>}
    {det&&<div className="card"><h2>{detn}</h2><Show x={det}/></div>}
  </>;
}
