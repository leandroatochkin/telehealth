import { OpenAI } from "openai";

export class AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not defined in environment variables");
    }

    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // Required for some OpenRouter models
        "X-Title": "Telehealth App", 
      }
    });
  }

  async generateDiagnostic(details: string, currentDiagnostics: string[]) {
    const prompt = `
      Eres un asistente clínico profesional. Analiza los detalles de la consulta y sugiere diagnósticos.
      REGLAS:
      1. Respuesta ÚNICAMENTE en formato JSON.
      2. Análisis breve (máximo 3 oraciones).
      3. Sugiere 2 a 4 etiquetas de diagnóstico (CIE-10 o términos médicos).
      
      Detalles de la consulta: "${details}"
      Etiquetas actuales: ${currentDiagnostics.join(", ")}

      FORMATO JSON ESPERADO:
      {
        "details": "Análisis IA: [Tu análisis aquí]",
        "diagnostics": ["Tag1", "Tag2"]
      }
    `;

    const models = [
    "qwen/qwen-2-7b-instruct:free"
  ];


    let lastError;

  for (const model of models) {
    try {
      console.log(`Attempting AI analysis with model: ${model}`);
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response?.choices[0]?.message.content || "{}");
    } catch (error: any) {
      console.warn(`Model ${model} failed: ${error.message}`);
      lastError = error;
      continue; // Try the next model in the list
    }
  }

  // If all models fail, throw the last error
  throw new Error(`All AI models failed. Last error: ${lastError?.message}`);
  }
}

