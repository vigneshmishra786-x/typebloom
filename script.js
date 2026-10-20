/* =====================================================================
 * TypeBloom — script.js
 * Vanilla JS. No frameworks. Beginner-friendly.
 *
 * Responsibilities:
 *   1. Initialise the Supabase client (auth + database).
 *   2. Handle registration, login, sign-out, and session restore.
 *   3. Run the typing test: start / restart / finish, timer, live metrics.
 *   4. Compute WPM, accuracy, and errors using documented formulas.
 *   5. Maintain mood-based personalisation.
 *   6. Grow the virtual garden based on completed sessions.
 *   7. Save sessions to Supabase and load history & garden for signed-in users.
 *
 *  ⚠️  CONFIG REQUIRED:
 *     Replace the two placeholders below with your own Supabase project URL
 *     and publishable (anon) key. See README.md → "Step 4: Where to paste…"
 *     Never put a service-role key or DB password in this file.
 * ===================================================================== */

'use strict';

/* ------------------------------------------------------------------ *
 * 1. SUPABASE CONFIG — EDIT THESE TWO VALUES
 * ------------------------------------------------------------------ */
const SUPABASE_URL = 'https://rtkfpzvpofopzldazlgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RZrGi-wYvGfjiMo4ce5XFw_kje_6gog';

/* ------------------------------------------------------------------ *
 * 2. STATIC DATA — passages, moods, garden stages
 * ------------------------------------------------------------------ */

// Passages are grouped by difficulty. Each mood has a small bias
// (e.g. tired users get shorter, simpler sentences). For simplicity
// we pick from the difficulty pool, and choose shorter ones when "tired".
const PASSAGES = {
  beginner: [
    'the sun rises and the birds sing a soft morning song.',
    'a calm mind makes it easier to read and to type.',
    'small steps every day lead to a bigger garden of skills.',
    'breathe in, breathe out, and let your fingers glide over keys.',
    'the river flows gently past the quiet green hills.',
    'a kind word and a steady pace make a happy day.',
    'water the plant, watch it grow, and your patience will be rewarded.'
  ],
  intermediate: [
    'Typing is a gentle rhythm; let your fingers feel the keys and your breath remain calm and steady throughout the practice.',
    'The garden grows not because we hurry, but because we show up, plant a seed, and trust the slow work of patience and care.',
    'Across the meadow, the morning mist curled softly around the trunks of trees, holding the day in a quiet, silver hush.',
    'Reading widely and writing daily are two of the most reliable ways to sharpen your thoughts and broaden your language skills.',
    'When you focus on accuracy instead of speed, speed usually follows on its own, quietly and without any extra effort.'
  ],
  advanced: [
    'The thoughtful writer does not merely chase words; she cultivates sentences the way a gardener tends to seedlings — patiently, attentively, and with an enduring respect for rhythm and clarity.',
    'Although technological progress frequently accelerates the pace of everyday life, deliberate slowness remains an underrated virtue: it preserves nuance, deepens understanding, and cushions the mind against the noise of constant distraction.',
    'Computational thinking encourages us to decompose complex problems, recognise recurring patterns, abstract away irrelevant details, and design algorithms that are both correct and considerate of the human beings who will eventually rely on them.',
    'A resilient organisation treats failures not as embarrassments to be concealed but as instructive artefacts; each incident, when examined honestly, becomes a small but sturdy brick in the foundation of future reliability and trust.'
  ]
};

const MOODS = {
  calm:      { emoji: '🌿', label: 'Calm',      message: 'Slow and steady. Let your breath lead.' },
  focused:   { emoji: '🎯', label: 'Focused',   message: 'Stay with the passage. One word at a time.' },
  energetic: { emoji: '⚡', label: 'Energetic',  message: 'Quick and light! Keep your fingers loose.' },
  tired:     { emoji: '🌙', label: 'Tired',     message: 'Gentle pace. Accuracy first, speed later.' }
};

// Garden stages — based on the cumulative number of completed, saved sessions.
// threshold = number of sessions required to REACH this stage.
const GARDEN_STAGES = [
  { id: 'seed',       name: 'Seed',          emoji: '🌱', threshold: 0  },
  { id: 'sprout',     name: 'Sprout',        emoji: '🌿', threshold: 1  },
  { id: 'young',      name: 'Young Plant',   emoji: '☘️', threshold: 3  },
  { id: 'blooming',   name: 'Blooming Plant',emoji: '🌷', threshold: 6  },
  { id: 'flourishing',name: 'Flourishing',    emoji: '🌸', threshold: 10 }
];
const MAX_STAGE_INDEX = GARDEN_STAGES.length - 1;

