(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(r){if(r.ep)return;r.ep=!0;const a=t(r);fetch(r.href,a)}})();const zo=!1;var Bl=Array.isArray,yh=Array.prototype.indexOf,kl=Array.from,bh=Object.defineProperty,Yr=Object.getOwnPropertyDescriptor,Nf=Object.getOwnPropertyDescriptors,Eh=Object.prototype,Mh=Array.prototype,zl=Object.getPrototypeOf,Mc=Object.isExtensible;function Th(n){return n()}function Go(n){for(var e=0;e<n.length;e++)n[e]()}function Of(){var n,e,t=new Promise((i,r)=>{n=i,e=r});return{promise:t,resolve:n,reject:e}}const nn=2,Bf=4,Ns=8,Di=16,Li=32,yr=64,Os=128,Kn=512,ln=1024,En=2048,Ii=4096,Dn=8192,Ti=16384,Gl=32768,Jr=65536,Tc=1<<17,kf=1<<18,aa=1<<19,zf=1<<20,xr=32768,Vo=1<<21,Vl=1<<22,$i=1<<23,jr=Symbol("$state"),wh=Symbol("legacy props"),Xr=new class extends Error{name="StaleReactionError";message="The reaction that called `getAbortSignal()` was re-run or destroyed"};function Gf(n){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function Ah(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function Rh(n){throw new Error("https://svelte.dev/e/effect_in_teardown")}function Ch(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function Ph(n){throw new Error("https://svelte.dev/e/effect_orphan")}function Dh(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function Lh(n){throw new Error("https://svelte.dev/e/props_invalid_value")}function Ih(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function Fh(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function Uh(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function Nh(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}const Oh=1,Bh=2,kh=16,zh=2,Gh=8,Vh=2,on=Symbol(),Hh="http://www.w3.org/1999/xhtml";function Wh(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}function Vf(n){return n===this.v}function Xh(n,e){return n!=n?e==e:n!==e||n!==null&&typeof n=="object"||typeof n=="function"}function Hf(n){return!Xh(n,this.v)}let sa=!1,qh=!1;function Yh(){sa=!0}let Ot=null;function Qr(n){Ot=n}function Hl(n,e=!1,t){Ot={p:Ot,i:!1,c:null,e:null,s:n,x:null,l:sa&&!e?{s:null,u:null,$:[]}:null}}function Wl(n){var e=Ot,t=e.e;if(t!==null){e.e=null;for(var i of t)au(i)}return e.i=!0,Ot=e.p,{}}function Oa(){return!sa||Ot!==null&&Ot.l===null}let hr=[];function Wf(){var n=hr;hr=[],Go(n)}function Bs(n){if(hr.length===0&&!Ma){var e=hr;queueMicrotask(()=>{e===hr&&Wf()})}hr.push(n)}function jh(){for(;hr.length>0;)Wf()}function Xf(n){var e=St;if(e===null)return xt.f|=$i,n;if((e.f&Gl)===0){if((e.f&Os)===0)throw n;e.b.error(n)}else ea(n,e)}function ea(n,e){for(;e!==null;){if((e.f&Os)!==0)try{e.b.error(n);return}catch(t){n=t}e=e.parent}throw n}const Za=new Set;let Rt=null,Es=null,Cn=null,Nn=[],ks=null,Ho=!1,Ma=!1;class ri{committed=!1;current=new Map;previous=new Map;#e=new Set;#t=new Set;#i=0;#n=0;#l=null;#a=[];#r=[];skipped_effects=new Set;is_fork=!1;is_deferred(){return this.is_fork||this.#n>0}process(e){Nn=[],Es=null,this.apply();var t={parent:null,effect:null,effects:[],render_effects:[],block_effects:[]};for(const i of e)this.#s(i,t);this.is_fork||this.#f(),this.is_deferred()?(this.#o(t.effects),this.#o(t.render_effects),this.#o(t.block_effects)):(Es=this,Rt=null,wc(t.render_effects),wc(t.effects),Es=null,this.#l?.resolve()),Cn=null}#s(e,t){e.f^=ln;for(var i=e.first;i!==null;){var r=i.f,a=(r&(Li|yr))!==0,o=a&&(r&ln)!==0,l=o||(r&Dn)!==0||this.skipped_effects.has(i);if((i.f&Os)!==0&&i.b?.is_pending()&&(t={parent:t,effect:i,effects:[],render_effects:[],block_effects:[]}),!l&&i.fn!==null){a?i.f^=ln:(r&Bf)!==0?t.effects.push(i):Ba(i)&&((i.f&Di)!==0&&t.block_effects.push(i),Ra(i));var f=i.first;if(f!==null){i=f;continue}}var u=i.parent;for(i=i.next;i===null&&u!==null;)u===t.effect&&(this.#o(t.effects),this.#o(t.render_effects),this.#o(t.block_effects),t=t.parent),i=u.next,u=u.parent}}#o(e){for(const t of e)((t.f&En)!==0?this.#a:this.#r).push(t),this.#c(t.deps),cn(t,ln)}#c(e){if(e!==null)for(const t of e)(t.f&nn)===0||(t.f&xr)===0||(t.f^=xr,this.#c(t.deps))}capture(e,t){this.previous.has(e)||this.previous.set(e,t),(e.f&$i)===0&&(this.current.set(e,e.v),Cn?.set(e,e.v))}activate(){Rt=this,this.apply()}deactivate(){Rt===this&&(Rt=null,Cn=null)}flush(){if(this.activate(),Nn.length>0){if(qf(),Rt!==null&&Rt!==this)return}else this.#i===0&&this.process([]);this.deactivate()}discard(){for(const e of this.#t)e(this);this.#t.clear()}#f(){if(this.#n===0){for(const e of this.#e)e();this.#e.clear()}this.#i===0&&this.#u()}#u(){if(Za.size>1){this.previous.clear();var e=Cn,t=!0,i={parent:null,effect:null,effects:[],render_effects:[],block_effects:[]};for(const a of Za){if(a===this){t=!1;continue}const o=[];for(const[f,u]of this.current){if(a.current.has(f))if(t&&u!==a.current.get(f))a.current.set(f,u);else continue;o.push(f)}if(o.length===0)continue;const l=[...a.current.keys()].filter(f=>!this.current.has(f));if(l.length>0){var r=Nn;Nn=[];const f=new Set,u=new Map;for(const h of o)Yf(h,l,f,u);if(Nn.length>0){Rt=a,a.apply();for(const h of Nn)a.#s(h,i);a.deactivate()}Nn=r}}Rt=null,Cn=e}this.committed=!0,Za.delete(this)}increment(e){this.#i+=1,e&&(this.#n+=1)}decrement(e){this.#i-=1,e&&(this.#n-=1),this.revive()}revive(){for(const e of this.#a)cn(e,En),_r(e);for(const e of this.#r)cn(e,Ii),_r(e);this.#a=[],this.#r=[],this.flush()}oncommit(e){this.#e.add(e)}ondiscard(e){this.#t.add(e)}settled(){return(this.#l??=Of()).promise}static ensure(){if(Rt===null){const e=Rt=new ri;Za.add(Rt),Ma||ri.enqueue(()=>{Rt===e&&e.flush()})}return Rt}static enqueue(e){Bs(e)}apply(){}}function $h(n){var e=Ma;Ma=!0;try{for(var t;;){if(jh(),Nn.length===0&&(Rt?.flush(),Nn.length===0))return ks=null,t;qf()}}finally{Ma=e}}function qf(){var n=Zi;Ho=!0;var e=null;try{var t=0;for(Ds(!0);Nn.length>0;){var i=ri.ensure();if(t++>1e3){var r,a;Kh()}i.process(Nn),Ki.clear()}}finally{Ho=!1,Ds(n),ks=null}}function Kh(){try{Dh()}catch(n){ea(n,ks)}}let bi=null;function wc(n){var e=n.length;if(e!==0){for(var t=0;t<e;){var i=n[t++];if((i.f&(Ti|Dn))===0&&Ba(i)&&(bi=new Set,Ra(i),i.deps===null&&i.first===null&&i.nodes_start===null&&(i.teardown===null&&i.ac===null?cu(i):i.fn=null),bi?.size>0)){Ki.clear();for(const r of bi){if((r.f&(Ti|Dn))!==0)continue;const a=[r];let o=r.parent;for(;o!==null;)bi.has(o)&&(bi.delete(o),a.push(o)),o=o.parent;for(let l=a.length-1;l>=0;l--){const f=a[l];(f.f&(Ti|Dn))===0&&Ra(f)}}bi.clear()}}bi=null}}function Yf(n,e,t,i){if(!t.has(n)&&(t.add(n),n.reactions!==null))for(const r of n.reactions){const a=r.f;(a&nn)!==0?Yf(r,e,t,i):(a&(Vl|Di))!==0&&(a&En)===0&&jf(r,e,i)&&(cn(r,En),_r(r))}}function jf(n,e,t){const i=t.get(n);if(i!==void 0)return i;if(n.deps!==null)for(const r of n.deps){if(e.includes(r))return!0;if((r.f&nn)!==0&&jf(r,e,t))return t.set(r,!0),!0}return t.set(n,!1),!1}function _r(n){for(var e=ks=n;e.parent!==null;){e=e.parent;var t=e.f;if(Ho&&e===St&&(t&Di)!==0&&(t&kf)===0)return;if((t&(yr|Li))!==0){if((t&ln)===0)return;e.f^=ln}}Nn.push(e)}function Zh(n){let e=0,t=vr(0),i;return()=>{Vs()&&(Ae(t),su(()=>(e===0&&(i=mn(()=>n(()=>Ta(t)))),e+=1,()=>{Bs(()=>{e-=1,e===0&&(i?.(),i=void 0,Ta(t))})})))}}var Jh=Jr|aa|Os;function Qh(n,e,t){new ep(n,e,t)}class ep{parent;#e=!1;#t;#i=null;#n;#l;#a;#r=null;#s=null;#o=null;#c=null;#f=null;#u=0;#d=0;#p=!1;#h=null;#v=Zh(()=>(this.#h=vr(this.#u),()=>{this.#h=null}));constructor(e,t,i){this.#t=e,this.#n=t,this.#l=i,this.parent=St.b,this.#e=!!this.#n.pending,this.#a=jl(()=>{St.b=this;{var r=this.#x();try{this.#r=On(()=>i(r))}catch(a){this.error(a)}this.#d>0?this.#g():this.#e=!1}return()=>{this.#f?.remove()}},Jh)}#S(){try{this.#r=On(()=>this.#l(this.#t))}catch(e){this.error(e)}this.#e=!1}#y(){const e=this.#n.pending;e&&(this.#s=On(()=>e(this.#t)),ri.enqueue(()=>{var t=this.#x();this.#r=this.#m(()=>(ri.ensure(),On(()=>this.#l(t)))),this.#d>0?this.#g():($r(this.#s,()=>{this.#s=null}),this.#e=!1)}))}#x(){var e=this.#t;return this.#e&&(this.#f=Sr(),this.#t.before(this.#f),e=this.#f),e}is_pending(){return this.#e||!!this.parent&&this.parent.is_pending()}has_pending_snippet(){return!!this.#n.pending}#m(e){var t=St,i=xt,r=Ot;li(this.#a),Sn(this.#a),Qr(this.#a.ctx);try{return e()}catch(a){return Xf(a),null}finally{li(t),Sn(i),Qr(r)}}#g(){const e=this.#n.pending;this.#r!==null&&(this.#c=document.createDocumentFragment(),this.#c.append(this.#f),du(this.#r,this.#c)),this.#s===null&&(this.#s=On(()=>e(this.#t)))}#_(e){if(!this.has_pending_snippet()){this.parent&&this.parent.#_(e);return}this.#d+=e,this.#d===0&&(this.#e=!1,this.#s&&$r(this.#s,()=>{this.#s=null}),this.#c&&(this.#t.before(this.#c),this.#c=null))}update_pending_count(e){this.#_(e),this.#u+=e,this.#h&&wa(this.#h,this.#u)}get_effect_pending(){return this.#v(),Ae(this.#h)}error(e){var t=this.#n.onerror;let i=this.#n.failed;if(this.#p||!t&&!i)throw e;this.#r&&(yn(this.#r),this.#r=null),this.#s&&(yn(this.#s),this.#s=null),this.#o&&(yn(this.#o),this.#o=null);var r=!1,a=!1;const o=()=>{if(r){Wh();return}r=!0,a&&Nh(),ri.ensure(),this.#u=0,this.#o!==null&&$r(this.#o,()=>{this.#o=null}),this.#e=this.has_pending_snippet(),this.#r=this.#m(()=>(this.#p=!1,On(()=>this.#l(this.#t)))),this.#d>0?this.#g():this.#e=!1};var l=xt;try{Sn(null),a=!0,t?.(e,o),a=!1}catch(f){ea(f,this.#a&&this.#a.parent)}finally{Sn(l)}i&&Bs(()=>{this.#o=this.#m(()=>{ri.ensure(),this.#p=!0;try{return On(()=>{i(this.#t,()=>e,()=>o)})}catch(f){return ea(f,this.#a.parent),null}finally{this.#p=!1}})})}}function tp(n,e,t,i){const r=Oa()?Xl:ql;if(t.length===0&&n.length===0){i(e.map(r));return}var a=Rt,o=St,l=np();function f(){Promise.all(t.map(u=>ip(u))).then(u=>{l();try{i([...e.map(r),...u])}catch(h){(o.f&Ti)===0&&ea(h,o)}a?.deactivate(),Cs()}).catch(u=>{ea(u,o)})}n.length>0?Promise.all(n).then(()=>{l();try{return f()}finally{a?.deactivate(),Cs()}}):f()}function np(){var n=St,e=xt,t=Ot,i=Rt;return function(a=!0){li(n),Sn(e),Qr(t),a&&i?.activate()}}function Cs(){li(null),Sn(null),Qr(null)}function Xl(n){var e=nn|En,t=xt!==null&&(xt.f&nn)!==0?xt:null;return St!==null&&(St.f|=aa),{ctx:Ot,deps:null,effects:null,equals:Vf,f:e,fn:n,reactions:null,rv:0,v:on,wv:0,parent:t??St,ac:null}}function ip(n,e){let t=St;t===null&&Ah();var i=t.b,r=void 0,a=vr(on),o=!xt,l=new Map;return hp(()=>{var f=Of();r=f.promise;try{Promise.resolve(n()).then(f.resolve,f.reject).then(()=>{u===Rt&&u.committed&&u.deactivate(),Cs()})}catch(m){f.reject(m),Cs()}var u=Rt;if(o){var h=!i.is_pending();i.update_pending_count(1),u.increment(h),l.get(u)?.reject(Xr),l.delete(u),l.set(u,f)}const p=(m,g=void 0)=>{if(u.activate(),g)g!==Xr&&(a.f|=$i,wa(a,g));else{(a.f&$i)!==0&&(a.f^=$i),wa(a,m);for(const[y,R]of l){if(l.delete(y),y===u)break;R.reject(Xr)}}o&&(i.update_pending_count(-1),u.decrement(h))};f.promise.then(p,m=>p(null,m||"unknown"))}),ru(()=>{for(const f of l.values())f.reject(Xr)}),new Promise(f=>{function u(h){function p(){h===r?f(a):u(r)}h.then(p,p)}u(r)})}function ql(n){const e=Xl(n);return e.equals=Hf,e}function $f(n){var e=n.effects;if(e!==null){n.effects=null;for(var t=0;t<e.length;t+=1)yn(e[t])}}function rp(n){for(var e=n.parent;e!==null;){if((e.f&nn)===0)return(e.f&Ti)===0?e:null;e=e.parent}return null}function Yl(n){var e,t=St;li(rp(n));try{n.f&=~xr,$f(n),e=gu(n)}finally{li(t)}return e}function Kf(n){var e=Yl(n);if(n.equals(e)||(n.v=e,n.wv=pu()),!br)if(Cn!==null)Vs()&&Cn.set(n,n.v);else{var t=(n.f&Kn)===0?Ii:ln;cn(n,t)}}let Wo=new Set;const Ki=new Map;let Zf=!1;function vr(n,e){var t={f:0,v:n,reactions:null,equals:Vf,rv:0,wv:0};return t}function zi(n,e){const t=vr(n);return gp(t),t}function ti(n,e=!1,t=!0){const i=vr(n);return e||(i.equals=Hf),sa&&t&&Ot!==null&&Ot.l!==null&&(Ot.l.s??=[]).push(i),i}function gt(n,e,t=!1){xt!==null&&(!ai||(xt.f&Tc)!==0)&&Oa()&&(xt.f&(nn|Di|Vl|Tc))!==0&&!wi?.includes(n)&&Uh();let i=t?qr(e):e;return wa(n,i)}function wa(n,e){if(!n.equals(e)){var t=n.v;br?Ki.set(n,e):Ki.set(n,t),n.v=e;var i=ri.ensure();i.capture(n,t),(n.f&nn)!==0&&((n.f&En)!==0&&Yl(n),cn(n,(n.f&Kn)!==0?ln:Ii)),n.wv=pu(),Jf(n,En),Oa()&&St!==null&&(St.f&ln)!==0&&(St.f&(Li|yr))===0&&(Un===null?xp([n]):Un.push(n)),!i.is_fork&&Wo.size>0&&!Zf&&ap()}return e}function ap(){Zf=!1;var n=Zi;Ds(!0);const e=Array.from(Wo);try{for(const t of e)(t.f&ln)!==0&&cn(t,Ii),Ba(t)&&Ra(t)}finally{Ds(n)}Wo.clear()}function Ta(n){gt(n,n.v+1)}function Jf(n,e){var t=n.reactions;if(t!==null)for(var i=Oa(),r=t.length,a=0;a<r;a++){var o=t[a],l=o.f;if(!(!i&&o===St)){var f=(l&En)===0;if(f&&cn(o,e),(l&nn)!==0){var u=o;Cn?.delete(u),(l&xr)===0&&(l&Kn&&(o.f|=xr),Jf(u,Ii))}else f&&((l&Di)!==0&&bi!==null&&bi.add(o),_r(o))}}}function qr(n){if(typeof n!="object"||n===null||jr in n)return n;const e=zl(n);if(e!==Eh&&e!==Mh)return n;var t=new Map,i=Bl(n),r=zi(0),a=mr,o=l=>{if(mr===a)return l();var f=xt,u=mr;Sn(null),Pc(a);var h=l();return Sn(f),Pc(u),h};return i&&t.set("length",zi(n.length)),new Proxy(n,{defineProperty(l,f,u){(!("value"in u)||u.configurable===!1||u.enumerable===!1||u.writable===!1)&&Ih();var h=t.get(f);return h===void 0?h=o(()=>{var p=zi(u.value);return t.set(f,p),p}):gt(h,u.value,!0),!0},deleteProperty(l,f){var u=t.get(f);if(u===void 0){if(f in l){const h=o(()=>zi(on));t.set(f,h),Ta(r)}}else gt(u,on),Ta(r);return!0},get(l,f,u){if(f===jr)return n;var h=t.get(f),p=f in l;if(h===void 0&&(!p||Yr(l,f)?.writable)&&(h=o(()=>{var g=qr(p?l[f]:on),y=zi(g);return y}),t.set(f,h)),h!==void 0){var m=Ae(h);return m===on?void 0:m}return Reflect.get(l,f,u)},getOwnPropertyDescriptor(l,f){var u=Reflect.getOwnPropertyDescriptor(l,f);if(u&&"value"in u){var h=t.get(f);h&&(u.value=Ae(h))}else if(u===void 0){var p=t.get(f),m=p?.v;if(p!==void 0&&m!==on)return{enumerable:!0,configurable:!0,value:m,writable:!0}}return u},has(l,f){if(f===jr)return!0;var u=t.get(f),h=u!==void 0&&u.v!==on||Reflect.has(l,f);if(u!==void 0||St!==null&&(!h||Yr(l,f)?.writable)){u===void 0&&(u=o(()=>{var m=h?qr(l[f]):on,g=zi(m);return g}),t.set(f,u));var p=Ae(u);if(p===on)return!1}return h},set(l,f,u,h){var p=t.get(f),m=f in l;if(i&&f==="length")for(var g=u;g<p.v;g+=1){var y=t.get(g+"");y!==void 0?gt(y,on):g in l&&(y=o(()=>zi(on)),t.set(g+"",y))}if(p===void 0)(!m||Yr(l,f)?.writable)&&(p=o(()=>zi(void 0)),gt(p,qr(u)),t.set(f,p));else{m=p.v!==on;var R=o(()=>qr(u));gt(p,R)}var S=Reflect.getOwnPropertyDescriptor(l,f);if(S?.set&&S.set.call(h,u),!m){if(i&&typeof f=="string"){var x=t.get("length"),U=Number(f);Number.isInteger(U)&&U>=x.v&&gt(x,U+1)}Ta(r)}return!0},ownKeys(l){Ae(r);var f=Reflect.ownKeys(l).filter(p=>{var m=t.get(p);return m===void 0||m.v!==on});for(var[u,h]of t)h.v!==on&&!(u in l)&&f.push(u);return f},setPrototypeOf(){Fh()}})}var Ac,Qf,eu,tu;function sp(){if(Ac===void 0){Ac=window,Qf=/Firefox/.test(navigator.userAgent);var n=Element.prototype,e=Node.prototype,t=Text.prototype;eu=Yr(e,"firstChild").get,tu=Yr(e,"nextSibling").get,Mc(n)&&(n.__click=void 0,n.__className=void 0,n.__attributes=null,n.__style=void 0,n.__e=void 0),Mc(t)&&(t.__t=void 0)}}function Sr(n=""){return document.createTextNode(n)}function Ps(n){return eu.call(n)}function zs(n){return tu.call(n)}function Et(n,e){return Ps(n)}function Nt(n,e=1,t=!1){let i=n;for(;e--;)i=zs(i);return i}function op(n){n.textContent=""}function nu(){return!1}let Rc=!1;function lp(){Rc||(Rc=!0,document.addEventListener("reset",n=>{Promise.resolve().then(()=>{if(!n.defaultPrevented)for(const e of n.target.elements)e.__on_r?.()})},{capture:!0}))}function Gs(n){var e=xt,t=St;Sn(null),li(null);try{return n()}finally{Sn(e),li(t)}}function cp(n,e,t,i=t){n.addEventListener(e,()=>Gs(t));const r=n.__on_r;r?n.__on_r=()=>{r(),i(!0)}:n.__on_r=()=>i(!0),lp()}function iu(n){St===null&&(xt===null&&Ph(),Ch()),br&&Rh()}function fp(n,e){var t=e.last;t===null?e.last=e.first=n:(t.next=n,n.prev=t,e.last=n)}function Fi(n,e,t){var i=St;i!==null&&(i.f&Dn)!==0&&(n|=Dn);var r={ctx:Ot,deps:null,nodes_start:null,nodes_end:null,f:n|En|Kn,first:null,fn:e,last:null,next:null,parent:i,b:i&&i.b,prev:null,teardown:null,transitions:null,wv:0,ac:null};if(t)try{Ra(r),r.f|=Gl}catch(l){throw yn(r),l}else e!==null&&_r(r);var a=r;if(t&&a.deps===null&&a.teardown===null&&a.nodes_start===null&&a.first===a.last&&(a.f&aa)===0&&(a=a.first,(n&Di)!==0&&(n&Jr)!==0&&a!==null&&(a.f|=Jr)),a!==null&&(a.parent=i,i!==null&&fp(a,i),xt!==null&&(xt.f&nn)!==0&&(n&yr)===0)){var o=xt;(o.effects??=[]).push(a)}return r}function Vs(){return xt!==null&&!ai}function ru(n){const e=Fi(Ns,null,!1);return cn(e,ln),e.teardown=n,e}function Xo(n){iu();var e=St.f,t=!xt&&(e&Li)!==0&&(e&Gl)===0;if(t){var i=Ot;(i.e??=[]).push(n)}else return au(n)}function au(n){return Fi(Bf|zf,n,!1)}function up(n){return iu(),Fi(Ns|zf,n,!0)}function dp(n){ri.ensure();const e=Fi(yr|aa,n,!0);return(t={})=>new Promise(i=>{t.outro?$r(e,()=>{yn(e),i(void 0)}):(yn(e),i(void 0))})}function hp(n){return Fi(Vl|aa,n,!0)}function su(n,e=0){return Fi(Ns|e,n,!0)}function Sa(n,e=[],t=[],i=[]){tp(i,e,t,r=>{Fi(Ns,()=>n(...r.map(Ae)),!0)})}function jl(n,e=0){var t=Fi(Di|e,n,!0);return t}function On(n){return Fi(Li|aa,n,!0)}function ou(n){var e=n.teardown;if(e!==null){const t=br,i=xt;Cc(!0),Sn(null);try{e.call(null)}finally{Cc(t),Sn(i)}}}function lu(n,e=!1){var t=n.first;for(n.first=n.last=null;t!==null;){const r=t.ac;r!==null&&Gs(()=>{r.abort(Xr)});var i=t.next;(t.f&yr)!==0?t.parent=null:yn(t,e),t=i}}function pp(n){for(var e=n.first;e!==null;){var t=e.next;(e.f&Li)===0&&yn(e),e=t}}function yn(n,e=!0){var t=!1;(e||(n.f&kf)!==0)&&n.nodes_start!==null&&n.nodes_end!==null&&(mp(n.nodes_start,n.nodes_end),t=!0),lu(n,e&&!t),Ls(n,0),cn(n,Ti);var i=n.transitions;if(i!==null)for(const a of i)a.stop();ou(n);var r=n.parent;r!==null&&r.first!==null&&cu(n),n.next=n.prev=n.teardown=n.ctx=n.deps=n.fn=n.nodes_start=n.nodes_end=n.ac=null}function mp(n,e){for(;n!==null;){var t=n===e?null:zs(n);n.remove(),n=t}}function cu(n){var e=n.parent,t=n.prev,i=n.next;t!==null&&(t.next=i),i!==null&&(i.prev=t),e!==null&&(e.first===n&&(e.first=i),e.last===n&&(e.last=t))}function $r(n,e,t=!0){var i=[];$l(n,i,!0),fu(i,()=>{t&&yn(n),e&&e()})}function fu(n,e){var t=n.length;if(t>0){var i=()=>--t||e();for(var r of n)r.out(i)}else e()}function $l(n,e,t){if((n.f&Dn)===0){if(n.f^=Dn,n.transitions!==null)for(const o of n.transitions)(o.is_global||t)&&e.push(o);for(var i=n.first;i!==null;){var r=i.next,a=(i.f&Jr)!==0||(i.f&Li)!==0&&(n.f&Di)!==0;$l(i,e,a?t:!1),i=r}}}function Kl(n){uu(n,!0)}function uu(n,e){if((n.f&Dn)!==0){n.f^=Dn,(n.f&ln)===0&&(cn(n,En),_r(n));for(var t=n.first;t!==null;){var i=t.next,r=(t.f&Jr)!==0||(t.f&Li)!==0;uu(t,r?e:!1),t=i}if(n.transitions!==null)for(const a of n.transitions)(a.is_global||e)&&a.in()}}function du(n,e){for(var t=n.nodes_start,i=n.nodes_end;t!==null;){var r=t===i?null:zs(t);e.append(t),t=r}}let Zi=!1;function Ds(n){Zi=n}let br=!1;function Cc(n){br=n}let xt=null,ai=!1;function Sn(n){xt=n}let St=null;function li(n){St=n}let wi=null;function gp(n){xt!==null&&(wi===null?wi=[n]:wi.push(n))}let gn=null,An=0,Un=null;function xp(n){Un=n}let hu=1,Aa=0,mr=Aa;function Pc(n){mr=n}function pu(){return++hu}function Ba(n){var e=n.f;if((e&En)!==0)return!0;if(e&nn&&(n.f&=~xr),(e&Ii)!==0){var t=n.deps;if(t!==null)for(var i=t.length,r=0;r<i;r++){var a=t[r];if(Ba(a)&&Kf(a),a.wv>n.wv)return!0}(e&Kn)!==0&&Cn===null&&cn(n,ln)}return!1}function mu(n,e,t=!0){var i=n.reactions;if(i!==null&&!wi?.includes(n))for(var r=0;r<i.length;r++){var a=i[r];(a.f&nn)!==0?mu(a,e,!1):e===a&&(t?cn(a,En):(a.f&ln)!==0&&cn(a,Ii),_r(a))}}function gu(n){var e=gn,t=An,i=Un,r=xt,a=wi,o=Ot,l=ai,f=mr,u=n.f;gn=null,An=0,Un=null,xt=(u&(Li|yr))===0?n:null,wi=null,Qr(n.ctx),ai=!1,mr=++Aa,n.ac!==null&&(Gs(()=>{n.ac.abort(Xr)}),n.ac=null);try{n.f|=Vo;var h=n.fn,p=h(),m=n.deps;if(gn!==null){var g;if(Ls(n,An),m!==null&&An>0)for(m.length=An+gn.length,g=0;g<gn.length;g++)m[An+g]=gn[g];else n.deps=m=gn;if(Zi&&Vs()&&(n.f&Kn)!==0)for(g=An;g<m.length;g++)(m[g].reactions??=[]).push(n)}else m!==null&&An<m.length&&(Ls(n,An),m.length=An);if(Oa()&&Un!==null&&!ai&&m!==null&&(n.f&(nn|Ii|En))===0)for(g=0;g<Un.length;g++)mu(Un[g],n);return r!==null&&r!==n&&(Aa++,Un!==null&&(i===null?i=Un:i.push(...Un))),(n.f&$i)!==0&&(n.f^=$i),p}catch(y){return Xf(y)}finally{n.f^=Vo,gn=e,An=t,Un=i,xt=r,wi=a,Qr(o),ai=l,mr=f}}function _p(n,e){let t=e.reactions;if(t!==null){var i=yh.call(t,n);if(i!==-1){var r=t.length-1;r===0?t=e.reactions=null:(t[i]=t[r],t.pop())}}t===null&&(e.f&nn)!==0&&(gn===null||!gn.includes(e))&&(cn(e,Ii),(e.f&Kn)!==0&&(e.f^=Kn,e.f&=~xr),$f(e),Ls(e,0))}function Ls(n,e){var t=n.deps;if(t!==null)for(var i=e;i<t.length;i++)_p(n,t[i])}function Ra(n){var e=n.f;if((e&Ti)===0){cn(n,ln);var t=St,i=Zi;St=n,Zi=!0;try{(e&Di)!==0?pp(n):lu(n),ou(n);var r=gu(n);n.teardown=typeof r=="function"?r:null,n.wv=hu;var a;zo&&qh&&(n.f&En)!==0&&n.deps}finally{Zi=i,St=t}}}async function vp(){await Promise.resolve(),$h()}function Ae(n){var e=n.f,t=(e&nn)!==0;if(xt!==null&&!ai){var i=St!==null&&(St.f&Ti)!==0;if(!i&&!wi?.includes(n)){var r=xt.deps;if((xt.f&Vo)!==0)n.rv<Aa&&(n.rv=Aa,gn===null&&r!==null&&r[An]===n?An++:gn===null?gn=[n]:gn.includes(n)||gn.push(n));else{(xt.deps??=[]).push(n);var a=n.reactions;a===null?n.reactions=[xt]:a.includes(xt)||a.push(xt)}}}if(br){if(Ki.has(n))return Ki.get(n);if(t){var o=n,l=o.v;return((o.f&ln)===0&&o.reactions!==null||_u(o))&&(l=Yl(o)),Ki.set(o,l),l}}else if(t){if(o=n,Cn?.has(o))return Cn.get(o);Ba(o)&&Kf(o),Zi&&Vs()&&(o.f&Kn)===0&&xu(o)}else if(Cn?.has(n))return Cn.get(n);if((n.f&$i)!==0)throw n.v;return n.v}function xu(n){if(n.deps!==null){n.f^=Kn;for(const e of n.deps)(e.reactions??=[]).push(n),(e.f&nn)!==0&&(e.f&Kn)===0&&xu(e)}}function _u(n){if(n.v===on)return!0;if(n.deps===null)return!1;for(const e of n.deps)if(Ki.has(e)||(e.f&nn)!==0&&_u(e))return!0;return!1}function mn(n){var e=ai;try{return ai=!0,n()}finally{ai=e}}const Sp=-7169;function cn(n,e){n.f=n.f&Sp|e}function yp(n){if(!(typeof n!="object"||!n||n instanceof EventTarget)){if(jr in n)qo(n);else if(!Array.isArray(n))for(let e in n){const t=n[e];typeof t=="object"&&t&&jr in t&&qo(t)}}}function qo(n,e=new Set){if(typeof n=="object"&&n!==null&&!(n instanceof EventTarget)&&!e.has(n)){e.add(n),n instanceof Date&&n.getTime();for(let i in n)try{qo(n[i],e)}catch{}const t=zl(n);if(t!==Object.prototype&&t!==Array.prototype&&t!==Map.prototype&&t!==Set.prototype&&t!==Date.prototype){const i=Nf(t);for(let r in i){const a=i[r].get;if(a)try{a.call(n)}catch{}}}}}const bp=["touchstart","touchmove"];function Ep(n){return bp.includes(n)}const Mp=new Set,Dc=new Set;function Tp(n,e,t,i={}){function r(a){if(i.capture||ya.call(e,a),!a.cancelBubble)return Gs(()=>t?.call(this,a))}return n.startsWith("pointer")||n.startsWith("touch")||n==="wheel"?Bs(()=>{e.addEventListener(n,r,i)}):e.addEventListener(n,r,i),r}function vn(n,e,t,i,r){var a={capture:i,passive:r},o=Tp(n,e,t,a);(e===document.body||e===window||e===document||e instanceof HTMLMediaElement)&&ru(()=>{e.removeEventListener(n,o,a)})}let Lc=null;function ya(n){var e=this,t=e.ownerDocument,i=n.type,r=n.composedPath?.()||[],a=r[0]||n.target;Lc=n;var o=0,l=Lc===n&&n.__root;if(l){var f=r.indexOf(l);if(f!==-1&&(e===document||e===window)){n.__root=e;return}var u=r.indexOf(e);if(u===-1)return;f<=u&&(o=f)}if(a=r[o]||n.target,a!==e){bh(n,"currentTarget",{configurable:!0,get(){return a||t}});var h=xt,p=St;Sn(null),li(null);try{for(var m,g=[];a!==null;){var y=a.assignedSlot||a.parentNode||a.host||null;try{var R=a["__"+i];R!=null&&(!a.disabled||n.target===a)&&R.call(a,n)}catch(S){m?g.push(S):m=S}if(n.cancelBubble||y===e||y===null)break;a=y}if(m){for(let S of g)queueMicrotask(()=>{throw S});throw m}}finally{n.__root=e,delete n.currentTarget,Sn(h),li(p)}}}function vu(n){var e=document.createElement("template");return e.innerHTML=n.replaceAll("<!>","<!---->"),e.content}function Su(n,e){var t=St;t.nodes_start===null&&(t.nodes_start=n,t.nodes_end=e)}function Ui(n,e){var t=(e&Vh)!==0,i,r=!n.startsWith("<!>");return()=>{i===void 0&&(i=vu(r?n:"<!>"+n),i=Ps(i));var a=t||Qf?document.importNode(i,!0):i.cloneNode(!0);return Su(a,a),a}}function wp(n,e,t="svg"){var i=!n.startsWith("<!>"),r=`<${t}>${i?n:"<!>"+n}</${t}>`,a;return()=>{if(!a){var o=vu(r),l=Ps(o);a=Ps(l)}var f=a.cloneNode(!0);return Su(f,f),f}}function Ap(n,e){return wp(n,e,"svg")}function ni(n,e){n!==null&&n.before(e)}function ir(n,e){var t=e==null?"":typeof e=="object"?e+"":e;t!==(n.__t??=n.nodeValue)&&(n.__t=t,n.nodeValue=t+"")}function Rp(n,e){return Cp(n,e)}const Pr=new Map;function Cp(n,{target:e,anchor:t,props:i={},events:r,context:a,intro:o=!0}){sp();var l=new Set,f=p=>{for(var m=0;m<p.length;m++){var g=p[m];if(!l.has(g)){l.add(g);var y=Ep(g);e.addEventListener(g,ya,{passive:y});var R=Pr.get(g);R===void 0?(document.addEventListener(g,ya,{passive:y}),Pr.set(g,1)):Pr.set(g,R+1)}}};f(kl(Mp)),Dc.add(f);var u=void 0,h=dp(()=>{var p=t??e.appendChild(Sr());return Qh(p,{pending:()=>{}},m=>{if(a){Hl({});var g=Ot;g.c=a}r&&(i.$$events=r),u=n(m,i)||{},a&&Wl()}),()=>{for(var m of l){e.removeEventListener(m,ya);var g=Pr.get(m);--g===0?(document.removeEventListener(m,ya),Pr.delete(m)):Pr.set(m,g)}Dc.delete(f),p!==t&&p.parentNode?.removeChild(p)}});return Pp.set(u,h),u}let Pp=new WeakMap;class Dp{anchor;#e=new Map;#t=new Map;#i=new Map;#n=new Set;#l=!0;constructor(e,t=!0){this.anchor=e,this.#l=t}#a=()=>{var e=Rt;if(this.#e.has(e)){var t=this.#e.get(e),i=this.#t.get(t);if(i)Kl(i),this.#n.delete(t);else{var r=this.#i.get(t);r&&(this.#t.set(t,r.effect),this.#i.delete(t),r.fragment.lastChild.remove(),this.anchor.before(r.fragment),i=r.effect)}for(const[a,o]of this.#e){if(this.#e.delete(a),a===e)break;const l=this.#i.get(o);l&&(yn(l.effect),this.#i.delete(o))}for(const[a,o]of this.#t){if(a===t||this.#n.has(a))continue;const l=()=>{if(Array.from(this.#e.values()).includes(a)){var u=document.createDocumentFragment();du(o,u),u.append(Sr()),this.#i.set(a,{effect:o,fragment:u})}else yn(o);this.#n.delete(a),this.#t.delete(a)};this.#l||!i?(this.#n.add(a),$r(o,l,!1)):l()}}};#r=e=>{this.#e.delete(e);const t=Array.from(this.#e.values());for(const[i,r]of this.#i)t.includes(i)||(yn(r.effect),this.#i.delete(i))};ensure(e,t){var i=Rt,r=nu();if(t&&!this.#t.has(e)&&!this.#i.has(e))if(r){var a=document.createDocumentFragment(),o=Sr();a.append(o),this.#i.set(e,{effect:On(()=>t(o)),fragment:a})}else this.#t.set(e,On(()=>t(this.anchor)));if(this.#e.set(i,e),r){for(const[l,f]of this.#t)l===e?i.skipped_effects.delete(f):i.skipped_effects.add(f);for(const[l,f]of this.#i)l===e?i.skipped_effects.delete(f.effect):i.skipped_effects.add(f.effect);i.oncommit(this.#a),i.ondiscard(this.#r)}else this.#a()}}function ba(n,e,t=!1){var i=new Dp(n),r=t?Jr:0;function a(o,l){i.ensure(o,l)}jl(()=>{var o=!1;e((l,f=!0)=>{o=!0,a(f,l)}),o||a(!1,null)},r)}function Lp(n,e){return e}function Ip(n,e,t){for(var i=[],r=e.length,a=0;a<r;a++)$l(e[a].e,i,!0);fu(i,()=>{var o=i.length===0&&t!==null;if(o){var l=t,f=l.parentNode;op(f),f.append(l),n.items.clear(),ei(n,e[0].prev,e[r-1].next)}for(var u=0;u<r;u++){var h=e[u];o||(n.items.delete(h.k),ei(n,h.prev,h.next)),yn(h.e,!o)}n.first===e[0]&&(n.first=e[0].prev)})}function Fp(n,e,t,i,r,a=null){var o=n,l=new Map,f=null;{var u=n;o=u.appendChild(Sr())}var h=null,p=ql(()=>{var x=t();return Bl(x)?x:x==null?[]:kl(x)}),m,g=!0;function y(){Up(S,m,o,e,i),h!==null&&(m.length===0?(h.fragment?(o.before(h.fragment),h.fragment=null):Kl(h.effect),R.first=h.effect):$r(h.effect,()=>{h=null}))}var R=jl(()=>{m=Ae(p);for(var x=m.length,U=new Set,I=Rt,B=null,C=nu(),E=0;E<x;E+=1){var A=m[E],O=i(A,E),M=g?null:l.get(O);M?(wa(M.v,A),M.i=E,C&&I.skipped_effects.delete(M.e)):(M=Np(g?o:null,B,A,O,E,r,e,t),g&&(M.o=!0,B===null?f=M:B.next=M,B=M),l.set(O,M)),U.add(O)}if(x===0&&a&&!h)if(g)h={fragment:null,effect:On(()=>a(o))};else{var v=document.createDocumentFragment(),F=Sr();v.append(F),h={fragment:v,effect:On(()=>a(F))}}if(!g)if(C){for(const[L,V]of l)U.has(L)||I.skipped_effects.add(V.e);I.oncommit(y),I.ondiscard(()=>{})}else y();Ae(p)}),S={effect:R,items:l,first:f};g=!1}function Up(n,e,t,i,r){var a=e.length,o=n.items,l=n.first,f,u=null,h=[],p=[],m,g,y,R;for(R=0;R<a;R+=1){if(m=e[R],g=r(m,R),y=o.get(g),n.first??=y,!y.o){y.o=!0;var S=u?u.next:l;ei(n,u,y),ei(n,y,S),ao(y,S,t),u=y,h=[],p=[],l=u.next;continue}if((y.e.f&Dn)!==0&&Kl(y.e),y!==l){if(f!==void 0&&f.has(y)){if(h.length<p.length){var x=p[0],U;u=x.prev;var I=h[0],B=h[h.length-1];for(U=0;U<h.length;U+=1)ao(h[U],x,t);for(U=0;U<p.length;U+=1)f.delete(p[U]);ei(n,I.prev,B.next),ei(n,u,I),ei(n,B,x),l=x,u=B,R-=1,h=[],p=[]}else f.delete(y),ao(y,l,t),ei(n,y.prev,y.next),ei(n,y,u===null?n.first:u.next),ei(n,u,y),u=y;continue}for(h=[],p=[];l!==null&&l.k!==g;)(l.e.f&Dn)===0&&(f??=new Set).add(l),p.push(l),l=l.next;if(l===null)continue;y=l}h.push(y),u=y,l=y.next}if(l!==null||f!==void 0){for(var C=f===void 0?[]:kl(f);l!==null;)(l.e.f&Dn)===0&&C.push(l),l=l.next;var E=C.length;if(E>0){var A=a===0?t:null;Ip(n,C,A)}}}function Np(n,e,t,i,r,a,o,l){var f=(o&Oh)!==0,u=(o&kh)===0,h=f?u?ti(t,!1,!1):vr(t):t,p=(o&Bh)===0?r:vr(r),m={i:p,v:h,k:i,a:null,e:null,o:!1,prev:e,next:null};try{if(n===null){var g=document.createDocumentFragment();g.append(n=Sr())}return m.e=On(()=>a(n,h,p,l)),e!==null&&(e.next=m),m}finally{}}function ao(n,e,t){for(var i=n.next?n.next.e.nodes_start:t,r=e?e.e.nodes_start:t,a=n.e.nodes_start;a!==null&&a!==i;){var o=zs(a);r.before(a),a=o}}function ei(n,e,t){e===null?(n.first=t,n.effect.first=t&&t.e):(e.e.next&&(e.e.next.prev=null),e.next=t,e.e.next=t&&t.e),t===null?n.effect.last=e&&e.e:(t.e.prev&&(t.e.prev.next=null),t.prev=e,t.e.prev=e&&e.e)}const Ic=[...` 	
\r\f \v\uFEFF`];function Op(n,e,t){var i=n==null?"":""+n;if(t){for(var r in t)if(t[r])i=i?i+" "+r:r;else if(i.length)for(var a=r.length,o=0;(o=i.indexOf(r,o))>=0;){var l=o+a;(o===0||Ic.includes(i[o-1]))&&(l===i.length||Ic.includes(i[l]))?i=(o===0?"":i.substring(0,o))+i.substring(l+1):o=l}}return i===""?null:i}function Yo(n,e,t,i,r,a){var o=n.__className;if(o!==t||o===void 0){var l=Op(t,i,a);l==null?n.removeAttribute("class"):n.className=l,n.__className=t}else if(a&&r!==a)for(var f in a){var u=!!a[f];(r==null||u!==!!r[f])&&n.classList.toggle(f,u)}return a}const Bp=Symbol("is custom element"),kp=Symbol("is html");function zp(n,e,t,i){var r=Gp(n);r[e]!==(r[e]=t)&&(t==null?n.removeAttribute(e):typeof t!="string"&&Vp(n).includes(e)?n[e]=t:n.setAttribute(e,t))}function Gp(n){return n.__attributes??={[Bp]:n.nodeName.includes("-"),[kp]:n.namespaceURI===Hh}}var Fc=new Map;function Vp(n){var e=n.getAttribute("is")||n.nodeName,t=Fc.get(e);if(t)return t;Fc.set(e,t=[]);for(var i,r=n,a=Element.prototype;a!==r;){i=Nf(r);for(var o in i)i[o].set&&t.push(o);r=zl(r)}return t}function Uc(n,e,t=e){var i=new WeakSet;cp(n,"input",async r=>{var a=r?n.defaultValue:n.value;if(a=so(n)?oo(a):a,t(a),Rt!==null&&i.add(Rt),await vp(),a!==(a=e())){var o=n.selectionStart,l=n.selectionEnd,f=n.value.length;if(n.value=a??"",l!==null){var u=n.value.length;o===l&&l===f&&u>f?(n.selectionStart=u,n.selectionEnd=u):(n.selectionStart=o,n.selectionEnd=Math.min(l,u))}}}),mn(e)==null&&n.value&&(t(so(n)?oo(n.value):n.value),Rt!==null&&i.add(Rt)),su(()=>{var r=e();if(n===document.activeElement){var a=Es??Rt;if(i.has(a))return}so(n)&&r===oo(n.value)||n.type==="date"&&!r&&!n.value||r!==n.value&&(n.value=r??"")})}function so(n){var e=n.type;return e==="number"||e==="range"}function oo(n){return n===""?null:+n}function yu(n=!1){const e=Ot,t=e.l.u;if(!t)return;let i=()=>yp(e.s);if(n){let r=0,a={};const o=Xl(()=>{let l=!1;const f=e.s;for(const u in f)f[u]!==a[u]&&(a[u]=f[u],l=!0);return l&&r++,r});i=()=>Ae(o)}t.b.length&&up(()=>{Nc(e,i),Go(t.b)}),Xo(()=>{const r=mn(()=>t.m.map(Th));return()=>{for(const a of r)typeof a=="function"&&a()}}),t.a.length&&Xo(()=>{Nc(e,i),Go(t.a)})}function Nc(n,e){if(n.l.s)for(const t of n.l.s)Ae(t);e()}let Ja=!1;function Hp(n){var e=Ja;try{return Ja=!1,[n(),Ja]}finally{Ja=e}}function Wp(n,e,t,i){var r=!sa||(t&zh)!==0,a=(t&Gh)!==0,o=i,l=!0,f=()=>(l&&(l=!1,o=mn(i)),o),u;{var h=jr in n||wh in n;u=Yr(n,e)?.set??(h&&e in n?U=>n[e]=U:void 0)}var p,m=!1;[p,m]=Hp(()=>n[e]),p===void 0&&i!==void 0&&(p=f(),u&&(r&&Lh(),u(p)));var g;if(r?g=()=>{var U=n[e];return U===void 0?f():(l=!0,U)}:g=()=>{var U=n[e];return U!==void 0&&(o=void 0),U===void 0?o:U},u){var y=n.$$legacy;return(function(U,I){return arguments.length>0?((!r||!I||y||m)&&u(I?g():U),U):g()})}var R=!1,S=ql(()=>(R=!1,g()));Ae(S);var x=St;return(function(U,I){if(arguments.length>0){const B=I?Ae(S):r&&a?qr(U):U;return gt(S,B),R=!0,o!==void 0&&(o=B),U}return br&&R||(x.f&Ti)!==0?S.v:Ae(S)})}function Xp(n){Ot===null&&Gf(),sa&&Ot.l!==null?Yp(Ot).m.push(n):Xo(()=>{const e=mn(n);if(typeof e=="function")return e})}function qp(n,e,{bubbles:t=!1,cancelable:i=!1}={}){return new CustomEvent(n,{detail:e,bubbles:t,cancelable:i})}function bu(){const n=Ot;return n===null&&Gf(),(e,t,i)=>{const r=n.s.$$events?.[e];if(r){const a=Bl(r)?r.slice():[r],o=qp(e,t,i);for(const l of a)l.call(n.x,o);return!o.defaultPrevented}return!0}}function Yp(n){var e=n.l;return e.u??={a:[],b:[],m:[]}}const jp="5";typeof window<"u"&&((window.__svelte??={}).v??=new Set).add(jp);Yh();var $p=Ui('<div role="button" tabindex="0" aria-label="Upload images"><input type="file" id="file-input" multiple accept="image/*" hidden=""/> <label for="file-input" class="drop-label svelte-ch8vdo"><div class="icon svelte-ch8vdo"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 svelte-ch8vdo"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"></path></svg></div> <p class="svelte-ch8vdo">Drag & Drop images here or <span class="highlight svelte-ch8vdo">Browse</span></p> <p class="subtext svelte-ch8vdo">Supports JPEG, PNG, WebP</p></label></div>');function Kp(n,e){Hl(e,!1);const t=bu();let i=ti(!1);function r(p){p.preventDefault(),gt(i,!0)}function a(){gt(i,!1)}function o(p){p.preventDefault(),gt(i,!1),p.dataTransfer.files&&p.dataTransfer.files.length>0&&t("files",p.dataTransfer.files)}function l(p){p.target.files&&p.target.files.length>0&&t("files",p.target.files)}yu();var f=$p();let u;var h=Et(f);Sa(()=>u=Yo(f,1,"drop-zone svelte-ch8vdo",null,u,{active:Ae(i)})),vn("change",h,l),vn("dragover",f,r),vn("dragleave",f,a),vn("drop",f,o),ni(n,f),Wl()}const Zp=async(n,e,t)=>{if(typeof OffscreenCanvas<"u"&&n instanceof OffscreenCanvas)return n.convertToBlob({type:e,quality:t});if(n instanceof HTMLCanvasElement)return new Promise((i,r)=>{n.toBlob(a=>{a?i(a):r(new Error("Failed to convert canvas to blob"))},e,t)});throw new Error("Unsupported canvas element")},Oc=async n=>{if(typeof createImageBitmap>"u")throw new Error("createImageBitmap() not supported.");const{source:e,mimeType:t,quality:i,flipY:r}=n;let a;if((e instanceof Uint8Array||e instanceof Uint8ClampedArray)&&"sourceMimeType"in n)a=new Blob([e],{type:n.sourceMimeType});else if(e instanceof ImageData)a=e;else throw new Error("Invalid source image");const o=await createImageBitmap(a),l=o.width,f=o.height;let u;typeof OffscreenCanvas<"u"?u=new OffscreenCanvas(l,f):(u=document.createElement("canvas"),u.width=l,u.height=f);const h=u.getContext("2d");if(!h)throw new Error("Failed to create canvas Context");r===!0&&(h.translate(0,f),h.scale(1,-1)),h.drawImage(o,0,0,l,f);const p=await Zp(u,t,i||.9);return{data:new Uint8Array(await p.arrayBuffer()),mimeType:t,width:l,height:f}};const Zl="181",Jp=0,Bc=1,Qp=2,Eu=1,e0=2,yi=3,Ji=0,bn=1,Ei=2,$n=0,Kr=1,kc=2,zc=3,Gc=4,t0=5,ur=100,n0=101,i0=102,r0=103,a0=104,s0=200,o0=201,l0=202,c0=203,jo=204,$o=205,f0=206,u0=207,d0=208,h0=209,p0=210,m0=211,g0=212,x0=213,_0=214,Ko=0,Zo=1,Jo=2,ta=3,Qo=4,el=5,tl=6,nl=7,Mu=0,v0=1,S0=2,Ai=0,il=1,Tu=2,wu=3,rl=4,y0=5,b0=6,E0=7,Ca=300,na=301,ia=302,al=303,sl=304,Hs=306,Pa=1e3,Pn=1001,ol=1002,Ln=1003,M0=1004,Qa=1005,Zt=1006,lo=1007,pr=1008,kn=1009,Jl=1010,Ql=1011,Da=1012,Ws=1013,Qi=1014,Bn=1015,Ni=1016,ec=1017,tc=1018,La=1020,Au=35902,Ru=35899,Cu=1021,Pu=1022,xn=1023,Ia=1026,Fa=1027,Du=1028,nc=1029,ic=1030,rc=1031,ac=1033,Ms=33776,Ts=33777,ws=33778,As=33779,ll=35840,cl=35841,fl=35842,ul=35843,dl=36196,hl=37492,pl=37496,ml=37808,gl=37809,xl=37810,_l=37811,vl=37812,Sl=37813,yl=37814,bl=37815,El=37816,Ml=37817,Tl=37818,wl=37819,Al=37820,Rl=37821,Cl=36492,Pl=36494,Dl=36495,Ll=36283,Il=36284,Fl=36285,Ul=36286,T0=3200,w0=3201,A0=0,R0=1,Yi="",Rn="srgb",ci="srgb-linear",Is="linear",Mt="srgb",Dr=7680,Vc=519,C0=512,P0=513,D0=514,Lu=515,L0=516,I0=517,F0=518,U0=519,Hc=35044,Wc="300 es",si=2e3,Fs=2001;function Iu(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Us(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function N0(){const n=Us("canvas");return n.style.display="block",n}const Xc={};function qc(...n){const e="THREE."+n.shift();console.log(e,...n)}function it(...n){const e="THREE."+n.shift();console.warn(e,...n)}function kt(...n){const e="THREE."+n.shift();console.error(e,...n)}function Ua(...n){const e=n.join(" ");e in Xc||(Xc[e]=!0,it(...n))}function O0(n,e,t){return new Promise(function(i,r){function a(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(a,t);break;default:i()}}setTimeout(a,t)})}class oa{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const r=i[e];if(r!==void 0){const a=r.indexOf(t);a!==-1&&r.splice(a,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let a=0,o=r.length;a<o;a++)r[a].call(this,e);e.target=null}}}const an=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],co=Math.PI/180,Nl=180/Math.PI;function ka(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(an[n&255]+an[n>>8&255]+an[n>>16&255]+an[n>>24&255]+"-"+an[e&255]+an[e>>8&255]+"-"+an[e>>16&15|64]+an[e>>24&255]+"-"+an[t&63|128]+an[t>>8&255]+"-"+an[t>>16&255]+an[t>>24&255]+an[i&255]+an[i>>8&255]+an[i>>16&255]+an[i>>24&255]).toLowerCase()}function dt(n,e,t){return Math.max(e,Math.min(t,n))}function B0(n,e){return(n%e+e)%e}function fo(n,e,t){return(1-t)*n+t*e}function ha(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function _n(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class wt{constructor(e=0,t=0){wt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(dt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(dt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),a=this.x-e.x,o=this.y-e.y;return this.x=a*i-o*r+e.x,this.y=a*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class za{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,a,o,l){let f=i[r+0],u=i[r+1],h=i[r+2],p=i[r+3],m=a[o+0],g=a[o+1],y=a[o+2],R=a[o+3];if(l<=0){e[t+0]=f,e[t+1]=u,e[t+2]=h,e[t+3]=p;return}if(l>=1){e[t+0]=m,e[t+1]=g,e[t+2]=y,e[t+3]=R;return}if(p!==R||f!==m||u!==g||h!==y){let S=f*m+u*g+h*y+p*R;S<0&&(m=-m,g=-g,y=-y,R=-R,S=-S);let x=1-l;if(S<.9995){const U=Math.acos(S),I=Math.sin(U);x=Math.sin(x*U)/I,l=Math.sin(l*U)/I,f=f*x+m*l,u=u*x+g*l,h=h*x+y*l,p=p*x+R*l}else{f=f*x+m*l,u=u*x+g*l,h=h*x+y*l,p=p*x+R*l;const U=1/Math.sqrt(f*f+u*u+h*h+p*p);f*=U,u*=U,h*=U,p*=U}}e[t]=f,e[t+1]=u,e[t+2]=h,e[t+3]=p}static multiplyQuaternionsFlat(e,t,i,r,a,o){const l=i[r],f=i[r+1],u=i[r+2],h=i[r+3],p=a[o],m=a[o+1],g=a[o+2],y=a[o+3];return e[t]=l*y+h*p+f*g-u*m,e[t+1]=f*y+h*m+u*p-l*g,e[t+2]=u*y+h*g+l*m-f*p,e[t+3]=h*y-l*p-f*m-u*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,a=e._z,o=e._order,l=Math.cos,f=Math.sin,u=l(i/2),h=l(r/2),p=l(a/2),m=f(i/2),g=f(r/2),y=f(a/2);switch(o){case"XYZ":this._x=m*h*p+u*g*y,this._y=u*g*p-m*h*y,this._z=u*h*y+m*g*p,this._w=u*h*p-m*g*y;break;case"YXZ":this._x=m*h*p+u*g*y,this._y=u*g*p-m*h*y,this._z=u*h*y-m*g*p,this._w=u*h*p+m*g*y;break;case"ZXY":this._x=m*h*p-u*g*y,this._y=u*g*p+m*h*y,this._z=u*h*y+m*g*p,this._w=u*h*p-m*g*y;break;case"ZYX":this._x=m*h*p-u*g*y,this._y=u*g*p+m*h*y,this._z=u*h*y-m*g*p,this._w=u*h*p+m*g*y;break;case"YZX":this._x=m*h*p+u*g*y,this._y=u*g*p+m*h*y,this._z=u*h*y-m*g*p,this._w=u*h*p-m*g*y;break;case"XZY":this._x=m*h*p-u*g*y,this._y=u*g*p-m*h*y,this._z=u*h*y+m*g*p,this._w=u*h*p+m*g*y;break;default:it("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],a=t[8],o=t[1],l=t[5],f=t[9],u=t[2],h=t[6],p=t[10],m=i+l+p;if(m>0){const g=.5/Math.sqrt(m+1);this._w=.25/g,this._x=(h-f)*g,this._y=(a-u)*g,this._z=(o-r)*g}else if(i>l&&i>p){const g=2*Math.sqrt(1+i-l-p);this._w=(h-f)/g,this._x=.25*g,this._y=(r+o)/g,this._z=(a+u)/g}else if(l>p){const g=2*Math.sqrt(1+l-i-p);this._w=(a-u)/g,this._x=(r+o)/g,this._y=.25*g,this._z=(f+h)/g}else{const g=2*Math.sqrt(1+p-i-l);this._w=(o-r)/g,this._x=(a+u)/g,this._y=(f+h)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(dt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,a=e._z,o=e._w,l=t._x,f=t._y,u=t._z,h=t._w;return this._x=i*h+o*l+r*u-a*f,this._y=r*h+o*f+a*l-i*u,this._z=a*h+o*u+i*f-r*l,this._w=o*h-i*l-r*f-a*u,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let i=e._x,r=e._y,a=e._z,o=e._w,l=this.dot(e);l<0&&(i=-i,r=-r,a=-a,o=-o,l=-l);let f=1-t;if(l<.9995){const u=Math.acos(l),h=Math.sin(u);f=Math.sin(f*u)/h,t=Math.sin(t*u)/h,this._x=this._x*f+i*t,this._y=this._y*f+r*t,this._z=this._z*f+a*t,this._w=this._w*f+o*t,this._onChangeCallback()}else this._x=this._x*f+i*t,this._y=this._y*f+r*t,this._z=this._z*f+a*t,this._w=this._w*f+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class te{constructor(e=0,t=0,i=0){te.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Yc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Yc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,a=e.elements;return this.x=a[0]*t+a[3]*i+a[6]*r,this.y=a[1]*t+a[4]*i+a[7]*r,this.z=a[2]*t+a[5]*i+a[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,a=e.elements,o=1/(a[3]*t+a[7]*i+a[11]*r+a[15]);return this.x=(a[0]*t+a[4]*i+a[8]*r+a[12])*o,this.y=(a[1]*t+a[5]*i+a[9]*r+a[13])*o,this.z=(a[2]*t+a[6]*i+a[10]*r+a[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,a=e.x,o=e.y,l=e.z,f=e.w,u=2*(o*r-l*i),h=2*(l*t-a*r),p=2*(a*i-o*t);return this.x=t+f*u+o*p-l*h,this.y=i+f*h+l*u-a*p,this.z=r+f*p+a*h-o*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*r,this.y=a[1]*t+a[5]*i+a[9]*r,this.z=a[2]*t+a[6]*i+a[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this.z=dt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this.z=dt(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(dt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,a=e.z,o=t.x,l=t.y,f=t.z;return this.x=r*f-a*l,this.y=a*o-i*f,this.z=i*l-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return uo.copy(this).projectOnVector(e),this.sub(uo)}reflect(e){return this.sub(uo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(dt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const uo=new te,Yc=new za;class ot{constructor(e,t,i,r,a,o,l,f,u){ot.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,a,o,l,f,u)}set(e,t,i,r,a,o,l,f,u){const h=this.elements;return h[0]=e,h[1]=r,h[2]=l,h[3]=t,h[4]=a,h[5]=f,h[6]=i,h[7]=o,h[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,a=this.elements,o=i[0],l=i[3],f=i[6],u=i[1],h=i[4],p=i[7],m=i[2],g=i[5],y=i[8],R=r[0],S=r[3],x=r[6],U=r[1],I=r[4],B=r[7],C=r[2],E=r[5],A=r[8];return a[0]=o*R+l*U+f*C,a[3]=o*S+l*I+f*E,a[6]=o*x+l*B+f*A,a[1]=u*R+h*U+p*C,a[4]=u*S+h*I+p*E,a[7]=u*x+h*B+p*A,a[2]=m*R+g*U+y*C,a[5]=m*S+g*I+y*E,a[8]=m*x+g*B+y*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],a=e[3],o=e[4],l=e[5],f=e[6],u=e[7],h=e[8];return t*o*h-t*l*u-i*a*h+i*l*f+r*a*u-r*o*f}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],a=e[3],o=e[4],l=e[5],f=e[6],u=e[7],h=e[8],p=h*o-l*u,m=l*f-h*a,g=u*a-o*f,y=t*p+i*m+r*g;if(y===0)return this.set(0,0,0,0,0,0,0,0,0);const R=1/y;return e[0]=p*R,e[1]=(r*u-h*i)*R,e[2]=(l*i-r*o)*R,e[3]=m*R,e[4]=(h*t-r*f)*R,e[5]=(r*a-l*t)*R,e[6]=g*R,e[7]=(i*f-u*t)*R,e[8]=(o*t-i*a)*R,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,a,o,l){const f=Math.cos(a),u=Math.sin(a);return this.set(i*f,i*u,-i*(f*o+u*l)+o+e,-r*u,r*f,-r*(-u*o+f*l)+l+t,0,0,1),this}scale(e,t){return this.premultiply(ho.makeScale(e,t)),this}rotate(e){return this.premultiply(ho.makeRotation(-e)),this}translate(e,t){return this.premultiply(ho.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ho=new ot,jc=new ot().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),$c=new ot().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function k0(){const n={enabled:!0,workingColorSpace:ci,spaces:{},convert:function(r,a,o){return this.enabled===!1||a===o||!a||!o||(this.spaces[a].transfer===Mt&&(r.r=Ri(r.r),r.g=Ri(r.g),r.b=Ri(r.b)),this.spaces[a].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[a].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Mt&&(r.r=Zr(r.r),r.g=Zr(r.g),r.b=Zr(r.b))),r},workingToColorSpace:function(r,a){return this.convert(r,this.workingColorSpace,a)},colorSpaceToWorking:function(r,a){return this.convert(r,a,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Yi?Is:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,a=this.workingColorSpace){return r.fromArray(this.spaces[a].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,a,o){return r.copy(this.spaces[a].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,a){return Ua("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,a)},toWorkingColorSpace:function(r,a){return Ua("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,a)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[ci]:{primaries:e,whitePoint:i,transfer:Is,toXYZ:jc,fromXYZ:$c,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Rn},outputColorSpaceConfig:{drawingBufferColorSpace:Rn}},[Rn]:{primaries:e,whitePoint:i,transfer:Mt,toXYZ:jc,fromXYZ:$c,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Rn}}}),n}const _t=k0();function Ri(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Zr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Lr;class z0{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Lr===void 0&&(Lr=Us("canvas")),Lr.width=e.width,Lr.height=e.height;const r=Lr.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=Lr}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Us("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),a=r.data;for(let o=0;o<a.length;o++)a[o]=Ri(a[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Ri(t[i]/255)*255):t[i]=Ri(t[i]);return{data:t,width:e.width,height:e.height}}else return it("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let G0=0;class sc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:G0++}),this.uuid=ka(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let a;if(Array.isArray(r)){a=[];for(let o=0,l=r.length;o<l;o++)r[o].isDataTexture?a.push(po(r[o].image)):a.push(po(r[o]))}else a=po(r);i.url=a}return t||(e.images[this.uuid]=i),i}}function po(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?z0.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(it("Texture: Unable to serialize Texture."),{})}let V0=0;const mo=new te;class tn extends oa{constructor(e=tn.DEFAULT_IMAGE,t=tn.DEFAULT_MAPPING,i=Pn,r=Pn,a=Zt,o=pr,l=xn,f=kn,u=tn.DEFAULT_ANISOTROPY,h=Yi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:V0++}),this.uuid=ka(),this.name="",this.source=new sc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=a,this.minFilter=o,this.anisotropy=u,this.format=l,this.internalFormat=null,this.type=f,this.offset=new wt(0,0),this.repeat=new wt(1,1),this.center=new wt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(mo).x}get height(){return this.source.getSize(mo).y}get depth(){return this.source.getSize(mo).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){it(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){it(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ca)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Pa:e.x=e.x-Math.floor(e.x);break;case Pn:e.x=e.x<0?0:1;break;case ol:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Pa:e.y=e.y-Math.floor(e.y);break;case Pn:e.y=e.y<0?0:1;break;case ol:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}tn.DEFAULT_IMAGE=null;tn.DEFAULT_MAPPING=Ca;tn.DEFAULT_ANISOTROPY=1;class zt{constructor(e=0,t=0,i=0,r=1){zt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,a=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*a,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*a,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*a,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*a,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,a;const f=e.elements,u=f[0],h=f[4],p=f[8],m=f[1],g=f[5],y=f[9],R=f[2],S=f[6],x=f[10];if(Math.abs(h-m)<.01&&Math.abs(p-R)<.01&&Math.abs(y-S)<.01){if(Math.abs(h+m)<.1&&Math.abs(p+R)<.1&&Math.abs(y+S)<.1&&Math.abs(u+g+x-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const I=(u+1)/2,B=(g+1)/2,C=(x+1)/2,E=(h+m)/4,A=(p+R)/4,O=(y+S)/4;return I>B&&I>C?I<.01?(i=0,r=.707106781,a=.707106781):(i=Math.sqrt(I),r=E/i,a=A/i):B>C?B<.01?(i=.707106781,r=0,a=.707106781):(r=Math.sqrt(B),i=E/r,a=O/r):C<.01?(i=.707106781,r=.707106781,a=0):(a=Math.sqrt(C),i=A/a,r=O/a),this.set(i,r,a,t),this}let U=Math.sqrt((S-y)*(S-y)+(p-R)*(p-R)+(m-h)*(m-h));return Math.abs(U)<.001&&(U=1),this.x=(S-y)/U,this.y=(p-R)/U,this.z=(m-h)/U,this.w=Math.acos((u+g+x-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this.z=dt(this.z,e.z,t.z),this.w=dt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this.z=dt(this.z,e,t),this.w=dt(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(dt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class H0 extends oa{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Zt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new zt(0,0,e,t),this.scissorTest=!1,this.viewport=new zt(0,0,e,t);const r={width:e,height:t,depth:i.depth},a=new tn(r);this.textures=[];const o=i.count;for(let l=0;l<o;l++)this.textures[l]=a.clone(),this.textures[l].isRenderTargetTexture=!0,this.textures[l].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:Zt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,a=this.textures.length;r<a;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new sc(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ci extends H0{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Fu extends tn{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Ln,this.minFilter=Ln,this.wrapR=Pn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class W0 extends tn{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Ln,this.minFilter=Ln,this.wrapR=Pn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ga{constructor(e=new te(1/0,1/0,1/0),t=new te(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Wn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Wn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Wn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const a=i.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0)for(let o=0,l=a.count;o<l;o++)e.isMesh===!0?e.getVertexPosition(o,Wn):Wn.fromBufferAttribute(a,o),Wn.applyMatrix4(e.matrixWorld),this.expandByPoint(Wn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),es.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),es.copy(i.boundingBox)),es.applyMatrix4(e.matrixWorld),this.union(es)}const r=e.children;for(let a=0,o=r.length;a<o;a++)this.expandByObject(r[a],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Wn),Wn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(pa),ts.subVectors(this.max,pa),Ir.subVectors(e.a,pa),Fr.subVectors(e.b,pa),Ur.subVectors(e.c,pa),Gi.subVectors(Fr,Ir),Vi.subVectors(Ur,Fr),rr.subVectors(Ir,Ur);let t=[0,-Gi.z,Gi.y,0,-Vi.z,Vi.y,0,-rr.z,rr.y,Gi.z,0,-Gi.x,Vi.z,0,-Vi.x,rr.z,0,-rr.x,-Gi.y,Gi.x,0,-Vi.y,Vi.x,0,-rr.y,rr.x,0];return!go(t,Ir,Fr,Ur,ts)||(t=[1,0,0,0,1,0,0,0,1],!go(t,Ir,Fr,Ur,ts))?!1:(ns.crossVectors(Gi,Vi),t=[ns.x,ns.y,ns.z],go(t,Ir,Fr,Ur,ts))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Wn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Wn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(mi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),mi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),mi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),mi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),mi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),mi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),mi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),mi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(mi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const mi=[new te,new te,new te,new te,new te,new te,new te,new te],Wn=new te,es=new Ga,Ir=new te,Fr=new te,Ur=new te,Gi=new te,Vi=new te,rr=new te,pa=new te,ts=new te,ns=new te,ar=new te;function go(n,e,t,i,r){for(let a=0,o=n.length-3;a<=o;a+=3){ar.fromArray(n,a);const l=r.x*Math.abs(ar.x)+r.y*Math.abs(ar.y)+r.z*Math.abs(ar.z),f=e.dot(ar),u=t.dot(ar),h=i.dot(ar);if(Math.max(-Math.max(f,u,h),Math.min(f,u,h))>l)return!1}return!0}const X0=new Ga,ma=new te,xo=new te;class oc{constructor(e=new te,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):X0.setFromPoints(e).getCenter(i);let r=0;for(let a=0,o=e.length;a<o;a++)r=Math.max(r,i.distanceToSquared(e[a]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ma.subVectors(e,this.center);const t=ma.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(ma,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(xo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ma.copy(e.center).add(xo)),this.expandByPoint(ma.copy(e.center).sub(xo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const gi=new te,_o=new te,is=new te,Hi=new te,vo=new te,rs=new te,So=new te;class q0{constructor(e=new te,t=new te(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,gi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=gi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(gi.copy(this.origin).addScaledVector(this.direction,t),gi.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){_o.copy(e).add(t).multiplyScalar(.5),is.copy(t).sub(e).normalize(),Hi.copy(this.origin).sub(_o);const a=e.distanceTo(t)*.5,o=-this.direction.dot(is),l=Hi.dot(this.direction),f=-Hi.dot(is),u=Hi.lengthSq(),h=Math.abs(1-o*o);let p,m,g,y;if(h>0)if(p=o*f-l,m=o*l-f,y=a*h,p>=0)if(m>=-y)if(m<=y){const R=1/h;p*=R,m*=R,g=p*(p+o*m+2*l)+m*(o*p+m+2*f)+u}else m=a,p=Math.max(0,-(o*m+l)),g=-p*p+m*(m+2*f)+u;else m=-a,p=Math.max(0,-(o*m+l)),g=-p*p+m*(m+2*f)+u;else m<=-y?(p=Math.max(0,-(-o*a+l)),m=p>0?-a:Math.min(Math.max(-a,-f),a),g=-p*p+m*(m+2*f)+u):m<=y?(p=0,m=Math.min(Math.max(-a,-f),a),g=m*(m+2*f)+u):(p=Math.max(0,-(o*a+l)),m=p>0?a:Math.min(Math.max(-a,-f),a),g=-p*p+m*(m+2*f)+u);else m=o>0?-a:a,p=Math.max(0,-(o*m+l)),g=-p*p+m*(m+2*f)+u;return i&&i.copy(this.origin).addScaledVector(this.direction,p),r&&r.copy(_o).addScaledVector(is,m),g}intersectSphere(e,t){gi.subVectors(e.center,this.origin);const i=gi.dot(this.direction),r=gi.dot(gi)-i*i,a=e.radius*e.radius;if(r>a)return null;const o=Math.sqrt(a-r),l=i-o,f=i+o;return f<0?null:l<0?this.at(f,t):this.at(l,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,a,o,l,f;const u=1/this.direction.x,h=1/this.direction.y,p=1/this.direction.z,m=this.origin;return u>=0?(i=(e.min.x-m.x)*u,r=(e.max.x-m.x)*u):(i=(e.max.x-m.x)*u,r=(e.min.x-m.x)*u),h>=0?(a=(e.min.y-m.y)*h,o=(e.max.y-m.y)*h):(a=(e.max.y-m.y)*h,o=(e.min.y-m.y)*h),i>o||a>r||((a>i||isNaN(i))&&(i=a),(o<r||isNaN(r))&&(r=o),p>=0?(l=(e.min.z-m.z)*p,f=(e.max.z-m.z)*p):(l=(e.max.z-m.z)*p,f=(e.min.z-m.z)*p),i>f||l>r)||((l>i||i!==i)&&(i=l),(f<r||r!==r)&&(r=f),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,gi)!==null}intersectTriangle(e,t,i,r,a){vo.subVectors(t,e),rs.subVectors(i,e),So.crossVectors(vo,rs);let o=this.direction.dot(So),l;if(o>0){if(r)return null;l=1}else if(o<0)l=-1,o=-o;else return null;Hi.subVectors(this.origin,e);const f=l*this.direction.dot(rs.crossVectors(Hi,rs));if(f<0)return null;const u=l*this.direction.dot(vo.cross(Hi));if(u<0||f+u>o)return null;const h=-l*Hi.dot(So);return h<0?null:this.at(h/o,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Wt{constructor(e,t,i,r,a,o,l,f,u,h,p,m,g,y,R,S){Wt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,a,o,l,f,u,h,p,m,g,y,R,S)}set(e,t,i,r,a,o,l,f,u,h,p,m,g,y,R,S){const x=this.elements;return x[0]=e,x[4]=t,x[8]=i,x[12]=r,x[1]=a,x[5]=o,x[9]=l,x[13]=f,x[2]=u,x[6]=h,x[10]=p,x[14]=m,x[3]=g,x[7]=y,x[11]=R,x[15]=S,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Wt().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,r=1/Nr.setFromMatrixColumn(e,0).length(),a=1/Nr.setFromMatrixColumn(e,1).length(),o=1/Nr.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*a,t[5]=i[5]*a,t[6]=i[6]*a,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,a=e.z,o=Math.cos(i),l=Math.sin(i),f=Math.cos(r),u=Math.sin(r),h=Math.cos(a),p=Math.sin(a);if(e.order==="XYZ"){const m=o*h,g=o*p,y=l*h,R=l*p;t[0]=f*h,t[4]=-f*p,t[8]=u,t[1]=g+y*u,t[5]=m-R*u,t[9]=-l*f,t[2]=R-m*u,t[6]=y+g*u,t[10]=o*f}else if(e.order==="YXZ"){const m=f*h,g=f*p,y=u*h,R=u*p;t[0]=m+R*l,t[4]=y*l-g,t[8]=o*u,t[1]=o*p,t[5]=o*h,t[9]=-l,t[2]=g*l-y,t[6]=R+m*l,t[10]=o*f}else if(e.order==="ZXY"){const m=f*h,g=f*p,y=u*h,R=u*p;t[0]=m-R*l,t[4]=-o*p,t[8]=y+g*l,t[1]=g+y*l,t[5]=o*h,t[9]=R-m*l,t[2]=-o*u,t[6]=l,t[10]=o*f}else if(e.order==="ZYX"){const m=o*h,g=o*p,y=l*h,R=l*p;t[0]=f*h,t[4]=y*u-g,t[8]=m*u+R,t[1]=f*p,t[5]=R*u+m,t[9]=g*u-y,t[2]=-u,t[6]=l*f,t[10]=o*f}else if(e.order==="YZX"){const m=o*f,g=o*u,y=l*f,R=l*u;t[0]=f*h,t[4]=R-m*p,t[8]=y*p+g,t[1]=p,t[5]=o*h,t[9]=-l*h,t[2]=-u*h,t[6]=g*p+y,t[10]=m-R*p}else if(e.order==="XZY"){const m=o*f,g=o*u,y=l*f,R=l*u;t[0]=f*h,t[4]=-p,t[8]=u*h,t[1]=m*p+R,t[5]=o*h,t[9]=g*p-y,t[2]=y*p-g,t[6]=l*h,t[10]=R*p+m}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Y0,e,j0)}lookAt(e,t,i){const r=this.elements;return Tn.subVectors(e,t),Tn.lengthSq()===0&&(Tn.z=1),Tn.normalize(),Wi.crossVectors(i,Tn),Wi.lengthSq()===0&&(Math.abs(i.z)===1?Tn.x+=1e-4:Tn.z+=1e-4,Tn.normalize(),Wi.crossVectors(i,Tn)),Wi.normalize(),as.crossVectors(Tn,Wi),r[0]=Wi.x,r[4]=as.x,r[8]=Tn.x,r[1]=Wi.y,r[5]=as.y,r[9]=Tn.y,r[2]=Wi.z,r[6]=as.z,r[10]=Tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,a=this.elements,o=i[0],l=i[4],f=i[8],u=i[12],h=i[1],p=i[5],m=i[9],g=i[13],y=i[2],R=i[6],S=i[10],x=i[14],U=i[3],I=i[7],B=i[11],C=i[15],E=r[0],A=r[4],O=r[8],M=r[12],v=r[1],F=r[5],L=r[9],V=r[13],X=r[2],Z=r[6],$=r[10],ne=r[14],Y=r[3],ue=r[7],he=r[11],Fe=r[15];return a[0]=o*E+l*v+f*X+u*Y,a[4]=o*A+l*F+f*Z+u*ue,a[8]=o*O+l*L+f*$+u*he,a[12]=o*M+l*V+f*ne+u*Fe,a[1]=h*E+p*v+m*X+g*Y,a[5]=h*A+p*F+m*Z+g*ue,a[9]=h*O+p*L+m*$+g*he,a[13]=h*M+p*V+m*ne+g*Fe,a[2]=y*E+R*v+S*X+x*Y,a[6]=y*A+R*F+S*Z+x*ue,a[10]=y*O+R*L+S*$+x*he,a[14]=y*M+R*V+S*ne+x*Fe,a[3]=U*E+I*v+B*X+C*Y,a[7]=U*A+I*F+B*Z+C*ue,a[11]=U*O+I*L+B*$+C*he,a[15]=U*M+I*V+B*ne+C*Fe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],a=e[12],o=e[1],l=e[5],f=e[9],u=e[13],h=e[2],p=e[6],m=e[10],g=e[14],y=e[3],R=e[7],S=e[11],x=e[15];return y*(+a*f*p-r*u*p-a*l*m+i*u*m+r*l*g-i*f*g)+R*(+t*f*g-t*u*m+a*o*m-r*o*g+r*u*h-a*f*h)+S*(+t*u*p-t*l*g-a*o*p+i*o*g+a*l*h-i*u*h)+x*(-r*l*h-t*f*p+t*l*m+r*o*p-i*o*m+i*f*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],a=e[3],o=e[4],l=e[5],f=e[6],u=e[7],h=e[8],p=e[9],m=e[10],g=e[11],y=e[12],R=e[13],S=e[14],x=e[15],U=p*S*u-R*m*u+R*f*g-l*S*g-p*f*x+l*m*x,I=y*m*u-h*S*u-y*f*g+o*S*g+h*f*x-o*m*x,B=h*R*u-y*p*u+y*l*g-o*R*g-h*l*x+o*p*x,C=y*p*f-h*R*f-y*l*m+o*R*m+h*l*S-o*p*S,E=t*U+i*I+r*B+a*C;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/E;return e[0]=U*A,e[1]=(R*m*a-p*S*a-R*r*g+i*S*g+p*r*x-i*m*x)*A,e[2]=(l*S*a-R*f*a+R*r*u-i*S*u-l*r*x+i*f*x)*A,e[3]=(p*f*a-l*m*a-p*r*u+i*m*u+l*r*g-i*f*g)*A,e[4]=I*A,e[5]=(h*S*a-y*m*a+y*r*g-t*S*g-h*r*x+t*m*x)*A,e[6]=(y*f*a-o*S*a-y*r*u+t*S*u+o*r*x-t*f*x)*A,e[7]=(o*m*a-h*f*a+h*r*u-t*m*u-o*r*g+t*f*g)*A,e[8]=B*A,e[9]=(y*p*a-h*R*a-y*i*g+t*R*g+h*i*x-t*p*x)*A,e[10]=(o*R*a-y*l*a+y*i*u-t*R*u-o*i*x+t*l*x)*A,e[11]=(h*l*a-o*p*a-h*i*u+t*p*u+o*i*g-t*l*g)*A,e[12]=C*A,e[13]=(h*R*r-y*p*r+y*i*m-t*R*m-h*i*S+t*p*S)*A,e[14]=(y*l*r-o*R*r-y*i*f+t*R*f+o*i*S-t*l*S)*A,e[15]=(o*p*r-h*l*r+h*i*f-t*p*f-o*i*m+t*l*m)*A,this}scale(e){const t=this.elements,i=e.x,r=e.y,a=e.z;return t[0]*=i,t[4]*=r,t[8]*=a,t[1]*=i,t[5]*=r,t[9]*=a,t[2]*=i,t[6]*=r,t[10]*=a,t[3]*=i,t[7]*=r,t[11]*=a,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),a=1-i,o=e.x,l=e.y,f=e.z,u=a*o,h=a*l;return this.set(u*o+i,u*l-r*f,u*f+r*l,0,u*l+r*f,h*l+i,h*f-r*o,0,u*f-r*l,h*f+r*o,a*f*f+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,a,o){return this.set(1,i,a,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,a=t._x,o=t._y,l=t._z,f=t._w,u=a+a,h=o+o,p=l+l,m=a*u,g=a*h,y=a*p,R=o*h,S=o*p,x=l*p,U=f*u,I=f*h,B=f*p,C=i.x,E=i.y,A=i.z;return r[0]=(1-(R+x))*C,r[1]=(g+B)*C,r[2]=(y-I)*C,r[3]=0,r[4]=(g-B)*E,r[5]=(1-(m+x))*E,r[6]=(S+U)*E,r[7]=0,r[8]=(y+I)*A,r[9]=(S-U)*A,r[10]=(1-(m+R))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;let a=Nr.set(r[0],r[1],r[2]).length();const o=Nr.set(r[4],r[5],r[6]).length(),l=Nr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(a=-a),e.x=r[12],e.y=r[13],e.z=r[14],Xn.copy(this);const u=1/a,h=1/o,p=1/l;return Xn.elements[0]*=u,Xn.elements[1]*=u,Xn.elements[2]*=u,Xn.elements[4]*=h,Xn.elements[5]*=h,Xn.elements[6]*=h,Xn.elements[8]*=p,Xn.elements[9]*=p,Xn.elements[10]*=p,t.setFromRotationMatrix(Xn),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,r,a,o,l=si,f=!1){const u=this.elements,h=2*a/(t-e),p=2*a/(i-r),m=(t+e)/(t-e),g=(i+r)/(i-r);let y,R;if(f)y=a/(o-a),R=o*a/(o-a);else if(l===si)y=-(o+a)/(o-a),R=-2*o*a/(o-a);else if(l===Fs)y=-o/(o-a),R=-o*a/(o-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+l);return u[0]=h,u[4]=0,u[8]=m,u[12]=0,u[1]=0,u[5]=p,u[9]=g,u[13]=0,u[2]=0,u[6]=0,u[10]=y,u[14]=R,u[3]=0,u[7]=0,u[11]=-1,u[15]=0,this}makeOrthographic(e,t,i,r,a,o,l=si,f=!1){const u=this.elements,h=2/(t-e),p=2/(i-r),m=-(t+e)/(t-e),g=-(i+r)/(i-r);let y,R;if(f)y=1/(o-a),R=o/(o-a);else if(l===si)y=-2/(o-a),R=-(o+a)/(o-a);else if(l===Fs)y=-1/(o-a),R=-a/(o-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+l);return u[0]=h,u[4]=0,u[8]=0,u[12]=m,u[1]=0,u[5]=p,u[9]=0,u[13]=g,u[2]=0,u[6]=0,u[10]=y,u[14]=R,u[3]=0,u[7]=0,u[11]=0,u[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Nr=new te,Xn=new Wt,Y0=new te(0,0,0),j0=new te(1,1,1),Wi=new te,as=new te,Tn=new te,Kc=new Wt,Zc=new za;class Pi{constructor(e=0,t=0,i=0,r=Pi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,a=r[0],o=r[4],l=r[8],f=r[1],u=r[5],h=r[9],p=r[2],m=r[6],g=r[10];switch(t){case"XYZ":this._y=Math.asin(dt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,g),this._z=Math.atan2(-o,a)):(this._x=Math.atan2(m,u),this._z=0);break;case"YXZ":this._x=Math.asin(-dt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(l,g),this._z=Math.atan2(f,u)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin(dt(m,-1,1)),Math.abs(m)<.9999999?(this._y=Math.atan2(-p,g),this._z=Math.atan2(-o,u)):(this._y=0,this._z=Math.atan2(f,a));break;case"ZYX":this._y=Math.asin(-dt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(m,g),this._z=Math.atan2(f,a)):(this._x=0,this._z=Math.atan2(-o,u));break;case"YZX":this._z=Math.asin(dt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(-h,u),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(l,g));break;case"XZY":this._z=Math.asin(-dt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(m,u),this._y=Math.atan2(l,a)):(this._x=Math.atan2(-h,g),this._y=0);break;default:it("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Kc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Kc,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Zc.setFromEuler(this),this.setFromQuaternion(Zc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Pi.DEFAULT_ORDER="XYZ";class Uu{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let $0=0;const Jc=new te,Or=new za,xi=new Wt,ss=new te,ga=new te,K0=new te,Z0=new za,Qc=new te(1,0,0),ef=new te(0,1,0),tf=new te(0,0,1),nf={type:"added"},J0={type:"removed"},Br={type:"childadded",child:null},yo={type:"childremoved",child:null};class In extends oa{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:$0++}),this.uuid=ka(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=In.DEFAULT_UP.clone();const e=new te,t=new Pi,i=new za,r=new te(1,1,1);function a(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(a),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Wt},normalMatrix:{value:new ot}}),this.matrix=new Wt,this.matrixWorld=new Wt,this.matrixAutoUpdate=In.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=In.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Uu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Or.setFromAxisAngle(e,t),this.quaternion.multiply(Or),this}rotateOnWorldAxis(e,t){return Or.setFromAxisAngle(e,t),this.quaternion.premultiply(Or),this}rotateX(e){return this.rotateOnAxis(Qc,e)}rotateY(e){return this.rotateOnAxis(ef,e)}rotateZ(e){return this.rotateOnAxis(tf,e)}translateOnAxis(e,t){return Jc.copy(e).applyQuaternion(this.quaternion),this.position.add(Jc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Qc,e)}translateY(e){return this.translateOnAxis(ef,e)}translateZ(e){return this.translateOnAxis(tf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(xi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ss.copy(e):ss.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),ga.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xi.lookAt(ga,ss,this.up):xi.lookAt(ss,ga,this.up),this.quaternion.setFromRotationMatrix(xi),r&&(xi.extractRotation(r.matrixWorld),Or.setFromRotationMatrix(xi),this.quaternion.premultiply(Or.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(kt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(nf),Br.child=e,this.dispatchEvent(Br),Br.child=null):kt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(J0),yo.child=e,this.dispatchEvent(yo),yo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),xi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),xi.multiply(e.parent.matrixWorld)),e.applyMatrix4(xi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(nf),Br.child=e,this.dispatchEvent(Br),Br.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ga,e,K0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ga,Z0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(l=>({...l,boundingBox:l.boundingBox?l.boundingBox.toJSON():void 0,boundingSphere:l.boundingSphere?l.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(l=>({...l})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function a(l,f){return l[f.uuid]===void 0&&(l[f.uuid]=f.toJSON(e)),f.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=a(e.geometries,this.geometry);const l=this.geometry.parameters;if(l!==void 0&&l.shapes!==void 0){const f=l.shapes;if(Array.isArray(f))for(let u=0,h=f.length;u<h;u++){const p=f[u];a(e.shapes,p)}else a(e.shapes,f)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const l=[];for(let f=0,u=this.material.length;f<u;f++)l.push(a(e.materials,this.material[f]));r.material=l}else r.material=a(e.materials,this.material);if(this.children.length>0){r.children=[];for(let l=0;l<this.children.length;l++)r.children.push(this.children[l].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let l=0;l<this.animations.length;l++){const f=this.animations[l];r.animations.push(a(e.animations,f))}}if(t){const l=o(e.geometries),f=o(e.materials),u=o(e.textures),h=o(e.images),p=o(e.shapes),m=o(e.skeletons),g=o(e.animations),y=o(e.nodes);l.length>0&&(i.geometries=l),f.length>0&&(i.materials=f),u.length>0&&(i.textures=u),h.length>0&&(i.images=h),p.length>0&&(i.shapes=p),m.length>0&&(i.skeletons=m),g.length>0&&(i.animations=g),y.length>0&&(i.nodes=y)}return i.object=r,i;function o(l){const f=[];for(const u in l){const h=l[u];delete h.metadata,f.push(h)}return f}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}In.DEFAULT_UP=new te(0,1,0);In.DEFAULT_MATRIX_AUTO_UPDATE=!0;In.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const qn=new te,_i=new te,bo=new te,vi=new te,kr=new te,zr=new te,rf=new te,Eo=new te,Mo=new te,To=new te,wo=new zt,Ao=new zt,Ro=new zt;class jn{constructor(e=new te,t=new te,i=new te){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),qn.subVectors(e,t),r.cross(qn);const a=r.lengthSq();return a>0?r.multiplyScalar(1/Math.sqrt(a)):r.set(0,0,0)}static getBarycoord(e,t,i,r,a){qn.subVectors(r,t),_i.subVectors(i,t),bo.subVectors(e,t);const o=qn.dot(qn),l=qn.dot(_i),f=qn.dot(bo),u=_i.dot(_i),h=_i.dot(bo),p=o*u-l*l;if(p===0)return a.set(0,0,0),null;const m=1/p,g=(u*f-l*h)*m,y=(o*h-l*f)*m;return a.set(1-g-y,y,g)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,vi)===null?!1:vi.x>=0&&vi.y>=0&&vi.x+vi.y<=1}static getInterpolation(e,t,i,r,a,o,l,f){return this.getBarycoord(e,t,i,r,vi)===null?(f.x=0,f.y=0,"z"in f&&(f.z=0),"w"in f&&(f.w=0),null):(f.setScalar(0),f.addScaledVector(a,vi.x),f.addScaledVector(o,vi.y),f.addScaledVector(l,vi.z),f)}static getInterpolatedAttribute(e,t,i,r,a,o){return wo.setScalar(0),Ao.setScalar(0),Ro.setScalar(0),wo.fromBufferAttribute(e,t),Ao.fromBufferAttribute(e,i),Ro.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(wo,a.x),o.addScaledVector(Ao,a.y),o.addScaledVector(Ro,a.z),o}static isFrontFacing(e,t,i,r){return qn.subVectors(i,t),_i.subVectors(e,t),qn.cross(_i).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return qn.subVectors(this.c,this.b),_i.subVectors(this.a,this.b),qn.cross(_i).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return jn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return jn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,a){return jn.getInterpolation(e,this.a,this.b,this.c,t,i,r,a)}containsPoint(e){return jn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return jn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,a=this.c;let o,l;kr.subVectors(r,i),zr.subVectors(a,i),Eo.subVectors(e,i);const f=kr.dot(Eo),u=zr.dot(Eo);if(f<=0&&u<=0)return t.copy(i);Mo.subVectors(e,r);const h=kr.dot(Mo),p=zr.dot(Mo);if(h>=0&&p<=h)return t.copy(r);const m=f*p-h*u;if(m<=0&&f>=0&&h<=0)return o=f/(f-h),t.copy(i).addScaledVector(kr,o);To.subVectors(e,a);const g=kr.dot(To),y=zr.dot(To);if(y>=0&&g<=y)return t.copy(a);const R=g*u-f*y;if(R<=0&&u>=0&&y<=0)return l=u/(u-y),t.copy(i).addScaledVector(zr,l);const S=h*y-g*p;if(S<=0&&p-h>=0&&g-y>=0)return rf.subVectors(a,r),l=(p-h)/(p-h+(g-y)),t.copy(r).addScaledVector(rf,l);const x=1/(S+R+m);return o=R*x,l=m*x,t.copy(i).addScaledVector(kr,o).addScaledVector(zr,l)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Nu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xi={h:0,s:0,l:0},os={h:0,s:0,l:0};function Co(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Tt{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Rn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,_t.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=_t.workingColorSpace){return this.r=e,this.g=t,this.b=i,_t.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=_t.workingColorSpace){if(e=B0(e,1),t=dt(t,0,1),i=dt(i,0,1),t===0)this.r=this.g=this.b=i;else{const a=i<=.5?i*(1+t):i+t-i*t,o=2*i-a;this.r=Co(o,a,e+1/3),this.g=Co(o,a,e),this.b=Co(o,a,e-1/3)}return _t.colorSpaceToWorking(this,r),this}setStyle(e,t=Rn){function i(a){a!==void 0&&parseFloat(a)<1&&it("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let a;const o=r[1],l=r[2];switch(o){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:it("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const a=r[1],o=a.length;if(o===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(a,16),t);it("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Rn){const i=Nu[e.toLowerCase()];return i!==void 0?this.setHex(i,t):it("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ri(e.r),this.g=Ri(e.g),this.b=Ri(e.b),this}copyLinearToSRGB(e){return this.r=Zr(e.r),this.g=Zr(e.g),this.b=Zr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Rn){return _t.workingToColorSpace(sn.copy(this),e),Math.round(dt(sn.r*255,0,255))*65536+Math.round(dt(sn.g*255,0,255))*256+Math.round(dt(sn.b*255,0,255))}getHexString(e=Rn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=_t.workingColorSpace){_t.workingToColorSpace(sn.copy(this),t);const i=sn.r,r=sn.g,a=sn.b,o=Math.max(i,r,a),l=Math.min(i,r,a);let f,u;const h=(l+o)/2;if(l===o)f=0,u=0;else{const p=o-l;switch(u=h<=.5?p/(o+l):p/(2-o-l),o){case i:f=(r-a)/p+(r<a?6:0);break;case r:f=(a-i)/p+2;break;case a:f=(i-r)/p+4;break}f/=6}return e.h=f,e.s=u,e.l=h,e}getRGB(e,t=_t.workingColorSpace){return _t.workingToColorSpace(sn.copy(this),t),e.r=sn.r,e.g=sn.g,e.b=sn.b,e}getStyle(e=Rn){_t.workingToColorSpace(sn.copy(this),e);const t=sn.r,i=sn.g,r=sn.b;return e!==Rn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(Xi),this.setHSL(Xi.h+e,Xi.s+t,Xi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Xi),e.getHSL(os);const i=fo(Xi.h,os.h,t),r=fo(Xi.s,os.s,t),a=fo(Xi.l,os.l,t);return this.setHSL(i,r,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,a=e.elements;return this.r=a[0]*t+a[3]*i+a[6]*r,this.g=a[1]*t+a[4]*i+a[7]*r,this.b=a[2]*t+a[5]*i+a[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const sn=new Tt;Tt.NAMES=Nu;let Q0=0;class Xs extends oa{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Q0++}),this.uuid=ka(),this.name="",this.type="Material",this.blending=Kr,this.side=Ji,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=jo,this.blendDst=$o,this.blendEquation=ur,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Tt(0,0,0),this.blendAlpha=0,this.depthFunc=ta,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Vc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Dr,this.stencilZFail=Dr,this.stencilZPass=Dr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){it(`Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){it(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Kr&&(i.blending=this.blending),this.side!==Ji&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==jo&&(i.blendSrc=this.blendSrc),this.blendDst!==$o&&(i.blendDst=this.blendDst),this.blendEquation!==ur&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ta&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Vc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Dr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Dr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Dr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(a){const o=[];for(const l in a){const f=a[l];delete f.metadata,o.push(f)}return o}if(t){const a=r(e.textures),o=r(e.images);a.length>0&&(i.textures=a),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let a=0;a!==r;++a)i[a]=t[a].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class lc extends Xs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Tt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pi,this.combine=Mu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Mi=em();function em(){const n=new ArrayBuffer(4),e=new Float32Array(n),t=new Uint32Array(n),i=new Uint32Array(512),r=new Uint32Array(512);for(let f=0;f<256;++f){const u=f-127;u<-27?(i[f]=0,i[f|256]=32768,r[f]=24,r[f|256]=24):u<-14?(i[f]=1024>>-u-14,i[f|256]=1024>>-u-14|32768,r[f]=-u-1,r[f|256]=-u-1):u<=15?(i[f]=u+15<<10,i[f|256]=u+15<<10|32768,r[f]=13,r[f|256]=13):u<128?(i[f]=31744,i[f|256]=64512,r[f]=24,r[f|256]=24):(i[f]=31744,i[f|256]=64512,r[f]=13,r[f|256]=13)}const a=new Uint32Array(2048),o=new Uint32Array(64),l=new Uint32Array(64);for(let f=1;f<1024;++f){let u=f<<13,h=0;for(;(u&8388608)===0;)u<<=1,h-=8388608;u&=-8388609,h+=947912704,a[f]=u|h}for(let f=1024;f<2048;++f)a[f]=939524096+(f-1024<<13);for(let f=1;f<31;++f)o[f]=f<<23;o[31]=1199570944,o[32]=2147483648;for(let f=33;f<63;++f)o[f]=2147483648+(f-32<<23);o[63]=3347054592;for(let f=1;f<64;++f)f!==32&&(l[f]=1024);return{floatView:e,uint32View:t,baseTable:i,shiftTable:r,mantissaTable:a,exponentTable:o,offsetTable:l}}function tm(n){Math.abs(n)>65504&&it("DataUtils.toHalfFloat(): Value out of range."),n=dt(n,-65504,65504),Mi.floatView[0]=n;const e=Mi.uint32View[0],t=e>>23&511;return Mi.baseTable[t]+((e&8388607)>>Mi.shiftTable[t])}function nm(n){const e=n>>10;return Mi.uint32View[0]=Mi.mantissaTable[Mi.offsetTable[e]+(n&1023)]+Mi.exponentTable[e],Mi.floatView[0]}class ls{static toHalfFloat(e){return tm(e)}static fromHalfFloat(e){return nm(e)}}const Gt=new te,cs=new wt;let im=0;class oi{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:im++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Hc,this.updateRanges=[],this.gpuType=Bn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,a=this.itemSize;r<a;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)cs.fromBufferAttribute(this,t),cs.applyMatrix3(e),this.setXY(t,cs.x,cs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.applyMatrix3(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.applyMatrix4(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.applyNormalMatrix(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.transformDirection(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=ha(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=_n(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ha(t,this.array)),t}setX(e,t){return this.normalized&&(t=_n(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ha(t,this.array)),t}setY(e,t){return this.normalized&&(t=_n(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ha(t,this.array)),t}setZ(e,t){return this.normalized&&(t=_n(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ha(t,this.array)),t}setW(e,t){return this.normalized&&(t=_n(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=_n(t,this.array),i=_n(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=_n(t,this.array),i=_n(i,this.array),r=_n(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,a){return e*=this.itemSize,this.normalized&&(t=_n(t,this.array),i=_n(i,this.array),r=_n(r,this.array),a=_n(a,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Hc&&(e.usage=this.usage),e}}class Ou extends oi{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Bu extends oi{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class gr extends oi{constructor(e,t,i){super(new Float32Array(e),t,i)}}let rm=0;const Fn=new Wt,Po=new In,Gr=new te,wn=new Ga,xa=new Ga,Kt=new te;class er extends oa{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:rm++}),this.uuid=ka(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Iu(e)?Bu:Ou)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const a=new ot().getNormalMatrix(e);i.applyNormalMatrix(a),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Fn.makeRotationFromQuaternion(e),this.applyMatrix4(Fn),this}rotateX(e){return Fn.makeRotationX(e),this.applyMatrix4(Fn),this}rotateY(e){return Fn.makeRotationY(e),this.applyMatrix4(Fn),this}rotateZ(e){return Fn.makeRotationZ(e),this.applyMatrix4(Fn),this}translate(e,t,i){return Fn.makeTranslation(e,t,i),this.applyMatrix4(Fn),this}scale(e,t,i){return Fn.makeScale(e,t,i),this.applyMatrix4(Fn),this}lookAt(e){return Po.lookAt(e),Po.updateMatrix(),this.applyMatrix4(Po.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gr).negate(),this.translate(Gr.x,Gr.y,Gr.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let r=0,a=e.length;r<a;r++){const o=e[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new gr(i,3))}else{const i=Math.min(e.length,t.count);for(let r=0;r<i;r++){const a=e[r];t.setXYZ(r,a.x,a.y,a.z||0)}e.length>t.count&&it("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ga);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){kt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new te(-1/0,-1/0,-1/0),new te(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const a=t[i];wn.setFromBufferAttribute(a),this.morphTargetsRelative?(Kt.addVectors(this.boundingBox.min,wn.min),this.boundingBox.expandByPoint(Kt),Kt.addVectors(this.boundingBox.max,wn.max),this.boundingBox.expandByPoint(Kt)):(this.boundingBox.expandByPoint(wn.min),this.boundingBox.expandByPoint(wn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&kt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new oc);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){kt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new te,1/0);return}if(e){const i=this.boundingSphere.center;if(wn.setFromBufferAttribute(e),t)for(let a=0,o=t.length;a<o;a++){const l=t[a];xa.setFromBufferAttribute(l),this.morphTargetsRelative?(Kt.addVectors(wn.min,xa.min),wn.expandByPoint(Kt),Kt.addVectors(wn.max,xa.max),wn.expandByPoint(Kt)):(wn.expandByPoint(xa.min),wn.expandByPoint(xa.max))}wn.getCenter(i);let r=0;for(let a=0,o=e.count;a<o;a++)Kt.fromBufferAttribute(e,a),r=Math.max(r,i.distanceToSquared(Kt));if(t)for(let a=0,o=t.length;a<o;a++){const l=t[a],f=this.morphTargetsRelative;for(let u=0,h=l.count;u<h;u++)Kt.fromBufferAttribute(l,u),f&&(Gr.fromBufferAttribute(e,u),Kt.add(Gr)),r=Math.max(r,i.distanceToSquared(Kt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&kt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){kt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,a=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new oi(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),l=[],f=[];for(let O=0;O<i.count;O++)l[O]=new te,f[O]=new te;const u=new te,h=new te,p=new te,m=new wt,g=new wt,y=new wt,R=new te,S=new te;function x(O,M,v){u.fromBufferAttribute(i,O),h.fromBufferAttribute(i,M),p.fromBufferAttribute(i,v),m.fromBufferAttribute(a,O),g.fromBufferAttribute(a,M),y.fromBufferAttribute(a,v),h.sub(u),p.sub(u),g.sub(m),y.sub(m);const F=1/(g.x*y.y-y.x*g.y);isFinite(F)&&(R.copy(h).multiplyScalar(y.y).addScaledVector(p,-g.y).multiplyScalar(F),S.copy(p).multiplyScalar(g.x).addScaledVector(h,-y.x).multiplyScalar(F),l[O].add(R),l[M].add(R),l[v].add(R),f[O].add(S),f[M].add(S),f[v].add(S))}let U=this.groups;U.length===0&&(U=[{start:0,count:e.count}]);for(let O=0,M=U.length;O<M;++O){const v=U[O],F=v.start,L=v.count;for(let V=F,X=F+L;V<X;V+=3)x(e.getX(V+0),e.getX(V+1),e.getX(V+2))}const I=new te,B=new te,C=new te,E=new te;function A(O){C.fromBufferAttribute(r,O),E.copy(C);const M=l[O];I.copy(M),I.sub(C.multiplyScalar(C.dot(M))).normalize(),B.crossVectors(E,M);const F=B.dot(f[O])<0?-1:1;o.setXYZW(O,I.x,I.y,I.z,F)}for(let O=0,M=U.length;O<M;++O){const v=U[O],F=v.start,L=v.count;for(let V=F,X=F+L;V<X;V+=3)A(e.getX(V+0)),A(e.getX(V+1)),A(e.getX(V+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new oi(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let m=0,g=i.count;m<g;m++)i.setXYZ(m,0,0,0);const r=new te,a=new te,o=new te,l=new te,f=new te,u=new te,h=new te,p=new te;if(e)for(let m=0,g=e.count;m<g;m+=3){const y=e.getX(m+0),R=e.getX(m+1),S=e.getX(m+2);r.fromBufferAttribute(t,y),a.fromBufferAttribute(t,R),o.fromBufferAttribute(t,S),h.subVectors(o,a),p.subVectors(r,a),h.cross(p),l.fromBufferAttribute(i,y),f.fromBufferAttribute(i,R),u.fromBufferAttribute(i,S),l.add(h),f.add(h),u.add(h),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(R,f.x,f.y,f.z),i.setXYZ(S,u.x,u.y,u.z)}else for(let m=0,g=t.count;m<g;m+=3)r.fromBufferAttribute(t,m+0),a.fromBufferAttribute(t,m+1),o.fromBufferAttribute(t,m+2),h.subVectors(o,a),p.subVectors(r,a),h.cross(p),i.setXYZ(m+0,h.x,h.y,h.z),i.setXYZ(m+1,h.x,h.y,h.z),i.setXYZ(m+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Kt.fromBufferAttribute(e,t),Kt.normalize(),e.setXYZ(t,Kt.x,Kt.y,Kt.z)}toNonIndexed(){function e(l,f){const u=l.array,h=l.itemSize,p=l.normalized,m=new u.constructor(f.length*h);let g=0,y=0;for(let R=0,S=f.length;R<S;R++){l.isInterleavedBufferAttribute?g=f[R]*l.data.stride+l.offset:g=f[R]*h;for(let x=0;x<h;x++)m[y++]=u[g++]}return new oi(m,h,p)}if(this.index===null)return it("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new er,i=this.index.array,r=this.attributes;for(const l in r){const f=r[l],u=e(f,i);t.setAttribute(l,u)}const a=this.morphAttributes;for(const l in a){const f=[],u=a[l];for(let h=0,p=u.length;h<p;h++){const m=u[h],g=e(m,i);f.push(g)}t.morphAttributes[l]=f}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let l=0,f=o.length;l<f;l++){const u=o[l];t.addGroup(u.start,u.count,u.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const f=this.parameters;for(const u in f)f[u]!==void 0&&(e[u]=f[u]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const f in i){const u=i[f];e.data.attributes[f]=u.toJSON(e.data)}const r={};let a=!1;for(const f in this.morphAttributes){const u=this.morphAttributes[f],h=[];for(let p=0,m=u.length;p<m;p++){const g=u[p];h.push(g.toJSON(e.data))}h.length>0&&(r[f]=h,a=!0)}a&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const l=this.boundingSphere;return l!==null&&(e.data.boundingSphere=l.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const r=e.attributes;for(const u in r){const h=r[u];this.setAttribute(u,h.clone(t))}const a=e.morphAttributes;for(const u in a){const h=[],p=a[u];for(let m=0,g=p.length;m<g;m++)h.push(p[m].clone(t));this.morphAttributes[u]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let u=0,h=o.length;u<h;u++){const p=o[u];this.addGroup(p.start,p.count,p.materialIndex)}const l=e.boundingBox;l!==null&&(this.boundingBox=l.clone());const f=e.boundingSphere;return f!==null&&(this.boundingSphere=f.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const af=new Wt,sr=new q0,fs=new oc,sf=new te,us=new te,ds=new te,hs=new te,Do=new te,ps=new te,of=new te,ms=new te;class fi extends In{constructor(e=new er,t=new lc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,o=r.length;a<o;a++){const l=r[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[l]=a}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,a=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const l=this.morphTargetInfluences;if(a&&l){ps.set(0,0,0);for(let f=0,u=a.length;f<u;f++){const h=l[f],p=a[f];h!==0&&(Do.fromBufferAttribute(p,e),o?ps.addScaledVector(Do,h):ps.addScaledVector(Do.sub(t),h))}t.add(ps)}return t}raycast(e,t){const i=this.geometry,r=this.material,a=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),fs.copy(i.boundingSphere),fs.applyMatrix4(a),sr.copy(e.ray).recast(e.near),!(fs.containsPoint(sr.origin)===!1&&(sr.intersectSphere(fs,sf)===null||sr.origin.distanceToSquared(sf)>(e.far-e.near)**2))&&(af.copy(a).invert(),sr.copy(e.ray).applyMatrix4(af),!(i.boundingBox!==null&&sr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,sr)))}_computeIntersections(e,t,i){let r;const a=this.geometry,o=this.material,l=a.index,f=a.attributes.position,u=a.attributes.uv,h=a.attributes.uv1,p=a.attributes.normal,m=a.groups,g=a.drawRange;if(l!==null)if(Array.isArray(o))for(let y=0,R=m.length;y<R;y++){const S=m[y],x=o[S.materialIndex],U=Math.max(S.start,g.start),I=Math.min(l.count,Math.min(S.start+S.count,g.start+g.count));for(let B=U,C=I;B<C;B+=3){const E=l.getX(B),A=l.getX(B+1),O=l.getX(B+2);r=gs(this,x,e,i,u,h,p,E,A,O),r&&(r.faceIndex=Math.floor(B/3),r.face.materialIndex=S.materialIndex,t.push(r))}}else{const y=Math.max(0,g.start),R=Math.min(l.count,g.start+g.count);for(let S=y,x=R;S<x;S+=3){const U=l.getX(S),I=l.getX(S+1),B=l.getX(S+2);r=gs(this,o,e,i,u,h,p,U,I,B),r&&(r.faceIndex=Math.floor(S/3),t.push(r))}}else if(f!==void 0)if(Array.isArray(o))for(let y=0,R=m.length;y<R;y++){const S=m[y],x=o[S.materialIndex],U=Math.max(S.start,g.start),I=Math.min(f.count,Math.min(S.start+S.count,g.start+g.count));for(let B=U,C=I;B<C;B+=3){const E=B,A=B+1,O=B+2;r=gs(this,x,e,i,u,h,p,E,A,O),r&&(r.faceIndex=Math.floor(B/3),r.face.materialIndex=S.materialIndex,t.push(r))}}else{const y=Math.max(0,g.start),R=Math.min(f.count,g.start+g.count);for(let S=y,x=R;S<x;S+=3){const U=S,I=S+1,B=S+2;r=gs(this,o,e,i,u,h,p,U,I,B),r&&(r.faceIndex=Math.floor(S/3),t.push(r))}}}}function am(n,e,t,i,r,a,o,l){let f;if(e.side===bn?f=i.intersectTriangle(o,a,r,!0,l):f=i.intersectTriangle(r,a,o,e.side===Ji,l),f===null)return null;ms.copy(l),ms.applyMatrix4(n.matrixWorld);const u=t.ray.origin.distanceTo(ms);return u<t.near||u>t.far?null:{distance:u,point:ms.clone(),object:n}}function gs(n,e,t,i,r,a,o,l,f,u){n.getVertexPosition(l,us),n.getVertexPosition(f,ds),n.getVertexPosition(u,hs);const h=am(n,e,t,i,us,ds,hs,of);if(h){const p=new te;jn.getBarycoord(of,us,ds,hs,p),r&&(h.uv=jn.getInterpolatedAttribute(r,l,f,u,p,new wt)),a&&(h.uv1=jn.getInterpolatedAttribute(a,l,f,u,p,new wt)),o&&(h.normal=jn.getInterpolatedAttribute(o,l,f,u,p,new te),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const m={a:l,b:f,c:u,normal:new te,materialIndex:0};jn.getNormal(us,ds,hs,m.normal),h.face=m,h.barycoord=p}return h}class Va extends er{constructor(e=1,t=1,i=1,r=1,a=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:a,depthSegments:o};const l=this;r=Math.floor(r),a=Math.floor(a),o=Math.floor(o);const f=[],u=[],h=[],p=[];let m=0,g=0;y("z","y","x",-1,-1,i,t,e,o,a,0),y("z","y","x",1,-1,i,t,-e,o,a,1),y("x","z","y",1,1,e,i,t,r,o,2),y("x","z","y",1,-1,e,i,-t,r,o,3),y("x","y","z",1,-1,e,t,i,r,a,4),y("x","y","z",-1,-1,e,t,-i,r,a,5),this.setIndex(f),this.setAttribute("position",new gr(u,3)),this.setAttribute("normal",new gr(h,3)),this.setAttribute("uv",new gr(p,2));function y(R,S,x,U,I,B,C,E,A,O,M){const v=B/A,F=C/O,L=B/2,V=C/2,X=E/2,Z=A+1,$=O+1;let ne=0,Y=0;const ue=new te;for(let he=0;he<$;he++){const Fe=he*F-V;for(let Qe=0;Qe<Z;Qe++){const at=Qe*v-L;ue[R]=at*U,ue[S]=Fe*I,ue[x]=X,u.push(ue.x,ue.y,ue.z),ue[R]=0,ue[S]=0,ue[x]=E>0?1:-1,h.push(ue.x,ue.y,ue.z),p.push(Qe/A),p.push(1-he/O),ne+=1}}for(let he=0;he<O;he++)for(let Fe=0;Fe<A;Fe++){const Qe=m+Fe+Z*he,at=m+Fe+Z*(he+1),ut=m+(Fe+1)+Z*(he+1),ft=m+(Fe+1)+Z*he;f.push(Qe,at,ft),f.push(at,ut,ft),Y+=6}l.addGroup(g,Y,M),g+=Y,m+=ne}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Va(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ra(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(it("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function pn(n){const e={};for(let t=0;t<n.length;t++){const i=ra(n[t]);for(const r in i)e[r]=i[r]}return e}function sm(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ku(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:_t.workingColorSpace}const om={clone:ra,merge:pn};var lm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,cm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class zn extends Xs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=lm,this.fragmentShader=cm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ra(e.uniforms),this.uniformsGroups=sm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class zu extends In{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Wt,this.projectionMatrix=new Wt,this.projectionMatrixInverse=new Wt,this.coordinateSystem=si,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const qi=new te,lf=new wt,cf=new wt;class Yn extends zu{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Nl*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(co*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Nl*2*Math.atan(Math.tan(co*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){qi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(qi.x,qi.y).multiplyScalar(-e/qi.z),qi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(qi.x,qi.y).multiplyScalar(-e/qi.z)}getViewSize(e,t){return this.getViewBounds(e,lf,cf),t.subVectors(cf,lf)}setViewOffset(e,t,i,r,a,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=a,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(co*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,a=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const f=o.fullWidth,u=o.fullHeight;a+=o.offsetX*r/f,t-=o.offsetY*i/u,r*=o.width/f,i*=o.height/u}const l=this.filmOffset;l!==0&&(a+=e*l/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Vr=-90,Hr=1;class fm extends In{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Yn(Vr,Hr,e,t);r.layers=this.layers,this.add(r);const a=new Yn(Vr,Hr,e,t);a.layers=this.layers,this.add(a);const o=new Yn(Vr,Hr,e,t);o.layers=this.layers,this.add(o);const l=new Yn(Vr,Hr,e,t);l.layers=this.layers,this.add(l);const f=new Yn(Vr,Hr,e,t);f.layers=this.layers,this.add(f);const u=new Yn(Vr,Hr,e,t);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,a,o,l,f]=t;for(const u of t)this.remove(u);if(e===si)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),l.up.set(0,1,0),l.lookAt(0,0,1),f.up.set(0,1,0),f.lookAt(0,0,-1);else if(e===Fs)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),l.up.set(0,-1,0),l.lookAt(0,0,1),f.up.set(0,-1,0),f.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const u of t)this.add(u),u.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[a,o,l,f,u,h]=this.children,p=e.getRenderTarget(),m=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),y=e.xr.enabled;e.xr.enabled=!1;const R=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,a),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,l),e.setRenderTarget(i,3,r),e.render(t,f),e.setRenderTarget(i,4,r),e.render(t,u),i.texture.generateMipmaps=R,e.setRenderTarget(i,5,r),e.render(t,h),e.setRenderTarget(p,m,g),e.xr.enabled=y,i.texture.needsPMREMUpdate=!0}}class Gu extends tn{constructor(e=[],t=na,i,r,a,o,l,f,u,h){super(e,t,i,r,a,o,l,f,u,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class um extends Ci{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Gu(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Va(5,5,5),a=new zn({name:"CubemapFromEquirect",uniforms:ra(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:bn,blending:$n});a.uniforms.tEquirect.value=t;const o=new fi(r,a),l=t.minFilter;return t.minFilter===pr&&(t.minFilter=Zt),new fm(1,10,this).update(e,o),t.minFilter=l,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){const a=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(a)}}class xs extends In{constructor(){super(),this.isGroup=!0,this.type="Group"}}const dm={type:"move"};class Lo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new xs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new xs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new te,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new te),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new xs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new te,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new te),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,a=null,o=null;const l=this._targetRay,f=this._grip,u=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(u&&e.hand){o=!0;for(const R of e.hand.values()){const S=t.getJointPose(R,i),x=this._getHandJoint(u,R);S!==null&&(x.matrix.fromArray(S.transform.matrix),x.matrix.decompose(x.position,x.rotation,x.scale),x.matrixWorldNeedsUpdate=!0,x.jointRadius=S.radius),x.visible=S!==null}const h=u.joints["index-finger-tip"],p=u.joints["thumb-tip"],m=h.position.distanceTo(p.position),g=.02,y=.005;u.inputState.pinching&&m>g+y?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&m<=g-y&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else f!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,i),a!==null&&(f.matrix.fromArray(a.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,a.linearVelocity?(f.hasLinearVelocity=!0,f.linearVelocity.copy(a.linearVelocity)):f.hasLinearVelocity=!1,a.angularVelocity?(f.hasAngularVelocity=!0,f.angularVelocity.copy(a.angularVelocity)):f.hasAngularVelocity=!1));l!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&a!==null&&(r=a),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,this.dispatchEvent(dm)))}return l!==null&&(l.visible=r!==null),f!==null&&(f.visible=a!==null),u!==null&&(u.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new xs;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class hm extends In{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Pi,this.environmentIntensity=1,this.environmentRotation=new Pi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Na extends tn{constructor(e=null,t=1,i=1,r,a,o,l,f,u=Ln,h=Ln,p,m){super(null,o,l,f,u,h,r,a,p,m),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Io=new te,pm=new te,mm=new ot;class fr{constructor(e=new te(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=Io.subVectors(i,t).cross(pm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Io),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return a<0||a>1?null:t.copy(e.start).addScaledVector(i,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||mm.getNormalMatrix(e),r=this.coplanarPoint(Io).applyMatrix4(e),a=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const or=new oc,gm=new wt(.5,.5),_s=new te;class Vu{constructor(e=new fr,t=new fr,i=new fr,r=new fr,a=new fr,o=new fr){this.planes=[e,t,i,r,a,o]}set(e,t,i,r,a,o){const l=this.planes;return l[0].copy(e),l[1].copy(t),l[2].copy(i),l[3].copy(r),l[4].copy(a),l[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=si,i=!1){const r=this.planes,a=e.elements,o=a[0],l=a[1],f=a[2],u=a[3],h=a[4],p=a[5],m=a[6],g=a[7],y=a[8],R=a[9],S=a[10],x=a[11],U=a[12],I=a[13],B=a[14],C=a[15];if(r[0].setComponents(u-o,g-h,x-y,C-U).normalize(),r[1].setComponents(u+o,g+h,x+y,C+U).normalize(),r[2].setComponents(u+l,g+p,x+R,C+I).normalize(),r[3].setComponents(u-l,g-p,x-R,C-I).normalize(),i)r[4].setComponents(f,m,S,B).normalize(),r[5].setComponents(u-f,g-m,x-S,C-B).normalize();else if(r[4].setComponents(u-f,g-m,x-S,C-B).normalize(),t===si)r[5].setComponents(u+f,g+m,x+S,C+B).normalize();else if(t===Fs)r[5].setComponents(f,m,S,B).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),or.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),or.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(or)}intersectsSprite(e){or.center.set(0,0,0);const t=gm.distanceTo(e.center);return or.radius=.7071067811865476+t,or.applyMatrix4(e.matrixWorld),this.intersectsSphere(or)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(_s.x=r.normal.x>0?e.max.x:e.min.x,_s.y=r.normal.y>0?e.max.y:e.min.y,_s.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(_s)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Hu extends tn{constructor(e,t,i=Qi,r,a,o,l=Ln,f=Ln,u,h=Ia,p=1){if(h!==Ia&&h!==Fa)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const m={width:e,height:t,depth:p};super(m,r,a,o,l,f,h,i,u),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new sc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Wu extends tn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class la extends er{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const a=e/2,o=t/2,l=Math.floor(i),f=Math.floor(r),u=l+1,h=f+1,p=e/l,m=t/f,g=[],y=[],R=[],S=[];for(let x=0;x<h;x++){const U=x*m-o;for(let I=0;I<u;I++){const B=I*p-a;y.push(B,-U,0),R.push(0,0,1),S.push(I/l),S.push(1-x/f)}}for(let x=0;x<f;x++)for(let U=0;U<l;U++){const I=U+u*x,B=U+u*(x+1),C=U+1+u*(x+1),E=U+1+u*x;g.push(I,B,E),g.push(B,C,E)}this.setIndex(g),this.setAttribute("position",new gr(y,3)),this.setAttribute("normal",new gr(R,3)),this.setAttribute("uv",new gr(S,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new la(e.width,e.height,e.widthSegments,e.heightSegments)}}class xm extends Xs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=T0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class _m extends Xs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Xu extends zu{constructor(e=-1,t=1,i=1,r=-1,a=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=a,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,a,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=a,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let a=i-e,o=i+e,l=r+t,f=r-t;if(this.view!==null&&this.view.enabled){const u=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=u*this.view.offsetX,o=a+u*this.view.width,l-=h*this.view.offsetY,f=l-h*this.view.height}this.projectionMatrix.makeOrthographic(a,o,l,f,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class vm extends Yn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function ff(n,e,t,i){const r=Sm(i);switch(t){case Cu:return n*e;case Du:return n*e/r.components*r.byteLength;case nc:return n*e/r.components*r.byteLength;case ic:return n*e*2/r.components*r.byteLength;case rc:return n*e*2/r.components*r.byteLength;case Pu:return n*e*3/r.components*r.byteLength;case xn:return n*e*4/r.components*r.byteLength;case ac:return n*e*4/r.components*r.byteLength;case Ms:case Ts:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case ws:case As:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case cl:case ul:return Math.max(n,16)*Math.max(e,8)/4;case ll:case fl:return Math.max(n,8)*Math.max(e,8)/2;case dl:case hl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case pl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case ml:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case gl:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case xl:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case _l:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case vl:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Sl:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case yl:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case bl:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case El:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Ml:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Tl:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case wl:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Al:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Rl:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Cl:case Pl:case Dl:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Ll:case Il:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Fl:case Ul:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Sm(n){switch(n){case kn:case Jl:return{byteLength:1,components:1};case Da:case Ql:case Ni:return{byteLength:2,components:1};case ec:case tc:return{byteLength:2,components:4};case Qi:case Ws:case Bn:return{byteLength:4,components:1};case Au:case Ru:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Zl}}));typeof window<"u"&&(window.__THREE__?it("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Zl);function qu(){let n=null,e=!1,t=null,i=null;function r(a,o){t(a,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(a){t=a},setContext:function(a){n=a}}}function ym(n){const e=new WeakMap;function t(l,f){const u=l.array,h=l.usage,p=u.byteLength,m=n.createBuffer();n.bindBuffer(f,m),n.bufferData(f,u,h),l.onUploadCallback();let g;if(u instanceof Float32Array)g=n.FLOAT;else if(typeof Float16Array<"u"&&u instanceof Float16Array)g=n.HALF_FLOAT;else if(u instanceof Uint16Array)l.isFloat16BufferAttribute?g=n.HALF_FLOAT:g=n.UNSIGNED_SHORT;else if(u instanceof Int16Array)g=n.SHORT;else if(u instanceof Uint32Array)g=n.UNSIGNED_INT;else if(u instanceof Int32Array)g=n.INT;else if(u instanceof Int8Array)g=n.BYTE;else if(u instanceof Uint8Array)g=n.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)g=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:m,type:g,bytesPerElement:u.BYTES_PER_ELEMENT,version:l.version,size:p}}function i(l,f,u){const h=f.array,p=f.updateRanges;if(n.bindBuffer(u,l),p.length===0)n.bufferSubData(u,0,h);else{p.sort((g,y)=>g.start-y.start);let m=0;for(let g=1;g<p.length;g++){const y=p[m],R=p[g];R.start<=y.start+y.count+1?y.count=Math.max(y.count,R.start+R.count-y.start):(++m,p[m]=R)}p.length=m+1;for(let g=0,y=p.length;g<y;g++){const R=p[g];n.bufferSubData(u,R.start*h.BYTES_PER_ELEMENT,h,R.start,R.count)}f.clearUpdateRanges()}f.onUploadCallback()}function r(l){return l.isInterleavedBufferAttribute&&(l=l.data),e.get(l)}function a(l){l.isInterleavedBufferAttribute&&(l=l.data);const f=e.get(l);f&&(n.deleteBuffer(f.buffer),e.delete(l))}function o(l,f){if(l.isInterleavedBufferAttribute&&(l=l.data),l.isGLBufferAttribute){const h=e.get(l);(!h||h.version<l.version)&&e.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}const u=e.get(l);if(u===void 0)e.set(l,t(l,f));else if(u.version<l.version){if(u.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(u.buffer,l,f),u.version=l.version}}return{get:r,remove:a,update:o}}var bm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Em=`#ifdef USE_ALPHAHASH
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
#endif`,Mm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Tm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Am=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Rm=`#ifdef USE_AOMAP
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
#endif`,Cm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Pm=`#ifdef USE_BATCHING
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
#endif`,Dm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Lm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Im=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Fm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Um=`#ifdef USE_IRIDESCENCE
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
#endif`,Nm=`#ifdef USE_BUMPMAP
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
#endif`,Om=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Bm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,km=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,zm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Gm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Vm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Hm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Wm=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Xm=`#define PI 3.141592653589793
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
} // validated`,qm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Ym=`vec3 transformedNormal = objectNormal;
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
#endif`,jm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,$m=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Km=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Zm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Jm="gl_FragColor = linearToOutputTexel( gl_FragColor );",Qm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,eg=`#ifdef USE_ENVMAP
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
#endif`,tg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,ng=`#ifdef USE_ENVMAP
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
#endif`,ig=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,rg=`#ifdef USE_ENVMAP
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
#endif`,ag=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,sg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,og=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,lg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,cg=`#ifdef USE_GRADIENTMAP
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
}`,fg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ug=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,dg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,hg=`uniform bool receiveShadow;
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
#endif`,pg=`#ifdef USE_ENVMAP
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
#endif`,mg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,gg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,xg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,_g=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,vg=`PhysicalMaterial material;
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
#endif`,Sg=`uniform sampler2D dfgLUT;
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
}`,yg=`
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
#endif`,bg=`#if defined( RE_IndirectDiffuse )
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
#endif`,Eg=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Mg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Tg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,wg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ag=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Rg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Cg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Pg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Dg=`#if defined( USE_POINTS_UV )
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
#endif`,Lg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ig=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Fg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ug=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ng=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Og=`#ifdef USE_MORPHTARGETS
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
#endif`,Bg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,kg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,zg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Gg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Wg=`#ifdef USE_NORMALMAP
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
#endif`,Xg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,qg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Yg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,jg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,$g=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Kg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Zg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Jg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ex=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,tx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,nx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ix=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,rx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ax=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,sx=`float getShadowMask() {
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
}`,ox=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,lx=`#ifdef USE_SKINNING
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
#endif`,cx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,fx=`#ifdef USE_SKINNING
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
#endif`,ux=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,dx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,hx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,px=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,mx=`#ifdef USE_TRANSMISSION
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
#endif`,gx=`#ifdef USE_TRANSMISSION
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
#endif`,xx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_x=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,vx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Sx=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const yx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,bx=`uniform sampler2D t2D;
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
}`,Ex=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mx=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Tx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,wx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ax=`#include <common>
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
}`,Rx=`#if DEPTH_PACKING == 3200
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
}`,Cx=`#define DISTANCE
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
}`,Px=`#define DISTANCE
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
}`,Dx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Lx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ix=`uniform float scale;
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
}`,Fx=`uniform vec3 diffuse;
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
}`,Ux=`#include <common>
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
}`,Nx=`uniform vec3 diffuse;
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
}`,Ox=`#define LAMBERT
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
}`,Bx=`#define LAMBERT
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
}`,kx=`#define MATCAP
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
}`,zx=`#define MATCAP
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
}`,Gx=`#define NORMAL
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
}`,Vx=`#define NORMAL
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
}`,Hx=`#define PHONG
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
}`,Wx=`#define PHONG
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
}`,Xx=`#define STANDARD
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
}`,qx=`#define STANDARD
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
}`,Yx=`#define TOON
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
}`,jx=`#define TOON
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
}`,$x=`uniform float size;
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
}`,Kx=`uniform vec3 diffuse;
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
}`,Zx=`#include <common>
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
}`,Jx=`uniform vec3 color;
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
}`,Qx=`uniform float rotation;
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
}`,e_=`uniform vec3 diffuse;
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
}`,lt={alphahash_fragment:bm,alphahash_pars_fragment:Em,alphamap_fragment:Mm,alphamap_pars_fragment:Tm,alphatest_fragment:wm,alphatest_pars_fragment:Am,aomap_fragment:Rm,aomap_pars_fragment:Cm,batching_pars_vertex:Pm,batching_vertex:Dm,begin_vertex:Lm,beginnormal_vertex:Im,bsdfs:Fm,iridescence_fragment:Um,bumpmap_pars_fragment:Nm,clipping_planes_fragment:Om,clipping_planes_pars_fragment:Bm,clipping_planes_pars_vertex:km,clipping_planes_vertex:zm,color_fragment:Gm,color_pars_fragment:Vm,color_pars_vertex:Hm,color_vertex:Wm,common:Xm,cube_uv_reflection_fragment:qm,defaultnormal_vertex:Ym,displacementmap_pars_vertex:jm,displacementmap_vertex:$m,emissivemap_fragment:Km,emissivemap_pars_fragment:Zm,colorspace_fragment:Jm,colorspace_pars_fragment:Qm,envmap_fragment:eg,envmap_common_pars_fragment:tg,envmap_pars_fragment:ng,envmap_pars_vertex:ig,envmap_physical_pars_fragment:pg,envmap_vertex:rg,fog_vertex:ag,fog_pars_vertex:sg,fog_fragment:og,fog_pars_fragment:lg,gradientmap_pars_fragment:cg,lightmap_pars_fragment:fg,lights_lambert_fragment:ug,lights_lambert_pars_fragment:dg,lights_pars_begin:hg,lights_toon_fragment:mg,lights_toon_pars_fragment:gg,lights_phong_fragment:xg,lights_phong_pars_fragment:_g,lights_physical_fragment:vg,lights_physical_pars_fragment:Sg,lights_fragment_begin:yg,lights_fragment_maps:bg,lights_fragment_end:Eg,logdepthbuf_fragment:Mg,logdepthbuf_pars_fragment:Tg,logdepthbuf_pars_vertex:wg,logdepthbuf_vertex:Ag,map_fragment:Rg,map_pars_fragment:Cg,map_particle_fragment:Pg,map_particle_pars_fragment:Dg,metalnessmap_fragment:Lg,metalnessmap_pars_fragment:Ig,morphinstance_vertex:Fg,morphcolor_vertex:Ug,morphnormal_vertex:Ng,morphtarget_pars_vertex:Og,morphtarget_vertex:Bg,normal_fragment_begin:kg,normal_fragment_maps:zg,normal_pars_fragment:Gg,normal_pars_vertex:Vg,normal_vertex:Hg,normalmap_pars_fragment:Wg,clearcoat_normal_fragment_begin:Xg,clearcoat_normal_fragment_maps:qg,clearcoat_pars_fragment:Yg,iridescence_pars_fragment:jg,opaque_fragment:$g,packing:Kg,premultiplied_alpha_fragment:Zg,project_vertex:Jg,dithering_fragment:Qg,dithering_pars_fragment:ex,roughnessmap_fragment:tx,roughnessmap_pars_fragment:nx,shadowmap_pars_fragment:ix,shadowmap_pars_vertex:rx,shadowmap_vertex:ax,shadowmask_pars_fragment:sx,skinbase_vertex:ox,skinning_pars_vertex:lx,skinning_vertex:cx,skinnormal_vertex:fx,specularmap_fragment:ux,specularmap_pars_fragment:dx,tonemapping_fragment:hx,tonemapping_pars_fragment:px,transmission_fragment:mx,transmission_pars_fragment:gx,uv_pars_fragment:xx,uv_pars_vertex:_x,uv_vertex:vx,worldpos_vertex:Sx,background_vert:yx,background_frag:bx,backgroundCube_vert:Ex,backgroundCube_frag:Mx,cube_vert:Tx,cube_frag:wx,depth_vert:Ax,depth_frag:Rx,distanceRGBA_vert:Cx,distanceRGBA_frag:Px,equirect_vert:Dx,equirect_frag:Lx,linedashed_vert:Ix,linedashed_frag:Fx,meshbasic_vert:Ux,meshbasic_frag:Nx,meshlambert_vert:Ox,meshlambert_frag:Bx,meshmatcap_vert:kx,meshmatcap_frag:zx,meshnormal_vert:Gx,meshnormal_frag:Vx,meshphong_vert:Hx,meshphong_frag:Wx,meshphysical_vert:Xx,meshphysical_frag:qx,meshtoon_vert:Yx,meshtoon_frag:jx,points_vert:$x,points_frag:Kx,shadow_vert:Zx,shadow_frag:Jx,sprite_vert:Qx,sprite_frag:e_},be={common:{diffuse:{value:new Tt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ot}},envmap:{envMap:{value:null},envMapRotation:{value:new ot},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ot},normalScale:{value:new wt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Tt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Tt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0},uvTransform:{value:new ot}},sprite:{diffuse:{value:new Tt(16777215)},opacity:{value:1},center:{value:new wt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}}},ii={basic:{uniforms:pn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:lt.meshbasic_vert,fragmentShader:lt.meshbasic_frag},lambert:{uniforms:pn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Tt(0)}}]),vertexShader:lt.meshlambert_vert,fragmentShader:lt.meshlambert_frag},phong:{uniforms:pn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Tt(0)},specular:{value:new Tt(1118481)},shininess:{value:30}}]),vertexShader:lt.meshphong_vert,fragmentShader:lt.meshphong_frag},standard:{uniforms:pn([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new Tt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag},toon:{uniforms:pn([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new Tt(0)}}]),vertexShader:lt.meshtoon_vert,fragmentShader:lt.meshtoon_frag},matcap:{uniforms:pn([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:lt.meshmatcap_vert,fragmentShader:lt.meshmatcap_frag},points:{uniforms:pn([be.points,be.fog]),vertexShader:lt.points_vert,fragmentShader:lt.points_frag},dashed:{uniforms:pn([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:lt.linedashed_vert,fragmentShader:lt.linedashed_frag},depth:{uniforms:pn([be.common,be.displacementmap]),vertexShader:lt.depth_vert,fragmentShader:lt.depth_frag},normal:{uniforms:pn([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:lt.meshnormal_vert,fragmentShader:lt.meshnormal_frag},sprite:{uniforms:pn([be.sprite,be.fog]),vertexShader:lt.sprite_vert,fragmentShader:lt.sprite_frag},background:{uniforms:{uvTransform:{value:new ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:lt.background_vert,fragmentShader:lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ot}},vertexShader:lt.backgroundCube_vert,fragmentShader:lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:lt.cube_vert,fragmentShader:lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:lt.equirect_vert,fragmentShader:lt.equirect_frag},distanceRGBA:{uniforms:pn([be.common,be.displacementmap,{referencePosition:{value:new te},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:lt.distanceRGBA_vert,fragmentShader:lt.distanceRGBA_frag},shadow:{uniforms:pn([be.lights,be.fog,{color:{value:new Tt(0)},opacity:{value:1}}]),vertexShader:lt.shadow_vert,fragmentShader:lt.shadow_frag}};ii.physical={uniforms:pn([ii.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ot},clearcoatNormalScale:{value:new wt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ot},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ot},sheen:{value:0},sheenColor:{value:new Tt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ot},transmissionSamplerSize:{value:new wt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ot},attenuationDistance:{value:0},attenuationColor:{value:new Tt(0)},specularColor:{value:new Tt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ot},anisotropyVector:{value:new wt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ot}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag};const vs={r:0,b:0,g:0},lr=new Pi,t_=new Wt;function n_(n,e,t,i,r,a,o){const l=new Tt(0);let f=a===!0?0:1,u,h,p=null,m=0,g=null;function y(I){let B=I.isScene===!0?I.background:null;return B&&B.isTexture&&(B=(I.backgroundBlurriness>0?t:e).get(B)),B}function R(I){let B=!1;const C=y(I);C===null?x(l,f):C&&C.isColor&&(x(C,1),B=!0);const E=n.xr.getEnvironmentBlendMode();E==="additive"?i.buffers.color.setClear(0,0,0,1,o):E==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||B)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function S(I,B){const C=y(B);C&&(C.isCubeTexture||C.mapping===Hs)?(h===void 0&&(h=new fi(new Va(1,1,1),new zn({name:"BackgroundCubeMaterial",uniforms:ra(ii.backgroundCube.uniforms),vertexShader:ii.backgroundCube.vertexShader,fragmentShader:ii.backgroundCube.fragmentShader,side:bn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(E,A,O){this.matrixWorld.copyPosition(O.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),lr.copy(B.backgroundRotation),lr.x*=-1,lr.y*=-1,lr.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(lr.y*=-1,lr.z*=-1),h.material.uniforms.envMap.value=C,h.material.uniforms.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=B.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=B.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(t_.makeRotationFromEuler(lr)),h.material.toneMapped=_t.getTransfer(C.colorSpace)!==Mt,(p!==C||m!==C.version||g!==n.toneMapping)&&(h.material.needsUpdate=!0,p=C,m=C.version,g=n.toneMapping),h.layers.enableAll(),I.unshift(h,h.geometry,h.material,0,0,null)):C&&C.isTexture&&(u===void 0&&(u=new fi(new la(2,2),new zn({name:"BackgroundMaterial",uniforms:ra(ii.background.uniforms),vertexShader:ii.background.vertexShader,fragmentShader:ii.background.fragmentShader,side:Ji,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(u)),u.material.uniforms.t2D.value=C,u.material.uniforms.backgroundIntensity.value=B.backgroundIntensity,u.material.toneMapped=_t.getTransfer(C.colorSpace)!==Mt,C.matrixAutoUpdate===!0&&C.updateMatrix(),u.material.uniforms.uvTransform.value.copy(C.matrix),(p!==C||m!==C.version||g!==n.toneMapping)&&(u.material.needsUpdate=!0,p=C,m=C.version,g=n.toneMapping),u.layers.enableAll(),I.unshift(u,u.geometry,u.material,0,0,null))}function x(I,B){I.getRGB(vs,ku(n)),i.buffers.color.setClear(vs.r,vs.g,vs.b,B,o)}function U(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0)}return{getClearColor:function(){return l},setClearColor:function(I,B=1){l.set(I),f=B,x(l,f)},getClearAlpha:function(){return f},setClearAlpha:function(I){f=I,x(l,f)},render:R,addToRenderList:S,dispose:U}}function i_(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=m(null);let a=r,o=!1;function l(v,F,L,V,X){let Z=!1;const $=p(V,L,F);a!==$&&(a=$,u(a.object)),Z=g(v,V,L,X),Z&&y(v,V,L,X),X!==null&&e.update(X,n.ELEMENT_ARRAY_BUFFER),(Z||o)&&(o=!1,B(v,F,L,V),X!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(X).buffer))}function f(){return n.createVertexArray()}function u(v){return n.bindVertexArray(v)}function h(v){return n.deleteVertexArray(v)}function p(v,F,L){const V=L.wireframe===!0;let X=i[v.id];X===void 0&&(X={},i[v.id]=X);let Z=X[F.id];Z===void 0&&(Z={},X[F.id]=Z);let $=Z[V];return $===void 0&&($=m(f()),Z[V]=$),$}function m(v){const F=[],L=[],V=[];for(let X=0;X<t;X++)F[X]=0,L[X]=0,V[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:L,attributeDivisors:V,object:v,attributes:{},index:null}}function g(v,F,L,V){const X=a.attributes,Z=F.attributes;let $=0;const ne=L.getAttributes();for(const Y in ne)if(ne[Y].location>=0){const he=X[Y];let Fe=Z[Y];if(Fe===void 0&&(Y==="instanceMatrix"&&v.instanceMatrix&&(Fe=v.instanceMatrix),Y==="instanceColor"&&v.instanceColor&&(Fe=v.instanceColor)),he===void 0||he.attribute!==Fe||Fe&&he.data!==Fe.data)return!0;$++}return a.attributesNum!==$||a.index!==V}function y(v,F,L,V){const X={},Z=F.attributes;let $=0;const ne=L.getAttributes();for(const Y in ne)if(ne[Y].location>=0){let he=Z[Y];he===void 0&&(Y==="instanceMatrix"&&v.instanceMatrix&&(he=v.instanceMatrix),Y==="instanceColor"&&v.instanceColor&&(he=v.instanceColor));const Fe={};Fe.attribute=he,he&&he.data&&(Fe.data=he.data),X[Y]=Fe,$++}a.attributes=X,a.attributesNum=$,a.index=V}function R(){const v=a.newAttributes;for(let F=0,L=v.length;F<L;F++)v[F]=0}function S(v){x(v,0)}function x(v,F){const L=a.newAttributes,V=a.enabledAttributes,X=a.attributeDivisors;L[v]=1,V[v]===0&&(n.enableVertexAttribArray(v),V[v]=1),X[v]!==F&&(n.vertexAttribDivisor(v,F),X[v]=F)}function U(){const v=a.newAttributes,F=a.enabledAttributes;for(let L=0,V=F.length;L<V;L++)F[L]!==v[L]&&(n.disableVertexAttribArray(L),F[L]=0)}function I(v,F,L,V,X,Z,$){$===!0?n.vertexAttribIPointer(v,F,L,X,Z):n.vertexAttribPointer(v,F,L,V,X,Z)}function B(v,F,L,V){R();const X=V.attributes,Z=L.getAttributes(),$=F.defaultAttributeValues;for(const ne in Z){const Y=Z[ne];if(Y.location>=0){let ue=X[ne];if(ue===void 0&&(ne==="instanceMatrix"&&v.instanceMatrix&&(ue=v.instanceMatrix),ne==="instanceColor"&&v.instanceColor&&(ue=v.instanceColor)),ue!==void 0){const he=ue.normalized,Fe=ue.itemSize,Qe=e.get(ue);if(Qe===void 0)continue;const at=Qe.buffer,ut=Qe.type,ft=Qe.bytesPerElement,se=ut===n.INT||ut===n.UNSIGNED_INT||ue.gpuType===Ws;if(ue.isInterleavedBufferAttribute){const le=ue.data,Ee=le.stride,je=ue.offset;if(le.isInstancedInterleavedBuffer){for(let Ne=0;Ne<Y.locationSize;Ne++)x(Y.location+Ne,le.meshPerAttribute);v.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Ne=0;Ne<Y.locationSize;Ne++)S(Y.location+Ne);n.bindBuffer(n.ARRAY_BUFFER,at);for(let Ne=0;Ne<Y.locationSize;Ne++)I(Y.location+Ne,Fe/Y.locationSize,ut,he,Ee*ft,(je+Fe/Y.locationSize*Ne)*ft,se)}else{if(ue.isInstancedBufferAttribute){for(let le=0;le<Y.locationSize;le++)x(Y.location+le,ue.meshPerAttribute);v.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=ue.meshPerAttribute*ue.count)}else for(let le=0;le<Y.locationSize;le++)S(Y.location+le);n.bindBuffer(n.ARRAY_BUFFER,at);for(let le=0;le<Y.locationSize;le++)I(Y.location+le,Fe/Y.locationSize,ut,he,Fe*ft,Fe/Y.locationSize*le*ft,se)}}else if($!==void 0){const he=$[ne];if(he!==void 0)switch(he.length){case 2:n.vertexAttrib2fv(Y.location,he);break;case 3:n.vertexAttrib3fv(Y.location,he);break;case 4:n.vertexAttrib4fv(Y.location,he);break;default:n.vertexAttrib1fv(Y.location,he)}}}}U()}function C(){O();for(const v in i){const F=i[v];for(const L in F){const V=F[L];for(const X in V)h(V[X].object),delete V[X];delete F[L]}delete i[v]}}function E(v){if(i[v.id]===void 0)return;const F=i[v.id];for(const L in F){const V=F[L];for(const X in V)h(V[X].object),delete V[X];delete F[L]}delete i[v.id]}function A(v){for(const F in i){const L=i[F];if(L[v.id]===void 0)continue;const V=L[v.id];for(const X in V)h(V[X].object),delete V[X];delete L[v.id]}}function O(){M(),o=!0,a!==r&&(a=r,u(a.object))}function M(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:l,reset:O,resetDefaultState:M,dispose:C,releaseStatesOfGeometry:E,releaseStatesOfProgram:A,initAttributes:R,enableAttribute:S,disableUnusedAttributes:U}}function r_(n,e,t){let i;function r(u){i=u}function a(u,h){n.drawArrays(i,u,h),t.update(h,i,1)}function o(u,h,p){p!==0&&(n.drawArraysInstanced(i,u,h,p),t.update(h,i,p))}function l(u,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,u,0,h,0,p);let g=0;for(let y=0;y<p;y++)g+=h[y];t.update(g,i,1)}function f(u,h,p,m){if(p===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let y=0;y<u.length;y++)o(u[y],h[y],m[y]);else{g.multiDrawArraysInstancedWEBGL(i,u,0,h,0,m,0,p);let y=0;for(let R=0;R<p;R++)y+=h[R]*m[R];t.update(y,i,1)}}this.setMode=r,this.render=a,this.renderInstances=o,this.renderMultiDraw=l,this.renderMultiDrawInstances=f}function a_(n,e,t,i){let r;function a(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(A){return!(A!==xn&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function l(A){const O=A===Ni&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==kn&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Bn&&!O)}function f(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=t.precision!==void 0?t.precision:"highp";const h=f(u);h!==u&&(it("WebGLRenderer:",u,"not supported, using",h,"instead."),u=h);const p=t.logarithmicDepthBuffer===!0,m=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),g=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),y=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),R=n.getParameter(n.MAX_TEXTURE_SIZE),S=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),x=n.getParameter(n.MAX_VERTEX_ATTRIBS),U=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),I=n.getParameter(n.MAX_VARYING_VECTORS),B=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),C=y>0,E=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:f,textureFormatReadable:o,textureTypeReadable:l,precision:u,logarithmicDepthBuffer:p,reversedDepthBuffer:m,maxTextures:g,maxVertexTextures:y,maxTextureSize:R,maxCubemapSize:S,maxAttributes:x,maxVertexUniforms:U,maxVaryings:I,maxFragmentUniforms:B,vertexTextures:C,maxSamples:E}}function s_(n){const e=this;let t=null,i=0,r=!1,a=!1;const o=new fr,l=new ot,f={value:null,needsUpdate:!1};this.uniform=f,this.numPlanes=0,this.numIntersection=0,this.init=function(p,m){const g=p.length!==0||m||i!==0||r;return r=m,i=p.length,g},this.beginShadows=function(){a=!0,h(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,m){t=h(p,m,0)},this.setState=function(p,m,g){const y=p.clippingPlanes,R=p.clipIntersection,S=p.clipShadows,x=n.get(p);if(!r||y===null||y.length===0||a&&!S)a?h(null):u();else{const U=a?0:i,I=U*4;let B=x.clippingState||null;f.value=B,B=h(y,m,I,g);for(let C=0;C!==I;++C)B[C]=t[C];x.clippingState=B,this.numIntersection=R?this.numPlanes:0,this.numPlanes+=U}};function u(){f.value!==t&&(f.value=t,f.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(p,m,g,y){const R=p!==null?p.length:0;let S=null;if(R!==0){if(S=f.value,y!==!0||S===null){const x=g+R*4,U=m.matrixWorldInverse;l.getNormalMatrix(U),(S===null||S.length<x)&&(S=new Float32Array(x));for(let I=0,B=g;I!==R;++I,B+=4)o.copy(p[I]).applyMatrix4(U,l),o.normal.toArray(S,B),S[B+3]=o.constant}f.value=S,f.needsUpdate=!0}return e.numPlanes=R,e.numIntersection=0,S}}function o_(n){let e=new WeakMap;function t(o,l){return l===al?o.mapping=na:l===sl&&(o.mapping=ia),o}function i(o){if(o&&o.isTexture){const l=o.mapping;if(l===al||l===sl)if(e.has(o)){const f=e.get(o).texture;return t(f,o.mapping)}else{const f=o.image;if(f&&f.height>0){const u=new um(f.height);return u.fromEquirectangularTexture(n,o),e.set(o,u),o.addEventListener("dispose",r),t(u.texture,o.mapping)}else return null}}return o}function r(o){const l=o.target;l.removeEventListener("dispose",r);const f=e.get(l);f!==void 0&&(e.delete(l),f.dispose())}function a(){e=new WeakMap}return{get:i,dispose:a}}const ji=4,uf=[.125,.215,.35,.446,.526,.582],dr=20,l_=256,_a=new Xu,df=new Tt;let Fo=null,Uo=0,No=0,Oo=!1;const c_=new te;class hf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,r=100,a={}){const{size:o=256,position:l=c_}=a;Fo=this._renderer.getRenderTarget(),Uo=this._renderer.getActiveCubeFace(),No=this._renderer.getActiveMipmapLevel(),Oo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const f=this._allocateTargets();return f.depthBuffer=!0,this._sceneToCubeUV(e,i,r,f,l),t>0&&this._blur(f,0,0,t),this._applyPMREM(f),this._cleanup(f),f}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=mf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Fo,Uo,No),this._renderer.xr.enabled=Oo,e.scissorTest=!1,Wr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===na||e.mapping===ia?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Fo=this._renderer.getRenderTarget(),Uo=this._renderer.getActiveCubeFace(),No=this._renderer.getActiveMipmapLevel(),Oo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Zt,minFilter:Zt,generateMipmaps:!1,type:Ni,format:xn,colorSpace:ci,depthBuffer:!1},r=pf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=pf(e,t,i);const{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=f_(a)),this._blurMaterial=d_(a,e,t),this._ggxMaterial=u_(a,e,t)}return r}_compileMaterial(e){const t=new fi(new er,e);this._renderer.compile(t,_a)}_sceneToCubeUV(e,t,i,r,a){const f=new Yn(90,1,t,i),u=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],p=this._renderer,m=p.autoClear,g=p.toneMapping;p.getClearColor(df),p.toneMapping=Ai,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(r),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new fi(new Va,new lc({name:"PMREM.Background",side:bn,depthWrite:!1,depthTest:!1})));const R=this._backgroundBox,S=R.material;let x=!1;const U=e.background;U?U.isColor&&(S.color.copy(U),e.background=null,x=!0):(S.color.copy(df),x=!0);for(let I=0;I<6;I++){const B=I%3;B===0?(f.up.set(0,u[I],0),f.position.set(a.x,a.y,a.z),f.lookAt(a.x+h[I],a.y,a.z)):B===1?(f.up.set(0,0,u[I]),f.position.set(a.x,a.y,a.z),f.lookAt(a.x,a.y+h[I],a.z)):(f.up.set(0,u[I],0),f.position.set(a.x,a.y,a.z),f.lookAt(a.x,a.y,a.z+h[I]));const C=this._cubeSize;Wr(r,B*C,I>2?C:0,C,C),p.setRenderTarget(r),x&&p.render(R,f),p.render(e,f)}p.toneMapping=g,p.autoClear=m,e.background=U}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===na||e.mapping===ia;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=gf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=mf());const a=r?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=a;const l=a.uniforms;l.envMap.value=e;const f=this._cubeSize;Wr(t,0,0,3*f,2*f),i.setRenderTarget(t),i.render(o,_a)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const r=this._lodMeshes.length;for(let a=1;a<r;a++)this._applyGGXFilter(e,a-1,a);t.autoClear=i}_applyGGXFilter(e,t,i){const r=this._renderer,a=this._pingPongRenderTarget,o=this._ggxMaterial,l=this._lodMeshes[i];l.material=o;const f=o.uniforms,u=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),p=Math.sqrt(u*u-h*h),m=.05+u*.95,g=p*m,{_lodMax:y}=this,R=this._sizeLods[i],S=3*R*(i>y-ji?i-y+ji:0),x=4*(this._cubeSize-R);f.envMap.value=e.texture,f.roughness.value=g,f.mipInt.value=y-t,Wr(a,S,x,3*R,2*R),r.setRenderTarget(a),r.render(l,_a),f.envMap.value=a.texture,f.roughness.value=0,f.mipInt.value=y-i,Wr(e,S,x,3*R,2*R),r.setRenderTarget(e),r.render(l,_a)}_blur(e,t,i,r,a){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",a),this._halfBlur(o,e,i,i,r,"longitudinal",a)}_halfBlur(e,t,i,r,a,o,l){const f=this._renderer,u=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&kt("blur direction must be either latitudinal or longitudinal!");const h=3,p=this._lodMeshes[r];p.material=u;const m=u.uniforms,g=this._sizeLods[i]-1,y=isFinite(a)?Math.PI/(2*g):2*Math.PI/(2*dr-1),R=a/y,S=isFinite(a)?1+Math.floor(h*R):dr;S>dr&&it(`sigmaRadians, ${a}, is too large and will clip, as it requested ${S} samples when the maximum is set to ${dr}`);const x=[];let U=0;for(let A=0;A<dr;++A){const O=A/R,M=Math.exp(-O*O/2);x.push(M),A===0?U+=M:A<S&&(U+=2*M)}for(let A=0;A<x.length;A++)x[A]=x[A]/U;m.envMap.value=e.texture,m.samples.value=S,m.weights.value=x,m.latitudinal.value=o==="latitudinal",l&&(m.poleAxis.value=l);const{_lodMax:I}=this;m.dTheta.value=y,m.mipInt.value=I-i;const B=this._sizeLods[r],C=3*B*(r>I-ji?r-I+ji:0),E=4*(this._cubeSize-B);Wr(t,C,E,3*B,2*B),f.setRenderTarget(t),f.render(p,_a)}}function f_(n){const e=[],t=[],i=[];let r=n;const a=n-ji+1+uf.length;for(let o=0;o<a;o++){const l=Math.pow(2,r);e.push(l);let f=1/l;o>n-ji?f=uf[o-n+ji-1]:o===0&&(f=0),t.push(f);const u=1/(l-2),h=-u,p=1+u,m=[h,h,p,h,p,p,h,h,p,p,h,p],g=6,y=6,R=3,S=2,x=1,U=new Float32Array(R*y*g),I=new Float32Array(S*y*g),B=new Float32Array(x*y*g);for(let E=0;E<g;E++){const A=E%3*2/3-1,O=E>2?0:-1,M=[A,O,0,A+2/3,O,0,A+2/3,O+1,0,A,O,0,A+2/3,O+1,0,A,O+1,0];U.set(M,R*y*E),I.set(m,S*y*E);const v=[E,E,E,E,E,E];B.set(v,x*y*E)}const C=new er;C.setAttribute("position",new oi(U,R)),C.setAttribute("uv",new oi(I,S)),C.setAttribute("faceIndex",new oi(B,x)),i.push(new fi(C,null)),r>ji&&r--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function pf(n,e,t){const i=new Ci(n,e,t);return i.texture.mapping=Hs,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Wr(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function u_(n,e,t){return new zn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:l_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:qs(),fragmentShader:`

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
		`,blending:$n,depthTest:!1,depthWrite:!1})}function d_(n,e,t){const i=new Float32Array(dr),r=new te(0,1,0);return new zn({name:"SphericalGaussianBlur",defines:{n:dr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:qs(),fragmentShader:`

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
		`,blending:$n,depthTest:!1,depthWrite:!1})}function mf(){return new zn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:qs(),fragmentShader:`

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
		`,blending:$n,depthTest:!1,depthWrite:!1})}function gf(){return new zn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qs(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:$n,depthTest:!1,depthWrite:!1})}function qs(){return`

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
	`}function h_(n){let e=new WeakMap,t=null;function i(l){if(l&&l.isTexture){const f=l.mapping,u=f===al||f===sl,h=f===na||f===ia;if(u||h){let p=e.get(l);const m=p!==void 0?p.texture.pmremVersion:0;if(l.isRenderTargetTexture&&l.pmremVersion!==m)return t===null&&(t=new hf(n)),p=u?t.fromEquirectangular(l,p):t.fromCubemap(l,p),p.texture.pmremVersion=l.pmremVersion,e.set(l,p),p.texture;if(p!==void 0)return p.texture;{const g=l.image;return u&&g&&g.height>0||h&&g&&r(g)?(t===null&&(t=new hf(n)),p=u?t.fromEquirectangular(l):t.fromCubemap(l),p.texture.pmremVersion=l.pmremVersion,e.set(l,p),l.addEventListener("dispose",a),p.texture):null}}}return l}function r(l){let f=0;const u=6;for(let h=0;h<u;h++)l[h]!==void 0&&f++;return f===u}function a(l){const f=l.target;f.removeEventListener("dispose",a);const u=e.get(f);u!==void 0&&(e.delete(f),u.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function p_(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const r=n.getExtension(i);return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const r=t(i);return r===null&&Ua("WebGLRenderer: "+i+" extension not supported."),r}}}function m_(n,e,t,i){const r={},a=new WeakMap;function o(p){const m=p.target;m.index!==null&&e.remove(m.index);for(const y in m.attributes)e.remove(m.attributes[y]);m.removeEventListener("dispose",o),delete r[m.id];const g=a.get(m);g&&(e.remove(g),a.delete(m)),i.releaseStatesOfGeometry(m),m.isInstancedBufferGeometry===!0&&delete m._maxInstanceCount,t.memory.geometries--}function l(p,m){return r[m.id]===!0||(m.addEventListener("dispose",o),r[m.id]=!0,t.memory.geometries++),m}function f(p){const m=p.attributes;for(const g in m)e.update(m[g],n.ARRAY_BUFFER)}function u(p){const m=[],g=p.index,y=p.attributes.position;let R=0;if(g!==null){const U=g.array;R=g.version;for(let I=0,B=U.length;I<B;I+=3){const C=U[I+0],E=U[I+1],A=U[I+2];m.push(C,E,E,A,A,C)}}else if(y!==void 0){const U=y.array;R=y.version;for(let I=0,B=U.length/3-1;I<B;I+=3){const C=I+0,E=I+1,A=I+2;m.push(C,E,E,A,A,C)}}else return;const S=new(Iu(m)?Bu:Ou)(m,1);S.version=R;const x=a.get(p);x&&e.remove(x),a.set(p,S)}function h(p){const m=a.get(p);if(m){const g=p.index;g!==null&&m.version<g.version&&u(p)}else u(p);return a.get(p)}return{get:l,update:f,getWireframeAttribute:h}}function g_(n,e,t){let i;function r(m){i=m}let a,o;function l(m){a=m.type,o=m.bytesPerElement}function f(m,g){n.drawElements(i,g,a,m*o),t.update(g,i,1)}function u(m,g,y){y!==0&&(n.drawElementsInstanced(i,g,a,m*o,y),t.update(g,i,y))}function h(m,g,y){if(y===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,g,0,a,m,0,y);let S=0;for(let x=0;x<y;x++)S+=g[x];t.update(S,i,1)}function p(m,g,y,R){if(y===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let x=0;x<m.length;x++)u(m[x]/o,g[x],R[x]);else{S.multiDrawElementsInstancedWEBGL(i,g,0,a,m,0,R,0,y);let x=0;for(let U=0;U<y;U++)x+=g[U]*R[U];t.update(x,i,1)}}this.setMode=r,this.setIndex=l,this.render=f,this.renderInstances=u,this.renderMultiDraw=h,this.renderMultiDrawInstances=p}function x_(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,o,l){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=l*(a/3);break;case n.LINES:t.lines+=l*(a/2);break;case n.LINE_STRIP:t.lines+=l*(a-1);break;case n.LINE_LOOP:t.lines+=l*a;break;case n.POINTS:t.points+=l*a;break;default:kt("WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function __(n,e,t){const i=new WeakMap,r=new zt;function a(o,l,f){const u=o.morphTargetInfluences,h=l.morphAttributes.position||l.morphAttributes.normal||l.morphAttributes.color,p=h!==void 0?h.length:0;let m=i.get(l);if(m===void 0||m.count!==p){let M=function(){A.dispose(),i.delete(l),l.removeEventListener("dispose",M)};m!==void 0&&m.texture.dispose();const g=l.morphAttributes.position!==void 0,y=l.morphAttributes.normal!==void 0,R=l.morphAttributes.color!==void 0,S=l.morphAttributes.position||[],x=l.morphAttributes.normal||[],U=l.morphAttributes.color||[];let I=0;g===!0&&(I=1),y===!0&&(I=2),R===!0&&(I=3);let B=l.attributes.position.count*I,C=1;B>e.maxTextureSize&&(C=Math.ceil(B/e.maxTextureSize),B=e.maxTextureSize);const E=new Float32Array(B*C*4*p),A=new Fu(E,B,C,p);A.type=Bn,A.needsUpdate=!0;const O=I*4;for(let v=0;v<p;v++){const F=S[v],L=x[v],V=U[v],X=B*C*4*v;for(let Z=0;Z<F.count;Z++){const $=Z*O;g===!0&&(r.fromBufferAttribute(F,Z),E[X+$+0]=r.x,E[X+$+1]=r.y,E[X+$+2]=r.z,E[X+$+3]=0),y===!0&&(r.fromBufferAttribute(L,Z),E[X+$+4]=r.x,E[X+$+5]=r.y,E[X+$+6]=r.z,E[X+$+7]=0),R===!0&&(r.fromBufferAttribute(V,Z),E[X+$+8]=r.x,E[X+$+9]=r.y,E[X+$+10]=r.z,E[X+$+11]=V.itemSize===4?r.w:1)}}m={count:p,texture:A,size:new wt(B,C)},i.set(l,m),l.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)f.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let g=0;for(let R=0;R<u.length;R++)g+=u[R];const y=l.morphTargetsRelative?1:1-g;f.getUniforms().setValue(n,"morphTargetBaseInfluence",y),f.getUniforms().setValue(n,"morphTargetInfluences",u)}f.getUniforms().setValue(n,"morphTargetsTexture",m.texture,t),f.getUniforms().setValue(n,"morphTargetsTextureSize",m.size)}return{update:a}}function v_(n,e,t,i){let r=new WeakMap;function a(f){const u=i.render.frame,h=f.geometry,p=e.get(f,h);if(r.get(p)!==u&&(e.update(p),r.set(p,u)),f.isInstancedMesh&&(f.hasEventListener("dispose",l)===!1&&f.addEventListener("dispose",l),r.get(f)!==u&&(t.update(f.instanceMatrix,n.ARRAY_BUFFER),f.instanceColor!==null&&t.update(f.instanceColor,n.ARRAY_BUFFER),r.set(f,u))),f.isSkinnedMesh){const m=f.skeleton;r.get(m)!==u&&(m.update(),r.set(m,u))}return p}function o(){r=new WeakMap}function l(f){const u=f.target;u.removeEventListener("dispose",l),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const Yu=new tn,xf=new Hu(1,1),ju=new Fu,$u=new W0,Ku=new Gu,_f=[],vf=[],Sf=new Float32Array(16),yf=new Float32Array(9),bf=new Float32Array(4);function ca(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let a=_f[r];if(a===void 0&&(a=new Float32Array(r),_f[r]=a),e!==0){i.toArray(a,0);for(let o=1,l=0;o!==e;++o)l+=t,n[o].toArray(a,l)}return a}function Xt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function qt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Ys(n,e){let t=vf[e];t===void 0&&(t=new Int32Array(e),vf[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function S_(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function y_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2fv(this.addr,e),qt(t,e)}}function b_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Xt(t,e))return;n.uniform3fv(this.addr,e),qt(t,e)}}function E_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4fv(this.addr,e),qt(t,e)}}function M_(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;bf.set(i),n.uniformMatrix2fv(this.addr,!1,bf),qt(t,i)}}function T_(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;yf.set(i),n.uniformMatrix3fv(this.addr,!1,yf),qt(t,i)}}function w_(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;Sf.set(i),n.uniformMatrix4fv(this.addr,!1,Sf),qt(t,i)}}function A_(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function R_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2iv(this.addr,e),qt(t,e)}}function C_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3iv(this.addr,e),qt(t,e)}}function P_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4iv(this.addr,e),qt(t,e)}}function D_(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function L_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2uiv(this.addr,e),qt(t,e)}}function I_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3uiv(this.addr,e),qt(t,e)}}function F_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4uiv(this.addr,e),qt(t,e)}}function U_(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let a;this.type===n.SAMPLER_2D_SHADOW?(xf.compareFunction=Lu,a=xf):a=Yu,t.setTexture2D(e||a,r)}function N_(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||$u,r)}function O_(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||Ku,r)}function B_(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||ju,r)}function k_(n){switch(n){case 5126:return S_;case 35664:return y_;case 35665:return b_;case 35666:return E_;case 35674:return M_;case 35675:return T_;case 35676:return w_;case 5124:case 35670:return A_;case 35667:case 35671:return R_;case 35668:case 35672:return C_;case 35669:case 35673:return P_;case 5125:return D_;case 36294:return L_;case 36295:return I_;case 36296:return F_;case 35678:case 36198:case 36298:case 36306:case 35682:return U_;case 35679:case 36299:case 36307:return N_;case 35680:case 36300:case 36308:case 36293:return O_;case 36289:case 36303:case 36311:case 36292:return B_}}function z_(n,e){n.uniform1fv(this.addr,e)}function G_(n,e){const t=ca(e,this.size,2);n.uniform2fv(this.addr,t)}function V_(n,e){const t=ca(e,this.size,3);n.uniform3fv(this.addr,t)}function H_(n,e){const t=ca(e,this.size,4);n.uniform4fv(this.addr,t)}function W_(n,e){const t=ca(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function X_(n,e){const t=ca(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function q_(n,e){const t=ca(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Y_(n,e){n.uniform1iv(this.addr,e)}function j_(n,e){n.uniform2iv(this.addr,e)}function $_(n,e){n.uniform3iv(this.addr,e)}function K_(n,e){n.uniform4iv(this.addr,e)}function Z_(n,e){n.uniform1uiv(this.addr,e)}function J_(n,e){n.uniform2uiv(this.addr,e)}function Q_(n,e){n.uniform3uiv(this.addr,e)}function ev(n,e){n.uniform4uiv(this.addr,e)}function tv(n,e,t){const i=this.cache,r=e.length,a=Ys(t,r);Xt(i,a)||(n.uniform1iv(this.addr,a),qt(i,a));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||Yu,a[o])}function nv(n,e,t){const i=this.cache,r=e.length,a=Ys(t,r);Xt(i,a)||(n.uniform1iv(this.addr,a),qt(i,a));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||$u,a[o])}function iv(n,e,t){const i=this.cache,r=e.length,a=Ys(t,r);Xt(i,a)||(n.uniform1iv(this.addr,a),qt(i,a));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Ku,a[o])}function rv(n,e,t){const i=this.cache,r=e.length,a=Ys(t,r);Xt(i,a)||(n.uniform1iv(this.addr,a),qt(i,a));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||ju,a[o])}function av(n){switch(n){case 5126:return z_;case 35664:return G_;case 35665:return V_;case 35666:return H_;case 35674:return W_;case 35675:return X_;case 35676:return q_;case 5124:case 35670:return Y_;case 35667:case 35671:return j_;case 35668:case 35672:return $_;case 35669:case 35673:return K_;case 5125:return Z_;case 36294:return J_;case 36295:return Q_;case 36296:return ev;case 35678:case 36198:case 36298:case 36306:case 35682:return tv;case 35679:case 36299:case 36307:return nv;case 35680:case 36300:case 36308:case 36293:return iv;case 36289:case 36303:case 36311:case 36292:return rv}}class sv{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=k_(t.type)}}class ov{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=av(t.type)}}class lv{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let a=0,o=r.length;a!==o;++a){const l=r[a];l.setValue(e,t[l.id],i)}}}const Bo=/(\w+)(\])?(\[|\.)?/g;function Ef(n,e){n.seq.push(e),n.map[e.id]=e}function cv(n,e,t){const i=n.name,r=i.length;for(Bo.lastIndex=0;;){const a=Bo.exec(i),o=Bo.lastIndex;let l=a[1];const f=a[2]==="]",u=a[3];if(f&&(l=l|0),u===void 0||u==="["&&o+2===r){Ef(t,u===void 0?new sv(l,n,e):new ov(l,n,e));break}else{let p=t.map[l];p===void 0&&(p=new lv(l),Ef(t,p)),t=p}}}class Rs{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const a=e.getActiveUniform(t,r),o=e.getUniformLocation(t,a.name);cv(a,o,this)}}setValue(e,t,i,r){const a=this.map[t];a!==void 0&&a.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let a=0,o=t.length;a!==o;++a){const l=t[a],f=i[l.id];f.needsUpdate!==!1&&l.setValue(e,f.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,a=e.length;r!==a;++r){const o=e[r];o.id in t&&i.push(o)}return i}}function Mf(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const fv=37297;let uv=0;function dv(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),a=Math.min(e+6,t.length);for(let o=r;o<a;o++){const l=o+1;i.push(`${l===e?">":" "} ${l}: ${t[o]}`)}return i.join(`
`)}const Tf=new ot;function hv(n){_t._getMatrix(Tf,_t.workingColorSpace,n);const e=`mat3( ${Tf.elements.map(t=>t.toFixed(4))} )`;switch(_t.getTransfer(n)){case Is:return[e,"LinearTransferOETF"];case Mt:return[e,"sRGBTransferOETF"];default:return it("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function wf(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),a=(n.getShaderInfoLog(e)||"").trim();if(i&&a==="")return"";const o=/ERROR: 0:(\d+)/.exec(a);if(o){const l=parseInt(o[1]);return t.toUpperCase()+`

`+a+`

`+dv(n.getShaderSource(e),l)}else return a}function pv(n,e){const t=hv(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function mv(n,e){let t;switch(e){case il:t="Linear";break;case Tu:t="Reinhard";break;case wu:t="Cineon";break;case rl:t="ACESFilmic";break;case b0:t="AgX";break;case E0:t="Neutral";break;case y0:t="Custom";break;default:it("WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ss=new te;function gv(){_t.getLuminanceCoefficients(Ss);const n=Ss.x.toFixed(4),e=Ss.y.toFixed(4),t=Ss.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function xv(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ea).join(`
`)}function _v(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function vv(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const a=n.getActiveAttrib(e,r),o=a.name;let l=1;a.type===n.FLOAT_MAT2&&(l=2),a.type===n.FLOAT_MAT3&&(l=3),a.type===n.FLOAT_MAT4&&(l=4),t[o]={type:a.type,location:n.getAttribLocation(e,o),locationSize:l}}return t}function Ea(n){return n!==""}function Af(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Rf(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Sv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ol(n){return n.replace(Sv,bv)}const yv=new Map;function bv(n,e){let t=lt[e];if(t===void 0){const i=yv.get(e);if(i!==void 0)t=lt[i],it('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Ol(t)}const Ev=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Cf(n){return n.replace(Ev,Mv)}function Mv(n,e,t,i){let r="";for(let a=parseInt(e);a<parseInt(t);a++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return r}function Pf(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}function Tv(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Eu?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===e0?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===yi&&(e="SHADOWMAP_TYPE_VSM"),e}function wv(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case na:case ia:e="ENVMAP_TYPE_CUBE";break;case Hs:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Av(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case ia:e="ENVMAP_MODE_REFRACTION";break}return e}function Rv(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Mu:e="ENVMAP_BLENDING_MULTIPLY";break;case v0:e="ENVMAP_BLENDING_MIX";break;case S0:e="ENVMAP_BLENDING_ADD";break}return e}function Cv(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Pv(n,e,t,i){const r=n.getContext(),a=t.defines;let o=t.vertexShader,l=t.fragmentShader;const f=Tv(t),u=wv(t),h=Av(t),p=Rv(t),m=Cv(t),g=xv(t),y=_v(a),R=r.createProgram();let S,x,U=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(S=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y].filter(Ea).join(`
`),S.length>0&&(S+=`
`),x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y].filter(Ea).join(`
`),x.length>0&&(x+=`
`)):(S=[Pf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+f:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ea).join(`
`),x=[Pf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",t.envMap?"#define "+p:"",m?"#define CUBEUV_TEXEL_WIDTH "+m.texelWidth:"",m?"#define CUBEUV_TEXEL_HEIGHT "+m.texelHeight:"",m?"#define CUBEUV_MAX_MIP "+m.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+f:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ai?"#define TONE_MAPPING":"",t.toneMapping!==Ai?lt.tonemapping_pars_fragment:"",t.toneMapping!==Ai?mv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",lt.colorspace_pars_fragment,pv("linearToOutputTexel",t.outputColorSpace),gv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ea).join(`
`)),o=Ol(o),o=Af(o,t),o=Rf(o,t),l=Ol(l),l=Af(l,t),l=Rf(l,t),o=Cf(o),l=Cf(l),t.isRawShaderMaterial!==!0&&(U=`#version 300 es
`,S=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+S,x=["#define varying in",t.glslVersion===Wc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Wc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+x);const I=U+S+o,B=U+x+l,C=Mf(r,r.VERTEX_SHADER,I),E=Mf(r,r.FRAGMENT_SHADER,B);r.attachShader(R,C),r.attachShader(R,E),t.index0AttributeName!==void 0?r.bindAttribLocation(R,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(R,0,"position"),r.linkProgram(R);function A(F){if(n.debug.checkShaderErrors){const L=r.getProgramInfoLog(R)||"",V=r.getShaderInfoLog(C)||"",X=r.getShaderInfoLog(E)||"",Z=L.trim(),$=V.trim(),ne=X.trim();let Y=!0,ue=!0;if(r.getProgramParameter(R,r.LINK_STATUS)===!1)if(Y=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,R,C,E);else{const he=wf(r,C,"vertex"),Fe=wf(r,E,"fragment");kt("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(R,r.VALIDATE_STATUS)+`

Material Name: `+F.name+`
Material Type: `+F.type+`

Program Info Log: `+Z+`
`+he+`
`+Fe)}else Z!==""?it("WebGLProgram: Program Info Log:",Z):($===""||ne==="")&&(ue=!1);ue&&(F.diagnostics={runnable:Y,programLog:Z,vertexShader:{log:$,prefix:S},fragmentShader:{log:ne,prefix:x}})}r.deleteShader(C),r.deleteShader(E),O=new Rs(r,R),M=vv(r,R)}let O;this.getUniforms=function(){return O===void 0&&A(this),O};let M;this.getAttributes=function(){return M===void 0&&A(this),M};let v=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=r.getProgramParameter(R,fv)),v},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(R),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=uv++,this.cacheKey=e,this.usedTimes=1,this.program=R,this.vertexShader=C,this.fragmentShader=E,this}let Dv=0;class Lv{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),a=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(a)===!1&&(o.add(a),a.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Iv(e),t.set(e,i)),i}}class Iv{constructor(e){this.id=Dv++,this.code=e,this.usedTimes=0}}function Fv(n,e,t,i,r,a,o){const l=new Uu,f=new Lv,u=new Set,h=[],p=r.logarithmicDepthBuffer,m=r.vertexTextures;let g=r.precision;const y={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function R(M){return u.add(M),M===0?"uv":`uv${M}`}function S(M,v,F,L,V){const X=L.fog,Z=V.geometry,$=M.isMeshStandardMaterial?L.environment:null,ne=(M.isMeshStandardMaterial?t:e).get(M.envMap||$),Y=ne&&ne.mapping===Hs?ne.image.height:null,ue=y[M.type];M.precision!==null&&(g=r.getMaxPrecision(M.precision),g!==M.precision&&it("WebGLProgram.getParameters:",M.precision,"not supported, using",g,"instead."));const he=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Fe=he!==void 0?he.length:0;let Qe=0;Z.morphAttributes.position!==void 0&&(Qe=1),Z.morphAttributes.normal!==void 0&&(Qe=2),Z.morphAttributes.color!==void 0&&(Qe=3);let at,ut,ft,se;if(ue){const mt=ii[ue];at=mt.vertexShader,ut=mt.fragmentShader}else at=M.vertexShader,ut=M.fragmentShader,f.update(M),ft=f.getVertexShaderID(M),se=f.getFragmentShaderID(M);const le=n.getRenderTarget(),Ee=n.state.buffers.depth.getReversed(),je=V.isInstancedMesh===!0,Ne=V.isBatchedMesh===!0,nt=!!M.map,Ct=!!M.matcap,_e=!!ne,Ze=!!M.aoMap,k=!!M.lightMap,Ye=!!M.bumpMap,He=!!M.normalMap,st=!!M.displacementMap,Se=!!M.emissiveMap,ht=!!M.metalnessMap,Le=!!M.roughnessMap,We=M.anisotropy>0,D=M.clearcoat>0,T=M.dispersion>0,j=M.iridescence>0,ie=M.sheen>0,ae=M.transmission>0,Q=We&&!!M.anisotropyMap,Oe=D&&!!M.clearcoatMap,ve=D&&!!M.clearcoatNormalMap,Ve=D&&!!M.clearcoatRoughnessMap,Ue=j&&!!M.iridescenceMap,ce=j&&!!M.iridescenceThicknessMap,re=ie&&!!M.sheenColorMap,Re=ie&&!!M.sheenRoughnessMap,Ie=!!M.specularMap,Me=!!M.specularColorMap,Be=!!M.specularIntensityMap,G=ae&&!!M.transmissionMap,ye=ae&&!!M.thicknessMap,xe=!!M.gradientMap,ge=!!M.alphaMap,de=M.alphaTest>0,oe=!!M.alphaHash,Te=!!M.extensions;let et=Ai;M.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(et=n.toneMapping);const At={shaderID:ue,shaderType:M.type,shaderName:M.name,vertexShader:at,fragmentShader:ut,defines:M.defines,customVertexShaderID:ft,customFragmentShaderID:se,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:g,batching:Ne,batchingColor:Ne&&V._colorsTexture!==null,instancing:je,instancingColor:je&&V.instanceColor!==null,instancingMorph:je&&V.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:le===null?n.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:ci,alphaToCoverage:!!M.alphaToCoverage,map:nt,matcap:Ct,envMap:_e,envMapMode:_e&&ne.mapping,envMapCubeUVHeight:Y,aoMap:Ze,lightMap:k,bumpMap:Ye,normalMap:He,displacementMap:m&&st,emissiveMap:Se,normalMapObjectSpace:He&&M.normalMapType===R0,normalMapTangentSpace:He&&M.normalMapType===A0,metalnessMap:ht,roughnessMap:Le,anisotropy:We,anisotropyMap:Q,clearcoat:D,clearcoatMap:Oe,clearcoatNormalMap:ve,clearcoatRoughnessMap:Ve,dispersion:T,iridescence:j,iridescenceMap:Ue,iridescenceThicknessMap:ce,sheen:ie,sheenColorMap:re,sheenRoughnessMap:Re,specularMap:Ie,specularColorMap:Me,specularIntensityMap:Be,transmission:ae,transmissionMap:G,thicknessMap:ye,gradientMap:xe,opaque:M.transparent===!1&&M.blending===Kr&&M.alphaToCoverage===!1,alphaMap:ge,alphaTest:de,alphaHash:oe,combine:M.combine,mapUv:nt&&R(M.map.channel),aoMapUv:Ze&&R(M.aoMap.channel),lightMapUv:k&&R(M.lightMap.channel),bumpMapUv:Ye&&R(M.bumpMap.channel),normalMapUv:He&&R(M.normalMap.channel),displacementMapUv:st&&R(M.displacementMap.channel),emissiveMapUv:Se&&R(M.emissiveMap.channel),metalnessMapUv:ht&&R(M.metalnessMap.channel),roughnessMapUv:Le&&R(M.roughnessMap.channel),anisotropyMapUv:Q&&R(M.anisotropyMap.channel),clearcoatMapUv:Oe&&R(M.clearcoatMap.channel),clearcoatNormalMapUv:ve&&R(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ve&&R(M.clearcoatRoughnessMap.channel),iridescenceMapUv:Ue&&R(M.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&R(M.iridescenceThicknessMap.channel),sheenColorMapUv:re&&R(M.sheenColorMap.channel),sheenRoughnessMapUv:Re&&R(M.sheenRoughnessMap.channel),specularMapUv:Ie&&R(M.specularMap.channel),specularColorMapUv:Me&&R(M.specularColorMap.channel),specularIntensityMapUv:Be&&R(M.specularIntensityMap.channel),transmissionMapUv:G&&R(M.transmissionMap.channel),thicknessMapUv:ye&&R(M.thicknessMap.channel),alphaMapUv:ge&&R(M.alphaMap.channel),vertexTangents:!!Z.attributes.tangent&&(He||We),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,pointsUvs:V.isPoints===!0&&!!Z.attributes.uv&&(nt||ge),fog:!!X,useFog:M.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:Ee,skinning:V.isSkinnedMesh===!0,morphTargets:Z.morphAttributes.position!==void 0,morphNormals:Z.morphAttributes.normal!==void 0,morphColors:Z.morphAttributes.color!==void 0,morphTargetsCount:Fe,morphTextureStride:Qe,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:n.shadowMap.enabled&&F.length>0,shadowMapType:n.shadowMap.type,toneMapping:et,decodeVideoTexture:nt&&M.map.isVideoTexture===!0&&_t.getTransfer(M.map.colorSpace)===Mt,decodeVideoTextureEmissive:Se&&M.emissiveMap.isVideoTexture===!0&&_t.getTransfer(M.emissiveMap.colorSpace)===Mt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Ei,flipSided:M.side===bn,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Te&&M.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Te&&M.extensions.multiDraw===!0||Ne)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return At.vertexUv1s=u.has(1),At.vertexUv2s=u.has(2),At.vertexUv3s=u.has(3),u.clear(),At}function x(M){const v=[];if(M.shaderID?v.push(M.shaderID):(v.push(M.customVertexShaderID),v.push(M.customFragmentShaderID)),M.defines!==void 0)for(const F in M.defines)v.push(F),v.push(M.defines[F]);return M.isRawShaderMaterial===!1&&(U(v,M),I(v,M),v.push(n.outputColorSpace)),v.push(M.customProgramCacheKey),v.join()}function U(M,v){M.push(v.precision),M.push(v.outputColorSpace),M.push(v.envMapMode),M.push(v.envMapCubeUVHeight),M.push(v.mapUv),M.push(v.alphaMapUv),M.push(v.lightMapUv),M.push(v.aoMapUv),M.push(v.bumpMapUv),M.push(v.normalMapUv),M.push(v.displacementMapUv),M.push(v.emissiveMapUv),M.push(v.metalnessMapUv),M.push(v.roughnessMapUv),M.push(v.anisotropyMapUv),M.push(v.clearcoatMapUv),M.push(v.clearcoatNormalMapUv),M.push(v.clearcoatRoughnessMapUv),M.push(v.iridescenceMapUv),M.push(v.iridescenceThicknessMapUv),M.push(v.sheenColorMapUv),M.push(v.sheenRoughnessMapUv),M.push(v.specularMapUv),M.push(v.specularColorMapUv),M.push(v.specularIntensityMapUv),M.push(v.transmissionMapUv),M.push(v.thicknessMapUv),M.push(v.combine),M.push(v.fogExp2),M.push(v.sizeAttenuation),M.push(v.morphTargetsCount),M.push(v.morphAttributeCount),M.push(v.numDirLights),M.push(v.numPointLights),M.push(v.numSpotLights),M.push(v.numSpotLightMaps),M.push(v.numHemiLights),M.push(v.numRectAreaLights),M.push(v.numDirLightShadows),M.push(v.numPointLightShadows),M.push(v.numSpotLightShadows),M.push(v.numSpotLightShadowsWithMaps),M.push(v.numLightProbes),M.push(v.shadowMapType),M.push(v.toneMapping),M.push(v.numClippingPlanes),M.push(v.numClipIntersection),M.push(v.depthPacking)}function I(M,v){l.disableAll(),v.supportsVertexTextures&&l.enable(0),v.instancing&&l.enable(1),v.instancingColor&&l.enable(2),v.instancingMorph&&l.enable(3),v.matcap&&l.enable(4),v.envMap&&l.enable(5),v.normalMapObjectSpace&&l.enable(6),v.normalMapTangentSpace&&l.enable(7),v.clearcoat&&l.enable(8),v.iridescence&&l.enable(9),v.alphaTest&&l.enable(10),v.vertexColors&&l.enable(11),v.vertexAlphas&&l.enable(12),v.vertexUv1s&&l.enable(13),v.vertexUv2s&&l.enable(14),v.vertexUv3s&&l.enable(15),v.vertexTangents&&l.enable(16),v.anisotropy&&l.enable(17),v.alphaHash&&l.enable(18),v.batching&&l.enable(19),v.dispersion&&l.enable(20),v.batchingColor&&l.enable(21),v.gradientMap&&l.enable(22),M.push(l.mask),l.disableAll(),v.fog&&l.enable(0),v.useFog&&l.enable(1),v.flatShading&&l.enable(2),v.logarithmicDepthBuffer&&l.enable(3),v.reversedDepthBuffer&&l.enable(4),v.skinning&&l.enable(5),v.morphTargets&&l.enable(6),v.morphNormals&&l.enable(7),v.morphColors&&l.enable(8),v.premultipliedAlpha&&l.enable(9),v.shadowMapEnabled&&l.enable(10),v.doubleSided&&l.enable(11),v.flipSided&&l.enable(12),v.useDepthPacking&&l.enable(13),v.dithering&&l.enable(14),v.transmission&&l.enable(15),v.sheen&&l.enable(16),v.opaque&&l.enable(17),v.pointsUvs&&l.enable(18),v.decodeVideoTexture&&l.enable(19),v.decodeVideoTextureEmissive&&l.enable(20),v.alphaToCoverage&&l.enable(21),M.push(l.mask)}function B(M){const v=y[M.type];let F;if(v){const L=ii[v];F=om.clone(L.uniforms)}else F=M.uniforms;return F}function C(M,v){let F;for(let L=0,V=h.length;L<V;L++){const X=h[L];if(X.cacheKey===v){F=X,++F.usedTimes;break}}return F===void 0&&(F=new Pv(n,v,M,a),h.push(F)),F}function E(M){if(--M.usedTimes===0){const v=h.indexOf(M);h[v]=h[h.length-1],h.pop(),M.destroy()}}function A(M){f.remove(M)}function O(){f.dispose()}return{getParameters:S,getProgramCacheKey:x,getUniforms:B,acquireProgram:C,releaseProgram:E,releaseShaderCache:A,programs:h,dispose:O}}function Uv(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let l=n.get(o);return l===void 0&&(l={},n.set(o,l)),l}function i(o){n.delete(o)}function r(o,l,f){n.get(o)[l]=f}function a(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:a}}function Nv(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Df(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Lf(){const n=[];let e=0;const t=[],i=[],r=[];function a(){e=0,t.length=0,i.length=0,r.length=0}function o(p,m,g,y,R,S){let x=n[e];return x===void 0?(x={id:p.id,object:p,geometry:m,material:g,groupOrder:y,renderOrder:p.renderOrder,z:R,group:S},n[e]=x):(x.id=p.id,x.object=p,x.geometry=m,x.material=g,x.groupOrder=y,x.renderOrder=p.renderOrder,x.z=R,x.group=S),e++,x}function l(p,m,g,y,R,S){const x=o(p,m,g,y,R,S);g.transmission>0?i.push(x):g.transparent===!0?r.push(x):t.push(x)}function f(p,m,g,y,R,S){const x=o(p,m,g,y,R,S);g.transmission>0?i.unshift(x):g.transparent===!0?r.unshift(x):t.unshift(x)}function u(p,m){t.length>1&&t.sort(p||Nv),i.length>1&&i.sort(m||Df),r.length>1&&r.sort(m||Df)}function h(){for(let p=e,m=n.length;p<m;p++){const g=n[p];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:r,init:a,push:l,unshift:f,finish:h,sort:u}}function Ov(){let n=new WeakMap;function e(i,r){const a=n.get(i);let o;return a===void 0?(o=new Lf,n.set(i,[o])):r>=a.length?(o=new Lf,a.push(o)):o=a[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function Bv(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new te,color:new Tt};break;case"SpotLight":t={position:new te,direction:new te,color:new Tt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new te,color:new Tt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new te,skyColor:new Tt,groundColor:new Tt};break;case"RectAreaLight":t={color:new Tt,position:new te,halfWidth:new te,halfHeight:new te};break}return n[e.id]=t,t}}}function kv(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new wt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new wt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new wt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let zv=0;function Gv(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Vv(n){const e=new Bv,t=kv(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)i.probe.push(new te);const r=new te,a=new Wt,o=new Wt;function l(u){let h=0,p=0,m=0;for(let M=0;M<9;M++)i.probe[M].set(0,0,0);let g=0,y=0,R=0,S=0,x=0,U=0,I=0,B=0,C=0,E=0,A=0;u.sort(Gv);for(let M=0,v=u.length;M<v;M++){const F=u[M],L=F.color,V=F.intensity,X=F.distance,Z=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)h+=L.r*V,p+=L.g*V,m+=L.b*V;else if(F.isLightProbe){for(let $=0;$<9;$++)i.probe[$].addScaledVector(F.sh.coefficients[$],V);A++}else if(F.isDirectionalLight){const $=e.get(F);if($.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const ne=F.shadow,Y=t.get(F);Y.shadowIntensity=ne.intensity,Y.shadowBias=ne.bias,Y.shadowNormalBias=ne.normalBias,Y.shadowRadius=ne.radius,Y.shadowMapSize=ne.mapSize,i.directionalShadow[g]=Y,i.directionalShadowMap[g]=Z,i.directionalShadowMatrix[g]=F.shadow.matrix,U++}i.directional[g]=$,g++}else if(F.isSpotLight){const $=e.get(F);$.position.setFromMatrixPosition(F.matrixWorld),$.color.copy(L).multiplyScalar(V),$.distance=X,$.coneCos=Math.cos(F.angle),$.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),$.decay=F.decay,i.spot[R]=$;const ne=F.shadow;if(F.map&&(i.spotLightMap[C]=F.map,C++,ne.updateMatrices(F),F.castShadow&&E++),i.spotLightMatrix[R]=ne.matrix,F.castShadow){const Y=t.get(F);Y.shadowIntensity=ne.intensity,Y.shadowBias=ne.bias,Y.shadowNormalBias=ne.normalBias,Y.shadowRadius=ne.radius,Y.shadowMapSize=ne.mapSize,i.spotShadow[R]=Y,i.spotShadowMap[R]=Z,B++}R++}else if(F.isRectAreaLight){const $=e.get(F);$.color.copy(L).multiplyScalar(V),$.halfWidth.set(F.width*.5,0,0),$.halfHeight.set(0,F.height*.5,0),i.rectArea[S]=$,S++}else if(F.isPointLight){const $=e.get(F);if($.color.copy(F.color).multiplyScalar(F.intensity),$.distance=F.distance,$.decay=F.decay,F.castShadow){const ne=F.shadow,Y=t.get(F);Y.shadowIntensity=ne.intensity,Y.shadowBias=ne.bias,Y.shadowNormalBias=ne.normalBias,Y.shadowRadius=ne.radius,Y.shadowMapSize=ne.mapSize,Y.shadowCameraNear=ne.camera.near,Y.shadowCameraFar=ne.camera.far,i.pointShadow[y]=Y,i.pointShadowMap[y]=Z,i.pointShadowMatrix[y]=F.shadow.matrix,I++}i.point[y]=$,y++}else if(F.isHemisphereLight){const $=e.get(F);$.skyColor.copy(F.color).multiplyScalar(V),$.groundColor.copy(F.groundColor).multiplyScalar(V),i.hemi[x]=$,x++}}S>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=be.LTC_FLOAT_1,i.rectAreaLTC2=be.LTC_FLOAT_2):(i.rectAreaLTC1=be.LTC_HALF_1,i.rectAreaLTC2=be.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=p,i.ambient[2]=m;const O=i.hash;(O.directionalLength!==g||O.pointLength!==y||O.spotLength!==R||O.rectAreaLength!==S||O.hemiLength!==x||O.numDirectionalShadows!==U||O.numPointShadows!==I||O.numSpotShadows!==B||O.numSpotMaps!==C||O.numLightProbes!==A)&&(i.directional.length=g,i.spot.length=R,i.rectArea.length=S,i.point.length=y,i.hemi.length=x,i.directionalShadow.length=U,i.directionalShadowMap.length=U,i.pointShadow.length=I,i.pointShadowMap.length=I,i.spotShadow.length=B,i.spotShadowMap.length=B,i.directionalShadowMatrix.length=U,i.pointShadowMatrix.length=I,i.spotLightMatrix.length=B+C-E,i.spotLightMap.length=C,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=A,O.directionalLength=g,O.pointLength=y,O.spotLength=R,O.rectAreaLength=S,O.hemiLength=x,O.numDirectionalShadows=U,O.numPointShadows=I,O.numSpotShadows=B,O.numSpotMaps=C,O.numLightProbes=A,i.version=zv++)}function f(u,h){let p=0,m=0,g=0,y=0,R=0;const S=h.matrixWorldInverse;for(let x=0,U=u.length;x<U;x++){const I=u[x];if(I.isDirectionalLight){const B=i.directional[p];B.direction.setFromMatrixPosition(I.matrixWorld),r.setFromMatrixPosition(I.target.matrixWorld),B.direction.sub(r),B.direction.transformDirection(S),p++}else if(I.isSpotLight){const B=i.spot[g];B.position.setFromMatrixPosition(I.matrixWorld),B.position.applyMatrix4(S),B.direction.setFromMatrixPosition(I.matrixWorld),r.setFromMatrixPosition(I.target.matrixWorld),B.direction.sub(r),B.direction.transformDirection(S),g++}else if(I.isRectAreaLight){const B=i.rectArea[y];B.position.setFromMatrixPosition(I.matrixWorld),B.position.applyMatrix4(S),o.identity(),a.copy(I.matrixWorld),a.premultiply(S),o.extractRotation(a),B.halfWidth.set(I.width*.5,0,0),B.halfHeight.set(0,I.height*.5,0),B.halfWidth.applyMatrix4(o),B.halfHeight.applyMatrix4(o),y++}else if(I.isPointLight){const B=i.point[m];B.position.setFromMatrixPosition(I.matrixWorld),B.position.applyMatrix4(S),m++}else if(I.isHemisphereLight){const B=i.hemi[R];B.direction.setFromMatrixPosition(I.matrixWorld),B.direction.transformDirection(S),R++}}}return{setup:l,setupView:f,state:i}}function If(n){const e=new Vv(n),t=[],i=[];function r(h){u.camera=h,t.length=0,i.length=0}function a(h){t.push(h)}function o(h){i.push(h)}function l(){e.setup(t)}function f(h){e.setupView(t,h)}const u={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:u,setupLights:l,setupLightsView:f,pushLight:a,pushShadow:o}}function Hv(n){let e=new WeakMap;function t(r,a=0){const o=e.get(r);let l;return o===void 0?(l=new If(n),e.set(r,[l])):a>=o.length?(l=new If(n),o.push(l)):l=o[a],l}function i(){e=new WeakMap}return{get:t,dispose:i}}const Wv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Xv=`uniform sampler2D shadow_pass;
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
}`;function qv(n,e,t){let i=new Vu;const r=new wt,a=new wt,o=new zt,l=new xm({depthPacking:w0}),f=new _m,u={},h=t.maxTextureSize,p={[Ji]:bn,[bn]:Ji,[Ei]:Ei},m=new zn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new wt},radius:{value:4}},vertexShader:Wv,fragmentShader:Xv}),g=m.clone();g.defines.HORIZONTAL_PASS=1;const y=new er;y.setAttribute("position",new oi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const R=new fi(y,m),S=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Eu;let x=this.type;this.render=function(E,A,O){if(S.enabled===!1||S.autoUpdate===!1&&S.needsUpdate===!1||E.length===0)return;const M=n.getRenderTarget(),v=n.getActiveCubeFace(),F=n.getActiveMipmapLevel(),L=n.state;L.setBlending($n),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const V=x!==yi&&this.type===yi,X=x===yi&&this.type!==yi;for(let Z=0,$=E.length;Z<$;Z++){const ne=E[Z],Y=ne.shadow;if(Y===void 0){it("WebGLShadowMap:",ne,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;r.copy(Y.mapSize);const ue=Y.getFrameExtents();if(r.multiply(ue),a.copy(Y.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(a.x=Math.floor(h/ue.x),r.x=a.x*ue.x,Y.mapSize.x=a.x),r.y>h&&(a.y=Math.floor(h/ue.y),r.y=a.y*ue.y,Y.mapSize.y=a.y)),Y.map===null||V===!0||X===!0){const Fe=this.type!==yi?{minFilter:Ln,magFilter:Ln}:{};Y.map!==null&&Y.map.dispose(),Y.map=new Ci(r.x,r.y,Fe),Y.map.texture.name=ne.name+".shadowMap",Y.camera.updateProjectionMatrix()}n.setRenderTarget(Y.map),n.clear();const he=Y.getViewportCount();for(let Fe=0;Fe<he;Fe++){const Qe=Y.getViewport(Fe);o.set(a.x*Qe.x,a.y*Qe.y,a.x*Qe.z,a.y*Qe.w),L.viewport(o),Y.updateMatrices(ne,Fe),i=Y.getFrustum(),B(A,O,Y.camera,ne,this.type)}Y.isPointLightShadow!==!0&&this.type===yi&&U(Y,O),Y.needsUpdate=!1}x=this.type,S.needsUpdate=!1,n.setRenderTarget(M,v,F)};function U(E,A){const O=e.update(R);m.defines.VSM_SAMPLES!==E.blurSamples&&(m.defines.VSM_SAMPLES=E.blurSamples,g.defines.VSM_SAMPLES=E.blurSamples,m.needsUpdate=!0,g.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new Ci(r.x,r.y)),m.uniforms.shadow_pass.value=E.map.texture,m.uniforms.resolution.value=E.mapSize,m.uniforms.radius.value=E.radius,n.setRenderTarget(E.mapPass),n.clear(),n.renderBufferDirect(A,null,O,m,R,null),g.uniforms.shadow_pass.value=E.mapPass.texture,g.uniforms.resolution.value=E.mapSize,g.uniforms.radius.value=E.radius,n.setRenderTarget(E.map),n.clear(),n.renderBufferDirect(A,null,O,g,R,null)}function I(E,A,O,M){let v=null;const F=O.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(F!==void 0)v=F;else if(v=O.isPointLight===!0?f:l,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const L=v.uuid,V=A.uuid;let X=u[L];X===void 0&&(X={},u[L]=X);let Z=X[V];Z===void 0&&(Z=v.clone(),X[V]=Z,A.addEventListener("dispose",C)),v=Z}if(v.visible=A.visible,v.wireframe=A.wireframe,M===yi?v.side=A.shadowSide!==null?A.shadowSide:A.side:v.side=A.shadowSide!==null?A.shadowSide:p[A.side],v.alphaMap=A.alphaMap,v.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,v.map=A.map,v.clipShadows=A.clipShadows,v.clippingPlanes=A.clippingPlanes,v.clipIntersection=A.clipIntersection,v.displacementMap=A.displacementMap,v.displacementScale=A.displacementScale,v.displacementBias=A.displacementBias,v.wireframeLinewidth=A.wireframeLinewidth,v.linewidth=A.linewidth,O.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const L=n.properties.get(v);L.light=O}return v}function B(E,A,O,M,v){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&v===yi)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,E.matrixWorld);const V=e.update(E),X=E.material;if(Array.isArray(X)){const Z=V.groups;for(let $=0,ne=Z.length;$<ne;$++){const Y=Z[$],ue=X[Y.materialIndex];if(ue&&ue.visible){const he=I(E,ue,M,v);E.onBeforeShadow(n,E,A,O,V,he,Y),n.renderBufferDirect(O,null,V,he,E,Y),E.onAfterShadow(n,E,A,O,V,he,Y)}}}else if(X.visible){const Z=I(E,X,M,v);E.onBeforeShadow(n,E,A,O,V,Z,null),n.renderBufferDirect(O,null,V,Z,E,null),E.onAfterShadow(n,E,A,O,V,Z,null)}}const L=E.children;for(let V=0,X=L.length;V<X;V++)B(L[V],A,O,M,v)}function C(E){E.target.removeEventListener("dispose",C);for(const O in u){const M=u[O],v=E.target.uuid;v in M&&(M[v].dispose(),delete M[v])}}}const Yv={[Ko]:Zo,[Jo]:tl,[Qo]:nl,[ta]:el,[Zo]:Ko,[tl]:Jo,[nl]:Qo,[el]:ta};function jv(n,e){function t(){let G=!1;const ye=new zt;let xe=null;const ge=new zt(0,0,0,0);return{setMask:function(de){xe!==de&&!G&&(n.colorMask(de,de,de,de),xe=de)},setLocked:function(de){G=de},setClear:function(de,oe,Te,et,At){At===!0&&(de*=et,oe*=et,Te*=et),ye.set(de,oe,Te,et),ge.equals(ye)===!1&&(n.clearColor(de,oe,Te,et),ge.copy(ye))},reset:function(){G=!1,xe=null,ge.set(-1,0,0,0)}}}function i(){let G=!1,ye=!1,xe=null,ge=null,de=null;return{setReversed:function(oe){if(ye!==oe){const Te=e.get("EXT_clip_control");oe?Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.ZERO_TO_ONE_EXT):Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.NEGATIVE_ONE_TO_ONE_EXT),ye=oe;const et=de;de=null,this.setClear(et)}},getReversed:function(){return ye},setTest:function(oe){oe?le(n.DEPTH_TEST):Ee(n.DEPTH_TEST)},setMask:function(oe){xe!==oe&&!G&&(n.depthMask(oe),xe=oe)},setFunc:function(oe){if(ye&&(oe=Yv[oe]),ge!==oe){switch(oe){case Ko:n.depthFunc(n.NEVER);break;case Zo:n.depthFunc(n.ALWAYS);break;case Jo:n.depthFunc(n.LESS);break;case ta:n.depthFunc(n.LEQUAL);break;case Qo:n.depthFunc(n.EQUAL);break;case el:n.depthFunc(n.GEQUAL);break;case tl:n.depthFunc(n.GREATER);break;case nl:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ge=oe}},setLocked:function(oe){G=oe},setClear:function(oe){de!==oe&&(ye&&(oe=1-oe),n.clearDepth(oe),de=oe)},reset:function(){G=!1,xe=null,ge=null,de=null,ye=!1}}}function r(){let G=!1,ye=null,xe=null,ge=null,de=null,oe=null,Te=null,et=null,At=null;return{setTest:function(mt){G||(mt?le(n.STENCIL_TEST):Ee(n.STENCIL_TEST))},setMask:function(mt){ye!==mt&&!G&&(n.stencilMask(mt),ye=mt)},setFunc:function(mt,Mn,fn){(xe!==mt||ge!==Mn||de!==fn)&&(n.stencilFunc(mt,Mn,fn),xe=mt,ge=Mn,de=fn)},setOp:function(mt,Mn,fn){(oe!==mt||Te!==Mn||et!==fn)&&(n.stencilOp(mt,Mn,fn),oe=mt,Te=Mn,et=fn)},setLocked:function(mt){G=mt},setClear:function(mt){At!==mt&&(n.clearStencil(mt),At=mt)},reset:function(){G=!1,ye=null,xe=null,ge=null,de=null,oe=null,Te=null,et=null,At=null}}}const a=new t,o=new i,l=new r,f=new WeakMap,u=new WeakMap;let h={},p={},m=new WeakMap,g=[],y=null,R=!1,S=null,x=null,U=null,I=null,B=null,C=null,E=null,A=new Tt(0,0,0),O=0,M=!1,v=null,F=null,L=null,V=null,X=null;const Z=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let $=!1,ne=0;const Y=n.getParameter(n.VERSION);Y.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(Y)[1]),$=ne>=1):Y.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),$=ne>=2);let ue=null,he={};const Fe=n.getParameter(n.SCISSOR_BOX),Qe=n.getParameter(n.VIEWPORT),at=new zt().fromArray(Fe),ut=new zt().fromArray(Qe);function ft(G,ye,xe,ge){const de=new Uint8Array(4),oe=n.createTexture();n.bindTexture(G,oe),n.texParameteri(G,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(G,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Te=0;Te<xe;Te++)G===n.TEXTURE_3D||G===n.TEXTURE_2D_ARRAY?n.texImage3D(ye,0,n.RGBA,1,1,ge,0,n.RGBA,n.UNSIGNED_BYTE,de):n.texImage2D(ye+Te,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,de);return oe}const se={};se[n.TEXTURE_2D]=ft(n.TEXTURE_2D,n.TEXTURE_2D,1),se[n.TEXTURE_CUBE_MAP]=ft(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[n.TEXTURE_2D_ARRAY]=ft(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),se[n.TEXTURE_3D]=ft(n.TEXTURE_3D,n.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),l.setClear(0),le(n.DEPTH_TEST),o.setFunc(ta),Ye(!1),He(Bc),le(n.CULL_FACE),Ze($n);function le(G){h[G]!==!0&&(n.enable(G),h[G]=!0)}function Ee(G){h[G]!==!1&&(n.disable(G),h[G]=!1)}function je(G,ye){return p[G]!==ye?(n.bindFramebuffer(G,ye),p[G]=ye,G===n.DRAW_FRAMEBUFFER&&(p[n.FRAMEBUFFER]=ye),G===n.FRAMEBUFFER&&(p[n.DRAW_FRAMEBUFFER]=ye),!0):!1}function Ne(G,ye){let xe=g,ge=!1;if(G){xe=m.get(ye),xe===void 0&&(xe=[],m.set(ye,xe));const de=G.textures;if(xe.length!==de.length||xe[0]!==n.COLOR_ATTACHMENT0){for(let oe=0,Te=de.length;oe<Te;oe++)xe[oe]=n.COLOR_ATTACHMENT0+oe;xe.length=de.length,ge=!0}}else xe[0]!==n.BACK&&(xe[0]=n.BACK,ge=!0);ge&&n.drawBuffers(xe)}function nt(G){return y!==G?(n.useProgram(G),y=G,!0):!1}const Ct={[ur]:n.FUNC_ADD,[n0]:n.FUNC_SUBTRACT,[i0]:n.FUNC_REVERSE_SUBTRACT};Ct[r0]=n.MIN,Ct[a0]=n.MAX;const _e={[s0]:n.ZERO,[o0]:n.ONE,[l0]:n.SRC_COLOR,[jo]:n.SRC_ALPHA,[p0]:n.SRC_ALPHA_SATURATE,[d0]:n.DST_COLOR,[f0]:n.DST_ALPHA,[c0]:n.ONE_MINUS_SRC_COLOR,[$o]:n.ONE_MINUS_SRC_ALPHA,[h0]:n.ONE_MINUS_DST_COLOR,[u0]:n.ONE_MINUS_DST_ALPHA,[m0]:n.CONSTANT_COLOR,[g0]:n.ONE_MINUS_CONSTANT_COLOR,[x0]:n.CONSTANT_ALPHA,[_0]:n.ONE_MINUS_CONSTANT_ALPHA};function Ze(G,ye,xe,ge,de,oe,Te,et,At,mt){if(G===$n){R===!0&&(Ee(n.BLEND),R=!1);return}if(R===!1&&(le(n.BLEND),R=!0),G!==t0){if(G!==S||mt!==M){if((x!==ur||B!==ur)&&(n.blendEquation(n.FUNC_ADD),x=ur,B=ur),mt)switch(G){case Kr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case kc:n.blendFunc(n.ONE,n.ONE);break;case zc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Gc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:kt("WebGLState: Invalid blending: ",G);break}else switch(G){case Kr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case kc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case zc:kt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Gc:kt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:kt("WebGLState: Invalid blending: ",G);break}U=null,I=null,C=null,E=null,A.set(0,0,0),O=0,S=G,M=mt}return}de=de||ye,oe=oe||xe,Te=Te||ge,(ye!==x||de!==B)&&(n.blendEquationSeparate(Ct[ye],Ct[de]),x=ye,B=de),(xe!==U||ge!==I||oe!==C||Te!==E)&&(n.blendFuncSeparate(_e[xe],_e[ge],_e[oe],_e[Te]),U=xe,I=ge,C=oe,E=Te),(et.equals(A)===!1||At!==O)&&(n.blendColor(et.r,et.g,et.b,At),A.copy(et),O=At),S=G,M=!1}function k(G,ye){G.side===Ei?Ee(n.CULL_FACE):le(n.CULL_FACE);let xe=G.side===bn;ye&&(xe=!xe),Ye(xe),G.blending===Kr&&G.transparent===!1?Ze($n):Ze(G.blending,G.blendEquation,G.blendSrc,G.blendDst,G.blendEquationAlpha,G.blendSrcAlpha,G.blendDstAlpha,G.blendColor,G.blendAlpha,G.premultipliedAlpha),o.setFunc(G.depthFunc),o.setTest(G.depthTest),o.setMask(G.depthWrite),a.setMask(G.colorWrite);const ge=G.stencilWrite;l.setTest(ge),ge&&(l.setMask(G.stencilWriteMask),l.setFunc(G.stencilFunc,G.stencilRef,G.stencilFuncMask),l.setOp(G.stencilFail,G.stencilZFail,G.stencilZPass)),Se(G.polygonOffset,G.polygonOffsetFactor,G.polygonOffsetUnits),G.alphaToCoverage===!0?le(n.SAMPLE_ALPHA_TO_COVERAGE):Ee(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ye(G){v!==G&&(G?n.frontFace(n.CW):n.frontFace(n.CCW),v=G)}function He(G){G!==Jp?(le(n.CULL_FACE),G!==F&&(G===Bc?n.cullFace(n.BACK):G===Qp?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ee(n.CULL_FACE),F=G}function st(G){G!==L&&($&&n.lineWidth(G),L=G)}function Se(G,ye,xe){G?(le(n.POLYGON_OFFSET_FILL),(V!==ye||X!==xe)&&(n.polygonOffset(ye,xe),V=ye,X=xe)):Ee(n.POLYGON_OFFSET_FILL)}function ht(G){G?le(n.SCISSOR_TEST):Ee(n.SCISSOR_TEST)}function Le(G){G===void 0&&(G=n.TEXTURE0+Z-1),ue!==G&&(n.activeTexture(G),ue=G)}function We(G,ye,xe){xe===void 0&&(ue===null?xe=n.TEXTURE0+Z-1:xe=ue);let ge=he[xe];ge===void 0&&(ge={type:void 0,texture:void 0},he[xe]=ge),(ge.type!==G||ge.texture!==ye)&&(ue!==xe&&(n.activeTexture(xe),ue=xe),n.bindTexture(G,ye||se[G]),ge.type=G,ge.texture=ye)}function D(){const G=he[ue];G!==void 0&&G.type!==void 0&&(n.bindTexture(G.type,null),G.type=void 0,G.texture=void 0)}function T(){try{n.compressedTexImage2D(...arguments)}catch(G){G("WebGLState:",G)}}function j(){try{n.compressedTexImage3D(...arguments)}catch(G){G("WebGLState:",G)}}function ie(){try{n.texSubImage2D(...arguments)}catch(G){G("WebGLState:",G)}}function ae(){try{n.texSubImage3D(...arguments)}catch(G){G("WebGLState:",G)}}function Q(){try{n.compressedTexSubImage2D(...arguments)}catch(G){G("WebGLState:",G)}}function Oe(){try{n.compressedTexSubImage3D(...arguments)}catch(G){G("WebGLState:",G)}}function ve(){try{n.texStorage2D(...arguments)}catch(G){G("WebGLState:",G)}}function Ve(){try{n.texStorage3D(...arguments)}catch(G){G("WebGLState:",G)}}function Ue(){try{n.texImage2D(...arguments)}catch(G){G("WebGLState:",G)}}function ce(){try{n.texImage3D(...arguments)}catch(G){G("WebGLState:",G)}}function re(G){at.equals(G)===!1&&(n.scissor(G.x,G.y,G.z,G.w),at.copy(G))}function Re(G){ut.equals(G)===!1&&(n.viewport(G.x,G.y,G.z,G.w),ut.copy(G))}function Ie(G,ye){let xe=u.get(ye);xe===void 0&&(xe=new WeakMap,u.set(ye,xe));let ge=xe.get(G);ge===void 0&&(ge=n.getUniformBlockIndex(ye,G.name),xe.set(G,ge))}function Me(G,ye){const ge=u.get(ye).get(G);f.get(ye)!==ge&&(n.uniformBlockBinding(ye,ge,G.__bindingPointIndex),f.set(ye,ge))}function Be(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},ue=null,he={},p={},m=new WeakMap,g=[],y=null,R=!1,S=null,x=null,U=null,I=null,B=null,C=null,E=null,A=new Tt(0,0,0),O=0,M=!1,v=null,F=null,L=null,V=null,X=null,at.set(0,0,n.canvas.width,n.canvas.height),ut.set(0,0,n.canvas.width,n.canvas.height),a.reset(),o.reset(),l.reset()}return{buffers:{color:a,depth:o,stencil:l},enable:le,disable:Ee,bindFramebuffer:je,drawBuffers:Ne,useProgram:nt,setBlending:Ze,setMaterial:k,setFlipSided:Ye,setCullFace:He,setLineWidth:st,setPolygonOffset:Se,setScissorTest:ht,activeTexture:Le,bindTexture:We,unbindTexture:D,compressedTexImage2D:T,compressedTexImage3D:j,texImage2D:Ue,texImage3D:ce,updateUBOMapping:Ie,uniformBlockBinding:Me,texStorage2D:ve,texStorage3D:Ve,texSubImage2D:ie,texSubImage3D:ae,compressedTexSubImage2D:Q,compressedTexSubImage3D:Oe,scissor:re,viewport:Re,reset:Be}}function $v(n,e,t,i,r,a,o){const l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,f=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new wt,h=new WeakMap;let p;const m=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(D,T){return g?new OffscreenCanvas(D,T):Us("canvas")}function R(D,T,j){let ie=1;const ae=We(D);if((ae.width>j||ae.height>j)&&(ie=j/Math.max(ae.width,ae.height)),ie<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const Q=Math.floor(ie*ae.width),Oe=Math.floor(ie*ae.height);p===void 0&&(p=y(Q,Oe));const ve=T?y(Q,Oe):p;return ve.width=Q,ve.height=Oe,ve.getContext("2d").drawImage(D,0,0,Q,Oe),it("WebGLRenderer: Texture has been resized from ("+ae.width+"x"+ae.height+") to ("+Q+"x"+Oe+")."),ve}else return"data"in D&&it("WebGLRenderer: Image in DataTexture is too big ("+ae.width+"x"+ae.height+")."),D;return D}function S(D){return D.generateMipmaps}function x(D){n.generateMipmap(D)}function U(D){return D.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?n.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function I(D,T,j,ie,ae=!1){if(D!==null){if(n[D]!==void 0)return n[D];it("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let Q=T;if(T===n.RED&&(j===n.FLOAT&&(Q=n.R32F),j===n.HALF_FLOAT&&(Q=n.R16F),j===n.UNSIGNED_BYTE&&(Q=n.R8)),T===n.RED_INTEGER&&(j===n.UNSIGNED_BYTE&&(Q=n.R8UI),j===n.UNSIGNED_SHORT&&(Q=n.R16UI),j===n.UNSIGNED_INT&&(Q=n.R32UI),j===n.BYTE&&(Q=n.R8I),j===n.SHORT&&(Q=n.R16I),j===n.INT&&(Q=n.R32I)),T===n.RG&&(j===n.FLOAT&&(Q=n.RG32F),j===n.HALF_FLOAT&&(Q=n.RG16F),j===n.UNSIGNED_BYTE&&(Q=n.RG8)),T===n.RG_INTEGER&&(j===n.UNSIGNED_BYTE&&(Q=n.RG8UI),j===n.UNSIGNED_SHORT&&(Q=n.RG16UI),j===n.UNSIGNED_INT&&(Q=n.RG32UI),j===n.BYTE&&(Q=n.RG8I),j===n.SHORT&&(Q=n.RG16I),j===n.INT&&(Q=n.RG32I)),T===n.RGB_INTEGER&&(j===n.UNSIGNED_BYTE&&(Q=n.RGB8UI),j===n.UNSIGNED_SHORT&&(Q=n.RGB16UI),j===n.UNSIGNED_INT&&(Q=n.RGB32UI),j===n.BYTE&&(Q=n.RGB8I),j===n.SHORT&&(Q=n.RGB16I),j===n.INT&&(Q=n.RGB32I)),T===n.RGBA_INTEGER&&(j===n.UNSIGNED_BYTE&&(Q=n.RGBA8UI),j===n.UNSIGNED_SHORT&&(Q=n.RGBA16UI),j===n.UNSIGNED_INT&&(Q=n.RGBA32UI),j===n.BYTE&&(Q=n.RGBA8I),j===n.SHORT&&(Q=n.RGBA16I),j===n.INT&&(Q=n.RGBA32I)),T===n.RGB&&(j===n.UNSIGNED_INT_5_9_9_9_REV&&(Q=n.RGB9_E5),j===n.UNSIGNED_INT_10F_11F_11F_REV&&(Q=n.R11F_G11F_B10F)),T===n.RGBA){const Oe=ae?Is:_t.getTransfer(ie);j===n.FLOAT&&(Q=n.RGBA32F),j===n.HALF_FLOAT&&(Q=n.RGBA16F),j===n.UNSIGNED_BYTE&&(Q=Oe===Mt?n.SRGB8_ALPHA8:n.RGBA8),j===n.UNSIGNED_SHORT_4_4_4_4&&(Q=n.RGBA4),j===n.UNSIGNED_SHORT_5_5_5_1&&(Q=n.RGB5_A1)}return(Q===n.R16F||Q===n.R32F||Q===n.RG16F||Q===n.RG32F||Q===n.RGBA16F||Q===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function B(D,T){let j;return D?T===null||T===Qi||T===La?j=n.DEPTH24_STENCIL8:T===Bn?j=n.DEPTH32F_STENCIL8:T===Da&&(j=n.DEPTH24_STENCIL8,it("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===Qi||T===La?j=n.DEPTH_COMPONENT24:T===Bn?j=n.DEPTH_COMPONENT32F:T===Da&&(j=n.DEPTH_COMPONENT16),j}function C(D,T){return S(D)===!0||D.isFramebufferTexture&&D.minFilter!==Ln&&D.minFilter!==Zt?Math.log2(Math.max(T.width,T.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?T.mipmaps.length:1}function E(D){const T=D.target;T.removeEventListener("dispose",E),O(T),T.isVideoTexture&&h.delete(T)}function A(D){const T=D.target;T.removeEventListener("dispose",A),v(T)}function O(D){const T=i.get(D);if(T.__webglInit===void 0)return;const j=D.source,ie=m.get(j);if(ie){const ae=ie[T.__cacheKey];ae.usedTimes--,ae.usedTimes===0&&M(D),Object.keys(ie).length===0&&m.delete(j)}i.remove(D)}function M(D){const T=i.get(D);n.deleteTexture(T.__webglTexture);const j=D.source,ie=m.get(j);delete ie[T.__cacheKey],o.memory.textures--}function v(D){const T=i.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),i.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let ie=0;ie<6;ie++){if(Array.isArray(T.__webglFramebuffer[ie]))for(let ae=0;ae<T.__webglFramebuffer[ie].length;ae++)n.deleteFramebuffer(T.__webglFramebuffer[ie][ae]);else n.deleteFramebuffer(T.__webglFramebuffer[ie]);T.__webglDepthbuffer&&n.deleteRenderbuffer(T.__webglDepthbuffer[ie])}else{if(Array.isArray(T.__webglFramebuffer))for(let ie=0;ie<T.__webglFramebuffer.length;ie++)n.deleteFramebuffer(T.__webglFramebuffer[ie]);else n.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&n.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&n.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let ie=0;ie<T.__webglColorRenderbuffer.length;ie++)T.__webglColorRenderbuffer[ie]&&n.deleteRenderbuffer(T.__webglColorRenderbuffer[ie]);T.__webglDepthRenderbuffer&&n.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const j=D.textures;for(let ie=0,ae=j.length;ie<ae;ie++){const Q=i.get(j[ie]);Q.__webglTexture&&(n.deleteTexture(Q.__webglTexture),o.memory.textures--),i.remove(j[ie])}i.remove(D)}let F=0;function L(){F=0}function V(){const D=F;return D>=r.maxTextures&&it("WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+r.maxTextures),F+=1,D}function X(D){const T=[];return T.push(D.wrapS),T.push(D.wrapT),T.push(D.wrapR||0),T.push(D.magFilter),T.push(D.minFilter),T.push(D.anisotropy),T.push(D.internalFormat),T.push(D.format),T.push(D.type),T.push(D.generateMipmaps),T.push(D.premultiplyAlpha),T.push(D.flipY),T.push(D.unpackAlignment),T.push(D.colorSpace),T.join()}function Z(D,T){const j=i.get(D);if(D.isVideoTexture&&ht(D),D.isRenderTargetTexture===!1&&D.isExternalTexture!==!0&&D.version>0&&j.__version!==D.version){const ie=D.image;if(ie===null)it("WebGLRenderer: Texture marked for update but no image data found.");else if(ie.complete===!1)it("WebGLRenderer: Texture marked for update but image is incomplete");else{se(j,D,T);return}}else D.isExternalTexture&&(j.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,j.__webglTexture,n.TEXTURE0+T)}function $(D,T){const j=i.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&j.__version!==D.version){se(j,D,T);return}else D.isExternalTexture&&(j.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,j.__webglTexture,n.TEXTURE0+T)}function ne(D,T){const j=i.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&j.__version!==D.version){se(j,D,T);return}t.bindTexture(n.TEXTURE_3D,j.__webglTexture,n.TEXTURE0+T)}function Y(D,T){const j=i.get(D);if(D.version>0&&j.__version!==D.version){le(j,D,T);return}t.bindTexture(n.TEXTURE_CUBE_MAP,j.__webglTexture,n.TEXTURE0+T)}const ue={[Pa]:n.REPEAT,[Pn]:n.CLAMP_TO_EDGE,[ol]:n.MIRRORED_REPEAT},he={[Ln]:n.NEAREST,[M0]:n.NEAREST_MIPMAP_NEAREST,[Qa]:n.NEAREST_MIPMAP_LINEAR,[Zt]:n.LINEAR,[lo]:n.LINEAR_MIPMAP_NEAREST,[pr]:n.LINEAR_MIPMAP_LINEAR},Fe={[C0]:n.NEVER,[U0]:n.ALWAYS,[P0]:n.LESS,[Lu]:n.LEQUAL,[D0]:n.EQUAL,[F0]:n.GEQUAL,[L0]:n.GREATER,[I0]:n.NOTEQUAL};function Qe(D,T){if(T.type===Bn&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===Zt||T.magFilter===lo||T.magFilter===Qa||T.magFilter===pr||T.minFilter===Zt||T.minFilter===lo||T.minFilter===Qa||T.minFilter===pr)&&it("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(D,n.TEXTURE_WRAP_S,ue[T.wrapS]),n.texParameteri(D,n.TEXTURE_WRAP_T,ue[T.wrapT]),(D===n.TEXTURE_3D||D===n.TEXTURE_2D_ARRAY)&&n.texParameteri(D,n.TEXTURE_WRAP_R,ue[T.wrapR]),n.texParameteri(D,n.TEXTURE_MAG_FILTER,he[T.magFilter]),n.texParameteri(D,n.TEXTURE_MIN_FILTER,he[T.minFilter]),T.compareFunction&&(n.texParameteri(D,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(D,n.TEXTURE_COMPARE_FUNC,Fe[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===Ln||T.minFilter!==Qa&&T.minFilter!==pr||T.type===Bn&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||i.get(T).__currentAnisotropy){const j=e.get("EXT_texture_filter_anisotropic");n.texParameterf(D,j.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,r.getMaxAnisotropy())),i.get(T).__currentAnisotropy=T.anisotropy}}}function at(D,T){let j=!1;D.__webglInit===void 0&&(D.__webglInit=!0,T.addEventListener("dispose",E));const ie=T.source;let ae=m.get(ie);ae===void 0&&(ae={},m.set(ie,ae));const Q=X(T);if(Q!==D.__cacheKey){ae[Q]===void 0&&(ae[Q]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,j=!0),ae[Q].usedTimes++;const Oe=ae[D.__cacheKey];Oe!==void 0&&(ae[D.__cacheKey].usedTimes--,Oe.usedTimes===0&&M(T)),D.__cacheKey=Q,D.__webglTexture=ae[Q].texture}return j}function ut(D,T,j){return Math.floor(Math.floor(D/j)/T)}function ft(D,T,j,ie){const Q=D.updateRanges;if(Q.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,T.width,T.height,j,ie,T.data);else{Q.sort((ce,re)=>ce.start-re.start);let Oe=0;for(let ce=1;ce<Q.length;ce++){const re=Q[Oe],Re=Q[ce],Ie=re.start+re.count,Me=ut(Re.start,T.width,4),Be=ut(re.start,T.width,4);Re.start<=Ie+1&&Me===Be&&ut(Re.start+Re.count-1,T.width,4)===Me?re.count=Math.max(re.count,Re.start+Re.count-re.start):(++Oe,Q[Oe]=Re)}Q.length=Oe+1;const ve=n.getParameter(n.UNPACK_ROW_LENGTH),Ve=n.getParameter(n.UNPACK_SKIP_PIXELS),Ue=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,T.width);for(let ce=0,re=Q.length;ce<re;ce++){const Re=Q[ce],Ie=Math.floor(Re.start/4),Me=Math.ceil(Re.count/4),Be=Ie%T.width,G=Math.floor(Ie/T.width),ye=Me,xe=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Be),n.pixelStorei(n.UNPACK_SKIP_ROWS,G),t.texSubImage2D(n.TEXTURE_2D,0,Be,G,ye,xe,j,ie,T.data)}D.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,ve),n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ve),n.pixelStorei(n.UNPACK_SKIP_ROWS,Ue)}}function se(D,T,j){let ie=n.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(ie=n.TEXTURE_2D_ARRAY),T.isData3DTexture&&(ie=n.TEXTURE_3D);const ae=at(D,T),Q=T.source;t.bindTexture(ie,D.__webglTexture,n.TEXTURE0+j);const Oe=i.get(Q);if(Q.version!==Oe.__version||ae===!0){t.activeTexture(n.TEXTURE0+j);const ve=_t.getPrimaries(_t.workingColorSpace),Ve=T.colorSpace===Yi?null:_t.getPrimaries(T.colorSpace),Ue=T.colorSpace===Yi||ve===Ve?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,T.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ue);let ce=R(T.image,!1,r.maxTextureSize);ce=Le(T,ce);const re=a.convert(T.format,T.colorSpace),Re=a.convert(T.type);let Ie=I(T.internalFormat,re,Re,T.colorSpace,T.isVideoTexture);Qe(ie,T);let Me;const Be=T.mipmaps,G=T.isVideoTexture!==!0,ye=Oe.__version===void 0||ae===!0,xe=Q.dataReady,ge=C(T,ce);if(T.isDepthTexture)Ie=B(T.format===Fa,T.type),ye&&(G?t.texStorage2D(n.TEXTURE_2D,1,Ie,ce.width,ce.height):t.texImage2D(n.TEXTURE_2D,0,Ie,ce.width,ce.height,0,re,Re,null));else if(T.isDataTexture)if(Be.length>0){G&&ye&&t.texStorage2D(n.TEXTURE_2D,ge,Ie,Be[0].width,Be[0].height);for(let de=0,oe=Be.length;de<oe;de++)Me=Be[de],G?xe&&t.texSubImage2D(n.TEXTURE_2D,de,0,0,Me.width,Me.height,re,Re,Me.data):t.texImage2D(n.TEXTURE_2D,de,Ie,Me.width,Me.height,0,re,Re,Me.data);T.generateMipmaps=!1}else G?(ye&&t.texStorage2D(n.TEXTURE_2D,ge,Ie,ce.width,ce.height),xe&&ft(T,ce,re,Re)):t.texImage2D(n.TEXTURE_2D,0,Ie,ce.width,ce.height,0,re,Re,ce.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){G&&ye&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ge,Ie,Be[0].width,Be[0].height,ce.depth);for(let de=0,oe=Be.length;de<oe;de++)if(Me=Be[de],T.format!==xn)if(re!==null)if(G){if(xe)if(T.layerUpdates.size>0){const Te=ff(Me.width,Me.height,T.format,T.type);for(const et of T.layerUpdates){const At=Me.data.subarray(et*Te/Me.data.BYTES_PER_ELEMENT,(et+1)*Te/Me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,de,0,0,et,Me.width,Me.height,1,re,At)}T.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,de,0,0,0,Me.width,Me.height,ce.depth,re,Me.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,de,Ie,Me.width,Me.height,ce.depth,0,Me.data,0,0);else it("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else G?xe&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,de,0,0,0,Me.width,Me.height,ce.depth,re,Re,Me.data):t.texImage3D(n.TEXTURE_2D_ARRAY,de,Ie,Me.width,Me.height,ce.depth,0,re,Re,Me.data)}else{G&&ye&&t.texStorage2D(n.TEXTURE_2D,ge,Ie,Be[0].width,Be[0].height);for(let de=0,oe=Be.length;de<oe;de++)Me=Be[de],T.format!==xn?re!==null?G?xe&&t.compressedTexSubImage2D(n.TEXTURE_2D,de,0,0,Me.width,Me.height,re,Me.data):t.compressedTexImage2D(n.TEXTURE_2D,de,Ie,Me.width,Me.height,0,Me.data):it("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):G?xe&&t.texSubImage2D(n.TEXTURE_2D,de,0,0,Me.width,Me.height,re,Re,Me.data):t.texImage2D(n.TEXTURE_2D,de,Ie,Me.width,Me.height,0,re,Re,Me.data)}else if(T.isDataArrayTexture)if(G){if(ye&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ge,Ie,ce.width,ce.height,ce.depth),xe)if(T.layerUpdates.size>0){const de=ff(ce.width,ce.height,T.format,T.type);for(const oe of T.layerUpdates){const Te=ce.data.subarray(oe*de/ce.data.BYTES_PER_ELEMENT,(oe+1)*de/ce.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,oe,ce.width,ce.height,1,re,Re,Te)}T.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ce.width,ce.height,ce.depth,re,Re,ce.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ie,ce.width,ce.height,ce.depth,0,re,Re,ce.data);else if(T.isData3DTexture)G?(ye&&t.texStorage3D(n.TEXTURE_3D,ge,Ie,ce.width,ce.height,ce.depth),xe&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ce.width,ce.height,ce.depth,re,Re,ce.data)):t.texImage3D(n.TEXTURE_3D,0,Ie,ce.width,ce.height,ce.depth,0,re,Re,ce.data);else if(T.isFramebufferTexture){if(ye)if(G)t.texStorage2D(n.TEXTURE_2D,ge,Ie,ce.width,ce.height);else{let de=ce.width,oe=ce.height;for(let Te=0;Te<ge;Te++)t.texImage2D(n.TEXTURE_2D,Te,Ie,de,oe,0,re,Re,null),de>>=1,oe>>=1}}else if(Be.length>0){if(G&&ye){const de=We(Be[0]);t.texStorage2D(n.TEXTURE_2D,ge,Ie,de.width,de.height)}for(let de=0,oe=Be.length;de<oe;de++)Me=Be[de],G?xe&&t.texSubImage2D(n.TEXTURE_2D,de,0,0,re,Re,Me):t.texImage2D(n.TEXTURE_2D,de,Ie,re,Re,Me);T.generateMipmaps=!1}else if(G){if(ye){const de=We(ce);t.texStorage2D(n.TEXTURE_2D,ge,Ie,de.width,de.height)}xe&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,re,Re,ce)}else t.texImage2D(n.TEXTURE_2D,0,Ie,re,Re,ce);S(T)&&x(ie),Oe.__version=Q.version,T.onUpdate&&T.onUpdate(T)}D.__version=T.version}function le(D,T,j){if(T.image.length!==6)return;const ie=at(D,T),ae=T.source;t.bindTexture(n.TEXTURE_CUBE_MAP,D.__webglTexture,n.TEXTURE0+j);const Q=i.get(ae);if(ae.version!==Q.__version||ie===!0){t.activeTexture(n.TEXTURE0+j);const Oe=_t.getPrimaries(_t.workingColorSpace),ve=T.colorSpace===Yi?null:_t.getPrimaries(T.colorSpace),Ve=T.colorSpace===Yi||Oe===ve?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,T.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ve);const Ue=T.isCompressedTexture||T.image[0].isCompressedTexture,ce=T.image[0]&&T.image[0].isDataTexture,re=[];for(let oe=0;oe<6;oe++)!Ue&&!ce?re[oe]=R(T.image[oe],!0,r.maxCubemapSize):re[oe]=ce?T.image[oe].image:T.image[oe],re[oe]=Le(T,re[oe]);const Re=re[0],Ie=a.convert(T.format,T.colorSpace),Me=a.convert(T.type),Be=I(T.internalFormat,Ie,Me,T.colorSpace),G=T.isVideoTexture!==!0,ye=Q.__version===void 0||ie===!0,xe=ae.dataReady;let ge=C(T,Re);Qe(n.TEXTURE_CUBE_MAP,T);let de;if(Ue){G&&ye&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ge,Be,Re.width,Re.height);for(let oe=0;oe<6;oe++){de=re[oe].mipmaps;for(let Te=0;Te<de.length;Te++){const et=de[Te];T.format!==xn?Ie!==null?G?xe&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Te,0,0,et.width,et.height,Ie,et.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Te,Be,et.width,et.height,0,et.data):it("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):G?xe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Te,0,0,et.width,et.height,Ie,Me,et.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Te,Be,et.width,et.height,0,Ie,Me,et.data)}}}else{if(de=T.mipmaps,G&&ye){de.length>0&&ge++;const oe=We(re[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ge,Be,oe.width,oe.height)}for(let oe=0;oe<6;oe++)if(ce){G?xe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,0,0,re[oe].width,re[oe].height,Ie,Me,re[oe].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,Be,re[oe].width,re[oe].height,0,Ie,Me,re[oe].data);for(let Te=0;Te<de.length;Te++){const At=de[Te].image[oe].image;G?xe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Te+1,0,0,At.width,At.height,Ie,Me,At.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Te+1,Be,At.width,At.height,0,Ie,Me,At.data)}}else{G?xe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,0,0,Ie,Me,re[oe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,Be,Ie,Me,re[oe]);for(let Te=0;Te<de.length;Te++){const et=de[Te];G?xe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Te+1,0,0,Ie,Me,et.image[oe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Te+1,Be,Ie,Me,et.image[oe])}}}S(T)&&x(n.TEXTURE_CUBE_MAP),Q.__version=ae.version,T.onUpdate&&T.onUpdate(T)}D.__version=T.version}function Ee(D,T,j,ie,ae,Q){const Oe=a.convert(j.format,j.colorSpace),ve=a.convert(j.type),Ve=I(j.internalFormat,Oe,ve,j.colorSpace),Ue=i.get(T),ce=i.get(j);if(ce.__renderTarget=T,!Ue.__hasExternalTextures){const re=Math.max(1,T.width>>Q),Re=Math.max(1,T.height>>Q);ae===n.TEXTURE_3D||ae===n.TEXTURE_2D_ARRAY?t.texImage3D(ae,Q,Ve,re,Re,T.depth,0,Oe,ve,null):t.texImage2D(ae,Q,Ve,re,Re,0,Oe,ve,null)}t.bindFramebuffer(n.FRAMEBUFFER,D),Se(T)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ie,ae,ce.__webglTexture,0,st(T)):(ae===n.TEXTURE_2D||ae>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&ae<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ie,ae,ce.__webglTexture,Q),t.bindFramebuffer(n.FRAMEBUFFER,null)}function je(D,T,j){if(n.bindRenderbuffer(n.RENDERBUFFER,D),T.depthBuffer){const ie=T.depthTexture,ae=ie&&ie.isDepthTexture?ie.type:null,Q=B(T.stencilBuffer,ae),Oe=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ve=st(T);Se(T)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ve,Q,T.width,T.height):j?n.renderbufferStorageMultisample(n.RENDERBUFFER,ve,Q,T.width,T.height):n.renderbufferStorage(n.RENDERBUFFER,Q,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Oe,n.RENDERBUFFER,D)}else{const ie=T.textures;for(let ae=0;ae<ie.length;ae++){const Q=ie[ae],Oe=a.convert(Q.format,Q.colorSpace),ve=a.convert(Q.type),Ve=I(Q.internalFormat,Oe,ve,Q.colorSpace),Ue=st(T);j&&Se(T)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ue,Ve,T.width,T.height):Se(T)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ue,Ve,T.width,T.height):n.renderbufferStorage(n.RENDERBUFFER,Ve,T.width,T.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ne(D,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,D),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const ie=i.get(T.depthTexture);ie.__renderTarget=T,(!ie.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),Z(T.depthTexture,0);const ae=ie.__webglTexture,Q=st(T);if(T.depthTexture.format===Ia)Se(T)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ae,0,Q):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ae,0);else if(T.depthTexture.format===Fa)Se(T)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ae,0,Q):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ae,0);else throw new Error("Unknown depthTexture format")}function nt(D){const T=i.get(D),j=D.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==D.depthTexture){const ie=D.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),ie){const ae=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,ie.removeEventListener("dispose",ae)};ie.addEventListener("dispose",ae),T.__depthDisposeCallback=ae}T.__boundDepthTexture=ie}if(D.depthTexture&&!T.__autoAllocateDepthBuffer){if(j)throw new Error("target.depthTexture not supported in Cube render targets");const ie=D.texture.mipmaps;ie&&ie.length>0?Ne(T.__webglFramebuffer[0],D):Ne(T.__webglFramebuffer,D)}else if(j){T.__webglDepthbuffer=[];for(let ie=0;ie<6;ie++)if(t.bindFramebuffer(n.FRAMEBUFFER,T.__webglFramebuffer[ie]),T.__webglDepthbuffer[ie]===void 0)T.__webglDepthbuffer[ie]=n.createRenderbuffer(),je(T.__webglDepthbuffer[ie],D,!1);else{const ae=D.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Q=T.__webglDepthbuffer[ie];n.bindRenderbuffer(n.RENDERBUFFER,Q),n.framebufferRenderbuffer(n.FRAMEBUFFER,ae,n.RENDERBUFFER,Q)}}else{const ie=D.texture.mipmaps;if(ie&&ie.length>0?t.bindFramebuffer(n.FRAMEBUFFER,T.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=n.createRenderbuffer(),je(T.__webglDepthbuffer,D,!1);else{const ae=D.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Q=T.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,Q),n.framebufferRenderbuffer(n.FRAMEBUFFER,ae,n.RENDERBUFFER,Q)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ct(D,T,j){const ie=i.get(D);T!==void 0&&Ee(ie.__webglFramebuffer,D,D.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),j!==void 0&&nt(D)}function _e(D){const T=D.texture,j=i.get(D),ie=i.get(T);D.addEventListener("dispose",A);const ae=D.textures,Q=D.isWebGLCubeRenderTarget===!0,Oe=ae.length>1;if(Oe||(ie.__webglTexture===void 0&&(ie.__webglTexture=n.createTexture()),ie.__version=T.version,o.memory.textures++),Q){j.__webglFramebuffer=[];for(let ve=0;ve<6;ve++)if(T.mipmaps&&T.mipmaps.length>0){j.__webglFramebuffer[ve]=[];for(let Ve=0;Ve<T.mipmaps.length;Ve++)j.__webglFramebuffer[ve][Ve]=n.createFramebuffer()}else j.__webglFramebuffer[ve]=n.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){j.__webglFramebuffer=[];for(let ve=0;ve<T.mipmaps.length;ve++)j.__webglFramebuffer[ve]=n.createFramebuffer()}else j.__webglFramebuffer=n.createFramebuffer();if(Oe)for(let ve=0,Ve=ae.length;ve<Ve;ve++){const Ue=i.get(ae[ve]);Ue.__webglTexture===void 0&&(Ue.__webglTexture=n.createTexture(),o.memory.textures++)}if(D.samples>0&&Se(D)===!1){j.__webglMultisampledFramebuffer=n.createFramebuffer(),j.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,j.__webglMultisampledFramebuffer);for(let ve=0;ve<ae.length;ve++){const Ve=ae[ve];j.__webglColorRenderbuffer[ve]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,j.__webglColorRenderbuffer[ve]);const Ue=a.convert(Ve.format,Ve.colorSpace),ce=a.convert(Ve.type),re=I(Ve.internalFormat,Ue,ce,Ve.colorSpace,D.isXRRenderTarget===!0),Re=st(D);n.renderbufferStorageMultisample(n.RENDERBUFFER,Re,re,D.width,D.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.RENDERBUFFER,j.__webglColorRenderbuffer[ve])}n.bindRenderbuffer(n.RENDERBUFFER,null),D.depthBuffer&&(j.__webglDepthRenderbuffer=n.createRenderbuffer(),je(j.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Q){t.bindTexture(n.TEXTURE_CUBE_MAP,ie.__webglTexture),Qe(n.TEXTURE_CUBE_MAP,T);for(let ve=0;ve<6;ve++)if(T.mipmaps&&T.mipmaps.length>0)for(let Ve=0;Ve<T.mipmaps.length;Ve++)Ee(j.__webglFramebuffer[ve][Ve],D,T,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Ve);else Ee(j.__webglFramebuffer[ve],D,T,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0);S(T)&&x(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Oe){for(let ve=0,Ve=ae.length;ve<Ve;ve++){const Ue=ae[ve],ce=i.get(Ue);let re=n.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(re=D.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(re,ce.__webglTexture),Qe(re,Ue),Ee(j.__webglFramebuffer,D,Ue,n.COLOR_ATTACHMENT0+ve,re,0),S(Ue)&&x(re)}t.unbindTexture()}else{let ve=n.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(ve=D.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ve,ie.__webglTexture),Qe(ve,T),T.mipmaps&&T.mipmaps.length>0)for(let Ve=0;Ve<T.mipmaps.length;Ve++)Ee(j.__webglFramebuffer[Ve],D,T,n.COLOR_ATTACHMENT0,ve,Ve);else Ee(j.__webglFramebuffer,D,T,n.COLOR_ATTACHMENT0,ve,0);S(T)&&x(ve),t.unbindTexture()}D.depthBuffer&&nt(D)}function Ze(D){const T=D.textures;for(let j=0,ie=T.length;j<ie;j++){const ae=T[j];if(S(ae)){const Q=U(D),Oe=i.get(ae).__webglTexture;t.bindTexture(Q,Oe),x(Q),t.unbindTexture()}}}const k=[],Ye=[];function He(D){if(D.samples>0){if(Se(D)===!1){const T=D.textures,j=D.width,ie=D.height;let ae=n.COLOR_BUFFER_BIT;const Q=D.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Oe=i.get(D),ve=T.length>1;if(ve)for(let Ue=0;Ue<T.length;Ue++)t.bindFramebuffer(n.FRAMEBUFFER,Oe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ue,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Oe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ue,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Oe.__webglMultisampledFramebuffer);const Ve=D.texture.mipmaps;Ve&&Ve.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Oe.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Oe.__webglFramebuffer);for(let Ue=0;Ue<T.length;Ue++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(ae|=n.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(ae|=n.STENCIL_BUFFER_BIT)),ve){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Oe.__webglColorRenderbuffer[Ue]);const ce=i.get(T[Ue]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,ce,0)}n.blitFramebuffer(0,0,j,ie,0,0,j,ie,ae,n.NEAREST),f===!0&&(k.length=0,Ye.length=0,k.push(n.COLOR_ATTACHMENT0+Ue),D.depthBuffer&&D.resolveDepthBuffer===!1&&(k.push(Q),Ye.push(Q),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Ye)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,k))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ve)for(let Ue=0;Ue<T.length;Ue++){t.bindFramebuffer(n.FRAMEBUFFER,Oe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ue,n.RENDERBUFFER,Oe.__webglColorRenderbuffer[Ue]);const ce=i.get(T[Ue]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Oe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ue,n.TEXTURE_2D,ce,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Oe.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&f){const T=D.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[T])}}}function st(D){return Math.min(r.maxSamples,D.samples)}function Se(D){const T=i.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function ht(D){const T=o.render.frame;h.get(D)!==T&&(h.set(D,T),D.update())}function Le(D,T){const j=D.colorSpace,ie=D.format,ae=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||j!==ci&&j!==Yi&&(_t.getTransfer(j)===Mt?(ie!==xn||ae!==kn)&&it("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):kt("WebGLTextures: Unsupported texture color space:",j)),T}function We(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(u.width=D.naturalWidth||D.width,u.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(u.width=D.displayWidth,u.height=D.displayHeight):(u.width=D.width,u.height=D.height),u}this.allocateTextureUnit=V,this.resetTextureUnits=L,this.setTexture2D=Z,this.setTexture2DArray=$,this.setTexture3D=ne,this.setTextureCube=Y,this.rebindTextures=Ct,this.setupRenderTarget=_e,this.updateRenderTargetMipmap=Ze,this.updateMultisampleRenderTarget=He,this.setupDepthRenderbuffer=nt,this.setupFrameBufferTexture=Ee,this.useMultisampledRTT=Se}function Kv(n,e){function t(i,r=Yi){let a;const o=_t.getTransfer(r);if(i===kn)return n.UNSIGNED_BYTE;if(i===ec)return n.UNSIGNED_SHORT_4_4_4_4;if(i===tc)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Au)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Ru)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Jl)return n.BYTE;if(i===Ql)return n.SHORT;if(i===Da)return n.UNSIGNED_SHORT;if(i===Ws)return n.INT;if(i===Qi)return n.UNSIGNED_INT;if(i===Bn)return n.FLOAT;if(i===Ni)return n.HALF_FLOAT;if(i===Cu)return n.ALPHA;if(i===Pu)return n.RGB;if(i===xn)return n.RGBA;if(i===Ia)return n.DEPTH_COMPONENT;if(i===Fa)return n.DEPTH_STENCIL;if(i===Du)return n.RED;if(i===nc)return n.RED_INTEGER;if(i===ic)return n.RG;if(i===rc)return n.RG_INTEGER;if(i===ac)return n.RGBA_INTEGER;if(i===Ms||i===Ts||i===ws||i===As)if(o===Mt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===Ms)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ts)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===ws)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===As)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===Ms)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ts)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===ws)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===As)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===ll||i===cl||i===fl||i===ul)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===ll)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===cl)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===fl)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===ul)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===dl||i===hl||i===pl)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(i===dl||i===hl)return o===Mt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===pl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===ml||i===gl||i===xl||i===_l||i===vl||i===Sl||i===yl||i===bl||i===El||i===Ml||i===Tl||i===wl||i===Al||i===Rl)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(i===ml)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===gl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===xl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===_l)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===vl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Sl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===yl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===bl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===El)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Ml)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Tl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===wl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Al)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Rl)return o===Mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Cl||i===Pl||i===Dl)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(i===Cl)return o===Mt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Pl)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Dl)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Ll||i===Il||i===Fl||i===Ul)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(i===Ll)return a.COMPRESSED_RED_RGTC1_EXT;if(i===Il)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Fl)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Ul)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===La?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const Zv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Jv=`
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

}`;class Qv{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new Wu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new zn({vertexShader:Zv,fragmentShader:Jv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new fi(new la(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class eS extends oa{constructor(e,t){super();const i=this;let r=null,a=1,o=null,l="local-floor",f=1,u=null,h=null,p=null,m=null,g=null,y=null;const R=typeof XRWebGLBinding<"u",S=new Qv,x={},U=t.getContextAttributes();let I=null,B=null;const C=[],E=[],A=new wt;let O=null;const M=new Yn;M.viewport=new zt;const v=new Yn;v.viewport=new zt;const F=[M,v],L=new vm;let V=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(se){let le=C[se];return le===void 0&&(le=new Lo,C[se]=le),le.getTargetRaySpace()},this.getControllerGrip=function(se){let le=C[se];return le===void 0&&(le=new Lo,C[se]=le),le.getGripSpace()},this.getHand=function(se){let le=C[se];return le===void 0&&(le=new Lo,C[se]=le),le.getHandSpace()};function Z(se){const le=E.indexOf(se.inputSource);if(le===-1)return;const Ee=C[le];Ee!==void 0&&(Ee.update(se.inputSource,se.frame,u||o),Ee.dispatchEvent({type:se.type,data:se.inputSource}))}function $(){r.removeEventListener("select",Z),r.removeEventListener("selectstart",Z),r.removeEventListener("selectend",Z),r.removeEventListener("squeeze",Z),r.removeEventListener("squeezestart",Z),r.removeEventListener("squeezeend",Z),r.removeEventListener("end",$),r.removeEventListener("inputsourceschange",ne);for(let se=0;se<C.length;se++){const le=E[se];le!==null&&(E[se]=null,C[se].disconnect(le))}V=null,X=null,S.reset();for(const se in x)delete x[se];e.setRenderTarget(I),g=null,m=null,p=null,r=null,B=null,ft.stop(),i.isPresenting=!1,e.setPixelRatio(O),e.setSize(A.width,A.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(se){a=se,i.isPresenting===!0&&it("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(se){l=se,i.isPresenting===!0&&it("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||o},this.setReferenceSpace=function(se){u=se},this.getBaseLayer=function(){return m!==null?m:g},this.getBinding=function(){return p===null&&R&&(p=new XRWebGLBinding(r,t)),p},this.getFrame=function(){return y},this.getSession=function(){return r},this.setSession=async function(se){if(r=se,r!==null){if(I=e.getRenderTarget(),r.addEventListener("select",Z),r.addEventListener("selectstart",Z),r.addEventListener("selectend",Z),r.addEventListener("squeeze",Z),r.addEventListener("squeezestart",Z),r.addEventListener("squeezeend",Z),r.addEventListener("end",$),r.addEventListener("inputsourceschange",ne),U.xrCompatible!==!0&&await t.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(A),R&&"createProjectionLayer"in XRWebGLBinding.prototype){let Ee=null,je=null,Ne=null;U.depth&&(Ne=U.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Ee=U.stencil?Fa:Ia,je=U.stencil?La:Qi);const nt={colorFormat:t.RGBA8,depthFormat:Ne,scaleFactor:a};p=this.getBinding(),m=p.createProjectionLayer(nt),r.updateRenderState({layers:[m]}),e.setPixelRatio(1),e.setSize(m.textureWidth,m.textureHeight,!1),B=new Ci(m.textureWidth,m.textureHeight,{format:xn,type:kn,depthTexture:new Hu(m.textureWidth,m.textureHeight,je,void 0,void 0,void 0,void 0,void 0,void 0,Ee),stencilBuffer:U.stencil,colorSpace:e.outputColorSpace,samples:U.antialias?4:0,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}else{const Ee={antialias:U.antialias,alpha:!0,depth:U.depth,stencil:U.stencil,framebufferScaleFactor:a};g=new XRWebGLLayer(r,t,Ee),r.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),B=new Ci(g.framebufferWidth,g.framebufferHeight,{format:xn,type:kn,colorSpace:e.outputColorSpace,stencilBuffer:U.stencil,resolveDepthBuffer:g.ignoreDepthValues===!1,resolveStencilBuffer:g.ignoreDepthValues===!1})}B.isXRRenderTarget=!0,this.setFoveation(f),u=null,o=await r.requestReferenceSpace(l),ft.setContext(r),ft.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return S.getDepthTexture()};function ne(se){for(let le=0;le<se.removed.length;le++){const Ee=se.removed[le],je=E.indexOf(Ee);je>=0&&(E[je]=null,C[je].disconnect(Ee))}for(let le=0;le<se.added.length;le++){const Ee=se.added[le];let je=E.indexOf(Ee);if(je===-1){for(let nt=0;nt<C.length;nt++)if(nt>=E.length){E.push(Ee),je=nt;break}else if(E[nt]===null){E[nt]=Ee,je=nt;break}if(je===-1)break}const Ne=C[je];Ne&&Ne.connect(Ee)}}const Y=new te,ue=new te;function he(se,le,Ee){Y.setFromMatrixPosition(le.matrixWorld),ue.setFromMatrixPosition(Ee.matrixWorld);const je=Y.distanceTo(ue),Ne=le.projectionMatrix.elements,nt=Ee.projectionMatrix.elements,Ct=Ne[14]/(Ne[10]-1),_e=Ne[14]/(Ne[10]+1),Ze=(Ne[9]+1)/Ne[5],k=(Ne[9]-1)/Ne[5],Ye=(Ne[8]-1)/Ne[0],He=(nt[8]+1)/nt[0],st=Ct*Ye,Se=Ct*He,ht=je/(-Ye+He),Le=ht*-Ye;if(le.matrixWorld.decompose(se.position,se.quaternion,se.scale),se.translateX(Le),se.translateZ(ht),se.matrixWorld.compose(se.position,se.quaternion,se.scale),se.matrixWorldInverse.copy(se.matrixWorld).invert(),Ne[10]===-1)se.projectionMatrix.copy(le.projectionMatrix),se.projectionMatrixInverse.copy(le.projectionMatrixInverse);else{const We=Ct+ht,D=_e+ht,T=st-Le,j=Se+(je-Le),ie=Ze*_e/D*We,ae=k*_e/D*We;se.projectionMatrix.makePerspective(T,j,ie,ae,We,D),se.projectionMatrixInverse.copy(se.projectionMatrix).invert()}}function Fe(se,le){le===null?se.matrixWorld.copy(se.matrix):se.matrixWorld.multiplyMatrices(le.matrixWorld,se.matrix),se.matrixWorldInverse.copy(se.matrixWorld).invert()}this.updateCamera=function(se){if(r===null)return;let le=se.near,Ee=se.far;S.texture!==null&&(S.depthNear>0&&(le=S.depthNear),S.depthFar>0&&(Ee=S.depthFar)),L.near=v.near=M.near=le,L.far=v.far=M.far=Ee,(V!==L.near||X!==L.far)&&(r.updateRenderState({depthNear:L.near,depthFar:L.far}),V=L.near,X=L.far),L.layers.mask=se.layers.mask|6,M.layers.mask=L.layers.mask&3,v.layers.mask=L.layers.mask&5;const je=se.parent,Ne=L.cameras;Fe(L,je);for(let nt=0;nt<Ne.length;nt++)Fe(Ne[nt],je);Ne.length===2?he(L,M,v):L.projectionMatrix.copy(M.projectionMatrix),Qe(se,L,je)};function Qe(se,le,Ee){Ee===null?se.matrix.copy(le.matrixWorld):(se.matrix.copy(Ee.matrixWorld),se.matrix.invert(),se.matrix.multiply(le.matrixWorld)),se.matrix.decompose(se.position,se.quaternion,se.scale),se.updateMatrixWorld(!0),se.projectionMatrix.copy(le.projectionMatrix),se.projectionMatrixInverse.copy(le.projectionMatrixInverse),se.isPerspectiveCamera&&(se.fov=Nl*2*Math.atan(1/se.projectionMatrix.elements[5]),se.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(m===null&&g===null))return f},this.setFoveation=function(se){f=se,m!==null&&(m.fixedFoveation=se),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=se)},this.hasDepthSensing=function(){return S.texture!==null},this.getDepthSensingMesh=function(){return S.getMesh(L)},this.getCameraTexture=function(se){return x[se]};let at=null;function ut(se,le){if(h=le.getViewerPose(u||o),y=le,h!==null){const Ee=h.views;g!==null&&(e.setRenderTargetFramebuffer(B,g.framebuffer),e.setRenderTarget(B));let je=!1;Ee.length!==L.cameras.length&&(L.cameras.length=0,je=!0);for(let _e=0;_e<Ee.length;_e++){const Ze=Ee[_e];let k=null;if(g!==null)k=g.getViewport(Ze);else{const He=p.getViewSubImage(m,Ze);k=He.viewport,_e===0&&(e.setRenderTargetTextures(B,He.colorTexture,He.depthStencilTexture),e.setRenderTarget(B))}let Ye=F[_e];Ye===void 0&&(Ye=new Yn,Ye.layers.enable(_e),Ye.viewport=new zt,F[_e]=Ye),Ye.matrix.fromArray(Ze.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(Ze.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(k.x,k.y,k.width,k.height),_e===0&&(L.matrix.copy(Ye.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),je===!0&&L.cameras.push(Ye)}const Ne=r.enabledFeatures;if(Ne&&Ne.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&R){p=i.getBinding();const _e=p.getDepthInformation(Ee[0]);_e&&_e.isValid&&_e.texture&&S.init(_e,r.renderState)}if(Ne&&Ne.includes("camera-access")&&R){e.state.unbindTexture(),p=i.getBinding();for(let _e=0;_e<Ee.length;_e++){const Ze=Ee[_e].camera;if(Ze){let k=x[Ze];k||(k=new Wu,x[Ze]=k);const Ye=p.getCameraImage(Ze);k.sourceTexture=Ye}}}}for(let Ee=0;Ee<C.length;Ee++){const je=E[Ee],Ne=C[Ee];je!==null&&Ne!==void 0&&Ne.update(je,le,u||o)}at&&at(se,le),le.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:le}),y=null}const ft=new qu;ft.setAnimationLoop(ut),this.setAnimationLoop=function(se){at=se},this.dispose=function(){}}}const cr=new Pi,tS=new Wt;function nS(n,e){function t(S,x){S.matrixAutoUpdate===!0&&S.updateMatrix(),x.value.copy(S.matrix)}function i(S,x){x.color.getRGB(S.fogColor.value,ku(n)),x.isFog?(S.fogNear.value=x.near,S.fogFar.value=x.far):x.isFogExp2&&(S.fogDensity.value=x.density)}function r(S,x,U,I,B){x.isMeshBasicMaterial||x.isMeshLambertMaterial?a(S,x):x.isMeshToonMaterial?(a(S,x),p(S,x)):x.isMeshPhongMaterial?(a(S,x),h(S,x)):x.isMeshStandardMaterial?(a(S,x),m(S,x),x.isMeshPhysicalMaterial&&g(S,x,B)):x.isMeshMatcapMaterial?(a(S,x),y(S,x)):x.isMeshDepthMaterial?a(S,x):x.isMeshDistanceMaterial?(a(S,x),R(S,x)):x.isMeshNormalMaterial?a(S,x):x.isLineBasicMaterial?(o(S,x),x.isLineDashedMaterial&&l(S,x)):x.isPointsMaterial?f(S,x,U,I):x.isSpriteMaterial?u(S,x):x.isShadowMaterial?(S.color.value.copy(x.color),S.opacity.value=x.opacity):x.isShaderMaterial&&(x.uniformsNeedUpdate=!1)}function a(S,x){S.opacity.value=x.opacity,x.color&&S.diffuse.value.copy(x.color),x.emissive&&S.emissive.value.copy(x.emissive).multiplyScalar(x.emissiveIntensity),x.map&&(S.map.value=x.map,t(x.map,S.mapTransform)),x.alphaMap&&(S.alphaMap.value=x.alphaMap,t(x.alphaMap,S.alphaMapTransform)),x.bumpMap&&(S.bumpMap.value=x.bumpMap,t(x.bumpMap,S.bumpMapTransform),S.bumpScale.value=x.bumpScale,x.side===bn&&(S.bumpScale.value*=-1)),x.normalMap&&(S.normalMap.value=x.normalMap,t(x.normalMap,S.normalMapTransform),S.normalScale.value.copy(x.normalScale),x.side===bn&&S.normalScale.value.negate()),x.displacementMap&&(S.displacementMap.value=x.displacementMap,t(x.displacementMap,S.displacementMapTransform),S.displacementScale.value=x.displacementScale,S.displacementBias.value=x.displacementBias),x.emissiveMap&&(S.emissiveMap.value=x.emissiveMap,t(x.emissiveMap,S.emissiveMapTransform)),x.specularMap&&(S.specularMap.value=x.specularMap,t(x.specularMap,S.specularMapTransform)),x.alphaTest>0&&(S.alphaTest.value=x.alphaTest);const U=e.get(x),I=U.envMap,B=U.envMapRotation;I&&(S.envMap.value=I,cr.copy(B),cr.x*=-1,cr.y*=-1,cr.z*=-1,I.isCubeTexture&&I.isRenderTargetTexture===!1&&(cr.y*=-1,cr.z*=-1),S.envMapRotation.value.setFromMatrix4(tS.makeRotationFromEuler(cr)),S.flipEnvMap.value=I.isCubeTexture&&I.isRenderTargetTexture===!1?-1:1,S.reflectivity.value=x.reflectivity,S.ior.value=x.ior,S.refractionRatio.value=x.refractionRatio),x.lightMap&&(S.lightMap.value=x.lightMap,S.lightMapIntensity.value=x.lightMapIntensity,t(x.lightMap,S.lightMapTransform)),x.aoMap&&(S.aoMap.value=x.aoMap,S.aoMapIntensity.value=x.aoMapIntensity,t(x.aoMap,S.aoMapTransform))}function o(S,x){S.diffuse.value.copy(x.color),S.opacity.value=x.opacity,x.map&&(S.map.value=x.map,t(x.map,S.mapTransform))}function l(S,x){S.dashSize.value=x.dashSize,S.totalSize.value=x.dashSize+x.gapSize,S.scale.value=x.scale}function f(S,x,U,I){S.diffuse.value.copy(x.color),S.opacity.value=x.opacity,S.size.value=x.size*U,S.scale.value=I*.5,x.map&&(S.map.value=x.map,t(x.map,S.uvTransform)),x.alphaMap&&(S.alphaMap.value=x.alphaMap,t(x.alphaMap,S.alphaMapTransform)),x.alphaTest>0&&(S.alphaTest.value=x.alphaTest)}function u(S,x){S.diffuse.value.copy(x.color),S.opacity.value=x.opacity,S.rotation.value=x.rotation,x.map&&(S.map.value=x.map,t(x.map,S.mapTransform)),x.alphaMap&&(S.alphaMap.value=x.alphaMap,t(x.alphaMap,S.alphaMapTransform)),x.alphaTest>0&&(S.alphaTest.value=x.alphaTest)}function h(S,x){S.specular.value.copy(x.specular),S.shininess.value=Math.max(x.shininess,1e-4)}function p(S,x){x.gradientMap&&(S.gradientMap.value=x.gradientMap)}function m(S,x){S.metalness.value=x.metalness,x.metalnessMap&&(S.metalnessMap.value=x.metalnessMap,t(x.metalnessMap,S.metalnessMapTransform)),S.roughness.value=x.roughness,x.roughnessMap&&(S.roughnessMap.value=x.roughnessMap,t(x.roughnessMap,S.roughnessMapTransform)),x.envMap&&(S.envMapIntensity.value=x.envMapIntensity)}function g(S,x,U){S.ior.value=x.ior,x.sheen>0&&(S.sheenColor.value.copy(x.sheenColor).multiplyScalar(x.sheen),S.sheenRoughness.value=x.sheenRoughness,x.sheenColorMap&&(S.sheenColorMap.value=x.sheenColorMap,t(x.sheenColorMap,S.sheenColorMapTransform)),x.sheenRoughnessMap&&(S.sheenRoughnessMap.value=x.sheenRoughnessMap,t(x.sheenRoughnessMap,S.sheenRoughnessMapTransform))),x.clearcoat>0&&(S.clearcoat.value=x.clearcoat,S.clearcoatRoughness.value=x.clearcoatRoughness,x.clearcoatMap&&(S.clearcoatMap.value=x.clearcoatMap,t(x.clearcoatMap,S.clearcoatMapTransform)),x.clearcoatRoughnessMap&&(S.clearcoatRoughnessMap.value=x.clearcoatRoughnessMap,t(x.clearcoatRoughnessMap,S.clearcoatRoughnessMapTransform)),x.clearcoatNormalMap&&(S.clearcoatNormalMap.value=x.clearcoatNormalMap,t(x.clearcoatNormalMap,S.clearcoatNormalMapTransform),S.clearcoatNormalScale.value.copy(x.clearcoatNormalScale),x.side===bn&&S.clearcoatNormalScale.value.negate())),x.dispersion>0&&(S.dispersion.value=x.dispersion),x.iridescence>0&&(S.iridescence.value=x.iridescence,S.iridescenceIOR.value=x.iridescenceIOR,S.iridescenceThicknessMinimum.value=x.iridescenceThicknessRange[0],S.iridescenceThicknessMaximum.value=x.iridescenceThicknessRange[1],x.iridescenceMap&&(S.iridescenceMap.value=x.iridescenceMap,t(x.iridescenceMap,S.iridescenceMapTransform)),x.iridescenceThicknessMap&&(S.iridescenceThicknessMap.value=x.iridescenceThicknessMap,t(x.iridescenceThicknessMap,S.iridescenceThicknessMapTransform))),x.transmission>0&&(S.transmission.value=x.transmission,S.transmissionSamplerMap.value=U.texture,S.transmissionSamplerSize.value.set(U.width,U.height),x.transmissionMap&&(S.transmissionMap.value=x.transmissionMap,t(x.transmissionMap,S.transmissionMapTransform)),S.thickness.value=x.thickness,x.thicknessMap&&(S.thicknessMap.value=x.thicknessMap,t(x.thicknessMap,S.thicknessMapTransform)),S.attenuationDistance.value=x.attenuationDistance,S.attenuationColor.value.copy(x.attenuationColor)),x.anisotropy>0&&(S.anisotropyVector.value.set(x.anisotropy*Math.cos(x.anisotropyRotation),x.anisotropy*Math.sin(x.anisotropyRotation)),x.anisotropyMap&&(S.anisotropyMap.value=x.anisotropyMap,t(x.anisotropyMap,S.anisotropyMapTransform))),S.specularIntensity.value=x.specularIntensity,S.specularColor.value.copy(x.specularColor),x.specularColorMap&&(S.specularColorMap.value=x.specularColorMap,t(x.specularColorMap,S.specularColorMapTransform)),x.specularIntensityMap&&(S.specularIntensityMap.value=x.specularIntensityMap,t(x.specularIntensityMap,S.specularIntensityMapTransform))}function y(S,x){x.matcap&&(S.matcap.value=x.matcap)}function R(S,x){const U=e.get(x).light;S.referencePosition.value.setFromMatrixPosition(U.matrixWorld),S.nearDistance.value=U.shadow.camera.near,S.farDistance.value=U.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function iS(n,e,t,i){let r={},a={},o=[];const l=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function f(U,I){const B=I.program;i.uniformBlockBinding(U,B)}function u(U,I){let B=r[U.id];B===void 0&&(y(U),B=h(U),r[U.id]=B,U.addEventListener("dispose",S));const C=I.program;i.updateUBOMapping(U,C);const E=e.render.frame;a[U.id]!==E&&(m(U),a[U.id]=E)}function h(U){const I=p();U.__bindingPointIndex=I;const B=n.createBuffer(),C=U.__size,E=U.usage;return n.bindBuffer(n.UNIFORM_BUFFER,B),n.bufferData(n.UNIFORM_BUFFER,C,E),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,I,B),B}function p(){for(let U=0;U<l;U++)if(o.indexOf(U)===-1)return o.push(U),U;return kt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function m(U){const I=r[U.id],B=U.uniforms,C=U.__cache;n.bindBuffer(n.UNIFORM_BUFFER,I);for(let E=0,A=B.length;E<A;E++){const O=Array.isArray(B[E])?B[E]:[B[E]];for(let M=0,v=O.length;M<v;M++){const F=O[M];if(g(F,E,M,C)===!0){const L=F.__offset,V=Array.isArray(F.value)?F.value:[F.value];let X=0;for(let Z=0;Z<V.length;Z++){const $=V[Z],ne=R($);typeof $=="number"||typeof $=="boolean"?(F.__data[0]=$,n.bufferSubData(n.UNIFORM_BUFFER,L+X,F.__data)):$.isMatrix3?(F.__data[0]=$.elements[0],F.__data[1]=$.elements[1],F.__data[2]=$.elements[2],F.__data[3]=0,F.__data[4]=$.elements[3],F.__data[5]=$.elements[4],F.__data[6]=$.elements[5],F.__data[7]=0,F.__data[8]=$.elements[6],F.__data[9]=$.elements[7],F.__data[10]=$.elements[8],F.__data[11]=0):($.toArray(F.__data,X),X+=ne.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,L,F.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function g(U,I,B,C){const E=U.value,A=I+"_"+B;if(C[A]===void 0)return typeof E=="number"||typeof E=="boolean"?C[A]=E:C[A]=E.clone(),!0;{const O=C[A];if(typeof E=="number"||typeof E=="boolean"){if(O!==E)return C[A]=E,!0}else if(O.equals(E)===!1)return O.copy(E),!0}return!1}function y(U){const I=U.uniforms;let B=0;const C=16;for(let A=0,O=I.length;A<O;A++){const M=Array.isArray(I[A])?I[A]:[I[A]];for(let v=0,F=M.length;v<F;v++){const L=M[v],V=Array.isArray(L.value)?L.value:[L.value];for(let X=0,Z=V.length;X<Z;X++){const $=V[X],ne=R($),Y=B%C,ue=Y%ne.boundary,he=Y+ue;B+=ue,he!==0&&C-he<ne.storage&&(B+=C-he),L.__data=new Float32Array(ne.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=B,B+=ne.storage}}}const E=B%C;return E>0&&(B+=C-E),U.__size=B,U.__cache={},this}function R(U){const I={boundary:0,storage:0};return typeof U=="number"||typeof U=="boolean"?(I.boundary=4,I.storage=4):U.isVector2?(I.boundary=8,I.storage=8):U.isVector3||U.isColor?(I.boundary=16,I.storage=12):U.isVector4?(I.boundary=16,I.storage=16):U.isMatrix3?(I.boundary=48,I.storage=48):U.isMatrix4?(I.boundary=64,I.storage=64):U.isTexture?it("WebGLRenderer: Texture samplers can not be part of an uniforms group."):it("WebGLRenderer: Unsupported uniform value type.",U),I}function S(U){const I=U.target;I.removeEventListener("dispose",S);const B=o.indexOf(I.__bindingPointIndex);o.splice(B,1),n.deleteBuffer(r[I.id]),delete r[I.id],delete a[I.id]}function x(){for(const U in r)n.deleteBuffer(r[U]);o=[],r={},a={}}return{bind:f,update:u,dispose:x}}const rS=new Uint16Array([11481,15204,11534,15171,11808,15015,12385,14843,12894,14716,13396,14600,13693,14483,13976,14366,14237,14171,14405,13961,14511,13770,14605,13598,14687,13444,14760,13305,14822,13066,14876,12857,14923,12675,14963,12517,14997,12379,15025,12230,15049,12023,15070,11843,15086,11687,15100,11551,15111,11433,15120,11330,15127,11217,15132,11060,15135,10922,15138,10801,15139,10695,15139,10600,13012,14923,13020,14917,13064,14886,13176,14800,13349,14666,13513,14526,13724,14398,13960,14230,14200,14020,14383,13827,14488,13651,14583,13491,14667,13348,14740,13132,14803,12908,14856,12713,14901,12542,14938,12394,14968,12241,14992,12017,15010,11822,15024,11654,15034,11507,15041,11380,15044,11269,15044,11081,15042,10913,15037,10764,15031,10635,15023,10520,15014,10419,15003,10330,13657,14676,13658,14673,13670,14660,13698,14622,13750,14547,13834,14442,13956,14317,14112,14093,14291,13889,14407,13704,14499,13538,14586,13389,14664,13201,14733,12966,14792,12758,14842,12577,14882,12418,14915,12272,14940,12033,14959,11826,14972,11646,14980,11490,14983,11355,14983,11212,14979,11008,14971,10830,14961,10675,14950,10540,14936,10420,14923,10315,14909,10204,14894,10041,14089,14460,14090,14459,14096,14452,14112,14431,14141,14388,14186,14305,14252,14130,14341,13941,14399,13756,14467,13585,14539,13430,14610,13272,14677,13026,14737,12808,14790,12617,14833,12449,14869,12303,14896,12065,14916,11845,14929,11655,14937,11490,14939,11347,14936,11184,14930,10970,14921,10783,14912,10621,14900,10480,14885,10356,14867,10247,14848,10062,14827,9894,14805,9745,14400,14208,14400,14206,14402,14198,14406,14174,14415,14122,14427,14035,14444,13913,14469,13767,14504,13613,14548,13463,14598,13324,14651,13082,14704,12858,14752,12658,14795,12483,14831,12330,14860,12106,14881,11875,14895,11675,14903,11501,14905,11351,14903,11178,14900,10953,14892,10757,14880,10589,14865,10442,14847,10313,14827,10162,14805,9965,14782,9792,14757,9642,14731,9507,14562,13883,14562,13883,14563,13877,14566,13862,14570,13830,14576,13773,14584,13689,14595,13582,14613,13461,14637,13336,14668,13120,14704,12897,14741,12695,14776,12516,14808,12358,14835,12150,14856,11910,14870,11701,14878,11519,14882,11361,14884,11187,14880,10951,14871,10748,14858,10572,14842,10418,14823,10286,14801,10099,14777,9897,14751,9722,14725,9567,14696,9430,14666,9309,14702,13604,14702,13604,14702,13600,14703,13591,14705,13570,14707,13533,14709,13477,14712,13400,14718,13305,14727,13106,14743,12907,14762,12716,14784,12539,14807,12380,14827,12190,14844,11943,14855,11727,14863,11539,14870,11376,14871,11204,14868,10960,14858,10748,14845,10565,14829,10406,14809,10269,14786,10058,14761,9852,14734,9671,14705,9512,14674,9374,14641,9253,14608,9076,14821,13366,14821,13365,14821,13364,14821,13358,14821,13344,14821,13320,14819,13252,14817,13145,14815,13011,14814,12858,14817,12698,14823,12539,14832,12389,14841,12214,14850,11968,14856,11750,14861,11558,14866,11390,14867,11226,14862,10972,14853,10754,14840,10565,14823,10401,14803,10259,14780,10032,14754,9820,14725,9635,14694,9473,14661,9333,14627,9203,14593,8988,14557,8798,14923,13014,14922,13014,14922,13012,14922,13004,14920,12987,14919,12957,14915,12907,14909,12834,14902,12738,14894,12623,14888,12498,14883,12370,14880,12203,14878,11970,14875,11759,14873,11569,14874,11401,14872,11243,14865,10986,14855,10762,14842,10568,14825,10401,14804,10255,14781,10017,14754,9799,14725,9611,14692,9445,14658,9301,14623,9139,14587,8920,14548,8729,14509,8562,15008,12672,15008,12672,15008,12671,15007,12667,15005,12656,15001,12637,14997,12605,14989,12556,14978,12490,14966,12407,14953,12313,14940,12136,14927,11934,14914,11742,14903,11563,14896,11401,14889,11247,14879,10992,14866,10767,14851,10570,14833,10400,14812,10252,14789,10007,14761,9784,14731,9592,14698,9424,14663,9279,14627,9088,14588,8868,14548,8676,14508,8508,14467,8360,15080,12386,15080,12386,15079,12385,15078,12383,15076,12378,15072,12367,15066,12347,15057,12315,15045,12253,15030,12138,15012,11998,14993,11845,14972,11685,14951,11530,14935,11383,14920,11228,14904,10981,14887,10762,14870,10567,14850,10397,14827,10248,14803,9997,14774,9771,14743,9578,14710,9407,14674,9259,14637,9048,14596,8826,14555,8632,14514,8464,14471,8317,14427,8182,15139,12008,15139,12008,15138,12008,15137,12007,15135,12003,15130,11990,15124,11969,15115,11929,15102,11872,15086,11794,15064,11693,15041,11581,15013,11459,14987,11336,14966,11170,14944,10944,14921,10738,14898,10552,14875,10387,14850,10239,14824,9983,14794,9758,14762,9563,14728,9392,14692,9244,14653,9014,14611,8791,14569,8597,14526,8427,14481,8281,14436,8110,14391,7885,15188,11617,15188,11617,15187,11617,15186,11618,15183,11617,15179,11612,15173,11601,15163,11581,15150,11546,15133,11495,15110,11427,15083,11346,15051,11246,15024,11057,14996,10868,14967,10687,14938,10517,14911,10362,14882,10206,14853,9956,14821,9737,14787,9543,14752,9375,14715,9228,14675,8980,14632,8760,14589,8565,14544,8395,14498,8248,14451,8049,14404,7824,14357,7630,15228,11298,15228,11298,15227,11299,15226,11301,15223,11303,15219,11302,15213,11299,15204,11290,15191,11271,15174,11217,15150,11129,15119,11015,15087,10886,15057,10744,15024,10599,14990,10455,14957,10318,14924,10143,14891,9911,14856,9701,14820,9516,14782,9352,14744,9200,14703,8946,14659,8725,14615,8533,14568,8366,14521,8220,14472,7992,14423,7770,14374,7578,14315,7408,15260,10819,15260,10819,15259,10822,15258,10826,15256,10832,15251,10836,15246,10841,15237,10838,15225,10821,15207,10788,15183,10734,15151,10660,15120,10571,15087,10469,15049,10359,15012,10249,14974,10041,14937,9837,14900,9647,14860,9475,14820,9320,14779,9147,14736,8902,14691,8688,14646,8499,14598,8335,14549,8189,14499,7940,14448,7720,14397,7529,14347,7363,14256,7218,15285,10410,15285,10411,15285,10413,15284,10418,15282,10425,15278,10434,15272,10442,15264,10449,15252,10445,15235,10433,15210,10403,15179,10358,15149,10301,15113,10218,15073,10059,15033,9894,14991,9726,14951,9565,14909,9413,14865,9273,14822,9073,14777,8845,14730,8641,14682,8459,14633,8300,14583,8129,14531,7883,14479,7670,14426,7482,14373,7321,14305,7176,14201,6939,15305,9939,15305,9940,15305,9945,15304,9955,15302,9967,15298,9989,15293,10010,15286,10033,15274,10044,15258,10045,15233,10022,15205,9975,15174,9903,15136,9808,15095,9697,15053,9578,15009,9451,14965,9327,14918,9198,14871,8973,14825,8766,14775,8579,14725,8408,14675,8259,14622,8058,14569,7821,14515,7615,14460,7435,14405,7276,14350,7108,14256,6866,14149,6653,15321,9444,15321,9445,15321,9448,15320,9458,15317,9470,15314,9490,15310,9515,15302,9540,15292,9562,15276,9579,15251,9577,15226,9559,15195,9519,15156,9463,15116,9389,15071,9304,15025,9208,14978,9023,14927,8838,14878,8661,14827,8496,14774,8344,14722,8206,14667,7973,14612,7749,14556,7555,14499,7382,14443,7229,14385,7025,14322,6791,14210,6588,14100,6409,15333,8920,15333,8921,15332,8927,15332,8943,15329,8965,15326,9002,15322,9048,15316,9106,15307,9162,15291,9204,15267,9221,15244,9221,15212,9196,15175,9134,15133,9043,15088,8930,15040,8801,14990,8665,14938,8526,14886,8391,14830,8261,14775,8087,14719,7866,14661,7664,14603,7482,14544,7322,14485,7178,14426,6936,14367,6713,14281,6517,14166,6348,14054,6198,15341,8360,15341,8361,15341,8366,15341,8379,15339,8399,15336,8431,15332,8473,15326,8527,15318,8585,15302,8632,15281,8670,15258,8690,15227,8690,15191,8664,15149,8612,15104,8543,15055,8456,15001,8360,14948,8259,14892,8122,14834,7923,14776,7734,14716,7558,14656,7397,14595,7250,14534,7070,14472,6835,14410,6628,14350,6443,14243,6283,14125,6135,14010,5889,15348,7715,15348,7717,15348,7725,15347,7745,15345,7780,15343,7836,15339,7905,15334,8e3,15326,8103,15310,8193,15293,8239,15270,8270,15240,8287,15204,8283,15163,8260,15118,8223,15067,8143,15014,8014,14958,7873,14899,7723,14839,7573,14778,7430,14715,7293,14652,7164,14588,6931,14524,6720,14460,6531,14396,6362,14330,6210,14207,6015,14086,5781,13969,5576,15352,7114,15352,7116,15352,7128,15352,7159,15350,7195,15348,7237,15345,7299,15340,7374,15332,7457,15317,7544,15301,7633,15280,7703,15251,7754,15216,7775,15176,7767,15131,7733,15079,7670,15026,7588,14967,7492,14906,7387,14844,7278,14779,7171,14714,6965,14648,6770,14581,6587,14515,6420,14448,6269,14382,6123,14299,5881,14172,5665,14049,5477,13929,5310,15355,6329,15355,6330,15355,6339,15355,6362,15353,6410,15351,6472,15349,6572,15344,6688,15337,6835,15323,6985,15309,7142,15287,7220,15260,7277,15226,7310,15188,7326,15142,7318,15090,7285,15036,7239,14976,7177,14914,7045,14849,6892,14782,6736,14714,6581,14645,6433,14576,6293,14506,6164,14438,5946,14369,5733,14270,5540,14140,5369,14014,5216,13892,5043,15357,5483,15357,5484,15357,5496,15357,5528,15356,5597,15354,5692,15351,5835,15347,6011,15339,6195,15328,6317,15314,6446,15293,6566,15268,6668,15235,6746,15197,6796,15152,6811,15101,6790,15046,6748,14985,6673,14921,6583,14854,6479,14785,6371,14714,6259,14643,6149,14571,5946,14499,5750,14428,5567,14358,5401,14242,5250,14109,5111,13980,4870,13856,4657,15359,4555,15359,4557,15358,4573,15358,4633,15357,4715,15355,4841,15353,5061,15349,5216,15342,5391,15331,5577,15318,5770,15299,5967,15274,6150,15243,6223,15206,6280,15161,6310,15111,6317,15055,6300,14994,6262,14928,6208,14860,6141,14788,5994,14715,5838,14641,5684,14566,5529,14492,5384,14418,5247,14346,5121,14216,4892,14079,4682,13948,4496,13822,4330,15359,3498,15359,3501,15359,3520,15359,3598,15358,3719,15356,3860,15355,4137,15351,4305,15344,4563,15334,4809,15321,5116,15303,5273,15280,5418,15250,5547,15214,5653,15170,5722,15120,5761,15064,5763,15002,5733,14935,5673,14865,5597,14792,5504,14716,5400,14640,5294,14563,5185,14486,5041,14410,4841,14335,4655,14191,4482,14051,4325,13918,4183,13790,4012,15360,2282,15360,2285,15360,2306,15360,2401,15359,2547,15357,2748,15355,3103,15352,3349,15345,3675,15336,4020,15324,4272,15307,4496,15285,4716,15255,4908,15220,5086,15178,5170,15128,5214,15072,5234,15010,5231,14943,5206,14871,5166,14796,5102,14718,4971,14639,4833,14559,4687,14480,4541,14402,4401,14315,4268,14167,4142,14025,3958,13888,3747,13759,3556,15360,923,15360,925,15360,946,15360,1052,15359,1214,15357,1494,15356,1892,15352,2274,15346,2663,15338,3099,15326,3393,15309,3679,15288,3980,15260,4183,15226,4325,15185,4437,15136,4517,15080,4570,15018,4591,14950,4581,14877,4545,14800,4485,14720,4411,14638,4325,14556,4231,14475,4136,14395,3988,14297,3803,14145,3628,13999,3465,13861,3314,13729,3177,15360,263,15360,264,15360,272,15360,325,15359,407,15358,548,15356,780,15352,1144,15347,1580,15339,2099,15328,2425,15312,2795,15292,3133,15264,3329,15232,3517,15191,3689,15143,3819,15088,3923,15025,3978,14956,3999,14882,3979,14804,3931,14722,3855,14639,3756,14554,3645,14470,3529,14388,3409,14279,3289,14124,3173,13975,3055,13834,2848,13701,2658,15360,49,15360,49,15360,52,15360,75,15359,111,15358,201,15356,283,15353,519,15348,726,15340,1045,15329,1415,15314,1795,15295,2173,15269,2410,15237,2649,15197,2866,15150,3054,15095,3140,15032,3196,14963,3228,14888,3236,14808,3224,14725,3191,14639,3146,14553,3088,14466,2976,14382,2836,14262,2692,14103,2549,13952,2409,13808,2278,13674,2154,15360,4,15360,4,15360,4,15360,13,15359,33,15358,59,15357,112,15353,199,15348,302,15341,456,15331,628,15316,827,15297,1082,15272,1332,15241,1601,15202,1851,15156,2069,15101,2172,15039,2256,14970,2314,14894,2348,14813,2358,14728,2344,14640,2311,14551,2263,14463,2203,14376,2133,14247,2059,14084,1915,13930,1761,13784,1609,13648,1464,15360,0,15360,0,15360,0,15360,3,15359,18,15358,26,15357,53,15354,80,15348,97,15341,165,15332,238,15318,326,15299,427,15275,529,15245,654,15207,771,15161,885,15108,994,15046,1089,14976,1170,14900,1229,14817,1266,14731,1284,14641,1282,14550,1260,14460,1223,14370,1174,14232,1116,14066,1050,13909,981,13761,910,13623,839]);let Si=null;function aS(){return Si===null&&(Si=new Na(rS,32,32,ic,Ni),Si.minFilter=Zt,Si.magFilter=Zt,Si.wrapS=Pn,Si.wrapT=Pn,Si.generateMipmaps=!1,Si.needsUpdate=!0),Si}class sS{constructor(e={}){const{canvas:t=N0(),context:i=null,depth:r=!0,stencil:a=!1,alpha:o=!1,antialias:l=!1,premultipliedAlpha:f=!0,preserveDrawingBuffer:u=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:m=!1}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;const y=new Set([ac,rc,nc]),R=new Set([kn,Qi,Da,La,ec,tc]),S=new Uint32Array(4),x=new Int32Array(4);let U=null,I=null;const B=[],C=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ai,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const E=this;let A=!1;this._outputColorSpace=Rn;let O=0,M=0,v=null,F=-1,L=null;const V=new zt,X=new zt;let Z=null;const $=new Tt(0);let ne=0,Y=t.width,ue=t.height,he=1,Fe=null,Qe=null;const at=new zt(0,0,Y,ue),ut=new zt(0,0,Y,ue);let ft=!1;const se=new Vu;let le=!1,Ee=!1;const je=new Wt,Ne=new te,nt=new zt,Ct={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let _e=!1;function Ze(){return v===null?he:1}let k=i;function Ye(P,W){return t.getContext(P,W)}try{const P={alpha:!0,depth:r,stencil:a,antialias:l,premultipliedAlpha:f,preserveDrawingBuffer:u,powerPreference:h,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Zl}`),t.addEventListener("webglcontextlost",de,!1),t.addEventListener("webglcontextrestored",oe,!1),t.addEventListener("webglcontextcreationerror",Te,!1),k===null){const W="webgl2";if(k=Ye(W,P),k===null)throw Ye(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(P){throw P("WebGLRenderer: "+P.message),P}let He,st,Se,ht,Le,We,D,T,j,ie,ae,Q,Oe,ve,Ve,Ue,ce,re,Re,Ie,Me,Be,G,ye;function xe(){He=new p_(k),He.init(),Be=new Kv(k,He),st=new a_(k,He,e,Be),Se=new jv(k,He),st.reversedDepthBuffer&&m&&Se.buffers.depth.setReversed(!0),ht=new x_(k),Le=new Uv,We=new $v(k,He,Se,Le,st,Be,ht),D=new o_(E),T=new h_(E),j=new ym(k),G=new i_(k,j),ie=new m_(k,j,ht,G),ae=new v_(k,ie,j,ht),Re=new __(k,st,We),Ue=new s_(Le),Q=new Fv(E,D,T,He,st,G,Ue),Oe=new nS(E,Le),ve=new Ov,Ve=new Hv(He),re=new n_(E,D,T,Se,ae,g,f),ce=new qv(E,ae,st),ye=new iS(k,ht,st,Se),Ie=new r_(k,He,ht),Me=new g_(k,He,ht),ht.programs=Q.programs,E.capabilities=st,E.extensions=He,E.properties=Le,E.renderLists=ve,E.shadowMap=ce,E.state=Se,E.info=ht}xe();const ge=new eS(E,k);this.xr=ge,this.getContext=function(){return k},this.getContextAttributes=function(){return k.getContextAttributes()},this.forceContextLoss=function(){const P=He.get("WEBGL_lose_context");P&&P.loseContext()},this.forceContextRestore=function(){const P=He.get("WEBGL_lose_context");P&&P.restoreContext()},this.getPixelRatio=function(){return he},this.setPixelRatio=function(P){P!==void 0&&(he=P,this.setSize(Y,ue,!1))},this.getSize=function(P){return P.set(Y,ue)},this.setSize=function(P,W,J=!0){if(ge.isPresenting){it("WebGLRenderer: Can't change size while VR device is presenting.");return}Y=P,ue=W,t.width=Math.floor(P*he),t.height=Math.floor(W*he),J===!0&&(t.style.width=P+"px",t.style.height=W+"px"),this.setViewport(0,0,P,W)},this.getDrawingBufferSize=function(P){return P.set(Y*he,ue*he).floor()},this.setDrawingBufferSize=function(P,W,J){Y=P,ue=W,he=J,t.width=Math.floor(P*J),t.height=Math.floor(W*J),this.setViewport(0,0,P,W)},this.getCurrentViewport=function(P){return P.copy(V)},this.getViewport=function(P){return P.copy(at)},this.setViewport=function(P,W,J,ee){P.isVector4?at.set(P.x,P.y,P.z,P.w):at.set(P,W,J,ee),Se.viewport(V.copy(at).multiplyScalar(he).round())},this.getScissor=function(P){return P.copy(ut)},this.setScissor=function(P,W,J,ee){P.isVector4?ut.set(P.x,P.y,P.z,P.w):ut.set(P,W,J,ee),Se.scissor(X.copy(ut).multiplyScalar(he).round())},this.getScissorTest=function(){return ft},this.setScissorTest=function(P){Se.setScissorTest(ft=P)},this.setOpaqueSort=function(P){Fe=P},this.setTransparentSort=function(P){Qe=P},this.getClearColor=function(P){return P.copy(re.getClearColor())},this.setClearColor=function(){re.setClearColor(...arguments)},this.getClearAlpha=function(){return re.getClearAlpha()},this.setClearAlpha=function(){re.setClearAlpha(...arguments)},this.clear=function(P=!0,W=!0,J=!0){let ee=0;if(P){let q=!1;if(v!==null){const pe=v.texture.format;q=y.has(pe)}if(q){const pe=v.texture.type,we=R.has(pe),De=re.getClearColor(),Pe=re.getClearAlpha(),Ke=De.r,Je=De.g,qe=De.b;we?(S[0]=Ke,S[1]=Je,S[2]=qe,S[3]=Pe,k.clearBufferuiv(k.COLOR,0,S)):(x[0]=Ke,x[1]=Je,x[2]=qe,x[3]=Pe,k.clearBufferiv(k.COLOR,0,x))}else ee|=k.COLOR_BUFFER_BIT}W&&(ee|=k.DEPTH_BUFFER_BIT),J&&(ee|=k.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k.clear(ee)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",de,!1),t.removeEventListener("webglcontextrestored",oe,!1),t.removeEventListener("webglcontextcreationerror",Te,!1),re.dispose(),ve.dispose(),Ve.dispose(),Le.dispose(),D.dispose(),T.dispose(),ae.dispose(),G.dispose(),ye.dispose(),Q.dispose(),ge.dispose(),ge.removeEventListener("sessionstart",Zn),ge.removeEventListener("sessionend",tr),Jn.stop()};function de(P){P.preventDefault(),qc("WebGLRenderer: Context Lost."),A=!0}function oe(){qc("WebGLRenderer: Context Restored."),A=!1;const P=ht.autoReset,W=ce.enabled,J=ce.autoUpdate,ee=ce.needsUpdate,q=ce.type;xe(),ht.autoReset=P,ce.enabled=W,ce.autoUpdate=J,ce.needsUpdate=ee,ce.type=q}function Te(P){kt("WebGLRenderer: A WebGL context could not be created. Reason: ",P.statusMessage)}function et(P){const W=P.target;W.removeEventListener("dispose",et),At(W)}function At(P){mt(P),Le.remove(P)}function mt(P){const W=Le.get(P).programs;W!==void 0&&(W.forEach(function(J){Q.releaseProgram(J)}),P.isShaderMaterial&&Q.releaseShaderCache(P))}this.renderBufferDirect=function(P,W,J,ee,q,pe){W===null&&(W=Ct);const we=q.isMesh&&q.matrixWorld.determinant()<0,De=un(P,W,J,ee,q);Se.setMaterial(ee,we);let Pe=J.index,Ke=1;if(ee.wireframe===!0){if(Pe=ie.getWireframeAttribute(J),Pe===void 0)return;Ke=2}const Je=J.drawRange,qe=J.attributes.position;let ct=Je.start*Ke,vt=(Je.start+Je.count)*Ke;pe!==null&&(ct=Math.max(ct,pe.start*Ke),vt=Math.min(vt,(pe.start+pe.count)*Ke)),Pe!==null?(ct=Math.max(ct,0),vt=Math.min(vt,Pe.count)):qe!=null&&(ct=Math.max(ct,0),vt=Math.min(vt,qe.count));const Ft=vt-ct;if(Ft<0||Ft===1/0)return;G.setup(q,ee,De,J,Pe);let Ut,yt=Ie;if(Pe!==null&&(Ut=j.get(Pe),yt=Me,yt.setIndex(Ut)),q.isMesh)ee.wireframe===!0?(Se.setLineWidth(ee.wireframeLinewidth*Ze()),yt.setMode(k.LINES)):yt.setMode(k.TRIANGLES);else if(q.isLine){let $e=ee.linewidth;$e===void 0&&($e=1),Se.setLineWidth($e*Ze()),q.isLineSegments?yt.setMode(k.LINES):q.isLineLoop?yt.setMode(k.LINE_LOOP):yt.setMode(k.LINE_STRIP)}else q.isPoints?yt.setMode(k.POINTS):q.isSprite&&yt.setMode(k.TRIANGLES);if(q.isBatchedMesh)if(q._multiDrawInstances!==null)Ua("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),yt.renderMultiDrawInstances(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount,q._multiDrawInstances);else if(He.get("WEBGL_multi_draw"))yt.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{const $e=q._multiDrawStarts,Pt=q._multiDrawCounts,pt=q._multiDrawCount,dn=Pe?j.get(Pe).bytesPerElement:1,Vn=Le.get(ee).currentProgram.getUniforms();for(let Yt=0;Yt<pt;Yt++)Vn.setValue(k,"_gl_DrawID",Yt),yt.render($e[Yt]/dn,Pt[Yt])}else if(q.isInstancedMesh)yt.renderInstances(ct,Ft,q.count);else if(J.isInstancedBufferGeometry){const $e=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,Pt=Math.min(J.instanceCount,$e);yt.renderInstances(ct,Ft,Pt)}else yt.render(ct,Ft)};function Mn(P,W,J){P.transparent===!0&&P.side===Ei&&P.forceSinglePass===!1?(P.side=bn,P.needsUpdate=!0,nr(P,W,J),P.side=Ji,P.needsUpdate=!0,nr(P,W,J),P.side=Ei):nr(P,W,J)}this.compile=function(P,W,J=null){J===null&&(J=P),I=Ve.get(J),I.init(W),C.push(I),J.traverseVisible(function(q){q.isLight&&q.layers.test(W.layers)&&(I.pushLight(q),q.castShadow&&I.pushShadow(q))}),P!==J&&P.traverseVisible(function(q){q.isLight&&q.layers.test(W.layers)&&(I.pushLight(q),q.castShadow&&I.pushShadow(q))}),I.setupLights();const ee=new Set;return P.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;const pe=q.material;if(pe)if(Array.isArray(pe))for(let we=0;we<pe.length;we++){const De=pe[we];Mn(De,J,q),ee.add(De)}else Mn(pe,J,q),ee.add(pe)}),I=C.pop(),ee},this.compileAsync=function(P,W,J=null){const ee=this.compile(P,W,J);return new Promise(q=>{function pe(){if(ee.forEach(function(we){Le.get(we).currentProgram.isReady()&&ee.delete(we)}),ee.size===0){q(P);return}setTimeout(pe,10)}He.get("KHR_parallel_shader_compile")!==null?pe():setTimeout(pe,10)})};let fn=null;function Oi(P){fn&&fn(P)}function Zn(){Jn.stop()}function tr(){Jn.start()}const Jn=new qu;Jn.setAnimationLoop(Oi),typeof self<"u"&&Jn.setContext(self),this.setAnimationLoop=function(P){fn=P,ge.setAnimationLoop(P),P===null?Jn.stop():Jn.start()},ge.addEventListener("sessionstart",Zn),ge.addEventListener("sessionend",tr),this.render=function(P,W){if(W!==void 0&&W.isCamera!==!0){kt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;if(P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),ge.enabled===!0&&ge.isPresenting===!0&&(ge.cameraAutoUpdate===!0&&ge.updateCamera(W),W=ge.getCamera()),P.isScene===!0&&P.onBeforeRender(E,P,W,v),I=Ve.get(P,C.length),I.init(W),C.push(I),je.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),se.setFromProjectionMatrix(je,si,W.reversedDepth),Ee=this.localClippingEnabled,le=Ue.init(this.clippingPlanes,Ee),U=ve.get(P,B.length),U.init(),B.push(U),ge.enabled===!0&&ge.isPresenting===!0){const pe=E.xr.getDepthSensingMesh();pe!==null&&Er(pe,W,-1/0,E.sortObjects)}Er(P,W,0,E.sortObjects),U.finish(),E.sortObjects===!0&&U.sort(Fe,Qe),_e=ge.enabled===!1||ge.isPresenting===!1||ge.hasDepthSensing()===!1,_e&&re.addToRenderList(U,P),this.info.render.frame++,le===!0&&Ue.beginShadows();const J=I.state.shadowsArray;ce.render(J,P,W),le===!0&&Ue.endShadows(),this.info.autoReset===!0&&this.info.reset();const ee=U.opaque,q=U.transmissive;if(I.setupLights(),W.isArrayCamera){const pe=W.cameras;if(q.length>0)for(let we=0,De=pe.length;we<De;we++){const Pe=pe[we];Ha(ee,q,P,Pe)}_e&&re.render(P);for(let we=0,De=pe.length;we<De;we++){const Pe=pe[we];fa(U,P,Pe,Pe.viewport)}}else q.length>0&&Ha(ee,q,P,W),_e&&re.render(P),fa(U,P,W);v!==null&&M===0&&(We.updateMultisampleRenderTarget(v),We.updateRenderTargetMipmap(v)),P.isScene===!0&&P.onAfterRender(E,P,W),G.resetDefaultState(),F=-1,L=null,C.pop(),C.length>0?(I=C[C.length-1],le===!0&&Ue.setGlobalState(E.clippingPlanes,I.state.camera)):I=null,B.pop(),B.length>0?U=B[B.length-1]:U=null};function Er(P,W,J,ee){if(P.visible===!1)return;if(P.layers.test(W.layers)){if(P.isGroup)J=P.renderOrder;else if(P.isLOD)P.autoUpdate===!0&&P.update(W);else if(P.isLight)I.pushLight(P),P.castShadow&&I.pushShadow(P);else if(P.isSprite){if(!P.frustumCulled||se.intersectsSprite(P)){ee&&nt.setFromMatrixPosition(P.matrixWorld).applyMatrix4(je);const we=ae.update(P),De=P.material;De.visible&&U.push(P,we,De,J,nt.z,null)}}else if((P.isMesh||P.isLine||P.isPoints)&&(!P.frustumCulled||se.intersectsObject(P))){const we=ae.update(P),De=P.material;if(ee&&(P.boundingSphere!==void 0?(P.boundingSphere===null&&P.computeBoundingSphere(),nt.copy(P.boundingSphere.center)):(we.boundingSphere===null&&we.computeBoundingSphere(),nt.copy(we.boundingSphere.center)),nt.applyMatrix4(P.matrixWorld).applyMatrix4(je)),Array.isArray(De)){const Pe=we.groups;for(let Ke=0,Je=Pe.length;Ke<Je;Ke++){const qe=Pe[Ke],ct=De[qe.materialIndex];ct&&ct.visible&&U.push(P,we,ct,J,nt.z,qe)}}else De.visible&&U.push(P,we,De,J,nt.z,null)}}const pe=P.children;for(let we=0,De=pe.length;we<De;we++)Er(pe[we],W,J,ee)}function fa(P,W,J,ee){const{opaque:q,transmissive:pe,transparent:we}=P;I.setupLightsView(J),le===!0&&Ue.setGlobalState(E.clippingPlanes,J),ee&&Se.viewport(V.copy(ee)),q.length>0&&Mr(q,W,J),pe.length>0&&Mr(pe,W,J),we.length>0&&Mr(we,W,J),Se.buffers.depth.setTest(!0),Se.buffers.depth.setMask(!0),Se.buffers.color.setMask(!0),Se.setPolygonOffset(!1)}function Ha(P,W,J,ee){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;I.state.transmissionRenderTarget[ee.id]===void 0&&(I.state.transmissionRenderTarget[ee.id]=new Ci(1,1,{generateMipmaps:!0,type:He.has("EXT_color_buffer_half_float")||He.has("EXT_color_buffer_float")?Ni:kn,minFilter:pr,samples:4,stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:_t.workingColorSpace}));const pe=I.state.transmissionRenderTarget[ee.id],we=ee.viewport||V;pe.setSize(we.z*E.transmissionResolutionScale,we.w*E.transmissionResolutionScale);const De=E.getRenderTarget(),Pe=E.getActiveCubeFace(),Ke=E.getActiveMipmapLevel();E.setRenderTarget(pe),E.getClearColor($),ne=E.getClearAlpha(),ne<1&&E.setClearColor(16777215,.5),E.clear(),_e&&re.render(J);const Je=E.toneMapping;E.toneMapping=Ai;const qe=ee.viewport;if(ee.viewport!==void 0&&(ee.viewport=void 0),I.setupLightsView(ee),le===!0&&Ue.setGlobalState(E.clippingPlanes,ee),Mr(P,J,ee),We.updateMultisampleRenderTarget(pe),We.updateRenderTargetMipmap(pe),He.has("WEBGL_multisampled_render_to_texture")===!1){let ct=!1;for(let vt=0,Ft=W.length;vt<Ft;vt++){const Ut=W[vt],{object:yt,geometry:$e,material:Pt,group:pt}=Ut;if(Pt.side===Ei&&yt.layers.test(ee.layers)){const dn=Pt.side;Pt.side=bn,Pt.needsUpdate=!0,Wa(yt,J,ee,$e,Pt,pt),Pt.side=dn,Pt.needsUpdate=!0,ct=!0}}ct===!0&&(We.updateMultisampleRenderTarget(pe),We.updateRenderTargetMipmap(pe))}E.setRenderTarget(De,Pe,Ke),E.setClearColor($,ne),qe!==void 0&&(ee.viewport=qe),E.toneMapping=Je}function Mr(P,W,J){const ee=W.isScene===!0?W.overrideMaterial:null;for(let q=0,pe=P.length;q<pe;q++){const we=P[q],{object:De,geometry:Pe,group:Ke}=we;let Je=we.material;Je.allowOverride===!0&&ee!==null&&(Je=ee),De.layers.test(J.layers)&&Wa(De,W,J,Pe,Je,Ke)}}function Wa(P,W,J,ee,q,pe){P.onBeforeRender(E,W,J,ee,q,pe),P.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,P.matrixWorld),P.normalMatrix.getNormalMatrix(P.modelViewMatrix),q.onBeforeRender(E,W,J,ee,P,pe),q.transparent===!0&&q.side===Ei&&q.forceSinglePass===!1?(q.side=bn,q.needsUpdate=!0,E.renderBufferDirect(J,W,ee,q,P,pe),q.side=Ji,q.needsUpdate=!0,E.renderBufferDirect(J,W,ee,q,P,pe),q.side=Ei):E.renderBufferDirect(J,W,ee,q,P,pe),P.onAfterRender(E,W,J,ee,q,pe)}function nr(P,W,J){W.isScene!==!0&&(W=Ct);const ee=Le.get(P),q=I.state.lights,pe=I.state.shadowsArray,we=q.state.version,De=Q.getParameters(P,q.state,pe,W,J),Pe=Q.getProgramCacheKey(De);let Ke=ee.programs;ee.environment=P.isMeshStandardMaterial?W.environment:null,ee.fog=W.fog,ee.envMap=(P.isMeshStandardMaterial?T:D).get(P.envMap||ee.environment),ee.envMapRotation=ee.environment!==null&&P.envMap===null?W.environmentRotation:P.envMapRotation,Ke===void 0&&(P.addEventListener("dispose",et),Ke=new Map,ee.programs=Ke);let Je=Ke.get(Pe);if(Je!==void 0){if(ee.currentProgram===Je&&ee.lightsStateVersion===we)return ua(P,De),Je}else De.uniforms=Q.getUniforms(P),P.onBeforeCompile(De,E),Je=Q.acquireProgram(De,Pe),Ke.set(Pe,Je),ee.uniforms=De.uniforms;const qe=ee.uniforms;return(!P.isShaderMaterial&&!P.isRawShaderMaterial||P.clipping===!0)&&(qe.clippingPlanes=Ue.uniform),ua(P,De),ee.needsLights=Gn(P),ee.lightsStateVersion=we,ee.needsLights&&(qe.ambientLightColor.value=q.state.ambient,qe.lightProbe.value=q.state.probe,qe.directionalLights.value=q.state.directional,qe.directionalLightShadows.value=q.state.directionalShadow,qe.spotLights.value=q.state.spot,qe.spotLightShadows.value=q.state.spotShadow,qe.rectAreaLights.value=q.state.rectArea,qe.ltc_1.value=q.state.rectAreaLTC1,qe.ltc_2.value=q.state.rectAreaLTC2,qe.pointLights.value=q.state.point,qe.pointLightShadows.value=q.state.pointShadow,qe.hemisphereLights.value=q.state.hemi,qe.directionalShadowMap.value=q.state.directionalShadowMap,qe.directionalShadowMatrix.value=q.state.directionalShadowMatrix,qe.spotShadowMap.value=q.state.spotShadowMap,qe.spotLightMatrix.value=q.state.spotLightMatrix,qe.spotLightMap.value=q.state.spotLightMap,qe.pointShadowMap.value=q.state.pointShadowMap,qe.pointShadowMatrix.value=q.state.pointShadowMatrix),ee.currentProgram=Je,ee.uniformsList=null,Je}function Jt(P){if(P.uniformsList===null){const W=P.currentProgram.getUniforms();P.uniformsList=Rs.seqWithValue(W.seq,P.uniforms)}return P.uniformsList}function ua(P,W){const J=Le.get(P);J.outputColorSpace=W.outputColorSpace,J.batching=W.batching,J.batchingColor=W.batchingColor,J.instancing=W.instancing,J.instancingColor=W.instancingColor,J.instancingMorph=W.instancingMorph,J.skinning=W.skinning,J.morphTargets=W.morphTargets,J.morphNormals=W.morphNormals,J.morphColors=W.morphColors,J.morphTargetsCount=W.morphTargetsCount,J.numClippingPlanes=W.numClippingPlanes,J.numIntersection=W.numClipIntersection,J.vertexAlphas=W.vertexAlphas,J.vertexTangents=W.vertexTangents,J.toneMapping=W.toneMapping}function un(P,W,J,ee,q){W.isScene!==!0&&(W=Ct),We.resetTextureUnits();const pe=W.fog,we=ee.isMeshStandardMaterial?W.environment:null,De=v===null?E.outputColorSpace:v.isXRRenderTarget===!0?v.texture.colorSpace:ci,Pe=(ee.isMeshStandardMaterial?T:D).get(ee.envMap||we),Ke=ee.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,Je=!!J.attributes.tangent&&(!!ee.normalMap||ee.anisotropy>0),qe=!!J.morphAttributes.position,ct=!!J.morphAttributes.normal,vt=!!J.morphAttributes.color;let Ft=Ai;ee.toneMapped&&(v===null||v.isXRRenderTarget===!0)&&(Ft=E.toneMapping);const Ut=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,yt=Ut!==void 0?Ut.length:0,$e=Le.get(ee),Pt=I.state.lights;if(le===!0&&(Ee===!0||P!==L)){const Qt=P===L&&ee.id===F;Ue.setState(ee,P,Qt)}let pt=!1;ee.version===$e.__version?($e.needsLights&&$e.lightsStateVersion!==Pt.state.version||$e.outputColorSpace!==De||q.isBatchedMesh&&$e.batching===!1||!q.isBatchedMesh&&$e.batching===!0||q.isBatchedMesh&&$e.batchingColor===!0&&q.colorTexture===null||q.isBatchedMesh&&$e.batchingColor===!1&&q.colorTexture!==null||q.isInstancedMesh&&$e.instancing===!1||!q.isInstancedMesh&&$e.instancing===!0||q.isSkinnedMesh&&$e.skinning===!1||!q.isSkinnedMesh&&$e.skinning===!0||q.isInstancedMesh&&$e.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&$e.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&$e.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&$e.instancingMorph===!1&&q.morphTexture!==null||$e.envMap!==Pe||ee.fog===!0&&$e.fog!==pe||$e.numClippingPlanes!==void 0&&($e.numClippingPlanes!==Ue.numPlanes||$e.numIntersection!==Ue.numIntersection)||$e.vertexAlphas!==Ke||$e.vertexTangents!==Je||$e.morphTargets!==qe||$e.morphNormals!==ct||$e.morphColors!==vt||$e.toneMapping!==Ft||$e.morphTargetsCount!==yt)&&(pt=!0):(pt=!0,$e.__version=ee.version);let dn=$e.currentProgram;pt===!0&&(dn=nr(ee,W,q));let Vn=!1,Yt=!1,hn=!1;const Dt=dn.getUniforms(),rn=$e.uniforms;if(Se.useProgram(dn.program)&&(Vn=!0,Yt=!0,hn=!0),ee.id!==F&&(F=ee.id,Yt=!0),Vn||L!==P){Se.buffers.depth.getReversed()&&P.reversedDepth!==!0&&(P._reversedDepth=!0,P.updateProjectionMatrix()),Dt.setValue(k,"projectionMatrix",P.projectionMatrix),Dt.setValue(k,"viewMatrix",P.matrixWorldInverse);const en=Dt.map.cameraPosition;en!==void 0&&en.setValue(k,Ne.setFromMatrixPosition(P.matrixWorld)),st.logarithmicDepthBuffer&&Dt.setValue(k,"logDepthBufFC",2/(Math.log(P.far+1)/Math.LN2)),(ee.isMeshPhongMaterial||ee.isMeshToonMaterial||ee.isMeshLambertMaterial||ee.isMeshBasicMaterial||ee.isMeshStandardMaterial||ee.isShaderMaterial)&&Dt.setValue(k,"isOrthographic",P.isOrthographicCamera===!0),L!==P&&(L=P,Yt=!0,hn=!0)}if(q.isSkinnedMesh){Dt.setOptional(k,q,"bindMatrix"),Dt.setOptional(k,q,"bindMatrixInverse");const Qt=q.skeleton;Qt&&(Qt.boneTexture===null&&Qt.computeBoneTexture(),Dt.setValue(k,"boneTexture",Qt.boneTexture,We))}q.isBatchedMesh&&(Dt.setOptional(k,q,"batchingTexture"),Dt.setValue(k,"batchingTexture",q._matricesTexture,We),Dt.setOptional(k,q,"batchingIdTexture"),Dt.setValue(k,"batchingIdTexture",q._indirectTexture,We),Dt.setOptional(k,q,"batchingColorTexture"),q._colorsTexture!==null&&Dt.setValue(k,"batchingColorTexture",q._colorsTexture,We));const jt=J.morphAttributes;if((jt.position!==void 0||jt.normal!==void 0||jt.color!==void 0)&&Re.update(q,J,dn),(Yt||$e.receiveShadow!==q.receiveShadow)&&($e.receiveShadow=q.receiveShadow,Dt.setValue(k,"receiveShadow",q.receiveShadow)),ee.isMeshGouraudMaterial&&ee.envMap!==null&&(rn.envMap.value=Pe,rn.flipEnvMap.value=Pe.isCubeTexture&&Pe.isRenderTargetTexture===!1?-1:1),ee.isMeshStandardMaterial&&ee.envMap===null&&W.environment!==null&&(rn.envMapIntensity.value=W.environmentIntensity),rn.dfgLUT!==void 0&&(rn.dfgLUT.value=aS()),Yt&&(Dt.setValue(k,"toneMappingExposure",E.toneMappingExposure),$e.needsLights&&$s(rn,hn),pe&&ee.fog===!0&&Oe.refreshFogUniforms(rn,pe),Oe.refreshMaterialUniforms(rn,ee,he,ue,I.state.transmissionRenderTarget[P.id]),Rs.upload(k,Jt($e),rn,We)),ee.isShaderMaterial&&ee.uniformsNeedUpdate===!0&&(Rs.upload(k,Jt($e),rn,We),ee.uniformsNeedUpdate=!1),ee.isSpriteMaterial&&Dt.setValue(k,"center",q.center),Dt.setValue(k,"modelViewMatrix",q.modelViewMatrix),Dt.setValue(k,"normalMatrix",q.normalMatrix),Dt.setValue(k,"modelMatrix",q.matrixWorld),ee.isShaderMaterial||ee.isRawShaderMaterial){const Qt=ee.uniformsGroups;for(let en=0,Tr=Qt.length;en<Tr;en++){const ui=Qt[en];ye.update(ui,dn),ye.bind(ui,dn)}}return dn}function $s(P,W){P.ambientLightColor.needsUpdate=W,P.lightProbe.needsUpdate=W,P.directionalLights.needsUpdate=W,P.directionalLightShadows.needsUpdate=W,P.pointLights.needsUpdate=W,P.pointLightShadows.needsUpdate=W,P.spotLights.needsUpdate=W,P.spotLightShadows.needsUpdate=W,P.rectAreaLights.needsUpdate=W,P.hemisphereLights.needsUpdate=W}function Gn(P){return P.isMeshLambertMaterial||P.isMeshToonMaterial||P.isMeshPhongMaterial||P.isMeshStandardMaterial||P.isShadowMaterial||P.isShaderMaterial&&P.lights===!0}this.getActiveCubeFace=function(){return O},this.getActiveMipmapLevel=function(){return M},this.getRenderTarget=function(){return v},this.setRenderTargetTextures=function(P,W,J){const ee=Le.get(P);ee.__autoAllocateDepthBuffer=P.resolveDepthBuffer===!1,ee.__autoAllocateDepthBuffer===!1&&(ee.__useRenderToTexture=!1),Le.get(P.texture).__webglTexture=W,Le.get(P.depthTexture).__webglTexture=ee.__autoAllocateDepthBuffer?void 0:J,ee.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(P,W){const J=Le.get(P);J.__webglFramebuffer=W,J.__useDefaultFramebuffer=W===void 0};const Qn=k.createFramebuffer();this.setRenderTarget=function(P,W=0,J=0){v=P,O=W,M=J;let ee=!0,q=null,pe=!1,we=!1;if(P){const Pe=Le.get(P);if(Pe.__useDefaultFramebuffer!==void 0)Se.bindFramebuffer(k.FRAMEBUFFER,null),ee=!1;else if(Pe.__webglFramebuffer===void 0)We.setupRenderTarget(P);else if(Pe.__hasExternalTextures)We.rebindTextures(P,Le.get(P.texture).__webglTexture,Le.get(P.depthTexture).__webglTexture);else if(P.depthBuffer){const qe=P.depthTexture;if(Pe.__boundDepthTexture!==qe){if(qe!==null&&Le.has(qe)&&(P.width!==qe.image.width||P.height!==qe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");We.setupDepthRenderbuffer(P)}}const Ke=P.texture;(Ke.isData3DTexture||Ke.isDataArrayTexture||Ke.isCompressedArrayTexture)&&(we=!0);const Je=Le.get(P).__webglFramebuffer;P.isWebGLCubeRenderTarget?(Array.isArray(Je[W])?q=Je[W][J]:q=Je[W],pe=!0):P.samples>0&&We.useMultisampledRTT(P)===!1?q=Le.get(P).__webglMultisampledFramebuffer:Array.isArray(Je)?q=Je[J]:q=Je,V.copy(P.viewport),X.copy(P.scissor),Z=P.scissorTest}else V.copy(at).multiplyScalar(he).floor(),X.copy(ut).multiplyScalar(he).floor(),Z=ft;if(J!==0&&(q=Qn),Se.bindFramebuffer(k.FRAMEBUFFER,q)&&ee&&Se.drawBuffers(P,q),Se.viewport(V),Se.scissor(X),Se.setScissorTest(Z),pe){const Pe=Le.get(P.texture);k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_CUBE_MAP_POSITIVE_X+W,Pe.__webglTexture,J)}else if(we){const Pe=W;for(let Ke=0;Ke<P.textures.length;Ke++){const Je=Le.get(P.textures[Ke]);k.framebufferTextureLayer(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0+Ke,Je.__webglTexture,J,Pe)}}else if(P!==null&&J!==0){const Pe=Le.get(P.texture);k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_2D,Pe.__webglTexture,J)}F=-1},this.readRenderTargetPixels=function(P,W,J,ee,q,pe,we,De=0){if(!(P&&P.isWebGLRenderTarget)){kt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pe=Le.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&we!==void 0&&(Pe=Pe[we]),Pe){Se.bindFramebuffer(k.FRAMEBUFFER,Pe);try{const Ke=P.textures[De],Je=Ke.format,qe=Ke.type;if(!st.textureFormatReadable(Je)){kt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!st.textureTypeReadable(qe)){kt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=P.width-ee&&J>=0&&J<=P.height-q&&(P.textures.length>1&&k.readBuffer(k.COLOR_ATTACHMENT0+De),k.readPixels(W,J,ee,q,Be.convert(Je),Be.convert(qe),pe))}finally{const Ke=v!==null?Le.get(v).__webglFramebuffer:null;Se.bindFramebuffer(k.FRAMEBUFFER,Ke)}}},this.readRenderTargetPixelsAsync=async function(P,W,J,ee,q,pe,we,De=0){if(!(P&&P.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Pe=Le.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&we!==void 0&&(Pe=Pe[we]),Pe)if(W>=0&&W<=P.width-ee&&J>=0&&J<=P.height-q){Se.bindFramebuffer(k.FRAMEBUFFER,Pe);const Ke=P.textures[De],Je=Ke.format,qe=Ke.type;if(!st.textureFormatReadable(Je))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!st.textureTypeReadable(qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ct=k.createBuffer();k.bindBuffer(k.PIXEL_PACK_BUFFER,ct),k.bufferData(k.PIXEL_PACK_BUFFER,pe.byteLength,k.STREAM_READ),P.textures.length>1&&k.readBuffer(k.COLOR_ATTACHMENT0+De),k.readPixels(W,J,ee,q,Be.convert(Je),Be.convert(qe),0);const vt=v!==null?Le.get(v).__webglFramebuffer:null;Se.bindFramebuffer(k.FRAMEBUFFER,vt);const Ft=k.fenceSync(k.SYNC_GPU_COMMANDS_COMPLETE,0);return k.flush(),await O0(k,Ft,4),k.bindBuffer(k.PIXEL_PACK_BUFFER,ct),k.getBufferSubData(k.PIXEL_PACK_BUFFER,0,pe),k.deleteBuffer(ct),k.deleteSync(Ft),pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(P,W=null,J=0){const ee=Math.pow(2,-J),q=Math.floor(P.image.width*ee),pe=Math.floor(P.image.height*ee),we=W!==null?W.x:0,De=W!==null?W.y:0;We.setTexture2D(P,0),k.copyTexSubImage2D(k.TEXTURE_2D,J,0,0,we,De,q,pe),Se.unbindTexture()};const Ks=k.createFramebuffer(),Zs=k.createFramebuffer();this.copyTextureToTexture=function(P,W,J=null,ee=null,q=0,pe=null){pe===null&&(q!==0?(Ua("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),pe=q,q=0):pe=0);let we,De,Pe,Ke,Je,qe,ct,vt,Ft;const Ut=P.isCompressedTexture?P.mipmaps[pe]:P.image;if(J!==null)we=J.max.x-J.min.x,De=J.max.y-J.min.y,Pe=J.isBox3?J.max.z-J.min.z:1,Ke=J.min.x,Je=J.min.y,qe=J.isBox3?J.min.z:0;else{const jt=Math.pow(2,-q);we=Math.floor(Ut.width*jt),De=Math.floor(Ut.height*jt),P.isDataArrayTexture?Pe=Ut.depth:P.isData3DTexture?Pe=Math.floor(Ut.depth*jt):Pe=1,Ke=0,Je=0,qe=0}ee!==null?(ct=ee.x,vt=ee.y,Ft=ee.z):(ct=0,vt=0,Ft=0);const yt=Be.convert(W.format),$e=Be.convert(W.type);let Pt;W.isData3DTexture?(We.setTexture3D(W,0),Pt=k.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(We.setTexture2DArray(W,0),Pt=k.TEXTURE_2D_ARRAY):(We.setTexture2D(W,0),Pt=k.TEXTURE_2D),k.pixelStorei(k.UNPACK_FLIP_Y_WEBGL,W.flipY),k.pixelStorei(k.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),k.pixelStorei(k.UNPACK_ALIGNMENT,W.unpackAlignment);const pt=k.getParameter(k.UNPACK_ROW_LENGTH),dn=k.getParameter(k.UNPACK_IMAGE_HEIGHT),Vn=k.getParameter(k.UNPACK_SKIP_PIXELS),Yt=k.getParameter(k.UNPACK_SKIP_ROWS),hn=k.getParameter(k.UNPACK_SKIP_IMAGES);k.pixelStorei(k.UNPACK_ROW_LENGTH,Ut.width),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,Ut.height),k.pixelStorei(k.UNPACK_SKIP_PIXELS,Ke),k.pixelStorei(k.UNPACK_SKIP_ROWS,Je),k.pixelStorei(k.UNPACK_SKIP_IMAGES,qe);const Dt=P.isDataArrayTexture||P.isData3DTexture,rn=W.isDataArrayTexture||W.isData3DTexture;if(P.isDepthTexture){const jt=Le.get(P),Qt=Le.get(W),en=Le.get(jt.__renderTarget),Tr=Le.get(Qt.__renderTarget);Se.bindFramebuffer(k.READ_FRAMEBUFFER,en.__webglFramebuffer),Se.bindFramebuffer(k.DRAW_FRAMEBUFFER,Tr.__webglFramebuffer);for(let ui=0;ui<Pe;ui++)Dt&&(k.framebufferTextureLayer(k.READ_FRAMEBUFFER,k.COLOR_ATTACHMENT0,Le.get(P).__webglTexture,q,qe+ui),k.framebufferTextureLayer(k.DRAW_FRAMEBUFFER,k.COLOR_ATTACHMENT0,Le.get(W).__webglTexture,pe,Ft+ui)),k.blitFramebuffer(Ke,Je,we,De,ct,vt,we,De,k.DEPTH_BUFFER_BIT,k.NEAREST);Se.bindFramebuffer(k.READ_FRAMEBUFFER,null),Se.bindFramebuffer(k.DRAW_FRAMEBUFFER,null)}else if(q!==0||P.isRenderTargetTexture||Le.has(P)){const jt=Le.get(P),Qt=Le.get(W);Se.bindFramebuffer(k.READ_FRAMEBUFFER,Ks),Se.bindFramebuffer(k.DRAW_FRAMEBUFFER,Zs);for(let en=0;en<Pe;en++)Dt?k.framebufferTextureLayer(k.READ_FRAMEBUFFER,k.COLOR_ATTACHMENT0,jt.__webglTexture,q,qe+en):k.framebufferTexture2D(k.READ_FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_2D,jt.__webglTexture,q),rn?k.framebufferTextureLayer(k.DRAW_FRAMEBUFFER,k.COLOR_ATTACHMENT0,Qt.__webglTexture,pe,Ft+en):k.framebufferTexture2D(k.DRAW_FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_2D,Qt.__webglTexture,pe),q!==0?k.blitFramebuffer(Ke,Je,we,De,ct,vt,we,De,k.COLOR_BUFFER_BIT,k.NEAREST):rn?k.copyTexSubImage3D(Pt,pe,ct,vt,Ft+en,Ke,Je,we,De):k.copyTexSubImage2D(Pt,pe,ct,vt,Ke,Je,we,De);Se.bindFramebuffer(k.READ_FRAMEBUFFER,null),Se.bindFramebuffer(k.DRAW_FRAMEBUFFER,null)}else rn?P.isDataTexture||P.isData3DTexture?k.texSubImage3D(Pt,pe,ct,vt,Ft,we,De,Pe,yt,$e,Ut.data):W.isCompressedArrayTexture?k.compressedTexSubImage3D(Pt,pe,ct,vt,Ft,we,De,Pe,yt,Ut.data):k.texSubImage3D(Pt,pe,ct,vt,Ft,we,De,Pe,yt,$e,Ut):P.isDataTexture?k.texSubImage2D(k.TEXTURE_2D,pe,ct,vt,we,De,yt,$e,Ut.data):P.isCompressedTexture?k.compressedTexSubImage2D(k.TEXTURE_2D,pe,ct,vt,Ut.width,Ut.height,yt,Ut.data):k.texSubImage2D(k.TEXTURE_2D,pe,ct,vt,we,De,yt,$e,Ut);k.pixelStorei(k.UNPACK_ROW_LENGTH,pt),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,dn),k.pixelStorei(k.UNPACK_SKIP_PIXELS,Vn),k.pixelStorei(k.UNPACK_SKIP_ROWS,Yt),k.pixelStorei(k.UNPACK_SKIP_IMAGES,hn),pe===0&&W.generateMipmaps&&k.generateMipmap(Pt),Se.unbindTexture()},this.initRenderTarget=function(P){Le.get(P).__webglFramebuffer===void 0&&We.setupRenderTarget(P)},this.initTexture=function(P){P.isCubeTexture?We.setTextureCube(P,0):P.isData3DTexture?We.setTexture3D(P,0):P.isDataArrayTexture||P.isCompressedArrayTexture?We.setTexture2DArray(P,0):We.setTexture2D(P,0),Se.unbindTexture()},this.resetState=function(){O=0,M=0,v=null,Se.reset(),G.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return si}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=_t._getDrawingBufferColorSpace(e),t.unpackColorSpace=_t._getUnpackColorSpace()}}const Zu=(n,e,t)=>{let i;switch(n){case kn:i=new Uint8ClampedArray(e*t*4);break;case Ni:i=new Uint16Array(e*t*4);break;case Qi:i=new Uint32Array(e*t*4);break;case Jl:i=new Int8Array(e*t*4);break;case Ql:i=new Int16Array(e*t*4);break;case Ws:i=new Int32Array(e*t*4);break;case Bn:i=new Float32Array(e*t*4);break;default:throw new Error("Unsupported data type")}return i};let ys;const oS=(n,e,t,i)=>{if(ys!==void 0)return ys;const r=new Ci(1,1,i);e.setRenderTarget(r);const a=new fi(new la,new lc({color:16777215}));e.render(a,t),e.setRenderTarget(null);const o=Zu(n,r.width,r.height);return e.readRenderTargetPixels(r,0,0,r.width,r.height,o),r.dispose(),a.geometry.dispose(),a.material.dispose(),ys=o[0]!==0,ys};class js{_renderer;_rendererIsDisposable=!1;_material;_scene;_camera;_quad;_renderTarget;_width;_height;_type;_colorSpace;_supportsReadPixels=!0;constructor(e){this._width=e.width,this._height=e.height,this._type=e.type,this._colorSpace=e.colorSpace;const t={format:xn,depthBuffer:!1,stencilBuffer:!1,type:this._type,colorSpace:this._colorSpace,anisotropy:e.renderTargetOptions?.anisotropy!==void 0?e.renderTargetOptions?.anisotropy:1,generateMipmaps:e.renderTargetOptions?.generateMipmaps!==void 0?e.renderTargetOptions?.generateMipmaps:!1,magFilter:e.renderTargetOptions?.magFilter!==void 0?e.renderTargetOptions?.magFilter:Zt,minFilter:e.renderTargetOptions?.minFilter!==void 0?e.renderTargetOptions?.minFilter:Zt,samples:e.renderTargetOptions?.samples!==void 0?e.renderTargetOptions?.samples:void 0,wrapS:e.renderTargetOptions?.wrapS!==void 0?e.renderTargetOptions?.wrapS:Pn,wrapT:e.renderTargetOptions?.wrapT!==void 0?e.renderTargetOptions?.wrapT:Pn};if(this._material=e.material,e.renderer?this._renderer=e.renderer:(this._renderer=js.instantiateRenderer(),this._rendererIsDisposable=!0),this._scene=new hm,this._camera=new Xu,this._camera.position.set(0,0,10),this._camera.left=-.5,this._camera.right=.5,this._camera.top=.5,this._camera.bottom=-.5,this._camera.updateProjectionMatrix(),!oS(this._type,this._renderer,this._camera,t)){let i;switch(this._type){case Ni:i=this._renderer.extensions.has("EXT_color_buffer_float")?Bn:void 0;break}i!==void 0?(console.warn(`This browser does not support reading pixels from ${this._type} RenderTargets, switching to ${Bn}`),this._type=i):(this._supportsReadPixels=!1,console.warn("This browser dos not support toArray or toDataTexture, calls to those methods will result in an error thrown"))}this._quad=new fi(new la,this._material),this._quad.geometry.computeBoundingBox(),this._scene.add(this._quad),this._renderTarget=new Ci(this.width,this.height,t),this._renderTarget.texture.mapping=e.renderTargetOptions?.mapping!==void 0?e.renderTargetOptions?.mapping:Ca}static instantiateRenderer(){const e=new sS;return e.setSize(128,128),e}render=()=>{this._renderer.setRenderTarget(this._renderTarget);try{this._renderer.render(this._scene,this._camera)}catch(e){throw this._renderer.setRenderTarget(null),e}this._renderer.setRenderTarget(null)};toArray(){if(!this._supportsReadPixels)throw new Error("Can't read pixels in this browser");const e=Zu(this._type,this._width,this._height);return this._renderer.readRenderTargetPixels(this._renderTarget,0,0,this._width,this._height,e),e}toDataTexture(e){const t=new Na(this.toArray(),this.width,this.height,xn,this._type,e?.mapping||Ca,e?.wrapS||Pn,e?.wrapT||Pn,e?.magFilter||Zt,e?.minFilter||Zt,e?.anisotropy||1,ci);return t.generateMipmaps=e?.generateMipmaps!==void 0?e?.generateMipmaps:!1,t}disposeOnDemandRenderer(){this._renderer.setRenderTarget(null),this._rendererIsDisposable&&(this._renderer.dispose(),this._renderer.forceContextLoss())}dispose(e){this.disposeOnDemandRenderer(),e&&this.renderTarget.dispose(),this.material instanceof zn&&Object.values(this.material.uniforms).forEach(t=>{t.value instanceof tn&&t.value.dispose()}),Object.values(this.material).forEach(t=>{t instanceof tn&&t.dispose()}),this.material.dispose(),this._quad.geometry.dispose()}get width(){return this._width}set width(e){this._width=e,this._renderTarget.setSize(this._width,this._height)}get height(){return this._height}set height(e){this._height=e,this._renderTarget.setSize(this._width,this._height)}get renderer(){return this._renderer}get renderTarget(){return this._renderTarget}set renderTarget(e){this._renderTarget=e,this._width=e.width,this._height=e.height}get material(){return this._material}get type(){return this._type}get colorSpace(){return this._colorSpace}}const Ju=n=>{let e;if(n instanceof Na){if(!(n.image.data instanceof Uint16Array)&&!(n.image.data instanceof Float32Array))throw new Error("Provided image is not HDR");e=n}else e=new Na(n.data,n.width,n.height,"format"in n?n.format:xn,n.type,Ca,Pa,Pa,Zt,Zt,1,"colorSpace"in n&&n.colorSpace==="srgb"?n.colorSpace:ci),"header"in n&&"gamma"in n&&(e.flipY=!0),e.needsUpdate=!0;return e},lS=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,cS=`
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
`;class fS extends zn{_minContentBoost;_maxContentBoost;_offsetSdr;_offsetHdr;_gamma;constructor({sdr:e,hdr:t,offsetSdr:i,offsetHdr:r,maxContentBoost:a,minContentBoost:o,gamma:l}){if(!a)throw new Error("maxContentBoost is required");if(!e)throw new Error("sdr is required");if(!t)throw new Error("hdr is required");const f=l||[1,1,1],u=i||[1/64,1/64,1/64],h=r||[1/64,1/64,1/64],p=o||1,m=Math.max(a,1.0001);super({name:"GainMapEncoderMaterial",vertexShader:lS,fragmentShader:cS,uniforms:{sdr:{value:e},hdr:{value:t},gamma:{value:new te().fromArray(f)},offsetSdr:{value:new te().fromArray(u)},offsetHdr:{value:new te().fromArray(h)},minLog2:{value:Math.log2(p)},maxLog2:{value:Math.log2(m)}},blending:$n,depthTest:!1,depthWrite:!1}),this._minContentBoost=p,this._maxContentBoost=m,this._offsetSdr=u,this._offsetHdr=h,this._gamma=f,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get gamma(){return this._gamma}set gamma(e){this._gamma=e,this.uniforms.gamma.value=new te().fromArray(e)}get offsetHdr(){return this._offsetHdr}set offsetHdr(e){this._offsetHdr=e,this.uniforms.offsetHdr.value=new te().fromArray(e)}get offsetSdr(){return this._offsetSdr}set offsetSdr(e){this._offsetSdr=e,this.uniforms.offsetSdr.value=new te().fromArray(e)}get minContentBoost(){return this._minContentBoost}set minContentBoost(e){this._minContentBoost=e,this.uniforms.minLog2.value=Math.log2(e)}get maxContentBoost(){return this._maxContentBoost}set maxContentBoost(e){this._maxContentBoost=e,this.uniforms.maxLog2.value=Math.log2(e)}get gainMapMin(){return[Math.log2(this._minContentBoost),Math.log2(this._minContentBoost),Math.log2(this._minContentBoost)]}get gainMapMax(){return[Math.log2(this._maxContentBoost),Math.log2(this._maxContentBoost),Math.log2(this._maxContentBoost)]}get hdrCapacityMin(){return Math.min(Math.max(0,this.gainMapMin[0]),Math.max(0,this.gainMapMin[1]),Math.max(0,this.gainMapMin[2]))}get hdrCapacityMax(){return Math.max(Math.max(0,this.gainMapMax[0]),Math.max(0,this.gainMapMax[1]),Math.max(0,this.gainMapMax[2]))}}const uS=n=>{const{image:e,sdr:t,renderer:i}=n,r=Ju(e),a=new fS({...n,sdr:t.renderTarget.texture,hdr:r}),o=new js({width:r.image.width,height:r.image.height,type:kn,colorSpace:ci,material:a,renderer:i,renderTargetOptions:n.renderTargetOptions});try{o.render()}catch(l){throw o.disposeOnDemandRenderer(),l}return o},dS=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,hS=`
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
`;class pS extends zn{_brightness=0;_contrast=1;_saturation=1;_exposure=1;_toneMapping;_map;constructor({map:e,toneMapping:t}){super({name:"SDRMaterial",vertexShader:dS,fragmentShader:hS,uniforms:{map:{value:e},brightness:{value:0},contrast:{value:1},saturation:{value:1},exposure:{value:1}},blending:$n,depthTest:!1,depthWrite:!1}),this._map=e,this.toneMapping=this._toneMapping=t||rl,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get toneMapping(){return this._toneMapping}set toneMapping(e){let t=!1;switch(e){case rl:this.defines.TONEMAPPING_FUNCTION="ACESFilmicToneMapping",t=!0;break;case Tu:this.defines.TONEMAPPING_FUNCTION="ReinhardToneMapping",t=!0;break;case wu:this.defines.TONEMAPPING_FUNCTION="CineonToneMapping",t=!0;break;case il:this.defines.TONEMAPPING_FUNCTION="LinearToneMapping",t=!0;break;default:console.error(`Unsupported toneMapping: ${e}. Using LinearToneMapping.`),this.defines.TONEMAPPING_FUNCTION="LinearToneMapping",this._toneMapping=il}t&&(this._toneMapping=e),this.needsUpdate=!0}get brightness(){return this._brightness}set brightness(e){this._brightness=e,this.uniforms.brightness.value=e}get contrast(){return this._contrast}set contrast(e){this._contrast=e,this.uniforms.contrast.value=e}get saturation(){return this._saturation}set saturation(e){this._saturation=e,this.uniforms.saturation.value=e}get exposure(){return this._exposure}set exposure(e){this._exposure=e,this.uniforms.exposure.value=e}get map(){return this._map}set map(e){this._map=e,this.uniforms.map.value=e}}const mS=(n,e,t,i)=>{n.needsUpdate=!0;const r=new js({width:n.image.width,height:n.image.height,type:kn,colorSpace:Rn,material:new pS({map:n,toneMapping:t}),renderer:e,renderTargetOptions:i});try{r.render()}catch(a){throw r.disposeOnDemandRenderer(),a}return r},gS=n=>{const{image:e,renderer:t}=n,i=Ju(e),r=mS(i,t,n.toneMapping,n.renderTargetOptions),a=uS({...n,image:i,sdr:r,renderer:r.renderer});return{sdr:r,gainMap:a,hdr:i,getMetadata:()=>({gainMapMax:a.material.gainMapMax,gainMapMin:a.material.gainMapMin,gamma:a.material.gamma,hdrCapacityMax:a.material.hdrCapacityMax,hdrCapacityMin:a.material.hdrCapacityMin,offsetHdr:a.material.offsetHdr,offsetSdr:a.material.offsetSdr})}},xS="modulepreload",_S=function(n){return"/ultrahdr-pwa-svelte/"+n},Ff={},vS=function(e,t,i){let r=Promise.resolve();if(t&&t.length>0){let f=function(u){return Promise.all(u.map(h=>Promise.resolve(h).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=o?.nonce||o?.getAttribute("nonce");r=f(t.map(u=>{if(u=_S(u),u in Ff)return;Ff[u]=!0;const h=u.endsWith(".css"),p=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${p}`))return;const m=document.createElement("link");if(m.rel=h?"stylesheet":xS,h||(m.as="script"),m.crossOrigin="",m.href=u,l&&m.setAttribute("nonce",l),document.head.appendChild(m),h)return new Promise((g,y)=>{m.addEventListener("load",g),m.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${u}`)))})}))}function a(o){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=o,window.dispatchEvent(l),!l.defaultPrevented)throw o}return r.then(o=>{for(const l of o||[])l.status==="rejected"&&a(l.reason);return e().catch(a)})};var SS=(()=>{var n=import.meta.url;return(async function(e={}){var t=e,i,r;t.ready=new Promise((s,c)=>{i=s,r=c}),["_main","_memory","___indirect_function_table","__embind_initialize_bindings","_fflush","onRuntimeInitialized"].forEach(s=>{Object.getOwnPropertyDescriptor(t.ready,s)||Object.defineProperty(t.ready,s,{get:()=>D("You are getting "+s+" on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),set:()=>D("You are setting "+s+" on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")})});var a=Object.assign({},t),o="./this.program",l=(s,c)=>{throw c},f=typeof window=="object",u=typeof importScripts=="function",h=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string",p=!f&&!h&&!u;if(t.ENVIRONMENT)throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");var m="";function g(s){return t.locateFile?t.locateFile(s,m):m+s}var y,R,S;if(h){if(typeof process>"u"||!process.release||process.release.name!=="node")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");var x=process.versions.node,U=x.split(".").slice(0,3);if(U=U[0]*1e4+U[1]*100+U[2].split("-")[0]*1,U<16e4)throw new Error("This emscripten-generated code requires node v16.0.0 (detected v"+x+")");const{createRequire:s}=await vS(async()=>{const{createRequire:c}=await Promise.resolve().then(()=>kS);return{createRequire:c}},void 0);var I=s(import.meta.url),B=I("fs"),C=I("path");u?m=C.dirname(m)+"/":m=I("url").fileURLToPath(new URL("./",import.meta.url)),y=(c,d)=>(c=ie(c)?new URL(c):C.normalize(c),B.readFileSync(c,d?void 0:"utf8")),S=c=>{var d=y(c,!0);return d.buffer||(d=new Uint8Array(d)),L(d.buffer),d},R=(c,d,_,w=!0)=>{c=ie(c)?new URL(c):C.normalize(c),B.readFile(c,w?void 0:"utf8",(N,z)=>{N?_(N):d(w?z.buffer:z)})},!t.thisProgram&&process.argv.length>1&&(o=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2),l=(c,d)=>{throw process.exitCode=c,d},t.inspect=()=>"[Emscripten Module object]"}else if(p){if(typeof process=="object"&&typeof I=="function"||typeof window=="object"||typeof importScripts=="function")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");typeof read<"u"&&(y=read),S=s=>{if(typeof readbuffer=="function")return new Uint8Array(readbuffer(s));let c=read(s,"binary");return L(typeof c=="object"),c},R=(s,c,d)=>{setTimeout(()=>c(S(s)))},typeof clearTimeout>"u"&&(globalThis.clearTimeout=s=>{}),typeof setTimeout>"u"&&(globalThis.setTimeout=s=>typeof s=="function"?s():D()),typeof scriptArgs<"u"&&scriptArgs,typeof quit=="function"&&(l=(s,c)=>{throw setTimeout(()=>{if(!(c instanceof ge)){let d=c;c&&typeof c=="object"&&c.stack&&(d=[c,c.stack]),A(`exiting due to exception: ${d}`)}quit(s)}),c}),typeof print<"u"&&(typeof console>"u"&&(console={}),console.log=print,console.warn=console.error=typeof printErr<"u"?printErr:print)}else if(f||u){if(u?m=self.location.href:typeof document<"u"&&document.currentScript&&(m=document.currentScript.src),n&&(m=n),m.indexOf("blob:")!==0?m=m.substr(0,m.replace(/[?#].*/,"").lastIndexOf("/")+1):m="",!(typeof window=="object"||typeof importScripts=="function"))throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");y=s=>{var c=new XMLHttpRequest;return c.open("GET",s,!1),c.send(null),c.responseText},u&&(S=s=>{var c=new XMLHttpRequest;return c.open("GET",s,!1),c.responseType="arraybuffer",c.send(null),new Uint8Array(c.response)}),R=(s,c,d)=>{var _=new XMLHttpRequest;_.open("GET",s,!0),_.responseType="arraybuffer",_.onload=()=>{if(_.status==200||_.status==0&&_.response){c(_.response);return}d()},_.onerror=d,_.send(null)}}else throw new Error("environment detection error");var E=t.print||console.log.bind(console),A=t.printErr||console.error.bind(console);Object.assign(t,a),a=null,sh(),t.arguments&&t.arguments,Ie("arguments","arguments_"),t.thisProgram&&(o=t.thisProgram),Ie("thisProgram","thisProgram"),t.quit&&(l=t.quit),Ie("quit","quit_"),L(typeof t.memoryInitializerPrefixURL>"u","Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"),L(typeof t.pthreadMainPrefixURL>"u","Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"),L(typeof t.cdInitializerPrefixURL>"u","Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"),L(typeof t.filePackagePrefixURL>"u","Module.filePackagePrefixURL option was removed, use Module.locateFile instead"),L(typeof t.read>"u","Module.read option was removed (modify read_ in JS)"),L(typeof t.readAsync>"u","Module.readAsync option was removed (modify readAsync in JS)"),L(typeof t.readBinary>"u","Module.readBinary option was removed (modify readBinary in JS)"),L(typeof t.setWindowTitle>"u","Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)"),L(typeof t.TOTAL_MEMORY>"u","Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"),Ie("asm","wasmExports"),Ie("read","read_"),Ie("readAsync","readAsync"),Ie("readBinary","readBinary"),Ie("setWindowTitle","setWindowTitle"),L(!p,"shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");var O;t.wasmBinary&&(O=t.wasmBinary),Ie("wasmBinary","wasmBinary"),typeof WebAssembly!="object"&&D("no native wasm support detected");var M,v=!1,F;function L(s,c){s||D("Assertion failed"+(c?": "+c:""))}var V,X,Z,$,ne,Y,ue,he;function Fe(){var s=M.buffer;t.HEAP8=V=new Int8Array(s),t.HEAP16=Z=new Int16Array(s),t.HEAPU8=X=new Uint8Array(s),t.HEAPU16=$=new Uint16Array(s),t.HEAP32=ne=new Int32Array(s),t.HEAPU32=Y=new Uint32Array(s),t.HEAPF32=ue=new Float32Array(s),t.HEAPF64=he=new Float64Array(s)}L(!t.STACK_SIZE,"STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time"),L(typeof Int32Array<"u"&&typeof Float64Array<"u"&&Int32Array.prototype.subarray!=null&&Int32Array.prototype.set!=null,"JS engine does not provide full typed array support"),L(!t.wasmMemory,"Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"),L(!t.INITIAL_MEMORY,"Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");function Qe(){var s=ro();L((s&3)==0),s==0&&(s+=4),Y[s>>2]=34821223,Y[s+4>>2]=2310721022,Y[0]=1668509029}function at(){if(!v){var s=ro();s==0&&(s+=4);var c=Y[s>>2],d=Y[s+4>>2];(c!=34821223||d!=2310721022)&&D(`Stack overflow! Stack cookie has been overwritten at ${oe(s)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${oe(d)} ${oe(c)}`),Y[0]!=1668509029&&D("Runtime error: The application has corrupted its heap memory area (address zero)!")}}(function(){var s=new Int16Array(1),c=new Int8Array(s.buffer);if(s[0]=25459,c[0]!==115||c[1]!==99)throw"Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)"})();var ut=[],ft=[],se=[],le=[],Ee=!1;function je(){if(t.preRun)for(typeof t.preRun=="function"&&(t.preRun=[t.preRun]);t.preRun.length;)_e(t.preRun.shift());de(ut)}function Ne(){L(!Ee),Ee=!0,at(),!t.noFSInit&&!b.init.initialized&&b.init(),b.ignorePermissions=!1,de(ft)}function nt(){at(),de(se)}function Ct(){if(at(),t.postRun)for(typeof t.postRun=="function"&&(t.postRun=[t.postRun]);t.postRun.length;)k(t.postRun.shift());de(le)}function _e(s){ut.unshift(s)}function Ze(s){ft.unshift(s)}function k(s){le.unshift(s)}L(Math.imul,"This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),L(Math.fround,"This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),L(Math.clz32,"This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),L(Math.trunc,"This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");var Ye=0,He=null,st=null,Se={};function ht(s){for(var c=s;;){if(!Se[s])return s;s=c+Math.random()}}function Le(s){Ye++,t.monitorRunDependencies&&t.monitorRunDependencies(Ye),s?(L(!Se[s]),Se[s]=1,He===null&&typeof setInterval<"u"&&(He=setInterval(()=>{if(v){clearInterval(He),He=null;return}var c=!1;for(var d in Se)c||(c=!0,A("still waiting on run dependencies:")),A(`dependency: ${d}`);c&&A("(end of list)")},1e4))):A("warning: run dependency added without ID")}function We(s){if(Ye--,t.monitorRunDependencies&&t.monitorRunDependencies(Ye),s?(L(Se[s]),delete Se[s]):A("warning: run dependency removed without ID"),Ye==0&&(He!==null&&(clearInterval(He),He=null),st)){var c=st;st=null,c()}}function D(s){t.onAbort&&t.onAbort(s),s="Aborted("+s+")",A(s),v=!0,F=1;var c=new WebAssembly.RuntimeError(s);throw r(c),c}var T="data:application/octet-stream;base64,",j=s=>s.startsWith(T),ie=s=>s.startsWith("file://");function ae(s){return function(){L(Ee,`native function \`${s}\` called before runtime initialization`);var c=pi[s];return L(c,`exported native function \`${s}\` not found`),c.apply(null,arguments)}}var Q;t.locateFile?(Q="libultrahdr-esm.wasm",j(Q)||(Q=g(Q))):Q=new URL("/ultrahdr-pwa-svelte/assets/libultrahdr-esm-B2AMZ5Um.wasm",import.meta.url).href;function Oe(s){if(s==Q&&O)return new Uint8Array(O);if(S)return S(s);throw"both async and sync fetching of the wasm failed"}function ve(s){if(!O&&(f||u)){if(typeof fetch=="function"&&!ie(s))return fetch(s,{credentials:"same-origin"}).then(c=>{if(!c.ok)throw"failed to load wasm binary file at '"+s+"'";return c.arrayBuffer()}).catch(()=>Oe(s));if(R)return new Promise((c,d)=>{R(s,_=>c(new Uint8Array(_)),d)})}return Promise.resolve().then(()=>Oe(s))}function Ve(s,c,d){return ve(s).then(_=>WebAssembly.instantiate(_,c)).then(_=>_).then(d,_=>{A(`failed to asynchronously prepare wasm: ${_}`),ie(Q)&&A(`warning: Loading from a file URI (${Q}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`),D(_)})}function Ue(s,c,d,_){return!s&&typeof WebAssembly.instantiateStreaming=="function"&&!j(c)&&!ie(c)&&!h&&typeof fetch=="function"?fetch(c,{credentials:"same-origin"}).then(w=>{var N=WebAssembly.instantiateStreaming(w,d);return N.then(_,function(z){return A(`wasm streaming compile failed: ${z}`),A("falling back to ArrayBuffer instantiation"),Ve(c,d,_)})}):Ve(c,d,_)}function ce(){var s={env:xc,wasi_snapshot_preview1:xc};function c(w,N){return pi=w.exports,M=pi.memory,L(M,"memory not found in wasm exports"),Fe(),Yt=pi.__indirect_function_table,L(Yt,"table not found in wasm exports"),Ze(pi.__wasm_call_ctors),We("wasm-instantiate"),pi}Le("wasm-instantiate");var d=t;function _(w){L(t===d,"the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"),d=null,c(w.instance)}if(t.instantiateWasm)try{return t.instantiateWasm(s,c)}catch(w){A(`Module.instantiateWasm callback failed with error: ${w}`),r(w)}return Ue(O,Q,s,_).catch(r),{}}var re,Re;function Ie(s,c,d=!0){Object.getOwnPropertyDescriptor(t,s)||Object.defineProperty(t,s,{configurable:!0,get(){let _=d?" (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)":"";D(`\`Module.${s}\` has been replaced by \`${c}\``+_)}})}function Me(s){Object.getOwnPropertyDescriptor(t,s)&&D(`\`Module.${s}\` was supplied but \`${s}\` not included in INCOMING_MODULE_JS_API`)}function Be(s){return s==="FS_createPath"||s==="FS_createDataFile"||s==="FS_createPreloadedFile"||s==="FS_unlink"||s==="addRunDependency"||s==="FS_createLazyFile"||s==="FS_createDevice"||s==="removeRunDependency"}function G(s,c){typeof globalThis<"u"&&Object.defineProperty(globalThis,s,{configurable:!0,get(){Te("`"+s+"` is not longer defined by emscripten. "+c)}})}G("buffer","Please use HEAP8.buffer or wasmMemory.buffer"),G("asm","Please use wasmExports instead");function ye(s){typeof globalThis<"u"&&!Object.getOwnPropertyDescriptor(globalThis,s)&&Object.defineProperty(globalThis,s,{configurable:!0,get(){var c="`"+s+"` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line",d=s;d.startsWith("_")||(d="$"+s),c+=" (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='"+d+"')",Be(s)&&(c+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),Te(c)}}),xe(s)}function xe(s){Object.getOwnPropertyDescriptor(t,s)||Object.defineProperty(t,s,{configurable:!0,get(){var c="'"+s+"' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)";Be(s)&&(c+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),D(c)}})}function ge(s){this.name="ExitStatus",this.message=`Program terminated with exit(${s})`,this.status=s}var de=s=>{for(;s.length>0;)s.shift()(t)};t.noExitRuntime;var oe=s=>(L(typeof s=="number"),s>>>=0,"0x"+s.toString(16).padStart(8,"0")),Te=s=>{Te.shown||(Te.shown={}),Te.shown[s]||(Te.shown[s]=1,h&&(s="warning: "+s),A(s))};function et(s){this.excPtr=s,this.ptr=s-24,this.set_type=function(c){Y[this.ptr+4>>2]=c},this.get_type=function(){return Y[this.ptr+4>>2]},this.set_destructor=function(c){Y[this.ptr+8>>2]=c},this.get_destructor=function(){return Y[this.ptr+8>>2]},this.set_caught=function(c){c=c?1:0,V[this.ptr+12>>0]=c},this.get_caught=function(){return V[this.ptr+12>>0]!=0},this.set_rethrown=function(c){c=c?1:0,V[this.ptr+13>>0]=c},this.get_rethrown=function(){return V[this.ptr+13>>0]!=0},this.init=function(c,d){this.set_adjusted_ptr(0),this.set_type(c),this.set_destructor(d)},this.set_adjusted_ptr=function(c){Y[this.ptr+16>>2]=c},this.get_adjusted_ptr=function(){return Y[this.ptr+16>>2]},this.get_exception_ptr=function(){var c=ch(this.get_type());if(c)return Y[this.excPtr>>2];var d=this.get_adjusted_ptr();return d!==0?d:this.excPtr}}var At=(s,c,d)=>{var _=new et(s);_.init(c,d),L(!1,"Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.")},mt={},Mn=s=>{for(;s.length;){var c=s.pop(),d=s.pop();d(c)}};function fn(s){return this.fromWireType(ne[s>>2])}var Oi={},Zn={},tr={},Jn,Er=s=>{throw new Jn(s)},fa=(s,c,d)=>{s.forEach(function(H){tr[H]=c});function _(H){var K=d(H);K.length!==s.length&&Er("Mismatched type converter count");for(var me=0;me<s.length;++me)Gn(s[me],K[me])}var w=new Array(c.length),N=[],z=0;c.forEach((H,K)=>{Zn.hasOwnProperty(H)?w[K]=Zn[H]:(N.push(H),Oi.hasOwnProperty(H)||(Oi[H]=[]),Oi[H].push(()=>{w[K]=Zn[H],++z,z===N.length&&_(w)}))}),N.length===0&&_(w)},Ha=s=>{var c=mt[s];delete mt[s];var d=c.rawConstructor,_=c.rawDestructor,w=c.fields,N=w.map(z=>z.getterReturnType).concat(w.map(z=>z.setterArgumentType));fa([s],N,z=>{var H={};return w.forEach((K,me)=>{var Ce=K.fieldName,ze=z[me],ke=K.getter,Xe=K.getterContext,tt=z[me+w.length],Lt=K.setter,Bt=K.setterContext;H[Ce]={read:Vt=>ze.fromWireType(ke(Xe,Vt)),write:(Vt,fe)=>{var Ge=[];Lt(Bt,Vt,tt.toWireType(Ge,fe)),Mn(Ge)}}}),[{name:c.name,fromWireType:K=>{var me={};for(var Ce in H)me[Ce]=H[Ce].read(K);return _(K),me},toWireType:(K,me)=>{for(var Ce in H)if(!(Ce in me))throw new TypeError(`Missing field: "${Ce}"`);var ze=d();for(Ce in H)H[Ce].write(ze,me[Ce]);return K!==null&&K.push(_,ze),ze},argPackAdvance:Qn,readValueFromPointer:fn,destructorFunction:_}]})},Mr=(s,c,d,_,w)=>{},Wa=()=>{for(var s=new Array(256),c=0;c<256;++c)s[c]=String.fromCharCode(c);nr=s},nr,Jt=s=>{for(var c="",d=s;X[d];)c+=nr[X[d++]];return c},ua,un=s=>{throw new ua(s)};function $s(s,c,d={}){var _=c.name;if(s||un(`type "${_}" must have a positive integer typeid pointer`),Zn.hasOwnProperty(s)){if(d.ignoreDuplicateRegistrations)return;un(`Cannot register type '${_}' twice`)}if(Zn[s]=c,delete tr[s],Oi.hasOwnProperty(s)){var w=Oi[s];delete Oi[s],w.forEach(N=>N())}}function Gn(s,c,d={}){if(!("argPackAdvance"in c))throw new TypeError("registerType registeredInstance requires argPackAdvance");return $s(s,c,d)}var Qn=8,Ks=(s,c,d,_)=>{c=Jt(c),Gn(s,{name:c,fromWireType:function(w){return!!w},toWireType:function(w,N){return N?d:_},argPackAdvance:Qn,readValueFromPointer:function(w){return this.fromWireType(X[w])},destructorFunction:null})};function Zs(){Object.assign(P.prototype,{get(s){return L(this.allocated[s]!==void 0,`invalid handle: ${s}`),this.allocated[s]},has(s){return this.allocated[s]!==void 0},allocate(s){var c=this.freelist.pop()||this.allocated.length;return this.allocated[c]=s,c},free(s){L(this.allocated[s]!==void 0),this.allocated[s]=void 0,this.freelist.push(s)}})}function P(){this.allocated=[void 0],this.freelist=[]}var W=new P,J=s=>{s>=W.reserved&&--W.get(s).refcount===0&&W.free(s)},ee=()=>{for(var s=0,c=W.reserved;c<W.allocated.length;++c)W.allocated[c]!==void 0&&++s;return s},q=()=>{W.allocated.push({value:void 0},{value:null},{value:!0},{value:!1}),W.reserved=W.allocated.length,t.count_emval_handles=ee},pe={toValue:s=>(s||un("Cannot use deleted val. handle = "+s),W.get(s).value),toHandle:s=>{switch(s){case void 0:return 1;case null:return 2;case!0:return 3;case!1:return 4;default:return W.allocate({refcount:1,value:s})}}},we=(s,c)=>{c=Jt(c),Gn(s,{name:c,fromWireType:d=>{var _=pe.toValue(d);return J(d),_},toWireType:(d,_)=>pe.toHandle(_),argPackAdvance:Qn,readValueFromPointer:fn,destructorFunction:null})},De=s=>{if(s===null)return"null";var c=typeof s;return c==="object"||c==="array"||c==="function"?s.toString():""+s},Pe=(s,c)=>{switch(c){case 4:return function(d){return this.fromWireType(ue[d>>2])};case 8:return function(d){return this.fromWireType(he[d>>3])};default:throw new TypeError(`invalid float width (${c}): ${s}`)}},Ke=(s,c,d)=>{c=Jt(c),Gn(s,{name:c,fromWireType:_=>_,toWireType:(_,w)=>{if(typeof w!="number"&&typeof w!="boolean")throw new TypeError(`Cannot convert ${De(w)} to ${this.name}`);return w},argPackAdvance:Qn,readValueFromPointer:Pe(c,d),destructorFunction:null})},Je=48,qe=57,ct=s=>{if(s===void 0)return"_unknown";s=s.replace(/[^a-zA-Z0-9_]/g,"$");var c=s.charCodeAt(0);return c>=Je&&c<=qe?`_${s}`:s};function vt(s,c){return s=ct(s),{[s]:function(){return c.apply(this,arguments)}}[s]}function Ft(s,c){if(!(s instanceof Function))throw new TypeError(`new_ called with constructor type ${typeof s} which is not a function`);var d=vt(s.name||"unknownFunctionName",function(){});d.prototype=s.prototype;var _=new d,w=s.apply(_,c);return w instanceof Object?w:_}function Ut(s,c,d,_,w,N){var z=c.length;z<2&&un("argTypes array size mismatch! Must at least get return value and 'this' types!"),L(!N,"Async bindings are only supported with JSPI."),c[1];for(var H=!1,K=1;K<c.length;++K)if(c[K]!==null&&c[K].destructorFunction===void 0){H=!0;break}for(var me=c[0].name!=="void",Ce="",ze="",K=0;K<z-2;++K)Ce+=(K!==0?", ":"")+"arg"+K,ze+=(K!==0?", ":"")+"arg"+K+"Wired";var ke=`
        return function ${ct(s)}(${Ce}) {
        if (arguments.length !== ${z-2}) {
          throwBindingError('function ${s} called with ' + arguments.length + ' arguments, expected ${z-2}');
        }`;H&&(ke+=`var destructors = [];
`);for(var Xe=H?"destructors":"null",tt=["throwBindingError","invoker","fn","runDestructors","retType","classParam"],Lt=[un,_,w,Mn,c[0],c[1]],K=0;K<z-2;++K)ke+="var arg"+K+"Wired = argType"+K+".toWireType("+Xe+", arg"+K+"); // "+c[K+2].name+`
`,tt.push("argType"+K),Lt.push(c[K+2]);if(ke+=(me||N?"var rv = ":"")+"invoker(fn"+(ze.length>0?", ":"")+ze+`);
`,H)ke+=`runDestructors(destructors);
`;else for(var K=2;K<c.length;++K){var Bt=K===1?"thisWired":"arg"+(K-2)+"Wired";c[K].destructorFunction!==null&&(ke+=Bt+"_dtor("+Bt+"); // "+c[K].name+`
`,tt.push(Bt+"_dtor"),Lt.push(c[K].destructorFunction))}return me&&(ke+=`var ret = retType.fromWireType(rv);
return ret;
`),ke+=`}
`,tt.push(ke),Ft(Function,tt).apply(null,Lt)}var yt=(s,c,d)=>{if(s[c].overloadTable===void 0){var _=s[c];s[c]=function(){return s[c].overloadTable.hasOwnProperty(arguments.length)||un(`Function '${d}' called with an invalid number of arguments (${arguments.length}) - expects one of (${s[c].overloadTable})!`),s[c].overloadTable[arguments.length].apply(this,arguments)},s[c].overloadTable=[],s[c].overloadTable[_.argCount]=_}},$e=(s,c,d)=>{t.hasOwnProperty(s)?((d===void 0||t[s].overloadTable!==void 0&&t[s].overloadTable[d]!==void 0)&&un(`Cannot register public name '${s}' twice`),yt(t,s,s),t.hasOwnProperty(d)&&un(`Cannot register multiple overloads of a function with the same number of arguments (${d})!`),t[s].overloadTable[d]=c):(t[s]=c,d!==void 0&&(t[s].numArguments=d))},Pt=(s,c)=>{for(var d=[],_=0;_<s;_++)d.push(Y[c+_*4>>2]);return d},pt=(s,c,d)=>{t.hasOwnProperty(s)||Er("Replacing nonexistant public symbol"),t[s].overloadTable!==void 0&&d!==void 0?t[s].overloadTable[d]=c:(t[s]=c,t[s].argCount=d)},dn=(s,c,d)=>{L("dynCall_"+s in t,`bad function pointer type - dynCall function not found for sig '${s}'`),d&&d.length?L(d.length===s.substring(1).replace(/j/g,"--").length):L(s.length==1);var _=t["dynCall_"+s];return d&&d.length?_.apply(null,[c].concat(d)):_.call(null,c)},Vn=[],Yt,hn=s=>{var c=Vn[s];return c||(s>=Vn.length&&(Vn.length=s+1),Vn[s]=c=Yt.get(s)),L(Yt.get(s)==c,"JavaScript-side Wasm function table mirror is out of date!"),c},Dt=(s,c,d)=>{if(s.includes("j"))return dn(s,c,d);L(hn(c),`missing table entry in dynCall: ${c}`);var _=hn(c).apply(null,d);return _},rn=(s,c)=>{L(s.includes("j")||s.includes("p"),"getDynCaller should only be called with i64 sigs");var d=[];return function(){return d.length=0,Object.assign(d,arguments),Dt(s,c,d)}},jt=(s,c)=>{s=Jt(s);function d(){return s.includes("j")?rn(s,c):hn(c)}var _=d();return typeof _!="function"&&un(`unknown function pointer with signature ${s}: ${c}`),_},Qt=(s,c)=>{var d=vt(c,function(_){this.name=c,this.message=_;var w=new Error(_).stack;w!==void 0&&(this.stack=this.toString()+`
`+w.replace(/^Error(:[^\n]*)?\n/,""))});return d.prototype=Object.create(s.prototype),d.prototype.constructor=d,d.prototype.toString=function(){return this.message===void 0?this.name:`${this.name}: ${this.message}`},d},en,Tr=s=>{var c=lh(s),d=Jt(c);return ki(c),d},ui=(s,c)=>{var d=[],_={};function w(N){if(!_[N]&&!Zn[N]){if(tr[N]){tr[N].forEach(w);return}d.push(N),_[N]=!0}}throw c.forEach(w),new en(`${s}: `+d.map(Tr).join([", "]))},Qu=s=>{s=s.trim();const c=s.indexOf("(");return c!==-1?(L(s[s.length-1]==")","Parentheses for argument names should match."),s.substr(0,c)):s},ed=(s,c,d,_,w,N,z)=>{var H=Pt(c,d);s=Jt(s),s=Qu(s),w=jt(_,w),$e(s,function(){ui(`Cannot call ${s} due to unbound types`,H)},c-1),fa([],H,function(K){var me=[K[0],null].concat(K.slice(1));return pt(s,Ut(s,me,null,w,N,z),c-1),[]})},td=(s,c,d)=>{switch(c){case 1:return d?_=>V[_>>0]:_=>X[_>>0];case 2:return d?_=>Z[_>>1]:_=>$[_>>1];case 4:return d?_=>ne[_>>2]:_=>Y[_>>2];default:throw new TypeError(`invalid integer width (${c}): ${s}`)}},nd=(s,c,d,_,w)=>{c=Jt(c),w===-1&&(w=4294967295);var N=Ce=>Ce;if(_===0){var z=32-8*d;N=Ce=>Ce<<z>>>z}var H=c.includes("unsigned"),K=(Ce,ze)=>{if(typeof Ce!="number"&&typeof Ce!="boolean")throw new TypeError(`Cannot convert "${De(Ce)}" to ${ze}`);if(Ce<_||Ce>w)throw new TypeError(`Passing a number "${De(Ce)}" from JS side to C/C++ side to an argument of type "${c}", which is outside the valid range [${_}, ${w}]!`)},me;H?me=function(Ce,ze){return K(ze,this.name),ze>>>0}:me=function(Ce,ze){return K(ze,this.name),ze},Gn(s,{name:c,fromWireType:N,toWireType:me,argPackAdvance:Qn,readValueFromPointer:td(c,d,_!==0),destructorFunction:null})},id=(s,c,d)=>{var _=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],w=_[c];function N(z){var H=Y[z>>2],K=Y[z+4>>2];return new w(V.buffer,K,H)}d=Jt(d),Gn(s,{name:d,fromWireType:N,argPackAdvance:Qn,readValueFromPointer:N},{ignoreDuplicateRegistrations:!0})};function rd(s){return this.fromWireType(Y[s>>2])}var Js=(s,c,d,_)=>{if(L(typeof s=="string"),!(_>0))return 0;for(var w=d,N=d+_-1,z=0;z<s.length;++z){var H=s.charCodeAt(z);if(H>=55296&&H<=57343){var K=s.charCodeAt(++z);H=65536+((H&1023)<<10)|K&1023}if(H<=127){if(d>=N)break;c[d++]=H}else if(H<=2047){if(d+1>=N)break;c[d++]=192|H>>6,c[d++]=128|H&63}else if(H<=65535){if(d+2>=N)break;c[d++]=224|H>>12,c[d++]=128|H>>6&63,c[d++]=128|H&63}else{if(d+3>=N)break;H>1114111&&Te("Invalid Unicode code point "+oe(H)+" encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."),c[d++]=240|H>>18,c[d++]=128|H>>12&63,c[d++]=128|H>>6&63,c[d++]=128|H&63}}return c[d]=0,d-w},ad=(s,c,d)=>(L(typeof d=="number","stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),Js(s,X,c,d)),Qs=s=>{for(var c=0,d=0;d<s.length;++d){var _=s.charCodeAt(d);_<=127?c++:_<=2047?c+=2:_>=55296&&_<=57343?(c+=4,++d):c+=3}return c},cc=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0,wr=(s,c,d)=>{for(var _=c+d,w=c;s[w]&&!(w>=_);)++w;if(w-c>16&&s.buffer&&cc)return cc.decode(s.subarray(c,w));for(var N="";c<w;){var z=s[c++];if(!(z&128)){N+=String.fromCharCode(z);continue}var H=s[c++]&63;if((z&224)==192){N+=String.fromCharCode((z&31)<<6|H);continue}var K=s[c++]&63;if((z&240)==224?z=(z&15)<<12|H<<6|K:((z&248)!=240&&Te("Invalid UTF-8 leading byte "+oe(z)+" encountered when deserializing a UTF-8 string in wasm memory to a JS string!"),z=(z&7)<<18|H<<12|K<<6|s[c++]&63),z<65536)N+=String.fromCharCode(z);else{var me=z-65536;N+=String.fromCharCode(55296|me>>10,56320|me&1023)}}return N},Xa=(s,c)=>(L(typeof s=="number"),s?wr(X,s,c):""),sd=(s,c)=>{c=Jt(c);var d=c==="std::string";Gn(s,{name:c,fromWireType(_){var w=Y[_>>2],N=_+4,z;if(d)for(var H=N,K=0;K<=w;++K){var me=N+K;if(K==w||X[me]==0){var Ce=me-H,ze=Xa(H,Ce);z===void 0?z=ze:(z+="\0",z+=ze),H=me+1}}else{for(var ke=new Array(w),K=0;K<w;++K)ke[K]=String.fromCharCode(X[N+K]);z=ke.join("")}return ki(_),z},toWireType(_,w){w instanceof ArrayBuffer&&(w=new Uint8Array(w));var N,z=typeof w=="string";z||w instanceof Uint8Array||w instanceof Uint8ClampedArray||w instanceof Int8Array||un("Cannot pass non-string to std::string"),d&&z?N=Qs(w):N=w.length;var H=_c(4+N+1),K=H+4;if(Y[H>>2]=N,d&&z)ad(w,K,N+1);else if(z)for(var me=0;me<N;++me){var Ce=w.charCodeAt(me);Ce>255&&(ki(K),un("String has UTF-16 code units that do not fit in 8 bits")),X[K+me]=Ce}else for(var me=0;me<N;++me)X[K+me]=w[me];return _!==null&&_.push(ki,H),H},argPackAdvance:Qn,readValueFromPointer:rd,destructorFunction(_){ki(_)}})},fc=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0,od=(s,c)=>{L(s%2==0,"Pointer passed to UTF16ToString must be aligned to two bytes!");for(var d=s,_=d>>1,w=_+c/2;!(_>=w)&&$[_];)++_;if(d=_<<1,d-s>32&&fc)return fc.decode(X.subarray(s,d));for(var N="",z=0;!(z>=c/2);++z){var H=Z[s+z*2>>1];if(H==0)break;N+=String.fromCharCode(H)}return N},ld=(s,c,d)=>{if(L(c%2==0,"Pointer passed to stringToUTF16 must be aligned to two bytes!"),L(typeof d=="number","stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),d===void 0&&(d=2147483647),d<2)return 0;d-=2;for(var _=c,w=d<s.length*2?d/2:s.length,N=0;N<w;++N){var z=s.charCodeAt(N);Z[c>>1]=z,c+=2}return Z[c>>1]=0,c-_},cd=s=>s.length*2,fd=(s,c)=>{L(s%4==0,"Pointer passed to UTF32ToString must be aligned to four bytes!");for(var d=0,_="";!(d>=c/4);){var w=ne[s+d*4>>2];if(w==0)break;if(++d,w>=65536){var N=w-65536;_+=String.fromCharCode(55296|N>>10,56320|N&1023)}else _+=String.fromCharCode(w)}return _},ud=(s,c,d)=>{if(L(c%4==0,"Pointer passed to stringToUTF32 must be aligned to four bytes!"),L(typeof d=="number","stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),d===void 0&&(d=2147483647),d<4)return 0;for(var _=c,w=_+d-4,N=0;N<s.length;++N){var z=s.charCodeAt(N);if(z>=55296&&z<=57343){var H=s.charCodeAt(++N);z=65536+((z&1023)<<10)|H&1023}if(ne[c>>2]=z,c+=4,c+4>w)break}return ne[c>>2]=0,c-_},dd=s=>{for(var c=0,d=0;d<s.length;++d){var _=s.charCodeAt(d);_>=55296&&_<=57343&&++d,c+=4}return c},hd=(s,c,d)=>{d=Jt(d);var _,w,N,z,H;c===2?(_=od,w=ld,z=cd,N=()=>$,H=1):c===4&&(_=fd,w=ud,z=dd,N=()=>Y,H=2),Gn(s,{name:d,fromWireType:K=>{for(var me=Y[K>>2],Ce=N(),ze,ke=K+4,Xe=0;Xe<=me;++Xe){var tt=K+4+Xe*c;if(Xe==me||Ce[tt>>H]==0){var Lt=tt-ke,Bt=_(ke,Lt);ze===void 0?ze=Bt:(ze+="\0",ze+=Bt),ke=tt+c}}return ki(K),ze},toWireType:(K,me)=>{typeof me!="string"&&un(`Cannot pass non-string to C++ string type ${d}`);var Ce=z(me),ze=_c(4+Ce+c);return Y[ze>>2]=Ce>>H,w(me,ze+4,Ce+c),K!==null&&K.push(ki,ze),ze},argPackAdvance:Qn,readValueFromPointer:fn,destructorFunction(K){ki(K)}})},pd=(s,c,d,_,w,N)=>{mt[s]={name:Jt(c),rawConstructor:jt(d,_),rawDestructor:jt(w,N),fields:[]}},md=(s,c,d,_,w,N,z,H,K,me)=>{mt[s].fields.push({fieldName:Jt(c),getterReturnType:d,getter:jt(_,w),getterContext:N,setterArgumentType:z,setter:jt(H,K),setterContext:me})},gd=(s,c)=>{c=Jt(c),Gn(s,{isVoid:!0,name:c,argPackAdvance:0,fromWireType:()=>{},toWireType:(d,_)=>{}})},xd=()=>{throw 1/0},_d=s=>{s>4&&(W.get(s).refcount+=1)},vd={},Sd=s=>{var c=vd[s];return c===void 0?Jt(s):c},yd=s=>pe.toHandle(Sd(s)),bd=(s,c)=>{var d=Zn[s];return d===void 0&&un(c+" has unknown type "+Tr(s)),d},Ed=(s,c)=>{s=bd(s,"_emval_take_value");var d=s.readValueFromPointer(c);return pe.toHandle(d)},Md=()=>{D("native code called abort()")},Td=(s,c,d)=>X.copyWithin(s,c,c+d),wd=()=>2147483648,Ad=s=>{var c=M.buffer,d=(s-c.byteLength+65535)/65536;try{return M.grow(d),Fe(),1}catch(_){A(`growMemory: Attempted to grow heap from ${c.byteLength} bytes to ${s} bytes, but got error: ${_}`)}},Rd=s=>{var c=X.length;s>>>=0,L(s>c);var d=wd();if(s>d)return A(`Cannot enlarge memory, requested ${s} bytes, but the limit is ${d} bytes!`),!1;for(var _=(K,me)=>K+(me-K%me)%me,w=1;w<=4;w*=2){var N=c*(1+.2/w);N=Math.min(N,s+100663296);var z=Math.min(d,_(Math.max(s,N),65536)),H=Ad(z);if(H)return!0}return A(`Failed to grow the heap from ${c} bytes to ${z} bytes, not enough memory!`),!1},eo={},Cd=()=>o||"./this.program",da=()=>{if(!da.strings){var s=(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",c={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:s,_:Cd()};for(var d in eo)eo[d]===void 0?delete c[d]:c[d]=eo[d];var _=[];for(var d in c)_.push(`${d}=${c[d]}`);da.strings=_}return da.strings},Pd=(s,c)=>{for(var d=0;d<s.length;++d)L(s.charCodeAt(d)===(s.charCodeAt(d)&255)),V[c++>>0]=s.charCodeAt(d);V[c>>0]=0},bt={isAbs:s=>s.charAt(0)==="/",splitPath:s=>{var c=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return c.exec(s).slice(1)},normalizeArray:(s,c)=>{for(var d=0,_=s.length-1;_>=0;_--){var w=s[_];w==="."?s.splice(_,1):w===".."?(s.splice(_,1),d++):d&&(s.splice(_,1),d--)}if(c)for(;d;d--)s.unshift("..");return s},normalize:s=>{var c=bt.isAbs(s),d=s.substr(-1)==="/";return s=bt.normalizeArray(s.split("/").filter(_=>!!_),!c).join("/"),!s&&!c&&(s="."),s&&d&&(s+="/"),(c?"/":"")+s},dirname:s=>{var c=bt.splitPath(s),d=c[0],_=c[1];return!d&&!_?".":(_&&(_=_.substr(0,_.length-1)),d+_)},basename:s=>{if(s==="/")return"/";s=bt.normalize(s),s=s.replace(/\/$/,"");var c=s.lastIndexOf("/");return c===-1?s:s.substr(c+1)},join:function(){var s=Array.prototype.slice.call(arguments);return bt.normalize(s.join("/"))},join2:(s,c)=>bt.normalize(s+"/"+c)},Dd=()=>{if(typeof crypto=="object"&&typeof crypto.getRandomValues=="function")return _=>crypto.getRandomValues(_);if(h)try{var s=I("crypto"),c=s.randomFillSync;if(c)return _=>s.randomFillSync(_);var d=s.randomBytes;return _=>(_.set(d(_.byteLength)),_)}catch{}D("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };")},uc=s=>(uc=Dd())(s),di={resolve:function(){for(var s="",c=!1,d=arguments.length-1;d>=-1&&!c;d--){var _=d>=0?arguments[d]:b.cwd();if(typeof _!="string")throw new TypeError("Arguments to path.resolve must be strings");if(!_)return"";s=_+"/"+s,c=bt.isAbs(_)}return s=bt.normalizeArray(s.split("/").filter(w=>!!w),!c).join("/"),(c?"/":"")+s||"."},relative:(s,c)=>{s=di.resolve(s).substr(1),c=di.resolve(c).substr(1);function d(me){for(var Ce=0;Ce<me.length&&me[Ce]==="";Ce++);for(var ze=me.length-1;ze>=0&&me[ze]==="";ze--);return Ce>ze?[]:me.slice(Ce,ze-Ce+1)}for(var _=d(s.split("/")),w=d(c.split("/")),N=Math.min(_.length,w.length),z=N,H=0;H<N;H++)if(_[H]!==w[H]){z=H;break}for(var K=[],H=z;H<_.length;H++)K.push("..");return K=K.concat(w.slice(z)),K.join("/")}},to=[];function qa(s,c,d){var _=Qs(s)+1,w=new Array(_),N=Js(s,w,0,w.length);return c&&(w.length=N),w}var Ld=()=>{if(!to.length){var s=null;if(h){var c=256,d=Buffer.alloc(c),_=0,w=process.stdin.fd;try{_=B.readSync(w,d)}catch(N){if(N.toString().includes("EOF"))_=0;else throw N}_>0?s=d.slice(0,_).toString("utf-8"):s=null}else typeof window<"u"&&typeof window.prompt=="function"?(s=window.prompt("Input: "),s!==null&&(s+=`
`)):typeof readline=="function"&&(s=readline(),s!==null&&(s+=`
`));if(!s)return null;to=qa(s,!0)}return to.shift()},Bi={ttys:[],init(){},shutdown(){},register(s,c){Bi.ttys[s]={input:[],output:[],ops:c},b.registerDevice(s,Bi.stream_ops)},stream_ops:{open(s){var c=Bi.ttys[s.node.rdev];if(!c)throw new b.ErrnoError(43);s.tty=c,s.seekable=!1},close(s){s.tty.ops.fsync(s.tty)},fsync(s){s.tty.ops.fsync(s.tty)},read(s,c,d,_,w){if(!s.tty||!s.tty.ops.get_char)throw new b.ErrnoError(60);for(var N=0,z=0;z<_;z++){var H;try{H=s.tty.ops.get_char(s.tty)}catch{throw new b.ErrnoError(29)}if(H===void 0&&N===0)throw new b.ErrnoError(6);if(H==null)break;N++,c[d+z]=H}return N&&(s.node.timestamp=Date.now()),N},write(s,c,d,_,w){if(!s.tty||!s.tty.ops.put_char)throw new b.ErrnoError(60);try{for(var N=0;N<_;N++)s.tty.ops.put_char(s.tty,c[d+N])}catch{throw new b.ErrnoError(29)}return _&&(s.node.timestamp=Date.now()),N}},default_tty_ops:{get_char(s){return Ld()},put_char(s,c){c===null||c===10?(E(wr(s.output,0)),s.output=[]):c!=0&&s.output.push(c)},fsync(s){s.output&&s.output.length>0&&(E(wr(s.output,0)),s.output=[])},ioctl_tcgets(s){return{c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(s,c,d){return 0},ioctl_tiocgwinsz(s){return[24,80]}},default_tty1_ops:{put_char(s,c){c===null||c===10?(A(wr(s.output,0)),s.output=[]):c!=0&&s.output.push(c)},fsync(s){s.output&&s.output.length>0&&(A(wr(s.output,0)),s.output=[])}}},dc=s=>{D("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported")},rt={ops_table:null,mount(s){return rt.createNode(null,"/",16895,0)},createNode(s,c,d,_){if(b.isBlkdev(d)||b.isFIFO(d))throw new b.ErrnoError(63);rt.ops_table||(rt.ops_table={dir:{node:{getattr:rt.node_ops.getattr,setattr:rt.node_ops.setattr,lookup:rt.node_ops.lookup,mknod:rt.node_ops.mknod,rename:rt.node_ops.rename,unlink:rt.node_ops.unlink,rmdir:rt.node_ops.rmdir,readdir:rt.node_ops.readdir,symlink:rt.node_ops.symlink},stream:{llseek:rt.stream_ops.llseek}},file:{node:{getattr:rt.node_ops.getattr,setattr:rt.node_ops.setattr},stream:{llseek:rt.stream_ops.llseek,read:rt.stream_ops.read,write:rt.stream_ops.write,allocate:rt.stream_ops.allocate,mmap:rt.stream_ops.mmap,msync:rt.stream_ops.msync}},link:{node:{getattr:rt.node_ops.getattr,setattr:rt.node_ops.setattr,readlink:rt.node_ops.readlink},stream:{}},chrdev:{node:{getattr:rt.node_ops.getattr,setattr:rt.node_ops.setattr},stream:b.chrdev_stream_ops}});var w=b.createNode(s,c,d,_);return b.isDir(w.mode)?(w.node_ops=rt.ops_table.dir.node,w.stream_ops=rt.ops_table.dir.stream,w.contents={}):b.isFile(w.mode)?(w.node_ops=rt.ops_table.file.node,w.stream_ops=rt.ops_table.file.stream,w.usedBytes=0,w.contents=null):b.isLink(w.mode)?(w.node_ops=rt.ops_table.link.node,w.stream_ops=rt.ops_table.link.stream):b.isChrdev(w.mode)&&(w.node_ops=rt.ops_table.chrdev.node,w.stream_ops=rt.ops_table.chrdev.stream),w.timestamp=Date.now(),s&&(s.contents[c]=w,s.timestamp=w.timestamp),w},getFileDataAsTypedArray(s){return s.contents?s.contents.subarray?s.contents.subarray(0,s.usedBytes):new Uint8Array(s.contents):new Uint8Array(0)},expandFileStorage(s,c){var d=s.contents?s.contents.length:0;if(!(d>=c)){var _=1024*1024;c=Math.max(c,d*(d<_?2:1.125)>>>0),d!=0&&(c=Math.max(c,256));var w=s.contents;s.contents=new Uint8Array(c),s.usedBytes>0&&s.contents.set(w.subarray(0,s.usedBytes),0)}},resizeFileStorage(s,c){if(s.usedBytes!=c)if(c==0)s.contents=null,s.usedBytes=0;else{var d=s.contents;s.contents=new Uint8Array(c),d&&s.contents.set(d.subarray(0,Math.min(c,s.usedBytes))),s.usedBytes=c}},node_ops:{getattr(s){var c={};return c.dev=b.isChrdev(s.mode)?s.id:1,c.ino=s.id,c.mode=s.mode,c.nlink=1,c.uid=0,c.gid=0,c.rdev=s.rdev,b.isDir(s.mode)?c.size=4096:b.isFile(s.mode)?c.size=s.usedBytes:b.isLink(s.mode)?c.size=s.link.length:c.size=0,c.atime=new Date(s.timestamp),c.mtime=new Date(s.timestamp),c.ctime=new Date(s.timestamp),c.blksize=4096,c.blocks=Math.ceil(c.size/c.blksize),c},setattr(s,c){c.mode!==void 0&&(s.mode=c.mode),c.timestamp!==void 0&&(s.timestamp=c.timestamp),c.size!==void 0&&rt.resizeFileStorage(s,c.size)},lookup(s,c){throw b.genericErrors[44]},mknod(s,c,d,_){return rt.createNode(s,c,d,_)},rename(s,c,d){if(b.isDir(s.mode)){var _;try{_=b.lookupNode(c,d)}catch{}if(_)for(var w in _.contents)throw new b.ErrnoError(55)}delete s.parent.contents[s.name],s.parent.timestamp=Date.now(),s.name=d,c.contents[d]=s,c.timestamp=s.parent.timestamp,s.parent=c},unlink(s,c){delete s.contents[c],s.timestamp=Date.now()},rmdir(s,c){var d=b.lookupNode(s,c);for(var _ in d.contents)throw new b.ErrnoError(55);delete s.contents[c],s.timestamp=Date.now()},readdir(s){var c=[".",".."];for(var d in s.contents)s.contents.hasOwnProperty(d)&&c.push(d);return c},symlink(s,c,d){var _=rt.createNode(s,c,41471,0);return _.link=d,_},readlink(s){if(!b.isLink(s.mode))throw new b.ErrnoError(28);return s.link}},stream_ops:{read(s,c,d,_,w){var N=s.node.contents;if(w>=s.node.usedBytes)return 0;var z=Math.min(s.node.usedBytes-w,_);if(L(z>=0),z>8&&N.subarray)c.set(N.subarray(w,w+z),d);else for(var H=0;H<z;H++)c[d+H]=N[w+H];return z},write(s,c,d,_,w,N){if(L(!(c instanceof ArrayBuffer)),c.buffer===V.buffer&&(N=!1),!_)return 0;var z=s.node;if(z.timestamp=Date.now(),c.subarray&&(!z.contents||z.contents.subarray)){if(N)return L(w===0,"canOwn must imply no weird position inside the file"),z.contents=c.subarray(d,d+_),z.usedBytes=_,_;if(z.usedBytes===0&&w===0)return z.contents=c.slice(d,d+_),z.usedBytes=_,_;if(w+_<=z.usedBytes)return z.contents.set(c.subarray(d,d+_),w),_}if(rt.expandFileStorage(z,w+_),z.contents.subarray&&c.subarray)z.contents.set(c.subarray(d,d+_),w);else for(var H=0;H<_;H++)z.contents[w+H]=c[d+H];return z.usedBytes=Math.max(z.usedBytes,w+_),_},llseek(s,c,d){var _=c;if(d===1?_+=s.position:d===2&&b.isFile(s.node.mode)&&(_+=s.node.usedBytes),_<0)throw new b.ErrnoError(28);return _},allocate(s,c,d){rt.expandFileStorage(s.node,c+d),s.node.usedBytes=Math.max(s.node.usedBytes,c+d)},mmap(s,c,d,_,w){if(!b.isFile(s.node.mode))throw new b.ErrnoError(43);var N,z,H=s.node.contents;if(!(w&2)&&H.buffer===V.buffer)z=!1,N=H.byteOffset;else{if((d>0||d+c<H.length)&&(H.subarray?H=H.subarray(d,d+c):H=Array.prototype.slice.call(H,d,d+c)),z=!0,N=dc(),!N)throw new b.ErrnoError(48);V.set(H,N)}return{ptr:N,allocated:z}},msync(s,c,d,_,w){return rt.stream_ops.write(s,c,0,_,d,!1),0}}},Id=(s,c,d,_)=>{var w=ht(`al ${s}`);R(s,N=>{L(N,`Loading data file "${s}" failed (no arrayBuffer).`),c(new Uint8Array(N)),w&&We(w)},N=>{if(d)d();else throw`Loading data file "${s}" failed.`}),w&&Le(w)},Fd=(s,c,d,_,w,N)=>b.createDataFile(s,c,d,_,w,N),Ud=t.preloadPlugins||[],Nd=(s,c,d,_)=>{typeof Browser<"u"&&Browser.init();var w=!1;return Ud.forEach(N=>{w||N.canHandle(c)&&(N.handle(s,c,d,_),w=!0)}),w},Od=(s,c,d,_,w,N,z,H,K,me)=>{var Ce=c?di.resolve(bt.join2(s,c)):s,ze=ht(`cp ${Ce}`);function ke(Xe){function tt(Lt){me&&me(),H||Fd(s,c,Lt,_,w,K),N&&N(),We(ze)}Nd(Xe,Ce,tt,()=>{z&&z(),We(ze)})||tt(Xe)}Le(ze),typeof d=="string"?Id(d,Xe=>ke(Xe),z):ke(d)},Bd=s=>{var c={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090},d=c[s];if(typeof d>"u")throw new Error(`Unknown file open mode: ${s}`);return d},no=(s,c)=>{var d=0;return s&&(d|=365),c&&(d|=146),d},kd={0:"Success",1:"Arg list too long",2:"Permission denied",3:"Address already in use",4:"Address not available",5:"Address family not supported by protocol family",6:"No more processes",7:"Socket already connected",8:"Bad file number",9:"Trying to read unreadable message",10:"Mount device busy",11:"Operation canceled",12:"No children",13:"Connection aborted",14:"Connection refused",15:"Connection reset by peer",16:"File locking deadlock error",17:"Destination address required",18:"Math arg out of domain of func",19:"Quota exceeded",20:"File exists",21:"Bad address",22:"File too large",23:"Host is unreachable",24:"Identifier removed",25:"Illegal byte sequence",26:"Connection already in progress",27:"Interrupted system call",28:"Invalid argument",29:"I/O error",30:"Socket is already connected",31:"Is a directory",32:"Too many symbolic links",33:"Too many open files",34:"Too many links",35:"Message too long",36:"Multihop attempted",37:"File or path name too long",38:"Network interface is not configured",39:"Connection reset by network",40:"Network is unreachable",41:"Too many open files in system",42:"No buffer space available",43:"No such device",44:"No such file or directory",45:"Exec format error",46:"No record locks available",47:"The link has been severed",48:"Not enough core",49:"No message of desired type",50:"Protocol not available",51:"No space left on device",52:"Function not implemented",53:"Socket is not connected",54:"Not a directory",55:"Directory not empty",56:"State not recoverable",57:"Socket operation on non-socket",59:"Not a typewriter",60:"No such device or address",61:"Value too large for defined data type",62:"Previous owner died",63:"Not super-user",64:"Broken pipe",65:"Protocol error",66:"Unknown protocol",67:"Protocol wrong type for socket",68:"Math result not representable",69:"Read only file system",70:"Illegal seek",71:"No such process",72:"Stale file handle",73:"Connection timed out",74:"Text file busy",75:"Cross-device link",100:"Device not a stream",101:"Bad font file fmt",102:"Invalid slot",103:"Invalid request code",104:"No anode",105:"Block device required",106:"Channel number out of range",107:"Level 3 halted",108:"Level 3 reset",109:"Link number out of range",110:"Protocol driver not attached",111:"No CSI structure available",112:"Level 2 halted",113:"Invalid exchange",114:"Invalid request descriptor",115:"Exchange full",116:"No data (for no delay io)",117:"Timer expired",118:"Out of streams resources",119:"Machine is not on the network",120:"Package not installed",121:"The object is remote",122:"Advertise error",123:"Srmount error",124:"Communication error on send",125:"Cross mount point (not really error)",126:"Given log. name not unique",127:"f.d. invalid for this operation",128:"Remote address changed",129:"Can   access a needed shared lib",130:"Accessing a corrupted shared lib",131:".lib section in a.out corrupted",132:"Attempting to link in too many libs",133:"Attempting to exec a shared library",135:"Streams pipe error",136:"Too many users",137:"Socket type not supported",138:"Not supported",139:"Protocol family not supported",140:"Can't send after socket shutdown",141:"Too many references",142:"Host is down",148:"No medium (in tape drive)",156:"Level 2 not synchronized"},io={},zd=s=>(Te("warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling"),s),Gd=s=>{var c=/\b_Z[\w\d_]+/g;return s.replace(c,function(d){var _=zd(d);return d===_?d:_+" ["+d+"]"})},b={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:!1,ignorePermissions:!0,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath(s,c={}){if(s=di.resolve(s),!s)return{path:"",node:null};var d={follow_mount:!0,recurse_count:0};if(c=Object.assign(d,c),c.recurse_count>8)throw new b.ErrnoError(32);for(var _=s.split("/").filter(ze=>!!ze),w=b.root,N="/",z=0;z<_.length;z++){var H=z===_.length-1;if(H&&c.parent)break;if(w=b.lookupNode(w,_[z]),N=bt.join2(N,_[z]),b.isMountpoint(w)&&(!H||H&&c.follow_mount)&&(w=w.mounted.root),!H||c.follow)for(var K=0;b.isLink(w.mode);){var me=b.readlink(N);N=di.resolve(bt.dirname(N),me);var Ce=b.lookupPath(N,{recurse_count:c.recurse_count+1});if(w=Ce.node,K++>40)throw new b.ErrnoError(32)}}return{path:N,node:w}},getPath(s){for(var c;;){if(b.isRoot(s)){var d=s.mount.mountpoint;return c?d[d.length-1]!=="/"?`${d}/${c}`:d+c:d}c=c?`${s.name}/${c}`:s.name,s=s.parent}},hashName(s,c){for(var d=0,_=0;_<c.length;_++)d=(d<<5)-d+c.charCodeAt(_)|0;return(s+d>>>0)%b.nameTable.length},hashAddNode(s){var c=b.hashName(s.parent.id,s.name);s.name_next=b.nameTable[c],b.nameTable[c]=s},hashRemoveNode(s){var c=b.hashName(s.parent.id,s.name);if(b.nameTable[c]===s)b.nameTable[c]=s.name_next;else for(var d=b.nameTable[c];d;){if(d.name_next===s){d.name_next=s.name_next;break}d=d.name_next}},lookupNode(s,c){var d=b.mayLookup(s);if(d)throw new b.ErrnoError(d,s);for(var _=b.hashName(s.id,c),w=b.nameTable[_];w;w=w.name_next){var N=w.name;if(w.parent.id===s.id&&N===c)return w}return b.lookup(s,c)},createNode(s,c,d,_){L(typeof s=="object");var w=new b.FSNode(s,c,d,_);return b.hashAddNode(w),w},destroyNode(s){b.hashRemoveNode(s)},isRoot(s){return s===s.parent},isMountpoint(s){return!!s.mounted},isFile(s){return(s&61440)===32768},isDir(s){return(s&61440)===16384},isLink(s){return(s&61440)===40960},isChrdev(s){return(s&61440)===8192},isBlkdev(s){return(s&61440)===24576},isFIFO(s){return(s&61440)===4096},isSocket(s){return(s&49152)===49152},flagsToPermissionString(s){var c=["r","w","rw"][s&3];return s&512&&(c+="w"),c},nodePermissions(s,c){return b.ignorePermissions?0:c.includes("r")&&!(s.mode&292)||c.includes("w")&&!(s.mode&146)||c.includes("x")&&!(s.mode&73)?2:0},mayLookup(s){var c=b.nodePermissions(s,"x");return c||(s.node_ops.lookup?0:2)},mayCreate(s,c){try{var d=b.lookupNode(s,c);return 20}catch{}return b.nodePermissions(s,"wx")},mayDelete(s,c,d){var _;try{_=b.lookupNode(s,c)}catch(N){return N.errno}var w=b.nodePermissions(s,"wx");if(w)return w;if(d){if(!b.isDir(_.mode))return 54;if(b.isRoot(_)||b.getPath(_)===b.cwd())return 10}else if(b.isDir(_.mode))return 31;return 0},mayOpen(s,c){return s?b.isLink(s.mode)?32:b.isDir(s.mode)&&(b.flagsToPermissionString(c)!=="r"||c&512)?31:b.nodePermissions(s,b.flagsToPermissionString(c)):44},MAX_OPEN_FDS:4096,nextfd(){for(var s=0;s<=b.MAX_OPEN_FDS;s++)if(!b.streams[s])return s;throw new b.ErrnoError(33)},getStreamChecked(s){var c=b.getStream(s);if(!c)throw new b.ErrnoError(8);return c},getStream:s=>b.streams[s],createStream(s,c=-1){return b.FSStream||(b.FSStream=function(){this.shared={}},b.FSStream.prototype={},Object.defineProperties(b.FSStream.prototype,{object:{get(){return this.node},set(d){this.node=d}},isRead:{get(){return(this.flags&2097155)!==1}},isWrite:{get(){return(this.flags&2097155)!==0}},isAppend:{get(){return this.flags&1024}},flags:{get(){return this.shared.flags},set(d){this.shared.flags=d}},position:{get(){return this.shared.position},set(d){this.shared.position=d}}})),s=Object.assign(new b.FSStream,s),c==-1&&(c=b.nextfd()),s.fd=c,b.streams[c]=s,s},closeStream(s){b.streams[s]=null},chrdev_stream_ops:{open(s){var c=b.getDevice(s.node.rdev);s.stream_ops=c.stream_ops,s.stream_ops.open&&s.stream_ops.open(s)},llseek(){throw new b.ErrnoError(70)}},major:s=>s>>8,minor:s=>s&255,makedev:(s,c)=>s<<8|c,registerDevice(s,c){b.devices[s]={stream_ops:c}},getDevice:s=>b.devices[s],getMounts(s){for(var c=[],d=[s];d.length;){var _=d.pop();c.push(_),d.push.apply(d,_.mounts)}return c},syncfs(s,c){typeof s=="function"&&(c=s,s=!1),b.syncFSRequests++,b.syncFSRequests>1&&A(`warning: ${b.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);var d=b.getMounts(b.root.mount),_=0;function w(z){return L(b.syncFSRequests>0),b.syncFSRequests--,c(z)}function N(z){if(z)return N.errored?void 0:(N.errored=!0,w(z));++_>=d.length&&w(null)}d.forEach(z=>{if(!z.type.syncfs)return N(null);z.type.syncfs(z,s,N)})},mount(s,c,d){if(typeof s=="string")throw s;var _=d==="/",w=!d,N;if(_&&b.root)throw new b.ErrnoError(10);if(!_&&!w){var z=b.lookupPath(d,{follow_mount:!1});if(d=z.path,N=z.node,b.isMountpoint(N))throw new b.ErrnoError(10);if(!b.isDir(N.mode))throw new b.ErrnoError(54)}var H={type:s,opts:c,mountpoint:d,mounts:[]},K=s.mount(H);return K.mount=H,H.root=K,_?b.root=K:N&&(N.mounted=H,N.mount&&N.mount.mounts.push(H)),K},unmount(s){var c=b.lookupPath(s,{follow_mount:!1});if(!b.isMountpoint(c.node))throw new b.ErrnoError(28);var d=c.node,_=d.mounted,w=b.getMounts(_);Object.keys(b.nameTable).forEach(z=>{for(var H=b.nameTable[z];H;){var K=H.name_next;w.includes(H.mount)&&b.destroyNode(H),H=K}}),d.mounted=null;var N=d.mount.mounts.indexOf(_);L(N!==-1),d.mount.mounts.splice(N,1)},lookup(s,c){return s.node_ops.lookup(s,c)},mknod(s,c,d){var _=b.lookupPath(s,{parent:!0}),w=_.node,N=bt.basename(s);if(!N||N==="."||N==="..")throw new b.ErrnoError(28);var z=b.mayCreate(w,N);if(z)throw new b.ErrnoError(z);if(!w.node_ops.mknod)throw new b.ErrnoError(63);return w.node_ops.mknod(w,N,c,d)},create(s,c){return c=c!==void 0?c:438,c&=4095,c|=32768,b.mknod(s,c,0)},mkdir(s,c){return c=c!==void 0?c:511,c&=1023,c|=16384,b.mknod(s,c,0)},mkdirTree(s,c){for(var d=s.split("/"),_="",w=0;w<d.length;++w)if(d[w]){_+="/"+d[w];try{b.mkdir(_,c)}catch(N){if(N.errno!=20)throw N}}},mkdev(s,c,d){return typeof d>"u"&&(d=c,c=438),c|=8192,b.mknod(s,c,d)},symlink(s,c){if(!di.resolve(s))throw new b.ErrnoError(44);var d=b.lookupPath(c,{parent:!0}),_=d.node;if(!_)throw new b.ErrnoError(44);var w=bt.basename(c),N=b.mayCreate(_,w);if(N)throw new b.ErrnoError(N);if(!_.node_ops.symlink)throw new b.ErrnoError(63);return _.node_ops.symlink(_,w,s)},rename(s,c){var d=bt.dirname(s),_=bt.dirname(c),w=bt.basename(s),N=bt.basename(c),z,H,K;if(z=b.lookupPath(s,{parent:!0}),H=z.node,z=b.lookupPath(c,{parent:!0}),K=z.node,!H||!K)throw new b.ErrnoError(44);if(H.mount!==K.mount)throw new b.ErrnoError(75);var me=b.lookupNode(H,w),Ce=di.relative(s,_);if(Ce.charAt(0)!==".")throw new b.ErrnoError(28);if(Ce=di.relative(c,d),Ce.charAt(0)!==".")throw new b.ErrnoError(55);var ze;try{ze=b.lookupNode(K,N)}catch{}if(me!==ze){var ke=b.isDir(me.mode),Xe=b.mayDelete(H,w,ke);if(Xe)throw new b.ErrnoError(Xe);if(Xe=ze?b.mayDelete(K,N,ke):b.mayCreate(K,N),Xe)throw new b.ErrnoError(Xe);if(!H.node_ops.rename)throw new b.ErrnoError(63);if(b.isMountpoint(me)||ze&&b.isMountpoint(ze))throw new b.ErrnoError(10);if(K!==H&&(Xe=b.nodePermissions(H,"w"),Xe))throw new b.ErrnoError(Xe);b.hashRemoveNode(me);try{H.node_ops.rename(me,K,N)}catch(tt){throw tt}finally{b.hashAddNode(me)}}},rmdir(s){var c=b.lookupPath(s,{parent:!0}),d=c.node,_=bt.basename(s),w=b.lookupNode(d,_),N=b.mayDelete(d,_,!0);if(N)throw new b.ErrnoError(N);if(!d.node_ops.rmdir)throw new b.ErrnoError(63);if(b.isMountpoint(w))throw new b.ErrnoError(10);d.node_ops.rmdir(d,_),b.destroyNode(w)},readdir(s){var c=b.lookupPath(s,{follow:!0}),d=c.node;if(!d.node_ops.readdir)throw new b.ErrnoError(54);return d.node_ops.readdir(d)},unlink(s){var c=b.lookupPath(s,{parent:!0}),d=c.node;if(!d)throw new b.ErrnoError(44);var _=bt.basename(s),w=b.lookupNode(d,_),N=b.mayDelete(d,_,!1);if(N)throw new b.ErrnoError(N);if(!d.node_ops.unlink)throw new b.ErrnoError(63);if(b.isMountpoint(w))throw new b.ErrnoError(10);d.node_ops.unlink(d,_),b.destroyNode(w)},readlink(s){var c=b.lookupPath(s),d=c.node;if(!d)throw new b.ErrnoError(44);if(!d.node_ops.readlink)throw new b.ErrnoError(28);return di.resolve(b.getPath(d.parent),d.node_ops.readlink(d))},stat(s,c){var d=b.lookupPath(s,{follow:!c}),_=d.node;if(!_)throw new b.ErrnoError(44);if(!_.node_ops.getattr)throw new b.ErrnoError(63);return _.node_ops.getattr(_)},lstat(s){return b.stat(s,!0)},chmod(s,c,d){var _;if(typeof s=="string"){var w=b.lookupPath(s,{follow:!d});_=w.node}else _=s;if(!_.node_ops.setattr)throw new b.ErrnoError(63);_.node_ops.setattr(_,{mode:c&4095|_.mode&-4096,timestamp:Date.now()})},lchmod(s,c){b.chmod(s,c,!0)},fchmod(s,c){var d=b.getStreamChecked(s);b.chmod(d.node,c)},chown(s,c,d,_){var w;if(typeof s=="string"){var N=b.lookupPath(s,{follow:!_});w=N.node}else w=s;if(!w.node_ops.setattr)throw new b.ErrnoError(63);w.node_ops.setattr(w,{timestamp:Date.now()})},lchown(s,c,d){b.chown(s,c,d,!0)},fchown(s,c,d){var _=b.getStreamChecked(s);b.chown(_.node,c,d)},truncate(s,c){if(c<0)throw new b.ErrnoError(28);var d;if(typeof s=="string"){var _=b.lookupPath(s,{follow:!0});d=_.node}else d=s;if(!d.node_ops.setattr)throw new b.ErrnoError(63);if(b.isDir(d.mode))throw new b.ErrnoError(31);if(!b.isFile(d.mode))throw new b.ErrnoError(28);var w=b.nodePermissions(d,"w");if(w)throw new b.ErrnoError(w);d.node_ops.setattr(d,{size:c,timestamp:Date.now()})},ftruncate(s,c){var d=b.getStreamChecked(s);if((d.flags&2097155)===0)throw new b.ErrnoError(28);b.truncate(d.node,c)},utime(s,c,d){var _=b.lookupPath(s,{follow:!0}),w=_.node;w.node_ops.setattr(w,{timestamp:Math.max(c,d)})},open(s,c,d){if(s==="")throw new b.ErrnoError(44);c=typeof c=="string"?Bd(c):c,d=typeof d>"u"?438:d,c&64?d=d&4095|32768:d=0;var _;if(typeof s=="object")_=s;else{s=bt.normalize(s);try{var w=b.lookupPath(s,{follow:!(c&131072)});_=w.node}catch{}}var N=!1;if(c&64)if(_){if(c&128)throw new b.ErrnoError(20)}else _=b.mknod(s,d,0),N=!0;if(!_)throw new b.ErrnoError(44);if(b.isChrdev(_.mode)&&(c&=-513),c&65536&&!b.isDir(_.mode))throw new b.ErrnoError(54);if(!N){var z=b.mayOpen(_,c);if(z)throw new b.ErrnoError(z)}c&512&&!N&&b.truncate(_,0),c&=-131713;var H=b.createStream({node:_,path:b.getPath(_),flags:c,seekable:!0,position:0,stream_ops:_.stream_ops,ungotten:[],error:!1});return H.stream_ops.open&&H.stream_ops.open(H),t.logReadFiles&&!(c&1)&&(b.readFiles||(b.readFiles={}),s in b.readFiles||(b.readFiles[s]=1)),H},close(s){if(b.isClosed(s))throw new b.ErrnoError(8);s.getdents&&(s.getdents=null);try{s.stream_ops.close&&s.stream_ops.close(s)}catch(c){throw c}finally{b.closeStream(s.fd)}s.fd=null},isClosed(s){return s.fd===null},llseek(s,c,d){if(b.isClosed(s))throw new b.ErrnoError(8);if(!s.seekable||!s.stream_ops.llseek)throw new b.ErrnoError(70);if(d!=0&&d!=1&&d!=2)throw new b.ErrnoError(28);return s.position=s.stream_ops.llseek(s,c,d),s.ungotten=[],s.position},read(s,c,d,_,w){if(L(d>=0),_<0||w<0)throw new b.ErrnoError(28);if(b.isClosed(s))throw new b.ErrnoError(8);if((s.flags&2097155)===1)throw new b.ErrnoError(8);if(b.isDir(s.node.mode))throw new b.ErrnoError(31);if(!s.stream_ops.read)throw new b.ErrnoError(28);var N=typeof w<"u";if(!N)w=s.position;else if(!s.seekable)throw new b.ErrnoError(70);var z=s.stream_ops.read(s,c,d,_,w);return N||(s.position+=z),z},write(s,c,d,_,w,N){if(L(d>=0),_<0||w<0)throw new b.ErrnoError(28);if(b.isClosed(s))throw new b.ErrnoError(8);if((s.flags&2097155)===0)throw new b.ErrnoError(8);if(b.isDir(s.node.mode))throw new b.ErrnoError(31);if(!s.stream_ops.write)throw new b.ErrnoError(28);s.seekable&&s.flags&1024&&b.llseek(s,0,2);var z=typeof w<"u";if(!z)w=s.position;else if(!s.seekable)throw new b.ErrnoError(70);var H=s.stream_ops.write(s,c,d,_,w,N);return z||(s.position+=H),H},allocate(s,c,d){if(b.isClosed(s))throw new b.ErrnoError(8);if(c<0||d<=0)throw new b.ErrnoError(28);if((s.flags&2097155)===0)throw new b.ErrnoError(8);if(!b.isFile(s.node.mode)&&!b.isDir(s.node.mode))throw new b.ErrnoError(43);if(!s.stream_ops.allocate)throw new b.ErrnoError(138);s.stream_ops.allocate(s,c,d)},mmap(s,c,d,_,w){if((_&2)!==0&&(w&2)===0&&(s.flags&2097155)!==2)throw new b.ErrnoError(2);if((s.flags&2097155)===1)throw new b.ErrnoError(2);if(!s.stream_ops.mmap)throw new b.ErrnoError(43);return s.stream_ops.mmap(s,c,d,_,w)},msync(s,c,d,_,w){return L(d>=0),s.stream_ops.msync?s.stream_ops.msync(s,c,d,_,w):0},munmap:s=>0,ioctl(s,c,d){if(!s.stream_ops.ioctl)throw new b.ErrnoError(59);return s.stream_ops.ioctl(s,c,d)},readFile(s,c={}){if(c.flags=c.flags||0,c.encoding=c.encoding||"binary",c.encoding!=="utf8"&&c.encoding!=="binary")throw new Error(`Invalid encoding type "${c.encoding}"`);var d,_=b.open(s,c.flags),w=b.stat(s),N=w.size,z=new Uint8Array(N);return b.read(_,z,0,N,0),c.encoding==="utf8"?d=wr(z,0):c.encoding==="binary"&&(d=z),b.close(_),d},writeFile(s,c,d={}){d.flags=d.flags||577;var _=b.open(s,d.flags,d.mode);if(typeof c=="string"){var w=new Uint8Array(Qs(c)+1),N=Js(c,w,0,w.length);b.write(_,w,0,N,void 0,d.canOwn)}else if(ArrayBuffer.isView(c))b.write(_,c,0,c.byteLength,void 0,d.canOwn);else throw new Error("Unsupported data type");b.close(_)},cwd:()=>b.currentPath,chdir(s){var c=b.lookupPath(s,{follow:!0});if(c.node===null)throw new b.ErrnoError(44);if(!b.isDir(c.node.mode))throw new b.ErrnoError(54);var d=b.nodePermissions(c.node,"x");if(d)throw new b.ErrnoError(d);b.currentPath=c.path},createDefaultDirectories(){b.mkdir("/tmp"),b.mkdir("/home"),b.mkdir("/home/web_user")},createDefaultDevices(){b.mkdir("/dev"),b.registerDevice(b.makedev(1,3),{read:()=>0,write:(_,w,N,z,H)=>z}),b.mkdev("/dev/null",b.makedev(1,3)),Bi.register(b.makedev(5,0),Bi.default_tty_ops),Bi.register(b.makedev(6,0),Bi.default_tty1_ops),b.mkdev("/dev/tty",b.makedev(5,0)),b.mkdev("/dev/tty1",b.makedev(6,0));var s=new Uint8Array(1024),c=0,d=()=>(c===0&&(c=uc(s).byteLength),s[--c]);b.createDevice("/dev","random",d),b.createDevice("/dev","urandom",d),b.mkdir("/dev/shm"),b.mkdir("/dev/shm/tmp")},createSpecialDirectories(){b.mkdir("/proc");var s=b.mkdir("/proc/self");b.mkdir("/proc/self/fd"),b.mount({mount(){var c=b.createNode(s,"fd",16895,73);return c.node_ops={lookup(d,_){var w=+_,N=b.getStreamChecked(w),z={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>N.path}};return z.parent=z,z}},c}},{},"/proc/self/fd")},createStandardStreams(){t.stdin?b.createDevice("/dev","stdin",t.stdin):b.symlink("/dev/tty","/dev/stdin"),t.stdout?b.createDevice("/dev","stdout",null,t.stdout):b.symlink("/dev/tty","/dev/stdout"),t.stderr?b.createDevice("/dev","stderr",null,t.stderr):b.symlink("/dev/tty1","/dev/stderr");var s=b.open("/dev/stdin",0),c=b.open("/dev/stdout",1),d=b.open("/dev/stderr",1);L(s.fd===0,`invalid handle for stdin (${s.fd})`),L(c.fd===1,`invalid handle for stdout (${c.fd})`),L(d.fd===2,`invalid handle for stderr (${d.fd})`)},ensureErrnoError(){b.ErrnoError||(b.ErrnoError=function(c,d){this.name="ErrnoError",this.node=d,this.setErrno=function(_){this.errno=_;for(var w in io)if(io[w]===_){this.code=w;break}},this.setErrno(c),this.message=kd[c],this.stack&&(Object.defineProperty(this,"stack",{value:new Error().stack,writable:!0}),this.stack=Gd(this.stack))},b.ErrnoError.prototype=new Error,b.ErrnoError.prototype.constructor=b.ErrnoError,[44].forEach(s=>{b.genericErrors[s]=new b.ErrnoError(s),b.genericErrors[s].stack="<generic error, no stack>"}))},staticInit(){b.ensureErrnoError(),b.nameTable=new Array(4096),b.mount(rt,{},"/"),b.createDefaultDirectories(),b.createDefaultDevices(),b.createSpecialDirectories(),b.filesystems={MEMFS:rt}},init(s,c,d){L(!b.init.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"),b.init.initialized=!0,b.ensureErrnoError(),t.stdin=s||t.stdin,t.stdout=c||t.stdout,t.stderr=d||t.stderr,b.createStandardStreams()},quit(){b.init.initialized=!1,vc(0);for(var s=0;s<b.streams.length;s++){var c=b.streams[s];c&&b.close(c)}},findObject(s,c){var d=b.analyzePath(s,c);return d.exists?d.object:null},analyzePath(s,c){try{var d=b.lookupPath(s,{follow:!c});s=d.path}catch{}var _={isRoot:!1,exists:!1,error:0,name:null,path:null,object:null,parentExists:!1,parentPath:null,parentObject:null};try{var d=b.lookupPath(s,{parent:!0});_.parentExists=!0,_.parentPath=d.path,_.parentObject=d.node,_.name=bt.basename(s),d=b.lookupPath(s,{follow:!c}),_.exists=!0,_.path=d.path,_.object=d.node,_.name=d.node.name,_.isRoot=d.path==="/"}catch(w){_.error=w.errno}return _},createPath(s,c,d,_){s=typeof s=="string"?s:b.getPath(s);for(var w=c.split("/").reverse();w.length;){var N=w.pop();if(N){var z=bt.join2(s,N);try{b.mkdir(z)}catch{}s=z}}return z},createFile(s,c,d,_,w){var N=bt.join2(typeof s=="string"?s:b.getPath(s),c),z=no(_,w);return b.create(N,z)},createDataFile(s,c,d,_,w,N){var z=c;s&&(s=typeof s=="string"?s:b.getPath(s),z=c?bt.join2(s,c):s);var H=no(_,w),K=b.create(z,H);if(d){if(typeof d=="string"){for(var me=new Array(d.length),Ce=0,ze=d.length;Ce<ze;++Ce)me[Ce]=d.charCodeAt(Ce);d=me}b.chmod(K,H|146);var ke=b.open(K,577);b.write(ke,d,0,d.length,0,N),b.close(ke),b.chmod(K,H)}return K},createDevice(s,c,d,_){var w=bt.join2(typeof s=="string"?s:b.getPath(s),c),N=no(!!d,!!_);b.createDevice.major||(b.createDevice.major=64);var z=b.makedev(b.createDevice.major++,0);return b.registerDevice(z,{open(H){H.seekable=!1},close(H){_&&_.buffer&&_.buffer.length&&_(10)},read(H,K,me,Ce,ze){for(var ke=0,Xe=0;Xe<Ce;Xe++){var tt;try{tt=d()}catch{throw new b.ErrnoError(29)}if(tt===void 0&&ke===0)throw new b.ErrnoError(6);if(tt==null)break;ke++,K[me+Xe]=tt}return ke&&(H.node.timestamp=Date.now()),ke},write(H,K,me,Ce,ze){for(var ke=0;ke<Ce;ke++)try{_(K[me+ke])}catch{throw new b.ErrnoError(29)}return Ce&&(H.node.timestamp=Date.now()),ke}}),b.mkdev(w,N,z)},forceLoadFile(s){if(s.isDevice||s.isFolder||s.link||s.contents)return!0;if(typeof XMLHttpRequest<"u")throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");if(y)try{s.contents=qa(y(s.url),!0),s.usedBytes=s.contents.length}catch{throw new b.ErrnoError(29)}else throw new Error("Cannot load without read() or XMLHttpRequest.")},createLazyFile(s,c,d,_,w){function N(){this.lengthKnown=!1,this.chunks=[]}if(N.prototype.get=function(Xe){if(!(Xe>this.length-1||Xe<0)){var tt=Xe%this.chunkSize,Lt=Xe/this.chunkSize|0;return this.getter(Lt)[tt]}},N.prototype.setDataGetter=function(Xe){this.getter=Xe},N.prototype.cacheLength=function(){var Xe=new XMLHttpRequest;if(Xe.open("HEAD",d,!1),Xe.send(null),!(Xe.status>=200&&Xe.status<300||Xe.status===304))throw new Error("Couldn't load "+d+". Status: "+Xe.status);var tt=Number(Xe.getResponseHeader("Content-length")),Lt,Bt=(Lt=Xe.getResponseHeader("Accept-Ranges"))&&Lt==="bytes",Vt=(Lt=Xe.getResponseHeader("Content-Encoding"))&&Lt==="gzip",fe=1024*1024;Bt||(fe=tt);var Ge=(It,Hn)=>{if(It>Hn)throw new Error("invalid range ("+It+", "+Hn+") or no bytes requested!");if(Hn>tt-1)throw new Error("only "+tt+" bytes available! programmer error!");var Ht=new XMLHttpRequest;if(Ht.open("GET",d,!1),tt!==fe&&Ht.setRequestHeader("Range","bytes="+It+"-"+Hn),Ht.responseType="arraybuffer",Ht.overrideMimeType&&Ht.overrideMimeType("text/plain; charset=x-user-defined"),Ht.send(null),!(Ht.status>=200&&Ht.status<300||Ht.status===304))throw new Error("Couldn't load "+d+". Status: "+Ht.status);return Ht.response!==void 0?new Uint8Array(Ht.response||[]):qa(Ht.responseText||"",!0)},$t=this;$t.setDataGetter(It=>{var Hn=It*fe,Ht=(It+1)*fe-1;if(Ht=Math.min(Ht,tt-1),typeof $t.chunks[It]>"u"&&($t.chunks[It]=Ge(Hn,Ht)),typeof $t.chunks[It]>"u")throw new Error("doXHR failed!");return $t.chunks[It]}),(Vt||!tt)&&(fe=tt=1,tt=this.getter(0).length,fe=tt,E("LazyFiles on gzip forces download of the whole file when length is accessed")),this._length=tt,this._chunkSize=fe,this.lengthKnown=!0},typeof XMLHttpRequest<"u"){if(!u)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var z=new N;Object.defineProperties(z,{length:{get:function(){return this.lengthKnown||this.cacheLength(),this._length}},chunkSize:{get:function(){return this.lengthKnown||this.cacheLength(),this._chunkSize}}});var H={isDevice:!1,contents:z}}else var H={isDevice:!1,url:d};var K=b.createFile(s,c,H,_,w);H.contents?K.contents=H.contents:H.url&&(K.contents=null,K.url=H.url),Object.defineProperties(K,{usedBytes:{get:function(){return this.contents.length}}});var me={},Ce=Object.keys(K.stream_ops);Ce.forEach(ke=>{var Xe=K.stream_ops[ke];me[ke]=function(){return b.forceLoadFile(K),Xe.apply(null,arguments)}});function ze(ke,Xe,tt,Lt,Bt){var Vt=ke.node.contents;if(Bt>=Vt.length)return 0;var fe=Math.min(Vt.length-Bt,Lt);if(L(fe>=0),Vt.slice)for(var Ge=0;Ge<fe;Ge++)Xe[tt+Ge]=Vt[Bt+Ge];else for(var Ge=0;Ge<fe;Ge++)Xe[tt+Ge]=Vt.get(Bt+Ge);return fe}return me.read=(ke,Xe,tt,Lt,Bt)=>(b.forceLoadFile(K),ze(ke,Xe,tt,Lt,Bt)),me.mmap=(ke,Xe,tt,Lt,Bt)=>{b.forceLoadFile(K);var Vt=dc();if(!Vt)throw new b.ErrnoError(48);return ze(ke,V,Vt,Xe,tt),{ptr:Vt,allocated:!0}},K.stream_ops=me,K},absolutePath(){D("FS.absolutePath has been removed; use PATH_FS.resolve instead")},createFolder(){D("FS.createFolder has been removed; use FS.mkdir instead")},createLink(){D("FS.createLink has been removed; use FS.symlink instead")},joinPath(){D("FS.joinPath has been removed; use PATH.join instead")},mmapAlloc(){D("FS.mmapAlloc has been replaced by the top level function mmapAlloc")},standardizePath(){D("FS.standardizePath has been removed; use PATH.normalize instead")}},hi={DEFAULT_POLLMASK:5,calculateAt(s,c,d){if(bt.isAbs(c))return c;var _;if(s===-100)_=b.cwd();else{var w=hi.getStreamFromFD(s);_=w.path}if(c.length==0){if(!d)throw new b.ErrnoError(44);return _}return bt.join2(_,c)},doStat(s,c,d){try{var _=s(c)}catch(H){if(H&&H.node&&bt.normalize(c)!==bt.normalize(b.getPath(H.node)))return-54;throw H}ne[d>>2]=_.dev,ne[d+4>>2]=_.mode,Y[d+8>>2]=_.nlink,ne[d+12>>2]=_.uid,ne[d+16>>2]=_.gid,ne[d+20>>2]=_.rdev,Re=[_.size>>>0,(re=_.size,+Math.abs(re)>=1?re>0?+Math.floor(re/4294967296)>>>0:~~+Math.ceil((re-+(~~re>>>0))/4294967296)>>>0:0)],ne[d+24>>2]=Re[0],ne[d+28>>2]=Re[1],ne[d+32>>2]=4096,ne[d+36>>2]=_.blocks;var w=_.atime.getTime(),N=_.mtime.getTime(),z=_.ctime.getTime();return Re=[Math.floor(w/1e3)>>>0,(re=Math.floor(w/1e3),+Math.abs(re)>=1?re>0?+Math.floor(re/4294967296)>>>0:~~+Math.ceil((re-+(~~re>>>0))/4294967296)>>>0:0)],ne[d+40>>2]=Re[0],ne[d+44>>2]=Re[1],Y[d+48>>2]=w%1e3*1e3,Re=[Math.floor(N/1e3)>>>0,(re=Math.floor(N/1e3),+Math.abs(re)>=1?re>0?+Math.floor(re/4294967296)>>>0:~~+Math.ceil((re-+(~~re>>>0))/4294967296)>>>0:0)],ne[d+56>>2]=Re[0],ne[d+60>>2]=Re[1],Y[d+64>>2]=N%1e3*1e3,Re=[Math.floor(z/1e3)>>>0,(re=Math.floor(z/1e3),+Math.abs(re)>=1?re>0?+Math.floor(re/4294967296)>>>0:~~+Math.ceil((re-+(~~re>>>0))/4294967296)>>>0:0)],ne[d+72>>2]=Re[0],ne[d+76>>2]=Re[1],Y[d+80>>2]=z%1e3*1e3,Re=[_.ino>>>0,(re=_.ino,+Math.abs(re)>=1?re>0?+Math.floor(re/4294967296)>>>0:~~+Math.ceil((re-+(~~re>>>0))/4294967296)>>>0:0)],ne[d+88>>2]=Re[0],ne[d+92>>2]=Re[1],0},doMsync(s,c,d,_,w){if(!b.isFile(c.node.mode))throw new b.ErrnoError(43);if(_&2)return 0;var N=X.slice(s,s+d);b.msync(c,N,w,d,_)},varargs:void 0,get(){L(hi.varargs!=null);var s=ne[+hi.varargs>>2];return hi.varargs+=4,s},getp(){return hi.get()},getStr(s){var c=Xa(s);return c},getStreamFromFD(s){var c=b.getStreamChecked(s);return c}},Vd=(s,c)=>{var d=0;return da().forEach((_,w)=>{var N=c+d;Y[s+w*4>>2]=N,Pd(_,N),d+=_.length+1}),0},Hd=(s,c)=>{var d=da();Y[s>>2]=d.length;var _=0;return d.forEach(w=>_+=w.length+1),Y[c>>2]=_,0},Wd=0,Xd=s=>{F=s,l(s,new ge(s))},hc=(s,c)=>{if(F=s,Sh(),!c){var d=`program exited (with status: ${s}), but keepRuntimeAlive() is set (counter=${Wd}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;r(d),A(d)}Xd(s)},qd=hc;function Yd(s){try{var c=hi.getStreamFromFD(s);return b.close(c),0}catch(d){if(typeof b>"u"||d.name!=="ErrnoError")throw d;return d.errno}}var jd=(s,c,d,_)=>{for(var w=0,N=0;N<d;N++){var z=Y[c>>2],H=Y[c+4>>2];c+=8;var K=b.read(s,V,z,H,_);if(K<0)return-1;if(w+=K,K<H)break}return w};function $d(s,c,d,_){try{var w=hi.getStreamFromFD(s),N=jd(w,c,d);return Y[_>>2]=N,0}catch(z){if(typeof b>"u"||z.name!=="ErrnoError")throw z;return z.errno}}var Kd=(s,c)=>(L(s==s>>>0||s==(s|0)),L(c===(c|0)),c+2097152>>>0<4194305-!!s?(s>>>0)+c*4294967296:NaN);function Zd(s,c,d,_,w){var N=Kd(c,d);try{if(isNaN(N))return 61;var z=hi.getStreamFromFD(s);return b.llseek(z,N,_),Re=[z.position>>>0,(re=z.position,+Math.abs(re)>=1?re>0?+Math.floor(re/4294967296)>>>0:~~+Math.ceil((re-+(~~re>>>0))/4294967296)>>>0:0)],ne[w>>2]=Re[0],ne[w+4>>2]=Re[1],z.getdents&&N===0&&_===0&&(z.getdents=null),0}catch(H){if(typeof b>"u"||H.name!=="ErrnoError")throw H;return H.errno}}var Jd=(s,c,d,_)=>{for(var w=0,N=0;N<d;N++){var z=Y[c>>2],H=Y[c+4>>2];c+=8;var K=b.write(s,V,z,H,_);if(K<0)return-1;w+=K}return w};function Qd(s,c,d,_){try{var w=hi.getStreamFromFD(s),N=Jd(w,c,d);return Y[_>>2]=N,0}catch(z){if(typeof b>"u"||z.name!=="ErrnoError")throw z;return z.errno}}var Ya=s=>s%4===0&&(s%100!==0||s%400===0),eh=(s,c)=>{for(var d=0,_=0;_<=c;d+=s[_++]);return d},pc=[31,29,31,30,31,30,31,31,30,31,30,31],mc=[31,28,31,30,31,30,31,31,30,31,30,31],th=(s,c)=>{for(var d=new Date(s.getTime());c>0;){var _=Ya(d.getFullYear()),w=d.getMonth(),N=(_?pc:mc)[w];if(c>N-d.getDate())c-=N-d.getDate()+1,d.setDate(1),w<11?d.setMonth(w+1):(d.setMonth(0),d.setFullYear(d.getFullYear()+1));else return d.setDate(d.getDate()+c),d}return d},nh=(s,c)=>{L(s.length>=0,"writeArrayToMemory array must have a length (should be an array or typed array)"),V.set(s,c)},ih=(s,c,d,_)=>{var w=Y[_+40>>2],N={tm_sec:ne[_>>2],tm_min:ne[_+4>>2],tm_hour:ne[_+8>>2],tm_mday:ne[_+12>>2],tm_mon:ne[_+16>>2],tm_year:ne[_+20>>2],tm_wday:ne[_+24>>2],tm_yday:ne[_+28>>2],tm_isdst:ne[_+32>>2],tm_gmtoff:ne[_+36>>2],tm_zone:w?Xa(w):""},z=Xa(d),H={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var K in H)z=z.replace(new RegExp(K,"g"),H[K]);var me=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],Ce=["January","February","March","April","May","June","July","August","September","October","November","December"];function ze(fe,Ge,$t){for(var It=typeof fe=="number"?fe.toString():fe||"";It.length<Ge;)It=$t[0]+It;return It}function ke(fe,Ge){return ze(fe,Ge,"0")}function Xe(fe,Ge){function $t(Hn){return Hn<0?-1:Hn>0?1:0}var It;return(It=$t(fe.getFullYear()-Ge.getFullYear()))===0&&(It=$t(fe.getMonth()-Ge.getMonth()))===0&&(It=$t(fe.getDate()-Ge.getDate())),It}function tt(fe){switch(fe.getDay()){case 0:return new Date(fe.getFullYear()-1,11,29);case 1:return fe;case 2:return new Date(fe.getFullYear(),0,3);case 3:return new Date(fe.getFullYear(),0,2);case 4:return new Date(fe.getFullYear(),0,1);case 5:return new Date(fe.getFullYear()-1,11,31);case 6:return new Date(fe.getFullYear()-1,11,30)}}function Lt(fe){var Ge=th(new Date(fe.tm_year+1900,0,1),fe.tm_yday),$t=new Date(Ge.getFullYear(),0,4),It=new Date(Ge.getFullYear()+1,0,4),Hn=tt($t),Ht=tt(It);return Xe(Hn,Ge)<=0?Xe(Ht,Ge)<=0?Ge.getFullYear()+1:Ge.getFullYear():Ge.getFullYear()-1}var Bt={"%a":fe=>me[fe.tm_wday].substring(0,3),"%A":fe=>me[fe.tm_wday],"%b":fe=>Ce[fe.tm_mon].substring(0,3),"%B":fe=>Ce[fe.tm_mon],"%C":fe=>{var Ge=fe.tm_year+1900;return ke(Ge/100|0,2)},"%d":fe=>ke(fe.tm_mday,2),"%e":fe=>ze(fe.tm_mday,2," "),"%g":fe=>Lt(fe).toString().substring(2),"%G":fe=>Lt(fe),"%H":fe=>ke(fe.tm_hour,2),"%I":fe=>{var Ge=fe.tm_hour;return Ge==0?Ge=12:Ge>12&&(Ge-=12),ke(Ge,2)},"%j":fe=>ke(fe.tm_mday+eh(Ya(fe.tm_year+1900)?pc:mc,fe.tm_mon-1),3),"%m":fe=>ke(fe.tm_mon+1,2),"%M":fe=>ke(fe.tm_min,2),"%n":()=>`
`,"%p":fe=>fe.tm_hour>=0&&fe.tm_hour<12?"AM":"PM","%S":fe=>ke(fe.tm_sec,2),"%t":()=>"	","%u":fe=>fe.tm_wday||7,"%U":fe=>{var Ge=fe.tm_yday+7-fe.tm_wday;return ke(Math.floor(Ge/7),2)},"%V":fe=>{var Ge=Math.floor((fe.tm_yday+7-(fe.tm_wday+6)%7)/7);if((fe.tm_wday+371-fe.tm_yday-2)%7<=2&&Ge++,Ge){if(Ge==53){var It=(fe.tm_wday+371-fe.tm_yday)%7;It!=4&&(It!=3||!Ya(fe.tm_year))&&(Ge=1)}}else{Ge=52;var $t=(fe.tm_wday+7-fe.tm_yday-1)%7;($t==4||$t==5&&Ya(fe.tm_year%400-1))&&Ge++}return ke(Ge,2)},"%w":fe=>fe.tm_wday,"%W":fe=>{var Ge=fe.tm_yday+7-(fe.tm_wday+6)%7;return ke(Math.floor(Ge/7),2)},"%y":fe=>(fe.tm_year+1900).toString().substring(2),"%Y":fe=>fe.tm_year+1900,"%z":fe=>{var Ge=fe.tm_gmtoff,$t=Ge>=0;return Ge=Math.abs(Ge)/60,Ge=Ge/60*100+Ge%60,($t?"+":"-")+("0000"+Ge).slice(-4)},"%Z":fe=>fe.tm_zone,"%%":()=>"%"};z=z.replace(/%%/g,"\0\0");for(var K in Bt)z.includes(K)&&(z=z.replace(new RegExp(K,"g"),Bt[K](N)));z=z.replace(/\0\0/g,"%");var Vt=qa(z,!1);return Vt.length>c?0:(nh(Vt,s),Vt.length-1)},rh=(s,c,d,_,w)=>ih(s,c,d,_),ah=s=>{if(s instanceof ge||s=="unwind")return F;at(),s instanceof WebAssembly.RuntimeError&&yc()<=0&&A("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)"),l(1,s)};Jn=t.InternalError=class extends Error{constructor(c){super(c),this.name="InternalError"}},Wa(),ua=t.BindingError=class extends Error{constructor(c){super(c),this.name="BindingError"}},Zs(),q(),en=t.UnboundTypeError=Qt(Error,"UnboundTypeError");var gc=function(s,c,d,_){s||(s=this),this.parent=s,this.mount=s.mount,this.mounted=null,this.id=b.nextInode++,this.name=c,this.mode=d,this.node_ops={},this.stream_ops={},this.rdev=_},ja=365,$a=146;Object.defineProperties(gc.prototype,{read:{get:function(){return(this.mode&ja)===ja},set:function(s){s?this.mode|=ja:this.mode&=~ja}},write:{get:function(){return(this.mode&$a)===$a},set:function(s){s?this.mode|=$a:this.mode&=~$a}},isFolder:{get:function(){return b.isDir(this.mode)}},isDevice:{get:function(){return b.isChrdev(this.mode)}}}),b.FSNode=gc,b.createPreloadedFile=Od,b.staticInit(),io={EPERM:63,ENOENT:44,ESRCH:71,EINTR:27,EIO:29,ENXIO:60,E2BIG:1,ENOEXEC:45,EBADF:8,ECHILD:12,EAGAIN:6,EWOULDBLOCK:6,ENOMEM:48,EACCES:2,EFAULT:21,ENOTBLK:105,EBUSY:10,EEXIST:20,EXDEV:75,ENODEV:43,ENOTDIR:54,EISDIR:31,EINVAL:28,ENFILE:41,EMFILE:33,ENOTTY:59,ETXTBSY:74,EFBIG:22,ENOSPC:51,ESPIPE:70,EROFS:69,EMLINK:34,EPIPE:64,EDOM:18,ERANGE:68,ENOMSG:49,EIDRM:24,ECHRNG:106,EL2NSYNC:156,EL3HLT:107,EL3RST:108,ELNRNG:109,EUNATCH:110,ENOCSI:111,EL2HLT:112,EDEADLK:16,ENOLCK:46,EBADE:113,EBADR:114,EXFULL:115,ENOANO:104,EBADRQC:103,EBADSLT:102,EDEADLOCK:16,EBFONT:101,ENOSTR:100,ENODATA:116,ETIME:117,ENOSR:118,ENONET:119,ENOPKG:120,EREMOTE:121,ENOLINK:47,EADV:122,ESRMNT:123,ECOMM:124,EPROTO:65,EMULTIHOP:36,EDOTDOT:125,EBADMSG:9,ENOTUNIQ:126,EBADFD:127,EREMCHG:128,ELIBACC:129,ELIBBAD:130,ELIBSCN:131,ELIBMAX:132,ELIBEXEC:133,ENOSYS:52,ENOTEMPTY:55,ENAMETOOLONG:37,ELOOP:32,EOPNOTSUPP:138,EPFNOSUPPORT:139,ECONNRESET:15,ENOBUFS:42,EAFNOSUPPORT:5,EPROTOTYPE:67,ENOTSOCK:57,ENOPROTOOPT:50,ESHUTDOWN:140,ECONNREFUSED:14,EADDRINUSE:3,ECONNABORTED:13,ENETUNREACH:40,ENETDOWN:38,ETIMEDOUT:73,EHOSTDOWN:142,EHOSTUNREACH:23,EINPROGRESS:26,EALREADY:7,EDESTADDRREQ:17,EMSGSIZE:35,EPROTONOSUPPORT:66,ESOCKTNOSUPPORT:137,EADDRNOTAVAIL:4,ENETRESET:39,EISCONN:30,ENOTCONN:53,ETOOMANYREFS:141,EUSERS:136,EDQUOT:19,ESTALE:72,ENOTSUP:138,ENOMEDIUM:148,EILSEQ:25,EOVERFLOW:61,ECANCELED:11,ENOTRECOVERABLE:56,EOWNERDEAD:62,ESTRPIPE:135};function sh(){Me("fetchSettings")}var xc={__cxa_throw:At,_embind_finalize_value_object:Ha,_embind_register_bigint:Mr,_embind_register_bool:Ks,_embind_register_emval:we,_embind_register_float:Ke,_embind_register_function:ed,_embind_register_integer:nd,_embind_register_memory_view:id,_embind_register_std_string:sd,_embind_register_std_wstring:hd,_embind_register_value_object:pd,_embind_register_value_object_field:md,_embind_register_void:gd,_emscripten_throw_longjmp:xd,_emval_decref:J,_emval_incref:_d,_emval_new_cstring:yd,_emval_take_value:Ed,abort:Md,emscripten_memcpy_js:Td,emscripten_resize_heap:Rd,environ_get:Vd,environ_sizes_get:Hd,exit:qd,fd_close:Yd,fd_read:$d,fd_seek:Zd,fd_write:Qd,invoke_ii:fh,invoke_iii:ph,invoke_iiii:hh,invoke_iiiii:mh,invoke_vi:uh,invoke_viii:dh,strftime_l:rh},pi=ce(),_c=ae("malloc"),oh=t._main=ae("main"),ki=ae("free"),lh=ae("__getTypeName");t.__embind_initialize_bindings=ae("_embind_initialize_bindings");var vc=t._fflush=ae("fflush"),Ar=ae("setThrew"),Sc=()=>(Sc=pi.emscripten_stack_init)(),ro=()=>(ro=pi.emscripten_stack_get_end)(),Rr=ae("stackSave"),Cr=ae("stackRestore"),yc=()=>(yc=pi.emscripten_stack_get_current)(),ch=ae("__cxa_is_pointer_type");t.dynCall_jiji=ae("dynCall_jiji"),t.dynCall_viijii=ae("dynCall_viijii"),t.dynCall_iiiiij=ae("dynCall_iiiiij"),t.dynCall_iiiiijj=ae("dynCall_iiiiijj"),t.dynCall_iiiiiijj=ae("dynCall_iiiiiijj");function fh(s,c){var d=Rr();try{return hn(s)(c)}catch(_){if(Cr(d),_!==_+0)throw _;Ar(1,0)}}function uh(s,c){var d=Rr();try{hn(s)(c)}catch(_){if(Cr(d),_!==_+0)throw _;Ar(1,0)}}function dh(s,c,d,_){var w=Rr();try{hn(s)(c,d,_)}catch(N){if(Cr(w),N!==N+0)throw N;Ar(1,0)}}function hh(s,c,d,_){var w=Rr();try{return hn(s)(c,d,_)}catch(N){if(Cr(w),N!==N+0)throw N;Ar(1,0)}}function ph(s,c,d){var _=Rr();try{return hn(s)(c,d)}catch(w){if(Cr(_),w!==w+0)throw w;Ar(1,0)}}function mh(s,c,d,_,w){var N=Rr();try{return hn(s)(c,d,_,w)}catch(z){if(Cr(N),z!==z+0)throw z;Ar(1,0)}}var gh=["writeI53ToI64","writeI53ToI64Clamped","writeI53ToI64Signaling","writeI53ToU64Clamped","writeI53ToU64Signaling","readI53FromI64","readI53FromU64","convertI32PairToI53","convertU32PairToI53","ydayFromDate","setErrNo","inetPton4","inetNtop4","inetPton6","inetNtop6","readSockaddr","writeSockaddr","getHostByName","getCallstack","emscriptenLog","convertPCtoSourceLocation","readEmAsmArgs","jstoi_q","jstoi_s","listenOnce","autoResumeAudioContext","runtimeKeepalivePush","runtimeKeepalivePop","callUserCallback","maybeExit","asmjsMangle","getNativeTypeSize","STACK_SIZE","STACK_ALIGN","POINTER_SIZE","ASSERTIONS","getCFunc","ccall","cwrap","uleb128Encode","sigToWasmTypes","generateFuncType","convertJsFunctionToWasm","getEmptyTableSlot","updateTableMap","getFunctionAddress","addFunction","removeFunction","reallyNegative","unSign","strLen","reSign","formatString","intArrayToString","AsciiToString","stringToNewUTF8","stringToUTF8OnStack","registerKeyEventCallback","maybeCStringToJsString","findEventTarget","findCanvasEventTarget","getBoundingClientRect","fillMouseEventData","registerMouseEventCallback","registerWheelEventCallback","registerUiEventCallback","registerFocusEventCallback","fillDeviceOrientationEventData","registerDeviceOrientationEventCallback","fillDeviceMotionEventData","registerDeviceMotionEventCallback","screenOrientation","fillOrientationChangeEventData","registerOrientationChangeEventCallback","fillFullscreenChangeEventData","registerFullscreenChangeEventCallback","JSEvents_requestFullscreen","JSEvents_resizeCanvasForFullscreen","registerRestoreOldStyle","hideEverythingExceptGivenElement","restoreHiddenElements","setLetterbox","softFullscreenResizeWebGLRenderTarget","doRequestFullscreen","fillPointerlockChangeEventData","registerPointerlockChangeEventCallback","registerPointerlockErrorEventCallback","requestPointerLock","fillVisibilityChangeEventData","registerVisibilityChangeEventCallback","registerTouchEventCallback","fillGamepadEventData","registerGamepadEventCallback","registerBeforeUnloadEventCallback","fillBatteryEventData","battery","registerBatteryEventCallback","setCanvasElementSize","getCanvasElementSize","jsStackTrace","stackTrace","checkWasiClock","wasiRightsToMuslOFlags","wasiOFlagsToMuslOFlags","createDyncallWrapper","safeSetTimeout","setImmediateWrapped","clearImmediateWrapped","polyfillSetImmediate","getPromise","makePromise","idsToPromises","makePromiseCallback","findMatchingCatch","setMainLoop","getSocketFromFD","getSocketAddress","FS_unlink","FS_mkdirTree","_setNetworkCallback","heapObjectForWebGLType","heapAccessShiftForWebGLHeap","webgl_enable_ANGLE_instanced_arrays","webgl_enable_OES_vertex_array_object","webgl_enable_WEBGL_draw_buffers","webgl_enable_WEBGL_multi_draw","emscriptenWebGLGet","computeUnpackAlignedImageSize","colorChannelsInGlTextureFormat","emscriptenWebGLGetTexPixelData","__glGenObject","emscriptenWebGLGetUniform","webglGetUniformLocation","webglPrepareUniformLocationsBeforeFirstUse","webglGetLeftBracePos","emscriptenWebGLGetVertexAttrib","__glGetActiveAttribOrUniform","writeGLArray","registerWebGlEventCallback","runAndAbortIfError","SDL_unicode","SDL_ttfContext","SDL_audio","ALLOC_NORMAL","ALLOC_STACK","allocate","writeStringToMemory","writeAsciiToMemory","getFunctionArgsName","init_embind","getBasestPointer","registerInheritedInstance","unregisterInheritedInstance","getInheritedInstance","getInheritedInstanceCount","getLiveInheritedInstances","enumReadValueFromPointer","genericPointerToWireType","constNoSmartPtrRawPointerToWireType","nonConstNoSmartPtrRawPointerToWireType","init_RegisteredPointer","RegisteredPointer","RegisteredPointer_fromWireType","runDestructor","releaseClassHandle","detachFinalizer","attachFinalizer","makeClassHandle","init_ClassHandle","ClassHandle","throwInstanceAlreadyDeleted","flushPendingDeletes","setDelayFunction","RegisteredClass","shallowCopyInternalPointer","downcastPointer","upcastPointer","validateThis","craftEmvalAllocator","emval_get_global","emval_lookupTypes","emval_addMethodCaller"];gh.forEach(ye);var xh=["run","addOnPreRun","addOnInit","addOnPreMain","addOnExit","addOnPostRun","addRunDependency","removeRunDependency","FS_createFolder","FS_createPath","FS_createLazyFile","FS_createLink","FS_createDevice","FS_readFile","out","err","callMain","abort","wasmMemory","wasmExports","stackAlloc","stackSave","stackRestore","getTempRet0","setTempRet0","writeStackCookie","checkStackCookie","convertI32PairToI53Checked","ptrToString","zeroMemory","exitJS","getHeapMax","growMemory","ENV","MONTH_DAYS_REGULAR","MONTH_DAYS_LEAP","MONTH_DAYS_REGULAR_CUMULATIVE","MONTH_DAYS_LEAP_CUMULATIVE","isLeapYear","arraySum","addDays","ERRNO_CODES","ERRNO_MESSAGES","DNS","Protocols","Sockets","initRandomFill","randomFill","timers","warnOnce","UNWIND_CACHE","readEmAsmArgsArray","getExecutableName","dynCallLegacy","getDynCaller","dynCall","handleException","keepRuntimeAlive","asyncLoad","alignMemory","mmapAlloc","handleAllocatorInit","HandleAllocator","wasmTable","noExitRuntime","freeTableIndexes","functionsInTableMap","setValue","getValue","PATH","PATH_FS","UTF8Decoder","UTF8ArrayToString","UTF8ToString","stringToUTF8Array","stringToUTF8","lengthBytesUTF8","intArrayFromString","stringToAscii","UTF16Decoder","UTF16ToString","stringToUTF16","lengthBytesUTF16","UTF32ToString","stringToUTF32","lengthBytesUTF32","writeArrayToMemory","JSEvents","specialHTMLTargets","currentFullscreenStrategy","restoreOldWindowedStyle","demangle","demangleAll","ExitStatus","getEnvStrings","doReadv","doWritev","promiseMap","uncaughtExceptionCount","exceptionLast","exceptionCaught","ExceptionInfo","Browser","wget","SYSCALLS","preloadPlugins","FS_createPreloadedFile","FS_modeStringToFlags","FS_getMode","FS_stdin_getChar_buffer","FS_stdin_getChar","FS","FS_createDataFile","MEMFS","TTY","PIPEFS","SOCKFS","tempFixedLengthArray","miniTempWebGLFloatBuffers","miniTempWebGLIntBuffers","GL","emscripten_webgl_power_preferences","AL","GLUT","EGL","GLEW","IDBStore","SDL","SDL_gfx","allocateUTF8","allocateUTF8OnStack","InternalError","BindingError","throwInternalError","throwBindingError","registeredTypes","awaitingDependencies","typeDependencies","tupleRegistrations","structRegistrations","sharedRegisterType","whenDependentTypesAreResolved","embind_charCodes","embind_init_charCodes","readLatin1String","getTypeName","getFunctionName","heap32VectorToArray","requireRegisteredType","UnboundTypeError","PureVirtualError","GenericWireTypeSize","throwUnboundTypeError","ensureOverloadTable","exposePublicSymbol","replacePublicSymbol","extendError","createNamedFunction","embindRepr","registeredInstances","registeredPointers","registerType","integerReadValueFromPointer","floatReadValueFromPointer","simpleReadValueFromPointer","readPointer","runDestructors","newFunc","craftInvokerFunction","embind__requireFunction","finalizationRegistry","detachFinalizer_deps","deletionQueue","delayFunction","char_0","char_9","makeLegalFunctionName","emval_handles","emval_symbols","init_emval","count_emval_handles","getStringOrSymbol","Emval","emval_newers","emval_methodCallers"];xh.forEach(xe);var Ka;st=function s(){Ka||bc(),Ka||(st=s)};function _h(){L(Ye==0,'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])'),L(ut.length==0,"cannot call main when preRun functions remain to be called");var s=oh,c=0,d=0;try{var _=s(c,d);return hc(_,!0),_}catch(w){return ah(w)}}function vh(){Sc(),Qe()}function bc(){if(Ye>0||(vh(),je(),Ye>0))return;function s(){Ka||(Ka=!0,t.calledRun=!0,!v&&(Ne(),nt(),i(t),t.onRuntimeInitialized&&t.onRuntimeInitialized(),Ec&&_h(),Ct()))}t.setStatus?(t.setStatus("Running..."),setTimeout(function(){setTimeout(function(){t.setStatus("")},1),s()},1)):s(),at()}function Sh(){var s=E,c=A,d=!1;E=A=_=>{d=!0};try{vc(0),["stdout","stderr"].forEach(function(_){var w=b.analyzePath("/dev/"+_);if(w){var N=w.object,z=N.rdev,H=Bi.ttys[z];H&&H.output&&H.output.length&&(d=!0)}})}catch{}E=s,A=c,d&&Te("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.")}if(t.preInit)for(typeof t.preInit=="function"&&(t.preInit=[t.preInit]);t.preInit.length>0;)t.preInit.pop()();var Ec=!0;return t.noInitialRun&&(Ec=!1),bc(),e.ready})})();let ko;const yS=async()=>(ko||(ko=await SS()),ko),bS=async n=>{const e=await yS();if(n.sdr.mimeType!=="image/jpeg")throw new Error("This function expects an SDR image compressed in jpeg");if(n.gainMap.mimeType!=="image/jpeg")throw new Error("This function expects a GainMap image compressed in jpeg");return e.appendGainMap(n.sdr.width,n.sdr.height,n.sdr.data,n.sdr.data.length,n.gainMap.data,n.gainMap.data.length,n.gainMapMax.reduce((t,i)=>t+i,0)/n.gainMapMax.length,n.gainMapMin.reduce((t,i)=>t+i,0)/n.gainMapMin.length,n.gamma.reduce((t,i)=>t+i,0)/n.gamma.length,n.offsetSdr.reduce((t,i)=>t+i,0)/n.offsetSdr.length,n.offsetHdr.reduce((t,i)=>t+i,0)/n.offsetHdr.length,n.hdrCapacityMin,n.hdrCapacityMax)};function ES(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}var bs={exports:{}},Uf;function MS(){return Uf||(Uf=1,(function(n,e){(function(){var t={};t.version="1.0.4",t.remove=function(C){var E=!1;if(C.slice(0,2)!="ÿØ")if(C.slice(0,23)=="data:image/jpeg;base64,"||C.slice(0,22)=="data:image/jpg;base64,")C=m(C.split(",")[1]),E=!0;else throw new Error("Given data is not jpeg.");var A=S(C),O=A.filter(function(v){return!(v.slice(0,2)=="ÿá"&&v.slice(4,10)=="Exif\0\0")}),M=O.join("");return E&&(M="data:image/jpeg;base64,"+p(M)),M},t.insert=function(C,E){var A=!1;if(C.slice(0,6)!="Exif\0\0")throw new Error("Given data is not exif.");if(E.slice(0,2)!="ÿØ")if(E.slice(0,23)=="data:image/jpeg;base64,"||E.slice(0,22)=="data:image/jpg;base64,")E=m(E.split(",")[1]),A=!0;else throw new Error("Given data is not jpeg.");var O="ÿá"+g(">H",[C.length+2])+C,M=S(E),v=U(M,O);return A&&(v="data:image/jpeg;base64,"+p(v)),v},t.load=function(C){var E;if(typeof C=="string")if(C.slice(0,2)=="ÿØ")E=C;else if(C.slice(0,23)=="data:image/jpeg;base64,"||C.slice(0,22)=="data:image/jpg;base64,")E=m(C.split(",")[1]);else if(C.slice(0,4)=="Exif")E=C.slice(6);else throw new Error("'load' gots invalid file data.");else throw new Error("'load' gots invalid type argument.");var A={"0th":{},Exif:{},GPS:{},Interop:{},"1st":{},thumbnail:null},O=new h(E);if(O.tiftag===null)return A;O.tiftag.slice(0,2)=="II"?O.endian_mark="<":O.endian_mark=">";var M=y(O.endian_mark+"L",O.tiftag.slice(4,8))[0];A["0th"]=O.get_ifd(M,"0th");var v=A["0th"].first_ifd_pointer;if(delete A["0th"].first_ifd_pointer,34665 in A["0th"]&&(M=A["0th"][34665],A.Exif=O.get_ifd(M,"Exif")),34853 in A["0th"]&&(M=A["0th"][34853],A.GPS=O.get_ifd(M,"GPS")),40965 in A.Exif&&(M=A.Exif[40965],A.Interop=O.get_ifd(M,"Interop")),v!="\0\0\0\0"&&(M=y(O.endian_mark+"L",v)[0],A["1st"]=O.get_ifd(M,"1st"),513 in A["1st"]&&514 in A["1st"])){var F=A["1st"][513]+A["1st"][514],L=O.tiftag.slice(A["1st"][513],F);A.thumbnail=L}return A},t.dump=function(C){var E=8,A=i(C),O="Exif\0\0MM\0*\0\0\0\b",M=!1,v=!1,F=!1,L=!1,V,X,Z,$,ne;"0th"in A?V=A["0th"]:V={},"Exif"in A&&Object.keys(A.Exif).length||"Interop"in A&&Object.keys(A.Interop).length?(V[34665]=1,M=!0,X=A.Exif,"Interop"in A&&Object.keys(A.Interop).length?(X[40965]=1,F=!0,Z=A.Interop):Object.keys(X).indexOf(t.ExifIFD.InteroperabilityTag.toString())>-1&&delete X[40965]):Object.keys(V).indexOf(t.ImageIFD.ExifTag.toString())>-1&&delete V[34665],"GPS"in A&&Object.keys(A.GPS).length?(V[t.ImageIFD.GPSTag]=1,v=!0,$=A.GPS):Object.keys(V).indexOf(t.ImageIFD.GPSTag.toString())>-1&&delete V[t.ImageIFD.GPSTag],"1st"in A&&"thumbnail"in A&&A.thumbnail!=null&&(L=!0,A["1st"][513]=1,A["1st"][514]=1,ne=A["1st"]);var Y=u(V,"0th",0),ue=Y[0].length+M*12+v*12+4+Y[1].length,he,Fe="",Qe=0,at,ut="",ft=0,se,le="",Ee=0,je,Ne="",nt;if(M&&(he=u(X,"Exif",ue),Qe=he[0].length+F*12+he[1].length),v&&(at=u($,"GPS",ue+Qe),ut=at.join(""),ft=ut.length),F){var Ct=ue+Qe+ft;se=u(Z,"Interop",Ct),le=se.join(""),Ee=le.length}if(L){var Ct=ue+Qe+ft+Ee;if(je=u(ne,"1st",Ct),nt=r(A.thumbnail),nt.length>64e3)throw new Error("Given thumbnail is too large. max 64kB")}var _e="",Ze="",k="",Ye="\0\0\0\0";if(M){var He=E+ue,st=g(">L",[He]),Se=34665,ht=g(">H",[Se]),Le=g(">H",[I.Long]),We=g(">L",[1]);_e=ht+Le+We+st}if(v){var He=E+ue+Qe,st=g(">L",[He]),Se=34853,ht=g(">H",[Se]),Le=g(">H",[I.Long]),We=g(">L",[1]);Ze=ht+Le+We+st}if(F){var He=E+ue+Qe+ft,st=g(">L",[He]),Se=40965,ht=g(">H",[Se]),Le=g(">H",[I.Long]),We=g(">L",[1]);k=ht+Le+We+st}if(L){var He=E+ue+Qe+ft+Ee;Ye=g(">L",[He]);var D=He+je[0].length+24+4+je[1].length,T="\0\0\0\0"+g(">L",[D]),j="\0\0\0\0"+g(">L",[nt.length]);Ne=je[0]+T+j+"\0\0\0\0"+je[1]+nt}var ie=Y[0]+_e+Ze+Ye+Y[1];return M&&(Fe=he[0]+k+he[1]),O+ie+Fe+ut+le+Ne};function i(C){return JSON.parse(JSON.stringify(C))}function r(C){for(var E=S(C);"ÿà"<=E[1].slice(0,2)&&E[1].slice(0,2)<="ÿï";)E=[E[0]].concat(E.slice(2));return E.join("")}function a(C){return g(">"+R("B",C.length),C)}function o(C){return g(">"+R("H",C.length),C)}function l(C){return g(">"+R("L",C.length),C)}function f(C,E,A){var O="",M="",v,F,L,V;if(E=="Byte")v=C.length,v<=4?M=a(C)+R("\0",4-v):(M=g(">L",[A]),O=a(C));else if(E=="Short")v=C.length,v<=2?M=o(C)+R("\0\0",2-v):(M=g(">L",[A]),O=o(C));else if(E=="Long")v=C.length,v<=1?M=l(C):(M=g(">L",[A]),O=l(C));else if(E=="Ascii")F=C+"\0",v=F.length,v>4?(M=g(">L",[A]),O=F):M=F+R("\0",4-v);else if(E=="Rational"){if(typeof C[0]=="number")v=1,L=C[0],V=C[1],F=g(">L",[L])+g(">L",[V]);else{v=C.length,F="";for(var X=0;X<v;X++)L=C[X][0],V=C[X][1],F+=g(">L",[L])+g(">L",[V])}M=g(">L",[A]),O=F}else if(E=="SRational"){if(typeof C[0]=="number")v=1,L=C[0],V=C[1],F=g(">l",[L])+g(">l",[V]);else{v=C.length,F="";for(var X=0;X<v;X++)L=C[X][0],V=C[X][1],F+=g(">l",[L])+g(">l",[V])}M=g(">L",[A]),O=F}else E=="Undefined"&&(v=C.length,v>4?(M=g(">L",[A]),O=C):M=C+R("\0",4-v));var Z=g(">L",[v]);return[Z,M,O]}function u(C,E,A){var O=8,M=Object.keys(C).length,v=g(">H",[M]),F;["0th","1st"].indexOf(E)>-1?F=2+M*12+4:F=2+M*12;var L="",V="",X;for(var X in C)if(typeof X=="string"&&(X=parseInt(X)),!(E=="0th"&&[34665,34853].indexOf(X)>-1)){{if(E=="Exif"&&X==40965)continue;if(E=="1st"&&[513,514].indexOf(X)>-1)continue}var Z=C[X],$=g(">H",[X]),ne=B[E][X].type,Y=g(">H",[I[ne]]);typeof Z=="number"&&(Z=[Z]);var ue=O+F+A+V.length,he=f(Z,ne,ue),Fe=he[0],Qe=he[1],at=he[2];L+=$+Y+Fe+Qe,V+=at}return[v+L,V]}function h(C){var E,A;if(C.slice(0,2)=="ÿØ")E=S(C),A=x(E),A?this.tiftag=A.slice(10):this.tiftag=null;else if(["II","MM"].indexOf(C.slice(0,2))>-1)this.tiftag=C;else if(C.slice(0,4)=="Exif")this.tiftag=C.slice(6);else throw new Error("Given file is neither JPEG nor TIFF.")}if(h.prototype={get_ifd:function(C,E){var A={},O=y(this.endian_mark+"H",this.tiftag.slice(C,C+2))[0],M=C+2,v;["0th","1st"].indexOf(E)>-1?v="Image":v=E;for(var F=0;F<O;F++){C=M+12*F;var L=y(this.endian_mark+"H",this.tiftag.slice(C,C+2))[0],V=y(this.endian_mark+"H",this.tiftag.slice(C+2,C+4))[0],X=y(this.endian_mark+"L",this.tiftag.slice(C+4,C+8))[0],Z=this.tiftag.slice(C+8,C+12),$=[V,X,Z];L in B[v]&&(A[L]=this.convert_value($))}return E=="0th"&&(C=M+12*O,A.first_ifd_pointer=this.tiftag.slice(C,C+4)),A},convert_value:function(C){var E=null,A=C[0],O=C[1],M=C[2],v;if(A==1)O>4?(v=y(this.endian_mark+"L",M)[0],E=y(this.endian_mark+R("B",O),this.tiftag.slice(v,v+O))):E=y(this.endian_mark+R("B",O),M.slice(0,O));else if(A==2)O>4?(v=y(this.endian_mark+"L",M)[0],E=this.tiftag.slice(v,v+O-1)):E=M.slice(0,O-1);else if(A==3)O>2?(v=y(this.endian_mark+"L",M)[0],E=y(this.endian_mark+R("H",O),this.tiftag.slice(v,v+O*2))):E=y(this.endian_mark+R("H",O),M.slice(0,O*2));else if(A==4)O>1?(v=y(this.endian_mark+"L",M)[0],E=y(this.endian_mark+R("L",O),this.tiftag.slice(v,v+O*4))):E=y(this.endian_mark+R("L",O),M);else if(A==5)if(v=y(this.endian_mark+"L",M)[0],O>1){E=[];for(var F=0;F<O;F++)E.push([y(this.endian_mark+"L",this.tiftag.slice(v+F*8,v+4+F*8))[0],y(this.endian_mark+"L",this.tiftag.slice(v+4+F*8,v+8+F*8))[0]])}else E=[y(this.endian_mark+"L",this.tiftag.slice(v,v+4))[0],y(this.endian_mark+"L",this.tiftag.slice(v+4,v+8))[0]];else if(A==7)O>4?(v=y(this.endian_mark+"L",M)[0],E=this.tiftag.slice(v,v+O)):E=M.slice(0,O);else if(A==9)O>1?(v=y(this.endian_mark+"L",M)[0],E=y(this.endian_mark+R("l",O),this.tiftag.slice(v,v+O*4))):E=y(this.endian_mark+R("l",O),M);else if(A==10)if(v=y(this.endian_mark+"L",M)[0],O>1){E=[];for(var F=0;F<O;F++)E.push([y(this.endian_mark+"l",this.tiftag.slice(v+F*8,v+4+F*8))[0],y(this.endian_mark+"l",this.tiftag.slice(v+4+F*8,v+8+F*8))[0]])}else E=[y(this.endian_mark+"l",this.tiftag.slice(v,v+4))[0],y(this.endian_mark+"l",this.tiftag.slice(v+4,v+8))[0]];else throw new Error("Exif might be wrong. Got incorrect value type to decode. type:"+A);return E instanceof Array&&E.length==1?E[0]:E}},typeof window<"u"&&typeof window.btoa=="function")var p=window.btoa;if(typeof p>"u")var p=function(E){for(var A="",O,M,v,F,L,V,X,Z=0,$="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";Z<E.length;)O=E.charCodeAt(Z++),M=E.charCodeAt(Z++),v=E.charCodeAt(Z++),F=O>>2,L=(O&3)<<4|M>>4,V=(M&15)<<2|v>>6,X=v&63,isNaN(M)?V=X=64:isNaN(v)&&(X=64),A=A+$.charAt(F)+$.charAt(L)+$.charAt(V)+$.charAt(X);return A};if(typeof window<"u"&&typeof window.atob=="function")var m=window.atob;if(typeof m>"u")var m=function(E){var A="",O,M,v,F,L,V,X,Z=0,$="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";for(E=E.replace(/[^A-Za-z0-9\+\/\=]/g,"");Z<E.length;)F=$.indexOf(E.charAt(Z++)),L=$.indexOf(E.charAt(Z++)),V=$.indexOf(E.charAt(Z++)),X=$.indexOf(E.charAt(Z++)),O=F<<2|L>>4,M=(L&15)<<4|V>>2,v=(V&3)<<6|X,A=A+String.fromCharCode(O),V!=64&&(A=A+String.fromCharCode(M)),X!=64&&(A=A+String.fromCharCode(v));return A};function g(C,E){if(!(E instanceof Array))throw new Error("'pack' error. Got invalid type argument.");if(C.length-1!=E.length)throw new Error("'pack' error. "+(C.length-1)+" marks, "+E.length+" elements.");var A;if(C[0]=="<")A=!0;else if(C[0]==">")A=!1;else throw new Error("");for(var O="",M=1,v=null,F=null,L=null;F=C[M];){if(F.toLowerCase()=="b"){if(v=E[M-1],F=="b"&&v<0&&(v+=256),v>255||v<0)throw new Error("'pack' error.");L=String.fromCharCode(v)}else if(F=="H"){if(v=E[M-1],v>65535||v<0)throw new Error("'pack' error.");L=String.fromCharCode(Math.floor(v%65536/256))+String.fromCharCode(v%256),A&&(L=L.split("").reverse().join(""))}else if(F.toLowerCase()=="l"){if(v=E[M-1],F=="l"&&v<0&&(v+=4294967296),v>4294967295||v<0)throw new Error("'pack' error.");L=String.fromCharCode(Math.floor(v/16777216))+String.fromCharCode(Math.floor(v%16777216/65536))+String.fromCharCode(Math.floor(v%65536/256))+String.fromCharCode(v%256),A&&(L=L.split("").reverse().join(""))}else throw new Error("'pack' error.");O+=L,M+=1}return O}function y(C,E){if(typeof E!="string")throw new Error("'unpack' error. Got invalid type argument.");for(var A=0,O=1;O<C.length;O++)if(C[O].toLowerCase()=="b")A+=1;else if(C[O].toLowerCase()=="h")A+=2;else if(C[O].toLowerCase()=="l")A+=4;else throw new Error("'unpack' error. Got invalid mark.");if(A!=E.length)throw new Error("'unpack' error. Mismatch between symbol and string length. "+A+":"+E.length);var M;if(C[0]=="<")M=!0;else if(C[0]==">")M=!1;else throw new Error("'unpack' error.");for(var v=[],F=0,L=1,V=null,X=null,Z=null,$="";X=C[L];){if(X.toLowerCase()=="b")Z=1,$=E.slice(F,F+Z),V=$.charCodeAt(0),X=="b"&&V>=128&&(V-=256);else if(X=="H")Z=2,$=E.slice(F,F+Z),M&&($=$.split("").reverse().join("")),V=$.charCodeAt(0)*256+$.charCodeAt(1);else if(X.toLowerCase()=="l")Z=4,$=E.slice(F,F+Z),M&&($=$.split("").reverse().join("")),V=$.charCodeAt(0)*16777216+$.charCodeAt(1)*65536+$.charCodeAt(2)*256+$.charCodeAt(3),X=="l"&&V>=2147483648&&(V-=4294967296);else throw new Error("'unpack' error. "+X);v.push(V),F+=Z,L+=1}return v}function R(C,E){for(var A="",O=0;O<E;O++)A+=C;return A}function S(C){if(C.slice(0,2)!="ÿØ")throw new Error("Given data isn't JPEG.");for(var E=2,A=["ÿØ"];;){if(C.slice(E,E+2)=="ÿÚ"){A.push(C.slice(E));break}else{var O=y(">H",C.slice(E+2,E+4))[0],M=E+O+2;A.push(C.slice(E,M)),E=M}if(E>=C.length)throw new Error("Wrong JPEG data.")}return A}function x(C){for(var E,A=0;A<C.length;A++)if(E=C[A],E.slice(0,2)=="ÿá"&&E.slice(4,10)=="Exif\0\0")return E;return null}function U(C,E){var A=!1,O=[];return C.forEach(function(M,v){M.slice(0,2)=="ÿá"&&M.slice(4,10)=="Exif\0\0"&&(A?O.unshift(v):(C[v]=E,A=!0))}),O.forEach(function(M){C.splice(M,1)}),!A&&E&&(C=[C[0],E].concat(C.slice(1))),C.join("")}var I={Byte:1,Ascii:2,Short:3,Long:4,Rational:5,Undefined:7,SLong:9,SRational:10},B={Image:{11:{name:"ProcessingSoftware",type:"Ascii"},254:{name:"NewSubfileType",type:"Long"},255:{name:"SubfileType",type:"Short"},256:{name:"ImageWidth",type:"Long"},257:{name:"ImageLength",type:"Long"},258:{name:"BitsPerSample",type:"Short"},259:{name:"Compression",type:"Short"},262:{name:"PhotometricInterpretation",type:"Short"},263:{name:"Threshholding",type:"Short"},264:{name:"CellWidth",type:"Short"},265:{name:"CellLength",type:"Short"},266:{name:"FillOrder",type:"Short"},269:{name:"DocumentName",type:"Ascii"},270:{name:"ImageDescription",type:"Ascii"},271:{name:"Make",type:"Ascii"},272:{name:"Model",type:"Ascii"},273:{name:"StripOffsets",type:"Long"},274:{name:"Orientation",type:"Short"},277:{name:"SamplesPerPixel",type:"Short"},278:{name:"RowsPerStrip",type:"Long"},279:{name:"StripByteCounts",type:"Long"},282:{name:"XResolution",type:"Rational"},283:{name:"YResolution",type:"Rational"},284:{name:"PlanarConfiguration",type:"Short"},290:{name:"GrayResponseUnit",type:"Short"},291:{name:"GrayResponseCurve",type:"Short"},292:{name:"T4Options",type:"Long"},293:{name:"T6Options",type:"Long"},296:{name:"ResolutionUnit",type:"Short"},301:{name:"TransferFunction",type:"Short"},305:{name:"Software",type:"Ascii"},306:{name:"DateTime",type:"Ascii"},315:{name:"Artist",type:"Ascii"},316:{name:"HostComputer",type:"Ascii"},317:{name:"Predictor",type:"Short"},318:{name:"WhitePoint",type:"Rational"},319:{name:"PrimaryChromaticities",type:"Rational"},320:{name:"ColorMap",type:"Short"},321:{name:"HalftoneHints",type:"Short"},322:{name:"TileWidth",type:"Short"},323:{name:"TileLength",type:"Short"},324:{name:"TileOffsets",type:"Short"},325:{name:"TileByteCounts",type:"Short"},330:{name:"SubIFDs",type:"Long"},332:{name:"InkSet",type:"Short"},333:{name:"InkNames",type:"Ascii"},334:{name:"NumberOfInks",type:"Short"},336:{name:"DotRange",type:"Byte"},337:{name:"TargetPrinter",type:"Ascii"},338:{name:"ExtraSamples",type:"Short"},339:{name:"SampleFormat",type:"Short"},340:{name:"SMinSampleValue",type:"Short"},341:{name:"SMaxSampleValue",type:"Short"},342:{name:"TransferRange",type:"Short"},343:{name:"ClipPath",type:"Byte"},344:{name:"XClipPathUnits",type:"Long"},345:{name:"YClipPathUnits",type:"Long"},346:{name:"Indexed",type:"Short"},347:{name:"JPEGTables",type:"Undefined"},351:{name:"OPIProxy",type:"Short"},512:{name:"JPEGProc",type:"Long"},513:{name:"JPEGInterchangeFormat",type:"Long"},514:{name:"JPEGInterchangeFormatLength",type:"Long"},515:{name:"JPEGRestartInterval",type:"Short"},517:{name:"JPEGLosslessPredictors",type:"Short"},518:{name:"JPEGPointTransforms",type:"Short"},519:{name:"JPEGQTables",type:"Long"},520:{name:"JPEGDCTables",type:"Long"},521:{name:"JPEGACTables",type:"Long"},529:{name:"YCbCrCoefficients",type:"Rational"},530:{name:"YCbCrSubSampling",type:"Short"},531:{name:"YCbCrPositioning",type:"Short"},532:{name:"ReferenceBlackWhite",type:"Rational"},700:{name:"XMLPacket",type:"Byte"},18246:{name:"Rating",type:"Short"},18249:{name:"RatingPercent",type:"Short"},32781:{name:"ImageID",type:"Ascii"},33421:{name:"CFARepeatPatternDim",type:"Short"},33422:{name:"CFAPattern",type:"Byte"},33423:{name:"BatteryLevel",type:"Rational"},33432:{name:"Copyright",type:"Ascii"},33434:{name:"ExposureTime",type:"Rational"},34377:{name:"ImageResources",type:"Byte"},34665:{name:"ExifTag",type:"Long"},34675:{name:"InterColorProfile",type:"Undefined"},34853:{name:"GPSTag",type:"Long"},34857:{name:"Interlace",type:"Short"},34858:{name:"TimeZoneOffset",type:"Long"},34859:{name:"SelfTimerMode",type:"Short"},37387:{name:"FlashEnergy",type:"Rational"},37388:{name:"SpatialFrequencyResponse",type:"Undefined"},37389:{name:"Noise",type:"Undefined"},37390:{name:"FocalPlaneXResolution",type:"Rational"},37391:{name:"FocalPlaneYResolution",type:"Rational"},37392:{name:"FocalPlaneResolutionUnit",type:"Short"},37393:{name:"ImageNumber",type:"Long"},37394:{name:"SecurityClassification",type:"Ascii"},37395:{name:"ImageHistory",type:"Ascii"},37397:{name:"ExposureIndex",type:"Rational"},37398:{name:"TIFFEPStandardID",type:"Byte"},37399:{name:"SensingMethod",type:"Short"},40091:{name:"XPTitle",type:"Byte"},40092:{name:"XPComment",type:"Byte"},40093:{name:"XPAuthor",type:"Byte"},40094:{name:"XPKeywords",type:"Byte"},40095:{name:"XPSubject",type:"Byte"},50341:{name:"PrintImageMatching",type:"Undefined"},50706:{name:"DNGVersion",type:"Byte"},50707:{name:"DNGBackwardVersion",type:"Byte"},50708:{name:"UniqueCameraModel",type:"Ascii"},50709:{name:"LocalizedCameraModel",type:"Byte"},50710:{name:"CFAPlaneColor",type:"Byte"},50711:{name:"CFALayout",type:"Short"},50712:{name:"LinearizationTable",type:"Short"},50713:{name:"BlackLevelRepeatDim",type:"Short"},50714:{name:"BlackLevel",type:"Rational"},50715:{name:"BlackLevelDeltaH",type:"SRational"},50716:{name:"BlackLevelDeltaV",type:"SRational"},50717:{name:"WhiteLevel",type:"Short"},50718:{name:"DefaultScale",type:"Rational"},50719:{name:"DefaultCropOrigin",type:"Short"},50720:{name:"DefaultCropSize",type:"Short"},50721:{name:"ColorMatrix1",type:"SRational"},50722:{name:"ColorMatrix2",type:"SRational"},50723:{name:"CameraCalibration1",type:"SRational"},50724:{name:"CameraCalibration2",type:"SRational"},50725:{name:"ReductionMatrix1",type:"SRational"},50726:{name:"ReductionMatrix2",type:"SRational"},50727:{name:"AnalogBalance",type:"Rational"},50728:{name:"AsShotNeutral",type:"Short"},50729:{name:"AsShotWhiteXY",type:"Rational"},50730:{name:"BaselineExposure",type:"SRational"},50731:{name:"BaselineNoise",type:"Rational"},50732:{name:"BaselineSharpness",type:"Rational"},50733:{name:"BayerGreenSplit",type:"Long"},50734:{name:"LinearResponseLimit",type:"Rational"},50735:{name:"CameraSerialNumber",type:"Ascii"},50736:{name:"LensInfo",type:"Rational"},50737:{name:"ChromaBlurRadius",type:"Rational"},50738:{name:"AntiAliasStrength",type:"Rational"},50739:{name:"ShadowScale",type:"SRational"},50740:{name:"DNGPrivateData",type:"Byte"},50741:{name:"MakerNoteSafety",type:"Short"},50778:{name:"CalibrationIlluminant1",type:"Short"},50779:{name:"CalibrationIlluminant2",type:"Short"},50780:{name:"BestQualityScale",type:"Rational"},50781:{name:"RawDataUniqueID",type:"Byte"},50827:{name:"OriginalRawFileName",type:"Byte"},50828:{name:"OriginalRawFileData",type:"Undefined"},50829:{name:"ActiveArea",type:"Short"},50830:{name:"MaskedAreas",type:"Short"},50831:{name:"AsShotICCProfile",type:"Undefined"},50832:{name:"AsShotPreProfileMatrix",type:"SRational"},50833:{name:"CurrentICCProfile",type:"Undefined"},50834:{name:"CurrentPreProfileMatrix",type:"SRational"},50879:{name:"ColorimetricReference",type:"Short"},50931:{name:"CameraCalibrationSignature",type:"Byte"},50932:{name:"ProfileCalibrationSignature",type:"Byte"},50934:{name:"AsShotProfileName",type:"Byte"},50935:{name:"NoiseReductionApplied",type:"Rational"},50936:{name:"ProfileName",type:"Byte"},50937:{name:"ProfileHueSatMapDims",type:"Long"},50938:{name:"ProfileHueSatMapData1",type:"Float"},50939:{name:"ProfileHueSatMapData2",type:"Float"},50940:{name:"ProfileToneCurve",type:"Float"},50941:{name:"ProfileEmbedPolicy",type:"Long"},50942:{name:"ProfileCopyright",type:"Byte"},50964:{name:"ForwardMatrix1",type:"SRational"},50965:{name:"ForwardMatrix2",type:"SRational"},50966:{name:"PreviewApplicationName",type:"Byte"},50967:{name:"PreviewApplicationVersion",type:"Byte"},50968:{name:"PreviewSettingsName",type:"Byte"},50969:{name:"PreviewSettingsDigest",type:"Byte"},50970:{name:"PreviewColorSpace",type:"Long"},50971:{name:"PreviewDateTime",type:"Ascii"},50972:{name:"RawImageDigest",type:"Undefined"},50973:{name:"OriginalRawFileDigest",type:"Undefined"},50974:{name:"SubTileBlockSize",type:"Long"},50975:{name:"RowInterleaveFactor",type:"Long"},50981:{name:"ProfileLookTableDims",type:"Long"},50982:{name:"ProfileLookTableData",type:"Float"},51008:{name:"OpcodeList1",type:"Undefined"},51009:{name:"OpcodeList2",type:"Undefined"},51022:{name:"OpcodeList3",type:"Undefined"}},Exif:{33434:{name:"ExposureTime",type:"Rational"},33437:{name:"FNumber",type:"Rational"},34850:{name:"ExposureProgram",type:"Short"},34852:{name:"SpectralSensitivity",type:"Ascii"},34855:{name:"ISOSpeedRatings",type:"Short"},34856:{name:"OECF",type:"Undefined"},34864:{name:"SensitivityType",type:"Short"},34865:{name:"StandardOutputSensitivity",type:"Long"},34866:{name:"RecommendedExposureIndex",type:"Long"},34867:{name:"ISOSpeed",type:"Long"},34868:{name:"ISOSpeedLatitudeyyy",type:"Long"},34869:{name:"ISOSpeedLatitudezzz",type:"Long"},36864:{name:"ExifVersion",type:"Undefined"},36867:{name:"DateTimeOriginal",type:"Ascii"},36868:{name:"DateTimeDigitized",type:"Ascii"},37121:{name:"ComponentsConfiguration",type:"Undefined"},37122:{name:"CompressedBitsPerPixel",type:"Rational"},37377:{name:"ShutterSpeedValue",type:"SRational"},37378:{name:"ApertureValue",type:"Rational"},37379:{name:"BrightnessValue",type:"SRational"},37380:{name:"ExposureBiasValue",type:"SRational"},37381:{name:"MaxApertureValue",type:"Rational"},37382:{name:"SubjectDistance",type:"Rational"},37383:{name:"MeteringMode",type:"Short"},37384:{name:"LightSource",type:"Short"},37385:{name:"Flash",type:"Short"},37386:{name:"FocalLength",type:"Rational"},37396:{name:"SubjectArea",type:"Short"},37500:{name:"MakerNote",type:"Undefined"},37510:{name:"UserComment",type:"Ascii"},37520:{name:"SubSecTime",type:"Ascii"},37521:{name:"SubSecTimeOriginal",type:"Ascii"},37522:{name:"SubSecTimeDigitized",type:"Ascii"},40960:{name:"FlashpixVersion",type:"Undefined"},40961:{name:"ColorSpace",type:"Short"},40962:{name:"PixelXDimension",type:"Long"},40963:{name:"PixelYDimension",type:"Long"},40964:{name:"RelatedSoundFile",type:"Ascii"},40965:{name:"InteroperabilityTag",type:"Long"},41483:{name:"FlashEnergy",type:"Rational"},41484:{name:"SpatialFrequencyResponse",type:"Undefined"},41486:{name:"FocalPlaneXResolution",type:"Rational"},41487:{name:"FocalPlaneYResolution",type:"Rational"},41488:{name:"FocalPlaneResolutionUnit",type:"Short"},41492:{name:"SubjectLocation",type:"Short"},41493:{name:"ExposureIndex",type:"Rational"},41495:{name:"SensingMethod",type:"Short"},41728:{name:"FileSource",type:"Undefined"},41729:{name:"SceneType",type:"Undefined"},41730:{name:"CFAPattern",type:"Undefined"},41985:{name:"CustomRendered",type:"Short"},41986:{name:"ExposureMode",type:"Short"},41987:{name:"WhiteBalance",type:"Short"},41988:{name:"DigitalZoomRatio",type:"Rational"},41989:{name:"FocalLengthIn35mmFilm",type:"Short"},41990:{name:"SceneCaptureType",type:"Short"},41991:{name:"GainControl",type:"Short"},41992:{name:"Contrast",type:"Short"},41993:{name:"Saturation",type:"Short"},41994:{name:"Sharpness",type:"Short"},41995:{name:"DeviceSettingDescription",type:"Undefined"},41996:{name:"SubjectDistanceRange",type:"Short"},42016:{name:"ImageUniqueID",type:"Ascii"},42032:{name:"CameraOwnerName",type:"Ascii"},42033:{name:"BodySerialNumber",type:"Ascii"},42034:{name:"LensSpecification",type:"Rational"},42035:{name:"LensMake",type:"Ascii"},42036:{name:"LensModel",type:"Ascii"},42037:{name:"LensSerialNumber",type:"Ascii"},42240:{name:"Gamma",type:"Rational"}},GPS:{0:{name:"GPSVersionID",type:"Byte"},1:{name:"GPSLatitudeRef",type:"Ascii"},2:{name:"GPSLatitude",type:"Rational"},3:{name:"GPSLongitudeRef",type:"Ascii"},4:{name:"GPSLongitude",type:"Rational"},5:{name:"GPSAltitudeRef",type:"Byte"},6:{name:"GPSAltitude",type:"Rational"},7:{name:"GPSTimeStamp",type:"Rational"},8:{name:"GPSSatellites",type:"Ascii"},9:{name:"GPSStatus",type:"Ascii"},10:{name:"GPSMeasureMode",type:"Ascii"},11:{name:"GPSDOP",type:"Rational"},12:{name:"GPSSpeedRef",type:"Ascii"},13:{name:"GPSSpeed",type:"Rational"},14:{name:"GPSTrackRef",type:"Ascii"},15:{name:"GPSTrack",type:"Rational"},16:{name:"GPSImgDirectionRef",type:"Ascii"},17:{name:"GPSImgDirection",type:"Rational"},18:{name:"GPSMapDatum",type:"Ascii"},19:{name:"GPSDestLatitudeRef",type:"Ascii"},20:{name:"GPSDestLatitude",type:"Rational"},21:{name:"GPSDestLongitudeRef",type:"Ascii"},22:{name:"GPSDestLongitude",type:"Rational"},23:{name:"GPSDestBearingRef",type:"Ascii"},24:{name:"GPSDestBearing",type:"Rational"},25:{name:"GPSDestDistanceRef",type:"Ascii"},26:{name:"GPSDestDistance",type:"Rational"},27:{name:"GPSProcessingMethod",type:"Undefined"},28:{name:"GPSAreaInformation",type:"Undefined"},29:{name:"GPSDateStamp",type:"Ascii"},30:{name:"GPSDifferential",type:"Short"},31:{name:"GPSHPositioningError",type:"Rational"}},Interop:{1:{name:"InteroperabilityIndex",type:"Ascii"}}};B["0th"]=B.Image,B["1st"]=B.Image,t.TAGS=B,t.ImageIFD={ProcessingSoftware:11,NewSubfileType:254,SubfileType:255,ImageWidth:256,ImageLength:257,BitsPerSample:258,Compression:259,PhotometricInterpretation:262,Threshholding:263,CellWidth:264,CellLength:265,FillOrder:266,DocumentName:269,ImageDescription:270,Make:271,Model:272,StripOffsets:273,Orientation:274,SamplesPerPixel:277,RowsPerStrip:278,StripByteCounts:279,XResolution:282,YResolution:283,PlanarConfiguration:284,GrayResponseUnit:290,GrayResponseCurve:291,T4Options:292,T6Options:293,ResolutionUnit:296,TransferFunction:301,Software:305,DateTime:306,Artist:315,HostComputer:316,Predictor:317,WhitePoint:318,PrimaryChromaticities:319,ColorMap:320,HalftoneHints:321,TileWidth:322,TileLength:323,TileOffsets:324,TileByteCounts:325,SubIFDs:330,InkSet:332,InkNames:333,NumberOfInks:334,DotRange:336,TargetPrinter:337,ExtraSamples:338,SampleFormat:339,SMinSampleValue:340,SMaxSampleValue:341,TransferRange:342,ClipPath:343,XClipPathUnits:344,YClipPathUnits:345,Indexed:346,JPEGTables:347,OPIProxy:351,JPEGProc:512,JPEGInterchangeFormat:513,JPEGInterchangeFormatLength:514,JPEGRestartInterval:515,JPEGLosslessPredictors:517,JPEGPointTransforms:518,JPEGQTables:519,JPEGDCTables:520,JPEGACTables:521,YCbCrCoefficients:529,YCbCrSubSampling:530,YCbCrPositioning:531,ReferenceBlackWhite:532,XMLPacket:700,Rating:18246,RatingPercent:18249,ImageID:32781,CFARepeatPatternDim:33421,CFAPattern:33422,BatteryLevel:33423,Copyright:33432,ExposureTime:33434,ImageResources:34377,ExifTag:34665,InterColorProfile:34675,GPSTag:34853,Interlace:34857,TimeZoneOffset:34858,SelfTimerMode:34859,FlashEnergy:37387,SpatialFrequencyResponse:37388,Noise:37389,FocalPlaneXResolution:37390,FocalPlaneYResolution:37391,FocalPlaneResolutionUnit:37392,ImageNumber:37393,SecurityClassification:37394,ImageHistory:37395,ExposureIndex:37397,TIFFEPStandardID:37398,SensingMethod:37399,XPTitle:40091,XPComment:40092,XPAuthor:40093,XPKeywords:40094,XPSubject:40095,PrintImageMatching:50341,DNGVersion:50706,DNGBackwardVersion:50707,UniqueCameraModel:50708,LocalizedCameraModel:50709,CFAPlaneColor:50710,CFALayout:50711,LinearizationTable:50712,BlackLevelRepeatDim:50713,BlackLevel:50714,BlackLevelDeltaH:50715,BlackLevelDeltaV:50716,WhiteLevel:50717,DefaultScale:50718,DefaultCropOrigin:50719,DefaultCropSize:50720,ColorMatrix1:50721,ColorMatrix2:50722,CameraCalibration1:50723,CameraCalibration2:50724,ReductionMatrix1:50725,ReductionMatrix2:50726,AnalogBalance:50727,AsShotNeutral:50728,AsShotWhiteXY:50729,BaselineExposure:50730,BaselineNoise:50731,BaselineSharpness:50732,BayerGreenSplit:50733,LinearResponseLimit:50734,CameraSerialNumber:50735,LensInfo:50736,ChromaBlurRadius:50737,AntiAliasStrength:50738,ShadowScale:50739,DNGPrivateData:50740,MakerNoteSafety:50741,CalibrationIlluminant1:50778,CalibrationIlluminant2:50779,BestQualityScale:50780,RawDataUniqueID:50781,OriginalRawFileName:50827,OriginalRawFileData:50828,ActiveArea:50829,MaskedAreas:50830,AsShotICCProfile:50831,AsShotPreProfileMatrix:50832,CurrentICCProfile:50833,CurrentPreProfileMatrix:50834,ColorimetricReference:50879,CameraCalibrationSignature:50931,ProfileCalibrationSignature:50932,AsShotProfileName:50934,NoiseReductionApplied:50935,ProfileName:50936,ProfileHueSatMapDims:50937,ProfileHueSatMapData1:50938,ProfileHueSatMapData2:50939,ProfileToneCurve:50940,ProfileEmbedPolicy:50941,ProfileCopyright:50942,ForwardMatrix1:50964,ForwardMatrix2:50965,PreviewApplicationName:50966,PreviewApplicationVersion:50967,PreviewSettingsName:50968,PreviewSettingsDigest:50969,PreviewColorSpace:50970,PreviewDateTime:50971,RawImageDigest:50972,OriginalRawFileDigest:50973,SubTileBlockSize:50974,RowInterleaveFactor:50975,ProfileLookTableDims:50981,ProfileLookTableData:50982,OpcodeList1:51008,OpcodeList2:51009,OpcodeList3:51022,NoiseProfile:51041},t.ExifIFD={ExposureTime:33434,FNumber:33437,ExposureProgram:34850,SpectralSensitivity:34852,ISOSpeedRatings:34855,OECF:34856,SensitivityType:34864,StandardOutputSensitivity:34865,RecommendedExposureIndex:34866,ISOSpeed:34867,ISOSpeedLatitudeyyy:34868,ISOSpeedLatitudezzz:34869,ExifVersion:36864,DateTimeOriginal:36867,DateTimeDigitized:36868,ComponentsConfiguration:37121,CompressedBitsPerPixel:37122,ShutterSpeedValue:37377,ApertureValue:37378,BrightnessValue:37379,ExposureBiasValue:37380,MaxApertureValue:37381,SubjectDistance:37382,MeteringMode:37383,LightSource:37384,Flash:37385,FocalLength:37386,SubjectArea:37396,MakerNote:37500,UserComment:37510,SubSecTime:37520,SubSecTimeOriginal:37521,SubSecTimeDigitized:37522,FlashpixVersion:40960,ColorSpace:40961,PixelXDimension:40962,PixelYDimension:40963,RelatedSoundFile:40964,InteroperabilityTag:40965,FlashEnergy:41483,SpatialFrequencyResponse:41484,FocalPlaneXResolution:41486,FocalPlaneYResolution:41487,FocalPlaneResolutionUnit:41488,SubjectLocation:41492,ExposureIndex:41493,SensingMethod:41495,FileSource:41728,SceneType:41729,CFAPattern:41730,CustomRendered:41985,ExposureMode:41986,WhiteBalance:41987,DigitalZoomRatio:41988,FocalLengthIn35mmFilm:41989,SceneCaptureType:41990,GainControl:41991,Contrast:41992,Saturation:41993,Sharpness:41994,DeviceSettingDescription:41995,SubjectDistanceRange:41996,ImageUniqueID:42016,CameraOwnerName:42032,BodySerialNumber:42033,LensSpecification:42034,LensMake:42035,LensModel:42036,LensSerialNumber:42037,Gamma:42240},t.GPSIFD={GPSVersionID:0,GPSLatitudeRef:1,GPSLatitude:2,GPSLongitudeRef:3,GPSLongitude:4,GPSAltitudeRef:5,GPSAltitude:6,GPSTimeStamp:7,GPSSatellites:8,GPSStatus:9,GPSMeasureMode:10,GPSDOP:11,GPSSpeedRef:12,GPSSpeed:13,GPSTrackRef:14,GPSTrack:15,GPSImgDirectionRef:16,GPSImgDirection:17,GPSMapDatum:18,GPSDestLatitudeRef:19,GPSDestLatitude:20,GPSDestLongitudeRef:21,GPSDestLongitude:22,GPSDestBearingRef:23,GPSDestBearing:24,GPSDestDistanceRef:25,GPSDestDistance:26,GPSProcessingMethod:27,GPSAreaInformation:28,GPSDateStamp:29,GPSDifferential:30,GPSHPositioningError:31},t.InteropIFD={InteroperabilityIndex:1},t.GPSHelper={degToDmsRational:function(C){var E=Math.abs(C),A=E%1*60,O=A%1*60,M=Math.floor(E),v=Math.floor(A),F=Math.round(O*100);return[[M,1],[v,1],[F,100]]},dmsRationalToDeg:function(C,E){var A=E==="S"||E==="W"?-1:1,O=C[0][0]/C[0][1]+C[1][0]/C[1][1]/60+C[2][0]/C[2][1]/3600;return O*A}},n.exports&&(e=n.exports=t),e.piexif=t})()})(bs,bs.exports)),bs.exports}var TS=MS();const va=ES(TS);async function wS(n,e={maxContentBoost:4,rotation:0,quality:.95}){console.log("[Process] Starting processing for:",n.name),await n.arrayBuffer();const t=await AS(n);console.log("[Process] File loaded");let i=null;try{(n.type==="image/jpeg"||n.type==="image/jpg")&&(i=va.load(t),console.log("[Process] EXIF extracted"))}catch(L){console.warn("Could not extract EXIF:",L)}const r=await new Promise((L,V)=>{const X=new Image;X.onload=()=>L(X),X.onerror=V,X.src=t});console.log("[Process] Image object created",r.width,"x",r.height);let a=document.createElement("canvas"),o=a.getContext("2d"),l=r.width,f=r.height,u=e.rotation||0;u=(u%360+360)%360,u===90||u===270?(a.width=f,a.height=l):(a.width=l,a.height=f),o.translate(a.width/2,a.height/2),o.rotate(u*Math.PI/180),o.drawImage(r,-l/2,-f/2),console.log("[Process] Canvas drawn (rotation applied)");let h=o.getImageData(0,0,a.width,a.height),p=h.data;console.log("[Process] Image data retrieved"),a.width=1,a.height=1,a=null,o=null,console.log("[Process] Canvas cleaned up");const m=p.length,g=new Uint16Array(m),y=e.maxContentBoost||4,R=L=>(L/=255,L<=.04045?L/12.92:Math.pow((L+.055)/1.055,2.4));for(let L=0;L<m;L+=4)g[L]=ls.toHalfFloat(R(p[L])*y),g[L+1]=ls.toHalfFloat(R(p[L+1])*y),g[L+2]=ls.toHalfFloat(R(p[L+2])*y),g[L+3]=ls.toHalfFloat(p[L+3]/255);console.log("[Process] Converted to HalfFloat Uint16Array");const S=new Na(g,h.width,h.height,xn,Ni);S.colorSpace=ci,S.needsUpdate=!0,console.log("[Process] HDR DataTexture created");const x=gS({image:S,maxContentBoost:y,toneMapping:Ai});console.log("[Process] gainmap-js encode() called"),x.sdr.material.exposure=1/y,x.sdr.material.needsUpdate=!0;let U=h;x.sdr.render(),console.log("[Process] SDR rendered");const I=x.gainMap.toArray();console.log("[Process] GainMap toArray() completed");let B=new ImageData(new Uint8ClampedArray(I),x.gainMap.width,x.gainMap.height);x.gainMap.dispose(),x.sdr.dispose(),S.dispose(),console.log("[Process] WebGL resources disposed");const C="image/jpeg",E=e.quality||.95;console.log("[Process] Starting SDR compression...");const A=await Oc({source:U,mimeType:C,quality:E,flipY:!1});console.log("[Process] SDR compression complete"),U=null,p=null,h=null,console.log("[Process] SDR data released"),console.log("[Process] Starting GainMap compression...");const O=await Oc({source:B,mimeType:C,quality:E,flipY:!1});console.log("[Process] GainMap compression complete"),B=null;const M=x.getMetadata();console.log("[Process] Embedding metadata...");const v=await bS({...x,...M,sdr:A,gainMap:O});console.log("[Process] Metadata embedded");let F=v;if(i)try{i["0th"]&&i["0th"][va.ImageIFD.Orientation]&&(i["0th"][va.ImageIFD.Orientation]=1);const L=Array.from(F).map($=>String.fromCharCode($)).join(""),V=va.dump(i),X=va.insert(V,L),Z=X.length;F=new Uint8Array(Z);for(let $=0;$<Z;$++)F[$]=X.charCodeAt($);console.log("[Process] EXIF re-inserted")}catch(L){console.warn("Could not re-insert EXIF:",L)}return console.log("[Process] Processing complete, returning Blob"),new Blob([F],{type:"image/jpeg"})}function AS(n){return new Promise((e,t)=>{const i=new FileReader;i.onload=()=>e(i.result),i.onerror=t,i.readAsDataURL(n)})}var RS=Ui('<div class="error card svelte-1a1t040"><h3>Error</h3> <p> </p></div>'),CS=Ui('<div class="loading-overlay svelte-1a1t040"><div class="spinner svelte-1a1t040"></div> <p>Processing...</p></div>'),PS=Ap('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 svelte-1a1t040"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"></path></svg>'),DS=Ui('<div class="circle svelte-1a1t040"></div>'),LS=Ui('<div role="button" tabindex="0"><div class="selection-indicator svelte-1a1t040"><!></div> <div class="preview svelte-1a1t040"><img alt="Processed result" class="svelte-1a1t040"/></div> <div class="info svelte-1a1t040"><p class="filename svelte-1a1t040"> </p> <p class="size svelte-1a1t040"> </p></div></div>'),IS=Ui('<div class="results svelte-1a1t040"><div class="results-header svelte-1a1t040"><h3>Preview</h3> <div class="selection-controls svelte-1a1t040"><button class="text-btn svelte-1a1t040">Select All</button> <button class="text-btn svelte-1a1t040">Deselect All</button> <button class="primary small svelte-1a1t040"> </button></div></div> <div class="grid svelte-1a1t040"></div></div>'),FS=Ui('<div class="processor svelte-1a1t040"><div class="controls card"><h2>Settings</h2> <div class="control-group svelte-1a1t040"><label class="svelte-1a1t040">Rotation</label> <div class="button-group svelte-1a1t040"><button class="icon-btn svelte-1a1t040" title="Rotate Left"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 svelte-1a1t040"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"></path></svg> Left</button> <button class="icon-btn svelte-1a1t040" title="Rotate Right">Right <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 svelte-1a1t040"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"></path></svg></button> <span class="value svelte-1a1t040"> </span></div></div> <div class="control-group svelte-1a1t040"><label for="boost" class="svelte-1a1t040">Max Content Boost (HDR Intensity)</label> <div class="range-wrapper svelte-1a1t040"><input type="range" id="boost" min="1.0" max="10.0" step="0.1" class="svelte-1a1t040"/> <span class="value svelte-1a1t040"> </span></div> <p class="help-text svelte-1a1t040">Higher values create brighter highlights.</p></div> <div class="control-group svelte-1a1t040"><label for="quality" class="svelte-1a1t040">JPEG Quality</label> <div class="range-wrapper svelte-1a1t040"><input type="range" id="quality" min="0.1" max="1.0" step="0.05" class="svelte-1a1t040"/> <span class="value svelte-1a1t040"> </span></div></div> <div class="actions svelte-1a1t040"><button class="secondary svelte-1a1t040">Start Over</button></div></div> <!> <div><!> <!></div></div>');function US(n,e){Hl(e,!1);let t=Wp(e,"files",28,()=>[]),i=ti(4),r=ti(0),a=ti(.95),o=ti(!1),l=ti([]),f=ti(null),u,h=ti(new Set);Xp(()=>{p()});async function p(){gt(o,!0),gt(l,[]),gt(f,null),gt(h,new Set);try{for(let _e=0;_e<t().length;_e++){const Ze=t()[_e],k=await wS(Ze,{maxContentBoost:Ae(i),rotation:Ae(r),quality:Ae(a)}),Ye=URL.createObjectURL(k);gt(l,[...Ae(l),{originalName:Ze.name,url:Ye,size:k.size,index:_e}]),Ae(h).add(_e)}gt(h,Ae(h)),gt(h,Ae(h))}catch(_e){console.error("[UI] Error processing files:",_e),gt(f,_e.message)}finally{gt(o,!1)}}function m(){clearTimeout(u),u=setTimeout(()=>{p()},500)}function g(_e){gt(r,(Ae(r)+_e+360)%360),m()}function y(_e){Ae(h).has(_e)?Ae(h).delete(_e):Ae(h).add(_e),gt(h,Ae(h))}function R(){Ae(l).forEach((_e,Ze)=>Ae(h).add(Ze)),gt(h,Ae(h))}function S(){Ae(h).clear(),gt(h,Ae(h))}function x(_e){const Ze=document.createElement("a");Ze.href=_e.url,Ze.download=`ultrahdr-${_e.originalName.replace(/\.[^/.]+$/,"")}.jpg`,Ze.click()}function U(){Ae(l).forEach((_e,Ze)=>{Ae(h).has(Ze)&&x(_e)})}function I(){t([]),gt(l,[]),gt(r,0),gt(i,4),gt(a,.95),gt(h,new Set),B("reset")}const B=bu();yu();var C=FS(),E=Et(C),A=Nt(Et(E),2),O=Nt(Et(A),2),M=Et(O),v=Nt(M,2),F=Nt(v,2),L=Et(F),V=Nt(A,2),X=Nt(Et(V),2),Z=Et(X),$=Nt(Z,2),ne=Et($),Y=Nt(V,2),ue=Nt(Et(Y),2),he=Et(ue),Fe=Nt(he,2),Qe=Et(Fe),at=Nt(Y,2),ut=Et(at),ft=Nt(E,2);{var se=_e=>{var Ze=RS(),k=Nt(Et(Ze),2),Ye=Et(k);Sa(()=>ir(Ye,Ae(f))),ni(_e,Ze)};ba(ft,_e=>{Ae(f)&&_e(se)})}var le=Nt(ft,2);let Ee;var je=Et(le);{var Ne=_e=>{var Ze=CS();ni(_e,Ze)};ba(je,_e=>{Ae(o),Ae(l),mn(()=>Ae(o)&&Ae(l).length===0)&&_e(Ne)})}var nt=Nt(je,2);{var Ct=_e=>{var Ze=IS(),k=Et(Ze),Ye=Nt(Et(k),2),He=Et(Ye),st=Nt(He,2),Se=Nt(st,2),ht=Et(Se),Le=Nt(k,2);Fp(Le,5,()=>Ae(l),Lp,(We,D,T)=>{var j=LS();let ie;var ae=Et(j),Q=Et(ae);{var Oe=Be=>{var G=PS();ni(Be,G)},ve=Be=>{var G=DS();ni(Be,G)};ba(Q,Be=>{Ae(h),mn(()=>Ae(h).has(T))?Be(Oe):Be(ve,!1)})}var Ve=Nt(ae,2),Ue=Et(Ve),ce=Nt(Ve,2),re=Et(ce),Re=Et(re),Ie=Nt(re,2),Me=Et(Ie);Sa((Be,G)=>{ie=Yo(j,1,"result-card card svelte-1a1t040",null,ie,Be),zp(Ue,"src",(Ae(D),mn(()=>Ae(D).url))),ir(Re,(Ae(D),mn(()=>Ae(D).originalName))),ir(Me,`${G??""} MB`)},[()=>({selected:Ae(h).has(T)}),()=>(Ae(D),mn(()=>(Ae(D).size/1024/1024).toFixed(2)))]),vn("click",j,()=>y(T)),vn("keydown",j,Be=>Be.key==="Enter"&&y(T)),ni(We,j)}),Sa(()=>{Se.disabled=(Ae(h),mn(()=>Ae(h).size===0)),ir(ht,`Download Selected (${Ae(h),mn(()=>Ae(h).size)??""})`)}),vn("click",He,R),vn("click",st,S),vn("click",Se,U),ni(_e,Ze)};ba(nt,_e=>{Ae(l),mn(()=>Ae(l).length>0)&&_e(Ct)})}Sa((_e,Ze)=>{M.disabled=Ae(o),v.disabled=Ae(o),ir(L,`${Ae(r)??""}°`),Z.disabled=Ae(o),ir(ne,`${_e??""}x`),he.disabled=Ae(o),ir(Qe,`${Ze??""}%`),ut.disabled=Ae(o),Ee=Yo(le,1,"results-container svelte-1a1t040",null,Ee,{loading:Ae(o)})},[()=>(Ae(i),mn(()=>Ae(i).toFixed(1))),()=>(Ae(a),mn(()=>Math.round(Ae(a)*100)))]),vn("click",M,()=>g(-90)),vn("click",v,()=>g(90)),Uc(Z,()=>Ae(i),_e=>gt(i,_e)),vn("input",Z,m),Uc(he,()=>Ae(a),_e=>gt(a,_e)),vn("input",he,m),vn("click",ut,I),ni(n,C),Wl()}var NS=Ui('<div class="drop-container svelte-1n46o8q"><!></div>'),OS=Ui('<main><h1>UltraHDR Converter</h1> <p class="subtitle svelte-1n46o8q">Convert your images to UltraHDR with gain maps, entirely offline.</p> <!></main>');function BS(n){let e=ti([]);function t(f){gt(e,Array.from(f.detail))}function i(){gt(e,[])}var r=OS(),a=Nt(Et(r),4);{var o=f=>{var u=NS(),h=Et(u);Kp(h,{$$events:{files:t}}),ni(f,u)},l=f=>{US(f,{get files(){return Ae(e)},$$events:{reset:i}})};ba(a,f=>{Ae(e).length===0?f(o):f(l,!1)})}ni(n,r)}Rp(BS,{target:document.getElementById("app")});const kS=Object.freeze(Object.defineProperty({__proto__:null},Symbol.toStringTag,{value:"Module"}));
