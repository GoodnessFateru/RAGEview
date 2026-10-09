import crypto from 'crypto';
import {guard} from './_lib.js';
import {P} from './_platforms.js';
export default function h(req,res){if(!guard(req,res))return;
 const pl=req.query.platform,p=P[pl];if(!p)return res.redirect('/?error='+encodeURIComponent('Unknown platform'));
 const ctx={verifier:crypto.randomBytes(32).toString('base64url')};
 const url=p.auth(pl+'.'+req.query.brand,ctx);
 res.setHeader('Set-Cookie',`pk=${ctx.verifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
 res.redirect(url)}
