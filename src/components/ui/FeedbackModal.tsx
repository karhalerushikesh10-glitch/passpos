'use client';

import React, { useState } from 'react';
import { usePosStore } from '@/store/usePosStore';
import { useToast } from '@/components/ui/ToastProvider';
import { trackFeedbackSubmitted } from '@/lib/posthog';
import {
  MessageSquareHeart,
  Star,
  X,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const FeedbackModal: React.FC = () => {
  const { feedbackModalOpen, setFeedbackModalOpen, merchant } = usePosStore();
  const { showSuccess, showError } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('Passkey Biometric Auth');
  const [comments, setComments] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!feedbackModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Anonymous Tester',
          email: email || merchant.email,
          rating,
          category,
          comments,
          walletAddress: merchant.stellarPublicKey,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        trackFeedbackSubmitted(rating, category);
        showSuccess('Feedback Submitted!', 'Thank you for helping validate PassPOS Level 4 MVP.');
      } else {
        showError('Submission Failed', data.error);
      }
    } catch (err: any) {
      showError('Network Error', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedbackModalOpen(false);
    setSubmitted(false);
    setComments('');
  };

  return (
    <div id="feedback-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
              <MessageSquareHeart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">User Feedback & Validation</h3>
              <p className="text-[11px] text-zinc-400">Stellar Journey Level 4 User Testing</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Thank You for Your Feedback!</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Your response has been logged and included in the Level 4 user validation cohort.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-glow"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Star Rating */}
            <div className="text-center space-y-1 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/80">
              <label className="block text-zinc-400 font-medium">Overall PassPOS Experience</label>
              <div className="flex items-center justify-center space-x-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-teal-400 font-semibold font-mono">
                {rating === 5 ? '⭐⭐⭐⭐⭐ Exceptional (5/5)' : `${rating}/5 Stars`}
              </span>
            </div>

            {/* Feedback Category */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Feedback Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 transition-colors"
              >
                <option value="Passkey Biometric Auth">Passkey WebAuthn Biometric Authorization</option>
                <option value="POS Terminal Speed">POS Cashier Speed & Usability</option>
                <option value="Stellar Smart Contract">Soroban Smart Contract & XLM Settlements</option>
                <option value="Receipts & QR Flow">Customer QR Code & Digital Receipts</option>
                <option value="Other">General Usability / Suggestion</option>
              </select>
            </div>

            {/* Comments Field */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Your Detailed Comments / Review</label>
              <textarea
                required
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your experience with passkey signing speed, UI responsiveness, or payment settlement..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Optional User Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Tester"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !comments.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-glow transition-all active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Level 4 Feedback'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
