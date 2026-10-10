import {neon} from '@neondatabase/serverless';
import crypto from 'crypto';
export const sql=neon(process.env.DATABASE_URL);
const sign=v=>crypto.createHmac('sha256',process.env.SESSION_SECRET).update(v).digest('hex');
export const setSession=(res,uid)=>res.setHeader('Set-Cookie',`rv=${uid}.${sign(String(uid))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
export const clearSession=res=>res.setHeader('Set-Cookie','rv=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
export async function user(req){const m=(req.headers.cookie||'').match(/rv=(\d+)\.([a-f0-9]+)/);
 if(!m||m[2]!==sign(m[1]))return null;
 const r=await sql`select id,email,is_admin from users where id=${m[1]}`;return r[0]||null}
export async function guard(req,res){const u=await user(req);if(!u)res.status(401).json({error:'login'});return u}
export const BASE=()=>process.env.BASE_URL;
export const hash=(pw,salt=crypto.randomBytes(16).toString('hex'))=>salt+':'+crypto.scryptSync(pw,salt,64).toString('hex');
export const check=(pw,h)=>{const [s,x]=h.split(':'),y=hash(pw,s).split(':')[1];return crypto.timingSafeEqual(Buffer.from(x),Buffer.from(y))};
