/* Family Mediation Study — offline PWA. Content generated from Personal Study Guide v2.1. */
(() => {
  'use strict';
  const app = document.getElementById('app');
  const backBtn = document.getElementById('backBtn');
  let DATA = null;

  // ---------- storage (per device; may be unavailable in private modes) ----------
  const KEY = 'fms-progress-v1';
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    update(fn) { const s = this.get(); fn(s); this.set(s); return s; },
  };
  const S = () => store.get();
  const done = (id) => !!(S().done || {})[id];

  // ---------- helpers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const allLessons = () => DATA.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, mod: m })));
  const findLesson = (id) => allLessons().find((l) => l.id === id);
  const slug = (id) => encodeURIComponent(id);
  const linkCites = (html) => html.replace(/\[(\d+(?:,\s*\d+)*)\]/g, (m, nums) =>
    nums.split(/,\s*/).map((n) => `<button class="cite" data-ref="${n}" aria-label="Reference ${n}">[${n}]</button>`).join(''));
  const setTitle = (t) => { document.title = t ? `${t} · Mediation Study` : 'Family Mediation Study'; };
  const tab = (name) => document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('active', a.dataset.tab === name));
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  function ring(p) {
    const r = 34, c = 2 * Math.PI * r;
    return `<svg class="ring" viewBox="0 0 84 84" role="img" aria-label="${p}% of lessons complete">
      <circle cx="42" cy="42" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="8"/>
      <circle cx="42" cy="42" r="${r}" fill="none" stroke="#F2C57C" stroke-width="8" stroke-linecap="round"
        stroke-dasharray="${(c * p) / 100} ${c}" transform="rotate(-90 42 42)"/>
      <text x="42" y="49" text-anchor="middle">${p}%</text></svg>`;
  }

  // ---------- views ----------
  function home() {
    tab('home'); setTitle('');
    const ls = allLessons(), core = ls.filter((l) => !l.ext);
    const nDone = core.filter((l) => done(l.id)).length;
    const last = S().last && findLesson(S().last);
    const next = last || core.find((l) => !done(l.id)) || core[0];
    let h = `<section class="hero">${ring(pct(nDone, core.length))}
      <div><h1>Family Mediation Training</h1><p>${nDone} of ${core.length} core lessons complete · Study Guide v${esc(DATA.version)}</p></div></section>
      <a class="btn block" href="#/l/${slug(next.id)}">${last ? 'Continue' : 'Start'}: ${esc(next.id)} ${esc(next.title)}</a>
      <h2 style="margin-top:22px">Modules</h2><ul class="list">`;
    for (const m of DATA.modules) {
      const core = m.lessons.filter((l) => !l.ext), d = core.filter((l) => done(l.id)).length;
      const best = (S().quiz || {})[m.n];
      h += `<li class="card"><a class="mod" href="#/m/${m.n}"><span class="num">${m.n}</span><span style="flex:1">
        <span class="t">${esc(m.title)}</span><br><span class="muted" style="font-size:.85em">${d}/${core.length} lessons${best != null ? ` · Quiz best ${best}/10` : ''}</span>
        <span class="bar"><i style="width:${pct(d, core.length)}%"></i></span></span></a></li>`;
    }
    h += `</ul><div class="card tint"><p class="kicker">Four rules for every module</p>
      <ul class="moves"><li>The parties decide; no coercion.</li><li>Information, not legal advice.</li><li>Safety screening comes first.</li><li>Children stay out of the middle.</li></ul></div>`;
    app.innerHTML = h;
  }

  function moduleView(n) {
    const m = DATA.modules.find((x) => x.n === +n); if (!m) return notFound();
    tab('home'); setTitle(`Module ${m.n}`);
    let h = `<p class="kicker">Module ${m.n}</p><h1>${esc(m.title)}</h1>
      <div class="card tint"><p class="kicker">You will be able to</p><ul class="moves">${m.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></div>
      <div class="card">`;
    for (const l of m.lessons) {
      h += `<a class="lesson-link" href="#/l/${slug(l.id)}"><span><span class="id">${esc(l.id)}</span>${esc(l.title.replace(/^Extension: /, ''))}</span>
        <span>${l.ext ? '<span class="chip opt">Optional</span> ' : ''}${done(l.id) ? '<span class="chip done">Done</span>' : ''}</span></a>`;
    }
    h += `</div><a class="btn block" href="#/quiz/${m.n}">Take the Module ${m.n} test (8 questions)</a>
      <details class="full" style="margin-top:14px"><summary>Module objectives (full text)</summary><div class="prose">${linkCites(m.intro)}</div></details>`;
    app.innerHTML = h;
  }

  function lessonView(id) {
    const l = findLesson(id); if (!l) return notFound();
    tab('home'); setTitle(`Lesson ${l.id}`);
    store.update((s) => { s.last = l.id; });
    const list = allLessons(), i = list.findIndex((x) => x.id === l.id), prev = list[i - 1], next = list[i + 1];
    let h = `<p class="kicker">Module ${l.mod.n} · Lesson ${esc(l.id)}${l.ext ? ' · Optional' : ''}</p><h1>${esc(l.fullTitle)}</h1>`;
    if (l.points.length) {
      if (l.pointsTitle) h += `<h2>${esc(l.pointsTitle)}</h2>`;
      h += `<div class="points">${l.points.map((p) => `<div class="point"><h3>${esc(p.h)}</h3><p>${esc(p.t)}</p></div>`).join('')}</div>`;
    }
    if (l.kase) {
      h += `<div class="card dark"><p class="kicker">Practice case · fictional</p><p style="margin:0">${esc(l.kase.text)}</p></div>
        <div class="card"><h3>Your task</h3><ul class="tasks">${l.kase.tasks.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <textarea aria-label="Your answer" placeholder="Write your answer first (saved on this device)" data-note="${esc(l.id)}">${esc((S().notes || {})[l.id] || '')}</textarea>`;
      if (l.answer) {
        h += `<button class="btn secondary block" style="margin-top:10px" data-reveal="ans">Show worked answer</button>
          <div class="reveal" id="ans" hidden><h3 style="margin-top:14px">Strong moves</h3>${/^\d\./.test(l.answer.moves[0]) ? `<ol class="moves">${l.answer.moves.map((x) => `<li>${esc(x.replace(/^\d\.\s*/, ''))}</li>`).join('')}</ol>` : `<ul class="moves">${l.answer.moves.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`}
          <div class="card clay" style="margin-top:12px"><h3>Avoid</h3><ul class="avoid">${l.answer.avoid.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          ${l.answer.script ? `<p class="quote">${esc(l.answer.script)}</p>` : ''}</div>`;
      } else {
        h += `<p class="muted" style="margin-top:10px">The worked responses are in the full lesson below.</p>`;
      }
      h += `</div>`;
    }
    h += `<details class="full" ${l.points.length ? '' : 'open'}><summary>Full lesson text</summary><div class="prose">${linkCites(l.html)}</div></details>
      <button class="btn ${done(l.id) ? 'ghost' : ''} block" data-done="${esc(l.id)}">${done(l.id) ? '✓ Completed — tap to undo' : 'Mark lesson complete'}</button>
      <div class="pager">${prev ? `<a class="btn ghost" href="#/l/${slug(prev.id)}">← ${esc(prev.id)}</a>` : '<span></span>'}
      ${next ? `<a class="btn ghost" href="#/l/${slug(next.id)}">${esc(next.id)} →</a>` : `<a class="btn ghost" href="#/quiz/${l.mod.n}">Test →</a>`}</div>`;
    app.innerHTML = h;
  }

  function quizzes() {
    tab('quizzes'); setTitle('Quizzes');
    let h = `<h1>Module tests</h1><p class="muted">Closed-book, 10 points each. Target: 8/10 with no unsafe answers. Multiple-choice and true/false items grade themselves; you score the written items against the model answer.</p>`;
    for (const m of DATA.modules) {
      const best = (S().quiz || {})[m.n];
      h += `<a class="card mod" href="#/quiz/${m.n}"><span class="num">${m.n}</span><span style="flex:1"><span class="t">${esc(m.title)}</span><br>
        <span class="muted" style="font-size:.85em">${best != null ? `Best score ${best}/10` : 'Not taken yet'}</span></span></a>`;
    }
    app.innerHTML = h;
  }

  function quizView(n) {
    const m = DATA.modules.find((x) => x.n === +n); if (!m) return notFound();
    tab('quizzes'); setTitle(`Module ${m.n} test`);
    const st = { got: {}, answered: 0 };
    let h = `<p class="kicker">Module ${m.n} · Closed-book test</p><h1>${esc(m.title)}</h1>`;
    m.test.forEach((q, i) => {
      h += `<div class="card q" data-q="${i}"><p><span class="qn">Q${i + 1} · ${q.pts} pt${q.pts > 1 ? 's' : ''}</span><br>${esc(q.q)}</p>`;
      if (q.type === 'mc') h += q.opts.map((o, j) => `<button class="choice" data-pick="${'ABC'[j]}">${'ABC'[j]}. ${esc(o)}</button>`).join('');
      else if (q.type === 'tf') h += ['True', 'False'].map((o) => `<button class="choice" data-pick="${o}">${o}</button>`).join('');
      else h += `<textarea aria-label="Your answer to question ${i + 1}" placeholder="Write your answer, then compare"></textarea>
        <button class="btn secondary" style="margin-top:8px" data-model="${i}">Show model answer</button>`;
      h += `<div class="feedback" hidden></div></div>`;
    });
    h += `<div class="card tint stat" id="result"><p class="kicker">Your score</p><span class="score" id="scoreNum">0</span><span class="muted"> / 10</span>
      <p class="muted" id="scoreNote">Answer all 8 questions to finish.</p><button class="btn ghost" data-retake="${m.n}">Start over</button></div>`;
    app.innerHTML = h;

    const total = () => Object.values(st.got).reduce((a, b) => a + b, 0);
    const finish = () => {
      document.getElementById('scoreNum').textContent = total();
      if (Object.keys(st.got).length === m.test.length) {
        const t = total();
        document.getElementById('scoreNote').textContent = t >= 8 ? 'Mastery target met. Review any unsafe answers anyway.' : 'Below 8/10: reread the named lessons and retake after a day.';
        store.update((s) => { s.quiz = s.quiz || {}; s.quiz[m.n] = Math.max(s.quiz[m.n] ?? 0, t); });
      }
    };
    app.querySelectorAll('.q').forEach((el) => {
      const i = +el.dataset.q, q = m.test[i], fb = el.querySelector('.feedback');
      el.addEventListener('click', (e) => {
        const pick = e.target.closest('[data-pick]');
        if (pick && !(i in st.got)) {
          const right = pick.dataset.pick === q.answer;
          el.querySelectorAll('[data-pick]').forEach((b) => { b.disabled = true; if (b.dataset.pick === q.answer) b.classList.add('right'); });
          if (!right) pick.classList.add('wrong');
          fb.hidden = false; fb.innerHTML = `<b>${right ? 'Correct.' : `Answer: ${esc(q.answer)}.`}</b> ${linkCites(esc(q.explain))}`;
          st.got[i] = right ? q.pts : 0; finish();
        }
        if (e.target.closest('[data-model]') && !(i in st.got)) {
          fb.hidden = false;
          fb.innerHTML = `<b>Model answer.</b> ${linkCites(esc(q.explain))}<p style="margin:10px 0 6px">Score yourself:</p>
            <div class="row">${Array.from({ length: q.pts + 1 }, (_, k) => `<button class="btn ghost" data-self="${k}">${k}</button>`).join('')}</div>`;
          e.target.closest('[data-model]').hidden = true;
        }
        const self = e.target.closest('[data-self]');
        if (self && !(i in st.got)) {
          st.got[i] = +self.dataset.self;
          fb.querySelectorAll('[data-self]').forEach((b) => { b.disabled = true; b.classList.toggle('secondary', b === self); });
          finish();
        }
      });
    });
  }

  function library() {
    tab('library'); setTitle('Library');
    let h = `<h1>Library</h1><ul class="list">`;
    for (const x of DATA.library) h += `<li><a class="card mod" href="#/lib/${x.id}"><span style="flex:1" class="t">${esc(x.title)}</span><span aria-hidden="true">›</span></a></li>`;
    h += `<li><a class="card mod" href="#/refs"><span style="flex:1" class="t">References (${DATA.refs.length} sources)</span><span aria-hidden="true">›</span></a></li></ul>`;
    app.innerHTML = h;
  }

  function libView(id) {
    const x = DATA.library.find((y) => y.id === id); if (!x) return notFound();
    tab('library'); setTitle(x.title);
    app.innerHTML = `<p class="kicker">Library</p><h1>${esc(x.title)}</h1><div class="prose">${linkCites(x.html)}</div>`;
  }

  function refs() {
    tab('library'); setTitle('References');
    app.innerHTML = `<h1>References</h1><p class="muted">Recheck legal and tax sources for currency before relying on them.</p><ol class="prose" style="padding-left:1.4em">${
      DATA.refs.map((r) => `<li id="ref-${r.n}" value="${r.n}" style="margin-bottom:10px">${esc(r.text)} <a href="${esc(r.url)}" target="_blank" rel="noopener">Open source</a></li>`).join('')}</ol>`;
  }

  function report() {
    tab('report'); setTitle('Reporting');
    app.innerHTML = `<p class="kicker">Lesson 4C quick reference</p><h1>Texas reporting at a glance</h1>
      <div class="grid3">
        <div class="card stat"><b>911</b><strong>Immediate danger</strong><p class="muted">Call 911 or local police first, then report.</p></div>
        <div class="card dark stat"><b style="color:#F2C57C">24 hrs</b><strong>Professionals’ deadline</strong><p style="color:#CFE2DE">Since Sept. 1, 2025, under Family Code §261.101 (formerly 48 hours). Cannot be delegated. <button class="cite" data-ref="24">[24]</button><button class="cite" data-ref="25">[25]</button></p></div>
        <div class="card stat"><b style="font-size:1.35em">1-800-252-5400</b><strong>DFPS Abuse Hotline</strong><p class="muted">24/7. Use txabusehotline.org for non-emergencies. <button class="cite" data-ref="21">[21]</button></p></div>
      </div>
      <div class="card clay"><h3>Also remember</h3><ul class="moves">
        <li>Anyone else who suspects child abuse or neglect must report immediately. <button class="cite" data-ref="26">[26]</button></li>
        <li>Since Sept. 1, 2023, DFPS takes no anonymous reports; reporters’ names are confidential by law. Anonymous reports can go to law enforcement.</li>
        <li>A confidentiality promise never removes a reporting duty, and parties never bargain about whether to report.</li>
        <li>Ask your course whether you count as a “professional” under §261.101 when mediating.</li></ul></div>
      <div class="row"><a class="btn" href="tel:911">Call 911</a><a class="btn secondary" href="tel:18002525400">Call DFPS hotline</a></div>
      <p class="muted" style="margin-top:14px">Study reference only. Confirm current law and procedures with your course instructors.</p>`;
  }

  function settings() {
    setTitle('Settings'); tab('');
    const fs = S().fontSize || 17;
    app.innerHTML = `<h1>Settings</h1>
      <div class="card"><h3>Text size</h3><div class="size-row"><button class="btn ghost" data-size="-1" aria-label="Smaller text">A−</button>
        <span id="fsVal">${fs}px</span><button class="btn ghost" data-size="1" aria-label="Larger text">A+</button></div></div>
      <div class="card"><h3>Offline use</h3><p class="muted" id="offline">${'serviceWorker' in navigator ? 'Checking…' : 'This browser does not support offline mode.'}</p></div>
      <div class="card"><h3>Install on your phone</h3><p><b>iPhone (Safari):</b> tap Share, then <i>Add to Home Screen</i>.<br><b>Android (Chrome):</b> tap ⋮, then <i>Install app</i> or <i>Add to Home screen</i>.</p></div>
      <div class="card"><h3>Progress</h3><p class="muted">Progress, notes, and scores are stored only on this device and browser.</p>
        <button class="btn ghost" id="resetBtn">Reset all progress</button></div>
      <p class="muted">Content: Personal Study Guide v${esc(DATA.version)} (${esc(DATA.date)}). A personal study aid; where it differs from your certified course, follow the course.</p>`;
    if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistration().then((r) => {
      const el = document.getElementById('offline'); if (el) el.textContent = r && r.active ? 'Ready: the app and all lessons are saved for offline use.' : 'Not ready yet: reopen the app once while online.';
    });
  }

  function notFound() { app.innerHTML = `<h1>Not found</h1><p><a href="#/">Go home</a></p>`; }

  // ---------- router ----------
  function route() {
    if (!DATA) return;
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').map(decodeURIComponent);
    const [a, b] = parts;
    backBtn.hidden = !a;
    document.getElementById('sheet').hidden = true;
    ({ '': home, m: () => moduleView(b), l: () => lessonView(b), quizzes, quiz: () => quizView(b), library, lib: () => libView(b), refs, report, settings }[a || ''] || notFound)();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  // ---------- events ----------
  backBtn.addEventListener('click', () => (history.length > 1 ? history.back() : (location.hash = '#/')));
  document.getElementById('settingsBtn').addEventListener('click', () => { location.hash = '#/settings'; });
  const sheet = document.getElementById('sheet');
  const closeSheet = () => { sheet.hidden = true; };
  document.getElementById('sheetClose').addEventListener('click', closeSheet);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

  app.addEventListener('click', (e) => {
    const cite = e.target.closest('.cite');
    if (cite) {
      const r = DATA.refs.find((x) => x.n === +cite.dataset.ref);
      if (r) {
        document.getElementById('sheetTitle').textContent = `Reference ${r.n}`;
        document.getElementById('sheetBody').innerHTML = `<p>${esc(r.text)}</p><p><a href="${esc(r.url)}" target="_blank" rel="noopener">Open source ↗</a></p>`;
        sheet.hidden = false; document.getElementById('sheetClose').focus();
      }
      return;
    }
    const rev = e.target.closest('[data-reveal]');
    if (rev) { const t = document.getElementById(rev.dataset.reveal); t.hidden = !t.hidden; rev.textContent = t.hidden ? 'Show worked answer' : 'Hide worked answer'; return; }
    const d = e.target.closest('[data-done]');
    if (d) { const id = d.dataset.done; store.update((s) => { s.done = s.done || {}; s.done[id] = !s.done[id]; }); lessonView(id); return; }
    const rt = e.target.closest('[data-retake]');
    if (rt) { quizView(rt.dataset.retake); window.scrollTo(0, 0); return; }
    const sz = e.target.closest('[data-size]');
    if (sz) { const s = store.update((x) => { x.fontSize = Math.min(24, Math.max(14, (x.fontSize || 17) + +sz.dataset.size)); }); applySize(s.fontSize); document.getElementById('fsVal').textContent = s.fontSize + 'px'; return; }
    if (e.target.id === 'resetBtn' && confirmReset()) { store.set({ fontSize: S().fontSize }); toast('Progress reset.'); settings(); }
  });
  app.addEventListener('input', (e) => {
    const n = e.target.dataset && e.target.dataset.note;
    if (n) store.update((s) => { s.notes = s.notes || {}; s.notes[n] = e.target.value; });
  });
  function confirmReset() { return window.confirm('Reset all lesson progress, notes, and quiz scores on this device?'); }
  function applySize(px) { document.documentElement.style.setProperty('--fs', px + 'px'); }

  let toastTimer;
  function toast(msg, action) {
    const t = document.getElementById('toast');
    t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button>${esc(action.label)}</button>` : ''}`;
    if (action) t.querySelector('button').onclick = action.fn;
    t.hidden = false; clearTimeout(toastTimer);
    if (!action) toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  // ---------- start ----------
  applySize(S().fontSize || 17);
  window.addEventListener('hashchange', route);
  fetch('data.json').then((r) => r.json()).then((d) => { DATA = d; route(); })
    .catch(() => { app.innerHTML = '<h1>Could not load lessons</h1><p>Connect to the internet once so the app can save its content for offline use.</p>'; });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        const prompt = (w) => toast('An updated version is ready.', { label: 'Update', fn: () => w.postMessage('skipWaiting') });
        if (reg.waiting && navigator.serviceWorker.controller) prompt(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const w = reg.installing;
          w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) prompt(w); });
        });
      }).catch(() => { /* offline mode unavailable */ });
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
    });
  }
})();
