import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    supportFile: false,
    specPattern: 'cypress/integrations/**/*.spec.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});