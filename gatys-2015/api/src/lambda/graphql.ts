const {ApolloServer} = require('apollo-server-lambda');

const typeDefs = require('../schema');

const resolvers = {
    Query: {
        info: () => "Hello client"
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
        origin: '*',
        credentials: true,
    },
    playground: {
        settings: {
            "request.credentials": "same-origin"
        }
    }
});
const handler = server.createHandler();

export { handler };
