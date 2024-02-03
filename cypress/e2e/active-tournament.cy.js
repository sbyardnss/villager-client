describe('Active Tournament Functionality', () => {
  beforeEach(() => {
    cy.login();
    // cy.visit('/');
  })
  it('passes', () => {
    cy.visit('/tournament')
  })
})