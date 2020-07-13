import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    title_en: {
        type: String,
        required: true
    },
    debut: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
}, { _id: false, collection: 'artist' });

ArtistSchema.pre('save', function(next) {
    this._id = mongoose.Types.ObjectId().toString();
    next();
});

export default mongoose.model('artist', ArtistSchema);