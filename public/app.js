let selectedIterations = 3;
let finalPromptText = '';

// Depth selector
document.querySelectorAll('.depth-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.depth-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedIterations = parseInt(card.dataset.value);
  });
});

// Keyboard shortcut
document.getElementById('optimize-btn').addEventListener('click', startOptimization);
document.getElementById('prompt-input').addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') startOptimization();
});

// Copy button
document.getElementById('copy-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(finalPromptText).then(() => {
    const btn = document.getElementById('copy-btn');
    const note = document.getElementById('copy-note');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    btn.classList.add('copied');
    note.textContent = 'Copied to clipboard';
    setTimeout(() => {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Prompt`;
      btn.classList.remove('copied');
      note.textContent = '';
    }, 2500);
  });
});

// ── Step tracker ─────────────────────────────────
function buildTracker(iterations) {
  const tracker = document.getElementById('step-tracker');
  tracker.innerHTML = '';
  const labels = ['Original', ...Array.from({ length: iterations }, (_, i) => `Pass ${i + 1}`)];
  labels.forEach((lbl, i) => {
    const node = document.createElement('div');
    node.className = 'st-node pending';
    node.id = `st-${i}`;
    node.innerHTML = `<div class="st-dot">${i}</div><span class="st-lbl">${lbl}</span>`;
    tracker.appendChild(node);
    if (i < labels.length - 1) {
      const line = document.createElement('div');
      line.className = 'st-line';
      line.id = `sl-${i}`;
      line.innerHTML = '<div class="st-line-fill"></div>';
      tracker.appendChild(line);
    }
  });
  // Mark first as active
  const first = document.getElementById('st-0');
  if (first) { first.classList.remove('pending'); first.classList.add('active'); }
}

function advanceTracker(iteration) {
  // Mark current as done
  const cur = document.getElementById(`st-${iteration}`);
  if (cur) {
    cur.classList.remove('pending', 'active');
    cur.classList.add('done');
    cur.querySelector('.st-dot').innerHTML =
      `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  }
  // Fill line
  const line = document.getElementById(`sl-${iteration}`);
  if (line) setTimeout(() => line.classList.add('filled'), 100);
  // Activate next
  const next = document.getElementById(`st-${iteration + 1}`);
  if (next) { next.classList.remove('pending'); next.classList.add('active'); }
}

// ── Helpers ───────────────────────────────────────
function esc(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function scoreClass(n) {
  return n >= 32 ? 'high' : n >= 20 ? 'mid' : 'low';
}

// ── Append iteration card ─────────────────────────
function appendCard(container, data, delta, delay) {
  const { iteration, prompt, judgeResult, improvements } = data;
  const { scores, total, reasoning } = judgeResult;
  const cls = scoreClass(total);
  const pct = Math.round((total / 40) * 100);
  const isOrig = iteration === 0;

  let deltaHtml = '';
  if (delta !== null) {
    const sign = delta >= 0 ? '+' : '';
    deltaHtml = `<span class="delta ${delta >= 0 ? 'delta-up' : 'delta-down'}">${sign}${delta} pts</span>`;
  }

  const imprHtml = improvements?.length
    ? `<div class="impr-block">
        <div class="impr-title">What changed</div>
        ${improvements.map(i => `<div class="impr-row"><span class="impr-arrow">→</span><span>${esc(i)}</span></div>`).join('')}
       </div>`
    : '';

  const card = document.createElement('div');
  card.className = 'iter-card';
  card.style.animationDelay = delay + 'ms';
  card.innerHTML = `
    <div class="card-header">
      <div class="card-left">
        <span class="card-title">${isOrig ? 'Original Prompt' : `Iteration ${iteration}`}</span>
        <span class="badge ${isOrig ? 'badge-base' : 'badge-impr'}">${isOrig ? 'Baseline' : 'Improved'}</span>
        ${deltaHtml}
      </div>
      <span class="score-chip sc-${cls}">${total} / 40</span>
    </div>

    <div class="dim-grid">
      <div class="dim-box">
        <span class="dim-val v${scores.clarity}">${scores.clarity}</span>
        <span class="dim-lbl">Clarity</span>
      </div>
      <div class="dim-box">
        <span class="dim-val v${scores.specificity}">${scores.specificity}</span>
        <span class="dim-lbl">Specificity</span>
      </div>
      <div class="dim-box">
        <span class="dim-val v${scores.context}">${scores.context}</span>
        <span class="dim-lbl">Context</span>
      </div>
      <div class="dim-box">
        <span class="dim-val v${scores.outputGuidance}">${scores.outputGuidance}</span>
        <span class="dim-lbl">Output</span>
      </div>
    </div>

    <div class="score-bar-row">
      <div class="sbar-track"><div class="sbar-fill sbar-${cls}" data-pct="${pct}"></div></div>
      <span class="sbar-pct">${pct}% quality</span>
    </div>

    <p class="reasoning">${esc(reasoning)}</p>
    ${imprHtml}
    <div class="prompt-display">${esc(prompt)}</div>
  `;

  container.appendChild(card);

  // Animate bar after paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      const fill = card.querySelector('.sbar-fill');
      if (fill) fill.style.width = pct + '%';
    }, 80);
  });

  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Main optimization flow ────────────────────────
