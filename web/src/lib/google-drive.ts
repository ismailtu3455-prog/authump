export const GOOGLE_DRIVE_CLIENT_ID =
  "901662113050-f0echjgtds6pv5h2soer45f0bgohnf4i.apps.googleusercontent.com";

export const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

const GOOGLE_DRIVE_STORAGE_KEY = "google-drive-access-token";

export type GoogleDriveToken = {
  accessToken: string;
  expiresIn: number | null;
  scope: string;
  tokenType: string;
  receivedAt: string;
};

export function getStoredGoogleDriveToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = localStorage.getItem(GOOGLE_DRIVE_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as GoogleDriveToken;
  } catch {
    localStorage.removeItem(GOOGLE_DRIVE_STORAGE_KEY);
    return null;
  }
}

export function saveGoogleDriveToken(token: GoogleDriveToken) {
  localStorage.setItem(GOOGLE_DRIVE_STORAGE_KEY, JSON.stringify(token));
}

export function clearStoredGoogleDriveToken() {
  localStorage.removeItem(GOOGLE_DRIVE_STORAGE_KEY);
}

export function buildGoogleDrivePayload(token: GoogleDriveToken) {
  return JSON.stringify(
    {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.expiresIn,
      scope: token.scope,
      received_at: token.receivedAt,
    },
    null,
    2,
  );
}

export function buildGoogleDriveDeepLink(accessToken: string) {
  return `myapp://auth?token=${encodeURIComponent(accessToken)}`;
}
