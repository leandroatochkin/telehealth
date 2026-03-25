import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemSetting } from "./config.service.js";
import { logApiUsage } from "./usage.service.js";

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
  async generateDiagnostic(userPrompt: string, currentDiagnostics: string[]) {
    // 1. Obtenemos la KEY dinámica (Hot-reload)
    const currentApiKey = await getSystemSetting("GEMINI_API_KEY");
    if (!currentApiKey) throw new Error("GEMINI_API_KEY is missing in DB/Env");

    const genAI = new GoogleGenerativeAI(currentApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    try {
      const result = await model.generateContent(`Task: Analyze these symptoms: ${userPrompt}. Existing tags: ${currentDiagnostics.join(", ")}`);
      
      // 2. EXTRAEMOS EL USO DE TOKENS
      const usage = result.response.usageMetadata;
      
      // 3. AQUÍ USAS LA FUNCIÓN DE LOG
      if (usage) {
        await logApiUsage(
          "GEMINI", 
          usage.totalTokenCount, 
          "gemini-2.5-flash"
        );
      }

      let rawText = result.response.text();
      // ... (tu lógica de limpieza de JSON)
      return JSON.parse(rawText.replace(/```json|```/g, "").trim());

    } catch (error: any) {
      console.error("Gemini SDK Error:", error.message);
      throw error;
    }
  }
}