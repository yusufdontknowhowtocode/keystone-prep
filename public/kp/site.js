(function(){
'use strict';
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var DATA=JSON.parse($('#site-data').textContent),R=DATA.rates,A=DATA.assistant;
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* Code 128 set B: a barcode that really encodes the visible code */
var C128='212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232'.split(' ');
function drawBars(svg,text){
  var codes=[104],sum=104,i;
  for(i=0;i<text.length;i++){var v=text.charCodeAt(i)-32;if(v<0||v>94)v=0;codes.push(v);sum+=v*(i+1)}
  codes.push(sum%103);
  var pat=codes.map(function(c){return C128[c]}).join('')+'2331112';
  var x=10,rects='',bar=true;
  for(i=0;i<pat.length;i++){var w=+pat[i];if(bar)rects+='<rect x="'+x+'" y="0" width="'+w+'" height="60"/>';x+=w;bar=!bar}
  svg.setAttribute('viewBox','0 0 '+(x+10)+' 60');
  svg.innerHTML='<g fill="#101114">'+rects+'</g>';
}
/* the manufacturer's sample barcode on the carton */
(function(){var svg=$('#upc-bars'),x=0,r='',seq='3211231114123211311211231311123213113211';
  for(var i=0;i<seq.length;i++){var w=+seq[i]*1.0;if(i%2==0)r+='<rect x="'+x+'" y="0" width="'+w+'" height="40"/>';x+=w}
  svg.setAttribute('viewBox','0 0 '+x+' 40');svg.innerHTML='<g fill="#111">'+r+'</g>';})();

/* state */
var S={mode:'fba',units:500,orders:200,items:1,adds:{},brand:''};
var money=function(n){return '$'+Math.round(n).toLocaleString('en-US')},cents=function(n){return '$'+n.toFixed(2)};
function fbaRate(u){return +(u<=1000?R.fba_to_1000:u<=5000?R.fba_to_5000:R.fba_over_5000)}
function calc(){
  if(S.mode==='fba'){
    var base=fbaRate(S.units),add=0;for(var k in S.adds)if(S.adds[k])add+=+R[k];
    var rate=base+add,month=S.units*rate,free=Math.min(S.units,+R.free_units)*base;
    return {rate:rate,month:month,first:Math.max(month-free,0),vol:S.units};
  }
  var custom=S.orders>=1000,tier=S.orders>=500;
  var first=+(tier?R.dtc_500_first:R.dtc_first),extra=+(tier?R.dtc_500_extra:R.dtc_extra),per=first+(S.items-1)*extra;
  return {rate:per,month:S.orders*per,custom:custom,vol:S.orders};
}
function render(){
  var c=calc(),fba=S.mode==='fba',vol=$('#vol');
  $('#vol-out').textContent=c.vol.toLocaleString('en-US');
  vol.style.setProperty('--p',((+vol.value-vol.min)/(vol.max-vol.min)*100)+'%');
  $('#l-rate').textContent=cents(c.rate);
  $('#l-per').textContent=fba?'per unit, all-in':(c.custom?'or better, custom quote':'per order');
  $('#l-vol-n').textContent=fba?'Units / month':'Orders / month';
  $('#l-vol').textContent=c.vol.toLocaleString('en-US');
  $('#l-month').textContent=money(c.month);
  $('#l-first-row').style.display=fba?'':'none';
  if(fba)$('#l-first').textContent=money(c.first);
  $('#l-note').textContent=fba?'Up to 100 units on us. Estimate only, before postage.':(c.custom?'1,000+ orders a month get a custom quote, at or below this estimate. Before postage.':'Estimate only, before postage. Postage is billed at cost.');
  var brand=S.brand.trim();
  $('#l-brand').textContent=brand||'Your brand';
  var code=(brand?brand.toUpperCase().replace(/[^A-Z0-9]+/g,'').slice(0,8)+'-':'KP-')+c.vol+(fba?'U':'O')+'-'+Math.round(c.rate*100);
  $('#code').textContent=code;
  drawBars($('#bars'),code);
  $('#rate-sum').textContent=summary(c);
  $('#f-brand').textContent=fba?'Amazon store / brand':'Brand name';
  $('#f-when').textContent=fba?'When would you send a first shipment?':'When would you send your first inventory?';
  $('#f-plat').hidden=fba;
  $('#f-plat select').required=!fba;
}
function summary(c){
  c=c||calc();
  if(S.mode==='fba'){
    var names=[];if(S.adds.poly)names.push('polybag');if(S.adds.bubble)names.push('bubble wrap');if(S.adds.bundle)names.push('bundling');
    return 'Your label: '+c.vol.toLocaleString('en-US')+' units a month at '+cents(c.rate)+'/unit'+(names.length?' with '+names.join(', '):'')+', about '+money(c.month)+'.';
  }
  return 'Your label: '+c.vol.toLocaleString('en-US')+' orders a month, '+S.items+' item'+(S.items>1?'s':'')+' an order, at '+cents(c.rate)+', about '+money(c.month)+' before postage.';
}
function printLabel(){if(reduce)return;var p=$('#print');p.classList.remove('printing');void p.offsetWidth;p.classList.add('printing')}

/* controls */
$$('.press-tabs button').forEach(function(b){b.addEventListener('click',function(){
  S.mode=b.dataset.mode;
  $$('.press-tabs button').forEach(function(o){var on=o===b;o.classList.toggle('k-on',on);o.setAttribute('aria-pressed',on)});
  var fba=S.mode==='fba',v=$('#vol');
  $('#vol-name').textContent=fba?'Units per month':'Orders per month';
  v.min=fba?100:50;v.max=fba?10000:2000;v.step=fba?100:50;v.value=fba?S.units:S.orders;
  $('#adds').hidden=!fba;$('#adds').style.display=fba?'':'none';$('#items').hidden=fba;
  $('#carton').classList.toggle('dtc',!fba);
  if(!stuck)$('#marker').textContent=fba?'Drag the label over the barcode':'Drag the label onto the box';
  else $('#marker').textContent=fba?'Barcode covered. Ready for Amazon.':'Labeled. In by 2 PM ET, out today.';
  render();printLabel();
})});
$('#vol').addEventListener('input',function(e){if(S.mode==='fba')S.units=+e.target.value;else S.orders=+e.target.value;render()});
$$('[data-add]').forEach(function(c){c.addEventListener('change',function(){S.adds[c.dataset.add]=c.checked;render();printLabel()})});
$('#it-minus').addEventListener('click',function(){S.items=Math.max(1,S.items-1);$('#it-out').textContent=S.items;render()});
$('#it-plus').addEventListener('click',function(){S.items=Math.min(12,S.items+1);$('#it-out').textContent=S.items;render()});
$('#brand').addEventListener('input',function(e){S.brand=e.target.value;var f=$('#f-brand-in');if(!f.dataset.own)f.value=S.brand;render()});
$('#f-brand-in').addEventListener('input',function(e){e.target.dataset.own='1'});

/* the label: drag it over the manufacturer barcode */
var label=$('#label'),carton=$('#carton'),stuck=false,drag=null,home={x:0,y:0};
function setPos(x,y,r){label.style.setProperty('--x',x+'px');label.style.setProperty('--y',y+'px');label.style.setProperty('--r',r+'deg')}
function park(){
  var cs=getComputedStyle(carton),W=carton.clientWidth,H=carton.clientHeight;
  var tl=parseFloat(cs.getPropertyValue('--tl')),sx=parseFloat(cs.getPropertyValue('--sx')),tt=parseFloat(cs.getPropertyValue('--tt')),sy=parseFloat(cs.getPropertyValue('--sy'));
  home.x=(sx-tl)/100*W;home.y=(sy-tt)/100*H;
  if(!stuck)setPos(home.x,home.y,4);
}
function stick(){
  stuck=true;setPos(0,0,-.6);label.classList.add('stuck');carton.classList.add('k-done');
  $('#marker').textContent=S.mode==='fba'?'Barcode covered. Ready for Amazon.':'Labeled. In by 2 PM ET, out today.';
  $('#stick').classList.add('k-hidden');$('#quote').classList.remove('k-hidden');$('#peel').classList.remove('k-hidden');
}
function peel(){
  stuck=false;label.classList.remove('stuck');carton.classList.remove('k-done');
  $('#marker').textContent=S.mode==='fba'?'Drag the label over the barcode':'Drag the label onto the box';
  $('#stick').classList.remove('k-hidden');$('#quote').classList.add('k-hidden');$('#peel').classList.add('k-hidden');park();
}
$('#stick').addEventListener('click',stick);
$('#peel').addEventListener('click',peel);
label.addEventListener('pointerdown',function(e){
  if(stuck)return;
  drag={px:e.clientX,py:e.clientY,x:parseFloat(label.style.getPropertyValue('--x'))||0,y:parseFloat(label.style.getPropertyValue('--y'))||0};
  label.setPointerCapture(e.pointerId);label.classList.add('lift');e.preventDefault();
});
label.addEventListener('pointermove',function(e){
  if(!drag)return;
  var x=drag.x+e.clientX-drag.px,y=drag.y+e.clientY-drag.py;
  var ld=label.offsetWidth,ldh=label.offsetHeight,W=carton.clientWidth,H=carton.clientHeight,l0=label.offsetLeft,t0=label.offsetTop;
  x=Math.max(-l0-20,Math.min(W-l0-ld+20,x));y=Math.max(-t0-20,Math.min(H-t0-ldh+20,y));
  setPos(x,y,1.5);
});
function drop(){
  if(!drag)return;drag=null;label.classList.remove('lift');
  var a=label.getBoundingClientRect(),t=(S.mode==='fba'?$('#upc'):$('#spot')).getBoundingClientRect();
  var ox=Math.max(0,Math.min(a.right,t.right)-Math.max(a.left,t.left)),oy=Math.max(0,Math.min(a.bottom,t.bottom)-Math.max(a.top,t.top));
  if(ox*oy>t.width*t.height*.45)stick();else setPos(home.x,home.y,4);
}
label.addEventListener('pointerup',drop);label.addEventListener('pointercancel',drop);
addEventListener('resize',function(){if(!stuck)park()});
park();render();printLabel();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(park);

/* the bar */
var bar=$('#bar');function onS(){bar.classList.toggle('solid',scrollY>30);document.documentElement.classList.toggle('at-top',scrollY<innerHeight*.9)}addEventListener('scroll',onS,{passive:true});onS();

/* the 2 PM cutoff, in Lansdale time */
(function(){
  try{
    var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'2-digit',hour12:true}).formatToParts(new Date()),o={};
    p.forEach(function(x){o[x.type]=x.value});
    var h=(+o.hour%12)+(o.dayPeriod==='PM'?12:0),wk=['Mon','Tue','Wed','Thu','Fri'].indexOf(o.weekday)>=0;
    var now=o.hour+':'+o.minute+' '+o.dayPeriod;
    var next={Mon:'Tuesday',Tue:'Wednesday',Wed:'Thursday',Thu:'Friday',Fri:'Monday',Sat:'Monday',Sun:'Monday'}[o.weekday];
    $('#cutoff').textContent=(wk&&h<14)?'It is '+now+' in Lansdale. Shopify orders in by 2 PM ET ship today.':'It is '+now+' in Lansdale. Shopify orders in by 2 PM ET on '+next+' ship that day.';
  }catch(e){}
})();

