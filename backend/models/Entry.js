const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  mood: {
    type: String,
    enum: ['Happy', 'Neutral', 'Sad'],
    required: true,
  },
  studyTime: {
    type: Number,
    required: true,
    min: 0,
  },
  wasteTime: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  score: {
    type: Number,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, { timestamps: true });

// Pre-save hook to calculate score if not explicitly set properly
entrySchema.pre('save', function () {
  this.score = this.studyTime - this.wasteTime;
});

module.exports = mongoose.model('Entry', entrySchema);
