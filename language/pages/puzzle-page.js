/**
 * Puzzle Conversation page — guess-the-meaning playtest UI.
 */

/**
 * @param {{
 *   getState: () => object,
 *   api: (path: string, opts?: object) => Promise<unknown>,
 *   $: (id: string) => HTMLElement | null,
 *   escapeHtml: (s: unknown) => string,
 *   toast: (msg: string) => void,
 *   ensureRules: () => Promise<void>,
 *   romanToFonoraScript: (parts: string[], rules: object) => { phrase?: string },
 * }} deps
 */
export function createPuzzlePage(deps) {
  const { getState, api, $, escapeHtml, toast, ensureRules, romanToFonoraScript } = deps;

  function puzzleScriptHtml(spelling) {
    const STATE = getState();
    try {
      if (STATE.rules) {
        const { phrase } = romanToFonoraScript([spelling], STATE.rules);
        if (phrase) return `<span class="puzzle-script" aria-hidden="true">${escapeHtml(phrase)}</span>`;
      }
    } catch {
      /* script preview is optional */
    }
    return '';
  }

  async function loadPuzzleChallenge() {
    const STATE = getState();
    const p = STATE.puzzle;
    p.busy = true;
    p.revealed = false;
    p.recorded = false;
    p.repairTurns = 0;
    renderPuzzle();
    try {
      await ensureRules();
    } catch {
      /* script preview is optional */
    }
    try {
      const q = p.coreOnly ? '?core=1' : '';
      p.challenge = await api(`/api/fonoran/puzzle/challenge${q}`);
    } catch (e) {
      p.challenge = null;
      toast(e.message);
    } finally {
      p.busy = false;
      renderPuzzle();
    }
  }

  async function recordPuzzleGuess(recovered, guess) {
    const STATE = getState();
    const p = STATE.puzzle;
    const c = p.challenge;
    if (!c || p.recorded) return;
    p.recorded = true;
    p.session.played += 1;
    if (recovered) p.session.recovered += 1;
    try {
      await api('/api/fonoran/puzzle/guess', {
        method: 'POST',
        body: JSON.stringify({
          concept_id: c.concept_id,
          shown_spelling: c.spelling,
          shown_composition: c.parts,
          recovered,
          repair_turns: p.repairTurns,
          guess: guess ?? null,
          core_only: c.core_only,
          source: 'puzzle',
        }),
      });
    } catch (e) {
      toast(e.message);
    }
    try {
      p.summary = await api('/api/fonoran/playtests/summary');
    } catch {
      /* ignore */
    }
    renderPuzzle();
  }

  function onPuzzleChoice(choice) {
    const STATE = getState();
    const p = STATE.puzzle;
    const c = p.challenge;
    if (!c || p.revealed || p.recorded) return;
    const correct = String(choice).toLowerCase() === String(c.answer).toLowerCase();
    if (correct) {
      p.revealed = true;
      p.lastGuess = choice;
      p.lastCorrect = true;
      void recordPuzzleGuess(true, choice);
      return;
    }
    if (p.repairTurns < 1) {
      p.repairTurns += 1;
      p.repairWrong = choice;
      renderPuzzle();
      return;
    }
    p.revealed = true;
    p.lastGuess = choice;
    p.lastCorrect = false;
    void recordPuzzleGuess(false, choice);
  }

  function renderPuzzle() {
    const STATE = getState();
    const host = $('puzzle-body');
    if (!host) return;
    const p = STATE.puzzle;
    const c = p.challenge;

    const session = p.session.played
      ? `<span class="puzzle-score">Recovered <strong>${p.session.recovered}</strong> / ${p.session.played} this session</span>`
      : '';

    const summary = p.summary
      ? `<span class="puzzle-score puzzle-score--muted">All players: ${p.summary.recovered}/${p.summary.total_rounds} rounds recovered${p.summary.overall_recovery_rate != null ? ` (${Math.round(p.summary.overall_recovery_rate * 100)}%)` : ''}</span>`
      : '';

    let card;
    if (p.busy && !c) {
      card = `<p class="sans puzzle-loading">Picking a word…</p>`;
    } else if (!c) {
      card = `<div class="puzzle-card"><p class="sans">No words to play yet. Run the converged build, then press <strong>New word</strong>.</p></div>`;
    } else {
      const choices = (c.choices ?? [])
        .map((ch) => {
          let cls = 'puzzle-choice';
          if (p.revealed) {
            if (String(ch).toLowerCase() === String(c.answer).toLowerCase()) cls += ' puzzle-choice--correct';
            else if (p.lastGuess && String(ch).toLowerCase() === String(p.lastGuess).toLowerCase()) cls += ' puzzle-choice--wrong';
          }
          const dis = p.revealed || p.recorded ? ' disabled' : '';
          return `<button type="button" class="${cls}" data-puzzle-choice="${escapeHtml(ch)}"${dis}>${escapeHtml(ch)}</button>`;
        })
        .join('');

      const repair =
        p.repairTurns > 0 && !p.revealed
          ? `<div class="puzzle-repair">
               <p class="sans puzzle-repair__lead">Not quite — that was <strong>${escapeHtml(p.repairWrong ?? '')}</strong>. Repair turn: here is the literal breakdown.</p>
               <p class="puzzle-literal">${(c.literal_parts ?? []).map((lp) => `<span class="puzzle-literal__part"><span class="mono">${escapeHtml(lp.spelling)}</span> <span class="sans">${escapeHtml(lp.meaning)}</span></span>`).join('<span class="puzzle-literal__plus">+</span>')}</p>
               ${(c.alternate_forms ?? []).length ? `<p class="sans puzzle-repair__alts">Other speakers might say: ${(c.alternate_forms).map((a) => `<span class="mono">${escapeHtml(a.spelling)}</span> <span class="sans">(${escapeHtml(a.readable)})</span>`).join(', ')}</p>` : ''}
             </div>`
          : '';

      const reveal = p.revealed
        ? `<div class="puzzle-reveal ${p.lastCorrect ? 'puzzle-reveal--ok' : 'puzzle-reveal--miss'}">
               <p class="sans">${p.lastCorrect ? 'Recovered' : 'Not recovered'} ${p.repairTurns ? `after ${p.repairTurns} repair turn${p.repairTurns === 1 ? '' : 's'}` : 'on the first try'}. It means <strong>${escapeHtml(c.answer)}</strong>.</p>
               <p class="sans puzzle-reveal__literal">${escapeHtml(c.spelling)} = ${(c.literal_parts ?? []).map((lp) => lp.meaning).join(' + ')}.</p>
               <button type="button" class="btn btn--primary" id="puzzle-next">Next word</button>
             </div>`
        : '';

      card = `<div class="puzzle-card">
            <p class="sans puzzle-card__prompt">A speaker who knows the roots said this. What did they mean?</p>
            <div class="puzzle-word">
              <span class="puzzle-word__roman mono">${escapeHtml(c.spelling)}</span>
              ${puzzleScriptHtml(c.spelling)}
            </div>
            <div class="puzzle-choices">${choices}</div>
            ${repair}
            ${reveal}
          </div>`;
    }

    host.innerHTML = `
        <header class="grammar-toolbar">
          <div class="grammar-toolbar__text">
            <p class="grammar-toolbar__tag">The experiment</p>
            <h1 class="grammar-toolbar__title">Puzzle Conversation</h1>
            <p class="grammar-toolbar__lead sans">Could another root-knower recover the meaning? Guess what each Fonoran word means. Miss once and you get a repair turn with the literal roots. Every round is recorded as a real understandability playtest.</p>
          </div>
        </header>
        <div class="puzzle-controls sans">
          <label class="puzzle-toggle"><input type="checkbox" id="puzzle-core"${p.coreOnly ? ' checked' : ''}> 50-root challenge (communicative core only)</label>
          <button type="button" class="btn btn--primary" id="puzzle-new">New word</button>
          ${session}
          ${summary}
        </div>
        ${card}`;

    host.querySelectorAll('[data-puzzle-choice]').forEach((btn) => {
      btn.addEventListener('click', () => onPuzzleChoice(btn.dataset.puzzleChoice));
    });
    $('puzzle-new')?.addEventListener('click', () => {
      void loadPuzzleChallenge();
    });
    $('puzzle-next')?.addEventListener('click', () => {
      void loadPuzzleChallenge();
    });
    $('puzzle-core')?.addEventListener('change', (e) => {
      p.coreOnly = e.target.checked;
      void loadPuzzleChallenge();
    });

    if (!c && !p.busy && STATE.lab) {
      void loadPuzzleChallenge();
    }
  }

  return { renderPuzzle, loadPuzzleChallenge };
}
