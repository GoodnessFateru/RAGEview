import {sql,setSession,check} from './_lib.js';
export default async function h(req,res){const {email,password}=req.body||{};
 const r=await sql`select id,pass_hash from users where email=${String(email||'').trim().toLowerCase()}`;
 if(!r.length||!check(String(password||''),r[0].pass_hash))return res.status(401).json({error:'Wrong email or password.'});
 setSession(res,r[0].id);res.json({ok:true})}
