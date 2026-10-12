// Page logic. Each page sets <body data-page="..."> and renders into #app.
const A=$('#app'),qs=new URLSearchParams(location.search),P=document.body.dataset.page;
const sec=(t,l)=>`<section class="sec"><h2>${t}</h2><div class="grid">${l.map(card).join('')}</div></section>`;
const by=(k)=>[...PRODUCTS].sort((a,b)=>b[k]-a[k]).slice(0,4);
const rules={name:v=>v.trim().length>=2||'Enter your full name',email:v=>/^\S+@\S+\.\S+$/.test(v.trim())||'Enter a valid email address',
 phone:v=>/^[6-9]\d{9}$/.test(v)||'Enter a valid 10-digit mobile number',addr:v=>v.trim().length>=8||'Enter your full delivery address',
 city:v=>v.trim()?true:'Enter your city',state:v=>v.trim()?true:'Enter your state',pin:v=>/^\d{6}$/.test(v)||'Enter a 6-digit PIN code',
 pw:v=>/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v)||'Use 8+ characters with letters and numbers'};
function validate(map){let ok=true;for(const k in map){const r=map[k]($('#'+k).value);$('#e-'+k).textContent=r===true?'':r;if(r!==true)ok=false}return ok}
const fld=(id,l,t='text')=>`<div class="f"><label for="${id}">${l}</label><input id="${id}" type="${t}"><small class="err" id="e-${id}"></small></div>`;
const pw=(id,l)=>`<div class="f"><label for="${id}">${l}</label><input id="${id}" type="password" autocomplete="off"><label class="show"><input type="checkbox" data-show="${id}"> Show password</label><small class="err" id="e-${id}"></small></div>`;
const row=(a,b,c='')=>`<p class="${c}"><span>${a}</span><b>${b}</b></p>`;

function totals(){const c=getCart().map(i=>({...PRODUCTS.find(p=>p.id==i.id),qty:i.qty})).filter(i=>i.id);
 const sub=c.reduce((a,i)=>a+i.price*i.qty,0),save=c.reduce((a,i)=>a+(i.originalPrice-i.price)*i.qty,0),ship=sub&&sub<999?79:0;
 return{c,sub,save,ship,total:sub+ship}}
const summary=t=>`<div class="sum"><h2>Order summary</h2>${row('Price (MRP)',fmt(t.sub+t.save))}${row('Discount','−'+fmt(t.save))}${row('Delivery',t.ship?fmt(t.ship):'FREE')}${row('Total',fmt(t.total),'tot')}${t.sub&&t.sub<999?`<small>Add ${fmt(999-t.sub)} more for free delivery.</small>`:''}</div>`;

function home(){
 const cats=[...new Set(PRODUCTS.map(p=>p.category))],categoryImages={
 'Electronics':'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=85',
 'Fashion':'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85',
 'Home & Kitchen':'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85',
 'Beauty & Personal Care':'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85',
 'Accessories':'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=85',
 'Sports & Fitness':'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=85'
};
 A.innerHTML=`<section class="hero"><h1>Everything You Need, Just a Click Away.</h1><p>Up to 50% off on electronics, fashion and home essentials.</p><a class="btn" href="products.html">Shop now</a></section>
 <section class="sec"><h2>Shop by category</h2><div class="cats">${cats.map(c=>`<a href="products.html?cat=${encodeURIComponent(c)}"><img src="${categoryImages[c]}" alt="${c}" loading="lazy">${c}</a>`).join('')}</div></section>
 ${sec('Featured products',PRODUCTS.slice(0,4))}${sec('Best sellers',by('reviews'))}
 <section class="sec banner"><h2>Special offers</h2><p>Free delivery above ₹999 and deals up to 50% off.</p><a class="btn alt" href="products.html?sort=disc">See deals</a></section>
 ${sec('Trending now',by('rating'))}
 <section class="sec"><h2>What customers say</h2><div class="grid3"><blockquote>“Fast delivery and the headphones sound great.”<br><b>Anita R.</b></blockquote><blockquote>“Easy checkout and fair prices.”<br><b>Rahul M.</b></blockquote><blockquote>“The air fryer replaced half my kitchen.”<br><b>Priya S.</b></blockquote></div></section>
 <section class="sec"><h2>Get deals in your inbox</h2><form id="nl" class="inline" novalidate><input id="nle" type="email" placeholder="you@example.com" aria-label="Email address"><button class="btn">Subscribe</button></form><small class="err" id="e-nle"></small></section>`;
 $('#nl').onsubmit=e=>{e.preventDefault();const ok=validate({nle:rules.email});if(ok){toast('Subscribed! Thanks for joining.');e.target.reset()}};
}

