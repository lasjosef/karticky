/* Tip Cards – English training pack.
   New cards are added a few per day (perDay). APPEND ONLY to the lists below – card ids follow the line position. */
const ENG_KINDS={
  word: {name:"Words",      emoji:"🧠", color:"#3e63dd", perDay:6, ask:"Say the word"},
  up:   {name:"Upgrades",   emoji:"🎩", color:"#8e4ec6", perDay:2, ask:"Say it more elegantly"},
  phr:  {name:"Phrases",    emoji:"🗣️", color:"#12a594", perDay:2, ask:"How would you put it?"},
  wit:  {name:"Wit",        emoji:"😄", color:"#f5a524", perDay:2, ask:"Quick – your reply"},
  topic:{name:"Topic talk", emoji:"🌍", color:"#30a46c", perDay:1, ask:"Explain it in 60 seconds"}};
const ENG_ORDER=["word","up","phr","wit","topic"];
const PHASES=["Fluency","Fluency","Fluency","Fluency","Style","Style","Style","Style","Performance","Performance","Performance","Performance"];
const SPEAKERS=[["David Attenborough","David Attenborough narration"],["Stephen Fry","Stephen Fry speech"],["Winston Churchill","Churchill we shall fight on the beaches speech"],["C. S. Lewis","C.S. Lewis BBC radio talk recording"],["Martin Luther King","Martin Luther King I have a dream full speech"],["John F. Kennedy","JFK we choose to go to the moon speech"],["Letters Live – Benedict Cumberbatch","Letters Live Benedict Cumberbatch"],["Alan Watts","Alan Watts lecture"],["Rowan Williams","Rowan Williams lecture"],["Sir Ken Robinson","Ken Robinson do schools kill creativity"]];
const ENG_RAW={};
let _engPack=null;
function engPack(){ if(_engPack) return _engPack; const P={};
  for(const k of ENG_ORDER){ P[k]=(ENG_RAW[k]||"").split("\n").map(s=>s.trim()).filter(s=>s&&!s.startsWith("#")).map((line,i)=>{
    const f=line.split("|").map(s=>s.trim()), id="en_"+k+"_"+(i+1);
    if(k==="word") return {id,cue:f[0],text:f[1],ex:f[2]||"",tr:f[3]||""};
    if(k==="up"||k==="phr") return {id,cue:f[0],text:f[1],ex:f[2]||""};
    if(k==="wit") return {id,tech:f[0],cue:f[1],text:f[2]||""};
    return {id,text:f[0],tech:f[1],ex:f[2]||"",cue:f[3]||""}; }); }
  return _engPack=P; }

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
      S.items.push({...p,deck:"eng",kind:k,cat:"en_"+k,level:0,due:t,intro:t,created:new Date().toISOString(),seen:0,upd:1}); room--; n++; } }
  if(n) persist(); return n; }
