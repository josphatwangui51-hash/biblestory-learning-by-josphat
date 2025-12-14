import { GoogleGenAI } from "@google/genai";
import { QuizQuestion } from "../types";

// Helper to get AI instance with latest key from environment
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateReflectiveContent = async (prompt: string, context: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Please configure your API Key to receive AI insights.";
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: context,
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error while consulting the scriptures.";
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing for TTS");
    return null;
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

export const generateSceneVideo = async (prompt: string): Promise<string | null> => {
  // Check for API Key selection (specific requirement for Veo models)
  if (typeof window !== 'undefined' && (window as any).aistudio) {
     const hasKey = await (window as any).aistudio.hasSelectedApiKey();
     if (!hasKey) {
       await (window as any).aistudio.openSelectKey();
     }
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing for Video Generation");
    return null;
  }

  try {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) return null;

    // Fetch the video bytes using the API key
    const response = await fetch(`${videoUri}&key=${apiKey}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Error generating video:", error);
    // If the error suggests the key is invalid or missing permission, prompt user again
    if (error instanceof Error && error.message.includes("Requested entity was not found") && typeof window !== 'undefined' && (window as any).aistudio) {
       await (window as any).aistudio.openSelectKey();
    }
    return null;
  }
};

export const generateStoryQuiz = async (storyContext: string): Promise<QuizQuestion[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing for Quiz");
    return [];
  }

  try {
    const ai = getAI();
    const prompt = `Generate 5 multiple choice questions based on this Bible story context: ${storyContext}. 
    Return a JSON array where each object has:
    - 'question' (string)
    - 'options' (array of 4 strings)
    - 'correctAnswerIndex' (number, 0-3)
    - 'explanation' (string, short reason why the answer is correct)`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion[];
    }
    return [];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};