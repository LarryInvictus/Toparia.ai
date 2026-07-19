// brain.js — TRUE OFFLINE BRAIN (no presets, no templates)

export class BrainEngine {
  constructor() {
    this.history = [];
  }

  // -----------------------------
  // TEXT PROCESSING
  // -----------------------------
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, "")
      .split(/\s+/)
      .filter(Boolean);
  }

  chunk(text) {
    return text
      .split(/[,.;!?]/)
      .map(t => t.trim())
      .filter(Boolean);
  }

  // -----------------------------
  // SEMANTIC ANALYSIS
  // -----------------------------
  semanticWeight(word) {
    return word.length * 0.7 + (/[aeiou]/.test(word) ? 0.3 : 0);
  }

  extractCoreConcept(tokens) {
    if (!tokens.length) return null;
    let best = tokens[0];
    let bestScore = this.semanticWeight(best);

    for (const t of tokens) {
      const score = this.semanticWeight(t);
      if (score > bestScore) {
        best = t;
        bestScore = score;
      }
    }
    return best;
  }

  // -----------------------------
  // STRUCTURE ANALYSIS
  // -----------------------------
  structureMap(chunks) {
    return {
      count: chunks.length,
      avgLength: chunks.reduce((a, c) => a + c.length, 0) / (chunks.length || 1),
      longest: chunks.reduce((a, c) => (c.length > a.length ? c : a), "")
    };
  }

  // -----------------------------
  // EMOTIONAL TONE (FORM-BASED)
  // -----------------------------
  tone(text) {
    if (text.endsWith("!")) return "intense";
    if (text.includes("...")) return "uncertain";
    if (text.length < 12) return "minimal";
    if (/[A-Z]{3,}/.test(text)) return "heightened";
    return "neutral";
  }

  // -----------------------------
  // REASONING CHAIN (NO PRESETS)
  // -----------------------------
  reasoning(text) {
    const tokens = this.tokenize(text);
    const chunks = this.chunk(text);
    const core = this.extractCoreConcept(tokens);
    const structure = this.structureMap(chunks);
    const tone = this.tone(text);

    return {
      tokens,
      chunks,
      core,
      structure,
      tone
    };
  }

  // -----------------------------
  // RESPONSE BUILDER (NO TEMPLATES)
  // -----------------------------
  buildResponse(reason) {
    const { core, structure, tone } = reason;

    let parts = [];

    // Build meaning from structure
    parts.push(`Your message forms ${structure.count} main idea${structure.count > 1 ? "s" : ""}.`);

    // Build meaning from core concept
    if (core) {
      parts.push(`The strongest concept I detected is "${core}".`);
    } else {
      parts.push(`I didn’t detect a dominant concept, but the message still carries intent.`);
    }

    // Build meaning from tone
    parts.push(`The tone appears ${tone}.`);

    // Build meaning from structure complexity
    if (structure.avgLength > 40) {
      parts.push(`The ideas are expressed in long segments, suggesting layered meaning.`);
    } else if (structure.avgLength > 20) {
      parts.push(`The segments have moderate length, suggesting focused meaning.`);
    } else {
      parts.push(`The segments are short, suggesting direct meaning.`);
    }

    // Build final meaning
    parts.push(`Given all of this, the message seems to be exploring something around "${core || "your thoughts"}".`);

    return parts.join(" ");
  }

  // -----------------------------
  // MAIN RESPONDER
  // -----------------------------
  respond(text) {
    this.history.push({ role: "user", text });

    const reason = this.reasoning(text);
    const draft = this.buildResponse(reason);

    this.history.push({ role: "brain", text: draft });

    return draft;
  }
                                   }
