"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewRehearsalPage() {
  const supabase = createClient();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const proposed_date = new Date(`${date}T${time}:00`).toISOString();

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("rehearsal_sessions").insert({
      proposed_by: user.id,
      proposed_date,
      notes: notes || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Notifier tous les abonnés push
      const d = new Date(proposed_date);
      const dateLabel = d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const timeLabel = d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const who = profile?.name ?? "Quelqu'un";
      fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nouvelle répétition proposée",
          body: `${who} propose le ${dateLabel} à ${timeLabel}`,
          url: "/rehearsals",
        }),
      }).catch(() => {});

      router.push("/rehearsals");
      router.refresh();
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24 sm:pb-8">
      <Link
        href="/rehearsals"
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">
        Proposer une répétition
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Heure *
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Infos supplémentaires…"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Proposer"}
        </button>
      </form>
    </div>
  );
}
