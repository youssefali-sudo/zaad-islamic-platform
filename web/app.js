import { translations, habits } from './data.js';
import { getStreak } from './progress.js';
import { loadZaadEngine, clampCounter } from './zaad-engine.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const now=new Date();
const today=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
const defaults={days:{},counter:0,theme:'light',lang:'ar',nextPage:1};
let state;
let currentPageAyahs=[];
let reciters=[];
let audioQueue=[];
let audioIndex=0;
let isPlaying=false;
const audioEl=()=>$('#quranAudio');
try { state={...defaults,...JSON.parse(localStorage.getItem('zaad-state')||'{}')}; } catch { state={...defaults}; }
const save=()=>{localStorage.setItem('zaad-state',JSON.stringify(state));renderStats()};
function todayData(){return state.days[today] ||= {pages:[],habits:{},wirdStart:state.nextPage||1}}
function renderStats(){const d=todayData();$('#pagesDone').textContent=d.pages.length;$('#streak').textContent=getStreak(state.days);$('#habitsDone').textContent=Object.values(d.habits).filter(Boolean).length}
function setLang(lang){state.lang=lang;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(translations[lang][k])el.textContent=translations[lang][k]});$('#langBtn').textContent=lang==='ar'?'EN':'عربي';save()}
function currentWirdPages(){const base=todayData().wirdStart||1;return Array.from({length:6},(_,i)=>((base+i-1)%604)+1)}
function wirdComplete(){return currentWirdPages().every(n=>todayData().pages.includes(n))}
function renderPages(){const pages=currentWirdPages();$('#pageList').innerHTML=pages.map(n=>'<button class="page-button '+(todayData().pages.includes(n)?'done':'')+'" data-page="'+n+'">صفحة '+n+'</button>').join('');$('[data-page]').forEach(b=>b.onclick=()=>loadPage(Number(b.dataset.page)));const done=pages.filter(n=>todayData().pages.includes(n)).length;$('#wirdProgress').textContent='أنجزت '+done+' من 6 صفحات في هذا الورد.';$('#nextWird').hidden=!wirdComplete();}
$('#nextWird').onclick=()=>{if(!wirdComplete())return;const nextStart=((Number(todayData().wirdStart||state.nextPage||1)+5)%604)+1;todayData().wirdStart=nextStart;state.nextPage=nextStart;currentPageAyahs=[];resetPlayer('بدأ الورد التالي. يتم تحميل أول صفحة الآن…');save();renderPages();loadPage(nextStart);};
async function loadPage(n){resetPlayer('تم إيقاف التلاوة عند تغيير الصفحة.');$('#quranText').textContent='جارٍ تحميل الصفحة…';try{const r=await fetch('https://api.alquran.cloud/v1/page/'+n+'/quran-uthmani');if(!r.ok)throw Error('network');const j=await r.json();currentPageAyahs=j.data.ayahs;$('#quranText').innerHTML='<div class="ayahs"></div><button id="markPage" class="primary" type="button">علّمت الصفحة كمكتملة</button>';$('#quranText .ayahs').textContent=currentPageAyahs.map(a=>a.text+' ۞').join(' ');$('#markPage').onclick=()=>{todayData().pages=[...new Set([...todayData().pages,n])];save();renderPages();$('#markPage').textContent='تم تسجيل الصفحة ✓';$('#markPage').disabled=true};if(todayData().pages.includes(n)){$('#markPage').textContent='تم تسجيل الصفحة ✓';$('#markPage').disabled=true}$('#audioStatus').textContent='الورد جاهز للاستماع بصوت القارئ المحدد.'}catch{$('#quranText').textContent='تعذر تحميل النص الآن. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.'}}
function renderHabits(){const lang=state.lang;$('#habitCards').innerHTML=habits.map(h=>'<article class="habit-card"><h3>'+h.title[lang]+'</h3><p>'+h.desc[lang]+'</p>'+h.steps[lang].map((s,i)=>'<label><input type="checkbox" data-habit="'+h.id+'" data-step="'+i+'" '+(todayData().habits[h.id+'-'+i]?'checked':'')+'><span>'+s+'</span></label>').join('')+'</article>').join('');$$('[data-habit]').forEach(c=>c.onchange=()=>{todayData().habits[c.dataset.habit+'-'+c.dataset.step]=c.checked;save()})}
function showTab(id){$('.panel').forEach(p=>p.classList.toggle('active',p.id===id));$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));if(id==='quran')renderPages();if(id==='prayer')renderPrayerChecklist()}
$$('[data-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));$$('[data-go]').forEach(b=>b.onclick=()=>showTab(b.dataset.go));
$('#langBtn').onclick=()=>{setLang(state.lang==='ar'?'en':'ar');renderHabits()};$('#themeBtn').onclick=()=>{document.body.classList.toggle('light');state.theme=document.body.classList.contains('light')?'light':'dark';save()};
if(state.theme==='light')document.body.classList.add('light');
$('#plusCount').onclick=()=>{state.counter=clampCounter(state.counter+1);$('#counter').textContent=state.counter;save()};$('#minusCount').onclick=()=>{state.counter=clampCounter(state.counter-1);$('#counter').textContent=state.counter;save()};$('#resetCount').onclick=()=>{state.counter=0;$('#counter').textContent=0;save()};
$('#exportBtn').onclick=()=>{const a=document.createElement('a'),blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='zaad-backup.json';a.click();URL.revokeObjectURL(a.href)};
$('#importFile').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(!data.days||typeof data.days!=='object')throw Error();state={...defaults,...data};save();renderHabits();renderPages();alert('تم استيراد النسخة بنجاح')}catch{alert('ملف النسخة غير صالح')}};

