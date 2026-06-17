import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarDays, ListMusic, Plus, Music2, MapPin } from "lucide-react";
import { EditConcertButton } from "@/components/concerts/EditConcertButton";
import { NextRehearsalSongs } from "@/components/rehearsals/NextRehearsalSongs";
import { ClientDate } from "@/components/ClientDate";
import { differenceInDays, parseISO } from "date-fns";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { PushNotificationManager } from "@/components/PushNotificationManager";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const now = new Date().toISOString();

  const [
    { data: profile },
    { data: upcomingSessions },
    { data: nextRehearsal },
    { data: upcomingConcerts },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase
      .from("rehearsal_sessions")
      .select("*, profiles(name), session_votes(can_attend)")
      .gte("proposed_date", now)
      .order("proposed_date", { ascending: true })
      .limit(3),
    supabase
      .from("rehearsal_sessions")
      .select(
        "id, proposed_date, status, rehearsal_songs(song_id, songs(id, title, artist))",
      )
      .gte("proposed_date", now)
      .in("status", ["confirmed", "pending"])
      .order("status", { ascending: true }) // confirmed < pending alphabetically
      .order("proposed_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("concerts")
      .select("id, title, date, location, notes")
      .gte("date", now)
      .order("date", { ascending: true }),
  ]);

  // Reshape rehearsal songs
  const nextRehearsalSongs = (nextRehearsal?.rehearsal_songs ?? [])
    .map((rs: any) => (Array.isArray(rs.songs) ? rs.songs[0] : rs.songs))
    .filter(Boolean) as { id: string; title: string; artist: string }[];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-5xl m x-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Bonjour, {profile?.name ?? "là"}
        </h1>
        <p className="text-zinc-400 mt-1">Content de te revoir</p>
      </div>

      {/* Concerts */}
      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <Music2 size={18} />
            Prochains concerts
          </div>
          <Link
            href="/concerts/new"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <Plus size={14} /> Ajouter
          </Link>
        </div>
        {upcomingConcerts && upcomingConcerts.length > 0 ? (
          <ul className="space-y-2">
            {upcomingConcerts.map((concert: any) => {
              const d = parseISO(concert.date);
              const days = differenceInDays(d, today);
              return (
                <li key={concert.id}>
                  <div className="flex items-center justify-between hover:bg-zinc-800 rounded-xl p-3 transition-colors -mx-1">
                    <Link
                      href={`/concerts/${concert.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="text-white font-medium capitalize">
                        {concert.title
                          ? concert.title
                          : format(d, "EEEE d MMMM yyyy", { locale: fr })}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {!concert.title && (
                          <span className="text-xs text-zinc-500">
                            {format(d, "d MMM yyyy", { locale: fr })}
                          </span>
                        )}
                        {concert.title && (
                          <span className="text-xs text-zinc-500 capitalize">
                            {format(d, "EEEE d MMMM yyyy", { locale: fr })}
                          </span>
                        )}
                        {concert.location && (
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <MapPin size={10} />
                            {concert.location}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-xs text-amber-400 font-medium">
                        {days === 0 ? "aujourd'hui !" : `dans ${days}j`}
                      </span>
                      <Link
                        href={`/concerts/${concert.id}`}
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                      >
                        Détails
                      </Link>
                      <EditConcertButton
                        concertId={concert.id}
                        initialTitle={concert.title}
                        initialDate={concert.date}
                        initialLocation={concert.location}
                        initialNotes={concert.notes}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-zinc-500 text-sm">
            Aucun concert prévu.{" "}
            <Link
              href="/concerts/new"
              className="text-amber-400 hover:underline"
            >
              Ajouter le premier →
            </Link>
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Upcoming rehearsals */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <CalendarDays size={18} />
              Prochaines répétitions
            </div>
            <Link
              href="/rehearsals/new"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Plus size={14} /> Proposer
            </Link>
          </div>
          {upcomingSessions && upcomingSessions.length > 0 ? (
            <ul className="space-y-3">
              {upcomingSessions.map((s: any) => {
                const yes =
                  s.session_votes?.filter((v: any) => v.can_attend).length ?? 0;
                const no =
                  s.session_votes?.filter((v: any) => !v.can_attend).length ??
                  0;
                return (
                  <li key={s.id}>
                    <Link
                      href="/rehearsals"
                      className="block hover:bg-zinc-800 rounded-xl p-3 transition-colors"
                    >
                      <div className="font-medium text-white">
                        <ClientDate
                          iso={s.proposed_date}
                          fmt="EEE d MMM, HH:mm"
                        />
                      </div>
                      {s.location && (
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {s.location}
                        </div>
                      )}
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-emerald-400">{yes} yes</span>
                        <span className="text-red-400">{no} no</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-zinc-500 text-sm">Aucune répétition prévue.</p>
          )}
          <Link
            href="/rehearsals"
            className="mt-4 block text-center text-xs text-zinc-500 hover:text-amber-400 transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        {/* Next rehearsal songs */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <ListMusic size={18} />A travailler
            </div>
            <Link
              href="/rehearsals"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Gérer →
            </Link>
          </div>
          {nextRehearsal ? (
            <>
              <p className="text-xs text-zinc-500 mb-3">
                <ClientDate
                  iso={nextRehearsal.proposed_date}
                  fmt="EEE d MMM, HH:mm"
                />
                {nextRehearsal.status === "confirmed" && (
                  <span className="ml-2 text-emerald-400 font-medium">
                    ● confirmée
                  </span>
                )}
              </p>
              <NextRehearsalSongs
                songs={nextRehearsalSongs}
                sessionId={nextRehearsal.id}
              />
            </>
          ) : (
            <p className="text-zinc-500 text-sm mt-3">
              Aucune répétition prévue.{" "}
              <Link
                href="/rehearsals/new"
                className="text-amber-400 hover:underline"
              >
                Proposer →
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Guide + patchnotes */}

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/guide"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Comment utiliser le site ?
        </Link>
        <Link
          href="/patchnotes"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Notes de mise à jour
        </Link>
      </div>
      <FeedbackBanner userName={profile?.name ?? "Inconnu"} />
      <div className="mt-4">
        <PushNotificationManager userId={user.id} />
      </div>
    </div>
  );
}
