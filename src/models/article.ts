export interface Article {
  id?: string;
  title: string;
  content: string;
  url: string;
  date: string;
  source: string;
  vector?: number[];
  created_at?: Date;
  updated_at?: Date;
}

export interface ArticleInput {
    url: string;
}

export interface CleanedArticle {
    title: string;
    content: string;
    url: string;
    date: string;
    source: string;
}
