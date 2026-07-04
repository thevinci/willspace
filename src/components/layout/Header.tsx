import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

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

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-8">
        <h1 className="text-base font-semibold tracking-tight">willspace</h1>

        <nav className="flex items-center gap-4 text-sm">
          <Link className="hover:underline" to="/demo">
            Demo
          </Link>
          <span className="text-muted-foreground">Apps</span>
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
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Select theme" />}>
            <ThemeIcon theme={theme} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value) => setTheme((value as ThemeOption) ?? "system")}
            >
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-muted-foreground">The Vinci</span>
        <Avatar size="sm">
          <AvatarFallback>TV</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
