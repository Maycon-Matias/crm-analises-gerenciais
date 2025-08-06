import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-b bg-white dark:bg-gray-900">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg">
          <span className="logo-text text-2xl">Porã Cred</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
