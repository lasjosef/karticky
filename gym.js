// Tip Cards – the Gym (unlimited wit practice, poems & speeches) and the Notebook (everything you saved with ☆).

// ---------- notebook: tap ☆ anywhere to save a line ----------
const nbId=t=>{ let h=0; for(const ch of String(t)) h=(h*31+ch.charCodeAt(0))|0; return "nb_"+(h>>>0).toString(36); };
const isSaved=t=>S.items.some(c=>c.id===nbId(t)&&!c.del);
const starBtn=(t,type,src)=>{ const on=isSaved(t); return `<button class="star ${on?"on":""}" data-star="${esc(t)}" data-stype="${esc(type||"")}" data-ssrc="${esc(src||"")}" aria-label="Save to notebook">${on?"★":"☆"}</button>`; };
function toggleSave(text,type,src){ text=String(text||"").trim(); if(!text) return; const id=nbId(text);
  if(isSaved(text)){ deleteCard(id); toast("Removed from your notebook"); }
  else { saveCard({id,deck:"nb",type:type||"mine",text,src:src||"",created:new Date().toISOString()}); toast("★ Saved to your notebook"); }
  render(); }
function vNotebook(){ U.nb=U.nb||"saved";
  const seg=`<div class="seg"><button data-nbv="saved" class="${U.nb==="saved"?"on":""}">★ Saved</button><button data-nbv="cards" class="${U.nb==="cards"?"on":""}">🗂 All cards</button></div>`;
  if(U.nb==="cards"){ const h=vLib(); const i=h.indexOf("</div></div>")+12; return h.slice(0,i)+seg+h.slice(i); }
  const n=S.items.filter(c=>c.deck==="nb"&&!c.del).length;
  return `<div class="top"><div><h1>Notebook</h1><p class="sub">${n} saved line${n===1?"":"s"}</p></div></div>`+seg+vSaved(); }
function vSaved(){ const all=S.items.filter(c=>c.deck==="nb"&&!c.del).sort((a,b)=>(b.created||"")<(a.created||"")?-1:1);
  const T=[["","All"],["wit","😄 Funny lines"],["mine","✍️ Mine"],["poem","📜 Poems"],["speech","🎤 Speeches"],["card","🧠 Words & phrases"]];
  const f=U.nbf||"", list=f?all.filter(c=>c.type===f):all;
  let h=`<div class="chips scroll" style="margin-bottom:12px">${T.filter(([k])=>!k||all.some(c=>c.type===k)).map(([k,nm])=>`<button class="chip ${f===k?"on":""}" data-nbf="${k}">${nm} <span class="muted">${k?all.filter(c=>c.type===k).length:all.length}</span></button>`).join("")}</div>`;
  if(!list.length) return h+`<div class="panel done"><div class="big">☆</div><h2>Nothing saved yet</h2><p class="muted">Tap ☆ next to any line – in the Gym, in a poem, or on a card – and it lands here.</p></div>`;
  if(U.flip){ const i=Math.max(0,Math.min(U.flipI||0,list.length-1)), c=list[i];
    return h+`<div class="panel flip"><div class="ft">${esc(c.text)}</div>${c.src?`<p class="muted">${esc(c.src)}</p>`:""}<div class="row" style="justify-content:center">${sayBtn(c.text)}${starBtn(c.text,c.type,c.src)}</div></div>
      <div class="row" style="justify-content:center;align-items:center"><button class="btn" id="fprev">‹</button><span class="muted">${i+1} / ${list.length}</span><button class="btn" id="fnext">›</button><button class="btn small" id="flipoff">List</button></div>`; }
  return h+`<div class="row" style="margin-bottom:10px"><button class="btn small" id="flipon">🃏 Flip through</button></div>`+
    list.map(c=>`<div class="nbi"><div class="t">${esc(c.text)}</div><div class="m"><span>${esc(c.src||"")}</span><span>${sayBtn(c.text)}${starBtn(c.text,c.type,c.src)}</span></div></div>`).join(""); }

