import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx}',
    supportFile: 'cypress/support/component.js',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
});
