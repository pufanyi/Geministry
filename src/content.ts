interface Window {
  __geminiPeriodicTableLoaded?: boolean;
}

(() => {
  'use strict';
  if (window.__geminiPeriodicTableLoaded) return;
  window.__geminiPeriodicTableLoaded = true;

  const symbols = [
    'H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar',
    'K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr',
    'Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe',
    'Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu',
    'Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn',
    'Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr',
    'Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og'
  ];
  const models = {
    H: { name: 'Hydrogen', number: 1, subtitle: 'Everyday help', joke: 'The lightest element. The heaviest tabs.', color: '#83afff' },
    C: { name: 'Carbon', number: 6, subtitle: 'Deep reasoning', joke: 'Carbon-based intelligence, allegedly.', color: '#ce9dff' },
    Ar: { name: 'Argon', number: 18, subtitle: 'Complex workflows', joke: 'Noble gas. Questionable decisions.', color: '#73e2cf' }
  };
  type ModelSymbol = keyof typeof models;
  const isModelSymbol = (symbol: string): symbol is ModelSymbol => Object.hasOwn(models, symbol);
  const specialPositions: Partial<Record<number, [number, number]>> = {
    1:[1,1],2:[1,18],3:[2,1],4:[2,2],5:[2,13],6:[2,14],7:[2,15],8:[2,16],9:[2,17],10:[2,18],
    11:[3,1],12:[3,2],13:[3,13],14:[3,14],15:[3,15],16:[3,16],17:[3,17],18:[3,18]
  };
  const create = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] => { const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n; };
  const query = (root: ParentNode, selector: string): HTMLElement => {
    const element = root.querySelector(selector);
    if (!(element instanceof HTMLElement)) throw new Error(`Missing UI element: ${selector}`);
    return element;
  };
  const host = create('div'); host.id='gpt-periodic-host';
  document.documentElement.appendChild(host);
  const shadow=host.attachShadow({mode:'open'});
  const style=create('style'); style.textContent = `
    :host{all:initial;color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    *,*::before,*::after{box-sizing:border-box}
    button{font:inherit;cursor:pointer}
    .launcher{position:fixed;bottom:100px;right:20px;z-index:2147483646;width:49px;height:49px;border:1px solid #737c97a3;border-radius:16px;background:linear-gradient(135deg,#27374f,#10151e);color:#e6efff;font-size:25px;box-shadow:0 8px 24px #0006}
    .scrim{position:fixed;inset:0;z-index:2147483645;background:#0006;backdrop-filter:blur(3px)}
    .panel{position:fixed;bottom:94px;right:22px;z-index:2147483647;width:min(760px,calc(100vw - 30px));max-height:calc(100vh - 115px);overflow:auto;padding:24px;border-radius:25px;background:linear-gradient(150deg,#20212c,#15171e 75%);border:1px solid #ffffff21;box-shadow:0 20px 70px #000a;color:#eee}
    @media(prefers-reduced-motion:no-preference){
      .launcher{transition:transform .2s}
      .launcher:hover{transform:rotate(-12deg) scale(1.08)}
      .panel{animation:pop .16s ease-out}
      .atom.active:hover,.atom.active:focus-visible{transform:scale(1.07)}
    }
    @keyframes pop{from{opacity:0;transform:translateY(9px) scale(.98)}to{opacity:1;transform:none}}
    .hidden{display:none!important}.headline{display:flex;justify-content:space-between;gap:12px;align-items:start}
    .eyebrow{color:#92a2ba;letter-spacing:.22em;font-size:10px;font-weight:800}.title{font-size:26px;font-weight:750;letter-spacing:-.04em;margin-top:6px}
    .subtitle{font-size:12px;color:#98a0b0;margin-top:5px}.close{border:none;background:#ffffff13;color:#eee;width:32px;height:32px;border-radius:10px;font-size:18px}
    .legend{display:flex;align-items:center;gap:15px;color:#989aa7;font-size:11px;margin:22px 0 12px}.dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;background:#84b5ff}.dot.off{background:#696975}
    .periodic{display:grid;grid-template-columns:repeat(18,minmax(0,1fr));grid-auto-rows:40px;gap:3px;min-width:510px}
    .atom{min-width:0;border-radius:6px;background:#ffffff0b;border:1px solid #ffffff0e;color:#71737e;position:relative;padding:2px 1px;display:flex;align-items:center;justify-content:center;flex-direction:column;line-height:1}
    .atom .anum{font-size:8px;position:absolute;left:3px;top:3px;opacity:.72}.atom .sym{font-size:14px;font-weight:650;margin-top:6px}
    .atom.active{color:#dceaff;background:color-mix(in srgb,var(--c) 16%,#22242d);border-color:color-mix(in srgb,var(--c) 55%,#555);box-shadow:inset 0 0 14px color-mix(in srgb,var(--c) 8%,transparent)}
    .atom.active:hover,.atom.active:focus-visible{background:color-mix(in srgb,var(--c) 36%,#20232e);outline:1px solid var(--c);z-index:1}
    .atom.selected{outline:2px solid var(--c);outline-offset:1px}
    .atom.disabled{cursor:default}.atom.ghost{background:transparent;border:0;pointer-events:none}
    .extra{margin-top:12px;display:flex;align-items:center;gap:8px;color:#9094a3;font-size:11px}
    .other{border:1px solid #ffffff28;background:#ffffff0c;color:#d3d7df;padding:5px 9px;border-radius:999px;font-size:11px}
    .detail{margin-top:18px;padding:14px;border:1px solid #ffffff1c;border-radius:15px;background:#ffffff08;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
    .hero{display:flex;align-items:center;gap:12px;flex:1;min-width:200px}.symbol{display:flex;align-items:center;justify-content:center;width:49px;height:54px;border:1px solid var(--c);background:color-mix(in srgb,var(--c) 15%,#181b24);border-radius:9px;font-weight:800;font-size:26px;color:var(--c)}
    .detail-title{font-size:15px;font-weight:700}.joke{font-size:11px;color:#929aaa;margin-top:5px}.thinking{display:flex;gap:4px;border:1px solid #ffffff26;padding:3px;border-radius:11px}
    .thinking button{background:none;border:0;border-radius:8px;color:#9ca1b0;padding:7px 11px;font-size:12px}.thinking button.on{background:#46628f;color:white}
    .action{background:#d1e4ff;border:0;border-radius:10px;padding:9px 13px;color:#162333;font-size:12px;font-weight:750}.action:hover{background:white}
    .status{font-size:11px;color:#b3bad0;margin-top:12px;min-height:16px}.status.error{color:#ffb6a9}.hint{font-size:10px;color:#777e8c;margin-top:7px}
    @media(max-width:620px){.panel{bottom:15px;right:15px;padding:16px;max-height:85vh}.periodic{grid-auto-rows:29px;gap:2px}.atom .sym{font-size:11px}.atom .anum{font-size:6px}.title{font-size:22px}.table-scroll{overflow-x:auto}.launcher{bottom:88px;right:12px}}
  `;
  shadow.appendChild(style);
  const launcher=create('button','launcher','⚛'); launcher.title='Gemini Periodic Table (Alt+Shift+P)'; launcher.setAttribute('aria-label','Open Gemini Periodic Table');
  const scrim=create('div','scrim hidden'); const panel=create('section','panel hidden');panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Gemini Periodic Table');
  panel.innerHTML=`<div class="headline"><div><div class="eyebrow">ELEMENTARY, MY DEAR GEMINI</div><div class="title">Periodic Table of Models <span style="font-size:18px">🧪</span></div><div class="subtitle">118 elements. 3 usable. Infinite marketing potential.</div></div><button class="close" aria-label="Close">×</button></div><div class="legend"><span><i class="dot"></i> Released</span><span><i class="dot off"></i> Coming soon™</span></div><div class="table-scroll"><div class="periodic"></div></div><div class="extra">Other models <button class="other" data-other="Flash-Lite">Flash-Lite</button><button class="other" data-other="Pro">Pro</button><button class="other" data-other="Auto">Auto</button></div><div class="detail"><div class="hero"><div class="symbol">H</div><div><div class="detail-title">Gemini 4 Hydrogen</div><div class="joke"></div></div></div><div class="thinking"><button data-level="Low">Low</button><button data-level="Medium" class="on">Medium</button><button data-level="High">High</button></div><button class="action">Select model ↗</button></div><div class="status" aria-live="polite">Choose an element to summon a model.</div><div class="hint">Unofficial parody · No API calls · Only uses the visible Gemini menu</div>`;
  shadow.append(launcher,scrim,panel);
  const grid=query(panel, '.periodic');
  let chosen: ModelSymbol = 'H';
  let level = 'Medium', shown = false, openingNative = false;
  const setStatus=(message: string,error=false)=>{const n=query(panel, '.status');n.textContent=message;n.classList.toggle('error',error);};
  const position=(n: number): [number, number] =>{
    if(specialPositions[n])return specialPositions[n];
    if(n<=36)return [4, n-18];
    if(n<=54)return [5, n-36];
    if(n===55)return [6,1];if(n===56)return[6,2];if(n>=57&&n<=71)return[9,n-54];if(n>=72&&n<=86)return[6,n-68];
    if(n===87)return[7,1];if(n===88)return[7,2];if(n>=89&&n<=103)return[10,n-86];return[7,n-100];
  };
  symbols.forEach((symbol,i)=>{
    const n=i+1,[row,col]=position(n),data=isModelSymbol(symbol)?models[symbol]:undefined;
    const cell=create('button','atom '+(data?'active':'disabled'));cell.style.gridRow=String(row);cell.style.gridColumn=String(col);cell.type='button';
    cell.innerHTML=`<span class="anum">${n}</span><span class="sym">${symbol}</span>`;
    if(data){cell.style.setProperty('--c',data.color);cell.title='Gemini 4 '+data.name;cell.addEventListener('click',()=>{if(isModelSymbol(symbol))selectSymbol(symbol)});}
    else{cell.title=symbol+' is still cooking (not a real Gemini model)';cell.setAttribute('aria-disabled','true');cell.addEventListener('click',()=>setStatus(`${symbol}? Google hasn't synthesized that model yet. 🧪`));}
    grid.appendChild(cell);
  });
  // Two placeholders keep the traditional table's 6th/7th row visually aligned.
  ([ [6,3,'57–71'],[7,3,'89–103'] ] as const).forEach(([r,c,text])=>{const el=create('div','atom disabled');el.style.gridRow=String(r);el.style.gridColumn=String(c);el.style.fontSize='8px';el.textContent=text;grid.appendChild(el);});
  const selectSymbol=(symbol: ModelSymbol)=>{
    chosen=symbol;const m=models[symbol];query(panel, '.symbol').textContent=symbol;query(panel, '.symbol').style.setProperty('--c',m.color);
    query(panel, '.detail-title').textContent=`Gemini 4 ${m.name}`;query(panel, '.joke').textContent=m.joke;
    grid.querySelectorAll('.active').forEach(el=>el.classList.toggle('selected',query(el, '.sym').textContent===symbol));
    setStatus(`${m.name} selected in the periodic table. Click “Select model” to apply.`);
  };
  const visible=(el: Element)=>!!(el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
  const clean=(s: string | null | undefined)=>(s||'').replace(/\s+/g,' ').trim();
  const candidates=()=>Array.from(document.querySelectorAll('button,[role="button"],[role="menuitem"],[role="option"],mat-option'))
    .filter((el): el is HTMLElement => el instanceof HTMLElement)
    .filter(el=>!host.contains(el)&&visible(el)&&el.getBoundingClientRect().width>0);
  const matchModel=(el: HTMLElement,name: string)=>{
    const t=clean(el.innerText||el.textContent),a=clean(el.getAttribute('aria-label'));
    const re=name==='Auto'?/\bauto\b/i:name==='Pro'?/(?:^|\b)(?:3\.1\s*)?pro(?:\b|$)/i:new RegExp(`\\b${name}\\b`,'i');
    if(!re.test(t+' '+a))return false;
    if(t.length>240)return false;
    if(/unlock|upgrade|subscribe|learn more/i.test(t+' '+a))return false;
    return true;
  };
  function nativeTrigger(){
    const list=candidates();
    const named=list.filter(el=>{
      const name=clean(el.innerText||el.textContent)+' '+clean(el.getAttribute('aria-label'));
      return /\b(Hydrogen|Argon|Carbon|Flash-Lite|3\.1 Pro|Gemini 4|model)\b/i.test(name)&&name.length<130;
    });
    const scored=named.map(el=>{
      const r=el.getBoundingClientRect();const txt=clean(el.innerText||el.textContent);
      let s=r.top/window.innerHeight*6;
      if(/^(Hydrogen|Argon|Carbon|Flash-Lite|3\.1 Pro)(\s*[⌄▼▾])?$/i.test(txt))s+=12;
      if(/model/i.test(el.getAttribute('aria-label')||''))s+=8;
      if(r.top<window.innerHeight*.4)s-=9;
      if(txt.length>60)s-=15;
      return {el,s};
    }).sort((a,b)=>b.s-a.s);
    const best = scored[0];
    return best && best.s > 0 ? best.el : null;
  }
  const sleep=(ms: number)=>new Promise<void>(res=>setTimeout(res,ms));
  async function applyNative(name: string){
    setStatus('Looking for '+name+' in Gemini’s native menu…');
    const itemsBefore=candidates().filter(el=>matchModel(el,name));
    const trigger=nativeTrigger();
    if(!trigger){setStatus('Could not find the native Gemini model selector. Try manually opening it, then click Select again.',true);return;}
    openingNative=true;
    try{
      trigger.click();
      await sleep(260);
      const items=candidates().filter(el=>matchModel(el,name)).filter(el=>el!==trigger);
      // Menu entries usually appear after trigger.click(). Prefer entries not already in the DOM and short exact labels.
      const sorted=items.map(el=>({el,score:(itemsBefore.includes(el)?0:6)+(clean(el.innerText||el.textContent).toLowerCase()===name.toLowerCase()?8:0)+(el.getAttribute('role')==='menuitem'?2:0)})).sort((a,b)=>b.score-a.score);
      const best = sorted[0];
      if(!best){setStatus(`${name} was not found in the Gemini menu. It may be unavailable on your plan, or Gemini changed its UI.`,true);return;}
      best.el.click();
      await sleep(220);
      if(models[chosen]&&name===models[chosen].name){
        const lev=candidates().filter(el=>clean(el.innerText||el.textContent).toLowerCase()===level.toLowerCase());
        lev.at(-1)?.click();
      }
      setStatus(`Clicked the native ${name} option${models[chosen]&&name===models[chosen].name?' (thinking: '+level+')':''}. Check Gemini's label to confirm.`);
    }catch(e){setStatus('Could not select model: '+(e instanceof Error ? e.message : String(e)),true)}finally{openingNative=false;}
  }
  const open=()=>{shown=true;panel.classList.remove('hidden');scrim.classList.remove('hidden');launcher.setAttribute('aria-expanded','true')};
  const close=()=>{shown=false;panel.classList.add('hidden');scrim.classList.add('hidden');launcher.setAttribute('aria-expanded','false')};
  launcher.addEventListener('click',()=>shown?close():open());scrim.addEventListener('click',close);query(panel, '.close').addEventListener('click',close);
  query(panel, '.action').addEventListener('click',()=>applyNative(models[chosen].name));
  panel.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b=>b.addEventListener('click',()=>{const nextLevel=b.dataset.level;if(!nextLevel)return;level=nextLevel;panel.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(x=>x.classList.toggle('on',x===b));setStatus(`${level} thinking selected. Apply the model to request it.`)}));
  panel.querySelectorAll<HTMLButtonElement>('[data-other]').forEach(b=>b.addEventListener('click',()=>{const name=b.dataset.other;if(name)void applyNative(name)}));
  document.addEventListener('keydown',ev=>{if(ev.altKey&&ev.shiftKey&&ev.code==='KeyP'){ev.preventDefault();shown?close():open()}else if(ev.key==='Escape'&&shown)close()},true);
  // Native selector hook is deliberately conservative; floating ⚛ always works as a fallback.
  document.addEventListener('click',ev=>{
    if(!(ev.target instanceof Element)||shown||openingNative||host.contains(ev.target))return;
    const t=ev.target.closest('button,[role="button"]');if(!(t instanceof HTMLElement)||!visible(t))return;
    const text=clean(t.innerText||t.textContent)+' '+clean(t.getAttribute('aria-label'));
    const rect=t.getBoundingClientRect();
    if(rect.top<innerHeight*.45||text.length>95)return;
    if(/^(?:Hydrogen|Carbon|Argon|Flash-Lite|3\.1 Pro)(?:\s*[⌄▼▾])?\s*$/i.test(text)||/^(?:choose|select|change)\s+model$/i.test(text)){
      // Let Gemini process its own click; our overlay covers the native menu.
      setTimeout(()=>{if(!shown&&!openingNative)open()},50);
    }
  },true);
  selectSymbol('H');
})();
