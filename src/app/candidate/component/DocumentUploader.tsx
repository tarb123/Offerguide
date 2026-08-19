"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Award,
  CreditCard,
  Files,
  UploadCloud,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";

type Doc = {
  id: string;
  filename: string;
  category: string;
  size: number;
  contentType: string;
  uploadedAt: string;
};

const CATEGORIES: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: "cv", label: "Updated CV", icon: <FileText size={15} /> },
  {
    key: "certificates",
    label: "Internship / Job Experience Certificates",
    icon: <Award size={15} />,
  },
  { key: "cnic", label: "Copy of CNIC", icon: <CreditCard size={15} /> },
  { key: "other", label: "Other Relevant Documents", icon: <Files size={15} /> },
];

const MAX_PER_CATEGORY = 5;
const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentUploader() {
  const [email, setEmail] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyCat, setBusyCat] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("candidateUser");
    const e = saved ? JSON.parse(saved).email || "" : "";
    setEmail(e);
    if (e) void refresh(e);
    else setLoading(false);
  }, []);

  async function refresh(e: string) {
    try {
      const res = await fetch(
        `/api/pgp-candidate/documents?email=${encodeURIComponent(e)}`
      );
      const data = await res.json();
      setDocs(data.documents || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function upload(category: string, files: FileList) {
    setBusyCat(category);
    setMessage(null);

    const form = new FormData();
    form.append("email", email);
    form.append("category", category);
    Array.from(files).forEach((f) => form.append("files", f));

    try {
      const res = await fetch("/api/pgp-candidate/documents", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.message || "Upload failed.", ok: false });
        return;
      }
      setDocs(data.documents || []);
      setMessage({ text: data.message, ok: true });
    } catch {
      setMessage({ text: "Upload failed. Please try again.", ok: false });
    } finally {
      setBusyCat("");
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/pgp-candidate/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setMessage({ text: "Could not remove the file.", ok: false });
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading documents…</p>;
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg px-3 py-2 text-xs font-bold ${
            message.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const files = docs.filter((d) => d.category === cat.key);
          const full = files.length >= MAX_PER_CATEGORY;
          return (
            <CategoryCard
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              files={files}
              full={full}
              busy={busyCat === cat.key}
              onPick={(fl) => upload(cat.key, fl)}
              onRemove={remove}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryCard({
  icon,
  label,
  files,
  full,
  busy,
  onPick,
  onRemove,
}: {
  icon: React.ReactNode;
  label: string;
  files: Doc[];
  full: boolean;
  busy: boolean;
  onPick: (files: FileList) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
          <span className="text-blue-900 dark:text-sky-300">{icon}</span>
          {label}
        </span>
        <span className="shrink-0 text-[10px] font-bold text-slate-400">
          {files.length}/{MAX_PER_CATEGORY}
        </span>
      </div>

      {/* Uploaded files */}
      {files.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-white/5 px-2.5 py-1.5"
            >
              <FileText size={13} className="shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  {f.filename}
                </p>
                <p className="text-[9px] text-slate-400">{formatSize(f.size)}</p>
              </div>
              <a
                href={`/api/pgp-candidate/documents/${f.id}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View"
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-white hover:text-blue-900 dark:hover:bg-white/10"
              >
                <Eye size={13} />
              </a>
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                title="Remove"
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-white hover:text-rose-600 dark:hover:bg-white/10"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Upload control */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length) onPick(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={full || busy}
        onClick={() => inputRef.current?.click()}
        className={`mt-auto flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-[11px] font-bold transition ${
          full
            ? "cursor-not-allowed border-slate-200 text-slate-300"
            : "border-blue-300 text-blue-900 hover:bg-blue-50 dark:border-sky-500/40 dark:text-sky-300 dark:hover:bg-white/10"
        }`}
      >
        {busy ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Uploading…
          </>
        ) : full ? (
          "Maximum files reached"
        ) : (
          <>
            <UploadCloud size={14} />
            Choose files to upload
          </>
        )}
      </button>

      <p className="mt-1.5 text-[10px] text-slate-400">
        Up to {MAX_PER_CATEGORY} files · Max 10 MB each · PDF, DOC, JPG, PNG
      </p>
    </div>
  );
}
