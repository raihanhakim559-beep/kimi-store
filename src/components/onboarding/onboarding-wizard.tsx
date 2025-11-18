"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useState,
  useTransition,
} from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type OnboardingWizardProps = {
  action: (formData: FormData) => Promise<unknown>;
  token: string;
  locale: string;
  email: string;
  defaultName: string;
  defaultPhone: string;
  defaultCountry: string;
  recoveredFromExpiredLink: boolean;
};

const inputClass =
  "w-full rounded-2xl border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const OnboardingWizard = ({
  action,
  token,
  locale,
  email,
  defaultName,
  defaultPhone,
  defaultCountry,
  recoveredFromExpiredLink,
}: OnboardingWizardProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [fields, setFields] = useState({
    name: defaultName ?? "",
    phone: defaultPhone ?? "",
    fullName: defaultName ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: (defaultCountry || "MY").toUpperCase(),
    acceptTerms: false,
  });

  const steps = useMemo(
    () => [
      {
        title: "Profile",
        description:
          "Basic contact details so we know who's activating the account.",
      },
      {
        title: "Shipping",
        description: "We'll store this address for future orders and receipts.",
      },
      {
        title: "Agreements",
        description: "Review the customer terms and activate your membership.",
      },
    ],
    [],
  );

  const totalSteps = steps.length;

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setError(null);
    setFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCountryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const uppercaseValue = event.target.value.toUpperCase();
    setError(null);
    setFields((prev) => ({
      ...prev,
      country: uppercaseValue,
    }));
  };

  const requireLength = (value: string, min: number) =>
    value.trim().length >= min;

  const stepValidators: Array<() => string | null> = [
    () => {
      if (!requireLength(fields.name, 2)) {
        return "Enter your full name.";
      }
      if (!requireLength(fields.phone, 6)) {
        return "Provide a valid phone number.";
      }
      return null;
    },
    () => {
      if (!requireLength(fields.fullName, 2)) {
        return "Add the recipient name for shipping.";
      }
      if (!requireLength(fields.line1, 3)) {
        return "Address line 1 is required.";
      }
      if (!requireLength(fields.city, 2)) {
        return "City is required.";
      }
      if (!requireLength(fields.state, 2)) {
        return "State or region is required.";
      }
      if (!requireLength(fields.postalCode, 3)) {
        return "Postal code is required.";
      }
      if (fields.country.trim().length !== 2) {
        return "Country must be a 2-letter code.";
      }
      return null;
    },
    () => {
      if (!fields.acceptTerms) {
        return "Accept the customer agreement to continue.";
      }
      return null;
    },
  ];

  const validateStep = (index: number) => {
    const message = stepValidators[index]?.();
    if (message) {
      setError(message);
      return false;
    }
    setError(null);
    return true;
  };

  const goToStep = (index: number) => {
    setActiveStep(Math.max(0, Math.min(index, totalSteps - 1)));
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      goToStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep === 0) return;
    setError(null);
    goToStep(activeStep - 1);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    for (let index = 0; index < stepValidators.length; index += 1) {
      const message = stepValidators[index]?.();
      if (message) {
        setError(message);
        goToStep(index);
        return;
      }
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("locale", locale);
    formData.append("name", fields.name.trim());
    formData.append("phone", fields.phone.trim());
    formData.append("fullName", fields.fullName.trim());
    formData.append("line1", fields.line1.trim());
    formData.append("line2", fields.line2.trim());
    formData.append("city", fields.city.trim());
    formData.append("state", fields.state.trim());
    formData.append("postalCode", fields.postalCode.trim());
    formData.append("country", fields.country.trim().toUpperCase());
    formData.append("acceptTerms", "on");

    startTransition(async () => {
      try {
        setError(null);
        await action(formData);
      } catch (err) {
        const fallback =
          err instanceof Error ? err.message : "Unable to complete onboarding.";
        setError(fallback);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {recoveredFromExpiredLink && (
        <p className="text-xs text-amber-600">
          Your previous activation link expired, but we restored the latest one
          automatically.
        </p>
      )}
      {steps.map((step, index) => (
        <div
          key={step.title}
          data-step-index={index}
          aria-hidden={activeStep !== index}
          className={activeStep === index ? "block" : "hidden"}
        >
          <Card>
            <CardHeader>
              <Badge
                variant="secondary"
                className="w-fit text-xs tracking-widest"
              >
                Step {index + 1} / {totalSteps}
              </Badge>
              <CardTitle className="mt-2 text-2xl font-semibold">
                {step.title}
              </CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {index === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Full name</span>
                    <input
                      className={inputClass}
                      name="name"
                      value={fields.name}
                      onChange={handleFieldChange}
                      disabled={isPending}
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <input
                      className="bg-muted/40 w-full rounded-2xl border px-4 py-3 text-sm"
                      value={email}
                      readOnly
                    />
                  </label>
                  <label className="space-y-1 text-sm md:col-span-2">
                    <span className="text-muted-foreground">Phone</span>
                    <input
                      className={inputClass}
                      name="phone"
                      value={fields.phone}
                      onChange={handleFieldChange}
                      disabled={isPending}
                      type="tel"
                    />
                  </label>
                </div>
              )}
              {index === 1 && (
                <div className="space-y-4">
                  <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">
                      Recipient name
                    </span>
                    <input
                      className={inputClass}
                      name="fullName"
                      value={fields.fullName}
                      onChange={handleFieldChange}
                      disabled={isPending}
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">
                      Address line 1
                    </span>
                    <input
                      className={inputClass}
                      name="line1"
                      value={fields.line1}
                      onChange={handleFieldChange}
                      disabled={isPending}
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">
                      Address line 2
                    </span>
                    <input
                      className={inputClass}
                      name="line2"
                      value={fields.line2}
                      onChange={handleFieldChange}
                      disabled={isPending}
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm">
                      <span className="text-muted-foreground">City</span>
                      <input
                        className={inputClass}
                        name="city"
                        value={fields.city}
                        onChange={handleFieldChange}
                        disabled={isPending}
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="text-muted-foreground">
                        State / Region
                      </span>
                      <input
                        className={inputClass}
                        name="state"
                        value={fields.state}
                        onChange={handleFieldChange}
                        disabled={isPending}
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm">
                      <span className="text-muted-foreground">Postal code</span>
                      <input
                        className={inputClass}
                        name="postalCode"
                        value={fields.postalCode}
                        onChange={handleFieldChange}
                        disabled={isPending}
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="text-muted-foreground">Country</span>
                      <input
                        className={inputClass}
                        name="country"
                        value={fields.country}
                        onChange={handleCountryChange}
                        disabled={isPending}
                        maxLength={2}
                      />
                    </label>
                  </div>
                </div>
              )}
              {index === 2 && (
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={fields.acceptTerms}
                      onChange={handleFieldChange}
                      disabled={isPending}
                    />
                    <span>
                      I agree to the terms, privacy policy, and shipping
                      policies.
                    </span>
                  </label>
                  <Separator />
                  <p className="text-muted-foreground text-sm">
                    Activating your account grants access to checkout, shipping
                    updates, and customer support.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "flex-1 sm:flex-none",
                )}
                disabled={activeStep === 0 || isPending}
              >
                Previous
              </button>
              {index < totalSteps - 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "flex-1 sm:flex-none",
                  )}
                  disabled={isPending}
                >
                  Next
                </button>
              )}
              {index === totalSteps - 1 && (
                <button
                  type="submit"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "flex-1 sm:flex-none",
                  )}
                  disabled={isPending}
                >
                  {isPending ? "Activating..." : "Activate account"}
                </button>
              )}
            </CardFooter>
          </Card>
        </div>
      ))}
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  );
};
