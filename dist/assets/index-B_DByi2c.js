(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const l of a)if(l.type==="childList")for(const u of l.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function t(a){const l={};return a.integrity&&(l.integrity=a.integrity),a.referrerPolicy&&(l.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?l.credentials="include":a.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(a){if(a.ep)return;a.ep=!0;const l=t(a);fetch(a.href,l)}})();const Pc=!1;var Rf=Array.isArray,Fh=Array.prototype.indexOf,Pf=Array.from,Ih=Object.defineProperty,wa=Object.getOwnPropertyDescriptor,pd=Object.getOwnPropertyDescriptors,Uh=Object.prototype,Nh=Array.prototype,Df=Object.getPrototypeOf,nu=Object.isExtensible;function Oh(n){return n()}function Dc(n){for(var e=0;e<n.length;e++)n[e]()}function md(){var n,e,t=new Promise((r,a)=>{n=r,e=a});return{promise:t,resolve:n,reject:e}}const mn=2,_d=4,ks=8,jr=16,Kr=32,Yi=64,Bs=128,mr=512,yn=1024,Un=2048,Zr=4096,Vn=8192,Vr=16384,Lf=32768,Pa=65536,ru=1<<17,gd=1<<18,Oa=1<<19,vd=1<<20,Wi=32768,Lc=1<<21,Ff=1<<22,vi=1<<23,Ta=Symbol("$state"),kh=Symbol("legacy props"),Ea=new class extends Error{name="StaleReactionError";message="The reaction that called `getAbortSignal()` was re-run or destroyed"};function xd(n){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function Bh(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function zh(n){throw new Error("https://svelte.dev/e/effect_in_teardown")}function Gh(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function Hh(n){throw new Error("https://svelte.dev/e/effect_orphan")}function Vh(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function Wh(n){throw new Error("https://svelte.dev/e/props_invalid_value")}function Xh(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function $h(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function qh(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function Yh(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}const jh=1,Kh=2,Zh=16,Jh=2,Qh=8,ep=2,vn=Symbol(),tp="http://www.w3.org/1999/xhtml";function np(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}function yd(n){return n===this.v}function rp(n,e){return n!=n?e==e:n!==e||n!==null&&typeof n=="object"||typeof n=="function"}function Sd(n){return!rp(n,this.v)}let ka=!1,ip=!1;function ap(){ka=!0}let Kt=null;function Da(n){Kt=n}function If(n,e=!1,t){Kt={p:Kt,i:!1,c:null,e:null,s:n,x:null,l:ka&&!e?{s:null,u:null,$:[]}:null}}function Uf(n){var e=Kt,t=e.e;if(t!==null){e.e=null;for(var r of t)kd(r)}return e.i=!0,Kt=e.p,{}}function Mo(){return!ka||Kt!==null&&Kt.l===null}let zi=[];function bd(){var n=zi;zi=[],Dc(n)}function zs(n){if(zi.length===0&&!fo){var e=zi;queueMicrotask(()=>{e===zi&&bd()})}zi.push(n)}function op(){for(;zi.length>0;)bd()}function Ed(n){var e=Ft;if(e===null)return Ct.f|=vi,n;if((e.f&Lf)===0){if((e.f&Bs)===0)throw n;e.b.error(n)}else La(n,e)}function La(n,e){for(;e!==null;){if((e.f&Bs)!==0)try{e.b.error(n);return}catch(t){n=t}e=e.parent}throw n}const Jo=new Set;let Vt=null,ws=null,Gn=null,jn=[],Gs=null,Fc=!1,fo=!1;class Mr{committed=!1;current=new Map;previous=new Map;#e=new Set;#t=new Set;#r=0;#n=0;#l=null;#a=[];#i=[];skipped_effects=new Set;is_fork=!1;is_deferred(){return this.is_fork||this.#n>0}process(e){jn=[],ws=null,this.apply();var t={parent:null,effect:null,effects:[],render_effects:[],block_effects:[]};for(const r of e)this.#o(r,t);this.is_fork||this.#f(),this.is_deferred()?(this.#s(t.effects),this.#s(t.render_effects),this.#s(t.block_effects)):(ws=this,Vt=null,iu(t.render_effects),iu(t.effects),ws=null,this.#l?.resolve()),Gn=null}#o(e,t){e.f^=yn;for(var r=e.first;r!==null;){var a=r.f,l=(a&(Kr|Yi))!==0,u=l&&(a&yn)!==0,o=u||(a&Vn)!==0||this.skipped_effects.has(r);if((r.f&Bs)!==0&&r.b?.is_pending()&&(t={parent:t,effect:r,effects:[],render_effects:[],block_effects:[]}),!o&&r.fn!==null){l?r.f^=yn:(a&_d)!==0?t.effects.push(r):wo(r)&&((r.f&jr)!==0&&t.block_effects.push(r),mo(r));var p=r.first;if(p!==null){r=p;continue}}var m=r.parent;for(r=r.next;r===null&&m!==null;)m===t.effect&&(this.#s(t.effects),this.#s(t.render_effects),this.#s(t.block_effects),t=t.parent),r=m.next,m=m.parent}}#s(e){for(const t of e)((t.f&Un)!==0?this.#a:this.#i).push(t),this.#c(t.deps),Sn(t,yn)}#c(e){if(e!==null)for(const t of e)(t.f&mn)===0||(t.f&Wi)===0||(t.f^=Wi,this.#c(t.deps))}capture(e,t){this.previous.has(e)||this.previous.set(e,t),(e.f&vi)===0&&(this.current.set(e,e.v),Gn?.set(e,e.v))}activate(){Vt=this,this.apply()}deactivate(){Vt===this&&(Vt=null,Gn=null)}flush(){if(this.activate(),jn.length>0){if(Md(),Vt!==null&&Vt!==this)return}else this.#r===0&&this.process([]);this.deactivate()}discard(){for(const e of this.#t)e(this);this.#t.clear()}#f(){if(this.#n===0){for(const e of this.#e)e();this.#e.clear()}this.#r===0&&this.#u()}#u(){if(Jo.size>1){this.previous.clear();var e=Gn,t=!0,r={parent:null,effect:null,effects:[],render_effects:[],block_effects:[]};for(const l of Jo){if(l===this){t=!1;continue}const u=[];for(const[p,m]of this.current){if(l.current.has(p))if(t&&m!==l.current.get(p))l.current.set(p,m);else continue;u.push(p)}if(u.length===0)continue;const o=[...l.current.keys()].filter(p=>!this.current.has(p));if(o.length>0){var a=jn;jn=[];const p=new Set,m=new Map;for(const x of u)wd(x,o,p,m);if(jn.length>0){Vt=l,l.apply();for(const x of jn)l.#o(x,r);l.deactivate()}jn=a}}Vt=null,Gn=e}this.committed=!0,Jo.delete(this)}increment(e){this.#r+=1,e&&(this.#n+=1)}decrement(e){this.#r-=1,e&&(this.#n-=1),this.revive()}revive(){for(const e of this.#a)Sn(e,Un),Xi(e);for(const e of this.#i)Sn(e,Zr),Xi(e);this.#a=[],this.#i=[],this.flush()}oncommit(e){this.#e.add(e)}ondiscard(e){this.#t.add(e)}settled(){return(this.#l??=md()).promise}static ensure(){if(Vt===null){const e=Vt=new Mr;Jo.add(Vt),fo||Mr.enqueue(()=>{Vt===e&&e.flush()})}return Vt}static enqueue(e){zs(e)}apply(){}}function sp(n){var e=fo;fo=!0;try{for(var t;;){if(op(),jn.length===0&&(Vt?.flush(),jn.length===0))return Gs=null,t;Md()}}finally{fo=e}}function Md(){var n=yi;Fc=!0;var e=null;try{var t=0;for(Fs(!0);jn.length>0;){var r=Mr.ensure();if(t++>1e3){var a,l;lp()}r.process(jn),xi.clear()}}finally{Fc=!1,Fs(n),Gs=null}}function lp(){try{Vh()}catch(n){La(n,Gs)}}let zr=null;function iu(n){var e=n.length;if(e!==0){for(var t=0;t<e;){var r=n[t++];if((r.f&(Vr|Vn))===0&&wo(r)&&(zr=new Set,mo(r),r.deps===null&&r.first===null&&r.nodes_start===null&&(r.teardown===null&&r.ac===null?Gd(r):r.fn=null),zr?.size>0)){xi.clear();for(const a of zr){if((a.f&(Vr|Vn))!==0)continue;const l=[a];let u=a.parent;for(;u!==null;)zr.has(u)&&(zr.delete(u),l.push(u)),u=u.parent;for(let o=l.length-1;o>=0;o--){const p=l[o];(p.f&(Vr|Vn))===0&&mo(p)}}zr.clear()}}zr=null}}function wd(n,e,t,r){if(!t.has(n)&&(t.add(n),n.reactions!==null))for(const a of n.reactions){const l=a.f;(l&mn)!==0?wd(a,e,t,r):(l&(Ff|jr))!==0&&(l&Un)===0&&Td(a,e,r)&&(Sn(a,Un),Xi(a))}}function Td(n,e,t){const r=t.get(n);if(r!==void 0)return r;if(n.deps!==null)for(const a of n.deps){if(e.includes(a))return!0;if((a.f&mn)!==0&&Td(a,e,t))return t.set(a,!0),!0}return t.set(n,!1),!1}function Xi(n){for(var e=Gs=n;e.parent!==null;){e=e.parent;var t=e.f;if(Fc&&e===Ft&&(t&jr)!==0&&(t&gd)===0)return;if((t&(Yi|Kr))!==0){if((t&yn)===0)return;e.f^=yn}}jn.push(e)}function cp(n){let e=0,t=$i(0),r;return()=>{Ws()&&(Ve(t),Bf(()=>(e===0&&(r=xn(()=>n(()=>uo(t)))),e+=1,()=>{zs(()=>{e-=1,e===0&&(r?.(),r=void 0,uo(t))})})))}}var fp=Pa|Oa|Bs;function up(n,e,t){new dp(n,e,t)}class dp{parent;#e=!1;#t;#r=null;#n;#l;#a;#i=null;#o=null;#s=null;#c=null;#f=null;#u=0;#d=0;#p=!1;#h=null;#x=cp(()=>(this.#h=$i(this.#u),()=>{this.#h=null}));constructor(e,t,r){this.#t=e,this.#n=t,this.#l=r,this.parent=Ft.b,this.#e=!!this.#n.pending,this.#a=zf(()=>{Ft.b=this;{var a=this.#g();try{this.#i=Kn(()=>r(a))}catch(l){this.error(l)}this.#d>0?this.#_():this.#e=!1}return()=>{this.#f?.remove()}},fp)}#y(){try{this.#i=Kn(()=>this.#l(this.#t))}catch(e){this.error(e)}this.#e=!1}#S(){const e=this.#n.pending;e&&(this.#o=Kn(()=>e(this.#t)),Mr.enqueue(()=>{var t=this.#g();this.#i=this.#m(()=>(Mr.ensure(),Kn(()=>this.#l(t)))),this.#d>0?this.#_():(Aa(this.#o,()=>{this.#o=null}),this.#e=!1)}))}#g(){var e=this.#t;return this.#e&&(this.#f=qi(),this.#t.before(this.#f),e=this.#f),e}is_pending(){return this.#e||!!this.parent&&this.parent.is_pending()}has_pending_snippet(){return!!this.#n.pending}#m(e){var t=Ft,r=Ct,a=Kt;Cr(this.#a),Ln(this.#a),Da(this.#a.ctx);try{return e()}catch(l){return Ed(l),null}finally{Cr(t),Ln(r),Da(a)}}#_(){const e=this.#n.pending;this.#i!==null&&(this.#c=document.createDocumentFragment(),this.#c.append(this.#f),Wd(this.#i,this.#c)),this.#o===null&&(this.#o=Kn(()=>e(this.#t)))}#v(e){if(!this.has_pending_snippet()){this.parent&&this.parent.#v(e);return}this.#d+=e,this.#d===0&&(this.#e=!1,this.#o&&Aa(this.#o,()=>{this.#o=null}),this.#c&&(this.#t.before(this.#c),this.#c=null))}update_pending_count(e){this.#v(e),this.#u+=e,this.#h&&ho(this.#h,this.#u)}get_effect_pending(){return this.#x(),Ve(this.#h)}error(e){var t=this.#n.onerror;let r=this.#n.failed;if(this.#p||!t&&!r)throw e;this.#i&&(Fn(this.#i),this.#i=null),this.#o&&(Fn(this.#o),this.#o=null),this.#s&&(Fn(this.#s),this.#s=null);var a=!1,l=!1;const u=()=>{if(a){np();return}a=!0,l&&Yh(),Mr.ensure(),this.#u=0,this.#s!==null&&Aa(this.#s,()=>{this.#s=null}),this.#e=this.has_pending_snippet(),this.#i=this.#m(()=>(this.#p=!1,Kn(()=>this.#l(this.#t)))),this.#d>0?this.#_():this.#e=!1};var o=Ct;try{Ln(null),l=!0,t?.(e,u),l=!1}catch(p){La(p,this.#a&&this.#a.parent)}finally{Ln(o)}r&&zs(()=>{this.#s=this.#m(()=>{Mr.ensure(),this.#p=!0;try{return Kn(()=>{r(this.#t,()=>e,()=>u)})}catch(p){return La(p,this.#a.parent),null}finally{this.#p=!1}})})}}function hp(n,e,t,r){const a=Mo()?Nf:Of;if(t.length===0&&n.length===0){r(e.map(a));return}var l=Vt,u=Ft,o=pp();function p(){Promise.all(t.map(m=>mp(m))).then(m=>{o();try{r([...e.map(a),...m])}catch(x){(u.f&Vr)===0&&La(x,u)}l?.deactivate(),Ds()}).catch(m=>{La(m,u)})}n.length>0?Promise.all(n).then(()=>{o();try{return p()}finally{l?.deactivate(),Ds()}}):p()}function pp(){var n=Ft,e=Ct,t=Kt,r=Vt;return function(l=!0){Cr(n),Ln(e),Da(t),l&&r?.activate()}}function Ds(){Cr(null),Ln(null),Da(null)}function Nf(n){var e=mn|Un,t=Ct!==null&&(Ct.f&mn)!==0?Ct:null;return Ft!==null&&(Ft.f|=Oa),{ctx:Kt,deps:null,effects:null,equals:yd,f:e,fn:n,reactions:null,rv:0,v:vn,wv:0,parent:t??Ft,ac:null}}function mp(n,e){let t=Ft;t===null&&Bh();var r=t.b,a=void 0,l=$i(vn),u=!Ct,o=new Map;return Mp(()=>{var p=md();a=p.promise;try{Promise.resolve(n()).then(p.resolve,p.reject).then(()=>{m===Vt&&m.committed&&m.deactivate(),Ds()})}catch(y){p.reject(y),Ds()}var m=Vt;if(u){var x=!r.is_pending();r.update_pending_count(1),m.increment(x),o.get(m)?.reject(Ea),o.delete(m),o.set(m,p)}const v=(y,S=void 0)=>{if(m.activate(),S)S!==Ea&&(l.f|=vi,ho(l,S));else{(l.f&vi)!==0&&(l.f^=vi),ho(l,y);for(const[T,F]of o){if(o.delete(T),T===m)break;F.reject(Ea)}}u&&(r.update_pending_count(-1),m.decrement(x))};p.promise.then(v,y=>v(null,y||"unknown"))}),Od(()=>{for(const p of o.values())p.reject(Ea)}),new Promise(p=>{function m(x){function v(){x===a?p(l):m(a)}x.then(v,v)}m(a)})}function Of(n){const e=Nf(n);return e.equals=Sd,e}function Ad(n){var e=n.effects;if(e!==null){n.effects=null;for(var t=0;t<e.length;t+=1)Fn(e[t])}}function _p(n){for(var e=n.parent;e!==null;){if((e.f&mn)===0)return(e.f&Vr)===0?e:null;e=e.parent}return null}function kf(n){var e,t=Ft;Cr(_p(n));try{n.f&=~Wi,Ad(n),e=Yd(n)}finally{Cr(t)}return e}function Cd(n){var e=kf(n);if(n.equals(e)||(n.v=e,n.wv=$d()),!ji)if(Gn!==null)Ws()&&Gn.set(n,n.v);else{var t=(n.f&mr)===0?Zr:yn;Sn(n,t)}}let Ic=new Set;const xi=new Map;let Rd=!1;function $i(n,e){var t={f:0,v:n,reactions:null,equals:yd,rv:0,wv:0};return t}function ci(n,e){const t=$i(n);return Ap(t),t}function ur(n,e=!1,t=!0){const r=$i(n);return e||(r.equals=Sd),ka&&t&&Kt!==null&&Kt.l!==null&&(Kt.l.s??=[]).push(r),r}function wt(n,e,t=!1){Ct!==null&&(!wr||(Ct.f&ru)!==0)&&Mo()&&(Ct.f&(mn|jr|Ff|ru))!==0&&!Wr?.includes(n)&&qh();let r=t?Ma(e):e;return ho(n,r)}function ho(n,e){if(!n.equals(e)){var t=n.v;ji?xi.set(n,e):xi.set(n,t),n.v=e;var r=Mr.ensure();r.capture(n,t),(n.f&mn)!==0&&((n.f&Un)!==0&&kf(n),Sn(n,(n.f&mr)!==0?yn:Zr)),n.wv=$d(),Pd(n,Un),Mo()&&Ft!==null&&(Ft.f&yn)!==0&&(Ft.f&(Kr|Yi))===0&&(Yn===null?Cp([n]):Yn.push(n)),!r.is_fork&&Ic.size>0&&!Rd&&gp()}return e}function gp(){Rd=!1;var n=yi;Fs(!0);const e=Array.from(Ic);try{for(const t of e)(t.f&yn)!==0&&Sn(t,Zr),wo(t)&&mo(t)}finally{Fs(n)}Ic.clear()}function uo(n){wt(n,n.v+1)}function Pd(n,e){var t=n.reactions;if(t!==null)for(var r=Mo(),a=t.length,l=0;l<a;l++){var u=t[l],o=u.f;if(!(!r&&u===Ft)){var p=(o&Un)===0;if(p&&Sn(u,e),(o&mn)!==0){var m=u;Gn?.delete(m),(o&Wi)===0&&(o&mr&&(u.f|=Wi),Pd(m,Zr))}else p&&((o&jr)!==0&&zr!==null&&zr.add(u),Xi(u))}}}function Ma(n){if(typeof n!="object"||n===null||Ta in n)return n;const e=Df(n);if(e!==Uh&&e!==Nh)return n;var t=new Map,r=Rf(n),a=ci(0),l=Hi,u=o=>{if(Hi===l)return o();var p=Ct,m=Hi;Ln(null),lu(l);var x=o();return Ln(p),lu(m),x};return r&&t.set("length",ci(n.length)),new Proxy(n,{defineProperty(o,p,m){(!("value"in m)||m.configurable===!1||m.enumerable===!1||m.writable===!1)&&Xh();var x=t.get(p);return x===void 0?x=u(()=>{var v=ci(m.value);return t.set(p,v),v}):wt(x,m.value,!0),!0},deleteProperty(o,p){var m=t.get(p);if(m===void 0){if(p in o){const x=u(()=>ci(vn));t.set(p,x),uo(a)}}else wt(m,vn),uo(a);return!0},get(o,p,m){if(p===Ta)return n;var x=t.get(p),v=p in o;if(x===void 0&&(!v||wa(o,p)?.writable)&&(x=u(()=>{var S=Ma(v?o[p]:vn),T=ci(S);return T}),t.set(p,x)),x!==void 0){var y=Ve(x);return y===vn?void 0:y}return Reflect.get(o,p,m)},getOwnPropertyDescriptor(o,p){var m=Reflect.getOwnPropertyDescriptor(o,p);if(m&&"value"in m){var x=t.get(p);x&&(m.value=Ve(x))}else if(m===void 0){var v=t.get(p),y=v?.v;if(v!==void 0&&y!==vn)return{enumerable:!0,configurable:!0,value:y,writable:!0}}return m},has(o,p){if(p===Ta)return!0;var m=t.get(p),x=m!==void 0&&m.v!==vn||Reflect.has(o,p);if(m!==void 0||Ft!==null&&(!x||wa(o,p)?.writable)){m===void 0&&(m=u(()=>{var y=x?Ma(o[p]):vn,S=ci(y);return S}),t.set(p,m));var v=Ve(m);if(v===vn)return!1}return x},set(o,p,m,x){var v=t.get(p),y=p in o;if(r&&p==="length")for(var S=m;S<v.v;S+=1){var T=t.get(S+"");T!==void 0?wt(T,vn):S in o&&(T=u(()=>ci(vn)),t.set(S+"",T))}if(v===void 0)(!y||wa(o,p)?.writable)&&(v=u(()=>ci(void 0)),wt(v,Ma(m)),t.set(p,v));else{y=v.v!==vn;var F=u(()=>Ma(m));wt(v,F)}var E=Reflect.getOwnPropertyDescriptor(o,p);if(E?.set&&E.set.call(x,m),!y){if(r&&typeof p=="string"){var b=t.get("length"),H=Number(p);Number.isInteger(H)&&H>=b.v&&wt(b,H+1)}uo(a)}return!0},ownKeys(o){Ve(a);var p=Reflect.ownKeys(o).filter(v=>{var y=t.get(v);return y===void 0||y.v!==vn});for(var[m,x]of t)x.v!==vn&&!(m in o)&&p.push(m);return p},setPrototypeOf(){$h()}})}var au,Dd,Ld,Fd;function vp(){if(au===void 0){au=window,Dd=/Firefox/.test(navigator.userAgent);var n=Element.prototype,e=Node.prototype,t=Text.prototype;Ld=wa(e,"firstChild").get,Fd=wa(e,"nextSibling").get,nu(n)&&(n.__click=void 0,n.__className=void 0,n.__attributes=null,n.__style=void 0,n.__e=void 0),nu(t)&&(t.__t=void 0)}}function qi(n=""){return document.createTextNode(n)}function Ls(n){return Ld.call(n)}function Hs(n){return Fd.call(n)}function Nt(n,e){return Ls(n)}function Xt(n,e=1,t=!1){let r=n;for(;e--;)r=Hs(r);return r}function xp(n){n.textContent=""}function Id(){return!1}let ou=!1;function yp(){ou||(ou=!0,document.addEventListener("reset",n=>{Promise.resolve().then(()=>{if(!n.defaultPrevented)for(const e of n.target.elements)e.__on_r?.()})},{capture:!0}))}function Vs(n){var e=Ct,t=Ft;Ln(null),Cr(null);try{return n()}finally{Ln(e),Cr(t)}}function Ud(n,e,t,r=t){n.addEventListener(e,()=>Vs(t));const a=n.__on_r;a?n.__on_r=()=>{a(),r(!0)}:n.__on_r=()=>r(!0),yp()}function Nd(n){Ft===null&&(Ct===null&&Hh(),Gh()),ji&&zh()}function Sp(n,e){var t=e.last;t===null?e.last=e.first=n:(t.next=n,n.prev=t,e.last=n)}function Jr(n,e,t){var r=Ft;r!==null&&(r.f&Vn)!==0&&(n|=Vn);var a={ctx:Kt,deps:null,nodes_start:null,nodes_end:null,f:n|Un|mr,first:null,fn:e,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,transitions:null,wv:0,ac:null};if(t)try{mo(a),a.f|=Lf}catch(o){throw Fn(a),o}else e!==null&&Xi(a);var l=a;if(t&&l.deps===null&&l.teardown===null&&l.nodes_start===null&&l.first===l.last&&(l.f&Oa)===0&&(l=l.first,(n&jr)!==0&&(n&Pa)!==0&&l!==null&&(l.f|=Pa)),l!==null&&(l.parent=r,r!==null&&Sp(l,r),Ct!==null&&(Ct.f&mn)!==0&&(n&Yi)===0)){var u=Ct;(u.effects??=[]).push(l)}return a}function Ws(){return Ct!==null&&!wr}function Od(n){const e=Jr(ks,null,!1);return Sn(e,yn),e.teardown=n,e}function Uc(n){Nd();var e=Ft.f,t=!Ct&&(e&Kr)!==0&&(e&Lf)===0;if(t){var r=Kt;(r.e??=[]).push(n)}else return kd(n)}function kd(n){return Jr(_d|vd,n,!1)}function bp(n){return Nd(),Jr(ks|vd,n,!0)}function Ep(n){Mr.ensure();const e=Jr(Yi|Oa,n,!0);return(t={})=>new Promise(r=>{t.outro?Aa(e,()=>{Fn(e),r(void 0)}):(Fn(e),r(void 0))})}function Mp(n){return Jr(Ff|Oa,n,!0)}function Bf(n,e=0){return Jr(ks|e,n,!0)}function oo(n,e=[],t=[],r=[]){hp(r,e,t,a=>{Jr(ks,()=>n(...a.map(Ve)),!0)})}function zf(n,e=0){var t=Jr(jr|e,n,!0);return t}function Kn(n){return Jr(Kr|Oa,n,!0)}function Bd(n){var e=n.teardown;if(e!==null){const t=ji,r=Ct;su(!0),Ln(null);try{e.call(null)}finally{su(t),Ln(r)}}}function zd(n,e=!1){var t=n.first;for(n.first=n.last=null;t!==null;){const a=t.ac;a!==null&&Vs(()=>{a.abort(Ea)});var r=t.next;(t.f&Yi)!==0?t.parent=null:Fn(t,e),t=r}}function wp(n){for(var e=n.first;e!==null;){var t=e.next;(e.f&Kr)===0&&Fn(e),e=t}}function Fn(n,e=!0){var t=!1;(e||(n.f&gd)!==0)&&n.nodes_start!==null&&n.nodes_end!==null&&(Tp(n.nodes_start,n.nodes_end),t=!0),zd(n,e&&!t),Is(n,0),Sn(n,Vr);var r=n.transitions;if(r!==null)for(const l of r)l.stop();Bd(n);var a=n.parent;a!==null&&a.first!==null&&Gd(n),n.next=n.prev=n.teardown=n.ctx=n.deps=n.fn=n.nodes_start=n.nodes_end=n.ac=null}function Tp(n,e){for(;n!==null;){var t=n===e?null:Hs(n);n.remove(),n=t}}function Gd(n){var e=n.parent,t=n.prev,r=n.next;t!==null&&(t.next=r),r!==null&&(r.prev=t),e!==null&&(e.first===n&&(e.first=r),e.last===n&&(e.last=t))}function Aa(n,e,t=!0){var r=[];Gf(n,r,!0),Hd(r,()=>{t&&Fn(n),e&&e()})}function Hd(n,e){var t=n.length;if(t>0){var r=()=>--t||e();for(var a of n)a.out(r)}else e()}function Gf(n,e,t){if((n.f&Vn)===0){if(n.f^=Vn,n.transitions!==null)for(const u of n.transitions)(u.is_global||t)&&e.push(u);for(var r=n.first;r!==null;){var a=r.next,l=(r.f&Pa)!==0||(r.f&Kr)!==0&&(n.f&jr)!==0;Gf(r,e,l?t:!1),r=a}}}function Hf(n){Vd(n,!0)}function Vd(n,e){if((n.f&Vn)!==0){n.f^=Vn,(n.f&yn)===0&&(Sn(n,Un),Xi(n));for(var t=n.first;t!==null;){var r=t.next,a=(t.f&Pa)!==0||(t.f&Kr)!==0;Vd(t,a?e:!1),t=r}if(n.transitions!==null)for(const l of n.transitions)(l.is_global||e)&&l.in()}}function Wd(n,e){for(var t=n.nodes_start,r=n.nodes_end;t!==null;){var a=t===r?null:Hs(t);e.append(t),t=a}}let yi=!1;function Fs(n){yi=n}let ji=!1;function su(n){ji=n}let Ct=null,wr=!1;function Ln(n){Ct=n}let Ft=null;function Cr(n){Ft=n}let Wr=null;function Ap(n){Ct!==null&&(Wr===null?Wr=[n]:Wr.push(n))}let Tn=null,Bn=0,Yn=null;function Cp(n){Yn=n}let Xd=1,po=0,Hi=po;function lu(n){Hi=n}function $d(){return++Xd}function wo(n){var e=n.f;if((e&Un)!==0)return!0;if(e&mn&&(n.f&=~Wi),(e&Zr)!==0){var t=n.deps;if(t!==null)for(var r=t.length,a=0;a<r;a++){var l=t[a];if(wo(l)&&Cd(l),l.wv>n.wv)return!0}(e&mr)!==0&&Gn===null&&Sn(n,yn)}return!1}function qd(n,e,t=!0){var r=n.reactions;if(r!==null&&!Wr?.includes(n))for(var a=0;a<r.length;a++){var l=r[a];(l.f&mn)!==0?qd(l,e,!1):e===l&&(t?Sn(l,Un):(l.f&yn)!==0&&Sn(l,Zr),Xi(l))}}function Yd(n){var e=Tn,t=Bn,r=Yn,a=Ct,l=Wr,u=Kt,o=wr,p=Hi,m=n.f;Tn=null,Bn=0,Yn=null,Ct=(m&(Kr|Yi))===0?n:null,Wr=null,Da(n.ctx),wr=!1,Hi=++po,n.ac!==null&&(Vs(()=>{n.ac.abort(Ea)}),n.ac=null);try{n.f|=Lc;var x=n.fn,v=x(),y=n.deps;if(Tn!==null){var S;if(Is(n,Bn),y!==null&&Bn>0)for(y.length=Bn+Tn.length,S=0;S<Tn.length;S++)y[Bn+S]=Tn[S];else n.deps=y=Tn;if(yi&&Ws()&&(n.f&mr)!==0)for(S=Bn;S<y.length;S++)(y[S].reactions??=[]).push(n)}else y!==null&&Bn<y.length&&(Is(n,Bn),y.length=Bn);if(Mo()&&Yn!==null&&!wr&&y!==null&&(n.f&(mn|Zr|Un))===0)for(S=0;S<Yn.length;S++)qd(Yn[S],n);return a!==null&&a!==n&&(po++,Yn!==null&&(r===null?r=Yn:r.push(...Yn))),(n.f&vi)!==0&&(n.f^=vi),v}catch(T){return Ed(T)}finally{n.f^=Lc,Tn=e,Bn=t,Yn=r,Ct=a,Wr=l,Da(u),wr=o,Hi=p}}function Rp(n,e){let t=e.reactions;if(t!==null){var r=Fh.call(t,n);if(r!==-1){var a=t.length-1;a===0?t=e.reactions=null:(t[r]=t[a],t.pop())}}t===null&&(e.f&mn)!==0&&(Tn===null||!Tn.includes(e))&&(Sn(e,Zr),(e.f&mr)!==0&&(e.f^=mr,e.f&=~Wi),Ad(e),Is(e,0))}function Is(n,e){var t=n.deps;if(t!==null)for(var r=e;r<t.length;r++)Rp(n,t[r])}function mo(n){var e=n.f;if((e&Vr)===0){Sn(n,yn);var t=Ft,r=yi;Ft=n,yi=!0;try{(e&jr)!==0?wp(n):zd(n),Bd(n);var a=Yd(n);n.teardown=typeof a=="function"?a:null,n.wv=Xd;var l;Pc&&ip&&(n.f&Un)!==0&&n.deps}finally{yi=r,Ft=t}}}async function Pp(){await Promise.resolve(),sp()}function Ve(n){var e=n.f,t=(e&mn)!==0;if(Ct!==null&&!wr){var r=Ft!==null&&(Ft.f&Vr)!==0;if(!r&&!Wr?.includes(n)){var a=Ct.deps;if((Ct.f&Lc)!==0)n.rv<po&&(n.rv=po,Tn===null&&a!==null&&a[Bn]===n?Bn++:Tn===null?Tn=[n]:Tn.includes(n)||Tn.push(n));else{(Ct.deps??=[]).push(n);var l=n.reactions;l===null?n.reactions=[Ct]:l.includes(Ct)||l.push(Ct)}}}if(ji){if(xi.has(n))return xi.get(n);if(t){var u=n,o=u.v;return((u.f&yn)===0&&u.reactions!==null||Kd(u))&&(o=kf(u)),xi.set(u,o),o}}else if(t){if(u=n,Gn?.has(u))return Gn.get(u);wo(u)&&Cd(u),yi&&Ws()&&(u.f&mr)===0&&jd(u)}else if(Gn?.has(n))return Gn.get(n);if((n.f&vi)!==0)throw n.v;return n.v}function jd(n){if(n.deps!==null){n.f^=mr;for(const e of n.deps)(e.reactions??=[]).push(n),(e.f&mn)!==0&&(e.f&mr)===0&&jd(e)}}function Kd(n){if(n.v===vn)return!0;if(n.deps===null)return!1;for(const e of n.deps)if(xi.has(e)||(e.f&mn)!==0&&Kd(e))return!0;return!1}function xn(n){var e=wr;try{return wr=!0,n()}finally{wr=e}}const Dp=-7169;function Sn(n,e){n.f=n.f&Dp|e}function Lp(n){if(!(typeof n!="object"||!n||n instanceof EventTarget)){if(Ta in n)Nc(n);else if(!Array.isArray(n))for(let e in n){const t=n[e];typeof t=="object"&&t&&Ta in t&&Nc(t)}}}function Nc(n,e=new Set){if(typeof n=="object"&&n!==null&&!(n instanceof EventTarget)&&!e.has(n)){e.add(n),n instanceof Date&&n.getTime();for(let r in n)try{Nc(n[r],e)}catch{}const t=Df(n);if(t!==Object.prototype&&t!==Array.prototype&&t!==Map.prototype&&t!==Set.prototype&&t!==Date.prototype){const r=pd(t);for(let a in r){const l=r[a].get;if(l)try{l.call(n)}catch{}}}}}const Fp=["touchstart","touchmove"];function Ip(n){return Fp.includes(n)}const Up=new Set,cu=new Set;function Np(n,e,t,r={}){function a(l){if(r.capture||so.call(e,l),!l.cancelBubble)return Vs(()=>t?.call(this,l))}return n.startsWith("pointer")||n.startsWith("touch")||n==="wheel"?zs(()=>{e.addEventListener(n,a,r)}):e.addEventListener(n,a,r),a}function Dn(n,e,t,r,a){var l={capture:r,passive:a},u=Np(n,e,t,l);(e===document.body||e===window||e===document||e instanceof HTMLMediaElement)&&Od(()=>{e.removeEventListener(n,u,l)})}let fu=null;function so(n){var e=this,t=e.ownerDocument,r=n.type,a=n.composedPath?.()||[],l=a[0]||n.target;fu=n;var u=0,o=fu===n&&n.__root;if(o){var p=a.indexOf(o);if(p!==-1&&(e===document||e===window)){n.__root=e;return}var m=a.indexOf(e);if(m===-1)return;p<=m&&(u=p)}if(l=a[u]||n.target,l!==e){Ih(n,"currentTarget",{configurable:!0,get(){return l||t}});var x=Ct,v=Ft;Ln(null),Cr(null);try{for(var y,S=[];l!==null;){var T=l.assignedSlot||l.parentNode||l.host||null;try{var F=l["__"+r];F!=null&&(!l.disabled||n.target===l)&&F.call(l,n)}catch(E){y?S.push(E):y=E}if(n.cancelBubble||T===e||T===null)break;l=T}if(y){for(let E of S)queueMicrotask(()=>{throw E});throw y}}finally{n.__root=e,delete n.currentTarget,Ln(x),Cr(v)}}}function Zd(n){var e=document.createElement("template");return e.innerHTML=n.replaceAll("<!>","<!---->"),e.content}function Jd(n,e){var t=Ft;t.nodes_start===null&&(t.nodes_start=n,t.nodes_end=e)}function Qr(n,e){var t=(e&ep)!==0,r,a=!n.startsWith("<!>");return()=>{r===void 0&&(r=Zd(a?n:"<!>"+n),r=Ls(r));var l=t||Dd?document.importNode(r,!0):r.cloneNode(!0);return Jd(l,l),l}}function Op(n,e,t="svg"){var r=!n.startsWith("<!>"),a=`<${t}>${r?n:"<!>"+n}</${t}>`,l;return()=>{if(!l){var u=Zd(a),o=Ls(u);l=Ls(o)}var p=l.cloneNode(!0);return Jd(p,p),p}}function kp(n,e){return Op(n,e,"svg")}function br(n,e){n!==null&&n.before(e)}function Pi(n,e){var t=e==null?"":typeof e=="object"?e+"":e;t!==(n.__t??=n.nodeValue)&&(n.__t=t,n.nodeValue=t+"")}function Bp(n,e){return zp(n,e)}const la=new Map;function zp(n,{target:e,anchor:t,props:r={},events:a,context:l,intro:u=!0}){vp();var o=new Set,p=v=>{for(var y=0;y<v.length;y++){var S=v[y];if(!o.has(S)){o.add(S);var T=Ip(S);e.addEventListener(S,so,{passive:T});var F=la.get(S);F===void 0?(document.addEventListener(S,so,{passive:T}),la.set(S,1)):la.set(S,F+1)}}};p(Pf(Up)),cu.add(p);var m=void 0,x=Ep(()=>{var v=t??e.appendChild(qi());return up(v,{pending:()=>{}},y=>{if(l){If({});var S=Kt;S.c=l}a&&(r.$$events=a),m=n(y,r)||{},l&&Uf()}),()=>{for(var y of o){e.removeEventListener(y,so);var S=la.get(y);--S===0?(document.removeEventListener(y,so),la.delete(y)):la.set(y,S)}cu.delete(p),v!==t&&v.parentNode?.removeChild(v)}});return Gp.set(m,x),m}let Gp=new WeakMap;class Hp{anchor;#e=new Map;#t=new Map;#r=new Map;#n=new Set;#l=!0;constructor(e,t=!0){this.anchor=e,this.#l=t}#a=()=>{var e=Vt;if(this.#e.has(e)){var t=this.#e.get(e),r=this.#t.get(t);if(r)Hf(r),this.#n.delete(t);else{var a=this.#r.get(t);a&&(this.#t.set(t,a.effect),this.#r.delete(t),a.fragment.lastChild.remove(),this.anchor.before(a.fragment),r=a.effect)}for(const[l,u]of this.#e){if(this.#e.delete(l),l===e)break;const o=this.#r.get(u);o&&(Fn(o.effect),this.#r.delete(u))}for(const[l,u]of this.#t){if(l===t||this.#n.has(l))continue;const o=()=>{if(Array.from(this.#e.values()).includes(l)){var m=document.createDocumentFragment();Wd(u,m),m.append(qi()),this.#r.set(l,{effect:u,fragment:m})}else Fn(u);this.#n.delete(l),this.#t.delete(l)};this.#l||!r?(this.#n.add(l),Aa(u,o,!1)):o()}}};#i=e=>{this.#e.delete(e);const t=Array.from(this.#e.values());for(const[r,a]of this.#r)t.includes(r)||(Fn(a.effect),this.#r.delete(r))};ensure(e,t){var r=Vt,a=Id();if(t&&!this.#t.has(e)&&!this.#r.has(e))if(a){var l=document.createDocumentFragment(),u=qi();l.append(u),this.#r.set(e,{effect:Kn(()=>t(u)),fragment:l})}else this.#t.set(e,Kn(()=>t(this.anchor)));if(this.#e.set(r,e),a){for(const[o,p]of this.#t)o===e?r.skipped_effects.delete(p):r.skipped_effects.add(p);for(const[o,p]of this.#r)o===e?r.skipped_effects.delete(p.effect):r.skipped_effects.add(p.effect);r.oncommit(this.#a),r.ondiscard(this.#i)}else this.#a()}}function lo(n,e,t=!1){var r=new Hp(n),a=t?Pa:0;function l(u,o){r.ensure(u,o)}zf(()=>{var u=!1;e((o,p=!0)=>{u=!0,l(p,o)}),u||l(!1,null)},a)}function Vp(n,e){return e}function Wp(n,e,t){for(var r=[],a=e.length,l=0;l<a;l++)Gf(e[l].e,r,!0);Hd(r,()=>{var u=r.length===0&&t!==null;if(u){var o=t,p=o.parentNode;xp(p),p.append(o),n.items.clear(),Sr(n,e[0].prev,e[a-1].next)}for(var m=0;m<a;m++){var x=e[m];u||(n.items.delete(x.k),Sr(n,x.prev,x.next)),Fn(x.e,!u)}n.first===e[0]&&(n.first=e[0].prev)})}function Xp(n,e,t,r,a,l=null){var u=n,o=new Map,p=null;{var m=n;u=m.appendChild(qi())}var x=null,v=Of(()=>{var b=t();return Rf(b)?b:b==null?[]:Pf(b)}),y,S=!0;function T(){$p(E,y,u,e,r),x!==null&&(y.length===0?(x.fragment?(u.before(x.fragment),x.fragment=null):Hf(x.effect),F.first=x.effect):Aa(x.effect,()=>{x=null}))}var F=zf(()=>{y=Ve(v);for(var b=y.length,H=new Set,V=Vt,X=null,I=Id(),C=0;C<b;C+=1){var L=y[C],W=r(L,C),P=S?null:o.get(W);P?(ho(P.v,L),P.i=C,I&&V.skipped_effects.delete(P.e)):(P=qp(S?u:null,X,L,W,C,a,e,t),S&&(P.o=!0,X===null?p=P:X.next=P,X=P),o.set(W,P)),H.add(W)}if(b===0&&l&&!x)if(S)x={fragment:null,effect:Kn(()=>l(u))};else{var w=document.createDocumentFragment(),z=qi();w.append(z),x={fragment:w,effect:Kn(()=>l(z))}}if(!S)if(I){for(const[B,Y]of o)H.has(B)||V.skipped_effects.add(Y.e);V.oncommit(T),V.ondiscard(()=>{})}else T();Ve(v)}),E={effect:F,items:o,first:p};S=!1}function $p(n,e,t,r,a){var l=e.length,u=n.items,o=n.first,p,m=null,x=[],v=[],y,S,T,F;for(F=0;F<l;F+=1){if(y=e[F],S=a(y,F),T=u.get(S),n.first??=T,!T.o){T.o=!0;var E=m?m.next:o;Sr(n,m,T),Sr(n,T,E),Yl(T,E,t),m=T,x=[],v=[],o=m.next;continue}if((T.e.f&Vn)!==0&&Hf(T.e),T!==o){if(p!==void 0&&p.has(T)){if(x.length<v.length){var b=v[0],H;m=b.prev;var V=x[0],X=x[x.length-1];for(H=0;H<x.length;H+=1)Yl(x[H],b,t);for(H=0;H<v.length;H+=1)p.delete(v[H]);Sr(n,V.prev,X.next),Sr(n,m,V),Sr(n,X,b),o=b,m=X,F-=1,x=[],v=[]}else p.delete(T),Yl(T,o,t),Sr(n,T.prev,T.next),Sr(n,T,m===null?n.first:m.next),Sr(n,m,T),m=T;continue}for(x=[],v=[];o!==null&&o.k!==S;)(o.e.f&Vn)===0&&(p??=new Set).add(o),v.push(o),o=o.next;if(o===null)continue;T=o}x.push(T),m=T,o=T.next}if(o!==null||p!==void 0){for(var I=p===void 0?[]:Pf(p);o!==null;)(o.e.f&Vn)===0&&I.push(o),o=o.next;var C=I.length;if(C>0){var L=l===0?t:null;Wp(n,I,L)}}}function qp(n,e,t,r,a,l,u,o){var p=(u&jh)!==0,m=(u&Zh)===0,x=p?m?ur(t,!1,!1):$i(t):t,v=(u&Kh)===0?a:$i(a),y={i:v,v:x,k:r,a:null,e:null,o:!1,prev:e,next:null};try{if(n===null){var S=document.createDocumentFragment();S.append(n=qi())}return y.e=Kn(()=>l(n,x,v,o)),e!==null&&(e.next=y),y}finally{}}function Yl(n,e,t){for(var r=n.next?n.next.e.nodes_start:t,a=e?e.e.nodes_start:t,l=n.e.nodes_start;l!==null&&l!==r;){var u=Hs(l);a.before(l),l=u}}function Sr(n,e,t){e===null?(n.first=t,n.effect.first=t&&t.e):(e.e.next&&(e.e.next.prev=null),e.next=t,e.e.next=t&&t.e),t===null?n.effect.last=e&&e.e:(t.e.prev&&(t.e.prev.next=null),t.prev=e,t.e.prev=e&&e.e)}const uu=[...` 	
\r\f \v\uFEFF`];function Yp(n,e,t){var r=n==null?"":""+n;if(t){for(var a in t)if(t[a])r=r?r+" "+a:a;else if(r.length)for(var l=a.length,u=0;(u=r.indexOf(a,u))>=0;){var o=u+l;(u===0||uu.includes(r[u-1]))&&(o===r.length||uu.includes(r[o]))?r=(u===0?"":r.substring(0,u))+r.substring(o+1):u=o}}return r===""?null:r}function Oc(n,e,t,r,a,l){var u=n.__className;if(u!==t||u===void 0){var o=Yp(t,r,l);o==null?n.removeAttribute("class"):n.className=o,n.__className=t}else if(l&&a!==l)for(var p in l){var m=!!l[p];(a==null||m!==!!a[p])&&n.classList.toggle(p,m)}return l}const jp=Symbol("is custom element"),Kp=Symbol("is html");function Zp(n,e,t,r){var a=Jp(n);a[e]!==(a[e]=t)&&(t==null?n.removeAttribute(e):typeof t!="string"&&Qp(n).includes(e)?n[e]=t:n.setAttribute(e,t))}function Jp(n){return n.__attributes??={[jp]:n.nodeName.includes("-"),[Kp]:n.namespaceURI===tp}}var du=new Map;function Qp(n){var e=n.getAttribute("is")||n.nodeName,t=du.get(e);if(t)return t;du.set(e,t=[]);for(var r,a=n,l=Element.prototype;l!==a;){r=pd(a);for(var u in r)r[u].set&&t.push(u);a=Df(a)}return t}function hu(n,e,t=e){var r=new WeakSet;Ud(n,"input",async a=>{var l=a?n.defaultValue:n.value;if(l=jl(n)?Kl(l):l,t(l),Vt!==null&&r.add(Vt),await Pp(),l!==(l=e())){var u=n.selectionStart,o=n.selectionEnd,p=n.value.length;if(n.value=l??"",o!==null){var m=n.value.length;u===o&&o===p&&m>p?(n.selectionStart=m,n.selectionEnd=m):(n.selectionStart=u,n.selectionEnd=Math.min(o,m))}}}),xn(e)==null&&n.value&&(t(jl(n)?Kl(n.value):n.value),Vt!==null&&r.add(Vt)),Bf(()=>{var a=e();if(n===document.activeElement){var l=ws??Vt;if(r.has(l))return}jl(n)&&a===Kl(n.value)||n.type==="date"&&!a&&!n.value||a!==n.value&&(n.value=a??"")})}function em(n,e,t=e){Ud(n,"change",r=>{var a=r?n.defaultChecked:n.checked;t(a)}),xn(e)==null&&t(n.checked),Bf(()=>{var r=e();n.checked=!!r})}function jl(n){var e=n.type;return e==="number"||e==="range"}function Kl(n){return n===""?null:+n}function Qd(n=!1){const e=Kt,t=e.l.u;if(!t)return;let r=()=>Lp(e.s);if(n){let a=0,l={};const u=Nf(()=>{let o=!1;const p=e.s;for(const m in p)p[m]!==l[m]&&(l[m]=p[m],o=!0);return o&&a++,a});r=()=>Ve(u)}t.b.length&&bp(()=>{pu(e,r),Dc(t.b)}),Uc(()=>{const a=xn(()=>t.m.map(Oh));return()=>{for(const l of a)typeof l=="function"&&l()}}),t.a.length&&Uc(()=>{pu(e,r),Dc(t.a)})}function pu(n,e){if(n.l.s)for(const t of n.l.s)Ve(t);e()}let Qo=!1;function tm(n){var e=Qo;try{return Qo=!1,[n(),Qo]}finally{Qo=e}}function nm(n,e,t,r){var a=!ka||(t&Jh)!==0,l=(t&Qh)!==0,u=r,o=!0,p=()=>(o&&(o=!1,u=xn(r)),u),m;{var x=Ta in n||kh in n;m=wa(n,e)?.set??(x&&e in n?H=>n[e]=H:void 0)}var v,y=!1;[v,y]=tm(()=>n[e]),v===void 0&&r!==void 0&&(v=p(),m&&(a&&Wh(),m(v)));var S;if(a?S=()=>{var H=n[e];return H===void 0?p():(o=!0,H)}:S=()=>{var H=n[e];return H!==void 0&&(u=void 0),H===void 0?u:H},m){var T=n.$$legacy;return(function(H,V){return arguments.length>0?((!a||!V||T||y)&&m(V?S():H),H):S()})}var F=!1,E=Of(()=>(F=!1,S()));Ve(E);var b=Ft;return(function(H,V){if(arguments.length>0){const X=V?Ve(E):a&&l?Ma(H):H;return wt(E,X),F=!0,u!==void 0&&(u=X),H}return ji&&F||(b.f&Vr)!==0?E.v:Ve(E)})}function rm(n){Kt===null&&xd(),ka&&Kt.l!==null?am(Kt).m.push(n):Uc(()=>{const e=xn(n);if(typeof e=="function")return e})}function im(n,e,{bubbles:t=!1,cancelable:r=!1}={}){return new CustomEvent(n,{detail:e,bubbles:t,cancelable:r})}function eh(){const n=Kt;return n===null&&xd(),(e,t,r)=>{const a=n.s.$$events?.[e];if(a){const l=Rf(a)?a.slice():[a],u=im(e,t,r);for(const o of l)o.call(n.x,u);return!u.defaultPrevented}return!0}}function am(n){var e=n.l;return e.u??={a:[],b:[],m:[]}}const om="5";typeof window<"u"&&((window.__svelte??={}).v??=new Set).add(om);ap();var sm=Qr('<div role="button" tabindex="0" aria-label="Upload images"><input type="file" id="file-input" multiple accept="image/*,.heic,.heif" hidden=""/> <label for="file-input" class="drop-label svelte-ch8vdo"><div class="icon svelte-ch8vdo"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 svelte-ch8vdo"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"></path></svg></div> <p class="svelte-ch8vdo">Drag & Drop images here or <span class="highlight svelte-ch8vdo">Browse</span></p> <p class="subtext svelte-ch8vdo">Supports JPEG, PNG, WebP, HEIC, HEIF</p></label></div>');function lm(n,e){If(e,!1);const t=eh();let r=ur(!1);function a(v){v.preventDefault(),wt(r,!0)}function l(){wt(r,!1)}function u(v){v.preventDefault(),wt(r,!1),v.dataTransfer.files&&v.dataTransfer.files.length>0&&t("files",v.dataTransfer.files)}function o(v){v.target.files&&v.target.files.length>0&&t("files",v.target.files)}Qd();var p=sm();let m;var x=Nt(p);oo(()=>m=Oc(p,1,"drop-zone svelte-ch8vdo",null,m,{active:Ve(r)})),Dn("change",x,o),Dn("dragover",p,a),Dn("dragleave",p,l),Dn("drop",p,u),br(n,p),Uf()}const cm=async(n,e,t)=>{if(typeof OffscreenCanvas<"u"&&n instanceof OffscreenCanvas)return n.convertToBlob({type:e,quality:t});if(n instanceof HTMLCanvasElement)return new Promise((r,a)=>{n.toBlob(l=>{l?r(l):a(new Error("Failed to convert canvas to blob"))},e,t)});throw new Error("Unsupported canvas element")},mu=async n=>{if(typeof createImageBitmap>"u")throw new Error("createImageBitmap() not supported.");const{source:e,mimeType:t,quality:r,flipY:a}=n;let l;if((e instanceof Uint8Array||e instanceof Uint8ClampedArray)&&"sourceMimeType"in n)l=new Blob([e],{type:n.sourceMimeType});else if(e instanceof ImageData)l=e;else throw new Error("Invalid source image");const u=await createImageBitmap(l),o=u.width,p=u.height;let m;typeof OffscreenCanvas<"u"?m=new OffscreenCanvas(o,p):(m=document.createElement("canvas"),m.width=o,m.height=p);const x=m.getContext("2d");if(!x)throw new Error("Failed to create canvas Context");a===!0&&(x.translate(0,p),x.scale(1,-1)),x.drawImage(u,0,0,o,p);const v=await cm(m,t,r||.9);return{data:new Uint8Array(await v.arrayBuffer()),mimeType:t,width:o,height:p}};const Vf="181",fm=0,_u=1,um=2,th=1,dm=2,Br=3,Si=0,In=1,Gr=2,pr=0,Ca=1,gu=2,vu=3,xu=4,hm=5,ki=100,pm=101,mm=102,_m=103,gm=104,vm=200,xm=201,ym=202,Sm=203,kc=204,Bc=205,bm=206,Em=207,Mm=208,wm=209,Tm=210,Am=211,Cm=212,Rm=213,Pm=214,zc=0,Gc=1,Hc=2,Fa=3,Vc=4,Wc=5,Xc=6,$c=7,nh=0,Dm=1,Lm=2,Xr=0,qc=1,rh=2,ih=3,Yc=4,Fm=5,Im=6,Um=7,_o=300,Ia=301,Ua=302,jc=303,Kc=304,Xs=306,go=1e3,Hn=1001,Zc=1002,Wn=1003,Nm=1004,es=1005,un=1006,Zl=1007,Gi=1008,Jn=1009,Wf=1010,Xf=1011,vo=1012,$s=1013,bi=1014,Zn=1015,ei=1016,$f=1017,qf=1018,xo=1020,ah=35902,oh=35899,sh=1021,lh=1022,An=1023,yo=1026,So=1027,ch=1028,Yf=1029,jf=1030,Kf=1031,Zf=1033,Ts=33776,As=33777,Cs=33778,Rs=33779,Jc=35840,Qc=35841,ef=35842,tf=35843,nf=36196,rf=37492,af=37496,of=37808,sf=37809,lf=37810,cf=37811,ff=37812,uf=37813,df=37814,hf=37815,pf=37816,mf=37817,_f=37818,gf=37819,vf=37820,xf=37821,yf=36492,Sf=36494,bf=36495,Ef=36283,Mf=36284,wf=36285,Tf=36286,Om=3200,km=3201,Bm=0,zm=1,_i="",zn="srgb",Rr="srgb-linear",Us="linear",Bt="srgb",ca=7680,yu=519,Gm=512,Hm=513,Vm=514,fh=515,Wm=516,Xm=517,$m=518,qm=519,Su=35044,bu="300 es",Tr=2e3,Ns=2001;function uh(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Os(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Ym(){const n=Os("canvas");return n.style.display="block",n}const Eu={};function Mu(...n){const e="THREE."+n.shift();console.log(e,...n)}function pt(...n){const e="THREE."+n.shift();console.warn(e,...n)}function Jt(...n){const e="THREE."+n.shift();console.error(e,...n)}function bo(...n){const e=n.join(" ");e in Eu||(Eu[e]=!0,pt(...n))}function jm(n,e,t){return new Promise(function(r,a){function l(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:a();break;case n.TIMEOUT_EXPIRED:setTimeout(l,t);break;default:r()}}setTimeout(l,t)})}class Ba{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){const r=this._listeners;return r===void 0?!1:r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){const r=this._listeners;if(r===void 0)return;const a=r[e];if(a!==void 0){const l=a.indexOf(t);l!==-1&&a.splice(l,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const r=t[e.type];if(r!==void 0){e.target=this;const a=r.slice(0);for(let l=0,u=a.length;l<u;l++)a[l].call(this,e);e.target=null}}}const _n=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Jl=Math.PI/180,Af=180/Math.PI;function To(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(_n[n&255]+_n[n>>8&255]+_n[n>>16&255]+_n[n>>24&255]+"-"+_n[e&255]+_n[e>>8&255]+"-"+_n[e>>16&15|64]+_n[e>>24&255]+"-"+_n[t&63|128]+_n[t>>8&255]+"-"+_n[t>>16&255]+_n[t>>24&255]+_n[r&255]+_n[r>>8&255]+_n[r>>16&255]+_n[r>>24&255]).toLowerCase()}function bt(n,e,t){return Math.max(e,Math.min(t,n))}function Km(n,e){return(n%e+e)%e}function Ql(n,e,t){return(1-t)*n+t*e}function Qa(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Pn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class Gt{constructor(e=0,t=0){Gt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,r=this.y,a=e.elements;return this.x=a[0]*t+a[3]*r+a[6],this.y=a[1]*t+a[4]*r+a[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=bt(this.x,e.x,t.x),this.y=bt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=bt(this.x,e,t),this.y=bt(this.y,e,t),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(bt(r,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(bt(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y;return t*t+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const r=Math.cos(t),a=Math.sin(t),l=this.x-e.x,u=this.y-e.y;return this.x=l*r-u*a+e.x,this.y=l*a+u*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ao{constructor(e=0,t=0,r=0,a=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=a}static slerpFlat(e,t,r,a,l,u,o){let p=r[a+0],m=r[a+1],x=r[a+2],v=r[a+3],y=l[u+0],S=l[u+1],T=l[u+2],F=l[u+3];if(o<=0){e[t+0]=p,e[t+1]=m,e[t+2]=x,e[t+3]=v;return}if(o>=1){e[t+0]=y,e[t+1]=S,e[t+2]=T,e[t+3]=F;return}if(v!==F||p!==y||m!==S||x!==T){let E=p*y+m*S+x*T+v*F;E<0&&(y=-y,S=-S,T=-T,F=-F,E=-E);let b=1-o;if(E<.9995){const H=Math.acos(E),V=Math.sin(H);b=Math.sin(b*H)/V,o=Math.sin(o*H)/V,p=p*b+y*o,m=m*b+S*o,x=x*b+T*o,v=v*b+F*o}else{p=p*b+y*o,m=m*b+S*o,x=x*b+T*o,v=v*b+F*o;const H=1/Math.sqrt(p*p+m*m+x*x+v*v);p*=H,m*=H,x*=H,v*=H}}e[t]=p,e[t+1]=m,e[t+2]=x,e[t+3]=v}static multiplyQuaternionsFlat(e,t,r,a,l,u){const o=r[a],p=r[a+1],m=r[a+2],x=r[a+3],v=l[u],y=l[u+1],S=l[u+2],T=l[u+3];return e[t]=o*T+x*v+p*S-m*y,e[t+1]=p*T+x*y+m*v-o*S,e[t+2]=m*T+x*S+o*y-p*v,e[t+3]=x*T-o*v-p*y-m*S,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,a){return this._x=e,this._y=t,this._z=r,this._w=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const r=e._x,a=e._y,l=e._z,u=e._order,o=Math.cos,p=Math.sin,m=o(r/2),x=o(a/2),v=o(l/2),y=p(r/2),S=p(a/2),T=p(l/2);switch(u){case"XYZ":this._x=y*x*v+m*S*T,this._y=m*S*v-y*x*T,this._z=m*x*T+y*S*v,this._w=m*x*v-y*S*T;break;case"YXZ":this._x=y*x*v+m*S*T,this._y=m*S*v-y*x*T,this._z=m*x*T-y*S*v,this._w=m*x*v+y*S*T;break;case"ZXY":this._x=y*x*v-m*S*T,this._y=m*S*v+y*x*T,this._z=m*x*T+y*S*v,this._w=m*x*v-y*S*T;break;case"ZYX":this._x=y*x*v-m*S*T,this._y=m*S*v+y*x*T,this._z=m*x*T-y*S*v,this._w=m*x*v+y*S*T;break;case"YZX":this._x=y*x*v+m*S*T,this._y=m*S*v+y*x*T,this._z=m*x*T-y*S*v,this._w=m*x*v-y*S*T;break;case"XZY":this._x=y*x*v-m*S*T,this._y=m*S*v-y*x*T,this._z=m*x*T+y*S*v,this._w=m*x*v+y*S*T;break;default:pt("Quaternion: .setFromEuler() encountered an unknown order: "+u)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const r=t/2,a=Math.sin(r);return this._x=e.x*a,this._y=e.y*a,this._z=e.z*a,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,r=t[0],a=t[4],l=t[8],u=t[1],o=t[5],p=t[9],m=t[2],x=t[6],v=t[10],y=r+o+v;if(y>0){const S=.5/Math.sqrt(y+1);this._w=.25/S,this._x=(x-p)*S,this._y=(l-m)*S,this._z=(u-a)*S}else if(r>o&&r>v){const S=2*Math.sqrt(1+r-o-v);this._w=(x-p)/S,this._x=.25*S,this._y=(a+u)/S,this._z=(l+m)/S}else if(o>v){const S=2*Math.sqrt(1+o-r-v);this._w=(l-m)/S,this._x=(a+u)/S,this._y=.25*S,this._z=(p+x)/S}else{const S=2*Math.sqrt(1+v-r-o);this._w=(u-a)/S,this._x=(l+m)/S,this._y=(p+x)/S,this._z=.25*S}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<1e-8?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(bt(this.dot(e),-1,1)))}rotateTowards(e,t){const r=this.angleTo(e);if(r===0)return this;const a=Math.min(1,t/r);return this.slerp(e,a),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const r=e._x,a=e._y,l=e._z,u=e._w,o=t._x,p=t._y,m=t._z,x=t._w;return this._x=r*x+u*o+a*m-l*p,this._y=a*x+u*p+l*o-r*m,this._z=l*x+u*m+r*p-a*o,this._w=u*x-r*o-a*p-l*m,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let r=e._x,a=e._y,l=e._z,u=e._w,o=this.dot(e);o<0&&(r=-r,a=-a,l=-l,u=-u,o=-o);let p=1-t;if(o<.9995){const m=Math.acos(o),x=Math.sin(m);p=Math.sin(p*m)/x,t=Math.sin(t*m)/x,this._x=this._x*p+r*t,this._y=this._y*p+a*t,this._z=this._z*p+l*t,this._w=this._w*p+u*t,this._onChangeCallback()}else this._x=this._x*p+r*t,this._y=this._y*p+a*t,this._z=this._z*p+l*t,this._w=this._w*p+u*t,this.normalize();return this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),r=Math.random(),a=Math.sqrt(1-r),l=Math.sqrt(r);return this.set(a*Math.sin(e),a*Math.cos(e),l*Math.sin(t),l*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class le{constructor(e=0,t=0,r=0){le.prototype.isVector3=!0,this.x=e,this.y=t,this.z=r}set(e,t,r){return r===void 0&&(r=this.z),this.x=e,this.y=t,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(wu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(wu.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,r=this.y,a=this.z,l=e.elements;return this.x=l[0]*t+l[3]*r+l[6]*a,this.y=l[1]*t+l[4]*r+l[7]*a,this.z=l[2]*t+l[5]*r+l[8]*a,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,r=this.y,a=this.z,l=e.elements,u=1/(l[3]*t+l[7]*r+l[11]*a+l[15]);return this.x=(l[0]*t+l[4]*r+l[8]*a+l[12])*u,this.y=(l[1]*t+l[5]*r+l[9]*a+l[13])*u,this.z=(l[2]*t+l[6]*r+l[10]*a+l[14])*u,this}applyQuaternion(e){const t=this.x,r=this.y,a=this.z,l=e.x,u=e.y,o=e.z,p=e.w,m=2*(u*a-o*r),x=2*(o*t-l*a),v=2*(l*r-u*t);return this.x=t+p*m+u*v-o*x,this.y=r+p*x+o*m-l*v,this.z=a+p*v+l*x-u*m,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,r=this.y,a=this.z,l=e.elements;return this.x=l[0]*t+l[4]*r+l[8]*a,this.y=l[1]*t+l[5]*r+l[9]*a,this.z=l[2]*t+l[6]*r+l[10]*a,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=bt(this.x,e.x,t.x),this.y=bt(this.y,e.y,t.y),this.z=bt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=bt(this.x,e,t),this.y=bt(this.y,e,t),this.z=bt(this.z,e,t),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(bt(r,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const r=e.x,a=e.y,l=e.z,u=t.x,o=t.y,p=t.z;return this.x=a*p-l*o,this.y=l*u-r*p,this.z=r*o-a*u,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const r=e.dot(this)/t;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return ec.copy(this).projectOnVector(e),this.sub(ec)}reflect(e){return this.sub(ec.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(bt(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y,a=this.z-e.z;return t*t+r*r+a*a}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,r){const a=Math.sin(t)*e;return this.x=a*Math.sin(r),this.y=Math.cos(t)*e,this.z=a*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,r){return this.x=e*Math.sin(t),this.y=r,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),a=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=r,this.z=a,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,r=Math.sqrt(1-t*t);return this.x=r*Math.cos(e),this.y=t,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ec=new le,wu=new Ao;class _t{constructor(e,t,r,a,l,u,o,p,m){_t.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,r,a,l,u,o,p,m)}set(e,t,r,a,l,u,o,p,m){const x=this.elements;return x[0]=e,x[1]=a,x[2]=o,x[3]=t,x[4]=l,x[5]=p,x[6]=r,x[7]=u,x[8]=m,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],this}extractBasis(e,t,r){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,a=t.elements,l=this.elements,u=r[0],o=r[3],p=r[6],m=r[1],x=r[4],v=r[7],y=r[2],S=r[5],T=r[8],F=a[0],E=a[3],b=a[6],H=a[1],V=a[4],X=a[7],I=a[2],C=a[5],L=a[8];return l[0]=u*F+o*H+p*I,l[3]=u*E+o*V+p*C,l[6]=u*b+o*X+p*L,l[1]=m*F+x*H+v*I,l[4]=m*E+x*V+v*C,l[7]=m*b+x*X+v*L,l[2]=y*F+S*H+T*I,l[5]=y*E+S*V+T*C,l[8]=y*b+S*X+T*L,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],u=e[4],o=e[5],p=e[6],m=e[7],x=e[8];return t*u*x-t*o*m-r*l*x+r*o*p+a*l*m-a*u*p}invert(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],u=e[4],o=e[5],p=e[6],m=e[7],x=e[8],v=x*u-o*m,y=o*p-x*l,S=m*l-u*p,T=t*v+r*y+a*S;if(T===0)return this.set(0,0,0,0,0,0,0,0,0);const F=1/T;return e[0]=v*F,e[1]=(a*m-x*r)*F,e[2]=(o*r-a*u)*F,e[3]=y*F,e[4]=(x*t-a*p)*F,e[5]=(a*l-o*t)*F,e[6]=S*F,e[7]=(r*p-m*t)*F,e[8]=(u*t-r*l)*F,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,r,a,l,u,o){const p=Math.cos(l),m=Math.sin(l);return this.set(r*p,r*m,-r*(p*u+m*o)+u+e,-a*m,a*p,-a*(-m*u+p*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(tc.makeScale(e,t)),this}rotate(e){return this.premultiply(tc.makeRotation(-e)),this}translate(e,t){return this.premultiply(tc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,r,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,r=e.elements;for(let a=0;a<9;a++)if(t[a]!==r[a])return!1;return!0}fromArray(e,t=0){for(let r=0;r<9;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const tc=new _t,Tu=new _t().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Au=new _t().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Zm(){const n={enabled:!0,workingColorSpace:Rr,spaces:{},convert:function(a,l,u){return this.enabled===!1||l===u||!l||!u||(this.spaces[l].transfer===Bt&&(a.r=$r(a.r),a.g=$r(a.g),a.b=$r(a.b)),this.spaces[l].primaries!==this.spaces[u].primaries&&(a.applyMatrix3(this.spaces[l].toXYZ),a.applyMatrix3(this.spaces[u].fromXYZ)),this.spaces[u].transfer===Bt&&(a.r=Ra(a.r),a.g=Ra(a.g),a.b=Ra(a.b))),a},workingToColorSpace:function(a,l){return this.convert(a,this.workingColorSpace,l)},colorSpaceToWorking:function(a,l){return this.convert(a,l,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){return a===_i?Us:this.spaces[a].transfer},getToneMappingMode:function(a){return this.spaces[a].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(a,l=this.workingColorSpace){return a.fromArray(this.spaces[l].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,l,u){return a.copy(this.spaces[l].toXYZ).multiply(this.spaces[u].fromXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(a,l){return bo("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(a,l)},toWorkingColorSpace:function(a,l){return bo("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(a,l)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],r=[.3127,.329];return n.define({[Rr]:{primaries:e,whitePoint:r,transfer:Us,toXYZ:Tu,fromXYZ:Au,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:zn},outputColorSpaceConfig:{drawingBufferColorSpace:zn}},[zn]:{primaries:e,whitePoint:r,transfer:Bt,toXYZ:Tu,fromXYZ:Au,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:zn}}}),n}const Rt=Zm();function $r(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ra(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let fa;class Jm{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let r;if(e instanceof HTMLCanvasElement)r=e;else{fa===void 0&&(fa=Os("canvas")),fa.width=e.width,fa.height=e.height;const a=fa.getContext("2d");e instanceof ImageData?a.putImageData(e,0,0):a.drawImage(e,0,0,e.width,e.height),r=fa}return r.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Os("canvas");t.width=e.width,t.height=e.height;const r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const a=r.getImageData(0,0,e.width,e.height),l=a.data;for(let u=0;u<l.length;u++)l[u]=$r(l[u]/255)*255;return r.putImageData(a,0,0),t}else if(e.data){const t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor($r(t[r]/255)*255):t[r]=$r(t[r]);return{data:t,width:e.width,height:e.height}}else return pt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Qm=0;class Jf{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Qm++}),this.uuid=To(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},a=this.data;if(a!==null){let l;if(Array.isArray(a)){l=[];for(let u=0,o=a.length;u<o;u++)a[u].isDataTexture?l.push(nc(a[u].image)):l.push(nc(a[u]))}else l=nc(a);r.url=l}return t||(e.images[this.uuid]=r),r}}function nc(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Jm.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(pt("Texture: Unable to serialize Texture."),{})}let e0=0;const rc=new le;class pn extends Ba{constructor(e=pn.DEFAULT_IMAGE,t=pn.DEFAULT_MAPPING,r=Hn,a=Hn,l=un,u=Gi,o=An,p=Jn,m=pn.DEFAULT_ANISOTROPY,x=_i){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:e0++}),this.uuid=To(),this.name="",this.source=new Jf(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=r,this.wrapT=a,this.magFilter=l,this.minFilter=u,this.anisotropy=m,this.format=o,this.internalFormat=null,this.type=p,this.offset=new Gt(0,0),this.repeat=new Gt(1,1),this.center=new Gt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new _t,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=x,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(rc).x}get height(){return this.source.getSize(rc).y}get depth(){return this.source.getSize(rc).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const r=e[t];if(r===void 0){pt(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const a=this[t];if(a===void 0){pt(`Texture.setValues(): property '${t}' does not exist.`);continue}a&&r&&a.isVector2&&r.isVector2||a&&r&&a.isVector3&&r.isVector3||a&&r&&a.isMatrix3&&r.isMatrix3?a.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),t||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==_o)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case go:e.x=e.x-Math.floor(e.x);break;case Hn:e.x=e.x<0?0:1;break;case Zc:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case go:e.y=e.y-Math.floor(e.y);break;case Hn:e.y=e.y<0?0:1;break;case Zc:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}pn.DEFAULT_IMAGE=null;pn.DEFAULT_MAPPING=_o;pn.DEFAULT_ANISOTROPY=1;class Qt{constructor(e=0,t=0,r=0,a=1){Qt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=r,this.w=a}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,r,a){return this.x=e,this.y=t,this.z=r,this.w=a,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,r=this.y,a=this.z,l=this.w,u=e.elements;return this.x=u[0]*t+u[4]*r+u[8]*a+u[12]*l,this.y=u[1]*t+u[5]*r+u[9]*a+u[13]*l,this.z=u[2]*t+u[6]*r+u[10]*a+u[14]*l,this.w=u[3]*t+u[7]*r+u[11]*a+u[15]*l,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,r,a,l;const p=e.elements,m=p[0],x=p[4],v=p[8],y=p[1],S=p[5],T=p[9],F=p[2],E=p[6],b=p[10];if(Math.abs(x-y)<.01&&Math.abs(v-F)<.01&&Math.abs(T-E)<.01){if(Math.abs(x+y)<.1&&Math.abs(v+F)<.1&&Math.abs(T+E)<.1&&Math.abs(m+S+b-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const V=(m+1)/2,X=(S+1)/2,I=(b+1)/2,C=(x+y)/4,L=(v+F)/4,W=(T+E)/4;return V>X&&V>I?V<.01?(r=0,a=.707106781,l=.707106781):(r=Math.sqrt(V),a=C/r,l=L/r):X>I?X<.01?(r=.707106781,a=0,l=.707106781):(a=Math.sqrt(X),r=C/a,l=W/a):I<.01?(r=.707106781,a=.707106781,l=0):(l=Math.sqrt(I),r=L/l,a=W/l),this.set(r,a,l,t),this}let H=Math.sqrt((E-T)*(E-T)+(v-F)*(v-F)+(y-x)*(y-x));return Math.abs(H)<.001&&(H=1),this.x=(E-T)/H,this.y=(v-F)/H,this.z=(y-x)/H,this.w=Math.acos((m+S+b-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=bt(this.x,e.x,t.x),this.y=bt(this.y,e.y,t.y),this.z=bt(this.z,e.z,t.z),this.w=bt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=bt(this.x,e,t),this.y=bt(this.y,e,t),this.z=bt(this.z,e,t),this.w=bt(this.w,e,t),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(bt(r,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this.w=e.w+(t.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class t0 extends Ba{constructor(e=1,t=1,r={}){super(),r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:un,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},r),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=r.depth,this.scissor=new Qt(0,0,e,t),this.scissorTest=!1,this.viewport=new Qt(0,0,e,t);const a={width:e,height:t,depth:r.depth},l=new pn(a);this.textures=[];const u=r.count;for(let o=0;o<u;o++)this.textures[o]=l.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(r),this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=r.depthTexture,this.samples=r.samples,this.multiview=r.multiview}_setTextureOptions(e={}){const t={minFilter:un,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let r=0;r<this.textures.length;r++)this.textures[r].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,r=1){if(this.width!==e||this.height!==t||this.depth!==r){this.width=e,this.height=t,this.depth=r;for(let a=0,l=this.textures.length;a<l;a++)this.textures[a].image.width=e,this.textures[a].image.height=t,this.textures[a].image.depth=r,this.textures[a].isData3DTexture!==!0&&(this.textures[a].isArrayTexture=this.textures[a].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,r=e.textures.length;t<r;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const a=Object.assign({},e.textures[t].image);this.textures[t].source=new Jf(a)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class qr extends t0{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}}class dh extends pn{constructor(e=null,t=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=Wn,this.minFilter=Wn,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class n0 extends pn{constructor(e=null,t=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=Wn,this.minFilter=Wn,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Co{constructor(e=new le(1/0,1/0,1/0),t=new le(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(lr.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(lr.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const r=lr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const l=r.getAttribute("position");if(t===!0&&l!==void 0&&e.isInstancedMesh!==!0)for(let u=0,o=l.count;u<o;u++)e.isMesh===!0?e.getVertexPosition(u,lr):lr.fromBufferAttribute(l,u),lr.applyMatrix4(e.matrixWorld),this.expandByPoint(lr);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ts.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),ts.copy(r.boundingBox)),ts.applyMatrix4(e.matrixWorld),this.union(ts)}const a=e.children;for(let l=0,u=a.length;l<u;l++)this.expandByObject(a[l],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,lr),lr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(eo),ns.subVectors(this.max,eo),ua.subVectors(e.a,eo),da.subVectors(e.b,eo),ha.subVectors(e.c,eo),fi.subVectors(da,ua),ui.subVectors(ha,da),Di.subVectors(ua,ha);let t=[0,-fi.z,fi.y,0,-ui.z,ui.y,0,-Di.z,Di.y,fi.z,0,-fi.x,ui.z,0,-ui.x,Di.z,0,-Di.x,-fi.y,fi.x,0,-ui.y,ui.x,0,-Di.y,Di.x,0];return!ic(t,ua,da,ha,ns)||(t=[1,0,0,0,1,0,0,0,1],!ic(t,ua,da,ha,ns))?!1:(rs.crossVectors(fi,ui),t=[rs.x,rs.y,rs.z],ic(t,ua,da,ha,ns))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,lr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(lr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Fr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Fr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Fr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Fr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Fr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Fr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Fr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Fr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Fr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Fr=[new le,new le,new le,new le,new le,new le,new le,new le],lr=new le,ts=new Co,ua=new le,da=new le,ha=new le,fi=new le,ui=new le,Di=new le,eo=new le,ns=new le,rs=new le,Li=new le;function ic(n,e,t,r,a){for(let l=0,u=n.length-3;l<=u;l+=3){Li.fromArray(n,l);const o=a.x*Math.abs(Li.x)+a.y*Math.abs(Li.y)+a.z*Math.abs(Li.z),p=e.dot(Li),m=t.dot(Li),x=r.dot(Li);if(Math.max(-Math.max(p,m,x),Math.min(p,m,x))>o)return!1}return!0}const r0=new Co,to=new le,ac=new le;class Qf{constructor(e=new le,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const r=this.center;t!==void 0?r.copy(t):r0.setFromPoints(e).getCenter(r);let a=0;for(let l=0,u=e.length;l<u;l++)a=Math.max(a,r.distanceToSquared(e[l]));return this.radius=Math.sqrt(a),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;to.subVectors(e,this.center);const t=to.lengthSq();if(t>this.radius*this.radius){const r=Math.sqrt(t),a=(r-this.radius)*.5;this.center.addScaledVector(to,a/r),this.radius+=a}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ac.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(to.copy(e.center).add(ac)),this.expandByPoint(to.copy(e.center).sub(ac))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Ir=new le,oc=new le,is=new le,di=new le,sc=new le,as=new le,lc=new le;class i0{constructor(e=new le,t=new le(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ir)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ir.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ir.copy(this.origin).addScaledVector(this.direction,t),Ir.distanceToSquared(e))}distanceSqToSegment(e,t,r,a){oc.copy(e).add(t).multiplyScalar(.5),is.copy(t).sub(e).normalize(),di.copy(this.origin).sub(oc);const l=e.distanceTo(t)*.5,u=-this.direction.dot(is),o=di.dot(this.direction),p=-di.dot(is),m=di.lengthSq(),x=Math.abs(1-u*u);let v,y,S,T;if(x>0)if(v=u*p-o,y=u*o-p,T=l*x,v>=0)if(y>=-T)if(y<=T){const F=1/x;v*=F,y*=F,S=v*(v+u*y+2*o)+y*(u*v+y+2*p)+m}else y=l,v=Math.max(0,-(u*y+o)),S=-v*v+y*(y+2*p)+m;else y=-l,v=Math.max(0,-(u*y+o)),S=-v*v+y*(y+2*p)+m;else y<=-T?(v=Math.max(0,-(-u*l+o)),y=v>0?-l:Math.min(Math.max(-l,-p),l),S=-v*v+y*(y+2*p)+m):y<=T?(v=0,y=Math.min(Math.max(-l,-p),l),S=y*(y+2*p)+m):(v=Math.max(0,-(u*l+o)),y=v>0?l:Math.min(Math.max(-l,-p),l),S=-v*v+y*(y+2*p)+m);else y=u>0?-l:l,v=Math.max(0,-(u*y+o)),S=-v*v+y*(y+2*p)+m;return r&&r.copy(this.origin).addScaledVector(this.direction,v),a&&a.copy(oc).addScaledVector(is,y),S}intersectSphere(e,t){Ir.subVectors(e.center,this.origin);const r=Ir.dot(this.direction),a=Ir.dot(Ir)-r*r,l=e.radius*e.radius;if(a>l)return null;const u=Math.sqrt(l-a),o=r-u,p=r+u;return p<0?null:o<0?this.at(p,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){const r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,a,l,u,o,p;const m=1/this.direction.x,x=1/this.direction.y,v=1/this.direction.z,y=this.origin;return m>=0?(r=(e.min.x-y.x)*m,a=(e.max.x-y.x)*m):(r=(e.max.x-y.x)*m,a=(e.min.x-y.x)*m),x>=0?(l=(e.min.y-y.y)*x,u=(e.max.y-y.y)*x):(l=(e.max.y-y.y)*x,u=(e.min.y-y.y)*x),r>u||l>a||((l>r||isNaN(r))&&(r=l),(u<a||isNaN(a))&&(a=u),v>=0?(o=(e.min.z-y.z)*v,p=(e.max.z-y.z)*v):(o=(e.max.z-y.z)*v,p=(e.min.z-y.z)*v),r>p||o>a)||((o>r||r!==r)&&(r=o),(p<a||a!==a)&&(a=p),a<0)?null:this.at(r>=0?r:a,t)}intersectsBox(e){return this.intersectBox(e,Ir)!==null}intersectTriangle(e,t,r,a,l){sc.subVectors(t,e),as.subVectors(r,e),lc.crossVectors(sc,as);let u=this.direction.dot(lc),o;if(u>0){if(a)return null;o=1}else if(u<0)o=-1,u=-u;else return null;di.subVectors(this.origin,e);const p=o*this.direction.dot(as.crossVectors(di,as));if(p<0)return null;const m=o*this.direction.dot(sc.cross(di));if(m<0||p+m>u)return null;const x=-o*di.dot(lc);return x<0?null:this.at(x/u,l)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class on{constructor(e,t,r,a,l,u,o,p,m,x,v,y,S,T,F,E){on.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,r,a,l,u,o,p,m,x,v,y,S,T,F,E)}set(e,t,r,a,l,u,o,p,m,x,v,y,S,T,F,E){const b=this.elements;return b[0]=e,b[4]=t,b[8]=r,b[12]=a,b[1]=l,b[5]=u,b[9]=o,b[13]=p,b[2]=m,b[6]=x,b[10]=v,b[14]=y,b[3]=S,b[7]=T,b[11]=F,b[15]=E,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new on().fromArray(this.elements)}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t[9]=r[9],t[10]=r[10],t[11]=r[11],t[12]=r[12],t[13]=r[13],t[14]=r[14],t[15]=r[15],this}copyPosition(e){const t=this.elements,r=e.elements;return t[12]=r[12],t[13]=r[13],t[14]=r[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,r){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,t,r){return this.set(e.x,t.x,r.x,0,e.y,t.y,r.y,0,e.z,t.z,r.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,r=e.elements,a=1/pa.setFromMatrixColumn(e,0).length(),l=1/pa.setFromMatrixColumn(e,1).length(),u=1/pa.setFromMatrixColumn(e,2).length();return t[0]=r[0]*a,t[1]=r[1]*a,t[2]=r[2]*a,t[3]=0,t[4]=r[4]*l,t[5]=r[5]*l,t[6]=r[6]*l,t[7]=0,t[8]=r[8]*u,t[9]=r[9]*u,t[10]=r[10]*u,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,r=e.x,a=e.y,l=e.z,u=Math.cos(r),o=Math.sin(r),p=Math.cos(a),m=Math.sin(a),x=Math.cos(l),v=Math.sin(l);if(e.order==="XYZ"){const y=u*x,S=u*v,T=o*x,F=o*v;t[0]=p*x,t[4]=-p*v,t[8]=m,t[1]=S+T*m,t[5]=y-F*m,t[9]=-o*p,t[2]=F-y*m,t[6]=T+S*m,t[10]=u*p}else if(e.order==="YXZ"){const y=p*x,S=p*v,T=m*x,F=m*v;t[0]=y+F*o,t[4]=T*o-S,t[8]=u*m,t[1]=u*v,t[5]=u*x,t[9]=-o,t[2]=S*o-T,t[6]=F+y*o,t[10]=u*p}else if(e.order==="ZXY"){const y=p*x,S=p*v,T=m*x,F=m*v;t[0]=y-F*o,t[4]=-u*v,t[8]=T+S*o,t[1]=S+T*o,t[5]=u*x,t[9]=F-y*o,t[2]=-u*m,t[6]=o,t[10]=u*p}else if(e.order==="ZYX"){const y=u*x,S=u*v,T=o*x,F=o*v;t[0]=p*x,t[4]=T*m-S,t[8]=y*m+F,t[1]=p*v,t[5]=F*m+y,t[9]=S*m-T,t[2]=-m,t[6]=o*p,t[10]=u*p}else if(e.order==="YZX"){const y=u*p,S=u*m,T=o*p,F=o*m;t[0]=p*x,t[4]=F-y*v,t[8]=T*v+S,t[1]=v,t[5]=u*x,t[9]=-o*x,t[2]=-m*x,t[6]=S*v+T,t[10]=y-F*v}else if(e.order==="XZY"){const y=u*p,S=u*m,T=o*p,F=o*m;t[0]=p*x,t[4]=-v,t[8]=m*x,t[1]=y*v+F,t[5]=u*x,t[9]=S*v-T,t[2]=T*v-S,t[6]=o*x,t[10]=F*v+y}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(a0,e,o0)}lookAt(e,t,r){const a=this.elements;return On.subVectors(e,t),On.lengthSq()===0&&(On.z=1),On.normalize(),hi.crossVectors(r,On),hi.lengthSq()===0&&(Math.abs(r.z)===1?On.x+=1e-4:On.z+=1e-4,On.normalize(),hi.crossVectors(r,On)),hi.normalize(),os.crossVectors(On,hi),a[0]=hi.x,a[4]=os.x,a[8]=On.x,a[1]=hi.y,a[5]=os.y,a[9]=On.y,a[2]=hi.z,a[6]=os.z,a[10]=On.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,a=t.elements,l=this.elements,u=r[0],o=r[4],p=r[8],m=r[12],x=r[1],v=r[5],y=r[9],S=r[13],T=r[2],F=r[6],E=r[10],b=r[14],H=r[3],V=r[7],X=r[11],I=r[15],C=a[0],L=a[4],W=a[8],P=a[12],w=a[1],z=a[5],B=a[9],Y=a[13],K=a[2],j=a[6],J=a[10],ce=a[14],te=a[3],Se=a[7],be=a[11],$e=a[15];return l[0]=u*C+o*w+p*K+m*te,l[4]=u*L+o*z+p*j+m*Se,l[8]=u*W+o*B+p*J+m*be,l[12]=u*P+o*Y+p*ce+m*$e,l[1]=x*C+v*w+y*K+S*te,l[5]=x*L+v*z+y*j+S*Se,l[9]=x*W+v*B+y*J+S*be,l[13]=x*P+v*Y+y*ce+S*$e,l[2]=T*C+F*w+E*K+b*te,l[6]=T*L+F*z+E*j+b*Se,l[10]=T*W+F*B+E*J+b*be,l[14]=T*P+F*Y+E*ce+b*$e,l[3]=H*C+V*w+X*K+I*te,l[7]=H*L+V*z+X*j+I*Se,l[11]=H*W+V*B+X*J+I*be,l[15]=H*P+V*Y+X*ce+I*$e,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[4],a=e[8],l=e[12],u=e[1],o=e[5],p=e[9],m=e[13],x=e[2],v=e[6],y=e[10],S=e[14],T=e[3],F=e[7],E=e[11],b=e[15];return T*(+l*p*v-a*m*v-l*o*y+r*m*y+a*o*S-r*p*S)+F*(+t*p*S-t*m*y+l*u*y-a*u*S+a*m*x-l*p*x)+E*(+t*m*v-t*o*S-l*u*v+r*u*S+l*o*x-r*m*x)+b*(-a*o*x-t*p*v+t*o*y+a*u*v-r*u*y+r*p*x)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,r){const a=this.elements;return e.isVector3?(a[12]=e.x,a[13]=e.y,a[14]=e.z):(a[12]=e,a[13]=t,a[14]=r),this}invert(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],u=e[4],o=e[5],p=e[6],m=e[7],x=e[8],v=e[9],y=e[10],S=e[11],T=e[12],F=e[13],E=e[14],b=e[15],H=v*E*m-F*y*m+F*p*S-o*E*S-v*p*b+o*y*b,V=T*y*m-x*E*m-T*p*S+u*E*S+x*p*b-u*y*b,X=x*F*m-T*v*m+T*o*S-u*F*S-x*o*b+u*v*b,I=T*v*p-x*F*p-T*o*y+u*F*y+x*o*E-u*v*E,C=t*H+r*V+a*X+l*I;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const L=1/C;return e[0]=H*L,e[1]=(F*y*l-v*E*l-F*a*S+r*E*S+v*a*b-r*y*b)*L,e[2]=(o*E*l-F*p*l+F*a*m-r*E*m-o*a*b+r*p*b)*L,e[3]=(v*p*l-o*y*l-v*a*m+r*y*m+o*a*S-r*p*S)*L,e[4]=V*L,e[5]=(x*E*l-T*y*l+T*a*S-t*E*S-x*a*b+t*y*b)*L,e[6]=(T*p*l-u*E*l-T*a*m+t*E*m+u*a*b-t*p*b)*L,e[7]=(u*y*l-x*p*l+x*a*m-t*y*m-u*a*S+t*p*S)*L,e[8]=X*L,e[9]=(T*v*l-x*F*l-T*r*S+t*F*S+x*r*b-t*v*b)*L,e[10]=(u*F*l-T*o*l+T*r*m-t*F*m-u*r*b+t*o*b)*L,e[11]=(x*o*l-u*v*l-x*r*m+t*v*m+u*r*S-t*o*S)*L,e[12]=I*L,e[13]=(x*F*a-T*v*a+T*r*y-t*F*y-x*r*E+t*v*E)*L,e[14]=(T*o*a-u*F*a-T*r*p+t*F*p+u*r*E-t*o*E)*L,e[15]=(u*v*a-x*o*a+x*r*p-t*v*p-u*r*y+t*o*y)*L,this}scale(e){const t=this.elements,r=e.x,a=e.y,l=e.z;return t[0]*=r,t[4]*=a,t[8]*=l,t[1]*=r,t[5]*=a,t[9]*=l,t[2]*=r,t[6]*=a,t[10]*=l,t[3]*=r,t[7]*=a,t[11]*=l,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],a=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,r,a))}makeTranslation(e,t,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,r,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,t,-r,0,0,r,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,0,r,0,0,1,0,0,-r,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,0,r,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const r=Math.cos(t),a=Math.sin(t),l=1-r,u=e.x,o=e.y,p=e.z,m=l*u,x=l*o;return this.set(m*u+r,m*o-a*p,m*p+a*o,0,m*o+a*p,x*o+r,x*p-a*u,0,m*p-a*o,x*p+a*u,l*p*p+r,0,0,0,0,1),this}makeScale(e,t,r){return this.set(e,0,0,0,0,t,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,t,r,a,l,u){return this.set(1,r,l,0,e,1,u,0,t,a,1,0,0,0,0,1),this}compose(e,t,r){const a=this.elements,l=t._x,u=t._y,o=t._z,p=t._w,m=l+l,x=u+u,v=o+o,y=l*m,S=l*x,T=l*v,F=u*x,E=u*v,b=o*v,H=p*m,V=p*x,X=p*v,I=r.x,C=r.y,L=r.z;return a[0]=(1-(F+b))*I,a[1]=(S+X)*I,a[2]=(T-V)*I,a[3]=0,a[4]=(S-X)*C,a[5]=(1-(y+b))*C,a[6]=(E+H)*C,a[7]=0,a[8]=(T+V)*L,a[9]=(E-H)*L,a[10]=(1-(y+F))*L,a[11]=0,a[12]=e.x,a[13]=e.y,a[14]=e.z,a[15]=1,this}decompose(e,t,r){const a=this.elements;let l=pa.set(a[0],a[1],a[2]).length();const u=pa.set(a[4],a[5],a[6]).length(),o=pa.set(a[8],a[9],a[10]).length();this.determinant()<0&&(l=-l),e.x=a[12],e.y=a[13],e.z=a[14],cr.copy(this);const m=1/l,x=1/u,v=1/o;return cr.elements[0]*=m,cr.elements[1]*=m,cr.elements[2]*=m,cr.elements[4]*=x,cr.elements[5]*=x,cr.elements[6]*=x,cr.elements[8]*=v,cr.elements[9]*=v,cr.elements[10]*=v,t.setFromRotationMatrix(cr),r.x=l,r.y=u,r.z=o,this}makePerspective(e,t,r,a,l,u,o=Tr,p=!1){const m=this.elements,x=2*l/(t-e),v=2*l/(r-a),y=(t+e)/(t-e),S=(r+a)/(r-a);let T,F;if(p)T=l/(u-l),F=u*l/(u-l);else if(o===Tr)T=-(u+l)/(u-l),F=-2*u*l/(u-l);else if(o===Ns)T=-u/(u-l),F=-u*l/(u-l);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return m[0]=x,m[4]=0,m[8]=y,m[12]=0,m[1]=0,m[5]=v,m[9]=S,m[13]=0,m[2]=0,m[6]=0,m[10]=T,m[14]=F,m[3]=0,m[7]=0,m[11]=-1,m[15]=0,this}makeOrthographic(e,t,r,a,l,u,o=Tr,p=!1){const m=this.elements,x=2/(t-e),v=2/(r-a),y=-(t+e)/(t-e),S=-(r+a)/(r-a);let T,F;if(p)T=1/(u-l),F=u/(u-l);else if(o===Tr)T=-2/(u-l),F=-(u+l)/(u-l);else if(o===Ns)T=-1/(u-l),F=-l/(u-l);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return m[0]=x,m[4]=0,m[8]=0,m[12]=y,m[1]=0,m[5]=v,m[9]=0,m[13]=S,m[2]=0,m[6]=0,m[10]=T,m[14]=F,m[3]=0,m[7]=0,m[11]=0,m[15]=1,this}equals(e){const t=this.elements,r=e.elements;for(let a=0;a<16;a++)if(t[a]!==r[a])return!1;return!0}fromArray(e,t=0){for(let r=0;r<16;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e[t+9]=r[9],e[t+10]=r[10],e[t+11]=r[11],e[t+12]=r[12],e[t+13]=r[13],e[t+14]=r[14],e[t+15]=r[15],e}}const pa=new le,cr=new on,a0=new le(0,0,0),o0=new le(1,1,1),hi=new le,os=new le,On=new le,Cu=new on,Ru=new Ao;class Yr{constructor(e=0,t=0,r=0,a=Yr.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=r,this._order=a}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,r,a=this._order){return this._x=e,this._y=t,this._z=r,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,r=!0){const a=e.elements,l=a[0],u=a[4],o=a[8],p=a[1],m=a[5],x=a[9],v=a[2],y=a[6],S=a[10];switch(t){case"XYZ":this._y=Math.asin(bt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-x,S),this._z=Math.atan2(-u,l)):(this._x=Math.atan2(y,m),this._z=0);break;case"YXZ":this._x=Math.asin(-bt(x,-1,1)),Math.abs(x)<.9999999?(this._y=Math.atan2(o,S),this._z=Math.atan2(p,m)):(this._y=Math.atan2(-v,l),this._z=0);break;case"ZXY":this._x=Math.asin(bt(y,-1,1)),Math.abs(y)<.9999999?(this._y=Math.atan2(-v,S),this._z=Math.atan2(-u,m)):(this._y=0,this._z=Math.atan2(p,l));break;case"ZYX":this._y=Math.asin(-bt(v,-1,1)),Math.abs(v)<.9999999?(this._x=Math.atan2(y,S),this._z=Math.atan2(p,l)):(this._x=0,this._z=Math.atan2(-u,m));break;case"YZX":this._z=Math.asin(bt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(-x,m),this._y=Math.atan2(-v,l)):(this._x=0,this._y=Math.atan2(o,S));break;case"XZY":this._z=Math.asin(-bt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(y,m),this._y=Math.atan2(o,l)):(this._x=Math.atan2(-x,S),this._y=0);break;default:pt("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,r){return Cu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Cu,t,r)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ru.setFromEuler(this),this.setFromQuaternion(Ru,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Yr.DEFAULT_ORDER="XYZ";class hh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let s0=0;const Pu=new le,ma=new Ao,Ur=new on,ss=new le,no=new le,l0=new le,c0=new Ao,Du=new le(1,0,0),Lu=new le(0,1,0),Fu=new le(0,0,1),Iu={type:"added"},f0={type:"removed"},_a={type:"childadded",child:null},cc={type:"childremoved",child:null};class Xn extends Ba{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:s0++}),this.uuid=To(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Xn.DEFAULT_UP.clone();const e=new le,t=new Yr,r=new Ao,a=new le(1,1,1);function l(){r.setFromEuler(t,!1)}function u(){t.setFromQuaternion(r,void 0,!1)}t._onChange(l),r._onChange(u),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new on},normalMatrix:{value:new _t}}),this.matrix=new on,this.matrixWorld=new on,this.matrixAutoUpdate=Xn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Xn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new hh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ma.setFromAxisAngle(e,t),this.quaternion.multiply(ma),this}rotateOnWorldAxis(e,t){return ma.setFromAxisAngle(e,t),this.quaternion.premultiply(ma),this}rotateX(e){return this.rotateOnAxis(Du,e)}rotateY(e){return this.rotateOnAxis(Lu,e)}rotateZ(e){return this.rotateOnAxis(Fu,e)}translateOnAxis(e,t){return Pu.copy(e).applyQuaternion(this.quaternion),this.position.add(Pu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Du,e)}translateY(e){return this.translateOnAxis(Lu,e)}translateZ(e){return this.translateOnAxis(Fu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ur.copy(this.matrixWorld).invert())}lookAt(e,t,r){e.isVector3?ss.copy(e):ss.set(e,t,r);const a=this.parent;this.updateWorldMatrix(!0,!1),no.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ur.lookAt(no,ss,this.up):Ur.lookAt(ss,no,this.up),this.quaternion.setFromRotationMatrix(Ur),a&&(Ur.extractRotation(a.matrixWorld),ma.setFromRotationMatrix(Ur),this.quaternion.premultiply(ma.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Jt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Iu),_a.child=e,this.dispatchEvent(_a),_a.child=null):Jt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(f0),cc.child=e,this.dispatchEvent(cc),cc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ur.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ur.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ur),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Iu),_a.child=e,this.dispatchEvent(_a),_a.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let r=0,a=this.children.length;r<a;r++){const u=this.children[r].getObjectByProperty(e,t);if(u!==void 0)return u}}getObjectsByProperty(e,t,r=[]){this[e]===t&&r.push(this);const a=this.children;for(let l=0,u=a.length;l<u;l++)a[l].getObjectsByProperty(e,t,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(no,e,l0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(no,c0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].updateMatrixWorld(e)}updateWorldMatrix(e,t){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const a=this.children;for(let l=0,u=a.length;l<u;l++)a[l].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",r={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const a={};a.uuid=this.uuid,a.type=this.type,this.name!==""&&(a.name=this.name),this.castShadow===!0&&(a.castShadow=!0),this.receiveShadow===!0&&(a.receiveShadow=!0),this.visible===!1&&(a.visible=!1),this.frustumCulled===!1&&(a.frustumCulled=!1),this.renderOrder!==0&&(a.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(a.matrixAutoUpdate=!1),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),a.instanceInfo=this._instanceInfo.map(o=>({...o})),a.availableInstanceIds=this._availableInstanceIds.slice(),a.availableGeometryIds=this._availableGeometryIds.slice(),a.nextIndexStart=this._nextIndexStart,a.nextVertexStart=this._nextVertexStart,a.geometryCount=this._geometryCount,a.maxInstanceCount=this._maxInstanceCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.matricesTexture=this._matricesTexture.toJSON(e),a.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(a.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(a.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(a.boundingBox=this.boundingBox.toJSON()));function l(o,p){return o[p.uuid]===void 0&&(o[p.uuid]=p.toJSON(e)),p.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=l(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const p=o.shapes;if(Array.isArray(p))for(let m=0,x=p.length;m<x;m++){const v=p[m];l(e.shapes,v)}else l(e.shapes,p)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(l(e.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let p=0,m=this.material.length;p<m;p++)o.push(l(e.materials,this.material[p]));a.material=o}else a.material=l(e.materials,this.material);if(this.children.length>0){a.children=[];for(let o=0;o<this.children.length;o++)a.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){a.animations=[];for(let o=0;o<this.animations.length;o++){const p=this.animations[o];a.animations.push(l(e.animations,p))}}if(t){const o=u(e.geometries),p=u(e.materials),m=u(e.textures),x=u(e.images),v=u(e.shapes),y=u(e.skeletons),S=u(e.animations),T=u(e.nodes);o.length>0&&(r.geometries=o),p.length>0&&(r.materials=p),m.length>0&&(r.textures=m),x.length>0&&(r.images=x),v.length>0&&(r.shapes=v),y.length>0&&(r.skeletons=y),S.length>0&&(r.animations=S),T.length>0&&(r.nodes=T)}return r.object=a,r;function u(o){const p=[];for(const m in o){const x=o[m];delete x.metadata,p.push(x)}return p}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let r=0;r<e.children.length;r++){const a=e.children[r];this.add(a.clone())}return this}}Xn.DEFAULT_UP=new le(0,1,0);Xn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Xn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const fr=new le,Nr=new le,fc=new le,Or=new le,ga=new le,va=new le,Uu=new le,uc=new le,dc=new le,hc=new le,pc=new Qt,mc=new Qt,_c=new Qt;class hr{constructor(e=new le,t=new le,r=new le){this.a=e,this.b=t,this.c=r}static getNormal(e,t,r,a){a.subVectors(r,t),fr.subVectors(e,t),a.cross(fr);const l=a.lengthSq();return l>0?a.multiplyScalar(1/Math.sqrt(l)):a.set(0,0,0)}static getBarycoord(e,t,r,a,l){fr.subVectors(a,t),Nr.subVectors(r,t),fc.subVectors(e,t);const u=fr.dot(fr),o=fr.dot(Nr),p=fr.dot(fc),m=Nr.dot(Nr),x=Nr.dot(fc),v=u*m-o*o;if(v===0)return l.set(0,0,0),null;const y=1/v,S=(m*p-o*x)*y,T=(u*x-o*p)*y;return l.set(1-S-T,T,S)}static containsPoint(e,t,r,a){return this.getBarycoord(e,t,r,a,Or)===null?!1:Or.x>=0&&Or.y>=0&&Or.x+Or.y<=1}static getInterpolation(e,t,r,a,l,u,o,p){return this.getBarycoord(e,t,r,a,Or)===null?(p.x=0,p.y=0,"z"in p&&(p.z=0),"w"in p&&(p.w=0),null):(p.setScalar(0),p.addScaledVector(l,Or.x),p.addScaledVector(u,Or.y),p.addScaledVector(o,Or.z),p)}static getInterpolatedAttribute(e,t,r,a,l,u){return pc.setScalar(0),mc.setScalar(0),_c.setScalar(0),pc.fromBufferAttribute(e,t),mc.fromBufferAttribute(e,r),_c.fromBufferAttribute(e,a),u.setScalar(0),u.addScaledVector(pc,l.x),u.addScaledVector(mc,l.y),u.addScaledVector(_c,l.z),u}static isFrontFacing(e,t,r,a){return fr.subVectors(r,t),Nr.subVectors(e,t),fr.cross(Nr).dot(a)<0}set(e,t,r){return this.a.copy(e),this.b.copy(t),this.c.copy(r),this}setFromPointsAndIndices(e,t,r,a){return this.a.copy(e[t]),this.b.copy(e[r]),this.c.copy(e[a]),this}setFromAttributeAndIndices(e,t,r,a){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,a),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return fr.subVectors(this.c,this.b),Nr.subVectors(this.a,this.b),fr.cross(Nr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return hr.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return hr.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,r,a,l){return hr.getInterpolation(e,this.a,this.b,this.c,t,r,a,l)}containsPoint(e){return hr.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return hr.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const r=this.a,a=this.b,l=this.c;let u,o;ga.subVectors(a,r),va.subVectors(l,r),uc.subVectors(e,r);const p=ga.dot(uc),m=va.dot(uc);if(p<=0&&m<=0)return t.copy(r);dc.subVectors(e,a);const x=ga.dot(dc),v=va.dot(dc);if(x>=0&&v<=x)return t.copy(a);const y=p*v-x*m;if(y<=0&&p>=0&&x<=0)return u=p/(p-x),t.copy(r).addScaledVector(ga,u);hc.subVectors(e,l);const S=ga.dot(hc),T=va.dot(hc);if(T>=0&&S<=T)return t.copy(l);const F=S*m-p*T;if(F<=0&&m>=0&&T<=0)return o=m/(m-T),t.copy(r).addScaledVector(va,o);const E=x*T-S*v;if(E<=0&&v-x>=0&&S-T>=0)return Uu.subVectors(l,a),o=(v-x)/(v-x+(S-T)),t.copy(a).addScaledVector(Uu,o);const b=1/(E+F+y);return u=F*b,o=y*b,t.copy(r).addScaledVector(ga,u).addScaledVector(va,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const ph={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},pi={h:0,s:0,l:0},ls={h:0,s:0,l:0};function gc(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class zt{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){const a=e;a&&a.isColor?this.copy(a):typeof a=="number"?this.setHex(a):typeof a=="string"&&this.setStyle(a)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=zn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Rt.colorSpaceToWorking(this,t),this}setRGB(e,t,r,a=Rt.workingColorSpace){return this.r=e,this.g=t,this.b=r,Rt.colorSpaceToWorking(this,a),this}setHSL(e,t,r,a=Rt.workingColorSpace){if(e=Km(e,1),t=bt(t,0,1),r=bt(r,0,1),t===0)this.r=this.g=this.b=r;else{const l=r<=.5?r*(1+t):r+t-r*t,u=2*r-l;this.r=gc(u,l,e+1/3),this.g=gc(u,l,e),this.b=gc(u,l,e-1/3)}return Rt.colorSpaceToWorking(this,a),this}setStyle(e,t=zn){function r(l){l!==void 0&&parseFloat(l)<1&&pt("Color: Alpha component of "+e+" will be ignored.")}let a;if(a=/^(\w+)\(([^\)]*)\)/.exec(e)){let l;const u=a[1],o=a[2];switch(u){case"rgb":case"rgba":if(l=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return r(l[4]),this.setRGB(Math.min(255,parseInt(l[1],10))/255,Math.min(255,parseInt(l[2],10))/255,Math.min(255,parseInt(l[3],10))/255,t);if(l=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return r(l[4]),this.setRGB(Math.min(100,parseInt(l[1],10))/100,Math.min(100,parseInt(l[2],10))/100,Math.min(100,parseInt(l[3],10))/100,t);break;case"hsl":case"hsla":if(l=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return r(l[4]),this.setHSL(parseFloat(l[1])/360,parseFloat(l[2])/100,parseFloat(l[3])/100,t);break;default:pt("Color: Unknown color model "+e)}}else if(a=/^\#([A-Fa-f\d]+)$/.exec(e)){const l=a[1],u=l.length;if(u===3)return this.setRGB(parseInt(l.charAt(0),16)/15,parseInt(l.charAt(1),16)/15,parseInt(l.charAt(2),16)/15,t);if(u===6)return this.setHex(parseInt(l,16),t);pt("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=zn){const r=ph[e.toLowerCase()];return r!==void 0?this.setHex(r,t):pt("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=$r(e.r),this.g=$r(e.g),this.b=$r(e.b),this}copyLinearToSRGB(e){return this.r=Ra(e.r),this.g=Ra(e.g),this.b=Ra(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=zn){return Rt.workingToColorSpace(gn.copy(this),e),Math.round(bt(gn.r*255,0,255))*65536+Math.round(bt(gn.g*255,0,255))*256+Math.round(bt(gn.b*255,0,255))}getHexString(e=zn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Rt.workingColorSpace){Rt.workingToColorSpace(gn.copy(this),t);const r=gn.r,a=gn.g,l=gn.b,u=Math.max(r,a,l),o=Math.min(r,a,l);let p,m;const x=(o+u)/2;if(o===u)p=0,m=0;else{const v=u-o;switch(m=x<=.5?v/(u+o):v/(2-u-o),u){case r:p=(a-l)/v+(a<l?6:0);break;case a:p=(l-r)/v+2;break;case l:p=(r-a)/v+4;break}p/=6}return e.h=p,e.s=m,e.l=x,e}getRGB(e,t=Rt.workingColorSpace){return Rt.workingToColorSpace(gn.copy(this),t),e.r=gn.r,e.g=gn.g,e.b=gn.b,e}getStyle(e=zn){Rt.workingToColorSpace(gn.copy(this),e);const t=gn.r,r=gn.g,a=gn.b;return e!==zn?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${a.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(a*255)})`}offsetHSL(e,t,r){return this.getHSL(pi),this.setHSL(pi.h+e,pi.s+t,pi.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(pi),e.getHSL(ls);const r=Ql(pi.h,ls.h,t),a=Ql(pi.s,ls.s,t),l=Ql(pi.l,ls.l,t);return this.setHSL(r,a,l),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,r=this.g,a=this.b,l=e.elements;return this.r=l[0]*t+l[3]*r+l[6]*a,this.g=l[1]*t+l[4]*r+l[7]*a,this.b=l[2]*t+l[5]*r+l[8]*a,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const gn=new zt;zt.NAMES=ph;let u0=0;class qs extends Ba{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:u0++}),this.uuid=To(),this.name="",this.type="Material",this.blending=Ca,this.side=Si,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=kc,this.blendDst=Bc,this.blendEquation=ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new zt(0,0,0),this.blendAlpha=0,this.depthFunc=Fa,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=yu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ca,this.stencilZFail=ca,this.stencilZPass=ca,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const r=e[t];if(r===void 0){pt(`Material: parameter '${t}' has value of undefined.`);continue}const a=this[t];if(a===void 0){pt(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}a&&a.isColor?a.set(r):a&&a.isVector3&&r&&r.isVector3?a.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const r={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(r.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(r.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==Ca&&(r.blending=this.blending),this.side!==Si&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==kc&&(r.blendSrc=this.blendSrc),this.blendDst!==Bc&&(r.blendDst=this.blendDst),this.blendEquation!==ki&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==Fa&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==yu&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ca&&(r.stencilFail=this.stencilFail),this.stencilZFail!==ca&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==ca&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function a(l){const u=[];for(const o in l){const p=l[o];delete p.metadata,u.push(p)}return u}if(t){const l=a(e.textures),u=a(e.images);l.length>0&&(r.textures=l),u.length>0&&(r.images=u)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let r=null;if(t!==null){const a=t.length;r=new Array(a);for(let l=0;l!==a;++l)r[l]=t[l].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class eu extends qs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new zt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yr,this.combine=nh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Hr=d0();function d0(){const n=new ArrayBuffer(4),e=new Float32Array(n),t=new Uint32Array(n),r=new Uint32Array(512),a=new Uint32Array(512);for(let p=0;p<256;++p){const m=p-127;m<-27?(r[p]=0,r[p|256]=32768,a[p]=24,a[p|256]=24):m<-14?(r[p]=1024>>-m-14,r[p|256]=1024>>-m-14|32768,a[p]=-m-1,a[p|256]=-m-1):m<=15?(r[p]=m+15<<10,r[p|256]=m+15<<10|32768,a[p]=13,a[p|256]=13):m<128?(r[p]=31744,r[p|256]=64512,a[p]=24,a[p|256]=24):(r[p]=31744,r[p|256]=64512,a[p]=13,a[p|256]=13)}const l=new Uint32Array(2048),u=new Uint32Array(64),o=new Uint32Array(64);for(let p=1;p<1024;++p){let m=p<<13,x=0;for(;(m&8388608)===0;)m<<=1,x-=8388608;m&=-8388609,x+=947912704,l[p]=m|x}for(let p=1024;p<2048;++p)l[p]=939524096+(p-1024<<13);for(let p=1;p<31;++p)u[p]=p<<23;u[31]=1199570944,u[32]=2147483648;for(let p=33;p<63;++p)u[p]=2147483648+(p-32<<23);u[63]=3347054592;for(let p=1;p<64;++p)p!==32&&(o[p]=1024);return{floatView:e,uint32View:t,baseTable:r,shiftTable:a,mantissaTable:l,exponentTable:u,offsetTable:o}}function h0(n){Math.abs(n)>65504&&pt("DataUtils.toHalfFloat(): Value out of range."),n=bt(n,-65504,65504),Hr.floatView[0]=n;const e=Hr.uint32View[0],t=e>>23&511;return Hr.baseTable[t]+((e&8388607)>>Hr.shiftTable[t])}function p0(n){const e=n>>10;return Hr.uint32View[0]=Hr.mantissaTable[Hr.offsetTable[e]+(n&1023)]+Hr.exponentTable[e],Hr.floatView[0]}class cs{static toHalfFloat(e){return h0(e)}static fromHalfFloat(e){return p0(e)}}const tn=new le,fs=new Gt;let m0=0;class Ar{constructor(e,t,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:m0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=Su,this.updateRanges=[],this.gpuType=Zn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let a=0,l=this.itemSize;a<l;a++)this.array[e+a]=t.array[r+a];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)fs.fromBufferAttribute(this,t),fs.applyMatrix3(e),this.setXY(t,fs.x,fs.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)tn.fromBufferAttribute(this,t),tn.applyMatrix3(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)tn.fromBufferAttribute(this,t),tn.applyMatrix4(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)tn.fromBufferAttribute(this,t),tn.applyNormalMatrix(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)tn.fromBufferAttribute(this,t),tn.transformDirection(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=Qa(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Pn(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Qa(t,this.array)),t}setX(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Qa(t,this.array)),t}setY(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Qa(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Qa(t,this.array)),t}setW(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=Pn(t,this.array),r=Pn(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,a){return e*=this.itemSize,this.normalized&&(t=Pn(t,this.array),r=Pn(r,this.array),a=Pn(a,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=a,this}setXYZW(e,t,r,a,l){return e*=this.itemSize,this.normalized&&(t=Pn(t,this.array),r=Pn(r,this.array),a=Pn(a,this.array),l=Pn(l,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=a,this.array[e+3]=l,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Su&&(e.usage=this.usage),e}}class mh extends Ar{constructor(e,t,r){super(new Uint16Array(e),t,r)}}class _h extends Ar{constructor(e,t,r){super(new Uint32Array(e),t,r)}}class Vi extends Ar{constructor(e,t,r){super(new Float32Array(e),t,r)}}let _0=0;const qn=new on,vc=new Xn,xa=new le,kn=new Co,ro=new Co,fn=new le;class Ei extends Ba{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:_0++}),this.uuid=To(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(uh(e)?_h:mh)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,r=0){this.groups.push({start:e,count:t,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const l=new _t().getNormalMatrix(e);r.applyNormalMatrix(l),r.needsUpdate=!0}const a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(e),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return qn.makeRotationFromQuaternion(e),this.applyMatrix4(qn),this}rotateX(e){return qn.makeRotationX(e),this.applyMatrix4(qn),this}rotateY(e){return qn.makeRotationY(e),this.applyMatrix4(qn),this}rotateZ(e){return qn.makeRotationZ(e),this.applyMatrix4(qn),this}translate(e,t,r){return qn.makeTranslation(e,t,r),this.applyMatrix4(qn),this}scale(e,t,r){return qn.makeScale(e,t,r),this.applyMatrix4(qn),this}lookAt(e){return vc.lookAt(e),vc.updateMatrix(),this.applyMatrix4(vc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(xa).negate(),this.translate(xa.x,xa.y,xa.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const r=[];for(let a=0,l=e.length;a<l;a++){const u=e[a];r.push(u.x,u.y,u.z||0)}this.setAttribute("position",new Vi(r,3))}else{const r=Math.min(e.length,t.count);for(let a=0;a<r;a++){const l=e[a];t.setXYZ(a,l.x,l.y,l.z||0)}e.length>t.count&&pt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Co);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Jt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new le(-1/0,-1/0,-1/0),new le(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const l=t[r];kn.setFromBufferAttribute(l),this.morphTargetsRelative?(fn.addVectors(this.boundingBox.min,kn.min),this.boundingBox.expandByPoint(fn),fn.addVectors(this.boundingBox.max,kn.max),this.boundingBox.expandByPoint(fn)):(this.boundingBox.expandByPoint(kn.min),this.boundingBox.expandByPoint(kn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Jt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qf);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Jt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new le,1/0);return}if(e){const r=this.boundingSphere.center;if(kn.setFromBufferAttribute(e),t)for(let l=0,u=t.length;l<u;l++){const o=t[l];ro.setFromBufferAttribute(o),this.morphTargetsRelative?(fn.addVectors(kn.min,ro.min),kn.expandByPoint(fn),fn.addVectors(kn.max,ro.max),kn.expandByPoint(fn)):(kn.expandByPoint(ro.min),kn.expandByPoint(ro.max))}kn.getCenter(r);let a=0;for(let l=0,u=e.count;l<u;l++)fn.fromBufferAttribute(e,l),a=Math.max(a,r.distanceToSquared(fn));if(t)for(let l=0,u=t.length;l<u;l++){const o=t[l],p=this.morphTargetsRelative;for(let m=0,x=o.count;m<x;m++)fn.fromBufferAttribute(o,m),p&&(xa.fromBufferAttribute(e,m),fn.add(xa)),a=Math.max(a,r.distanceToSquared(fn))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&Jt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Jt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=t.position,a=t.normal,l=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ar(new Float32Array(4*r.count),4));const u=this.getAttribute("tangent"),o=[],p=[];for(let W=0;W<r.count;W++)o[W]=new le,p[W]=new le;const m=new le,x=new le,v=new le,y=new Gt,S=new Gt,T=new Gt,F=new le,E=new le;function b(W,P,w){m.fromBufferAttribute(r,W),x.fromBufferAttribute(r,P),v.fromBufferAttribute(r,w),y.fromBufferAttribute(l,W),S.fromBufferAttribute(l,P),T.fromBufferAttribute(l,w),x.sub(m),v.sub(m),S.sub(y),T.sub(y);const z=1/(S.x*T.y-T.x*S.y);isFinite(z)&&(F.copy(x).multiplyScalar(T.y).addScaledVector(v,-S.y).multiplyScalar(z),E.copy(v).multiplyScalar(S.x).addScaledVector(x,-T.x).multiplyScalar(z),o[W].add(F),o[P].add(F),o[w].add(F),p[W].add(E),p[P].add(E),p[w].add(E))}let H=this.groups;H.length===0&&(H=[{start:0,count:e.count}]);for(let W=0,P=H.length;W<P;++W){const w=H[W],z=w.start,B=w.count;for(let Y=z,K=z+B;Y<K;Y+=3)b(e.getX(Y+0),e.getX(Y+1),e.getX(Y+2))}const V=new le,X=new le,I=new le,C=new le;function L(W){I.fromBufferAttribute(a,W),C.copy(I);const P=o[W];V.copy(P),V.sub(I.multiplyScalar(I.dot(P))).normalize(),X.crossVectors(C,P);const z=X.dot(p[W])<0?-1:1;u.setXYZW(W,V.x,V.y,V.z,z)}for(let W=0,P=H.length;W<P;++W){const w=H[W],z=w.start,B=w.count;for(let Y=z,K=z+B;Y<K;Y+=3)L(e.getX(Y+0)),L(e.getX(Y+1)),L(e.getX(Y+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new Ar(new Float32Array(t.count*3),3),this.setAttribute("normal",r);else for(let y=0,S=r.count;y<S;y++)r.setXYZ(y,0,0,0);const a=new le,l=new le,u=new le,o=new le,p=new le,m=new le,x=new le,v=new le;if(e)for(let y=0,S=e.count;y<S;y+=3){const T=e.getX(y+0),F=e.getX(y+1),E=e.getX(y+2);a.fromBufferAttribute(t,T),l.fromBufferAttribute(t,F),u.fromBufferAttribute(t,E),x.subVectors(u,l),v.subVectors(a,l),x.cross(v),o.fromBufferAttribute(r,T),p.fromBufferAttribute(r,F),m.fromBufferAttribute(r,E),o.add(x),p.add(x),m.add(x),r.setXYZ(T,o.x,o.y,o.z),r.setXYZ(F,p.x,p.y,p.z),r.setXYZ(E,m.x,m.y,m.z)}else for(let y=0,S=t.count;y<S;y+=3)a.fromBufferAttribute(t,y+0),l.fromBufferAttribute(t,y+1),u.fromBufferAttribute(t,y+2),x.subVectors(u,l),v.subVectors(a,l),x.cross(v),r.setXYZ(y+0,x.x,x.y,x.z),r.setXYZ(y+1,x.x,x.y,x.z),r.setXYZ(y+2,x.x,x.y,x.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,r=e.count;t<r;t++)fn.fromBufferAttribute(e,t),fn.normalize(),e.setXYZ(t,fn.x,fn.y,fn.z)}toNonIndexed(){function e(o,p){const m=o.array,x=o.itemSize,v=o.normalized,y=new m.constructor(p.length*x);let S=0,T=0;for(let F=0,E=p.length;F<E;F++){o.isInterleavedBufferAttribute?S=p[F]*o.data.stride+o.offset:S=p[F]*x;for(let b=0;b<x;b++)y[T++]=m[S++]}return new Ar(y,x,v)}if(this.index===null)return pt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Ei,r=this.index.array,a=this.attributes;for(const o in a){const p=a[o],m=e(p,r);t.setAttribute(o,m)}const l=this.morphAttributes;for(const o in l){const p=[],m=l[o];for(let x=0,v=m.length;x<v;x++){const y=m[x],S=e(y,r);p.push(S)}t.morphAttributes[o]=p}t.morphTargetsRelative=this.morphTargetsRelative;const u=this.groups;for(let o=0,p=u.length;o<p;o++){const m=u[o];t.addGroup(m.start,m.count,m.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const p=this.parameters;for(const m in p)p[m]!==void 0&&(e[m]=p[m]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const r=this.attributes;for(const p in r){const m=r[p];e.data.attributes[p]=m.toJSON(e.data)}const a={};let l=!1;for(const p in this.morphAttributes){const m=this.morphAttributes[p],x=[];for(let v=0,y=m.length;v<y;v++){const S=m[v];x.push(S.toJSON(e.data))}x.length>0&&(a[p]=x,l=!0)}l&&(e.data.morphAttributes=a,e.data.morphTargetsRelative=this.morphTargetsRelative);const u=this.groups;u.length>0&&(e.data.groups=JSON.parse(JSON.stringify(u)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone());const a=e.attributes;for(const m in a){const x=a[m];this.setAttribute(m,x.clone(t))}const l=e.morphAttributes;for(const m in l){const x=[],v=l[m];for(let y=0,S=v.length;y<S;y++)x.push(v[y].clone(t));this.morphAttributes[m]=x}this.morphTargetsRelative=e.morphTargetsRelative;const u=e.groups;for(let m=0,x=u.length;m<x;m++){const v=u[m];this.addGroup(v.start,v.count,v.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const p=e.boundingSphere;return p!==null&&(this.boundingSphere=p.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Nu=new on,Fi=new i0,us=new Qf,Ou=new le,ds=new le,hs=new le,ps=new le,xc=new le,ms=new le,ku=new le,_s=new le;class Pr extends Xn{constructor(e=new Ei,t=new eu){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const a=t[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,u=a.length;l<u;l++){const o=a[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=l}}}}getVertexPosition(e,t){const r=this.geometry,a=r.attributes.position,l=r.morphAttributes.position,u=r.morphTargetsRelative;t.fromBufferAttribute(a,e);const o=this.morphTargetInfluences;if(l&&o){ms.set(0,0,0);for(let p=0,m=l.length;p<m;p++){const x=o[p],v=l[p];x!==0&&(xc.fromBufferAttribute(v,e),u?ms.addScaledVector(xc,x):ms.addScaledVector(xc.sub(t),x))}t.add(ms)}return t}raycast(e,t){const r=this.geometry,a=this.material,l=this.matrixWorld;a!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),us.copy(r.boundingSphere),us.applyMatrix4(l),Fi.copy(e.ray).recast(e.near),!(us.containsPoint(Fi.origin)===!1&&(Fi.intersectSphere(us,Ou)===null||Fi.origin.distanceToSquared(Ou)>(e.far-e.near)**2))&&(Nu.copy(l).invert(),Fi.copy(e.ray).applyMatrix4(Nu),!(r.boundingBox!==null&&Fi.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,Fi)))}_computeIntersections(e,t,r){let a;const l=this.geometry,u=this.material,o=l.index,p=l.attributes.position,m=l.attributes.uv,x=l.attributes.uv1,v=l.attributes.normal,y=l.groups,S=l.drawRange;if(o!==null)if(Array.isArray(u))for(let T=0,F=y.length;T<F;T++){const E=y[T],b=u[E.materialIndex],H=Math.max(E.start,S.start),V=Math.min(o.count,Math.min(E.start+E.count,S.start+S.count));for(let X=H,I=V;X<I;X+=3){const C=o.getX(X),L=o.getX(X+1),W=o.getX(X+2);a=gs(this,b,e,r,m,x,v,C,L,W),a&&(a.faceIndex=Math.floor(X/3),a.face.materialIndex=E.materialIndex,t.push(a))}}else{const T=Math.max(0,S.start),F=Math.min(o.count,S.start+S.count);for(let E=T,b=F;E<b;E+=3){const H=o.getX(E),V=o.getX(E+1),X=o.getX(E+2);a=gs(this,u,e,r,m,x,v,H,V,X),a&&(a.faceIndex=Math.floor(E/3),t.push(a))}}else if(p!==void 0)if(Array.isArray(u))for(let T=0,F=y.length;T<F;T++){const E=y[T],b=u[E.materialIndex],H=Math.max(E.start,S.start),V=Math.min(p.count,Math.min(E.start+E.count,S.start+S.count));for(let X=H,I=V;X<I;X+=3){const C=X,L=X+1,W=X+2;a=gs(this,b,e,r,m,x,v,C,L,W),a&&(a.faceIndex=Math.floor(X/3),a.face.materialIndex=E.materialIndex,t.push(a))}}else{const T=Math.max(0,S.start),F=Math.min(p.count,S.start+S.count);for(let E=T,b=F;E<b;E+=3){const H=E,V=E+1,X=E+2;a=gs(this,u,e,r,m,x,v,H,V,X),a&&(a.faceIndex=Math.floor(E/3),t.push(a))}}}}function g0(n,e,t,r,a,l,u,o){let p;if(e.side===In?p=r.intersectTriangle(u,l,a,!0,o):p=r.intersectTriangle(a,l,u,e.side===Si,o),p===null)return null;_s.copy(o),_s.applyMatrix4(n.matrixWorld);const m=t.ray.origin.distanceTo(_s);return m<t.near||m>t.far?null:{distance:m,point:_s.clone(),object:n}}function gs(n,e,t,r,a,l,u,o,p,m){n.getVertexPosition(o,ds),n.getVertexPosition(p,hs),n.getVertexPosition(m,ps);const x=g0(n,e,t,r,ds,hs,ps,ku);if(x){const v=new le;hr.getBarycoord(ku,ds,hs,ps,v),a&&(x.uv=hr.getInterpolatedAttribute(a,o,p,m,v,new Gt)),l&&(x.uv1=hr.getInterpolatedAttribute(l,o,p,m,v,new Gt)),u&&(x.normal=hr.getInterpolatedAttribute(u,o,p,m,v,new le),x.normal.dot(r.direction)>0&&x.normal.multiplyScalar(-1));const y={a:o,b:p,c:m,normal:new le,materialIndex:0};hr.getNormal(ds,hs,ps,y.normal),x.face=y,x.barycoord=v}return x}class Ro extends Ei{constructor(e=1,t=1,r=1,a=1,l=1,u=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:r,widthSegments:a,heightSegments:l,depthSegments:u};const o=this;a=Math.floor(a),l=Math.floor(l),u=Math.floor(u);const p=[],m=[],x=[],v=[];let y=0,S=0;T("z","y","x",-1,-1,r,t,e,u,l,0),T("z","y","x",1,-1,r,t,-e,u,l,1),T("x","z","y",1,1,e,r,t,a,u,2),T("x","z","y",1,-1,e,r,-t,a,u,3),T("x","y","z",1,-1,e,t,r,a,l,4),T("x","y","z",-1,-1,e,t,-r,a,l,5),this.setIndex(p),this.setAttribute("position",new Vi(m,3)),this.setAttribute("normal",new Vi(x,3)),this.setAttribute("uv",new Vi(v,2));function T(F,E,b,H,V,X,I,C,L,W,P){const w=X/L,z=I/W,B=X/2,Y=I/2,K=C/2,j=L+1,J=W+1;let ce=0,te=0;const Se=new le;for(let be=0;be<J;be++){const $e=be*z-Y;for(let st=0;st<j;st++){const ht=st*w-B;Se[F]=ht*H,Se[E]=$e*V,Se[b]=K,m.push(Se.x,Se.y,Se.z),Se[F]=0,Se[E]=0,Se[b]=C>0?1:-1,x.push(Se.x,Se.y,Se.z),v.push(st/L),v.push(1-be/W),ce+=1}}for(let be=0;be<W;be++)for(let $e=0;$e<L;$e++){const st=y+$e+j*be,ht=y+$e+j*(be+1),xt=y+($e+1)+j*(be+1),gt=y+($e+1)+j*be;p.push(st,ht,gt),p.push(ht,xt,gt),te+=6}o.addGroup(S,te,P),S+=te,y+=ce}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ro(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Na(n){const e={};for(const t in n){e[t]={};for(const r in n[t]){const a=n[t][r];a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)?a.isRenderTargetTexture?(pt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][r]=null):e[t][r]=a.clone():Array.isArray(a)?e[t][r]=a.slice():e[t][r]=a}}return e}function wn(n){const e={};for(let t=0;t<n.length;t++){const r=Na(n[t]);for(const a in r)e[a]=r[a]}return e}function v0(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function gh(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Rt.workingColorSpace}const x0={clone:Na,merge:wn};var y0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,S0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Qn extends qs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=y0,this.fragmentShader=S0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Na(e.uniforms),this.uniformsGroups=v0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const a in this.uniforms){const u=this.uniforms[a].value;u&&u.isTexture?t.uniforms[a]={type:"t",value:u.toJSON(e).uuid}:u&&u.isColor?t.uniforms[a]={type:"c",value:u.getHex()}:u&&u.isVector2?t.uniforms[a]={type:"v2",value:u.toArray()}:u&&u.isVector3?t.uniforms[a]={type:"v3",value:u.toArray()}:u&&u.isVector4?t.uniforms[a]={type:"v4",value:u.toArray()}:u&&u.isMatrix3?t.uniforms[a]={type:"m3",value:u.toArray()}:u&&u.isMatrix4?t.uniforms[a]={type:"m4",value:u.toArray()}:t.uniforms[a]={value:u}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const r={};for(const a in this.extensions)this.extensions[a]===!0&&(r[a]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}}class vh extends Xn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new on,this.projectionMatrix=new on,this.projectionMatrixInverse=new on,this.coordinateSystem=Tr,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const mi=new le,Bu=new Gt,zu=new Gt;class dr extends vh{constructor(e=50,t=1,r=.1,a=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=a,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Af*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Jl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Af*2*Math.atan(Math.tan(Jl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,r){mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(mi.x,mi.y).multiplyScalar(-e/mi.z),mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(mi.x,mi.y).multiplyScalar(-e/mi.z)}getViewSize(e,t){return this.getViewBounds(e,Bu,zu),t.subVectors(zu,Bu)}setViewOffset(e,t,r,a,l,u){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=a,this.view.width=l,this.view.height=u,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Jl*.5*this.fov)/this.zoom,r=2*t,a=this.aspect*r,l=-.5*a;const u=this.view;if(this.view!==null&&this.view.enabled){const p=u.fullWidth,m=u.fullHeight;l+=u.offsetX*a/p,t-=u.offsetY*r/m,a*=u.width/p,r*=u.height/m}const o=this.filmOffset;o!==0&&(l+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(l,l+a,t,t-r,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ya=-90,Sa=1;class b0 extends Xn{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const a=new dr(ya,Sa,e,t);a.layers=this.layers,this.add(a);const l=new dr(ya,Sa,e,t);l.layers=this.layers,this.add(l);const u=new dr(ya,Sa,e,t);u.layers=this.layers,this.add(u);const o=new dr(ya,Sa,e,t);o.layers=this.layers,this.add(o);const p=new dr(ya,Sa,e,t);p.layers=this.layers,this.add(p);const m=new dr(ya,Sa,e,t);m.layers=this.layers,this.add(m)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[r,a,l,u,o,p]=t;for(const m of t)this.remove(m);if(e===Tr)r.up.set(0,1,0),r.lookAt(1,0,0),a.up.set(0,1,0),a.lookAt(-1,0,0),l.up.set(0,0,-1),l.lookAt(0,1,0),u.up.set(0,0,1),u.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),p.up.set(0,1,0),p.lookAt(0,0,-1);else if(e===Ns)r.up.set(0,-1,0),r.lookAt(-1,0,0),a.up.set(0,-1,0),a.lookAt(1,0,0),l.up.set(0,0,1),l.lookAt(0,1,0),u.up.set(0,0,-1),u.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),p.up.set(0,-1,0),p.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const m of t)this.add(m),m.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:a}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[l,u,o,p,m,x]=this.children,v=e.getRenderTarget(),y=e.getActiveCubeFace(),S=e.getActiveMipmapLevel(),T=e.xr.enabled;e.xr.enabled=!1;const F=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,a),e.render(t,l),e.setRenderTarget(r,1,a),e.render(t,u),e.setRenderTarget(r,2,a),e.render(t,o),e.setRenderTarget(r,3,a),e.render(t,p),e.setRenderTarget(r,4,a),e.render(t,m),r.texture.generateMipmaps=F,e.setRenderTarget(r,5,a),e.render(t,x),e.setRenderTarget(v,y,S),e.xr.enabled=T,r.texture.needsPMREMUpdate=!0}}class xh extends pn{constructor(e=[],t=Ia,r,a,l,u,o,p,m,x){super(e,t,r,a,l,u,o,p,m,x),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class E0 extends qr{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},a=[r,r,r,r,r,r];this.texture=new xh(a),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},a=new Ro(5,5,5),l=new Qn({name:"CubemapFromEquirect",uniforms:Na(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:In,blending:pr});l.uniforms.tEquirect.value=t;const u=new Pr(a,l),o=t.minFilter;return t.minFilter===Gi&&(t.minFilter=un),new b0(1,10,this).update(e,u),t.minFilter=o,u.geometry.dispose(),u.material.dispose(),this}clear(e,t=!0,r=!0,a=!0){const l=e.getRenderTarget();for(let u=0;u<6;u++)e.setRenderTarget(this,u),e.clear(t,r,a);e.setRenderTarget(l)}}class vs extends Xn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const M0={type:"move"};class yc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new vs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new vs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new le,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new le),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new vs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new le,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new le),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let a=null,l=null,u=null;const o=this._targetRay,p=this._grip,m=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(m&&e.hand){u=!0;for(const F of e.hand.values()){const E=t.getJointPose(F,r),b=this._getHandJoint(m,F);E!==null&&(b.matrix.fromArray(E.transform.matrix),b.matrix.decompose(b.position,b.rotation,b.scale),b.matrixWorldNeedsUpdate=!0,b.jointRadius=E.radius),b.visible=E!==null}const x=m.joints["index-finger-tip"],v=m.joints["thumb-tip"],y=x.position.distanceTo(v.position),S=.02,T=.005;m.inputState.pinching&&y>S+T?(m.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!m.inputState.pinching&&y<=S-T&&(m.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else p!==null&&e.gripSpace&&(l=t.getPose(e.gripSpace,r),l!==null&&(p.matrix.fromArray(l.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,l.linearVelocity?(p.hasLinearVelocity=!0,p.linearVelocity.copy(l.linearVelocity)):p.hasLinearVelocity=!1,l.angularVelocity?(p.hasAngularVelocity=!0,p.angularVelocity.copy(l.angularVelocity)):p.hasAngularVelocity=!1));o!==null&&(a=t.getPose(e.targetRaySpace,r),a===null&&l!==null&&(a=l),a!==null&&(o.matrix.fromArray(a.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,a.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(a.linearVelocity)):o.hasLinearVelocity=!1,a.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(a.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(M0)))}return o!==null&&(o.visible=a!==null),p!==null&&(p.visible=l!==null),m!==null&&(m.visible=u!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const r=new vs;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}}class w0 extends Xn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Yr,this.environmentIntensity=1,this.environmentRotation=new Yr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Eo extends pn{constructor(e=null,t=1,r=1,a,l,u,o,p,m=Wn,x=Wn,v,y){super(null,u,o,p,m,x,a,l,v,y),this.isDataTexture=!0,this.image={data:e,width:t,height:r},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Sc=new le,T0=new le,A0=new _t;class Oi{constructor(e=new le(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,a){return this.normal.set(e,t,r),this.constant=a,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){const a=Sc.subVectors(r,t).cross(T0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(a,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const r=e.delta(Sc),a=this.normal.dot(r);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const l=-(e.start.dot(this.normal)+this.constant)/a;return l<0||l>1?null:t.copy(e.start).addScaledVector(r,l)}intersectsLine(e){const t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const r=t||A0.getNormalMatrix(e),a=this.coplanarPoint(Sc).applyMatrix4(e),l=this.normal.applyMatrix3(r).normalize();return this.constant=-a.dot(l),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Ii=new Qf,C0=new Gt(.5,.5),xs=new le;class yh{constructor(e=new Oi,t=new Oi,r=new Oi,a=new Oi,l=new Oi,u=new Oi){this.planes=[e,t,r,a,l,u]}set(e,t,r,a,l,u){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(r),o[3].copy(a),o[4].copy(l),o[5].copy(u),this}copy(e){const t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=Tr,r=!1){const a=this.planes,l=e.elements,u=l[0],o=l[1],p=l[2],m=l[3],x=l[4],v=l[5],y=l[6],S=l[7],T=l[8],F=l[9],E=l[10],b=l[11],H=l[12],V=l[13],X=l[14],I=l[15];if(a[0].setComponents(m-u,S-x,b-T,I-H).normalize(),a[1].setComponents(m+u,S+x,b+T,I+H).normalize(),a[2].setComponents(m+o,S+v,b+F,I+V).normalize(),a[3].setComponents(m-o,S-v,b-F,I-V).normalize(),r)a[4].setComponents(p,y,E,X).normalize(),a[5].setComponents(m-p,S-y,b-E,I-X).normalize();else if(a[4].setComponents(m-p,S-y,b-E,I-X).normalize(),t===Tr)a[5].setComponents(m+p,S+y,b+E,I+X).normalize();else if(t===Ns)a[5].setComponents(p,y,E,X).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ii.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ii.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ii)}intersectsSprite(e){Ii.center.set(0,0,0);const t=C0.distanceTo(e.center);return Ii.radius=.7071067811865476+t,Ii.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ii)}intersectsSphere(e){const t=this.planes,r=e.center,a=-e.radius;for(let l=0;l<6;l++)if(t[l].distanceToPoint(r)<a)return!1;return!0}intersectsBox(e){const t=this.planes;for(let r=0;r<6;r++){const a=t[r];if(xs.x=a.normal.x>0?e.max.x:e.min.x,xs.y=a.normal.y>0?e.max.y:e.min.y,xs.z=a.normal.z>0?e.max.z:e.min.z,a.distanceToPoint(xs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Sh extends pn{constructor(e,t,r=bi,a,l,u,o=Wn,p=Wn,m,x=yo,v=1){if(x!==yo&&x!==So)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const y={width:e,height:t,depth:v};super(y,a,l,u,o,p,x,r,m),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Jf(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class bh extends pn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class za extends Ei{constructor(e=1,t=1,r=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:r,heightSegments:a};const l=e/2,u=t/2,o=Math.floor(r),p=Math.floor(a),m=o+1,x=p+1,v=e/o,y=t/p,S=[],T=[],F=[],E=[];for(let b=0;b<x;b++){const H=b*y-u;for(let V=0;V<m;V++){const X=V*v-l;T.push(X,-H,0),F.push(0,0,1),E.push(V/o),E.push(1-b/p)}}for(let b=0;b<p;b++)for(let H=0;H<o;H++){const V=H+m*b,X=H+m*(b+1),I=H+1+m*(b+1),C=H+1+m*b;S.push(V,X,C),S.push(X,I,C)}this.setIndex(S),this.setAttribute("position",new Vi(T,3)),this.setAttribute("normal",new Vi(F,3)),this.setAttribute("uv",new Vi(E,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new za(e.width,e.height,e.widthSegments,e.heightSegments)}}class R0 extends qs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Om,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class P0 extends qs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Eh extends vh{constructor(e=-1,t=1,r=1,a=-1,l=.1,u=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=a,this.near=l,this.far=u,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,a,l,u){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=a,this.view.width=l,this.view.height=u,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,a=(this.top+this.bottom)/2;let l=r-e,u=r+e,o=a+t,p=a-t;if(this.view!==null&&this.view.enabled){const m=(this.right-this.left)/this.view.fullWidth/this.zoom,x=(this.top-this.bottom)/this.view.fullHeight/this.zoom;l+=m*this.view.offsetX,u=l+m*this.view.width,o-=x*this.view.offsetY,p=o-x*this.view.height}this.projectionMatrix.makeOrthographic(l,u,o,p,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class D0 extends dr{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function Gu(n,e,t,r){const a=L0(r);switch(t){case sh:return n*e;case ch:return n*e/a.components*a.byteLength;case Yf:return n*e/a.components*a.byteLength;case jf:return n*e*2/a.components*a.byteLength;case Kf:return n*e*2/a.components*a.byteLength;case lh:return n*e*3/a.components*a.byteLength;case An:return n*e*4/a.components*a.byteLength;case Zf:return n*e*4/a.components*a.byteLength;case Ts:case As:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Cs:case Rs:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Qc:case tf:return Math.max(n,16)*Math.max(e,8)/4;case Jc:case ef:return Math.max(n,8)*Math.max(e,8)/2;case nf:case rf:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case af:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case of:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case sf:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case lf:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case cf:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case ff:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case uf:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case df:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case hf:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case pf:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case mf:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case _f:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case gf:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case vf:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case xf:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case yf:case Sf:case bf:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Ef:case Mf:return Math.ceil(n/4)*Math.ceil(e/4)*8;case wf:case Tf:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function L0(n){switch(n){case Jn:case Wf:return{byteLength:1,components:1};case vo:case Xf:case ei:return{byteLength:2,components:1};case $f:case qf:return{byteLength:2,components:4};case bi:case $s:case Zn:return{byteLength:4,components:1};case ah:case oh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Vf}}));typeof window<"u"&&(window.__THREE__?pt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Vf);function Mh(){let n=null,e=!1,t=null,r=null;function a(l,u){t(l,u),r=n.requestAnimationFrame(a)}return{start:function(){e!==!0&&t!==null&&(r=n.requestAnimationFrame(a),e=!0)},stop:function(){n.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(l){t=l},setContext:function(l){n=l}}}function F0(n){const e=new WeakMap;function t(o,p){const m=o.array,x=o.usage,v=m.byteLength,y=n.createBuffer();n.bindBuffer(p,y),n.bufferData(p,m,x),o.onUploadCallback();let S;if(m instanceof Float32Array)S=n.FLOAT;else if(typeof Float16Array<"u"&&m instanceof Float16Array)S=n.HALF_FLOAT;else if(m instanceof Uint16Array)o.isFloat16BufferAttribute?S=n.HALF_FLOAT:S=n.UNSIGNED_SHORT;else if(m instanceof Int16Array)S=n.SHORT;else if(m instanceof Uint32Array)S=n.UNSIGNED_INT;else if(m instanceof Int32Array)S=n.INT;else if(m instanceof Int8Array)S=n.BYTE;else if(m instanceof Uint8Array)S=n.UNSIGNED_BYTE;else if(m instanceof Uint8ClampedArray)S=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+m);return{buffer:y,type:S,bytesPerElement:m.BYTES_PER_ELEMENT,version:o.version,size:v}}function r(o,p,m){const x=p.array,v=p.updateRanges;if(n.bindBuffer(m,o),v.length===0)n.bufferSubData(m,0,x);else{v.sort((S,T)=>S.start-T.start);let y=0;for(let S=1;S<v.length;S++){const T=v[y],F=v[S];F.start<=T.start+T.count+1?T.count=Math.max(T.count,F.start+F.count-T.start):(++y,v[y]=F)}v.length=y+1;for(let S=0,T=v.length;S<T;S++){const F=v[S];n.bufferSubData(m,F.start*x.BYTES_PER_ELEMENT,x,F.start,F.count)}p.clearUpdateRanges()}p.onUploadCallback()}function a(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function l(o){o.isInterleavedBufferAttribute&&(o=o.data);const p=e.get(o);p&&(n.deleteBuffer(p.buffer),e.delete(o))}function u(o,p){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const x=e.get(o);(!x||x.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const m=e.get(o);if(m===void 0)e.set(o,t(o,p));else if(m.version<o.version){if(m.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(m.buffer,o,p),m.version=o.version}}return{get:a,remove:l,update:u}}var I0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,U0=`#ifdef USE_ALPHAHASH
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
#endif`,N0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,O0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,k0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,B0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,z0=`#ifdef USE_AOMAP
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
#endif`,G0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,H0=`#ifdef USE_BATCHING
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
#endif`,V0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,W0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,X0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,$0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,q0=`#ifdef USE_IRIDESCENCE
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
#endif`,Y0=`#ifdef USE_BUMPMAP
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
#endif`,j0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,K0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Z0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,J0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Q0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,e_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,t_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,n_=`#if defined( USE_COLOR_ALPHA )
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
#endif`,r_=`#define PI 3.141592653589793
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
} // validated`,i_=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,a_=`vec3 transformedNormal = objectNormal;
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
#endif`,o_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,s_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,l_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,c_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,f_="gl_FragColor = linearToOutputTexel( gl_FragColor );",u_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,d_=`#ifdef USE_ENVMAP
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
#endif`,h_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,p_=`#ifdef USE_ENVMAP
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
#endif`,m_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,__=`#ifdef USE_ENVMAP
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
#endif`,g_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,v_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,x_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,y_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,S_=`#ifdef USE_GRADIENTMAP
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
}`,b_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,E_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,M_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,w_=`uniform bool receiveShadow;
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
#endif`,T_=`#ifdef USE_ENVMAP
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
#endif`,A_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,C_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,R_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,P_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,D_=`PhysicalMaterial material;
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
#endif`,L_=`uniform sampler2D dfgLUT;
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
}`,F_=`
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
#endif`,I_=`#if defined( RE_IndirectDiffuse )
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
#endif`,U_=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,N_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,O_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,k_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,B_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,z_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,G_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,H_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,V_=`#if defined( USE_POINTS_UV )
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
#endif`,W_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,X_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,$_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,q_=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Y_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,j_=`#ifdef USE_MORPHTARGETS
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
#endif`,K_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Z_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,J_=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Q_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,eg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,tg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,ng=`#ifdef USE_NORMALMAP
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
#endif`,rg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ig=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ag=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,og=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,sg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,lg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,cg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,fg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ug=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,hg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,pg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,mg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,_g=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,gg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,vg=`float getShadowMask() {
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
}`,xg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,yg=`#ifdef USE_SKINNING
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
#endif`,Sg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,bg=`#ifdef USE_SKINNING
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
#endif`,Eg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Mg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,wg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Tg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Ag=`#ifdef USE_TRANSMISSION
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
#endif`,Cg=`#ifdef USE_TRANSMISSION
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
#endif`,Rg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Pg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Dg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Lg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Fg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ig=`uniform sampler2D t2D;
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
}`,Ug=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ng=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Og=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,kg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bg=`#include <common>
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
}`,zg=`#if DEPTH_PACKING == 3200
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
}`,Gg=`#define DISTANCE
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
}`,Hg=`#define DISTANCE
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
}`,Vg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Wg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xg=`uniform float scale;
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
}`,$g=`uniform vec3 diffuse;
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
}`,qg=`#include <common>
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
}`,Yg=`uniform vec3 diffuse;
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
}`,jg=`#define LAMBERT
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
}`,Kg=`#define LAMBERT
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
}`,Zg=`#define MATCAP
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
}`,Jg=`#define MATCAP
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
}`,Qg=`#define NORMAL
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
}`,ev=`#define NORMAL
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
}`,tv=`#define PHONG
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
}`,nv=`#define PHONG
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
}`,rv=`#define STANDARD
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
}`,iv=`#define STANDARD
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
}`,av=`#define TOON
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
}`,ov=`#define TOON
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
}`,sv=`uniform float size;
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
}`,lv=`uniform vec3 diffuse;
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
}`,cv=`#include <common>
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
}`,fv=`uniform vec3 color;
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
}`,uv=`uniform float rotation;
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
}`,dv=`uniform vec3 diffuse;
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
}`,vt={alphahash_fragment:I0,alphahash_pars_fragment:U0,alphamap_fragment:N0,alphamap_pars_fragment:O0,alphatest_fragment:k0,alphatest_pars_fragment:B0,aomap_fragment:z0,aomap_pars_fragment:G0,batching_pars_vertex:H0,batching_vertex:V0,begin_vertex:W0,beginnormal_vertex:X0,bsdfs:$0,iridescence_fragment:q0,bumpmap_pars_fragment:Y0,clipping_planes_fragment:j0,clipping_planes_pars_fragment:K0,clipping_planes_pars_vertex:Z0,clipping_planes_vertex:J0,color_fragment:Q0,color_pars_fragment:e_,color_pars_vertex:t_,color_vertex:n_,common:r_,cube_uv_reflection_fragment:i_,defaultnormal_vertex:a_,displacementmap_pars_vertex:o_,displacementmap_vertex:s_,emissivemap_fragment:l_,emissivemap_pars_fragment:c_,colorspace_fragment:f_,colorspace_pars_fragment:u_,envmap_fragment:d_,envmap_common_pars_fragment:h_,envmap_pars_fragment:p_,envmap_pars_vertex:m_,envmap_physical_pars_fragment:T_,envmap_vertex:__,fog_vertex:g_,fog_pars_vertex:v_,fog_fragment:x_,fog_pars_fragment:y_,gradientmap_pars_fragment:S_,lightmap_pars_fragment:b_,lights_lambert_fragment:E_,lights_lambert_pars_fragment:M_,lights_pars_begin:w_,lights_toon_fragment:A_,lights_toon_pars_fragment:C_,lights_phong_fragment:R_,lights_phong_pars_fragment:P_,lights_physical_fragment:D_,lights_physical_pars_fragment:L_,lights_fragment_begin:F_,lights_fragment_maps:I_,lights_fragment_end:U_,logdepthbuf_fragment:N_,logdepthbuf_pars_fragment:O_,logdepthbuf_pars_vertex:k_,logdepthbuf_vertex:B_,map_fragment:z_,map_pars_fragment:G_,map_particle_fragment:H_,map_particle_pars_fragment:V_,metalnessmap_fragment:W_,metalnessmap_pars_fragment:X_,morphinstance_vertex:$_,morphcolor_vertex:q_,morphnormal_vertex:Y_,morphtarget_pars_vertex:j_,morphtarget_vertex:K_,normal_fragment_begin:Z_,normal_fragment_maps:J_,normal_pars_fragment:Q_,normal_pars_vertex:eg,normal_vertex:tg,normalmap_pars_fragment:ng,clearcoat_normal_fragment_begin:rg,clearcoat_normal_fragment_maps:ig,clearcoat_pars_fragment:ag,iridescence_pars_fragment:og,opaque_fragment:sg,packing:lg,premultiplied_alpha_fragment:cg,project_vertex:fg,dithering_fragment:ug,dithering_pars_fragment:dg,roughnessmap_fragment:hg,roughnessmap_pars_fragment:pg,shadowmap_pars_fragment:mg,shadowmap_pars_vertex:_g,shadowmap_vertex:gg,shadowmask_pars_fragment:vg,skinbase_vertex:xg,skinning_pars_vertex:yg,skinning_vertex:Sg,skinnormal_vertex:bg,specularmap_fragment:Eg,specularmap_pars_fragment:Mg,tonemapping_fragment:wg,tonemapping_pars_fragment:Tg,transmission_fragment:Ag,transmission_pars_fragment:Cg,uv_pars_fragment:Rg,uv_pars_vertex:Pg,uv_vertex:Dg,worldpos_vertex:Lg,background_vert:Fg,background_frag:Ig,backgroundCube_vert:Ug,backgroundCube_frag:Ng,cube_vert:Og,cube_frag:kg,depth_vert:Bg,depth_frag:zg,distanceRGBA_vert:Gg,distanceRGBA_frag:Hg,equirect_vert:Vg,equirect_frag:Wg,linedashed_vert:Xg,linedashed_frag:$g,meshbasic_vert:qg,meshbasic_frag:Yg,meshlambert_vert:jg,meshlambert_frag:Kg,meshmatcap_vert:Zg,meshmatcap_frag:Jg,meshnormal_vert:Qg,meshnormal_frag:ev,meshphong_vert:tv,meshphong_frag:nv,meshphysical_vert:rv,meshphysical_frag:iv,meshtoon_vert:av,meshtoon_frag:ov,points_vert:sv,points_frag:lv,shadow_vert:cv,shadow_frag:fv,sprite_vert:uv,sprite_frag:dv},He={common:{diffuse:{value:new zt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new _t},alphaMap:{value:null},alphaMapTransform:{value:new _t},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new _t}},envmap:{envMap:{value:null},envMapRotation:{value:new _t},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new _t}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new _t}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new _t},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new _t},normalScale:{value:new Gt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new _t},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new _t}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new _t}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new _t}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new zt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new zt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new _t},alphaTest:{value:0},uvTransform:{value:new _t}},sprite:{diffuse:{value:new zt(16777215)},opacity:{value:1},center:{value:new Gt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new _t},alphaMap:{value:null},alphaMapTransform:{value:new _t},alphaTest:{value:0}}},Er={basic:{uniforms:wn([He.common,He.specularmap,He.envmap,He.aomap,He.lightmap,He.fog]),vertexShader:vt.meshbasic_vert,fragmentShader:vt.meshbasic_frag},lambert:{uniforms:wn([He.common,He.specularmap,He.envmap,He.aomap,He.lightmap,He.emissivemap,He.bumpmap,He.normalmap,He.displacementmap,He.fog,He.lights,{emissive:{value:new zt(0)}}]),vertexShader:vt.meshlambert_vert,fragmentShader:vt.meshlambert_frag},phong:{uniforms:wn([He.common,He.specularmap,He.envmap,He.aomap,He.lightmap,He.emissivemap,He.bumpmap,He.normalmap,He.displacementmap,He.fog,He.lights,{emissive:{value:new zt(0)},specular:{value:new zt(1118481)},shininess:{value:30}}]),vertexShader:vt.meshphong_vert,fragmentShader:vt.meshphong_frag},standard:{uniforms:wn([He.common,He.envmap,He.aomap,He.lightmap,He.emissivemap,He.bumpmap,He.normalmap,He.displacementmap,He.roughnessmap,He.metalnessmap,He.fog,He.lights,{emissive:{value:new zt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:vt.meshphysical_vert,fragmentShader:vt.meshphysical_frag},toon:{uniforms:wn([He.common,He.aomap,He.lightmap,He.emissivemap,He.bumpmap,He.normalmap,He.displacementmap,He.gradientmap,He.fog,He.lights,{emissive:{value:new zt(0)}}]),vertexShader:vt.meshtoon_vert,fragmentShader:vt.meshtoon_frag},matcap:{uniforms:wn([He.common,He.bumpmap,He.normalmap,He.displacementmap,He.fog,{matcap:{value:null}}]),vertexShader:vt.meshmatcap_vert,fragmentShader:vt.meshmatcap_frag},points:{uniforms:wn([He.points,He.fog]),vertexShader:vt.points_vert,fragmentShader:vt.points_frag},dashed:{uniforms:wn([He.common,He.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:vt.linedashed_vert,fragmentShader:vt.linedashed_frag},depth:{uniforms:wn([He.common,He.displacementmap]),vertexShader:vt.depth_vert,fragmentShader:vt.depth_frag},normal:{uniforms:wn([He.common,He.bumpmap,He.normalmap,He.displacementmap,{opacity:{value:1}}]),vertexShader:vt.meshnormal_vert,fragmentShader:vt.meshnormal_frag},sprite:{uniforms:wn([He.sprite,He.fog]),vertexShader:vt.sprite_vert,fragmentShader:vt.sprite_frag},background:{uniforms:{uvTransform:{value:new _t},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:vt.background_vert,fragmentShader:vt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new _t}},vertexShader:vt.backgroundCube_vert,fragmentShader:vt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:vt.cube_vert,fragmentShader:vt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:vt.equirect_vert,fragmentShader:vt.equirect_frag},distanceRGBA:{uniforms:wn([He.common,He.displacementmap,{referencePosition:{value:new le},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:vt.distanceRGBA_vert,fragmentShader:vt.distanceRGBA_frag},shadow:{uniforms:wn([He.lights,He.fog,{color:{value:new zt(0)},opacity:{value:1}}]),vertexShader:vt.shadow_vert,fragmentShader:vt.shadow_frag}};Er.physical={uniforms:wn([Er.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new _t},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new _t},clearcoatNormalScale:{value:new Gt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new _t},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new _t},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new _t},sheen:{value:0},sheenColor:{value:new zt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new _t},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new _t},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new _t},transmissionSamplerSize:{value:new Gt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new _t},attenuationDistance:{value:0},attenuationColor:{value:new zt(0)},specularColor:{value:new zt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new _t},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new _t},anisotropyVector:{value:new Gt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new _t}}]),vertexShader:vt.meshphysical_vert,fragmentShader:vt.meshphysical_frag};const ys={r:0,b:0,g:0},Ui=new Yr,hv=new on;function pv(n,e,t,r,a,l,u){const o=new zt(0);let p=l===!0?0:1,m,x,v=null,y=0,S=null;function T(V){let X=V.isScene===!0?V.background:null;return X&&X.isTexture&&(X=(V.backgroundBlurriness>0?t:e).get(X)),X}function F(V){let X=!1;const I=T(V);I===null?b(o,p):I&&I.isColor&&(b(I,1),X=!0);const C=n.xr.getEnvironmentBlendMode();C==="additive"?r.buffers.color.setClear(0,0,0,1,u):C==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,u),(n.autoClear||X)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function E(V,X){const I=T(X);I&&(I.isCubeTexture||I.mapping===Xs)?(x===void 0&&(x=new Pr(new Ro(1,1,1),new Qn({name:"BackgroundCubeMaterial",uniforms:Na(Er.backgroundCube.uniforms),vertexShader:Er.backgroundCube.vertexShader,fragmentShader:Er.backgroundCube.fragmentShader,side:In,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),x.geometry.deleteAttribute("normal"),x.geometry.deleteAttribute("uv"),x.onBeforeRender=function(C,L,W){this.matrixWorld.copyPosition(W.matrixWorld)},Object.defineProperty(x.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(x)),Ui.copy(X.backgroundRotation),Ui.x*=-1,Ui.y*=-1,Ui.z*=-1,I.isCubeTexture&&I.isRenderTargetTexture===!1&&(Ui.y*=-1,Ui.z*=-1),x.material.uniforms.envMap.value=I,x.material.uniforms.flipEnvMap.value=I.isCubeTexture&&I.isRenderTargetTexture===!1?-1:1,x.material.uniforms.backgroundBlurriness.value=X.backgroundBlurriness,x.material.uniforms.backgroundIntensity.value=X.backgroundIntensity,x.material.uniforms.backgroundRotation.value.setFromMatrix4(hv.makeRotationFromEuler(Ui)),x.material.toneMapped=Rt.getTransfer(I.colorSpace)!==Bt,(v!==I||y!==I.version||S!==n.toneMapping)&&(x.material.needsUpdate=!0,v=I,y=I.version,S=n.toneMapping),x.layers.enableAll(),V.unshift(x,x.geometry,x.material,0,0,null)):I&&I.isTexture&&(m===void 0&&(m=new Pr(new za(2,2),new Qn({name:"BackgroundMaterial",uniforms:Na(Er.background.uniforms),vertexShader:Er.background.vertexShader,fragmentShader:Er.background.fragmentShader,side:Si,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(m)),m.material.uniforms.t2D.value=I,m.material.uniforms.backgroundIntensity.value=X.backgroundIntensity,m.material.toneMapped=Rt.getTransfer(I.colorSpace)!==Bt,I.matrixAutoUpdate===!0&&I.updateMatrix(),m.material.uniforms.uvTransform.value.copy(I.matrix),(v!==I||y!==I.version||S!==n.toneMapping)&&(m.material.needsUpdate=!0,v=I,y=I.version,S=n.toneMapping),m.layers.enableAll(),V.unshift(m,m.geometry,m.material,0,0,null))}function b(V,X){V.getRGB(ys,gh(n)),r.buffers.color.setClear(ys.r,ys.g,ys.b,X,u)}function H(){x!==void 0&&(x.geometry.dispose(),x.material.dispose(),x=void 0),m!==void 0&&(m.geometry.dispose(),m.material.dispose(),m=void 0)}return{getClearColor:function(){return o},setClearColor:function(V,X=1){o.set(V),p=X,b(o,p)},getClearAlpha:function(){return p},setClearAlpha:function(V){p=V,b(o,p)},render:F,addToRenderList:E,dispose:H}}function mv(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),r={},a=y(null);let l=a,u=!1;function o(w,z,B,Y,K){let j=!1;const J=v(Y,B,z);l!==J&&(l=J,m(l.object)),j=S(w,Y,B,K),j&&T(w,Y,B,K),K!==null&&e.update(K,n.ELEMENT_ARRAY_BUFFER),(j||u)&&(u=!1,X(w,z,B,Y),K!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(K).buffer))}function p(){return n.createVertexArray()}function m(w){return n.bindVertexArray(w)}function x(w){return n.deleteVertexArray(w)}function v(w,z,B){const Y=B.wireframe===!0;let K=r[w.id];K===void 0&&(K={},r[w.id]=K);let j=K[z.id];j===void 0&&(j={},K[z.id]=j);let J=j[Y];return J===void 0&&(J=y(p()),j[Y]=J),J}function y(w){const z=[],B=[],Y=[];for(let K=0;K<t;K++)z[K]=0,B[K]=0,Y[K]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:B,attributeDivisors:Y,object:w,attributes:{},index:null}}function S(w,z,B,Y){const K=l.attributes,j=z.attributes;let J=0;const ce=B.getAttributes();for(const te in ce)if(ce[te].location>=0){const be=K[te];let $e=j[te];if($e===void 0&&(te==="instanceMatrix"&&w.instanceMatrix&&($e=w.instanceMatrix),te==="instanceColor"&&w.instanceColor&&($e=w.instanceColor)),be===void 0||be.attribute!==$e||$e&&be.data!==$e.data)return!0;J++}return l.attributesNum!==J||l.index!==Y}function T(w,z,B,Y){const K={},j=z.attributes;let J=0;const ce=B.getAttributes();for(const te in ce)if(ce[te].location>=0){let be=j[te];be===void 0&&(te==="instanceMatrix"&&w.instanceMatrix&&(be=w.instanceMatrix),te==="instanceColor"&&w.instanceColor&&(be=w.instanceColor));const $e={};$e.attribute=be,be&&be.data&&($e.data=be.data),K[te]=$e,J++}l.attributes=K,l.attributesNum=J,l.index=Y}function F(){const w=l.newAttributes;for(let z=0,B=w.length;z<B;z++)w[z]=0}function E(w){b(w,0)}function b(w,z){const B=l.newAttributes,Y=l.enabledAttributes,K=l.attributeDivisors;B[w]=1,Y[w]===0&&(n.enableVertexAttribArray(w),Y[w]=1),K[w]!==z&&(n.vertexAttribDivisor(w,z),K[w]=z)}function H(){const w=l.newAttributes,z=l.enabledAttributes;for(let B=0,Y=z.length;B<Y;B++)z[B]!==w[B]&&(n.disableVertexAttribArray(B),z[B]=0)}function V(w,z,B,Y,K,j,J){J===!0?n.vertexAttribIPointer(w,z,B,K,j):n.vertexAttribPointer(w,z,B,Y,K,j)}function X(w,z,B,Y){F();const K=Y.attributes,j=B.getAttributes(),J=z.defaultAttributeValues;for(const ce in j){const te=j[ce];if(te.location>=0){let Se=K[ce];if(Se===void 0&&(ce==="instanceMatrix"&&w.instanceMatrix&&(Se=w.instanceMatrix),ce==="instanceColor"&&w.instanceColor&&(Se=w.instanceColor)),Se!==void 0){const be=Se.normalized,$e=Se.itemSize,st=e.get(Se);if(st===void 0)continue;const ht=st.buffer,xt=st.type,gt=st.bytesPerElement,_e=xt===n.INT||xt===n.UNSIGNED_INT||Se.gpuType===$s;if(Se.isInterleavedBufferAttribute){const ge=Se.data,Oe=ge.stride,et=Se.offset;if(ge.isInstancedInterleavedBuffer){for(let qe=0;qe<te.locationSize;qe++)b(te.location+qe,ge.meshPerAttribute);w.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let qe=0;qe<te.locationSize;qe++)E(te.location+qe);n.bindBuffer(n.ARRAY_BUFFER,ht);for(let qe=0;qe<te.locationSize;qe++)V(te.location+qe,$e/te.locationSize,xt,be,Oe*gt,(et+$e/te.locationSize*qe)*gt,_e)}else{if(Se.isInstancedBufferAttribute){for(let ge=0;ge<te.locationSize;ge++)b(te.location+ge,Se.meshPerAttribute);w.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=Se.meshPerAttribute*Se.count)}else for(let ge=0;ge<te.locationSize;ge++)E(te.location+ge);n.bindBuffer(n.ARRAY_BUFFER,ht);for(let ge=0;ge<te.locationSize;ge++)V(te.location+ge,$e/te.locationSize,xt,be,$e*gt,$e/te.locationSize*ge*gt,_e)}}else if(J!==void 0){const be=J[ce];if(be!==void 0)switch(be.length){case 2:n.vertexAttrib2fv(te.location,be);break;case 3:n.vertexAttrib3fv(te.location,be);break;case 4:n.vertexAttrib4fv(te.location,be);break;default:n.vertexAttrib1fv(te.location,be)}}}}H()}function I(){W();for(const w in r){const z=r[w];for(const B in z){const Y=z[B];for(const K in Y)x(Y[K].object),delete Y[K];delete z[B]}delete r[w]}}function C(w){if(r[w.id]===void 0)return;const z=r[w.id];for(const B in z){const Y=z[B];for(const K in Y)x(Y[K].object),delete Y[K];delete z[B]}delete r[w.id]}function L(w){for(const z in r){const B=r[z];if(B[w.id]===void 0)continue;const Y=B[w.id];for(const K in Y)x(Y[K].object),delete Y[K];delete B[w.id]}}function W(){P(),u=!0,l!==a&&(l=a,m(l.object))}function P(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:o,reset:W,resetDefaultState:P,dispose:I,releaseStatesOfGeometry:C,releaseStatesOfProgram:L,initAttributes:F,enableAttribute:E,disableUnusedAttributes:H}}function _v(n,e,t){let r;function a(m){r=m}function l(m,x){n.drawArrays(r,m,x),t.update(x,r,1)}function u(m,x,v){v!==0&&(n.drawArraysInstanced(r,m,x,v),t.update(x,r,v))}function o(m,x,v){if(v===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,m,0,x,0,v);let S=0;for(let T=0;T<v;T++)S+=x[T];t.update(S,r,1)}function p(m,x,v,y){if(v===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let T=0;T<m.length;T++)u(m[T],x[T],y[T]);else{S.multiDrawArraysInstancedWEBGL(r,m,0,x,0,y,0,v);let T=0;for(let F=0;F<v;F++)T+=x[F]*y[F];t.update(T,r,1)}}this.setMode=a,this.render=l,this.renderInstances=u,this.renderMultiDraw=o,this.renderMultiDrawInstances=p}function gv(n,e,t,r){let a;function l(){if(a!==void 0)return a;if(e.has("EXT_texture_filter_anisotropic")===!0){const L=e.get("EXT_texture_filter_anisotropic");a=n.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function u(L){return!(L!==An&&r.convert(L)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(L){const W=L===ei&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(L!==Jn&&r.convert(L)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&L!==Zn&&!W)}function p(L){if(L==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";L="mediump"}return L==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let m=t.precision!==void 0?t.precision:"highp";const x=p(m);x!==m&&(pt("WebGLRenderer:",m,"not supported, using",x,"instead."),m=x);const v=t.logarithmicDepthBuffer===!0,y=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),S=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),T=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),F=n.getParameter(n.MAX_TEXTURE_SIZE),E=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),b=n.getParameter(n.MAX_VERTEX_ATTRIBS),H=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),V=n.getParameter(n.MAX_VARYING_VECTORS),X=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),I=T>0,C=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:l,getMaxPrecision:p,textureFormatReadable:u,textureTypeReadable:o,precision:m,logarithmicDepthBuffer:v,reversedDepthBuffer:y,maxTextures:S,maxVertexTextures:T,maxTextureSize:F,maxCubemapSize:E,maxAttributes:b,maxVertexUniforms:H,maxVaryings:V,maxFragmentUniforms:X,vertexTextures:I,maxSamples:C}}function vv(n){const e=this;let t=null,r=0,a=!1,l=!1;const u=new Oi,o=new _t,p={value:null,needsUpdate:!1};this.uniform=p,this.numPlanes=0,this.numIntersection=0,this.init=function(v,y){const S=v.length!==0||y||r!==0||a;return a=y,r=v.length,S},this.beginShadows=function(){l=!0,x(null)},this.endShadows=function(){l=!1},this.setGlobalState=function(v,y){t=x(v,y,0)},this.setState=function(v,y,S){const T=v.clippingPlanes,F=v.clipIntersection,E=v.clipShadows,b=n.get(v);if(!a||T===null||T.length===0||l&&!E)l?x(null):m();else{const H=l?0:r,V=H*4;let X=b.clippingState||null;p.value=X,X=x(T,y,V,S);for(let I=0;I!==V;++I)X[I]=t[I];b.clippingState=X,this.numIntersection=F?this.numPlanes:0,this.numPlanes+=H}};function m(){p.value!==t&&(p.value=t,p.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function x(v,y,S,T){const F=v!==null?v.length:0;let E=null;if(F!==0){if(E=p.value,T!==!0||E===null){const b=S+F*4,H=y.matrixWorldInverse;o.getNormalMatrix(H),(E===null||E.length<b)&&(E=new Float32Array(b));for(let V=0,X=S;V!==F;++V,X+=4)u.copy(v[V]).applyMatrix4(H,o),u.normal.toArray(E,X),E[X+3]=u.constant}p.value=E,p.needsUpdate=!0}return e.numPlanes=F,e.numIntersection=0,E}}function xv(n){let e=new WeakMap;function t(u,o){return o===jc?u.mapping=Ia:o===Kc&&(u.mapping=Ua),u}function r(u){if(u&&u.isTexture){const o=u.mapping;if(o===jc||o===Kc)if(e.has(u)){const p=e.get(u).texture;return t(p,u.mapping)}else{const p=u.image;if(p&&p.height>0){const m=new E0(p.height);return m.fromEquirectangularTexture(n,u),e.set(u,m),u.addEventListener("dispose",a),t(m.texture,u.mapping)}else return null}}return u}function a(u){const o=u.target;o.removeEventListener("dispose",a);const p=e.get(o);p!==void 0&&(e.delete(o),p.dispose())}function l(){e=new WeakMap}return{get:r,dispose:l}}const gi=4,Hu=[.125,.215,.35,.446,.526,.582],Bi=20,yv=256,io=new Eh,Vu=new zt;let bc=null,Ec=0,Mc=0,wc=!1;const Sv=new le;class Wu{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,r=.1,a=100,l={}){const{size:u=256,position:o=Sv}=l;bc=this._renderer.getRenderTarget(),Ec=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),wc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(u);const p=this._allocateTargets();return p.depthBuffer=!0,this._sceneToCubeUV(e,r,a,p,o),t>0&&this._blur(p,0,0,t),this._applyPMREM(p),this._cleanup(p),p}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=qu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=$u(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(bc,Ec,Mc),this._renderer.xr.enabled=wc,e.scissorTest=!1,ba(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ia||e.mapping===Ua?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),bc=this._renderer.getRenderTarget(),Ec=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),wc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:un,minFilter:un,generateMipmaps:!1,type:ei,format:An,colorSpace:Rr,depthBuffer:!1},a=Xu(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Xu(e,t,r);const{_lodMax:l}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=bv(l)),this._blurMaterial=Mv(l,e,t),this._ggxMaterial=Ev(l,e,t)}return a}_compileMaterial(e){const t=new Pr(new Ei,e);this._renderer.compile(t,io)}_sceneToCubeUV(e,t,r,a,l){const p=new dr(90,1,t,r),m=[1,-1,1,1,1,1],x=[1,1,1,-1,-1,-1],v=this._renderer,y=v.autoClear,S=v.toneMapping;v.getClearColor(Vu),v.toneMapping=Xr,v.autoClear=!1,v.state.buffers.depth.getReversed()&&(v.setRenderTarget(a),v.clearDepth(),v.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Pr(new Ro,new eu({name:"PMREM.Background",side:In,depthWrite:!1,depthTest:!1})));const F=this._backgroundBox,E=F.material;let b=!1;const H=e.background;H?H.isColor&&(E.color.copy(H),e.background=null,b=!0):(E.color.copy(Vu),b=!0);for(let V=0;V<6;V++){const X=V%3;X===0?(p.up.set(0,m[V],0),p.position.set(l.x,l.y,l.z),p.lookAt(l.x+x[V],l.y,l.z)):X===1?(p.up.set(0,0,m[V]),p.position.set(l.x,l.y,l.z),p.lookAt(l.x,l.y+x[V],l.z)):(p.up.set(0,m[V],0),p.position.set(l.x,l.y,l.z),p.lookAt(l.x,l.y,l.z+x[V]));const I=this._cubeSize;ba(a,X*I,V>2?I:0,I,I),v.setRenderTarget(a),b&&v.render(F,p),v.render(e,p)}v.toneMapping=S,v.autoClear=y,e.background=H}_textureToCubeUV(e,t){const r=this._renderer,a=e.mapping===Ia||e.mapping===Ua;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=qu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=$u());const l=a?this._cubemapMaterial:this._equirectMaterial,u=this._lodMeshes[0];u.material=l;const o=l.uniforms;o.envMap.value=e;const p=this._cubeSize;ba(t,0,0,3*p,2*p),r.setRenderTarget(t),r.render(u,io)}_applyPMREM(e){const t=this._renderer,r=t.autoClear;t.autoClear=!1;const a=this._lodMeshes.length;for(let l=1;l<a;l++)this._applyGGXFilter(e,l-1,l);t.autoClear=r}_applyGGXFilter(e,t,r){const a=this._renderer,l=this._pingPongRenderTarget,u=this._ggxMaterial,o=this._lodMeshes[r];o.material=u;const p=u.uniforms,m=r/(this._lodMeshes.length-1),x=t/(this._lodMeshes.length-1),v=Math.sqrt(m*m-x*x),y=.05+m*.95,S=v*y,{_lodMax:T}=this,F=this._sizeLods[r],E=3*F*(r>T-gi?r-T+gi:0),b=4*(this._cubeSize-F);p.envMap.value=e.texture,p.roughness.value=S,p.mipInt.value=T-t,ba(l,E,b,3*F,2*F),a.setRenderTarget(l),a.render(o,io),p.envMap.value=l.texture,p.roughness.value=0,p.mipInt.value=T-r,ba(e,E,b,3*F,2*F),a.setRenderTarget(e),a.render(o,io)}_blur(e,t,r,a,l){const u=this._pingPongRenderTarget;this._halfBlur(e,u,t,r,a,"latitudinal",l),this._halfBlur(u,e,r,r,a,"longitudinal",l)}_halfBlur(e,t,r,a,l,u,o){const p=this._renderer,m=this._blurMaterial;u!=="latitudinal"&&u!=="longitudinal"&&Jt("blur direction must be either latitudinal or longitudinal!");const x=3,v=this._lodMeshes[a];v.material=m;const y=m.uniforms,S=this._sizeLods[r]-1,T=isFinite(l)?Math.PI/(2*S):2*Math.PI/(2*Bi-1),F=l/T,E=isFinite(l)?1+Math.floor(x*F):Bi;E>Bi&&pt(`sigmaRadians, ${l}, is too large and will clip, as it requested ${E} samples when the maximum is set to ${Bi}`);const b=[];let H=0;for(let L=0;L<Bi;++L){const W=L/F,P=Math.exp(-W*W/2);b.push(P),L===0?H+=P:L<E&&(H+=2*P)}for(let L=0;L<b.length;L++)b[L]=b[L]/H;y.envMap.value=e.texture,y.samples.value=E,y.weights.value=b,y.latitudinal.value=u==="latitudinal",o&&(y.poleAxis.value=o);const{_lodMax:V}=this;y.dTheta.value=T,y.mipInt.value=V-r;const X=this._sizeLods[a],I=3*X*(a>V-gi?a-V+gi:0),C=4*(this._cubeSize-X);ba(t,I,C,3*X,2*X),p.setRenderTarget(t),p.render(v,io)}}function bv(n){const e=[],t=[],r=[];let a=n;const l=n-gi+1+Hu.length;for(let u=0;u<l;u++){const o=Math.pow(2,a);e.push(o);let p=1/o;u>n-gi?p=Hu[u-n+gi-1]:u===0&&(p=0),t.push(p);const m=1/(o-2),x=-m,v=1+m,y=[x,x,v,x,v,v,x,x,v,v,x,v],S=6,T=6,F=3,E=2,b=1,H=new Float32Array(F*T*S),V=new Float32Array(E*T*S),X=new Float32Array(b*T*S);for(let C=0;C<S;C++){const L=C%3*2/3-1,W=C>2?0:-1,P=[L,W,0,L+2/3,W,0,L+2/3,W+1,0,L,W,0,L+2/3,W+1,0,L,W+1,0];H.set(P,F*T*C),V.set(y,E*T*C);const w=[C,C,C,C,C,C];X.set(w,b*T*C)}const I=new Ei;I.setAttribute("position",new Ar(H,F)),I.setAttribute("uv",new Ar(V,E)),I.setAttribute("faceIndex",new Ar(X,b)),r.push(new Pr(I,null)),a>gi&&a--}return{lodMeshes:r,sizeLods:e,sigmas:t}}function Xu(n,e,t){const r=new qr(n,e,t);return r.texture.mapping=Xs,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function ba(n,e,t,r,a){n.viewport.set(e,t,r,a),n.scissor.set(e,t,r,a)}function Ev(n,e,t){return new Qn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:yv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ys(),fragmentShader:`

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
		`,blending:pr,depthTest:!1,depthWrite:!1})}function Mv(n,e,t){const r=new Float32Array(Bi),a=new le(0,1,0);return new Qn({name:"SphericalGaussianBlur",defines:{n:Bi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:Ys(),fragmentShader:`

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
		`,blending:pr,depthTest:!1,depthWrite:!1})}function $u(){return new Qn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ys(),fragmentShader:`

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
		`,blending:pr,depthTest:!1,depthWrite:!1})}function qu(){return new Qn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ys(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:pr,depthTest:!1,depthWrite:!1})}function Ys(){return`

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
	`}function wv(n){let e=new WeakMap,t=null;function r(o){if(o&&o.isTexture){const p=o.mapping,m=p===jc||p===Kc,x=p===Ia||p===Ua;if(m||x){let v=e.get(o);const y=v!==void 0?v.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==y)return t===null&&(t=new Wu(n)),v=m?t.fromEquirectangular(o,v):t.fromCubemap(o,v),v.texture.pmremVersion=o.pmremVersion,e.set(o,v),v.texture;if(v!==void 0)return v.texture;{const S=o.image;return m&&S&&S.height>0||x&&S&&a(S)?(t===null&&(t=new Wu(n)),v=m?t.fromEquirectangular(o):t.fromCubemap(o),v.texture.pmremVersion=o.pmremVersion,e.set(o,v),o.addEventListener("dispose",l),v.texture):null}}}return o}function a(o){let p=0;const m=6;for(let x=0;x<m;x++)o[x]!==void 0&&p++;return p===m}function l(o){const p=o.target;p.removeEventListener("dispose",l);const m=e.get(p);m!==void 0&&(e.delete(p),m.dispose())}function u(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:r,dispose:u}}function Tv(n){const e={};function t(r){if(e[r]!==void 0)return e[r];const a=n.getExtension(r);return e[r]=a,a}return{has:function(r){return t(r)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(r){const a=t(r);return a===null&&bo("WebGLRenderer: "+r+" extension not supported."),a}}}function Av(n,e,t,r){const a={},l=new WeakMap;function u(v){const y=v.target;y.index!==null&&e.remove(y.index);for(const T in y.attributes)e.remove(y.attributes[T]);y.removeEventListener("dispose",u),delete a[y.id];const S=l.get(y);S&&(e.remove(S),l.delete(y)),r.releaseStatesOfGeometry(y),y.isInstancedBufferGeometry===!0&&delete y._maxInstanceCount,t.memory.geometries--}function o(v,y){return a[y.id]===!0||(y.addEventListener("dispose",u),a[y.id]=!0,t.memory.geometries++),y}function p(v){const y=v.attributes;for(const S in y)e.update(y[S],n.ARRAY_BUFFER)}function m(v){const y=[],S=v.index,T=v.attributes.position;let F=0;if(S!==null){const H=S.array;F=S.version;for(let V=0,X=H.length;V<X;V+=3){const I=H[V+0],C=H[V+1],L=H[V+2];y.push(I,C,C,L,L,I)}}else if(T!==void 0){const H=T.array;F=T.version;for(let V=0,X=H.length/3-1;V<X;V+=3){const I=V+0,C=V+1,L=V+2;y.push(I,C,C,L,L,I)}}else return;const E=new(uh(y)?_h:mh)(y,1);E.version=F;const b=l.get(v);b&&e.remove(b),l.set(v,E)}function x(v){const y=l.get(v);if(y){const S=v.index;S!==null&&y.version<S.version&&m(v)}else m(v);return l.get(v)}return{get:o,update:p,getWireframeAttribute:x}}function Cv(n,e,t){let r;function a(y){r=y}let l,u;function o(y){l=y.type,u=y.bytesPerElement}function p(y,S){n.drawElements(r,S,l,y*u),t.update(S,r,1)}function m(y,S,T){T!==0&&(n.drawElementsInstanced(r,S,l,y*u,T),t.update(S,r,T))}function x(y,S,T){if(T===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,S,0,l,y,0,T);let E=0;for(let b=0;b<T;b++)E+=S[b];t.update(E,r,1)}function v(y,S,T,F){if(T===0)return;const E=e.get("WEBGL_multi_draw");if(E===null)for(let b=0;b<y.length;b++)m(y[b]/u,S[b],F[b]);else{E.multiDrawElementsInstancedWEBGL(r,S,0,l,y,0,F,0,T);let b=0;for(let H=0;H<T;H++)b+=S[H]*F[H];t.update(b,r,1)}}this.setMode=a,this.setIndex=o,this.render=p,this.renderInstances=m,this.renderMultiDraw=x,this.renderMultiDrawInstances=v}function Rv(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(l,u,o){switch(t.calls++,u){case n.TRIANGLES:t.triangles+=o*(l/3);break;case n.LINES:t.lines+=o*(l/2);break;case n.LINE_STRIP:t.lines+=o*(l-1);break;case n.LINE_LOOP:t.lines+=o*l;break;case n.POINTS:t.points+=o*l;break;default:Jt("WebGLInfo: Unknown draw mode:",u);break}}function a(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:a,update:r}}function Pv(n,e,t){const r=new WeakMap,a=new Qt;function l(u,o,p){const m=u.morphTargetInfluences,x=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,v=x!==void 0?x.length:0;let y=r.get(o);if(y===void 0||y.count!==v){let P=function(){L.dispose(),r.delete(o),o.removeEventListener("dispose",P)};y!==void 0&&y.texture.dispose();const S=o.morphAttributes.position!==void 0,T=o.morphAttributes.normal!==void 0,F=o.morphAttributes.color!==void 0,E=o.morphAttributes.position||[],b=o.morphAttributes.normal||[],H=o.morphAttributes.color||[];let V=0;S===!0&&(V=1),T===!0&&(V=2),F===!0&&(V=3);let X=o.attributes.position.count*V,I=1;X>e.maxTextureSize&&(I=Math.ceil(X/e.maxTextureSize),X=e.maxTextureSize);const C=new Float32Array(X*I*4*v),L=new dh(C,X,I,v);L.type=Zn,L.needsUpdate=!0;const W=V*4;for(let w=0;w<v;w++){const z=E[w],B=b[w],Y=H[w],K=X*I*4*w;for(let j=0;j<z.count;j++){const J=j*W;S===!0&&(a.fromBufferAttribute(z,j),C[K+J+0]=a.x,C[K+J+1]=a.y,C[K+J+2]=a.z,C[K+J+3]=0),T===!0&&(a.fromBufferAttribute(B,j),C[K+J+4]=a.x,C[K+J+5]=a.y,C[K+J+6]=a.z,C[K+J+7]=0),F===!0&&(a.fromBufferAttribute(Y,j),C[K+J+8]=a.x,C[K+J+9]=a.y,C[K+J+10]=a.z,C[K+J+11]=Y.itemSize===4?a.w:1)}}y={count:v,texture:L,size:new Gt(X,I)},r.set(o,y),o.addEventListener("dispose",P)}if(u.isInstancedMesh===!0&&u.morphTexture!==null)p.getUniforms().setValue(n,"morphTexture",u.morphTexture,t);else{let S=0;for(let F=0;F<m.length;F++)S+=m[F];const T=o.morphTargetsRelative?1:1-S;p.getUniforms().setValue(n,"morphTargetBaseInfluence",T),p.getUniforms().setValue(n,"morphTargetInfluences",m)}p.getUniforms().setValue(n,"morphTargetsTexture",y.texture,t),p.getUniforms().setValue(n,"morphTargetsTextureSize",y.size)}return{update:l}}function Dv(n,e,t,r){let a=new WeakMap;function l(p){const m=r.render.frame,x=p.geometry,v=e.get(p,x);if(a.get(v)!==m&&(e.update(v),a.set(v,m)),p.isInstancedMesh&&(p.hasEventListener("dispose",o)===!1&&p.addEventListener("dispose",o),a.get(p)!==m&&(t.update(p.instanceMatrix,n.ARRAY_BUFFER),p.instanceColor!==null&&t.update(p.instanceColor,n.ARRAY_BUFFER),a.set(p,m))),p.isSkinnedMesh){const y=p.skeleton;a.get(y)!==m&&(y.update(),a.set(y,m))}return v}function u(){a=new WeakMap}function o(p){const m=p.target;m.removeEventListener("dispose",o),t.remove(m.instanceMatrix),m.instanceColor!==null&&t.remove(m.instanceColor)}return{update:l,dispose:u}}const wh=new pn,Yu=new Sh(1,1),Th=new dh,Ah=new n0,Ch=new xh,ju=[],Ku=[],Zu=new Float32Array(16),Ju=new Float32Array(9),Qu=new Float32Array(4);function Ga(n,e,t){const r=n[0];if(r<=0||r>0)return n;const a=e*t;let l=ju[a];if(l===void 0&&(l=new Float32Array(a),ju[a]=l),e!==0){r.toArray(l,0);for(let u=1,o=0;u!==e;++u)o+=t,n[u].toArray(l,o)}return l}function sn(n,e){if(n.length!==e.length)return!1;for(let t=0,r=n.length;t<r;t++)if(n[t]!==e[t])return!1;return!0}function ln(n,e){for(let t=0,r=e.length;t<r;t++)n[t]=e[t]}function js(n,e){let t=Ku[e];t===void 0&&(t=new Int32Array(e),Ku[e]=t);for(let r=0;r!==e;++r)t[r]=n.allocateTextureUnit();return t}function Lv(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Fv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(sn(t,e))return;n.uniform2fv(this.addr,e),ln(t,e)}}function Iv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(sn(t,e))return;n.uniform3fv(this.addr,e),ln(t,e)}}function Uv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(sn(t,e))return;n.uniform4fv(this.addr,e),ln(t,e)}}function Nv(n,e){const t=this.cache,r=e.elements;if(r===void 0){if(sn(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),ln(t,e)}else{if(sn(t,r))return;Qu.set(r),n.uniformMatrix2fv(this.addr,!1,Qu),ln(t,r)}}function Ov(n,e){const t=this.cache,r=e.elements;if(r===void 0){if(sn(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),ln(t,e)}else{if(sn(t,r))return;Ju.set(r),n.uniformMatrix3fv(this.addr,!1,Ju),ln(t,r)}}function kv(n,e){const t=this.cache,r=e.elements;if(r===void 0){if(sn(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),ln(t,e)}else{if(sn(t,r))return;Zu.set(r),n.uniformMatrix4fv(this.addr,!1,Zu),ln(t,r)}}function Bv(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function zv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(sn(t,e))return;n.uniform2iv(this.addr,e),ln(t,e)}}function Gv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(sn(t,e))return;n.uniform3iv(this.addr,e),ln(t,e)}}function Hv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(sn(t,e))return;n.uniform4iv(this.addr,e),ln(t,e)}}function Vv(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Wv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(sn(t,e))return;n.uniform2uiv(this.addr,e),ln(t,e)}}function Xv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(sn(t,e))return;n.uniform3uiv(this.addr,e),ln(t,e)}}function $v(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(sn(t,e))return;n.uniform4uiv(this.addr,e),ln(t,e)}}function qv(n,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(n.uniform1i(this.addr,a),r[0]=a);let l;this.type===n.SAMPLER_2D_SHADOW?(Yu.compareFunction=fh,l=Yu):l=wh,t.setTexture2D(e||l,a)}function Yv(n,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(n.uniform1i(this.addr,a),r[0]=a),t.setTexture3D(e||Ah,a)}function jv(n,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(n.uniform1i(this.addr,a),r[0]=a),t.setTextureCube(e||Ch,a)}function Kv(n,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(n.uniform1i(this.addr,a),r[0]=a),t.setTexture2DArray(e||Th,a)}function Zv(n){switch(n){case 5126:return Lv;case 35664:return Fv;case 35665:return Iv;case 35666:return Uv;case 35674:return Nv;case 35675:return Ov;case 35676:return kv;case 5124:case 35670:return Bv;case 35667:case 35671:return zv;case 35668:case 35672:return Gv;case 35669:case 35673:return Hv;case 5125:return Vv;case 36294:return Wv;case 36295:return Xv;case 36296:return $v;case 35678:case 36198:case 36298:case 36306:case 35682:return qv;case 35679:case 36299:case 36307:return Yv;case 35680:case 36300:case 36308:case 36293:return jv;case 36289:case 36303:case 36311:case 36292:return Kv}}function Jv(n,e){n.uniform1fv(this.addr,e)}function Qv(n,e){const t=Ga(e,this.size,2);n.uniform2fv(this.addr,t)}function ex(n,e){const t=Ga(e,this.size,3);n.uniform3fv(this.addr,t)}function tx(n,e){const t=Ga(e,this.size,4);n.uniform4fv(this.addr,t)}function nx(n,e){const t=Ga(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function rx(n,e){const t=Ga(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function ix(n,e){const t=Ga(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function ax(n,e){n.uniform1iv(this.addr,e)}function ox(n,e){n.uniform2iv(this.addr,e)}function sx(n,e){n.uniform3iv(this.addr,e)}function lx(n,e){n.uniform4iv(this.addr,e)}function cx(n,e){n.uniform1uiv(this.addr,e)}function fx(n,e){n.uniform2uiv(this.addr,e)}function ux(n,e){n.uniform3uiv(this.addr,e)}function dx(n,e){n.uniform4uiv(this.addr,e)}function hx(n,e,t){const r=this.cache,a=e.length,l=js(t,a);sn(r,l)||(n.uniform1iv(this.addr,l),ln(r,l));for(let u=0;u!==a;++u)t.setTexture2D(e[u]||wh,l[u])}function px(n,e,t){const r=this.cache,a=e.length,l=js(t,a);sn(r,l)||(n.uniform1iv(this.addr,l),ln(r,l));for(let u=0;u!==a;++u)t.setTexture3D(e[u]||Ah,l[u])}function mx(n,e,t){const r=this.cache,a=e.length,l=js(t,a);sn(r,l)||(n.uniform1iv(this.addr,l),ln(r,l));for(let u=0;u!==a;++u)t.setTextureCube(e[u]||Ch,l[u])}function _x(n,e,t){const r=this.cache,a=e.length,l=js(t,a);sn(r,l)||(n.uniform1iv(this.addr,l),ln(r,l));for(let u=0;u!==a;++u)t.setTexture2DArray(e[u]||Th,l[u])}function gx(n){switch(n){case 5126:return Jv;case 35664:return Qv;case 35665:return ex;case 35666:return tx;case 35674:return nx;case 35675:return rx;case 35676:return ix;case 5124:case 35670:return ax;case 35667:case 35671:return ox;case 35668:case 35672:return sx;case 35669:case 35673:return lx;case 5125:return cx;case 36294:return fx;case 36295:return ux;case 36296:return dx;case 35678:case 36198:case 36298:case 36306:case 35682:return hx;case 35679:case 36299:case 36307:return px;case 35680:case 36300:case 36308:case 36293:return mx;case 36289:case 36303:case 36311:case 36292:return _x}}class vx{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=Zv(t.type)}}class xx{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=gx(t.type)}}class yx{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){const a=this.seq;for(let l=0,u=a.length;l!==u;++l){const o=a[l];o.setValue(e,t[o.id],r)}}}const Tc=/(\w+)(\])?(\[|\.)?/g;function ed(n,e){n.seq.push(e),n.map[e.id]=e}function Sx(n,e,t){const r=n.name,a=r.length;for(Tc.lastIndex=0;;){const l=Tc.exec(r),u=Tc.lastIndex;let o=l[1];const p=l[2]==="]",m=l[3];if(p&&(o=o|0),m===void 0||m==="["&&u+2===a){ed(t,m===void 0?new vx(o,n,e):new xx(o,n,e));break}else{let v=t.map[o];v===void 0&&(v=new yx(o),ed(t,v)),t=v}}}class Ps{constructor(e,t){this.seq=[],this.map={};const r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<r;++a){const l=e.getActiveUniform(t,a),u=e.getUniformLocation(t,l.name);Sx(l,u,this)}}setValue(e,t,r,a){const l=this.map[t];l!==void 0&&l.setValue(e,r,a)}setOptional(e,t,r){const a=t[r];a!==void 0&&this.setValue(e,r,a)}static upload(e,t,r,a){for(let l=0,u=t.length;l!==u;++l){const o=t[l],p=r[o.id];p.needsUpdate!==!1&&o.setValue(e,p.value,a)}}static seqWithValue(e,t){const r=[];for(let a=0,l=e.length;a!==l;++a){const u=e[a];u.id in t&&r.push(u)}return r}}function td(n,e,t){const r=n.createShader(e);return n.shaderSource(r,t),n.compileShader(r),r}const bx=37297;let Ex=0;function Mx(n,e){const t=n.split(`
`),r=[],a=Math.max(e-6,0),l=Math.min(e+6,t.length);for(let u=a;u<l;u++){const o=u+1;r.push(`${o===e?">":" "} ${o}: ${t[u]}`)}return r.join(`
`)}const nd=new _t;function wx(n){Rt._getMatrix(nd,Rt.workingColorSpace,n);const e=`mat3( ${nd.elements.map(t=>t.toFixed(4))} )`;switch(Rt.getTransfer(n)){case Us:return[e,"LinearTransferOETF"];case Bt:return[e,"sRGBTransferOETF"];default:return pt("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function rd(n,e,t){const r=n.getShaderParameter(e,n.COMPILE_STATUS),l=(n.getShaderInfoLog(e)||"").trim();if(r&&l==="")return"";const u=/ERROR: 0:(\d+)/.exec(l);if(u){const o=parseInt(u[1]);return t.toUpperCase()+`

`+l+`

`+Mx(n.getShaderSource(e),o)}else return l}function Tx(n,e){const t=wx(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Ax(n,e){let t;switch(e){case qc:t="Linear";break;case rh:t="Reinhard";break;case ih:t="Cineon";break;case Yc:t="ACESFilmic";break;case Im:t="AgX";break;case Um:t="Neutral";break;case Fm:t="Custom";break;default:pt("WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ss=new le;function Cx(){Rt.getLuminanceCoefficients(Ss);const n=Ss.x.toFixed(4),e=Ss.y.toFixed(4),t=Ss.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Rx(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(co).join(`
`)}function Px(n){const e=[];for(const t in n){const r=n[t];r!==!1&&e.push("#define "+t+" "+r)}return e.join(`
`)}function Dx(n,e){const t={},r=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let a=0;a<r;a++){const l=n.getActiveAttrib(e,a),u=l.name;let o=1;l.type===n.FLOAT_MAT2&&(o=2),l.type===n.FLOAT_MAT3&&(o=3),l.type===n.FLOAT_MAT4&&(o=4),t[u]={type:l.type,location:n.getAttribLocation(e,u),locationSize:o}}return t}function co(n){return n!==""}function id(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ad(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Lx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Cf(n){return n.replace(Lx,Ix)}const Fx=new Map;function Ix(n,e){let t=vt[e];if(t===void 0){const r=Fx.get(e);if(r!==void 0)t=vt[r],pt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return Cf(t)}const Ux=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function od(n){return n.replace(Ux,Nx)}function Nx(n,e,t,r){let a="";for(let l=parseInt(e);l<parseInt(t);l++)a+=r.replace(/\[\s*i\s*\]/g,"[ "+l+" ]").replace(/UNROLLED_LOOP_INDEX/g,l);return a}function sd(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}function Ox(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===th?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===dm?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Br&&(e="SHADOWMAP_TYPE_VSM"),e}function kx(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Ia:case Ua:e="ENVMAP_TYPE_CUBE";break;case Xs:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Bx(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Ua:e="ENVMAP_MODE_REFRACTION";break}return e}function zx(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case nh:e="ENVMAP_BLENDING_MULTIPLY";break;case Dm:e="ENVMAP_BLENDING_MIX";break;case Lm:e="ENVMAP_BLENDING_ADD";break}return e}function Gx(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:r,maxMip:t}}function Hx(n,e,t,r){const a=n.getContext(),l=t.defines;let u=t.vertexShader,o=t.fragmentShader;const p=Ox(t),m=kx(t),x=Bx(t),v=zx(t),y=Gx(t),S=Rx(t),T=Px(l),F=a.createProgram();let E,b,H=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(E=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T].filter(co).join(`
`),E.length>0&&(E+=`
`),b=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T].filter(co).join(`
`),b.length>0&&(b+=`
`)):(E=[sd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+x:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+p:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(co).join(`
`),b=[sd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.envMap?"#define "+x:"",t.envMap?"#define "+v:"",y?"#define CUBEUV_TEXEL_WIDTH "+y.texelWidth:"",y?"#define CUBEUV_TEXEL_HEIGHT "+y.texelHeight:"",y?"#define CUBEUV_MAX_MIP "+y.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+p:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Xr?"#define TONE_MAPPING":"",t.toneMapping!==Xr?vt.tonemapping_pars_fragment:"",t.toneMapping!==Xr?Ax("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",vt.colorspace_pars_fragment,Tx("linearToOutputTexel",t.outputColorSpace),Cx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(co).join(`
`)),u=Cf(u),u=id(u,t),u=ad(u,t),o=Cf(o),o=id(o,t),o=ad(o,t),u=od(u),o=od(o),t.isRawShaderMaterial!==!0&&(H=`#version 300 es
`,E=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+E,b=["#define varying in",t.glslVersion===bu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===bu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+b);const V=H+E+u,X=H+b+o,I=td(a,a.VERTEX_SHADER,V),C=td(a,a.FRAGMENT_SHADER,X);a.attachShader(F,I),a.attachShader(F,C),t.index0AttributeName!==void 0?a.bindAttribLocation(F,0,t.index0AttributeName):t.morphTargets===!0&&a.bindAttribLocation(F,0,"position"),a.linkProgram(F);function L(z){if(n.debug.checkShaderErrors){const B=a.getProgramInfoLog(F)||"",Y=a.getShaderInfoLog(I)||"",K=a.getShaderInfoLog(C)||"",j=B.trim(),J=Y.trim(),ce=K.trim();let te=!0,Se=!0;if(a.getProgramParameter(F,a.LINK_STATUS)===!1)if(te=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(a,F,I,C);else{const be=rd(a,I,"vertex"),$e=rd(a,C,"fragment");Jt("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(F,a.VALIDATE_STATUS)+`

Material Name: `+z.name+`
Material Type: `+z.type+`

Program Info Log: `+j+`
`+be+`
`+$e)}else j!==""?pt("WebGLProgram: Program Info Log:",j):(J===""||ce==="")&&(Se=!1);Se&&(z.diagnostics={runnable:te,programLog:j,vertexShader:{log:J,prefix:E},fragmentShader:{log:ce,prefix:b}})}a.deleteShader(I),a.deleteShader(C),W=new Ps(a,F),P=Dx(a,F)}let W;this.getUniforms=function(){return W===void 0&&L(this),W};let P;this.getAttributes=function(){return P===void 0&&L(this),P};let w=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=a.getProgramParameter(F,bx)),w},this.destroy=function(){r.releaseStatesOfProgram(this),a.deleteProgram(F),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Ex++,this.cacheKey=e,this.usedTimes=1,this.program=F,this.vertexShader=I,this.fragmentShader=C,this}let Vx=0;class Wx{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,r=e.fragmentShader,a=this._getShaderStage(t),l=this._getShaderStage(r),u=this._getShaderCacheForMaterial(e);return u.has(a)===!1&&(u.add(a),a.usedTimes++),u.has(l)===!1&&(u.add(l),l.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){const t=this.shaderCache;let r=t.get(e);return r===void 0&&(r=new Xx(e),t.set(e,r)),r}}class Xx{constructor(e){this.id=Vx++,this.code=e,this.usedTimes=0}}function $x(n,e,t,r,a,l,u){const o=new hh,p=new Wx,m=new Set,x=[],v=a.logarithmicDepthBuffer,y=a.vertexTextures;let S=a.precision;const T={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function F(P){return m.add(P),P===0?"uv":`uv${P}`}function E(P,w,z,B,Y){const K=B.fog,j=Y.geometry,J=P.isMeshStandardMaterial?B.environment:null,ce=(P.isMeshStandardMaterial?t:e).get(P.envMap||J),te=ce&&ce.mapping===Xs?ce.image.height:null,Se=T[P.type];P.precision!==null&&(S=a.getMaxPrecision(P.precision),S!==P.precision&&pt("WebGLProgram.getParameters:",P.precision,"not supported, using",S,"instead."));const be=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,$e=be!==void 0?be.length:0;let st=0;j.morphAttributes.position!==void 0&&(st=1),j.morphAttributes.normal!==void 0&&(st=2),j.morphAttributes.color!==void 0&&(st=3);let ht,xt,gt,_e;if(Se){const Et=Er[Se];ht=Et.vertexShader,xt=Et.fragmentShader}else ht=P.vertexShader,xt=P.fragmentShader,p.update(P),gt=p.getVertexShaderID(P),_e=p.getFragmentShaderID(P);const ge=n.getRenderTarget(),Oe=n.state.buffers.depth.getReversed(),et=Y.isInstancedMesh===!0,qe=Y.isBatchedMesh===!0,ct=!!P.map,Pt=!!P.matcap,ft=!!ce,Tt=!!P.aoMap,$=!!P.lightMap,Ce=!!P.bumpMap,ke=!!P.normalMap,lt=!!P.displacementMap,Ie=!!P.emissiveMap,yt=!!P.metalnessMap,Ye=!!P.roughnessMap,tt=P.anisotropy>0,N=P.clearcoat>0,D=P.dispersion>0,ne=P.iridescence>0,fe=P.sheen>0,de=P.transmission>0,ie=tt&&!!P.anisotropyMap,Ke=N&&!!P.clearcoatMap,Ue=N&&!!P.clearcoatNormalMap,rt=N&&!!P.clearcoatRoughnessMap,Ze=ne&&!!P.iridescenceMap,ve=ne&&!!P.iridescenceThicknessMap,he=fe&&!!P.sheenColorMap,we=fe&&!!P.sheenRoughnessMap,je=!!P.specularMap,Be=!!P.specularColorMap,Qe=!!P.specularIntensityMap,q=de&&!!P.transmissionMap,Fe=de&&!!P.thicknessMap,Te=!!P.gradientMap,Ae=!!P.alphaMap,Ee=P.alphaTest>0,pe=!!P.alphaHash,Ge=!!P.extensions;let Re=Xr;P.toneMapped&&(ge===null||ge.isXRRenderTarget===!0)&&(Re=n.toneMapping);const It={shaderID:Se,shaderType:P.type,shaderName:P.name,vertexShader:ht,fragmentShader:xt,defines:P.defines,customVertexShaderID:gt,customFragmentShaderID:_e,isRawShaderMaterial:P.isRawShaderMaterial===!0,glslVersion:P.glslVersion,precision:S,batching:qe,batchingColor:qe&&Y._colorsTexture!==null,instancing:et,instancingColor:et&&Y.instanceColor!==null,instancingMorph:et&&Y.morphTexture!==null,supportsVertexTextures:y,outputColorSpace:ge===null?n.outputColorSpace:ge.isXRRenderTarget===!0?ge.texture.colorSpace:Rr,alphaToCoverage:!!P.alphaToCoverage,map:ct,matcap:Pt,envMap:ft,envMapMode:ft&&ce.mapping,envMapCubeUVHeight:te,aoMap:Tt,lightMap:$,bumpMap:Ce,normalMap:ke,displacementMap:y&&lt,emissiveMap:Ie,normalMapObjectSpace:ke&&P.normalMapType===zm,normalMapTangentSpace:ke&&P.normalMapType===Bm,metalnessMap:yt,roughnessMap:Ye,anisotropy:tt,anisotropyMap:ie,clearcoat:N,clearcoatMap:Ke,clearcoatNormalMap:Ue,clearcoatRoughnessMap:rt,dispersion:D,iridescence:ne,iridescenceMap:Ze,iridescenceThicknessMap:ve,sheen:fe,sheenColorMap:he,sheenRoughnessMap:we,specularMap:je,specularColorMap:Be,specularIntensityMap:Qe,transmission:de,transmissionMap:q,thicknessMap:Fe,gradientMap:Te,opaque:P.transparent===!1&&P.blending===Ca&&P.alphaToCoverage===!1,alphaMap:Ae,alphaTest:Ee,alphaHash:pe,combine:P.combine,mapUv:ct&&F(P.map.channel),aoMapUv:Tt&&F(P.aoMap.channel),lightMapUv:$&&F(P.lightMap.channel),bumpMapUv:Ce&&F(P.bumpMap.channel),normalMapUv:ke&&F(P.normalMap.channel),displacementMapUv:lt&&F(P.displacementMap.channel),emissiveMapUv:Ie&&F(P.emissiveMap.channel),metalnessMapUv:yt&&F(P.metalnessMap.channel),roughnessMapUv:Ye&&F(P.roughnessMap.channel),anisotropyMapUv:ie&&F(P.anisotropyMap.channel),clearcoatMapUv:Ke&&F(P.clearcoatMap.channel),clearcoatNormalMapUv:Ue&&F(P.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:rt&&F(P.clearcoatRoughnessMap.channel),iridescenceMapUv:Ze&&F(P.iridescenceMap.channel),iridescenceThicknessMapUv:ve&&F(P.iridescenceThicknessMap.channel),sheenColorMapUv:he&&F(P.sheenColorMap.channel),sheenRoughnessMapUv:we&&F(P.sheenRoughnessMap.channel),specularMapUv:je&&F(P.specularMap.channel),specularColorMapUv:Be&&F(P.specularColorMap.channel),specularIntensityMapUv:Qe&&F(P.specularIntensityMap.channel),transmissionMapUv:q&&F(P.transmissionMap.channel),thicknessMapUv:Fe&&F(P.thicknessMap.channel),alphaMapUv:Ae&&F(P.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(ke||tt),vertexColors:P.vertexColors,vertexAlphas:P.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:Y.isPoints===!0&&!!j.attributes.uv&&(ct||Ae),fog:!!K,useFog:P.fog===!0,fogExp2:!!K&&K.isFogExp2,flatShading:P.flatShading===!0&&P.wireframe===!1,sizeAttenuation:P.sizeAttenuation===!0,logarithmicDepthBuffer:v,reversedDepthBuffer:Oe,skinning:Y.isSkinnedMesh===!0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:$e,morphTextureStride:st,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:u.numPlanes,numClipIntersection:u.numIntersection,dithering:P.dithering,shadowMapEnabled:n.shadowMap.enabled&&z.length>0,shadowMapType:n.shadowMap.type,toneMapping:Re,decodeVideoTexture:ct&&P.map.isVideoTexture===!0&&Rt.getTransfer(P.map.colorSpace)===Bt,decodeVideoTextureEmissive:Ie&&P.emissiveMap.isVideoTexture===!0&&Rt.getTransfer(P.emissiveMap.colorSpace)===Bt,premultipliedAlpha:P.premultipliedAlpha,doubleSided:P.side===Gr,flipSided:P.side===In,useDepthPacking:P.depthPacking>=0,depthPacking:P.depthPacking||0,index0AttributeName:P.index0AttributeName,extensionClipCullDistance:Ge&&P.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ge&&P.extensions.multiDraw===!0||qe)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:P.customProgramCacheKey()};return It.vertexUv1s=m.has(1),It.vertexUv2s=m.has(2),It.vertexUv3s=m.has(3),m.clear(),It}function b(P){const w=[];if(P.shaderID?w.push(P.shaderID):(w.push(P.customVertexShaderID),w.push(P.customFragmentShaderID)),P.defines!==void 0)for(const z in P.defines)w.push(z),w.push(P.defines[z]);return P.isRawShaderMaterial===!1&&(H(w,P),V(w,P),w.push(n.outputColorSpace)),w.push(P.customProgramCacheKey),w.join()}function H(P,w){P.push(w.precision),P.push(w.outputColorSpace),P.push(w.envMapMode),P.push(w.envMapCubeUVHeight),P.push(w.mapUv),P.push(w.alphaMapUv),P.push(w.lightMapUv),P.push(w.aoMapUv),P.push(w.bumpMapUv),P.push(w.normalMapUv),P.push(w.displacementMapUv),P.push(w.emissiveMapUv),P.push(w.metalnessMapUv),P.push(w.roughnessMapUv),P.push(w.anisotropyMapUv),P.push(w.clearcoatMapUv),P.push(w.clearcoatNormalMapUv),P.push(w.clearcoatRoughnessMapUv),P.push(w.iridescenceMapUv),P.push(w.iridescenceThicknessMapUv),P.push(w.sheenColorMapUv),P.push(w.sheenRoughnessMapUv),P.push(w.specularMapUv),P.push(w.specularColorMapUv),P.push(w.specularIntensityMapUv),P.push(w.transmissionMapUv),P.push(w.thicknessMapUv),P.push(w.combine),P.push(w.fogExp2),P.push(w.sizeAttenuation),P.push(w.morphTargetsCount),P.push(w.morphAttributeCount),P.push(w.numDirLights),P.push(w.numPointLights),P.push(w.numSpotLights),P.push(w.numSpotLightMaps),P.push(w.numHemiLights),P.push(w.numRectAreaLights),P.push(w.numDirLightShadows),P.push(w.numPointLightShadows),P.push(w.numSpotLightShadows),P.push(w.numSpotLightShadowsWithMaps),P.push(w.numLightProbes),P.push(w.shadowMapType),P.push(w.toneMapping),P.push(w.numClippingPlanes),P.push(w.numClipIntersection),P.push(w.depthPacking)}function V(P,w){o.disableAll(),w.supportsVertexTextures&&o.enable(0),w.instancing&&o.enable(1),w.instancingColor&&o.enable(2),w.instancingMorph&&o.enable(3),w.matcap&&o.enable(4),w.envMap&&o.enable(5),w.normalMapObjectSpace&&o.enable(6),w.normalMapTangentSpace&&o.enable(7),w.clearcoat&&o.enable(8),w.iridescence&&o.enable(9),w.alphaTest&&o.enable(10),w.vertexColors&&o.enable(11),w.vertexAlphas&&o.enable(12),w.vertexUv1s&&o.enable(13),w.vertexUv2s&&o.enable(14),w.vertexUv3s&&o.enable(15),w.vertexTangents&&o.enable(16),w.anisotropy&&o.enable(17),w.alphaHash&&o.enable(18),w.batching&&o.enable(19),w.dispersion&&o.enable(20),w.batchingColor&&o.enable(21),w.gradientMap&&o.enable(22),P.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),P.push(o.mask)}function X(P){const w=T[P.type];let z;if(w){const B=Er[w];z=x0.clone(B.uniforms)}else z=P.uniforms;return z}function I(P,w){let z;for(let B=0,Y=x.length;B<Y;B++){const K=x[B];if(K.cacheKey===w){z=K,++z.usedTimes;break}}return z===void 0&&(z=new Hx(n,w,P,l),x.push(z)),z}function C(P){if(--P.usedTimes===0){const w=x.indexOf(P);x[w]=x[x.length-1],x.pop(),P.destroy()}}function L(P){p.remove(P)}function W(){p.dispose()}return{getParameters:E,getProgramCacheKey:b,getUniforms:X,acquireProgram:I,releaseProgram:C,releaseShaderCache:L,programs:x,dispose:W}}function qx(){let n=new WeakMap;function e(u){return n.has(u)}function t(u){let o=n.get(u);return o===void 0&&(o={},n.set(u,o)),o}function r(u){n.delete(u)}function a(u,o,p){n.get(u)[o]=p}function l(){n=new WeakMap}return{has:e,get:t,remove:r,update:a,dispose:l}}function Yx(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function ld(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function cd(){const n=[];let e=0;const t=[],r=[],a=[];function l(){e=0,t.length=0,r.length=0,a.length=0}function u(v,y,S,T,F,E){let b=n[e];return b===void 0?(b={id:v.id,object:v,geometry:y,material:S,groupOrder:T,renderOrder:v.renderOrder,z:F,group:E},n[e]=b):(b.id=v.id,b.object=v,b.geometry=y,b.material=S,b.groupOrder=T,b.renderOrder=v.renderOrder,b.z=F,b.group=E),e++,b}function o(v,y,S,T,F,E){const b=u(v,y,S,T,F,E);S.transmission>0?r.push(b):S.transparent===!0?a.push(b):t.push(b)}function p(v,y,S,T,F,E){const b=u(v,y,S,T,F,E);S.transmission>0?r.unshift(b):S.transparent===!0?a.unshift(b):t.unshift(b)}function m(v,y){t.length>1&&t.sort(v||Yx),r.length>1&&r.sort(y||ld),a.length>1&&a.sort(y||ld)}function x(){for(let v=e,y=n.length;v<y;v++){const S=n[v];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:t,transmissive:r,transparent:a,init:l,push:o,unshift:p,finish:x,sort:m}}function jx(){let n=new WeakMap;function e(r,a){const l=n.get(r);let u;return l===void 0?(u=new cd,n.set(r,[u])):a>=l.length?(u=new cd,l.push(u)):u=l[a],u}function t(){n=new WeakMap}return{get:e,dispose:t}}function Kx(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new le,color:new zt};break;case"SpotLight":t={position:new le,direction:new le,color:new zt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new le,color:new zt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new le,skyColor:new zt,groundColor:new zt};break;case"RectAreaLight":t={color:new zt,position:new le,halfWidth:new le,halfHeight:new le};break}return n[e.id]=t,t}}}function Zx(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Gt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Gt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Gt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let Jx=0;function Qx(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function ey(n){const e=new Kx,t=Zx(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let m=0;m<9;m++)r.probe.push(new le);const a=new le,l=new on,u=new on;function o(m){let x=0,v=0,y=0;for(let P=0;P<9;P++)r.probe[P].set(0,0,0);let S=0,T=0,F=0,E=0,b=0,H=0,V=0,X=0,I=0,C=0,L=0;m.sort(Qx);for(let P=0,w=m.length;P<w;P++){const z=m[P],B=z.color,Y=z.intensity,K=z.distance,j=z.shadow&&z.shadow.map?z.shadow.map.texture:null;if(z.isAmbientLight)x+=B.r*Y,v+=B.g*Y,y+=B.b*Y;else if(z.isLightProbe){for(let J=0;J<9;J++)r.probe[J].addScaledVector(z.sh.coefficients[J],Y);L++}else if(z.isDirectionalLight){const J=e.get(z);if(J.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){const ce=z.shadow,te=t.get(z);te.shadowIntensity=ce.intensity,te.shadowBias=ce.bias,te.shadowNormalBias=ce.normalBias,te.shadowRadius=ce.radius,te.shadowMapSize=ce.mapSize,r.directionalShadow[S]=te,r.directionalShadowMap[S]=j,r.directionalShadowMatrix[S]=z.shadow.matrix,H++}r.directional[S]=J,S++}else if(z.isSpotLight){const J=e.get(z);J.position.setFromMatrixPosition(z.matrixWorld),J.color.copy(B).multiplyScalar(Y),J.distance=K,J.coneCos=Math.cos(z.angle),J.penumbraCos=Math.cos(z.angle*(1-z.penumbra)),J.decay=z.decay,r.spot[F]=J;const ce=z.shadow;if(z.map&&(r.spotLightMap[I]=z.map,I++,ce.updateMatrices(z),z.castShadow&&C++),r.spotLightMatrix[F]=ce.matrix,z.castShadow){const te=t.get(z);te.shadowIntensity=ce.intensity,te.shadowBias=ce.bias,te.shadowNormalBias=ce.normalBias,te.shadowRadius=ce.radius,te.shadowMapSize=ce.mapSize,r.spotShadow[F]=te,r.spotShadowMap[F]=j,X++}F++}else if(z.isRectAreaLight){const J=e.get(z);J.color.copy(B).multiplyScalar(Y),J.halfWidth.set(z.width*.5,0,0),J.halfHeight.set(0,z.height*.5,0),r.rectArea[E]=J,E++}else if(z.isPointLight){const J=e.get(z);if(J.color.copy(z.color).multiplyScalar(z.intensity),J.distance=z.distance,J.decay=z.decay,z.castShadow){const ce=z.shadow,te=t.get(z);te.shadowIntensity=ce.intensity,te.shadowBias=ce.bias,te.shadowNormalBias=ce.normalBias,te.shadowRadius=ce.radius,te.shadowMapSize=ce.mapSize,te.shadowCameraNear=ce.camera.near,te.shadowCameraFar=ce.camera.far,r.pointShadow[T]=te,r.pointShadowMap[T]=j,r.pointShadowMatrix[T]=z.shadow.matrix,V++}r.point[T]=J,T++}else if(z.isHemisphereLight){const J=e.get(z);J.skyColor.copy(z.color).multiplyScalar(Y),J.groundColor.copy(z.groundColor).multiplyScalar(Y),r.hemi[b]=J,b++}}E>0&&(n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=He.LTC_FLOAT_1,r.rectAreaLTC2=He.LTC_FLOAT_2):(r.rectAreaLTC1=He.LTC_HALF_1,r.rectAreaLTC2=He.LTC_HALF_2)),r.ambient[0]=x,r.ambient[1]=v,r.ambient[2]=y;const W=r.hash;(W.directionalLength!==S||W.pointLength!==T||W.spotLength!==F||W.rectAreaLength!==E||W.hemiLength!==b||W.numDirectionalShadows!==H||W.numPointShadows!==V||W.numSpotShadows!==X||W.numSpotMaps!==I||W.numLightProbes!==L)&&(r.directional.length=S,r.spot.length=F,r.rectArea.length=E,r.point.length=T,r.hemi.length=b,r.directionalShadow.length=H,r.directionalShadowMap.length=H,r.pointShadow.length=V,r.pointShadowMap.length=V,r.spotShadow.length=X,r.spotShadowMap.length=X,r.directionalShadowMatrix.length=H,r.pointShadowMatrix.length=V,r.spotLightMatrix.length=X+I-C,r.spotLightMap.length=I,r.numSpotLightShadowsWithMaps=C,r.numLightProbes=L,W.directionalLength=S,W.pointLength=T,W.spotLength=F,W.rectAreaLength=E,W.hemiLength=b,W.numDirectionalShadows=H,W.numPointShadows=V,W.numSpotShadows=X,W.numSpotMaps=I,W.numLightProbes=L,r.version=Jx++)}function p(m,x){let v=0,y=0,S=0,T=0,F=0;const E=x.matrixWorldInverse;for(let b=0,H=m.length;b<H;b++){const V=m[b];if(V.isDirectionalLight){const X=r.directional[v];X.direction.setFromMatrixPosition(V.matrixWorld),a.setFromMatrixPosition(V.target.matrixWorld),X.direction.sub(a),X.direction.transformDirection(E),v++}else if(V.isSpotLight){const X=r.spot[S];X.position.setFromMatrixPosition(V.matrixWorld),X.position.applyMatrix4(E),X.direction.setFromMatrixPosition(V.matrixWorld),a.setFromMatrixPosition(V.target.matrixWorld),X.direction.sub(a),X.direction.transformDirection(E),S++}else if(V.isRectAreaLight){const X=r.rectArea[T];X.position.setFromMatrixPosition(V.matrixWorld),X.position.applyMatrix4(E),u.identity(),l.copy(V.matrixWorld),l.premultiply(E),u.extractRotation(l),X.halfWidth.set(V.width*.5,0,0),X.halfHeight.set(0,V.height*.5,0),X.halfWidth.applyMatrix4(u),X.halfHeight.applyMatrix4(u),T++}else if(V.isPointLight){const X=r.point[y];X.position.setFromMatrixPosition(V.matrixWorld),X.position.applyMatrix4(E),y++}else if(V.isHemisphereLight){const X=r.hemi[F];X.direction.setFromMatrixPosition(V.matrixWorld),X.direction.transformDirection(E),F++}}}return{setup:o,setupView:p,state:r}}function fd(n){const e=new ey(n),t=[],r=[];function a(x){m.camera=x,t.length=0,r.length=0}function l(x){t.push(x)}function u(x){r.push(x)}function o(){e.setup(t)}function p(x){e.setupView(t,x)}const m={lightsArray:t,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:a,state:m,setupLights:o,setupLightsView:p,pushLight:l,pushShadow:u}}function ty(n){let e=new WeakMap;function t(a,l=0){const u=e.get(a);let o;return u===void 0?(o=new fd(n),e.set(a,[o])):l>=u.length?(o=new fd(n),u.push(o)):o=u[l],o}function r(){e=new WeakMap}return{get:t,dispose:r}}const ny=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ry=`uniform sampler2D shadow_pass;
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
}`;function iy(n,e,t){let r=new yh;const a=new Gt,l=new Gt,u=new Qt,o=new R0({depthPacking:km}),p=new P0,m={},x=t.maxTextureSize,v={[Si]:In,[In]:Si,[Gr]:Gr},y=new Qn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Gt},radius:{value:4}},vertexShader:ny,fragmentShader:ry}),S=y.clone();S.defines.HORIZONTAL_PASS=1;const T=new Ei;T.setAttribute("position",new Ar(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const F=new Pr(T,y),E=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=th;let b=this.type;this.render=function(C,L,W){if(E.enabled===!1||E.autoUpdate===!1&&E.needsUpdate===!1||C.length===0)return;const P=n.getRenderTarget(),w=n.getActiveCubeFace(),z=n.getActiveMipmapLevel(),B=n.state;B.setBlending(pr),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const Y=b!==Br&&this.type===Br,K=b===Br&&this.type!==Br;for(let j=0,J=C.length;j<J;j++){const ce=C[j],te=ce.shadow;if(te===void 0){pt("WebGLShadowMap:",ce,"has no shadow.");continue}if(te.autoUpdate===!1&&te.needsUpdate===!1)continue;a.copy(te.mapSize);const Se=te.getFrameExtents();if(a.multiply(Se),l.copy(te.mapSize),(a.x>x||a.y>x)&&(a.x>x&&(l.x=Math.floor(x/Se.x),a.x=l.x*Se.x,te.mapSize.x=l.x),a.y>x&&(l.y=Math.floor(x/Se.y),a.y=l.y*Se.y,te.mapSize.y=l.y)),te.map===null||Y===!0||K===!0){const $e=this.type!==Br?{minFilter:Wn,magFilter:Wn}:{};te.map!==null&&te.map.dispose(),te.map=new qr(a.x,a.y,$e),te.map.texture.name=ce.name+".shadowMap",te.camera.updateProjectionMatrix()}n.setRenderTarget(te.map),n.clear();const be=te.getViewportCount();for(let $e=0;$e<be;$e++){const st=te.getViewport($e);u.set(l.x*st.x,l.y*st.y,l.x*st.z,l.y*st.w),B.viewport(u),te.updateMatrices(ce,$e),r=te.getFrustum(),X(L,W,te.camera,ce,this.type)}te.isPointLightShadow!==!0&&this.type===Br&&H(te,W),te.needsUpdate=!1}b=this.type,E.needsUpdate=!1,n.setRenderTarget(P,w,z)};function H(C,L){const W=e.update(F);y.defines.VSM_SAMPLES!==C.blurSamples&&(y.defines.VSM_SAMPLES=C.blurSamples,S.defines.VSM_SAMPLES=C.blurSamples,y.needsUpdate=!0,S.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new qr(a.x,a.y)),y.uniforms.shadow_pass.value=C.map.texture,y.uniforms.resolution.value=C.mapSize,y.uniforms.radius.value=C.radius,n.setRenderTarget(C.mapPass),n.clear(),n.renderBufferDirect(L,null,W,y,F,null),S.uniforms.shadow_pass.value=C.mapPass.texture,S.uniforms.resolution.value=C.mapSize,S.uniforms.radius.value=C.radius,n.setRenderTarget(C.map),n.clear(),n.renderBufferDirect(L,null,W,S,F,null)}function V(C,L,W,P){let w=null;const z=W.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(z!==void 0)w=z;else if(w=W.isPointLight===!0?p:o,n.localClippingEnabled&&L.clipShadows===!0&&Array.isArray(L.clippingPlanes)&&L.clippingPlanes.length!==0||L.displacementMap&&L.displacementScale!==0||L.alphaMap&&L.alphaTest>0||L.map&&L.alphaTest>0||L.alphaToCoverage===!0){const B=w.uuid,Y=L.uuid;let K=m[B];K===void 0&&(K={},m[B]=K);let j=K[Y];j===void 0&&(j=w.clone(),K[Y]=j,L.addEventListener("dispose",I)),w=j}if(w.visible=L.visible,w.wireframe=L.wireframe,P===Br?w.side=L.shadowSide!==null?L.shadowSide:L.side:w.side=L.shadowSide!==null?L.shadowSide:v[L.side],w.alphaMap=L.alphaMap,w.alphaTest=L.alphaToCoverage===!0?.5:L.alphaTest,w.map=L.map,w.clipShadows=L.clipShadows,w.clippingPlanes=L.clippingPlanes,w.clipIntersection=L.clipIntersection,w.displacementMap=L.displacementMap,w.displacementScale=L.displacementScale,w.displacementBias=L.displacementBias,w.wireframeLinewidth=L.wireframeLinewidth,w.linewidth=L.linewidth,W.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const B=n.properties.get(w);B.light=W}return w}function X(C,L,W,P,w){if(C.visible===!1)return;if(C.layers.test(L.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&w===Br)&&(!C.frustumCulled||r.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,C.matrixWorld);const Y=e.update(C),K=C.material;if(Array.isArray(K)){const j=Y.groups;for(let J=0,ce=j.length;J<ce;J++){const te=j[J],Se=K[te.materialIndex];if(Se&&Se.visible){const be=V(C,Se,P,w);C.onBeforeShadow(n,C,L,W,Y,be,te),n.renderBufferDirect(W,null,Y,be,C,te),C.onAfterShadow(n,C,L,W,Y,be,te)}}}else if(K.visible){const j=V(C,K,P,w);C.onBeforeShadow(n,C,L,W,Y,j,null),n.renderBufferDirect(W,null,Y,j,C,null),C.onAfterShadow(n,C,L,W,Y,j,null)}}const B=C.children;for(let Y=0,K=B.length;Y<K;Y++)X(B[Y],L,W,P,w)}function I(C){C.target.removeEventListener("dispose",I);for(const W in m){const P=m[W],w=C.target.uuid;w in P&&(P[w].dispose(),delete P[w])}}}const ay={[zc]:Gc,[Hc]:Xc,[Vc]:$c,[Fa]:Wc,[Gc]:zc,[Xc]:Hc,[$c]:Vc,[Wc]:Fa};function oy(n,e){function t(){let q=!1;const Fe=new Qt;let Te=null;const Ae=new Qt(0,0,0,0);return{setMask:function(Ee){Te!==Ee&&!q&&(n.colorMask(Ee,Ee,Ee,Ee),Te=Ee)},setLocked:function(Ee){q=Ee},setClear:function(Ee,pe,Ge,Re,It){It===!0&&(Ee*=Re,pe*=Re,Ge*=Re),Fe.set(Ee,pe,Ge,Re),Ae.equals(Fe)===!1&&(n.clearColor(Ee,pe,Ge,Re),Ae.copy(Fe))},reset:function(){q=!1,Te=null,Ae.set(-1,0,0,0)}}}function r(){let q=!1,Fe=!1,Te=null,Ae=null,Ee=null;return{setReversed:function(pe){if(Fe!==pe){const Ge=e.get("EXT_clip_control");pe?Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.ZERO_TO_ONE_EXT):Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.NEGATIVE_ONE_TO_ONE_EXT),Fe=pe;const Re=Ee;Ee=null,this.setClear(Re)}},getReversed:function(){return Fe},setTest:function(pe){pe?ge(n.DEPTH_TEST):Oe(n.DEPTH_TEST)},setMask:function(pe){Te!==pe&&!q&&(n.depthMask(pe),Te=pe)},setFunc:function(pe){if(Fe&&(pe=ay[pe]),Ae!==pe){switch(pe){case zc:n.depthFunc(n.NEVER);break;case Gc:n.depthFunc(n.ALWAYS);break;case Hc:n.depthFunc(n.LESS);break;case Fa:n.depthFunc(n.LEQUAL);break;case Vc:n.depthFunc(n.EQUAL);break;case Wc:n.depthFunc(n.GEQUAL);break;case Xc:n.depthFunc(n.GREATER);break;case $c:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Ae=pe}},setLocked:function(pe){q=pe},setClear:function(pe){Ee!==pe&&(Fe&&(pe=1-pe),n.clearDepth(pe),Ee=pe)},reset:function(){q=!1,Te=null,Ae=null,Ee=null,Fe=!1}}}function a(){let q=!1,Fe=null,Te=null,Ae=null,Ee=null,pe=null,Ge=null,Re=null,It=null;return{setTest:function(Et){q||(Et?ge(n.STENCIL_TEST):Oe(n.STENCIL_TEST))},setMask:function(Et){Fe!==Et&&!q&&(n.stencilMask(Et),Fe=Et)},setFunc:function(Et,bn,dn){(Te!==Et||Ae!==bn||Ee!==dn)&&(n.stencilFunc(Et,bn,dn),Te=Et,Ae=bn,Ee=dn)},setOp:function(Et,bn,dn){(pe!==Et||Ge!==bn||Re!==dn)&&(n.stencilOp(Et,bn,dn),pe=Et,Ge=bn,Re=dn)},setLocked:function(Et){q=Et},setClear:function(Et){It!==Et&&(n.clearStencil(Et),It=Et)},reset:function(){q=!1,Fe=null,Te=null,Ae=null,Ee=null,pe=null,Ge=null,Re=null,It=null}}}const l=new t,u=new r,o=new a,p=new WeakMap,m=new WeakMap;let x={},v={},y=new WeakMap,S=[],T=null,F=!1,E=null,b=null,H=null,V=null,X=null,I=null,C=null,L=new zt(0,0,0),W=0,P=!1,w=null,z=null,B=null,Y=null,K=null;const j=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let J=!1,ce=0;const te=n.getParameter(n.VERSION);te.indexOf("WebGL")!==-1?(ce=parseFloat(/^WebGL (\d)/.exec(te)[1]),J=ce>=1):te.indexOf("OpenGL ES")!==-1&&(ce=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),J=ce>=2);let Se=null,be={};const $e=n.getParameter(n.SCISSOR_BOX),st=n.getParameter(n.VIEWPORT),ht=new Qt().fromArray($e),xt=new Qt().fromArray(st);function gt(q,Fe,Te,Ae){const Ee=new Uint8Array(4),pe=n.createTexture();n.bindTexture(q,pe),n.texParameteri(q,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(q,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ge=0;Ge<Te;Ge++)q===n.TEXTURE_3D||q===n.TEXTURE_2D_ARRAY?n.texImage3D(Fe,0,n.RGBA,1,1,Ae,0,n.RGBA,n.UNSIGNED_BYTE,Ee):n.texImage2D(Fe+Ge,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Ee);return pe}const _e={};_e[n.TEXTURE_2D]=gt(n.TEXTURE_2D,n.TEXTURE_2D,1),_e[n.TEXTURE_CUBE_MAP]=gt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),_e[n.TEXTURE_2D_ARRAY]=gt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),_e[n.TEXTURE_3D]=gt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),l.setClear(0,0,0,1),u.setClear(1),o.setClear(0),ge(n.DEPTH_TEST),u.setFunc(Fa),Ce(!1),ke(_u),ge(n.CULL_FACE),Tt(pr);function ge(q){x[q]!==!0&&(n.enable(q),x[q]=!0)}function Oe(q){x[q]!==!1&&(n.disable(q),x[q]=!1)}function et(q,Fe){return v[q]!==Fe?(n.bindFramebuffer(q,Fe),v[q]=Fe,q===n.DRAW_FRAMEBUFFER&&(v[n.FRAMEBUFFER]=Fe),q===n.FRAMEBUFFER&&(v[n.DRAW_FRAMEBUFFER]=Fe),!0):!1}function qe(q,Fe){let Te=S,Ae=!1;if(q){Te=y.get(Fe),Te===void 0&&(Te=[],y.set(Fe,Te));const Ee=q.textures;if(Te.length!==Ee.length||Te[0]!==n.COLOR_ATTACHMENT0){for(let pe=0,Ge=Ee.length;pe<Ge;pe++)Te[pe]=n.COLOR_ATTACHMENT0+pe;Te.length=Ee.length,Ae=!0}}else Te[0]!==n.BACK&&(Te[0]=n.BACK,Ae=!0);Ae&&n.drawBuffers(Te)}function ct(q){return T!==q?(n.useProgram(q),T=q,!0):!1}const Pt={[ki]:n.FUNC_ADD,[pm]:n.FUNC_SUBTRACT,[mm]:n.FUNC_REVERSE_SUBTRACT};Pt[_m]=n.MIN,Pt[gm]=n.MAX;const ft={[vm]:n.ZERO,[xm]:n.ONE,[ym]:n.SRC_COLOR,[kc]:n.SRC_ALPHA,[Tm]:n.SRC_ALPHA_SATURATE,[Mm]:n.DST_COLOR,[bm]:n.DST_ALPHA,[Sm]:n.ONE_MINUS_SRC_COLOR,[Bc]:n.ONE_MINUS_SRC_ALPHA,[wm]:n.ONE_MINUS_DST_COLOR,[Em]:n.ONE_MINUS_DST_ALPHA,[Am]:n.CONSTANT_COLOR,[Cm]:n.ONE_MINUS_CONSTANT_COLOR,[Rm]:n.CONSTANT_ALPHA,[Pm]:n.ONE_MINUS_CONSTANT_ALPHA};function Tt(q,Fe,Te,Ae,Ee,pe,Ge,Re,It,Et){if(q===pr){F===!0&&(Oe(n.BLEND),F=!1);return}if(F===!1&&(ge(n.BLEND),F=!0),q!==hm){if(q!==E||Et!==P){if((b!==ki||X!==ki)&&(n.blendEquation(n.FUNC_ADD),b=ki,X=ki),Et)switch(q){case Ca:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case gu:n.blendFunc(n.ONE,n.ONE);break;case vu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case xu:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Jt("WebGLState: Invalid blending: ",q);break}else switch(q){case Ca:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case gu:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case vu:Jt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case xu:Jt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Jt("WebGLState: Invalid blending: ",q);break}H=null,V=null,I=null,C=null,L.set(0,0,0),W=0,E=q,P=Et}return}Ee=Ee||Fe,pe=pe||Te,Ge=Ge||Ae,(Fe!==b||Ee!==X)&&(n.blendEquationSeparate(Pt[Fe],Pt[Ee]),b=Fe,X=Ee),(Te!==H||Ae!==V||pe!==I||Ge!==C)&&(n.blendFuncSeparate(ft[Te],ft[Ae],ft[pe],ft[Ge]),H=Te,V=Ae,I=pe,C=Ge),(Re.equals(L)===!1||It!==W)&&(n.blendColor(Re.r,Re.g,Re.b,It),L.copy(Re),W=It),E=q,P=!1}function $(q,Fe){q.side===Gr?Oe(n.CULL_FACE):ge(n.CULL_FACE);let Te=q.side===In;Fe&&(Te=!Te),Ce(Te),q.blending===Ca&&q.transparent===!1?Tt(pr):Tt(q.blending,q.blendEquation,q.blendSrc,q.blendDst,q.blendEquationAlpha,q.blendSrcAlpha,q.blendDstAlpha,q.blendColor,q.blendAlpha,q.premultipliedAlpha),u.setFunc(q.depthFunc),u.setTest(q.depthTest),u.setMask(q.depthWrite),l.setMask(q.colorWrite);const Ae=q.stencilWrite;o.setTest(Ae),Ae&&(o.setMask(q.stencilWriteMask),o.setFunc(q.stencilFunc,q.stencilRef,q.stencilFuncMask),o.setOp(q.stencilFail,q.stencilZFail,q.stencilZPass)),Ie(q.polygonOffset,q.polygonOffsetFactor,q.polygonOffsetUnits),q.alphaToCoverage===!0?ge(n.SAMPLE_ALPHA_TO_COVERAGE):Oe(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ce(q){w!==q&&(q?n.frontFace(n.CW):n.frontFace(n.CCW),w=q)}function ke(q){q!==fm?(ge(n.CULL_FACE),q!==z&&(q===_u?n.cullFace(n.BACK):q===um?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Oe(n.CULL_FACE),z=q}function lt(q){q!==B&&(J&&n.lineWidth(q),B=q)}function Ie(q,Fe,Te){q?(ge(n.POLYGON_OFFSET_FILL),(Y!==Fe||K!==Te)&&(n.polygonOffset(Fe,Te),Y=Fe,K=Te)):Oe(n.POLYGON_OFFSET_FILL)}function yt(q){q?ge(n.SCISSOR_TEST):Oe(n.SCISSOR_TEST)}function Ye(q){q===void 0&&(q=n.TEXTURE0+j-1),Se!==q&&(n.activeTexture(q),Se=q)}function tt(q,Fe,Te){Te===void 0&&(Se===null?Te=n.TEXTURE0+j-1:Te=Se);let Ae=be[Te];Ae===void 0&&(Ae={type:void 0,texture:void 0},be[Te]=Ae),(Ae.type!==q||Ae.texture!==Fe)&&(Se!==Te&&(n.activeTexture(Te),Se=Te),n.bindTexture(q,Fe||_e[q]),Ae.type=q,Ae.texture=Fe)}function N(){const q=be[Se];q!==void 0&&q.type!==void 0&&(n.bindTexture(q.type,null),q.type=void 0,q.texture=void 0)}function D(){try{n.compressedTexImage2D(...arguments)}catch(q){q("WebGLState:",q)}}function ne(){try{n.compressedTexImage3D(...arguments)}catch(q){q("WebGLState:",q)}}function fe(){try{n.texSubImage2D(...arguments)}catch(q){q("WebGLState:",q)}}function de(){try{n.texSubImage3D(...arguments)}catch(q){q("WebGLState:",q)}}function ie(){try{n.compressedTexSubImage2D(...arguments)}catch(q){q("WebGLState:",q)}}function Ke(){try{n.compressedTexSubImage3D(...arguments)}catch(q){q("WebGLState:",q)}}function Ue(){try{n.texStorage2D(...arguments)}catch(q){q("WebGLState:",q)}}function rt(){try{n.texStorage3D(...arguments)}catch(q){q("WebGLState:",q)}}function Ze(){try{n.texImage2D(...arguments)}catch(q){q("WebGLState:",q)}}function ve(){try{n.texImage3D(...arguments)}catch(q){q("WebGLState:",q)}}function he(q){ht.equals(q)===!1&&(n.scissor(q.x,q.y,q.z,q.w),ht.copy(q))}function we(q){xt.equals(q)===!1&&(n.viewport(q.x,q.y,q.z,q.w),xt.copy(q))}function je(q,Fe){let Te=m.get(Fe);Te===void 0&&(Te=new WeakMap,m.set(Fe,Te));let Ae=Te.get(q);Ae===void 0&&(Ae=n.getUniformBlockIndex(Fe,q.name),Te.set(q,Ae))}function Be(q,Fe){const Ae=m.get(Fe).get(q);p.get(Fe)!==Ae&&(n.uniformBlockBinding(Fe,Ae,q.__bindingPointIndex),p.set(Fe,Ae))}function Qe(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),u.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),x={},Se=null,be={},v={},y=new WeakMap,S=[],T=null,F=!1,E=null,b=null,H=null,V=null,X=null,I=null,C=null,L=new zt(0,0,0),W=0,P=!1,w=null,z=null,B=null,Y=null,K=null,ht.set(0,0,n.canvas.width,n.canvas.height),xt.set(0,0,n.canvas.width,n.canvas.height),l.reset(),u.reset(),o.reset()}return{buffers:{color:l,depth:u,stencil:o},enable:ge,disable:Oe,bindFramebuffer:et,drawBuffers:qe,useProgram:ct,setBlending:Tt,setMaterial:$,setFlipSided:Ce,setCullFace:ke,setLineWidth:lt,setPolygonOffset:Ie,setScissorTest:yt,activeTexture:Ye,bindTexture:tt,unbindTexture:N,compressedTexImage2D:D,compressedTexImage3D:ne,texImage2D:Ze,texImage3D:ve,updateUBOMapping:je,uniformBlockBinding:Be,texStorage2D:Ue,texStorage3D:rt,texSubImage2D:fe,texSubImage3D:de,compressedTexSubImage2D:ie,compressedTexSubImage3D:Ke,scissor:he,viewport:we,reset:Qe}}function sy(n,e,t,r,a,l,u){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,p=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),m=new Gt,x=new WeakMap;let v;const y=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(N,D){return S?new OffscreenCanvas(N,D):Os("canvas")}function F(N,D,ne){let fe=1;const de=tt(N);if((de.width>ne||de.height>ne)&&(fe=ne/Math.max(de.width,de.height)),fe<1)if(typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&N instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&N instanceof ImageBitmap||typeof VideoFrame<"u"&&N instanceof VideoFrame){const ie=Math.floor(fe*de.width),Ke=Math.floor(fe*de.height);v===void 0&&(v=T(ie,Ke));const Ue=D?T(ie,Ke):v;return Ue.width=ie,Ue.height=Ke,Ue.getContext("2d").drawImage(N,0,0,ie,Ke),pt("WebGLRenderer: Texture has been resized from ("+de.width+"x"+de.height+") to ("+ie+"x"+Ke+")."),Ue}else return"data"in N&&pt("WebGLRenderer: Image in DataTexture is too big ("+de.width+"x"+de.height+")."),N;return N}function E(N){return N.generateMipmaps}function b(N){n.generateMipmap(N)}function H(N){return N.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:N.isWebGL3DRenderTarget?n.TEXTURE_3D:N.isWebGLArrayRenderTarget||N.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function V(N,D,ne,fe,de=!1){if(N!==null){if(n[N]!==void 0)return n[N];pt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+N+"'")}let ie=D;if(D===n.RED&&(ne===n.FLOAT&&(ie=n.R32F),ne===n.HALF_FLOAT&&(ie=n.R16F),ne===n.UNSIGNED_BYTE&&(ie=n.R8)),D===n.RED_INTEGER&&(ne===n.UNSIGNED_BYTE&&(ie=n.R8UI),ne===n.UNSIGNED_SHORT&&(ie=n.R16UI),ne===n.UNSIGNED_INT&&(ie=n.R32UI),ne===n.BYTE&&(ie=n.R8I),ne===n.SHORT&&(ie=n.R16I),ne===n.INT&&(ie=n.R32I)),D===n.RG&&(ne===n.FLOAT&&(ie=n.RG32F),ne===n.HALF_FLOAT&&(ie=n.RG16F),ne===n.UNSIGNED_BYTE&&(ie=n.RG8)),D===n.RG_INTEGER&&(ne===n.UNSIGNED_BYTE&&(ie=n.RG8UI),ne===n.UNSIGNED_SHORT&&(ie=n.RG16UI),ne===n.UNSIGNED_INT&&(ie=n.RG32UI),ne===n.BYTE&&(ie=n.RG8I),ne===n.SHORT&&(ie=n.RG16I),ne===n.INT&&(ie=n.RG32I)),D===n.RGB_INTEGER&&(ne===n.UNSIGNED_BYTE&&(ie=n.RGB8UI),ne===n.UNSIGNED_SHORT&&(ie=n.RGB16UI),ne===n.UNSIGNED_INT&&(ie=n.RGB32UI),ne===n.BYTE&&(ie=n.RGB8I),ne===n.SHORT&&(ie=n.RGB16I),ne===n.INT&&(ie=n.RGB32I)),D===n.RGBA_INTEGER&&(ne===n.UNSIGNED_BYTE&&(ie=n.RGBA8UI),ne===n.UNSIGNED_SHORT&&(ie=n.RGBA16UI),ne===n.UNSIGNED_INT&&(ie=n.RGBA32UI),ne===n.BYTE&&(ie=n.RGBA8I),ne===n.SHORT&&(ie=n.RGBA16I),ne===n.INT&&(ie=n.RGBA32I)),D===n.RGB&&(ne===n.UNSIGNED_INT_5_9_9_9_REV&&(ie=n.RGB9_E5),ne===n.UNSIGNED_INT_10F_11F_11F_REV&&(ie=n.R11F_G11F_B10F)),D===n.RGBA){const Ke=de?Us:Rt.getTransfer(fe);ne===n.FLOAT&&(ie=n.RGBA32F),ne===n.HALF_FLOAT&&(ie=n.RGBA16F),ne===n.UNSIGNED_BYTE&&(ie=Ke===Bt?n.SRGB8_ALPHA8:n.RGBA8),ne===n.UNSIGNED_SHORT_4_4_4_4&&(ie=n.RGBA4),ne===n.UNSIGNED_SHORT_5_5_5_1&&(ie=n.RGB5_A1)}return(ie===n.R16F||ie===n.R32F||ie===n.RG16F||ie===n.RG32F||ie===n.RGBA16F||ie===n.RGBA32F)&&e.get("EXT_color_buffer_float"),ie}function X(N,D){let ne;return N?D===null||D===bi||D===xo?ne=n.DEPTH24_STENCIL8:D===Zn?ne=n.DEPTH32F_STENCIL8:D===vo&&(ne=n.DEPTH24_STENCIL8,pt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):D===null||D===bi||D===xo?ne=n.DEPTH_COMPONENT24:D===Zn?ne=n.DEPTH_COMPONENT32F:D===vo&&(ne=n.DEPTH_COMPONENT16),ne}function I(N,D){return E(N)===!0||N.isFramebufferTexture&&N.minFilter!==Wn&&N.minFilter!==un?Math.log2(Math.max(D.width,D.height))+1:N.mipmaps!==void 0&&N.mipmaps.length>0?N.mipmaps.length:N.isCompressedTexture&&Array.isArray(N.image)?D.mipmaps.length:1}function C(N){const D=N.target;D.removeEventListener("dispose",C),W(D),D.isVideoTexture&&x.delete(D)}function L(N){const D=N.target;D.removeEventListener("dispose",L),w(D)}function W(N){const D=r.get(N);if(D.__webglInit===void 0)return;const ne=N.source,fe=y.get(ne);if(fe){const de=fe[D.__cacheKey];de.usedTimes--,de.usedTimes===0&&P(N),Object.keys(fe).length===0&&y.delete(ne)}r.remove(N)}function P(N){const D=r.get(N);n.deleteTexture(D.__webglTexture);const ne=N.source,fe=y.get(ne);delete fe[D.__cacheKey],u.memory.textures--}function w(N){const D=r.get(N);if(N.depthTexture&&(N.depthTexture.dispose(),r.remove(N.depthTexture)),N.isWebGLCubeRenderTarget)for(let fe=0;fe<6;fe++){if(Array.isArray(D.__webglFramebuffer[fe]))for(let de=0;de<D.__webglFramebuffer[fe].length;de++)n.deleteFramebuffer(D.__webglFramebuffer[fe][de]);else n.deleteFramebuffer(D.__webglFramebuffer[fe]);D.__webglDepthbuffer&&n.deleteRenderbuffer(D.__webglDepthbuffer[fe])}else{if(Array.isArray(D.__webglFramebuffer))for(let fe=0;fe<D.__webglFramebuffer.length;fe++)n.deleteFramebuffer(D.__webglFramebuffer[fe]);else n.deleteFramebuffer(D.__webglFramebuffer);if(D.__webglDepthbuffer&&n.deleteRenderbuffer(D.__webglDepthbuffer),D.__webglMultisampledFramebuffer&&n.deleteFramebuffer(D.__webglMultisampledFramebuffer),D.__webglColorRenderbuffer)for(let fe=0;fe<D.__webglColorRenderbuffer.length;fe++)D.__webglColorRenderbuffer[fe]&&n.deleteRenderbuffer(D.__webglColorRenderbuffer[fe]);D.__webglDepthRenderbuffer&&n.deleteRenderbuffer(D.__webglDepthRenderbuffer)}const ne=N.textures;for(let fe=0,de=ne.length;fe<de;fe++){const ie=r.get(ne[fe]);ie.__webglTexture&&(n.deleteTexture(ie.__webglTexture),u.memory.textures--),r.remove(ne[fe])}r.remove(N)}let z=0;function B(){z=0}function Y(){const N=z;return N>=a.maxTextures&&pt("WebGLTextures: Trying to use "+N+" texture units while this GPU supports only "+a.maxTextures),z+=1,N}function K(N){const D=[];return D.push(N.wrapS),D.push(N.wrapT),D.push(N.wrapR||0),D.push(N.magFilter),D.push(N.minFilter),D.push(N.anisotropy),D.push(N.internalFormat),D.push(N.format),D.push(N.type),D.push(N.generateMipmaps),D.push(N.premultiplyAlpha),D.push(N.flipY),D.push(N.unpackAlignment),D.push(N.colorSpace),D.join()}function j(N,D){const ne=r.get(N);if(N.isVideoTexture&&yt(N),N.isRenderTargetTexture===!1&&N.isExternalTexture!==!0&&N.version>0&&ne.__version!==N.version){const fe=N.image;if(fe===null)pt("WebGLRenderer: Texture marked for update but no image data found.");else if(fe.complete===!1)pt("WebGLRenderer: Texture marked for update but image is incomplete");else{_e(ne,N,D);return}}else N.isExternalTexture&&(ne.__webglTexture=N.sourceTexture?N.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,ne.__webglTexture,n.TEXTURE0+D)}function J(N,D){const ne=r.get(N);if(N.isRenderTargetTexture===!1&&N.version>0&&ne.__version!==N.version){_e(ne,N,D);return}else N.isExternalTexture&&(ne.__webglTexture=N.sourceTexture?N.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,ne.__webglTexture,n.TEXTURE0+D)}function ce(N,D){const ne=r.get(N);if(N.isRenderTargetTexture===!1&&N.version>0&&ne.__version!==N.version){_e(ne,N,D);return}t.bindTexture(n.TEXTURE_3D,ne.__webglTexture,n.TEXTURE0+D)}function te(N,D){const ne=r.get(N);if(N.version>0&&ne.__version!==N.version){ge(ne,N,D);return}t.bindTexture(n.TEXTURE_CUBE_MAP,ne.__webglTexture,n.TEXTURE0+D)}const Se={[go]:n.REPEAT,[Hn]:n.CLAMP_TO_EDGE,[Zc]:n.MIRRORED_REPEAT},be={[Wn]:n.NEAREST,[Nm]:n.NEAREST_MIPMAP_NEAREST,[es]:n.NEAREST_MIPMAP_LINEAR,[un]:n.LINEAR,[Zl]:n.LINEAR_MIPMAP_NEAREST,[Gi]:n.LINEAR_MIPMAP_LINEAR},$e={[Gm]:n.NEVER,[qm]:n.ALWAYS,[Hm]:n.LESS,[fh]:n.LEQUAL,[Vm]:n.EQUAL,[$m]:n.GEQUAL,[Wm]:n.GREATER,[Xm]:n.NOTEQUAL};function st(N,D){if(D.type===Zn&&e.has("OES_texture_float_linear")===!1&&(D.magFilter===un||D.magFilter===Zl||D.magFilter===es||D.magFilter===Gi||D.minFilter===un||D.minFilter===Zl||D.minFilter===es||D.minFilter===Gi)&&pt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(N,n.TEXTURE_WRAP_S,Se[D.wrapS]),n.texParameteri(N,n.TEXTURE_WRAP_T,Se[D.wrapT]),(N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY)&&n.texParameteri(N,n.TEXTURE_WRAP_R,Se[D.wrapR]),n.texParameteri(N,n.TEXTURE_MAG_FILTER,be[D.magFilter]),n.texParameteri(N,n.TEXTURE_MIN_FILTER,be[D.minFilter]),D.compareFunction&&(n.texParameteri(N,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(N,n.TEXTURE_COMPARE_FUNC,$e[D.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(D.magFilter===Wn||D.minFilter!==es&&D.minFilter!==Gi||D.type===Zn&&e.has("OES_texture_float_linear")===!1)return;if(D.anisotropy>1||r.get(D).__currentAnisotropy){const ne=e.get("EXT_texture_filter_anisotropic");n.texParameterf(N,ne.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(D.anisotropy,a.getMaxAnisotropy())),r.get(D).__currentAnisotropy=D.anisotropy}}}function ht(N,D){let ne=!1;N.__webglInit===void 0&&(N.__webglInit=!0,D.addEventListener("dispose",C));const fe=D.source;let de=y.get(fe);de===void 0&&(de={},y.set(fe,de));const ie=K(D);if(ie!==N.__cacheKey){de[ie]===void 0&&(de[ie]={texture:n.createTexture(),usedTimes:0},u.memory.textures++,ne=!0),de[ie].usedTimes++;const Ke=de[N.__cacheKey];Ke!==void 0&&(de[N.__cacheKey].usedTimes--,Ke.usedTimes===0&&P(D)),N.__cacheKey=ie,N.__webglTexture=de[ie].texture}return ne}function xt(N,D,ne){return Math.floor(Math.floor(N/ne)/D)}function gt(N,D,ne,fe){const ie=N.updateRanges;if(ie.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,D.width,D.height,ne,fe,D.data);else{ie.sort((ve,he)=>ve.start-he.start);let Ke=0;for(let ve=1;ve<ie.length;ve++){const he=ie[Ke],we=ie[ve],je=he.start+he.count,Be=xt(we.start,D.width,4),Qe=xt(he.start,D.width,4);we.start<=je+1&&Be===Qe&&xt(we.start+we.count-1,D.width,4)===Be?he.count=Math.max(he.count,we.start+we.count-he.start):(++Ke,ie[Ke]=we)}ie.length=Ke+1;const Ue=n.getParameter(n.UNPACK_ROW_LENGTH),rt=n.getParameter(n.UNPACK_SKIP_PIXELS),Ze=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,D.width);for(let ve=0,he=ie.length;ve<he;ve++){const we=ie[ve],je=Math.floor(we.start/4),Be=Math.ceil(we.count/4),Qe=je%D.width,q=Math.floor(je/D.width),Fe=Be,Te=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Qe),n.pixelStorei(n.UNPACK_SKIP_ROWS,q),t.texSubImage2D(n.TEXTURE_2D,0,Qe,q,Fe,Te,ne,fe,D.data)}N.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,Ue),n.pixelStorei(n.UNPACK_SKIP_PIXELS,rt),n.pixelStorei(n.UNPACK_SKIP_ROWS,Ze)}}function _e(N,D,ne){let fe=n.TEXTURE_2D;(D.isDataArrayTexture||D.isCompressedArrayTexture)&&(fe=n.TEXTURE_2D_ARRAY),D.isData3DTexture&&(fe=n.TEXTURE_3D);const de=ht(N,D),ie=D.source;t.bindTexture(fe,N.__webglTexture,n.TEXTURE0+ne);const Ke=r.get(ie);if(ie.version!==Ke.__version||de===!0){t.activeTexture(n.TEXTURE0+ne);const Ue=Rt.getPrimaries(Rt.workingColorSpace),rt=D.colorSpace===_i?null:Rt.getPrimaries(D.colorSpace),Ze=D.colorSpace===_i||Ue===rt?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,D.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,D.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ze);let ve=F(D.image,!1,a.maxTextureSize);ve=Ye(D,ve);const he=l.convert(D.format,D.colorSpace),we=l.convert(D.type);let je=V(D.internalFormat,he,we,D.colorSpace,D.isVideoTexture);st(fe,D);let Be;const Qe=D.mipmaps,q=D.isVideoTexture!==!0,Fe=Ke.__version===void 0||de===!0,Te=ie.dataReady,Ae=I(D,ve);if(D.isDepthTexture)je=X(D.format===So,D.type),Fe&&(q?t.texStorage2D(n.TEXTURE_2D,1,je,ve.width,ve.height):t.texImage2D(n.TEXTURE_2D,0,je,ve.width,ve.height,0,he,we,null));else if(D.isDataTexture)if(Qe.length>0){q&&Fe&&t.texStorage2D(n.TEXTURE_2D,Ae,je,Qe[0].width,Qe[0].height);for(let Ee=0,pe=Qe.length;Ee<pe;Ee++)Be=Qe[Ee],q?Te&&t.texSubImage2D(n.TEXTURE_2D,Ee,0,0,Be.width,Be.height,he,we,Be.data):t.texImage2D(n.TEXTURE_2D,Ee,je,Be.width,Be.height,0,he,we,Be.data);D.generateMipmaps=!1}else q?(Fe&&t.texStorage2D(n.TEXTURE_2D,Ae,je,ve.width,ve.height),Te&&gt(D,ve,he,we)):t.texImage2D(n.TEXTURE_2D,0,je,ve.width,ve.height,0,he,we,ve.data);else if(D.isCompressedTexture)if(D.isCompressedArrayTexture){q&&Fe&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ae,je,Qe[0].width,Qe[0].height,ve.depth);for(let Ee=0,pe=Qe.length;Ee<pe;Ee++)if(Be=Qe[Ee],D.format!==An)if(he!==null)if(q){if(Te)if(D.layerUpdates.size>0){const Ge=Gu(Be.width,Be.height,D.format,D.type);for(const Re of D.layerUpdates){const It=Be.data.subarray(Re*Ge/Be.data.BYTES_PER_ELEMENT,(Re+1)*Ge/Be.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Ee,0,0,Re,Be.width,Be.height,1,he,It)}D.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Ee,0,0,0,Be.width,Be.height,ve.depth,he,Be.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Ee,je,Be.width,Be.height,ve.depth,0,Be.data,0,0);else pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else q?Te&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Ee,0,0,0,Be.width,Be.height,ve.depth,he,we,Be.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Ee,je,Be.width,Be.height,ve.depth,0,he,we,Be.data)}else{q&&Fe&&t.texStorage2D(n.TEXTURE_2D,Ae,je,Qe[0].width,Qe[0].height);for(let Ee=0,pe=Qe.length;Ee<pe;Ee++)Be=Qe[Ee],D.format!==An?he!==null?q?Te&&t.compressedTexSubImage2D(n.TEXTURE_2D,Ee,0,0,Be.width,Be.height,he,Be.data):t.compressedTexImage2D(n.TEXTURE_2D,Ee,je,Be.width,Be.height,0,Be.data):pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):q?Te&&t.texSubImage2D(n.TEXTURE_2D,Ee,0,0,Be.width,Be.height,he,we,Be.data):t.texImage2D(n.TEXTURE_2D,Ee,je,Be.width,Be.height,0,he,we,Be.data)}else if(D.isDataArrayTexture)if(q){if(Fe&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ae,je,ve.width,ve.height,ve.depth),Te)if(D.layerUpdates.size>0){const Ee=Gu(ve.width,ve.height,D.format,D.type);for(const pe of D.layerUpdates){const Ge=ve.data.subarray(pe*Ee/ve.data.BYTES_PER_ELEMENT,(pe+1)*Ee/ve.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,pe,ve.width,ve.height,1,he,we,Ge)}D.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ve.width,ve.height,ve.depth,he,we,ve.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,je,ve.width,ve.height,ve.depth,0,he,we,ve.data);else if(D.isData3DTexture)q?(Fe&&t.texStorage3D(n.TEXTURE_3D,Ae,je,ve.width,ve.height,ve.depth),Te&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ve.width,ve.height,ve.depth,he,we,ve.data)):t.texImage3D(n.TEXTURE_3D,0,je,ve.width,ve.height,ve.depth,0,he,we,ve.data);else if(D.isFramebufferTexture){if(Fe)if(q)t.texStorage2D(n.TEXTURE_2D,Ae,je,ve.width,ve.height);else{let Ee=ve.width,pe=ve.height;for(let Ge=0;Ge<Ae;Ge++)t.texImage2D(n.TEXTURE_2D,Ge,je,Ee,pe,0,he,we,null),Ee>>=1,pe>>=1}}else if(Qe.length>0){if(q&&Fe){const Ee=tt(Qe[0]);t.texStorage2D(n.TEXTURE_2D,Ae,je,Ee.width,Ee.height)}for(let Ee=0,pe=Qe.length;Ee<pe;Ee++)Be=Qe[Ee],q?Te&&t.texSubImage2D(n.TEXTURE_2D,Ee,0,0,he,we,Be):t.texImage2D(n.TEXTURE_2D,Ee,je,he,we,Be);D.generateMipmaps=!1}else if(q){if(Fe){const Ee=tt(ve);t.texStorage2D(n.TEXTURE_2D,Ae,je,Ee.width,Ee.height)}Te&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,he,we,ve)}else t.texImage2D(n.TEXTURE_2D,0,je,he,we,ve);E(D)&&b(fe),Ke.__version=ie.version,D.onUpdate&&D.onUpdate(D)}N.__version=D.version}function ge(N,D,ne){if(D.image.length!==6)return;const fe=ht(N,D),de=D.source;t.bindTexture(n.TEXTURE_CUBE_MAP,N.__webglTexture,n.TEXTURE0+ne);const ie=r.get(de);if(de.version!==ie.__version||fe===!0){t.activeTexture(n.TEXTURE0+ne);const Ke=Rt.getPrimaries(Rt.workingColorSpace),Ue=D.colorSpace===_i?null:Rt.getPrimaries(D.colorSpace),rt=D.colorSpace===_i||Ke===Ue?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,D.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,D.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,rt);const Ze=D.isCompressedTexture||D.image[0].isCompressedTexture,ve=D.image[0]&&D.image[0].isDataTexture,he=[];for(let pe=0;pe<6;pe++)!Ze&&!ve?he[pe]=F(D.image[pe],!0,a.maxCubemapSize):he[pe]=ve?D.image[pe].image:D.image[pe],he[pe]=Ye(D,he[pe]);const we=he[0],je=l.convert(D.format,D.colorSpace),Be=l.convert(D.type),Qe=V(D.internalFormat,je,Be,D.colorSpace),q=D.isVideoTexture!==!0,Fe=ie.__version===void 0||fe===!0,Te=de.dataReady;let Ae=I(D,we);st(n.TEXTURE_CUBE_MAP,D);let Ee;if(Ze){q&&Fe&&t.texStorage2D(n.TEXTURE_CUBE_MAP,Ae,Qe,we.width,we.height);for(let pe=0;pe<6;pe++){Ee=he[pe].mipmaps;for(let Ge=0;Ge<Ee.length;Ge++){const Re=Ee[Ge];D.format!==An?je!==null?q?Te&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ge,0,0,Re.width,Re.height,je,Re.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ge,Qe,Re.width,Re.height,0,Re.data):pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):q?Te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ge,0,0,Re.width,Re.height,je,Be,Re.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ge,Qe,Re.width,Re.height,0,je,Be,Re.data)}}}else{if(Ee=D.mipmaps,q&&Fe){Ee.length>0&&Ae++;const pe=tt(he[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,Ae,Qe,pe.width,pe.height)}for(let pe=0;pe<6;pe++)if(ve){q?Te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,he[pe].width,he[pe].height,je,Be,he[pe].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,Qe,he[pe].width,he[pe].height,0,je,Be,he[pe].data);for(let Ge=0;Ge<Ee.length;Ge++){const It=Ee[Ge].image[pe].image;q?Te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ge+1,0,0,It.width,It.height,je,Be,It.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ge+1,Qe,It.width,It.height,0,je,Be,It.data)}}else{q?Te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,je,Be,he[pe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,Qe,je,Be,he[pe]);for(let Ge=0;Ge<Ee.length;Ge++){const Re=Ee[Ge];q?Te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ge+1,0,0,je,Be,Re.image[pe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ge+1,Qe,je,Be,Re.image[pe])}}}E(D)&&b(n.TEXTURE_CUBE_MAP),ie.__version=de.version,D.onUpdate&&D.onUpdate(D)}N.__version=D.version}function Oe(N,D,ne,fe,de,ie){const Ke=l.convert(ne.format,ne.colorSpace),Ue=l.convert(ne.type),rt=V(ne.internalFormat,Ke,Ue,ne.colorSpace),Ze=r.get(D),ve=r.get(ne);if(ve.__renderTarget=D,!Ze.__hasExternalTextures){const he=Math.max(1,D.width>>ie),we=Math.max(1,D.height>>ie);de===n.TEXTURE_3D||de===n.TEXTURE_2D_ARRAY?t.texImage3D(de,ie,rt,he,we,D.depth,0,Ke,Ue,null):t.texImage2D(de,ie,rt,he,we,0,Ke,Ue,null)}t.bindFramebuffer(n.FRAMEBUFFER,N),Ie(D)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,fe,de,ve.__webglTexture,0,lt(D)):(de===n.TEXTURE_2D||de>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&de<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,fe,de,ve.__webglTexture,ie),t.bindFramebuffer(n.FRAMEBUFFER,null)}function et(N,D,ne){if(n.bindRenderbuffer(n.RENDERBUFFER,N),D.depthBuffer){const fe=D.depthTexture,de=fe&&fe.isDepthTexture?fe.type:null,ie=X(D.stencilBuffer,de),Ke=D.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ue=lt(D);Ie(D)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ue,ie,D.width,D.height):ne?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ue,ie,D.width,D.height):n.renderbufferStorage(n.RENDERBUFFER,ie,D.width,D.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ke,n.RENDERBUFFER,N)}else{const fe=D.textures;for(let de=0;de<fe.length;de++){const ie=fe[de],Ke=l.convert(ie.format,ie.colorSpace),Ue=l.convert(ie.type),rt=V(ie.internalFormat,Ke,Ue,ie.colorSpace),Ze=lt(D);ne&&Ie(D)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ze,rt,D.width,D.height):Ie(D)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ze,rt,D.width,D.height):n.renderbufferStorage(n.RENDERBUFFER,rt,D.width,D.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function qe(N,D){if(D&&D.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,N),!(D.depthTexture&&D.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const fe=r.get(D.depthTexture);fe.__renderTarget=D,(!fe.__webglTexture||D.depthTexture.image.width!==D.width||D.depthTexture.image.height!==D.height)&&(D.depthTexture.image.width=D.width,D.depthTexture.image.height=D.height,D.depthTexture.needsUpdate=!0),j(D.depthTexture,0);const de=fe.__webglTexture,ie=lt(D);if(D.depthTexture.format===yo)Ie(D)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,de,0,ie):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,de,0);else if(D.depthTexture.format===So)Ie(D)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,de,0,ie):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,de,0);else throw new Error("Unknown depthTexture format")}function ct(N){const D=r.get(N),ne=N.isWebGLCubeRenderTarget===!0;if(D.__boundDepthTexture!==N.depthTexture){const fe=N.depthTexture;if(D.__depthDisposeCallback&&D.__depthDisposeCallback(),fe){const de=()=>{delete D.__boundDepthTexture,delete D.__depthDisposeCallback,fe.removeEventListener("dispose",de)};fe.addEventListener("dispose",de),D.__depthDisposeCallback=de}D.__boundDepthTexture=fe}if(N.depthTexture&&!D.__autoAllocateDepthBuffer){if(ne)throw new Error("target.depthTexture not supported in Cube render targets");const fe=N.texture.mipmaps;fe&&fe.length>0?qe(D.__webglFramebuffer[0],N):qe(D.__webglFramebuffer,N)}else if(ne){D.__webglDepthbuffer=[];for(let fe=0;fe<6;fe++)if(t.bindFramebuffer(n.FRAMEBUFFER,D.__webglFramebuffer[fe]),D.__webglDepthbuffer[fe]===void 0)D.__webglDepthbuffer[fe]=n.createRenderbuffer(),et(D.__webglDepthbuffer[fe],N,!1);else{const de=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=D.__webglDepthbuffer[fe];n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,ie)}}else{const fe=N.texture.mipmaps;if(fe&&fe.length>0?t.bindFramebuffer(n.FRAMEBUFFER,D.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,D.__webglFramebuffer),D.__webglDepthbuffer===void 0)D.__webglDepthbuffer=n.createRenderbuffer(),et(D.__webglDepthbuffer,N,!1);else{const de=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=D.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,ie)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Pt(N,D,ne){const fe=r.get(N);D!==void 0&&Oe(fe.__webglFramebuffer,N,N.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),ne!==void 0&&ct(N)}function ft(N){const D=N.texture,ne=r.get(N),fe=r.get(D);N.addEventListener("dispose",L);const de=N.textures,ie=N.isWebGLCubeRenderTarget===!0,Ke=de.length>1;if(Ke||(fe.__webglTexture===void 0&&(fe.__webglTexture=n.createTexture()),fe.__version=D.version,u.memory.textures++),ie){ne.__webglFramebuffer=[];for(let Ue=0;Ue<6;Ue++)if(D.mipmaps&&D.mipmaps.length>0){ne.__webglFramebuffer[Ue]=[];for(let rt=0;rt<D.mipmaps.length;rt++)ne.__webglFramebuffer[Ue][rt]=n.createFramebuffer()}else ne.__webglFramebuffer[Ue]=n.createFramebuffer()}else{if(D.mipmaps&&D.mipmaps.length>0){ne.__webglFramebuffer=[];for(let Ue=0;Ue<D.mipmaps.length;Ue++)ne.__webglFramebuffer[Ue]=n.createFramebuffer()}else ne.__webglFramebuffer=n.createFramebuffer();if(Ke)for(let Ue=0,rt=de.length;Ue<rt;Ue++){const Ze=r.get(de[Ue]);Ze.__webglTexture===void 0&&(Ze.__webglTexture=n.createTexture(),u.memory.textures++)}if(N.samples>0&&Ie(N)===!1){ne.__webglMultisampledFramebuffer=n.createFramebuffer(),ne.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,ne.__webglMultisampledFramebuffer);for(let Ue=0;Ue<de.length;Ue++){const rt=de[Ue];ne.__webglColorRenderbuffer[Ue]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,ne.__webglColorRenderbuffer[Ue]);const Ze=l.convert(rt.format,rt.colorSpace),ve=l.convert(rt.type),he=V(rt.internalFormat,Ze,ve,rt.colorSpace,N.isXRRenderTarget===!0),we=lt(N);n.renderbufferStorageMultisample(n.RENDERBUFFER,we,he,N.width,N.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ue,n.RENDERBUFFER,ne.__webglColorRenderbuffer[Ue])}n.bindRenderbuffer(n.RENDERBUFFER,null),N.depthBuffer&&(ne.__webglDepthRenderbuffer=n.createRenderbuffer(),et(ne.__webglDepthRenderbuffer,N,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ie){t.bindTexture(n.TEXTURE_CUBE_MAP,fe.__webglTexture),st(n.TEXTURE_CUBE_MAP,D);for(let Ue=0;Ue<6;Ue++)if(D.mipmaps&&D.mipmaps.length>0)for(let rt=0;rt<D.mipmaps.length;rt++)Oe(ne.__webglFramebuffer[Ue][rt],N,D,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Ue,rt);else Oe(ne.__webglFramebuffer[Ue],N,D,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Ue,0);E(D)&&b(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ke){for(let Ue=0,rt=de.length;Ue<rt;Ue++){const Ze=de[Ue],ve=r.get(Ze);let he=n.TEXTURE_2D;(N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(he=N.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(he,ve.__webglTexture),st(he,Ze),Oe(ne.__webglFramebuffer,N,Ze,n.COLOR_ATTACHMENT0+Ue,he,0),E(Ze)&&b(he)}t.unbindTexture()}else{let Ue=n.TEXTURE_2D;if((N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(Ue=N.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Ue,fe.__webglTexture),st(Ue,D),D.mipmaps&&D.mipmaps.length>0)for(let rt=0;rt<D.mipmaps.length;rt++)Oe(ne.__webglFramebuffer[rt],N,D,n.COLOR_ATTACHMENT0,Ue,rt);else Oe(ne.__webglFramebuffer,N,D,n.COLOR_ATTACHMENT0,Ue,0);E(D)&&b(Ue),t.unbindTexture()}N.depthBuffer&&ct(N)}function Tt(N){const D=N.textures;for(let ne=0,fe=D.length;ne<fe;ne++){const de=D[ne];if(E(de)){const ie=H(N),Ke=r.get(de).__webglTexture;t.bindTexture(ie,Ke),b(ie),t.unbindTexture()}}}const $=[],Ce=[];function ke(N){if(N.samples>0){if(Ie(N)===!1){const D=N.textures,ne=N.width,fe=N.height;let de=n.COLOR_BUFFER_BIT;const ie=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ke=r.get(N),Ue=D.length>1;if(Ue)for(let Ze=0;Ze<D.length;Ze++)t.bindFramebuffer(n.FRAMEBUFFER,Ke.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ze,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ke.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ze,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ke.__webglMultisampledFramebuffer);const rt=N.texture.mipmaps;rt&&rt.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ke.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ke.__webglFramebuffer);for(let Ze=0;Ze<D.length;Ze++){if(N.resolveDepthBuffer&&(N.depthBuffer&&(de|=n.DEPTH_BUFFER_BIT),N.stencilBuffer&&N.resolveStencilBuffer&&(de|=n.STENCIL_BUFFER_BIT)),Ue){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ke.__webglColorRenderbuffer[Ze]);const ve=r.get(D[Ze]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,ve,0)}n.blitFramebuffer(0,0,ne,fe,0,0,ne,fe,de,n.NEAREST),p===!0&&($.length=0,Ce.length=0,$.push(n.COLOR_ATTACHMENT0+Ze),N.depthBuffer&&N.resolveDepthBuffer===!1&&($.push(ie),Ce.push(ie),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Ce)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,$))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Ue)for(let Ze=0;Ze<D.length;Ze++){t.bindFramebuffer(n.FRAMEBUFFER,Ke.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ze,n.RENDERBUFFER,Ke.__webglColorRenderbuffer[Ze]);const ve=r.get(D[Ze]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ke.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ze,n.TEXTURE_2D,ve,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ke.__webglMultisampledFramebuffer)}else if(N.depthBuffer&&N.resolveDepthBuffer===!1&&p){const D=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[D])}}}function lt(N){return Math.min(a.maxSamples,N.samples)}function Ie(N){const D=r.get(N);return N.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&D.__useRenderToTexture!==!1}function yt(N){const D=u.render.frame;x.get(N)!==D&&(x.set(N,D),N.update())}function Ye(N,D){const ne=N.colorSpace,fe=N.format,de=N.type;return N.isCompressedTexture===!0||N.isVideoTexture===!0||ne!==Rr&&ne!==_i&&(Rt.getTransfer(ne)===Bt?(fe!==An||de!==Jn)&&pt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Jt("WebGLTextures: Unsupported texture color space:",ne)),D}function tt(N){return typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement?(m.width=N.naturalWidth||N.width,m.height=N.naturalHeight||N.height):typeof VideoFrame<"u"&&N instanceof VideoFrame?(m.width=N.displayWidth,m.height=N.displayHeight):(m.width=N.width,m.height=N.height),m}this.allocateTextureUnit=Y,this.resetTextureUnits=B,this.setTexture2D=j,this.setTexture2DArray=J,this.setTexture3D=ce,this.setTextureCube=te,this.rebindTextures=Pt,this.setupRenderTarget=ft,this.updateRenderTargetMipmap=Tt,this.updateMultisampleRenderTarget=ke,this.setupDepthRenderbuffer=ct,this.setupFrameBufferTexture=Oe,this.useMultisampledRTT=Ie}function ly(n,e){function t(r,a=_i){let l;const u=Rt.getTransfer(a);if(r===Jn)return n.UNSIGNED_BYTE;if(r===$f)return n.UNSIGNED_SHORT_4_4_4_4;if(r===qf)return n.UNSIGNED_SHORT_5_5_5_1;if(r===ah)return n.UNSIGNED_INT_5_9_9_9_REV;if(r===oh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(r===Wf)return n.BYTE;if(r===Xf)return n.SHORT;if(r===vo)return n.UNSIGNED_SHORT;if(r===$s)return n.INT;if(r===bi)return n.UNSIGNED_INT;if(r===Zn)return n.FLOAT;if(r===ei)return n.HALF_FLOAT;if(r===sh)return n.ALPHA;if(r===lh)return n.RGB;if(r===An)return n.RGBA;if(r===yo)return n.DEPTH_COMPONENT;if(r===So)return n.DEPTH_STENCIL;if(r===ch)return n.RED;if(r===Yf)return n.RED_INTEGER;if(r===jf)return n.RG;if(r===Kf)return n.RG_INTEGER;if(r===Zf)return n.RGBA_INTEGER;if(r===Ts||r===As||r===Cs||r===Rs)if(u===Bt)if(l=e.get("WEBGL_compressed_texture_s3tc_srgb"),l!==null){if(r===Ts)return l.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===As)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Cs)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Rs)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(l=e.get("WEBGL_compressed_texture_s3tc"),l!==null){if(r===Ts)return l.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===As)return l.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Cs)return l.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Rs)return l.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Jc||r===Qc||r===ef||r===tf)if(l=e.get("WEBGL_compressed_texture_pvrtc"),l!==null){if(r===Jc)return l.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Qc)return l.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===ef)return l.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===tf)return l.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===nf||r===rf||r===af)if(l=e.get("WEBGL_compressed_texture_etc"),l!==null){if(r===nf||r===rf)return u===Bt?l.COMPRESSED_SRGB8_ETC2:l.COMPRESSED_RGB8_ETC2;if(r===af)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:l.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===of||r===sf||r===lf||r===cf||r===ff||r===uf||r===df||r===hf||r===pf||r===mf||r===_f||r===gf||r===vf||r===xf)if(l=e.get("WEBGL_compressed_texture_astc"),l!==null){if(r===of)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:l.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===sf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:l.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===lf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:l.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===cf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:l.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===ff)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:l.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===uf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:l.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===df)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:l.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===hf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:l.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===pf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:l.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===mf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:l.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===_f)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:l.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===gf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:l.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===vf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:l.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===xf)return u===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:l.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===yf||r===Sf||r===bf)if(l=e.get("EXT_texture_compression_bptc"),l!==null){if(r===yf)return u===Bt?l.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:l.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Sf)return l.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===bf)return l.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Ef||r===Mf||r===wf||r===Tf)if(l=e.get("EXT_texture_compression_rgtc"),l!==null){if(r===Ef)return l.COMPRESSED_RED_RGTC1_EXT;if(r===Mf)return l.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===wf)return l.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Tf)return l.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===xo?n.UNSIGNED_INT_24_8:n[r]!==void 0?n[r]:null}return{convert:t}}const cy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fy=`
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

}`;class uy{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const r=new bh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,r=new Qn({vertexShader:cy,fragmentShader:fy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Pr(new za(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class dy extends Ba{constructor(e,t){super();const r=this;let a=null,l=1,u=null,o="local-floor",p=1,m=null,x=null,v=null,y=null,S=null,T=null;const F=typeof XRWebGLBinding<"u",E=new uy,b={},H=t.getContextAttributes();let V=null,X=null;const I=[],C=[],L=new Gt;let W=null;const P=new dr;P.viewport=new Qt;const w=new dr;w.viewport=new Qt;const z=[P,w],B=new D0;let Y=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(_e){let ge=I[_e];return ge===void 0&&(ge=new yc,I[_e]=ge),ge.getTargetRaySpace()},this.getControllerGrip=function(_e){let ge=I[_e];return ge===void 0&&(ge=new yc,I[_e]=ge),ge.getGripSpace()},this.getHand=function(_e){let ge=I[_e];return ge===void 0&&(ge=new yc,I[_e]=ge),ge.getHandSpace()};function j(_e){const ge=C.indexOf(_e.inputSource);if(ge===-1)return;const Oe=I[ge];Oe!==void 0&&(Oe.update(_e.inputSource,_e.frame,m||u),Oe.dispatchEvent({type:_e.type,data:_e.inputSource}))}function J(){a.removeEventListener("select",j),a.removeEventListener("selectstart",j),a.removeEventListener("selectend",j),a.removeEventListener("squeeze",j),a.removeEventListener("squeezestart",j),a.removeEventListener("squeezeend",j),a.removeEventListener("end",J),a.removeEventListener("inputsourceschange",ce);for(let _e=0;_e<I.length;_e++){const ge=C[_e];ge!==null&&(C[_e]=null,I[_e].disconnect(ge))}Y=null,K=null,E.reset();for(const _e in b)delete b[_e];e.setRenderTarget(V),S=null,y=null,v=null,a=null,X=null,gt.stop(),r.isPresenting=!1,e.setPixelRatio(W),e.setSize(L.width,L.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(_e){l=_e,r.isPresenting===!0&&pt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(_e){o=_e,r.isPresenting===!0&&pt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return m||u},this.setReferenceSpace=function(_e){m=_e},this.getBaseLayer=function(){return y!==null?y:S},this.getBinding=function(){return v===null&&F&&(v=new XRWebGLBinding(a,t)),v},this.getFrame=function(){return T},this.getSession=function(){return a},this.setSession=async function(_e){if(a=_e,a!==null){if(V=e.getRenderTarget(),a.addEventListener("select",j),a.addEventListener("selectstart",j),a.addEventListener("selectend",j),a.addEventListener("squeeze",j),a.addEventListener("squeezestart",j),a.addEventListener("squeezeend",j),a.addEventListener("end",J),a.addEventListener("inputsourceschange",ce),H.xrCompatible!==!0&&await t.makeXRCompatible(),W=e.getPixelRatio(),e.getSize(L),F&&"createProjectionLayer"in XRWebGLBinding.prototype){let Oe=null,et=null,qe=null;H.depth&&(qe=H.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Oe=H.stencil?So:yo,et=H.stencil?xo:bi);const ct={colorFormat:t.RGBA8,depthFormat:qe,scaleFactor:l};v=this.getBinding(),y=v.createProjectionLayer(ct),a.updateRenderState({layers:[y]}),e.setPixelRatio(1),e.setSize(y.textureWidth,y.textureHeight,!1),X=new qr(y.textureWidth,y.textureHeight,{format:An,type:Jn,depthTexture:new Sh(y.textureWidth,y.textureHeight,et,void 0,void 0,void 0,void 0,void 0,void 0,Oe),stencilBuffer:H.stencil,colorSpace:e.outputColorSpace,samples:H.antialias?4:0,resolveDepthBuffer:y.ignoreDepthValues===!1,resolveStencilBuffer:y.ignoreDepthValues===!1})}else{const Oe={antialias:H.antialias,alpha:!0,depth:H.depth,stencil:H.stencil,framebufferScaleFactor:l};S=new XRWebGLLayer(a,t,Oe),a.updateRenderState({baseLayer:S}),e.setPixelRatio(1),e.setSize(S.framebufferWidth,S.framebufferHeight,!1),X=new qr(S.framebufferWidth,S.framebufferHeight,{format:An,type:Jn,colorSpace:e.outputColorSpace,stencilBuffer:H.stencil,resolveDepthBuffer:S.ignoreDepthValues===!1,resolveStencilBuffer:S.ignoreDepthValues===!1})}X.isXRRenderTarget=!0,this.setFoveation(p),m=null,u=await a.requestReferenceSpace(o),gt.setContext(a),gt.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode},this.getDepthTexture=function(){return E.getDepthTexture()};function ce(_e){for(let ge=0;ge<_e.removed.length;ge++){const Oe=_e.removed[ge],et=C.indexOf(Oe);et>=0&&(C[et]=null,I[et].disconnect(Oe))}for(let ge=0;ge<_e.added.length;ge++){const Oe=_e.added[ge];let et=C.indexOf(Oe);if(et===-1){for(let ct=0;ct<I.length;ct++)if(ct>=C.length){C.push(Oe),et=ct;break}else if(C[ct]===null){C[ct]=Oe,et=ct;break}if(et===-1)break}const qe=I[et];qe&&qe.connect(Oe)}}const te=new le,Se=new le;function be(_e,ge,Oe){te.setFromMatrixPosition(ge.matrixWorld),Se.setFromMatrixPosition(Oe.matrixWorld);const et=te.distanceTo(Se),qe=ge.projectionMatrix.elements,ct=Oe.projectionMatrix.elements,Pt=qe[14]/(qe[10]-1),ft=qe[14]/(qe[10]+1),Tt=(qe[9]+1)/qe[5],$=(qe[9]-1)/qe[5],Ce=(qe[8]-1)/qe[0],ke=(ct[8]+1)/ct[0],lt=Pt*Ce,Ie=Pt*ke,yt=et/(-Ce+ke),Ye=yt*-Ce;if(ge.matrixWorld.decompose(_e.position,_e.quaternion,_e.scale),_e.translateX(Ye),_e.translateZ(yt),_e.matrixWorld.compose(_e.position,_e.quaternion,_e.scale),_e.matrixWorldInverse.copy(_e.matrixWorld).invert(),qe[10]===-1)_e.projectionMatrix.copy(ge.projectionMatrix),_e.projectionMatrixInverse.copy(ge.projectionMatrixInverse);else{const tt=Pt+yt,N=ft+yt,D=lt-Ye,ne=Ie+(et-Ye),fe=Tt*ft/N*tt,de=$*ft/N*tt;_e.projectionMatrix.makePerspective(D,ne,fe,de,tt,N),_e.projectionMatrixInverse.copy(_e.projectionMatrix).invert()}}function $e(_e,ge){ge===null?_e.matrixWorld.copy(_e.matrix):_e.matrixWorld.multiplyMatrices(ge.matrixWorld,_e.matrix),_e.matrixWorldInverse.copy(_e.matrixWorld).invert()}this.updateCamera=function(_e){if(a===null)return;let ge=_e.near,Oe=_e.far;E.texture!==null&&(E.depthNear>0&&(ge=E.depthNear),E.depthFar>0&&(Oe=E.depthFar)),B.near=w.near=P.near=ge,B.far=w.far=P.far=Oe,(Y!==B.near||K!==B.far)&&(a.updateRenderState({depthNear:B.near,depthFar:B.far}),Y=B.near,K=B.far),B.layers.mask=_e.layers.mask|6,P.layers.mask=B.layers.mask&3,w.layers.mask=B.layers.mask&5;const et=_e.parent,qe=B.cameras;$e(B,et);for(let ct=0;ct<qe.length;ct++)$e(qe[ct],et);qe.length===2?be(B,P,w):B.projectionMatrix.copy(P.projectionMatrix),st(_e,B,et)};function st(_e,ge,Oe){Oe===null?_e.matrix.copy(ge.matrixWorld):(_e.matrix.copy(Oe.matrixWorld),_e.matrix.invert(),_e.matrix.multiply(ge.matrixWorld)),_e.matrix.decompose(_e.position,_e.quaternion,_e.scale),_e.updateMatrixWorld(!0),_e.projectionMatrix.copy(ge.projectionMatrix),_e.projectionMatrixInverse.copy(ge.projectionMatrixInverse),_e.isPerspectiveCamera&&(_e.fov=Af*2*Math.atan(1/_e.projectionMatrix.elements[5]),_e.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(y===null&&S===null))return p},this.setFoveation=function(_e){p=_e,y!==null&&(y.fixedFoveation=_e),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=_e)},this.hasDepthSensing=function(){return E.texture!==null},this.getDepthSensingMesh=function(){return E.getMesh(B)},this.getCameraTexture=function(_e){return b[_e]};let ht=null;function xt(_e,ge){if(x=ge.getViewerPose(m||u),T=ge,x!==null){const Oe=x.views;S!==null&&(e.setRenderTargetFramebuffer(X,S.framebuffer),e.setRenderTarget(X));let et=!1;Oe.length!==B.cameras.length&&(B.cameras.length=0,et=!0);for(let ft=0;ft<Oe.length;ft++){const Tt=Oe[ft];let $=null;if(S!==null)$=S.getViewport(Tt);else{const ke=v.getViewSubImage(y,Tt);$=ke.viewport,ft===0&&(e.setRenderTargetTextures(X,ke.colorTexture,ke.depthStencilTexture),e.setRenderTarget(X))}let Ce=z[ft];Ce===void 0&&(Ce=new dr,Ce.layers.enable(ft),Ce.viewport=new Qt,z[ft]=Ce),Ce.matrix.fromArray(Tt.transform.matrix),Ce.matrix.decompose(Ce.position,Ce.quaternion,Ce.scale),Ce.projectionMatrix.fromArray(Tt.projectionMatrix),Ce.projectionMatrixInverse.copy(Ce.projectionMatrix).invert(),Ce.viewport.set($.x,$.y,$.width,$.height),ft===0&&(B.matrix.copy(Ce.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),et===!0&&B.cameras.push(Ce)}const qe=a.enabledFeatures;if(qe&&qe.includes("depth-sensing")&&a.depthUsage=="gpu-optimized"&&F){v=r.getBinding();const ft=v.getDepthInformation(Oe[0]);ft&&ft.isValid&&ft.texture&&E.init(ft,a.renderState)}if(qe&&qe.includes("camera-access")&&F){e.state.unbindTexture(),v=r.getBinding();for(let ft=0;ft<Oe.length;ft++){const Tt=Oe[ft].camera;if(Tt){let $=b[Tt];$||($=new bh,b[Tt]=$);const Ce=v.getCameraImage(Tt);$.sourceTexture=Ce}}}}for(let Oe=0;Oe<I.length;Oe++){const et=C[Oe],qe=I[Oe];et!==null&&qe!==void 0&&qe.update(et,ge,m||u)}ht&&ht(_e,ge),ge.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:ge}),T=null}const gt=new Mh;gt.setAnimationLoop(xt),this.setAnimationLoop=function(_e){ht=_e},this.dispose=function(){}}}const Ni=new Yr,hy=new on;function py(n,e){function t(E,b){E.matrixAutoUpdate===!0&&E.updateMatrix(),b.value.copy(E.matrix)}function r(E,b){b.color.getRGB(E.fogColor.value,gh(n)),b.isFog?(E.fogNear.value=b.near,E.fogFar.value=b.far):b.isFogExp2&&(E.fogDensity.value=b.density)}function a(E,b,H,V,X){b.isMeshBasicMaterial||b.isMeshLambertMaterial?l(E,b):b.isMeshToonMaterial?(l(E,b),v(E,b)):b.isMeshPhongMaterial?(l(E,b),x(E,b)):b.isMeshStandardMaterial?(l(E,b),y(E,b),b.isMeshPhysicalMaterial&&S(E,b,X)):b.isMeshMatcapMaterial?(l(E,b),T(E,b)):b.isMeshDepthMaterial?l(E,b):b.isMeshDistanceMaterial?(l(E,b),F(E,b)):b.isMeshNormalMaterial?l(E,b):b.isLineBasicMaterial?(u(E,b),b.isLineDashedMaterial&&o(E,b)):b.isPointsMaterial?p(E,b,H,V):b.isSpriteMaterial?m(E,b):b.isShadowMaterial?(E.color.value.copy(b.color),E.opacity.value=b.opacity):b.isShaderMaterial&&(b.uniformsNeedUpdate=!1)}function l(E,b){E.opacity.value=b.opacity,b.color&&E.diffuse.value.copy(b.color),b.emissive&&E.emissive.value.copy(b.emissive).multiplyScalar(b.emissiveIntensity),b.map&&(E.map.value=b.map,t(b.map,E.mapTransform)),b.alphaMap&&(E.alphaMap.value=b.alphaMap,t(b.alphaMap,E.alphaMapTransform)),b.bumpMap&&(E.bumpMap.value=b.bumpMap,t(b.bumpMap,E.bumpMapTransform),E.bumpScale.value=b.bumpScale,b.side===In&&(E.bumpScale.value*=-1)),b.normalMap&&(E.normalMap.value=b.normalMap,t(b.normalMap,E.normalMapTransform),E.normalScale.value.copy(b.normalScale),b.side===In&&E.normalScale.value.negate()),b.displacementMap&&(E.displacementMap.value=b.displacementMap,t(b.displacementMap,E.displacementMapTransform),E.displacementScale.value=b.displacementScale,E.displacementBias.value=b.displacementBias),b.emissiveMap&&(E.emissiveMap.value=b.emissiveMap,t(b.emissiveMap,E.emissiveMapTransform)),b.specularMap&&(E.specularMap.value=b.specularMap,t(b.specularMap,E.specularMapTransform)),b.alphaTest>0&&(E.alphaTest.value=b.alphaTest);const H=e.get(b),V=H.envMap,X=H.envMapRotation;V&&(E.envMap.value=V,Ni.copy(X),Ni.x*=-1,Ni.y*=-1,Ni.z*=-1,V.isCubeTexture&&V.isRenderTargetTexture===!1&&(Ni.y*=-1,Ni.z*=-1),E.envMapRotation.value.setFromMatrix4(hy.makeRotationFromEuler(Ni)),E.flipEnvMap.value=V.isCubeTexture&&V.isRenderTargetTexture===!1?-1:1,E.reflectivity.value=b.reflectivity,E.ior.value=b.ior,E.refractionRatio.value=b.refractionRatio),b.lightMap&&(E.lightMap.value=b.lightMap,E.lightMapIntensity.value=b.lightMapIntensity,t(b.lightMap,E.lightMapTransform)),b.aoMap&&(E.aoMap.value=b.aoMap,E.aoMapIntensity.value=b.aoMapIntensity,t(b.aoMap,E.aoMapTransform))}function u(E,b){E.diffuse.value.copy(b.color),E.opacity.value=b.opacity,b.map&&(E.map.value=b.map,t(b.map,E.mapTransform))}function o(E,b){E.dashSize.value=b.dashSize,E.totalSize.value=b.dashSize+b.gapSize,E.scale.value=b.scale}function p(E,b,H,V){E.diffuse.value.copy(b.color),E.opacity.value=b.opacity,E.size.value=b.size*H,E.scale.value=V*.5,b.map&&(E.map.value=b.map,t(b.map,E.uvTransform)),b.alphaMap&&(E.alphaMap.value=b.alphaMap,t(b.alphaMap,E.alphaMapTransform)),b.alphaTest>0&&(E.alphaTest.value=b.alphaTest)}function m(E,b){E.diffuse.value.copy(b.color),E.opacity.value=b.opacity,E.rotation.value=b.rotation,b.map&&(E.map.value=b.map,t(b.map,E.mapTransform)),b.alphaMap&&(E.alphaMap.value=b.alphaMap,t(b.alphaMap,E.alphaMapTransform)),b.alphaTest>0&&(E.alphaTest.value=b.alphaTest)}function x(E,b){E.specular.value.copy(b.specular),E.shininess.value=Math.max(b.shininess,1e-4)}function v(E,b){b.gradientMap&&(E.gradientMap.value=b.gradientMap)}function y(E,b){E.metalness.value=b.metalness,b.metalnessMap&&(E.metalnessMap.value=b.metalnessMap,t(b.metalnessMap,E.metalnessMapTransform)),E.roughness.value=b.roughness,b.roughnessMap&&(E.roughnessMap.value=b.roughnessMap,t(b.roughnessMap,E.roughnessMapTransform)),b.envMap&&(E.envMapIntensity.value=b.envMapIntensity)}function S(E,b,H){E.ior.value=b.ior,b.sheen>0&&(E.sheenColor.value.copy(b.sheenColor).multiplyScalar(b.sheen),E.sheenRoughness.value=b.sheenRoughness,b.sheenColorMap&&(E.sheenColorMap.value=b.sheenColorMap,t(b.sheenColorMap,E.sheenColorMapTransform)),b.sheenRoughnessMap&&(E.sheenRoughnessMap.value=b.sheenRoughnessMap,t(b.sheenRoughnessMap,E.sheenRoughnessMapTransform))),b.clearcoat>0&&(E.clearcoat.value=b.clearcoat,E.clearcoatRoughness.value=b.clearcoatRoughness,b.clearcoatMap&&(E.clearcoatMap.value=b.clearcoatMap,t(b.clearcoatMap,E.clearcoatMapTransform)),b.clearcoatRoughnessMap&&(E.clearcoatRoughnessMap.value=b.clearcoatRoughnessMap,t(b.clearcoatRoughnessMap,E.clearcoatRoughnessMapTransform)),b.clearcoatNormalMap&&(E.clearcoatNormalMap.value=b.clearcoatNormalMap,t(b.clearcoatNormalMap,E.clearcoatNormalMapTransform),E.clearcoatNormalScale.value.copy(b.clearcoatNormalScale),b.side===In&&E.clearcoatNormalScale.value.negate())),b.dispersion>0&&(E.dispersion.value=b.dispersion),b.iridescence>0&&(E.iridescence.value=b.iridescence,E.iridescenceIOR.value=b.iridescenceIOR,E.iridescenceThicknessMinimum.value=b.iridescenceThicknessRange[0],E.iridescenceThicknessMaximum.value=b.iridescenceThicknessRange[1],b.iridescenceMap&&(E.iridescenceMap.value=b.iridescenceMap,t(b.iridescenceMap,E.iridescenceMapTransform)),b.iridescenceThicknessMap&&(E.iridescenceThicknessMap.value=b.iridescenceThicknessMap,t(b.iridescenceThicknessMap,E.iridescenceThicknessMapTransform))),b.transmission>0&&(E.transmission.value=b.transmission,E.transmissionSamplerMap.value=H.texture,E.transmissionSamplerSize.value.set(H.width,H.height),b.transmissionMap&&(E.transmissionMap.value=b.transmissionMap,t(b.transmissionMap,E.transmissionMapTransform)),E.thickness.value=b.thickness,b.thicknessMap&&(E.thicknessMap.value=b.thicknessMap,t(b.thicknessMap,E.thicknessMapTransform)),E.attenuationDistance.value=b.attenuationDistance,E.attenuationColor.value.copy(b.attenuationColor)),b.anisotropy>0&&(E.anisotropyVector.value.set(b.anisotropy*Math.cos(b.anisotropyRotation),b.anisotropy*Math.sin(b.anisotropyRotation)),b.anisotropyMap&&(E.anisotropyMap.value=b.anisotropyMap,t(b.anisotropyMap,E.anisotropyMapTransform))),E.specularIntensity.value=b.specularIntensity,E.specularColor.value.copy(b.specularColor),b.specularColorMap&&(E.specularColorMap.value=b.specularColorMap,t(b.specularColorMap,E.specularColorMapTransform)),b.specularIntensityMap&&(E.specularIntensityMap.value=b.specularIntensityMap,t(b.specularIntensityMap,E.specularIntensityMapTransform))}function T(E,b){b.matcap&&(E.matcap.value=b.matcap)}function F(E,b){const H=e.get(b).light;E.referencePosition.value.setFromMatrixPosition(H.matrixWorld),E.nearDistance.value=H.shadow.camera.near,E.farDistance.value=H.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:a}}function my(n,e,t,r){let a={},l={},u=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function p(H,V){const X=V.program;r.uniformBlockBinding(H,X)}function m(H,V){let X=a[H.id];X===void 0&&(T(H),X=x(H),a[H.id]=X,H.addEventListener("dispose",E));const I=V.program;r.updateUBOMapping(H,I);const C=e.render.frame;l[H.id]!==C&&(y(H),l[H.id]=C)}function x(H){const V=v();H.__bindingPointIndex=V;const X=n.createBuffer(),I=H.__size,C=H.usage;return n.bindBuffer(n.UNIFORM_BUFFER,X),n.bufferData(n.UNIFORM_BUFFER,I,C),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,V,X),X}function v(){for(let H=0;H<o;H++)if(u.indexOf(H)===-1)return u.push(H),H;return Jt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function y(H){const V=a[H.id],X=H.uniforms,I=H.__cache;n.bindBuffer(n.UNIFORM_BUFFER,V);for(let C=0,L=X.length;C<L;C++){const W=Array.isArray(X[C])?X[C]:[X[C]];for(let P=0,w=W.length;P<w;P++){const z=W[P];if(S(z,C,P,I)===!0){const B=z.__offset,Y=Array.isArray(z.value)?z.value:[z.value];let K=0;for(let j=0;j<Y.length;j++){const J=Y[j],ce=F(J);typeof J=="number"||typeof J=="boolean"?(z.__data[0]=J,n.bufferSubData(n.UNIFORM_BUFFER,B+K,z.__data)):J.isMatrix3?(z.__data[0]=J.elements[0],z.__data[1]=J.elements[1],z.__data[2]=J.elements[2],z.__data[3]=0,z.__data[4]=J.elements[3],z.__data[5]=J.elements[4],z.__data[6]=J.elements[5],z.__data[7]=0,z.__data[8]=J.elements[6],z.__data[9]=J.elements[7],z.__data[10]=J.elements[8],z.__data[11]=0):(J.toArray(z.__data,K),K+=ce.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,B,z.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function S(H,V,X,I){const C=H.value,L=V+"_"+X;if(I[L]===void 0)return typeof C=="number"||typeof C=="boolean"?I[L]=C:I[L]=C.clone(),!0;{const W=I[L];if(typeof C=="number"||typeof C=="boolean"){if(W!==C)return I[L]=C,!0}else if(W.equals(C)===!1)return W.copy(C),!0}return!1}function T(H){const V=H.uniforms;let X=0;const I=16;for(let L=0,W=V.length;L<W;L++){const P=Array.isArray(V[L])?V[L]:[V[L]];for(let w=0,z=P.length;w<z;w++){const B=P[w],Y=Array.isArray(B.value)?B.value:[B.value];for(let K=0,j=Y.length;K<j;K++){const J=Y[K],ce=F(J),te=X%I,Se=te%ce.boundary,be=te+Se;X+=Se,be!==0&&I-be<ce.storage&&(X+=I-be),B.__data=new Float32Array(ce.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=X,X+=ce.storage}}}const C=X%I;return C>0&&(X+=I-C),H.__size=X,H.__cache={},this}function F(H){const V={boundary:0,storage:0};return typeof H=="number"||typeof H=="boolean"?(V.boundary=4,V.storage=4):H.isVector2?(V.boundary=8,V.storage=8):H.isVector3||H.isColor?(V.boundary=16,V.storage=12):H.isVector4?(V.boundary=16,V.storage=16):H.isMatrix3?(V.boundary=48,V.storage=48):H.isMatrix4?(V.boundary=64,V.storage=64):H.isTexture?pt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):pt("WebGLRenderer: Unsupported uniform value type.",H),V}function E(H){const V=H.target;V.removeEventListener("dispose",E);const X=u.indexOf(V.__bindingPointIndex);u.splice(X,1),n.deleteBuffer(a[V.id]),delete a[V.id],delete l[V.id]}function b(){for(const H in a)n.deleteBuffer(a[H]);u=[],a={},l={}}return{bind:p,update:m,dispose:b}}const _y=new Uint16Array([11481,15204,11534,15171,11808,15015,12385,14843,12894,14716,13396,14600,13693,14483,13976,14366,14237,14171,14405,13961,14511,13770,14605,13598,14687,13444,14760,13305,14822,13066,14876,12857,14923,12675,14963,12517,14997,12379,15025,12230,15049,12023,15070,11843,15086,11687,15100,11551,15111,11433,15120,11330,15127,11217,15132,11060,15135,10922,15138,10801,15139,10695,15139,10600,13012,14923,13020,14917,13064,14886,13176,14800,13349,14666,13513,14526,13724,14398,13960,14230,14200,14020,14383,13827,14488,13651,14583,13491,14667,13348,14740,13132,14803,12908,14856,12713,14901,12542,14938,12394,14968,12241,14992,12017,15010,11822,15024,11654,15034,11507,15041,11380,15044,11269,15044,11081,15042,10913,15037,10764,15031,10635,15023,10520,15014,10419,15003,10330,13657,14676,13658,14673,13670,14660,13698,14622,13750,14547,13834,14442,13956,14317,14112,14093,14291,13889,14407,13704,14499,13538,14586,13389,14664,13201,14733,12966,14792,12758,14842,12577,14882,12418,14915,12272,14940,12033,14959,11826,14972,11646,14980,11490,14983,11355,14983,11212,14979,11008,14971,10830,14961,10675,14950,10540,14936,10420,14923,10315,14909,10204,14894,10041,14089,14460,14090,14459,14096,14452,14112,14431,14141,14388,14186,14305,14252,14130,14341,13941,14399,13756,14467,13585,14539,13430,14610,13272,14677,13026,14737,12808,14790,12617,14833,12449,14869,12303,14896,12065,14916,11845,14929,11655,14937,11490,14939,11347,14936,11184,14930,10970,14921,10783,14912,10621,14900,10480,14885,10356,14867,10247,14848,10062,14827,9894,14805,9745,14400,14208,14400,14206,14402,14198,14406,14174,14415,14122,14427,14035,14444,13913,14469,13767,14504,13613,14548,13463,14598,13324,14651,13082,14704,12858,14752,12658,14795,12483,14831,12330,14860,12106,14881,11875,14895,11675,14903,11501,14905,11351,14903,11178,14900,10953,14892,10757,14880,10589,14865,10442,14847,10313,14827,10162,14805,9965,14782,9792,14757,9642,14731,9507,14562,13883,14562,13883,14563,13877,14566,13862,14570,13830,14576,13773,14584,13689,14595,13582,14613,13461,14637,13336,14668,13120,14704,12897,14741,12695,14776,12516,14808,12358,14835,12150,14856,11910,14870,11701,14878,11519,14882,11361,14884,11187,14880,10951,14871,10748,14858,10572,14842,10418,14823,10286,14801,10099,14777,9897,14751,9722,14725,9567,14696,9430,14666,9309,14702,13604,14702,13604,14702,13600,14703,13591,14705,13570,14707,13533,14709,13477,14712,13400,14718,13305,14727,13106,14743,12907,14762,12716,14784,12539,14807,12380,14827,12190,14844,11943,14855,11727,14863,11539,14870,11376,14871,11204,14868,10960,14858,10748,14845,10565,14829,10406,14809,10269,14786,10058,14761,9852,14734,9671,14705,9512,14674,9374,14641,9253,14608,9076,14821,13366,14821,13365,14821,13364,14821,13358,14821,13344,14821,13320,14819,13252,14817,13145,14815,13011,14814,12858,14817,12698,14823,12539,14832,12389,14841,12214,14850,11968,14856,11750,14861,11558,14866,11390,14867,11226,14862,10972,14853,10754,14840,10565,14823,10401,14803,10259,14780,10032,14754,9820,14725,9635,14694,9473,14661,9333,14627,9203,14593,8988,14557,8798,14923,13014,14922,13014,14922,13012,14922,13004,14920,12987,14919,12957,14915,12907,14909,12834,14902,12738,14894,12623,14888,12498,14883,12370,14880,12203,14878,11970,14875,11759,14873,11569,14874,11401,14872,11243,14865,10986,14855,10762,14842,10568,14825,10401,14804,10255,14781,10017,14754,9799,14725,9611,14692,9445,14658,9301,14623,9139,14587,8920,14548,8729,14509,8562,15008,12672,15008,12672,15008,12671,15007,12667,15005,12656,15001,12637,14997,12605,14989,12556,14978,12490,14966,12407,14953,12313,14940,12136,14927,11934,14914,11742,14903,11563,14896,11401,14889,11247,14879,10992,14866,10767,14851,10570,14833,10400,14812,10252,14789,10007,14761,9784,14731,9592,14698,9424,14663,9279,14627,9088,14588,8868,14548,8676,14508,8508,14467,8360,15080,12386,15080,12386,15079,12385,15078,12383,15076,12378,15072,12367,15066,12347,15057,12315,15045,12253,15030,12138,15012,11998,14993,11845,14972,11685,14951,11530,14935,11383,14920,11228,14904,10981,14887,10762,14870,10567,14850,10397,14827,10248,14803,9997,14774,9771,14743,9578,14710,9407,14674,9259,14637,9048,14596,8826,14555,8632,14514,8464,14471,8317,14427,8182,15139,12008,15139,12008,15138,12008,15137,12007,15135,12003,15130,11990,15124,11969,15115,11929,15102,11872,15086,11794,15064,11693,15041,11581,15013,11459,14987,11336,14966,11170,14944,10944,14921,10738,14898,10552,14875,10387,14850,10239,14824,9983,14794,9758,14762,9563,14728,9392,14692,9244,14653,9014,14611,8791,14569,8597,14526,8427,14481,8281,14436,8110,14391,7885,15188,11617,15188,11617,15187,11617,15186,11618,15183,11617,15179,11612,15173,11601,15163,11581,15150,11546,15133,11495,15110,11427,15083,11346,15051,11246,15024,11057,14996,10868,14967,10687,14938,10517,14911,10362,14882,10206,14853,9956,14821,9737,14787,9543,14752,9375,14715,9228,14675,8980,14632,8760,14589,8565,14544,8395,14498,8248,14451,8049,14404,7824,14357,7630,15228,11298,15228,11298,15227,11299,15226,11301,15223,11303,15219,11302,15213,11299,15204,11290,15191,11271,15174,11217,15150,11129,15119,11015,15087,10886,15057,10744,15024,10599,14990,10455,14957,10318,14924,10143,14891,9911,14856,9701,14820,9516,14782,9352,14744,9200,14703,8946,14659,8725,14615,8533,14568,8366,14521,8220,14472,7992,14423,7770,14374,7578,14315,7408,15260,10819,15260,10819,15259,10822,15258,10826,15256,10832,15251,10836,15246,10841,15237,10838,15225,10821,15207,10788,15183,10734,15151,10660,15120,10571,15087,10469,15049,10359,15012,10249,14974,10041,14937,9837,14900,9647,14860,9475,14820,9320,14779,9147,14736,8902,14691,8688,14646,8499,14598,8335,14549,8189,14499,7940,14448,7720,14397,7529,14347,7363,14256,7218,15285,10410,15285,10411,15285,10413,15284,10418,15282,10425,15278,10434,15272,10442,15264,10449,15252,10445,15235,10433,15210,10403,15179,10358,15149,10301,15113,10218,15073,10059,15033,9894,14991,9726,14951,9565,14909,9413,14865,9273,14822,9073,14777,8845,14730,8641,14682,8459,14633,8300,14583,8129,14531,7883,14479,7670,14426,7482,14373,7321,14305,7176,14201,6939,15305,9939,15305,9940,15305,9945,15304,9955,15302,9967,15298,9989,15293,10010,15286,10033,15274,10044,15258,10045,15233,10022,15205,9975,15174,9903,15136,9808,15095,9697,15053,9578,15009,9451,14965,9327,14918,9198,14871,8973,14825,8766,14775,8579,14725,8408,14675,8259,14622,8058,14569,7821,14515,7615,14460,7435,14405,7276,14350,7108,14256,6866,14149,6653,15321,9444,15321,9445,15321,9448,15320,9458,15317,9470,15314,9490,15310,9515,15302,9540,15292,9562,15276,9579,15251,9577,15226,9559,15195,9519,15156,9463,15116,9389,15071,9304,15025,9208,14978,9023,14927,8838,14878,8661,14827,8496,14774,8344,14722,8206,14667,7973,14612,7749,14556,7555,14499,7382,14443,7229,14385,7025,14322,6791,14210,6588,14100,6409,15333,8920,15333,8921,15332,8927,15332,8943,15329,8965,15326,9002,15322,9048,15316,9106,15307,9162,15291,9204,15267,9221,15244,9221,15212,9196,15175,9134,15133,9043,15088,8930,15040,8801,14990,8665,14938,8526,14886,8391,14830,8261,14775,8087,14719,7866,14661,7664,14603,7482,14544,7322,14485,7178,14426,6936,14367,6713,14281,6517,14166,6348,14054,6198,15341,8360,15341,8361,15341,8366,15341,8379,15339,8399,15336,8431,15332,8473,15326,8527,15318,8585,15302,8632,15281,8670,15258,8690,15227,8690,15191,8664,15149,8612,15104,8543,15055,8456,15001,8360,14948,8259,14892,8122,14834,7923,14776,7734,14716,7558,14656,7397,14595,7250,14534,7070,14472,6835,14410,6628,14350,6443,14243,6283,14125,6135,14010,5889,15348,7715,15348,7717,15348,7725,15347,7745,15345,7780,15343,7836,15339,7905,15334,8e3,15326,8103,15310,8193,15293,8239,15270,8270,15240,8287,15204,8283,15163,8260,15118,8223,15067,8143,15014,8014,14958,7873,14899,7723,14839,7573,14778,7430,14715,7293,14652,7164,14588,6931,14524,6720,14460,6531,14396,6362,14330,6210,14207,6015,14086,5781,13969,5576,15352,7114,15352,7116,15352,7128,15352,7159,15350,7195,15348,7237,15345,7299,15340,7374,15332,7457,15317,7544,15301,7633,15280,7703,15251,7754,15216,7775,15176,7767,15131,7733,15079,7670,15026,7588,14967,7492,14906,7387,14844,7278,14779,7171,14714,6965,14648,6770,14581,6587,14515,6420,14448,6269,14382,6123,14299,5881,14172,5665,14049,5477,13929,5310,15355,6329,15355,6330,15355,6339,15355,6362,15353,6410,15351,6472,15349,6572,15344,6688,15337,6835,15323,6985,15309,7142,15287,7220,15260,7277,15226,7310,15188,7326,15142,7318,15090,7285,15036,7239,14976,7177,14914,7045,14849,6892,14782,6736,14714,6581,14645,6433,14576,6293,14506,6164,14438,5946,14369,5733,14270,5540,14140,5369,14014,5216,13892,5043,15357,5483,15357,5484,15357,5496,15357,5528,15356,5597,15354,5692,15351,5835,15347,6011,15339,6195,15328,6317,15314,6446,15293,6566,15268,6668,15235,6746,15197,6796,15152,6811,15101,6790,15046,6748,14985,6673,14921,6583,14854,6479,14785,6371,14714,6259,14643,6149,14571,5946,14499,5750,14428,5567,14358,5401,14242,5250,14109,5111,13980,4870,13856,4657,15359,4555,15359,4557,15358,4573,15358,4633,15357,4715,15355,4841,15353,5061,15349,5216,15342,5391,15331,5577,15318,5770,15299,5967,15274,6150,15243,6223,15206,6280,15161,6310,15111,6317,15055,6300,14994,6262,14928,6208,14860,6141,14788,5994,14715,5838,14641,5684,14566,5529,14492,5384,14418,5247,14346,5121,14216,4892,14079,4682,13948,4496,13822,4330,15359,3498,15359,3501,15359,3520,15359,3598,15358,3719,15356,3860,15355,4137,15351,4305,15344,4563,15334,4809,15321,5116,15303,5273,15280,5418,15250,5547,15214,5653,15170,5722,15120,5761,15064,5763,15002,5733,14935,5673,14865,5597,14792,5504,14716,5400,14640,5294,14563,5185,14486,5041,14410,4841,14335,4655,14191,4482,14051,4325,13918,4183,13790,4012,15360,2282,15360,2285,15360,2306,15360,2401,15359,2547,15357,2748,15355,3103,15352,3349,15345,3675,15336,4020,15324,4272,15307,4496,15285,4716,15255,4908,15220,5086,15178,5170,15128,5214,15072,5234,15010,5231,14943,5206,14871,5166,14796,5102,14718,4971,14639,4833,14559,4687,14480,4541,14402,4401,14315,4268,14167,4142,14025,3958,13888,3747,13759,3556,15360,923,15360,925,15360,946,15360,1052,15359,1214,15357,1494,15356,1892,15352,2274,15346,2663,15338,3099,15326,3393,15309,3679,15288,3980,15260,4183,15226,4325,15185,4437,15136,4517,15080,4570,15018,4591,14950,4581,14877,4545,14800,4485,14720,4411,14638,4325,14556,4231,14475,4136,14395,3988,14297,3803,14145,3628,13999,3465,13861,3314,13729,3177,15360,263,15360,264,15360,272,15360,325,15359,407,15358,548,15356,780,15352,1144,15347,1580,15339,2099,15328,2425,15312,2795,15292,3133,15264,3329,15232,3517,15191,3689,15143,3819,15088,3923,15025,3978,14956,3999,14882,3979,14804,3931,14722,3855,14639,3756,14554,3645,14470,3529,14388,3409,14279,3289,14124,3173,13975,3055,13834,2848,13701,2658,15360,49,15360,49,15360,52,15360,75,15359,111,15358,201,15356,283,15353,519,15348,726,15340,1045,15329,1415,15314,1795,15295,2173,15269,2410,15237,2649,15197,2866,15150,3054,15095,3140,15032,3196,14963,3228,14888,3236,14808,3224,14725,3191,14639,3146,14553,3088,14466,2976,14382,2836,14262,2692,14103,2549,13952,2409,13808,2278,13674,2154,15360,4,15360,4,15360,4,15360,13,15359,33,15358,59,15357,112,15353,199,15348,302,15341,456,15331,628,15316,827,15297,1082,15272,1332,15241,1601,15202,1851,15156,2069,15101,2172,15039,2256,14970,2314,14894,2348,14813,2358,14728,2344,14640,2311,14551,2263,14463,2203,14376,2133,14247,2059,14084,1915,13930,1761,13784,1609,13648,1464,15360,0,15360,0,15360,0,15360,3,15359,18,15358,26,15357,53,15354,80,15348,97,15341,165,15332,238,15318,326,15299,427,15275,529,15245,654,15207,771,15161,885,15108,994,15046,1089,14976,1170,14900,1229,14817,1266,14731,1284,14641,1282,14550,1260,14460,1223,14370,1174,14232,1116,14066,1050,13909,981,13761,910,13623,839]);let kr=null;function gy(){return kr===null&&(kr=new Eo(_y,32,32,jf,ei),kr.minFilter=un,kr.magFilter=un,kr.wrapS=Hn,kr.wrapT=Hn,kr.generateMipmaps=!1,kr.needsUpdate=!0),kr}class vy{constructor(e={}){const{canvas:t=Ym(),context:r=null,depth:a=!0,stencil:l=!1,alpha:u=!1,antialias:o=!1,premultipliedAlpha:p=!0,preserveDrawingBuffer:m=!1,powerPreference:x="default",failIfMajorPerformanceCaveat:v=!1,reversedDepthBuffer:y=!1}=e;this.isWebGLRenderer=!0;let S;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");S=r.getContextAttributes().alpha}else S=u;const T=new Set([Zf,Kf,Yf]),F=new Set([Jn,bi,vo,xo,$f,qf]),E=new Uint32Array(4),b=new Int32Array(4);let H=null,V=null;const X=[],I=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Xr,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const C=this;let L=!1;this._outputColorSpace=zn;let W=0,P=0,w=null,z=-1,B=null;const Y=new Qt,K=new Qt;let j=null;const J=new zt(0);let ce=0,te=t.width,Se=t.height,be=1,$e=null,st=null;const ht=new Qt(0,0,te,Se),xt=new Qt(0,0,te,Se);let gt=!1;const _e=new yh;let ge=!1,Oe=!1;const et=new on,qe=new le,ct=new Qt,Pt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ft=!1;function Tt(){return w===null?be:1}let $=r;function Ce(U,Q){return t.getContext(U,Q)}try{const U={alpha:!0,depth:a,stencil:l,antialias:o,premultipliedAlpha:p,preserveDrawingBuffer:m,powerPreference:x,failIfMajorPerformanceCaveat:v};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Vf}`),t.addEventListener("webglcontextlost",Ee,!1),t.addEventListener("webglcontextrestored",pe,!1),t.addEventListener("webglcontextcreationerror",Ge,!1),$===null){const Q="webgl2";if($=Ce(Q,U),$===null)throw Ce(Q)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(U){throw U("WebGLRenderer: "+U.message),U}let ke,lt,Ie,yt,Ye,tt,N,D,ne,fe,de,ie,Ke,Ue,rt,Ze,ve,he,we,je,Be,Qe,q,Fe;function Te(){ke=new Tv($),ke.init(),Qe=new ly($,ke),lt=new gv($,ke,e,Qe),Ie=new oy($,ke),lt.reversedDepthBuffer&&y&&Ie.buffers.depth.setReversed(!0),yt=new Rv($),Ye=new qx,tt=new sy($,ke,Ie,Ye,lt,Qe,yt),N=new xv(C),D=new wv(C),ne=new F0($),q=new mv($,ne),fe=new Av($,ne,yt,q),de=new Dv($,fe,ne,yt),we=new Pv($,lt,tt),Ze=new vv(Ye),ie=new $x(C,N,D,ke,lt,q,Ze),Ke=new py(C,Ye),Ue=new jx,rt=new ty(ke),he=new pv(C,N,D,Ie,de,S,p),ve=new iy(C,de,lt),Fe=new my($,yt,lt,Ie),je=new _v($,ke,yt),Be=new Cv($,ke,yt),yt.programs=ie.programs,C.capabilities=lt,C.extensions=ke,C.properties=Ye,C.renderLists=Ue,C.shadowMap=ve,C.state=Ie,C.info=yt}Te();const Ae=new dy(C,$);this.xr=Ae,this.getContext=function(){return $},this.getContextAttributes=function(){return $.getContextAttributes()},this.forceContextLoss=function(){const U=ke.get("WEBGL_lose_context");U&&U.loseContext()},this.forceContextRestore=function(){const U=ke.get("WEBGL_lose_context");U&&U.restoreContext()},this.getPixelRatio=function(){return be},this.setPixelRatio=function(U){U!==void 0&&(be=U,this.setSize(te,Se,!1))},this.getSize=function(U){return U.set(te,Se)},this.setSize=function(U,Q,ae=!0){if(Ae.isPresenting){pt("WebGLRenderer: Can't change size while VR device is presenting.");return}te=U,Se=Q,t.width=Math.floor(U*be),t.height=Math.floor(Q*be),ae===!0&&(t.style.width=U+"px",t.style.height=Q+"px"),this.setViewport(0,0,U,Q)},this.getDrawingBufferSize=function(U){return U.set(te*be,Se*be).floor()},this.setDrawingBufferSize=function(U,Q,ae){te=U,Se=Q,be=ae,t.width=Math.floor(U*ae),t.height=Math.floor(Q*ae),this.setViewport(0,0,U,Q)},this.getCurrentViewport=function(U){return U.copy(Y)},this.getViewport=function(U){return U.copy(ht)},this.setViewport=function(U,Q,ae,oe){U.isVector4?ht.set(U.x,U.y,U.z,U.w):ht.set(U,Q,ae,oe),Ie.viewport(Y.copy(ht).multiplyScalar(be).round())},this.getScissor=function(U){return U.copy(xt)},this.setScissor=function(U,Q,ae,oe){U.isVector4?xt.set(U.x,U.y,U.z,U.w):xt.set(U,Q,ae,oe),Ie.scissor(K.copy(xt).multiplyScalar(be).round())},this.getScissorTest=function(){return gt},this.setScissorTest=function(U){Ie.setScissorTest(gt=U)},this.setOpaqueSort=function(U){$e=U},this.setTransparentSort=function(U){st=U},this.getClearColor=function(U){return U.copy(he.getClearColor())},this.setClearColor=function(){he.setClearColor(...arguments)},this.getClearAlpha=function(){return he.getClearAlpha()},this.setClearAlpha=function(){he.setClearAlpha(...arguments)},this.clear=function(U=!0,Q=!0,ae=!0){let oe=0;if(U){let ee=!1;if(w!==null){const ye=w.texture.format;ee=T.has(ye)}if(ee){const ye=w.texture.type,Ne=F.has(ye),Me=he.getClearColor(),We=he.getClearAlpha(),Je=Me.r,nt=Me.g,it=Me.b;Ne?(E[0]=Je,E[1]=nt,E[2]=it,E[3]=We,$.clearBufferuiv($.COLOR,0,E)):(b[0]=Je,b[1]=nt,b[2]=it,b[3]=We,$.clearBufferiv($.COLOR,0,b))}else oe|=$.COLOR_BUFFER_BIT}Q&&(oe|=$.DEPTH_BUFFER_BIT),ae&&(oe|=$.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),$.clear(oe)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Ee,!1),t.removeEventListener("webglcontextrestored",pe,!1),t.removeEventListener("webglcontextcreationerror",Ge,!1),he.dispose(),Ue.dispose(),rt.dispose(),Ye.dispose(),N.dispose(),D.dispose(),de.dispose(),q.dispose(),Fe.dispose(),ie.dispose(),Ae.dispose(),Ae.removeEventListener("sessionstart",$n),Ae.removeEventListener("sessionend",er),A.stop()};function Ee(U){U.preventDefault(),Mu("WebGLRenderer: Context Lost."),L=!0}function pe(){Mu("WebGLRenderer: Context Restored."),L=!1;const U=yt.autoReset,Q=ve.enabled,ae=ve.autoUpdate,oe=ve.needsUpdate,ee=ve.type;Te(),yt.autoReset=U,ve.enabled=Q,ve.autoUpdate=ae,ve.needsUpdate=oe,ve.type=ee}function Ge(U){Jt("WebGLRenderer: A WebGL context could not be created. Reason: ",U.statusMessage)}function Re(U){const Q=U.target;Q.removeEventListener("dispose",Re),It(Q)}function It(U){Et(U),Ye.remove(U)}function Et(U){const Q=Ye.get(U).programs;Q!==void 0&&(Q.forEach(function(ae){ie.releaseProgram(ae)}),U.isShaderMaterial&&ie.releaseShaderCache(U))}this.renderBufferDirect=function(U,Q,ae,oe,ee,ye){Q===null&&(Q=Pt);const Ne=ee.isMesh&&ee.matrixWorld.determinant()<0,Me=Zt(U,Q,ae,oe,ee);Ie.setMaterial(oe,Ne);let We=ae.index,Je=1;if(oe.wireframe===!0){if(We=fe.getWireframeAttribute(ae),We===void 0)return;Je=2}const nt=ae.drawRange,it=ae.attributes.position;let mt=nt.start*Je,Mt=(nt.start+nt.count)*Je;ye!==null&&(mt=Math.max(mt,ye.start*Je),Mt=Math.min(Mt,(ye.start+ye.count)*Je)),We!==null?(mt=Math.max(mt,0),Mt=Math.min(Mt,We.count)):it!=null&&(mt=Math.max(mt,0),Mt=Math.min(Mt,it.count));const Ot=Mt-mt;if(Ot<0||Ot===1/0)return;q.setup(ee,oe,Me,ae,We);let Ht,Dt=je;if(We!==null&&(Ht=ne.get(We),Dt=Be,Dt.setIndex(Ht)),ee.isMesh)oe.wireframe===!0?(Ie.setLineWidth(oe.wireframeLinewidth*Tt()),Dt.setMode($.LINES)):Dt.setMode($.TRIANGLES);else if(ee.isLine){let at=oe.linewidth;at===void 0&&(at=1),Ie.setLineWidth(at*Tt()),ee.isLineSegments?Dt.setMode($.LINES):ee.isLineLoop?Dt.setMode($.LINE_LOOP):Dt.setMode($.LINE_STRIP)}else ee.isPoints?Dt.setMode($.POINTS):ee.isSprite&&Dt.setMode($.TRIANGLES);if(ee.isBatchedMesh)if(ee._multiDrawInstances!==null)bo("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Dt.renderMultiDrawInstances(ee._multiDrawStarts,ee._multiDrawCounts,ee._multiDrawCount,ee._multiDrawInstances);else if(ke.get("WEBGL_multi_draw"))Dt.renderMultiDraw(ee._multiDrawStarts,ee._multiDrawCounts,ee._multiDrawCount);else{const at=ee._multiDrawStarts,kt=ee._multiDrawCounts,St=ee._multiDrawCount,hn=We?ne.get(We).bytesPerElement:1,Nn=Ye.get(oe).currentProgram.getUniforms();for(let Wt=0;Wt<St;Wt++)Nn.setValue($,"_gl_DrawID",Wt),Dt.render(at[Wt]/hn,kt[Wt])}else if(ee.isInstancedMesh)Dt.renderInstances(mt,Ot,ee.count);else if(ae.isInstancedBufferGeometry){const at=ae._maxInstanceCount!==void 0?ae._maxInstanceCount:1/0,kt=Math.min(ae.instanceCount,at);Dt.renderInstances(mt,Ot,kt)}else Dt.render(mt,Ot)};function bn(U,Q,ae){U.transparent===!0&&U.side===Gr&&U.forceSinglePass===!1?(U.side=In,U.needsUpdate=!0,Dr(U,Q,ae),U.side=Si,U.needsUpdate=!0,Dr(U,Q,ae),U.side=Gr):Dr(U,Q,ae)}this.compile=function(U,Q,ae=null){ae===null&&(ae=U),V=rt.get(ae),V.init(Q),I.push(V),ae.traverseVisible(function(ee){ee.isLight&&ee.layers.test(Q.layers)&&(V.pushLight(ee),ee.castShadow&&V.pushShadow(ee))}),U!==ae&&U.traverseVisible(function(ee){ee.isLight&&ee.layers.test(Q.layers)&&(V.pushLight(ee),ee.castShadow&&V.pushShadow(ee))}),V.setupLights();const oe=new Set;return U.traverse(function(ee){if(!(ee.isMesh||ee.isPoints||ee.isLine||ee.isSprite))return;const ye=ee.material;if(ye)if(Array.isArray(ye))for(let Ne=0;Ne<ye.length;Ne++){const Me=ye[Ne];bn(Me,ae,ee),oe.add(Me)}else bn(ye,ae,ee),oe.add(ye)}),V=I.pop(),oe},this.compileAsync=function(U,Q,ae=null){const oe=this.compile(U,Q,ae);return new Promise(ee=>{function ye(){if(oe.forEach(function(Ne){Ye.get(Ne).currentProgram.isReady()&&oe.delete(Ne)}),oe.size===0){ee(U);return}setTimeout(ye,10)}ke.get("KHR_parallel_shader_compile")!==null?ye():setTimeout(ye,10)})};let dn=null;function _r(U){dn&&dn(U)}function $n(){A.stop()}function er(){A.start()}const A=new Mh;A.setAnimationLoop(_r),typeof self<"u"&&A.setContext(self),this.setAnimationLoop=function(U){dn=U,Ae.setAnimationLoop(U),U===null?A.stop():A.start()},Ae.addEventListener("sessionstart",$n),Ae.addEventListener("sessionend",er),this.render=function(U,Q){if(Q!==void 0&&Q.isCamera!==!0){Jt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;if(U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Q.parent===null&&Q.matrixWorldAutoUpdate===!0&&Q.updateMatrixWorld(),Ae.enabled===!0&&Ae.isPresenting===!0&&(Ae.cameraAutoUpdate===!0&&Ae.updateCamera(Q),Q=Ae.getCamera()),U.isScene===!0&&U.onBeforeRender(C,U,Q,w),V=rt.get(U,I.length),V.init(Q),I.push(V),et.multiplyMatrices(Q.projectionMatrix,Q.matrixWorldInverse),_e.setFromProjectionMatrix(et,Tr,Q.reversedDepth),Oe=this.localClippingEnabled,ge=Ze.init(this.clippingPlanes,Oe),H=Ue.get(U,X.length),H.init(),X.push(H),Ae.enabled===!0&&Ae.isPresenting===!0){const ye=C.xr.getDepthSensingMesh();ye!==null&&$t(ye,Q,-1/0,C.sortObjects)}$t(U,Q,0,C.sortObjects),H.finish(),C.sortObjects===!0&&H.sort($e,st),ft=Ae.enabled===!1||Ae.isPresenting===!1||Ae.hasDepthSensing()===!1,ft&&he.addToRenderList(H,U),this.info.render.frame++,ge===!0&&Ze.beginShadows();const ae=V.state.shadowsArray;ve.render(ae,U,Q),ge===!0&&Ze.endShadows(),this.info.autoReset===!0&&this.info.reset();const oe=H.opaque,ee=H.transmissive;if(V.setupLights(),Q.isArrayCamera){const ye=Q.cameras;if(ee.length>0)for(let Ne=0,Me=ye.length;Ne<Me;Ne++){const We=ye[Ne];Ki(oe,ee,U,We)}ft&&he.render(U);for(let Ne=0,Me=ye.length;Ne<Me;Ne++){const We=ye[Ne];Mi(H,U,We,We.viewport)}}else ee.length>0&&Ki(oe,ee,U,Q),ft&&he.render(U),Mi(H,U,Q);w!==null&&P===0&&(tt.updateMultisampleRenderTarget(w),tt.updateRenderTargetMipmap(w)),U.isScene===!0&&U.onAfterRender(C,U,Q),q.resetDefaultState(),z=-1,B=null,I.pop(),I.length>0?(V=I[I.length-1],ge===!0&&Ze.setGlobalState(C.clippingPlanes,V.state.camera)):V=null,X.pop(),X.length>0?H=X[X.length-1]:H=null};function $t(U,Q,ae,oe){if(U.visible===!1)return;if(U.layers.test(Q.layers)){if(U.isGroup)ae=U.renderOrder;else if(U.isLOD)U.autoUpdate===!0&&U.update(Q);else if(U.isLight)V.pushLight(U),U.castShadow&&V.pushShadow(U);else if(U.isSprite){if(!U.frustumCulled||_e.intersectsSprite(U)){oe&&ct.setFromMatrixPosition(U.matrixWorld).applyMatrix4(et);const Ne=de.update(U),Me=U.material;Me.visible&&H.push(U,Ne,Me,ae,ct.z,null)}}else if((U.isMesh||U.isLine||U.isPoints)&&(!U.frustumCulled||_e.intersectsObject(U))){const Ne=de.update(U),Me=U.material;if(oe&&(U.boundingSphere!==void 0?(U.boundingSphere===null&&U.computeBoundingSphere(),ct.copy(U.boundingSphere.center)):(Ne.boundingSphere===null&&Ne.computeBoundingSphere(),ct.copy(Ne.boundingSphere.center)),ct.applyMatrix4(U.matrixWorld).applyMatrix4(et)),Array.isArray(Me)){const We=Ne.groups;for(let Je=0,nt=We.length;Je<nt;Je++){const it=We[Je],mt=Me[it.materialIndex];mt&&mt.visible&&H.push(U,Ne,mt,ae,ct.z,it)}}else Me.visible&&H.push(U,Ne,Me,ae,ct.z,null)}}const ye=U.children;for(let Ne=0,Me=ye.length;Ne<Me;Ne++)$t(ye[Ne],Q,ae,oe)}function Mi(U,Q,ae,oe){const{opaque:ee,transmissive:ye,transparent:Ne}=U;V.setupLightsView(ae),ge===!0&&Ze.setGlobalState(C.clippingPlanes,ae),oe&&Ie.viewport(Y.copy(oe)),ee.length>0&&ti(ee,Q,ae),ye.length>0&&ti(ye,Q,ae),Ne.length>0&&ti(Ne,Q,ae),Ie.buffers.depth.setTest(!0),Ie.buffers.depth.setMask(!0),Ie.buffers.color.setMask(!0),Ie.setPolygonOffset(!1)}function Ki(U,Q,ae,oe){if((ae.isScene===!0?ae.overrideMaterial:null)!==null)return;V.state.transmissionRenderTarget[oe.id]===void 0&&(V.state.transmissionRenderTarget[oe.id]=new qr(1,1,{generateMipmaps:!0,type:ke.has("EXT_color_buffer_half_float")||ke.has("EXT_color_buffer_float")?ei:Jn,minFilter:Gi,samples:4,stencilBuffer:l,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Rt.workingColorSpace}));const ye=V.state.transmissionRenderTarget[oe.id],Ne=oe.viewport||Y;ye.setSize(Ne.z*C.transmissionResolutionScale,Ne.w*C.transmissionResolutionScale);const Me=C.getRenderTarget(),We=C.getActiveCubeFace(),Je=C.getActiveMipmapLevel();C.setRenderTarget(ye),C.getClearColor(J),ce=C.getClearAlpha(),ce<1&&C.setClearColor(16777215,.5),C.clear(),ft&&he.render(ae);const nt=C.toneMapping;C.toneMapping=Xr;const it=oe.viewport;if(oe.viewport!==void 0&&(oe.viewport=void 0),V.setupLightsView(oe),ge===!0&&Ze.setGlobalState(C.clippingPlanes,oe),ti(U,ae,oe),tt.updateMultisampleRenderTarget(ye),tt.updateRenderTargetMipmap(ye),ke.has("WEBGL_multisampled_render_to_texture")===!1){let mt=!1;for(let Mt=0,Ot=Q.length;Mt<Ot;Mt++){const Ht=Q[Mt],{object:Dt,geometry:at,material:kt,group:St}=Ht;if(kt.side===Gr&&Dt.layers.test(oe.layers)){const hn=kt.side;kt.side=In,kt.needsUpdate=!0,Zi(Dt,ae,oe,at,kt,St),kt.side=hn,kt.needsUpdate=!0,mt=!0}}mt===!0&&(tt.updateMultisampleRenderTarget(ye),tt.updateRenderTargetMipmap(ye))}C.setRenderTarget(Me,We,Je),C.setClearColor(J,ce),it!==void 0&&(oe.viewport=it),C.toneMapping=nt}function ti(U,Q,ae){const oe=Q.isScene===!0?Q.overrideMaterial:null;for(let ee=0,ye=U.length;ee<ye;ee++){const Ne=U[ee],{object:Me,geometry:We,group:Je}=Ne;let nt=Ne.material;nt.allowOverride===!0&&oe!==null&&(nt=oe),Me.layers.test(ae.layers)&&Zi(Me,Q,ae,We,nt,Je)}}function Zi(U,Q,ae,oe,ee,ye){U.onBeforeRender(C,Q,ae,oe,ee,ye),U.modelViewMatrix.multiplyMatrices(ae.matrixWorldInverse,U.matrixWorld),U.normalMatrix.getNormalMatrix(U.modelViewMatrix),ee.onBeforeRender(C,Q,ae,oe,U,ye),ee.transparent===!0&&ee.side===Gr&&ee.forceSinglePass===!1?(ee.side=In,ee.needsUpdate=!0,C.renderBufferDirect(ae,Q,oe,ee,U,ye),ee.side=Si,ee.needsUpdate=!0,C.renderBufferDirect(ae,Q,oe,ee,U,ye),ee.side=Gr):C.renderBufferDirect(ae,Q,oe,ee,U,ye),U.onAfterRender(C,Q,ae,oe,ee,ye)}function Dr(U,Q,ae){Q.isScene!==!0&&(Q=Pt);const oe=Ye.get(U),ee=V.state.lights,ye=V.state.shadowsArray,Ne=ee.state.version,Me=ie.getParameters(U,ee.state,ye,Q,ae),We=ie.getProgramCacheKey(Me);let Je=oe.programs;oe.environment=U.isMeshStandardMaterial?Q.environment:null,oe.fog=Q.fog,oe.envMap=(U.isMeshStandardMaterial?D:N).get(U.envMap||oe.environment),oe.envMapRotation=oe.environment!==null&&U.envMap===null?Q.environmentRotation:U.envMapRotation,Je===void 0&&(U.addEventListener("dispose",Re),Je=new Map,oe.programs=Je);let nt=Je.get(We);if(nt!==void 0){if(oe.currentProgram===nt&&oe.lightsStateVersion===Ne)return Lr(U,Me),nt}else Me.uniforms=ie.getUniforms(U),U.onBeforeCompile(Me,C),nt=ie.acquireProgram(Me,We),Je.set(We,nt),oe.uniforms=Me.uniforms;const it=oe.uniforms;return(!U.isShaderMaterial&&!U.isRawShaderMaterial||U.clipping===!0)&&(it.clippingPlanes=Ze.uniform),Lr(U,Me),oe.needsLights=nn(U),oe.lightsStateVersion=Ne,oe.needsLights&&(it.ambientLightColor.value=ee.state.ambient,it.lightProbe.value=ee.state.probe,it.directionalLights.value=ee.state.directional,it.directionalLightShadows.value=ee.state.directionalShadow,it.spotLights.value=ee.state.spot,it.spotLightShadows.value=ee.state.spotShadow,it.rectAreaLights.value=ee.state.rectArea,it.ltc_1.value=ee.state.rectAreaLTC1,it.ltc_2.value=ee.state.rectAreaLTC2,it.pointLights.value=ee.state.point,it.pointLightShadows.value=ee.state.pointShadow,it.hemisphereLights.value=ee.state.hemi,it.directionalShadowMap.value=ee.state.directionalShadowMap,it.directionalShadowMatrix.value=ee.state.directionalShadowMatrix,it.spotShadowMap.value=ee.state.spotShadowMap,it.spotLightMatrix.value=ee.state.spotLightMatrix,it.spotLightMap.value=ee.state.spotLightMap,it.pointShadowMap.value=ee.state.pointShadowMap,it.pointShadowMatrix.value=ee.state.pointShadowMatrix),oe.currentProgram=nt,oe.uniformsList=null,nt}function Yt(U){if(U.uniformsList===null){const Q=U.currentProgram.getUniforms();U.uniformsList=Ps.seqWithValue(Q.seq,U.uniforms)}return U.uniformsList}function Lr(U,Q){const ae=Ye.get(U);ae.outputColorSpace=Q.outputColorSpace,ae.batching=Q.batching,ae.batchingColor=Q.batchingColor,ae.instancing=Q.instancing,ae.instancingColor=Q.instancingColor,ae.instancingMorph=Q.instancingMorph,ae.skinning=Q.skinning,ae.morphTargets=Q.morphTargets,ae.morphNormals=Q.morphNormals,ae.morphColors=Q.morphColors,ae.morphTargetsCount=Q.morphTargetsCount,ae.numClippingPlanes=Q.numClippingPlanes,ae.numIntersection=Q.numClipIntersection,ae.vertexAlphas=Q.vertexAlphas,ae.vertexTangents=Q.vertexTangents,ae.toneMapping=Q.toneMapping}function Zt(U,Q,ae,oe,ee){Q.isScene!==!0&&(Q=Pt),tt.resetTextureUnits();const ye=Q.fog,Ne=oe.isMeshStandardMaterial?Q.environment:null,Me=w===null?C.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:Rr,We=(oe.isMeshStandardMaterial?D:N).get(oe.envMap||Ne),Je=oe.vertexColors===!0&&!!ae.attributes.color&&ae.attributes.color.itemSize===4,nt=!!ae.attributes.tangent&&(!!oe.normalMap||oe.anisotropy>0),it=!!ae.morphAttributes.position,mt=!!ae.morphAttributes.normal,Mt=!!ae.morphAttributes.color;let Ot=Xr;oe.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(Ot=C.toneMapping);const Ht=ae.morphAttributes.position||ae.morphAttributes.normal||ae.morphAttributes.color,Dt=Ht!==void 0?Ht.length:0,at=Ye.get(oe),kt=V.state.lights;if(ge===!0&&(Oe===!0||U!==B)){const qt=U===B&&oe.id===z;Ze.setState(oe,U,qt)}let St=!1;oe.version===at.__version?(at.needsLights&&at.lightsStateVersion!==kt.state.version||at.outputColorSpace!==Me||ee.isBatchedMesh&&at.batching===!1||!ee.isBatchedMesh&&at.batching===!0||ee.isBatchedMesh&&at.batchingColor===!0&&ee.colorTexture===null||ee.isBatchedMesh&&at.batchingColor===!1&&ee.colorTexture!==null||ee.isInstancedMesh&&at.instancing===!1||!ee.isInstancedMesh&&at.instancing===!0||ee.isSkinnedMesh&&at.skinning===!1||!ee.isSkinnedMesh&&at.skinning===!0||ee.isInstancedMesh&&at.instancingColor===!0&&ee.instanceColor===null||ee.isInstancedMesh&&at.instancingColor===!1&&ee.instanceColor!==null||ee.isInstancedMesh&&at.instancingMorph===!0&&ee.morphTexture===null||ee.isInstancedMesh&&at.instancingMorph===!1&&ee.morphTexture!==null||at.envMap!==We||oe.fog===!0&&at.fog!==ye||at.numClippingPlanes!==void 0&&(at.numClippingPlanes!==Ze.numPlanes||at.numIntersection!==Ze.numIntersection)||at.vertexAlphas!==Je||at.vertexTangents!==nt||at.morphTargets!==it||at.morphNormals!==mt||at.morphColors!==Mt||at.toneMapping!==Ot||at.morphTargetsCount!==Dt)&&(St=!0):(St=!0,at.__version=oe.version);let hn=at.currentProgram;St===!0&&(hn=Dr(oe,Q,ee));let Nn=!1,Wt=!1,rn=!1;const Lt=hn.getUniforms(),cn=at.uniforms;if(Ie.useProgram(hn.program)&&(Nn=!0,Wt=!0,rn=!0),oe.id!==z&&(z=oe.id,Wt=!0),Nn||B!==U){Ie.buffers.depth.getReversed()&&U.reversedDepth!==!0&&(U._reversedDepth=!0,U.updateProjectionMatrix()),Lt.setValue($,"projectionMatrix",U.projectionMatrix),Lt.setValue($,"viewMatrix",U.matrixWorldInverse);const an=Lt.map.cameraPosition;an!==void 0&&an.setValue($,qe.setFromMatrixPosition(U.matrixWorld)),lt.logarithmicDepthBuffer&&Lt.setValue($,"logDepthBufFC",2/(Math.log(U.far+1)/Math.LN2)),(oe.isMeshPhongMaterial||oe.isMeshToonMaterial||oe.isMeshLambertMaterial||oe.isMeshBasicMaterial||oe.isMeshStandardMaterial||oe.isShaderMaterial)&&Lt.setValue($,"isOrthographic",U.isOrthographicCamera===!0),B!==U&&(B=U,Wt=!0,rn=!0)}if(ee.isSkinnedMesh){Lt.setOptional($,ee,"bindMatrix"),Lt.setOptional($,ee,"bindMatrixInverse");const qt=ee.skeleton;qt&&(qt.boneTexture===null&&qt.computeBoneTexture(),Lt.setValue($,"boneTexture",qt.boneTexture,tt))}ee.isBatchedMesh&&(Lt.setOptional($,ee,"batchingTexture"),Lt.setValue($,"batchingTexture",ee._matricesTexture,tt),Lt.setOptional($,ee,"batchingIdTexture"),Lt.setValue($,"batchingIdTexture",ee._indirectTexture,tt),Lt.setOptional($,ee,"batchingColorTexture"),ee._colorsTexture!==null&&Lt.setValue($,"batchingColorTexture",ee._colorsTexture,tt));const en=ae.morphAttributes;if((en.position!==void 0||en.normal!==void 0||en.color!==void 0)&&we.update(ee,ae,hn),(Wt||at.receiveShadow!==ee.receiveShadow)&&(at.receiveShadow=ee.receiveShadow,Lt.setValue($,"receiveShadow",ee.receiveShadow)),oe.isMeshGouraudMaterial&&oe.envMap!==null&&(cn.envMap.value=We,cn.flipEnvMap.value=We.isCubeTexture&&We.isRenderTargetTexture===!1?-1:1),oe.isMeshStandardMaterial&&oe.envMap===null&&Q.environment!==null&&(cn.envMapIntensity.value=Q.environmentIntensity),cn.dfgLUT!==void 0&&(cn.dfgLUT.value=gy()),Wt&&(Lt.setValue($,"toneMappingExposure",C.toneMappingExposure),at.needsLights&&gr(cn,rn),ye&&oe.fog===!0&&Ke.refreshFogUniforms(cn,ye),Ke.refreshMaterialUniforms(cn,oe,be,Se,V.state.transmissionRenderTarget[U.id]),Ps.upload($,Yt(at),cn,tt)),oe.isShaderMaterial&&oe.uniformsNeedUpdate===!0&&(Ps.upload($,Yt(at),cn,tt),oe.uniformsNeedUpdate=!1),oe.isSpriteMaterial&&Lt.setValue($,"center",ee.center),Lt.setValue($,"modelViewMatrix",ee.modelViewMatrix),Lt.setValue($,"normalMatrix",ee.normalMatrix),Lt.setValue($,"modelMatrix",ee.matrixWorld),oe.isShaderMaterial||oe.isRawShaderMaterial){const qt=oe.uniformsGroups;for(let an=0,ri=qt.length;an<ri;an++){const Cn=qt[an];Fe.update(Cn,hn),Fe.bind(Cn,hn)}}return hn}function gr(U,Q){U.ambientLightColor.needsUpdate=Q,U.lightProbe.needsUpdate=Q,U.directionalLights.needsUpdate=Q,U.directionalLightShadows.needsUpdate=Q,U.pointLights.needsUpdate=Q,U.pointLightShadows.needsUpdate=Q,U.spotLights.needsUpdate=Q,U.spotLightShadows.needsUpdate=Q,U.rectAreaLights.needsUpdate=Q,U.hemisphereLights.needsUpdate=Q}function nn(U){return U.isMeshLambertMaterial||U.isMeshToonMaterial||U.isMeshPhongMaterial||U.isMeshStandardMaterial||U.isShadowMaterial||U.isShaderMaterial&&U.lights===!0}this.getActiveCubeFace=function(){return W},this.getActiveMipmapLevel=function(){return P},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(U,Q,ae){const oe=Ye.get(U);oe.__autoAllocateDepthBuffer=U.resolveDepthBuffer===!1,oe.__autoAllocateDepthBuffer===!1&&(oe.__useRenderToTexture=!1),Ye.get(U.texture).__webglTexture=Q,Ye.get(U.depthTexture).__webglTexture=oe.__autoAllocateDepthBuffer?void 0:ae,oe.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(U,Q){const ae=Ye.get(U);ae.__webglFramebuffer=Q,ae.__useDefaultFramebuffer=Q===void 0};const En=$.createFramebuffer();this.setRenderTarget=function(U,Q=0,ae=0){w=U,W=Q,P=ae;let oe=!0,ee=null,ye=!1,Ne=!1;if(U){const We=Ye.get(U);if(We.__useDefaultFramebuffer!==void 0)Ie.bindFramebuffer($.FRAMEBUFFER,null),oe=!1;else if(We.__webglFramebuffer===void 0)tt.setupRenderTarget(U);else if(We.__hasExternalTextures)tt.rebindTextures(U,Ye.get(U.texture).__webglTexture,Ye.get(U.depthTexture).__webglTexture);else if(U.depthBuffer){const it=U.depthTexture;if(We.__boundDepthTexture!==it){if(it!==null&&Ye.has(it)&&(U.width!==it.image.width||U.height!==it.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");tt.setupDepthRenderbuffer(U)}}const Je=U.texture;(Je.isData3DTexture||Je.isDataArrayTexture||Je.isCompressedArrayTexture)&&(Ne=!0);const nt=Ye.get(U).__webglFramebuffer;U.isWebGLCubeRenderTarget?(Array.isArray(nt[Q])?ee=nt[Q][ae]:ee=nt[Q],ye=!0):U.samples>0&&tt.useMultisampledRTT(U)===!1?ee=Ye.get(U).__webglMultisampledFramebuffer:Array.isArray(nt)?ee=nt[ae]:ee=nt,Y.copy(U.viewport),K.copy(U.scissor),j=U.scissorTest}else Y.copy(ht).multiplyScalar(be).floor(),K.copy(xt).multiplyScalar(be).floor(),j=gt;if(ae!==0&&(ee=En),Ie.bindFramebuffer($.FRAMEBUFFER,ee)&&oe&&Ie.drawBuffers(U,ee),Ie.viewport(Y),Ie.scissor(K),Ie.setScissorTest(j),ye){const We=Ye.get(U.texture);$.framebufferTexture2D($.FRAMEBUFFER,$.COLOR_ATTACHMENT0,$.TEXTURE_CUBE_MAP_POSITIVE_X+Q,We.__webglTexture,ae)}else if(Ne){const We=Q;for(let Je=0;Je<U.textures.length;Je++){const nt=Ye.get(U.textures[Je]);$.framebufferTextureLayer($.FRAMEBUFFER,$.COLOR_ATTACHMENT0+Je,nt.__webglTexture,ae,We)}}else if(U!==null&&ae!==0){const We=Ye.get(U.texture);$.framebufferTexture2D($.FRAMEBUFFER,$.COLOR_ATTACHMENT0,$.TEXTURE_2D,We.__webglTexture,ae)}z=-1},this.readRenderTargetPixels=function(U,Q,ae,oe,ee,ye,Ne,Me=0){if(!(U&&U.isWebGLRenderTarget)){Jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let We=Ye.get(U).__webglFramebuffer;if(U.isWebGLCubeRenderTarget&&Ne!==void 0&&(We=We[Ne]),We){Ie.bindFramebuffer($.FRAMEBUFFER,We);try{const Je=U.textures[Me],nt=Je.format,it=Je.type;if(!lt.textureFormatReadable(nt)){Jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!lt.textureTypeReadable(it)){Jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Q>=0&&Q<=U.width-oe&&ae>=0&&ae<=U.height-ee&&(U.textures.length>1&&$.readBuffer($.COLOR_ATTACHMENT0+Me),$.readPixels(Q,ae,oe,ee,Qe.convert(nt),Qe.convert(it),ye))}finally{const Je=w!==null?Ye.get(w).__webglFramebuffer:null;Ie.bindFramebuffer($.FRAMEBUFFER,Je)}}},this.readRenderTargetPixelsAsync=async function(U,Q,ae,oe,ee,ye,Ne,Me=0){if(!(U&&U.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let We=Ye.get(U).__webglFramebuffer;if(U.isWebGLCubeRenderTarget&&Ne!==void 0&&(We=We[Ne]),We)if(Q>=0&&Q<=U.width-oe&&ae>=0&&ae<=U.height-ee){Ie.bindFramebuffer($.FRAMEBUFFER,We);const Je=U.textures[Me],nt=Je.format,it=Je.type;if(!lt.textureFormatReadable(nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!lt.textureTypeReadable(it))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const mt=$.createBuffer();$.bindBuffer($.PIXEL_PACK_BUFFER,mt),$.bufferData($.PIXEL_PACK_BUFFER,ye.byteLength,$.STREAM_READ),U.textures.length>1&&$.readBuffer($.COLOR_ATTACHMENT0+Me),$.readPixels(Q,ae,oe,ee,Qe.convert(nt),Qe.convert(it),0);const Mt=w!==null?Ye.get(w).__webglFramebuffer:null;Ie.bindFramebuffer($.FRAMEBUFFER,Mt);const Ot=$.fenceSync($.SYNC_GPU_COMMANDS_COMPLETE,0);return $.flush(),await jm($,Ot,4),$.bindBuffer($.PIXEL_PACK_BUFFER,mt),$.getBufferSubData($.PIXEL_PACK_BUFFER,0,ye),$.deleteBuffer(mt),$.deleteSync(Ot),ye}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(U,Q=null,ae=0){const oe=Math.pow(2,-ae),ee=Math.floor(U.image.width*oe),ye=Math.floor(U.image.height*oe),Ne=Q!==null?Q.x:0,Me=Q!==null?Q.y:0;tt.setTexture2D(U,0),$.copyTexSubImage2D($.TEXTURE_2D,ae,0,0,Ne,Me,ee,ye),Ie.unbindTexture()};const Ji=$.createFramebuffer(),ni=$.createFramebuffer();this.copyTextureToTexture=function(U,Q,ae=null,oe=null,ee=0,ye=null){ye===null&&(ee!==0?(bo("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ye=ee,ee=0):ye=0);let Ne,Me,We,Je,nt,it,mt,Mt,Ot;const Ht=U.isCompressedTexture?U.mipmaps[ye]:U.image;if(ae!==null)Ne=ae.max.x-ae.min.x,Me=ae.max.y-ae.min.y,We=ae.isBox3?ae.max.z-ae.min.z:1,Je=ae.min.x,nt=ae.min.y,it=ae.isBox3?ae.min.z:0;else{const en=Math.pow(2,-ee);Ne=Math.floor(Ht.width*en),Me=Math.floor(Ht.height*en),U.isDataArrayTexture?We=Ht.depth:U.isData3DTexture?We=Math.floor(Ht.depth*en):We=1,Je=0,nt=0,it=0}oe!==null?(mt=oe.x,Mt=oe.y,Ot=oe.z):(mt=0,Mt=0,Ot=0);const Dt=Qe.convert(Q.format),at=Qe.convert(Q.type);let kt;Q.isData3DTexture?(tt.setTexture3D(Q,0),kt=$.TEXTURE_3D):Q.isDataArrayTexture||Q.isCompressedArrayTexture?(tt.setTexture2DArray(Q,0),kt=$.TEXTURE_2D_ARRAY):(tt.setTexture2D(Q,0),kt=$.TEXTURE_2D),$.pixelStorei($.UNPACK_FLIP_Y_WEBGL,Q.flipY),$.pixelStorei($.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Q.premultiplyAlpha),$.pixelStorei($.UNPACK_ALIGNMENT,Q.unpackAlignment);const St=$.getParameter($.UNPACK_ROW_LENGTH),hn=$.getParameter($.UNPACK_IMAGE_HEIGHT),Nn=$.getParameter($.UNPACK_SKIP_PIXELS),Wt=$.getParameter($.UNPACK_SKIP_ROWS),rn=$.getParameter($.UNPACK_SKIP_IMAGES);$.pixelStorei($.UNPACK_ROW_LENGTH,Ht.width),$.pixelStorei($.UNPACK_IMAGE_HEIGHT,Ht.height),$.pixelStorei($.UNPACK_SKIP_PIXELS,Je),$.pixelStorei($.UNPACK_SKIP_ROWS,nt),$.pixelStorei($.UNPACK_SKIP_IMAGES,it);const Lt=U.isDataArrayTexture||U.isData3DTexture,cn=Q.isDataArrayTexture||Q.isData3DTexture;if(U.isDepthTexture){const en=Ye.get(U),qt=Ye.get(Q),an=Ye.get(en.__renderTarget),ri=Ye.get(qt.__renderTarget);Ie.bindFramebuffer($.READ_FRAMEBUFFER,an.__webglFramebuffer),Ie.bindFramebuffer($.DRAW_FRAMEBUFFER,ri.__webglFramebuffer);for(let Cn=0;Cn<We;Cn++)Lt&&($.framebufferTextureLayer($.READ_FRAMEBUFFER,$.COLOR_ATTACHMENT0,Ye.get(U).__webglTexture,ee,it+Cn),$.framebufferTextureLayer($.DRAW_FRAMEBUFFER,$.COLOR_ATTACHMENT0,Ye.get(Q).__webglTexture,ye,Ot+Cn)),$.blitFramebuffer(Je,nt,Ne,Me,mt,Mt,Ne,Me,$.DEPTH_BUFFER_BIT,$.NEAREST);Ie.bindFramebuffer($.READ_FRAMEBUFFER,null),Ie.bindFramebuffer($.DRAW_FRAMEBUFFER,null)}else if(ee!==0||U.isRenderTargetTexture||Ye.has(U)){const en=Ye.get(U),qt=Ye.get(Q);Ie.bindFramebuffer($.READ_FRAMEBUFFER,Ji),Ie.bindFramebuffer($.DRAW_FRAMEBUFFER,ni);for(let an=0;an<We;an++)Lt?$.framebufferTextureLayer($.READ_FRAMEBUFFER,$.COLOR_ATTACHMENT0,en.__webglTexture,ee,it+an):$.framebufferTexture2D($.READ_FRAMEBUFFER,$.COLOR_ATTACHMENT0,$.TEXTURE_2D,en.__webglTexture,ee),cn?$.framebufferTextureLayer($.DRAW_FRAMEBUFFER,$.COLOR_ATTACHMENT0,qt.__webglTexture,ye,Ot+an):$.framebufferTexture2D($.DRAW_FRAMEBUFFER,$.COLOR_ATTACHMENT0,$.TEXTURE_2D,qt.__webglTexture,ye),ee!==0?$.blitFramebuffer(Je,nt,Ne,Me,mt,Mt,Ne,Me,$.COLOR_BUFFER_BIT,$.NEAREST):cn?$.copyTexSubImage3D(kt,ye,mt,Mt,Ot+an,Je,nt,Ne,Me):$.copyTexSubImage2D(kt,ye,mt,Mt,Je,nt,Ne,Me);Ie.bindFramebuffer($.READ_FRAMEBUFFER,null),Ie.bindFramebuffer($.DRAW_FRAMEBUFFER,null)}else cn?U.isDataTexture||U.isData3DTexture?$.texSubImage3D(kt,ye,mt,Mt,Ot,Ne,Me,We,Dt,at,Ht.data):Q.isCompressedArrayTexture?$.compressedTexSubImage3D(kt,ye,mt,Mt,Ot,Ne,Me,We,Dt,Ht.data):$.texSubImage3D(kt,ye,mt,Mt,Ot,Ne,Me,We,Dt,at,Ht):U.isDataTexture?$.texSubImage2D($.TEXTURE_2D,ye,mt,Mt,Ne,Me,Dt,at,Ht.data):U.isCompressedTexture?$.compressedTexSubImage2D($.TEXTURE_2D,ye,mt,Mt,Ht.width,Ht.height,Dt,Ht.data):$.texSubImage2D($.TEXTURE_2D,ye,mt,Mt,Ne,Me,Dt,at,Ht);$.pixelStorei($.UNPACK_ROW_LENGTH,St),$.pixelStorei($.UNPACK_IMAGE_HEIGHT,hn),$.pixelStorei($.UNPACK_SKIP_PIXELS,Nn),$.pixelStorei($.UNPACK_SKIP_ROWS,Wt),$.pixelStorei($.UNPACK_SKIP_IMAGES,rn),ye===0&&Q.generateMipmaps&&$.generateMipmap(kt),Ie.unbindTexture()},this.initRenderTarget=function(U){Ye.get(U).__webglFramebuffer===void 0&&tt.setupRenderTarget(U)},this.initTexture=function(U){U.isCubeTexture?tt.setTextureCube(U,0):U.isData3DTexture?tt.setTexture3D(U,0):U.isDataArrayTexture||U.isCompressedArrayTexture?tt.setTexture2DArray(U,0):tt.setTexture2D(U,0),Ie.unbindTexture()},this.resetState=function(){W=0,P=0,w=null,Ie.reset(),q.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Tr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Rt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Rt._getUnpackColorSpace()}}const Rh=(n,e,t)=>{let r;switch(n){case Jn:r=new Uint8ClampedArray(e*t*4);break;case ei:r=new Uint16Array(e*t*4);break;case bi:r=new Uint32Array(e*t*4);break;case Wf:r=new Int8Array(e*t*4);break;case Xf:r=new Int16Array(e*t*4);break;case $s:r=new Int32Array(e*t*4);break;case Zn:r=new Float32Array(e*t*4);break;default:throw new Error("Unsupported data type")}return r};let bs;const xy=(n,e,t,r)=>{if(bs!==void 0)return bs;const a=new qr(1,1,r);e.setRenderTarget(a);const l=new Pr(new za,new eu({color:16777215}));e.render(l,t),e.setRenderTarget(null);const u=Rh(n,a.width,a.height);return e.readRenderTargetPixels(a,0,0,a.width,a.height,u),a.dispose(),l.geometry.dispose(),l.material.dispose(),bs=u[0]!==0,bs};class Ks{_renderer;_rendererIsDisposable=!1;_material;_scene;_camera;_quad;_renderTarget;_width;_height;_type;_colorSpace;_supportsReadPixels=!0;constructor(e){this._width=e.width,this._height=e.height,this._type=e.type,this._colorSpace=e.colorSpace;const t={format:An,depthBuffer:!1,stencilBuffer:!1,type:this._type,colorSpace:this._colorSpace,anisotropy:e.renderTargetOptions?.anisotropy!==void 0?e.renderTargetOptions?.anisotropy:1,generateMipmaps:e.renderTargetOptions?.generateMipmaps!==void 0?e.renderTargetOptions?.generateMipmaps:!1,magFilter:e.renderTargetOptions?.magFilter!==void 0?e.renderTargetOptions?.magFilter:un,minFilter:e.renderTargetOptions?.minFilter!==void 0?e.renderTargetOptions?.minFilter:un,samples:e.renderTargetOptions?.samples!==void 0?e.renderTargetOptions?.samples:void 0,wrapS:e.renderTargetOptions?.wrapS!==void 0?e.renderTargetOptions?.wrapS:Hn,wrapT:e.renderTargetOptions?.wrapT!==void 0?e.renderTargetOptions?.wrapT:Hn};if(this._material=e.material,e.renderer?this._renderer=e.renderer:(this._renderer=Ks.instantiateRenderer(),this._rendererIsDisposable=!0),this._scene=new w0,this._camera=new Eh,this._camera.position.set(0,0,10),this._camera.left=-.5,this._camera.right=.5,this._camera.top=.5,this._camera.bottom=-.5,this._camera.updateProjectionMatrix(),!xy(this._type,this._renderer,this._camera,t)){let r;switch(this._type){case ei:r=this._renderer.extensions.has("EXT_color_buffer_float")?Zn:void 0;break}r!==void 0?(console.warn(`This browser does not support reading pixels from ${this._type} RenderTargets, switching to ${Zn}`),this._type=r):(this._supportsReadPixels=!1,console.warn("This browser dos not support toArray or toDataTexture, calls to those methods will result in an error thrown"))}this._quad=new Pr(new za,this._material),this._quad.geometry.computeBoundingBox(),this._scene.add(this._quad),this._renderTarget=new qr(this.width,this.height,t),this._renderTarget.texture.mapping=e.renderTargetOptions?.mapping!==void 0?e.renderTargetOptions?.mapping:_o}static instantiateRenderer(){const e=new vy;return e.setSize(128,128),e}render=()=>{this._renderer.setRenderTarget(this._renderTarget);try{this._renderer.render(this._scene,this._camera)}catch(e){throw this._renderer.setRenderTarget(null),e}this._renderer.setRenderTarget(null)};toArray(){if(!this._supportsReadPixels)throw new Error("Can't read pixels in this browser");const e=Rh(this._type,this._width,this._height);return this._renderer.readRenderTargetPixels(this._renderTarget,0,0,this._width,this._height,e),e}toDataTexture(e){const t=new Eo(this.toArray(),this.width,this.height,An,this._type,e?.mapping||_o,e?.wrapS||Hn,e?.wrapT||Hn,e?.magFilter||un,e?.minFilter||un,e?.anisotropy||1,Rr);return t.generateMipmaps=e?.generateMipmaps!==void 0?e?.generateMipmaps:!1,t}disposeOnDemandRenderer(){this._renderer.setRenderTarget(null),this._rendererIsDisposable&&(this._renderer.dispose(),this._renderer.forceContextLoss())}dispose(e){this.disposeOnDemandRenderer(),e&&this.renderTarget.dispose(),this.material instanceof Qn&&Object.values(this.material.uniforms).forEach(t=>{t.value instanceof pn&&t.value.dispose()}),Object.values(this.material).forEach(t=>{t instanceof pn&&t.dispose()}),this.material.dispose(),this._quad.geometry.dispose()}get width(){return this._width}set width(e){this._width=e,this._renderTarget.setSize(this._width,this._height)}get height(){return this._height}set height(e){this._height=e,this._renderTarget.setSize(this._width,this._height)}get renderer(){return this._renderer}get renderTarget(){return this._renderTarget}set renderTarget(e){this._renderTarget=e,this._width=e.width,this._height=e.height}get material(){return this._material}get type(){return this._type}get colorSpace(){return this._colorSpace}}const Ph=n=>{let e;if(n instanceof Eo){if(!(n.image.data instanceof Uint16Array)&&!(n.image.data instanceof Float32Array))throw new Error("Provided image is not HDR");e=n}else e=new Eo(n.data,n.width,n.height,"format"in n?n.format:An,n.type,_o,go,go,un,un,1,"colorSpace"in n&&n.colorSpace==="srgb"?n.colorSpace:Rr),"header"in n&&"gamma"in n&&(e.flipY=!0),e.needsUpdate=!0;return e},yy=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Sy=`
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
`;class by extends Qn{_minContentBoost;_maxContentBoost;_offsetSdr;_offsetHdr;_gamma;constructor({sdr:e,hdr:t,offsetSdr:r,offsetHdr:a,maxContentBoost:l,minContentBoost:u,gamma:o}){if(!l)throw new Error("maxContentBoost is required");if(!e)throw new Error("sdr is required");if(!t)throw new Error("hdr is required");const p=o||[1,1,1],m=r||[1/64,1/64,1/64],x=a||[1/64,1/64,1/64],v=u||1,y=Math.max(l,1.0001);super({name:"GainMapEncoderMaterial",vertexShader:yy,fragmentShader:Sy,uniforms:{sdr:{value:e},hdr:{value:t},gamma:{value:new le().fromArray(p)},offsetSdr:{value:new le().fromArray(m)},offsetHdr:{value:new le().fromArray(x)},minLog2:{value:Math.log2(v)},maxLog2:{value:Math.log2(y)}},blending:pr,depthTest:!1,depthWrite:!1}),this._minContentBoost=v,this._maxContentBoost=y,this._offsetSdr=m,this._offsetHdr=x,this._gamma=p,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get gamma(){return this._gamma}set gamma(e){this._gamma=e,this.uniforms.gamma.value=new le().fromArray(e)}get offsetHdr(){return this._offsetHdr}set offsetHdr(e){this._offsetHdr=e,this.uniforms.offsetHdr.value=new le().fromArray(e)}get offsetSdr(){return this._offsetSdr}set offsetSdr(e){this._offsetSdr=e,this.uniforms.offsetSdr.value=new le().fromArray(e)}get minContentBoost(){return this._minContentBoost}set minContentBoost(e){this._minContentBoost=e,this.uniforms.minLog2.value=Math.log2(e)}get maxContentBoost(){return this._maxContentBoost}set maxContentBoost(e){this._maxContentBoost=e,this.uniforms.maxLog2.value=Math.log2(e)}get gainMapMin(){return[Math.log2(this._minContentBoost),Math.log2(this._minContentBoost),Math.log2(this._minContentBoost)]}get gainMapMax(){return[Math.log2(this._maxContentBoost),Math.log2(this._maxContentBoost),Math.log2(this._maxContentBoost)]}get hdrCapacityMin(){return Math.min(Math.max(0,this.gainMapMin[0]),Math.max(0,this.gainMapMin[1]),Math.max(0,this.gainMapMin[2]))}get hdrCapacityMax(){return Math.max(Math.max(0,this.gainMapMax[0]),Math.max(0,this.gainMapMax[1]),Math.max(0,this.gainMapMax[2]))}}const Ey=n=>{const{image:e,sdr:t,renderer:r}=n,a=Ph(e),l=new by({...n,sdr:t.renderTarget.texture,hdr:a}),u=new Ks({width:a.image.width,height:a.image.height,type:Jn,colorSpace:Rr,material:l,renderer:r,renderTargetOptions:n.renderTargetOptions});try{u.render()}catch(o){throw u.disposeOnDemandRenderer(),o}return u},My=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,wy=`
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
`;class Ty extends Qn{_brightness=0;_contrast=1;_saturation=1;_exposure=1;_toneMapping;_map;constructor({map:e,toneMapping:t}){super({name:"SDRMaterial",vertexShader:My,fragmentShader:wy,uniforms:{map:{value:e},brightness:{value:0},contrast:{value:1},saturation:{value:1},exposure:{value:1}},blending:pr,depthTest:!1,depthWrite:!1}),this._map=e,this.toneMapping=this._toneMapping=t||Yc,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get toneMapping(){return this._toneMapping}set toneMapping(e){let t=!1;switch(e){case Yc:this.defines.TONEMAPPING_FUNCTION="ACESFilmicToneMapping",t=!0;break;case rh:this.defines.TONEMAPPING_FUNCTION="ReinhardToneMapping",t=!0;break;case ih:this.defines.TONEMAPPING_FUNCTION="CineonToneMapping",t=!0;break;case qc:this.defines.TONEMAPPING_FUNCTION="LinearToneMapping",t=!0;break;default:console.error(`Unsupported toneMapping: ${e}. Using LinearToneMapping.`),this.defines.TONEMAPPING_FUNCTION="LinearToneMapping",this._toneMapping=qc}t&&(this._toneMapping=e),this.needsUpdate=!0}get brightness(){return this._brightness}set brightness(e){this._brightness=e,this.uniforms.brightness.value=e}get contrast(){return this._contrast}set contrast(e){this._contrast=e,this.uniforms.contrast.value=e}get saturation(){return this._saturation}set saturation(e){this._saturation=e,this.uniforms.saturation.value=e}get exposure(){return this._exposure}set exposure(e){this._exposure=e,this.uniforms.exposure.value=e}get map(){return this._map}set map(e){this._map=e,this.uniforms.map.value=e}}const Ay=(n,e,t,r)=>{n.needsUpdate=!0;const a=new Ks({width:n.image.width,height:n.image.height,type:Jn,colorSpace:zn,material:new Ty({map:n,toneMapping:t}),renderer:e,renderTargetOptions:r});try{a.render()}catch(l){throw a.disposeOnDemandRenderer(),l}return a},Cy=n=>{const{image:e,renderer:t}=n,r=Ph(e),a=Ay(r,t,n.toneMapping,n.renderTargetOptions),l=Ey({...n,image:r,sdr:a,renderer:a.renderer});return{sdr:a,gainMap:l,hdr:r,getMetadata:()=>({gainMapMax:l.material.gainMapMax,gainMapMin:l.material.gainMapMin,gamma:l.material.gamma,hdrCapacityMax:l.material.hdrCapacityMax,hdrCapacityMin:l.material.hdrCapacityMin,offsetHdr:l.material.offsetHdr,offsetSdr:l.material.offsetSdr})}},Ry="modulepreload",Py=function(n){return"/ultrahdr-pwa-svelte/"+n},ud={},Dy=function(e,t,r){let a=Promise.resolve();if(t&&t.length>0){let p=function(m){return Promise.all(m.map(x=>Promise.resolve(x).then(v=>({status:"fulfilled",value:v}),v=>({status:"rejected",reason:v}))))};document.getElementsByTagName("link");const u=document.querySelector("meta[property=csp-nonce]"),o=u?.nonce||u?.getAttribute("nonce");a=p(t.map(m=>{if(m=Py(m),m in ud)return;ud[m]=!0;const x=m.endsWith(".css"),v=x?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${v}`))return;const y=document.createElement("link");if(y.rel=x?"stylesheet":Ry,x||(y.as="script"),y.crossOrigin="",y.href=m,o&&y.setAttribute("nonce",o),document.head.appendChild(y),x)return new Promise((S,T)=>{y.addEventListener("load",S),y.addEventListener("error",()=>T(new Error(`Unable to preload CSS for ${m}`)))})}))}function l(u){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=u,window.dispatchEvent(o),!o.defaultPrevented)throw u}return a.then(u=>{for(const o of u||[])o.status==="rejected"&&l(o.reason);return e().catch(l)})};var Ly=(()=>{var n=import.meta.url;return(async function(e={}){var t=e,r,a;t.ready=new Promise((c,d)=>{r=c,a=d}),["_main","_memory","___indirect_function_table","__embind_initialize_bindings","_fflush","onRuntimeInitialized"].forEach(c=>{Object.getOwnPropertyDescriptor(t.ready,c)||Object.defineProperty(t.ready,c,{get:()=>N("You are getting "+c+" on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),set:()=>N("You are setting "+c+" on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")})});var l=Object.assign({},t),u="./this.program",o=(c,d)=>{throw d},p=typeof window=="object",m=typeof importScripts=="function",x=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string",v=!p&&!x&&!m;if(t.ENVIRONMENT)throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");var y="";function S(c){return t.locateFile?t.locateFile(c,y):y+c}var T,F,E;if(x){if(typeof process>"u"||!process.release||process.release.name!=="node")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");var b=process.versions.node,H=b.split(".").slice(0,3);if(H=H[0]*1e4+H[1]*100+H[2].split("-")[0]*1,H<16e4)throw new Error("This emscripten-generated code requires node v16.0.0 (detected v"+b+")");const{createRequire:c}=await Dy(async()=>{const{createRequire:d}=await Promise.resolve().then(()=>Lh);return{createRequire:d}},void 0);var V=c(import.meta.url),X=V("fs"),I=V("path");m?y=I.dirname(y)+"/":y=V("url").fileURLToPath(new URL("./",import.meta.url)),T=(d,_)=>(d=fe(d)?new URL(d):I.normalize(d),X.readFileSync(d,_?void 0:"utf8")),E=d=>{var _=T(d,!0);return _.buffer||(_=new Uint8Array(_)),B(_.buffer),_},F=(d,_,i,s=!0)=>{d=fe(d)?new URL(d):I.normalize(d),X.readFile(d,s?void 0:"utf8",(f,h)=>{f?i(f):_(s?h.buffer:h)})},!t.thisProgram&&process.argv.length>1&&(u=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2),o=(d,_)=>{throw process.exitCode=d,_},t.inspect=()=>"[Emscripten Module object]"}else if(v){if(typeof process=="object"&&typeof V=="function"||typeof window=="object"||typeof importScripts=="function")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");typeof read<"u"&&(T=read),E=c=>{if(typeof readbuffer=="function")return new Uint8Array(readbuffer(c));let d=read(c,"binary");return B(typeof d=="object"),d},F=(c,d,_)=>{setTimeout(()=>d(E(c)))},typeof clearTimeout>"u"&&(globalThis.clearTimeout=c=>{}),typeof setTimeout>"u"&&(globalThis.setTimeout=c=>typeof c=="function"?c():N()),typeof scriptArgs<"u"&&scriptArgs,typeof quit=="function"&&(o=(c,d)=>{throw setTimeout(()=>{if(!(d instanceof Ae)){let _=d;d&&typeof d=="object"&&d.stack&&(_=[d,d.stack]),L(`exiting due to exception: ${_}`)}quit(c)}),d}),typeof print<"u"&&(typeof console>"u"&&(console={}),console.log=print,console.warn=console.error=typeof printErr<"u"?printErr:print)}else if(p||m){if(m?y=self.location.href:typeof document<"u"&&document.currentScript&&(y=document.currentScript.src),n&&(y=n),y.indexOf("blob:")!==0?y=y.substr(0,y.replace(/[?#].*/,"").lastIndexOf("/")+1):y="",!(typeof window=="object"||typeof importScripts=="function"))throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");T=c=>{var d=new XMLHttpRequest;return d.open("GET",c,!1),d.send(null),d.responseText},m&&(E=c=>{var d=new XMLHttpRequest;return d.open("GET",c,!1),d.responseType="arraybuffer",d.send(null),new Uint8Array(d.response)}),F=(c,d,_)=>{var i=new XMLHttpRequest;i.open("GET",c,!0),i.responseType="arraybuffer",i.onload=()=>{if(i.status==200||i.status==0&&i.response){d(i.response);return}_()},i.onerror=_,i.send(null)}}else throw new Error("environment detection error");var C=t.print||console.log.bind(console),L=t.printErr||console.error.bind(console);Object.assign(t,l),l=null,Ri(),t.arguments&&t.arguments,je("arguments","arguments_"),t.thisProgram&&(u=t.thisProgram),je("thisProgram","thisProgram"),t.quit&&(o=t.quit),je("quit","quit_"),B(typeof t.memoryInitializerPrefixURL>"u","Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"),B(typeof t.pthreadMainPrefixURL>"u","Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"),B(typeof t.cdInitializerPrefixURL>"u","Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"),B(typeof t.filePackagePrefixURL>"u","Module.filePackagePrefixURL option was removed, use Module.locateFile instead"),B(typeof t.read>"u","Module.read option was removed (modify read_ in JS)"),B(typeof t.readAsync>"u","Module.readAsync option was removed (modify readAsync in JS)"),B(typeof t.readBinary>"u","Module.readBinary option was removed (modify readBinary in JS)"),B(typeof t.setWindowTitle>"u","Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)"),B(typeof t.TOTAL_MEMORY>"u","Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"),je("asm","wasmExports"),je("read","read_"),je("readAsync","readAsync"),je("readBinary","readBinary"),je("setWindowTitle","setWindowTitle"),B(!v,"shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");var W;t.wasmBinary&&(W=t.wasmBinary),je("wasmBinary","wasmBinary"),typeof WebAssembly!="object"&&N("no native wasm support detected");var P,w=!1,z;function B(c,d){c||N("Assertion failed"+(d?": "+d:""))}var Y,K,j,J,ce,te,Se,be;function $e(){var c=P.buffer;t.HEAP8=Y=new Int8Array(c),t.HEAP16=j=new Int16Array(c),t.HEAPU8=K=new Uint8Array(c),t.HEAPU16=J=new Uint16Array(c),t.HEAP32=ce=new Int32Array(c),t.HEAPU32=te=new Uint32Array(c),t.HEAPF32=Se=new Float32Array(c),t.HEAPF64=be=new Float64Array(c)}B(!t.STACK_SIZE,"STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time"),B(typeof Int32Array<"u"&&typeof Float64Array<"u"&&Int32Array.prototype.subarray!=null&&Int32Array.prototype.set!=null,"JS engine does not provide full typed array support"),B(!t.wasmMemory,"Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"),B(!t.INITIAL_MEMORY,"Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");function st(){var c=Ka();B((c&3)==0),c==0&&(c+=4),te[c>>2]=34821223,te[c+4>>2]=2310721022,te[0]=1668509029}function ht(){if(!w){var c=Ka();c==0&&(c+=4);var d=te[c>>2],_=te[c+4>>2];(d!=34821223||_!=2310721022)&&N(`Stack overflow! Stack cookie has been overwritten at ${pe(c)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${pe(_)} ${pe(d)}`),te[0]!=1668509029&&N("Runtime error: The application has corrupted its heap memory area (address zero)!")}}(function(){var c=new Int16Array(1),d=new Int8Array(c.buffer);if(c[0]=25459,d[0]!==115||d[1]!==99)throw"Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)"})();var xt=[],gt=[],_e=[],ge=[],Oe=!1;function et(){if(t.preRun)for(typeof t.preRun=="function"&&(t.preRun=[t.preRun]);t.preRun.length;)ft(t.preRun.shift());Ee(xt)}function qe(){B(!Oe),Oe=!0,ht(),!t.noFSInit&&!R.init.initialized&&R.init(),R.ignorePermissions=!1,Ee(gt)}function ct(){ht(),Ee(_e)}function Pt(){if(ht(),t.postRun)for(typeof t.postRun=="function"&&(t.postRun=[t.postRun]);t.postRun.length;)$(t.postRun.shift());Ee(ge)}function ft(c){xt.unshift(c)}function Tt(c){gt.unshift(c)}function $(c){ge.unshift(c)}B(Math.imul,"This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),B(Math.fround,"This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),B(Math.clz32,"This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),B(Math.trunc,"This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");var Ce=0,ke=null,lt=null,Ie={};function yt(c){for(var d=c;;){if(!Ie[c])return c;c=d+Math.random()}}function Ye(c){Ce++,t.monitorRunDependencies&&t.monitorRunDependencies(Ce),c?(B(!Ie[c]),Ie[c]=1,ke===null&&typeof setInterval<"u"&&(ke=setInterval(()=>{if(w){clearInterval(ke),ke=null;return}var d=!1;for(var _ in Ie)d||(d=!0,L("still waiting on run dependencies:")),L(`dependency: ${_}`);d&&L("(end of list)")},1e4))):L("warning: run dependency added without ID")}function tt(c){if(Ce--,t.monitorRunDependencies&&t.monitorRunDependencies(Ce),c?(B(Ie[c]),delete Ie[c]):L("warning: run dependency removed without ID"),Ce==0&&(ke!==null&&(clearInterval(ke),ke=null),lt)){var d=lt;lt=null,d()}}function N(c){t.onAbort&&t.onAbort(c),c="Aborted("+c+")",L(c),w=!0,z=1;var d=new WebAssembly.RuntimeError(c);throw a(d),d}var D="data:application/octet-stream;base64,",ne=c=>c.startsWith(D),fe=c=>c.startsWith("file://");function de(c){return function(){B(Oe,`native function \`${c}\` called before runtime initialization`);var d=ar[c];return B(d,`exported native function \`${c}\` not found`),d.apply(null,arguments)}}var ie;t.locateFile?(ie="libultrahdr-esm.wasm",ne(ie)||(ie=S(ie))):ie=new URL("/ultrahdr-pwa-svelte/assets/libultrahdr-esm-B2AMZ5Um.wasm",import.meta.url).href;function Ke(c){if(c==ie&&W)return new Uint8Array(W);if(E)return E(c);throw"both async and sync fetching of the wasm failed"}function Ue(c){if(!W&&(p||m)){if(typeof fetch=="function"&&!fe(c))return fetch(c,{credentials:"same-origin"}).then(d=>{if(!d.ok)throw"failed to load wasm binary file at '"+c+"'";return d.arrayBuffer()}).catch(()=>Ke(c));if(F)return new Promise((d,_)=>{F(c,i=>d(new Uint8Array(i)),_)})}return Promise.resolve().then(()=>Ke(c))}function rt(c,d,_){return Ue(c).then(i=>WebAssembly.instantiate(i,d)).then(i=>i).then(_,i=>{L(`failed to asynchronously prepare wasm: ${i}`),fe(ie)&&L(`warning: Loading from a file URI (${ie}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`),N(i)})}function Ze(c,d,_,i){return!c&&typeof WebAssembly.instantiateStreaming=="function"&&!ne(d)&&!fe(d)&&!x&&typeof fetch=="function"?fetch(d,{credentials:"same-origin"}).then(s=>{var f=WebAssembly.instantiateStreaming(s,_);return f.then(i,function(h){return L(`wasm streaming compile failed: ${h}`),L("falling back to ArrayBuffer instantiation"),rt(d,_,i)})}):rt(d,_,i)}function ve(){var c={env:Xo,wasi_snapshot_preview1:Xo};function d(s,f){return ar=s.exports,P=ar.memory,B(P,"memory not found in wasm exports"),$e(),Wt=ar.__indirect_function_table,B(Wt,"table not found in wasm exports"),Tt(ar.__wasm_call_ctors),tt("wasm-instantiate"),ar}Ye("wasm-instantiate");var _=t;function i(s){B(t===_,"the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"),_=null,d(s.instance)}if(t.instantiateWasm)try{return t.instantiateWasm(c,d)}catch(s){L(`Module.instantiateWasm callback failed with error: ${s}`),a(s)}return Ze(W,ie,c,i).catch(a),{}}var he,we;function je(c,d,_=!0){Object.getOwnPropertyDescriptor(t,c)||Object.defineProperty(t,c,{configurable:!0,get(){let i=_?" (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)":"";N(`\`Module.${c}\` has been replaced by \`${d}\``+i)}})}function Be(c){Object.getOwnPropertyDescriptor(t,c)&&N(`\`Module.${c}\` was supplied but \`${c}\` not included in INCOMING_MODULE_JS_API`)}function Qe(c){return c==="FS_createPath"||c==="FS_createDataFile"||c==="FS_createPreloadedFile"||c==="FS_unlink"||c==="addRunDependency"||c==="FS_createLazyFile"||c==="FS_createDevice"||c==="removeRunDependency"}function q(c,d){typeof globalThis<"u"&&Object.defineProperty(globalThis,c,{configurable:!0,get(){Ge("`"+c+"` is not longer defined by emscripten. "+d)}})}q("buffer","Please use HEAP8.buffer or wasmMemory.buffer"),q("asm","Please use wasmExports instead");function Fe(c){typeof globalThis<"u"&&!Object.getOwnPropertyDescriptor(globalThis,c)&&Object.defineProperty(globalThis,c,{configurable:!0,get(){var d="`"+c+"` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line",_=c;_.startsWith("_")||(_="$"+c),d+=" (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='"+_+"')",Qe(c)&&(d+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),Ge(d)}}),Te(c)}function Te(c){Object.getOwnPropertyDescriptor(t,c)||Object.defineProperty(t,c,{configurable:!0,get(){var d="'"+c+"' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)";Qe(c)&&(d+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),N(d)}})}function Ae(c){this.name="ExitStatus",this.message=`Program terminated with exit(${c})`,this.status=c}var Ee=c=>{for(;c.length>0;)c.shift()(t)};t.noExitRuntime;var pe=c=>(B(typeof c=="number"),c>>>=0,"0x"+c.toString(16).padStart(8,"0")),Ge=c=>{Ge.shown||(Ge.shown={}),Ge.shown[c]||(Ge.shown[c]=1,x&&(c="warning: "+c),L(c))};function Re(c){this.excPtr=c,this.ptr=c-24,this.set_type=function(d){te[this.ptr+4>>2]=d},this.get_type=function(){return te[this.ptr+4>>2]},this.set_destructor=function(d){te[this.ptr+8>>2]=d},this.get_destructor=function(){return te[this.ptr+8>>2]},this.set_caught=function(d){d=d?1:0,Y[this.ptr+12>>0]=d},this.get_caught=function(){return Y[this.ptr+12>>0]!=0},this.set_rethrown=function(d){d=d?1:0,Y[this.ptr+13>>0]=d},this.get_rethrown=function(){return Y[this.ptr+13>>0]!=0},this.init=function(d,_){this.set_adjusted_ptr(0),this.set_type(d),this.set_destructor(_)},this.set_adjusted_ptr=function(d){te[this.ptr+16>>2]=d},this.get_adjusted_ptr=function(){return te[this.ptr+16>>2]},this.get_exception_ptr=function(){var d=jo(this.get_type());if(d)return te[this.excPtr>>2];var _=this.get_adjusted_ptr();return _!==0?_:this.excPtr}}var It=(c,d,_)=>{var i=new Re(c);i.init(d,_),B(!1,"Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.")},Et={},bn=c=>{for(;c.length;){var d=c.pop(),_=c.pop();_(d)}};function dn(c){return this.fromWireType(ce[c>>2])}var _r={},$n={},er={},A,$t=c=>{throw new A(c)},Mi=(c,d,_)=>{c.forEach(function(g){er[g]=d});function i(g){var M=_(g);M.length!==c.length&&$t("Mismatched type converter count");for(var O=0;O<c.length;++O)nn(c[O],M[O])}var s=new Array(d.length),f=[],h=0;d.forEach((g,M)=>{$n.hasOwnProperty(g)?s[M]=$n[g]:(f.push(g),_r.hasOwnProperty(g)||(_r[g]=[]),_r[g].push(()=>{s[M]=$n[g],++h,h===f.length&&i(s)}))}),f.length===0&&i(s)},Ki=c=>{var d=Et[c];delete Et[c];var _=d.rawConstructor,i=d.rawDestructor,s=d.fields,f=s.map(h=>h.getterReturnType).concat(s.map(h=>h.setterArgumentType));Mi([c],f,h=>{var g={};return s.forEach((M,O)=>{var G=M.fieldName,Z=h[O],re=M.getter,se=M.getterContext,xe=h[O+s.length],Pe=M.setter,De=M.setterContext;g[G]={read:Xe=>Z.fromWireType(re(se,Xe)),write:(Xe,me)=>{var Le=[];Pe(De,Xe,xe.toWireType(Le,me)),bn(Le)}}}),[{name:d.name,fromWireType:M=>{var O={};for(var G in g)O[G]=g[G].read(M);return i(M),O},toWireType:(M,O)=>{for(var G in g)if(!(G in O))throw new TypeError(`Missing field: "${G}"`);var Z=_();for(G in g)g[G].write(Z,O[G]);return M!==null&&M.push(i,Z),Z},argPackAdvance:En,readValueFromPointer:dn,destructorFunction:i}]})},ti=(c,d,_,i,s)=>{},Zi=()=>{for(var c=new Array(256),d=0;d<256;++d)c[d]=String.fromCharCode(d);Dr=c},Dr,Yt=c=>{for(var d="",_=c;K[_];)d+=Dr[K[_++]];return d},Lr,Zt=c=>{throw new Lr(c)};function gr(c,d,_={}){var i=d.name;if(c||Zt(`type "${i}" must have a positive integer typeid pointer`),$n.hasOwnProperty(c)){if(_.ignoreDuplicateRegistrations)return;Zt(`Cannot register type '${i}' twice`)}if($n[c]=d,delete er[c],_r.hasOwnProperty(c)){var s=_r[c];delete _r[c],s.forEach(f=>f())}}function nn(c,d,_={}){if(!("argPackAdvance"in d))throw new TypeError("registerType registeredInstance requires argPackAdvance");return gr(c,d,_)}var En=8,Ji=(c,d,_,i)=>{d=Yt(d),nn(c,{name:d,fromWireType:function(s){return!!s},toWireType:function(s,f){return f?_:i},argPackAdvance:En,readValueFromPointer:function(s){return this.fromWireType(K[s])},destructorFunction:null})};function ni(){Object.assign(U.prototype,{get(c){return B(this.allocated[c]!==void 0,`invalid handle: ${c}`),this.allocated[c]},has(c){return this.allocated[c]!==void 0},allocate(c){var d=this.freelist.pop()||this.allocated.length;return this.allocated[d]=c,d},free(c){B(this.allocated[c]!==void 0),this.allocated[c]=void 0,this.freelist.push(c)}})}function U(){this.allocated=[void 0],this.freelist=[]}var Q=new U,ae=c=>{c>=Q.reserved&&--Q.get(c).refcount===0&&Q.free(c)},oe=()=>{for(var c=0,d=Q.reserved;d<Q.allocated.length;++d)Q.allocated[d]!==void 0&&++c;return c},ee=()=>{Q.allocated.push({value:void 0},{value:null},{value:!0},{value:!1}),Q.reserved=Q.allocated.length,t.count_emval_handles=oe},ye={toValue:c=>(c||Zt("Cannot use deleted val. handle = "+c),Q.get(c).value),toHandle:c=>{switch(c){case void 0:return 1;case null:return 2;case!0:return 3;case!1:return 4;default:return Q.allocate({refcount:1,value:c})}}},Ne=(c,d)=>{d=Yt(d),nn(c,{name:d,fromWireType:_=>{var i=ye.toValue(_);return ae(_),i},toWireType:(_,i)=>ye.toHandle(i),argPackAdvance:En,readValueFromPointer:dn,destructorFunction:null})},Me=c=>{if(c===null)return"null";var d=typeof c;return d==="object"||d==="array"||d==="function"?c.toString():""+c},We=(c,d)=>{switch(d){case 4:return function(_){return this.fromWireType(Se[_>>2])};case 8:return function(_){return this.fromWireType(be[_>>3])};default:throw new TypeError(`invalid float width (${d}): ${c}`)}},Je=(c,d,_)=>{d=Yt(d),nn(c,{name:d,fromWireType:i=>i,toWireType:(i,s)=>{if(typeof s!="number"&&typeof s!="boolean")throw new TypeError(`Cannot convert ${Me(s)} to ${this.name}`);return s},argPackAdvance:En,readValueFromPointer:We(d,_),destructorFunction:null})},nt=48,it=57,mt=c=>{if(c===void 0)return"_unknown";c=c.replace(/[^a-zA-Z0-9_]/g,"$");var d=c.charCodeAt(0);return d>=nt&&d<=it?`_${c}`:c};function Mt(c,d){return c=mt(c),{[c]:function(){return d.apply(this,arguments)}}[c]}function Ot(c,d){if(!(c instanceof Function))throw new TypeError(`new_ called with constructor type ${typeof c} which is not a function`);var _=Mt(c.name||"unknownFunctionName",function(){});_.prototype=c.prototype;var i=new _,s=c.apply(i,d);return s instanceof Object?s:i}function Ht(c,d,_,i,s,f){var h=d.length;h<2&&Zt("argTypes array size mismatch! Must at least get return value and 'this' types!"),B(!f,"Async bindings are only supported with JSPI."),d[1];for(var g=!1,M=1;M<d.length;++M)if(d[M]!==null&&d[M].destructorFunction===void 0){g=!0;break}for(var O=d[0].name!=="void",G="",Z="",M=0;M<h-2;++M)G+=(M!==0?", ":"")+"arg"+M,Z+=(M!==0?", ":"")+"arg"+M+"Wired";var re=`
        return function ${mt(c)}(${G}) {
        if (arguments.length !== ${h-2}) {
          throwBindingError('function ${c} called with ' + arguments.length + ' arguments, expected ${h-2}');
        }`;g&&(re+=`var destructors = [];
`);for(var se=g?"destructors":"null",xe=["throwBindingError","invoker","fn","runDestructors","retType","classParam"],Pe=[Zt,i,s,bn,d[0],d[1]],M=0;M<h-2;++M)re+="var arg"+M+"Wired = argType"+M+".toWireType("+se+", arg"+M+"); // "+d[M+2].name+`
`,xe.push("argType"+M),Pe.push(d[M+2]);if(re+=(O||f?"var rv = ":"")+"invoker(fn"+(Z.length>0?", ":"")+Z+`);
`,g)re+=`runDestructors(destructors);
`;else for(var M=2;M<d.length;++M){var De=M===1?"thisWired":"arg"+(M-2)+"Wired";d[M].destructorFunction!==null&&(re+=De+"_dtor("+De+"); // "+d[M].name+`
`,xe.push(De+"_dtor"),Pe.push(d[M].destructorFunction))}return O&&(re+=`var ret = retType.fromWireType(rv);
return ret;
`),re+=`}
`,xe.push(re),Ot(Function,xe).apply(null,Pe)}var Dt=(c,d,_)=>{if(c[d].overloadTable===void 0){var i=c[d];c[d]=function(){return c[d].overloadTable.hasOwnProperty(arguments.length)||Zt(`Function '${_}' called with an invalid number of arguments (${arguments.length}) - expects one of (${c[d].overloadTable})!`),c[d].overloadTable[arguments.length].apply(this,arguments)},c[d].overloadTable=[],c[d].overloadTable[i.argCount]=i}},at=(c,d,_)=>{t.hasOwnProperty(c)?((_===void 0||t[c].overloadTable!==void 0&&t[c].overloadTable[_]!==void 0)&&Zt(`Cannot register public name '${c}' twice`),Dt(t,c,c),t.hasOwnProperty(_)&&Zt(`Cannot register multiple overloads of a function with the same number of arguments (${_})!`),t[c].overloadTable[_]=d):(t[c]=d,_!==void 0&&(t[c].numArguments=_))},kt=(c,d)=>{for(var _=[],i=0;i<c;i++)_.push(te[d+i*4>>2]);return _},St=(c,d,_)=>{t.hasOwnProperty(c)||$t("Replacing nonexistant public symbol"),t[c].overloadTable!==void 0&&_!==void 0?t[c].overloadTable[_]=d:(t[c]=d,t[c].argCount=_)},hn=(c,d,_)=>{B("dynCall_"+c in t,`bad function pointer type - dynCall function not found for sig '${c}'`),_&&_.length?B(_.length===c.substring(1).replace(/j/g,"--").length):B(c.length==1);var i=t["dynCall_"+c];return _&&_.length?i.apply(null,[d].concat(_)):i.call(null,d)},Nn=[],Wt,rn=c=>{var d=Nn[c];return d||(c>=Nn.length&&(Nn.length=c+1),Nn[c]=d=Wt.get(c)),B(Wt.get(c)==d,"JavaScript-side Wasm function table mirror is out of date!"),d},Lt=(c,d,_)=>{if(c.includes("j"))return hn(c,d,_);B(rn(d),`missing table entry in dynCall: ${d}`);var i=rn(d).apply(null,_);return i},cn=(c,d)=>{B(c.includes("j")||c.includes("p"),"getDynCaller should only be called with i64 sigs");var _=[];return function(){return _.length=0,Object.assign(_,arguments),Lt(c,d,_)}},en=(c,d)=>{c=Yt(c);function _(){return c.includes("j")?cn(c,d):rn(d)}var i=_();return typeof i!="function"&&Zt(`unknown function pointer with signature ${c}: ${d}`),i},qt=(c,d)=>{var _=Mt(d,function(i){this.name=d,this.message=i;var s=new Error(i).stack;s!==void 0&&(this.stack=this.toString()+`
`+s.replace(/^Error(:[^\n]*)?\n/,""))});return _.prototype=Object.create(c.prototype),_.prototype.constructor=_,_.prototype.toString=function(){return this.message===void 0?this.name:`${this.name}: ${this.message}`},_},an,ri=c=>{var d=zl(c),_=Yt(d);return xr(d),_},Cn=(c,d)=>{var _=[],i={};function s(f){if(!i[f]&&!$n[f]){if(er[f]){er[f].forEach(s);return}_.push(f),i[f]=!0}}throw d.forEach(s),new an(`${c}: `+_.map(ri).join([", "]))},Zs=c=>{c=c.trim();const d=c.indexOf("(");return d!==-1?(B(c[c.length-1]==")","Parentheses for argument names should match."),c.substr(0,d)):c},wi=(c,d,_,i,s,f,h)=>{var g=kt(d,_);c=Yt(c),c=Zs(c),s=en(i,s),at(c,function(){Cn(`Cannot call ${c} due to unbound types`,g)},d-1),Mi([],g,function(M){var O=[M[0],null].concat(M.slice(1));return St(c,Ht(c,O,null,s,f,h),d-1),[]})},Js=(c,d,_)=>{switch(d){case 1:return _?i=>Y[i>>0]:i=>K[i>>0];case 2:return _?i=>j[i>>1]:i=>J[i>>1];case 4:return _?i=>ce[i>>2]:i=>te[i>>2];default:throw new TypeError(`invalid integer width (${d}): ${c}`)}},Qi=(c,d,_,i,s)=>{d=Yt(d),s===-1&&(s=4294967295);var f=G=>G;if(i===0){var h=32-8*_;f=G=>G<<h>>>h}var g=d.includes("unsigned"),M=(G,Z)=>{if(typeof G!="number"&&typeof G!="boolean")throw new TypeError(`Cannot convert "${Me(G)}" to ${Z}`);if(G<i||G>s)throw new TypeError(`Passing a number "${Me(G)}" from JS side to C/C++ side to an argument of type "${d}", which is outside the valid range [${i}, ${s}]!`)},O;g?O=function(G,Z){return M(Z,this.name),Z>>>0}:O=function(G,Z){return M(Z,this.name),Z},nn(c,{name:d,fromWireType:f,toWireType:O,argPackAdvance:En,readValueFromPointer:Js(d,_,i!==0),destructorFunction:null})},Ti=(c,d,_)=>{var i=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],s=i[d];function f(h){var g=te[h>>2],M=te[h+4>>2];return new s(Y.buffer,M,g)}_=Yt(_),nn(c,{name:_,fromWireType:f,argPackAdvance:En,readValueFromPointer:f},{ignoreDuplicateRegistrations:!0})};function Qs(c){return this.fromWireType(te[c>>2])}var Ai=(c,d,_,i)=>{if(B(typeof c=="string"),!(i>0))return 0;for(var s=_,f=_+i-1,h=0;h<c.length;++h){var g=c.charCodeAt(h);if(g>=55296&&g<=57343){var M=c.charCodeAt(++h);g=65536+((g&1023)<<10)|M&1023}if(g<=127){if(_>=f)break;d[_++]=g}else if(g<=2047){if(_+1>=f)break;d[_++]=192|g>>6,d[_++]=128|g&63}else if(g<=65535){if(_+2>=f)break;d[_++]=224|g>>12,d[_++]=128|g>>6&63,d[_++]=128|g&63}else{if(_+3>=f)break;g>1114111&&Ge("Invalid Unicode code point "+pe(g)+" encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."),d[_++]=240|g>>18,d[_++]=128|g>>12&63,d[_++]=128|g>>6&63,d[_++]=128|g&63}}return d[_]=0,_-s},el=(c,d,_)=>(B(typeof _=="number","stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),Ai(c,K,d,_)),Ha=c=>{for(var d=0,_=0;_<c.length;++_){var i=c.charCodeAt(_);i<=127?d++:i<=2047?d+=2:i>=55296&&i<=57343?(d+=4,++_):d+=3}return d},Po=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0,ii=(c,d,_)=>{for(var i=d+_,s=d;c[s]&&!(s>=i);)++s;if(s-d>16&&c.buffer&&Po)return Po.decode(c.subarray(d,s));for(var f="";d<s;){var h=c[d++];if(!(h&128)){f+=String.fromCharCode(h);continue}var g=c[d++]&63;if((h&224)==192){f+=String.fromCharCode((h&31)<<6|g);continue}var M=c[d++]&63;if((h&240)==224?h=(h&15)<<12|g<<6|M:((h&248)!=240&&Ge("Invalid UTF-8 leading byte "+pe(h)+" encountered when deserializing a UTF-8 string in wasm memory to a JS string!"),h=(h&7)<<18|g<<12|M<<6|c[d++]&63),h<65536)f+=String.fromCharCode(h);else{var O=h-65536;f+=String.fromCharCode(55296|O>>10,56320|O&1023)}}return f},ai=(c,d)=>(B(typeof c=="number"),c?ii(K,c,d):""),tl=(c,d)=>{d=Yt(d);var _=d==="std::string";nn(c,{name:d,fromWireType(i){var s=te[i>>2],f=i+4,h;if(_)for(var g=f,M=0;M<=s;++M){var O=f+M;if(M==s||K[O]==0){var G=O-g,Z=ai(g,G);h===void 0?h=Z:(h+="\0",h+=Z),g=O+1}}else{for(var re=new Array(s),M=0;M<s;++M)re[M]=String.fromCharCode(K[f+M]);h=re.join("")}return xr(i),h},toWireType(i,s){s instanceof ArrayBuffer&&(s=new Uint8Array(s));var f,h=typeof s=="string";h||s instanceof Uint8Array||s instanceof Uint8ClampedArray||s instanceof Int8Array||Zt("Cannot pass non-string to std::string"),_&&h?f=Ha(s):f=s.length;var g=$o(4+f+1),M=g+4;if(te[g>>2]=f,_&&h)el(s,M,f+1);else if(h)for(var O=0;O<f;++O){var G=s.charCodeAt(O);G>255&&(xr(M),Zt("String has UTF-16 code units that do not fit in 8 bits")),K[M+O]=G}else for(var O=0;O<f;++O)K[M+O]=s[O];return i!==null&&i.push(xr,g),g},argPackAdvance:En,readValueFromPointer:Qs,destructorFunction(i){xr(i)}})},Do=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0,nl=(c,d)=>{B(c%2==0,"Pointer passed to UTF16ToString must be aligned to two bytes!");for(var _=c,i=_>>1,s=i+d/2;!(i>=s)&&J[i];)++i;if(_=i<<1,_-c>32&&Do)return Do.decode(K.subarray(c,_));for(var f="",h=0;!(h>=d/2);++h){var g=j[c+h*2>>1];if(g==0)break;f+=String.fromCharCode(g)}return f},rl=(c,d,_)=>{if(B(d%2==0,"Pointer passed to stringToUTF16 must be aligned to two bytes!"),B(typeof _=="number","stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),_===void 0&&(_=2147483647),_<2)return 0;_-=2;for(var i=d,s=_<c.length*2?_/2:c.length,f=0;f<s;++f){var h=c.charCodeAt(f);j[d>>1]=h,d+=2}return j[d>>1]=0,d-i},ea=c=>c.length*2,Lo=(c,d)=>{B(c%4==0,"Pointer passed to UTF32ToString must be aligned to four bytes!");for(var _=0,i="";!(_>=d/4);){var s=ce[c+_*4>>2];if(s==0)break;if(++_,s>=65536){var f=s-65536;i+=String.fromCharCode(55296|f>>10,56320|f&1023)}else i+=String.fromCharCode(s)}return i},il=(c,d,_)=>{if(B(d%4==0,"Pointer passed to stringToUTF32 must be aligned to four bytes!"),B(typeof _=="number","stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),_===void 0&&(_=2147483647),_<4)return 0;for(var i=d,s=i+_-4,f=0;f<c.length;++f){var h=c.charCodeAt(f);if(h>=55296&&h<=57343){var g=c.charCodeAt(++f);h=65536+((h&1023)<<10)|g&1023}if(ce[d>>2]=h,d+=4,d+4>s)break}return ce[d>>2]=0,d-i},ta=c=>{for(var d=0,_=0;_<c.length;++_){var i=c.charCodeAt(_);i>=55296&&i<=57343&&++_,d+=4}return d},Fo=(c,d,_)=>{_=Yt(_);var i,s,f,h,g;d===2?(i=nl,s=rl,h=ea,f=()=>J,g=1):d===4&&(i=Lo,s=il,h=ta,f=()=>te,g=2),nn(c,{name:_,fromWireType:M=>{for(var O=te[M>>2],G=f(),Z,re=M+4,se=0;se<=O;++se){var xe=M+4+se*d;if(se==O||G[xe>>g]==0){var Pe=xe-re,De=i(re,Pe);Z===void 0?Z=De:(Z+="\0",Z+=De),re=xe+d}}return xr(M),Z},toWireType:(M,O)=>{typeof O!="string"&&Zt(`Cannot pass non-string to C++ string type ${_}`);var G=h(O),Z=$o(4+G+d);return te[Z>>2]=G>>g,s(O,Z+4,G+d),M!==null&&M.push(xr,Z),Z},argPackAdvance:En,readValueFromPointer:dn,destructorFunction(M){xr(M)}})},Io=(c,d,_,i,s,f)=>{Et[c]={name:Yt(d),rawConstructor:en(_,i),rawDestructor:en(s,f),fields:[]}},al=(c,d,_,i,s,f,h,g,M,O)=>{Et[c].fields.push({fieldName:Yt(d),getterReturnType:_,getter:en(i,s),getterContext:f,setterArgumentType:h,setter:en(g,M),setterContext:O})},ol=(c,d)=>{d=Yt(d),nn(c,{isVoid:!0,name:d,argPackAdvance:0,fromWireType:()=>{},toWireType:(_,i)=>{}})},tr=()=>{throw 1/0},sl=c=>{c>4&&(Q.get(c).refcount+=1)},Uo={},No=c=>{var d=Uo[c];return d===void 0?Yt(c):d},Oo=c=>ye.toHandle(No(c)),ll=(c,d)=>{var _=$n[c];return _===void 0&&Zt(d+" has unknown type "+ri(c)),_},Va=(c,d)=>{c=ll(c,"_emval_take_value");var _=c.readValueFromPointer(d);return ye.toHandle(_)},nr=()=>{N("native code called abort()")},Wa=(c,d,_)=>K.copyWithin(c,d,d+_),cl=()=>2147483648,fl=c=>{var d=P.buffer,_=(c-d.byteLength+65535)/65536;try{return P.grow(_),$e(),1}catch(i){L(`growMemory: Attempted to grow heap from ${d.byteLength} bytes to ${c} bytes, but got error: ${i}`)}},Mn=c=>{var d=K.length;c>>>=0,B(c>d);var _=cl();if(c>_)return L(`Cannot enlarge memory, requested ${c} bytes, but the limit is ${_} bytes!`),!1;for(var i=(M,O)=>M+(O-M%O)%O,s=1;s<=4;s*=2){var f=d*(1+.2/s);f=Math.min(f,c+100663296);var h=Math.min(_,i(Math.max(c,f),65536)),g=fl(h);if(g)return!0}return L(`Failed to grow the heap from ${d} bytes to ${h} bytes, not enough memory!`),!1},Xa={},ul=()=>u||"./this.program",Ci=()=>{if(!Ci.strings){var c=(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",d={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:c,_:ul()};for(var _ in Xa)Xa[_]===void 0?delete d[_]:d[_]=Xa[_];var i=[];for(var _ in d)i.push(`${_}=${d[_]}`);Ci.strings=i}return Ci.strings},dl=(c,d)=>{for(var _=0;_<c.length;++_)B(c.charCodeAt(_)===(c.charCodeAt(_)&255)),Y[d++>>0]=c.charCodeAt(_);Y[d>>0]=0},At={isAbs:c=>c.charAt(0)==="/",splitPath:c=>{var d=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return d.exec(c).slice(1)},normalizeArray:(c,d)=>{for(var _=0,i=c.length-1;i>=0;i--){var s=c[i];s==="."?c.splice(i,1):s===".."?(c.splice(i,1),_++):_&&(c.splice(i,1),_--)}if(d)for(;_;_--)c.unshift("..");return c},normalize:c=>{var d=At.isAbs(c),_=c.substr(-1)==="/";return c=At.normalizeArray(c.split("/").filter(i=>!!i),!d).join("/"),!c&&!d&&(c="."),c&&_&&(c+="/"),(d?"/":"")+c},dirname:c=>{var d=At.splitPath(c),_=d[0],i=d[1];return!_&&!i?".":(i&&(i=i.substr(0,i.length-1)),_+i)},basename:c=>{if(c==="/")return"/";c=At.normalize(c),c=c.replace(/\/$/,"");var d=c.lastIndexOf("/");return d===-1?c:c.substr(d+1)},join:function(){var c=Array.prototype.slice.call(arguments);return At.normalize(c.join("/"))},join2:(c,d)=>At.normalize(c+"/"+d)},hl=()=>{if(typeof crypto=="object"&&typeof crypto.getRandomValues=="function")return i=>crypto.getRandomValues(i);if(x)try{var c=V("crypto"),d=c.randomFillSync;if(d)return i=>c.randomFillSync(i);var _=c.randomBytes;return i=>(i.set(_(i.byteLength)),i)}catch{}N("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };")},na=c=>(na=hl())(c),rr={resolve:function(){for(var c="",d=!1,_=arguments.length-1;_>=-1&&!d;_--){var i=_>=0?arguments[_]:R.cwd();if(typeof i!="string")throw new TypeError("Arguments to path.resolve must be strings");if(!i)return"";c=i+"/"+c,d=At.isAbs(i)}return c=At.normalizeArray(c.split("/").filter(s=>!!s),!d).join("/"),(d?"/":"")+c||"."},relative:(c,d)=>{c=rr.resolve(c).substr(1),d=rr.resolve(d).substr(1);function _(O){for(var G=0;G<O.length&&O[G]==="";G++);for(var Z=O.length-1;Z>=0&&O[Z]==="";Z--);return G>Z?[]:O.slice(G,Z-G+1)}for(var i=_(c.split("/")),s=_(d.split("/")),f=Math.min(i.length,s.length),h=f,g=0;g<f;g++)if(i[g]!==s[g]){h=g;break}for(var M=[],g=h;g<i.length;g++)M.push("..");return M=M.concat(s.slice(h)),M.join("/")}},$a=[];function ra(c,d,_){var i=Ha(c)+1,s=new Array(i),f=Ai(c,s,0,s.length);return d&&(s.length=f),s}var pl=()=>{if(!$a.length){var c=null;if(x){var d=256,_=Buffer.alloc(d),i=0,s=process.stdin.fd;try{i=X.readSync(s,_)}catch(f){if(f.toString().includes("EOF"))i=0;else throw f}i>0?c=_.slice(0,i).toString("utf-8"):c=null}else typeof window<"u"&&typeof window.prompt=="function"?(c=window.prompt("Input: "),c!==null&&(c+=`
`)):typeof readline=="function"&&(c=readline(),c!==null&&(c+=`
`));if(!c)return null;$a=ra(c,!0)}return $a.shift()},vr={ttys:[],init(){},shutdown(){},register(c,d){vr.ttys[c]={input:[],output:[],ops:d},R.registerDevice(c,vr.stream_ops)},stream_ops:{open(c){var d=vr.ttys[c.node.rdev];if(!d)throw new R.ErrnoError(43);c.tty=d,c.seekable=!1},close(c){c.tty.ops.fsync(c.tty)},fsync(c){c.tty.ops.fsync(c.tty)},read(c,d,_,i,s){if(!c.tty||!c.tty.ops.get_char)throw new R.ErrnoError(60);for(var f=0,h=0;h<i;h++){var g;try{g=c.tty.ops.get_char(c.tty)}catch{throw new R.ErrnoError(29)}if(g===void 0&&f===0)throw new R.ErrnoError(6);if(g==null)break;f++,d[_+h]=g}return f&&(c.node.timestamp=Date.now()),f},write(c,d,_,i,s){if(!c.tty||!c.tty.ops.put_char)throw new R.ErrnoError(60);try{for(var f=0;f<i;f++)c.tty.ops.put_char(c.tty,d[_+f])}catch{throw new R.ErrnoError(29)}return i&&(c.node.timestamp=Date.now()),f}},default_tty_ops:{get_char(c){return pl()},put_char(c,d){d===null||d===10?(C(ii(c.output,0)),c.output=[]):d!=0&&c.output.push(d)},fsync(c){c.output&&c.output.length>0&&(C(ii(c.output,0)),c.output=[])},ioctl_tcgets(c){return{c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(c,d,_){return 0},ioctl_tiocgwinsz(c){return[24,80]}},default_tty1_ops:{put_char(c,d){d===null||d===10?(L(ii(c.output,0)),c.output=[]):d!=0&&c.output.push(d)},fsync(c){c.output&&c.output.length>0&&(L(ii(c.output,0)),c.output=[])}}},ko=c=>{N("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported")},ut={ops_table:null,mount(c){return ut.createNode(null,"/",16895,0)},createNode(c,d,_,i){if(R.isBlkdev(_)||R.isFIFO(_))throw new R.ErrnoError(63);ut.ops_table||(ut.ops_table={dir:{node:{getattr:ut.node_ops.getattr,setattr:ut.node_ops.setattr,lookup:ut.node_ops.lookup,mknod:ut.node_ops.mknod,rename:ut.node_ops.rename,unlink:ut.node_ops.unlink,rmdir:ut.node_ops.rmdir,readdir:ut.node_ops.readdir,symlink:ut.node_ops.symlink},stream:{llseek:ut.stream_ops.llseek}},file:{node:{getattr:ut.node_ops.getattr,setattr:ut.node_ops.setattr},stream:{llseek:ut.stream_ops.llseek,read:ut.stream_ops.read,write:ut.stream_ops.write,allocate:ut.stream_ops.allocate,mmap:ut.stream_ops.mmap,msync:ut.stream_ops.msync}},link:{node:{getattr:ut.node_ops.getattr,setattr:ut.node_ops.setattr,readlink:ut.node_ops.readlink},stream:{}},chrdev:{node:{getattr:ut.node_ops.getattr,setattr:ut.node_ops.setattr},stream:R.chrdev_stream_ops}});var s=R.createNode(c,d,_,i);return R.isDir(s.mode)?(s.node_ops=ut.ops_table.dir.node,s.stream_ops=ut.ops_table.dir.stream,s.contents={}):R.isFile(s.mode)?(s.node_ops=ut.ops_table.file.node,s.stream_ops=ut.ops_table.file.stream,s.usedBytes=0,s.contents=null):R.isLink(s.mode)?(s.node_ops=ut.ops_table.link.node,s.stream_ops=ut.ops_table.link.stream):R.isChrdev(s.mode)&&(s.node_ops=ut.ops_table.chrdev.node,s.stream_ops=ut.ops_table.chrdev.stream),s.timestamp=Date.now(),c&&(c.contents[d]=s,c.timestamp=s.timestamp),s},getFileDataAsTypedArray(c){return c.contents?c.contents.subarray?c.contents.subarray(0,c.usedBytes):new Uint8Array(c.contents):new Uint8Array(0)},expandFileStorage(c,d){var _=c.contents?c.contents.length:0;if(!(_>=d)){var i=1024*1024;d=Math.max(d,_*(_<i?2:1.125)>>>0),_!=0&&(d=Math.max(d,256));var s=c.contents;c.contents=new Uint8Array(d),c.usedBytes>0&&c.contents.set(s.subarray(0,c.usedBytes),0)}},resizeFileStorage(c,d){if(c.usedBytes!=d)if(d==0)c.contents=null,c.usedBytes=0;else{var _=c.contents;c.contents=new Uint8Array(d),_&&c.contents.set(_.subarray(0,Math.min(d,c.usedBytes))),c.usedBytes=d}},node_ops:{getattr(c){var d={};return d.dev=R.isChrdev(c.mode)?c.id:1,d.ino=c.id,d.mode=c.mode,d.nlink=1,d.uid=0,d.gid=0,d.rdev=c.rdev,R.isDir(c.mode)?d.size=4096:R.isFile(c.mode)?d.size=c.usedBytes:R.isLink(c.mode)?d.size=c.link.length:d.size=0,d.atime=new Date(c.timestamp),d.mtime=new Date(c.timestamp),d.ctime=new Date(c.timestamp),d.blksize=4096,d.blocks=Math.ceil(d.size/d.blksize),d},setattr(c,d){d.mode!==void 0&&(c.mode=d.mode),d.timestamp!==void 0&&(c.timestamp=d.timestamp),d.size!==void 0&&ut.resizeFileStorage(c,d.size)},lookup(c,d){throw R.genericErrors[44]},mknod(c,d,_,i){return ut.createNode(c,d,_,i)},rename(c,d,_){if(R.isDir(c.mode)){var i;try{i=R.lookupNode(d,_)}catch{}if(i)for(var s in i.contents)throw new R.ErrnoError(55)}delete c.parent.contents[c.name],c.parent.timestamp=Date.now(),c.name=_,d.contents[_]=c,d.timestamp=c.parent.timestamp,c.parent=d},unlink(c,d){delete c.contents[d],c.timestamp=Date.now()},rmdir(c,d){var _=R.lookupNode(c,d);for(var i in _.contents)throw new R.ErrnoError(55);delete c.contents[d],c.timestamp=Date.now()},readdir(c){var d=[".",".."];for(var _ in c.contents)c.contents.hasOwnProperty(_)&&d.push(_);return d},symlink(c,d,_){var i=ut.createNode(c,d,41471,0);return i.link=_,i},readlink(c){if(!R.isLink(c.mode))throw new R.ErrnoError(28);return c.link}},stream_ops:{read(c,d,_,i,s){var f=c.node.contents;if(s>=c.node.usedBytes)return 0;var h=Math.min(c.node.usedBytes-s,i);if(B(h>=0),h>8&&f.subarray)d.set(f.subarray(s,s+h),_);else for(var g=0;g<h;g++)d[_+g]=f[s+g];return h},write(c,d,_,i,s,f){if(B(!(d instanceof ArrayBuffer)),d.buffer===Y.buffer&&(f=!1),!i)return 0;var h=c.node;if(h.timestamp=Date.now(),d.subarray&&(!h.contents||h.contents.subarray)){if(f)return B(s===0,"canOwn must imply no weird position inside the file"),h.contents=d.subarray(_,_+i),h.usedBytes=i,i;if(h.usedBytes===0&&s===0)return h.contents=d.slice(_,_+i),h.usedBytes=i,i;if(s+i<=h.usedBytes)return h.contents.set(d.subarray(_,_+i),s),i}if(ut.expandFileStorage(h,s+i),h.contents.subarray&&d.subarray)h.contents.set(d.subarray(_,_+i),s);else for(var g=0;g<i;g++)h.contents[s+g]=d[_+g];return h.usedBytes=Math.max(h.usedBytes,s+i),i},llseek(c,d,_){var i=d;if(_===1?i+=c.position:_===2&&R.isFile(c.node.mode)&&(i+=c.node.usedBytes),i<0)throw new R.ErrnoError(28);return i},allocate(c,d,_){ut.expandFileStorage(c.node,d+_),c.node.usedBytes=Math.max(c.node.usedBytes,d+_)},mmap(c,d,_,i,s){if(!R.isFile(c.node.mode))throw new R.ErrnoError(43);var f,h,g=c.node.contents;if(!(s&2)&&g.buffer===Y.buffer)h=!1,f=g.byteOffset;else{if((_>0||_+d<g.length)&&(g.subarray?g=g.subarray(_,_+d):g=Array.prototype.slice.call(g,_,_+d)),h=!0,f=ko(),!f)throw new R.ErrnoError(48);Y.set(g,f)}return{ptr:f,allocated:h}},msync(c,d,_,i,s){return ut.stream_ops.write(c,d,0,i,_,!1),0}}},ml=(c,d,_,i)=>{var s=yt(`al ${c}`);F(c,f=>{B(f,`Loading data file "${c}" failed (no arrayBuffer).`),d(new Uint8Array(f)),s&&tt(s)},f=>{if(_)_();else throw`Loading data file "${c}" failed.`}),s&&Ye(s)},_l=(c,d,_,i,s,f)=>R.createDataFile(c,d,_,i,s,f),gl=t.preloadPlugins||[],vl=(c,d,_,i)=>{typeof Browser<"u"&&Browser.init();var s=!1;return gl.forEach(f=>{s||f.canHandle(d)&&(f.handle(c,d,_,i),s=!0)}),s},xl=(c,d,_,i,s,f,h,g,M,O)=>{var G=d?rr.resolve(At.join2(c,d)):c,Z=yt(`cp ${G}`);function re(se){function xe(Pe){O&&O(),g||_l(c,d,Pe,i,s,M),f&&f(),tt(Z)}vl(se,G,xe,()=>{h&&h(),tt(Z)})||xe(se)}Ye(Z),typeof _=="string"?ml(_,se=>re(se),h):re(_)},Bo=c=>{var d={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090},_=d[c];if(typeof _>"u")throw new Error(`Unknown file open mode: ${c}`);return _},qa=(c,d)=>{var _=0;return c&&(_|=365),d&&(_|=146),_},yl={0:"Success",1:"Arg list too long",2:"Permission denied",3:"Address already in use",4:"Address not available",5:"Address family not supported by protocol family",6:"No more processes",7:"Socket already connected",8:"Bad file number",9:"Trying to read unreadable message",10:"Mount device busy",11:"Operation canceled",12:"No children",13:"Connection aborted",14:"Connection refused",15:"Connection reset by peer",16:"File locking deadlock error",17:"Destination address required",18:"Math arg out of domain of func",19:"Quota exceeded",20:"File exists",21:"Bad address",22:"File too large",23:"Host is unreachable",24:"Identifier removed",25:"Illegal byte sequence",26:"Connection already in progress",27:"Interrupted system call",28:"Invalid argument",29:"I/O error",30:"Socket is already connected",31:"Is a directory",32:"Too many symbolic links",33:"Too many open files",34:"Too many links",35:"Message too long",36:"Multihop attempted",37:"File or path name too long",38:"Network interface is not configured",39:"Connection reset by network",40:"Network is unreachable",41:"Too many open files in system",42:"No buffer space available",43:"No such device",44:"No such file or directory",45:"Exec format error",46:"No record locks available",47:"The link has been severed",48:"Not enough core",49:"No message of desired type",50:"Protocol not available",51:"No space left on device",52:"Function not implemented",53:"Socket is not connected",54:"Not a directory",55:"Directory not empty",56:"State not recoverable",57:"Socket operation on non-socket",59:"Not a typewriter",60:"No such device or address",61:"Value too large for defined data type",62:"Previous owner died",63:"Not super-user",64:"Broken pipe",65:"Protocol error",66:"Unknown protocol",67:"Protocol wrong type for socket",68:"Math result not representable",69:"Read only file system",70:"Illegal seek",71:"No such process",72:"Stale file handle",73:"Connection timed out",74:"Text file busy",75:"Cross-device link",100:"Device not a stream",101:"Bad font file fmt",102:"Invalid slot",103:"Invalid request code",104:"No anode",105:"Block device required",106:"Channel number out of range",107:"Level 3 halted",108:"Level 3 reset",109:"Link number out of range",110:"Protocol driver not attached",111:"No CSI structure available",112:"Level 2 halted",113:"Invalid exchange",114:"Invalid request descriptor",115:"Exchange full",116:"No data (for no delay io)",117:"Timer expired",118:"Out of streams resources",119:"Machine is not on the network",120:"Package not installed",121:"The object is remote",122:"Advertise error",123:"Srmount error",124:"Communication error on send",125:"Cross mount point (not really error)",126:"Given log. name not unique",127:"f.d. invalid for this operation",128:"Remote address changed",129:"Can   access a needed shared lib",130:"Accessing a corrupted shared lib",131:".lib section in a.out corrupted",132:"Attempting to link in too many libs",133:"Attempting to exec a shared library",135:"Streams pipe error",136:"Too many users",137:"Socket type not supported",138:"Not supported",139:"Protocol family not supported",140:"Can't send after socket shutdown",141:"Too many references",142:"Host is down",148:"No medium (in tape drive)",156:"Level 2 not synchronized"},Ya={},Sl=c=>(Ge("warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling"),c),bl=c=>{var d=/\b_Z[\w\d_]+/g;return c.replace(d,function(_){var i=Sl(_);return _===i?_:i+" ["+_+"]"})},R={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:!1,ignorePermissions:!0,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath(c,d={}){if(c=rr.resolve(c),!c)return{path:"",node:null};var _={follow_mount:!0,recurse_count:0};if(d=Object.assign(_,d),d.recurse_count>8)throw new R.ErrnoError(32);for(var i=c.split("/").filter(Z=>!!Z),s=R.root,f="/",h=0;h<i.length;h++){var g=h===i.length-1;if(g&&d.parent)break;if(s=R.lookupNode(s,i[h]),f=At.join2(f,i[h]),R.isMountpoint(s)&&(!g||g&&d.follow_mount)&&(s=s.mounted.root),!g||d.follow)for(var M=0;R.isLink(s.mode);){var O=R.readlink(f);f=rr.resolve(At.dirname(f),O);var G=R.lookupPath(f,{recurse_count:d.recurse_count+1});if(s=G.node,M++>40)throw new R.ErrnoError(32)}}return{path:f,node:s}},getPath(c){for(var d;;){if(R.isRoot(c)){var _=c.mount.mountpoint;return d?_[_.length-1]!=="/"?`${_}/${d}`:_+d:_}d=d?`${c.name}/${d}`:c.name,c=c.parent}},hashName(c,d){for(var _=0,i=0;i<d.length;i++)_=(_<<5)-_+d.charCodeAt(i)|0;return(c+_>>>0)%R.nameTable.length},hashAddNode(c){var d=R.hashName(c.parent.id,c.name);c.name_next=R.nameTable[d],R.nameTable[d]=c},hashRemoveNode(c){var d=R.hashName(c.parent.id,c.name);if(R.nameTable[d]===c)R.nameTable[d]=c.name_next;else for(var _=R.nameTable[d];_;){if(_.name_next===c){_.name_next=c.name_next;break}_=_.name_next}},lookupNode(c,d){var _=R.mayLookup(c);if(_)throw new R.ErrnoError(_,c);for(var i=R.hashName(c.id,d),s=R.nameTable[i];s;s=s.name_next){var f=s.name;if(s.parent.id===c.id&&f===d)return s}return R.lookup(c,d)},createNode(c,d,_,i){B(typeof c=="object");var s=new R.FSNode(c,d,_,i);return R.hashAddNode(s),s},destroyNode(c){R.hashRemoveNode(c)},isRoot(c){return c===c.parent},isMountpoint(c){return!!c.mounted},isFile(c){return(c&61440)===32768},isDir(c){return(c&61440)===16384},isLink(c){return(c&61440)===40960},isChrdev(c){return(c&61440)===8192},isBlkdev(c){return(c&61440)===24576},isFIFO(c){return(c&61440)===4096},isSocket(c){return(c&49152)===49152},flagsToPermissionString(c){var d=["r","w","rw"][c&3];return c&512&&(d+="w"),d},nodePermissions(c,d){return R.ignorePermissions?0:d.includes("r")&&!(c.mode&292)||d.includes("w")&&!(c.mode&146)||d.includes("x")&&!(c.mode&73)?2:0},mayLookup(c){var d=R.nodePermissions(c,"x");return d||(c.node_ops.lookup?0:2)},mayCreate(c,d){try{var _=R.lookupNode(c,d);return 20}catch{}return R.nodePermissions(c,"wx")},mayDelete(c,d,_){var i;try{i=R.lookupNode(c,d)}catch(f){return f.errno}var s=R.nodePermissions(c,"wx");if(s)return s;if(_){if(!R.isDir(i.mode))return 54;if(R.isRoot(i)||R.getPath(i)===R.cwd())return 10}else if(R.isDir(i.mode))return 31;return 0},mayOpen(c,d){return c?R.isLink(c.mode)?32:R.isDir(c.mode)&&(R.flagsToPermissionString(d)!=="r"||d&512)?31:R.nodePermissions(c,R.flagsToPermissionString(d)):44},MAX_OPEN_FDS:4096,nextfd(){for(var c=0;c<=R.MAX_OPEN_FDS;c++)if(!R.streams[c])return c;throw new R.ErrnoError(33)},getStreamChecked(c){var d=R.getStream(c);if(!d)throw new R.ErrnoError(8);return d},getStream:c=>R.streams[c],createStream(c,d=-1){return R.FSStream||(R.FSStream=function(){this.shared={}},R.FSStream.prototype={},Object.defineProperties(R.FSStream.prototype,{object:{get(){return this.node},set(_){this.node=_}},isRead:{get(){return(this.flags&2097155)!==1}},isWrite:{get(){return(this.flags&2097155)!==0}},isAppend:{get(){return this.flags&1024}},flags:{get(){return this.shared.flags},set(_){this.shared.flags=_}},position:{get(){return this.shared.position},set(_){this.shared.position=_}}})),c=Object.assign(new R.FSStream,c),d==-1&&(d=R.nextfd()),c.fd=d,R.streams[d]=c,c},closeStream(c){R.streams[c]=null},chrdev_stream_ops:{open(c){var d=R.getDevice(c.node.rdev);c.stream_ops=d.stream_ops,c.stream_ops.open&&c.stream_ops.open(c)},llseek(){throw new R.ErrnoError(70)}},major:c=>c>>8,minor:c=>c&255,makedev:(c,d)=>c<<8|d,registerDevice(c,d){R.devices[c]={stream_ops:d}},getDevice:c=>R.devices[c],getMounts(c){for(var d=[],_=[c];_.length;){var i=_.pop();d.push(i),_.push.apply(_,i.mounts)}return d},syncfs(c,d){typeof c=="function"&&(d=c,c=!1),R.syncFSRequests++,R.syncFSRequests>1&&L(`warning: ${R.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);var _=R.getMounts(R.root.mount),i=0;function s(h){return B(R.syncFSRequests>0),R.syncFSRequests--,d(h)}function f(h){if(h)return f.errored?void 0:(f.errored=!0,s(h));++i>=_.length&&s(null)}_.forEach(h=>{if(!h.type.syncfs)return f(null);h.type.syncfs(h,c,f)})},mount(c,d,_){if(typeof c=="string")throw c;var i=_==="/",s=!_,f;if(i&&R.root)throw new R.ErrnoError(10);if(!i&&!s){var h=R.lookupPath(_,{follow_mount:!1});if(_=h.path,f=h.node,R.isMountpoint(f))throw new R.ErrnoError(10);if(!R.isDir(f.mode))throw new R.ErrnoError(54)}var g={type:c,opts:d,mountpoint:_,mounts:[]},M=c.mount(g);return M.mount=g,g.root=M,i?R.root=M:f&&(f.mounted=g,f.mount&&f.mount.mounts.push(g)),M},unmount(c){var d=R.lookupPath(c,{follow_mount:!1});if(!R.isMountpoint(d.node))throw new R.ErrnoError(28);var _=d.node,i=_.mounted,s=R.getMounts(i);Object.keys(R.nameTable).forEach(h=>{for(var g=R.nameTable[h];g;){var M=g.name_next;s.includes(g.mount)&&R.destroyNode(g),g=M}}),_.mounted=null;var f=_.mount.mounts.indexOf(i);B(f!==-1),_.mount.mounts.splice(f,1)},lookup(c,d){return c.node_ops.lookup(c,d)},mknod(c,d,_){var i=R.lookupPath(c,{parent:!0}),s=i.node,f=At.basename(c);if(!f||f==="."||f==="..")throw new R.ErrnoError(28);var h=R.mayCreate(s,f);if(h)throw new R.ErrnoError(h);if(!s.node_ops.mknod)throw new R.ErrnoError(63);return s.node_ops.mknod(s,f,d,_)},create(c,d){return d=d!==void 0?d:438,d&=4095,d|=32768,R.mknod(c,d,0)},mkdir(c,d){return d=d!==void 0?d:511,d&=1023,d|=16384,R.mknod(c,d,0)},mkdirTree(c,d){for(var _=c.split("/"),i="",s=0;s<_.length;++s)if(_[s]){i+="/"+_[s];try{R.mkdir(i,d)}catch(f){if(f.errno!=20)throw f}}},mkdev(c,d,_){return typeof _>"u"&&(_=d,d=438),d|=8192,R.mknod(c,d,_)},symlink(c,d){if(!rr.resolve(c))throw new R.ErrnoError(44);var _=R.lookupPath(d,{parent:!0}),i=_.node;if(!i)throw new R.ErrnoError(44);var s=At.basename(d),f=R.mayCreate(i,s);if(f)throw new R.ErrnoError(f);if(!i.node_ops.symlink)throw new R.ErrnoError(63);return i.node_ops.symlink(i,s,c)},rename(c,d){var _=At.dirname(c),i=At.dirname(d),s=At.basename(c),f=At.basename(d),h,g,M;if(h=R.lookupPath(c,{parent:!0}),g=h.node,h=R.lookupPath(d,{parent:!0}),M=h.node,!g||!M)throw new R.ErrnoError(44);if(g.mount!==M.mount)throw new R.ErrnoError(75);var O=R.lookupNode(g,s),G=rr.relative(c,i);if(G.charAt(0)!==".")throw new R.ErrnoError(28);if(G=rr.relative(d,_),G.charAt(0)!==".")throw new R.ErrnoError(55);var Z;try{Z=R.lookupNode(M,f)}catch{}if(O!==Z){var re=R.isDir(O.mode),se=R.mayDelete(g,s,re);if(se)throw new R.ErrnoError(se);if(se=Z?R.mayDelete(M,f,re):R.mayCreate(M,f),se)throw new R.ErrnoError(se);if(!g.node_ops.rename)throw new R.ErrnoError(63);if(R.isMountpoint(O)||Z&&R.isMountpoint(Z))throw new R.ErrnoError(10);if(M!==g&&(se=R.nodePermissions(g,"w"),se))throw new R.ErrnoError(se);R.hashRemoveNode(O);try{g.node_ops.rename(O,M,f)}catch(xe){throw xe}finally{R.hashAddNode(O)}}},rmdir(c){var d=R.lookupPath(c,{parent:!0}),_=d.node,i=At.basename(c),s=R.lookupNode(_,i),f=R.mayDelete(_,i,!0);if(f)throw new R.ErrnoError(f);if(!_.node_ops.rmdir)throw new R.ErrnoError(63);if(R.isMountpoint(s))throw new R.ErrnoError(10);_.node_ops.rmdir(_,i),R.destroyNode(s)},readdir(c){var d=R.lookupPath(c,{follow:!0}),_=d.node;if(!_.node_ops.readdir)throw new R.ErrnoError(54);return _.node_ops.readdir(_)},unlink(c){var d=R.lookupPath(c,{parent:!0}),_=d.node;if(!_)throw new R.ErrnoError(44);var i=At.basename(c),s=R.lookupNode(_,i),f=R.mayDelete(_,i,!1);if(f)throw new R.ErrnoError(f);if(!_.node_ops.unlink)throw new R.ErrnoError(63);if(R.isMountpoint(s))throw new R.ErrnoError(10);_.node_ops.unlink(_,i),R.destroyNode(s)},readlink(c){var d=R.lookupPath(c),_=d.node;if(!_)throw new R.ErrnoError(44);if(!_.node_ops.readlink)throw new R.ErrnoError(28);return rr.resolve(R.getPath(_.parent),_.node_ops.readlink(_))},stat(c,d){var _=R.lookupPath(c,{follow:!d}),i=_.node;if(!i)throw new R.ErrnoError(44);if(!i.node_ops.getattr)throw new R.ErrnoError(63);return i.node_ops.getattr(i)},lstat(c){return R.stat(c,!0)},chmod(c,d,_){var i;if(typeof c=="string"){var s=R.lookupPath(c,{follow:!_});i=s.node}else i=c;if(!i.node_ops.setattr)throw new R.ErrnoError(63);i.node_ops.setattr(i,{mode:d&4095|i.mode&-4096,timestamp:Date.now()})},lchmod(c,d){R.chmod(c,d,!0)},fchmod(c,d){var _=R.getStreamChecked(c);R.chmod(_.node,d)},chown(c,d,_,i){var s;if(typeof c=="string"){var f=R.lookupPath(c,{follow:!i});s=f.node}else s=c;if(!s.node_ops.setattr)throw new R.ErrnoError(63);s.node_ops.setattr(s,{timestamp:Date.now()})},lchown(c,d,_){R.chown(c,d,_,!0)},fchown(c,d,_){var i=R.getStreamChecked(c);R.chown(i.node,d,_)},truncate(c,d){if(d<0)throw new R.ErrnoError(28);var _;if(typeof c=="string"){var i=R.lookupPath(c,{follow:!0});_=i.node}else _=c;if(!_.node_ops.setattr)throw new R.ErrnoError(63);if(R.isDir(_.mode))throw new R.ErrnoError(31);if(!R.isFile(_.mode))throw new R.ErrnoError(28);var s=R.nodePermissions(_,"w");if(s)throw new R.ErrnoError(s);_.node_ops.setattr(_,{size:d,timestamp:Date.now()})},ftruncate(c,d){var _=R.getStreamChecked(c);if((_.flags&2097155)===0)throw new R.ErrnoError(28);R.truncate(_.node,d)},utime(c,d,_){var i=R.lookupPath(c,{follow:!0}),s=i.node;s.node_ops.setattr(s,{timestamp:Math.max(d,_)})},open(c,d,_){if(c==="")throw new R.ErrnoError(44);d=typeof d=="string"?Bo(d):d,_=typeof _>"u"?438:_,d&64?_=_&4095|32768:_=0;var i;if(typeof c=="object")i=c;else{c=At.normalize(c);try{var s=R.lookupPath(c,{follow:!(d&131072)});i=s.node}catch{}}var f=!1;if(d&64)if(i){if(d&128)throw new R.ErrnoError(20)}else i=R.mknod(c,_,0),f=!0;if(!i)throw new R.ErrnoError(44);if(R.isChrdev(i.mode)&&(d&=-513),d&65536&&!R.isDir(i.mode))throw new R.ErrnoError(54);if(!f){var h=R.mayOpen(i,d);if(h)throw new R.ErrnoError(h)}d&512&&!f&&R.truncate(i,0),d&=-131713;var g=R.createStream({node:i,path:R.getPath(i),flags:d,seekable:!0,position:0,stream_ops:i.stream_ops,ungotten:[],error:!1});return g.stream_ops.open&&g.stream_ops.open(g),t.logReadFiles&&!(d&1)&&(R.readFiles||(R.readFiles={}),c in R.readFiles||(R.readFiles[c]=1)),g},close(c){if(R.isClosed(c))throw new R.ErrnoError(8);c.getdents&&(c.getdents=null);try{c.stream_ops.close&&c.stream_ops.close(c)}catch(d){throw d}finally{R.closeStream(c.fd)}c.fd=null},isClosed(c){return c.fd===null},llseek(c,d,_){if(R.isClosed(c))throw new R.ErrnoError(8);if(!c.seekable||!c.stream_ops.llseek)throw new R.ErrnoError(70);if(_!=0&&_!=1&&_!=2)throw new R.ErrnoError(28);return c.position=c.stream_ops.llseek(c,d,_),c.ungotten=[],c.position},read(c,d,_,i,s){if(B(_>=0),i<0||s<0)throw new R.ErrnoError(28);if(R.isClosed(c))throw new R.ErrnoError(8);if((c.flags&2097155)===1)throw new R.ErrnoError(8);if(R.isDir(c.node.mode))throw new R.ErrnoError(31);if(!c.stream_ops.read)throw new R.ErrnoError(28);var f=typeof s<"u";if(!f)s=c.position;else if(!c.seekable)throw new R.ErrnoError(70);var h=c.stream_ops.read(c,d,_,i,s);return f||(c.position+=h),h},write(c,d,_,i,s,f){if(B(_>=0),i<0||s<0)throw new R.ErrnoError(28);if(R.isClosed(c))throw new R.ErrnoError(8);if((c.flags&2097155)===0)throw new R.ErrnoError(8);if(R.isDir(c.node.mode))throw new R.ErrnoError(31);if(!c.stream_ops.write)throw new R.ErrnoError(28);c.seekable&&c.flags&1024&&R.llseek(c,0,2);var h=typeof s<"u";if(!h)s=c.position;else if(!c.seekable)throw new R.ErrnoError(70);var g=c.stream_ops.write(c,d,_,i,s,f);return h||(c.position+=g),g},allocate(c,d,_){if(R.isClosed(c))throw new R.ErrnoError(8);if(d<0||_<=0)throw new R.ErrnoError(28);if((c.flags&2097155)===0)throw new R.ErrnoError(8);if(!R.isFile(c.node.mode)&&!R.isDir(c.node.mode))throw new R.ErrnoError(43);if(!c.stream_ops.allocate)throw new R.ErrnoError(138);c.stream_ops.allocate(c,d,_)},mmap(c,d,_,i,s){if((i&2)!==0&&(s&2)===0&&(c.flags&2097155)!==2)throw new R.ErrnoError(2);if((c.flags&2097155)===1)throw new R.ErrnoError(2);if(!c.stream_ops.mmap)throw new R.ErrnoError(43);return c.stream_ops.mmap(c,d,_,i,s)},msync(c,d,_,i,s){return B(_>=0),c.stream_ops.msync?c.stream_ops.msync(c,d,_,i,s):0},munmap:c=>0,ioctl(c,d,_){if(!c.stream_ops.ioctl)throw new R.ErrnoError(59);return c.stream_ops.ioctl(c,d,_)},readFile(c,d={}){if(d.flags=d.flags||0,d.encoding=d.encoding||"binary",d.encoding!=="utf8"&&d.encoding!=="binary")throw new Error(`Invalid encoding type "${d.encoding}"`);var _,i=R.open(c,d.flags),s=R.stat(c),f=s.size,h=new Uint8Array(f);return R.read(i,h,0,f,0),d.encoding==="utf8"?_=ii(h,0):d.encoding==="binary"&&(_=h),R.close(i),_},writeFile(c,d,_={}){_.flags=_.flags||577;var i=R.open(c,_.flags,_.mode);if(typeof d=="string"){var s=new Uint8Array(Ha(d)+1),f=Ai(d,s,0,s.length);R.write(i,s,0,f,void 0,_.canOwn)}else if(ArrayBuffer.isView(d))R.write(i,d,0,d.byteLength,void 0,_.canOwn);else throw new Error("Unsupported data type");R.close(i)},cwd:()=>R.currentPath,chdir(c){var d=R.lookupPath(c,{follow:!0});if(d.node===null)throw new R.ErrnoError(44);if(!R.isDir(d.node.mode))throw new R.ErrnoError(54);var _=R.nodePermissions(d.node,"x");if(_)throw new R.ErrnoError(_);R.currentPath=d.path},createDefaultDirectories(){R.mkdir("/tmp"),R.mkdir("/home"),R.mkdir("/home/web_user")},createDefaultDevices(){R.mkdir("/dev"),R.registerDevice(R.makedev(1,3),{read:()=>0,write:(i,s,f,h,g)=>h}),R.mkdev("/dev/null",R.makedev(1,3)),vr.register(R.makedev(5,0),vr.default_tty_ops),vr.register(R.makedev(6,0),vr.default_tty1_ops),R.mkdev("/dev/tty",R.makedev(5,0)),R.mkdev("/dev/tty1",R.makedev(6,0));var c=new Uint8Array(1024),d=0,_=()=>(d===0&&(d=na(c).byteLength),c[--d]);R.createDevice("/dev","random",_),R.createDevice("/dev","urandom",_),R.mkdir("/dev/shm"),R.mkdir("/dev/shm/tmp")},createSpecialDirectories(){R.mkdir("/proc");var c=R.mkdir("/proc/self");R.mkdir("/proc/self/fd"),R.mount({mount(){var d=R.createNode(c,"fd",16895,73);return d.node_ops={lookup(_,i){var s=+i,f=R.getStreamChecked(s),h={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>f.path}};return h.parent=h,h}},d}},{},"/proc/self/fd")},createStandardStreams(){t.stdin?R.createDevice("/dev","stdin",t.stdin):R.symlink("/dev/tty","/dev/stdin"),t.stdout?R.createDevice("/dev","stdout",null,t.stdout):R.symlink("/dev/tty","/dev/stdout"),t.stderr?R.createDevice("/dev","stderr",null,t.stderr):R.symlink("/dev/tty1","/dev/stderr");var c=R.open("/dev/stdin",0),d=R.open("/dev/stdout",1),_=R.open("/dev/stderr",1);B(c.fd===0,`invalid handle for stdin (${c.fd})`),B(d.fd===1,`invalid handle for stdout (${d.fd})`),B(_.fd===2,`invalid handle for stderr (${_.fd})`)},ensureErrnoError(){R.ErrnoError||(R.ErrnoError=function(d,_){this.name="ErrnoError",this.node=_,this.setErrno=function(i){this.errno=i;for(var s in Ya)if(Ya[s]===i){this.code=s;break}},this.setErrno(d),this.message=yl[d],this.stack&&(Object.defineProperty(this,"stack",{value:new Error().stack,writable:!0}),this.stack=bl(this.stack))},R.ErrnoError.prototype=new Error,R.ErrnoError.prototype.constructor=R.ErrnoError,[44].forEach(c=>{R.genericErrors[c]=new R.ErrnoError(c),R.genericErrors[c].stack="<generic error, no stack>"}))},staticInit(){R.ensureErrnoError(),R.nameTable=new Array(4096),R.mount(ut,{},"/"),R.createDefaultDirectories(),R.createDefaultDevices(),R.createSpecialDirectories(),R.filesystems={MEMFS:ut}},init(c,d,_){B(!R.init.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"),R.init.initialized=!0,R.ensureErrnoError(),t.stdin=c||t.stdin,t.stdout=d||t.stdout,t.stderr=_||t.stderr,R.createStandardStreams()},quit(){R.init.initialized=!1,qo(0);for(var c=0;c<R.streams.length;c++){var d=R.streams[c];d&&R.close(d)}},findObject(c,d){var _=R.analyzePath(c,d);return _.exists?_.object:null},analyzePath(c,d){try{var _=R.lookupPath(c,{follow:!d});c=_.path}catch{}var i={isRoot:!1,exists:!1,error:0,name:null,path:null,object:null,parentExists:!1,parentPath:null,parentObject:null};try{var _=R.lookupPath(c,{parent:!0});i.parentExists=!0,i.parentPath=_.path,i.parentObject=_.node,i.name=At.basename(c),_=R.lookupPath(c,{follow:!d}),i.exists=!0,i.path=_.path,i.object=_.node,i.name=_.node.name,i.isRoot=_.path==="/"}catch(s){i.error=s.errno}return i},createPath(c,d,_,i){c=typeof c=="string"?c:R.getPath(c);for(var s=d.split("/").reverse();s.length;){var f=s.pop();if(f){var h=At.join2(c,f);try{R.mkdir(h)}catch{}c=h}}return h},createFile(c,d,_,i,s){var f=At.join2(typeof c=="string"?c:R.getPath(c),d),h=qa(i,s);return R.create(f,h)},createDataFile(c,d,_,i,s,f){var h=d;c&&(c=typeof c=="string"?c:R.getPath(c),h=d?At.join2(c,d):c);var g=qa(i,s),M=R.create(h,g);if(_){if(typeof _=="string"){for(var O=new Array(_.length),G=0,Z=_.length;G<Z;++G)O[G]=_.charCodeAt(G);_=O}R.chmod(M,g|146);var re=R.open(M,577);R.write(re,_,0,_.length,0,f),R.close(re),R.chmod(M,g)}return M},createDevice(c,d,_,i){var s=At.join2(typeof c=="string"?c:R.getPath(c),d),f=qa(!!_,!!i);R.createDevice.major||(R.createDevice.major=64);var h=R.makedev(R.createDevice.major++,0);return R.registerDevice(h,{open(g){g.seekable=!1},close(g){i&&i.buffer&&i.buffer.length&&i(10)},read(g,M,O,G,Z){for(var re=0,se=0;se<G;se++){var xe;try{xe=_()}catch{throw new R.ErrnoError(29)}if(xe===void 0&&re===0)throw new R.ErrnoError(6);if(xe==null)break;re++,M[O+se]=xe}return re&&(g.node.timestamp=Date.now()),re},write(g,M,O,G,Z){for(var re=0;re<G;re++)try{i(M[O+re])}catch{throw new R.ErrnoError(29)}return G&&(g.node.timestamp=Date.now()),re}}),R.mkdev(s,f,h)},forceLoadFile(c){if(c.isDevice||c.isFolder||c.link||c.contents)return!0;if(typeof XMLHttpRequest<"u")throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");if(T)try{c.contents=ra(T(c.url),!0),c.usedBytes=c.contents.length}catch{throw new R.ErrnoError(29)}else throw new Error("Cannot load without read() or XMLHttpRequest.")},createLazyFile(c,d,_,i,s){function f(){this.lengthKnown=!1,this.chunks=[]}if(f.prototype.get=function(se){if(!(se>this.length-1||se<0)){var xe=se%this.chunkSize,Pe=se/this.chunkSize|0;return this.getter(Pe)[xe]}},f.prototype.setDataGetter=function(se){this.getter=se},f.prototype.cacheLength=function(){var se=new XMLHttpRequest;if(se.open("HEAD",_,!1),se.send(null),!(se.status>=200&&se.status<300||se.status===304))throw new Error("Couldn't load "+_+". Status: "+se.status);var xe=Number(se.getResponseHeader("Content-length")),Pe,De=(Pe=se.getResponseHeader("Accept-Ranges"))&&Pe==="bytes",Xe=(Pe=se.getResponseHeader("Content-Encoding"))&&Pe==="gzip",me=1024*1024;De||(me=xe);var Le=(ue,ze)=>{if(ue>ze)throw new Error("invalid range ("+ue+", "+ze+") or no bytes requested!");if(ze>xe-1)throw new Error("only "+xe+" bytes available! programmer error!");var ot=new XMLHttpRequest;if(ot.open("GET",_,!1),xe!==me&&ot.setRequestHeader("Range","bytes="+ue+"-"+ze),ot.responseType="arraybuffer",ot.overrideMimeType&&ot.overrideMimeType("text/plain; charset=x-user-defined"),ot.send(null),!(ot.status>=200&&ot.status<300||ot.status===304))throw new Error("Couldn't load "+_+". Status: "+ot.status);return ot.response!==void 0?new Uint8Array(ot.response||[]):ra(ot.responseText||"",!0)},dt=this;dt.setDataGetter(ue=>{var ze=ue*me,ot=(ue+1)*me-1;if(ot=Math.min(ot,xe-1),typeof dt.chunks[ue]>"u"&&(dt.chunks[ue]=Le(ze,ot)),typeof dt.chunks[ue]>"u")throw new Error("doXHR failed!");return dt.chunks[ue]}),(Xe||!xe)&&(me=xe=1,xe=this.getter(0).length,me=xe,C("LazyFiles on gzip forces download of the whole file when length is accessed")),this._length=xe,this._chunkSize=me,this.lengthKnown=!0},typeof XMLHttpRequest<"u"){if(!m)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var h=new f;Object.defineProperties(h,{length:{get:function(){return this.lengthKnown||this.cacheLength(),this._length}},chunkSize:{get:function(){return this.lengthKnown||this.cacheLength(),this._chunkSize}}});var g={isDevice:!1,contents:h}}else var g={isDevice:!1,url:_};var M=R.createFile(c,d,g,i,s);g.contents?M.contents=g.contents:g.url&&(M.contents=null,M.url=g.url),Object.defineProperties(M,{usedBytes:{get:function(){return this.contents.length}}});var O={},G=Object.keys(M.stream_ops);G.forEach(re=>{var se=M.stream_ops[re];O[re]=function(){return R.forceLoadFile(M),se.apply(null,arguments)}});function Z(re,se,xe,Pe,De){var Xe=re.node.contents;if(De>=Xe.length)return 0;var me=Math.min(Xe.length-De,Pe);if(B(me>=0),Xe.slice)for(var Le=0;Le<me;Le++)se[xe+Le]=Xe[De+Le];else for(var Le=0;Le<me;Le++)se[xe+Le]=Xe.get(De+Le);return me}return O.read=(re,se,xe,Pe,De)=>(R.forceLoadFile(M),Z(re,se,xe,Pe,De)),O.mmap=(re,se,xe,Pe,De)=>{R.forceLoadFile(M);var Xe=ko();if(!Xe)throw new R.ErrnoError(48);return Z(re,Y,Xe,se,xe),{ptr:Xe,allocated:!0}},M.stream_ops=O,M},absolutePath(){N("FS.absolutePath has been removed; use PATH_FS.resolve instead")},createFolder(){N("FS.createFolder has been removed; use FS.mkdir instead")},createLink(){N("FS.createLink has been removed; use FS.symlink instead")},joinPath(){N("FS.joinPath has been removed; use PATH.join instead")},mmapAlloc(){N("FS.mmapAlloc has been replaced by the top level function mmapAlloc")},standardizePath(){N("FS.standardizePath has been removed; use PATH.normalize instead")}},ir={DEFAULT_POLLMASK:5,calculateAt(c,d,_){if(At.isAbs(d))return d;var i;if(c===-100)i=R.cwd();else{var s=ir.getStreamFromFD(c);i=s.path}if(d.length==0){if(!_)throw new R.ErrnoError(44);return i}return At.join2(i,d)},doStat(c,d,_){try{var i=c(d)}catch(g){if(g&&g.node&&At.normalize(d)!==At.normalize(R.getPath(g.node)))return-54;throw g}ce[_>>2]=i.dev,ce[_+4>>2]=i.mode,te[_+8>>2]=i.nlink,ce[_+12>>2]=i.uid,ce[_+16>>2]=i.gid,ce[_+20>>2]=i.rdev,we=[i.size>>>0,(he=i.size,+Math.abs(he)>=1?he>0?+Math.floor(he/4294967296)>>>0:~~+Math.ceil((he-+(~~he>>>0))/4294967296)>>>0:0)],ce[_+24>>2]=we[0],ce[_+28>>2]=we[1],ce[_+32>>2]=4096,ce[_+36>>2]=i.blocks;var s=i.atime.getTime(),f=i.mtime.getTime(),h=i.ctime.getTime();return we=[Math.floor(s/1e3)>>>0,(he=Math.floor(s/1e3),+Math.abs(he)>=1?he>0?+Math.floor(he/4294967296)>>>0:~~+Math.ceil((he-+(~~he>>>0))/4294967296)>>>0:0)],ce[_+40>>2]=we[0],ce[_+44>>2]=we[1],te[_+48>>2]=s%1e3*1e3,we=[Math.floor(f/1e3)>>>0,(he=Math.floor(f/1e3),+Math.abs(he)>=1?he>0?+Math.floor(he/4294967296)>>>0:~~+Math.ceil((he-+(~~he>>>0))/4294967296)>>>0:0)],ce[_+56>>2]=we[0],ce[_+60>>2]=we[1],te[_+64>>2]=f%1e3*1e3,we=[Math.floor(h/1e3)>>>0,(he=Math.floor(h/1e3),+Math.abs(he)>=1?he>0?+Math.floor(he/4294967296)>>>0:~~+Math.ceil((he-+(~~he>>>0))/4294967296)>>>0:0)],ce[_+72>>2]=we[0],ce[_+76>>2]=we[1],te[_+80>>2]=h%1e3*1e3,we=[i.ino>>>0,(he=i.ino,+Math.abs(he)>=1?he>0?+Math.floor(he/4294967296)>>>0:~~+Math.ceil((he-+(~~he>>>0))/4294967296)>>>0:0)],ce[_+88>>2]=we[0],ce[_+92>>2]=we[1],0},doMsync(c,d,_,i,s){if(!R.isFile(d.node.mode))throw new R.ErrnoError(43);if(i&2)return 0;var f=K.slice(c,c+_);R.msync(d,f,s,_,i)},varargs:void 0,get(){B(ir.varargs!=null);var c=ce[+ir.varargs>>2];return ir.varargs+=4,c},getp(){return ir.get()},getStr(c){var d=ai(c);return d},getStreamFromFD(c){var d=R.getStreamChecked(c);return d}},El=(c,d)=>{var _=0;return Ci().forEach((i,s)=>{var f=d+_;te[c+s*4>>2]=f,dl(i,f),_+=i.length+1}),0},Ml=(c,d)=>{var _=Ci();te[c>>2]=_.length;var i=0;return _.forEach(s=>i+=s.length+1),te[d>>2]=i,0},wl=0,Tl=c=>{z=c,o(c,new Ae(c))},zo=(c,d)=>{if(z=c,Zo(),!d){var _=`program exited (with status: ${c}), but keepRuntimeAlive() is set (counter=${wl}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;a(_),L(_)}Tl(c)},Go=zo;function ja(c){try{var d=ir.getStreamFromFD(c);return R.close(d),0}catch(_){if(typeof R>"u"||_.name!=="ErrnoError")throw _;return _.errno}}var Al=(c,d,_,i)=>{for(var s=0,f=0;f<_;f++){var h=te[d>>2],g=te[d+4>>2];d+=8;var M=R.read(c,Y,h,g,i);if(M<0)return-1;if(s+=M,M<g)break}return s};function Cl(c,d,_,i){try{var s=ir.getStreamFromFD(c),f=Al(s,d,_);return te[i>>2]=f,0}catch(h){if(typeof R>"u"||h.name!=="ErrnoError")throw h;return h.errno}}var Rl=(c,d)=>(B(c==c>>>0||c==(c|0)),B(d===(d|0)),d+2097152>>>0<4194305-!!c?(c>>>0)+d*4294967296:NaN);function Pl(c,d,_,i,s){var f=Rl(d,_);try{if(isNaN(f))return 61;var h=ir.getStreamFromFD(c);return R.llseek(h,f,i),we=[h.position>>>0,(he=h.position,+Math.abs(he)>=1?he>0?+Math.floor(he/4294967296)>>>0:~~+Math.ceil((he-+(~~he>>>0))/4294967296)>>>0:0)],ce[s>>2]=we[0],ce[s+4>>2]=we[1],h.getdents&&f===0&&i===0&&(h.getdents=null),0}catch(g){if(typeof R>"u"||g.name!=="ErrnoError")throw g;return g.errno}}var Dl=(c,d,_,i)=>{for(var s=0,f=0;f<_;f++){var h=te[d>>2],g=te[d+4>>2];d+=8;var M=R.write(c,Y,h,g,i);if(M<0)return-1;s+=M}return s};function Ll(c,d,_,i){try{var s=ir.getStreamFromFD(c),f=Dl(s,d,_);return te[i>>2]=f,0}catch(h){if(typeof R>"u"||h.name!=="ErrnoError")throw h;return h.errno}}var ia=c=>c%4===0&&(c%100!==0||c%400===0),Fl=(c,d)=>{for(var _=0,i=0;i<=d;_+=c[i++]);return _},Ho=[31,29,31,30,31,30,31,31,30,31,30,31],Vo=[31,28,31,30,31,30,31,31,30,31,30,31],Il=(c,d)=>{for(var _=new Date(c.getTime());d>0;){var i=ia(_.getFullYear()),s=_.getMonth(),f=(i?Ho:Vo)[s];if(d>f-_.getDate())d-=f-_.getDate()+1,_.setDate(1),s<11?_.setMonth(s+1):(_.setMonth(0),_.setFullYear(_.getFullYear()+1));else return _.setDate(_.getDate()+d),_}return _},Ul=(c,d)=>{B(c.length>=0,"writeArrayToMemory array must have a length (should be an array or typed array)"),Y.set(c,d)},Nl=(c,d,_,i)=>{var s=te[i+40>>2],f={tm_sec:ce[i>>2],tm_min:ce[i+4>>2],tm_hour:ce[i+8>>2],tm_mday:ce[i+12>>2],tm_mon:ce[i+16>>2],tm_year:ce[i+20>>2],tm_wday:ce[i+24>>2],tm_yday:ce[i+28>>2],tm_isdst:ce[i+32>>2],tm_gmtoff:ce[i+36>>2],tm_zone:s?ai(s):""},h=ai(_),g={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var M in g)h=h.replace(new RegExp(M,"g"),g[M]);var O=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],G=["January","February","March","April","May","June","July","August","September","October","November","December"];function Z(me,Le,dt){for(var ue=typeof me=="number"?me.toString():me||"";ue.length<Le;)ue=dt[0]+ue;return ue}function re(me,Le){return Z(me,Le,"0")}function se(me,Le){function dt(ze){return ze<0?-1:ze>0?1:0}var ue;return(ue=dt(me.getFullYear()-Le.getFullYear()))===0&&(ue=dt(me.getMonth()-Le.getMonth()))===0&&(ue=dt(me.getDate()-Le.getDate())),ue}function xe(me){switch(me.getDay()){case 0:return new Date(me.getFullYear()-1,11,29);case 1:return me;case 2:return new Date(me.getFullYear(),0,3);case 3:return new Date(me.getFullYear(),0,2);case 4:return new Date(me.getFullYear(),0,1);case 5:return new Date(me.getFullYear()-1,11,31);case 6:return new Date(me.getFullYear()-1,11,30)}}function Pe(me){var Le=Il(new Date(me.tm_year+1900,0,1),me.tm_yday),dt=new Date(Le.getFullYear(),0,4),ue=new Date(Le.getFullYear()+1,0,4),ze=xe(dt),ot=xe(ue);return se(ze,Le)<=0?se(ot,Le)<=0?Le.getFullYear()+1:Le.getFullYear():Le.getFullYear()-1}var De={"%a":me=>O[me.tm_wday].substring(0,3),"%A":me=>O[me.tm_wday],"%b":me=>G[me.tm_mon].substring(0,3),"%B":me=>G[me.tm_mon],"%C":me=>{var Le=me.tm_year+1900;return re(Le/100|0,2)},"%d":me=>re(me.tm_mday,2),"%e":me=>Z(me.tm_mday,2," "),"%g":me=>Pe(me).toString().substring(2),"%G":me=>Pe(me),"%H":me=>re(me.tm_hour,2),"%I":me=>{var Le=me.tm_hour;return Le==0?Le=12:Le>12&&(Le-=12),re(Le,2)},"%j":me=>re(me.tm_mday+Fl(ia(me.tm_year+1900)?Ho:Vo,me.tm_mon-1),3),"%m":me=>re(me.tm_mon+1,2),"%M":me=>re(me.tm_min,2),"%n":()=>`
`,"%p":me=>me.tm_hour>=0&&me.tm_hour<12?"AM":"PM","%S":me=>re(me.tm_sec,2),"%t":()=>"	","%u":me=>me.tm_wday||7,"%U":me=>{var Le=me.tm_yday+7-me.tm_wday;return re(Math.floor(Le/7),2)},"%V":me=>{var Le=Math.floor((me.tm_yday+7-(me.tm_wday+6)%7)/7);if((me.tm_wday+371-me.tm_yday-2)%7<=2&&Le++,Le){if(Le==53){var ue=(me.tm_wday+371-me.tm_yday)%7;ue!=4&&(ue!=3||!ia(me.tm_year))&&(Le=1)}}else{Le=52;var dt=(me.tm_wday+7-me.tm_yday-1)%7;(dt==4||dt==5&&ia(me.tm_year%400-1))&&Le++}return re(Le,2)},"%w":me=>me.tm_wday,"%W":me=>{var Le=me.tm_yday+7-(me.tm_wday+6)%7;return re(Math.floor(Le/7),2)},"%y":me=>(me.tm_year+1900).toString().substring(2),"%Y":me=>me.tm_year+1900,"%z":me=>{var Le=me.tm_gmtoff,dt=Le>=0;return Le=Math.abs(Le)/60,Le=Le/60*100+Le%60,(dt?"+":"-")+("0000"+Le).slice(-4)},"%Z":me=>me.tm_zone,"%%":()=>"%"};h=h.replace(/%%/g,"\0\0");for(var M in De)h.includes(M)&&(h=h.replace(new RegExp(M,"g"),De[M](f)));h=h.replace(/\0\0/g,"%");var Xe=ra(h,!1);return Xe.length>d?0:(Ul(Xe,c),Xe.length-1)},Ol=(c,d,_,i,s)=>Nl(c,d,_,i),kl=c=>{if(c instanceof Ae||c=="unwind")return z;ht(),c instanceof WebAssembly.RuntimeError&&Za()<=0&&L("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)"),o(1,c)};A=t.InternalError=class extends Error{constructor(d){super(d),this.name="InternalError"}},Zi(),Lr=t.BindingError=class extends Error{constructor(d){super(d),this.name="BindingError"}},ni(),ee(),an=t.UnboundTypeError=qt(Error,"UnboundTypeError");var Wo=function(c,d,_,i){c||(c=this),this.parent=c,this.mount=c.mount,this.mounted=null,this.id=R.nextInode++,this.name=d,this.mode=_,this.node_ops={},this.stream_ops={},this.rdev=i},oi=365,aa=146;Object.defineProperties(Wo.prototype,{read:{get:function(){return(this.mode&oi)===oi},set:function(c){c?this.mode|=oi:this.mode&=~oi}},write:{get:function(){return(this.mode&aa)===aa},set:function(c){c?this.mode|=aa:this.mode&=~aa}},isFolder:{get:function(){return R.isDir(this.mode)}},isDevice:{get:function(){return R.isChrdev(this.mode)}}}),R.FSNode=Wo,R.createPreloadedFile=xl,R.staticInit(),Ya={EPERM:63,ENOENT:44,ESRCH:71,EINTR:27,EIO:29,ENXIO:60,E2BIG:1,ENOEXEC:45,EBADF:8,ECHILD:12,EAGAIN:6,EWOULDBLOCK:6,ENOMEM:48,EACCES:2,EFAULT:21,ENOTBLK:105,EBUSY:10,EEXIST:20,EXDEV:75,ENODEV:43,ENOTDIR:54,EISDIR:31,EINVAL:28,ENFILE:41,EMFILE:33,ENOTTY:59,ETXTBSY:74,EFBIG:22,ENOSPC:51,ESPIPE:70,EROFS:69,EMLINK:34,EPIPE:64,EDOM:18,ERANGE:68,ENOMSG:49,EIDRM:24,ECHRNG:106,EL2NSYNC:156,EL3HLT:107,EL3RST:108,ELNRNG:109,EUNATCH:110,ENOCSI:111,EL2HLT:112,EDEADLK:16,ENOLCK:46,EBADE:113,EBADR:114,EXFULL:115,ENOANO:104,EBADRQC:103,EBADSLT:102,EDEADLOCK:16,EBFONT:101,ENOSTR:100,ENODATA:116,ETIME:117,ENOSR:118,ENONET:119,ENOPKG:120,EREMOTE:121,ENOLINK:47,EADV:122,ESRMNT:123,ECOMM:124,EPROTO:65,EMULTIHOP:36,EDOTDOT:125,EBADMSG:9,ENOTUNIQ:126,EBADFD:127,EREMCHG:128,ELIBACC:129,ELIBBAD:130,ELIBSCN:131,ELIBMAX:132,ELIBEXEC:133,ENOSYS:52,ENOTEMPTY:55,ENAMETOOLONG:37,ELOOP:32,EOPNOTSUPP:138,EPFNOSUPPORT:139,ECONNRESET:15,ENOBUFS:42,EAFNOSUPPORT:5,EPROTOTYPE:67,ENOTSOCK:57,ENOPROTOOPT:50,ESHUTDOWN:140,ECONNREFUSED:14,EADDRINUSE:3,ECONNABORTED:13,ENETUNREACH:40,ENETDOWN:38,ETIMEDOUT:73,EHOSTDOWN:142,EHOSTUNREACH:23,EINPROGRESS:26,EALREADY:7,EDESTADDRREQ:17,EMSGSIZE:35,EPROTONOSUPPORT:66,ESOCKTNOSUPPORT:137,EADDRNOTAVAIL:4,ENETRESET:39,EISCONN:30,ENOTCONN:53,ETOOMANYREFS:141,EUSERS:136,EDQUOT:19,ESTALE:72,ENOTSUP:138,ENOMEDIUM:148,EILSEQ:25,EOVERFLOW:61,ECANCELED:11,ENOTRECOVERABLE:56,EOWNERDEAD:62,ESTRPIPE:135};function Ri(){Be("fetchSettings")}var Xo={__cxa_throw:It,_embind_finalize_value_object:Ki,_embind_register_bigint:ti,_embind_register_bool:Ji,_embind_register_emval:Ne,_embind_register_float:Je,_embind_register_function:wi,_embind_register_integer:Qi,_embind_register_memory_view:Ti,_embind_register_std_string:tl,_embind_register_std_wstring:Fo,_embind_register_value_object:Io,_embind_register_value_object_field:al,_embind_register_void:ol,_emscripten_throw_longjmp:tr,_emval_decref:ae,_emval_incref:sl,_emval_new_cstring:Oo,_emval_take_value:Va,abort:nr,emscripten_memcpy_js:Wa,emscripten_resize_heap:Mn,environ_get:El,environ_sizes_get:Ml,exit:Go,fd_close:ja,fd_read:Cl,fd_seek:Pl,fd_write:Ll,invoke_ii:Gl,invoke_iii:Xl,invoke_iiii:Wl,invoke_iiiii:k,invoke_vi:Hl,invoke_viii:Vl,strftime_l:Ol},ar=ve(),$o=de("malloc"),Bl=t._main=de("main"),xr=de("free"),zl=de("__getTypeName");t.__embind_initialize_bindings=de("_embind_initialize_bindings");var qo=t._fflush=de("fflush"),si=de("setThrew"),Yo=()=>(Yo=ar.emscripten_stack_init)(),Ka=()=>(Ka=ar.emscripten_stack_get_end)(),or=de("stackSave"),li=de("stackRestore"),Za=()=>(Za=ar.emscripten_stack_get_current)(),jo=de("__cxa_is_pointer_type");t.dynCall_jiji=de("dynCall_jiji"),t.dynCall_viijii=de("dynCall_viijii"),t.dynCall_iiiiij=de("dynCall_iiiiij"),t.dynCall_iiiiijj=de("dynCall_iiiiijj"),t.dynCall_iiiiiijj=de("dynCall_iiiiiijj");function Gl(c,d){var _=or();try{return rn(c)(d)}catch(i){if(li(_),i!==i+0)throw i;si(1,0)}}function Hl(c,d){var _=or();try{rn(c)(d)}catch(i){if(li(_),i!==i+0)throw i;si(1,0)}}function Vl(c,d,_,i){var s=or();try{rn(c)(d,_,i)}catch(f){if(li(s),f!==f+0)throw f;si(1,0)}}function Wl(c,d,_,i){var s=or();try{return rn(c)(d,_,i)}catch(f){if(li(s),f!==f+0)throw f;si(1,0)}}function Xl(c,d,_){var i=or();try{return rn(c)(d,_)}catch(s){if(li(i),s!==s+0)throw s;si(1,0)}}function k(c,d,_,i,s){var f=or();try{return rn(c)(d,_,i,s)}catch(h){if(li(f),h!==h+0)throw h;si(1,0)}}var Ko=["writeI53ToI64","writeI53ToI64Clamped","writeI53ToI64Signaling","writeI53ToU64Clamped","writeI53ToU64Signaling","readI53FromI64","readI53FromU64","convertI32PairToI53","convertU32PairToI53","ydayFromDate","setErrNo","inetPton4","inetNtop4","inetPton6","inetNtop6","readSockaddr","writeSockaddr","getHostByName","getCallstack","emscriptenLog","convertPCtoSourceLocation","readEmAsmArgs","jstoi_q","jstoi_s","listenOnce","autoResumeAudioContext","runtimeKeepalivePush","runtimeKeepalivePop","callUserCallback","maybeExit","asmjsMangle","getNativeTypeSize","STACK_SIZE","STACK_ALIGN","POINTER_SIZE","ASSERTIONS","getCFunc","ccall","cwrap","uleb128Encode","sigToWasmTypes","generateFuncType","convertJsFunctionToWasm","getEmptyTableSlot","updateTableMap","getFunctionAddress","addFunction","removeFunction","reallyNegative","unSign","strLen","reSign","formatString","intArrayToString","AsciiToString","stringToNewUTF8","stringToUTF8OnStack","registerKeyEventCallback","maybeCStringToJsString","findEventTarget","findCanvasEventTarget","getBoundingClientRect","fillMouseEventData","registerMouseEventCallback","registerWheelEventCallback","registerUiEventCallback","registerFocusEventCallback","fillDeviceOrientationEventData","registerDeviceOrientationEventCallback","fillDeviceMotionEventData","registerDeviceMotionEventCallback","screenOrientation","fillOrientationChangeEventData","registerOrientationChangeEventCallback","fillFullscreenChangeEventData","registerFullscreenChangeEventCallback","JSEvents_requestFullscreen","JSEvents_resizeCanvasForFullscreen","registerRestoreOldStyle","hideEverythingExceptGivenElement","restoreHiddenElements","setLetterbox","softFullscreenResizeWebGLRenderTarget","doRequestFullscreen","fillPointerlockChangeEventData","registerPointerlockChangeEventCallback","registerPointerlockErrorEventCallback","requestPointerLock","fillVisibilityChangeEventData","registerVisibilityChangeEventCallback","registerTouchEventCallback","fillGamepadEventData","registerGamepadEventCallback","registerBeforeUnloadEventCallback","fillBatteryEventData","battery","registerBatteryEventCallback","setCanvasElementSize","getCanvasElementSize","jsStackTrace","stackTrace","checkWasiClock","wasiRightsToMuslOFlags","wasiOFlagsToMuslOFlags","createDyncallWrapper","safeSetTimeout","setImmediateWrapped","clearImmediateWrapped","polyfillSetImmediate","getPromise","makePromise","idsToPromises","makePromiseCallback","findMatchingCatch","setMainLoop","getSocketFromFD","getSocketAddress","FS_unlink","FS_mkdirTree","_setNetworkCallback","heapObjectForWebGLType","heapAccessShiftForWebGLHeap","webgl_enable_ANGLE_instanced_arrays","webgl_enable_OES_vertex_array_object","webgl_enable_WEBGL_draw_buffers","webgl_enable_WEBGL_multi_draw","emscriptenWebGLGet","computeUnpackAlignedImageSize","colorChannelsInGlTextureFormat","emscriptenWebGLGetTexPixelData","__glGenObject","emscriptenWebGLGetUniform","webglGetUniformLocation","webglPrepareUniformLocationsBeforeFirstUse","webglGetLeftBracePos","emscriptenWebGLGetVertexAttrib","__glGetActiveAttribOrUniform","writeGLArray","registerWebGlEventCallback","runAndAbortIfError","SDL_unicode","SDL_ttfContext","SDL_audio","ALLOC_NORMAL","ALLOC_STACK","allocate","writeStringToMemory","writeAsciiToMemory","getFunctionArgsName","init_embind","getBasestPointer","registerInheritedInstance","unregisterInheritedInstance","getInheritedInstance","getInheritedInstanceCount","getLiveInheritedInstances","enumReadValueFromPointer","genericPointerToWireType","constNoSmartPtrRawPointerToWireType","nonConstNoSmartPtrRawPointerToWireType","init_RegisteredPointer","RegisteredPointer","RegisteredPointer_fromWireType","runDestructor","releaseClassHandle","detachFinalizer","attachFinalizer","makeClassHandle","init_ClassHandle","ClassHandle","throwInstanceAlreadyDeleted","flushPendingDeletes","setDelayFunction","RegisteredClass","shallowCopyInternalPointer","downcastPointer","upcastPointer","validateThis","craftEmvalAllocator","emval_get_global","emval_lookupTypes","emval_addMethodCaller"];Ko.forEach(Fe);var yr=["run","addOnPreRun","addOnInit","addOnPreMain","addOnExit","addOnPostRun","addRunDependency","removeRunDependency","FS_createFolder","FS_createPath","FS_createLazyFile","FS_createLink","FS_createDevice","FS_readFile","out","err","callMain","abort","wasmMemory","wasmExports","stackAlloc","stackSave","stackRestore","getTempRet0","setTempRet0","writeStackCookie","checkStackCookie","convertI32PairToI53Checked","ptrToString","zeroMemory","exitJS","getHeapMax","growMemory","ENV","MONTH_DAYS_REGULAR","MONTH_DAYS_LEAP","MONTH_DAYS_REGULAR_CUMULATIVE","MONTH_DAYS_LEAP_CUMULATIVE","isLeapYear","arraySum","addDays","ERRNO_CODES","ERRNO_MESSAGES","DNS","Protocols","Sockets","initRandomFill","randomFill","timers","warnOnce","UNWIND_CACHE","readEmAsmArgsArray","getExecutableName","dynCallLegacy","getDynCaller","dynCall","handleException","keepRuntimeAlive","asyncLoad","alignMemory","mmapAlloc","handleAllocatorInit","HandleAllocator","wasmTable","noExitRuntime","freeTableIndexes","functionsInTableMap","setValue","getValue","PATH","PATH_FS","UTF8Decoder","UTF8ArrayToString","UTF8ToString","stringToUTF8Array","stringToUTF8","lengthBytesUTF8","intArrayFromString","stringToAscii","UTF16Decoder","UTF16ToString","stringToUTF16","lengthBytesUTF16","UTF32ToString","stringToUTF32","lengthBytesUTF32","writeArrayToMemory","JSEvents","specialHTMLTargets","currentFullscreenStrategy","restoreOldWindowedStyle","demangle","demangleAll","ExitStatus","getEnvStrings","doReadv","doWritev","promiseMap","uncaughtExceptionCount","exceptionLast","exceptionCaught","ExceptionInfo","Browser","wget","SYSCALLS","preloadPlugins","FS_createPreloadedFile","FS_modeStringToFlags","FS_getMode","FS_stdin_getChar_buffer","FS_stdin_getChar","FS","FS_createDataFile","MEMFS","TTY","PIPEFS","SOCKFS","tempFixedLengthArray","miniTempWebGLFloatBuffers","miniTempWebGLIntBuffers","GL","emscripten_webgl_power_preferences","AL","GLUT","EGL","GLEW","IDBStore","SDL","SDL_gfx","allocateUTF8","allocateUTF8OnStack","InternalError","BindingError","throwInternalError","throwBindingError","registeredTypes","awaitingDependencies","typeDependencies","tupleRegistrations","structRegistrations","sharedRegisterType","whenDependentTypesAreResolved","embind_charCodes","embind_init_charCodes","readLatin1String","getTypeName","getFunctionName","heap32VectorToArray","requireRegisteredType","UnboundTypeError","PureVirtualError","GenericWireTypeSize","throwUnboundTypeError","ensureOverloadTable","exposePublicSymbol","replacePublicSymbol","extendError","createNamedFunction","embindRepr","registeredInstances","registeredPointers","registerType","integerReadValueFromPointer","floatReadValueFromPointer","simpleReadValueFromPointer","readPointer","runDestructors","newFunc","craftInvokerFunction","embind__requireFunction","finalizationRegistry","detachFinalizer_deps","deletionQueue","delayFunction","char_0","char_9","makeLegalFunctionName","emval_handles","emval_symbols","init_emval","count_emval_handles","getStringOrSymbol","Emval","emval_newers","emval_methodCallers"];yr.forEach(Te);var oa;lt=function c(){oa||Ja(),oa||(lt=c)};function $l(){B(Ce==0,'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])'),B(xt.length==0,"cannot call main when preRun functions remain to be called");var c=Bl,d=0,_=0;try{var i=c(d,_);return zo(i,!0),i}catch(s){return kl(s)}}function sa(){Yo(),st()}function Ja(){if(Ce>0||(sa(),et(),Ce>0))return;function c(){oa||(oa=!0,t.calledRun=!0,!w&&(qe(),ct(),r(t),t.onRuntimeInitialized&&t.onRuntimeInitialized(),sr&&$l(),Pt()))}t.setStatus?(t.setStatus("Running..."),setTimeout(function(){setTimeout(function(){t.setStatus("")},1),c()},1)):c(),ht()}function Zo(){var c=C,d=L,_=!1;C=L=i=>{_=!0};try{qo(0),["stdout","stderr"].forEach(function(i){var s=R.analyzePath("/dev/"+i);if(s){var f=s.object,h=f.rdev,g=vr.ttys[h];g&&g.output&&g.output.length&&(_=!0)}})}catch{}C=c,L=d,_&&Ge("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.")}if(t.preInit)for(typeof t.preInit=="function"&&(t.preInit=[t.preInit]);t.preInit.length>0;)t.preInit.pop()();var sr=!0;return t.noInitialRun&&(sr=!1),Ja(),e.ready})})();let Ac;const Fy=async()=>(Ac||(Ac=await Ly()),Ac),Iy=async n=>{const e=await Fy();if(n.sdr.mimeType!=="image/jpeg")throw new Error("This function expects an SDR image compressed in jpeg");if(n.gainMap.mimeType!=="image/jpeg")throw new Error("This function expects a GainMap image compressed in jpeg");return e.appendGainMap(n.sdr.width,n.sdr.height,n.sdr.data,n.sdr.data.length,n.gainMap.data,n.gainMap.data.length,n.gainMapMax.reduce((t,r)=>t+r,0)/n.gainMapMax.length,n.gainMapMin.reduce((t,r)=>t+r,0)/n.gainMapMin.length,n.gamma.reduce((t,r)=>t+r,0)/n.gamma.length,n.offsetSdr.reduce((t,r)=>t+r,0)/n.offsetSdr.length,n.offsetHdr.reduce((t,r)=>t+r,0)/n.offsetHdr.length,n.hdrCapacityMin,n.hdrCapacityMax)};function Dh(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}function Uy(n){if(Object.prototype.hasOwnProperty.call(n,"__esModule"))return n;var e=n.default;if(typeof e=="function"){var t=function r(){var a=!1;try{a=this instanceof r}catch{}return a?Reflect.construct(e,arguments,this.constructor):e.apply(this,arguments)};t.prototype=e.prototype}else t={};return Object.defineProperty(t,"__esModule",{value:!0}),Object.keys(n).forEach(function(r){var a=Object.getOwnPropertyDescriptor(n,r);Object.defineProperty(t,r,a.get?a:{enumerable:!0,get:function(){return n[r]}})}),t}var Es={exports:{}},dd;function Ny(){return dd||(dd=1,(function(n,e){(function(){var t={};t.version="1.0.4",t.remove=function(I){var C=!1;if(I.slice(0,2)!="ÿØ")if(I.slice(0,23)=="data:image/jpeg;base64,"||I.slice(0,22)=="data:image/jpg;base64,")I=y(I.split(",")[1]),C=!0;else throw new Error("Given data is not jpeg.");var L=E(I),W=L.filter(function(w){return!(w.slice(0,2)=="ÿá"&&w.slice(4,10)=="Exif\0\0")}),P=W.join("");return C&&(P="data:image/jpeg;base64,"+v(P)),P},t.insert=function(I,C){var L=!1;if(I.slice(0,6)!="Exif\0\0")throw new Error("Given data is not exif.");if(C.slice(0,2)!="ÿØ")if(C.slice(0,23)=="data:image/jpeg;base64,"||C.slice(0,22)=="data:image/jpg;base64,")C=y(C.split(",")[1]),L=!0;else throw new Error("Given data is not jpeg.");var W="ÿá"+S(">H",[I.length+2])+I,P=E(C),w=H(P,W);return L&&(w="data:image/jpeg;base64,"+v(w)),w},t.load=function(I){var C;if(typeof I=="string")if(I.slice(0,2)=="ÿØ")C=I;else if(I.slice(0,23)=="data:image/jpeg;base64,"||I.slice(0,22)=="data:image/jpg;base64,")C=y(I.split(",")[1]);else if(I.slice(0,4)=="Exif")C=I.slice(6);else throw new Error("'load' gots invalid file data.");else throw new Error("'load' gots invalid type argument.");var L={"0th":{},Exif:{},GPS:{},Interop:{},"1st":{},thumbnail:null},W=new x(C);if(W.tiftag===null)return L;W.tiftag.slice(0,2)=="II"?W.endian_mark="<":W.endian_mark=">";var P=T(W.endian_mark+"L",W.tiftag.slice(4,8))[0];L["0th"]=W.get_ifd(P,"0th");var w=L["0th"].first_ifd_pointer;if(delete L["0th"].first_ifd_pointer,34665 in L["0th"]&&(P=L["0th"][34665],L.Exif=W.get_ifd(P,"Exif")),34853 in L["0th"]&&(P=L["0th"][34853],L.GPS=W.get_ifd(P,"GPS")),40965 in L.Exif&&(P=L.Exif[40965],L.Interop=W.get_ifd(P,"Interop")),w!="\0\0\0\0"&&(P=T(W.endian_mark+"L",w)[0],L["1st"]=W.get_ifd(P,"1st"),513 in L["1st"]&&514 in L["1st"])){var z=L["1st"][513]+L["1st"][514],B=W.tiftag.slice(L["1st"][513],z);L.thumbnail=B}return L},t.dump=function(I){var C=8,L=r(I),W="Exif\0\0MM\0*\0\0\0\b",P=!1,w=!1,z=!1,B=!1,Y,K,j,J,ce;"0th"in L?Y=L["0th"]:Y={},"Exif"in L&&Object.keys(L.Exif).length||"Interop"in L&&Object.keys(L.Interop).length?(Y[34665]=1,P=!0,K=L.Exif,"Interop"in L&&Object.keys(L.Interop).length?(K[40965]=1,z=!0,j=L.Interop):Object.keys(K).indexOf(t.ExifIFD.InteroperabilityTag.toString())>-1&&delete K[40965]):Object.keys(Y).indexOf(t.ImageIFD.ExifTag.toString())>-1&&delete Y[34665],"GPS"in L&&Object.keys(L.GPS).length?(Y[t.ImageIFD.GPSTag]=1,w=!0,J=L.GPS):Object.keys(Y).indexOf(t.ImageIFD.GPSTag.toString())>-1&&delete Y[t.ImageIFD.GPSTag],"1st"in L&&"thumbnail"in L&&L.thumbnail!=null&&(B=!0,L["1st"][513]=1,L["1st"][514]=1,ce=L["1st"]);var te=m(Y,"0th",0),Se=te[0].length+P*12+w*12+4+te[1].length,be,$e="",st=0,ht,xt="",gt=0,_e,ge="",Oe=0,et,qe="",ct;if(P&&(be=m(K,"Exif",Se),st=be[0].length+z*12+be[1].length),w&&(ht=m(J,"GPS",Se+st),xt=ht.join(""),gt=xt.length),z){var Pt=Se+st+gt;_e=m(j,"Interop",Pt),ge=_e.join(""),Oe=ge.length}if(B){var Pt=Se+st+gt+Oe;if(et=m(ce,"1st",Pt),ct=a(L.thumbnail),ct.length>64e3)throw new Error("Given thumbnail is too large. max 64kB")}var ft="",Tt="",$="",Ce="\0\0\0\0";if(P){var ke=C+Se,lt=S(">L",[ke]),Ie=34665,yt=S(">H",[Ie]),Ye=S(">H",[V.Long]),tt=S(">L",[1]);ft=yt+Ye+tt+lt}if(w){var ke=C+Se+st,lt=S(">L",[ke]),Ie=34853,yt=S(">H",[Ie]),Ye=S(">H",[V.Long]),tt=S(">L",[1]);Tt=yt+Ye+tt+lt}if(z){var ke=C+Se+st+gt,lt=S(">L",[ke]),Ie=40965,yt=S(">H",[Ie]),Ye=S(">H",[V.Long]),tt=S(">L",[1]);$=yt+Ye+tt+lt}if(B){var ke=C+Se+st+gt+Oe;Ce=S(">L",[ke]);var N=ke+et[0].length+24+4+et[1].length,D="\0\0\0\0"+S(">L",[N]),ne="\0\0\0\0"+S(">L",[ct.length]);qe=et[0]+D+ne+"\0\0\0\0"+et[1]+ct}var fe=te[0]+ft+Tt+Ce+te[1];return P&&($e=be[0]+$+be[1]),W+fe+$e+xt+ge+qe};function r(I){return JSON.parse(JSON.stringify(I))}function a(I){for(var C=E(I);"ÿà"<=C[1].slice(0,2)&&C[1].slice(0,2)<="ÿï";)C=[C[0]].concat(C.slice(2));return C.join("")}function l(I){return S(">"+F("B",I.length),I)}function u(I){return S(">"+F("H",I.length),I)}function o(I){return S(">"+F("L",I.length),I)}function p(I,C,L){var W="",P="",w,z,B,Y;if(C=="Byte")w=I.length,w<=4?P=l(I)+F("\0",4-w):(P=S(">L",[L]),W=l(I));else if(C=="Short")w=I.length,w<=2?P=u(I)+F("\0\0",2-w):(P=S(">L",[L]),W=u(I));else if(C=="Long")w=I.length,w<=1?P=o(I):(P=S(">L",[L]),W=o(I));else if(C=="Ascii")z=I+"\0",w=z.length,w>4?(P=S(">L",[L]),W=z):P=z+F("\0",4-w);else if(C=="Rational"){if(typeof I[0]=="number")w=1,B=I[0],Y=I[1],z=S(">L",[B])+S(">L",[Y]);else{w=I.length,z="";for(var K=0;K<w;K++)B=I[K][0],Y=I[K][1],z+=S(">L",[B])+S(">L",[Y])}P=S(">L",[L]),W=z}else if(C=="SRational"){if(typeof I[0]=="number")w=1,B=I[0],Y=I[1],z=S(">l",[B])+S(">l",[Y]);else{w=I.length,z="";for(var K=0;K<w;K++)B=I[K][0],Y=I[K][1],z+=S(">l",[B])+S(">l",[Y])}P=S(">L",[L]),W=z}else C=="Undefined"&&(w=I.length,w>4?(P=S(">L",[L]),W=I):P=I+F("\0",4-w));var j=S(">L",[w]);return[j,P,W]}function m(I,C,L){var W=8,P=Object.keys(I).length,w=S(">H",[P]),z;["0th","1st"].indexOf(C)>-1?z=2+P*12+4:z=2+P*12;var B="",Y="",K;for(var K in I)if(typeof K=="string"&&(K=parseInt(K)),!(C=="0th"&&[34665,34853].indexOf(K)>-1)){{if(C=="Exif"&&K==40965)continue;if(C=="1st"&&[513,514].indexOf(K)>-1)continue}var j=I[K],J=S(">H",[K]),ce=X[C][K].type,te=S(">H",[V[ce]]);typeof j=="number"&&(j=[j]);var Se=W+z+L+Y.length,be=p(j,ce,Se),$e=be[0],st=be[1],ht=be[2];B+=J+te+$e+st,Y+=ht}return[w+B,Y]}function x(I){var C,L;if(I.slice(0,2)=="ÿØ")C=E(I),L=b(C),L?this.tiftag=L.slice(10):this.tiftag=null;else if(["II","MM"].indexOf(I.slice(0,2))>-1)this.tiftag=I;else if(I.slice(0,4)=="Exif")this.tiftag=I.slice(6);else throw new Error("Given file is neither JPEG nor TIFF.")}if(x.prototype={get_ifd:function(I,C){var L={},W=T(this.endian_mark+"H",this.tiftag.slice(I,I+2))[0],P=I+2,w;["0th","1st"].indexOf(C)>-1?w="Image":w=C;for(var z=0;z<W;z++){I=P+12*z;var B=T(this.endian_mark+"H",this.tiftag.slice(I,I+2))[0],Y=T(this.endian_mark+"H",this.tiftag.slice(I+2,I+4))[0],K=T(this.endian_mark+"L",this.tiftag.slice(I+4,I+8))[0],j=this.tiftag.slice(I+8,I+12),J=[Y,K,j];B in X[w]&&(L[B]=this.convert_value(J))}return C=="0th"&&(I=P+12*W,L.first_ifd_pointer=this.tiftag.slice(I,I+4)),L},convert_value:function(I){var C=null,L=I[0],W=I[1],P=I[2],w;if(L==1)W>4?(w=T(this.endian_mark+"L",P)[0],C=T(this.endian_mark+F("B",W),this.tiftag.slice(w,w+W))):C=T(this.endian_mark+F("B",W),P.slice(0,W));else if(L==2)W>4?(w=T(this.endian_mark+"L",P)[0],C=this.tiftag.slice(w,w+W-1)):C=P.slice(0,W-1);else if(L==3)W>2?(w=T(this.endian_mark+"L",P)[0],C=T(this.endian_mark+F("H",W),this.tiftag.slice(w,w+W*2))):C=T(this.endian_mark+F("H",W),P.slice(0,W*2));else if(L==4)W>1?(w=T(this.endian_mark+"L",P)[0],C=T(this.endian_mark+F("L",W),this.tiftag.slice(w,w+W*4))):C=T(this.endian_mark+F("L",W),P);else if(L==5)if(w=T(this.endian_mark+"L",P)[0],W>1){C=[];for(var z=0;z<W;z++)C.push([T(this.endian_mark+"L",this.tiftag.slice(w+z*8,w+4+z*8))[0],T(this.endian_mark+"L",this.tiftag.slice(w+4+z*8,w+8+z*8))[0]])}else C=[T(this.endian_mark+"L",this.tiftag.slice(w,w+4))[0],T(this.endian_mark+"L",this.tiftag.slice(w+4,w+8))[0]];else if(L==7)W>4?(w=T(this.endian_mark+"L",P)[0],C=this.tiftag.slice(w,w+W)):C=P.slice(0,W);else if(L==9)W>1?(w=T(this.endian_mark+"L",P)[0],C=T(this.endian_mark+F("l",W),this.tiftag.slice(w,w+W*4))):C=T(this.endian_mark+F("l",W),P);else if(L==10)if(w=T(this.endian_mark+"L",P)[0],W>1){C=[];for(var z=0;z<W;z++)C.push([T(this.endian_mark+"l",this.tiftag.slice(w+z*8,w+4+z*8))[0],T(this.endian_mark+"l",this.tiftag.slice(w+4+z*8,w+8+z*8))[0]])}else C=[T(this.endian_mark+"l",this.tiftag.slice(w,w+4))[0],T(this.endian_mark+"l",this.tiftag.slice(w+4,w+8))[0]];else throw new Error("Exif might be wrong. Got incorrect value type to decode. type:"+L);return C instanceof Array&&C.length==1?C[0]:C}},typeof window<"u"&&typeof window.btoa=="function")var v=window.btoa;if(typeof v>"u")var v=function(C){for(var L="",W,P,w,z,B,Y,K,j=0,J="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";j<C.length;)W=C.charCodeAt(j++),P=C.charCodeAt(j++),w=C.charCodeAt(j++),z=W>>2,B=(W&3)<<4|P>>4,Y=(P&15)<<2|w>>6,K=w&63,isNaN(P)?Y=K=64:isNaN(w)&&(K=64),L=L+J.charAt(z)+J.charAt(B)+J.charAt(Y)+J.charAt(K);return L};if(typeof window<"u"&&typeof window.atob=="function")var y=window.atob;if(typeof y>"u")var y=function(C){var L="",W,P,w,z,B,Y,K,j=0,J="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";for(C=C.replace(/[^A-Za-z0-9\+\/\=]/g,"");j<C.length;)z=J.indexOf(C.charAt(j++)),B=J.indexOf(C.charAt(j++)),Y=J.indexOf(C.charAt(j++)),K=J.indexOf(C.charAt(j++)),W=z<<2|B>>4,P=(B&15)<<4|Y>>2,w=(Y&3)<<6|K,L=L+String.fromCharCode(W),Y!=64&&(L=L+String.fromCharCode(P)),K!=64&&(L=L+String.fromCharCode(w));return L};function S(I,C){if(!(C instanceof Array))throw new Error("'pack' error. Got invalid type argument.");if(I.length-1!=C.length)throw new Error("'pack' error. "+(I.length-1)+" marks, "+C.length+" elements.");var L;if(I[0]=="<")L=!0;else if(I[0]==">")L=!1;else throw new Error("");for(var W="",P=1,w=null,z=null,B=null;z=I[P];){if(z.toLowerCase()=="b"){if(w=C[P-1],z=="b"&&w<0&&(w+=256),w>255||w<0)throw new Error("'pack' error.");B=String.fromCharCode(w)}else if(z=="H"){if(w=C[P-1],w>65535||w<0)throw new Error("'pack' error.");B=String.fromCharCode(Math.floor(w%65536/256))+String.fromCharCode(w%256),L&&(B=B.split("").reverse().join(""))}else if(z.toLowerCase()=="l"){if(w=C[P-1],z=="l"&&w<0&&(w+=4294967296),w>4294967295||w<0)throw new Error("'pack' error.");B=String.fromCharCode(Math.floor(w/16777216))+String.fromCharCode(Math.floor(w%16777216/65536))+String.fromCharCode(Math.floor(w%65536/256))+String.fromCharCode(w%256),L&&(B=B.split("").reverse().join(""))}else throw new Error("'pack' error.");W+=B,P+=1}return W}function T(I,C){if(typeof C!="string")throw new Error("'unpack' error. Got invalid type argument.");for(var L=0,W=1;W<I.length;W++)if(I[W].toLowerCase()=="b")L+=1;else if(I[W].toLowerCase()=="h")L+=2;else if(I[W].toLowerCase()=="l")L+=4;else throw new Error("'unpack' error. Got invalid mark.");if(L!=C.length)throw new Error("'unpack' error. Mismatch between symbol and string length. "+L+":"+C.length);var P;if(I[0]=="<")P=!0;else if(I[0]==">")P=!1;else throw new Error("'unpack' error.");for(var w=[],z=0,B=1,Y=null,K=null,j=null,J="";K=I[B];){if(K.toLowerCase()=="b")j=1,J=C.slice(z,z+j),Y=J.charCodeAt(0),K=="b"&&Y>=128&&(Y-=256);else if(K=="H")j=2,J=C.slice(z,z+j),P&&(J=J.split("").reverse().join("")),Y=J.charCodeAt(0)*256+J.charCodeAt(1);else if(K.toLowerCase()=="l")j=4,J=C.slice(z,z+j),P&&(J=J.split("").reverse().join("")),Y=J.charCodeAt(0)*16777216+J.charCodeAt(1)*65536+J.charCodeAt(2)*256+J.charCodeAt(3),K=="l"&&Y>=2147483648&&(Y-=4294967296);else throw new Error("'unpack' error. "+K);w.push(Y),z+=j,B+=1}return w}function F(I,C){for(var L="",W=0;W<C;W++)L+=I;return L}function E(I){if(I.slice(0,2)!="ÿØ")throw new Error("Given data isn't JPEG.");for(var C=2,L=["ÿØ"];;){if(I.slice(C,C+2)=="ÿÚ"){L.push(I.slice(C));break}else{var W=T(">H",I.slice(C+2,C+4))[0],P=C+W+2;L.push(I.slice(C,P)),C=P}if(C>=I.length)throw new Error("Wrong JPEG data.")}return L}function b(I){for(var C,L=0;L<I.length;L++)if(C=I[L],C.slice(0,2)=="ÿá"&&C.slice(4,10)=="Exif\0\0")return C;return null}function H(I,C){var L=!1,W=[];return I.forEach(function(P,w){P.slice(0,2)=="ÿá"&&P.slice(4,10)=="Exif\0\0"&&(L?W.unshift(w):(I[w]=C,L=!0))}),W.forEach(function(P){I.splice(P,1)}),!L&&C&&(I=[I[0],C].concat(I.slice(1))),I.join("")}var V={Byte:1,Ascii:2,Short:3,Long:4,Rational:5,Undefined:7,SLong:9,SRational:10},X={Image:{11:{name:"ProcessingSoftware",type:"Ascii"},254:{name:"NewSubfileType",type:"Long"},255:{name:"SubfileType",type:"Short"},256:{name:"ImageWidth",type:"Long"},257:{name:"ImageLength",type:"Long"},258:{name:"BitsPerSample",type:"Short"},259:{name:"Compression",type:"Short"},262:{name:"PhotometricInterpretation",type:"Short"},263:{name:"Threshholding",type:"Short"},264:{name:"CellWidth",type:"Short"},265:{name:"CellLength",type:"Short"},266:{name:"FillOrder",type:"Short"},269:{name:"DocumentName",type:"Ascii"},270:{name:"ImageDescription",type:"Ascii"},271:{name:"Make",type:"Ascii"},272:{name:"Model",type:"Ascii"},273:{name:"StripOffsets",type:"Long"},274:{name:"Orientation",type:"Short"},277:{name:"SamplesPerPixel",type:"Short"},278:{name:"RowsPerStrip",type:"Long"},279:{name:"StripByteCounts",type:"Long"},282:{name:"XResolution",type:"Rational"},283:{name:"YResolution",type:"Rational"},284:{name:"PlanarConfiguration",type:"Short"},290:{name:"GrayResponseUnit",type:"Short"},291:{name:"GrayResponseCurve",type:"Short"},292:{name:"T4Options",type:"Long"},293:{name:"T6Options",type:"Long"},296:{name:"ResolutionUnit",type:"Short"},301:{name:"TransferFunction",type:"Short"},305:{name:"Software",type:"Ascii"},306:{name:"DateTime",type:"Ascii"},315:{name:"Artist",type:"Ascii"},316:{name:"HostComputer",type:"Ascii"},317:{name:"Predictor",type:"Short"},318:{name:"WhitePoint",type:"Rational"},319:{name:"PrimaryChromaticities",type:"Rational"},320:{name:"ColorMap",type:"Short"},321:{name:"HalftoneHints",type:"Short"},322:{name:"TileWidth",type:"Short"},323:{name:"TileLength",type:"Short"},324:{name:"TileOffsets",type:"Short"},325:{name:"TileByteCounts",type:"Short"},330:{name:"SubIFDs",type:"Long"},332:{name:"InkSet",type:"Short"},333:{name:"InkNames",type:"Ascii"},334:{name:"NumberOfInks",type:"Short"},336:{name:"DotRange",type:"Byte"},337:{name:"TargetPrinter",type:"Ascii"},338:{name:"ExtraSamples",type:"Short"},339:{name:"SampleFormat",type:"Short"},340:{name:"SMinSampleValue",type:"Short"},341:{name:"SMaxSampleValue",type:"Short"},342:{name:"TransferRange",type:"Short"},343:{name:"ClipPath",type:"Byte"},344:{name:"XClipPathUnits",type:"Long"},345:{name:"YClipPathUnits",type:"Long"},346:{name:"Indexed",type:"Short"},347:{name:"JPEGTables",type:"Undefined"},351:{name:"OPIProxy",type:"Short"},512:{name:"JPEGProc",type:"Long"},513:{name:"JPEGInterchangeFormat",type:"Long"},514:{name:"JPEGInterchangeFormatLength",type:"Long"},515:{name:"JPEGRestartInterval",type:"Short"},517:{name:"JPEGLosslessPredictors",type:"Short"},518:{name:"JPEGPointTransforms",type:"Short"},519:{name:"JPEGQTables",type:"Long"},520:{name:"JPEGDCTables",type:"Long"},521:{name:"JPEGACTables",type:"Long"},529:{name:"YCbCrCoefficients",type:"Rational"},530:{name:"YCbCrSubSampling",type:"Short"},531:{name:"YCbCrPositioning",type:"Short"},532:{name:"ReferenceBlackWhite",type:"Rational"},700:{name:"XMLPacket",type:"Byte"},18246:{name:"Rating",type:"Short"},18249:{name:"RatingPercent",type:"Short"},32781:{name:"ImageID",type:"Ascii"},33421:{name:"CFARepeatPatternDim",type:"Short"},33422:{name:"CFAPattern",type:"Byte"},33423:{name:"BatteryLevel",type:"Rational"},33432:{name:"Copyright",type:"Ascii"},33434:{name:"ExposureTime",type:"Rational"},34377:{name:"ImageResources",type:"Byte"},34665:{name:"ExifTag",type:"Long"},34675:{name:"InterColorProfile",type:"Undefined"},34853:{name:"GPSTag",type:"Long"},34857:{name:"Interlace",type:"Short"},34858:{name:"TimeZoneOffset",type:"Long"},34859:{name:"SelfTimerMode",type:"Short"},37387:{name:"FlashEnergy",type:"Rational"},37388:{name:"SpatialFrequencyResponse",type:"Undefined"},37389:{name:"Noise",type:"Undefined"},37390:{name:"FocalPlaneXResolution",type:"Rational"},37391:{name:"FocalPlaneYResolution",type:"Rational"},37392:{name:"FocalPlaneResolutionUnit",type:"Short"},37393:{name:"ImageNumber",type:"Long"},37394:{name:"SecurityClassification",type:"Ascii"},37395:{name:"ImageHistory",type:"Ascii"},37397:{name:"ExposureIndex",type:"Rational"},37398:{name:"TIFFEPStandardID",type:"Byte"},37399:{name:"SensingMethod",type:"Short"},40091:{name:"XPTitle",type:"Byte"},40092:{name:"XPComment",type:"Byte"},40093:{name:"XPAuthor",type:"Byte"},40094:{name:"XPKeywords",type:"Byte"},40095:{name:"XPSubject",type:"Byte"},50341:{name:"PrintImageMatching",type:"Undefined"},50706:{name:"DNGVersion",type:"Byte"},50707:{name:"DNGBackwardVersion",type:"Byte"},50708:{name:"UniqueCameraModel",type:"Ascii"},50709:{name:"LocalizedCameraModel",type:"Byte"},50710:{name:"CFAPlaneColor",type:"Byte"},50711:{name:"CFALayout",type:"Short"},50712:{name:"LinearizationTable",type:"Short"},50713:{name:"BlackLevelRepeatDim",type:"Short"},50714:{name:"BlackLevel",type:"Rational"},50715:{name:"BlackLevelDeltaH",type:"SRational"},50716:{name:"BlackLevelDeltaV",type:"SRational"},50717:{name:"WhiteLevel",type:"Short"},50718:{name:"DefaultScale",type:"Rational"},50719:{name:"DefaultCropOrigin",type:"Short"},50720:{name:"DefaultCropSize",type:"Short"},50721:{name:"ColorMatrix1",type:"SRational"},50722:{name:"ColorMatrix2",type:"SRational"},50723:{name:"CameraCalibration1",type:"SRational"},50724:{name:"CameraCalibration2",type:"SRational"},50725:{name:"ReductionMatrix1",type:"SRational"},50726:{name:"ReductionMatrix2",type:"SRational"},50727:{name:"AnalogBalance",type:"Rational"},50728:{name:"AsShotNeutral",type:"Short"},50729:{name:"AsShotWhiteXY",type:"Rational"},50730:{name:"BaselineExposure",type:"SRational"},50731:{name:"BaselineNoise",type:"Rational"},50732:{name:"BaselineSharpness",type:"Rational"},50733:{name:"BayerGreenSplit",type:"Long"},50734:{name:"LinearResponseLimit",type:"Rational"},50735:{name:"CameraSerialNumber",type:"Ascii"},50736:{name:"LensInfo",type:"Rational"},50737:{name:"ChromaBlurRadius",type:"Rational"},50738:{name:"AntiAliasStrength",type:"Rational"},50739:{name:"ShadowScale",type:"SRational"},50740:{name:"DNGPrivateData",type:"Byte"},50741:{name:"MakerNoteSafety",type:"Short"},50778:{name:"CalibrationIlluminant1",type:"Short"},50779:{name:"CalibrationIlluminant2",type:"Short"},50780:{name:"BestQualityScale",type:"Rational"},50781:{name:"RawDataUniqueID",type:"Byte"},50827:{name:"OriginalRawFileName",type:"Byte"},50828:{name:"OriginalRawFileData",type:"Undefined"},50829:{name:"ActiveArea",type:"Short"},50830:{name:"MaskedAreas",type:"Short"},50831:{name:"AsShotICCProfile",type:"Undefined"},50832:{name:"AsShotPreProfileMatrix",type:"SRational"},50833:{name:"CurrentICCProfile",type:"Undefined"},50834:{name:"CurrentPreProfileMatrix",type:"SRational"},50879:{name:"ColorimetricReference",type:"Short"},50931:{name:"CameraCalibrationSignature",type:"Byte"},50932:{name:"ProfileCalibrationSignature",type:"Byte"},50934:{name:"AsShotProfileName",type:"Byte"},50935:{name:"NoiseReductionApplied",type:"Rational"},50936:{name:"ProfileName",type:"Byte"},50937:{name:"ProfileHueSatMapDims",type:"Long"},50938:{name:"ProfileHueSatMapData1",type:"Float"},50939:{name:"ProfileHueSatMapData2",type:"Float"},50940:{name:"ProfileToneCurve",type:"Float"},50941:{name:"ProfileEmbedPolicy",type:"Long"},50942:{name:"ProfileCopyright",type:"Byte"},50964:{name:"ForwardMatrix1",type:"SRational"},50965:{name:"ForwardMatrix2",type:"SRational"},50966:{name:"PreviewApplicationName",type:"Byte"},50967:{name:"PreviewApplicationVersion",type:"Byte"},50968:{name:"PreviewSettingsName",type:"Byte"},50969:{name:"PreviewSettingsDigest",type:"Byte"},50970:{name:"PreviewColorSpace",type:"Long"},50971:{name:"PreviewDateTime",type:"Ascii"},50972:{name:"RawImageDigest",type:"Undefined"},50973:{name:"OriginalRawFileDigest",type:"Undefined"},50974:{name:"SubTileBlockSize",type:"Long"},50975:{name:"RowInterleaveFactor",type:"Long"},50981:{name:"ProfileLookTableDims",type:"Long"},50982:{name:"ProfileLookTableData",type:"Float"},51008:{name:"OpcodeList1",type:"Undefined"},51009:{name:"OpcodeList2",type:"Undefined"},51022:{name:"OpcodeList3",type:"Undefined"}},Exif:{33434:{name:"ExposureTime",type:"Rational"},33437:{name:"FNumber",type:"Rational"},34850:{name:"ExposureProgram",type:"Short"},34852:{name:"SpectralSensitivity",type:"Ascii"},34855:{name:"ISOSpeedRatings",type:"Short"},34856:{name:"OECF",type:"Undefined"},34864:{name:"SensitivityType",type:"Short"},34865:{name:"StandardOutputSensitivity",type:"Long"},34866:{name:"RecommendedExposureIndex",type:"Long"},34867:{name:"ISOSpeed",type:"Long"},34868:{name:"ISOSpeedLatitudeyyy",type:"Long"},34869:{name:"ISOSpeedLatitudezzz",type:"Long"},36864:{name:"ExifVersion",type:"Undefined"},36867:{name:"DateTimeOriginal",type:"Ascii"},36868:{name:"DateTimeDigitized",type:"Ascii"},37121:{name:"ComponentsConfiguration",type:"Undefined"},37122:{name:"CompressedBitsPerPixel",type:"Rational"},37377:{name:"ShutterSpeedValue",type:"SRational"},37378:{name:"ApertureValue",type:"Rational"},37379:{name:"BrightnessValue",type:"SRational"},37380:{name:"ExposureBiasValue",type:"SRational"},37381:{name:"MaxApertureValue",type:"Rational"},37382:{name:"SubjectDistance",type:"Rational"},37383:{name:"MeteringMode",type:"Short"},37384:{name:"LightSource",type:"Short"},37385:{name:"Flash",type:"Short"},37386:{name:"FocalLength",type:"Rational"},37396:{name:"SubjectArea",type:"Short"},37500:{name:"MakerNote",type:"Undefined"},37510:{name:"UserComment",type:"Ascii"},37520:{name:"SubSecTime",type:"Ascii"},37521:{name:"SubSecTimeOriginal",type:"Ascii"},37522:{name:"SubSecTimeDigitized",type:"Ascii"},40960:{name:"FlashpixVersion",type:"Undefined"},40961:{name:"ColorSpace",type:"Short"},40962:{name:"PixelXDimension",type:"Long"},40963:{name:"PixelYDimension",type:"Long"},40964:{name:"RelatedSoundFile",type:"Ascii"},40965:{name:"InteroperabilityTag",type:"Long"},41483:{name:"FlashEnergy",type:"Rational"},41484:{name:"SpatialFrequencyResponse",type:"Undefined"},41486:{name:"FocalPlaneXResolution",type:"Rational"},41487:{name:"FocalPlaneYResolution",type:"Rational"},41488:{name:"FocalPlaneResolutionUnit",type:"Short"},41492:{name:"SubjectLocation",type:"Short"},41493:{name:"ExposureIndex",type:"Rational"},41495:{name:"SensingMethod",type:"Short"},41728:{name:"FileSource",type:"Undefined"},41729:{name:"SceneType",type:"Undefined"},41730:{name:"CFAPattern",type:"Undefined"},41985:{name:"CustomRendered",type:"Short"},41986:{name:"ExposureMode",type:"Short"},41987:{name:"WhiteBalance",type:"Short"},41988:{name:"DigitalZoomRatio",type:"Rational"},41989:{name:"FocalLengthIn35mmFilm",type:"Short"},41990:{name:"SceneCaptureType",type:"Short"},41991:{name:"GainControl",type:"Short"},41992:{name:"Contrast",type:"Short"},41993:{name:"Saturation",type:"Short"},41994:{name:"Sharpness",type:"Short"},41995:{name:"DeviceSettingDescription",type:"Undefined"},41996:{name:"SubjectDistanceRange",type:"Short"},42016:{name:"ImageUniqueID",type:"Ascii"},42032:{name:"CameraOwnerName",type:"Ascii"},42033:{name:"BodySerialNumber",type:"Ascii"},42034:{name:"LensSpecification",type:"Rational"},42035:{name:"LensMake",type:"Ascii"},42036:{name:"LensModel",type:"Ascii"},42037:{name:"LensSerialNumber",type:"Ascii"},42240:{name:"Gamma",type:"Rational"}},GPS:{0:{name:"GPSVersionID",type:"Byte"},1:{name:"GPSLatitudeRef",type:"Ascii"},2:{name:"GPSLatitude",type:"Rational"},3:{name:"GPSLongitudeRef",type:"Ascii"},4:{name:"GPSLongitude",type:"Rational"},5:{name:"GPSAltitudeRef",type:"Byte"},6:{name:"GPSAltitude",type:"Rational"},7:{name:"GPSTimeStamp",type:"Rational"},8:{name:"GPSSatellites",type:"Ascii"},9:{name:"GPSStatus",type:"Ascii"},10:{name:"GPSMeasureMode",type:"Ascii"},11:{name:"GPSDOP",type:"Rational"},12:{name:"GPSSpeedRef",type:"Ascii"},13:{name:"GPSSpeed",type:"Rational"},14:{name:"GPSTrackRef",type:"Ascii"},15:{name:"GPSTrack",type:"Rational"},16:{name:"GPSImgDirectionRef",type:"Ascii"},17:{name:"GPSImgDirection",type:"Rational"},18:{name:"GPSMapDatum",type:"Ascii"},19:{name:"GPSDestLatitudeRef",type:"Ascii"},20:{name:"GPSDestLatitude",type:"Rational"},21:{name:"GPSDestLongitudeRef",type:"Ascii"},22:{name:"GPSDestLongitude",type:"Rational"},23:{name:"GPSDestBearingRef",type:"Ascii"},24:{name:"GPSDestBearing",type:"Rational"},25:{name:"GPSDestDistanceRef",type:"Ascii"},26:{name:"GPSDestDistance",type:"Rational"},27:{name:"GPSProcessingMethod",type:"Undefined"},28:{name:"GPSAreaInformation",type:"Undefined"},29:{name:"GPSDateStamp",type:"Ascii"},30:{name:"GPSDifferential",type:"Short"},31:{name:"GPSHPositioningError",type:"Rational"}},Interop:{1:{name:"InteroperabilityIndex",type:"Ascii"}}};X["0th"]=X.Image,X["1st"]=X.Image,t.TAGS=X,t.ImageIFD={ProcessingSoftware:11,NewSubfileType:254,SubfileType:255,ImageWidth:256,ImageLength:257,BitsPerSample:258,Compression:259,PhotometricInterpretation:262,Threshholding:263,CellWidth:264,CellLength:265,FillOrder:266,DocumentName:269,ImageDescription:270,Make:271,Model:272,StripOffsets:273,Orientation:274,SamplesPerPixel:277,RowsPerStrip:278,StripByteCounts:279,XResolution:282,YResolution:283,PlanarConfiguration:284,GrayResponseUnit:290,GrayResponseCurve:291,T4Options:292,T6Options:293,ResolutionUnit:296,TransferFunction:301,Software:305,DateTime:306,Artist:315,HostComputer:316,Predictor:317,WhitePoint:318,PrimaryChromaticities:319,ColorMap:320,HalftoneHints:321,TileWidth:322,TileLength:323,TileOffsets:324,TileByteCounts:325,SubIFDs:330,InkSet:332,InkNames:333,NumberOfInks:334,DotRange:336,TargetPrinter:337,ExtraSamples:338,SampleFormat:339,SMinSampleValue:340,SMaxSampleValue:341,TransferRange:342,ClipPath:343,XClipPathUnits:344,YClipPathUnits:345,Indexed:346,JPEGTables:347,OPIProxy:351,JPEGProc:512,JPEGInterchangeFormat:513,JPEGInterchangeFormatLength:514,JPEGRestartInterval:515,JPEGLosslessPredictors:517,JPEGPointTransforms:518,JPEGQTables:519,JPEGDCTables:520,JPEGACTables:521,YCbCrCoefficients:529,YCbCrSubSampling:530,YCbCrPositioning:531,ReferenceBlackWhite:532,XMLPacket:700,Rating:18246,RatingPercent:18249,ImageID:32781,CFARepeatPatternDim:33421,CFAPattern:33422,BatteryLevel:33423,Copyright:33432,ExposureTime:33434,ImageResources:34377,ExifTag:34665,InterColorProfile:34675,GPSTag:34853,Interlace:34857,TimeZoneOffset:34858,SelfTimerMode:34859,FlashEnergy:37387,SpatialFrequencyResponse:37388,Noise:37389,FocalPlaneXResolution:37390,FocalPlaneYResolution:37391,FocalPlaneResolutionUnit:37392,ImageNumber:37393,SecurityClassification:37394,ImageHistory:37395,ExposureIndex:37397,TIFFEPStandardID:37398,SensingMethod:37399,XPTitle:40091,XPComment:40092,XPAuthor:40093,XPKeywords:40094,XPSubject:40095,PrintImageMatching:50341,DNGVersion:50706,DNGBackwardVersion:50707,UniqueCameraModel:50708,LocalizedCameraModel:50709,CFAPlaneColor:50710,CFALayout:50711,LinearizationTable:50712,BlackLevelRepeatDim:50713,BlackLevel:50714,BlackLevelDeltaH:50715,BlackLevelDeltaV:50716,WhiteLevel:50717,DefaultScale:50718,DefaultCropOrigin:50719,DefaultCropSize:50720,ColorMatrix1:50721,ColorMatrix2:50722,CameraCalibration1:50723,CameraCalibration2:50724,ReductionMatrix1:50725,ReductionMatrix2:50726,AnalogBalance:50727,AsShotNeutral:50728,AsShotWhiteXY:50729,BaselineExposure:50730,BaselineNoise:50731,BaselineSharpness:50732,BayerGreenSplit:50733,LinearResponseLimit:50734,CameraSerialNumber:50735,LensInfo:50736,ChromaBlurRadius:50737,AntiAliasStrength:50738,ShadowScale:50739,DNGPrivateData:50740,MakerNoteSafety:50741,CalibrationIlluminant1:50778,CalibrationIlluminant2:50779,BestQualityScale:50780,RawDataUniqueID:50781,OriginalRawFileName:50827,OriginalRawFileData:50828,ActiveArea:50829,MaskedAreas:50830,AsShotICCProfile:50831,AsShotPreProfileMatrix:50832,CurrentICCProfile:50833,CurrentPreProfileMatrix:50834,ColorimetricReference:50879,CameraCalibrationSignature:50931,ProfileCalibrationSignature:50932,AsShotProfileName:50934,NoiseReductionApplied:50935,ProfileName:50936,ProfileHueSatMapDims:50937,ProfileHueSatMapData1:50938,ProfileHueSatMapData2:50939,ProfileToneCurve:50940,ProfileEmbedPolicy:50941,ProfileCopyright:50942,ForwardMatrix1:50964,ForwardMatrix2:50965,PreviewApplicationName:50966,PreviewApplicationVersion:50967,PreviewSettingsName:50968,PreviewSettingsDigest:50969,PreviewColorSpace:50970,PreviewDateTime:50971,RawImageDigest:50972,OriginalRawFileDigest:50973,SubTileBlockSize:50974,RowInterleaveFactor:50975,ProfileLookTableDims:50981,ProfileLookTableData:50982,OpcodeList1:51008,OpcodeList2:51009,OpcodeList3:51022,NoiseProfile:51041},t.ExifIFD={ExposureTime:33434,FNumber:33437,ExposureProgram:34850,SpectralSensitivity:34852,ISOSpeedRatings:34855,OECF:34856,SensitivityType:34864,StandardOutputSensitivity:34865,RecommendedExposureIndex:34866,ISOSpeed:34867,ISOSpeedLatitudeyyy:34868,ISOSpeedLatitudezzz:34869,ExifVersion:36864,DateTimeOriginal:36867,DateTimeDigitized:36868,ComponentsConfiguration:37121,CompressedBitsPerPixel:37122,ShutterSpeedValue:37377,ApertureValue:37378,BrightnessValue:37379,ExposureBiasValue:37380,MaxApertureValue:37381,SubjectDistance:37382,MeteringMode:37383,LightSource:37384,Flash:37385,FocalLength:37386,SubjectArea:37396,MakerNote:37500,UserComment:37510,SubSecTime:37520,SubSecTimeOriginal:37521,SubSecTimeDigitized:37522,FlashpixVersion:40960,ColorSpace:40961,PixelXDimension:40962,PixelYDimension:40963,RelatedSoundFile:40964,InteroperabilityTag:40965,FlashEnergy:41483,SpatialFrequencyResponse:41484,FocalPlaneXResolution:41486,FocalPlaneYResolution:41487,FocalPlaneResolutionUnit:41488,SubjectLocation:41492,ExposureIndex:41493,SensingMethod:41495,FileSource:41728,SceneType:41729,CFAPattern:41730,CustomRendered:41985,ExposureMode:41986,WhiteBalance:41987,DigitalZoomRatio:41988,FocalLengthIn35mmFilm:41989,SceneCaptureType:41990,GainControl:41991,Contrast:41992,Saturation:41993,Sharpness:41994,DeviceSettingDescription:41995,SubjectDistanceRange:41996,ImageUniqueID:42016,CameraOwnerName:42032,BodySerialNumber:42033,LensSpecification:42034,LensMake:42035,LensModel:42036,LensSerialNumber:42037,Gamma:42240},t.GPSIFD={GPSVersionID:0,GPSLatitudeRef:1,GPSLatitude:2,GPSLongitudeRef:3,GPSLongitude:4,GPSAltitudeRef:5,GPSAltitude:6,GPSTimeStamp:7,GPSSatellites:8,GPSStatus:9,GPSMeasureMode:10,GPSDOP:11,GPSSpeedRef:12,GPSSpeed:13,GPSTrackRef:14,GPSTrack:15,GPSImgDirectionRef:16,GPSImgDirection:17,GPSMapDatum:18,GPSDestLatitudeRef:19,GPSDestLatitude:20,GPSDestLongitudeRef:21,GPSDestLongitude:22,GPSDestBearingRef:23,GPSDestBearing:24,GPSDestDistanceRef:25,GPSDestDistance:26,GPSProcessingMethod:27,GPSAreaInformation:28,GPSDateStamp:29,GPSDifferential:30,GPSHPositioningError:31},t.InteropIFD={InteroperabilityIndex:1},t.GPSHelper={degToDmsRational:function(I){var C=Math.abs(I),L=C%1*60,W=L%1*60,P=Math.floor(C),w=Math.floor(L),z=Math.round(W*100);return[[P,1],[w,1],[z,100]]},dmsRationalToDeg:function(I,C){var L=C==="S"||C==="W"?-1:1,W=I[0][0]/I[0][1]+I[1][0]/I[1][1]/60+I[2][0]/I[2][1]/3600;return W*L}},n.exports&&(e=n.exports=t),e.piexif=t})()})(Es,Es.exports)),Es.exports}var Oy=Ny();const ao=Dh(Oy);var Cc={exports:{}};const ky={},Lh=Object.freeze(Object.defineProperty({__proto__:null,default:ky},Symbol.toStringTag,{value:"Module"})),Rc=Uy(Lh);var hd;function By(){return hd||(hd=1,(function(n,e){var t=(()=>{var r,a=typeof document<"u"?(r=document.currentScript)==null?void 0:r.src:void 0;return typeof __filename<"u"&&(a||(a=__filename)),function(l={}){var u,o=l,p,m;new Promise((i,s)=>{p=i,m=s});var x=typeof window=="object",v=typeof importScripts=="function",y=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string",S=Object.assign({},o),T="./this.program",F="";function E(i){return o.locateFile?o.locateFile(i,F):F+i}var b,H,V;if(y){var X=Rc,I=Rc;F=__dirname+"/",b=(i,s)=>(i=Ce(i)?new URL(i):I.normalize(i),X.readFileSync(i,s?void 0:"utf8")),V=i=>{var s=b(i,!0);return s.buffer||(s=new Uint8Array(s)),s},H=(i,s,f,h=!0)=>{i=Ce(i)?new URL(i):I.normalize(i),X.readFile(i,h?void 0:"utf8",(g,M)=>{g?f(g):s(h?M.buffer:M)})},!o.thisProgram&&process.argv.length>1&&(T=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2)}else(x||v)&&(v?F=self.location.href:typeof document<"u"&&document.currentScript&&(F=document.currentScript.src),a&&(F=a),F.startsWith("blob:")?F="":F=F.substr(0,F.replace(/[?#].*/,"").lastIndexOf("/")+1),b=i=>{var s=new XMLHttpRequest;return s.open("GET",i,!1),s.send(null),s.responseText},v&&(V=i=>{var s=new XMLHttpRequest;return s.open("GET",i,!1),s.responseType="arraybuffer",s.send(null),new Uint8Array(s.response)}),H=(i,s,f)=>{if(Ce(i)){var h=new XMLHttpRequest;h.open("GET",i,!0),h.responseType="arraybuffer",h.onload=()=>{if(h.status==200||h.status==0&&h.response){s(h.response);return}f()},h.onerror=f,h.send(null);return}fetch(i,{credentials:"same-origin"}).then(g=>g.ok?g.arrayBuffer():Promise.reject(new Error(g.status+" : "+g.url))).then(s,f)});var C=o.print||console.log.bind(console),L=o.printErr||console.error.bind(console);Object.assign(o,S),S=null,o.arguments&&o.arguments,o.thisProgram&&(T=o.thisProgram),o.quit&&o.quit;var W;o.wasmBinary&&(W=o.wasmBinary);var P,w=!1,z,B,Y,K,j,J,ce,te;function Se(){var i=P.buffer;o.HEAP8=z=new Int8Array(i),o.HEAP16=Y=new Int16Array(i),o.HEAPU8=B=new Uint8Array(i),o.HEAPU16=K=new Uint16Array(i),o.HEAP32=j=new Int32Array(i),o.HEAPU32=J=new Uint32Array(i),o.HEAPF32=ce=new Float32Array(i),o.HEAPF64=te=new Float64Array(i)}var be=[],$e=[],st=[];function ht(){if(o.preRun)for(typeof o.preRun=="function"&&(o.preRun=[o.preRun]);o.preRun.length;)_e(o.preRun.shift());ne(be)}function xt(){!o.noFSInit&&!A.init.initialized&&A.init(),A.ignorePermissions=!1,ne($e)}function gt(){if(o.postRun)for(typeof o.postRun=="function"&&(o.postRun=[o.postRun]);o.postRun.length;)Oe(o.postRun.shift());ne(st)}function _e(i){be.unshift(i)}function ge(i){$e.unshift(i)}function Oe(i){st.unshift(i)}var et=0,qe=null;function ct(i){var s;et++,(s=o.monitorRunDependencies)==null||s.call(o,et)}function Pt(i){var s;if(et--,(s=o.monitorRunDependencies)==null||s.call(o,et),et==0&&qe){var f=qe;qe=null,f()}}function ft(i){var s;(s=o.onAbort)==null||s.call(o,i),i="Aborted("+i+")",L(i),w=!0,i+=". Build with -sASSERTIONS for more info.";var f=new WebAssembly.RuntimeError(i);throw m(f),f}var Tt="data:application/octet-stream;base64,",$=i=>i.startsWith(Tt),Ce=i=>i.startsWith("file://");function ke(){var i="libheif.wasm";return $(i)?i:E(i)}var lt;function Ie(i){if(i==lt&&W)return new Uint8Array(W);if(V)return V(i);throw'sync fetching of the wasm failed: you can preload it to Module["wasmBinary"] manually, or emcc.py will do that for you when generating HTML (but not JS)'}function yt(i,s){var f,h=Ie(i);f=new WebAssembly.Module(h);var g=new WebAssembly.Instance(f,s);return[g,f]}function Ye(){return{a:Xl}}function tt(){var i=Ye();function s(h,g){return k=h.exports,P=k.Q,Se(),Fo=k.T,ge(k.R),Pt(),k}if(ct(),o.instantiateWasm)try{return o.instantiateWasm(i,s)}catch(h){L(`Module.instantiateWasm callback failed with error: ${h}`),m(h)}lt||(lt=ke());var f=yt(lt,i);return s(f[0])}var N,D,ne=i=>{for(;i.length>0;)i.shift()(o)};o.noExitRuntime;var fe=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0,de=(i,s,f)=>{for(var h=s+f,g=s;i[g]&&!(g>=h);)++g;if(g-s>16&&i.buffer&&fe)return fe.decode(i.subarray(s,g));for(var M="";s<g;){var O=i[s++];if(!(O&128)){M+=String.fromCharCode(O);continue}var G=i[s++]&63;if((O&224)==192){M+=String.fromCharCode((O&31)<<6|G);continue}var Z=i[s++]&63;if((O&240)==224?O=(O&15)<<12|G<<6|Z:O=(O&7)<<18|G<<12|Z<<6|i[s++]&63,O<65536)M+=String.fromCharCode(O);else{var re=O-65536;M+=String.fromCharCode(55296|re>>10,56320|re&1023)}}return M},ie=(i,s)=>i?de(B,i,s):"",Ke=(i,s,f,h)=>{ft(`Assertion failed: ${ie(i)}, at: `+[s?ie(s):"unknown filename",f,h?ie(h):"unknown function"])};class Ue{constructor(s){this.excPtr=s,this.ptr=s-24}set_type(s){J[this.ptr+4>>2]=s}get_type(){return J[this.ptr+4>>2]}set_destructor(s){J[this.ptr+8>>2]=s}get_destructor(){return J[this.ptr+8>>2]}set_caught(s){s=s?1:0,z[this.ptr+12]=s}get_caught(){return z[this.ptr+12]!=0}set_rethrown(s){s=s?1:0,z[this.ptr+13]=s}get_rethrown(){return z[this.ptr+13]!=0}init(s,f){this.set_adjusted_ptr(0),this.set_type(s),this.set_destructor(f)}set_adjusted_ptr(s){J[this.ptr+16>>2]=s}get_adjusted_ptr(){return J[this.ptr+16>>2]}get_exception_ptr(){var s=$l(this.get_type());if(s)return J[this.excPtr>>2];var f=this.get_adjusted_ptr();return f!==0?f:this.excPtr}}var rt=0,Ze=(i,s,f)=>{var h=new Ue(i);throw h.init(s,f),rt=i,rt};function ve(){var i=j[+$t.varargs>>2];return $t.varargs+=4,i}var he=ve,we={isAbs:i=>i.charAt(0)==="/",splitPath:i=>{var s=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return s.exec(i).slice(1)},normalizeArray:(i,s)=>{for(var f=0,h=i.length-1;h>=0;h--){var g=i[h];g==="."?i.splice(h,1):g===".."?(i.splice(h,1),f++):f&&(i.splice(h,1),f--)}if(s)for(;f;f--)i.unshift("..");return i},normalize:i=>{var s=we.isAbs(i),f=i.substr(-1)==="/";return i=we.normalizeArray(i.split("/").filter(h=>!!h),!s).join("/"),!i&&!s&&(i="."),i&&f&&(i+="/"),(s?"/":"")+i},dirname:i=>{var s=we.splitPath(i),f=s[0],h=s[1];return!f&&!h?".":(h&&(h=h.substr(0,h.length-1)),f+h)},basename:i=>{if(i==="/")return"/";i=we.normalize(i),i=i.replace(/\/$/,"");var s=i.lastIndexOf("/");return s===-1?i:i.substr(s+1)},join:(...i)=>we.normalize(i.join("/")),join2:(i,s)=>we.normalize(i+"/"+s)},je=()=>{if(typeof crypto=="object"&&typeof crypto.getRandomValues=="function")return h=>crypto.getRandomValues(h);if(y)try{var i=Rc,s=i.randomFillSync;if(s)return h=>i.randomFillSync(h);var f=i.randomBytes;return h=>(h.set(f(h.byteLength)),h)}catch{}ft("initRandomDevice")},Be=i=>(Be=je())(i),Qe={resolve:(...i)=>{for(var s="",f=!1,h=i.length-1;h>=-1&&!f;h--){var g=h>=0?i[h]:A.cwd();if(typeof g!="string")throw new TypeError("Arguments to path.resolve must be strings");if(!g)return"";s=g+"/"+s,f=we.isAbs(g)}return s=we.normalizeArray(s.split("/").filter(M=>!!M),!f).join("/"),(f?"/":"")+s||"."},relative:(i,s)=>{i=Qe.resolve(i).substr(1),s=Qe.resolve(s).substr(1);function f(re){for(var se=0;se<re.length&&re[se]==="";se++);for(var xe=re.length-1;xe>=0&&re[xe]==="";xe--);return se>xe?[]:re.slice(se,xe-se+1)}for(var h=f(i.split("/")),g=f(s.split("/")),M=Math.min(h.length,g.length),O=M,G=0;G<M;G++)if(h[G]!==g[G]){O=G;break}for(var Z=[],G=O;G<h.length;G++)Z.push("..");return Z=Z.concat(g.slice(O)),Z.join("/")}},q=[],Fe=i=>{for(var s=0,f=0;f<i.length;++f){var h=i.charCodeAt(f);h<=127?s++:h<=2047?s+=2:h>=55296&&h<=57343?(s+=4,++f):s+=3}return s},Te=(i,s,f,h)=>{if(!(h>0))return 0;for(var g=f,M=f+h-1,O=0;O<i.length;++O){var G=i.charCodeAt(O);if(G>=55296&&G<=57343){var Z=i.charCodeAt(++O);G=65536+((G&1023)<<10)|Z&1023}if(G<=127){if(f>=M)break;s[f++]=G}else if(G<=2047){if(f+1>=M)break;s[f++]=192|G>>6,s[f++]=128|G&63}else if(G<=65535){if(f+2>=M)break;s[f++]=224|G>>12,s[f++]=128|G>>6&63,s[f++]=128|G&63}else{if(f+3>=M)break;s[f++]=240|G>>18,s[f++]=128|G>>12&63,s[f++]=128|G>>6&63,s[f++]=128|G&63}}return s[f]=0,f-g};function Ae(i,s,f){var h=Fe(i)+1,g=new Array(h),M=Te(i,g,0,g.length);return s&&(g.length=M),g}var Ee=()=>{if(!q.length){var i=null;if(y){var s=256,f=Buffer.alloc(s),h=0,g=process.stdin.fd;try{h=X.readSync(g,f,0,s)}catch(M){if(M.toString().includes("EOF"))h=0;else throw M}h>0&&(i=f.slice(0,h).toString("utf-8"))}else typeof window<"u"&&typeof window.prompt=="function"&&(i=window.prompt("Input: "),i!==null&&(i+=`
`));if(!i)return null;q=Ae(i,!0)}return q.shift()},pe={ttys:[],init(){},shutdown(){},register(i,s){pe.ttys[i]={input:[],output:[],ops:s},A.registerDevice(i,pe.stream_ops)},stream_ops:{open(i){var s=pe.ttys[i.node.rdev];if(!s)throw new A.ErrnoError(43);i.tty=s,i.seekable=!1},close(i){i.tty.ops.fsync(i.tty)},fsync(i){i.tty.ops.fsync(i.tty)},read(i,s,f,h,g){if(!i.tty||!i.tty.ops.get_char)throw new A.ErrnoError(60);for(var M=0,O=0;O<h;O++){var G;try{G=i.tty.ops.get_char(i.tty)}catch{throw new A.ErrnoError(29)}if(G===void 0&&M===0)throw new A.ErrnoError(6);if(G==null)break;M++,s[f+O]=G}return M&&(i.node.timestamp=Date.now()),M},write(i,s,f,h,g){if(!i.tty||!i.tty.ops.put_char)throw new A.ErrnoError(60);try{for(var M=0;M<h;M++)i.tty.ops.put_char(i.tty,s[f+M])}catch{throw new A.ErrnoError(29)}return h&&(i.node.timestamp=Date.now()),M}},default_tty_ops:{get_char(i){return Ee()},put_char(i,s){s===null||s===10?(C(de(i.output,0)),i.output=[]):s!=0&&i.output.push(s)},fsync(i){i.output&&i.output.length>0&&(C(de(i.output,0)),i.output=[])},ioctl_tcgets(i){return{c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(i,s,f){return 0},ioctl_tiocgwinsz(i){return[24,80]}},default_tty1_ops:{put_char(i,s){s===null||s===10?(L(de(i.output,0)),i.output=[]):s!=0&&i.output.push(s)},fsync(i){i.output&&i.output.length>0&&(L(de(i.output,0)),i.output=[])}}},Ge=i=>{ft()},Re={ops_table:null,mount(i){return Re.createNode(null,"/",16895,0)},createNode(i,s,f,h){if(A.isBlkdev(f)||A.isFIFO(f))throw new A.ErrnoError(63);Re.ops_table||(Re.ops_table={dir:{node:{getattr:Re.node_ops.getattr,setattr:Re.node_ops.setattr,lookup:Re.node_ops.lookup,mknod:Re.node_ops.mknod,rename:Re.node_ops.rename,unlink:Re.node_ops.unlink,rmdir:Re.node_ops.rmdir,readdir:Re.node_ops.readdir,symlink:Re.node_ops.symlink},stream:{llseek:Re.stream_ops.llseek}},file:{node:{getattr:Re.node_ops.getattr,setattr:Re.node_ops.setattr},stream:{llseek:Re.stream_ops.llseek,read:Re.stream_ops.read,write:Re.stream_ops.write,allocate:Re.stream_ops.allocate,mmap:Re.stream_ops.mmap,msync:Re.stream_ops.msync}},link:{node:{getattr:Re.node_ops.getattr,setattr:Re.node_ops.setattr,readlink:Re.node_ops.readlink},stream:{}},chrdev:{node:{getattr:Re.node_ops.getattr,setattr:Re.node_ops.setattr},stream:A.chrdev_stream_ops}});var g=A.createNode(i,s,f,h);return A.isDir(g.mode)?(g.node_ops=Re.ops_table.dir.node,g.stream_ops=Re.ops_table.dir.stream,g.contents={}):A.isFile(g.mode)?(g.node_ops=Re.ops_table.file.node,g.stream_ops=Re.ops_table.file.stream,g.usedBytes=0,g.contents=null):A.isLink(g.mode)?(g.node_ops=Re.ops_table.link.node,g.stream_ops=Re.ops_table.link.stream):A.isChrdev(g.mode)&&(g.node_ops=Re.ops_table.chrdev.node,g.stream_ops=Re.ops_table.chrdev.stream),g.timestamp=Date.now(),i&&(i.contents[s]=g,i.timestamp=g.timestamp),g},getFileDataAsTypedArray(i){return i.contents?i.contents.subarray?i.contents.subarray(0,i.usedBytes):new Uint8Array(i.contents):new Uint8Array(0)},expandFileStorage(i,s){var f=i.contents?i.contents.length:0;if(!(f>=s)){var h=1048576;s=Math.max(s,f*(f<h?2:1.125)>>>0),f!=0&&(s=Math.max(s,256));var g=i.contents;i.contents=new Uint8Array(s),i.usedBytes>0&&i.contents.set(g.subarray(0,i.usedBytes),0)}},resizeFileStorage(i,s){if(i.usedBytes!=s)if(s==0)i.contents=null,i.usedBytes=0;else{var f=i.contents;i.contents=new Uint8Array(s),f&&i.contents.set(f.subarray(0,Math.min(s,i.usedBytes))),i.usedBytes=s}},node_ops:{getattr(i){var s={};return s.dev=A.isChrdev(i.mode)?i.id:1,s.ino=i.id,s.mode=i.mode,s.nlink=1,s.uid=0,s.gid=0,s.rdev=i.rdev,A.isDir(i.mode)?s.size=4096:A.isFile(i.mode)?s.size=i.usedBytes:A.isLink(i.mode)?s.size=i.link.length:s.size=0,s.atime=new Date(i.timestamp),s.mtime=new Date(i.timestamp),s.ctime=new Date(i.timestamp),s.blksize=4096,s.blocks=Math.ceil(s.size/s.blksize),s},setattr(i,s){s.mode!==void 0&&(i.mode=s.mode),s.timestamp!==void 0&&(i.timestamp=s.timestamp),s.size!==void 0&&Re.resizeFileStorage(i,s.size)},lookup(i,s){throw A.genericErrors[44]},mknod(i,s,f,h){return Re.createNode(i,s,f,h)},rename(i,s,f){if(A.isDir(i.mode)){var h;try{h=A.lookupNode(s,f)}catch{}if(h)for(var g in h.contents)throw new A.ErrnoError(55)}delete i.parent.contents[i.name],i.parent.timestamp=Date.now(),i.name=f,s.contents[f]=i,s.timestamp=i.parent.timestamp},unlink(i,s){delete i.contents[s],i.timestamp=Date.now()},rmdir(i,s){var f=A.lookupNode(i,s);for(var h in f.contents)throw new A.ErrnoError(55);delete i.contents[s],i.timestamp=Date.now()},readdir(i){var s=[".",".."];for(var f of Object.keys(i.contents))s.push(f);return s},symlink(i,s,f){var h=Re.createNode(i,s,41471,0);return h.link=f,h},readlink(i){if(!A.isLink(i.mode))throw new A.ErrnoError(28);return i.link}},stream_ops:{read(i,s,f,h,g){var M=i.node.contents;if(g>=i.node.usedBytes)return 0;var O=Math.min(i.node.usedBytes-g,h);if(O>8&&M.subarray)s.set(M.subarray(g,g+O),f);else for(var G=0;G<O;G++)s[f+G]=M[g+G];return O},write(i,s,f,h,g,M){if(s.buffer===z.buffer&&(M=!1),!h)return 0;var O=i.node;if(O.timestamp=Date.now(),s.subarray&&(!O.contents||O.contents.subarray)){if(M)return O.contents=s.subarray(f,f+h),O.usedBytes=h,h;if(O.usedBytes===0&&g===0)return O.contents=s.slice(f,f+h),O.usedBytes=h,h;if(g+h<=O.usedBytes)return O.contents.set(s.subarray(f,f+h),g),h}if(Re.expandFileStorage(O,g+h),O.contents.subarray&&s.subarray)O.contents.set(s.subarray(f,f+h),g);else for(var G=0;G<h;G++)O.contents[g+G]=s[f+G];return O.usedBytes=Math.max(O.usedBytes,g+h),h},llseek(i,s,f){var h=s;if(f===1?h+=i.position:f===2&&A.isFile(i.node.mode)&&(h+=i.node.usedBytes),h<0)throw new A.ErrnoError(28);return h},allocate(i,s,f){Re.expandFileStorage(i.node,s+f),i.node.usedBytes=Math.max(i.node.usedBytes,s+f)},mmap(i,s,f,h,g){if(!A.isFile(i.node.mode))throw new A.ErrnoError(43);var M,O,G=i.node.contents;if(!(g&2)&&G.buffer===z.buffer)O=!1,M=G.byteOffset;else{if((f>0||f+s<G.length)&&(G.subarray?G=G.subarray(f,f+s):G=Array.prototype.slice.call(G,f,f+s)),O=!0,M=Ge(),!M)throw new A.ErrnoError(48);z.set(G,M)}return{ptr:M,allocated:O}},msync(i,s,f,h,g){return Re.stream_ops.write(i,s,0,h,f,!1),0}}},It=(i,s,f,h)=>{var g=`al ${i}`;H(i,M=>{s(new Uint8Array(M)),g&&Pt()},M=>{if(f)f();else throw`Loading data file "${i}" failed.`}),g&&ct()},Et=(i,s,f,h,g,M)=>{A.createDataFile(i,s,f,h,g,M)},bn=o.preloadPlugins||[],dn=(i,s,f,h)=>{typeof Browser<"u"&&Browser.init();var g=!1;return bn.forEach(M=>{g||M.canHandle(s)&&(M.handle(i,s,f,h),g=!0)}),g},_r=(i,s,f,h,g,M,O,G,Z,re)=>{var se=s?Qe.resolve(we.join2(i,s)):i;function xe(Pe){function De(Xe){re?.(),G||Et(i,s,Xe,h,g,Z),M?.(),Pt()}dn(Pe,se,De,()=>{O?.(),Pt()})||De(Pe)}ct(),typeof f=="string"?It(f,xe,O):xe(f)},$n=i=>{var s={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090},f=s[i];if(typeof f>"u")throw new Error(`Unknown file open mode: ${i}`);return f},er=(i,s)=>{var f=0;return i&&(f|=365),s&&(f|=146),f},A={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:!1,ignorePermissions:!0,ErrnoError:class{constructor(i){this.name="ErrnoError",this.errno=i}},genericErrors:{},filesystems:null,syncFSRequests:0,FSStream:class{constructor(){this.shared={}}get object(){return this.node}set object(i){this.node=i}get isRead(){return(this.flags&2097155)!==1}get isWrite(){return(this.flags&2097155)!==0}get isAppend(){return this.flags&1024}get flags(){return this.shared.flags}set flags(i){this.shared.flags=i}get position(){return this.shared.position}set position(i){this.shared.position=i}},FSNode:class{constructor(i,s,f,h){i||(i=this),this.parent=i,this.mount=i.mount,this.mounted=null,this.id=A.nextInode++,this.name=s,this.mode=f,this.node_ops={},this.stream_ops={},this.rdev=h,this.readMode=365,this.writeMode=146}get read(){return(this.mode&this.readMode)===this.readMode}set read(i){i?this.mode|=this.readMode:this.mode&=~this.readMode}get write(){return(this.mode&this.writeMode)===this.writeMode}set write(i){i?this.mode|=this.writeMode:this.mode&=~this.writeMode}get isFolder(){return A.isDir(this.mode)}get isDevice(){return A.isChrdev(this.mode)}},lookupPath(i,s={}){if(i=Qe.resolve(i),!i)return{path:"",node:null};var f={follow_mount:!0,recurse_count:0};if(s=Object.assign(f,s),s.recurse_count>8)throw new A.ErrnoError(32);for(var h=i.split("/").filter(xe=>!!xe),g=A.root,M="/",O=0;O<h.length;O++){var G=O===h.length-1;if(G&&s.parent)break;if(g=A.lookupNode(g,h[O]),M=we.join2(M,h[O]),A.isMountpoint(g)&&(!G||G&&s.follow_mount)&&(g=g.mounted.root),!G||s.follow)for(var Z=0;A.isLink(g.mode);){var re=A.readlink(M);M=Qe.resolve(we.dirname(M),re);var se=A.lookupPath(M,{recurse_count:s.recurse_count+1});if(g=se.node,Z++>40)throw new A.ErrnoError(32)}}return{path:M,node:g}},getPath(i){for(var s;;){if(A.isRoot(i)){var f=i.mount.mountpoint;return s?f[f.length-1]!=="/"?`${f}/${s}`:f+s:f}s=s?`${i.name}/${s}`:i.name,i=i.parent}},hashName(i,s){for(var f=0,h=0;h<s.length;h++)f=(f<<5)-f+s.charCodeAt(h)|0;return(i+f>>>0)%A.nameTable.length},hashAddNode(i){var s=A.hashName(i.parent.id,i.name);i.name_next=A.nameTable[s],A.nameTable[s]=i},hashRemoveNode(i){var s=A.hashName(i.parent.id,i.name);if(A.nameTable[s]===i)A.nameTable[s]=i.name_next;else for(var f=A.nameTable[s];f;){if(f.name_next===i){f.name_next=i.name_next;break}f=f.name_next}},lookupNode(i,s){var f=A.mayLookup(i);if(f)throw new A.ErrnoError(f);for(var h=A.hashName(i.id,s),g=A.nameTable[h];g;g=g.name_next){var M=g.name;if(g.parent.id===i.id&&M===s)return g}return A.lookup(i,s)},createNode(i,s,f,h){var g=new A.FSNode(i,s,f,h);return A.hashAddNode(g),g},destroyNode(i){A.hashRemoveNode(i)},isRoot(i){return i===i.parent},isMountpoint(i){return!!i.mounted},isFile(i){return(i&61440)===32768},isDir(i){return(i&61440)===16384},isLink(i){return(i&61440)===40960},isChrdev(i){return(i&61440)===8192},isBlkdev(i){return(i&61440)===24576},isFIFO(i){return(i&61440)===4096},isSocket(i){return(i&49152)===49152},flagsToPermissionString(i){var s=["r","w","rw"][i&3];return i&512&&(s+="w"),s},nodePermissions(i,s){return A.ignorePermissions?0:s.includes("r")&&!(i.mode&292)||s.includes("w")&&!(i.mode&146)||s.includes("x")&&!(i.mode&73)?2:0},mayLookup(i){if(!A.isDir(i.mode))return 54;var s=A.nodePermissions(i,"x");return s||(i.node_ops.lookup?0:2)},mayCreate(i,s){try{var f=A.lookupNode(i,s);return 20}catch{}return A.nodePermissions(i,"wx")},mayDelete(i,s,f){var h;try{h=A.lookupNode(i,s)}catch(M){return M.errno}var g=A.nodePermissions(i,"wx");if(g)return g;if(f){if(!A.isDir(h.mode))return 54;if(A.isRoot(h)||A.getPath(h)===A.cwd())return 10}else if(A.isDir(h.mode))return 31;return 0},mayOpen(i,s){return i?A.isLink(i.mode)?32:A.isDir(i.mode)&&(A.flagsToPermissionString(s)!=="r"||s&512)?31:A.nodePermissions(i,A.flagsToPermissionString(s)):44},MAX_OPEN_FDS:4096,nextfd(){for(var i=0;i<=A.MAX_OPEN_FDS;i++)if(!A.streams[i])return i;throw new A.ErrnoError(33)},getStreamChecked(i){var s=A.getStream(i);if(!s)throw new A.ErrnoError(8);return s},getStream:i=>A.streams[i],createStream(i,s=-1){return i=Object.assign(new A.FSStream,i),s==-1&&(s=A.nextfd()),i.fd=s,A.streams[s]=i,i},closeStream(i){A.streams[i]=null},dupStream(i,s=-1){var f,h,g=A.createStream(i,s);return(h=(f=g.stream_ops)==null?void 0:f.dup)==null||h.call(f,g),g},chrdev_stream_ops:{open(i){var s,f,h=A.getDevice(i.node.rdev);i.stream_ops=h.stream_ops,(f=(s=i.stream_ops).open)==null||f.call(s,i)},llseek(){throw new A.ErrnoError(70)}},major:i=>i>>8,minor:i=>i&255,makedev:(i,s)=>i<<8|s,registerDevice(i,s){A.devices[i]={stream_ops:s}},getDevice:i=>A.devices[i],getMounts(i){for(var s=[],f=[i];f.length;){var h=f.pop();s.push(h),f.push(...h.mounts)}return s},syncfs(i,s){typeof i=="function"&&(s=i,i=!1),A.syncFSRequests++,A.syncFSRequests>1&&L(`warning: ${A.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);var f=A.getMounts(A.root.mount),h=0;function g(O){return A.syncFSRequests--,s(O)}function M(O){if(O)return M.errored?void 0:(M.errored=!0,g(O));++h>=f.length&&g(null)}f.forEach(O=>{if(!O.type.syncfs)return M(null);O.type.syncfs(O,i,M)})},mount(i,s,f){var h=f==="/",g=!f,M;if(h&&A.root)throw new A.ErrnoError(10);if(!h&&!g){var O=A.lookupPath(f,{follow_mount:!1});if(f=O.path,M=O.node,A.isMountpoint(M))throw new A.ErrnoError(10);if(!A.isDir(M.mode))throw new A.ErrnoError(54)}var G={type:i,opts:s,mountpoint:f,mounts:[]},Z=i.mount(G);return Z.mount=G,G.root=Z,h?A.root=Z:M&&(M.mounted=G,M.mount&&M.mount.mounts.push(G)),Z},unmount(i){var s=A.lookupPath(i,{follow_mount:!1});if(!A.isMountpoint(s.node))throw new A.ErrnoError(28);var f=s.node,h=f.mounted,g=A.getMounts(h);Object.keys(A.nameTable).forEach(O=>{for(var G=A.nameTable[O];G;){var Z=G.name_next;g.includes(G.mount)&&A.destroyNode(G),G=Z}}),f.mounted=null;var M=f.mount.mounts.indexOf(h);f.mount.mounts.splice(M,1)},lookup(i,s){return i.node_ops.lookup(i,s)},mknod(i,s,f){var h=A.lookupPath(i,{parent:!0}),g=h.node,M=we.basename(i);if(!M||M==="."||M==="..")throw new A.ErrnoError(28);var O=A.mayCreate(g,M);if(O)throw new A.ErrnoError(O);if(!g.node_ops.mknod)throw new A.ErrnoError(63);return g.node_ops.mknod(g,M,s,f)},create(i,s){return s=s!==void 0?s:438,s&=4095,s|=32768,A.mknod(i,s,0)},mkdir(i,s){return s=s!==void 0?s:511,s&=1023,s|=16384,A.mknod(i,s,0)},mkdirTree(i,s){for(var f=i.split("/"),h="",g=0;g<f.length;++g)if(f[g]){h+="/"+f[g];try{A.mkdir(h,s)}catch(M){if(M.errno!=20)throw M}}},mkdev(i,s,f){return typeof f>"u"&&(f=s,s=438),s|=8192,A.mknod(i,s,f)},symlink(i,s){if(!Qe.resolve(i))throw new A.ErrnoError(44);var f=A.lookupPath(s,{parent:!0}),h=f.node;if(!h)throw new A.ErrnoError(44);var g=we.basename(s),M=A.mayCreate(h,g);if(M)throw new A.ErrnoError(M);if(!h.node_ops.symlink)throw new A.ErrnoError(63);return h.node_ops.symlink(h,g,i)},rename(i,s){var f=we.dirname(i),h=we.dirname(s),g=we.basename(i),M=we.basename(s),O,G,Z;if(O=A.lookupPath(i,{parent:!0}),G=O.node,O=A.lookupPath(s,{parent:!0}),Z=O.node,!G||!Z)throw new A.ErrnoError(44);if(G.mount!==Z.mount)throw new A.ErrnoError(75);var re=A.lookupNode(G,g),se=Qe.relative(i,h);if(se.charAt(0)!==".")throw new A.ErrnoError(28);if(se=Qe.relative(s,f),se.charAt(0)!==".")throw new A.ErrnoError(55);var xe;try{xe=A.lookupNode(Z,M)}catch{}if(re!==xe){var Pe=A.isDir(re.mode),De=A.mayDelete(G,g,Pe);if(De)throw new A.ErrnoError(De);if(De=xe?A.mayDelete(Z,M,Pe):A.mayCreate(Z,M),De)throw new A.ErrnoError(De);if(!G.node_ops.rename)throw new A.ErrnoError(63);if(A.isMountpoint(re)||xe&&A.isMountpoint(xe))throw new A.ErrnoError(10);if(Z!==G&&(De=A.nodePermissions(G,"w"),De))throw new A.ErrnoError(De);A.hashRemoveNode(re);try{G.node_ops.rename(re,Z,M),re.parent=Z}catch(Xe){throw Xe}finally{A.hashAddNode(re)}}},rmdir(i){var s=A.lookupPath(i,{parent:!0}),f=s.node,h=we.basename(i),g=A.lookupNode(f,h),M=A.mayDelete(f,h,!0);if(M)throw new A.ErrnoError(M);if(!f.node_ops.rmdir)throw new A.ErrnoError(63);if(A.isMountpoint(g))throw new A.ErrnoError(10);f.node_ops.rmdir(f,h),A.destroyNode(g)},readdir(i){var s=A.lookupPath(i,{follow:!0}),f=s.node;if(!f.node_ops.readdir)throw new A.ErrnoError(54);return f.node_ops.readdir(f)},unlink(i){var s=A.lookupPath(i,{parent:!0}),f=s.node;if(!f)throw new A.ErrnoError(44);var h=we.basename(i),g=A.lookupNode(f,h),M=A.mayDelete(f,h,!1);if(M)throw new A.ErrnoError(M);if(!f.node_ops.unlink)throw new A.ErrnoError(63);if(A.isMountpoint(g))throw new A.ErrnoError(10);f.node_ops.unlink(f,h),A.destroyNode(g)},readlink(i){var s=A.lookupPath(i),f=s.node;if(!f)throw new A.ErrnoError(44);if(!f.node_ops.readlink)throw new A.ErrnoError(28);return Qe.resolve(A.getPath(f.parent),f.node_ops.readlink(f))},stat(i,s){var f=A.lookupPath(i,{follow:!s}),h=f.node;if(!h)throw new A.ErrnoError(44);if(!h.node_ops.getattr)throw new A.ErrnoError(63);return h.node_ops.getattr(h)},lstat(i){return A.stat(i,!0)},chmod(i,s,f){var h;if(typeof i=="string"){var g=A.lookupPath(i,{follow:!f});h=g.node}else h=i;if(!h.node_ops.setattr)throw new A.ErrnoError(63);h.node_ops.setattr(h,{mode:s&4095|h.mode&-4096,timestamp:Date.now()})},lchmod(i,s){A.chmod(i,s,!0)},fchmod(i,s){var f=A.getStreamChecked(i);A.chmod(f.node,s)},chown(i,s,f,h){var g;if(typeof i=="string"){var M=A.lookupPath(i,{follow:!h});g=M.node}else g=i;if(!g.node_ops.setattr)throw new A.ErrnoError(63);g.node_ops.setattr(g,{timestamp:Date.now()})},lchown(i,s,f){A.chown(i,s,f,!0)},fchown(i,s,f){var h=A.getStreamChecked(i);A.chown(h.node,s,f)},truncate(i,s){if(s<0)throw new A.ErrnoError(28);var f;if(typeof i=="string"){var h=A.lookupPath(i,{follow:!0});f=h.node}else f=i;if(!f.node_ops.setattr)throw new A.ErrnoError(63);if(A.isDir(f.mode))throw new A.ErrnoError(31);if(!A.isFile(f.mode))throw new A.ErrnoError(28);var g=A.nodePermissions(f,"w");if(g)throw new A.ErrnoError(g);f.node_ops.setattr(f,{size:s,timestamp:Date.now()})},ftruncate(i,s){var f=A.getStreamChecked(i);if(!(f.flags&2097155))throw new A.ErrnoError(28);A.truncate(f.node,s)},utime(i,s,f){var h=A.lookupPath(i,{follow:!0}),g=h.node;g.node_ops.setattr(g,{timestamp:Math.max(s,f)})},open(i,s,f){if(i==="")throw new A.ErrnoError(44);s=typeof s=="string"?$n(s):s,s&64?(f=typeof f>"u"?438:f,f=f&4095|32768):f=0;var h;if(typeof i=="object")h=i;else{i=we.normalize(i);try{var g=A.lookupPath(i,{follow:!(s&131072)});h=g.node}catch{}}var M=!1;if(s&64)if(h){if(s&128)throw new A.ErrnoError(20)}else h=A.mknod(i,f,0),M=!0;if(!h)throw new A.ErrnoError(44);if(A.isChrdev(h.mode)&&(s&=-513),s&65536&&!A.isDir(h.mode))throw new A.ErrnoError(54);if(!M){var O=A.mayOpen(h,s);if(O)throw new A.ErrnoError(O)}s&512&&!M&&A.truncate(h,0),s&=-131713;var G=A.createStream({node:h,path:A.getPath(h),flags:s,seekable:!0,position:0,stream_ops:h.stream_ops,ungotten:[],error:!1});return G.stream_ops.open&&G.stream_ops.open(G),o.logReadFiles&&!(s&1)&&(A.readFiles||(A.readFiles={}),i in A.readFiles||(A.readFiles[i]=1)),G},close(i){if(A.isClosed(i))throw new A.ErrnoError(8);i.getdents&&(i.getdents=null);try{i.stream_ops.close&&i.stream_ops.close(i)}catch(s){throw s}finally{A.closeStream(i.fd)}i.fd=null},isClosed(i){return i.fd===null},llseek(i,s,f){if(A.isClosed(i))throw new A.ErrnoError(8);if(!i.seekable||!i.stream_ops.llseek)throw new A.ErrnoError(70);if(f!=0&&f!=1&&f!=2)throw new A.ErrnoError(28);return i.position=i.stream_ops.llseek(i,s,f),i.ungotten=[],i.position},read(i,s,f,h,g){if(h<0||g<0)throw new A.ErrnoError(28);if(A.isClosed(i))throw new A.ErrnoError(8);if((i.flags&2097155)===1)throw new A.ErrnoError(8);if(A.isDir(i.node.mode))throw new A.ErrnoError(31);if(!i.stream_ops.read)throw new A.ErrnoError(28);var M=typeof g<"u";if(!M)g=i.position;else if(!i.seekable)throw new A.ErrnoError(70);var O=i.stream_ops.read(i,s,f,h,g);return M||(i.position+=O),O},write(i,s,f,h,g,M){if(h<0||g<0)throw new A.ErrnoError(28);if(A.isClosed(i))throw new A.ErrnoError(8);if(!(i.flags&2097155))throw new A.ErrnoError(8);if(A.isDir(i.node.mode))throw new A.ErrnoError(31);if(!i.stream_ops.write)throw new A.ErrnoError(28);i.seekable&&i.flags&1024&&A.llseek(i,0,2);var O=typeof g<"u";if(!O)g=i.position;else if(!i.seekable)throw new A.ErrnoError(70);var G=i.stream_ops.write(i,s,f,h,g,M);return O||(i.position+=G),G},allocate(i,s,f){if(A.isClosed(i))throw new A.ErrnoError(8);if(s<0||f<=0)throw new A.ErrnoError(28);if(!(i.flags&2097155))throw new A.ErrnoError(8);if(!A.isFile(i.node.mode)&&!A.isDir(i.node.mode))throw new A.ErrnoError(43);if(!i.stream_ops.allocate)throw new A.ErrnoError(138);i.stream_ops.allocate(i,s,f)},mmap(i,s,f,h,g){if(h&2&&!(g&2)&&(i.flags&2097155)!==2)throw new A.ErrnoError(2);if((i.flags&2097155)===1)throw new A.ErrnoError(2);if(!i.stream_ops.mmap)throw new A.ErrnoError(43);return i.stream_ops.mmap(i,s,f,h,g)},msync(i,s,f,h,g){return i.stream_ops.msync?i.stream_ops.msync(i,s,f,h,g):0},ioctl(i,s,f){if(!i.stream_ops.ioctl)throw new A.ErrnoError(59);return i.stream_ops.ioctl(i,s,f)},readFile(i,s={}){if(s.flags=s.flags||0,s.encoding=s.encoding||"binary",s.encoding!=="utf8"&&s.encoding!=="binary")throw new Error(`Invalid encoding type "${s.encoding}"`);var f,h=A.open(i,s.flags),g=A.stat(i),M=g.size,O=new Uint8Array(M);return A.read(h,O,0,M,0),s.encoding==="utf8"?f=de(O,0):s.encoding==="binary"&&(f=O),A.close(h),f},writeFile(i,s,f={}){f.flags=f.flags||577;var h=A.open(i,f.flags,f.mode);if(typeof s=="string"){var g=new Uint8Array(Fe(s)+1),M=Te(s,g,0,g.length);A.write(h,g,0,M,void 0,f.canOwn)}else if(ArrayBuffer.isView(s))A.write(h,s,0,s.byteLength,void 0,f.canOwn);else throw new Error("Unsupported data type");A.close(h)},cwd:()=>A.currentPath,chdir(i){var s=A.lookupPath(i,{follow:!0});if(s.node===null)throw new A.ErrnoError(44);if(!A.isDir(s.node.mode))throw new A.ErrnoError(54);var f=A.nodePermissions(s.node,"x");if(f)throw new A.ErrnoError(f);A.currentPath=s.path},createDefaultDirectories(){A.mkdir("/tmp"),A.mkdir("/home"),A.mkdir("/home/web_user")},createDefaultDevices(){A.mkdir("/dev"),A.registerDevice(A.makedev(1,3),{read:()=>0,write:(h,g,M,O,G)=>O}),A.mkdev("/dev/null",A.makedev(1,3)),pe.register(A.makedev(5,0),pe.default_tty_ops),pe.register(A.makedev(6,0),pe.default_tty1_ops),A.mkdev("/dev/tty",A.makedev(5,0)),A.mkdev("/dev/tty1",A.makedev(6,0));var i=new Uint8Array(1024),s=0,f=()=>(s===0&&(s=Be(i).byteLength),i[--s]);A.createDevice("/dev","random",f),A.createDevice("/dev","urandom",f),A.mkdir("/dev/shm"),A.mkdir("/dev/shm/tmp")},createSpecialDirectories(){A.mkdir("/proc");var i=A.mkdir("/proc/self");A.mkdir("/proc/self/fd"),A.mount({mount(){var s=A.createNode(i,"fd",16895,73);return s.node_ops={lookup(f,h){var g=+h,M=A.getStreamChecked(g),O={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>M.path}};return O.parent=O,O}},s}},{},"/proc/self/fd")},createStandardStreams(){o.stdin?A.createDevice("/dev","stdin",o.stdin):A.symlink("/dev/tty","/dev/stdin"),o.stdout?A.createDevice("/dev","stdout",null,o.stdout):A.symlink("/dev/tty","/dev/stdout"),o.stderr?A.createDevice("/dev","stderr",null,o.stderr):A.symlink("/dev/tty1","/dev/stderr"),A.open("/dev/stdin",0),A.open("/dev/stdout",1),A.open("/dev/stderr",1)},staticInit(){[44].forEach(i=>{A.genericErrors[i]=new A.ErrnoError(i),A.genericErrors[i].stack="<generic error, no stack>"}),A.nameTable=new Array(4096),A.mount(Re,{},"/"),A.createDefaultDirectories(),A.createDefaultDevices(),A.createSpecialDirectories(),A.filesystems={MEMFS:Re}},init(i,s,f){A.init.initialized=!0,o.stdin=i||o.stdin,o.stdout=s||o.stdout,o.stderr=f||o.stderr,A.createStandardStreams()},quit(){A.init.initialized=!1;for(var i=0;i<A.streams.length;i++){var s=A.streams[i];s&&A.close(s)}},findObject(i,s){var f=A.analyzePath(i,s);return f.exists?f.object:null},analyzePath(i,s){try{var f=A.lookupPath(i,{follow:!s});i=f.path}catch{}var h={isRoot:!1,exists:!1,error:0,name:null,path:null,object:null,parentExists:!1,parentPath:null,parentObject:null};try{var f=A.lookupPath(i,{parent:!0});h.parentExists=!0,h.parentPath=f.path,h.parentObject=f.node,h.name=we.basename(i),f=A.lookupPath(i,{follow:!s}),h.exists=!0,h.path=f.path,h.object=f.node,h.name=f.node.name,h.isRoot=f.path==="/"}catch(g){h.error=g.errno}return h},createPath(i,s,f,h){i=typeof i=="string"?i:A.getPath(i);for(var g=s.split("/").reverse();g.length;){var M=g.pop();if(M){var O=we.join2(i,M);try{A.mkdir(O)}catch{}i=O}}return O},createFile(i,s,f,h,g){var M=we.join2(typeof i=="string"?i:A.getPath(i),s),O=er(h,g);return A.create(M,O)},createDataFile(i,s,f,h,g,M){var O=s;i&&(i=typeof i=="string"?i:A.getPath(i),O=s?we.join2(i,s):i);var G=er(h,g),Z=A.create(O,G);if(f){if(typeof f=="string"){for(var re=new Array(f.length),se=0,xe=f.length;se<xe;++se)re[se]=f.charCodeAt(se);f=re}A.chmod(Z,G|146);var Pe=A.open(Z,577);A.write(Pe,f,0,f.length,0,M),A.close(Pe),A.chmod(Z,G)}},createDevice(i,s,f,h){var g=we.join2(typeof i=="string"?i:A.getPath(i),s),M=er(!!f,!!h);A.createDevice.major||(A.createDevice.major=64);var O=A.makedev(A.createDevice.major++,0);return A.registerDevice(O,{open(G){G.seekable=!1},close(G){var Z;(Z=h?.buffer)!=null&&Z.length&&h(10)},read(G,Z,re,se,xe){for(var Pe=0,De=0;De<se;De++){var Xe;try{Xe=f()}catch{throw new A.ErrnoError(29)}if(Xe===void 0&&Pe===0)throw new A.ErrnoError(6);if(Xe==null)break;Pe++,Z[re+De]=Xe}return Pe&&(G.node.timestamp=Date.now()),Pe},write(G,Z,re,se,xe){for(var Pe=0;Pe<se;Pe++)try{h(Z[re+Pe])}catch{throw new A.ErrnoError(29)}return se&&(G.node.timestamp=Date.now()),Pe}}),A.mkdev(g,M,O)},forceLoadFile(i){if(i.isDevice||i.isFolder||i.link||i.contents)return!0;if(typeof XMLHttpRequest<"u")throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");if(b)try{i.contents=Ae(b(i.url),!0),i.usedBytes=i.contents.length}catch{throw new A.ErrnoError(29)}else throw new Error("Cannot load without read() or XMLHttpRequest.")},createLazyFile(i,s,f,h,g){class M{constructor(){this.lengthKnown=!1,this.chunks=[]}get(De){if(!(De>this.length-1||De<0)){var Xe=De%this.chunkSize,me=De/this.chunkSize|0;return this.getter(me)[Xe]}}setDataGetter(De){this.getter=De}cacheLength(){var De=new XMLHttpRequest;if(De.open("HEAD",f,!1),De.send(null),!(De.status>=200&&De.status<300||De.status===304))throw new Error("Couldn't load "+f+". Status: "+De.status);var Xe=Number(De.getResponseHeader("Content-length")),me,Le=(me=De.getResponseHeader("Accept-Ranges"))&&me==="bytes",dt=(me=De.getResponseHeader("Content-Encoding"))&&me==="gzip",ue=1024*1024;Le||(ue=Xe);var ze=(Ut,Rn)=>{if(Ut>Rn)throw new Error("invalid range ("+Ut+", "+Rn+") or no bytes requested!");if(Rn>Xe-1)throw new Error("only "+Xe+" bytes available! programmer error!");var jt=new XMLHttpRequest;if(jt.open("GET",f,!1),Xe!==ue&&jt.setRequestHeader("Range","bytes="+Ut+"-"+Rn),jt.responseType="arraybuffer",jt.overrideMimeType&&jt.overrideMimeType("text/plain; charset=x-user-defined"),jt.send(null),!(jt.status>=200&&jt.status<300||jt.status===304))throw new Error("Couldn't load "+f+". Status: "+jt.status);return jt.response!==void 0?new Uint8Array(jt.response||[]):Ae(jt.responseText||"",!0)},ot=this;ot.setDataGetter(Ut=>{var Rn=Ut*ue,jt=(Ut+1)*ue-1;if(jt=Math.min(jt,Xe-1),typeof ot.chunks[Ut]>"u"&&(ot.chunks[Ut]=ze(Rn,jt)),typeof ot.chunks[Ut]>"u")throw new Error("doXHR failed!");return ot.chunks[Ut]}),(dt||!Xe)&&(ue=Xe=1,Xe=this.getter(0).length,ue=Xe,C("LazyFiles on gzip forces download of the whole file when length is accessed")),this._length=Xe,this._chunkSize=ue,this.lengthKnown=!0}get length(){return this.lengthKnown||this.cacheLength(),this._length}get chunkSize(){return this.lengthKnown||this.cacheLength(),this._chunkSize}}if(typeof XMLHttpRequest<"u"){if(!v)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var O=new M,G={isDevice:!1,contents:O}}else var G={isDevice:!1,url:f};var Z=A.createFile(i,s,G,h,g);G.contents?Z.contents=G.contents:G.url&&(Z.contents=null,Z.url=G.url),Object.defineProperties(Z,{usedBytes:{get:function(){return this.contents.length}}});var re={},se=Object.keys(Z.stream_ops);se.forEach(Pe=>{var De=Z.stream_ops[Pe];re[Pe]=(...Xe)=>(A.forceLoadFile(Z),De(...Xe))});function xe(Pe,De,Xe,me,Le){var dt=Pe.node.contents;if(Le>=dt.length)return 0;var ue=Math.min(dt.length-Le,me);if(dt.slice)for(var ze=0;ze<ue;ze++)De[Xe+ze]=dt[Le+ze];else for(var ze=0;ze<ue;ze++)De[Xe+ze]=dt.get(Le+ze);return ue}return re.read=(Pe,De,Xe,me,Le)=>(A.forceLoadFile(Z),xe(Pe,De,Xe,me,Le)),re.mmap=(Pe,De,Xe,me,Le)=>{A.forceLoadFile(Z);var dt=Ge();if(!dt)throw new A.ErrnoError(48);return xe(Pe,z,dt,De,Xe),{ptr:dt,allocated:!0}},Z.stream_ops=re,Z}},$t={DEFAULT_POLLMASK:5,calculateAt(i,s,f){if(we.isAbs(s))return s;var h;if(i===-100)h=A.cwd();else{var g=$t.getStreamFromFD(i);h=g.path}if(s.length==0){if(!f)throw new A.ErrnoError(44);return h}return we.join2(h,s)},doStat(i,s,f){var h=i(s);j[f>>2]=h.dev,j[f+4>>2]=h.mode,J[f+8>>2]=h.nlink,j[f+12>>2]=h.uid,j[f+16>>2]=h.gid,j[f+20>>2]=h.rdev,D=[h.size>>>0,(N=h.size,+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+24>>2]=D[0],j[f+28>>2]=D[1],j[f+32>>2]=4096,j[f+36>>2]=h.blocks;var g=h.atime.getTime(),M=h.mtime.getTime(),O=h.ctime.getTime();return D=[Math.floor(g/1e3)>>>0,(N=Math.floor(g/1e3),+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+40>>2]=D[0],j[f+44>>2]=D[1],J[f+48>>2]=g%1e3*1e3,D=[Math.floor(M/1e3)>>>0,(N=Math.floor(M/1e3),+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+56>>2]=D[0],j[f+60>>2]=D[1],J[f+64>>2]=M%1e3*1e3,D=[Math.floor(O/1e3)>>>0,(N=Math.floor(O/1e3),+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+72>>2]=D[0],j[f+76>>2]=D[1],J[f+80>>2]=O%1e3*1e3,D=[h.ino>>>0,(N=h.ino,+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[f+88>>2]=D[0],j[f+92>>2]=D[1],0},doMsync(i,s,f,h,g){if(!A.isFile(s.node.mode))throw new A.ErrnoError(43);if(h&2)return 0;var M=B.slice(i,i+f);A.msync(s,M,g,f,h)},getStreamFromFD(i){var s=A.getStreamChecked(i);return s},varargs:void 0,getStr(i){var s=ie(i);return s}};function Mi(i,s,f){$t.varargs=f;try{var h=$t.getStreamFromFD(i);switch(s){case 0:{var g=ve();if(g<0)return-28;for(;A.streams[g];)g++;var M;return M=A.dupStream(h,g),M.fd}case 1:case 2:return 0;case 3:return h.flags;case 4:{var g=ve();return h.flags|=g,0}case 12:{var g=he(),O=0;return Y[g+O>>1]=2,0}case 13:case 14:return 0}return-28}catch(G){if(typeof A>"u"||G.name!=="ErrnoError")throw G;return-G.errno}}function Ki(i,s,f){$t.varargs=f;try{var h=$t.getStreamFromFD(i);switch(s){case 21509:return h.tty?0:-59;case 21505:{if(!h.tty)return-59;if(h.tty.ops.ioctl_tcgets){var g=h.tty.ops.ioctl_tcgets(h),M=he();j[M>>2]=g.c_iflag||0,j[M+4>>2]=g.c_oflag||0,j[M+8>>2]=g.c_cflag||0,j[M+12>>2]=g.c_lflag||0;for(var O=0;O<32;O++)z[M+O+17]=g.c_cc[O]||0;return 0}return 0}case 21510:case 21511:case 21512:return h.tty?0:-59;case 21506:case 21507:case 21508:{if(!h.tty)return-59;if(h.tty.ops.ioctl_tcsets){for(var M=he(),G=j[M>>2],Z=j[M+4>>2],re=j[M+8>>2],se=j[M+12>>2],xe=[],O=0;O<32;O++)xe.push(z[M+O+17]);return h.tty.ops.ioctl_tcsets(h.tty,s,{c_iflag:G,c_oflag:Z,c_cflag:re,c_lflag:se,c_cc:xe})}return 0}case 21519:{if(!h.tty)return-59;var M=he();return j[M>>2]=0,0}case 21520:return h.tty?-28:-59;case 21531:{var M=he();return A.ioctl(h,s,M)}case 21523:{if(!h.tty)return-59;if(h.tty.ops.ioctl_tiocgwinsz){var Pe=h.tty.ops.ioctl_tiocgwinsz(h.tty),M=he();Y[M>>1]=Pe[0],Y[M+2>>1]=Pe[1]}return 0}case 21524:return h.tty?0:-59;case 21515:return h.tty?0:-59;default:return-28}}catch(De){if(typeof A>"u"||De.name!=="ErrnoError")throw De;return-De.errno}}function ti(i,s,f,h){$t.varargs=h;try{s=$t.getStr(s),s=$t.calculateAt(i,s);var g=h?ve():0;return A.open(s,f,g).fd}catch(M){if(typeof A>"u"||M.name!=="ErrnoError")throw M;return-M.errno}}function Zi(i,s,f){try{return s=$t.getStr(s),s=$t.calculateAt(i,s),f===0?A.unlink(s):f===512?A.rmdir(s):ft("Invalid flags passed to unlinkat"),0}catch(h){if(typeof A>"u"||h.name!=="ErrnoError")throw h;return-h.errno}}var Dr=()=>{ft("")},Yt={},Lr=i=>{for(;i.length;){var s=i.pop(),f=i.pop();f(s)}};function Zt(i){return this.fromWireType(J[i>>2])}var gr={},nn={},En={},Ji,ni=i=>{throw new Ji(i)},U=(i,s,f)=>{i.forEach(function(G){En[G]=s});function h(G){var Z=f(G);Z.length!==i.length&&ni("Mismatched type converter count");for(var re=0;re<i.length;++re)Je(i[re],Z[re])}var g=new Array(s.length),M=[],O=0;s.forEach((G,Z)=>{nn.hasOwnProperty(G)?g[Z]=nn[G]:(M.push(G),gr.hasOwnProperty(G)||(gr[G]=[]),gr[G].push(()=>{g[Z]=nn[G],++O,O===M.length&&h(g)}))}),M.length===0&&h(g)},Q=i=>{var s=Yt[i];delete Yt[i];var f=s.rawConstructor,h=s.rawDestructor,g=s.fields,M=g.map(O=>O.getterReturnType).concat(g.map(O=>O.setterArgumentType));U([i],M,O=>{var G={};return g.forEach((Z,re)=>{var se=Z.fieldName,xe=O[re],Pe=Z.getter,De=Z.getterContext,Xe=O[re+g.length],me=Z.setter,Le=Z.setterContext;G[se]={read:dt=>xe.fromWireType(Pe(De,dt)),write:(dt,ue)=>{var ze=[];me(Le,dt,Xe.toWireType(ze,ue)),Lr(ze)}}}),[{name:s.name,fromWireType:Z=>{var re={};for(var se in G)re[se]=G[se].read(Z);return h(Z),re},toWireType:(Z,re)=>{for(var se in G)if(!(se in re))throw new TypeError(`Missing field: "${se}"`);var xe=f();for(se in G)G[se].write(xe,re[se]);return Z!==null&&Z.push(h,xe),xe},argPackAdvance:nt,readValueFromPointer:Zt,destructorFunction:h}]})},ae=(i,s,f,h,g)=>{},oe=()=>{for(var i=new Array(256),s=0;s<256;++s)i[s]=String.fromCharCode(s);ee=i},ee,ye=i=>{for(var s="",f=i;B[f];)s+=ee[B[f++]];return s},Ne,Me=i=>{throw new Ne(i)};function We(i,s,f={}){var h=s.name;if(i||Me(`type "${h}" must have a positive integer typeid pointer`),nn.hasOwnProperty(i)){if(f.ignoreDuplicateRegistrations)return;Me(`Cannot register type '${h}' twice`)}if(nn[i]=s,delete En[i],gr.hasOwnProperty(i)){var g=gr[i];delete gr[i],g.forEach(M=>M())}}function Je(i,s,f={}){if(!("argPackAdvance"in s))throw new TypeError("registerType registeredInstance requires argPackAdvance");return We(i,s,f)}var nt=8,it=(i,s,f,h)=>{s=ye(s),Je(i,{name:s,fromWireType:function(g){return!!g},toWireType:function(g,M){return M?f:h},argPackAdvance:nt,readValueFromPointer:function(g){return this.fromWireType(B[g])},destructorFunction:null})},mt=i=>({count:i.count,deleteScheduled:i.deleteScheduled,preservePointerOnDelete:i.preservePointerOnDelete,ptr:i.ptr,ptrType:i.ptrType,smartPtr:i.smartPtr,smartPtrType:i.smartPtrType}),Mt=i=>{function s(f){return f.$$.ptrType.registeredClass.name}Me(s(i)+" instance already deleted")},Ot=!1,Ht=i=>{},Dt=i=>{i.smartPtr?i.smartPtrType.rawDestructor(i.smartPtr):i.ptrType.registeredClass.rawDestructor(i.ptr)},at=i=>{i.count.value-=1;var s=i.count.value===0;s&&Dt(i)},kt=(i,s,f)=>{if(s===f)return i;if(f.baseClass===void 0)return null;var h=kt(i,s,f.baseClass);return h===null?null:f.downcast(h)},St={},hn=()=>Object.keys(qt).length,Nn=()=>{var i=[];for(var s in qt)qt.hasOwnProperty(s)&&i.push(qt[s]);return i},Wt=[],rn=()=>{for(;Wt.length;){var i=Wt.pop();i.$$.deleteScheduled=!1,i.delete()}},Lt,cn=i=>{Lt=i,Wt.length&&Lt&&Lt(rn)},en=()=>{o.getInheritedInstanceCount=hn,o.getLiveInheritedInstances=Nn,o.flushPendingDeletes=rn,o.setDelayFunction=cn},qt={},an=(i,s)=>{for(s===void 0&&Me("ptr should not be undefined");i.baseClass;)s=i.upcast(s),i=i.baseClass;return s},ri=(i,s)=>(s=an(i,s),qt[s]),Cn=(i,s)=>{(!s.ptrType||!s.ptr)&&ni("makeClassHandle requires ptr and ptrType");var f=!!s.smartPtrType,h=!!s.smartPtr;return f!==h&&ni("Both smartPtrType and smartPtr must be specified"),s.count={value:1},wi(Object.create(i,{$$:{value:s,writable:!0}}))};function Zs(i){var s=this.getPointee(i);if(!s)return this.destructor(i),null;var f=ri(this.registeredClass,s);if(f!==void 0){if(f.$$.count.value===0)return f.$$.ptr=s,f.$$.smartPtr=i,f.clone();var h=f.clone();return this.destructor(i),h}function g(){return this.isSmartPointer?Cn(this.registeredClass.instancePrototype,{ptrType:this.pointeeType,ptr:s,smartPtrType:this,smartPtr:i}):Cn(this.registeredClass.instancePrototype,{ptrType:this,ptr:i})}var M=this.registeredClass.getActualType(s),O=St[M];if(!O)return g.call(this);var G;this.isConst?G=O.constPointerType:G=O.pointerType;var Z=kt(s,this.registeredClass,G.registeredClass);return Z===null?g.call(this):this.isSmartPointer?Cn(G.registeredClass.instancePrototype,{ptrType:G,ptr:Z,smartPtrType:this,smartPtr:i}):Cn(G.registeredClass.instancePrototype,{ptrType:G,ptr:Z})}var wi=i=>typeof FinalizationRegistry>"u"?(wi=s=>s,i):(Ot=new FinalizationRegistry(s=>{at(s.$$)}),wi=s=>{var f=s.$$,h=!!f.smartPtr;if(h){var g={$$:f};Ot.register(s,g,s)}return s},Ht=s=>Ot.unregister(s),wi(i)),Js=()=>{Object.assign(Qi.prototype,{isAliasOf(i){if(!(this instanceof Qi)||!(i instanceof Qi))return!1;var s=this.$$.ptrType.registeredClass,f=this.$$.ptr;i.$$=i.$$;for(var h=i.$$.ptrType.registeredClass,g=i.$$.ptr;s.baseClass;)f=s.upcast(f),s=s.baseClass;for(;h.baseClass;)g=h.upcast(g),h=h.baseClass;return s===h&&f===g},clone(){if(this.$$.ptr||Mt(this),this.$$.preservePointerOnDelete)return this.$$.count.value+=1,this;var i=wi(Object.create(Object.getPrototypeOf(this),{$$:{value:mt(this.$$)}}));return i.$$.count.value+=1,i.$$.deleteScheduled=!1,i},delete(){this.$$.ptr||Mt(this),this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete&&Me("Object already scheduled for deletion"),Ht(this),at(this.$$),this.$$.preservePointerOnDelete||(this.$$.smartPtr=void 0,this.$$.ptr=void 0)},isDeleted(){return!this.$$.ptr},deleteLater(){return this.$$.ptr||Mt(this),this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete&&Me("Object already scheduled for deletion"),Wt.push(this),Wt.length===1&&Lt&&Lt(rn),this.$$.deleteScheduled=!0,this}})};function Qi(){}var Ti=(i,s)=>Object.defineProperty(s,"name",{value:i}),Qs=(i,s,f)=>{if(i[s].overloadTable===void 0){var h=i[s];i[s]=function(...g){return i[s].overloadTable.hasOwnProperty(g.length)||Me(`Function '${f}' called with an invalid number of arguments (${g.length}) - expects one of (${i[s].overloadTable})!`),i[s].overloadTable[g.length].apply(this,g)},i[s].overloadTable=[],i[s].overloadTable[h.argCount]=h}},Ai=(i,s,f)=>{o.hasOwnProperty(i)?((f===void 0||o[i].overloadTable!==void 0&&o[i].overloadTable[f]!==void 0)&&Me(`Cannot register public name '${i}' twice`),Qs(o,i,i),o.hasOwnProperty(f)&&Me(`Cannot register multiple overloads of a function with the same number of arguments (${f})!`),o[i].overloadTable[f]=s):(o[i]=s,f!==void 0&&(o[i].numArguments=f))},el=48,Ha=57,Po=i=>{if(i===void 0)return"_unknown";i=i.replace(/[^a-zA-Z0-9_]/g,"$");var s=i.charCodeAt(0);return s>=el&&s<=Ha?`_${i}`:i};function ii(i,s,f,h,g,M,O,G){this.name=i,this.constructor=s,this.instancePrototype=f,this.rawDestructor=h,this.baseClass=g,this.getActualType=M,this.upcast=O,this.downcast=G,this.pureVirtualFunctions=[]}var ai=(i,s,f)=>{for(;s!==f;)s.upcast||Me(`Expected null or instance of ${f.name}, got an instance of ${s.name}`),i=s.upcast(i),s=s.baseClass;return i};function tl(i,s){if(s===null)return this.isReference&&Me(`null is not a valid ${this.name}`),0;s.$$||Me(`Cannot pass "${na(s)}" as a ${this.name}`),s.$$.ptr||Me(`Cannot pass deleted object as a pointer of type ${this.name}`);var f=s.$$.ptrType.registeredClass,h=ai(s.$$.ptr,f,this.registeredClass);return h}function Do(i,s){var f;if(s===null)return this.isReference&&Me(`null is not a valid ${this.name}`),this.isSmartPointer?(f=this.rawConstructor(),i!==null&&i.push(this.rawDestructor,f),f):0;(!s||!s.$$)&&Me(`Cannot pass "${na(s)}" as a ${this.name}`),s.$$.ptr||Me(`Cannot pass deleted object as a pointer of type ${this.name}`),!this.isConst&&s.$$.ptrType.isConst&&Me(`Cannot convert argument of type ${s.$$.smartPtrType?s.$$.smartPtrType.name:s.$$.ptrType.name} to parameter type ${this.name}`);var h=s.$$.ptrType.registeredClass;if(f=ai(s.$$.ptr,h,this.registeredClass),this.isSmartPointer)switch(s.$$.smartPtr===void 0&&Me("Passing raw pointer to smart pointer is illegal"),this.sharingPolicy){case 0:s.$$.smartPtrType===this?f=s.$$.smartPtr:Me(`Cannot convert argument of type ${s.$$.smartPtrType?s.$$.smartPtrType.name:s.$$.ptrType.name} to parameter type ${this.name}`);break;case 1:f=s.$$.smartPtr;break;case 2:if(s.$$.smartPtrType===this)f=s.$$.smartPtr;else{var g=s.clone();f=this.rawShare(f,Mn.toHandle(()=>g.delete())),i!==null&&i.push(this.rawDestructor,f)}break;default:Me("Unsupporting sharing policy")}return f}function nl(i,s){if(s===null)return this.isReference&&Me(`null is not a valid ${this.name}`),0;s.$$||Me(`Cannot pass "${na(s)}" as a ${this.name}`),s.$$.ptr||Me(`Cannot pass deleted object as a pointer of type ${this.name}`),s.$$.ptrType.isConst&&Me(`Cannot convert argument of type ${s.$$.ptrType.name} to parameter type ${this.name}`);var f=s.$$.ptrType.registeredClass,h=ai(s.$$.ptr,f,this.registeredClass);return h}var rl=()=>{Object.assign(ea.prototype,{getPointee(i){return this.rawGetPointee&&(i=this.rawGetPointee(i)),i},destructor(i){var s;(s=this.rawDestructor)==null||s.call(this,i)},argPackAdvance:nt,readValueFromPointer:Zt,fromWireType:Zs})};function ea(i,s,f,h,g,M,O,G,Z,re,se){this.name=i,this.registeredClass=s,this.isReference=f,this.isConst=h,this.isSmartPointer=g,this.pointeeType=M,this.sharingPolicy=O,this.rawGetPointee=G,this.rawConstructor=Z,this.rawShare=re,this.rawDestructor=se,!g&&s.baseClass===void 0?h?(this.toWireType=tl,this.destructorFunction=null):(this.toWireType=nl,this.destructorFunction=null):this.toWireType=Do}var Lo=(i,s,f)=>{o.hasOwnProperty(i)||ni("Replacing nonexistent public symbol"),o[i].overloadTable!==void 0&&f!==void 0?o[i].overloadTable[f]=s:(o[i]=s,o[i].argCount=f)},il=(i,s,f)=>{i=i.replace(/p/g,"i");var h=o["dynCall_"+i];return h(s,...f)},ta=[],Fo,Io=i=>{var s=ta[i];return s||(i>=ta.length&&(ta.length=i+1),ta[i]=s=Fo.get(i)),s},al=(i,s,f=[])=>{if(i.includes("j"))return il(i,s,f);var h=Io(s)(...f);return h},ol=(i,s)=>(...f)=>al(i,s,f),tr=(i,s)=>{i=ye(i);function f(){return i.includes("j")?ol(i,s):Io(s)}var h=f();return typeof h!="function"&&Me(`unknown function pointer with signature ${i}: ${s}`),h},sl=(i,s)=>{var f=Ti(s,function(h){this.name=s,this.message=h;var g=new Error(h).stack;g!==void 0&&(this.stack=this.toString()+`
`+g.replace(/^Error(:[^\n]*)?\n/,""))});return f.prototype=Object.create(i.prototype),f.prototype.constructor=f,f.prototype.toString=function(){return this.message===void 0?this.name:`${this.name}: ${this.message}`},f},Uo,No=i=>{var s=oa(i),f=ye(s);return yr(s),f},Oo=(i,s)=>{var f=[],h={};function g(M){if(!h[M]&&!nn[M]){if(En[M]){En[M].forEach(g);return}f.push(M),h[M]=!0}}throw s.forEach(g),new Uo(`${i}: `+f.map(No).join([", "]))},ll=(i,s,f,h,g,M,O,G,Z,re,se,xe,Pe)=>{se=ye(se),M=tr(g,M),G&&(G=tr(O,G)),re&&(re=tr(Z,re)),Pe=tr(xe,Pe);var De=Po(se);Ai(De,function(){Oo(`Cannot construct ${se} due to unbound types`,[h])}),U([i,s,f],h?[h]:[],Xe=>{var me;Xe=Xe[0];var Le,dt;h?(Le=Xe.registeredClass,dt=Le.instancePrototype):dt=Qi.prototype;var ue=Ti(se,function(...ql){if(Object.getPrototypeOf(this)!==ze)throw new Ne("Use 'new' to construct "+se);if(ot.constructor_body===void 0)throw new Ne(se+" has no accessible constructor");var tu=ot.constructor_body[ql.length];if(tu===void 0)throw new Ne(`Tried to invoke ctor of ${se} with invalid number of parameters (${ql.length}) - expected (${Object.keys(ot.constructor_body).toString()}) parameters instead!`);return tu.apply(this,ql)}),ze=Object.create(dt,{constructor:{value:ue}});ue.prototype=ze;var ot=new ii(se,ue,ze,Pe,Le,M,G,re);ot.baseClass&&((me=ot.baseClass).__derivedClasses!=null||(me.__derivedClasses=[]),ot.baseClass.__derivedClasses.push(ot));var Ut=new ea(se,ot,!0,!1,!1),Rn=new ea(se+"*",ot,!1,!1,!1),jt=new ea(se+" const*",ot,!1,!0,!1);return St[i]={pointerType:Rn,constPointerType:jt},Lo(De,ue),[Ut,Rn,jt]})},Va=[],nr=[],Wa=i=>{i>9&&--nr[i+1]===0&&(nr[i]=void 0,Va.push(i))},cl=()=>nr.length/2-5-Va.length,fl=()=>{nr.push(0,1,void 0,1,null,1,!0,1,!1,1),o.count_emval_handles=cl},Mn={toValue:i=>(i||Me("Cannot use deleted val. handle = "+i),nr[i]),toHandle:i=>{switch(i){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:{const s=Va.pop()||nr.length;return nr[s]=i,nr[s+1]=1,s}}}},Xa={name:"emscripten::val",fromWireType:i=>{var s=Mn.toValue(i);return Wa(i),s},toWireType:(i,s)=>Mn.toHandle(s),argPackAdvance:nt,readValueFromPointer:Zt,destructorFunction:null},ul=i=>Je(i,Xa),Ci=(i,s,f)=>{switch(s){case 1:return f?function(h){return this.fromWireType(z[h])}:function(h){return this.fromWireType(B[h])};case 2:return f?function(h){return this.fromWireType(Y[h>>1])}:function(h){return this.fromWireType(K[h>>1])};case 4:return f?function(h){return this.fromWireType(j[h>>2])}:function(h){return this.fromWireType(J[h>>2])};default:throw new TypeError(`invalid integer width (${s}): ${i}`)}},dl=(i,s,f,h)=>{s=ye(s);function g(){}g.values={},Je(i,{name:s,constructor:g,fromWireType:function(M){return this.constructor.values[M]},toWireType:(M,O)=>O.value,argPackAdvance:nt,readValueFromPointer:Ci(s,f,h),destructorFunction:null}),Ai(s,g)},At=(i,s)=>{var f=nn[i];return f===void 0&&Me(`${s} has unknown type ${No(i)}`),f},hl=(i,s,f)=>{var h=At(i,"enum");s=ye(s);var g=h.constructor,M=Object.create(h.constructor.prototype,{value:{value:f},constructor:{value:Ti(`${h.name}_${s}`,function(){})}});g.values[f]=M,g[s]=M},na=i=>{if(i===null)return"null";var s=typeof i;return s==="object"||s==="array"||s==="function"?i.toString():""+i},rr=(i,s)=>{switch(s){case 4:return function(f){return this.fromWireType(ce[f>>2])};case 8:return function(f){return this.fromWireType(te[f>>3])};default:throw new TypeError(`invalid float width (${s}): ${i}`)}},$a=(i,s,f)=>{s=ye(s),Je(i,{name:s,fromWireType:h=>h,toWireType:(h,g)=>g,argPackAdvance:nt,readValueFromPointer:rr(s,f),destructorFunction:null})};function ra(i){for(var s=1;s<i.length;++s)if(i[s]!==null&&i[s].destructorFunction===void 0)return!0;return!1}function pl(i,s,f,h,g,M){var O=s.length;O<2&&Me("argTypes array size mismatch! Must at least get return value and 'this' types!"),s[1];var G=ra(s),Z=s[0].name!=="void",re=O-2,se=new Array(re),xe=[],Pe=[],De=function(...Xe){Xe.length!==re&&Me(`function ${i} called with ${Xe.length} arguments, expected ${re}`),Pe.length=0;var me;xe.length=1,xe[0]=g;for(var Le=0;Le<re;++Le)se[Le]=s[Le+2].toWireType(Pe,Xe[Le]),xe.push(se[Le]);var dt=h(...xe);function ue(ze){if(G)Lr(Pe);else for(var ot=2;ot<s.length;ot++){var Ut=ot===1?me:se[ot-2];s[ot].destructorFunction!==null&&s[ot].destructorFunction(Ut)}if(Z)return s[0].fromWireType(ze)}return ue(dt)};return Ti(i,De)}var vr=(i,s)=>{for(var f=[],h=0;h<i;h++)f.push(J[s+h*4>>2]);return f},ko=i=>{i=i.trim();const s=i.indexOf("(");return s!==-1?i.substr(0,s):i},ut=(i,s,f,h,g,M,O)=>{var G=vr(s,f);i=ye(i),i=ko(i),g=tr(h,g),Ai(i,function(){Oo(`Cannot call ${i} due to unbound types`,G)},s-1),U([],G,Z=>{var re=[Z[0],null].concat(Z.slice(1));return Lo(i,pl(i,re,null,g,M),s-1),[]})},ml=(i,s,f)=>{switch(s){case 1:return f?h=>z[h]:h=>B[h];case 2:return f?h=>Y[h>>1]:h=>K[h>>1];case 4:return f?h=>j[h>>2]:h=>J[h>>2];default:throw new TypeError(`invalid integer width (${s}): ${i}`)}},_l=(i,s,f,h,g)=>{s=ye(s);var M=se=>se;if(h===0){var O=32-8*f;M=se=>se<<O>>>O}var G=s.includes("unsigned"),Z=(se,xe)=>{},re;G?re=function(se,xe){return Z(xe,this.name),xe>>>0}:re=function(se,xe){return Z(xe,this.name),xe},Je(i,{name:s,fromWireType:M,toWireType:re,argPackAdvance:nt,readValueFromPointer:ml(s,f,h!==0),destructorFunction:null})},gl=(i,s,f)=>{var h=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],g=h[s];function M(O){var G=J[O>>2],Z=J[O+4>>2];return new g(z.buffer,Z,G)}f=ye(f),Je(i,{name:f,fromWireType:M,argPackAdvance:nt,readValueFromPointer:M},{ignoreDuplicateRegistrations:!0})},vl=(i,s,f)=>Te(i,B,s,f),xl=(i,s)=>{s=ye(s);var f=s==="std::string";Je(i,{name:s,fromWireType(h){var g=J[h>>2],M=h+4,O;if(f)for(var G=M,Z=0;Z<=g;++Z){var re=M+Z;if(Z==g||B[re]==0){var se=re-G,xe=ie(G,se);O===void 0?O=xe:(O+="\0",O+=xe),G=re+1}}else{for(var Pe=new Array(g),Z=0;Z<g;++Z)Pe[Z]=String.fromCharCode(B[M+Z]);O=Pe.join("")}return yr(h),O},toWireType(h,g){g instanceof ArrayBuffer&&(g=new Uint8Array(g));var M,O=typeof g=="string";O||g instanceof Uint8Array||g instanceof Uint8ClampedArray||g instanceof Int8Array||Me("Cannot pass non-string to std::string"),f&&O?M=Fe(g):M=g.length;var G=Ko(4+M+1),Z=G+4;if(J[G>>2]=M,f&&O)vl(g,Z,M+1);else if(O)for(var re=0;re<M;++re){var se=g.charCodeAt(re);se>255&&(yr(Z),Me("String has UTF-16 code units that do not fit in 8 bits")),B[Z+re]=se}else for(var re=0;re<M;++re)B[Z+re]=g[re];return h!==null&&h.push(yr,G),G},argPackAdvance:nt,readValueFromPointer:Zt,destructorFunction(h){yr(h)}})},Bo=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0,qa=(i,s)=>{for(var f=i,h=f>>1,g=h+s/2;!(h>=g)&&K[h];)++h;if(f=h<<1,f-i>32&&Bo)return Bo.decode(B.subarray(i,f));for(var M="",O=0;!(O>=s/2);++O){var G=Y[i+O*2>>1];if(G==0)break;M+=String.fromCharCode(G)}return M},yl=(i,s,f)=>{if(f!=null||(f=2147483647),f<2)return 0;f-=2;for(var h=s,g=f<i.length*2?f/2:i.length,M=0;M<g;++M){var O=i.charCodeAt(M);Y[s>>1]=O,s+=2}return Y[s>>1]=0,s-h},Ya=i=>i.length*2,Sl=(i,s)=>{for(var f=0,h="";!(f>=s/4);){var g=j[i+f*4>>2];if(g==0)break;if(++f,g>=65536){var M=g-65536;h+=String.fromCharCode(55296|M>>10,56320|M&1023)}else h+=String.fromCharCode(g)}return h},bl=(i,s,f)=>{if(f!=null||(f=2147483647),f<4)return 0;for(var h=s,g=h+f-4,M=0;M<i.length;++M){var O=i.charCodeAt(M);if(O>=55296&&O<=57343){var G=i.charCodeAt(++M);O=65536+((O&1023)<<10)|G&1023}if(j[s>>2]=O,s+=4,s+4>g)break}return j[s>>2]=0,s-h},R=i=>{for(var s=0,f=0;f<i.length;++f){var h=i.charCodeAt(f);h>=55296&&h<=57343&&++f,s+=4}return s},ir=(i,s,f)=>{f=ye(f);var h,g,M,O;s===2?(h=qa,g=yl,O=Ya,M=G=>K[G>>1]):s===4&&(h=Sl,g=bl,O=R,M=G=>J[G>>2]),Je(i,{name:f,fromWireType:G=>{for(var Z=J[G>>2],re,se=G+4,xe=0;xe<=Z;++xe){var Pe=G+4+xe*s;if(xe==Z||M(Pe)==0){var De=Pe-se,Xe=h(se,De);re===void 0?re=Xe:(re+="\0",re+=Xe),se=Pe+s}}return yr(G),re},toWireType:(G,Z)=>{typeof Z!="string"&&Me(`Cannot pass non-string to C++ string type ${f}`);var re=O(Z),se=Ko(4+re+s);return J[se>>2]=re/s,g(Z,se+4,re+s),G!==null&&G.push(yr,se),se},argPackAdvance:nt,readValueFromPointer:Zt,destructorFunction(G){yr(G)}})},El=(i,s,f,h,g,M)=>{Yt[i]={name:ye(s),rawConstructor:tr(f,h),rawDestructor:tr(g,M),fields:[]}},Ml=(i,s,f,h,g,M,O,G,Z,re)=>{Yt[i].fields.push({fieldName:ye(s),getterReturnType:f,getter:tr(h,g),getterContext:M,setterArgumentType:O,setter:tr(G,Z),setterContext:re})},wl=(i,s)=>{s=ye(s),Je(i,{isVoid:!0,name:s,argPackAdvance:0,fromWireType:()=>{},toWireType:(f,h)=>{}})},Tl=(i,s,f)=>B.copyWithin(i,s,s+f),zo={},Go=i=>{var s=zo[i];return s===void 0?ye(i):s},ja=[],Al=(i,s,f,h,g)=>(i=ja[i],s=Mn.toValue(s),f=Go(f),i(s,s[f],h,g)),Cl=i=>{var s=ja.length;return ja.push(i),s},Rl=(i,s)=>{for(var f=new Array(i),h=0;h<i;++h)f[h]=At(J[s+h*4>>2],"parameter "+h);return f},Pl=Reflect.construct,Dl=(i,s,f)=>{var h=[],g=i.toWireType(h,f);return h.length&&(J[s>>2]=Mn.toHandle(h)),g},Ll=(i,s,f)=>{var h=Rl(i,s),g=h.shift();i--;var M=new Array(i),O=(Z,re,se,xe)=>{for(var Pe=0,De=0;De<i;++De)M[De]=h[De].readValueFromPointer(xe+Pe),Pe+=h[De].argPackAdvance;var Xe=f===1?Pl(re,M):re.apply(Z,M);return Dl(g,se,Xe)},G=`methodCaller<(${h.map(Z=>Z.name).join(", ")}) => ${g.name}>`;return Cl(Ti(G,O))},ia=i=>{i>9&&(nr[i+1]+=1)},Fl=()=>Mn.toHandle([]),Ho=i=>Mn.toHandle(Go(i)),Vo=()=>Mn.toHandle({}),Il=i=>{var s=Mn.toValue(i);Lr(s),Wa(i)},Ul=(i,s,f)=>{i=Mn.toValue(i),s=Mn.toValue(s),f=Mn.toValue(f),i[s]=f},Nl=(i,s)=>{i=At(i,"_emval_take_value");var f=i.readValueFromPointer(s);return Mn.toHandle(f)},Ol=()=>2147483648,kl=i=>{var s=P.buffer,f=(i-s.byteLength+65535)/65536;try{return P.grow(f),Se(),1}catch{}},Wo=i=>{var s=B.length;i>>>=0;var f=Ol();if(i>f)return!1;for(var h=(Z,re)=>Z+(re-Z%re)%re,g=1;g<=4;g*=2){var M=s*(1+.2/g);M=Math.min(M,i+100663296);var O=Math.min(f,h(Math.max(i,M),65536)),G=kl(O);if(G)return!0}return!1},oi={},aa=()=>T||"./this.program",Ri=()=>{if(!Ri.strings){var i=(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",s={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:i,_:aa()};for(var f in oi)oi[f]===void 0?delete s[f]:s[f]=oi[f];var h=[];for(var f in s)h.push(`${f}=${s[f]}`);Ri.strings=h}return Ri.strings},Xo=(i,s)=>{for(var f=0;f<i.length;++f)z[s++]=i.charCodeAt(f);z[s]=0},ar=(i,s)=>{var f=0;return Ri().forEach((h,g)=>{var M=s+f;J[i+g*4>>2]=M,Xo(h,M),f+=h.length+1}),0},$o=(i,s)=>{var f=Ri();J[i>>2]=f.length;var h=0;return f.forEach(g=>h+=g.length+1),J[s>>2]=h,0};function Bl(i){try{var s=$t.getStreamFromFD(i);return A.close(s),0}catch(f){if(typeof A>"u"||f.name!=="ErrnoError")throw f;return f.errno}}var xr=(i,s,f,h)=>{for(var g=0,M=0;M<f;M++){var O=J[s>>2],G=J[s+4>>2];s+=8;var Z=A.read(i,z,O,G,h);if(Z<0)return-1;if(g+=Z,Z<G)break}return g};function zl(i,s,f,h){try{var g=$t.getStreamFromFD(i),M=xr(g,s,f);return J[h>>2]=M,0}catch(O){if(typeof A>"u"||O.name!=="ErrnoError")throw O;return O.errno}}var qo=(i,s)=>s+2097152>>>0<4194305-!!i?(i>>>0)+s*4294967296:NaN;function si(i,s,f,h,g){var M=qo(s,f);try{if(isNaN(M))return 61;var O=$t.getStreamFromFD(i);return A.llseek(O,M,h),D=[O.position>>>0,(N=O.position,+Math.abs(N)>=1?N>0?+Math.floor(N/4294967296)>>>0:~~+Math.ceil((N-+(~~N>>>0))/4294967296)>>>0:0)],j[g>>2]=D[0],j[g+4>>2]=D[1],O.getdents&&M===0&&h===0&&(O.getdents=null),0}catch(G){if(typeof A>"u"||G.name!=="ErrnoError")throw G;return G.errno}}var Yo=(i,s,f,h)=>{for(var g=0,M=0;M<f;M++){var O=J[s>>2],G=J[s+4>>2];s+=8;var Z=A.write(i,z,O,G,h);if(Z<0)return-1;g+=Z}return g};function Ka(i,s,f,h){try{var g=$t.getStreamFromFD(i),M=Yo(g,s,f);return J[h>>2]=M,0}catch(O){if(typeof A>"u"||O.name!=="ErrnoError")throw O;return O.errno}}var or=i=>i%4===0&&(i%100!==0||i%400===0),li=(i,s)=>{for(var f=0,h=0;h<=s;f+=i[h++]);return f},Za=[31,29,31,30,31,30,31,31,30,31,30,31],jo=[31,28,31,30,31,30,31,31,30,31,30,31],Gl=(i,s)=>{for(var f=new Date(i.getTime());s>0;){var h=or(f.getFullYear()),g=f.getMonth(),M=(h?Za:jo)[g];if(s>M-f.getDate())s-=M-f.getDate()+1,f.setDate(1),g<11?f.setMonth(g+1):(f.setMonth(0),f.setFullYear(f.getFullYear()+1));else return f.setDate(f.getDate()+s),f}return f},Hl=(i,s)=>{z.set(i,s)},Vl=(i,s,f,h)=>{var g=J[h+40>>2],M={tm_sec:j[h>>2],tm_min:j[h+4>>2],tm_hour:j[h+8>>2],tm_mday:j[h+12>>2],tm_mon:j[h+16>>2],tm_year:j[h+20>>2],tm_wday:j[h+24>>2],tm_yday:j[h+28>>2],tm_isdst:j[h+32>>2],tm_gmtoff:j[h+36>>2],tm_zone:g?ie(g):""},O=ie(f),G={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var Z in G)O=O.replace(new RegExp(Z,"g"),G[Z]);var re=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],se=["January","February","March","April","May","June","July","August","September","October","November","December"];function xe(ue,ze,ot){for(var Ut=typeof ue=="number"?ue.toString():ue||"";Ut.length<ze;)Ut=ot[0]+Ut;return Ut}function Pe(ue,ze){return xe(ue,ze,"0")}function De(ue,ze){function ot(Rn){return Rn<0?-1:Rn>0?1:0}var Ut;return(Ut=ot(ue.getFullYear()-ze.getFullYear()))===0&&(Ut=ot(ue.getMonth()-ze.getMonth()))===0&&(Ut=ot(ue.getDate()-ze.getDate())),Ut}function Xe(ue){switch(ue.getDay()){case 0:return new Date(ue.getFullYear()-1,11,29);case 1:return ue;case 2:return new Date(ue.getFullYear(),0,3);case 3:return new Date(ue.getFullYear(),0,2);case 4:return new Date(ue.getFullYear(),0,1);case 5:return new Date(ue.getFullYear()-1,11,31);case 6:return new Date(ue.getFullYear()-1,11,30)}}function me(ue){var ze=Gl(new Date(ue.tm_year+1900,0,1),ue.tm_yday),ot=new Date(ze.getFullYear(),0,4),Ut=new Date(ze.getFullYear()+1,0,4),Rn=Xe(ot),jt=Xe(Ut);return De(Rn,ze)<=0?De(jt,ze)<=0?ze.getFullYear()+1:ze.getFullYear():ze.getFullYear()-1}var Le={"%a":ue=>re[ue.tm_wday].substring(0,3),"%A":ue=>re[ue.tm_wday],"%b":ue=>se[ue.tm_mon].substring(0,3),"%B":ue=>se[ue.tm_mon],"%C":ue=>{var ze=ue.tm_year+1900;return Pe(ze/100|0,2)},"%d":ue=>Pe(ue.tm_mday,2),"%e":ue=>xe(ue.tm_mday,2," "),"%g":ue=>me(ue).toString().substring(2),"%G":me,"%H":ue=>Pe(ue.tm_hour,2),"%I":ue=>{var ze=ue.tm_hour;return ze==0?ze=12:ze>12&&(ze-=12),Pe(ze,2)},"%j":ue=>Pe(ue.tm_mday+li(or(ue.tm_year+1900)?Za:jo,ue.tm_mon-1),3),"%m":ue=>Pe(ue.tm_mon+1,2),"%M":ue=>Pe(ue.tm_min,2),"%n":()=>`
`,"%p":ue=>ue.tm_hour>=0&&ue.tm_hour<12?"AM":"PM","%S":ue=>Pe(ue.tm_sec,2),"%t":()=>"	","%u":ue=>ue.tm_wday||7,"%U":ue=>{var ze=ue.tm_yday+7-ue.tm_wday;return Pe(Math.floor(ze/7),2)},"%V":ue=>{var ze=Math.floor((ue.tm_yday+7-(ue.tm_wday+6)%7)/7);if((ue.tm_wday+371-ue.tm_yday-2)%7<=2&&ze++,ze){if(ze==53){var ot=(ue.tm_wday+371-ue.tm_yday)%7;ot!=4&&(ot!=3||!or(ue.tm_year))&&(ze=1)}}else{ze=52;var Ut=(ue.tm_wday+7-ue.tm_yday-1)%7;(Ut==4||Ut==5&&or(ue.tm_year%400-1))&&ze++}return Pe(ze,2)},"%w":ue=>ue.tm_wday,"%W":ue=>{var ze=ue.tm_yday+7-(ue.tm_wday+6)%7;return Pe(Math.floor(ze/7),2)},"%y":ue=>(ue.tm_year+1900).toString().substring(2),"%Y":ue=>ue.tm_year+1900,"%z":ue=>{var ze=ue.tm_gmtoff,ot=ze>=0;return ze=Math.abs(ze)/60,ze=ze/60*100+ze%60,(ot?"+":"-")+("0000"+ze).slice(-4)},"%Z":ue=>ue.tm_zone,"%%":()=>"%"};O=O.replace(/%%/g,"\0\0");for(var Z in Le)O.includes(Z)&&(O=O.replace(new RegExp(Z,"g"),Le[Z](M)));O=O.replace(/\0\0/g,"%");var dt=Ae(O,!1);return dt.length>s?0:(Hl(dt,i),dt.length-1)},Wl=(i,s,f,h,g)=>Vl(i,s,f,h);A.createPreloadedFile=_r,A.staticInit(),Ji=o.InternalError=class extends Error{constructor(i){super(i),this.name="InternalError"}},oe(),Ne=o.BindingError=class extends Error{constructor(i){super(i),this.name="BindingError"}},Js(),en(),rl(),Uo=o.UnboundTypeError=sl(Error,"UnboundTypeError"),fl();var Xl={b:Ke,p:Ze,r:Mi,B:Ki,F:ti,E:Zi,C:Dr,w:Q,z:ae,K:it,m:ll,J:ul,j:dl,a:hl,v:$a,f:ut,i:_l,e:gl,u:xl,o:ir,x:El,l:Ml,L:wl,I:Tl,N:Al,c:Wa,O:Ll,P:ia,q:Fl,h:Ho,k:Vo,M:Il,g:Ul,d:Nl,D:Wo,G:ar,H:$o,s:Bl,t:zl,y:si,n:Ka,A:Wl},k=tt();k.R,o._memcpy=k.S,o._heif_color_conversion_options_set_defaults=k.U;var Ko=o._malloc=k.V;o._heif_nclx_color_profile_set_color_primaries=k.W;var yr=o._free=k.X;o._heif_nclx_color_profile_set_transfer_characteristics=k.Y,o._heif_nclx_color_profile_set_matrix_coefficients=k.Z,o._heif_init=k._,o._heif_deinit=k.$,o._heif_load_plugin=k.aa,o._heif_unload_plugin=k.ba,o._heif_load_plugins=k.ca,o._heif_get_plugin_directories=k.da,o._heif_free_plugin_directories=k.ea,o._heif_get_version=k.fa,o._heif_get_version_number=k.ga,o._heif_get_version_number_major=k.ha,o._heif_get_version_number_minor=k.ia,o._heif_get_version_number_maintenance=k.ja,o._heif_check_filetype=k.ka,o._heif_read_main_brand=k.la,o._heif_has_compatible_filetype=k.ma,o._heif_list_compatible_brands=k.na,o._heif_free_list_of_compatible_brands=k.oa,o._heif_check_jpeg_filetype=k.pa,o._heif_main_brand=k.qa,o._heif_fourcc_to_brand=k.ra,o._heif_read_minor_version_brand=k.sa,o._heif_brand_to_fourcc=k.ta,o._heif_has_compatible_brand=k.ua,o._heif_get_global_security_limits=k.va,o._heif_get_file_mime_type=k.wa,o._heif_get_disabled_security_limits=k.xa,o._heif_context_get_security_limits=k.ya,o._heif_context_set_security_limits=k.za,o._heif_context_alloc=k.Aa,o._heif_context_free=k.Ba,o._heif_context_read_from_file=k.Ca,o._heif_context_read_from_memory=k.Da,o._heif_context_read_from_memory_without_copy=k.Ea,o._heif_context_read_from_reader=k.Fa,o._heif_context_debug_dump_boxes_to_file=k.Ga,o._heif_context_get_primary_image_handle=k.Ha,o._heif_context_get_primary_image_ID=k.Ia,o._heif_context_is_top_level_image_ID=k.Ja,o._heif_context_get_number_of_top_level_images=k.Ka,o._heif_context_get_list_of_top_level_image_IDs=k.La,o._heif_context_get_image_handle=k.Ma,o._heif_image_handle_is_primary_image=k.Na,o._heif_image_handle_get_item_id=k.Oa,o._heif_image_handle_get_number_of_thumbnails=k.Pa,o._heif_image_handle_get_list_of_thumbnail_IDs=k.Qa,o._heif_image_handle_get_thumbnail=k.Ra,o._heif_image_handle_get_number_of_auxiliary_images=k.Sa,o._heif_image_handle_get_list_of_auxiliary_image_IDs=k.Ta,o._heif_image_handle_get_auxiliary_type=k.Ua,o._heif_image_handle_release_auxiliary_type=k.Va,o._heif_image_handle_free_auxiliary_types=k.Wa,o._heif_image_handle_get_auxiliary_image_handle=k.Xa,o._heif_image_handle_get_width=k.Ya,o._heif_image_handle_get_height=k.Za,o._heif_image_handle_get_ispe_width=k._a,o._heif_image_handle_get_ispe_height=k.$a,o._heif_image_handle_get_context=k.ab,o._heif_image_handle_get_image_tiling=k.bb,o._heif_image_handle_get_grid_image_tile_id=k.cb,o._heif_context_get_entity_groups=k.db,o._heif_entity_groups_release=k.eb,o._heif_image_handle_get_preferred_decoding_colorspace=k.fb,o._heif_image_handle_has_alpha_channel=k.gb,o._heif_image_handle_is_premultiplied_alpha=k.hb,o._heif_image_handle_get_luma_bits_per_pixel=k.ib,o._heif_image_handle_get_chroma_bits_per_pixel=k.jb,o._heif_image_handle_has_depth_image=k.kb,o._heif_depth_representation_info_free=k.lb,o._heif_image_handle_get_depth_image_representation_info=k.mb,o._heif_image_handle_get_number_of_depth_images=k.nb,o._heif_image_handle_get_list_of_depth_image_IDs=k.ob,o._heif_image_handle_get_depth_image_handle=k.pb,o._heif_decoding_options_alloc=k.qb,o._heif_decoding_options_free=k.rb,o._heif_decode_image=k.sb,o._heif_image_handle_decode_image_tile=k.tb,o._heif_image_create=k.ub,o._heif_image_get_decoding_warnings=k.vb,o._heif_image_add_decoding_warning=k.wb,o._heif_image_has_content_light_level=k.xb,o._heif_image_get_content_light_level=k.yb,o._heif_image_handle_get_content_light_level=k.zb,o._heif_image_set_content_light_level=k.Ab,o._heif_image_has_mastering_display_colour_volume=k.Bb,o._heif_image_get_mastering_display_colour_volume=k.Cb,o._heif_image_handle_get_mastering_display_colour_volume=k.Db,o._heif_image_set_mastering_display_colour_volume=k.Eb,o._heif_mastering_display_colour_volume_decode=k.Fb,o._heif_image_get_pixel_aspect_ratio=k.Gb,o._heif_image_handle_get_pixel_aspect_ratio=k.Hb,o._heif_image_set_pixel_aspect_ratio=k.Ib,o._heif_image_release=k.Jb,o._heif_image_handle_release=k.Kb,o._heif_image_get_colorspace=k.Lb,o._heif_image_get_chroma_format=k.Mb,o._heif_image_get_width=k.Nb,o._heif_image_get_height=k.Ob,o._heif_image_get_primary_width=k.Pb,o._heif_image_get_primary_height=k.Qb,o._heif_image_crop=k.Rb,o._heif_image_get_bits_per_pixel=k.Sb,o._heif_image_get_bits_per_pixel_range=k.Tb,o._heif_image_has_channel=k.Ub,o._heif_image_add_plane=k.Vb,o._heif_image_get_plane_readonly=k.Wb,o._heif_image_get_plane=k.Xb,o._heif_image_set_premultiplied_alpha=k.Yb,o._heif_image_is_premultiplied_alpha=k.Zb,o._heif_image_extend_padding_to_size=k._b,o._heif_image_scale_image=k.$b,o._heif_image_extend_to_size_fill_with_zero=k.ac,o._heif_image_set_raw_color_profile=k.bc,o._heif_image_set_nclx_color_profile=k.cc,o._heif_image_handle_get_number_of_metadata_blocks=k.dc,o._heif_image_handle_get_list_of_metadata_block_IDs=k.ec,o._heif_image_handle_get_metadata_type=k.fc,o._heif_image_handle_get_metadata_content_type=k.gc,o._heif_image_handle_get_metadata_item_uri_type=k.hc,o._heif_image_handle_get_metadata_size=k.ic,o._heif_image_handle_get_metadata=k.jc,o._heif_image_handle_get_color_profile_type=k.kc,o._heif_image_handle_get_raw_color_profile_size=k.lc,o._heif_image_handle_get_nclx_color_profile=k.mc,o._heif_image_handle_get_raw_color_profile=k.nc,o._heif_image_get_color_profile_type=k.oc,o._heif_image_get_raw_color_profile_size=k.pc,o._heif_image_get_raw_color_profile=k.qc,o._heif_image_get_nclx_color_profile=k.rc,o._heif_nclx_color_profile_alloc=k.sc,o._heif_nclx_color_profile_free=k.tc,o._heif_image_handle_has_camera_intrinsic_matrix=k.uc,o._heif_image_handle_get_camera_intrinsic_matrix=k.vc,o._heif_image_handle_has_camera_extrinsic_matrix=k.wc,o._heif_image_handle_get_camera_extrinsic_matrix=k.xc,o._heif_camera_extrinsic_matrix_release=k.yc,o._heif_camera_extrinsic_matrix_get_rotation_matrix=k.zc,o._heif_register_decoder=k.Ac,o._heif_register_decoder_plugin=k.Bc,o._heif_register_encoder_plugin=k.Cc,o._heif_context_write_to_file=k.Dc,o._heif_context_write=k.Ec,o._heif_context_add_compatible_brand=k.Fc,o._heif_context_get_encoder_descriptors=k.Gc,o._heif_get_encoder_descriptors=k.Hc,o._heif_encoder_descriptor_get_name=k.Ic,o._heif_encoder_descriptor_get_id_name=k.Jc,o._heif_get_decoder_descriptors=k.Kc,o._heif_decoder_descriptor_get_name=k.Lc,o._heif_decoder_descriptor_get_id_name=k.Mc,o._heif_encoder_descriptor_get_compression_format=k.Nc,o._heif_encoder_descriptor_supports_lossy_compression=k.Oc,o._heif_encoder_descriptor_supports_lossless_compression=k.Pc,o._heif_encoder_descriptor_supportes_lossy_compression=k.Qc,o._heif_encoder_descriptor_supportes_lossless_compression=k.Rc,o._heif_encoder_get_name=k.Sc,o._heif_context_get_encoder=k.Tc,o._heif_have_decoder_for_format=k.Uc,o._heif_have_encoder_for_format=k.Vc,o._heif_context_get_encoder_for_format=k.Wc,o._heif_encoder_release=k.Xc,o._heif_encoder_set_lossy_quality=k.Yc,o._heif_encoder_set_lossless=k.Zc,o._heif_encoder_set_logging_level=k._c,o._heif_encoder_list_parameters=k.$c,o._heif_encoder_parameter_get_name=k.ad,o._heif_encoder_parameter_get_type=k.bd,o._heif_encoder_set_parameter_integer=k.cd,o._heif_encoder_parameter_get_valid_integer_values=k.dd,o._heif_encoder_get_parameter_integer=k.ed,o._heif_encoder_parameter_get_valid_integer_range=k.fd,o._heif_encoder_parameter_get_valid_string_values=k.gd,o._heif_encoder_parameter_integer_valid_range=k.hd,o._heif_encoder_set_parameter_boolean=k.id,o._heif_encoder_get_parameter_boolean=k.jd,o._heif_encoder_set_parameter_string=k.kd,o._heif_encoder_get_parameter_string=k.ld,o._heif_encoder_parameter_string_valid_values=k.md,o._heif_encoder_parameter_integer_valid_values=k.nd,o._heif_encoder_set_parameter=k.od,o._heif_encoder_get_parameter=k.pd,o._heif_encoder_has_default=k.qd,o._heif_encoding_options_alloc=k.rd,o._heif_encoding_options_free=k.sd,o._heif_context_encode_image=k.td,o._heif_context_encode_grid=k.ud,o._heif_context_add_grid_image=k.vd,o._heif_context_add_overlay_image=k.wd,o._heif_context_add_image_tile=k.xd,o._heif_context_assign_thumbnail=k.yd,o._heif_context_encode_thumbnail=k.zd,o._heif_context_set_primary_image=k.Ad,o._heif_context_add_exif_metadata=k.Bd,o._heif_context_add_XMP_metadata=k.Cd,o._heif_context_add_XMP_metadata2=k.Dd,o._heif_context_add_generic_metadata=k.Ed,o._heif_context_add_generic_uri_metadata=k.Fd,o._heif_context_set_maximum_image_size_limit=k.Gd,o._heif_context_set_max_decoding_threads=k.Hd,o._heif_image_handle_get_number_of_region_items=k.Id,o._heif_image_handle_get_list_of_region_item_ids=k.Jd,o._heif_context_get_region_item=k.Kd,o._heif_region_item_get_id=k.Ld,o._heif_region_item_release=k.Md,o._heif_region_item_get_reference_size=k.Nd,o._heif_region_item_get_number_of_regions=k.Od,o._heif_region_item_get_list_of_regions=k.Pd,o._heif_image_handle_add_region_item=k.Qd,o._heif_region_item_add_region_point=k.Rd,o._heif_region_item_add_region_rectangle=k.Sd,o._heif_region_item_add_region_ellipse=k.Td,o._heif_region_item_add_region_polygon=k.Ud,o._heif_region_item_add_region_polyline=k.Vd,o._heif_region_item_add_region_referenced_mask=k.Wd,o._heif_region_item_add_region_inline_mask_data=k.Xd,o._heif_region_item_add_region_inline_mask=k.Yd,o._heif_region_release=k.Zd,o._heif_region_release_many=k._d,o._heif_region_get_type=k.$d,o._heif_region_get_point=k.ae,o._heif_region_get_point_transformed=k.be,o._heif_region_get_rectangle=k.ce,o._heif_region_get_rectangle_transformed=k.de,o._heif_region_get_ellipse=k.ee,o._heif_region_get_ellipse_transformed=k.fe,o._heif_region_get_polygon_num_points=k.ge,o._heif_region_get_polyline_num_points=k.he,o._heif_region_get_polygon_points=k.ie,o._heif_region_get_polyline_points=k.je,o._heif_region_get_polygon_points_transformed=k.ke,o._heif_region_get_polyline_points_transformed=k.le,o._heif_region_get_referenced_mask_ID=k.me,o._heif_region_get_inline_mask_data_len=k.ne,o._heif_region_get_inline_mask_data=k.oe,o._heif_region_get_mask_image=k.pe,o._heif_item_get_properties_of_type=k.qe,o._heif_item_get_transformation_properties=k.re,o._heif_item_get_property_type=k.se,o._heif_item_get_property_user_description=k.te,o._heif_item_add_property_user_description=k.ue,o._heif_item_get_property_transform_mirror=k.ve,o._heif_item_get_property_transform_rotation_ccw=k.we,o._heif_item_get_property_transform_crop_borders=k.xe,o._heif_property_user_description_release=k.ye,o._heif_item_add_raw_property=k.ze,o._heif_item_get_property_raw_size=k.Ae,o._heif_item_get_property_raw_data=k.Be,o._heif_item_get_property_uuid_type=k.Ce,o._heif_context_get_number_of_items=k.De,o._heif_context_get_list_of_item_IDs=k.Ee,o._heif_item_get_item_type=k.Fe,o._heif_item_is_item_hidden=k.Ge,o._heif_item_get_mime_item_content_type=k.He,o._heif_item_get_mime_item_content_encoding=k.Ie,o._heif_item_get_uri_item_uri_type=k.Je,o._heif_item_get_item_name=k.Ke,o._heif_item_get_item_data=k.Le,o._heif_release_item_data=k.Me,o._heif_context_get_item_references=k.Ne,o._heif_release_item_references=k.Oe,o._heif_context_add_item=k.Pe,o._heif_context_add_mime_item=k.Qe,o._heif_context_add_precompressed_mime_item=k.Re,o._heif_context_add_uri_item=k.Se,o._heif_context_add_item_reference=k.Te,o._heif_context_add_item_references=k.Ue,o._heif_item_set_item_name=k.Ve,o._de265_get_version=k.We,o._de265_init=k.Xe,o._de265_free=k.Ye,o._de265_new_decoder=k.Ze,o._de265_set_parameter_bool=k._e,o._de265_free_decoder=k.$e,o._de265_push_NAL=k.af,o._de265_flush_data=k.bf,o._de265_decode=k.cf,o._de265_get_next_picture=k.df,o._de265_get_chroma_format=k.ef,o._de265_get_image_width=k.ff,o._de265_get_image_height=k.gf,o._de265_get_bits_per_pixel=k.hf,o._de265_get_image_plane=k.jf,o._de265_get_image_colour_primaries=k.kf,o._de265_get_image_transfer_characteristics=k.lf,o._de265_get_image_matrix_coefficients=k.mf,o._de265_get_image_full_range_flag=k.nf,o._de265_release_next_picture=k.of;var oa=k.pf,$l=k.qf;o.dynCall_ji=k.rf,o.dynCall_iij=k.sf,o.dynCall_jijj=k.tf,o.dynCall_vijj=k.uf,o.dynCall_jiji=k.vf,o.dynCall_viijii=k.wf,o.dynCall_iiiiij=k.xf,o.dynCall_iiiiijj=k.yf,o.dynCall_iiiiiijj=k.zf,o._heif_error_ok=80028,o._heif_error_success=79460,o._heif_error_invalid_parameter_value=80052,o._heif_error_unsupported_parameter=80040;var sa;qe=function i(){sa||Ja(),sa||(qe=i)};function Ja(){if(et>0||(ht(),et>0))return;function i(){sa||(sa=!0,o.calledRun=!0,!w&&(xt(),p(o),o.onRuntimeInitialized&&o.onRuntimeInitialized(),gt()))}o.setStatus?(o.setStatus("Running..."),setTimeout(function(){setTimeout(function(){o.setStatus("")},1),i()},1)):i()}if(o.preInit)for(typeof o.preInit=="function"&&(o.preInit=[o.preInit]);o.preInit.length>0;)o.preInit.pop()();Ja();function Zo(i){for(var s=new ArrayBuffer(i.length),f=new Uint8Array(s),h=0,g=i.length;h<g;h++)f[h]=i.charCodeAt(h);return s}var sr=function(i){this.handle=i,this.img=null};sr.prototype.free=function(){this.handle&&(o.heif_image_handle_release(this.handle),this.handle=null)},sr.prototype._ensureImage=function(){if(!this.img){var i=o.heif_js_decode_image(this.handle,o.heif_colorspace.heif_colorspace_YCbCr,o.heif_chroma.heif_chroma_420);if(!i||i.code){console.log("Decoding image failed",this.handle,i);return}this.data=new Uint8Array(Zo(i.data)),delete i.data,this.img=i,i.alpha!==void 0&&(this.alpha=new Uint8Array(Zo(i.alpha)),delete i.alpha)}},sr.prototype.get_width=function(){return o.heif_image_handle_get_width(this.handle)},sr.prototype.get_height=function(){return o.heif_image_handle_get_height(this.handle)},sr.prototype.is_primary=function(){return!!heif_image_handle_is_primary_image(this.handle)},sr.prototype.display=function(i,s){this.get_width(),this.get_height(),setTimeout((function(){if(!this.img){var f=o.heif_js_decode_image2(this.handle,o.heif_colorspace.heif_colorspace_RGB,o.heif_chroma.heif_chroma_interleaved_RGBA);if(!f||f.code){console.log("Decoding image failed",this.handle,f),s(null);return}for(let h of f.channels)if(h.id==o.heif_channel.heif_channel_interleaved)if(h.stride==h.width*4)i.data.set(h.data);else for(let g=0;g<h.height;g++){let M=h.data.slice(g*h.stride,g*h.stride+h.width*4),O=g*h.width*4;i.data.set(M,O)}o.heif_image_release(f.image)}s(i)}).bind(this),0)};var c=function(){this.decoder=null};c.prototype.decode=function(i){if(this.decoder&&o.heif_context_free(this.decoder),this.decoder=o.heif_context_alloc(),!this.decoder)return console.log("Could not create HEIF context"),[];var s=o.heif_context_read_from_memory(this.decoder,i);if(s.code!==o.heif_error_code.heif_error_Ok)return console.log("Could not parse HEIF file",s.message),[];var f=o.heif_js_context_get_list_of_top_level_image_IDs(this.decoder);if(!f||f.code)return console.log("Error loading image ids",f),[];if(!f.length)return console.log("No images found"),[];for(var h=[],g=0;g<f.length;g++){var M=o.heif_js_context_get_image_handle(this.decoder,f[g]);if(!M||M.code){console.log("Could not get image data for id",f[g],M);continue}h.push(new sr(M))}return h};var d=function(i){return i.charCodeAt(0)<<24|i.charCodeAt(1)<<16|i.charCodeAt(2)<<8|i.charCodeAt(3)};o.HeifImage=sr,o.HeifDecoder=c,o.fourcc=d;const _=["heif_error_code","heif_suberror_code","heif_compression_format","heif_chroma","heif_colorspace","heif_channel"];for(const i of _)for(const s in o[i])!o[i].hasOwnProperty(s)||s==="values"||(o[s]=o[i][s]);for(const i in o)i.indexOf("_heif_")!==0||o[i.slice(1)]!==void 0||(o[i.slice(1)]=o[i]);return u=o,u}})();n.exports=t})(Cc)),Cc.exports}var zy=By();const Gy=Dh(zy);let Ms=null;async function Hy(){if(Ms)return Ms;console.log("[HEIC] Initializing libheif...");const n="/ultrahdr-pwa-svelte/assets/libheif.wasm";console.log("[HEIC] Fetching WASM from:",n);const e=await fetch(n);if(!e.ok)throw new Error(`Failed to fetch libheif WASM: ${e.statusText}`);const t=await e.arrayBuffer();return Ms=await Gy({wasmBinary:t,locateFile:r=>r.endsWith(".wasm")?n:r}),console.log("[HEIC] libheif initialized"),Ms}async function Vy(n,e={quality:.95,discardGainMap:!1}){console.log("[HEIC] Processing HEIC file:",n.name);const t=await Hy(),r=await n.arrayBuffer(),l=new t.HeifDecoder().decode(r);if(!l||l.length===0)throw new Error("No images found in HEIC file");console.log("[HEIC] Found",l.length,"top-level images");for(let E=0;E<l.length;E++)console.log(`[HEIC] Image ${E}:`,l[E].get_width(),"x",l[E].get_height());const u=l[0],o=u.handle;let p=0;if(t.heif_image_handle_get_number_of_auxiliary_images)try{p=t.heif_image_handle_get_number_of_auxiliary_images(o,0),console.log("[HEIC] Auxiliary images count:",p)}catch(E){console.warn("[HEIC] Could not get auxiliary image count:",E)}else console.warn("[HEIC] heif_image_handle_get_number_of_auxiliary_images not available");if(p>0&&!e.discardGainMap)try{const E=p*4,b=t._malloc(E),H=t.heif_image_handle_get_list_of_auxiliary_image_IDs(o,0,b,p);console.log("[HEIC] Got",H,"auxiliary IDs");const V=new Int32Array(t.HEAP32.buffer,b,H);for(let X=0;X<H;X++){const I=V[X];let C=null;const L=t._malloc(4),W=t.heif_image_handle_get_auxiliary_image_handle(o,I,L);if(W&&W.code!==0){console.warn("[HEIC] Failed to get aux handle for ID",I,W),t._free(L);continue}const P=t.getValue(L,"*"),w=t.heif_image_handle_get_auxiliary_type(P),z=t.UTF8ToString(w);if(console.log("[HEIC] Aux Image Type:",z),z==="urn:apple:gainmap"||z==="urn:google:gainmap"){console.log("[HEIC] Found Gain Map!");const B=new t.HeifImage(P),Y=B.get_width(),K=B.get_height();console.log("[HEIC] Gain Map Size:",Y,"x",K);const j=document.createElement("canvas");j.width=Y,j.height=K;const ce=j.getContext("2d").createImageData(Y,K);await new Promise((te,Se)=>{B.display(ce,be=>{be?te(be):Se(new Error("Gain map decoding error"))})}),gainMapImageData=ce,t._free(L);break}t.heif_image_handle_release(P),t._free(L)}t._free(b)}catch(E){console.warn("[HEIC] Error iterating auxiliary images:",E)}else e.discardGainMap&&console.log("[HEIC] Gain map extraction skipped (discardGainMap=true)");const m=u.get_width(),x=u.get_height(),v=document.createElement("canvas");v.width=m,v.height=x;const y=v.getContext("2d"),S=y.createImageData(m,x);if(await new Promise((E,b)=>{u.display(S,H=>{H?E(H):b(new Error("HEIF processing error"))})}),gainMapImageData)return console.log("[HEIC] Returning SDR + Gain Map"),{sdr:S,gainMap:gainMapImageData,name:n.name};console.log("[HEIC] No gain map found (or discarded), falling back to ITM"),y.putImageData(S,0,0);const T=await new Promise(E=>v.toBlob(E,"image/png"));return new File([T],n.name.replace(/\.(heic|heif)$/i,".png"),{type:"image/png"})}async function Wy(n,e={maxContentBoost:4,rotation:0,quality:.95,discardGainMap:!1}){if(console.log("[Process] Starting processing for:",n.name),n.name.toLowerCase().endsWith(".heic")||n.name.toLowerCase().endsWith(".heif")){console.log("[Process] Detected HEIC/HEIF, converting...");try{const B=await Vy(n,e);B&&(n=B,console.log("[Process] Converted HEIC to:",n.type))}catch(B){throw console.error("[Process] HEIC conversion failed:",B),B}}await n.arrayBuffer();const t=await Xy(n);console.log("[Process] File loaded");let r=null;try{(n.type==="image/jpeg"||n.type==="image/jpg")&&(r=ao.load(t),console.log("[Process] EXIF extracted"))}catch(B){console.warn("Could not extract EXIF:",B)}const a=await new Promise((B,Y)=>{const K=new Image;K.onload=()=>B(K),K.onerror=Y,K.src=t});console.log("[Process] Image object created",a.width,"x",a.height);let l=document.createElement("canvas"),u=l.getContext("2d"),o=a.width,p=a.height,m=e.rotation||0;m=(m%360+360)%360,m===90||m===270?(l.width=p,l.height=o):(l.width=o,l.height=p),u.translate(l.width/2,l.height/2),u.rotate(m*Math.PI/180),u.drawImage(a,-o/2,-p/2),console.log("[Process] Canvas drawn (rotation applied)");let x=u.getImageData(0,0,l.width,l.height),v=x.data;console.log("[Process] Image data retrieved"),l.width=1,l.height=1,l=null,u=null,console.log("[Process] Canvas cleaned up");const y=v.length,S=new Uint16Array(y),T=e.maxContentBoost||4,F=B=>(B/=255,B<=.04045?B/12.92:Math.pow((B+.055)/1.055,2.4));for(let B=0;B<y;B+=4)S[B]=cs.toHalfFloat(F(v[B])*T),S[B+1]=cs.toHalfFloat(F(v[B+1])*T),S[B+2]=cs.toHalfFloat(F(v[B+2])*T),S[B+3]=cs.toHalfFloat(v[B+3]/255);console.log("[Process] Converted to HalfFloat Uint16Array");const E=new Eo(S,x.width,x.height,An,ei);E.colorSpace=Rr,E.needsUpdate=!0,console.log("[Process] HDR DataTexture created");const b=Cy({image:E,maxContentBoost:T,toneMapping:Xr});console.log("[Process] gainmap-js encode() called"),b.sdr.material.exposure=1/T,b.sdr.material.needsUpdate=!0;let H=x;b.sdr.render(),console.log("[Process] SDR rendered");const V=b.gainMap.toArray();console.log("[Process] GainMap toArray() completed");let X=new ImageData(new Uint8ClampedArray(V),b.gainMap.width,b.gainMap.height);b.gainMap.dispose(),b.sdr.dispose(),E.dispose(),console.log("[Process] WebGL resources disposed");const I="image/jpeg",C=e.quality||.95;console.log("[Process] Starting SDR compression...");const L=await mu({source:H,mimeType:I,quality:C});console.log("[Process] SDR compression complete"),H=null,v=null,x=null,console.log("[Process] SDR data released"),console.log("[Process] Starting GainMap compression...");const W=await mu({source:X,mimeType:I,quality:C});console.log("[Process] GainMap compression complete"),X=null;const P=b.getMetadata();console.log("[Process] Embedding metadata...");const w=await Iy({...b,...P,sdr:L,gainMap:W});console.log("[Process] Metadata embedded");let z=w;if(r)try{r["0th"]&&r["0th"][ao.ImageIFD.Orientation]&&(r["0th"][ao.ImageIFD.Orientation]=1);const B=Array.from(z).map(J=>String.fromCharCode(J)).join(""),Y=ao.dump(r),K=ao.insert(Y,B),j=K.length;z=new Uint8Array(j);for(let J=0;J<j;J++)z[J]=K.charCodeAt(J);console.log("[Process] EXIF re-inserted")}catch(B){console.warn("Could not re-insert EXIF:",B)}return console.log("[Process] Processing complete, returning Blob"),new Blob([z],{type:"image/jpeg"})}function Xy(n){return new Promise((e,t)=>{const r=new FileReader;r.onload=()=>e(r.result),r.onerror=t,r.readAsDataURL(n)})}var $y=Qr('<div class="error card svelte-1a1t040"><h3>Error</h3> <p> </p></div>'),qy=Qr('<div class="loading-overlay svelte-1a1t040"><div class="spinner svelte-1a1t040"></div> <p>Processing...</p></div>'),Yy=kp('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 svelte-1a1t040"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"></path></svg>'),jy=Qr('<div class="circle svelte-1a1t040"></div>'),Ky=Qr('<div role="button" tabindex="0"><div class="selection-indicator svelte-1a1t040"><!></div> <div class="preview svelte-1a1t040"><img alt="Processed result" class="svelte-1a1t040"/></div> <div class="info svelte-1a1t040"><p class="filename svelte-1a1t040"> </p> <p class="size svelte-1a1t040"> </p></div></div>'),Zy=Qr('<div class="results svelte-1a1t040"><div class="results-header svelte-1a1t040"><h3>Preview</h3> <div class="selection-controls svelte-1a1t040"><button class="text-btn svelte-1a1t040">Select All</button> <button class="text-btn svelte-1a1t040">Deselect All</button> <button class="primary small svelte-1a1t040"> </button></div></div> <div class="grid svelte-1a1t040"></div></div>'),Jy=Qr('<div class="processor svelte-1a1t040"><div class="controls card"><h2>Settings</h2> <div class="control-group svelte-1a1t040"><span class="label svelte-1a1t040">Rotation</span> <div class="button-group svelte-1a1t040"><button class="icon-btn svelte-1a1t040" title="Rotate Left"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 svelte-1a1t040"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"></path></svg> Left</button> <button class="icon-btn svelte-1a1t040" title="Rotate Right">Right <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 svelte-1a1t040"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"></path></svg></button> <span class="value svelte-1a1t040"> </span></div></div> <div class="control-group svelte-1a1t040"><label for="boost" class="svelte-1a1t040">Max Content Boost (HDR Intensity)</label> <div class="range-wrapper svelte-1a1t040"><input type="range" id="boost" min="1.0" max="4.0" step="0.1" class="svelte-1a1t040"/> <span class="value svelte-1a1t040"> </span></div> <p class="help-text svelte-1a1t040">Higher values create brighter highlights.</p></div> <div class="control-group svelte-1a1t040"><label for="quality" class="svelte-1a1t040">JPEG Quality</label> <div class="range-wrapper svelte-1a1t040"><input type="range" id="quality" min="0.1" max="1.0" step="0.05" class="svelte-1a1t040"/> <span class="value svelte-1a1t040"> </span></div></div> <div class="control-group checkbox-group svelte-1a1t040"><input type="checkbox" id="discardGainMap"/> <label for="discardGainMap" class="inline-label svelte-1a1t040">Discard existing gain map(s)</label></div> <div class="actions svelte-1a1t040"><button class="secondary svelte-1a1t040">Start Over</button></div></div> <!> <div><!> <!></div></div>');function Qy(n,e){If(e,!1);let t=nm(e,"files",28,()=>[]),r=ur(2.3),a=ur(0),l=ur(.95),u=ur(!1),o=ur(!1),p=ur([]),m=ur(null),x,v=ur(new Set);rm(()=>{y()});async function y(){wt(o,!0),wt(p,[]),wt(m,null),wt(v,new Set);try{for(let Ce=0;Ce<t().length;Ce++){const ke=t()[Ce],lt=await Wy(ke,{maxContentBoost:Ve(r),rotation:Ve(a),rotation:Ve(a),quality:Ve(l),discardGainMap:Ve(u)}),Ie=URL.createObjectURL(lt);wt(p,[...Ve(p),{originalName:ke.name,url:Ie,size:lt.size,index:Ce}]),Ve(v).add(Ce)}wt(v,Ve(v)),wt(v,Ve(v))}catch(Ce){console.error("[UI] Error processing files:",Ce),wt(m,Ce.message)}finally{wt(o,!1)}}function S(){clearTimeout(x),x=setTimeout(()=>{y()},500)}function T(Ce){wt(a,(Ve(a)+Ce+360)%360),S()}function F(Ce){Ve(v).has(Ce)?Ve(v).delete(Ce):Ve(v).add(Ce),wt(v,Ve(v))}function E(){Ve(p).forEach((Ce,ke)=>Ve(v).add(ke)),wt(v,Ve(v))}function b(){Ve(v).clear(),wt(v,Ve(v))}function H(Ce){const ke=document.createElement("a");ke.href=Ce.url,ke.download=`ultrahdr-${Ce.originalName.replace(/\.[^/.]+$/,"")}.jpg`,ke.click()}function V(){Ve(p).forEach((Ce,ke)=>{Ve(v).has(ke)&&H(Ce)})}function X(){t([]),wt(p,[]),wt(a,0),wt(r,2.3),wt(l,.95),wt(u,!1),wt(v,new Set),I("reset")}const I=eh();Qd();var C=Jy(),L=Nt(C),W=Xt(Nt(L),2),P=Xt(Nt(W),2),w=Nt(P),z=Xt(w,2),B=Xt(z,2),Y=Nt(B),K=Xt(W,2),j=Xt(Nt(K),2),J=Nt(j),ce=Xt(J,2),te=Nt(ce),Se=Xt(K,2),be=Xt(Nt(Se),2),$e=Nt(be),st=Xt($e,2),ht=Nt(st),xt=Xt(Se,2),gt=Nt(xt),_e=Xt(xt,2),ge=Nt(_e),Oe=Xt(L,2);{var et=Ce=>{var ke=$y(),lt=Xt(Nt(ke),2),Ie=Nt(lt);oo(()=>Pi(Ie,Ve(m))),br(Ce,ke)};lo(Oe,Ce=>{Ve(m)&&Ce(et)})}var qe=Xt(Oe,2);let ct;var Pt=Nt(qe);{var ft=Ce=>{var ke=qy();br(Ce,ke)};lo(Pt,Ce=>{Ve(o),Ve(p),xn(()=>Ve(o)&&Ve(p).length===0)&&Ce(ft)})}var Tt=Xt(Pt,2);{var $=Ce=>{var ke=Zy(),lt=Nt(ke),Ie=Xt(Nt(lt),2),yt=Nt(Ie),Ye=Xt(yt,2),tt=Xt(Ye,2),N=Nt(tt),D=Xt(lt,2);Xp(D,5,()=>Ve(p),Vp,(ne,fe,de)=>{var ie=Ky();let Ke;var Ue=Nt(ie),rt=Nt(Ue);{var Ze=Te=>{var Ae=Yy();br(Te,Ae)},ve=Te=>{var Ae=jy();br(Te,Ae)};lo(rt,Te=>{Ve(v),xn(()=>Ve(v).has(de))?Te(Ze):Te(ve,!1)})}var he=Xt(Ue,2),we=Nt(he),je=Xt(he,2),Be=Nt(je),Qe=Nt(Be),q=Xt(Be,2),Fe=Nt(q);oo((Te,Ae)=>{Ke=Oc(ie,1,"result-card card svelte-1a1t040",null,Ke,Te),Zp(we,"src",(Ve(fe),xn(()=>Ve(fe).url))),Pi(Qe,(Ve(fe),xn(()=>Ve(fe).originalName))),Pi(Fe,`${Ae??""} MB`)},[()=>({selected:Ve(v).has(de)}),()=>(Ve(fe),xn(()=>(Ve(fe).size/1024/1024).toFixed(2)))]),Dn("click",ie,()=>F(de)),Dn("keydown",ie,Te=>Te.key==="Enter"&&F(de)),br(ne,ie)}),oo(()=>{tt.disabled=(Ve(v),xn(()=>Ve(v).size===0)),Pi(N,`Download Selected (${Ve(v),xn(()=>Ve(v).size)??""})`)}),Dn("click",yt,E),Dn("click",Ye,b),Dn("click",tt,V),br(Ce,ke)};lo(Tt,Ce=>{Ve(p),xn(()=>Ve(p).length>0)&&Ce($)})}oo((Ce,ke)=>{w.disabled=Ve(o),z.disabled=Ve(o),Pi(Y,`${Ve(a)??""}°`),J.disabled=Ve(o),Pi(te,`${Ce??""}x`),$e.disabled=Ve(o),Pi(ht,`${ke??""}%`),gt.disabled=Ve(o),ge.disabled=Ve(o),ct=Oc(qe,1,"results-container svelte-1a1t040",null,ct,{loading:Ve(o)})},[()=>(Ve(r),xn(()=>Ve(r).toFixed(1))),()=>(Ve(l),xn(()=>Math.round(Ve(l)*100)))]),Dn("click",w,()=>T(-90)),Dn("click",z,()=>T(90)),hu(J,()=>Ve(r),Ce=>wt(r,Ce)),Dn("input",J,S),hu($e,()=>Ve(l),Ce=>wt(l,Ce)),Dn("input",$e,S),em(gt,()=>Ve(u),Ce=>wt(u,Ce)),Dn("click",ge,X),br(n,C),Uf()}var eS=Qr('<div class="drop-container svelte-1n46o8q"><!></div>'),tS=Qr('<main><h1>UltraHDR Converter</h1> <p class="subtitle svelte-1n46o8q">Convert your images to UltraHDR with gain maps, entirely offline.</p> <!></main>');function nS(n){let e=ur([]);function t(p){wt(e,Array.from(p.detail))}function r(){wt(e,[])}var a=tS(),l=Xt(Nt(a),4);{var u=p=>{var m=eS(),x=Nt(m);lm(x,{$$events:{files:t}}),br(p,m)},o=p=>{Qy(p,{get files(){return Ve(e)},$$events:{reset:r}})};lo(l,p=>{Ve(e).length===0?p(u):p(o,!1)})}br(n,a)}Bp(nS,{target:document.getElementById("app")});
