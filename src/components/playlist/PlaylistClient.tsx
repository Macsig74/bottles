"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Music,
  GripVertical,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Search,
  ArrowUpAZ,
  Users,
  GripHorizontal,
} from "lucide-react";

type SortMode = "position" | "title" | "artist";

interface Song {
  id: string;
  title: string;
  artist: string;
  youtube_url: string | null;
  notes: string | null;
  position: number | null;
  sheet_music: { instrument: string }[];
}

function EditModal({
  song,
  onClose,
  onSaved,
}: {
  song: Song;
  onClose: () => void;
  onSaved: (
    updated: Pick<Song, "id" | "title" | "artist" | "notes" | "youtube_url">,
  ) => void;
}) {
  const supabase = createClient();
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [youtube_url, setYoutubeUrl] = useState(song.youtube_url);
  const [notes, setNotes] = useState(song.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim() || !artist.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase
      .from("songs")
      .update({
        title: title.trim(),
        artist: artist.trim(),
        youtube_url: youtube_url?.trim(),
        notes: notes.trim() || null,
      })
      .eq("id", song.id);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSaved({
        id: song.id,
        title: title.trim(),
        artist: artist.trim(),
        youtube_url: youtube_url?.trim() || null,
        notes: notes.trim() || null,
      });
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-white">Modifier le morceau</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Titre *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Artiste *
          </label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Lien Youtube
          </label>
          <input
            type="text"
            value={youtube_url ?? ""}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !title.trim() || !artist.trim()}
            className="flex-1 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({
  song,
  onClose,
  onDeleted,
}: {
  song: Song;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await supabase.from("songs").delete().eq("id", song.id);
    onDeleted(song.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Supprimer ce morceau ?</h2>
        <p className="text-zinc-400 text-sm">
          <span className="text-white font-medium">{song.title}</span> sera
          définitivement supprimé.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared inner content for both row types
function SongCardInner({
  song,
  onEdit,
  onDelete,
  dragHandle,
}: {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  dragHandle?: React.ReactNode;
}) {
  const instruments = [
    ...new Set<string>(song.sheet_music?.map((s) => s.instrument) ?? []),
  ];
  return (
    <>
      {dragHandle}
      <Link
        href={`/playlist/${song.id}`}
        className="flex-1 flex items-center gap-3 min-w-0"
      >
        <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
          <Music size={16} className="text-amber-400" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-white text-sm sm:text-base truncate">
            {song.title}
          </div>
          <div className="text-xs sm:text-sm text-zinc-400 truncate">
            {song.artist}
          </div>
        </div>
        {instruments.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1 ml-auto shrink-0">
            {instruments.slice(0, 3).map((inst) => (
              <span
                key={inst}
                className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full"
              >
                {inst}
              </span>
            ))}
            {instruments.length > 3 && (
              <span className="text-xs text-zinc-500">
                +{instruments.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(song)}
          className="p-2 text-zinc-500 hover:text-amber-400 rounded-lg transition-colors"
          aria-label="Modifier"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(song)}
          className="p-2 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
          aria-label="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </>
  );
}

// Draggable row — doit être à l'intérieur d'un DndContext
function SortableRow({
  song,
  onEdit,
  onDelete,
}: {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-3 sm:px-4 sm:py-4 transition-colors ${isDragging ? "shadow-2xl border-amber-400/30" : ""}`}
    >
      <SongCardInner
        song={song}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandle={
          <button
            {...attributes}
            {...listeners}
            className="touch-none shrink-0 text-zinc-600 hover:text-zinc-400 active:text-amber-400 cursor-grab active:cursor-grabbing p-1.5 -ml-1 rounded-lg"
            aria-label="Réordonner"
          >
            <GripVertical size={20} />
          </button>
        }
      />
    </div>
  );
}

// Ligne statique — hors DndContext (recherche ou tri actif)
function SongRow({
  song,
  onEdit,
  onDelete,
}: {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-3 sm:px-4 sm:py-4">
      <SongCardInner song={song} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export function PlaylistClient({ initialSongs }: { initialSongs: Song[] }) {
  const supabase = createClient();
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("position");

  // Filtre par recherche
  const afterSearch = query.trim()
    ? songs.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.artist.toLowerCase().includes(query.toLowerCase()),
      )
    : songs;

  // Tri
  const displayed = [...afterSearch].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title, "fr");
    if (sort === "artist") return a.artist.localeCompare(b.artist, "fr");
    return 0; // position = ordre naturel du tableau
  });

  // Drag actif seulement si pas de recherche ET tri position
  const dragActive = query.trim() === "" && sort === "position";

  // Sensors: pointer (desktop) + touch (mobile) with a small delay to avoid conflicting with scrolling
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = songs.findIndex((s) => s.id === active.id);
      const newIndex = songs.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(songs, oldIndex, newIndex);
      setSongs(reordered);

      // Persist new positions
      await Promise.all(
        reordered.map((s, i) =>
          supabase
            .from("songs")
            .update({ position: i + 1 })
            .eq("id", s.id),
        ),
      );
    },
    [songs, supabase],
  );

  function handleSaved(
    updated: Pick<Song, "id" | "title" | "artist" | "notes">,
  ) {
    setSongs((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
    );
  }

  function handleDeleted(id: string) {
    setSongs((prev) => prev.filter((s) => s.id !== id));
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p className="text-lg">Aucun morceau pour l'instant.</p>
        <Link
          href="/playlist/new"
          className="text-amber-400 hover:underline mt-2 block"
        >
          Ajouter le premier morceau →
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Barre de recherche + tri */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un titre ou artiste…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Boutons de tri */}
        <div className="flex gap-1 shrink-0">
          {(
            [
              { value: "position", label: "Ordre", icon: <GripHorizontal size={13} /> },
              { value: "title",    label: "Titre",  icon: <ArrowUpAZ size={13} /> },
              { value: "artist",   label: "Artiste", icon: <Users size={13} /> },
            ] as { value: SortMode; label: string; icon: React.ReactNode }[]
          ).map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                sort === value
                  ? "bg-amber-400 text-zinc-900"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 && (
        <p className="text-center text-zinc-500 py-10 text-sm">
          Aucun résultat pour « {query} »
        </p>
      )}

      {/* Liste : drag uniquement en mode position sans recherche */}
      {dragActive ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={songs.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {songs.map((song) => (
                <SortableRow
                  key={song.id}
                  song={song}
                  onEdit={setEditingSong}
                  onDelete={setDeletingSong}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-2">
          {displayed.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              onEdit={setEditingSong}
              onDelete={setDeletingSong}
            />
          ))}
        </div>
      )}

      {editingSong && (
        <EditModal
          song={editingSong}
          onClose={() => setEditingSong(null)}
          onSaved={handleSaved}
        />
      )}

      {deletingSong && (
        <DeleteConfirm
          song={deletingSong}
          onClose={() => setDeletingSong(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
