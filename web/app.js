import { translations, habits } from './data.js';
import { getStreak } from './progress.js';
import { loadZaadEngine, clampCounter } from './zaad-engine.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const today=new Date().toISOString().slice(0,10);
const defaults={days:{},counter:0,theme:'dark',lang:'ar',startPage:1};
let state;
let currentPageAyahs=[];
let reciters=[];
let audioQueue=[];
let audioIndex=0;
let isPlaying=false;
const audioEl=()=>$('#quranAudio');
try { state={...defaults,...JSON.parse(localStorage.getItem('zaad-state')||'{}')}; } catch { state={...defaults}; }
const save=()=>{localStorage.setItem('zaad-state',JSON.stringify(state));renderStats()};
function todayData(){return state.days[today] ||= {pages:[],habits:{}}}
function renderStats(){const d=todayData();$('#pagesDone').textContent=d.pages.length;$('#streak').textContent=getStreak(state.days);$('#habitsDone').textContent=Object.values(d.habits).filter(Boolean).length}
function setLang(lang){state.lang=lang;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(translations[lang][k])el.textContent=translations[lang][k]});$('#langBtn').textContent=lang==='ar'?'EN':'عربي';save()}
function renderPages(){const base=state.startPage||1;const pages=Array.from({length:6},(_,i)=>((base+i-1)%604)+1);$('#pageList').innerHTML=pages.map(n=>'<button class="page-button '+(todayData().pages.includes(n)?'done':'')+'" data-page="'+n+'">صفحة '+n+'</button>').join('');$$('[data-page]').forEach(b=>b.onclick=()=>loadPage(Number(b.dataset.page))); }
async function loadPage(n){$('#quranText').textContent='جارٍ تحميل الصفحة…';try{const r=await fetch('https://api.alquran.cloud/v1/page/'+n+'/quran-uthmani');if(!r.ok)throw Error('network');const j=await r.json();currentPageAyahs=j.data.ayahs;$('#quranText').innerHTML='<div class="ayahs"></div><button id="markPage" class="primary" type="button">علّمت الصفحة كمكتملة</button>';$('#quranText .ayahs').textContent=currentPageAyahs.map(a=>a.text+' ۞').join(' ');$('#markPage').onclick=()=>{todayData().pages=[...new Set([...todayData().pages,n])];save();renderPages();$('#markPage').textContent='تم تسجيل الصفحة ✓';$('#markPage').disabled=true};if(todayData().pages.includes(n)){$('#markPage').textContent='تم تسجيل الصفحة ✓';$('#markPage').disabled=true}$('#audioStatus').textContent='الورد جاهز للاستماع بصوت القارئ المحدد.'}catch{$('#quranText').textContent='تعذر تحميل النص الآن. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.'}}
function renderHabits(){const lang=state.lang;$('#habitCards').innerHTML=habits.map(h=>'<article class="habit-card"><h3>'+h.title[lang]+'</h3><p>'+h.desc[lang]+'</p>'+h.steps[lang].map((s,i)=>'<label><input type="checkbox" data-habit="'+h.id+'" data-step="'+i+'" '+(todayData().habits[h.id+'-'+i]?'checked':'')+'><span>'+s+'</span></label>').join('')+'</article>').join('');$$('[data-habit]').forEach(c=>c.onchange=()=>{todayData().habits[c.dataset.habit+'-'+c.dataset.step]=c.checked;save()})}
function showTab(id){$$('.panel').forEach(p=>p.classList.toggle('active',p.id===id));$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));if(id==='quran')renderPages()}
$$('[data-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));$$('[data-go]').forEach(b=>b.onclick=()=>showTab(b.dataset.go));
$('#langBtn').onclick=()=>{setLang(state.lang==='ar'?'en':'ar');renderHabits()};$('#themeBtn').onclick=()=>{document.body.classList.toggle('light');state.theme=document.body.classList.contains('light')?'light':'dark';save()};
if(state.theme==='light')document.body.classList.add('light');
$('#plusCount').onclick=()=>{state.counter=clampCounter(state.counter+1);$('#counter').textContent=state.counter;save()};$('#minusCount').onclick=()=>{state.counter=clampCounter(state.counter-1);$('#counter').textContent=state.counter;save()};$('#resetCount').onclick=()=>{state.counter=0;$('#counter').textContent=0;save()};
$('#exportBtn').onclick=()=>{const a=document.createElement('a'),blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='zaad-backup.json';a.click();URL.revokeObjectURL(a.href)};
$('#importFile').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(!data.days||typeof data.days!=='object')throw Error();state={...defaults,...data};save();renderHabits();renderPages();alert('تم استيراد النسخة بنجاح')}catch{alert('ملف النسخة غير صالح')}};

