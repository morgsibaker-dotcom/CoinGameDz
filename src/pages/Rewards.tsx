import { useEffect,useState } from 'react'
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { supabase } from '../lib/supabase'
type Leader={user_id:string;rank:number;display_name:string;points_balance:number;level:number}
export default function Rewards(){
 const {t}=useTranslation();const[leaders,setLeaders]=useState<Leader[]>([]);const[error,setError]=useState('')
 useEffect(()=>{let mounted=true;supabase.rpc('get_top_users',{p_limit:100}).then(({data,error})=>{if(!mounted)return;if(error){setError(error.message);return}setLeaders((data??[])as Leader[])});return()=>{mounted=false}},[])
 return <main className="min-h-screen bg-slate-950 text-white pb-24"><Header/><section className="px-4 pt-6"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">{t('rewards.eyebrow')}</p><h1 className="mt-2 text-3xl font-black">{t('rewards.title')}</h1><p className="mt-2 text-sm text-slate-400">{t('rewards.subtitle')}</p><div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-5"><p className="font-bold">{t('rewards.checkin')}</p><p className="mt-1 text-sm text-slate-400">{t('rewards.dailyInEarn')}</p></div><div className="mt-8"><div className="mb-3 flex items-center gap-2"><Trophy className="text-amber-400"/><h2 className="text-xl font-bold">{t('rewards.top')}</h2></div><div className="space-y-2">{leaders.map(user=><div key={user.user_id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 p-3"><span><b>#{user.rank} {user.display_name}</b><small className="ml-2 text-slate-500">{t('rewards.level')}{user.level}</small></span><strong className="text-sky-400">{Number(user.points_balance).toLocaleString()} DZE</strong></div>)}</div>{error&&<p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}</div></section><BottomNavigation/></main>
}