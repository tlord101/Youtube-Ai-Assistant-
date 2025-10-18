
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Project, Task } from '../types';

const planGenerationModel = 'gemini-2.5-flash';
const chatModel = 'gemini-2.5-flash';

// Helper function to get the AI client just-in-time
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This error is now thrown only when an API call is attempted, not on app load.
    throw new Error("API_KEY is not available. Please ensure it is configured correctly.");
  }
  return new GoogleGenAI({ apiKey });
}

export const generateGrowthPlan = async (
  channelName: string,
  niche: string,
  targetAudience: string,
  contentType: string
): Promise<Omit<Task, 'isCompleted'>[]> => {
  const ai = getAiClient();
  const prompt = `
    Act as an expert YouTube growth strategist. Generate a 3-day YouTube content plan for a channel with the following details:
    - Channel Name: "${channelName}"
    - Niche: "${niche}"
    - Target Audience: "${targetAudience}"
    - Content Type: "${contentType}"

    Your response MUST be a valid JSON array of 3 objects and nothing else. Do not include any introductory text, markdown formatting, or explanations outside of the JSON structure.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: planGenerationModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.INTEGER },
              title: { type: Type.STRING },
              hook: { type: Type.STRING },
              description: { type: Type.STRING },
              keywords: { type: Type.STRING },
              growthTip: { type: Type.STRING },
            },
            required: ["day", "title", "hook", "description", "keywords", "growthTip"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const plan = JSON.parse(jsonString);
    return plan;
  } catch (error) {
    console.error("Error generating growth plan:", error);
    throw new Error("Failed to generate growth plan. Please check your API key and try again.");
  }
};

export const generateAdditionalTasks = async (
  project: Project,
  startDay: number
): Promise<Omit<Task, 'isCompleted'>[]> => {
  const ai = getAiClient();
  const existingPlanString = project.tasks.map(t => `- Day ${t.day}: ${t.title}`).join('\n');

  const prompt = `
    Act as an expert YouTube growth strategist. You are continuing an existing content plan for a YouTube channel.

    Channel Details:
    - Channel Name: "${project.channelName}"
    - Niche: "${project.niche}"
    - Target Audience: "${project.targetAudience}"
    - Content Type: "${project.contentType}"

    Existing Plan Summary:
    ${existingPlanString}

    Your task is to generate the NEXT 3 days of the content plan, starting from Day ${startDay}.
    The new tasks should logically follow the existing ones.

    Your response MUST be a valid JSON array of 3 objects, starting with day ${startDay}, and nothing else. Do not include any introductory text, markdown formatting, or explanations outside of the JSON structure.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: planGenerationModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.INTEGER },
              title: { type: Type.STRING },
              hook: { type: Type.STRING },
              description: { type: Type.STRING },
              keywords: { type: Type.STRING },
              growthTip: { type: Type.STRING },
            },
            required: ["day", "title", "hook", "description", "keywords", "growthTip"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const plan = JSON.parse(jsonString);
    return plan;
  } catch (error) {
    console.error("Error generating additional tasks:", error);
    throw new Error("Failed to generate additional tasks. Please try again.");
  }
};


export const continueChat = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    const ai = getAiClient();
    const chat = ai.chats.create({
        model: chatModel,
        config: {
            systemInstruction: 'You are the "YouTube Growth Companion," a friendly and expert AI assistant dedicated to helping creators grow their YouTube channels. Provide concise, actionable, and encouraging advice. Your goal is to be a supportive partner in their content creation journey. Format your responses using markdown for readability.'
        },
        history: history.map(msg => ({
            role: msg.role,
            parts: [{text: msg.content}]
        }))
    });

    try {
        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Error in chat:", error);
        throw new Error("Failed to get a response from the assistant.");
    }
};