// ─── General utilities ────────────────────────────────────────
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const uid = () => Math.random().toString(36).slice(2, 10);
export const nowT = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─── YouTube helpers ──────────────────────────────────────────
export function extractYouTubeId(url) {
  const m =
    url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
    ) || url.match(/v=([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function getYoutubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function extractVideoTitle(url) {
  const id = extractYouTubeId(url);
  if (id) return `YouTube Video (${id})`;
  try {
    return new URL(url).hostname + ' Video';
  } catch {
    return 'Video';
  }
}

// ─── OTP ──────────────────────────────────────────────────────
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Mock transcript generator ────────────────────────────────
export function generateMockTranscript() {
  return [
    { ts: '0:00', text: "Welcome to today's deep dive into neural architectures and how they're reshaping our understanding of intelligence." },
    { ts: '1:23', text: "The foundational concept here is the transformer model, introduced in the 2017 paper 'Attention Is All You Need'." },
    { ts: '3:45', text: 'What makes attention mechanisms special is their ability to relate different positions of a sequence.' },
    { ts: '5:12', text: "Let's look at the visual representation of how multi-head attention distributes focus across tokens." },
    { ts: '7:30', text: 'Moving on to practical applications — BERT, GPT, and T5 all derive from this core architecture.' },
    { ts: '10:05', text: 'The training phase involves self-supervised learning on massive text corpora.' },
    { ts: '13:20', text: 'Emergent capabilities appear at scale — reasoning, coding, and even theory of mind behaviors.' },
    { ts: '16:45', text: 'Critics argue these are sophisticated pattern matchers without true understanding.' },
    { ts: '19:00', text: 'However, the results on benchmarks suggest something more nuanced is happening.' },
    { ts: '22:15', text: 'Future directions include multimodal models, longer context windows, and efficient inference.' },
    { ts: '25:40', text: 'The intersection of neuroscience and AI research may unlock the next breakthrough.' },
    { ts: '28:00', text: 'Thank you for watching — subscribe for weekly deep dives into AI and machine learning.' },
  ];
}

// ─── Emoji list ───────────────────────────────────────────────
export const EMOJI_LIST = ['🔥', '💡', '🎯', '✨', '🧠', '❤️', '👏', '🤔', '😮', '💪', '🎵', '📚'];

// ─── Playlist colours ─────────────────────────────────────────
export const PLAYLIST_COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];
