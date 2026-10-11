import crypto from 'crypto';
import {BASE} from './_lib.js';
const E=new Proxy(process.env,{get:(t,k)=>typeof t[k]==='string'?t[k].trim():t[k]}),cb=()=>BASE()+'/api/callback',form=o=>new URLSearchParams(o);
const j=async(u,o)=>{const r=await fetch(u,o),t=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(u.split('?')[0].replace('https://','')+' answered '+r.status+(t.error&&t.error.message?': '+t.error.message:''));return t};
const clip=s=>String(s||'').split('\n')[0].slice(0,70)||'(no text)';
const bearer=t=>({headers:{Authorization:'Bearer '+t}});
const val=r=>{const m=r&&r.data&&r.data[0];return m?((m.values?m.values[0].value:m.total_value&&m.total_value.value)||0):0};
const enc=encodeURIComponent;

// ---------- YouTube (views are used as impressions) ----------
const YouTube={
 auth:s=>'https://accounts.google.com/o/oauth2/v2/auth?'+form({client_id:E.GOOGLE_CLIENT_ID,redirect_uri:cb(),response_type:'code',access_type:'offline',prompt:'consent',scope:'https://www.googleapis.com/auth/youtube.readonly',state:s}),
 async exchange(code){
  const t=await j('https://oauth2.googleapis.com/token',{method:'POST',body:form({code,client_id:E.GOOGLE_CLIENT_ID,client_secret:E.GOOGLE_CLIENT_SECRET,redirect_uri:cb(),grant_type:'authorization_code'})});
  const c=await j('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',bearer(t.access_token));
  const ch=(c.items||[])[0];if(!ch)throw new Error('That Google account has no YouTube channel');
  return[{id:ch.id,handle:ch.snippet.customUrl||ch.snippet.title,secret:t.refresh_token}]},
 async collect(a){
  const t=await j('https://oauth2.googleapis.com/token',{method:'POST',body:form({client_id:E.GOOGLE_CLIENT_ID,client_secret:E.GOOGLE_CLIENT_SECRET,refresh_token:a.refresh_token,grant_type:'refresh_token'})});
  const g=u=>j('https://www.googleapis.com/youtube/v3/'+u,bearer(t.access_token));
  const up=(await g('channels?part=contentDetails&id='+a.external_id)).items[0].contentDetails.relatedPlaylists.uploads;
  const ids=((await g('playlistItems?part=contentDetails&maxResults=50&playlistId='+up)).items||[]).map(i=>i.contentDetails.videoId).join(',');
  const vs=ids?((await g('videos?part=snippet,statistics&id='+ids)).items||[]):[];
  return{posts:vs.map(v=>({id:v.id,t:clip(v.snippet.title),f:'Video',at:v.snippet.publishedAt,imp:+v.statistics.viewCount||0,eng:(+v.statistics.likeCount||0)+(+v.statistics.commentCount||0)}))}}
};

// ---------- Meta: Facebook Pages and Instagram (media views) ----------
const GV='https://graph.facebook.com/v25.0/';
const meta={
 auth:s=>'https://www.facebook.com/v25.0/dialog/oauth?'+form(E.META_CONFIG_ID?{client_id:E.META_APP_ID,redirect_uri:cb(),state:s,response_type:'code',config_id:E.META_CONFIG_ID}:{client_id:E.META_APP_ID,redirect_uri:cb(),state:s,scope:'pages_show_list,pages_read_engagement,read_insights,instagram_basic,instagram_manage_insights'}),
 async exchange(code,{platform}){
  const t=await j(GV+'oauth/access_token?'+form({client_id:E.META_APP_ID,client_secret:E.META_APP_SECRET,redirect_uri:cb(),code}));
  const l=await j(GV+'oauth/access_token?'+form({grant_type:'fb_exchange_token',client_id:E.META_APP_ID,client_secret:E.META_APP_SECRET,fb_exchange_token:t.access_token}));
  const pg=(await j(GV+'me/accounts?'+form({fields:'id,name,access_token,instagram_business_account{id,username}',limit:'50',access_token:l.access_token}))).data||[];
  return platform==='Facebook'?pg.map(p=>({id:p.id,handle:p.name,secret:p.access_token})):pg.filter(p=>p.instagram_business_account).map(p=>({id:p.instagram_business_account.id,handle:'@'+p.instagram_business_account.username,secret:p.access_token}))}
};
const mg=(a,p)=>j(GV+p+(p.includes('?')?'&':'?')+'access_token='+a.refresh_token);
const Facebook={...meta,async collect(a){
 const d=await mg(a,a.external_id+'/posts?limit=25&fields=id,message,created_time,attachments{media_type},reactions.summary(true).limit(0),comments.summary(true).limit(0),shares');
 return{posts:await Promise.all((d.data||[]).map(async x=>{
  let imp=0;try{imp=val(await mg(a,x.id+'/insights?metric=post_media_view'))}catch{}
  const mt=(x.attachments&&x.attachments.data&&x.attachments.data[0]&&x.attachments.data[0].media_type)||'';
  return{id:x.id,t:clip(x.message),f:mt.startsWith('video')?'Video':mt==='photo'?'Design':mt==='album'?'Carousel':'Text',at:x.created_time,imp,eng:((x.reactions||{}).summary||{}).total_count+((x.comments||{}).summary||{}).total_count+((x.shares||{}).count||0)||0}}))}}};
