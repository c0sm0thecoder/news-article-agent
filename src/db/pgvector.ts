import { Pool } from "pg";
import { getEnvironmentVariables } from "../config/environment";
import { logger } from "../utils/logger";

let pool: Pool;

export async function initDatabase(): Promise<void> {
    try {
        logger.info('Initializing database...');
        
        // If the pool already exists, we're already initialized
        if (pool) {
            logger.info('Database already initialized');
            return;
        }
        
        // Get connection details from environment variables
        const connectionString = process.env.DATABASE_URL || 
            `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'news_rag'}`;
        
        logger.info(`Connecting to database at ${connectionString.replace(/:[^:]*@/, ':****@')}`);
        
        // Create the database pool
        pool = new Pool({
            connectionString,
            max: 20,
        });
        
        // Test the connection
        const client = await pool.connect();
        try {
            await client.query('SELECT NOW()');
            logger.info('Database connection successful');
        } finally {
            client.release();
        }
        
        // Initialize pgvector extension if not already done
        const pgvectorClient = await pool.connect();
        try {
            await pgvectorClient.query('CREATE EXTENSION IF NOT EXISTS vector');
            logger.info('pgvector extension initialized');
        } catch (err) {
            logger.error('Failed to initialize pgvector extension:', err);
        } finally {
            pgvectorClient.release();
        }
        
        logger.info('Database initialization complete');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export function getPool(): Pool {
    if (!pool) {
        throw new Error('Database not initialized');
    }
    return pool;
}
