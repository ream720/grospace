import { Link, useLocation } from "react-router";
import { useState } from "react";
import { Menu, X, Home, Building2, Sprout, StickyNote, CheckSquare, Settings } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { useAuthStore } from "~/stores/authStore";

export function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicNavigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "About", href: "/about", icon: Home },
    { name: "Login", href: "/login", icon: Home },
  ];

  const authenticatedNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Spaces", href: "/spaces", icon: Building2 },
    { name: "Plants", href: "/plants", icon: Sprout },
    { name: "Notes", href: "/notes", icon: StickyNote },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const navigation = user ? authenticatedNavigation : publicNavigation;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Grospace
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href ||
                  (item.href === '/spaces' && location.pathname.startsWith('/spaces')) ||
                  (item.href === '/tasks' && location.pathname.startsWith('/tasks')) ||
                  (item.href === '/plants' && location.pathname.startsWith('/plants')) ||
                  (item.href === '/notes' && location.pathname.startsWith('/notes'));

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2"
                >
                  Log Out
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            )}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Navigation</h2>
                  </div>
                  <nav className="flex flex-col space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href ||
                        (item.href === '/spaces' && location.pathname.startsWith('/spaces')) ||
                        (item.href === '/tasks' && location.pathname.startsWith('/tasks')) ||
                        (item.href === '/plants' && location.pathname.startsWith('/plants')) ||
                        (item.href === '/notes' && location.pathname.startsWith('/notes'));

                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}