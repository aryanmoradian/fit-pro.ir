
import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_CHAT, MODEL_THINKING, MODEL_VISION, MODEL_SEARCH } from "../constants";

// Initialize Client
// NOTE: process.env.API_KEY is injected automatically by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a scientifically backed nutrition plan using Thinking Mode.
 */
export const generateNutritionPlan = async (userProfile: string, goal: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_THINKING,
      contents: `Create a detailed daily nutrition plan for this athlete profile: ${userProfile}. Goal: ${goal}. Include macronutrient breakdown.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for complex biological reasoning
      },
    });
    return response.text;
  } catch (error) {
    console.error("Nutrition Plan Error:", error);
    return "Failed to generate plan. Please try again.";
  }
};

/**
 * Generates a Workout Plan based on profile.
 */
export const generateWorkoutRoutine = async (userProfile: string, focus: string) => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_CHAT,
        contents: `Create a structured workout routine for: ${userProfile}. Focus: ${focus}. 
        Return format should be a list of exercises with Sets, Reps, and Rest times. 
        Follow 'High Intensity Training' or 'Progressive Overload' principles.`,
      });
      return response.text;
    } catch (error) {
      console.error("Workout Gen Error:", error);
      return "Failed to generate workout.";
    }
  };

/**
 * Analyzes a workout video for form correction.
 */
export const analyzeFormVideo = async (videoFile: File, prompt: string) => {
  try {
    // Convert File to Base64
    const base64Data = await fileToBase64(videoFile);
    
    // Send to model
    const response = await ai.models.generateContent({
      model: MODEL_VISION,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: videoFile.type,
              data: base64Data
            }
          },
          { text: prompt || "Analyze the form in this video. Identify errors and suggest corrections." }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Video Analysis Error:", error);
    return "Could not analyze video. Ensure it is a supported format and size.";
  }
};

/**
 * Chat with Search Grounding for research-backed answers.
 */
export const chatWithSearch = async (query: string, history: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_SEARCH,
      contents: `Context: ${history}\n\nUser Query: ${query}`,
      config: {
        tools: [{ googleSearch: {} }], // Enable Search Grounding
      },
    });
    
    const text = response.text;
    // Extract grounding metadata if available
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '#'
    })) || [];

    return { text, sources };
  } catch (error) {
    console.error("Search Chat Error:", error);
    return { text: "Error connecting to knowledge base.", sources: [] };
  }
};

/**
 * Generates a weekly progress report for a trainee using Gemini.
 */
export const generateWeeklyReport = async (traineeName: string, stats: any) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_CHAT,
      contents: `Act as a professional bodybuilding coach. Generate a short, motivating weekly report for my trainee named "${traineeName}".
      
      Here is their data for this week:
      - Consistency Score: ${stats.consistencyScore}%
      - Volume Trend: ${stats.volumeTrend}
      - Nutrition Adherence: ${stats.nutritionAdherence}%
      - Injury Risk: ${stats.injuryRiskScore || 'Low'}

      Analyze this data. If consistency is high, praise them. If volume is down, ask about recovery. If nutrition is low, remind them about muscle fueling.
      Keep it concise (max 3 sentences) and in Persian (Farsi).`,
    });
    return response.text;
  } catch (error) {
    console.error("Report Gen Error:", error);
    return "خطا در تولید گزارش هوشمند. لطفا مجدد تلاش کنید.";
  }
};

// Helper
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove Data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export { ai };
