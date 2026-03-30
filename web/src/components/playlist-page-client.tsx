"use client";

import { useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";
import { buildApiUrl, formatBytes, formatCurrency, formatDate } from "@/lib/constants";
import type { Playlist } from "@/lib/types";

type PlaylistResponse = {
  playlist: Playlist;
};

export function PlaylistPageClient({ id }: { id: string }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiRequest<PlaylistResponse>(`/api/playlist/${id}`);

        if (active) {
          setPlaylist(response.playlist);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Failed to load playlist.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="container empty-state">Загрузка данных ссылки...</div>;
  }

  if (error || !playlist) {
    return (
      <div className="container empty-state">
        <h1>Ссылка недоступна</h1>
        <p>{error ?? "Playlist was not found."}</p>
      </div>
    );
  }

  const isAvailable = playlist.status === "ACTIVE";

  return (
    <div className="page-stack">
      <section className="section">
        <div className="container public-card-wrap">
          <div className="public-card">
            <span className={`badge ${isAvailable ? "badge-accent" : "badge-muted"}`}>
              {playlist.isOneTime ? "Одноразовая ссылка" : "Многоразовая ссылка"}
            </span>
            <h1>{playlist.originalName}</h1>
            <p className="lead">
              Публичная страница архива. Здесь отображаются лимиты, срок хранения и кнопка скачивания.
            </p>
            <div className="public-metrics">
              <div>
                <span>Размер</span>
                <strong>{formatBytes(playlist.sizeBytes)}</strong>
              </div>
              <div>
                <span>Статус</span>
                <strong>{playlist.status}</strong>
              </div>
              <div>
                <span>Скачиваний</span>
                <strong>{playlist.downloadCount}</strong>
              </div>
              <div>
                <span>Истекает</span>
                <strong>{formatDate(playlist.expiresAt)}</strong>
              </div>
            </div>
            <p className="muted">Стоимость add-ons для этой публикации: {formatCurrency(playlist.surchargeCents)}.</p>
            <a
              aria-disabled={!isAvailable}
              className={`button ${isAvailable ? "button-primary" : "button-disabled"}`}
              href={isAvailable ? buildApiUrl(`/api/playlist/${playlist.id}/download`) : undefined}
            >
              {isAvailable ? "Скачать ZIP" : "Ссылка недоступна"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
