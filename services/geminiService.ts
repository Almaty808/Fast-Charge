
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client using the mandatory environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates installation notes using Gemini AI.
 */
export const generateInstallationNotes = async (locationName: string, address: string): Promise<string> => {
  try {
    const prompt = `Сгенерируй краткие и четкие заметки по установке и обслуживанию портативной зарядной станции для телефонов в месте "${locationName}" по адресу "${address}". Включи пункты о проверке целостности кабелей, очистке поверхности, обеспечении хорошей видимости и регулярной проверке работоспособности. Ответ дай на русском языке.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Не удалось сгенерировать заметки с помощью ИИ.";
  } catch (error) {
    console.error("Error generating installation notes:", error);
    return "Ошибка ИИ при генерации заметок.";
  }
};

/**
 * Analyzes inventory levels and provides stock forecasting.
 */
export const analyzeInventory = async (items: any[]): Promise<string> => {
  try {
    const stockSummary = items.map(i => `${i.name}: ${i.quantity} ${i.unit} (мин. порог: ${i.minThreshold})`).join(', ');
    const prompt = `Проанализируй состояние склада зарядных станций: ${stockSummary}. 
    Дай краткий прогноз (3-4 предложения): что закончится быстрее всего, какие риски для расширения сети и конкретную рекомендацию по закупке. 
    Ответ дай в профессиональном стиле на русском языке.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Анализ склада временно недоступен.";
  } catch (error) {
    console.error("Error analyzing inventory:", error);
    return "Не удалось провести анализ запасов.";
  }
};
