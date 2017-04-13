var fetch = require('node-fetch');
fetch.Promise = require('bluebird'); 
var Artists = require('../../db/Artists/Artists.js');
var Events = require('../../db/Events/Events.js');
var EventsRaw = require('../../db/EventsRaw/EventsRaw.js');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.SPOTIFY_CLIENTID,
  clientSecret : process.env.SPOTIFY_CLIENTSECRET
});

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
      fetch('https://api.seatgeek.com/2/events?taxonomies.name=concert&sort=score.desc&per_page=25&page=1&lon=' + longitude + '&lat=' + latitude + '&range=10mi&client_id=' + process.env.SEATGEEK_CLIENTID)
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        //for each event object from API
        json.events.forEach(function(event) {
          var body = {
            name: event.short_title,
            start: event.datetime_utc,
            created: new Date(),
            updated: new Date(),
            artists: [],
            score: 0,
            location: { "type" : "Point", "coordinates" : [ event.venue.location.lon, event.venue.location.lat ] },
            venue: event.venue.name_v2
          };
          
          Events.create(body).then(function(createdEvent) {
            var rawBody = {
              eventId: createdEvent._id,
              data: {
                seatgeek: event
              }
            }
            EventsRaw.create(rawBody).then(function(createdEventRaw) {
              event.performers.forEach(function(performer) {
                //does this artist exist in artists db already?
                return Artists.findOne({'name': performer.name})
                .lean()
                .exec(function(err, result) {
                  if (result) {
                    console.log('PERFORMER DOES EXIST IN DB!');
                    return Events.findByIdAndUpdate(createdEvent._id, {$push: {artists: result._id}});     
                  } else {
                    spotifyApi.searchArtists(performer.name)
                    .then(function(data) {
                      console.log('THIS PERFORMER DOES NOT EXIST IN DB', performer.name);
                      var artistsBody = {
                      spotify: {
                      followers: data.body.artists.items[0].followers.total || 0,
                      popularity: data.body.artists.items[0].popularity || 0
                      },
                      score: performer.score/100,
                      genre: data.body.artists.items[0].genres || 'N/A',
                      name: performer.name || 0,
                      img: data.body.artists.items[0].images[0].url || 'N/A'
                      }
                      return Artists.create(artistsBody).then(function(createdArtist) {
                        return Events.findByIdAndUpdate(createdEvent._id, {$push: {artists: createdArtist._id}});
                      });
                    })
                  }
                })      
              })
            })  
          })  
        });
      });
    }
  })
};

exports.updateEvent = function(req, res) {

};