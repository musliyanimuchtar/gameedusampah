/**
 * EcoBot – game.js
 * Complete game logic for the Waste Management Educational Game
 * Grid: 5x5 (1 = bottom-left, 25 = top-right)
 * Character starts at cell 1, facing East
 */

'use strict';

// =====================================================
// CONSTANTS & EMOJIS
// =====================================================
const DIRECTIONS = ['east', 'south', 'west', 'north'];
// CW: east->south->west->north->east

const DIR_LABELS = {
  east:  'Timur (Kanan)',
  south: 'Selatan (Bawah)',
  west:  'Barat (Kiri)',
  north: 'Utara (Atas)'
};

const DIR_EMOJI = {
  east:  '🤖➡️',
  south: '🤖⬇️',
  west:  '🤖⬅️',
  north: '🤖⬆️'
};

const CHAR_ARROW = { east: '▶', south: '▼', west: '◀', north: '▲' };

const COMPASS_ROTATE = { east: 90, south: 180, west: 270, north: 0 };

const BLOCK_META = {
  move:      { icon: '➡️', label: 'Maju 1 Langkah',    cls: 'block-move' },
  rotate_cw: { icon: '🔃', label: 'Putar Kanan 90°',   cls: 'block-rotate-cw' },
  rotate_ccw:{ icon: '🔄', label: 'Putar Kiri 90°',    cls: 'block-rotate-ccw' },
  pickup:    { icon: '🤏', label: 'Ambil Sampah',       cls: 'block-pickup' },
  drop:      { icon: '📥', label: 'Letakkan Sampah',    cls: 'block-drop' },
  loop:      { icon: '🔁', label: 'Ulangi X Kali',     cls: 'block-loop' },
};

const WASTE_META = {
  plastic_bottle: { emoji: '🍶', label: 'Botol Plastik', type: 'inorganic' },
  can:            { emoji: '🥫', label: 'Kaleng',        type: 'inorganic' },
  plastic_bag:    { emoji: '🛍️', label: 'Kantong Plastik', type: 'inorganic' },
  food:           { emoji: '🍌', label: 'Sisa Makanan',  type: 'organic' },
  leaf:           { emoji: '🍂', label: 'Daun',          type: 'organic' },
  fruit_peel:     { emoji: '🍊', label: 'Kulit Buah',    type: 'organic' },
};

// =====================================================
// LEVEL DEFINITIONS
// =====================================================
const LEVELS = [
  {
    id: 1,
    title: '🌱 Level 1: Dasar Pemilahan',
    desc: 'Botol plastik ada di petak 3. Antar ke tempat sampah anorganik di petak 13! Hati-hati ada batu di petak 8.',
    wastes: [
      { cell: 3, id: 'plastic_bottle' }
    ],
    bins: [
      { cell: 13, type: 'inorganic' }
    ],
    obstacles: [8],
    solution: 'Ulangi 2x: Maju → Ambil Sampah → Putar Kiri → Ulangi 2x: Maju → Letakkan Sampah'
  },
  {
    id: 2,
    title: '🍂 Level 2: Dua Sampah',
    desc: 'Ada daun di petak 2 dan botol plastik di petak 4. Buang ke tempat sampah yang tepat! Organik di petak 12, anorganik di petak 14.',
    wastes: [
      { cell: 2, id: 'leaf' },
      { cell: 4, id: 'plastic_bottle' }
    ],
    bins: [
      { cell: 12, type: 'organic' },
      { cell: 14, type: 'inorganic' }
    ],
    obstacles: [9],
    solution: 'Maju → Ambil → Putar Kiri → Ulangi 2x: Maju → Letakkan → Reset, ambil berikutnya'
  },
  {
    id: 3,
    title: '🥫 Level 3: Labirin Sampah',
    desc: 'Sisa makanan di petak 21, kaleng di petak 5. Organik di petak 23, anorganik di petak 15. Banyak penghalang!',
    wastes: [
      { cell: 21, id: 'food' },
      { cell: 5, id: 'can' }
    ],
    bins: [
      { cell: 23, type: 'organic' },
      { cell: 15, type: 'inorganic' }
    ],
    obstacles: [3, 8, 17, 19],
    solution: 'Navigasi hati-hati sambil membawa satu sampah sekaligus!'
  }
];

