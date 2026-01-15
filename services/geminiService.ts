
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client using the mandatory environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates installation notes using Gemini AI.
 * Uses gemini-3-flash-preview for basic text tasks as per instructions.
 */
export const generateInstallationNotes = async (locationName: string, address: string): Promise<string> => {
  try {
    const prompt = `Сгенерируй краткие и четкие заметки по установке и обслуживанию портативной зарядной станции для телефонов в месте "${locationName}" по адресу "${address}". Включи пункты о проверке целостности кабелей, очистке поверхности, обеспечении хорошей видимости и регулярной проверке работоспособности. Ответ дай на русском языке.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Directly access the .text property of GenerateContentResponse.
    return response.text || "Не удалось сгенерировать заметки с помощью ИИ.";
  } catch (error) {
    console.error("Error generating installation notes:", error);
    return "Не удалось сгенерировать заметки с помощью ИИ. Пожалуйста, проверьте консоль на наличие ошибок и введите заметки вручную.";
  }
};
