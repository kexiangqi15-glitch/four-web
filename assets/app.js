const DATA_URL = 'data/vocabulary.json';
const STORAGE_KEY = 'cet4_125_handbook_v1';
const app = document.querySelector('#app');
let book;
let state = loadState();

function loadState(){
  try{return {...{mastered:[],favorites:[],completed:[],scores:{},theme:'light'},...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}
  catch{return {mastered:[],favorites:[],completed:[],scores:{},theme:'light'}}
}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));updateTheme()}
function updateTheme(){document.documentElement.dataset.theme=state.theme;document.querySelector('#themeBtn').setAttribute('aria-label',`当前${state.theme==='dark'?'深色':'浅色'}主题`)}
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const arr=v=>Array.isArray(v)?v:[];
const pct=(a,b)=>b?Math.round(a/b*100):0;
const normalize=s=>String(s).trim().toLowerCase().replace(/[.,;；，。'’\s]+/g,'');
const ZH_EQUIVALENTS=[
  ['获得','获取','取得'],['另外','此外'],['否则','要不然'],['明显','显然'],
  ['减少','降低','减小'],['提高','提升','增加'],['阻碍','妨碍','阻止'],
  ['放弃','抛弃'],['大约','大概','约'],['重要','关键'],['表明','显示','说明']
];
function canonicalChinese(value){
  let text=String(value??'').trim().toLowerCase();
  ZH_EQUIVALENTS.forEach(group=>group.slice(1).forEach(item=>{text=text.replaceAll(item,group[0])}));
  return text.replace(/[的地得了着]/g,'').replace(/[^\u3400-\u9fffa-z0-9]+/g,'');
}
function meaningParts(value){
  return String(value??'').replace(/[（(][^）)]*[）)]/g,'；').split(/[;；,，、/|]+/)
    .map(canonicalChinese).filter(Boolean);
}
function chineseMeaningCorrect(input,reference){
  const userParts=meaningParts(input),answerParts=meaningParts(reference);
  if(!userParts.length||!answerParts.length)return false;
  const matches=(left,right)=>left===right||left.includes(right)||right.includes(left);
  if(userParts.every(part=>answerParts.some(answer=>matches(part,answer))))return true;
  const compact=canonicalChinese(input);
  return answerParts.filter(part=>part.length>1).every(part=>compact.includes(part));
}
function allWords(){return book.units.flatMap(u=>u.words)}
function unitById(id){return book.units.find(u=>u.id===Number(id))}
function pairs(rows,empty='暂无可靠高频对应项'){return arr(rows).length?rows.map(x=>`<span>${esc(x.en)} <small>（${esc(x.zh)}）</small></span>`).join('； '):`<span class="muted">${empty}</span>`}

function route(name){location.hash=name==='home'?'#home':`#${name}`}
function parseRoute(){return location.hash.slice(1)||'home'}
window.addEventListener('hashchange',renderRoute);
document.addEventListener('click',e=>{
  const r=e.target.closest('[data-route]'); if(r) route(r.dataset.route);
  const u=e.target.closest('[data-unit]'); if(u) route(`unit-${u.dataset.unit}`);
  const speaker=e.target.closest('[data-speak]'); if(speaker){speakWord(speaker.dataset.speak,speaker);return}
  const m=e.target.closest('[data-master]'); if(m){toggleList('mastered',Number(m.dataset.master));updateWordState(Number(m.dataset.master));return}
  const f=e.target.closest('[data-favorite]'); if(f){toggleList('favorites',Number(f.dataset.favorite));updateWordState(Number(f.dataset.favorite));return}
});
function toggleList(key,id){state[key]=state[key].includes(id)?state[key].filter(x=>x!==id):[...state[key],id];saveState()}

function updateWordState(id){
  const mastered=state.mastered.includes(id),favorite=state.favorites.includes(id);
  document.querySelectorAll(`[data-master="${id}"]`).forEach(button=>{
    button.classList.toggle('active',mastered);button.textContent=mastered?'✓':'○';
    button.title=mastered?'取消掌握':'标为掌握';button.setAttribute('aria-pressed',String(mastered));
  });
  document.querySelectorAll(`[data-favorite="${id}"]`).forEach(button=>{
    button.classList.toggle('active',favorite);button.textContent=favorite?'★':'☆';
    button.title=favorite?'取消收藏':'收藏';button.setAttribute('aria-pressed',String(favorite));
  });
  document.querySelectorAll(`#word-${id}`).forEach(card=>card.classList.toggle('mastered',mastered));
  const routeName=parseRoute();
  if(routeName.startsWith('unit-')){
    const unit=unitById(Number(routeName.split('-')[1]));
    const counter=document.querySelector('[data-master-count]');
    if(unit&&counter)counter.textContent=String(unit.words.filter(word=>state.mastered.includes(word.id)).length);
  }
}

let preferredVoice=null;
function chooseAmericanVoice(){
  if(!('speechSynthesis' in window))return null;
  const voices=window.speechSynthesis.getVoices();
  const american=voices.filter(voice=>/^en[-_]US$/i.test(voice.lang));
  preferredVoice=american.find(voice=>/Google US English|Aria|Jenny|Samantha|Zira|Guy/i.test(voice.name))||american[0]||voices.find(voice=>/^en/i.test(voice.lang))||null;
  return preferredVoice;
}
if('speechSynthesis' in window)window.speechSynthesis.addEventListener('voiceschanged',chooseAmericanVoice);
function speakWord(word,button){
  if(!('speechSynthesis' in window)){button.title='当前浏览器不支持语音朗读';return}
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(word);
  utterance.lang='en-US';utterance.rate=.86;utterance.pitch=1;utterance.voice=preferredVoice||chooseAmericanVoice();
  button.classList.add('speaking');button.setAttribute('aria-label',`正在朗读 ${word}`);
  const reset=()=>{button.classList.remove('speaking');button.setAttribute('aria-label',`播放 ${word} 的美式发音`)};
  utterance.onend=reset;utterance.onerror=reset;window.speechSynthesis.speak(utterance);
}

function shell(content){app.innerHTML=`<div class="shell">${content}</div>`;window.scrollTo({top:0,behavior:'instant'})}
function renderRoute(scroll=true){
  const r=parseRoute();
  if(r==='home') return renderHome();
  if(r==='favorites') return renderFavorites();
  if(r.startsWith('unit-')) return renderUnit(Number(r.split('-')[1]));
  if(r.startsWith('quiz-')) return renderUnitQuiz(Number(r.split('-')[1]));
  if(r.startsWith('review-')) return renderAssessment('review',Number(r.split('-')[1]));
  if(r.startsWith('test-')) return renderAssessment('test',Number(r.split('-')[1]));
  renderHome();
}

function renderHome(){
  const mastered=state.mastered.length, done=state.completed.length;
  const next=book.units.find(u=>!state.completed.includes(u.id))?.id||60;
  const volumes=Array.from({length:6},(_,i)=>{
    const start=i*10+1,end=start+9,complete=state.completed.filter(x=>x>=start&&x<=end).length;
    return `<button class="volume-card" data-unit="${start}"><small>第 ${i+1} 卷</small><h3>Unit ${start}–${end}</h3><p>300个高价值词 · 难度递进</p><div class="mini-progress"><span style="width:${complete*10}%"></span></div></button>`
  }).join('');
  const units=book.units.map(u=>`<button class="unit-chip ${state.completed.includes(u.id)?'done':''}" data-unit="${u.id}"><b>${u.id}</b><small>难度 ${u.difficulty}</small></button>`).join('');
  const milestones=[7,14,21,28,35,42,49,56].map(day=>`<article class="milestone"><b>第${day}天</b><p>Unit ${day-6}–${day} 综合复习</p><button class="ghost" data-route="review-${day}">开始复习</button>${book.tests[String(day)]?` <button class="ghost" data-route="test-${day}">综合测试</button>`:''}</article>`).join('');
  shell(`<section class="hero"><div><div class="eyebrow">60-day vocabulary sprint</div><h1>删掉会的，<br>只背值得的。</h1><p>面向河南高考英语约125分、已掌握高中核心词的CET-4进阶手册。1800词乱序编排，难度逐步上升。</p></div><aside class="hero-panel"><p>总体掌握进度</p><strong>${mastered} / 1800</strong><div class="progress-track"><div class="progress-fill" style="width:${pct(mastered,1800)}%"></div></div><p>已完成 ${done} / 60 个Unit</p><button class="primary" data-unit="${next}">继续 Unit ${next}</button></aside></section>
  <section class="stat-grid"><div class="stat"><strong>1,800</strong><span>高价值词</span></div><div class="stat"><strong>60</strong><span>每日Unit</span></div><div class="stat"><strong>6</strong><span>Markdown分卷</span></div><div class="stat"><strong>英式</strong><span>统一IPA</span></div></section>
  <section><div class="section-head"><div><h2>全书检索</h2><p>可查英文、中文、义项和搭配</p></div></div><div class="search-panel"><div class="search-row"><input id="searchInput" type="search" placeholder="输入 compile、可行、固定搭配……" aria-label="搜索词汇"><select id="unitFilter"><option value="">全部Unit</option>${book.units.map(u=>`<option value="${u.id}">Unit ${u.id}</option>`).join('')}</select><select id="posFilter"><option value="">全部词性</option><option>n.</option><option>v.</option><option>adj.</option><option>adv.</option></select><select id="diffFilter"><option value="">全部难度</option>${[1,2,3,4,5].map(x=>`<option value="${x}">难度 ${x}</option>`).join('')}</select></div><div id="searchMeta" class="search-meta">输入内容即可搜索；最多同时显示100项。</div></div><div id="searchResults" class="results-grid" style="margin-top:1rem"></div></section>
  <section><div class="section-head"><div><h2>六卷教材</h2><p>每卷10个Unit、300词</p></div></div><div class="volume-grid">${volumes}</div></section>
  <section><div class="section-head"><div><h2>60天路线</h2><p>绿色表示已完成</p></div></div><div class="unit-grid">${units}</div></section>
  <section><div class="section-head"><div><h2>综合复习与测试</h2><p>每7天复习，每14天测试</p></div><button class="secondary" data-route="test-60">第60天结业测试</button></div><div class="milestone-grid">${milestones}</div></section>`);
  setupSearch();
}

function setupSearch(){
  const controls=['searchInput','unitFilter','posFilter','diffFilter'].map(id=>document.querySelector('#'+id));
  controls.forEach(x=>x.addEventListener('input',()=>{
    const q=controls[0].value.trim().toLowerCase(),unit=controls[1].value,pos=controls[2].value,diff=controls[3].value;
    if(!q&&!unit&&!pos&&!diff){document.querySelector('#searchResults').innerHTML='';document.querySelector('#searchMeta').textContent='输入内容即可搜索；最多同时显示100项。';return}
    const found=allWords().filter(w=>{
      const hay=[w.word,w.core,w.focus,...w.collocations.flatMap(x=>[x.en,x.zh]),...w.fixedPhrases.flatMap(x=>[x.en,x.zh])].join(' ').toLowerCase();
      return (!q||hay.includes(q))&&(!unit||String(Math.ceil(w.id/30))===unit)&&(!pos||w.pos===pos)&&(!diff||String(w.difficulty)===diff)
    });
    document.querySelector('#searchMeta').textContent=`找到 ${found.length} 项${found.length>100?'，显示前100项':''}`;
    document.querySelector('#searchResults').innerHTML=found.slice(0,100).map(w=>wordCard(w,true)).join('');
  }));
}

function wordCard(w,compact=false){
  const mastered=state.mastered.includes(w.id),fav=state.favorites.includes(w.id);
  return `<article class="word-card ${mastered?'mastered':''}" id="word-${w.id}"><div class="word-top"><div class="word-title"><h3>${esc(w.word)}</h3><div class="ipa">${esc(w.ipa)} · ${esc(w.pos)}</div></div><div class="word-actions"><button class="round-btn audio-btn" data-speak="${esc(w.word)}" title="播放美式发音" aria-label="播放 ${esc(w.word)} 的美式发音">🔊</button><button class="round-btn ${fav?'active':''}" data-favorite="${w.id}" title="${fav?'取消收藏':'收藏'}" aria-pressed="${fav}">${fav?'★':'☆'}</button><button class="round-btn ${mastered?'active':''}" data-master="${w.id}" title="${mastered?'取消掌握':'标为掌握'}" aria-pressed="${mastered}">${mastered?'✓':'○'}</button></div></div><div class="badges"><span class="badge">${esc(w.category)}</span><span class="badge">难度 ${w.difficulty}</span></div><div class="core">${esc(w.core)}</div>${compact?`<p><button class="ghost" data-unit="${Math.ceil(w.id/30)}">查看所在Unit</button></p>`:`<details><summary>展开四级重点与用法</summary><div class="detail-list"><div class="detail-row"><b>四级重点</b>${esc(w.focus)}</div><div class="detail-row"><b>常见搭配</b>${pairs(w.collocations,'暂无可靠高频搭配')}</div><div class="detail-row"><b>固定短语</b>${pairs(w.fixedPhrases,'无常用固定短语，重点记搭配')}</div><div class="detail-row"><b>高频近义词</b>${pairs(w.synonyms,'无常用直接近义词')}</div><div class="detail-row"><b>高频反义词</b>${pairs(w.antonyms,'无常用对应反义词')}</div><div class="example"><b>长难句例句</b><p>${esc(w.example.en)}</p><p>${esc(w.example.zh)}</p></div><div class="memory"><b>记忆</b> ${esc(w.memory)}</div></div></details>`}</article>`
}

function renderUnit(id){
  const u=unitById(id); if(!u)return renderHome();
  shell(`<div class="page-head"><div><div class="eyebrow">第 ${Math.ceil(id/10)} 卷 · Day ${id}</div><h1>Unit ${id}</h1><p>30词 · 难度 ${u.difficulty}/5 · 已掌握 <span data-master-count>${u.words.filter(w=>state.mastered.includes(w.id)).length}</span>/30</p></div><div class="page-tools"><button class="ghost" data-route="home">首页</button><button class="secondary" data-route="quiz-${id}">今日在线练习</button><button class="primary" id="completeUnit">${state.completed.includes(id)?'已完成 ✓':'完成本Unit'}</button></div></div><div class="word-grid">${u.words.map(w=>wordCard(w)).join('')}</div><div class="pager"><button class="ghost" ${id===1?'disabled':''} data-unit="${Math.max(1,id-1)}">← 上一Unit</button><button class="ghost" ${id===60?'disabled':''} data-unit="${Math.min(60,id+1)}">下一Unit →</button></div>`);
  document.querySelector('#completeUnit').addEventListener('click',()=>{toggleList('completed',id);renderUnit(id)});
}

function renderUnitQuiz(id){
  const u=unitById(id); if(!u)return renderHome();
  const qs=[...u.exercises.zhToEn.map(x=>({...x,type:'中译英'})),...u.exercises.enToZh.map(x=>({...x,type:'英译中'}))];
  renderQuizPage(`Unit ${id} 今日练习`,qs,`unit-${id}`,`unit-${id}`);
}
function renderAssessment(kind,day){
  const source=kind==='review'?book.reviews[String(day)]:book.tests[String(day)]; if(!source)return renderHome();
  const title=day===60?'60天全书结业测试':`第${day}天${kind==='review'?'综合复习':'综合测试'}`;
  renderQuizPage(title,source.questions.map(q=>({prompt:q.prompt,answer:q.answer,type:q.type})),`home`,`${kind}-${day}`);
}
function renderQuizPage(title,questions,back,key){
  shell(`<div class="quiz-shell"><div class="page-head"><div><div class="eyebrow">Online practice</div><h1>${esc(title)}</h1><p>${questions.length}题 · 英译中按核心义匹配，不计义项顺序</p></div><button class="ghost" data-route="${back}">返回</button></div><div id="scoreArea"></div><form id="quizForm">${questions.map((q,i)=>`<div class="quiz-item" data-q="${i}"><label>${i+1}. <small>${esc(q.type)}</small> ${esc(q.prompt)}</label><input name="q${i}" autocomplete="off" aria-label="第${i+1}题答案"><p class="answer hidden"></p></div>`).join('')}<button class="primary" type="submit">提交并评分</button></form></div>`);
  const form=document.querySelector('#quizForm');let results=questions.map(()=>false);
  const updateScore=()=>{
    const correct=results.filter(Boolean).length,score=pct(correct,questions.length);
    state.scores[key]={correct,total:questions.length,score,date:new Date().toISOString()};saveState();
    document.querySelector('#scoreArea').innerHTML=`<div class="score-box"><div>本次得分</div><strong>${score}</strong><div>${correct} / ${questions.length} 题正确</div></div>`;
  };
  form.addEventListener('submit',e=>{
    e.preventDefault();
    questions.forEach((q,i)=>{
      const box=form.querySelector(`[data-q="${i}"]`),input=box.querySelector('input'),answer=box.querySelector('.answer');
      const ok=q.type==='英译中'?chineseMeaningCorrect(input.value,q.answer):normalize(input.value)===normalize(q.answer);
      results[i]=ok;box.classList.remove('correct','wrong');box.classList.add(ok?'correct':'wrong');answer.classList.remove('hidden');
      answer.innerHTML=ok?'正确 ✓':`参考答案：${esc(q.answer)} <button class="self-check" type="button" data-accept-q="${i}">我的意思正确，改判</button>`;
    });
    updateScore();window.scrollTo({top:0,behavior:'smooth'});
  });
  form.addEventListener('click',e=>{
    const button=e.target.closest('[data-accept-q]');if(!button)return;
    const i=Number(button.dataset.acceptQ),box=form.querySelector(`[data-q="${i}"]`);
    results[i]=true;box.classList.remove('wrong');box.classList.add('correct');box.querySelector('.answer').textContent='已按你的复核改判为正确 ✓';updateScore();
  });
}
function renderFavorites(){
  const words=allWords().filter(w=>state.favorites.includes(w.id));
  shell(`<div class="page-head"><div><div class="eyebrow">Personal wordbook</div><h1>收藏词汇</h1><p>${words.length}个待重点复习的词</p></div><button class="ghost" data-route="home">返回首页</button></div>${words.length?`<div class="word-grid">${words.map(w=>wordCard(w)).join('')}</div>`:'<div class="empty">还没有收藏。学习时点击星标即可加入。</div>'}`)
}

document.querySelector('#themeBtn').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';saveState()});
document.querySelector('#favoritesBtn').addEventListener('click',()=>route('favorites'));
document.querySelector('.brand').addEventListener('click',()=>route('home'));
const topBtn=document.querySelector('#backToTop');window.addEventListener('scroll',()=>topBtn.classList.toggle('show',scrollY>500));topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
updateTheme();
fetch(DATA_URL).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{book=data;document.querySelector('#loading').classList.add('hidden');app.classList.remove('hidden');renderRoute()}).catch(()=>{document.querySelector('#loading').classList.add('hidden');document.querySelector('#errorView').classList.remove('hidden')});
