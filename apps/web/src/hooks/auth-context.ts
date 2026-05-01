import { createContext } from "react";
import { UserProfile } from "@personal-finance/shared";

export interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: (credential: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
