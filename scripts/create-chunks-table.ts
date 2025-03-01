import { getPool, initDatabase } from "../src/db/pgvector";
import { logger } from "../src/utils/logger";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createChunksTable() {
    try {
        // Initialize the database connection
        await initDatabase();
        const pool = getPool();
        
        // Create the chunks table with vector support
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chunks (
                id SERIAL PRIMARY KEY,
                article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
                chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL,
                metadata JSONB NOT NULL,
                vector vector(768),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Create an index on article_id for faster lookups
        await pool.query(`
            CREATE INDEX IF NOT EXISTS chunks_article_id_idx ON chunks(article_id);
        `);
        
        logger.info('Chunks table created successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Failed to create chunks table:', error);
        process.exit(1);
    }
}

createChunksTable();