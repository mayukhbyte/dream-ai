import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { UserProfileMenu } from '@/components/auth/UserProfileMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { 
  Flame, 
  Sparkles, 
  Search, 
  ShoppingBag, 
  ShieldCheck,
  Menu,
  X,
  Compass,
  Zap,
  Database,
  Headphones
} from 'lucide-react';

interface NavbarProps {
  onOpenOrders?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOrders }) => {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-gray-200/60 dark:border-zinc-800/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                      DreamFood
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      AI
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium -mt-1 hidden sm:block">
                    Next-Gen Food Intelligence
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-zinc-300">
              <Link href="/#3d-carousel" className="hover:text-orange-500 dark:hover:text-orange-400 transition flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <Sparkles className="w-4 h-4" />
                3D Menu
              </Link>
              <Link href="/#ai-concierge" className="hover:text-orange-500 dark:hover:text-orange-400 transition flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                AI Concierge
              </Link>
              <Link href="/supabase" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                Supabase
              </Link>
              <Link href="/firebase" className="hover:text-amber-500 dark:hover:text-amber-400 transition flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Firebase Auth
              </Link>
              <Link href="/support" className="hover:text-rose-500 dark:hover:text-rose-400 transition flex items-center gap-1.5 text-zinc-300">
                <Headphones className="w-4 h-4 text-orange-400" />
                Support Desk
              </Link>
            </nav>

            {/* User Auth & Orders Action Section */}
            <div className="flex items-center gap-3">
              {/* Live Order History Button */}
              <button
                onClick={onOpenOrders}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-xs font-bold text-orange-300 hover:text-white transition shadow-sm"
                title="View Live Real-Time Orders & Telemetry"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                <span>Live Orders</span>
              </button>

              {loading ? (
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              ) : user ? (
                <UserProfileMenu onOpenOrders={onOpenOrders} />
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openSignIn}
                    className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-zinc-200 hover:text-orange-600 dark:hover:text-orange-400 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={openSignUp}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:shadow-lg transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get Started</span>
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 pt-2 pb-4 space-y-2 shadow-xl">
            <Link
              href="/#3d-carousel"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-orange-600 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              3D Menu
            </Link>
            <Link
              href="/supabase"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800"
            >
              Supabase Backend
            </Link>
            <Link
              href="/firebase"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-zinc-800"
            >
              Firebase Auth
            </Link>
            <Link
              href="/support"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800 flex items-center gap-2"
            >
              <Headphones className="w-4 h-4 text-orange-400" />
              <span>24/7 Support Desk & Helpline</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenOrders) onOpenOrders();
              }}
              className="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-zinc-800"
            >
              📦 My Orders & Memory
            </button>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
};