const RECITERS=[
  ['1','مشاري العفاسي'],
  ['2','أبو بكر الشاطري'],
  ['3','ناصر القطامي'],
  ['4','ياسر الدوسري'],
  ['5','هاني الرفاعي']
];
const EVERYAYAH_FOLDERS={
  '1':'Alafasy_128kbps',
  '2':'Abu_Bakr_Ash-Shaatree_128kbps',
  '3':'Nasser_Alqatami_128kbps',
  '4':'Yasser_Ad-Dussary_128kbps',
  '5':'Hani_Rifai_192kbps'
};
function loadReciters(){
  const select=$('#reciterSelect');
  select.innerHTML=RECITERS.map(([id,name])=>'<option value="'+id+'">'+name+'</option>').join('');
  select.value='1';
  $('#audioStatus').textContent='اختر القارئ ثم اضغط استمع. الصوت من مصادر بديلة.';
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
  const ayah=audioQueue[audioIndex], reciter=$('#reciterSelect').value||'1', player=audioEl();
  const surah=ayah.surah?.number, ayahNo=ayah.numberInSurah;
  const folder=EVERYAYAH_FOLDERS[reciter]||EVERYAYAH_FOLDERS['1'];
  const surahPad=String(surah).padStart(3,'0'), ayahPad=String(ayahNo).padStart(3,'0');
  const primaryUrl='https://everyayah.com/data/'+folder+'/'+surahPad+ayahPad+'.mp3';
  const backupUrl='https://the-quran-project.github.io/Quran-Audio/Data/'+reciter+'/'+surah+'_'+ayahNo+'.mp3';
  $('#audioStatus').textContent='جارٍ تجهيز الآية '+(audioIndex+1)+' من '+audioQueue.length+'…';
  const trySource=async(url)=>{
    player.pause();
    player.src=url;
    player.load();
    await player.play();
  };
  try{
    try {
      await trySource(primaryUrl);
    } catch(firstError) {
      $('#audioStatus').textContent='نجرب مصدرًا صوتيًا بديلًا…';
      await trySource(backupUrl);
    }
    isPlaying=true;
    $('#playWird').textContent='Ⅱ إيقاف مؤقت';
    $('#audioStatus').textContent='يتم تشغيل الآية '+(audioIndex+1)+' من '+audioQueue.length;
  }catch(error){
    isPlaying=false;
    $('#playWird').textContent='▶ إعادة المحاولة';
    $('#audioStatus').textContent='تعذر تشغيل الصوت ('+(error?.name||'خطأ')+'). تأكد من اتصال الإنترنت ثم اضغط إعادة المحاولة.';
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
  if(player.dataset.fallback!=='1'&&player.dataset.fallbackUrl){
    player.dataset.fallback='1';
    player.src=player.dataset.fallbackUrl;
    player.play().catch(()=>{});
    return;
  }
  isPlaying=false;
  $('#playWird').textContent='▶ استمع للورد';
  $('#audioStatus').textContent='فشل المصدران الصوتيان. جرّب الاتصال أو قارئًا آخر.';
});
$('#reciterSelect').addEventListener('change',()=>{
  resetPlayer('تم تغيير القارئ. اضغط استمع للورد لبدء التلاوة.');
});

loadReciters();
loadZaadEngine();

