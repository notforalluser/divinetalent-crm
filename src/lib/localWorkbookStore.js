// Tiny IndexedDB wrapper used to persist an uploaded workbook in the
// browser, so "upload a new crm-data.xlsx" can replace the bundled demo
// data without needing a backend. This does NOT overwrite the file on
// disk (a static frontend can't do that) -- it stores the file's bytes in
// the browser and the app prefers it over /data/crm-data.xlsx whenever
// present.
const DB_NAME = "crm-local-store";
const STORE_NAME = "files";
const KEY = "uploaded-workbook";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveUploadedWorkbook(file) {
  const buffer = await file.arrayBuffer();
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ name: file.name, buffer, uploadedAt: new Date().toISOString() }, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getUploadedWorkbook() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearUploadedWorkbook() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
