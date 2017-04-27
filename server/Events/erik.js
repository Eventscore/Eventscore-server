var fetch = require('node-fetch');
var request = require('request-promise');
fetch.Promise = require('bluebird'); 
var Artists = require('../../db/Artists/Artists.js');
var Events = require('../../db/Events/Events.js');
var EventsRaw = require('../../db/EventsRaw/EventsRaw.js');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.SPOTIFY_CLIENTID,
  clientSecret : process.env.SPOTIFY_CLIENTSECRET
});

// https://api.spotify.com/v1/search?q=+west&type=artist&limit=1

function getSpotify(artistName, callback) {  
    let queryName = artistName.split(' ').join('+');
    return new fetch.Promise((resolve, reject) => {
      request.get('https://api.spotify.com/v1/search?q=' + queryName + '&type=artist&limit=1', function(err, response, body) {
        if (err) {
          return reject(err);
        }
        resolve(body);
      });
    })
    // return artist;
}

exports.getNearbyEvents = function(req, res) {
  var longitude = req.params.lon;
  var latitude = req.params.lat;
  var query = { 
    location: {
      $near: {
        $geometry: {
          type : "Point",
          coordinates : [ longitude, latitude ]
        },
        $maxDistance : 100
      }
    }
  }

  Events.find(query)
  .then(function(results) {
    if (results.length < 10) {
      fetch('https://api.seatgeek.com/2/events?taxonomies.name=concert&sort=score.desc&per_page=50&page=1&lon=' + longitude + '&lat=' + latitude + '&range=10mi&client_id=' + process.env.SEATGEEK_CLIENTID)
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        return {
          rawEvents: json.events,
          mappedEvents: [],
          createdEvents: []
        }
        //for each event object from API
        // json.events.forEach(function(event) {
        //   var body = {
        //     name: event.short_title,
        //     start: event.datetime_utc,
        //     created: new Date(),
        //     updated: new Date(),
        //     artists: [],
        //     score: 0,
        //     location: { "type" : "Point", "coordinates" : [ event.venue.location.lon, event.venue.location.lat ] },
        //     venue: event.venue.name_v2
        //   };
          
        //   //For each event, we create a row in the Events table
        //   return Events.create(body).then(function(createdEvent) {
        //     //Then we loop through the list of performers in the raw event object
        //     event.performers.forEach(function(performer) {
        //       //And use lean and exec so that the following runs correctly (once per iteration)
        //       //We check if each artist exists in the Artists table
        //       return Artists.findOne({'name': performer.name})
        //       .lean()
        //       .exec(function(err, result) {
        //         //If they exist, we push the artist's id to the created Events' artists array
        //         if (result) {
        //           console.log('PERFORMER DOES EXIST IN DB!');
        //           return Events.findByIdAndUpdate(createdEvent._id, {$push: {artists: result._id}})
        //           .then(function(updatedEvent) {
        //             //Then we create a row in the Events Raw table (restricted to unique)
        //             var rawBody = {
        //               eventId: createdEvent._id,
        //               data: {
        //                 seatgeek: event,
        //                 spotify: data
        //               }
        //             }
        //             return EventsRaw.create(rawBody);
        //           })
        //         } else {
        //           //If they don't exist in the Artists table, we first do API calls to grab the necessary data
        //           spotifyApi.searchArtists(performer.name)
        //           .then(function(data) {
        //             console.log('THIS PERFORMER DOES NOT EXIST IN DB', performer.name);
        //             //Then we populate the fields we'll use to create a row in the Artist's table
        //             var artistsBody = {
        //             spotify: {
        //             followers: data.body.artists.items[0].followers.total || 0,
        //             popularity: data.body.artists.items[0].popularity || 0
        //             },
        //             score: performer.score,
        //             genre: data.body.artists.items[0].genres || 'N/A',
        //             name: performer.name || 0,
        //             img: data.body.artists.items[0].images[0].url || 'N/A'
        //             }
        //             //Here is where the row in Artists table gets created
        //             return Artists.create(artistsBody).then(function(createdArtist) {
        //               //Then we push the created artist's id to the Event row's artists array
        //               return Events.findByIdAndUpdate(createdEvent._id, {$push: {artists: createdArtist._id}})
        //               .then(function(updatedEvent) {
        //                 var rawBody = {
        //                   eventId: createdEvent._id,
        //                   data: {
        //                     seatgeek: event,
        //                     spotify: data
        //                   }
        //                 }
        //                 return EventsRaw.create(rawBody);
        //               });
        //               //Need to do another query then use res.send to send back list of events that are nearby
        //             });
        //           });
        //         };
        //       });    
        //     });
        //   });  
        // });
      })
      .then(function(eventObj) {
        var body;
        return fetch.Promise.reduce(eventObj.rawEvents, function(accumulator, rawEvent) {
          body = {
            name: rawEvent.short_title,
            start: rawEvent.datetime_utc,
            created: new Date(),
            updated: new Date(),
            artists: [],
            score: 0,
            location: {'type': 'Point', 'coordinates': [ rawEvent.venue.location.lon, rawEvent.venue.location.lat ] },
            venue: rawEvent.venue.name_v2
          }
          accumulator.mappedEvents.push(body);
          return accumulator;
        }, eventObj);
      })
      .then(function(mappedObj){
        return fetch.Promise.reduce(mappedObj.mappedEvents, function(accumulator, mappedEvent, currIndex){
          var event = new Events(mappedEvent);
          accumulator.createdEvents.push({ eventId: event._id, artists: mappedObj.rawEvents[currIndex].performers, artistIds: [], artistPromises: [], rawArtists: [], artistBodies: [], rawEvents: mappedObj.rawEvents[currIndex] });
          event.save(function(err) {
            if (err) {
              console.log(err);
            }
          });
          return accumulator;
        }, mappedObj);
      })
      .then(function(createdObj) {

        return fetch.Promise.each(createdObj.createdEvents, function(createdEvent) {
          //for each created event
          //i need to check if artists exist in the Artists table
          //if they exist, take their objectid and push to the createdEvent's artists array
          //else create the artist and push to the createdEvent's artists array
          // console.log('EACH CREATED EVENT LOOP');
          return new Promise((resolve, reject) => {
            createdEvent.rawArtists = fetch.Promise.map(createdEvent.artists, function(artist) {
              // spotifyApi.searchArtists(artist.name)
              return getSpotify(artist.name).then(artistValu => {
                return artistValu
              });
            })
            resolve(createdEvent);
          })
            // .then(function(data) {
            //   var artistBody = {
            //     spotify: {
            //     followers: data.body.artists.items[0].followers.total || 0,
            //     popularity: data.body.artists.items[0].popularity || 0
            //     },
            //     score: artist.score,
            //     genre: data.body.artists.items[0].genres || 'N/A',
            //     name: artist.name || 0,
            //     img: data.body.artists.items[0].images[0].url || 'N/A'
            //   }
            //   createdEvent.artistBodies.push(artistBody);
            // });
            // .then(function(artistBody) {
            //   Artists.update(artistBody,{
            //   $setOnInsert: artist
            //   },{
            //   upsert: true
            //   },function(err, artistResult) {
            //     if (err) {
            //       console.log(err);
            //     } else if (artistResult.upserted) {
            //       console.log('CREATED EVENT', createdEvent)
            //       Events.findByIdAndUpdate(createdEvent.eventId, {$push: {artists: artistResult.upserted[0]._id}})
            //       .then(function(test) {
            //         console.log('TEST', test);
            //       })
            //       // console.log('ARTISTRESULT', artistResult);
            //       // createdEvent.artistIds.push(artistResult.upserted[0]._id);
            //       // console.log('CREATED EVENTS', createdObj.createdEvents);
            //     }
            //   })
            // })
        })
      })
      .then(function(objWithSpotifyResults) {
        console.log('RAW ARTISTS: ', objWithSpotifyResults);
        // return {
        //   'createdEvents': objWithSpotifyResults
        // }
      })
      // .then(function(createdObj) {
      //   return createdObj.createdEvents.reduce(function(accumulator, currentEvent) {
      //     currentEvent.rawArtists = fetch.Promise.map(currentEvent.artistPromises, function(artist) {
      //       return artist;
      //     });
      //     accumulator.resolved.push(currentEvent);
      //     return accumulator;
      //   }, { 'resolved': [] })
      // })
      // .then(function(results) {
      //   console.log('RESULTS', results.resolved[0].rawArtists);
      // })
      // .then(function(createdObj) {
      //   return fetch.Promise.each(createdObj.createdEvents, function(createdEvent, outerIndex) {
      //     // console.log('CREATED EVENT', createdEvent)
      //     console.log('CREATED EVENTS RAW ARTISTS', createdEvent.rawArtists)
      //     return fetch.Promise.map(createdEvent.rawArtists, function(artistPromise, innerIndex) {
      //       // var artistBody = {
      //       //   spotify: {
      //       //   followers: artist.artists.items[0].followers.total || 0,
      //       //   popularity: artist.artists.items[0].popularity || 0
      //       //   },
      //       //   // score: createdEvent.score,
      //       //   genre: artist.artists.items[0].genres || 'N/A',
      //       //   name: artist.artists.items[0].name || 0,
      //       //   img: artist.artists.items[0].images[0].url || 'N/A'
      //       // }
      //       // console.log('ARTIST', artist);
      //       var test = JSON.stringify(artistPromise);
      //       return test;
      //       // console.log('ARTIST BODY', artistBody)
      //     })
      //   })
      // })
      // .then(function(test) {
      //   // console.log('TEST', test.rawArtists);
      // })
    };
  });
};

exports.updateEvent = function(req, res) {

};