function productsPage(){
 const cats=[...new Set(PRODUCTS.map(p=>p.category))];
 A.innerHTML=`<section class="sec"><h2>All products</h2><div class="filters"><input id="q" placeholder="Search by name or category" aria-label="Search"><select id="cat" aria-label="Category"><option value="">All categories</option>${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select><input id="min" type="number" min="0" placeholder="Min ₹" aria-label="Minimum price"><input id="max" type="number" min="0" placeholder="Max ₹" aria-label="Maximum price"><select id="sort" aria-label="Sort"><option value="">Sort by</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option><option value="rt">Top rated</option><option value="disc">Biggest discount</option></select></div><p id="cnt"></p><div class="grid" id="list"></div></section>`;
 $('#q').value=qs.get('q')||'';$('#cat').value=qs.get('cat')||'';$('#sort').value=qs.get('sort')||'';
 const run=()=>{const q=$('#q').value.toLowerCase().trim(),c=$('#cat').value,lo=+$('#min').value||0,hi=+$('#max').value||Infinity,s=$('#sort').value;
  const l=PRODUCTS.filter(p=>(!q||(p.name+' '+p.category).toLowerCase().includes(q))&&(!c||p.category===c)&&p.price>=lo&&p.price<=hi);
  const f={lo:(a,b)=>a.price-b.price,hi:(a,b)=>b.price-a.price,rt:(a,b)=>b.rating-a.rating,disc:(a,b)=>disc(b)-disc(a)}[s];if(f)l.sort(f);
  $('#cnt').textContent=l.length+' products';$('#list').innerHTML=l.length?l.map(card).join(''):'<p>No products match. Try clearing a filter.</p>'};
 $$('.filters input,.filters select').forEach(e=>e.addEventListener('input',run));run();
}

function details(){
 const p=PRODUCTS.find(x=>x.id==qs.get('id'));
 if(!p){A.innerHTML='<section class="sec"><h2>Product not found</h2><p>This product may have been removed.</p><a class="btn" href="products.html">Browse products</a></section>';return}
 document.title=p.name+' – SmartKart';
 A.innerHTML=`<nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Home</a> › <a href="products.html?cat=${encodeURIComponent(p.category)}">${esc(p.category)}</a> › ${esc(p.name)}</nav>
 <section class="sec detail"><img src="${p.image}" alt="${esc(p.name)}"><div><h1>${esc(p.name)}</h1><p class="rt">${stars(p)}</p><p class="price"><b>${fmt(p.price)}</b> <s>${fmt(p.originalPrice)}</s> <span class="off">${disc(p)}% off</span></p><p>${esc(p.description)} Sold by SmartKart with easy 7-day returns.</p>
 <table class="spec"><tr><td>Category</td><td>${esc(p.category)}</td></tr><tr><td>Brand</td><td>SmartKart Select</td></tr><tr><td>Warranty</td><td>1 year</td></tr><tr><td>Delivery</td><td>3–5 business days</td></tr></table>
 <p><b>${p.inStock?'In stock':'Out of stock'}</b></p><div class="f"><label for="qty">Quantity</label><input id="qty" type="number" min="1" max="10" value="1" style="width:90px"></div>
 <button class="btn" data-add="${p.id}" data-qty ${p.inStock?'':'disabled'}>Add to cart</button></div></section>
 ${sec('Related products',PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4))}`;
}

function cart(){
 const t=totals();
 if(!t.c.length){A.innerHTML='<section class="sec" style="text-align:center"><p class="ok"><img class="state-icon" src="https://api.iconify.design/lucide:shopping-cart.svg?color=%23c0182b" alt="" aria-hidden="true"></p><h2>Your cart is empty</h2><p>Add something you like and it will show up here.</p><a class="btn" href="products.html">Continue shopping</a></section>';return}
 A.innerHTML=`<section class="sec"><h2>Shopping cart</h2><div class="two"><div>${t.c.map(i=>`<div class="cartrow"><img src="${i.image}" alt="${esc(i.name)}"><div><b>${esc(i.name)}</b><br>${fmt(i.price)}<div class="qtyb"><button data-q="${i.id}:-1" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button data-q="${i.id}:1" aria-label="Increase quantity">+</button></div></div><div><b>${fmt(i.price*i.qty)}</b><br><button class="link" data-rm="${i.id}">Remove</button></div></div>`).join('')}<button class="link" id="clear">Clear cart</button></div>
 <div>${summary(t)}<p><a class="btn alt" href="products.html">Continue shopping</a> <a class="btn" href="checkout.html">Proceed to checkout</a></p></div></div></section>`;
}

