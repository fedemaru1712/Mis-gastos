import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, LoaderCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBackendReadiness } from "@/hooks/use-backend-readiness";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";
import { useAuth } from "@/hooks/use-auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const { isReady, isChecking, message } = useBackendReadiness();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-2xl shadow-black/20">
        <CardHeader className="items-center text-center">
          <div className="mb-2 rounded-3xl bg-primary p-4 text-primary-foreground shadow-soft">
            <Wallet className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl">Controla tus ingresos y gastos</CardTitle>
          <CardDescription>
            {isReady
              ? "Inicia sesión con Google para acceder a tu dashboard personal y gestionar solo tus datos."
              : "Estamos despertando el servidor para que el acceso funcione correctamente."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {env.googleClientId ? (
            <div className="space-y-3">
              {!isReady && (
                <div className="rounded-3xl border border-border/80 bg-secondary/35 p-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border/70 bg-background/70 p-4">
                    <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{message}</p>
                      <p className="text-xs text-muted-foreground">
                        {isChecking
                          ? "Mientras Render arranca, el acceso con Google permanece bloqueado."
                          : "Comprobando disponibilidad del servidor."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {isReady && (
                <div className="rounded-3xl border border-border/80 bg-secondary/40 p-3">
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-primary/10" />
                    <Button
                      type="button"
                      className="h-14 w-full justify-between rounded-2xl border border-border/70 bg-background/80 px-4 text-left text-foreground hover:bg-background/80"
                      variant="outline"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#4285F4]">
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                            <path d="M21.81 10.04H12.2v3.92h5.51c-.24 1.26-.96 2.33-2.04 3.04v2.52h3.29c1.92-1.77 3.03-4.37 3.03-7.45 0-.68-.06-1.35-.18-2.03Z" />
                            <path d="M12.2 22c2.75 0 5.06-.91 6.75-2.48l-3.29-2.52c-.91.61-2.08.97-3.46.97-2.66 0-4.91-1.8-5.71-4.21H3.09v2.6A10.19 10.19 0 0 0 12.2 22Z" />
                            <path d="M6.49 13.76a6.1 6.1 0 0 1 0-3.87v-2.6H3.09a10.18 10.18 0 0 0 0 9.07l3.4-2.6Z" />
                            <path d="M12.2 5.79c1.49 0 2.82.51 3.87 1.51l2.9-2.9C17.26 2.82 14.95 2 12.2 2A10.19 10.19 0 0 0 3.09 7.29l3.4 2.6c.8-2.41 3.05-4.1 5.71-4.1Z" />
                          </svg>
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">Continuar con Google</span>
                          <span className="block text-xs text-muted-foreground">
                            Acceso seguro a tu espacio personal
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Button>
                    <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0">
                      <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                          if (!credentialResponse.credential) {
                            toast.error("Google no devolvió una credencial válida");
                            return;
                          }
                          try {
                            await signInWithGoogle(credentialResponse.credential);
                            toast.success("Sesión iniciada correctamente");
                            navigate("/dashboard", { replace: true });
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión");
                          }
                        }}
                        onError={() => toast.error("Falló la autenticación con Google")}
                        useOneTap
                        theme="filled_black"
                        text="signin_with"
                        shape="pill"
                        size="large"
                        width="380"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
              Configura VITE_GOOGLE_CLIENT_ID para habilitar el login con Google.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
