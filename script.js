// ===== Nexora LMS - Script =====
(function(){
  // Preloader
  window.addEventListener('load',()=>{
    setTimeout(()=>document.getElementById('preloader').classList.add('hide'),900);
  });

  // Custom cursor
  const cursor=document.querySelector('.cursor');
  const follower=document.querySelector('.cursor-follower');
  let mx=0,my=0,fx=0,fy=0;
  window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
  (function loop(){cursor.style.left=mx+'px';cursor.style.top=my+'px';fx+=(mx-fx)*.12;fy+=(my-fy)*.12;follower.style.left=fx+'px';follower.style.top=fy+'px';requestAnimationFrame(loop)})();
  document.querySelectorAll('a,button,.feature-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{follower.style.width='56px';follower.style.height='56px';follower.style.background='rgba(99,102,241,.15)'});
    el.addEventListener('mouseleave',()=>{follower.style.width='36px';follower.style.height='36px';follower.style.background='transparent'});
  });

  // Navbar scroll
  const nav=document.getElementById('navbar');
  window.addEventListener('scroll',()=>{nav.classList.toggle('scrolled',window.scrollY>40)});

  // Mobile toggle
  const toggle=document.getElementById('navToggle');
  if(toggle){toggle.addEventListener('click',()=>{document.querySelector('.nav-links').classList.toggle('open');document.querySelector('.nav-actions').classList.toggle('open')})}

  // Reveal on scroll
  const io=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.15});
  document.querySelectorAll('section,.feature-card,.price-card').forEach(el=>{el.classList.add('reveal');io.observe(el)});

  // Counter animation
  const counters=document.querySelectorAll('.stat-num');
  const cio=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){animate(e.target);cio.unobserve(e.target)}})},{threshold:.5});
  counters.forEach(c=>cio.observe(c));
  function animate(el){
    const target=+el.dataset.count;let start=0;const dur=1800;const t0=performance.now();
    function step(t){const p=Math.min((t-t0)/dur,1);const eased=1-Math.pow(1-p,3);el.textContent=Math.floor(eased*target).toLocaleString();if(p<1)requestAnimationFrame(step);else el.textContent=target.toLocaleString()}
    requestAnimationFrame(step);
  }

  // Testimonial slider
  const track=document.getElementById('testimonialTrack');
  const dots=document.getElementById('testimonialDots');
  if(track){
    const items=track.children.length;let idx=0;
    for(let i=0;i<items;i++){const b=document.createElement('button');if(i===0)b.classList.add('active');b.addEventListener('click',()=>go(i));dots.appendChild(b)}
    function go(i){idx=i;track.style.transform='translateX(-'+(i*100)+'%)';[...dots.children].forEach((d,j)=>d.classList.toggle('active',j===i))}
    setInterval(()=>go((idx+1)%items),5000);
  }

  // Tilt cards
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform='translateY(-6px) rotateX('+(y*-8)+'deg) rotateY('+(x*8)+'deg)';
    });
    card.addEventListener('mouseleave',()=>{card.style.transform='translateY(0) rotateX(0) rotateY(0)'});
  });
})();

