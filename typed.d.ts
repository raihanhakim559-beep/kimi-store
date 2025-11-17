import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultUser & {
      id: string;
      stripeCustomerId: string;
      isActive: boolean;
      phone?: string | null;
      hasAcceptedTerms?: boolean;
    };
  }
  interface User extends DefaultUser {
    stripeCustomerId: string;
    isActive: boolean;
    phone?: string | null;
    hasAcceptedTerms?: boolean;
  }
}
