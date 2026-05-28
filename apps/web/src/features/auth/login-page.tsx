import { GoogleLogin } from "@react-oauth/google";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBackendReadiness } from "@/hooks/use-backend-readiness";
import { env } from "@/lib/env";
import { useAuth } from "@/hooks/use-auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const { isReady, isChecking, message } = useBackendReadiness();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[340px] space-y-10">
        {/* Logo + title */}
        <div className="space-y-5 text-center">
          <img src="/icons/logo-n.png" alt="NORTH" className="mx-auto h-16 w-auto object-contain" />
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">NORTH</h1>
            <p className="mt-2.5 text-sm text-muted-foreground">
              Gestiona tus finanzas personales en un solo lugar.
            </p>
          </div>
        </div>

        {/* Auth section */}
        {env.googleClientId ? (
          <div className="space-y-3">
            {!isReady && (
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3.5">
                <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isChecking ? "Comprobando disponibilidad del servidor…" : message}
                </p>
              </div>
            )}
            {isReady && (
              <div className="w-full overflow-hidden rounded-full">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (!credentialResponse.credential) {
                      toast.error("Google no devolvió una credencial válida");
                      return;
                    }
                    try {
                      await signInWithGoogle(credentialResponse.credential);
                      toast.success("Sesión iniciada correctamente");
                      navigate("/", { replace: true });
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión");
                    }
                  }}
                  onError={() => toast.error("Falló la autenticación con Google")}
                  theme="outline"
                  text="continue_with"
                  shape="pill"
                  size="large"
                  width="340"
                />
              </div>
            )}
          </div>
        ) : (
          <p className="rounded-2xl bg-white/[0.04] p-4 text-center text-sm text-muted-foreground">
            Configura VITE_GOOGLE_CLIENT_ID para habilitar el login con Google.
          </p>
        )}
      </div>
    </div>
  );
}