// ===== Three.js Hero Scene =====
(function(){
  if(typeof THREE==='undefined') return;
  const canvas=document.getElementById('hero-canvas');
  if(!canvas) return;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,canvas.clientWidth/canvas.clientHeight,0.1,1000);
  camera.position.z=6;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  // Lights
  const amb=new THREE.AmbientLight(0xffffff,.5);scene.add(amb);
  const p1=new THREE.PointLight(0x6366f1,1.2,50);p1.position.set(5,5,5);scene.add(p1);
  const p2=new THREE.PointLight(0x22d3ee,1,50);p2.position.set(-5,-3,3);scene.add(p2);

  // Floating shapes (graduation-cap-like + books)
  const group=new THREE.Group();scene.add(group);
  const geos=[
    new THREE.IcosahedronGeometry(1.1,1),
    new THREE.TorusGeometry(.9,.28,16,64),
    new THREE.OctahedronGeometry(.9),
    new THREE.BoxGeometry(1,1,1),
    new THREE.SphereGeometry(.7,32,32)
  ];
  const mats=[
    new THREE.MeshStandardMaterial({color:0x6366f1,roughness:.3,metalness:.6,emissive:0x2a2d6f,emissiveIntensity:.4}),
    new THREE.MeshStandardMaterial({color:0x8b5cf6,roughness:.25,metalness:.7}),
    new THREE.MeshStandardMaterial({color:0x22d3ee,roughness:.2,metalness:.8,emissive:0x0a4a55,emissiveIntensity:.3}),
    new THREE.MeshStandardMaterial({color:0xa78bfa,roughness:.35,metalness:.5}),
    new THREE.MeshStandardMaterial({color:0x60a5fa,roughness:.2,metalness:.8})
  ];
  const meshes=[];
  for(let i=0;i<12;i++){
    const m=new THREE.Mesh(geos[i%geos.length],mats[i%mats.length]);
    const r=3+Math.random()*2.5;
    const theta=Math.random()*Math.PI*2;
    const phi=Math.acos(2*Math.random()-1);
    m.position.set(r*Math.sin(phi)*Math.cos(theta),r*Math.sin(phi)*Math.sin(theta)*.6,r*Math.cos(phi));
    m.scale.setScalar(.4+Math.random()*.6);
    m.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,0);
    m.userData={rx:.003+Math.random()*.01,ry:.004+Math.random()*.012,orbit:r,speed:.0005+Math.random()*.001,phase:Math.random()*Math.PI*2};
    group.add(m);meshes.push(m);
  }

  // Particles
  const pGeo=new THREE.BufferGeometry();
  const N=900;const pos=new Float32Array(N*3);
  for(let i=0;i<N*3;i++) pos[i]=(Math.random()-0.5)*16;
  pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pMat=new THREE.PointsMaterial({color:0x8b5cf6,size:.03,transparent:true,opacity:.7});
  const points=new THREE.Points(pGeo,pMat);scene.add(points);

  let mouse={x:0,y:0};
  window.addEventListener('mousemove',e=>{mouse.x=(e.clientX/innerWidth)*2-1;mouse.y=-(e.clientY/innerHeight)*2+1});
  function resize(){camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix();renderer.setSize(canvas.clientWidth,canvas.clientHeight)}
  window.addEventListener('resize',resize);
  const clock=new THREE.Clock();
  function animate(){
    const t=clock.getElapsedTime();
    meshes.forEach(m=>{
      m.rotation.x+=m.userData.rx;m.rotation.y+=m.userData.ry;
      const a=t*m.userData.speed+m.userData.phase;
      m.position.x=Math.cos(a)*m.userData.orbit*.6+Math.sin(t*.3+m.userData.phase)*.3;
    });
    group.rotation.y+=.0008 + mouse.x*.001;
    group.rotation.x+= (mouse.y-group.rotation.x*.1)*.001;
    points.rotation.y=t*.05;
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===== Three.js Showcase Scene =====
(function(){
  if(typeof THREE==='undefined') return;
  const canvas=document.getElementById('showcase-canvas');
  if(!canvas) return;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,canvas.clientWidth/canvas.clientHeight,0.1,1000);
  camera.position.z=5.5;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  const amb=new THREE.AmbientLight(0xffffff,.6);scene.add(amb);
  const pl=new THREE.PointLight(0x6366f1,1.4,40);pl.position.set(4,4,4);scene.add(pl);
  const pl2=new THREE.PointLight(0x22d3ee,1,40);pl2.position.set(-4,-2,2);scene.add(pl2);

  // DNA-like double helix of spheres
  const group=new THREE.Group();scene.add(group);
  const sphereGeo=new THREE.SphereGeometry(.12,16,16);
  const matA=new THREE.MeshStandardMaterial({color:0x6366f1,roughness:.2,metalness:.7,emissive:0x2a2d6f,emissiveIntensity:.4});
  const matB=new THREE.MeshStandardMaterial({color:0x22d3ee,roughness:.2,metalness:.7,emissive:0x0a3a44,emissiveIntensity:.4});
  const barMat=new THREE.MeshStandardMaterial({color:0x8b5cf6,roughness:.4,metalness:.5});
  const rungs=[];
  for(let i=0;i<40;i++){
    const y=(i-20)*.18;
    const a=i*.35;
    const x1=Math.cos(a)*1.2,y1=y,z1=Math.sin(a)*1.2;
    const x2=Math.cos(a+Math.PI)*1.2,z2=Math.sin(a+Math.PI)*1.2;
    const s1=new THREE.Mesh(sphereGeo,matA);s1.position.set(x1,y,z1);group.add(s1);
    const s2=new THREE.Mesh(sphereGeo,matB);s2.position.set(x2,y,z2);group.add(s2);
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,2.4,8),barMat);
    bar.position.set((x1+x2)/2,y,(z1+z2)/2);
    bar.rotation.z=Math.PI/2;
    bar.rotation.y=-a;
    group.add(bar);
    rungs.push({s1,s2,bar,y,a});
  }

  function resize(){camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix();renderer.setSize(canvas.clientWidth,canvas.clientHeight)}
  window.addEventListener('resize',resize);
  const clock=new THREE.Clock();
  function animate(){
    const t=clock.getElapsedTime();
    group.rotation.y=t*.4;
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
