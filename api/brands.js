import {sql,guard} from './_lib.js';
export default async function h(req,res){const u=await guard(req,res);if(!u)return;const b=req.body||{};
 if(req.method==='POST')await sql`insert into brands(name,user_id) values(${String(b.name||'').slice(0,80)},${u.id})`;
 else if(req.method==='PATCH')await sql`update brands set name=${String(b.name||'').slice(0,80)} where id=${b.id} and (${u.is_admin}::boolean or user_id=${u.id})`;
 else if(req.method==='DELETE'){const id=req.query.id;
  if((await sql`select count(*)::int as c from brands where user_id=(select user_id from brands where id=${id})`)[0].c<2)return res.status(400).json({error:'Keep at least one brand'});
  await sql`delete from brands where id=${id} and (${u.is_admin}::boolean or user_id=${u.id})`}
 res.json({ok:true})}
