# Villager Chess (Client)

An app for assisting chess clubs in coordination and Swiss Tournament management

## Description

Villager Chess is an application for chess clubs to coordinate meetups, play correspondence games, and create/manage Swiss tournaments both in-person and digital. The client side provides an interface and rule set for playing chess with fellow club members using React Chessboard and Chess JS. Anyone can register and create a club of their own or join a previously created club using an optional club password if necessary.


### Dependencies

* [ReactJS](https://react.dev/)
* [ChessJS](https://www.npmjs.com/package/chess.js/v/0.12.0)
* [React Chessboard](https://www.npmjs.com/package/react-chessboard/v/2.1.3)
* [Tournament-pairings](https://www.npmjs.com/package/tournament-pairings)


### Running the docker environment
* Clone this repo's dockerized branch:
```sh
git clone -b dockerize https://github.com/sbyardnss/villager-client.git
```
* Clone the backend repo's dockerized branch:
```sh
git clone -b dockerize https://github.com/sbyardnss/villager-server.git
```
* Open docker desktop
> If you don't have docker desktop, you can find it here:
```sh
https://docs.docker.com/desktop/
```
* Run this to create the shared network:
```sh
docker network create villager_network
```
* Once cloned, using one terminal tab for each repo, navigate to the root directory of each cloned repo
* Build the docker containers
> This command must be run from within the root directory of each cloned repo:
```sh
docker-compose up --build
```
* Once both the frontend and backend have started, open your browser and navigate to:
```sh
http://localhost:3050
```

> You may also manually make requests to the dockerized server container via:
```sh
http://localhost:8000
```

* Stop the containers:
```sh
docker stop villager-server-db-1 && docker stop villager-server-backend-1 && docker stop villager-client-nginx-1
```
* Restart containers:
```sh
docker start villager-server-db-1 && docker start villager-server-backend-1 && docker start villager-client-nginx-1
```

### Removing docker containers and custom network
* Remove containers:
> The containers need to be stopped before they can be removed. Or you may add the force flag (--force)
```sh
docker rm villager-client-nginx-1 && docker rm villager-server-db-1 && docker rm villager-server-backend-1
```

* Remove villager_network:
```sh
docker network rm villager_network
```

### Local NPM Setup

* Clone Repository:
```sh
git clone git@github.com:sbyardnss/villager-client.git
```
> In order to run the full stack application, you will also need to clone the backend repository:
```sh
git clone git@github.com:sbyardnss/villager-server.git
```
* Install dependencies:
> This command must be run from within the villager-client directory on your machine
```sh
npm install
```

### Execution

* Start program
> This should open your browser and navigate to localhost:3000. If it does not, navigate to localhost:3000 in browser manually

```sh
npm start
```