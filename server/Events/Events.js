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
        $maxDistance : 10000
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
        console.log('RESPONSE', json);
        fetch.Promise.each(json.events, function(event) {
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
          //For each event, we create a row in the Events table
          return Events.create(body)
          .then(function(createdEvent) {
            //Then we loop through the list of performers in the raw event object
            fetch.Promise.each(event.performers, function(performer) {

              spotifyApi.searchArtists(performer.name)
              .then(function(data) {
                var artistsBody = {
                spotify: {
                  followers: data.body.artists.items[0].followers.total || 0,
                  popularity: data.body.artists.items[0].popularity || 0
                },
                score: performer.score,
                genre: data.body.artists.items[0].genres || 'N/A',
                name: performer.name || 0,
                img: data.body.artists.items[0].images[0].url || 'N/A'
                }

                var updateArtists = fetch.Promise.promisify(Artists.update);

                updateArtists.call(Artists, artistsBody, {
                  $setOnInsert: performer }, {upsert: true
                })
                .then(function(artistResult) {
                  if (artistResult.upserted) {
                    return Events.findByIdAndUpdate(createdEvent._id, {$push: {artists: artistResult.upserted[0]._id}});
                  }
                })
                .catch(function(e) {
                  console.log('ERROR:', e);
                })
                .then(function(result) {
                  return Artists.findOne({'name': performer.name})
                })
                .then(function(foundResult) {
                  //BUG: GETTING DUPLICATE KEYS PUSHED INTO EVENTS' ARTISTS ARRAY
                  return Events.findByIdAndUpdate(createdEvent._id, {$push: {artists: foundResult._id}}, {runValidators: true});
                })
                .then(function(nextResult) {
                  var rawBody = {
                    eventId: nextResult._id,
                    data: {
                      seatgeek: event,
                      spotify: data
                    }
                  }
                  return EventsRaw.create(rawBody)
                })
                .then(function(finalResult) {
                  Events.find(query)
                  .then(function(results) {
                    //BUG: GETTING ERROR: Can't set headers after they are sent.
                    res.send(results);
                  })
                })
              })   
            })
          })  
        })
      })
    } else {
      res.send(results);
    }
  })
};

exports.updateEvent = function(req, res) {

};