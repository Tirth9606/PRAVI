"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { ActionResult } from "@/lib/action-helpers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ServerAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

const FieldErrorContext = createContext<Record<string, string>>({});

export function useFieldError(name: string): string | undefined {
  return useContext(FieldErrorContext)[name];
}

/** Inline field error text, wired to the enclosing ActionForm result. */
export function FieldError({ name }: { name: string }) {
  const error = useFieldError(name);
  if (!error) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {error}
    </p>
  );
}

export function SubmitButton({
  children,
  className,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className} variant={variant}>
      {pending ? "…" : children}
    </Button>
  );
}

export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = true,
  onSuccess,
}: {
  action: ServerAction;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);
  const wasOk = useRef(false);

  useEffect(() => {
    if (state.ok && !wasOk.current) {
      wasOk.current = true;
      if (resetOnSuccess) formRef.current?.reset();
      onSuccess?.();
    }
    if (!state.ok) wasOk.current = false;
  }, [state, resetOnSuccess, onSuccess]);

  return (
    <FieldErrorContext.Provider value={state.fieldErrors ?? {}}>
      <form ref={formRef} action={formAction} className={cn("space-y-4", className)} noValidate>
        {state.message && (
          <div
            role="alert"
            className={cn(
              "flex items-start gap-2 rounded-md border p-3 text-sm",
              state.ok
                ? "border-success/40 bg-success/10"
                : "border-destructive/40 bg-destructive/10",
            )}
          >
            {state.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            )}
            <span>{state.message}</span>
          </div>
        )}
        {children}
      </form>
    </FieldErrorContext.Provider>
  );
}
