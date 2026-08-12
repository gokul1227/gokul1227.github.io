(function(){
  "use strict";

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ---------------- Terminal typewriter ---------------- */
  const lines = [
    { text: "> gokulakannan_rc // cloud & devops engineer", type: "plain" },
    { text: "> loading experience.json ...", type: "plain" },
    { text: '> { "experience": "3+ yrs", "clouds": ["aws","azure"], "focus": "iac + cicd" }', type: "val" },
    { text: "> status: ALL SYSTEMS OPERATIONAL", type: "val" }
  ];
  const out = document.getElementById('terminalOutput');
  function typeLine(lineObj, container, done){
    const div = document.createElement('div');
    if(lineObj.type === 'val') div.classList.add('val');
    container.appendChild(div);
    if (reduceMotion) { div.textContent = lineObj.text; done(); return; }
    let i = 0;
    const speed = 16;
    (function step(){
      div.textContent = lineObj.text.slice(0, i);
      i++;
      if(i <= lineObj.text.length){ setTimeout(step, speed); }
      else { done(); }
    })();
  }
  (function runSequence(idx){
    if(idx >= lines.length) return;
    typeLine(lines[idx], out, () => setTimeout(() => runSequence(idx+1), 220));
  })(0);

  /* ---------------- scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealChildren = document.querySelectorAll('[data-reveal-child]');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  if('IntersectionObserver' in window && !reduceMotion){
    // Adjust threshold for mobile - lower threshold means animations trigger earlier
    const mainThreshold = isMobile ? [0.05, 0.2] : 0.15;
    const childThreshold = isMobile ? [0.05, 0.2] : 0.2;
    
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('in');
        } else {
          e.target.classList.remove('in');
        }
      });
    }, { threshold: mainThreshold });
    revealEls.forEach(el => io.observe(el));

    const ioChild = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const idx = Array.prototype.indexOf.call(e.target.parentElement.children, e.target);
        if(e.isIntersecting){
          const delayMs = isMobile ? Math.max(idx,0) * 60 : Math.max(idx,0) * 90;
          e.target.style.transitionDelay = delayMs + 'ms';
          e.target.classList.add('in');
        } else {
          e.target.classList.remove('in');
          e.target.style.transitionDelay = '';
        }
      });
    }, { threshold: childThreshold });
    revealChildren.forEach(el => ioChild.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
    revealChildren.forEach(el => el.classList.add('in'));
  }

  /* ---------------- active nav link ---------------- */
  const sections = ['stack','architectures','experience','contact'].map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = document.querySelectorAll('nav.links a');
  window.addEventListener('scroll', () => {
    let current = sections[0] && sections[0].id;
    sections.forEach(sec => { if(window.scrollY + 100 >= sec.offsetTop) current = sec.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }, { passive:true });

  /* ---------------- cursor spotlight ---------------- */
  const glow = document.getElementById('cursorGlow');
  if(!isTouch && !reduceMotion && glow){
    let gx = window.innerWidth/2, gy = window.innerHeight/2, tx = gx, ty = gy;
    let glowActive = false;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if(!glowActive){ glow.classList.add('active'); glowActive = true; }
    }, { passive:true });
    (function loop(){
      gx += (tx - gx) * 0.14;
      gy += (ty - gy) * 0.14;
      glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- magnetic buttons ---------------- */
  if(!isTouch && !reduceMotion){
    const magnets = Array.prototype.slice.call(document.querySelectorAll('.magnetic'));
    let mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; }, { passive:true });
    (function loop(){
      magnets.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width/2, cy = r.top + r.height/2;
        const dx = mouseX - cx, dy = mouseY - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const radius = 70;
        if(dist < radius){
          const strength = (1 - dist/radius) * 0.35;
          el.style.transform = 'translate(' + (dx*strength) + 'px,' + (dy*strength) + 'px)';
        } else {
          el.style.transform = '';
        }
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- card tilt ---------------- */
  if(!isTouch && !reduceMotion){
    document.querySelectorAll('.tilt-card').forEach(card => {
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -8;
        const ry = (px - 0.5) * 8;
        if(raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-2px)';
        });
      });
      card.addEventListener('mouseleave', () => {
        if(raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
  }

  /* ---------------- parallax on scroll ---------------- */
  if(!reduceMotion){
    const gridOverlay = document.getElementById('gridOverlay');
    const rings = document.querySelectorAll('.orbit-ring');
    const ambientLayer = document.getElementById('ambientLayer');
    let ticking = false;
    
    // Reduce parallax effect on mobile for better performance
    const parallaxMultiplier = isMobile ? 0.5 : 1;
    
    window.addEventListener('scroll', () => {
      if(!ticking){
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if(gridOverlay) gridOverlay.style.transform = 'translateY(' + (y * 0.15 * parallaxMultiplier) + 'px)';
          if(ambientLayer) ambientLayer.style.transform = 'translateY(' + (y * 0.08 * parallaxMultiplier) + 'px)';
          rings.forEach((ring, i) => {
            ring.style.transform = 'translate(-50%,-50%) translateY(' + (y * (0.05 + i*0.03) * parallaxMultiplier) + 'px)';
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive:true });
  }

  /* ---------------- count-up numbers on scroll into view ---------------- */
  (function countUp(){
    const counters = document.querySelectorAll('[data-count-to]');
    if(!counters.length) return;
    function animateCounter(el){
      const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      if(reduceMotion){ el.textContent = target; return; }
      const duration = 1200;
      const start = performance.now();
      function tick(now){
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if(p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    }
    if('IntersectionObserver' in window){
      const countThreshold = isMobile ? [0.1, 0.4] : 0.6;
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if(e.isIntersecting){ animateCounter(e.target); io.unobserve(e.target); }
        });
      }, { threshold: countThreshold });
      counters.forEach(el => io.observe(el));
    } else {
      counters.forEach(el => { el.textContent = el.getAttribute('data-count-to'); });
    }
  })();

  /* ---------------- scroll-linked marquee speed-up ---------------- */
  (function marqueeScrollSpeed(){
    const track = document.getElementById('marqueeTrack');
    if(!track || reduceMotion) return;
    let lastY = window.scrollY, ticking2 = false;
    window.addEventListener('scroll', () => {
      if(!ticking2){
        requestAnimationFrame(() => {
          const dy = Math.abs(window.scrollY - lastY);
          lastY = window.scrollY;
          const boost = Math.min(dy * 2, 400);
          track.style.animationDuration = Math.max(8, 26 - boost/40) + 's';
          ticking2 = false;
        });
        ticking2 = true;
      }
    }, { passive:true });
  })();

  /* ---------------- mascot: drag + click ---------------- */
  const mascot = document.getElementById('mascot');
  const stage = document.getElementById('mascotStage');
  const bubble = document.getElementById('speechBubble');
  const lines2 = [
    "Hey, I'm Gokul-bot 👋",
    "terraform apply ✅",
    "Zero downtime, promise.",
    "Coffee.exe not found ☕",
    "Deploying vibes...",
    "45% cheaper, still fast.",
    "Try dragging me around!"
  ];
  let clickCount = 0;
  let bubbleTimer = null;

  function showBubble(text){
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 1800);
  }

  if(mascot){
    let dragging = false, moved = false, startX = 0, startY = 0, curX = 0, curY = 0, offX = 0, offY = 0;

    function clamp(val, min, max){ return Math.max(min, Math.min(max, val)); }

    function pointerDown(e){
      dragging = true; moved = false;
      mascot.classList.add('dragging');
      const p = (e.touches ? e.touches[0] : e);
      startX = p.clientX; startY = p.clientY;
      const style = getComputedStyle(mascot);
      const m = style.transform.match(/matrix.*\((.+)\)/);
      offX = 0; offY = 0;
      if(mascot._tx) offX = mascot._tx;
      if(mascot._ty) offY = mascot._ty;
      if(mascot.setPointerCapture && e.pointerId !== undefined){ try{ mascot.setPointerCapture(e.pointerId); }catch(err){} }
      window.addEventListener('pointermove', pointerMove);
      window.addEventListener('pointerup', pointerUp);
    }
    function pointerMove(e){
      if(!dragging) return;
      const p = (e.touches ? e.touches[0] : e);
      const dx = p.clientX - startX, dy = p.clientY - startY;
      if(Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      const stageRect = stage.getBoundingClientRect();
      const bound = 90;
      curX = clamp(offX + dx, -bound, bound);
      curY = clamp(offY + dy, -bound, bound);
      mascot.style.transform = 'translate(-50%,-50%) translate(' + curX + 'px,' + curY + 'px)';
      mascot._tx = curX; mascot._ty = curY;
    }
    function pointerUp(){
      dragging = false;
      mascot.classList.remove('dragging');
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerUp);
      if(!moved){ triggerMascot(); }
    }

    mascot.addEventListener('pointerdown', pointerDown);
    mascot.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); triggerMascot(); } });

    function triggerMascot(){
      clickCount++;
      mascot.classList.remove('bounce');
      void mascot.offsetWidth;
      if(!reduceMotion) mascot.classList.add('bounce');
      if(clickCount >= 6){
        showBubble("System Overclocked! 🚀");
        burstParticles(mascot);
        clickCount = 0;
      } else {
        showBubble(lines2[Math.min(clickCount-1, lines2.length-1)]);
      }
    }
  }

  /* ---------------- particle burst ---------------- */
  function burstParticles(el){
    if(reduceMotion) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const colors = ['#dcffdc', '#dbfcff', '#ebb2ff'];
    for(let i=0;i<14;i++){
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.background = colors[i % colors.length];
      document.body.appendChild(p);
      const angle = (Math.PI * 2 * i) / 14;
      const dist = 60 + Math.random()*50;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const anim = p.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.3)', opacity: 0 }
      ], { duration: 650 + Math.random()*250, easing: 'cubic-bezier(.16,1,.3,1)' });
      anim.onfinish = () => p.remove();
    }
  }

  /* ---------------- collectible badges ---------------- */
  const badgeCountEl = document.getElementById('badgeCount');
  const badgeCounter = document.getElementById('badgeCounter');
  const toastEl = document.getElementById('toast');
  const collectibles = document.querySelectorAll('[data-collectible]');
  const totalBadges = collectibles.length;
  document.getElementById('badgeTotal').textContent = totalBadges;
  let collected = 0;

  function showToast(text){
    toastEl.textContent = text;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  collectibles.forEach(el => {
    el.addEventListener('click', () => {
      if(el.classList.contains('collected')) return;
      el.classList.add('collected');
      burstParticles(el);
      collected++;
      badgeCountEl.textContent = collected;
      badgeCounter.classList.remove('pop');
      void badgeCounter.offsetWidth;
      badgeCounter.classList.add('pop');
      if(collected >= totalBadges){
        showToast('All badges collected! System fully deployed 🎉');
      } else {
        showToast('Badge collected — ' + collected + '/' + totalBadges);
      }
    });
  });

  /* ---------------- page loader (boot sequence) ---------------- */
  const loader = document.getElementById('pageLoader');
  const loaderFill = document.getElementById('loaderBarFill');
  function hideLoader(){
    if(!loader) return;
    loader.classList.add('hide');
    setTimeout(() => { loader.style.display = 'none'; revealHeroTitle(); }, 650);
  }
  if(loader){
    if(reduceMotion){
      loader.style.display = 'none';
    } else {
      let pct = 0;
      const fillTimer = setInterval(() => {
        pct += 6 + Math.random()*10;
        if(pct >= 100){ pct = 100; clearInterval(fillTimer); setTimeout(hideLoader, 200); }
        if(loaderFill) loaderFill.style.width = pct + '%';
      }, 90);
      // safety net in case load takes a while
      window.addEventListener('load', () => { if(pct < 100){ pct = 100; if(loaderFill) loaderFill.style.width = '100%'; } });
    }
  }

  /* ---------------- expressive typography: hero title word reveal ---------------- */
  function revealHeroTitle(){
    const lines3 = document.querySelectorAll('#heroTitle .line');
    if(!lines3.length) return;
    let wordIndex = 0;
    lines3.forEach(line => {
      const text = line.textContent;
      line.textContent = '';
      text.split(' ').forEach((w, i, arr) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w + (i < arr.length-1 ? '\u00A0' : '');
        span.style.transitionDelay = reduceMotion ? '0s' : (wordIndex * 90) + 'ms';
        line.appendChild(span);
        wordIndex++;
      });
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelectorAll('#heroTitle .word').forEach(w => w.classList.add('in'));
      });
    });
  }
  if(reduceMotion){ revealHeroTitle(); }

  /* ---------------- dynamic hero title + description cycling ---------------- */
  (function dynamicHeroCycle(){
    const heroLines = document.querySelectorAll('#heroTitle .line');
    const heroDesc = document.querySelector('.hero-desc');
    if(!heroLines.length || !heroDesc) return;
    const variants = [
      { title: ['Infrastructure','As Code.'], desc: 'Cloud & DevOps Engineer architecting resilient, scalable, and secure AWS & Azure environments — CI/CD pipeline design, Terraform, containers, and cost-optimized production infrastructure for multi-service SaaS platforms.' },
      { title: ['Cloud','& DevOps Engineer.'], desc: 'Cloud & DevOps Engineer — AWS, Azure, Terraform, CI/CD pipelines, and infrastructure automation.' },
      { title: ['Docker','Container Specialist.'], desc: 'Containers, image optimization, orchestration, and cost-aware deployments.' }
    ];
    let idx = 0;
    function setHero(v){
      heroLines.forEach((ln, i) => { ln.textContent = v.title[i] || ''; });
      heroDesc.textContent = v.desc;
      revealHeroTitle();
    }
    if(!reduceMotion){
      setHero(variants[0]);
      setInterval(() => {
        idx = (idx + 1) % variants.length;
        setHero(variants[idx]);
      }, 3800);
    }
  })();

  /* ---------------- scroll progress bar + nav glass state ---------------- */
  const progressFill = document.getElementById('scrollProgressFill');
  const siteNav = document.getElementById('siteNav');
  function updateScrollChrome(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if(progressFill) progressFill.style.width = pct + '%';
    if(siteNav) siteNav.classList.toggle('scrolled', scrollTop > 40);
  }
  window.addEventListener('scroll', updateScrollChrome, { passive:true });
  updateScrollChrome();

  /* ---------------- section flash transition on nav click ---------------- */
  navLinks.forEach(a => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href').replace('#','');
      const target = document.getElementById(id);
      if(target && target.tagName === 'SECTION' && !reduceMotion){
        target.classList.remove('flash');
        void target.offsetWidth;
        target.classList.add('flash');
      }
    });
  });

  /* ---------------- self-drawing section-head squiggles ---------------- */
  (function addSquiggles(){
    const heads = document.querySelectorAll('.section-head h2');
    heads.forEach(h2 => {
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'head-squiggle');
      svg.setAttribute('width', '90');
      svg.setAttribute('height', '12');
      svg.setAttribute('viewBox', '0 0 90 12');
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M2 8 Q 15 2 28 8 T 54 8 T 80 8');
      svg.appendChild(path);
      h2.insertAdjacentElement('afterend', svg);
      const len = path.getTotalLength ? path.getTotalLength() : 100;
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      if(reduceMotion){ path.style.strokeDashoffset = 0; return; }
      if('IntersectionObserver' in window){
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if(e.isIntersecting){
              path.style.strokeDashoffset = 0;
              obs.unobserve(e.target);
            }
          });
        }, { threshold: 0.4 });
        obs.observe(svg);
      } else {
        path.style.strokeDashoffset = 0;
      }
    });
  })();

  /* ---------------- mascot self-drawing outline ---------------- */
  (function drawMascotOutline(){
    const parts = document.querySelectorAll('.mascot-draw');
    if(!parts.length) return;
    parts.forEach(p => {
      let len = 200;
      try { len = p.getTotalLength ? p.getTotalLength() : 200; } catch(e){}
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = reduceMotion ? 0 : len;
    });
    if(reduceMotion) return;
    setTimeout(() => {
      parts.forEach((p, i) => {
        setTimeout(() => { p.style.strokeDashoffset = 0; }, i * 120);
      });
    }, 900);
  })();

  /* ---------------- faux-3D parallax layers in hero (mouse-driven, desktop only) ---------------- */
  if(!isTouch && !reduceMotion && stage){
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      document.querySelectorAll('.orbit-ring').forEach((ring, i) => {
        ring.style.marginLeft = (px * (10 + i*6)) + 'px';
        ring.style.marginTop = (py * (10 + i*6)) + 'px';
      });
    });
    stage.addEventListener('mouseleave', () => {
      document.querySelectorAll('.orbit-ring').forEach(ring => { ring.style.marginLeft = '0'; ring.style.marginTop = '0'; });
    });
  }

  /* ---------------- project detail modal ---------------- */
  const projectData = {
    harvesteye: {
      tag: 'Production', tagClass: 'tag-purple',
      title: 'HarvestEye Portal — Agricultural IoT & Analytics',
      sub: 'B-Sec Technologies · Jan 2023 – Present',
      chips: ['EC2 / Lightsail','S3','RDS MySQL','ECS / ECR (Fargate)','Lambda','API Gateway','Terraform','KMS / WAF','CloudFront','Route53 / ACM'],
      points: [
        'Designed and managed the end-to-end AWS production architecture: CloudFront + S3 (Angular) frontend, Lightsail/Apache-Django backend, RDS MySQL, and a dedicated Lightsail ETL server processing field-device data from S3.',
        'Adopted Terraform to provision select infrastructure resources/modules, reducing manual configuration for repeatable components.',
        'Built reporting/processing workloads on Lambda and ECS Fargate; deployed AI/ML workloads on EC2 using Docker, with Jenkins CI/CD building memory-intensive ML images (PyTorch/YOLO, Detectron2) and pushing to ECR.',
        'Designed a secure multi-tenant API authentication system: IAM SigV4 as Layer 1, database-stored API tokens as Layer 2, with KMS key rotation via an EventBridge-triggered Lambda.',
        'Exposed public APIs via API Gateway (IAM auth, API keys, rate limiting, CORS); used SES for automated client report delivery and EventBridge for pipeline scheduling.',
        'Designed secure VPC networking with restrictive security groups; owned least-privilege IAM, KMS rotation, and WAF policies (DDoS/malware/injection protection).',
        'Re-engineered CI/CD using Bitbucket Pipelines with blue-green deployment across Lightsail, EC2, ECR, and S3, including CloudFront cache invalidation; reduced Docker image size through staged build optimization.',
        'Optimized MySQL storage footprint through schema normalization, archival, and growth-trend analysis, avoiding unplanned RDS scaling costs.',
        'Built secure Python-based webhook infrastructure for cross-domain, multi-environment data synchronization.',
        'Built reusable Python automation for AWS operations and scheduled reporting pipelines exporting metrics to JSON, Excel, CSV, and Parquet.'
      ]
    },
    twellr: {
      tag: 'Migrated', tagClass: 'tag-mint',
      title: 'Twellr.ai — AI-Powered Personalized Wellness Platform',
      sub: 'B-Sec Technologies · Jan 2023 – Present',
      chips: ['Elastic Beanstalk','ALB / ASG','ECR / ACR','Cognito → Entra ID','Key Vault','WAF','GitHub Actions','Azure Front Door','VM Scale Sets','Log Analytics'],
      points: [
        'Designed a multi-tier cloud architecture: CloudFront → Elastic Beanstalk (Next.js/Nginx) → internal EC2 backend services behind an Nginx reverse proxy, with an isolated GPU inference server reachable only via internal security groups.',
        'Used Terraform to provision select infrastructure resources during the platform build and the AWS→Azure migration, improving deployment consistency across environments.',
        'Led the full infrastructure migration from AWS to Azure, re-architecting equivalent managed services: Azure Front Door (CDN), VM Scale Sets (autoscaling), Postgres Flexible Server, Blob Storage, Azure Container Registry, Entra ID, Key Vault, and Log Analytics.',
        'Built per-service CI/CD with GitHub Actions, pushing container images to ECR/ACR and deploying via blue-green strategy to EC2 and Lambda targets.',
        'Configured auto scaling groups and load balancing to absorb variable traffic across backend services.',
        'Implemented federated social login via AWS Cognito, later migrated to Entra ID, for OAuth2/OIDC-based identity management.',
        'Managed secure configuration and secrets via Parameter Store (later Key Vault); configured WAF for firewall protection and API Gateway rate limiting.',
        'Set up CloudWatch and Azure Log Analytics for centralized logging and service metrics across the platform.'
      ]
    },
    supplier: {
      tag: 'Production', tagClass: 'tag-purple',
      title: 'Supplier Portal ',
      sub: 'B-Sec Technologies · Jan 2023 – Present',
      chips: ['EC2','ALB','RDS MySQL','S3','Lambda','VPC','Route53 / ACM','WAF','PM2 / Node.js'],
      points: [
        'Architected infrastructure with a CloudFront/S3 (Angular) frontend and an EC2-hosted backend (Node.js on PM2) behind an ALB with a custom domain and TLS termination, backed by RDS MySQL and a backend-only WordPress CRM.',
        'Built a VPN-based ETL process to connect to a customer\u2019s external database, extract and process data, sync it into the application database, and auto-generate PDF reports shown in the portal.',
        'Architected least-privilege IAM access controls — fine-grained programmatic user policies for S3 and EC2 with restricted security groups, eliminating over-provisioned access risk.',
        'Automated inter-bucket S3 file transfer and cleanup using Lambda event triggers, reducing manual operational overhead by 70% and eliminating human error in file lifecycle management.',
        'Resolved a critical PM2 auto-restart loop causing backend service disconnections during UAT; root-cause analysis and fix restored stable, zero-downtime service availability.',
        'Diagnosed and resolved a CORS misconfiguration between the Angular frontend and the WordPress CRM integration through the Node.js backend.',
        'Configured ALB, ACM, and Route53 for secure custom-domain TLS termination and DNS management, with WAF for attack protection.'
      ]
    }
  };

  const modal = document.getElementById('projectModal');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const modalChips = document.getElementById('modalChips');
  const modalPoints = document.getElementById('modalPoints');
  const modalClose = document.getElementById('modalClose');
  let lastFocused = null;

  function openModal(key){
    const data = projectData[key];
    if(!data || !modal) return;
    modalTag.textContent = data.tag;
    modalTag.className = 'tag modal-tag ' + data.tagClass;
    modalTitle.textContent = data.title;
    modalSub.textContent = data.sub;
    modalChips.innerHTML = data.chips.map(c => '<span class="chip">' + c + '</span>').join('');
    modalPoints.innerHTML = data.points.map(p => '<li>' + p + '</li>').join('');
    lastFocused = document.activeElement;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if(lastFocused) lastFocused.focus();
  }
  document.querySelectorAll('.card[data-project]').forEach(card => {
    card.addEventListener('click', () => openModal(card.getAttribute('data-project')));
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openModal(card.getAttribute('data-project')); }
    });
  });
  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modal){
    modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
  }
  window.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

  /* ---------------- email: show address + copy instead of mailto redirect ---------------- */
  const emailPopover = document.getElementById('emailPopover');
  let emailHideTimer = null;
  document.querySelectorAll('.email-trigger').forEach(btn => {
    // Prevent any default email client action
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    btn.addEventListener('auxclick', (e) => e.preventDefault());
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const email = btn.getAttribute('data-email');
      if(!emailPopover) return;
      
      const r = btn.getBoundingClientRect();
      
      // Copy to clipboard
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(email)
          .then(() => {
            console.log('Email copied to clipboard');
          })
          .catch(() => {
            console.log('Failed to copy to clipboard');
          });
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); } catch(err) {}
        document.body.removeChild(textarea);
      }
      
      // Show popover with email and "Copied" message
      emailPopover.innerHTML = '<span style="display:block; margin-bottom:4px;">' + email + '</span><span class="copy-hint">✓ Copied to clipboard</span>';
      const top = r.bottom + 12;
      const left = r.left + r.width/2;
      emailPopover.style.top = top + 'px';
      emailPopover.style.left = left + 'px';
      emailPopover.style.transform = 'translateX(-50%) translateY(0) scale(1)';
      requestAnimationFrame(() => emailPopover.classList.add('show'));
      clearTimeout(emailHideTimer);
      emailHideTimer = setTimeout(() => emailPopover.classList.remove('show'), 2800);
    });
  });
  
  // Close popover when clicking elsewhere
  document.addEventListener('click', (e) => {
    if(emailPopover && !e.target.closest('.email-trigger') && !e.target.closest('#emailPopover')){
      emailPopover.classList.remove('show');
    }
  });

})();