// =====================================================
// GAME STATE
// =====================================================
let state = {
  levelIdx: 0,
  charCell: 1,
  charDir: 'east',
  inventory: null,         // { id: 'plastic_bottle', ... }
  wastes: {},              // cellNum -> { id, emoji, wasteType }
  bins: {},                // cellNum -> { type: 'organic'|'inorganic' }
  obstacles: new Set(),
  program: [],             // array of instruction objects
  running: false,
  stepCount: 0,
};

let pendingLoopCount = 2;
let pendingLoopChildren = [];

// =====================================================
// DOM REFS
// =====================================================
const $ = id => document.getElementById(id);
const gameGrid       = $('game-grid');
const workspace      = $('workspace');
const wsPlaceholder  = $('ws-placeholder');
const logBody        = $('log-body');
const invSlot        = $('inventory-slot');
const compassArrow   = $('compass-arrow');
const compassLabel   = $('compass-label');
const levelTitle     = $('level-title');
const levelDesc      = $('level-desc');
const levelBadge     = $('level-badge');
const btnRun         = $('btn-run');
const btnReset       = $('btn-reset');
const btnClear       = $('btn-clear');
const modalOverlay   = $('modal-overlay');
const modalEmoji     = $('modal-emoji');
const modalTitle     = $('modal-title');
const modalMessage   = $('modal-message');
const modalStars     = $('modal-stars');
const btnModalRetry  = $('btn-modal-retry');
const btnModalNext   = $('btn-modal-next');
const loopModal      = $('loop-modal');
const loopCountVal   = $('loop-count-val');
const loopCountMinus = $('loop-count-minus');
const loopCountPlus  = $('loop-count-plus');
const btnLoopCancel  = $('btn-loop-cancel');
const btnLoopConfirm = $('btn-loop-confirm');
const lcModal        = $('loop-children-modal');
const lcBlocks       = $('loop-children-blocks');
const btnLcCancel    = $('btn-lc-cancel');
const btnLcConfirm   = $('btn-lc-confirm');

// =====================================================
// GRID HELPERS
// =====================================================
// Cell numbers: row 1 = cells 1-5 (bottom), row 5 = cells 21-25 (top)
// cellNum -> {row, col} where row 1 = bottom, col 1 = left
function cellToRC(n) {
  return { row: Math.ceil(n / 5), col: ((n - 1) % 5) + 1 };
}
function rcToCell(r, c) { return (r - 1) * 5 + c; }

// Move from cell in direction, returns new cell or null if OOB
function moveCell(cell, dir) {
  const { row, col } = cellToRC(cell);
  let nr = row, nc = col;
  if (dir === 'east')  nc += 1;
  if (dir === 'west')  nc -= 1;
  if (dir === 'north') nr += 1;
  if (dir === 'south') nr -= 1;
  if (nr < 1 || nr > 5 || nc < 1 || nc > 5) return null;
  return rcToCell(nr, nc);
}

// =====================================================
// GRID RENDERING
// =====================================================
function buildGrid() {
  gameGrid.innerHTML = '';
  // Grid visual: row 5 on top → row 1 on bottom
  // grid-template-rows: row5 row4 row3 row2 row1 (top-to-bottom visually)
  for (let row = 5; row >= 1; row--) {
    for (let col = 1; col <= 5; col++) {
      const cellNum = rcToCell(row, col);
      const div = document.createElement('div');
      div.className = 'cell';
      div.id = `cell-${cellNum}`;
      div.setAttribute('role', 'gridcell');
      div.setAttribute('aria-label', `Petak ${cellNum}`);

      const numLabel = document.createElement('span');
      numLabel.className = 'cell-num';
      numLabel.textContent = cellNum;
      div.appendChild(numLabel);

      gameGrid.appendChild(div);
    }
  }
}