/* ------------------------------------------------------------------ *
 * 3. DOM REFERENCES — collected once on load
 * ------------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);
const els = {
  // Account / auth
  accountPill: $('account-status'),
  accountLabel: document.querySelector('#account-status .account-label'),
  authToggle:  $('auth-toggle-btn'),
  authPanel:  $('auth-panel'),
  tabLogin:   $('tab-login'),
  tabRegister:$('tab-register'),
  loginForm:  $('login-form'),
  registerForm:$('register-form'),
  loginEmail: $('login-email'),
  loginPassword: $('login-password'),
  registerEmail: $('register-email'),
  registerPassword: $('register-password'),
  loginSubmit: $('login-submit'),
  registerSubmit: $('register-submit'),
  authNote:   $('auth-note'),
  signoutBtn: $('signout-btn'),

  // Dashboard
  dashboardSub: $('dashboard-sub'),
  statWpm: $('stat-wpm'),       statWpmFoot: $('stat-wpm-foot'),
  statAcc: $('stat-accuracy'),  statAccFoot: $('stat-accuracy-foot'),
  statErr: $('stat-errors'),    statErrFoot: $('stat-errors-foot'),
  statSes: $('stat-sessions'),  statSesFoot: $('stat-sessions-foot'),

  // Mood
  moodChips: document.querySelectorAll('.mood-chip'),

  // Practice
  heroStartBtn: $('hero-start-btn'),
  practiceStatus: $('practice-status'),
  startBtn: $('start-btn'),
  finishBtn: $('finish-btn'),
  restartBtn: $('restart-btn'),
  passage: $('passage'),
  typingInput: $('typing-input'),
  liveTime: $('live-time'),
  liveWpm: $('live-wpm'),
  liveAcc: $('live-accuracy'),
  liveErr: $('live-errors'),
  results: $('results'),
  resultWpm: $('result-wpm'),
  resultAcc: $('result-accuracy'),
  resultErr: $('result-errors'),
  resultDur: $('result-duration'),
  resultMsg: $('result-message'),
  resultSave: $('result-save'),
  resultsClose: $('results-close'),

  // Garden
  plantArt: $('plant-art'),
  gardenStageName: $('garden-stage-name'),
  gardenStageCount: $('garden-stage-count'),
  gardenStageLabel: $('garden-stage-label'),
  gardenProgressBar: $('garden-progress-bar'),
  gardenProgressText: $('garden-progress-text'),
  gardenMessage: $('garden-message'),
  gardenSub: $('garden-sub'),

  // History
  historyList: $('history-list'),
  historyEmpty: $('history-empty'),
  historySub: $('history-sub'),

  // Toast
  toast: $('toast')
};

/* ------------------------------------------------------------------ *
 * 4. APP STATE — single mutable object keeps things clear
 * ------------------------------------------------------------------ */
const state = {
  // Auth
  supabase: null,           // set in initSupabase()
  currentUser: null,        // Supabase user object or null

  // Practice config
  difficulty: 'beginner',
  duration: 30,             // seconds
  mood: 'focused',

  // Practice runtime
  status: 'idle',           // 'idle' | 'running' | 'finished'
  passageText: '',          // current passage characters
  typedChars: [],           // per-position: 'correct' | 'incorrect' | null (not yet typed)
  totalKeystrokes: 0,       // every printable key press on input
  correctKeystrokes: 0,
  errorKeystrokes: 0,
  startTime: 0,             // ms timestamp of first keystroke
  endTime: 0,               // ms timestamp of finish
  remaining: 0,             // seconds left in countdown
  timerId: null,            // setInterval handle
  rafId: null,              // requestAnimationFrame handle for clock

  // Aggregated user stats (latest + totals)
  latestWpm: 0,
  latestAccuracy: 100,
  latestErrors: 0,
  totalErrors: 0,
  totalSessions: 0
};

/* ------------------------------------------------------------------ *
 * 5. SMALL UTILITIES
 * ------------------------------------------------------------------ */

/** Show a transient toast message. */
let toastTimer = null;
function showToast(message, kind = '') {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.className = 'toast show ' + kind;
  els.toast.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
    els.toast.classList.remove('show');
  }, 2600);
}

/**
 * Safely set text content of an element.
 * We avoid innerHTML for any user-controlled content to prevent injection.
 */
function setText(el, text) {
  if (el) el.textContent = (text === undefined || text === null) ? '' : String(text);
}

/** Toggle an attribute on a single element. */
function setAttr(el, name, value) {
  if (!el) return;
  if (value === true)  el.setAttribute(name, '');
  else if (value === false) el.removeAttribute(name);
  else el.setAttribute(name, String(value));
}

/** Validate an email using a simple, beginner-readable regex. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Format a Date (or ISO string) as a short local date+time. */
function formatDate(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return '—'; }
}

/** Escape text for safe insertion as HTML attribute or body. */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ------------------------------------------------------------------ *
 * 6. SUPABASE INITIALISATION
 * ------------------------------------------------------------------ */
function initSupabase() {
  // Sanity-check that placeholders have been replaced.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY ||
      SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL' ||
      SUPABASE_ANON_KEY === 'YOUR_SUPABASE_PUBLISHABLE_KEY') {
    console.warn('[TypeBloom] Supabase credentials not configured. ' +
      'Practice will work locally, but sessions cannot be saved.');
    updateAccountPill('off', 'Not configured');
    els.dashboardSub.textContent = 'Add Supabase credentials in script.js to save progress.';
    return;
  }

  // Verify the global `supabase` object was loaded by the CDN.
  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.error('[TypeBloom] Supabase SDK not found. Did the CDN script load?');
    els.authNote.textContent = 'Supabase SDK failed to load. Check your connection.';
    els.authNote.className = 'auth-note error';
    updateAccountPill('off', 'SDK missing');
    return;
  }

  try {
    state.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true  // handles email-confirmation redirects
      }
    });
    console.info('[TypeBloom] Supabase client ready.');
  } catch (err) {
    console.error('[TypeBloom] Failed to create Supabase client:', err);
    els.authNote.textContent = 'Could not connect to Supabase. See console.';
    els.authNote.className = 'auth-note error';
    updateAccountPill('off', 'Error');
  }
}

/* ------------------------------------------------------------------ *
 * 7. AUTHENTICATION
 * ------------------------------------------------------------------ */