const RECITERS=[
  ['ar.alafasy','مشاري العفاسي'],
  ['ar.abdurrahmaansudais','عبدالرحمن السديس'],
  ['ar.husary','محمود خليل الحصري'],
  ['ar.minshawi','محمد صديق المنشاوي'],
  ['ar.mahermuaiqly','ماهر المعيقلي']
];
function loadReciters(){
  const select=$('#reciterSelect');
  select.innerHTML=RECITERS.map(([id,name])=>'<option value="'+id+'">'+name+'</option>').join('');
  $('#audioStatus').textContent='اختر القارئ ثم اضغط استمع. التلاوة تُحمّل مباشرة من خادم الصوت.';
}
function resetPlayer(message='اختر صفحة من الورد ثم اضغط استمع.'){
  audioEl().pause();
  audioEl().removeAttribute('src');
  audioEl().load();
  audioQueue=[];audioIndex=0;isPlaying=false;
  $('#playWird').textContent='▶ استمع للورد';
  $('#audioStatus').textContent=message;
}
async function playCurrentAyah(){
  if(audioIndex>=audioQueue.length){
    isPlaying=false;
    $('#playWird').textContent='▶ استمع للورد';
    $('#audioStatus').textContent='انتهى ورد الصفحة. تقبّل الله منك.';
    return;
  }
  const ayah=audioQueue[audioIndex];
  const edition=$('#reciterSelect').value||'ar.alafasy';
  const player=audioEl();
  $('#audioStatus').textContent='جاري تشغيل الآية '+(audioIndex+1)+' من '+audioQueue.length;
  player.dataset.retry='0';
  player.src='https://cdn.islamic.network/quran/audio/128/'+edition+'/'+ayah.number+'.mp3';
  try{
    await player.play();
    isPlaying=true;
    $('#playWird').textContent='Ⅱ إيقاف مؤقت';
  }catch(error){
    isPlaying=false;
    $('#playWird').textContent='▶ استمع للورد';
    $('#audioStatus').textContent='لم يبدأ الصوت. اضغط تشغيل من مشغل الصوت أو جرّب قارئًا آخر.';
  }
}
$('#playWird').onclick=async()=>{
  if(!currentPageAyahs.length){
    $('#audioStatus').textContent='اختر صفحة من صفحات الورد أولًا.';
    return;
  }
  const player=audioEl();
  if(isPlaying){
    player.pause();
    isPlaying=false;
    $('#playWird').textContent='▶ استكمل الاستماع';
    return;
  }
  if(audioQueue.length&&audioIndex<audioQueue.length&&player.src&&player.currentTime>0){
    try{await player.play();isPlaying=true;$('#playWird').textContent='Ⅱ إيقاف مؤقت';return;}
    catch{}
  }
  if(!audioQueue.length||audioIndex>=audioQueue.length){
    audioQueue=[...currentPageAyahs];audioIndex=0;
  }
  await playCurrentAyah();
};
audioEl().addEventListener('play',()=>{
  isPlaying=true;
  $('#playWird').textContent='Ⅱ إيقاف مؤقت';
});
audioEl().addEventListener('pause',()=>{
  if(!audioEl().ended){
    isPlaying=false;
    $('#playWird').textContent='▶ استكمل الاستماع';
  }
});
audioEl().addEventListener('ended',()=>{
  if(isPlaying){audioIndex++;playCurrentAyah();}
});
audioEl().addEventListener('error',()=>{
  const player=audioEl();
  if(!player.src)return;
  if(player.dataset.retry!=='1'){
    player.dataset.retry='1';
    player.src=player.src.replace('/128/','/64/');
    player.play().catch(()=>{});
    return;
  }
  isPlaying=false;
  $('#playWird').textContent='▶ استمع للورد';
  $('#audioStatus').textContent='تعذر تحميل الملف الصوتي. تحقق من الاتصال أو اختر قارئًا آخر.';
});
$('#reciterSelect').addEventListener('change',()=>{
  resetPlayer('تم تغيير القارئ. اضغط استمع للورد لبدء التلاوة.');
});

loadZaadEngine();
$('#todayDate').textContent=new Intl.DateTimeFormat(state.lang==='ar'?'ar-EG':'en',{dateStyle:'full'}).format(new Date());$('#counter').textContent=state.counter;setLang(state.lang);renderHabits();renderStats();renderPages();
