// Shared helpers: cart storage, toast, header/footer, product card
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const disc=p=>Math.round((1-p.price/p.originalPrice)*100);
const stars=p=>{const r=Math.round(p.rating);return '★'.repeat(r)+'☆'.repeat(5-r)+` ${p.rating} (${p.reviews})`};
const getCart=()=>{try{return JSON.parse(localStorage.getItem('sk_cart'))||[]}catch{return[]}};
const saveCart=c=>{localStorage.setItem('sk_cart',JSON.stringify(c));updateCount()};
function updateCount(){const n=getCart().reduce((a,i)=>a+i.qty,0);$$('.cart-count').forEach(e=>e.textContent=n)}
function addToCart(id,qty=1){const p=PRODUCTS.find(x=>x.id==id);if(!p||!p.inStock)return toast('Sorry, this item is out of stock');
 const c=getCart(),i=c.find(x=>x.id==id);i?i.qty=Math.min(10,i.qty+qty):c.push({id:+id,qty});saveCart(c);toast(p.name+' added to cart')}
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.append(t)}
 t.textContent=m;t.className='show';clearTimeout(t._t);t._t=setTimeout(()=>t.className='',2400)}
// If a remote product photo fails, try a neutral real photograph once.
const fallback='https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80';
document.addEventListener('error',e=>{const t=e.target;if(t.tagName==='IMG'&&!t.dataset.f){t.dataset.f='1';t.src=fallback}},true);
function card(p){return `<article class="card"><a href="product-details.html?id=${p.id}"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"></a><h3>${esc(p.name)}</h3><p class="rt">${stars(p)}</p><p class="price"><b>${fmt(p.price)}</b> <s>${fmt(p.originalPrice)}</s> <span class="off">${disc(p)}% off</span></p><p class="st">${p.inStock?'In stock':'Out of stock'}</p><div class="row"><a class="btn alt" href="product-details.html?id=${p.id}">View details</a><button class="btn" data-add="${p.id}" ${p.inStock?'':'disabled'}>Add to cart</button></div></article>`}
function chrome(){
 const u=JSON.parse(localStorage.getItem('sk_user')||'null');
 $('#hdr').innerHTML=`<div class="ann">Free delivery on orders above ₹999</div><header class="top"><a class="logo" href="index.html">Smart<span>Kart</span></a><form id="sf" role="search"><input name="q" placeholder="Search products or categories" aria-label="Search products"><button aria-label="Search"><img class="ui-icon" src="https://api.iconify.design/lucide:search.svg?color=%23ffffff" alt="" aria-hidden="true"></button></form><button id="mb" aria-label="Open menu" aria-expanded="false">☰</button><nav id="nav" aria-label="Main"><a href="index.html">Home</a><a href="products.html?cat=Electronics">Electronics</a><a href="products.html?cat=Fashion">Fashion</a><a href="products.html?cat=Home%20%26%20Kitchen">Home &amp; Kitchen</a><a href="products.html?cat=Accessories">Accessories</a><a href="products.html?sort=disc">Deals</a><a href="login.html">${u?'Hi, '+esc(u.name.split(' ')[0]):'Login'}</a><a href="cart.html" aria-label="Cart"><img class="ui-icon" src="https://api.iconify.design/lucide:shopping-cart.svg?color=%23ffffff" alt="" aria-hidden="true"> <b class="cart-count">0</b></a></nav></header>`;
 $('#ftr').innerHTML=`<footer><div class="fg"><div><h4>SmartKart</h4><p>Everything You Need, Just a Click Away.</p></div><div><h4>Useful links</h4><a href="products.html">All products</a><a href="cart.html">Cart</a><a href="login.html">My account</a></div><div><h4>Contact</h4><p>help@smartkart.example<br>+91 98765 43210</p></div><div><h4>Follow us</h4><a href="https://facebook.com" target="_blank" rel="noopener">Facebook</a><a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a><a href="https://x.com" target="_blank" rel="noopener">X</a></div></div></footer>`;
 $('#sf').onsubmit=e=>{e.preventDefault();location='products.html?q='+encodeURIComponent(e.target.q.value.trim())};
 $('#mb').onclick=e=>{const o=$('#nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
 updateCount();
}
