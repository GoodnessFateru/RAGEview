import {guard} from './_lib.js';
export default async function h(req,res){const u=await guard(req,res);if(!u)return;
 if(!u.is_admin)return res.status(403).json({error:'admin only'});
 const keys=['BASE_URL','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','META_APP_ID','META_APP_SECRET','META_CONFIG_ID','LINKEDIN_CLIENT_ID','LINKEDIN_CLIENT_SECRET','X_CLIENT_ID','X_CLIENT_SECRET','TIKTOK_CLIENT_KEY','TIKTOK_CLIENT_SECRET'],out={};
 for(const k of keys){const v=process.env[k];
  if(v==null){out[k]='NOT SET';continue}
  const flags=(v!==v.trim()?' HAS SPACES AT THE ENDS.':'')+(/^["']|["']$/.test(v)?' HAS QUOTATION MARKS.':'');
  out[k]=(k.includes('SECRET')?'(hidden)':k==='BASE_URL'?v:v.slice(0,4)+'...'+v.slice(-3))+' length '+v.length+'.'+flags}
 res.json(out)}