const dhikrs=[['سُبْحَانَ اللَّهِ وَبِحَمْدِهِ','صحيح البخاري · 6405'],['لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ','صحيح البخاري · 6384'],['سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ','صحيح مسلم · 2695']];
let dhikrIndex=0,dhikrCount=0;
function showDhikr(){if(!$('#dhikrText'))return;$('#dhikrText').textContent=dhikrs[dhikrIndex][0];$('#dhikrSource').textContent=dhikrs[dhikrIndex][1];$('#dhikrCount').textContent=dhikrCount}
$('#dhikrPlus')?.addEventListener('click',()=>{dhikrCount++;showDhikr()});
$('#dhikrMinus')?.addEventListener('click',()=>{dhikrCount=Math.max(0,dhikrCount-1);showDhikr()});
$('#dhikrReset')?.addEventListener('click',()=>{dhikrCount=0;showDhikr()});
$('#nextDhikr')?.addEventListener('click',()=>{dhikrIndex=(dhikrIndex+1)%dhikrs.length;dhikrCount=0;showDhikr()});
const prayers=['الفجر','الظهر','العصر','المغرب','العشاء'];
function renderPrayerChecklist(){const done=state.days[today]?.prayers||[];$('#prayerChecklist').innerHTML=prayers.map((p,i)=>'<article class="prayer-item"><label><input type="checkbox" data-prayer="'+i+'" '+(done.includes(i)?'checked':'')+'><strong>'+p+'</strong></label></article>').join('');$('[data-prayer]').forEach(c=>c.onchange=()=>{const d=todayData();d.prayers=d.prayers||[];d.prayers=c.checked?[...new Set([...d.prayers,Number(c.dataset.prayer)])]:d.prayers.filter(x=>x!==Number(c.dataset.prayer));save()})}
showDhikr();renderPrayerChecklist();