function renderGrid() {
  // Clear all cell content/classes except cell-num label
  for (let i = 1; i <= 25; i++) {
    const cell = $(`cell-${i}`);
    if (!cell) continue;
    cell.className = 'cell';
    // Remove all non-cell-num children
    const num = cell.querySelector('.cell-num');
    cell.innerHTML = '';
    cell.appendChild(num);
  }

  // Render obstacles
  state.obstacles.forEach(n => {
    const cell = $(`cell-${n}`);
    if (!cell) return;
    cell.classList.add('obstacle');
    const span = document.createElement('span');
    span.className = 'cell-emoji';
    span.textContent = '🪨';
    span.title = 'Batu - Penghalang';
    cell.appendChild(span);
  });

  // Render bins
  Object.entries(state.bins).forEach(([n, bin]) => {
    const cell = $(`cell-${n}`);
    if (!cell) return;
    const cls = bin.type === 'organic' ? 'bin-organic' : 'bin-inorganic';
    cell.classList.add(cls);
    const span = document.createElement('span');
    span.className = 'cell-emoji';
    span.textContent = bin.type === 'organic' ? '🟢' : '🔵';
    span.title = bin.type === 'organic' ? 'Tempat Sampah Organik' : 'Tempat Sampah Anorganik';
    cell.appendChild(span);
  });

  // Render wastes
  Object.entries(state.wastes).forEach(([n, w]) => {
    const cell = $(`cell-${n}`);
    if (!cell) return;
    const span = document.createElement('span');
    span.className = 'cell-emoji';
    span.textContent = w.emoji;
    span.title = w.label;
    cell.appendChild(span);
  });

  // Render character
  const charCell = $(`cell-${state.charCell}`);
  if (charCell) {
    charCell.classList.add('has-character');
    const charSpan = document.createElement('span');
    charSpan.className = 'character-emoji';
    charSpan.textContent = '🤖';
    charSpan.title = `Robot - Menghadap ${DIR_LABELS[state.charDir]}`;
    charSpan.style.transform = `rotate(${COMPASS_ROTATE[state.charDir] - 90}deg)`;
    charCell.appendChild(charSpan);
  }

  // Update compass
  compassArrow.style.transform = `rotate(${COMPASS_ROTATE[state.charDir]}deg)`;
  compassLabel.textContent = `Menghadap: ${DIR_LABELS[state.charDir]}`;

  // Update inventory
  renderInventory();
}

function renderInventory() {
  if (state.inventory) {
    const w = state.inventory;
    invSlot.innerHTML = `<span title="${w.label}">${w.emoji} ${w.label}</span>`;
    invSlot.classList.add('filled');
  } else {
    invSlot.innerHTML = '<span class="inv-empty">Kosong</span>';
    invSlot.classList.remove('filled');
  }
}

// =====================================================
// LEVEL INITIALIZATION
// =====================================================
function loadLevel(idx) {
  const level = LEVELS[idx];
  state.levelIdx    = idx;
  state.charCell    = 1;
  state.charDir     = 'east';
  state.inventory   = null;
  state.wastes      = {};
  state.bins        = {};
  state.obstacles   = new Set(level.obstacles);
  state.program     = [];
  state.running     = false;
  state.stepCount   = 0;

  level.wastes.forEach(w => {
    const meta = WASTE_META[w.id];
    state.wastes[w.cell] = { id: w.id, emoji: meta.emoji, label: meta.label, wasteType: meta.type };
  });
  level.bins.forEach(b => {
    state.bins[b.cell] = { type: b.type };
  });

  levelTitle.textContent = level.title;
  levelDesc.textContent  = level.desc;
  levelBadge.textContent = `Level ${level.id}`;

  // Reset stars
  ['star1','star2','star3'].forEach(id => {
    $( id).classList.remove('active');
  });

  renderWorkspace();
  clearLog();
  buildGrid();
  renderGrid();
  btnRun.disabled = false;

  addLog('info', `📋 Level ${level.id} dimulai! Susun program dan tekan Jalankan.`);
}