// ---------- the gym ----------
let _gp=null;
function gymPack(){ if(_gp) return _gp; let i=0;
  const extra=GYM_EXTRA.split("\n").map(s=>s.trim()).filter(s=>s&&!s.startsWith("#")).map(s=>{ const f=s.split("|").map(x=>x.trim()); return {id:"gx_"+(++i),tech:f[0],cue:f[1],text:f[2]||""}; });
  return _gp=engPack().wit.concat(extra); }
const gymCount=()=>LS.get("kc_gc_"+today(),0);
function gymNext(g){ const P=gymPack(), seen=LS.get("kc_gseen",[]); let pool=P.filter(p=>!seen.includes(p.id)&&p.id!==g.cur);
  if(!pool.length){ LS.set("kc_gseen",[]); pool=P.filter(p=>p.id!==g.cur); }
  g.cur=pool[Math.floor(Math.random()*pool.length)].id; g.open=false; g.mine=""; }
function vGym(){ const g=U.gym||(U.gym={mode:"wit",cur:null,open:false,poem:null,mine:""});
  const h=`<div class="top"><div><h1>Gym</h1><p class="sub">${g.mode==="wit"?`As much as you like · ${gymCount()} today · ${gymPack().length} situations`:"Read out loud · tap ☆ on lines you love"}</p></div></div>
  <div class="seg"><button data-gmode="wit" class="${g.mode==="wit"?"on":""}">😄 Wit</button><button data-gmode="read" class="${g.mode==="read"?"on":""}">📜 Poems & speeches</button></div>`;
  return h+(g.mode==="wit"?gymWit(g):gymRead(g)); }
function gymWit(g){ if(!g.cur||!gymPack().some(x=>x.id===g.cur)) gymNext(g); const p=gymPack().find(x=>x.id===g.cur), tip=techTip(p.tech);
  return `<div class="panel gym"><div class="ek">${esc(p.tech)}</div>${tip?`<div class="tip">💡 ${esc(tip)}</div>`:""}
    <div class="gq">They say: <b>“${esc(p.cue)}”</b></div>`+
    (g.open?`<div class="ans">${p.text.split(" / ").map(r=>`<div class="arow"><span>→ ${esc(r)}</span>${sayBtn(r)}${starBtn(r,"wit",p.cue)}</div>`).join("")}</div>
      <div class="lab"><span>Was your own line good? Keep it</span></div>
      <div class="mine"><input type="text" id="gmine" value="${esc(g.mine)}" placeholder="what you said…"><button class="btn small" id="gminesave">☆ Save</button></div>
      <button class="btn main full" id="gnext">Next situation ›</button>`
    :`<p class="muted" style="margin:12px 0 16px">Say your reply out loud first – then look at mine.</p><button class="btn main full" id="gshow">Show answers</button>`)+`</div>`; }
function gymRead(g){
  if(g.poem){ const r=READS.find(x=>x.id===g.poem); if(!r){ g.poem=null; return gymRead(g); }
    const lines=r.text.replace(/^\n+|\n+$/g,"").split("\n"), src=r.title+" – "+r.author;
    return `<button class="btn small" id="gback" style="margin-bottom:12px">‹ All texts</button>
      <div class="panel read"><h2 class="rt">${esc(r.title)}</h2><p class="muted">${esc(r.author)} · ${esc(r.year)}</p>
      <div class="row"><button class="btn small" data-say="${esc(lines.join(" "))}">🔊 Listen to it all</button></div>
      <p class="muted" style="font-size:14px">Read it out loud. Tap 🔊 for one line, ☆ to keep a line in your notebook.</p>
      <div class="lines">${lines.map(l=>{ const t=l.trim(); return t?`<div class="rl ${isSaved(t)?"on":""}"><span>${esc(t)}</span><span class="rb">${sayBtn(t)}${starBtn(t,r.kind,src)}</span></div>`:`<div class="gap"></div>`; }).join("")}</div></div>`; }
  return READS.map(r=>`<button class="item rd" data-poem="${r.id}"><div class="t">${esc(r.title)}</div><div class="m"><span>${r.kind==="speech"?"🎤":"📜"} ${esc(r.author)} · ${esc(r.year)}</span><span>${esc(r.why||"")}</span></div></button>`).join(""); }
