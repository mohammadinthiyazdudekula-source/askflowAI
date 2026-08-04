import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

console.log('Testing GEMINI_API_KEY:', apiKey.substring(0, 15) + '...');

async function testKey() {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Explain React Hooks in TypeScript in 2 sentences.',
    });

    console.log('✅ Google Gemini 2.5 Flash SUCCESS Response:');
    console.log(response.text);
  } catch (err: any) {
    console.error('❌ Error testing key:', err?.message || err);
  }
}

testKey();
