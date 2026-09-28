"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ROAD_TYPES, ROAD_CONDITIONS, PRIORITIES, DEFECT_TYPES } from "@/lib/domain/enums";
import { useI18n } from "@/components/i18n/i18n-provider";
import { ActionForm, FieldError, SubmitButton } from "@/components/forms/action-form";
import { ActionButton } from "@/components/forms/action-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertRoadAction,
  createDefectAction,
  createMaintenanceAction,
  approveMaintenanceAction,
  startMaintenanceAction,
  completeMaintenanceAction,
} from "./actions";
import { assignInspectorToRoadAction } from "@/features/assignments/actions";
import type { AppUser } from "@/types/models";
import type { MaintenanceStatus } from "@/lib/domain/enums";

export function RoadForm() {
  const { dict, label } = useI18n();
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Register Road
      </Button>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <ActionForm action={upsertRoadAction} onSuccess={() => setOpen(false)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldWrap id="road_code" label="Road Code" required><Input id="road_code" name="road_code" required placeholder="RD-URB-001" /></FieldWrap>
          <FieldWrap id="road_name" label={dict.fields.roadName} required><Input id="road_name" name="road_name" required /></FieldWrap>
          <FieldWrap id="location" label={dict.fields.location} required><Input id="location" name="location" required /></FieldWrap>
          <FieldWrap id="ward" label={dict.fields.ward} required><Input id="ward" name="ward" required /></FieldWrap>
          <FieldWrap id="road_type" label={dict.fields.roadType} required>
            <Select id="road_type" name="road_type" defaultValue="URBAN_ROAD">
              {ROAD_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
            </Select>
          </FieldWrap>
          <FieldWrap id="length_km" label={dict.fields.lengthKm} required><Input id="length_km" name="length_km" type="number" step="0.001" min="0" required /></FieldWrap>
          <FieldWrap id="current_condition" label={dict.fields.condition}>
            <Select id="current_condition" name="current_condition" defaultValue="GOOD">
              {ROAD_CONDITIONS.map((c) => <option key={c} value={c}>{label(c)}</option>)}
            </Select>
          </FieldWrap>
          <FieldWrap id="priority" label={dict.fields.priority}>
            <Select id="priority" name="priority" defaultValue="MEDIUM">
              {PRIORITIES.map((pr) => <option key={pr} value={pr}>{label(pr)}</option>)}
            </Select>
          </FieldWrap>
        </div>
        <div className="flex gap-2">
          <SubmitButton>{dict.common.save}</SubmitButton>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{dict.common.cancel}</Button>
        </div>
      </ActionForm>
    </div>
  );
}

export function DefectForm({ roadId }: { roadId: string }) {
  const { dict, label } = useI18n();
  return (
    <ActionForm action={createDefectAction} className="max-w-lg">
      <input type="hidden" name="road_id" value={roadId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldWrap id="d_type" label={dict.fields.type} required>
          <Select id="d_type" name="type" required>
            {DEFECT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
          </Select>
        </FieldWrap>
        <FieldWrap id="d_sev" label={dict.fields.severity} required>
          <Select id="d_sev" name="severity" defaultValue="MEDIUM">
            {PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}
          </Select>
        </FieldWrap>
        <FieldWrap id="d_qty" label={dict.fields.quantity}><Input id="d_qty" name="quantity" type="number" min="0" step="0.01" defaultValue={1} /></FieldWrap>
      </div>
      <FieldWrap id="d_desc" label={dict.common.optional}><Textarea id="d_desc" name="description" rows={2} /></FieldWrap>
      <SubmitButton>{dict.common.create}</SubmitButton>
    </ActionForm>
  );
}

export function MaintenanceForm({ roadId }: { roadId: string }) {
  const { dict, label } = useI18n();
  return (
    <ActionForm action={createMaintenanceAction} className="max-w-lg">
      <input type="hidden" name="road_id" value={roadId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldWrap id="m_work" label={dict.fields.workType} required><Input id="m_work" name="work_type" required placeholder="Pothole patching" /></FieldWrap>
        <FieldWrap id="m_pri" label={dict.fields.priority}>
          <Select id="m_pri" name="priority" defaultValue="MEDIUM">
            {PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}
          </Select>
        </FieldWrap>
        <FieldWrap id="m_cost" label={dict.fields.estimatedCost} required><Input id="m_cost" name="estimated_cost" type="number" min="0" required /></FieldWrap>
      </div>
      <FieldWrap id="m_rem" label={dict.fields.remarks}><Textarea id="m_rem" name="remarks" rows={2} /></FieldWrap>
      <SubmitButton>{dict.common.create}</SubmitButton>
    </ActionForm>
  );
}

export function MaintenanceActions({ id, status }: { id: string; status: MaintenanceStatus }) {
  const [completing, setCompleting] = useState(false);
  const { dict } = useI18n();
  const today = new Date().toISOString().slice(0, 10);

  if (status === "PENDING") {
    return <ActionButton size="sm" action={() => approveMaintenanceAction(id)}>{dict.common.approve}</ActionButton>;
  }
  if (status === "APPROVED") {
    return <ActionButton size="sm" variant="outline" action={() => startMaintenanceAction(id)}>Start</ActionButton>;
  }
  if (status === "IN_PROGRESS") {
    if (!completing) {
      return <Button size="sm" variant="outline" onClick={() => setCompleting(true)}>Complete</Button>;
    }
    return (
      <ActionForm action={completeMaintenanceAction} className="flex flex-wrap items-end gap-2 space-y-0" onSuccess={() => setCompleting(false)}>
        <input type="hidden" name="id" value={id} />
        <div className="space-y-1">
          <Label htmlFor={`ac-${id}`} className="text-xs">Actual Cost</Label>
          <Input id={`ac-${id}`} name="actual_cost" type="number" min="0" className="h-8 w-28" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`cd-${id}`} className="text-xs">Completion</Label>
          <Input id={`cd-${id}`} name="completion_date" type="date" defaultValue={today} className="h-8" required />
        </div>
        <SubmitButton>{dict.common.save}</SubmitButton>
      </ActionForm>
    );
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}

export function AssignInspectorRoadForm({ roadId, inspectors }: { roadId: string; inspectors: AppUser[] }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={assignInspectorToRoadAction} className="max-w-md">
      <input type="hidden" name="road_id" value={roadId} />
      <FieldWrap id="ri_inspector" label={dict.fields.inspector} required>
        <Select id="ri_inspector" name="inspector_id" required>
          {inspectors.length === 0 && <option value="">— no inspectors —</option>}
          {inspectors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </Select>
      </FieldWrap>
      <SubmitButton>Assign</SubmitButton>
    </ActionForm>
  );
}

function FieldWrap({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} required={required}>{label}</Label>
      {children}
      <FieldError name={id.replace(/^[a-z]+_/, "")} />
    </div>
  );
}
