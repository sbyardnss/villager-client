// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { Match } from "tournament-pairings/dist/Match";
import { PlayerRelated } from "../../src/Types/Player";
import { Guest } from "../../src/Types/Guest";
import { findByIdentifier } from "../../src/modules/Tournament/actions/find-by-identifier";
import { findIdentifier } from "../../src/modules/Tournament/actions/find-identifier";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(): Chainable<any>;
    }
  }
}

// Wrap your command definitions in a function
// export function registerCommands() {
//   Cypress.Commands.add('login', () => {
//     window.localStorage.setItem('villager', JSON.stringify({ valid: true, token: "06787add96eb3264080015997720cb0877b40f90", userId: 1 }));
//   });
// }
export function registerCommands() {
  Cypress.Commands.add('login', () => {
    // cy.request({
    //   method: 'POST',
    //   url: 'https://villager-chess-server-acc4f0b418c8.herokuapp.com/login',
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Accept": "application/json",
    //   },
    //   body: {
    //     user: {
    //       username: 'sbyard',
    //       password: 'sb',
    //     }
    //   }
    // })
    //   .then((resp) => {
    window.localStorage.setItem('villager', JSON.stringify({ valid: true, token: "06787add96eb3264080015997720cb0877b40f90", userId: 1 }))
    // })
  })
}

export async function validateRoundPairings(tournamentPlayers: (PlayerRelated | Guest)[], pairings: Match[], currentRound: number) {
  const confirmedPairings = [];
  const accountedForPlayers = [];
  const roundPairings = pairings.filter(p => p.round === currentRound);

  for (const pairing of roundPairings) {
    const playerW = findByIdentifier(pairing.player1, tournamentPlayers);
    const playerB = pairing.player2 ? findByIdentifier(pairing.player2, tournamentPlayers) : null;
    if (playerW) {
      accountedForPlayers.push(playerW);
    }
    if (playerB) {
      accountedForPlayers.push(playerB);
    }
    if (playerW && playerB) {
      if (pairing.player1 === findIdentifier(playerW) && pairing.player2 === findIdentifier(playerB)) {
        confirmedPairings.push(pairing);
      }
    } else if(playerW && playerB === null) {
      if (pairing.player1 === findIdentifier(playerW) && pairing.player2 === null) {
        confirmedPairings.push(pairing);
      }
    }
  }

  expect(confirmedPairings).to.deep.equal(roundPairings);
  const sortedAccountedPlayers = accountedForPlayers.sort((a, b) => {
    if (a.full_name < b.full_name) {
      return -1;
    }
    if (a.full_name > b.full_name) {
      return +1;
    }
    return 0;
  })
  const sortedTournamentPlayers = tournamentPlayers.sort((a, b) => {
    if (a.full_name < b.full_name) {
      return -1;
    }
    if (a.full_name > b.full_name) {
      return +1;
    }
    return 0;
  })

  expect(sortedAccountedPlayers).to.deep.equal(sortedTournamentPlayers);
}