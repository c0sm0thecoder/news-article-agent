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

**Not Working / In Progress**
❌ GraphQL API (implementation incomplete)
❌ Docker setup (configuration issues)
❌ Kafka integration (can be used as alternative to CSV ingestion)

**Setup Instructions**
**Prerequisites**
- Node.js (v18+)
- PostgreSQL with pgvector extension
- .env file with required configuration

**Environment Variables**
- Database Setup
- Application Setup
- Running the Application
- API Usage
- REST Endpoint
  - Request:
  - Response:

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
