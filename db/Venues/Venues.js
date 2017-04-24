var db = require('../config.js');
var mongoose = require('mongoose');

var venuesSchema = mongoose.Schema({
  location: {type: String, lowercase: true},
  address: {type: String, lowercase: true},
  displayName: {type: String, lowercase: true},
  geolocation: Number,
  capacity: Number
});

var Venues = mongoose.model('Venues', venuesSchema);
module.exports = Venues;
