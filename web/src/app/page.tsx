import { GoogleDriveConnectPanel } from "@/components/google-drive-connect-panel";

export default function Home() {
  return (
    <div className="page-stack">
      <section className="section hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Google Identity Services</span>
            <h1>Подключение Google Drive с автоматической передачей access_token в приложение.</h1>
            <p className="lead">
              Сайт получает access_token через Google OAuth token client и сразу пытается открыть
              приложение по deep link <code>myapp://auth</code>. Ручной ввод токена не нужен.
            </p>

            <div className="mini-stats">
              <div className="mini-stat">
                <strong>1 кнопка</strong>
                <span>Подключение запускается без callback-сервера</span>
              </div>
              <div className="mini-stat">
                <strong>drive.file</strong>
                <span>Запрашивается доступ только к Google Drive</span>
              </div>
              <div className="mini-stat">
                <strong>Deep Link</strong>
                <span>Токен передается напрямую в myapp://auth</span>
              </div>
            </div>
          </div>

          <GoogleDriveConnectPanel />
        </div>
      </section>

      <section className="section">
        <div className="container card-grid three">
          <article className="feature-card">
            <span className="feature-index">01</span>
            <h3>Нажмите кнопку</h3>
            <p>Пользователь запускает Google OAuth через встроенный client_id и popup от GIS.</p>
          </article>
          <article className="feature-card">
            <span className="feature-index">02</span>
            <h3>Разрешите доступ</h3>
            <p>Google выдает access_token со scope <code>https://www.googleapis.com/auth/drive.file</code>.</p>
          </article>
          <article className="feature-card">
            <span className="feature-index">03</span>
            <h3>Откройте приложение</h3>
            <p>Сайт передает токен через deep link, а если это не удалось, показывает fallback-копирование.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
