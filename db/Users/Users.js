var db = require('../config.js');
var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
  favevents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Events'}],
  name: String,
  username: String,
  email: String,
});

var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
