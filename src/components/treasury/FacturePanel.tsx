"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Paperclip, Upload, Trash2, Loader2, X, ExternalLink, FileText, Image } from "lucide-react";

interface Facture {
  id: string;
  facture_url: string;
  facture_name: string;
  created_at: string;
  uploaded_by: string | null;
  profiles: { name: string } | null;
}

export function FactureButton({
  transactionId,
  userId,
}: {
  transactionId: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("treasury_facture")
      .select("*, profiles(name)")
      .eq("transaction_id", transactionId)
      .order("created_at", { ascending: true });
    if (data) setFactures(data as Facture[]);
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${transactionId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("treasury-factures")
      .upload(path, file, { upsert: false });

    if (!uploadErr) {
      const { data: urlData } = supabase.storage
        .from("treasury-factures")
        .getPublicUrl(path);

      await supabase.from("treasury_facture").insert({
        transaction_id: transactionId,
        facture_url: urlData.publicUrl,
        facture_name: file.name,
        uploaded_by: userId,
      });
      await load();
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(facture: Facture) {
    setDeletingId(facture.id);
    // Extract storage path from URL
    const url = new URL(facture.facture_url);
    const pathParts = url.pathname.split("/treasury-factures/");
    if (pathParts[1]) {
      await supabase.storage.from("treasury-factures").remove([pathParts[1]]);
    }
    await supabase.from("treasury_facture").delete().eq("id", facture.id);
    setFactures((prev) => prev.filter((f) => f.id !== facture.id));
    setDeletingId(null);
  }

  const count = factures.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative text-zinc-600 hover:text-amber-400 transition-colors p-1"
        title="Factures / justificatifs"
      >
        <Paperclip size={14} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-zinc-900 text-[9px] font-bold rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Paperclip size={16} className="text-amber-400" />
                Factures / justificatifs
              </h2>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            {/* Upload */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-700 hover:border-amber-400 text-zinc-400 hover:text-amber-400 rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploading ? "Upload en cours…" : "Ajouter un fichier (PDF, image)"}
              </button>
            </div>

            {/* List */}
            {factures.length > 0 ? (
              <ul className="space-y-2">
                {factures.map((f) => {
                  const isPdf = f.facture_name.toLowerCase().endsWith(".pdf");
                  return (
                    <li key={f.id} className="flex items-center gap-3 bg-zinc-800 rounded-xl px-3 py-2.5">
                      {isPdf
                        ? <FileText size={16} className="text-red-400 shrink-0" />
                        : <Image size={16} className="text-blue-400 shrink-0" />
                      }
                      <span className="flex-1 text-sm text-white truncate">{f.facture_name}</span>
                      <a
                        href={f.facture_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-amber-400 transition-colors p-1 shrink-0"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => handleDelete(f)}
                        disabled={deletingId === f.id}
                        className="text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50 p-1 shrink-0"
                      >
                        {deletingId === f.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-sm text-zinc-600 py-2">Aucun justificatif attaché.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
