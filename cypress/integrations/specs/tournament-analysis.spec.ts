/* eslint-disable */
/// <reference types="cypress" />
/* eslint-enable */
// import { useRef, useState } from "react";
import { Guest } from "../../../src/Types/Guest";
import { PlayerRelated } from "../../../src/Types/Player";
import { tournamentAnalysis } from "../../../src/modules/Tournament/actions/matchup-game-analysis"
import { Match } from "tournament-pairings/dist/Match";
import { OutgoingGame } from "../../../src/Types/Game";
// import { setupTournaments } from '../../actions/setup-tournaments';
// import { setupHomepage } from '../../actions/setup-homepage';
// Cypress._.times(10, () => {

describe('Tournament Analysis', () => {
  beforeEach(() => {
    // cy.visit('http://localhost:3000');
    // setupHomepage();
    // setupTournaments();
    // cy.login();
    // cy.visit('/tournament');
  });
  // it('1 should equal 1', () => {
  //   expect(1).to.equal(1);
  // });
  it.only('Given current relevant data, overall tournament analysis function should generate analysis consistently correct', () => {
    const currentByeGameData = {
      current: {
        player_w: {
          id: 8,
          full_name: "john johnson",
          guest_id: "g8"
        },
        player_w_model_type: "guestplayer",
        player_b: {} as Guest | PlayerRelated,
        player_b_model_type: "",
        tournament: 153,
        time_setting: 1,
        win_style: "",
        accepted: true,
        tournament_round: 2,
        winner: {
          id: 8,
          full_name: "john johnson",
          guest_id: "g8"
        },
        winner_model_type: "guestplayer",
        bye: true
      }
    } as React.RefObject<OutgoingGame>;
    let currentMatchups = { current: {} as any };
    const currentRound = 2;
    cy.fixture('tournaments/load-my-tournaments.json').then((tourneyData) => {
      // console.log('tourneyData.pairings', tourneyData[0].pairings)
      currentMatchups.current = tourneyData[0].pairings.filter((p: Match) => p.round === currentRound);
    })
    cy.fixture('games/load-tournament-games').then(gameData => {
      // console.log('gameData', gameData)
      const createdAnalysisObj = tournamentAnalysis(gameData, currentMatchups.current, currentRound, currentByeGameData)
      // console.log('createdAnalysisObj', createdAnalysisObj)

      cy.fixture('tournaments/analysis/active-tournament-analysis.json').then(fixtureData => {
        // console.log('fixtureData', fixtureData);
        // console.log('currentMatchups.current', currentMatchups.current)
        expect(fixtureData).to.deep.equal(createdAnalysisObj);
      });
    })
  })

});
// })


