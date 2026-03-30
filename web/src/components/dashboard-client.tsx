"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";

import { apiRequest } from "@/lib/api";
import { buildApiUrl, formatBytes, formatCurrency, formatDate, pricingCards } from "@/lib/constants";
import type { Plan, Playlist } from "@/lib/types";

import { useAuth } from "./auth-provider";
import { PlanCard } from "./plan-card";

type PlaylistsResponse = {
  playlists: Playlist[];
};

type UploadResponse = {
  playlist: Playlist;
  shareUrl: string;
  uploadPolicy: {
    surchargeCents: number;
    retentionDays: number;
    maxUploadBytes: number;
  };
};

function formatPlanLabel(plan: Plan) {
  switch (plan) {
    case "FREE":
      return "FREE";
    case "PRO":
      return "PRO";
    case "PRO_PLUS":
      return "PRO+";
    default:
      return plan;
  }
}

export function DashboardClient() {
  const { token, user, loading, isAuthenticated, refreshUser, updatePlan } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadPending, setUploadPending] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [surchargeLabel, setSurchargeLabel] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOneTime, setIsOneTime] = useState(true);
  const [retentionDays, setRetentionDays] = useState(1);
  const [extraSizePackGb, setExtraSizePackGb] = useState(0);

  const loadDashboard = async () => {
    if (!token) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    try {
      const response = await apiRequest<PlaylistsResponse>("/api/playlists", { token });

      startTransition(() => {
        setPlaylists(response.playlists);
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setIsOneTime(user.plan === "FREE");
    setRetentionDays(user.plan === "FREE" ? 1 : user.plan === "PRO_PLUS" ? 30 : 30);
    setExtraSizePackGb(0);
  }, [user]);

  useEffect(() => {
    let active = true;

    void (async () => {
      if (!token) {
        if (active) {
          setDataLoading(false);
        }

        return;
      }

      if (active) {
        setDataLoading(true);
      }

      try {
        const response = await apiRequest<PlaylistsResponse>("/api/playlists", { token });

        if (active) {
          startTransition(() => {
            setPlaylists(response.playlists);
          });
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
        }
      } finally {
        if (active) {
          setDataLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshUser, token]);

  const handlePlanChange = async (plan: Plan) => {
    setError(null);

    try {
      await updatePlan(plan);
      await loadDashboard();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Plan update failed.");
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !selectedFile) {
      setError("Choose a ZIP file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("isOneTime", String(isOneTime));
    formData.append("retentionDays", String(retentionDays));
    formData.append("extraSizePackGb", String(extraSizePackGb));

    setUploadPending(true);
    setError(null);
    setShareUrl(null);
    setSurchargeLabel(null);

    try {
      const response = await apiRequest<UploadResponse>("/api/upload", {
        method: "POST",
        body: formData,
        token,
      });

      setShareUrl(response.shareUrl);
      setSurchargeLabel(
        response.uploadPolicy.surchargeCents > 0
          ? `Доплата: ${formatCurrency(response.uploadPolicy.surchargeCents)}`
          : "Без доплаты",
      );
      setSelectedFile(null);
      await loadDashboard();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploadPending(false);
    }
  };

  const activeCount = playlists.filter((playlist) => playlist.status === "ACTIVE").length;
  const totalDownloads = playlists.reduce((sum, playlist) => sum + playlist.downloadCount, 0);

  if (loading) {
    return <div className="container empty-state">Загрузка сессии...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container empty-state">
        <h1>Личный кабинет требует авторизации</h1>
        <p>Войдите или создайте аккаунт, чтобы загружать ZIP архивы и управлять ссылками.</p>
        <div className="button-row">
          <Link className="button button-primary" href="/login">
            Войти
          </Link>
          <Link className="button button-secondary" href="/register">
            Регистрация
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="section">
        <div className="container section-heading">
          <span className="eyebrow">Личный кабинет</span>
          <h1>Управление архивами, тарифом и публичными ссылками</h1>
          <p>JWT-токен используется и для web-клиента, и для внешнего приложения.</p>
        </div>
      </section>

      <section className="section">
        <div className="container stats-grid">
          <article className="metric-card">
            <span>Текущий тариф</span>
            <strong>{formatPlanLabel(user.plan)}</strong>
          </article>
          <article className="metric-card">
            <span>Использовано хранилища</span>
            <strong>
              {formatBytes(user.storageUsedBytes)} / {formatBytes(user.quotaBytes)}
            </strong>
          </article>
          <article className="metric-card">
            <span>Активные ссылки</span>
            <strong>{activeCount}</strong>
          </article>
          <article className="metric-card">
            <span>Скачивания</span>
            <strong>{totalDownloads}</strong>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container dashboard-grid">
          <div className="surface-card">
            <span className="eyebrow">Новая загрузка</span>
            <h2>Загрузить ZIP архив</h2>
            <p>Поддерживаются только ZIP-файлы. Размер и режим ссылки зависят от тарифа.</p>

            <form className="form-stack" onSubmit={handleUpload}>
              <label className="field">
                <span>ZIP архив</span>
                <input
                  accept=".zip"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  required
                  type="file"
                />
              </label>

              <label className="field">
                <span>Тип ссылки</span>
                <select
                  onChange={(event) => setIsOneTime(event.target.value === "true")}
                  value={String(isOneTime)}
                >
                  <option value="true">Одноразовая</option>
                  <option value="false">Многоразовая</option>
                </select>
              </label>

              <label className="field">
                <span>Хранение</span>
                <select
                  onChange={(event) => setRetentionDays(Number(event.target.value))}
                  value={retentionDays}
                >
                  <option value={1}>1 день</option>
                  <option value={7}>7 дней</option>
                  <option value={30}>30 дней</option>
                  {user.plan === "PRO_PLUS" ? <option value={90}>90 дней</option> : null}
                </select>
              </label>

              {user.plan === "FREE" ? (
                <label className="field">
                  <span>Pay-as-you-go: дополнительный размер</span>
                  <select
                    onChange={(event) => setExtraSizePackGb(Number(event.target.value))}
                    value={extraSizePackGb}
                  >
                    <option value={0}>Без доплаты</option>
                    <option value={1}>+1 ГБ</option>
                    <option value={5}>+5 ГБ</option>
                    <option value={10}>+10 ГБ</option>
                  </select>
                </label>
              ) : null}

              {error ? <p className="form-error">{error}</p> : null}
              {shareUrl ? (
                <div className="inline-banner">
                  <strong>Ссылка готова:</strong>
                  <a href={shareUrl}>{shareUrl}</a>
                  <span>{surchargeLabel}</span>
                </div>
              ) : null}

              <button className="button button-primary button-full" disabled={uploadPending} type="submit">
                {uploadPending ? "Загрузка..." : "Отправить ZIP"}
              </button>
            </form>
          </div>

          <div className="surface-card">
            <span className="eyebrow">Учетная запись</span>
            <h2>{user.email}</h2>
            <p>Внешнее приложение должно передавать JWT в заголовке `Authorization: Bearer ...`.</p>
            <div className="api-box">
              <p>Backend API:</p>
              <code>POST {buildApiUrl("/api/upload")}</code>
            </div>
            <p className="muted">
              Максимальный размер по вашему тарифу: {formatBytes(user.uploadLimitBytes)}. Хранение:
              до {user.maxRetentionDays} дней.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Управление тарифом</span>
            <h2>Переключение подписки и обзор pay-as-you-go</h2>
          </div>
          <div className="card-grid four">
            {pricingCards.map((card) => (
              <div key={card.key}>
                <PlanCard
                  ctaHref={card.key === "PAYG" ? undefined : "#"}
                  ctaLabel={
                    card.key === "PAYG"
                      ? undefined
                      : user.plan === card.key
                        ? "Активен"
                        : "Выбрать"
                  }
                  description={card.description}
                  features={card.features}
                  highlight={card.highlight}
                  price={card.price}
                  title={card.title}
                />
                {card.key !== "PAYG" ? (
                  <button
                    className="button button-secondary button-full top-gap"
                    disabled={user.plan === card.key}
                    onClick={() => handlePlanChange(card.key as Plan)}
                    type="button"
                  >
                    {user.plan === card.key ? "Текущий тариф" : "Переключить"}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Файлы</span>
            <h2>Загруженные ZIP архивы</h2>
          </div>

          {dataLoading ? (
            <div className="empty-state">Загрузка архива и статистики...</div>
          ) : playlists.length === 0 ? (
            <div className="empty-state">Пока нет загрузок. Отправьте первый ZIP архив.</div>
          ) : (
            <div className="card-grid two">
              {playlists.map((playlist) => (
                <article className="playlist-card" key={playlist.id}>
                  <div className="playlist-card-head">
                    <div>
                      <h3>{playlist.originalName}</h3>
                      <p>{formatBytes(playlist.sizeBytes)}</p>
                    </div>
                    <span className={`badge ${playlist.status === "ACTIVE" ? "badge-neutral" : "badge-muted"}`}>
                      {playlist.status}
                    </span>
                  </div>
                  <ul className="feature-list">
                    <li>Тип ссылки: {playlist.isOneTime ? "одноразовая" : "многоразовая"}</li>
                    <li>Скачиваний: {playlist.downloadCount}</li>
                    <li>Хранение до: {formatDate(playlist.expiresAt)}</li>
                    <li>Доплата: {formatCurrency(playlist.surchargeCents)}</li>
                  </ul>
                  <div className="button-row">
                    <a className="button button-secondary" href={`/playlist/${playlist.id}`}>
                      Открыть страницу
                    </a>
                    <a className="button button-ghost" href={buildApiUrl(`/api/playlist/${playlist.id}/download`)}>
                      Скачать
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
