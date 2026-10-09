import {guard,BASE} from './_lib.js';
export default function h(req,res){if(!guard(req,res))return;
 const u=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:BASE()+'/api/callback',response_type:'code',access_type:'offline',prompt:'consent',scope:'https://www.googleapis.com/auth/youtube.readonly',state:String(req.query.brand)});
 res.redirect('https://accounts.google.com/o/oauth2/v2/auth?'+u)}
