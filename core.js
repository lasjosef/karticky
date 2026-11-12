/* Tip Cards – shared logic for the page and the service worker (notifications). */
const LEVELS = [1, 2, 7, 10, 30, 91, 182, 365];           // days until the card comes back
const LEVEL_LABEL = ["Daily", "3× a week", "Weekly", "3× a month", "Monthly", "Every 3 months", "2× a year", "Yearly"];
const INTENTS = [                                           // how much you want it, when adding
  { lvl: 0, emoji: "🔥", name: "Use it this week" },
  { lvl: 1, emoji: "📌", name: "Learn it" },
  { lvl: 2, emoji: "💭", name: "Keep in mind" },
];
const DEFAULT_CATS = [
  { id: "openers",    name: "Openers",        emoji: "👋", color: "#e5484d", hint: "Starting or ending a conversation" },
  { id: "flirt",      name: "Flirting",       emoji: "😏", color: "#e93d82", hint: "Dating, playful tension" },
  { id: "banter",     name: "Banter",         emoji: "😄", color: "#f5a524", hint: "Teasing, humour, comebacks" },
  { id: "deep",       name: "Deep questions", emoji: "🌊", color: "#3e63dd", hint: "Getting past small talk" },
  { id: "stories",    name: "Stories",        emoji: "🎬", color: "#8e4ec6", hint: "Telling things so people listen" },
  { id: "listen",     name: "Listening",      emoji: "👂", color: "#12a594", hint: "Making people feel heard" },
  { id: "confidence", name: "Confidence",     emoji: "🦁", color: "#f76b15", hint: "Mindset, body language, fear" },
  { id: "texting",    name: "Texting",        emoji: "💬", color: "#0090ff", hint: "Messages, DMs, setting up dates" },
  { id: "work",       name: "Work talk",      emoji: "💼", color: "#646f80", hint: "Boss, clients, negotiation" },
  { id: "books",      name: "Book notes",     emoji: "📖", color: "#30a46c", hint: "Ideas from books & videos" },
  { id: "fit",        name: "Body & fitness", emoji: "💪", color: "#d6409f", hint: "Training, food, health" },
  { id: "life",       name: "Life & money",   emoji: "🧭", color: "#978365", hint: "Money, habits, big decisions" },
];

const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const addDays = (s, n) => { const [y, m, d] = s.split("-").map(Number); const x = new Date(y, m - 1, d); x.setDate(x.getDate() + n); return ymd(x); };

/* swipe right = I know it (comes back less often), left = not yet (back tomorrow, more often) */
function swipeCard(c, know, practice) {
  const t = today(), cur = c.level || 0;
  let lvl = know ? Math.min(LEVELS.length - 1, cur + 1) : Math.max(0, cur - 2);
  if (practice && know) lvl = cur;                       // extra practice never skips ahead
  const due = know ? (practice ? c.due : addDays(t, LEVELS[lvl])) : addDays(t, 1);
  return { ...c, level: lvl, due, last: know ? "know" : "again", seen: (c.seen || 0) + 1, lastSeen: t, upd: Date.now() };
}
function dueCards(items) {
  const t = today();
  return (items || []).filter(c => !c.del && !c.inbox && c.due <= t)
    .sort((a, b) => a.due < b.due ? -1 : a.due > b.due ? 1 : (a.level || 0) - (b.level || 0));
}

/* data = {items, cats, catsUpd, push, pushUpd}; per card the newer "upd" wins, deletes are {id, del:true, upd} */
const emptyData = () => ({ items: [], cats: null, catsUpd: 0, push: null, pushUpd: 0 });
function mergeData(a, b) {
  a = a || emptyData(); b = b || emptyData();
  const m = new Map();
  for (const c of a.items || []) m.set(c.id, c);
  for (const c of b.items || []) { const x = m.get(c.id); if (!x || (c.upd || 0) > (x.upd || 0)) m.set(c.id, c); }
  const pick = (k, ku) => (b[ku] || 0) > (a[ku] || 0) ? [b[k], b[ku]] : [a[k], a[ku] || 0];
  const [cats, catsUpd] = pick("cats", "catsUpd"), [push, pushUpd] = pick("push", "pushUpd");
  return { items: [...m.values()], cats, catsUpd, push, pushUpd };
}
const sig = d => d ? (d.items || []).map(c => c.id + ":" + (c.upd || 0)).sort().join(",") + "|" + (d.catsUpd || 0) + "|" + (d.pushUpd || 0) : "";

/* IndexedDB – the service worker reads cards from here to show them in notifications */
const DB = (() => {
  let p;
  const db = () => p || (p = new Promise((res, rej) => { const r = indexedDB.open("karticky", 1); r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const tx = (mode, fn) => db().then(d => new Promise((res, rej) => { const t = d.transaction("kv", mode); const r = fn(t.objectStore("kv")); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); }));
  return { get: k => tx("readonly", s => s.get(k)), set: (k, v) => tx("readwrite", s => s.put(v, k)), del: k => tx("readwrite", s => s.delete(k)) };
})();