// =====================================================
// WORKSPACE RENDERING
// =====================================================
function renderWorkspace() {
  workspace.innerHTML = '';
  if (state.program.length === 0) {
    wsPlaceholder.style.display = 'flex';
    workspace.appendChild(wsPlaceholder);
    return;
  }
  wsPlaceholder.style.display = 'none';

  state.program.forEach((instr, idx) => {
    workspace.appendChild(createWsItem(instr, idx, null));
  });
}

function createWsItem(instr, idx, parentIdx) {
  const meta = BLOCK_META[instr.type];
  if (!meta) return document.createTextNode('');

  if (instr.type === 'loop') {
    const wrapper = document.createElement('div');
    wrapper.className = 'ws-loop';
    wrapper.id = parentIdx === null ? `ws-loop-${idx}` : `ws-loop-${parentIdx}-${idx}`;

    const header = document.createElement('div');
    header.className = 'ws-loop-header';
    header.innerHTML = `<span>${meta.icon}</span><span>Ulangi ${instr.count} Kali</span>`;

    const delBtn = document.createElement('button');
    delBtn.className = 'ws-delete';
    delBtn.textContent = '✕';
    delBtn.title = 'Hapus loop ini';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (parentIdx === null) {
        state.program.splice(idx, 1);
      }
      renderWorkspace();
    });
    header.appendChild(delBtn);
    wrapper.appendChild(header);

    const childrenDiv = document.createElement('div');
    childrenDiv.className = 'ws-loop-children';
    (instr.children || []).forEach((child, ci) => {
      childrenDiv.appendChild(createWsItem(child, ci, idx));
    });
    wrapper.appendChild(childrenDiv);
    return wrapper;
  }

  // Normal instruction
  const div = document.createElement('div');
  const clsMap = {
    move: 'block-move', rotate_cw: 'block-rotate-cw', rotate_ccw: 'block-rotate-ccw',
    pickup: 'block-pickup', drop: 'block-drop'
  };
  div.className = `ws-item ${clsMap[instr.type] || ''}`;
  div.id = parentIdx === null ? `ws-item-${idx}` : `ws-item-${parentIdx}-${idx}`;
  div.innerHTML = `<span>${meta.icon}</span><span>${meta.label}</span>`;

  const delBtn = document.createElement('button');
  delBtn.className = 'ws-delete';
  delBtn.textContent = '✕';
  delBtn.title = 'Hapus instruksi ini';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (parentIdx === null) {
      state.program.splice(idx, 1);
    }
    renderWorkspace();
  });
  div.appendChild(delBtn);
  return div;
}

// =====================================================
// ADD BLOCK TO PROGRAM
// =====================================================
function addBlockToProgram(type) {
  if (state.running) return;

  if (type === 'loop') {
    // Step 1: Ask for count
    pendingLoopCount = 2;
    loopCountVal.textContent = pendingLoopCount;
    loopModal.removeAttribute('hidden');
    return;
  }

  state.program.push({ type });
  renderWorkspace();
}

// =====================================================
// LOG HELPERS
// =====================================================
function clearLog() {
  logBody.innerHTML = '<p class="log-idle">Program belum dijalankan.</p>';
}
function addLog(type, msg) {
  const p = document.createElement('p');
  p.className = `log-${type}`;
  p.textContent = msg;
  // Remove initial idle message
  const idle = logBody.querySelector('.log-idle');
  if (idle) idle.remove();
  logBody.appendChild(p);
  logBody.scrollTop = logBody.scrollHeight;
}

