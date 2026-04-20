import { useState } from "react";
import { Outlet } from "react-router";
import { Navigation } from "./Navigation";
import { HamburgerMenu } from "./HamburgerMenu";

export function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#121212]">
      <Navigation onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