function engCardHTML(c,pos){
  const K=ENG_KINDS[c.kind]||ENG_KINDS.word, top=pos===0, open=c.kind==="topic"||(top&&U.revealed);
  let b="";
  if(c.kind==="word"){ const hint=c.text.split(" / ")[0].split(" ").map(w=>w[0]+"·".repeat(Math.max(0,w.length-1))).join("  ");
    b=`<div class="ek">${K.ask}</div><div class="eq">${esc(c.cue)}</div>`+(open?`<div class="ea">${esc(c.text)}</div>${c.ex?`<div class="ex">“${esc(c.ex)}”</div>`:""}${c.tr?`<div class="etr">🇨🇿 ${esc(c.tr)}</div>`:""}`
      :`<div class="hint">${esc(hint)}</div><div class="reveal">Say it out loud – then tap</div>`); }
  else if(c.kind==="up"){ b=`<div class="ek">${K.ask}</div><div class="eq">“${esc(c.cue)}”</div>`+(open?`<div class="ea small">${c.text.split(" / ").map(esc).join("<br>")}</div>${c.ex?`<div class="ex">${esc(c.ex)}</div>`:""}`:`<div class="reveal">Say a classier version – then tap</div>`); }
  else if(c.kind==="phr"){ b=`<div class="ek">${K.ask}</div><div class="eq">${esc(c.cue)}</div>`+(open?`<div class="ea small">${c.text.split(" / ").map(esc).join("<br>")}</div>${c.ex?`<div class="ex">“${esc(c.ex)}”</div>`:""}`:`<div class="reveal">Say it out loud – then tap</div>`); }
  else if(c.kind==="wit"){ b=`<div class="ek">${esc(c.tech)}</div><div class="eq">They say: <b>“${esc(c.cue)}”</b></div>`+(open?`<div class="ea small">${c.text.split(" / ").map(x=>"→ "+esc(x)).join("<br>")}</div>`:`<div class="tbar"><i></i></div><div class="reveal">Reply out loud within 10 seconds – then tap</div>`); }
  else { b=`<div class="ek">${esc(c.tech||"")}</div><div class="ea small">${esc(c.text)}</div><div class="brief">${esc(c.ex)}</div>${c.cue?`<div class="ex">💬 ${esc(c.cue)}</div>`:""}<button class="btn small talk" data-talk="1">▶ Talk 60 s</button>`; }
  return `<div class="tc eng ${pos===1?"back1":pos===2?"back2":""}" ${top?'id="top"':""} data-id="${c.id}">
    <div class="band" style="background:${K.color}"></div>
    <div class="head"><span class="tag" style="color:${K.color}">${K.emoji} ${K.name}</span><span class="hr"><span class="muted" style="font-size:13px">${LEVEL_LABEL[c.level||0]}</span>${top?`<button class="cdel" data-del="${c.id}" aria-label="Delete card">🗑</button>`:""}</span></div>
    <div class="body">${b}</div>
    <div class="foot"><span>${c.seen?"seen "+c.seen+"×":"new"}</span><span>${c.last==="know"?"✓ last time":c.last==="again"?"✕ last time":""}</span></div>
    <div class="stamp k" id="sk">KNOW</div><div class="stamp a" id="sa">AGAIN</div></div>`; }
