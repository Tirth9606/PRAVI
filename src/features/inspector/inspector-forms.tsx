"use client";

import { QUALITY_STATUSES, ROAD_CONDITIONS, PRIORITIES, DEFECT_TYPES } from "@/lib/domain/enums";
import {
  submitConstructionInspectionAction,
  submitRoadInspectionAction,
  submitDefectAction,
} from "./actions";
import { useI18n } from "@/components/i18n/i18n-provider";
import { ActionForm, FieldError, SubmitButton } from "@/components/forms/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/states";
import type { RoadProject, Road } from "@/types/models";

function Wrap({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} required={required}>{label}</Label>
      {children}
    </div>
  );
}

export function ConstructionInspectionForm({ projects }: { projects: RoadProject[] }) {
  const { dict, label } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const eligible = projects.filter((p) => p.status === "UNDER_CONSTRUCTION");
  if (eligible.length === 0) {
    return <EmptyState title="No assigned projects under construction" description="You can submit construction inspections once assigned to an active project." />;
  }
  return (
    <ActionForm action={submitConstructionInspectionAction}>
      <Wrap id="ci_project" label={dict.nav.projects} required>
        <Select id="ci_project" name="project_id" required>
          {eligible.map((p) => <option key={p.id} value={p.id}>{p.project_code} — {p.road_name}</option>)}
        </Select>
      </Wrap>
      <div className="grid gap-3 sm:grid-cols-2">
        <Wrap id="ci_date" label={dict.fields.date} required><Input id="ci_date" name="inspection_date" type="date" defaultValue={today} required /></Wrap>
        <Wrap id="ci_prog" label={dict.fields.progress + " (%)"} required>
          <Input id="ci_prog" name="progress_percentage" type="number" min="0" max="100" required />
          <FieldError name="progress_percentage" />
        </Wrap>
        <Wrap id="ci_qual" label={dict.fields.quality} required>
          <Select id="ci_qual" name="quality_status" defaultValue="SATISFACTORY">
            {QUALITY_STATUSES.map((q) => <option key={q} value={q}>{label(q)}</option>)}
          </Select>
        </Wrap>
      </div>
      <Wrap id="ci_issues" label={dict.fields.issuesFound}><Textarea id="ci_issues" name="issues_found" rows={2} /></Wrap>
      <Wrap id="ci_photos" label="Photo URLs (one per line)"><Textarea id="ci_photos" name="photo_urls" rows={2} placeholder="https://…" /></Wrap>
      <SubmitButton>{dict.common.submit}</SubmitButton>
    </ActionForm>
  );
}

export function RoadInspectionForm({ roads }: { roads: Road[] }) {
  const { dict, label } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  if (roads.length === 0) {
    return <EmptyState title="No assigned roads" description="You can submit road inspections once assigned to a road." />;
  }
  return (
    <ActionForm action={submitRoadInspectionAction}>
      <Wrap id="ri_road" label={dict.fields.road} required>
        <Select id="ri_road" name="road_id" required>
          {roads.map((r) => <option key={r.id} value={r.id}>{r.road_code} — {r.road_name}</option>)}
        </Select>
      </Wrap>
      <div className="grid gap-3 sm:grid-cols-2">
        <Wrap id="ri_date" label={dict.fields.date} required><Input id="ri_date" name="inspection_date" type="date" defaultValue={today} required /></Wrap>
        <Wrap id="ri_cond" label={dict.fields.condition} required>
          <Select id="ri_cond" name="condition" defaultValue="GOOD">
            {ROAD_CONDITIONS.map((c) => <option key={c} value={c}>{label(c)}</option>)}
          </Select>
        </Wrap>
        <Wrap id="ri_sev" label={dict.fields.severity} required>
          <Select id="ri_sev" name="severity" defaultValue="LOW">
            {PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}
          </Select>
        </Wrap>
      </div>
      <Wrap id="ri_rem" label={dict.fields.remarks}><Textarea id="ri_rem" name="remarks" rows={2} /></Wrap>
      <Wrap id="ri_photos" label="Photo URLs (one per line)"><Textarea id="ri_photos" name="photo_urls" rows={2} placeholder="https://…" /></Wrap>
      <SubmitButton>{dict.common.submit}</SubmitButton>
    </ActionForm>
  );
}

export function InspectorDefectForm({ roads }: { roads: Road[] }) {
  const { dict, label } = useI18n();
  if (roads.length === 0) {
    return <EmptyState title="No assigned roads" description="You can report defects on roads you are assigned to." />;
  }
  return (
    <ActionForm action={submitDefectAction}>
      <Wrap id="df_road" label={dict.fields.road} required>
        <Select id="df_road" name="road_id" required>
          {roads.map((r) => <option key={r.id} value={r.id}>{r.road_code} — {r.road_name}</option>)}
        </Select>
      </Wrap>
      <div className="grid gap-3 sm:grid-cols-2">
        <Wrap id="df_type" label={dict.fields.type} required>
          <Select id="df_type" name="type" required>
            {DEFECT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
          </Select>
        </Wrap>
        <Wrap id="df_sev" label={dict.fields.severity} required>
          <Select id="df_sev" name="severity" defaultValue="MEDIUM">
            {PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}
          </Select>
        </Wrap>
        <Wrap id="df_qty" label={dict.fields.quantity}><Input id="df_qty" name="quantity" type="number" min="0" step="0.01" defaultValue={1} /></Wrap>
      </div>
      <Wrap id="df_desc" label={dict.common.optional}><Textarea id="df_desc" name="description" rows={2} /></Wrap>
      <SubmitButton>{dict.common.create}</SubmitButton>
    </ActionForm>
  );
}
