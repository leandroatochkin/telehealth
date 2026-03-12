import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are a professional medical assistant. Analyze the patient's consultation details and suggest a clinical analysis and diagnostic tags.
Output ONLY a valid JSON object.

RULES:
1. Provide a field "details" with a concise clinical summary (max 5 sentences) and a suspected diagnostic.
2. Provide a field "diagnostics" which is a flat array of possible medical diagnostics.
3. Language: Respond in the same language as the input (Spanish).
4. Do NOT include markdown backticks or extra text.

EXAMPLE OUTPUT:
{
  "details": "El paciente presenta síntomas compatibles con una infección respiratoria superior.",
  "diagnostics": ["Fiebre", "Rinitis"]
}
`

export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateDiagnostic(userPrompt: string, currentDiagnostics: string[]) {
    // Current stable version as of 2026: gemini-2.5-flash
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    try {
      // We pass the prompt. The SDK handles the system instruction separately.
      const result = await model.generateContent(`Task: Analyze these symptoms: ${userPrompt}. Existing tags: ${currentDiagnostics.join(", ")}`);
      let rawText = result.response.text();

      // FIX: Clean markdown if the model included it
      rawText = rawText.replace(/```json|```/g, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (err) {
        console.error("❌ Failed to parse Gemini response:", rawText);
        throw new Error("Invalid AI Response format");
      }

      // Return the structured data to your controller
      return {
        details: parsed.details || "No se pudo generar el análisis.",
        diagnostics: parsed.diagnostics || []
      };
    } catch (error: any) {
      console.error("Gemini SDK Error:", error.message);
      throw error;
    }
  }
}