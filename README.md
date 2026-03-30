# DriveLink OAuth

Минимальный веб-сайт для подключения Google Drive к приложению через OAuth 2.0.

## Что делает сайт

- показывает кнопку `Подключить Google Drive`
- отправляет пользователя на Google OAuth consent screen
- принимает callback на `/callback`
- обменивает `authorization code` на `access_token` и `refresh_token`
- получает email Google-аккаунта
- сохраняет результат в `localStorage`
- показывает готовый JSON для копирования в приложение

## Структура

```text
C:\UMPsite
  backend\
  web\
```

## Важно про scope

Для доступа к Google Drive используется основной scope:

- `https://www.googleapis.com/auth/drive.file`

Дополнительно сайт запрашивает `openid email`, потому что без этого Google не отдаст email пользователя для отображения в UI.

## Настройка Google Cloud

1. Создайте OAuth 2.0 Client ID типа `Web application`.
2. В `Authorized redirect URIs` добавьте:
   - `http://localhost:3000/callback`
3. Включите Google Drive API в проекте.

## Backend env

Смотрите [backend/.env.example](/C:/UMPsite/backend/.env.example).

Нужно заполнить:

- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/callback`

## Web env

Смотрите [web/.env.local.example](/C:/UMPsite/web/.env.local.example).

Достаточно:

- `NEXT_PUBLIC_API_URL=http://localhost:4000`

## Запуск

### Backend

```powershell
cd C:\UMPsite\backend
Copy-Item .env.example .env -Force
npm install
npx prisma generate
npm run dev
```

### Web

```powershell
cd C:\UMPsite\web
Copy-Item .env.local.example .env.local -Force
npm install
npm run dev
```

## Как проверить

1. Откройте [http://localhost:3000](http://localhost:3000)
2. Нажмите `Подключить Google Drive`
3. Авторизуйтесь через Google
4. После возврата на `/callback` сайт покажет:
   - `Google Drive подключен`
   - email аккаунта
   - JSON с `access_token` и `refresh_token`
5. Нажмите `Скопировать токен` и вставьте JSON в ваше приложение

## API

Backend добавляет два публичных endpoint:

- `GET /api/google-drive/authorize-url`
- `POST /api/google-drive/exchange`

## Проверка сборки

```powershell
npm --prefix backend run build
npm --prefix web run lint
npm --prefix web run build
```
# authump
