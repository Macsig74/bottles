"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Minus,
  SlidersHorizontal,
  Loader2,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Wallet,
  Banknote,
  Building2,
  Pencil,
  Check,
  X,
  GripVertical,
} from "lucide-react";
import { FactureButton } from "./FacturePanel";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "income" | "expense" | "adjustment";
  treasury: "cash" | "official";
  created_by: string;
  created_at: string;
  position: number | null;
  profiles: { name: string } | null;
}

interface Props {
  userId: string;
  isAdmin: boolean;
  initialTransactions: Transaction[];
  initialBalance: number;
}

function computeBalance(txs: Transaction[], treasury: "cash" | "official") {
  return txs
    .filter((t) => t.treasury === treasury)
    .reduce((sum, t) => {
      if (t.type === "income" || t.type === "adjustment")
        return sum + Number(t.amount);
      return sum - Number(t.amount);
    }, 0);
}

type Mode = "income" | "expense" | "adjustment" | null;

const typeConfig = {
  income: {
    label: "Entrée",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  expense: {
    label: "Dépense",
    icon: TrendingDown,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  adjustment: {
    label: "Ajustement",
    icon: ArrowLeftRight,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
};

function SortableRow({
  t,
  userId,
  editingId,
  editAmount,
  editDescription,
  editLoading,
  editError,
  deletingId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  setEditAmount,
  setEditDescription,
}: {
  t: Transaction;
  userId: string;
  editingId: string | null;
  editAmount: string;
  editDescription: string;
  editLoading: boolean;
  editError: string;
  deletingId: string | null;
  onStartEdit: (t: Transaction) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onDelete: (id: string) => void;
  setEditAmount: (v: string) => void;
  setEditDescription: (v: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: t.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const cfg = typeConfig[t.type];
  const Icon = cfg.icon;
  const displayAmount =
    t.type === "expense" ? -Number(t.amount) : Number(t.amount);
  const isEditing = editingId === t.id;

  return (
    <li ref={setNodeRef} style={style} className="px-3 py-3">
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${cfg.bg}`}
            >
              <Icon size={14} className={cfg.color} />
            </div>
            <div className="relative shrink-0">
              <input
                type="number"
                step="0.01"
                min="0"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 pr-7 text-base text-white focus:outline-none focus:border-amber-500 transition-colors"
                autoFocus
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                €
              </span>
            </div>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="flex-1 min-w-[120px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-base text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSaveEdit(t.id)}
                disabled={editLoading}
                className="p-2 text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors"
              >
                {editLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} />
                )}
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>
          {editError && (
            <p className="text-red-400 text-xs pl-10">{editError}</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="touch-none shrink-0 text-zinc-700 hover:text-zinc-400 active:text-amber-400 cursor-grab active:cursor-grabbing p-1 rounded-lg"
          >
            <GripVertical size={16} />
          </button>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cfg.bg} shrink-0`}
          >
            <Icon size={14} className={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{t.description}</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {(t.profiles as any)?.name} ·{" "}
              {format(new Date(t.created_at), "d MMM yyyy, HH:mm", {
                locale: fr,
              })}
            </div>
          </div>
          <span
            className={`text-sm font-semibold tabular-nums ${displayAmount >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {displayAmount >= 0 ? "+" : ""}
            {displayAmount.toFixed(2)} €
          </span>
          <div className="flex items-center gap-1 ml-1">
            <FactureButton transactionId={t.id} userId={userId} />
            <button
              onClick={() => onStartEdit(t)}
              className="text-zinc-600 hover:text-amber-400 transition-colors p-1"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(t.id)}
              disabled={deletingId === t.id}
              className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-50 p-1"
            >
              {deletingId === t.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function TreasuryClient({
  userId,
  isAdmin,
  initialTransactions,
}: Props) {
  const supabase = createClient();

  const [transactions, setTransactions] = useState<Transaction[]>(
    [...initialTransactions].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0),
    ),
  );
  const [activeTreasury, setActiveTreasury] = useState<"cash" | "official">(
    "official",
  );

  const [mode, setMode] = useState<Mode>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const cashBalance = computeBalance(transactions, "cash");
  const officialBalance = computeBalance(transactions, "official");
  const currentTransactions = transactions.filter(
    (t) => t.treasury === activeTreasury,
  );

  const fetchTransactions = useCallback(async () => {
    const { data } = await supabase
      .from("treasury_transactions")
      .select("*, profiles(name)")
      .order("position", { ascending: true });
    if (data) setTransactions(data as Transaction[]);
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("treasury-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "treasury_transactions" },
        () => fetchTransactions(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions, supabase]);

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

      const filtered = transactions.filter(
        (t) => t.treasury === activeTreasury,
      );
      const others = transactions.filter((t) => t.treasury !== activeTreasury);
      const oldIndex = filtered.findIndex((t) => t.id === active.id);
      const newIndex = filtered.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(filtered, oldIndex, newIndex);

      setTransactions([...others, ...reordered]);

      await Promise.all(
        reordered.map((t, i) =>
          supabase
            .from("treasury_transactions")
            .update({ position: i + 1 })
            .eq("id", t.id),
        ),
      );
    },
    [transactions, activeTreasury, supabase],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = parseFloat(amount.replace(",", "."));
    if (isNaN(parsed) || parsed <= 0) {
      setError("Montant invalide.");
      return;
    }
    if (!description.trim()) {
      setError("La description est obligatoire.");
      return;
    }
    if (!mode) return;

    const maxPos = currentTransactions.reduce(
      (m, t) => Math.max(m, t.position ?? 0),
      0,
    );
    setLoading(true);
    const { error: err } = await supabase.from("treasury_transactions").insert({
      amount: parsed,
      description: description.trim(),
      type: mode,
      treasury: activeTreasury,
      created_by: userId,
      position: maxPos + 1,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setAmount("");
    setDescription("");
    setMode(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from("treasury_transactions").delete().eq("id", id);
    setDeletingId(null);
  }

  function startEdit(t: Transaction) {
    setEditingId(t.id);
    setEditAmount(String(t.amount));
    setEditDescription(t.description);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditAmount("");
    setEditDescription("");
    setEditError("");
  }

  async function handleEdit(id: string) {
    const parsed = parseFloat(editAmount.replace(",", "."));
    if (isNaN(parsed) || parsed <= 0) {
      setEditError("Montant invalide.");
      return;
    }
    if (!editDescription.trim()) {
      setEditError("Description obligatoire.");
      return;
    }
    setEditLoading(true);
    setEditError("");
    const { error: err } = await supabase
      .from("treasury_transactions")
      .update({ amount: parsed, description: editDescription.trim() })
      .eq("id", id);
    setEditLoading(false);
    if (err) {
      setEditError(err.message);
      return;
    }
    cancelEdit();
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setActiveTreasury("official");
            setMode(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${
            activeTreasury === "official"
              ? "bg-amber-500 border-amber-500 text-black"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400"
          }`}
        >
          <Building2 size={16} />
          Compte Bancaire
        </button>
        <button
          onClick={() => {
            setActiveTreasury("cash");
            setMode(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${
            activeTreasury === "cash"
              ? "bg-amber-500 border-amber-500 text-black"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400"
          }`}
        >
          <Banknote size={16} />
          Cash
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`bg-zinc-900 border rounded-2xl p-4 text-center transition-colors ${activeTreasury === "official" ? "border-amber-500/40" : "border-zinc-800"}`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Building2 size={13} className="text-zinc-500" />
            <p className="text-zinc-400 text-xs">Officiel</p>
          </div>
          <p
            className={`text-2xl font-bold tracking-tight ${officialBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {officialBalance >= 0 ? "+" : ""}
            {officialBalance.toFixed(2)} €
          </p>
        </div>
        <div
          className={`bg-zinc-900 border rounded-2xl p-4 text-center transition-colors ${activeTreasury === "cash" ? "border-amber-500/40" : "border-zinc-800"}`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Banknote size={13} className="text-zinc-500" />
            <p className="text-zinc-400 text-xs">Cash</p>
          </div>
          <p
            className={`text-2xl font-bold tracking-tight ${cashBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {cashBalance >= 0 ? "+" : ""}
            {cashBalance.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            key: "income",
            label: "Entrée",
            Icon: Plus,
            active: "bg-emerald-500 border-emerald-500 text-white",
            inactive:
              "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400",
          },
          {
            key: "expense",
            label: "Dépense",
            Icon: Minus,
            active: "bg-red-500 border-red-500 text-white",
            inactive:
              "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-red-500/50 hover:text-red-400",
          },
          {
            key: "adjustment",
            label: "Ajustement",
            Icon: SlidersHorizontal,
            active: "bg-blue-500 border-blue-500 text-white",
            inactive:
              "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-blue-500/50 hover:text-blue-400",
          },
        ].map(({ key, label, Icon, active, inactive }) => (
          <button
            key={key}
            onClick={() =>
              setMode(mode === (key as Mode) ? null : (key as Mode))
            }
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-colors ${mode === key ? active : inactive}`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Form */}
      {mode && (
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"
        >
          <p className="text-sm font-medium text-zinc-300">
            {mode === "income" &&
              `Entrée — ${activeTreasury === "official" ? "Compte Bancaire" : "Cash"}`}
            {mode === "expense" &&
              `Dépense — ${activeTreasury === "official" ? "Compte Bancaire" : "Cash"}`}
            {mode === "adjustment" &&
              `Ajustement — ${activeTreasury === "official" ? "Compte Bancaire" : "Cash"}`}
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 pr-8 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                €
              </span>
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                mode === "income"
                  ? "Source (ex: cotisations)"
                  : mode === "expense"
                    ? "Objet (ex: câbles)"
                    : "Note (ex: solde initial)"
              }
              className="flex-[2] bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-xl transition-colors"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Enregistrer
          </button>
        </form>
      )}

      {/* Transactions list */}
      {currentTransactions.length > 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            {activeTreasury === "official" ? (
              <Building2 size={14} className="text-zinc-500" />
            ) : (
              <Banknote size={14} className="text-zinc-500" />
            )}
            <h2 className="text-sm font-semibold text-zinc-300">
              Historique —{" "}
              {activeTreasury === "official" ? "Compte Bancaire" : "Caisse"}
            </h2>
            <span className="ml-auto text-xs text-zinc-600">
              {currentTransactions.length} transaction
              {currentTransactions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentTransactions.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-zinc-800">
                {currentTransactions.map((t) => (
                  <SortableRow
                    key={t.id}
                    t={t}
                    userId={userId}
                    editingId={editingId}
                    editAmount={editAmount}
                    editDescription={editDescription}
                    editLoading={editLoading}
                    editError={editError}
                    deletingId={deletingId}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={handleEdit}
                    onDelete={handleDelete}
                    setEditAmount={setEditAmount}
                    setEditDescription={setEditDescription}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        !mode && (
          <div className="text-center py-12 text-zinc-600">
            <Wallet size={40} className="mx-auto mb-3 opacity-30" />
            <p>
              Aucune transaction pour{" "}
              {activeTreasury === "official"
                ? "le compte bancaire"
                : "la caisse"}
              .
            </p>
          </div>
        )
      )}
    </div>
  );
}
