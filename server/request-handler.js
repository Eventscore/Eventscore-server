// 'user strict';

// var db = require('../db/config');
// var Artists = require('../db/Artists/Artists');
// var Events = require('../db/Events/Events');
// var EventsRaw = require('../db/EventsRaw/EventsRaw');
// var Users = require('../db/Users/Users');
// var Venues = require('../db/Venues/Venues');
// var bcrypt = require('bcrypt-nodejs');

// exports.userLogin = function(req, res) {
//   var username = req.body.username;
//   var password = req.body.password;

//   console.log('im inside the userlogin');
//   console.log('username: ', username);
//   console.log('password: ', password);

//   Users.findOne({ "username": username })
//     .exec(function(err, user) {
//       if(!user) {
//         console.log('user does not exist bro?');
//         res.status(500).send("username or password doesn't match with our record");
//       } else {
//         Users.comparePassword(password, user.password, function(err, match) {
//           if(err) {
//             console.log('password does not match bro?');
//             res.status(500).send("username or password doesn't match with our record");
//           } else {
//             req.session.regenerate(function() {
//               req.session.user = user;
//               res.json(user);
//             });
//           }
//         });
//       }
//     });
// };


// exports.userSignUp = function(req, res) {
//   var name = req.body.name;
//   var username = req.body.username;
//   var password = req.body.password;
//   var email = req.body.email;

//   Users.findOne({ "username": username})
//     .exec(function(err, user) {
//       if(!user) {
//         Users.create({"name": name, "username": username, "password": password, "email": email});
//         res.json('Account created');
//       } else {
//         res.json('Username is already taken');
//       }
//     });
// };
