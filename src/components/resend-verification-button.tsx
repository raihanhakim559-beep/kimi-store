"use client";

import { useState, useTransition } from "react";

import { requestActivationEmail } from "@/actions/onboarding";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResendVerificationButtonProps = {
  locale: string;
  className?: string;
};

export const ResendVerificationButton = ({
  locale,
  className,
}: ResendVerificationButtonProps) => {
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        setStatus("pending");
        setMessage(null);
        await requestActivationEmail(locale, "profile");
        setStatus("sent");
        setMessage("Activation link sent. Check your inbox.");
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "We couldn't send the email. Try again later.",
        );
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "w-full sm:w-auto",
          className,
          isPending && "opacity-70",
        )}
        disabled={isPending}
      >
        {isPending ? "Sending..." : "Resend verification"}
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
  );
};
