import { Home, Search, Activity, Users, User, LogOut, X, LogIn, UserPlus } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Activity, label: "Activity Feed", path: "/activity" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-[#1a1a1a] border-r border-gray-800 z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#bb86fc] to-[#03dac6] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <span className="text-white text-xl font-bold">GamerHub</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#bb86fc] text-white shadow-lg shadow-[#bb86fc]/20"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all w-full"
              >
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Iniciar Sesión</span>
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#bb86fc] text-white hover:opacity-90 transition-all w-full"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Registrarse</span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}