const Instagram={...meta,async collect(a){
 const d=await mg(a,a.external_id+'/media?limit=25&fields=id,caption,timestamp,media_type,like_count,comments_count');
 return{posts:await Promise.all((d.data||[]).map(async x=>{
  let imp=0;try{imp=val(await mg(a,x.id+'/insights?metric=views'))}catch{}
  return{id:x.id,t:clip(x.caption),f:x.media_type==='VIDEO'?'Video':x.media_type==='CAROUSEL_ALBUM'?'Carousel':'Design',at:x.timestamp,imp,eng:(x.like_count||0)+(x.comments_count||0)}}))}}};

// ---------- LinkedIn (company Pages) ----------
const LH=tk=>({headers:{Authorization:'Bearer '+tk,'LinkedIn-Version':E.LINKEDIN_VERSION||'202606','X-Restli-Protocol-Version':'2.0.0'}});
const LinkedIn={
 auth:s=>'https://www.linkedin.com/oauth/v2/authorization?'+form({response_type:'code',client_id:E.LINKEDIN_CLIENT_ID,redirect_uri:cb(),state:s,scope:'r_organization_social r_organization_admin'}),
 async exchange(code){
  const t=await j('https://www.linkedin.com/oauth/v2/accessToken',{method:'POST',body:form({grant_type:'authorization_code',code,client_id:E.LINKEDIN_CLIENT_ID,client_secret:E.LINKEDIN_CLIENT_SECRET,redirect_uri:cb()})});
  const acl=await j('https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED',LH(t.access_token));
  const secret=t.refresh_token||'AT:'+t.access_token,out=[];
  for(const e of acl.elements||[]){const id=e.organization.split(':').pop();let name='LinkedIn page '+id;
   try{name=(await j('https://api.linkedin.com/rest/organizations/'+id,LH(t.access_token))).localizedName||name}catch{}
   out.push({id,handle:name,secret})}
  return out},
 async collect(a){
  let tk,secret;
  if(a.refresh_token.startsWith('AT:'))tk=a.refresh_token.slice(3);
  else{const t=await j('https://www.linkedin.com/oauth/v2/accessToken',{method:'POST',body:form({grant_type:'refresh_token',refresh_token:a.refresh_token,client_id:E.LINKEDIN_CLIENT_ID,client_secret:E.LINKEDIN_CLIENT_SECRET})});tk=t.access_token;secret=t.refresh_token}
  const urn='urn:li:organization:'+a.external_id;
  const ps=(await j('https://api.linkedin.com/rest/posts?q=author&count=20&author='+enc(urn),LH(tk))).elements||[];
  if(!ps.length)return{posts:[],secret};
  const ids=ps.map(p=>p.id),list=k=>{const v=ids.filter(i=>i.includes(':'+k+':'));return v.length?'&'+(k==='share'?'shares':'ugcPosts')+'=List('+v.map(enc).join(',')+')':''};
  const st=await j('https://api.linkedin.com/rest/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity='+enc(urn)+list('share')+list('ugcPost'),LH(tk));
  const m={};(st.elements||[]).forEach(e=>m[e.share||e.ugcPost]=e.totalShareStatistics||{});
  return{secret,posts:ps.map(p=>{const s=m[p.id]||{},c=p.content||{};
   return{id:p.id,t:clip(p.commentary),f:c.multiImage?'Carousel':c.media?((c.media.id||'').includes('video')?'Video':'Design'):'Text',at:new Date(p.publishedAt||p.createdAt).toISOString(),imp:s.impressionCount||0,eng:(s.likeCount||0)+(s.commentCount||0)+(s.shareCount||0)+(s.clickCount||0)}})}}
};

