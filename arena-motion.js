/* Decorative only. No tournament state, timers or navigation are changed. */
(function(){
  const background=document.querySelector('.broadcast-background');
  if(!background||document.body.classList.contains('export-mode')||new URLSearchParams(location.search).get('export')==='invite')return;
  const layer=document.createElement('div');layer.className='outer-particles';layer.setAttribute('aria-hidden','true');
  for(let i=0;i<18;i++){
    const mote=document.createElement('img');mote.src='assets/draw-ref/particle.webp';mote.alt='';mote.className='outer-particle';mote.draggable=false;
    mote.style.setProperty('--x',(3+(i*31)%94)+'%');mote.style.setProperty('--y',(8+(i*23)%84)+'%');
    mote.style.setProperty('--size',(i%3===0?18:9)+'px');mote.style.setProperty('--alpha',i%3===0?'.45':'.25');
    mote.style.setProperty('--duration',(12+i%7)+'s');mote.style.setProperty('--delay',(-i*1.13)+'s');layer.append(mote);
  }
  background.append(layer);
  const pause=()=>document.body.classList.toggle('arena-paused',document.hidden);
  document.addEventListener('visibilitychange',pause);pause();
})();
