// Simple notebook app using localStorage
(function(){
  const LS_KEY = 'online_notebook_notes_v1';
  let notes = [];
  let currentId = null;
  let autosave = true;

  const els = {
    list: document.getElementById('notes-list'),
    search: document.getElementById('search'),
    title: document.getElementById('note-title'),
    body: document.getElementById('note-body'),
    btnNew: document.getElementById('btn-new'),
    btnSave: document.getElementById('btn-save'),
    btnDelete: document.getElementById('btn-delete'),
    btnExport: document.getElementById('btn-export'),
    btnImport: document.getElementById('btn-import'),
    fileImport: document.getElementById('file-import'),
    autosaveStatus: document.getElementById('autosave-status')
  };

  function load(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      notes = raw ? JSON.parse(raw) : [];
    }catch(e){
      console.error('Failed to parse notes', e);
      notes = [];
    }
  }

  function saveToStorage(){
    localStorage.setItem(LS_KEY, JSON.stringify(notes));
  }

  function renderList(filter=''){
    const f = filter.trim().toLowerCase();
    els.list.innerHTML = '';
    const sorted = notes.slice().sort((a,b)=>b.updatedAt - a.updatedAt);
    sorted.forEach(n=>{
      if(f && !((n.title||'').toLowerCase().includes(f) || (n.body||'').toLowerCase().includes(f))) return;
      const li = document.createElement('li');
      li.dataset.id = n.id;
      li.className = n.id===currentId? 'active':'';
      const t = document.createElement('strong');
      t.textContent = n.title || 'Untitled';
      const meta = document.createElement('small');
      meta.style.color='var(--muted)';
      const date = new Date(n.updatedAt);
      meta.textContent = ' ' + date.toLocaleString();
      const preview = document.createElement('div');
      preview.style.marginTop='6px';
      preview.style.color='var(--muted)';
      preview.textContent = (n.body||'').slice(0,120).replace(/\n/g,' ');

      li.appendChild(t);
      li.appendChild(meta);
      li.appendChild(preview);
      li.addEventListener('click',()=>openNote(n.id));
      els.list.appendChild(li);
    });
  }

  function openNote(id){
    const n = notes.find(x=>x.id===id);
    if(!n) return;
    currentId = id;
    els.title.value = n.title||'';
    els.body.value = n.body||'';
    renderList(els.search.value||'');
  }

  function createNote(){
    const id = 'n_' + Date.now() + '_' + Math.floor(Math.random()*9999);
    const now = Date.now();
    const n = {id, title:'', body:'', createdAt:now, updatedAt:now};
    notes.push(n);
    currentId = id;
    renderList(els.search.value||'');
    els.title.value = '';
    els.body.value = '';
    saveToStorage();
  }

  function saveNote(){
    if(!currentId) return;
    const n = notes.find(x=>x.id===currentId);
    if(!n) return;
    n.title = els.title.value;
    n.body = els.body.value;
    n.updatedAt = Date.now();
    saveToStorage();
    renderList(els.search.value||'');
  }

  function deleteNote(){
    if(!currentId) return;
    const idx = notes.findIndex(x=>x.id===currentId);
    if(idx===-1) return;
    if(!confirm('Delete this note?')) return;
    notes.splice(idx,1);
    currentId = notes.length? notes[0].id : null;
    saveToStorage();
    if(currentId) openNote(currentId); else {els.title.value='';els.body.value='';}
    renderList(els.search.value||'');
  }

  function exportNotes(){
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes_export_' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importNotesFile(file){
    const reader = new FileReader();
    reader.onload = e => {
      try{
        const data = JSON.parse(e.target.result);
        if(!Array.isArray(data)) throw new Error('Invalid format');
        // Merge while avoiding id collisions
        const existingIds = new Set(notes.map(n=>n.id));
        const toAdd = data.map(n=>{
          if(!n.id) n.id = 'n_' + Date.now() + '_' + Math.floor(Math.random()*9999);
          while(existingIds.has(n.id)) n.id = n.id + '_' + Math.floor(Math.random()*9999);
          existingIds.add(n.id);
          // ensure timestamps
          n.createdAt = n.createdAt || Date.now();
          n.updatedAt = n.updatedAt || n.createdAt;
          return n;
        });
        notes = notes.concat(toAdd);
        saveToStorage();
        renderList();
        alert('Imported ' + toAdd.length + ' note(s)');
      }catch(err){
        alert('Failed to import: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // Autosave behavior
  let autosaveTimer = null;
  function scheduleAutosave(){
    if(!autosave) return;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(()=>{
      saveNote();
      els.autosaveStatus.textContent = 'saved ' + new Date().toLocaleTimeString();
      setTimeout(()=>{els.autosaveStatus.textContent = 'on';},1500);
    }, 800);
  }

  // Event bindings
  function bind(){
    els.btnNew.addEventListener('click', createNote);
    els.btnSave.addEventListener('click', saveNote);
    els.btnDelete.addEventListener('click', deleteNote);
    els.btnExport.addEventListener('click', exportNotes);
    els.btnImport.addEventListener('click', ()=>els.fileImport.click());
    els.fileImport.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0];
      if(f) importNotesFile(f);
      e.target.value = '';
    });
    els.search.addEventListener('input', (e)=>renderList(e.target.value));
    els.title.addEventListener('input', scheduleAutosave);
    els.body.addEventListener('input', scheduleAutosave);

    window.addEventListener('beforeunload', ()=>{
      saveNote();
    });
  }

  // Initialize
  load();
  bind();
  els.autosaveStatus.textContent = autosave? 'on' : 'off';
  if(notes.length) {currentId = notes[0].id; openNote(currentId);} 
  renderList();
})();
