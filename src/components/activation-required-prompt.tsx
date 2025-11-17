"use client";

import { useState, useTransition } from "react";

import { requestActivationEmail } from "@/actions/onboarding";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActivationRequiredPromptProps = {
  locale: string;
  totalLabel: string;
};

export const ActivationRequiredPrompt = ({
  locale,
  totalLabel,
}: ActivationRequiredPromptProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();

  const handleResend = () => {
    startTransition(async () => {
      try {
        await requestActivationEmail(locale, "checkout");
        setStatus("sent");
        setMessage(
          "Activation email sent. Check your inbox for the onboarding link.",
        );
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "We couldn’t send the email. Try again or contact support.",
        );
      }
    });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={buttonVariants({ size: "lg", className: "w-full" })}
        onClick={() => setIsOpen(true)}
      >
        Confirm &amp; pay {totalLabel}
      </button>
      <p className="text-muted-foreground text-xs">
        Your profile must be verified before checkout. Complete onboarding to
        unlock payments.
      </p>
      {isOpen && (
        <div className="bg-background/80 fixed inset-0 z-40 flex items-center justify-center px-4 backdrop-blur">
          <div className="bg-card text-card-foreground relative w-full max-w-md space-y-4 rounded-3xl border p-6 shadow-2xl">
            <button
              type="button"
              className="text-muted-foreground absolute top-4 right-4 text-sm"
              onClick={() => {
                setIsOpen(false);
                setMessage(null);
                setStatus("idle");
              }}
            >
              Close
            </button>
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
                Verification needed
              </p>
              <h3 className="text-2xl font-semibold">Activate your account</h3>
              <p className="text-muted-foreground text-sm">
                We emailed you a secure onboarding link. Finish the activation
                steps (phone, address, agreement) before you can place orders.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border p-4 text-sm">
              <p>
                Didn&apos;t get the email? Tap below and we&apos;ll resend the
                activation link.
              </p>
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "secondary", className: "w-full" }),
                  isPending && "opacity-70",
                )}
                disabled={isPending}
                onClick={handleResend}
              >
                {isPending ? "Sending..." : "Resend activation email"}
              </button>
              {message && (
                <p
                  className={cn(
                    "text-xs",
                    status === "sent"
                      ? "text-emerald-600"
                      : status === "error"
                        ? "text-destructive"
                        : "text-muted-foreground",
                  )}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