/** Update the small pill in the navbar. */
function updateAccountPill(kind, label) {
  els.accountPill.classList.remove('is-signed', 'is-off');
  if (kind === 'signed') els.accountPill.classList.add('is-signed');
  else if (kind === 'off') els.accountPill.classList.add('is-off');
  setText(els.accountLabel, label);
}

/** Toggle the visibility of the auth panel (Sign in button). */
function toggleAuthPanel(forceOpen) {
  const shouldOpen = (forceOpen === undefined) ? els.authPanel.hidden : forceOpen;
  els.authPanel.hidden = !shouldOpen;
  els.authToggle.setAttribute('aria-expanded', String(shouldOpen));
  if (shouldOpen) {
    els.authToggle.textContent = state.currentUser ? 'Account' : 'Sign in';
    // Pre-fill email if we know it.
    if (state.currentUser) {
      setText(els.loginEmail, state.currentUser.email || '');
    }
  }
}

/** Switch auth tab between Log in and Register. */
function switchAuthTab(tab) {
  const isLogin = (tab === 'login');
  els.tabLogin.classList.toggle('active', isLogin);
  els.tabRegister.classList.toggle('active', !isLogin);
  els.tabLogin.setAttribute('aria-selected', String(isLogin));
  els.tabRegister.setAttribute('aria-selected', String(!isLogin));
  els.loginForm.hidden = !isLogin;
  els.registerForm.hidden = isLogin;
  setAttr(els.authNote, 'hidden'); els.authNote.hidden = false;
  els.authNote.textContent = '';
  els.authNote.className = 'auth-note';
}

/** Set auth-related buttons based on whether a user is signed in. */
function reflectAuthState() {
  if (state.currentUser) {
    updateAccountPill('signed', state.currentUser.email || 'Signed in');
    els.authToggle.textContent = 'Account';
    els.signoutBtn.hidden = false;
    // Hide forms once logged in — they're not needed.
    els.loginForm.hidden = true;
    els.registerForm.hidden = true;
    els.tabLogin.hidden = true;
    els.tabRegister.hidden = true;
    els.authNote.textContent = 'You are signed in. Your sessions will be saved.';
    els.authNote.className = 'auth-note success';
    els.dashboardSub.textContent = 'Signed in — your saved stats are shown below.';
    els.historySub.textContent = 'Your last 10 saved sessions are shown below.';
    els.gardenSub.textContent = 'Your garden progress is restored from your account.';
  } else {
    updateAccountPill('off', 'Signed out');
    els.authToggle.textContent = 'Sign in';
    els.signoutBtn.hidden = true;
    els.tabLogin.hidden = false;
    els.tabRegister.hidden = false;
    els.tabLogin.classList.add('active');
    els.tabRegister.classList.remove('active');
    els.tabLogin.setAttribute('aria-selected', 'true');
    els.tabRegister.setAttribute('aria-selected', 'false');
    els.loginForm.hidden = false;
    els.registerForm.hidden = true;
    els.authNote.textContent = 'We never store your password. Authentication is handled by Supabase.';
    els.authNote.className = 'auth-note';
    els.dashboardSub.textContent = 'Sign in to load your saved stats. Otherwise, today\'s local practice is shown here.';
    els.historySub.textContent = 'Your last 10 saved sessions appear here. Sign in to sync across devices.';
    els.gardenSub.textContent = 'Finish practice sessions to grow your plant. Progress is saved with your account.';
  }
}

/** Attempt to restore the existing session on page load. */
async function restoreSession() {
  if (!state.supabase) { reflectAuthState(); return; }
  try {
    const { data, error } = await state.supabase.auth.getSession();
    if (error) {
      console.warn('[TypeBloom] getSession error:', error.message);
    } else if (data && data.session && data.session.user) {
      onSignedIn(data.session.user);
    } else {
      reflectAuthState();
    }
  } catch (err) {
    console.warn('[TypeBloom] Could not restore session:', err);
    reflectAuthState();
  }
}

/** Called when a user becomes signed in (login, register, or restore). */
async function onSignedIn(user) {
  state.currentUser = user;
  reflectAuthState();
  // Load this user's saved data.
  await Promise.all([loadHistory(), loadGardenProgress()]);
}

/** Called when user signs out. */
function onSignedOut() {
  state.currentUser = null;
  // Reset displayed totals (we no longer have access to the user's saved data).
  state.totalErrors = 0;
  state.totalSessions = 0;
  state.latestWpm = 0;
  state.latestAccuracy = 100;
  state.latestErrors = 0;
  updateDashboard();
  renderGarden(0);
  renderHistory([]);
  reflectAuthState();
  showToast('Signed out.', 'success');
}

/** Send a password reset email to the registered user. */
async function handlePasswordReset() {
  if (!state.supabase) {
    setAuthError('Supabase is not configured.');
    return;
  }

  const email = els.loginEmail.value.trim();

  if (!isValidEmail(email)) {
    setAuthError('Enter your registered email address first.');
    return;
  }

  setAuthNote('Sending password reset email…');

  try {
    const redirectTo =
      window.location.origin + window.location.pathname;

    const { error } =
      await state.supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });

    if (error) {
      setAuthError('Reset failed: ' + error.message);
      return;
    }

    setAuthNote(
      'If the account exists, a reset link will be sent. Check your inbox and spam folder.',
      'success'
    );
  } catch (err) {
    setAuthError('Could not send reset email. Check your connection.');
  }
}

