import { getPool } from "../db/pgvector";
import { Article } from "../models/article";
import { logger } from "../utils/logger";
import { vectorizeQuery } from "./vectorizer";

export interface ChunkResult {
    articleId: number;
    chunkId: number;
    content: string;
    metadata: any;
    distance: number;
}

export async function retrieveRelevantChunks(query: string, limit: number = 10): Promise<ChunkResult[]> {
    const pool = getPool();

    try {
        // Get the vector embedding for the query
        const embedding = await vectorizeQuery(query);
        
        // Format the vector correctly for pgvector - must use square brackets
        const vectorString = `[${embedding.join(',')}]`;
        
        // Execute the similarity search query on chunks
        const { rows } = await pool.query(`
            SELECT c.id as chunk_id, c.article_id, c.content, c.metadata, 
                   c.vector <-> $1 as distance
            FROM chunks c
            ORDER BY distance
            LIMIT $2
        `, [vectorString, limit]);
        
        // Process the results
        return rows.map(row => ({
            chunkId: row.chunk_id,
            articleId: row.article_id,
            content: row.content,
            metadata: row.metadata,
            distance: row.distance
        }));
    } catch (err) {
        logger.error('Error retrieving chunks: ', err);
        throw new Error('Failed to retrieve chunks');
    }
}

export async function retrieveRelevantArticles(query: string, limit: number = 5): Promise<Article[]> {
    try {
        // First get relevant chunks
        const chunks = await retrieveRelevantChunks(query, limit * 2);
        
        // Get unique article IDs from the chunks
        const articleIds = [...new Set(chunks.map(chunk => chunk.articleId))].slice(0, limit);
        
        if (articleIds.length === 0) {
            return [];
        }
        
        // Fetch the full articles for those IDs
        const pool = getPool();
        const articleIdPlaceholders = articleIds.map((_, i) => `$${i + 1}`).join(',');
        
        const { rows } = await pool.query(`
            SELECT id, title, content, url, date, source
            FROM articles
            WHERE id IN (${articleIdPlaceholders})
        `, articleIds);
        
        return rows.map(row => ({
            id: row.id,
            title: row.title,
            content: row.content,
            url: row.url,
            date: row.date,
            source: row.source
        }));
    } catch (err) {
        logger.error('Error retrieving articles: ', err);
        throw new Error('Failed to retrieve articles');
    }
}

export async function retrieveArticleByURL(url: string) {
    const pool = getPool();

    try {
        const result = await pool.query(
            `SELECT id, title, content, url, date, source
            FROM articles
            WHERE url = $1`,
            [url]
        );

        if (result.rows.length === 0) {
            throw new Error(`No article with the specified URL found: ${url}`);
        }

        return {
            id: result.rows[0].id,
            title: result.rows[0].title,
            content: result.rows[0].content,
            url: result.rows[0].url,
            date: result.rows[0].date,
            source: result.rows[0].source
        };
    } catch (err) {
        logger.error('Error retrieving article by URL:', err);
        throw new Error('Failed to retrieve article by URL');
    }
}