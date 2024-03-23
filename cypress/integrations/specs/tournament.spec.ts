/* eslint-disable */
/// <reference types="cypress" />
/* eslint-enable */

import { setupTournaments } from '../../actions/setup-tournaments';
import { setupHomepage } from '../../actions/setup-homepage';

describe('Selecting a tournament from list loads tournament', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    setupHomepage();
    setupTournaments();
  });
  it('should exist', () => {
    cy.login();
    cy.visit('/tournament');
    // cy.wait('@loadMyTournaments');
    // cy.wait('@loadClubMates');
    // cy.wait('@loadChessClubs');
    cy.get('[data-cy="select-tournament--153"]')
      .click();
    cy.wait('@loadTournamentGames').its('response.body').its('length').should('be.gt', 0);
  });
})