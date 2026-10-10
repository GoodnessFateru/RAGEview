import {sql,setSession,hash} from './_lib.js';
export default async function h(req,res){const {email,password}=req.body||{},e=String(email||'').trim().toLowerCase();
 if(!/^\S+@\S+\.\S+$/.test(e)||String(password||'').length<8)return res.status(400).json({error:'Enter a valid email and a password of at least 8 characters.'});
 if((await sql`select 1 from users where email=${e}`).length)return res.status(409).json({error:'That email already has an account. Sign in instead.'});
 const admin=!!process.env.ADMIN_EMAIL&&e===process.env.ADMIN_EMAIL.trim().toLowerCase();
 const r=await sql`insert into users(email,pass_hash,is_admin) values(${e},${hash(String(password))},${admin}) returning id`;
 setSession(res,r[0].id);res.json({ok:true})}
