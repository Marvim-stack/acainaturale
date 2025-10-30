import { useEffect, useState } from "react";

export const persist = (k:string, v:any)=> localStorage.setItem(k, JSON.stringify(v));
export const read = <T>(k:string, d:T):T => { try{ return JSON.parse(localStorage.getItem(k)||"") ?? d; }catch{ return d; } };
export function useLocalState<T>(key:string, initial:T){
  const [state,setState] = useState<T>(()=> read<T>(key, initial));
  useEffect(()=>{ persist(key,state); },[key,state]);
  return [state,setState] as const;
}
