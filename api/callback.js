import {sql,guard} from './_lib.js';
import {P} from './_platforms.js';
export default async function h(req,res){const u=await guard(req,res);if(!u)return;
 const {code,state,error}=req.query;if(error)return res.redirect('/?error='+encodeURIComponent(error));
 try{
  const [pl,brand]=String(state).split('.'),p=P[pl];if(!p)throw new Error('Unknown platform');
  if(!(await sql`select 1 from brands where id=${brand} and (${u.is_admin}::boolean or user_id=${u.id})`).length)throw new Error('That brand is not yours');
  const verifier=((req.headers.cookie||'').match(/pk=([\w-]+)/)||[])[1];
  const accs=await p.exchange(code,{platform:pl,verifier});
  if(!accs.length)throw new Error('No '+pl+' accounts were found for that login');
  for(const a of accs)await sql`insert into accounts(brand_id,platform,handle,external_id,refresh_token,status) values(${brand},${pl},${a.handle},${String(a.id)},${a.secret||null},'Connected') on conflict(brand_id,platform,external_id) do update set handle=excluded.handle,refresh_token=coalesce(excluded.refresh_token,accounts.refresh_token),status='Connected'`;
  res.redirect('/?connected='+encodeURIComponent(pl))
 }catch(e){res.redirect('/?error='+encodeURIComponent(e.message))}}
