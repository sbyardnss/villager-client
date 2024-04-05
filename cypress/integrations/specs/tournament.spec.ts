/* eslint-disable */
/// <reference types="cypress" />
/* eslint-enable */
import { setupTournaments } from '../../actions/setup-tournaments';
import { setupHomepage } from '../../actions/setup-homepage';
// Cypress._.times(10, () => {

describe('Tournament Components', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    setupHomepage();
    setupTournaments();
    cy.login();
    cy.visit('/tournament');
  });
  it('When user selects a tournament, the tournament and its games should be loaded', () => {
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    cy.intercept(
      'GET',
      '**/games/153/get_selected_tournament_games',
      { fixture: 'games/load-tournament-games.json' }
    ).as('loadTournamentGames');

    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();

    cy.wait('@loadTournamentGames').its('response.body').its('length').should('equal', 19);
  });

  it('User should be able to create a new tournament', () => {
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    const selectors = [
      'select-player--stephen byard--1',
      'select-player--tiger woods--2',
      'select-player--josh ryner--3',
      'select-player--josh whiteman--4',
      'select-player--jim jimothy--5',
      'select-player--bill johnson--6',
      'select-player--Bob Ross--1',
      'select-player--phil--5',
      'select-player--mark--7'
    ];
    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="create-tournament-btn"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="select-club-for-tournament-creation--1"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="toggle-guests--true"]')
      .click();
    selectors.forEach(selector => {
      cy.get(`[data-cy="${selector}"]`).click();
    });
    cy.get('[data-cy="confirm-player-selection"]')
      .click();
    cy.get('[data-cy="tournament-title-input"]')
      .type('test creation cy');
    cy.get('[data-cy="tournament-time-setting-selection"]')
      .select('5 minutes -- 0 second increment');
    cy.get('[data-cy="start-tournament-btn"]')
      .click();
    cy.wait('@CreateTournament').then((interception) => {
      const { pairings, ...restOfInterception } = interception.request.body;
      cy.fixture('tournaments/create-tournament-payload.json').then((fixtureData) => {
        const { pairings, ...restOfFixtureData } = fixtureData;
        expect(restOfInterception).to.deep.equal(restOfFixtureData);
      });
    });
  });

  it('User should be able to create a new guest and new guest should appear in list of potential players', () => {
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="create-tournament-btn"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="select-club-for-tournament-creation--1"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="toggle-guests--true"]')
      .click();
    cy.get('[data-cy="create-guest-input"]')
      .type("John Cena, can't see me!");
    cy.get('[data-cy="create-guest-btn"]')
      .click();
    cy.intercept('@CreateGuest');
    cy.intercept('@loadClubGuestsAfterCreation');
    cy.get('[data-cy="select-player--John Cena, can\'t see me!--60"]')
      .should('exist')
      .should('contain.text', "John Cena, can't see me!");
  });

  it('User should be able to submit game with the white pieces player as the winner and the game should disappear from the active games list when the games are reloaded', () => {
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    // Set up the intercept outside of any conditional logic
    let requestCount = 0;
    cy.intercept('GET', '**/games/153/get_selected_tournament_games', (req) => {
      if (requestCount < 2) {
        req.reply({ fixture: 'games/load-tournament-games.json' });
      } else if (requestCount >= 2) {
        req.reply({ fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-white-win.json' });
      }
      requestCount++;
    }).as('loadTournamentGames');

    cy.intercept(
      'POST',
      '**/games',
      {
        statusCode: 201,
        // body: {
        //   fixture: 'games/outgoingGames/scoring-test-white-player-win-response.json',
        // }
      }
    ).as('ScoringTestWhite');

    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('exist');
    cy.get('[data-cy="white-scoring-selector--match-1--round-4"]')
      .click();
    cy.get('[data-cy="submit-score-btn--match-1--round-4"]')
      .click()
      .then(() => {
        cy.wait('@ScoringTestWhite')
          .then((interception) => {
            cy.fixture('games/outgoingGames/scoring-test-white-player-win-request-body.json').then((expectedRequestBody) => {
              expect(interception.request.body).to.deep.equal(expectedRequestBody);
            });
          });
      });
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('not.exist');
  });

  it('User should be able to submit game with the black pieces player as the winner and the game should disappear from the active games list when the games are reloaded', () => {
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    let requestCount = 0;
    cy.intercept('GET', '**/games/153/get_selected_tournament_games', (req) => {
      if (requestCount < 2) {
        req.reply({ fixture: 'games/load-tournament-games.json' });
      } else if (requestCount >= 2) {
        req.reply({ fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-black-win.json' });
      }
      requestCount++;
    }).as('loadTournamentGames');

    cy.intercept(
      'POST',
      '**/games',
      {
        statusCode: 201,
        // body: {
        //   fixture: 'games/outgoingGames/scoring-test-black-player-win-response.json',
        // }
      }
    ).as('ScoringTestBlack');

    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('exist');
    cy.get('[data-cy="black-scoring-selector--match-1--round-4"]')
      .click();
    cy.get('[data-cy="submit-score-btn--match-1--round-4"]')
      .click()
      .then(() => {
        cy.wait('@ScoringTestBlack')
          .then((interception) => {
            cy.fixture('games/outgoingGames/scoring-test-black-player-win-request-body.json').then((expectedRequestBody) => {
              expect(interception.request.body).to.deep.equal(expectedRequestBody);
            });
          });
      });
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('not.exist');
  });

  it('User should be able to submit game with outcome as draw and the game should disappear from the active games list when the games are reloaded', () => {
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    let requestCount = 0;
    cy.intercept('GET', '**/games/153/get_selected_tournament_games', (req) => {
      if (requestCount < 2) {
        req.reply({ fixture: 'games/load-tournament-games.json' });
      } else if (requestCount >= 2) {
        req.reply({ fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-draw.json' });
      }
      requestCount++;
    }).as('loadTournamentGames');

    cy.intercept(
      'POST',
      '**/games',
      {
        statusCode: 201,
        // body: {
        //   fixture: 'games/outgoingGames/scoring-test-draw-response.json',
        // }
      }
    ).as('ScoringTestDraw');

    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('exist');
    cy.get('[data-cy="draw-scoring-selector--match-1--round-4"]')
      .click();
    cy.get('[data-cy="submit-score-btn--match-1--round-4"]')
      .click()
      .then(() => {
        cy.wait('@ScoringTestDraw')
          .then((interception) => {
            cy.fixture('games/outgoingGames/scoring-test-draw-request-body.json').then((expectedRequestBody) => {
              expect(interception.request.body).to.deep.equal(expectedRequestBody);
            });
          });
      });
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('not.exist');
  });
  it('Manager should be able to edit score for previous game, making white pieces player the winner and score should update', () => {
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    let requestCount = 0;
    cy.intercept('GET', '**/games/153/get_selected_tournament_games', (req) => {
      if (requestCount < 2) {
        req.reply({ fixture: 'games/load-tournament-games.json' });
      } else if (requestCount >= 2) {
        req.reply({ fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-edit-white-win.json' });
      }
      requestCount++;
    }).as('loadTournamentGames');
    cy.intercept(
      'PUT',
      '**/games/1710',
      { statusCode: 204 }
    ).as('ScoringEditWhite');

    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="edit-scores-tournament-control-btn"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="edit-score--round-2--gameId-1710"]')
      .should('be.visible');
    cy.get('[data-cy="edit-score--white-win--round-2--gameId-1710"]')
      .click();
    cy.get('[data-cy="edit-score-submit-btn--round-2--gameId-1710"]')
      .click()
      .then(() => {
        cy.wait('@ScoringEditWhite')
          .then((interception) => {
            expect(interception.response?.statusCode).to.equal(204);
            cy.fixture('games/outgoingGames/edited-score-white-to-win-request-body.json').then((expectedRequestBody) => {
              expect(interception.request.body).to.deep.equal(expectedRequestBody);
            });
          });
      });
    cy.get('[data-cy="view-table-tournament-control-btn"]')
      .click();
    cy.get('[data-cy="4--score-cell"]')
      .should('contain.text', 3);
  });
  it('Manager should be able to edit score for previous game, making black pieces player the winner and score should update', () => {
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    let requestCount = 0;
    cy.intercept('GET', '**/games/153/get_selected_tournament_games', (req) => {
      if (requestCount < 2) {
        req.reply({ fixture: 'games/load-tournament-games.json' });
      } else if (requestCount >= 2) {
        req.reply({ fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-edit-black-win.json' });
      }
      requestCount++;
    }).as('loadTournamentGames');
    cy.intercept(
      'PUT',
      '**/games/1717',
      { statusCode: 204 }
    ).as('ScoringEditBlack');

    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="edit-scores-tournament-control-btn"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="edit-score--round-3--gameId-1717"]')
      .should('be.visible');
    cy.get('[data-cy="edit-score--black-win--round-3--gameId-1717"]')
      .click();
    cy.get('[data-cy="edit-score-submit-btn--round-3--gameId-1717"]')
      .click()
      .then(() => {
        cy.wait('@ScoringEditBlack')
          .then((interception) => {
            expect(interception.response?.statusCode).to.equal(204);
            cy.fixture('games/outgoingGames/edited-score-black-to-win-request-body.json').then((expectedRequestBody) => {
              expect(interception.request.body).to.deep.equal(expectedRequestBody);
            });
          });
      });
    cy.get('[data-cy="view-table-tournament-control-btn"]')
      .click();
    cy.get('[data-cy="g5--score-cell"]')
      .should('contain.text', 1.5);
  });
  it('Manager should be able to edit score for previous game, making outcome a draw and scores should update', () => {
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    let requestCount = 0;
    cy.intercept('GET', '**/games/153/get_selected_tournament_games', (req) => {
      if (requestCount < 2) {
        req.reply({ fixture: 'games/load-tournament-games.json' });
      } else if (requestCount >= 2) {
        req.reply({ fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-edit-draw.json' });
      }
      requestCount++;
    }).as('loadTournamentGames');
    cy.intercept(
      'PUT',
      '**/games/1718',
      { statusCode: 204 }
    ).as('ScoringEditDraw');

    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="edit-scores-tournament-control-btn"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="edit-score--round-3--gameId-1718"]')
      .should('be.visible');
    cy.get('[data-cy="edit-score--draw--round-3--gameId-1718"]')
      .click();
    cy.get('[data-cy="edit-score-submit-btn--round-3--gameId-1718"]')
      .click()
      .then(() => {
        cy.wait('@ScoringEditDraw')
          .then((interception) => {
            expect(interception.response?.statusCode).to.equal(204);
            cy.fixture('games/outgoingGames/edited-score-draw-request-body.json').then((expectedRequestBody) => {
              expect(interception.request.body).to.deep.equal(expectedRequestBody);
            });
          });
      });
    cy.get('[data-cy="view-table-tournament-control-btn"]')
      .click();
    cy.get('[data-cy="g61--score-cell"]')
      .should('contain.text', .5);
    cy.get('[data-cy="g7--score-cell"]')
      .should('contain.text', 1);
  });
  it('Manager should be able to adjust change players on a tournament before games start and there should be enough pairings for each player', () => {
    const addSelectors = [
      'select-player--Richard--67',
      'select-player--Alex--64',
      'select-player--Adam--69',
    ];
    const removePlayerSelectors = [
      'remove-player--tiger woods--2'
    ];
    const removeGuestSelectors = [
      'remove-guest--Chewy--61',
      'remove-guest--Bob Ross--1'
    ];
    let tournamentRequestCount = 0;
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      (req) => {
        console.log('count', tournamentRequestCount)
        if (tournamentRequestCount < 2) {
          req.reply({ fixture: 'tournaments/load-my-tournaments.json' });
        } else {
          req.reply({ fixture: 'tournaments/editingPlayers/edited-players-updated-tournaments-list.json' });
        }
        tournamentRequestCount++;
      }

    ).as('loadMyTournaments');
    cy.intercept(
      'GET',
      '**/tournaments/153',
      { fixture: 'tournaments/editingPlayers/edited-players-updated-tournament.json' }
    ).as('LoadActiveTournament');
    let requestCount = 0;
    cy.intercept('GET', '**/games/153/get_selected_tournament_games', (req) => {
      if (requestCount < 2) {
        req.reply({ fixture: 'games/load-tournament-games.json' });
      } else if (requestCount >= 2) {
        req.reply({ fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-edit-draw.json' });
      }
      requestCount++;
    }).as('loadTournamentGames');
    cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="edit-players-tournament-controls-btn"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="toggle-guests--true"]')
      .click();
    addSelectors.forEach(selector => {
      cy.get(`[data-cy="${selector}"]`).click();
    });
    removePlayerSelectors.forEach(selector => {
      cy.get(`[data-cy="${selector}"]`).click();

    });
    removeGuestSelectors.forEach(selector => {
      cy.get(`[data-cy="${selector}"]`).click();
    });
    cy.get('[data-cy="confirm-player-selection"]')
      .click();
    cy.get('.gamesNotStartedBtn')
      .click();
    cy.get('#submitNewPlayersBtn')
      .click();
    cy.wait('@SubmitEditedTournament').then(interception => {
      const newPlayers = interception.request.body.competitors.sort((a: any, b: any) => a.id - b.id);
      const newGuests = interception.request.body.guest_competitors.sort((a: any, b: any) => a.id - b.id);
      expect(interception.request.body.pairings.filter((p: any) => p.round === 4).length).to.equal(7);
      cy.fixture('tournaments/editingPlayers/edited-players-updated-tournament.json').then((expectedRequestBody) => {
        const fixturePlayers = expectedRequestBody.competitors.sort((a: any, b: any) => a.id - b.id);
        const fixtureGuests = expectedRequestBody.guest_competitors.sort((a: any, b: any) => a.id - b.id);
        expect(newPlayers).to.deep.equal(fixturePlayers);
        expect(newGuests).to.deep.equal(fixtureGuests);
      });
    });
    cy.wait('@LoadActiveTournament').then(interception => {
      const newPlayers = interception.response?.body.competitors.sort((a: any, b: any) => a.id - b.id);
      const newGuests = interception.response?.body.guest_competitors.sort((a: any, b: any) => a.id - b.id);
      cy.fixture('tournaments/editingPlayers/edited-players-updated-tournament.json').then((expectedRequestBody) => {
        const fixturePlayers = expectedRequestBody.competitors.sort((a: any, b: any) => a.id - b.id);
        const fixtureGuests = expectedRequestBody.guest_competitors.sort((a: any, b: any) => a.id - b.id);
        expect(newPlayers).to.deep.equal(fixturePlayers);
        expect(newGuests).to.deep.equal(fixtureGuests);
      });
    });
  })
});
// })
