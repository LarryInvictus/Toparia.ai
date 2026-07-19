// brain.js — reasoning engine (math + structure + topic + logic)

export class BrainEngine {
  constructor() {
    this.history = [];
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, "")
      .split(/\s+/)
      .filter(Boolean);
  }

  complexity(text) {
    const tokens = this.tokenize(text);
    const avgLen = tokens.reduce((a, w) => a + w.length, 0) / (tokens.length || 1);
    return avgLen * tokens.length;
  }

  structure(text) {
    const clauses = text.split(/[,.;!?]/).length;
    return clauses;
  }

  topic(text) {
    const tokens = this.tokenize(text);
    if (!tokens.length) return null;
    return tokens.reduce((a, b) => (b.length > a.length ? b : a), tokens[0]);
  }

  reasoningChain(text) {
    const comp = this.complexity(text);
    const struct = this.structure(text);
    const topic = this.topic(text);

    let base = "";

    if (comp < 20) base = "You're expressing something simple but meaningful.";
    else if (comp < 60) base = "You're working through a layered thought.";
    else base = "You're dealing with a complex idea.";

    let structText = "";
    if (struct <= 2) structText = "It feels direct.";
    else if (struct <= 4) structText = "You're connecting ideas.";
    else structText = "You're weaving multiple thoughts together.";

    let topicText = topic
      ? `The core seems to be "${topic}".`
      : `I'm sensing a general idea, but not a specific topic.`;

    return `${base} ${structText} ${topicText}`;
  }

  respond(text) {
    this.history.push({ role: "user", text });

    const chain = this.reasoningChain(text);

    const draft = `${chain} What part matters most to you right now?`;

    this.history.push({ role: "brain", text: draft });

    return draft;
  }
}
