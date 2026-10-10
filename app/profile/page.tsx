
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Heart, LogOut, Mail, UserRound } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/auth");
        return;
      }

      setEmail(data.user.email ?? "");
      setLoading(false);
    }

    void loadProfile();
  }, [router]);

  async function handleLogout() {
    setError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/auth");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p>Opening your personal space ♡</p>
        </section>
      </main>
    );
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
          <Heart size={25} strokeWidth={1.5} />
        </div>

        <h1>
          Your little space <span>♡</span>
        </h1>

        <p className="auth-subtitle">
          Your account, your thoughts, your space.
        </p>

        <div className="profile-details">
          <div className="profile-avatar">
            <UserRound size={32} strokeWidth={1.5} />
          </div>

          <h2>My account</h2>

          <div className="profile-email">
            <Mail size={18} />
            <span>{email}</span>
          </div>

          <p className="auth-privacy">
            Your journal is personal. Take your time here.
          </p>
        </div>

        {error && (
          <p className="auth-feedback auth-error" role="alert">
            {error}
          </p>
        )}

        <Link href="/" className="auth-submit profile-journal-link">
          Go to my journal →
        </Link>

        <button
          type="button"
          className="profile-logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Log out
        </button>
      </section>

      <p className="auth-footer">
        made with care, for your quieter moments ♡
      </p>
    </main>
  );
}
