import {sql,guard} from './_lib.js';
export default async function h(req,res){if(!guard(req,res))return;
 if(!(await sql`select 1 from brands limit 1`).length)await sql`insert into brands(name) values('Your first brand')`;
 const n=new Date(),start=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),1));
 const brands=await sql`select id,name from brands order by id`;
 const accounts=await sql`select id,brand_id,platform,handle,status from accounts order by id`;
 const posts=await sql`select a.brand_id,a.platform as pl,a.handle as a,extract(day from p.published_at)::int as d,p.kind as ty,p.format as f,p.title as t,p.impressions as imp,p.engagements as eng from posts p join accounts a on a.id=p.account_id where p.published_at>=${start}`;
 res.json({brands,accounts,posts})}
