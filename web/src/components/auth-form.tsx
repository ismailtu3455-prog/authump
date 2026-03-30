"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./auth-provider";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }

      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authorization failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <span className="eyebrow">{isLogin ? "Логин" : "Регистрация"}</span>
        <h1>{isLogin ? "Вход в кабинет" : "Создание аккаунта"}</h1>
        <p>
          {isLogin
            ? "Авторизация нужна для загрузки ZIP и управления тарифом."
            : "После регистрации можно сразу загружать ZIP через кабинет и API."}
        </p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@app.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 8 символов"
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button button-primary button-full" disabled={pending} type="submit">
            {pending ? "Отправка..." : isLogin ? "Войти" : "Создать аккаунт"}
          </button>
        </form>
      </div>
    </div>
  );
}