// =====================================================
// EXECUTION ENGINE
// =====================================================
async function runProgram() {
  if (state.running || state.program.length === 0) {
    if (state.program.length === 0) addLog('err', '⚠️ Program kosong! Tambahkan instruksi terlebih dahulu.');
    return;
  }

  state.running = true;
  btnRun.disabled = true;
  clearLog();
  addLog('info', '▶ Program dimulai...');

  // Flatten instructions for execution
  const flat = flattenInstructions(state.program);

  let failed = false;
  let errorMsg = '';

  for (let i = 0; i < flat.length; i++) {
    const instr = flat[i];
    highlightWorkspaceItem(instr.wsId);
    await sleep(400);

    const result = executeInstruction(instr.type);
    renderGrid();

    if (!result.ok) {
      failed = true;
      errorMsg = result.msg;
      addLog('err', `❌ Langkah ${i+1}: ${result.msg}`);
      shakeGrid();
      break;
    } else {
      addLog('ok', `✔ Langkah ${i+1}: ${result.msg}`);
    }

    state.stepCount++;
    await sleep(300);
  }

  clearWorkspaceHighlight();

  if (!failed) {
    // Check win condition: all wastes collected and placed
    const wasteLeft = Object.keys(state.wastes).length;
    if (wasteLeft === 0 && state.inventory === null) {
      await sleep(300);
      showWin();
    } else {
      addLog('err', '❌ Program selesai tapi masih ada sampah yang belum dibuang!');
      await sleep(500);
      showLose('Program selesai tanpa hasil! Masih ada sampah yang belum terbuang.');
    }
  } else {
    await sleep(500);
    showLose(errorMsg);
  }

  state.running = false;
  btnRun.disabled = false;
}

function flattenInstructions(program, prefix = '') {
  const result = [];
  program.forEach((instr, i) => {
    const wsId = prefix ? `ws-item-${prefix}-${i}` : `ws-item-${i}`;
    if (instr.type === 'loop') {
      const loopId = prefix ? `ws-loop-${prefix}-${i}` : `ws-loop-${i}`;
      for (let r = 0; r < instr.count; r++) {
        const children = flattenInstructions(instr.children || [], `${prefix ? prefix + '-' : ''}${i}`);
        result.push(...children);
      }
    } else {
      result.push({ type: instr.type, wsId: prefix ? `ws-item-${prefix}-${i}` : `ws-item-${i}` });
    }
  });
  return result;
}

function executeInstruction(type) {
  switch (type) {
    case 'move': return execMove();
    case 'rotate_cw': return execRotateCW();
    case 'rotate_ccw': return execRotateCCW();
    case 'pickup': return execPickup();
    case 'drop': return execDrop();
    default: return { ok: false, msg: `Instruksi tidak dikenal: ${type}` };
  }
}

function execMove() {
  const newCell = moveCell(state.charCell, state.charDir);
  if (newCell === null) {
    return { ok: false, msg: 'Robot mencoba keluar dari batas grid!' };
  }
  if (state.obstacles.has(newCell)) {
    return { ok: false, msg: `Robot menabrak batu di petak ${newCell}!` };
  }
  state.charCell = newCell;
  return { ok: true, msg: `Robot maju ke petak ${newCell}` };
}

function execRotateCW() {
  const idx = DIRECTIONS.indexOf(state.charDir);
  state.charDir = DIRECTIONS[(idx + 1) % 4];
  return { ok: true, msg: `Robot berputar kanan → Menghadap ${DIR_LABELS[state.charDir]}` };
}

function execRotateCCW() {
  const idx = DIRECTIONS.indexOf(state.charDir);
  state.charDir = DIRECTIONS[(idx + 3) % 4];
  return { ok: true, msg: `Robot berputar kiri → Menghadap ${DIR_LABELS[state.charDir]}` };
}

