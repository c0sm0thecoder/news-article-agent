import { typeDefs } from "./schema";
import { createSchema } from "graphql-yoga";
import { queryResolvers } from "./resolvers/query";

export const schema = createSchema({
    typeDefs,
    resolvers: {
        Query: queryResolvers
    }
});
