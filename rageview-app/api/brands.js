import {sql,guard} from './_lib.js';
export default async function h(req,res){if(!guard(req,res))return;const b=req.body||{};
 if(req.method==='POST')await sql`insert into brands(name) values(${b.name})`;
 else if(req.method==='PATCH')await sql`update brands set name=${b.name} where id=${b.id}`;
 else if(req.method==='DELETE'){
  if((await sql`select count(*)::int as c from brands`)[0].c<2)return res.status(400).json({error:'Keep at least one brand'});
  await sql`delete from brands where id=${req.query.id}`}
 res.json({ok:true})}
