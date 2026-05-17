import { Music2 } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function ConcertBanner() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("concerts")
    .select("id, title, date")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(1)
    .single();

  if (!data) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = parseISO(data.date);
  const days = differenceInDays(d, today);
  const label = data.title ?? format(d, "d MMMM yyyy", { locale: fr });

  return (
    <Link
      href={`/concerts/${data.id}`}
      className="sticky top-16 z-40 bg-amber-400 text-zinc-900 px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold hover:bg-amber-300 transition-colors"
    >
      <Music2 size={15} />
      Prochain concert : {label}
      {days === 0 ? (
        <span className="ml-1 font-bold">— c&apos;est aujourd&apos;hui !</span>
      ) : (
        <span className="ml-1 opacity-80">
          — dans {days} jour{days > 1 ? "s" : ""}
        </span>
      )}
    </Link>
  );
}
