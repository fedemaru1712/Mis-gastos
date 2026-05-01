import { useEffect, useState } from "react";
import { fetchCurrentUser, loginWithGoogle, logoutRequest } from "@/services/auth";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/services/http";
import { AuthContext } from "@/hooks/auth-context";
import { UserProfile } from "@personal-finance/shared";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!getStoredToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUser();
        setUser(response.user);
      } catch {
        clearStoredToken();
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, []);

  async function signInWithGoogle(credential: string) {
    const response = await loginWithGoogle(credential);
    setStoredToken(response.token);
    setUser(response.user);
  }

  async function signOut() {
    try {
      await logoutRequest();
    } finally {
      clearStoredToken();
      setUser(null);
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>;
}
