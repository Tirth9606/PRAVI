"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordDocumentAction } from "./actions";
import { DOCUMENT_CATEGORIES, type StorageBucket } from "@/lib/domain/enums";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

/** Uploads to a private Storage bucket under `${uid}/...`, then records metadata. */
export function DocumentUpload({
  bucket = "project-documents",
  projectId,
  roadId,
}: {
  bucket?: StorageBucket;
  projectId?: string;
  roadId?: string;
}) {
  const { dict, label } = useI18n();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("Not signed in.");
      const path = `${uid}/${projectId ?? roadId ?? "misc"}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (upErr) throw new Error(upErr.message);

      const fd = new FormData();
      fd.set("bucket", bucket);
      fd.set("storage_path", path);
      fd.set("file_name", file.name);
      fd.set("mime_type", file.type);
      fd.set("size_bytes", String(file.size));
      fd.set("category", category);
      if (projectId) fd.set("project_id", projectId);
      if (roadId) fd.set("road_id", roadId);
      const res = await recordDocumentAction({ ok: false }, fd);
      if (!res.ok) throw new Error(res.message ?? "Failed to record document.");

      setMsg({ ok: true, text: dict.common.created });
      setFile(null);
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1.5">
        <Label htmlFor="doc_category">Category</Label>
        <Select id="doc_category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-56">
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {label(c)}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="doc_file">File (PDF/JPG/PNG, ≤15MB)</Label>
        <Input
          id="doc_file"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-64"
        />
      </div>
      <Button type="button" onClick={handleUpload} disabled={!file || busy}>
        <Upload className="h-4 w-4" /> {busy ? "…" : "Upload"}
      </Button>
      {msg && (
        <p className={msg.ok ? "text-xs text-success" : "text-xs text-destructive"} role="alert">
          {msg.text}
        </p>
      )}
    </div>
  );
}
