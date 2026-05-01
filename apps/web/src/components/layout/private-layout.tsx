import { BarChart3, ChevronLeft, ChevronRight, LineChart, LogOut, Settings, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/transactions", label: "Movimientos", icon: Wallet },
  { to: "/investments", label: "Inversiones", icon: LineChart },
  { to: "/settings", label: "Ajustes", icon: Settings },
];

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem("finance-sidebar-collapsed");
    setIsCollapsed(storedValue === "true");
  }, []);

  function toggleSidebar() {
    setIsCollapsed((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem("finance-sidebar-collapsed", String(nextValue));
      return nextValue;
    });
  }

  const initials = user?.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={cn(
          "hidden border-b border-border bg-card/95 transition-[width] duration-300 ease-out lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0 lg:border-b-0 lg:border-r",
          isCollapsed ? "lg:w-[88px]" : "lg:w-[320px]",
        )}
      >
        <div className="flex h-full flex-col px-4 py-4 lg:px-5 lg:py-6">
          <div
            className={cn(
              "mb-5 border-b border-border pb-5",
              isCollapsed ? "flex flex-col items-center gap-3" : "flex items-center justify-between gap-3",
            )}
          >
            <div className={cn("flex min-w-0 items-center gap-3", isCollapsed && "justify-center")}>
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-soft",
                  isCollapsed ? "h-12 w-12 rounded-xl" : "h-14 w-14 rounded-2xl",
                )}
              >
                <Wallet className={cn(isCollapsed ? "h-6 w-6" : "h-7 w-7")} />
              </div>
              <div
                className={cn(
                  "min-w-0 overflow-hidden transition-all duration-300 ease-out",
                  isCollapsed ? "max-w-0 opacity-0 -translate-x-2" : "max-w-[180px] opacity-100 translate-x-0",
                )}
              >
                <p className="truncate text-xl font-extrabold tracking-tight">Mis gastos</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn("shrink-0", isCollapsed ? "mx-auto h-12 w-12 rounded-xl" : "h-14 w-14 rounded-2xl")}
              onClick={toggleSidebar}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0 lg:pt-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex min-w-fit items-center gap-4 rounded-2xl px-5 py-5 text-[15px] font-medium text-slate-400 transition-all duration-300 hover:bg-secondary hover:text-foreground",
                    isCollapsed && "mx-auto h-16 w-16 min-w-0 justify-center px-0 py-0 hover:bg-transparent",
                    isActive && !isCollapsed && "bg-secondary/90 text-primary",
                  )
                }
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    <span
                      className={cn(
                        "flex shrink-0 items-center justify-center transition-all duration-300",
                        isCollapsed ? "h-12 w-12 rounded-xl" : "h-7 w-7",
                        isCollapsed && isActive && "bg-secondary/90 text-primary shadow-soft",
                      )}
                    >
                      <Icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-7 w-7")} />
                    </span>
                    <span
                      className={cn(
                        "overflow-hidden whitespace-nowrap transition-all duration-300 ease-out",
                        isCollapsed ? "max-w-0 opacity-0 -translate-x-2" : "max-w-[140px] opacity-100 translate-x-0",
                      )}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 hidden border-t border-border pt-5 lg:block">
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <Avatar className={cn(isCollapsed ? "h-10 w-10" : "h-12 w-12")}>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "min-w-0 overflow-hidden transition-all duration-300 ease-out",
                  isCollapsed ? "max-w-0 opacity-0 -translate-x-2" : "max-w-[160px] opacity-100 translate-x-0",
                )}
              >
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              className={cn(
                "mt-4 w-full justify-start rounded-xl",
                isCollapsed && "mx-auto h-10 w-10 justify-center rounded-full px-0",
              )}
              variant="ghost"
              onClick={() => void signOut()}
            >
              <LogOut className={cn(isCollapsed ? "h-4 w-4" : "h-4 w-4")} />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-out",
                  isCollapsed ? "max-w-0 opacity-0 -translate-x-2" : "max-w-[120px] opacity-100 translate-x-0",
                )}
              >
                Cerrar sesión
              </span>
            </Button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 space-y-4 p-3 pb-24 sm:p-4 sm:pb-24 lg:space-y-6 lg:p-6 lg:pb-6">
        <header className="hidden flex-col gap-4 rounded-xl border border-border bg-card/90 p-4 lg:flex lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Resumen y movimientos del mes</p>
            <h1 className="text-xl font-semibold sm:text-2xl">Tus finanzas, en un vistazo</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex min-w-0 items-center gap-3 rounded-md bg-secondary px-3 py-2">
              <Avatar>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button className="lg:hidden" variant="outline" size="sm" onClick={() => void signOut()}>
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </header>
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium text-muted-foreground transition-colors",
                  isActive && "bg-secondary text-primary",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
