(function(){
  const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const {players,nations}=window.homeCupPublicData;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const artworkDialog=document.getElementById('public-media-dialog');
  const artworkImage=document.getElementById('public-media-image');
  const artworkStatus=document.getElementById('public-media-status');
  const artworkDownload=document.getElementById('public-media-download');
  let artworkTrigger=null,backdropPress=false;
  function openArtwork({title,src,filename,label},trigger){
    artworkTrigger=trigger;backdropPress=false;
    document.getElementById('public-media-title').textContent=title;
    artworkImage.hidden=true;artworkImage.alt=title;
    artworkStatus.hidden=false;artworkStatus.textContent='Đang tải ảnh…';
    artworkImage.src=src;
    artworkDownload.href=src;artworkDownload.download=filename;
    artworkDownload.firstChild.textContent=label+' ';
    document.getElementById('public-media-original').href=src;
    artworkDialog.showModal();document.body.classList.add('public-media-open');
  }
  artworkImage.addEventListener('load',()=>{artworkImage.hidden=false;artworkStatus.hidden=true;});
  artworkImage.addEventListener('error',()=>{artworkStatus.textContent='Không tải được ảnh. Hãy đóng và mở lại.';});
  artworkDialog.querySelector('.public-media-close').addEventListener('click',()=>artworkDialog.close());
  const outsideArtwork=event=>{const r=artworkDialog.getBoundingClientRect();return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;};
  artworkDialog.addEventListener('pointerdown',event=>{backdropPress=event.target===artworkDialog&&outsideArtwork(event);});
  artworkDialog.addEventListener('click',event=>{if(backdropPress&&event.target===artworkDialog&&outsideArtwork(event))artworkDialog.close();backdropPress=false;});
  artworkDialog.addEventListener('close',()=>{
    document.body.classList.remove('public-media-open');
    artworkTrigger?.focus({preventScroll:true});artworkTrigger=null;
  });
  document.getElementById('public-poster-preview').addEventListener('click',event=>openArtwork({title:'Poster PES HOME CUP · Mùa 01',src:'assets/poster-v2.png',filename:'pes-home-cup-poster.png',label:'TẢI POSTER'},event.currentTarget));
  document.getElementById('hero-player-names').replaceChildren(...players.map(player=>{
    const name=element('span','hero-name',player.name);name.dataset.player=player.id;return name;
  }));
  // Project live event text onto the four inner corners of the photographed LED face.
  const heroBoard=document.querySelector('.hero-details');
  const heroPlane=heroBoard.querySelector('.hero-info-plane');
  const portraitHero=matchMedia('(max-width:760px) and (orientation:portrait)');
  function alignHeroBoard(){
    if(!portraitHero.matches){heroPlane.style.removeProperty('--hero-plane-projection');return;}
    const width=heroBoard.clientWidth,height=heroBoard.clientHeight;
    const planeWidth=heroPlane.offsetWidth,planeHeight=heroPlane.offsetHeight;
    if(!width||!height||!planeWidth||!planeHeight)return;
    // These normalized corners belong to mobile-sideline-led-v2.webp.
    const corners=[[.095,.295],[.934,.385],[.972,.661],[.025,.698]].map(([x,y])=>[x*width,y*height]);
    const [p0,p1,p2,p3]=corners;
    const dx1=p1[0]-p2[0],dx2=p3[0]-p2[0],dx3=p0[0]-p1[0]+p2[0]-p3[0];
    const dy1=p1[1]-p2[1],dy2=p3[1]-p2[1],dy3=p0[1]-p1[1]+p2[1]-p3[1];
    const determinant=dx1*dy2-dx2*dy1;
    if(Math.abs(determinant)<.001)return;
    const g=(dx3*dy2-dx2*dy3)/determinant,h=(dx1*dy3-dx3*dy1)/determinant;
    const a=p1[0]-p0[0]+g*p1[0],b=p3[0]-p0[0]+h*p3[0];
    const d=p1[1]-p0[1]+g*p1[1],e=p3[1]-p0[1]+h*p3[1];
    const matrix=[a/planeWidth,d/planeWidth,0,g/planeWidth,b/planeHeight,e/planeHeight,0,h/planeHeight,0,0,1,0,p0[0],p0[1],0,1];
    heroPlane.style.setProperty('--hero-plane-projection','matrix3d('+matrix.join(',')+')');
  }
  new ResizeObserver(alignHeroBoard).observe(heroBoard);
  portraitHero.addEventListener('change',alignHeroBoard);
  alignHeroBoard();
  document.getElementById('public-player-grid').replaceChildren(...players.map((player,i)=>{
    const card=element('article','public-player-card'),image=element('img');image.src=player.src;image.alt=player.name;image.dataset.player=player.id;image.loading='lazy';image.width=300;image.height=340;
    const copy=element('div'),hint=element('span','public-invite-hint','Thư mời ↗'),invite=element('button','player-invite-trigger');
    invite.type='button';invite.setAttribute('aria-label','Xem thư mời của '+player.name);invite.setAttribute('aria-haspopup','dialog');invite.setAttribute('aria-controls','public-media-dialog');invite.dataset.player=player.id;
    invite.addEventListener('click',event=>openArtwork({title:'Thư mời · '+player.name,src:'exports/invitation-'+player.id+'-v3.png',filename:'pes-home-cup-thu-moi-'+player.id+'.png',label:'TẢI THƯ MỜI'},event.currentTarget));
    copy.append(element('strong',null,player.name),hint);card.append(element('small',null,'TUYỂN THỦ '+String(i+1).padStart(2,'0')),image,copy,invite);return card;
  }));
  document.getElementById('public-nations').replaceChildren(...nations.map(nation=>{const item=element('div','public-nation'),flag=element('img');flag.src=nation.flag;flag.alt='';item.append(flag,element('span',null,nation.name));return item;}));
  const revealAnimations=[];
  // One entrance per visit: the light reaches each marker before its content arrives.
  const journey=document.querySelector('.agenda-journey');
  const stops=[...journey.querySelectorAll('.journey-stop')];
  const journeyAnimations=[];
  const compactAgenda=matchMedia('(max-width:1100px)');
  function animateStop(stop,delay=0){
    if(media.matches){stop.querySelectorAll('.agenda-node,.agenda-symbol,.agenda-copy').forEach(el=>el.style.removeProperty('opacity'));return;}
    for(const [i,el]of [stop.querySelector('.agenda-node'),stop.querySelector('.agenda-symbol'),stop.querySelector('.agenda-copy')].entries()){
      const animation=el.animate([{opacity:0,transform:i===0?'scale(.3)':'translateY(16px)'},{opacity:1,transform:'none'}],{duration:i===0?450:800,delay:delay+i*110,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
      journeyAnimations.push(animation);
    }
  }
  if(!media.matches&&'IntersectionObserver'in window){
    if(compactAgenda.matches){
      const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){animateStop(entry.target);observer.unobserve(entry.target);}},{threshold:.3});
      stops.forEach(stop=>{stop.querySelectorAll('.agenda-node,.agenda-symbol,.agenda-copy').forEach(el=>{el.style.opacity='0';});observer.observe(stop);});
    }else{
      const track=journey.querySelector('.agenda-track');
      track.style.clipPath='inset(0 100% 0 0)';
      stops.forEach(stop=>stop.querySelectorAll('.agenda-node,.agenda-symbol,.agenda-copy').forEach(el=>el.style.opacity='0'));
      const observer=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;
        observer.disconnect();
        journeyAnimations.push(track.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],{duration:3300,easing:'linear',fill:'both'}));
        stops.forEach((stop,i)=>animateStop(stop,180+i*460));
      },{threshold:.35});observer.observe(journey);
    }
  }
  function finishJourney(){journeyAnimations.forEach(a=>a.cancel());journey.querySelectorAll('[style]').forEach(el=>{el.style.removeProperty('opacity');el.style.removeProperty('clip-path');});}
  compactAgenda.addEventListener('change',finishJourney);
  media.addEventListener('change',()=>{if(media.matches)finishJourney();});
  document.addEventListener('visibilitychange',()=>journeyAnimations.forEach(a=>{if(document.hidden)a.pause();else if(a.playState==='paused')a.play();}));
  if(!media.matches&&'IntersectionObserver'in window){
    document.body.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){
      entry.target.classList.remove('pending-reveal');observer.unobserve(entry.target);
      if(!media.matches)for(const [i,child]of [...entry.target.children].entries())revealAnimations.push(child.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:1300,delay:i*180,easing:'cubic-bezier(.22,.65,.25,1)',fill:'backwards'}));
    }},{rootMargin:'0px 0px 100px 0px',threshold:.04});
    for(const section of document.querySelectorAll('.reveal-section')){section.classList.add('pending-reveal');observer.observe(section);}
  }
  if(!media.matches)for(const [i,el]of [...document.querySelectorAll('.hero-copy>*')].entries())revealAnimations.push(el.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:1500,delay:160+i*200,easing:'cubic-bezier(.22,.65,.25,1)',fill:'backwards'}));
  // Wait for the photographic layers so the entrance does not animate empty boxes.
  const artImages=[...document.querySelectorAll('.hero-art img,.hero-wordmark img')];
  Promise.allSettled(artImages.map(image=>image.decode())).then(()=>{
    if(media.matches)return;
    for(const [i,image]of [...document.querySelectorAll('.portrait-back,.hero-trophy,.portrait-front')].entries())revealAnimations.push(image.animate([{opacity:0,transform:'translateY(22px) scale(1.02)'},{opacity:1,transform:'none'}],{duration:1900,delay:250+i*240,easing:'cubic-bezier(.22,.65,.25,1)',fill:'backwards'}));
    for(const [i,name]of [...document.querySelectorAll('.hero-name')].entries())revealAnimations.push(name.animate([{opacity:0,translate:'-8px 5px'},{opacity:1,translate:'0 0'}],{duration:1250,delay:750+i*90,easing:'cubic-bezier(.22,.65,.25,1)',fill:'backwards'}));
    for(const [i,card]of [...document.querySelectorAll('.format-card')].entries())revealAnimations.push(card.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:1400,delay:850+i*180,easing:'cubic-bezier(.22,.65,.25,1)',fill:'backwards'}));
  });
  media.addEventListener('change',()=>{if(!media.matches)return;revealAnimations.forEach(a=>a.cancel());document.body.classList.remove('motion-ready');for(const el of document.querySelectorAll('.pending-reveal'))el.classList.remove('pending-reveal');});
  const links=[...document.querySelectorAll('.public-header nav a')];
  let scrollFrame=0;
  function updateNav(){scrollFrame=0;let active=null;for(const link of links){const target=document.querySelector(link.hash);if(target.getBoundingClientRect().top<innerHeight*.4)active=link;}for(const link of links)link.setAttribute('aria-current',String(link===active));}
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateNav);},{passive:true});addEventListener('resize',updateNav);updateNav();
  for(const link of document.querySelectorAll('a[href^="#"]'))link.addEventListener('click',()=>{if(media.matches)return;const target=document.querySelector(link.hash);if(target)target.animate([{filter:'brightness(1)'},{filter:'brightness(1.16)',offset:.3},{filter:'brightness(1)'}],{duration:1100,easing:'ease-out'});});
})();
