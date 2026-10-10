
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LockKeyhole, Trash2, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mood = "Sad" | "Tired" | "Okay" | "Good" | "Great";

type Resource = {
  title: string;
  text: string;
  icon: string;
};

type JournalEntry = {
  id: string;
  date: string;
  mood: Mood;
  content: string;
};

type DatabaseEntry = {
  id: string;
  content: string;
  mood: Mood | null;
  created_at: string;
};

const moods: { name: Mood; emoji: string }[] = [
  { name: "Sad", emoji: "😔" },
  { name: "Tired", emoji: "😴" },
  { name: "Okay", emoji: "😐" },
  { name: "Good", emoji: "🙂" },
  { name: "Great", emoji: "🥰" },
];

const resources: Resource[] = [
  {
    title: "Anxiety",
    icon: "♡",
    text: "Pause for a moment. Notice where you are, what you can see, and how your feet feel on the ground.",
  },
  {
    title: "Body image",
    icon: "♡",
    text: "Your body deserves care and rest today, whatever thoughts you have about it.",
  },
  {
    title: "Relationships",
    icon: "♡",
    text: "What do you need from the people close to you? You can write it down before you decide to share.",
  },
  {
    title: "Self-esteem",
    icon: "♡",
    text: "Name one kind thing you did for yourself today, however small.",
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function mapDatabaseEntry(entry: DatabaseEntry): JournalEntry {
  return {
    id: entry.id,
    date: formatDate(entry.created_at),
    mood: entry.mood ?? "Okay",
    content: entry.content,
  };
}

function ResourcePanel() {
  const [selectedResource, setSelectedResource] = useState(0);
  const selected = resources[selectedResource];

  return (
    <aside className="lalu-sidebar">
      <div className="bear-area">
        <div className="decor-star star-one">✧</div>
        <div className="decor-star star-two">✦</div>

        <div className="bear-image">
          <Image
            src="/images/lalu-bear.png"
            alt="LALU bear"
            width={420}
            height={420}
            style={{ width: "100%", height: "auto" }}
            priority
          />
        </div>

        <div className="hello-text">hello ♡</div>
      </div>

      <div className="progress-card">
        <span>♡</span>
        <p>
          progress,
          <br />
          not perfection
        </p>
      </div>

      <div className="resources-card">
        <h2>Quick resources</h2>

        <div className="resource-grid">
          {resources.map((resource, index) => (
            <button
              type="button"
              key={resource.title}
              className={`resource-item ${
                selectedResource === index ? "resource-selected" : ""
              }`}
              onClick={() => setSelectedResource(index)}
            >
              <span className="resource-icon">{resource.icon}</span>
              <span>{resource.title}</span>
            </button>
          ))}
        </div>

        <div className="resource-info">
          <h3>{selected.title}</h3>
          <p>{selected.text}</p>
        </div>

        <p className="resource-disclaimer">
          LALU is a space to write and reflect. It does not replace support
          from a qualified mental health professional.
        </p>
      </div>
    </aside>
  );
}

export default function Home() {
  const [page, setPage] = useState<"write" | "entries">("write");
  const [greeting, setGreeting] = useState("Good evening");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());

    const interval = window.setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 1000);

    let active = true;

    async function loadEntries() {
      setLoadingEntries(true);
      setActionError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        setUserId(null);
        setEntries([]);
        setAuthChecked(true);
        setLoadingEntries(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, content, mood, created_at")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setActionError(
          `Couldn't load your entries: ${error.message}`
        );
        setEntries([]);
      } else {
        setEntries(
          ((data ?? []) as DatabaseEntry[]).map(mapDatabaseEntry)
        );
      }

      setAuthChecked(true);
      setLoadingEntries(false);
    }

    void loadEntries();

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  async function handleSave() {
    setActionError("");
    setSaved(false);

    if (!content.trim()) {
      setActionError("Write a little something before saving ♡");
      return;
    }

    if (!userId) {
      window.location.href = "/auth";
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          content: content.trim(),
          mood: selectedMood ?? "Okay",
        })
        .select("id, content, mood, created_at")
        .single();

      if (error) throw error;

      const newEntry = mapDatabaseEntry(data as DatabaseEntry);

      setEntries((current) => [newEntry, ...current]);
      setContent("");
      setSelectedMood(null);
      setSaved(true);

      window.setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Couldn't save your entry. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteId === null || !userId) return;

    setActionError("");

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", deleteId)
      .eq("user_id", userId);

    if (error) {
      setActionError(`Couldn't delete your entry: ${error.message}`);
      setDeleteId(null);
      return;
    }

    setEntries((current) =>
      current.filter((entry) => entry.id !== deleteId)
    );

    setDeleteId(null);
  }

  return (
    <div className="lalu-page">
      <header className="lalu-header">
        <div className="lalu-header-inner">
          <button
            type="button"
            className="lalu-brand"
            onClick={() => setPage("write")}
            aria-label="Go to LALU home"
          >
            <span className="lalu-logo">lalu</span>
            <span className="lalu-tagline">space for you</span>
          </button>

          <nav className="lalu-nav">
            <button
              type="button"
              className={page === "write" ? "nav-active" : ""}
              onClick={() => setPage("write")}
            >
              Write
            </button>

            <button
              type="button"
              className={page === "entries" ? "nav-active" : ""}
              onClick={() => setPage("entries")}
            >
              My entries
            </button>
          </nav>


<div className="account-area">
  <button
    type="button"
    className="account-button"
    onClick={() => {
      window.location.href = userId ? "/profile" : "/auth";
    }}
    aria-label={userId ? "Open my profile" : "Log in or create an account"}
    title={userId ? "My profile" : "Log in or create an account"}
  >
    <UserRound size={23} strokeWidth={1.6} />
  </button>
</div>

        </div>
      </header>

      {page === "write" && (
        <main className="lalu-container">
          <div className="lalu-main-grid">
            <section>
              <div className="lalu-intro">
                <div className="eyebrow">
                  ✧ A LITTLE SPACE, JUST FOR YOU
                </div>
                <h1>
                  {greeting} <span>♡</span>
                </h1>
                <p className="intro-subtitle">
                  How are you feeling today?
                </p>
              </div>

              <div className="mood-grid">
                {moods.map((mood) => (
                  <button
                    type="button"
                    key={mood.name}
                    className={`mood-item ${
                      selectedMood === mood.name ? "mood-selected" : ""
                    }`}
                    onClick={() => setSelectedMood(mood.name)}
                  >
                    <div className="mood-circle">{mood.emoji}</div>
                    <div className="mood-label">{mood.name}</div>
                  </button>
                ))}
              </div>

              <div className="motivation-card">
                <div className="motivation-icon">♡</div>
                <div>
                  <h3>It’s okay not to be okay.</h3>
                  <p>You can still be proud of yourself today.</p>
                </div>
                <div className="motivation-heart">♡</div>
              </div>

              <section className="journal-section">
                <div className="journal-title-row">
                  <h2>What’s on your mind?</h2>
                  <div className="private-label">
                    <LockKeyhole size={17} strokeWidth={1.7} />
                    <span>Private</span>
                  </div>
                </div>

                <div className="journal-card">
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    maxLength={10000}
                    placeholder="Start writing here..."
                  />

                  <div className="journal-bottom">
                    <span className="character-count">
                      {content.length.toLocaleString()} / 10,000
                    </span>
                    <span className="privacy-text">
                      Your words are only visible to you.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="save-button"
                  onClick={handleSave}
                  disabled={saving || !authChecked}
                >
                  {saving
                    ? "Saving..."
                    : !authChecked
                      ? "Loading..."
                      : "Save entry →"}
                </button>

                {saved && (
                  <div className="saved-message">
                    Your entry was saved ♡
                  </div>
                )}

                {actionError && (
                  <p className="auth-feedback auth-error" role="alert">
                    {actionError}
                  </p>
                )}

                {!userId && authChecked && (
                  <p className="privacy-text">
                    Log in to save your private journal entries.
                  </p>
                )}

                <button
                  type="button"
                  className="read-entries"
                  onClick={() => setPage("entries")}
                >
                  Read my entries →
                </button>
              </section>
            </section>

            <ResourcePanel />
          </div>
        </main>
      )}

      {page === "entries" && (
        <main className="entries-page">
          <section>
            <div className="entries-header">
              <div className="eyebrow">✧ YOUR QUIET SPACE</div>

              <h1>
                Your journal <span>♡</span>
              </h1>

              <p className="entries-subtitle">
                A place to return to your words, whenever you need.
              </p>

              <button
                type="button"
                className="new-entry-link"
                onClick={() => setPage("write")}
              >
                + Write a new entry
              </button>

              {saved && (
                <div className="entries-status">
                  Your entry was saved ♡
                </div>
              )}
            </div>

            {actionError && (
              <p className="auth-feedback auth-error" role="alert">
                {actionError}
              </p>
            )}

            <div className="entries-list">
              {loadingEntries ? (
                <div className="empty-entries">
                  <h2>Opening your journal ♡</h2>
                  <p>Your entries will be here in a moment.</p>
                </div>
              ) : !userId ? (
                <div className="empty-entries">
                  <div className="empty-entries-heart">♡</div>
                  <h2>Your journal is personal.</h2>
                  <p>
                    Log in to access your saved entries and keep your
                    thoughts in your own private space.
                  </p>
                  <button
                    type="button"
                    className="save-button"
                    onClick={() => {
                      window.location.href = "/auth";
                    }}
                  >
                    Log in → 
                  </button>
                </div>
              ) : entries.length === 0 ? (
                <div className="empty-entries">
                  <div className="empty-entries-heart">♡</div>
                  <h2>Your journal is waiting for you.</h2>
                  <p>
                    Write something down whenever you feel like it.
                    There is no right or wrong way to begin.
                  </p>
                  <button
                    type="button"
                    className="save-button"
                    onClick={() => setPage("write")}
                  >
                    Write your first entry →
                  </button>
                </div>
              ) : (
                entries.map((entry) => (
                  <article className="entry-card" key={entry.id}>
                    <div className="entry-top">
                      <div>
                        <div className="entry-date">{entry.date}</div>
                        <div className="entry-mood">
                          {
                            moods.find(
                              (mood) => mood.name === entry.mood
                            )?.emoji
                          }{" "}
                          {entry.mood}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => setDeleteId(entry.id)}
                      >
                        <Trash2 size={16} strokeWidth={1.7} />
                        <span>Delete</span>
                      </button>
                    </div>

                    <p className="entry-content">{entry.content}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          <ResourcePanel />
        </main>
      )}

      <footer className="lalu-footer">
        made with care, for your quieter moments ♡
      </footer>

      {deleteId !== null && (
        <div className="delete-modal-overlay">
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <div className="delete-modal-heart">♡</div>
            <h2 id="delete-title">Are you sure? ♡</h2>
            <p>Are you sure you want to delete this entry?</p>
            <p className="delete-modal-warning">
              This action can&apos;t be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="cancel-delete"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete"
                onClick={handleDelete}
              >
                Delete entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
