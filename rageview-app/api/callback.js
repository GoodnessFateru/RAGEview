import {sql,guard,BASE} from './_lib.js';
export default async function h(req,res){if(!guard(req,res))return;
 const {code,state,error}=req.query;if(error)return res.redirect('/?error='+encodeURIComponent(error));
 try{
  const t=await(await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({code,client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:BASE()+'/api/callback',grant_type:'authorization_code'})})).json();
  if(!t.access_token)throw new Error('Google did not approve the link');
  const c=await(await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',{headers:{Authorization:'Bearer '+t.access_token}})).json();
  const ch=c.items&&c.items[0];if(!ch)throw new Error('That Google account has no YouTube channel');
  await sql`insert into accounts(brand_id,platform,handle,external_id,refresh_token,status) values(${state},'YouTube',${ch.snippet.customUrl||ch.snippet.title},${ch.id},${t.refresh_token||null},'Connected') on conflict(brand_id,platform,external_id) do update set refresh_token=coalesce(excluded.refresh_token,accounts.refresh_token),status='Connected'`;
  res.redirect('/?connected=1')
 }catch(e){res.redirect('/?error='+encodeURIComponent(e.message))}}