/** Handle login form submission. */
async function handleLogin(e) {
  e.preventDefault();
  if (!state.supabase) {
    setAuthError('Supabase is not configured. Add your project URL and anon key in script.js.');
    return;
  }
  const email = els.loginEmail.value.trim();
  const password = els.loginPassword.value;
  if (!isValidEmail(email)) { setAuthError('Please enter a valid email address.'); return; }
  if (password.length < 6) { setAuthError('Password must be at least 6 characters.'); return; }

  setAuthLoading(true);
  try {
    const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) {
      // Map common errors to friendlier messages.
      let msg = error.message || 'Could not sign in.';
      if (/invalid login credentials/i.test(msg)) msg = 'Wrong email or password. Please try again.';
      if (/not confirmed/i.test(msg)) msg = 'Please confirm your email using the link we sent, then try again.';
      setAuthError(msg);
      return;
    }
    if (data && data.user) {
      setAuthNote('Signed in successfully.', 'success');
      await onSignedIn(data.user);
      // Close the panel automatically.
      toggleAuthPanel(false);
    }
  } catch (err) {
    setAuthLoading(false);
    setAuthError('Network error: ' + (err && err.message ? err.message : 'could not reach Supabase.'));
  }
}

/** Handle register form submission. */
async function handleRegister(e) {
  e.preventDefault();
  if (!state.supabase) {
    setAuthError('Supabase is not configured. Add your project URL and anon key in script.js.');
    return;
  }
  const email = els.registerEmail.value.trim();
  const password = els.registerPassword.value;
  if (!isValidEmail(email)) { setAuthError('Please enter a valid email address.'); return; }
  if (password.length < 6) { setAuthError('Choose a password of at least 6 characters.'); return; }

  setAuthLoading(true);
  try {
    const { data, error } = await state.supabase.auth.signUp({ email, password });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message || 'Could not register.');
      return;
    }
    // Many Supabase projects require email confirmation.
    if (data && data.user && (data.user.identities && data.user.identities.length === 0)) {
      setAuthError('This email is already registered. Try logging in instead.');
      return;
    }
    if (data && data.session) {
      // Auto-confirmed (email confirmation disabled).
      setAuthNote('Account created — welcome to TypeBloom!', 'success');
      await onSignedIn(data.user);
      toggleAuthPanel(false);
    } else if (data && data.user) {
      // Email confirmation is required.
      setAuthNote('Account created! Check your inbox for a confirmation link, then log in.', 'success');
      // Switch to login tab to make the next step easy.
      switchAuthTab('login');
      els.loginEmail.value = email;
    } else {
      setAuthNote('Account created. Please log in.', 'success');
      switchAuthTab('login');
    }
  } catch (err) {
    setAuthLoading(false);
    setAuthError('Network error: ' + (err && err.message ? err.message : 'could not reach Supabase.'));
  }
}

/** Sign out the current user. */
async function handleSignout() {
  if (!state.supabase) return;
  try {
    const { error } = await state.supabase.auth.signOut();
    if (error) {
      setAuthError(error.message || 'Could not sign out.');
      return;
    }
    onSignedOut();
    toggleAuthPanel(false);
  } catch (err) {
    setAuthError('Network error while signing out.');
  }
}

/** Helpers for auth-note UI states. */
function setAuthNote(text, kind) {
  els.authNote.textContent = text;
  els.authNote.className = 'auth-note ' + (kind || '');
}
function setAuthError(text) { setAuthNote(text, 'error'); }
function setAuthLoading(loading) {
  els.loginSubmit.classList.toggle('is-loading', loading);
  els.registerSubmit.classList.toggle('is-loading', loading);
  els.loginSubmit.disabled = loading;
  els.registerSubmit.disabled = loading;
}

/* ------------------------------------------------------------------ *
 * 8. MOOD SELECTOR
 * ------------------------------------------------------------------ */
function selectMood(moodKey) {
  if (!MOODS[moodKey]) return;
  state.mood = moodKey;
  els.moodChips.forEach(chip => {
    const isActive = (chip.dataset.mood === moodKey);
    chip.classList.toggle('selected', isActive);
    chip.setAttribute('aria-checked', String(isActive));
  });
  // Show a small encouragement.
  showToast(`${MOODS[moodKey].emoji} ${MOODS[moodKey].label}: ${MOODS[moodKey].message}`);
}

/* ------------------------------------------------------------------ *
 * 9. TYPING TEST ENGINE
 * ------------------------------------------------------------------ */

/** Choose a passage for the current difficulty and mood. */
function pickPassage() {
  let pool = PASSAGES[state.difficulty] || PASSAGES.beginner;
  // Tired mood → prefer the shortest sentence in the pool.
  if (state.mood === 'tired') {
    const sorted = [...pool].sort((a, b) => a.length - b.length);
    return sorted[Math.floor(Math.random() * Math.min(2, sorted.length))];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Render the passage into #passage with per-character <span> elements. */
function renderPassage(text) {
  els.passage.innerHTML = '';
  // Use a document fragment; we control all text here (passages are static).
  const frag = document.createDocumentFragment();
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const span = document.createElement('span');
    span.className = 'ch pending';
    span.textContent = ch;
    // Mark space visually as a small dot when current/incorrect (handled in CSS).
    frag.appendChild(span);
  }
  els.passage.appendChild(frag);
  // Mark the first char as current.
  const first = els.passage.querySelector('.ch');
  if (first) first.classList.add('current');
}

/** Update per-character classes based on the user's typed text. */
function refreshPassageClasses() {
  const spans = els.passage.querySelectorAll('.ch');
  const typed = els.typingInput.value;
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    span.classList.remove('correct', 'incorrect', 'current', 'pending');
    if (i < typed.length) {
      // Compare character-by-character.
      if (typed[i] === state.passageText[i]) {
        span.classList.add('correct');
      } else {
        span.classList.add('incorrect');
      }
    } else if (i === typed.length) {
      span.classList.add('current');
    } else {
      span.classList.add('pending');
    }
  }
}

