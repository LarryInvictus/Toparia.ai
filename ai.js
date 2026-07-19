// ai.js — final check engine (coherence + correction)

export class AIChecker {
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, "")
      .split(/\s+/)
      .filter(Boolean);
  }

  isCoherent(text) {
    const tokens = this.tokenize(text);
    if (tokens.length < 4) return false;

    // must contain relational structure
    const relational = ["because", "so", "but", "and", "while", "when"];
    const hasRelation = tokens.some(t => relational.includes(t));
    if (!hasRelation) return false;

    // no gibberish
    if (/[a-z]{15,}/i.test(text)) return false;

    // no repeated nonsense
    const unique = new Set(tokens);
    if (unique.size < tokens.length * 0.4) return false;

    return true;
  }

  fix(text, userText) {
    const topic = this.tokenize(userText).reduce(
      (a, b) => (b.length > a.length ? b : a),
      ""
    );

    return `Let me reframe that more clearly. You're expressing something about ${topic || "your thoughts"}. What direction do you want to take this?`;
  }

  check(draft, userText) {
    if (this.isCoherent(draft)) return draft;
    return this.fix(draft, userText);
  }
}
