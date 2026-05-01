import { GoogleLogin } from "@react-oauth/google";
import { Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";
import { useAuth } from "@/hooks/use-auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-card/95">
        <CardHeader className="items-center text-center">
          <div className="mb-2 rounded-3xl bg-accent p-4 text-accent-foreground">
            <Wallet className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl">Controla tus ingresos y gastos</CardTitle>
          <CardDescription>
            Inicia sesión con Google para acceder a tu dashboard personal y gestionar solo tus datos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {env.googleClientId ? (
            <div className="flex justify-center">
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
              />
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
