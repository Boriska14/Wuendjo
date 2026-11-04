// Appels au serveur MCP public de Travora via le proxy /api/travora (voir api/travora.js).
export const tv=async(tool,args)=>{const r=await fetch('/api/travora?tool='+tool+'&args='+encodeURIComponent(JSON.stringify(args)));const j=await r.json();if(!r.ok)throw new Error(j.error||'Erreur '+r.status);return j.data};
export const arr=o=>Array.isArray(o)?o:o&&typeof o==='object'?(Object.values(o).find(Array.isArray)||[]):[];
export const lab=x=>typeof x==='string'?x:(x.name||x.label||x.title||x.country||x.slug||'');
export const idf=x=>typeof x==='string'?x:(x.slug||x.id||x.iso2||x.code||x.name||'');
export function Show({x,d=0}){
  if(x==null)return null;
  if(typeof x!=='object')return /^https?:/.test(x)?<a href={x} target="_blank" rel="noopener noreferrer">{x}</a>:<>{String(x)}</>;
  if(d>2)return <>{JSON.stringify(x).slice(0,300)}</>;
  if(Array.isArray(x))return <ul>{x.slice(0,30).map((i,k)=><li key={k}><Show x={i} d={d+1}/></li>)}</ul>;
  return <>{Object.entries(x).map(([k,v])=><p key={k} style={{margin:'4px 0'}}><b>{k.replace(/_/g,' ')}</b> <Show x={v} d={d+1}/></p>)}</>;
}
