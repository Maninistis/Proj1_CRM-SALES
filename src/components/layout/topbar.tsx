import { auth } from "@/lib/auth/auth";
import { logoutAction } from "@/features/user/actions/auth-actions";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export async function Topbar() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-3 sm:px-4 lg:px-6">
      <MobileMenuButton />

      <div className="hidden flex-1 lg:block" />

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted sm:px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {session.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <span className="hidden text-sm font-medium text-navy-500 sm:inline">
              {session.user.name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="text-sm font-medium text-navy-500">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={logoutAction}>
              <button type="submit" className="w-full">
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
