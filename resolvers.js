import Music from './models/music';
import Artist from './models/artist';

export const resolvers = {
    Query: {
        async allMusic() {
            return await Music.find().populate('artist').exec();
        }
    },
    Mutation: {
        async createMusic(root, { input }) {
            return await Music.create(input);
        }
    }
};