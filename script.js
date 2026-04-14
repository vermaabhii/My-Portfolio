/* =========================================================
   FitLog – Gym Progress Tracker  |  script.js
   ========================================================= */

   'use strict';

   // ── CONSTANTS ────────────────────────────────────────────
   const LS_KEY = 'fitlog_workouts_v1';
   
   // ── STATE ─────────────────────────────────────────────────
   let workouts     = [];
   let filterQuery  = '';
   let sortMode     = 'newest';
   let typeFilter   = 'all';
   let workoutType  = 'strength'; // 'strength' | 'cardio'
   
   // ── DOM REFS ──────────────────────────────────────────────
   const form             = document.getElementById('workoutForm');
   const exNameInput      = document.getElementById('exerciseName');
   const weightInput      = document.getElementById('weight');
   const setsInput        = document.getElementById('sets');
   const repsInput        = document.getElementById('reps');
   const dateInput        = document.getElementById('workoutDate');
   const filterInput      = document.getElementById('filterInput');
   const clearFilterEl    = document.getElementById('clearFilter');
   const sortSelect       = document.getElementById('sortSelect');
   const typeFilterSelect = document.getElementById('typeFilter');
   const workoutList      = document.getElementById('workoutList');
   const emptyState       = document.getElementById('emptyState');
   const noResults        = document.getElementById('noResults');
   const resultMeta       = document.getElementById('resultMeta');
   const clearAllBtn      = document.getElementById('clearAllBtn');
   const modalBackdrop    = document.getElementById('modalBackdrop');
   const modalCancel      = document.getElementById('modalCancel');
   const modalConfirm     = document.getElementById('modalConfirm');
   const toastContainer   = document.getElementById('toastContainer');
   const datalistEl       = document.getElementById('exerciseSuggestions');
   
   // Graph elements
   const graphExerciseSelect = document.getElementById('graphExerciseSelect');
   const progressChartCanvas = document.getElementById('progressChart');
   let chartInstance = null;
   
   // Type toggle buttons
   const typeStrengthBtn  = document.getElementById('typeStrength');
   const typeCardioBtn    = document.getElementById('typeCardio');
   const strengthFields   = document.getElementById('strengthFields');
   const cardioFields     = document.getElementById('cardioFields');
   
   // Cardio inputs
   const cardioLabelInput    = document.getElementById('cardioLabel');
   const cardioSpeedInput    = document.getElementById('cardioSpeed');
   const cardioInclineInput  = document.getElementById('cardioIncline');
   const cardioDurationInput = document.getElementById('cardioDuration');
   const cardioDistanceInput = document.getElementById('cardioDistance');
   const cardioDateInput     = document.getElementById('cardioDate');
   
   // Header & stat elements
   const totalWorkoutsEl  = document.getElementById('totalWorkouts');
   const totalExercisesEl = document.getElementById('totalExercises');
   const statTotalEl      = document.getElementById('statTotal');
   const statUniqueEl     = document.getElementById('statUnique');
   const statMostEl       = document.getElementById('statMost');
   const statCardioEl     = document.getElementById('statCardio');
   const statLastEl       = document.getElementById('statLast');
   const addBtnLabel      = document.getElementById('addBtnLabel');
   const addBtn           = document.getElementById('addBtn');
   
   // ── LOCALSTORAGE HELPERS ──────────────────────────────────
   
   function loadWorkouts() {
     try {
       return JSON.parse(localStorage.getItem(LS_KEY)) || [];
     } catch {
       return [];
     }
   }
   
   function saveWorkouts(data) {
     localStorage.setItem(LS_KEY, JSON.stringify(data));
   }
   
   // ── DATE UTILITIES ────────────────────────────────────────
   
   function getTodayISO() {
     const d  = new Date();
     const yy = d.getFullYear();
     const mm = String(d.getMonth() + 1).padStart(2, '0');
     const dd = String(d.getDate()).padStart(2, '0');
     return `${yy}-${mm}-${dd}`;
   }
   
   function formatDate(iso) {
     const [yyyy, mm, dd] = iso.split('-');
     const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
     return d.toLocaleDateString('en-US', {
       weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
     });
   }
   
   // ── WORKOUT TYPE TOGGLE ───────────────────────────────────
   
   function setWorkoutType(type) {
     workoutType = type;
   
     if (type === 'strength') {
       typeStrengthBtn.classList.add('type-btn--active');
       typeStrengthBtn.classList.remove('cardio-active');
       typeCardioBtn.classList.remove('type-btn--active', 'cardio-active');
       strengthFields.style.display = '';
       cardioFields.style.display   = 'none';
       addBtnLabel.textContent       = 'Add Workout';
       addBtn.classList.remove('btn--cardio-mode');
     } else {
       typeCardioBtn.classList.add('type-btn--active', 'cardio-active');
       typeStrengthBtn.classList.remove('type-btn--active');
       strengthFields.style.display = 'none';
       cardioFields.style.display   = '';
       addBtnLabel.textContent       = 'Add Cardio';
       addBtn.classList.add('btn--cardio-mode');
       cardioDateInput.value = getTodayISO();
     }
     clearErrors();
   }
   
   typeStrengthBtn.addEventListener('click', () => setWorkoutType('strength'));
   typeCardioBtn.addEventListener('click',   () => setWorkoutType('cardio'));
   
   // ── VALIDATION ────────────────────────────────────────────
   
   function validateForm() {
     clearErrors();
     let valid = true;
   
     if (workoutType === 'strength') {
       if (!exNameInput.value.trim()) {
         showError('exerciseError', 'Exercise name is required.');
         valid = false;
       }
       if (!weightInput.value || Number(weightInput.value) < 0) {
         showError('weightError', 'Enter a valid weight (≥ 0).');
         valid = false;
       }
       if (!setsInput.value || Number(setsInput.value) < 1) {
         showError('setsError', 'Enter at least 1 set.');
         valid = false;
       }
       if (!repsInput.value || Number(repsInput.value) < 1) {
         showError('repsError', 'Enter at least 1 rep.');
         valid = false;
       }
     } else {
       // Cardio validation
       if (!cardioSpeedInput.value || Number(cardioSpeedInput.value) <= 0) {
         showError('cardioSpeedError', 'Enter a valid speed (> 0 km/h).');
         valid = false;
       }
       if (cardioInclineInput.value !== '' && (Number(cardioInclineInput.value) < 0 || Number(cardioInclineInput.value) > 30)) {
         showError('cardioInclineError', 'Incline must be between 0 and 30%.');
         valid = false;
       }
       if (!cardioDurationInput.value || Number(cardioDurationInput.value) < 1) {
         showError('cardioDurationError', 'Enter a duration of at least 1 minute.');
         valid = false;
       }
     }
     return valid;
   }
   
   function clearErrors() {
     ['exerciseError', 'weightError', 'setsError', 'repsError',
      'cardioSpeedError', 'cardioInclineError', 'cardioDurationError'].forEach(id => {
       const el = document.getElementById(id);
       if (el) el.textContent = '';
     });
   }
   
   function showError(id, msg) {
     const el = document.getElementById(id);
     if (el) el.textContent = msg;
   }
   
   // ── SORTING ───────────────────────────────────────────────
   
   function sortWorkouts(arr) {
     const copy = [...arr];
     switch (sortMode) {
       case 'oldest':
         return copy.sort((a, b) => new Date(a.date) - new Date(b.date));
       case 'exercise':
         return copy.sort((a, b) => (a.exercise || a.label || '').localeCompare(b.exercise || b.label || ''));
       case 'weight':
         // For cardio, sort by speed instead
         return copy.sort((a, b) => {
           const aVal = a.type === 'cardio' ? (a.speed || 0) : (a.weight || 0);
           const bVal = b.type === 'cardio' ? (b.speed || 0) : (b.weight || 0);
           return bVal - aVal;
         });
       case 'newest':
       default:
         return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
     }
   }
   
   // ── PROGRESS DETECTION (strength only) ───────────────────
   
   function getProgress(entry) {
     if (entry.type === 'cardio') return { delta: null, prev: null };
   
     const exercise  = entry.exercise.toLowerCase();
     const entryDate = new Date(entry.date);
   
     const earlier = workouts.filter(w =>
       w.type !== 'cardio' &&
       w.exercise.toLowerCase() === exercise &&
       new Date(w.date) < entryDate,
     );
   
     if (earlier.length === 0) return { delta: null, prev: null };
   
     earlier.sort((a, b) => new Date(b.date) - new Date(a.date));
     const prev = earlier[0];
     return { delta: entry.weight - prev.weight, prev: prev.weight };
   }
   
   // ── RENDER ────────────────────────────────────────────────
   
   function render() {
     const query = filterQuery.toLowerCase().trim();
   
     let filtered = workouts;
   
     // Type filter
     if (typeFilter !== 'all') {
       filtered = filtered.filter(w => (w.type || 'strength') === typeFilter);
     }
   
     // Search filter
     if (query) {
       filtered = filtered.filter(w => {
         const name = w.type === 'cardio' ? (w.label || 'treadmill cardio') : w.exercise;
         return name.toLowerCase().includes(query);
       });
     }
   
     const sorted = sortWorkouts(filtered);
   
     workoutList.innerHTML = '';
   
     if (workouts.length === 0) {
       emptyState.hidden = false;
       noResults.hidden  = true;
       resultMeta.textContent = '';
     } else if (filtered.length === 0) {
       noResults.hidden  = false;
       emptyState.hidden = true;
       resultMeta.textContent = '';
     } else {
       emptyState.hidden = true;
       noResults.hidden  = true;
       const label = query || typeFilter !== 'all'
         ? `Showing ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
         : `${workouts.length} workout${workouts.length !== 1 ? 's' : ''} logged`;
       resultMeta.textContent = label;
     }
   
     sorted.forEach(entry => {
       const card = entry.type === 'cardio'
         ? buildCardioCard(entry)
         : buildStrengthCard(entry);
       workoutList.appendChild(card);
     });
   
     updateStats();
     updateDatalist();
     updateGraph();
   }
   
   // ── BUILD STRENGTH CARD ───────────────────────────────────
   
   function buildStrengthCard(entry) {
     const li = document.createElement('div');
     li.className = 'workout-item';
     li.setAttribute('role', 'listitem');
     li.dataset.id = entry.id;
   
     const { delta, prev } = getProgress(entry);
   
     let badgeHTML = '';
     if (delta !== null) {
       if (delta > 0) {
         badgeHTML = `<span class="progress-badge progress-badge--up" title="Improvement vs previous">▲ +${delta}kg</span>`;
       } else if (delta < 0) {
         badgeHTML = `<span class="progress-badge progress-badge--down" title="Decrease vs previous">▼ ${delta}kg</span>`;
       } else {
         badgeHTML = `<span class="progress-badge progress-badge--same" title="Same as previous">= Same</span>`;
       }
     }
   
     const prevNote = prev !== null ? `<span class="prev-note">Previous: ${prev}kg</span>` : '';
   
     li.innerHTML = `
       <div class="workout-main">
         <div class="workout-name-row">
           <span class="workout-name">${escapeHtml(entry.exercise)}</span>
           <span class="type-badge type-badge--strength">Strength</span>
           ${badgeHTML}
         </div>
         <div class="workout-meta">
           <div class="meta-chip">
             <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M3 13h2M19 13h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
             <strong>${entry.weight}kg</strong>
           </div>
           <div class="meta-sep"></div>
           <div class="meta-chip">
             <svg viewBox="0 0 24 24" fill="none"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
             <strong>${entry.sets ? entry.sets + ' × ' : ''}${entry.reps}</strong> reps
           </div>
           ${prevNote}
         </div>
         <div class="workout-date">
           <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
           ${formatDate(entry.date)}
         </div>
       </div>
       <button class="delete-btn" aria-label="Delete ${escapeHtml(entry.exercise)} workout" title="Delete this entry">
         <svg viewBox="0 0 24 24" fill="none">
           <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
       </button>
     `;
   
     li.querySelector('.delete-btn').addEventListener('click', () => deleteWorkout(entry.id));
     return li;
   }
   
   // ── BUILD CARDIO CARD ─────────────────────────────────────
   
   function buildCardioCard(entry) {
     const li = document.createElement('div');
     li.className = 'workout-item workout-item--cardio';
     li.setAttribute('role', 'listitem');
     li.dataset.id = entry.id;
   
     const displayName = entry.label ? escapeHtml(entry.label) : 'Treadmill Cardio';
   
     // Build metrics: speed, incline, duration, distance (if present)
     const metrics = [];
   
     metrics.push(`
       <div class="cardio-metric">
         <span class="cardio-metric-value">${entry.speed}</span>
         <span class="cardio-metric-label">km/h</span>
       </div>
     `);
   
     metrics.push('<div class="cardio-metric-sep"></div>');
   
     metrics.push(`
       <div class="cardio-metric">
         <span class="cardio-metric-value">${entry.incline !== undefined && entry.incline !== null && entry.incline !== '' ? entry.incline + '%' : '0%'}</span>
         <span class="cardio-metric-label">Incline</span>
       </div>
     `);
   
     metrics.push('<div class="cardio-metric-sep"></div>');
   
     metrics.push(`
       <div class="cardio-metric">
         <span class="cardio-metric-value">${entry.duration}</span>
         <span class="cardio-metric-label">min</span>
       </div>
     `);
   
     if (entry.distance) {
       metrics.push('<div class="cardio-metric-sep"></div>');
       metrics.push(`
         <div class="cardio-metric">
           <span class="cardio-metric-value">${entry.distance}</span>
           <span class="cardio-metric-label">km</span>
         </div>
       `);
     }
   
     li.innerHTML = `
       <div class="workout-main">
         <div class="workout-name-row">
           <span class="workout-name">${displayName}</span>
           <span class="type-badge type-badge--cardio">Treadmill</span>
         </div>
         <div class="cardio-metrics">
           ${metrics.join('')}
         </div>
         <div class="workout-date">
           <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
           ${formatDate(entry.date)}
         </div>
       </div>
       <button class="delete-btn" aria-label="Delete cardio session" title="Delete this entry">
         <svg viewBox="0 0 24 24" fill="none">
           <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
       </button>
     `;
   
     li.querySelector('.delete-btn').addEventListener('click', () => deleteWorkout(entry.id));
     return li;
   }
   
   // ── STATS ─────────────────────────────────────────────────
   
   function updateStats() {
     const total       = workouts.length;
     const strengthAll = workouts.filter(w => (w.type || 'strength') === 'strength');
     const cardioAll   = workouts.filter(w => w.type === 'cardio');
     const unique      = [...new Set(strengthAll.map(w => w.exercise.toLowerCase()))].length;
   
     totalWorkoutsEl.textContent  = total;
     totalExercisesEl.textContent = unique + cardioAll.length;
   
     statTotalEl.textContent  = total;
     statUniqueEl.textContent = unique;
   
     if (total === 0) {
       statMostEl.textContent   = '—';
       statCardioEl.textContent = '—';
       statLastEl.textContent   = '—';
       return;
     }
   
     // Most logged strength exercise
     if (strengthAll.length > 0) {
       const freq = {};
       strengthAll.forEach(w => {
         const k = w.exercise.toLowerCase();
         freq[k] = (freq[k] || 0) + 1;
       });
       const mostEntry = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
       statMostEl.textContent = capitalize(mostEntry[0]) + ` (×${mostEntry[1]})`;
     } else {
       statMostEl.textContent = '—';
     }
   
     // Cardio summary
     if (cardioAll.length > 0) {
       const totalMin = cardioAll.reduce((sum, c) => sum + (c.duration || 0), 0);
       statCardioEl.textContent = `${cardioAll.length} session${cardioAll.length !== 1 ? 's' : ''} · ${totalMin} min`;
     } else {
       statCardioEl.textContent = '—';
     }
   
     // Last workout
     const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
     statLastEl.textContent = formatDate(sorted[0].date);
   }
   
   function updateDatalist() {
     const names = [...new Set(
       workouts
         .filter(w => (w.type || 'strength') === 'strength')
         .map(w => capitalize(w.exercise))
     )];
     datalistEl.innerHTML = names.map(n => `<option value="${escapeHtml(n)}"></option>`).join('');
   }
   
   // ── CRUD ──────────────────────────────────────────────────
   
   function handleAddWorkout(e) {
     e.preventDefault();
     if (!validateForm()) return;
   
     let entry;
   
     if (workoutType === 'strength') {
       entry = {
         id:       generateId(),
         type:     'strength',
         exercise: exNameInput.value.trim(),
         weight:   Number(weightInput.value),
         sets:     Number(setsInput.value),
         reps:     Number(repsInput.value),
         date:     dateInput.value || getTodayISO(),
       };
       showToast(`✅ "${capitalize(entry.exercise)}" added!`, 'success');
     } else {
       const inclineRaw = cardioInclineInput.value;
       entry = {
         id:       generateId(),
         type:     'cardio',
         label:    cardioLabelInput.value.trim() || '',
         speed:    Number(cardioSpeedInput.value),
         incline:  inclineRaw !== '' ? Number(inclineRaw) : 0,
         duration: Number(cardioDurationInput.value),
         distance: cardioDistanceInput.value ? Number(cardioDistanceInput.value) : null,
         date:     cardioDateInput.value || getTodayISO(),
       };
       const name = entry.label || 'Treadmill Cardio';
       showToast(`🏃 "${name}" session logged!`, 'cardio');
     }
   
     workouts.unshift(entry);
     saveWorkouts(workouts);
     render();
   
     // Reset only active section fields
     if (workoutType === 'strength') {
       exNameInput.value  = '';
       weightInput.value  = '';
       setsInput.value    = '';
       repsInput.value    = '';
       dateInput.value    = getTodayISO();
       clearErrors();
       exNameInput.focus();
     } else {
       cardioLabelInput.value    = '';
       cardioSpeedInput.value    = '';
       cardioInclineInput.value  = '';
       cardioDurationInput.value = '';
       cardioDistanceInput.value = '';
       cardioDateInput.value     = getTodayISO();
       clearErrors();
       cardioSpeedInput.focus();
     }
   }
   
   function deleteWorkout(id) {
     const idx = workouts.findIndex(w => w.id === id);
     if (idx === -1) return;
     const entry = workouts[idx];
     const name  = entry.type === 'cardio'
       ? (entry.label || 'Treadmill Cardio')
       : entry.exercise;
     workouts.splice(idx, 1);
     saveWorkouts(workouts);
     render();
     showToast(`🗑️ "${capitalize(name)}" deleted.`, 'info');
   }
   
   function clearAllWorkouts() {
     workouts = [];
     saveWorkouts(workouts);
     render();
     closeModal();
     showToast('🔄 All workouts cleared.', 'info');
   }
   
   // ── FILTER & SORT ─────────────────────────────────────────
   
   filterInput.addEventListener('input', () => {
     filterQuery = filterInput.value;
     clearFilterEl.classList.toggle('visible', filterQuery.length > 0);
     render();
   });
   
   clearFilterEl.addEventListener('click', () => {
     filterInput.value = '';
     filterQuery       = '';
     clearFilterEl.classList.remove('visible');
     filterInput.focus();
     render();
   });
   
   sortSelect.addEventListener('change', () => {
     sortMode = sortSelect.value;
     render();
   });
   
   typeFilterSelect.addEventListener('change', () => {
     typeFilter = typeFilterSelect.value;
     render();
   });
   
   // ── MODAL ─────────────────────────────────────────────────
   
   function openModal()  { modalBackdrop.hidden = false; modalConfirm.focus(); }
   function closeModal() { modalBackdrop.hidden = true; }
   
   clearAllBtn.addEventListener('click', () => {
     if (workouts.length === 0) { showToast('No workouts to clear.', 'info'); return; }
     openModal();
   });
   modalCancel.addEventListener('click', closeModal);
   modalConfirm.addEventListener('click', clearAllWorkouts);
   modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });
   document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modalBackdrop.hidden) closeModal(); });
   
   // ── TOAST ─────────────────────────────────────────────────
   
   function showToast(msg, type = 'info') {
     const el = document.createElement('div');
     el.className = `toast toast--${type}`;
     el.innerHTML = `<span class="toast-dot"></span>${escapeHtml(msg)}`;
     toastContainer.appendChild(el);
     setTimeout(() => el.remove(), 3000);
   }
   
   // ── UTILITY ───────────────────────────────────────────────
   
   function generateId() {
     return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
   }
   
   function escapeHtml(str) {
     return String(str)
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;');
   }
   
   function capitalize(str) {
     return str.replace(/\b\w/g, c => c.toUpperCase());
   }
   
   // ── GRAPH LOGIC ───────────────────────────────────────────
   
   function updateGraph() {
     if (!window.Chart || !graphExerciseSelect || !progressChartCanvas) return;
   
     const strengthWorkouts = workouts.filter(w => (w.type || 'strength') === 'strength');
     const uniqueExercises = [...new Set(strengthWorkouts.map(w => w.exercise.toLowerCase()))];
     
     const currentVal = graphExerciseSelect.value;
     graphExerciseSelect.innerHTML = uniqueExercises.map(ex => `<option value="${escapeHtml(ex)}">${capitalize(ex)}</option>`).join('');
     
     if (uniqueExercises.length === 0) {
       graphExerciseSelect.innerHTML = '<option value="">No data</option>';
       if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
       return;
     }
     
     if (uniqueExercises.includes(currentVal)) {
       graphExerciseSelect.value = currentVal;
     } else {
       const freq = {};
       strengthWorkouts.forEach(w => {
         const k = w.exercise.toLowerCase();
         freq[k] = (freq[k] || 0) + 1;
       });
       const mostEntry = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
       graphExerciseSelect.value = mostEntry;
     }
     
     renderGraph();
   }
   
   function renderGraph() {
     if (!window.Chart) return;
     const targetExercise = graphExerciseSelect.value;
     if (!targetExercise) return;
     
     const dataPoints = workouts
       .filter(w => (w.type || 'strength') === 'strength' && w.exercise.toLowerCase() === targetExercise)
       .sort((a, b) => new Date(a.date) - new Date(b.date));
       
     const labels = dataPoints.map(w => formatDate(w.date));
     const weights = dataPoints.map(w => w.weight);
     
     if (chartInstance) {
       chartInstance.data.labels = labels;
       chartInstance.data.datasets[0].data = weights;
       chartInstance.update();
     } else {
       const ctx = progressChartCanvas.getContext('2d');
       chartInstance = new Chart(ctx, {
         type: 'line',
         data: {
           labels: labels,
           datasets: [{
             label: 'Weight (kg)',
             data: weights,
             borderColor: '#6366f1',
             backgroundColor: 'rgba(99,102,241,0.1)',
             borderWidth: 3,
             pointBackgroundColor: '#a855f7',
             pointBorderColor: '#fff',
             pointRadius: 5,
             pointHoverRadius: 7,
             fill: true,
             tension: 0.3
           }]
         },
         options: {
           responsive: true,
           maintainAspectRatio: false,
           plugins: {
             legend: { display: false },
             tooltip: {
               callbacks: {
                 label: (context) => `${context.parsed.y} kg`
               }
             }
           },
           scales: {
             y: { 
               beginAtZero: false,
               grid: { color: 'rgba(255,255,255,0.05)' },
               ticks: { color: '#94a3b8' }
             },
             x: {
               grid: { display: false },
               ticks: { color: '#94a3b8', maxTicksLimit: 6 }
             }
           }
         }
       });
     }
   }
   
   if (graphExerciseSelect) {
     graphExerciseSelect.addEventListener('change', renderGraph);
   }
   
   // ── INIT ──────────────────────────────────────────────────
   
   function init() {
     workouts        = loadWorkouts();
     dateInput.value = getTodayISO();
     form.addEventListener('submit', handleAddWorkout);
     render();
   }
   
   init();
   
