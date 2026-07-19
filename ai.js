// ai.js — REAL AI LOGIC USING GROQ API

export class AIEngine {
  constructor(config = {}) {
    this.memory = {};
    this.personality = config.personality || "neutral";
    this.storyMode = config.storyMode || false;

    this.apiKey = config.apiKey; // REQUIRED
    this.model = "llama3-8b-8192"; // free model
  }

  async generate(text) {
    const body = {
      model: this.model,
      messages: [
        {
          role: "system",
          content: `You are a chatbot with personality: ${this.personality}. Story mode: ${this.storyMode}.`
        },
        {
          role: "user",
          content: text
        }
      ]
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return data.choices[0].message.content;
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

  async respond(text) {
    const learned = this.learn(text);
    if (learned) return learned;

    const recalled = this.recall(text);
    if (recalled) return recalled;

    return await this.generate(text);
  }
}