function gymClick(id){ const g=U.gym;
  if(id==="gshow"){ g.open=true; LS.set("kc_gc_"+today(),gymCount()+1); const s=LS.get("kc_gseen",[]); if(!s.includes(g.cur)){ s.push(g.cur); LS.set("kc_gseen",s); } render(); return true; }
  if(id==="gnext"){ gymNext(g); render(); window.scrollTo(0,0); return true; }
  if(id==="gminesave"){ const p=gymPack().find(x=>x.id===g.cur); toggleSave(g.mine,"mine",p?p.cue:""); g.mine=""; render(); return true; }
  if(id==="gback"){ g.poem=null; render(); window.scrollTo(0,0); return true; }
  if(id==="flipon"){ U.flip=true; U.flipI=0; render(); return true; }
  if(id==="flipoff"){ U.flip=false; render(); return true; }
  if(id==="fprev"){ U.flipI=Math.max(0,(U.flipI||0)-1); render(); return true; }
  if(id==="fnext"){ U.flipI=(U.flipI||0)+1; render(); return true; }
  return false; }

// ---------- poems & speeches (all public domain) ----------
const READS=[
  {id:"if",title:"If—",author:"Rudyard Kipling",year:"1910",kind:"poem",why:"How to be a man",text:String.raw`If you can keep your head when all about you
Are losing theirs and blaming it on you,
If you can trust yourself when all men doubt you,
But make allowance for their doubting too;
If you can wait and not be tired by waiting,
Or being lied about, don't deal in lies,
Or being hated, don't give way to hating,
And yet don't look too good, nor talk too wise:

If you can dream—and not make dreams your master;
If you can think—and not make thoughts your aim;
If you can meet with Triumph and Disaster
And treat those two impostors just the same;
If you can bear to hear the truth you've spoken
Twisted by knaves to make a trap for fools,
Or watch the things you gave your life to, broken,
And stoop and build 'em up with worn-out tools:

If you can make one heap of all your winnings
And risk it on one turn of pitch-and-toss,
And lose, and start again at your beginnings
And never breathe a word about your loss;
If you can force your heart and nerve and sinew
To serve your turn long after they are gone,
And so hold on when there is nothing in you
Except the Will which says to them: 'Hold on!'

If you can talk with crowds and keep your virtue,
Or walk with Kings—nor lose the common touch,
If neither foes nor loving friends can hurt you,
If all men count with you, but none too much;
If you can fill the unforgiving minute
With sixty seconds' worth of distance run,
Yours is the Earth and everything that's in it,
And—which is more—you'll be a Man, my son!`},
  {id:"invictus",title:"Invictus",author:"William Ernest Henley",year:"1888",kind:"poem",why:"Courage in hard times",text:String.raw`Out of the night that covers me,
Black as the pit from pole to pole,
I thank whatever gods may be
For my unconquerable soul.

In the fell clutch of circumstance
I have not winced nor cried aloud.
Under the bludgeonings of chance
My head is bloody, but unbowed.

Beyond this place of wrath and tears
Looms but the Horror of the shade,
And yet the menace of the years
Finds and shall find me unafraid.

It matters not how strait the gate,
How charged with punishments the scroll,
I am the master of my fate,
I am the captain of my soul.`},
  {id:"s18",title:"Sonnet 18",author:"William Shakespeare",year:"1609",kind:"poem",why:"The most famous love poem",text:String.raw`Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date;
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimm'd;
And every fair from fair sometime declines,
By chance or nature's changing course untrimm'd;
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st;
Nor shall Death brag thou wander'st in his shade,
When in eternal lines to time thou grow'st:
So long as men can breathe or eyes can see,
So long lives this, and this gives life to thee.`},
  {id:"s116",title:"Sonnet 116",author:"William Shakespeare",year:"1609",kind:"poem",why:"What true love is",text:String.raw`Let me not to the marriage of true minds
Admit impediments. Love is not love
Which alters when it alteration finds,
Or bends with the remover to remove.
O no! it is an ever-fixed mark
That looks on tempests and is never shaken;
It is the star to every wand'ring bark,
Whose worth's unknown, although his height be taken.
Love's not Time's fool, though rosy lips and cheeks
Within his bending sickle's compass come;
Love alters not with his brief hours and weeks,
But bears it out even to the edge of doom.
If this be error and upon me prov'd,
I never writ, nor no man ever lov'd.`},
  {id:"road",title:"The Road Not Taken",author:"Robert Frost",year:"1916",kind:"poem",why:"Choices that shape a life",text:String.raw`Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`},
  {id:"beauty",title:"She Walks in Beauty",author:"Lord Byron",year:"1814",kind:"poem",why:"A compliment like no other",text:String.raw`She walks in beauty, like the night
Of cloudless climes and starry skies;
And all that's best of dark and bright
Meet in her aspect and her eyes;
Thus mellowed to that tender light
Which heaven to gaudy day denies.

One shade the more, one ray the less,
Had half impaired the nameless grace
Which waves in every raven tress,
Or softly lightens o'er her face;
Where thoughts serenely sweet express,
How pure, how dear their dwelling-place.

And on that cheek, and o'er that brow,
So soft, so calm, yet eloquent,
The smiles that win, the tints that glow,
But tell of days in goodness spent,
A mind at peace with all below,
A heart whose love is innocent!`},
  {id:"ozy",title:"Ozymandias",author:"Percy Bysshe Shelley",year:"1818",kind:"poem",why:"Pride and time",text:String.raw`I met a traveller from an antique land,
Who said—"Two vast and trunkless legs of stone
Stand in the desert. Near them, on the sand,
Half sunk a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed;
And on the pedestal, these words appear:
My name is Ozymandias, King of Kings;
Look on my Works, ye Mighty, and despair!
Nothing beside remains. Round the decay
Of that colossal Wreck, boundless and bare
The lone and level sands stretch far away."`},
  {id:"ulysses",title:"Ulysses (the ending)",author:"Alfred, Lord Tennyson",year:"1842",kind:"poem",why:"Never stop striving",text:String.raw`Come, my friends,
'Tis not too late to seek a newer world.
Push off, and sitting well in order smite
The sounding furrows; for my purpose holds
To sail beyond the sunset, and the baths
Of all the western stars, until I die.
It may be that the gulfs will wash us down:
It may be we shall touch the Happy Isles,
And see the great Achilles, whom we knew.
Tho' much is taken, much abides; and tho'
We are not now that strength which in old days
Moved earth and heaven, that which we are, we are;
One equal temper of heroic hearts,
Made weak by time and fate, but strong in will
To strive, to seek, to find, and not to yield.`},
  {id:"ps23",title:"Psalm 23",author:"King James Bible",year:"1611",kind:"poem",why:"Peace and trust",text:String.raw`The Lord is my shepherd; I shall not want.
He maketh me to lie down in green pastures: he leadeth me beside the still waters.
He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.
Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.
Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.
Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.`},
  {id:"cor13",title:"Love is patient (1 Corinthians 13)",author:"King James Bible",year:"1611",kind:"poem",why:"Read at every wedding",text:String.raw`Charity suffereth long, and is kind;
charity envieth not; charity vaunteth not itself, is not puffed up,
Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;
Rejoiceth not in iniquity, but rejoiceth in the truth;
Beareth all things, believeth all things, hopeth all things, endureth all things.
Charity never faileth.

And now abideth faith, hope, charity, these three; but the greatest of these is charity.`},
  {id:"eccl",title:"A time for everything (Ecclesiastes 3)",author:"King James Bible",year:"1611",kind:"poem",why:"Rhythm of life",text:String.raw`To every thing there is a season, and a time to every purpose under the heaven:
A time to be born, and a time to die; a time to plant, and a time to pluck up that which is planted;
A time to kill, and a time to heal; a time to break down, and a time to build up;
A time to weep, and a time to laugh; a time to mourn, and a time to dance;
A time to cast away stones, and a time to gather stones together; a time to embrace, and a time to refrain from embracing;
A time to get, and a time to lose; a time to keep, and a time to cast away;
A time to rend, and a time to sew; a time to keep silence, and a time to speak;
A time to love, and a time to hate; a time of war, and a time of peace.`},
  {id:"gettys",title:"The Gettysburg Address",author:"Abraham Lincoln",year:"1863",kind:"speech",why:"272 words that defined a nation",text:String.raw`Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.

Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure.
We are met on a great battle-field of that war.
We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live.
It is altogether fitting and proper that we should do this.

But, in a larger sense, we can not dedicate—we can not consecrate—we can not hallow—this ground.
The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract.
The world will little note, nor long remember what we say here, but it can never forget what they did here.
It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced.
It is rather for us to be here dedicated to the great task remaining before us—that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion—
that we here highly resolve that these dead shall not have died in vain—
that this nation, under God, shall have a new birth of freedom—
and that government of the people, by the people, for the people, shall not perish from the earth.`},
  {id:"arena",title:"The Man in the Arena",author:"Theodore Roosevelt",year:"1910",kind:"speech",why:"For anyone afraid of critics",text:String.raw`It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better.
The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood;
who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming;
but who does actually strive to do the deeds; who knows great enthusiasms, the great devotions; who spends himself in a worthy cause;
who at the best knows in the end the triumph of high achievement,
and who at the worst, if he fails, at least fails while daring greatly,
so that his place shall never be with those cold and timid souls who neither know victory nor defeat.`},
  {id:"fdr",title:"Nothing to fear but fear itself",author:"Franklin D. Roosevelt",year:"1933",kind:"speech",why:"Calm in a crisis",text:String.raw`This great Nation will endure as it has endured, will revive and will prosper.
So, first of all, let me assert my firm belief that the only thing we have to fear is fear itself—
nameless, unreasoning, unjustified terror which paralyzes needed efforts to convert retreat into advance.`},
  {id:"jfk",title:"Ask not… (Inaugural Address)",author:"John F. Kennedy",year:"1961",kind:"speech",why:"Big lines, short words",text:String.raw`Let the word go forth from this time and place, to friend and foe alike, that the torch has been passed to a new generation of Americans.
Let us never negotiate out of fear. But let us never fear to negotiate.
All this will not be finished in the first one hundred days.
Nor will it be finished in the first one thousand days, nor in the life of this Administration, nor even perhaps in our lifetime on this planet. But let us begin.
And so, my fellow Americans: ask not what your country can do for you—ask what you can do for your country.`}];

