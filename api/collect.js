import {sql,authed} from './_lib.js';
import {P} from './_platforms.js';
export default async function h(req,res){
 const cron=process.env.CRON_SECRET&&req.headers.authorization==='Bearer '+process.env.CRON_SECRET;
 if(!authed(req)&&!cron)return res.status(401).end();
 const accs=await sql`select * from accounts where refresh_token is not null`,errors=[];
 for(const a of accs){try{
  const r=await P[a.platform].collect(a);
  for(const v of r.posts){
   const x=await sql`insert into posts(account_id,external_id,title,kind,format,published_at,impressions,engagements) values(${a.id},${String(v.id)},${v.t},'Post',${v.f},${v.at},${v.imp},${v.eng}) on conflict(account_id,external_id) do update set impressions=${v.imp},engagements=${v.eng},title=${v.t} returning id`;
   await sql`insert into snapshots(post_id,day,impressions,engagements) values(${x[0].id},current_date,${v.imp},${v.eng}) on conflict(post_id,day) do update set impressions=${v.imp},engagements=${v.eng}`}
  if(r.secret)await sql`update accounts set refresh_token=${r.secret} where id=${a.id}`;
  await sql`update accounts set status='Connected' where id=${a.id}`
 }catch(e){errors.push({platform:a.platform,msg:e.message});await sql`update accounts set status='Needs reconnecting' where id=${a.id}`}}
 res.json({ok:true,accounts:accs.length,errors})}
