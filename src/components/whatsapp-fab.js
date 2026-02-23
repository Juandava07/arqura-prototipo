// ===================================
// WhatsApp FAB Component
// ===================================

const WHATSAPP_PHONE = '573123112366';

/**
 * Generate WhatsApp link with message
 * @param {string} message - Message to send
 * @returns {string} WhatsApp URL
 */
export function getWhatsAppLink(message) {
    const encoded = encodeURIComponent(message || 'Hola, me gustaría obtener más información.');
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
}

/**
 * Render WhatsApp floating action button
 * @param {string} message - Optional custom message
 */
export function renderWhatsAppFab(message) {
    const existing = document.querySelector('.whatsapp-fab');
    if (existing) existing.remove();

    const fab = document.createElement('a');
    fab.className = 'whatsapp-fab';
    fab.href = getWhatsAppLink(message);
    fab.target = '_blank';
    fab.rel = 'noopener noreferrer';
    fab.innerHTML = `
    <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
      <path d="M16 0C7.164 0 0 7.164 0 16c0 2.828.736 5.484 2.024 7.78L0 32l8.388-2.024A15.923 15.923 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm8.004 22.664c-.344.968-1.712 1.776-2.796 2.012-.744.156-1.716.28-4.988-.968-4.184-1.6-6.884-5.856-7.092-6.124-.204-.268-1.676-2.228-1.676-4.252s1.06-3.016 1.436-3.428c.376-.412.82-.516 1.096-.516.276 0 .552.004.792.016.256.012.6-.096.94.716.344.824 1.172 2.856 1.276 3.064.104.208.172.452.036.72-.136.268-.204.436-.408.672-.204.236-.428.528-.612.708-.204.2-.416.416-.18.816.236.4 1.052 1.736 2.26 2.812 1.556 1.388 2.868 1.82 3.276 2.024.408.204.648.172.884-.104.236-.276.996-1.164 1.264-1.564.268-.4.536-.336.904-.2.368.136 2.336 1.1 2.736 1.3.4.2.668.3.764.464.096.164.096.952-.248 1.92z"/>
    </svg>
  `;
    document.body.appendChild(fab);
}

/**
 * Hide WhatsApp FAB
 */
export function hideWhatsAppFab() {
    const fab = document.querySelector('.whatsapp-fab');
    if (fab) fab.remove();
}
