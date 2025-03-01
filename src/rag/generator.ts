// Modify in src/rag/generator.ts
import { logger } from "../utils/logger";
import { extractUrls } from "../utils/link-parser";
import { Article } from "../models/article";
import { retrieveArticleByURL, retrieveRelevantArticles, retrieveRelevantChunks } from "./retriever";
import { NewsMessage } from "../models/message";
import { processNewLink } from "../ingest/content-extractor";
import { QueryResult, Source } from "../models/query";
import { getGeminiModel } from "../config/llm";

export async function generateAnswer(query: string): Promise<QueryResult> {
    try {
        const urls = extractUrls(query);
        let relevantArticles: Article[] = [];
        let chunkContext = '';

        if (urls.length > 0) {
            try {
                const article = await retrieveArticleByURL(urls[0]);
                relevantArticles = [article];
            } catch (err) {
                // Fetch the article and add to the database
                logger.info(`Article not found in DB, attempting to fetch: ${urls[0]}`);
                try {
                    const newsMessage: NewsMessage = {
                        url: urls[0],
                        source: 'dynamic_fetch'
                    };

                    await processNewLink(newsMessage);

                    const article = await retrieveArticleByURL(urls[0]);
                    relevantArticles = [article];

                    logger.info(`Fetched and processed new article: ${urls[0]}`)
                } catch (fetchErr) {
                    logger.error(`Error fetching new article: ${fetchErr}`);
                    logger.info('Go back to standard retrieval')
                    relevantArticles = await retrieveRelevantArticles(query, 5);
                }
            }
        } else {
            // Get chunks first
            const chunks = await retrieveRelevantChunks(query, 8);
            
            // Create context from chunks
            chunkContext = chunks.map(chunk => 
                `CHUNK: ${chunk.content}\nSOURCE: ${chunk.metadata.source}\nTITLE: ${chunk.metadata.title}\nURL: ${chunk.metadata.url}\n\n`
            ).join('---\n');
            
            // Also get the full articles for sources
            relevantArticles = await retrieveRelevantArticles(query, 5);
        }

        const sources: Source[] = relevantArticles.map(article => ({
            title: article.title,
            url: article.url,
            date: article.date,
            source: article.source
        }));

        if (relevantArticles.length === 0) {
            return {
                answer: "I don't have enough information to answer that question based on the articles in my database.",
                sources: []
            };
        }

        // Use chunk context if available, otherwise fall back to article context
        let context = chunkContext;
        
        if (!context) {
            context = relevantArticles.map(article =>
                `TITLE: ${article.title}\nSOURCE: ${article.source}\nDATE: ${article.date}\nCONTENT: ${article.content.substring(0, 1500)}\nURL: ${article.url}\n\n`
            ).join('---\n');
        }

        const model = getGeminiModel();

        const result = await model.generateContent([
            createSystemPrompt(),
            `QUERY: ${query}\n\nCONTEXT:\n${context}`
        ])
        
        const answer = result.response.text();
        return {
            answer,
            sources
        };
    } catch (err) {
        logger.error('Error generating answer:', err);
        throw new Error('Failed to generate answer');
    }
}

function createSystemPrompt(): string {
    return `
    You are a helpful AI assistant that answers questions based on news articles. 
    I will provide you with a query and context from relevant news articles. 
    
    Follow these instructions:
    
    1. Answer the query using only information from the provided context.
    2. If the context doesn't contain relevant information, say so clearly.
    3. Do not make up information or cite sources not provided.
    4. Provide a clear, concise, and accurate response.
    5. If appropriate, mention which sources (by title) contain the information you're using.
    
    ANSWER:
    `
}