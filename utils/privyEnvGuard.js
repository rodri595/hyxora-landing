// A Privy session belongs to one Privy *app*, and Privy stores it under keys
// that carry no app id: `privy:token`, `privy:refresh_token`, the `privy-*`
// cookies. Point the provider at a different app id — swapping the dev and prod
// `NEXT_PUBLIC_PRIVY_APP_ID`, which is the same swap that keeps our privyIds
// matching the backend's — and the SDK boots holding credentials the new app
// has never issued. It answers that by trying to end the session, the logout
// 400s because the refresh token is another app's, and it tries again: the
// burst of `/api/v1/sessions/logout` that ends in 429 and rate-limits the user
// out of a login they could otherwise have made.
//
// So the stale state has to be gone *before* the SDK reads it. This ships as a
// blocking inline script in <head> rather than an effect for exactly that
// reason — by the time React mounts, Privy has already read storage.
//
// Two independent signals, because neither covers the case alone:
//
//   - the **audience of the stored token**. Privy access tokens are JWTs whose
//     `aud` is the app id that minted them, so a mismatch is proof, and it
//     needs no prior visit to detect. This is what rescues everyone already
//     holding a dev token the first time this ships.
//   - the **recorded fingerprint** of the last env this browser saw. Covers the
//     tokenless case — an expired access token with a live refresh token reads
//     as nothing at all — from the second load onwards.
//
// Only an app-id change clears Privy's own state; a backend URL change clears
// just our session artifacts, since logging everyone out of Privy over it would
// be a far bigger hammer than the problem.

const FINGERPRINT_KEY = "hyxora:privy-env";

// Written by `useSessionSync`, and worth clearing with the rest: a ban earned
// against the old environment is not one the new one should be serving.
const BAN_STORAGE_KEY = "hyxora:login-ban";

// The backend session minted from the old Privy identity (dev only — in prod it
// is an HttpOnly cookie the gateway owns).
const SESSION_JWT_KEY = "jwt";

/**
 * Source for the inline <head> script. Values are baked in at build time, so
 * this is a server-side call whose output is a string of ES5 — no bundling, no
 * imports, nothing that can throw before the app loads.
 *
 * @return {string}
 */
export const privyEnvGuardScript = () => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
  const apiBase = process.env.NEXT_PUBLIC_HYXORA_API ?? "";
  const fingerprint = `${appId}|${apiBase}`;

  return `(function(){
var FP=${JSON.stringify(FINGERPRINT_KEY)},APP=${JSON.stringify(appId)},FINGERPRINT=${JSON.stringify(fingerprint)};
var BAN=${JSON.stringify(BAN_STORAGE_KEY)},JWT=${JSON.stringify(SESSION_JWT_KEY)};
function store(name){try{return window[name]}catch(e){return null}}
function get(s,k){try{return s&&s.getItem(k)}catch(e){return null}}
function del(s,k){try{s&&s.removeItem(k)}catch(e){}}
function isPrivy(k){return typeof k==="string"&&k.indexOf("privy")===0}
function clearPrivy(){
  var stores=[store("localStorage"),store("sessionStorage")];
  for(var i=0;i<stores.length;i++){
    var s=stores[i];if(!s)continue;
    var keys=[];try{for(var j=0;j<s.length;j++)keys.push(s.key(j))}catch(e){}
    for(var k=0;k<keys.length;k++)if(isPrivy(keys[k]))del(s,keys[k]);
  }
  var host=location.hostname,domains=["",host,"."+host],parts=host.split(".");
  if(parts.length>2)domains.push("."+parts.slice(-2).join("."));
  var cookies=(document.cookie||"").split(";");
  for(var c=0;c<cookies.length;c++){
    var name=cookies[c].split("=")[0].trim();
    if(!isPrivy(name))continue;
    for(var d=0;d<domains.length;d++){
      document.cookie=name+"=; Max-Age=0; path=/"+(domains[d]?"; domain="+domains[d]:"");
    }
  }
}
// The app id that minted the session we are holding, or null when nothing
// readable is stored. Both token kinds are JWTs; the refresh token is opaque.
function audience(){
  var ls=store("localStorage"),raw=get(ls,"privy:token")||get(ls,"privy:id_token");
  if(!raw){
    var m=(document.cookie||"").match(/(?:^|;\s*)privy-(?:id-)?token=([^;]+)/);
    raw=m?decodeURIComponent(m[1]):null;
  }
  if(!raw)return null;
  raw=raw.replace(/^"|"$/g,"");
  var seg=raw.split(".");
  if(seg.length<3)return null;
  try{
    var b64=seg[1].replace(/-/g,"+").replace(/_/g,"/");
    while(b64.length%4)b64+="=";
    var aud=JSON.parse(atob(b64)).aud;
    if(Object.prototype.toString.call(aud)==="[object Array]")aud=aud[0];
    return typeof aud==="string"&&aud?aud:null;
  }catch(e){return null}
}
var ls=store("localStorage");
if(!ls)return;
var previous=get(ls,FP);
var previousApp=previous===null?null:previous.split("|")[0];
var aud=audience();
var foreignToken=!!APP&&aud!==null&&aud!==APP;
var appChanged=previousApp!==null&&previousApp!==APP;
if(previous===FINGERPRINT&&!foreignToken)return;
if(foreignToken||appChanged)clearPrivy();
del(ls,BAN);
del(store("sessionStorage"),JWT);
try{ls.setItem(FP,FINGERPRINT)}catch(e){}
})();`;
};
