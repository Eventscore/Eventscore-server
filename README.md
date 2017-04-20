# Eventscore Server

> Klout for events - An App that determines an event's social impact and weight.

> Buying tickets for events just got easier. With a click of a button, users can see upcoming and uprising events around their area while getting a gauge on the public's social interest on those particular events. Eventscore mission is simple: **Help users make informed ticket buying decision by rating and projecting event popularity based on social buzz**.

## Team

- Aloyius Pawicki
- Edwin Brower
- Jason Kuo
- John Duong

## Required Dependencies (change for server)
- node.js 
- brew ?
- Watchman (brew install watchman) ?

## Setup Instructions (only need to complete once)

- npm install
- git remote add upstream https://github.com/Eventscore/Eventscore-server.git
- create a file called '.env' under the root directory that includes the information in the '.env.example' file and fill in your API keys
- when testing ensure your Client EventScore repo is pointed to the correct location. Use localhose for testing, but ensure you make sure you change it back to the heroku link after it is pushed up. This is currently in Eventscore/app/lip/api.js

## Start Instructions
- npm start

## Requirements (change for server)

- Node 6.4.x
- Redis 2.6.x
- Postgresql 9.1.x
- etc
- etc

## Development (change for server)

### Installing Dependencies (change for server)

From within the root directory:

```sh
npm install -g bower
npm install
bower install
```

### Documentation

- View the project documentation [here](https://docs.google.com/document/d/1bOhUhUnwRuyP1Lwo77mrFLjlYe-N_BVRGO15Y5kEWAI/edit?usp=sharing)

## Contributing

- See [CONTRIBUTING.md](_CONTRIBUTING.md) for contribution guidelines.
