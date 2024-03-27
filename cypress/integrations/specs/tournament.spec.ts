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
    cy.get('[data-cy="select-tournament--153"]')
      .click();
    cy.wait('@loadTournamentGames').its('response.body').its('length').should('equal', 6);
  });
})