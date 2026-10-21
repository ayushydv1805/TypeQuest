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

export async function completeCloudAuthRedirect() {
  if (!isCloudConfigured() || typeof window === "undefined") {
    return getCloudUserProfile();
  }

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return getCloudUserProfile();
  }

  const { url, apiKey } = getConfig();
  const response = await fetch(url + "/auth/v1/user", {
    headers: {
      apikey: apiKey,
      Authorization: "Bearer " + accessToken,
    },
  });
  const user = await parseResponse(response);

  storeSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: Number(params.get("expires_in") || 3600),
    token_type: params.get("token_type") || "bearer",
    user,
  });

  // Avoid leaving access/refresh tokens visible in the address bar after exchange.
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname + window.location.search
  );

  const profile = getCloudUserProfile();
  if (profile) {
    try { await restoreCloudPlayerSave(profile.id); } catch { /* Keep the local copy available offline. */ }
  }
  return profile;
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
  const redirectTo = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : "";
  const data = await authRequest("signup?redirect_to=" + redirectTo, {
    email,
    password,
    data: { display_name: name },
  });

  // GoTrue's REST signup response returns tokens at the root when email confirmation
  // is disabled, while SDK-shaped responses may wrap them in "session".
  const tokenResponse = data.session || data;
  if (!tokenResponse.access_token || !tokenResponse.refresh_token) {
    return {
      profile: null,
      requiresEmailConfirmation: true,
      email: data.user?.email || email,
      confirmationMessage:
        "Account created. Check your email to confirm the address, then sign in here.",
    };
  }

  storeSession({ ...tokenResponse, user: data.user || tokenResponse.user });
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

  // Load cloud progress before the UI opens. Sign-in should still work if sync is temporarily unavailable.
  try {
    await restoreCloudPlayerSave(profile.id);
  } catch {
    // Keep the cached local save available if the database or network is unavailable.
  }
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
  const localKey = PLAYER_KEY + ":" + userId;
  const timestampKey = "typequest-player-local-updated:" + userId;
  const localRaw = window.localStorage.getItem(localKey);
  const localUpdatedAt = Number(window.localStorage.getItem(timestampKey)) || 0;
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
  const row = Array.isArray(rows) ? rows[0] : null;

  if (!row || !row.player_data) {
    // First cloud sign-in on a device with an existing local save: preserve and upload it.
    if (localRaw) {
      try {
        const localPlayer = JSON.parse(localRaw);
        if (localPlayer && typeof localPlayer === "object" && !Array.isArray(localPlayer)) {
          await pushCloudPlayerSave(localPlayer);
          return localPlayer;
        }
      } catch {
        // Ignore a corrupt local save; the normal storage layer will recover with defaults.
      }
    }
    return null;
  }

  const cloudPlayer = row.player_data;
  if (!cloudPlayer || typeof cloudPlayer !== "object" || Array.isArray(cloudPlayer)) return null;
  const cloudUpdatedAt = Date.parse(row.updated_at || "") || 0;

  // Local-first sync: do not discard a save that was made more recently while offline.
  if (localRaw && localUpdatedAt > cloudUpdatedAt) {
    try {
      const localPlayer = JSON.parse(localRaw);
      if (localPlayer && typeof localPlayer === "object" && !Array.isArray(localPlayer)) {
        await pushCloudPlayerSave(localPlayer);
        return localPlayer;
      }
    } catch {
      // Use the valid cloud copy below if local JSON has become corrupt.
    }
  }

  window.localStorage.setItem(localKey, JSON.stringify(cloudPlayer));
  window.localStorage.setItem(timestampKey, String(cloudUpdatedAt || Date.now()));
  return cloudPlayer;
}

async function pushCloudLeaderboardEntry(playerData, session) {
  const { url, apiKey } = getConfig();
  const metadata = session.user.user_metadata || {};
  const email = typeof session.user.email === "string" ? session.user.email : "";
  const displayName =
    typeof metadata.display_name === "string" && metadata.display_name.trim()
      ? metadata.display_name.trim().slice(0, 40)
      : (email.includes("@") ? email.split("@")[0] : "Player").slice(0, 40);

  const response = await fetch(
    url + "/rest/v1/typequest_leaderboard?on_conflict=user_id",
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
        display_name: displayName || "Player",
        best_wpm: Math.min(500, Math.max(0, Math.round(Number(playerData.bestWpm) || 0))),
        level: Math.max(1, Math.round(Number(playerData.level) || 1)),
        tests_completed: Math.max(0, Math.round(Number(playerData.testsCompleted) || 0)),
        updated_at: new Date().toISOString(),
      }),
    }
  );

  await parseResponse(response);
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
    // A leaderboard update is optional: never lose the private progress save if it fails.
    try {
      await pushCloudLeaderboardEntry(playerData, session);
    } catch {
      // This feature will remain unavailable until its RLS-protected table is installed.
    }
    return true;
  } catch {
    // Local progress is saved first; cloud sync can retry on the next save/login.
    return false;
  }
}

export async function deleteCloudPlayerSave() {
  if (syncTimer !== null) window.clearTimeout(syncTimer);
  syncTimer = null;
  pendingPlayerData = null;
  if (!isCloudConfigured() || !getCloudUserId()) return true;

  try {
    const session = await ensureCloudSession();
    if (!session) return false;

    const { url, apiKey } = getConfig();
    const query = new URLSearchParams({ user_id: "eq." + session.user.id });
    for (const table of ["typequest_player_saves", "typequest_leaderboard"]) {
      const response = await fetch(
        url + "/rest/v1/" + table + "?" + query.toString(),
        {
          method: "DELETE",
          headers: {
            apikey: apiKey,
            Authorization: "Bearer " + session.access_token,
            Prefer: "return=minimal",
          },
        }
      );

      if (!response.ok) {
        await parseResponse(response);
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchCloudLeaderboard() {
  if (!isCloudConfigured()) {
    throw new Error("Cloud leaderboard needs Supabase configuration. See .env.example and supabase/migrations.");
  }

  const session = await ensureCloudSession();
  if (!session) throw new Error("Sign in to view the cloud leaderboard.");

  const { url, apiKey } = getConfig();
  const query = new URLSearchParams({
    select: "user_id,display_name,best_wpm,level,tests_completed,updated_at",
    order: "best_wpm.desc,level.desc,tests_completed.desc",
    limit: "50",
  });
  const response = await fetch(url + "/rest/v1/typequest_leaderboard?" + query.toString(), {
    headers: {
      apikey: apiKey,
      Authorization: "Bearer " + session.access_token,
    },
  });
  const rows = await parseResponse(response);

  if (!Array.isArray(rows)) throw new Error("The leaderboard response was not valid.");
  return rows.map((row) => ({
    userId: typeof row.user_id === "string" ? row.user_id : "",
    displayName: typeof row.display_name === "string" ? row.display_name : "Player",
    bestWpm: Math.min(500, Math.max(0, Math.round(Number(row.best_wpm) || 0))),
    level: Math.max(1, Math.round(Number(row.level) || 1)),
    testsCompleted: Math.max(0, Math.round(Number(row.tests_completed) || 0)),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : "",
  }));
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
