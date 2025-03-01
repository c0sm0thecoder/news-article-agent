import { generateEmbeddings } from "../config/llm";
import { getPool } from "../db/pgvector";
import { CleanedArticle } from "../models/article";
import { logger } from "../utils/logger";
import { chunkDocument } from "./chunker";

export async function storeArticle(article: CleanedArticle): Promise<void> {
    const pool = getPool();

    try {
        const existingResult = await pool.query(
            'SELECT id FROM articles WHERE url = $1',
            [article.url]
        );

        if (existingResult.rows.length > 0) {
            logger.info(`Article already exists: ${article.url}`);
            return;
        }

        // First store the main article record
        const articleResult = await pool.query(
            `INSERT INTO articles (title, content, url, date, source)
            VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [article.title, article.content, article.url, article.date, article.source]
        );
        
        const articleId = articleResult.rows[0].id;
        
        // Chunk the document using LangChain
        const chunks = await chunkDocument(article);
        
        // Store each chunk with its embedding
        for (const chunk of chunks) {
            // Generate embedding for this chunk
            const vector = await generateEmbeddings(chunk.text);
            
            // Store the chunk in chunks table
            await pool.query(
                `INSERT INTO chunks (article_id, chunk_index, content, metadata, vector)
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    articleId, 
                    chunk.metadata.chunkIndex,
                    chunk.text,
                    JSON.stringify(chunk.metadata),
                    vector
                ]
            );
        }

        logger.info(`Article stored with ${chunks.length} chunks: ${article.title}`);
    } catch (err) {
        logger.error('Error storing article:', err);
        throw new Error('Failed to store article');
    }
}

export async function vectorizeQuery(query: string): Promise<number[]> {
    try {
        return await generateEmbeddings(query);
    } catch (err) {
        logger.error('Error vectorizing query:', err);
        throw new Error('Failed to vectorize query')
    }
}