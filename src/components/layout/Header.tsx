import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatSideContent } from "@/components/shared/ChatSideContent";
import { useSetRightSidebar } from "@/context/right-sidebar-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, LogIn, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "react-oidc-context";

type ThemeOption = "light" | "dark" | "system";

function ThemeIcon({ theme }: { theme?: string }) {
  if (theme === "light") {
    return <Sun className="h-4 w-4" />;
  }
  if (theme === "dark") {
    return <Moon className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
}

export function Header() {
  const { theme = "system", setTheme } = useTheme();
  const auth = useAuth();
  const { setRightSidebarContent } = useSetRightSidebar();

  const displayName =
    auth.user?.profile.name ?? auth.user?.profile.email ?? "The Vinci";

  const signOut = () => {
    localStorage.removeItem(
      `${import.meta.env.VITE_SPACETIMEDB_HOST ?? "ws://localhost:3000"}/${import.meta.env.VITE_SPACETIMEDB_DB_NAME ?? "tanstack-ts"}/auth_token`,
    );
    auth.signoutRedirect();
  };

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-8">
        <Link to="/">
          <h1 className="text-base font-semibold tracking-tight">willspace</h1>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link className="hover:underline" to="/demo">
            Demo
          </Link>
          <Link className="hover:underline" to="/apps">
            Apps
          </Link>
          <span className="text-muted-foreground">Market</span>
          <Link className="hover:underline" to="/directory">
            Directory
          </Link>
          <span className="text-muted-foreground">News</span>
          <span className="text-muted-foreground">Shop</span>
          <span className="text-muted-foreground">Social</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Select theme" />
            }
          >
            <ThemeIcon theme={theme} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value) =>
                setTheme((value as ThemeOption) ?? "system")
              }
            >
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open assistant chat"
          onClick={() => setRightSidebarContent(<ChatSideContent />)}
        >
          <Bot className="h-4 w-4" />
        </Button>
        {auth.isLoading ? (
          <span className="text-sm text-muted-foreground">
            Checking account...
          </span>
        ) : auth.isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Open account menu"
                />
              }
            >
              <Avatar size="sm">
                <AvatarFallback>
                  {auth.user?.profile.name?.slice(0, 2).toUpperCase() ?? "TV"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="truncate px-2 py-1.5 text-sm text-muted-foreground">
                {displayName}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={!import.meta.env.VITE_SPACETIMEAUTH_CLIENT_ID}
            onClick={() => auth.signinRedirect()}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
