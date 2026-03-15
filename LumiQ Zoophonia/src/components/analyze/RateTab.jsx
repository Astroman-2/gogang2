import React, { useState } from 'react';
import { uid, nowT, EMOJI_LIST } from '../../utils/helpers';

const DIMENSIONS = [
  { key: 'music',       label: 'Music & Sound',     icon: '🎵', desc: 'Quality of music, sound design, and audio production' },
  { key: 'explanation', label: 'Explanation',        icon: '📢', desc: 'Clarity, depth, and quality of verbal explanation' },
  { key: 'theme',       label: 'Theme Integration',  icon: '🎨', desc: 'Cohesion of visual, musical, and narrative themes' },
];

// ─── Single comment (recursive for replies) ──────────────────
function CommentThread({ comment, onReply, onReact, showEmojiPicker, setShowEmojiPicker, parentId, isReply }) {
  return (
    <div className={`comment${isReply ? ' comment-reply' : ''}`}>
      <div className="comment-avatar">{comment.user[0]}</div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-user">{comment.user}</span>
          <span className="comment-time">{comment.time}</span>
        </div>
        <div className="comment-text">{comment.text}</div>
        <div className="comment-footer">
          <div className="comment-reactions">
            {Object.entries(comment.reactions ?? {}).map(([emoji, count]) => (
              <span
                key={emoji}
                className="reaction-pill"
                onClick={() => onReact(comment.id, emoji, isReply, parentId)}
                title={`React with ${emoji}`}
              >
                {emoji} {count}
              </span>
            ))}
          </div>
          <div className="comment-actions-row">
            <button
              className="btn-ghost btn-xs"
              onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
            >
              😊 React
            </button>
            {!isReply && (
              <button className="btn-ghost btn-xs" onClick={onReply}>
                ↩ Reply
              </button>
            )}
          </div>
        </div>

        {showEmojiPicker === comment.id && (
          <div className="emoji-picker">
            {EMOJI_LIST.map((e) => (
              <button
                key={e}
                className="emoji-pick-btn"
                onClick={() => onReact(comment.id, e, isReply, parentId)}
                title={e}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* Nested replies */}
        {(comment.replies ?? []).map((r) => (
          <CommentThread
            key={r.id}
            comment={r}
            isReply
            parentId={comment.id}
            onReact={onReact}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            onReply={onReply}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────
export default function RateTab({ analysis, onUpdate, showToast }) {
  const [ratings, setRatings]           = useState(analysis?.ratings ?? { music: 0, explanation: 0, theme: 0 });
  const [comment, setComment]           = useState('');
  const [replyTo, setReplyTo]           = useState(null);
  const [comments, setComments]         = useState(analysis?.comments ?? []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);

  /* ── Ratings ── */
  const rateCategory = (cat, val) => {
    const r = { ...ratings, [cat]: val };
    setRatings(r);
    onUpdate({ ratings: r });
    showToast(`${cat} rated ${val}/5 ⭐`, 'success');
  };

  /* ── Submit comment / reply ── */
  const submitComment = () => {
    if (!comment.trim()) { showToast('Write something before posting', 'warning'); return; }
    const nc = { id: uid(), text: comment.trim(), user: 'You', time: nowT(), replyTo, reactions: {}, replies: [] };
    setComments((prev) => {
      const updated = replyTo
        ? prev.map((c) => c.id === replyTo ? { ...c, replies: [...(c.replies ?? []), nc] } : c)
        : [...prev, nc];
      onUpdate({ comments: updated });
      return updated;
    });
    setComment('');
    setReplyTo(null);
    showToast('Comment posted! ✨', 'success');
  };

  /* ── Add emoji reaction ── */
  const addReaction = (commentId, emoji, isReply = false, parentId = null) => {
    setComments((prev) =>
      prev.map((c) => {
        if (!isReply && c.id === commentId) {
          const r = { ...(c.reactions ?? {}), [emoji]: ((c.reactions ?? {})[emoji] ?? 0) + 1 };
          return { ...c, reactions: r };
        }
        if (isReply && c.id === parentId) {
          return {
            ...c,
            replies: (c.replies ?? []).map((r) =>
              r.id === commentId
                ? { ...r, reactions: { ...(r.reactions ?? {}), [emoji]: ((r.reactions ?? {})[emoji] ?? 0) + 1 } }
                : r
            ),
          };
        }
        return c;
      })
    );
    setShowEmojiPicker(null);
  };

  return (
    <div className="rate-tab">
      {/* ── Star ratings ── */}
      <div className="ratings-section">
        <h3 className="section-mini-title">⭐ Rate This Video</h3>
        <div className="hint-box">
          💡 Rate each quality dimension from 1–5 stars. Your ratings help other learners discover high-quality content.
        </div>
        <div className="rating-cards">
          {DIMENSIONS.map((d) => (
            <div className="rating-card" key={d.key}>
              <div className="rating-card-header">
                <span className="rating-icon">{d.icon}</span>
                <div>
                  <div className="rating-label">{d.label}</div>
                  <div className="rating-desc">{d.desc}</div>
                </div>
              </div>
              <div className="star-row">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={`star-btn${ratings[d.key] >= n ? ' star-filled' : ''}`}
                    onClick={() => rateCategory(d.key, n)}
                    title={`Rate ${n}/5`}
                    aria-label={`Rate ${d.label} ${n} out of 5`}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-val">
                  {ratings[d.key] > 0 ? `${ratings[d.key]}/5` : 'Unrated'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Discussion ── */}
      <div className="comment-section">
        <h3 className="section-mini-title">💬 Discussion</h3>

        {replyTo && (
          <div className="reply-indicator">
            ↩ Replying to a comment
            <button className="btn-ghost btn-xs" onClick={() => setReplyTo(null)}>✕ Cancel</button>
          </div>
        )}

        <div className="comment-input-area">
          <textarea
            className="comment-textarea"
            placeholder={replyTo ? 'Write a reply…' : 'Share your thoughts, questions, or insights about this video…'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <div className="comment-toolbar">
            <div className="emoji-quick">
              {EMOJI_LIST.slice(0, 6).map((e) => (
                <button key={e} className="emoji-quick-btn" onClick={() => setComment((p) => p + e)} title={e}>{e}</button>
              ))}
            </div>
            <div className="comment-actions">
              <span className="char-count">{comment.length}/500</span>
              <button className="btn-primary btn-sm" onClick={submitComment}>Post →</button>
            </div>
          </div>
        </div>

        <div className="comments-list">
          {comments.length === 0 && (
            <div className="no-comments"><span>💬</span> Be the first to comment!</div>
          )}
          {comments.map((c) => (
            <CommentThread
              key={c.id}
              comment={c}
              onReply={() => setReplyTo(c.id)}
              onReact={addReaction}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
