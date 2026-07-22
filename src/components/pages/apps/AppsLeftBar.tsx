import { Link } from "@tanstack/react-router";

export function AppsLeftBar() {
  return (
    <aside>
      <Link className="block py-2 px-4 hover:bg-gray-200" to="/apps/3d-engine">
        3d Engine
      </Link>
      <Link className="block py-2 px-4 hover:bg-gray-200" to="/apps/notes">
        Notes
      </Link>
    </aside>
  );
}
