import Header from '../../../example/tools/header';
import Delimiter from '../../../example/tools/delimiter';
import * as _ from '../../../src/components/utils';

describe('Delete key usage', () => {
  beforeEach(() => {
    if (this && this.editorInstance) {
      this.editorInstance.destroy();
    } else {
      cy.createEditor({
        tools: {
          header: Header,
          delimiter: Delimiter,
        },
      }).as('editorInstance');
    }
  });

  context('Without selection', () => {
    it('should delete next character', () => {
      cy
        .get('@editorInstance')
        .render({
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: 'Paragraph',
              },
            },
          ],
        });

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .click()
        .type('{movetostart}{del}')
        .should('contain', 'aragraph')
        .should('not.contain', 'Paragraph');
    });

    it('should merge two similar blocks on delete', () => {
      cy
        .get('@editorInstance')
        .render({
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Header 1',
              },
            },
            {
              type: 'header',
              data: {
                text: 'Header 2',
              },
            },
          ],
        });

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .first()
        .click()
        .type('{movetoend}{del}');

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .should('contain', 'Header 1Header 2')
        .then(block => {
          return cy.range()
            .then(range => {
              expect(block[0].contains(range.startContainer)).to.be.true;

              return block;
            });
        })
        .next()
        .should('not.exist');
    });

    it('shouldn\'t merge two different blocks on delete', () => {
      cy
        .get('@editorInstance')
        .render({
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Header',
              },
            },
            {
              type: 'paragraph',
              data: {
                text: 'Paragraph',
              },
            },
          ],
        });

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .first()
        .click()
        .type('{movetoend}{del}');

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .should('contain', 'Header')
        .next()
        .should('contain', 'Paragraph');
    });

    it('should delete current block on delete if it\'s empty', () => {
      cy
        .get('@editorInstance')
        .render({
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: '',
              },
            },
            {
              type: 'paragraph',
              data: {
                text: 'Paragraph 2',
              },
            },
          ],
        });

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .first()
        .click()
        .type('{del}');

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .should('contain', 'Paragraph 2')
        .then(block => {
          return cy.range()
            .then(range => {
              expect(block[0].contains(range.startContainer)).to.be.true;

              return block;
            });
        })
        .next()
        .should('not.exist');
    });

    it('should delete next block on delete if it\'s empty', () => {
      cy
        .get('@editorInstance')
        .render({
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: 'Paragraph 1',
              },
            },
            {
              type: 'paragraph',
              data: {
                text: '',
              },
            },
          ],
        });

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .first()
        .click()
        .type('{movetoend}{del}');

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .should('contain', 'Paragraph 1')
        .then(block => {
          return cy.range()
            .then(range => {
              expect(block[0].contains(range.startContainer)).to.be.true;

              return block;
            });
        })
        .next()
        .should('not.exist');
    });

    it('should delete next block on delete if it doesn\'t contain any editable inputs', () => {
      cy
        .get('@editorInstance')
        .render({
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: 'Paragraph',
              },
            },
            {
              type: 'delimiter',
              data: {},
            },
          ],
        });

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .first()
        .click()
        .type('{movetoend}{del}');

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .should('contain', 'Paragraph')
        .then(block => {
          return cy.range()
            .then(range => {
              expect(block[0].contains(range.startContainer)).to.be.true;

              return block;
            });
        })
        .next()
        .should('not.exist');
    });
  });

  context('With in-block selection', () => {
    it('should delete selected text', () => {
      cy.get('@editorInstance')
        .render({
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: 'Paragraph',
              },
            },
          ],
        });

      cy.get('[data-cy=editorjs]')
        .get('div.ce-block')
        .click()
        .type('{selectall}{del}');

      cy.get('[data-cy=editorjs]')
        .get('div.ce-paragraph')
        .then(el => {
          return cy.range()
            .then(range => {
              expect(el[0]).to.eq(range.startContainer);

              return el;
            });
        })
        .should('be.empty');
    });
  });

  context('With block selection', () => {
    it('should delete selected blocks', () => {
      cy
        .get('@editorInstance')
        .render({
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Header'
              },
            },
            {
              type: 'paragraph',
              data: {
                text: 'Paragraph',
              },
            },
          ],
        });

      cy.get('[data-cy=editorjs')
        .get('div.ce-block')
        .first()
        .type('{movetoend}')
        .trigger('keydown', {
          shiftKey: true,
          keyCode: _.keyCodes.DOWN,
        })
        .trigger('keydown', {
          keyCode: _.keyCodes.DELETE,
        });

      cy.get('[data-cy=editorjs')
        .get('div.ce-paragraph')
        .should('be.empty')
        .next()
        .should('not.exist');
    });
  });
});