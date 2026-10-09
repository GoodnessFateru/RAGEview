import {setSession} from './_lib.js';
export default function h(req,res){const p=req.body&&req.body.password;
 if(p&&p===process.env.APP_PASSWORD){setSession(res);return res.json({ok:true})}
 res.status(401).json({error:'bad password'})}
