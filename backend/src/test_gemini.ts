import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';

  const ai = new GoogleGenAI({ apiKey });
  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro-latest',
  ];

  for (const m of models) {
    try {
      console.log(`Trying model ${m}...`);
      const res = await ai.models.generateContent({
        model: m,
        contents: [{ role: 'user', parts: [{ text: 'Hello, explain CSS briefly.' }] }],
      });
      console.log(`SUCCESS with ${m}:`, res.text?.substring(0, 100));
      return;
    } catch (e: any) {
      console.error(`Error with ${m}:`, e?.message?.substring(0, 150) || e);
    }
  }
}

test();
