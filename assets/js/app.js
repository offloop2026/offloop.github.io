const OWNER = "offloop2026";
const REPO = "offloop2026.github.io";
const BRANCH = "main";
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
const RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

const app = document.getElementById("app");
const cache = { exhibitions:null, archive:null };
let indexData = null;

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

async function fetchIndexJson() {
  if (indexData) return indexData;
  try {
    const res = await fetch("./content/index.json");
    if (res.ok) {
      indexData = await res.json();
      return indexData;
    }
  } catch (e) {
    console.warn("index.json을 불러올 수 없어 GitHub API로 Fallback합니다.", e);
  }
  return null;
}

async function listFiles(folder){
  const res = await fetch(`${API}/${folder}?ref=${BRANCH}`);
  if(!res.ok) throw new Error(`콘텐츠 목록을 불러오지 못했습니다: ${res.status}`);
  const files = await res.json();
  return files.filter(x => x.type === "file" && (x.name.endsWith(".md") || x.name.endsWith(".json")));
}

async function readContentFile(path){
  const res = await fetch(`${RAW}/${path}`);
  if(!res.ok) throw new Error(`콘텐츠를 불러오지 못했습니다: ${path}`);
  const text = await res.text();
  if(path.endsWith(".json")){
    try {
      const data = JSON.parse(text);
      const mappedData = {
        title: data.title || "",
        year: data.year || "",
        category: data.category || "눈자리나게, 이어",
        venue: data.venue || "",
        thumbnail: data.image || data.thumbnail || "",
        gallery: data.gallery || [],
        description: data.description || ""
      };
      return { data: mappedData, body: data.description || "" };
    } catch(e) {
      console.error("JSON parsing error", e);
      return { data: {}, body: text };
    }
  }
  return parseFrontmatter(text);
}

function parseFrontmatter(text){
  const match = text.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if(!match) return {data:{}, body:text};
  let data = {};
  try { data = jsyaml.load(match[1]) || {}; }
  catch(e){ console.error("YAML parsing error", e); }
  return {data, body:match[2].trim()};
}

async function getCollection(type){
  if(cache[type]) return cache[type];
  
  // 1. index.json 로딩 시도
  const index = await fetchIndexJson();
  if (index && index[type]) {
    const entries = index[type].map(entry => {
      const d = entry.data || {};
      const mappedData = {
        title: d.title || "",
        year: d.year || "",
        category: d.category || "눈자리나게, 이어",
        venue: d.venue || "",
        thumbnail: d.image || d.thumbnail || "",
        gallery: d.gallery || [],
        description: d.description || ""
      };
      return {
        slug: entry.slug,
        filename: entry.filename,
        data: mappedData,
        body: entry.body || d.description || ""
      };
    });
    entries.sort((a,b) => String(b.data.year||"").localeCompare(String(a.data.year||"")));
    cache[type] = entries;
    return entries;
  }

  // 2. Fallback: GitHub API 사용
  const folder = type === "exhibitions" ? "content/exhibitions" : "content/archive";
  const files = await listFiles(folder);
  const entries = await Promise.all(files.map(async file => ({
    ...await readContentFile(`${folder}/${file.name}`),
    slug:file.name.replace(/\.(md|json)$/,""),
    filename:file.name
  })));
  entries.sort((a,b) => String(b.data.year||"").localeCompare(String(a.data.year||"")));
  cache[type] = entries;
  return entries;
}

function imageUrl(path){
  if(!path) return "";
  if(path.startsWith("http") || path.startsWith("data:")) return path;
  if(location.hostname === "localhost" || location.hostname === "127.0.0.1"){
    return path.replace(/^\/+/,"");
  }
  return `${RAW}/${path.replace(/^\/+/,"")}`;
}

function card(entry, collection, customStyle=""){
  const d=entry.data;
  const href=`#/work/${collection}/${encodeURIComponent(entry.slug)}`;
  return `<a class="card" href="${href}" style="${customStyle}">
    <div class="card-media">${d.thumbnail ? `<img src="${imageUrl(d.thumbnail)}" alt="${escapeHtml(d.title||"")}" loading="lazy">` : ""}</div>
    <div class="card-info">
      <p class="card-title">${escapeHtml(d.title||"Untitled")}</p>
      <p class="card-meta">${escapeHtml(d.year||"")}</p>
    </div>
  </a>`;
}

function setActiveNav(){
  const hash=location.hash;
  document.querySelectorAll(".nav a").forEach(a=>a.classList.remove("active"));
  if(hash.startsWith("#/about")) document.querySelector('.nav a[href="#/about"]').classList.add("active");
  if(hash.startsWith("#/exhibitions")) document.querySelector('.nav a[href="#/exhibitions"]').classList.add("active");
  if(hash.startsWith("#/archive")) document.querySelector('.nav a[href="#/archive"]').classList.add("active");
}

