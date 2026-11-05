// Authentification organisateur (côté navigateur).
// Le code n'est jamais stocké en clair : seul un hachage salé est conservé.
// Limite : sans serveur, ceci protège l'interface, pas les données du navigateur.

const REC_KEY = 'wuendjo_org_auth';
const SESSION_KEY = 'wuendjo_org_session';
export const MIN_CODE = 4;

const bytesToHex = buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

const randomSalt = () => {
  const a = new Uint8Array(16);
  (globalThis.crypto || window.crypto).getRandomValues(a);
  return bytesToHex(a);
};

// PBKDF2 si disponible (HTTPS / localhost), sinon repli simple.
const derive = async (code, salt) => {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (subtle) {
    const enc = new TextEncoder();
    const key = await subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveBits']);
    const bits = await subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: 120000, hash: 'SHA-256' },
      key,
      256
    );
    return 'pb:' + bytesToHex(bits);
  }
  let h = 2166136261;
  const s = salt + '|' + code;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 'fb:' + (h >>> 0).toString(16);
};

const readRecord = () => {
  try {
    const raw = localStorage.getItem(REC_KEY);
    const rec = raw ? JSON.parse(raw) : null;
    return rec && rec.salt && rec.hash ? rec : null;
  } catch {
    return null;
  }
};

export const hasOrgCode = () => Boolean(readRecord());

export const createOrgCode = async code => {
  const salt = randomSalt();
  const hash = await derive(code, salt);
  localStorage.setItem(REC_KEY, JSON.stringify({ salt, hash }));
};

export const verifyOrgCode = async code => {
  const rec = readRecord();
  if (!rec) return false;
  return (await derive(code, rec.salt)) === rec.hash;
};

export const changeOrgCode = async (oldCode, newCode) => {
  if (!(await verifyOrgCode(oldCode))) return false;
  await createOrgCode(newCode);
  return true;
};

// Session : valable tant que l'onglet est ouvert.
export const hasSession = () => {
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
};
export const openSession = () => { try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {} };
export const closeSession = () => { try { sessionStorage.removeItem(SESSION_KEY); } catch {} };

// Réinitialisation : supprime le code de cet appareil, les voyages sont conservés.
export const resetOrgCode = () => {
  try { localStorage.removeItem(REC_KEY); } catch {}
  closeSession();
};
