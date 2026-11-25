// Dropped binary files (PDF/image/video/...): a blob: URL dies on
// reload, and the workspace restore strips it — so a dropped PDF
// opened in Monaco blank after a refresh, with no source left to
// render. The raw bytes live here, in IndexedDB, keyed by the file
// path; the viewer rehydrates a fresh blob URL from them whenever
// the file opens without one. All failures are swallowed (private
// mode, quota, no IDB): a missing store just means "no persisted
// bytes", never a crash.
//
// Per-user (Fix C, Maalik 2026-11-25): the key is namespaced by the
// signed-in user's scope, so a second account on this browser never
// rehydrates the first user's dropped files. A bare-path entry
// written before scoping is adopted once, on first load, into the
// signed-in user's scope (same trade-off as the localStorage
// adoption in editor-utils: the first account after this ships
// adopts pre-fix bytes; after that, everything is strictly
// per-user).
import { editorStorageScope, scopedStorageKey } from "./editor-utils";

const DB_NAME = "lp-dropped-files";
const STORE_NAME = "files";

function droppedKey(path: string): string {
  return scopedStorageKey(path);
}

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveDroppedFile(path: string, blob: Blob): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(blob, droppedKey(path));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    // Quota / private mode — the in-session blob URL still works.
  } finally {
    db.close();
  }
}

export async function loadDroppedFile(path: string): Promise<Blob | null> {
  const db = await openDb();
  if (!db) return null;
  try {
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(droppedKey(path));
      req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
    if (blob) return blob;
    // Legacy adoption: a bare-path entry from before scoping moves
    // into the signed-in user's scope on first load. Never adopts
    // into the "guest" scope.
    if (editorStorageScope() === "guest") return null;
    const legacy = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(path);
      req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
    if (!legacy) return null;
    await saveDroppedFile(path, legacy);
    await deleteDroppedFileLegacy(path);
    return legacy;
  } catch {
    return null;
  } finally {
    db.close();
  }
}

/** Delete the bare-path (pre-scoping) entry, after adoption. */
async function deleteDroppedFileLegacy(path: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(path);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    // Stale bytes are harmless — nothing reads a deleted path.
  } finally {
    db.close();
  }
}

export async function deleteDroppedFile(path: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(droppedKey(path));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    // Stale bytes are harmless — nothing reads a deleted path.
  } finally {
    db.close();
  }
  // Also drop a pre-scoping bare-path entry, if one was never
  // adopted — otherwise it would be adopted by the next sign-in.
  await deleteDroppedFileLegacy(path);
}
