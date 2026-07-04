import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1>willspace</h1>

      <nav className="space-x-4">
        <Link to="/demo">Demo</Link>
        <a>Apps</a>
        <a>Market</a>
        <Link to="/directory">Directory</Link>
        <a>News</a>
        <a>Shop</a>
        <a>Social</a>
      </nav>
    </header>
  );
}
