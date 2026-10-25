import React, { useState } from 'react';
import { 
  Star, 
  Send, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  ThumbsUp 
} from 'lucide-react';
import { Order, submitOrderRating } from '@/lib/api';

interface RatingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onRatingSuccess?: (order: Order) => void;
}

const FEEDBACK_TAGS = [
  'Steaming Hot',
  'Authentic Spicing',
  'Fast Sky Route',
  'Double-Wall Sealed',
  'Chef Presentation',
  'Eco Packaging'
];

export const RatingModal: React.FC<RatingModalProps> = ({
  order,
  isOpen,
  onClose,
  onRatingSuccess
}) => {
  const [stars, setStars] = useState<number>(order.rating?.stars || 5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(order.rating?.feedbackTags || ['Steaming Hot', 'Chef Presentation']);
  const [review, setReview] = useState<string>(order.rating?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRated, setIsRated] = useState(Boolean(order.rating?.stars));

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitOrderRating(order.id, {
        stars,
        review: review.trim() || 'Arrived steaming hot and full of authentic hearth flavor!',
        feedbackTags: selectedTags
      });
      setIsRated(true);
      onRatingSuccess?.(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/80 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Rate Food & Give Feedback</h3>
              <p className="text-xs text-zinc-400">Order #{order.id.slice(-6)} • {order.dish}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isRated ? (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">Thank You for Your Feedback!</h4>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star 
                    key={s} 
                    className={`w-5 h-5 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} 
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-300">
                "{review || order.rating?.review}"
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Star Selector */}
              <div className="text-center space-y-2">
                <span className="text-xs text-zinc-400 font-medium">How was your culinary experience?</span>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map(starNum => {
                    const isFilled = (hoverStars !== null ? hoverStars : stars) >= starNum;
                    return (
                      <button
                        key={starNum}
                        type="button"
                        onMouseEnter={() => setHoverStars(starNum)}
                        onMouseLeave={() => setHoverStars(null)}
                        onClick={() => setStars(starNum)}
                        className="p-1 group transition-transform hover:scale-125"
                      >
                        <Star 
                          className={`w-8 h-8 transition-colors ${
                            isFilled ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-amber-400 block">
                  {stars === 5 ? '🌟 Exceptional & Steaming Hot!' :
                   stars === 4 ? '👍 Great Food & Quick Flight' :
                   stars === 3 ? '👌 Average Experience' :
                   stars === 2 ? '👎 Needs Improvement' : '⚠️ Poor Quality'}
                </span>
              </div>

              {/* Tag Chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 block">What stood out?</span>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition ${
                          isSelected 
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Written Review */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-zinc-300 block">Write a Review for the Chef & Rider</span>
                <textarea
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share details about flavor, heat retention, or delivery speed..."
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting Feedback...' : 'Submit Rating & Feedback'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
