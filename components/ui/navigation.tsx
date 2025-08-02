import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  CreditCard, 
  Settings
} from "lucide-react";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Navigation() {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    { href: "/protected", label: "Dashboard", icon: Home },
    { href: "/protected/billing", label: "Facturación", icon: CreditCard },
    { href: "/protected/settings", label: "Configuración", icon: Settings },
  ];

  return (
    <nav className="flex items-center space-x-6">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80",
            pathname === item.href
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 