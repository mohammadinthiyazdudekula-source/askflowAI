import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateGeminiResponse(
  userMessage: string,
  history: ChatHistoryMessage[] = []
): Promise<string> {
  // Dynamically reload process.env from .env file so key changes take effect immediately
  dotenv.config({ override: true });

  const rawKey = process.env.GEMINI_API_KEY;
  const apiKey = rawKey ? rawKey.trim() : '';

  // 1. Attempt Live Google Gemini API call if key is present
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    const contents = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const ai = new GoogleGenAI({ apiKey });
    // Primary Gemini 2.5 Flash model
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastApiError: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction:
              'You are AskFlow AI, an intelligent, sleek, and highly capable AI companion powered by Google Gemini 2.5 Flash. Provide clear, accurate, markdown-formatted, and helpful responses.',
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        console.warn(`[AskFlow AI] Gemini model ${modelName} error:`, err?.message || err);
        lastApiError = err?.message || String(err);
      }
    }

    // If Google Gemini API returned an error (e.g. Quota Exceeded, Invalid Key), display the error details clearly
    if (lastApiError) {
      let cleanError = lastApiError;
      try {
        const parsed = JSON.parse(lastApiError);
        if (parsed.error?.message) {
          cleanError = parsed.error.message;
        }
      } catch {}

      return (
        `⚠️ **Google Gemini API Error**\n\n` +
        `Google Gemini API rejected the request with the following error:\n\n` +
        `\`\`\`\n${cleanError}\n\`\`\`\n\n` +
        `---\n\n` +
        `### 🔑 How to resolve:\n` +
        `1. Google AI Studio API keys always start with **\`AIzaSy...\`**.\n` +
        `2. Your current key in \`backend/.env\` is: \`${apiKey.substring(0, 12)}...\`\n` +
        `3. Get a free API key from [Google AI Studio](https://aistudio.google.com/)\n` +
        `4. Update \`GEMINI_API_KEY=AIzaSy...\` in \`backend/.env\` and try again!`
      );
    }
  }

  // 2. Fallback Mode when no API key is provided
  return generateKnowledgeEngineResponse(userMessage);
}

/**
 * Universal Knowledge & Conversational Engine - Fallback when no GEMINI_API_KEY is configured.
 */
function generateKnowledgeEngineResponse(prompt: string): string {
  const query = prompt.toLowerCase().trim();

  // --- 1. GRATITUDE & THANKS ---
  if (
    /^(thank|thanks|thx|thank u|thankyou|many thanks|appreciate it|great job|nice job|awesome|cool|perfect)\b/i.test(query) ||
    query.includes('thank you') ||
    query.includes('thanks')
  ) {
    return (
      `You're very welcome! 😊 It's my pleasure to help.\n\n` +
      `Feel free to ask any other coding questions, data structure problems, or general topics whenever you're ready!`
    );
  }

  // --- 2. AFFIRMATIONS & CONTINUATIONS ---
  if (
    /^(yes|yeah|sure|go ahead|yeah go ahead|ok|okay|sounds good|yep|yup|do it|proceed|let's do it|lets do it)\b/i.test(query) ||
    query === 'yes' ||
    query === 'yeah' ||
    query === 'ok' ||
    query === 'okay'
  ) {
    return (
      `Awesome! 🚀 What would you like to build or explore next?\n\n` +
      `You can ask me to:\n` +
      `- Solve coding & algorithm problems (Two Sum, Linked Lists, Binary Trees)\n` +
      `- Write code in Python, TypeScript, React, Node.js, SQL\n` +
      `- Explain any science, engineering, or general knowledge topic`
    );
  }

  // --- 3. TWO SUM PROBLEM ---
  if (query.includes('two sum') || query.includes('twosum')) {
    return (
      `## 🧩 Two Sum Problem Solution (Python & JavaScript)\n\n` +
      `The **Two Sum** problem asks us to find two indices in an array \`nums\` whose numbers add up to a target integer \`target\`.\n\n` +
      `\`\`\`python\n` +
      `def twoSum(nums: list[int], target: int) -> list[int]:\n` +
      `    seen = {}  # Map number -> index\n` +
      `    for i, num in enumerate(nums):\n` +
      `        complement = target - num\n` +
      `        if complement in seen:\n` +
      `            return [seen[complement], i]\n` +
      `        seen[num] = i\n` +
      `    return []\n` +
      `\`\`\``
    );
  }

  // --- 4. LINKED LIST ---
  if (query.includes('linked list') || query.includes('linkedlist')) {
    return (
      `## 🔗 Linked List Data Structure (Python & TypeScript)\n\n` +
      `A **Linked List** is a linear data structure where elements (nodes) are connected via pointers.\n\n` +
      `\`\`\`python\n` +
      `class ListNode:\n` +
      `    def __init__(self, val=0, next=None):\n` +
      `        self.val = val\n` +
      `        self.next = next\n` +
      `\`\`\``
    );
  }

  // --- 5. CAPABILITIES & HELP ---
  if (
    query.includes('what else can you do') ||
    query.includes('what can you do') ||
    query.includes('what are your features') ||
    query === 'help' ||
    query === 'capabilities'
  ) {
    return (
      `## 🤖 AskFlow AI Capabilities & Feature Overview\n\n` +
      `I am equipped with comprehensive capabilities across software engineering, data structures, full-stack development, and science:\n\n` +
      `### 1. 🧩 Data Structures & Algorithms (DSA)\n` +
      `- Solving LeetCode problems (Two Sum, Linked Lists, Binary Trees, Dynamic Programming, Graphs, Sorting).\n` +
      `- Code implementations in Python, TypeScript, C++, Java.\n\n` +
      `### 2. 💻 Full-Stack Web Development\n` +
      `- **Frontend**: React 18, TypeScript, Tailwind CSS, Next.js, responsive layouts.\n` +
      `- **Backend**: Node.js, Express.js APIs, Zod validation, Supabase PostgreSQL, RLS security.\n\n` +
      `### 3. 🔬 Science & General Knowledge\n` +
      `- Explaining Quantum Mechanics, Solar Energy, Hydration & Health, and General Concepts.`
    );
  }

  // --- 6. SMALL TALK & GREETINGS ---
  if (/^(hi|hello|hey|greetings|good morning|good evening|good afternoon)\b/i.test(query)) {
    return (
      `Hello! 👋 I am **AskFlow AI**, your full-stack AI chatbot assistant.\n\n` +
      `I'm ready to help with coding problems, data structures, web development, and general questions!\n\n` +
      `**How can I assist you today?**`
    );
  }

  // --- 7. DYNAMIC NATURAL FALLBACK ---
  const cleanTopic = prompt
    .replace(/^(explain me|explain|how to solve|solve|write|how does|what is|how do)/i, '')
    .trim();

  const displayTitle = cleanTopic.length > 0
    ? cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1)
    : prompt;

  return (
    `## 💻 Overview: **${displayTitle}**\n\n` +
    `Here is an overview regarding **"${prompt}"**:\n\n` +
    `1. **Core Concept**: When working with **${displayTitle}**, the primary objective is to structure logic efficiently.\n` +
    `2. **Key Consideration**: Ensure systematic execution, clear modular code, and standard best practices.\n` +
    `3. **Summary**: Let me know if you would like specific code examples or deeper explanations!`
  );
}
