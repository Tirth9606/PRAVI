"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CONTRACTOR_STATUSES } from "@/lib/domain/enums";
import { upsertContractorAction } from "./actions";
import { useI18n } from "@/components/i18n/i18n-provider";
import { ActionForm, FieldError, SubmitButton } from "@/components/forms/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function ContractorForm() {
  const { dict, label } = useI18n();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Contractor
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <ActionForm action={upsertContractorAction} onSuccess={() => setOpen(false)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="c_name" required>Name</Label>
            <Input id="c_name" name="name" required />
            <FieldError name="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c_reg" required>Registration Number</Label>
            <Input id="c_reg" name="registration_number" required />
            <FieldError name="registration_number" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c_contact" required>Contact Person</Label>
            <Input id="c_contact" name="contact_person" required />
            <FieldError name="contact_person" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c_phone">Phone</Label>
            <Input id="c_phone" name="phone" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c_email">Email</Label>
            <Input id="c_email" name="email" type="email" />
            <FieldError name="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c_exp">Experience (years)</Label>
            <Input id="c_exp" name="experience_years" type="number" min="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c_status">{dict.common.status}</Label>
            <Select id="c_status" name="status" defaultValue="ACTIVE">
              {CONTRACTOR_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <SubmitButton>{dict.common.save}</SubmitButton>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            {dict.common.cancel}
          </Button>
        </div>
      </ActionForm>
    </div>
  );
}
