// brain.js — OFFLINE LOGIC ENGINE (math + reasoning + coherence)

export class ThinkingEngine {
  constructor() {
    this.history = [];
  }

  // -----------------------------
  // BASIC TEXT ANALYSIS
  // -----------------------------
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, "")
      .split(/\s+/)
      .filter(Boolean);
  }

  sentenceScore(text) {
    const tokens = this.tokenize(text);
    const lengthScore = tokens.length;
    const avgWordLength = tokens.reduce((a, w) => a + w.length, 0) / (tokens.length || 1);

    return lengthScore * 0.6 + avgWordLength * 0.4;
  }

  structureScore(text) {
    const punctuation = (text.match(/[.,!?]/g) || []).length;
    const clauses = text.split(/[,.;]/).length;
    return punctuation + clauses;
  }

  topicExtract(text) {
    const tokens = this.tokenize(text);
    if (!tokens.length) return null;

    // pick the most "dense" word (longest)
    let topic = tokens.reduce((a, b) => (b.length > a.length ? b : a), tokens[0]);
    return topic.length >= 4 ? topic : null;
  }

  // -----------------------------
  // COHERENCE CHECK
  // -----------------------------
  isCoherent(text) {
    if (!text || text.length < 5) return false;

    const tokens = this.tokenize(text);
    if (tokens.length < 3) return false;

    // must contain at least one relational word
    const relational = ["because", "so", "but", "and", "while", "when"];
    const hasRelation = tokens.some(t => relational.includes(t));
    if (!hasRelation) return false;

    // must not contain gibberish patterns
    if (/[a-z]{15,}/i.test(text)) return false;

    // must not be repetitive nonsense
    const unique = new Set(tokens);
    if (unique.size <= tokens.length * 0.3) return false;

    return true;
  }

  // -----------------------------
  // REASONING CHAIN
  // -----------------------------
  reasoningChain(userText) {
    const tokens = this.tokenize(userText);
    const topic = this.topicExtract(userText);

    const score = this.sentenceScore(userText);
    const structure = this.structureScore(userText);

    let interpretation = "";

    // interpret complexity
    if (score < 8) {
      interpretation = `You’re expressing something simple but meaningful.`;
    } else if (score < 15) {
      interpretation = `You’re laying out a thought with some structure.`;
    } else {
      interpretation = `You’re working through a complex idea.`;
    }

    // interpret structure
    let structureInterpretation = "";
    if (structure <= 2) {
      structureInterpretation = `It feels direct.`;
    } else if (structure <= 4) {
      structureInterpretation = `There’s some layering in what you're saying.`;
    } else {
      structureInterpretation = `You’re connecting multiple ideas together.`;
    }

    // interpret topic
    let topicInterpretation = "";
    if (topic) {
      topicInterpretation = `The core of what you're talking about seems to be "${topic}".`;
    } else {
      topicInterpretation = `I’m picking up a general idea, but not a specific topic.`;
    }

    return `${interpretation} ${structureInterpretation} ${topicInterpretation}`;
  }

  // -----------------------------
  // RESPONSE BUILDER
  // -----------------------------
  buildResponse(userText) {
    const chain = this.reasoningChain(userText);

    return `${chain} What part of this feels most important to you right now?`;
  }

  // -----------------------------
  // SELF-CORRECTION LOOP
  // -----------------------------
  correctResponse(response, userText) {
    if (this.isCoherent(response)) return response;

    // rebuild response using fallback logic
    const topic = this.topicExtract(userText);

    return `Let me reframe that more clearly. You’re expressing something about ${topic || "your thoughts"}. What direction do you want to take this?`;
  }

  // -----------------------------
  // MAIN RESPONDER
  // -----------------------------
  async respond(userText) {
    this.history.push({ role: "user", text: userText });

    let response = this.buildResponse(userText);
    response = this.correctResponse(response, userText);

    this.history.push({ role: "ai", text: response });
    return response;
  }
        }
