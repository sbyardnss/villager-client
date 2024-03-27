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
    cy.wait('@loadMyTournaments');
    cy.get('[data-cy="select-tournament--153"]')
      .should('be.visible')
      .click();
    cy.wait('@loadTournamentGames').its('response.body').its('length').should('equal', 6);
  });

  it.only('User should be able to create a new tournament', () => {
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
    cy.wait('@CreateTournament').then((interception: any) => {
      const { pairings, ...restOfInterception } = interception.request.body;
      cy.fixture('tournaments/create-tournament-payload.json').then((fixtureData) => {
        const { pairings, ...restOfFixtureData } = fixtureData;
        expect(restOfInterception).to.deep.equal(restOfFixtureData);
      });
    })
    
  })
})
