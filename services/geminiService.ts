
import { GoogleGenAI } from "@google/genai";

export const enhancePrompt = async (apiKey: string, draft: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are a world-class Prompt Engineer. 
    Your task is to rewrite the provided "draft prompt" into a "master-level prompt".
    
    Structure the enhanced prompt using these core components:
    1. Persona: Define who the AI should be.
    2. Context: Provide relevant background information.
    3. Task: Clearly state the primary objective.
    4. Constraints: List specific limitations or requirements.
    5. Output Format: Define exactly how the response should look.

    IMPORTANT: 
    - Return ONLY the improved prompt text.
    - Do not include any introductory text, labels like "Here is your prompt", or conversational filler.
    - Keep the tone professional and precise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Draft Prompt to Enhance:\n\n${draft}` }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("The AI returned an empty response.");
    }

    return resultText;
  } catch (error: any) {
    if (error.message?.includes("401") || error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid API Key. Please reset and try again.");
    }
    if (error.message?.includes("429")) {
      throw new Error("Rate limit exceeded. Please wait a moment.");
    }
    throw new Error(error.message || "An unexpected error occurred while enhancing the prompt.");
  }
};