function startTalk(btn){ let s=60; clearInterval(window._talk); btn.textContent="⏱ 60 s – go!";
  window._talk=setInterval(()=>{ s--; const el=document.querySelector("[data-talk]"); if(!el){ clearInterval(window._talk); return; }
    if(s<=0){ clearInterval(window._talk); el.textContent="✓ Done – swipe right"; try{ navigator.vibrate&&navigator.vibrate(300); }catch(e){} return; }
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
    <div class="row" style="margin-top:14px"><button class="btn" id="practice">Practice more</button></div></div>`; }
function engAdd(){ const a=U.add;
  return `<div class="top"><div><h1>New word</h1><p class="sub">Met a word or phrase while reading? Catch it.</p></div></div>
  <textarea class="hero" id="atext" placeholder="e.g. “meticulous”">${esc(a.text)}</textarea>
  <div class="lab"><span>Meaning <span style="text-transform:none;font-weight:500">(optional – Claude can fill it in later)</span></span></div>
  <input type="text" id="acue" value="${esc(a.cue)}" placeholder="what it means, in simple English">
  <div class="lab"><span>Example sentence</span></div>
  <input type="text" id="anote" value="${esc(a.note)}" placeholder="the sentence where you found it">
  <div class="savebar"><button class="btn main full" id="asave" ${a.text.trim()?"":"disabled style='opacity:.4'"}>Save word</button></div>`; }

ENG_RAW.word=String.raw`
# meaning | word | example | Czech
# --- everyday words that go missing under pressure ---
to move an event to a later time | postpone | We had to postpone the meeting until Friday. | odložit
not able to decide between two options | torn | I'm torn between the two offers. | rozpolcený
to stop for a moment because you are unsure | hesitate | Don't hesitate to call me. | váhat
to say no to an invitation, politely | decline | I'm afraid I'll have to decline. | zdvořile odmítnout
to suddenly understand something | realise | I suddenly realised I'd left my keys at home. | uvědomit si
to make someone feel less worried | reassure | She reassured me that everything was fine. | uklidnit, ujistit
to make someone agree to do something by talking | persuade | I persuaded him to come along. | přemluvit
to say that you were wrong | admit | I admit I was wrong about that. | přiznat
to make something easier to understand | clarify | Could you clarify what you mean? | objasnit
to deal successfully with something difficult | cope | How do you cope with all that stress? | zvládat
to think about something carefully before deciding | consider | I'll consider your offer. | zvážit
to have enough money or time for something | afford | I can't afford to lose this client. | dovolit si
to guess a number or amount roughly | estimate | I'd estimate about fifty people came. | odhadnout
to notice something that is hard to see | spot | Did you spot the mistake? | všimnout si
to look at something very quickly | glance | I glanced at my watch. | letmo pohlédnout
extremely tired | exhausted | After the shift I was completely exhausted. | vyčerpaný
feeling ashamed and awkward in front of others | embarrassed | I was so embarrassed I went red. | v rozpacích
not paying attention because of something else | distracted | Sorry, I got distracted. | roztržitý
not willing to change your mind | stubborn | He's as stubborn as a mule. | tvrdohlavý
very surprised | astonished | I was astonished by how cheap it was. | ohromený
when two things happen at the same time by chance | coincidence | What a coincidence – I was just thinking of you! | náhoda
the feeling or mood of a place | atmosphere | The atmosphere in the room was electric. | atmosféra
the main idea, without the details | gist | I didn't catch every word, but I got the gist. | podstata
to say something is true, often without proof | claim | He claims he's never been late. | tvrdit
to give a good reason for something | justify | How can they justify that price? | ospravedlnit
something you must do because of a duty or promise | obligation | You're under no obligation to buy. | povinnost
a strong sudden wish to do something | urge | I had a sudden urge to laugh. | nutkání
to cause something to start happening | trigger | What triggered the argument? | vyvolat, spustit
to finally agree after refusing for a while | give in | In the end, I gave in. | ustoupit, povolit
to stop being involved in a plan you agreed to | back out | He backed out at the last minute. | vycouvat
to look for information about a problem | look into | Leave it with me – I'll look into it. | prověřit
to describe the main points briefly | sum up | To sum up, it was a good year. | shrnout
to imagine something clearly in your mind | picture | Picture this: a cabin, a fire, total silence. | představit si
to check again that something is correct | double-check | Let me double-check the date. | zkontrolovat znovu
to ask for something formally and politely | request | I'd like to request a day off. | žádat
a person you work with | colleague | A colleague of mine recommended this place. | kolega
the money you pay for a service | fee | There's a small booking fee. | poplatek
food left over after a meal | leftovers | We had the leftovers for lunch. | zbytky
a short sleep during the day | nap | I need a quick nap. | šlofík
to breathe out loudly when tired, sad or annoyed | sigh | She sighed and sat down. | povzdechnout si
coming soon, planned for the near future | upcoming | Are you ready for the upcoming trip? | nadcházející
to make something bad become worse | worsen | The weather worsened in the afternoon. | zhoršit se
to say no to something firmly | reject | They rejected our proposal. | zamítnout
a thing you do regularly, almost without thinking | habit | Reading before bed has become a habit. | zvyk
a feeling of worry about something important | concern | My main concern is the budget. | obava
to take part in an activity with others | join in | Everyone joined in the singing. | přidat se
to stay calm and patient when you are annoyed | bear with | Bear with me for a moment. | mít strpení
to tell someone about a danger before it happens | warn | I did warn you about the traffic. | varovat
to treat someone or something as unimportant | dismiss | Don't dismiss the idea too quickly. | odbýt, zamítnout
the result you get for your effort | reward | The view at the top was the reward. | odměna
# --- precise words: the exact word instead of the first one ---
very careful about every small detail | meticulous | She keeps meticulous records. | pečlivý, úzkostlivě přesný
honest and direct, even when it is uncomfortable | candid | Can I be candid with you? | upřímný, otevřený
not willing to do something | reluctant | He was reluctant to admit it. | neochotný
dealing with things in a practical, realistic way | pragmatic | Let's be pragmatic about this. | pragmatický
able to express ideas beautifully and clearly | eloquent | He gave an eloquent speech. | výmluvný
working hard and carefully | diligent | She's a diligent worker. | pilný, svědomitý
having more than one possible meaning | ambiguous | His answer was rather ambiguous. | dvojznačný
small and not obvious, but noticeable | subtle | There's a subtle difference. | jemný, nenápadný
able to recover quickly after difficulties | resilient | Kids are remarkably resilient. | odolný
not giving up easily | tenacious | He's a tenacious negotiator. | houževnatý
careful not to spend much money | frugal | My grandfather lived a frugal life. | skromný, šetrný
kind, polite and generous, especially to others | gracious | She was gracious in defeat. | laskavý, vlídný
not thinking you are better than others | humble | Despite his success, he stayed humble. | pokorný
very deep, serious or meaningful | profound | It had a profound effect on me. | hluboký
certain to happen; impossible to avoid | inevitable | Change is inevitable. | nevyhnutelný
seeming likely to be true | plausible | That's a plausible explanation. | věrohodný
small and unimportant | trivial | Don't worry about such trivial things. | banální
very clear and full of detail, like a picture | vivid | I have a vivid memory of that day. | živý, barvitý
short and clear, without extra words | concise | Keep your answer concise. | stručný
logical and easy to follow | coherent | Give me a coherent plan. | souvislý, logický
able to do many different things well | versatile | He's a versatile player. | všestranný
done without planning, naturally | spontaneous | Let's do something spontaneous this weekend. | spontánní
feeling happy and a little sad when remembering the past | nostalgic | This song makes me nostalgic. | nostalgický
honest and meant truly | sincere | Please accept my sincere apologies. | upřímný
friendly but polite and formal | cordial | We had a cordial conversation. | srdečný, zdvořilý
careful not to cause embarrassment; keeping secrets | discreet | Don't worry, I'll be discreet. | diskrétní
able to say difficult things without upsetting people | tactful | That was a tactful way of putting it. | taktní
careful and sensible, avoiding risks | prudent | It would be prudent to wait. | rozvážný
doing things suddenly without thinking first | impulsive | It was an impulsive purchase. | impulzivní
treating people as if they are less intelligent than you | condescending | Don't be so condescending. | povýšený
not caring or interested at all | indifferent | She seemed indifferent to the result. | lhostejný
a little worried about something in the future | apprehensive | I was apprehensive about the interview. | znepokojený
extremely happy and excited | elated | We were elated when we heard the news. | nadšený, v sedmém nebi
very confused | bewildered | He looked bewildered by the question. | zmatený
very interested because something is unusual | intrigued | I'm intrigued – tell me more. | zaujatý, zvědavý
so interesting that it holds your attention | captivating | She's a captivating storyteller. | podmanivý
long and boring | tedious | Filling in forms is tedious. | únavný, nudný
ordinary and not interesting | mundane | Even mundane tasks can be done with joy. | všední
unusual and worth noticing | remarkable | That's a remarkable achievement. | pozoruhodný
extremely beautiful and delicate | exquisite | The food was exquisite. | vybraný, vynikající
perfect, without any faults | impeccable | His manners are impeccable. | bezvadný
real and honest, not fake | genuine | She has a genuine interest in people. | opravdový
never having happened before | unprecedented | It was an unprecedented situation. | bezprecedentní
famous for something bad | notorious | The road is notorious for accidents. | nechvalně známý
famous and respected for something good | renowned | The city is renowned for its architecture. | proslulý
more than enough | ample | There's ample time to finish. | dostatečný, hojný
not enough; hard to find | scarce | Good builders are scarce these days. | vzácný, nedostatkový
very determined and not willing to change your mind | adamant | She was adamant that she was right. | neoblomný
serious and sincere | earnest | He made an earnest effort to help. | vážný, upřímný
clever and funny with words | witty | She's very witty. | vtipný, duchaplný
able to express thoughts clearly in words | articulate | He's a very articulate young man. | výřečný, jasně se vyjadřující
having a strong personality that attracts people | charismatic | A charismatic leader. | charismatický
so interesting or convincing that you must pay attention | compelling | She made a compelling argument. | přesvědčivý
done on purpose, after thinking | deliberate | It was a deliberate choice. | záměrný
very interested and eager | keen | I'm keen to hear your view. | dychtivý, horlivý
having mixed feelings about something | ambivalent | I'm ambivalent about moving. | rozpolcený
probably not true or honest; suspicious | dubious | That sounds a bit dubious to me. | pochybný
done too quickly, without enough thought | hasty | Let's not make a hasty decision. | ukvapený
calm and peaceful | serene | The lake was perfectly serene. | klidný, poklidný
causing a strong feeling of sadness | poignant | It was a poignant moment. | dojemný
# --- elegant words: polish, used sparingly ---
although (formal, short) | albeit | It worked, albeit slowly. | i když, byť
in spite of what was just said | nonetheless | It was risky; nonetheless, we went ahead. | nicméně
to think about something deeply for a long time | ponder | I've been pondering your question. | přemítat
to enjoy something very much | relish | I relish a good challenge. | vychutnávat si
to enjoy something slowly to make it last | savour | Savour the moment. | vychutnat
to love and protect something precious | cherish | I cherish those memories. | opatrovat, hýčkat
to think deeply about something for a long time | contemplate | He contemplated the offer for a week. | rozjímat, zvažovat
a serious attempt to do something (formal) | endeavour | We will endeavour to help. | úsilí, snažit se
a person you know a little, not a close friend | acquaintance | He's an acquaintance from work. | známý
two weeks | fortnight | I'll be away for a fortnight. | dva týdny
very rarely | seldom | We seldom see snow here. | zřídka
always, every time without exception | invariably | He's invariably late. | vždy, neměnně
I accept that this is true (before an argument) | admittedly | Admittedly, I was tired. | nutno uznat
probably, as you would expect | presumably | Presumably, he's already left. | pravděpodobně
I think it is likely (old-style, charming) | I daresay | I daresay you're right. | troufám si říct
of course, certainly – please do | by all means | By all means, take a seat. | ale samozřejmě
very good, excellent (British, classic) | splendid | What a splendid idea! | skvělý
very pleasant and charming | delightful | We had a delightful evening. | rozkošný, nádherný
very bad or unpleasant | dreadful | The traffic was dreadful. | hrozný
wonderful, extremely good | marvellous | You look marvellous. | báječný
slightly confused and amused | bemused | He looked bemused by the fuss. | zmateně pobavený
deserving praise | commendable | That's a commendable effort. | chvályhodný
not trying to look important; modest | unassuming | He's quiet and unassuming. | nenápadný, skromný
a little bit (informal, charming) | a tad | It's a tad cold today. | trošku
to feel more likely to think or do something | inclined | I'm inclined to agree. | nakloněný
very gentle, polite and kind (old style, of a man) | gentlemanly | That was very gentlemanly of you. | gentlemanský
ending a sentence – "as it happens" | as it were | He was, as it were, the king of the party. | takříkajíc
an unusual and lucky discovery | serendipity | Meeting her was pure serendipity. | šťastná náhoda
a feeling of great happiness and excitement | exhilaration | The exhilaration of the first jump! | rozjařenost, opojení
the pleasure of doing nothing | idleness | A little idleness on Sunday is healthy. | zahálka
a short, clever, funny saying | quip | He answered with a quick quip. | vtip, bonmot
the quality of being able to laugh at life | good humour | She took it in good humour. | dobrá nálada, nadhled
calmness and good judgement in difficult situations | composure | He kept his composure. | rozvaha, klid
great respect for someone | admiration | I have great admiration for her. | obdiv
showing great attention to good manners | courteous | He was courteous to everyone. | zdvořilý
to show thanks formally | express my gratitude | I'd like to express my gratitude. | vyjádřit vděčnost
`;

ENG_RAW.up=String.raw`
# plain | elegant versions (/ separated) | note or example
I think… | I'd say… / I'm inclined to think… / If you ask me… | Softer and more thoughtful than a flat "I think".
very tired | worn out / drained / weary | "I'm absolutely drained after this week."
very good | excellent / splendid / superb | "That was a splendid dinner."
very bad | dreadful / appalling / atrocious | "The service was appalling."
very big | enormous / immense / vast | "A vast landscape opened up before us."
very small | tiny / minute (my-NEWT) / minuscule | "The difference is minute."
very happy | delighted / thrilled / overjoyed | "I'm delighted to hear that."
very sad | heartbroken / devastated / downcast | "She was devastated by the news."
very angry | furious / livid / incensed | "He was livid when he found out."
very scared | terrified / petrified | "I was petrified of the dark as a child."
very interesting | fascinating / captivating / riveting | "The book was absolutely riveting."
very boring | tedious / dull / mind-numbing | "The lecture was mind-numbing."
very beautiful | stunning / breathtaking / exquisite | "The view was breathtaking."
very hungry | starving / famished | "I'm famished – shall we eat?"
very easy | effortless / a breeze | "The exam was a breeze."
very hard | gruelling / demanding / arduous | "It was a gruelling climb."
very important | crucial / vital / essential | "Timing is crucial here."
very smart | brilliant / sharp / astute | "That's an astute observation."
very funny | hilarious / priceless | "His face was priceless."
very old | ancient / antique / time-worn | "An ancient oak stood by the gate."
I don't know. | I couldn't say. / I'm not entirely sure. / That's a good question – I'd have to think about it. | Calm and confident instead of empty.
Yes. | Absolutely. / Certainly. / Indeed. / By all means. | Pick one that fits – "Indeed" sounds especially classic.
No. | I'm afraid not. / Not quite. / I'd rather not. | Polite refusal without sounding cold.
I want… | I'd like… / I'd love… / I'd be grateful for… | "I'd be grateful for your help."
Can you…? | Would you mind…? / Could I ask you to…? | "Would you mind passing the salt?"
Sorry. | My apologies. / Forgive me. / I do apologise. | "Forgive me, I didn't catch your name."
Thanks. | Much appreciated. / That's very kind of you. / I'm most grateful. | "That's very kind of you."
It's OK. | Not at all. / Think nothing of it. / No harm done. | Reply to someone apologising.
I agree. | Quite right. / Couldn't agree more. / Precisely. | "Couldn't agree more."
I don't agree. | I see it a little differently. / I'm not sure I'd go that far. | Disagreeing with class, not conflict.
It's expensive. | It's rather steep. / It's not exactly a bargain. | Understatement sounds smarter than complaining.
It's cheap. | It's a steal. / It's very reasonable. | "At that price, it's a steal."
I'm busy. | I'm a little stretched at the moment. / My plate is rather full. | Polite and calm.
Hurry up! | Shall we get going? / Time's getting on. | Gentle push without stress.
Wait. | Hold on a moment. / Bear with me. | "Bear with me – I'll find it."
Look! | Have a look at this. / Would you look at that. | "Would you look at that – a rainbow."
It's raining a lot. | It's pouring. / It's coming down in buckets. | Idioms make small talk alive.
I'm hungry. | I could eat. / I'm peckish. | "Peckish" = a little hungry, very British.
I'm full. | I couldn't eat another bite. / I'm stuffed. | After a big meal.
Tell me. | Do tell. / I'm all ears. | Shows real interest.
That's not important. | That's beside the point. / That's neither here nor there. | Steers a conversation back.
Let's start. | Shall we begin? / Let's get the ball rolling. | Opening a meeting or task.
Good luck. | Best of luck. / Fingers crossed. / Break a leg. | "Break a leg" for performances.
I'm sure. | I'm certain. / Without a doubt. / I'd stake my life on it. | Strong, confident.
maybe | perhaps / possibly / it's conceivable that… | "Perhaps we could meet on Friday."
a lot of | a great deal of / plenty of / no shortage of | "There's no shortage of opinions."
I don't like it. | It's not quite to my taste. / It doesn't do much for me. | Refined, never rude.
You're right. | Fair point. / You have a point there. / I stand corrected. | "I stand corrected" = graceful admitting.
It's boring here. | It's a little quiet tonight. / Not exactly the life of the party. | Understatement again – it's charming.
I'm happy to meet you. | It's a pleasure to meet you. / Delighted to make your acquaintance. | Classic, warm introduction.
`;

ENG_RAW.phr=String.raw`
# situation | phrase (/ alternatives) | example
Disagreeing politely | With respect, I see it differently. / I take your point, but… | "I take your point, but I think timing matters more."
Adding another point | What's more… / On top of that… | "It's cheaper – what's more, it's closer."
Admitting something before your main point | Granted, … / Admittedly, … | "Granted, it's not perfect. But it works."
Changing the subject smoothly | That reminds me… / On a different note… | "That reminds me – how was your trip?"
Coming back to the main topic | Anyway, where was I? / But I digress. | "But I digress – the point is…"
Buying time to think | That's a good question. / Let me think about that for a second. | Sounds wise, not lost.
Searching for a word without panic | What's the word… / How shall I put it… | Keeps you calm when the fog comes.
Giving your opinion carefully | As far as I'm concerned… / The way I see it… | "The way I see it, we have two options."
Being very honest | To be perfectly honest… / If I'm being frank… | "If I'm being frank, I didn't enjoy it."
Showing you understand | I see what you mean. / That makes sense. | Simple and warm.
Asking someone to explain | What do you mean by that, exactly? / Could you elaborate? | "Could you elaborate on that?"
Agreeing strongly | Couldn't have put it better myself. | Big compliment to the speaker.
Interrupting politely | Sorry to interrupt, but… / If I could just jump in… | "If I could just jump in here…"
Summing up | In a nutshell… / All in all… / So, to cut a long story short… | "So, to cut a long story short, we won."
Giving an example | Take… for example. / Say, … | "Take Prague, for example."
Saying it's not certain | As far as I know… / If I'm not mistaken… | "If I'm not mistaken, it opens at nine."
Contrasting two things | On the one hand… on the other hand… | Classic, clear structure.
Making a suggestion | How about…? / Why don't we…? / Might I suggest…? | "Might I suggest the terrace?"
Accepting an invitation | I'd love to. / That sounds wonderful – count me in. | Warm and quick.
Declining an invitation | I'd love to, but I'm afraid I can't make it. | Keeps the door open.
Complimenting someone's work | You've really outdone yourself. | Big, elegant compliment.
Accepting a compliment | That's very kind of you to say. | No "oh no, it was nothing".
Apologising properly | I owe you an apology. / That was my mistake – I'm sorry. | Owns it, no excuses.
Ending a conversation nicely | I won't keep you any longer. / It's been a pleasure – let's continue this soon. | Leaves a good last impression.
Introducing yourself | Allow me to introduce myself – I'm Josef. | Classic and confident.
Introducing two people | Have you two met? Anna, this is Tom – he's the one who… | Add one interesting detail.
Asking for a favour | I wonder if you could do me a small favour. | "I wonder if…" is softer.
Showing surprise | You don't say! / Well, I never! | Playful, old-style.
Showing you're impressed | I'm genuinely impressed. / Hats off to you. | "Hats off to you for finishing that."
Expressing sympathy | I'm so sorry to hear that. / That must have been difficult. | Then stop and listen.
Encouraging someone | You've got this. / I have every confidence in you. | Second one is classy.
Making a toast | I'd like to raise a glass to… | "I'd like to raise a glass to our hosts."
Being humble about your opinion | I could be wrong, but… / For what it's worth… | "For what it's worth, I'd go with the blue one."
Asking for someone's opinion | What's your take on this? / I'd value your opinion. | Makes people feel respected.
Saying something is obvious | It goes without saying… | "It goes without saying that you're invited."
Avoiding a topic politely | I'd rather not get into that, if you don't mind. | Firm and polite.
Expressing a strong preference | I'd much rather… / Given the choice, I'd… | "Given the choice, I'd take the mountains."
Telling a story – starting | You'll never guess what happened… / Funny story, actually… | Hooks attention.
Telling a story – the twist | And that's when things got interesting. | Builds suspense.
Talking about the future with hope | I'm looking forward to… / I can't wait to… | "I'm really looking forward to it."
Thanking a host | Thank you for having me – it was a wonderful evening. | Classic goodbye.
Asking how someone is (deeper) | How are you keeping? / How's life treating you? | Old-style and warm.
Responding to "How are you?" with life | Can't complain – and it wouldn't help if I did! | Small wit, always works.
Saying something is the best | It's second to none. / It's in a league of its own. | "Their bread is second to none."
Saying it's time to leave | I'd better be making a move. | Polite exit.
Agreeing but adding a condition | Yes – provided that… / As long as… | "Yes, provided that we leave early."
Making a point stronger | Not only that, but… | "Not only was it cheap, but it was delicious."
Answering a difficult question honestly | I won't pretend to know the answer, but… | Honest and dignified.
Bringing someone into the conversation | What do you think, Tom? You know more about this than I do. | Generous host move.
Ending your opinion confidently | That's my two cents. / That's how I see it, anyway. | Clean ending, no rambling.
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
