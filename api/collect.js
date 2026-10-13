import {sql,user} from './_lib.js';
import {P} from './_platforms.js';
export default async function h(req,res){
 const cron=process.env.CRON_SECRET&&req.headers.authorization==='Bearer '+process.env.CRON_SECRET;
 const u=cron?null:await user(req);if(!u&&!cron)return res.status(401).end();
 const accs=u?await sql`select a.* from accounts a join brands b on b.id=a.brand_id where a.refresh_token is not null and (${u.is_admin}::boolean or b.user_id=${u.id})`:await sql`select * from accounts where refresh_token is not null`,errors=[];
 for(const a of accs){try{
  const r=await P[a.platform].collect(a);
  for(const v of r.posts){
   const x=await sql`insert into posts(account_id,external_id,title,kind,format,published_at,impressions,engagements,likes,comments,shares,url) values(${a.id},${String(v.id)},${v.t},'Post',${v.f},${v.at},${v.imp},${v.eng},${v.l??null},${v.c??null},${v.s??null},${v.u??null}) on conflict(account_id,external_id) do update set impressions=${v.imp},engagements=${v.eng},likes=${v.l??null},comments=${v.c??null},shares=${v.s??null},url=${v.u??null},title=${v.t} returning id`;
   await sql`insert into snapshots(post_id,day,impressions,engagements) values(${x[0].id},current_date,${v.imp},${v.eng}) on conflict(post_id,day) do update set impressions=${v.imp},engagements=${v.eng}`}
  if(r.posts.length){
   const keep=new Set(r.posts.map(v=>String(v.id))),oldest=r.posts.reduce((m,v)=>v.at<m?v.at:m,r.posts[0].at);
   const have=await sql`select external_id from posts where account_id=${a.id} and published_at>=${oldest}`;
   for(const h of have)if(!keep.has(h.external_id))await sql`delete from posts where account_id=${a.id} and external_id=${h.external_id}`}
  if(r.secret)await sql`update accounts set refresh_token=${r.secret} where id=${a.id}`;
  await sql`update accounts set status='Connected' where id=${a.id}`
 }catch(e){errors.push({platform:a.platform,msg:e.message});await sql`update accounts set status='Needs reconnecting' where id=${a.id}`}}
 res.json({ok:true,accounts:accs.length,errors})}
