import {sql,guard} from './_lib.js';
export default async function h(req,res){if(!guard(req,res))return;
 if(req.method==='DELETE')await sql`delete from accounts where id=${req.query.id}`;
 res.json({ok:true})}
