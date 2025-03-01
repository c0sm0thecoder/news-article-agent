import { getPool } from "../db/pgvector";
import { Article } from "../models/article";
import { logger } from "../utils/logger";
import { vectorizeQuery } from "./vectorizer";

export async function retrieveRelevantArticles(query: string, limit: number = 5): Promise<Article[]> {
    const pool = getPool();

    try {
        const vectorizedQuery = await vectorizeQuery(query);

        const result = await pool.query(
            `SELECT id, title, content, url, date, source
            FROM articles
            ORDER BY vector <-> $1
            LIMIT $2`,
            [vectorizeQuery, limit]
        );

        logger.info(`Retrieved ${limit} articles`)

        return result.rows.map(row => ({
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
