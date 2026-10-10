
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Heart, LockKeyhole, Mail } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setMessage("Check your email to confirm your account ♡");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="auth-back">
        <ArrowLeft size={17} />
        Back to LALU
      </Link>

      <section className="auth-card">
        <Link href="/" className="auth-brand">
          lalu
          <span>space for you</span>
        </Link>

        <div className="auth-heart">
          <Heart size={25} />
        </div>

        <h1>
          {mode === "signup" ? "A space of your own" : "Welcome back"}
          <span> ♡</span>
        </h1>

        <p className="auth-subtitle">
          {mode === "signup"
            ? "Create your account and keep your thoughts close."
            : "Your quiet space is waiting for you."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "signup" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("signup");
              setError("");
              setMessage("");
            }}
          >
            Create account
          </button>

          <button
            type="button"
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
          >
            Log in
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <div className="auth-input-wrap">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <LockKeyhole size={18} />
            <input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {mode === "signup" && (
            <>
              <label htmlFor="confirm-password">Confirm password</label>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </>
          )}

          {error && (
            <p className="auth-feedback auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-feedback auth-success" role="status">
              {message}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create my account →"
                : "Log in →"}
          </button>
        </form>

        <p className="auth-privacy">
          Your journal deserves a safe, personal space.
        </p>
      </section>

      <p className="auth-footer">
        made with care, for your quieter moments ♡
      </p>
    </main>
  );
}
