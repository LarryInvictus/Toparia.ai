// ai.js — NATURAL OFFLINE LOGIC ENGINE (NO APIS)

export class AIEngine {
  constructor(config = {}) {
    this.personality = config.personality || "neutral";
    this.mode = config.mode || "chat";
    this.style = config.style || "balanced";

    this.memory = {
      facts: {},
      impressions: {},
      topics: [],
      lastTopic: null
    };

    this.history = [];
  }

  inferEmotion(text) {
    if (text.endsWith("!")) return "excited";
    if (text.includes("...")) return "thoughtful";
    if (text.length < 10) return "casual";
    if (text.match(/[A-Z]{3,}/)) return "intense";
    return "neutral";
  }

  inferIntent(text) {
    if (text.length > 120) return "ramble";
    if (text.includes("?")) return "curious";
    if (text.startsWith("I")) return "personal";
    if (text.startsWith("So")) return "reflective";
    return "chat";
  }

  inferTopic(text) {
    const words = text.split(/\s+/);
    const nouns = words.filter(w => /^[A-Za-z]+$/.test(w) && w.length > 3);
    const topic = nouns[nouns.length - 1] || null;

    if (topic) {
      this.memory.topics.push(topic);
      this.memory.lastTopic = topic;
    }

    return topic;
  }

  updateImpression(text) {
    const topic = this.memory.lastTopic;
    if (!topic) return;
    const tone = this.inferEmotion(text);
    this.memory.impressions[topic] = tone;
  }

  generateChat(text, topic, emotion) {
    const toneMap = {
      neutral: "Alright, I’m following you.",
      excited: "You’ve got some energy behind that.",
      thoughtful: "You’re thinking deeply about this.",
      casual: "Gotcha.",
      intense: "You’re really feeling this."
    };

    const base = toneMap[emotion] || toneMap.neutral;
    return `${base} You’re talking about ${topic || "something interesting"}. Tell me more about where your head’s at.`;
  }

  generateCurious(text, topic) {
    return `You’re wondering about ${topic || "that"}. What part of it pulls your attention the most?`;
  }

  generatePersonal(text, topic) {
    return `You’re opening up a bit. I’m listening. What does ${topic || "that"} mean to you personally?`;
  }

  generateReflective(text, topic) {
    return `You’re reflecting on ${topic || "something"}. What made you think about this today?`;
  }

  generateRamble(text, topic) {
    return `You’ve got a lot on your mind. Let’s slow it down. What’s the core of what you’re trying to say about ${topic || "this"}?`;
  }

  generateStory(text, topic) {
    return `The moment you said "${text}", the scene shifted.\n\nA quiet spark lit inside the world, centered around ${topic || "something undefined"}. If this were the beginning of a story, what would happen next?`;
  }

  shapeStyle(reply) {
    if (this.style === "short") return reply.split(".")[0] + ".";
    if (this.style === "long") return reply + "\n\nIf you want, we can go deeper.";
    if (this.style === "casual") return reply.replace("You’re", "You're kinda");
    if (this.style === "formal") return reply.replace("Alright", "Understood");
    return reply;
  }

  async respond(text) {
    this.history.push({ role: "user", text });

    const emotion = this.inferEmotion(text);
    const intent = this.inferIntent(text);
    const topic = this.inferTopic(text);

    this.updateImpression(text);

    let reply;
    if (this.mode === "storyteller") {
      reply = this.generateStory(text, topic);
    } else {
      switch (intent) {
        case "curious": reply = this.generateCurious(text, topic); break;
        case "personal": reply = this.generatePersonal(text, topic); break;
        case "reflective": reply = this.generateReflective(text, topic); break;
        case "ramble": reply = this.generateRamble(text, topic); break;
        default: reply = this.generateChat(text, topic, emotion);
      }
    }

    const shaped = this.shapeStyle(reply);
    this.history.push({ role: "ai", text: shaped });
    return shaped;
  }
}
