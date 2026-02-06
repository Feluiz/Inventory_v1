
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getReportInsights(reportData: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following sales and inventory report for a coffee production group and provide 3 key business recommendations in a concise JSON format:
      ${JSON.stringify(reportData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["insights"]
        }
      }
    });

    return JSON.parse(response.text).insights;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return ["Optimize stock for high-demand items.", "Review shipping costs for Ecotact products.", "Focus on Finca Don Rafa seasonal peaks."];
  }
}
