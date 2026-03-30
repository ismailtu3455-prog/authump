"use client";

import { useEffect, useRef, useState } from "react";

import {
  buildGoogleDriveDeepLink,
  buildGoogleDrivePayload,
  clearStoredGoogleDriveToken,
  getStoredGoogleDriveToken,
  GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_SCOPE,
  saveGoogleDriveToken,
  type GoogleDriveToken,
} from "@/lib/google-drive";

type ConnectStatus = "idle" | "loading" | "success" | "fallback" | "error";

function isGoogleSdkReady() {
  return typeof window !== "undefined" && Boolean(window.google?.accounts?.oauth2);
}

function resolveOAuthError(code: string) {
  if (code === "access_denied" || code === "popup_closed") {
    return "Авторизация отменена пользователем.";
  }

  if (code === "popup_failed_to_open") {
    return "Браузер заблокировал окно авторизации. Разрешите pop-up и попробуйте снова.";
  }

  return "Не удалось получить access_token от Google.";
}

export function GoogleDriveConnectPanel() {
  const [sdkReady, setSdkReady] = useState(() => isGoogleSdkReady());
  const [token, setToken] = useState<GoogleDriveToken | null>(() => getStoredGoogleDriveToken());
  const [status, setStatus] = useState<ConnectStatus>("idle");
  const [message, setMessage] = useState(
    "Нажмите кнопку, подтвердите доступ к Google Drive и сайт автоматически передаст access_token в приложение.",
  );
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const fallbackTimerRef = useRef<number | null>(null);
  const disconnectRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (sdkReady || typeof window === "undefined") {
      return;
    }

    const timer = window.setInterval(() => {
      if (!isGoogleSdkReady()) {
        return;
      }

      window.clearInterval(timer);
      setSdkReady(true);
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, [sdkReady]);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
      }

      disconnectRef.current?.();
    };
  }, []);

  const clearDeepLinkWatch = () => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    disconnectRef.current?.();
    disconnectRef.current = null;
  };

  const startDeepLinkFlow = (accessToken: string) => {
    clearDeepLinkWatch();

    const handleHidden = () => {
      if (document.visibilityState !== "hidden") {
        return;
      }

      clearDeepLinkWatch();
      setStatus("success");
      setMessage("Google Drive подключен. Токен передан в приложение.");
    };

    document.addEventListener("visibilitychange", handleHidden);
    window.addEventListener("pagehide", handleHidden);

    disconnectRef.current = () => {
      document.removeEventListener("visibilitychange", handleHidden);
      window.removeEventListener("pagehide", handleHidden);
    };

    fallbackTimerRef.current = window.setTimeout(() => {
      clearDeepLinkWatch();
      setStatus("fallback");
      setMessage(
        "Не удалось открыть приложение автоматически. Скопируйте токен и передайте его резервным способом.",
      );
    }, 1600);

    window.location.assign(buildGoogleDriveDeepLink(accessToken));
  };

  const handleConnect = () => {
    if (!isGoogleSdkReady()) {
      setStatus("error");
      setMessage("Google Identity Services еще не загрузился. Обновите страницу и повторите попытку.");
      return;
    }

    clearDeepLinkWatch();
    setStatus("loading");
    setMessage("Открываю Google OAuth и запрашиваю access_token для Google Drive.");

    const client = window.google?.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_DRIVE_CLIENT_ID,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          setStatus("error");
          setMessage(resolveOAuthError(response.error ?? "token_missing"));
          return;
        }

        const nextToken: GoogleDriveToken = {
          accessToken: response.access_token,
          expiresIn: response.expires_in ?? null,
          scope: response.scope ?? GOOGLE_DRIVE_SCOPE,
          tokenType: response.token_type ?? "Bearer",
          receivedAt: new Date().toISOString(),
        };

        saveGoogleDriveToken(nextToken);
        setToken(nextToken);
        setStatus("success");
        setMessage("Google Drive подключен. Передаю токен в приложение.");
        startDeepLinkFlow(nextToken.accessToken);
      },
      error_callback: (error) => {
        setStatus("error");
        setMessage(resolveOAuthError(error.type));
      },
    });

    client?.requestAccessToken({ prompt: "consent" });
  };

  const handleCopy = async () => {
    if (!token) {
      return;
    }

    try {
      await navigator.clipboard.writeText(token.accessToken);
      setCopyState("done");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setStatus("error");
      setMessage("Не удалось скопировать токен в буфер обмена.");
    }
  };

  const handleRetryOpenApp = () => {
    if (!token) {
      return;
    }

    setStatus("success");
    setMessage("Повторно пытаюсь открыть приложение и передать access_token.");
    startDeepLinkFlow(token.accessToken);
  };

  const handleClear = () => {
    clearDeepLinkWatch();
    clearStoredGoogleDriveToken();
    setToken(null);
    setStatus("idle");
    setMessage(
      "Нажмите кнопку, подтвердите доступ к Google Drive и сайт автоматически передаст access_token в приложение.",
    );
    setCopyState("idle");
  };

  return (
    <div className="surface-card oauth-panel">
      <span className="eyebrow">Google OAuth 2.0</span>
      <h2>Подключить Google Drive</h2>
      <p className="lead">
        Сайт использует Google Identity Services token client, получает только access_token и сразу
        передает его в приложение через deep link <code>myapp://auth</code>.
      </p>

      <div className="oauth-status">
        <span className={`badge ${token ? "badge-neutral" : "badge-muted"}`}>
          {token ? "Google Drive подключен" : "Google Drive не подключен"}
        </span>
        <span className="muted">
          Scope: <code>drive.file</code> · Client ID встроен в UI
        </span>
      </div>

      <div className={`inline-banner ${status === "error" ? "inline-banner-error" : ""}`}>
        <strong>
          {status === "loading"
            ? "Запрашиваю доступ"
            : status === "fallback"
              ? "Приложение не открылось"
              : status === "error"
                ? "Ошибка авторизации"
                : "Статус подключения"}
        </strong>
        <span>{message}</span>
      </div>

      <div className="button-row">
        <button
          className="button button-primary"
          disabled={!sdkReady || status === "loading"}
          onClick={handleConnect}
          type="button"
        >
          {!sdkReady
            ? "Загрузка Google SDK..."
            : status === "loading"
              ? "Ожидание ответа Google..."
              : token
                ? "Подключить заново"
                : "Подключить Google Drive"}
        </button>
        {token ? (
          <button className="button button-secondary" onClick={handleRetryOpenApp} type="button">
            Открыть приложение
          </button>
        ) : null}
        {token ? (
          <button className="button button-ghost" onClick={handleCopy} type="button">
            {copyState === "done" ? "Токен скопирован" : "Скопировать токен"}
          </button>
        ) : null}
        {token ? (
          <button className="button button-secondary" onClick={handleClear} type="button">
            Очистить токен
          </button>
        ) : null}
      </div>

      {token ? (
        <>
          <div className="token-meta">
            <span>Тип токена: {token.tokenType}</span>
            <span>Получен: {new Date(token.receivedAt).toLocaleString("ru-RU")}</span>
            <span>
              Срок действия: {token.expiresIn ? `${token.expiresIn} сек.` : "не указан Google"}
            </span>
          </div>

          <div className="token-preview">
            <div className="token-preview-head">
              <strong>Payload для приложения</strong>
              <span className="muted">Резервный вариант, если deep link не открыл приложение</span>
            </div>
            <pre>{buildGoogleDrivePayload(token)}</pre>
          </div>
        </>
      ) : (
        <ul className="feature-list">
          <li>Используется только client_id, без client_secret и без хранения токена на сервере.</li>
          <li>После разрешения Google сайт получает access_token со scope <code>drive.file</code>.</li>
          <li>Если deep link не сработает, токен останется локально в браузере и его можно скопировать.</li>
        </ul>
      )}
    </div>
  );
}
