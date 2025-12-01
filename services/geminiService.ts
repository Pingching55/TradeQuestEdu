import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getMentorResponse = async (userMessage: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the environment.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: `You are an expert Forex Trading Mentor. 
        Your goal is to guide a student trader. 
        Be concise, professional, and encouraging. 
        Focus on risk management, price action, and psychology. 
        Do not give financial advice to buy specific assets now, but explain concepts.
        If they ask about a trade, ask for details like Entry, Stop Loss, and Take Profit.`,
      }
    });
    
    return response.text || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am having trouble connecting to the market data right now.";
  }
};