import { GoogleGenAI } from '@google/genai';
import {
  MINDMAP_JSON_SCHEMA,
  buildMindMapPrompt,
  sanitizeMindMap
} from '../utils/mindmap.js';

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function generateMindMap(request, response, next) {
  try {
    const ai = getGeminiClient();
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const text = typeof request.body?.text === 'string' ? request.body.text.trim() : '';

    if (!text) {
      const error = new Error('Please provide some notes or paragraphs to convert.');
      error.statusCode = 400;
      error.expose = true;
      throw error;
    }

    if (text.length < 20) {
      const error = new Error('Add a little more context so the AI can build a useful mind map.');
      error.statusCode = 400;
      error.expose = true;
      throw error;
    }

    if (!ai) {
      const error = new Error('GEMINI_API_KEY is missing on the server.');
      error.statusCode = 500;
      error.expose = true;
      throw error;
    }

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

    const rawOutput = aiResponse.text?.trim();

    if (!rawOutput) {
      const error = new Error('Gemini returned an empty response.');
      error.statusCode = 502;
      error.expose = true;
      throw error;
    }

    const parsedMindMap = JSON.parse(rawOutput);
    const mindMap = sanitizeMindMap(parsedMindMap);

    response.status(200).json({
      mindMap,
      model
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof SyntaxError) {
      error.statusCode = 502;
      error.expose = true;
      error.message = 'The AI response was not valid JSON.';
    }

    if (error.status === 401 || error.status === 429) {
      error.statusCode = error.status;
      error.expose = true;
    }

    next(error);
  }
}
