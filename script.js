const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
menuButton?.addEventListener('click',()=>{
  const opened=nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded',String(opened));
  menuButton.textContent=opened?'×':'☰';
});
document.querySelectorAll('.main-nav a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded','false');
  if(menuButton) menuButton.textContent='☰';
}));
const topButton=document.querySelector('.back-top');
window.addEventListener('scroll',()=>topButton?.classList.toggle('show',window.scrollY>450),{passive:true});
topButton?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
document.querySelector('#year').textContent=new Date().getFullYear();
const sections=[...document.querySelectorAll('main section[id]')];
const navLinks=[...document.querySelectorAll('.main-nav a[href^="#"]')];
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));
    }
  }),{rootMargin:'-35% 0px -55% 0px'});
  sections.forEach(section=>observer.observe(section));
}