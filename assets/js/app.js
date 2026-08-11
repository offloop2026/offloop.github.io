const OWNER = "offloop2026";
const REPO = "offloop2026.github.io";
const BRANCH = "main";
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
const RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

const app = document.getElementById("app");
const cache = { exhibitions:null, archive:null };

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

async function listMarkdown(folder){
  const res = await fetch(`${API}/${folder}?ref=${BRANCH}`);
  if(!res.ok) throw new Error(`콘텐츠 목록을 불러오지 못했습니다: ${res.status}`);
  const files = await res.json();
  return files.filter(x => x.type === "file" && x.name.endsWith(".md"));
}

async function readMarkdown(path){
  const res = await fetch(`${RAW}/${path}`);
  if(!res.ok) throw new Error(`콘텐츠를 불러오지 못했습니다: ${path}`);
  return parseFrontmatter(await res.text());
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
  const folder = type === "exhibitions" ? "content/exhibitions" : "content/archive";
  const files = await listMarkdown(folder);
  const entries = await Promise.all(files.map(async file => ({
    ...await readMarkdown(`${folder}/${file.name}`),
    slug:file.name.replace(/\.md$/,""),
    filename:file.name
  })));
  entries.sort((a,b) => String(b.data.year||"").localeCompare(String(a.data.year||"")));
  cache[type] = entries;
  return entries;
}

function imageUrl(path){
  if(!path) return "";
  if(path.startsWith("http")) return path;
  return `${RAW}/${path.replace(/^\/+/,"")}`;
}

function card(entry, collection){
  const d=entry.data;
  const href=`#/work/${collection}/${encodeURIComponent(entry.slug)}`;
  return `<a class="card" href="${href}">
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
  const archive=await getCollection("archive");
  const latest=archive.slice(0,10);
  app.innerHTML=`<section class="hero"><h1>OFF<br>LOOP</h1></section>
    <section class="intro">
      <p>Visual archive of works, exhibitions and collected traces.</p>
      <p>작업과 전시, 일상의 흔적을 기록합니다.</p>
    </section>
    <section>
      <div class="page-head"><h2 class="page-title">Archive</h2><p class="page-note">최근 기록</p></div>
      <div class="masonry">${latest.map(x=>card(x,"archive")).join("") || '<p class="empty">아직 등록된 작업이 없습니다.</p>'}</div>
    </section>`;
}

async function renderAbout(){
  app.innerHTML=`<section class="about">
    <h1>ABOUT</h1>
    <div class="about-grid">
      <div>OFFLOOP</div>
      <div class="about-copy">
        <p>시각예술 작업과 전시, 아카이브를 기록하는 공간입니다.</p>
        <p>이 페이지의 글은 <strong>index.html</strong>에서 직접 수정할 수 있습니다.</p>
        <p>작품과 전시는 <strong>/admin/</strong>의 Decap CMS에서 추가·수정합니다.</p>
        <p>Contact — hello@example.com</p>
      </div>
    </div>
  </section>`;
}

async function renderExhibitions(){
  const entries=await getCollection("exhibitions");
  app.innerHTML=`<section>
    <div class="page-head"><h1 class="page-title">EXHIBITIONS</h1><p class="page-note">전시 기록</p></div>
    <div class="masonry">${entries.map(x=>card(x,"exhibitions")).join("") || '<p class="empty">아직 등록된 전시가 없습니다.</p>'}</div>
  </section>`;
}

async function renderArchive(category="all"){
  const entries=await getCollection("archive");
  const filtered=category==="all" ? entries : entries.filter(x=>x.data.category===category);
  app.innerHTML=`<section>
    <div class="page-head"><h1 class="page-title">ARCHIVE</h1><p class="page-note">작업과 기록</p></div>
    <div class="filters">
      <button class="filter ${category==="all"?"active":""}" data-cat="all">전체</button>
      <button class="filter ${category==="눈자리나게"?"active":""}" data-cat="눈자리나게">눈자리나게</button>
    </div>
    <div class="masonry">${filtered.map(x=>card(x,"archive")).join("") || '<p class="empty">이 카테고리에 등록된 작업이 없습니다.</p>'}</div>
  </section>`;
  document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
    const cat=btn.dataset.cat;
    location.hash=cat==="눈자리나게" ? "#/archive/눈자리나게" : "#/archive";
  }));
}

async function renderDetail(collection, slug){
  const entries=await getCollection(collection);
  const entry=entries.find(x=>x.slug===slug);
  if(!entry) throw new Error("작업을 찾을 수 없습니다.");
  const d=entry.data;
  const gallery=Array.isArray(d.gallery) ? d.gallery : [];
  const images=[d.thumbnail,...gallery].filter(Boolean);
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
