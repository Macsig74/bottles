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
  Pencil,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "income" | "expense" | "adjustment";
  created_by: string;
  created_at: string;
  profiles: { name: string } | null;
}

interface Props {
  userId: string;
  isAdmin: boolean;
  initialTransactions: Transaction[];
  initialBalance: number;
}


function computeBalance(txs: Transaction[]) {
  return txs.reduce((sum, t) => {
    if (t.type === "income" || t.type === "adjustment")
      return sum + Number(t.amount);
    return sum - Number(t.amount);
  }, 0);
}

type Mode = "income" | "expense" | "adjustment" | null;

export function TreasuryClient({
  userId,
  isAdmin,
  initialTransactions,
  initialBalance,
}: Props) {
  const supabase = createClient();

  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [balance, setBalance] = useState(initialBalance);

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

  const fetchTransactions = useCallback(async () => {
    const { data } = await supabase
      .from("treasury_transactions")
      .select("*, profiles(name)")
      .order("created_at", { ascending: false });
    if (data) {
      setTransactions(data as Transaction[]);
      setBalance(computeBalance(data as Transaction[]));
    }
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("treasury-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "treasury_transactions" },
        () => {
          fetchTransactions();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions, supabase]);

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

    setLoading(true);
    const { error: err } = await supabase.from("treasury_transactions").insert({
      amount: parsed,
      description: description.trim(),
      type: mode,
      created_by: userId,
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

  const typeConfig = {
    income: {
      label: "Entrée",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      sign: "+",
    },
    expense: {
      label: "Dépense",
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      sign: "-",
    },
    adjustment: {
      label: "Ajustement",
      icon: ArrowLeftRight,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      sign: "=",
    },
  };

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
        <p className="text-zinc-400 text-sm mb-1">Solde actuel</p>
        <p
          className={`text-5xl font-bold tracking-tight ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}
        >
          {balance >= 0 ? "+" : ""}
          {balance.toFixed(2)} €
        </p>
        <p className="text-zinc-600 text-xs mt-2">
          {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setMode(mode === "income" ? null : "income")}
          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-colors ${
            mode === "income"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400"
          }`}
        >
          <Plus size={18} />
          Entrée
        </button>
        <button
          onClick={() => setMode(mode === "expense" ? null : "expense")}
          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-colors ${
            mode === "expense"
              ? "bg-red-500 border-red-500 text-white"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-red-500/50 hover:text-red-400"
          }`}
        >
          <Minus size={18} />
          Dépense
        </button>
        <button
          onClick={() => setMode(mode === "adjustment" ? null : "adjustment")}
          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-colors ${
            mode === "adjustment"
              ? "bg-blue-500 border-blue-500 text-white"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-blue-500/50 hover:text-blue-400"
          }`}
        >
          <SlidersHorizontal size={18} />
          Solde actuel
        </button>
      </div>

      {/* Form */}
      {mode && (
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"
        >
          <p className="text-sm font-medium text-zinc-300">
            {mode === "income" && "Ajouter une entrée d'argent"}
            {mode === "expense" && "Enregistrer une dépense"}
            {mode === "adjustment" &&
              "Définir le solde actuel (ex: caisse de départ)"}
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
      {transactions.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300">Historique</h2>
          </div>
          <ul className="divide-y divide-zinc-800">
            {transactions.map((t) => {
              const cfg = typeConfig[t.type];
              const Icon = cfg.icon;
              const displayAmount =
                t.type === "expense" ? -Number(t.amount) : Number(t.amount);
              const isEditing = editingId === t.id;
              return (
                <li key={t.id} className="group px-4 py-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${cfg.bg}`}
                        >
                          <Icon size={14} className={cfg.color} />
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 pr-7 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                            autoFocus
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">€</span>
                        </div>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <button
                          onClick={() => handleEdit(t.id)}
                          disabled={editLoading}
                          className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors"
                        >
                          {editLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      {editError && <p className="text-red-400 text-xs pl-10">{editError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cfg.bg}`}
                      >
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">
                          {t.description}
                        </div>
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
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-1">
                        <button
                          onClick={() => startEdit(t)}
                          className="text-zinc-600 hover:text-amber-400 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-50"
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
            })}
          </ul>
        </div>
      )}

      {transactions.length === 0 && !mode && (
        <div className="text-center py-12 text-zinc-600">
          <Wallet size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune transaction. Commence par définir le solde actuel.</p>
        </div>
      )}
    </div>
  );
}
