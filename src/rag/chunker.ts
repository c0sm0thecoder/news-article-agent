import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CleanedArticle } from "../models/article";
import { logger } from "../utils/logger";

export interface DocumentChunk {
  text: string;
  metadata: {
    source: string;
    title: string;
    url: string;
    date: string;
    chunkIndex: number;
  };
}

export async function chunkDocument(article: CleanedArticle): Promise<DocumentChunk[]> {
  try {
    logger.info(`Chunking document: ${article.title}`);
    
    // Create text splitter with appropriate configuration
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    // Combine title and content for complete context
    const fullText = `${article.title}\n\n${article.content}`;
    
    // Split the text into chunks
    const textChunks = await textSplitter.splitText(fullText);
    
    // Create document chunks with metadata - with explicit type annotations
    const documentChunks = textChunks.map((text: string, index: number) => ({
      text,
      metadata: {
        source: article.source,
        title: article.title,
        url: article.url,
        date: article.date,
        chunkIndex: index
      }
    }));
    
    logger.info(`Document split into ${documentChunks.length} chunks`);
    
    return documentChunks;
  } catch (error) {
    logger.error(`Error chunking document: ${error}`);
    throw new Error(`Failed to chunk document: ${error instanceof Error ? error.message : String(error)}`);
  }
}