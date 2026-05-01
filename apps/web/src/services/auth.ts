import { apiRequest } from "@/services/http";
import { AuthResponse, UserResponse } from "@/types/api";

export function loginWithGoogle(credential: string) {
  return apiRequest<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function fetchCurrentUser() {
  return apiRequest<UserResponse>("/auth/me");
}

export function logoutRequest() {
  return apiRequest<void>("/auth/logout", { method: "POST" });
}
