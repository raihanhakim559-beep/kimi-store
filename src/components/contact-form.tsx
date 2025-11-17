"use client";

import { useActionState } from "react";

import {
  initialContactFormState,
  submitContactRequest,
} from "@/actions/contact";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ContactForm = () => {
  const [state, formAction] = useActionState(
    submitContactRequest,
    initialContactFormState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase">
          Name
        </label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Amina Hassan"
        />
        {state.fieldErrors?.name && (
          <p className="text-destructive mt-1 text-xs">
            {state.fieldErrors.name}
          </p>
        )}
      </div>
      <div>
        <label className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="you@example.com"
        />
        {state.fieldErrors?.email && (
          <p className="text-destructive mt-1 text-xs">
            {state.fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase">
          Order ID (optional)
        </label>
        <input
          name="orderId"
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="ORD-49213"
        />
        {state.fieldErrors?.orderId && (
          <p className="text-destructive mt-1 text-xs">
            {state.fieldErrors.orderId}
          </p>
        )}
      </div>
      <div>
        <label className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase">
          Message
        </label>
        <textarea
          name="message"
          rows={4}
          required
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Share the issue, fit question, or delivery update you need."
        />
        {state.fieldErrors?.message && (
          <p className="text-destructive mt-1 text-xs">
            {state.fieldErrors.message}
          </p>
        )}
      </div>
      {state.status === "success" ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {state.message}
        </div>
      ) : null}
      <button
        className={cn(
          buttonVariants({ size: "lg", className: "w-full" }),
          state.status === "success" && "pointer-events-none opacity-70",
        )}
      >
        {state.status === "success" ? "Message received" : "Send message"}
      </button>
    </form>
  );
};
