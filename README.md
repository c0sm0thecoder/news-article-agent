**News RAG System**
A Retrieval-Augmented Generation (RAG) system that ingests news articles, processes them using LLMs, and provides relevant answers to user queries with source attribution.

**Overview**
This application processes news articles by:
- Ingesting article links (via CSV or Kafka)
- Extracting and cleaning content
- Chunking documents into manageable pieces
- Storing content in a vector database (pgvector)
- Retrieving relevant information based on semantic search
- Generating accurate responses using LLM with source attribution

**Current Status**
**Working Features**
✅ Article ingestion from CSV files
✅ Content extraction and cleaning
✅ Document chunking using LangChain
✅ Vector embeddings storage in PostgreSQL
✅ Semantic search based on vector similarity
✅ Basic retrieval pipeline
✅ GraphQL API (implementation incomplete)

**Not Working / In Progress**
❌ Docker setup (configuration issues)
❌ Kafka integration (can be used as alternative to CSV ingestion)

**Setup Instructions**
**Prerequisites**
- Node.js (v18+)
- PostgreSQL with pgvector extension
- .env file with required configuration

**Install PostgreSQL**
sudo apt update && sudo apt install postgresql postgresql-contrib

**Install pgvector extension**
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

**Create user and database**
sudo -u postgres psql -c "CREATE USER raguser WITH PASSWORD 'ragpassword';"
sudo -u postgres psql -c "CREATE DATABASE ragdb OWNER raguser;"

**Enable pgvector extension**
sudo -u postgres psql -d ragdb -c "CREATE EXTENSION vector;"

**Create required tables**
sudo -u postgres psql -d ragdb -f scripts/init.sql

**Environment Variables**
Create a `.env` file in the project root with:
```
PORT=3002
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=db
DB_USER=user
DB_PASSWORD=password

GEMINI_API_KEY=<your-gemini-api-key>

# Optional Kafka configuration
KAFKA_CLIENT_ID=news-rag-client
KAFKA_BROKER=<your-kafka-broker>
KAFKA_USERNAME=<your-kafka-username>
KAFKA_PASSWORD=<your-kafka-password>
KAFKA_TOPIC_NAME=news
KAFKA_GROUP_ID_PREFIX=group-id-prefix-
KAFKA_SSL=true
KAFKA_SASL=true

# Optional Langfuse configuration
LANGFUSE_PUBLIC_KEY=<your-public-key>
LANGFUSE_SECRET_KEY=<your-secret-key>
LANGFUSE_HOST=https://cloud.langfuse.com
```

**Building and Installing**
1. Clone the repository:
    ```bash
    git clone https://github.com/your-repo/news-rag-system.git
    cd news-rag-system
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up the database:
    ```bash
    # Connect to PostgreSQL and create the database
    psql -U postgres
    CREATE DATABASE newsrag;
    \c newsrag
    CREATE EXTENSION IF NOT EXISTS vector;
    ```

4. Run database migrations:
    ```bash
    npm run create-chunks-table
    ```

**Running the Application**
1. Start the development server:
    ```bash
    npm run dev
    ```

2. For production:
    ```bash
    npm run build
    npm start
    ```

2. Ingest sample articles:
    ```bash
    npm run ingest-csv filename
    ```

**API Usage**
**REST Endpoint**
- Endpoint: `POST /agent`
- Content-Type: `application/json`

**Request Format:**
```bash
curl -X POST http://localhost:3002/agent \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the latest on climate change in Canada?"}'
```

**Response Format:**
```json
{
  "answer": "Based on recent news, Canada has announced new climate policies including...",
  "sources": [
    {
      "title": "Canada Unveils New Climate Initiative",
      "url": "https://example.com/article/123",
      "date": "2025-01-15T10:30:00Z",
      "source": "Example News"
    }
  ]
}
```

**Example cURL Request:**
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the latest developments in AI?", "max_results": 5}'
```

**Optimization Strategies**
**Current Implementations**
- Document chunking to improve relevance of retrieved content
- Efficient vector search using pgvector indexes
- Content preprocessing to reduce token usage

**Planned Improvements**
- Response streaming for better user experience
- Caching frequent queries
- Better prompt engineering to reduce token usage
- Hybrid search (keyword + semantic) for improved accuracy
- Query rewriting for better context matching

**Technical Architecture**
**Components**
- Ingestion Service: Processes CSV files (Kafka integration planned)
- Vector Database: PostgreSQL with pgvector extension
- Retrieval System: LangChain-based document retrieval
- Generation Service: LLM integration for answer generation

**Tech Stack**
- Node.js/TypeScript
- PostgreSQL with pgvector
- LangChain for document processing
- Express for API endpoints

**Future Work**
- Complete GraphQL implementation using GraphQL Yoga
- Finalize Docker setup for easy deployment
- Add Kafka integration for real-time news ingestion
- Implement structured output for better response parsing
- Add Langfuse for monitoring query performance

**Troubleshooting**
**Common Issues**
- 403 Forbidden errors: Some news sites block scraping. Consider adding more request headers or implementing a retry mechanism.
- Vector dimension mismatch: Ensure embeddings are consistent with database vector dimensions.
- Performance issues: Consider adding more indexes to the PostgreSQL database.
- Database connection errors: Verify your DATABASE_URL in the .env file and ensure PostgreSQL is running.
- Missing pgvector extension: Ensure you've installed and enabled the pgvector extension in your database.
