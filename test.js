import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { MINDMAP_JSON_SCHEMA, buildMindMapPrompt } from './utils/mindmap.js';

dotenv.config();

async function runTest() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = 'gemini-2.5-flash';
    const text = "A database needs to be fast and also secure. It should use robust authentication mechanisms. We should index the columns that are frequently used in queries to reduce response time.";

    const aiResponse = await ai.models.generateContent({
      model,
      contents: buildMindMapPrompt(text),
      config: {
        systemInstruction: 'You transform user notes into concise, visually balanced mind map structures.',
        responseMimeType: 'application/json',
        responseSchema: MINDMAP_JSON_SCHEMA,
        temperature: 0.2
      }
    });
    
    console.log("Success:", aiResponse.text);
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

runTest();