async function renderHome(){
  app.innerHTML=`<section class="hero"><h1>OFF<br>LOOP</h1></section>`;
}

async function renderAbout(){
  app.innerHTML = '<div class="loading">불러오는 중…</div>';
  try {
    const res = await fetch("./content/about.json");
    if (!res.ok) throw new Error("소개 정보를 찾을 수 없습니다.");
    const data = await res.json();
    const title = data.title || "ABOUT";
    const name = data.name || "OFFLOOP";
    const paragraphs = Array.isArray(data.paragraphs) ? data.paragraphs : [];
    
    app.innerHTML = `<section class="about">
      <h1>${escapeHtml(title)}</h1>
      <div class="about-grid">
        <div>${escapeHtml(name)}</div>
        <div class="about-copy">
          ${paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("")}
        </div>
      </div>
    </section>`;
  } catch (err) {
    console.error(err);
    // Fallback: 기존 하드코딩된 내용 표시
    app.innerHTML = `<section class="about">
      <h1>ABOUT</h1>
      <div class="about-grid">
        <div>OFFLOOP</div>
        <div class="about-copy">
        </div>
      </div>
    </section>`;
  }
}

async function renderExhibitions(){
  const entries=await getCollection("exhibitions");
  app.innerHTML=`<section class="exhibitions-section">
    <div class="page-head"><h1 class="page-title">EXHIBITIONS</h1><p class="page-note">전시 기록</p></div>
    <div class="masonry">${entries.map(x=>card(x,"exhibitions")).join("") || '<p class="empty">아직 등록된 전시가 없습니다.</p>'}</div>
  </section>`;
}

async function renderArchive(category="all"){
  const entries=await getCollection("archive");
  const filtered=category==="all" ? entries : entries.filter(x=>x.data.category===category);
  
  // Dynamic shuffle of works array (Fisher-Yates)
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  const isMobile = window.innerWidth <= 600;
  const isTablet = window.innerWidth > 600 && window.innerWidth <= 1024;
  
  const C = isMobile ? 2 : (isTablet ? 2 : 3);
  const rowHeight = isMobile ? 160 : (isTablet ? 380 : 480);
  
  // Starting offset to let the first row scatter organically without clipping at 0px
  const startOffsetY = isMobile ? 20 : (isTablet ? 30 : 40);
  
  let maxTopY = 0;
  
  const cardsHtml = shuffled.map((x, idx) => {
    let cardWidthPct;
    if (isMobile) {
      cardWidthPct = 40 + Math.random() * 25; // 40% to 65% width
    } else if (isTablet) {
      cardWidthPct = 25 + Math.random() * 18; // 25% to 43%
    } else {
      cardWidthPct = 16 + Math.random() * 18; // 16% to 34%
    }
    
    // Fully randomized horizontal position (clamped to stay inside viewport)
    const leftPct = Math.random() * (100 - cardWidthPct);
    
    // Staggered vertical position with huge scatter range
    const r = Math.floor(idx / C);
    const baseY = r * rowHeight + startOffsetY;
    const scatterRangeY = isMobile ? 110 : (isTablet ? 160 : 240);
    const offsetY = Math.random() * scatterRangeY - (scatterRangeY / 2);
    const topY = Math.max(10, baseY + offsetY);
    
    // Estimate image height in pixels to set container height
    const estimatedHeight = isMobile ? 150 : (isTablet ? 340 : 460); 
    if (topY + estimatedHeight > maxTopY) {
      maxTopY = topY + estimatedHeight;
    }
    
    const zIndex = Math.floor(Math.random() * 50) + 1;
    
    // Apply styling without rotation
    const style = `position: absolute; left: ${leftPct.toFixed(1)}%; top: ${topY.toFixed(0)}px; width: ${cardWidthPct.toFixed(1)}%; z-index: ${zIndex};`;
    return card(x, "archive", style);
  }).join("");

  const containerHeight = Math.max(800, maxTopY + (isMobile ? 80 : 180));

  app.innerHTML=`<section class="archive-section">
    <div class="archive-canvas" style="position: relative; width: 100%; height: ${containerHeight}px;">
      ${cardsHtml || '<p class="empty">이 카테고리에 등록된 작업이 없습니다.</p>'}
    </div>
  </section>`;
}

