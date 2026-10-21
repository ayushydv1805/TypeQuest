const ACCOUNTS_KEY = "typequest-local-accounts-v1";
const SESSION_KEY = "typequest-active-account-v1";
const PASSWORD_ITERATIONS = 120000;

function getStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readAccounts(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(ACCOUNTS_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter(
          (account) =>
            account &&
            typeof account.id === "string" &&
            typeof account.email === "string" &&
            typeof account.name === "string" &&
            typeof account.salt === "string" &&
            typeof account.passwordHash === "string"
        )
      : [];
  } catch {
    return [];
  }
}

function requireStorage() {
  const storage = getStorage();
  if (!storage) {
    throw new Error("Local storage is unavailable. Open TypeQuest in a browser that allows site data.");
  }
  return storage;
}

function toBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function derivePasswordHash(password, salt) {
  const cryptoApi = typeof window !== "undefined" ? window.crypto : null;
  if (!cryptoApi || !cryptoApi.subtle || !cryptoApi.getRandomValues) {
    throw new Error("Secure sign-in is unavailable here. Open TypeQuest using its HTTPS address or localhost.");
  }

  const key = await cryptoApi.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await cryptoApi.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PASSWORD_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256
  );

  return new Uint8Array(bits);
}

function profilesEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index];
  }
  return mismatch === 0;
}

function publicProfile(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
  };
}

function activateAccount(storage, accountId) {
  try {
    storage.setItem(SESSION_KEY, accountId);
  } catch {
    throw new Error("Your profile was found, but this device could not save the sign-in session.");
  }
}

export function getActiveUserId() {
  try {
    const storage = getStorage();
    if (!storage) return null;

    const accountId = storage.getItem(SESSION_KEY);
    if (!accountId) return null;

    const exists = readAccounts(storage).some((account) => account.id === accountId);
    if (!exists) {
      storage.removeItem(SESSION_KEY);
      return null;
    }

    return accountId;
  } catch {
    return null;
  }
}

export function getActiveUser() {
  const accountId = getActiveUserId();
  if (!accountId) return null;

  const storage = getStorage();
  if (!storage) return null;

  const account = readAccounts(storage).find((item) => item.id === accountId);
  return account ? publicProfile(account) : null;
}

export async function createLocalAccount({ name, email, password }) {
  const cleanName = String(name || "").trim().replace(/\s+/g, " ");
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");

  if (cleanName.length < 2 || cleanName.length > 40) {
    throw new Error("Enter a name between 2 and 40 characters.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Enter a valid email address.");
  }
  if (cleanPassword.length < 8 || cleanPassword.length > 128) {
    throw new Error("Use a password between 8 and 128 characters.");
  }

  const storage = requireStorage();
  const accounts = readAccounts(storage);

  if (accounts.some((account) => account.email === cleanEmail)) {
    throw new Error("A local profile with this email already exists. Sign in instead.");
  }

  const cryptoApi = typeof window !== "undefined" ? window.crypto : null;
  if (!cryptoApi || !cryptoApi.getRandomValues || !cryptoApi.subtle) {
    throw new Error("Secure sign-in is unavailable here. Open TypeQuest using its HTTPS address or localhost.");
  }

  const salt = new Uint8Array(16);
  cryptoApi.getRandomValues(salt);
  const passwordHash = await derivePasswordHash(cleanPassword, salt);
  const accountId =
    typeof cryptoApi.randomUUID === "function"
      ? cryptoApi.randomUUID()
      : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);

  const account = {
    id: accountId,
    name: cleanName,
    email: cleanEmail,
    salt: toBase64(salt),
    passwordHash: toBase64(passwordHash),
    createdAt: new Date().toISOString(),
  };

  try {
    storage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  } catch {
    throw new Error("TypeQuest could not save this profile. Check available device storage and try again.");
  }

  activateAccount(storage, accountId);
  return publicProfile(account);
}

export async function signInLocalAccount({ email, password }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");
  const storage = requireStorage();
  const account = readAccounts(storage).find((item) => item.email === cleanEmail);

  if (!account) {
    throw new Error("No matching local profile was found. Create a profile on this device first.");
  }

  const providedHash = await derivePasswordHash(cleanPassword, fromBase64(account.salt));
  if (!profilesEqual(providedHash, fromBase64(account.passwordHash))) {
    throw new Error("Incorrect email or password.");
  }

  activateAccount(storage, account.id);
  return publicProfile(account);
}

export function signOutLocalUser() {
  try {
    const storage = getStorage();
    if (storage) storage.removeItem(SESSION_KEY);
  } catch {
    // Keep the app usable if browser storage has been disabled.
  }
}
