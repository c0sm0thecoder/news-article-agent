import { generateEmbeddings } from "../config/llm";
import { getPool } from "../db/pgvector";
import { CleanedArticle } from "../models/article";
import { logger } from "../utils/logger";

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

        const vector = await generateEmbeddings(
            `${article.title}\n\n${article.content}`
        );

        await pool.query(
            `INSERT INTO articles (title, content, url, date, source, vector)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [article.title, article.content, article.url, article.date, vector]
        );

        logger.info(`Article stored: ${article.title}`);
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
