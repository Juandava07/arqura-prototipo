// ===================================
// DOM Utilities
// ===================================

export const $ = s => document.querySelector(s);

export const toast = msg => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1700);
};

export const go = h => { location.hash = h; };

export const percent = v => Math.max(0, Math.min(1, Number(v || 0)));
