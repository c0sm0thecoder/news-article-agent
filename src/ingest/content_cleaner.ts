import { getGeminiModel } from "../config/llm";
import { CleanedArticle } from "../models/article";

export async function cleanArticleContent(
    rawContent: { title: string, content: string },
    url: string,
    source: string
): Promise<CleanedArticle> {
    try {
        const model = getGeminiModel();

        const prompt = `
        You are a helpful assistant that processes raw news article content and extracts the key information.
        
        Given the following raw HTML-extracted content from a news article, please clean and structure it into a well-formatted article.
        
        Title: ${rawContent.title}
        
        Raw Content:
        ${rawContent.content.substring(0, 10000)} // Limiting content length
        
        Please respond with a JSON object in this exact format:
        {
          "title": "Clean article title",
          "content": "Clean article content without any HTML or extraneous text",
          "date": "Article publication date in YYYY-MM-DD format if you can detect it, otherwise use today's date"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : '{}';
            const cleaned = JSON.parse(jsonString);

            return {
                title: cleaned.title || rawContent.title.trim(),
                content: cleaned.content || rawContent.content.replace(/\s+/g, ' ').trim(),
                date: cleaned.date || new Date().toISOString().split('T')[0],
                url,
                source
            };
        } catch (err) {
            // Return intuitively cleaned content
            return {
                title: rawContent.title.trim(),
                content: rawContent.content.replace(/\s+/g, ' ').trim(),
                url,
                date: new Date().toISOString().split('T')[0], // Today's date as fallback
                source
            };
        }
    } catch (err) {
        throw new Error('Failed to clean article content');
    }
}