"use client";
import { useState } from "react";

export default function AdminPage() {
  const [form, setForm] = useState({
    arabic_text: "",
    audio_url: "",
    exercise_type: "listening" as "listening" | "speaking",
  });
  const [message, setMessage] = useState<string>("");

  async function submit() {
    setMessage("");
    const res = await fetch("/api/exercises/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.ok ? "Saved" : "Failed");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-slate-900">Add Content (Teachers)</h1>
        <div className="bg-white/90 rounded-xl ring-1 ring-slate-900/10 shadow-sm p-6 flex flex-col gap-4">
          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Arabic text</div>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              value={form.arabic_text}
              onChange={(e) => setForm({ ...form, arabic_text: e.target.value })}
            />
          </label>
          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Audio URL (Supabase Storage)</div>
            <input
              className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://..."
              value={form.audio_url}
              onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
            />
          </label>
          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Type</div>
            <select
              className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.exercise_type}
              onChange={(e) => setForm({ ...form, exercise_type: e.target.value as any })}
            >
              <option value="listening">Listening</option>
              <option value="speaking">Speaking</option>
            </select>
          </label>
          <button onClick={submit} className="self-start px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-sky-500 shadow-sm hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
            Submit
          </button>
          {message && <div className="text-slate-700">{message}</div>}
        </div>
      </div>
    </main>
  );
}
