import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const generateStructuredDiagnosis = async (issue, severity, description) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    You are an expert civil engineer and property inspector. 
    Analyze the following property issue:
    Issue: ${issue}
    Severity: ${severity}
    User Description: ${description}

    Provide a structured response in JSON format with the following keys:
    - technical_reasoning: Brief explanation of why this happens.
    - repair_steps: Array of 3-5 clear steps to fix it.
    - urgency: One sentence on why it needs attention now.
    - preventive_measures: Array of 2-3 steps to avoid this in the future.
  `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Extract JSON from the response text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse Gemini JSON response");
    }
    catch (error) {
        console.error("Gemini Service Error:", error);
        return {
            technical_reasoning: `Analysis of ${issue} issue detected with ${severity} severity.`,
            repair_steps: ["Contact a professional", "Inspect the affected area", "Apply standard repairs"],
            urgency: "This issue should be addressed to prevent further damage.",
            preventive_measures: ["Regular maintenance", "Periodic inspections"]
        };
    }
};
export const getSeverityWithVision = async (images, issue, description) => {
    // Implementation of vision-based severity using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // For simplicity, we'll take the first image if available
    // In a full implementation, we'd handle all images
    const parts = [
        { text: `Identify the severity (Low, Moderate, Immediate) for this ${issue} based on the image and description: "${description}". Return ONLY the severity word.` },
    ];
    // Note: Express multer files will be processed here
    // This is a placeholder for the vision logic which requires base64 images
    return "Moderate"; // Fallback
};
