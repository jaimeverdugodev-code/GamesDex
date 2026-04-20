import { Menu, User } from "lucide-react";
import { currentUser } from "../../data/mockData";

interface NavigationProps {
  onMenuToggle: () => void;
}

export function Navigation({ onMenuToggle }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#121212] border-b border-gray-800">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        {/* Left: Hamburger Menu */}
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#bb86fc] to-[#03dac6] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <span className="text-white text-xl font-bold hidden sm:block">GamerHub</span>
        </div>

        {/* Right: User Avatar */}
        <div className="flex items-center gap-3">
          <span className="text-gray-300 text-sm hidden md:block">{currentUser.username}</span>
          <img
            src={currentUser.avatar}
            alt="User avatar"
            className="w-10 h-10 rounded-full ring-2 ring-[#bb86fc] cursor-pointer hover:ring-[#03dac6] transition-all"
          />
        </div>
      </div>
    </nav>
  );
}
