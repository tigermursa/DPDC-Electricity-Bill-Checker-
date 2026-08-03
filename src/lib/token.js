// lib/token.js

const TOKEN_GENERATE_URL =
  "https://amiapp.dpdc.org.bd/auth/login/generate-bearer";
const REFRESH_URL =
  "https://amiapp.dpdc.org.bd/auth/realms/adss/protocol/openid-connect/token";

const CLIENT_ID = process.env.DPDC_CLIENT_ID || "auth-ui";
const CLIENT_SECRET = process.env.DPDC_CLIENT_SECRET;
const TENANT_CODE = process.env.DPDC_TENANT_CODE || "DPDC";

let cachedToken = null;
let tokenExpiryTime = 0;

async function generateNewToken() {
  if (!CLIENT_SECRET) throw new Error("DPDC_CLIENT_SECRET not set");

  const res = await fetch(TOKEN_GENERATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      tenantCode: TENANT_CODE,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Generate token failed: ${res.status} - ${text}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error("No access_token in response");

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in || 900,
    refresh_expires_in: data.refresh_expires_in || 2592000,
    token_type: data.token_type || "Bearer",
  };
}

async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(REFRESH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Refresh failed: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_in: data.expires_in || 900,
    refresh_expires_in: data.refresh_expires_in || 2592000,
    token_type: data.token_type || "Bearer",
  };
}

function isTokenExpired() {
  if (!cachedToken) return true;
  return Date.now() >= tokenExpiryTime - 45000;
}

export async function getValidAccessToken() {
  if (cachedToken && !isTokenExpired()) {
    return cachedToken.access_token;
  }

  try {
    const newToken = await generateNewToken();
    cachedToken = newToken;
    tokenExpiryTime = Date.now() + newToken.expires_in * 1000;
    console.log("✅ New token generated at", new Date().toLocaleTimeString());
    return newToken.access_token;
  } catch (err) {
    console.warn("⚠️ Generate failed, trying refresh...", err.message);
    if (cachedToken?.refresh_token) {
      try {
        const refreshed = await refreshAccessToken(cachedToken.refresh_token);
        cachedToken = refreshed;
        tokenExpiryTime = Date.now() + refreshed.expires_in * 1000;
        console.log("✅ Token refreshed at", new Date().toLocaleTimeString());
        return refreshed.access_token;
      } catch (refreshErr) {
        console.error("❌ Refresh also failed:", refreshErr.message);
        cachedToken = null;
        tokenExpiryTime = 0;
        throw new Error(`Token refresh failed: ${refreshErr.message}`);
      }
    }
    throw new Error(`Unable to get token: ${err.message}`);
  }
}
