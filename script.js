(function () {
  'use strict';

  /* ===== Supabase API 快捷引用 ===== */
  const sb = window.supabaseApi;

  /* ===== 星空背景 ===== */
  const starfield = document.getElementById('starfield');
  const ctxStars = starfield.getContext('2d');
  let stars = [];
  let animStars = null;
  let scrollY = 0;
  let width, height;

  function resize() {
    width = starfield.width = Math.min(window.innerWidth, 900);
    height = starfield.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    window._starsData = stars;
    const count = Math.floor((width * height) / 4000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 3,
        z: Math.random(),
        size: Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        brightness: 0.3 + Math.random() * 0.5,
      });
    }
  }

  function drawStars(time) {
    ctxStars.clearRect(0, 0, width, height);
    const colors = ['#ffffff', '#ccddff', '#aaccff', '#88ccff'];

    stars.forEach(function (star) {
      const factor = 0.1 + star.z * 0.4;
      const offsetY = (scrollY * factor) % (height * 3);
      let y = star.y - offsetY;
      if (y < -10) y += height * 3;

      const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * twinkle;

      ctxStars.fillStyle = colors[Math.floor(star.z * colors.length)];
      ctxStars.globalAlpha = alpha;

      const px = Math.round(star.x);
      const py = Math.round(y);
      ctxStars.fillRect(px, py, star.size, star.size);
    });
    ctxStars.globalAlpha = 1;
    animStars = requestAnimationFrame(drawStars);
  }

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(drawStars);

  /* ===== 流星效果 ===== */
  const meteorCanvas = document.getElementById('meteor-canvas');
  const mCtx = meteorCanvas.getContext('2d');
  let meteors = [];
  let meteorTimer = 0;

  function resizeMeteor() {
    const hero = document.getElementById('hero');
    meteorCanvas.width = hero.clientWidth;
    meteorCanvas.height = hero.clientHeight;
  }

  function createMeteor() {
    const startX = Math.random() * meteorCanvas.width;
    const startY = Math.random() * meteorCanvas.height * 0.3;
    const length = 80 + Math.random() * 120;
    const speed = 3 + Math.random() * 4;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;

    meteors.push({
      x: startX,
      y: startY,
      length: length,
      speed: speed,
      angle: angle,
      life: 1,
      decay: 0.01 + Math.random() * 0.02,
      width: 1 + Math.random() * 2,
    });
  }

  function drawMeteors() {
    mCtx.clearRect(0, 0, meteorCanvas.width, meteorCanvas.height);

    meteors = meteors.filter(function (meteor) {
      meteor.x += Math.cos(meteor.angle) * meteor.speed;
      meteor.y += Math.sin(meteor.angle) * meteor.speed;
      meteor.life -= meteor.decay;

      if (meteor.life <= 0) return false;

      const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
      const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

      const gradient = mCtx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
      gradient.addColorStop(0, 'rgba(255, 255, 255, ' + meteor.life + ')');
      gradient.addColorStop(0.1, 'rgba(200, 230, 255, ' + (meteor.life * 0.8) + ')');
      gradient.addColorStop(0.5, 'rgba(136, 204, 255, ' + (meteor.life * 0.4) + ')');
      gradient.addColorStop(1, 'rgba(136, 204, 255, 0)');

      mCtx.strokeStyle = gradient;
      mCtx.lineWidth = meteor.width;
      mCtx.lineCap = 'round';
      mCtx.beginPath();
      mCtx.moveTo(meteor.x, meteor.y);
      mCtx.lineTo(tailX, tailY);
      mCtx.stroke();

      mCtx.fillStyle = 'rgba(255, 255, 255, ' + meteor.life + ')';
      mCtx.beginPath();
      mCtx.arc(meteor.x, meteor.y, meteor.width * 1.5, 0, Math.PI * 2);
      mCtx.fill();

      return true;
    });

    meteorTimer++;
    if (meteorTimer > 60 + Math.random() * 120) {
      createMeteor();
      meteorTimer = 0;
    }

    requestAnimationFrame(drawMeteors);
  }

  window.addEventListener('resize', resizeMeteor);
  resizeMeteor();
  requestAnimationFrame(drawMeteors);

  /* ===== 银河系旋臂粒子 ===== */
  const galaxyCanvas = document.getElementById('galaxy-canvas');
  const gCtx = galaxyCanvas.getContext('2d');
  let galaxyParticles = [];
  let galaxyTime = 0;

  function resizeGalaxy() {
    const container = document.getElementById('galaxy-container');
    galaxyCanvas.width = container.clientWidth;
    galaxyCanvas.height = container.clientHeight;
    initGalaxyParticles();
  }

  function initGalaxyParticles() {
    galaxyParticles = [];
    const count = 200;
    const cx = galaxyCanvas.width / 2;
    const cy = galaxyCanvas.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const arm = Math.floor(Math.random() * 4);
      const armAngle = arm * (Math.PI / 2);
      const dist = Math.random() * Math.min(cx, cy) * 0.9;
      const spiralAngle = dist * 0.01;

      galaxyParticles.push({
        angle: armAngle + spiralAngle + (Math.random() - 0.5) * 0.5,
        dist: dist,
        size: 1 + Math.random() * 2,
        speed: 0.0001 + Math.random() * 0.0003,
        hue: 180 + Math.random() * 60,
        brightness: 0.3 + Math.random() * 0.5,
      });
    }
  }

  function drawGalaxy() {
    gCtx.clearRect(0, 0, galaxyCanvas.width, galaxyCanvas.height);
    const cx = galaxyCanvas.width / 2;
    const cy = galaxyCanvas.height / 2;

    galaxyParticles.forEach(function (p) {
      p.angle += p.speed;
      const x = cx + Math.cos(p.angle) * p.dist;
      const y = cy + Math.sin(p.angle) * p.dist;

      const twinkle = 0.5 + 0.5 * Math.sin(galaxyTime * 0.002 + p.dist);
      const alpha = p.brightness * twinkle;

      gCtx.fillStyle = `hsl(${p.hue}, 70%, ${70 + twinkle * 30}%)`;
      gCtx.globalAlpha = alpha;
      gCtx.fillRect(Math.round(x), Math.round(y), p.size, p.size);
    });
    gCtx.globalAlpha = 1;

    galaxyTime += 16;
    requestAnimationFrame(drawGalaxy);
  }

  window.addEventListener('resize', resizeGalaxy);
  setTimeout(resizeGalaxy, 100);
  drawGalaxy();

  /* ===== 银河带效果 ===== */
  const milkyCanvas = document.getElementById('milky-canvas');
  let milkyAnim = null;
  let milkyParticles = [];

  if (milkyCanvas) {
    const mCtx = milkyCanvas.getContext('2d');
    let milkyWidth, milkyHeight;

    function resizeMilky() {
      milkyWidth = milkyCanvas.width = milkyCanvas.parentElement.clientWidth;
      milkyHeight = milkyCanvas.height = 120;
      initMilky();
    }

    function initMilky() {
      milkyParticles = [];
      for (let i = 0; i < 100; i++) {
        milkyParticles.push({
          x: Math.random() * milkyWidth,
          y: milkyHeight / 2 + (Math.random() - 0.5) * milkyHeight * 0.5,
          size: 1 + Math.random() * 2,
          speedX: 0.2 + Math.random() * 0.5,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawMilky(t) {
      mCtx.clearRect(0, 0, milkyWidth, milkyHeight);
      milkyParticles.forEach(function (p) {
        p.x += p.speedX;
        if (p.x > milkyWidth + 10) p.x = -10;
        const twinkle = 0.4 + 0.6 * Math.sin(t * 0.002 + p.twinkleOffset);
        mCtx.fillStyle = '#ffffff';
        mCtx.globalAlpha = twinkle * 0.6;
        mCtx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      });
      milkyAnim = requestAnimationFrame(drawMilky);
    }

    window.addEventListener('resize', resizeMilky);
    resizeMilky();
    requestAnimationFrame(drawMilky);
  }

  /* ===== 变量声明 ===== */
  const galaxyModal = document.getElementById('galaxy-modal');
  const modalLabel = document.getElementById('modal-label');
  const modalClose = document.getElementById('modal-close');
  const modalBg = galaxyModal.querySelector('.galaxy-modal-bg');
  const modalStarCanvas = document.getElementById('modal-star-canvas');
  const modalStarCtx = modalStarCanvas.getContext('2d');
  const galaxyOrbits = document.getElementById('galaxy-orbits');
  const floatingContainer = document.getElementById('floating-images-container');

  const planetColors = ['#88ccff', '#ff88cc', '#88ffaa', '#ffcc88', '#ff8888', '#88ffcc', '#cc88ff', '#ffcc66'];
  const orbitSizeStep = 100;
  const orbitDurationStep = 15;
  const planetPositions = [
    { top: '0', left: '50%', right: 'auto', bottom: 'auto' },
    { top: '25%', right: '0', left: 'auto', bottom: 'auto' },
    { bottom: '0', left: '50%', right: 'auto', top: 'auto' },
    { left: '0', top: '35%', right: 'auto', bottom: 'auto' }
  ];

  // 统一将原始 images 数组转换为 { url, path } 格式（兼容各种 Supabase 返回结构）
  function normalizeImages(rawImages) {
    if (!rawImages || rawImages.length === 0) return [];
    return rawImages.map(function (img) {
      if (typeof img === 'string') {
        return { path: img, url: sb.getImageUrl(img) };
      }
      if (img && typeof img === 'object') {
        // 已有 url 直接使用
        if (img.url) return img;
        // 有 path 或 file_path 但缺 url → 补全
        const path = img.path || img.file_path;
        const publicUrl = img.publicUrl || img.image_url ||
                          (path ? sb.getImageUrl(path) : null);
        return {
          name: img.name || '',
          path: path || img.path || '',
          url: publicUrl || ''
        };
      }
      return null;
    }).filter(function (item) { return item && item.url; });
  }

  let portfolioData = [];
  let currentPlanetIndex = 0;
  let scatterParticles = [];
  let scatterAnimId = null;
  let floatingImages = [];

  function resizeModalStarCanvas() {
    modalStarCanvas.width = Math.min(window.innerWidth, 900);
    modalStarCanvas.height = window.innerHeight;
  }

  function createScatterParticles(originX, originY, count) {
    scatterParticles = [];
    const dreamColors = [
      { h: 280, s: 80, l: 70 },
      { h: 320, s: 90, l: 75 },
      { h: 200, s: 85, l: 75 },
      { h: 170, s: 80, l: 70 },
      { h: 260, s: 85, l: 80 },
      { h: 300, s: 75, l: 75 },
      { h: 220, s: 90, l: 80 },
      { h: 340, s: 80, l: 75 }
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      const colorDef = dreamColors[Math.floor(Math.random() * dreamColors.length)];
      const hue = colorDef.h + (Math.random() - 0.5) * 30;
      const sat = colorDef.s + (Math.random() - 0.5) * 20;
      const light = colorDef.l + (Math.random() - 0.5) * 20;

      scatterParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 4,
        life: 1,
        decay: 0.003 + Math.random() * 0.012,
        color: `hsl(${hue}, ${sat}%, ${light}%)`,
        glowColor: `hsla(${hue}, ${sat}%, ${light}%, 0.4)`,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 3 + Math.random() * 8,
        trail: [],
        maxTrail: 5 + Math.floor(Math.random() * 8),
        type: Math.random() < 0.3 ? 'star' : Math.random() < 0.6 ? 'diamond' : 'dot',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  function drawScatter() {
    modalStarCtx.clearRect(0, 0, modalStarCanvas.width, modalStarCanvas.height);

    scatterParticles = scatterParticles.filter(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.life -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.life <= 0) return false;

      p.trail.push({ x: p.x, y: p.y, life: p.life });
      if (p.trail.length > p.maxTrail) {
        p.trail.shift();
      }

      const twinkle = 0.5 + 0.5 * Math.sin(p.life * p.twinkleSpeed * 10 + p.twinkle);
      const alpha = p.life * twinkle;

      for (let t = 0; t < p.trail.length - 1; t++) {
        const trailPoint = p.trail[t];
        const trailAlpha = (t / p.trail.length) * alpha * 0.5;
        const trailSize = p.size * (t / p.trail.length) * 0.6;

        modalStarCtx.globalAlpha = trailAlpha;
        modalStarCtx.fillStyle = p.glowColor;
        modalStarCtx.beginPath();
        modalStarCtx.arc(trailPoint.x, trailPoint.y, trailSize + 1, 0, Math.PI * 2);
        modalStarCtx.fill();
      }

      modalStarCtx.globalAlpha = alpha * 0.3;
      modalStarCtx.fillStyle = p.glowColor;
      modalStarCtx.beginPath();
      modalStarCtx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      modalStarCtx.fill();

      modalStarCtx.globalAlpha = alpha;
      modalStarCtx.fillStyle = p.color;

      if (p.type === 'star') {
        drawStar(p.x, p.y, p.size * 1.5, p.rotation);
      } else if (p.type === 'diamond') {
        drawDiamond(p.x, p.y, p.size, p.rotation);
      } else {
        modalStarCtx.beginPath();
        modalStarCtx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        modalStarCtx.fill();
      }

      return true;
    });

    modalStarCtx.globalAlpha = 1;

    if (scatterParticles.length > 0) {
      scatterAnimId = requestAnimationFrame(drawScatter);
    }
  }

  function drawStar(x, y, size, rotation) {
    modalStarCtx.save();
    modalStarCtx.translate(x, y);
    modalStarCtx.rotate(rotation);
    modalStarCtx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const px = Math.cos(angle) * size;
      const py = Math.sin(angle) * size;
      if (i === 0) modalStarCtx.moveTo(px, py);
      else modalStarCtx.lineTo(px, py);
    }
    modalStarCtx.closePath();
    modalStarCtx.fill();
    modalStarCtx.restore();
  }

  function drawDiamond(x, y, size, rotation) {
    modalStarCtx.save();
    modalStarCtx.translate(x, y);
    modalStarCtx.rotate(rotation);
    modalStarCtx.beginPath();
    modalStarCtx.moveTo(0, -size);
    modalStarCtx.lineTo(size * 0.6, 0);
    modalStarCtx.lineTo(0, size);
    modalStarCtx.lineTo(-size * 0.6, 0);
    modalStarCtx.closePath();
    modalStarCtx.fill();
    modalStarCtx.restore();
  }

  function getPlanetScreenPos(planet) {
    const rect = planet.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  function createPlanet(index, name) {
    const orbit = document.createElement('div');
    orbit.className = 'orbit';

    const isMobile = window.innerWidth < 768;
    const mobileScale = isMobile ? 0.85 : 1.3;
    const baseOrbit = isMobile ? 180 : 220;
    const orbitSize = (baseOrbit + index * orbitSizeStep) * mobileScale;
    const orbitDuration = 20 + index * orbitDurationStep;
    orbit.style.width = orbitSize + 'px';
    orbit.style.height = orbitSize + 'px';
    orbit.style.animationDuration = orbitDuration + 's';

    const planet = document.createElement('div');
    planet.className = 'planet';
    planet.setAttribute('data-index', index);
    planet.style.animationDuration = orbitDuration + 's';

    const pos = planetPositions[index % planetPositions.length];
    if (pos.top !== undefined) planet.style.top = pos.top;
    if (pos.bottom !== undefined) planet.style.bottom = pos.bottom;
    if (pos.left !== undefined) planet.style.left = pos.left;
    if (pos.right !== undefined) planet.style.right = pos.right;

    const glow = document.createElement('div');
    glow.className = 'planet-glow';
    glow.style.setProperty('--planet-color', planetColors[index % planetColors.length]);

    const planetSizes = [0.84, 1.2, 1.56, 1.02]; // 原值放大20%
    const sizeScale = planetSizes[index % planetSizes.length] * (isMobile ? 0.8 : 1);
    glow.style.transform = 'scale(' + sizeScale + ')';

    const label = document.createElement('span');
    label.className = 'planet-label';
    label.textContent = name || '';

    planet.appendChild(glow);
    planet.appendChild(label);
    orbit.appendChild(planet);

    planet.addEventListener('click', function (e) {
      e.stopPropagation();
      const clickedIndex = parseInt(this.getAttribute('data-index'));
      openPlanetGallery(clickedIndex);
    });

    galaxyOrbits.appendChild(orbit);
  }

  /* ===== 漂浮图片布局 — 正中屏幕空间，略带重叠 ===== */
  function calculateFloatingPositions(count, viewportW, viewportH, isMobile) {
    const positions = [];
    const imgW = isMobile ? 110 : 140;
    const imgH = imgW * 4 / 3;

    // 中心点
    const cx = viewportW / 2 - imgW / 2;
    const cy = viewportH / 2 - imgH / 2;

    if (count === 1) {
      positions.push({ x: cx, y: cy });
      return positions;
    }

    // 所有图片集中在正中央，不重叠方便点击
    const radiusX = imgW * 1.4;
    const radiusY = imgH * 1.1;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const rFactor = 0.5 + Math.random() * 0.6;
      const x = cx + Math.cos(angle) * radiusX * rFactor + (Math.random() - 0.5) * imgW * 0.3;
      const y = cy + Math.sin(angle) * radiusY * rFactor + (Math.random() - 0.5) * imgH * 0.25;

      positions.push({
        x: Math.max(10, Math.min(viewportW - imgW - 10, x)),
        y: Math.max(10, Math.min(viewportH - imgH - 10, y))
      });
    }

    return positions;
  }

  async function openPlanetGallery(planetIndex) {
    currentPlanetIndex = planetIndex;

    if (!portfolioData || !portfolioData[planetIndex] || portfolioData[planetIndex].images.length === 0) {
      const planetEl = document.querySelector('.planet[data-index="' + planetIndex + '"]');
      const name = planetEl ? planetEl.querySelector('.planet-label').textContent : ('星迹 ' + String(planetIndex + 1).padStart(2, '0'));
      alert(name + ' 还没有图片，去编辑页面添加吧！');
      return;
    }

    const planet = portfolioData[planetIndex];
    const images = planet.images;

    modalLabel.textContent = planet.name || ('星迹 ' + String(planetIndex + 1).padStart(2, '0'));

    resizeModalStarCanvas();

    const planetElement = document.querySelector('.planet[data-index="' + planetIndex + '"]');
    if (planetElement) {
      const pos = getPlanetScreenPos(planetElement);
      createScatterParticles(pos.x, pos.y, 80);

      if (scatterAnimId) cancelAnimationFrame(scatterAnimId);
      scatterAnimId = requestAnimationFrame(drawScatter);
    }

    floatingContainer.innerHTML = '';
    floatingImages = [];

    const viewportW = galaxyModal.clientWidth;
    const viewportH = window.innerHeight;
    const isMobile = window.innerWidth < 768;

    const positions = calculateFloatingPositions(images.length, viewportW, viewportH, isMobile);

    for (let i = 0; i < images.length; i++) {
      const imgData = images[i];
      // 兼容多种 Supabase 返回格式
      let src = null;
      if (typeof imgData === 'string') {
        src = sb.getImageUrl(imgData);
      } else if (imgData && typeof imgData === 'object') {
        src = imgData.url || imgData.publicUrl || imgData.image_url ||
              (imgData.path ? sb.getImageUrl(imgData.path) : null) ||
              (imgData.file_path ? sb.getImageUrl(imgData.file_path) : null);
      }
      if (!src) continue;

      const wrapper = document.createElement('div');
      wrapper.className = 'floating-image';
      wrapper.style.left = positions[i].x + 'px';
      wrapper.style.top = positions[i].y + 'px';
      wrapper.dataset.float = ((i % 6) + 1);

      wrapper.addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelectorAll('.floating-image.tapped').forEach(function (el) {
          if (el !== wrapper) el.classList.remove('tapped');
        });
        wrapper.classList.toggle('tapped');
      });

      const img = document.createElement('img');
      img.src = src;
      img.alt = '旅行记录';

      const sparkle1 = document.createElement('div');
      sparkle1.className = 'star-sparkle';
      sparkle1.style.top = '10%';
      sparkle1.style.left = '15%';
      sparkle1.style.animationDelay = (Math.random() * 2) + 's';

      const sparkle2 = document.createElement('div');
      sparkle2.className = 'star-sparkle';
      sparkle2.style.top = '80%';
      sparkle2.style.right = '10%';
      sparkle2.style.animationDelay = (Math.random() * 2 + 1) + 's';

      const sparkle3 = document.createElement('div');
      sparkle3.className = 'star-sparkle';
      sparkle3.style.top = '50%';
      sparkle3.style.left = '5%';
      sparkle3.style.animationDelay = (Math.random() * 2 + 0.5) + 's';

      wrapper.appendChild(img);
      wrapper.appendChild(sparkle1);
      wrapper.appendChild(sparkle2);
      wrapper.appendChild(sparkle3);

      floatingContainer.appendChild(wrapper);
      floatingImages.push(wrapper);
    }

    galaxyModal.classList.add('active');

    floatingImages.forEach(function (el, idx) {
      setTimeout(function () {
        el.classList.add('active');
      }, 100 + idx * 150);
    });
  }

  function closeModal() {
    galaxyModal.classList.remove('active');
    if (scatterAnimId) {
      cancelAnimationFrame(scatterAnimId);
      scatterAnimId = null;
    }
    modalStarCtx.clearRect(0, 0, modalStarCanvas.width, modalStarCanvas.height);
    scatterParticles = [];

    floatingImages.forEach(function (el) {
      if (el && el.classList) {
        el.classList.remove('active');
        el.classList.remove('tapped');
      }
    });

    setTimeout(function () {
      floatingContainer.innerHTML = '';
      floatingImages = [];
    }, 600);
  }

  modalClose.addEventListener('click', closeModal);
  modalBg.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  window.addEventListener('resize', function () {
    if (galaxyModal.classList.contains('active')) {
      resizeModalStarCanvas();
    }
  });

  function renderPlanets() {
    galaxyOrbits.innerHTML = '';

    const planetCount = (portfolioData && portfolioData.length > 0) ? portfolioData.length : 4;

    for (let i = 0; i < planetCount; i++) {
      const name = (portfolioData && portfolioData[i] && portfolioData[i].name)
        ? portfolioData[i].name
        : '';
      createPlanet(i, name);
    }
  }

  /* ===== Supabase 数据加载 ===== */
  async function loadFromSupabase() {
    const params = new URLSearchParams(window.location.search);
    let slug = params.get('user');

    // 没有 URL slug 时，尝试从 localStorage 加载用户自己的数据
    if (!slug) {
      const savedSlug = localStorage.getItem('my_galaxy_slug');
      if (savedSlug) {
        slug = savedSlug;
      }
    }

    if (!slug) {
      // 真的没有数据，显示默认4个星球
      renderPlanets();
      return;
    }

    try {
      // 加载 profile
      const { data: profile, error: profileError } = await sb.getProfile(slug);
      if (profileError || !profile) {
        console.warn('未找到用户数据:', slug);
        renderPlanets();
        return;
      }

      // 设置头像
      if (profile.avatar_url) {
        const avatarImg = document.getElementById('avatar-img');
        if (avatarImg) avatarImg.src = profile.avatar_url;
      }

      // 设置社交链接
      const socialIcons = document.querySelectorAll('.social-icon');
      socialIcons.forEach(function (icon) {
        const title = icon.getAttribute('title').toLowerCase();
        if (title === 'instagram' && profile.ig_link) {
          icon.setAttribute('href', profile.ig_link);
        } else if (title === 'rednote' && profile.xhs_link) {
          icon.setAttribute('href', profile.xhs_link);
        } else if (title === 'douyin' && profile.dy_link) {
          icon.setAttribute('href', profile.dy_link);
        }
      });

      // 设置 Space ID（如果 profile 中有）
      if (profile.space_id) {
        const idLabel = document.getElementById('id-label');
        if (idLabel) idLabel.textContent = profile.space_id;
        localStorage.setItem('space_id_' + slug, profile.space_id);
      }

      // 加载星球数据
      const { data: planets, error: planetsError } = await sb.getPlanets(slug);
      if (!planetsError && planets && planets.length > 0) {
        portfolioData = planets.map(function (p) {
          return {
            name: p.name || '',
            images: normalizeImages(p.images)
          };
        });
      } else {
        portfolioData = [];
      }

      renderPlanets();

      // 更新欢迎语
      const welcomeText = document.getElementById('welcome-text');
      if (welcomeText) {
        welcomeText.textContent = '探索TA的星际旅程吧！✨';
      }

    } catch (err) {
      console.error('加载 Supabase 数据失败:', err);
      renderPlanets();
    }
  }

  loadFromSupabase();

  /* ===== 火箭跟随鼠标/手指 + 发光尾迹 ===== */
  (function () {
    const hero = document.getElementById('hero');
    const rocket = document.querySelector('.rocket-wrap');

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isActive = false;

    const rocketOffsetX = 24;
    const rocketOffsetY = 32;

    // —— 尾迹画布 ——
    const trailCanvas = document.createElement('canvas');
    trailCanvas.className = 'rocket-trail-canvas';
    hero.appendChild(trailCanvas);
    const tCtx = trailCanvas.getContext('2d');
    const trailPoints = [];
    const MAX_TRAIL = 28;

    function resizeTrail() {
      trailCanvas.width = hero.clientWidth;
      trailCanvas.height = hero.clientHeight;
    }

    // —— 初始位置 ——
    function initRocketPos() {
      const heroW = hero.clientWidth;
      const heroH = hero.clientHeight;
      currentX = heroW / 2 - rocketOffsetX;
      currentY = heroH * 0.6 - rocketOffsetY;
      targetX = currentX;
      targetY = currentY;
      rocket.style.left = currentX + 'px';
      rocket.style.top = currentY + 'px';
    }

    function getRelativePos(clientX, clientY) {
      const rect = hero.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    }

    // —— 事件 ——
    hero.addEventListener('mousemove', function (e) {
      const pos = getRelativePos(e.clientX, e.clientY);
      targetX = pos.x - rocketOffsetX;
      targetY = pos.y - rocketOffsetY;
      isActive = true;
    });

    hero.addEventListener('mouseleave', function () {
      isActive = false;
    });

    hero.addEventListener('touchmove', function (e) {
      const touch = e.touches[0];
      const pos = getRelativePos(touch.clientX, touch.clientY);
      targetX = pos.x - rocketOffsetX;
      targetY = pos.y - rocketOffsetY;
      isActive = true;
    }, { passive: true });

    hero.addEventListener('touchend', function () {
      isActive = false;
    }, { passive: true });

    function clamp(val, min, max) {
      return Math.max(min, Math.min(val, max));
    }

    // —— 绘制尾迹 ——
    function drawTrail() {
      tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

      const len = trailPoints.length;
      if (len < 2) return;

      // 颜色：从青蓝渐变到紫
      const colors = [
        { r: 136, g: 204, b: 255 },  // 亮青
        { r: 100, g: 180, b: 255 },  // 天蓝
        { r: 80, g: 130, b: 255 },   // 中蓝
        { r: 120, g: 80, b: 230 },   // 蓝紫
        { r: 80, g: 40, b: 180 },    // 紫
      ];

      for (let i = 0; i < len; i++) {
        const t = i / len; // 0 ~ 1
        const alpha = t * 0.55;

        // 按进度取色
        const ci = Math.min(t * (colors.length - 1), colors.length - 2);
        const c0 = colors[Math.floor(ci)];
        const c1 = colors[Math.ceil(ci)];
        const cf = ci - Math.floor(ci);
        const r = Math.round(c0.r + (c1.r - c0.r) * cf);
        const g = Math.round(c0.g + (c1.g - c0.g) * cf);
        const b = Math.round(c0.b + (c1.b - c0.b) * cf);

        const size = 3 + t * 14;

        const grad = tCtx.createRadialGradient(
          trailPoints[i].x, trailPoints[i].y, 0,
          trailPoints[i].x, trailPoints[i].y, size
        );
        grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')');
        grad.addColorStop(0.35, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.5) + ')');
        grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');

        tCtx.fillStyle = grad;
        tCtx.beginPath();
        tCtx.arc(trailPoints[i].x, trailPoints[i].y, size, 0, Math.PI * 2);
        tCtx.fill();
      }

      // 最旧的点再画一层微弱光晕（拖尾更长）
      if (len > 5) {
        const last = trailPoints[0];
        const hazeSize = 20;
        const hazeGrad = tCtx.createRadialGradient(
          last.x, last.y, 0,
          last.x, last.y, hazeSize
        );
        hazeGrad.addColorStop(0, 'rgba(80, 120, 255, 0.08)');
        hazeGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
        tCtx.fillStyle = hazeGrad;
        tCtx.beginPath();
        tCtx.arc(last.x, last.y, hazeSize, 0, Math.PI * 2);
        tCtx.fill();
      }
    }

    // —— 动画循环 ——
    function animateRocket() {
      if (isActive) {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;

        const heroW = hero.clientWidth;
        const heroH = hero.clientHeight;
        const clampedX = clamp(currentX, 0, heroW - rocketOffsetX * 2);
        const clampedY = clamp(currentY, 0, heroH - rocketOffsetY * 2);

        rocket.style.left = clampedX + 'px';
        rocket.style.top = clampedY + 'px';

        // 记录尾迹点（火箭中心）
        trailPoints.push({
          x: clampedX + rocketOffsetX,
          y: clampedY + rocketOffsetY,
        });
        if (trailPoints.length > MAX_TRAIL) {
          trailPoints.shift();
        }
      }

      drawTrail();
      requestAnimationFrame(animateRocket);
    }

    resizeTrail();
    initRocketPos();
    requestAnimationFrame(animateRocket);

    window.addEventListener('resize', function () {
      resizeTrail();
      if (!isActive) {
        initRocketPos();
      }
    });
  })();

  /* ===== 一、星际身份卡 ===== */
  (function () {
    const label = document.getElementById('id-label');
    const copyBtn = document.getElementById('id-copy-btn');
    const icon = document.getElementById('id-copy-icon');
    const check = document.getElementById('id-copy-check');

    // 获取 SPACE ID（优先从 Supabase profile/localStorage，默认 SPACE-134340）
    function getSpaceId() {
      // 从 URL slug 获取（访客模式）
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('user');
      if (slug) {
        // Supabase 加载完成后会通过 loadFromSupabase 更新 ID
        return localStorage.getItem('space_id_' + slug) || 'SPACE-134340';
      }
      // 编辑保存后存到 localStorage 的 ID
      let stored = localStorage.getItem('space_id');
      if (stored) return stored;
      // 默认
      return 'SPACE-134340';
    }

    const spaceId = getSpaceId();
    label.textContent = spaceId;

    // 复制功能
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(spaceId).catch(function () {
          // fallback
          copyFallback(spaceId);
        });
      } else {
        copyFallback(spaceId);
      }

      // 视觉反馈
      icon.classList.add('hide');
      check.classList.add('show');
      copyBtn.title = '坐标已复制！';

      setTimeout(function () {
        icon.classList.remove('hide');
        check.classList.remove('show');
        copyBtn.title = '复制我的星际坐标';
      }, 2000);
    });

    function copyFallback(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  })();

  /* ===== 二、星际坐标探测仪 + 三、隐藏彩蛋 ===== */
  (function () {
    const input = document.getElementById('detector-input');
    const btn = document.getElementById('detector-btn');
    const msg = document.getElementById('detector-msg');
    const result = document.getElementById('detector-result');
    const neon = document.getElementById('detector-neon');
    const hero = document.getElementById('hero');

    let isSearching = false;
    let starWarpActive = false;
    let warpTimeout = null;
    let currentSearchedFriend = null;
    let isConnecting = false;
    let collisionPlaying = false;
    let lastConnectAttempt = 0;
    var CONNECT_DEBOUNCE_MS = 800;

    // 获取自己的 ID
    const myId = document.getElementById('id-label').textContent;

    const friendModal = document.getElementById('friend-profile-modal');
    const friendModalBg = document.getElementById('friend-profile-bg');
    const friendModalClose = document.getElementById('friend-profile-close');
    const friendProfileAvatar = document.getElementById('friend-profile-avatar');
    const friendProfileId = document.getElementById('friend-profile-id');
    const friendProfileHint = document.getElementById('friend-profile-hint');
    const friendGalaxyWrap = document.getElementById('friend-profile-galaxy');
    const friendGalaxyCanvas = document.getElementById('friend-galaxy-canvas');
    const friendGalaxyOrbits = document.getElementById('friend-galaxy-orbits');
    const friendConnectBtn = document.getElementById('friend-connect-btn');
    const friendDisconnectBtn = document.getElementById('friend-disconnect-btn');
    const collisionOverlay = document.getElementById('planet-collision-overlay');
    const collisionCanvas = document.getElementById('collision-canvas');
    const collisionCaption = document.getElementById('collision-caption');
    const friendPlanetsOrbit = document.getElementById('friend-planets-orbit');

    const friendPlanetColors = ['#88ccff', '#ff88cc', '#88ffaa', '#ffcc88', '#ff8888', '#88ffcc', '#cc88ff', '#ffcc66'];

    // hero 区已连接好友行星集合（key=slug）
    let connectedFriends = {};

    // 星轨粒子系统
    let galaxyParticles = [];
    let galaxyTime = 0;
    let galaxyAnimId = null;

    function getMySlug() {
      return localStorage.getItem('my_galaxy_slug');
    }

    // ===== hero 区好友星星管理 =====
    function computeFriendStarPosition(index, total) {
      const orbit = friendPlanetsOrbit;
      if (!orbit) return { left: '50%', top: '50%' };
      const rect = orbit.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      // 星星散布在整个 hero 区域，偏向上方
      const radiusX = Math.min(rect.width * 0.42, 300);
      const radiusY = Math.min(rect.height * 0.35, 240);
      const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
      // 随机偏移让星星不那么整齐
      const jitterX = ((Math.sin(index * 3.7) * 30) + (Math.cos(index * 2.1) * 25));
      const jitterY = ((Math.cos(index * 1.7) * 20) + (Math.sin(index * 4.3) * 15));
      const px = cx + Math.cos(angle) * radiusX + jitterX;
      const py = cy + Math.sin(angle) * radiusY + jitterY;
      return {
        left: (px / rect.width * 100) + '%',
        top: (py / rect.height * 100) + '%'
      };
    }

    function renderFriendPlanet(friendData) {
      if (!friendPlanetsOrbit) return;
      if (!friendData || !friendData.slug) return;
      if (friendPlanetsOrbit.querySelector('[data-friend-slug="' + friendData.slug + '"]')) return;

      const node = document.createElement('div');
      node.className = 'friend-star-node';
      node.setAttribute('data-friend-slug', friendData.slug);
      node.title = '点击查看「' + (friendData.space_id || friendData.id) + '」';
      node.style.setProperty('--star-color', friendData.planetColor || '#88ccff');

      const total = Object.keys(connectedFriends).length + 1;
      const pos = computeFriendStarPosition(Object.keys(connectedFriends).length, total);
      node.style.left = pos.left;
      node.style.top = pos.top;

      node.addEventListener('click', function () {
        if (friendModal && friendData) {
          openFriendProfile(Object.assign({}, friendData, { isConnected: true }));
        }
      });

      friendPlanetsOrbit.appendChild(node);
      connectedFriends[friendData.slug] = friendData;

      repositionFriendPlanets();
    }

    function removeFriendPlanet(friendSlug) {
      if (!friendPlanetsOrbit || !friendSlug) return;
      const node = friendPlanetsOrbit.querySelector('[data-friend-slug="' + friendSlug + '"]');
      if (node) node.remove();
      delete connectedFriends[friendSlug];
      repositionFriendPlanets();
    }

    function repositionFriendPlanets() {
      if (!friendPlanetsOrbit) return;
      const nodes = friendPlanetsOrbit.querySelectorAll('.friend-star-node');
      const total = nodes.length;
      nodes.forEach(function (node, i) {
        const pos = computeFriendStarPosition(i, total);
        node.style.left = pos.left;
        node.style.top = pos.top;
      });
    }

    // 将原始 planets（按索引）转成 portfolio 格式，
    // includeAll=false 时仅返回公开那颗，true 时返回所有星球（已连接用户使用）
    function buildFriendPortfolio(planets, publicPlanetIndex, includeAll) {
      if (!planets || planets.length === 0) return [];
      const hasPublic = publicPlanetIndex !== null && publicPlanetIndex !== undefined &&
        publicPlanetIndex >= 0 && publicPlanetIndex < planets.length;
      const normalizedPlanets = planets.map(function (p) {
        return {
          name: p.name || '',
          images: normalizeImages(p.images)
        };
      });
      if (includeAll) {
        return normalizedPlanets;
      }
      if (hasPublic) {
        // 未连接时只返回公开那颗
        return [normalizedPlanets[publicPlanetIndex]];
      }
      return [];
    }

    // ===== 好友星系星轨动画 =====
    function initGalaxyParticles() {
      galaxyParticles = [];
      const count = 80;
      const wrapW = friendGalaxyCanvas.width || 300;
      const wrapH = friendGalaxyCanvas.height || 220;
      const cx = wrapW / 2;
      const cy = wrapH / 2;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const arm = Math.floor(Math.random() * 3);
        const armAngle = arm * (Math.PI * 2 / 3);
        const dist = 20 + Math.random() * (Math.min(cx, cy) * 0.85);
        const spiralAngle = dist * 0.02;

        galaxyParticles.push({
          angle: armAngle + spiralAngle + (Math.random() - 0.5) * 0.8,
          dist: dist,
          size: 1 + Math.random() * 2,
          speed: 0.0003 + Math.random() * 0.0005,
          hue: 200 + Math.random() * 60,
          brightness: 0.3 + Math.random() * 0.5,
        });
      }
    }

    function drawGalaxyOrbits() {
      if (!friendGalaxyCanvas) return;
      const ctx = friendGalaxyCanvas.getContext('2d');
      const wrapW = friendGalaxyCanvas.width;
      const wrapH = friendGalaxyCanvas.height;
      
      ctx.clearRect(0, 0, wrapW, wrapH);
      const cx = wrapW / 2;
      const cy = wrapH / 2;

      galaxyParticles.forEach(function (p) {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.dist;
        const y = cy + Math.sin(p.angle) * p.dist;

        const twinkle = 0.5 + 0.5 * Math.sin(galaxyTime * 0.002 + p.dist * 0.1);
        const alpha = p.brightness * twinkle;

        ctx.fillStyle = `hsl(${p.hue}, 70%, ${70 + twinkle * 30}%)`;
        ctx.globalAlpha = alpha;
        ctx.fillRect(Math.round(x), Math.round(y), p.size, p.size);
      });
      ctx.globalAlpha = 1;

      galaxyTime += 16;
      galaxyAnimId = requestAnimationFrame(drawGalaxyOrbits);
    }

    function startGalaxyAnimation() {
      if (!friendGalaxyCanvas || !friendGalaxyWrap) return;
      friendGalaxyCanvas.width = friendGalaxyWrap.clientWidth;
      friendGalaxyCanvas.height = friendGalaxyWrap.clientHeight;
      
      if (galaxyAnimId) cancelAnimationFrame(galaxyAnimId);
      initGalaxyParticles();
      galaxyAnimId = requestAnimationFrame(drawGalaxyOrbits);
    }

    function stopGalaxyAnimation() {
      if (galaxyAnimId) {
        cancelAnimationFrame(galaxyAnimId);
        galaxyAnimId = null;
      }
    }

    function createFriendPlanet(index, planetItem, totalCount) {
      const orbit = document.createElement('div');
      orbit.className = 'orbit';

      const baseOrbit = 160;
      const orbitSize = baseOrbit + index * 60;
      const orbitDuration = 20 + index * 10;
      orbit.style.width = orbitSize + 'px';
      orbit.style.height = orbitSize + 'px';
      orbit.style.animationDuration = orbitDuration + 's';

      const planet = document.createElement('div');
      planet.className = 'planet';
      planet.style.animationDuration = orbitDuration + 's';

      // 角度均匀分布，避免重叠
      const angleStep = (Math.PI * 2) / Math.max(totalCount, 1);
      const planetAngle = index * angleStep - Math.PI / 2;
      const orbitRadius = orbitSize / 2;
      const planetOffsetX = Math.cos(planetAngle) * (orbitRadius - 25);
      const planetOffsetY = Math.sin(planetAngle) * (orbitRadius - 25);

      planet.style.transform = `translate(${planetOffsetX}px, ${planetOffsetY}px)`;
      planet.style.left = '50%';
      planet.style.top = '50%';
      planet.style.marginLeft = '-' + planetOffsetX + 'px';
      planet.style.marginTop = '-' + planetOffsetY + 'px';

      const glow = document.createElement('div');
      glow.className = 'planet-glow';
      glow.style.setProperty('--planet-color', friendPlanetColors[index % friendPlanetColors.length]);
      glow.style.transform = 'scale(' + (0.7 + index * 0.05) + ')';

      const label = document.createElement('span');
      label.className = 'planet-label';
      label.textContent = (planetItem && planetItem.name) || '';

      planet.appendChild(glow);
      planet.appendChild(label);
      orbit.appendChild(planet);
      friendGalaxyOrbits.appendChild(orbit);

      // 点击行星 → 打开该星球的图片画廊
      planet.addEventListener('click', function (e) {
        e.stopPropagation();
        openFriendPlanetGallery(index);
      });
    }

    function renderFriendGalaxy(portfolio) {
      friendGalaxyOrbits.innerHTML = '';
      const planetCount = (portfolio && portfolio.length > 0) ? portfolio.length : 4;
      for (let i = 0; i < planetCount; i++) {
        const item = (portfolio && portfolio[i]) ? portfolio[i] : { name: '' };
        createFriendPlanet(i, item, planetCount);
      }
    }

    // ===== 好友星球图片画廊（复用主页散点图片机制） =====
    function openFriendPlanetGallery(planetIndex) {
      // 重要：必须使用 currentSearchedFriend.portfolio，因为它就是当前页面上
      // 实际渲染给用户点击的行星数据，保证索引严格对齐（避免点A星看B星）
      const currentPortfolio = currentSearchedFriend && currentSearchedFriend.portfolio
        ? currentSearchedFriend.portfolio
        : [];

      if (!currentPortfolio || !currentPortfolio[planetIndex] ||
          !currentPortfolio[planetIndex].images ||
          currentPortfolio[planetIndex].images.length === 0) {
        // 该星球还没有图片
        const name = currentPortfolio[planetIndex] && currentPortfolio[planetIndex].name
          ? currentPortfolio[planetIndex].name
          : ('星迹 ' + String(planetIndex + 1).padStart(2, '0'));
        alert('「' + name + '」暂时还没有图片');
        return;
      }

      const planet = currentPortfolio[planetIndex];
      const images = planet.images;

      modalLabel.textContent = planet.name || ('星迹 ' + String(planetIndex + 1).padStart(2, '0'));
      resizeModalStarCanvas();

      // 启动散点粒子动画（从好友模态的中心位置扩散）
      const sourceRect = friendGalaxyWrap.getBoundingClientRect ?
        friendGalaxyWrap.getBoundingClientRect() :
        { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
      createScatterParticles(
        sourceRect.left + (sourceRect.width || 0) / 2,
        sourceRect.top + (sourceRect.height || 0) / 2,
        80
      );
      if (scatterAnimId) cancelAnimationFrame(scatterAnimId);
      scatterAnimId = requestAnimationFrame(drawScatter);

      // 生成漂浮图片
      floatingContainer.innerHTML = '';
      floatingImages = [];

      const viewportW = galaxyModal.clientWidth;
      const viewportH = window.innerHeight;
      const isMobile = window.innerWidth < 768;
      const positions = calculateFloatingPositions(images.length, viewportW, viewportH, isMobile);

      for (let i = 0; i < images.length; i++) {
        const imgData = images[i];
        // 兼容多种 Supabase 返回格式：字符串路径、{url, path}、{publicUrl}、{file_path} 等
        let src = null;
        if (typeof imgData === 'string') {
          src = sb.getImageUrl(imgData);
        } else if (imgData && typeof imgData === 'object') {
          src = imgData.url || imgData.publicUrl || imgData.image_url ||
                (imgData.path ? sb.getImageUrl(imgData.path) : null) ||
                (imgData.file_path ? sb.getImageUrl(imgData.file_path) : null);
        }
        if (!src) continue;

        const wrapper = document.createElement('div');
        wrapper.className = 'floating-image';
        wrapper.style.left = positions[i].x + 'px';
        wrapper.style.top = positions[i].y + 'px';
        wrapper.dataset.float = ((i % 6) + 1);

        wrapper.addEventListener('click', function (e) {
          e.stopPropagation();
          document.querySelectorAll('.floating-image.tapped').forEach(function (el) {
            if (el !== wrapper) el.classList.remove('tapped');
          });
          wrapper.classList.toggle('tapped');
        });

        const img = document.createElement('img');
        img.src = src;
        img.alt = planet.name || '图片';
        wrapper.appendChild(img);

        floatingContainer.appendChild(wrapper);
        floatingImages.push(wrapper);
      }

      galaxyModal.classList.add('active');

      // 逐张添加 .active 触发浮入动画（与主页保持一致
      floatingImages.forEach(function (el, idx) {
        setTimeout(function () {
          el.classList.add('active');
        }, 100 + idx * 150);
      });
    }

    function setConnectButtonState(status) {
      // status: 'default' | 'pending' | 'connected' | 'rejected'
      var isConnected = status === 'connected';
      var isPending = status === 'pending';
      var isRejected = status === 'rejected';

      friendConnectBtn.disabled = isConnected || isPending || collisionPlaying;
      friendConnectBtn.classList.toggle('connected', isConnected);
      friendConnectBtn.classList.toggle('pending', isPending);
      friendConnectBtn.classList.toggle('connecting', false);

      if (isConnected) {
        friendConnectBtn.textContent = '✦ 已连接';
      } else if (isPending) {
        friendConnectBtn.textContent = '等待回应...';
      } else if (isRejected) {
        friendConnectBtn.textContent = '✦ 申请连接';
        friendConnectBtn.disabled = false;
      } else {
        friendConnectBtn.textContent = '✦ 申请连接';
      }
    }

    async function checkFriendConnection(friendSlug) {
      const mySlug = getMySlug();
      if (!mySlug || !friendSlug) return false;
      try {
        const { connected, error } = await sb.checkConnection(mySlug, friendSlug);
        if (error) {
          console.warn('检查连接状态失败:', error);
          return false;
        }
        return connected;
      } catch (e) {
        console.warn('检查连接状态异常:', e);
        return false;
      }
    }

    function openFriendProfile(friend) {
      if (!friend || collisionPlaying) return;
      currentSearchedFriend = friend;

      friendProfileAvatar.src = friend.avatar_url || 'imgs/3.svg';
      friendProfileId.textContent = friend.space_id || friend.id;

      if (friend.isConnected && friend.portfolio && friend.portfolio.length > 0) {
        // 已连接 → 显示所有星球的提示
        friendProfileHint.textContent = '✦ 全部 ' + friend.portfolio.length + ' 颗星球，点击可查看图片';
      } else if (friend.portfolio && friend.portfolio.length > 0) {
        // 未连接 → 只显示公开星球提示
        friendProfileHint.textContent = '✦ 公开星球：' + (friend.portfolio[0].name || '未命名') + ' · 点击查看图片';
      } else {
        friendProfileHint.textContent = 'TA 尚未公开星球 · 显示默认星域';
      }

      renderFriendGalaxy(friend.portfolio || []);

      // 检查连接请求状态
      if (!!friend.isConnected) {
        setConnectButtonState('connected');
      } else {
        // 异步检查是否有 pending 请求
        var mySlug = getMySlug();
        if (mySlug && friend.slug) {
          sb.checkMySentRequest(mySlug, friend.slug).then(function (result) {
            if (result.status === 'pending') {
              currentSearchedFriend.pendingRequest = true;
              setConnectButtonState('pending');
            } else if (result.status === 'accepted') {
              currentSearchedFriend.isConnected = true;
              currentSearchedFriend.pendingRequest = false;
              setConnectButtonState('connected');
              // 切换到全部星球
              if (currentSearchedFriend.allPortfolio && currentSearchedFriend.allPortfolio.length > 0) {
                currentSearchedFriend.portfolio = currentSearchedFriend.allPortfolio;
                renderFriendGalaxy(currentSearchedFriend.portfolio);
              }
              // 在 hero 区显示星球
              try { renderFriendPlanet(currentSearchedFriend); } catch (e) {}
              // 如果请求刚被接受且弹窗开着，开始轮询
              startSentRequestPolling();
            } else if (result.status === 'rejected') {
              currentSearchedFriend.pendingRequest = false;
              setConnectButtonState('default');
            } else {
              setConnectButtonState('default');
            }
          }).catch(function () {
            setConnectButtonState('default');
          });
        } else {
          setConnectButtonState('default');
        }
      }

      // 启动星轨动画
      startGalaxyAnimation();

      friendModal.classList.add('active');
      friendModal.setAttribute('aria-hidden', 'false');
    }

    function closeFriendProfile() {
      if (collisionPlaying) return;
      friendModal.classList.remove('active');
      friendModal.setAttribute('aria-hidden', 'true');
      // 停止星轨动画
      stopGalaxyAnimation();
    }

    // ===== 断开连接功能 =====
    async function handleDisconnect() {
      if (!currentSearchedFriend || !currentSearchedFriend.isConnected) return;
      
      const mySlug = getMySlug();
      if (!mySlug) return;

      try {
        // 尝试从 Supabase 删除连接记录
        await sb.deleteConnection(mySlug, currentSearchedFriend.slug);
      } catch (e) {
        console.warn('断开连接失败（可能离线）:', e);
      }

      // 更新状态
      currentSearchedFriend.isConnected = false;
      removeFriendPlanet(currentSearchedFriend.slug);
      setConnectButtonState('default');
      showMsg('已终止与「' + (currentSearchedFriend.space_id || currentSearchedFriend.id) + '」的连接');
    }

    // 绑定断开连接按钮事件
    friendDisconnectBtn.addEventListener('click', handleDisconnect);

    friendModalClose.addEventListener('click', closeFriendProfile);
    friendModalBg.addEventListener('click', closeFriendProfile);

    function playPlanetCollision() {
      return new Promise(function (resolve) {
        // ============ 初始化 ============
        collisionPlaying = true;
        collisionOverlay.classList.add('active');
        collisionOverlay.setAttribute('aria-hidden', 'false');

        if (collisionCaption) {
          collisionCaption.textContent = '星域共振中……';
          collisionCaption._successShown = false;
        }

        const canvas = collisionCanvas;
        if (!canvas) {
          setTimeout(function () {
            collisionOverlay.classList.remove('active');
            collisionPlaying = false;
            resolve();
          }, 300);
          return;
        }

        const ctx = canvas.getContext('2d');
        let animId = null;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const DURATION = 3200;
        const startTime = performance.now();
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        let hasImpactFired = false;
        let particles = [];

        // 颜色：柔和蓝紫系
        const colA = { r: 120, g: 140, b: 230 };
        const colB = { r: 160, g: 130, b: 235 };
        function rgba(c, a) {
          return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
        }

        // 背景星星（60 粒，足够）
        const bgStars = [];
        for (let i = 0; i < 60; i++) {
          bgStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.2 + 0.3,
            phase: Math.random() * Math.PI * 2,
            alpha: 0.3 + Math.random() * 0.5
          });
        }

        function spawnImpactBurst() {
          // 碎片 40 粒（快速扩散带重力）
          for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            particles.push({
              type: 'debris',
              x: cx, y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1, decay: 0.012 + Math.random() * 0.02,
              size: 1.5 + Math.random() * 2.5,
              color: Math.random() < 0.5 ? colA : colB
            });
          }
          // 成滩星星 80 粒（慢速，带闪烁）
          for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.8 + Math.random() * 3;
            particles.push({
              type: 'star',
              x: cx + (Math.random() - 0.5) * 12,
              y: cy + (Math.random() - 0.5) * 12,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1, decay: 0.0015 + Math.random() * 0.0015,
              size: 1.2 + Math.random() * 1.8,
              color: Math.random() < 0.5 ? colA : colB,
              twinkle: Math.random() * Math.PI * 2
            });
          }
          // 十字闪光亮点 30 粒
          for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 10;
            particles.push({
              type: 'sparkle',
              x: cx, y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1, decay: 0.03 + Math.random() * 0.03,
              size: 1 + Math.random() * 1.5
            });
          }
          // 旋转碎片 20 粒
          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            particles.push({
              type: 'shard',
              x: cx, y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 1,
              rot: 0, vrot: (Math.random() - 0.5) * 0.25,
              size: 2 + Math.random() * 4,
              life: 1, decay: 0.008 + Math.random() * 0.008,
              color: Math.random() < 0.5 ? colA : colB
            });
          }
        }

        // 冲击波环（3 层错峰）
        const shockwaves = [];
        function addShockwave(delay) {
          shockwaves.push({ r: 6, life: 1, delay: delay || 0 });
        }

        let flash = 0;

        // 绘制行星（简化版）
        function drawPlanet(x, y, r, color, glow) {
          const glowGrad = ctx.createRadialGradient(x, y, r * 0.3, x, y, r + glow);
          glowGrad.addColorStop(0, rgba(color, 0.45));
          glowGrad.addColorStop(0.5, rgba(color, 0.15));
          glowGrad.addColorStop(1, rgba(color, 0));
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(x, y, r + glow, 0, Math.PI * 2);
          ctx.fill();

          const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
          grad.addColorStop(0, 'rgba(255,255,255,0.8)');
          grad.addColorStop(0.35, rgba(color, 0.75));
          grad.addColorStop(1, rgba(color, 0.15));
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // ============ 主循环 ============
        function frame(now) {
          const elapsed = now - startTime;
          const t = Math.min(elapsed / DURATION, 1);

          // 清画布 + 纯色背景
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'rgba(3, 3, 15, 1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 背景星星
          for (let i = 0; i < bgStars.length; i++) {
            const s = bgStars[i];
            const tw = 0.6 + 0.4 * Math.sin(now * 0.003 + s.phase);
            ctx.globalAlpha = s.alpha * tw;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(s.x, s.y, s.size, s.size);
          }
          ctx.globalAlpha = 1;

          // 阶段
          const APPROACH_END = 0.42;
          const IMPACT_T = 0.43;

          // ======= 1. 飞行接近 =======
          if (t < APPROACH_END) {
            const at = t / APPROACH_END;
            const ease = at < 0.5 ? 2 * at * at : 1 - Math.pow(-2 * at + 2, 2) / 2;
            const p1x = -80 + (cx - (-80)) * ease;
            const p1y = cy;
            const p2x = canvas.width + 80 + (cx - (canvas.width + 80)) * ease;
            const p2y = cy;
            const glow = 14 + at * 22;

            drawPlanet(p1x, p1y, 36, colA, glow);
            drawPlanet(p2x, p2y, 36, colB, glow);

            // 两星之间的连接线，接近时变亮
            if (at > 0.5) {
              ctx.globalAlpha = (at - 0.5) * 1.2;
              ctx.strokeStyle = rgba(colA, 0.3);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p1x + 36, cy);
              ctx.lineTo(p2x - 36, cy);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }

          // ======= 2. 撞击瞬间 =======
          if (t >= APPROACH_END && t < IMPACT_T) {
            if (!hasImpactFired) {
              hasImpactFired = true;
              spawnImpactBurst();
              addShockwave(0);
              addShockwave(0.1);
              addShockwave(0.2);
              flash = 1;
            }
            drawPlanet(cx, cy, 44, colA, 40);
          }

          // ======= 3. 粒子扩散阶段 =======
          if (t >= IMPACT_T) {
            // 单循环更新 + 绘制所有粒子
            for (let i = particles.length - 1; i >= 0; i--) {
              const p = particles[i];

              if (p.type === 'debris') {
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.94; p.vy = p.vy * 0.94 + 0.04;
                p.life -= p.decay;
              } else if (p.type === 'sparkle') {
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.9; p.vy *= 0.9;
                p.life -= p.decay;
              } else if (p.type === 'shard') {
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.96; p.vy = p.vy * 0.96 + 0.15;
                p.rot += p.vrot;
                p.life -= p.decay;
              } else if (p.type === 'star') {
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.985; p.vy *= 0.985;
                const dx = cx - p.x;
                const dy = cy - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 120) {
                  p.vx += (dx / dist) * 0.012;
                  p.vy += (dy / dist) * 0.012;
                } else if (dist < 30) {
                  p.vx += (Math.random() - 0.5) * 0.1;
                  p.vy += (Math.random() - 0.5) * 0.1;
                }
                p.life -= p.decay;
                p.twinkle += 0.06;
              }

              if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
              }

              // 绘制
              if (p.type === 'debris') {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = rgba(p.color, p.life);
                ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), Math.round(p.size), Math.round(p.size));
              } else if (p.type === 'sparkle') {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = 'rgba(255,255,255,' + p.life + ')';
                ctx.fillRect(p.x - p.size, p.y - 0.5, p.size * 2, 1);
                ctx.fillRect(p.x - 0.5, p.y - p.size, 1, p.size * 2);
              } else if (p.type === 'shard') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.globalAlpha = p.life;
                ctx.fillStyle = rgba(p.color, p.life);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
                ctx.restore();
              } else if (p.type === 'star') {
                const tw = 0.5 + 0.5 * Math.sin(p.twinkle);
                ctx.globalAlpha = Math.max(p.life * tw, 0.25);
                ctx.fillStyle = rgba(p.color, p.life * tw);
                ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), Math.round(p.size), Math.round(p.size));
                if (tw > 0.82) {
                  ctx.globalAlpha = p.life * 0.4;
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(Math.round(p.x - p.size * 1.5), Math.round(p.y), Math.round(p.size * 3), 1);
                  ctx.fillRect(Math.round(p.x), Math.round(p.y - p.size * 1.5), 1, Math.round(p.size * 3));
                }
              }
            }
            ctx.globalAlpha = 1;

            // 冲击波环
            for (let i = 0; i < shockwaves.length; i++) {
              const s = shockwaves[i];
              if (s.delay > 0) {
                s.delay -= 1 / 60;
                continue;
              }
              s.r += 8;
              s.life -= 0.02;
              if (s.life > 0) {
                ctx.globalAlpha = s.life * 0.5;
                ctx.strokeStyle = rgba(i % 2 === 0 ? colA : colB, s.life * 0.5);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, s.r, 0, Math.PI * 2);
                ctx.stroke();
              }
            }
            ctx.globalAlpha = 1;

            // 文字切换
            if (t > 0.7 && collisionCaption && !collisionCaption._successShown) {
              collisionCaption.textContent = '连接成功！✨';
              collisionCaption._successShown = true;
            }
          }

          // 全屏闪光衰减
          if (flash > 0.01) {
            ctx.fillStyle = 'rgba(255,255,255,' + (flash * 0.55) + ')';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flash *= 0.88;
          }

          // ======= 结束判定 =======
          if (t < 1) {
            animId = requestAnimationFrame(frame);
          } else {
            if (collisionCaption) collisionCaption.textContent = '连接成功！✨';
            setTimeout(function () {
              if (animId) cancelAnimationFrame(animId);
              collisionOverlay.classList.remove('active');
              collisionOverlay.setAttribute('aria-hidden', 'true');
              collisionPlaying = false;
              resolve();
            }, 600);
          }
        }

        // 启动（带异常保护）
        try {
          requestAnimationFrame(frame);
        } catch (e) {
          collisionOverlay.classList.remove('active');
          collisionPlaying = false;
          resolve();
        }
      });
    }

    async function handleFriendConnect() {
      // ============ 前置校验 ============
      if (isConnecting || collisionPlaying) return;
      if (!currentSearchedFriend) return;
      if (currentSearchedFriend.isConnected) return;
      if (currentSearchedFriend.pendingRequest) return;

      const mySlug = getMySlug();
      if (!mySlug) {
        showMsg('请先前往「编辑我的星系」保存你的主页，再发起连接！', true);
        return;
      }
      if (mySlug === currentSearchedFriend.slug) {
        showMsg('不能连接自己哦！', true);
        return;
      }

      // ============ 发送连接申请 ============
      isConnecting = true;
      setConnectButtonState('pending');

      try {
        const { alreadyPending, error } = await sb.sendConnectionRequest(mySlug, currentSearchedFriend.slug);
        if (error) {
          showMsg('信号发送失败，请稍后重试...', true);
          setConnectButtonState('default');
          isConnecting = false;
          return;
        }
        if (alreadyPending) {
          showMsg('你的连接申请已经发送过啦，请耐心等待对方回应~');
        } else {
          showMsg('📡 连接申请已发送！等待「' + (currentSearchedFriend.space_id || currentSearchedFriend.id) + '」回应...');
        }

        // 标记为 pending 状态
        currentSearchedFriend.pendingRequest = true;

        // 开始轮询申请状态（如果还没开始）
        startSentRequestPolling();

        isConnecting = false;
      } catch (e) {
        console.error('发送申请失败:', e);
        showMsg('信号发送失败，请稍后重试...', true);
        setConnectButtonState('default');
        isConnecting = false;
      }
    }

    // ===== 轮询已发送的申请状态 =====
    let sentRequestPollTimer = null;
    let sentRequestChecked = {};

    function startSentRequestPolling() {
      if (sentRequestPollTimer) return; // 已在轮询

      function poll() {
        var mySlug = getMySlug();
        if (!mySlug) {
          sentRequestPollTimer = setTimeout(poll, 5000);
          return;
        }

        // 检查当前搜索的好友
        if (currentSearchedFriend && currentSearchedFriend.pendingRequest && currentSearchedFriend.slug) {
          sb.checkMySentRequest(mySlug, currentSearchedFriend.slug).then(function (result) {
            if (result.status === 'accepted') {
              // 请求被接受了！
              currentSearchedFriend.isConnected = true;
              currentSearchedFriend.pendingRequest = false;
              setConnectButtonState('connected');

              // 切换到全部星球视图
              if (currentSearchedFriend.allPortfolio && currentSearchedFriend.allPortfolio.length > 0) {
                currentSearchedFriend.portfolio = currentSearchedFriend.allPortfolio;
                renderFriendGalaxy(currentSearchedFriend.portfolio);
              }

              // 在 hero 区显示好友星球
              try { renderFriendPlanet(currentSearchedFriend); } catch (e) {}

              // 播放连接动画
              try {
                collisionPlaying = false; // 确保不会冲突
                playPlanetCollision().then(function () {
                  collisionOverlay.classList.remove('active');
                  collisionOverlay.setAttribute('aria-hidden', 'true');
                  collisionPlaying = false;
                  friendModal.classList.remove('active');
                  friendModal.setAttribute('aria-hidden', 'true');
                }).catch(function () {
                  collisionOverlay.classList.remove('active');
                  collisionOverlay.setAttribute('aria-hidden', 'true');
                  collisionPlaying = false;
                });
              } catch (e) {
                collisionPlaying = false;
              }

              showMsg('✨ 与「' + (currentSearchedFriend.space_id || currentSearchedFriend.id) + '」星域连接成功！');
            } else if (result.status === 'rejected') {
              // 请求被拒绝
              currentSearchedFriend.pendingRequest = false;
              setConnectButtonState('default');
              showMsg('「' + (currentSearchedFriend.space_id || currentSearchedFriend.id) + '」拒绝了你的连接申请', true);
            }
            // pending → 继续等待
          }).catch(function () {});
        }

        // 继续轮询
        sentRequestPollTimer = setTimeout(poll, 3000);
      }

      sentRequestPollTimer = setTimeout(poll, 3000);
    }

    friendConnectBtn.addEventListener('click', handleFriendConnect);

    // ===== 超空间跳跃（星空加速）— 增强版 =====
    function startStarWarp() {
      if (starWarpActive) return;
      starWarpActive = true;
      neon.classList.add('active');

      // --- 1. 闪白特效 ---
      const flash = document.createElement('div');
      flash.className = 'warp-flash';
      document.body.appendChild(flash);
      setTimeout(function () { flash.remove(); }, 400);

      // --- 2. 隧道光晕 ---
      const tunnel = document.createElement('div');
      tunnel.className = 'warp-tunnel-glow';
      document.body.appendChild(tunnel);
      setTimeout(function () { tunnel.remove(); }, 3200);

      // --- 3. 速度线 ---
      for (let i = 0; i < 20; i++) {
        const line = document.createElement('div');
        line.className = 'warp-speed-line';
        line.style.top = (Math.random() * 100) + 'vh';
        line.style.width = (30 + Math.random() * 60) + 'px';
        line.style.setProperty('--dur', (0.5 + Math.random() * 0.8) + 's');
        line.style.setProperty('--delay', (Math.random() * 0.6) + 's');
        document.body.appendChild(line);
        setTimeout(function () { if (line.parentNode) line.remove(); }, 2500);
      }

      // 让星空背景的星星快速横向流逝
      const starfieldCanvas = document.getElementById('starfield');
      if (starfieldCanvas) {
        const ctx = starfieldCanvas.getContext('2d');
        let warpSpeed = 0;
        let warpAnimId = null;

        function doWarp(time) {
          if (!starWarpActive) {
            if (warpAnimId) cancelAnimationFrame(warpAnimId);
            return;
          }
          warpSpeed = Math.min(warpSpeed + 0.8, 25);
          ctx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);

          const colors = ['#ffffff', '#ccddff', '#aaccff', '#88ccff'];
          // 重新绘制星星并横向移动 + 拉伸
          if (window._warpStars && window._warpStars.length > 0) {
            window._warpStars.forEach(function (star) {
              star.x += warpSpeed * (0.3 + star.z * 0.7);
              if (star.x > starfieldCanvas.width + 10) star.x = -10;

              const alpha = star.brightness * (0.3 + 0.7 * Math.sin(time * 0.003 * star.twinkleSpeed + star.twinkleOffset));
              ctx.fillStyle = colors[Math.floor(star.z * colors.length)];
              ctx.globalAlpha = alpha;

              // 星星拉伸（超空间跳跃效果）：随着速度增加，星星被拉长
              const stretch = Math.min(warpSpeed * 0.8, 20);
              const px = Math.round(star.x);
              const py = Math.round(star.y - (scrollY * (0.1 + star.z * 0.4)) % starfieldCanvas.height);
              ctx.fillRect(px, py, star.size * 3 + stretch, star.size);
              // 额外拖尾光晕
              ctx.globalAlpha = alpha * 0.2;
              ctx.fillStyle = '#88ccff';
              ctx.fillRect(px - stretch * 2, py, stretch, star.size);
            });
          }

          ctx.globalAlpha = 1;
          warpAnimId = requestAnimationFrame(doWarp);
        }

        // 保存原始星星数据引用
        if (!window._warpStars) {
          window._warpStars = window._starsData || [];
        }
        if (warpAnimId) cancelAnimationFrame(warpAnimId);
        warpAnimId = requestAnimationFrame(doWarp);
      }

      // 停止超空间（3秒后自动关闭）
      if (warpTimeout) clearTimeout(warpTimeout);
      warpTimeout = setTimeout(function () {
        stopStarWarp();
      }, 3000);
    }

    function stopStarWarp() {
      starWarpActive = false;
      neon.classList.remove('active');
      if (warpTimeout) {
        clearTimeout(warpTimeout);
        warpTimeout = null;
      }
    }

    // ===== 显示消息 =====
    function showMsg(text, isError) {
      msg.textContent = text;
      msg.className = 'detector-msg show' + (isError ? ' error' : '');
    }

    function clearMsg() {
      msg.className = 'detector-msg';
      msg.textContent = '';
    }

    // ===== 显示好友卡片 + 连接线 + 全息增强 =====
    function showFriendCard(friendData) {
      result.innerHTML = '';
      result.className = 'detector-result';

      const card = document.createElement('div');
      card.className = 'friend-card';

      const avatarBtn = document.createElement('button');
      avatarBtn.type = 'button';
      avatarBtn.className = 'friend-avatar-btn';
      avatarBtn.title = '查看 TA 的星域';

      const avatar = document.createElement('img');
      avatar.className = 'friend-avatar';
      avatar.src = friendData.avatar_url || 'imgs/3.svg';
      avatar.alt = '好友头像';

      avatarBtn.appendChild(avatar);
      avatarBtn.addEventListener('click', function () {
        openFriendProfile(friendData);
      });

      const info = document.createElement('div');
      info.className = 'friend-info';

      const idText = document.createElement('div');
      idText.className = 'friend-id-text';
      idText.textContent = friendData.id;

      const planetPreview = document.createElement('div');
      planetPreview.className = 'friend-planet-preview';
      if (friendData.planetName) {
        const dot = document.createElement('span');
        dot.className = 'friend-planet-dot';
        dot.style.setProperty('--dot-color', friendData.planetColor || '#88ccff');
        planetPreview.appendChild(dot);
        planetPreview.appendChild(document.createTextNode(friendData.planetName));
      } else {
        planetPreview.textContent = '✦ 尚未公开星球';
      }

      info.appendChild(idText);
      info.appendChild(planetPreview);
      card.appendChild(avatarBtn);
      card.appendChild(info);

      // --- 全息光柱 ---
      // (CSS ::before 已自动生效)

      // --- 全息底部光晕 ---
      const baseGlow = document.createElement('div');
      baseGlow.className = 'holo-base-glow';
      card.appendChild(baseGlow);

      result.appendChild(card);

      // 延迟显示卡片（全息升起效果）
      setTimeout(function () {
        result.classList.add('show');

        // Glitch闪烁（卡片显示后触发）
        setTimeout(function () {
          card.classList.add('holo-glitch');
          // 短暂glitch后移除
          setTimeout(function () {
            card.classList.remove('holo-glitch');
          }, 2000);
        }, 600);

        // 全息粒子
        createHoloParticles(card);
      }, 100);

      // 创造全息粒子
      function createHoloParticles(container) {
        var particleInterval = setInterval(function () {
          if (!container.parentNode) {
            clearInterval(particleInterval);
            return;
          }
          var p = document.createElement('div');
          p.className = 'holo-particle';
          p.style.left = (10 + Math.random() * 80) + '%';
          p.style.bottom = '0';
          p.style.animationDuration = (1 + Math.random() * 0.8) + 's';
          var hues = [200, 280, 320, 170];
          var h = hues[Math.floor(Math.random() * hues.length)];
          p.style.background = 'hsl(' + h + ', 80%, 70%)';
          p.style.boxShadow = '0 0 8px hsl(' + h + ', 80%, 70%)';
          container.appendChild(p);
          setTimeout(function () {
            if (p.parentNode) p.remove();
          }, 2500);
        }, 300);

        // 5秒后停止生成
        setTimeout(function () {
          clearInterval(particleInterval);
        }, 5000);
      }
    }

    // ===== 绘制连接线 + 流动粒子 =====
    function drawConnectLine() {
      // 移除旧画布
      const old = document.querySelector('.connect-line-canvas');
      if (old) old.remove();

      const canvas = document.createElement('canvas');
      canvas.className = 'connect-line-canvas';
      document.body.appendChild(canvas);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');

      // 起点：用户头像位置
      const avatarFrame = document.querySelector('.pixel-frame');
      // 终点：好友卡片
      const friendCard = document.querySelector('.friend-card');

      if (!avatarFrame || !friendCard) return;

      let startFrame = 0;
      let progress = 0;
      let particleTimer = 0;

      // 流动粒子
      function spawnFlowParticle(sx, sy, mx, my, ex, ey) {
        const particle = document.createElement('div');
        particle.className = 'connect-particle';
        document.body.appendChild(particle);

        const t = Math.random();
        const px = Math.pow(1 - t, 2) * sx + 2 * (1 - t) * t * mx + t * t * ex;
        const py = Math.pow(1 - t, 2) * sy + 2 * (1 - t) * t * my + t * t * ey;

        particle.style.left = px + 'px';
        particle.style.top = py + 'px';
        particle.style.setProperty('--dur', (0.6 + Math.random() * 0.8) + 's');
        // 随机颜色
        var hues = [200, 280, 170, 320];
        var h = hues[Math.floor(Math.random() * hues.length)];
        particle.style.background = 'hsl(' + h + ', 90%, 70%)';
        particle.style.boxShadow = '0 0 12px hsl(' + h + ', 90%, 70%), 0 0 25px hsl(' + h + ', 90%, 50%)';

        setTimeout(function () {
          if (particle.parentNode) particle.remove();
        }, 2000);
      }

      function animateLine() {
        const avatarRect = avatarFrame.getBoundingClientRect();
        const cardRect = friendCard.getBoundingClientRect();

        const startX = avatarRect.left + avatarRect.width / 2;
        const startY = avatarRect.top + avatarRect.height / 2;
        const endX = cardRect.left + cardRect.width / 2;
        const endY = cardRect.top;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        progress = Math.min(progress + 0.02, 1);

        // 贝塞尔曲线
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - 80;
        const drawProgress = easeInOut(progress);

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        const steps = 50;
        const drawSteps = Math.floor(steps * drawProgress);
        for (let i = 1; i <= drawSteps; i++) {
          const t = i / steps;
          const px = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * midX + t * t * endX;
          const py = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * midY + t * t * endY;
          ctx.lineTo(px, py);
        }

        // 发光效果（多层叠加）
        // 外层大光晕
        ctx.shadowColor = 'rgba(136, 204, 255, 0.5)';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = 'rgba(136, 204, 255, 0.15)';
        ctx.lineWidth = 10;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -startFrame * 2;
        ctx.stroke();

        // 中层光晕
        ctx.shadowBlur = 12;
        ctx.strokeStyle = 'rgba(136, 204, 255, 0.3)';
        ctx.lineWidth = 5;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -startFrame * 2;
        ctx.stroke();

        // 线本身
        ctx.shadowBlur = 4;
        ctx.strokeStyle = 'rgba(136, 204, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -startFrame * 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        startFrame++;

        if (progress < 1) {
          // 连线过程中也产生粒子
          particleTimer++;
          if (particleTimer % 3 === 0 && drawSteps > 2) {
            const t = Math.random() * 0.8 + 0.1;
            const px = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * midX + t * t * endX;
            const py = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * midY + t * t * endY;
            const particle = document.createElement('div');
            particle.className = 'connect-particle';
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.setProperty('--dur', '0.8s');
            particle.style.width = '4px';
            particle.style.height = '4px';
            document.body.appendChild(particle);
            setTimeout(function () { if (particle.parentNode) particle.remove(); }, 1500);
          }
          requestAnimationFrame(animateLine);
        } else {
          // --- 连接完成后的持续增强效果 ---
          // 产生流动粒子
          function spawnParticleBurst() {
            if (!document.querySelector('.friend-card') || !document.querySelector('.connect-line-canvas')) {
              // 清除所有残留粒子
              document.querySelectorAll('.connect-particle').forEach(function (el) { el.remove(); });
              return;
            }

            // 沿贝塞尔曲线随机位置生成发光粒子
            const t = Math.random() * 0.9 + 0.05;
            const px2 = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * midX + t * t * endX;
            const py2 = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * midY + t * t * endY;

            const p = document.createElement('div');
            p.className = 'connect-particle';
            p.style.left = px2 + 'px';
            p.style.top = py2 + 'px';
            p.style.setProperty('--dur', (0.8 + Math.random() * 0.6) + 's');
            var hues = [200, 210, 190, 180, 280];
            var h = hues[Math.floor(Math.random() * hues.length)];
            p.style.background = 'hsl(' + h + ', 90%, 70%)';
            p.style.boxShadow = '0 0 15px hsl(' + h + ', 90%, 70%), 0 0 30px hsl(' + h + ', 90%, 50%, 0.5)';
            document.body.appendChild(p);
            setTimeout(function () { if (p.parentNode) p.remove(); }, 2000);

            // 重新检查组件是否还在
            if (document.querySelector('.friend-card') && document.querySelector('.connect-line-canvas')) {
              setTimeout(spawnParticleBurst, 400 + Math.random() * 600);
            }
          }

          // 延迟启动粒子流
          setTimeout(spawnParticleBurst, 500);

          // 持续闪烁动画（增强版）
          function keepGlow() {
            const aRect = avatarFrame.getBoundingClientRect();
            const cRect = friendCard.getBoundingClientRect();
            const sx = aRect.left + aRect.width / 2;
            const sy = aRect.top + aRect.height / 2;
            const ex = cRect.left + cRect.width / 2;
            const ey = cRect.top;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const mx = (sx + ex) / 2;
            const my = (sy + ey) / 2 - 80;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            for (let i = 1; i <= steps; i++) {
              const t = i / steps;
              const px = Math.pow(1 - t, 2) * sx + 2 * (1 - t) * t * mx + t * t * ex;
              const py = Math.pow(1 - t, 2) * sy + 2 * (1 - t) * t * my + t * t * ey;
              ctx.lineTo(px, py);
            }

            const pulse = 0.3 + 0.5 * Math.sin(Date.now() * 0.004);
            // 外层大光晕 - 彩色脉冲
            ctx.shadowColor = 'rgba(136, 204, 255, ' + (0.2 + pulse * 0.4) + ')';
            ctx.shadowBlur = 25;
            ctx.strokeStyle = 'rgba(180, 140, 255, ' + (0.1 + pulse * 0.2) + ')';
            ctx.lineWidth = 12;
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = -Date.now() * 0.008;
            ctx.stroke();

            // 中层光晕
            ctx.shadowBlur = 10;
            ctx.strokeStyle = 'rgba(136, 204, 255, ' + (0.15 + pulse * 0.35) + ')';
            ctx.lineWidth = 5;
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = -Date.now() * 0.008;
            ctx.stroke();

            // 线本身 - 粉蓝光
            ctx.shadowBlur = 5;
            ctx.strokeStyle = 'rgba(136, 204, 255, ' + (0.4 + pulse * 0.5) + ')';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = -Date.now() * 0.008;
            ctx.stroke();
            ctx.shadowBlur = 0;

            if (document.querySelector('.friend-card')) {
              requestAnimationFrame(keepGlow);
            } else {
              canvas.remove();
              document.querySelectorAll('.connect-particle').forEach(function (el) { el.remove(); });
            }
          }
          requestAnimationFrame(keepGlow);
        }
      }

      requestAnimationFrame(animateLine);
    }

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // ===== 像素星星雨（彩蛋烟花）— 增强版 =====
    function createStarRain(count) {
      const container = document.body;
      // 星星
      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'pixel-star';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.setProperty('--dur', (1.5 + Math.random() * 2.5) + 's');
        star.style.setProperty('--delay', (Math.random() * 1.2) + 's');
        star.style.width = (4 + Math.random() * 10) + 'px';
        star.style.height = star.style.width;
        // 随机颜色
        const hues = [45, 180, 280, 320, 120, 60, 220];
        const h = hues[Math.floor(Math.random() * hues.length)];
        star.style.background = 'hsl(' + h + ', 90%, 70%)';
        star.style.boxShadow = '0 0 8px hsla(' + h + ', 90%, 70%, 0.8), 0 0 20px hsla(' + h + ', 90%, 70%, 0.4)';
        container.appendChild(star);

        setTimeout(function () {
          if (star.parentNode) star.remove();
        }, (1.5 + Math.random() * 2.5 + Math.random() * 1.2) * 1000 + 500);
      }

      // 彩色圆点（额外）
      for (let i = 0; i < Math.floor(count * 1.5); i++) {
        const dot = document.createElement('div');
        dot.className = 'pixel-dot';
        dot.style.left = Math.random() * 100 + 'vw';
        dot.style.setProperty('--dur', (1.2 + Math.random() * 2) + 's');
        dot.style.setProperty('--delay', (Math.random() * 1.5) + 's');
        dot.style.width = (2 + Math.random() * 6) + 'px';
        dot.style.height = dot.style.width;
        const hues = [200, 280, 340, 160, 50];
        const h = hues[Math.floor(Math.random() * hues.length)];
        dot.style.background = 'hsl(' + h + ', 90%, 70%)';
        dot.style.boxShadow = '0 0 6px hsla(' + h + ', 90%, 70%, 0.6)';
        container.appendChild(dot);

        setTimeout(function () {
          if (dot.parentNode) dot.remove();
        }, (1.2 + Math.random() * 2 + Math.random() * 1.5) * 1000 + 500);
      }
    }

    // ===== 探测逻辑 =====
    async function doSearch() {
      if (isSearching) return;
      const query = input.value.trim().toUpperCase();
      if (!query) return;
      if (!query.startsWith('SPACE-')) {
        showMsg('⚠️ 请输入正确的ID格式，如 SPACE-XXXX', true);
        input.classList.add('shake');
        setTimeout(function () { input.classList.remove('shake'); }, 500);
        return;
      }

      // 彩蛋1：输入自己的ID
      if (query === myId) {
        showMsg('歪？你已经在我的母星上啦！不需要重复传送哦！给你放个烟花吧！🎆');
        stopStarWarp();
        neon.classList.remove('active');
        result.className = 'detector-result';
        result.innerHTML = '';
        setTimeout(function () {
          createStarRain(60);
        }, 500);
        return;
      }

      isSearching = true;
      btn.disabled = true;

      // 超空间跳跃特效
      startStarWarp();
      showMsg('🚀 侦测到未知的星际波动！正在降落至「' + query + '」的星域……');

      // 从 Supabase 搜索
      try {
        const { data: profile, error } = await sb.getProfileBySpaceId(query);

        if (error || !profile) {
          // 彩蛋2：查无此星
          stopStarWarp();
          showMsg('静电干扰……该星际坐标似乎在一场黑洞中迷失了，请重新输入正确的ID检查吧。呜呜。', true);
          input.classList.add('shake');
          setTimeout(function () { input.classList.remove('shake'); }, 500);
          isSearching = false;
          btn.disabled = false;
          return;
        }

        // 获取公开的星球（带错误保护）
        let planets = [];
        try {
          const { data } = await sb.getPlanets(profile.slug);
          planets = data || [];
        } catch (e) {
          console.warn('获取好友星球失败:', e);
          planets = [];
        }
        const publicIdx = profile.public_planet_index !== null && profile.public_planet_index !== undefined
          ? profile.public_planet_index
          : -1;

        // 保存所有星球的 portfolio（用于已连接时查看全部星球）
        const allPortfolio = buildFriendPortfolio(planets, publicIdx, true);
        // 仅公开那颗
        const publicPortfolio = buildFriendPortfolio(planets, publicIdx, false);

        const isConnected = await checkFriendConnection(profile.slug);

        // 已连接用户 → portfolio 存全部；未连接 → 只存公开那颗
        const displayPortfolio = isConnected ? allPortfolio : publicPortfolio;

        let planetName = '';
        let planetColor = '#88ccff';
        if (publicPortfolio.length > 0) {
          planetName = publicPortfolio[0].name || '未知星球';
          const colors = ['#88ccff', '#ff88cc', '#88ffaa', '#ffcc88', '#ff8888', '#88ffcc', '#cc88ff', '#ffcc66'];
          planetColor = colors[publicIdx >= 0 ? publicIdx % colors.length : 0];
        }

        const friendData = {
          id: query,
          slug: profile.slug,
          space_id: profile.space_id || query,
          avatar_url: profile.avatar_url || 'imgs/3.svg',
          planetName: planetName,
          planetColor: planetColor,
          portfolio: displayPortfolio,     // 当前在主页显示的星球（单颗/全部）
          allPortfolio: allPortfolio,      // 所有星球（供 hero 区行星点击时使用）
          publicPortfolio: publicPortfolio, // 仅公开那颗
          isConnected: isConnected,
        };
        currentSearchedFriend = friendData;

        // 如果已经是连接好友，同时在 hero 区显示对应的行星
        if (isConnected) {
          renderFriendPlanet(friendData);
        }

        // 减速，显示结果
        setTimeout(function () {
          stopStarWarp();
          showMsg('✨ 成功连线「' + query + '」的星域！点击头像查看 TA 的主页');

          showFriendCard(friendData);

          isSearching = false;
          btn.disabled = false;
        }, 1500);

      } catch (err) {
        stopStarWarp();
        showMsg('⚠️ 星域探测信号中断，请稍后重试……', true);
        isSearching = false;
        btn.disabled = false;
        console.error('探测失败:', err);
      }
    }

    // ===== 事件绑定 =====
    btn.addEventListener('click', doSearch);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSearch();
      }
    });

    // 输入时取消状态
    input.addEventListener('input', function () {
      clearMsg();
      result.className = 'detector-result';
      result.innerHTML = '';
      currentSearchedFriend = null;
      stopStarWarp();
      closeFriendProfile();
      const oldCanvas = document.querySelector('.connect-line-canvas');
      if (oldCanvas) oldCanvas.remove();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && collisionPlaying) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && friendModal.classList.contains('active') && !collisionPlaying) {
        closeFriendProfile();
      }
    });

    // 窗口改变时重绘连接线
    window.addEventListener('resize', function () {
      const canvas = document.querySelector('.connect-line-canvas');
      if (canvas && document.querySelector('.friend-card')) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });

    /* ===== 信号接收站模块 ===== */
    (function () {
      const signalStation = document.getElementById('signal-station');
      const signalTrigger = document.getElementById('signal-station-trigger');
      const signalPanel = document.getElementById('signal-station-panel');
      const signalList = document.getElementById('signal-list');
      const signalBadge = document.getElementById('signal-badge');
      const signalPanelClose = document.getElementById('signal-panel-close');

      let pollTimer = null;
      let knownRequestIds = {}; // 已知道的请求ID集合，用于判断新请求
      let pendingRequests = []; // 当前pending请求列表
      let processingRequest = false; // 是否正在处理请求（防止重复点击）

      function getMySlug() {
        return localStorage.getItem('my_galaxy_slug');
      }

      function updateBadge(count) {
        signalBadge.textContent = count > 99 ? '99+' : String(count);
        if (count > 0) {
          signalStation.classList.add('has-signal');
        } else {
          signalStation.classList.remove('has-signal');
        }
      }

      // 渲染单条请求
      function renderRequestItem(req) {
        const item = document.createElement('div');
        item.className = 'signal-item';
        item.setAttribute('data-request-id', req.id);

        const avatar = document.createElement('img');
        avatar.className = 'signal-item-avatar';
        avatar.src = req.from_avatar_url || 'imgs/3.svg';
        avatar.alt = '申请人头像';

        const info = document.createElement('div');
        info.className = 'signal-item-info';

        const idText = document.createElement('div');
        idText.className = 'signal-item-id';
        idText.textContent = req.from_space_id || 'SPACE-????';

        const label = document.createElement('div');
        label.className = 'signal-item-label';
        label.textContent = '请求与你建立星域连接';

        info.appendChild(idText);
        info.appendChild(label);

        const actions = document.createElement('div');
        actions.className = 'signal-item-actions';

        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'signal-accept-btn';
        acceptBtn.type = 'button';
        acceptBtn.textContent = '接受';
        acceptBtn.addEventListener('click', function () {
          handleAcceptRequest(req, item);
        });

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'signal-reject-btn';
        rejectBtn.type = 'button';
        rejectBtn.textContent = '拒绝';
        rejectBtn.addEventListener('click', function () {
          handleRejectRequest(req, item);
        });

        actions.appendChild(acceptBtn);
        actions.appendChild(rejectBtn);

        item.appendChild(avatar);
        item.appendChild(info);
        item.appendChild(actions);

        return item;
      }

      // 渲染请求列表
      function renderRequests(requests) {
        signalList.innerHTML = '';
        if (!requests || requests.length === 0) {
          const empty = document.createElement('p');
          empty.className = 'signal-empty';
          empty.textContent = '暂无未读信号...';
          signalList.appendChild(empty);
        } else {
          requests.forEach(function (req) {
            signalList.appendChild(renderRequestItem(req));
          });
        }
      }

      // 接受请求
      async function handleAcceptRequest(req, item) {
        if (processingRequest) return;
        processingRequest = true;

        const acceptBtn = item.querySelector('.signal-accept-btn');
        const rejectBtn = item.querySelector('.signal-reject-btn');
        if (acceptBtn) acceptBtn.disabled = true;
        if (rejectBtn) rejectBtn.disabled = true;

        const mySlug = getMySlug();
        try {
          // 1. 更新请求状态为 accepted
          await sb.respondToRequest(req.id, 'accepted');

          // 2. 创建 connections 表中的连接
          if (mySlug && req.from_slug) {
            await sb.createConnection(mySlug, req.from_slug);
          }

          // 3. 显示状态
          const actions = item.querySelector('.signal-item-actions');
          if (actions) {
            actions.innerHTML = '<span class="signal-item-status accepted">✦ 已接受</span>';
          }

          // 4. 关闭面板（给一点时间看反馈）
          setTimeout(function () {
            signalPanel.classList.remove('open');
          }, 600);

          // 5. 从列表中移除（稍后重新轮询时会清除）
          delete knownRequestIds[req.id];
          pendingRequests = pendingRequests.filter(function (r) { return r.id !== req.id; });
          updateBadge(pendingRequests.length);
          renderRequests(pendingRequests);

          // 6. 播放连接动画
          try {
            await playPlanetCollision();
          } catch (e) {}

          // 7. 在 hero 区显示申请人星球
          const friendData = {
            slug: req.from_slug,
            space_id: req.from_space_id,
            avatar_url: req.from_avatar_url,
            planetColor: friendPlanetColors[Math.floor(Math.random() * friendPlanetColors.length)],
            isConnected: true,
          };
          try { renderFriendPlanet(friendData); } catch (e) {}
        } catch (e) {
          console.error('处理接受请求失败:', e);
        } finally {
          processingRequest = false;
        }
      }

      // 拒绝请求
      async function handleRejectRequest(req, item) {
        if (processingRequest) return;
        processingRequest = true;

        const acceptBtn = item.querySelector('.signal-accept-btn');
        const rejectBtn = item.querySelector('.signal-reject-btn');
        if (acceptBtn) acceptBtn.disabled = true;
        if (rejectBtn) rejectBtn.disabled = true;

        try {
          await sb.respondToRequest(req.id, 'rejected');

          const actions = item.querySelector('.signal-item-actions');
          if (actions) {
            actions.innerHTML = '<span class="signal-item-status rejected">✕ 已拒绝</span>';
          }
        } catch (e) {
          console.error('处理拒绝请求失败:', e);
        }

        // 延迟后移除
        setTimeout(function () {
          delete knownRequestIds[req.id];
          pendingRequests = pendingRequests.filter(function (r) { return r.id !== req.id; });
          updateBadge(pendingRequests.length);
          renderRequests(pendingRequests);
          if (pendingRequests.length === 0) {
            signalPanel.classList.remove('open');
          }
        }, 800);

        processingRequest = false;
      }

      // 轮询检查新请求
      async function pollRequests() {
        const mySlug = getMySlug();
        if (!mySlug) {
          pollTimer = setTimeout(pollRequests, 5000);
          return;
        }

        try {
          const { data, error } = await sb.getPendingRequests(mySlug);
          if (error || !data) {
            pollTimer = setTimeout(pollRequests, 5000);
            return;
          }

          // 检测新请求
          let hasNew = false;
          data.forEach(function (req) {
            if (!knownRequestIds[req.id]) {
              knownRequestIds[req.id] = true;
              hasNew = true;
            }
          });

          // 移除已不在pending中的旧请求
          const currentIds = {};
          data.forEach(function (req) { currentIds[req.id] = true; });
          Object.keys(knownRequestIds).forEach(function (id) {
            if (!currentIds[id]) {
              delete knownRequestIds[id];
            }
          });

          pendingRequests = data;
          updateBadge(pendingRequests.length);
          renderRequests(pendingRequests);

          // 如果有新请求，自动打开面板
          if (hasNew && data.length > 0) {
            signalPanel.classList.add('open');
            // 新请求时改为更快的轮询
            if (pollTimer) clearTimeout(pollTimer);
            pollTimer = setTimeout(pollRequests, 2000);
            return;
          }
        } catch (e) {
          console.warn('轮询请求失败:', e);
        }

        // 根据请求数量调整轮询间隔
        const interval = pendingRequests.length > 0 ? 2000 : 5000;
        pollTimer = setTimeout(pollRequests, interval);
      }

      // 切换面板
      signalTrigger.addEventListener('click', function () {
        signalPanel.classList.toggle('open');
        // 打开面板时立即刷新一次
        if (signalPanel.classList.contains('open')) {
          if (pollTimer) clearTimeout(pollTimer);
          pollRequests();
        }
      });

      signalPanelClose.addEventListener('click', function () {
        signalPanel.classList.remove('open');
      });

      // 点击面板外的空白区域关闭（面板本身不处理，因为覆盖了整个右侧）
      document.addEventListener('click', function (e) {
        if (signalPanel.classList.contains('open')) {
          if (!signalPanel.contains(e.target) && e.target !== signalTrigger && !signalTrigger.contains(e.target)) {
            signalPanel.classList.remove('open');
          }
        }
      });

      // 立即启动轮询（延迟2秒等页面初始化完成）
      setTimeout(function () {
        pollRequests();
      }, 2000);
    })();
  })();

})();
