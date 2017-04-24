var db = require('../config.js');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var usersSchema = mongoose.Schema({
  favevents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Events'}],
  name: String,
  username: {type: String, unique: true},
  email: String,
  password: String  
});

usersSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
});

var Users = mongoose.model('Users', usersSchema);

Users.comparePassword = function(attemptedPassword, recordedPassword, callback) {
  bcrypt.compare(attemptedPassword, recordedPassword, function(err, isMatch) {
    if (err) {
      return callback(err);
    } else {
      callback(null, isMatch);
    }
  });
};

module.exports = Users;
