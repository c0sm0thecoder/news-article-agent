export interface Article {
  id?: string;
  title: string;
  content: string;
  url: string;
  date: string;
  vector?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ArticleInput {
    url: string;
}

export interface CleanedArticle {
    title: string;
    content: string;
    url: string;
    date: string;
}
