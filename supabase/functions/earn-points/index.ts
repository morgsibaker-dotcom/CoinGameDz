import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}
const json=(body:Record<string,unknown>,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  if(req.method!=='POST')return json({success:false,error:'Method not allowed'},405)
  try{
    const url=Deno.env.get('SUPABASE_URL')??'',key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??''
    if(!url||!key)throw new Error('Supabase server configuration is missing')
    const token=req.headers.get('Authorization')?.replace(/^Bearer\\s+/i,'')
    if(!token)throw new Error('Authorization is required')
    const admin=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}})
    const {data:session,error:se}=await admin.auth.getUser(token)
    if(se||!session.user)throw new Error('Invalid session')
    const body=await req.json()
    const action=body?.action
    const providerEventId=body?.provider_event_id
    const amounts:Record<string,number>={tap:1,daily_checkin:50,task:250}
    let amount=amounts[action]
    const {data:settingsRows,error:settingsError}=await admin.from('app_settings').select('key,value').in('key',['ad_reward_points','daily_ad_limit','tap_limit_per_minute','points_per_usd'])
    if(settingsError)throw new Error(settingsError.message)
    const settings=Object.fromEntries((settingsRows??[]).map((row:any)=>[row.key,Number(row.value?.value)]))
    const adRewardPoints=settings.ad_reward_points>0?settings.ad_reward_points:100
    const dailyAdLimit=Number.isFinite(settings.daily_ad_limit)&&settings.daily_ad_limit>=0?settings.daily_ad_limit:10
    const tapLimit=Number.isFinite(settings.tap_limit_per_minute)&&settings.tap_limit_per_minute>0?settings.tap_limit_per_minute:60
    const pointsPerUsd=Number.isFinite(settings.points_per_usd)&&settings.points_per_usd>0?settings.points_per_usd:1000
    if(action==='ad'){
      amount=adRewardPoints
      if(!providerEventId)throw new Error('Verified ad event is required')
      const {data:userForAd,error:userAdError}=await admin.from('users').select('id').eq('auth_user_id',session.user.id).maybeSingle()
      if(userAdError)throw new Error(userAdError.message)
      if(!userForAd)throw new Error('User profile not found')
      const {data:dup}=await admin.from('ad_events').select('id').eq('provider_event_id',providerEventId).maybeSingle()
      if(dup)throw new Error('Ad reward already claimed')
      const dayStart=new Date();dayStart.setUTCHours(0,0,0,0)
      const {count:adCount,error:adCountError}=await admin.from('ad_events').select('id',{count:'exact',head:true}).eq('user_id',userForAd.id).eq('status','verified').gte('created_at',dayStart.toISOString())
      if(adCountError)throw new Error(adCountError.message)
      if((adCount??0)>=dailyAdLimit)throw new Error('Daily ad limit reached')
      const {error:ae}=await admin.from('ad_events').insert({user_id:userForAd.id,provider:String(body?.provider||'unknown'),reward_points:amount,provider_event_id:providerEventId,status:'verified'})
      if(ae)throw new Error(ae.message)
    }
    if(action==='daily_checkin'){
      const {data:userForCheck}=await admin.from('users').select('id').eq('auth_user_id',session.user.id).maybeSingle()
      if(!userForCheck)throw new Error('User profile not found')
      const {count}=await admin.from('point_transactions').select('id',{count:'exact',head:true}).eq('user_id',userForCheck.id).eq('source','daily_checkin').gte('created_at',new Date(new Date().setUTCHours(0,0,0,0)).toISOString())
      if((count??0)>0)throw new Error('Daily bonus already claimed')
    }
    if(!amount)throw new Error('Invalid earning action')
    const {data:user,error:ue}=await admin.from('users').select('id').eq('auth_user_id',session.user.id).maybeSingle()
    if(ue)throw new Error(ue.message)
    if(!user)throw new Error('User profile not found')
    if(action==='tap'){
      const since=new Date(Date.now()-60000).toISOString()
      const {count,error:ce}=await admin.from('point_transactions').select('id',{count:'exact',head:true}).eq('user_id',user.id).eq('source','tap').gte('created_at',since)
      if(ce)throw new Error(ce.message)
      if((count??0)>=tapLimit)throw new Error('Tap limit reached. Try again later.')
    }
    const description=action==='tap'?'Tap reward':action==='daily_checkin'?'Daily check-in':action==='ad'?'Ad reward':'Task reward'
    const {data:result,error:awardError}=await admin.rpc('award_points_atomic',{
      p_user_id:user.id,
      p_amount:amount,
      p_source:action,
      p_description:description,
      p_points_per_usd:pointsPerUsd,
      p_metadata:{server_verified:true,provider:action==='ad'?String(body?.provider||'unknown'):undefined}
    })
    if(awardError)throw new Error(awardError.message)
    return json(result as Record<string,unknown>)
  }catch(e){
    return json({success:false,error:e instanceof Error?e.message:'Unknown error'},400)
  }
})
