import {clearSession} from './_lib.js';
export default function h(req,res){clearSession(res);res.json({ok:true})}
