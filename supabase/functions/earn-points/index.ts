import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods':'POST, OPTIONS' }
const json = (body: Record<string, unknown>, status=200) => new Response(JSON.stringify(body), { status, headers:{...cors,'Content-Type':'application/json'} })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok',{headers:cors})
  if (req.method !== 'POST') return json({success:false,error:'Method not allowed'},405)
  try {
    const url=Deno.env.get('SUPABASE_URL') ?? ''
    const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if(!url || !key) throw new Error('Supabase server configuration is missing')
    const auth=req.headers.get('Authorization')?.replace(/^Bearer\\s+/i,'')
    if(!auth) throw new Error('Authorization is required')
    const admin=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}})
    const {data:session,error:sessionError}=await admin.auth.getUser(auth)
    if(sessionError || !session.user) throw new Error('Invalid session')
    const body=await req.json()
    const action=body?.action
    const amounts:Record<string,number>={tap:1,daily_checkin:50,task:250}
    const amount=amounts[action]
    if(!amount) throw new Error('Invalid earning action')
    const {data:user,error:userError}=await admin.from('users').select('id,points_balance').eq('auth_user_id',session.user.id).maybeSingle()
    if(userError) throw new Error(userError.message)
    if(!user) throw new Error('User profile not found')
    const {error:txError}=await admin.from('point_transactions').insert({user_id:user.id,amount,type:'earn',description:action==='tap'?'Tap reward':action==='daily_checkin'?'Daily check-in':'Task reward',source:action,metadata:{server_verified:true}})
    if(txError) throw new Error(txError.message)
    const next=Number(user.points_balance??0)+amount
    const {data:updated,error:updateError}=await admin.from('users').update({points_balance:next,usd_equivalent:next/1000}).eq('id',user.id).select('points_balance,usd_equivalent').single()
    if(updateError) throw new Error(updateError.message)
    return json({success:true,points_balance:updated.points_balance,usd_equivalent:updated.usd_equivalent})
  } catch(e) { return json({success:false,error:e instanceof Error?e.message:'Unknown error'},400) }
})