/** Start a brand new typing test. */
function startTest() {
  // Prevent starting multiple tests at once.
  if (state.status === 'running') {
    setPracticeStatus('A test is already running. Press Finish or Restart.');
    return;
  }
  // Reset prior state.
  resetTestState();
  // Pick a fresh passage.
  state.passageText = pickPassage();
  renderPassage(state.passageText);
  // Enable input and prepare.
  els.typingInput.disabled = false;
  els.typingInput.value = '';
  els.typingInput.placeholder = 'Start typing — the timer begins on your first keystroke.';
  els.typingInput.focus();
  state.status = 'running';
  state.remaining = state.duration;
  setText(els.liveTime, state.duration + 's');
  setText(els.liveWpm, '0');
  setText(els.liveAcc, '100%');
  setText(els.liveErr, '0');
  setPracticeStatus(`Press any key to begin. Mood: ${MOODS[state.mood].label}.`);
  els.startBtn.disabled = true;
  els.finishBtn.disabled = false;
  els.results.hidden = true;
}

/** Reset runtime state without picking a new passage. */
function resetTestState() {
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }
  state.passageText = '';
  state.typedChars = [];
  state.totalKeystrokes = 0;
  state.correctKeystrokes = 0;
  state.errorKeystrokes = 0;
  state.startTime = 0;
  state.endTime = 0;
  state.remaining = state.duration;
  state.status = 'idle';
  els.typingInput.value = '';
  els.typingInput.disabled = true;
  els.startBtn.disabled = false;
  els.finishBtn.disabled = true;
  setText(els.liveTime, state.duration + 's');
  setText(els.liveWpm, '0');
  setText(els.liveAcc, '100%');
  setText(els.liveErr, '0');
}

/** Restart: clear everything and let user press Start again. */
function restartTest() {
  resetTestState();
  els.passage.innerHTML = '<span class="passage-placeholder">Press <strong>Start</strong> to load a passage.</span>';
  els.results.hidden = true;
  setPracticeStatus('Ready. Press Start to begin a new test.');
}

/**
 * Handle each keystroke in the typing input.
 * We compare typed characters to the passage to track correctness.
 * The timer starts on the first valid keystroke.
 */
function handleTypingInput() {
  if (state.status !== 'running') return;

  // Start the timer on the first keystroke.
  if (!state.startTime) {
    state.startTime = performance.now();
    startCountdown();
  }

  const typed = els.typingInput.value;
  const typedLen = typed.length;

  // Count this keystroke.
  // We recompute correctness per character on every input event.
  // To avoid double-counting, we track lastTypedLen and only count deltas.
  const delta = typedLen - (state._lastTypedLen || 0);
  if (delta > 0) {
    // The user added one or more characters. Compare the last `delta` chars.
    for (let i = typedLen - delta; i < typedLen; i++) {
      if (i < 0 || i >= state.passageText.length) {
        // Off-the-end character (extra typing beyond passage).
        state.errorKeystrokes++;
        state.totalKeystrokes++;
        continue;
      }
      const expected = state.passageText[i];
      const actual = typed[i];
      if (actual === expected) {
        state.correctKeystrokes++;
      } else {
        state.errorKeystrokes++;
      }
      state.totalKeystrokes++;
    }
  }
  // Note: backspaces do NOT reduce error count by design — errors are
  // counted as incorrect keystrokes made, which is a common standard.
  state._lastTypedLen = typedLen;

  // Refresh character highlighting.
  refreshPassageClasses();

  // Auto-finish if the user has typed the entire passage correctly.
  if (typedLen >= state.passageText.length) {
    // Confirm correctness one final time.
    const allCorrect = (typed === state.passageText);
    if (allCorrect) {
      finishTest(true);
      return;
    }
  }

  // Update live metrics.
  updateLiveMetrics();
}

/** Recompute and display WPM, accuracy, errors while the test runs. */
function updateLiveMetrics() {
  const elapsedMs = state.startTime ? (performance.now() - state.startTime) : 0;
  const elapsedMin = elapsedMs / 60000;
  // WPM = (correct chars / 5) / elapsed minutes.
  let wpm = 0;
  if (elapsedMin > 0) {
    wpm = Math.round((state.correctKeystrokes / 5) / elapsedMin);
  }
  const acc = computeAccuracy(state.correctKeystrokes, state.totalKeystrokes);
  setText(els.liveWpm, String(wpm));
  setText(els.liveAcc, acc.toFixed(0) + '%');
  setText(els.liveErr, String(state.errorKeystrokes));
}

/** Accuracy = correct keystrokes / total keystrokes * 100 (0 if no keystrokes). */
function computeAccuracy(correct, total) {
  if (!total || total <= 0) return 100;
  const a = (correct / total) * 100;
  return Math.max(0, Math.min(100, a));
}

/** Start the per-second countdown. */
function startCountdown() {
  state.timerId = setInterval(() => {
    if (state.startTime === 0) return; // not started yet
    const elapsedMs = performance.now() - state.startTime;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const remaining = Math.max(0, state.duration - elapsedSec);
    state.remaining = remaining;
    setText(els.liveTime, remaining + 's');
    updateLiveMetrics();
    if (remaining <= 0) {
      finishTest(false);
    }
  }, 250);
}

