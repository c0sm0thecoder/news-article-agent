import { Pool } from "pg";
import { getEnvironmentVariables } from "../config/environment";

let pool: Pool;

export async function initDatabase(): Promise<void> {
    const env = getEnvironmentVariables();

    pool = new Pool({
        user: env.DB_USER,
        host: env.DB_HOST,
        database: env.DB_NAME,
        password: env.DB_PASSWORD,
        port: parseInt(env.DB_PORT || '5432'),
    });

    await pool.query('CREATE EXTENSION IF NOT EXISTS vector');

    await pool.query(`
        CREATE TABLE IF NOT EXISTS articles (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            url TEXT UNIQUE NOT NULL,
            date TEXT NOT NULL,
            vector vector(1536),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATEA INDEX IF NOT EXISTS articles_vector_idx
        ON articles
        USING ivfflat (vector vector_l2_ops)
        WITH (lists = 100)
    `)
}

export function getPool(): Pool {
    if (!pool) {
        throw new Error('Database not initialized');
    }
    return pool;
}
