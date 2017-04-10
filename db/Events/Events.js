var mongoose = require('mongoose');
var db = require('../config.js');

var eventsSchema = mongoose.Schema({
  name: String,
  start: Date,
  created: Date,
  updated: Date,
  artist: [{ type: Schema.Types.ObjectId, ref: 'Artists' }],
  score: Number,
  venue: { type: Schema.Types.ObjectId, ref: 'Venues' },
});

var Events = mongoose.model('Events', eventsSchema);
