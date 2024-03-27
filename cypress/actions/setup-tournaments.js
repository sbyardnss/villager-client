export function setupTournaments() {
  cy.intercept(
    'GET',
    '**/players',
    { fixture: 'playersAndGuests/load-all-players.json' },
  ).as('loadAllPlayers');

  cy.intercept(
    'GET',
    '**/guests',
    { fixture: 'playersAndGuests/load-all-guests.json' }
  ).as('loadAllGuests');

  cy.intercept(
    'GET',
    '**/players/club_mates',
    { fixture: 'playersAndGuests/load-club-mates.json' }
  ).as('loadClubMates');

  cy.intercept(
    'GET',
    '**/timesettings',
    { fixture: 'timeSettings/load-all-time-settings.json' }
  ).as('loadAllTimes');

  cy.intercept(
    'GET',
    '**/tournaments/my_open_tournaments',
    { fixture: 'tournaments/load-my-tournaments.json' }
  ).as('loadMyTournaments');

  cy.intercept(
    'GET',
    '**/games/153/get_selected_tournament_games',
    { fixture: 'games/load-tournament-games.json' }
  ).as('loadTournamentGames');
}