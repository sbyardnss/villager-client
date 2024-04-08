/* eslint-disable */
/// <reference types="cypress" />
/* eslint-enable */
import { setupTournaments } from '../../actions/setup-tournaments';
import { setupHomepage } from '../../actions/setup-homepage';
// Cypress._.times(10, () => {

describe('Tournament Components', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    // setupHomepage();
    setupTournaments();
    cy.login();
    cy.intercept(
      'GET',
      '**/clubs/my_clubs',
      { fixture: 'chessClubs/load-chess-clubs.json' },
    ).as('loadChessClubs');
    cy.intercept(
      'GET',
      '**/tournaments/my_open_tournaments',
      { statusCode: 200, fixture: 'tournaments/load-my-tournaments.json' }
    ).as('loadMyTournaments');
    cy.intercept(
      'GET',
      '**/tournaments/153',
      { statusCode: 200, fixture: 'tournaments/load-selected-tournament.json' }
    ).as('loadSelectedTournament');
    cy.visit('/tournament/153');
    let requestCount = 0;
    cy.intercept('GET', '**/games/153/get_selected_tournament_games', (req) => {
      // if (requestCount < 1) {
      req.reply({ statusCode: 200, fixture: 'games/load-tournament-games.json' });
      //   requestCount++;
      // }
    }).as('initialLoadTournamentGames');
  });

  it('User should be able to submit game with the white pieces player as the winner and the game should disappear from the active games list', () => {
    cy.intercept(
      'POST',
      '**/games',
      {
        statusCode: 201,
        fixture: 'games/outgoingGames/white-win-response.json',
      }
    ).as('ScoringTestWhite');
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('exist');
    cy.get('[data-cy="white-scoring-selector--match-1--round-4"]')
      .click({ force: true });
    cy.wait(100);
    cy.get('[data-cy="submit-score-btn--match-1--round-4"]')
      .click({ force: true });
    cy.wait(200);
    cy.wait('@ScoringTestWhite')
      .then((interception) => {
        cy.fixture('games/outgoingGames/scoring-test-white-player-win-request-body.json').then((expectedRequestBody) => {
          expect(interception.request.body).to.deep.equal(expectedRequestBody);
        });
      });
    cy.wait(500);
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('not.exist');
  });

  it('User should be able to submit game with the black pieces player as the winner and the game should disappear from the active games list', () => {
    cy.intercept(
      'POST',
      '**/games',
      {
        statusCode: 201,
        fixture: 'games/outgoingGames/black-win-response.json',
      }
    ).as('ScoringTestBlack');
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('exist');
    cy.get('[data-cy="black-scoring-selector--match-1--round-4"]')
      .click({ force: true });
    cy.wait(100);
    cy.get('[data-cy="submit-score-btn--match-1--round-4"]')
      .click({ force: true });
    cy.wait(200);
    cy.wait('@ScoringTestBlack')
      .then((interception) => {
        cy.fixture('games/outgoingGames/scoring-test-black-player-win-request-body.json').then((expectedRequestBody) => {
          expect(interception.request.body).to.deep.equal(expectedRequestBody);
        });
      });
    cy.wait(500);
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('not.exist');
  });

  it('User should be able to submit game with outcome as draw and the game should disappear from the active games list', () => {
    cy.intercept(
      'POST',
      '**/games',
      {
        statusCode: 201,
        fixture: 'games/outgoingGames/draw-response.json',
      }
    ).as('ScoringTestDraw');
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('exist');
    cy.get('[data-cy="draw-scoring-selector--match-1--round-4"]')
      .click({ force: true });
    cy.wait(100);
    cy.get('[data-cy="submit-score-btn--match-1--round-4"]')
      .click({ force: true });
    cy.wait(200);
    cy.wait('@ScoringTestDraw')
      .then((interception) => {
        cy.fixture('games/outgoingGames/scoring-test-draw-request-body.json').then((expectedRequestBody) => {
          expect(interception.request.body).to.deep.equal(expectedRequestBody);
        });
      });
    cy.wait(500);
    cy.get('[data-cy="matchup-div--match-1--round-4"]')
      .should('not.exist');
  });
  it('Manager should be able to edit score for previous game, making white pieces player the winner and score should update', () => {
    cy.intercept(
      'PUT',
      '**/games/1710',
      {
        statusCode: 200,
        fixture: 'games/editingScoresResponse/edited-white-win.json',
      }
    ).as('ScoringEditWhite');

    cy.get('[data-cy="edit-scores-tournament-control-btn"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="edit-score--round-2--gameId-1710"]')
      .should('be.visible');
    cy.get('[data-cy="edit-score--white-win--round-2--gameId-1710"]')
      .click({ force: true });
    cy.get('[data-cy="edit-score-submit-btn--round-2--gameId-1710"]')
      .click({ force: true })
      .then(() => {
        cy.wait('@ScoringEditWhite')
          .then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            cy.fixture('games/outgoingGames/edited-score-white-to-win-request-body.json').then((expectedRequestBody) => {
              expect(interception.request.body).to.deep.equal(expectedRequestBody);
            });
          });
      });
    cy.get('[data-cy="view-table-tournament-control-btn"]')
      .click();
    cy.wait(200);
    cy.get('[data-cy="4--score-cell"]')
      .should('contain.text', 3);
  });
  it('Manager should be able to edit score for previous game, making black pieces player the winner and score should update', () => {
    cy.intercept(
      'PUT',
      '**/games/1717',
      {
        statusCode: 200,
        fixture: 'games/editingScoresResponse/edited-black-win.json',
      }
    ).as('ScoringEditBlack');

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
            expect(interception.response?.statusCode).to.equal(200);
            cy.fixture('games/outgoingGames/edited-score-black-to-win-request-body.json').then((expectedRequestBody) => {
              expect(interception.request.body).to.deep.equal(expectedRequestBody);
            });
          });
      });
    cy.get('[data-cy="view-table-tournament-control-btn"]')
      .click();
    cy.wait(200);
    cy.get('[data-cy="g5--score-cell"]')
      .should('contain.text', 1.5);
  });
  it('Manager should be able to edit score for previous game, making outcome a draw and scores should update', () => {
    cy.intercept(
      'PUT',
      '**/games/1718',
      {
        statusCode: 200,
        fixture: 'games/editingScoresResponse/edited-draw.json',
      }
    ).as('ScoringEditDraw');

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
            expect(interception.response?.statusCode).to.equal(200);
            cy.fixture('games/outgoingGames/edited-score-draw-request-body.json').then((expectedRequestBody) => {
              expect(interception.request.body).to.deep.equal(expectedRequestBody);
            });
          });
      });
    cy.get('[data-cy="view-table-tournament-control-btn"]')
      .click();
    cy.wait(200);
    cy.get('[data-cy="g61--score-cell"]')
      .should('contain.text', .5);
    cy.get('[data-cy="g7--score-cell"]')
      .should('contain.text', 1);
  });
  it('Manager should be able to change players on a tournament before games start and there should be enough pairings for each player', () => {
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
        if (tournamentRequestCount >= 2) {
          req.reply({ statusCode: 200, fixture: 'tournaments/editingPlayers/edited-players-updated-tournaments-list.json' });
        }
        tournamentRequestCount++;
      }

    ).as('loadMyTournaments');
    cy.intercept(
      'GET',
      '**/tournaments/153',
      { statusCode: 200, fixture: 'tournaments/editingPlayers/edited-players-updated-tournament.json' }
    ).as('LoadActiveTournament');

    cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
    cy.wait(200);
    cy.get('[data-cy="edit-players-tournament-controls-btn"]')
      .should('be.visible')
      .click();
    cy.wait(200);
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
    cy.get('[data-cy="games-not-started-btn"]')
      .click();
    cy.get('[data-cy="submit-players-btn"]')
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
