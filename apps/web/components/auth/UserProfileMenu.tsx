import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  User as UserIcon, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  ShoppingBag, 
  Heart, 
  Settings, 
  Flame,
  Database
} from 'lucide-react';

interface UserProfileMenuProps {
  onOpenOrders?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ onOpenOrders }) => {
  const { user, signOut, isFirebaseConfigured } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const roleColors: Record<string, string> = {
    CUSTOMER: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
    RESTAURANT_OWNER: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
    RIDER: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
  };

  const roleLabel: Record<string, string> = {
    CUSTOMER: 'Foodie VIP',
    RESTAURANT_OWNER: 'Partner Chef',
    ADMIN: 'Administrator',
    RIDER: 'Delivery Hero'
  };

  const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow transition"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User profile'}
            className="w-8 h-8 rounded-full object-cover border border-amber-400"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-inner">
            {initial}
          </div>
        )}
        <div className="text-left hidden md:block">
          <p className="text-xs font-bold text-gray-800 dark:text-zinc-100 leading-tight">
            {user.displayName || user.email?.split('@')[0]}
          </p>
          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
            {roleLabel[user.role || 'CUSTOMER']}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {user.email || 'Anonymous Guest'}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${roleColors[user.role || 'CUSTOMER']}`}>
                {roleLabel[user.role || 'CUSTOMER']}
              </span>
              <span className="text-[10px] text-gray-400">
                {isFirebaseConfigured ? '⚡ Live Firebase' : '🧪 Demo Mode'}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-2 py-1.5 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenOrders) onOpenOrders();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-left"
            >
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>Live Orders & Supabase Sync</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenOrders) onOpenOrders();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-left"
            >
              <Database className="w-4 h-4 text-rose-500" />
              <span>Food Memory History</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="px-2 pt-1 border-t border-gray-100 dark:border-zinc-800">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
