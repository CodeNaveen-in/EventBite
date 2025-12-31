document.addEventListener('DOMContentLoaded', () => {
  // Background carousel setup: find images in /images that end with _bg.png
  const bgRoot = document.getElementById('bg-root');
  const bgOverlay = document.getElementById('bg-overlay');
  const bgFiles = [
    'images/Christmas_bg.png',
    'images/Diwali_bg.png',
    'images/Halloween_bg.png',
    'images/Holi_bg.png',
    'images/Lunar_bg.png',
    'images/New_year_bg.png'
  ];
  let bgIndex = 0;
  const bgEls = [];

  function initBackgrounds(){
    bgFiles.forEach((src,i)=>{
      const img = new Image(); img.src = src; img.alt = '';
      img.className = (i===0? 'visible breathe':'' );
      img.onload = ()=>{
        img.style.opacity = (i===0)? '1':'0';
      };
      img.style.transition = 'opacity 1200ms ease, transform 1200ms ease';
      bgRoot.appendChild(img); bgEls.push(img);
    });
    if(bgEls.length>1) setInterval(nextBg, 6000);
  }

  function nextBg(){
    const prev = bgIndex; bgIndex = (bgIndex+1) % bgEls.length; const cur = bgIndex;
    bgEls[prev].classList.remove('visible'); bgEls[prev].classList.remove('breathe');
    bgEls[cur].classList.add('visible'); bgEls[cur].classList.add('breathe');
  }

  initBackgrounds();
  const festivalSelect = document.getElementById('festival-select');
  const giftsList = document.getElementById('gifts-list');
  const activitiesList = document.getElementById('activities-list');
  const checklistEl = document.getElementById('checklist');
  const downloadBtn = document.getElementById('download-btn');

  let festivals = [];
  let gifts = [];
  let checklists = {};
  let activities = {};

  async function loadAll() {
    const paths = ['data/festivals.json','data/gifts.json','data/checklist.json','data/activities.json'];
    const results = await Promise.allSettled(paths.map(p => fetch(p).then(r=>r.ok? r.json(): Promise.reject(r.status))));

    // Normalize festivals (some files use an object with a key)
    const rawFest = (results[0] && results[0].status==='fulfilled') ? results[0].value : null;
    if(rawFest){
      if(Array.isArray(rawFest)) festivals = rawFest;
      else if(Array.isArray(rawFest.festivals_worldwide)) festivals = rawFest.festivals_worldwide;
      else {
        const arr = Object.values(rawFest).find(v=>Array.isArray(v));
        festivals = arr || [];
      }
    }

    // Normalize gifts into an array of mapping objects
    const rawGifts = (results[1] && results[1].status==='fulfilled') ? results[1].value : null;
    gifts = [];
    if(rawGifts){
      if(Array.isArray(rawGifts)) gifts = rawGifts;
      else {
        const byType = rawGifts?.gift_planner_filter?.filter_categories?.by_festival_type;
        if(Array.isArray(byType)) gifts.push(...byType.map(x=>({type:x.type, suggested_gift_themes:x.suggested_gift_themes || x.themes || [], festivals_included:x.festivals_included || []})));
        const specific = rawGifts?.gift_planner_filter?.festival_specific_mappings;
        if(Array.isArray(specific)) specific.forEach(s=>gifts.push({festival_name:s.festival_name, suggested_gift_themes:s.gift_ideas || [], festivals_included:[s.festival_name]}));
      }
    }

    // Normalize checklists into a map where 'default' is a fallback array of task strings
    const rawChecklist = (results[2] && results[2].status==='fulfilled') ? results[2].value : null;
    checklists = {};
    if(rawChecklist){
      if(rawChecklist.festival_party_planner){
        const planner = rawChecklist.festival_party_planner;
        const phases = planner.checklists || {};
        const defaultTasks = [];
        Object.values(phases).forEach(arr => {
          if(Array.isArray(arr)) arr.forEach(t => { if(t && (t.task||typeof t==='string')) defaultTasks.push(t.task || t); });
        });
        checklists['default'] = defaultTasks;
      } else if(Array.isArray(rawChecklist)){
        checklists['default'] = rawChecklist;
      } else {
        // try to find arrays and flatten
        const arr = Object.values(rawChecklist).find(v=>Array.isArray(v));
        checklists['default'] = arr || [];
      }
    }

    const rawActivities = (results[3] && results[3].status==='fulfilled') ? results[3].value : null;
    activities = rawActivities || {};

    populateFestivalSelect();
  }

  function populateFestivalSelect(){
    festivals.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.name || f.title || '';
      opt.textContent = f.name || f.title || opt.value;
      festivalSelect.appendChild(opt);
    });
  }

  function updateForFestival(name){
    giftsList.innerHTML = '';
    activitiesList.innerHTML = '';
    checklistEl.innerHTML = '';

    if(!name) return;

    const festivalObj = festivals.find(f => (f.name||f.title)===name) || {};

    // Gifts: match by festivals_included or by type
    const matchedGifts = gifts.filter(g => {
      if(Array.isArray(g.festivals_included) && g.festivals_included.includes(name)) return true;
      if(festivalObj.type && g.type && g.type===festivalObj.type) return true;
      return false;
    });
    if(matchedGifts.length===0){
      const li = document.createElement('li'); li.textContent = 'No specific suggestions — try browsing general themes.'; giftsList.appendChild(li);
    } else {
      matchedGifts.forEach(g => { const li=document.createElement('li'); li.textContent = (g.suggested_gift_themes||g.themes||[]).join(', ') || g.type || JSON.stringify(g); giftsList.appendChild(li)});
    }

    // Activities
    const festivalActivities = (activities[name] && activities[name].suggested) || (activities['general'] && activities['general'].suggested) || [];
    if(festivalActivities.length===0){ const li=document.createElement('li'); li.textContent='No activities found.'; activitiesList.appendChild(li);} else { festivalActivities.forEach(a=>{const li=document.createElement('li'); li.textContent=a; activitiesList.appendChild(li)}) }

    // Checklist
    const checklistTemplate = checklists[name] || checklists['default'] || [];
    if(checklistTemplate.length===0){ const li=document.createElement('li'); li.textContent='No checklist template available.'; checklistEl.appendChild(li);} else { checklistTemplate.forEach(task=>{const li=document.createElement('li'); li.textContent=task; checklistEl.appendChild(li)}) }
  }

  festivalSelect.addEventListener('change', (e)=> updateForFestival(e.target.value));

  downloadBtn.addEventListener('click', ()=>{
    const name = festivalSelect.value || 'checklist';
    const items = Array.from(checklistEl.querySelectorAll('li')).map(li=>li.textContent);
    const blob = new Blob([JSON.stringify({festival:name,items},null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${name}-checklist.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  loadAll().catch(err=>console.error('Failed to load data',err));
});
