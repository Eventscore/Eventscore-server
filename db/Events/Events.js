const mongoose = require('mongoose');
const db = require('../config.js');

const eventsSchema = mongoose.Schema({
  name: String,
  start: Date,
  created: Date,
  updated: Date,
  artist: [{ type: Schema.Types.ObjectId, ref: 'Artists' }],
  score: Number,
  venue: { type: Schema.Types.ObjectId, ref: 'Venues' },
});

let Events = mongoose.model('Events', eventsSchema);
