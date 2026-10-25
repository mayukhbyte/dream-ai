import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Navbar } from '@/components/layout/Navbar';
import { UserFoodMemoryDrawer } from '@/components/orders/UserFoodMemoryDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Database, ShoppingBag, ArrowRight, Layers, Activity } from 'lucide-react';
import Link from 'next/link';

const SupabasePage: NextPage = () => {
  const { user } = useAuth();
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white flex flex-col font-sans relative overflow-hidden">
      <Head>
        <title>Supabase Backend | DreamFood AI</title>
      </Head>

      {/* Ambient Glows specific to Supabase (Emerald/Green) */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] pointer-events-none -z-10" />

      <Navbar onOpenOrders={() => setIsOrdersDrawerOpen(true)} />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Database className="w-4 h-4" /> Data Infrastructure
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              Powered by <span className="text-emerald-400">Supabase</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Experience lightning-fast PostgreSQL performance. All orders, AI recommendations, and custom food memory are persisted here in real-time.
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 backdrop-blur-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                    <Database className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">PostgreSQL Backend</h3>
                    <p className="text-sm text-slate-400">Memory & Sync</p>
                  </div>
                </div>

                <p className="text-base text-slate-300 leading-relaxed mb-8">
                  Your food preferences are stored in a highly scalable relational database, allowing DreamFood AI to instantly recall and suggest the perfect meal based on past habits.
                </p>

                <div className="p-5 rounded-2xl bg-black/50 border border-white/5 text-sm font-mono space-y-3 text-slate-300 shadow-inner">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="flex items-center gap-2 text-slate-500"><Activity className="w-4 h-4" /> Connection</span>
                    <span className={isSupabaseConfigured ? 'text-emerald-400 font-bold flex items-center gap-2' : 'text-amber-400 flex items-center gap-2'}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {isSupabaseConfigured ? 'Live & Connected' : 'Local Fallback'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="flex items-center gap-2 text-slate-500"><Layers className="w-4 h-4" /> Session ID</span>
                    <span className="text-white font-bold truncate max-w-[180px]">
                      {user?.uid || 'guest-session'}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setIsOrdersDrawerOpen(true)}
                    className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-sm font-bold text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>View Supabase Memory</span>
                  </button>
                  
                  <Link href="/" className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/20">
                    <span>Back to App</span>
                  </Link>
                </div>
              </div>

              {/* Decorative graphic side */}
              <div className="relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl rounded-full" />
                <div className="relative bg-black/40 border border-white/10 rounded-3xl p-6 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                  <div className="space-y-4 font-mono text-[10px] text-emerald-500/70">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <span className="w-12 text-slate-600">0x00{i}</span>
                        <span className="flex-1 truncate">SELECT * FROM orders WHERE uid = '{user?.uid?.slice(0,6) || 'guest'}...'</span>
                        <span className="text-emerald-400">200 OK {Math.floor(Math.random() * 20 + 10)}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <UserFoodMemoryDrawer
        isOpen={isOrdersDrawerOpen}
        onClose={() => setIsOrdersDrawerOpen(false)}
      />
    </div>
  );
};

export default SupabasePage;
