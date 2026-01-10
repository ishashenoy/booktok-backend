const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userBookSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Changed from userId
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },  // Changed from bookId

  status: { 
    type: String, 
    enum: ['want_to_read', 'reading', 'completed', 'to-read'],  // Added 'to-read' for controller compatibility
    default: 'to-read'
  },

  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },

  progress: { type: Number, default: 0 },  // Added for controller compatibility
  currentPage: { type: Number, default: 0 },

  startDate: { type: Date },
  completedDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('UserBook', userBookSchema);