import cy from 'cypress';

export function setupTournaments() {
  cy.login();
  cy.intercept(
    'GET',
    '/clubs/my_clubs',
    { fixture: 'tournaments/load-chess-clubs.json' },
  ).as('loadChessClubs');

  cy.intercept(
    'GET',
    '/players',
    { fixture: 'tournaments/load-all-players.json' },
  ).as('loadAllPlayers')

  cy.intercept(
    'GET',
    '/guests',
    { fixture: 'tournaments/load-all-guests.json' }
  ).as('loadAllGuests')

  cy.intercept(
    'GET',
    '*/players/club_mates',
    { fixture: 'tournaments/load-all-guests.json' }
  ).as('loadClubMates')

  cy.intercept(
    'GET',
    '/timesettings',
    { fixture: 'tournaments/load-all-time-settings.json' }
  ).as('loadAllTimes')

  cy.intercept(
    'GET',
    '/tournaments/my_open_tournaments',
    { fixture: 'tournaments/load-my-tournaments.json' }
  ).as('loadMyTournaments')

  cy.intercept(
    'GET',
    '/games/1/get_selected_tournament_games',
    { fixture: 'tournaments/load-tournament-games.json' }
  ).as('loadTournamentGames')
}