var db = require('../config.js');
var mongoose = require('mongoose');

var artistsSchema = mongoose.Schema({
  spotify: Object,
  score: Number,
  genre: [String],
  name: {type: String, unique: true, lowercase: true},
  img: String,
});

var Artists = mongoose.model('Artists', artistsSchema);
module.exports = Artists;
