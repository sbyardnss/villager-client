import { setupTournaments } from "../actions/setup-tournaments";
//npm run cypress:open
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
  it('User can select tournament to load', () => {
    cy.visit('/tournament');
    cy.wait('@loadChessClubs');
    // cy.wait('@loadAllPlayers');
    // cy.wait('@loadAllGuests');
    cy.wait('@loadMyTournaments');
    // cy.wait(2000);
    cy.get('[data-cy="tournament--1"]')
      .should('exist');
    cy.get('[data-cy="tournament--1"]')
      .click();
    cy.wait('@loadTournamentGames');
    // cy.log('what is the issue');
    // debugger
  })
})

/*
REQUESTS:

HOMEPAGE
get_active_user_games
players
get_open_challenges
get_active_user_games
get_open_challenges
players
games
my_clubs
get_my_clubs_posts


chessClubs

*/