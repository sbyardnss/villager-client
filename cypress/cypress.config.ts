import { defineConfig } from "cypress";
//to run cypress without opening: npx cypress run --config-file cypress/cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: 'cypress/support/index.ts',
    specPattern: 'cypress/integrations/**/*.spec.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    video: true,
    videoCompression: true, // Enables video compression
    videosFolder: 'cypress/videos', // Specifies the folder where videos are stored
    env: {
      REACT_APP_API: "http://localhost:8000"
    },
  },
});