/* quote form: prefilled email to Keystone */
$('#form').addEventListener('submit',function(e){
  e.preventDefault();
  var f=e.target,err=$('#f-err'),ok=$('#f-ok');err.hidden=true;ok.hidden=true;
  var bad=Array.prototype.find.call(f.elements,function(x){return x.required&&!x.value.trim()});
  if(bad){err.textContent='One more: '+(bad.closest('label').textContent.split('*')[0].split('Select')[0].trim())+'.';err.hidden=false;bad.focus();return}
  if(!/.+@.+\..+/.test(f.email.value)){err.textContent='That email address looks incomplete.';err.hidden=false;f.email.focus();return}
  var c=calc(),lines=[summary(c),'',
    'Name: '+f.name.value,'Email: '+f.email.value,'Brand: '+f.brand.value,'Phone: '+f.phone.value,
    'Product type: '+f.product.value,'Inventory right now: '+f.status.value,'First shipment: '+f.when.value,'Prep or fulfillment today: '+f.now.value];
  if(S.mode==='dtc')lines.push('Platform: '+f.platform.value);
  if(f.notes.value.trim())lines.push('','Notes: '+f.notes.value.trim());
  var subj=(S.mode==='fba'?'Amazon FBA prep':'DTC fulfillment')+' quote'+(f.brand.value?' for '+f.brand.value:'');
  var mailto='mailto:hello@keystoneprepcenter.com?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(lines.join('\n'));
  var btn=f.querySelector('.k-go'),label=btn.textContent;btn.disabled=true;btn.textContent='Sending...';
  var data={mode:S.mode,vol:c.vol,items:S.items,adds:S.adds,rate:c.rate,month:c.month,summary:summary(c),
    name:f.name.value.trim(),email:f.email.value.trim(),brand:f.brand.value.trim(),phone:f.phone.value.trim(),
    product:f.product.value,status:f.status.value,when:f.when.value,now:f.now.value,
    platform:S.mode==='dtc'?f.platform.value:'',notes:f.notes.value.trim()};
  var send=typeof window.KP_SUBMIT==='function'?window.KP_SUBMIT(data):Promise.reject(new Error('no handler'));
  send.then(function(){
    ok.innerHTML='Got it. Your exact quote is on its way, usually within one business day. Want it faster? Text <a href="sms:+12675171112">267-517-1112</a>.';ok.hidden=false;f.reset();
  },function(){
    location.href=mailto;
    ok.innerHTML='Your email is open with all of this filled in, ready to send. Prefer to text? <a href="sms:+12675171112">267-517-1112</a>.';ok.hidden=false;
  }).then(function(){btn.disabled=false;btn.textContent=label});
});

