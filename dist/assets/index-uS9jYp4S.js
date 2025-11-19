(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const l of a)if(l.type==="childList")for(const u of l.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function t(a){const l={};return a.integrity&&(l.integrity=a.integrity),a.referrerPolicy&&(l.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?l.credentials="include":a.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(a){if(a.ep)return;a.ep=!0;const l=t(a);fetch(a.href,l)}})();const Pc=!1;var Rf=Array.isArray,Lh=Array.prototype.indexOf,Pf=Array.from,Fh=Object.defineProperty,wa=Object.getOwnPropertyDescriptor,hd=Object.getOwnPropertyDescriptors,Ih=Object.prototype,Uh=Array.prototype,Df=Object.getPrototypeOf,tu=Object.isExtensible;function Nh(n){return n()}function Dc(n){for(var e=0;e<n.length;e++)n[e]()}function pd(){var n,e,t=new Promise((r,a)=>{n=r,e=a});return{promise:t,resolve:n,reject:e}}const mn=2,md=4,ks=8,jr=16,Kr=32,Yi=64,Bs=128,pr=512,xn=1024,Un=2048,Zr=4096,Vn=8192,Vr=16384,Lf=32768,Pa=65536,nu=1<<17,_d=1<<18,Oa=1<<19,gd=1<<20,Wi=32768,Lc=1<<21,Ff=1<<22,vi=1<<23,Ta=Symbol("$state"),Oh=Symbol("legacy props"),Ea=new class extends Error{name="StaleReactionError";message="The reaction that called `getAbortSignal()` was re-run or destroyed"};function vd(n){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function kh(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function Bh(n){throw new Error("https://svelte.dev/e/effect_in_teardown")}function zh(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function Gh(n){throw new Error("https://svelte.dev/e/effect_orphan")}function Hh(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function Vh(n){throw new Error("https://svelte.dev/e/props_invalid_value")}function Wh(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function Xh(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function $h(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function qh(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}const Yh=1,jh=2,Kh=16,Zh=2,Jh=8,Qh=2,vn=Symbol(),ep="http://www.w3.org/1999/xhtml";function tp(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}function xd(n){return n===this.v}function np(n,e){return n!=n?e==e:n!==e||n!==null&&typeof n=="object"||typeof n=="function"}function yd(n){return!np(n,this.v)}let ka=!1,rp=!1;function ip(){ka=!0}let Kt=null;function Da(n){Kt=n}function If(n,e=!1,t){Kt={p:Kt,i:!1,c:null,e:null,s:n,x:null,l:ka&&!e?{s:null,u:null,$:[]}:null}}function Uf(n){var e=Kt,t=e.e;if(t!==null){e.e=null;for(var r of t)Nd(r)}return e.i=!0,Kt=e.p,{}}function Mo(){return!ka||Kt!==null&&Kt.l===null}let zi=[];function Sd(){var n=zi;zi=[],Dc(n)}function zs(n){if(zi.length===0&&!fo){var e=zi;queueMicrotask(()=>{e===zi&&Sd()})}zi.push(n)}function ap(){for(;zi.length>0;)Sd()}function bd(n){var e=Ft;if(e===null)return Ct.f|=vi,n;if((e.f&Lf)===0){if((e.f&Bs)===0)throw n;e.b.error(n)}else La(n,e)}function La(n,e){for(;e!==null;){if((e.f&Bs)!==0)try{e.b.error(n);return}catch(t){n=t}e=e.parent}throw n}const Jo=new Set;let Vt=null,ws=null,Gn=null,jn=[],Gs=null,Fc=!1,fo=!1;class Mr{committed=!1;current=new Map;previous=new Map;#e=new Set;#t=new Set;#r=0;#n=0;#l=null;#a=[];#i=[];skipped_effects=new Set;is_fork=!1;is_deferred(){return this.is_fork||this.#n>0}process(e){jn=[],ws=null,this.apply();var t={parent:null,effect:null,effects:[],render_effects:[],block_effects:[]};for(const r of e)this.#o(r,t);this.is_fork||this.#f(),this.is_deferred()?(this.#s(t.effects),this.#s(t.render_effects),this.#s(t.block_effects)):(ws=this,Vt=null,ru(t.render_effects),ru(t.effects),ws=null,this.#l?.resolve()),Gn=null}#o(e,t){e.f^=xn;for(var r=e.first;r!==null;){var a=r.f,l=(a&(Kr|Yi))!==0,u=l&&(a&xn)!==0,o=u||(a&Vn)!==0||this.skipped_effects.has(r);if((r.f&Bs)!==0&&r.b?.is_pending()&&(t={parent:t,effect:r,effects:[],render_effects:[],block_effects:[]}),!o&&r.fn!==null){l?r.f^=xn:(a&md)!==0?t.effects.push(r):wo(r)&&((r.f&jr)!==0&&t.block_effects.push(r),mo(r));var p=r.first;if(p!==null){r=p;continue}}var m=r.parent;for(r=r.next;r===null&&m!==null;)m===t.effect&&(this.#s(t.effects),this.#s(t.render_effects),this.#s(t.block_effects),t=t.parent),r=m.next,m=m.parent}}#s(e){for(const t of e)((t.f&Un)!==0?this.#a:this.#i).push(t),this.#c(t.deps),yn(t,xn)}#c(e){if(e!==null)for(const t of e)(t.f&mn)===0||(t.f&Wi)===0||(t.f^=Wi,this.#c(t.deps))}capture(e,t){this.previous.has(e)||this.previous.set(e,t),(e.f&vi)===0&&(this.current.set(e,e.v),Gn?.set(e,e.v))}activate(){Vt=this,this.apply()}deactivate(){Vt===this&&(Vt=null,Gn=null)}flush(){if(this.activate(),jn.length>0){if(Ed(),Vt!==null&&Vt!==this)return}else this.#r===0&&this.process([]);this.deactivate()}discard(){for(const e of this.#t)e(this);this.#t.clear()}#f(){if(this.#n===0){for(const e of this.#e)e();this.#e.clear()}this.#r===0&&this.#u()}#u(){if(Jo.size>1){this.previous.clear();var e=Gn,t=!0,r={parent:null,effect:null,effects:[],render_effects:[],block_effects:[]};for(const l of Jo){if(l===this){t=!1;continue}const u=[];for(const[p,m]of this.current){if(l.current.has(p))if(t&&m!==l.current.get(p))l.current.set(p,m);else continue;u.push(p)}if(u.length===0)continue;const o=[...l.current.keys()].filter(p=>!this.current.has(p));if(o.length>0){var a=jn;jn=[];const p=new Set,m=new Map;for(const g of u)Md(g,o,p,m);if(jn.length>0){Vt=l,l.apply();for(const g of jn)l.#o(g,r);l.deactivate()}jn=a}}Vt=null,Gn=e}this.committed=!0,Jo.delete(this)}increment(e){this.#r+=1,e&&(this.#n+=1)}decrement(e){this.#r-=1,e&&(this.#n-=1),this.revive()}revive(){for(const e of this.#a)yn(e,Un),Xi(e);for(const e of this.#i)yn(e,Zr),Xi(e);this.#a=[],this.#i=[],this.flush()}oncommit(e){this.#e.add(e)}ondiscard(e){this.#t.add(e)}settled(){return(this.#l??=pd()).promise}static ensure(){if(Vt===null){const e=Vt=new Mr;Jo.add(Vt),fo||Mr.enqueue(()=>{Vt===e&&e.flush()})}return Vt}static enqueue(e){zs(e)}apply(){}}function op(n){var e=fo;fo=!0;try{for(var t;;){if(ap(),jn.length===0&&(Vt?.flush(),jn.length===0))return Gs=null,t;Ed()}}finally{fo=e}}function Ed(){var n=yi;Fc=!0;var e=null;try{var t=0;for(Fs(!0);jn.length>0;){var r=Mr.ensure();if(t++>1e3){var a,l;sp()}r.process(jn),xi.clear()}}finally{Fc=!1,Fs(n),Gs=null}}function sp(){try{Hh()}catch(n){La(n,Gs)}}let zr=null;function ru(n){var e=n.length;if(e!==0){for(var t=0;t<e;){var r=n[t++];if((r.f&(Vr|Vn))===0&&wo(r)&&(zr=new Set,mo(r),r.deps===null&&r.first===null&&r.nodes_start===null&&(r.teardown===null&&r.ac===null?zd(r):r.fn=null),zr?.size>0)){xi.clear();for(const a of zr){if((a.f&(Vr|Vn))!==0)continue;const l=[a];let u=a.parent;for(;u!==null;)zr.has(u)&&(zr.delete(u),l.push(u)),u=u.parent;for(let o=l.length-1;o>=0;o--){const p=l[o];(p.f&(Vr|Vn))===0&&mo(p)}}zr.clear()}}zr=null}}function Md(n,e,t,r){if(!t.has(n)&&(t.add(n),n.reactions!==null))for(const a of n.reactions){const l=a.f;(l&mn)!==0?Md(a,e,t,r):(l&(Ff|jr))!==0&&(l&Un)===0&&wd(a,e,r)&&(yn(a,Un),Xi(a))}}function wd(n,e,t){const r=t.get(n);if(r!==void 0)return r;if(n.deps!==null)for(const a of n.deps){if(e.includes(a))return!0;if((a.f&mn)!==0&&wd(a,e,t))return t.set(a,!0),!0}return t.set(n,!1),!1}function Xi(n){for(var e=Gs=n;e.parent!==null;){e=e.parent;var t=e.f;if(Fc&&e===Ft&&(t&jr)!==0&&(t&_d)===0)return;if((t&(Yi|Kr))!==0){if((t&xn)===0)return;e.f^=xn}}jn.push(e)}function lp(n){let e=0,t=$i(0),r;return()=>{Ws()&&(He(t),Od(()=>(e===0&&(r=wn(()=>n(()=>uo(t)))),e+=1,()=>{zs(()=>{e-=1,e===0&&(r?.(),r=void 0,uo(t))})})))}}var cp=Pa|Oa|Bs;function fp(n,e,t){new up(n,e,t)}class up{parent;#e=!1;#t;#r=null;#n;#l;#a;#i=null;#o=null;#s=null;#c=null;#f=null;#u=0;#d=0;#p=!1;#h=null;#x=lp(()=>(this.#h=$i(this.#u),()=>{this.#h=null}));constructor(e,t,r){this.#t=e,this.#n=t,this.#l=r,this.parent=Ft.b,this.#e=!!this.#n.pending,this.#a=Bf(()=>{Ft.b=this;{var a=this.#g();try{this.#i=Kn(()=>r(a))}catch(l){this.error(l)}this.#d>0?this.#_():this.#e=!1}return()=>{this.#f?.remove()}},cp)}#y(){try{this.#i=Kn(()=>this.#l(this.#t))}catch(e){this.error(e)}this.#e=!1}#S(){const e=this.#n.pending;e&&(this.#o=Kn(()=>e(this.#t)),Mr.enqueue(()=>{var t=this.#g();this.#i=this.#m(()=>(Mr.ensure(),Kn(()=>this.#l(t)))),this.#d>0?this.#_():(Aa(this.#o,()=>{this.#o=null}),this.#e=!1)}))}#g(){var e=this.#t;return this.#e&&(this.#f=qi(),this.#t.before(this.#f),e=this.#f),e}is_pending(){return this.#e||!!this.parent&&this.parent.is_pending()}has_pending_snippet(){return!!this.#n.pending}#m(e){var t=Ft,r=Ct,a=Kt;Cr(this.#a),Ln(this.#a),Da(this.#a.ctx);try{return e()}catch(l){return bd(l),null}finally{Cr(t),Ln(r),Da(a)}}#_(){const e=this.#n.pending;this.#i!==null&&(this.#c=document.createDocumentFragment(),this.#c.append(this.#f),Vd(this.#i,this.#c)),this.#o===null&&(this.#o=Kn(()=>e(this.#t)))}#v(e){if(!this.has_pending_snippet()){this.parent&&this.parent.#v(e);return}this.#d+=e,this.#d===0&&(this.#e=!1,this.#o&&Aa(this.#o,()=>{this.#o=null}),this.#c&&(this.#t.before(this.#c),this.#c=null))}update_pending_count(e){this.#v(e),this.#u+=e,this.#h&&ho(this.#h,this.#u)}get_effect_pending(){return this.#x(),He(this.#h)}error(e){var t=this.#n.onerror;let r=this.#n.failed;if(this.#p||!t&&!r)throw e;this.#i&&(Fn(this.#i),this.#i=null),this.#o&&(Fn(this.#o),this.#o=null),this.#s&&(Fn(this.#s),this.#s=null);var a=!1,l=!1;const u=()=>{if(a){tp();return}a=!0,l&&qh(),Mr.ensure(),this.#u=0,this.#s!==null&&Aa(this.#s,()=>{this.#s=null}),this.#e=this.has_pending_snippet(),this.#i=this.#m(()=>(this.#p=!1,Kn(()=>this.#l(this.#t)))),this.#d>0?this.#_():this.#e=!1};var o=Ct;try{Ln(null),l=!0,t?.(e,u),l=!1}catch(p){La(p,this.#a&&this.#a.parent)}finally{Ln(o)}r&&zs(()=>{this.#s=this.#m(()=>{Mr.ensure(),this.#p=!0;try{return Kn(()=>{r(this.#t,()=>e,()=>u)})}catch(p){return La(p,this.#a.parent),null}finally{this.#p=!1}})})}}function dp(n,e,t,r){const a=Mo()?Nf:Of;if(t.length===0&&n.length===0){r(e.map(a));return}var l=Vt,u=Ft,o=hp();function p(){Promise.all(t.map(m=>pp(m))).then(m=>{o();try{r([...e.map(a),...m])}catch(g){(u.f&Vr)===0&&La(g,u)}l?.deactivate(),Ds()}).catch(m=>{La(m,u)})}n.length>0?Promise.all(n).then(()=>{o();try{return p()}finally{l?.deactivate(),Ds()}}):p()}function hp(){var n=Ft,e=Ct,t=Kt,r=Vt;return function(l=!0){Cr(n),Ln(e),Da(t),l&&r?.activate()}}function Ds(){Cr(null),Ln(null),Da(null)}function Nf(n){var e=mn|Un,t=Ct!==null&&(Ct.f&mn)!==0?Ct:null;return Ft!==null&&(Ft.f|=Oa),{ctx:Kt,deps:null,effects:null,equals:xd,f:e,fn:n,reactions:null,rv:0,v:vn,wv:0,parent:t??Ft,ac:null}}function pp(n,e){let t=Ft;t===null&&kh();var r=t.b,a=void 0,l=$i(vn),u=!Ct,o=new Map;return Mp(()=>{var p=pd();a=p.promise;try{Promise.resolve(n()).then(p.resolve,p.reject).then(()=>{m===Vt&&m.committed&&m.deactivate(),Ds()})}catch(y){p.reject(y),Ds()}var m=Vt;if(u){var g=!r.is_pending();r.update_pending_count(1),m.increment(g),o.get(m)?.reject(Ea),o.delete(m),o.set(m,p)}const x=(y,S=void 0)=>{if(m.activate(),S)S!==Ea&&(l.f|=vi,ho(l,S));else{(l.f&vi)!==0&&(l.f^=vi),ho(l,y);for(const[T,L]of o){if(o.delete(T),T===m)break;L.reject(Ea)}}u&&(r.update_pending_count(-1),m.decrement(g))};p.promise.then(x,y=>x(null,y||"unknown"))}),Ud(()=>{for(const p of o.values())p.reject(Ea)}),new Promise(p=>{function m(g){function x(){g===a?p(l):m(a)}g.then(x,x)}m(a)})}function Of(n){const e=Nf(n);return e.equals=yd,e}function Td(n){var e=n.effects;if(e!==null){n.effects=null;for(var t=0;t<e.length;t+=1)Fn(e[t])}}function mp(n){for(var e=n.parent;e!==null;){if((e.f&mn)===0)return(e.f&Vr)===0?e:null;e=e.parent}return null}function kf(n){var e,t=Ft;Cr(mp(n));try{n.f&=~Wi,Td(n),e=qd(n)}finally{Cr(t)}return e}function Ad(n){var e=kf(n);if(n.equals(e)||(n.v=e,n.wv=Xd()),!ji)if(Gn!==null)Ws()&&Gn.set(n,n.v);else{var t=(n.f&pr)===0?Zr:xn;yn(n,t)}}let Ic=new Set;const xi=new Map;let Cd=!1;function $i(n,e){var t={f:0,v:n,reactions:null,equals:xd,rv:0,wv:0};return t}function ci(n,e){const t=$i(n);return Ap(t),t}function Sr(n,e=!1,t=!0){const r=$i(n);return e||(r.equals=yd),ka&&t&&Kt!==null&&Kt.l!==null&&(Kt.l.s??=[]).push(r),r}function At(n,e,t=!1){Ct!==null&&(!wr||(Ct.f&nu)!==0)&&Mo()&&(Ct.f&(mn|jr|Ff|nu))!==0&&!Wr?.includes(n)&&$h();let r=t?Ma(e):e;return ho(n,r)}function ho(n,e){if(!n.equals(e)){var t=n.v;ji?xi.set(n,e):xi.set(n,t),n.v=e;var r=Mr.ensure();r.capture(n,t),(n.f&mn)!==0&&((n.f&Un)!==0&&kf(n),yn(n,(n.f&pr)!==0?xn:Zr)),n.wv=Xd(),Rd(n,Un),Mo()&&Ft!==null&&(Ft.f&xn)!==0&&(Ft.f&(Kr|Yi))===0&&(Yn===null?Cp([n]):Yn.push(n)),!r.is_fork&&Ic.size>0&&!Cd&&_p()}return e}function _p(){Cd=!1;var n=yi;Fs(!0);const e=Array.from(Ic);try{for(const t of e)(t.f&xn)!==0&&yn(t,Zr),wo(t)&&mo(t)}finally{Fs(n)}Ic.clear()}function uo(n){At(n,n.v+1)}function Rd(n,e){var t=n.reactions;if(t!==null)for(var r=Mo(),a=t.length,l=0;l<a;l++){var u=t[l],o=u.f;if(!(!r&&u===Ft)){var p=(o&Un)===0;if(p&&yn(u,e),(o&mn)!==0){var m=u;Gn?.delete(m),(o&Wi)===0&&(o&pr&&(u.f|=Wi),Rd(m,Zr))}else p&&((o&jr)!==0&&zr!==null&&zr.add(u),Xi(u))}}}function Ma(n){if(typeof n!="object"||n===null||Ta in n)return n;const e=Df(n);if(e!==Ih&&e!==Uh)return n;var t=new Map,r=Rf(n),a=ci(0),l=Hi,u=o=>{if(Hi===l)return o();var p=Ct,m=Hi;Ln(null),su(l);var g=o();return Ln(p),su(m),g};return r&&t.set("length",ci(n.length)),new Proxy(n,{defineProperty(o,p,m){(!("value"in m)||m.configurable===!1||m.enumerable===!1||m.writable===!1)&&Wh();var g=t.get(p);return g===void 0?g=u(()=>{var x=ci(m.value);return t.set(p,x),x}):At(g,m.value,!0),!0},deleteProperty(o,p){var m=t.get(p);if(m===void 0){if(p in o){const g=u(()=>ci(vn));t.set(p,g),uo(a)}}else At(m,vn),uo(a);return!0},get(o,p,m){if(p===Ta)return n;var g=t.get(p),x=p in o;if(g===void 0&&(!x||wa(o,p)?.writable)&&(g=u(()=>{var S=Ma(x?o[p]:vn),T=ci(S);return T}),t.set(p,g)),g!==void 0){var y=He(g);return y===vn?void 0:y}return Reflect.get(o,p,m)},getOwnPropertyDescriptor(o,p){var m=Reflect.getOwnPropertyDescriptor(o,p);if(m&&"value"in m){var g=t.get(p);g&&(m.value=He(g))}else if(m===void 0){var x=t.get(p),y=x?.v;if(x!==void 0&&y!==vn)return{enumerable:!0,configurable:!0,value:y,writable:!0}}return m},has(o,p){if(p===Ta)return!0;var m=t.get(p),g=m!==void 0&&m.v!==vn||Reflect.has(o,p);if(m!==void 0||Ft!==null&&(!g||wa(o,p)?.writable)){m===void 0&&(m=u(()=>{var y=g?Ma(o[p]):vn,S=ci(y);return S}),t.set(p,m));var x=He(m);if(x===vn)return!1}return g},set(o,p,m,g){var x=t.get(p),y=p in o;if(r&&p==="length")for(var S=m;S<x.v;S+=1){var T=t.get(S+"");T!==void 0?At(T,vn):S in o&&(T=u(()=>ci(vn)),t.set(S+"",T))}if(x===void 0)(!y||wa(o,p)?.writable)&&(x=u(()=>ci(void 0)),At(x,Ma(m)),t.set(p,x));else{y=x.v!==vn;var L=u(()=>Ma(m));At(x,L)}var E=Reflect.getOwnPropertyDescriptor(o,p);if(E?.set&&E.set.call(g,m),!y){if(r&&typeof p=="string"){var b=t.get("length"),V=Number(p);Number.isInteger(V)&&V>=b.v&&At(b,V+1)}uo(a)}return!0},ownKeys(o){He(a);var p=Reflect.ownKeys(o).filter(x=>{var y=t.get(x);return y===void 0||y.v!==vn});for(var[m,g]of t)g.v!==vn&&!(m in o)&&p.push(m);return p},setPrototypeOf(){Xh()}})}var iu,Pd,Dd,Ld;function gp(){if(iu===void 0){iu=window,Pd=/Firefox/.test(navigator.userAgent);var n=Element.prototype,e=Node.prototype,t=Text.prototype;Dd=wa(e,"firstChild").get,Ld=wa(e,"nextSibling").get,tu(n)&&(n.__click=void 0,n.__className=void 0,n.__attributes=null,n.__style=void 0,n.__e=void 0),tu(t)&&(t.__t=void 0)}}function qi(n=""){return document.createTextNode(n)}function Ls(n){return Dd.call(n)}function Hs(n){return Ld.call(n)}function kt(n,e){return Ls(n)}function qt(n,e=1,t=!1){let r=n;for(;e--;)r=Hs(r);return r}function vp(n){n.textContent=""}function Fd(){return!1}let au=!1;function xp(){au||(au=!0,document.addEventListener("reset",n=>{Promise.resolve().then(()=>{if(!n.defaultPrevented)for(const e of n.target.elements)e.__on_r?.()})},{capture:!0}))}function Vs(n){var e=Ct,t=Ft;Ln(null),Cr(null);try{return n()}finally{Ln(e),Cr(t)}}function yp(n,e,t,r=t){n.addEventListener(e,()=>Vs(t));const a=n.__on_r;a?n.__on_r=()=>{a(),r(!0)}:n.__on_r=()=>r(!0),xp()}function Id(n){Ft===null&&(Ct===null&&Gh(),zh()),ji&&Bh()}function Sp(n,e){var t=e.last;t===null?e.last=e.first=n:(t.next=n,n.prev=t,e.last=n)}function Jr(n,e,t){var r=Ft;r!==null&&(r.f&Vn)!==0&&(n|=Vn);var a={ctx:Kt,deps:null,nodes_start:null,nodes_end:null,f:n|Un|pr,first:null,fn:e,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,transitions:null,wv:0,ac:null};if(t)try{mo(a),a.f|=Lf}catch(o){throw Fn(a),o}else e!==null&&Xi(a);var l=a;if(t&&l.deps===null&&l.teardown===null&&l.nodes_start===null&&l.first===l.last&&(l.f&Oa)===0&&(l=l.first,(n&jr)!==0&&(n&Pa)!==0&&l!==null&&(l.f|=Pa)),l!==null&&(l.parent=r,r!==null&&Sp(l,r),Ct!==null&&(Ct.f&mn)!==0&&(n&Yi)===0)){var u=Ct;(u.effects??=[]).push(l)}return a}function Ws(){return Ct!==null&&!wr}function Ud(n){const e=Jr(ks,null,!1);return yn(e,xn),e.teardown=n,e}function Uc(n){Id();var e=Ft.f,t=!Ct&&(e&Kr)!==0&&(e&Lf)===0;if(t){var r=Kt;(r.e??=[]).push(n)}else return Nd(n)}function Nd(n){return Jr(md|gd,n,!1)}function bp(n){return Id(),Jr(ks|gd,n,!0)}function Ep(n){Mr.ensure();const e=Jr(Yi|Oa,n,!0);return(t={})=>new Promise(r=>{t.outro?Aa(e,()=>{Fn(e),r(void 0)}):(Fn(e),r(void 0))})}function Mp(n){return Jr(Ff|Oa,n,!0)}function Od(n,e=0){return Jr(ks|e,n,!0)}function oo(n,e=[],t=[],r=[]){dp(r,e,t,a=>{Jr(ks,()=>n(...a.map(He)),!0)})}function Bf(n,e=0){var t=Jr(jr|e,n,!0);return t}function Kn(n){return Jr(Kr|Oa,n,!0)}function kd(n){var e=n.teardown;if(e!==null){const t=ji,r=Ct;ou(!0),Ln(null);try{e.call(null)}finally{ou(t),Ln(r)}}}function Bd(n,e=!1){var t=n.first;for(n.first=n.last=null;t!==null;){const a=t.ac;a!==null&&Vs(()=>{a.abort(Ea)});var r=t.next;(t.f&Yi)!==0?t.parent=null:Fn(t,e),t=r}}function wp(n){for(var e=n.first;e!==null;){var t=e.next;(e.f&Kr)===0&&Fn(e),e=t}}function Fn(n,e=!0){var t=!1;(e||(n.f&_d)!==0)&&n.nodes_start!==null&&n.nodes_end!==null&&(Tp(n.nodes_start,n.nodes_end),t=!0),Bd(n,e&&!t),Is(n,0),yn(n,Vr);var r=n.transitions;if(r!==null)for(const l of r)l.stop();kd(n);var a=n.parent;a!==null&&a.first!==null&&zd(n),n.next=n.prev=n.teardown=n.ctx=n.deps=n.fn=n.nodes_start=n.nodes_end=n.ac=null}function Tp(n,e){for(;n!==null;){var t=n===e?null:Hs(n);n.remove(),n=t}}function zd(n){var e=n.parent,t=n.prev,r=n.next;t!==null&&(t.next=r),r!==null&&(r.prev=t),e!==null&&(e.first===n&&(e.first=r),e.last===n&&(e.last=t))}function Aa(n,e,t=!0){var r=[];zf(n,r,!0),Gd(r,()=>{t&&Fn(n),e&&e()})}function Gd(n,e){var t=n.length;if(t>0){var r=()=>--t||e();for(var a of n)a.out(r)}else e()}function zf(n,e,t){if((n.f&Vn)===0){if(n.f^=Vn,n.transitions!==null)for(const u of n.transitions)(u.is_global||t)&&e.push(u);for(var r=n.first;r!==null;){var a=r.next,l=(r.f&Pa)!==0||(r.f&Kr)!==0&&(n.f&jr)!==0;zf(r,e,l?t:!1),r=a}}}function Gf(n){Hd(n,!0)}function Hd(n,e){if((n.f&Vn)!==0){n.f^=Vn,(n.f&xn)===0&&(yn(n,Un),Xi(n));for(var t=n.first;t!==null;){var r=t.next,a=(t.f&Pa)!==0||(t.f&Kr)!==0;Hd(t,a?e:!1),t=r}if(n.transitions!==null)for(const l of n.transitions)(l.is_global||e)&&l.in()}}function Vd(n,e){for(var t=n.nodes_start,r=n.nodes_end;t!==null;){var a=t===r?null:Hs(t);e.append(t),t=a}}let yi=!1;function Fs(n){yi=n}let ji=!1;function ou(n){ji=n}let Ct=null,wr=!1;function Ln(n){Ct=n}let Ft=null;function Cr(n){Ft=n}let Wr=null;function Ap(n){Ct!==null&&(Wr===null?Wr=[n]:Wr.push(n))}let Tn=null,Bn=0,Yn=null;function Cp(n){Yn=n}let Wd=1,po=0,Hi=po;function su(n){Hi=n}function Xd(){return++Wd}function wo(n){var e=n.f;if((e&Un)!==0)return!0;if(e&mn&&(n.f&=~Wi),(e&Zr)!==0){var t=n.deps;if(t!==null)for(var r=t.length,a=0;a<r;a++){var l=t[a];if(wo(l)&&Ad(l),l.wv>n.wv)return!0}(e&pr)!==0&&Gn===null&&yn(n,xn)}return!1}function $d(n,e,t=!0){var r=n.reactions;if(r!==null&&!Wr?.includes(n))for(var a=0;a<r.length;a++){var l=r[a];(l.f&mn)!==0?$d(l,e,!1):e===l&&(t?yn(l,Un):(l.f&xn)!==0&&yn(l,Zr),Xi(l))}}function qd(n){var e=Tn,t=Bn,r=Yn,a=Ct,l=Wr,u=Kt,o=wr,p=Hi,m=n.f;Tn=null,Bn=0,Yn=null,Ct=(m&(Kr|Yi))===0?n:null,Wr=null,Da(n.ctx),wr=!1,Hi=++po,n.ac!==null&&(Vs(()=>{n.ac.abort(Ea)}),n.ac=null);try{n.f|=Lc;var g=n.fn,x=g(),y=n.deps;if(Tn!==null){var S;if(Is(n,Bn),y!==null&&Bn>0)for(y.length=Bn+Tn.length,S=0;S<Tn.length;S++)y[Bn+S]=Tn[S];else n.deps=y=Tn;if(yi&&Ws()&&(n.f&pr)!==0)for(S=Bn;S<y.length;S++)(y[S].reactions??=[]).push(n)}else y!==null&&Bn<y.length&&(Is(n,Bn),y.length=Bn);if(Mo()&&Yn!==null&&!wr&&y!==null&&(n.f&(mn|Zr|Un))===0)for(S=0;S<Yn.length;S++)$d(Yn[S],n);return a!==null&&a!==n&&(po++,Yn!==null&&(r===null?r=Yn:r.push(...Yn))),(n.f&vi)!==0&&(n.f^=vi),x}catch(T){return bd(T)}finally{n.f^=Lc,Tn=e,Bn=t,Yn=r,Ct=a,Wr=l,Da(u),wr=o,Hi=p}}function Rp(n,e){let t=e.reactions;if(t!==null){var r=Lh.call(t,n);if(r!==-1){var a=t.length-1;a===0?t=e.reactions=null:(t[r]=t[a],t.pop())}}t===null&&(e.f&mn)!==0&&(Tn===null||!Tn.includes(e))&&(yn(e,Zr),(e.f&pr)!==0&&(e.f^=pr,e.f&=~Wi),Td(e),Is(e,0))}function Is(n,e){var t=n.deps;if(t!==null)for(var r=e;r<t.length;r++)Rp(n,t[r])}function mo(n){var e=n.f;if((e&Vr)===0){yn(n,xn);var t=Ft,r=yi;Ft=n,yi=!0;try{(e&jr)!==0?wp(n):Bd(n),kd(n);var a=qd(n);n.teardown=typeof a=="function"?a:null,n.wv=Wd;var l;Pc&&rp&&(n.f&Un)!==0&&n.deps}finally{yi=r,Ft=t}}}async function Pp(){await Promise.resolve(),op()}function He(n){var e=n.f,t=(e&mn)!==0;if(Ct!==null&&!wr){var r=Ft!==null&&(Ft.f&Vr)!==0;if(!r&&!Wr?.includes(n)){var a=Ct.deps;if((Ct.f&Lc)!==0)n.rv<po&&(n.rv=po,Tn===null&&a!==null&&a[Bn]===n?Bn++:Tn===null?Tn=[n]:Tn.includes(n)||Tn.push(n));else{(Ct.deps??=[]).push(n);var l=n.reactions;l===null?n.reactions=[Ct]:l.includes(Ct)||l.push(Ct)}}}if(ji){if(xi.has(n))return xi.get(n);if(t){var u=n,o=u.v;return((u.f&xn)===0&&u.reactions!==null||jd(u))&&(o=kf(u)),xi.set(u,o),o}}else if(t){if(u=n,Gn?.has(u))return Gn.get(u);wo(u)&&Ad(u),yi&&Ws()&&(u.f&pr)===0&&Yd(u)}else if(Gn?.has(n))return Gn.get(n);if((n.f&vi)!==0)throw n.v;return n.v}function Yd(n){if(n.deps!==null){n.f^=pr;for(const e of n.deps)(e.reactions??=[]).push(n),(e.f&mn)!==0&&(e.f&pr)===0&&Yd(e)}}function jd(n){if(n.v===vn)return!0;if(n.deps===null)return!1;for(const e of n.deps)if(xi.has(e)||(e.f&mn)!==0&&jd(e))return!0;return!1}function wn(n){var e=wr;try{return wr=!0,n()}finally{wr=e}}const Dp=-7169;function yn(n,e){n.f=n.f&Dp|e}function Lp(n){if(!(typeof n!="object"||!n||n instanceof EventTarget)){if(Ta in n)Nc(n);else if(!Array.isArray(n))for(let e in n){const t=n[e];typeof t=="object"&&t&&Ta in t&&Nc(t)}}}function Nc(n,e=new Set){if(typeof n=="object"&&n!==null&&!(n instanceof EventTarget)&&!e.has(n)){e.add(n),n instanceof Date&&n.getTime();for(let r in n)try{Nc(n[r],e)}catch{}const t=Df(n);if(t!==Object.prototype&&t!==Array.prototype&&t!==Map.prototype&&t!==Set.prototype&&t!==Date.prototype){const r=hd(t);for(let a in r){const l=r[a].get;if(l)try{l.call(n)}catch{}}}}}const Fp=["touchstart","touchmove"];function Ip(n){return Fp.includes(n)}const Up=new Set,lu=new Set;function Np(n,e,t,r={}){function a(l){if(r.capture||so.call(e,l),!l.cancelBubble)return Vs(()=>t?.call(this,l))}return n.startsWith("pointer")||n.startsWith("touch")||n==="wheel"?zs(()=>{e.addEventListener(n,a,r)}):e.addEventListener(n,a,r),a}function Dn(n,e,t,r,a){var l={capture:r,passive:a},u=Np(n,e,t,l);(e===document.body||e===window||e===document||e instanceof HTMLMediaElement)&&Ud(()=>{e.removeEventListener(n,u,l)})}let cu=null;function so(n){var e=this,t=e.ownerDocument,r=n.type,a=n.composedPath?.()||[],l=a[0]||n.target;cu=n;var u=0,o=cu===n&&n.__root;if(o){var p=a.indexOf(o);if(p!==-1&&(e===document||e===window)){n.__root=e;return}var m=a.indexOf(e);if(m===-1)return;p<=m&&(u=p)}if(l=a[u]||n.target,l!==e){Fh(n,"currentTarget",{configurable:!0,get(){return l||t}});var g=Ct,x=Ft;Ln(null),Cr(null);try{for(var y,S=[];l!==null;){var T=l.assignedSlot||l.parentNode||l.host||null;try{var L=l["__"+r];L!=null&&(!l.disabled||n.target===l)&&L.call(l,n)}catch(E){y?S.push(E):y=E}if(n.cancelBubble||T===e||T===null)break;l=T}if(y){for(let E of S)queueMicrotask(()=>{throw E});throw y}}finally{n.__root=e,delete n.currentTarget,Ln(g),Cr(x)}}}function Kd(n){var e=document.createElement("template");return e.innerHTML=n.replaceAll("<!>","<!---->"),e.content}function Zd(n,e){var t=Ft;t.nodes_start===null&&(t.nodes_start=n,t.nodes_end=e)}function Qr(n,e){var t=(e&Qh)!==0,r,a=!n.startsWith("<!>");return()=>{r===void 0&&(r=Kd(a?n:"<!>"+n),r=Ls(r));var l=t||Pd?document.importNode(r,!0):r.cloneNode(!0);return Zd(l,l),l}}function Op(n,e,t="svg"){var r=!n.startsWith("<!>"),a=`<${t}>${r?n:"<!>"+n}</${t}>`,l;return()=>{if(!l){var u=Kd(a),o=Ls(u);l=Ls(o)}var p=l.cloneNode(!0);return Zd(p,p),p}}function kp(n,e){return Op(n,e,"svg")}function br(n,e){n!==null&&n.before(e)}function Pi(n,e){var t=e==null?"":typeof e=="object"?e+"":e;t!==(n.__t??=n.nodeValue)&&(n.__t=t,n.nodeValue=t+"")}function Bp(n,e){return zp(n,e)}const la=new Map;function zp(n,{target:e,anchor:t,props:r={},events:a,context:l,intro:u=!0}){gp();var o=new Set,p=x=>{for(var y=0;y<x.length;y++){var S=x[y];if(!o.has(S)){o.add(S);var T=Ip(S);e.addEventListener(S,so,{passive:T});var L=la.get(S);L===void 0?(document.addEventListener(S,so,{passive:T}),la.set(S,1)):la.set(S,L+1)}}};p(Pf(Up)),lu.add(p);var m=void 0,g=Ep(()=>{var x=t??e.appendChild(qi());return fp(x,{pending:()=>{}},y=>{if(l){If({});var S=Kt;S.c=l}a&&(r.$$events=a),m=n(y,r)||{},l&&Uf()}),()=>{for(var y of o){e.removeEventListener(y,so);var S=la.get(y);--S===0?(document.removeEventListener(y,so),la.delete(y)):la.set(y,S)}lu.delete(p),x!==t&&x.parentNode?.removeChild(x)}});return Gp.set(m,g),m}let Gp=new WeakMap;class Hp{anchor;#e=new Map;#t=new Map;#r=new Map;#n=new Set;#l=!0;constructor(e,t=!0){this.anchor=e,this.#l=t}#a=()=>{var e=Vt;if(this.#e.has(e)){var t=this.#e.get(e),r=this.#t.get(t);if(r)Gf(r),this.#n.delete(t);else{var a=this.#r.get(t);a&&(this.#t.set(t,a.effect),this.#r.delete(t),a.fragment.lastChild.remove(),this.anchor.before(a.fragment),r=a.effect)}for(const[l,u]of this.#e){if(this.#e.delete(l),l===e)break;const o=this.#r.get(u);o&&(Fn(o.effect),this.#r.delete(u))}for(const[l,u]of this.#t){if(l===t||this.#n.has(l))continue;const o=()=>{if(Array.from(this.#e.values()).includes(l)){var m=document.createDocumentFragment();Vd(u,m),m.append(qi()),this.#r.set(l,{effect:u,fragment:m})}else Fn(u);this.#n.delete(l),this.#t.delete(l)};this.#l||!r?(this.#n.add(l),Aa(u,o,!1)):o()}}};#i=e=>{this.#e.delete(e);const t=Array.from(this.#e.values());for(const[r,a]of this.#r)t.includes(r)||(Fn(a.effect),this.#r.delete(r))};ensure(e,t){var r=Vt,a=Fd();if(t&&!this.#t.has(e)&&!this.#r.has(e))if(a){var l=document.createDocumentFragment(),u=qi();l.append(u),this.#r.set(e,{effect:Kn(()=>t(u)),fragment:l})}else this.#t.set(e,Kn(()=>t(this.anchor)));if(this.#e.set(r,e),a){for(const[o,p]of this.#t)o===e?r.skipped_effects.delete(p):r.skipped_effects.add(p);for(const[o,p]of this.#r)o===e?r.skipped_effects.delete(p.effect):r.skipped_effects.add(p.effect);r.oncommit(this.#a),r.ondiscard(this.#i)}else this.#a()}}function lo(n,e,t=!1){var r=new Hp(n),a=t?Pa:0;function l(u,o){r.ensure(u,o)}Bf(()=>{var u=!1;e((o,p=!0)=>{u=!0,l(p,o)}),u||l(!1,null)},a)}function Vp(n,e){return e}function Wp(n,e,t){for(var r=[],a=e.length,l=0;l<a;l++)zf(e[l].e,r,!0);Gd(r,()=>{var u=r.length===0&&t!==null;if(u){var o=t,p=o.parentNode;vp(p),p.append(o),n.items.clear(),yr(n,e[0].prev,e[a-1].next)}for(var m=0;m<a;m++){var g=e[m];u||(n.items.delete(g.k),yr(n,g.prev,g.next)),Fn(g.e,!u)}n.first===e[0]&&(n.first=e[0].prev)})}function Xp(n,e,t,r,a,l=null){var u=n,o=new Map,p=null;{var m=n;u=m.appendChild(qi())}var g=null,x=Of(()=>{var b=t();return Rf(b)?b:b==null?[]:Pf(b)}),y,S=!0;function T(){$p(E,y,u,e,r),g!==null&&(y.length===0?(g.fragment?(u.before(g.fragment),g.fragment=null):Gf(g.effect),L.first=g.effect):Aa(g.effect,()=>{g=null}))}var L=Bf(()=>{y=He(x);for(var b=y.length,V=new Set,H=Vt,X=null,I=Fd(),R=0;R<b;R+=1){var F=y[R],W=r(F,R),D=S?null:o.get(W);D?(ho(D.v,F),D.i=R,I&&H.skipped_effects.delete(D.e)):(D=qp(S?u:null,X,F,W,R,a,e,t),S&&(D.o=!0,X===null?p=D:X.next=D,X=D),o.set(W,D)),V.add(W)}if(b===0&&l&&!g)if(S)g={fragment:null,effect:Kn(()=>l(u))};else{var w=document.createDocumentFragment(),z=qi();w.append(z),g={fragment:w,effect:Kn(()=>l(z))}}if(!S)if(I){for(const[B,Y]of o)V.has(B)||H.skipped_effects.add(Y.e);H.oncommit(T),H.ondiscard(()=>{})}else T();He(x)}),E={effect:L,items:o,first:p};S=!1}function $p(n,e,t,r,a){var l=e.length,u=n.items,o=n.first,p,m=null,g=[],x=[],y,S,T,L;for(L=0;L<l;L+=1){if(y=e[L],S=a(y,L),T=u.get(S),n.first??=T,!T.o){T.o=!0;var E=m?m.next:o;yr(n,m,T),yr(n,T,E),Yl(T,E,t),m=T,g=[],x=[],o=m.next;continue}if((T.e.f&Vn)!==0&&Gf(T.e),T!==o){if(p!==void 0&&p.has(T)){if(g.length<x.length){var b=x[0],V;m=b.prev;var H=g[0],X=g[g.length-1];for(V=0;V<g.length;V+=1)Yl(g[V],b,t);for(V=0;V<x.length;V+=1)p.delete(x[V]);yr(n,H.prev,X.next),yr(n,m,H),yr(n,X,b),o=b,m=X,L-=1,g=[],x=[]}else p.delete(T),Yl(T,o,t),yr(n,T.prev,T.next),yr(n,T,m===null?n.first:m.next),yr(n,m,T),m=T;continue}for(g=[],x=[];o!==null&&o.k!==S;)(o.e.f&Vn)===0&&(p??=new Set).add(o),x.push(o),o=o.next;if(o===null)continue;T=o}g.push(T),m=T,o=T.next}if(o!==null||p!==void 0){for(var I=p===void 0?[]:Pf(p);o!==null;)(o.e.f&Vn)===0&&I.push(o),o=o.next;var R=I.length;if(R>0){var F=l===0?t:null;Wp(n,I,F)}}}function qp(n,e,t,r,a,l,u,o){var p=(u&Yh)!==0,m=(u&Kh)===0,g=p?m?Sr(t,!1,!1):$i(t):t,x=(u&jh)===0?a:$i(a),y={i:x,v:g,k:r,a:null,e:null,o:!1,prev:e,next:null};try{if(n===null){var S=document.createDocumentFragment();S.append(n=qi())}return y.e=Kn(()=>l(n,g,x,o)),e!==null&&(e.next=y),y}finally{}}function Yl(n,e,t){for(var r=n.next?n.next.e.nodes_start:t,a=e?e.e.nodes_start:t,l=n.e.nodes_start;l!==null&&l!==r;){var u=Hs(l);a.before(l),l=u}}function yr(n,e,t){e===null?(n.first=t,n.effect.first=t&&t.e):(e.e.next&&(e.e.next.prev=null),e.next=t,e.e.next=t&&t.e),t===null?n.effect.last=e&&e.e:(t.e.prev&&(t.e.prev.next=null),t.prev=e,t.e.prev=e&&e.e)}const fu=[...` 	
\r\f \v\uFEFF`];function Yp(n,e,t){var r=n==null?"":""+n;if(t){for(var a in t)if(t[a])r=r?r+" "+a:a;else if(r.length)for(var l=a.length,u=0;(u=r.indexOf(a,u))>=0;){var o=u+l;(u===0||fu.includes(r[u-1]))&&(o===r.length||fu.includes(r[o]))?r=(u===0?"":r.substring(0,u))+r.substring(o+1):u=o}}return r===""?null:r}function Oc(n,e,t,r,a,l){var u=n.__className;if(u!==t||u===void 0){var o=Yp(t,r,l);o==null?n.removeAttribute("class"):n.className=o,n.__className=t}else if(l&&a!==l)for(var p in l){var m=!!l[p];(a==null||m!==!!a[p])&&n.classList.toggle(p,m)}return l}const jp=Symbol("is custom element"),Kp=Symbol("is html");function Zp(n,e,t,r){var a=Jp(n);a[e]!==(a[e]=t)&&(t==null?n.removeAttribute(e):typeof t!="string"&&Qp(n).includes(e)?n[e]=t:n.setAttribute(e,t))}function Jp(n){return n.__attributes??={[jp]:n.nodeName.includes("-"),[Kp]:n.namespaceURI===ep}}var uu=new Map;function Qp(n){var e=n.getAttribute("is")||n.nodeName,t=uu.get(e);if(t)return t;uu.set(e,t=[]);for(var r,a=n,l=Element.prototype;l!==a;){r=hd(a);for(var u in r)r[u].set&&t.push(u);a=Df(a)}return t}function du(n,e,t=e){var r=new WeakSet;yp(n,"input",async a=>{var l=a?n.defaultValue:n.value;if(l=jl(n)?Kl(l):l,t(l),Vt!==null&&r.add(Vt),await Pp(),l!==(l=e())){var u=n.selectionStart,o=n.selectionEnd,p=n.value.length;if(n.value=l??"",o!==null){var m=n.value.length;u===o&&o===p&&m>p?(n.selectionStart=m,n.selectionEnd=m):(n.selectionStart=u,n.selectionEnd=Math.min(o,m))}}}),wn(e)==null&&n.value&&(t(jl(n)?Kl(n.value):n.value),Vt!==null&&r.add(Vt)),Od(()=>{var a=e();if(n===document.activeElement){var l=ws??Vt;if(r.has(l))return}jl(n)&&a===Kl(n.value)||n.type==="date"&&!a&&!n.value||a!==n.value&&(n.value=a??"")})}function jl(n){var e=n.type;return e==="number"||e==="range"}function Kl(n){return n===""?null:+n}function Jd(n=!1){const e=Kt,t=e.l.u;if(!t)return;let r=()=>Lp(e.s);if(n){let a=0,l={};const u=Nf(()=>{let o=!1;const p=e.s;for(const m in p)p[m]!==l[m]&&(l[m]=p[m],o=!0);return o&&a++,a});r=()=>He(u)}t.b.length&&bp(()=>{hu(e,r),Dc(t.b)}),Uc(()=>{const a=wn(()=>t.m.map(Nh));return()=>{for(const l of a)typeof l=="function"&&l()}}),t.a.length&&Uc(()=>{hu(e,r),Dc(t.a)})}function hu(n,e){if(n.l.s)for(const t of n.l.s)He(t);e()}let Qo=!1;function em(n){var e=Qo;try{return Qo=!1,[n(),Qo]}finally{Qo=e}}function tm(n,e,t,r){var a=!ka||(t&Zh)!==0,l=(t&Jh)!==0,u=r,o=!0,p=()=>(o&&(o=!1,u=wn(r)),u),m;{var g=Ta in n||Oh in n;m=wa(n,e)?.set??(g&&e in n?V=>n[e]=V:void 0)}var x,y=!1;[x,y]=em(()=>n[e]),x===void 0&&r!==void 0&&(x=p(),m&&(a&&Vh(),m(x)));var S;if(a?S=()=>{var V=n[e];return V===void 0?p():(o=!0,V)}:S=()=>{var V=n[e];return V!==void 0&&(u=void 0),V===void 0?u:V},m){var T=n.$$legacy;return(function(V,H){return arguments.length>0?((!a||!H||T||y)&&m(H?S():V),V):S()})}var L=!1,E=Of(()=>(L=!1,S()));He(E);var b=Ft;return(function(V,H){if(arguments.length>0){const X=H?He(E):a&&l?Ma(V):V;return At(E,X),L=!0,u!==void 0&&(u=X),V}return ji&&L||(b.f&Vr)!==0?E.v:He(E)})}function nm(n){Kt===null&&vd(),ka&&Kt.l!==null?im(Kt).m.push(n):Uc(()=>{const e=wn(n);if(typeof e=="function")return e})}function rm(n,e,{bubbles:t=!1,cancelable:r=!1}={}){return new CustomEvent(n,{detail:e,bubbles:t,cancelable:r})}function Qd(){const n=Kt;return n===null&&vd(),(e,t,r)=>{const a=n.s.$$events?.[e];if(a){const l=Rf(a)?a.slice():[a],u=rm(e,t,r);for(const o of l)o.call(n.x,u);return!u.defaultPrevented}return!0}}function im(n){var e=n.l;return e.u??={a:[],b:[],m:[]}}const am="5";typeof window<"u"&&((window.__svelte??={}).v??=new Set).add(am);ip();var om=Qr('<div role="button" tabindex="0" aria-label="Upload images"><input type="file" id="file-input" multiple accept="image/*,.heic,.heif" hidden=""/> <label for="file-input" class="drop-label svelte-ch8vdo"><div class="icon svelte-ch8vdo"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 svelte-ch8vdo"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"></path></svg></div> <p class="svelte-ch8vdo">Drag & Drop images here or <span class="highlight svelte-ch8vdo">Browse</span></p> <p class="subtext svelte-ch8vdo">Supports JPEG, PNG, WebP, HEIC, HEIF</p></label></div>');function sm(n,e){If(e,!1);const t=Qd();let r=Sr(!1);function a(x){x.preventDefault(),At(r,!0)}function l(){At(r,!1)}function u(x){x.preventDefault(),At(r,!1),x.dataTransfer.files&&x.dataTransfer.files.length>0&&t("files",x.dataTransfer.files)}function o(x){x.target.files&&x.target.files.length>0&&t("files",x.target.files)}Jd();var p=om();let m;var g=kt(p);oo(()=>m=Oc(p,1,"drop-zone svelte-ch8vdo",null,m,{active:He(r)})),Dn("change",g,o),Dn("dragover",p,a),Dn("dragleave",p,l),Dn("drop",p,u),br(n,p),Uf()}const lm=async(n,e,t)=>{if(typeof OffscreenCanvas<"u"&&n instanceof OffscreenCanvas)return n.convertToBlob({type:e,quality:t});if(n instanceof HTMLCanvasElement)return new Promise((r,a)=>{n.toBlob(l=>{l?r(l):a(new Error("Failed to convert canvas to blob"))},e,t)});throw new Error("Unsupported canvas element")},pu=async n=>{if(typeof createImageBitmap>"u")throw new Error("createImageBitmap() not supported.");const{source:e,mimeType:t,quality:r,flipY:a}=n;let l;if((e instanceof Uint8Array||e instanceof Uint8ClampedArray)&&"sourceMimeType"in n)l=new Blob([e],{type:n.sourceMimeType});else if(e instanceof ImageData)l=e;else throw new Error("Invalid source image");const u=await createImageBitmap(l),o=u.width,p=u.height;let m;typeof OffscreenCanvas<"u"?m=new OffscreenCanvas(o,p):(m=document.createElement("canvas"),m.width=o,m.height=p);const g=m.getContext("2d");if(!g)throw new Error("Failed to create canvas Context");a===!0&&(g.translate(0,p),g.scale(1,-1)),g.drawImage(u,0,0,o,p);const x=await lm(m,t,r||.9);return{data:new Uint8Array(await x.arrayBuffer()),mimeType:t,width:o,height:p}};const Hf="181",cm=0,mu=1,fm=2,eh=1,um=2,Br=3,Si=0,In=1,Gr=2,hr=0,Ca=1,_u=2,gu=3,vu=4,dm=5,ki=100,hm=101,pm=102,mm=103,_m=104,gm=200,vm=201,xm=202,ym=203,kc=204,Bc=205,Sm=206,bm=207,Em=208,Mm=209,wm=210,Tm=211,Am=212,Cm=213,Rm=214,zc=0,Gc=1,Hc=2,Fa=3,Vc=4,Wc=5,Xc=6,$c=7,th=0,Pm=1,Dm=2,Xr=0,qc=1,nh=2,rh=3,Yc=4,Lm=5,Fm=6,Im=7,_o=300,Ia=301,Ua=302,jc=303,Kc=304,Xs=306,go=1e3,Hn=1001,Zc=1002,Wn=1003,Um=1004,es=1005,un=1006,Zl=1007,Gi=1008,Jn=1009,Vf=1010,Wf=1011,vo=1012,$s=1013,bi=1014,Zn=1015,ei=1016,Xf=1017,$f=1018,xo=1020,ih=35902,ah=35899,oh=1021,sh=1022,An=1023,yo=1026,So=1027,lh=1028,qf=1029,Yf=1030,jf=1031,Kf=1033,Ts=33776,As=33777,Cs=33778,Rs=33779,Jc=35840,Qc=35841,ef=35842,tf=35843,nf=36196,rf=37492,af=37496,of=37808,sf=37809,lf=37810,cf=37811,ff=37812,uf=37813,df=37814,hf=37815,pf=37816,mf=37817,_f=37818,gf=37819,vf=37820,xf=37821,yf=36492,Sf=36494,bf=36495,Ef=36283,Mf=36284,wf=36285,Tf=36286,Nm=3200,Om=3201,km=0,Bm=1,_i="",zn="srgb",Rr="srgb-linear",Us="linear",Bt="srgb",ca=7680,xu=519,zm=512,Gm=513,Hm=514,ch=515,Vm=516,Wm=517,Xm=518,$m=519,yu=35044,Su="300 es",Tr=2e3,Ns=2001;function fh(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Os(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function qm(){const n=Os("canvas");return n.style.display="block",n}const bu={};function Eu(...n){const e="THREE."+n.shift();console.log(e,...n)}function mt(...n){const e="THREE."+n.shift();console.warn(e,...n)}function Jt(...n){const e="THREE."+n.shift();console.error(e,...n)}function bo(...n){const e=n.join(" ");e in bu||(bu[e]=!0,mt(...n))}function Ym(n,e,t){return new Promise(function(r,a){function l(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:a();break;case n.TIMEOUT_EXPIRED:setTimeout(l,t);break;default:r()}}setTimeout(l,t)})}class Ba{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){const r=this._listeners;return r===void 0?!1:r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){const r=this._listeners;if(r===void 0)return;const a=r[e];if(a!==void 0){const l=a.indexOf(t);l!==-1&&a.splice(l,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const r=t[e.type];if(r!==void 0){e.target=this;const a=r.slice(0);for(let l=0,u=a.length;l<u;l++)a[l].call(this,e);e.target=null}}}const _n=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Jl=Math.PI/180,Af=180/Math.PI;function To(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(_n[n&255]+_n[n>>8&255]+_n[n>>16&255]+_n[n>>24&255]+"-"+_n[e&255]+_n[e>>8&255]+"-"+_n[e>>16&15|64]+_n[e>>24&255]+"-"+_n[t&63|128]+_n[t>>8&255]+"-"+_n[t>>16&255]+_n[t>>24&255]+_n[r&255]+_n[r>>8&255]+_n[r>>16&255]+_n[r>>24&255]).toLowerCase()}function Et(n,e,t){return Math.max(e,Math.min(t,n))}function jm(n,e){return(n%e+e)%e}function Ql(n,e,t){return(1-t)*n+t*e}function Qa(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Pn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class Gt{constructor(e=0,t=0){Gt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,r=this.y,a=e.elements;return this.x=a[0]*t+a[3]*r+a[6],this.y=a[1]*t+a[4]*r+a[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Et(this.x,e.x,t.x),this.y=Et(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Et(this.x,e,t),this.y=Et(this.y,e,t),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Et(r,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(Et(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y;return t*t+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const r=Math.cos(t),a=Math.sin(t),l=this.x-e.x,u=this.y-e.y;return this.x=l*r-u*a+e.x,this.y=l*a+u*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ao{constructor(e=0,t=0,r=0,a=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=a}static slerpFlat(e,t,r,a,l,u,o){let p=r[a+0],m=r[a+1],g=r[a+2],x=r[a+3],y=l[u+0],S=l[u+1],T=l[u+2],L=l[u+3];if(o<=0){e[t+0]=p,e[t+1]=m,e[t+2]=g,e[t+3]=x;return}if(o>=1){e[t+0]=y,e[t+1]=S,e[t+2]=T,e[t+3]=L;return}if(x!==L||p!==y||m!==S||g!==T){let E=p*y+m*S+g*T+x*L;E<0&&(y=-y,S=-S,T=-T,L=-L,E=-E);let b=1-o;if(E<.9995){const V=Math.acos(E),H=Math.sin(V);b=Math.sin(b*V)/H,o=Math.sin(o*V)/H,p=p*b+y*o,m=m*b+S*o,g=g*b+T*o,x=x*b+L*o}else{p=p*b+y*o,m=m*b+S*o,g=g*b+T*o,x=x*b+L*o;const V=1/Math.sqrt(p*p+m*m+g*g+x*x);p*=V,m*=V,g*=V,x*=V}}e[t]=p,e[t+1]=m,e[t+2]=g,e[t+3]=x}static multiplyQuaternionsFlat(e,t,r,a,l,u){const o=r[a],p=r[a+1],m=r[a+2],g=r[a+3],x=l[u],y=l[u+1],S=l[u+2],T=l[u+3];return e[t]=o*T+g*x+p*S-m*y,e[t+1]=p*T+g*y+m*x-o*S,e[t+2]=m*T+g*S+o*y-p*x,e[t+3]=g*T-o*x-p*y-m*S,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,a){return this._x=e,this._y=t,this._z=r,this._w=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const r=e._x,a=e._y,l=e._z,u=e._order,o=Math.cos,p=Math.sin,m=o(r/2),g=o(a/2),x=o(l/2),y=p(r/2),S=p(a/2),T=p(l/2);switch(u){case"XYZ":this._x=y*g*x+m*S*T,this._y=m*S*x-y*g*T,this._z=m*g*T+y*S*x,this._w=m*g*x-y*S*T;break;case"YXZ":this._x=y*g*x+m*S*T,this._y=m*S*x-y*g*T,this._z=m*g*T-y*S*x,this._w=m*g*x+y*S*T;break;case"ZXY":this._x=y*g*x-m*S*T,this._y=m*S*x+y*g*T,this._z=m*g*T+y*S*x,this._w=m*g*x-y*S*T;break;case"ZYX":this._x=y*g*x-m*S*T,this._y=m*S*x+y*g*T,this._z=m*g*T-y*S*x,this._w=m*g*x+y*S*T;break;case"YZX":this._x=y*g*x+m*S*T,this._y=m*S*x+y*g*T,this._z=m*g*T-y*S*x,this._w=m*g*x-y*S*T;break;case"XZY":this._x=y*g*x-m*S*T,this._y=m*S*x-y*g*T,this._z=m*g*T+y*S*x,this._w=m*g*x+y*S*T;break;default:mt("Quaternion: .setFromEuler() encountered an unknown order: "+u)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const r=t/2,a=Math.sin(r);return this._x=e.x*a,this._y=e.y*a,this._z=e.z*a,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,r=t[0],a=t[4],l=t[8],u=t[1],o=t[5],p=t[9],m=t[2],g=t[6],x=t[10],y=r+o+x;if(y>0){const S=.5/Math.sqrt(y+1);this._w=.25/S,this._x=(g-p)*S,this._y=(l-m)*S,this._z=(u-a)*S}else if(r>o&&r>x){const S=2*Math.sqrt(1+r-o-x);this._w=(g-p)/S,this._x=.25*S,this._y=(a+u)/S,this._z=(l+m)/S}else if(o>x){const S=2*Math.sqrt(1+o-r-x);this._w=(l-m)/S,this._x=(a+u)/S,this._y=.25*S,this._z=(p+g)/S}else{const S=2*Math.sqrt(1+x-r-o);this._w=(u-a)/S,this._x=(l+m)/S,this._y=(p+g)/S,this._z=.25*S}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<1e-8?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Et(this.dot(e),-1,1)))}rotateTowards(e,t){const r=this.angleTo(e);if(r===0)return this;const a=Math.min(1,t/r);return this.slerp(e,a),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const r=e._x,a=e._y,l=e._z,u=e._w,o=t._x,p=t._y,m=t._z,g=t._w;return this._x=r*g+u*o+a*m-l*p,this._y=a*g+u*p+l*o-r*m,this._z=l*g+u*m+r*p-a*o,this._w=u*g-r*o-a*p-l*m,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let r=e._x,a=e._y,l=e._z,u=e._w,o=this.dot(e);o<0&&(r=-r,a=-a,l=-l,u=-u,o=-o);let p=1-t;if(o<.9995){const m=Math.acos(o),g=Math.sin(m);p=Math.sin(p*m)/g,t=Math.sin(t*m)/g,this._x=this._x*p+r*t,this._y=this._y*p+a*t,this._z=this._z*p+l*t,this._w=this._w*p+u*t,this._onChangeCallback()}else this._x=this._x*p+r*t,this._y=this._y*p+a*t,this._z=this._z*p+l*t,this._w=this._w*p+u*t,this.normalize();return this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),r=Math.random(),a=Math.sqrt(1-r),l=Math.sqrt(r);return this.set(a*Math.sin(e),a*Math.cos(e),l*Math.sin(t),l*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class le{constructor(e=0,t=0,r=0){le.prototype.isVector3=!0,this.x=e,this.y=t,this.z=r}set(e,t,r){return r===void 0&&(r=this.z),this.x=e,this.y=t,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Mu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Mu.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,r=this.y,a=this.z,l=e.elements;return this.x=l[0]*t+l[3]*r+l[6]*a,this.y=l[1]*t+l[4]*r+l[7]*a,this.z=l[2]*t+l[5]*r+l[8]*a,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,r=this.y,a=this.z,l=e.elements,u=1/(l[3]*t+l[7]*r+l[11]*a+l[15]);return this.x=(l[0]*t+l[4]*r+l[8]*a+l[12])*u,this.y=(l[1]*t+l[5]*r+l[9]*a+l[13])*u,this.z=(l[2]*t+l[6]*r+l[10]*a+l[14])*u,this}applyQuaternion(e){const t=this.x,r=this.y,a=this.z,l=e.x,u=e.y,o=e.z,p=e.w,m=2*(u*a-o*r),g=2*(o*t-l*a),x=2*(l*r-u*t);return this.x=t+p*m+u*x-o*g,this.y=r+p*g+o*m-l*x,this.z=a+p*x+l*g-u*m,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,r=this.y,a=this.z,l=e.elements;return this.x=l[0]*t+l[4]*r+l[8]*a,this.y=l[1]*t+l[5]*r+l[9]*a,this.z=l[2]*t+l[6]*r+l[10]*a,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Et(this.x,e.x,t.x),this.y=Et(this.y,e.y,t.y),this.z=Et(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Et(this.x,e,t),this.y=Et(this.y,e,t),this.z=Et(this.z,e,t),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Et(r,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const r=e.x,a=e.y,l=e.z,u=t.x,o=t.y,p=t.z;return this.x=a*p-l*o,this.y=l*u-r*p,this.z=r*o-a*u,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const r=e.dot(this)/t;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return ec.copy(this).projectOnVector(e),this.sub(ec)}reflect(e){return this.sub(ec.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(Et(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y,a=this.z-e.z;return t*t+r*r+a*a}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,r){const a=Math.sin(t)*e;return this.x=a*Math.sin(r),this.y=Math.cos(t)*e,this.z=a*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,r){return this.x=e*Math.sin(t),this.y=r,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),a=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=r,this.z=a,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,r=Math.sqrt(1-t*t);return this.x=r*Math.cos(e),this.y=t,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ec=new le,Mu=new Ao;class gt{constructor(e,t,r,a,l,u,o,p,m){gt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,r,a,l,u,o,p,m)}set(e,t,r,a,l,u,o,p,m){const g=this.elements;return g[0]=e,g[1]=a,g[2]=o,g[3]=t,g[4]=l,g[5]=p,g[6]=r,g[7]=u,g[8]=m,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],this}extractBasis(e,t,r){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,a=t.elements,l=this.elements,u=r[0],o=r[3],p=r[6],m=r[1],g=r[4],x=r[7],y=r[2],S=r[5],T=r[8],L=a[0],E=a[3],b=a[6],V=a[1],H=a[4],X=a[7],I=a[2],R=a[5],F=a[8];return l[0]=u*L+o*V+p*I,l[3]=u*E+o*H+p*R,l[6]=u*b+o*X+p*F,l[1]=m*L+g*V+x*I,l[4]=m*E+g*H+x*R,l[7]=m*b+g*X+x*F,l[2]=y*L+S*V+T*I,l[5]=y*E+S*H+T*R,l[8]=y*b+S*X+T*F,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],u=e[4],o=e[5],p=e[6],m=e[7],g=e[8];return t*u*g-t*o*m-r*l*g+r*o*p+a*l*m-a*u*p}invert(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],u=e[4],o=e[5],p=e[6],m=e[7],g=e[8],x=g*u-o*m,y=o*p-g*l,S=m*l-u*p,T=t*x+r*y+a*S;if(T===0)return this.set(0,0,0,0,0,0,0,0,0);const L=1/T;return e[0]=x*L,e[1]=(a*m-g*r)*L,e[2]=(o*r-a*u)*L,e[3]=y*L,e[4]=(g*t-a*p)*L,e[5]=(a*l-o*t)*L,e[6]=S*L,e[7]=(r*p-m*t)*L,e[8]=(u*t-r*l)*L,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,r,a,l,u,o){const p=Math.cos(l),m=Math.sin(l);return this.set(r*p,r*m,-r*(p*u+m*o)+u+e,-a*m,a*p,-a*(-m*u+p*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(tc.makeScale(e,t)),this}rotate(e){return this.premultiply(tc.makeRotation(-e)),this}translate(e,t){return this.premultiply(tc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,r,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,r=e.elements;for(let a=0;a<9;a++)if(t[a]!==r[a])return!1;return!0}fromArray(e,t=0){for(let r=0;r<9;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const tc=new gt,wu=new gt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Tu=new gt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Km(){const n={enabled:!0,workingColorSpace:Rr,spaces:{},convert:function(a,l,u){return this.enabled===!1||l===u||!l||!u||(this.spaces[l].transfer===Bt&&(a.r=$r(a.r),a.g=$r(a.g),a.b=$r(a.b)),this.spaces[l].primaries!==this.spaces[u].primaries&&(a.applyMatrix3(this.spaces[l].toXYZ),a.applyMatrix3(this.spaces[u].fromXYZ)),this.spaces[u].transfer===Bt&&(a.r=Ra(a.r),a.g=Ra(a.g),a.b=Ra(a.b))),a},workingToColorSpace:function(a,l){return this.convert(a,this.workingColorSpace,l)},colorSpaceToWorking:function(a,l){return this.convert(a,l,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){return a===_i?Us:this.spaces[a].transfer},getToneMappingMode:function(a){return this.spaces[a].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(a,l=this.workingColorSpace){return a.fromArray(this.spaces[l].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,l,u){return a.copy(this.spaces[l].toXYZ).multiply(this.spaces[u].fromXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(a,l){return bo("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(a,l)},toWorkingColorSpace:function(a,l){return bo("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(a,l)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],r=[.3127,.329];return n.define({[Rr]:{primaries:e,whitePoint:r,transfer:Us,toXYZ:wu,fromXYZ:Tu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:zn},outputColorSpaceConfig:{drawingBufferColorSpace:zn}},[zn]:{primaries:e,whitePoint:r,transfer:Bt,toXYZ:wu,fromXYZ:Tu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:zn}}}),n}const Rt=Km();function $r(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ra(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let fa;class Zm{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let r;if(e instanceof HTMLCanvasElement)r=e;else{fa===void 0&&(fa=Os("canvas")),fa.width=e.width,fa.height=e.height;const a=fa.getContext("2d");e instanceof ImageData?a.putImageData(e,0,0):a.drawImage(e,0,0,e.width,e.height),r=fa}return r.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Os("canvas");t.width=e.width,t.height=e.height;const r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const a=r.getImageData(0,0,e.width,e.height),l=a.data;for(let u=0;u<l.length;u++)l[u]=$r(l[u]/255)*255;return r.putImageData(a,0,0),t}else if(e.data){const t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor($r(t[r]/255)*255):t[r]=$r(t[r]);return{data:t,width:e.width,height:e.height}}else return mt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Jm=0;class Zf{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Jm++}),this.uuid=To(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},a=this.data;if(a!==null){let l;if(Array.isArray(a)){l=[];for(let u=0,o=a.length;u<o;u++)a[u].isDataTexture?l.push(nc(a[u].image)):l.push(nc(a[u]))}else l=nc(a);r.url=l}return t||(e.images[this.uuid]=r),r}}function nc(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Zm.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(mt("Texture: Unable to serialize Texture."),{})}let Qm=0;const rc=new le;class pn extends Ba{constructor(e=pn.DEFAULT_IMAGE,t=pn.DEFAULT_MAPPING,r=Hn,a=Hn,l=un,u=Gi,o=An,p=Jn,m=pn.DEFAULT_ANISOTROPY,g=_i){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Qm++}),this.uuid=To(),this.name="",this.source=new Zf(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=r,this.wrapT=a,this.magFilter=l,this.minFilter=u,this.anisotropy=m,this.format=o,this.internalFormat=null,this.type=p,this.offset=new Gt(0,0),this.repeat=new Gt(1,1),this.center=new Gt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new gt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=g,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(rc).x}get height(){return this.source.getSize(rc).y}get depth(){return this.source.getSize(rc).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const r=e[t];if(r===void 0){mt(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const a=this[t];if(a===void 0){mt(`Texture.setValues(): property '${t}' does not exist.`);continue}a&&r&&a.isVector2&&r.isVector2||a&&r&&a.isVector3&&r.isVector3||a&&r&&a.isMatrix3&&r.isMatrix3?a.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),t||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==_o)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case go:e.x=e.x-Math.floor(e.x);break;case Hn:e.x=e.x<0?0:1;break;case Zc:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case go:e.y=e.y-Math.floor(e.y);break;case Hn:e.y=e.y<0?0:1;break;case Zc:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}pn.DEFAULT_IMAGE=null;pn.DEFAULT_MAPPING=_o;pn.DEFAULT_ANISOTROPY=1;class Qt{constructor(e=0,t=0,r=0,a=1){Qt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=r,this.w=a}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,r,a){return this.x=e,this.y=t,this.z=r,this.w=a,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,r=this.y,a=this.z,l=this.w,u=e.elements;return this.x=u[0]*t+u[4]*r+u[8]*a+u[12]*l,this.y=u[1]*t+u[5]*r+u[9]*a+u[13]*l,this.z=u[2]*t+u[6]*r+u[10]*a+u[14]*l,this.w=u[3]*t+u[7]*r+u[11]*a+u[15]*l,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,r,a,l;const p=e.elements,m=p[0],g=p[4],x=p[8],y=p[1],S=p[5],T=p[9],L=p[2],E=p[6],b=p[10];if(Math.abs(g-y)<.01&&Math.abs(x-L)<.01&&Math.abs(T-E)<.01){if(Math.abs(g+y)<.1&&Math.abs(x+L)<.1&&Math.abs(T+E)<.1&&Math.abs(m+S+b-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const H=(m+1)/2,X=(S+1)/2,I=(b+1)/2,R=(g+y)/4,F=(x+L)/4,W=(T+E)/4;return H>X&&H>I?H<.01?(r=0,a=.707106781,l=.707106781):(r=Math.sqrt(H),a=R/r,l=F/r):X>I?X<.01?(r=.707106781,a=0,l=.707106781):(a=Math.sqrt(X),r=R/a,l=W/a):I<.01?(r=.707106781,a=.707106781,l=0):(l=Math.sqrt(I),r=F/l,a=W/l),this.set(r,a,l,t),this}let V=Math.sqrt((E-T)*(E-T)+(x-L)*(x-L)+(y-g)*(y-g));return Math.abs(V)<.001&&(V=1),this.x=(E-T)/V,this.y=(x-L)/V,this.z=(y-g)/V,this.w=Math.acos((m+S+b-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Et(this.x,e.x,t.x),this.y=Et(this.y,e.y,t.y),this.z=Et(this.z,e.z,t.z),this.w=Et(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Et(this.x,e,t),this.y=Et(this.y,e,t),this.z=Et(this.z,e,t),this.w=Et(this.w,e,t),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Et(r,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this.w=e.w+(t.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class e0 extends Ba{constructor(e=1,t=1,r={}){super(),r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:un,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},r),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=r.depth,this.scissor=new Qt(0,0,e,t),this.scissorTest=!1,this.viewport=new Qt(0,0,e,t);const a={width:e,height:t,depth:r.depth},l=new pn(a);this.textures=[];const u=r.count;for(let o=0;o<u;o++)this.textures[o]=l.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(r),this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=r.depthTexture,this.samples=r.samples,this.multiview=r.multiview}_setTextureOptions(e={}){const t={minFilter:un,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let r=0;r<this.textures.length;r++)this.textures[r].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,r=1){if(this.width!==e||this.height!==t||this.depth!==r){this.width=e,this.height=t,this.depth=r;for(let a=0,l=this.textures.length;a<l;a++)this.textures[a].image.width=e,this.textures[a].image.height=t,this.textures[a].image.depth=r,this.textures[a].isData3DTexture!==!0&&(this.textures[a].isArrayTexture=this.textures[a].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,r=e.textures.length;t<r;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const a=Object.assign({},e.textures[t].image);this.textures[t].source=new Zf(a)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class qr extends e0{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}}class uh extends pn{constructor(e=null,t=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=Wn,this.minFilter=Wn,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class t0 extends pn{constructor(e=null,t=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=Wn,this.minFilter=Wn,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Co{constructor(e=new le(1/0,1/0,1/0),t=new le(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(lr.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(lr.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const r=lr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const l=r.getAttribute("position");if(t===!0&&l!==void 0&&e.isInstancedMesh!==!0)for(let u=0,o=l.count;u<o;u++)e.isMesh===!0?e.getVertexPosition(u,lr):lr.fromBufferAttribute(l,u),lr.applyMatrix4(e.matrixWorld),this.expandByPoint(lr);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ts.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),ts.copy(r.boundingBox)),ts.applyMatrix4(e.matrixWorld),this.union(ts)}const a=e.children;for(let l=0,u=a.length;l<u;l++)this.expandByObject(a[l],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,lr),lr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(eo),ns.subVectors(this.max,eo),ua.subVectors(e.a,eo),da.subVectors(e.b,eo),ha.subVectors(e.c,eo),fi.subVectors(da,ua),ui.subVectors(ha,da),Di.subVectors(ua,ha);let t=[0,-fi.z,fi.y,0,-ui.z,ui.y,0,-Di.z,Di.y,fi.z,0,-fi.x,ui.z,0,-ui.x,Di.z,0,-Di.x,-fi.y,fi.x,0,-ui.y,ui.x,0,-Di.y,Di.x,0];return!ic(t,ua,da,ha,ns)||(t=[1,0,0,0,1,0,0,0,1],!ic(t,ua,da,ha,ns))?!1:(rs.crossVectors(fi,ui),t=[rs.x,rs.y,rs.z],ic(t,ua,da,ha,ns))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,lr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(lr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Fr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Fr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Fr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Fr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Fr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Fr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Fr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Fr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Fr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Fr=[new le,new le,new le,new le,new le,new le,new le,new le],lr=new le,ts=new Co,ua=new le,da=new le,ha=new le,fi=new le,ui=new le,Di=new le,eo=new le,ns=new le,rs=new le,Li=new le;function ic(n,e,t,r,a){for(let l=0,u=n.length-3;l<=u;l+=3){Li.fromArray(n,l);const o=a.x*Math.abs(Li.x)+a.y*Math.abs(Li.y)+a.z*Math.abs(Li.z),p=e.dot(Li),m=t.dot(Li),g=r.dot(Li);if(Math.max(-Math.max(p,m,g),Math.min(p,m,g))>o)return!1}return!0}const n0=new Co,to=new le,ac=new le;class Jf{constructor(e=new le,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const r=this.center;t!==void 0?r.copy(t):n0.setFromPoints(e).getCenter(r);let a=0;for(let l=0,u=e.length;l<u;l++)a=Math.max(a,r.distanceToSquared(e[l]));return this.radius=Math.sqrt(a),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;to.subVectors(e,this.center);const t=to.lengthSq();if(t>this.radius*this.radius){const r=Math.sqrt(t),a=(r-this.radius)*.5;this.center.addScaledVector(to,a/r),this.radius+=a}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ac.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(to.copy(e.center).add(ac)),this.expandByPoint(to.copy(e.center).sub(ac))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Ir=new le,oc=new le,is=new le,di=new le,sc=new le,as=new le,lc=new le;class r0{constructor(e=new le,t=new le(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ir)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ir.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ir.copy(this.origin).addScaledVector(this.direction,t),Ir.distanceToSquared(e))}distanceSqToSegment(e,t,r,a){oc.copy(e).add(t).multiplyScalar(.5),is.copy(t).sub(e).normalize(),di.copy(this.origin).sub(oc);const l=e.distanceTo(t)*.5,u=-this.direction.dot(is),o=di.dot(this.direction),p=-di.dot(is),m=di.lengthSq(),g=Math.abs(1-u*u);let x,y,S,T;if(g>0)if(x=u*p-o,y=u*o-p,T=l*g,x>=0)if(y>=-T)if(y<=T){const L=1/g;x*=L,y*=L,S=x*(x+u*y+2*o)+y*(u*x+y+2*p)+m}else y=l,x=Math.max(0,-(u*y+o)),S=-x*x+y*(y+2*p)+m;else y=-l,x=Math.max(0,-(u*y+o)),S=-x*x+y*(y+2*p)+m;else y<=-T?(x=Math.max(0,-(-u*l+o)),y=x>0?-l:Math.min(Math.max(-l,-p),l),S=-x*x+y*(y+2*p)+m):y<=T?(x=0,y=Math.min(Math.max(-l,-p),l),S=y*(y+2*p)+m):(x=Math.max(0,-(u*l+o)),y=x>0?l:Math.min(Math.max(-l,-p),l),S=-x*x+y*(y+2*p)+m);else y=u>0?-l:l,x=Math.max(0,-(u*y+o)),S=-x*x+y*(y+2*p)+m;return r&&r.copy(this.origin).addScaledVector(this.direction,x),a&&a.copy(oc).addScaledVector(is,y),S}intersectSphere(e,t){Ir.subVectors(e.center,this.origin);const r=Ir.dot(this.direction),a=Ir.dot(Ir)-r*r,l=e.radius*e.radius;if(a>l)return null;const u=Math.sqrt(l-a),o=r-u,p=r+u;return p<0?null:o<0?this.at(p,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){const r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,a,l,u,o,p;const m=1/this.direction.x,g=1/this.direction.y,x=1/this.direction.z,y=this.origin;return m>=0?(r=(e.min.x-y.x)*m,a=(e.max.x-y.x)*m):(r=(e.max.x-y.x)*m,a=(e.min.x-y.x)*m),g>=0?(l=(e.min.y-y.y)*g,u=(e.max.y-y.y)*g):(l=(e.max.y-y.y)*g,u=(e.min.y-y.y)*g),r>u||l>a||((l>r||isNaN(r))&&(r=l),(u<a||isNaN(a))&&(a=u),x>=0?(o=(e.min.z-y.z)*x,p=(e.max.z-y.z)*x):(o=(e.max.z-y.z)*x,p=(e.min.z-y.z)*x),r>p||o>a)||((o>r||r!==r)&&(r=o),(p<a||a!==a)&&(a=p),a<0)?null:this.at(r>=0?r:a,t)}intersectsBox(e){return this.intersectBox(e,Ir)!==null}intersectTriangle(e,t,r,a,l){sc.subVectors(t,e),as.subVectors(r,e),lc.crossVectors(sc,as);let u=this.direction.dot(lc),o;if(u>0){if(a)return null;o=1}else if(u<0)o=-1,u=-u;else return null;di.subVectors(this.origin,e);const p=o*this.direction.dot(as.crossVectors(di,as));if(p<0)return null;const m=o*this.direction.dot(sc.cross(di));if(m<0||p+m>u)return null;const g=-o*di.dot(lc);return g<0?null:this.at(g/u,l)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class on{constructor(e,t,r,a,l,u,o,p,m,g,x,y,S,T,L,E){on.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,r,a,l,u,o,p,m,g,x,y,S,T,L,E)}set(e,t,r,a,l,u,o,p,m,g,x,y,S,T,L,E){const b=this.elements;return b[0]=e,b[4]=t,b[8]=r,b[12]=a,b[1]=l,b[5]=u,b[9]=o,b[13]=p,b[2]=m,b[6]=g,b[10]=x,b[14]=y,b[3]=S,b[7]=T,b[11]=L,b[15]=E,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new on().fromArray(this.elements)}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t[9]=r[9],t[10]=r[10],t[11]=r[11],t[12]=r[12],t[13]=r[13],t[14]=r[14],t[15]=r[15],this}copyPosition(e){const t=this.elements,r=e.elements;return t[12]=r[12],t[13]=r[13],t[14]=r[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,r){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,t,r){return this.set(e.x,t.x,r.x,0,e.y,t.y,r.y,0,e.z,t.z,r.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,r=e.elements,a=1/pa.setFromMatrixColumn(e,0).length(),l=1/pa.setFromMatrixColumn(e,1).length(),u=1/pa.setFromMatrixColumn(e,2).length();return t[0]=r[0]*a,t[1]=r[1]*a,t[2]=r[2]*a,t[3]=0,t[4]=r[4]*l,t[5]=r[5]*l,t[6]=r[6]*l,t[7]=0,t[8]=r[8]*u,t[9]=r[9]*u,t[10]=r[10]*u,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,r=e.x,a=e.y,l=e.z,u=Math.cos(r),o=Math.sin(r),p=Math.cos(a),m=Math.sin(a),g=Math.cos(l),x=Math.sin(l);if(e.order==="XYZ"){const y=u*g,S=u*x,T=o*g,L=o*x;t[0]=p*g,t[4]=-p*x,t[8]=m,t[1]=S+T*m,t[5]=y-L*m,t[9]=-o*p,t[2]=L-y*m,t[6]=T+S*m,t[10]=u*p}else if(e.order==="YXZ"){const y=p*g,S=p*x,T=m*g,L=m*x;t[0]=y+L*o,t[4]=T*o-S,t[8]=u*m,t[1]=u*x,t[5]=u*g,t[9]=-o,t[2]=S*o-T,t[6]=L+y*o,t[10]=u*p}else if(e.order==="ZXY"){const y=p*g,S=p*x,T=m*g,L=m*x;t[0]=y-L*o,t[4]=-u*x,t[8]=T+S*o,t[1]=S+T*o,t[5]=u*g,t[9]=L-y*o,t[2]=-u*m,t[6]=o,t[10]=u*p}else if(e.order==="ZYX"){const y=u*g,S=u*x,T=o*g,L=o*x;t[0]=p*g,t[4]=T*m-S,t[8]=y*m+L,t[1]=p*x,t[5]=L*m+y,t[9]=S*m-T,t[2]=-m,t[6]=o*p,t[10]=u*p}else if(e.order==="YZX"){const y=u*p,S=u*m,T=o*p,L=o*m;t[0]=p*g,t[4]=L-y*x,t[8]=T*x+S,t[1]=x,t[5]=u*g,t[9]=-o*g,t[2]=-m*g,t[6]=S*x+T,t[10]=y-L*x}else if(e.order==="XZY"){const y=u*p,S=u*m,T=o*p,L=o*m;t[0]=p*g,t[4]=-x,t[8]=m*g,t[1]=y*x+L,t[5]=u*g,t[9]=S*x-T,t[2]=T*x-S,t[6]=o*g,t[10]=L*x+y}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(i0,e,a0)}lookAt(e,t,r){const a=this.elements;return On.subVectors(e,t),On.lengthSq()===0&&(On.z=1),On.normalize(),hi.crossVectors(r,On),hi.lengthSq()===0&&(Math.abs(r.z)===1?On.x+=1e-4:On.z+=1e-4,On.normalize(),hi.crossVectors(r,On)),hi.normalize(),os.crossVectors(On,hi),a[0]=hi.x,a[4]=os.x,a[8]=On.x,a[1]=hi.y,a[5]=os.y,a[9]=On.y,a[2]=hi.z,a[6]=os.z,a[10]=On.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,a=t.elements,l=this.elements,u=r[0],o=r[4],p=r[8],m=r[12],g=r[1],x=r[5],y=r[9],S=r[13],T=r[2],L=r[6],E=r[10],b=r[14],V=r[3],H=r[7],X=r[11],I=r[15],R=a[0],F=a[4],W=a[8],D=a[12],w=a[1],z=a[5],B=a[9],Y=a[13],Z=a[2],j=a[6],J=a[10],ue=a[14],te=a[3],Se=a[7],be=a[11],Ye=a[15];return l[0]=u*R+o*w+p*Z+m*te,l[4]=u*F+o*z+p*j+m*Se,l[8]=u*W+o*B+p*J+m*be,l[12]=u*D+o*Y+p*ue+m*Ye,l[1]=g*R+x*w+y*Z+S*te,l[5]=g*F+x*z+y*j+S*Se,l[9]=g*W+x*B+y*J+S*be,l[13]=g*D+x*Y+y*ue+S*Ye,l[2]=T*R+L*w+E*Z+b*te,l[6]=T*F+L*z+E*j+b*Se,l[10]=T*W+L*B+E*J+b*be,l[14]=T*D+L*Y+E*ue+b*Ye,l[3]=V*R+H*w+X*Z+I*te,l[7]=V*F+H*z+X*j+I*Se,l[11]=V*W+H*B+X*J+I*be,l[15]=V*D+H*Y+X*ue+I*Ye,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[4],a=e[8],l=e[12],u=e[1],o=e[5],p=e[9],m=e[13],g=e[2],x=e[6],y=e[10],S=e[14],T=e[3],L=e[7],E=e[11],b=e[15];return T*(+l*p*x-a*m*x-l*o*y+r*m*y+a*o*S-r*p*S)+L*(+t*p*S-t*m*y+l*u*y-a*u*S+a*m*g-l*p*g)+E*(+t*m*x-t*o*S-l*u*x+r*u*S+l*o*g-r*m*g)+b*(-a*o*g-t*p*x+t*o*y+a*u*x-r*u*y+r*p*g)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,r){const a=this.elements;return e.isVector3?(a[12]=e.x,a[13]=e.y,a[14]=e.z):(a[12]=e,a[13]=t,a[14]=r),this}invert(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],u=e[4],o=e[5],p=e[6],m=e[7],g=e[8],x=e[9],y=e[10],S=e[11],T=e[12],L=e[13],E=e[14],b=e[15],V=x*E*m-L*y*m+L*p*S-o*E*S-x*p*b+o*y*b,H=T*y*m-g*E*m-T*p*S+u*E*S+g*p*b-u*y*b,X=g*L*m-T*x*m+T*o*S-u*L*S-g*o*b+u*x*b,I=T*x*p-g*L*p-T*o*y+u*L*y+g*o*E-u*x*E,R=t*V+r*H+a*X+l*I;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const F=1/R;return e[0]=V*F,e[1]=(L*y*l-x*E*l-L*a*S+r*E*S+x*a*b-r*y*b)*F,e[2]=(o*E*l-L*p*l+L*a*m-r*E*m-o*a*b+r*p*b)*F,e[3]=(x*p*l-o*y*l-x*a*m+r*y*m+o*a*S-r*p*S)*F,e[4]=H*F,e[5]=(g*E*l-T*y*l+T*a*S-t*E*S-g*a*b+t*y*b)*F,e[6]=(T*p*l-u*E*l-T*a*m+t*E*m+u*a*b-t*p*b)*F,e[7]=(u*y*l-g*p*l+g*a*m-t*y*m-u*a*S+t*p*S)*F,e[8]=X*F,e[9]=(T*x*l-g*L*l-T*r*S+t*L*S+g*r*b-t*x*b)*F,e[10]=(u*L*l-T*o*l+T*r*m-t*L*m-u*r*b+t*o*b)*F,e[11]=(g*o*l-u*x*l-g*r*m+t*x*m+u*r*S-t*o*S)*F,e[12]=I*F,e[13]=(g*L*a-T*x*a+T*r*y-t*L*y-g*r*E+t*x*E)*F,e[14]=(T*o*a-u*L*a-T*r*p+t*L*p+u*r*E-t*o*E)*F,e[15]=(u*x*a-g*o*a+g*r*p-t*x*p-u*r*y+t*o*y)*F,this}scale(e){const t=this.elements,r=e.x,a=e.y,l=e.z;return t[0]*=r,t[4]*=a,t[8]*=l,t[1]*=r,t[5]*=a,t[9]*=l,t[2]*=r,t[6]*=a,t[10]*=l,t[3]*=r,t[7]*=a,t[11]*=l,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],a=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,r,a))}makeTranslation(e,t,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,r,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,t,-r,0,0,r,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,0,r,0,0,1,0,0,-r,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,0,r,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const r=Math.cos(t),a=Math.sin(t),l=1-r,u=e.x,o=e.y,p=e.z,m=l*u,g=l*o;return this.set(m*u+r,m*o-a*p,m*p+a*o,0,m*o+a*p,g*o+r,g*p-a*u,0,m*p-a*o,g*p+a*u,l*p*p+r,0,0,0,0,1),this}makeScale(e,t,r){return this.set(e,0,0,0,0,t,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,t,r,a,l,u){return this.set(1,r,l,0,e,1,u,0,t,a,1,0,0,0,0,1),this}compose(e,t,r){const a=this.elements,l=t._x,u=t._y,o=t._z,p=t._w,m=l+l,g=u+u,x=o+o,y=l*m,S=l*g,T=l*x,L=u*g,E=u*x,b=o*x,V=p*m,H=p*g,X=p*x,I=r.x,R=r.y,F=r.z;return a[0]=(1-(L+b))*I,a[1]=(S+X)*I,a[2]=(T-H)*I,a[3]=0,a[4]=(S-X)*R,a[5]=(1-(y+b))*R,a[6]=(E+V)*R,a[7]=0,a[8]=(T+H)*F,a[9]=(E-V)*F,a[10]=(1-(y+L))*F,a[11]=0,a[12]=e.x,a[13]=e.y,a[14]=e.z,a[15]=1,this}decompose(e,t,r){const a=this.elements;let l=pa.set(a[0],a[1],a[2]).length();const u=pa.set(a[4],a[5],a[6]).length(),o=pa.set(a[8],a[9],a[10]).length();this.determinant()<0&&(l=-l),e.x=a[12],e.y=a[13],e.z=a[14],cr.copy(this);const m=1/l,g=1/u,x=1/o;return cr.elements[0]*=m,cr.elements[1]*=m,cr.elements[2]*=m,cr.elements[4]*=g,cr.elements[5]*=g,cr.elements[6]*=g,cr.elements[8]*=x,cr.elements[9]*=x,cr.elements[10]*=x,t.setFromRotationMatrix(cr),r.x=l,r.y=u,r.z=o,this}makePerspective(e,t,r,a,l,u,o=Tr,p=!1){const m=this.elements,g=2*l/(t-e),x=2*l/(r-a),y=(t+e)/(t-e),S=(r+a)/(r-a);let T,L;if(p)T=l/(u-l),L=u*l/(u-l);else if(o===Tr)T=-(u+l)/(u-l),L=-2*u*l/(u-l);else if(o===Ns)T=-u/(u-l),L=-u*l/(u-l);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return m[0]=g,m[4]=0,m[8]=y,m[12]=0,m[1]=0,m[5]=x,m[9]=S,m[13]=0,m[2]=0,m[6]=0,m[10]=T,m[14]=L,m[3]=0,m[7]=0,m[11]=-1,m[15]=0,this}makeOrthographic(e,t,r,a,l,u,o=Tr,p=!1){const m=this.elements,g=2/(t-e),x=2/(r-a),y=-(t+e)/(t-e),S=-(r+a)/(r-a);let T,L;if(p)T=1/(u-l),L=u/(u-l);else if(o===Tr)T=-2/(u-l),L=-(u+l)/(u-l);else if(o===Ns)T=-1/(u-l),L=-l/(u-l);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return m[0]=g,m[4]=0,m[8]=0,m[12]=y,m[1]=0,m[5]=x,m[9]=0,m[13]=S,m[2]=0,m[6]=0,m[10]=T,m[14]=L,m[3]=0,m[7]=0,m[11]=0,m[15]=1,this}equals(e){const t=this.elements,r=e.elements;for(let a=0;a<16;a++)if(t[a]!==r[a])return!1;return!0}fromArray(e,t=0){for(let r=0;r<16;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e[t+9]=r[9],e[t+10]=r[10],e[t+11]=r[11],e[t+12]=r[12],e[t+13]=r[13],e[t+14]=r[14],e[t+15]=r[15],e}}const pa=new le,cr=new on,i0=new le(0,0,0),a0=new le(1,1,1),hi=new le,os=new le,On=new le,Au=new on,Cu=new Ao;class Yr{constructor(e=0,t=0,r=0,a=Yr.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=r,this._order=a}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,r,a=this._order){return this._x=e,this._y=t,this._z=r,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,r=!0){const a=e.elements,l=a[0],u=a[4],o=a[8],p=a[1],m=a[5],g=a[9],x=a[2],y=a[6],S=a[10];switch(t){case"XYZ":this._y=Math.asin(Et(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-g,S),this._z=Math.atan2(-u,l)):(this._x=Math.atan2(y,m),this._z=0);break;case"YXZ":this._x=Math.asin(-Et(g,-1,1)),Math.abs(g)<.9999999?(this._y=Math.atan2(o,S),this._z=Math.atan2(p,m)):(this._y=Math.atan2(-x,l),this._z=0);break;case"ZXY":this._x=Math.asin(Et(y,-1,1)),Math.abs(y)<.9999999?(this._y=Math.atan2(-x,S),this._z=Math.atan2(-u,m)):(this._y=0,this._z=Math.atan2(p,l));break;case"ZYX":this._y=Math.asin(-Et(x,-1,1)),Math.abs(x)<.9999999?(this._x=Math.atan2(y,S),this._z=Math.atan2(p,l)):(this._x=0,this._z=Math.atan2(-u,m));break;case"YZX":this._z=Math.asin(Et(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(-g,m),this._y=Math.atan2(-x,l)):(this._x=0,this._y=Math.atan2(o,S));break;case"XZY":this._z=Math.asin(-Et(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(y,m),this._y=Math.atan2(o,l)):(this._x=Math.atan2(-g,S),this._y=0);break;default:mt("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,r){return Au.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Au,t,r)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Cu.setFromEuler(this),this.setFromQuaternion(Cu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Yr.DEFAULT_ORDER="XYZ";class dh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let o0=0;const Ru=new le,ma=new Ao,Ur=new on,ss=new le,no=new le,s0=new le,l0=new Ao,Pu=new le(1,0,0),Du=new le(0,1,0),Lu=new le(0,0,1),Fu={type:"added"},c0={type:"removed"},_a={type:"childadded",child:null},cc={type:"childremoved",child:null};class Xn extends Ba{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:o0++}),this.uuid=To(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Xn.DEFAULT_UP.clone();const e=new le,t=new Yr,r=new Ao,a=new le(1,1,1);function l(){r.setFromEuler(t,!1)}function u(){t.setFromQuaternion(r,void 0,!1)}t._onChange(l),r._onChange(u),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new on},normalMatrix:{value:new gt}}),this.matrix=new on,this.matrixWorld=new on,this.matrixAutoUpdate=Xn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Xn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new dh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ma.setFromAxisAngle(e,t),this.quaternion.multiply(ma),this}rotateOnWorldAxis(e,t){return ma.setFromAxisAngle(e,t),this.quaternion.premultiply(ma),this}rotateX(e){return this.rotateOnAxis(Pu,e)}rotateY(e){return this.rotateOnAxis(Du,e)}rotateZ(e){return this.rotateOnAxis(Lu,e)}translateOnAxis(e,t){return Ru.copy(e).applyQuaternion(this.quaternion),this.position.add(Ru.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Pu,e)}translateY(e){return this.translateOnAxis(Du,e)}translateZ(e){return this.translateOnAxis(Lu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ur.copy(this.matrixWorld).invert())}lookAt(e,t,r){e.isVector3?ss.copy(e):ss.set(e,t,r);const a=this.parent;this.updateWorldMatrix(!0,!1),no.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ur.lookAt(no,ss,this.up):Ur.lookAt(ss,no,this.up),this.quaternion.setFromRotationMatrix(Ur),a&&(Ur.extractRotation(a.matrixWorld),ma.setFromRotationMatrix(Ur),this.quaternion.premultiply(ma.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Jt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Fu),_a.child=e,this.dispatchEvent(_a),_a.child=null):Jt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(c0),cc.child=e,this.dispatchEvent(cc),cc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ur.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ur.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ur),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Fu),_a.child=e,this.dispatchEvent(_a),_a.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let r=0,a=this.children.length;r<a;r++){const u=this.children[r].getObjectByProperty(e,t);if(u!==void 0)return u}}getObjectsByProperty(e,t,r=[]){this[e]===t&&r.push(this);const a=this.children;for(let l=0,u=a.length;l<u;l++)a[l].getObjectsByProperty(e,t,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(no,e,s0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(no,l0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].updateMatrixWorld(e)}updateWorldMatrix(e,t){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const a=this.children;for(let l=0,u=a.length;l<u;l++)a[l].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",r={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const a={};a.uuid=this.uuid,a.type=this.type,this.name!==""&&(a.name=this.name),this.castShadow===!0&&(a.castShadow=!0),this.receiveShadow===!0&&(a.receiveShadow=!0),this.visible===!1&&(a.visible=!1),this.frustumCulled===!1&&(a.frustumCulled=!1),this.renderOrder!==0&&(a.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(a.matrixAutoUpdate=!1),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),a.instanceInfo=this._instanceInfo.map(o=>({...o})),a.availableInstanceIds=this._availableInstanceIds.slice(),a.availableGeometryIds=this._availableGeometryIds.slice(),a.nextIndexStart=this._nextIndexStart,a.nextVertexStart=this._nextVertexStart,a.geometryCount=this._geometryCount,a.maxInstanceCount=this._maxInstanceCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.matricesTexture=this._matricesTexture.toJSON(e),a.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(a.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(a.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(a.boundingBox=this.boundingBox.toJSON()));function l(o,p){return o[p.uuid]===void 0&&(o[p.uuid]=p.toJSON(e)),p.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=l(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const p=o.shapes;if(Array.isArray(p))for(let m=0,g=p.length;m<g;m++){const x=p[m];l(e.shapes,x)}else l(e.shapes,p)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(l(e.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let p=0,m=this.material.length;p<m;p++)o.push(l(e.materials,this.material[p]));a.material=o}else a.material=l(e.materials,this.material);if(this.children.length>0){a.children=[];for(let o=0;o<this.children.length;o++)a.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){a.animations=[];for(let o=0;o<this.animations.length;o++){const p=this.animations[o];a.animations.push(l(e.animations,p))}}if(t){const o=u(e.geometries),p=u(e.materials),m=u(e.textures),g=u(e.images),x=u(e.shapes),y=u(e.skeletons),S=u(e.animations),T=u(e.nodes);o.length>0&&(r.geometries=o),p.length>0&&(r.materials=p),m.length>0&&(r.textures=m),g.length>0&&(r.images=g),x.length>0&&(r.shapes=x),y.length>0&&(r.skeletons=y),S.length>0&&(r.animations=S),T.length>0&&(r.nodes=T)}return r.object=a,r;function u(o){const p=[];for(const m in o){const g=o[m];delete g.metadata,p.push(g)}return p}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let r=0;r<e.children.length;r++){const a=e.children[r];this.add(a.clone())}return this}}Xn.DEFAULT_UP=new le(0,1,0);Xn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Xn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const fr=new le,Nr=new le,fc=new le,Or=new le,ga=new le,va=new le,Iu=new le,uc=new le,dc=new le,hc=new le,pc=new Qt,mc=new Qt,_c=new Qt;class dr{constructor(e=new le,t=new le,r=new le){this.a=e,this.b=t,this.c=r}static getNormal(e,t,r,a){a.subVectors(r,t),fr.subVectors(e,t),a.cross(fr);const l=a.lengthSq();return l>0?a.multiplyScalar(1/Math.sqrt(l)):a.set(0,0,0)}static getBarycoord(e,t,r,a,l){fr.subVectors(a,t),Nr.subVectors(r,t),fc.subVectors(e,t);const u=fr.dot(fr),o=fr.dot(Nr),p=fr.dot(fc),m=Nr.dot(Nr),g=Nr.dot(fc),x=u*m-o*o;if(x===0)return l.set(0,0,0),null;const y=1/x,S=(m*p-o*g)*y,T=(u*g-o*p)*y;return l.set(1-S-T,T,S)}static containsPoint(e,t,r,a){return this.getBarycoord(e,t,r,a,Or)===null?!1:Or.x>=0&&Or.y>=0&&Or.x+Or.y<=1}static getInterpolation(e,t,r,a,l,u,o,p){return this.getBarycoord(e,t,r,a,Or)===null?(p.x=0,p.y=0,"z"in p&&(p.z=0),"w"in p&&(p.w=0),null):(p.setScalar(0),p.addScaledVector(l,Or.x),p.addScaledVector(u,Or.y),p.addScaledVector(o,Or.z),p)}static getInterpolatedAttribute(e,t,r,a,l,u){return pc.setScalar(0),mc.setScalar(0),_c.setScalar(0),pc.fromBufferAttribute(e,t),mc.fromBufferAttribute(e,r),_c.fromBufferAttribute(e,a),u.setScalar(0),u.addScaledVector(pc,l.x),u.addScaledVector(mc,l.y),u.addScaledVector(_c,l.z),u}static isFrontFacing(e,t,r,a){return fr.subVectors(r,t),Nr.subVectors(e,t),fr.cross(Nr).dot(a)<0}set(e,t,r){return this.a.copy(e),this.b.copy(t),this.c.copy(r),this}setFromPointsAndIndices(e,t,r,a){return this.a.copy(e[t]),this.b.copy(e[r]),this.c.copy(e[a]),this}setFromAttributeAndIndices(e,t,r,a){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,a),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return fr.subVectors(this.c,this.b),Nr.subVectors(this.a,this.b),fr.cross(Nr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return dr.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return dr.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,r,a,l){return dr.getInterpolation(e,this.a,this.b,this.c,t,r,a,l)}containsPoint(e){return dr.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return dr.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const r=this.a,a=this.b,l=this.c;let u,o;ga.subVectors(a,r),va.subVectors(l,r),uc.subVectors(e,r);const p=ga.dot(uc),m=va.dot(uc);if(p<=0&&m<=0)return t.copy(r);dc.subVectors(e,a);const g=ga.dot(dc),x=va.dot(dc);if(g>=0&&x<=g)return t.copy(a);const y=p*x-g*m;if(y<=0&&p>=0&&g<=0)return u=p/(p-g),t.copy(r).addScaledVector(ga,u);hc.subVectors(e,l);const S=ga.dot(hc),T=va.dot(hc);if(T>=0&&S<=T)return t.copy(l);const L=S*m-p*T;if(L<=0&&m>=0&&T<=0)return o=m/(m-T),t.copy(r).addScaledVector(va,o);const E=g*T-S*x;if(E<=0&&x-g>=0&&S-T>=0)return Iu.subVectors(l,a),o=(x-g)/(x-g+(S-T)),t.copy(a).addScaledVector(Iu,o);const b=1/(E+L+y);return u=L*b,o=y*b,t.copy(r).addScaledVector(ga,u).addScaledVector(va,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const hh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},pi={h:0,s:0,l:0},ls={h:0,s:0,l:0};function gc(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class zt{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){const a=e;a&&a.isColor?this.copy(a):typeof a=="number"?this.setHex(a):typeof a=="string"&&this.setStyle(a)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=zn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Rt.colorSpaceToWorking(this,t),this}setRGB(e,t,r,a=Rt.workingColorSpace){return this.r=e,this.g=t,this.b=r,Rt.colorSpaceToWorking(this,a),this}setHSL(e,t,r,a=Rt.workingColorSpace){if(e=jm(e,1),t=Et(t,0,1),r=Et(r,0,1),t===0)this.r=this.g=this.b=r;else{const l=r<=.5?r*(1+t):r+t-r*t,u=2*r-l;this.r=gc(u,l,e+1/3),this.g=gc(u,l,e),this.b=gc(u,l,e-1/3)}return Rt.colorSpaceToWorking(this,a),this}setStyle(e,t=zn){function r(l){l!==void 0&&parseFloat(l)<1&&mt("Color: Alpha component of "+e+" will be ignored.")}let a;if(a=/^(\w+)\(([^\)]*)\)/.exec(e)){let l;const u=a[1],o=a[2];switch(u){case"rgb":case"rgba":if(l=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return r(l[4]),this.setRGB(Math.min(255,parseInt(l[1],10))/255,Math.min(255,parseInt(l[2],10))/255,Math.min(255,parseInt(l[3],10))/255,t);if(l=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return r(l[4]),this.setRGB(Math.min(100,parseInt(l[1],10))/100,Math.min(100,parseInt(l[2],10))/100,Math.min(100,parseInt(l[3],10))/100,t);break;case"hsl":case"hsla":if(l=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return r(l[4]),this.setHSL(parseFloat(l[1])/360,parseFloat(l[2])/100,parseFloat(l[3])/100,t);break;default:mt("Color: Unknown color model "+e)}}else if(a=/^\#([A-Fa-f\d]+)$/.exec(e)){const l=a[1],u=l.length;if(u===3)return this.setRGB(parseInt(l.charAt(0),16)/15,parseInt(l.charAt(1),16)/15,parseInt(l.charAt(2),16)/15,t);if(u===6)return this.setHex(parseInt(l,16),t);mt("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=zn){const r=hh[e.toLowerCase()];return r!==void 0?this.setHex(r,t):mt("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=$r(e.r),this.g=$r(e.g),this.b=$r(e.b),this}copyLinearToSRGB(e){return this.r=Ra(e.r),this.g=Ra(e.g),this.b=Ra(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=zn){return Rt.workingToColorSpace(gn.copy(this),e),Math.round(Et(gn.r*255,0,255))*65536+Math.round(Et(gn.g*255,0,255))*256+Math.round(Et(gn.b*255,0,255))}getHexString(e=zn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Rt.workingColorSpace){Rt.workingToColorSpace(gn.copy(this),t);const r=gn.r,a=gn.g,l=gn.b,u=Math.max(r,a,l),o=Math.min(r,a,l);let p,m;const g=(o+u)/2;if(o===u)p=0,m=0;else{const x=u-o;switch(m=g<=.5?x/(u+o):x/(2-u-o),u){case r:p=(a-l)/x+(a<l?6:0);break;case a:p=(l-r)/x+2;break;case l:p=(r-a)/x+4;break}p/=6}return e.h=p,e.s=m,e.l=g,e}getRGB(e,t=Rt.workingColorSpace){return Rt.workingToColorSpace(gn.copy(this),t),e.r=gn.r,e.g=gn.g,e.b=gn.b,e}getStyle(e=zn){Rt.workingToColorSpace(gn.copy(this),e);const t=gn.r,r=gn.g,a=gn.b;return e!==zn?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${a.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(a*255)})`}offsetHSL(e,t,r){return this.getHSL(pi),this.setHSL(pi.h+e,pi.s+t,pi.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(pi),e.getHSL(ls);const r=Ql(pi.h,ls.h,t),a=Ql(pi.s,ls.s,t),l=Ql(pi.l,ls.l,t);return this.setHSL(r,a,l),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,r=this.g,a=this.b,l=e.elements;return this.r=l[0]*t+l[3]*r+l[6]*a,this.g=l[1]*t+l[4]*r+l[7]*a,this.b=l[2]*t+l[5]*r+l[8]*a,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const gn=new zt;zt.NAMES=hh;let f0=0;class qs extends Ba{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:f0++}),this.uuid=To(),this.name="",this.type="Material",this.blending=Ca,this.side=Si,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=kc,this.blendDst=Bc,this.blendEquation=ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new zt(0,0,0),this.blendAlpha=0,this.depthFunc=Fa,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=xu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ca,this.stencilZFail=ca,this.stencilZPass=ca,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const r=e[t];if(r===void 0){mt(`Material: parameter '${t}' has value of undefined.`);continue}const a=this[t];if(a===void 0){mt(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}a&&a.isColor?a.set(r):a&&a.isVector3&&r&&r.isVector3?a.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const r={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(r.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(r.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==Ca&&(r.blending=this.blending),this.side!==Si&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==kc&&(r.blendSrc=this.blendSrc),this.blendDst!==Bc&&(r.blendDst=this.blendDst),this.blendEquation!==ki&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==Fa&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==xu&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ca&&(r.stencilFail=this.stencilFail),this.stencilZFail!==ca&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==ca&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function a(l){const u=[];for(const o in l){const p=l[o];delete p.metadata,u.push(p)}return u}if(t){const l=a(e.textures),u=a(e.images);l.length>0&&(r.textures=l),u.length>0&&(r.images=u)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let r=null;if(t!==null){const a=t.length;r=new Array(a);for(let l=0;l!==a;++l)r[l]=t[l].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Qf extends qs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new zt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yr,this.combine=th,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Hr=u0();function u0(){const n=new ArrayBuffer(4),e=new Float32Array(n),t=new Uint32Array(n),r=new Uint32Array(512),a=new Uint32Array(512);for(let p=0;p<256;++p){const m=p-127;m<-27?(r[p]=0,r[p|256]=32768,a[p]=24,a[p|256]=24):m<-14?(r[p]=1024>>-m-14,r[p|256]=1024>>-m-14|32768,a[p]=-m-1,a[p|256]=-m-1):m<=15?(r[p]=m+15<<10,r[p|256]=m+15<<10|32768,a[p]=13,a[p|256]=13):m<128?(r[p]=31744,r[p|256]=64512,a[p]=24,a[p|256]=24):(r[p]=31744,r[p|256]=64512,a[p]=13,a[p|256]=13)}const l=new Uint32Array(2048),u=new Uint32Array(64),o=new Uint32Array(64);for(let p=1;p<1024;++p){let m=p<<13,g=0;for(;(m&8388608)===0;)m<<=1,g-=8388608;m&=-8388609,g+=947912704,l[p]=m|g}for(let p=1024;p<2048;++p)l[p]=939524096+(p-1024<<13);for(let p=1;p<31;++p)u[p]=p<<23;u[31]=1199570944,u[32]=2147483648;for(let p=33;p<63;++p)u[p]=2147483648+(p-32<<23);u[63]=3347054592;for(let p=1;p<64;++p)p!==32&&(o[p]=1024);return{floatView:e,uint32View:t,baseTable:r,shiftTable:a,mantissaTable:l,exponentTable:u,offsetTable:o}}function d0(n){Math.abs(n)>65504&&mt("DataUtils.toHalfFloat(): Value out of range."),n=Et(n,-65504,65504),Hr.floatView[0]=n;const e=Hr.uint32View[0],t=e>>23&511;return Hr.baseTable[t]+((e&8388607)>>Hr.shiftTable[t])}function h0(n){const e=n>>10;return Hr.uint32View[0]=Hr.mantissaTable[Hr.offsetTable[e]+(n&1023)]+Hr.exponentTable[e],Hr.floatView[0]}class cs{static toHalfFloat(e){return d0(e)}static fromHalfFloat(e){return h0(e)}}const tn=new le,fs=new Gt;let p0=0;class Ar{constructor(e,t,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:p0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=yu,this.updateRanges=[],this.gpuType=Zn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let a=0,l=this.itemSize;a<l;a++)this.array[e+a]=t.array[r+a];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)fs.fromBufferAttribute(this,t),fs.applyMatrix3(e),this.setXY(t,fs.x,fs.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)tn.fromBufferAttribute(this,t),tn.applyMatrix3(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)tn.fromBufferAttribute(this,t),tn.applyMatrix4(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)tn.fromBufferAttribute(this,t),tn.applyNormalMatrix(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)tn.fromBufferAttribute(this,t),tn.transformDirection(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=Qa(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Pn(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Qa(t,this.array)),t}setX(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Qa(t,this.array)),t}setY(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Qa(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Qa(t,this.array)),t}setW(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=Pn(t,this.array),r=Pn(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,a){return e*=this.itemSize,this.normalized&&(t=Pn(t,this.array),r=Pn(r,this.array),a=Pn(a,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=a,this}setXYZW(e,t,r,a,l){return e*=this.itemSize,this.normalized&&(t=Pn(t,this.array),r=Pn(r,this.array),a=Pn(a,this.array),l=Pn(l,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=a,this.array[e+3]=l,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==yu&&(e.usage=this.usage),e}}class ph extends Ar{constructor(e,t,r){super(new Uint16Array(e),t,r)}}class mh extends Ar{constructor(e,t,r){super(new Uint32Array(e),t,r)}}class Vi extends Ar{constructor(e,t,r){super(new Float32Array(e),t,r)}}let m0=0;const qn=new on,vc=new Xn,xa=new le,kn=new Co,ro=new Co,fn=new le;class Ei extends Ba{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:m0++}),this.uuid=To(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(fh(e)?mh:ph)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,r=0){this.groups.push({start:e,count:t,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const l=new gt().getNormalMatrix(e);r.applyNormalMatrix(l),r.needsUpdate=!0}const a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(e),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return qn.makeRotationFromQuaternion(e),this.applyMatrix4(qn),this}rotateX(e){return qn.makeRotationX(e),this.applyMatrix4(qn),this}rotateY(e){return qn.makeRotationY(e),this.applyMatrix4(qn),this}rotateZ(e){return qn.makeRotationZ(e),this.applyMatrix4(qn),this}translate(e,t,r){return qn.makeTranslation(e,t,r),this.applyMatrix4(qn),this}scale(e,t,r){return qn.makeScale(e,t,r),this.applyMatrix4(qn),this}lookAt(e){return vc.lookAt(e),vc.updateMatrix(),this.applyMatrix4(vc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(xa).negate(),this.translate(xa.x,xa.y,xa.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const r=[];for(let a=0,l=e.length;a<l;a++){const u=e[a];r.push(u.x,u.y,u.z||0)}this.setAttribute("position",new Vi(r,3))}else{const r=Math.min(e.length,t.count);for(let a=0;a<r;a++){const l=e[a];t.setXYZ(a,l.x,l.y,l.z||0)}e.length>t.count&&mt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Co);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Jt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new le(-1/0,-1/0,-1/0),new le(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const l=t[r];kn.setFromBufferAttribute(l),this.morphTargetsRelative?(fn.addVectors(this.boundingBox.min,kn.min),this.boundingBox.expandByPoint(fn),fn.addVectors(this.boundingBox.max,kn.max),this.boundingBox.expandByPoint(fn)):(this.boundingBox.expandByPoint(kn.min),this.boundingBox.expandByPoint(kn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Jt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Jf);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Jt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new le,1/0);return}if(e){const r=this.boundingSphere.center;if(kn.setFromBufferAttribute(e),t)for(let l=0,u=t.length;l<u;l++){const o=t[l];ro.setFromBufferAttribute(o),this.morphTargetsRelative?(fn.addVectors(kn.min,ro.min),kn.expandByPoint(fn),fn.addVectors(kn.max,ro.max),kn.expandByPoint(fn)):(kn.expandByPoint(ro.min),kn.expandByPoint(ro.max))}kn.getCenter(r);let a=0;for(let l=0,u=e.count;l<u;l++)fn.fromBufferAttribute(e,l),a=Math.max(a,r.distanceToSquared(fn));if(t)for(let l=0,u=t.length;l<u;l++){const o=t[l],p=this.morphTargetsRelative;for(let m=0,g=o.count;m<g;m++)fn.fromBufferAttribute(o,m),p&&(xa.fromBufferAttribute(e,m),fn.add(xa)),a=Math.max(a,r.distanceToSquared(fn))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&Jt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Jt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=t.position,a=t.normal,l=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ar(new Float32Array(4*r.count),4));const u=this.getAttribute("tangent"),o=[],p=[];for(let W=0;W<r.count;W++)o[W]=new le,p[W]=new le;const m=new le,g=new le,x=new le,y=new Gt,S=new Gt,T=new Gt,L=new le,E=new le;function b(W,D,w){m.fromBufferAttribute(r,W),g.fromBufferAttribute(r,D),x.fromBufferAttribute(r,w),y.fromBufferAttribute(l,W),S.fromBufferAttribute(l,D),T.fromBufferAttribute(l,w),g.sub(m),x.sub(m),S.sub(y),T.sub(y);const z=1/(S.x*T.y-T.x*S.y);isFinite(z)&&(L.copy(g).multiplyScalar(T.y).addScaledVector(x,-S.y).multiplyScalar(z),E.copy(x).multiplyScalar(S.x).addScaledVector(g,-T.x).multiplyScalar(z),o[W].add(L),o[D].add(L),o[w].add(L),p[W].add(E),p[D].add(E),p[w].add(E))}let V=this.groups;V.length===0&&(V=[{start:0,count:e.count}]);for(let W=0,D=V.length;W<D;++W){const w=V[W],z=w.start,B=w.count;for(let Y=z,Z=z+B;Y<Z;Y+=3)b(e.getX(Y+0),e.getX(Y+1),e.getX(Y+2))}const H=new le,X=new le,I=new le,R=new le;function F(W){I.fromBufferAttribute(a,W),R.copy(I);const D=o[W];H.copy(D),H.sub(I.multiplyScalar(I.dot(D))).normalize(),X.crossVectors(R,D);const z=X.dot(p[W])<0?-1:1;u.setXYZW(W,H.x,H.y,H.z,z)}for(let W=0,D=V.length;W<D;++W){const w=V[W],z=w.start,B=w.count;for(let Y=z,Z=z+B;Y<Z;Y+=3)F(e.getX(Y+0)),F(e.getX(Y+1)),F(e.getX(Y+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new Ar(new Float32Array(t.count*3),3),this.setAttribute("normal",r);else for(let y=0,S=r.count;y<S;y++)r.setXYZ(y,0,0,0);const a=new le,l=new le,u=new le,o=new le,p=new le,m=new le,g=new le,x=new le;if(e)for(let y=0,S=e.count;y<S;y+=3){const T=e.getX(y+0),L=e.getX(y+1),E=e.getX(y+2);a.fromBufferAttribute(t,T),l.fromBufferAttribute(t,L),u.fromBufferAttribute(t,E),g.subVectors(u,l),x.subVectors(a,l),g.cross(x),o.fromBufferAttribute(r,T),p.fromBufferAttribute(r,L),m.fromBufferAttribute(r,E),o.add(g),p.add(g),m.add(g),r.setXYZ(T,o.x,o.y,o.z),r.setXYZ(L,p.x,p.y,p.z),r.setXYZ(E,m.x,m.y,m.z)}else for(let y=0,S=t.count;y<S;y+=3)a.fromBufferAttribute(t,y+0),l.fromBufferAttribute(t,y+1),u.fromBufferAttribute(t,y+2),g.subVectors(u,l),x.subVectors(a,l),g.cross(x),r.setXYZ(y+0,g.x,g.y,g.z),r.setXYZ(y+1,g.x,g.y,g.z),r.setXYZ(y+2,g.x,g.y,g.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,r=e.count;t<r;t++)fn.fromBufferAttribute(e,t),fn.normalize(),e.setXYZ(t,fn.x,fn.y,fn.z)}toNonIndexed(){function e(o,p){const m=o.array,g=o.itemSize,x=o.normalized,y=new m.constructor(p.length*g);let S=0,T=0;for(let L=0,E=p.length;L<E;L++){o.isInterleavedBufferAttribute?S=p[L]*o.data.stride+o.offset:S=p[L]*g;for(let b=0;b<g;b++)y[T++]=m[S++]}return new Ar(y,g,x)}if(this.index===null)return mt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Ei,r=this.index.array,a=this.attributes;for(const o in a){const p=a[o],m=e(p,r);t.setAttribute(o,m)}const l=this.morphAttributes;for(const o in l){const p=[],m=l[o];for(let g=0,x=m.length;g<x;g++){const y=m[g],S=e(y,r);p.push(S)}t.morphAttributes[o]=p}t.morphTargetsRelative=this.morphTargetsRelative;const u=this.groups;for(let o=0,p=u.length;o<p;o++){const m=u[o];t.addGroup(m.start,m.count,m.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const p=this.parameters;for(const m in p)p[m]!==void 0&&(e[m]=p[m]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const r=this.attributes;for(const p in r){const m=r[p];e.data.attributes[p]=m.toJSON(e.data)}const a={};let l=!1;for(const p in this.morphAttributes){const m=this.morphAttributes[p],g=[];for(let x=0,y=m.length;x<y;x++){const S=m[x];g.push(S.toJSON(e.data))}g.length>0&&(a[p]=g,l=!0)}l&&(e.data.morphAttributes=a,e.data.morphTargetsRelative=this.morphTargetsRelative);const u=this.groups;u.length>0&&(e.data.groups=JSON.parse(JSON.stringify(u)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone());const a=e.attributes;for(const m in a){const g=a[m];this.setAttribute(m,g.clone(t))}const l=e.morphAttributes;for(const m in l){const g=[],x=l[m];for(let y=0,S=x.length;y<S;y++)g.push(x[y].clone(t));this.morphAttributes[m]=g}this.morphTargetsRelative=e.morphTargetsRelative;const u=e.groups;for(let m=0,g=u.length;m<g;m++){const x=u[m];this.addGroup(x.start,x.count,x.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const p=e.boundingSphere;return p!==null&&(this.boundingSphere=p.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Uu=new on,Fi=new r0,us=new Jf,Nu=new le,ds=new le,hs=new le,ps=new le,xc=new le,ms=new le,Ou=new le,_s=new le;class Pr extends Xn{constructor(e=new Ei,t=new Qf){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const a=t[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,u=a.length;l<u;l++){const o=a[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=l}}}}getVertexPosition(e,t){const r=this.geometry,a=r.attributes.position,l=r.morphAttributes.position,u=r.morphTargetsRelative;t.fromBufferAttribute(a,e);const o=this.morphTargetInfluences;if(l&&o){ms.set(0,0,0);for(let p=0,m=l.length;p<m;p++){const g=o[p],x=l[p];g!==0&&(xc.fromBufferAttribute(x,e),u?ms.addScaledVector(xc,g):ms.addScaledVector(xc.sub(t),g))}t.add(ms)}return t}raycast(e,t){const r=this.geometry,a=this.material,l=this.matrixWorld;a!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),us.copy(r.boundingSphere),us.applyMatrix4(l),Fi.copy(e.ray).recast(e.near),!(us.containsPoint(Fi.origin)===!1&&(Fi.intersectSphere(us,Nu)===null||Fi.origin.distanceToSquared(Nu)>(e.far-e.near)**2))&&(Uu.copy(l).invert(),Fi.copy(e.ray).applyMatrix4(Uu),!(r.boundingBox!==null&&Fi.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,Fi)))}_computeIntersections(e,t,r){let a;const l=this.geometry,u=this.material,o=l.index,p=l.attributes.position,m=l.attributes.uv,g=l.attributes.uv1,x=l.attributes.normal,y=l.groups,S=l.drawRange;if(o!==null)if(Array.isArray(u))for(let T=0,L=y.length;T<L;T++){const E=y[T],b=u[E.materialIndex],V=Math.max(E.start,S.start),H=Math.min(o.count,Math.min(E.start+E.count,S.start+S.count));for(let X=V,I=H;X<I;X+=3){const R=o.getX(X),F=o.getX(X+1),W=o.getX(X+2);a=gs(this,b,e,r,m,g,x,R,F,W),a&&(a.faceIndex=Math.floor(X/3),a.face.materialIndex=E.materialIndex,t.push(a))}}else{const T=Math.max(0,S.start),L=Math.min(o.count,S.start+S.count);for(let E=T,b=L;E<b;E+=3){const V=o.getX(E),H=o.getX(E+1),X=o.getX(E+2);a=gs(this,u,e,r,m,g,x,V,H,X),a&&(a.faceIndex=Math.floor(E/3),t.push(a))}}else if(p!==void 0)if(Array.isArray(u))for(let T=0,L=y.length;T<L;T++){const E=y[T],b=u[E.materialIndex],V=Math.max(E.start,S.start),H=Math.min(p.count,Math.min(E.start+E.count,S.start+S.count));for(let X=V,I=H;X<I;X+=3){const R=X,F=X+1,W=X+2;a=gs(this,b,e,r,m,g,x,R,F,W),a&&(a.faceIndex=Math.floor(X/3),a.face.materialIndex=E.materialIndex,t.push(a))}}else{const T=Math.max(0,S.start),L=Math.min(p.count,S.start+S.count);for(let E=T,b=L;E<b;E+=3){const V=E,H=E+1,X=E+2;a=gs(this,u,e,r,m,g,x,V,H,X),a&&(a.faceIndex=Math.floor(E/3),t.push(a))}}}}function _0(n,e,t,r,a,l,u,o){let p;if(e.side===In?p=r.intersectTriangle(u,l,a,!0,o):p=r.intersectTriangle(a,l,u,e.side===Si,o),p===null)return null;_s.copy(o),_s.applyMatrix4(n.matrixWorld);const m=t.ray.origin.distanceTo(_s);return m<t.near||m>t.far?null:{distance:m,point:_s.clone(),object:n}}function gs(n,e,t,r,a,l,u,o,p,m){n.getVertexPosition(o,ds),n.getVertexPosition(p,hs),n.getVertexPosition(m,ps);const g=_0(n,e,t,r,ds,hs,ps,Ou);if(g){const x=new le;dr.getBarycoord(Ou,ds,hs,ps,x),a&&(g.uv=dr.getInterpolatedAttribute(a,o,p,m,x,new Gt)),l&&(g.uv1=dr.getInterpolatedAttribute(l,o,p,m,x,new Gt)),u&&(g.normal=dr.getInterpolatedAttribute(u,o,p,m,x,new le),g.normal.dot(r.direction)>0&&g.normal.multiplyScalar(-1));const y={a:o,b:p,c:m,normal:new le,materialIndex:0};dr.getNormal(ds,hs,ps,y.normal),g.face=y,g.barycoord=x}return g}class Ro extends Ei{constructor(e=1,t=1,r=1,a=1,l=1,u=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:r,widthSegments:a,heightSegments:l,depthSegments:u};const o=this;a=Math.floor(a),l=Math.floor(l),u=Math.floor(u);const p=[],m=[],g=[],x=[];let y=0,S=0;T("z","y","x",-1,-1,r,t,e,u,l,0),T("z","y","x",1,-1,r,t,-e,u,l,1),T("x","z","y",1,1,e,r,t,a,u,2),T("x","z","y",1,-1,e,r,-t,a,u,3),T("x","y","z",1,-1,e,t,r,a,l,4),T("x","y","z",-1,-1,e,t,-r,a,l,5),this.setIndex(p),this.setAttribute("position",new Vi(m,3)),this.setAttribute("normal",new Vi(g,3)),this.setAttribute("uv",new Vi(x,2));function T(L,E,b,V,H,X,I,R,F,W,D){const w=X/F,z=I/W,B=X/2,Y=I/2,Z=R/2,j=F+1,J=W+1;let ue=0,te=0;const Se=new le;for(let be=0;be<J;be++){const Ye=be*z-Y;for(let ct=0;ct<j;ct++){const pt=ct*w-B;Se[L]=pt*V,Se[E]=Ye*H,Se[b]=Z,m.push(Se.x,Se.y,Se.z),Se[L]=0,Se[E]=0,Se[b]=R>0?1:-1,g.push(Se.x,Se.y,Se.z),x.push(ct/F),x.push(1-be/W),ue+=1}}for(let be=0;be<W;be++)for(let Ye=0;Ye<F;Ye++){const ct=y+Ye+j*be,pt=y+Ye+j*(be+1),yt=y+(Ye+1)+j*(be+1),vt=y+(Ye+1)+j*be;p.push(ct,pt,vt),p.push(pt,yt,vt),te+=6}o.addGroup(S,te,D),S+=te,y+=ue}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ro(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Na(n){const e={};for(const t in n){e[t]={};for(const r in n[t]){const a=n[t][r];a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)?a.isRenderTargetTexture?(mt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][r]=null):e[t][r]=a.clone():Array.isArray(a)?e[t][r]=a.slice():e[t][r]=a}}return e}function Mn(n){const e={};for(let t=0;t<n.length;t++){const r=Na(n[t]);for(const a in r)e[a]=r[a]}return e}function g0(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function _h(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Rt.workingColorSpace}const v0={clone:Na,merge:Mn};var x0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,y0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Qn extends qs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=x0,this.fragmentShader=y0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Na(e.uniforms),this.uniformsGroups=g0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const a in this.uniforms){const u=this.uniforms[a].value;u&&u.isTexture?t.uniforms[a]={type:"t",value:u.toJSON(e).uuid}:u&&u.isColor?t.uniforms[a]={type:"c",value:u.getHex()}:u&&u.isVector2?t.uniforms[a]={type:"v2",value:u.toArray()}:u&&u.isVector3?t.uniforms[a]={type:"v3",value:u.toArray()}:u&&u.isVector4?t.uniforms[a]={type:"v4",value:u.toArray()}:u&&u.isMatrix3?t.uniforms[a]={type:"m3",value:u.toArray()}:u&&u.isMatrix4?t.uniforms[a]={type:"m4",value:u.toArray()}:t.uniforms[a]={value:u}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const r={};for(const a in this.extensions)this.extensions[a]===!0&&(r[a]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}}class gh extends Xn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new on,this.projectionMatrix=new on,this.projectionMatrixInverse=new on,this.coordinateSystem=Tr,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const mi=new le,ku=new Gt,Bu=new Gt;class ur extends gh{constructor(e=50,t=1,r=.1,a=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=a,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Af*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Jl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Af*2*Math.atan(Math.tan(Jl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,r){mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(mi.x,mi.y).multiplyScalar(-e/mi.z),mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(mi.x,mi.y).multiplyScalar(-e/mi.z)}getViewSize(e,t){return this.getViewBounds(e,ku,Bu),t.subVectors(Bu,ku)}setViewOffset(e,t,r,a,l,u){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=a,this.view.width=l,this.view.height=u,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Jl*.5*this.fov)/this.zoom,r=2*t,a=this.aspect*r,l=-.5*a;const u=this.view;if(this.view!==null&&this.view.enabled){const p=u.fullWidth,m=u.fullHeight;l+=u.offsetX*a/p,t-=u.offsetY*r/m,a*=u.width/p,r*=u.height/m}const o=this.filmOffset;o!==0&&(l+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(l,l+a,t,t-r,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ya=-90,Sa=1;class S0 extends Xn{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const a=new ur(ya,Sa,e,t);a.layers=this.layers,this.add(a);const l=new ur(ya,Sa,e,t);l.layers=this.layers,this.add(l);const u=new ur(ya,Sa,e,t);u.layers=this.layers,this.add(u);const o=new ur(ya,Sa,e,t);o.layers=this.layers,this.add(o);const p=new ur(ya,Sa,e,t);p.layers=this.layers,this.add(p);const m=new ur(ya,Sa,e,t);m.layers=this.layers,this.add(m)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[r,a,l,u,o,p]=t;for(const m of t)this.remove(m);if(e===Tr)r.up.set(0,1,0),r.lookAt(1,0,0),a.up.set(0,1,0),a.lookAt(-1,0,0),l.up.set(0,0,-1),l.lookAt(0,1,0),u.up.set(0,0,1),u.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),p.up.set(0,1,0),p.lookAt(0,0,-1);else if(e===Ns)r.up.set(0,-1,0),r.lookAt(-1,0,0),a.up.set(0,-1,0),a.lookAt(1,0,0),l.up.set(0,0,1),l.lookAt(0,1,0),u.up.set(0,0,-1),u.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),p.up.set(0,-1,0),p.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const m of t)this.add(m),m.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:a}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[l,u,o,p,m,g]=this.children,x=e.getRenderTarget(),y=e.getActiveCubeFace(),S=e.getActiveMipmapLevel(),T=e.xr.enabled;e.xr.enabled=!1;const L=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,a),e.render(t,l),e.setRenderTarget(r,1,a),e.render(t,u),e.setRenderTarget(r,2,a),e.render(t,o),e.setRenderTarget(r,3,a),e.render(t,p),e.setRenderTarget(r,4,a),e.render(t,m),r.texture.generateMipmaps=L,e.setRenderTarget(r,5,a),e.render(t,g),e.setRenderTarget(x,y,S),e.xr.enabled=T,r.texture.needsPMREMUpdate=!0}}class vh extends pn{constructor(e=[],t=Ia,r,a,l,u,o,p,m,g){super(e,t,r,a,l,u,o,p,m,g),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class b0 extends qr{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},a=[r,r,r,r,r,r];this.texture=new vh(a),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},a=new Ro(5,5,5),l=new Qn({name:"CubemapFromEquirect",uniforms:Na(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:In,blending:hr});l.uniforms.tEquirect.value=t;const u=new Pr(a,l),o=t.minFilter;return t.minFilter===Gi&&(t.minFilter=un),new S0(1,10,this).update(e,u),t.minFilter=o,u.geometry.dispose(),u.material.dispose(),this}clear(e,t=!0,r=!0,a=!0){const l=e.getRenderTarget();for(let u=0;u<6;u++)e.setRenderTarget(this,u),e.clear(t,r,a);e.setRenderTarget(l)}}class vs extends Xn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const E0={type:"move"};class yc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new vs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new vs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new le,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new le),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new vs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new le,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new le),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let a=null,l=null,u=null;const o=this._targetRay,p=this._grip,m=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(m&&e.hand){u=!0;for(const L of e.hand.values()){const E=t.getJointPose(L,r),b=this._getHandJoint(m,L);E!==null&&(b.matrix.fromArray(E.transform.matrix),b.matrix.decompose(b.position,b.rotation,b.scale),b.matrixWorldNeedsUpdate=!0,b.jointRadius=E.radius),b.visible=E!==null}const g=m.joints["index-finger-tip"],x=m.joints["thumb-tip"],y=g.position.distanceTo(x.position),S=.02,T=.005;m.inputState.pinching&&y>S+T?(m.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!m.inputState.pinching&&y<=S-T&&(m.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else p!==null&&e.gripSpace&&(l=t.getPose(e.gripSpace,r),l!==null&&(p.matrix.fromArray(l.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,l.linearVelocity?(p.hasLinearVelocity=!0,p.linearVelocity.copy(l.linearVelocity)):p.hasLinearVelocity=!1,l.angularVelocity?(p.hasAngularVelocity=!0,p.angularVelocity.copy(l.angularVelocity)):p.hasAngularVelocity=!1));o!==null&&(a=t.getPose(e.targetRaySpace,r),a===null&&l!==null&&(a=l),a!==null&&(o.matrix.fromArray(a.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,a.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(a.linearVelocity)):o.hasLinearVelocity=!1,a.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(a.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(E0)))}return o!==null&&(o.visible=a!==null),p!==null&&(p.visible=l!==null),m!==null&&(m.visible=u!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const r=new vs;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}}class M0 extends Xn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Yr,this.environmentIntensity=1,this.environmentRotation=new Yr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Eo extends pn{constructor(e=null,t=1,r=1,a,l,u,o,p,m=Wn,g=Wn,x,y){super(null,u,o,p,m,g,a,l,x,y),this.isDataTexture=!0,this.image={data:e,width:t,height:r},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Sc=new le,w0=new le,T0=new gt;class Oi{constructor(e=new le(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,a){return this.normal.set(e,t,r),this.constant=a,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){const a=Sc.subVectors(r,t).cross(w0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(a,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const r=e.delta(Sc),a=this.normal.dot(r);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const l=-(e.start.dot(this.normal)+this.constant)/a;return l<0||l>1?null:t.copy(e.start).addScaledVector(r,l)}intersectsLine(e){const t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const r=t||T0.getNormalMatrix(e),a=this.coplanarPoint(Sc).applyMatrix4(e),l=this.normal.applyMatrix3(r).normalize();return this.constant=-a.dot(l),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Ii=new Jf,A0=new Gt(.5,.5),xs=new le;class xh{constructor(e=new Oi,t=new Oi,r=new Oi,a=new Oi,l=new Oi,u=new Oi){this.planes=[e,t,r,a,l,u]}set(e,t,r,a,l,u){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(r),o[3].copy(a),o[4].copy(l),o[5].copy(u),this}copy(e){const t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=Tr,r=!1){const a=this.planes,l=e.elements,u=l[0],o=l[1],p=l[2],m=l[3],g=l[4],x=l[5],y=l[6],S=l[7],T=l[8],L=l[9],E=l[10],b=l[11],V=l[12],H=l[13],X=l[14],I=l[15];if(a[0].setComponents(m-u,S-g,b-T,I-V).normalize(),a[1].setComponents(m+u,S+g,b+T,I+V).normalize(),a[2].setComponents(m+o,S+x,b+L,I+H).normalize(),a[3].setComponents(m-o,S-x,b-L,I-H).normalize(),r)a[4].setComponents(p,y,E,X).normalize(),a[5].setComponents(m-p,S-y,b-E,I-X).normalize();else if(a[4].setComponents(m-p,S-y,b-E,I-X).normalize(),t===Tr)a[5].setComponents(m+p,S+y,b+E,I+X).normalize();else if(t===Ns)a[5].setComponents(p,y,E,X).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ii.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ii.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ii)}intersectsSprite(e){Ii.center.set(0,0,0);const t=A0.distanceTo(e.center);return Ii.radius=.7071067811865476+t,Ii.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ii)}intersectsSphere(e){const t=this.planes,r=e.center,a=-e.radius;for(let l=0;l<6;l++)if(t[l].distanceToPoint(r)<a)return!1;return!0}intersectsBox(e){const t=this.planes;for(let r=0;r<6;r++){const a=t[r];if(xs.x=a.normal.x>0?e.max.x:e.min.x,xs.y=a.normal.y>0?e.max.y:e.min.y,xs.z=a.normal.z>0?e.max.z:e.min.z,a.distanceToPoint(xs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class yh extends pn{constructor(e,t,r=bi,a,l,u,o=Wn,p=Wn,m,g=yo,x=1){if(g!==yo&&g!==So)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const y={width:e,height:t,depth:x};super(y,a,l,u,o,p,g,r,m),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Zf(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Sh extends pn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class za extends Ei{constructor(e=1,t=1,r=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:r,heightSegments:a};const l=e/2,u=t/2,o=Math.floor(r),p=Math.floor(a),m=o+1,g=p+1,x=e/o,y=t/p,S=[],T=[],L=[],E=[];for(let b=0;b<g;b++){const V=b*y-u;for(let H=0;H<m;H++){const X=H*x-l;T.push(X,-V,0),L.push(0,0,1),E.push(H/o),E.push(1-b/p)}}for(let b=0;b<p;b++)for(let V=0;V<o;V++){const H=V+m*b,X=V+m*(b+1),I=V+1+m*(b+1),R=V+1+m*b;S.push(H,X,R),S.push(X,I,R)}this.setIndex(S),this.setAttribute("position",new Vi(T,3)),this.setAttribute("normal",new Vi(L,3)),this.setAttribute("uv",new Vi(E,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new za(e.width,e.height,e.widthSegments,e.heightSegments)}}class C0 extends qs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Nm,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class R0 extends qs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class bh extends gh{constructor(e=-1,t=1,r=1,a=-1,l=.1,u=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=a,this.near=l,this.far=u,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,a,l,u){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=a,this.view.width=l,this.view.height=u,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,a=(this.top+this.bottom)/2;let l=r-e,u=r+e,o=a+t,p=a-t;if(this.view!==null&&this.view.enabled){const m=(this.right-this.left)/this.view.fullWidth/this.zoom,g=(this.top-this.bottom)/this.view.fullHeight/this.zoom;l+=m*this.view.offsetX,u=l+m*this.view.width,o-=g*this.view.offsetY,p=o-g*this.view.height}this.projectionMatrix.makeOrthographic(l,u,o,p,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class P0 extends ur{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function zu(n,e,t,r){const a=D0(r);switch(t){case oh:return n*e;case lh:return n*e/a.components*a.byteLength;case qf:return n*e/a.components*a.byteLength;case Yf:return n*e*2/a.components*a.byteLength;case jf:return n*e*2/a.components*a.byteLength;case sh:return n*e*3/a.components*a.byteLength;case An:return n*e*4/a.components*a.byteLength;case Kf:return n*e*4/a.components*a.byteLength;case Ts:case As:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Cs:case Rs:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Qc:case tf:return Math.max(n,16)*Math.max(e,8)/4;case Jc:case ef:return Math.max(n,8)*Math.max(e,8)/2;case nf:case rf:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case af:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case of:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case sf:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case lf:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case cf:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case ff:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case uf:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case df:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case hf:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case pf:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case mf:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case _f:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case gf:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case vf:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case xf:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case yf:case Sf:case bf:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Ef:case Mf:return Math.ceil(n/4)*Math.ceil(e/4)*8;case wf:case Tf:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function D0(n){switch(n){case Jn:case Vf:return{byteLength:1,components:1};case vo:case Wf:case ei:return{byteLength:2,components:1};case Xf:case $f:return{byteLength:2,components:4};case bi:case $s:case Zn:return{byteLength:4,components:1};case ih:case ah:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Hf}}));typeof window<"u"&&(window.__THREE__?mt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Hf);function Eh(){let n=null,e=!1,t=null,r=null;function a(l,u){t(l,u),r=n.requestAnimationFrame(a)}return{start:function(){e!==!0&&t!==null&&(r=n.requestAnimationFrame(a),e=!0)},stop:function(){n.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(l){t=l},setContext:function(l){n=l}}}function L0(n){const e=new WeakMap;function t(o,p){const m=o.array,g=o.usage,x=m.byteLength,y=n.createBuffer();n.bindBuffer(p,y),n.bufferData(p,m,g),o.onUploadCallback();let S;if(m instanceof Float32Array)S=n.FLOAT;else if(typeof Float16Array<"u"&&m instanceof Float16Array)S=n.HALF_FLOAT;else if(m instanceof Uint16Array)o.isFloat16BufferAttribute?S=n.HALF_FLOAT:S=n.UNSIGNED_SHORT;else if(m instanceof Int16Array)S=n.SHORT;else if(m instanceof Uint32Array)S=n.UNSIGNED_INT;else if(m instanceof Int32Array)S=n.INT;else if(m instanceof Int8Array)S=n.BYTE;else if(m instanceof Uint8Array)S=n.UNSIGNED_BYTE;else if(m instanceof Uint8ClampedArray)S=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+m);return{buffer:y,type:S,bytesPerElement:m.BYTES_PER_ELEMENT,version:o.version,size:x}}function r(o,p,m){const g=p.array,x=p.updateRanges;if(n.bindBuffer(m,o),x.length===0)n.bufferSubData(m,0,g);else{x.sort((S,T)=>S.start-T.start);let y=0;for(let S=1;S<x.length;S++){const T=x[y],L=x[S];L.start<=T.start+T.count+1?T.count=Math.max(T.count,L.start+L.count-T.start):(++y,x[y]=L)}x.length=y+1;for(let S=0,T=x.length;S<T;S++){const L=x[S];n.bufferSubData(m,L.start*g.BYTES_PER_ELEMENT,g,L.start,L.count)}p.clearUpdateRanges()}p.onUploadCallback()}function a(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function l(o){o.isInterleavedBufferAttribute&&(o=o.data);const p=e.get(o);p&&(n.deleteBuffer(p.buffer),e.delete(o))}function u(o,p){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const g=e.get(o);(!g||g.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const m=e.get(o);if(m===void 0)e.set(o,t(o,p));else if(m.version<o.version){if(m.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(m.buffer,o,p),m.version=o.version}}return{get:a,remove:l,update:u}}var F0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,I0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,U0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,N0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,O0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,k0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,B0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,z0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,G0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,H0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,V0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,W0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,X0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,$0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,q0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Y0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,j0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,K0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Z0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,J0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Q0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,e_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,t_=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,n_=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,r_=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,i_=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,a_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,o_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,s_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,l_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,c_="gl_FragColor = linearToOutputTexel( gl_FragColor );",f_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,u_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,d_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,h_=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,p_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,m_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,__=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,g_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,v_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,x_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,y_=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,S_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,b_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,E_=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,M_=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,w_=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,T_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,A_=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,C_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,R_=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,P_=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,D_=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 uv = vec2( roughness, dotNV );
	return texture2D( dfgLUT, uv ).rg;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNV * dotNV), 0.0, dotNV), material.roughness );
	vec2 dfgL = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNL * dotNL), 0.0, dotNL), material.roughness );
	vec3 FssEss_V = material.specularColor * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColor * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColor + ( 1.0 - material.specularColor ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,L_=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,F_=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,I_=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,U_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,N_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,O_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,k_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,B_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,z_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,G_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,H_=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,V_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,W_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,X_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,$_=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,q_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Y_=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,j_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,K_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Z_=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,J_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Q_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,eg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,tg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,ng=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,rg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ig=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ag=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,og=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,sg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,lg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,cg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,fg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ug=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,dg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,hg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,pg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,mg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,_g=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,gg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,vg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,xg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,yg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Sg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,bg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Eg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Mg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,wg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Tg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ag=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Cg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Rg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Pg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Dg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Lg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Fg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ig=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ug=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ng=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Og=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Bg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,zg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Gg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Hg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Vg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Xg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$g=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,qg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Zg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Qg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,ev=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tv=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nv=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,rv=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,iv=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,av=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ov=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,sv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,lv=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cv=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,fv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,uv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,xt={alphahash_fragment:F0,alphahash_pars_fragment:I0,alphamap_fragment:U0,alphamap_pars_fragment:N0,alphatest_fragment:O0,alphatest_pars_fragment:k0,aomap_fragment:B0,aomap_pars_fragment:z0,batching_pars_vertex:G0,batching_vertex:H0,begin_vertex:V0,beginnormal_vertex:W0,bsdfs:X0,iridescence_fragment:$0,bumpmap_pars_fragment:q0,clipping_planes_fragment:Y0,clipping_planes_pars_fragment:j0,clipping_planes_pars_vertex:K0,clipping_planes_vertex:Z0,color_fragment:J0,color_pars_fragment:Q0,color_pars_vertex:e_,color_vertex:t_,common:n_,cube_uv_reflection_fragment:r_,defaultnormal_vertex:i_,displacementmap_pars_vertex:a_,displacementmap_vertex:o_,emissivemap_fragment:s_,emissivemap_pars_fragment:l_,colorspace_fragment:c_,colorspace_pars_fragment:f_,envmap_fragment:u_,envmap_common_pars_fragment:d_,envmap_pars_fragment:h_,envmap_pars_vertex:p_,envmap_physical_pars_fragment:w_,envmap_vertex:m_,fog_vertex:__,fog_pars_vertex:g_,fog_fragment:v_,fog_pars_fragment:x_,gradientmap_pars_fragment:y_,lightmap_pars_fragment:S_,lights_lambert_fragment:b_,lights_lambert_pars_fragment:E_,lights_pars_begin:M_,lights_toon_fragment:T_,lights_toon_pars_fragment:A_,lights_phong_fragment:C_,lights_phong_pars_fragment:R_,lights_physical_fragment:P_,lights_physical_pars_fragment:D_,lights_fragment_begin:L_,lights_fragment_maps:F_,lights_fragment_end:I_,logdepthbuf_fragment:U_,logdepthbuf_pars_fragment:N_,logdepthbuf_pars_vertex:O_,logdepthbuf_vertex:k_,map_fragment:B_,map_pars_fragment:z_,map_particle_fragment:G_,map_particle_pars_fragment:H_,metalnessmap_fragment:V_,metalnessmap_pars_fragment:W_,morphinstance_vertex:X_,morphcolor_vertex:$_,morphnormal_vertex:q_,morphtarget_pars_vertex:Y_,morphtarget_vertex:j_,normal_fragment_begin:K_,normal_fragment_maps:Z_,normal_pars_fragment:J_,normal_pars_vertex:Q_,normal_vertex:eg,normalmap_pars_fragment:tg,clearcoat_normal_fragment_begin:ng,clearcoat_normal_fragment_maps:rg,clearcoat_pars_fragment:ig,iridescence_pars_fragment:ag,opaque_fragment:og,packing:sg,premultiplied_alpha_fragment:lg,project_vertex:cg,dithering_fragment:fg,dithering_pars_fragment:ug,roughnessmap_fragment:dg,roughnessmap_pars_fragment:hg,shadowmap_pars_fragment:pg,shadowmap_pars_vertex:mg,shadowmap_vertex:_g,shadowmask_pars_fragment:gg,skinbase_vertex:vg,skinning_pars_vertex:xg,skinning_vertex:yg,skinnormal_vertex:Sg,specularmap_fragment:bg,specularmap_pars_fragment:Eg,tonemapping_fragment:Mg,tonemapping_pars_fragment:wg,transmission_fragment:Tg,transmission_pars_fragment:Ag,uv_pars_fragment:Cg,uv_pars_vertex:Rg,uv_vertex:Pg,worldpos_vertex:Dg,background_vert:Lg,background_frag:Fg,backgroundCube_vert:Ig,backgroundCube_frag:Ug,cube_vert:Ng,cube_frag:Og,depth_vert:kg,depth_frag:Bg,distanceRGBA_vert:zg,distanceRGBA_frag:Gg,equirect_vert:Hg,equirect_frag:Vg,linedashed_vert:Wg,linedashed_frag:Xg,meshbasic_vert:$g,meshbasic_frag:qg,meshlambert_vert:Yg,meshlambert_frag:jg,meshmatcap_vert:Kg,meshmatcap_frag:Zg,meshnormal_vert:Jg,meshnormal_frag:Qg,meshphong_vert:ev,meshphong_frag:tv,meshphysical_vert:nv,meshphysical_frag:rv,meshtoon_vert:iv,meshtoon_frag:av,points_vert:ov,points_frag:sv,shadow_vert:lv,shadow_frag:cv,sprite_vert:fv,sprite_frag:uv},Ge={common:{diffuse:{value:new zt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new gt},alphaMap:{value:null},alphaMapTransform:{value:new gt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new gt}},envmap:{envMap:{value:null},envMapRotation:{value:new gt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new gt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new gt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new gt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new gt},normalScale:{value:new Gt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new gt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new gt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new gt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new gt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new zt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new zt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new gt},alphaTest:{value:0},uvTransform:{value:new gt}},sprite:{diffuse:{value:new zt(16777215)},opacity:{value:1},center:{value:new Gt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new gt},alphaMap:{value:null},alphaMapTransform:{value:new gt},alphaTest:{value:0}}},Er={basic:{uniforms:Mn([Ge.common,Ge.specularmap,Ge.envmap,Ge.aomap,Ge.lightmap,Ge.fog]),vertexShader:xt.meshbasic_vert,fragmentShader:xt.meshbasic_frag},lambert:{uniforms:Mn([Ge.common,Ge.specularmap,Ge.envmap,Ge.aomap,Ge.lightmap,Ge.emissivemap,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.fog,Ge.lights,{emissive:{value:new zt(0)}}]),vertexShader:xt.meshlambert_vert,fragmentShader:xt.meshlambert_frag},phong:{uniforms:Mn([Ge.common,Ge.specularmap,Ge.envmap,Ge.aomap,Ge.lightmap,Ge.emissivemap,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.fog,Ge.lights,{emissive:{value:new zt(0)},specular:{value:new zt(1118481)},shininess:{value:30}}]),vertexShader:xt.meshphong_vert,fragmentShader:xt.meshphong_frag},standard:{uniforms:Mn([Ge.common,Ge.envmap,Ge.aomap,Ge.lightmap,Ge.emissivemap,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.roughnessmap,Ge.metalnessmap,Ge.fog,Ge.lights,{emissive:{value:new zt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:xt.meshphysical_vert,fragmentShader:xt.meshphysical_frag},toon:{uniforms:Mn([Ge.common,Ge.aomap,Ge.lightmap,Ge.emissivemap,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.gradientmap,Ge.fog,Ge.lights,{emissive:{value:new zt(0)}}]),vertexShader:xt.meshtoon_vert,fragmentShader:xt.meshtoon_frag},matcap:{uniforms:Mn([Ge.common,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.fog,{matcap:{value:null}}]),vertexShader:xt.meshmatcap_vert,fragmentShader:xt.meshmatcap_frag},points:{uniforms:Mn([Ge.points,Ge.fog]),vertexShader:xt.points_vert,fragmentShader:xt.points_frag},dashed:{uniforms:Mn([Ge.common,Ge.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:xt.linedashed_vert,fragmentShader:xt.linedashed_frag},depth:{uniforms:Mn([Ge.common,Ge.displacementmap]),vertexShader:xt.depth_vert,fragmentShader:xt.depth_frag},normal:{uniforms:Mn([Ge.common,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,{opacity:{value:1}}]),vertexShader:xt.meshnormal_vert,fragmentShader:xt.meshnormal_frag},sprite:{uniforms:Mn([Ge.sprite,Ge.fog]),vertexShader:xt.sprite_vert,fragmentShader:xt.sprite_frag},background:{uniforms:{uvTransform:{value:new gt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:xt.background_vert,fragmentShader:xt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new gt}},vertexShader:xt.backgroundCube_vert,fragmentShader:xt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:xt.cube_vert,fragmentShader:xt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:xt.equirect_vert,fragmentShader:xt.equirect_frag},distanceRGBA:{uniforms:Mn([Ge.common,Ge.displacementmap,{referencePosition:{value:new le},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:xt.distanceRGBA_vert,fragmentShader:xt.distanceRGBA_frag},shadow:{uniforms:Mn([Ge.lights,Ge.fog,{color:{value:new zt(0)},opacity:{value:1}}]),vertexShader:xt.shadow_vert,fragmentShader:xt.shadow_frag}};Er.physical={uniforms:Mn([Er.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new gt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new gt},clearcoatNormalScale:{value:new Gt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new gt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new gt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new gt},sheen:{value:0},sheenColor:{value:new zt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new gt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new gt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new gt},transmissionSamplerSize:{value:new Gt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new gt},attenuationDistance:{value:0},attenuationColor:{value:new zt(0)},specularColor:{value:new zt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new gt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new gt},anisotropyVector:{value:new Gt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new gt}}]),vertexShader:xt.meshphysical_vert,fragmentShader:xt.meshphysical_frag};const ys={r:0,b:0,g:0},Ui=new Yr,dv=new on;function hv(n,e,t,r,a,l,u){const o=new zt(0);let p=l===!0?0:1,m,g,x=null,y=0,S=null;function T(H){let X=H.isScene===!0?H.background:null;return X&&X.isTexture&&(X=(H.backgroundBlurriness>0?t:e).get(X)),X}function L(H){let X=!1;const I=T(H);I===null?b(o,p):I&&I.isColor&&(b(I,1),X=!0);const R=n.xr.getEnvironmentBlendMode();R==="additive"?r.buffers.color.setClear(0,0,0,1,u):R==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,u),(n.autoClear||X)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function E(H,X){const I=T(X);I&&(I.isCubeTexture||I.mapping===Xs)?(g===void 0&&(g=new Pr(new Ro(1,1,1),new Qn({name:"BackgroundCubeMaterial",uniforms:Na(Er.backgroundCube.uniforms),vertexShader:Er.backgroundCube.vertexShader,fragmentShader:Er.backgroundCube.fragmentShader,side:In,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),g.geometry.deleteAttribute("normal"),g.geometry.deleteAttribute("uv"),g.onBeforeRender=function(R,F,W){this.matrixWorld.copyPosition(W.matrixWorld)},Object.defineProperty(g.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(g)),Ui.copy(X.backgroundRotation),Ui.x*=-1,Ui.y*=-1,Ui.z*=-1,I.isCubeTexture&&I.isRenderTargetTexture===!1&&(Ui.y*=-1,Ui.z*=-1),g.material.uniforms.envMap.value=I,g.material.uniforms.flipEnvMap.value=I.isCubeTexture&&I.isRenderTargetTexture===!1?-1:1,g.material.uniforms.backgroundBlurriness.value=X.backgroundBlurriness,g.material.uniforms.backgroundIntensity.value=X.backgroundIntensity,g.material.uniforms.backgroundRotation.value.setFromMatrix4(dv.makeRotationFromEuler(Ui)),g.material.toneMapped=Rt.getTransfer(I.colorSpace)!==Bt,(x!==I||y!==I.version||S!==n.toneMapping)&&(g.material.needsUpdate=!0,x=I,y=I.version,S=n.toneMapping),g.layers.enableAll(),H.unshift(g,g.geometry,g.material,0,0,null)):I&&I.isTexture&&(m===void 0&&(m=new Pr(new za(2,2),new Qn({name:"BackgroundMaterial",uniforms:Na(Er.background.uniforms),vertexShader:Er.background.vertexShader,fragmentShader:Er.background.fragmentShader,side:Si,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(m)),m.material.uniforms.t2D.value=I,m.material.uniforms.backgroundIntensity.value=X.backgroundIntensity,m.material.toneMapped=Rt.getTransfer(I.colorSpace)!==Bt,I.matrixAutoUpdate===!0&&I.updateMatrix(),m.material.uniforms.uvTransform.value.copy(I.matrix),(x!==I||y!==I.version||S!==n.toneMapping)&&(m.material.needsUpdate=!0,x=I,y=I.version,S=n.toneMapping),m.layers.enableAll(),H.unshift(m,m.geometry,m.material,0,0,null))}function b(H,X){H.getRGB(ys,_h(n)),r.buffers.color.setClear(ys.r,ys.g,ys.b,X,u)}function V(){g!==void 0&&(g.geometry.dispose(),g.material.dispose(),g=void 0),m!==void 0&&(m.geometry.dispose(),m.material.dispose(),m=void 0)}return{getClearColor:function(){return o},setClearColor:function(H,X=1){o.set(H),p=X,b(o,p)},getClearAlpha:function(){return p},setClearAlpha:function(H){p=H,b(o,p)},render:L,addToRenderList:E,dispose:V}}function pv(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),r={},a=y(null);let l=a,u=!1;function o(w,z,B,Y,Z){let j=!1;const J=x(Y,B,z);l!==J&&(l=J,m(l.object)),j=S(w,Y,B,Z),j&&T(w,Y,B,Z),Z!==null&&e.update(Z,n.ELEMENT_ARRAY_BUFFER),(j||u)&&(u=!1,X(w,z,B,Y),Z!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(Z).buffer))}function p(){return n.createVertexArray()}function m(w){return n.bindVertexArray(w)}function g(w){return n.deleteVertexArray(w)}function x(w,z,B){const Y=B.wireframe===!0;let Z=r[w.id];Z===void 0&&(Z={},r[w.id]=Z);let j=Z[z.id];j===void 0&&(j={},Z[z.id]=j);let J=j[Y];return J===void 0&&(J=y(p()),j[Y]=J),J}function y(w){const z=[],B=[],Y=[];for(let Z=0;Z<t;Z++)z[Z]=0,B[Z]=0,Y[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:B,attributeDivisors:Y,object:w,attributes:{},index:null}}function S(w,z,B,Y){const Z=l.attributes,j=z.attributes;let J=0;const ue=B.getAttributes();for(const te in ue)if(ue[te].location>=0){const be=Z[te];let Ye=j[te];if(Ye===void 0&&(te==="instanceMatrix"&&w.instanceMatrix&&(Ye=w.instanceMatrix),te==="instanceColor"&&w.instanceColor&&(Ye=w.instanceColor)),be===void 0||be.attribute!==Ye||Ye&&be.data!==Ye.data)return!0;J++}return l.attributesNum!==J||l.index!==Y}function T(w,z,B,Y){const Z={},j=z.attributes;let J=0;const ue=B.getAttributes();for(const te in ue)if(ue[te].location>=0){let be=j[te];be===void 0&&(te==="instanceMatrix"&&w.instanceMatrix&&(be=w.instanceMatrix),te==="instanceColor"&&w.instanceColor&&(be=w.instanceColor));const Ye={};Ye.attribute=be,be&&be.data&&(Ye.data=be.data),Z[te]=Ye,J++}l.attributes=Z,l.attributesNum=J,l.index=Y}function L(){const w=l.newAttributes;for(let z=0,B=w.length;z<B;z++)w[z]=0}function E(w){b(w,0)}function b(w,z){const B=l.newAttributes,Y=l.enabledAttributes,Z=l.attributeDivisors;B[w]=1,Y[w]===0&&(n.enableVertexAttribArray(w),Y[w]=1),Z[w]!==z&&(n.vertexAttribDivisor(w,z),Z[w]=z)}function V(){const w=l.newAttributes,z=l.enabledAttributes;for(let B=0,Y=z.length;B<Y;B++)z[B]!==w[B]&&(n.disableVertexAttribArray(B),z[B]=0)}function H(w,z,B,Y,Z,j,J){J===!0?n.vertexAttribIPointer(w,z,B,Z,j):n.vertexAttribPointer(w,z,B,Y,Z,j)}function X(w,z,B,Y){L();const Z=Y.attributes,j=B.getAttributes(),J=z.defaultAttributeValues;for(const ue in j){const te=j[ue];if(te.location>=0){let Se=Z[ue];if(Se===void 0&&(ue==="instanceMatrix"&&w.instanceMatrix&&(Se=w.instanceMatrix),ue==="instanceColor"&&w.instanceColor&&(Se=w.instanceColor)),Se!==void 0){const be=Se.normalized,Ye=Se.itemSize,ct=e.get(Se);if(ct===void 0)continue;const pt=ct.buffer,yt=ct.type,vt=ct.bytesPerElement,_e=yt===n.INT||yt===n.UNSIGNED_INT||Se.gpuType===$s;if(Se.isInterleavedBufferAttribute){const ge=Se.data,Oe=ge.stride,Qe=Se.offset;if(ge.isInstancedInterleavedBuffer){for(let $e=0;$e<te.locationSize;$e++)b(te.location+$e,ge.meshPerAttribute);w.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let $e=0;$e<te.locationSize;$e++)E(te.location+$e);n.bindBuffer(n.ARRAY_BUFFER,pt);for(let $e=0;$e<te.locationSize;$e++)H(te.location+$e,Ye/te.locationSize,yt,be,Oe*vt,(Qe+Ye/te.locationSize*$e)*vt,_e)}else{if(Se.isInstancedBufferAttribute){for(let ge=0;ge<te.locationSize;ge++)b(te.location+ge,Se.meshPerAttribute);w.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=Se.meshPerAttribute*Se.count)}else for(let ge=0;ge<te.locationSize;ge++)E(te.location+ge);n.bindBuffer(n.ARRAY_BUFFER,pt);for(let ge=0;ge<te.locationSize;ge++)H(te.location+ge,Ye/te.locationSize,yt,be,Ye*vt,Ye/te.locationSize*ge*vt,_e)}}else if(J!==void 0){const be=J[ue];if(be!==void 0)switch(be.length){case 2:n.vertexAttrib2fv(te.location,be);break;case 3:n.vertexAttrib3fv(te.location,be);break;case 4:n.vertexAttrib4fv(te.location,be);break;default:n.vertexAttrib1fv(te.location,be)}}}}V()}function I(){W();for(const w in r){const z=r[w];for(const B in z){const Y=z[B];for(const Z in Y)g(Y[Z].object),delete Y[Z];delete z[B]}delete r[w]}}function R(w){if(r[w.id]===void 0)return;const z=r[w.id];for(const B in z){const Y=z[B];for(const Z in Y)g(Y[Z].object),delete Y[Z];delete z[B]}delete r[w.id]}function F(w){for(const z in r){const B=r[z];if(B[w.id]===void 0)continue;const Y=B[w.id];for(const Z in Y)g(Y[Z].object),delete Y[Z];delete B[w.id]}}function W(){D(),u=!0,l!==a&&(l=a,m(l.object))}function D(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:o,reset:W,resetDefaultState:D,dispose:I,releaseStatesOfGeometry:R,releaseStatesOfProgram:F,initAttributes:L,enableAttribute:E,disableUnusedAttributes:V}}function mv(n,e,t){let r;function a(m){r=m}function l(m,g){n.drawArrays(r,m,g),t.update(g,r,1)}function u(m,g,x){x!==0&&(n.drawArraysInstanced(r,m,g,x),t.update(g,r,x))}function o(m,g,x){if(x===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,m,0,g,0,x);let S=0;for(let T=0;T<x;T++)S+=g[T];t.update(S,r,1)}function p(m,g,x,y){if(x===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let T=0;T<m.length;T++)u(m[T],g[T],y[T]);else{S.multiDrawArraysInstancedWEBGL(r,m,0,g,0,y,0,x);let T=0;for(let L=0;L<x;L++)T+=g[L]*y[L];t.update(T,r,1)}}this.setMode=a,this.render=l,this.renderInstances=u,this.renderMultiDraw=o,this.renderMultiDrawInstances=p}function _v(n,e,t,r){let a;function l(){if(a!==void 0)return a;if(e.has("EXT_texture_filter_anisotropic")===!0){const F=e.get("EXT_texture_filter_anisotropic");a=n.getParameter(F.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function u(F){return!(F!==An&&r.convert(F)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(F){const W=F===ei&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(F!==Jn&&r.convert(F)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&F!==Zn&&!W)}function p(F){if(F==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";F="mediump"}return F==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let m=t.precision!==void 0?t.precision:"highp";const g=p(m);g!==m&&(mt("WebGLRenderer:",m,"not supported, using",g,"instead."),m=g);const x=t.logarithmicDepthBuffer===!0,y=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),S=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),T=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),L=n.getParameter(n.MAX_TEXTURE_SIZE),E=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),b=n.getParameter(n.MAX_VERTEX_ATTRIBS),V=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),H=n.getParameter(n.MAX_VARYING_VECTORS),X=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),I=T>0,R=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:l,getMaxPrecision:p,textureFormatReadable:u,textureTypeReadable:o,precision:m,logarithmicDepthBuffer:x,reversedDepthBuffer:y,maxTextures:S,maxVertexTextures:T,maxTextureSize:L,maxCubemapSize:E,maxAttributes:b,maxVertexUniforms:V,maxVaryings:H,maxFragmentUniforms:X,vertexTextures:I,maxSamples:R}}function gv(n){const e=this;let t=null,r=0,a=!1,l=!1;const u=new Oi,o=new gt,p={value:null,needsUpdate:!1};this.uniform=p,this.numPlanes=0,this.numIntersection=0,this.init=function(x,y){const S=x.length!==0||y||r!==0||a;return a=y,r=x.length,S},this.beginShadows=function(){l=!0,g(null)},this.endShadows=function(){l=!1},this.setGlobalState=function(x,y){t=g(x,y,0)},this.setState=function(x,y,S){const T=x.clippingPlanes,L=x.clipIntersection,E=x.clipShadows,b=n.get(x);if(!a||T===null||T.length===0||l&&!E)l?g(null):m();else{const V=l?0:r,H=V*4;let X=b.clippingState||null;p.value=X,X=g(T,y,H,S);for(let I=0;I!==H;++I)X[I]=t[I];b.clippingState=X,this.numIntersection=L?this.numPlanes:0,this.numPlanes+=V}};function m(){p.value!==t&&(p.value=t,p.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function g(x,y,S,T){const L=x!==null?x.length:0;let E=null;if(L!==0){if(E=p.value,T!==!0||E===null){const b=S+L*4,V=y.matrixWorldInverse;o.getNormalMatrix(V),(E===null||E.length<b)&&(E=new Float32Array(b));for(let H=0,X=S;H!==L;++H,X+=4)u.copy(x[H]).applyMatrix4(V,o),u.normal.toArray(E,X),E[X+3]=u.constant}p.value=E,p.needsUpdate=!0}return e.numPlanes=L,e.numIntersection=0,E}}function vv(n){let e=new WeakMap;function t(u,o){return o===jc?u.mapping=Ia:o===Kc&&(u.mapping=Ua),u}function r(u){if(u&&u.isTexture){const o=u.mapping;if(o===jc||o===Kc)if(e.has(u)){const p=e.get(u).texture;return t(p,u.mapping)}else{const p=u.image;if(p&&p.height>0){const m=new b0(p.height);return m.fromEquirectangularTexture(n,u),e.set(u,m),u.addEventListener("dispose",a),t(m.texture,u.mapping)}else return null}}return u}function a(u){const o=u.target;o.removeEventListener("dispose",a);const p=e.get(o);p!==void 0&&(e.delete(o),p.dispose())}function l(){e=new WeakMap}return{get:r,dispose:l}}const gi=4,Gu=[.125,.215,.35,.446,.526,.582],Bi=20,xv=256,io=new bh,Hu=new zt;let bc=null,Ec=0,Mc=0,wc=!1;const yv=new le;class Vu{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,r=.1,a=100,l={}){const{size:u=256,position:o=yv}=l;bc=this._renderer.getRenderTarget(),Ec=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),wc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(u);const p=this._allocateTargets();return p.depthBuffer=!0,this._sceneToCubeUV(e,r,a,p,o),t>0&&this._blur(p,0,0,t),this._applyPMREM(p),this._cleanup(p),p}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=$u(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(bc,Ec,Mc),this._renderer.xr.enabled=wc,e.scissorTest=!1,ba(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ia||e.mapping===Ua?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),bc=this._renderer.getRenderTarget(),Ec=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),wc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:un,minFilter:un,generateMipmaps:!1,type:ei,format:An,colorSpace:Rr,depthBuffer:!1},a=Wu(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Wu(e,t,r);const{_lodMax:l}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Sv(l)),this._blurMaterial=Ev(l,e,t),this._ggxMaterial=bv(l,e,t)}return a}_compileMaterial(e){const t=new Pr(new Ei,e);this._renderer.compile(t,io)}_sceneToCubeUV(e,t,r,a,l){const p=new ur(90,1,t,r),m=[1,-1,1,1,1,1],g=[1,1,1,-1,-1,-1],x=this._renderer,y=x.autoClear,S=x.toneMapping;x.getClearColor(Hu),x.toneMapping=Xr,x.autoClear=!1,x.state.buffers.depth.getReversed()&&(x.setRenderTarget(a),x.clearDepth(),x.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Pr(new Ro,new Qf({name:"PMREM.Background",side:In,depthWrite:!1,depthTest:!1})));const L=this._backgroundBox,E=L.material;let b=!1;const V=e.background;V?V.isColor&&(E.color.copy(V),e.background=null,b=!0):(E.color.copy(Hu),b=!0);for(let H=0;H<6;H++){const X=H%3;X===0?(p.up.set(0,m[H],0),p.position.set(l.x,l.y,l.z),p.lookAt(l.x+g[H],l.y,l.z)):X===1?(p.up.set(0,0,m[H]),p.position.set(l.x,l.y,l.z),p.lookAt(l.x,l.y+g[H],l.z)):(p.up.set(0,m[H],0),p.position.set(l.x,l.y,l.z),p.lookAt(l.x,l.y,l.z+g[H]));const I=this._cubeSize;ba(a,X*I,H>2?I:0,I,I),x.setRenderTarget(a),b&&x.render(L,p),x.render(e,p)}x.toneMapping=S,x.autoClear=y,e.background=V}_textureToCubeUV(e,t){const r=this._renderer,a=e.mapping===Ia||e.mapping===Ua;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=$u()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xu());const l=a?this._cubemapMaterial:this._equirectMaterial,u=this._lodMeshes[0];u.material=l;const o=l.uniforms;o.envMap.value=e;const p=this._cubeSize;ba(t,0,0,3*p,2*p),r.setRenderTarget(t),r.render(u,io)}_applyPMREM(e){const t=this._renderer,r=t.autoClear;t.autoClear=!1;const a=this._lodMeshes.length;for(let l=1;l<a;l++)this._applyGGXFilter(e,l-1,l);t.autoClear=r}_applyGGXFilter(e,t,r){const a=this._renderer,l=this._pingPongRenderTarget,u=this._ggxMaterial,o=this._lodMeshes[r];o.material=u;const p=u.uniforms,m=r/(this._lodMeshes.length-1),g=t/(this._lodMeshes.length-1),x=Math.sqrt(m*m-g*g),y=.05+m*.95,S=x*y,{_lodMax:T}=this,L=this._sizeLods[r],E=3*L*(r>T-gi?r-T+gi:0),b=4*(this._cubeSize-L);p.envMap.value=e.texture,p.roughness.value=S,p.mipInt.value=T-t,ba(l,E,b,3*L,2*L),a.setRenderTarget(l),a.render(o,io),p.envMap.value=l.texture,p.roughness.value=0,p.mipInt.value=T-r,ba(e,E,b,3*L,2*L),a.setRenderTarget(e),a.render(o,io)}_blur(e,t,r,a,l){const u=this._pingPongRenderTarget;this._halfBlur(e,u,t,r,a,"latitudinal",l),this._halfBlur(u,e,r,r,a,"longitudinal",l)}_halfBlur(e,t,r,a,l,u,o){const p=this._renderer,m=this._blurMaterial;u!=="latitudinal"&&u!=="longitudinal"&&Jt("blur direction must be either latitudinal or longitudinal!");const g=3,x=this._lodMeshes[a];x.material=m;const y=m.uniforms,S=this._sizeLods[r]-1,T=isFinite(l)?Math.PI/(2*S):2*Math.PI/(2*Bi-1),L=l/T,E=isFinite(l)?1+Math.floor(g*L):Bi;E>Bi&&mt(`sigmaRadians, ${l}, is too large and will clip, as it requested ${E} samples when the maximum is set to ${Bi}`);const b=[];let V=0;for(let F=0;F<Bi;++F){const W=F/L,D=Math.exp(-W*W/2);b.push(D),F===0?V+=D:F<E&&(V+=2*D)}for(let F=0;F<b.length;F++)b[F]=b[F]/V;y.envMap.value=e.texture,y.samples.value=E,y.weights.value=b,y.latitudinal.value=u==="latitudinal",o&&(y.poleAxis.value=o);const{_lodMax:H}=this;y.dTheta.value=T,y.mipInt.value=H-r;const X=this._sizeLods[a],I=3*X*(a>H-gi?a-H+gi:0),R=4*(this._cubeSize-X);ba(t,I,R,3*X,2*X),p.setRenderTarget(t),p.render(x,io)}}function Sv(n){const e=[],t=[],r=[];let a=n;const l=n-gi+1+Gu.length;for(let u=0;u<l;u++){const o=Math.pow(2,a);e.push(o);let p=1/o;u>n-gi?p=Gu[u-n+gi-1]:u===0&&(p=0),t.push(p);const m=1/(o-2),g=-m,x=1+m,y=[g,g,x,g,x,x,g,g,x,x,g,x],S=6,T=6,L=3,E=2,b=1,V=new Float32Array(L*T*S),H=new Float32Array(E*T*S),X=new Float32Array(b*T*S);for(let R=0;R<S;R++){const F=R%3*2/3-1,W=R>2?0:-1,D=[F,W,0,F+2/3,W,0,F+2/3,W+1,0,F,W,0,F+2/3,W+1,0,F,W+1,0];V.set(D,L*T*R),H.set(y,E*T*R);const w=[R,R,R,R,R,R];X.set(w,b*T*R)}const I=new Ei;I.setAttribute("position",new Ar(V,L)),I.setAttribute("uv",new Ar(H,E)),I.setAttribute("faceIndex",new Ar(X,b)),r.push(new Pr(I,null)),a>gi&&a--}return{lodMeshes:r,sizeLods:e,sigmas:t}}function Wu(n,e,t){const r=new qr(n,e,t);return r.texture.mapping=Xs,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function ba(n,e,t,r,a){n.viewport.set(e,t,r,a),n.scissor.set(e,t,r,a)}function bv(n,e,t){return new Qn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:xv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ys(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:hr,depthTest:!1,depthWrite:!1})}function Ev(n,e,t){const r=new Float32Array(Bi),a=new le(0,1,0);return new Qn({name:"SphericalGaussianBlur",defines:{n:Bi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:Ys(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:hr,depthTest:!1,depthWrite:!1})}function Xu(){return new Qn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ys(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:hr,depthTest:!1,depthWrite:!1})}function $u(){return new Qn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ys(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hr,depthTest:!1,depthWrite:!1})}function Ys(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Mv(n){let e=new WeakMap,t=null;function r(o){if(o&&o.isTexture){const p=o.mapping,m=p===jc||p===Kc,g=p===Ia||p===Ua;if(m||g){let x=e.get(o);const y=x!==void 0?x.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==y)return t===null&&(t=new Vu(n)),x=m?t.fromEquirectangular(o,x):t.fromCubemap(o,x),x.texture.pmremVersion=o.pmremVersion,e.set(o,x),x.texture;if(x!==void 0)return x.texture;{const S=o.image;return m&&S&&S.height>0||g&&S&&a(S)?(t===null&&(t=new Vu(n)),x=m?t.fromEquirectangular(o):t.fromCubemap(o),x.texture.pmremVersion=o.pmremVersion,e.set(o,x),o.addEventListener("dispose",l),x.texture):null}}}return o}function a(o){let p=0;const m=6;for(let g=0;g<m;g++)o[g]!==void 0&&p++;return p===m}function l(o){const p=o.target;p.removeEventListener("dispose",l);const m=e.get(p);m!==void 0&&(e.delete(p),m.dispose())}function u(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:r,dispose:u}}function wv(n){const e={};function t(r){if(e[r]!==void 0)return e[r];const a=n.getExtension(r);return e[r]=a,a}return{has:function(r){return t(r)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(r){const a=t(r);return a===null&&bo("WebGLRenderer: "+r+" extension not supported."),a}}}function Tv(n,e,t,r){const a={},l=new WeakMap;function u(x){const y=x.target;y.index!==null&&e.remove(y.index);for(const T in y.attributes)e.remove(y.attributes[T]);y.removeEventListener("dispose",u),delete a[y.id];const S=l.get(y);S&&(e.remove(S),l.delete(y)),r.releaseStatesOfGeometry(y),y.isInstancedBufferGeometry===!0&&delete y._maxInstanceCount,t.memory.geometries--}function o(x,y){return a[y.id]===!0||(y.addEventListener("dispose",u),a[y.id]=!0,t.memory.geometries++),y}function p(x){const y=x.attributes;for(const S in y)e.update(y[S],n.ARRAY_BUFFER)}function m(x){const y=[],S=x.index,T=x.attributes.position;let L=0;if(S!==null){const V=S.array;L=S.version;for(let H=0,X=V.length;H<X;H+=3){const I=V[H+0],R=V[H+1],F=V[H+2];y.push(I,R,R,F,F,I)}}else if(T!==void 0){const V=T.array;L=T.version;for(let H=0,X=V.length/3-1;H<X;H+=3){const I=H+0,R=H+1,F=H+2;y.push(I,R,R,F,F,I)}}else return;const E=new(fh(y)?mh:ph)(y,1);E.version=L;const b=l.get(x);b&&e.remove(b),l.set(x,E)}function g(x){const y=l.get(x);if(y){const S=x.index;S!==null&&y.version<S.version&&m(x)}else m(x);return l.get(x)}return{get:o,update:p,getWireframeAttribute:g}}function Av(n,e,t){let r;function a(y){r=y}let l,u;function o(y){l=y.type,u=y.bytesPerElement}function p(y,S){n.drawElements(r,S,l,y*u),t.update(S,r,1)}function m(y,S,T){T!==0&&(n.drawElementsInstanced(r,S,l,y*u,T),t.update(S,r,T))}function g(y,S,T){if(T===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,S,0,l,y,0,T);let E=0;for(let b=0;b<T;b++)E+=S[b];t.update(E,r,1)}function x(y,S,T,L){if(T===0)return;const E=e.get("WEBGL_multi_draw");if(E===null)for(let b=0;b<y.length;b++)m(y[b]/u,S[b],L[b]);else{E.multiDrawElementsInstancedWEBGL(r,S,0,l,y,0,L,0,T);let b=0;for(let V=0;V<T;V++)b+=S[V]*L[V];t.update(b,r,1)}}this.setMode=a,this.setIndex=o,this.render=p,this.renderInstances=m,this.renderMultiDraw=g,this.renderMultiDrawInstances=x}function Cv(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(l,u,o){switch(t.calls++,u){case n.TRIANGLES:t.triangles+=o*(l/3);break;case n.LINES:t.lines+=o*(l/2);break;case n.LINE_STRIP:t.lines+=o*(l-1);break;case n.LINE_LOOP:t.lines+=o*l;break;case n.POINTS:t.points+=o*l;break;default:Jt("WebGLInfo: Unknown draw mode:",u);break}}function a(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:a,update:r}}function Rv(n,e,t){const r=new WeakMap,a=new Qt;function l(u,o,p){const m=u.morphTargetInfluences,g=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,x=g!==void 0?g.length:0;let y=r.get(o);if(y===void 0||y.count!==x){let D=function(){F.dispose(),r.delete(o),o.removeEventListener("dispose",D)};y!==void 0&&y.texture.dispose();const S=o.morphAttributes.position!==void 0,T=o.morphAttributes.normal!==void 0,L=o.morphAttributes.color!==void 0,E=o.morphAttributes.position||[],b=o.morphAttributes.normal||[],V=o.morphAttributes.color||[];let H=0;S===!0&&(H=1),T===!0&&(H=2),L===!0&&(H=3);let X=o.attributes.position.count*H,I=1;X>e.maxTextureSize&&(I=Math.ceil(X/e.maxTextureSize),X=e.maxTextureSize);const R=new Float32Array(X*I*4*x),F=new uh(R,X,I,x);F.type=Zn,F.needsUpdate=!0;const W=H*4;for(let w=0;w<x;w++){const z=E[w],B=b[w],Y=V[w],Z=X*I*4*w;for(let j=0;j<z.count;j++){const J=j*W;S===!0&&(a.fromBufferAttribute(z,j),R[Z+J+0]=a.x,R[Z+J+1]=a.y,R[Z+J+2]=a.z,R[Z+J+3]=0),T===!0&&(a.fromBufferAttribute(B,j),R[Z+J+4]=a.x,R[Z+J+5]=a.y,R[Z+J+6]=a.z,R[Z+J+7]=0),L===!0&&(a.fromBufferAttribute(Y,j),R[Z+J+8]=a.x,R[Z+J+9]=a.y,R[Z+J+10]=a.z,R[Z+J+11]=Y.itemSize===4?a.w:1)}}y={count:x,texture:F,size:new Gt(X,I)},r.set(o,y),o.addEventListener("dispose",D)}if(u.isInstancedMesh===!0&&u.morphTexture!==null)p.getUniforms().setValue(n,"morphTexture",u.morphTexture,t);else{let S=0;for(let L=0;L<m.length;L++)S+=m[L];const T=o.morphTargetsRelative?1:1-S;p.getUniforms().setValue(n,"morphTargetBaseInfluence",T),p.getUniforms().setValue(n,"morphTargetInfluences",m)}p.getUniforms().setValue(n,"morphTargetsTexture",y.texture,t),p.getUniforms().setValue(n,"morphTargetsTextureSize",y.size)}return{update:l}}function Pv(n,e,t,r){let a=new WeakMap;function l(p){const m=r.render.frame,g=p.geometry,x=e.get(p,g);if(a.get(x)!==m&&(e.update(x),a.set(x,m)),p.isInstancedMesh&&(p.hasEventListener("dispose",o)===!1&&p.addEventListener("dispose",o),a.get(p)!==m&&(t.update(p.instanceMatrix,n.ARRAY_BUFFER),p.instanceColor!==null&&t.update(p.instanceColor,n.ARRAY_BUFFER),a.set(p,m))),p.isSkinnedMesh){const y=p.skeleton;a.get(y)!==m&&(y.update(),a.set(y,m))}return x}function u(){a=new WeakMap}function o(p){const m=p.target;m.removeEventListener("dispose",o),t.remove(m.instanceMatrix),m.instanceColor!==null&&t.remove(m.instanceColor)}return{update:l,dispose:u}}const Mh=new pn,qu=new yh(1,1),wh=new uh,Th=new t0,Ah=new vh,Yu=[],ju=[],Ku=new Float32Array(16),Zu=new Float32Array(9),Ju=new Float32Array(4);function Ga(n,e,t){const r=n[0];if(r<=0||r>0)return n;const a=e*t;let l=Yu[a];if(l===void 0&&(l=new Float32Array(a),Yu[a]=l),e!==0){r.toArray(l,0);for(let u=1,o=0;u!==e;++u)o+=t,n[u].toArray(l,o)}return l}function sn(n,e){if(n.length!==e.length)return!1;for(let t=0,r=n.length;t<r;t++)if(n[t]!==e[t])return!1;return!0}function ln(n,e){for(let t=0,r=e.length;t<r;t++)n[t]=e[t]}function js(n,e){let t=ju[e];t===void 0&&(t=new Int32Array(e),ju[e]=t);for(let r=0;r!==e;++r)t[r]=n.allocateTextureUnit();return t}function Dv(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Lv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(sn(t,e))return;n.uniform2fv(this.addr,e),ln(t,e)}}function Fv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(sn(t,e))return;n.uniform3fv(this.addr,e),ln(t,e)}}function Iv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(sn(t,e))return;n.uniform4fv(this.addr,e),ln(t,e)}}function Uv(n,e){const t=this.cache,r=e.elements;if(r===void 0){if(sn(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),ln(t,e)}else{if(sn(t,r))return;Ju.set(r),n.uniformMatrix2fv(this.addr,!1,Ju),ln(t,r)}}function Nv(n,e){const t=this.cache,r=e.elements;if(r===void 0){if(sn(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),ln(t,e)}else{if(sn(t,r))return;Zu.set(r),n.uniformMatrix3fv(this.addr,!1,Zu),ln(t,r)}}function Ov(n,e){const t=this.cache,r=e.elements;if(r===void 0){if(sn(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),ln(t,e)}else{if(sn(t,r))return;Ku.set(r),n.uniformMatrix4fv(this.addr,!1,Ku),ln(t,r)}}function kv(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Bv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(sn(t,e))return;n.uniform2iv(this.addr,e),ln(t,e)}}function zv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(sn(t,e))return;n.uniform3iv(this.addr,e),ln(t,e)}}function Gv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(sn(t,e))return;n.uniform4iv(this.addr,e),ln(t,e)}}function Hv(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Vv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(sn(t,e))return;n.uniform2uiv(this.addr,e),ln(t,e)}}function Wv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(sn(t,e))return;n.uniform3uiv(this.addr,e),ln(t,e)}}function Xv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(sn(t,e))return;n.uniform4uiv(this.addr,e),ln(t,e)}}function $v(n,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(n.uniform1i(this.addr,a),r[0]=a);let l;this.type===n.SAMPLER_2D_SHADOW?(qu.compareFunction=ch,l=qu):l=Mh,t.setTexture2D(e||l,a)}function qv(n,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(n.uniform1i(this.addr,a),r[0]=a),t.setTexture3D(e||Th,a)}function Yv(n,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(n.uniform1i(this.addr,a),r[0]=a),t.setTextureCube(e||Ah,a)}function jv(n,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(n.uniform1i(this.addr,a),r[0]=a),t.setTexture2DArray(e||wh,a)}function Kv(n){switch(n){case 5126:return Dv;case 35664:return Lv;case 35665:return Fv;case 35666:return Iv;case 35674:return Uv;case 35675:return Nv;case 35676:return Ov;case 5124:case 35670:return kv;case 35667:case 35671:return Bv;case 35668:case 35672:return zv;case 35669:case 35673:return Gv;case 5125:return Hv;case 36294:return Vv;case 36295:return Wv;case 36296:return Xv;case 35678:case 36198:case 36298:case 36306:case 35682:return $v;case 35679:case 36299:case 36307:return qv;case 35680:case 36300:case 36308:case 36293:return Yv;case 36289:case 36303:case 36311:case 36292:return jv}}function Zv(n,e){n.uniform1fv(this.addr,e)}function Jv(n,e){const t=Ga(e,this.size,2);n.uniform2fv(this.addr,t)}function Qv(n,e){const t=Ga(e,this.size,3);n.uniform3fv(this.addr,t)}function ex(n,e){const t=Ga(e,this.size,4);n.uniform4fv(this.addr,t)}function tx(n,e){const t=Ga(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function nx(n,e){const t=Ga(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function rx(n,e){const t=Ga(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function ix(n,e){n.uniform1iv(this.addr,e)}function ax(n,e){n.uniform2iv(this.addr,e)}function ox(n,e){n.uniform3iv(this.addr,e)}function sx(n,e){n.uniform4iv(this.addr,e)}function lx(n,e){n.uniform1uiv(this.addr,e)}function cx(n,e){n.uniform2uiv(this.addr,e)}function fx(n,e){n.uniform3uiv(this.addr,e)}function ux(n,e){n.uniform4uiv(this.addr,e)}function dx(n,e,t){const r=this.cache,a=e.length,l=js(t,a);sn(r,l)||(n.uniform1iv(this.addr,l),ln(r,l));for(let u=0;u!==a;++u)t.setTexture2D(e[u]||Mh,l[u])}function hx(n,e,t){const r=this.cache,a=e.length,l=js(t,a);sn(r,l)||(n.uniform1iv(this.addr,l),ln(r,l));for(let u=0;u!==a;++u)t.setTexture3D(e[u]||Th,l[u])}function px(n,e,t){const r=this.cache,a=e.length,l=js(t,a);sn(r,l)||(n.uniform1iv(this.addr,l),ln(r,l));for(let u=0;u!==a;++u)t.setTextureCube(e[u]||Ah,l[u])}function mx(n,e,t){const r=this.cache,a=e.length,l=js(t,a);sn(r,l)||(n.uniform1iv(this.addr,l),ln(r,l));for(let u=0;u!==a;++u)t.setTexture2DArray(e[u]||wh,l[u])}function _x(n){switch(n){case 5126:return Zv;case 35664:return Jv;case 35665:return Qv;case 35666:return ex;case 35674:return tx;case 35675:return nx;case 35676:return rx;case 5124:case 35670:return ix;case 35667:case 35671:return ax;case 35668:case 35672:return ox;case 35669:case 35673:return sx;case 5125:return lx;case 36294:return cx;case 36295:return fx;case 36296:return ux;case 35678:case 36198:case 36298:case 36306:case 35682:return dx;case 35679:case 36299:case 36307:return hx;case 35680:case 36300:case 36308:case 36293:return px;case 36289:case 36303:case 36311:case 36292:return mx}}class gx{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=Kv(t.type)}}class vx{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=_x(t.type)}}class xx{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){const a=this.seq;for(let l=0,u=a.length;l!==u;++l){const o=a[l];o.setValue(e,t[o.id],r)}}}const Tc=/(\w+)(\])?(\[|\.)?/g;function Qu(n,e){n.seq.push(e),n.map[e.id]=e}function yx(n,e,t){const r=n.name,a=r.length;for(Tc.lastIndex=0;;){const l=Tc.exec(r),u=Tc.lastIndex;let o=l[1];const p=l[2]==="]",m=l[3];if(p&&(o=o|0),m===void 0||m==="["&&u+2===a){Qu(t,m===void 0?new gx(o,n,e):new vx(o,n,e));break}else{let x=t.map[o];x===void 0&&(x=new xx(o),Qu(t,x)),t=x}}}class Ps{constructor(e,t){this.seq=[],this.map={};const r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<r;++a){const l=e.getActiveUniform(t,a),u=e.getUniformLocation(t,l.name);yx(l,u,this)}}setValue(e,t,r,a){const l=this.map[t];l!==void 0&&l.setValue(e,r,a)}setOptional(e,t,r){const a=t[r];a!==void 0&&this.setValue(e,r,a)}static upload(e,t,r,a){for(let l=0,u=t.length;l!==u;++l){const o=t[l],p=r[o.id];p.needsUpdate!==!1&&o.setValue(e,p.value,a)}}static seqWithValue(e,t){const r=[];for(let a=0,l=e.length;a!==l;++a){const u=e[a];u.id in t&&r.push(u)}return r}}function ed(n,e,t){const r=n.createShader(e);return n.shaderSource(r,t),n.compileShader(r),r}const Sx=37297;let bx=0;function Ex(n,e){const t=n.split(`
`),r=[],a=Math.max(e-6,0),l=Math.min(e+6,t.length);for(let u=a;u<l;u++){const o=u+1;r.push(`${o===e?">":" "} ${o}: ${t[u]}`)}return r.join(`
`)}const td=new gt;function Mx(n){Rt._getMatrix(td,Rt.workingColorSpace,n);const e=`mat3( ${td.elements.map(t=>t.toFixed(4))} )`;switch(Rt.getTransfer(n)){case Us:return[e,"LinearTransferOETF"];case Bt:return[e,"sRGBTransferOETF"];default:return mt("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function nd(n,e,t){const r=n.getShaderParameter(e,n.COMPILE_STATUS),l=(n.getShaderInfoLog(e)||"").trim();if(r&&l==="")return"";const u=/ERROR: 0:(\d+)/.exec(l);if(u){const o=parseInt(u[1]);return t.toUpperCase()+`

`+l+`

`+Ex(n.getShaderSource(e),o)}else return l}function wx(n,e){const t=Mx(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Tx(n,e){let t;switch(e){case qc:t="Linear";break;case nh:t="Reinhard";break;case rh:t="Cineon";break;case Yc:t="ACESFilmic";break;case Fm:t="AgX";break;case Im:t="Neutral";break;case Lm:t="Custom";break;default:mt("WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ss=new le;function Ax(){Rt.getLuminanceCoefficients(Ss);const n=Ss.x.toFixed(4),e=Ss.y.toFixed(4),t=Ss.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Cx(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(co).join(`
`)}function Rx(n){const e=[];for(const t in n){const r=n[t];r!==!1&&e.push("#define "+t+" "+r)}return e.join(`
`)}function Px(n,e){const t={},r=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let a=0;a<r;a++){const l=n.getActiveAttrib(e,a),u=l.name;let o=1;l.type===n.FLOAT_MAT2&&(o=2),l.type===n.FLOAT_MAT3&&(o=3),l.type===n.FLOAT_MAT4&&(o=4),t[u]={type:l.type,location:n.getAttribLocation(e,u),locationSize:o}}return t}function co(n){return n!==""}function rd(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function id(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Dx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Cf(n){return n.replace(Dx,Fx)}const Lx=new Map;function Fx(n,e){let t=xt[e];if(t===void 0){const r=Lx.get(e);if(r!==void 0)t=xt[r],mt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return Cf(t)}const Ix=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ad(n){return n.replace(Ix,Ux)}function Ux(n,e,t,r){let a="";for(let l=parseInt(e);l<parseInt(t);l++)a+=r.replace(/\[\s*i\s*\]/g,"[ "+l+" ]").replace(/UNROLLED_LOOP_INDEX/g,l);return a}function od(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Nx(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===eh?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===um?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Br&&(e="SHADOWMAP_TYPE_VSM"),e}function Ox(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Ia:case Ua:e="ENVMAP_TYPE_CUBE";break;case Xs:e="ENVMAP_TYPE_CUBE_UV";break}return e}function kx(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Ua:e="ENVMAP_MODE_REFRACTION";break}return e}function Bx(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case th:e="ENVMAP_BLENDING_MULTIPLY";break;case Pm:e="ENVMAP_BLENDING_MIX";break;case Dm:e="ENVMAP_BLENDING_ADD";break}return e}function zx(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:r,maxMip:t}}function Gx(n,e,t,r){const a=n.getContext(),l=t.defines;let u=t.vertexShader,o=t.fragmentShader;const p=Nx(t),m=Ox(t),g=kx(t),x=Bx(t),y=zx(t),S=Cx(t),T=Rx(l),L=a.createProgram();let E,b,V=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(E=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T].filter(co).join(`
`),E.length>0&&(E+=`
`),b=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T].filter(co).join(`
`),b.length>0&&(b+=`
`)):(E=[od(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+g:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+p:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(co).join(`
`),b=[od(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.envMap?"#define "+g:"",t.envMap?"#define "+x:"",y?"#define CUBEUV_TEXEL_WIDTH "+y.texelWidth:"",y?"#define CUBEUV_TEXEL_HEIGHT "+y.texelHeight:"",y?"#define CUBEUV_MAX_MIP "+y.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+p:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Xr?"#define TONE_MAPPING":"",t.toneMapping!==Xr?xt.tonemapping_pars_fragment:"",t.toneMapping!==Xr?Tx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",xt.colorspace_pars_fragment,wx("linearToOutputTexel",t.outputColorSpace),Ax(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(co).join(`
`)),u=Cf(u),u=rd(u,t),u=id(u,t),o=Cf(o),o=rd(o,t),o=id(o,t),u=ad(u),o=ad(o),t.isRawShaderMaterial!==!0&&(V=`#version 300 es
`,E=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+E,b=["#define varying in",t.glslVersion===Su?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Su?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+b);const H=V+E+u,X=V+b+o,I=ed(a,a.VERTEX_SHADER,H),R=ed(a,a.FRAGMENT_SHADER,X);a.attachShader(L,I),a.attachShader(L,R),t.index0AttributeName!==void 0?a.bindAttribLocation(L,0,t.index0AttributeName):t.morphTargets===!0&&a.bindAttribLocation(L,0,"position"),a.linkProgram(L);function F(z){if(n.debug.checkShaderErrors){const B=a.getProgramInfoLog(L)||"",Y=a.getShaderInfoLog(I)||"",Z=a.getShaderInfoLog(R)||"",j=B.trim(),J=Y.trim(),ue=Z.trim();let te=!0,Se=!0;if(a.getProgramParameter(L,a.LINK_STATUS)===!1)if(te=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(a,L,I,R);else{const be=nd(a,I,"vertex"),Ye=nd(a,R,"fragment");Jt("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(L,a.VALIDATE_STATUS)+`

Material Name: `+z.name+`
Material Type: `+z.type+`

Program Info Log: `+j+`
`+be+`
`+Ye)}else j!==""?mt("WebGLProgram: Program Info Log:",j):(J===""||ue==="")&&(Se=!1);Se&&(z.diagnostics={runnable:te,programLog:j,vertexShader:{log:J,prefix:E},fragmentShader:{log:ue,prefix:b}})}a.deleteShader(I),a.deleteShader(R),W=new Ps(a,L),D=Px(a,L)}let W;this.getUniforms=function(){return W===void 0&&F(this),W};let D;this.getAttributes=function(){return D===void 0&&F(this),D};let w=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=a.getProgramParameter(L,Sx)),w},this.destroy=function(){r.releaseStatesOfProgram(this),a.deleteProgram(L),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=bx++,this.cacheKey=e,this.usedTimes=1,this.program=L,this.vertexShader=I,this.fragmentShader=R,this}let Hx=0;class Vx{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,r=e.fragmentShader,a=this._getShaderStage(t),l=this._getShaderStage(r),u=this._getShaderCacheForMaterial(e);return u.has(a)===!1&&(u.add(a),a.usedTimes++),u.has(l)===!1&&(u.add(l),l.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){const t=this.shaderCache;let r=t.get(e);return r===void 0&&(r=new Wx(e),t.set(e,r)),r}}class Wx{constructor(e){this.id=Hx++,this.code=e,this.usedTimes=0}}function Xx(n,e,t,r,a,l,u){const o=new dh,p=new Vx,m=new Set,g=[],x=a.logarithmicDepthBuffer,y=a.vertexTextures;let S=a.precision;const T={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function L(D){return m.add(D),D===0?"uv":`uv${D}`}function E(D,w,z,B,Y){const Z=B.fog,j=Y.geometry,J=D.isMeshStandardMaterial?B.environment:null,ue=(D.isMeshStandardMaterial?t:e).get(D.envMap||J),te=ue&&ue.mapping===Xs?ue.image.height:null,Se=T[D.type];D.precision!==null&&(S=a.getMaxPrecision(D.precision),S!==D.precision&&mt("WebGLProgram.getParameters:",D.precision,"not supported, using",S,"instead."));const be=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,Ye=be!==void 0?be.length:0;let ct=0;j.morphAttributes.position!==void 0&&(ct=1),j.morphAttributes.normal!==void 0&&(ct=2),j.morphAttributes.color!==void 0&&(ct=3);let pt,yt,vt,_e;if(Se){const Mt=Er[Se];pt=Mt.vertexShader,yt=Mt.fragmentShader}else pt=D.vertexShader,yt=D.fragmentShader,p.update(D),vt=p.getVertexShaderID(D),_e=p.getFragmentShaderID(D);const ge=n.getRenderTarget(),Oe=n.state.buffers.depth.getReversed(),Qe=Y.isInstancedMesh===!0,$e=Y.isBatchedMesh===!0,ft=!!D.map,Lt=!!D.matcap,Re=!!ue,lt=!!D.aoMap,$=!!D.lightMap,nt=!!D.bumpMap,rt=!!D.normalMap,ut=!!D.displacementMap,Ue=!!D.emissiveMap,bt=!!D.metalnessMap,qe=!!D.roughnessMap,it=D.anisotropy>0,N=D.clearcoat>0,P=D.dispersion>0,ne=D.iridescence>0,he=D.sheen>0,de=D.transmission>0,ie=it&&!!D.anisotropyMap,Ze=N&&!!D.clearcoatMap,Fe=N&&!!D.clearcoatNormalMap,et=N&&!!D.clearcoatRoughnessMap,Ke=ne&&!!D.iridescenceMap,ve=ne&&!!D.iridescenceThicknessMap,fe=he&&!!D.sheenColorMap,we=he&&!!D.sheenRoughnessMap,je=!!D.specularMap,Be=!!D.specularColorMap,Ve=!!D.specularIntensityMap,q=de&&!!D.transmissionMap,Ie=de&&!!D.thicknessMap,Pe=!!D.gradientMap,Ce=!!D.alphaMap,Ee=D.alphaTest>0,pe=!!D.alphaHash,ze=!!D.extensions;let Te=Xr;D.toneMapped&&(ge===null||ge.isXRRenderTarget===!0)&&(Te=n.toneMapping);const It={shaderID:Se,shaderType:D.type,shaderName:D.name,vertexShader:pt,fragmentShader:yt,defines:D.defines,customVertexShaderID:vt,customFragmentShaderID:_e,isRawShaderMaterial:D.isRawShaderMaterial===!0,glslVersion:D.glslVersion,precision:S,batching:$e,batchingColor:$e&&Y._colorsTexture!==null,instancing:Qe,instancingColor:Qe&&Y.instanceColor!==null,instancingMorph:Qe&&Y.morphTexture!==null,supportsVertexTextures:y,outputColorSpace:ge===null?n.outputColorSpace:ge.isXRRenderTarget===!0?ge.texture.colorSpace:Rr,alphaToCoverage:!!D.alphaToCoverage,map:ft,matcap:Lt,envMap:Re,envMapMode:Re&&ue.mapping,envMapCubeUVHeight:te,aoMap:lt,lightMap:$,bumpMap:nt,normalMap:rt,displacementMap:y&&ut,emissiveMap:Ue,normalMapObjectSpace:rt&&D.normalMapType===Bm,normalMapTangentSpace:rt&&D.normalMapType===km,metalnessMap:bt,roughnessMap:qe,anisotropy:it,anisotropyMap:ie,clearcoat:N,clearcoatMap:Ze,clearcoatNormalMap:Fe,clearcoatRoughnessMap:et,dispersion:P,iridescence:ne,iridescenceMap:Ke,iridescenceThicknessMap:ve,sheen:he,sheenColorMap:fe,sheenRoughnessMap:we,specularMap:je,specularColorMap:Be,specularIntensityMap:Ve,transmission:de,transmissionMap:q,thicknessMap:Ie,gradientMap:Pe,opaque:D.transparent===!1&&D.blending===Ca&&D.alphaToCoverage===!1,alphaMap:Ce,alphaTest:Ee,alphaHash:pe,combine:D.combine,mapUv:ft&&L(D.map.channel),aoMapUv:lt&&L(D.aoMap.channel),lightMapUv:$&&L(D.lightMap.channel),bumpMapUv:nt&&L(D.bumpMap.channel),normalMapUv:rt&&L(D.normalMap.channel),displacementMapUv:ut&&L(D.displacementMap.channel),emissiveMapUv:Ue&&L(D.emissiveMap.channel),metalnessMapUv:bt&&L(D.metalnessMap.channel),roughnessMapUv:qe&&L(D.roughnessMap.channel),anisotropyMapUv:ie&&L(D.anisotropyMap.channel),clearcoatMapUv:Ze&&L(D.clearcoatMap.channel),clearcoatNormalMapUv:Fe&&L(D.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:et&&L(D.clearcoatRoughnessMap.channel),iridescenceMapUv:Ke&&L(D.iridescenceMap.channel),iridescenceThicknessMapUv:ve&&L(D.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&L(D.sheenColorMap.channel),sheenRoughnessMapUv:we&&L(D.sheenRoughnessMap.channel),specularMapUv:je&&L(D.specularMap.channel),specularColorMapUv:Be&&L(D.specularColorMap.channel),specularIntensityMapUv:Ve&&L(D.specularIntensityMap.channel),transmissionMapUv:q&&L(D.transmissionMap.channel),thicknessMapUv:Ie&&L(D.thicknessMap.channel),alphaMapUv:Ce&&L(D.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(rt||it),vertexColors:D.vertexColors,vertexAlphas:D.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:Y.isPoints===!0&&!!j.attributes.uv&&(ft||Ce),fog:!!Z,useFog:D.fog===!0,fogExp2:!!Z&&Z.isFogExp2,flatShading:D.flatShading===!0&&D.wireframe===!1,sizeAttenuation:D.sizeAttenuation===!0,logarithmicDepthBuffer:x,reversedDepthBuffer:Oe,skinning:Y.isSkinnedMesh===!0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:Ye,morphTextureStride:ct,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:u.numPlanes,numClipIntersection:u.numIntersection,dithering:D.dithering,shadowMapEnabled:n.shadowMap.enabled&&z.length>0,shadowMapType:n.shadowMap.type,toneMapping:Te,decodeVideoTexture:ft&&D.map.isVideoTexture===!0&&Rt.getTransfer(D.map.colorSpace)===Bt,decodeVideoTextureEmissive:Ue&&D.emissiveMap.isVideoTexture===!0&&Rt.getTransfer(D.emissiveMap.colorSpace)===Bt,premultipliedAlpha:D.premultipliedAlpha,doubleSided:D.side===Gr,flipSided:D.side===In,useDepthPacking:D.depthPacking>=0,depthPacking:D.depthPacking||0,index0AttributeName:D.index0AttributeName,extensionClipCullDistance:ze&&D.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ze&&D.extensions.multiDraw===!0||$e)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:D.customProgramCacheKey()};return It.vertexUv1s=m.has(1),It.vertexUv2s=m.has(2),It.vertexUv3s=m.has(3),m.clear(),It}function b(D){const w=[];if(D.shaderID?w.push(D.shaderID):(w.push(D.customVertexShaderID),w.push(D.customFragmentShaderID)),D.defines!==void 0)for(const z in D.defines)w.push(z),w.push(D.defines[z]);return D.isRawShaderMaterial===!1&&(V(w,D),H(w,D),w.push(n.outputColorSpace)),w.push(D.customProgramCacheKey),w.join()}function V(D,w){D.push(w.precision),D.push(w.outputColorSpace),D.push(w.envMapMode),D.push(w.envMapCubeUVHeight),D.push(w.mapUv),D.push(w.alphaMapUv),D.push(w.lightMapUv),D.push(w.aoMapUv),D.push(w.bumpMapUv),D.push(w.normalMapUv),D.push(w.displacementMapUv),D.push(w.emissiveMapUv),D.push(w.metalnessMapUv),D.push(w.roughnessMapUv),D.push(w.anisotropyMapUv),D.push(w.clearcoatMapUv),D.push(w.clearcoatNormalMapUv),D.push(w.clearcoatRoughnessMapUv),D.push(w.iridescenceMapUv),D.push(w.iridescenceThicknessMapUv),D.push(w.sheenColorMapUv),D.push(w.sheenRoughnessMapUv),D.push(w.specularMapUv),D.push(w.specularColorMapUv),D.push(w.specularIntensityMapUv),D.push(w.transmissionMapUv),D.push(w.thicknessMapUv),D.push(w.combine),D.push(w.fogExp2),D.push(w.sizeAttenuation),D.push(w.morphTargetsCount),D.push(w.morphAttributeCount),D.push(w.numDirLights),D.push(w.numPointLights),D.push(w.numSpotLights),D.push(w.numSpotLightMaps),D.push(w.numHemiLights),D.push(w.numRectAreaLights),D.push(w.numDirLightShadows),D.push(w.numPointLightShadows),D.push(w.numSpotLightShadows),D.push(w.numSpotLightShadowsWithMaps),D.push(w.numLightProbes),D.push(w.shadowMapType),D.push(w.toneMapping),D.push(w.numClippingPlanes),D.push(w.numClipIntersection),D.push(w.depthPacking)}function H(D,w){o.disableAll(),w.supportsVertexTextures&&o.enable(0),w.instancing&&o.enable(1),w.instancingColor&&o.enable(2),w.instancingMorph&&o.enable(3),w.matcap&&o.enable(4),w.envMap&&o.enable(5),w.normalMapObjectSpace&&o.enable(6),w.normalMapTangentSpace&&o.enable(7),w.clearcoat&&o.enable(8),w.iridescence&&o.enable(9),w.alphaTest&&o.enable(10),w.vertexColors&&o.enable(11),w.vertexAlphas&&o.enable(12),w.vertexUv1s&&o.enable(13),w.vertexUv2s&&o.enable(14),w.vertexUv3s&&o.enable(15),w.vertexTangents&&o.enable(16),w.anisotropy&&o.enable(17),w.alphaHash&&o.enable(18),w.batching&&o.enable(19),w.dispersion&&o.enable(20),w.batchingColor&&o.enable(21),w.gradientMap&&o.enable(22),D.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),D.push(o.mask)}function X(D){const w=T[D.type];let z;if(w){const B=Er[w];z=v0.clone(B.uniforms)}else z=D.uniforms;return z}function I(D,w){let z;for(let B=0,Y=g.length;B<Y;B++){const Z=g[B];if(Z.cacheKey===w){z=Z,++z.usedTimes;break}}return z===void 0&&(z=new Gx(n,w,D,l),g.push(z)),z}function R(D){if(--D.usedTimes===0){const w=g.indexOf(D);g[w]=g[g.length-1],g.pop(),D.destroy()}}function F(D){p.remove(D)}function W(){p.dispose()}return{getParameters:E,getProgramCacheKey:b,getUniforms:X,acquireProgram:I,releaseProgram:R,releaseShaderCache:F,programs:g,dispose:W}}function $x(){let n=new WeakMap;function e(u){return n.has(u)}function t(u){let o=n.get(u);return o===void 0&&(o={},n.set(u,o)),o}function r(u){n.delete(u)}function a(u,o,p){n.get(u)[o]=p}function l(){n=new WeakMap}return{has:e,get:t,remove:r,update:a,dispose:l}}function qx(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function sd(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function ld(){const n=[];let e=0;const t=[],r=[],a=[];function l(){e=0,t.length=0,r.length=0,a.length=0}function u(x,y,S,T,L,E){let b=n[e];return b===void 0?(b={id:x.id,object:x,geometry:y,material:S,groupOrder:T,renderOrder:x.renderOrder,z:L,group:E},n[e]=b):(b.id=x.id,b.object=x,b.geometry=y,b.material=S,b.groupOrder=T,b.renderOrder=x.renderOrder,b.z=L,b.group=E),e++,b}function o(x,y,S,T,L,E){const b=u(x,y,S,T,L,E);S.transmission>0?r.push(b):S.transparent===!0?a.push(b):t.push(b)}function p(x,y,S,T,L,E){const b=u(x,y,S,T,L,E);S.transmission>0?r.unshift(b):S.transparent===!0?a.unshift(b):t.unshift(b)}function m(x,y){t.length>1&&t.sort(x||qx),r.length>1&&r.sort(y||sd),a.length>1&&a.sort(y||sd)}function g(){for(let x=e,y=n.length;x<y;x++){const S=n[x];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:t,transmissive:r,transparent:a,init:l,push:o,unshift:p,finish:g,sort:m}}function Yx(){let n=new WeakMap;function e(r,a){const l=n.get(r);let u;return l===void 0?(u=new ld,n.set(r,[u])):a>=l.length?(u=new ld,l.push(u)):u=l[a],u}function t(){n=new WeakMap}return{get:e,dispose:t}}function jx(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new le,color:new zt};break;case"SpotLight":t={position:new le,direction:new le,color:new zt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new le,color:new zt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new le,skyColor:new zt,groundColor:new zt};break;case"RectAreaLight":t={color:new zt,position:new le,halfWidth:new le,halfHeight:new le};break}return n[e.id]=t,t}}}function Kx(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Gt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Gt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Gt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let Zx=0;function Jx(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Qx(n){const e=new jx,t=Kx(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let m=0;m<9;m++)r.probe.push(new le);const a=new le,l=new on,u=new on;function o(m){let g=0,x=0,y=0;for(let D=0;D<9;D++)r.probe[D].set(0,0,0);let S=0,T=0,L=0,E=0,b=0,V=0,H=0,X=0,I=0,R=0,F=0;m.sort(Jx);for(let D=0,w=m.length;D<w;D++){const z=m[D],B=z.color,Y=z.intensity,Z=z.distance,j=z.shadow&&z.shadow.map?z.shadow.map.texture:null;if(z.isAmbientLight)g+=B.r*Y,x+=B.g*Y,y+=B.b*Y;else if(z.isLightProbe){for(let J=0;J<9;J++)r.probe[J].addScaledVector(z.sh.coefficients[J],Y);F++}else if(z.isDirectionalLight){const J=e.get(z);if(J.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){const ue=z.shadow,te=t.get(z);te.shadowIntensity=ue.intensity,te.shadowBias=ue.bias,te.shadowNormalBias=ue.normalBias,te.shadowRadius=ue.radius,te.shadowMapSize=ue.mapSize,r.directionalShadow[S]=te,r.directionalShadowMap[S]=j,r.directionalShadowMatrix[S]=z.shadow.matrix,V++}r.directional[S]=J,S++}else if(z.isSpotLight){const J=e.get(z);J.position.setFromMatrixPosition(z.matrixWorld),J.color.copy(B).multiplyScalar(Y),J.distance=Z,J.coneCos=Math.cos(z.angle),J.penumbraCos=Math.cos(z.angle*(1-z.penumbra)),J.decay=z.decay,r.spot[L]=J;const ue=z.shadow;if(z.map&&(r.spotLightMap[I]=z.map,I++,ue.updateMatrices(z),z.castShadow&&R++),r.spotLightMatrix[L]=ue.matrix,z.castShadow){const te=t.get(z);te.shadowIntensity=ue.intensity,te.shadowBias=ue.bias,te.shadowNormalBias=ue.normalBias,te.shadowRadius=ue.radius,te.shadowMapSize=ue.mapSize,r.spotShadow[L]=te,r.spotShadowMap[L]=j,X++}L++}else if(z.isRectAreaLight){const J=e.get(z);J.color.copy(B).multiplyScalar(Y),J.halfWidth.set(z.width*.5,0,0),J.halfHeight.set(0,z.height*.5,0),r.rectArea[E]=J,E++}else if(z.isPointLight){const J=e.get(z);if(J.color.copy(z.color).multiplyScalar(z.intensity),J.distance=z.distance,J.decay=z.decay,z.castShadow){const ue=z.shadow,te=t.get(z);te.shadowIntensity=ue.intensity,te.shadowBias=ue.bias,te.shadowNormalBias=ue.normalBias,te.shadowRadius=ue.radius,te.shadowMapSize=ue.mapSize,te.shadowCameraNear=ue.camera.near,te.shadowCameraFar=ue.camera.far,r.pointShadow[T]=te,r.pointShadowMap[T]=j,r.pointShadowMatrix[T]=z.shadow.matrix,H++}r.point[T]=J,T++}else if(z.isHemisphereLight){const J=e.get(z);J.skyColor.copy(z.color).multiplyScalar(Y),J.groundColor.copy(z.groundColor).multiplyScalar(Y),r.hemi[b]=J,b++}}E>0&&(n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=Ge.LTC_FLOAT_1,r.rectAreaLTC2=Ge.LTC_FLOAT_2):(r.rectAreaLTC1=Ge.LTC_HALF_1,r.rectAreaLTC2=Ge.LTC_HALF_2)),r.ambient[0]=g,r.ambient[1]=x,r.ambient[2]=y;const W=r.hash;(W.directionalLength!==S||W.pointLength!==T||W.spotLength!==L||W.rectAreaLength!==E||W.hemiLength!==b||W.numDirectionalShadows!==V||W.numPointShadows!==H||W.numSpotShadows!==X||W.numSpotMaps!==I||W.numLightProbes!==F)&&(r.directional.length=S,r.spot.length=L,r.rectArea.length=E,r.point.length=T,r.hemi.length=b,r.directionalShadow.length=V,r.directionalShadowMap.length=V,r.pointShadow.length=H,r.pointShadowMap.length=H,r.spotShadow.length=X,r.spotShadowMap.length=X,r.directionalShadowMatrix.length=V,r.pointShadowMatrix.length=H,r.spotLightMatrix.length=X+I-R,r.spotLightMap.length=I,r.numSpotLightShadowsWithMaps=R,r.numLightProbes=F,W.directionalLength=S,W.pointLength=T,W.spotLength=L,W.rectAreaLength=E,W.hemiLength=b,W.numDirectionalShadows=V,W.numPointShadows=H,W.numSpotShadows=X,W.numSpotMaps=I,W.numLightProbes=F,r.version=Zx++)}function p(m,g){let x=0,y=0,S=0,T=0,L=0;const E=g.matrixWorldInverse;for(let b=0,V=m.length;b<V;b++){const H=m[b];if(H.isDirectionalLight){const X=r.directional[x];X.direction.setFromMatrixPosition(H.matrixWorld),a.setFromMatrixPosition(H.target.matrixWorld),X.direction.sub(a),X.direction.transformDirection(E),x++}else if(H.isSpotLight){const X=r.spot[S];X.position.setFromMatrixPosition(H.matrixWorld),X.position.applyMatrix4(E),X.direction.setFromMatrixPosition(H.matrixWorld),a.setFromMatrixPosition(H.target.matrixWorld),X.direction.sub(a),X.direction.transformDirection(E),S++}else if(H.isRectAreaLight){const X=r.rectArea[T];X.position.setFromMatrixPosition(H.matrixWorld),X.position.applyMatrix4(E),u.identity(),l.copy(H.matrixWorld),l.premultiply(E),u.extractRotation(l),X.halfWidth.set(H.width*.5,0,0),X.halfHeight.set(0,H.height*.5,0),X.halfWidth.applyMatrix4(u),X.halfHeight.applyMatrix4(u),T++}else if(H.isPointLight){const X=r.point[y];X.position.setFromMatrixPosition(H.matrixWorld),X.position.applyMatrix4(E),y++}else if(H.isHemisphereLight){const X=r.hemi[L];X.direction.setFromMatrixPosition(H.matrixWorld),X.direction.transformDirection(E),L++}}}return{setup:o,setupView:p,state:r}}function cd(n){const e=new Qx(n),t=[],r=[];function a(g){m.camera=g,t.length=0,r.length=0}function l(g){t.push(g)}function u(g){r.push(g)}function o(){e.setup(t)}function p(g){e.setupView(t,g)}const m={lightsArray:t,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:a,state:m,setupLights:o,setupLightsView:p,pushLight:l,pushShadow:u}}function ey(n){let e=new WeakMap;function t(a,l=0){const u=e.get(a);let o;return u===void 0?(o=new cd(n),e.set(a,[o])):l>=u.length?(o=new cd(n),u.push(o)):o=u[l],o}function r(){e=new WeakMap}return{get:t,dispose:r}}const ty=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ny=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function ry(n,e,t){let r=new xh;const a=new Gt,l=new Gt,u=new Qt,o=new C0({depthPacking:Om}),p=new R0,m={},g=t.maxTextureSize,x={[Si]:In,[In]:Si,[Gr]:Gr},y=new Qn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Gt},radius:{value:4}},vertexShader:ty,fragmentShader:ny}),S=y.clone();S.defines.HORIZONTAL_PASS=1;const T=new Ei;T.setAttribute("position",new Ar(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const L=new Pr(T,y),E=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=eh;let b=this.type;this.render=function(R,F,W){if(E.enabled===!1||E.autoUpdate===!1&&E.needsUpdate===!1||R.length===0)return;const D=n.getRenderTarget(),w=n.getActiveCubeFace(),z=n.getActiveMipmapLevel(),B=n.state;B.setBlending(hr),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const Y=b!==Br&&this.type===Br,Z=b===Br&&this.type!==Br;for(let j=0,J=R.length;j<J;j++){const ue=R[j],te=ue.shadow;if(te===void 0){mt("WebGLShadowMap:",ue,"has no shadow.");continue}if(te.autoUpdate===!1&&te.needsUpdate===!1)continue;a.copy(te.mapSize);const Se=te.getFrameExtents();if(a.multiply(Se),l.copy(te.mapSize),(a.x>g||a.y>g)&&(a.x>g&&(l.x=Math.floor(g/Se.x),a.x=l.x*Se.x,te.mapSize.x=l.x),a.y>g&&(l.y=Math.floor(g/Se.y),a.y=l.y*Se.y,te.mapSize.y=l.y)),te.map===null||Y===!0||Z===!0){const Ye=this.type!==Br?{minFilter:Wn,magFilter:Wn}:{};te.map!==null&&te.map.dispose(),te.map=new qr(a.x,a.y,Ye),te.map.texture.name=ue.name+".shadowMap",te.camera.updateProjectionMatrix()}n.setRenderTarget(te.map),n.clear();const be=te.getViewportCount();for(let Ye=0;Ye<be;Ye++){const ct=te.getViewport(Ye);u.set(l.x*ct.x,l.y*ct.y,l.x*ct.z,l.y*ct.w),B.viewport(u),te.updateMatrices(ue,Ye),r=te.getFrustum(),X(F,W,te.camera,ue,this.type)}te.isPointLightShadow!==!0&&this.type===Br&&V(te,W),te.needsUpdate=!1}b=this.type,E.needsUpdate=!1,n.setRenderTarget(D,w,z)};function V(R,F){const W=e.update(L);y.defines.VSM_SAMPLES!==R.blurSamples&&(y.defines.VSM_SAMPLES=R.blurSamples,S.defines.VSM_SAMPLES=R.blurSamples,y.needsUpdate=!0,S.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new qr(a.x,a.y)),y.uniforms.shadow_pass.value=R.map.texture,y.uniforms.resolution.value=R.mapSize,y.uniforms.radius.value=R.radius,n.setRenderTarget(R.mapPass),n.clear(),n.renderBufferDirect(F,null,W,y,L,null),S.uniforms.shadow_pass.value=R.mapPass.texture,S.uniforms.resolution.value=R.mapSize,S.uniforms.radius.value=R.radius,n.setRenderTarget(R.map),n.clear(),n.renderBufferDirect(F,null,W,S,L,null)}function H(R,F,W,D){let w=null;const z=W.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(z!==void 0)w=z;else if(w=W.isPointLight===!0?p:o,n.localClippingEnabled&&F.clipShadows===!0&&Array.isArray(F.clippingPlanes)&&F.clippingPlanes.length!==0||F.displacementMap&&F.displacementScale!==0||F.alphaMap&&F.alphaTest>0||F.map&&F.alphaTest>0||F.alphaToCoverage===!0){const B=w.uuid,Y=F.uuid;let Z=m[B];Z===void 0&&(Z={},m[B]=Z);let j=Z[Y];j===void 0&&(j=w.clone(),Z[Y]=j,F.addEventListener("dispose",I)),w=j}if(w.visible=F.visible,w.wireframe=F.wireframe,D===Br?w.side=F.shadowSide!==null?F.shadowSide:F.side:w.side=F.shadowSide!==null?F.shadowSide:x[F.side],w.alphaMap=F.alphaMap,w.alphaTest=F.alphaToCoverage===!0?.5:F.alphaTest,w.map=F.map,w.clipShadows=F.clipShadows,w.clippingPlanes=F.clippingPlanes,w.clipIntersection=F.clipIntersection,w.displacementMap=F.displacementMap,w.displacementScale=F.displacementScale,w.displacementBias=F.displacementBias,w.wireframeLinewidth=F.wireframeLinewidth,w.linewidth=F.linewidth,W.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const B=n.properties.get(w);B.light=W}return w}function X(R,F,W,D,w){if(R.visible===!1)return;if(R.layers.test(F.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&w===Br)&&(!R.frustumCulled||r.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,R.matrixWorld);const Y=e.update(R),Z=R.material;if(Array.isArray(Z)){const j=Y.groups;for(let J=0,ue=j.length;J<ue;J++){const te=j[J],Se=Z[te.materialIndex];if(Se&&Se.visible){const be=H(R,Se,D,w);R.onBeforeShadow(n,R,F,W,Y,be,te),n.renderBufferDirect(W,null,Y,be,R,te),R.onAfterShadow(n,R,F,W,Y,be,te)}}}else if(Z.visible){const j=H(R,Z,D,w);R.onBeforeShadow(n,R,F,W,Y,j,null),n.renderBufferDirect(W,null,Y,j,R,null),R.onAfterShadow(n,R,F,W,Y,j,null)}}const B=R.children;for(let Y=0,Z=B.length;Y<Z;Y++)X(B[Y],F,W,D,w)}function I(R){R.target.removeEventListener("dispose",I);for(const W in m){const D=m[W],w=R.target.uuid;w in D&&(D[w].dispose(),delete D[w])}}}const iy={[zc]:Gc,[Hc]:Xc,[Vc]:$c,[Fa]:Wc,[Gc]:zc,[Xc]:Hc,[$c]:Vc,[Wc]:Fa};function ay(n,e){function t(){let q=!1;const Ie=new Qt;let Pe=null;const Ce=new Qt(0,0,0,0);return{setMask:function(Ee){Pe!==Ee&&!q&&(n.colorMask(Ee,Ee,Ee,Ee),Pe=Ee)},setLocked:function(Ee){q=Ee},setClear:function(Ee,pe,ze,Te,It){It===!0&&(Ee*=Te,pe*=Te,ze*=Te),Ie.set(Ee,pe,ze,Te),Ce.equals(Ie)===!1&&(n.clearColor(Ee,pe,ze,Te),Ce.copy(Ie))},reset:function(){q=!1,Pe=null,Ce.set(-1,0,0,0)}}}function r(){let q=!1,Ie=!1,Pe=null,Ce=null,Ee=null;return{setReversed:function(pe){if(Ie!==pe){const ze=e.get("EXT_clip_control");pe?ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.ZERO_TO_ONE_EXT):ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.NEGATIVE_ONE_TO_ONE_EXT),Ie=pe;const Te=Ee;Ee=null,this.setClear(Te)}},getReversed:function(){return Ie},setTest:function(pe){pe?ge(n.DEPTH_TEST):Oe(n.DEPTH_TEST)},setMask:function(pe){Pe!==pe&&!q&&(n.depthMask(pe),Pe=pe)},setFunc:function(pe){if(Ie&&(pe=iy[pe]),Ce!==pe){switch(pe){case zc:n.depthFunc(n.NEVER);break;case Gc:n.depthFunc(n.ALWAYS);break;case Hc:n.depthFunc(n.LESS);break;case Fa:n.depthFunc(n.LEQUAL);break;case Vc:n.depthFunc(n.EQUAL);break;case Wc:n.depthFunc(n.GEQUAL);break;case Xc:n.depthFunc(n.GREATER);break;case $c:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Ce=pe}},setLocked:function(pe){q=pe},setClear:function(pe){Ee!==pe&&(Ie&&(pe=1-pe),n.clearDepth(pe),Ee=pe)},reset:function(){q=!1,Pe=null,Ce=null,Ee=null,Ie=!1}}}function a(){let q=!1,Ie=null,Pe=null,Ce=null,Ee=null,pe=null,ze=null,Te=null,It=null;return{setTest:function(Mt){q||(Mt?ge(n.STENCIL_TEST):Oe(n.STENCIL_TEST))},setMask:function(Mt){Ie!==Mt&&!q&&(n.stencilMask(Mt),Ie=Mt)},setFunc:function(Mt,Sn,dn){(Pe!==Mt||Ce!==Sn||Ee!==dn)&&(n.stencilFunc(Mt,Sn,dn),Pe=Mt,Ce=Sn,Ee=dn)},setOp:function(Mt,Sn,dn){(pe!==Mt||ze!==Sn||Te!==dn)&&(n.stencilOp(Mt,Sn,dn),pe=Mt,ze=Sn,Te=dn)},setLocked:function(Mt){q=Mt},setClear:function(Mt){It!==Mt&&(n.clearStencil(Mt),It=Mt)},reset:function(){q=!1,Ie=null,Pe=null,Ce=null,Ee=null,pe=null,ze=null,Te=null,It=null}}}const l=new t,u=new r,o=new a,p=new WeakMap,m=new WeakMap;let g={},x={},y=new WeakMap,S=[],T=null,L=!1,E=null,b=null,V=null,H=null,X=null,I=null,R=null,F=new zt(0,0,0),W=0,D=!1,w=null,z=null,B=null,Y=null,Z=null;const j=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let J=!1,ue=0;const te=n.getParameter(n.VERSION);te.indexOf("WebGL")!==-1?(ue=parseFloat(/^WebGL (\d)/.exec(te)[1]),J=ue>=1):te.indexOf("OpenGL ES")!==-1&&(ue=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),J=ue>=2);let Se=null,be={};const Ye=n.getParameter(n.SCISSOR_BOX),ct=n.getParameter(n.VIEWPORT),pt=new Qt().fromArray(Ye),yt=new Qt().fromArray(ct);function vt(q,Ie,Pe,Ce){const Ee=new Uint8Array(4),pe=n.createTexture();n.bindTexture(q,pe),n.texParameteri(q,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(q,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let ze=0;ze<Pe;ze++)q===n.TEXTURE_3D||q===n.TEXTURE_2D_ARRAY?n.texImage3D(Ie,0,n.RGBA,1,1,Ce,0,n.RGBA,n.UNSIGNED_BYTE,Ee):n.texImage2D(Ie+ze,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Ee);return pe}const _e={};_e[n.TEXTURE_2D]=vt(n.TEXTURE_2D,n.TEXTURE_2D,1),_e[n.TEXTURE_CUBE_MAP]=vt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),_e[n.TEXTURE_2D_ARRAY]=vt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),_e[n.TEXTURE_3D]=vt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),l.setClear(0,0,0,1),u.setClear(1),o.setClear(0),ge(n.DEPTH_TEST),u.setFunc(Fa),nt(!1),rt(mu),ge(n.CULL_FACE),lt(hr);function ge(q){g[q]!==!0&&(n.enable(q),g[q]=!0)}function Oe(q){g[q]!==!1&&(n.disable(q),g[q]=!1)}function Qe(q,Ie){return x[q]!==Ie?(n.bindFramebuffer(q,Ie),x[q]=Ie,q===n.DRAW_FRAMEBUFFER&&(x[n.FRAMEBUFFER]=Ie),q===n.FRAMEBUFFER&&(x[n.DRAW_FRAMEBUFFER]=Ie),!0):!1}function $e(q,Ie){let Pe=S,Ce=!1;if(q){Pe=y.get(Ie),Pe===void 0&&(Pe=[],y.set(Ie,Pe));const Ee=q.textures;if(Pe.length!==Ee.length||Pe[0]!==n.COLOR_ATTACHMENT0){for(let pe=0,ze=Ee.length;pe<ze;pe++)Pe[pe]=n.COLOR_ATTACHMENT0+pe;Pe.length=Ee.length,Ce=!0}}else Pe[0]!==n.BACK&&(Pe[0]=n.BACK,Ce=!0);Ce&&n.drawBuffers(Pe)}function ft(q){return T!==q?(n.useProgram(q),T=q,!0):!1}const Lt={[ki]:n.FUNC_ADD,[hm]:n.FUNC_SUBTRACT,[pm]:n.FUNC_REVERSE_SUBTRACT};Lt[mm]=n.MIN,Lt[_m]=n.MAX;const Re={[gm]:n.ZERO,[vm]:n.ONE,[xm]:n.SRC_COLOR,[kc]:n.SRC_ALPHA,[wm]:n.SRC_ALPHA_SATURATE,[Em]:n.DST_COLOR,[Sm]:n.DST_ALPHA,[ym]:n.ONE_MINUS_SRC_COLOR,[Bc]:n.ONE_MINUS_SRC_ALPHA,[Mm]:n.ONE_MINUS_DST_COLOR,[bm]:n.ONE_MINUS_DST_ALPHA,[Tm]:n.CONSTANT_COLOR,[Am]:n.ONE_MINUS_CONSTANT_COLOR,[Cm]:n.CONSTANT_ALPHA,[Rm]:n.ONE_MINUS_CONSTANT_ALPHA};function lt(q,Ie,Pe,Ce,Ee,pe,ze,Te,It,Mt){if(q===hr){L===!0&&(Oe(n.BLEND),L=!1);return}if(L===!1&&(ge(n.BLEND),L=!0),q!==dm){if(q!==E||Mt!==D){if((b!==ki||X!==ki)&&(n.blendEquation(n.FUNC_ADD),b=ki,X=ki),Mt)switch(q){case Ca:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case _u:n.blendFunc(n.ONE,n.ONE);break;case gu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case vu:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Jt("WebGLState: Invalid blending: ",q);break}else switch(q){case Ca:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case _u:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case gu:Jt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case vu:Jt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Jt("WebGLState: Invalid blending: ",q);break}V=null,H=null,I=null,R=null,F.set(0,0,0),W=0,E=q,D=Mt}return}Ee=Ee||Ie,pe=pe||Pe,ze=ze||Ce,(Ie!==b||Ee!==X)&&(n.blendEquationSeparate(Lt[Ie],Lt[Ee]),b=Ie,X=Ee),(Pe!==V||Ce!==H||pe!==I||ze!==R)&&(n.blendFuncSeparate(Re[Pe],Re[Ce],Re[pe],Re[ze]),V=Pe,H=Ce,I=pe,R=ze),(Te.equals(F)===!1||It!==W)&&(n.blendColor(Te.r,Te.g,Te.b,It),F.copy(Te),W=It),E=q,D=!1}function $(q,Ie){q.side===Gr?Oe(n.CULL_FACE):ge(n.CULL_FACE);let Pe=q.side===In;Ie&&(Pe=!Pe),nt(Pe),q.blending===Ca&&q.transparent===!1?lt(hr):lt(q.blending,q.blendEquation,q.blendSrc,q.blendDst,q.blendEquationAlpha,q.blendSrcAlpha,q.blendDstAlpha,q.blendColor,q.blendAlpha,q.premultipliedAlpha),u.setFunc(q.depthFunc),u.setTest(q.depthTest),u.setMask(q.depthWrite),l.setMask(q.colorWrite);const Ce=q.stencilWrite;o.setTest(Ce),Ce&&(o.setMask(q.stencilWriteMask),o.setFunc(q.stencilFunc,q.stencilRef,q.stencilFuncMask),o.setOp(q.stencilFail,q.stencilZFail,q.stencilZPass)),Ue(q.polygonOffset,q.polygonOffsetFactor,q.polygonOffsetUnits),q.alphaToCoverage===!0?ge(n.SAMPLE_ALPHA_TO_COVERAGE):Oe(n.SAMPLE_ALPHA_TO_COVERAGE)}function nt(q){w!==q&&(q?n.frontFace(n.CW):n.frontFace(n.CCW),w=q)}function rt(q){q!==cm?(ge(n.CULL_FACE),q!==z&&(q===mu?n.cullFace(n.BACK):q===fm?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Oe(n.CULL_FACE),z=q}function ut(q){q!==B&&(J&&n.lineWidth(q),B=q)}function Ue(q,Ie,Pe){q?(ge(n.POLYGON_OFFSET_FILL),(Y!==Ie||Z!==Pe)&&(n.polygonOffset(Ie,Pe),Y=Ie,Z=Pe)):Oe(n.POLYGON_OFFSET_FILL)}function bt(q){q?ge(n.SCISSOR_TEST):Oe(n.SCISSOR_TEST)}function qe(q){q===void 0&&(q=n.TEXTURE0+j-1),Se!==q&&(n.activeTexture(q),Se=q)}function it(q,Ie,Pe){Pe===void 0&&(Se===null?Pe=n.TEXTURE0+j-1:Pe=Se);let Ce=be[Pe];Ce===void 0&&(Ce={type:void 0,texture:void 0},be[Pe]=Ce),(Ce.type!==q||Ce.texture!==Ie)&&(Se!==Pe&&(n.activeTexture(Pe),Se=Pe),n.bindTexture(q,Ie||_e[q]),Ce.type=q,Ce.texture=Ie)}function N(){const q=be[Se];q!==void 0&&q.type!==void 0&&(n.bindTexture(q.type,null),q.type=void 0,q.texture=void 0)}function P(){try{n.compressedTexImage2D(...arguments)}catch(q){q("WebGLState:",q)}}function ne(){try{n.compressedTexImage3D(...arguments)}catch(q){q("WebGLState:",q)}}function he(){try{n.texSubImage2D(...arguments)}catch(q){q("WebGLState:",q)}}function de(){try{n.texSubImage3D(...arguments)}catch(q){q("WebGLState:",q)}}function ie(){try{n.compressedTexSubImage2D(...arguments)}catch(q){q("WebGLState:",q)}}function Ze(){try{n.compressedTexSubImage3D(...arguments)}catch(q){q("WebGLState:",q)}}function Fe(){try{n.texStorage2D(...arguments)}catch(q){q("WebGLState:",q)}}function et(){try{n.texStorage3D(...arguments)}catch(q){q("WebGLState:",q)}}function Ke(){try{n.texImage2D(...arguments)}catch(q){q("WebGLState:",q)}}function ve(){try{n.texImage3D(...arguments)}catch(q){q("WebGLState:",q)}}function fe(q){pt.equals(q)===!1&&(n.scissor(q.x,q.y,q.z,q.w),pt.copy(q))}function we(q){yt.equals(q)===!1&&(n.viewport(q.x,q.y,q.z,q.w),yt.copy(q))}function je(q,Ie){let Pe=m.get(Ie);Pe===void 0&&(Pe=new WeakMap,m.set(Ie,Pe));let Ce=Pe.get(q);Ce===void 0&&(Ce=n.getUniformBlockIndex(Ie,q.name),Pe.set(q,Ce))}function Be(q,Ie){const Ce=m.get(Ie).get(q);p.get(Ie)!==Ce&&(n.uniformBlockBinding(Ie,Ce,q.__bindingPointIndex),p.set(Ie,Ce))}function Ve(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),u.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),g={},Se=null,be={},x={},y=new WeakMap,S=[],T=null,L=!1,E=null,b=null,V=null,H=null,X=null,I=null,R=null,F=new zt(0,0,0),W=0,D=!1,w=null,z=null,B=null,Y=null,Z=null,pt.set(0,0,n.canvas.width,n.canvas.height),yt.set(0,0,n.canvas.width,n.canvas.height),l.reset(),u.reset(),o.reset()}return{buffers:{color:l,depth:u,stencil:o},enable:ge,disable:Oe,bindFramebuffer:Qe,drawBuffers:$e,useProgram:ft,setBlending:lt,setMaterial:$,setFlipSided:nt,setCullFace:rt,setLineWidth:ut,setPolygonOffset:Ue,setScissorTest:bt,activeTexture:qe,bindTexture:it,unbindTexture:N,compressedTexImage2D:P,compressedTexImage3D:ne,texImage2D:Ke,texImage3D:ve,updateUBOMapping:je,uniformBlockBinding:Be,texStorage2D:Fe,texStorage3D:et,texSubImage2D:he,texSubImage3D:de,compressedTexSubImage2D:ie,compressedTexSubImage3D:Ze,scissor:fe,viewport:we,reset:Ve}}function oy(n,e,t,r,a,l,u){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,p=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),m=new Gt,g=new WeakMap;let x;const y=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(N,P){return S?new OffscreenCanvas(N,P):Os("canvas")}function L(N,P,ne){let he=1;const de=it(N);if((de.width>ne||de.height>ne)&&(he=ne/Math.max(de.width,de.height)),he<1)if(typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&N instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&N instanceof ImageBitmap||typeof VideoFrame<"u"&&N instanceof VideoFrame){const ie=Math.floor(he*de.width),Ze=Math.floor(he*de.height);x===void 0&&(x=T(ie,Ze));const Fe=P?T(ie,Ze):x;return Fe.width=ie,Fe.height=Ze,Fe.getContext("2d").drawImage(N,0,0,ie,Ze),mt("WebGLRenderer: Texture has been resized from ("+de.width+"x"+de.height+") to ("+ie+"x"+Ze+")."),Fe}else return"data"in N&&mt("WebGLRenderer: Image in DataTexture is too big ("+de.width+"x"+de.height+")."),N;return N}function E(N){return N.generateMipmaps}function b(N){n.generateMipmap(N)}function V(N){return N.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:N.isWebGL3DRenderTarget?n.TEXTURE_3D:N.isWebGLArrayRenderTarget||N.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function H(N,P,ne,he,de=!1){if(N!==null){if(n[N]!==void 0)return n[N];mt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+N+"'")}let ie=P;if(P===n.RED&&(ne===n.FLOAT&&(ie=n.R32F),ne===n.HALF_FLOAT&&(ie=n.R16F),ne===n.UNSIGNED_BYTE&&(ie=n.R8)),P===n.RED_INTEGER&&(ne===n.UNSIGNED_BYTE&&(ie=n.R8UI),ne===n.UNSIGNED_SHORT&&(ie=n.R16UI),ne===n.UNSIGNED_INT&&(ie=n.R32UI),ne===n.BYTE&&(ie=n.R8I),ne===n.SHORT&&(ie=n.R16I),ne===n.INT&&(ie=n.R32I)),P===n.RG&&(ne===n.FLOAT&&(ie=n.RG32F),ne===n.HALF_FLOAT&&(ie=n.RG16F),ne===n.UNSIGNED_BYTE&&(ie=n.RG8)),P===n.RG_INTEGER&&(ne===n.UNSIGNED_BYTE&&(ie=n.RG8UI),ne===n.UNSIGNED_SHORT&&(ie=n.RG16UI),ne===n.UNSIGNED_INT&&(ie=n.RG32UI),ne===n.BYTE&&(ie=n.RG8I),ne===n.SHORT&&(ie=n.RG16I),ne===n.INT&&(ie=n.RG32I)),P===n.RGB_INTEGER&&(ne===n.UNSIGNED_BYTE&&(ie=n.RGB8UI),ne===n.UNSIGNED_SHORT&&(ie=n.RGB16UI),ne===n.UNSIGNED_INT&&(ie=n.RGB32UI),ne===n.BYTE&&(ie=n.RGB8I),ne===n.SHORT&&(ie=n.RGB16I),ne===n.INT&&(ie=n.RGB32I)),P===n.RGBA_INTEGER&&(ne===n.UNSIGNED_BYTE&&(ie=n.RGBA8UI),ne===n.UNSIGNED_SHORT&&(ie=n.RGBA16UI),ne===n.UNSIGNED_INT&&(ie=n.RGBA32UI),ne===n.BYTE&&(ie=n.RGBA8I),ne===n.SHORT&&(ie=n.RGBA16I),ne===n.INT&&(ie=n.RGBA32I)),P===n.RGB&&(ne===n.UNSIGNED_INT_5_9_9_9_REV&&(ie=n.RGB9_E5),ne===n.UNSIGNED_INT_10F_11F_11F_REV&&(ie=n.R11F_G11F_B10F)),P===n.RGBA){const Ze=de?Us:Rt.getTransfer(he);ne===n.FLOAT&&(ie=n.RGBA32F),ne===n.HALF_FLOAT&&(ie=n.RGBA16F),ne===n.UNSIGNED_BYTE&&(ie=Ze===Bt?n.SRGB8_ALPHA8:n.RGBA8),ne===n.UNSIGNED_SHORT_4_4_4_4&&(ie=n.RGBA4),ne===n.UNSIGNED_SHORT_5_5_5_1&&(ie=n.RGB5_A1)}return(ie===n.R16F||ie===n.R32F||ie===n.RG16F||ie===n.RG32F||ie===n.RGBA16F||ie===n.RGBA32F)&&e.get("EXT_color_buffer_float"),ie}function X(N,P){let ne;return N?P===null||P===bi||P===xo?ne=n.DEPTH24_STENCIL8:P===Zn?ne=n.DEPTH32F_STENCIL8:P===vo&&(ne=n.DEPTH24_STENCIL8,mt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):P===null||P===bi||P===xo?ne=n.DEPTH_COMPONENT24:P===Zn?ne=n.DEPTH_COMPONENT32F:P===vo&&(ne=n.DEPTH_COMPONENT16),ne}function I(N,P){return E(N)===!0||N.isFramebufferTexture&&N.minFilter!==Wn&&N.minFilter!==un?Math.log2(Math.max(P.width,P.height))+1:N.mipmaps!==void 0&&N.mipmaps.length>0?N.mipmaps.length:N.isCompressedTexture&&Array.isArray(N.image)?P.mipmaps.length:1}function R(N){const P=N.target;P.removeEventListener("dispose",R),W(P),P.isVideoTexture&&g.delete(P)}function F(N){const P=N.target;P.removeEventListener("dispose",F),w(P)}function W(N){const P=r.get(N);if(P.__webglInit===void 0)return;const ne=N.source,he=y.get(ne);if(he){const de=he[P.__cacheKey];de.usedTimes--,de.usedTimes===0&&D(N),Object.keys(he).length===0&&y.delete(ne)}r.remove(N)}function D(N){const P=r.get(N);n.deleteTexture(P.__webglTexture);const ne=N.source,he=y.get(ne);delete he[P.__cacheKey],u.memory.textures--}function w(N){const P=r.get(N);if(N.depthTexture&&(N.depthTexture.dispose(),r.remove(N.depthTexture)),N.isWebGLCubeRenderTarget)for(let he=0;he<6;he++){if(Array.isArray(P.__webglFramebuffer[he]))for(let de=0;de<P.__webglFramebuffer[he].length;de++)n.deleteFramebuffer(P.__webglFramebuffer[he][de]);else n.deleteFramebuffer(P.__webglFramebuffer[he]);P.__webglDepthbuffer&&n.deleteRenderbuffer(P.__webglDepthbuffer[he])}else{if(Array.isArray(P.__webglFramebuffer))for(let he=0;he<P.__webglFramebuffer.length;he++)n.deleteFramebuffer(P.__webglFramebuffer[he]);else n.deleteFramebuffer(P.__webglFramebuffer);if(P.__webglDepthbuffer&&n.deleteRenderbuffer(P.__webglDepthbuffer),P.__webglMultisampledFramebuffer&&n.deleteFramebuffer(P.__webglMultisampledFramebuffer),P.__webglColorRenderbuffer)for(let he=0;he<P.__webglColorRenderbuffer.length;he++)P.__webglColorRenderbuffer[he]&&n.deleteRenderbuffer(P.__webglColorRenderbuffer[he]);P.__webglDepthRenderbuffer&&n.deleteRenderbuffer(P.__webglDepthRenderbuffer)}const ne=N.textures;for(let he=0,de=ne.length;he<de;he++){const ie=r.get(ne[he]);ie.__webglTexture&&(n.deleteTexture(ie.__webglTexture),u.memory.textures--),r.remove(ne[he])}r.remove(N)}let z=0;function B(){z=0}function Y(){const N=z;return N>=a.maxTextures&&mt("WebGLTextures: Trying to use "+N+" texture units while this GPU supports only "+a.maxTextures),z+=1,N}function Z(N){const P=[];return P.push(N.wrapS),P.push(N.wrapT),P.push(N.wrapR||0),P.push(N.magFilter),P.push(N.minFilter),P.push(N.anisotropy),P.push(N.internalFormat),P.push(N.format),P.push(N.type),P.push(N.generateMipmaps),P.push(N.premultiplyAlpha),P.push(N.flipY),P.push(N.unpackAlignment),P.push(N.colorSpace),P.join()}function j(N,P){const ne=r.get(N);if(N.isVideoTexture&&bt(N),N.isRenderTargetTexture===!1&&N.isExternalTexture!==!0&&N.version>0&&ne.__version!==N.version){const he=N.image;if(he===null)mt("WebGLRenderer: Texture marked for update but no image data found.");else if(he.complete===!1)mt("WebGLRenderer: Texture marked for update but image is incomplete");else{_e(ne,N,P);return}}else N.isExternalTexture&&(ne.__webglTexture=N.sourceTexture?N.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,ne.__webglTexture,n.TEXTURE0+P)}function J(N,P){const ne=r.get(N);if(N.isRenderTargetTexture===!1&&N.version>0&&ne.__version!==N.version){_e(ne,N,P);return}else N.isExternalTexture&&(ne.__webglTexture=N.sourceTexture?N.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,ne.__webglTexture,n.TEXTURE0+P)}function ue(N,P){const ne=r.get(N);if(N.isRenderTargetTexture===!1&&N.version>0&&ne.__version!==N.version){_e(ne,N,P);return}t.bindTexture(n.TEXTURE_3D,ne.__webglTexture,n.TEXTURE0+P)}function te(N,P){const ne=r.get(N);if(N.version>0&&ne.__version!==N.version){ge(ne,N,P);return}t.bindTexture(n.TEXTURE_CUBE_MAP,ne.__webglTexture,n.TEXTURE0+P)}const Se={[go]:n.REPEAT,[Hn]:n.CLAMP_TO_EDGE,[Zc]:n.MIRRORED_REPEAT},be={[Wn]:n.NEAREST,[Um]:n.NEAREST_MIPMAP_NEAREST,[es]:n.NEAREST_MIPMAP_LINEAR,[un]:n.LINEAR,[Zl]:n.LINEAR_MIPMAP_NEAREST,[Gi]:n.LINEAR_MIPMAP_LINEAR},Ye={[zm]:n.NEVER,[$m]:n.ALWAYS,[Gm]:n.LESS,[ch]:n.LEQUAL,[Hm]:n.EQUAL,[Xm]:n.GEQUAL,[Vm]:n.GREATER,[Wm]:n.NOTEQUAL};function ct(N,P){if(P.type===Zn&&e.has("OES_texture_float_linear")===!1&&(P.magFilter===un||P.magFilter===Zl||P.magFilter===es||P.magFilter===Gi||P.minFilter===un||P.minFilter===Zl||P.minFilter===es||P.minFilter===Gi)&&mt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(N,n.TEXTURE_WRAP_S,Se[P.wrapS]),n.texParameteri(N,n.TEXTURE_WRAP_T,Se[P.wrapT]),(N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY)&&n.texParameteri(N,n.TEXTURE_WRAP_R,Se[P.wrapR]),n.texParameteri(N,n.TEXTURE_MAG_FILTER,be[P.magFilter]),n.texParameteri(N,n.TEXTURE_MIN_FILTER,be[P.minFilter]),P.compareFunction&&(n.texParameteri(N,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(N,n.TEXTURE_COMPARE_FUNC,Ye[P.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(P.magFilter===Wn||P.minFilter!==es&&P.minFilter!==Gi||P.type===Zn&&e.has("OES_texture_float_linear")===!1)return;if(P.anisotropy>1||r.get(P).__currentAnisotropy){const ne=e.get("EXT_texture_filter_anisotropic");n.texParameterf(N,ne.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(P.anisotropy,a.getMaxAnisotropy())),r.get(P).__currentAnisotropy=P.anisotropy}}}function pt(N,P){let ne=!1;N.__webglInit===void 0&&(N.__webglInit=!0,P.addEventListener("dispose",R));const he=P.source;let de=y.get(he);de===void 0&&(de={},y.set(he,de));const ie=Z(P);if(ie!==N.__cacheKey){de[ie]===void 0&&(de[ie]={texture:n.createTexture(),usedTimes:0},u.memory.textures++,ne=!0),de[ie].usedTimes++;const Ze=de[N.__cacheKey];Ze!==void 0&&(de[N.__cacheKey].usedTimes--,Ze.usedTimes===0&&D(P)),N.__cacheKey=ie,N.__webglTexture=de[ie].texture}return ne}function yt(N,P,ne){return Math.floor(Math.floor(N/ne)/P)}function vt(N,P,ne,he){const ie=N.updateRanges;if(ie.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,P.width,P.height,ne,he,P.data);else{ie.sort((ve,fe)=>ve.start-fe.start);let Ze=0;for(let ve=1;ve<ie.length;ve++){const fe=ie[Ze],we=ie[ve],je=fe.start+fe.count,Be=yt(we.start,P.width,4),Ve=yt(fe.start,P.width,4);we.start<=je+1&&Be===Ve&&yt(we.start+we.count-1,P.width,4)===Be?fe.count=Math.max(fe.count,we.start+we.count-fe.start):(++Ze,ie[Ze]=we)}ie.length=Ze+1;const Fe=n.getParameter(n.UNPACK_ROW_LENGTH),et=n.getParameter(n.UNPACK_SKIP_PIXELS),Ke=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,P.width);for(let ve=0,fe=ie.length;ve<fe;ve++){const we=ie[ve],je=Math.floor(we.start/4),Be=Math.ceil(we.count/4),Ve=je%P.width,q=Math.floor(je/P.width),Ie=Be,Pe=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ve),n.pixelStorei(n.UNPACK_SKIP_ROWS,q),t.texSubImage2D(n.TEXTURE_2D,0,Ve,q,Ie,Pe,ne,he,P.data)}N.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,Fe),n.pixelStorei(n.UNPACK_SKIP_PIXELS,et),n.pixelStorei(n.UNPACK_SKIP_ROWS,Ke)}}function _e(N,P,ne){let he=n.TEXTURE_2D;(P.isDataArrayTexture||P.isCompressedArrayTexture)&&(he=n.TEXTURE_2D_ARRAY),P.isData3DTexture&&(he=n.TEXTURE_3D);const de=pt(N,P),ie=P.source;t.bindTexture(he,N.__webglTexture,n.TEXTURE0+ne);const Ze=r.get(ie);if(ie.version!==Ze.__version||de===!0){t.activeTexture(n.TEXTURE0+ne);const Fe=Rt.getPrimaries(Rt.workingColorSpace),et=P.colorSpace===_i?null:Rt.getPrimaries(P.colorSpace),Ke=P.colorSpace===_i||Fe===et?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,P.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,P.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ke);let ve=L(P.image,!1,a.maxTextureSize);ve=qe(P,ve);const fe=l.convert(P.format,P.colorSpace),we=l.convert(P.type);let je=H(P.internalFormat,fe,we,P.colorSpace,P.isVideoTexture);ct(he,P);let Be;const Ve=P.mipmaps,q=P.isVideoTexture!==!0,Ie=Ze.__version===void 0||de===!0,Pe=ie.dataReady,Ce=I(P,ve);if(P.isDepthTexture)je=X(P.format===So,P.type),Ie&&(q?t.texStorage2D(n.TEXTURE_2D,1,je,ve.width,ve.height):t.texImage2D(n.TEXTURE_2D,0,je,ve.width,ve.height,0,fe,we,null));else if(P.isDataTexture)if(Ve.length>0){q&&Ie&&t.texStorage2D(n.TEXTURE_2D,Ce,je,Ve[0].width,Ve[0].height);for(let Ee=0,pe=Ve.length;Ee<pe;Ee++)Be=Ve[Ee],q?Pe&&t.texSubImage2D(n.TEXTURE_2D,Ee,0,0,Be.width,Be.height,fe,we,Be.data):t.texImage2D(n.TEXTURE_2D,Ee,je,Be.width,Be.height,0,fe,we,Be.data);P.generateMipmaps=!1}else q?(Ie&&t.texStorage2D(n.TEXTURE_2D,Ce,je,ve.width,ve.height),Pe&&vt(P,ve,fe,we)):t.texImage2D(n.TEXTURE_2D,0,je,ve.width,ve.height,0,fe,we,ve.data);else if(P.isCompressedTexture)if(P.isCompressedArrayTexture){q&&Ie&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ce,je,Ve[0].width,Ve[0].height,ve.depth);for(let Ee=0,pe=Ve.length;Ee<pe;Ee++)if(Be=Ve[Ee],P.format!==An)if(fe!==null)if(q){if(Pe)if(P.layerUpdates.size>0){const ze=zu(Be.width,Be.height,P.format,P.type);for(const Te of P.layerUpdates){const It=Be.data.subarray(Te*ze/Be.data.BYTES_PER_ELEMENT,(Te+1)*ze/Be.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Ee,0,0,Te,Be.width,Be.height,1,fe,It)}P.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Ee,0,0,0,Be.width,Be.height,ve.depth,fe,Be.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Ee,je,Be.width,Be.height,ve.depth,0,Be.data,0,0);else mt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else q?Pe&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Ee,0,0,0,Be.width,Be.height,ve.depth,fe,we,Be.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Ee,je,Be.width,Be.height,ve.depth,0,fe,we,Be.data)}else{q&&Ie&&t.texStorage2D(n.TEXTURE_2D,Ce,je,Ve[0].width,Ve[0].height);for(let Ee=0,pe=Ve.length;Ee<pe;Ee++)Be=Ve[Ee],P.format!==An?fe!==null?q?Pe&&t.compressedTexSubImage2D(n.TEXTURE_2D,Ee,0,0,Be.width,Be.height,fe,Be.data):t.compressedTexImage2D(n.TEXTURE_2D,Ee,je,Be.width,Be.height,0,Be.data):mt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):q?Pe&&t.texSubImage2D(n.TEXTURE_2D,Ee,0,0,Be.width,Be.height,fe,we,Be.data):t.texImage2D(n.TEXTURE_2D,Ee,je,Be.width,Be.height,0,fe,we,Be.data)}else if(P.isDataArrayTexture)if(q){if(Ie&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ce,je,ve.width,ve.height,ve.depth),Pe)if(P.layerUpdates.size>0){const Ee=zu(ve.width,ve.height,P.format,P.type);for(const pe of P.layerUpdates){const ze=ve.data.subarray(pe*Ee/ve.data.BYTES_PER_ELEMENT,(pe+1)*Ee/ve.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,pe,ve.width,ve.height,1,fe,we,ze)}P.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ve.width,ve.height,ve.depth,fe,we,ve.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,je,ve.width,ve.height,ve.depth,0,fe,we,ve.data);else if(P.isData3DTexture)q?(Ie&&t.texStorage3D(n.TEXTURE_3D,Ce,je,ve.width,ve.height,ve.depth),Pe&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ve.width,ve.height,ve.depth,fe,we,ve.data)):t.texImage3D(n.TEXTURE_3D,0,je,ve.width,ve.height,ve.depth,0,fe,we,ve.data);else if(P.isFramebufferTexture){if(Ie)if(q)t.texStorage2D(n.TEXTURE_2D,Ce,je,ve.width,ve.height);else{let Ee=ve.width,pe=ve.height;for(let ze=0;ze<Ce;ze++)t.texImage2D(n.TEXTURE_2D,ze,je,Ee,pe,0,fe,we,null),Ee>>=1,pe>>=1}}else if(Ve.length>0){if(q&&Ie){const Ee=it(Ve[0]);t.texStorage2D(n.TEXTURE_2D,Ce,je,Ee.width,Ee.height)}for(let Ee=0,pe=Ve.length;Ee<pe;Ee++)Be=Ve[Ee],q?Pe&&t.texSubImage2D(n.TEXTURE_2D,Ee,0,0,fe,we,Be):t.texImage2D(n.TEXTURE_2D,Ee,je,fe,we,Be);P.generateMipmaps=!1}else if(q){if(Ie){const Ee=it(ve);t.texStorage2D(n.TEXTURE_2D,Ce,je,Ee.width,Ee.height)}Pe&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,fe,we,ve)}else t.texImage2D(n.TEXTURE_2D,0,je,fe,we,ve);E(P)&&b(he),Ze.__version=ie.version,P.onUpdate&&P.onUpdate(P)}N.__version=P.version}function ge(N,P,ne){if(P.image.length!==6)return;const he=pt(N,P),de=P.source;t.bindTexture(n.TEXTURE_CUBE_MAP,N.__webglTexture,n.TEXTURE0+ne);const ie=r.get(de);if(de.version!==ie.__version||he===!0){t.activeTexture(n.TEXTURE0+ne);const Ze=Rt.getPrimaries(Rt.workingColorSpace),Fe=P.colorSpace===_i?null:Rt.getPrimaries(P.colorSpace),et=P.colorSpace===_i||Ze===Fe?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,P.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,P.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,et);const Ke=P.isCompressedTexture||P.image[0].isCompressedTexture,ve=P.image[0]&&P.image[0].isDataTexture,fe=[];for(let pe=0;pe<6;pe++)!Ke&&!ve?fe[pe]=L(P.image[pe],!0,a.maxCubemapSize):fe[pe]=ve?P.image[pe].image:P.image[pe],fe[pe]=qe(P,fe[pe]);const we=fe[0],je=l.convert(P.format,P.colorSpace),Be=l.convert(P.type),Ve=H(P.internalFormat,je,Be,P.colorSpace),q=P.isVideoTexture!==!0,Ie=ie.__version===void 0||he===!0,Pe=de.dataReady;let Ce=I(P,we);ct(n.TEXTURE_CUBE_MAP,P);let Ee;if(Ke){q&&Ie&&t.texStorage2D(n.TEXTURE_CUBE_MAP,Ce,Ve,we.width,we.height);for(let pe=0;pe<6;pe++){Ee=fe[pe].mipmaps;for(let ze=0;ze<Ee.length;ze++){const Te=Ee[ze];P.format!==An?je!==null?q?Pe&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,ze,0,0,Te.width,Te.height,je,Te.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,ze,Ve,Te.width,Te.height,0,Te.data):mt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):q?Pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,ze,0,0,Te.width,Te.height,je,Be,Te.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,ze,Ve,Te.width,Te.height,0,je,Be,Te.data)}}}else{if(Ee=P.mipmaps,q&&Ie){Ee.length>0&&Ce++;const pe=it(fe[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,Ce,Ve,pe.width,pe.height)}for(let pe=0;pe<6;pe++)if(ve){q?Pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,fe[pe].width,fe[pe].height,je,Be,fe[pe].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,Ve,fe[pe].width,fe[pe].height,0,je,Be,fe[pe].data);for(let ze=0;ze<Ee.length;ze++){const It=Ee[ze].image[pe].image;q?Pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,ze+1,0,0,It.width,It.height,je,Be,It.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,ze+1,Ve,It.width,It.height,0,je,Be,It.data)}}else{q?Pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,je,Be,fe[pe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,Ve,je,Be,fe[pe]);for(let ze=0;ze<Ee.length;ze++){const Te=Ee[ze];q?Pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,ze+1,0,0,je,Be,Te.image[pe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,ze+1,Ve,je,Be,Te.image[pe])}}}E(P)&&b(n.TEXTURE_CUBE_MAP),ie.__version=de.version,P.onUpdate&&P.onUpdate(P)}N.__version=P.version}function Oe(N,P,ne,he,de,ie){const Ze=l.convert(ne.format,ne.colorSpace),Fe=l.convert(ne.type),et=H(ne.internalFormat,Ze,Fe,ne.colorSpace),Ke=r.get(P),ve=r.get(ne);if(ve.__renderTarget=P,!Ke.__hasExternalTextures){const fe=Math.max(1,P.width>>ie),we=Math.max(1,P.height>>ie);de===n.TEXTURE_3D||de===n.TEXTURE_2D_ARRAY?t.texImage3D(de,ie,et,fe,we,P.depth,0,Ze,Fe,null):t.texImage2D(de,ie,et,fe,we,0,Ze,Fe,null)}t.bindFramebuffer(n.FRAMEBUFFER,N),Ue(P)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,he,de,ve.__webglTexture,0,ut(P)):(de===n.TEXTURE_2D||de>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&de<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,he,de,ve.__webglTexture,ie),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Qe(N,P,ne){if(n.bindRenderbuffer(n.RENDERBUFFER,N),P.depthBuffer){const he=P.depthTexture,de=he&&he.isDepthTexture?he.type:null,ie=X(P.stencilBuffer,de),Ze=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Fe=ut(P);Ue(P)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Fe,ie,P.width,P.height):ne?n.renderbufferStorageMultisample(n.RENDERBUFFER,Fe,ie,P.width,P.height):n.renderbufferStorage(n.RENDERBUFFER,ie,P.width,P.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ze,n.RENDERBUFFER,N)}else{const he=P.textures;for(let de=0;de<he.length;de++){const ie=he[de],Ze=l.convert(ie.format,ie.colorSpace),Fe=l.convert(ie.type),et=H(ie.internalFormat,Ze,Fe,ie.colorSpace),Ke=ut(P);ne&&Ue(P)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ke,et,P.width,P.height):Ue(P)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ke,et,P.width,P.height):n.renderbufferStorage(n.RENDERBUFFER,et,P.width,P.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function $e(N,P){if(P&&P.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,N),!(P.depthTexture&&P.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const he=r.get(P.depthTexture);he.__renderTarget=P,(!he.__webglTexture||P.depthTexture.image.width!==P.width||P.depthTexture.image.height!==P.height)&&(P.depthTexture.image.width=P.width,P.depthTexture.image.height=P.height,P.depthTexture.needsUpdate=!0),j(P.depthTexture,0);const de=he.__webglTexture,ie=ut(P);if(P.depthTexture.format===yo)Ue(P)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,de,0,ie):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,de,0);else if(P.depthTexture.format===So)Ue(P)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,de,0,ie):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,de,0);else throw new Error("Unknown depthTexture format")}function ft(N){const P=r.get(N),ne=N.isWebGLCubeRenderTarget===!0;if(P.__boundDepthTexture!==N.depthTexture){const he=N.depthTexture;if(P.__depthDisposeCallback&&P.__depthDisposeCallback(),he){const de=()=>{delete P.__boundDepthTexture,delete P.__depthDisposeCallback,he.removeEventListener("dispose",de)};he.addEventListener("dispose",de),P.__depthDisposeCallback=de}P.__boundDepthTexture=he}if(N.depthTexture&&!P.__autoAllocateDepthBuffer){if(ne)throw new Error("target.depthTexture not supported in Cube render targets");const he=N.texture.mipmaps;he&&he.length>0?$e(P.__webglFramebuffer[0],N):$e(P.__webglFramebuffer,N)}else if(ne){P.__webglDepthbuffer=[];for(let he=0;he<6;he++)if(t.bindFramebuffer(n.FRAMEBUFFER,P.__webglFramebuffer[he]),P.__webglDepthbuffer[he]===void 0)P.__webglDepthbuffer[he]=n.createRenderbuffer(),Qe(P.__webglDepthbuffer[he],N,!1);else{const de=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=P.__webglDepthbuffer[he];n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,ie)}}else{const he=N.texture.mipmaps;if(he&&he.length>0?t.bindFramebuffer(n.FRAMEBUFFER,P.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,P.__webglFramebuffer),P.__webglDepthbuffer===void 0)P.__webglDepthbuffer=n.createRenderbuffer(),Qe(P.__webglDepthbuffer,N,!1);else{const de=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=P.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,ie)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Lt(N,P,ne){const he=r.get(N);P!==void 0&&Oe(he.__webglFramebuffer,N,N.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),ne!==void 0&&ft(N)}function Re(N){const P=N.texture,ne=r.get(N),he=r.get(P);N.addEventListener("dispose",F);const de=N.textures,ie=N.isWebGLCubeRenderTarget===!0,Ze=de.length>1;if(Ze||(he.__webglTexture===void 0&&(he.__webglTexture=n.createTexture()),he.__version=P.version,u.memory.textures++),ie){ne.__webglFramebuffer=[];for(let Fe=0;Fe<6;Fe++)if(P.mipmaps&&P.mipmaps.length>0){ne.__webglFramebuffer[Fe]=[];for(let et=0;et<P.mipmaps.length;et++)ne.__webglFramebuffer[Fe][et]=n.createFramebuffer()}else ne.__webglFramebuffer[Fe]=n.createFramebuffer()}else{if(P.mipmaps&&P.mipmaps.length>0){ne.__webglFramebuffer=[];for(let Fe=0;Fe<P.mipmaps.length;Fe++)ne.__webglFramebuffer[Fe]=n.createFramebuffer()}else ne.__webglFramebuffer=n.createFramebuffer();if(Ze)for(let Fe=0,et=de.length;Fe<et;Fe++){const Ke=r.get(de[Fe]);Ke.__webglTexture===void 0&&(Ke.__webglTexture=n.createTexture(),u.memory.textures++)}if(N.samples>0&&Ue(N)===!1){ne.__webglMultisampledFramebuffer=n.createFramebuffer(),ne.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,ne.__webglMultisampledFramebuffer);for(let Fe=0;Fe<de.length;Fe++){const et=de[Fe];ne.__webglColorRenderbuffer[Fe]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,ne.__webglColorRenderbuffer[Fe]);const Ke=l.convert(et.format,et.colorSpace),ve=l.convert(et.type),fe=H(et.internalFormat,Ke,ve,et.colorSpace,N.isXRRenderTarget===!0),we=ut(N);n.renderbufferStorageMultisample(n.RENDERBUFFER,we,fe,N.width,N.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Fe,n.RENDERBUFFER,ne.__webglColorRenderbuffer[Fe])}n.bindRenderbuffer(n.RENDERBUFFER,null),N.depthBuffer&&(ne.__webglDepthRenderbuffer=n.createRenderbuffer(),Qe(ne.__webglDepthRenderbuffer,N,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ie){t.bindTexture(n.TEXTURE_CUBE_MAP,he.__webglTexture),ct(n.TEXTURE_CUBE_MAP,P);for(let Fe=0;Fe<6;Fe++)if(P.mipmaps&&P.mipmaps.length>0)for(let et=0;et<P.mipmaps.length;et++)Oe(ne.__webglFramebuffer[Fe][et],N,P,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Fe,et);else Oe(ne.__webglFramebuffer[Fe],N,P,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Fe,0);E(P)&&b(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ze){for(let Fe=0,et=de.length;Fe<et;Fe++){const Ke=de[Fe],ve=r.get(Ke);let fe=n.TEXTURE_2D;(N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(fe=N.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(fe,ve.__webglTexture),ct(fe,Ke),Oe(ne.__webglFramebuffer,N,Ke,n.COLOR_ATTACHMENT0+Fe,fe,0),E(Ke)&&b(fe)}t.unbindTexture()}else{let Fe=n.TEXTURE_2D;if((N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(Fe=N.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Fe,he.__webglTexture),ct(Fe,P),P.mipmaps&&P.mipmaps.length>0)for(let et=0;et<P.mipmaps.length;et++)Oe(ne.__webglFramebuffer[et],N,P,n.COLOR_ATTACHMENT0,Fe,et);else Oe(ne.__webglFramebuffer,N,P,n.COLOR_ATTACHMENT0,Fe,0);E(P)&&b(Fe),t.unbindTexture()}N.depthBuffer&&ft(N)}function lt(N){const P=N.textures;for(let ne=0,he=P.length;ne<he;ne++){const de=P[ne];if(E(de)){const ie=V(N),Ze=r.get(de).__webglTexture;t.bindTexture(ie,Ze),b(ie),t.unbindTexture()}}}const $=[],nt=[];function rt(N){if(N.samples>0){if(Ue(N)===!1){const P=N.textures,ne=N.width,he=N.height;let de=n.COLOR_BUFFER_BIT;const ie=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ze=r.get(N),Fe=P.length>1;if(Fe)for(let Ke=0;Ke<P.length;Ke++)t.bindFramebuffer(n.FRAMEBUFFER,Ze.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ke,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ze.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ke,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ze.__webglMultisampledFramebuffer);const et=N.texture.mipmaps;et&&et.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ze.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ze.__webglFramebuffer);for(let Ke=0;Ke<P.length;Ke++){if(N.resolveDepthBuffer&&(N.depthBuffer&&(de|=n.DEPTH_BUFFER_BIT),N.stencilBuffer&&N.resolveStencilBuffer&&(de|=n.STENCIL_BUFFER_BIT)),Fe){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ze.__webglColorRenderbuffer[Ke]);const ve=r.get(P[Ke]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,ve,0)}n.blitFramebuffer(0,0,ne,he,0,0,ne,he,de,n.NEAREST),p===!0&&($.length=0,nt.length=0,$.push(n.COLOR_ATTACHMENT0+Ke),N.depthBuffer&&N.resolveDepthBuffer===!1&&($.push(ie),nt.push(ie),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,nt)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,$))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Fe)for(let Ke=0;Ke<P.length;Ke++){t.bindFramebuffer(n.FRAMEBUFFER,Ze.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ke,n.RENDERBUFFER,Ze.__webglColorRenderbuffer[Ke]);const ve=r.get(P[Ke]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ze.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ke,n.TEXTURE_2D,ve,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ze.__webglMultisampledFramebuffer)}else if(N.depthBuffer&&N.resolveDepthBuffer===!1&&p){const P=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[P])}}}function ut(N){return Math.min(a.maxSamples,N.samples)}function Ue(N){const P=r.get(N);return N.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&P.__useRenderToTexture!==!1}function bt(N){const P=u.render.frame;g.get(N)!==P&&(g.set(N,P),N.update())}function qe(N,P){const ne=N.colorSpace,he=N.format,de=N.type;return N.isCompressedTexture===!0||N.isVideoTexture===!0||ne!==Rr&&ne!==_i&&(Rt.getTransfer(ne)===Bt?(he!==An||de!==Jn)&&mt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Jt("WebGLTextures: Unsupported texture color space:",ne)),P}function it(N){return typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement?(m.width=N.naturalWidth||N.width,m.height=N.naturalHeight||N.height):typeof VideoFrame<"u"&&N instanceof VideoFrame?(m.width=N.displayWidth,m.height=N.displayHeight):(m.width=N.width,m.height=N.height),m}this.allocateTextureUnit=Y,this.resetTextureUnits=B,this.setTexture2D=j,this.setTexture2DArray=J,this.setTexture3D=ue,this.setTextureCube=te,this.rebindTextures=Lt,this.setupRenderTarget=Re,this.updateRenderTargetMipmap=lt,this.updateMultisampleRenderTarget=rt,this.setupDepthRenderbuffer=ft,this.setupFrameBufferTexture=Oe,this.useMultisampledRTT=Ue}function sy(n,e){function t(r,a=_i){let l;const u=Rt.getTransfer(a);if(r===Jn)return n.UNSIGNED_BYTE;if(r===Xf)return n.UNSIGNED_SHORT_4_4_4_4;if(r===$f)return n.UNSIGNED_SHORT_5_5_5_1;if(r===ih)return n.UNSIGNED_INT_5_9_9_9_REV;if(r===ah)return n.UNSIGNED_INT_10F_11F_11F_REV;if(r===Vf)return n.BYTE;if(r===Wf)return n.SHORT;if(r===vo)return n.UNSIGNED_SHORT;if(r===$s)return n.INT;if(r===bi)return n.UNSIGNED_INT;if(r===Zn)return n.FLOAT;if(r===ei)return n.HALF_FLOAT;if(r===oh)return n.ALPHA;if(r===sh)return n.RGB;if(r===An)return n.RGBA;if(r===yo)return n.DEPTH_COMPONENT;if(r===So)return n.DEPTH_STENCIL;if(r===lh)return n.RED;if(r===qf)return n.RED_INTEGER;if(r===Yf)return n.RG;if(r===jf)return n.RG_INTEGER;if(r===Kf)return n.RGBA_INTEGER;if(r===Ts||r===As||r===Cs||r===Rs)if(u===Bt)if(l=e.get("WEBGL_compressed_texture_s3tc_srgb"),l!==null){if(r===Ts)return l.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===As)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Cs)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Rs)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(l=e.get("WEBGL_compressed_texture_s3tc"),l!==null){if(r===Ts)return l.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===As)return l.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Cs)return l.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Rs)return l.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Jc||r===Qc||r===ef||r===tf)if(l=e.get("WEBGL_compressed_texture_pvrtc"),l!==null){if(r===Jc)return l.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Qc)return l.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===ef)return l.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===tf)return l.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===nf||r===rf||r===af)if(l=e.get("WEBGL_compressed_texture_etc"),l!==null){if(r===nf||r===rf)return u===Bt?l.COMPRESSED_SRGB8_ETC2:l.COMPRESSED_RGB8_ETC2;if(r===af)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:l.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===of||r===sf||r===lf||r===cf||r===ff||r===uf||r===df||r===hf||r===pf||r===mf||r===_f||r===gf||r===vf||r===xf)if(l=e.get("WEBGL_compressed_texture_astc"),l!==null){if(r===of)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:l.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===sf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:l.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===lf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:l.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===cf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:l.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===ff)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:l.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===uf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:l.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===df)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:l.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===hf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:l.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===pf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:l.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===mf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:l.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===_f)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:l.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===gf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:l.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===vf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:l.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===xf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:l.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===yf||r===Sf||r===bf)if(l=e.get("EXT_texture_compression_bptc"),l!==null){if(r===yf)return u===Bt?l.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:l.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Sf)return l.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===bf)return l.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Ef||r===Mf||r===wf||r===Tf)if(l=e.get("EXT_texture_compression_rgtc"),l!==null){if(r===Ef)return l.COMPRESSED_RED_RGTC1_EXT;if(r===Mf)return l.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===wf)return l.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Tf)return l.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===xo?n.UNSIGNED_INT_24_8:n[r]!==void 0?n[r]:null}return{convert:t}}const ly=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,cy=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class fy{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const r=new Sh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,r=new Qn({vertexShader:ly,fragmentShader:cy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Pr(new za(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class uy extends Ba{constructor(e,t){super();const r=this;let a=null,l=1,u=null,o="local-floor",p=1,m=null,g=null,x=null,y=null,S=null,T=null;const L=typeof XRWebGLBinding<"u",E=new fy,b={},V=t.getContextAttributes();let H=null,X=null;const I=[],R=[],F=new Gt;let W=null;const D=new ur;D.viewport=new Qt;const w=new ur;w.viewport=new Qt;const z=[D,w],B=new P0;let Y=null,Z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(_e){let ge=I[_e];return ge===void 0&&(ge=new yc,I[_e]=ge),ge.getTargetRaySpace()},this.getControllerGrip=function(_e){let ge=I[_e];return ge===void 0&&(ge=new yc,I[_e]=ge),ge.getGripSpace()},this.getHand=function(_e){let ge=I[_e];return ge===void 0&&(ge=new yc,I[_e]=ge),ge.getHandSpace()};function j(_e){const ge=R.indexOf(_e.inputSource);if(ge===-1)return;const Oe=I[ge];Oe!==void 0&&(Oe.update(_e.inputSource,_e.frame,m||u),Oe.dispatchEvent({type:_e.type,data:_e.inputSource}))}function J(){a.removeEventListener("select",j),a.removeEventListener("selectstart",j),a.removeEventListener("selectend",j),a.removeEventListener("squeeze",j),a.removeEventListener("squeezestart",j),a.removeEventListener("squeezeend",j),a.removeEventListener("end",J),a.removeEventListener("inputsourceschange",ue);for(let _e=0;_e<I.length;_e++){const ge=R[_e];ge!==null&&(R[_e]=null,I[_e].disconnect(ge))}Y=null,Z=null,E.reset();for(const _e in b)delete b[_e];e.setRenderTarget(H),S=null,y=null,x=null,a=null,X=null,vt.stop(),r.isPresenting=!1,e.setPixelRatio(W),e.setSize(F.width,F.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(_e){l=_e,r.isPresenting===!0&&mt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(_e){o=_e,r.isPresenting===!0&&mt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return m||u},this.setReferenceSpace=function(_e){m=_e},this.getBaseLayer=function(){return y!==null?y:S},this.getBinding=function(){return x===null&&L&&(x=new XRWebGLBinding(a,t)),x},this.getFrame=function(){return T},this.getSession=function(){return a},this.setSession=async function(_e){if(a=_e,a!==null){if(H=e.getRenderTarget(),a.addEventListener("select",j),a.addEventListener("selectstart",j),a.addEventListener("selectend",j),a.addEventListener("squeeze",j),a.addEventListener("squeezestart",j),a.addEventListener("squeezeend",j),a.addEventListener("end",J),a.addEventListener("inputsourceschange",ue),V.xrCompatible!==!0&&await t.makeXRCompatible(),W=e.getPixelRatio(),e.getSize(F),L&&"createProjectionLayer"in XRWebGLBinding.prototype){let Oe=null,Qe=null,$e=null;V.depth&&($e=V.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Oe=V.stencil?So:yo,Qe=V.stencil?xo:bi);const ft={colorFormat:t.RGBA8,depthFormat:$e,scaleFactor:l};x=this.getBinding(),y=x.createProjectionLayer(ft),a.updateRenderState({layers:[y]}),e.setPixelRatio(1),e.setSize(y.textureWidth,y.textureHeight,!1),X=new qr(y.textureWidth,y.textureHeight,{format:An,type:Jn,depthTexture:new yh(y.textureWidth,y.textureHeight,Qe,void 0,void 0,void 0,void 0,void 0,void 0,Oe),stencilBuffer:V.stencil,colorSpace:e.outputColorSpace,samples:V.antialias?4:0,resolveDepthBuffer:y.ignoreDepthValues===!1,resolveStencilBuffer:y.ignoreDepthValues===!1})}else{const Oe={antialias:V.antialias,alpha:!0,depth:V.depth,stencil:V.stencil,framebufferScaleFactor:l};S=new XRWebGLLayer(a,t,Oe),a.updateRenderState({baseLayer:S}),e.setPixelRatio(1),e.setSize(S.framebufferWidth,S.framebufferHeight,!1),X=new qr(S.framebufferWidth,S.framebufferHeight,{format:An,type:Jn,colorSpace:e.outputColorSpace,stencilBuffer:V.stencil,resolveDepthBuffer:S.ignoreDepthValues===!1,resolveStencilBuffer:S.ignoreDepthValues===!1})}X.isXRRenderTarget=!0,this.setFoveation(p),m=null,u=await a.requestReferenceSpace(o),vt.setContext(a),vt.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode},this.getDepthTexture=function(){return E.getDepthTexture()};function ue(_e){for(let ge=0;ge<_e.removed.length;ge++){const Oe=_e.removed[ge],Qe=R.indexOf(Oe);Qe>=0&&(R[Qe]=null,I[Qe].disconnect(Oe))}for(let ge=0;ge<_e.added.length;ge++){const Oe=_e.added[ge];let Qe=R.indexOf(Oe);if(Qe===-1){for(let ft=0;ft<I.length;ft++)if(ft>=R.length){R.push(Oe),Qe=ft;break}else if(R[ft]===null){R[ft]=Oe,Qe=ft;break}if(Qe===-1)break}const $e=I[Qe];$e&&$e.connect(Oe)}}const te=new le,Se=new le;function be(_e,ge,Oe){te.setFromMatrixPosition(ge.matrixWorld),Se.setFromMatrixPosition(Oe.matrixWorld);const Qe=te.distanceTo(Se),$e=ge.projectionMatrix.elements,ft=Oe.projectionMatrix.elements,Lt=$e[14]/($e[10]-1),Re=$e[14]/($e[10]+1),lt=($e[9]+1)/$e[5],$=($e[9]-1)/$e[5],nt=($e[8]-1)/$e[0],rt=(ft[8]+1)/ft[0],ut=Lt*nt,Ue=Lt*rt,bt=Qe/(-nt+rt),qe=bt*-nt;if(ge.matrixWorld.decompose(_e.position,_e.quaternion,_e.scale),_e.translateX(qe),_e.translateZ(bt),_e.matrixWorld.compose(_e.position,_e.quaternion,_e.scale),_e.matrixWorldInverse.copy(_e.matrixWorld).invert(),$e[10]===-1)_e.projectionMatrix.copy(ge.projectionMatrix),_e.projectionMatrixInverse.copy(ge.projectionMatrixInverse);else{const it=Lt+bt,N=Re+bt,P=ut-qe,ne=Ue+(Qe-qe),he=lt*Re/N*it,de=$*Re/N*it;_e.projectionMatrix.makePerspective(P,ne,he,de,it,N),_e.projectionMatrixInverse.copy(_e.projectionMatrix).invert()}}function Ye(_e,ge){ge===null?_e.matrixWorld.copy(_e.matrix):_e.matrixWorld.multiplyMatrices(ge.matrixWorld,_e.matrix),_e.matrixWorldInverse.copy(_e.matrixWorld).invert()}this.updateCamera=function(_e){if(a===null)return;let ge=_e.near,Oe=_e.far;E.texture!==null&&(E.depthNear>0&&(ge=E.depthNear),E.depthFar>0&&(Oe=E.depthFar)),B.near=w.near=D.near=ge,B.far=w.far=D.far=Oe,(Y!==B.near||Z!==B.far)&&(a.updateRenderState({depthNear:B.near,depthFar:B.far}),Y=B.near,Z=B.far),B.layers.mask=_e.layers.mask|6,D.layers.mask=B.layers.mask&3,w.layers.mask=B.layers.mask&5;const Qe=_e.parent,$e=B.cameras;Ye(B,Qe);for(let ft=0;ft<$e.length;ft++)Ye($e[ft],Qe);$e.length===2?be(B,D,w):B.projectionMatrix.copy(D.projectionMatrix),ct(_e,B,Qe)};function ct(_e,ge,Oe){Oe===null?_e.matrix.copy(ge.matrixWorld):(_e.matrix.copy(Oe.matrixWorld),_e.matrix.invert(),_e.matrix.multiply(ge.matrixWorld)),_e.matrix.decompose(_e.position,_e.quaternion,_e.scale),_e.updateMatrixWorld(!0),_e.projectionMatrix.copy(ge.projectionMatrix),_e.projectionMatrixInverse.copy(ge.projectionMatrixInverse),_e.isPerspectiveCamera&&(_e.fov=Af*2*Math.atan(1/_e.projectionMatrix.elements[5]),_e.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(y===null&&S===null))return p},this.setFoveation=function(_e){p=_e,y!==null&&(y.fixedFoveation=_e),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=_e)},this.hasDepthSensing=function(){return E.texture!==null},this.getDepthSensingMesh=function(){return E.getMesh(B)},this.getCameraTexture=function(_e){return b[_e]};let pt=null;function yt(_e,ge){if(g=ge.getViewerPose(m||u),T=ge,g!==null){const Oe=g.views;S!==null&&(e.setRenderTargetFramebuffer(X,S.framebuffer),e.setRenderTarget(X));let Qe=!1;Oe.length!==B.cameras.length&&(B.cameras.length=0,Qe=!0);for(let Re=0;Re<Oe.length;Re++){const lt=Oe[Re];let $=null;if(S!==null)$=S.getViewport(lt);else{const rt=x.getViewSubImage(y,lt);$=rt.viewport,Re===0&&(e.setRenderTargetTextures(X,rt.colorTexture,rt.depthStencilTexture),e.setRenderTarget(X))}let nt=z[Re];nt===void 0&&(nt=new ur,nt.layers.enable(Re),nt.viewport=new Qt,z[Re]=nt),nt.matrix.fromArray(lt.transform.matrix),nt.matrix.decompose(nt.position,nt.quaternion,nt.scale),nt.projectionMatrix.fromArray(lt.projectionMatrix),nt.projectionMatrixInverse.copy(nt.projectionMatrix).invert(),nt.viewport.set($.x,$.y,$.width,$.height),Re===0&&(B.matrix.copy(nt.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Qe===!0&&B.cameras.push(nt)}const $e=a.enabledFeatures;if($e&&$e.includes("depth-sensing")&&a.depthUsage=="gpu-optimized"&&L){x=r.getBinding();const Re=x.getDepthInformation(Oe[0]);Re&&Re.isValid&&Re.texture&&E.init(Re,a.renderState)}if($e&&$e.includes("camera-access")&&L){e.state.unbindTexture(),x=r.getBinding();for(let Re=0;Re<Oe.length;Re++){const lt=Oe[Re].camera;if(lt){let $=b[lt];$||($=new Sh,b[lt]=$);const nt=x.getCameraImage(lt);$.sourceTexture=nt}}}}for(let Oe=0;Oe<I.length;Oe++){const Qe=R[Oe],$e=I[Oe];Qe!==null&&$e!==void 0&&$e.update(Qe,ge,m||u)}pt&&pt(_e,ge),ge.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:ge}),T=null}const vt=new Eh;vt.setAnimationLoop(yt),this.setAnimationLoop=function(_e){pt=_e},this.dispose=function(){}}}const Ni=new Yr,dy=new on;function hy(n,e){function t(E,b){E.matrixAutoUpdate===!0&&E.updateMatrix(),b.value.copy(E.matrix)}function r(E,b){b.color.getRGB(E.fogColor.value,_h(n)),b.isFog?(E.fogNear.value=b.near,E.fogFar.value=b.far):b.isFogExp2&&(E.fogDensity.value=b.density)}function a(E,b,V,H,X){b.isMeshBasicMaterial||b.isMeshLambertMaterial?l(E,b):b.isMeshToonMaterial?(l(E,b),x(E,b)):b.isMeshPhongMaterial?(l(E,b),g(E,b)):b.isMeshStandardMaterial?(l(E,b),y(E,b),b.isMeshPhysicalMaterial&&S(E,b,X)):b.isMeshMatcapMaterial?(l(E,b),T(E,b)):b.isMeshDepthMaterial?l(E,b):b.isMeshDistanceMaterial?(l(E,b),L(E,b)):b.isMeshNormalMaterial?l(E,b):b.isLineBasicMaterial?(u(E,b),b.isLineDashedMaterial&&o(E,b)):b.isPointsMaterial?p(E,b,V,H):b.isSpriteMaterial?m(E,b):b.isShadowMaterial?(E.color.value.copy(b.color),E.opacity.value=b.opacity):b.isShaderMaterial&&(b.uniformsNeedUpdate=!1)}function l(E,b){E.opacity.value=b.opacity,b.color&&E.diffuse.value.copy(b.color),b.emissive&&E.emissive.value.copy(b.emissive).multiplyScalar(b.emissiveIntensity),b.map&&(E.map.value=b.map,t(b.map,E.mapTransform)),b.alphaMap&&(E.alphaMap.value=b.alphaMap,t(b.alphaMap,E.alphaMapTransform)),b.bumpMap&&(E.bumpMap.value=b.bumpMap,t(b.bumpMap,E.bumpMapTransform),E.bumpScale.value=b.bumpScale,b.side===In&&(E.bumpScale.value*=-1)),b.normalMap&&(E.normalMap.value=b.normalMap,t(b.normalMap,E.normalMapTransform),E.normalScale.value.copy(b.normalScale),b.side===In&&E.normalScale.value.negate()),b.displacementMap&&(E.displacementMap.value=b.displacementMap,t(b.displacementMap,E.displacementMapTransform),E.displacementScale.value=b.displacementScale,E.displacementBias.value=b.displacementBias),b.emissiveMap&&(E.emissiveMap.value=b.emissiveMap,t(b.emissiveMap,E.emissiveMapTransform)),b.specularMap&&(E.specularMap.value=b.specularMap,t(b.specularMap,E.specularMapTransform)),b.alphaTest>0&&(E.alphaTest.value=b.alphaTest);const V=e.get(b),H=V.envMap,X=V.envMapRotation;H&&(E.envMap.value=H,Ni.copy(X),Ni.x*=-1,Ni.y*=-1,Ni.z*=-1,H.isCubeTexture&&H.isRenderTargetTexture===!1&&(Ni.y*=-1,Ni.z*=-1),E.envMapRotation.value.setFromMatrix4(dy.makeRotationFromEuler(Ni)),E.flipEnvMap.value=H.isCubeTexture&&H.isRenderTargetTexture===!1?-1:1,E.reflectivity.value=b.reflectivity,E.ior.value=b.ior,E.refractionRatio.value=b.refractionRatio),b.lightMap&&(E.lightMap.value=b.lightMap,E.lightMapIntensity.value=b.lightMapIntensity,t(b.lightMap,E.lightMapTransform)),b.aoMap&&(E.aoMap.value=b.aoMap,E.aoMapIntensity.value=b.aoMapIntensity,t(b.aoMap,E.aoMapTransform))}function u(E,b){E.diffuse.value.copy(b.color),E.opacity.value=b.opacity,b.map&&(E.map.value=b.map,t(b.map,E.mapTransform))}function o(E,b){E.dashSize.value=b.dashSize,E.totalSize.value=b.dashSize+b.gapSize,E.scale.value=b.scale}function p(E,b,V,H){E.diffuse.value.copy(b.color),E.opacity.value=b.opacity,E.size.value=b.size*V,E.scale.value=H*.5,b.map&&(E.map.value=b.map,t(b.map,E.uvTransform)),b.alphaMap&&(E.alphaMap.value=b.alphaMap,t(b.alphaMap,E.alphaMapTransform)),b.alphaTest>0&&(E.alphaTest.value=b.alphaTest)}function m(E,b){E.diffuse.value.copy(b.color),E.opacity.value=b.opacity,E.rotation.value=b.rotation,b.map&&(E.map.value=b.map,t(b.map,E.mapTransform)),b.alphaMap&&(E.alphaMap.value=b.alphaMap,t(b.alphaMap,E.alphaMapTransform)),b.alphaTest>0&&(E.alphaTest.value=b.alphaTest)}function g(E,b){E.specular.value.copy(b.specular),E.shininess.value=Math.max(b.shininess,1e-4)}function x(E,b){b.gradientMap&&(E.gradientMap.value=b.gradientMap)}function y(E,b){E.metalness.value=b.metalness,b.metalnessMap&&(E.metalnessMap.value=b.metalnessMap,t(b.metalnessMap,E.metalnessMapTransform)),E.roughness.value=b.roughness,b.roughnessMap&&(E.roughnessMap.value=b.roughnessMap,t(b.roughnessMap,E.roughnessMapTransform)),b.envMap&&(E.envMapIntensity.value=b.envMapIntensity)}function S(E,b,V){E.ior.value=b.ior,b.sheen>0&&(E.sheenColor.value.copy(b.sheenColor).multiplyScalar(b.sheen),E.sheenRoughness.value=b.sheenRoughness,b.sheenColorMap&&(E.sheenColorMap.value=b.sheenColorMap,t(b.sheenColorMap,E.sheenColorMapTransform)),b.sheenRoughnessMap&&(E.sheenRoughnessMap.value=b.sheenRoughnessMap,t(b.sheenRoughnessMap,E.sheenRoughnessMapTransform))),b.clearcoat>0&&(E.clearcoat.value=b.clearcoat,E.clearcoatRoughness.value=b.clearcoatRoughness,b.clearcoatMap&&(E.clearcoatMap.value=b.clearcoatMap,t(b.clearcoatMap,E.clearcoatMapTransform)),b.clearcoatRoughnessMap&&(E.clearcoatRoughnessMap.value=b.clearcoatRoughnessMap,t(b.clearcoatRoughnessMap,E.clearcoatRoughnessMapTransform)),b.clearcoatNormalMap&&(E.clearcoatNormalMap.value=b.clearcoatNormalMap,t(b.clearcoatNormalMap,E.clearcoatNormalMapTransform),E.clearcoatNormalScale.value.copy(b.clearcoatNormalScale),b.side===In&&E.clearcoatNormalScale.value.negate())),b.dispersion>0&&(E.dispersion.value=b.dispersion),b.iridescence>0&&(E.iridescence.value=b.iridescence,E.iridescenceIOR.value=b.iridescenceIOR,E.iridescenceThicknessMinimum.value=b.iridescenceThicknessRange[0],E.iridescenceThicknessMaximum.value=b.iridescenceThicknessRange[1],b.iridescenceMap&&(E.iridescenceMap.value=b.iridescenceMap,t(b.iridescenceMap,E.iridescenceMapTransform)),b.iridescenceThicknessMap&&(E.iridescenceThicknessMap.value=b.iridescenceThicknessMap,t(b.iridescenceThicknessMap,E.iridescenceThicknessMapTransform))),b.transmission>0&&(E.transmission.value=b.transmission,E.transmissionSamplerMap.value=V.texture,E.transmissionSamplerSize.value.set(V.width,V.height),b.transmissionMap&&(E.transmissionMap.value=b.transmissionMap,t(b.transmissionMap,E.transmissionMapTransform)),E.thickness.value=b.thickness,b.thicknessMap&&(E.thicknessMap.value=b.thicknessMap,t(b.thicknessMap,E.thicknessMapTransform)),E.attenuationDistance.value=b.attenuationDistance,E.attenuationColor.value.copy(b.attenuationColor)),b.anisotropy>0&&(E.anisotropyVector.value.set(b.anisotropy*Math.cos(b.anisotropyRotation),b.anisotropy*Math.sin(b.anisotropyRotation)),b.anisotropyMap&&(E.anisotropyMap.value=b.anisotropyMap,t(b.anisotropyMap,E.anisotropyMapTransform))),E.specularIntensity.value=b.specularIntensity,E.specularColor.value.copy(b.specularColor),b.specularColorMap&&(E.specularColorMap.value=b.specularColorMap,t(b.specularColorMap,E.specularColorMapTransform)),b.specularIntensityMap&&(E.specularIntensityMap.value=b.specularIntensityMap,t(b.specularIntensityMap,E.specularIntensityMapTransform))}function T(E,b){b.matcap&&(E.matcap.value=b.matcap)}function L(E,b){const V=e.get(b).light;E.referencePosition.value.setFromMatrixPosition(V.matrixWorld),E.nearDistance.value=V.shadow.camera.near,E.farDistance.value=V.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:a}}function py(n,e,t,r){let a={},l={},u=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function p(V,H){const X=H.program;r.uniformBlockBinding(V,X)}function m(V,H){let X=a[V.id];X===void 0&&(T(V),X=g(V),a[V.id]=X,V.addEventListener("dispose",E));const I=H.program;r.updateUBOMapping(V,I);const R=e.render.frame;l[V.id]!==R&&(y(V),l[V.id]=R)}function g(V){const H=x();V.__bindingPointIndex=H;const X=n.createBuffer(),I=V.__size,R=V.usage;return n.bindBuffer(n.UNIFORM_BUFFER,X),n.bufferData(n.UNIFORM_BUFFER,I,R),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,H,X),X}function x(){for(let V=0;V<o;V++)if(u.indexOf(V)===-1)return u.push(V),V;return Jt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function y(V){const H=a[V.id],X=V.uniforms,I=V.__cache;n.bindBuffer(n.UNIFORM_BUFFER,H);for(let R=0,F=X.length;R<F;R++){const W=Array.isArray(X[R])?X[R]:[X[R]];for(let D=0,w=W.length;D<w;D++){const z=W[D];if(S(z,R,D,I)===!0){const B=z.__offset,Y=Array.isArray(z.value)?z.value:[z.value];let Z=0;for(let j=0;j<Y.length;j++){const J=Y[j],ue=L(J);typeof J=="number"||typeof J=="boolean"?(z.__data[0]=J,n.bufferSubData(n.UNIFORM_BUFFER,B+Z,z.__data)):J.isMatrix3?(z.__data[0]=J.elements[0],z.__data[1]=J.elements[1],z.__data[2]=J.elements[2],z.__data[3]=0,z.__data[4]=J.elements[3],z.__data[5]=J.elements[4],z.__data[6]=J.elements[5],z.__data[7]=0,z.__data[8]=J.elements[6],z.__data[9]=J.elements[7],z.__data[10]=J.elements[8],z.__data[11]=0):(J.toArray(z.__data,Z),Z+=ue.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,B,z.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function S(V,H,X,I){const R=V.value,F=H+"_"+X;if(I[F]===void 0)return typeof R=="number"||typeof R=="boolean"?I[F]=R:I[F]=R.clone(),!0;{const W=I[F];if(typeof R=="number"||typeof R=="boolean"){if(W!==R)return I[F]=R,!0}else if(W.equals(R)===!1)return W.copy(R),!0}return!1}function T(V){const H=V.uniforms;let X=0;const I=16;for(let F=0,W=H.length;F<W;F++){const D=Array.isArray(H[F])?H[F]:[H[F]];for(let w=0,z=D.length;w<z;w++){const B=D[w],Y=Array.isArray(B.value)?B.value:[B.value];for(let Z=0,j=Y.length;Z<j;Z++){const J=Y[Z],ue=L(J),te=X%I,Se=te%ue.boundary,be=te+Se;X+=Se,be!==0&&I-be<ue.storage&&(X+=I-be),B.__data=new Float32Array(ue.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=X,X+=ue.storage}}}const R=X%I;return R>0&&(X+=I-R),V.__size=X,V.__cache={},this}function L(V){const H={boundary:0,storage:0};return typeof V=="number"||typeof V=="boolean"?(H.boundary=4,H.storage=4):V.isVector2?(H.boundary=8,H.storage=8):V.isVector3||V.isColor?(H.boundary=16,H.storage=12):V.isVector4?(H.boundary=16,H.storage=16):V.isMatrix3?(H.boundary=48,H.storage=48):V.isMatrix4?(H.boundary=64,H.storage=64):V.isTexture?mt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):mt("WebGLRenderer: Unsupported uniform value type.",V),H}function E(V){const H=V.target;H.removeEventListener("dispose",E);const X=u.indexOf(H.__bindingPointIndex);u.splice(X,1),n.deleteBuffer(a[H.id]),delete a[H.id],delete l[H.id]}function b(){for(const V in a)n.deleteBuffer(a[V]);u=[],a={},l={}}return{bind:p,update:m,dispose:b}}const my=new Uint16Array([11481,15204,11534,15171,11808,15015,12385,14843,12894,14716,13396,14600,13693,14483,13976,14366,14237,14171,14405,13961,14511,13770,14605,13598,14687,13444,14760,13305,14822,13066,14876,12857,14923,12675,14963,12517,14997,12379,15025,12230,15049,12023,15070,11843,15086,11687,15100,11551,15111,11433,15120,11330,15127,11217,15132,11060,15135,10922,15138,10801,15139,10695,15139,10600,13012,14923,13020,14917,13064,14886,13176,14800,13349,14666,13513,14526,13724,14398,13960,14230,14200,14020,14383,13827,14488,13651,14583,13491,14667,13348,14740,13132,14803,12908,14856,12713,14901,12542,14938,12394,14968,12241,14992,12017,15010,11822,15024,11654,15034,11507,15041,11380,15044,11269,15044,11081,15042,10913,15037,10764,15031,10635,15023,10520,15014,10419,15003,10330,13657,14676,13658,14673,13670,14660,13698,14622,13750,14547,13834,14442,13956,14317,14112,14093,14291,13889,14407,13704,14499,13538,14586,13389,14664,13201,14733,12966,14792,12758,14842,12577,14882,12418,14915,12272,14940,12033,14959,11826,14972,11646,14980,11490,14983,11355,14983,11212,14979,11008,14971,10830,14961,10675,14950,10540,14936,10420,14923,10315,14909,10204,14894,10041,14089,14460,14090,14459,14096,14452,14112,14431,14141,14388,14186,14305,14252,14130,14341,13941,14399,13756,14467,13585,14539,13430,14610,13272,14677,13026,14737,12808,14790,12617,14833,12449,14869,12303,14896,12065,14916,11845,14929,11655,14937,11490,14939,11347,14936,11184,14930,10970,14921,10783,14912,10621,14900,10480,14885,10356,14867,10247,14848,10062,14827,9894,14805,9745,14400,14208,14400,14206,14402,14198,14406,14174,14415,14122,14427,14035,14444,13913,14469,13767,14504,13613,14548,13463,14598,13324,14651,13082,14704,12858,14752,12658,14795,12483,14831,12330,14860,12106,14881,11875,14895,11675,14903,11501,14905,11351,14903,11178,14900,10953,14892,10757,14880,10589,14865,10442,14847,10313,14827,10162,14805,9965,14782,9792,14757,9642,14731,9507,14562,13883,14562,13883,14563,13877,14566,13862,14570,13830,14576,13773,14584,13689,14595,13582,14613,13461,14637,13336,14668,13120,14704,12897,14741,12695,14776,12516,14808,12358,14835,12150,14856,11910,14870,11701,14878,11519,14882,11361,14884,11187,14880,10951,14871,10748,14858,10572,14842,10418,14823,10286,14801,10099,14777,9897,14751,9722,14725,9567,14696,9430,14666,9309,14702,13604,14702,13604,14702,13600,14703,13591,14705,13570,14707,13533,14709,13477,14712,13400,14718,13305,14727,13106,14743,12907,14762,12716,14784,12539,14807,12380,14827,12190,14844,11943,14855,11727,14863,11539,14870,11376,14871,11204,14868,10960,14858,10748,14845,10565,14829,10406,14809,10269,14786,10058,14761,9852,14734,9671,14705,9512,14674,9374,14641,9253,14608,9076,14821,13366,14821,13365,14821,13364,14821,13358,14821,13344,14821,13320,14819,13252,14817,13145,14815,13011,14814,12858,14817,12698,14823,12539,14832,12389,14841,12214,14850,11968,14856,11750,14861,11558,14866,11390,14867,11226,14862,10972,14853,10754,14840,10565,14823,10401,14803,10259,14780,10032,14754,9820,14725,9635,14694,9473,14661,9333,14627,9203,14593,8988,14557,8798,14923,13014,14922,13014,14922,13012,14922,13004,14920,12987,14919,12957,14915,12907,14909,12834,14902,12738,14894,12623,14888,12498,14883,12370,14880,12203,14878,11970,14875,11759,14873,11569,14874,11401,14872,11243,14865,10986,14855,10762,14842,10568,14825,10401,14804,10255,14781,10017,14754,9799,14725,9611,14692,9445,14658,9301,14623,9139,14587,8920,14548,8729,14509,8562,15008,12672,15008,12672,15008,12671,15007,12667,15005,12656,15001,12637,14997,12605,14989,12556,14978,12490,14966,12407,14953,12313,14940,12136,14927,11934,14914,11742,14903,11563,14896,11401,14889,11247,14879,10992,14866,10767,14851,10570,14833,10400,14812,10252,14789,10007,14761,9784,14731,9592,14698,9424,14663,9279,14627,9088,14588,8868,14548,8676,14508,8508,14467,8360,15080,12386,15080,12386,15079,12385,15078,12383,15076,12378,15072,12367,15066,12347,15057,12315,15045,12253,15030,12138,15012,11998,14993,11845,14972,11685,14951,11530,14935,11383,14920,11228,14904,10981,14887,10762,14870,10567,14850,10397,14827,10248,14803,9997,14774,9771,14743,9578,14710,9407,14674,9259,14637,9048,14596,8826,14555,8632,14514,8464,14471,8317,14427,8182,15139,12008,15139,12008,15138,12008,15137,12007,15135,12003,15130,11990,15124,11969,15115,11929,15102,11872,15086,11794,15064,11693,15041,11581,15013,11459,14987,11336,14966,11170,14944,10944,14921,10738,14898,10552,14875,10387,14850,10239,14824,9983,14794,9758,14762,9563,14728,9392,14692,9244,14653,9014,14611,8791,14569,8597,14526,8427,14481,8281,14436,8110,14391,7885,15188,11617,15188,11617,15187,11617,15186,11618,15183,11617,15179,11612,15173,11601,15163,11581,15150,11546,15133,11495,15110,11427,15083,11346,15051,11246,15024,11057,14996,10868,14967,10687,14938,10517,14911,10362,14882,10206,14853,9956,14821,9737,14787,9543,14752,9375,14715,9228,14675,8980,14632,8760,14589,8565,14544,8395,14498,8248,14451,8049,14404,7824,14357,7630,15228,11298,15228,11298,15227,11299,15226,11301,15223,11303,15219,11302,15213,11299,15204,11290,15191,11271,15174,11217,15150,11129,15119,11015,15087,10886,15057,10744,15024,10599,14990,10455,14957,10318,14924,10143,14891,9911,14856,9701,14820,9516,14782,9352,14744,9200,14703,8946,14659,8725,14615,8533,14568,8366,14521,8220,14472,7992,14423,7770,14374,7578,14315,7408,15260,10819,15260,10819,15259,10822,15258,10826,15256,10832,15251,10836,15246,10841,15237,10838,15225,10821,15207,10788,15183,10734,15151,10660,15120,10571,15087,10469,15049,10359,15012,10249,14974,10041,14937,9837,14900,9647,14860,9475,14820,9320,14779,9147,14736,8902,14691,8688,14646,8499,14598,8335,14549,8189,14499,7940,14448,7720,14397,7529,14347,7363,14256,7218,15285,10410,15285,10411,15285,10413,15284,10418,15282,10425,15278,10434,15272,10442,15264,10449,15252,10445,15235,10433,15210,10403,15179,10358,15149,10301,15113,10218,15073,10059,15033,9894,14991,9726,14951,9565,14909,9413,14865,9273,14822,9073,14777,8845,14730,8641,14682,8459,14633,8300,14583,8129,14531,7883,14479,7670,14426,7482,14373,7321,14305,7176,14201,6939,15305,9939,15305,9940,15305,9945,15304,9955,15302,9967,15298,9989,15293,10010,15286,10033,15274,10044,15258,10045,15233,10022,15205,9975,15174,9903,15136,9808,15095,9697,15053,9578,15009,9451,14965,9327,14918,9198,14871,8973,14825,8766,14775,8579,14725,8408,14675,8259,14622,8058,14569,7821,14515,7615,14460,7435,14405,7276,14350,7108,14256,6866,14149,6653,15321,9444,15321,9445,15321,9448,15320,9458,15317,9470,15314,9490,15310,9515,15302,9540,15292,9562,15276,9579,15251,9577,15226,9559,15195,9519,15156,9463,15116,9389,15071,9304,15025,9208,14978,9023,14927,8838,14878,8661,14827,8496,14774,8344,14722,8206,14667,7973,14612,7749,14556,7555,14499,7382,14443,7229,14385,7025,14322,6791,14210,6588,14100,6409,15333,8920,15333,8921,15332,8927,15332,8943,15329,8965,15326,9002,15322,9048,15316,9106,15307,9162,15291,9204,15267,9221,15244,9221,15212,9196,15175,9134,15133,9043,15088,8930,15040,8801,14990,8665,14938,8526,14886,8391,14830,8261,14775,8087,14719,7866,14661,7664,14603,7482,14544,7322,14485,7178,14426,6936,14367,6713,14281,6517,14166,6348,14054,6198,15341,8360,15341,8361,15341,8366,15341,8379,15339,8399,15336,8431,15332,8473,15326,8527,15318,8585,15302,8632,15281,8670,15258,8690,15227,8690,15191,8664,15149,8612,15104,8543,15055,8456,15001,8360,14948,8259,14892,8122,14834,7923,14776,7734,14716,7558,14656,7397,14595,7250,14534,7070,14472,6835,14410,6628,14350,6443,14243,6283,14125,6135,14010,5889,15348,7715,15348,7717,15348,7725,15347,7745,15345,7780,15343,7836,15339,7905,15334,8e3,15326,8103,15310,8193,15293,8239,15270,8270,15240,8287,15204,8283,15163,8260,15118,8223,15067,8143,15014,8014,14958,7873,14899,7723,14839,7573,14778,7430,14715,7293,14652,7164,14588,6931,14524,6720,14460,6531,14396,6362,14330,6210,14207,6015,14086,5781,13969,5576,15352,7114,15352,7116,15352,7128,15352,7159,15350,7195,15348,7237,15345,7299,15340,7374,15332,7457,15317,7544,15301,7633,15280,7703,15251,7754,15216,7775,15176,7767,15131,7733,15079,7670,15026,7588,14967,7492,14906,7387,14844,7278,14779,7171,14714,6965,14648,6770,14581,6587,14515,6420,14448,6269,14382,6123,14299,5881,14172,5665,14049,5477,13929,5310,15355,6329,15355,6330,15355,6339,15355,6362,15353,6410,15351,6472,15349,6572,15344,6688,15337,6835,15323,6985,15309,7142,15287,7220,15260,7277,15226,7310,15188,7326,15142,7318,15090,7285,15036,7239,14976,7177,14914,7045,14849,6892,14782,6736,14714,6581,14645,6433,14576,6293,14506,6164,14438,5946,14369,5733,14270,5540,14140,5369,14014,5216,13892,5043,15357,5483,15357,5484,15357,5496,15357,5528,15356,5597,15354,5692,15351,5835,15347,6011,15339,6195,15328,6317,15314,6446,15293,6566,15268,6668,15235,6746,15197,6796,15152,6811,15101,6790,15046,6748,14985,6673,14921,6583,14854,6479,14785,6371,14714,6259,14643,6149,14571,5946,14499,5750,14428,5567,14358,5401,14242,5250,14109,5111,13980,4870,13856,4657,15359,4555,15359,4557,15358,4573,15358,4633,15357,4715,15355,4841,15353,5061,15349,5216,15342,5391,15331,5577,15318,5770,15299,5967,15274,6150,15243,6223,15206,6280,15161,6310,15111,6317,15055,6300,14994,6262,14928,6208,14860,6141,14788,5994,14715,5838,14641,5684,14566,5529,14492,5384,14418,5247,14346,5121,14216,4892,14079,4682,13948,4496,13822,4330,15359,3498,15359,3501,15359,3520,15359,3598,15358,3719,15356,3860,15355,4137,15351,4305,15344,4563,15334,4809,15321,5116,15303,5273,15280,5418,15250,5547,15214,5653,15170,5722,15120,5761,15064,5763,15002,5733,14935,5673,14865,5597,14792,5504,14716,5400,14640,5294,14563,5185,14486,5041,14410,4841,14335,4655,14191,4482,14051,4325,13918,4183,13790,4012,15360,2282,15360,2285,15360,2306,15360,2401,15359,2547,15357,2748,15355,3103,15352,3349,15345,3675,15336,4020,15324,4272,15307,4496,15285,4716,15255,4908,15220,5086,15178,5170,15128,5214,15072,5234,15010,5231,14943,5206,14871,5166,14796,5102,14718,4971,14639,4833,14559,4687,14480,4541,14402,4401,14315,4268,14167,4142,14025,3958,13888,3747,13759,3556,15360,923,15360,925,15360,946,15360,1052,15359,1214,15357,1494,15356,1892,15352,2274,15346,2663,15338,3099,15326,3393,15309,3679,15288,3980,15260,4183,15226,4325,15185,4437,15136,4517,15080,4570,15018,4591,14950,4581,14877,4545,14800,4485,14720,4411,14638,4325,14556,4231,14475,4136,14395,3988,14297,3803,14145,3628,13999,3465,13861,3314,13729,3177,15360,263,15360,264,15360,272,15360,325,15359,407,15358,548,15356,780,15352,1144,15347,1580,15339,2099,15328,2425,15312,2795,15292,3133,15264,3329,15232,3517,15191,3689,15143,3819,15088,3923,15025,3978,14956,3999,14882,3979,14804,3931,14722,3855,14639,3756,14554,3645,14470,3529,14388,3409,14279,3289,14124,3173,13975,3055,13834,2848,13701,2658,15360,49,15360,49,15360,52,15360,75,15359,111,15358,201,15356,283,15353,519,15348,726,15340,1045,15329,1415,15314,1795,15295,2173,15269,2410,15237,2649,15197,2866,15150,3054,15095,3140,15032,3196,14963,3228,14888,3236,14808,3224,14725,3191,14639,3146,14553,3088,14466,2976,14382,2836,14262,2692,14103,2549,13952,2409,13808,2278,13674,2154,15360,4,15360,4,15360,4,15360,13,15359,33,15358,59,15357,112,15353,199,15348,302,15341,456,15331,628,15316,827,15297,1082,15272,1332,15241,1601,15202,1851,15156,2069,15101,2172,15039,2256,14970,2314,14894,2348,14813,2358,14728,2344,14640,2311,14551,2263,14463,2203,14376,2133,14247,2059,14084,1915,13930,1761,13784,1609,13648,1464,15360,0,15360,0,15360,0,15360,3,15359,18,15358,26,15357,53,15354,80,15348,97,15341,165,15332,238,15318,326,15299,427,15275,529,15245,654,15207,771,15161,885,15108,994,15046,1089,14976,1170,14900,1229,14817,1266,14731,1284,14641,1282,14550,1260,14460,1223,14370,1174,14232,1116,14066,1050,13909,981,13761,910,13623,839]);let kr=null;function _y(){return kr===null&&(kr=new Eo(my,32,32,Yf,ei),kr.minFilter=un,kr.magFilter=un,kr.wrapS=Hn,kr.wrapT=Hn,kr.generateMipmaps=!1,kr.needsUpdate=!0),kr}class gy{constructor(e={}){const{canvas:t=qm(),context:r=null,depth:a=!0,stencil:l=!1,alpha:u=!1,antialias:o=!1,premultipliedAlpha:p=!0,preserveDrawingBuffer:m=!1,powerPreference:g="default",failIfMajorPerformanceCaveat:x=!1,reversedDepthBuffer:y=!1}=e;this.isWebGLRenderer=!0;let S;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");S=r.getContextAttributes().alpha}else S=u;const T=new Set([Kf,jf,qf]),L=new Set([Jn,bi,vo,xo,Xf,$f]),E=new Uint32Array(4),b=new Int32Array(4);let V=null,H=null;const X=[],I=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Xr,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let F=!1;this._outputColorSpace=zn;let W=0,D=0,w=null,z=-1,B=null;const Y=new Qt,Z=new Qt;let j=null;const J=new zt(0);let ue=0,te=t.width,Se=t.height,be=1,Ye=null,ct=null;const pt=new Qt(0,0,te,Se),yt=new Qt(0,0,te,Se);let vt=!1;const _e=new xh;let ge=!1,Oe=!1;const Qe=new on,$e=new le,ft=new Qt,Lt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Re=!1;function lt(){return w===null?be:1}let $=r;function nt(U,Q){return t.getContext(U,Q)}try{const U={alpha:!0,depth:a,stencil:l,antialias:o,premultipliedAlpha:p,preserveDrawingBuffer:m,powerPreference:g,failIfMajorPerformanceCaveat:x};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Hf}`),t.addEventListener("webglcontextlost",Ee,!1),t.addEventListener("webglcontextrestored",pe,!1),t.addEventListener("webglcontextcreationerror",ze,!1),$===null){const Q="webgl2";if($=nt(Q,U),$===null)throw nt(Q)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(U){throw U("WebGLRenderer: "+U.message),U}let rt,ut,Ue,bt,qe,it,N,P,ne,he,de,ie,Ze,Fe,et,Ke,ve,fe,we,je,Be,Ve,q,Ie;function Pe(){rt=new wv($),rt.init(),Ve=new sy($,rt),ut=new _v($,rt,e,Ve),Ue=new ay($,rt),ut.reversedDepthBuffer&&y&&Ue.buffers.depth.setReversed(!0),bt=new Cv($),qe=new $x,it=new oy($,rt,Ue,qe,ut,Ve,bt),N=new vv(R),P=new Mv(R),ne=new L0($),q=new pv($,ne),he=new Tv($,ne,bt,q),de=new Pv($,he,ne,bt),we=new Rv($,ut,it),Ke=new gv(qe),ie=new Xx(R,N,P,rt,ut,q,Ke),Ze=new hy(R,qe),Fe=new Yx,et=new ey(rt),fe=new hv(R,N,P,Ue,de,S,p),ve=new ry(R,de,ut),Ie=new py($,bt,ut,Ue),je=new mv($,rt,bt),Be=new Av($,rt,bt),bt.programs=ie.programs,R.capabilities=ut,R.extensions=rt,R.properties=qe,R.renderLists=Fe,R.shadowMap=ve,R.state=Ue,R.info=bt}Pe();const Ce=new uy(R,$);this.xr=Ce,this.getContext=function(){return $},this.getContextAttributes=function(){return $.getContextAttributes()},this.forceContextLoss=function(){const U=rt.get("WEBGL_lose_context");U&&U.loseContext()},this.forceContextRestore=function(){const U=rt.get("WEBGL_lose_context");U&&U.restoreContext()},this.getPixelRatio=function(){return be},this.setPixelRatio=function(U){U!==void 0&&(be=U,this.setSize(te,Se,!1))},this.getSize=function(U){return U.set(te,Se)},this.setSize=function(U,Q,ae=!0){if(Ce.isPresenting){mt("WebGLRenderer: Can't change size while VR device is presenting.");return}te=U,Se=Q,t.width=Math.floor(U*be),t.height=Math.floor(Q*be),ae===!0&&(t.style.width=U+"px",t.style.height=Q+"px"),this.setViewport(0,0,U,Q)},this.getDrawingBufferSize=function(U){return U.set(te*be,Se*be).floor()},this.setDrawingBufferSize=function(U,Q,ae){te=U,Se=Q,be=ae,t.width=Math.floor(U*ae),t.height=Math.floor(Q*ae),this.setViewport(0,0,U,Q)},this.getCurrentViewport=function(U){return U.copy(Y)},this.getViewport=function(U){return U.copy(pt)},this.setViewport=function(U,Q,ae,oe){U.isVector4?pt.set(U.x,U.y,U.z,U.w):pt.set(U,Q,ae,oe),Ue.viewport(Y.copy(pt).multiplyScalar(be).round())},this.getScissor=function(U){return U.copy(yt)},this.setScissor=function(U,Q,ae,oe){U.isVector4?yt.set(U.x,U.y,U.z,U.w):yt.set(U,Q,ae,oe),Ue.scissor(Z.copy(yt).multiplyScalar(be).round())},this.getScissorTest=function(){return vt},this.setScissorTest=function(U){Ue.setScissorTest(vt=U)},this.setOpaqueSort=function(U){Ye=U},this.setTransparentSort=function(U){ct=U},this.getClearColor=function(U){return U.copy(fe.getClearColor())},this.setClearColor=function(){fe.setClearColor(...arguments)},this.getClearAlpha=function(){return fe.getClearAlpha()},this.setClearAlpha=function(){fe.setClearAlpha(...arguments)},this.clear=function(U=!0,Q=!0,ae=!0){let oe=0;if(U){let ee=!1;if(w!==null){const ye=w.texture.format;ee=T.has(ye)}if(ee){const ye=w.texture.type,Ne=L.has(ye),Me=fe.getClearColor(),We=fe.getClearAlpha(),Je=Me.r,tt=Me.g,at=Me.b;Ne?(E[0]=Je,E[1]=tt,E[2]=at,E[3]=We,$.clearBufferuiv($.COLOR,0,E)):(b[0]=Je,b[1]=tt,b[2]=at,b[3]=We,$.clearBufferiv($.COLOR,0,b))}else oe|=$.COLOR_BUFFER_BIT}Q&&(oe|=$.DEPTH_BUFFER_BIT),ae&&(oe|=$.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),$.clear(oe)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Ee,!1),t.removeEventListener("webglcontextrestored",pe,!1),t.removeEventListener("webglcontextcreationerror",ze,!1),fe.dispose(),Fe.dispose(),et.dispose(),qe.dispose(),N.dispose(),P.dispose(),de.dispose(),q.dispose(),Ie.dispose(),ie.dispose(),Ce.dispose(),Ce.removeEventListener("sessionstart",$n),Ce.removeEventListener("sessionend",er),A.stop()};function Ee(U){U.preventDefault(),Eu("WebGLRenderer: Context Lost."),F=!0}function pe(){Eu("WebGLRenderer: Context Restored."),F=!1;const U=bt.autoReset,Q=ve.enabled,ae=ve.autoUpdate,oe=ve.needsUpdate,ee=ve.type;Pe(),bt.autoReset=U,ve.enabled=Q,ve.autoUpdate=ae,ve.needsUpdate=oe,ve.type=ee}function ze(U){Jt("WebGLRenderer: A WebGL context could not be created. Reason: ",U.statusMessage)}function Te(U){const Q=U.target;Q.removeEventListener("dispose",Te),It(Q)}function It(U){Mt(U),qe.remove(U)}function Mt(U){const Q=qe.get(U).programs;Q!==void 0&&(Q.forEach(function(ae){ie.releaseProgram(ae)}),U.isShaderMaterial&&ie.releaseShaderCache(U))}this.renderBufferDirect=function(U,Q,ae,oe,ee,ye){Q===null&&(Q=Lt);const Ne=ee.isMesh&&ee.matrixWorld.determinant()<0,Me=Zt(U,Q,ae,oe,ee);Ue.setMaterial(oe,Ne);let We=ae.index,Je=1;if(oe.wireframe===!0){if(We=he.getWireframeAttribute(ae),We===void 0)return;Je=2}const tt=ae.drawRange,at=ae.attributes.position;let _t=tt.start*Je,wt=(tt.start+tt.count)*Je;ye!==null&&(_t=Math.max(_t,ye.start*Je),wt=Math.min(wt,(ye.start+ye.count)*Je)),We!==null?(_t=Math.max(_t,0),wt=Math.min(wt,We.count)):at!=null&&(_t=Math.max(_t,0),wt=Math.min(wt,at.count));const Nt=wt-_t;if(Nt<0||Nt===1/0)return;q.setup(ee,oe,Me,ae,We);let Ht,Pt=je;if(We!==null&&(Ht=ne.get(We),Pt=Be,Pt.setIndex(Ht)),ee.isMesh)oe.wireframe===!0?(Ue.setLineWidth(oe.wireframeLinewidth*lt()),Pt.setMode($.LINES)):Pt.setMode($.TRIANGLES);else if(ee.isLine){let ot=oe.linewidth;ot===void 0&&(ot=1),Ue.setLineWidth(ot*lt()),ee.isLineSegments?Pt.setMode($.LINES):ee.isLineLoop?Pt.setMode($.LINE_LOOP):Pt.setMode($.LINE_STRIP)}else ee.isPoints?Pt.setMode($.POINTS):ee.isSprite&&Pt.setMode($.TRIANGLES);if(ee.isBatchedMesh)if(ee._multiDrawInstances!==null)bo("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Pt.renderMultiDrawInstances(ee._multiDrawStarts,ee._multiDrawCounts,ee._multiDrawCount,ee._multiDrawInstances);else if(rt.get("WEBGL_multi_draw"))Pt.renderMultiDraw(ee._multiDrawStarts,ee._multiDrawCounts,ee._multiDrawCount);else{const ot=ee._multiDrawStarts,Ot=ee._multiDrawCounts,St=ee._multiDrawCount,hn=We?ne.get(We).bytesPerElement:1,Nn=qe.get(oe).currentProgram.getUniforms();for(let Wt=0;Wt<St;Wt++)Nn.setValue($,"_gl_DrawID",Wt),Pt.render(ot[Wt]/hn,Ot[Wt])}else if(ee.isInstancedMesh)Pt.renderInstances(_t,Nt,ee.count);else if(ae.isInstancedBufferGeometry){const ot=ae._maxInstanceCount!==void 0?ae._maxInstanceCount:1/0,Ot=Math.min(ae.instanceCount,ot);Pt.renderInstances(_t,Nt,Ot)}else Pt.render(_t,Nt)};function Sn(U,Q,ae){U.transparent===!0&&U.side===Gr&&U.forceSinglePass===!1?(U.side=In,U.needsUpdate=!0,Dr(U,Q,ae),U.side=Si,U.needsUpdate=!0,Dr(U,Q,ae),U.side=Gr):Dr(U,Q,ae)}this.compile=function(U,Q,ae=null){ae===null&&(ae=U),H=et.get(ae),H.init(Q),I.push(H),ae.traverseVisible(function(ee){ee.isLight&&ee.layers.test(Q.layers)&&(H.pushLight(ee),ee.castShadow&&H.pushShadow(ee))}),U!==ae&&U.traverseVisible(function(ee){ee.isLight&&ee.layers.test(Q.layers)&&(H.pushLight(ee),ee.castShadow&&H.pushShadow(ee))}),H.setupLights();const oe=new Set;return U.traverse(function(ee){if(!(ee.isMesh||ee.isPoints||ee.isLine||ee.isSprite))return;const ye=ee.material;if(ye)if(Array.isArray(ye))for(let Ne=0;Ne<ye.length;Ne++){const Me=ye[Ne];Sn(Me,ae,ee),oe.add(Me)}else Sn(ye,ae,ee),oe.add(ye)}),H=I.pop(),oe},this.compileAsync=function(U,Q,ae=null){const oe=this.compile(U,Q,ae);return new Promise(ee=>{function ye(){if(oe.forEach(function(Ne){qe.get(Ne).currentProgram.isReady()&&oe.delete(Ne)}),oe.size===0){ee(U);return}setTimeout(ye,10)}rt.get("KHR_parallel_shader_compile")!==null?ye():setTimeout(ye,10)})};let dn=null;function mr(U){dn&&dn(U)}function $n(){A.stop()}function er(){A.start()}const A=new Eh;A.setAnimationLoop(mr),typeof self<"u"&&A.setContext(self),this.setAnimationLoop=function(U){dn=U,Ce.setAnimationLoop(U),U===null?A.stop():A.start()},Ce.addEventListener("sessionstart",$n),Ce.addEventListener("sessionend",er),this.render=function(U,Q){if(Q!==void 0&&Q.isCamera!==!0){Jt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(F===!0)return;if(U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Q.parent===null&&Q.matrixWorldAutoUpdate===!0&&Q.updateMatrixWorld(),Ce.enabled===!0&&Ce.isPresenting===!0&&(Ce.cameraAutoUpdate===!0&&Ce.updateCamera(Q),Q=Ce.getCamera()),U.isScene===!0&&U.onBeforeRender(R,U,Q,w),H=et.get(U,I.length),H.init(Q),I.push(H),Qe.multiplyMatrices(Q.projectionMatrix,Q.matrixWorldInverse),_e.setFromProjectionMatrix(Qe,Tr,Q.reversedDepth),Oe=this.localClippingEnabled,ge=Ke.init(this.clippingPlanes,Oe),V=Fe.get(U,X.length),V.init(),X.push(V),Ce.enabled===!0&&Ce.isPresenting===!0){const ye=R.xr.getDepthSensingMesh();ye!==null&&Xt(ye,Q,-1/0,R.sortObjects)}Xt(U,Q,0,R.sortObjects),V.finish(),R.sortObjects===!0&&V.sort(Ye,ct),Re=Ce.enabled===!1||Ce.isPresenting===!1||Ce.hasDepthSensing()===!1,Re&&fe.addToRenderList(V,U),this.info.render.frame++,ge===!0&&Ke.beginShadows();const ae=H.state.shadowsArray;ve.render(ae,U,Q),ge===!0&&Ke.endShadows(),this.info.autoReset===!0&&this.info.reset();const oe=V.opaque,ee=V.transmissive;if(H.setupLights(),Q.isArrayCamera){const ye=Q.cameras;if(ee.length>0)for(let Ne=0,Me=ye.length;Ne<Me;Ne++){const We=ye[Ne];Ki(oe,ee,U,We)}Re&&fe.render(U);for(let Ne=0,Me=ye.length;Ne<Me;Ne++){const We=ye[Ne];Mi(V,U,We,We.viewport)}}else ee.length>0&&Ki(oe,ee,U,Q),Re&&fe.render(U),Mi(V,U,Q);w!==null&&D===0&&(it.updateMultisampleRenderTarget(w),it.updateRenderTargetMipmap(w)),U.isScene===!0&&U.onAfterRender(R,U,Q),q.resetDefaultState(),z=-1,B=null,I.pop(),I.length>0?(H=I[I.length-1],ge===!0&&Ke.setGlobalState(R.clippingPlanes,H.state.camera)):H=null,X.pop(),X.length>0?V=X[X.length-1]:V=null};function Xt(U,Q,ae,oe){if(U.visible===!1)return;if(U.layers.test(Q.layers)){if(U.isGroup)ae=U.renderOrder;else if(U.isLOD)U.autoUpdate===!0&&U.update(Q);else if(U.isLight)H.pushLight(U),U.castShadow&&H.pushShadow(U);else if(U.isSprite){if(!U.frustumCulled||_e.intersectsSprite(U)){oe&&ft.setFromMatrixPosition(U.matrixWorld).applyMatrix4(Qe);const Ne=de.update(U),Me=U.material;Me.visible&&V.push(U,Ne,Me,ae,ft.z,null)}}else if((U.isMesh||U.isLine||U.isPoints)&&(!U.frustumCulled||_e.intersectsObject(U))){const Ne=de.update(U),Me=U.material;if(oe&&(U.boundingSphere!==void 0?(U.boundingSphere===null&&U.computeBoundingSphere(),ft.copy(U.boundingSphere.center)):(Ne.boundingSphere===null&&Ne.computeBoundingSphere(),ft.copy(Ne.boundingSphere.center)),ft.applyMatrix4(U.matrixWorld).applyMatrix4(Qe)),Array.isArray(Me)){const We=Ne.groups;for(let Je=0,tt=We.length;Je<tt;Je++){const at=We[Je],_t=Me[at.materialIndex];_t&&_t.visible&&V.push(U,Ne,_t,ae,ft.z,at)}}else Me.visible&&V.push(U,Ne,Me,ae,ft.z,null)}}const ye=U.children;for(let Ne=0,Me=ye.length;Ne<Me;Ne++)Xt(ye[Ne],Q,ae,oe)}function Mi(U,Q,ae,oe){const{opaque:ee,transmissive:ye,transparent:Ne}=U;H.setupLightsView(ae),ge===!0&&Ke.setGlobalState(R.clippingPlanes,ae),oe&&Ue.viewport(Y.copy(oe)),ee.length>0&&ti(ee,Q,ae),ye.length>0&&ti(ye,Q,ae),Ne.length>0&&ti(Ne,Q,ae),Ue.buffers.depth.setTest(!0),Ue.buffers.depth.setMask(!0),Ue.buffers.color.setMask(!0),Ue.setPolygonOffset(!1)}function Ki(U,Q,ae,oe){if((ae.isScene===!0?ae.overrideMaterial:null)!==null)return;H.state.transmissionRenderTarget[oe.id]===void 0&&(H.state.transmissionRenderTarget[oe.id]=new qr(1,1,{generateMipmaps:!0,type:rt.has("EXT_color_buffer_half_float")||rt.has("EXT_color_buffer_float")?ei:Jn,minFilter:Gi,samples:4,stencilBuffer:l,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Rt.workingColorSpace}));const ye=H.state.transmissionRenderTarget[oe.id],Ne=oe.viewport||Y;ye.setSize(Ne.z*R.transmissionResolutionScale,Ne.w*R.transmissionResolutionScale);const Me=R.getRenderTarget(),We=R.getActiveCubeFace(),Je=R.getActiveMipmapLevel();R.setRenderTarget(ye),R.getClearColor(J),ue=R.getClearAlpha(),ue<1&&R.setClearColor(16777215,.5),R.clear(),Re&&fe.render(ae);const tt=R.toneMapping;R.toneMapping=Xr;const at=oe.viewport;if(oe.viewport!==void 0&&(oe.viewport=void 0),H.setupLightsView(oe),ge===!0&&Ke.setGlobalState(R.clippingPlanes,oe),ti(U,ae,oe),it.updateMultisampleRenderTarget(ye),it.updateRenderTargetMipmap(ye),rt.has("WEBGL_multisampled_render_to_texture")===!1){let _t=!1;for(let wt=0,Nt=Q.length;wt<Nt;wt++){const Ht=Q[wt],{object:Pt,geometry:ot,material:Ot,group:St}=Ht;if(Ot.side===Gr&&Pt.layers.test(oe.layers)){const hn=Ot.side;Ot.side=In,Ot.needsUpdate=!0,Zi(Pt,ae,oe,ot,Ot,St),Ot.side=hn,Ot.needsUpdate=!0,_t=!0}}_t===!0&&(it.updateMultisampleRenderTarget(ye),it.updateRenderTargetMipmap(ye))}R.setRenderTarget(Me,We,Je),R.setClearColor(J,ue),at!==void 0&&(oe.viewport=at),R.toneMapping=tt}function ti(U,Q,ae){const oe=Q.isScene===!0?Q.overrideMaterial:null;for(let ee=0,ye=U.length;ee<ye;ee++){const Ne=U[ee],{object:Me,geometry:We,group:Je}=Ne;let tt=Ne.material;tt.allowOverride===!0&&oe!==null&&(tt=oe),Me.layers.test(ae.layers)&&Zi(Me,Q,ae,We,tt,Je)}}function Zi(U,Q,ae,oe,ee,ye){U.onBeforeRender(R,Q,ae,oe,ee,ye),U.modelViewMatrix.multiplyMatrices(ae.matrixWorldInverse,U.matrixWorld),U.normalMatrix.getNormalMatrix(U.modelViewMatrix),ee.onBeforeRender(R,Q,ae,oe,U,ye),ee.transparent===!0&&ee.side===Gr&&ee.forceSinglePass===!1?(ee.side=In,ee.needsUpdate=!0,R.renderBufferDirect(ae,Q,oe,ee,U,ye),ee.side=Si,ee.needsUpdate=!0,R.renderBufferDirect(ae,Q,oe,ee,U,ye),ee.side=Gr):R.renderBufferDirect(ae,Q,oe,ee,U,ye),U.onAfterRender(R,Q,ae,oe,ee,ye)}function Dr(U,Q,ae){Q.isScene!==!0&&(Q=Lt);const oe=qe.get(U),ee=H.state.lights,ye=H.state.shadowsArray,Ne=ee.state.version,Me=ie.getParameters(U,ee.state,ye,Q,ae),We=ie.getProgramCacheKey(Me);let Je=oe.programs;oe.environment=U.isMeshStandardMaterial?Q.environment:null,oe.fog=Q.fog,oe.envMap=(U.isMeshStandardMaterial?P:N).get(U.envMap||oe.environment),oe.envMapRotation=oe.environment!==null&&U.envMap===null?Q.environmentRotation:U.envMapRotation,Je===void 0&&(U.addEventListener("dispose",Te),Je=new Map,oe.programs=Je);let tt=Je.get(We);if(tt!==void 0){if(oe.currentProgram===tt&&oe.lightsStateVersion===Ne)return Lr(U,Me),tt}else Me.uniforms=ie.getUniforms(U),U.onBeforeCompile(Me,R),tt=ie.acquireProgram(Me,We),Je.set(We,tt),oe.uniforms=Me.uniforms;const at=oe.uniforms;return(!U.isShaderMaterial&&!U.isRawShaderMaterial||U.clipping===!0)&&(at.clippingPlanes=Ke.uniform),Lr(U,Me),oe.needsLights=nn(U),oe.lightsStateVersion=Ne,oe.needsLights&&(at.ambientLightColor.value=ee.state.ambient,at.lightProbe.value=ee.state.probe,at.directionalLights.value=ee.state.directional,at.directionalLightShadows.value=ee.state.directionalShadow,at.spotLights.value=ee.state.spot,at.spotLightShadows.value=ee.state.spotShadow,at.rectAreaLights.value=ee.state.rectArea,at.ltc_1.value=ee.state.rectAreaLTC1,at.ltc_2.value=ee.state.rectAreaLTC2,at.pointLights.value=ee.state.point,at.pointLightShadows.value=ee.state.pointShadow,at.hemisphereLights.value=ee.state.hemi,at.directionalShadowMap.value=ee.state.directionalShadowMap,at.directionalShadowMatrix.value=ee.state.directionalShadowMatrix,at.spotShadowMap.value=ee.state.spotShadowMap,at.spotLightMatrix.value=ee.state.spotLightMatrix,at.spotLightMap.value=ee.state.spotLightMap,at.pointShadowMap.value=ee.state.pointShadowMap,at.pointShadowMatrix.value=ee.state.pointShadowMatrix),oe.currentProgram=tt,oe.uniformsList=null,tt}function Yt(U){if(U.uniformsList===null){const Q=U.currentProgram.getUniforms();U.uniformsList=Ps.seqWithValue(Q.seq,U.uniforms)}return U.uniformsList}function Lr(U,Q){const ae=qe.get(U);ae.outputColorSpace=Q.outputColorSpace,ae.batching=Q.batching,ae.batchingColor=Q.batchingColor,ae.instancing=Q.instancing,ae.instancingColor=Q.instancingColor,ae.instancingMorph=Q.instancingMorph,ae.skinning=Q.skinning,ae.morphTargets=Q.morphTargets,ae.morphNormals=Q.morphNormals,ae.morphColors=Q.morphColors,ae.morphTargetsCount=Q.morphTargetsCount,ae.numClippingPlanes=Q.numClippingPlanes,ae.numIntersection=Q.numClipIntersection,ae.vertexAlphas=Q.vertexAlphas,ae.vertexTangents=Q.vertexTangents,ae.toneMapping=Q.toneMapping}function Zt(U,Q,ae,oe,ee){Q.isScene!==!0&&(Q=Lt),it.resetTextureUnits();const ye=Q.fog,Ne=oe.isMeshStandardMaterial?Q.environment:null,Me=w===null?R.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:Rr,We=(oe.isMeshStandardMaterial?P:N).get(oe.envMap||Ne),Je=oe.vertexColors===!0&&!!ae.attributes.color&&ae.attributes.color.itemSize===4,tt=!!ae.attributes.tangent&&(!!oe.normalMap||oe.anisotropy>0),at=!!ae.morphAttributes.position,_t=!!ae.morphAttributes.normal,wt=!!ae.morphAttributes.color;let Nt=Xr;oe.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(Nt=R.toneMapping);const Ht=ae.morphAttributes.position||ae.morphAttributes.normal||ae.morphAttributes.color,Pt=Ht!==void 0?Ht.length:0,ot=qe.get(oe),Ot=H.state.lights;if(ge===!0&&(Oe===!0||U!==B)){const $t=U===B&&oe.id===z;Ke.setState(oe,U,$t)}let St=!1;oe.version===ot.__version?(ot.needsLights&&ot.lightsStateVersion!==Ot.state.version||ot.outputColorSpace!==Me||ee.isBatchedMesh&&ot.batching===!1||!ee.isBatchedMesh&&ot.batching===!0||ee.isBatchedMesh&&ot.batchingColor===!0&&ee.colorTexture===null||ee.isBatchedMesh&&ot.batchingColor===!1&&ee.colorTexture!==null||ee.isInstancedMesh&&ot.instancing===!1||!ee.isInstancedMesh&&ot.instancing===!0||ee.isSkinnedMesh&&ot.skinning===!1||!ee.isSkinnedMesh&&ot.skinning===!0||ee.isInstancedMesh&&ot.instancingColor===!0&&ee.instanceColor===null||ee.isInstancedMesh&&ot.instancingColor===!1&&ee.instanceColor!==null||ee.isInstancedMesh&&ot.instancingMorph===!0&&ee.morphTexture===null||ee.isInstancedMesh&&ot.instancingMorph===!1&&ee.morphTexture!==null||ot.envMap!==We||oe.fog===!0&&ot.fog!==ye||ot.numClippingPlanes!==void 0&&(ot.numClippingPlanes!==Ke.numPlanes||ot.numIntersection!==Ke.numIntersection)||ot.vertexAlphas!==Je||ot.vertexTangents!==tt||ot.morphTargets!==at||ot.morphNormals!==_t||ot.morphColors!==wt||ot.toneMapping!==Nt||ot.morphTargetsCount!==Pt)&&(St=!0):(St=!0,ot.__version=oe.version);let hn=ot.currentProgram;St===!0&&(hn=Dr(oe,Q,ee));let Nn=!1,Wt=!1,rn=!1;const Dt=hn.getUniforms(),cn=ot.uniforms;if(Ue.useProgram(hn.program)&&(Nn=!0,Wt=!0,rn=!0),oe.id!==z&&(z=oe.id,Wt=!0),Nn||B!==U){Ue.buffers.depth.getReversed()&&U.reversedDepth!==!0&&(U._reversedDepth=!0,U.updateProjectionMatrix()),Dt.setValue($,"projectionMatrix",U.projectionMatrix),Dt.setValue($,"viewMatrix",U.matrixWorldInverse);const an=Dt.map.cameraPosition;an!==void 0&&an.setValue($,$e.setFromMatrixPosition(U.matrixWorld)),ut.logarithmicDepthBuffer&&Dt.setValue($,"logDepthBufFC",2/(Math.log(U.far+1)/Math.LN2)),(oe.isMeshPhongMaterial||oe.isMeshToonMaterial||oe.isMeshLambertMaterial||oe.isMeshBasicMaterial||oe.isMeshStandardMaterial||oe.isShaderMaterial)&&Dt.setValue($,"isOrthographic",U.isOrthographicCamera===!0),B!==U&&(B=U,Wt=!0,rn=!0)}if(ee.isSkinnedMesh){Dt.setOptional($,ee,"bindMatrix"),Dt.setOptional($,ee,"bindMatrixInverse");const $t=ee.skeleton;$t&&($t.boneTexture===null&&$t.computeBoneTexture(),Dt.setValue($,"boneTexture",$t.boneTexture,it))}ee.isBatchedMesh&&(Dt.setOptional($,ee,"batchingTexture"),Dt.setValue($,"batchingTexture",ee._matricesTexture,it),Dt.setOptional($,ee,"batchingIdTexture"),Dt.setValue($,"batchingIdTexture",ee._indirectTexture,it),Dt.setOptional($,ee,"batchingColorTexture"),ee._colorsTexture!==null&&Dt.setValue($,"batchingColorTexture",ee._colorsTexture,it));const en=ae.morphAttributes;if((en.position!==void 0||en.normal!==void 0||en.color!==void 0)&&we.update(ee,ae,hn),(Wt||ot.receiveShadow!==ee.receiveShadow)&&(ot.receiveShadow=ee.receiveShadow,Dt.setValue($,"receiveShadow",ee.receiveShadow)),oe.isMeshGouraudMaterial&&oe.envMap!==null&&(cn.envMap.value=We,cn.flipEnvMap.value=We.isCubeTexture&&We.isRenderTargetTexture===!1?-1:1),oe.isMeshStandardMaterial&&oe.envMap===null&&Q.environment!==null&&(cn.envMapIntensity.value=Q.environmentIntensity),cn.dfgLUT!==void 0&&(cn.dfgLUT.value=_y()),Wt&&(Dt.setValue($,"toneMappingExposure",R.toneMappingExposure),ot.needsLights&&_r(cn,rn),ye&&oe.fog===!0&&Ze.refreshFogUniforms(cn,ye),Ze.refreshMaterialUniforms(cn,oe,be,Se,H.state.transmissionRenderTarget[U.id]),Ps.upload($,Yt(ot),cn,it)),oe.isShaderMaterial&&oe.uniformsNeedUpdate===!0&&(Ps.upload($,Yt(ot),cn,it),oe.uniformsNeedUpdate=!1),oe.isSpriteMaterial&&Dt.setValue($,"center",ee.center),Dt.setValue($,"modelViewMatrix",ee.modelViewMatrix),Dt.setValue($,"normalMatrix",ee.normalMatrix),Dt.setValue($,"modelMatrix",ee.matrixWorld),oe.isShaderMaterial||oe.isRawShaderMaterial){const $t=oe.uniformsGroups;for(let an=0,ri=$t.length;an<ri;an++){const Cn=$t[an];Ie.update(Cn,hn),Ie.bind(Cn,hn)}}return hn}function _r(U,Q){U.ambientLightColor.needsUpdate=Q,U.lightProbe.needsUpdate=Q,U.directionalLights.needsUpdate=Q,U.directionalLightShadows.needsUpdate=Q,U.pointLights.needsUpdate=Q,U.pointLightShadows.needsUpdate=Q,U.spotLights.needsUpdate=Q,U.spotLightShadows.needsUpdate=Q,U.rectAreaLights.needsUpdate=Q,U.hemisphereLights.needsUpdate=Q}function nn(U){return U.isMeshLambertMaterial||U.isMeshToonMaterial||U.isMeshPhongMaterial||U.isMeshStandardMaterial||U.isShadowMaterial||U.isShaderMaterial&&U.lights===!0}this.getActiveCubeFace=function(){return W},this.getActiveMipmapLevel=function(){return D},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(U,Q,ae){const oe=qe.get(U);oe.__autoAllocateDepthBuffer=U.resolveDepthBuffer===!1,oe.__autoAllocateDepthBuffer===!1&&(oe.__useRenderToTexture=!1),qe.get(U.texture).__webglTexture=Q,qe.get(U.depthTexture).__webglTexture=oe.__autoAllocateDepthBuffer?void 0:ae,oe.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(U,Q){const ae=qe.get(U);ae.__webglFramebuffer=Q,ae.__useDefaultFramebuffer=Q===void 0};const bn=$.createFramebuffer();this.setRenderTarget=function(U,Q=0,ae=0){w=U,W=Q,D=ae;let oe=!0,ee=null,ye=!1,Ne=!1;if(U){const We=qe.get(U);if(We.__useDefaultFramebuffer!==void 0)Ue.bindFramebuffer($.FRAMEBUFFER,null),oe=!1;else if(We.__webglFramebuffer===void 0)it.setupRenderTarget(U);else if(We.__hasExternalTextures)it.rebindTextures(U,qe.get(U.texture).__webglTexture,qe.get(U.depthTexture).__webglTexture);else if(U.depthBuffer){const at=U.depthTexture;if(We.__boundDepthTexture!==at){if(at!==null&&qe.has(at)&&(U.width!==at.image.width||U.height!==at.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");it.setupDepthRenderbuffer(U)}}const Je=U.texture;(Je.isData3DTexture||Je.isDataArrayTexture||Je.isCompressedArrayTexture)&&(Ne=!0);const tt=qe.get(U).__webglFramebuffer;U.isWebGLCubeRenderTarget?(Array.isArray(tt[Q])?ee=tt[Q][ae]:ee=tt[Q],ye=!0):U.samples>0&&it.useMultisampledRTT(U)===!1?ee=qe.get(U).__webglMultisampledFramebuffer:Array.isArray(tt)?ee=tt[ae]:ee=tt,Y.copy(U.viewport),Z.copy(U.scissor),j=U.scissorTest}else Y.copy(pt).multiplyScalar(be).floor(),Z.copy(yt).multiplyScalar(be).floor(),j=vt;if(ae!==0&&(ee=bn),Ue.bindFramebuffer($.FRAMEBUFFER,ee)&&oe&&Ue.drawBuffers(U,ee),Ue.viewport(Y),Ue.scissor(Z),Ue.setScissorTest(j),ye){const We=qe.get(U.texture);$.framebufferTexture2D($.FRAMEBUFFER,$.COLOR_ATTACHMENT0,$.TEXTURE_CUBE_MAP_POSITIVE_X+Q,We.__webglTexture,ae)}else if(Ne){const We=Q;for(let Je=0;Je<U.textures.length;Je++){const tt=qe.get(U.textures[Je]);$.framebufferTextureLayer($.FRAMEBUFFER,$.COLOR_ATTACHMENT0+Je,tt.__webglTexture,ae,We)}}else if(U!==null&&ae!==0){const We=qe.get(U.texture);$.framebufferTexture2D($.FRAMEBUFFER,$.COLOR_ATTACHMENT0,$.TEXTURE_2D,We.__webglTexture,ae)}z=-1},this.readRenderTargetPixels=function(U,Q,ae,oe,ee,ye,Ne,Me=0){if(!(U&&U.isWebGLRenderTarget)){Jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let We=qe.get(U).__webglFramebuffer;if(U.isWebGLCubeRenderTarget&&Ne!==void 0&&(We=We[Ne]),We){Ue.bindFramebuffer($.FRAMEBUFFER,We);try{const Je=U.textures[Me],tt=Je.format,at=Je.type;if(!ut.textureFormatReadable(tt)){Jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ut.textureTypeReadable(at)){Jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Q>=0&&Q<=U.width-oe&&ae>=0&&ae<=U.height-ee&&(U.textures.length>1&&$.readBuffer($.COLOR_ATTACHMENT0+Me),$.readPixels(Q,ae,oe,ee,Ve.convert(tt),Ve.convert(at),ye))}finally{const Je=w!==null?qe.get(w).__webglFramebuffer:null;Ue.bindFramebuffer($.FRAMEBUFFER,Je)}}},this.readRenderTargetPixelsAsync=async function(U,Q,ae,oe,ee,ye,Ne,Me=0){if(!(U&&U.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let We=qe.get(U).__webglFramebuffer;if(U.isWebGLCubeRenderTarget&&Ne!==void 0&&(We=We[Ne]),We)if(Q>=0&&Q<=U.width-oe&&ae>=0&&ae<=U.height-ee){Ue.bindFramebuffer($.FRAMEBUFFER,We);const Je=U.textures[Me],tt=Je.format,at=Je.type;if(!ut.textureFormatReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ut.textureTypeReadable(at))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const _t=$.createBuffer();$.bindBuffer($.PIXEL_PACK_BUFFER,_t),$.bufferData($.PIXEL_PACK_BUFFER,ye.byteLength,$.STREAM_READ),U.textures.length>1&&$.readBuffer($.COLOR_ATTACHMENT0+Me),$.readPixels(Q,ae,oe,ee,Ve.convert(tt),Ve.convert(at),0);const wt=w!==null?qe.get(w).__webglFramebuffer:null;Ue.bindFramebuffer($.FRAMEBUFFER,wt);const Nt=$.fenceSync($.SYNC_GPU_COMMANDS_COMPLETE,0);return $.flush(),await Ym($,Nt,4),$.bindBuffer($.PIXEL_PACK_BUFFER,_t),$.getBufferSubData($.PIXEL_PACK_BUFFER,0,ye),$.deleteBuffer(_t),$.deleteSync(Nt),ye}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(U,Q=null,ae=0){const oe=Math.pow(2,-ae),ee=Math.floor(U.image.width*oe),ye=Math.floor(U.image.height*oe),Ne=Q!==null?Q.x:0,Me=Q!==null?Q.y:0;it.setTexture2D(U,0),$.copyTexSubImage2D($.TEXTURE_2D,ae,0,0,Ne,Me,ee,ye),Ue.unbindTexture()};const Ji=$.createFramebuffer(),ni=$.createFramebuffer();this.copyTextureToTexture=function(U,Q,ae=null,oe=null,ee=0,ye=null){ye===null&&(ee!==0?(bo("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ye=ee,ee=0):ye=0);let Ne,Me,We,Je,tt,at,_t,wt,Nt;const Ht=U.isCompressedTexture?U.mipmaps[ye]:U.image;if(ae!==null)Ne=ae.max.x-ae.min.x,Me=ae.max.y-ae.min.y,We=ae.isBox3?ae.max.z-ae.min.z:1,Je=ae.min.x,tt=ae.min.y,at=ae.isBox3?ae.min.z:0;else{const en=Math.pow(2,-ee);Ne=Math.floor(Ht.width*en),Me=Math.floor(Ht.height*en),U.isDataArrayTexture?We=Ht.depth:U.isData3DTexture?We=Math.floor(Ht.depth*en):We=1,Je=0,tt=0,at=0}oe!==null?(_t=oe.x,wt=oe.y,Nt=oe.z):(_t=0,wt=0,Nt=0);const Pt=Ve.convert(Q.format),ot=Ve.convert(Q.type);let Ot;Q.isData3DTexture?(it.setTexture3D(Q,0),Ot=$.TEXTURE_3D):Q.isDataArrayTexture||Q.isCompressedArrayTexture?(it.setTexture2DArray(Q,0),Ot=$.TEXTURE_2D_ARRAY):(it.setTexture2D(Q,0),Ot=$.TEXTURE_2D),$.pixelStorei($.UNPACK_FLIP_Y_WEBGL,Q.flipY),$.pixelStorei($.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Q.premultiplyAlpha),$.pixelStorei($.UNPACK_ALIGNMENT,Q.unpackAlignment);const St=$.getParameter($.UNPACK_ROW_LENGTH),hn=$.getParameter($.UNPACK_IMAGE_HEIGHT),Nn=$.getParameter($.UNPACK_SKIP_PIXELS),Wt=$.getParameter($.UNPACK_SKIP_ROWS),rn=$.getParameter($.UNPACK_SKIP_IMAGES);$.pixelStorei($.UNPACK_ROW_LENGTH,Ht.width),$.pixelStorei($.UNPACK_IMAGE_HEIGHT,Ht.height),$.pixelStorei($.UNPACK_SKIP_PIXELS,Je),$.pixelStorei($.UNPACK_SKIP_ROWS,tt),$.pixelStorei($.UNPACK_SKIP_IMAGES,at);const Dt=U.isDataArrayTexture||U.isData3DTexture,cn=Q.isDataArrayTexture||Q.isData3DTexture;if(U.isDepthTexture){const en=qe.get(U),$t=qe.get(Q),an=qe.get(en.__renderTarget),ri=qe.get($t.__renderTarget);Ue.bindFramebuffer($.READ_FRAMEBUFFER,an.__webglFramebuffer),Ue.bindFramebuffer($.DRAW_FRAMEBUFFER,ri.__webglFramebuffer);for(let Cn=0;Cn<We;Cn++)Dt&&($.framebufferTextureLayer($.READ_FRAMEBUFFER,$.COLOR_ATTACHMENT0,qe.get(U).__webglTexture,ee,at+Cn),$.framebufferTextureLayer($.DRAW_FRAMEBUFFER,$.COLOR_ATTACHMENT0,qe.get(Q).__webglTexture,ye,Nt+Cn)),$.blitFramebuffer(Je,tt,Ne,Me,_t,wt,Ne,Me,$.DEPTH_BUFFER_BIT,$.NEAREST);Ue.bindFramebuffer($.READ_FRAMEBUFFER,null),Ue.bindFramebuffer($.DRAW_FRAMEBUFFER,null)}else if(ee!==0||U.isRenderTargetTexture||qe.has(U)){const en=qe.get(U),$t=qe.get(Q);Ue.bindFramebuffer($.READ_FRAMEBUFFER,Ji),Ue.bindFramebuffer($.DRAW_FRAMEBUFFER,ni);for(let an=0;an<We;an++)Dt?$.framebufferTextureLayer($.READ_FRAMEBUFFER,$.COLOR_ATTACHMENT0,en.__webglTexture,ee,at+an):$.framebufferTexture2D($.READ_FRAMEBUFFER,$.COLOR_ATTACHMENT0,$.TEXTURE_2D,en.__webglTexture,ee),cn?$.framebufferTextureLayer($.DRAW_FRAMEBUFFER,$.COLOR_ATTACHMENT0,$t.__webglTexture,ye,Nt+an):$.framebufferTexture2D($.DRAW_FRAMEBUFFER,$.COLOR_ATTACHMENT0,$.TEXTURE_2D,$t.__webglTexture,ye),ee!==0?$.blitFramebuffer(Je,tt,Ne,Me,_t,wt,Ne,Me,$.COLOR_BUFFER_BIT,$.NEAREST):cn?$.copyTexSubImage3D(Ot,ye,_t,wt,Nt+an,Je,tt,Ne,Me):$.copyTexSubImage2D(Ot,ye,_t,wt,Je,tt,Ne,Me);Ue.bindFramebuffer($.READ_FRAMEBUFFER,null),Ue.bindFramebuffer($.DRAW_FRAMEBUFFER,null)}else cn?U.isDataTexture||U.isData3DTexture?$.texSubImage3D(Ot,ye,_t,wt,Nt,Ne,Me,We,Pt,ot,Ht.data):Q.isCompressedArrayTexture?$.compressedTexSubImage3D(Ot,ye,_t,wt,Nt,Ne,Me,We,Pt,Ht.data):$.texSubImage3D(Ot,ye,_t,wt,Nt,Ne,Me,We,Pt,ot,Ht):U.isDataTexture?$.texSubImage2D($.TEXTURE_2D,ye,_t,wt,Ne,Me,Pt,ot,Ht.data):U.isCompressedTexture?$.compressedTexSubImage2D($.TEXTURE_2D,ye,_t,wt,Ht.width,Ht.height,Pt,Ht.data):$.texSubImage2D($.TEXTURE_2D,ye,_t,wt,Ne,Me,Pt,ot,Ht);$.pixelStorei($.UNPACK_ROW_LENGTH,St),$.pixelStorei($.UNPACK_IMAGE_HEIGHT,hn),$.pixelStorei($.UNPACK_SKIP_PIXELS,Nn),$.pixelStorei($.UNPACK_SKIP_ROWS,Wt),$.pixelStorei($.UNPACK_SKIP_IMAGES,rn),ye===0&&Q.generateMipmaps&&$.generateMipmap(Ot),Ue.unbindTexture()},this.initRenderTarget=function(U){qe.get(U).__webglFramebuffer===void 0&&it.setupRenderTarget(U)},this.initTexture=function(U){U.isCubeTexture?it.setTextureCube(U,0):U.isData3DTexture?it.setTexture3D(U,0):U.isDataArrayTexture||U.isCompressedArrayTexture?it.setTexture2DArray(U,0):it.setTexture2D(U,0),Ue.unbindTexture()},this.resetState=function(){W=0,D=0,w=null,Ue.reset(),q.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Tr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Rt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Rt._getUnpackColorSpace()}}const Ch=(n,e,t)=>{let r;switch(n){case Jn:r=new Uint8ClampedArray(e*t*4);break;case ei:r=new Uint16Array(e*t*4);break;case bi:r=new Uint32Array(e*t*4);break;case Vf:r=new Int8Array(e*t*4);break;case Wf:r=new Int16Array(e*t*4);break;case $s:r=new Int32Array(e*t*4);break;case Zn:r=new Float32Array(e*t*4);break;default:throw new Error("Unsupported data type")}return r};let bs;const vy=(n,e,t,r)=>{if(bs!==void 0)return bs;const a=new qr(1,1,r);e.setRenderTarget(a);const l=new Pr(new za,new Qf({color:16777215}));e.render(l,t),e.setRenderTarget(null);const u=Ch(n,a.width,a.height);return e.readRenderTargetPixels(a,0,0,a.width,a.height,u),a.dispose(),l.geometry.dispose(),l.material.dispose(),bs=u[0]!==0,bs};class Ks{_renderer;_rendererIsDisposable=!1;_material;_scene;_camera;_quad;_renderTarget;_width;_height;_type;_colorSpace;_supportsReadPixels=!0;constructor(e){this._width=e.width,this._height=e.height,this._type=e.type,this._colorSpace=e.colorSpace;const t={format:An,depthBuffer:!1,stencilBuffer:!1,type:this._type,colorSpace:this._colorSpace,anisotropy:e.renderTargetOptions?.anisotropy!==void 0?e.renderTargetOptions?.anisotropy:1,generateMipmaps:e.renderTargetOptions?.generateMipmaps!==void 0?e.renderTargetOptions?.generateMipmaps:!1,magFilter:e.renderTargetOptions?.magFilter!==void 0?e.renderTargetOptions?.magFilter:un,minFilter:e.renderTargetOptions?.minFilter!==void 0?e.renderTargetOptions?.minFilter:un,samples:e.renderTargetOptions?.samples!==void 0?e.renderTargetOptions?.samples:void 0,wrapS:e.renderTargetOptions?.wrapS!==void 0?e.renderTargetOptions?.wrapS:Hn,wrapT:e.renderTargetOptions?.wrapT!==void 0?e.renderTargetOptions?.wrapT:Hn};if(this._material=e.material,e.renderer?this._renderer=e.renderer:(this._renderer=Ks.instantiateRenderer(),this._rendererIsDisposable=!0),this._scene=new M0,this._camera=new bh,this._camera.position.set(0,0,10),this._camera.left=-.5,this._camera.right=.5,this._camera.top=.5,this._camera.bottom=-.5,this._camera.updateProjectionMatrix(),!vy(this._type,this._renderer,this._camera,t)){let r;switch(this._type){case ei:r=this._renderer.extensions.has("EXT_color_buffer_float")?Zn:void 0;break}r!==void 0?(console.warn(`This browser does not support reading pixels from ${this._type} RenderTargets, switching to ${Zn}`),this._type=r):(this._supportsReadPixels=!1,console.warn("This browser dos not support toArray or toDataTexture, calls to those methods will result in an error thrown"))}this._quad=new Pr(new za,this._material),this._quad.geometry.computeBoundingBox(),this._scene.add(this._quad),this._renderTarget=new qr(this.width,this.height,t),this._renderTarget.texture.mapping=e.renderTargetOptions?.mapping!==void 0?e.renderTargetOptions?.mapping:_o}static instantiateRenderer(){const e=new gy;return e.setSize(128,128),e}render=()=>{this._renderer.setRenderTarget(this._renderTarget);try{this._renderer.render(this._scene,this._camera)}catch(e){throw this._renderer.setRenderTarget(null),e}this._renderer.setRenderTarget(null)};toArray(){if(!this._supportsReadPixels)throw new Error("Can't read pixels in this browser");const e=Ch(this._type,this._width,this._height);return this._renderer.readRenderTargetPixels(this._renderTarget,0,0,this._width,this._height,e),e}toDataTexture(e){const t=new Eo(this.toArray(),this.width,this.height,An,this._type,e?.mapping||_o,e?.wrapS||Hn,e?.wrapT||Hn,e?.magFilter||un,e?.minFilter||un,e?.anisotropy||1,Rr);return t.generateMipmaps=e?.generateMipmaps!==void 0?e?.generateMipmaps:!1,t}disposeOnDemandRenderer(){this._renderer.setRenderTarget(null),this._rendererIsDisposable&&(this._renderer.dispose(),this._renderer.forceContextLoss())}dispose(e){this.disposeOnDemandRenderer(),e&&this.renderTarget.dispose(),this.material instanceof Qn&&Object.values(this.material.uniforms).forEach(t=>{t.value instanceof pn&&t.value.dispose()}),Object.values(this.material).forEach(t=>{t instanceof pn&&t.dispose()}),this.material.dispose(),this._quad.geometry.dispose()}get width(){return this._width}set width(e){this._width=e,this._renderTarget.setSize(this._width,this._height)}get height(){return this._height}set height(e){this._height=e,this._renderTarget.setSize(this._width,this._height)}get renderer(){return this._renderer}get renderTarget(){return this._renderTarget}set renderTarget(e){this._renderTarget=e,this._width=e.width,this._height=e.height}get material(){return this._material}get type(){return this._type}get colorSpace(){return this._colorSpace}}const Rh=n=>{let e;if(n instanceof Eo){if(!(n.image.data instanceof Uint16Array)&&!(n.image.data instanceof Float32Array))throw new Error("Provided image is not HDR");e=n}else e=new Eo(n.data,n.width,n.height,"format"in n?n.format:An,n.type,_o,go,go,un,un,1,"colorSpace"in n&&n.colorSpace==="srgb"?n.colorSpace:Rr),"header"in n&&"gamma"in n&&(e.flipY=!0),e.needsUpdate=!0;return e},xy=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,yy=`
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform sampler2D sdr;
uniform sampler2D hdr;
uniform vec3 gamma;
uniform vec3 offsetSdr;
uniform vec3 offsetHdr;
uniform float minLog2;
uniform float maxLog2;

varying vec2 vUv;

void main() {
  vec3 sdrColor = texture2D(sdr, vUv).rgb;
  vec3 hdrColor = texture2D(hdr, vUv).rgb;

  vec3 pixelGain = (hdrColor + offsetHdr) / (sdrColor + offsetSdr);
  vec3 logRecovery = (log2(pixelGain) - minLog2) / (maxLog2 - minLog2);
  vec3 clampedRecovery = saturate(logRecovery);
  gl_FragColor = vec4(pow(clampedRecovery, gamma), 1.0);
}
`;class Sy extends Qn{_minContentBoost;_maxContentBoost;_offsetSdr;_offsetHdr;_gamma;constructor({sdr:e,hdr:t,offsetSdr:r,offsetHdr:a,maxContentBoost:l,minContentBoost:u,gamma:o}){if(!l)throw new Error("maxContentBoost is required");if(!e)throw new Error("sdr is required");if(!t)throw new Error("hdr is required");const p=o||[1,1,1],m=r||[1/64,1/64,1/64],g=a||[1/64,1/64,1/64],x=u||1,y=Math.max(l,1.0001);super({name:"GainMapEncoderMaterial",vertexShader:xy,fragmentShader:yy,uniforms:{sdr:{value:e},hdr:{value:t},gamma:{value:new le().fromArray(p)},offsetSdr:{value:new le().fromArray(m)},offsetHdr:{value:new le().fromArray(g)},minLog2:{value:Math.log2(x)},maxLog2:{value:Math.log2(y)}},blending:hr,depthTest:!1,depthWrite:!1}),this._minContentBoost=x,this._maxContentBoost=y,this._offsetSdr=m,this._offsetHdr=g,this._gamma=p,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get gamma(){return this._gamma}set gamma(e){this._gamma=e,this.uniforms.gamma.value=new le().fromArray(e)}get offsetHdr(){return this._offsetHdr}set offsetHdr(e){this._offsetHdr=e,this.uniforms.offsetHdr.value=new le().fromArray(e)}get offsetSdr(){return this._offsetSdr}set offsetSdr(e){this._offsetSdr=e,this.uniforms.offsetSdr.value=new le().fromArray(e)}get minContentBoost(){return this._minContentBoost}set minContentBoost(e){this._minContentBoost=e,this.uniforms.minLog2.value=Math.log2(e)}get maxContentBoost(){return this._maxContentBoost}set maxContentBoost(e){this._maxContentBoost=e,this.uniforms.maxLog2.value=Math.log2(e)}get gainMapMin(){return[Math.log2(this._minContentBoost),Math.log2(this._minContentBoost),Math.log2(this._minContentBoost)]}get gainMapMax(){return[Math.log2(this._maxContentBoost),Math.log2(this._maxContentBoost),Math.log2(this._maxContentBoost)]}get hdrCapacityMin(){return Math.min(Math.max(0,this.gainMapMin[0]),Math.max(0,this.gainMapMin[1]),Math.max(0,this.gainMapMin[2]))}get hdrCapacityMax(){return Math.max(Math.max(0,this.gainMapMax[0]),Math.max(0,this.gainMapMax[1]),Math.max(0,this.gainMapMax[2]))}}const by=n=>{const{image:e,sdr:t,renderer:r}=n,a=Rh(e),l=new Sy({...n,sdr:t.renderTarget.texture,hdr:a}),u=new Ks({width:a.image.width,height:a.image.height,type:Jn,colorSpace:Rr,material:l,renderer:r,renderTargetOptions:n.renderTargetOptions});try{u.render()}catch(o){throw u.disposeOnDemandRenderer(),o}return u},Ey=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,My=`
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

uniform sampler2D map;
uniform float brightness;
uniform float contrast;
uniform float saturation;
uniform float exposure;

varying vec2 vUv;

mat4 brightnessMatrix( float brightness ) {
  return mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    brightness, brightness, brightness, 1
  );
}

mat4 contrastMatrix( float contrast ) {
  float t = ( 1.0 - contrast ) / 2.0;
  return mat4(
    contrast, 0, 0, 0,
    0, contrast, 0, 0,
    0, 0, contrast, 0,
    t, t, t, 1
  );
}

mat4 saturationMatrix( float saturation ) {
  vec3 luminance = vec3( 0.3086, 0.6094, 0.0820 );
  float oneMinusSat = 1.0 - saturation;
  vec3 red = vec3( luminance.x * oneMinusSat );
  red+= vec3( saturation, 0, 0 );
  vec3 green = vec3( luminance.y * oneMinusSat );
  green += vec3( 0, saturation, 0 );
  vec3 blue = vec3( luminance.z * oneMinusSat );
  blue += vec3( 0, 0, saturation );
  return mat4(
    red,     0,
    green,   0,
    blue,    0,
    0, 0, 0, 1
  );
}

vec3 RRTAndODTFit( vec3 v ) {
  vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
  vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
  return a / b;
}

vec3 ACESFilmicToneMapping( vec3 color ) {
  // sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
  const mat3 ACESInputMat = mat3(
    vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
    vec3( 0.35458, 0.90834, 0.13383 ),
    vec3( 0.04823, 0.01566, 0.83777 )
  );
  // ODT_SAT => XYZ => D60_2_D65 => sRGB
  const mat3 ACESOutputMat = mat3(
    vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
    vec3( -0.53108,  1.10813, -0.07276 ),
    vec3( -0.07367, -0.00605,  1.07602 )
  );
  color = ACESInputMat * color;
  // Apply RRT and ODT
  color = RRTAndODTFit( color );
  color = ACESOutputMat * color;
  // Clamp to [0, 1]
  return saturate( color );
}

// source: https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf
vec3 ReinhardToneMapping( vec3 color ) {
  return saturate( color / ( vec3( 1.0 ) + color ) );
}

// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
vec3 CineonToneMapping( vec3 color ) {
  // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
  color = max( vec3( 0.0 ), color - 0.004 );
  return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}

// nothing
vec3 LinearToneMapping ( vec3 color ) {
  return color;
}


void main() {
  vec4 color = texture2D(map, vUv);

  vec4 exposed = vec4(exposure * color.rgb, color.a);

  vec4 tonemapped = vec4(TONEMAPPING_FUNCTION(exposed.rgb), color.a);

  vec4 adjusted =
    brightnessMatrix( brightness ) *
    contrastMatrix( contrast ) *
    saturationMatrix( saturation ) *
    tonemapped;

  gl_FragColor = adjusted;
}
`;class wy extends Qn{_brightness=0;_contrast=1;_saturation=1;_exposure=1;_toneMapping;_map;constructor({map:e,toneMapping:t}){super({name:"SDRMaterial",vertexShader:Ey,fragmentShader:My,uniforms:{map:{value:e},brightness:{value:0},contrast:{value:1},saturation:{value:1},exposure:{value:1}},blending:hr,depthTest:!1,depthWrite:!1}),this._map=e,this.toneMapping=this._toneMapping=t||Yc,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get toneMapping(){return this._toneMapping}set toneMapping(e){let t=!1;switch(e){case Yc:this.defines.TONEMAPPING_FUNCTION="ACESFilmicToneMapping",t=!0;break;case nh:this.defines.TONEMAPPING_FUNCTION="ReinhardToneMapping",t=!0;break;case rh:this.defines.TONEMAPPING_FUNCTION="CineonToneMapping",t=!0;break;case qc:this.defines.TONEMAPPING_FUNCTION="LinearToneMapping",t=!0;break;default:console.error(`Unsupported toneMapping: ${e}. Using LinearToneMapping.`),this.defines.TONEMAPPING_FUNCTION="LinearToneMapping",this._toneMapping=qc}t&&(this._toneMapping=e),this.needsUpdate=!0}get brightness(){return this._brightness}set brightness(e){this._brightness=e,this.uniforms.brightness.value=e}get contrast(){return this._contrast}set contrast(e){this._contrast=e,this.uniforms.contrast.value=e}get saturation(){return this._saturation}set saturation(e){this._saturation=e,this.uniforms.saturation.value=e}get exposure(){return this._exposure}set exposure(e){this._exposure=e,this.uniforms.exposure.value=e}get map(){return this._map}set map(e){this._map=e,this.uniforms.map.value=e}}const Ty=(n,e,t,r)=>{n.needsUpdate=!0;const a=new Ks({width:n.image.width,height:n.image.height,type:Jn,colorSpace:zn,material:new wy({map:n,toneMapping:t}),renderer:e,renderTargetOptions:r});try{a.render()}catch(l){throw a.disposeOnDemandRenderer(),l}return a},Ay=n=>{const{image:e,renderer:t}=n,r=Rh(e),a=Ty(r,t,n.toneMapping,n.renderTargetOptions),l=by({...n,image:r,sdr:a,renderer:a.renderer});return{sdr:a,gainMap:l,hdr:r,getMetadata:()=>({gainMapMax:l.material.gainMapMax,gainMapMin:l.material.gainMapMin,gamma:l.material.gamma,hdrCapacityMax:l.material.hdrCapacityMax,hdrCapacityMin:l.material.hdrCapacityMin,offsetHdr:l.material.offsetHdr,offsetSdr:l.material.offsetSdr})}},Cy="modulepreload",Ry=function(n){return"/ultrahdr-pwa-svelte/"+n},fd={},Py=function(e,t,r){let a=Promise.resolve();if(t&&t.length>0){let p=function(m){return Promise.all(m.map(g=>Promise.resolve(g).then(x=>({status:"fulfilled",value:x}),x=>({status:"rejected",reason:x}))))};document.getElementsByTagName("link");const u=document.querySelector("meta[property=csp-nonce]"),o=u?.nonce||u?.getAttribute("nonce");a=p(t.map(m=>{if(m=Ry(m),m in fd)return;fd[m]=!0;const g=m.endsWith(".css"),x=g?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${x}`))return;const y=document.createElement("link");if(y.rel=g?"stylesheet":Cy,g||(y.as="script"),y.crossOrigin="",y.href=m,o&&y.setAttribute("nonce",o),document.head.appendChild(y),g)return new Promise((S,T)=>{y.addEventListener("load",S),y.addEventListener("error",()=>T(new Error(`Unable to preload CSS for ${m}`)))})}))}function l(u){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=u,window.dispatchEvent(o),!o.defaultPrevented)throw u}return a.then(u=>{for(const o of u||[])o.status==="rejected"&&l(o.reason);return e().catch(l)})};var Dy=(()=>{var n=import.meta.url;return(async function(e={}){var t=e,r,a;t.ready=new Promise((c,d)=>{r=c,a=d}),["_main","_memory","___indirect_function_table","__embind_initialize_bindings","_fflush","onRuntimeInitialized"].forEach(c=>{Object.getOwnPropertyDescriptor(t.ready,c)||Object.defineProperty(t.ready,c,{get:()=>N("You are getting "+c+" on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),set:()=>N("You are setting "+c+" on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")})});var l=Object.assign({},t),u="./this.program",o=(c,d)=>{throw d},p=typeof window=="object",m=typeof importScripts=="function",g=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string",x=!p&&!g&&!m;if(t.ENVIRONMENT)throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");var y="";function S(c){return t.locateFile?t.locateFile(c,y):y+c}var T,L,E;if(g){if(typeof process>"u"||!process.release||process.release.name!=="node")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");var b=process.versions.node,V=b.split(".").slice(0,3);if(V=V[0]*1e4+V[1]*100+V[2].split("-")[0]*1,V<16e4)throw new Error("This emscripten-generated code requires node v16.0.0 (detected v"+b+")");const{createRequire:c}=await Py(async()=>{const{createRequire:d}=await Promise.resolve().then(()=>Dh);return{createRequire:d}},void 0);var H=c(import.meta.url),X=H("fs"),I=H("path");m?y=I.dirname(y)+"/":y=H("url").fileURLToPath(new URL("./",import.meta.url)),T=(d,_)=>(d=he(d)?new URL(d):I.normalize(d),X.readFileSync(d,_?void 0:"utf8")),E=d=>{var _=T(d,!0);return _.buffer||(_=new Uint8Array(_)),B(_.buffer),_},L=(d,_,i,s=!0)=>{d=he(d)?new URL(d):I.normalize(d),X.readFile(d,s?void 0:"utf8",(f,h)=>{f?i(f):_(s?h.buffer:h)})},!t.thisProgram&&process.argv.length>1&&(u=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2),o=(d,_)=>{throw process.exitCode=d,_},t.inspect=()=>"[Emscripten Module object]"}else if(x){if(typeof process=="object"&&typeof H=="function"||typeof window=="object"||typeof importScripts=="function")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");typeof read<"u"&&(T=read),E=c=>{if(typeof readbuffer=="function")return new Uint8Array(readbuffer(c));let d=read(c,"binary");return B(typeof d=="object"),d},L=(c,d,_)=>{setTimeout(()=>d(E(c)))},typeof clearTimeout>"u"&&(globalThis.clearTimeout=c=>{}),typeof setTimeout>"u"&&(globalThis.setTimeout=c=>typeof c=="function"?c():N()),typeof scriptArgs<"u"&&scriptArgs,typeof quit=="function"&&(o=(c,d)=>{throw setTimeout(()=>{if(!(d instanceof Ce)){let _=d;d&&typeof d=="object"&&d.stack&&(_=[d,d.stack]),F(`exiting due to exception: ${_}`)}quit(c)}),d}),typeof print<"u"&&(typeof console>"u"&&(console={}),console.log=print,console.warn=console.error=typeof printErr<"u"?printErr:print)}else if(p||m){if(m?y=self.location.href:typeof document<"u"&&document.currentScript&&(y=document.currentScript.src),n&&(y=n),y.indexOf("blob:")!==0?y=y.substr(0,y.replace(/[?#].*/,"").lastIndexOf("/")+1):y="",!(typeof window=="object"||typeof importScripts=="function"))throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");T=c=>{var d=new XMLHttpRequest;return d.open("GET",c,!1),d.send(null),d.responseText},m&&(E=c=>{var d=new XMLHttpRequest;return d.open("GET",c,!1),d.responseType="arraybuffer",d.send(null),new Uint8Array(d.response)}),L=(c,d,_)=>{var i=new XMLHttpRequest;i.open("GET",c,!0),i.responseType="arraybuffer",i.onload=()=>{if(i.status==200||i.status==0&&i.response){d(i.response);return}_()},i.onerror=_,i.send(null)}}else throw new Error("environment detection error");var R=t.print||console.log.bind(console),F=t.printErr||console.error.bind(console);Object.assign(t,l),l=null,Ri(),t.arguments&&t.arguments,je("arguments","arguments_"),t.thisProgram&&(u=t.thisProgram),je("thisProgram","thisProgram"),t.quit&&(o=t.quit),je("quit","quit_"),B(typeof t.memoryInitializerPrefixURL>"u","Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"),B(typeof t.pthreadMainPrefixURL>"u","Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"),B(typeof t.cdInitializerPrefixURL>"u","Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"),B(typeof t.filePackagePrefixURL>"u","Module.filePackagePrefixURL option was removed, use Module.locateFile instead"),B(typeof t.read>"u","Module.read option was removed (modify read_ in JS)"),B(typeof t.readAsync>"u","Module.readAsync option was removed (modify readAsync in JS)"),B(typeof t.readBinary>"u","Module.readBinary option was removed (modify readBinary in JS)"),B(typeof t.setWindowTitle>"u","Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)"),B(typeof t.TOTAL_MEMORY>"u","Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"),je("asm","wasmExports"),je("read","read_"),je("readAsync","readAsync"),je("readBinary","readBinary"),je("setWindowTitle","setWindowTitle"),B(!x,"shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");var W;t.wasmBinary&&(W=t.wasmBinary),je("wasmBinary","wasmBinary"),typeof WebAssembly!="object"&&N("no native wasm support detected");var D,w=!1,z;function B(c,d){c||N("Assertion failed"+(d?": "+d:""))}var Y,Z,j,J,ue,te,Se,be;function Ye(){var c=D.buffer;t.HEAP8=Y=new Int8Array(c),t.HEAP16=j=new Int16Array(c),t.HEAPU8=Z=new Uint8Array(c),t.HEAPU16=J=new Uint16Array(c),t.HEAP32=ue=new Int32Array(c),t.HEAPU32=te=new Uint32Array(c),t.HEAPF32=Se=new Float32Array(c),t.HEAPF64=be=new Float64Array(c)}B(!t.STACK_SIZE,"STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time"),B(typeof Int32Array<"u"&&typeof Float64Array<"u"&&Int32Array.prototype.subarray!=null&&Int32Array.prototype.set!=null,"JS engine does not provide full typed array support"),B(!t.wasmMemory,"Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"),B(!t.INITIAL_MEMORY,"Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");function ct(){var c=Ka();B((c&3)==0),c==0&&(c+=4),te[c>>2]=34821223,te[c+4>>2]=2310721022,te[0]=1668509029}function pt(){if(!w){var c=Ka();c==0&&(c+=4);var d=te[c>>2],_=te[c+4>>2];(d!=34821223||_!=2310721022)&&N(`Stack overflow! Stack cookie has been overwritten at ${pe(c)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${pe(_)} ${pe(d)}`),te[0]!=1668509029&&N("Runtime error: The application has corrupted its heap memory area (address zero)!")}}(function(){var c=new Int16Array(1),d=new Int8Array(c.buffer);if(c[0]=25459,d[0]!==115||d[1]!==99)throw"Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)"})();var yt=[],vt=[],_e=[],ge=[],Oe=!1;function Qe(){if(t.preRun)for(typeof t.preRun=="function"&&(t.preRun=[t.preRun]);t.preRun.length;)Re(t.preRun.shift());Ee(yt)}function $e(){B(!Oe),Oe=!0,pt(),!t.noFSInit&&!C.init.initialized&&C.init(),C.ignorePermissions=!1,Ee(vt)}function ft(){pt(),Ee(_e)}function Lt(){if(pt(),t.postRun)for(typeof t.postRun=="function"&&(t.postRun=[t.postRun]);t.postRun.length;)$(t.postRun.shift());Ee(ge)}function Re(c){yt.unshift(c)}function lt(c){vt.unshift(c)}function $(c){ge.unshift(c)}B(Math.imul,"This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),B(Math.fround,"This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),B(Math.clz32,"This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),B(Math.trunc,"This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");var nt=0,rt=null,ut=null,Ue={};function bt(c){for(var d=c;;){if(!Ue[c])return c;c=d+Math.random()}}function qe(c){nt++,t.monitorRunDependencies&&t.monitorRunDependencies(nt),c?(B(!Ue[c]),Ue[c]=1,rt===null&&typeof setInterval<"u"&&(rt=setInterval(()=>{if(w){clearInterval(rt),rt=null;return}var d=!1;for(var _ in Ue)d||(d=!0,F("still waiting on run dependencies:")),F(`dependency: ${_}`);d&&F("(end of list)")},1e4))):F("warning: run dependency added without ID")}function it(c){if(nt--,t.monitorRunDependencies&&t.monitorRunDependencies(nt),c?(B(Ue[c]),delete Ue[c]):F("warning: run dependency removed without ID"),nt==0&&(rt!==null&&(clearInterval(rt),rt=null),ut)){var d=ut;ut=null,d()}}function N(c){t.onAbort&&t.onAbort(c),c="Aborted("+c+")",F(c),w=!0,z=1;var d=new WebAssembly.RuntimeError(c);throw a(d),d}var P="data:application/octet-stream;base64,",ne=c=>c.startsWith(P),he=c=>c.startsWith("file://");function de(c){return function(){B(Oe,`native function \`${c}\` called before runtime initialization`);var d=ar[c];return B(d,`exported native function \`${c}\` not found`),d.apply(null,arguments)}}var ie;t.locateFile?(ie="libultrahdr-esm.wasm",ne(ie)||(ie=S(ie))):ie=new URL("/ultrahdr-pwa-svelte/assets/libultrahdr-esm-B2AMZ5Um.wasm",import.meta.url).href;function Ze(c){if(c==ie&&W)return new Uint8Array(W);if(E)return E(c);throw"both async and sync fetching of the wasm failed"}function Fe(c){if(!W&&(p||m)){if(typeof fetch=="function"&&!he(c))return fetch(c,{credentials:"same-origin"}).then(d=>{if(!d.ok)throw"failed to load wasm binary file at '"+c+"'";return d.arrayBuffer()}).catch(()=>Ze(c));if(L)return new Promise((d,_)=>{L(c,i=>d(new Uint8Array(i)),_)})}return Promise.resolve().then(()=>Ze(c))}function et(c,d,_){return Fe(c).then(i=>WebAssembly.instantiate(i,d)).then(i=>i).then(_,i=>{F(`failed to asynchronously prepare wasm: ${i}`),he(ie)&&F(`warning: Loading from a file URI (${ie}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`),N(i)})}function Ke(c,d,_,i){return!c&&typeof WebAssembly.instantiateStreaming=="function"&&!ne(d)&&!he(d)&&!g&&typeof fetch=="function"?fetch(d,{credentials:"same-origin"}).then(s=>{var f=WebAssembly.instantiateStreaming(s,_);return f.then(i,function(h){return F(`wasm streaming compile failed: ${h}`),F("falling back to ArrayBuffer instantiation"),et(d,_,i)})}):et(d,_,i)}function ve(){var c={env:Xo,wasi_snapshot_preview1:Xo};function d(s,f){return ar=s.exports,D=ar.memory,B(D,"memory not found in wasm exports"),Ye(),Wt=ar.__indirect_function_table,B(Wt,"table not found in wasm exports"),lt(ar.__wasm_call_ctors),it("wasm-instantiate"),ar}qe("wasm-instantiate");var _=t;function i(s){B(t===_,"the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"),_=null,d(s.instance)}if(t.instantiateWasm)try{return t.instantiateWasm(c,d)}catch(s){F(`Module.instantiateWasm callback failed with error: ${s}`),a(s)}return Ke(W,ie,c,i).catch(a),{}}var fe,we;function je(c,d,_=!0){Object.getOwnPropertyDescriptor(t,c)||Object.defineProperty(t,c,{configurable:!0,get(){let i=_?" (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)":"";N(`\`Module.${c}\` has been replaced by \`${d}\``+i)}})}function Be(c){Object.getOwnPropertyDescriptor(t,c)&&N(`\`Module.${c}\` was supplied but \`${c}\` not included in INCOMING_MODULE_JS_API`)}function Ve(c){return c==="FS_createPath"||c==="FS_createDataFile"||c==="FS_createPreloadedFile"||c==="FS_unlink"||c==="addRunDependency"||c==="FS_createLazyFile"||c==="FS_createDevice"||c==="removeRunDependency"}function q(c,d){typeof globalThis<"u"&&Object.defineProperty(globalThis,c,{configurable:!0,get(){ze("`"+c+"` is not longer defined by emscripten. "+d)}})}q("buffer","Please use HEAP8.buffer or wasmMemory.buffer"),q("asm","Please use wasmExports instead");function Ie(c){typeof globalThis<"u"&&!Object.getOwnPropertyDescriptor(globalThis,c)&&Object.defineProperty(globalThis,c,{configurable:!0,get(){var d="`"+c+"` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line",_=c;_.startsWith("_")||(_="$"+c),d+=" (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='"+_+"')",Ve(c)&&(d+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),ze(d)}}),Pe(c)}function Pe(c){Object.getOwnPropertyDescriptor(t,c)||Object.defineProperty(t,c,{configurable:!0,get(){var d="'"+c+"' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)";Ve(c)&&(d+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),N(d)}})}function Ce(c){this.name="ExitStatus",this.message=`Program terminated with exit(${c})`,this.status=c}var Ee=c=>{for(;c.length>0;)c.shift()(t)};t.noExitRuntime;var pe=c=>(B(typeof c=="number"),c>>>=0,"0x"+c.toString(16).padStart(8,"0")),ze=c=>{ze.shown||(ze.shown={}),ze.shown[c]||(ze.shown[c]=1,g&&(c="warning: "+c),F(c))};function Te(c){this.excPtr=c,this.ptr=c-24,this.set_type=function(d){te[this.ptr+4>>2]=d},this.get_type=function(){return te[this.ptr+4>>2]},this.set_destructor=function(d){te[this.ptr+8>>2]=d},this.get_destructor=function(){return te[this.ptr+8>>2]},this.set_caught=function(d){d=d?1:0,Y[this.ptr+12>>0]=d},this.get_caught=function(){return Y[this.ptr+12>>0]!=0},this.set_rethrown=function(d){d=d?1:0,Y[this.ptr+13>>0]=d},this.get_rethrown=function(){return Y[this.ptr+13>>0]!=0},this.init=function(d,_){this.set_adjusted_ptr(0),this.set_type(d),this.set_destructor(_)},this.set_adjusted_ptr=function(d){te[this.ptr+16>>2]=d},this.get_adjusted_ptr=function(){return te[this.ptr+16>>2]},this.get_exception_ptr=function(){var d=jo(this.get_type());if(d)return te[this.excPtr>>2];var _=this.get_adjusted_ptr();return _!==0?_:this.excPtr}}var It=(c,d,_)=>{var i=new Te(c);i.init(d,_),B(!1,"Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.")},Mt={},Sn=c=>{for(;c.length;){var d=c.pop(),_=c.pop();_(d)}};function dn(c){return this.fromWireType(ue[c>>2])}var mr={},$n={},er={},A,Xt=c=>{throw new A(c)},Mi=(c,d,_)=>{c.forEach(function(v){er[v]=d});function i(v){var M=_(v);M.length!==c.length&&Xt("Mismatched type converter count");for(var O=0;O<c.length;++O)nn(c[O],M[O])}var s=new Array(d.length),f=[],h=0;d.forEach((v,M)=>{$n.hasOwnProperty(v)?s[M]=$n[v]:(f.push(v),mr.hasOwnProperty(v)||(mr[v]=[]),mr[v].push(()=>{s[M]=$n[v],++h,h===f.length&&i(s)}))}),f.length===0&&i(s)},Ki=c=>{var d=Mt[c];delete Mt[c];var _=d.rawConstructor,i=d.rawDestructor,s=d.fields,f=s.map(h=>h.getterReturnType).concat(s.map(h=>h.setterArgumentType));Mi([c],f,h=>{var v={};return s.forEach((M,O)=>{var G=M.fieldName,K=h[O],re=M.getter,se=M.getterContext,xe=h[O+s.length],Ae=M.setter,De=M.setterContext;v[G]={read:Xe=>K.fromWireType(re(se,Xe)),write:(Xe,me)=>{var Le=[];Ae(De,Xe,xe.toWireType(Le,me)),Sn(Le)}}}),[{name:d.name,fromWireType:M=>{var O={};for(var G in v)O[G]=v[G].read(M);return i(M),O},toWireType:(M,O)=>{for(var G in v)if(!(G in O))throw new TypeError(`Missing field: "${G}"`);var K=_();for(G in v)v[G].write(K,O[G]);return M!==null&&M.push(i,K),K},argPackAdvance:bn,readValueFromPointer:dn,destructorFunction:i}]})},ti=(c,d,_,i,s)=>{},Zi=()=>{for(var c=new Array(256),d=0;d<256;++d)c[d]=String.fromCharCode(d);Dr=c},Dr,Yt=c=>{for(var d="",_=c;Z[_];)d+=Dr[Z[_++]];return d},Lr,Zt=c=>{throw new Lr(c)};function _r(c,d,_={}){var i=d.name;if(c||Zt(`type "${i}" must have a positive integer typeid pointer`),$n.hasOwnProperty(c)){if(_.ignoreDuplicateRegistrations)return;Zt(`Cannot register type '${i}' twice`)}if($n[c]=d,delete er[c],mr.hasOwnProperty(c)){var s=mr[c];delete mr[c],s.forEach(f=>f())}}function nn(c,d,_={}){if(!("argPackAdvance"in d))throw new TypeError("registerType registeredInstance requires argPackAdvance");return _r(c,d,_)}var bn=8,Ji=(c,d,_,i)=>{d=Yt(d),nn(c,{name:d,fromWireType:function(s){return!!s},toWireType:function(s,f){return f?_:i},argPackAdvance:bn,readValueFromPointer:function(s){return this.fromWireType(Z[s])},destructorFunction:null})};function ni(){Object.assign(U.prototype,{get(c){return B(this.allocated[c]!==void 0,`invalid handle: ${c}`),this.allocated[c]},has(c){return this.allocated[c]!==void 0},allocate(c){var d=this.freelist.pop()||this.allocated.length;return this.allocated[d]=c,d},free(c){B(this.allocated[c]!==void 0),this.allocated[c]=void 0,this.freelist.push(c)}})}function U(){this.allocated=[void 0],this.freelist=[]}var Q=new U,ae=c=>{c>=Q.reserved&&--Q.get(c).refcount===0&&Q.free(c)},oe=()=>{for(var c=0,d=Q.reserved;d<Q.allocated.length;++d)Q.allocated[d]!==void 0&&++c;return c},ee=()=>{Q.allocated.push({value:void 0},{value:null},{value:!0},{value:!1}),Q.reserved=Q.allocated.length,t.count_emval_handles=oe},ye={toValue:c=>(c||Zt("Cannot use deleted val. handle = "+c),Q.get(c).value),toHandle:c=>{switch(c){case void 0:return 1;case null:return 2;case!0:return 3;case!1:return 4;default:return Q.allocate({refcount:1,value:c})}}},Ne=(c,d)=>{d=Yt(d),nn(c,{name:d,fromWireType:_=>{var i=ye.toValue(_);return ae(_),i},toWireType:(_,i)=>ye.toHandle(i),argPackAdvance:bn,readValueFromPointer:dn,destructorFunction:null})},Me=c=>{if(c===null)return"null";var d=typeof c;return d==="object"||d==="array"||d==="function"?c.toString():""+c},We=(c,d)=>{switch(d){case 4:return function(_){return this.fromWireType(Se[_>>2])};case 8:return function(_){return this.fromWireType(be[_>>3])};default:throw new TypeError(`invalid float width (${d}): ${c}`)}},Je=(c,d,_)=>{d=Yt(d),nn(c,{name:d,fromWireType:i=>i,toWireType:(i,s)=>{if(typeof s!="number"&&typeof s!="boolean")throw new TypeError(`Cannot convert ${Me(s)} to ${this.name}`);return s},argPackAdvance:bn,readValueFromPointer:We(d,_),destructorFunction:null})},tt=48,at=57,_t=c=>{if(c===void 0)return"_unknown";c=c.replace(/[^a-zA-Z0-9_]/g,"$");var d=c.charCodeAt(0);return d>=tt&&d<=at?`_${c}`:c};function wt(c,d){return c=_t(c),{[c]:function(){return d.apply(this,arguments)}}[c]}function Nt(c,d){if(!(c instanceof Function))throw new TypeError(`new_ called with constructor type ${typeof c} which is not a function`);var _=wt(c.name||"unknownFunctionName",function(){});_.prototype=c.prototype;var i=new _,s=c.apply(i,d);return s instanceof Object?s:i}function Ht(c,d,_,i,s,f){var h=d.length;h<2&&Zt("argTypes array size mismatch! Must at least get return value and 'this' types!"),B(!f,"Async bindings are only supported with JSPI."),d[1];for(var v=!1,M=1;M<d.length;++M)if(d[M]!==null&&d[M].destructorFunction===void 0){v=!0;break}for(var O=d[0].name!=="void",G="",K="",M=0;M<h-2;++M)G+=(M!==0?", ":"")+"arg"+M,K+=(M!==0?", ":"")+"arg"+M+"Wired";var re=`
        return function ${_t(c)}(${G}) {
        if (arguments.length !== ${h-2}) {
          throwBindingError('function ${c} called with ' + arguments.length + ' arguments, expected ${h-2}');
        }`;v&&(re+=`var destructors = [];
`);for(var se=v?"destructors":"null",xe=["throwBindingError","invoker","fn","runDestructors","retType","classParam"],Ae=[Zt,i,s,Sn,d[0],d[1]],M=0;M<h-2;++M)re+="var arg"+M+"Wired = argType"+M+".toWireType("+se+", arg"+M+"); // "+d[M+2].name+`
`,xe.push("argType"+M),Ae.push(d[M+2]);if(re+=(O||f?"var rv = ":"")+"invoker(fn"+(K.length>0?", ":"")+K+`);
`,v)re+=`runDestructors(destructors);
`;else for(var M=2;M<d.length;++M){var De=M===1?"thisWired":"arg"+(M-2)+"Wired";d[M].destructorFunction!==null&&(re+=De+"_dtor("+De+"); // "+d[M].name+`
`,xe.push(De+"_dtor"),Ae.push(d[M].destructorFunction))}return O&&(re+=`var ret = retType.fromWireType(rv);
return ret;
`),re+=`}
`,xe.push(re),Nt(Function,xe).apply(null,Ae)}var Pt=(c,d,_)=>{if(c[d].overloadTable===void 0){var i=c[d];c[d]=function(){return c[d].overloadTable.hasOwnProperty(arguments.length)||Zt(`Function '${_}' called with an invalid number of arguments (${arguments.length}) - expects one of (${c[d].overloadTable})!`),c[d].overloadTable[arguments.length].apply(this,arguments)},c[d].overloadTable=[],c[d].overloadTable[i.argCount]=i}},ot=(c,d,_)=>{t.hasOwnProperty(c)?((_===void 0||t[c].overloadTable!==void 0&&t[c].overloadTable[_]!==void 0)&&Zt(`Cannot register public name '${c}' twice`),Pt(t,c,c),t.hasOwnProperty(_)&&Zt(`Cannot register multiple overloads of a function with the same number of arguments (${_})!`),t[c].overloadTable[_]=d):(t[c]=d,_!==void 0&&(t[c].numArguments=_))},Ot=(c,d)=>{for(var _=[],i=0;i<c;i++)_.push(te[d+i*4>>2]);return _},St=(c,d,_)=>{t.hasOwnProperty(c)||Xt("Replacing nonexistant public symbol"),t[c].overloadTable!==void 0&&_!==void 0?t[c].overloadTable[_]=d:(t[c]=d,t[c].argCount=_)},hn=(c,d,_)=>{B("dynCall_"+c in t,`bad function pointer type - dynCall function not found for sig '${c}'`),_&&_.length?B(_.length===c.substring(1).replace(/j/g,"--").length):B(c.length==1);var i=t["dynCall_"+c];return _&&_.length?i.apply(null,[d].concat(_)):i.call(null,d)},Nn=[],Wt,rn=c=>{var d=Nn[c];return d||(c>=Nn.length&&(Nn.length=c+1),Nn[c]=d=Wt.get(c)),B(Wt.get(c)==d,"JavaScript-side Wasm function table mirror is out of date!"),d},Dt=(c,d,_)=>{if(c.includes("j"))return hn(c,d,_);B(rn(d),`missing table entry in dynCall: ${d}`);var i=rn(d).apply(null,_);return i},cn=(c,d)=>{B(c.includes("j")||c.includes("p"),"getDynCaller should only be called with i64 sigs");var _=[];return function(){return _.length=0,Object.assign(_,arguments),Dt(c,d,_)}},en=(c,d)=>{c=Yt(c);function _(){return c.includes("j")?cn(c,d):rn(d)}var i=_();return typeof i!="function"&&Zt(`unknown function pointer with signature ${c}: ${d}`),i},$t=(c,d)=>{var _=wt(d,function(i){this.name=d,this.message=i;var s=new Error(i).stack;s!==void 0&&(this.stack=this.toString()+`
`+s.replace(/^Error(:[^\n]*)?\n/,""))});return _.prototype=Object.create(c.prototype),_.prototype.constructor=_,_.prototype.toString=function(){return this.message===void 0?this.name:`${this.name}: ${this.message}`},_},an,ri=c=>{var d=zl(c),_=Yt(d);return vr(d),_},Cn=(c,d)=>{var _=[],i={};function s(f){if(!i[f]&&!$n[f]){if(er[f]){er[f].forEach(s);return}_.push(f),i[f]=!0}}throw d.forEach(s),new an(`${c}: `+_.map(ri).join([", "]))},Zs=c=>{c=c.trim();const d=c.indexOf("(");return d!==-1?(B(c[c.length-1]==")","Parentheses for argument names should match."),c.substr(0,d)):c},wi=(c,d,_,i,s,f,h)=>{var v=Ot(d,_);c=Yt(c),c=Zs(c),s=en(i,s),ot(c,function(){Cn(`Cannot call ${c} due to unbound types`,v)},d-1),Mi([],v,function(M){var O=[M[0],null].concat(M.slice(1));return St(c,Ht(c,O,null,s,f,h),d-1),[]})},Js=(c,d,_)=>{switch(d){case 1:return _?i=>Y[i>>0]:i=>Z[i>>0];case 2:return _?i=>j[i>>1]:i=>J[i>>1];case 4:return _?i=>ue[i>>2]:i=>te[i>>2];default:throw new TypeError(`invalid integer width (${d}): ${c}`)}},Qi=(c,d,_,i,s)=>{d=Yt(d),s===-1&&(s=4294967295);var f=G=>G;if(i===0){var h=32-8*_;f=G=>G<<h>>>h}var v=d.includes("unsigned"),M=(G,K)=>{if(typeof G!="number"&&typeof G!="boolean")throw new TypeError(`Cannot convert "${Me(G)}" to ${K}`);if(G<i||G>s)throw new TypeError(`Passing a number "${Me(G)}" from JS side to C/C++ side to an argument of type "${d}", which is outside the valid range [${i}, ${s}]!`)},O;v?O=function(G,K){return M(K,this.name),K>>>0}:O=function(G,K){return M(K,this.name),K},nn(c,{name:d,fromWireType:f,toWireType:O,argPackAdvance:bn,readValueFromPointer:Js(d,_,i!==0),destructorFunction:null})},Ti=(c,d,_)=>{var i=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],s=i[d];function f(h){var v=te[h>>2],M=te[h+4>>2];return new s(Y.buffer,M,v)}_=Yt(_),nn(c,{name:_,fromWireType:f,argPackAdvance:bn,readValueFromPointer:f},{ignoreDuplicateRegistrations:!0})};function Qs(c){return this.fromWireType(te[c>>2])}var Ai=(c,d,_,i)=>{if(B(typeof c=="string"),!(i>0))return 0;for(var s=_,f=_+i-1,h=0;h<c.length;++h){var v=c.charCodeAt(h);if(v>=55296&&v<=57343){var M=c.charCodeAt(++h);v=65536+((v&1023)<<10)|M&1023}if(v<=127){if(_>=f)break;d[_++]=v}else if(v<=2047){if(_+1>=f)break;d[_++]=192|v>>6,d[_++]=128|v&63}else if(v<=65535){if(_+2>=f)break;d[_++]=224|v>>12,d[_++]=128|v>>6&63,d[_++]=128|v&63}else{if(_+3>=f)break;v>1114111&&ze("Invalid Unicode code point "+pe(v)+" encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."),d[_++]=240|v>>18,d[_++]=128|v>>12&63,d[_++]=128|v>>6&63,d[_++]=128|v&63}}return d[_]=0,_-s},el=(c,d,_)=>(B(typeof _=="number","stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),Ai(c,Z,d,_)),Ha=c=>{for(var d=0,_=0;_<c.length;++_){var i=c.charCodeAt(_);i<=127?d++:i<=2047?d+=2:i>=55296&&i<=57343?(d+=4,++_):d+=3}return d},Po=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0,ii=(c,d,_)=>{for(var i=d+_,s=d;c[s]&&!(s>=i);)++s;if(s-d>16&&c.buffer&&Po)return Po.decode(c.subarray(d,s));for(var f="";d<s;){var h=c[d++];if(!(h&128)){f+=String.fromCharCode(h);continue}var v=c[d++]&63;if((h&224)==192){f+=String.fromCharCode((h&31)<<6|v);continue}var M=c[d++]&63;if((h&240)==224?h=(h&15)<<12|v<<6|M:((h&248)!=240&&ze("Invalid UTF-8 leading byte "+pe(h)+" encountered when deserializing a UTF-8 string in wasm memory to a JS string!"),h=(h&7)<<18|v<<12|M<<6|c[d++]&63),h<65536)f+=String.fromCharCode(h);else{var O=h-65536;f+=String.fromCharCode(55296|O>>10,56320|O&1023)}}return f},ai=(c,d)=>(B(typeof c=="number"),c?ii(Z,c,d):""),tl=(c,d)=>{d=Yt(d);var _=d==="std::string";nn(c,{name:d,fromWireType(i){var s=te[i>>2],f=i+4,h;if(_)for(var v=f,M=0;M<=s;++M){var O=f+M;if(M==s||Z[O]==0){var G=O-v,K=ai(v,G);h===void 0?h=K:(h+="\0",h+=K),v=O+1}}else{for(var re=new Array(s),M=0;M<s;++M)re[M]=String.fromCharCode(Z[f+M]);h=re.join("")}return vr(i),h},toWireType(i,s){s instanceof ArrayBuffer&&(s=new Uint8Array(s));var f,h=typeof s=="string";h||s instanceof Uint8Array||s instanceof Uint8ClampedArray||s instanceof Int8Array||Zt("Cannot pass non-string to std::string"),_&&h?f=Ha(s):f=s.length;var v=$o(4+f+1),M=v+4;if(te[v>>2]=f,_&&h)el(s,M,f+1);else if(h)for(var O=0;O<f;++O){var G=s.charCodeAt(O);G>255&&(vr(M),Zt("String has UTF-16 code units that do not fit in 8 bits")),Z[M+O]=G}else for(var O=0;O<f;++O)Z[M+O]=s[O];return i!==null&&i.push(vr,v),v},argPackAdvance:bn,readValueFromPointer:Qs,destructorFunction(i){vr(i)}})},Do=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0,nl=(c,d)=>{B(c%2==0,"Pointer passed to UTF16ToString must be aligned to two bytes!");for(var _=c,i=_>>1,s=i+d/2;!(i>=s)&&J[i];)++i;if(_=i<<1,_-c>32&&Do)return Do.decode(Z.subarray(c,_));for(var f="",h=0;!(h>=d/2);++h){var v=j[c+h*2>>1];if(v==0)break;f+=String.fromCharCode(v)}return f},rl=(c,d,_)=>{if(B(d%2==0,"Pointer passed to stringToUTF16 must be aligned to two bytes!"),B(typeof _=="number","stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),_===void 0&&(_=2147483647),_<2)return 0;_-=2;for(var i=d,s=_<c.length*2?_/2:c.length,f=0;f<s;++f){var h=c.charCodeAt(f);j[d>>1]=h,d+=2}return j[d>>1]=0,d-i},ea=c=>c.length*2,Lo=(c,d)=>{B(c%4==0,"Pointer passed to UTF32ToString must be aligned to four bytes!");for(var _=0,i="";!(_>=d/4);){var s=ue[c+_*4>>2];if(s==0)break;if(++_,s>=65536){var f=s-65536;i+=String.fromCharCode(55296|f>>10,56320|f&1023)}else i+=String.fromCharCode(s)}return i},il=(c,d,_)=>{if(B(d%4==0,"Pointer passed to stringToUTF32 must be aligned to four bytes!"),B(typeof _=="number","stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),_===void 0&&(_=2147483647),_<4)return 0;for(var i=d,s=i+_-4,f=0;f<c.length;++f){var h=c.charCodeAt(f);if(h>=55296&&h<=57343){var v=c.charCodeAt(++f);h=65536+((h&1023)<<10)|v&1023}if(ue[d>>2]=h,d+=4,d+4>s)break}return ue[d>>2]=0,d-i},ta=c=>{for(var d=0,_=0;_<c.length;++_){var i=c.charCodeAt(_);i>=55296&&i<=57343&&++_,d+=4}return d},Fo=(c,d,_)=>{_=Yt(_);var i,s,f,h,v;d===2?(i=nl,s=rl,h=ea,f=()=>J,v=1):d===4&&(i=Lo,s=il,h=ta,f=()=>te,v=2),nn(c,{name:_,fromWireType:M=>{for(var O=te[M>>2],G=f(),K,re=M+4,se=0;se<=O;++se){var xe=M+4+se*d;if(se==O||G[xe>>v]==0){var Ae=xe-re,De=i(re,Ae);K===void 0?K=De:(K+="\0",K+=De),re=xe+d}}return vr(M),K},toWireType:(M,O)=>{typeof O!="string"&&Zt(`Cannot pass non-string to C++ string type ${_}`);var G=h(O),K=$o(4+G+d);return te[K>>2]=G>>v,s(O,K+4,G+d),M!==null&&M.push(vr,K),K},argPackAdvance:bn,readValueFromPointer:dn,destructorFunction(M){vr(M)}})},Io=(c,d,_,i,s,f)=>{Mt[c]={name:Yt(d),rawConstructor:en(_,i),rawDestructor:en(s,f),fields:[]}},al=(c,d,_,i,s,f,h,v,M,O)=>{Mt[c].fields.push({fieldName:Yt(d),getterReturnType:_,getter:en(i,s),getterContext:f,setterArgumentType:h,setter:en(v,M),setterContext:O})},ol=(c,d)=>{d=Yt(d),nn(c,{isVoid:!0,name:d,argPackAdvance:0,fromWireType:()=>{},toWireType:(_,i)=>{}})},tr=()=>{throw 1/0},sl=c=>{c>4&&(Q.get(c).refcount+=1)},Uo={},No=c=>{var d=Uo[c];return d===void 0?Yt(c):d},Oo=c=>ye.toHandle(No(c)),ll=(c,d)=>{var _=$n[c];return _===void 0&&Zt(d+" has unknown type "+ri(c)),_},Va=(c,d)=>{c=ll(c,"_emval_take_value");var _=c.readValueFromPointer(d);return ye.toHandle(_)},nr=()=>{N("native code called abort()")},Wa=(c,d,_)=>Z.copyWithin(c,d,d+_),cl=()=>2147483648,fl=c=>{var d=D.buffer,_=(c-d.byteLength+65535)/65536;try{return D.grow(_),Ye(),1}catch(i){F(`growMemory: Attempted to grow heap from ${d.byteLength} bytes to ${c} bytes, but got error: ${i}`)}},En=c=>{var d=Z.length;c>>>=0,B(c>d);var _=cl();if(c>_)return F(`Cannot enlarge memory, requested ${c} bytes, but the limit is ${_} bytes!`),!1;for(var i=(M,O)=>M+(O-M%O)%O,s=1;s<=4;s*=2){var f=d*(1+.2/s);f=Math.min(f,c+100663296);var h=Math.min(_,i(Math.max(c,f),65536)),v=fl(h);if(v)return!0}return F(`Failed to grow the heap from ${d} bytes to ${h} bytes, not enough memory!`),!1},Xa={},ul=()=>u||"./this.program",Ci=()=>{if(!Ci.strings){var c=(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",d={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:c,_:ul()};for(var _ in Xa)Xa[_]===void 0?delete d[_]:d[_]=Xa[_];var i=[];for(var _ in d)i.push(`${_}=${d[_]}`);Ci.strings=i}return Ci.strings},dl=(c,d)=>{for(var _=0;_<c.length;++_)B(c.charCodeAt(_)===(c.charCodeAt(_)&255)),Y[d++>>0]=c.charCodeAt(_);Y[d>>0]=0},Tt={isAbs:c=>c.charAt(0)==="/",splitPath:c=>{var d=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return d.exec(c).slice(1)},normalizeArray:(c,d)=>{for(var _=0,i=c.length-1;i>=0;i--){var s=c[i];s==="."?c.splice(i,1):s===".."?(c.splice(i,1),_++):_&&(c.splice(i,1),_--)}if(d)for(;_;_--)c.unshift("..");return c},normalize:c=>{var d=Tt.isAbs(c),_=c.substr(-1)==="/";return c=Tt.normalizeArray(c.split("/").filter(i=>!!i),!d).join("/"),!c&&!d&&(c="."),c&&_&&(c+="/"),(d?"/":"")+c},dirname:c=>{var d=Tt.splitPath(c),_=d[0],i=d[1];return!_&&!i?".":(i&&(i=i.substr(0,i.length-1)),_+i)},basename:c=>{if(c==="/")return"/";c=Tt.normalize(c),c=c.replace(/\/$/,"");var d=c.lastIndexOf("/");return d===-1?c:c.substr(d+1)},join:function(){var c=Array.prototype.slice.call(arguments);return Tt.normalize(c.join("/"))},join2:(c,d)=>Tt.normalize(c+"/"+d)},hl=()=>{if(typeof crypto=="object"&&typeof crypto.getRandomValues=="function")return i=>crypto.getRandomValues(i);if(g)try{var c=H("crypto"),d=c.randomFillSync;if(d)return i=>c.randomFillSync(i);var _=c.randomBytes;return i=>(i.set(_(i.byteLength)),i)}catch{}N("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };")},na=c=>(na=hl())(c),rr={resolve:function(){for(var c="",d=!1,_=arguments.length-1;_>=-1&&!d;_--){var i=_>=0?arguments[_]:C.cwd();if(typeof i!="string")throw new TypeError("Arguments to path.resolve must be strings");if(!i)return"";c=i+"/"+c,d=Tt.isAbs(i)}return c=Tt.normalizeArray(c.split("/").filter(s=>!!s),!d).join("/"),(d?"/":"")+c||"."},relative:(c,d)=>{c=rr.resolve(c).substr(1),d=rr.resolve(d).substr(1);function _(O){for(var G=0;G<O.length&&O[G]==="";G++);for(var K=O.length-1;K>=0&&O[K]==="";K--);return G>K?[]:O.slice(G,K-G+1)}for(var i=_(c.split("/")),s=_(d.split("/")),f=Math.min(i.length,s.length),h=f,v=0;v<f;v++)if(i[v]!==s[v]){h=v;break}for(var M=[],v=h;v<i.length;v++)M.push("..");return M=M.concat(s.slice(h)),M.join("/")}},$a=[];function ra(c,d,_){var i=Ha(c)+1,s=new Array(i),f=Ai(c,s,0,s.length);return d&&(s.length=f),s}var pl=()=>{if(!$a.length){var c=null;if(g){var d=256,_=Buffer.alloc(d),i=0,s=process.stdin.fd;try{i=X.readSync(s,_)}catch(f){if(f.toString().includes("EOF"))i=0;else throw f}i>0?c=_.slice(0,i).toString("utf-8"):c=null}else typeof window<"u"&&typeof window.prompt=="function"?(c=window.prompt("Input: "),c!==null&&(c+=`
`)):typeof readline=="function"&&(c=readline(),c!==null&&(c+=`
`));if(!c)return null;$a=ra(c,!0)}return $a.shift()},gr={ttys:[],init(){},shutdown(){},register(c,d){gr.ttys[c]={input:[],output:[],ops:d},C.registerDevice(c,gr.stream_ops)},stream_ops:{open(c){var d=gr.ttys[c.node.rdev];if(!d)throw new C.ErrnoError(43);c.tty=d,c.seekable=!1},close(c){c.tty.ops.fsync(c.tty)},fsync(c){c.tty.ops.fsync(c.tty)},read(c,d,_,i,s){if(!c.tty||!c.tty.ops.get_char)throw new C.ErrnoError(60);for(var f=0,h=0;h<i;h++){var v;try{v=c.tty.ops.get_char(c.tty)}catch{throw new C.ErrnoError(29)}if(v===void 0&&f===0)throw new C.ErrnoError(6);if(v==null)break;f++,d[_+h]=v}return f&&(c.node.timestamp=Date.now()),f},write(c,d,_,i,s){if(!c.tty||!c.tty.ops.put_char)throw new C.ErrnoError(60);try{for(var f=0;f<i;f++)c.tty.ops.put_char(c.tty,d[_+f])}catch{throw new C.ErrnoError(29)}return i&&(c.node.timestamp=Date.now()),f}},default_tty_ops:{get_char(c){return pl()},put_char(c,d){d===null||d===10?(R(ii(c.output,0)),c.output=[]):d!=0&&c.output.push(d)},fsync(c){c.output&&c.output.length>0&&(R(ii(c.output,0)),c.output=[])},ioctl_tcgets(c){return{c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(c,d,_){return 0},ioctl_tiocgwinsz(c){return[24,80]}},default_tty1_ops:{put_char(c,d){d===null||d===10?(F(ii(c.output,0)),c.output=[]):d!=0&&c.output.push(d)},fsync(c){c.output&&c.output.length>0&&(F(ii(c.output,0)),c.output=[])}}},ko=c=>{N("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported")},dt={ops_table:null,mount(c){return dt.createNode(null,"/",16895,0)},createNode(c,d,_,i){if(C.isBlkdev(_)||C.isFIFO(_))throw new C.ErrnoError(63);dt.ops_table||(dt.ops_table={dir:{node:{getattr:dt.node_ops.getattr,setattr:dt.node_ops.setattr,lookup:dt.node_ops.lookup,mknod:dt.node_ops.mknod,rename:dt.node_ops.rename,unlink:dt.node_ops.unlink,rmdir:dt.node_ops.rmdir,readdir:dt.node_ops.readdir,symlink:dt.node_ops.symlink},stream:{llseek:dt.stream_ops.llseek}},file:{node:{getattr:dt.node_ops.getattr,setattr:dt.node_ops.setattr},stream:{llseek:dt.stream_ops.llseek,read:dt.stream_ops.read,write:dt.stream_ops.write,allocate:dt.stream_ops.allocate,mmap:dt.stream_ops.mmap,msync:dt.stream_ops.msync}},link:{node:{getattr:dt.node_ops.getattr,setattr:dt.node_ops.setattr,readlink:dt.node_ops.readlink},stream:{}},chrdev:{node:{getattr:dt.node_ops.getattr,setattr:dt.node_ops.setattr},stream:C.chrdev_stream_ops}});var s=C.createNode(c,d,_,i);return C.isDir(s.mode)?(s.node_ops=dt.ops_table.dir.node,s.stream_ops=dt.ops_table.dir.stream,s.contents={}):C.isFile(s.mode)?(s.node_ops=dt.ops_table.file.node,s.stream_ops=dt.ops_table.file.stream,s.usedBytes=0,s.contents=null):C.isLink(s.mode)?(s.node_ops=dt.ops_table.link.node,s.stream_ops=dt.ops_table.link.stream):C.isChrdev(s.mode)&&(s.node_ops=dt.ops_table.chrdev.node,s.stream_ops=dt.ops_table.chrdev.stream),s.timestamp=Date.now(),c&&(c.contents[d]=s,c.timestamp=s.timestamp),s},getFileDataAsTypedArray(c){return c.contents?c.contents.subarray?c.contents.subarray(0,c.usedBytes):new Uint8Array(c.contents):new Uint8Array(0)},expandFileStorage(c,d){var _=c.contents?c.contents.length:0;if(!(_>=d)){var i=1024*1024;d=Math.max(d,_*(_<i?2:1.125)>>>0),_!=0&&(d=Math.max(d,256));var s=c.contents;c.contents=new Uint8Array(d),c.usedBytes>0&&c.contents.set(s.subarray(0,c.usedBytes),0)}},resizeFileStorage(c,d){if(c.usedBytes!=d)if(d==0)c.contents=null,c.usedBytes=0;else{var _=c.contents;c.contents=new Uint8Array(d),_&&c.contents.set(_.subarray(0,Math.min(d,c.usedBytes))),c.usedBytes=d}},node_ops:{getattr(c){var d={};return d.dev=C.isChrdev(c.mode)?c.id:1,d.ino=c.id,d.mode=c.mode,d.nlink=1,d.uid=0,d.gid=0,d.rdev=c.rdev,C.isDir(c.mode)?d.size=4096:C.isFile(c.mode)?d.size=c.usedBytes:C.isLink(c.mode)?d.size=c.link.length:d.size=0,d.atime=new Date(c.timestamp),d.mtime=new Date(c.timestamp),d.ctime=new Date(c.timestamp),d.blksize=4096,d.blocks=Math.ceil(d.size/d.blksize),d},setattr(c,d){d.mode!==void 0&&(c.mode=d.mode),d.timestamp!==void 0&&(c.timestamp=d.timestamp),d.size!==void 0&&dt.resizeFileStorage(c,d.size)},lookup(c,d){throw C.genericErrors[44]},mknod(c,d,_,i){return dt.createNode(c,d,_,i)},rename(c,d,_){if(C.isDir(c.mode)){var i;try{i=C.lookupNode(d,_)}catch{}if(i)for(var s in i.contents)throw new C.ErrnoError(55)}delete c.parent.contents[c.name],c.parent.timestamp=Date.now(),c.name=_,d.contents[_]=c,d.timestamp=c.parent.timestamp,c.parent=d},unlink(c,d){delete c.contents[d],c.timestamp=Date.now()},rmdir(c,d){var _=C.lookupNode(c,d);for(var i in _.contents)throw new C.ErrnoError(55);delete c.contents[d],c.timestamp=Date.now()},readdir(c){var d=[".",".."];for(var _ in c.contents)c.contents.hasOwnProperty(_)&&d.push(_);return d},symlink(c,d,_){var i=dt.createNode(c,d,41471,0);return i.link=_,i},readlink(c){if(!C.isLink(c.mode))throw new C.ErrnoError(28);return c.link}},stream_ops:{read(c,d,_,i,s){var f=c.node.contents;if(s>=c.node.usedBytes)return 0;var h=Math.min(c.node.usedBytes-s,i);if(B(h>=0),h>8&&f.subarray)d.set(f.subarray(s,s+h),_);else for(var v=0;v<h;v++)d[_+v]=f[s+v];return h},write(c,d,_,i,s,f){if(B(!(d instanceof ArrayBuffer)),d.buffer===Y.buffer&&(f=!1),!i)return 0;var h=c.node;if(h.timestamp=Date.now(),d.subarray&&(!h.contents||h.contents.subarray)){if(f)return B(s===0,"canOwn must imply no weird position inside the file"),h.contents=d.subarray(_,_+i),h.usedBytes=i,i;if(h.usedBytes===0&&s===0)return h.contents=d.slice(_,_+i),h.usedBytes=i,i;if(s+i<=h.usedBytes)return h.contents.set(d.subarray(_,_+i),s),i}if(dt.expandFileStorage(h,s+i),h.contents.subarray&&d.subarray)h.contents.set(d.subarray(_,_+i),s);else for(var v=0;v<i;v++)h.contents[s+v]=d[_+v];return h.usedBytes=Math.max(h.usedBytes,s+i),i},llseek(c,d,_){var i=d;if(_===1?i+=c.position:_===2&&C.isFile(c.node.mode)&&(i+=c.node.usedBytes),i<0)throw new C.ErrnoError(28);return i},allocate(c,d,_){dt.expandFileStorage(c.node,d+_),c.node.usedBytes=Math.max(c.node.usedBytes,d+_)},mmap(c,d,_,i,s){if(!C.isFile(c.node.mode))throw new C.ErrnoError(43);var f,h,v=c.node.contents;if(!(s&2)&&v.buffer===Y.buffer)h=!1,f=v.byteOffset;else{if((_>0||_+d<v.length)&&(v.subarray?v=v.subarray(_,_+d):v=Array.prototype.slice.call(v,_,_+d)),h=!0,f=ko(),!f)throw new C.ErrnoError(48);Y.set(v,f)}return{ptr:f,allocated:h}},msync(c,d,_,i,s){return dt.stream_ops.write(c,d,0,i,_,!1),0}}},ml=(c,d,_,i)=>{var s=bt(`al ${c}`);L(c,f=>{B(f,`Loading data file "${c}" failed (no arrayBuffer).`),d(new Uint8Array(f)),s&&it(s)},f=>{if(_)_();else throw`Loading data file "${c}" failed.`}),s&&qe(s)},_l=(c,d,_,i,s,f)=>C.createDataFile(c,d,_,i,s,f),gl=t.preloadPlugins||[],vl=(c,d,_,i)=>{typeof Browser<"u"&&Browser.init();var s=!1;return gl.forEach(f=>{s||f.canHandle(d)&&(f.handle(c,d,_,i),s=!0)}),s},xl=(c,d,_,i,s,f,h,v,M,O)=>{var G=d?rr.resolve(Tt.join2(c,d)):c,K=bt(`cp ${G}`);function re(se){function xe(Ae){O&&O(),v||_l(c,d,Ae,i,s,M),f&&f(),it(K)}vl(se,G,xe,()=>{h&&h(),it(K)})||xe(se)}qe(K),typeof _=="string"?ml(_,se=>re(se),h):re(_)},Bo=c=>{var d={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090},_=d[c];if(typeof _>"u")throw new Error(`Unknown file open mode: ${c}`);return _},qa=(c,d)=>{var _=0;return c&&(_|=365),d&&(_|=146),_},yl={0:"Success",1:"Arg list too long",2:"Permission denied",3:"Address already in use",4:"Address not available",5:"Address family not supported by protocol family",6:"No more processes",7:"Socket already connected",8:"Bad file number",9:"Trying to read unreadable message",10:"Mount device busy",11:"Operation canceled",12:"No children",13:"Connection aborted",14:"Connection refused",15:"Connection reset by peer",16:"File locking deadlock error",17:"Destination address required",18:"Math arg out of domain of func",19:"Quota exceeded",20:"File exists",21:"Bad address",22:"File too large",23:"Host is unreachable",24:"Identifier removed",25:"Illegal byte sequence",26:"Connection already in progress",27:"Interrupted system call",28:"Invalid argument",29:"I/O error",30:"Socket is already connected",31:"Is a directory",32:"Too many symbolic links",33:"Too many open files",34:"Too many links",35:"Message too long",36:"Multihop attempted",37:"File or path name too long",38:"Network interface is not configured",39:"Connection reset by network",40:"Network is unreachable",41:"Too many open files in system",42:"No buffer space available",43:"No such device",44:"No such file or directory",45:"Exec format error",46:"No record locks available",47:"The link has been severed",48:"Not enough core",49:"No message of desired type",50:"Protocol not available",51:"No space left on device",52:"Function not implemented",53:"Socket is not connected",54:"Not a directory",55:"Directory not empty",56:"State not recoverable",57:"Socket operation on non-socket",59:"Not a typewriter",60:"No such device or address",61:"Value too large for defined data type",62:"Previous owner died",63:"Not super-user",64:"Broken pipe",65:"Protocol error",66:"Unknown protocol",67:"Protocol wrong type for socket",68:"Math result not representable",69:"Read only file system",70:"Illegal seek",71:"No such process",72:"Stale file handle",73:"Connection timed out",74:"Text file busy",75:"Cross-device link",100:"Device not a stream",101:"Bad font file fmt",102:"Invalid slot",103:"Invalid request code",104:"No anode",105:"Block device required",106:"Channel number out of range",107:"Level 3 halted",108:"Level 3 reset",109:"Link number out of range",110:"Protocol driver not attached",111:"No CSI structure available",112:"Level 2 halted",113:"Invalid exchange",114:"Invalid request descriptor",115:"Exchange full",116:"No data (for no delay io)",117:"Timer expired",118:"Out of streams resources",119:"Machine is not on the network",120:"Package not installed",121:"The object is remote",122:"Advertise error",123:"Srmount error",124:"Communication error on send",125:"Cross mount point (not really error)",126:"Given log. name not unique",127:"f.d. invalid for this operation",128:"Remote address changed",129:"Can   access a needed shared lib",130:"Accessing a corrupted shared lib",131:".lib section in a.out corrupted",132:"Attempting to link in too many libs",133:"Attempting to exec a shared library",135:"Streams pipe error",136:"Too many users",137:"Socket type not supported",138:"Not supported",139:"Protocol family not supported",140:"Can't send after socket shutdown",141:"Too many references",142:"Host is down",148:"No medium (in tape drive)",156:"Level 2 not synchronized"},Ya={},Sl=c=>(ze("warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling"),c),bl=c=>{var d=/\b_Z[\w\d_]+/g;return c.replace(d,function(_){var i=Sl(_);return _===i?_:i+" ["+_+"]"})},C={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:!1,ignorePermissions:!0,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath(c,d={}){if(c=rr.resolve(c),!c)return{path:"",node:null};var _={follow_mount:!0,recurse_count:0};if(d=Object.assign(_,d),d.recurse_count>8)throw new C.ErrnoError(32);for(var i=c.split("/").filter(K=>!!K),s=C.root,f="/",h=0;h<i.length;h++){var v=h===i.length-1;if(v&&d.parent)break;if(s=C.lookupNode(s,i[h]),f=Tt.join2(f,i[h]),C.isMountpoint(s)&&(!v||v&&d.follow_mount)&&(s=s.mounted.root),!v||d.follow)for(var M=0;C.isLink(s.mode);){var O=C.readlink(f);f=rr.resolve(Tt.dirname(f),O);var G=C.lookupPath(f,{recurse_count:d.recurse_count+1});if(s=G.node,M++>40)throw new C.ErrnoError(32)}}return{path:f,node:s}},getPath(c){for(var d;;){if(C.isRoot(c)){var _=c.mount.mountpoint;return d?_[_.length-1]!=="/"?`${_}/${d}`:_+d:_}d=d?`${c.name}/${d}`:c.name,c=c.parent}},hashName(c,d){for(var _=0,i=0;i<d.length;i++)_=(_<<5)-_+d.charCodeAt(i)|0;return(c+_>>>0)%C.nameTable.length},hashAddNode(c){var d=C.hashName(c.parent.id,c.name);c.name_next=C.nameTable[d],C.nameTable[d]=c},hashRemoveNode(c){var d=C.hashName(c.parent.id,c.name);if(C.nameTable[d]===c)C.nameTable[d]=c.name_next;else for(var _=C.nameTable[d];_;){if(_.name_next===c){_.name_next=c.name_next;break}_=_.name_next}},lookupNode(c,d){var _=C.mayLookup(c);if(_)throw new C.ErrnoError(_,c);for(var i=C.hashName(c.id,d),s=C.nameTable[i];s;s=s.name_next){var f=s.name;if(s.parent.id===c.id&&f===d)return s}return C.lookup(c,d)},createNode(c,d,_,i){B(typeof c=="object");var s=new C.FSNode(c,d,_,i);return C.hashAddNode(s),s},destroyNode(c){C.hashRemoveNode(c)},isRoot(c){return c===c.parent},isMountpoint(c){return!!c.mounted},isFile(c){return(c&61440)===32768},isDir(c){return(c&61440)===16384},isLink(c){return(c&61440)===40960},isChrdev(c){return(c&61440)===8192},isBlkdev(c){return(c&61440)===24576},isFIFO(c){return(c&61440)===4096},isSocket(c){return(c&49152)===49152},flagsToPermissionString(c){var d=["r","w","rw"][c&3];return c&512&&(d+="w"),d},nodePermissions(c,d){return C.ignorePermissions?0:d.includes("r")&&!(c.mode&292)||d.includes("w")&&!(c.mode&146)||d.includes("x")&&!(c.mode&73)?2:0},mayLookup(c){var d=C.nodePermissions(c,"x");return d||(c.node_ops.lookup?0:2)},mayCreate(c,d){try{var _=C.lookupNode(c,d);return 20}catch{}return C.nodePermissions(c,"wx")},mayDelete(c,d,_){var i;try{i=C.lookupNode(c,d)}catch(f){return f.errno}var s=C.nodePermissions(c,"wx");if(s)return s;if(_){if(!C.isDir(i.mode))return 54;if(C.isRoot(i)||C.getPath(i)===C.cwd())return 10}else if(C.isDir(i.mode))return 31;return 0},mayOpen(c,d){return c?C.isLink(c.mode)?32:C.isDir(c.mode)&&(C.flagsToPermissionString(d)!=="r"||d&512)?31:C.nodePermissions(c,C.flagsToPermissionString(d)):44},MAX_OPEN_FDS:4096,nextfd(){for(var c=0;c<=C.MAX_OPEN_FDS;c++)if(!C.streams[c])return c;throw new C.ErrnoError(33)},getStreamChecked(c){var d=C.getStream(c);if(!d)throw new C.ErrnoError(8);return d},getStream:c=>C.streams[c],createStream(c,d=-1){return C.FSStream||(C.FSStream=function(){this.shared={}},C.FSStream.prototype={},Object.defineProperties(C.FSStream.prototype,{object:{get(){return this.node},set(_){this.node=_}},isRead:{get(){return(this.flags&2097155)!==1}},isWrite:{get(){return(this.flags&2097155)!==0}},isAppend:{get(){return this.flags&1024}},flags:{get(){return this.shared.flags},set(_){this.shared.flags=_}},position:{get(){return this.shared.position},set(_){this.shared.position=_}}})),c=Object.assign(new C.FSStream,c),d==-1&&(d=C.nextfd()),c.fd=d,C.streams[d]=c,c},closeStream(c){C.streams[c]=null},chrdev_stream_ops:{open(c){var d=C.getDevice(c.node.rdev);c.stream_ops=d.stream_ops,c.stream_ops.open&&c.stream_ops.open(c)},llseek(){throw new C.ErrnoError(70)}},major:c=>c>>8,minor:c=>c&255,makedev:(c,d)=>c<<8|d,registerDevice(c,d){C.devices[c]={stream_ops:d}},getDevice:c=>C.devices[c],getMounts(c){for(var d=[],_=[c];_.length;){var i=_.pop();d.push(i),_.push.apply(_,i.mounts)}return d},syncfs(c,d){typeof c=="function"&&(d=c,c=!1),C.syncFSRequests++,C.syncFSRequests>1&&F(`warning: ${C.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);var _=C.getMounts(C.root.mount),i=0;function s(h){return B(C.syncFSRequests>0),C.syncFSRequests--,d(h)}function f(h){if(h)return f.errored?void 0:(f.errored=!0,s(h));++i>=_.length&&s(null)}_.forEach(h=>{if(!h.type.syncfs)return f(null);h.type.syncfs(h,c,f)})},mount(c,d,_){if(typeof c=="string")throw c;var i=_==="/",s=!_,f;if(i&&C.root)throw new C.ErrnoError(10);if(!i&&!s){var h=C.lookupPath(_,{follow_mount:!1});if(_=h.path,f=h.node,C.isMountpoint(f))throw new C.ErrnoError(10);if(!C.isDir(f.mode))throw new C.ErrnoError(54)}var v={type:c,opts:d,mountpoint:_,mounts:[]},M=c.mount(v);return M.mount=v,v.root=M,i?C.root=M:f&&(f.mounted=v,f.mount&&f.mount.mounts.push(v)),M},unmount(c){var d=C.lookupPath(c,{follow_mount:!1});if(!C.isMountpoint(d.node))throw new C.ErrnoError(28);var _=d.node,i=_.mounted,s=C.getMounts(i);Object.keys(C.nameTable).forEach(h=>{for(var v=C.nameTable[h];v;){var M=v.name_next;s.includes(v.mount)&&C.destroyNode(v),v=M}}),_.mounted=null;var f=_.mount.mounts.indexOf(i);B(f!==-1),_.mount.mounts.splice(f,1)},lookup(c,d){return c.node_ops.lookup(c,d)},mknod(c,d,_){var i=C.lookupPath(c,{parent:!0}),s=i.node,f=Tt.basename(c);if(!f||f==="."||f==="..")throw new C.ErrnoError(28);var h=C.mayCreate(s,f);if(h)throw new C.ErrnoError(h);if(!s.node_ops.mknod)throw new C.ErrnoError(63);return s.node_ops.mknod(s,f,d,_)},create(c,d){return d=d!==void 0?d:438,d&=4095,d|=32768,C.mknod(c,d,0)},mkdir(c,d){return d=d!==void 0?d:511,d&=1023,d|=16384,C.mknod(c,d,0)},mkdirTree(c,d){for(var _=c.split("/"),i="",s=0;s<_.length;++s)if(_[s]){i+="/"+_[s];try{C.mkdir(i,d)}catch(f){if(f.errno!=20)throw f}}},mkdev(c,d,_){return typeof _>"u"&&(_=d,d=438),d|=8192,C.mknod(c,d,_)},symlink(c,d){if(!rr.resolve(c))throw new C.ErrnoError(44);var _=C.lookupPath(d,{parent:!0}),i=_.node;if(!i)throw new C.ErrnoError(44);var s=Tt.basename(d),f=C.mayCreate(i,s);if(f)throw new C.ErrnoError(f);if(!i.node_ops.symlink)throw new C.ErrnoError(63);return i.node_ops.symlink(i,s,c)},rename(c,d){var _=Tt.dirname(c),i=Tt.dirname(d),s=Tt.basename(c),f=Tt.basename(d),h,v,M;if(h=C.lookupPath(c,{parent:!0}),v=h.node,h=C.lookupPath(d,{parent:!0}),M=h.node,!v||!M)throw new C.ErrnoError(44);if(v.mount!==M.mount)throw new C.ErrnoError(75);var O=C.lookupNode(v,s),G=rr.relative(c,i);if(G.charAt(0)!==".")throw new C.ErrnoError(28);if(G=rr.relative(d,_),G.charAt(0)!==".")throw new C.ErrnoError(55);var K;try{K=C.lookupNode(M,f)}catch{}if(O!==K){var re=C.isDir(O.mode),se=C.mayDelete(v,s,re);if(se)throw new C.ErrnoError(se);if(se=K?C.mayDelete(M,f,re):C.mayCreate(M,f),se)throw new C.ErrnoError(se);if(!v.node_ops.rename)throw new C.ErrnoError(63);if(C.isMountpoint(O)||K&&C.isMountpoint(K))throw new C.ErrnoError(10);if(M!==v&&(se=C.nodePermissions(v,"w"),se))throw new C.ErrnoError(se);C.hashRemoveNode(O);try{v.node_ops.rename(O,M,f)}catch(xe){throw xe}finally{C.hashAddNode(O)}}},rmdir(c){var d=C.lookupPath(c,{parent:!0}),_=d.node,i=Tt.basename(c),s=C.lookupNode(_,i),f=C.mayDelete(_,i,!0);if(f)throw new C.ErrnoError(f);if(!_.node_ops.rmdir)throw new C.ErrnoError(63);if(C.isMountpoint(s))throw new C.ErrnoError(10);_.node_ops.rmdir(_,i),C.destroyNode(s)},readdir(c){var d=C.lookupPath(c,{follow:!0}),_=d.node;if(!_.node_ops.readdir)throw new C.ErrnoError(54);return _.node_ops.readdir(_)},unlink(c){var d=C.lookupPath(c,{parent:!0}),_=d.node;if(!_)throw new C.ErrnoError(44);var i=Tt.basename(c),s=C.lookupNode(_,i),f=C.mayDelete(_,i,!1);if(f)throw new C.ErrnoError(f);if(!_.node_ops.unlink)throw new C.ErrnoError(63);if(C.isMountpoint(s))throw new C.ErrnoError(10);_.node_ops.unlink(_,i),C.destroyNode(s)},readlink(c){var d=C.lookupPath(c),_=d.node;if(!_)throw new C.ErrnoError(44);if(!_.node_ops.readlink)throw new C.ErrnoError(28);return rr.resolve(C.getPath(_.parent),_.node_ops.readlink(_))},stat(c,d){var _=C.lookupPath(c,{follow:!d}),i=_.node;if(!i)throw new C.ErrnoError(44);if(!i.node_ops.getattr)throw new C.ErrnoError(63);return i.node_ops.getattr(i)},lstat(c){return C.stat(c,!0)},chmod(c,d,_){var i;if(typeof c=="string"){var s=C.lookupPath(c,{follow:!_});i=s.node}else i=c;if(!i.node_ops.setattr)throw new C.ErrnoError(63);i.node_ops.setattr(i,{mode:d&4095|i.mode&-4096,timestamp:Date.now()})},lchmod(c,d){C.chmod(c,d,!0)},fchmod(c,d){var _=C.getStreamChecked(c);C.chmod(_.node,d)},chown(c,d,_,i){var s;if(typeof c=="string"){var f=C.lookupPath(c,{follow:!i});s=f.node}else s=c;if(!s.node_ops.setattr)throw new C.ErrnoError(63);s.node_ops.setattr(s,{timestamp:Date.now()})},lchown(c,d,_){C.chown(c,d,_,!0)},fchown(c,d,_){var i=C.getStreamChecked(c);C.chown(i.node,d,_)},truncate(c,d){if(d<0)throw new C.ErrnoError(28);var _;if(typeof c=="string"){var i=C.lookupPath(c,{follow:!0});_=i.node}else _=c;if(!_.node_ops.setattr)throw new C.ErrnoError(63);if(C.isDir(_.mode))throw new C.ErrnoError(31);if(!C.isFile(_.mode))throw new C.ErrnoError(28);var s=C.nodePermissions(_,"w");if(s)throw new C.ErrnoError(s);_.node_ops.setattr(_,{size:d,timestamp:Date.now()})},ftruncate(c,d){var _=C.getStreamChecked(c);if((_.flags&2097155)===0)throw new C.ErrnoError(28);C.truncate(_.node,d)},utime(c,d,_){var i=C.lookupPath(c,{follow:!0}),s=i.node;s.node_ops.setattr(s,{timestamp:Math.max(d,_)})},open(c,d,_){if(c==="")throw new C.ErrnoError(44);d=typeof d=="string"?Bo(d):d,_=typeof _>"u"?438:_,d&64?_=_&4095|32768:_=0;var i;if(typeof c=="object")i=c;else{c=Tt.normalize(c);try{var s=C.lookupPath(c,{follow:!(d&131072)});i=s.node}catch{}}var f=!1;if(d&64)if(i){if(d&128)throw new C.ErrnoError(20)}else i=C.mknod(c,_,0),f=!0;if(!i)throw new C.ErrnoError(44);if(C.isChrdev(i.mode)&&(d&=-513),d&65536&&!C.isDir(i.mode))throw new C.ErrnoError(54);if(!f){var h=C.mayOpen(i,d);if(h)throw new C.ErrnoError(h)}d&512&&!f&&C.truncate(i,0),d&=-131713;var v=C.createStream({node:i,path:C.getPath(i),flags:d,seekable:!0,position:0,stream_ops:i.stream_ops,ungotten:[],error:!1});return v.stream_ops.open&&v.stream_ops.open(v),t.logReadFiles&&!(d&1)&&(C.readFiles||(C.readFiles={}),c in C.readFiles||(C.readFiles[c]=1)),v},close(c){if(C.isClosed(c))throw new C.ErrnoError(8);c.getdents&&(c.getdents=null);try{c.stream_ops.close&&c.stream_ops.close(c)}catch(d){throw d}finally{C.closeStream(c.fd)}c.fd=null},isClosed(c){return c.fd===null},llseek(c,d,_){if(C.isClosed(c))throw new C.ErrnoError(8);if(!c.seekable||!c.stream_ops.llseek)throw new C.ErrnoError(70);if(_!=0&&_!=1&&_!=2)throw new C.ErrnoError(28);return c.position=c.stream_ops.llseek(c,d,_),c.ungotten=[],c.position},read(c,d,_,i,s){if(B(_>=0),i<0||s<0)throw new C.ErrnoError(28);if(C.isClosed(c))throw new C.ErrnoError(8);if((c.flags&2097155)===1)throw new C.ErrnoError(8);if(C.isDir(c.node.mode))throw new C.ErrnoError(31);if(!c.stream_ops.read)throw new C.ErrnoError(28);var f=typeof s<"u";if(!f)s=c.position;else if(!c.seekable)throw new C.ErrnoError(70);var h=c.stream_ops.read(c,d,_,i,s);return f||(c.position+=h),h},write(c,d,_,i,s,f){if(B(_>=0),i<0||s<0)throw new C.ErrnoError(28);if(C.isClosed(c))throw new C.ErrnoError(8);if((c.flags&2097155)===0)throw new C.ErrnoError(8);if(C.isDir(c.node.mode))throw new C.ErrnoError(31);if(!c.stream_ops.write)throw new C.ErrnoError(28);c.seekable&&c.flags&1024&&C.llseek(c,0,2);var h=typeof s<"u";if(!h)s=c.position;else if(!c.seekable)throw new C.ErrnoError(70);var v=c.stream_ops.write(c,d,_,i,s,f);return h||(c.position+=v),v},allocate(c,d,_){if(C.isClosed(c))throw new C.ErrnoError(8);if(d<0||_<=0)throw new C.ErrnoError(28);if((c.flags&2097155)===0)throw new C.ErrnoError(8);if(!C.isFile(c.node.mode)&&!C.isDir(c.node.mode))throw new C.ErrnoError(43);if(!c.stream_ops.allocate)throw new C.ErrnoError(138);c.stream_ops.allocate(c,d,_)},mmap(c,d,_,i,s){if((i&2)!==0&&(s&2)===0&&(c.flags&2097155)!==2)throw new C.ErrnoError(2);if((c.flags&2097155)===1)throw new C.ErrnoError(2);if(!c.stream_ops.mmap)throw new C.ErrnoError(43);return c.stream_ops.mmap(c,d,_,i,s)},msync(c,d,_,i,s){return B(_>=0),c.stream_ops.msync?c.stream_ops.msync(c,d,_,i,s):0},munmap:c=>0,ioctl(c,d,_){if(!c.stream_ops.ioctl)throw new C.ErrnoError(59);return c.stream_ops.ioctl(c,d,_)},readFile(c,d={}){if(d.flags=d.flags||0,d.encoding=d.encoding||"binary",d.encoding!=="utf8"&&d.encoding!=="binary")throw new Error(`Invalid encoding type "${d.encoding}"`);var _,i=C.open(c,d.flags),s=C.stat(c),f=s.size,h=new Uint8Array(f);return C.read(i,h,0,f,0),d.encoding==="utf8"?_=ii(h,0):d.encoding==="binary"&&(_=h),C.close(i),_},writeFile(c,d,_={}){_.flags=_.flags||577;var i=C.open(c,_.flags,_.mode);if(typeof d=="string"){var s=new Uint8Array(Ha(d)+1),f=Ai(d,s,0,s.length);C.write(i,s,0,f,void 0,_.canOwn)}else if(ArrayBuffer.isView(d))C.write(i,d,0,d.byteLength,void 0,_.canOwn);else throw new Error("Unsupported data type");C.close(i)},cwd:()=>C.currentPath,chdir(c){var d=C.lookupPath(c,{follow:!0});if(d.node===null)throw new C.ErrnoError(44);if(!C.isDir(d.node.mode))throw new C.ErrnoError(54);var _=C.nodePermissions(d.node,"x");if(_)throw new C.ErrnoError(_);C.currentPath=d.path},createDefaultDirectories(){C.mkdir("/tmp"),C.mkdir("/home"),C.mkdir("/home/web_user")},createDefaultDevices(){C.mkdir("/dev"),C.registerDevice(C.makedev(1,3),{read:()=>0,write:(i,s,f,h,v)=>h}),C.mkdev("/dev/null",C.makedev(1,3)),gr.register(C.makedev(5,0),gr.default_tty_ops),gr.register(C.makedev(6,0),gr.default_tty1_ops),C.mkdev("/dev/tty",C.makedev(5,0)),C.mkdev("/dev/tty1",C.makedev(6,0));var c=new Uint8Array(1024),d=0,_=()=>(d===0&&(d=na(c).byteLength),c[--d]);C.createDevice("/dev","random",_),C.createDevice("/dev","urandom",_),C.mkdir("/dev/shm"),C.mkdir("/dev/shm/tmp")},createSpecialDirectories(){C.mkdir("/proc");var c=C.mkdir("/proc/self");C.mkdir("/proc/self/fd"),C.mount({mount(){var d=C.createNode(c,"fd",16895,73);return d.node_ops={lookup(_,i){var s=+i,f=C.getStreamChecked(s),h={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>f.path}};return h.parent=h,h}},d}},{},"/proc/self/fd")},createStandardStreams(){t.stdin?C.createDevice("/dev","stdin",t.stdin):C.symlink("/dev/tty","/dev/stdin"),t.stdout?C.createDevice("/dev","stdout",null,t.stdout):C.symlink("/dev/tty","/dev/stdout"),t.stderr?C.createDevice("/dev","stderr",null,t.stderr):C.symlink("/dev/tty1","/dev/stderr");var c=C.open("/dev/stdin",0),d=C.open("/dev/stdout",1),_=C.open("/dev/stderr",1);B(c.fd===0,`invalid handle for stdin (${c.fd})`),B(d.fd===1,`invalid handle for stdout (${d.fd})`),B(_.fd===2,`invalid handle for stderr (${_.fd})`)},ensureErrnoError(){C.ErrnoError||(C.ErrnoError=function(d,_){this.name="ErrnoError",this.node=_,this.setErrno=function(i){this.errno=i;for(var s in Ya)if(Ya[s]===i){this.code=s;break}},this.setErrno(d),this.message=yl[d],this.stack&&(Object.defineProperty(this,"stack",{value:new Error().stack,writable:!0}),this.stack=bl(this.stack))},C.ErrnoError.prototype=new Error,C.ErrnoError.prototype.constructor=C.ErrnoError,[44].forEach(c=>{C.genericErrors[c]=new C.ErrnoError(c),C.genericErrors[c].stack="<generic error, no stack>"}))},staticInit(){C.ensureErrnoError(),C.nameTable=new Array(4096),C.mount(dt,{},"/"),C.createDefaultDirectories(),C.createDefaultDevices(),C.createSpecialDirectories(),C.filesystems={MEMFS:dt}},init(c,d,_){B(!C.init.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"),C.init.initialized=!0,C.ensureErrnoError(),t.stdin=c||t.stdin,t.stdout=d||t.stdout,t.stderr=_||t.stderr,C.createStandardStreams()},quit(){C.init.initialized=!1,qo(0);for(var c=0;c<C.streams.length;c++){var d=C.streams[c];d&&C.close(d)}},findObject(c,d){var _=C.analyzePath(c,d);return _.exists?_.object:null},analyzePath(c,d){try{var _=C.lookupPath(c,{follow:!d});c=_.path}catch{}var i={isRoot:!1,exists:!1,error:0,name:null,path:null,object:null,parentExists:!1,parentPath:null,parentObject:null};try{var _=C.lookupPath(c,{parent:!0});i.parentExists=!0,i.parentPath=_.path,i.parentObject=_.node,i.name=Tt.basename(c),_=C.lookupPath(c,{follow:!d}),i.exists=!0,i.path=_.path,i.object=_.node,i.name=_.node.name,i.isRoot=_.path==="/"}catch(s){i.error=s.errno}return i},createPath(c,d,_,i){c=typeof c=="string"?c:C.getPath(c);for(var s=d.split("/").reverse();s.length;){var f=s.pop();if(f){var h=Tt.join2(c,f);try{C.mkdir(h)}catch{}c=h}}return h},createFile(c,d,_,i,s){var f=Tt.join2(typeof c=="string"?c:C.getPath(c),d),h=qa(i,s);return C.create(f,h)},createDataFile(c,d,_,i,s,f){var h=d;c&&(c=typeof c=="string"?c:C.getPath(c),h=d?Tt.join2(c,d):c);var v=qa(i,s),M=C.create(h,v);if(_){if(typeof _=="string"){for(var O=new Array(_.length),G=0,K=_.length;G<K;++G)O[G]=_.charCodeAt(G);_=O}C.chmod(M,v|146);var re=C.open(M,577);C.write(re,_,0,_.length,0,f),C.close(re),C.chmod(M,v)}return M},createDevice(c,d,_,i){var s=Tt.join2(typeof c=="string"?c:C.getPath(c),d),f=qa(!!_,!!i);C.createDevice.major||(C.createDevice.major=64);var h=C.makedev(C.createDevice.major++,0);return C.registerDevice(h,{open(v){v.seekable=!1},close(v){i&&i.buffer&&i.buffer.length&&i(10)},read(v,M,O,G,K){for(var re=0,se=0;se<G;se++){var xe;try{xe=_()}catch{throw new C.ErrnoError(29)}if(xe===void 0&&re===0)throw new C.ErrnoError(6);if(xe==null)break;re++,M[O+se]=xe}return re&&(v.node.timestamp=Date.now()),re},write(v,M,O,G,K){for(var re=0;re<G;re++)try{i(M[O+re])}catch{throw new C.ErrnoError(29)}return G&&(v.node.timestamp=Date.now()),re}}),C.mkdev(s,f,h)},forceLoadFile(c){if(c.isDevice||c.isFolder||c.link||c.contents)return!0;if(typeof XMLHttpRequest<"u")throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");if(T)try{c.contents=ra(T(c.url),!0),c.usedBytes=c.contents.length}catch{throw new C.ErrnoError(29)}else throw new Error("Cannot load without read() or XMLHttpRequest.")},createLazyFile(c,d,_,i,s){function f(){this.lengthKnown=!1,this.chunks=[]}if(f.prototype.get=function(se){if(!(se>this.length-1||se<0)){var xe=se%this.chunkSize,Ae=se/this.chunkSize|0;return this.getter(Ae)[xe]}},f.prototype.setDataGetter=function(se){this.getter=se},f.prototype.cacheLength=function(){var se=new XMLHttpRequest;if(se.open("HEAD",_,!1),se.send(null),!(se.status>=200&&se.status<300||se.status===304))throw new Error("Couldn't load "+_+". Status: "+se.status);var xe=Number(se.getResponseHeader("Content-length")),Ae,De=(Ae=se.getResponseHeader("Accept-Ranges"))&&Ae==="bytes",Xe=(Ae=se.getResponseHeader("Content-Encoding"))&&Ae==="gzip",me=1024*1024;De||(me=xe);var Le=(ce,ke)=>{if(ce>ke)throw new Error("invalid range ("+ce+", "+ke+") or no bytes requested!");if(ke>xe-1)throw new Error("only "+xe+" bytes available! programmer error!");var st=new XMLHttpRequest;if(st.open("GET",_,!1),xe!==me&&st.setRequestHeader("Range","bytes="+ce+"-"+ke),st.responseType="arraybuffer",st.overrideMimeType&&st.overrideMimeType("text/plain; charset=x-user-defined"),st.send(null),!(st.status>=200&&st.status<300||st.status===304))throw new Error("Couldn't load "+_+". Status: "+st.status);return st.response!==void 0?new Uint8Array(st.response||[]):ra(st.responseText||"",!0)},ht=this;ht.setDataGetter(ce=>{var ke=ce*me,st=(ce+1)*me-1;if(st=Math.min(st,xe-1),typeof ht.chunks[ce]>"u"&&(ht.chunks[ce]=Le(ke,st)),typeof ht.chunks[ce]>"u")throw new Error("doXHR failed!");return ht.chunks[ce]}),(Xe||!xe)&&(me=xe=1,xe=this.getter(0).length,me=xe,R("LazyFiles on gzip forces download of the whole file when length is accessed")),this._length=xe,this._chunkSize=me,this.lengthKnown=!0},typeof XMLHttpRequest<"u"){if(!m)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var h=new f;Object.defineProperties(h,{length:{get:function(){return this.lengthKnown||this.cacheLength(),this._length}},chunkSize:{get:function(){return this.lengthKnown||this.cacheLength(),this._chunkSize}}});var v={isDevice:!1,contents:h}}else var v={isDevice:!1,url:_};var M=C.createFile(c,d,v,i,s);v.contents?M.contents=v.contents:v.url&&(M.contents=null,M.url=v.url),Object.defineProperties(M,{usedBytes:{get:function(){return this.contents.length}}});var O={},G=Object.keys(M.stream_ops);G.forEach(re=>{var se=M.stream_ops[re];O[re]=function(){return C.forceLoadFile(M),se.apply(null,arguments)}});function K(re,se,xe,Ae,De){var Xe=re.node.contents;if(De>=Xe.length)return 0;var me=Math.min(Xe.length-De,Ae);if(B(me>=0),Xe.slice)for(var Le=0;Le<me;Le++)se[xe+Le]=Xe[De+Le];else for(var Le=0;Le<me;Le++)se[xe+Le]=Xe.get(De+Le);return me}return O.read=(re,se,xe,Ae,De)=>(C.forceLoadFile(M),K(re,se,xe,Ae,De)),O.mmap=(re,se,xe,Ae,De)=>{C.forceLoadFile(M);var Xe=ko();if(!Xe)throw new C.ErrnoError(48);return K(re,Y,Xe,se,xe),{ptr:Xe,allocated:!0}},M.stream_ops=O,M},absolutePath(){N("FS.absolutePath has been removed; use PATH_FS.resolve instead")},createFolder(){N("FS.createFolder has been removed; use FS.mkdir instead")},createLink(){N("FS.createLink has been removed; use FS.symlink instead")},joinPath(){N("FS.joinPath has been removed; use PATH.join instead")},mmapAlloc(){N("FS.mmapAlloc has been replaced by the top level function mmapAlloc")},standardizePath(){N("FS.standardizePath has been removed; use PATH.normalize instead")}},ir={DEFAULT_POLLMASK:5,calculateAt(c,d,_){if(Tt.isAbs(d))return d;var i;if(c===-100)i=C.cwd();else{var s=ir.getStreamFromFD(c);i=s.path}if(d.length==0){if(!_)throw new C.ErrnoError(44);return i}return Tt.join2(i,d)},doStat(c,d,_){try{var i=c(d)}catch(v){if(v&&v.node&&Tt.normalize(d)!==Tt.normalize(C.getPath(v.node)))return-54;throw v}ue[_>>2]=i.dev,ue[_+4>>2]=i.mode,te[_+8>>2]=i.nlink,ue[_+12>>2]=i.uid,ue[_+16>>2]=i.gid,ue[_+20>>2]=i.rdev,we=[i.size>>>0,(fe=i.size,+Math.abs(fe)>=1?fe>0?+Math.floor(fe/4294967296)>>>0:~~+Math.ceil((fe-+(~~fe>>>0))/4294967296)>>>0:0)],ue[_+24>>2]=we[0],ue[_+28>>2]=we[1],ue[_+32>>2]=4096,ue[_+36>>2]=i.blocks;var s=i.atime.getTime(),f=i.mtime.getTime(),h=i.ctime.getTime();return we=[Math.floor(s/1e3)>>>0,(fe=Math.floor(s/1e3),+Math.abs(fe)>=1?fe>0?+Math.floor(fe/4294967296)>>>0:~~+Math.ceil((fe-+(~~fe>>>0))/4294967296)>>>0:0)],ue[_+40>>2]=we[0],ue[_+44>>2]=we[1],te[_+48>>2]=s%1e3*1e3,we=[Math.floor(f/1e3)>>>0,(fe=Math.floor(f/1e3),+Math.abs(fe)>=1?fe>0?+Math.floor(fe/4294967296)>>>0:~~+Math.ceil((fe-+(~~fe>>>0))/4294967296)>>>0:0)],ue[_+56>>2]=we[0],ue[_+60>>2]=we[1],te[_+64>>2]=f%1e3*1e3,we=[Math.floor(h/1e3)>>>0,(fe=Math.floor(h/1e3),+Math.abs(fe)>=1?fe>0?+Math.floor(fe/4294967296)>>>0:~~+Math.ceil((fe-+(~~fe>>>0))/4294967296)>>>0:0)],ue[_+72>>2]=we[0],ue[_+76>>2]=we[1],te[_+80>>2]=h%1e3*1e3,we=[i.ino>>>0,(fe=i.ino,+Math.abs(fe)>=1?fe>0?+Math.floor(fe/4294967296)>>>0:~~+Math.ceil((fe-+(~~fe>>>0))/4294967296)>>>0:0)],ue[_+88>>2]=we[0],ue[_+92>>2]=we[1],0},doMsync(c,d,_,i,s){if(!C.isFile(d.node.mode))throw new C.ErrnoError(43);if(i&2)return 0;var f=Z.slice(c,c+_);C.msync(d,f,s,_,i)},varargs:void 0,get(){B(ir.varargs!=null);var c=ue[+ir.varargs>>2];return ir.varargs+=4,c},getp(){return ir.get()},getStr(c){var d=ai(c);return d},getStreamFromFD(c){var d=C.getStreamChecked(c);return d}},El=(c,d)=>{var _=0;return Ci().forEach((i,s)=>{var f=d+_;te[c+s*4>>2]=f,dl(i,f),_+=i.length+1}),0},Ml=(c,d)=>{var _=Ci();te[c>>2]=_.length;var i=0;return _.forEach(s=>i+=s.length+1),te[d>>2]=i,0},wl=0,Tl=c=>{z=c,o(c,new Ce(c))},zo=(c,d)=>{if(z=c,Zo(),!d){var _=`program exited (with status: ${c}), but keepRuntimeAlive() is set (counter=${wl}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;a(_),F(_)}Tl(c)},Go=zo;function ja(c){try{var d=ir.getStreamFromFD(c);return C.close(d),0}catch(_){if(typeof C>"u"||_.name!=="ErrnoError")throw _;return _.errno}}var Al=(c,d,_,i)=>{for(var s=0,f=0;f<_;f++){var h=te[d>>2],v=te[d+4>>2];d+=8;var M=C.read(c,Y,h,v,i);if(M<0)return-1;if(s+=M,M<v)break}return s};function Cl(c,d,_,i){try{var s=ir.getStreamFromFD(c),f=Al(s,d,_);return te[i>>2]=f,0}catch(h){if(typeof C>"u"||h.name!=="ErrnoError")throw h;return h.errno}}var Rl=(c,d)=>(B(c==c>>>0||c==(c|0)),B(d===(d|0)),d+2097152>>>0<4194305-!!c?(c>>>0)+d*4294967296:NaN);function Pl(c,d,_,i,s){var f=Rl(d,_);try{if(isNaN(f))return 61;var h=ir.getStreamFromFD(c);return C.llseek(h,f,i),we=[h.position>>>0,(fe=h.position,+Math.abs(fe)>=1?fe>0?+Math.floor(fe/4294967296)>>>0:~~+Math.ceil((fe-+(~~fe>>>0))/4294967296)>>>0:0)],ue[s>>2]=we[0],ue[s+4>>2]=we[1],h.getdents&&f===0&&i===0&&(h.getdents=null),0}catch(v){if(typeof C>"u"||v.name!=="ErrnoError")throw v;return v.errno}}var Dl=(c,d,_,i)=>{for(var s=0,f=0;f<_;f++){var h=te[d>>2],v=te[d+4>>2];d+=8;var M=C.write(c,Y,h,v,i);if(M<0)return-1;s+=M}return s};function Ll(c,d,_,i){try{var s=ir.getStreamFromFD(c),f=Dl(s,d,_);return te[i>>2]=f,0}catch(h){if(typeof C>"u"||h.name!=="ErrnoError")throw h;return h.errno}}var ia=c=>c%4===0&&(c%100!==0||c%400===0),Fl=(c,d)=>{for(var _=0,i=0;i<=d;_+=c[i++]);return _},Ho=[31,29,31,30,31,30,31,31,30,31,30,31],Vo=[31,28,31,30,31,30,31,31,30,31,30,31],Il=(c,d)=>{for(var _=new Date(c.getTime());d>0;){var i=ia(_.getFullYear()),s=_.getMonth(),f=(i?Ho:Vo)[s];if(d>f-_.getDate())d-=f-_.getDate()+1,_.setDate(1),s<11?_.setMonth(s+1):(_.setMonth(0),_.setFullYear(_.getFullYear()+1));else return _.setDate(_.getDate()+d),_}return _},Ul=(c,d)=>{B(c.length>=0,"writeArrayToMemory array must have a length (should be an array or typed array)"),Y.set(c,d)},Nl=(c,d,_,i)=>{var s=te[i+40>>2],f={tm_sec:ue[i>>2],tm_min:ue[i+4>>2],tm_hour:ue[i+8>>2],tm_mday:ue[i+12>>2],tm_mon:ue[i+16>>2],tm_year:ue[i+20>>2],tm_wday:ue[i+24>>2],tm_yday:ue[i+28>>2],tm_isdst:ue[i+32>>2],tm_gmtoff:ue[i+36>>2],tm_zone:s?ai(s):""},h=ai(_),v={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var M in v)h=h.replace(new RegExp(M,"g"),v[M]);var O=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],G=["January","February","March","April","May","June","July","August","September","October","November","December"];function K(me,Le,ht){for(var ce=typeof me=="number"?me.toString():me||"";ce.length<Le;)ce=ht[0]+ce;return ce}function re(me,Le){return K(me,Le,"0")}function se(me,Le){function ht(ke){return ke<0?-1:ke>0?1:0}var ce;return(ce=ht(me.getFullYear()-Le.getFullYear()))===0&&(ce=ht(me.getMonth()-Le.getMonth()))===0&&(ce=ht(me.getDate()-Le.getDate())),ce}function xe(me){switch(me.getDay()){case 0:return new Date(me.getFullYear()-1,11,29);case 1:return me;case 2:return new Date(me.getFullYear(),0,3);case 3:return new Date(me.getFullYear(),0,2);case 4:return new Date(me.getFullYear(),0,1);case 5:return new Date(me.getFullYear()-1,11,31);case 6:return new Date(me.getFullYear()-1,11,30)}}function Ae(me){var Le=Il(new Date(me.tm_year+1900,0,1),me.tm_yday),ht=new Date(Le.getFullYear(),0,4),ce=new Date(Le.getFullYear()+1,0,4),ke=xe(ht),st=xe(ce);return se(ke,Le)<=0?se(st,Le)<=0?Le.getFullYear()+1:Le.getFullYear():Le.getFullYear()-1}var De={"%a":me=>O[me.tm_wday].substring(0,3),"%A":me=>O[me.tm_wday],"%b":me=>G[me.tm_mon].substring(0,3),"%B":me=>G[me.tm_mon],"%C":me=>{var Le=me.tm_year+1900;return re(Le/100|0,2)},"%d":me=>re(me.tm_mday,2),"%e":me=>K(me.tm_mday,2," "),"%g":me=>Ae(me).toString().substring(2),"%G":me=>Ae(me),"%H":me=>re(me.tm_hour,2),"%I":me=>{var Le=me.tm_hour;return Le==0?Le=12:Le>12&&(Le-=12),re(Le,2)},"%j":me=>re(me.tm_mday+Fl(ia(me.tm_year+1900)?Ho:Vo,me.tm_mon-1),3),"%m":me=>re(me.tm_mon+1,2),"%M":me=>re(me.tm_min,2),"%n":()=>`
`,"%p":me=>me.tm_hour>=0&&me.tm_hour<12?"AM":"PM","%S":me=>re(me.tm_sec,2),"%t":()=>"	","%u":me=>me.tm_wday||7,"%U":me=>{var Le=me.tm_yday+7-me.tm_wday;return re(Math.floor(Le/7),2)},"%V":me=>{var Le=Math.floor((me.tm_yday+7-(me.tm_wday+6)%7)/7);if((me.tm_wday+371-me.tm_yday-2)%7<=2&&Le++,Le){if(Le==53){var ce=(me.tm_wday+371-me.tm_yday)%7;ce!=4&&(ce!=3||!ia(me.tm_year))&&(Le=1)}}else{Le=52;var ht=(me.tm_wday+7-me.tm_yday-1)%7;(ht==4||ht==5&&ia(me.tm_year%400-1))&&Le++}return re(Le,2)},"%w":me=>me.tm_wday,"%W":me=>{var Le=me.tm_yday+7-(me.tm_wday+6)%7;return re(Math.floor(Le/7),2)},"%y":me=>(me.tm_year+1900).toString().substring(2),"%Y":me=>me.tm_year+1900,"%z":me=>{var Le=me.tm_gmtoff,ht=Le>=0;return Le=Math.abs(Le)/60,Le=Le/60*100+Le%60,(ht?"+":"-")+("0000"+Le).slice(-4)},"%Z":me=>me.tm_zone,"%%":()=>"%"};h=h.replace(/%%/g,"\0\0");for(var M in De)h.includes(M)&&(h=h.replace(new RegExp(M,"g"),De[M](f)));h=h.replace(/\0\0/g,"%");var Xe=ra(h,!1);return Xe.length>d?0:(Ul(Xe,c),Xe.length-1)},Ol=(c,d,_,i,s)=>Nl(c,d,_,i),kl=c=>{if(c instanceof Ce||c=="unwind")return z;pt(),c instanceof WebAssembly.RuntimeError&&Za()<=0&&F("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)"),o(1,c)};A=t.InternalError=class extends Error{constructor(d){super(d),this.name="InternalError"}},Zi(),Lr=t.BindingError=class extends Error{constructor(d){super(d),this.name="BindingError"}},ni(),ee(),an=t.UnboundTypeError=$t(Error,"UnboundTypeError");var Wo=function(c,d,_,i){c||(c=this),this.parent=c,this.mount=c.mount,this.mounted=null,this.id=C.nextInode++,this.name=d,this.mode=_,this.node_ops={},this.stream_ops={},this.rdev=i},oi=365,aa=146;Object.defineProperties(Wo.prototype,{read:{get:function(){return(this.mode&oi)===oi},set:function(c){c?this.mode|=oi:this.mode&=~oi}},write:{get:function(){return(this.mode&aa)===aa},set:function(c){c?this.mode|=aa:this.mode&=~aa}},isFolder:{get:function(){return C.isDir(this.mode)}},isDevice:{get:function(){return C.isChrdev(this.mode)}}}),C.FSNode=Wo,C.createPreloadedFile=xl,C.staticInit(),Ya={EPERM:63,ENOENT:44,ESRCH:71,EINTR:27,EIO:29,ENXIO:60,E2BIG:1,ENOEXEC:45,EBADF:8,ECHILD:12,EAGAIN:6,EWOULDBLOCK:6,ENOMEM:48,EACCES:2,EFAULT:21,ENOTBLK:105,EBUSY:10,EEXIST:20,EXDEV:75,ENODEV:43,ENOTDIR:54,EISDIR:31,EINVAL:28,ENFILE:41,EMFILE:33,ENOTTY:59,ETXTBSY:74,EFBIG:22,ENOSPC:51,ESPIPE:70,EROFS:69,EMLINK:34,EPIPE:64,EDOM:18,ERANGE:68,ENOMSG:49,EIDRM:24,ECHRNG:106,EL2NSYNC:156,EL3HLT:107,EL3RST:108,ELNRNG:109,EUNATCH:110,ENOCSI:111,EL2HLT:112,EDEADLK:16,ENOLCK:46,EBADE:113,EBADR:114,EXFULL:115,ENOANO:104,EBADRQC:103,EBADSLT:102,EDEADLOCK:16,EBFONT:101,ENOSTR:100,ENODATA:116,ETIME:117,ENOSR:118,ENONET:119,ENOPKG:120,EREMOTE:121,ENOLINK:47,EADV:122,ESRMNT:123,ECOMM:124,EPROTO:65,EMULTIHOP:36,EDOTDOT:125,EBADMSG:9,ENOTUNIQ:126,EBADFD:127,EREMCHG:128,ELIBACC:129,ELIBBAD:130,ELIBSCN:131,ELIBMAX:132,ELIBEXEC:133,ENOSYS:52,ENOTEMPTY:55,ENAMETOOLONG:37,ELOOP:32,EOPNOTSUPP:138,EPFNOSUPPORT:139,ECONNRESET:15,ENOBUFS:42,EAFNOSUPPORT:5,EPROTOTYPE:67,ENOTSOCK:57,ENOPROTOOPT:50,ESHUTDOWN:140,ECONNREFUSED:14,EADDRINUSE:3,ECONNABORTED:13,ENETUNREACH:40,ENETDOWN:38,ETIMEDOUT:73,EHOSTDOWN:142,EHOSTUNREACH:23,EINPROGRESS:26,EALREADY:7,EDESTADDRREQ:17,EMSGSIZE:35,EPROTONOSUPPORT:66,ESOCKTNOSUPPORT:137,EADDRNOTAVAIL:4,ENETRESET:39,EISCONN:30,ENOTCONN:53,ETOOMANYREFS:141,EUSERS:136,EDQUOT:19,ESTALE:72,ENOTSUP:138,ENOMEDIUM:148,EILSEQ:25,EOVERFLOW:61,ECANCELED:11,ENOTRECOVERABLE:56,EOWNERDEAD:62,ESTRPIPE:135};function Ri(){Be("fetchSettings")}var Xo={__cxa_throw:It,_embind_finalize_value_object:Ki,_embind_register_bigint:ti,_embind_register_bool:Ji,_embind_register_emval:Ne,_embind_register_float:Je,_embind_register_function:wi,_embind_register_integer:Qi,_embind_register_memory_view:Ti,_embind_register_std_string:tl,_embind_register_std_wstring:Fo,_embind_register_value_object:Io,_embind_register_value_object_field:al,_embind_register_void:ol,_emscripten_throw_longjmp:tr,_emval_decref:ae,_emval_incref:sl,_emval_new_cstring:Oo,_emval_take_value:Va,abort:nr,emscripten_memcpy_js:Wa,emscripten_resize_heap:En,environ_get:El,environ_sizes_get:Ml,exit:Go,fd_close:ja,fd_read:Cl,fd_seek:Pl,fd_write:Ll,invoke_ii:Gl,invoke_iii:Xl,invoke_iiii:Wl,invoke_iiiii:k,invoke_vi:Hl,invoke_viii:Vl,strftime_l:Ol},ar=ve(),$o=de("malloc"),Bl=t._main=de("main"),vr=de("free"),zl=de("__getTypeName");t.__embind_initialize_bindings=de("_embind_initialize_bindings");var qo=t._fflush=de("fflush"),si=de("setThrew"),Yo=()=>(Yo=ar.emscripten_stack_init)(),Ka=()=>(Ka=ar.emscripten_stack_get_end)(),or=de("stackSave"),li=de("stackRestore"),Za=()=>(Za=ar.emscripten_stack_get_current)(),jo=de("__cxa_is_pointer_type");t.dynCall_jiji=de("dynCall_jiji"),t.dynCall_viijii=de("dynCall_viijii"),t.dynCall_iiiiij=de("dynCall_iiiiij"),t.dynCall_iiiiijj=de("dynCall_iiiiijj"),t.dynCall_iiiiiijj=de("dynCall_iiiiiijj");function Gl(c,d){var _=or();try{return rn(c)(d)}catch(i){if(li(_),i!==i+0)throw i;si(1,0)}}function Hl(c,d){var _=or();try{rn(c)(d)}catch(i){if(li(_),i!==i+0)throw i;si(1,0)}}function Vl(c,d,_,i){var s=or();try{rn(c)(d,_,i)}catch(f){if(li(s),f!==f+0)throw f;si(1,0)}}function Wl(c,d,_,i){var s=or();try{return rn(c)(d,_,i)}catch(f){if(li(s),f!==f+0)throw f;si(1,0)}}function Xl(c,d,_){var i=or();try{return rn(c)(d,_)}catch(s){if(li(i),s!==s+0)throw s;si(1,0)}}function k(c,d,_,i,s){var f=or();try{return rn(c)(d,_,i,s)}catch(h){if(li(f),h!==h+0)throw h;si(1,0)}}var Ko=["writeI53ToI64","writeI53ToI64Clamped","writeI53ToI64Signaling","writeI53ToU64Clamped","writeI53ToU64Signaling","readI53FromI64","readI53FromU64","convertI32PairToI53","convertU32PairToI53","ydayFromDate","setErrNo","inetPton4","inetNtop4","inetPton6","inetNtop6","readSockaddr","writeSockaddr","getHostByName","getCallstack","emscriptenLog","convertPCtoSourceLocation","readEmAsmArgs","jstoi_q","jstoi_s","listenOnce","autoResumeAudioContext","runtimeKeepalivePush","runtimeKeepalivePop","callUserCallback","maybeExit","asmjsMangle","getNativeTypeSize","STACK_SIZE","STACK_ALIGN","POINTER_SIZE","ASSERTIONS","getCFunc","ccall","cwrap","uleb128Encode","sigToWasmTypes","generateFuncType","convertJsFunctionToWasm","getEmptyTableSlot","updateTableMap","getFunctionAddress","addFunction","removeFunction","reallyNegative","unSign","strLen","reSign","formatString","intArrayToString","AsciiToString","stringToNewUTF8","stringToUTF8OnStack","registerKeyEventCallback","maybeCStringToJsString","findEventTarget","findCanvasEventTarget","getBoundingClientRect","fillMouseEventData","registerMouseEventCallback","registerWheelEventCallback","registerUiEventCallback","registerFocusEventCallback","fillDeviceOrientationEventData","registerDeviceOrientationEventCallback","fillDeviceMotionEventData","registerDeviceMotionEventCallback","screenOrientation","fillOrientationChangeEventData","registerOrientationChangeEventCallback","fillFullscreenChangeEventData","registerFullscreenChangeEventCallback","JSEvents_requestFullscreen","JSEvents_resizeCanvasForFullscreen","registerRestoreOldStyle","hideEverythingExceptGivenElement","restoreHiddenElements","setLetterbox","softFullscreenResizeWebGLRenderTarget","doRequestFullscreen","fillPointerlockChangeEventData","registerPointerlockChangeEventCallback","registerPointerlockErrorEventCallback","requestPointerLock","fillVisibilityChangeEventData","registerVisibilityChangeEventCallback","registerTouchEventCallback","fillGamepadEventData","registerGamepadEventCallback","registerBeforeUnloadEventCallback","fillBatteryEventData","battery","registerBatteryEventCallback","setCanvasElementSize","getCanvasElementSize","jsStackTrace","stackTrace","checkWasiClock","wasiRightsToMuslOFlags","wasiOFlagsToMuslOFlags","createDyncallWrapper","safeSetTimeout","setImmediateWrapped","clearImmediateWrapped","polyfillSetImmediate","getPromise","makePromise","idsToPromises","makePromiseCallback","findMatchingCatch","setMainLoop","getSocketFromFD","getSocketAddress","FS_unlink","FS_mkdirTree","_setNetworkCallback","heapObjectForWebGLType","heapAccessShiftForWebGLHeap","webgl_enable_ANGLE_instanced_arrays","webgl_enable_OES_vertex_array_object","webgl_enable_WEBGL_draw_buffers","webgl_enable_WEBGL_multi_draw","emscriptenWebGLGet","computeUnpackAlignedImageSize","colorChannelsInGlTextureFormat","emscriptenWebGLGetTexPixelData","__glGenObject","emscriptenWebGLGetUniform","webglGetUniformLocation","webglPrepareUniformLocationsBeforeFirstUse","webglGetLeftBracePos","emscriptenWebGLGetVertexAttrib","__glGetActiveAttribOrUniform","writeGLArray","registerWebGlEventCallback","runAndAbortIfError","SDL_unicode","SDL_ttfContext","SDL_audio","ALLOC_NORMAL","ALLOC_STACK","allocate","writeStringToMemory","writeAsciiToMemory","getFunctionArgsName","init_embind","getBasestPointer","registerInheritedInstance","unregisterInheritedInstance","getInheritedInstance","getInheritedInstanceCount","getLiveInheritedInstances","enumReadValueFromPointer","genericPointerToWireType","constNoSmartPtrRawPointerToWireType","nonConstNoSmartPtrRawPointerToWireType","init_RegisteredPointer","RegisteredPointer","RegisteredPointer_fromWireType","runDestructor","releaseClassHandle","detachFinalizer","attachFinalizer","makeClassHandle","init_ClassHandle","ClassHandle","throwInstanceAlreadyDeleted","flushPendingDeletes","setDelayFunction","RegisteredClass","shallowCopyInternalPointer","downcastPointer","upcastPointer","validateThis","craftEmvalAllocator","emval_get_global","emval_lookupTypes","emval_addMethodCaller"];Ko.forEach(Ie);var xr=["run","addOnPreRun","addOnInit","addOnPreMain","addOnExit","addOnPostRun","addRunDependency","removeRunDependency","FS_createFolder","FS_createPath","FS_createLazyFile","FS_createLink","FS_createDevice","FS_readFile","out","err","callMain","abort","wasmMemory","wasmExports","stackAlloc","stackSave","stackRestore","getTempRet0","setTempRet0","writeStackCookie","checkStackCookie","convertI32PairToI53Checked","ptrToString","zeroMemory","exitJS","getHeapMax","growMemory","ENV","MONTH_DAYS_REGULAR","MONTH_DAYS_LEAP","MONTH_DAYS_REGULAR_CUMULATIVE","MONTH_DAYS_LEAP_CUMULATIVE","isLeapYear","arraySum","addDays","ERRNO_CODES","ERRNO_MESSAGES","DNS","Protocols","Sockets","initRandomFill","randomFill","timers","warnOnce","UNWIND_CACHE","readEmAsmArgsArray","getExecutableName","dynCallLegacy","getDynCaller","dynCall","handleException","keepRuntimeAlive","asyncLoad","alignMemory","mmapAlloc","handleAllocatorInit","HandleAllocator","wasmTable","noExitRuntime","freeTableIndexes","functionsInTableMap","setValue","getValue","PATH","PATH_FS","UTF8Decoder","UTF8ArrayToString","UTF8ToString","stringToUTF8Array","stringToUTF8","lengthBytesUTF8","intArrayFromString","stringToAscii","UTF16Decoder","UTF16ToString","stringToUTF16","lengthBytesUTF16","UTF32ToString","stringToUTF32","lengthBytesUTF32","writeArrayToMemory","JSEvents","specialHTMLTargets","currentFullscreenStrategy","restoreOldWindowedStyle","demangle","demangleAll","ExitStatus","getEnvStrings","doReadv","doWritev","promiseMap","uncaughtExceptionCount","exceptionLast","exceptionCaught","ExceptionInfo","Browser","wget","SYSCALLS","preloadPlugins","FS_createPreloadedFile","FS_modeStringToFlags","FS_getMode","FS_stdin_getChar_buffer","FS_stdin_getChar","FS","FS_createDataFile","MEMFS","TTY","PIPEFS","SOCKFS","tempFixedLengthArray","miniTempWebGLFloatBuffers","miniTempWebGLIntBuffers","GL","emscripten_webgl_power_preferences","AL","GLUT","EGL","GLEW","IDBStore","SDL","SDL_gfx","allocateUTF8","allocateUTF8OnStack","InternalError","BindingError","throwInternalError","throwBindingError","registeredTypes","awaitingDependencies","typeDependencies","tupleRegistrations","structRegistrations","sharedRegisterType","whenDependentTypesAreResolved","embind_charCodes","embind_init_charCodes","readLatin1String","getTypeName","getFunctionName","heap32VectorToArray","requireRegisteredType","UnboundTypeError","PureVirtualError","GenericWireTypeSize","throwUnboundTypeError","ensureOverloadTable","exposePublicSymbol","replacePublicSymbol","extendError","createNamedFunction","embindRepr","registeredInstances","registeredPointers","registerType","integerReadValueFromPointer","floatReadValueFromPointer","simpleReadValueFromPointer","readPointer","runDestructors","newFunc","craftInvokerFunction","embind__requireFunction","finalizationRegistry","detachFinalizer_deps","deletionQueue","delayFunction","char_0","char_9","makeLegalFunctionName","emval_handles","emval_symbols","init_emval","count_emval_handles","getStringOrSymbol","Emval","emval_newers","emval_methodCallers"];xr.forEach(Pe);var oa;ut=function c(){oa||Ja(),oa||(ut=c)};function $l(){B(nt==0,'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])'),B(yt.length==0,"cannot call main when preRun functions remain to be called");var c=Bl,d=0,_=0;try{var i=c(d,_);return zo(i,!0),i}catch(s){return kl(s)}}function sa(){Yo(),ct()}function Ja(){if(nt>0||(sa(),Qe(),nt>0))return;function c(){oa||(oa=!0,t.calledRun=!0,!w&&($e(),ft(),r(t),t.onRuntimeInitialized&&t.onRuntimeInitialized(),sr&&$l(),Lt()))}t.setStatus?(t.setStatus("Running..."),setTimeout(function(){setTimeout(function(){t.setStatus("")},1),c()},1)):c(),pt()}function Zo(){var c=R,d=F,_=!1;R=F=i=>{_=!0};try{qo(0),["stdout","stderr"].forEach(function(i){var s=C.analyzePath("/dev/"+i);if(s){var f=s.object,h=f.rdev,v=gr.ttys[h];v&&v.output&&v.output.length&&(_=!0)}})}catch{}R=c,F=d,_&&ze("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.")}if(t.preInit)for(typeof t.preInit=="function"&&(t.preInit=[t.preInit]);t.preInit.length>0;)t.preInit.pop()();var sr=!0;return t.noInitialRun&&(sr=!1),Ja(),e.ready})})();let Ac;const Ly=async()=>(Ac||(Ac=await Dy()),Ac),Fy=async n=>{const e=await Ly();if(n.sdr.mimeType!=="image/jpeg")throw new Error("This function expects an SDR image compressed in jpeg");if(n.gainMap.mimeType!=="image/jpeg")throw new Error("This function expects a GainMap image compressed in jpeg");return e.appendGainMap(n.sdr.width,n.sdr.height,n.sdr.data,n.sdr.data.length,n.gainMap.data,n.gainMap.data.length,n.gainMapMax.reduce((t,r)=>t+r,0)/n.gainMapMax.length,n.gainMapMin.reduce((t,r)=>t+r,0)/n.gainMapMin.length,n.gamma.reduce((t,r)=>t+r,0)/n.gamma.length,n.offsetSdr.reduce((t,r)=>t+r,0)/n.offsetSdr.length,n.offsetHdr.reduce((t,r)=>t+r,0)/n.offsetHdr.length,n.hdrCapacityMin,n.hdrCapacityMax)};function Ph(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}function Iy(n){if(Object.prototype.hasOwnProperty.call(n,"__esModule"))return n;var e=n.default;if(typeof e=="function"){var t=function r(){var a=!1;try{a=this instanceof r}catch{}return a?Reflect.construct(e,arguments,this.constructor):e.apply(this,arguments)};t.prototype=e.prototype}else t={};return Object.defineProperty(t,"__esModule",{value:!0}),Object.keys(n).forEach(function(r){var a=Object.getOwnPropertyDescriptor(n,r);Object.defineProperty(t,r,a.get?a:{enumerable:!0,get:function(){return n[r]}})}),t}var Es={exports:{}},ud;function Uy(){return ud||(ud=1,(function(n,e){(function(){var t={};t.version="1.0.4",t.remove=function(I){var R=!1;if(I.slice(0,2)!="ÿØ")if(I.slice(0,23)=="data:image/jpeg;base64,"||I.slice(0,22)=="data:image/jpg;base64,")I=y(I.split(",")[1]),R=!0;else throw new Error("Given data is not jpeg.");var F=E(I),W=F.filter(function(w){return!(w.slice(0,2)=="ÿá"&&w.slice(4,10)=="Exif\0\0")}),D=W.join("");return R&&(D="data:image/jpeg;base64,"+x(D)),D},t.insert=function(I,R){var F=!1;if(I.slice(0,6)!="Exif\0\0")throw new Error("Given data is not exif.");if(R.slice(0,2)!="ÿØ")if(R.slice(0,23)=="data:image/jpeg;base64,"||R.slice(0,22)=="data:image/jpg;base64,")R=y(R.split(",")[1]),F=!0;else throw new Error("Given data is not jpeg.");var W="ÿá"+S(">H",[I.length+2])+I,D=E(R),w=V(D,W);return F&&(w="data:image/jpeg;base64,"+x(w)),w},t.load=function(I){var R;if(typeof I=="string")if(I.slice(0,2)=="ÿØ")R=I;else if(I.slice(0,23)=="data:image/jpeg;base64,"||I.slice(0,22)=="data:image/jpg;base64,")R=y(I.split(",")[1]);else if(I.slice(0,4)=="Exif")R=I.slice(6);else throw new Error("'load' gots invalid file data.");else throw new Error("'load' gots invalid type argument.");var F={"0th":{},Exif:{},GPS:{},Interop:{},"1st":{},thumbnail:null},W=new g(R);if(W.tiftag===null)return F;W.tiftag.slice(0,2)=="II"?W.endian_mark="<":W.endian_mark=">";var D=T(W.endian_mark+"L",W.tiftag.slice(4,8))[0];F["0th"]=W.get_ifd(D,"0th");var w=F["0th"].first_ifd_pointer;if(delete F["0th"].first_ifd_pointer,34665 in F["0th"]&&(D=F["0th"][34665],F.Exif=W.get_ifd(D,"Exif")),34853 in F["0th"]&&(D=F["0th"][34853],F.GPS=W.get_ifd(D,"GPS")),40965 in F.Exif&&(D=F.Exif[40965],F.Interop=W.get_ifd(D,"Interop")),w!="\0\0\0\0"&&(D=T(W.endian_mark+"L",w)[0],F["1st"]=W.get_ifd(D,"1st"),513 in F["1st"]&&514 in F["1st"])){var z=F["1st"][513]+F["1st"][514],B=W.tiftag.slice(F["1st"][513],z);F.thumbnail=B}return F},t.dump=function(I){var R=8,F=r(I),W="Exif\0\0MM\0*\0\0\0\b",D=!1,w=!1,z=!1,B=!1,Y,Z,j,J,ue;"0th"in F?Y=F["0th"]:Y={},"Exif"in F&&Object.keys(F.Exif).length||"Interop"in F&&Object.keys(F.Interop).length?(Y[34665]=1,D=!0,Z=F.Exif,"Interop"in F&&Object.keys(F.Interop).length?(Z[40965]=1,z=!0,j=F.Interop):Object.keys(Z).indexOf(t.ExifIFD.InteroperabilityTag.toString())>-1&&delete Z[40965]):Object.keys(Y).indexOf(t.ImageIFD.ExifTag.toString())>-1&&delete Y[34665],"GPS"in F&&Object.keys(F.GPS).length?(Y[t.ImageIFD.GPSTag]=1,w=!0,J=F.GPS):Object.keys(Y).indexOf(t.ImageIFD.GPSTag.toString())>-1&&delete Y[t.ImageIFD.GPSTag],"1st"in F&&"thumbnail"in F&&F.thumbnail!=null&&(B=!0,F["1st"][513]=1,F["1st"][514]=1,ue=F["1st"]);var te=m(Y,"0th",0),Se=te[0].length+D*12+w*12+4+te[1].length,be,Ye="",ct=0,pt,yt="",vt=0,_e,ge="",Oe=0,Qe,$e="",ft;if(D&&(be=m(Z,"Exif",Se),ct=be[0].length+z*12+be[1].length),w&&(pt=m(J,"GPS",Se+ct),yt=pt.join(""),vt=yt.length),z){var Lt=Se+ct+vt;_e=m(j,"Interop",Lt),ge=_e.join(""),Oe=ge.length}if(B){var Lt=Se+ct+vt+Oe;if(Qe=m(ue,"1st",Lt),ft=a(F.thumbnail),ft.length>64e3)throw new Error("Given thumbnail is too large. max 64kB")}var Re="",lt="",$="",nt="\0\0\0\0";if(D){var rt=R+Se,ut=S(">L",[rt]),Ue=34665,bt=S(">H",[Ue]),qe=S(">H",[H.Long]),it=S(">L",[1]);Re=bt+qe+it+ut}if(w){var rt=R+Se+ct,ut=S(">L",[rt]),Ue=34853,bt=S(">H",[Ue]),qe=S(">H",[H.Long]),it=S(">L",[1]);lt=bt+qe+it+ut}if(z){var rt=R+Se+ct+vt,ut=S(">L",[rt]),Ue=40965,bt=S(">H",[Ue]),qe=S(">H",[H.Long]),it=S(">L",[1]);$=bt+qe+it+ut}if(B){var rt=R+Se+ct+vt+Oe;nt=S(">L",[rt]);var N=rt+Qe[0].length+24+4+Qe[1].length,P="\0\0\0\0"+S(">L",[N]),ne="\0\0\0\0"+S(">L",[ft.length]);$e=Qe[0]+P+ne+"\0\0\0\0"+Qe[1]+ft}var he=te[0]+Re+lt+nt+te[1];return D&&(Ye=be[0]+$+be[1]),W+he+Ye+yt+ge+$e};function r(I){return JSON.parse(JSON.stringify(I))}function a(I){for(var R=E(I);"ÿà"<=R[1].slice(0,2)&&R[1].slice(0,2)<="ÿï";)R=[R[0]].concat(R.slice(2));return R.join("")}function l(I){return S(">"+L("B",I.length),I)}function u(I){return S(">"+L("H",I.length),I)}function o(I){return S(">"+L("L",I.length),I)}function p(I,R,F){var W="",D="",w,z,B,Y;if(R=="Byte")w=I.length,w<=4?D=l(I)+L("\0",4-w):(D=S(">L",[F]),W=l(I));else if(R=="Short")w=I.length,w<=2?D=u(I)+L("\0\0",2-w):(D=S(">L",[F]),W=u(I));else if(R=="Long")w=I.length,w<=1?D=o(I):(D=S(">L",[F]),W=o(I));else if(R=="Ascii")z=I+"\0",w=z.length,w>4?(D=S(">L",[F]),W=z):D=z+L("\0",4-w);else if(R=="Rational"){if(typeof I[0]=="number")w=1,B=I[0],Y=I[1],z=S(">L",[B])+S(">L",[Y]);else{w=I.length,z="";for(var Z=0;Z<w;Z++)B=I[Z][0],Y=I[Z][1],z+=S(">L",[B])+S(">L",[Y])}D=S(">L",[F]),W=z}else if(R=="SRational"){if(typeof I[0]=="number")w=1,B=I[0],Y=I[1],z=S(">l",[B])+S(">l",[Y]);else{w=I.length,z="";for(var Z=0;Z<w;Z++)B=I[Z][0],Y=I[Z][1],z+=S(">l",[B])+S(">l",[Y])}D=S(">L",[F]),W=z}else R=="Undefined"&&(w=I.length,w>4?(D=S(">L",[F]),W=I):D=I+L("\0",4-w));var j=S(">L",[w]);return[j,D,W]}function m(I,R,F){var W=8,D=Object.keys(I).length,w=S(">H",[D]),z;["0th","1st"].indexOf(R)>-1?z=2+D*12+4:z=2+D*12;var B="",Y="",Z;for(var Z in I)if(typeof Z=="string"&&(Z=parseInt(Z)),!(R=="0th"&&[34665,34853].indexOf(Z)>-1)){{if(R=="Exif"&&Z==40965)continue;if(R=="1st"&&[513,514].indexOf(Z)>-1)continue}var j=I[Z],J=S(">H",[Z]),ue=X[R][Z].type,te=S(">H",[H[ue]]);typeof j=="number"&&(j=[j]);var Se=W+z+F+Y.length,be=p(j,ue,Se),Ye=be[0],ct=be[1],pt=be[2];B+=J+te+Ye+ct,Y+=pt}return[w+B,Y]}function g(I){var R,F;if(I.slice(0,2)=="ÿØ")R=E(I),F=b(R),F?this.tiftag=F.slice(10):this.tiftag=null;else if(["II","MM"].indexOf(I.slice(0,2))>-1)this.tiftag=I;else if(I.slice(0,4)=="Exif")this.tiftag=I.slice(6);else throw new Error("Given file is neither JPEG nor TIFF.")}if(g.prototype={get_ifd:function(I,R){var F={},W=T(this.endian_mark+"H",this.tiftag.slice(I,I+2))[0],D=I+2,w;["0th","1st"].indexOf(R)>-1?w="Image":w=R;for(var z=0;z<W;z++){I=D+12*z;var B=T(this.endian_mark+"H",this.tiftag.slice(I,I+2))[0],Y=T(this.endian_mark+"H",this.tiftag.slice(I+2,I+4))[0],Z=T(this.endian_mark+"L",this.tiftag.slice(I+4,I+8))[0],j=this.tiftag.slice(I+8,I+12),J=[Y,Z,j];B in X[w]&&(F[B]=this.convert_value(J))}return R=="0th"&&(I=D+12*W,F.first_ifd_pointer=this.tiftag.slice(I,I+4)),F},convert_value:function(I){var R=null,F=I[0],W=I[1],D=I[2],w;if(F==1)W>4?(w=T(this.endian_mark+"L",D)[0],R=T(this.endian_mark+L("B",W),this.tiftag.slice(w,w+W))):R=T(this.endian_mark+L("B",W),D.slice(0,W));else if(F==2)W>4?(w=T(this.endian_mark+"L",D)[0],R=this.tiftag.slice(w,w+W-1)):R=D.slice(0,W-1);else if(F==3)W>2?(w=T(this.endian_mark+"L",D)[0],R=T(this.endian_mark+L("H",W),this.tiftag.slice(w,w+W*2))):R=T(this.endian_mark+L("H",W),D.slice(0,W*2));else if(F==4)W>1?(w=T(this.endian_mark+"L",D)[0],R=T(this.endian_mark+L("L",W),this.tiftag.slice(w,w+W*4))):R=T(this.endian_mark+L("L",W),D);else if(F==5)if(w=T(this.endian_mark+"L",D)[0],W>1){R=[];for(var z=0;z<W;z++)R.push([T(this.endian_mark+"L",this.tiftag.slice(w+z*8,w+4+z*8))[0],T(this.endian_mark+"L",this.tiftag.slice(w+4+z*8,w+8+z*8))[0]])}else R=[T(this.endian_mark+"L",this.tiftag.slice(w,w+4))[0],T(this.endian_mark+"L",this.tiftag.slice(w+4,w+8))[0]];else if(F==7)W>4?(w=T(this.endian_mark+"L",D)[0],R=this.tiftag.slice(w,w+W)):R=D.slice(0,W);else if(F==9)W>1?(w=T(this.endian_mark+"L",D)[0],R=T(this.endian_mark+L("l",W),this.tiftag.slice(w,w+W*4))):R=T(this.endian_mark+L("l",W),D);else if(F==10)if(w=T(this.endian_mark+"L",D)[0],W>1){R=[];for(var z=0;z<W;z++)R.push([T(this.endian_mark+"l",this.tiftag.slice(w+z*8,w+4+z*8))[0],T(this.endian_mark+"l",this.tiftag.slice(w+4+z*8,w+8+z*8))[0]])}else R=[T(this.endian_mark+"l",this.tiftag.slice(w,w+4))[0],T(this.endian_mark+"l",this.tiftag.slice(w+4,w+8))[0]];else throw new Error("Exif might be wrong. Got incorrect value type to decode. type:"+F);return R instanceof Array&&R.length==1?R[0]:R}},typeof window<"u"&&typeof window.btoa=="function")var x=window.btoa;if(typeof x>"u")var x=function(R){for(var F="",W,D,w,z,B,Y,Z,j=0,J="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";j<R.length;)W=R.charCodeAt(j++),D=R.charCodeAt(j++),w=R.charCodeAt(j++),z=W>>2,B=(W&3)<<4|D>>4,Y=(D&15)<<2|w>>6,Z=w&63,isNaN(D)?Y=Z=64:isNaN(w)&&(Z=64),F=F+J.charAt(z)+J.charAt(B)+J.charAt(Y)+J.charAt(Z);return F};if(typeof window<"u"&&typeof window.atob=="function")var y=window.atob;if(typeof y>"u")var y=function(R){var F="",W,D,w,z,B,Y,Z,j=0,J="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";for(R=R.replace(/[^A-Za-z0-9\+\/\=]/g,"");j<R.length;)z=J.indexOf(R.charAt(j++)),B=J.indexOf(R.charAt(j++)),Y=J.indexOf(R.charAt(j++)),Z=J.indexOf(R.charAt(j++)),W=z<<2|B>>4,D=(B&15)<<4|Y>>2,w=(Y&3)<<6|Z,F=F+String.fromCharCode(W),Y!=64&&(F=F+String.fromCharCode(D)),Z!=64&&(F=F+String.fromCharCode(w));return F};function S(I,R){if(!(R instanceof Array))throw new Error("'pack' error. Got invalid type argument.");if(I.length-1!=R.length)throw new Error("'pack' error. "+(I.length-1)+" marks, "+R.length+" elements.");var F;if(I[0]=="<")F=!0;else if(I[0]==">")F=!1;else throw new Error("");for(var W="",D=1,w=null,z=null,B=null;z=I[D];){if(z.toLowerCase()=="b"){if(w=R[D-1],z=="b"&&w<0&&(w+=256),w>255||w<0)throw new Error("'pack' error.");B=String.fromCharCode(w)}else if(z=="H"){if(w=R[D-1],w>65535||w<0)throw new Error("'pack' error.");B=String.fromCharCode(Math.floor(w%65536/256))+String.fromCharCode(w%256),F&&(B=B.split("").reverse().join(""))}else if(z.toLowerCase()=="l"){if(w=R[D-1],z=="l"&&w<0&&(w+=4294967296),w>4294967295||w<0)throw new Error("'pack' error.");B=String.fromCharCode(Math.floor(w/16777216))+String.fromCharCode(Math.floor(w%16777216/65536))+String.fromCharCode(Math.floor(w%65536/256))+String.fromCharCode(w%256),F&&(B=B.split("").reverse().join(""))}else throw new Error("'pack' error.");W+=B,D+=1}return W}function T(I,R){if(typeof R!="string")throw new Error("'unpack' error. Got invalid type argument.");for(var F=0,W=1;W<I.length;W++)if(I[W].toLowerCase()=="b")F+=1;else if(I[W].toLowerCase()=="h")F+=2;else if(I[W].toLowerCase()=="l")F+=4;else throw new Error("'unpack' error. Got invalid mark.");if(F!=R.length)throw new Error("'unpack' error. Mismatch between symbol and string length. "+F+":"+R.length);var D;if(I[0]=="<")D=!0;else if(I[0]==">")D=!1;else throw new Error("'unpack' error.");for(var w=[],z=0,B=1,Y=null,Z=null,j=null,J="";Z=I[B];){if(Z.toLowerCase()=="b")j=1,J=R.slice(z,z+j),Y=J.charCodeAt(0),Z=="b"&&Y>=128&&(Y-=256);else if(Z=="H")j=2,J=R.slice(z,z+j),D&&(J=J.split("").reverse().join("")),Y=J.charCodeAt(0)*256+J.charCodeAt(1);else if(Z.toLowerCase()=="l")j=4,J=R.slice(z,z+j),D&&(J=J.split("").reverse().join("")),Y=J.charCodeAt(0)*16777216+J.charCodeAt(1)*65536+J.charCodeAt(2)*256+J.charCodeAt(3),Z=="l"&&Y>=2147483648&&(Y-=4294967296);else throw new Error("'unpack' error. "+Z);w.push(Y),z+=j,B+=1}return w}function L(I,R){for(var F="",W=0;W<R;W++)F+=I;return F}function E(I){if(I.slice(0,2)!="ÿØ")throw new Error("Given data isn't JPEG.");for(var R=2,F=["ÿØ"];;){if(I.slice(R,R+2)=="ÿÚ"){F.push(I.slice(R));break}else{var W=T(">H",I.slice(R+2,R+4))[0],D=R+W+2;F.push(I.slice(R,D)),R=D}if(R>=I.length)throw new Error("Wrong JPEG data.")}return F}function b(I){for(var R,F=0;F<I.length;F++)if(R=I[F],R.slice(0,2)=="ÿá"&&R.slice(4,10)=="Exif\0\0")return R;return null}function V(I,R){var F=!1,W=[];return I.forEach(function(D,w){D.slice(0,2)=="ÿá"&&D.slice(4,10)=="Exif\0\0"&&(F?W.unshift(w):(I[w]=R,F=!0))}),W.forEach(function(D){I.splice(D,1)}),!F&&R&&(I=[I[0],R].concat(I.slice(1))),I.join("")}var H={Byte:1,Ascii:2,Short:3,Long:4,Rational:5,Undefined:7,SLong:9,SRational:10},X={Image:{11:{name:"ProcessingSoftware",type:"Ascii"},254:{name:"NewSubfileType",type:"Long"},255:{name:"SubfileType",type:"Short"},256:{name:"ImageWidth",type:"Long"},257:{name:"ImageLength",type:"Long"},258:{name:"BitsPerSample",type:"Short"},259:{name:"Compression",type:"Short"},262:{name:"PhotometricInterpretation",type:"Short"},263:{name:"Threshholding",type:"Short"},264:{name:"CellWidth",type:"Short"},265:{name:"CellLength",type:"Short"},266:{name:"FillOrder",type:"Short"},269:{name:"DocumentName",type:"Ascii"},270:{name:"ImageDescription",type:"Ascii"},271:{name:"Make",type:"Ascii"},272:{name:"Model",type:"Ascii"},273:{name:"StripOffsets",type:"Long"},274:{name:"Orientation",type:"Short"},277:{name:"SamplesPerPixel",type:"Short"},278:{name:"RowsPerStrip",type:"Long"},279:{name:"StripByteCounts",type:"Long"},282:{name:"XResolution",type:"Rational"},283:{name:"YResolution",type:"Rational"},284:{name:"PlanarConfiguration",type:"Short"},290:{name:"GrayResponseUnit",type:"Short"},291:{name:"GrayResponseCurve",type:"Short"},292:{name:"T4Options",type:"Long"},293:{name:"T6Options",type:"Long"},296:{name:"ResolutionUnit",type:"Short"},301:{name:"TransferFunction",type:"Short"},305:{name:"Software",type:"Ascii"},306:{name:"DateTime",type:"Ascii"},315:{name:"Artist",type:"Ascii"},316:{name:"HostComputer",type:"Ascii"},317:{name:"Predictor",type:"Short"},318:{name:"WhitePoint",type:"Rational"},319:{name:"PrimaryChromaticities",type:"Rational"},320:{name:"ColorMap",type:"Short"},321:{name:"HalftoneHints",type:"Short"},322:{name:"TileWidth",type:"Short"},323:{name:"TileLength",type:"Short"},324:{name:"TileOffsets",type:"Short"},325:{name:"TileByteCounts",type:"Short"},330:{name:"SubIFDs",type:"Long"},332:{name:"InkSet",type:"Short"},333:{name:"InkNames",type:"Ascii"},334:{name:"NumberOfInks",type:"Short"},336:{name:"DotRange",type:"Byte"},337:{name:"TargetPrinter",type:"Ascii"},338:{name:"ExtraSamples",type:"Short"},339:{name:"SampleFormat",type:"Short"},340:{name:"SMinSampleValue",type:"Short"},341:{name:"SMaxSampleValue",type:"Short"},342:{name:"TransferRange",type:"Short"},343:{name:"ClipPath",type:"Byte"},344:{name:"XClipPathUnits",type:"Long"},345:{name:"YClipPathUnits",type:"Long"},346:{name:"Indexed",type:"Short"},347:{name:"JPEGTables",type:"Undefined"},351:{name:"OPIProxy",type:"Short"},512:{name:"JPEGProc",type:"Long"},513:{name:"JPEGInterchangeFormat",type:"Long"},514:{name:"JPEGInterchangeFormatLength",type:"Long"},515:{name:"JPEGRestartInterval",type:"Short"},517:{name:"JPEGLosslessPredictors",type:"Short"},518:{name:"JPEGPointTransforms",type:"Short"},519:{name:"JPEGQTables",type:"Long"},520:{name:"JPEGDCTables",type:"Long"},521:{name:"JPEGACTables",type:"Long"},529:{name:"YCbCrCoefficients",type:"Rational"},530:{name:"YCbCrSubSampling",type:"Short"},531:{name:"YCbCrPositioning",type:"Short"},532:{name:"ReferenceBlackWhite",type:"Rational"},700:{name:"XMLPacket",type:"Byte"},18246:{name:"Rating",type:"Short"},18249:{name:"RatingPercent",type:"Short"},32781:{name:"ImageID",type:"Ascii"},33421:{name:"CFARepeatPatternDim",type:"Short"},33422:{name:"CFAPattern",type:"Byte"},33423:{name:"BatteryLevel",type:"Rational"},33432:{name:"Copyright",type:"Ascii"},33434:{name:"ExposureTime",type:"Rational"},34377:{name:"ImageResources",type:"Byte"},34665:{name:"ExifTag",type:"Long"},34675:{name:"InterColorProfile",type:"Undefined"},34853:{name:"GPSTag",type:"Long"},34857:{name:"Interlace",type:"Short"},34858:{name:"TimeZoneOffset",type:"Long"},34859:{name:"SelfTimerMode",type:"Short"},37387:{name:"FlashEnergy",type:"Rational"},37388:{name:"SpatialFrequencyResponse",type:"Undefined"},37389:{name:"Noise",type:"Undefined"},37390:{name:"FocalPlaneXResolution",type:"Rational"},37391:{name:"FocalPlaneYResolution",type:"Rational"},37392:{name:"FocalPlaneResolutionUnit",type:"Short"},37393:{name:"ImageNumber",type:"Long"},37394:{name:"SecurityClassification",type:"Ascii"},37395:{name:"ImageHistory",type:"Ascii"},37397:{name:"ExposureIndex",type:"Rational"},37398:{name:"TIFFEPStandardID",type:"Byte"},37399:{name:"SensingMethod",type:"Short"},40091:{name:"XPTitle",type:"Byte"},40092:{name:"XPComment",type:"Byte"},40093:{name:"XPAuthor",type:"Byte"},40094:{name:"XPKeywords",type:"Byte"},40095:{name:"XPSubject",type:"Byte"},50341:{name:"PrintImageMatching",type:"Undefined"},50706:{name:"DNGVersion",type:"Byte"},50707:{name:"DNGBackwardVersion",type:"Byte"},50708:{name:"UniqueCameraModel",type:"Ascii"},50709:{name:"LocalizedCameraModel",type:"Byte"},50710:{name:"CFAPlaneColor",type:"Byte"},50711:{name:"CFALayout",type:"Short"},50712:{name:"LinearizationTable",type:"Short"},50713:{name:"BlackLevelRepeatDim",type:"Short"},50714:{name:"BlackLevel",type:"Rational"},50715:{name:"BlackLevelDeltaH",type:"SRational"},50716:{name:"BlackLevelDeltaV",type:"SRational"},50717:{name:"WhiteLevel",type:"Short"},50718:{name:"DefaultScale",type:"Rational"},50719:{name:"DefaultCropOrigin",type:"Short"},50720:{name:"DefaultCropSize",type:"Short"},50721:{name:"ColorMatrix1",type:"SRational"},50722:{name:"ColorMatrix2",type:"SRational"},50723:{name:"CameraCalibration1",type:"SRational"},50724:{name:"CameraCalibration2",type:"SRational"},50725:{name:"ReductionMatrix1",type:"SRational"},50726:{name:"ReductionMatrix2",type:"SRational"},50727:{name:"AnalogBalance",type:"Rational"},50728:{name:"AsShotNeutral",type:"Short"},50729:{name:"AsShotWhiteXY",type:"Rational"},50730:{name:"BaselineExposure",type:"SRational"},50731:{name:"BaselineNoise",type:"Rational"},50732:{name:"BaselineSharpness",type:"Rational"},50733:{name:"BayerGreenSplit",type:"Long"},50734:{name:"LinearResponseLimit",type:"Rational"},50735:{name:"CameraSerialNumber",type:"Ascii"},50736:{name:"LensInfo",type:"Rational"},50737:{name:"ChromaBlurRadius",type:"Rational"},50738:{name:"AntiAliasStrength",type:"Rational"},50739:{name:"ShadowScale",type:"SRational"},50740:{name:"DNGPrivateData",type:"Byte"},50741:{name:"MakerNoteSafety",type:"Short"},50778:{name:"CalibrationIlluminant1",type:"Short"},50779:{name:"CalibrationIlluminant2",type:"Short"},50780:{name:"BestQualityScale",type:"Rational"},50781:{name:"RawDataUniqueID",type:"Byte"},50827:{name:"OriginalRawFileName",type:"Byte"},50828:{name:"OriginalRawFileData",type:"Undefined"},50829:{name:"ActiveArea",type:"Short"},50830:{name:"MaskedAreas",type:"Short"},50831:{name:"AsShotICCProfile",type:"Undefined"},50832:{name:"AsShotPreProfileMatrix",type:"SRational"},50833:{name:"CurrentICCProfile",type:"Undefined"},50834:{name:"CurrentPreProfileMatrix",type:"SRational"},50879:{name:"ColorimetricReference",type:"Short"},50931:{name:"CameraCalibrationSignature",type:"Byte"},50932:{name:"ProfileCalibrationSignature",type:"Byte"},50934:{name:"AsShotProfileName",type:"Byte"},50935:{name:"NoiseReductionApplied",type:"Rational"},50936:{name:"ProfileName",type:"Byte"},50937:{name:"ProfileHueSatMapDims",type:"Long"},50938:{name:"ProfileHueSatMapData1",type:"Float"},50939:{name:"ProfileHueSatMapData2",type:"Float"},50940:{name:"ProfileToneCurve",type:"Float"},50941:{name:"ProfileEmbedPolicy",type:"Long"},50942:{name:"ProfileCopyright",type:"Byte"},50964:{name:"ForwardMatrix1",type:"SRational"},50965:{name:"ForwardMatrix2",type:"SRational"},50966:{name:"PreviewApplicationName",type:"Byte"},50967:{name:"PreviewApplicationVersion",type:"Byte"},50968:{name:"PreviewSettingsName",type:"Byte"},50969:{name:"PreviewSettingsDigest",type:"Byte"},50970:{name:"PreviewColorSpace",type:"Long"},50971:{name:"PreviewDateTime",type:"Ascii"},50972:{name:"RawImageDigest",type:"Undefined"},50973:{name:"OriginalRawFileDigest",type:"Undefined"},50974:{name:"SubTileBlockSize",type:"Long"},50975:{name:"RowInterleaveFactor",type:"Long"},50981:{name:"ProfileLookTableDims",type:"Long"},50982:{name:"ProfileLookTableData",type:"Float"},51008:{name:"OpcodeList1",type:"Undefined"},51009:{name:"OpcodeList2",type:"Undefined"},51022:{name:"OpcodeList3",type:"Undefined"}},Exif:{33434:{name:"ExposureTime",type:"Rational"},33437:{name:"FNumber",type:"Rational"},34850:{name:"ExposureProgram",type:"Short"},34852:{name:"SpectralSensitivity",type:"Ascii"},34855:{name:"ISOSpeedRatings",type:"Short"},34856:{name:"OECF",type:"Undefined"},34864:{name:"SensitivityType",type:"Short"},34865:{name:"StandardOutputSensitivity",type:"Long"},34866:{name:"RecommendedExposureIndex",type:"Long"},34867:{name:"ISOSpeed",type:"Long"},34868:{name:"ISOSpeedLatitudeyyy",type:"Long"},34869:{name:"ISOSpeedLatitudezzz",type:"Long"},36864:{name:"ExifVersion",type:"Undefined"},36867:{name:"DateTimeOriginal",type:"Ascii"},36868:{name:"DateTimeDigitized",type:"Ascii"},37121:{name:"ComponentsConfiguration",type:"Undefined"},37122:{name:"CompressedBitsPerPixel",type:"Rational"},37377:{name:"ShutterSpeedValue",type:"SRational"},37378:{name:"ApertureValue",type:"Rational"},37379:{name:"BrightnessValue",type:"SRational"},37380:{name:"ExposureBiasValue",type:"SRational"},37381:{name:"MaxApertureValue",type:"Rational"},37382:{name:"SubjectDistance",type:"Rational"},37383:{name:"MeteringMode",type:"Short"},37384:{name:"LightSource",type:"Short"},37385:{name:"Flash",type:"Short"},37386:{name:"FocalLength",type:"Rational"},37396:{name:"SubjectArea",type:"Short"},37500:{name:"MakerNote",type:"Undefined"},37510:{name:"UserComment",type:"Ascii"},37520:{name:"SubSecTime",type:"Ascii"},37521:{name:"SubSecTimeOriginal",type:"Ascii"},37522:{name:"SubSecTimeDigitized",type:"Ascii"},40960:{name:"FlashpixVersion",type:"Undefined"},40961:{name:"ColorSpace",type:"Short"},40962:{name:"PixelXDimension",type:"Long"},40963:{name:"PixelYDimension",type:"Long"},40964:{name:"RelatedSoundFile",type:"Ascii"},40965:{name:"InteroperabilityTag",type:"Long"},41483:{name:"FlashEnergy",type:"Rational"},41484:{name:"SpatialFrequencyResponse",type:"Undefined"},41486:{name:"FocalPlaneXResolution",type:"Rational"},41487:{name:"FocalPlaneYResolution",type:"Rational"},41488:{name:"FocalPlaneResolutionUnit",type:"Short"},41492:{name:"SubjectLocation",type:"Short"},41493:{name:"ExposureIndex",type:"Rational"},41495:{name:"SensingMethod",type:"Short"},41728:{name:"FileSource",type:"Undefined"},41729:{name:"SceneType",type:"Undefined"},41730:{name:"CFAPattern",type:"Undefined"},41985:{name:"CustomRendered",type:"Short"},41986:{name:"ExposureMode",type:"Short"},41987:{name:"WhiteBalance",type:"Short"},41988:{name:"DigitalZoomRatio",type:"Rational"},41989:{name:"FocalLengthIn35mmFilm",type:"Short"},41990:{name:"SceneCaptureType",type:"Short"},41991:{name:"GainControl",type:"Short"},41992:{name:"Contrast",type:"Short"},41993:{name:"Saturation",type:"Short"},41994:{name:"Sharpness",type:"Short"},41995:{name:"DeviceSettingDescription",type:"Undefined"},41996:{name:"SubjectDistanceRange",type:"Short"},42016:{name:"ImageUniqueID",type:"Ascii"},42032:{name:"CameraOwnerName",type:"Ascii"},42033:{name:"BodySerialNumber",type:"Ascii"},42034:{name:"LensSpecification",type:"Rational"},42035:{name:"LensMake",type:"Ascii"},42036:{name:"LensModel",type:"Ascii"},42037:{name:"LensSerialNumber",type:"Ascii"},42240:{name:"Gamma",type:"Rational"}},GPS:{0:{name:"GPSVersionID",type:"Byte"},1:{name:"GPSLatitudeRef",type:"Ascii"},2:{name:"GPSLatitude",type:"Rational"},3:{name:"GPSLongitudeRef",type:"Ascii"},4:{name:"GPSLongitude",type:"Rational"},5:{name:"GPSAltitudeRef",type:"Byte"},6:{name:"GPSAltitude",type:"Rational"},7:{name:"GPSTimeStamp",type:"Rational"},8:{name:"GPSSatellites",type:"Ascii"},9:{name:"GPSStatus",type:"Ascii"},10:{name:"GPSMeasureMode",type:"Ascii"},11:{name:"GPSDOP",type:"Rational"},12:{name:"GPSSpeedRef",type:"Ascii"},13:{name:"GPSSpeed",type:"Rational"},14:{name:"GPSTrackRef",type:"Ascii"},15:{name:"GPSTrack",type:"Rational"},16:{name:"GPSImgDirectionRef",type:"Ascii"},17:{name:"GPSImgDirection",type:"Rational"},18:{name:"GPSMapDatum",type:"Ascii"},19:{name:"GPSDestLatitudeRef",type:"Ascii"},20:{name:"GPSDestLatitude",type:"Rational"},21:{name:"GPSDestLongitudeRef",type:"Ascii"},22:{name:"GPSDestLongitude",type:"Rational"},23:{name:"GPSDestBearingRef",type:"Ascii"},24:{name:"GPSDestBearing",type:"Rational"},25:{name:"GPSDestDistanceRef",type:"Ascii"},26:{name:"GPSDestDistance",type:"Rational"},27:{name:"GPSProcessingMethod",type:"Undefined"},28:{name:"GPSAreaInformation",type:"Undefined"},29:{name:"GPSDateStamp",type:"Ascii"},30:{name:"GPSDifferential",type:"Short"},31:{name:"GPSHPositioningError",type:"Rational"}},Interop:{1:{name:"InteroperabilityIndex",type:"Ascii"}}};X["0th"]=X.Image,X["1st"]=X.Image,t.TAGS=X,t.ImageIFD={ProcessingSoftware:11,NewSubfileType:254,SubfileType:255,ImageWidth:256,ImageLength:257,BitsPerSample:258,Compression:259,PhotometricInterpretation:262,Threshholding:263,CellWidth:264,CellLength:265,FillOrder:266,DocumentName:269,ImageDescription:270,Make:271,Model:272,StripOffsets:273,Orientation:274,SamplesPerPixel:277,RowsPerStrip:278,StripByteCounts:279,XResolution:282,YResolution:283,PlanarConfiguration:284,GrayResponseUnit:290,GrayResponseCurve:291,T4Options:292,T6Options:293,ResolutionUnit:296,TransferFunction:301,Software:305,DateTime:306,Artist:315,HostComputer:316,Predictor:317,WhitePoint:318,PrimaryChromaticities:319,ColorMap:320,HalftoneHints:321,TileWidth:322,TileLength:323,TileOffsets:324,TileByteCounts:325,SubIFDs:330,InkSet:332,InkNames:333,NumberOfInks:334,DotRange:336,TargetPrinter:337,ExtraSamples:338,SampleFormat:339,SMinSampleValue:340,SMaxSampleValue:341,TransferRange:342,ClipPath:343,XClipPathUnits:344,YClipPathUnits:345,Indexed:346,JPEGTables:347,OPIProxy:351,JPEGProc:512,JPEGInterchangeFormat:513,JPEGInterchangeFormatLength:514,JPEGRestartInterval:515,JPEGLosslessPredictors:517,JPEGPointTransforms:518,JPEGQTables:519,JPEGDCTables:520,JPEGACTables:521,YCbCrCoefficients:529,YCbCrSubSampling:530,YCbCrPositioning:531,ReferenceBlackWhite:532,XMLPacket:700,Rating:18246,RatingPercent:18249,ImageID:32781,CFARepeatPatternDim:33421,CFAPattern:33422,BatteryLevel:33423,Copyright:33432,ExposureTime:33434,ImageResources:34377,ExifTag:34665,InterColorProfile:34675,GPSTag:34853,Interlace:34857,TimeZoneOffset:34858,SelfTimerMode:34859,FlashEnergy:37387,SpatialFrequencyResponse:37388,Noise:37389,FocalPlaneXResolution:37390,FocalPlaneYResolution:37391,FocalPlaneResolutionUnit:37392,ImageNumber:37393,SecurityClassification:37394,ImageHistory:37395,ExposureIndex:37397,TIFFEPStandardID:37398,SensingMethod:37399,XPTitle:40091,XPComment:40092,XPAuthor:40093,XPKeywords:40094,XPSubject:40095,PrintImageMatching:50341,DNGVersion:50706,DNGBackwardVersion:50707,UniqueCameraModel:50708,LocalizedCameraModel:50709,CFAPlaneColor:50710,CFALayout:50711,LinearizationTable:50712,BlackLevelRepeatDim:50713,BlackLevel:50714,BlackLevelDeltaH:50715,BlackLevelDeltaV:50716,WhiteLevel:50717,DefaultScale:50718,DefaultCropOrigin:50719,DefaultCropSize:50720,ColorMatrix1:50721,ColorMatrix2:50722,CameraCalibration1:50723,CameraCalibration2:50724,ReductionMatrix1:50725,ReductionMatrix2:50726,AnalogBalance:50727,AsShotNeutral:50728,AsShotWhiteXY:50729,BaselineExposure:50730,BaselineNoise:50731,BaselineSharpness:50732,BayerGreenSplit:50733,LinearResponseLimit:50734,CameraSerialNumber:50735,LensInfo:50736,ChromaBlurRadius:50737,AntiAliasStrength:50738,ShadowScale:50739,DNGPrivateData:50740,MakerNoteSafety:50741,CalibrationIlluminant1:50778,CalibrationIlluminant2:50779,BestQualityScale:50780,RawDataUniqueID:50781,OriginalRawFileName:50827,OriginalRawFileData:50828,ActiveArea:50829,MaskedAreas:50830,AsShotICCProfile:50831,AsShotPreProfileMatrix:50832,CurrentICCProfile:50833,CurrentPreProfileMatrix:50834,ColorimetricReference:50879,CameraCalibrationSignature:50931,ProfileCalibrationSignature:50932,AsShotProfileName:50934,NoiseReductionApplied:50935,ProfileName:50936,ProfileHueSatMapDims:50937,ProfileHueSatMapData1:50938,ProfileHueSatMapData2:50939,ProfileToneCurve:50940,ProfileEmbedPolicy:50941,ProfileCopyright:50942,ForwardMatrix1:50964,ForwardMatrix2:50965,PreviewApplicationName:50966,PreviewApplicationVersion:50967,PreviewSettingsName:50968,PreviewSettingsDigest:50969,PreviewColorSpace:50970,PreviewDateTime:50971,RawImageDigest:50972,OriginalRawFileDigest:50973,SubTileBlockSize:50974,RowInterleaveFactor:50975,ProfileLookTableDims:50981,ProfileLookTableData:50982,OpcodeList1:51008,OpcodeList2:51009,OpcodeList3:51022,NoiseProfile:51041},t.ExifIFD={ExposureTime:33434,FNumber:33437,ExposureProgram:34850,SpectralSensitivity:34852,ISOSpeedRatings:34855,OECF:34856,SensitivityType:34864,StandardOutputSensitivity:34865,RecommendedExposureIndex:34866,ISOSpeed:34867,ISOSpeedLatitudeyyy:34868,ISOSpeedLatitudezzz:34869,ExifVersion:36864,DateTimeOriginal:36867,DateTimeDigitized:36868,ComponentsConfiguration:37121,CompressedBitsPerPixel:37122,ShutterSpeedValue:37377,ApertureValue:37378,BrightnessValue:37379,ExposureBiasValue:37380,MaxApertureValue:37381,SubjectDistance:37382,MeteringMode:37383,LightSource:37384,Flash:37385,FocalLength:37386,SubjectArea:37396,MakerNote:37500,UserComment:37510,SubSecTime:37520,SubSecTimeOriginal:37521,SubSecTimeDigitized:37522,FlashpixVersion:40960,ColorSpace:40961,PixelXDimension:40962,PixelYDimension:40963,RelatedSoundFile:40964,InteroperabilityTag:40965,FlashEnergy:41483,SpatialFrequencyResponse:41484,FocalPlaneXResolution:41486,FocalPlaneYResolution:41487,FocalPlaneResolutionUnit:41488,SubjectLocation:41492,ExposureIndex:41493,SensingMethod:41495,FileSource:41728,SceneType:41729,CFAPattern:41730,CustomRendered:41985,ExposureMode:41986,WhiteBalance:41987,DigitalZoomRatio:41988,FocalLengthIn35mmFilm:41989,SceneCaptureType:41990,GainControl:41991,Contrast:41992,Saturation:41993,Sharpness:41994,DeviceSettingDescription:41995,SubjectDistanceRange:41996,ImageUniqueID:42016,CameraOwnerName:42032,BodySerialNumber:42033,LensSpecification:42034,LensMake:42035,LensModel:42036,LensSerialNumber:42037,Gamma:42240},t.GPSIFD={GPSVersionID:0,GPSLatitudeRef:1,GPSLatitude:2,GPSLongitudeRef:3,GPSLongitude:4,GPSAltitudeRef:5,GPSAltitude:6,GPSTimeStamp:7,GPSSatellites:8,GPSStatus:9,GPSMeasureMode:10,GPSDOP:11,GPSSpeedRef:12,GPSSpeed:13,GPSTrackRef:14,GPSTrack:15,GPSImgDirectionRef:16,GPSImgDirection:17,GPSMapDatum:18,GPSDestLatitudeRef:19,GPSDestLatitude:20,GPSDestLongitudeRef:21,GPSDestLongitude:22,GPSDestBearingRef:23,GPSDestBearing:24,GPSDestDistanceRef:25,GPSDestDistance:26,GPSProcessingMethod:27,GPSAreaInformation:28,GPSDateStamp:29,GPSDifferential:30,GPSHPositioningError:31},t.InteropIFD={InteroperabilityIndex:1},t.GPSHelper={degToDmsRational:function(I){var R=Math.abs(I),F=R%1*60,W=F%1*60,D=Math.floor(R),w=Math.floor(F),z=Math.round(W*100);return[[D,1],[w,1],[z,100]]},dmsRationalToDeg:function(I,R){var F=R==="S"||R==="W"?-1:1,W=I[0][0]/I[0][1]+I[1][0]/I[1][1]/60+I[2][0]/I[2][1]/3600;return W*F}},n.exports&&(e=n.exports=t),e.piexif=t})()})(Es,Es.exports)),Es.exports}var Ny=Uy();const ao=Ph(Ny);var Cc={exports:{}};const Oy={},Dh=Object.freeze(Object.defineProperty({__proto__:null,default:Oy},Symbol.toStringTag,{value:"Module"})),Rc=Iy(Dh);var dd;function ky(){return dd||(dd=1,(function(n,e){var t=(()=>{var r,a=typeof document<"u"?(r=document.currentScript)==null?void 0:r.src:void 0;return typeof __filename<"u"&&(a||(a=__filename)),function(l={}){var u,o=l,p,m;new Promise((i,s)=>{p=i,m=s});var g=typeof window=="object",x=typeof importScripts=="function",y=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string",S=Object.assign({},o),T="./this.program",L="";function E(i){return o.locateFile?o.locateFile(i,L):L+i}var b,V,H;if(y){var X=Rc,I=Rc;L=__dirname+"/",b=(i,s)=>(i=nt(i)?new URL(i):I.normalize(i),X.readFileSync(i,s?void 0:"utf8")),H=i=>{var s=b(i,!0);return s.buffer||(s=new Uint8Array(s)),s},V=(i,s,f,h=!0)=>{i=nt(i)?new URL(i):I.normalize(i),X.readFile(i,h?void 0:"utf8",(v,M)=>{v?f(v):s(h?M.buffer:M)})},!o.thisProgram&&process.argv.length>1&&(T=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2)}else(g||x)&&(x?L=self.location.href:typeof document<"u"&&document.currentScript&&(L=document.currentScript.src),a&&(L=a),L.startsWith("blob:")?L="":L=L.substr(0,L.replace(/[?#].*/,"").lastIndexOf("/")+1),b=i=>{var s=new XMLHttpRequest;return s.open("GET",i,!1),s.send(null),s.responseText},x&&(H=i=>{var s=new XMLHttpRequest;return s.open("GET",i,!1),s.responseType="arraybuffer",s.send(null),new Uint8Array(s.response)}),V=(i,s,f)=>{if(nt(i)){var h=new XMLHttpRequest;h.open("GET",i,!0),h.responseType="arraybuffer",h.onload=()=>{if(h.status==200||h.status==0&&h.response){s(h.response);return}f()},h.onerror=f,h.send(null);return}fetch(i,{credentials:"same-origin"}).then(v=>v.ok?v.arrayBuffer():Promise.reject(new Error(v.status+" : "+v.url))).then(s,f)});var R=o.print||console.log.bind(console),F=o.printErr||console.error.bind(console);Object.assign(o,S),S=null,o.arguments&&o.arguments,o.thisProgram&&(T=o.thisProgram),o.quit&&o.quit;var W;o.wasmBinary&&(W=o.wasmBinary);var D,w=!1,z,B,Y,Z,j,J,ue,te;function Se(){var i=D.buffer;o.HEAP8=z=new Int8Array(i),o.HEAP16=Y=new Int16Array(i),o.HEAPU8=B=new Uint8Array(i),o.HEAPU16=Z=new Uint16Array(i),o.HEAP32=j=new Int32Array(i),o.HEAPU32=J=new Uint32Array(i),o.HEAPF32=ue=new Float32Array(i),o.HEAPF64=te=new Float64Array(i)}var be=[],Ye=[],ct=[];function pt(){if(o.preRun)for(typeof o.preRun=="function"&&(o.preRun=[o.preRun]);o.preRun.length;)_e(o.preRun.shift());ne(be)}function yt(){!o.noFSInit&&!A.init.initialized&&A.init(),A.ignorePermissions=!1,ne(Ye)}function vt(){if(o.postRun)for(typeof o.postRun=="function"&&(o.postRun=[o.postRun]);o.postRun.length;)Oe(o.postRun.shift());ne(ct)}function _e(i){be.unshift(i)}function ge(i){Ye.unshift(i)}function Oe(i){ct.unshift(i)}var Qe=0,$e=null;function ft(i){var s;Qe++,(s=o.monitorRunDependencies)==null||s.call(o,Qe)}function Lt(i){var s;if(Qe--,(s=o.monitorRunDependencies)==null||s.call(o,Qe),Qe==0&&$e){var f=$e;$e=null,f()}}function Re(i){var s;(s=o.onAbort)==null||s.call(o,i),i="Aborted("+i+")",F(i),w=!0,i+=". Build with -sASSERTIONS for more info.";var f=new WebAssembly.RuntimeError(i);throw m(f),f}var lt="data:application/octet-stream;base64,",$=i=>i.startsWith(lt),nt=i=>i.startsWith("file://");function rt(){var i="libheif.wasm";return $(i)?i:E(i)}var ut;function Ue(i){if(i==ut&&W)return new Uint8Array(W);if(H)return H(i);throw'sync fetching of the wasm failed: you can preload it to Module["wasmBinary"] manually, or emcc.py will do that for you when generating HTML (but not JS)'}function bt(i,s){var f,h=Ue(i);f=new WebAssembly.Module(h);var v=new WebAssembly.Instance(f,s);return[v,f]}function qe(){return{a:Xl}}function it(){var i=qe();function s(h,v){return k=h.exports,D=k.Q,Se(),Fo=k.T,ge(k.R),Lt(),k}if(ft(),o.instantiateWasm)try{return o.instantiateWasm(i,s)}catch(h){F(`Module.instantiateWasm callback failed with error: ${h}`),m(h)}ut||(ut=rt());var f=bt(ut,i);return s(f[0])}var N,P,ne=i=>{for(;i.length>0;)i.shift()(o)};o.noExitRuntime;var he=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0,de=(i,s,f)=>{for(var h=s+f,v=s;i[v]&&!(v>=h);)++v;if(v-s>16&&i.buffer&&he)return he.decode(i.subarray(s,v));for(var M="";s<v;){var O=i[s++];if(!(O&128)){M+=String.fromCharCode(O);continue}var G=i[s++]&63;if((O&224)==192){M+=String.fromCharCode((O&31)<<6|G);continue}var K=i[s++]&63;if((O&240)==224?O=(O&15)<<12|G<<6|K:O=(O&7)<<18|G<<12|K<<6|i[s++]&63,O<65536)M+=String.fromCharCode(O);else{var re=O-65536;M+=String.fromCharCode(55296|re>>10,56320|re&1023)}}return M},ie=(i,s)=>i?de(B,i,s):"",Ze=(i,s,f,h)=>{Re(`Assertion failed: ${ie(i)}, at: `+[s?ie(s):"unknown filename",f,h?ie(h):"unknown function"])};class Fe{constructor(s){this.excPtr=s,this.ptr=s-24}set_type(s){J[this.ptr+4>>2]=s}get_type(){return J[this.ptr+4>>2]}set_destructor(s){J[this.ptr+8>>2]=s}get_destructor(){return J[this.ptr+8>>2]}set_caught(s){s=s?1:0,z[this.ptr+12]=s}get_caught(){return z[this.ptr+12]!=0}set_rethrown(s){s=s?1:0,z[this.ptr+13]=s}get_rethrown(){return z[this.ptr+13]!=0}init(s,f){this.set_adjusted_ptr(0),this.set_type(s),this.set_destructor(f)}set_adjusted_ptr(s){J[this.ptr+16>>2]=s}get_adjusted_ptr(){return J[this.ptr+16>>2]}get_exception_ptr(){var s=$l(this.get_type());if(s)return J[this.excPtr>>2];var f=this.get_adjusted_ptr();return f!==0?f:this.excPtr}}var et=0,Ke=(i,s,f)=>{var h=new Fe(i);throw h.init(s,f),et=i,et};function ve(){var i=j[+Xt.varargs>>2];return Xt.varargs+=4,i}var fe=ve,we={isAbs:i=>i.charAt(0)==="/",splitPath:i=>{var s=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return s.exec(i).slice(1)},normalizeArray:(i,s)=>{for(var f=0,h=i.length-1;h>=0;h--){var v=i[h];v==="."?i.splice(h,1):v===".."?(i.splice(h,1),f++):f&&(i.splice(h,1),f--)}if(s)for(;f;f--)i.unshift("..");return i},normalize:i=>{var s=we.isAbs(i),f=i.substr(-1)==="/";return i=we.normalizeArray(i.split("/").filter(h=>!!h),!s).join("/"),!i&&!s&&(i="."),i&&f&&(i+="/"),(s?"/":"")+i},dirname:i=>{var s=we.splitPath(i),f=s[0],h=s[1];return!f&&!h?".":(h&&(h=h.substr(0,h.length-1)),f+h)},basename:i=>{if(i==="/")return"/";i=we.normalize(i),i=i.replace(/\/$/,"");var s=i.lastIndexOf("/");return s===-1?i:i.substr(s+1)},join:(...i)=>we.normalize(i.join("/")),join2:(i,s)=>we.normalize(i+"/"+s)},je=()=>{if(typeof crypto=="object"&&typeof crypto.getRandomValues=="function")return h=>crypto.getRandomValues(h);if(y)try{var i=Rc,s=i.randomFillSync;if(s)return h=>i.randomFillSync(h);var f=i.randomBytes;return h=>(h.set(f(h.byteLength)),h)}catch{}Re("initRandomDevice")},Be=i=>(Be=je())(i),Ve={resolve:(...i)=>{for(var s="",f=!1,h=i.length-1;h>=-1&&!f;h--){var v=h>=0?i[h]:A.cwd();if(typeof v!="string")throw new TypeError("Arguments to path.resolve must be strings");if(!v)return"";s=v+"/"+s,f=we.isAbs(v)}return s=we.normalizeArray(s.split("/").filter(M=>!!M),!f).join("/"),(f?"/":"")+s||"."},relative:(i,s)=>{i=Ve.resolve(i).substr(1),s=Ve.resolve(s).substr(1);function f(re){for(var se=0;se<re.length&&re[se]==="";se++);for(var xe=re.length-1;xe>=0&&re[xe]==="";xe--);return se>xe?[]:re.slice(se,xe-se+1)}for(var h=f(i.split("/")),v=f(s.split("/")),M=Math.min(h.length,v.length),O=M,G=0;G<M;G++)if(h[G]!==v[G]){O=G;break}for(var K=[],G=O;G<h.length;G++)K.push("..");return K=K.concat(v.slice(O)),K.join("/")}},q=[],Ie=i=>{for(var s=0,f=0;f<i.length;++f){var h=i.charCodeAt(f);h<=127?s++:h<=2047?s+=2:h>=55296&&h<=57343?(s+=4,++f):s+=3}return s},Pe=(i,s,f,h)=>{if(!(h>0))return 0;for(var v=f,M=f+h-1,O=0;O<i.length;++O){var G=i.charCodeAt(O);if(G>=55296&&G<=57343){var K=i.charCodeAt(++O);G=65536+((G&1023)<<10)|K&1023}if(G<=127){if(f>=M)break;s[f++]=G}else if(G<=2047){if(f+1>=M)break;s[f++]=192|G>>6,s[f++]=128|G&63}else if(G<=65535){if(f+2>=M)break;s[f++]=224|G>>12,s[f++]=128|G>>6&63,s[f++]=128|G&63}else{if(f+3>=M)break;s[f++]=240|G>>18,s[f++]=128|G>>12&63,s[f++]=128|G>>6&63,s[f++]=128|G&63}}return s[f]=0,f-v};function Ce(i,s,f){var h=Ie(i)+1,v=new Array(h),M=Pe(i,v,0,v.length);return s&&(v.length=M),v}var Ee=()=>{if(!q.length){var i=null;if(y){var s=256,f=Buffer.alloc(s),h=0,v=process.stdin.fd;try{h=X.readSync(v,f,0,s)}catch(M){if(M.toString().includes("EOF"))h=0;else throw M}h>0&&(i=f.slice(0,h).toString("utf-8"))}else typeof window<"u"&&typeof window.prompt=="function"&&(i=window.prompt("Input: "),i!==null&&(i+=`
`));if(!i)return null;q=Ce(i,!0)}return q.shift()},pe={ttys:[],init(){},shutdown(){},register(i,s){pe.ttys[i]={input:[],output:[],ops:s},A.registerDevice(i,pe.stream_ops)},stream_ops:{open(i){var s=pe.ttys[i.node.rdev];if(!s)throw new A.ErrnoError(43);i.tty=s,i.seekable=!1},close(i){i.tty.ops.fsync(i.tty)},fsync(i){i.tty.ops.fsync(i.tty)},read(i,s,f,h,v){if(!i.tty||!i.tty.ops.get_char)throw new A.ErrnoError(60);for(var M=0,O=0;O<h;O++){var G;try{G=i.tty.ops.get_char(i.tty)}catch{throw new A.ErrnoError(29)}if(G===void 0&&M===0)throw new A.ErrnoError(6);if(G==null)break;M++,s[f+O]=G}return M&&(i.node.timestamp=Date.now()),M},write(i,s,f,h,v){if(!i.tty||!i.tty.ops.put_char)throw new A.ErrnoError(60);try{for(var M=0;M<h;M++)i.tty.ops.put_char(i.tty,s[f+M])}catch{throw new A.ErrnoError(29)}return h&&(i.node.timestamp=Date.now()),M}},default_tty_ops:{get_char(i){return Ee()},put_char(i,s){s===null||s===10?(R(de(i.output,0)),i.output=[]):s!=0&&i.output.push(s)},fsync(i){i.output&&i.output.length>0&&(R(de(i.output,0)),i.output=[])},ioctl_tcgets(i){return{c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(i,s,f){return 0},ioctl_tiocgwinsz(i){return[24,80]}},default_tty1_ops:{put_char(i,s){s===null||s===10?(F(de(i.output,0)),i.output=[]):s!=0&&i.output.push(s)},fsync(i){i.output&&i.output.length>0&&(F(de(i.output,0)),i.output=[])}}},ze=i=>{Re()},Te={ops_table:null,mount(i){return Te.createNode(null,"/",16895,0)},createNode(i,s,f,h){if(A.isBlkdev(f)||A.isFIFO(f))throw new A.ErrnoError(63);Te.ops_table||(Te.ops_table={dir:{node:{getattr:Te.node_ops.getattr,setattr:Te.node_ops.setattr,lookup:Te.node_ops.lookup,mknod:Te.node_ops.mknod,rename:Te.node_ops.rename,unlink:Te.node_ops.unlink,rmdir:Te.node_ops.rmdir,readdir:Te.node_ops.readdir,symlink:Te.node_ops.symlink},stream:{llseek:Te.stream_ops.llseek}},file:{node:{getattr:Te.node_ops.getattr,setattr:Te.node_ops.setattr},stream:{llseek:Te.stream_ops.llseek,read:Te.stream_ops.read,write:Te.stream_ops.write,allocate:Te.stream_ops.allocate,mmap:Te.stream_ops.mmap,msync:Te.stream_ops.msync}},link:{node:{getattr:Te.node_ops.getattr,setattr:Te.node_ops.setattr,readlink:Te.node_ops.readlink},stream:{}},chrdev:{node:{getattr:Te.node_ops.getattr,setattr:Te.node_ops.setattr},stream:A.chrdev_stream_ops}});var v=A.createNode(i,s,f,h);return A.isDir(v.mode)?(v.node_ops=Te.ops_table.dir.node,v.stream_ops=Te.ops_table.dir.stream,v.contents={}):A.isFile(v.mode)?(v.node_ops=Te.ops_table.file.node,v.stream_ops=Te.ops_table.file.stream,v.usedBytes=0,v.contents=null):A.isLink(v.mode)?(v.node_ops=Te.ops_table.link.node,v.stream_ops=Te.ops_table.link.stream):A.isChrdev(v.mode)&&(v.node_ops=Te.ops_table.chrdev.node,v.stream_ops=Te.ops_table.chrdev.stream),v.timestamp=Date.now(),i&&(i.contents[s]=v,i.timestamp=v.timestamp),v},getFileDataAsTypedArray(i){return i.contents?i.contents.subarray?i.contents.subarray(0,i.usedBytes):new Uint8Array(i.contents):new Uint8Array(0)},expandFileStorage(i,s){var f=i.contents?i.contents.length:0;if(!(f>=s)){var h=1048576;s=Math.max(s,f*(f<h?2:1.125)>>>0),f!=0&&(s=Math.max(s,256));var v=i.contents;i.contents=new Uint8Array(s),i.usedBytes>0&&i.contents.set(v.subarray(0,i.usedBytes),0)}},resizeFileStorage(i,s){if(i.usedBytes!=s)if(s==0)i.contents=null,i.usedBytes=0;else{var f=i.contents;i.contents=new Uint8Array(s),f&&i.contents.set(f.subarray(0,Math.min(s,i.usedBytes))),i.usedBytes=s}},node_ops:{getattr(i){var s={};return s.dev=A.isChrdev(i.mode)?i.id:1,s.ino=i.id,s.mode=i.mode,s.nlink=1,s.uid=0,s.gid=0,s.rdev=i.rdev,A.isDir(i.mode)?s.size=4096:A.isFile(i.mode)?s.size=i.usedBytes:A.isLink(i.mode)?s.size=i.link.length:s.size=0,s.atime=new Date(i.timestamp),s.mtime=new Date(i.timestamp),s.ctime=new Date(i.timestamp),s.blksize=4096,s.blocks=Math.ceil(s.size/s.blksize),s},setattr(i,s){s.mode!==void 0&&(i.mode=s.mode),s.timestamp!==void 0&&(i.timestamp=s.timestamp),s.size!==void 0&&Te.resizeFileStorage(i,s.size)},lookup(i,s){throw A.genericErrors[44]},mknod(i,s,f,h){return Te.createNode(i,s,f,h)},rename(i,s,f){if(A.isDir(i.mode)){var h;try{h=A.lookupNode(s,f)}catch{}if(h)for(var v in h.contents)throw new A.ErrnoError(55)}delete i.parent.contents[i.name],i.parent.timestamp=Date.now(),i.name=f,s.contents[f]=i,s.timestamp=i.parent.timestamp},unlink(i,s){delete i.contents[s],i.timestamp=Date.now()},rmdir(i,s){var f=A.lookupNode(i,s);for(var h in f.contents)throw new A.ErrnoError(55);delete i.contents[s],i.timestamp=Date.now()},readdir(i){var s=[".",".."];for(var f of Object.keys(i.contents))s.push(f);return s},symlink(i,s,f){var h=Te.createNode(i,s,41471,0);return h.link=f,h},readlink(i){if(!A.isLink(i.mode))throw new A.ErrnoError(28);return i.link}},stream_ops:{read(i,s,f,h,v){var M=i.node.contents;if(v>=i.node.usedBytes)return 0;var O=Math.min(i.node.usedBytes-v,h);if(O>8&&M.subarray)s.set(M.subarray(v,v+O),f);else for(var G=0;G<O;G++)s[f+G]=M[v+G];return O},write(i,s,f,h,v,M){if(s.buffer===z.buffer&&(M=!1),!h)return 0;var O=i.node;if(O.timestamp=Date.now(),s.subarray&&(!O.contents||O.contents.subarray)){if(M)return O.contents=s.subarray(f,f+h),O.usedBytes=h,h;if(O.usedBytes===0&&v===0)return O.contents=s.slice(f,f+h),O.usedBytes=h,h;if(v+h<=O.usedBytes)return O.contents.set(s.subarray(f,f+h),v),h}if(Te.expandFileStorage(O,v+h),O.contents.subarray&&s.subarray)O.contents.set(s.subarray(f,f+h),v);else for(var G=0;G<h;G++)O.contents[v+G]=s[f+G];return O.usedBytes=Math.max(O.usedBytes,v+h),h},llseek(i,s,f){var h=s;if(f===1?h+=i.position:f===2&&A.isFile(i.node.mode)&&(h+=i.node.usedBytes),h<0)throw new A.ErrnoError(28);return h},allocate(i,s,f){Te.expandFileStorage(i.node,s+f),i.node.usedBytes=Math.max(i.node.usedBytes,s+f)},mmap(i,s,f,h,v){if(!A.isFile(i.node.mode))throw new A.ErrnoError(43);var M,O,G=i.node.contents;if(!(v&2)&&G.buffer===z.buffer)O=!1,M=G.byteOffset;else{if((f>0||f+s<G.length)&&(G.subarray?G=G.subarray(f,f+s):G=Array.prototype.slice.call(G,f,f+s)),O=!0,M=ze(),!M)throw new A.ErrnoError(48);z.set(G,M)}return{ptr:M,allocated:O}},msync(i,s,f,h,v){return Te.stream_ops.write(i,s,0,h,f,!1),0}}},It=(i,s,f,h)=>{var v=`al ${i}`;V(i,M=>{s(new Uint8Array(M)),v&&Lt()},M=>{if(f)f();else throw`Loading data file "${i}" failed.`}),v&&ft()},Mt=(i,s,f,h,v,M)=>{A.createDataFile(i,s,f,h,v,M)},Sn=o.preloadPlugins||[],dn=(i,s,f,h)=>{typeof Browser<"u"&&Browser.init();var v=!1;return Sn.forEach(M=>{v||M.canHandle(s)&&(M.handle(i,s,f,h),v=!0)}),v},mr=(i,s,f,h,v,M,O,G,K,re)=>{var se=s?Ve.resolve(we.join2(i,s)):i;function xe(Ae){function De(Xe){re?.(),G||Mt(i,s,Xe,h,v,K),M?.(),Lt()}dn(Ae,se,De,()=>{O?.(),Lt()})||De(Ae)}ft(),typeof f=="string"?It(f,xe,O):xe(f)},$n=i=>{var s={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090},f=s[i];if(typeof f>"u")throw new Error(`Unknown file open mode: ${i}`);return f},er=(i,s)=>{var f=0;return i&&(f|=365),s&&(f|=146),f},A={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:!1,ignorePermissions:!0,ErrnoError:class{constructor(i){this.name="ErrnoError",this.errno=i}},genericErrors:{},filesystems:null,syncFSRequests:0,FSStream:class{constructor(){this.shared={}}get object(){return this.node}set object(i){this.node=i}get isRead(){return(this.flags&2097155)!==1}get isWrite(){return(this.flags&2097155)!==0}get isAppend(){return this.flags&1024}get flags(){return this.shared.flags}set flags(i){this.shared.flags=i}get position(){return this.shared.position}set position(i){this.shared.position=i}},FSNode:class{constructor(i,s,f,h){i||(i=this),this.parent=i,this.mount=i.mount,this.mounted=null,this.id=A.nextInode++,this.name=s,this.mode=f,this.node_ops={},this.stream_ops={},this.rdev=h,this.readMode=365,this.writeMode=146}get read(){return(this.mode&this.readMode)===this.readMode}set read(i){i?this.mode|=this.readMode:this.mode&=~this.readMode}get write(){return(this.mode&this.writeMode)===this.writeMode}set write(i){i?this.mode|=this.writeMode:this.mode&=~this.writeMode}get isFolder(){return A.isDir(this.mode)}get isDevice(){return A.isChrdev(this.mode)}},lookupPath(i,s={}){if(i=Ve.resolve(i),!i)return{path:"",node:null};var f={follow_mount:!0,recurse_count:0};if(s=Object.assign(f,s),s.recurse_count>8)throw new A.ErrnoError(32);for(var h=i.split("/").filter(xe=>!!xe),v=A.root,M="/",O=0;O<h.length;O++){var G=O===h.length-1;if(G&&s.parent)break;if(v=A.lookupNode(v,h[O]),M=we.join2(M,h[O]),A.isMountpoint(v)&&(!G||G&&s.follow_mount)&&(v=v.mounted.root),!G||s.follow)for(var K=0;A.isLink(v.mode);){var re=A.readlink(M);M=Ve.resolve(we.dirname(M),re);var se=A.lookupPath(M,{recurse_count:s.recurse_count+1});if(v=se.node,K++>40)throw new A.ErrnoError(32)}}return{path:M,node:v}},getPath(i){for(var s;;){if(A.isRoot(i)){var f=i.mount.mountpoint;return s?f[f.length-1]!=="/"?`${f}/${s}`:f+s:f}s=s?`${i.name}/${s}`:i.name,i=i.parent}},hashName(i,s){for(var f=0,h=0;h<s.length;h++)f=(f<<5)-f+s.charCodeAt(h)|0;return(i+f>>>0)%A.nameTable.length},hashAddNode(i){var s=A.hashName(i.parent.id,i.name);i.name_next=A.nameTable[s],A.nameTable[s]=i},hashRemoveNode(i){var s=A.hashName(i.parent.id,i.name);if(A.nameTable[s]===i)A.nameTable[s]=i.name_next;else for(var f=A.nameTable[s];f;){if(f.name_next===i){f.name_next=i.name_next;break}f=f.name_next}},lookupNode(i,s){var f=A.mayLookup(i);if(f)throw new A.ErrnoError(f);for(var h=A.hashName(i.id,s),v=A.nameTable[h];v;v=v.name_next){var M=v.name;if(v.parent.id===i.id&&M===s)return v}return A.lookup(i,s)},createNode(i,s,f,h){var v=new A.FSNode(i,s,f,h);return A.hashAddNode(v),v},destroyNode(i){A.hashRemoveNode(i)},isRoot(i){return i===i.parent},isMountpoint(i){return!!i.mounted},isFile(i){return(i&61440)===32768},isDir(i){return(i&61440)===16384},isLink(i){return(i&61440)===40960},isChrdev(i){return(i&61440)===8192},isBlkdev(i){return(i&61440)===24576},isFIFO(i){return(i&61440)===4096},isSocket(i){return(i&49152)===49152},flagsToPermissionString(i){var s=["r","w","rw"][i&3];return i&512&&(s+="w"),s},nodePermissions(i,s){return A.ignorePermissions?0:s.includes("r")&&!(i.mode&292)||s.includes("w")&&!(i.mode&146)||s.includes("x")&&!(i.mode&73)?2:0},mayLookup(i){if(!A.isDir(i.mode))return 54;var s=A.nodePermissions(i,"x");return s||(i.node_ops.lookup?0:2)},mayCreate(i,s){try{var f=A.lookupNode(i,s);return 20}catch{}return A.nodePermissions(i,"wx")},mayDelete(i,s,f){var h;try{h=A.lookupNode(i,s)}catch(M){return M.errno}var v=A.nodePermissions(i,"wx");if(v)return v;if(f){if(!A.isDir(h.mode))return 54;if(A.isRoot(h)||A.getPath(h)===A.cwd())return 10}else if(A.isDir(h.mode))return 31;return 0},mayOpen(i,s){return i?A.isLink(i.mode)?32:A.isDir(i.mode)&&(A.flagsToPermissionString(s)!=="r"||s&512)?31:A.nodePermissions(i,A.flagsToPermissionString(s)):44},MAX_OPEN_FDS:4096,nextfd(){for(var i=0;i<=A.MAX_OPEN_FDS;i++)if(!A.streams[i])return i;throw new A.ErrnoError(33)},getStreamChecked(i){var s=A.getStream(i);if(!s)throw new A.ErrnoError(8);return s},getStream:i=>A.streams[i],createStream(i,s=-1){return i=Object.assign(new A.FSStream,i),s==-1&&(s=A.nextfd()),i.fd=s,A.streams[s]=i,i},closeStream(i){A.streams[i]=null},dupStream(i,s=-1){var f,h,v=A.createStream(i,s);return(h=(f=v.stream_ops)==null?void 0:f.dup)==null||h.call(f,v),v},chrdev_stream_ops:{open(i){var s,f,h=A.getDevice(i.node.rdev);i.stream_ops=h.stream_ops,(f=(s=i.stream_ops).open)==null||f.call(s,i)},llseek(){throw new A.ErrnoError(70)}},major:i=>i>>8,minor:i=>i&255,makedev:(i,s)=>i<<8|s,registerDevice(i,s){A.devices[i]={stream_ops:s}},getDevice:i=>A.devices[i],getMounts(i){for(var s=[],f=[i];f.length;){var h=f.pop();s.push(h),f.push(...h.mounts)}return s},syncfs(i,s){typeof i=="function"&&(s=i,i=!1),A.syncFSRequests++,A.syncFSRequests>1&&F(`warning: ${A.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);var f=A.getMounts(A.root.mount),h=0;function v(O){return A.syncFSRequests--,s(O)}function M(O){if(O)return M.errored?void 0:(M.errored=!0,v(O));++h>=f.length&&v(null)}f.forEach(O=>{if(!O.type.syncfs)return M(null);O.type.syncfs(O,i,M)})},mount(i,s,f){var h=f==="/",v=!f,M;if(h&&A.root)throw new A.ErrnoError(10);if(!h&&!v){var O=A.lookupPath(f,{follow_mount:!1});if(f=O.path,M=O.node,A.isMountpoint(M))throw new A.ErrnoError(10);if(!A.isDir(M.mode))throw new A.ErrnoError(54)}var G={type:i,opts:s,mountpoint:f,mounts:[]},K=i.mount(G);return K.mount=G,G.root=K,h?A.root=K:M&&(M.mounted=G,M.mount&&M.mount.mounts.push(G)),K},unmount(i){var s=A.lookupPath(i,{follow_mount:!1});if(!A.isMountpoint(s.node))throw new A.ErrnoError(28);var f=s.node,h=f.mounted,v=A.getMounts(h);Object.keys(A.nameTable).forEach(O=>{for(var G=A.nameTable[O];G;){var K=G.name_next;v.includes(G.mount)&&A.destroyNode(G),G=K}}),f.mounted=null;var M=f.mount.mounts.indexOf(h);f.mount.mounts.splice(M,1)},lookup(i,s){return i.node_ops.lookup(i,s)},mknod(i,s,f){var h=A.lookupPath(i,{parent:!0}),v=h.node,M=we.basename(i);if(!M||M==="."||M==="..")throw new A.ErrnoError(28);var O=A.mayCreate(v,M);if(O)throw new A.ErrnoError(O);if(!v.node_ops.mknod)throw new A.ErrnoError(63);return v.node_ops.mknod(v,M,s,f)},create(i,s){return s=s!==void 0?s:438,s&=4095,s|=32768,A.mknod(i,s,0)},mkdir(i,s){return s=s!==void 0?s:511,s&=1023,s|=16384,A.mknod(i,s,0)},mkdirTree(i,s){for(var f=i.split("/"),h="",v=0;v<f.length;++v)if(f[v]){h+="/"+f[v];try{A.mkdir(h,s)}catch(M){if(M.errno!=20)throw M}}},mkdev(i,s,f){return typeof f>"u"&&(f=s,s=438),s|=8192,A.mknod(i,s,f)},symlink(i,s){if(!Ve.resolve(i))throw new A.ErrnoError(44);var f=A.lookupPath(s,{parent:!0}),h=f.node;if(!h)throw new A.ErrnoError(44);var v=we.basename(s),M=A.mayCreate(h,v);if(M)throw new A.ErrnoError(M);if(!h.node_ops.symlink)throw new A.ErrnoError(63);return h.node_ops.symlink(h,v,i)},rename(i,s){var f=we.dirname(i),h=we.dirname(s),v=we.basename(i),M=we.basename(s),O,G,K;if(O=A.lookupPath(i,{parent:!0}),G=O.node,O=A.lookupPath(s,{parent:!0}),K=O.node,!G||!K)throw new A.ErrnoError(44);if(G.mount!==K.mount)throw new A.ErrnoError(75);var re=A.lookupNode(G,v),se=Ve.relative(i,h);if(se.charAt(0)!==".")throw new A.ErrnoError(28);if(se=Ve.relative(s,f),se.charAt(0)!==".")throw new A.ErrnoError(55);var xe;try{xe=A.lookupNode(K,M)}catch{}if(re!==xe){var Ae=A.isDir(re.mode),De=A.mayDelete(G,v,Ae);if(De)throw new A.ErrnoError(De);if(De=xe?A.mayDelete(K,M,Ae):A.mayCreate(K,M),De)throw new A.ErrnoError(De);if(!G.node_ops.rename)throw new A.ErrnoError(63);if(A.isMountpoint(re)||xe&&A.isMountpoint(xe))throw new A.ErrnoError(10);if(K!==G&&(De=A.nodePermissions(G,"w"),De))throw new A.ErrnoError(De);A.hashRemoveNode(re);try{G.node_ops.rename(re,K,M),re.parent=K}catch(Xe){throw Xe}finally{A.hashAddNode(re)}}},rmdir(i){var s=A.lookupPath(i,{parent:!0}),f=s.node,h=we.basename(i),v=A.lookupNode(f,h),M=A.mayDelete(f,h,!0);if(M)throw new A.ErrnoError(M);if(!f.node_ops.rmdir)throw new A.ErrnoError(63);if(A.isMountpoint(v))throw new A.ErrnoError(10);f.node_ops.rmdir(f,h),A.destroyNode(v)},readdir(i){var s=A.lookupPath(i,{follow:!0}),f=s.node;if(!f.node_ops.readdir)throw new A.ErrnoError(54);return f.node_ops.readdir(f)},unlink(i){var s=A.lookupPath(i,{parent:!0}),f=s.node;if(!f)throw new A.ErrnoError(44);var h=we.basename(i),v=A.lookupNode(f,h),M=A.mayDelete(f,h,!1);if(M)throw new A.ErrnoError(M);if(!f.node_ops.unlink)throw new A.ErrnoError(63);if(A.isMountpoint(v))throw new A.ErrnoError(10);f.node_ops.unlink(f,h),A.destroyNode(v)},readlink(i){var s=A.lookupPath(i),f=s.node;if(!f)throw new A.ErrnoError(44);if(!f.node_ops.readlink)throw new A.ErrnoError(28);return Ve.resolve(A.getPath(f.parent),f.node_ops.readlink(f))},stat(i,s){var f=A.lookupPath(i,{follow:!s}),h=f.node;if(!h)throw new A.ErrnoError(44);if(!h.node_ops.getattr)throw new A.ErrnoError(63);return h.node_ops.getattr(h)},lstat(i){return A.stat(i,!0)},chmod(i,s,f){var h;if(typeof i=="string"){var v=A.lookupPath(i,{follow:!f});h=v.node}else h=i;if(!h.node_ops.setattr)throw new A.ErrnoError(63);h.node_ops.setattr(h,{mode:s&4095|h.mode&-4096,timestamp:Date.now()})},lchmod(i,s){A.chmod(i,s,!0)},fchmod(i,s){var f=A.getStreamChecked(i);A.chmod(f.node,s)},chown(i,s,f,h){var v;if(typeof i=="string"){var M=A.lookupPath(i,{follow:!h});v=M.node}else v=i;if(!v.node_ops.setattr)throw new A.ErrnoError(63);v.node_ops.setattr(v,{timestamp:Date.now()})},lchown(i,s,f){A.chown(i,s,f,!0)},fchown(i,s,f){var h=A.getStreamChecked(i);A.chown(h.node,s,f)},truncate(i,s){if(s<0)throw new A.ErrnoError(28);var f;if(typeof i=="string"){var h=A.lookupPath(i,{follow:!0});f=h.node}else f=i;if(!f.node_ops.setattr)throw new A.ErrnoError(63);if(A.isDir(f.mode))throw new A.ErrnoError(31);if(!A.isFile(f.mode))throw new A.ErrnoError(28);var v=A.nodePermissions(f,"w");if(v)throw new A.ErrnoError(v);f.node_ops.setattr(f,{size:s,timestamp:Date.now()})},ftruncate(i,s){var f=A.getStreamChecked(i);if(!(f.flags&2097155))throw new A.ErrnoError(28);A.truncate(f.node,s)},utime(i,s,f){var h=A.lookupPath(i,{follow:!0}),v=h.node;v.node_ops.setattr(v,{timestamp:Math.max(s,f)})},open(i,s,f){if(i==="")throw new A.ErrnoError(44);s=typeof s=="string"?$n(s):s,s&64?(f=typeof f>"u"?438:f,f=f&4095|32768):f=0;var h;if(typeof i=="object")h=i;else{i=we.normalize(i);try{var v=A.lookupPath(i,{follow:!(s&131072)});h=v.node}catch{}}var M=!1;if(s&64)if(h){if(s&128)throw new A.ErrnoError(20)}else h=A.mknod(i,f,0),M=!0;if(!h)throw new A.ErrnoError(44);if(A.isChrdev(h.mode)&&(s&=-513),s&65536&&!A.isDir(h.mode))throw new A.ErrnoError(54);if(!M){var O=A.mayOpen(h,s);if(O)throw new A.ErrnoError(O)}s&512&&!M&&A.truncate(h,0),s&=-131713;var G=A.createStream({node:h,path:A.getPath(h),flags:s,seekable:!0,position:0,stream_ops:h.stream_ops,ungotten:[],error:!1});return G.stream_ops.open&&G.stream_ops.open(G),o.logReadFiles&&!(s&1)&&(A.readFiles||(A.readFiles={}),i in A.readFiles||(A.readFiles[i]=1)),G},close(i){if(A.isClosed(i))throw new A.ErrnoError(8);i.getdents&&(i.getdents=null);try{i.stream_ops.close&&i.stream_ops.close(i)}catch(s){throw s}finally{A.closeStream(i.fd)}i.fd=null},isClosed(i){return i.fd===null},llseek(i,s,f){if(A.isClosed(i))throw new A.ErrnoError(8);if(!i.seekable||!i.stream_ops.llseek)throw new A.ErrnoError(70);if(f!=0&&f!=1&&f!=2)throw new A.ErrnoError(28);return i.position=i.stream_ops.llseek(i,s,f),i.ungotten=[],i.position},read(i,s,f,h,v){if(h<0||v<0)throw new A.ErrnoError(28);if(A.isClosed(i))throw new A.ErrnoError(8);if((i.flags&2097155)===1)throw new A.ErrnoError(8);if(A.isDir(i.node.mode))throw new A.ErrnoError(31);if(!i.stream_ops.read)throw new A.ErrnoError(28);var M=typeof v<"u";if(!M)v=i.position;else if(!i.seekable)throw new A.ErrnoError(70);var O=i.stream_ops.read(i,s,f,h,v);return M||(i.position+=O),O},write(i,s,f,h,v,M){if(h<0||v<0)throw new A.ErrnoError(28);if(A.isClosed(i))throw new A.ErrnoError(8);if(!(i.flags&2097155))throw new A.ErrnoError(8);if(A.isDir(i.node.mode))throw new A.ErrnoError(31);if(!i.stream_ops.write)throw new A.ErrnoError(28);i.seekable&&i.flags&1024&&A.llseek(i,0,2);var O=typeof v<"u";if(!O)v=i.position;else if(!i.seekable)throw new A.ErrnoError(70);var G=i.stream_ops.write(i,s,f,h,v,M);return O||(i.position+=G),G},allocate(i,s,f){if(A.isClosed(i))throw new A.ErrnoError(8);if(s<0||f<=0)throw new A.ErrnoError(28);if(!(i.flags&2097155))throw new A.ErrnoError(8);if(!A.isFile(i.node.mode)&&!A.isDir(i.node.mode))throw new A.ErrnoError(43);if(!i.stream_ops.allocate)throw new A.ErrnoError(138);i.stream_ops.allocate(i,s,f)},mmap(i,s,f,h,v){if(h&2&&!(v&2)&&(i.flags&2097155)!==2)throw new A.ErrnoError(2);if((i.flags&2097155)===1)throw new A.ErrnoError(2);if(!i.stream_ops.mmap)throw new A.ErrnoError(43);return i.stream_ops.mmap(i,s,f,h,v)},msync(i,s,f,h,v){return i.stream_ops.msync?i.stream_ops.msync(i,s,f,h,v):0},ioctl(i,s,f){if(!i.stream_ops.ioctl)throw new A.ErrnoError(59);return i.stream_ops.ioctl(i,s,f)},readFile(i,s={}){if(s.flags=s.flags||0,s.encoding=s.encoding||"binary",s.encoding!=="utf8"&&s.encoding!=="binary")throw new Error(`Invalid encoding type "${s.encoding}"`);var f,h=A.open(i,s.flags),v=A.stat(i),M=v.size,O=new Uint8Array(M);return A.read(h,O,0,M,0),s.encoding==="utf8"?f=de(O,0):s.encoding==="binary"&&(f=O),A.close(h),f},writeFile(i,s,f={}){f.flags=f.flags||577;var h=A.open(i,f.flags,f.mode);if(typeof s=="string"){var v=new Uint8Array(Ie(s)+1),M=Pe(s,v,0,v.length);A.write(h,v,0,M,void 0,f.canOwn)}else if(ArrayBuffer.isView(s))A.write(h,s,0,s.byteLength,void 0,f.canOwn);else throw new Error("Unsupported data type");A.close(h)},cwd:()=>A.currentPath,chdir(i){var s=A.lookupPath(i,{follow:!0});if(s.node===null)throw new A.ErrnoError(44);if(!A.isDir(s.node.mode))throw new A.ErrnoError(54);var f=A.nodePermissions(s.node,"x");if(f)throw new A.ErrnoError(f);A.currentPath=s.path},createDefaultDirectories(){A.mkdir("/tmp"),A.mkdir("/home"),A.mkdir("/home/web_user")},createDefaultDevices(){A.mkdir("/dev"),A.registerDevice(A.makedev(1,3),{read:()=>0,write:(h,v,M,O,G)=>O}),A.mkdev("/dev/null",A.makedev(1,3)),pe.register(A.makedev(5,0),pe.default_tty_ops),pe.register(A.makedev(6,0),pe.default_tty1_ops),A.mkdev("/dev/tty",A.makedev(5,0)),A.mkdev("/dev/tty1",A.makedev(6,0));var i=new Uint8Array(1024),s=0,f=()=>(s===0&&(s=Be(i).byteLength),i[--s]);A.createDevice("/dev","random",f),A.createDevice("/dev","urandom",f),A.mkdir("/dev/shm"),A.mkdir("/dev/shm/tmp")},createSpecialDirectories(){A.mkdir("/proc");var i=A.mkdir("/proc/self");A.mkdir("/proc/self/fd"),A.mount({mount(){var s=A.createNode(i,"fd",16895,73);return s.node_ops={lookup(f,h){var v=+h,M=A.getStreamChecked(v),O={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>M.path}};return O.parent=O,O}},s}},{},"/proc/self/fd")},createStandardStreams(){o.stdin?A.createDevice("/dev","stdin",o.stdin):A.symlink("/dev/tty","/dev/stdin"),o.stdout?A.createDevice("/dev","stdout",null,o.stdout):A.symlink("/dev/tty","/dev/stdout"),o.stderr?A.createDevice("/dev","stderr",null,o.stderr):A.symlink("/dev/tty1","/dev/stderr"),A.open("/dev/stdin",0),A.open("/dev/stdout",1),A.open("/dev/stderr",1)},staticInit(){[44].forEach(i=>{A.genericErrors[i]=new A.ErrnoError(i),A.genericErrors[i].stack="<generic error, no stack>"}),A.nameTable=new Array(4096),A.mount(Te,{},"/"),A.createDefaultDirectories(),A.createDefaultDevices(),A.createSpecialDirectories(),A.filesystems={MEMFS:Te}},init(i,s,f){A.init.initialized=!0,o.stdin=i||o.stdin,o.stdout=s||o.stdout,o.stderr=f||o.stderr,A.createStandardStreams()},quit(){A.init.initialized=!1;for(var i=0;i<A.streams.length;i++){var s=A.streams[i];s&&A.close(s)}},findObject(i,s){var f=A.analyzePath(i,s);return f.exists?f.object:null},analyzePath(i,s){try{var f=A.lookupPath(i,{follow:!s});i=f.path}catch{}var h={isRoot:!1,exists:!1,error:0,name:null,path:null,object:null,parentExists:!1,parentPath:null,parentObject:null};try{var f=A.lookupPath(i,{parent:!0});h.parentExists=!0,h.parentPath=f.path,h.parentObject=f.node,h.name=we.basename(i),f=A.lookupPath(i,{follow:!s}),h.exists=!0,h.path=f.path,h.object=f.node,h.name=f.node.name,h.isRoot=f.path==="/"}catch(v){h.error=v.errno}return h},createPath(i,s,f,h){i=typeof i=="string"?i:A.getPath(i);for(var v=s.split("/").reverse();v.length;){var M=v.pop();if(M){var O=we.join2(i,M);try{A.mkdir(O)}catch{}i=O}}return O},createFile(i,s,f,h,v){var M=we.join2(typeof i=="string"?i:A.getPath(i),s),O=er(h,v);return A.create(M,O)},createDataFile(i,s,f,h,v,M){var O=s;i&&(i=typeof i=="string"?i:A.getPath(i),O=s?we.join2(i,s):i);var G=er(h,v),K=A.create(O,G);if(f){if(typeof f=="string"){for(var re=new Array(f.length),se=0,xe=f.length;se<xe;++se)re[se]=f.charCodeAt(se);f=re}A.chmod(K,G|146);var Ae=A.open(K,577);A.write(Ae,f,0,f.length,0,M),A.close(Ae),A.chmod(K,G)}},createDevice(i,s,f,h){var v=we.join2(typeof i=="string"?i:A.getPath(i),s),M=er(!!f,!!h);A.createDevice.major||(A.createDevice.major=64);var O=A.makedev(A.createDevice.major++,0);return A.registerDevice(O,{open(G){G.seekable=!1},close(G){var K;(K=h?.buffer)!=null&&K.length&&h(10)},read(G,K,re,se,xe){for(var Ae=0,De=0;De<se;De++){var Xe;try{Xe=f()}catch{throw new A.ErrnoError(29)}if(Xe===void 0&&Ae===0)throw new A.ErrnoError(6);if(Xe==null)break;Ae++,K[re+De]=Xe}return Ae&&(G.node.timestamp=Date.now()),Ae},write(G,K,re,se,xe){for(var Ae=0;Ae<se;Ae++)try{h(K[re+Ae])}catch{throw new A.ErrnoError(29)}return se&&(G.node.timestamp=Date.now()),Ae}}),A.mkdev(v,M,O)},forceLoadFile(i){if(i.isDevice||i.isFolder||i.link||i.contents)return!0;if(typeof XMLHttpRequest<"u")throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");if(b)try{i.contents=Ce(b(i.url),!0),i.usedBytes=i.contents.length}catch{throw new A.ErrnoError(29)}else throw new Error("Cannot load without read() or XMLHttpRequest.")},createLazyFile(i,s,f,h,v){class M{constructor(){this.lengthKnown=!1,this.chunks=[]}get(De){if(!(De>this.length-1||De<0)){var Xe=De%this.chunkSize,me=De/this.chunkSize|0;return this.getter(me)[Xe]}}setDataGetter(De){this.getter=De}cacheLength(){var De=new XMLHttpRequest;if(De.open("HEAD",f,!1),De.send(null),!(De.status>=200&&De.status<300||De.status===304))throw new Error("Couldn't load "+f+". Status: "+De.status);var Xe=Number(De.getResponseHeader("Content-length")),me,Le=(me=De.getResponseHeader("Accept-Ranges"))&&me==="bytes",ht=(me=De.getResponseHeader("Content-Encoding"))&&me==="gzip",ce=1024*1024;Le||(ce=Xe);var ke=(Ut,Rn)=>{if(Ut>Rn)throw new Error("invalid range ("+Ut+", "+Rn+") or no bytes requested!");if(Rn>Xe-1)throw new Error("only "+Xe+" bytes available! programmer error!");var jt=new XMLHttpRequest;if(jt.open("GET",f,!1),Xe!==ce&&jt.setRequestHeader("Range","bytes="+Ut+"-"+Rn),jt.responseType="arraybuffer",jt.overrideMimeType&&jt.overrideMimeType("text/plain; charset=x-user-defined"),jt.send(null),!(jt.status>=200&&jt.status<300||jt.status===304))throw new Error("Couldn't load "+f+". Status: "+jt.status);return jt.response!==void 0?new Uint8Array(jt.response||[]):Ce(jt.responseText||"",!0)},st=this;st.setDataGetter(Ut=>{var Rn=Ut*ce,jt=(Ut+1)*ce-1;if(jt=Math.min(jt,Xe-1),typeof st.chunks[Ut]>"u"&&(st.chunks[Ut]=ke(Rn,jt)),typeof st.chunks[Ut]>"u")throw new Error("doXHR failed!");return st.chunks[Ut]}),(ht||!Xe)&&(ce=Xe=1,Xe=this.getter(0).length,ce=Xe,R("LazyFiles on gzip forces download of the whole file when length is accessed")),this._length=Xe,this._chunkSize=ce,this.lengthKnown=!0}get length(){return this.lengthKnown||this.cacheLength(),this._length}get chunkSize(){return this.lengthKnown||this.cacheLength(),this._chunkSize}}if(typeof XMLHttpRequest<"u"){if(!x)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var O=new M,G={isDevice:!1,contents:O}}else var G={isDevice:!1,url:f};var K=A.createFile(i,s,G,h,v);G.contents?K.contents=G.contents:G.url&&(K.contents=null,K.url=G.url),Object.defineProperties(K,{usedBytes:{get:function(){return this.contents.length}}});var re={},se=Object.keys(K.stream_ops);se.forEach(Ae=>{var De=K.stream_ops[Ae];re[Ae]=(...Xe)=>(A.forceLoadFile(K),De(...Xe))});function xe(Ae,De,Xe,me,Le){var ht=Ae.node.contents;if(Le>=ht.length)return 0;var ce=Math.min(ht.length-Le,me);if(ht.slice)for(var ke=0;ke<ce;ke++)De[Xe+ke]=ht[Le+ke];else for(var ke=0;ke<ce;ke++)De[Xe+ke]=ht.get(Le+ke);return ce}return re.read=(Ae,De,Xe,me,Le)=>(A.forceLoadFile(K),xe(Ae,De,Xe,me,Le)),re.mmap=(Ae,De,Xe,me,Le)=>{A.forceLoadFile(K);var ht=ze();if(!ht)throw new A.ErrnoError(48);return xe(Ae,z,ht,De,Xe),{ptr:ht,allocated:!0}},K.stream_ops=re,K}},Xt={DEFAULT_POLLMASK:5,calculateAt(i,s,f){if(we.isAbs(s))return s;var h;if(i===-100)h=A.cwd();else{var v=Xt.getStreamFromFD(i);h=v.path}if(s.length==0){if(!f)throw new A.ErrnoError(44);return h}return we.join2(h,s)},doStat(i,s,f){var h=i(s);j[f>>2]=h.dev,j[f+4>>2]=h.mode,J[f+8>>2]=h.nlink,j[f+12>>2]=h.uid,j[f+16>>2]=h.gid,j[f+20>>2]=h.rdev,P=[h.size>>>0,(N=h.size,+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+24>>2]=P[0],j[f+28>>2]=P[1],j[f+32>>2]=4096,j[f+36>>2]=h.blocks;var v=h.atime.getTime(),M=h.mtime.getTime(),O=h.ctime.getTime();return P=[Math.floor(v/1e3)>>>0,(N=Math.floor(v/1e3),+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+40>>2]=P[0],j[f+44>>2]=P[1],J[f+48>>2]=v%1e3*1e3,P=[Math.floor(M/1e3)>>>0,(N=Math.floor(M/1e3),+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+56>>2]=P[0],j[f+60>>2]=P[1],J[f+64>>2]=M%1e3*1e3,P=[Math.floor(O/1e3)>>>0,(N=Math.floor(O/1e3),+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+72>>2]=P[0],j[f+76>>2]=P[1],J[f+80>>2]=O%1e3*1e3,P=[h.ino>>>0,(N=h.ino,+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+88>>2]=P[0],j[f+92>>2]=P[1],0},doMsync(i,s,f,h,v){if(!A.isFile(s.node.mode))throw new A.ErrnoError(43);if(h&2)return 0;var M=B.slice(i,i+f);A.msync(s,M,v,f,h)},getStreamFromFD(i){var s=A.getStreamChecked(i);return s},varargs:void 0,getStr(i){var s=ie(i);return s}};function Mi(i,s,f){Xt.varargs=f;try{var h=Xt.getStreamFromFD(i);switch(s){case 0:{var v=ve();if(v<0)return-28;for(;A.streams[v];)v++;var M;return M=A.dupStream(h,v),M.fd}case 1:case 2:return 0;case 3:return h.flags;case 4:{var v=ve();return h.flags|=v,0}case 12:{var v=fe(),O=0;return Y[v+O>>1]=2,0}case 13:case 14:return 0}return-28}catch(G){if(typeof A>"u"||G.name!=="ErrnoError")throw G;return-G.errno}}function Ki(i,s,f){Xt.varargs=f;try{var h=Xt.getStreamFromFD(i);switch(s){case 21509:return h.tty?0:-59;case 21505:{if(!h.tty)return-59;if(h.tty.ops.ioctl_tcgets){var v=h.tty.ops.ioctl_tcgets(h),M=fe();j[M>>2]=v.c_iflag||0,j[M+4>>2]=v.c_oflag||0,j[M+8>>2]=v.c_cflag||0,j[M+12>>2]=v.c_lflag||0;for(var O=0;O<32;O++)z[M+O+17]=v.c_cc[O]||0;return 0}return 0}case 21510:case 21511:case 21512:return h.tty?0:-59;case 21506:case 21507:case 21508:{if(!h.tty)return-59;if(h.tty.ops.ioctl_tcsets){for(var M=fe(),G=j[M>>2],K=j[M+4>>2],re=j[M+8>>2],se=j[M+12>>2],xe=[],O=0;O<32;O++)xe.push(z[M+O+17]);return h.tty.ops.ioctl_tcsets(h.tty,s,{c_iflag:G,c_oflag:K,c_cflag:re,c_lflag:se,c_cc:xe})}return 0}case 21519:{if(!h.tty)return-59;var M=fe();return j[M>>2]=0,0}case 21520:return h.tty?-28:-59;case 21531:{var M=fe();return A.ioctl(h,s,M)}case 21523:{if(!h.tty)return-59;if(h.tty.ops.ioctl_tiocgwinsz){var Ae=h.tty.ops.ioctl_tiocgwinsz(h.tty),M=fe();Y[M>>1]=Ae[0],Y[M+2>>1]=Ae[1]}return 0}case 21524:return h.tty?0:-59;case 21515:return h.tty?0:-59;default:return-28}}catch(De){if(typeof A>"u"||De.name!=="ErrnoError")throw De;return-De.errno}}function ti(i,s,f,h){Xt.varargs=h;try{s=Xt.getStr(s),s=Xt.calculateAt(i,s);var v=h?ve():0;return A.open(s,f,v).fd}catch(M){if(typeof A>"u"||M.name!=="ErrnoError")throw M;return-M.errno}}function Zi(i,s,f){try{return s=Xt.getStr(s),s=Xt.calculateAt(i,s),f===0?A.unlink(s):f===512?A.rmdir(s):Re("Invalid flags passed to unlinkat"),0}catch(h){if(typeof A>"u"||h.name!=="ErrnoError")throw h;return-h.errno}}var Dr=()=>{Re("")},Yt={},Lr=i=>{for(;i.length;){var s=i.pop(),f=i.pop();f(s)}};function Zt(i){return this.fromWireType(J[i>>2])}var _r={},nn={},bn={},Ji,ni=i=>{throw new Ji(i)},U=(i,s,f)=>{i.forEach(function(G){bn[G]=s});function h(G){var K=f(G);K.length!==i.length&&ni("Mismatched type converter count");for(var re=0;re<i.length;++re)Je(i[re],K[re])}var v=new Array(s.length),M=[],O=0;s.forEach((G,K)=>{nn.hasOwnProperty(G)?v[K]=nn[G]:(M.push(G),_r.hasOwnProperty(G)||(_r[G]=[]),_r[G].push(()=>{v[K]=nn[G],++O,O===M.length&&h(v)}))}),M.length===0&&h(v)},Q=i=>{var s=Yt[i];delete Yt[i];var f=s.rawConstructor,h=s.rawDestructor,v=s.fields,M=v.map(O=>O.getterReturnType).concat(v.map(O=>O.setterArgumentType));U([i],M,O=>{var G={};return v.forEach((K,re)=>{var se=K.fieldName,xe=O[re],Ae=K.getter,De=K.getterContext,Xe=O[re+v.length],me=K.setter,Le=K.setterContext;G[se]={read:ht=>xe.fromWireType(Ae(De,ht)),write:(ht,ce)=>{var ke=[];me(Le,ht,Xe.toWireType(ke,ce)),Lr(ke)}}}),[{name:s.name,fromWireType:K=>{var re={};for(var se in G)re[se]=G[se].read(K);return h(K),re},toWireType:(K,re)=>{for(var se in G)if(!(se in re))throw new TypeError(`Missing field: "${se}"`);var xe=f();for(se in G)G[se].write(xe,re[se]);return K!==null&&K.push(h,xe),xe},argPackAdvance:tt,readValueFromPointer:Zt,destructorFunction:h}]})},ae=(i,s,f,h,v)=>{},oe=()=>{for(var i=new Array(256),s=0;s<256;++s)i[s]=String.fromCharCode(s);ee=i},ee,ye=i=>{for(var s="",f=i;B[f];)s+=ee[B[f++]];return s},Ne,Me=i=>{throw new Ne(i)};function We(i,s,f={}){var h=s.name;if(i||Me(`type "${h}" must have a positive integer typeid pointer`),nn.hasOwnProperty(i)){if(f.ignoreDuplicateRegistrations)return;Me(`Cannot register type '${h}' twice`)}if(nn[i]=s,delete bn[i],_r.hasOwnProperty(i)){var v=_r[i];delete _r[i],v.forEach(M=>M())}}function Je(i,s,f={}){if(!("argPackAdvance"in s))throw new TypeError("registerType registeredInstance requires argPackAdvance");return We(i,s,f)}var tt=8,at=(i,s,f,h)=>{s=ye(s),Je(i,{name:s,fromWireType:function(v){return!!v},toWireType:function(v,M){return M?f:h},argPackAdvance:tt,readValueFromPointer:function(v){return this.fromWireType(B[v])},destructorFunction:null})},_t=i=>({count:i.count,deleteScheduled:i.deleteScheduled,preservePointerOnDelete:i.preservePointerOnDelete,ptr:i.ptr,ptrType:i.ptrType,smartPtr:i.smartPtr,smartPtrType:i.smartPtrType}),wt=i=>{function s(f){return f.$$.ptrType.registeredClass.name}Me(s(i)+" instance already deleted")},Nt=!1,Ht=i=>{},Pt=i=>{i.smartPtr?i.smartPtrType.rawDestructor(i.smartPtr):i.ptrType.registeredClass.rawDestructor(i.ptr)},ot=i=>{i.count.value-=1;var s=i.count.value===0;s&&Pt(i)},Ot=(i,s,f)=>{if(s===f)return i;if(f.baseClass===void 0)return null;var h=Ot(i,s,f.baseClass);return h===null?null:f.downcast(h)},St={},hn=()=>Object.keys($t).length,Nn=()=>{var i=[];for(var s in $t)$t.hasOwnProperty(s)&&i.push($t[s]);return i},Wt=[],rn=()=>{for(;Wt.length;){var i=Wt.pop();i.$$.deleteScheduled=!1,i.delete()}},Dt,cn=i=>{Dt=i,Wt.length&&Dt&&Dt(rn)},en=()=>{o.getInheritedInstanceCount=hn,o.getLiveInheritedInstances=Nn,o.flushPendingDeletes=rn,o.setDelayFunction=cn},$t={},an=(i,s)=>{for(s===void 0&&Me("ptr should not be undefined");i.baseClass;)s=i.upcast(s),i=i.baseClass;return s},ri=(i,s)=>(s=an(i,s),$t[s]),Cn=(i,s)=>{(!s.ptrType||!s.ptr)&&ni("makeClassHandle requires ptr and ptrType");var f=!!s.smartPtrType,h=!!s.smartPtr;return f!==h&&ni("Both smartPtrType and smartPtr must be specified"),s.count={value:1},wi(Object.create(i,{$$:{value:s,writable:!0}}))};function Zs(i){var s=this.getPointee(i);if(!s)return this.destructor(i),null;var f=ri(this.registeredClass,s);if(f!==void 0){if(f.$$.count.value===0)return f.$$.ptr=s,f.$$.smartPtr=i,f.clone();var h=f.clone();return this.destructor(i),h}function v(){return this.isSmartPointer?Cn(this.registeredClass.instancePrototype,{ptrType:this.pointeeType,ptr:s,smartPtrType:this,smartPtr:i}):Cn(this.registeredClass.instancePrototype,{ptrType:this,ptr:i})}var M=this.registeredClass.getActualType(s),O=St[M];if(!O)return v.call(this);var G;this.isConst?G=O.constPointerType:G=O.pointerType;var K=Ot(s,this.registeredClass,G.registeredClass);return K===null?v.call(this):this.isSmartPointer?Cn(G.registeredClass.instancePrototype,{ptrType:G,ptr:K,smartPtrType:this,smartPtr:i}):Cn(G.registeredClass.instancePrototype,{ptrType:G,ptr:K})}var wi=i=>typeof FinalizationRegistry>"u"?(wi=s=>s,i):(Nt=new FinalizationRegistry(s=>{ot(s.$$)}),wi=s=>{var f=s.$$,h=!!f.smartPtr;if(h){var v={$$:f};Nt.register(s,v,s)}return s},Ht=s=>Nt.unregister(s),wi(i)),Js=()=>{Object.assign(Qi.prototype,{isAliasOf(i){if(!(this instanceof Qi)||!(i instanceof Qi))return!1;var s=this.$$.ptrType.registeredClass,f=this.$$.ptr;i.$$=i.$$;for(var h=i.$$.ptrType.registeredClass,v=i.$$.ptr;s.baseClass;)f=s.upcast(f),s=s.baseClass;for(;h.baseClass;)v=h.upcast(v),h=h.baseClass;return s===h&&f===v},clone(){if(this.$$.ptr||wt(this),this.$$.preservePointerOnDelete)return this.$$.count.value+=1,this;var i=wi(Object.create(Object.getPrototypeOf(this),{$$:{value:_t(this.$$)}}));return i.$$.count.value+=1,i.$$.deleteScheduled=!1,i},delete(){this.$$.ptr||wt(this),this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete&&Me("Object already scheduled for deletion"),Ht(this),ot(this.$$),this.$$.preservePointerOnDelete||(this.$$.smartPtr=void 0,this.$$.ptr=void 0)},isDeleted(){return!this.$$.ptr},deleteLater(){return this.$$.ptr||wt(this),this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete&&Me("Object already scheduled for deletion"),Wt.push(this),Wt.length===1&&Dt&&Dt(rn),this.$$.deleteScheduled=!0,this}})};function Qi(){}var Ti=(i,s)=>Object.defineProperty(s,"name",{value:i}),Qs=(i,s,f)=>{if(i[s].overloadTable===void 0){var h=i[s];i[s]=function(...v){return i[s].overloadTable.hasOwnProperty(v.length)||Me(`Function '${f}' called with an invalid number of arguments (${v.length}) - expects one of (${i[s].overloadTable})!`),i[s].overloadTable[v.length].apply(this,v)},i[s].overloadTable=[],i[s].overloadTable[h.argCount]=h}},Ai=(i,s,f)=>{o.hasOwnProperty(i)?((f===void 0||o[i].overloadTable!==void 0&&o[i].overloadTable[f]!==void 0)&&Me(`Cannot register public name '${i}' twice`),Qs(o,i,i),o.hasOwnProperty(f)&&Me(`Cannot register multiple overloads of a function with the same number of arguments (${f})!`),o[i].overloadTable[f]=s):(o[i]=s,f!==void 0&&(o[i].numArguments=f))},el=48,Ha=57,Po=i=>{if(i===void 0)return"_unknown";i=i.replace(/[^a-zA-Z0-9_]/g,"$");var s=i.charCodeAt(0);return s>=el&&s<=Ha?`_${i}`:i};function ii(i,s,f,h,v,M,O,G){this.name=i,this.constructor=s,this.instancePrototype=f,this.rawDestructor=h,this.baseClass=v,this.getActualType=M,this.upcast=O,this.downcast=G,this.pureVirtualFunctions=[]}var ai=(i,s,f)=>{for(;s!==f;)s.upcast||Me(`Expected null or instance of ${f.name}, got an instance of ${s.name}`),i=s.upcast(i),s=s.baseClass;return i};function tl(i,s){if(s===null)return this.isReference&&Me(`null is not a valid ${this.name}`),0;s.$$||Me(`Cannot pass "${na(s)}" as a ${this.name}`),s.$$.ptr||Me(`Cannot pass deleted object as a pointer of type ${this.name}`);var f=s.$$.ptrType.registeredClass,h=ai(s.$$.ptr,f,this.registeredClass);return h}function Do(i,s){var f;if(s===null)return this.isReference&&Me(`null is not a valid ${this.name}`),this.isSmartPointer?(f=this.rawConstructor(),i!==null&&i.push(this.rawDestructor,f),f):0;(!s||!s.$$)&&Me(`Cannot pass "${na(s)}" as a ${this.name}`),s.$$.ptr||Me(`Cannot pass deleted object as a pointer of type ${this.name}`),!this.isConst&&s.$$.ptrType.isConst&&Me(`Cannot convert argument of type ${s.$$.smartPtrType?s.$$.smartPtrType.name:s.$$.ptrType.name} to parameter type ${this.name}`);var h=s.$$.ptrType.registeredClass;if(f=ai(s.$$.ptr,h,this.registeredClass),this.isSmartPointer)switch(s.$$.smartPtr===void 0&&Me("Passing raw pointer to smart pointer is illegal"),this.sharingPolicy){case 0:s.$$.smartPtrType===this?f=s.$$.smartPtr:Me(`Cannot convert argument of type ${s.$$.smartPtrType?s.$$.smartPtrType.name:s.$$.ptrType.name} to parameter type ${this.name}`);break;case 1:f=s.$$.smartPtr;break;case 2:if(s.$$.smartPtrType===this)f=s.$$.smartPtr;else{var v=s.clone();f=this.rawShare(f,En.toHandle(()=>v.delete())),i!==null&&i.push(this.rawDestructor,f)}break;default:Me("Unsupporting sharing policy")}return f}function nl(i,s){if(s===null)return this.isReference&&Me(`null is not a valid ${this.name}`),0;s.$$||Me(`Cannot pass "${na(s)}" as a ${this.name}`),s.$$.ptr||Me(`Cannot pass deleted object as a pointer of type ${this.name}`),s.$$.ptrType.isConst&&Me(`Cannot convert argument of type ${s.$$.ptrType.name} to parameter type ${this.name}`);var f=s.$$.ptrType.registeredClass,h=ai(s.$$.ptr,f,this.registeredClass);return h}var rl=()=>{Object.assign(ea.prototype,{getPointee(i){return this.rawGetPointee&&(i=this.rawGetPointee(i)),i},destructor(i){var s;(s=this.rawDestructor)==null||s.call(this,i)},argPackAdvance:tt,readValueFromPointer:Zt,fromWireType:Zs})};function ea(i,s,f,h,v,M,O,G,K,re,se){this.name=i,this.registeredClass=s,this.isReference=f,this.isConst=h,this.isSmartPointer=v,this.pointeeType=M,this.sharingPolicy=O,this.rawGetPointee=G,this.rawConstructor=K,this.rawShare=re,this.rawDestructor=se,!v&&s.baseClass===void 0?h?(this.toWireType=tl,this.destructorFunction=null):(this.toWireType=nl,this.destructorFunction=null):this.toWireType=Do}var Lo=(i,s,f)=>{o.hasOwnProperty(i)||ni("Replacing nonexistent public symbol"),o[i].overloadTable!==void 0&&f!==void 0?o[i].overloadTable[f]=s:(o[i]=s,o[i].argCount=f)},il=(i,s,f)=>{i=i.replace(/p/g,"i");var h=o["dynCall_"+i];return h(s,...f)},ta=[],Fo,Io=i=>{var s=ta[i];return s||(i>=ta.length&&(ta.length=i+1),ta[i]=s=Fo.get(i)),s},al=(i,s,f=[])=>{if(i.includes("j"))return il(i,s,f);var h=Io(s)(...f);return h},ol=(i,s)=>(...f)=>al(i,s,f),tr=(i,s)=>{i=ye(i);function f(){return i.includes("j")?ol(i,s):Io(s)}var h=f();return typeof h!="function"&&Me(`unknown function pointer with signature ${i}: ${s}`),h},sl=(i,s)=>{var f=Ti(s,function(h){this.name=s,this.message=h;var v=new Error(h).stack;v!==void 0&&(this.stack=this.toString()+`
`+v.replace(/^Error(:[^\n]*)?\n/,""))});return f.prototype=Object.create(i.prototype),f.prototype.constructor=f,f.prototype.toString=function(){return this.message===void 0?this.name:`${this.name}: ${this.message}`},f},Uo,No=i=>{var s=oa(i),f=ye(s);return xr(s),f},Oo=(i,s)=>{var f=[],h={};function v(M){if(!h[M]&&!nn[M]){if(bn[M]){bn[M].forEach(v);return}f.push(M),h[M]=!0}}throw s.forEach(v),new Uo(`${i}: `+f.map(No).join([", "]))},ll=(i,s,f,h,v,M,O,G,K,re,se,xe,Ae)=>{se=ye(se),M=tr(v,M),G&&(G=tr(O,G)),re&&(re=tr(K,re)),Ae=tr(xe,Ae);var De=Po(se);Ai(De,function(){Oo(`Cannot construct ${se} due to unbound types`,[h])}),U([i,s,f],h?[h]:[],Xe=>{var me;Xe=Xe[0];var Le,ht;h?(Le=Xe.registeredClass,ht=Le.instancePrototype):ht=Qi.prototype;var ce=Ti(se,function(...ql){if(Object.getPrototypeOf(this)!==ke)throw new Ne("Use 'new' to construct "+se);if(st.constructor_body===void 0)throw new Ne(se+" has no accessible constructor");var eu=st.constructor_body[ql.length];if(eu===void 0)throw new Ne(`Tried to invoke ctor of ${se} with invalid number of parameters (${ql.length}) - expected (${Object.keys(st.constructor_body).toString()}) parameters instead!`);return eu.apply(this,ql)}),ke=Object.create(ht,{constructor:{value:ce}});ce.prototype=ke;var st=new ii(se,ce,ke,Ae,Le,M,G,re);st.baseClass&&((me=st.baseClass).__derivedClasses!=null||(me.__derivedClasses=[]),st.baseClass.__derivedClasses.push(st));var Ut=new ea(se,st,!0,!1,!1),Rn=new ea(se+"*",st,!1,!1,!1),jt=new ea(se+" const*",st,!1,!0,!1);return St[i]={pointerType:Rn,constPointerType:jt},Lo(De,ce),[Ut,Rn,jt]})},Va=[],nr=[],Wa=i=>{i>9&&--nr[i+1]===0&&(nr[i]=void 0,Va.push(i))},cl=()=>nr.length/2-5-Va.length,fl=()=>{nr.push(0,1,void 0,1,null,1,!0,1,!1,1),o.count_emval_handles=cl},En={toValue:i=>(i||Me("Cannot use deleted val. handle = "+i),nr[i]),toHandle:i=>{switch(i){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:{const s=Va.pop()||nr.length;return nr[s]=i,nr[s+1]=1,s}}}},Xa={name:"emscripten::val",fromWireType:i=>{var s=En.toValue(i);return Wa(i),s},toWireType:(i,s)=>En.toHandle(s),argPackAdvance:tt,readValueFromPointer:Zt,destructorFunction:null},ul=i=>Je(i,Xa),Ci=(i,s,f)=>{switch(s){case 1:return f?function(h){return this.fromWireType(z[h])}:function(h){return this.fromWireType(B[h])};case 2:return f?function(h){return this.fromWireType(Y[h>>1])}:function(h){return this.fromWireType(Z[h>>1])};case 4:return f?function(h){return this.fromWireType(j[h>>2])}:function(h){return this.fromWireType(J[h>>2])};default:throw new TypeError(`invalid integer width (${s}): ${i}`)}},dl=(i,s,f,h)=>{s=ye(s);function v(){}v.values={},Je(i,{name:s,constructor:v,fromWireType:function(M){return this.constructor.values[M]},toWireType:(M,O)=>O.value,argPackAdvance:tt,readValueFromPointer:Ci(s,f,h),destructorFunction:null}),Ai(s,v)},Tt=(i,s)=>{var f=nn[i];return f===void 0&&Me(`${s} has unknown type ${No(i)}`),f},hl=(i,s,f)=>{var h=Tt(i,"enum");s=ye(s);var v=h.constructor,M=Object.create(h.constructor.prototype,{value:{value:f},constructor:{value:Ti(`${h.name}_${s}`,function(){})}});v.values[f]=M,v[s]=M},na=i=>{if(i===null)return"null";var s=typeof i;return s==="object"||s==="array"||s==="function"?i.toString():""+i},rr=(i,s)=>{switch(s){case 4:return function(f){return this.fromWireType(ue[f>>2])};case 8:return function(f){return this.fromWireType(te[f>>3])};default:throw new TypeError(`invalid float width (${s}): ${i}`)}},$a=(i,s,f)=>{s=ye(s),Je(i,{name:s,fromWireType:h=>h,toWireType:(h,v)=>v,argPackAdvance:tt,readValueFromPointer:rr(s,f),destructorFunction:null})};function ra(i){for(var s=1;s<i.length;++s)if(i[s]!==null&&i[s].destructorFunction===void 0)return!0;return!1}function pl(i,s,f,h,v,M){var O=s.length;O<2&&Me("argTypes array size mismatch! Must at least get return value and 'this' types!"),s[1];var G=ra(s),K=s[0].name!=="void",re=O-2,se=new Array(re),xe=[],Ae=[],De=function(...Xe){Xe.length!==re&&Me(`function ${i} called with ${Xe.length} arguments, expected ${re}`),Ae.length=0;var me;xe.length=1,xe[0]=v;for(var Le=0;Le<re;++Le)se[Le]=s[Le+2].toWireType(Ae,Xe[Le]),xe.push(se[Le]);var ht=h(...xe);function ce(ke){if(G)Lr(Ae);else for(var st=2;st<s.length;st++){var Ut=st===1?me:se[st-2];s[st].destructorFunction!==null&&s[st].destructorFunction(Ut)}if(K)return s[0].fromWireType(ke)}return ce(ht)};return Ti(i,De)}var gr=(i,s)=>{for(var f=[],h=0;h<i;h++)f.push(J[s+h*4>>2]);return f},ko=i=>{i=i.trim();const s=i.indexOf("(");return s!==-1?i.substr(0,s):i},dt=(i,s,f,h,v,M,O)=>{var G=gr(s,f);i=ye(i),i=ko(i),v=tr(h,v),Ai(i,function(){Oo(`Cannot call ${i} due to unbound types`,G)},s-1),U([],G,K=>{var re=[K[0],null].concat(K.slice(1));return Lo(i,pl(i,re,null,v,M),s-1),[]})},ml=(i,s,f)=>{switch(s){case 1:return f?h=>z[h]:h=>B[h];case 2:return f?h=>Y[h>>1]:h=>Z[h>>1];case 4:return f?h=>j[h>>2]:h=>J[h>>2];default:throw new TypeError(`invalid integer width (${s}): ${i}`)}},_l=(i,s,f,h,v)=>{s=ye(s);var M=se=>se;if(h===0){var O=32-8*f;M=se=>se<<O>>>O}var G=s.includes("unsigned"),K=(se,xe)=>{},re;G?re=function(se,xe){return K(xe,this.name),xe>>>0}:re=function(se,xe){return K(xe,this.name),xe},Je(i,{name:s,fromWireType:M,toWireType:re,argPackAdvance:tt,readValueFromPointer:ml(s,f,h!==0),destructorFunction:null})},gl=(i,s,f)=>{var h=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],v=h[s];function M(O){var G=J[O>>2],K=J[O+4>>2];return new v(z.buffer,K,G)}f=ye(f),Je(i,{name:f,fromWireType:M,argPackAdvance:tt,readValueFromPointer:M},{ignoreDuplicateRegistrations:!0})},vl=(i,s,f)=>Pe(i,B,s,f),xl=(i,s)=>{s=ye(s);var f=s==="std::string";Je(i,{name:s,fromWireType(h){var v=J[h>>2],M=h+4,O;if(f)for(var G=M,K=0;K<=v;++K){var re=M+K;if(K==v||B[re]==0){var se=re-G,xe=ie(G,se);O===void 0?O=xe:(O+="\0",O+=xe),G=re+1}}else{for(var Ae=new Array(v),K=0;K<v;++K)Ae[K]=String.fromCharCode(B[M+K]);O=Ae.join("")}return xr(h),O},toWireType(h,v){v instanceof ArrayBuffer&&(v=new Uint8Array(v));var M,O=typeof v=="string";O||v instanceof Uint8Array||v instanceof Uint8ClampedArray||v instanceof Int8Array||Me("Cannot pass non-string to std::string"),f&&O?M=Ie(v):M=v.length;var G=Ko(4+M+1),K=G+4;if(J[G>>2]=M,f&&O)vl(v,K,M+1);else if(O)for(var re=0;re<M;++re){var se=v.charCodeAt(re);se>255&&(xr(K),Me("String has UTF-16 code units that do not fit in 8 bits")),B[K+re]=se}else for(var re=0;re<M;++re)B[K+re]=v[re];return h!==null&&h.push(xr,G),G},argPackAdvance:tt,readValueFromPointer:Zt,destructorFunction(h){xr(h)}})},Bo=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0,qa=(i,s)=>{for(var f=i,h=f>>1,v=h+s/2;!(h>=v)&&Z[h];)++h;if(f=h<<1,f-i>32&&Bo)return Bo.decode(B.subarray(i,f));for(var M="",O=0;!(O>=s/2);++O){var G=Y[i+O*2>>1];if(G==0)break;M+=String.fromCharCode(G)}return M},yl=(i,s,f)=>{if(f!=null||(f=2147483647),f<2)return 0;f-=2;for(var h=s,v=f<i.length*2?f/2:i.length,M=0;M<v;++M){var O=i.charCodeAt(M);Y[s>>1]=O,s+=2}return Y[s>>1]=0,s-h},Ya=i=>i.length*2,Sl=(i,s)=>{for(var f=0,h="";!(f>=s/4);){var v=j[i+f*4>>2];if(v==0)break;if(++f,v>=65536){var M=v-65536;h+=String.fromCharCode(55296|M>>10,56320|M&1023)}else h+=String.fromCharCode(v)}return h},bl=(i,s,f)=>{if(f!=null||(f=2147483647),f<4)return 0;for(var h=s,v=h+f-4,M=0;M<i.length;++M){var O=i.charCodeAt(M);if(O>=55296&&O<=57343){var G=i.charCodeAt(++M);O=65536+((O&1023)<<10)|G&1023}if(j[s>>2]=O,s+=4,s+4>v)break}return j[s>>2]=0,s-h},C=i=>{for(var s=0,f=0;f<i.length;++f){var h=i.charCodeAt(f);h>=55296&&h<=57343&&++f,s+=4}return s},ir=(i,s,f)=>{f=ye(f);var h,v,M,O;s===2?(h=qa,v=yl,O=Ya,M=G=>Z[G>>1]):s===4&&(h=Sl,v=bl,O=C,M=G=>J[G>>2]),Je(i,{name:f,fromWireType:G=>{for(var K=J[G>>2],re,se=G+4,xe=0;xe<=K;++xe){var Ae=G+4+xe*s;if(xe==K||M(Ae)==0){var De=Ae-se,Xe=h(se,De);re===void 0?re=Xe:(re+="\0",re+=Xe),se=Ae+s}}return xr(G),re},toWireType:(G,K)=>{typeof K!="string"&&Me(`Cannot pass non-string to C++ string type ${f}`);var re=O(K),se=Ko(4+re+s);return J[se>>2]=re/s,v(K,se+4,re+s),G!==null&&G.push(xr,se),se},argPackAdvance:tt,readValueFromPointer:Zt,destructorFunction(G){xr(G)}})},El=(i,s,f,h,v,M)=>{Yt[i]={name:ye(s),rawConstructor:tr(f,h),rawDestructor:tr(v,M),fields:[]}},Ml=(i,s,f,h,v,M,O,G,K,re)=>{Yt[i].fields.push({fieldName:ye(s),getterReturnType:f,getter:tr(h,v),getterContext:M,setterArgumentType:O,setter:tr(G,K),setterContext:re})},wl=(i,s)=>{s=ye(s),Je(i,{isVoid:!0,name:s,argPackAdvance:0,fromWireType:()=>{},toWireType:(f,h)=>{}})},Tl=(i,s,f)=>B.copyWithin(i,s,s+f),zo={},Go=i=>{var s=zo[i];return s===void 0?ye(i):s},ja=[],Al=(i,s,f,h,v)=>(i=ja[i],s=En.toValue(s),f=Go(f),i(s,s[f],h,v)),Cl=i=>{var s=ja.length;return ja.push(i),s},Rl=(i,s)=>{for(var f=new Array(i),h=0;h<i;++h)f[h]=Tt(J[s+h*4>>2],"parameter "+h);return f},Pl=Reflect.construct,Dl=(i,s,f)=>{var h=[],v=i.toWireType(h,f);return h.length&&(J[s>>2]=En.toHandle(h)),v},Ll=(i,s,f)=>{var h=Rl(i,s),v=h.shift();i--;var M=new Array(i),O=(K,re,se,xe)=>{for(var Ae=0,De=0;De<i;++De)M[De]=h[De].readValueFromPointer(xe+Ae),Ae+=h[De].argPackAdvance;var Xe=f===1?Pl(re,M):re.apply(K,M);return Dl(v,se,Xe)},G=`methodCaller<(${h.map(K=>K.name).join(", ")}) => ${v.name}>`;return Cl(Ti(G,O))},ia=i=>{i>9&&(nr[i+1]+=1)},Fl=()=>En.toHandle([]),Ho=i=>En.toHandle(Go(i)),Vo=()=>En.toHandle({}),Il=i=>{var s=En.toValue(i);Lr(s),Wa(i)},Ul=(i,s,f)=>{i=En.toValue(i),s=En.toValue(s),f=En.toValue(f),i[s]=f},Nl=(i,s)=>{i=Tt(i,"_emval_take_value");var f=i.readValueFromPointer(s);return En.toHandle(f)},Ol=()=>2147483648,kl=i=>{var s=D.buffer,f=(i-s.byteLength+65535)/65536;try{return D.grow(f),Se(),1}catch{}},Wo=i=>{var s=B.length;i>>>=0;var f=Ol();if(i>f)return!1;for(var h=(K,re)=>K+(re-K%re)%re,v=1;v<=4;v*=2){var M=s*(1+.2/v);M=Math.min(M,i+100663296);var O=Math.min(f,h(Math.max(i,M),65536)),G=kl(O);if(G)return!0}return!1},oi={},aa=()=>T||"./this.program",Ri=()=>{if(!Ri.strings){var i=(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",s={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:i,_:aa()};for(var f in oi)oi[f]===void 0?delete s[f]:s[f]=oi[f];var h=[];for(var f in s)h.push(`${f}=${s[f]}`);Ri.strings=h}return Ri.strings},Xo=(i,s)=>{for(var f=0;f<i.length;++f)z[s++]=i.charCodeAt(f);z[s]=0},ar=(i,s)=>{var f=0;return Ri().forEach((h,v)=>{var M=s+f;J[i+v*4>>2]=M,Xo(h,M),f+=h.length+1}),0},$o=(i,s)=>{var f=Ri();J[i>>2]=f.length;var h=0;return f.forEach(v=>h+=v.length+1),J[s>>2]=h,0};function Bl(i){try{var s=Xt.getStreamFromFD(i);return A.close(s),0}catch(f){if(typeof A>"u"||f.name!=="ErrnoError")throw f;return f.errno}}var vr=(i,s,f,h)=>{for(var v=0,M=0;M<f;M++){var O=J[s>>2],G=J[s+4>>2];s+=8;var K=A.read(i,z,O,G,h);if(K<0)return-1;if(v+=K,K<G)break}return v};function zl(i,s,f,h){try{var v=Xt.getStreamFromFD(i),M=vr(v,s,f);return J[h>>2]=M,0}catch(O){if(typeof A>"u"||O.name!=="ErrnoError")throw O;return O.errno}}var qo=(i,s)=>s+2097152>>>0<4194305-!!i?(i>>>0)+s*4294967296:NaN;function si(i,s,f,h,v){var M=qo(s,f);try{if(isNaN(M))return 61;var O=Xt.getStreamFromFD(i);return A.llseek(O,M,h),P=[O.position>>>0,(N=O.position,+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[v>>2]=P[0],j[v+4>>2]=P[1],O.getdents&&M===0&&h===0&&(O.getdents=null),0}catch(G){if(typeof A>"u"||G.name!=="ErrnoError")throw G;return G.errno}}var Yo=(i,s,f,h)=>{for(var v=0,M=0;M<f;M++){var O=J[s>>2],G=J[s+4>>2];s+=8;var K=A.write(i,z,O,G,h);if(K<0)return-1;v+=K}return v};function Ka(i,s,f,h){try{var v=Xt.getStreamFromFD(i),M=Yo(v,s,f);return J[h>>2]=M,0}catch(O){if(typeof A>"u"||O.name!=="ErrnoError")throw O;return O.errno}}var or=i=>i%4===0&&(i%100!==0||i%400===0),li=(i,s)=>{for(var f=0,h=0;h<=s;f+=i[h++]);return f},Za=[31,29,31,30,31,30,31,31,30,31,30,31],jo=[31,28,31,30,31,30,31,31,30,31,30,31],Gl=(i,s)=>{for(var f=new Date(i.getTime());s>0;){var h=or(f.getFullYear()),v=f.getMonth(),M=(h?Za:jo)[v];if(s>M-f.getDate())s-=M-f.getDate()+1,f.setDate(1),v<11?f.setMonth(v+1):(f.setMonth(0),f.setFullYear(f.getFullYear()+1));else return f.setDate(f.getDate()+s),f}return f},Hl=(i,s)=>{z.set(i,s)},Vl=(i,s,f,h)=>{var v=J[h+40>>2],M={tm_sec:j[h>>2],tm_min:j[h+4>>2],tm_hour:j[h+8>>2],tm_mday:j[h+12>>2],tm_mon:j[h+16>>2],tm_year:j[h+20>>2],tm_wday:j[h+24>>2],tm_yday:j[h+28>>2],tm_isdst:j[h+32>>2],tm_gmtoff:j[h+36>>2],tm_zone:v?ie(v):""},O=ie(f),G={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var K in G)O=O.replace(new RegExp(K,"g"),G[K]);var re=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],se=["January","February","March","April","May","June","July","August","September","October","November","December"];function xe(ce,ke,st){for(var Ut=typeof ce=="number"?ce.toString():ce||"";Ut.length<ke;)Ut=st[0]+Ut;return Ut}function Ae(ce,ke){return xe(ce,ke,"0")}function De(ce,ke){function st(Rn){return Rn<0?-1:Rn>0?1:0}var Ut;return(Ut=st(ce.getFullYear()-ke.getFullYear()))===0&&(Ut=st(ce.getMonth()-ke.getMonth()))===0&&(Ut=st(ce.getDate()-ke.getDate())),Ut}function Xe(ce){switch(ce.getDay()){case 0:return new Date(ce.getFullYear()-1,11,29);case 1:return ce;case 2:return new Date(ce.getFullYear(),0,3);case 3:return new Date(ce.getFullYear(),0,2);case 4:return new Date(ce.getFullYear(),0,1);case 5:return new Date(ce.getFullYear()-1,11,31);case 6:return new Date(ce.getFullYear()-1,11,30)}}function me(ce){var ke=Gl(new Date(ce.tm_year+1900,0,1),ce.tm_yday),st=new Date(ke.getFullYear(),0,4),Ut=new Date(ke.getFullYear()+1,0,4),Rn=Xe(st),jt=Xe(Ut);return De(Rn,ke)<=0?De(jt,ke)<=0?ke.getFullYear()+1:ke.getFullYear():ke.getFullYear()-1}var Le={"%a":ce=>re[ce.tm_wday].substring(0,3),"%A":ce=>re[ce.tm_wday],"%b":ce=>se[ce.tm_mon].substring(0,3),"%B":ce=>se[ce.tm_mon],"%C":ce=>{var ke=ce.tm_year+1900;return Ae(ke/100|0,2)},"%d":ce=>Ae(ce.tm_mday,2),"%e":ce=>xe(ce.tm_mday,2," "),"%g":ce=>me(ce).toString().substring(2),"%G":me,"%H":ce=>Ae(ce.tm_hour,2),"%I":ce=>{var ke=ce.tm_hour;return ke==0?ke=12:ke>12&&(ke-=12),Ae(ke,2)},"%j":ce=>Ae(ce.tm_mday+li(or(ce.tm_year+1900)?Za:jo,ce.tm_mon-1),3),"%m":ce=>Ae(ce.tm_mon+1,2),"%M":ce=>Ae(ce.tm_min,2),"%n":()=>`
`,"%p":ce=>ce.tm_hour>=0&&ce.tm_hour<12?"AM":"PM","%S":ce=>Ae(ce.tm_sec,2),"%t":()=>"	","%u":ce=>ce.tm_wday||7,"%U":ce=>{var ke=ce.tm_yday+7-ce.tm_wday;return Ae(Math.floor(ke/7),2)},"%V":ce=>{var ke=Math.floor((ce.tm_yday+7-(ce.tm_wday+6)%7)/7);if((ce.tm_wday+371-ce.tm_yday-2)%7<=2&&ke++,ke){if(ke==53){var st=(ce.tm_wday+371-ce.tm_yday)%7;st!=4&&(st!=3||!or(ce.tm_year))&&(ke=1)}}else{ke=52;var Ut=(ce.tm_wday+7-ce.tm_yday-1)%7;(Ut==4||Ut==5&&or(ce.tm_year%400-1))&&ke++}return Ae(ke,2)},"%w":ce=>ce.tm_wday,"%W":ce=>{var ke=ce.tm_yday+7-(ce.tm_wday+6)%7;return Ae(Math.floor(ke/7),2)},"%y":ce=>(ce.tm_year+1900).toString().substring(2),"%Y":ce=>ce.tm_year+1900,"%z":ce=>{var ke=ce.tm_gmtoff,st=ke>=0;return ke=Math.abs(ke)/60,ke=ke/60*100+ke%60,(st?"+":"-")+("0000"+ke).slice(-4)},"%Z":ce=>ce.tm_zone,"%%":()=>"%"};O=O.replace(/%%/g,"\0\0");for(var K in Le)O.includes(K)&&(O=O.replace(new RegExp(K,"g"),Le[K](M)));O=O.replace(/\0\0/g,"%");var ht=Ce(O,!1);return ht.length>s?0:(Hl(ht,i),ht.length-1)},Wl=(i,s,f,h,v)=>Vl(i,s,f,h);A.createPreloadedFile=mr,A.staticInit(),Ji=o.InternalError=class extends Error{constructor(i){super(i),this.name="InternalError"}},oe(),Ne=o.BindingError=class extends Error{constructor(i){super(i),this.name="BindingError"}},Js(),en(),rl(),Uo=o.UnboundTypeError=sl(Error,"UnboundTypeError"),fl();var Xl={b:Ze,p:Ke,r:Mi,B:Ki,F:ti,E:Zi,C:Dr,w:Q,z:ae,K:at,m:ll,J:ul,j:dl,a:hl,v:$a,f:dt,i:_l,e:gl,u:xl,o:ir,x:El,l:Ml,L:wl,I:Tl,N:Al,c:Wa,O:Ll,P:ia,q:Fl,h:Ho,k:Vo,M:Il,g:Ul,d:Nl,D:Wo,G:ar,H:$o,s:Bl,t:zl,y:si,n:Ka,A:Wl},k=it();k.R,o._memcpy=k.S,o._heif_color_conversion_options_set_defaults=k.U;var Ko=o._malloc=k.V;o._heif_nclx_color_profile_set_color_primaries=k.W;var xr=o._free=k.X;o._heif_nclx_color_profile_set_transfer_characteristics=k.Y,o._heif_nclx_color_profile_set_matrix_coefficients=k.Z,o._heif_init=k._,o._heif_deinit=k.$,o._heif_load_plugin=k.aa,o._heif_unload_plugin=k.ba,o._heif_load_plugins=k.ca,o._heif_get_plugin_directories=k.da,o._heif_free_plugin_directories=k.ea,o._heif_get_version=k.fa,o._heif_get_version_number=k.ga,o._heif_get_version_number_major=k.ha,o._heif_get_version_number_minor=k.ia,o._heif_get_version_number_maintenance=k.ja,o._heif_check_filetype=k.ka,o._heif_read_main_brand=k.la,o._heif_has_compatible_filetype=k.ma,o._heif_list_compatible_brands=k.na,o._heif_free_list_of_compatible_brands=k.oa,o._heif_check_jpeg_filetype=k.pa,o._heif_main_brand=k.qa,o._heif_fourcc_to_brand=k.ra,o._heif_read_minor_version_brand=k.sa,o._heif_brand_to_fourcc=k.ta,o._heif_has_compatible_brand=k.ua,o._heif_get_global_security_limits=k.va,o._heif_get_file_mime_type=k.wa,o._heif_get_disabled_security_limits=k.xa,o._heif_context_get_security_limits=k.ya,o._heif_context_set_security_limits=k.za,o._heif_context_alloc=k.Aa,o._heif_context_free=k.Ba,o._heif_context_read_from_file=k.Ca,o._heif_context_read_from_memory=k.Da,o._heif_context_read_from_memory_without_copy=k.Ea,o._heif_context_read_from_reader=k.Fa,o._heif_context_debug_dump_boxes_to_file=k.Ga,o._heif_context_get_primary_image_handle=k.Ha,o._heif_context_get_primary_image_ID=k.Ia,o._heif_context_is_top_level_image_ID=k.Ja,o._heif_context_get_number_of_top_level_images=k.Ka,o._heif_context_get_list_of_top_level_image_IDs=k.La,o._heif_context_get_image_handle=k.Ma,o._heif_image_handle_is_primary_image=k.Na,o._heif_image_handle_get_item_id=k.Oa,o._heif_image_handle_get_number_of_thumbnails=k.Pa,o._heif_image_handle_get_list_of_thumbnail_IDs=k.Qa,o._heif_image_handle_get_thumbnail=k.Ra,o._heif_image_handle_get_number_of_auxiliary_images=k.Sa,o._heif_image_handle_get_list_of_auxiliary_image_IDs=k.Ta,o._heif_image_handle_get_auxiliary_type=k.Ua,o._heif_image_handle_release_auxiliary_type=k.Va,o._heif_image_handle_free_auxiliary_types=k.Wa,o._heif_image_handle_get_auxiliary_image_handle=k.Xa,o._heif_image_handle_get_width=k.Ya,o._heif_image_handle_get_height=k.Za,o._heif_image_handle_get_ispe_width=k._a,o._heif_image_handle_get_ispe_height=k.$a,o._heif_image_handle_get_context=k.ab,o._heif_image_handle_get_image_tiling=k.bb,o._heif_image_handle_get_grid_image_tile_id=k.cb,o._heif_context_get_entity_groups=k.db,o._heif_entity_groups_release=k.eb,o._heif_image_handle_get_preferred_decoding_colorspace=k.fb,o._heif_image_handle_has_alpha_channel=k.gb,o._heif_image_handle_is_premultiplied_alpha=k.hb,o._heif_image_handle_get_luma_bits_per_pixel=k.ib,o._heif_image_handle_get_chroma_bits_per_pixel=k.jb,o._heif_image_handle_has_depth_image=k.kb,o._heif_depth_representation_info_free=k.lb,o._heif_image_handle_get_depth_image_representation_info=k.mb,o._heif_image_handle_get_number_of_depth_images=k.nb,o._heif_image_handle_get_list_of_depth_image_IDs=k.ob,o._heif_image_handle_get_depth_image_handle=k.pb,o._heif_decoding_options_alloc=k.qb,o._heif_decoding_options_free=k.rb,o._heif_decode_image=k.sb,o._heif_image_handle_decode_image_tile=k.tb,o._heif_image_create=k.ub,o._heif_image_get_decoding_warnings=k.vb,o._heif_image_add_decoding_warning=k.wb,o._heif_image_has_content_light_level=k.xb,o._heif_image_get_content_light_level=k.yb,o._heif_image_handle_get_content_light_level=k.zb,o._heif_image_set_content_light_level=k.Ab,o._heif_image_has_mastering_display_colour_volume=k.Bb,o._heif_image_get_mastering_display_colour_volume=k.Cb,o._heif_image_handle_get_mastering_display_colour_volume=k.Db,o._heif_image_set_mastering_display_colour_volume=k.Eb,o._heif_mastering_display_colour_volume_decode=k.Fb,o._heif_image_get_pixel_aspect_ratio=k.Gb,o._heif_image_handle_get_pixel_aspect_ratio=k.Hb,o._heif_image_set_pixel_aspect_ratio=k.Ib,o._heif_image_release=k.Jb,o._heif_image_handle_release=k.Kb,o._heif_image_get_colorspace=k.Lb,o._heif_image_get_chroma_format=k.Mb,o._heif_image_get_width=k.Nb,o._heif_image_get_height=k.Ob,o._heif_image_get_primary_width=k.Pb,o._heif_image_get_primary_height=k.Qb,o._heif_image_crop=k.Rb,o._heif_image_get_bits_per_pixel=k.Sb,o._heif_image_get_bits_per_pixel_range=k.Tb,o._heif_image_has_channel=k.Ub,o._heif_image_add_plane=k.Vb,o._heif_image_get_plane_readonly=k.Wb,o._heif_image_get_plane=k.Xb,o._heif_image_set_premultiplied_alpha=k.Yb,o._heif_image_is_premultiplied_alpha=k.Zb,o._heif_image_extend_padding_to_size=k._b,o._heif_image_scale_image=k.$b,o._heif_image_extend_to_size_fill_with_zero=k.ac,o._heif_image_set_raw_color_profile=k.bc,o._heif_image_set_nclx_color_profile=k.cc,o._heif_image_handle_get_number_of_metadata_blocks=k.dc,o._heif_image_handle_get_list_of_metadata_block_IDs=k.ec,o._heif_image_handle_get_metadata_type=k.fc,o._heif_image_handle_get_metadata_content_type=k.gc,o._heif_image_handle_get_metadata_item_uri_type=k.hc,o._heif_image_handle_get_metadata_size=k.ic,o._heif_image_handle_get_metadata=k.jc,o._heif_image_handle_get_color_profile_type=k.kc,o._heif_image_handle_get_raw_color_profile_size=k.lc,o._heif_image_handle_get_nclx_color_profile=k.mc,o._heif_image_handle_get_raw_color_profile=k.nc,o._heif_image_get_color_profile_type=k.oc,o._heif_image_get_raw_color_profile_size=k.pc,o._heif_image_get_raw_color_profile=k.qc,o._heif_image_get_nclx_color_profile=k.rc,o._heif_nclx_color_profile_alloc=k.sc,o._heif_nclx_color_profile_free=k.tc,o._heif_image_handle_has_camera_intrinsic_matrix=k.uc,o._heif_image_handle_get_camera_intrinsic_matrix=k.vc,o._heif_image_handle_has_camera_extrinsic_matrix=k.wc,o._heif_image_handle_get_camera_extrinsic_matrix=k.xc,o._heif_camera_extrinsic_matrix_release=k.yc,o._heif_camera_extrinsic_matrix_get_rotation_matrix=k.zc,o._heif_register_decoder=k.Ac,o._heif_register_decoder_plugin=k.Bc,o._heif_register_encoder_plugin=k.Cc,o._heif_context_write_to_file=k.Dc,o._heif_context_write=k.Ec,o._heif_context_add_compatible_brand=k.Fc,o._heif_context_get_encoder_descriptors=k.Gc,o._heif_get_encoder_descriptors=k.Hc,o._heif_encoder_descriptor_get_name=k.Ic,o._heif_encoder_descriptor_get_id_name=k.Jc,o._heif_get_decoder_descriptors=k.Kc,o._heif_decoder_descriptor_get_name=k.Lc,o._heif_decoder_descriptor_get_id_name=k.Mc,o._heif_encoder_descriptor_get_compression_format=k.Nc,o._heif_encoder_descriptor_supports_lossy_compression=k.Oc,o._heif_encoder_descriptor_supports_lossless_compression=k.Pc,o._heif_encoder_descriptor_supportes_lossy_compression=k.Qc,o._heif_encoder_descriptor_supportes_lossless_compression=k.Rc,o._heif_encoder_get_name=k.Sc,o._heif_context_get_encoder=k.Tc,o._heif_have_decoder_for_format=k.Uc,o._heif_have_encoder_for_format=k.Vc,o._heif_context_get_encoder_for_format=k.Wc,o._heif_encoder_release=k.Xc,o._heif_encoder_set_lossy_quality=k.Yc,o._heif_encoder_set_lossless=k.Zc,o._heif_encoder_set_logging_level=k._c,o._heif_encoder_list_parameters=k.$c,o._heif_encoder_parameter_get_name=k.ad,o._heif_encoder_parameter_get_type=k.bd,o._heif_encoder_set_parameter_integer=k.cd,o._heif_encoder_parameter_get_valid_integer_values=k.dd,o._heif_encoder_get_parameter_integer=k.ed,o._heif_encoder_parameter_get_valid_integer_range=k.fd,o._heif_encoder_parameter_get_valid_string_values=k.gd,o._heif_encoder_parameter_integer_valid_range=k.hd,o._heif_encoder_set_parameter_boolean=k.id,o._heif_encoder_get_parameter_boolean=k.jd,o._heif_encoder_set_parameter_string=k.kd,o._heif_encoder_get_parameter_string=k.ld,o._heif_encoder_parameter_string_valid_values=k.md,o._heif_encoder_parameter_integer_valid_values=k.nd,o._heif_encoder_set_parameter=k.od,o._heif_encoder_get_parameter=k.pd,o._heif_encoder_has_default=k.qd,o._heif_encoding_options_alloc=k.rd,o._heif_encoding_options_free=k.sd,o._heif_context_encode_image=k.td,o._heif_context_encode_grid=k.ud,o._heif_context_add_grid_image=k.vd,o._heif_context_add_overlay_image=k.wd,o._heif_context_add_image_tile=k.xd,o._heif_context_assign_thumbnail=k.yd,o._heif_context_encode_thumbnail=k.zd,o._heif_context_set_primary_image=k.Ad,o._heif_context_add_exif_metadata=k.Bd,o._heif_context_add_XMP_metadata=k.Cd,o._heif_context_add_XMP_metadata2=k.Dd,o._heif_context_add_generic_metadata=k.Ed,o._heif_context_add_generic_uri_metadata=k.Fd,o._heif_context_set_maximum_image_size_limit=k.Gd,o._heif_context_set_max_decoding_threads=k.Hd,o._heif_image_handle_get_number_of_region_items=k.Id,o._heif_image_handle_get_list_of_region_item_ids=k.Jd,o._heif_context_get_region_item=k.Kd,o._heif_region_item_get_id=k.Ld,o._heif_region_item_release=k.Md,o._heif_region_item_get_reference_size=k.Nd,o._heif_region_item_get_number_of_regions=k.Od,o._heif_region_item_get_list_of_regions=k.Pd,o._heif_image_handle_add_region_item=k.Qd,o._heif_region_item_add_region_point=k.Rd,o._heif_region_item_add_region_rectangle=k.Sd,o._heif_region_item_add_region_ellipse=k.Td,o._heif_region_item_add_region_polygon=k.Ud,o._heif_region_item_add_region_polyline=k.Vd,o._heif_region_item_add_region_referenced_mask=k.Wd,o._heif_region_item_add_region_inline_mask_data=k.Xd,o._heif_region_item_add_region_inline_mask=k.Yd,o._heif_region_release=k.Zd,o._heif_region_release_many=k._d,o._heif_region_get_type=k.$d,o._heif_region_get_point=k.ae,o._heif_region_get_point_transformed=k.be,o._heif_region_get_rectangle=k.ce,o._heif_region_get_rectangle_transformed=k.de,o._heif_region_get_ellipse=k.ee,o._heif_region_get_ellipse_transformed=k.fe,o._heif_region_get_polygon_num_points=k.ge,o._heif_region_get_polyline_num_points=k.he,o._heif_region_get_polygon_points=k.ie,o._heif_region_get_polyline_points=k.je,o._heif_region_get_polygon_points_transformed=k.ke,o._heif_region_get_polyline_points_transformed=k.le,o._heif_region_get_referenced_mask_ID=k.me,o._heif_region_get_inline_mask_data_len=k.ne,o._heif_region_get_inline_mask_data=k.oe,o._heif_region_get_mask_image=k.pe,o._heif_item_get_properties_of_type=k.qe,o._heif_item_get_transformation_properties=k.re,o._heif_item_get_property_type=k.se,o._heif_item_get_property_user_description=k.te,o._heif_item_add_property_user_description=k.ue,o._heif_item_get_property_transform_mirror=k.ve,o._heif_item_get_property_transform_rotation_ccw=k.we,o._heif_item_get_property_transform_crop_borders=k.xe,o._heif_property_user_description_release=k.ye,o._heif_item_add_raw_property=k.ze,o._heif_item_get_property_raw_size=k.Ae,o._heif_item_get_property_raw_data=k.Be,o._heif_item_get_property_uuid_type=k.Ce,o._heif_context_get_number_of_items=k.De,o._heif_context_get_list_of_item_IDs=k.Ee,o._heif_item_get_item_type=k.Fe,o._heif_item_is_item_hidden=k.Ge,o._heif_item_get_mime_item_content_type=k.He,o._heif_item_get_mime_item_content_encoding=k.Ie,o._heif_item_get_uri_item_uri_type=k.Je,o._heif_item_get_item_name=k.Ke,o._heif_item_get_item_data=k.Le,o._heif_release_item_data=k.Me,o._heif_context_get_item_references=k.Ne,o._heif_release_item_references=k.Oe,o._heif_context_add_item=k.Pe,o._heif_context_add_mime_item=k.Qe,o._heif_context_add_precompressed_mime_item=k.Re,o._heif_context_add_uri_item=k.Se,o._heif_context_add_item_reference=k.Te,o._heif_context_add_item_references=k.Ue,o._heif_item_set_item_name=k.Ve,o._de265_get_version=k.We,o._de265_init=k.Xe,o._de265_free=k.Ye,o._de265_new_decoder=k.Ze,o._de265_set_parameter_bool=k._e,o._de265_free_decoder=k.$e,o._de265_push_NAL=k.af,o._de265_flush_data=k.bf,o._de265_decode=k.cf,o._de265_get_next_picture=k.df,o._de265_get_chroma_format=k.ef,o._de265_get_image_width=k.ff,o._de265_get_image_height=k.gf,o._de265_get_bits_per_pixel=k.hf,o._de265_get_image_plane=k.jf,o._de265_get_image_colour_primaries=k.kf,o._de265_get_image_transfer_characteristics=k.lf,o._de265_get_image_matrix_coefficients=k.mf,o._de265_get_image_full_range_flag=k.nf,o._de265_release_next_picture=k.of;var oa=k.pf,$l=k.qf;o.dynCall_ji=k.rf,o.dynCall_iij=k.sf,o.dynCall_jijj=k.tf,o.dynCall_vijj=k.uf,o.dynCall_jiji=k.vf,o.dynCall_viijii=k.wf,o.dynCall_iiiiij=k.xf,o.dynCall_iiiiijj=k.yf,o.dynCall_iiiiiijj=k.zf,o._heif_error_ok=80028,o._heif_error_success=79460,o._heif_error_invalid_parameter_value=80052,o._heif_error_unsupported_parameter=80040;var sa;$e=function i(){sa||Ja(),sa||($e=i)};function Ja(){if(Qe>0||(pt(),Qe>0))return;function i(){sa||(sa=!0,o.calledRun=!0,!w&&(yt(),p(o),o.onRuntimeInitialized&&o.onRuntimeInitialized(),vt()))}o.setStatus?(o.setStatus("Running..."),setTimeout(function(){setTimeout(function(){o.setStatus("")},1),i()},1)):i()}if(o.preInit)for(typeof o.preInit=="function"&&(o.preInit=[o.preInit]);o.preInit.length>0;)o.preInit.pop()();Ja();function Zo(i){for(var s=new ArrayBuffer(i.length),f=new Uint8Array(s),h=0,v=i.length;h<v;h++)f[h]=i.charCodeAt(h);return s}var sr=function(i){this.handle=i,this.img=null};sr.prototype.free=function(){this.handle&&(o.heif_image_handle_release(this.handle),this.handle=null)},sr.prototype._ensureImage=function(){if(!this.img){var i=o.heif_js_decode_image(this.handle,o.heif_colorspace.heif_colorspace_YCbCr,o.heif_chroma.heif_chroma_420);if(!i||i.code){console.log("Decoding image failed",this.handle,i);return}this.data=new Uint8Array(Zo(i.data)),delete i.data,this.img=i,i.alpha!==void 0&&(this.alpha=new Uint8Array(Zo(i.alpha)),delete i.alpha)}},sr.prototype.get_width=function(){return o.heif_image_handle_get_width(this.handle)},sr.prototype.get_height=function(){return o.heif_image_handle_get_height(this.handle)},sr.prototype.is_primary=function(){return!!heif_image_handle_is_primary_image(this.handle)},sr.prototype.display=function(i,s){this.get_width(),this.get_height(),setTimeout((function(){if(!this.img){var f=o.heif_js_decode_image2(this.handle,o.heif_colorspace.heif_colorspace_RGB,o.heif_chroma.heif_chroma_interleaved_RGBA);if(!f||f.code){console.log("Decoding image failed",this.handle,f),s(null);return}for(let h of f.channels)if(h.id==o.heif_channel.heif_channel_interleaved)if(h.stride==h.width*4)i.data.set(h.data);else for(let v=0;v<h.height;v++){let M=h.data.slice(v*h.stride,v*h.stride+h.width*4),O=v*h.width*4;i.data.set(M,O)}o.heif_image_release(f.image)}s(i)}).bind(this),0)};var c=function(){this.decoder=null};c.prototype.decode=function(i){if(this.decoder&&o.heif_context_free(this.decoder),this.decoder=o.heif_context_alloc(),!this.decoder)return console.log("Could not create HEIF context"),[];var s=o.heif_context_read_from_memory(this.decoder,i);if(s.code!==o.heif_error_code.heif_error_Ok)return console.log("Could not parse HEIF file",s.message),[];var f=o.heif_js_context_get_list_of_top_level_image_IDs(this.decoder);if(!f||f.code)return console.log("Error loading image ids",f),[];if(!f.length)return console.log("No images found"),[];for(var h=[],v=0;v<f.length;v++){var M=o.heif_js_context_get_image_handle(this.decoder,f[v]);if(!M||M.code){console.log("Could not get image data for id",f[v],M);continue}h.push(new sr(M))}return h};var d=function(i){return i.charCodeAt(0)<<24|i.charCodeAt(1)<<16|i.charCodeAt(2)<<8|i.charCodeAt(3)};o.HeifImage=sr,o.HeifDecoder=c,o.fourcc=d;const _=["heif_error_code","heif_suberror_code","heif_compression_format","heif_chroma","heif_colorspace","heif_channel"];for(const i of _)for(const s in o[i])!o[i].hasOwnProperty(s)||s==="values"||(o[s]=o[i][s]);for(const i in o)i.indexOf("_heif_")!==0||o[i.slice(1)]!==void 0||(o[i.slice(1)]=o[i]);return u=o,u}})();n.exports=t})(Cc)),Cc.exports}var By=ky();const zy=Ph(By);let Ms=null;async function Gy(){if(Ms)return Ms;console.log("[HEIC] Initializing libheif...");const n="/ultrahdr-pwa-svelte/assets/libheif.wasm";console.log("[HEIC] Fetching WASM from:",n);const e=await fetch(n);if(!e.ok)throw new Error(`Failed to fetch libheif WASM: ${e.statusText}`);const t=await e.arrayBuffer();return Ms=await zy({wasmBinary:t,locateFile:r=>r.endsWith(".wasm")?n:r}),console.log("[HEIC] libheif initialized"),Ms}async function Hy(n,e={quality:.95}){console.log("[HEIC] Processing HEIC file:",n.name);const t=await Gy(),r=await n.arrayBuffer(),l=new t.HeifDecoder().decode(r);if(!l||l.length===0)throw new Error("No images found in HEIC file");console.log("[HEIC] Found",l.length,"top-level images");for(let E=0;E<l.length;E++)console.log(`[HEIC] Image ${E}:`,l[E].get_width(),"x",l[E].get_height());const u=l[0],o=u.handle;let p=0;if(t.heif_image_handle_get_number_of_auxiliary_images)try{p=t.heif_image_handle_get_number_of_auxiliary_images(o,0),console.log("[HEIC] Auxiliary images count:",p)}catch(E){console.warn("[HEIC] Could not get auxiliary image count:",E)}else console.warn("[HEIC] heif_image_handle_get_number_of_auxiliary_images not available");p>0&&t.heif_image_handle_get_auxiliary_image_handle(o,"urn:apple:gainmap");const m=u.get_width(),g=u.get_height(),x=document.createElement("canvas");x.width=m,x.height=g;const y=x.getContext("2d"),S=y.createImageData(m,g);await new Promise((E,b)=>{u.display(S,V=>{V?E(V):b(new Error("HEIF processing error"))})}),y.putImageData(S,0,0);const T=await new Promise(E=>x.toBlob(E,"image/png"));return new File([T],n.name.replace(/\.(heic|heif)$/i,".png"),{type:"image/png"})}async function Vy(n,e={maxContentBoost:4,rotation:0,quality:.95}){if(console.log("[Process] Starting processing for:",n.name),n.name.toLowerCase().endsWith(".heic")||n.name.toLowerCase().endsWith(".heif")){console.log("[Process] Detected HEIC/HEIF, converting...");try{const B=await Hy(n,e);B&&(n=B,console.log("[Process] Converted HEIC to:",n.type))}catch(B){throw console.error("[Process] HEIC conversion failed:",B),B}}await n.arrayBuffer();const t=await Wy(n);console.log("[Process] File loaded");let r=null;try{(n.type==="image/jpeg"||n.type==="image/jpg")&&(r=ao.load(t),console.log("[Process] EXIF extracted"))}catch(B){console.warn("Could not extract EXIF:",B)}const a=await new Promise((B,Y)=>{const Z=new Image;Z.onload=()=>B(Z),Z.onerror=Y,Z.src=t});console.log("[Process] Image object created",a.width,"x",a.height);let l=document.createElement("canvas"),u=l.getContext("2d"),o=a.width,p=a.height,m=e.rotation||0;m=(m%360+360)%360,m===90||m===270?(l.width=p,l.height=o):(l.width=o,l.height=p),u.translate(l.width/2,l.height/2),u.rotate(m*Math.PI/180),u.drawImage(a,-o/2,-p/2),console.log("[Process] Canvas drawn (rotation applied)");let g=u.getImageData(0,0,l.width,l.height),x=g.data;console.log("[Process] Image data retrieved"),l.width=1,l.height=1,l=null,u=null,console.log("[Process] Canvas cleaned up");const y=x.length,S=new Uint16Array(y),T=e.maxContentBoost||4,L=B=>(B/=255,B<=.04045?B/12.92:Math.pow((B+.055)/1.055,2.4));for(let B=0;B<y;B+=4)S[B]=cs.toHalfFloat(L(x[B])*T),S[B+1]=cs.toHalfFloat(L(x[B+1])*T),S[B+2]=cs.toHalfFloat(L(x[B+2])*T),S[B+3]=cs.toHalfFloat(x[B+3]/255);console.log("[Process] Converted to HalfFloat Uint16Array");const E=new Eo(S,g.width,g.height,An,ei);E.colorSpace=Rr,E.needsUpdate=!0,console.log("[Process] HDR DataTexture created");const b=Ay({image:E,maxContentBoost:T,toneMapping:Xr});console.log("[Process] gainmap-js encode() called"),b.sdr.material.exposure=1/T,b.sdr.material.needsUpdate=!0;let V=g;b.sdr.render(),console.log("[Process] SDR rendered");const H=b.gainMap.toArray();console.log("[Process] GainMap toArray() completed");let X=new ImageData(new Uint8ClampedArray(H),b.gainMap.width,b.gainMap.height);b.gainMap.dispose(),b.sdr.dispose(),E.dispose(),console.log("[Process] WebGL resources disposed");const I="image/jpeg",R=e.quality||.95;console.log("[Process] Starting SDR compression...");const F=await pu({source:V,mimeType:I,quality:R});console.log("[Process] SDR compression complete"),V=null,x=null,g=null,console.log("[Process] SDR data released"),console.log("[Process] Starting GainMap compression...");const W=await pu({source:X,mimeType:I,quality:R});console.log("[Process] GainMap compression complete"),X=null;const D=b.getMetadata();console.log("[Process] Embedding metadata...");const w=await Fy({...b,...D,sdr:F,gainMap:W});console.log("[Process] Metadata embedded");let z=w;if(r)try{r["0th"]&&r["0th"][ao.ImageIFD.Orientation]&&(r["0th"][ao.ImageIFD.Orientation]=1);const B=Array.from(z).map(J=>String.fromCharCode(J)).join(""),Y=ao.dump(r),Z=ao.insert(Y,B),j=Z.length;z=new Uint8Array(j);for(let J=0;J<j;J++)z[J]=Z.charCodeAt(J);console.log("[Process] EXIF re-inserted")}catch(B){console.warn("Could not re-insert EXIF:",B)}return console.log("[Process] Processing complete, returning Blob"),new Blob([z],{type:"image/jpeg"})}function Wy(n){return new Promise((e,t)=>{const r=new FileReader;r.onload=()=>e(r.result),r.onerror=t,r.readAsDataURL(n)})}var Xy=Qr('<div class="error card svelte-1a1t040"><h3>Error</h3> <p> </p></div>'),$y=Qr('<div class="loading-overlay svelte-1a1t040"><div class="spinner svelte-1a1t040"></div> <p>Processing...</p></div>'),qy=kp('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 svelte-1a1t040"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"></path></svg>'),Yy=Qr('<div class="circle svelte-1a1t040"></div>'),jy=Qr('<div role="button" tabindex="0"><div class="selection-indicator svelte-1a1t040"><!></div> <div class="preview svelte-1a1t040"><img alt="Processed result" class="svelte-1a1t040"/></div> <div class="info svelte-1a1t040"><p class="filename svelte-1a1t040"> </p> <p class="size svelte-1a1t040"> </p></div></div>'),Ky=Qr('<div class="results svelte-1a1t040"><div class="results-header svelte-1a1t040"><h3>Preview</h3> <div class="selection-controls svelte-1a1t040"><button class="text-btn svelte-1a1t040">Select All</button> <button class="text-btn svelte-1a1t040">Deselect All</button> <button class="primary small svelte-1a1t040"> </button></div></div> <div class="grid svelte-1a1t040"></div></div>'),Zy=Qr('<div class="processor svelte-1a1t040"><div class="controls card"><h2>Settings</h2> <div class="control-group svelte-1a1t040"><span class="label svelte-1a1t040">Rotation</span> <div class="button-group svelte-1a1t040"><button class="icon-btn svelte-1a1t040" title="Rotate Left"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 svelte-1a1t040"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"></path></svg> Left</button> <button class="icon-btn svelte-1a1t040" title="Rotate Right">Right <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 svelte-1a1t040"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"></path></svg></button> <span class="value svelte-1a1t040"> </span></div></div> <div class="control-group svelte-1a1t040"><label for="boost" class="svelte-1a1t040">Max Content Boost (HDR Intensity)</label> <div class="range-wrapper svelte-1a1t040"><input type="range" id="boost" min="1.0" max="10.0" step="0.1" class="svelte-1a1t040"/> <span class="value svelte-1a1t040"> </span></div> <p class="help-text svelte-1a1t040">Higher values create brighter highlights.</p></div> <div class="control-group svelte-1a1t040"><label for="quality" class="svelte-1a1t040">JPEG Quality</label> <div class="range-wrapper svelte-1a1t040"><input type="range" id="quality" min="0.1" max="1.0" step="0.05" class="svelte-1a1t040"/> <span class="value svelte-1a1t040"> </span></div></div> <div class="actions svelte-1a1t040"><button class="secondary svelte-1a1t040">Start Over</button></div></div> <!> <div><!> <!></div></div>');function Jy(n,e){If(e,!1);let t=tm(e,"files",28,()=>[]),r=Sr(4),a=Sr(0),l=Sr(.95),u=Sr(!1),o=Sr([]),p=Sr(null),m,g=Sr(new Set);nm(()=>{x()});async function x(){At(u,!0),At(o,[]),At(p,null),At(g,new Set);try{for(let Re=0;Re<t().length;Re++){const lt=t()[Re],$=await Vy(lt,{maxContentBoost:He(r),rotation:He(a),quality:He(l)}),nt=URL.createObjectURL($);At(o,[...He(o),{originalName:lt.name,url:nt,size:$.size,index:Re}]),He(g).add(Re)}At(g,He(g)),At(g,He(g))}catch(Re){console.error("[UI] Error processing files:",Re),At(p,Re.message)}finally{At(u,!1)}}function y(){clearTimeout(m),m=setTimeout(()=>{x()},500)}function S(Re){At(a,(He(a)+Re+360)%360),y()}function T(Re){He(g).has(Re)?He(g).delete(Re):He(g).add(Re),At(g,He(g))}function L(){He(o).forEach((Re,lt)=>He(g).add(lt)),At(g,He(g))}function E(){He(g).clear(),At(g,He(g))}function b(Re){const lt=document.createElement("a");lt.href=Re.url,lt.download=`ultrahdr-${Re.originalName.replace(/\.[^/.]+$/,"")}.jpg`,lt.click()}function V(){He(o).forEach((Re,lt)=>{He(g).has(lt)&&b(Re)})}function H(){t([]),At(o,[]),At(a,0),At(r,4),At(l,.95),At(g,new Set),X("reset")}const X=Qd();Jd();var I=Zy(),R=kt(I),F=qt(kt(R),2),W=qt(kt(F),2),D=kt(W),w=qt(D,2),z=qt(w,2),B=kt(z),Y=qt(F,2),Z=qt(kt(Y),2),j=kt(Z),J=qt(j,2),ue=kt(J),te=qt(Y,2),Se=qt(kt(te),2),be=kt(Se),Ye=qt(be,2),ct=kt(Ye),pt=qt(te,2),yt=kt(pt),vt=qt(R,2);{var _e=Re=>{var lt=Xy(),$=qt(kt(lt),2),nt=kt($);oo(()=>Pi(nt,He(p))),br(Re,lt)};lo(vt,Re=>{He(p)&&Re(_e)})}var ge=qt(vt,2);let Oe;var Qe=kt(ge);{var $e=Re=>{var lt=$y();br(Re,lt)};lo(Qe,Re=>{He(u),He(o),wn(()=>He(u)&&He(o).length===0)&&Re($e)})}var ft=qt(Qe,2);{var Lt=Re=>{var lt=Ky(),$=kt(lt),nt=qt(kt($),2),rt=kt(nt),ut=qt(rt,2),Ue=qt(ut,2),bt=kt(Ue),qe=qt($,2);Xp(qe,5,()=>He(o),Vp,(it,N,P)=>{var ne=jy();let he;var de=kt(ne),ie=kt(de);{var Ze=Ve=>{var q=qy();br(Ve,q)},Fe=Ve=>{var q=Yy();br(Ve,q)};lo(ie,Ve=>{He(g),wn(()=>He(g).has(P))?Ve(Ze):Ve(Fe,!1)})}var et=qt(de,2),Ke=kt(et),ve=qt(et,2),fe=kt(ve),we=kt(fe),je=qt(fe,2),Be=kt(je);oo((Ve,q)=>{he=Oc(ne,1,"result-card card svelte-1a1t040",null,he,Ve),Zp(Ke,"src",(He(N),wn(()=>He(N).url))),Pi(we,(He(N),wn(()=>He(N).originalName))),Pi(Be,`${q??""} MB`)},[()=>({selected:He(g).has(P)}),()=>(He(N),wn(()=>(He(N).size/1024/1024).toFixed(2)))]),Dn("click",ne,()=>T(P)),Dn("keydown",ne,Ve=>Ve.key==="Enter"&&T(P)),br(it,ne)}),oo(()=>{Ue.disabled=(He(g),wn(()=>He(g).size===0)),Pi(bt,`Download Selected (${He(g),wn(()=>He(g).size)??""})`)}),Dn("click",rt,L),Dn("click",ut,E),Dn("click",Ue,V),br(Re,lt)};lo(ft,Re=>{He(o),wn(()=>He(o).length>0)&&Re(Lt)})}oo((Re,lt)=>{D.disabled=He(u),w.disabled=He(u),Pi(B,`${He(a)??""}°`),j.disabled=He(u),Pi(ue,`${Re??""}x`),be.disabled=He(u),Pi(ct,`${lt??""}%`),yt.disabled=He(u),Oe=Oc(ge,1,"results-container svelte-1a1t040",null,Oe,{loading:He(u)})},[()=>(He(r),wn(()=>He(r).toFixed(1))),()=>(He(l),wn(()=>Math.round(He(l)*100)))]),Dn("click",D,()=>S(-90)),Dn("click",w,()=>S(90)),du(j,()=>He(r),Re=>At(r,Re)),Dn("input",j,y),du(be,()=>He(l),Re=>At(l,Re)),Dn("input",be,y),Dn("click",yt,H),br(n,I),Uf()}var Qy=Qr('<div class="drop-container svelte-1n46o8q"><!></div>'),eS=Qr('<main><h1>UltraHDR Converter</h1> <p class="subtitle svelte-1n46o8q">Convert your images to UltraHDR with gain maps, entirely offline.</p> <!></main>');function tS(n){let e=Sr([]);function t(p){At(e,Array.from(p.detail))}function r(){At(e,[])}var a=eS(),l=qt(kt(a),4);{var u=p=>{var m=Qy(),g=kt(m);sm(g,{$$events:{files:t}}),br(p,m)},o=p=>{Jy(p,{get files(){return He(e)},$$events:{reset:r}})};lo(l,p=>{He(e).length===0?p(u):p(o,!1)})}br(n,a)}Bp(tS,{target:document.getElementById("app")});
