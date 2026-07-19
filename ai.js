// ai.js — PURE LOGIC ONLY

export class AIEngine {
  constructor(config = {}) {
    this.memory = {};
    this.personality = config.personality || "neutral";
    this.storyMode = config.storyMode || false;
  }

  setPersonality(p) {
    this.personality = p;
  }

  setStoryMode(on) {
    this.storyMode = on;
  }

  learn(text) {
    const m = text.toLowerCase().match(/my (.+?) is (.+)/);
    if (m) {
      this.memory[m[1].trim()] = m[2].trim();
      return `Got it. I'll remember your ${m[1]} is ${m[2]}.`;
    }
    return null;
  }

  recall(text) {
    const m = text.toLowerCase().match(/what is my (.+)/);
    if (m) {
      const key = m[1].trim();
      if (this.memory[key]) return `Your ${key} is ${this.memory[key]}.`;
      return `You haven't told me your ${key} yet.`;
    }
    return null;
  }

  baseReply(text) {
    if (this.personality === "friendly") {
      return `Okay, so you said: "${text}". That’s interesting—tell me more.`;
    }
    if (this.personality === "serious") {
      return `You said: "${text}". What is your main point?`;
    }
    return `I heard: "${text}". You can also tell me things like "My favorite game is Roblox".`;
  }

  storyReply(text) {
    return `The world grew quiet as you whispered: "${text}". Somewhere, a new story began to unfold...`;
  }

  respond(text) {
    const learned = this.learn(text);
    if (learned) return learned;

    const recalled = this.recall(text);
    if (recalled) return recalled;

    if (this.storyMode) return this.storyReply(text);
    return this.baseReply(text);
  }
        }
