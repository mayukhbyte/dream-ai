import React, { useState, useEffect } from 'react';
import { 
  Order, 
  PreparationStep, 
  FoodComplaint, 
  chefUpdateOrder, 
  getAllComplaints,
  chefReplyToFeedback,
  getSocket 
} from '@/lib/api';
import { 
  ChefHat, 
  Flame, 
  Thermometer, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Check, 
  Send, 
  Radio, 
  Eye, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  UtensilsCrossed,
  PackageCheck,
  MessageSquare,
  Star
} from 'lucide-react';

interface ChefDashboardProps {
  orders: Order[];
  onOrderUpdated?: (order: Order) => void;
}

export const ChefDashboard: React.FC<ChefDashboardProps> = ({ orders, onOrderUpdated }) => {
  const [activeOrder, setActiveOrder] = useState<Order | null>(orders[0] || null);
  const [complaints, setComplaints] = useState<FoodComplaint[]>([]);
  const [cookingTemp, setCookingTemp] = useState<number>(activeOrder?.chefInitialTemp || 91.5);
  const [chefNotes, setChefNotes] = useState<string>(activeOrder?.chefNotes || '');
  const [newStepTitle, setNewStepTitle] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (orders.length > 0 && !activeOrder) {
      setActiveOrder(orders[0]);
      setCookingTemp(orders[0].chefInitialTemp || 91.5);
      setChefNotes(orders[0].chefNotes || '');
    }
  }, [orders]);

  useEffect(() => {
    loadComplaints();
    const socket = getSocket();
    if (socket) {
      socket.on('chef:complaint_alert', (data: any) => {
        setNotification(`⚠️ ${data.message}`);
        loadComplaints();
      });
      socket.on('order:status_update', (updated: Order) => {
        if (activeOrder && updated.id === activeOrder.id) {
          setActiveOrder(updated);
        }
      });
    }
  }, []);

  const loadComplaints = async () => {
    const list = await getAllComplaints();
    setComplaints(list);
  };

  const handleSelectOrder = (order: Order) => {
    setActiveOrder(order);
    setCookingTemp(order.chefInitialTemp || order.telemetry.currentTemp || 91.5);
    setChefNotes(order.chefNotes || '');
  };

  const handleToggleStep = async (stepId: string) => {
    if (!activeOrder || !activeOrder.preparationSteps) return;
    const updatedSteps = activeOrder.preparationSteps.map(step => {
      if (step.id === stepId) {
        const nextStatus = step.status === 'completed' ? 'in_progress' : 'completed';
        return {
          ...step,
          status: nextStatus as 'pending' | 'in_progress' | 'completed',
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return step;
    });

    setIsUpdating(true);
    try {
      const res = await chefUpdateOrder(activeOrder.id, {
        preparationSteps: updatedSteps,
        chefInitialTemp: cookingTemp,
        chefNotes
      });
      setActiveOrder(res);
      onOrderUpdated?.(res);
      setNotification('✅ Preparation step updated in real-time');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddStep = async () => {
    if (!newStepTitle.trim() || !activeOrder) return;
    const currentSteps = activeOrder.preparationSteps || [];
    const newStep: PreparationStep = {
      id: `step-${Date.now()}`,
      stepNumber: currentSteps.length + 1,
      title: newStepTitle.trim(),
      description: 'Custom chef craftsmanship step',
      status: 'in_progress'
    };

    const updatedSteps = [...currentSteps, newStep];
    setIsUpdating(true);
    try {
      const res = await chefUpdateOrder(activeOrder.id, {
        preparationSteps: updatedSteps,
        chefInitialTemp: cookingTemp,
        chefNotes
      });
      setActiveOrder(res);
      onOrderUpdated?.(res);
      setNewStepTitle('');
      setNotification('✅ Custom cooking step added!');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveChefFeatures = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    try {
      const res = await chefUpdateOrder(activeOrder.id, {
        chefInitialTemp: cookingTemp,
        chefNotes,
        preparationSteps: activeOrder.preparationSteps
      });
      setActiveOrder(res);
      onOrderUpdated?.(res);
      setNotification('🔥 Cooking temperature & notes updated in real-time!');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkFoodReady = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    try {
      const completedSteps = (activeOrder.preparationSteps || []).map(s => ({
        ...s,
        status: 'completed' as const,
        completedAt: s.completedAt || new Date().toISOString()
      }));

      const res = await chefUpdateOrder(activeOrder.id, {
        preparationSteps: completedSteps,
        chefInitialTemp: cookingTemp,
        chefNotes: chefNotes || 'Food prepared at peak aroma. Ready for drone pickup.',
        isReadyForPickup: true
      });
      setActiveOrder(res);
      onOrderUpdated?.(res);
      setNotification('🚀 Food marked READY! Drone pilot notified to pick it up immediately.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendChefReply = async (orderId: string) => {
    const reply = replyInputs[orderId]?.trim();
    if (!reply) return;
    setSendingReply(prev => ({ ...prev, [orderId]: true }));
    try {
      const updated = await chefReplyToFeedback(orderId, reply);
      onOrderUpdated?.(updated);
      setReplyInputs(prev => ({ ...prev, [orderId]: '' }));
      setNotification(`✅ Reply sent to customer for order #${orderId.slice(-6)}`);
      // Refresh complaints list
      const list = await getAllComplaints();
      setComplaints(list);
    } catch (err: any) {
      setNotification(`❌ Failed to send reply: ${err.message}`);
    } finally {
      setSendingReply(prev => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Terminal Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-orange-950/80 via-zinc-900 to-amber-950/80 border border-orange-500/30 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Live Kitchen Terminal
              </span>
              <span className="text-xs text-zinc-400">Strict Role: Chef & Kitchen Master</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Executive Chef Hearth Control
            </h1>
            <p className="text-sm text-zinc-400">
              Manage food preparation steps, custom cooking temperature, dispatch gates & quality complaint alerts.
            </p>
          </div>
        </div>

        <button 
          onClick={loadComplaints}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Quality Feed
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/40 text-orange-300 text-sm font-semibold flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-xs underline text-orange-400">Dismiss</button>
        </div>
      )}

      {/* Main Grid: Orders + Steps Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Orders Queue */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-400" />
              Kitchen Order Queue ({orders.length})
            </h2>
            <span className="text-xs text-zinc-400">Real-time Orders</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-sm">
                No orders currently in queue.
              </div>
            ) : (
              orders.map(order => {
                const isSelected = activeOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-orange-500/10 border-orange-500/60 shadow-lg shadow-orange-500/10' 
                        : 'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono text-zinc-400">#{order.id.slice(-6)}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        order.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.status === 'OUT_FOR_DELIVERY' ? 'bg-sky-500/20 text-sky-400' :
                        order.status === 'QUALITY_CHECK' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-amber-500/20 text-amber-400 animate-pulse'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm line-clamp-1">{order.dish}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{order.restaurantName}</p>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60 text-xs">
                      <span className="text-orange-400 font-bold flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5" />
                        {order.chefInitialTemp || order.telemetry.currentTemp}°C
                      </span>
                      <span className="text-zinc-300 font-semibold">{order.price}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Order Preparation Control */}
        <div className="lg:col-span-8 space-y-6">
          {activeOrder ? (
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6 shadow-xl">
              {/* Active Order Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300">
                      ID: {activeOrder.id}
                    </span>
                    <span className="text-xs text-zinc-400">Placed: {new Date(activeOrder.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {activeOrder.dish}
                  </h2>
                  <p className="text-xs text-orange-400 font-semibold mt-0.5">
                    Destination: {activeOrder.deliveryAddress} • Mode: {activeOrder.deliveryMode.toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleMarkFoodReady}
                    disabled={isUpdating || activeOrder.isReadyForPickup}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all ${
                      activeOrder.isReadyForPickup
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                        : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20 hover:scale-[1.02]'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4" />
                    {activeOrder.isReadyForPickup ? 'Ready & Drone Alerted' : 'Mark Ready for Pickup!'}
                  </button>
                </div>
              </div>

              {/* Cooking Temperature & Dispatch Heat Setup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <div>
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 mb-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    Entered Dispatch Temperature (°C)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      step="0.1"
                      min="70"
                      max="110"
                      value={cookingTemp}
                      onChange={(e) => setCookingTemp(parseFloat(e.target.value) || 90)}
                      className="w-32 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-lg font-bold focus:border-orange-500 focus:outline-none"
                    />
                    <span className="text-xs text-zinc-400 leading-relaxed">
                      Drone telemetry will decrement realistically by 0.1°C to 0.2°C during transit.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 mb-2">
                    <ChefHat className="w-4 h-4 text-amber-400" />
                    Chef Craftsmanship Notes
                  </label>
                  <input 
                    type="text"
                    value={chefNotes}
                    onChange={(e) => setChefNotes(e.target.value)}
                    placeholder="e.g., Authentic slow simmer, sealed with clay ring..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    onClick={handleSaveChefFeatures}
                    disabled={isUpdating}
                    className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-orange-400 border border-zinc-700 transition"
                  >
                    Save Temperature & Notes
                  </button>
                </div>
              </div>

              {/* Real-time Preparation Steps Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Preparation Timeline & Steps ({activeOrder.preparationSteps?.length || 0})
                  </h3>
                  <span className="text-xs text-zinc-400">Click to toggle complete / in-progress</span>
                </div>

                <div className="space-y-3">
                  {(activeOrder.preparationSteps || []).map((step, idx) => {
                    const isDone = step.status === 'completed';
                    return (
                      <div
                        key={step.id}
                        onClick={() => handleToggleStep(step.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                          isDone 
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' 
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${
                          isDone ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {isDone ? <Check className="w-4 h-4" /> : step.stepNumber}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-white">{step.title}</h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {step.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{step.description}</p>
                          {step.completedAt && (
                            <span className="text-[10px] text-zinc-500 block mt-1">
                              Completed at: {new Date(step.completedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Cooking Step */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder="Add a new custom preparation step (e.g. Extra saffron glaze)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700 text-white text-xs focus:border-orange-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                  />
                  <button
                    onClick={handleAddStep}
                    disabled={!newStepTitle.trim() || isUpdating}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800 text-zinc-400">
              Select an order to inspect and configure cooking preparation features.
            </div>
          )}
        </div>
      </div>

      {/* Customer Quality Alerts & Bad Food Camera Photo Uploads */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Customer Bad Food Complaints & Camera Uploads
            </h3>
            <p className="text-xs text-zinc-400">
              Photos uploaded directly by customers from their phone camera or website.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            {complaints.length} Quality Reports
          </span>
        </div>

        {complaints.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-zinc-950/40 border border-zinc-800 text-zinc-400 text-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            Zero quality complaints reported. All customers satisfied with thermal arrival!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-zinc-950/70 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-400">Order #{item.orderId.slice(-6)}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'RESOLVED' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {item.photoUrl && (
                  <div 
                    onClick={() => setSelectedPhoto(item.photoUrl || null)}
                    className="relative h-44 rounded-xl overflow-hidden cursor-pointer group border border-zinc-700"
                  >
                    <img 
                      src={item.photoUrl} 
                      alt="Customer food evidence" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-xs font-bold text-white flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-lg">
                        <Eye className="w-4 h-4" /> Click to Enlarge
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-200">
                    "{item.customerMessage}"
                  </p>
                  <span className="text-[10px] text-zinc-500 block mt-2">
                    Reported: {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Chef Response Section */}
                {item.chefResponse ? (
                  <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Chef's Reply (Sent to Customer)</span>
                    </div>
                    <p className="text-xs text-emerald-200">{item.chefResponse}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Write Chef's Reply</span>
                    </div>
                    <textarea
                      rows={2}
                      value={replyInputs[item.orderId] || ''}
                      onChange={e => setReplyInputs(prev => ({ ...prev, [item.orderId]: e.target.value }))}
                      placeholder="Write a message to the customer about their complaint..."
                      className="w-full text-xs bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:border-amber-500/60"
                    />
                    <button
                      onClick={() => handleSendChefReply(item.orderId)}
                      disabled={!replyInputs[item.orderId]?.trim() || sendingReply[item.orderId]}
                      className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sendingReply[item.orderId] ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Send Reply to Customer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Enlarge Modal */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)} 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="max-w-3xl w-full bg-zinc-900 rounded-3xl p-4 border border-zinc-700 space-y-4">
            <div className="flex justify-between items-center px-2">
              <h4 className="text-white font-bold text-sm">Customer Uploaded Photo Evidence</h4>
              <button onClick={() => setSelectedPhoto(null)} className="text-zinc-400 hover:text-white text-sm">✕ Close</button>
            </div>
            <img src={selectedPhoto} alt="Evidence" className="w-full max-h-[70vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