async function renderDetail(collection, slug){
  const entries=await getCollection(collection);
  const entry=entries.find(x=>x.slug===slug);
  if(!entry) throw new Error("작업을 찾을 수 없습니다.");
  const d=entry.data;
  const gallery=Array.isArray(d.gallery) ? d.gallery : [];
  const images=[d.thumbnail || d.image,...gallery].filter(Boolean);
  const back=collection==="exhibitions" ? "#/exhibitions" : "#/archive";
  app.innerHTML=`<article class="detail">
    <a class="back" href="${back}">← Back</a>
    <div class="detail-head">
      <div><h1 class="detail-title">${escapeHtml(d.title||"Untitled")}</h1></div>
      <div class="detail-meta">
        <p>${escapeHtml(d.year||"")}</p>
        ${d.venue ? `<p>${escapeHtml(d.venue)}</p>`:""}
        ${d.category ? `<p>${escapeHtml(d.category)}</p>`:""}
        <div class="detail-description">${d.description ? marked.parse(String(d.description)) : ""}</div>
      </div>
    </div>
    <div class="gallery">${images.map((src,i)=>`<img src="${imageUrl(src)}" alt="${escapeHtml(d.title||"")}${images.length>1?` ${i+1}`:""}" loading="${i===0?"eager":"lazy"}">`).join("")}</div>
  </article>`;
}

async function router(){
  setActiveNav();
  app.innerHTML='<div class="loading">불러오는 중…</div>';
  try{
    const parts=decodeURIComponent(location.hash.replace(/^#\/?/,"")).split("/").filter(Boolean);
    if(parts.length===0) return renderHome();
    if(parts[0]==="about") return renderAbout();
    if(parts[0]==="exhibitions") return renderExhibitions();
    if(parts[0]==="archive") return renderArchive(parts[1]||"all");
    if(parts[0]==="work" && parts.length>=3) return renderDetail(parts[1],parts.slice(2).join("/"));
    return renderHome();
  }catch(err){
    console.error(err);
    app.innerHTML=`<div class="error"><strong>불러오지 못했습니다.</strong><br>${escapeHtml(err.message)}<br><br>GitHub 저장소가 Public인지, content 폴더가 존재하는지 확인해주세요.</div>`;
  }
}

window.addEventListener("hashchange",router);
router();

// Pull-to-Refresh implementation for Archive page
let startY = 0;
let isPulling = false;
let ptrIndicator = null;
const THRESHOLD = 80;

function handleTouchStart(e) {
  if (!location.hash.startsWith("#/archive")) return;
  if (window.scrollY > 5) return;
  
  const touch = e.touches[0];
  startY = touch.clientY;
  isPulling = true;
  
  if (!ptrIndicator) {
    ptrIndicator = document.createElement("div");
    ptrIndicator.className = "pull-to-refresh-indicator";
    ptrIndicator.innerText = "당겨서 새로고침";
    document.body.appendChild(ptrIndicator);
  }
}

function handleTouchMove(e) {
  if (!isPulling || !ptrIndicator) return;
  if (!location.hash.startsWith("#/archive")) return;
  if (window.scrollY > 5) {
    isPulling = false;
    ptrIndicator.style.top = "-50px";
    ptrIndicator.style.opacity = "0";
    return;
  }
  
  const touch = e.touches[0];
  const diffY = touch.clientY - startY;
  
  if (diffY > 0) {
    if (e.cancelable) e.preventDefault();
    const dragDistance = Math.min(120, diffY);
    ptrIndicator.style.top = `${-40 + dragDistance * 0.5}px`;
    ptrIndicator.style.opacity = `${Math.min(1, dragDistance / THRESHOLD)}`;
    
    if (diffY >= THRESHOLD) {
      ptrIndicator.innerText = "놓아서 새로고침";
      ptrIndicator.classList.add("active");
    } else {
      ptrIndicator.innerText = "당겨서 새로고침";
      ptrIndicator.classList.remove("active");
    }
  } else {
    isPulling = false;
    ptrIndicator.style.top = "-50px";
    ptrIndicator.style.opacity = "0";
  }
}

function handleTouchEnd(e) {
  if (!isPulling || !ptrIndicator) return;
  isPulling = false;
  
  const touch = e.changedTouches[0];
  const diffY = touch.clientY - startY;
  
  if (diffY >= THRESHOLD) {
    ptrIndicator.innerText = "새로고침 중…";
    ptrIndicator.style.top = "16px";
    ptrIndicator.style.opacity = "1";
    
    const parts = decodeURIComponent(location.hash.replace(/^#\/?/,"")).split("/").filter(Boolean);
    const category = parts[1] || "all";
    
    renderArchive(category).then(() => {
      setTimeout(() => {
        if (ptrIndicator) {
          ptrIndicator.style.top = "-50px";
          ptrIndicator.style.opacity = "0";
        }
      }, 400);
    });
  } else {
    ptrIndicator.style.top = "-50px";
    ptrIndicator.style.opacity = "0";
  }
}

window.addEventListener("touchstart", handleTouchStart, { passive: false });
window.addEventListener("touchmove", handleTouchMove, { passive: false });
window.addEventListener("touchend", handleTouchEnd, { passive: false });