// ---------- X ----------
const xBasic=()=>({Authorization:'Basic '+Buffer.from(E.X_CLIENT_ID+':'+E.X_CLIENT_SECRET).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'});
const X={
 auth:(s,ctx)=>'https://x.com/i/oauth2/authorize?'+form({response_type:'code',client_id:E.X_CLIENT_ID,redirect_uri:cb(),scope:'tweet.read users.read offline.access',state:s,code_challenge:crypto.createHash('sha256').update(ctx.verifier).digest('base64url'),code_challenge_method:'S256'}),
 async exchange(code,{verifier}){
  const t=await j('https://api.x.com/2/oauth2/token',{method:'POST',headers:xBasic(),body:form({code,grant_type:'authorization_code',client_id:E.X_CLIENT_ID,redirect_uri:cb(),code_verifier:verifier})});
  const me=(await j('https://api.x.com/2/users/me',bearer(t.access_token))).data;
  return[{id:me.id,handle:'@'+me.username,secret:t.refresh_token}]},
 async collect(a){
  const t=await j('https://api.x.com/2/oauth2/token',{method:'POST',headers:xBasic(),body:form({refresh_token:a.refresh_token,grant_type:'refresh_token',client_id:E.X_CLIENT_ID})});
  const d=await j('https://api.x.com/2/users/'+a.external_id+'/tweets?max_results=50&exclude=retweets,replies&tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=type',bearer(t.access_token));
  const mt={};((d.includes||{}).media||[]).forEach(m=>mt[m.media_key]=m.type);
  return{secret:t.refresh_token,posts:(d.data||[]).map(x=>{const k=(x.attachments||{}).media_keys||[],m=x.public_metrics;
   return{id:x.id,t:clip(x.text),f:k.length>1?'Carousel':k.length?(mt[k[0]]==='photo'?'Design':'Video'):'Text',at:x.created_at,imp:m.impression_count||0,eng:m.like_count+m.reply_count+m.retweet_count+m.quote_count}})}}
};

// ---------- TikTok ----------
const TT='https://open.tiktokapis.com/v2/';
const TikTok={
 auth:s=>'https://www.tiktok.com/v2/auth/authorize/?'+form({client_key:E.TIKTOK_CLIENT_KEY,scope:'user.info.basic,video.list',response_type:'code',redirect_uri:cb(),state:s}),
 async exchange(code){
  const t=await j(TT+'oauth/token/',{method:'POST',body:form({client_key:E.TIKTOK_CLIENT_KEY,client_secret:E.TIKTOK_CLIENT_SECRET,code,grant_type:'authorization_code',redirect_uri:cb()})});
  const u=await j(TT+'user/info/?fields=display_name',bearer(t.access_token));
  return[{id:t.open_id,handle:u.data.user.display_name,secret:t.refresh_token}]},
 async collect(a){
  const t=await j(TT+'oauth/token/',{method:'POST',body:form({client_key:E.TIKTOK_CLIENT_KEY,client_secret:E.TIKTOK_CLIENT_SECRET,grant_type:'refresh_token',refresh_token:a.refresh_token})});
  const d=await j(TT+'video/list/?fields=id,title,create_time,view_count,like_count,comment_count,share_count',{method:'POST',headers:{Authorization:'Bearer '+t.access_token,'Content-Type':'application/json'},body:JSON.stringify({max_count:20})});
  return{secret:t.refresh_token,posts:((d.data||{}).videos||[]).map(v=>({id:v.id,t:clip(v.title),f:'Video',at:new Date(v.create_time*1000).toISOString(),imp:v.view_count||0,eng:(v.like_count||0)+(v.comment_count||0)+(v.share_count||0)}))}}
};
export const P={YouTube,Facebook,Instagram,LinkedIn,X,TikTok};
