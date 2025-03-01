import axios from "axios";
import cheerio from "cheerio";
import { NewsMessage } from "../models/message";
import { cleanArticleContent } from "./content_cleaner";

export async function processNewLink(newsMessage: NewsMessage): Promise<void> {
    try {
        const htmlContent = await fetchHtml(newsMessage.url);
        const rawContent = extractContent(htmlContent);

        const cleanedArticle = await cleanArticleContent(
            rawContent,
            newsMessage.url,
            newsMessage.source
        );

        await storeArticle(cleanedArticle);
    } catch (err) {
        throw err;
    }
}

async function fetchHtml(url: string) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        return response.data;
    } catch (err) {
        throw new Error(`Failed to fetch url ${url}`);
    }
}

function extractContent(html: string): { title: string, content: string; } {
    const $ = cheerio.load(html);

    let title = $('title').text().trim();
    const ogTitle = $('meta[property="og:title]').attr('content');
    if (ogTitle && ogTitle.length > title.length) {
        title = ogTitle;
    }

    let content = '';

    $('script, style, nav, footer, header, aside, .ads, .comments, .social-media, .related-articles').remove();

    const articleSelectors = [
        'article', '.article', '.post', '.content', '.article-content',
        '.story-content', '.entry-content', '.post-content', 'main'
    ];

    let foundContent = false;
    for (const selector of articleSelectors) {
        const article = $(selector);
        if (article.length > 0) {
            article.find('p').each((_, el) => {
                const text = $(el).text().trim();
                if (text.length > 100) { // Only include substantial paragraphs
                    content += text + '\n';
                }
            });
            foundContent = true;
            break;
        }
    }

    // If no content found with selectors, try all paragraphs
    if (!foundContent) {
        $('p').each((_, el) => {
            const text = $(el).text().trim();
            if (text.length > 100) { // Only include substantial paragraphs
                content += text + '\n';
            }
        });
    }

    return { title, content };
}
