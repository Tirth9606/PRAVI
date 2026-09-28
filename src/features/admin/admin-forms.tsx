"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { USER_ROLES, USER_STATUSES } from "@/lib/domain/enums";
import { updateUserAction, inviteUserAction, upsertDepartmentAction } from "./actions";
import { useI18n } from "@/components/i18n/i18n-provider";
import { ActionForm, FieldError, SubmitButton } from "@/components/forms/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { AppUser, Department } from "@/types/models";

function Wrap({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} required={required}>{label}</Label>
      {children}
    </div>
  );
}

export function EditUserButton({ user, departments }: { user: AppUser; departments: Department[] }) {
  const { dict, label } = useI18n();
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" /> {dict.common.edit}
      </Button>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-left">
      <ActionForm action={updateUserAction} onSuccess={() => setOpen(false)}>
        <input type="hidden" name="id" value={user.id} />
        <input type="hidden" name="email" value={user.email} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Wrap id={`u_name_${user.id}`} label="Name" required><Input id={`u_name_${user.id}`} name="name" defaultValue={user.name} required /></Wrap>
          <Wrap id={`u_phone_${user.id}`} label="Phone"><Input id={`u_phone_${user.id}`} name="phone" defaultValue={user.phone ?? ""} /></Wrap>
          <Wrap id={`u_role_${user.id}`} label="Role" required>
            <Select id={`u_role_${user.id}`} name="role" defaultValue={user.role}>
              {USER_ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}
            </Select>
          </Wrap>
          <Wrap id={`u_status_${user.id}`} label={dict.common.status} required>
            <Select id={`u_status_${user.id}`} name="status" defaultValue={user.status}>
              {USER_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </Select>
          </Wrap>
          <Wrap id={`u_dept_${user.id}`} label={dict.nav.departments}>
            <Select id={`u_dept_${user.id}`} name="department_id" defaultValue={user.department_id ?? ""}>
              <option value="">{dict.common.none}</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Wrap>
        </div>
        <div className="flex gap-2">
          <SubmitButton>{dict.common.save}</SubmitButton>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{dict.common.cancel}</Button>
        </div>
      </ActionForm>
    </div>
  );
}

export function InviteUserForm({ departments }: { departments: Department[] }) {
  const { dict, label } = useI18n();
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Invite User
      </Button>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <ActionForm action={inviteUserAction} onSuccess={() => setOpen(false)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Wrap id="iv_name" label="Name" required><Input id="iv_name" name="name" required /></Wrap>
          <Wrap id="iv_email" label="Email" required><Input id="iv_email" name="email" type="email" required /><FieldError name="email" /></Wrap>
          <Wrap id="iv_role" label="Role" required>
            <Select id="iv_role" name="role" defaultValue="FIELD_INSPECTOR">
              {USER_ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}
            </Select>
          </Wrap>
          <Wrap id="iv_dept" label={dict.nav.departments}>
            <Select id="iv_dept" name="department_id" defaultValue="">
              <option value="">{dict.common.none}</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Wrap>
        </div>
        <p className="text-xs text-muted-foreground">
          Requires <code>SUPABASE_SERVICE_ROLE_KEY</code> server-side. See README &gt; Demo flow.
        </p>
        <div className="flex gap-2">
          <SubmitButton>Send invite</SubmitButton>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{dict.common.cancel}</Button>
        </div>
      </ActionForm>
    </div>
  );
}

export function DepartmentForm() {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Department
      </Button>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <ActionForm action={upsertDepartmentAction} onSuccess={() => setOpen(false)}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Wrap id="dp_name" label="Name" required><Input id="dp_name" name="name" required /></Wrap>
          <Wrap id="dp_code" label="Code" required><Input id="dp_code" name="code" required placeholder="PWD-AHM" /></Wrap>
          <Wrap id="dp_email" label="Contact Email"><Input id="dp_email" name="contact_email" type="email" /><FieldError name="contact_email" /></Wrap>
        </div>
        <div className="flex gap-2">
          <SubmitButton>{dict.common.save}</SubmitButton>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{dict.common.cancel}</Button>
        </div>
      </ActionForm>
    </div>
  );
}
