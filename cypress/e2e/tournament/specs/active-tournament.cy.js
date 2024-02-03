import { setupTournaments } from "../actions/setup-tournaments";

describe('Active Tournament Functionality', () => {
  beforeEach(() => {
    // cy.login();
    // cy.visit('/');
    setupTournaments();
  })
  it('passes', () => {
    cy.visit('/tournament');
    // cy.wait('@loadChessClubs');
    // cy.wait('@loadAllPlayers');
  })
})