/** Finish the test (timer expired, passage complete, or user clicked Finish). */
async function finishTest(completedPassage) {
  if (state.status !== 'running') return;
  state.status = 'finished';
  state.endTime = performance.now();
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }

  // Lock input.
  els.typingInput.disabled = true;
  els.finishBtn.disabled = true;
  els.startBtn.disabled = false;

  // Final metrics — use elapsed time from first keystroke to now,
  // but if the user never typed, use the chosen duration as denominator = 0.
  const elapsedMs = state.startTime ? (state.endTime - state.startTime) : 0;
  const elapsedMin = elapsedMs / 60000;
  let wpm = 0;
  if (elapsedMin > 0) {
    wpm = Math.round((state.correctKeystrokes / 5) / elapsedMin);
  }
  const accuracy = computeAccuracy(state.correctKeystrokes, state.totalKeystrokes);
  const errors = state.errorKeystrokes;

  // Update app state totals.
  state.latestWpm = wpm;
  state.latestAccuracy = accuracy;
  state.latestErrors = errors;

  // Show results summary.
  showResults(wpm, accuracy, errors, elapsedMs, completedPassage);

  // Update dashboard with latest values.
  updateDashboard();

  // Save the session (if signed in & configured).
  await saveSessionToSupabase({
    wpm,
    accuracy: Math.round(accuracy),
    errors,
    mood: state.mood,
    difficulty: state.difficulty,
    duration_sec: state.duration,
    elapsed_ms: Math.round(elapsedMs)
  });

  setPracticeStatus('Session complete. Press Start to try again.');
}

