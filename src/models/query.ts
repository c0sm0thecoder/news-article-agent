export interface QueryInput {
    query: string;
}

export interface QueryResult {
    answer: string;
    sources: Source[];
}

export interface Source {
    title: string;
    url: string;
    date: string;
    source: string;
}
