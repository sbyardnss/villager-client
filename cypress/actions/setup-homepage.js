export function setupHomepage() {
  // cy.login();
  cy.intercept(
    'GET',
    '**/clubs/my_clubs',
    { fixture: 'chessClubs/load-chess-clubs.json' },
  ).as('loadChessClubs');

  cy.intercept(
    'GET',
    '/games/get_active_user_games',
    { fixture: 'games/load-user-active-games.json' }
  ).as('loadUserActiveGames');
  cy.intercept(
    'GET',
    '/games/get_open_challenges',
    { fixture: 'games/load-open-challenges.json' }
  ).as('loadUserActiveGames');

}