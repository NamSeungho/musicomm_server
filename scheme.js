import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `
    type Singer {
        _id: ID!
        title: String!
        title_en: String!
    }

    type Artist {
        _id: ID!
        title: String
        title_en: String
        debut: String
        type: String
    }
    
    type Music {
        _id: ID!
        video: String
        title: String
        artist: Artist
        singer: [Singer]
    }
    
    type Query {
        allMusic: [Music]
    }
    
    input MusicInput {
        video: String!
        title: String!
        artist: String!
    }

    type Mutation {
        createMusic(input: MusicInput): Music
    }
`;

const scheme = makeExecutableSchema({
    typeDefs,
    resolvers
});

export default scheme;