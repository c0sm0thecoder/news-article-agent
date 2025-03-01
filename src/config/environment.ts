export interface EnvironmentVariables {
    PORT: string;
    NODE_ENV: string;
    
    // Database
    DB_HOST: string;
    DB_PORT: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    
    // Kafka
    KAFKA_CLIENT_ID: string;
    KAFKA_BROKER: string;
    KAFKA_TOPIC_NAME: string;
    KAFKA_GROUP_ID_PREFIX: string;
    KAFKA_SSL: string;
    KAFKA_SASL: string;
    KAFKA_USERNAME: string;
    KAFKA_PASSWORD: string;
    
    // LLM
    GEMINI_API_KEY: string;
    
    // Langfuse
    LANGFUSE_PUBLIC_KEY: string;
    LANGFUSE_SECRET_KEY: string;
    LANGFUSE_HOST?: string;
  }
  
  export function getEnvironmentVariables(): EnvironmentVariables {
    return {
      PORT: process.env.PORT || '4000',
      NODE_ENV: process.env.NODE_ENV || 'development',
      
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || '5432',
      DB_NAME: process.env.DB_NAME || 'news_rag',
      DB_USER: process.env.DB_USER || 'postgres',
      DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
      
      KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
      KAFKA_BROKER: process.env.KAFKA_BROKER,
      KAFKA_TOPIC_NAME: process.env.KAFKA_TOPIC_NAME,
      KAFKA_GROUP_ID_PREFIX: process.env.KAFKA_GROUP_ID_PREFIX,
      KAFKA_SSL: process.env.KAFKA_SSL,
      KAFKA_SASL: process.env.KAFKA_SASL,
      KAFKA_USERNAME: process.env.KAFKA_USERNAME,
      KAFKA_PASSWORD: process.env.KAFKA_PASSWORD,
      
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      
      LANGFUSE_PUBLIC_KEY: process.env.LANGFUSE_PUBLIC_KEY || '',
      LANGFUSE_SECRET_KEY: process.env.LANGFUSE_SECRET_KEY || '',
      LANGFUSE_HOST: process.env.LANGFUSE_HOST,
    };
  }