var mongoose = require('mongoose');
var db = require('../config.js');

var artistsSchema = mongoose.Schema({
  spotify: Object,
  klout: Number,
  genre: String,
  name: String,
  img: String,
});

var Artists = mongoose.model('Artists', artistsSchema);
