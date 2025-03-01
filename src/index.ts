import dotenv from 'dotenv';
import express from 'express'; // Add explicit type imports
import { createYoga } from 'graphql-yoga';
import { schema } from './api/graphql';
import { setUpKafkaConsumer } from './ingest/kafka-consumer';
import { initDatabase } from './db/pgvector';
import { initLangfuse } from './monitoring/langfuse';
import { logger } from './utils/logger';
import { getEnvironmentVariables } from './config/environment';
import { generateAnswer } from './rag/generator';

// Load environment variables from .env file
dotenv.config();

export async function startServer() {
  const env = getEnvironmentVariables();
  const app = express();
  
  // Add JSON body parser middleware
  app.use(express.json());
  
  // Create GraphQL yoga server
  const yoga = createYoga({ schema });
  app.use('/graphql', yoga);
  
  // Add a health check endpoint
  app.get('/health', (req, res) => {
    res.send('OK');
  });
  
  // Add the /agent endpoint with explicit type annotations
  app.post('/agent', async (req: express.Request, res: express.Response) => {
    try {
      const { query } = req.body;
      logger.info(`Received query: "${query}"`); // Add this line
      
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const result = await generateAnswer(query);
      logger.info(`Generated answer for query: "${query}"`); // Add this line
      return res.json(result);
    } catch (error) {
      logger.error('Error processing agent request:', error);
      return res.status(500).json({ 
        error: 'An error occurred while processing your request',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  const port = env.PORT || 4000;
  
  app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
  }).on('error', (err) => {
    if (err.message === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use. Please use another port or stop the other service.`);
      process.exit(1);
    } else {
      logger.error(`Error starting server: ${err.message}`);
      throw err;
    }
  });
}

async function bootstrap(): Promise<void> {
  try {
    console.log('Starting application...');
    logger.info('Starting application...');

    // Initialize langfuse first for monitoring
    logger.info('Initializing Langfuse...');
    initLangfuse();

    // Initialize database
    logger.info('Initializing database...');
    await initDatabase();
    
    // Set up Kafka consumer if configured
    const env = getEnvironmentVariables();
    if (env.KAFKA_BROKER && env.KAFKA_TOPIC_NAME) {
      logger.info('Setting up Kafka consumer...');
      await setUpKafkaConsumer();
    } else {
      logger.info('Skipping Kafka setup - configuration not provided');
    }
    
    // Start server
    await startServer();
  } catch (error) {
    console.error('Failed to start application:', error);
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap().catch(error => {
  console.error('Uncaught bootstrap error:', error);
  process.exit(1);
});