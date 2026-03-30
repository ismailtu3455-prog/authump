type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
  expires_in?: number;
  hd?: string;
  prompt?: string;
  scope?: string;
  state?: string;
  token_type?: string;
};

type GoogleTokenClientError = {
  message?: string;
  type: string;
};

type GoogleTokenClientConfig = {
  callback: (response: GoogleTokenResponse) => void;
  client_id: string;
  error_callback?: (error: GoogleTokenClientError) => void;
  prompt?: "" | "consent" | "none" | "select_account";
  scope: string;
};

type GoogleTokenClient = {
  requestAccessToken: (overrides?: {
    hint?: string;
    include_granted_scopes?: boolean;
    login_hint?: string;
    prompt?: "" | "consent" | "none" | "select_account";
    state?: string;
  }) => void;
};

type GoogleIdentityServices = {
  accounts: {
    oauth2: {
      initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

export {};
