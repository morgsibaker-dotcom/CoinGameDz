import { useEffect, useState } from 'react'
import { Check, Play, Gift, ListChecks } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { awardPoints } from '../services/earnService'
import { supabase } from '../lib/supabase'

declare global { interface Window { Adsgram?: { init: (options:{blockId:string}) => {show:()=>Promise<{done?:boolean}>} } } }

export default function Earn() {
  const { t } = useTranslation()
  const [claimed,setClaimed]=useState<string[]>([]); const [busy,setBusy]=useState<string|null>(null); const [blockId,setBlockId]=useState(''); const [adReward,setAdReward]=useState(100)
  useEffect(()=>{supabase.rpc('get_public_ad_config').then(({data})=>{if(!data)return;setBlockId(String(data.placement??''));const reward=Number(data.reward_points);if(Number.isFinite(reward)&&reward>0)setAdReward(reward)})},[])
  const claim=async(id:string)=>{
    if(claimed.includes(id)||busy)return
    if(id==='ad'){if(!blockId||!window.Adsgram)return;setBusy(id);try{const result=await window.Adsgram.init({blockId}).show();if(result?.done===false)return;await awardPoints('ad',{provider_event_id:crypto.randomUUID(),provider:'AdsGram'});setClaimed(v=>[...v,id])}catch{}finally{setBusy(null)};return}
    setBusy(id);try{await awardPoints(id as 'daily_checkin'|'task');setClaimed(v=>[...v,id])}catch{}finally{setBusy(null)}
  }
  const actions=[{id:'daily_checkin',label:t('earn.daily'),icon:Gift,reward:50},{id:'ad',label:t('earn.ad'),icon:Play,reward:adReward},{id:'task',label:t('earn.task'),icon:ListChecks,reward:250}] as const
  return <main className="min-h-screen bg-slate-950 text-white pb-24"><Header/><section className="px-4 pt-6"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">{t('earn.eyebrow')}</p><h1 className="mt-2 text-3xl font-black">{t('earn.title')}</h1><p className="mt-2 text-sm text-slate-400">{t('earn.subtitle')}</p><div className="mt-6 space-y-3">{actions.map(({id,label,icon:Icon,reward})=>{const done=claimed.includes(id);return <button key={id} type="button" disabled={done||busy!==null||(id==='ad'&&!blockId)} onClick={()=>claim(id)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-4 text-left disabled:opacity-60"><span className="flex items-center gap-3"><Icon className="h-5 w-5 text-sky-400"/><span><b>{label}</b>{id==='ad'&&<small className="mt-1 block text-slate-500">{blockId?t('earn.rewardedAd'):t('earn.notConfigured')}</small>}</span></span>{done?<Check className="h-5 w-5 text-emerald-400"/>:<span className="font-bold text-sky-400">+{reward} DZE</span>}</button>})}</div></section><BottomNavigation/></main>
}