function execPickup() {
  if (state.inventory !== null) {
    return { ok: false, msg: 'Robot sudah membawa sampah! (Pelanggaran inventoris)' };
  }
  const waste = state.wastes[state.charCell];
  if (!waste) {
    return { ok: false, msg: `Tidak ada sampah di petak ${state.charCell}!` };
  }
  state.inventory = { ...waste };
  delete state.wastes[state.charCell];
  return { ok: true, msg: `Robot mengambil ${waste.label} dari petak ${state.charCell}` };
}

function execDrop() {
  if (state.inventory === null) {
    return { ok: false, msg: 'Robot tidak membawa sampah apapun!' };
  }
  const bin = state.bins[state.charCell];
  if (!bin) {
    return { ok: false, msg: `Tidak ada tempat sampah di petak ${state.charCell}!` };
  }
  // Check type match
  if (bin.type !== state.inventory.wasteType) {
    const got = state.inventory.wasteType === 'organic' ? 'Organik' : 'Anorganik';
    const expected = bin.type === 'organic' ? 'Organik' : 'Anorganik';
    const inv = state.inventory;
    state.inventory = null; // clear it anyway to show lose
    return {
      ok: false,
      msg: `Salah memilah! ${inv.label} adalah sampah ${got}, dimasukkan ke tempat sampah ${expected}!`
    };
  }
  const inv = state.inventory;
  state.inventory = null;

  // Flash the bin
  const binCell = $(`cell-${state.charCell}`);
  if (binCell) {
    binCell.classList.add('highlight');
    setTimeout(() => binCell.classList.remove('highlight'), 800);
  }

  return { ok: true, msg: `✅ ${inv.label} berhasil dibuang ke tempat sampah ${bin.type === 'organic' ? 'Organik' : 'Anorganik'}!` };
}

// =====================================================
// UI HELPERS
// =====================================================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function highlightWorkspaceItem(wsId) {
  clearWorkspaceHighlight();
  const el = $(wsId);
  if (el) el.classList.add('active-exec');
}
function clearWorkspaceHighlight() {
  document.querySelectorAll('.active-exec').forEach(el => el.classList.remove('active-exec'));
}

function shakeGrid() {
  const wrapper = document.querySelector('.grid-wrapper');
  wrapper.style.animation = 'none';
  wrapper.offsetHeight; // reflow
  wrapper.style.animation = 'shakeAnim 0.5s ease';
  setTimeout(() => wrapper.style.animation = '', 600);
}