function checkout(){
 const t=totals();if(!t.c.length){location.replace('cart.html');return}
 A.innerHTML=`<section class="sec"><h2>Checkout</h2><div class="two"><form id="co" novalidate>${fld('name','Full name')}${fld('email','Email','email')}${fld('phone','Mobile number','tel')}${fld('addr','Delivery address')}${fld('city','City')}${fld('state','State')}${fld('pin','PIN code')}
 <fieldset class="f"><legend>Payment method (demo)</legend><label class="show"><input type="radio" name="pay" value="Cash on Delivery" checked> Cash on Delivery</label><label class="show"><input type="radio" name="pay" value="UPI (demo)"> UPI (demo)</label><label class="show"><input type="radio" name="pay" value="Card (demo)"> Card (demo)</label></fieldset>
 <p class="note">Demo store: no real payment details are collected or stored.</p><button class="btn">Place order</button></form>${summary(t)}</div></section>`;
 $('#co').onsubmit=e=>{e.preventDefault();if(!validate(rules.__co||{name:rules.name,email:rules.email,phone:rules.phone,addr:rules.addr,city:rules.city,state:rules.state,pin:rules.pin}))return toast('Please fix the highlighted fields');
  const no='SK'+Date.now().toString(36).toUpperCase()+Math.floor(Math.random()*90+10);
  sessionStorage.setItem('sk_order',JSON.stringify({no,total:t.total,pay:$('input[name=pay]:checked').value,name:$('#name').value.trim(),addr:`${$('#addr').value.trim()}, ${$('#city').value.trim()}, ${$('#state').value.trim()} – ${$('#pin').value}`}));
  saveCart([]);location='success.html'};
}

function success(){
 const o=JSON.parse(sessionStorage.getItem('sk_order')||'null');
 if(!o){A.innerHTML='<section class="sec"><h2>No recent order</h2><a class="btn" href="products.html">View products</a></section>';return}
 A.innerHTML=`<section class="sec narrow" style="text-align:center"><p class="ok"><img class="state-icon" src="https://api.iconify.design/lucide:check-circle.svg?color=%232f855a" alt="" aria-hidden="true"></p><h2>Order placed successfully!</h2><p>Order number <b>${esc(o.no)}</b></p><p>Total paid: <b>${fmt(o.total)}</b> (${esc(o.pay)})</p><p>Delivering to ${esc(o.name)}, ${esc(o.addr)}</p><a class="btn" href="index.html">Continue shopping</a> <a class="btn alt" href="products.html">View products</a></section>`;
}

const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
function login(){
 const u=JSON.parse(localStorage.getItem('sk_user')||'null');
 A.innerHTML=`<section class="sec narrow"><h2>My account</h2><p class="note">Demo only: sign-in is simulated in your browser and is not real account security.</p>${u?`<p>Signed in as <b>${esc(u.name)}</b> (${esc(u.email)})</p><button class="btn alt" id="out">Log out</button>`:
 `<div class="tabs"><button class="btn" id="tl">Login</button><button class="btn alt" id="tr">Register</button></div><form id="lf" novalidate>${fld('lem','Email','email')}${pw('lpw','Password')}<button class="btn">Login</button></form><form id="rf" novalidate hidden>${fld('rname','Full name')}${fld('rem','Email','email')}${pw('rpw','Password')}<button class="btn">Create account</button></form>`}</section>`;
 if(u){$('#out').onclick=()=>{localStorage.removeItem('sk_user');location.reload()};return}
 const users=()=>JSON.parse(localStorage.getItem('sk_users')||'{}');
 $('#tl').onclick=()=>{$('#lf').hidden=false;$('#rf').hidden=true};$('#tr').onclick=()=>{$('#lf').hidden=true;$('#rf').hidden=false};
 $('#rf').onsubmit=async e=>{e.preventDefault();if(!validate({rname:rules.name,rem:rules.email,rpw:rules.pw}))return;
  const us=users(),k=$('#rem').value.trim().toLowerCase();if(us[k])return toast('An account with this email already exists');
  us[k]={name:$('#rname').value.trim(),h:await sha($('#rpw').value)};localStorage.setItem('sk_users',JSON.stringify(us));toast('Account created. Please log in.');$('#tl').click()};
 $('#lf').onsubmit=async e=>{e.preventDefault();if(!validate({lem:rules.email,lpw:v=>v?true:'Enter your password'}))return;
  const k=$('#lem').value.trim().toLowerCase(),a=users()[k];if(!a||a.h!==await sha($('#lpw').value))return toast('Email or password is incorrect');
  localStorage.setItem('sk_user',JSON.stringify({name:a.name,email:k}));toast('Welcome back, '+a.name.split(' ')[0]+'!');setTimeout(()=>location='index.html',900)};
}

// Global click/change handlers (event delegation)
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-add],[data-q],[data-rm],#clear');if(!t)return;
 if(t.dataset.add){const q=t.hasAttribute('data-qty')?Math.max(1,Math.min(10,+$('#qty').value||1)):1;addToCart(t.dataset.add,q)}
 else if(t.dataset.q){const[id,d]=t.dataset.q.split(':'),c=getCart(),i=c.find(x=>x.id==id);i.qty=Math.max(1,Math.min(10,i.qty+ +d));saveCart(c);cart()}
 else if(t.dataset.rm){saveCart(getCart().filter(x=>x.id!=t.dataset.rm));cart()}
 else if(t.id==='clear'){saveCart([]);cart()}
});
document.addEventListener('change',e=>{if(e.target.dataset.show)$('#'+e.target.dataset.show).type=e.target.checked?'text':'password'});
chrome();({home,products:productsPage,details,cart,checkout,success,login})[P]();
