import {sql,guard} from './_lib.js';
export default async function h(req,res){const u=await guard(req,res);if(!u)return;
 if(req.method==='DELETE')await sql`delete from accounts where id=${req.query.id} and brand_id in (select id from brands where ${u.is_admin}::boolean or user_id=${u.id})`;
 res.json({ok:true})}
