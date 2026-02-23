// ===================================
// Firebase Configuration
// ===================================

const firebaseConfig = {
    apiKey: "AIzaSyCbwSjTha4gvyxyR3fyIYRKCeKqyEN2oAQ",
    authDomain: "arquraapp.firebaseapp.com",
    databaseURL: "https://arquraapp-default-rtdb.firebaseio.com",
    projectId: "arquraapp",
    storageBucket: "arquraapp.appspot.com",
    messagingSenderId: "1058033151096",
    appId: "1:1058033151096:web:f88fe482b99e650b67d18d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.database();
export const storage = firebase.storage();

// Database reference
export const DB_REF = 'arqura_v3';

// Cache variables for real-time sync
export let cachedOrders = [];
export let cachedProducts = [];
export let cachedAbout = null;
export let cachedSettings = null;

/**
 * Initialize Firebase listeners for real-time data sync
 * @param {Function} handleRouting - Routing handler to call on data updates
 */
export function initializeFirebaseListeners(handleRouting) {
    // Orders listener
    db.ref(`${DB_REF}/orders`).on('value', snap => {
        cachedOrders = snap.val() || [];
        if (location.hash === '#/admin/orders' || location.hash === '#/admin') {
            handleRouting();
        }
    });

    // Products listener
    db.ref(`${DB_REF}/products`).on('value', snap => {
        cachedProducts = snap.val() || [];
        if (['#/products', '#/admin/products', '#/quotation'].includes(location.hash)) {
            handleRouting();
        }
    });

    // About listener
    db.ref(`${DB_REF}/about`).on('value', snap => {
        cachedAbout = snap.val();
        if (location.hash === '#/about' || location.hash === '#/admin/content') {
            handleRouting();
        }
    });

    // Settings listener
    db.ref(`${DB_REF}/settings`).on('value', snap => {
        cachedSettings = snap.val();
        if (location.hash === '#/admin') {
            handleRouting();
        }
    });
}

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 */
export async function uploadImageToFirebase(file, path) {
    const ref = storage.ref(`arqura_v3/${path}/${Date.now()}_${file.name}`);
    const snap = await ref.put(file);
    return await snap.ref.getDownloadURL();
}
