import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Send, 
  X, 
  PhoneCall, 
  Globe, 
  Camera, 
  MessageSquare, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

interface CustomerSupportBotProps {
  orderId?: string;
  onOpenComplaintCamera?: () => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionType?: 'helpline' | 'camera_upload';
}

export const CustomerSupportBot: React.FC<CustomerSupportBotProps> = ({ orderId, onOpenComplaintCamera }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "👋 Hi! I'm your DreamFood AI Care Assistant. Need help with your thermal delivery, wrong items, or have a quality complaint?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');

    // Analyze intent
    const q = text.toLowerCase();
    setTimeout(() => {
      let reply: Message;
      if (q.includes('complaint') || q.includes('bad') || q.includes('cold') || q.includes('spill') || q.includes('wrong') || q.includes('taste') || q.includes('photo')) {
        reply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ I'm so sorry your food did not arrive in pristine condition! Our Executive Chef monitors quality in real-time.\n\n📞 Customer Care Helpline: 1800-200-3732 (Toll Free) or +91 98765 43210\n🌐 Official Support Portal: /support\n\nPlease click below to snap or upload a photo of the bad food using your camera so our Chef can inspect it immediately!`,
          timestamp: new Date().toLocaleTimeString(),
          actionType: 'camera_upload'
        };
      } else if (q.includes('helpline') || q.includes('phone') || q.includes('call') || q.includes('number') || q.includes('care') || q.includes('contact')) {
        reply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `📞 Official 24/7 DreamFood Customer Care Contacts:\n\n• Toll-Free Helpline: 1800-200-3732 (1800-DREAM-FD)\n• Direct WhatsApp Support: +91 98765 43210\n• Dedicated Help Desk Site: /support\n• Email: escalations@dreamfood.ai`,
          timestamp: new Date().toLocaleTimeString(),
          actionType: 'helpline'
        };
      } else if (q.includes('drone') || q.includes('where') || q.includes('track') || q.includes('eta') || q.includes('status')) {
        reply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `🚁 Your delivery is handled by our autonomous Drone Fleet #DR-402! The drone maintains double-walled induction heat and streams real-time altitude, speed and temperature to your dashboard above.`,
          timestamp: new Date().toLocaleTimeString()
        };
      } else {
        reply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Got it! If there are any quality or packaging concerns with your meal, our 24/7 Helpline is 1800-200-3732. You can visit our Support Site at /support or take a photo with your camera to report it directly to the Kitchen Chef.`,
          timestamp: new Date().toLocaleTimeString(),
          actionType: 'camera_upload'
        };
      }

      setMessages(prev => [...prev, reply]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white font-bold text-sm shadow-2xl shadow-orange-500/40 hover:scale-105 transition-transform group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 group-hover:rotate-12 transition" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1 animate-ping" />
          </div>
          <span>AI Support Care</span>
        </button>
      ) : (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl bg-zinc-950/95 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl animate-scaleUp">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-orange-950 via-zinc-900 to-rose-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-600 flex items-center justify-center text-white shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  DreamFood AI Care
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                    24/7 ONLINE
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-400">Helpline & Camera Complaint Bot</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Helpline Strip */}
          <div className="bg-orange-500/10 border-b border-orange-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] text-orange-300">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
              Helpline: <strong>1800-200-3732</strong>
            </span>
            <Link 
              href="/support"
              className="text-orange-400 hover:underline flex items-center gap-0.5"
            >
              <Globe className="w-3 h-3" /> Support Site
            </Link>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-orange-600 text-white rounded-br-xs' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-xs'
                }`}>
                  {msg.text}
                </div>

                {msg.actionType === 'camera_upload' && onOpenComplaintCamera && (
                  <button
                    onClick={onOpenComplaintCamera}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[11px] font-bold shadow-md hover:scale-105 transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Open Camera to Upload Bad Food Photo
                  </button>
                )}

                <span className="text-[9px] text-zinc-500 mt-0.5 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => handleSendMessage('My food is cold or damaged')}
              className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap"
            >
              ⚠️ Cold / Damaged Food
            </button>
            <button
              onClick={() => handleSendMessage('Give me customer care helpline')}
              className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap"
            >
              📞 Customer Care Number
            </button>
            <button
              onClick={() => handleSendMessage('Track my drone delivery')}
              className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap"
            >
              🚁 Drone Tracking
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-900 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message or complaint..."
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
