"use client";
import { useEffect, useState } from "react";

type Exercise = {
  id: string;
  arabic_text: string;
  audio_url: string;
  exercise_type: "listening" | "speaking";
};

export default function ListeningPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchExercise() {
    setLoading(true);
    try {
      const res = await fetch("/api/exercises/get-one?type=listening");
      const data = await res.json();
      setExercise(data.exercise);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExercise();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-slate-900">Listening Practice</h1>
        {exercise && (
          <div className="bg-white/90 rounded-xl ring-1 ring-slate-900/10 shadow-sm p-6">
            <div className="text-3xl mb-4 text-slate-800">{exercise.arabic_text}</div>
            <audio controls className="w-full">
              <source src={exercise.audio_url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        <button
          onClick={fetchExercise}
          disabled={loading}
          className="self-start px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-sky-500 shadow-sm hover:shadow-md transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
        >
          {loading ? "Loading..." : "Next Exercise"}
        </button>
      </div>
    </main>
  );
}