/** Render the results panel. */
function showResults(wpm, accuracy, errors, elapsedMs, completedPassage) {
  setText(els.resultWpm, String(wpm));
  setText(els.resultAcc, accuracy.toFixed(0) + '%');
  setText(els.resultErr, String(errors));
  setText(els.resultDur, (elapsedMs / 1000).toFixed(1) + 's');

  // Encouragement based on performance and mood.
  let msg = '';
  if (completedPassage) msg = 'You finished the whole passage — beautiful!';
  else if (wpm >= 60) msg = 'Lightning fingers! Keep that rhythm.';
  else if (wpm >= 40) msg = 'Solid pace — steady as a growing vine.';
  else if (wpm >= 20) msg = 'Good start. Each session waters the plant.';
  else msg = 'Every keystroke counts. The garden appreciates you.';
  setText(els.resultMsg, msg);

  // Save status will be updated by saveSessionToSupabase.
  setText(els.resultSave, '');
  els.results.hidden = false;
  els.results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setPracticeStatus(text) { setText(els.practiceStatus, text); }

/* ------------------------------------------------------------------ *
 * 10. DATABASE — save sessions, load history, load garden progress
 * ------------------------------------------------------------------ */

/**
 * Save a completed session to Supabase.
 * Updates garden by recomputing from session count (preferred approach)
 * or by upserting into user_progress table.
 */
async function saveSessionToSupabase(session) {
  // If Supabase isn't configured or user isn't signed in, fall back to local.
  if (!state.supabase) {
    els.resultSave.textContent = 'Not signed in — session was not saved to an account.';
    els.resultSave.className = 'result-save warn';
    // Still grow a local-only garden so the user sees feedback.
    growLocalGarden();
    return;
  }
  if (!state.currentUser) {
    els.resultSave.textContent = 'Sign in to save this session to your account.';
    els.resultSave.className = 'result-save warn';
    growLocalGarden();
    return;
  }

  // Validate before sending.
  if (typeof session.wpm !== 'number' || typeof session.accuracy !== 'number') {
    els.resultSave.textContent = 'Could not save — invalid session data.';
    els.resultSave.className = 'result-save error';
    return;
  }

  els.resultSave.textContent = 'Saving…';
  els.resultSave.className = 'result-save';

  try {
    const payload = {
      user_id: state.currentUser.id,
      wpm: session.wpm,
      accuracy: session.accuracy,
      errors: session.errors,
      mood: session.mood,
      difficulty: session.difficulty,
      duration_sec: session.duration_sec
      // session_timestamp has a default value of now() in SQL.
    };

    const { data, error } = await state.supabase
      .from('practice_sessions')
      .insert(payload)
      .select('id, created_at')
      .single();

    if (error) {
      throw error;
    }
    if (!data || !data.id) {
      throw new Error('Insert returned no row.');
    }

    // Success. Update the local totals + garden + history.
    state.totalSessions += 1;
    state.totalErrors += session.errors;
    els.resultSave.textContent = 'Saved to your account.';
    els.resultSave.className = 'result-save success';

    // Refresh garden growth (server-side source of truth).
    await loadGardenProgress();
    // Refresh recent history list.
    await loadHistory();
    // Update dashboard totals.
    updateDashboard();
    showToast('Session saved. 🌱 +1', 'success');
  } catch (err) {
    console.error('[TypeBloom] saveSession error:', err);
    let msg = 'Could not save session.';
    if (err && err.message) {
      if (/jwt/i.test(err.message) || /expired/i.test(err.message)) {
        msg = 'Your session expired. Please sign in again.';
      } else if (/permission|policy|rls/i.test(err.message)) {
        msg = 'Database blocked the save (RLS policy). Check supabase.sql.';
      } else if (/network|failed to fetch/i.test(err.message)) {
        msg = 'Network error — check your connection and try again.';
      } else {
        msg = 'Save failed: ' + err.message;
      }
    }
    els.resultSave.textContent = msg;
    els.resultSave.className = 'result-save error';
  }
}

/** Load this user's most recent 10 sessions from Supabase. */
async function loadHistory() {
  if (!state.supabase || !state.currentUser) {
    renderHistory([]);
    return;
  }
  try {
    const { data, error } = await state.supabase
      .from('practice_sessions')
      .select('id, wpm, accuracy, errors, mood, difficulty, duration_sec, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    if (data && data.length) {
      // Also update aggregate totals from server (more reliable than local).
      // We use a separate count query.
      const totalErrs = data.reduce((sum, r) => sum + (r.errors || 0), 0);
      // Note: total sessions is computed from the garden progress endpoint
      // to remain consistent. We'll just set the local latest here.
      if (data[0]) {
        state.latestWpm = data[0].wpm || 0;
        state.latestAccuracy = data[0].accuracy || 0;
        state.latestErrors = data[0].errors || 0;
        state.totalErrors = totalErrs;
        updateDashboard();
      }
      renderHistory(data);
    } else {
      renderHistory([]);
    }
  } catch (err) {
    console.error('[TypeBloom] loadHistory error:', err);
    renderHistory([]);
    showToast('Could not load history.', 'error');
  }
}

/** Load the user's garden progress (total session count) from Supabase. */
async function loadGardenProgress() {
  if (!state.supabase || !state.currentUser) {
    renderGarden(0);
    return;
  }
  try {
    // Use a count() query to derive garden stage from saved sessions.
    // This avoids needing a separate table (the user's progress is
    // always recomputed from practice_sessions, which is the most
    // reliable source of truth).
    const { count, error } = await state.supabase
      .from('practice_sessions')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    const total = (typeof count === 'number') ? count : 0;
    state.totalSessions = total;
    renderGarden(total);
    updateDashboard();
  } catch (err) {
    console.error('[TypeBloom] loadGardenProgress error:', err);
    renderGarden(0);
  }
}

/** Grow the garden locally when not signed in. */
function growLocalGarden() {
  state.totalSessions = (state.totalSessions || 0) + 1;
  renderGarden(state.totalSessions);
  updateDashboard();
}

/* ------------------------------------------------------------------ *
 * 11. RENDERING — dashboard, garden, history
 * ------------------------------------------------------------------ */

/** Render the dashboard stat cards. */
function updateDashboard() {
  setText(els.statWpm, String(state.latestWpm));
  setText(els.statAcc, state.latestAccuracy.toFixed(0) + '%');
  setText(els.statErr, String(state.totalErrors));
  setText(els.statSes, String(state.totalSessions));

  // Footers with helpful context.
  setText(els.statWpmFoot, state.latestWpm > 0 ? 'From latest session' : 'No session yet');
  setText(els.statAccFoot, state.latestAccuracy > 0 ? 'From latest session' : 'No session yet');
  setText(els.statErrFoot, state.totalErrors > 0 ? 'Across all sessions' : 'No errors recorded');
  setText(els.statSesFoot,
    state.totalSessions === 0 ? 'Plant your first seed' :
    state.totalSessions === 1 ? 'Sprout unlocked!' :
    state.totalSessions < 6 ? 'Young plant growing' :
    'Blooming nicely 🌷');
}

/** Compute the garden stage index for a given session count. */
function computeStageIndex(total) {
  let idx = 0;
  for (let i = 0; i < GARDEN_STAGES.length; i++) {
    if (total >= GARDEN_STAGES[i].threshold) idx = i;
  }
  return Math.min(idx, MAX_STAGE_INDEX);
}

/** Render the garden: stage, emoji, progress to next stage, message. */
function renderGarden(total) {
  const stageIdx = computeStageIndex(total);
  const stage = GARDEN_STAGES[stageIdx];
  const next = GARDEN_STAGES[stageIdx + 1];

  // Render the plant art (an emoji inside a span).
  els.plantArt.innerHTML = '';
  const span = document.createElement('span');
  span.className = 'stage-emoji';
  span.textContent = stage.emoji;
  els.plantArt.appendChild(span);

  // Update labels.
  setText(els.gardenStageName, stage.name);
  setText(els.gardenStageCount, total + ' session' + (total === 1 ? '' : 's'));
  setText(els.gardenStageLabel, 'Plant stage: ' + stage.name);

  // Progress to next stage.
  let progressPct = 100;
  let progressText = '';
  if (next) {
    const span = next.threshold - stage.threshold;
    const done = total - stage.threshold;
    progressPct = Math.max(0, Math.min(100, (done / span) * 100));
    const remaining = next.threshold - total;
    progressText = `${done}/${span} to reach ${next.name} — ${remaining} more session${remaining === 1 ? '' : 's'} to go.`;
  } else {
    progressText = 'Maximum stage reached. Your garden is in full bloom!';
  }
  els.gardenProgressBar.style.width = progressPct.toFixed(0) + '%';
  setText(els.gardenProgressText, progressText);

  // Encouragement message.
  let message = '';
  if (total === 0) message = 'Plant your first seed today.';
  else if (total === 1) message = 'A sprout appeared. Keep going.';
  else if (total < 6) message = 'Steady growth — your plant is thriving.';
  else if (total < 10) message = 'Your garden is blooming beautifully.';
  else message = 'A flourishing garden — your dedication shows.';
  setText(els.gardenMessage, message);
}

/** Render the history list from an array of session rows. */
function renderHistory(rows) {
  els.historyList.innerHTML = '';
  if (!rows || rows.length === 0) {
    els.historyEmpty.hidden = false;
    return;
  }
  els.historyEmpty.hidden = true;
  // Build rows with textContent — never inject untrusted values via innerHTML.
  rows.forEach(row => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.setAttribute('role', 'listitem');

    const moodEl = document.createElement('span');
    moodEl.className = 'history-mood';
    const moodKey = (row.mood && MOODS[row.mood]) ? row.mood : 'focused';
    moodEl.textContent = MOODS[moodKey].emoji;
    moodEl.setAttribute('aria-label', MOODS[moodKey].label);

    const meta = document.createElement('div');
    meta.className = 'history-meta';
    const strong = document.createElement('strong');
    strong.textContent = (row.difficulty || 'beginner') + ' • ' + (row.duration_sec || 0) + 's';
    meta.appendChild(strong);
    const when = document.createElement('span');
    when.textContent = formatDate(row.created_at);
    meta.appendChild(when);

    const stats = document.createElement('div');
    stats.className = 'history-stats';
    const wpmSpan = document.createElement('div');
    wpmSpan.className = 'h-wpm';
    wpmSpan.textContent = (row.wpm || 0) + ' WPM';
    stats.appendChild(wpmSpan);
    const accSpan = document.createElement('span');
    accSpan.className = 'h-acc';
    accSpan.textContent = (row.accuracy || 0) + '% acc • ' + (row.errors || 0) + ' errors';
    stats.appendChild(accSpan);

    item.appendChild(moodEl);
    item.appendChild(meta);
    item.appendChild(stats);
    els.historyList.appendChild(item);
  });
}

