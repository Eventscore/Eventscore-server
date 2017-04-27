var Promise = require('bluebird');
var fetch = require('node-fetch');
fetch.Promise = require('bluebird'); 
var Artists = require('../../db/Artists/Artists.js');
var Events = require('../../db/Events/Events.js');
var EventsRaw = require('../../db/EventsRaw/EventsRaw.js');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENTID,
  clientSecret: process.env.SPOTIFY_CLIENTSECRET
});

function capitalizeFirstLetter(string) {
  var words = string.split(' ');
  var capWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return capWords.join(' ');
}

exports.searchEvents = function(req, res) {
  var longitude = req.params.lon;
  var latitude = req.params.lat;
  var keywords;
  console.log('REQ KEYWORDS', req.query);
  if (req.query.keywords) {
    keywords = req.query.keywords.split('-')
  }
  console.log('KEYWORDS', keywords);
  var query = { 
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [ longitude, latitude ]
        },
        $maxDistance: 100000
      }
    }
  };

  Events.find(query)
  .then(function(eventTableQueryResults) {
    if (eventTableQueryResults.length < 5) {
      return fetch('https://api.seatgeek.com/2/events?taxonomies.name=concert&sort=score.desc&per_page=25&page=1&lon=' + longitude + '&lat=' + latitude + '&range=15mi&client_id=' + process.env.SEATGEEK_CLIENTID)
      .then(function(apiResponse) {
        return apiResponse.json();
      })
      .then(function(json) {
        fetch.Promise.each(json.events, function(event) {
          var eventBody = {
            name: event.short_title,
            start: event.datetime_utc,
            created: new Date(),
            updated: new Date(),
            artists: [],
            score: 0,
            location: { 
              'type': 'Point', 
              'coordinates': [ event.venue.location.lon, event.venue.location.lat ] 
            },
            venue: event.venue.name_v2,
            city: event.venue.city || 'unlisted',
            state: event.venue.state || 'unlisted',
            sgticketsurl: event.url || 'unlisted',
            sgscore: event.score || 0,
            venueScore: event.venue.score || 0
            // venue: {
            //   name: event.venue.name_v2,
            //   score: event.venue.score || 0
            // },
          };
          //For each event, we create a row in the Events table
          return Events.create(eventBody)
          .then(function(createdEvent) {
            //Then we loop through the list of performers in the raw event object we get from SeatGeek
            fetch.Promise.each(event.performers, function(performer) {
              //FOR ERIK: Here's where the call to Spotify is made
              return spotifyApi.searchArtists(performer.name)
              .catch(function(spotifyDataError) {
                console.log('SPOTIFY API ERROR', spotifyDataError);
              })
              .then(function(spotifyData) {
                var artistsBody = {
                  spotify: {
                    followers: spotifyData.body.artists.items[0].followers.total || 0,
                    popularity: spotifyData.body.artists.items[0].popularity || 0,
                  },
                  score: performer.score,
                  genre: spotifyData.body.artists.items[0].genres || 'N/A',
                  name: performer.name || 0,
                  img: spotifyData.body.artists.items[0].images[0].url || 'N/A'
                };

                var updateArtists = fetch.Promise.promisify(Artists.update);

                return updateArtists.call(Artists, artistsBody, {
                  $setOnInsert: performer }, {upsert: true
                })
                .then(function(artistResult) {
                  if (artistResult.upserted) {
                    // if artist has just been created add it to artists in the events db
                    return Events.findByIdAndUpdate(createdEvent._id, {$push: {artists: artistResult.upserted[0]._id}});
                  }
                })
                .catch(function(e) {
                  console.log('ERROR:', e);
                })
                .then(function(continueResult) {
                  return Artists.findOne({'name': performer.name});
                })
                .then(function(foundResult) {
                  // if an artist was previously created add it to artists in the events db
                  return Events.findByIdAndUpdate(createdEvent._id, {$addToSet: {artists: foundResult._id}}, {runValidators: true});
                })
                .then(function(nextResult) {
                  var rawBody = {
                    eventId: nextResult._id,
                    data: {
                      seatgeek: event,
                      spotify: spotifyData
                    }
                  };
                  return EventsRaw.create(rawBody);
                })
                .then(function(eventsRawCreateResults) {
                  Events.find(query)
                  .then(function(queryResults) {
                    return queryResults;
                  });
                });
              });   
            });
          });  
        });
      });
    }
  })
  .then(function(outerResults) {
    setTimeout(function() {
      Events.find(query)
      .then(function(finalQueryResults) {
        return fetch.Promise.map(finalQueryResults, function(finalQueryResult) {
          return Events.findOne(finalQueryResult._id)
          .populate('artists')
          .exec(function(err, event) {
            return event;
          });
        });
      })
      .then(function(mappedResults) {
        // console.log('TESTING', mappedResults);
        if (keywords.length > 0) {
          var results = [];
          mappedResults.forEach(function(mappedResult) {
            var potentialArtist = [];
            var mappedArtists = [];
            mappedResult.artists.forEach(function(artistObject) {
              mappedArtists = mappedArtists.concat(artistObject.name.split(' '))
            })
            console.log('MAPPED ARTISTS', mappedArtists);
            
            for (var i = 0; i < keywords.length; i++) {
              if (mappedArtists.includes(keywords[i])) {
                results.push(mappedResult);
                break;
              }
            }
          })
          res.send(results);
        } else {
          res.send(mappedResults);
        }
      });
    }, 2500);
  });
}


