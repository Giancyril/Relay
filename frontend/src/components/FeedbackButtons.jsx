import { useState } from "react";
import { sendFeedback } from "../api/feedbackApi";

/**
 * FeedbackButtons — interactive 👍 / 👎 rating controls displayed under agent messages.
 */
export default function FeedbackButtons({ question, answer, sessionId }) {
  const [rating, setRating] = useState(null); // null | "up" | "down"
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRate(selectedRating) {
    if (isSubmitting || isSubmitted) return;
    setRating(selectedRating);
    setShowCommentBox(true); // Open comment popover
    
    // Send rating immediately
    try {
      setIsSubmitting(true);
      await sendFeedback({
        rating: selectedRating,
        question: question || "N/A",
        answer: answer || "N/A",
        comment: "",
        sessionId,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.warn("Feedback error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveComment() {
    if (!comment.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await sendFeedback({
        rating,
        question: question || "N/A",
        answer: answer || "N/A",
        comment: comment.trim(),
        sessionId,
      });
      setShowCommentBox(false);
    } catch (err) {
      console.warn("Comment submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-2.5 pt-2 border-t border-surface-600/50 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-surface-500 font-medium">Was this helpful?</span>

        <div className="flex items-center gap-1.5">
          {/* Thumbs Up Button */}
          <button
            onClick={() => handleRate("up")}
            disabled={isSubmitting}
            className={`p-1 rounded-md transition-colors text-xs flex items-center gap-1 ${
              rating === "up"
                ? "bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-semibold"
                : "hover:bg-surface-600 text-surface-400 hover:text-slate-200"
            }`}
            title="Helpful"
          >
            👍
          </button>

          {/* Thumbs Down Button */}
          <button
            onClick={() => handleRate("down")}
            disabled={isSubmitting}
            className={`p-1 rounded-md transition-colors text-xs flex items-center gap-1 ${
              rating === "down"
                ? "bg-rose-950/80 border border-rose-700/60 text-rose-400 font-semibold"
                : "hover:bg-surface-600 text-surface-400 hover:text-slate-200"
            }`}
            title="Unhelpful"
          >
            👎
          </button>
        </div>
      </div>

      {/* Optional Comment Popover */}
      {showCommentBox && (
        <div className="mt-1 bg-surface-900 border border-surface-600 rounded-xl p-2.5 space-y-2">
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us how we can improve this answer (optional)..."
            className="w-full bg-surface-800 border border-surface-700 rounded-lg p-2 text-xs text-slate-200 placeholder-surface-500 outline-none focus:border-brand-500 resize-none leading-relaxed"
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => setShowCommentBox(false)}
              className="text-[11px] text-surface-400 hover:text-slate-200 px-2 py-0.5"
            >
              Skip
            </button>
            <button
              onClick={handleSaveComment}
              disabled={!comment.trim() || isSubmitting}
              className="bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md transition-colors disabled:opacity-40"
            >
              Submit Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
