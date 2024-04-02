# Villager Chess (Client)

An app for assisting chess clubs in coordination and Swiss Tournament management

## Description

Villager Chess is an application for chess clubs to coordinate meetups, play correspondence games, and create/manage Swiss tournaments both in-person and digital. The client side provides an interface and rule set for playing chess with fellow club members using React Chessboard and Chess JS. Anyone can register and create a club of their own or join a previously created club using an optional club password if necessary.


### Dependencies

* [ReactJS](https://react.dev/)
* [ChessJS](https://www.npmjs.com/package/chess.js/v/0.12.0)
* [React Chessboard](https://www.npmjs.com/package/react-chessboard/v/2.1.3)
* [Tournament-pairings](https://www.npmjs.com/package/tournament-pairings)


### Setup

* Clone Repository
```sh
git clone git@github.com:sbyardnss/villager-client.git
```

* Install dependencies
```sh
npm install
```

### Execution

* Start program
> This should open your browser and navigate to localhost:3000. If it does not, navigate to localhost:3000 in browser manually

```sh
npm start
```

### Running the docker environment

* Start program
> Clone this repo as well as the backend repo at [http://](https://github.com/sbyardnss/villager-server/tree/dockerize)
> Open the docker daemon
> Run this to create the shared network:
```sh
docker network create villager_network
```
> Navigate to directories
> In the root directory of each repository, run:

```sh
docker-compose up --build
```
> Once both the frontend and backend have started, open your browser and go to http://localhost:3050;