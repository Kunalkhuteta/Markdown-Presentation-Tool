import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";

function Header() {
  const location = useLocation();

  const navItems = [
    { name: "Editor", path: "/editor" },
    { name: "Themes", path: "/themes" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Docs", path: "/docs" },
    { name: "CLI", path: "/cli" },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-extrabold text-2xl text-white tracking-tight hover:opacity-90 transition">
            MarkPre
          </span>
        </Link>

        {/* Right: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-all hover:text-white hover:scale-105",
                location.pathname === item.path
                  ? "text-white border-b-2 border-white pb-1"
                  : "text-indigo-100"
              )}
            >
              {item.name}
            </Link>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-white text-whitetext-indigo-700 "
          >
            Logout
          </Button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-indigo-700 transition"
          >
            Menu
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