exports.getNearbyEvents = function(req, res) {
  var longitude = req.params.lon;
  var latitude = req.params.lat;
  var query = { 
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [ longitude, latitude ]
        },
        $maxDistance: 100000
      }
    }
  };

  Events.find(query)
  .then(function(eventTableQueryResults) {
    if (eventTableQueryResults.length < 5) {
      return fetch('https://api.seatgeek.com/2/events?taxonomies.name=concert&sort=score.desc&per_page=25&page=1&lon=' + longitude + '&lat=' + latitude + '&range=15mi&client_id=' + process.env.SEATGEEK_CLIENTID)
      .then(function(apiResponse) {
        return apiResponse.json();
      })
      .then(function(json) {
        fetch.Promise.each(json.events, function(event) {
          var eventBody = {
            name: event.short_title,
            start: event.datetime_utc,
            created: new Date(),
            updated: new Date(),
            artists: [],
            score: 0,
            location: { 
              'type': 'Point', 
              'coordinates': [ event.venue.location.lon, event.venue.location.lat ] 
            },
            venue: event.venue.name_v2,
            city: event.venue.city || 'unlisted',
            state: event.venue.state || 'unlisted',
            sgticketsurl: event.url || 'unlisted',
            sgscore: event.score || 0,
            venueScore: event.venue.score || 0
            // venue: {
            //   name: event.venue.name_v2,
            //   score: event.venue.score || 0
            // },
          };
          //For each event, we create a row in the Events table
          return Events.create(eventBody)
          .then(function(createdEvent) {
            //Then we loop through the list of performers in the raw event object we get from SeatGeek
            fetch.Promise.each(event.performers, function(performer) {
              //FOR ERIK: Here's where the call to Spotify is made
              return spotifyApi.searchArtists(performer.name)
              .catch(function(spotifyDataError) {
                console.log('SPOTIFY API ERROR', spotifyDataError);
              })
              .then(function(spotifyData) {
                var artistsBody = {
                  spotify: {
                    followers: spotifyData.body.artists.items[0].followers.total || 0,
                    popularity: spotifyData.body.artists.items[0].popularity || 0,
                  },
                  score: performer.score,
                  genre: spotifyData.body.artists.items[0].genres || 'N/A',
                  name: performer.name || 0,
                  img: spotifyData.body.artists.items[0].images[0].url || 'N/A'
                };

                var updateArtists = fetch.Promise.promisify(Artists.update);

                return updateArtists.call(Artists, artistsBody, {
                  $setOnInsert: performer }, {upsert: true
                })
                .then(function(artistResult) {
                  if (artistResult.upserted) {
                    // if artist has just been created add it to artists in the events db
                    return Events.findByIdAndUpdate(createdEvent._id, {$push: {artists: artistResult.upserted[0]._id}});
                  }
                })
                .catch(function(e) {
                  console.log('ERROR:', e);
                })
                .then(function(continueResult) {
                  return Artists.findOne({'name': performer.name});
                })
                .then(function(foundResult) {
                  // if an artist was previously created add it to artists in the events db
                  return Events.findByIdAndUpdate(createdEvent._id, {$addToSet: {artists: foundResult._id}}, {runValidators: true});
                })
                .then(function(nextResult) {
                  var rawBody = {
                    eventId: nextResult._id,
                    data: {
                      seatgeek: event,
                      spotify: spotifyData
                    }
                  };
                  return EventsRaw.create(rawBody);
                })
                .then(function(eventsRawCreateResults) {
                  Events.find(query)
                  .then(function(queryResults) {
                    return queryResults;
                  });
                });
              });   
            });
          });  
        });
      });
    }
  })
  .then(function(outerResults) {
    setTimeout(function() {
      Events.find(query)
      .then(function(finalQueryResults) {
        return fetch.Promise.map(finalQueryResults, function(finalQueryResult) {
          return Events.findOne(finalQueryResult._id)
          .populate('artists')
          .exec(function(err, event) {
            return event;
          });
        });
      })
      .then(function(mappedResults) {
        console.log('TESTING', mappedResults);
        res.send(mappedResults);
      });
    }, 3300);
  });
};

