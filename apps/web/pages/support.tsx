import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Bot, 
  PhoneCall, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  AlertTriangle, 
  Sparkles, 
  Thermometer, 
  Navigation, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  Headphones,
  Upload,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function SupportPage() {
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [issueType, setIssueType] = useState('temperature');
  const [complaintText, setComplaintText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    orderId: string;
    issue: string;
    status: string;
    resolutionTime: string;
  } | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedTicket({
        id: `DF-CARE-${Math.floor(100000 + Math.random() * 900000)}`,
        orderId: ticketOrderId || 'DF-LIVE-CURRENT',
        issue: issueType === 'temperature' ? 'Thermal Cold / Heat Loss' : issueType === 'spill' ? 'Drone Spill / Damaged Packaging' : issueType === 'taste' ? 'Quality & Taste Concern' : 'Missing Item / Incorrect Dish',
        status: 'ESCALATED_TO_HEAD_CHEF',
        resolutionTime: '< 15 mins Guaranteed'
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-orange-500 selection:text-white">
      <Head>
        <title>DreamFood AI Care & Support Desk | 24/7 Helpline</title>
        <meta name="description" content="Official 24/7 DreamFood Customer Care, Toll-free helpline 1800-200-3732, thermal food complaint resolution, and live Chef escalations." />
      </Head>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                DreamFood <span className="text-orange-400 font-normal">Care Desk</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-700 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Menu & Orders</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-950/30 via-zinc-950 to-zinc-950 border-b border-zinc-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE 24/7 HELPLINE & CHEF ESCALATION ACTIVE
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            We Are Here To Ensure Every Meal Arrives <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Piping Hot & Pristine</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            If your drone delivery was delayed, temperature dropped, or you experienced any quality issues, reach our dedicated executive support line or file a verified Chef photo claim below.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a 
              href="tel:18002003732"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold text-sm shadow-xl shadow-orange-500/20 hover:scale-105 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Toll-Free: 1800-200-3732</span>
            </a>
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Instant Dispatch</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl relative group hover:border-orange-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Toll-Free Emergency Line</h3>
            <p className="text-xs text-zinc-400 mb-3">Direct link to Kitchen Dispatcher & Flight Ops.</p>
            <div className="text-lg font-mono font-bold text-orange-400 mb-2">1800-200-3732</div>
            <div className="text-xs text-zinc-500">Available 24 hours a day, 7 days a week. Free from all operators.</div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl relative group hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Direct WhatsApp Support</h3>
            <p className="text-xs text-zinc-400 mb-3">Instant chat, live drone telemetry & photo sharing.</p>
            <div className="text-lg font-mono font-bold text-emerald-400 mb-2">+91 98765 43210</div>
            <div className="text-xs text-zinc-500">Average response time: <strong>under 30 seconds</strong>.</div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl relative group hover:border-rose-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Executive Escalations</h3>
            <p className="text-xs text-zinc-400 mb-3">Direct line to Head Chef & Culinary Director.</p>
            <div className="text-sm font-mono font-bold text-rose-400 mb-2">support@dreamfood.ai</div>
            <div className="text-xs text-zinc-500">Guaranteed written executive response within 2 hours.</div>
          </div>
        </div>

        {/* Interactive Complaint & Ticket Portal */}
        <section className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Resolution Hub</span>
            <h2 className="text-2xl font-black text-white mt-1">Submit Food Quality or Drone Complaint</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Your ticket is sent directly into the Executive Chef terminal. The chef will review your feedback and reply directly to your dashboard.
            </p>
          </div>

          {submittedTicket ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 animate-fadeIn space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Complaint Dispatched to Head Chef</h4>
                  <p className="text-xs text-emerald-300">Ticket Reference: <span className="font-mono font-bold">{submittedTicket.id}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-zinc-500 block">Target Order</span>
                  <span className="font-mono text-zinc-200 font-semibold">{submittedTicket.orderId}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-zinc-500 block">Issue Category</span>
                  <span className="text-orange-400 font-semibold">{submittedTicket.issue}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-zinc-500 block">Resolution SLA</span>
                  <span className="text-emerald-400 font-semibold">{submittedTicket.resolutionTime}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-700/40 text-xs text-emerald-200">
                ✨ <strong>Chef Guarantee:</strong> The Executive Chef has received your notice and can write a personal apology/resolution note directly to your order panel!
              </div>

              <button
                onClick={() => setSubmittedTicket(null)}
                className="text-xs text-zinc-400 hover:text-white underline pt-2"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Order ID (optional)</label>
                  <input
                    type="text"
                    value={ticketOrderId}
                    onChange={(e) => setTicketOrderId(e.target.value)}
                    placeholder="e.g. ord-1718902 or leave blank"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Issue Type</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="temperature">❄️ Food Temperature Cold / Thermal Seal Broken</option>
                    <option value="spill">💥 Spilled / Damaged in Drone Flight</option>
                    <option value="taste">👨‍🍳 Taste / Flavor / Cooking Quality Concern</option>
                    <option value="wrong_item">📦 Missing Item or Incorrect Dish Delivered</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Describe what went wrong</label>
                <textarea
                  rows={3}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Explain the issue with the food temperature, packaging, or taste so the Kitchen Chef can inspect..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Attach Photo of Defective Food (Recommended for instant refund)</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition">
                    <Upload className="w-4 h-4 text-orange-400" />
                    <span>Upload Food Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {photoPreview && (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="Upload preview" className="w-10 h-10 object-cover rounded-lg border border-orange-500/50" />
                      <span className="text-[11px] text-emerald-400">Photo attached for Chef review</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-sm shadow-xl shadow-orange-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Claim to Chef...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>File Complaint with Kitchen Chef</span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Live Fleet & Thermal Telemetry Status */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-400">Cryo & Thermal Pods</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Active Induction (68°C Hot / 4°C Cryo)
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-400">Drone Fleet DR-402</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Air Corridor Clear (99.8% On-Time)
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-400">Quality Guarantee</div>
              <div className="text-sm font-bold text-white">
                100% Refund or Instant Remake
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-orange-400">How do I get a reply from the Chef on my complaint?</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Whenever you report a temperature defect or food feedback, it immediately appears on the Executive Chef’s terminal. The Chef can type an individualized reply, which appears directly inside your active order status card as the “Executive Chef’s Personal Reply”.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-orange-400">What if my food arrives colder than the guaranteed temperature?</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every drone container tracks food temperature continuously. If the food drops below the safe serving threshold during flight, you can report it via the AI Support Care Bot or upload a photo. We issue an instant automatic refund or immediately re-dispatch a fresh meal.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-orange-400">Can I pay by cash or online payment?</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Yes! When your delivery arrives, you can choose to settle via Cash on Delivery or use online UPI / Card payment right from the Customer Delivery modal.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-4 text-center text-xs text-zinc-600">
        <p>© 2026 DreamFood AI Fleet Operations. All Rights Reserved.</p>
        <p className="mt-1">Customer Care Helpline: 1800-200-3732 | help@dreamfood.ai</p>
      </footer>
    </div>
  );
}
