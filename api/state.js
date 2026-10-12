import {sql,guard} from './_lib.js';
export default async function h(req,res){const u=await guard(req,res);if(!u)return;
 if(!(await sql`select 1 from brands where user_id=${u.id} limit 1`).length)await sql`insert into brands(name,user_id) values('Your first brand',${u.id})`;
 const n=new Date(),start=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),1));
 const brands=await sql`select b.id,b.name,o.email as owner from brands b join users o on o.id=b.user_id where ${u.is_admin}::boolean or b.user_id=${u.id} order by b.id`;
 const accounts=await sql`select a.id,a.brand_id,a.platform,a.handle,a.status from accounts a join brands b on b.id=a.brand_id where ${u.is_admin}::boolean or b.user_id=${u.id} order by a.id`;
 const posts=await sql`select a.brand_id,a.platform as pl,a.handle as a,extract(day from p.published_at)::int as d,p.kind as ty,p.format as f,p.title as t,p.impressions as imp,p.engagements as eng,p.likes as lk,p.comments as cm,p.shares as sh from posts p join accounts a on a.id=p.account_id join brands b on b.id=a.brand_id where p.published_at>=${start} and (${u.is_admin}::boolean or b.user_id=${u.id})`;
 res.json({brands,accounts,posts,me:{email:u.email,admin:u.is_admin}})}
