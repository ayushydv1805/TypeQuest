const CLOUD_SESSION_KEY = "typequest-cloud-session-v1";
const PLAYER_KEY = "typequest-player";

export function isCloudConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  return Boolean(
    typeof url === "string" &&
    url.trim().startsWith("https://") &&
    typeof key === "string" &&
    key.trim().length > 10
  );
}

function getConfig() {
  if (!isCloudConfigured()) {
    throw new Error(
      "Cloud sign-in is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env.local file."
    );
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL.trim().replace(/\/+$/, ""),
    apiKey: (
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY
    ).trim(),
  };
}

function safeReadSession() {
  try {
    const raw = window.localStorage.getItem(CLOUD_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (
      !session ||
      typeof session.access_token !== "string" ||
      typeof session.refresh_token !== "string" ||
      !session.user ||
      typeof session.user.id !== "string"
    ) {
      window.localStorage.removeItem(CLOUD_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function storeSession(response, previous = null) {
  const expiresIn = Number(response.expires_in || 3600);
  const session = {
    access_token: response.access_token,
    refresh_token: response.refresh_token || previous?.refresh_token,
    expires_at:
      Math.floor(Date.now() / 1000) +
      (Number.isFinite(expiresIn) ? expiresIn : 3600),
    token_type: response.token_type || "bearer",
    user: response.user || previous?.user,
  };

  if (
    typeof session.access_token !== "string" ||
    typeof session.refresh_token !== "string" ||
    !session.user ||
    typeof session.user.id !== "string"
  ) {
    throw new Error("The authentication server returned an incomplete session. Please try again.");
  }

  window.localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(session));
  // Cloud identity takes priority over any older device-local session.
  window.localStorage.removeItem("typequest-active-account-v1");
  return session;
}

async function parseResponse(response) {
  let data = {};
  try {
    data = await response.json();
  } catch {
    // Some successful logout responses have no JSON body.
  }

  if (!response.ok) {
    const message =
      data.msg ||
      data.message ||
      data.error_description ||
      data.error ||
      (response.status === 429
        ? "Too many sign-in attempts. Please wait and try again."
        : "The authentication request failed. Please try again.");
    throw new Error(message);
  }

  return data;
}

async function authRequest(path, body, token = null) {
  const { url, apiKey } = getConfig();
  const headers = {
    apikey: apiKey,
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = "Bearer " + token;

  const response = await fetch(url + "/auth/v1/" + path, {
    method: "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseResponse(response);
}

export function getCloudSession() {
  return safeReadSession();
}

export function getCloudUserId() {
  return safeReadSession()?.user?.id || null;
}

export function getCloudUserProfile() {
  const user = safeReadSession()?.user;
  if (!user) return null;

  const metadata = user.user_metadata || {};
  const email = typeof user.email === "string" ? user.email : "";
  const fallbackName = email.includes("@") ? email.split("@")[0] : "Player";

  return {
    id: user.id,
    name:
      typeof metadata.display_name === "string" && metadata.display_name.trim()
        ? metadata.display_name.trim()
        : typeof metadata.name === "string" && metadata.name.trim()
          ? metadata.name.trim()
          : fallbackName,
    email,
    createdAt: user.created_at || "",
    authMode: "cloud",
  };
}

export async function signUpCloud({ name, email, password }) {
  const { url } = getConfig();
  const data = await authRequest("signup", {
    email,
    password,
    data: { display_name: name },
    gotrue_meta_security: { captcha_token: null },
  });

  if (!data.session?.access_token || !data.session?.refresh_token) {
    return {
      profile: null,
      requiresEmailConfirmation: true,
      email: data.user?.email || email,
      confirmationMessage:
        "Account created. Check your email to confirm the address, then sign in here.",
    };
  }

  storeSession({ ...data.session, user: data.user || data.session.user });
  return {
    profile: getCloudUserProfile(),
    requiresEmailConfirmation: false,
    email: data.user?.email || email,
  };
}

async function refreshCloudSession(session) {
  const data = await authRequest(
    "token?grant_type=refresh_token",
    { refresh_token: session.refresh_token }
  );

  return storeSession(data, session);
}

export async function ensureCloudSession() {
  let session = safeReadSession();
  if (!session) return null;

  const expiresAt = Number(session.expires_at || 0);
  if (expiresAt > Math.floor(Date.now() / 1000) + 60) return session;

  try {
    session = await refreshCloudSession(session);
    return session;
  } catch (error) {
    // Keep the cached local save available when the user is temporarily offline.
    throw error instanceof Error
      ? error
      : new Error("Could not refresh your cloud session. Connect to the internet and sign in again.");
  }
}

export async function signInCloud({ email, password }) {
  const data = await authRequest("token?grant_type=password", {
    email,
    password,
  });

  storeSession(data);
  const profile = getCloudUserProfile();

  // Load a cloud save before the UI opens, so a fresh local cache cannot overwrite it.
  await restoreCloudPlayerSave(profile.id);
  return profile;
}

export async function signOutCloud() {
  const session = safeReadSession();
  try {
    window.localStorage.removeItem(CLOUD_SESSION_KEY);
  } catch {
    // A browser may block storage; continue with best-effort sign-out.
  }

  if (!session || !isCloudConfigured()) return;

  try {
    const { url, apiKey } = getConfig();
    await fetch(url + "/auth/v1/logout", {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: "Bearer " + session.access_token,
      },
    });
  } catch {
    // Local sign-out should still complete if the device is offline.
  }
}

export async function restoreCloudPlayerSave(userId) {
  if (!isCloudConfigured()) return null;

  const session = await ensureCloudSession();
  if (!session || session.user.id !== userId) return null;

  const { url, apiKey } = getConfig();
  const query = new URLSearchParams({
    select: "player_data,updated_at",
    user_id: "eq." + userId,
    limit: "1",
  });

  const response = await fetch(
    url + "/rest/v1/typequest_player_saves?" + query.toString(),
    {
      headers: {
        apikey: apiKey,
        Authorization: "Bearer " + session.access_token,
      },
    }
  );
  const rows = await parseResponse(response);
  if (!Array.isArray(rows) || !rows[0] || !rows[0].player_data) return null;

  const player = rows[0].player_data;
  if (!player || typeof player !== "object" || Array.isArray(player)) return null;

  window.localStorage.setItem(PLAYER_KEY + ":" + userId, JSON.stringify(player));
  return player;
}

export async function pushCloudPlayerSave(playerData) {
  if (!isCloudConfigured()) return false;

  try {
    const session = await ensureCloudSession();
    if (!session) return false;

    const { url, apiKey } = getConfig();
    const response = await fetch(
      url + "/rest/v1/typequest_player_saves?on_conflict=user_id",
      {
        method: "POST",
        headers: {
          apikey: apiKey,
          Authorization: "Bearer " + session.access_token,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          user_id: session.user.id,
          player_data: playerData,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    await parseResponse(response);
    return true;
  } catch {
    // Local progress is saved first; cloud sync can retry on the next save/login.
    return false;
  }
}

let syncTimer = null;
let pendingPlayerData = null;

export function queueCloudPlayerSave(playerData) {
  if (!isCloudConfigured() || !getCloudUserId()) return;

  pendingPlayerData = playerData;
  if (syncTimer !== null) window.clearTimeout(syncTimer);

  syncTimer = window.setTimeout(async () => {
    const data = pendingPlayerData;
    pendingPlayerData = null;
    syncTimer = null;
    if (data) await pushCloudPlayerSave(data);
  }, 500);
}