// Inject shake keyframe
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shakeAnim {
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-8px)}
  40%{transform:translateX(8px)}
  60%{transform:translateX(-6px)}
  80%{transform:translateX(6px)}
}`;
document.head.appendChild(shakeStyle);

function showWin() {
  const stars = computeStars();
  modalEmoji.textContent = '🏆';
  modalTitle.textContent = 'Luar Biasa!';
  modalMessage.textContent = `Kamu berhasil memilah semua sampah dengan benar! (${state.stepCount} langkah)`;
  modalStars.textContent = '⭐'.repeat(stars);

  // Activate star badges
  ['star1','star2','star3'].forEach((id, i) => {
    if (i < stars) $( id).classList.add('active');
  });

  btnModalNext.style.display = state.levelIdx < LEVELS.length - 1 ? 'inline-flex' : 'none';
  modalOverlay.removeAttribute('hidden');
  modalOverlay.querySelector('.modal-box').className = 'modal-box win-box';
}

function showLose(reason) {
  modalEmoji.textContent = '😔';
  modalTitle.textContent = 'Coba Lagi!';
  modalMessage.textContent = reason || 'Programmu belum benar. Susun ulang dan coba lagi!';
  modalStars.textContent = '';
  btnModalNext.style.display = 'none';
  modalOverlay.removeAttribute('hidden');
}

function computeStars() {
  const totalWaste = LEVELS[state.levelIdx].wastes.length;
  const minSteps = totalWaste * 5; // rough estimate
  if (state.stepCount <= minSteps + 2) return 3;
  if (state.stepCount <= minSteps + 6) return 2;
  return 1;
}

function resetLevel() {
  clearWorkspaceHighlight();
  loadLevel(state.levelIdx);
}

// =====================================================
// EVENT LISTENERS
// =====================================================

// Block palette clicks
document.querySelectorAll('.block-item').forEach(block => {
  block.addEventListener('click', () => {
    if (state.running) return;
    addBlockToProgram(block.dataset.type);
  });
  block.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addBlockToProgram(block.dataset.type);
    }
  });
});

// Run / Reset / Clear buttons
btnRun.addEventListener('click', runProgram);
btnReset.addEventListener('click', resetLevel);
btnClear.addEventListener('click', () => {
  if (state.running) return;
  state.program = [];
  renderWorkspace();
  clearLog();
});

// Modal buttons
btnModalRetry.addEventListener('click', () => {
  modalOverlay.setAttribute('hidden', '');
  resetLevel();
});
btnModalNext.addEventListener('click', () => {
  modalOverlay.setAttribute('hidden', '');
  if (state.levelIdx < LEVELS.length - 1) {
    loadLevel(state.levelIdx + 1);
  }
});

// Loop count modal
loopCountMinus.addEventListener('click', () => {
  if (pendingLoopCount > 1) pendingLoopCount--;
  loopCountVal.textContent = pendingLoopCount;
});
loopCountPlus.addEventListener('click', () => {
  if (pendingLoopCount < 10) pendingLoopCount++;
  loopCountVal.textContent = pendingLoopCount;
});
btnLoopCancel.addEventListener('click', () => {
  loopModal.setAttribute('hidden', '');
});
btnLoopConfirm.addEventListener('click', () => {
  loopModal.setAttribute('hidden', '');
  // Open children selector
  renderLoopChildrenSelector();
  lcModal.removeAttribute('hidden');
});

// Loop children modal
btnLcCancel.addEventListener('click', () => {
  lcModal.setAttribute('hidden', '');
  pendingLoopChildren = [];
});
btnLcConfirm.addEventListener('click', () => {
  if (pendingLoopChildren.length === 0) {
    alert('Pilih minimal satu instruksi untuk diulangi!');
    return;
  }
  lcModal.setAttribute('hidden', '');
  state.program.push({
    type: 'loop',
    count: pendingLoopCount,
    children: pendingLoopChildren.map(t => ({ type: t }))
  });
  pendingLoopChildren = [];
  renderWorkspace();
});

function renderLoopChildrenSelector() {
  pendingLoopChildren = [];
  lcBlocks.innerHTML = '';
  const blockTypes = ['move', 'rotate_cw', 'rotate_ccw', 'pickup', 'drop'];
  const clsMap = {
    move: 'block-move', rotate_cw: 'block-rotate-cw', rotate_ccw: 'block-rotate-ccw',
    pickup: 'block-pickup', drop: 'block-drop'
  };
  blockTypes.forEach(type => {
    const meta = BLOCK_META[type];
    const div = document.createElement('div');
    div.className = `lc-block-opt ${clsMap[type]}`;
    div.innerHTML = `<span>${meta.icon}</span><span>${meta.label}</span>`;
    div.addEventListener('click', () => {
      if (pendingLoopChildren.includes(type)) {
        pendingLoopChildren = pendingLoopChildren.filter(t => t !== type);
        div.classList.remove('selected');
      } else {
        pendingLoopChildren.push(type);
        div.classList.add('selected');
      }
    });
    lcBlocks.appendChild(div);
  });
}

// =====================================================
// KEYBOARD SHORTCUTS
// =====================================================
document.addEventListener('keydown', e => {
  if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
    e.preventDefault();
    if (!state.running) runProgram();
  }
  if (e.key === 'r' && !e.ctrlKey && !state.running) resetLevel();
  if (e.key === 'Escape') {
    loopModal.setAttribute('hidden', '');
    lcModal.setAttribute('hidden', '');
    modalOverlay.setAttribute('hidden', '');
  }
});

// =====================================================
// INIT
// =====================================================
loadLevel(0);
