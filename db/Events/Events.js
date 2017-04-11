var mongoose = require('mongoose');
var db = require('../config.js');

var eventsSchema = mongoose.Schema({
  name: String,
  start: Date,
  created: Date,
  updated: Date,
  artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artists' }],
  score: Number,
  venue: Object, //geolocation will be inside this object
})

var Events = mongoose.model('Events', eventsSchema);
