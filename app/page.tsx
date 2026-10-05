"use client";

import { useState } from "react";

const moods = [
  { emoji: "😢", label: "Sad" },
  { emoji: "😔", label: "Tired" },
  { emoji: "🙂", label: "Okay" },
  { emoji: "😊", label: "Good" },
  { emoji: "🥰", label: "Great" },
];

const resources = [
  {
    icon: "☁",
    title: "Anxiety",
    text: "A little reminder that you are safe to slow down.",
  },
  {
    icon: "❀",
    title: "Body image",
    text: "Your body deserves care and rest today.",
  },
  {
    icon: "♡",
    title: "Relationships",
    text: "Healthy relationships should leave space for you too.",
  },
  {
    icon: "☆",
    title: "Self-esteem",
    text: "You don't have to be perfect to be worthy.",
  },
];

export default function Home() {
  const [selectedMood, setSelectedMood] = useState("");
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(
    null
  );

  const handleSave = () => {
    if (!entry.trim()) return;

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#3F3A35]">
      {/* Header */}
      <header className="border-b border-[#DED8CF] bg-[#F7F4EF]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.04em]">
              lalu
            </h1>
            <p className="text-xs tracking-[0.16em] text-[#8A8178] uppercase">
              space for you
            </p>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <button className="transition-opacity hover:opacity-60">
              Write
            </button>

            <button className="transition-opacity hover:opacity-60">
              My entries
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1fr_320px] lg:py-14">
        {/* Left side */}
        <section>
          {/* Greeting */}
          <div className="mb-10">
            <p className="mb-3 text-xs font-medium tracking-[0.18em] text-[#9A9188] uppercase">
              A little space, just for you
            </p>

            <h2 className="text-4xl font-medium tracking-[-0.04em] md:text-5xl">
              Good afternoon ♡
            </h2>

            <p className="mt-4 text-base text-[#81786F]">
              How are you feeling today?
            </p>
          </div>

          {/* Mood selector */}
          <div className="mb-12 grid grid-cols-5 gap-2 sm:max-w-xl sm:gap-4">
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.label;

              return (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood.label)}
                  className={`group flex flex-col items-center gap-2 rounded-2xl px-2 py-4 transition-all ${
                    isSelected
                      ? "bg-[#E8DED2] shadow-sm"
                      : "hover:bg-[#EEE9E2]"
                  }`}
                >
                  <span
                    className={`text-2xl transition-transform ${
                      isSelected ? "scale-110" : "group-hover:scale-105"
                    }`}
                  >
                    {mood.emoji}
                  </span>

                  <span className="text-xs text-[#756D65]">
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Journal */}
          <section className="rounded-3xl border border-[#DED8CF] bg-[#FBF9F6] p-6 md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-medium">What&apos;s on your mind?</h3>

              {selectedMood && (
                <span className="rounded-full bg-[#EEE9E2] px-3 py-1 text-xs text-[#756D65]">
                  Feeling {selectedMood.toLowerCase()}
                </span>
              )}
            </div>

            <textarea
              value={entry}
              onChange={(event) => {
                setEntry(event.target.value);
                setSaved(false);
              }}
              maxLength={10000}
              placeholder="Start writing here..."
              className="min-h-[280px] w-full resize-none rounded-2xl border border-[#E3DDD5] bg-[#F7F4EF] p-5 text-base leading-7 outline-none placeholder:text-[#AAA198] focus:border-[#B9AEA2]"
            />

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-[#9A9188]">
                {entry.length.toLocaleString()} / 10,000
              </span>

              <button
                onClick={handleSave}
                disabled={!entry.trim()}
                className="rounded-full bg-[#3F3A35] px-6 py-3 text-sm text-white transition-all hover:bg-[#554E47] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save entry →
              </button>
            </div>

            {saved && (
              <p className="mt-4 text-sm text-[#81786F]">
                Your entry was saved ♡
              </p>
            )}
          </section>
        </section>

        {/* Right side */}
        <aside className="space-y-6">
          {/* Bear card */}
          <div className="rounded-3xl bg-[#E8DED2] p-7">
            <div className="mb-5 flex h-36 items-center justify-center">
              <span className="text-8xl">🧸</span>
            </div>

            <p className="text-center text-lg italic text-[#665D55]">
              progress,
              <br />
              not perfection
            </p>
          </div>

          {/* Resources */}
          <div className="rounded-3xl border border-[#DED8CF] bg-[#FBF9F6] p-6">
            <h3 className="mb-5 text-lg font-medium">Quick resources</h3>

            <div className="grid grid-cols-4 gap-2">
              {resources.map((resource) => (
                <button
                  key={resource.title}
                  onClick={() => setSelectedResource(resource.title)}
                  className={`flex h-12 items-center justify-center rounded-xl text-lg transition-all ${
                    selectedResource === resource.title
                      ? "bg-[#E8DED2]"
                      : "bg-[#F1ECE6] hover:bg-[#E8DED2]"
                  }`}
                  aria-label={resource.title}
                >
                  {resource.icon}
                </button>
              ))}
            </div>

            {selectedResource && (
              <div className="mt-5 border-t border-[#E3DDD5] pt-5">
                {resources
                  .filter(
                    (resource) => resource.title === selectedResource
                  )
                  .map((resource) => (
                    <div key={resource.title}>
                      <p className="mb-2 text-sm font-medium">
                        {resource.title}
                      </p>

                      <p className="text-sm leading-6 text-[#81786F]">
                        {resource.text}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 pb-8 text-xs text-[#AAA198] md:px-10">
        A little space, just for you ♡
      </footer>
    </main>
  );
}