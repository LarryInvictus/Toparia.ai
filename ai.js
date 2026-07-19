// ai.js — MASSIVE OFFLINE AI LOGIC ENGINE (NO APIS)

export class AIEngine {
  constructor(config = {}) {
    this.personality = config.personality || "neutral"; 
    this.mode = config.mode || "chat"; 
    this.style = config.style || "normal"; 
    this.emotion = "neutral";

    this.memory = {
      facts: {},
      prefs: {},
      tags: new Set(),
      topics: new Set(),
      lastTopic: null
    };

    this.history = [];
  }

  // -----------------------------
  // HISTORY
  // -----------------------------
  addHistory(role, text) {
    this.history.push({ role, text });
    if (this.history.length > 100) this.history.shift();
  }

  lastUserMessage() {
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].role === "user") return this.history[i].text;
    }
    return null;
  }

  // -----------------------------
  // MEMORY
  // -----------------------------
  learn(text) {
    const lower = text.toLowerCase();

    // "my X is Y"
    const fact = lower.match(/my (.+?) is (.+)/);
    if (fact) {
      const key = fact[1].trim();
      const value = fact[2].trim();
      this.memory.facts[key] = value;
      this.memory.tags.add(key);
      this.memory.lastTopic = key;
      return `Got it. I'll remember your ${key} is ${value}.`;
    }

    // "i like X"
    const like = lower.match(/i (like|love) (.+)/);
    if (like) {
      const item = like[2].trim();
      this.memory.prefs[item] = "like";
      this.memory.tags.add(item);
      this.memory.lastTopic = item;
      return `Nice, you like ${item}. I'll keep that in mind.`;
    }

    return null;
  }

  recall(text) {
    const lower = text.toLowerCase();

    // "what is my X"
    const ask = lower.match(/what is my (.+)/);
    if (ask) {
      const key = ask[1].trim();
      if (this.memory.facts[key]) {
        return `Your ${key} is ${this.memory.facts[key]}.`;
      }
      return `You haven't told me your ${key} yet.`;
    }

    // "what do i like"
    if (lower.includes("what do i like")) {
      const items = Object.keys(this.memory.prefs);
      if (!items.length) return `You haven't told me what you like yet.`;
      return `You told me you like: ${items.join(", ")}.`;
    }

    return null;
  }

  // -----------------------------
  // EMOTION ENGINE
  // -----------------------------
  detectEmotion(text) {
    const lower = text.toLowerCase();

    if (lower.includes("sad") || lower.includes("upset")) return "sympathetic";
    if (lower.includes("happy") || lower.includes("excited")) return "happy";
    if (lower.includes("angry") || lower.includes("mad")) return "calm";
    if (lower.includes("bored")) return "energetic";

    return "neutral";
  }

  emotionReply(text) {
    switch (this.emotion) {
      case "sympathetic":
        return `I can tell you're feeling down. Want to talk about it?`;
      case "happy":
        return `You sound excited! What's making you feel that way?`;
      case "calm":
        return `I hear the frustration. Let's slow it down—what happened?`;
      case "energetic":
        return `Alright, let's shake things up! What do you want to do?`;
      default:
        return null;
    }
  }

  // -----------------------------
  // INTENT ENGINE
  // -----------------------------
  detectIntent(text) {
    const lower = text.toLowerCase();

    if (lower.includes("help") || lower.includes("how do i")) return "help";
    if (lower.includes("story") || lower.startsWith("tell me a story")) return "story";
    if (lower.includes("explain") || lower.includes("what is") || lower.includes("who is")) return "info";
    if (lower.includes("remember") || lower.includes("my ") || lower.includes("i like")) return "memory";

    return "chat";
  }

  // -----------------------------
  // RESPONSE ENGINES
  // -----------------------------
  chatReply(text) {
    switch (this.personality) {
      case "friendly":
        return `Okay, so you said: "${text}". That’s pretty interesting—what made you think of that?`;
      case "serious":
        return `You said: "${text}". What are you trying to figure out?`;
      case "chaotic":
        return `You dropped "${text}" into the void. The void laughed. What’s next?`;
      default:
        return `I heard: "${text}". Want to go deeper?`;
    }
  }

  helpReply(text) {
    return `You're asking for help with: "${text}". Let's break it down.\n1. What do you want?\n2. What have you tried?\n3. What’s blocking you?\nTell me step 1.`;
  }

  infoReply(text) {
    return `You're asking about: "${text}". I can’t search the web, but here’s how to think about it:\n- What is it?\n- Why does it matter?\n- How does it connect to you?\nWant to explore one of those?`;
  }

  storyReply(text) {
    return `The world shifted as you said: "${text}". A new chapter began.\n\nIn a quiet place, someone decided to build something different—no ads, no noise, just pure imagination.\n\nIf this were the opening scene, what would happen next?`;
  }

  // -----------------------------
  // STYLE ENGINE
  // -----------------------------
  shapeStyle(reply) {
    if (this.style === "short") {
      return reply.split(".")[0] + ".";
    }
    if (this.style === "long") {
      return reply + "\n\nIf you want, we can go deeper.";
    }
    if (this.style === "formal") {
      return reply.replace("okay", "understood").replace("pretty", "quite");
    }
    if (this.style === "casual") {
      return reply.replace("You said:", "So you said:").replace("What are you trying to figure out?", "What’s up?");
    }
    return reply;
  }

  // -----------------------------
  // MAIN RESPONDER
  // -----------------------------
  async respond(text) {
    this.addHistory("user", text);

    // emotion
    this.emotion = this.detectEmotion(text);
    const emo = this.emotionReply(text);
    if (emo) {
      const shaped = this.shapeStyle(emo);
      this.addHistory("ai", shaped);
      return shaped;
    }

    // memory
    const learned = this.learn(text);
    if (learned) {
      const shaped = this.shapeStyle(learned);
      this.addHistory("ai", shaped);
      return shaped;
    }

    const recalled = this.recall(text);
    if (recalled) {
      const shaped = this.shapeStyle(recalled);
      this.addHistory("ai", shaped);
      return shaped;
    }

    // intent
    const intent = this.detectIntent(text);

    let reply;
    if (intent === "story" || this.mode === "storyteller") reply = this.storyReply(text);
    else if (intent === "help" || this.mode === "helper") reply = this.helpReply(text);
    else if (intent === "info") reply = this.infoReply(text);
    else reply = this.chatReply(text);

    const shaped = this.shapeStyle(reply);
    this.addHistory("ai", shaped);
    return shaped;
  }
        }
