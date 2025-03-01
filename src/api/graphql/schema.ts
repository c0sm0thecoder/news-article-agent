export const typeDefs = `
  type Source {
    title: String!
    url: String!
    date: String!
    source: String
  }
  
  type SearchResult {
    answer: String!
    sources: [Source!]!
  }
  
  type Query {
    search(query: String!): SearchResult!
    health: String!
  }
`;
