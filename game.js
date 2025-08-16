/* Guardianes de Chillihuay - versión base jugable (PWA-ready)
   Uso: controles táctiles y teclado. */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayBtn = document.getElementById('overlayBtn');

// HUD and controls
const keys = { left:false, right:false, up:false };
let touch = { left:false, right:false, up:false };

// basic listeners
window.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft') keys.left=true;
  if(e.key==='ArrowRight') keys.right=true;
  if(e.key===' '|| e.key==='ArrowUp') keys.up=true;
});
window.addEventListener('keyup', e=>{
  if(e.key==='ArrowLeft') keys.left=false;
  if(e.key==='ArrowRight') keys.right=false;
  if(e.key===' '|| e.key==='ArrowUp') keys.up=false;
});

// touch buttons
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnJump = document.getElementById('btnJump');
[btnLeft, btnRight, btnJump].forEach(b=>{
  if(!b) return;
  b.addEventListener('touchstart', e=>{ e.preventDefault(); if(b.id==='btnLeft') touch.left=true; if(b.id==='btnRight') touch.right=true; if(b.id==='btnJump') touch.up=true; });
  b.addEventListener('touchend', e=>{ e.preventDefault(); if(b.id==='btnLeft') touch.left=false; if(b.id==='btnRight') touch.right=false; if(b.id==='btnJump') touch.up=false; });
  b.addEventListener('mousedown', e=>{ if(b.id==='btnLeft') touch.left=true; if(b.id==='btnRight') touch.right=true; if(b.id==='btnJump') touch.up=true; });
  b.addEventListener('mouseup', e=>{ if(b.id==='btnLeft') touch.left=false; if(b.id==='btnRight') touch.right=false; if(b.id==='btnJump') touch.up=false; });
});

// simple player and world
const W = canvas.width, H = canvas.height;
const TILE = 48;
let levelIndex = 0;

const levels = [
  { name:'Quebrada Chorunga', width: W*2, platforms: [{x:0,y:H-80,w:W*2,h:80},{x:300,y:H-180,w:160,h:20},{x:600,y:H-260,w:160,h:20}], glyphs:[{x:320,y:H-220},{x:620,y:H-300}] },
  { name:'Chillihuay 1', width: W*2.2, platforms: [{x:0,y:H-80,w:W*2.2,h:80},{x:200,y:H-160,w:120,h:20},{x:420,y:H-220,w:160,h:20}], glyphs:[{x:210,y:H-200},{x:430,y:H-260}] },
  { name:'Chillihuay 2', width: W*2.4, platforms: [{x:0,y:H-80,w:W*2.4,h:80},{x:260,y:H-140,w:160,h:20},{x:520,y:H-200,w:160,h:20}], glyphs:[{x:280,y:H-180},{x:540,y:H-240}] }
];

let player = { x:60, y:H-140, w:36, h:46, vx:0, vy:0 };
let camera = { x:0, y:0 };
let collectibles = [];
let collected = 0;
let lives = 3;
let paused = true;

// initialize
function initLevel(i){
  levelIndex = i;
  const L = levels[i];
  player.x = 60; player.y = H-140; player.vx=0; player.vy=0;
  collectibles = L.glyphs.map((g,idx)=> ({x:g.x,y:g.y,r:16,idx, taken:false}) );
  collected = 0;
}
initLevel(0);

// overlay start
overlay.classList.remove('hidden');
overlayBtn.onclick = ()=>{ overlay.classList.add('hidden'); paused=false; };

function update(){
  if(paused) return;
  const L = levels[levelIndex];
  // controls combined
  const left = keys.left || touch.left;
  const right = keys.right || touch.right;
  const up = keys.up || touch.up;
  const speed = 3.2;
  const GRAV = 0.6;
  if(left) player.vx = -speed;
  else if(right) player.vx = speed;
  else player.vx = 0;
  // jump simple
  if(up && Math.abs(player.vy) < 0.1){ player.vy = -12; }
  player.vy += GRAV;
  player.x += player.vx;
  player.y += player.vy;
  // floor collision
  if(player.y + player.h > H-80){ player.y = H-80-player.h; player.vy = 0; }
  // camera follow
  camera.x = Math.max(0, Math.min(L.width - W, player.x - W/2));
  // collectible collision
  collectibles.forEach(c=>{
    if(!c.taken){
      const dx = (player.x+player.w/2) - (c.x+8);
      const dy = (player.y+player.h/2) - (c.y+8);
      if(dx*dx + dy*dy < (c.r+18)*(c.r+18)){
        c.taken = true; collected++;
        // show educational popup (simple)
        showFact(`Has recogido un glifo del nivel ${L.name}. Explora el Museo Virtual para aprender más.`);
        if(collected === collectibles.length){
          // advance level after short delay
          setTimeout(()=>{ if(levelIndex < levels.length-1) initLevel(levelIndex+1); else showFact('¡Has completado la ruta de Chillihuay!'); }, 900);
        }
      }
    }
  });
}

function showFact(text){
  paused = true;
  overlay.querySelector('#overlayTitle').textContent = 'Dato cultural';
  overlay.querySelector('#overlayText').textContent = text;
  overlay.classList.remove('hidden');
  overlayBtn.textContent = 'Continuar';
  overlayBtn.onclick = ()=>{ overlay.classList.add('hidden'); paused=false; overlayBtn.textContent='Comenzar'; };
}

function draw(){
  const L = levels[levelIndex];
  // background
  ctx.fillStyle = '#05213a'; ctx.fillRect(0,0,W,H);
  // platforms
  ctx.fillStyle = '#2b3f6a';
  L.platforms.forEach(p=>{ ctx.fillRect(p.x - camera.x, p.y - camera.y, p.w, p.h); });
  // collectibles
  collectibles.forEach(c=>{ if(!c.taken){ ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(c.x - camera.x + c.r, c.y - camera.y + c.r, c.r, 0, Math.PI*2); ctx.fill(); } });
  // player
  ctx.fillStyle = '#70f0c9'; ctx.fillRect(player.x - camera.x, player.y - camera.y, player.w, player.h);
  // simple HUD
  ctx.fillStyle = '#e6ecff'; ctx.font='16px system-ui'; ctx.fillText(`${L.name}`, 12, 22);
  ctx.fillText(`Glifos: ${collected}/${collectibles.length}`, 12, 42);
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();