const libraryItems=[
['العقيدة','أصول الإيمان','الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر.','https://www.islamweb.net/ar/'],
['العقيدة','أسماء الله الحسنى','معاني الأسماء وآثار الإيمان بها.','https://tafsir.app/'],
['الفقه','فقه الطهارة','الوضوء والغسل والتيمم وأحكام الطهارة.','https://www.dar-alifta.org/'],
['الفقه','فقه الصلاة','الشروط والأركان والواجبات والسنن وسجود السهو.','https://www.dar-alifta.org/'],
['الفقه','فقه الصيام','أحكام الصيام وآدابه والرخص المتعلقة به.','https://www.dar-alifta.org/'],
['الفقه','الزكاة والحج والعمرة','العبادات المالية ومناسك الحج والعمرة.','https://www.dar-alifta.org/'],
['السيرة','السيرة النبوية','المولد والبعثة والهجرة وبناء المجتمع.','https://www.islamweb.net/ar/'],
['السيرة','الشمائل المحمدية','هدي النبي ﷺ وصفاته وأخلاقه ومعاملاته.','https://dorar.net/'],
['القرآن','أسباب النزول','الأسباب المنقولة مع ضرورة التحقق من الروايات.','https://tafsir.app/'],
['القرآن','التجويد ومخارج الحروف','مبادئ التلاوة الصحيحة وأحكام التجويد.','https://qurancomplex.gov.sa/'],
['الحديث','مصطلح الحديث','الصحيح والحسن والضعيف والإسناد والمتن.','https://dorar.net/hadith'],
['الحديث','البحث في السنة','البحث في دواوين السنة والتخريج والحكم.','https://dorar.net/hadith'],
['الأخلاق','الأخلاق والآداب','الصدق والأمانة والرحمة وبر الوالدين.','https://dorar.net/'],
['الأخلاق','تزكية النفس','الإخلاص والصبر والشكر والتوبة ومحاسبة النفس.','https://tafsir.app/']
];
function renderLibrary(){
 const q=($('#librarySearch')?.value||'').trim().toLowerCase(),cat=$('#libraryCategory')?.value||'all';
 const categoryNames={aqeedah:'العقيدة',fiqh:'الفقه',seerah:'السيرة',quran:'القرآن',hadith:'الحديث',akhlaq:'الأخلاق'};
 const selectedCategory=categoryNames[cat]||cat;
 const items=libraryItems.filter(x=>(cat==='all'||x[0]===selectedCategory)&&(!q||x.join(' ').toLowerCase().includes(q)));
 $('#libraryCatalog').innerHTML=items.map(x=>'<article class="library-card"><span>۞</span><h3>'+x[1]+'</h3><p>'+x[2]+'</p><small>'+x[0]+'</small><p><a href="'+x[3]+'" target="_blank" rel="noreferrer">المصدر العلمي ←</a></p></article>').join('')||'<p class="muted">لا توجد نتائج مطابقة.</p>';
}
$('#librarySearch')?.addEventListener('input',renderLibrary);
$('#libraryCategory')?.addEventListener('change',renderLibrary);
renderLibrary();
$('#readerMode')?.addEventListener('change',()=>{
 const mode=$('#readerMode').value,max=mode==='page'?604:mode==='surah'?114:30;
 $('#readerNumber').max=max;$('#readerNumber').value=1;
 $('#readerNumberLabel').firstChild.textContent=mode==='page'?'رقم الصفحة ':mode==='surah'?'رقم السورة ':'رقم الجزء ';
});
$('#openReader')?.addEventListener('click',async()=>{
 const mode=$('#readerMode').value,n=Math.max(1,Number($('#readerNumber').value)||1);
 if(mode==='page')return loadPage(Math.min(604,n));
 const endpoint=mode==='surah'?'surah/'+Math.min(114,n)+'/quran-uthmani':'juz/'+Math.min(30,n)+'/quran-uthmani';
 resetPlayer('تم فتح مقطع جديد.');
 $('#quranText').textContent='جارٍ تحميل النص…';
 try{
  const res=await fetch('https://api.alquran.cloud/v1/'+endpoint);if(!res.ok)throw Error();
  const data=(await res.json()).data;currentPageAyahs=data.ayahs;
  $('#quranText').innerHTML='<h3>'+(mode==='surah'?data.name:'الجزء '+n)+'</h3><div class="ayahs"></div>';
  $('#quranText .ayahs').textContent=data.ayahs.map(x=>x.text+' ۞').join(' ');
  $('#audioStatus').textContent='تم تحميل النص. حدد صفحة للمتابعة والاستماع.';
 }catch{$('#quranText').textContent='تعذر جلب النص الآن؛ حاول مرة أخرى.';}
});
$('#searchQuran')?.addEventListener('click',async()=>{
 const q=$('#quranSearch').value.trim();if(!q)return;
 $('#searchResults').textContent='جارٍ البحث…';
 try{
  const res=await fetch('https://api.alquran.cloud/v1/search/'+encodeURIComponent(q)+'/all/quran-uthmani');if(!res.ok)throw Error();
  const data=(await res.json()).data;
  $('#searchResults').innerHTML=data.matches.slice(0,30).map(x=>'<article class="search-result"><p>'+x.text+'</p><small>'+x.surah.name+' · الآية '+x.numberInSurah+'</small><button class="text-button" data-open-page="'+x.page+'">افتح الصفحة '+x.page+'</button></article>').join('')||'<p>لا توجد نتائج.</p>';
  $('[data-open-page]').forEach(b=>b.onclick=()=>loadPage(Number(b.dataset.openPage)));
 }catch{$('#searchResults').textContent='تعذر البحث الآن. حاول مرة أخرى.';}
});
function readMarks(){try{return JSON.parse(localStorage.getItem('zaad-marks')||'[]')}catch{return []}}
$('#bookmarkAyah')?.addEventListener('click',()=>{
 const first=currentPageAyahs[0];if(!first){$('#readerPersonal').textContent='افتح صفحة أو سورة أولًا.';return;}
 const marks=readMarks();marks.unshift({page:first.page,surah:first.surah.name,ayah:first.numberInSurah,date:today});
 localStorage.setItem('zaad-marks',JSON.stringify(marks.slice(0,100)));$('#readerPersonal').textContent='تم حفظ موضع القراءة.';
});
$('#showBookmarks')?.addEventListener('click',()=>{
 const marks=readMarks();$('#readerPersonal').innerHTML=marks.length?marks.map(m=>'<p>'+m.surah+' · آية '+m.ayah+' · صفحة '+m.page+' <button class="text-button" data-mark-page="'+m.page+'">فتح</button></p>').join(''):'لا توجد مواضع محفوظة بعد.';
 $('[data-mark-page]').forEach(b=>b.onclick=()=>loadPage(Number(b.dataset.markPage)));
});
$('#showNotes')?.addEventListener('click',()=>{
 $('#readerPersonal').innerHTML='<textarea id="readerNote" rows="3" placeholder="اكتب فائدة أو تدبرًا شخصيًا..."></textarea><button id="saveReaderNote" class="primary">حفظ الملاحظة</button><div id="savedReaderNotes"></div>';
 const notes=JSON.parse(localStorage.getItem('zaad-notes')||'[]');
 $('#savedReaderNotes').innerHTML=notes.map(n=>'<p>'+n.date+' — '+n.text.replace(/[<>&]/g,'')+'</p>').join('');
 $('#saveReaderNote').onclick=()=>{const value=$('#readerNote').value.trim();if(!value)return;notes.unshift({date:today,text:value});localStorage.setItem('zaad-notes',JSON.stringify(notes.slice(0,100)));$('#showNotes').click();};
});


$('#todayDate').textContent=new Intl.DateTimeFormat(state.lang==='ar'?'ar-EG':'en',{dateStyle:'full'}).format(new Date());$('#counter').textContent=state.counter;setLang(state.lang);renderHabits();renderStats();renderPages();
