
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateInstallationNotes = async (locationName: string, address: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return Promise.resolve("Ключ API не настроен. Пожалуйста, введите заметки вручную.");
  }

  try {
    const prompt = `Сгенерируй краткие и четкие заметки по установке и обслуживанию портативной зарядной станции для телефонов в месте "${locationName}" по адресу "${address}". Включи пункты о проверке целостности кабелей, очистке поверхности, обеспечении хорошей видимости и регулярной проверке работоспособности. Ответ дай на русском языке.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating installation notes:", error);
    return "Не удалось сгенерировать заметки с помощью ИИ. Пожалуйста, проверьте консоль на наличие ошибок и введите заметки вручную.";
  }
};
