// Tip Cards – English training pack.
// Every card has steps: the 1st and 2nd time you LEARN it (read the example out loud, then use it yourself),
// from the 3rd time it TESTS you. Left = don't know (back to learning), down = remind me, right = got it, up = easy.
// APPEND ONLY to the lists below – card ids follow the line position.
const ENG_KINDS={
  word: {name:"Words",      emoji:"🧠", color:"#3e63dd", perDay:6},
  up:   {name:"Upgrades",   emoji:"🎩", color:"#8e4ec6", perDay:2},
  phr:  {name:"Phrases",    emoji:"🗣️", color:"#12a594", perDay:2},
  wit:  {name:"Wit",        emoji:"😄", color:"#f5a524", perDay:2},
  topic:{name:"Topic talk", emoji:"🌍", color:"#30a46c", perDay:1}};
const ENG_ORDER=["word","up","phr","wit","topic"];
const PHASES=["Fluency","Fluency","Fluency","Fluency","Style","Style","Style","Style","Performance","Performance","Performance","Performance"];
const SPEAKERS=[["David Attenborough","David Attenborough narration"],["Stephen Fry","Stephen Fry speech"],["Winston Churchill","Churchill we shall fight on the beaches speech"],["C. S. Lewis","C.S. Lewis BBC radio talk recording"],["Martin Luther King","Martin Luther King I have a dream full speech"],["John F. Kennedy","JFK we choose to go to the moon speech"],["Letters Live – Benedict Cumberbatch","Letters Live Benedict Cumberbatch"],["Alan Watts","Alan Watts lecture"],["Rowan Williams","Rowan Williams lecture"],["Sir Ken Robinson","Ken Robinson do schools kill creativity"]];
const REG={everyday:["Everyday","#646f80"],precise:["Precise","#3e63dd"],elegant:["✨ Elegant","#ab6400"]};
const YOUR_TURN=["something at work","the gym or sport","your weekend","a friend or someone in your family","food or cooking","a trip you took","something that happened today","someone you admire"];
const ENG_RAW={};
let _engPack=null, _engById=null;
function engPack(){ if(_engPack) return _engPack; const P={};
  for(const k of ENG_ORDER){ let reg="everyday", i=0; P[k]=[];
    for(const raw of (ENG_RAW[k]||"").split("\n")){ const s=raw.trim(); if(!s) continue;
      if(s.startsWith("##")){ reg=s.replace(/#/g,"").trim(); continue; } if(s.startsWith("#")) continue;
      const f=s.split("|").map(x=>x.trim()), id="en_"+k+"_"+(++i); let o;
      if(k==="word") o={id,text:f[0],pron:f[1],cue:f[2],plain:f[3],ex:f[4],ex2:f[5],cloze:f[6],tr:f[7]||"",reg};
      else if(k==="up"||k==="phr") o={id,cue:f[0],text:f[1],ex:f[2],ex2:f[3],cloze:f[4]};
      else if(k==="wit") o={id,tech:f[0],cue:f[1],text:f[2]||""};
      else o={id,text:f[0],tech:f[1],ex:f[2]||"",cue:f[3]||"",keys:(typeof ENG_TOPIC_KEYS!=="undefined"&&ENG_TOPIC_KEYS[i-1])||"",wiki:(typeof ENG_TOPIC_WIKI!=="undefined"&&ENG_TOPIC_WIKI[i-1])||""};
      P[k].push(o); } }
  return _engPack=P; }
function engById(){ if(!_engById){ _engById={}; const P=engPack(); for(const k in P) P[k].forEach(o=>_engById[o.id]=o); } return _engById; }

const inMode=c=>U.mode==="eng"?c.deck==="eng":c.deck!=="eng";
const modeLive=()=>live().filter(inMode);
const libCats=()=>U.mode==="eng"?ENG_ORDER.map(k=>({id:"en_"+k,...ENG_KINDS[k]})):cats();
function engStart(){ let s=null; S.items.forEach(c=>{ if(c.deck==="eng"&&c.intro&&c.intro!=="mine"&&(!s||c.intro<s)) s=c.intro; }); return s; }
function engWeek(){ const s=engStart(); if(!s) return 1; const [y,m,d]=s.split("-").map(Number); return Math.max(1,Math.floor((Date.now()-new Date(y,m-1,d))/(7*864e5))+1); }
function introduceEng(){ // a few new cards per kind per day; upd:1 so a copy from the other device always wins the merge
  if(!LS.get("kc_lastsync",0)) return 0;
  const t=today(), have=new Set(S.items.map(c=>c.id)), pack=engPack(); let n=0;
  for(const k of ENG_ORDER){ let room=ENG_KINDS[k].perDay-S.items.filter(c=>c.deck==="eng"&&c.kind===k&&c.intro===t).length;
    for(const p of pack[k]){ if(room<=0) break; if(have.has(p.id)) continue;
      S.items.push({id:p.id,text:p.text,cue:p.cue||"",deck:"eng",kind:k,cat:"en_"+k,level:0,st:0,due:t,intro:t,created:new Date().toISOString(),seen:0,upd:1}); room--; n++; } }
  if(n) persist(); return n; }
function say(t){ try{ const s=window.speechSynthesis; if(!s) return toast("No voice on this device"); s.cancel();
  const u=new SpeechSynthesisUtterance(t), vs=s.getVoices();
  const v=vs.find(v=>/en.GB/i.test(v.lang)&&/Google|Daniel|Arthur|Natural|Ryan|Libby|Sonia/i.test(v.name))||vs.find(v=>/en.GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang));
  if(v) u.voice=v; u.lang=v?v.lang:"en-GB"; u.rate=.9; s.speak(u); }catch(e){} }
if(window.speechSynthesis) speechSynthesis.getVoices();
const sayBtn=t=>`<button class="say" data-say="${esc(t)}" aria-label="Listen">🔊</button>`;
function turnFor(id){ let h=0; for(const ch of id) h=(h*31+ch.charCodeAt(0))|0; return YOUR_TURN[Math.abs(h)%YOUR_TURN.length]; }
const chips=a=>`<div class="opts">${a.map(o=>`<span>${esc(o)}</span>`).join("")}</div>`;
function engCardHTML(c,pos){
  const P=engById()[c.id]||{}, d={...c,...P}, K=ENG_KINDS[d.kind]||ENG_KINDS.word, top=pos===0, st=c.st||0, learn=st<2, open=top&&U.revealed;
  const yt=what=>`<div class="yt"><b>Read it out loud – then your turn:</b> ${what} about ${turnFor(c.id+st)}.</div>`;
  let b="", step=learn?(st===0?"learn · 1st time":"learn · 2nd time"):"test";
  if(d.kind==="word"){
    const R=REG[d.reg], regTag=R?`<span class="reg" style="--c:${R[1]}">${R[0]}</span>`:"";
    if(learn||!d.cloze){ const ex=st===1&&d.ex2?d.ex2:d.ex;
      if(!learn&&!d.cloze){ step="test"; b=`<div class="ek">Which word means…</div><div class="eq">${esc(d.cue)}</div>`+(open?`<div class="wrow"><div class="ea">${esc(d.text)}</div>${sayBtn(d.text)}</div>`:`<div class="reveal">Say it out loud – then tap</div>`); }
      else b=`<div class="wrow"><div class="ea">${esc(d.text)}</div>${sayBtn(d.text)}</div>${d.pron?`<div class="pron">${esc(d.pron)}</div>`:""}
        <div class="eq">${esc(d.cue)} ${regTag}</div>
        ${ex?`<div class="exr"><div class="ex">“${esc(ex)}”</div>${sayBtn(ex)}</div>`:""}
        ${yt(`say your own sentence with <i>${esc(d.text)}</i>`)}
        ${d.tr?`<div class="etr">🇨🇿 ${esc(d.tr)}</div>`:""}`; }
    else { const hint=d.text.split(" ").map(w=>w[0]+"·".repeat(Math.max(0,w.length-1))).join("  ");
      b=`<div class="ek">Which word fits? ${regTag}</div><div class="eq">${esc(d.cloze).replace("___",'<span class="blank">_____</span>')}</div><div class="ex">(${esc(d.cue)})</div>`+
        (open?`<div class="wrow"><div class="ea">${esc(d.text)}</div>${sayBtn(d.cloze.replace("___",d.text))}</div>${d.plain?`<div class="alt">${d.reg==="everyday"?"The best word here":R[0]+" choice"} · plainer: <b>${esc(d.plain)}</b></div>`:""}${d.tr?`<div class="etr">🇨🇿 ${esc(d.tr)}</div>`:""}`
        :`<div class="hint">${esc(hint)}</div><div class="reveal">Say the whole sentence out loud – then tap</div>`); } }
  else if(d.kind==="up"||d.kind==="phr"){
    const opts=d.text.split(" / ");
    if(learn||!d.cloze){ const ex=st===1&&d.ex2?d.ex2:d.ex;
      b=(d.kind==="up"?`<div class="ek">Instead of “${esc(d.cue)}” say</div>`:`<div class="ek">${esc(d.cue)}</div>`)+chips(opts)+
        (ex?`<div class="exr"><div class="ex">${esc(ex)}</div>${sayBtn(ex)}</div>`:"")+yt("use it");
      if(!learn) step="learn"; }
    else { b=(d.kind==="up"?`<div class="ek">Say it more elegantly</div><div class="eq">${esc(d.cloze).replace(/\[(.+?)\]/,"<s>$1</s>")}</div>`:`<div class="ek">${esc(d.cue)}</div><div class="eq">${esc(d.cloze)}</div>`)+
        (open?chips(opts)+(d.ex?`<div class="exr"><div class="ex">${esc(d.ex)}</div>${sayBtn(d.ex)}</div>`:""):`<div class="reveal">Say it out loud – then tap</div>`); } }
  else if(d.kind==="wit"){
    const reps=`<div class="ea small">${d.text.split(" / ").map(x=>"→ "+esc(x)).join("<br>")}</div>`;
    if(st<1){ step="learn"; b=`<div class="ek">${esc(d.tech)}</div><div class="eq">They say: <b>“${esc(d.cue)}”</b></div>${reps}<div class="yt"><b>Read the replies out loud, with a smile</b> – then invent one of your own.</div>`; }
    else { step="test"; b=`<div class="ek">${esc(d.tech)}</div><div class="eq">They say: <b>“${esc(d.cue)}”</b></div>`+(open?reps:`<div class="tbar"><i></i></div><div class="reveal">Reply out loud within 10 seconds – then tap</div>`); } }
  else { const keys=(d.keys||"").split(",").map(s=>s.trim()).filter(Boolean), kh=(d.wiki?`<img class="timg" data-wiki="${esc(d.wiki)}" alt="">`:"")+(keys.length?chips(keys):"");
    if(st<1){ step="read"; b=`<div class="ek">${esc(d.tech||"")} · read it out loud</div><div class="ea small">${esc(d.text)}</div><div class="brief">${esc(d.ex)}</div>${kh}<button class="btn small talk" data-talk="1">▶ Now tell it in 60 s</button>`; }
    else { step="retell"; b=`<div class="ek">${esc(d.tech||"")} · retell it</div><div class="ea small">${esc(d.text)}</div>${kh}`+(open?`<div class="brief">${esc(d.ex)}</div>`
      :`<div class="yt"><b>Tell it out loud using these key words</b> – then tap to check.${d.cue?`<br>Then ask someone: <i>${esc(d.cue)}</i>`:""}</div><button class="btn small talk" data-talk="1">▶ Talk 60 s</button>`); } }
  return `<div class="tc eng ${pos===1?"back1":pos===2?"back2":""}" ${top?'id="top"':""} data-id="${c.id}">
    <div class="band" style="background:${K.color}"></div>
    <div class="head"><span class="tag" style="color:${K.color}">${K.emoji} ${K.name}</span><span class="hr"><span class="muted" style="font-size:13px">${step}</span>${top?`<button class="cdel" data-del="${c.id}" aria-label="Delete card">🗑</button>`:""}</span></div>
    <div class="body">${b}</div>
    <div class="foot"><span>${c.seen?"seen "+c.seen+"×":"new"}</span><span>${c.grade==="easy"?"↑ easy last time":c.grade==="hard"?"↓ remind me":c.last==="know"?"✓ last time":c.last==="again"?"✕ last time":""}</span></div>
    <div class="stamp k" id="sk">GOT IT</div><div class="stamp a" id="sa">AGAIN</div><div class="stamp up" id="su">EASY</div><div class="stamp dn" id="sd">REMIND ME</div></div>`; }
function startTalk(btn){ let s=60; clearInterval(window._talk); btn.textContent="⏱ 60 s – go!";
  window._talk=setInterval(()=>{ s--; const el=document.querySelector("[data-talk]"); if(!el){ clearInterval(window._talk); return; }
    if(s<=0){ clearInterval(window._talk); el.textContent="✓ Done – swipe"; try{ navigator.vibrate&&navigator.vibrate(300); }catch(e){} return; }
    el.textContent="⏱ "+s+" s"; },1000); }
function engDone(){
  const t=today(), p=LS.get("kc_plan_"+t,{}); p.cards=true;
  const sp=SPEAKERS[Math.floor(Date.now()/864e5)%SPEAKERS.length], sun=new Date().getDay()===0;
  const rows=[["cards","🃏","Cards","Done for today."],
    ["shadow","🎧","Shadowing · 10 min",`Today: <a class="link" href="https://www.youtube.com/results?search_query=${encodeURIComponent(sp[1])}" target="_blank" rel="noopener">${esc(sp[0])} ↗</a><br>Play one sentence, then say it with him – same rhythm, same pauses.`],
    ["talk","🎤","Topic talk · 1 min","Explain today's 🌍 topic out loud, as if to a friend at dinner."],
    ["read","📖","Read aloud · 10 min","A good book, out loud and slowly. Catch words you like with the + button."]];
  if(sun) rows.push(["rec","🎙️","Weekly recording · 2 min","Record yourself talking about your week. Listen back: where did you search for words? Any “ehm”?"]);
  const n=rows.filter(r=>p[r[0]]).length;
  return `<div class="panel"><h2 class="ph"><span>Today's plan</span><span class="muted">${n}/${rows.length}</span></h2>
    ${rows.map(([k,e,ti,sub])=>`<div class="plan ${p[k]?"on":""}" data-plan="${k}"><span class="ck">${p[k]?"✓":e}</span><span><b>${ti}</b><small>${sub}</small></span></div>`).join("")}
    <div class="row" style="margin-top:14px"><button class="btn" id="practice">Practice more</button><button class="btn" data-offline="1">${LS.get("kc_offline",0)?"✈️ Offline ready – refresh":"✈️ Going offline? Save"}</button></div></div>`; }
function engAdd(){ const a=U.add;
  return `<div class="top"><div><h1>New word</h1><p class="sub">Met a word or phrase while reading? Catch it.</p></div></div>
  <textarea class="hero" id="atext" placeholder="e.g. “meticulous”">${esc(a.text)}</textarea>
  <div class="lab"><span>Meaning <span style="text-transform:none;font-weight:500">(optional – Claude can fill it in later)</span></span></div>
  <input type="text" id="acue" value="${esc(a.cue)}" placeholder="what it means, in simple English">
  <div class="lab"><span>Example sentence</span></div>
  <input type="text" id="anote" value="${esc(a.note)}" placeholder="the sentence where you found it">
  <div class="savebar"><button class="btn main full" id="asave" ${a.text.trim()?"":"disabled style='opacity:.4'"}>Save word</button></div>`; }

ENG_RAW.word=String.raw`
# word | pronunciation | meaning | plainer word | example 1 | example 2 | test sentence (___ = the word) | Czech
## everyday
postpone | pohst-POHN | to move an event to a later time | put off | We had to postpone the meeting until Friday. | Let's postpone dinner – I'm stuck at work. | The match was ___d because of the storm. | odložit
torn | TORN | not able to decide between two options | undecided | I'm torn between the two job offers. | She was torn between the beach and the mountains. | Honestly, I'm ___ – both flats are great. | rozpolcený
hesitate | HEZ-ih-tayt | to stop for a moment because you are unsure | wait | Don't hesitate to call me if you need anything. | He hesitated before opening the door. | If you have questions, don't ___ to ask. | váhat
decline | dih-KLYNE | to say no to an invitation, politely | say no | I'm afraid I'll have to decline. | She politely declined a second drink. | Thank you for the offer, but I must ___. | zdvořile odmítnout
realise | REE-uh-lyze | to suddenly understand something | understand | I suddenly realised I'd left my keys at home. | Did you realise how late it was? | Halfway to work, I ___d I'd forgotten my phone. | uvědomit si
reassure | ree-uh-SHOOR | to make someone feel less worried | calm down | She reassured me that everything was fine. | The doctor reassured him it was nothing serious. | Call your mum and ___ her you're safe. | uklidnit, ujistit
persuade | per-SWAYD | to make someone agree by talking to them | convince | I persuaded him to come along. | It took an hour to persuade her to try sushi. | Try to ___ your boss to give you Friday off. | přemluvit
admit | ad-MIT | to say that you were wrong | say | I admit I was wrong about that. | He finally admitted he'd forgotten. | I have to ___ – your idea was better. | přiznat
clarify | KLAIR-ih-fy | to make something easier to understand | explain | Could you clarify what you mean? | Let me clarify one thing before we start. | Sorry, could you ___ the last point? | objasnit
cope | KOHP | to deal successfully with something difficult | manage | How do you cope with all that stress? | She coped remarkably well after the move. | Three kids and a full-time job – I don't know how they ___. | zvládat
consider | kun-SID-er | to think carefully before deciding | think about | I'll consider your offer. | Have you ever considered moving abroad? | Before you decide, ___ the costs. | zvážit
afford | uh-FORD | to have enough money or time for something | have money for | I can't afford to lose this client. | We can't afford a new car right now. | Can we really ___ a holiday this year? | dovolit si
estimate | ES-tih-mayt | to guess a number or amount roughly | guess | I'd estimate about fifty people came. | Can you estimate how long it will take? | I'd ___ the repair at around two hundred euros. | odhadnout
spot | SPOT | to notice something that is hard to see | notice | Did you spot the mistake? | I spotted her across the room. | Can you ___ the difference between these two photos? | všimnout si
glance | GLAHNS | to look at something very quickly | look | I glanced at my watch. | She glanced back and smiled. | He ___d at the menu and ordered the steak. | letmo pohlédnout
exhausted | ig-ZAW-stid | extremely tired | very tired | After the shift I was completely exhausted. | You look exhausted – sit down. | After moving house all day, we were ___. | vyčerpaný
embarrassed | im-BAIR-ust | ashamed and awkward in front of others | ashamed | I was so embarrassed I went red. | Don't be embarrassed – it happens to everyone. | I called her by the wrong name – I was so ___. | v rozpacích
distracted | dis-TRAK-tid | not paying attention because of something else | not focused | Sorry, I got distracted. | It's hard not to get distracted by your phone. | I missed the exit because I was ___. | roztržitý
stubborn | STUB-ern | not willing to change your mind | hard-headed | He's as stubborn as a mule. | My grandmother is wonderfully stubborn. | He won't listen – he's too ___. | tvrdohlavý
astonished | uh-STON-isht | very surprised | very surprised | I was astonished by how cheap it was. | She looked astonished when we walked in. | We were ___ to see snow in May. | ohromený
coincidence | koh-IN-sih-dens | when two things happen at the same time by chance | chance | What a coincidence – I was just thinking of you! | It's no coincidence that he left early. | We booked the same hotel – what a ___! | náhoda
atmosphere | AT-mus-feer | the feeling or mood of a place | mood | The atmosphere in the room was electric. | I love the atmosphere of old cafés. | The music and candles created a lovely ___. | atmosféra
gist | JIST | the main idea, without the details | main idea | I didn't catch every word, but I got the gist. | Just give me the gist of the report. | I didn't read it all, but I got the ___. | podstata
claim | KLAYM | to say something is true, often without proof | say | He claims he's never been late. | She claims to know the owner. | The advert ___s it's the best coffee in town. | tvrdit
justify | JUS-tih-fy | to give a good reason for something | explain | How can they justify that price? | You don't need to justify your choice to me. | It's hard to ___ spending that much on shoes. | ospravedlnit
obligation | ob-lih-GAY-shun | something you must do because of a duty or promise | duty | You're under no obligation to buy. | I felt an obligation to help. | There's no ___ – come only if you want to. | povinnost
urge | URJ | a strong sudden wish to do something | need | I had a sudden urge to laugh. | Resist the urge to check your phone. | I had a strong ___ to call her. | nutkání
trigger | TRIG-er | to cause something to start happening | cause | What triggered the argument? | Stress can trigger headaches. | One small comment ___ed a huge fight. | vyvolat
give in | giv IN | to finally agree after refusing for a while | agree | In the end, I gave in. | Don't give in to the pressure. | Don't ___ just because they keep asking. | ustoupit
back out | bak OWT | to stop being part of a plan you agreed to | quit | He backed out at the last minute. | You can still back out if you want. | You can always ___ if you change your mind. | vycouvat
look into | look IN-too | to find out more about a problem | check | Leave it with me – I'll look into it. | The police are looking into the case. | Thanks for telling me – I'll ___ it. | prověřit
sum up | sum UP | to describe the main points briefly | summarise | To sum up, it was a good year. | Can you sum it up in one sentence? | So, to ___, we need more time. | shrnout
picture | PIK-cher | to imagine something clearly | imagine | Picture this: a cabin, a fire, total silence. | I can't picture him in a suit. | ___ yourself on a beach with a cold drink. | představit si
double-check | dub-ul CHEK | to check again that something is correct | check again | Let me double-check the date. | Always double-check the address. | Can you ___ that the door is locked? | zkontrolovat znovu
request | rih-KWEST | to ask for something formally and politely | ask for | I'd like to request a day off. | Guests can request a late checkout. | I sent an email to ___ more information. | žádat
colleague | KOL-eeg | a person you work with | co-worker | A colleague of mine recommended this place. | My colleagues threw me a surprise party. | I'm going for lunch with a ___ from work. | kolega
fee | FEE | the money you pay for a service | price | There's a small booking fee. | The lawyer's fee was enormous. | The entrance ___ is ten euros. | poplatek
leftovers | LEFT-oh-verz | food left over after a meal | rest of the food | We had the leftovers for lunch. | Pizza leftovers taste better the next day. | Don't throw it away – we'll eat the ___ tomorrow. | zbytky
nap | NAP | a short sleep during the day | short sleep | I need a quick nap. | Grandpa takes a nap after lunch. | I'm so tired – I'll have a twenty-minute ___. | šlofík
sigh | SY | to breathe out loudly when tired, sad or annoyed | breathe out | She sighed and sat down. | He sighed with relief. | When he saw the queue, he ___ed deeply. | povzdechnout si
upcoming | UP-kum-ing | coming soon, planned for the near future | next | Are you ready for the upcoming trip? | Check the upcoming events. | Are you nervous about the ___ interview? | nadcházející
worsen | WUR-sen | to become or make worse | get worse | The weather worsened in the afternoon. | Don't worsen things by shouting. | If you don't rest, your injury will ___. | zhoršit se
reject | rih-JEKT | to say no to something firmly | refuse | They rejected our proposal. | Don't take it personally if they reject you. | The bank ___ed his loan application. | zamítnout
habit | HAB-it | a thing you do regularly, almost without thinking | routine | Reading before bed has become a habit. | Smoking is a hard habit to break. | Going to the gym four times a week is now a ___. | zvyk
concern | kun-SURN | a feeling of worry about something important | worry | My main concern is the budget. | Thank you for your concern. | Safety is our biggest ___. | obava
join in | join IN | to take part in an activity with others | take part | Everyone joined in the singing. | Feel free to join in. | When the music started, everyone wanted to ___. | přidat se
bear with | BAIR with | to be patient while someone does something | wait | Bear with me for a moment. | Thanks for bearing with us. | Please ___ me – I'm looking for the file. | mít strpení
warn | WORN | to tell someone about a danger before it happens | tell | I did warn you about the traffic. | They warned us about the ice. | I ___ you – the soup is very hot. | varovat
dismiss | dis-MISS | to treat something as unimportant | ignore | Don't dismiss the idea too quickly. | He dismissed my concerns with a laugh. | She ___ed his advice and did it her way. | odbýt
reward | rih-WORD | what you get for your effort | prize | The view at the top was the reward. | Hard work brings its own reward. | After the exam, a pizza is my ___. | odměna
## precise
meticulous | meh-TIK-yuh-lus | very careful about every small detail | very careful | She keeps meticulous records. | He's meticulous about his car – not a single scratch. | My accountant is ___ – she checks every number twice. | pečlivý
candid | KAN-did | honest and direct, even when it's uncomfortable | honest | Can I be candid with you? | Thanks for your candid feedback. | To be ___, I didn't like the film. | upřímný, otevřený
reluctant | rih-LUK-tunt | not willing to do something | unwilling | He was reluctant to admit it. | I'm reluctant to lend him money again. | She was ___ to leave the party early. | neochotný
pragmatic | prag-MAT-ik | dealing with things in a practical, realistic way | practical | Let's be pragmatic about this. | She's a pragmatic manager – results first. | We need a ___ solution, not a perfect one. | pragmatický
eloquent | EL-uh-kwunt | able to express ideas beautifully and clearly | well-spoken | He gave an eloquent speech. | She's eloquent even in her second language. | The preacher was so ___ that nobody looked at their phone. | výmluvný
diligent | DIL-ih-junt | working hard and carefully | hard-working | She's a diligent worker. | Diligent practice beats talent. | He's ___ – he never leaves a job half done. | pilný
ambiguous | am-BIG-yoo-us | having more than one possible meaning | unclear | His answer was rather ambiguous. | The contract is ambiguous on this point. | Her text was ___ – was it a yes or a no? | dvojznačný
subtle | SUT-ul | small and not obvious, but noticeable | slight | There's a subtle difference. | She gave me a subtle hint. | The taste of vanilla is very ___. | jemný, nenápadný
resilient | rih-ZIL-ee-unt | able to recover quickly after difficulties | tough | Kids are remarkably resilient. | The business proved resilient during the crisis. | After losing his job he bounced back – he's very ___. | odolný
tenacious | teh-NAY-shus | not giving up easily | determined | He's a tenacious negotiator. | Her tenacious effort finally paid off. | It took ten tries, but he was ___. | houževnatý
frugal | FROO-gul | careful not to spend much money | thrifty | My grandfather lived a frugal life. | A frugal month helped us save for the trip. | We're being ___ this month – no restaurants. | šetrný, skromný
gracious | GRAY-shus | kind, polite and generous | kind | She was gracious in defeat. | Thank you for being such a gracious host. | Even after losing, he was ___ and congratulated the winner. | laskavý
humble | HUM-bul | not thinking you are better than others | modest | Despite his success, he stayed humble. | It was a humble little house. | The best leaders I know are ___. | pokorný
profound | pruh-FOWND | very deep, serious or meaningful | deep | It had a profound effect on me. | That's a profound question. | Becoming a father had a ___ impact on him. | hluboký
inevitable | in-EV-ih-tuh-bul | certain to happen; impossible to avoid | certain | Change is inevitable. | It was inevitable that they'd meet again. | With this traffic, being late is ___. | nevyhnutelný
plausible | PLAW-zih-bul | seeming likely to be true | believable | That's a plausible explanation. | His story sounded plausible at first. | Is it ___ that he simply forgot? | věrohodný
trivial | TRIV-ee-ul | small and unimportant | small | Don't worry about such trivial things. | They argued over something trivial. | It's a ___ problem – we'll fix it in five minutes. | banální
vivid | VIV-id | very clear and full of detail, like a picture | clear | I have a vivid memory of that day. | She has a vivid imagination. | I still have a ___ picture of my first day at school. | živý, barvitý
concise | kun-SYSE | short and clear, without extra words | short | Keep your answer concise. | A concise email gets read. | Be ___ – the boss only has two minutes. | stručný
coherent | koh-HEER-unt | logical and easy to follow | clear | Give me a coherent plan. | He was too tired to be coherent. | Her argument was calm and ___. | souvislý
versatile | VUR-suh-tyle | able to do many different things well | flexible | He's a versatile player. | A cast-iron pan is very versatile. | She's ___ – she can sing, act and dance. | všestranný
spontaneous | spon-TAY-nee-us | done without planning, naturally | unplanned | Let's do something spontaneous this weekend. | It was a spontaneous decision. | We had no plan – the trip was completely ___. | spontánní
nostalgic | nos-TAL-jik | happy and a little sad when remembering the past | sentimental | This song makes me nostalgic. | Old photos always make me nostalgic. | Walking past my old school made me ___. | nostalgický
sincere | sin-SEER | honest and truly meant | honest | Please accept my sincere apologies. | Her smile was warm and sincere. | I could tell his apology was ___. | upřímný
cordial | KOR-dee-ul | friendly but polite and formal | friendly | We had a cordial conversation. | Relations between them remained cordial. | The meeting was short but ___. | srdečný, zdvořilý
discreet | dis-KREET | careful not to embarrass people or reveal secrets | quiet | Don't worry, I'll be discreet. | He made a discreet exit. | Please be ___ – nobody else knows yet. | diskrétní
tactful | TAKT-ful | able to say difficult things without upsetting people | careful | That was a tactful way of putting it. | Be tactful when you tell her. | A ___ friend tells you the truth gently. | taktní
prudent | PROO-dunt | careful and sensible, avoiding risks | wise | It would be prudent to wait. | Saving a little each month is prudent. | With ice on the road, it's ___ to drive slowly. | rozvážný
impulsive | im-PUL-siv | doing things suddenly without thinking | rash | It was an impulsive purchase. | Don't be impulsive – sleep on it. | Buying that motorbike was a bit ___. | impulzivní
condescending | kon-dih-SEN-ding | treating people as if they were less intelligent | arrogant | Don't be so condescending. | His tone was a little condescending. | She explained it slowly, in a ___ voice. | povýšený
indifferent | in-DIF-runt | not caring or interested at all | not bothered | She seemed indifferent to the result. | I'm indifferent – choose whatever you like. | He was completely ___ to the criticism. | lhostejný
apprehensive | ap-rih-HEN-siv | a little worried about something in the future | nervous | I was apprehensive about the interview. | She felt apprehensive before the flight. | I'm a bit ___ about meeting her parents. | znepokojený
elated | ih-LAY-tid | extremely happy and excited | thrilled | We were elated when we heard the news. | He was elated after the win. | When she said yes, I was ___. | v sedmém nebi
bewildered | bih-WIL-derd | very confused | confused | He looked bewildered by the question. | Tourists stood bewildered at the station. | I was ___ – nothing in the instructions made sense. | zmatený
intrigued | in-TREEGD | very interested because something is unusual | curious | I'm intrigued – tell me more. | She was intrigued by his accent. | That's an unusual job – I'm ___. | zaujatý, zvědavý
captivating | KAP-tih-vay-ting | so interesting that it holds your attention | fascinating | She's a captivating storyteller. | The view was captivating. | The film was so ___ I forgot my popcorn. | podmanivý
tedious | TEE-dee-us | long and boring | boring | Filling in forms is tedious. | The journey was long and tedious. | Copying prices by hand is so ___. | únavný, nudný
mundane | mun-DAYN | ordinary and not interesting | ordinary | Even mundane tasks can be done with joy. | We talked about mundane things – weather, traffic. | Washing up is ___, but I like the quiet. | všední
remarkable | rih-MAR-kuh-bul | unusual and worth noticing | amazing | That's a remarkable achievement. | She has a remarkable memory. | It's ___ how quickly he learned Czech. | pozoruhodný
exquisite | ik-SKWIZ-it | extremely beautiful and delicate | beautiful | The food was exquisite. | What an exquisite little café. | The lace on her dress was ___. | vybraný, vynikající
impeccable | im-PEK-uh-bul | perfect, without any faults | perfect | His manners are impeccable. | The service was impeccable. | He always arrives on time, in an ___ suit. | bezvadný
genuine | JEN-yoo-in | real and honest, not fake | real | She has a genuine interest in people. | Is this genuine leather? | His laugh was warm and ___. | opravdový
unprecedented | un-PRES-ih-den-tid | never having happened before | new | It was an unprecedented situation. | Prices rose at an unprecedented speed. | A snowstorm in June? That's ___. | bezprecedentní
notorious | noh-TOR-ee-us | famous for something bad | infamous | The road is notorious for accidents. | He's notorious for being late. | That restaurant is ___ for slow service. | nechvalně známý
renowned | rih-NOWND | famous and respected for something good | famous | The city is renowned for its architecture. | A renowned chef opened a place nearby. | Prague is ___ for its beer. | proslulý
ample | AM-pul | more than enough | plenty of | There's ample time to finish. | The car has ample space for luggage. | Don't rush – we have ___ time. | dostatečný, hojný
scarce | SKAIRS | not enough; hard to find | rare | Good builders are scarce these days. | Water was scarce in the desert. | During the war, food was ___. | vzácný, nedostatkový
adamant | AD-uh-munt | very determined; will not change your mind | firm | She was adamant that she was right. | He's adamant about paying the bill. | I offered to help, but he was ___ – he'd do it alone. | neoblomný
earnest | UR-nist | serious and sincere | serious | He made an earnest effort to help. | She spoke in an earnest voice. | It was an ___ apology, not just words. | vážný, upřímný
witty | WIT-ee | clever and funny with words | funny | She's very witty. | He gave a witty answer. | The best man's speech was short and ___. | vtipný, duchaplný
articulate | ar-TIK-yuh-lit | able to express thoughts clearly in words | well-spoken | He's a very articulate young man. | She's articulate in three languages. | You don't need big words to be ___ – just clear ones. | výřečný
charismatic | kair-iz-MAT-ik | having a personality that attracts people | magnetic | He's a charismatic leader. | She's charismatic without even trying. | Everyone listens when she talks – she's so ___. | charismatický
compelling | kum-PEL-ing | so interesting or convincing you must pay attention | convincing | She made a compelling argument. | It's a compelling story. | He gave three ___ reasons to change the plan. | přesvědčivý
deliberate | dih-LIB-er-it | done on purpose, after thinking | intentional | It was a deliberate choice. | That wasn't an accident – it was deliberate. | Leaving early was a ___ decision. | záměrný
keen | KEEN | very interested and eager | eager | I'm keen to hear your view. | She's a keen cyclist. | Are you ___ on coming to the concert? | dychtivý, nadšený
ambivalent | am-BIV-uh-lunt | having mixed feelings about something | unsure | I'm ambivalent about moving. | She felt ambivalent about the offer. | I'm ___ about the new job – good pay, long hours. | rozpolcený
dubious | DYOO-bee-us | probably not true or honest; suspicious | doubtful | That sounds a bit dubious to me. | He made some dubious claims. | A car that cheap? Sounds ___. | pochybný
hasty | HAY-stee | done too quickly, without enough thought | rushed | Let's not make a hasty decision. | He made a hasty exit. | Sleep on it – don't be ___. | ukvapený
serene | suh-REEN | calm and peaceful | calm | The lake was perfectly serene. | She had a serene smile. | Early morning in the mountains is so ___. | klidný
poignant | POY-nyunt | causing a strong feeling of sadness | moving | It was a poignant moment. | The film had a poignant ending. | His farewell speech was short and ___. | dojemný
## elegant
albeit | awl-BEE-it | although (formal, short) | although | It worked, albeit slowly. | She agreed, albeit reluctantly. | We won, ___ by only one point. | i když, byť
nonetheless | nun-thuh-LESS | in spite of what was just said | still | It was risky; nonetheless, we went ahead. | It's expensive. Nonetheless, it's worth it. | The weather was awful; ___, we had a great day. | nicméně
ponder | PON-der | to think about something deeply | think about | I've been pondering your question. | He pondered the offer over coffee. | I sat by the river, ___ing my next step. | přemítat
relish | REL-ish | to enjoy something very much | enjoy | I relish a good challenge. | She relished every moment of the trip. | He ___ed the chance to prove them wrong. | vychutnávat si
savour | SAY-ver | to enjoy something slowly to make it last | enjoy | Savour the moment. | Savour every bite – it's the last piece. | Slow down and ___ the view. | vychutnat
cherish | CHAIR-ish | to love and protect something precious | value | I cherish those memories. | Cherish the time with your parents. | I'll always ___ that letter. | opatrovat, hýčkat
contemplate | KON-tem-playt | to think about something seriously for a long time | consider | He contemplated the offer for a week. | I'm contemplating a change of career. | Take a week to ___ the offer before you answer. | rozjímat, zvažovat
endeavour | en-DEV-er | to try hard to do something (formal) | try | We will endeavour to help. | Good luck in your new endeavour. | I will ___ to reply within a day. | snažit se, úsilí
acquaintance | uh-KWAYN-tuns | a person you know a little, not a close friend | someone I know | He's an acquaintance from work. | Delighted to make your acquaintance. | She's not a close friend, just an ___. | známý
fortnight | FORT-nyte | two weeks | two weeks | I'll be away for a fortnight. | We meet once a fortnight. | I'll see you in a ___. | dva týdny
seldom | SEL-dum | very rarely | rarely | We seldom see snow here. | He seldom complains. | I ___ drink coffee after six. | zřídka
invariably | in-VAIR-ee-uh-blee | always, every time | always | He's invariably late. | Invariably, the best ideas come in the shower. | Whenever I wash the car, it ___ rains. | vždy, neměnně
admittedly | ad-MIT-id-lee | I accept that this is true (before your point) | I admit | Admittedly, I was tired. | Admittedly, it's not cheap. | ___, I didn't read the whole contract. | nutno uznat
presumably | prih-ZYOO-muh-blee | probably, as you would expect | probably | Presumably, he's already left. | You're presumably hungry after the trip. | The shop is dark – ___ it's closed. | pravděpodobně
I daresay | eye DAIR-say | I think it's likely (old-style, charming) | I suppose | I daresay you're right. | I daresay we'll need umbrellas. | ___ he'll be late again. | troufám si říct
by all means | by awl MEENZ | of course, please do | sure | By all means, take a seat. | "May I join you?" – "By all means." | "Can I borrow your pen?" – "___." | ale samozřejmě
splendid | SPLEN-did | very good, excellent (classic British) | great | What a splendid idea! | We had a splendid weekend. | The weather was ___ – not a cloud. | skvělý
delightful | dih-LYTE-ful | very pleasant and charming | lovely | We had a delightful evening. | Your mother is delightful. | What a ___ little restaurant. | rozkošný, nádherný
dreadful | DRED-ful | very bad or unpleasant | terrible | The traffic was dreadful. | I've had a dreadful cold all week. | The coffee at the station was ___. | hrozný
marvellous | MAR-vuh-lus | wonderful, extremely good | wonderful | You look marvellous. | What a marvellous view. | The concert was absolutely ___. | báječný
bemused | bih-MYOOZD | slightly confused and amused | puzzled | He looked bemused by the fuss. | She gave me a bemused smile. | The waiter looked ___ by our strange order. | zmateně pobavený
commendable | kuh-MEN-duh-bul | deserving praise | good | That's a commendable effort. | His honesty was commendable. | Volunteering every weekend is ___. | chvályhodný
unassuming | un-uh-SYOO-ming | modest; not trying to look important | modest | He's quiet and unassuming. | It's an unassuming little bar with great food. | For a millionaire, he's very ___. | nenápadný, skromný
a tad | uh TAD | a little bit (charming) | a bit | It's a tad cold today. | The steak was a tad overcooked. | Could you turn the music down ___? | trošku
inclined | in-KLYND | more likely to think or do something | likely | I'm inclined to agree. | He's inclined to exaggerate. | Given the weather, I'm ___ to stay home. | nakloněný
gentlemanly | JEN-tul-mun-lee | polite, kind and well-mannered (of a man) | polite | That was very gentlemanly of you. | He has gentlemanly manners. | Opening the door for her was a ___ thing to do. | gentlemanský
as it were | az it WUR | so to speak | so to speak | He was, as it were, the king of the party. | We're all in the same boat, as it were. | She's the heart of the family, ___. | takříkajíc
serendipity | sair-un-DIP-ih-tee | a lucky, unexpected discovery | luck | Meeting her was pure serendipity. | Many inventions came from serendipity. | Finding that café was pure ___. | šťastná náhoda
exhilaration | ig-zil-uh-RAY-shun | great happiness and excitement | excitement | The exhilaration of the first jump! | I felt pure exhilaration at the top. | Nothing beats the ___ of your first big win. | opojení, rozjařenost
idleness | IDE-ul-nis | doing nothing (pleasantly or lazily) | doing nothing | A little idleness on Sunday is healthy. | Idleness is the enemy of progress. | After a busy week, I enjoy a little ___. | zahálka
quip | KWIP | a short, clever, funny remark | joke | He answered with a quick quip. | Her quip made the whole table laugh. | He always has a ___ ready. | vtip, bonmot
good humour | good HYOO-mer | a cheerful mood; able to laugh at things | good mood | She took it in good humour. | He kept his good humour all day. | Even in the rain, they stayed in ___. | dobrá nálada
composure | kum-POH-zher | calmness in a difficult moment | calm | He kept his composure. | She lost her composure for a second. | Under pressure, a leader keeps his ___. | rozvaha, klid
admiration | ad-mih-RAY-shun | great respect for someone | respect | I have great admiration for her. | He looked at the car with admiration. | I have deep ___ for nurses. | obdiv
courteous | KUR-tee-us | showing very good manners | polite | He was courteous to everyone. | The staff were courteous and helpful. | Be ___ even when others are rude. | zdvořilý
express my gratitude | ik-SPRES my GRAT-ih-tyood | to say thank you formally | say thank you | I'd like to express my gratitude. | Let me express my gratitude to our hosts. | Before we start, I'd like to ___ to everyone who helped. | vyjádřit vděčnost
`;

ENG_RAW.up=String.raw`
# plain | elegant versions (/ separated) | example 1 | example 2 | test sentence with the [plain words] in brackets
I think… | I'd say… / I'm inclined to think… / If you ask me… | I'd say the second option is safer. | If you ask me, we should leave now. | [I think] the blue one suits you better.
very tired | worn out / drained / weary | I'm absolutely drained after this week. | You look worn out – sit down for a minute. | After the long drive, I was [very tired].
very good | excellent / splendid / superb | That was a splendid dinner – thank you. | The service here is superb. | The film was [very good] – you must see it.
very bad | dreadful / appalling / atrocious | The weather on Sunday was dreadful. | The traffic this morning was appalling. | The hotel breakfast was [very bad].
very big | enormous / immense / vast | They live in an enormous house. | A vast landscape opened up before us. | The new warehouse is [very big].
very small | tiny / minute (my-NYOOT) / minuscule | The difference is minute. | We stayed in a tiny flat in Rome. | The print in the contract was [very small].
very happy | delighted / thrilled / overjoyed | I'm delighted to hear that. | She was thrilled with her present. | When they got engaged, her parents were [very happy].
very sad | heartbroken / devastated / downcast | She was devastated by the news. | He looked downcast all evening. | When his dog died, he was [very sad].
very angry | furious / livid / incensed | He was livid when he found out. | My boss was furious about the delay. | When she saw the scratch on her car, she was [very angry].
very scared | terrified / petrified | I was petrified of the dark as a child. | She's terrified of spiders. | During the storm on the plane, I was [very scared].
very interesting | fascinating / captivating / riveting | The book was absolutely riveting. | What a fascinating idea. | His talk about Japan was [very interesting].
very boring | tedious / dull / mind-numbing | The lecture was mind-numbing. | It's a rather dull town. | The three-hour meeting was [very boring].
very beautiful | stunning / breathtaking / exquisite | The view was breathtaking. | You look stunning tonight. | The sunset over the lake was [very beautiful].
very hungry | starving / famished | I'm famished – shall we eat? | After the gym I'm always starving. | It's two o'clock and I'm [very hungry].
very easy | effortless / a breeze | The exam was a breeze. | She makes it look effortless. | Setting up the new phone was [very easy].
very hard | gruelling / demanding / arduous | It was a gruelling climb. | It's a demanding job, but I love it. | The last week of training was [very hard].
very important | crucial / vital / essential | Timing is crucial here. | Sleep is vital for recovery. | Good communication is [very important] in a team.
very smart | brilliant / sharp / astute | That's an astute observation. | She's sharp – she noticed everything. | Your solution was [very smart].
very funny | hilarious / priceless | His face was priceless. | The film was hilarious. | Her story about the wedding was [very funny].
very old | ancient / antique / time-worn | An ancient oak stood by the gate. | My grandfather has an antique clock. | The church in the village is [very old].
I don't know. | I couldn't say. / I'm not entirely sure. / Good question – let me think about that. | "When does it open?" – "I couldn't say, I'm afraid." | I'm not entirely sure, but I'll find out. | "Who painted it?" – "[I don't know.]"
Yes. | Absolutely. / Certainly. / Indeed. / By all means. | "Can you help?" – "Absolutely." | "May I sit here?" – "By all means." | "Was the trip worth it?" – "[Yes.]"
No. | I'm afraid not. / Not quite. / I'd rather not. | "Is the table free?" – "I'm afraid not." | "Do you want to sing?" – "I'd rather not." | "Do you have any tickets left?" – "[No.]"
I want… | I'd like… / I'd love… / I'd be grateful for… | I'd like a table for two, please. | I'd be grateful for your advice. | [I want] the steak, medium rare.
Can you…? | Would you mind…? / Could I ask you to…? | Would you mind closing the window? | Could I ask you to send me the file? | [Can you] pass me the salt?
Sorry. | My apologies. / Forgive me. / I do apologise. | Forgive me, I didn't catch your name. | My apologies for the delay. | [Sorry,] I forgot to call you back.
Thanks. | Much appreciated. / That's very kind of you. / I'm most grateful. | That's very kind of you – thank you. | Your help was much appreciated. | You carried my bags? [Thanks.]
It's OK. | Not at all. / Think nothing of it. / No harm done. | "Sorry I'm late." – "Not at all." | "I stepped on your foot!" – "No harm done." | "Sorry about the mess." – "[It's OK.]"
I agree. | Quite right. / Couldn't agree more. / Precisely. | "We need a break." – "Couldn't agree more." | "Precisely – that's my point." | "This place is too loud." – "[I agree.]"
I don't agree. | I see it a little differently. / I'm not sure I'd go that far. | I see it a little differently, actually. | "He's a genius." – "I'm not sure I'd go that far." | "This is the best pizza in Europe." – "[I don't agree.]"
It's expensive. | It's rather steep. / It's not exactly a bargain. | Ten euros for a coffee? That's rather steep. | It's not exactly a bargain, but it's good quality. | Two thousand for a sofa? [It's expensive.]
It's cheap. | It's a steal. / It's very reasonable. | At that price, it's a steal. | The wine list here is very reasonable. | Three courses for ten euros? [It's cheap.]
I'm busy. | I'm a little stretched at the moment. / My plate is rather full. | I'd love to help, but my plate is rather full this week. | I'm a little stretched at the moment – can we talk on Friday? | Sorry, I can't come – [I'm busy.]
Hurry up! | Shall we get going? / Time's getting on. | Time's getting on – shall we get going? | Shall we get going? The film starts at eight. | We'll miss the train – [hurry up!]
Wait. | Hold on a moment. / Bear with me. | Bear with me – I'll find it. | Hold on a moment, I'm nearly done. | [Wait,] I've forgotten my keys.
Look! | Have a look at this. / Would you look at that. | Would you look at that – a rainbow. | Have a look at this photo. | [Look!] There's a deer by the road.
It's raining a lot. | It's pouring. / It's coming down in buckets. | Take an umbrella – it's pouring. | It's coming down in buckets out there. | Don't go out yet – [it's raining a lot].
I'm hungry. | I could eat. / I'm a little peckish. | "Dinner?" – "I could eat." | I'm a little peckish – any snacks? | It's been five hours – [I'm hungry].
I'm full. | I couldn't eat another bite. / I'm stuffed. | That was wonderful, but I couldn't eat another bite. | No dessert for me – I'm stuffed. | "More potatoes?" – "No, thanks – [I'm full]."
Tell me. | Do tell. / I'm all ears. | "I've got news." – "Do tell!" | Go on, I'm all ears. | "Guess what happened at work?" – "[Tell me.]"
That's not important. | That's beside the point. / That's neither here nor there. | Who started it is beside the point. | The colour is neither here nor there – does it work? | Whether it was Monday or Tuesday – [that's not important].
Let's start. | Shall we begin? / Let's get the ball rolling. | Right, shall we begin? | Let's get the ball rolling with a quick update. | Everyone's here – [let's start].
Good luck. | Best of luck. / Fingers crossed. / Break a leg. | Best of luck with the interview! | Fingers crossed for tomorrow. | Your exam is today? [Good luck!]
I'm sure. | I'm certain. / Without a doubt. / I'd stake my life on it. | Without a doubt, it's the best café in town. | I'm certain I locked the door. | He'll be late again – [I'm sure].
maybe | perhaps / possibly / it's conceivable that… | Perhaps we could meet on Friday. | It's conceivable that he just forgot. | [Maybe] we should take the train instead.
a lot of | a great deal of / plenty of / no shortage of | There's no shortage of opinions at our table. | She's put a great deal of work into this. | We have [a lot of] time before the flight.
I don't like it. | It's not quite to my taste. / It doesn't do much for me. | The design is not quite to my taste. | Jazz doesn't do much for me, I'm afraid. | "Do you like the new logo?" – "[I don't like it.]"
You're right. | Fair point. / You have a point there. / I stand corrected. | Fair point – I hadn't thought of that. | You're quite right – I stand corrected. | "It closes at six, not seven." – "[You're right.]"
It's boring here. | It's a little quiet tonight. / Not exactly the life of the party. | It's a little quiet tonight, isn't it? | This bar is not exactly the life of the party. | Nobody's dancing – [it's boring here].
I'm happy to meet you. | It's a pleasure to meet you. / Delighted to make your acquaintance. | It's a pleasure to meet you – I've heard a lot about you. | Delighted to make your acquaintance. | "This is my sister, Anna." – "[I'm happy to meet you.]"
`;

ENG_RAW.phr=String.raw`
# situation | phrase (/ alternatives) | example 1 | example 2 | test: a situation – you say the phrase
Disagreeing politely | With respect, I see it differently. / I take your point, but… | I take your point, but I think timing matters more. | With respect, I see it differently – price isn't the problem. | Your colleague says the plan is perfect. You think the deadline is too short. You say…
Adding another point | What's more… / On top of that… | It's cheaper – what's more, it's closer. | The hotel was lovely. On top of that, breakfast was free. | You recommend your gym: it's close, and it's open all night. You say…
Admitting something before your main point | Granted, … / Admittedly, … | Granted, it's not perfect. But it works. | Admittedly, I was late – but the train was cancelled. | Your car is old but has never broken down. Defend it…
Changing the subject smoothly | That reminds me… / On a different note… | That reminds me – how was your trip? | On a different note, are you free on Saturday? | You're talking about coffee and remember you wanted to ask about the party. You say…
Coming back to the main topic | Anyway, where was I? / But I digress. | But I digress – the point is, we need a bigger van. | Anyway, where was I? Ah yes, the budget. | You've wandered into a long side story at dinner. Get back to the main one…
Buying time to think | That's a good question. / Let me think about that for a second. | That's a good question – let me think about that for a second. | Hmm, that's a good question. I'd say… | At an interview: "Where do you see yourself in five years?" Start your answer…
Searching for a word without panic | What's the word… / How shall I put it… | It was… how shall I put it… a little chaotic. | He's very… what's the word… stubborn. | You can't find the word to describe your boss. Stay calm and say…
Giving your opinion carefully | As far as I'm concerned… / The way I see it… | The way I see it, we have two options. | As far as I'm concerned, family comes first. | Friends ask: city or countryside? Begin your answer…
Being very honest | To be perfectly honest… / If I'm being frank… | If I'm being frank, I didn't enjoy the film. | To be perfectly honest, I'd rather stay in tonight. | A friend asks if you like his new car. You don't. Say it kindly…
Showing you understand | I see what you mean. / That makes sense. | I see what you mean – it's a tough choice. | That makes sense. I'd probably do the same. | A colleague explains why she's tired of her job. Show you understand…
Asking someone to explain | What do you mean by that, exactly? / Could you elaborate? | Could you elaborate on that? | What do you mean by that, exactly? | Someone says, "Your idea is interesting… in a way." Ask what they mean…
Agreeing strongly | Couldn't have put it better myself. | "Life's too short for bad coffee." – "Couldn't have put it better myself." | Couldn't have put it better myself – well said. | Your friend says family is the only real wealth. You fully agree. You say…
Interrupting politely | Sorry to interrupt, but… / If I could just jump in… | If I could just jump in here – we're running out of time. | Sorry to interrupt, but your taxi is here. | In a meeting someone is talking, but you have urgent news. You say…
Summing up | In a nutshell… / All in all… / To cut a long story short… | So, to cut a long story short, we won. | All in all, it was a wonderful trip. | You've told a long story about your holiday. Finish it…
Giving an example | Take… for example. / Say, … | Take Prague, for example. | Pick a city – say, Vienna – and go for a weekend. | You claim old cities are beautiful in winter. Give an example…
Saying you're not certain | As far as I know… / If I'm not mistaken… | If I'm not mistaken, it opens at nine. | As far as I know, she's still in Germany. | Someone asks when the shop closes. You think six, but you're not sure. You say…
Contrasting two things | On the one hand… on the other hand… | On the one hand, it pays well; on the other hand, I'd hardly see my family. | On the one hand it's cheap; on the other hand it's far away. | Compare working in Germany with working at home…
Making a suggestion | How about…? / Why don't we…? / Might I suggest…? | Might I suggest the terrace? It's lovely in the evening. | Why don't we take the train instead? | Your friends can't decide where to eat. Suggest a place…
Accepting an invitation | I'd love to. / That sounds wonderful – count me in. | That sounds wonderful – count me in. | I'd love to. What time? | Friends invite you to a barbecue on Saturday. Accept…
Declining an invitation | I'd love to, but I'm afraid I can't make it. | I'd love to, but I'm afraid I can't make it this time. | Thank you for thinking of me – sadly, I can't make it. | A colleague invites you to his birthday, but you'll be away. Decline warmly…
Complimenting someone's work | You've really outdone yourself. | This dinner is amazing – you've really outdone yourself. | You've really outdone yourself with this design. | Your friend renovated his kitchen beautifully. Compliment him…
Accepting a compliment | That's very kind of you to say. | "You speak great English." – "That's very kind of you to say." | That's very kind of you to say – thank you. | Someone says your presentation was excellent. Accept it gracefully…
Apologising properly | I owe you an apology. / That was my mistake – I'm sorry. | I owe you an apology for yesterday. | That was my mistake – I'm sorry, I'll fix it. | You forgot your friend's birthday. Apologise properly…
Ending a conversation nicely | I won't keep you any longer. / It's been a pleasure – let's continue this soon. | Well, I won't keep you any longer – have a lovely evening. | It's been a pleasure – let's continue this soon. | You're chatting at a party but need to leave. End it nicely…
Introducing yourself | Allow me to introduce myself – I'm Josef. | Allow me to introduce myself – I'm Josef, I look after the cameras here. | Allow me to introduce myself – we haven't met yet. | You meet a guest speaker at church. Introduce yourself…
Introducing two people | Have you two met? Anna, this is Tom – he's the one who… | Have you two met? Anna, this is Tom – he's the one who climbed Kilimanjaro. | Have you two met? This is Petr – he knows everything about coffee. | Introduce your gym friend to your sister, with one interesting detail…
Asking for a favour | I wonder if you could do me a small favour. | I wonder if you could do me a small favour – could you water my plants? | I wonder if you could help me with something. | You need a neighbour to take in a parcel. Ask…
Showing surprise | You don't say! / Well, I never! | "He's getting married." – "You don't say!" | Well, I never – you've grown a beard! | A friend tells you he's moving to Japan. React…
Showing you're impressed | I'm genuinely impressed. / Hats off to you. | You ran a marathon? Hats off to you. | I'm genuinely impressed – that's beautiful work. | Your friend learned the piano in one year. React…
Expressing sympathy | I'm so sorry to hear that. / That must have been difficult. | I'm so sorry to hear about your father. | That must have been difficult for you. | A colleague tells you she lost her job. Respond with care…
Encouraging someone | You've got this. / I have every confidence in you. | You've prepared well – you've got this. | I have every confidence in you. | Your brother is nervous before his driving test. Encourage him…
Making a toast | I'd like to raise a glass to… | I'd like to raise a glass to our wonderful hosts. | I'd like to raise a glass to the happy couple. | At a friend's birthday dinner you stand up with a glass. You say…
Being humble about your opinion | I could be wrong, but… / For what it's worth… | For what it's worth, I'd go with the blue one. | I could be wrong, but I think it's on the left. | A friend can't choose between two jobs. Give your view modestly…
Asking for someone's opinion | What's your take on this? / I'd value your opinion. | What's your take on this? | I'd value your opinion before I sign. | You're thinking of buying a used car. Ask a friend who knows cars…
Saying something is obvious | It goes without saying… | It goes without saying that you're invited. | It goes without saying – we'll pay you back. | Tell friends they can stay at your place any time – of course…
Avoiding a topic politely | I'd rather not get into that, if you don't mind. | I'd rather not get into that, if you don't mind. | Let's not get into politics tonight, if you don't mind. | Someone asks how much you earn. Avoid it politely…
Expressing a strong preference | I'd much rather… / Given the choice, I'd… | Given the choice, I'd take the mountains over the beach. | I'd much rather walk than wait for the bus. | Someone asks: city break or beach holiday? Answer…
Telling a story – the start | You'll never guess what happened… / Funny story, actually… | You'll never guess what happened at the gym today. | Funny story, actually – I met him on a train. | Start a story about something strange that happened at work…
Telling a story – the twist | And that's when things got interesting. | We were almost home – and that's when things got interesting. | And that's when things got interesting: the lights went out. | You're telling a camping story. The bear is about to appear…
Talking about the future with hope | I'm looking forward to… / I can't wait to… | I'm really looking forward to the summer. | I can't wait to see the mountains again. | Tell someone about your trip next month…
Thanking a host | Thank you for having me – it was a wonderful evening. | Thank you for having me – it was a wonderful evening. | Thanks so much for having us – the food was superb. | You're leaving dinner at friends' house. Thank them…
Asking how someone is (deeper) | How are you keeping? / How's life treating you? | How's life treating you these days? | Good to see you! How are you keeping? | You meet an old friend you haven't seen for a year. Greet him…
Answering "How are you?" with a smile | Can't complain – and it wouldn't help if I did! | "How are you?" – "Can't complain – and it wouldn't help if I did!" | Can't complain! And you? | Your neighbour asks "How are you?" on a grey Monday. Answer…
Saying something is the best | It's second to none. / It's in a league of its own. | Their bread is second to none. | That café is in a league of its own. | Recommend the best burger place in town…
Saying it's time to leave | I'd better be making a move. | Right, I'd better be making a move – early start tomorrow. | It's late – I'd better be making a move. | It's 11 pm at a friend's house. Say you're leaving…
Agreeing, with a condition | Yes – provided that… / As long as… | Yes – provided that we leave early. | I'll come, as long as there's no karaoke. | A friend asks you to help him move. Agree, with a condition…
Making a point stronger | Not only… but… | Not only was it cheap, but it was delicious. | Not only did he fix the car, but he washed it too. | Praise a hotel that was cheap and had a wonderful view…
Answering a hard question honestly | I won't pretend to know the answer, but… | I won't pretend to know the answer, but here's what I think. | I won't pretend to be an expert, but… | Someone asks why there is suffering in the world. Begin honestly…
Bringing someone into the conversation | What do you think, Tom? You know more about this than I do. | What do you think, Tom? You know more about this than I do. | Anna, you've been to Italy – what would you recommend? | At dinner, a quiet guest knows a lot about wine. Bring him in…
Ending your opinion confidently | That's my two cents. / That's how I see it, anyway. | Anyway, that's my two cents. | That's how I see it, anyway. | Finish giving your opinion about electric cars…
`;


ENG_RAW.wit=String.raw`
# technique | what they say | example replies (/ separated)
Understatement – say less than the truth | It's pouring with rain. | Lovely weather for a picnic. / Perfect day to wash the car.
Understatement – say less than the truth | The car broke down on the motorway. | Well, at least we get to enjoy the view. / Not exactly the road trip I had in mind.
Understatement – say less than the truth | I burned the dinner. | So we're having it extra crispy tonight. / The smoke alarm seems to approve.
Understatement – say less than the truth | There's a two-hour queue. | Plenty of time to get to know each other, then. / Good thing I'm a patient man.
Understatement – say less than the truth | The boss shouted at everyone today. | So, a quiet day at the office. / He's clearly a morning person.
Understatement – say less than the truth | It's minus twenty outside. | A touch chilly, wouldn't you say? / Perfect weather for ice cream.
Understatement – say less than the truth | I got lost three times on the way here. | Ah, you took the scenic route. / Very adventurous of you.
Understatement – say less than the truth | The meeting lasted four hours. | Short and sweet, then. / I think I aged slightly.
Exaggeration – make it hugely bigger | Is it cold outside? | Cold? I saw a penguin asking for a jacket. / My coffee froze on the way to my mouth.
Exaggeration – make it hugely bigger | I'm so hungry. | I'm hungry enough to eat the menu. / If it takes any longer, I'm starting on the table.
Exaggeration – make it hugely bigger | How was the traffic? | I've had shorter holidays. / I made friends with the driver next to me – we're godparents now.
Exaggeration – make it hugely bigger | You're on your phone a lot. | My phone and I are thinking of getting married. / It's not an addiction – it's a committed relationship.
Exaggeration – make it hugely bigger | Is this coffee strong? | Strong? One sip and I can hear colours. / I drank half and finished my tax return.
Exaggeration – make it hugely bigger | How big was the dog? | It had its own postcode. / I wasn't sure whether to pet it or ride it.
Exaggeration – make it hugely bigger | Did you sleep well? | So well that I woke up in a better mood than the sun. / Like a log. A very old, very lazy log.
Exaggeration – make it hugely bigger | My battery is at one percent. | Quick, say your goodbyes. / Shall we hold a small funeral?
Taking it literally | Can you make me a sandwich? | Poof – you're a sandwich. / I'd love to, but you're perfect as you are.
Taking it literally | Do you have the time? | I have plenty – how much do you need? / I do, but it's very limited – I'll lend you five minutes.
Taking it literally | Break a leg tonight! | Which one would you recommend? / I'd rather not – I've grown attached to both.
Taking it literally | Can you give me a hand? | Sure, but I'll need it back – I use it a lot. / Left or right?
Taking it literally | Keep an eye on my bag. | I'll keep both on it – it's a very nice bag. / Only one? The other one is busy.
Taking it literally | Do you want to grab a coffee? | Grab it? I'd rather sit down and drink it properly. / Only if we pay for it first.
Taking it literally | You look like you've seen a ghost. | I have – it was my bank balance. / He sends his regards, by the way.
Agree and amplify – agree, then make it bigger | You're so stubborn. | Thank you – I've trained for years. / I prefer "consistently right".
Agree and amplify – agree, then make it bigger | You're weird. | Thank you – normal was fully booked. / Not weird – limited edition.
Agree and amplify – agree, then make it bigger | You talk too much. | I know. It's a gift – mostly to myself. / You should hear me when I'm excited.
Agree and amplify – agree, then make it bigger | You're always late. | I like to make an entrance. / Punctuality is overrated – anticipation is everything.
Agree and amplify – agree, then make it bigger | You're such a nerd. | Guilty – I even alphabetise my spices. / Proudly. I'm working on a certificate.
Agree and amplify – agree, then make it bigger | You think you're so funny. | Only on days ending in "y". / Someone has to keep the standards up.
Agree and amplify – agree, then make it bigger | You're trouble. | Only the good kind. / I come with a warning label – didn't you read it?
Self-deprecation – laugh at yourself, lightly | Can you dance? | Let's say the dance floor has filed complaints. / I can – I just prefer to let others look good.
Self-deprecation – laugh at yourself, lightly | Are you good at cooking? | My smoke alarm cheers every time I cook. / I make excellent reservations.
Self-deprecation – laugh at yourself, lightly | Are you good with directions? | I once got lost in a lift. / My GPS has started sighing at me.
Self-deprecation – laugh at yourself, lightly | Do you sing? | Only in the shower – and the shower has asked me to stop. / Only when I want people to leave.
Self-deprecation – laugh at yourself, lightly | Are you a morning person? | I'm a morning person in the evening. / Before coffee, I'm more of a morning potato.
Self-deprecation – laugh at yourself, lightly | You speak so many languages! | Three – and on Monday mornings, none of them. / Yes, and I can be confused in all of them.
Callback – bring back something from earlier | (Earlier she said she can't cook.) "Would you like some cake?" | Did you make it? Should I call someone first? / Is this the famous cooking I've heard about?
Callback – bring back something from earlier | (Earlier he said he never gets lost.) "Hmm, this isn't the right place." | Good thing we've got a man who never gets lost. / Don't worry, I'm sure the restaurant moved.
Callback – bring back something from earlier | (Earlier she said she lives on coffee.) "I'm so tired." | Shall I call your coffee? It must be missing you. / I know a cure – brown, hot, comes in cups.
Playful tease – light, warm, never cruel | I'm never wrong. | That's what you said last Tuesday. / Could I get that in writing? I'll frame it.
Playful tease – light, warm, never cruel | I'm a really good driver. | Of course – the scratches are just decoration. / I'll hold the handle, just to show my respect.
Playful tease – light, warm, never cruel | I don't really like chocolate. | I'm not sure we can be friends. / Are you sure you're from this planet?
Playful tease – light, warm, never cruel | I'm a bit of a perfectionist. | I noticed – you've fixed your hair four times since we sat down. / Then you'll love me – I'm a nearly-perfectionist.
Playful tease – light, warm, never cruel | Guess how old I am. | Twenty-one – and I'm sticking to it whatever you say. / Old enough to know better, young enough to do it anyway.
`;

ENG_RAW.topic=String.raw`
# title | area | the brief | question to ask someone
The Mona Lisa | 🎨 Art | Painted by Leonardo da Vinci in the early 1500s, it hangs in the Louvre in Paris and is surprisingly small – about 77 × 53 cm. It became world-famous partly because it was stolen in 1911 by an Italian handyman and missing for two years. Her smile seems to change because Leonardo softly blurred the edges – a technique called sfumato. | Have you ever seen something famous that disappointed you in real life?
Why Venice is sinking | 🗺️ Geography | Venice is built on 118 small islands in a lagoon, standing on wooden piles driven into the mud. The ground slowly sinks while the sea rises, so floods ("acqua alta") are common. Since 2020 a system of movable barriers called MOSE can close off the lagoon during very high tides. | Would you rather visit Venice or Amsterdam?
How the stock market works | 💰 Money | A share is a tiny piece of ownership in a company. Companies sell shares to raise money; people buy them hoping the company will grow. Prices move with supply and demand – news, profits and fear. Most experts say ordinary people do best with low-cost index funds held for many years. | Do you think investing is more like saving or gambling?
The octopus | 🐾 Nature | An octopus has three hearts, blue blood, and about two thirds of its neurons in its arms – each arm can "taste" and react almost on its own. It changes colour and texture in a fraction of a second, squeezes through any hole bigger than its beak, and some carry coconut shells around as portable shelters. | Which animal do you think is the cleverest?
The fall of the Berlin Wall | 🏛️ History | Built in 1961 to stop East Germans fleeing to the West, the Wall divided Berlin for 28 years. On 9 November 1989 a confused press announcement suggested the border was open; crowds gathered and the guards let them through. Germany reunified less than a year later, in October 1990. | What did your parents tell you about life before 1989?
Why the sky is blue | 🔬 Science | Sunlight contains all colours. When it hits the air, short blue waves are scattered in every direction far more than red ones, so blue light reaches your eyes from all over the sky. At sunset the light travels through much more air, the blue is scattered away, and we see reds and oranges. | What's the most beautiful sunset you've ever seen?
What an architect really does | 💼 Jobs | An architect designs buildings, but most of the job is solving problems: budgets, building laws, light, heat and how people move through a space. It takes years of study and practice. Many great ones peaked late – Frank Lloyd Wright designed his most famous house, Fallingwater, when he was nearly seventy. | If you could start a completely different career, what would it be?
Vincent van Gogh | 🎨 Art | Van Gogh made around 900 paintings in only about ten years, yet sold very few while he was alive. His brother Theo supported him, and their letters reveal a gentle, thoughtful man. "The Starry Night" shows the view from his window at an asylum in Saint-Rémy. Today his paintings sell for tens of millions. | Is someone great if nobody recognises it while they're alive?
Iceland | 🗺️ Geography | Iceland sits where two tectonic plates pull apart, which is why it has volcanoes, geysers and hot springs. Almost all its electricity comes from water and underground heat. Fewer than 400,000 people live there, and belief in elves is taken seriously enough that roads have been rerouted around "elf rocks". | Would you rather live in a hot country or a cold one?
Inflation | 💰 Money | Inflation means prices rise over time, so the same money buys less. A little – about 2 % a year – is considered healthy; a lot is dangerous. It happens when there is more money or demand than there are goods. That is why cash under the mattress slowly loses its value. | What costs far more now than when you were a child?
Honeybees | 🐾 Nature | A honeybee colony can have tens of thousands of bees but only one queen. Workers tell each other where flowers are with a "waggle dance": the angle shows the direction, the length shows the distance. To make one jar of honey, bees visit around two million flowers. | Honey or jam – and why?
The Titanic | 🏛️ History | The Titanic sank on its first voyage in April 1912 after hitting an iceberg in the North Atlantic. More than 1,500 people died, partly because there were lifeboats for only about half of those on board. The disaster led to new safety rules at sea that are still followed today. | Why do you think the Titanic still fascinates people?
Why we dream | 🔬 Science | Most vivid dreams happen during REM sleep, when the brain is almost as active as when awake but the body is paralysed. Scientists still debate why we dream – sorting memories, rehearsing threats, or processing emotions. Most of our dreams are forgotten within minutes of waking. | Do you remember any dream from this week?
What a pilot's day looks like | 💼 Jobs | Airline pilots plan the route, check weather and fuel, and go through detailed checklists before every flight. Autopilot flies much of the journey, but pilots manage it and take over for take-off, landing and problems. They train in simulators regularly and pass medical checks throughout their career. | Would you ever trust a plane with no pilot?
Michelangelo and the Sistine Chapel | 🎨 Art | Michelangelo saw himself as a sculptor, not a painter, yet the Pope made him paint the chapel ceiling. It took about four years (1508–1512), working standing on scaffolding with his head bent back – not lying down, as people often say. "The Creation of Adam" is its most famous scene. | What did you do well even though you didn't want to do it?
The Sahara | 🗺️ Geography | The Sahara is almost as big as the United States, but only about a quarter of it is sand dunes – much is rock and gravel. Around 6,000 years ago it was green, with lakes, grass and hippos. Slow changes in the Earth's orbit gradually turned it into desert. | Would you rather cross a desert or a jungle?
Compound interest | 💰 Money | Compound interest means you earn interest on your interest. 1,000 at 7 % a year roughly doubles in ten years and quadruples in twenty. The "rule of 72": divide 72 by the interest rate to see how many years it takes to double. Starting early matters more than the amount. | If you had 10,000 today, what would you do with it?
The wolves of Yellowstone | 🐾 Nature | Wolves were brought back to Yellowstone National Park in 1995 after about seventy years. Elk stopped overgrazing by the rivers, trees grew back, beavers and birds returned, and riverbanks became more stable. Scientists call this a "trophic cascade" – one animal reshaping a whole landscape. | Should wolves be protected in Europe too?
The printing press | 🏛️ History | Around 1450 Johannes Gutenberg in Mainz built a press with movable metal letters. Books became faster and cheaper to make, ideas spread across Europe and more people learned to read. Without it, the Reformation and the scientific revolution could hardly have spread so fast. | Which invention has changed your life the most?
Why ice floats | 🔬 Science | Most substances become denser when they freeze, but water expands by about 9 %, so ice is lighter than liquid water and floats. That is why lakes freeze from the top down and fish survive the winter underneath. If ice sank, lakes would freeze solid. | Summer or winter – which brings out the best in you?
The sommelier | 💼 Jobs | A sommelier advises guests which wine suits their food. The best train for years, tasting thousands of wines and learning regions, grapes and soils. The top title, Master Sommelier, comes from one of the hardest exams in the world – only a few hundred people have ever passed it. | Is there a skill you'd love to master purely for pleasure?
Rembrandt and light | 🎨 Art | Rembrandt (1606–1669) was a Dutch painter famous for dramatic light and shadow. His "Night Watch" looked like a night scene mainly because of darkened old varnish. He painted around 80 self-portraits, showing himself from young success to old age and money troubles. | Would you like a portrait of yourself every ten years?
Japan | 🗺️ Geography | Japan is made of over 14,000 islands, though four big ones hold most of its 120 million people. It has around a hundred active volcanoes and frequent earthquakes, so tall buildings are designed to sway. Trains are so punctual that even tiny delays can bring a public apology. | What could Europe learn from Japan?
Supply and demand | 💰 Money | When something is rare and many people want it, the price rises; when there's plenty and few want it, the price falls. That is why flights cost more at Christmas and strawberries are cheap in June. Almost every price you see is this balance at work. | What do you think is most overpriced today?
Elephants | 🐾 Nature | Elephants recognise themselves in a mirror, mourn their dead and remember friends for decades. They communicate with deep rumbles that travel kilometres through the ground and partly "hear" through their feet. A herd is led by the oldest female, the matriarch. | If you were an animal, which would you be?
The Roman roads | 🏛️ History | The Romans built around 80,000 km of paved roads so that armies and trade could move quickly. Many modern European roads still follow their routes. They were built in layers – large stones, gravel and sand – and curved so that rain ran off. "All roads lead to Rome" comes from that network. | What will people remember our time for?
Why we get goosebumps | 🔬 Science | Goosebumps are tiny muscles pulling our hairs upright. For our furrier ancestors this trapped warm air or made them look bigger to enemies. Today it happens with cold – and with strong emotion, like a great song or a moving speech. | Which song gives you goosebumps?
Firefighters | 💼 Jobs | Most firefighter calls are not fires but road accidents, medical emergencies, floods and rescues. Training covers heat, smoke, heights and water. In many countries a large part of the force are volunteers who carry a pager and leave their own job when it goes off. | Which job do you respect the most?
Prague | 🗺️ Geography | Prague grew around its castle above the Vltava – one of the largest ancient castle complexes in the world. Charles Bridge was begun in 1357 under Charles IV, and the astronomical clock on Old Town Square, from 1410, is among the oldest still working. The city escaped most of the destruction of the Second World War. | How would you show Prague to a foreign friend in one day?
The Wright brothers | 🏛️ History | Orville and Wilbur Wright, bicycle makers from Ohio, made the first powered, controlled flight in December 1903. It lasted 12 seconds and covered about 37 metres – shorter than the wingspan of a modern jumbo jet. Only 66 years later, people walked on the Moon. | What will change the most in the next sixty years?
`;

// key words for retelling each topic, and a Wikipedia article for its picture (same order as ENG_RAW.topic)
const ENG_TOPIC_KEYS=["the Louvre, stolen in 1911, sfumato","118 islands, wooden piles, MOSE barriers","a share, supply and demand, index funds","three hearts, neurons in its arms, coconut shells","1961, a confused announcement, reunified in 1990","sunlight, scattered blue waves, sunset","solving problems, building laws, Fallingwater","900 paintings, his brother Theo, The Starry Night","tectonic plates, geothermal energy, elf rocks","prices rise, 2 % a year, cash loses value","one queen, the waggle dance, two million flowers","April 1912, an iceberg, too few lifeboats","REM sleep, the body is paralysed, memories and emotions","checklists, autopilot, simulators","a sculptor, four years, The Creation of Adam","as big as the US, a quarter is sand, green 6,000 years ago","interest on interest, the rule of 72, start early","1995, elk and rivers, a trophic cascade","Gutenberg, movable letters, the Reformation","expands by 9 %, freezes from the top, fish survive","wine and food, years of tasting, Master Sommelier","light and shadow, dark varnish, 80 self-portraits","14,000 islands, volcanoes and earthquakes, punctual trains","rare means expensive, Christmas flights, June strawberries","the mirror test, rumbles through the ground, the matriarch","80,000 km, layers of stone, all roads lead to Rome","tiny muscles, warmth or looking bigger, strong emotion","mostly not fires, hard training, volunteers with pagers","the castle, Charles Bridge 1357, the astronomical clock","December 1903, 12 seconds, the Moon 66 years later"];
const ENG_TOPIC_WIKI=["Mona_Lisa","Venice","New_York_Stock_Exchange","Octopus","Berlin_Wall","Diffuse_sky_radiation","Fallingwater","The_Starry_Night","Iceland","Inflation","Western_honey_bee","Titanic","Dream","Cockpit","Sistine_Chapel_ceiling","Sahara","Compound_interest","Wolves_in_Yellowstone","Printing_press","Iceberg","Sommelier","The_Night_Watch","Mount_Fuji","Strawberry","African_bush_elephant","Appian_Way","Goose_bumps","Firefighter","Prague_Castle","Wright_Flyer"];

// pictures from Wikipedia – once loaded, the service worker keeps them for offline use
const _img={};
async function wikiImg(t){ if(_img[t]!==undefined) return _img[t]; const k="kc_img_"+t, c=LS.get(k,null); if(c!==null) return _img[t]=c;
  try{ const j=await (await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(t))).json();
    const u=j.thumbnail&&j.thumbnail.source?j.thumbnail.source.replace(/\/\d+px-/,"/640px-"):""; LS.set(k,u); return _img[t]=u; }catch(e){ return ""; } }
function engImgs(){ document.querySelectorAll("img[data-wiki]:not([src])").forEach(async im=>{ const u=await wikiImg(im.dataset.wiki); if(u){ im.onerror=()=>im.remove(); im.src=u; } else im.remove(); }); }
async function prepOffline(btn){ btn.disabled=true; btn.textContent="Saving pictures…"; let n=0;
  for(const p of engPack().topic){ const u=p.wiki&&await wikiImg(p.wiki); if(u){ try{ await fetch(u,{mode:"no-cors"}); n++; }catch(e){} } }
  for(const f of ["./","index.html","core.js","eng.js"]) try{ await fetch(f); }catch(e){}
  LS.set("kc_offline",Date.now()); btn.textContent="✓ Ready for offline ("+n+" pictures)"; }
