
describe('tournament page available', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.login();
  });
  it('should exist', () => {
    cy.visit('/tournament');
  });
})