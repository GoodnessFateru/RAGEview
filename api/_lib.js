import {neon} from '@neondatabase/serverless';
import crypto from 'crypto';
export const sql=neon(process.env.DATABASE_URL);
const sign=v=>crypto.createHmac('sha256',process.env.SESSION_SECRET).update(v).digest('hex');
export const setSession=res=>res.setHeader('Set-Cookie',`rv=${sign('ok')}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
export const authed=req=>{const c=(req.headers.cookie||'').match(/rv=([a-f0-9]+)/);return !!c&&c[1]===sign('ok')};
export const guard=(req,res)=>authed(req)||(res.status(401).json({error:'login'}),false);
export const BASE=()=>process.env.BASE_URL;
