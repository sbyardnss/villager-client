/* eslint-disable */
/// <reference types="cypress" />
/* eslint-enable */
import { setupTournaments } from '../../actions/setup-tournaments';
import { validateRoundPairings } from '../../support/commands';
import { Match } from 'tournament-pairings/dist/Match';
// Cypress._.times(10, () => {

describe('Editing players on tournament functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/tournaments/153');
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
  });

  // it('Manager should be able to change players on a tournament before games start and there should be enough pairings for each player', () => {
  //   cy.intercept('GET', '**/tournaments/153/get_selected_tournament_games', (req) => {
  //     req.reply({ statusCode: 200, fixture: 'games/load-tournament-games.json' });
  //   }).as('initialLoadTournamentGames');
  //   const addSelectors = [
  //     'select-player--Richard--67',
  //     'select-player--Alex--64',
  //     'select-player--Adam--69',
  //   ];
  //   const removePlayerSelectors = [
  //     'remove-player--tiger woods--2'
  //   ];
  //   const removeGuestSelectors = [
  //     'remove-guest--Chewy--61',
  //     'remove-guest--Bob Ross--1'
  //   ];
  //   let tournamentRequestCount = 0;
  //   cy.intercept(//TODO: DO WE NEED THIS INTERCEPT
  //     'GET',
  //     '**/tournaments/my_open_tournaments',
  //     (req) => {
  //       if (tournamentRequestCount >= 2) {
  //         req.reply({ statusCode: 200, fixture: 'tournaments/editingPlayers/edited-players-updated-tournaments-list.json' });
  //       }
  //       tournamentRequestCount++;
  //     }

  //   ).as('loadMyTournaments');
  //   cy.intercept(
  //     'GET',
  //     '**/tournaments/153',
  //     { statusCode: 200, fixture: 'tournaments/editingPlayers/edited-players-updated-tournament.json' }
  //   ).as('LoadActiveTournament');

  //   cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
  //   cy.wait(200);
  //   cy.get('[data-cy="edit-players-tournament-controls-btn"]')
  //     .should('be.visible')
  //     .click();
  //   cy.wait(200);
  //   cy.get('[data-cy="toggle-guests--true"]')
  //     .click();
  //   addSelectors.forEach(selector => {
  //     cy.get(`[data-cy="${selector}"]`).click();
  //   });
  //   removePlayerSelectors.forEach(selector => {
  //     cy.get(`[data-cy="${selector}"]`).click();

  //   });
  //   removeGuestSelectors.forEach(selector => {
  //     cy.get(`[data-cy="${selector}"]`).click();
  //   });
  //   cy.get('[data-cy="confirm-player-selection"]')
  //     .click();
  //   cy.get('[data-cy="games-not-started-btn"]')
  //     .click();
  //   cy.get('[data-cy="submit-players-btn"]')
  //     .click();
  //   cy.get('[data-cy="new-round-btn-confirm-no-force"]')
  //     .click();
  //   cy.wait('@SubmitEditedTournament').then(interception => {
  //     const newPlayers = interception.request.body.competitors.sort((a: any, b: any) => a.id - b.id);
  //     const newGuests = interception.request.body.guest_competitors.sort((a: any, b: any) => a.id - b.id);
  //     expect(interception.request.body.pairings.filter((p: any) => p.round === 4).length).to.equal(7);
  //     cy.fixture('tournaments/editingPlayers/edited-players-updated-tournament.json').then((expectedRequestBody) => {
  //       const fixturePlayers = expectedRequestBody.competitors.sort((a: any, b: any) => a.id - b.id);
  //       const fixtureGuests = expectedRequestBody.guest_competitors.sort((a: any, b: any) => a.id - b.id);
  //       expect(newPlayers).to.deep.equal(fixturePlayers);
  //       expect(newGuests).to.deep.equal(fixtureGuests);
  //     });
  //   });
  //   cy.wait('@LoadActiveTournament').then(interception => {
  //     const newPlayers = interception.response?.body.competitors.sort((a: any, b: any) => a.id - b.id);
  //     const newGuests = interception.response?.body.guest_competitors.sort((a: any, b: any) => a.id - b.id);
  //     cy.fixture('tournaments/editingPlayers/edited-players-updated-tournament.json').then((expectedRequestBody) => {
  //       const fixturePlayers = expectedRequestBody.competitors.sort((a: any, b: any) => a.id - b.id);
  //       const fixtureGuests = expectedRequestBody.guest_competitors.sort((a: any, b: any) => a.id - b.id);
  //       expect(newPlayers).to.deep.equal(fixturePlayers);
  //       expect(newGuests).to.deep.equal(fixtureGuests);
  //     });
  //   });
  // });

  // it('Manager should be able to change players on a tournament before games start and with a forced pairing and there should be enough pairings for each player ', () => {
  //   cy.intercept('GET', '**/tournaments/153/get_selected_tournament_games', (req) => {
  //     req.reply({ statusCode: 200, fixture: 'games/load-tournament-games.json' });
  //   }).as('initialLoadTournamentGames');
  //   const addSelectors = [
  //     'select-player--Richard--67',
  //     'select-player--Alex--64',
  //     'select-player--Adam--69',
  //   ];
  //   const removePlayerSelectors = [
  //     'remove-player--tiger woods--2'
  //   ];
  //   const removeGuestSelectors = [
  //     'remove-guest--Chewy--61',
  //     'remove-guest--Bob Ross--1'
  //   ];

  //   cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
  //   cy.wait(200);
  //   cy.get('[data-cy="edit-players-tournament-controls-btn"]')
  //     .should('be.visible')
  //     .click();
  //   cy.wait(200);
  //   cy.get('[data-cy="toggle-guests--true"]')
  //     .click();
  //   addSelectors.forEach(selector => {
  //     cy.get(`[data-cy="${selector}"]`).click();
  //   });
  //   removePlayerSelectors.forEach(selector => {
  //     cy.get(`[data-cy="${selector}"]`).click();

  //   });
  //   removeGuestSelectors.forEach(selector => {
  //     cy.get(`[data-cy="${selector}"]`).click();
  //   });
  //   cy.get('[data-cy="confirm-player-selection"]')
  //     .click();
  //   cy.get('[data-cy="games-not-started-btn"]')
  //     .click();
  //   cy.get('[data-cy="submit-players-btn"]')
  //     .click();
  //   cy.get('[data-cy="new-round-btn-add-force"]')
  //     .click();
  //   cy.get('[data-cy="select-player--Barbie--59"]')
  //     .click();
  //   cy.get('[data-cy="select-player--Alex--64"]')
  //     .click();
  //   cy.get("[data-cy='force-modal-create-round-btn']")
  //     .click();
  //   cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
  //   cy.wait(200);
  //   cy.wait('@SubmitEditedTournament').then(async (interception: any) => {
  //     const currentRound = interception.request.body.rounds;
  //     const allCompetitors = interception.request.body.competitors.concat(interception.request.body.guest_competitors);
  //     const allPairings = interception.request.body.pairings;
  //     await validateRoundPairings(allCompetitors, allPairings, currentRound, undefined);
  //     const forcedPairingFromRequest = interception.request.body.pairings.find((p: Match) => (p.player1 === 'g59' && p.player2 === 'g64') || (p.player1 === 'g64' && p.player2 === 'g59'));

  //     expect(forcedPairingFromRequest).to.have.property('round', 4);
  //     expect(forcedPairingFromRequest).to.have.property('match', 1);
  //   });
  // });

  // it('Manager should be able to change players on a tournament after games have started. Any pairings that have already been played should be unchanged and all players should have a pairing', () => {
  //   cy.intercept('GET', '**/tournaments/153/get_selected_tournament_games', (req) => {
  //     req.reply({ statusCode: 200, fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-white-win.json' });
  //   }).as('initialLoadTournamentGames');
  //   const addSelectors = [
  //     'select-player--Richard--67',
  //     'select-player--Alex--64',
  //     'select-player--Adam--69',
  //   ];
  //   const removePlayerSelectors = [
  //     'remove-player--tiger woods--2'
  //   ];
  //   const removeGuestSelectors = [
  //     'remove-guest--Chewy--61',
  //     'remove-guest--Bob Ross--1'
  //   ];
  //   cy.intercept(
  //     'GET',
  //     '**/tournaments/153',
  //     { statusCode: 200, fixture: 'tournaments/editingPlayers/edited-players-updated-tournament.json' }
  //   ).as('LoadActiveTournament');

  //   cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
  //   cy.wait(200);
  //   cy.get('[data-cy="edit-players-tournament-controls-btn"]')
  //     .should('be.visible')
  //     .click();
  //   cy.wait(200);
  //   cy.get('[data-cy="toggle-guests--true"]')
  //     .click();
  //   addSelectors.forEach(selector => {
  //     cy.get(`[data-cy="${selector}"]`).click();
  //   });
  //   removePlayerSelectors.forEach(selector => {
  //     cy.get(`[data-cy="${selector}"]`).click();

  //   });
  //   removeGuestSelectors.forEach(selector => {
  //     cy.get(`[data-cy="${selector}"]`).click();
  //   });
  //   cy.get('[data-cy="confirm-player-selection"]')
  //     .click();
  //   cy.get('[data-cy="games-already-started-btn"]')
  //     .click();
  //   cy.get('[data-cy="submit-players-btn"]')
  //     .click();

  //   cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
  //   cy.wait(200);
  //   cy.wait('@SubmitEditedTournament').then(async (interception: any) => {
  //     const currentRound = interception.request.body.rounds;
  //     const allCompetitors = interception.request.body.competitors.concat(interception.request.body.guest_competitors);
  //     const allPairings = interception.request.body.pairings;
  //     await validateRoundPairings(allCompetitors, allPairings, currentRound, undefined);
  //   });
  //   cy.wait('@LoadActiveTournament');
  // });
  // it('Manager should be able to create a new set of pairings, adding a forced match, with same players. New pairings should provide all players with match.', () => {
  //   cy.intercept('GET', '**/tournaments/153/get_selected_tournament_games', (req) => {
  //     req.reply({ statusCode: 200, fixture: 'games/load-tournament-games.json' });
  //   }).as('initialLoadTournamentGames');

  //   cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
  //   cy.wait(200);
  //   cy.get('[data-cy="edit-players-tournament-controls-btn"]')
  //     .should('be.visible')
  //     .click();
  //   cy.wait(200);

  //   cy.get('[data-cy="confirm-player-selection"]')
  //     .click();
  //   cy.get('[data-cy="games-not-started-btn"]')
  //     .click();
  //   cy.get('[data-cy="submit-players-btn"]')
  //     .click();
  //   cy.get('[data-cy="new-round-btn-add-force"]')
  //     .click();
  //   cy.get('[data-cy="select-player--josh ryner--3"]')
  //     .click();
  //   cy.get('[data-cy="select-player--Chewy--61"]')
  //     .click();
  //   cy.get("[data-cy='force-modal-create-round-btn']")
  //     .click();
  //   cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
  //   cy.wait(200);
  //   cy.wait('@SubmitEditedTournament').then(async (interception: any) => {
  //     const currentRound = interception.request.body.rounds;
  //     const allCompetitors = interception.request.body.competitors.concat(interception.request.body.guest_competitors);
  //     const allPairings = interception.request.body.pairings;
  //     await validateRoundPairings(allCompetitors, allPairings, currentRound, undefined);
  //     const forcedPairingFromRequest = interception.request.body.pairings.find((p: Match) => (p.player1 === 3 && p.player2 === 'g61') || (p.player1 === 'g61' && p.player2 === 3));

  //     expect(forcedPairingFromRequest).to.have.property('round', 4);
  //     expect(forcedPairingFromRequest).to.have.property('match', 1);
  //   });
  // })
  it('Manager should be able to create a new set of pairings, removing a player that has already played their match in the round, with games already started, and only 1 unmatched player. New pairings should provide all players with match.', () => {
    cy.intercept('GET', '**/tournaments/153/get_selected_tournament_games', (req) => {
      req.reply({ statusCode: 200, fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-white-win.json' });
    }).as('initialLoadTournamentGames');

    cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
    cy.wait(200);
    
    cy.get('[data-cy="edit-players-tournament-controls-btn"]')
      .should('be.visible')
      .click();
    cy.wait(200);
    cy.get('[data-cy="remove-guest--phil--5"]')
      .click();
    cy.get('[data-cy="confirm-player-selection"]')
      .click();
    cy.get('[data-cy="games-already-started-btn"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="submit-players-btn"]')
      .click();
    cy.wait(200);
    cy.wait('@SubmitEditedTournament').then(async (interception) => {
      const requestTournament = interception.request.body;
      const requestGuests = interception.request.body.guest_competitors;
      const requestPairings = interception.request.body.pairings;
      cy.fixture('tournaments/editingPlayers/single-unmatched-competitor.json').then((fixtureData) => {
        const expectedGuests = fixtureData.guest_competitors;
        const expectedPairings = fixtureData.pairings;

        expect(requestGuests).to.deep.equal(expectedGuests);
        expect(requestPairings).to.deep.equal(expectedPairings);
        expect(requestTournament).to.deep.equal(fixtureData);
      });
      const currentRound = interception.request.body.rounds;
      const allCompetitors = interception.request.body.competitors.concat(interception.request.body.guest_competitors);
      await validateRoundPairings(allCompetitors, requestPairings, currentRound, ['g5']);
    });
  });
  it('Manager should be able to create a new set of pairings, removing a player that has already played their match in the round and one that has not, with games already started, and 2 unmatched players. Bye player should now have a match and new pairings should provide all players with match.', () => {
    cy.intercept('GET', '**/tournaments/153/get_selected_tournament_games', (req) => {
      req.reply({ statusCode: 200, fixture: 'games/getResponsesAfterSubmittedGames/load-tournament-games-white-win.json' });
    }).as('initialLoadTournamentGames');

    cy.intercept('PUT', '**/tournaments/153', { statusCode: 204 }).as('SubmitEditedTournament');
    cy.wait(200);

    cy.get('[data-cy="edit-players-tournament-controls-btn"]')
      .should('be.visible')
      .click();
    cy.wait(200);
    cy.get('[data-cy="remove-guest--phil--5"]')
      .click();
    cy.get('[data-cy="remove-guest--Bob Ross--1"]')
      .click();
    cy.get('[data-cy="confirm-player-selection"]')
      .click();
    cy.get('[data-cy="games-already-started-btn"]')
      .should('be.visible')
      .click();
    cy.get('[data-cy="submit-players-btn"]')
      .click();
    cy.wait(200);
    cy.wait('@SubmitEditedTournament').then(async (interception) => {
      const requestPairings = interception.request.body.pairings;
      const currentRound = interception.request.body.rounds;
      const allCompetitors = interception.request.body.competitors.concat(interception.request.body.guest_competitors);
      await validateRoundPairings(allCompetitors, requestPairings, currentRound, ['g5']);


      //TODO: ADD FURTHER VALIDATION TO THIS TEST. THIS ADDED BIT IS GOOD FOR TIME BEING
      const pairingForFormerlyByePlayer = requestPairings.find((pairing: Match) => pairing.player1 === 'g8' || pairing.player2 === 'g8');
      expect(pairingForFormerlyByePlayer).to.exist;
    });
  });
});
// })
