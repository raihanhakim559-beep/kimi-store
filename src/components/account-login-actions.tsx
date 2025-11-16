"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AccountLoginActionsProps = {
  callbackUrl?: string;
};

const providers = [{ label: "Continue with GitHub", id: "github" }];

export const AccountLoginActions = ({
  callbackUrl = "/account/dashboard",
}: AccountLoginActionsProps) => {
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  const handleProviderClick = async (providerId: string) => {
    setPendingProvider(providerId);
    await signIn(providerId, { callbackUrl });
    setPendingProvider(null);
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {providers.map((provider) => (
        <button
          key={provider.id}
          className={cn(
            buttonVariants({
              variant: provider.id === "github" ? "default" : "outline",
            }),
            "w-full",
          )}
          onClick={() => handleProviderClick(provider.id)}
          disabled={pendingProvider === provider.id}
        >
          {pendingProvider === provider.id ? "Redirecting…" : provider.label}
        </button>
      ))}
    </div>
  );
};
