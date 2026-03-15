// ─── Anthropic Streaming API ──────────────────────────────────
//
// Set your API key in .env.local:
//   REACT_APP_ANTHROPIC_API_KEY=sk-ant-...
//
// The app works without a key using rich fallback demo content.
// ─────────────────────────────────────────────────────────────

const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY || '';
const MODEL   = 'claude-sonnet-4-20250514';

/**
 * Stream a response from Claude.
 * Calls onChunk(text) incrementally as tokens arrive.
 * Throws on network or API error (caller should catch + fallback).
 */
export async function callClaude(systemPrompt, userPrompt, onChunk) {
  if (!API_KEY) throw new Error('No API key — using demo mode');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) throw new Error(`API ${response.status}`);

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer    = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          onChunk(parsed.delta.text);
        }
      } catch {
        // ignore parse errors on SSE keep-alives
      }
    }
  }
}

// ─── Demo / fallback content ──────────────────────────────────

export const DEMO_RESEARCH_DOC = `## Executive Summary

This video provides a **comprehensive overview of transformer-based neural architectures** and their transformative impact on artificial intelligence. The content progresses systematically from historical foundations through cutting-edge research directions.

## Module 1: Foundations of the Transformer [1:23]

The **transformer model**, introduced in *Attention Is All You Need* (Vaswani et al., 2017), replaced recurrent architectures with a fully attention-based mechanism. This shift enabled parallel training and superior handling of long-range dependencies.

Key concepts introduced:
- Self-attention and multi-head attention
- Positional encodings preserving sequence order
- Encoder-decoder architecture for sequence-to-sequence tasks

## Module 2: Attention Mechanisms in Depth [3:45]

The presenter explains how **attention scores** are computed via scaled dot-product operations, allowing each token to attend to every other token simultaneously. Multi-head attention runs several attention functions in parallel, each learning different relational patterns.

## Module 3: Practical Architectures [7:30]

**BERT, GPT, and T5** each represent a different paradigm built on the transformer foundation:
- BERT: bidirectional encoder, excels at understanding tasks
- GPT series: autoregressive decoder, optimised for generation
- T5: unified text-to-text framework spanning both

## Module 4: Emergent Capabilities at Scale [13:20]

Scale unlocks **surprising capabilities** not present in smaller models — chain-of-thought reasoning, few-shot learning, and apparent theory-of-mind behaviours. The debate between "stochastic parrots" and genuine generalisation remains active in the field.

## Module 5: Future Directions [22:15]

Research frontiers include **multimodal models**, extended context windows (1M+ tokens), efficient inference via quantisation and sparsity, and the intersection of neuroscience with AI to inspire new architectural priors.

## Synthesis

The transformer represents a genuine paradigm shift — not merely an incremental improvement but a new computational substrate for intelligence. Its scalability, versatility, and surprising emergent properties position it as the foundation of near-term AI progress.`;

export const DEMO_MUSIC_ANALYSIS = `## Music & Sound Analysis

The video employs a **minimalist ambient soundscape** that effectively supports the educational narrative without competing for cognitive attention. The background score appears synthesiser-based, built around soft pad layers running at approximately 80–90 BPM with a slow harmonic rhythm.

**Sonic characteristics:**
- Warm, low-mid frequency pads provide continuity across topic transitions
- Subtle percussive elements mark section changes without jarring the listener
- Clean, professionally treated voice-over with consistent room treatment and minimal sibilance
- Strategic use of silence at key conceptual beats allows ideas to settle

**Narrative alignment:**
The music energy rises subtly during the sections on emergent capabilities [13:20–16:45], mirroring the sense of discovery. It recedes almost entirely during the dense technical explanation of attention mechanisms, correctly prioritising comprehension.

**Production value:**
Audio levels are well-balanced throughout. The voice-over sits ~6 dB above the music bed with gentle side-chain compression. No jarring transitions or artefacts detected.

**Music Quality Rating: 7.5 / 10** — Professional, purposeful, and appropriately restrained. A bespoke score rather than a stock loop would elevate this to the next tier.`;

export const DEMO_LYRICS_ANALYSIS = `## Explanation & Verbal Quality Analysis

The verbal delivery demonstrates **high pedagogical quality** characterised by a clear progression from foundational intuition to technical precision. The presenter employs classic scaffolding — establishing the "why" before the "how" — which significantly reduces cognitive load.

**Rhetorical strengths:**
- Consistent use of concrete analogies (*"attention is like a search query over your own memory"*)
- Well-paced delivery with deliberate pauses after each core concept
- Strategic repetition of key terms reinforces retention without feeling redundant
- The timestamp [13:20] segment on emergent capabilities is particularly well-argued, balancing excitement with epistemic caution

**Language and accessibility:**
Technical vocabulary (autoregressive, positional encoding, self-supervised) is introduced with brief inline definitions, making the content accessible to intermediate learners without patronising experts. Sentence complexity is appropriately varied — dense during technical passages, shorter during transitions.

**Areas for improvement:**
- The Q&A section at [16:45] feels slightly rushed; the critic's position deserves more airtime
- A brief recap summary at the midpoint would benefit non-linear viewers

**Explanation Quality Rating: 8.5 / 10** — Above-average pedagogical clarity. This is content that respects the learner's intelligence while remaining genuinely accessible.`;

export const DEMO_THEME_ANALYSIS = `## Theme & Visual Integration Analysis

The video achieves strong **thematic coherence** by maintaining a single, well-resolved narrative arc: *from the limitations of recurrence to the possibilities opened by attention*. Every segment either builds the thesis or deepens a consequence of it.

**Thematic architecture:**
- Opening establishes stakes — why the previous paradigm was insufficient
- Middle section builds technical understanding through layered abstraction
- The emergent capabilities section functions as a narrative climax
- Closing synthesises implications and gestures toward open questions

**Visual–verbal alignment:**
Graphics appear timed precisely to reinforce rather than duplicate the spoken content. The colour-coding in the architecture diagrams (blue for encoder components, orange for decoder) persists consistently and is referenced verbally, creating a unified mental model. The attention heatmaps at [5:12] are particularly effective — showing rather than telling.

**Emotional arc:**
The pacing creates a gentle sense of intellectual journey: grounded beginning → building complexity → moment of wonder (emergence) → calibrated optimism. This mirrors the emotional experience many practitioners have had engaging with large language models in practice.

**Integration score:**
Music, visuals, and narration reinforce each other without redundancy — a genuinely difficult balance to achieve in technical education content.

**Overall Cohesion Rating: 8 / 10** — Highly integrated, purposefully structured, and intellectually honest.`;
