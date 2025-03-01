import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { CleanedArticle } from '../models/article';
import { storeArticle } from './vectorizer';
import { logger } from '../utils/logger';

export async function processArticleUrl(url: string, source: string): Promise<void> {
  try {
    logger.info(`Fetching article content from: ${url}`);
    
    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    // Parse the HTML
    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      throw new Error(`Failed to parse article content from ${url}`);
    }
    
    // Extract the date (this is a simple implementation, might need adjustment)
    const metaDate = dom.window.document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
                     dom.window.document.querySelector('meta[name="pubdate"]')?.getAttribute('content');
    
    const date = metaDate ? new Date(metaDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Create a cleaned article object
    const cleanedArticle: CleanedArticle = {
      title: article.title,
      content: article.textContent,
      url,
      date,
      source
    };
    
    // Store the article in the database
    await storeArticle(cleanedArticle);
    
    logger.info(`Successfully processed and stored article: ${cleanedArticle.title}`);
  } catch (error) {
    logger.error(`Error processing article from ${url}:`, error);
    throw new Error(`Failed to process article from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function processArticleUrlNew(url: string, source: string): Promise<void> {
  try {
    logger.info(`Processing article from: ${url} using new method`);
    
    // Import the processNewLink function from the content-extractor
    const { processNewLink } = await import("../ingest/content-extractor");
    
    // Use the existing pipeline with a NewsMessage object
    await processNewLink({
      source,
      url
    });
    
    logger.info(`Successfully processed article from ${url} using new method`);
  } catch (error) {
    logger.error(`Error processing article from ${url}:`, error);
    throw new Error(`Failed to process article from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}