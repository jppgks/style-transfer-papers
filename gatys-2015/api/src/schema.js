const {gql} = require('apollo-server-lambda');

const typeDefs = gql`
    type Query {
        info: String!
    }
`;

module.exports = typeDefs;
