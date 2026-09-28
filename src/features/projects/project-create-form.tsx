"use client";

import { ROAD_TYPES } from "@/lib/domain/enums";
import { createProjectAction } from "./actions";
import { useI18n } from "@/components/i18n/i18n-provider";
import { ActionForm, FieldError, SubmitButton } from "@/components/forms/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Department } from "@/types/models";

export function ProjectCreateForm({ departments }: { departments: Department[] }) {
  const { dict, label } = useI18n();

  return (
    <ActionForm action={createProjectAction} resetOnSuccess={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="project_code" label={dict.fields.projectCode} required>
          <Input id="project_code" name="project_code" required placeholder="RP-2026-001" />
        </Field>
        <Field name="project_name" label={dict.fields.projectName} required>
          <Input id="project_name" name="project_name" required />
        </Field>
        <Field name="road_name" label={dict.fields.roadName} required>
          <Input id="road_name" name="road_name" required />
        </Field>
        <Field name="location" label={dict.fields.location} required>
          <Input id="location" name="location" required />
        </Field>
        <Field name="ward" label={dict.fields.ward} required>
          <Input id="ward" name="ward" required />
        </Field>
        <Field name="area" label={dict.fields.area}>
          <Input id="area" name="area" />
        </Field>
        <Field name="road_type" label={dict.fields.roadType} required>
          <Select id="road_type" name="road_type" required defaultValue="URBAN_ROAD">
            {ROAD_TYPES.map((t) => (
              <option key={t} value={t}>
                {label(t)}
              </option>
            ))}
          </Select>
        </Field>
        <Field name="length_km" label={dict.fields.lengthKm} required>
          <Input id="length_km" name="length_km" type="number" step="0.001" min="0" required />
        </Field>
        <Field name="estimated_cost" label={dict.fields.estimatedCost} required>
          <Input id="estimated_cost" name="estimated_cost" type="number" step="1" min="0" required />
        </Field>
        <Field name="estimated_duration_months" label={dict.fields.duration} required>
          <Input id="estimated_duration_months" name="estimated_duration_months" type="number" step="1" min="1" required />
        </Field>
        <Field name="planned_start_date" label={dict.fields.date + " (start)"}>
          <Input id="planned_start_date" name="planned_start_date" type="date" />
        </Field>
        <Field name="planned_end_date" label={dict.fields.date + " (end)"}>
          <Input id="planned_end_date" name="planned_end_date" type="date" />
        </Field>
        {departments.length > 0 && (
          <Field name="department_id" label={dict.nav.departments}>
            <Select id="department_id" name="department_id" defaultValue="">
              <option value="">{dict.common.none}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>
      <Field name="project_reason" label={dict.fields.reason} required>
        <Textarea id="project_reason" name="project_reason" required rows={3} />
      </Field>
      <div className="flex justify-end">
        <SubmitButton>{dict.common.create}</SubmitButton>
      </div>
    </ActionForm>
  );
}

function Field({
  name,
  label,
  required,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      {children}
      <FieldError name={name} />
    </div>
  );
}