async function startOptimization() {
  const input = document.getElementById('prompt-input').value.trim();
  if (!input) {
    document.getElementById('prompt-input').focus();
    return;
  }

  const btn = document.getElementById('optimize-btn');
  const progressSec = document.getElementById('progress-section');
  const resultSec = document.getElementById('result-section');
  const cards = document.getElementById('cards-container');
  const loadingRow = document.getElementById('loading-row');
  const loadingText = document.getElementById('loading-text');
  const legendRow = document.getElementById('legend-row');

  // Reset
  btn.disabled = true;
  btn.innerHTML = `<div class="btn-spinner"></div> Analyzing…`;
  cards.innerHTML = '';
  progressSec.classList.remove('hidden');
  resultSec.classList.add('hidden');
  legendRow.classList.add('hidden');
  loadingRow.classList.remove('hidden');
  loadingText.textContent = 'Scoring your prompt…';
  finalPromptText = '';

  buildTracker(selectedIterations);

  let prevScore = null;
  let cardCount = 0;

  try {
    const res = await fetch('/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input, iterations: selectedIterations }),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        let evt;
        try { evt = JSON.parse(line.slice(6)); } catch { continue; }

        if (evt.type === 'iteration') {
          const iter = evt.data;
          const delta = prevScore !== null ? iter.judgeResult.total - prevScore : null;
          prevScore = iter.judgeResult.total;
          advanceTracker(iter.iteration);
          legendRow.classList.remove('hidden');
          appendCard(cards, iter, delta, cardCount * 40);
          cardCount++;
          const remaining = selectedIterations - iter.iteration;
          if (remaining > 0) {
            loadingText.textContent = `Running pass ${iter.iteration + 1} of ${selectedIterations}…`;
          }
        } else if (evt.type === 'done') {
          loadingRow.classList.add('hidden');
          finalPromptText = evt.data.finalPrompt;
          document.getElementById('final-text').textContent = evt.data.finalPrompt;
          document.getElementById('result-pill').textContent = `+${evt.data.scoreImprovement} pts improvement`;
          resultSec.classList.remove('hidden');
          setTimeout(() => resultSec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
        } else if (evt.type === 'error') {
          loadingRow.classList.add('hidden');
          showError(evt.data.message);
        }
      }
    }
  } catch (err) {
    loadingRow.classList.add('hidden');
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `Optimize <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
  }
}

function showError(msg) {
  const el = document.createElement('div');
  el.className = 'err-card';
  el.textContent = '⚠ ' + msg;
  document.getElementById('cards-container').appendChild(el);
}
