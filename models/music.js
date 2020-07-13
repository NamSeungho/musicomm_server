import mongoose from 'mongoose';

const MusicSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: false
    },
    video: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true,
        ref: 'artist'
    }
}, { _id: false, collection: 'music' });

MusicSchema.pre('save', function(next) {
    this._id = mongoose.Types.ObjectId().toString();
    next();
});

export default mongoose.model('music', MusicSchema);