import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEnvironmentVariables } from "./environment";

let genAI: GoogleGenerativeAI;
const MODEL_NAME = 'gemini-pro';

export function initGemini(): GoogleGenerativeAI {
    const env = getEnvironmentVariables();
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    return genAI;
}

export function getGeminiModel() {
    if (!genAI) {
        initGemini();
    }
    return genAI.getGenerativeModel({ model: MODEL_NAME })
}

export async function generateEmbeddings(text: string): Promise<number[]> {
    if (!genAI) {
        initGemini();
    }
    const embeddingModel = genAI.getGenerativeModel({model: 'embedding-001'});
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}