/* ------------------------------------------------------------------ *
 * 12. EVENT WIRING
 * ------------------------------------------------------------------ */
function wireEvents() {
  // Auth toggle (navbar button).
  
const forgotPasswordBtn = $('forgot-password-btn');

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener(
    'click',
    handlePasswordReset
  );
}

  els.authToggle.addEventListener('click', () => {
    toggleAuthPanel(els.authPanel.hidden);
  });

  // Auth tabs.
  els.tabLogin.addEventListener('click', () => switchAuthTab('login'));
  els.tabRegister.addEventListener('click', () => switchAuthTab('register'));

  // Auth forms.
  els.loginForm.addEventListener('submit', handleLogin);
  els.registerForm.addEventListener('submit', handleRegister);
  els.signoutBtn.addEventListener('click', handleSignout);

  // Hero CTA → focus practice input.
  els.heroStartBtn.addEventListener('click', (e) => {
    // Allow the anchor to jump to #practice first, then start.
    setTimeout(() => startTest(), 350);
  });

  // Mood chips.
  els.moodChips.forEach(chip => {
    chip.addEventListener('click', () => selectMood(chip.dataset.mood));
    chip.addEventListener('keydown', (e) => {
      // Arrow-key navigation for the radiogroup.
      const chips = Array.from(els.moodChips);
      const idx = chips.indexOf(chip);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = chips[(idx + 1) % chips.length];
        next.focus();
        selectMood(next.dataset.mood);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = chips[(idx - 1 + chips.length) % chips.length];
        prev.focus();
        selectMood(prev.dataset.mood);
      }
    });
  });

  // Difficulty + duration chips.
  document.querySelectorAll('.chip[data-difficulty]').forEach(chip => {
    chip.addEventListener('click', () => {
      if (state.status === 'running') {
        showToast('Finish or restart the current test before changing difficulty.', 'error');
        return;
      }
      document.querySelectorAll('.chip[data-difficulty]').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('selected');
      chip.setAttribute('aria-checked', 'true');
      state.difficulty = chip.dataset.difficulty;
    });
  });
  document.querySelectorAll('.chip[data-duration]').forEach(chip => {
    chip.addEventListener('click', () => {
      if (state.status === 'running') {
        showToast('Finish or restart the current test before changing duration.', 'error');
        return;
      }
      document.querySelectorAll('.chip[data-duration]').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('selected');
      chip.setAttribute('aria-checked', 'true');
      state.duration = parseInt(chip.dataset.duration, 10);
      setText(els.liveTime, state.duration + 's');
    });
  });

  // Practice controls.
  els.startBtn.addEventListener('click', startTest);
  els.restartBtn.addEventListener('click', restartTest);
  els.finishBtn.addEventListener('click', () => finishTest(false));
  els.resultsClose.addEventListener('click', () => { els.results.hidden = true; });

  // Typing input.
  els.typingInput.addEventListener('input', handleTypingInput);

  // Listen for Supabase auth state changes (e.g. email-confirm redirect).
  if (state.supabase && state.supabase.auth && state.supabase.auth.onAuthStateChange) {
    state.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && session.user) {
        if (!state.currentUser || state.currentUser.id !== session.user.id) {
          onSignedIn(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        onSignedOut();
      } else if (event === 'TOKEN_REFRESHED' && session && session.user) {
        state.currentUser = session.user;
      }
    });
  }

  // Keyboard shortcut: Esc closes the results panel.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.results.hidden) {
      els.results.hidden = true;
    }
  });
}

/* ------------------------------------------------------------------ *
 * 13. INITIALISE ON DOM READY
 * ------------------------------------------------------------------ */
function init() {
  initSupabase();
  wireEvents();
  reflectAuthState();
  updateDashboard();
  renderGarden(0);
  renderHistory([]);
  // Try to restore an existing session in the background.
  restoreSession();
}

// Run after DOM is parsed; the script is loaded with `defer` so this is safe.
document.addEventListener('DOMContentLoaded', init);
