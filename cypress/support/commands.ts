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