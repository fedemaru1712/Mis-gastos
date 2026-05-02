import { GoogleLogin } from "@react-oauth/google";
import { LoaderCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBackendReadiness } from "@/hooks/use-backend-readiness";
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
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Continuar con Google</p>
                    <p className="text-xs text-muted-foreground">Acceso seguro a tu espacio personal</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-full max-w-[380px] overflow-hidden rounded-full">
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
                        theme="outline"
                        text="continue_with"
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
