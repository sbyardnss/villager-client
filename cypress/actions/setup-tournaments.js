export function setupTournaments() {
  cy.intercept(
    'GET',
    '**/players',
    { fixture: 'playersAndGuests/load-all-players.json' },
  ).as('loadAllPlayers');

  cy.intercept(
    'GET',
    '**/guests',
    { fixture: 'playersAndGuests/load-all-guests.json' }
  ).as('loadAllGuests');

  cy.intercept(
    'GET',
    '**/players/club_mates',
    { fixture: 'playersAndGuests/load-club-mates.json' }
  ).as('loadClubMates');

  cy.intercept(
    'GET',
    '**/timesettings',
    { fixture: 'timeSettings/load-all-time-settings.json' }
  ).as('loadAllTimes');

  cy.intercept(
    'GET',
    '**/tournaments/my_open_tournaments',
    { fixture: 'tournaments/load-my-tournaments.json' }
  ).as('loadMyTournaments');



  cy.intercept(
    'POST',
    '**/tournaments',
    {
      statusCode: 200, // or the appropriate status code
      body: {
        // Mock response body
        // You can use a fixture or define the response directly here
        fixture: 'tournaments/creation-response.json'
      }
    },
  ).as('CreateTournament');

  cy.intercept(
    'POST',
    '**/guests/create_guest',
    {
      statusCode: 204,
    },
  ).as('CreateGuest');

  cy.intercept(
    'GET',
    '**/clubs/1/get_club_guests',
    { fixture: 'playersAndGuests/load-guests-after-create.json' }
  ).as('loadClubGuestsAfterCreation');
  cy.intercept(
    'POST',
    '**/games',
    {
      statusCode: 201,
      body: {
        fixture: 'games/outgoingGames/scoring-test-white-player-win-response.json',
      }
    }
  ).as('ScoringTestWhite');
  //EXAMPLE OF ASSERTING REQUEST AND BODY SIMULTANEOUSLY
  // cy.fixture('games/outgoingGames/scoring-test-white-player-win-request-body.json').then((expectedRequestBody) => {
  //   cy.intercept(
  //     'POST',
  //     '**/games',
  //     (req) => {
  //       // Assert on the request body here
  //       expect(req.body).to.deep.equal(expectedRequestBody);

  //       // Continue the request with the specified response
  //       req.reply({
  //         statusCode: 201,
  //         // fixture: 'games/outgoingGames/scoring-test-white-player-win-response.json'
  //       });
  //     }
  //   ).as('ScoringTestWhite');
  // });
};