// ---------- extra situations for the Gym (append more any time) ----------
const GYM_EXTRA=String.raw`
# technique | they say | replies (/ separated) – extra situations for the Gym only
Understatement – say less than the truth | Your flight is delayed by six hours. | Perfect – I was hoping for a little extra time at the airport. / Well, that's the afternoon sorted.
Understatement – say less than the truth | The waiter spilled soup on your shirt. | It needed a bit of colour anyway. / Not my favourite way to eat soup.
Understatement – say less than the truth | Your phone just fell in the lake. | It always wanted to swim. / I suppose that's a bit unfortunate.
Understatement – say less than the truth | The whole team is sick and you're alone at work. | Nice and peaceful, then. / Finally, a meeting where everyone agrees with me.
Understatement – say less than the truth | You locked yourself out in your pyjamas. | A slightly informal start to the day. / The neighbours got a show, at least.
Exaggeration – make it hugely bigger | Was the queue long? | I made friends, fell out, and made up again before I got to the front. / I think I saw people being born in it.
Exaggeration – make it hugely bigger | How heavy was the sofa? | It had its own gravity. / I think it was full of bricks and regrets.
Exaggeration – make it hugely bigger | Was the hotel room small? | I could open the window, the door and the fridge without getting out of bed. / The mouse had to go outside to turn around.
Exaggeration – make it hugely bigger | Is your grandma a good cook? | After her Sunday lunch you need a week and a wheelbarrow. / Restaurants close when she opens her kitchen.
Exaggeration – make it hugely bigger | Was it windy at the top? | My hair is still up there. / I flew down faster than I climbed up.
Taking it literally | Can you keep an eye on the kids? | Only one? They're very fast. / I'll need both eyes and a drone.
Taking it literally | Let's hit the road! | Gently, please – it's done nothing wrong. / I'd rather drive on it.
Taking it literally | You've got a lot on your plate. | That's the last time I go to an all-you-can-eat buffet. / I know – I'm a very ambitious eater.
Taking it literally | I'm all ears. | Funny, you look mostly face to me. / Then I'll speak loudly – that's a lot of ears.
Taking it literally | Time flies when you're having fun. | Then this meeting must be standing still. / So that's where my weekend went.
Agree and amplify – agree, then make it bigger | You're so picky with food. | I'm not picky – I'm a professional food critic who just hasn't been paid yet. / Guilty. I once sent back a glass of water.
Agree and amplify – agree, then make it bigger | You're always on your phone. | It's not a phone, it's my office, my library and my therapist. / I know. We're thinking of getting a dog together.
Agree and amplify – agree, then make it bigger | You're such a gentleman. | I'll be bowing next. With a hat. / Careful – next I'll be writing you letters with a feather.
Agree and amplify – agree, then make it bigger | You overthink everything. | I've thought about that a lot, actually. / Yes, and I have a spreadsheet to prove it.
Agree and amplify – agree, then make it bigger | You're so competitive. | No I'm not. Also, I won that argument. / Only about things that matter – like board games and parking spaces.
Self-deprecation – laugh at yourself, lightly | Do you know how to fix it? | I know exactly who to call. / I can make it worse – does that help?
Self-deprecation – laugh at yourself, lightly | Are you a good dancer? | I have the moves of a confident fridge. / Let's say I'm better at watching.
Self-deprecation – laugh at yourself, lightly | Can you draw? | My stick men have been called "abstract". / Only if you like modern art.
Self-deprecation – laugh at yourself, lightly | Do you remember names well? | I remember faces perfectly. Names go on holiday. / Absolutely – … sorry, what was yours again?
Self-deprecation – laugh at yourself, lightly | Are you handy around the house? | My toolbox is mostly a phone number. / I once assembled a chair. It's now a stool.
Misdirection – start normal, end with a twist | Do you read a lot? | Every night. Mostly the back of the shampoo bottle. / Constantly. Menus, mainly.
Misdirection – start normal, end with a twist | Do you like sport? | I love sport. Watching it, from the sofa, with snacks. / Very much. I'm a champion at running late.
Misdirection – start normal, end with a twist | What's your plan for the future? | Step one: be brilliant. Step two: have lunch. / I have a five-year plan. It currently ends on Friday.
Misdirection – start normal, end with a twist | Are you good at keeping plants alive? | I'm excellent with plants. Plastic ones especially. / They live very full, very short lives.
Misdirection – start normal, end with a twist | Do you speak any other languages? | Czech, Polish, English – and fluent sarcasm. / Three. Four if you count body language.
Rule of three – two normal things, then a surprise | What do you look for in a flat? | Light, space, and neighbours who don't learn the trumpet. / Good location, fair rent, and a kitchen big enough to dance in.
Rule of three – two normal things, then a surprise | How do you prepare for a big day? | Good sleep, a strong coffee, and a pep talk in the mirror. / Plan, practise, and panic – in that order.
Rule of three – two normal things, then a surprise | What's your morning routine? | Alarm, coffee, and a small argument with the snooze button. / Shower, breakfast, and pretending I'm a morning person.
Rule of three – two normal things, then a surprise | What makes a good party? | Good music, good people, and someone brave enough to dance first. / Food, friends, and one story everyone talks about the next day.
Rule of three – two normal things, then a surprise | What did you buy in town? | Bread, milk, and three things I definitely didn't need. / Shoes, a shirt, and a lot of regret at the checkout.
Role reversal – flip it back on them | Are you trying to impress me? | Is it working? / I was going to ask if you were trying to impress me.
Role reversal – flip it back on them | You ask a lot of questions. | Do I? Why do you think that is? / And you give very mysterious answers.
Role reversal – flip it back on them | You're blushing! | That's just your effect on people. / So are you – I think it's contagious.
Role reversal – flip it back on them | Do you always talk this much? | Only when the company is this good. / Do you always listen this well?
Role reversal – flip it back on them | Why should I go out with you? | I was hoping you'd tell me why I should go out with you. / That's for you to find out – over dinner.
Playful accusation – accuse them of something small and cute | I've already planned my outfit for tomorrow. | So you're one of those organised people. I'm a little scared. / I bet your socks are folded too.
Playful accusation – accuse them of something small and cute | I cry at sad films. | So you're a secret softie. Noted. / I'll bring tissues next time – for both of us.
Playful accusation – accuse them of something small and cute | I sing in the car. | I knew it – you're the person at the traffic lights with the full concert. / Loudly, I bet. With dramatic hand movements.
Playful accusation – accuse them of something small and cute | I have twenty unread messages. | So you're the reason people think their phone is broken. / Rebel. I like it.
Playful accusation – accuse them of something small and cute | I talk to my plants. | Do they answer? Because then we need to talk. / So that's why they look so happy.
Mock seriousness – treat a tiny thing like a crisis | I took the last parking space. | I'll be writing to the government about this. / We'll settle this outside. After you've parked.
Mock seriousness – treat a tiny thing like a crisis | I don't like chocolate ice cream. | I'm going to have to ask you to leave. / Is there someone we can call for you?
Mock seriousness – treat a tiny thing like a crisis | I forgot to bring the snacks. | Then this trip is officially cancelled. / We'll hold a short ceremony for the lost snacks.
Mock seriousness – treat a tiny thing like a crisis | I sat in your chair. | That chair and I have history. / I'll need a written apology and a fresh cushion.
Mock seriousness – treat a tiny thing like a crisis | I changed the TV channel. | I've informed the authorities. / This is the darkest day of my life.
Absurd comparison – compare it to something ridiculous | How was the party? | Quieter than a library on Christmas Day. / Wilder than a squirrel on espresso.
Absurd comparison – compare it to something ridiculous | Is your brother tall? | He has to duck under clouds. / Birds ask him for directions.
Absurd comparison – compare it to something ridiculous | How slow was the internet? | I could have delivered the email faster by bike. / Slower than a snail filling in a tax form.
Absurd comparison – compare it to something ridiculous | Is it hot in your office? | The plants are asking for holidays. / You could fry an egg on the printer.
Absurd comparison – compare it to something ridiculous | How cold was the swim? | Even the fish were wearing scarves. / My thoughts froze halfway through a sentence.
Deadpan – say something silly with a completely straight face | Have you ever been to Paris? | Yes. I designed the Eiffel Tower. They didn't credit me. / Once. It was closed.
Deadpan – say something silly with a completely straight face | What do you do on weekends? | I race snails. Professionally. / I count the clouds. Last week: forty-two.
Deadpan – say something silly with a completely straight face | Is that your real hair? | No, I rent it by the month. / It's borrowed. I have to return it on Monday.
Deadpan – say something silly with a completely straight face | Are you always this calm? | I was born calm. The doctor fell asleep. / I once yawned during an earthquake.
Deadpan – say something silly with a completely straight face | Where did you learn to cook? | From a very strict cat. / YouTube. And three small fires.
Push-pull – a compliment and a tease in one breath | I'm always right. | And modest too – what a rare combination. / You're right about many things. That isn't one of them.
Push-pull – a compliment and a tease in one breath | I'm really good at parking. | I'll believe it when I see it – and I really hope to see it. / I'm impressed. And slightly worried for the other cars.
Push-pull – a compliment and a tease in one breath | Do you like my new haircut? | I love it. Now I have to try harder to keep up. / Very nice. Who forced you to finally go?
Push-pull – a compliment and a tease in one breath | I organised the whole trip. | It's perfect. I'm only a little suspicious of how perfect. / Brilliant. Now I owe you, and I hate owing people.
Quick comeback – when they tease you | You're late again! | I'm not late – I'm fashionably on my own schedule. / Great things take time. Ask any cathedral.
Quick comeback – when they tease you | Did you get dressed in the dark? | Yes, and I think I did beautifully. / It's called style. You'll understand one day.
Quick comeback – when they tease you | You can't cook! | That's why I'm so good at choosing restaurants. / I can – the smoke alarm just has very high standards.
Quick comeback – when they tease you | You're so slow. | I'm not slow, I'm thorough. / Good things come to those who wait – you're welcome.
Quick comeback – when they tease you | Your jokes are terrible. | And yet you're smiling. / Terrible jokes need brave people. I'm a hero.
`;
