"use server";

import { revalidatePath } from "next/cache";
import { authorize, ok, toActionError, fail, type ActionResult } from "@/lib/action-helpers";
import { recordAudit } from "@/lib/audit";
import { DOCUMENT_CATEGORIES, STORAGE_BUCKETS } from "@/lib/domain/enums";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME = /^(image\/(png|jpe?g|webp)|application\/pdf)$/;

/** Record document metadata after a client-side upload to Storage. Validates
 *  file type/size and that the bucket/category are known (spec §30). */
export async function recordDocumentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("document.upload");
    const bucket = String(formData.get("bucket") ?? "");
    const storagePath = String(formData.get("storage_path") ?? "");
    const fileName = String(formData.get("file_name") ?? "");
    const mimeType = String(formData.get("mime_type") ?? "");
    const sizeBytes = Number(formData.get("size_bytes") ?? 0);
    const category = String(formData.get("category") ?? "");
    const projectId = String(formData.get("project_id") ?? "") || null;
    const roadId = String(formData.get("road_id") ?? "") || null;

    if (!STORAGE_BUCKETS.includes(bucket as (typeof STORAGE_BUCKETS)[number])) return fail("Invalid bucket.");
    if (!DOCUMENT_CATEGORIES.includes(category as (typeof DOCUMENT_CATEGORIES)[number])) return fail("Invalid category.");
    if (!storagePath || !fileName) return fail("Missing upload path.");
    if (mimeType && !ALLOWED_MIME.test(mimeType)) return fail("Only PDF and image files are allowed.");
    if (sizeBytes > MAX_BYTES) return fail("File exceeds the 15 MB limit.");
    if (!projectId && !roadId) return fail("Document must belong to a project or road.");

    const { error } = await supabase.from("documents").insert({
      category,
      bucket,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: mimeType || null,
      size_bytes: sizeBytes || null,
      project_id: projectId,
      road_id: roadId,
      uploaded_by: ctx.profile.id,
    });
    if (error) throw new Error(error.message);

    await recordAudit({
      userId: ctx.profile.id,
      action: "CREATE",
      entityType: "document",
      entityId: projectId ?? roadId ?? undefined,
      newValue: { category, file_name: fileName },
    });

    if (projectId) revalidatePath(`/officer/projects/${projectId}`);
    if (roadId) revalidatePath(`/officer/roads/${roadId}`);
    return ok(undefined, "Document recorded.");
  } catch (err) {
    return toActionError(err);
  }
}

/** Generate a short-lived signed URL for a private document (spec §30). */
export async function getDocumentUrlAction(documentId: string): Promise<ActionResult<{ url: string }>> {
  try {
    const { supabase } = await authorize("document.upload");
    const { data: doc } = await supabase
      .from("documents")
      .select("bucket, storage_path")
      .eq("id", documentId)
      .maybeSingle();
    if (!doc) return fail("Document not found.");
    const { data, error } = await supabase.storage.from(doc.bucket).createSignedUrl(doc.storage_path, 60);
    if (error || !data) return fail(error?.message ?? "Could not create link.");
    return ok({ url: data.signedUrl });
  } catch (err) {
    return toActionError(err) as ActionResult<{ url: string }>;
  }
}
