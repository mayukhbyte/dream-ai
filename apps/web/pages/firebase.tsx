import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, User, Users, Lock, LogOut, Search, Activity } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import Link from 'next/link';

const FirebasePage: NextPage = () => {
  const { user, isFirebaseConfigured, signInWithDemoUser, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-white flex flex-col font-sans relative overflow-hidden">
      <Head>
        <title>Firebase Auth | DreamFood AI</title>
      </Head>

      {/* Ambient Glows specific to Firebase (Amber/Orange) */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" /> Identity & Access
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              Powered by <span className="text-amber-400">Firebase</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Secure, fast, and scalable authentication. All food searches, preferences, and partner features are tied to your unique identity.
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 backdrop-blur-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Firebase Authentication</h3>
                    <p className="text-sm text-slate-400">Role-Based Access Control</p>
                  </div>
                </div>

                <p className="text-base text-slate-300 leading-relaxed mb-8">
                  Sign in instantly with Email or Google. Access the app as a Customer to order, or switch to Partner Chef role to manage the kitchens.
                </p>

                <div className="p-5 rounded-2xl bg-black/50 border border-white/5 text-sm font-mono space-y-3 text-slate-300 shadow-inner">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="flex items-center gap-2 text-slate-500"><User className="w-4 h-4" /> Current User</span>
                    <span className={user ? 'text-amber-400 font-bold truncate max-w-[200px]' : 'text-slate-400'}>
                      {user ? `${user.email} (${user.role || 'CUSTOMER'})` : 'Guest Mode'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="flex items-center gap-2 text-slate-500"><Activity className="w-4 h-4" /> Status</span>
                    <span className={isFirebaseConfigured ? 'text-emerald-400 font-bold flex items-center gap-2' : 'text-amber-400 font-bold flex items-center gap-2'}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${isFirebaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {isFirebaseConfigured ? 'Production Ready' : 'Demo Fallback'}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4">
                  {user ? (
                    <>
                      <button
                        onClick={() => signInWithDemoUser('RESTAURANT_OWNER')}
                        className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-sm font-bold text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
                      >
                        <Users className="w-4 h-4" /> Switch to Partner Chef
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 border border-white/10"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setAuthMode('signin'); setIsAuthOpen(true); }}
                      className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-sm font-bold text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5"
                    >
                      <Lock className="w-5 h-5" /> Open Firebase Login
                    </button>
                  )}
                  <Link href="/" className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/20">
                    <span>Back to App</span>
                  </Link>
                </div>
              </div>

              {/* Decorative graphic side */}
              <div className="relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent blur-3xl rounded-full" />
                <div className="relative bg-black/40 border border-white/10 rounded-3xl p-6 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                  
                  {/* Mock JWT Token visualization */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[9px] font-mono leading-relaxed text-amber-500/60 break-words">
                      eyJhbGciOiJSUzI1NiIsImtpZCI6ImRiNTRiZmIxNDRhZjg0ZGMyZmRmZWM4Y2ZmZGVhYWY2ZmUyZmJmMGEiLCJ0eXAiOiJKV1QifQ.
                      <span className="text-emerald-500/70">eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZHJlYW1mb29kLWFpIiwiYXVkIjoiZHJlYW1mb29kLWFpIiwiYXV0aF90aW1lIjoxNjMwMDAwMDAwLCJ1c2VyX2lkIjoiZ3Vlc3Qtc2Vzc2lvbiIsInN1YiI6Imd1ZXN0LXNlc3Npb24iLCJpYXQiOjE2MzAwMDAwMDAsImV4cCI6MTYzMDAwMzYwMCwiZW1haWwiOiJndWVzdEBkcmVhbWZvb2QuYWkiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiZ3Vlc3RAZHJlYW1mb29kLmFpIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.</span>
                      <span className="text-blue-500/50">Qx9z...signature...3d2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default FirebasePage;
