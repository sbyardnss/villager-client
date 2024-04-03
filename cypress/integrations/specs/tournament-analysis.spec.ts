/* eslint-disable */
/// <reference types="cypress" />
/* eslint-enable */
import { setupTournaments } from '../../actions/setup-tournaments';
import { setupHomepage } from '../../actions/setup-homepage';
// Cypress._.times(10, () => {

describe('Tournament Analysis', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    setupHomepage();
    setupTournaments();
    cy.login();
    cy.visit('/tournament');
  });
  it('1 should equal 1', () => {
    expect(1).to.equal(1);
  })
  
});
// })
