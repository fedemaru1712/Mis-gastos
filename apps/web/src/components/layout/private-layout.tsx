import { BarChart3, Landmark, LineChart, LogOut, Settings, User, Wallet } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const routeLinks = [
  { to: "/dashboard", label: "Resumen", icon: BarChart3 },
  { to: "/transactions", label: "Movimientos", icon: Wallet },
  { to: "/investments", label: "Cartera", icon: LineChart },
  { to: "/loans", label: "Préstamos", icon: Landmark },
];

const orderedLinks = [routeLinks[1], routeLinks[2], routeLinks[0], routeLinks[3]];

function getMobilePageTitle(pathname: string) {
  if (pathname.startsWith("/transactions")) return "Movimientos";
  if (pathname.startsWith("/investments")) return "Cartera";
  if (pathname.startsWith("/loans")) return "Préstamos";
  if (pathname.startsWith("/settings")) return "Ajustes";
  return "Resumen";
}

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const settingsIsActive = location.pathname.startsWith("/settings");
  const mobilePageTitle = getMobilePageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <header className="hidden border-b border-white/[0.04] bg-black lg:sticky lg:top-0 lg:z-30 lg:block">
        <div className="mx-auto flex h-16 items-center justify-between gap-8 px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/icons/logo-n.png" alt="NORTH" className="h-8 w-8 shrink-0 object-contain" />
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-white">NORTH</span>
          </div>

          <div className="flex min-w-0 items-center justify-end">
            <nav className="flex items-center gap-1.5">
              {orderedLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-black hover:text-white",
                      isActive && "bg-black text-white",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-black hover:text-white",
                      settingsIsActive && "bg-black text-white",
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Ajustes</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black">
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <User className="mr-2 h-4 w-4" />
                    Mi perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>

      <main className="min-w-0 space-y-4 px-4 pb-[calc(var(--bottom-nav-height)+var(--safe-area-bottom)+24px)] pt-5 sm:px-5 sm:pb-[calc(var(--bottom-nav-height)+var(--safe-area-bottom)+24px)] sm:pt-6 lg:space-y-5 lg:px-8 lg:pb-8 lg:pt-6">
        <div className="flex items-center justify-between gap-4 lg:hidden">
          <h1 className="truncate text-[28px] font-semibold tracking-tight text-white">{mobilePageTitle}</h1>
          <img src="/icons/logo-n.png" alt="NORTH" className="h-8 w-auto shrink-0 object-contain sm:h-9" />
        </div>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 bg-black px-3 pb-[var(--safe-area-bottom)] pt-2 lg:hidden">
        <div className="grid min-h-[var(--bottom-nav-height)] grid-cols-5 gap-0.5 rounded-t-[20px] bg-black p-1">
          {orderedLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors",
                  isActive && "bg-black text-white",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors",
                  settingsIsActive && "bg-black text-white",
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="truncate">Ajustes</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="mb-2 min-w-40 bg-black">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Mi perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
}
