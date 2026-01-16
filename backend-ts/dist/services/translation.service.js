import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const translateResponse = async (data, targetLanguage) => {
    if (targetLanguage === 'en')
        return data;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    Translate the following diagnostic result to the language code: ${targetLanguage}.
    Keep the JSON structure exactly the same. 
    Only translate the values for 'technical_reasoning', 'repair_steps', 'urgency', and 'preventive_measures'.
    Keep 'issue' and 'severity' in English if they are technical terms, or translate if appropriate.
    
    JSON: ${JSON.stringify(data)}
  `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    }
    catch (error) {
        console.error("Translation Error:", error);
    }
    return data; // Fallback to English
};
