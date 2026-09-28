"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, LogIn } from "lucide-react";
import { signInAction, type AuthActionState } from "./actions";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { dict } = useI18n();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <LogIn className="h-4 w-4" aria-hidden />
      {pending ? dict.auth.signingIn : dict.auth.signIn}
    </Button>
  );
}

export function LoginForm({ configured }: { configured: boolean }) {
  const { dict } = useI18n();
  const [state, formAction] = useActionState<AuthActionState, FormData>(signInAction, {});

  const message =
    state.code === "inactive"
      ? dict.auth.inactive
      : state.code === "notConfigured"
        ? dict.auth.notConfigured
        : state.error
          ? dict.auth.invalidCredentials
          : null;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {!configured && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-foreground"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <span>{dict.auth.notConfigured}</span>
        </div>
      )}

      {message && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          <span>{message}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email" required>
          {dict.auth.email}
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="officer@roadgov.demo"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" required>
          {dict.auth.password}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
