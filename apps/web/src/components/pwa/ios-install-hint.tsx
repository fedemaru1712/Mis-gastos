import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIosInstallHint } from "@/hooks/use-ios-install-hint";

export function IosInstallHint() {
  const { shouldShowHint, dismissHint } = useIosInstallHint();

  if (!shouldShowHint) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm lg:bottom-6">
      <div className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Instalar en iPhone</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Para instalar la app en tu iPhone, abre Safari, pulsa Compartir y selecciona Anadir a pantalla de inicio.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            aria-label="Cerrar sugerencia de instalacion"
            onClick={dismissHint}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
