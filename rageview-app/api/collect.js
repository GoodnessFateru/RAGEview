import {sql,authed} from './_lib.js';
export default async function h(req,res){
 const cron=process.env.CRON_SECRET&&req.headers.authorization==='Bearer '+process.env.CRON_SECRET;
 if(!authed(req)&&!cron)return res.status(401).end();
 const accs=await sql`select * from accounts where platform='YouTube' and refresh_token is not null`;
 for(const a of accs){try{
  const t=await(await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,refresh_token:a.refresh_token,grant_type:'refresh_token'})})).json();
  if(!t.access_token)throw new Error('expired');
  const g=u=>fetch('https://www.googleapis.com/youtube/v3/'+u,{headers:{Authorization:'Bearer '+t.access_token}}).then(r=>r.json());
  const up=(await g('channels?part=contentDetails&id='+a.external_id)).items[0].contentDetails.relatedPlaylists.uploads;
  const ids=((await g('playlistItems?part=contentDetails&maxResults=50&playlistId='+up)).items||[]).map(i=>i.contentDetails.videoId).join(',');
  const vs=ids?((await g('videos?part=snippet,statistics&id='+ids)).items||[]):[];
  for(const v of vs){const s=v.statistics,imp=+s.viewCount||0,eng=(+s.likeCount||0)+(+s.commentCount||0);
   const r=await sql`insert into posts(account_id,external_id,title,kind,format,published_at,impressions,engagements) values(${a.id},${v.id},${v.snippet.title},'Post','Video',${v.snippet.publishedAt},${imp},${eng}) on conflict(account_id,external_id) do update set impressions=${imp},engagements=${eng},title=${v.snippet.title} returning id`;
   await sql`insert into snapshots(post_id,day,impressions,engagements) values(${r[0].id},current_date,${imp},${eng}) on conflict(post_id,day) do update set impressions=${imp},engagements=${eng}`}
  await sql`update accounts set status='Connected' where id=${a.id}`
 }catch(e){await sql`update accounts set status='Needs reconnecting' where id=${a.id}`}}
 res.json({ok:true,accounts:accs.length})}
