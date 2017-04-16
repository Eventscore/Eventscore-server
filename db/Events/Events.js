var db = require('../config.js');
var mongoose = require('mongoose');

var eventsSchema = new mongoose.Schema({
  name: {type: String},
  start: Date,
  created: Date,
  updated: Date,
  artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artists', unique: true}],
  score: Number,
  location: {
    type: {
      type: "String",
      required: true,
      enum: ['Point', 'LineString', 'Polygon'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  venue: String,
  city: String,
  state: String,
})



var Events = mongoose.model('Events', eventsSchema);
Events.collection.ensureIndex({'location': '2dsphere'}, function(err, res) {
  if (err) {
    return console.log('error');
  } else {
    console.log('ensureIndex successful', res);
  }
});
module.exports = Events;
