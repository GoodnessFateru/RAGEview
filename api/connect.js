import crypto from 'crypto';
import {sql,guard} from './_lib.js';
import {P} from './_platforms.js';
export default async function h(req,res){const u=await guard(req,res);if(!u)return;
 const pl=req.query.platform,p=P[pl];if(!p)return res.redirect('/?error='+encodeURIComponent('Unknown platform'));
 if(!(await sql`select 1 from brands where id=${req.query.brand} and (${u.is_admin}::boolean or user_id=${u.id})`).length)return res.redirect('/?error='+encodeURIComponent('That brand is not yours'));
 const ctx={verifier:crypto.randomBytes(32).toString('base64url')};
 res.setHeader('Set-Cookie',`pk=${ctx.verifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
 res.redirect(p.auth(pl+'.'+req.query.brand,ctx))}
