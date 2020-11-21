// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../support/index.d.ts" />

describe('Editor basic initialization', () => {
  describe('Zero-config initialization', () => {
    /**
     * In this test suite we use zero (omitted) configuration
     */
    const editorConfig = {};

    beforeEach(() => {
      if (this.editorInstance) {
        this.editorInstance.destroy();
      } else {
        cy.createEditor(editorConfig).as('editorInstance');
      }
    });

    it('should create a visible UI', () => {
      cy.window().then((window) => {
        /**
         * Assert if created instance is visible or not.
         */
        cy.get('[data-cy=editorjs]')
          .get('div.codex-editor')
          .should('be.visible');
      });
    });
  });
});