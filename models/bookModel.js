const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    authorId: { type: Schema.Types.ObjectId, required: true },
    keywords: { type: [String], default: [] },
    coverImage: { type: String, default: '' },
    source: { type: String, enum: ['author_uploaded', 'external_scraped', 'goodreads_imported'], default: 'author_uploaded' },
    publishedDate: { type: Date, default: null },
    genre: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);