/* Ask Keystone */
var RULES=[
 [/shopify|dtc|tiktok|order|pick|pack|woo|etsy/i,'shopify'],
 [/cutoff|hour|open|when|time|turnaround|fast|how long|speed/i,'hours'],
 [/where|address|locat|visit|tour|walk ?through|lansdale|pennsylvania/i,'address'],
 [/stor|pallet|return|racks?/i,'storage'],
 [/contain|freight|trailer|dock|ltl|ftl|truck|customs|forward|53/i,'freight'],
 [/remov|reimburs|liquidat|sellable/i,'removals'],
 [/hazmat|declin|accept|meltable|fragile|apparel|clothing|food|qualif/i,'decline'],
 [/portal|photo|approve|track|visib|login|demo/i,'portal'],
 [/start|send|sign|setup|set up|begin|contract|minimum|first/i,'start'],
 [/rate|price|cost|fee|how much|\$|per unit|label|fnsku|poly|bubble|bundl|kit/i,'rates']
];
var log=$('#ask-log'),CHIPS=[['What are your FBA rates?','rates'],['Shopify pricing?','shopify'],['Can you take a container?','freight'],['What do you decline?','decline'],['How do I start?','start']];
function say(t,me){var p=document.createElement('p');p.textContent=t;if(me)p.className='me';log.appendChild(p);log.scrollTop=log.scrollHeight}
function hand(q){
  var m=q?('Hi Keystone Prep, '+q):'Hi Keystone Prep';
  $('#h-sms').href='sms:+12675171112?&body='+encodeURIComponent(m);
  $('#h-wa').href='https://wa.me/12675171112?text='+encodeURIComponent(m);
  $('#h-mail').href='mailto:hello@keystoneprepcenter.com?subject='+encodeURIComponent('Question for Keystone Prep')+'&body='+encodeURIComponent(m);
}
function ask(q){
  say(q,true);hand(q);
  var key=null;for(var i=0;i<RULES.length;i++)if(RULES[i][0].test(q)){key=RULES[i][1];break}
  say(key?A[key]:'That one is best for the owner, who answers texts directly. Your question is ready to send with the links below.');
}
CHIPS.forEach(function(c){var b=document.createElement('button');b.type='button';b.textContent=c[0];b.addEventListener('click',function(){say(c[0],true);hand(c[0]);say(A[c[1]])});$('#ask-chips').appendChild(b)});
var askBox=$('#ask'),askBtn=$('#ask-btn'),greeted=false;
function setAsk(on){askBox.hidden=!on;askBtn.setAttribute('aria-expanded',on);document.documentElement.classList.toggle('ask-on',on);
  if(on&&!greeted){greeted=true;say('Ask about rates, freight, cutoffs or what we take. For anything else, the owner answers texts.')}
  if(on&&innerWidth>700)$('#ask-in').focus()}
askBtn.addEventListener('click',function(){setAsk(askBox.hidden)});
$('#ask-x').addEventListener('click',function(){setAsk(false);askBtn.focus()});
addEventListener('keydown',function(e){if(e.key==='Escape'&&!askBox.hidden){setAsk(false);askBtn.focus()}});
$('#ask-form').addEventListener('submit',function(e){e.preventDefault();var i=$('#ask-in'),q=i.value.trim();if(!q)return;i.value='';ask(q)});
})();
