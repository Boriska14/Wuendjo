import {createContext,useContext,useState} from 'react';
export const Ctx=createContext(null);
export const useApp=()=>useContext(Ctx);
export const cur=s=>s.trips[s.t];
export function useForm(init={}){const[f,setF]=useState(init);return[f,k=>({value:f[k]??'',onChange:e=>setF(o=>({...o,[k]:e.target.value}))}),()=>setF(init)]}
export const F=n=>Number(n).toLocaleString('fr-FR')+' FCFA';
