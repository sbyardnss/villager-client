/* eslint-disable */
/// <reference types="cypress" />
/* eslint-enable */
import { setupTournaments } from '../../actions/setup-tournaments';
import { setupHomepage } from '../../actions/setup-homepage';

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
      '**/games/153/get_selected_tournament_games',
      { fixture: 'games/load-tournament-games.json' }
    ).as('loadTournamentGames');

    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();

    cy.wait('@loadTournamentGames').its('response.body').its('length').should('equal', 6);
  });

  it('User should be able to create a new tournament', () => {
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

  it.only('User should be able to submit game with the white pieces player as the winner and the game should disappear from the active games list when the games are reloaded', () => {
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

    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="matchup-div--match-1--round-2--tournament-153"]')
      .should('exist');
    cy.get('[data-cy="white-scoring-selector--match-1--round-2--tournament-153"]')
      .click();
    cy.get('[data-cy="submit-score-btn--match-1--round-2--tournament-153"]')
      .click();
    cy.wait('@ScoringTestWhite')
      .then((interception) => {
        cy.fixture('games/outgoingGames/scoring-test-white-player-win-request-body.json').then((expectedRequestBody) => {
          expect(interception.request.body).to.deep.equal(expectedRequestBody);
        });
      });
    cy.get('[data-cy="matchup-div--match-1--round-2--tournament-153"]')
      .should('not.exist');
  });
});
