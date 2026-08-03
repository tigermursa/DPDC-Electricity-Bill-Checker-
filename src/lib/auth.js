// lib/auth.js

const TOKEN_KEY = "authbearer";
const REFRESH_URL =
  "https://amiapp.dpdc.org.bd/auth/realms/adss/protocol/openid-connect/token";
const CLIENT_ID = "auth-ui";
const CLIENT_SECRET = "0yFsAl4nN9jX1GGkgOrvpUxDarf2DT40";

/**
 * লোকাল স্টোরেজ থেকে authbearer অবজেক্ট লোড
 */
export function loadAuthData() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * লোকাল স্টোরেজে authbearer অবজেক্ট সেভ
 */
export function setAuthData(authData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(authData));
}

/**
 * লোকাল স্টোরেজ থেকে টোকেন রিমুভ
 */
export function clearAuthData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * টোকেন এক্সপায়ার চেক (JWT ডিকোড করে)
 */
function isTokenExpired(authData) {
  if (!authData?.access_token) return true;
  try {
    const payload = JSON.parse(atob(authData.access_token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp - 60000; // ১ মিনিট আগেই রিফ্রেশ
  } catch {
    return true;
  }
}

/**
 * রিফ্রেশ টোকেন দিয়ে নতুন অ্যাক্সেস টোকেন আনে
 */
export async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(REFRESH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Refresh failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const newAuth = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_in: data.expires_in,
    refresh_expires_in: data.refresh_expires_in,
    token_type: data.token_type || "Bearer",
    scope: data.scope || "",
    session_state: data.session_state || "",
  };
  return newAuth;
}

/**
 * বৈধ অ্যাক্সেস টোকেন রিটার্ন করে (প্রয়োজনে রিফ্রেশ করে)
 */
export async function getValidAccessToken() {
  let authData = loadAuthData();
  if (!authData) {
    throw new Error("No auth data found. Please set token first.");
  }

  // যদি টোকেন বৈধ হয়
  if (!isTokenExpired(authData)) {
    return authData.access_token;
  }

  // টোকেন এক্সপায়ার্ড – রিফ্রেশ করি
  if (!authData.refresh_token) {
    throw new Error("Refresh token missing. Please re-authenticate.");
  }

  try {
    const newAuth = await refreshAccessToken(authData.refresh_token);
    setAuthData(newAuth);
    return newAuth.access_token;
  } catch (error) {
    clearAuthData();
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}
