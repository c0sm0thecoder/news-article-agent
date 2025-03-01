export interface QueryInput {
    query: string;
}

export interface QueryResult {
    articles: string;
    sources: Source[];
}

export interface Source {
    title: string;
    url: string;
    date: string;
}