exports.getKeywords = function(req, res) {
  var hostBot = 'https://eventscore-bot-server-prod.herokuapp.com';
  // var hostBot = 'https://eventscore-bot-server-staging.herokuapp.com'; //staging
  var route = '/api/crawl/keywords/';
  var currentDate = new Date().toISOString();
  Events.find({ start: { $gte: currentDate } })
  .select('name venue')
  .then((result) => {
    var keywords = result.reduce((acc, cur) => {
      var curName = cur.name.toLowerCase();
      var curVenue = cur.venue.toLowerCase();
      if(!acc.includes(curName)) {
        acc.push(cur.name.toLowerCase());
      }
      if(!acc.includes(curVenue)) {
        acc.push(cur.venue.toLowerCase());
      }
      return acc;
    }, []);
    var keywordJoin = keywords.join('^');
    var url = `${hostBot}${route}${keywordJoin}`;
    console.log('url',  url)
    var options = {
      method: 'GET',
    };
   return fetch(url, options);
  })
  .then((result) => {
    console.log('---------------RESULT PRIOR TO TEXT CONVERSION ---------------\n', result);
    return result.json();
  })
  .then((result) => {
    console.log('------------------RESULT AFTER SOME CONVERSION-------------\n', result);
    var currentDate = new Date().toISOString();
    Promise.each(result, (element) => {
      var watsonObj = {};
      watsonObj.watsonToneAnger = element.watsonToneAnger;
      watsonObj.watsonToneDisgust = element.watsonToneDisgust;
      watsonObj.watsonToneFear = element.watsonToneFear;
      watsonObj.watsonToneJoy = element.watsonToneJoy;
      watsonObj.watsonToneSadness = element.watsonToneSadness;
      watsonObj.negativeScore = element.negativeScore;
      watsonObj.score = element.score;
      // var refKeyword = capitalizeFirstLetter(element.keyword);

      return Events.update({ name: element.keyword }, {
        $set: {
          watsonScore: watsonObj,
          score: element.score,
          instances: element.instances,
          updated: currentDate
        }
      });
    });
  })
  .then(
    (result) => {
      // res.send('i should have been closed');
      res.end();
  })
  // .then(
  //   (result) => {
  //   console.log('keywords have been updated')
  // })
  .catch((err) => {
    console.log('error', err);
  });
}

exports.updateEvent = function(req, res) {

};
